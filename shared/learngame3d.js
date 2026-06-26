/* 나나메이트 인터랙티브 3D 학습게임 엔진 (data-driven, 4가지 게임타입)
 * 사용법: 챕터에 <div id="nm-game-host"></div> + window.NANAMATE_GAME 정의 후 defer 로드.
 *
 *  ① 순서맞추기 (순차 주제: 신호전달·반응단계·발달순서 등)
 *     { type:"sequence", color:"#818cf8", prompt:"...", steps:["A","B","C", ...] }   // steps=정답순서(4~6)
 *  ② 짝맞추기 (범용: 용어↔설명·부위↔기능)
 *     { type:"matching", color:"#818cf8", prompt:"...", pairs:[{term:"...", def:"..."}, ...] }   // 4~5쌍
 *  ③ 분류하기 (유형/범주가 있는 주제)
 *     { type:"grouping", color:"#818cf8", prompt:"...", groups:[{name:"...", items:["..",".."]}, ...] }  // 2~3그룹
 *  ④ 다른 하나 찾기 (개념 변별)
 *     { type:"oddone", color:"#818cf8", prompt:"...", rounds:[{items:["a","b","c","d"], odd:2, why:"..."}, ...] }
 *
 * 공통: 정답 시 초록·3D 갱신, 오답 시 흔들림+힌트, 완성 시 🎉. THREE 부재/WebGL 실패에도
 *       DOM만으로 완전 플레이(graceful·a11y). quizgame3d.js와 동일 구조(공용엔진+챕터별 JSON).
 */
(function () {
  function init() {
    var G = window.NANAMATE_GAME, host = document.getElementById('nm-game-host');
    if (!G || !host) return;
    var type = G.type || 'sequence';
    var okData =
      type === 'matching' ? (Array.isArray(G.pairs) && G.pairs.length >= 2) :
      type === 'grouping' ? (Array.isArray(G.groups) && G.groups.length >= 2) :
      type === 'oddone' ? (Array.isArray(G.rounds) && G.rounds.length >= 1) :
      (Array.isArray(G.steps) && G.steps.length >= 2);
    if (!okData) return;

    injectStyle();
    var color = G.color || '#6366f1';
    var ctx = { G: G, color: color, colorHex: parseInt(color.replace('#', ''), 16) || 0x6366f1 };

    host.innerHTML = '';
    var wrap = el('div', 'nmg-wrap');
    ctx.prompt = el('p', 'nmg-prompt'); ctx.prompt.textContent = G.prompt || defaultPrompt(type);
    ctx.canvasBox = el('div', 'nmg-canvas');
    ctx.status = el('div', 'nmg-status'); ctx.status.setAttribute('role', 'status'); ctx.status.setAttribute('aria-live', 'polite');
    ctx.body = el('div', 'nmg-body');
    ctx.resetBtn = el('button', 'nmg-reset'); ctx.resetBtn.type = 'button'; ctx.resetBtn.textContent = '↺ 다시하기';
    [ctx.prompt, ctx.canvasBox, ctx.status, ctx.body, ctx.resetBtn].forEach(function (n) { wrap.appendChild(n); });
    host.appendChild(wrap);

    if (type === 'matching') setupMatching(ctx);
    else if (type === 'grouping') setupGrouping(ctx);
    else if (type === 'oddone') setupOddone(ctx);
    else setupSequence(ctx);
  }
  function defaultPrompt(t) {
    return t === 'matching' ? '용어와 설명을 짝지으세요' : t === 'grouping' ? '항목을 알맞은 그룹으로 분류하세요' : t === 'oddone' ? '어울리지 않는 하나를 고르세요' : '올바른 순서대로 클릭하세요';
  }

  /* ============ ① 순서맞추기 ============ */
  function setupSequence(ctx) {
    var steps = ctx.G.steps.slice(), N = steps.length, v = pathViz(ctx, N), next = 0;
    function render() { ctx.body.className = 'nmg-body'; ctx.body.innerHTML = ''; shuffle(steps).forEach(function (term) { var b = chip(term); b.onclick = function () { pick(term, b); }; ctx.body.appendChild(b); }); }
    function pick(term, b) {
      if (b.disabled) return;
      if (term === steps[next]) { b.disabled = true; b.classList.add('ok'); b.textContent = (next + 1) + '. ' + term; v.fill(next, term); next++; if (next === N) setStatus(ctx, '🎉 완성! 순서를 정확히 맞췄어요.', 'done'); else setStatus(ctx, '좋아요! 다음 단계는? (' + next + '/' + N + ')'); }
      else { flash(ctx, b, '❌ 순서가 아니에요 — 지금까지 ' + next + '/' + N + ' 맞음'); }
    }
    function reset() { next = 0; v.clear(); setStatus(ctx, '아래 용어를 올바른 순서대로 누르세요 (총 ' + N + '단계)'); render(); }
    ctx.resetBtn.onclick = reset; reset();
  }

  /* ============ ② 짝맞추기 ============ */
  function setupMatching(ctx) {
    var pairs = ctx.G.pairs.slice(), N = pairs.length, v = matchViz(ctx, pairs), sel = null, selBtn = null, done = 0;
    function render() {
      ctx.body.className = 'nmg-body nmg-match'; ctx.body.innerHTML = '';
      var L = el('div', 'nmg-col'), R = el('div', 'nmg-col');
      pairs.forEach(function (p, i) { var t = chip(p.term); t.onclick = function () { pickT(i, t); }; L.appendChild(t); });
      shuffle(pairs.map(function (p, i) { return { def: p.def, k: i }; })).forEach(function (d) { var b = chip(d.def); b.classList.add('nmg-def'); b.onclick = function () { pickD(d.k, b); }; R.appendChild(b); });
      ctx.body.appendChild(L); ctx.body.appendChild(R);
    }
    function pickT(k, b) { if (b.disabled) return; if (selBtn) selBtn.classList.remove('sel'); sel = k; selBtn = b; b.classList.add('sel'); setStatus(ctx, '"' + pairs[k].term + '"에 맞는 설명을 고르세요'); }
    function pickD(k, b) {
      if (b.disabled) return; if (sel === null) { setStatus(ctx, '먼저 왼쪽에서 용어를 고르세요'); return; }
      if (k === sel) { b.disabled = true; b.classList.add('ok'); if (selBtn) { selBtn.disabled = true; selBtn.classList.remove('sel'); selBtn.classList.add('ok'); } v.link(k); done++; if (done === N) setStatus(ctx, '🎉 완성! 모든 짝을 맞췄어요.', 'done'); else setStatus(ctx, '좋아요! (' + done + '/' + N + ') 다음 용어를 고르세요'); sel = null; selBtn = null; }
      else { var sb = selBtn; b.classList.add('bad'); if (sb) sb.classList.add('bad'); setStatus(ctx, '❌ 짝이 아니에요 — 다시', 'bad'); setTimeout(function () { b.classList.remove('bad'); if (sb) sb.classList.remove('bad', 'sel'); }, 460); sel = null; selBtn = null; }
    }
    function reset() { sel = null; selBtn = null; done = 0; v.clear(); setStatus(ctx, '왼쪽 용어를 누른 뒤 오른쪽에서 맞는 설명을 고르세요 (총 ' + N + '쌍)'); render(); }
    ctx.resetBtn.onclick = reset; reset();
  }

  /* ============ ③ 분류하기 ============ */
  function setupGrouping(ctx) {
    var groups = ctx.G.groups.slice(), total = 0, placed = 0, sel = null, selBtn = null;
    var itemOf = {}; groups.forEach(function (g, gi) { (g.items || []).forEach(function (it) { itemOf[it] = gi; total++; }); });
    var v = bucketViz(ctx, groups);
    function render() {
      ctx.body.className = 'nmg-body nmg-group'; ctx.body.innerHTML = '';
      var pool = el('div', 'nmg-pool');
      var all = []; groups.forEach(function (g) { (g.items || []).forEach(function (it) { all.push(it); }); });
      shuffle(all).forEach(function (it) { var b = chip(it); b.onclick = function () { pickItem(it, b); }; pool.appendChild(b); });
      ctx.body.appendChild(pool);
      var row = el('div', 'nmg-buckets');
      groups.forEach(function (g, gi) { var bk = el('button', 'nmg-bucket'); bk.type = 'button'; bk.innerHTML = '<span class="nmg-bk-name"></span>'; bk.querySelector('.nmg-bk-name').textContent = g.name; bk.onclick = function () { dropTo(gi, bk); }; row.appendChild(bk); });
      ctx.body.appendChild(row);
    }
    function pickItem(it, b) { if (b.disabled) return; if (selBtn) selBtn.classList.remove('sel'); sel = it; selBtn = b; b.classList.add('sel'); setStatus(ctx, '"' + it + '" → 어느 그룹? 아래 버킷을 누르세요'); }
    function dropTo(gi, bk) {
      if (sel === null) { setStatus(ctx, '먼저 위에서 항목을 고르세요'); return; }
      if (itemOf[sel] === gi) { selBtn.disabled = true; selBtn.classList.remove('sel'); selBtn.classList.add('ok'); var tag = el('span', 'nmg-placed'); tag.textContent = sel; bk.appendChild(tag); v.drop(gi); placed++; if (placed === total) setStatus(ctx, '🎉 완성! 모두 올바르게 분류했어요.', 'done'); else setStatus(ctx, '좋아요! (' + placed + '/' + total + ')'); sel = null; selBtn = null; }
      else { var sb = selBtn; bk.classList.add('bad'); if (sb) sb.classList.add('bad'); setStatus(ctx, '❌ 그 그룹이 아니에요 — 다시', 'bad'); setTimeout(function () { bk.classList.remove('bad'); if (sb) sb.classList.remove('bad', 'sel'); }, 460); sel = null; selBtn = null; }
    }
    function reset() { placed = 0; sel = null; selBtn = null; v.clear(); setStatus(ctx, '위 항목을 누르고 알맞은 그룹 버킷을 누르세요 (총 ' + total + '개)'); render(); }
    ctx.resetBtn.onclick = reset; reset();
  }

  /* ============ ④ 다른 하나 찾기 ============ */
  function setupOddone(ctx) {
    var rounds = ctx.G.rounds.slice(), R = rounds.length, ri = 0, v = ringViz(ctx);
    function render() {
      ctx.body.className = 'nmg-body'; ctx.body.innerHTML = '';
      var r = rounds[ri]; v.show(r.items.length);
      r.items.forEach(function (it, i) { var b = chip(it); b.onclick = function () { pick(i, b); }; ctx.body.appendChild(b); });
    }
    function pick(i, b) {
      if (b.disabled) return; var r = rounds[ri];
      if (i === r.odd) { b.classList.add('ok'); v.mark(i); var msg = '✅ 정답!' + (r.why ? ' ' + r.why : ''); ri++; if (ri === R) setStatus(ctx, '🎉 완성! ' + msg, 'done'); else { setStatus(ctx, msg + ' — 다음 문제로', 'done'); setTimeout(render, 900); } [].forEach.call(ctx.body.children, function (c) { c.disabled = true; }); }
      else { flash(ctx, b, '❌ 이건 어울려요 — 다른 걸 찾아보세요'); }
    }
    function reset() { ri = 0; setStatus(ctx, '보기 중 어울리지 않는 하나를 고르세요 (' + R + '문제)'); render(); }
    ctx.resetBtn.onclick = reset; reset();
  }

  /* ---------- 공용 DOM ---------- */
  function chip(txt) { var b = el('button', 'nmg-chip'); b.type = 'button'; b.textContent = txt; return b; }
  function setStatus(ctx, txt, cls) { ctx.status.textContent = txt; ctx.status.className = 'nmg-status' + (cls ? ' ' + cls : ''); }
  function flash(ctx, b, msg) { b.classList.add('bad'); setStatus(ctx, msg, 'bad'); setTimeout(function () { b.classList.remove('bad'); }, 440); }

  /* ---------- 3D 시각화(우아한 실패) ---------- */
  function pathViz(ctx, N) {
    var base = baseScene(ctx), slots = [], labels = [], pulse = null;
    if (base) { var span = Math.min(2.2, 8 / N), x0 = -(N - 1) * span / 2; for (var i = 0; i < N; i++) { var n = ball(0.42, 0xd1d5db); n.position.set(x0 + i * span, 0, 0); base.scene.add(n); slots.push({ m: n, x: x0 + i * span }); if (i < N - 1) { var lk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, span, 6), new THREE.MeshBasicMaterial({ color: 0xe5e7eb })); lk.rotation.z = Math.PI / 2; lk.position.set(x0 + i * span + span / 2, 0, 0); base.scene.add(lk); } } pulse = ball(0.16, 0xfde047); pulse.visible = false; base.scene.add(pulse); base.tick(function () { if (pulse.visible) pulse.material.color.setHSL(0.13, 1, 0.5 + 0.2 * Math.sin(base.T() * 6)); }); }
    return { fill: function (i, t) { if (!base) return; slots[i].m.material.color.setHex(ctx.colorHex); var sp = labelSprite(t, ctx.color); sp.position.set(slots[i].x, 0.85, 0); base.scene.add(sp); labels.push(sp); pulse.visible = true; pulse.position.set(slots[i].x, 0, 0); }, clear: function () { if (!base) return; slots.forEach(function (s) { s.m.material.color.setHex(0xd1d5db); }); labels.forEach(function (s) { base.scene.remove(s); }); labels = []; pulse.visible = false; } };
  }
  function matchViz(ctx, pairs) {
    var base = baseScene(ctx), N = pairs.length, L = [], Rn = [], lines = [];
    if (base) { var gap = Math.min(1.4, 5 / N), y0 = (N - 1) * gap / 2; for (var i = 0; i < N; i++) { var l = ball(0.26, 0xc7d2fe); l.position.set(-3, y0 - i * gap, 0); base.scene.add(l); L.push(l); var r = ball(0.26, 0xe5e7eb); r.position.set(3, y0 - i * gap, 0); base.scene.add(r); Rn.push(r); } base.tick(function () { for (var j = 0; j < lines.length; j++) lines[j].material.opacity = 0.55 + 0.35 * Math.sin(base.T() * 3 + j); }); }
    return { link: function (k) { if (!base) return; L[k].material.color.setHex(ctx.colorHex); Rn[k].material.color.setHex(ctx.colorHex); var g = new THREE.BufferGeometry().setFromPoints([L[k].position.clone(), Rn[k].position.clone()]); var ln = new THREE.Line(g, new THREE.LineBasicMaterial({ color: ctx.colorHex, transparent: true, opacity: 0.7 })); base.scene.add(ln); lines.push(ln); }, clear: function () { if (!base) return; L.forEach(function (m) { m.material.color.setHex(0xc7d2fe); }); Rn.forEach(function (m) { m.material.color.setHex(0xe5e7eb); }); lines.forEach(function (l) { base.scene.remove(l); }); lines = []; } };
  }
  function bucketViz(ctx, groups) {
    var base = baseScene(ctx), G = groups.length, plat = [], cubes = [];
    if (base) { var span = Math.min(3, 8 / G), x0 = -(G - 1) * span / 2; for (var i = 0; i < G; i++) { var p = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.6), new THREE.MeshBasicMaterial({ color: 0xe5e7eb })); p.position.set(x0 + i * span, -1.2, 0); base.scene.add(p); plat.push({ m: p, x: x0 + i * span, c: 0 }); } base.tick(function () { for (var j = 0; j < cubes.length; j++) cubes[j].rotation.y += 0.02; }); }
    return { drop: function (gi) { if (!base) return; var pl = plat[gi]; pl.m.material.color.setHex(ctx.colorHex); var cu = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshBasicMaterial({ color: ctx.colorHex })); cu.position.set(pl.x + (pl.c % 3 - 1) * 0.45, -0.9 + Math.floor(pl.c / 3) * 0.45, 0); pl.c++; base.scene.add(cu); cubes.push(cu); }, clear: function () { if (!base) return; plat.forEach(function (p) { p.m.material.color.setHex(0xe5e7eb); p.c = 0; }); cubes.forEach(function (c) { base.scene.remove(c); }); cubes = []; } };
  }
  function ringViz(ctx) {
    var base = baseScene(ctx), nodes = [];
    function build(n) { nodes.forEach(function (m) { base.scene.remove(m); }); nodes = []; if (!base) return; for (var i = 0; i < n; i++) { var a = (i / n) * Math.PI * 2; var m = ball(0.5, 0xc7d2fe); m.position.set(Math.cos(a) * 2.4, Math.sin(a) * 1.6, 0); base.scene.add(m); nodes.push(m); } }
    if (base) base.tick(function () { base.scene.rotation.z = 0; });
    return { show: function (n) { build(n); }, mark: function (i) { if (base && nodes[i]) nodes[i].material.color.setHex(ctx.colorHex); } };
  }

  /* ---------- 공용 3D 베이스 ---------- */
  function ball(r, c) { return new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), new THREE.MeshBasicMaterial({ color: c })); }
  function baseScene(ctx) {
    if (typeof THREE === 'undefined') return null;
    try {
      var w = ctx.canvasBox.clientWidth || 600, h = 190, scene = new THREE.Scene();
      var cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); cam.position.set(0, 0, 9); cam.lookAt(0, 0, 0);
      var rn = new THREE.WebGLRenderer({ antialias: true, alpha: true }); rn.setSize(w, h); rn.setPixelRatio(Math.min(window.devicePixelRatio, 2)); ctx.canvasBox.appendChild(rn.domElement);
      var T = 0, cbs = [];
      (function loop() { requestAnimationFrame(loop); T += 0.016; for (var i = 0; i < cbs.length; i++) cbs[i](); rn.render(scene, cam); })();
      window.addEventListener('resize', function () { var ww = ctx.canvasBox.clientWidth || 600; cam.aspect = ww / h; cam.updateProjectionMatrix(); rn.setSize(ww, h); });
      return { scene: scene, tick: function (cb) { cbs.push(cb); }, T: function () { return T; } };
    } catch (e) { return null; }
  }
  function labelSprite(txt, color) {
    var fs = 22, cv = document.createElement('canvas'), x = cv.getContext('2d'), font = '700 ' + fs + 'px "Noto Sans KR",sans-serif'; x.font = font;
    cv.width = Math.ceil(x.measureText(txt).width) + 16; cv.height = fs + 10; x = cv.getContext('2d'); x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color; x.fillText(txt, cv.width / 2, cv.height / 2);
    var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter; var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); sp.scale.set(cv.width * 0.0055, cv.height * 0.0055, 1); return sp;
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
      '.nmg-body.nmg-match{gap:16px}.nmg-body.nmg-group{flex-direction:column;gap:14px}',
      '.nmg-col{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}',
      '.nmg-pool{display:flex;flex-wrap:wrap;gap:8px}',
      '.nmg-buckets{display:flex;flex-wrap:wrap;gap:10px}',
      '.nmg-bucket{flex:1;min-width:120px;min-height:74px;border:2px dashed var(--border,#cbd5e1);border-radius:12px;background:var(--card,#fff);padding:8px;cursor:pointer;display:flex;flex-direction:column;gap:6px;align-items:center}',
      '.nmg-bucket:hover{border-color:#818cf8}.nmg-bucket.bad{border-color:#fca5a5;animation:nmg-shake .4s}',
      '.nmg-bk-name{font-weight:800;font-size:13px;color:var(--text,#1f2430)}',
      '.nmg-placed{font-size:12px;font-weight:700;color:#15803d;background:#dcfce7;border-radius:999px;padding:3px 9px}',
      '.nmg-chip{padding:9px 14px;border:1px solid var(--border,#d1d5db);border-radius:999px;background:var(--card,#fff);color:var(--text,#1f2430);font-weight:700;font-size:14px;cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease;text-align:left}',
      '.nmg-def{border-radius:12px;font-weight:600}',
      '.nmg-chip:hover{border-color:#818cf8}.nmg-chip:focus-visible{outline:2px solid #6366f1;outline-offset:2px}',
      '.nmg-chip.sel{border-color:#6366f1;background:#eef2ff}',
      '.nmg-chip.ok{background:#dcfce7;border-color:#86efac;color:#15803d;cursor:default}',
      '.nmg-chip.bad{background:#fee2e2;border-color:#fca5a5;animation:nmg-shake .4s}',
      '.nmg-reset{margin-top:12px;padding:8px 14px;border:1px solid var(--border,#d1d5db);border-radius:9px;background:transparent;color:var(--muted,#6b7280);font-weight:700;font-size:13px;cursor:pointer}',
      '@keyframes nmg-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
      '@media (prefers-reduced-motion:reduce){.nmg-chip,.nmg-chip.bad,.nmg-bucket.bad{animation:none;transition:none}}'
    ].join('');
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
