/* 나나메이트 인터랙티브 3D 학습게임 엔진 (data-driven)
 * 사용법: 챕터에 <div id="nm-game-host"></div> + window.NANAMATE_GAME 정의 후 이 스크립트를 defer 로드.
 *   window.NANAMATE_GAME = { type:"sequence", color:"#818cf8",
 *     prompt:"...", steps:["A","B","C", ...] }   // steps = 올바른 순서(정답)
 * 동작: 셔플된 용어 칩을 "올바른 순서대로" 클릭 → 3D 경로 슬롯이 차례로 채워지고 펄스가 이동.
 *       WebGL 불가/THREE 부재 시에도 칩만으로 완전히 플레이 가능(graceful degrade, a11y 친화).
 * quizgame3d.js와 동일하게 공용 엔진 + 챕터별 JSON 구조 → 워크플로우로 전 챕터 확대 가능.
 */
(function () {
  function init() {
    var G = window.NANAMATE_GAME;
    var host = document.getElementById('nm-game-host');
    if (!G || !host || !Array.isArray(G.steps) || G.steps.length < 2) return;

    var steps = G.steps.slice();              // 정답 순서
    var N = steps.length;
    var color = G.color || '#6366f1';
    var colorHex = parseInt(color.replace('#', ''), 16) || 0x6366f1;

    injectStyle();
    host.innerHTML = '';
    var wrap = el('div', 'nmg-wrap');
    var prompt = el('p', 'nmg-prompt'); prompt.textContent = G.prompt || '올바른 순서대로 용어를 클릭하세요';
    var canvasBox = el('div', 'nmg-canvas');
    var status = el('div', 'nmg-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    var chipBox = el('div', 'nmg-chips');
    var resetBtn = el('button', 'nmg-reset'); resetBtn.type = 'button'; resetBtn.textContent = '↺ 다시하기';
    wrap.appendChild(prompt); wrap.appendChild(canvasBox); wrap.appendChild(status); wrap.appendChild(chipBox); wrap.appendChild(resetBtn);
    host.appendChild(wrap);

    var next = 0, slots = [], labels = [], pulse = null, scene = null, renderer = null, camera = null, raf = null;

    /* ---------- 3D 시각화 (선택적·우아한 실패) ---------- */
    function build3D() {
      if (typeof THREE === 'undefined') return false;
      try {
        var w = canvasBox.clientWidth || 600, h = 190;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        camera.position.set(0, 0, 9); camera.lookAt(0, 0, 0);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasBox.appendChild(renderer.domElement);
        var span = Math.min(2.2, 8 / N), x0 = -(N - 1) * span / 2;
        for (var i = 0; i < N; i++) {
          var node = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), new THREE.MeshBasicMaterial({ color: 0xd1d5db }));
          node.position.set(x0 + i * span, 0, 0); scene.add(node);
          slots.push({ mesh: node, x: x0 + i * span });
          if (i < N - 1) {
            var link = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, span, 6), new THREE.MeshBasicMaterial({ color: 0xe5e7eb }));
            link.rotation.z = Math.PI / 2; link.position.set(x0 + i * span + span / 2, 0, 0); scene.add(link);
          }
        }
        pulse = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
        pulse.visible = false; scene.add(pulse);
        var T = 0;
        (function loop() { raf = requestAnimationFrame(loop); T += 0.016; if (pulse && pulse.visible) pulse.material.color.setHSL(0.13, 1, 0.5 + 0.2 * Math.sin(T * 6)); renderer.render(scene, camera); })();
        window.addEventListener('resize', onResize);
        return true;
      } catch (e) { scene = null; return false; }
    }
    function onResize() {
      if (!renderer || !camera) return;
      var w = canvasBox.clientWidth || 600;
      camera.aspect = w / 190; camera.updateProjectionMatrix(); renderer.setSize(w, 190);
    }
    function labelSprite(txt) {
      var fs = 22, cv = document.createElement('canvas'), x = cv.getContext('2d');
      var font = '700 ' + fs + 'px "Noto Sans KR",sans-serif'; x.font = font;
      cv.width = Math.ceil(x.measureText(txt).width) + 16; cv.height = fs + 10;
      x = cv.getContext('2d'); x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = color; x.fillText(txt, cv.width / 2, cv.height / 2);
      var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false }));
      sp.scale.set(cv.width * 0.0055, cv.height * 0.0055, 1); return sp;
    }
    function fillSlot(i, term) {
      if (!scene) return;
      slots[i].mesh.material.color.setHex(colorHex);
      var sp = labelSprite(term); sp.position.set(slots[i].x, 0.85, 0); scene.add(sp); labels.push(sp);
      if (pulse) { pulse.visible = true; pulse.position.set(slots[i].x, 0, 0); }
    }
    function clear3D() {
      if (!scene) return;
      slots.forEach(function (s) { s.mesh.material.color.setHex(0xd1d5db); });
      labels.forEach(function (sp) { scene.remove(sp); }); labels = [];
      if (pulse) pulse.visible = false;
    }

    /* ---------- 칩(기본 컨트롤·a11y) ---------- */
    function renderChips() {
      chipBox.innerHTML = '';
      shuffle(steps).forEach(function (term) {
        var b = el('button', 'nmg-chip'); b.type = 'button'; b.textContent = term;
        b.addEventListener('click', function () { onPick(term, b); });
        chipBox.appendChild(b);
      });
    }
    function onPick(term, btn) {
      if (btn.disabled) return;
      if (term === steps[next]) {
        btn.disabled = true; btn.classList.add('ok'); btn.textContent = (next + 1) + '. ' + term;
        fillSlot(next, term); next++;
        if (next === N) { status.textContent = '🎉 완성! 순서를 정확히 맞췄어요.'; status.className = 'nmg-status done'; }
        else { status.textContent = '좋아요! 다음 단계는? (' + next + '/' + N + ')'; status.className = 'nmg-status'; }
      } else {
        btn.classList.add('bad'); status.textContent = '❌ 순서가 아니에요 — 지금까지 ' + next + '/' + N + ' 맞음'; status.className = 'nmg-status bad';
        setTimeout(function () { btn.classList.remove('bad'); }, 420);
      }
    }
    function reset() {
      next = 0; status.textContent = '아래 용어를 올바른 순서대로 누르세요 (총 ' + N + '단계)'; status.className = 'nmg-status';
      clear3D(); renderChips();
    }
    resetBtn.addEventListener('click', reset);

    build3D();
    reset();
  }

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function injectStyle() {
    if (document.getElementById('nmg-style')) return;
    var st = document.createElement('style'); st.id = 'nmg-style';
    st.textContent = [
      '.nmg-wrap{border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:16px;background:var(--card,#fff);margin:8px 0}',
      '.nmg-prompt{margin:0 0 10px;font-weight:700;color:var(--text,#1f2430)}',
      '.nmg-canvas{width:100%;height:190px;border-radius:10px;overflow:hidden}',
      '.nmg-status{min-height:22px;margin:10px 0;font-size:14px;font-weight:600;color:var(--muted,#6b7280)}',
      '.nmg-status.done{color:#15803d}.nmg-status.bad{color:#dc2626}',
      '.nmg-chips{display:flex;flex-wrap:wrap;gap:8px}',
      '.nmg-chip{padding:9px 14px;border:1px solid var(--border,#d1d5db);border-radius:999px;background:var(--card,#fff);color:var(--text,#1f2430);font-weight:700;font-size:14px;cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease}',
      '.nmg-chip:hover{border-color:#818cf8}',
      '.nmg-chip:focus-visible{outline:2px solid #6366f1;outline-offset:2px}',
      '.nmg-chip.ok{background:#dcfce7;border-color:#86efac;color:#15803d;cursor:default}',
      '.nmg-chip.bad{background:#fee2e2;border-color:#fca5a5;animation:nmg-shake .4s}',
      '.nmg-reset{margin-top:12px;padding:8px 14px;border:1px solid var(--border,#d1d5db);border-radius:9px;background:transparent;color:var(--muted,#6b7280);font-weight:700;font-size:13px;cursor:pointer}',
      '@keyframes nmg-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
      '@media (prefers-reduced-motion:reduce){.nmg-chip,.nmg-chip.bad{animation:none;transition:none}}'
    ].join('');
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
