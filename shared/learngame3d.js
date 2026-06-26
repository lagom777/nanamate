/* 나나메이트 인터랙티브 3D 학습게임 엔진 (data-driven, 다중 게임타입)
 * 사용법: 챕터에 <div id="nm-game-host"></div> + window.NANAMATE_GAME 정의 후 defer 로드.
 *
 *  ① 순서맞추기 (순차적 주제: 신호전달·반응단계·발달순서 등)
 *     { type:"sequence", color:"#818cf8", prompt:"...", steps:["A","B","C", ...] }  // steps=정답순서
 *  ② 짝맞추기 (비순차 주제 범용: 용어↔설명·부위↔기능 등)
 *     { type:"matching", color:"#818cf8", prompt:"...", pairs:[{term:"...", def:"..."}, ...] }
 *
 * 공통: 정답 클릭 시 초록·3D 시각화 갱신, 오답 시 흔들림+힌트, 완성 시 🎉.
 *       THREE 부재/WebGL 실패에도 DOM만으로 완전 플레이(graceful·a11y). quizgame3d.js와 동일하게
 *       공용엔진+챕터별 JSON 구조 → 워크플로우로 전 챕터 확대 가능.
 */
(function () {
  function init() {
    var G = window.NANAMATE_GAME;
    var host = document.getElementById('nm-game-host');
    if (!G || !host) return;
    var type = G.type || 'sequence';
    if (type === 'matching') {
      if (!Array.isArray(G.pairs) || G.pairs.length < 2) return;
    } else if (!Array.isArray(G.steps) || G.steps.length < 2) return;

    injectStyle();
    var color = G.color || '#6366f1';
    var colorHex = parseInt(color.replace('#', ''), 16) || 0x6366f1;

    host.innerHTML = '';
    var wrap = el('div', 'nmg-wrap');
    var prompt = el('p', 'nmg-prompt'); prompt.textContent = G.prompt || (type === 'matching' ? '용어와 설명을 짝지으세요' : '올바른 순서대로 용어를 클릭하세요');
    var canvasBox = el('div', 'nmg-canvas');
    var status = el('div', 'nmg-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    var body = el('div', 'nmg-body');
    var resetBtn = el('button', 'nmg-reset'); resetBtn.type = 'button'; resetBtn.textContent = '↺ 다시하기';
    wrap.appendChild(prompt); wrap.appendChild(canvasBox); wrap.appendChild(status); wrap.appendChild(body); wrap.appendChild(resetBtn);
    host.appendChild(wrap);

    var ctx = { G: G, color: color, colorHex: colorHex, canvasBox: canvasBox, status: status, body: body, resetBtn: resetBtn };
    if (type === 'matching') setupMatching(ctx); else setupSequence(ctx);
  }

  /* ============ ① 순서맞추기 ============ */
  function setupSequence(ctx) {
    var steps = ctx.G.steps.slice(), N = steps.length;
    var v = make3D(ctx, N); // {scene,fillSlot,clear,pulseTo}
    var next = 0;

    function render() {
      ctx.body.innerHTML = '';
      shuffle(steps).forEach(function (term) {
        var b = el('button', 'nmg-chip'); b.type = 'button'; b.textContent = term;
        b.addEventListener('click', function () { pick(term, b); });
        ctx.body.appendChild(b);
      });
    }
    function pick(term, btn) {
      if (btn.disabled) return;
      if (term === steps[next]) {
        btn.disabled = true; btn.classList.add('ok'); btn.textContent = (next + 1) + '. ' + term;
        v.fillSlot(next, term); next++;
        if (next === N) { ctx.status.textContent = '🎉 완성! 순서를 정확히 맞췄어요.'; ctx.status.className = 'nmg-status done'; }
        else { ctx.status.textContent = '좋아요! 다음 단계는? (' + next + '/' + N + ')'; ctx.status.className = 'nmg-status'; }
      } else {
        btn.classList.add('bad'); ctx.status.textContent = '❌ 순서가 아니에요 — 지금까지 ' + next + '/' + N + ' 맞음'; ctx.status.className = 'nmg-status bad';
        setTimeout(function () { btn.classList.remove('bad'); }, 420);
      }
    }
    function reset() { next = 0; v.clear(); ctx.body.className = 'nmg-body'; ctx.status.textContent = '아래 용어를 올바른 순서대로 누르세요 (총 ' + N + '단계)'; ctx.status.className = 'nmg-status'; render(); }
    ctx.resetBtn.addEventListener('click', reset);
    reset();
  }

  /* ============ ② 짝맞추기 ============ */
  function setupMatching(ctx) {
    var pairs = ctx.G.pairs.slice(), N = pairs.length;
    var v = makeMatch3D(ctx, pairs);
    var sel = null, selBtn = null, done = 0;
    ctx.body.classList.add('nmg-match');

    function render() {
      ctx.body.innerHTML = '';
      var left = el('div', 'nmg-col'), right = el('div', 'nmg-col');
      pairs.forEach(function (p, i) {
        var t = el('button', 'nmg-chip'); t.type = 'button'; t.textContent = p.term; t.dataset.k = String(i);
        t.addEventListener('click', function () { pickTerm(i, t); });
        left.appendChild(t);
      });
      shuffle(pairs.map(function (p, i) { return { def: p.def, k: i }; })).forEach(function (d) {
        var b = el('button', 'nmg-chip nmg-def'); b.type = 'button'; b.textContent = d.def; b.dataset.k = String(d.k);
        b.addEventListener('click', function () { pickDef(d.k, b); });
        right.appendChild(b);
      });
      ctx.body.appendChild(left); ctx.body.appendChild(right);
    }
    function pickTerm(k, btn) {
      if (btn.disabled) return;
      if (selBtn) selBtn.classList.remove('sel');
      sel = k; selBtn = btn; btn.classList.add('sel');
      ctx.status.textContent = '"' + pairs[k].term + '"에 맞는 설명을 고르세요'; ctx.status.className = 'nmg-status';
    }
    function pickDef(k, btn) {
      if (btn.disabled) return;
      if (sel === null) { ctx.status.textContent = '먼저 왼쪽에서 용어를 고르세요'; ctx.status.className = 'nmg-status'; return; }
      if (k === sel) {
        btn.disabled = true; btn.classList.add('ok');
        if (selBtn) { selBtn.disabled = true; selBtn.classList.remove('sel'); selBtn.classList.add('ok'); }
        v.link(k); done++;
        if (done === N) { ctx.status.textContent = '🎉 완성! 모든 짝을 맞췄어요.'; ctx.status.className = 'nmg-status done'; }
        else { ctx.status.textContent = '좋아요! (' + done + '/' + N + ') 다음 용어를 고르세요'; ctx.status.className = 'nmg-status'; }
        sel = null; selBtn = null;
      } else {
        btn.classList.add('bad'); if (selBtn) selBtn.classList.add('bad');
        ctx.status.textContent = '❌ 짝이 아니에요 — 다시 시도'; ctx.status.className = 'nmg-status bad';
        var sb = selBtn; setTimeout(function () { btn.classList.remove('bad'); if (sb) { sb.classList.remove('bad', 'sel'); } }, 460);
        sel = null; selBtn = null;
      }
    }
    function reset() { sel = null; selBtn = null; done = 0; v.clear(); ctx.status.textContent = '왼쪽 용어를 누른 뒤 오른쪽에서 맞는 설명을 고르세요 (총 ' + N + '쌍)'; ctx.status.className = 'nmg-status'; render(); }
    ctx.resetBtn.addEventListener('click', reset);
    reset();
  }

  /* ---------- 3D: 순서(경로 슬롯) ---------- */
  function make3D(ctx, N) {
    var base = baseScene(ctx); var slots = [], labels = [], pulse = null;
    if (base) {
      var span = Math.min(2.2, 8 / N), x0 = -(N - 1) * span / 2;
      for (var i = 0; i < N; i++) {
        var node = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), new THREE.MeshBasicMaterial({ color: 0xd1d5db }));
        node.position.set(x0 + i * span, 0, 0); base.scene.add(node); slots.push({ mesh: node, x: x0 + i * span });
        if (i < N - 1) { var lk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, span, 6), new THREE.MeshBasicMaterial({ color: 0xe5e7eb })); lk.rotation.z = Math.PI / 2; lk.position.set(x0 + i * span + span / 2, 0, 0); base.scene.add(lk); }
      }
      pulse = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfde047 })); pulse.visible = false; base.scene.add(pulse);
      base.animate(function () { if (pulse.visible) pulse.material.color.setHSL(0.13, 1, 0.5 + 0.2 * Math.sin(base.T() * 6)); });
    }
    return {
      fillSlot: function (i, term) { if (!base) return; slots[i].mesh.material.color.setHex(ctx.colorHex); var sp = labelSprite(term, ctx.color); sp.position.set(slots[i].x, 0.85, 0); base.scene.add(sp); labels.push(sp); pulse.visible = true; pulse.position.set(slots[i].x, 0, 0); },
      clear: function () { if (!base) return; slots.forEach(function (s) { s.mesh.material.color.setHex(0xd1d5db); }); labels.forEach(function (sp) { base.scene.remove(sp); }); labels = []; pulse.visible = false; }
    };
  }

  /* ---------- 3D: 짝(좌우 노드 + 연결선) ---------- */
  function makeMatch3D(ctx, pairs) {
    var base = baseScene(ctx); var N = pairs.length, leftN = [], rightN = [], lines = [];
    if (base) {
      var gap = Math.min(1.4, 5 / N), y0 = (N - 1) * gap / 2;
      for (var i = 0; i < N; i++) {
        var l = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), new THREE.MeshBasicMaterial({ color: 0xc7d2fe })); l.position.set(-3, y0 - i * gap, 0); base.scene.add(l); leftN.push(l);
        var r = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), new THREE.MeshBasicMaterial({ color: 0xe5e7eb })); r.position.set(3, y0 - i * gap, 0); base.scene.add(r); rightN.push(r);
      }
      base.animate(function () { for (var j = 0; j < lines.length; j++) lines[j].material.opacity = 0.55 + 0.35 * Math.sin(base.T() * 3 + j); });
    }
    return {
      link: function (k) {
        if (!base) return; leftN[k].material.color.setHex(ctx.colorHex); rightN[k].material.color.setHex(ctx.colorHex);
        var geo = new THREE.BufferGeometry().setFromPoints([leftN[k].position.clone(), rightN[k].position.clone()]);
        var ln = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: ctx.colorHex, transparent: true, opacity: 0.7 })); base.scene.add(ln); lines.push(ln);
      },
      clear: function () { if (!base) return; leftN.forEach(function (m) { m.material.color.setHex(0xc7d2fe); }); rightN.forEach(function (m) { m.material.color.setHex(0xe5e7eb); }); lines.forEach(function (ln) { base.scene.remove(ln); }); lines = []; }
    };
  }

  /* ---------- 공용 3D 베이스(우아한 실패) ---------- */
  function baseScene(ctx) {
    if (typeof THREE === 'undefined') return null;
    try {
      var w = ctx.canvasBox.clientWidth || 600, h = 190;
      var scene = new THREE.Scene();
      var cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); cam.position.set(0, 0, 9); cam.lookAt(0, 0, 0);
      var rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true }); rndr.setSize(w, h); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2)); ctx.canvasBox.appendChild(rndr.domElement);
      var T = 0, cbs = [];
      (function loop() { requestAnimationFrame(loop); T += 0.016; for (var i = 0; i < cbs.length; i++) cbs[i](); rndr.render(scene, cam); })();
      window.addEventListener('resize', function () { var ww = ctx.canvasBox.clientWidth || 600; cam.aspect = ww / h; cam.updateProjectionMatrix(); rndr.setSize(ww, h); });
      return { scene: scene, animate: function (cb) { cbs.push(cb); }, T: function () { return T; } };
    } catch (e) { return null; }
  }
  function labelSprite(txt, color) {
    var fs = 22, cv = document.createElement('canvas'), x = cv.getContext('2d');
    var font = '700 ' + fs + 'px "Noto Sans KR",sans-serif'; x.font = font;
    cv.width = Math.ceil(x.measureText(txt).width) + 16; cv.height = fs + 10;
    x = cv.getContext('2d'); x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color; x.fillText(txt, cv.width / 2, cv.height / 2);
    var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); sp.scale.set(cv.width * 0.0055, cv.height * 0.0055, 1); return sp;
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
      '.nmg-body{display:flex;flex-wrap:wrap;gap:8px}',
      '.nmg-body.nmg-match{gap:16px}',
      '.nmg-col{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}',
      '.nmg-chip{padding:9px 14px;border:1px solid var(--border,#d1d5db);border-radius:999px;background:var(--card,#fff);color:var(--text,#1f2430);font-weight:700;font-size:14px;cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease;text-align:left}',
      '.nmg-def{border-radius:12px;font-weight:600}',
      '.nmg-chip:hover{border-color:#818cf8}',
      '.nmg-chip:focus-visible{outline:2px solid #6366f1;outline-offset:2px}',
      '.nmg-chip.sel{border-color:#6366f1;background:#eef2ff}',
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
