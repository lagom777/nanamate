/* 나나메이트 플래그십 3D 게임 — 포물선 그래프 (aboutMath/03-functions)
 * 이차함수 y = a(x−h)² + k 의 꼭짓점(h,k)을 끌고 곡률 a를 바꿔, 떠 있는 코인을 모두 지나는 그래프를 만든다.
 * vertex form(꼭짓점 형태)의 a·h·k가 그래프를 어떻게 바꾸는지 직접 체득. 단계별·점수·이펙트·사운드.
 * 컨테이너: <div id="nm-graph"></div>. THREE(r128) 필요. WebGL 실패 시 안내문(graceful).
 */
(function () {
  function init() {
    var host = document.getElementById('nm-graph');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }
    var W = host.clientWidth || 640, H = 360, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 200);
      cam.position.set(0, 3.4, 16); cam.lookAt(0, 3.4, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:grab;touch-action:none;display:block';
    host.appendChild(rndr.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var dl = new THREE.DirectionalLight(0xffffff, 0.5); dl.position.set(2, 6, 8); scene.add(dl);

    // 좌표 범위
    var XMIN = -7, XMAX = 7, YMIN = -1, YMAX = 9;
    // 격자/축
    var gmat = new THREE.LineBasicMaterial({ color: 0xd1d5db, transparent: true, opacity: 0.5 });
    for (var gx = XMIN; gx <= XMAX; gx++) addLine(gx, YMIN, gx, YMAX, gmat);
    for (var gy = YMIN; gy <= YMAX; gy++) addLine(XMIN, gy, XMAX, gy, gmat);
    addLine(XMIN, 0, XMAX, 0, new THREE.LineBasicMaterial({ color: 0x475569 }));
    addLine(0, YMIN, 0, YMAX, new THREE.LineBasicMaterial({ color: 0x475569 }));
    function addLine(x1, y1, x2, y2, m) { var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)]); scene.add(new THREE.Line(g, m)); }

    // 포물선
    var curveMat = new THREE.LineBasicMaterial({ color: 0x2563eb, linewidth: 3 });
    var curve = new THREE.Line(new THREE.BufferGeometry(), curveMat); scene.add(curve);
    // 꼭짓점 핸들
    var vtx = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 18), new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x10245e })); scene.add(vtx);

    var a = 0.5, h = 0, k = 1;
    function f(x) { return a * (x - h) * (x - h) + k; }
    function redraw() {
      var pts = []; for (var x = XMIN; x <= XMAX + 0.001; x += 0.15) { var y = f(x); if (y >= YMIN - 2 && y <= YMAX + 4) pts.push(new THREE.Vector3(x, y, 0)); }
      curve.geometry.dispose(); curve.geometry = new THREE.BufferGeometry().setFromPoints(pts);
      vtx.position.set(h, k, 0);
      checkCoins();
    }

    // 코인(레벨별 숨은 포물선에서 샘플)
    var levels = [
      { a: 0.5, h: -1, k: 1, xs: [-4, 1, 3] },
      { a: -0.6, h: 1, k: 6, xs: [-2, 1, 4] },
      { a: 0.8, h: 2, k: 0.5, xs: [-1, 2, 4] }
    ];
    var lvl = 0, score = 0, coins = [];
    function buildCoins() {
      coins.forEach(function (c) { scene.remove(c.mesh); }); coins = [];
      var L = levels[lvl];
      L.xs.forEach(function (cx) {
        var cy = L.a * (cx - L.h) * (cx - L.h) + L.k;
        var m = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.12, 10, 20), new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x5b3a00 }));
        m.position.set(cx, cy, 0); scene.add(m); coins.push({ x: cx, y: cy, mesh: m, on: false });
      });
    }
    function checkCoins() {
      var all = coins.length > 0;
      coins.forEach(function (c) { var on = Math.abs(f(c.x) - c.y) < 0.3; c.on = on; c.mesh.material.color.setHex(on ? 0x22c55e : 0xf59e0b); if (!on) all = false; });
      setHud();
      if (all && !won) win();
    }
    var won = false;
    function win() {
      won = true; score += 100; coins.forEach(function (c) { burst(c.mesh.position, 0x22c55e); }); chime();
      lvl++;
      if (lvl >= levels.length) { setHud('🎉 모든 단계 클리어! 총 ' + score + '점'); setTimeout(function () { lvl = 0; score = 0; reset(); }, 2800); }
      else { setHud('정답! 다음 단계'); setTimeout(function () { reset(); }, 1400); }
    }
    function reset() { won = false; a = 0.5; h = 0; k = 1; aSlider.value = '0.5'; buildCoins(); redraw(); }

    // HUD + 컨트롤
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:10px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#1f2430;pointer-events:none;line-height:1.5';
    host.appendChild(hud);
    function setHud(msg) { hud.innerHTML = 'y = ' + a.toFixed(2) + '(x − ' + h.toFixed(1) + ')² + ' + k.toFixed(1) + '<br>🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + levels.length + ' · 코인 ' + coins.filter(function (c) { return c.on; }).length + '/' + coins.length + (msg ? '<br><b>' + msg + '</b>' : ''); }

    var ctrl = document.createElement('div');
    ctrl.style.cssText = 'position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;font:600 12px "Noto Sans KR",sans-serif;color:#374151';
    var lab = document.createElement('label'); lab.textContent = '곡률 a';
    var aSlider = document.createElement('input'); aSlider.type = 'range'; aSlider.min = '-1.5'; aSlider.max = '1.5'; aSlider.step = '0.05'; aSlider.value = '0.5'; aSlider.style.width = '130px';
    aSlider.oninput = function () { a = parseFloat(aSlider.value); redraw(); };
    var rb = document.createElement('button'); rb.textContent = '↺ 리셋'; rb.style.cssText = 'border:1px solid #d1d5db;border-radius:8px;background:#fff;padding:4px 10px;font-weight:700;cursor:pointer';
    rb.onclick = reset;
    ctrl.appendChild(lab); ctrl.appendChild(aSlider); ctrl.appendChild(rb); host.appendChild(ctrl);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;left:10px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#6b7280';
    tip.textContent = '파란 꼭짓점을 끌고 곡률 a를 바꿔 모든 코인을 지나게!';
    host.appendChild(tip);

    // 꼭짓점 드래그(평면 z=0에 레이캐스트)
    var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), drag = false;
    function ndc(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return new THREE.Vector2(((p.clientX - r.left) / r.width) * 2 - 1, -((p.clientY - r.top) / r.height) * 2 + 1); }
    function planePt(e) { ray.setFromCamera(ndc(e), cam); var pt = new THREE.Vector3(); ray.ray.intersectPlane(plane, pt); return pt; }
    function onDown(e) { var pt = planePt(e); if (pt && Math.hypot(pt.x - h, pt.y - k) < 1.2) { drag = true; rndr.domElement.style.cursor = 'grabbing'; e.preventDefault(); } }
    function onMove(e) { if (!drag) return; var pt = planePt(e); if (pt) { h = Math.max(XMIN + 1, Math.min(XMAX - 1, Math.round(pt.x * 2) / 2)); k = Math.max(YMIN, Math.min(YMAX - 1, Math.round(pt.y * 2) / 2)); redraw(); } e.preventDefault(); }
    function onUp() { drag = false; rndr.domElement.style.cursor = 'grab'; }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    // 파티클
    var parts = [];
    function burst(p, color) { for (var i = 0; i < 14; i++) { var s = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshBasicMaterial({ color: color })); s.position.copy(p); var ang = Math.random() * Math.PI * 2; s.userData.v = new THREE.Vector3(Math.cos(ang) * 3, Math.sin(ang) * 3 + 1.5, (Math.random() - 0.5) * 2); s.userData.life = 0.7; scene.add(s); parts.push(s); } }

    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop); var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      coins.forEach(function (c) { c.mesh.rotation.y += 0.04; });
      vtx.scale.setScalar(1 + 0.08 * Math.sin(ts / 300));
      for (var i = parts.length - 1; i >= 0; i--) { var s = parts[i]; s.userData.life -= dt; if (s.userData.life <= 0) { scene.remove(s); parts.splice(i, 1); continue; } s.userData.v.y -= 7 * dt; s.position.addScaledVector(s.userData.v, dt); s.material.transparent = true; s.material.opacity = Math.max(0, s.userData.life); }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    var actx = null;
    function beep(fr, d, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = fr; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (fr, i) { setTimeout(function () { beep(fr, 0.18, 'triangle'); }, i * 110); }); }

    reset();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
