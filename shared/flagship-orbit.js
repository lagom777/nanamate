/* 나나메이트 플래그십 3D 게임 — 궤도 잡기 (aboutAstronomy/01-celestial-mechanics)
 * 중앙의 별(질량)을 행성이 역제곱 중력으로 끈다. 행성을 드래그(슬링샷)해 초기 속도 벡터를 주면 궤도 운동 시작.
 * 목표: 별에 충돌(거리<R)하지도 화면 밖으로 이탈(거리>MAX)하지도 않고 목표 시간(N초) 안정 궤도 유지 → 클리어.
 * 궤적 트레일·속도/거리 HUD·단계별 별 질량/목표시간 변화. 실제 케플러/뉴턴 물리(역제곱 중력) 기반.
 * 컨테이너: <div id="nm-orbit"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문(graceful).
 *
 * 핵심 로직은 순수 함수로 분리(테스트 가능):
 *   gravityAccel, physicsStep, classifyOutcome, simulateOrbit, circularSpeed
 * Node에서: var O = require('./flagship-orbit.js') 로 순수 함수 접근.
 */
(function () {
  'use strict';

  // ───────────────────────── 순수 물리/판정 함수 (테스트 가능) ─────────────────────────

  // 역제곱 중력 가속도. 별은 원점(0,0). G·M = mu. 행성 위치 (x,y) → 가속도 (ax,ay).
  // softening eps 로 r→0 발산 방지.
  function gravityAccel(x, y, mu, eps) {
    eps = eps || 0;
    var r2 = x * x + y * y + eps * eps;
    var r = Math.sqrt(r2);
    var inv = mu / (r2 * r); // = mu / r^3, 방향벡터(-x,-y)에 곱하면 -mu/r^2 * r̂
    return { ax: -inv * x, ay: -inv * y };
  }

  // 반암시적 오일러(symplectic) 1스텝. 안정적인 궤도 적분에 적합.
  // state {x,y,vx,vy} → 새 state. dt초, mu=G·M, eps=softening.
  function physicsStep(state, dt, mu, eps) {
    var a = gravityAccel(state.x, state.y, mu, eps);
    var vx = state.vx + a.ax * dt;
    var vy = state.vy + a.ay * dt;
    var x = state.x + vx * dt;
    var y = state.y + vy * dt;
    return { x: x, y: y, vx: vx, vy: vy };
  }

  // 원형 궤도 속도 v = sqrt(mu / r) (뉴턴). 주어진 거리에서의 적정 궤도 속도.
  function circularSpeed(r, mu) { return Math.sqrt(mu / r); }

  // 한 순간의 상태를 판정: 'crash'(별 충돌), 'escape'(이탈), 'alive'(생존중).
  // rStar=충돌 반경, rMax=이탈 반경.
  function classifyOutcome(state, rStar, rMax) {
    var r = Math.sqrt(state.x * state.x + state.y * state.y);
    if (r < rStar) return 'crash';
    if (r > rMax) return 'escape';
    return 'alive';
  }

  // 발사 후 결과를 끝까지 시뮬레이션해 판정(순수). 게임 루프와 동일한 물리.
  // params: { x,y,vx,vy, mu, eps, rStar, rMax, target(목표 생존 초), dt }
  // 반환: { outcome:'win'|'crash'|'escape', t:생존시간, steps }
  function simulateOrbit(params) {
    var dt = params.dt || (1 / 120);
    var eps = params.eps || 0;
    var st = { x: params.x, y: params.y, vx: params.vx, vy: params.vy };
    var t = 0;
    var maxSteps = Math.ceil((params.target + 0.0001) / dt) + 1;
    for (var i = 0; i < maxSteps; i++) {
      st = physicsStep(st, dt, params.mu, eps);
      t += dt;
      var o = classifyOutcome(st, params.rStar, params.rMax);
      if (o === 'crash') return { outcome: 'crash', t: t, steps: i + 1 };
      if (o === 'escape') return { outcome: 'escape', t: t, steps: i + 1 };
      if (t >= params.target) return { outcome: 'win', t: t, steps: i + 1 };
    }
    return { outcome: 'win', t: t, steps: maxSteps };
  }

  // ───────────────────────── Node 테스트용 export ─────────────────────────
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      gravityAccel: gravityAccel,
      physicsStep: physicsStep,
      circularSpeed: circularSpeed,
      classifyOutcome: classifyOutcome,
      simulateOrbit: simulateOrbit
    };
  }

  // ───────────────────────── 브라우저 3D 게임 ─────────────────────────
  function init() {
    var host = document.getElementById('nm-orbit');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var W = host.clientWidth || 640, H = 380;
    var scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 400);
      cam.position.set(0, 26, 30); cam.lookAt(0, 0, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:crosshair;touch-action:none;display:block;background:radial-gradient(circle at 50% 45%,#0b1026,#05060f)';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    var pl = new THREE.PointLight(0xfff0c0, 1.8, 0, 2); pl.position.set(0, 0, 0); scene.add(pl);

    // 배경 별
    var sgeo = new THREE.BufferGeometry(); var sp = new Float32Array(900 * 3);
    for (var si = 0; si < 900; si++) { sp[si * 3] = (Math.random() - 0.5) * 300; sp[si * 3 + 1] = -20 - Math.random() * 120; sp[si * 3 + 2] = (Math.random() - 0.5) * 300; }
    sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(sgeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.4, transparent: true, opacity: 0.7 })));

    var grid = new THREE.GridHelper(80, 40, 0x1b2550, 0x10162e); grid.position.y = -0.4; scene.add(grid);

    // 게임 좌표(물리)는 평면 (x, z) 사용. 화면 평면 y=0. world.y는 항상 0.
    // 별
    var STAR_VIS_R = 1.5;
    var star = new THREE.Mesh(new THREE.SphereGeometry(STAR_VIS_R, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffd24a }));
    scene.add(star);
    var starGlow = new THREE.Mesh(new THREE.SphereGeometry(STAR_VIS_R * 2.1, 24, 24), new THREE.MeshBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0.18 }));
    scene.add(starGlow);

    // 행성
    var planet = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x1e1b4b, metalness: 0.3, roughness: 0.5 }));
    scene.add(planet);

    // 충돌 반경 / 이탈 반경 가이드 링
    function ringMesh(r, color, op) {
      var g = new THREE.RingGeometry(r - 0.06, r + 0.06, 96);
      var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: op, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2; return m;
    }

    // 단계: 별 질량(mu = G·M 스케일), 충돌반경, 목표 생존시간
    var levels = [
      { mu: 60, rStar: 2.2, target: 8, name: '가벼운 별' },
      { mu: 110, rStar: 2.6, target: 8, name: '보통 별' },
      { mu: 180, rStar: 3.0, target: 10, name: '무거운 별' }
    ];
    var R_MAX = 34;           // 이탈 반경(화면 가시 영역 안)
    var EPS = 0.9;            // softening
    var DT = 1 / 120;         // 물리 스텝(고정 스텝 누적)

    var lvl = 0, score = 0, attempts = 0;
    var crashRing = null, maxRing = null;
    function placeRings() {
      if (crashRing) scene.remove(crashRing);
      if (maxRing) scene.remove(maxRing);
      crashRing = ringMesh(levels[lvl].rStar, 0xef4444, 0.5); scene.add(crashRing);
      maxRing = ringMesh(R_MAX, 0x475569, 0.35); scene.add(maxRing);
      starGlow.scale.setScalar(0.6 + levels[lvl].mu / 180);
    }

    // HUD
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:12px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#e5e7ff;text-shadow:0 1px 4px rgba(0,0,0,.7);pointer-events:none;line-height:1.55';
    host.appendChild(hud);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;right:12px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#c7d2fe;text-shadow:0 1px 4px rgba(0,0,0,.7);pointer-events:none;text-align:right;max-width:60%';
    tip.textContent = '행성을 당겼다 놓아(슬링샷) 초기 속도를 주세요 · 적정 속도면 궤도, 과속이면 이탈, 저속이면 추락';
    host.appendChild(tip);
    var live = document.createElement('div'); // 우상단 생존 게이지
    live.style.cssText = 'position:absolute;right:12px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#a5f3c0;text-shadow:0 1px 4px rgba(0,0,0,.7);pointer-events:none;text-align:right;line-height:1.5';
    host.appendChild(live);

    function setHud(extra) {
      var L = levels[lvl];
      hud.innerHTML = '🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + levels.length + ' (' + L.name + ')<br>μ=GM ' + L.mu + ' · 목표 생존 ' + L.target + '초 · 시도 ' + attempts + (extra ? '<br>' + extra : '');
    }
    function setLive(t, r, v) {
      if (!flying) { live.textContent = ''; return; }
      var L = levels[lvl];
      live.innerHTML = '⏱ ' + t.toFixed(1) + ' / ' + L.target + 's<br>거리 ' + r.toFixed(1) + ' · 속도 ' + v.toFixed(1);
    }

    placeRings(); setHud();

    // 물리 상태(게임 진행)
    var flying = false, st = { x: 0, y: 0, vx: 0, vy: 0 }, survT = 0;
    var trail = [], won = false;

    // 행성 시작 위치(별 우측). world(x,0,z) = (st.x, 0, st.y)
    var START = { x: 12, y: 0 };
    function placePlanetStart() { planet.position.set(START.x, 0, START.y); }

    function clearTrail() { for (var i = 0; i < trail.length; i++) scene.remove(trail[i]); trail = []; }

    function resetPlanet() {
      flying = false; won = false; survT = 0; clearTrail();
      st = { x: START.x, y: START.y, vx: 0, vy: 0 };
      placePlanetStart(); hidePreview(); setLive(0, 0, 0); setHud();
    }

    // 슬링샷 조준: 행성을 당긴 반대 방향으로 초기 속도. 적정 속도 힌트(원형 속도) 표시.
    var aiming = false, sx = 0, sy = 0;
    function toLocal(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return { x: p.clientX - r.left, y: p.clientY - r.top }; }
    var DRAG_SCALE = 0.05; // 화면 픽셀 → 속도 단위
    var SPEED_MAX = 14;
    function aimVel(cx, cy) {
      var dx = cx - sx, dy = cy - sy;        // 당긴 벡터(화면)
      // 화면 좌→우 = world +x, 화면 위→아래(+dy) = world +z. 당긴 반대로 발사.
      var vx = -dx * DRAG_SCALE, vz = -dy * DRAG_SCALE;
      var sp = Math.hypot(vx, vz);
      if (sp > SPEED_MAX) { vx *= SPEED_MAX / sp; vz *= SPEED_MAX / sp; }
      return { vx: vx, vy: vz };
    }

    // 발사 전 궤적 미리보기(짧게 예측)
    var preview = [];
    for (var pi = 0; pi < 40; pi++) { var d = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); d.visible = false; scene.add(d); preview.push(d); }
    function showPreview(vx, vy) {
      var L = levels[lvl];
      var s = { x: START.x, y: START.y, vx: vx, vy: vy };
      var stepEvery = 4; // 미리보기는 4스텝마다 1점
      var pIdx = 0;
      for (var i = 0; i < preview.length * stepEvery && pIdx < preview.length; i++) {
        s = physicsStep(s, DT * 2, L.mu, EPS);
        var oc = classifyOutcome(s, L.rStar, R_MAX);
        if (oc !== 'alive') break;
        if (i % stepEvery === 0) { preview[pIdx].position.set(s.x, 0, s.y); preview[pIdx].visible = true; pIdx++; }
      }
      for (; pIdx < preview.length; pIdx++) preview[pIdx].visible = false;
      var spd = Math.hypot(vx, vy);
      var vcirc = circularSpeed(Math.hypot(START.x, START.y), L.mu);
      setHud('세기 ' + spd.toFixed(1) + ' · 원형궤도 적정 ≈ ' + vcirc.toFixed(1));
    }
    function hidePreview() { for (var i = 0; i < preview.length; i++) preview[i].visible = false; }

    function launch(vx, vy) {
      flying = true; won = false; attempts++; survT = 0; clearTrail();
      st = { x: START.x, y: START.y, vx: vx, vy: vy };
      hidePreview(); beep(330, 0.12, 'sawtooth'); setHud();
    }

    function onDown(e) { if (flying) return; aiming = true; var p = toLocal(e); sx = p.x; sy = p.y; e.preventDefault(); }
    function onMove(e) { if (!aiming || flying) return; var p = toLocal(e); var v = aimVel(p.x, p.y); showPreview(v.vx, v.vy); e.preventDefault(); }
    function onUp(e) {
      if (!aiming || flying) return; aiming = false;
      var p = toLocal(e.changedTouches ? { touches: e.changedTouches } : e);
      var v = aimVel(p.x, p.y);
      if (Math.hypot(v.vx, v.vy) < 1.2) { hidePreview(); setHud('너무 약합니다 — 더 세게 당기세요'); return; }
      launch(v.vx, v.vy); e.preventDefault();
    }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    // 파티클
    var parts = [];
    function burst(pos, color, n) {
      n = n || 18;
      for (var i = 0; i < n; i++) {
        var s = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), new THREE.MeshBasicMaterial({ color: color }));
        s.position.copy(pos);
        var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
        s.userData.v = new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)).multiplyScalar(5 + Math.random() * 4);
        s.userData.life = 0.8; scene.add(s); parts.push(s);
      }
    }

    function win() {
      won = true; flying = false;
      score += 100 + Math.max(0, 50 - attempts * 5);
      burst(planet.position.clone(), 0x86efac, 24); chime();
      lvl++;
      if (lvl >= levels.length) {
        setHud('🎉 모든 궤도 안정화 성공! 클리어');
        el.style.pointerEvents = 'none';
        setTimeout(function () { el.style.pointerEvents = ''; lvl = 0; attempts = 0; placeRings(); resetPlanet(); }, 2800);
      } else {
        placeRings(); setHud('안정 궤도 성공! 다음 단계');
        setTimeout(function () { resetPlanet(); }, 1600);
      }
    }
    function crash() { flying = false; burst(planet.position.clone(), 0xff6b35, 20); beep(140, 0.18, 'square'); setHud('💥 별에 추락 — 더 빠르게 옆으로'); setTimeout(function () { if (!won) resetPlanet(); }, 1400); }
    function escape() { flying = false; burst(planet.position.clone(), 0x60a5fa, 16); beep(180, 0.16, 'sawtooth'); setHud('🚀 궤도 이탈 — 속도를 줄이세요'); setTimeout(function () { if (!won) resetPlanet(); }, 1400); }

    resetPlanet();

    // 메인 루프 — 게임 물리는 고정 스텝으로 누적(결정론적, 순수함수와 동일)
    var last = null, acc = 0;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      star.rotation.y += 0.01; starGlow.scale.multiplyScalar(1); // glow scale set in placeRings
      var pulse = 1 + 0.05 * Math.sin(ts / 400); star.scale.setScalar(pulse);

      if (flying && !won) {
        acc += dt;
        var L = levels[lvl];
        while (acc >= DT) {
          st = physicsStep(st, DT, L.mu, EPS);
          survT += DT; acc -= DT;
          var oc = classifyOutcome(st, L.rStar, R_MAX);
          if (oc === 'crash') { planet.position.set(st.x, 0, st.y); crash(); break; }
          if (oc === 'escape') { planet.position.set(st.x, 0, st.y); escape(); break; }
          if (survT >= L.target) { planet.position.set(st.x, 0, st.y); win(); break; }
        }
        if (flying && !won) {
          planet.position.set(st.x, 0, st.y);
          var r = Math.hypot(st.x, st.y), v = Math.hypot(st.vx, st.vy);
          setLive(survT, r, v);
          // 트레일
          var tm = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: 0.6 }));
          tm.position.set(st.x, 0, st.y); scene.add(tm); trail.push(tm);
          if (trail.length > 220) { scene.remove(trail.shift()); }
        }
      }

      for (var i = parts.length - 1; i >= 0; i--) {
        var s = parts[i]; s.userData.life -= dt;
        if (s.userData.life <= 0) { scene.remove(s); parts.splice(i, 1); continue; }
        s.userData.v.y -= 6 * dt; s.position.addScaledVector(s.userData.v, dt);
        s.material.transparent = true; s.material.opacity = Math.max(0, s.userData.life);
      }
      for (var j = 0; j < trail.length; j++) { trail[j].material.opacity *= 0.992; }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // 사운드
    var actx = null, muted = false;
    function beep(f, d, type) { if (muted) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
