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

    // 모션 최소화 선호(learngame3d.js 패턴) — 셰이크/트월링/드리프트/marching/파티클 게이트
    var RM = false; try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

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

    // ── 캔버스 합성 텍스처(외부 에셋 없음) ──
    function radialTex(size, inner, mid, outer) {
      var c = document.createElement('canvas'); c.width = c.height = size;
      var x = c.getContext('2d');
      var g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, inner); g.addColorStop(0.35, mid); g.addColorStop(1, outer);
      x.fillStyle = g; x.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }
    function flareTex(size) {
      var c = document.createElement('canvas'); c.width = c.height = size;
      var x = c.getContext('2d');
      function streak(rot) {
        x.save(); x.translate(size / 2, size / 2); x.rotate(rot); x.scale(1, 0.055);
        var g = x.createRadialGradient(0, 0, 0, 0, 0, size / 2);
        g.addColorStop(0, 'rgba(255,240,200,0.9)');
        g.addColorStop(0.4, 'rgba(255,200,90,0.35)');
        g.addColorStop(1, 'rgba(255,180,60,0)');
        x.fillStyle = g;
        x.beginPath(); x.arc(0, 0, size / 2, 0, Math.PI * 2); x.fill();
        x.restore();
      }
      streak(0); streak(Math.PI / 2);
      return new THREE.CanvasTexture(c);
    }

    // ── 배경 별: 2겹 시차 레이어(느린 원경 + 빠른 근경), 레이어별 트월링 ──
    function starLayer(count, spread, size, opacity, color) {
      var geo = new THREE.BufferGeometry(); var arr = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) {
        arr[i * 3] = (Math.random() - 0.5) * spread;
        arr[i * 3 + 1] = -20 - Math.random() * 120;
        arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      var pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: color, size: size, transparent: true, opacity: opacity, depthWrite: false }));
      scene.add(pts); return pts;
    }
    var farStars = starLayer(600, 320, 0.32, 0.55, 0xbfd0ff);
    var nearStars = starLayer(300, 300, 0.7, 0.8, 0xffffff);

    var grid = new THREE.GridHelper(80, 40, 0x1b2550, 0x10162e); grid.position.y = -0.4; scene.add(grid);

    // 게임 좌표(물리)는 평면 (x, z) 사용. 화면 평면 y=0. world.y는 항상 0.
    // 별 + 코로나(additive 빌보드) + 천천히 도는 플레어 스프라이트
    var STAR_VIS_R = 1.5;
    var star = new THREE.Mesh(new THREE.SphereGeometry(STAR_VIS_R, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffd24a }));
    scene.add(star);
    var starGlow = new THREE.Group();
    var corona = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex(256, 'rgba(255,244,214,1)', 'rgba(255,190,70,0.55)', 'rgba(255,140,20,0)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.9 }));
    corona.scale.set(8.5, 8.5, 1);
    starGlow.add(corona);
    var flareMat = new THREE.SpriteMaterial({ map: flareTex(256), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.75 });
    var flare = new THREE.Sprite(flareMat);
    flare.scale.set(13, 13, 1);
    starGlow.add(flare);
    scene.add(starGlow);

    // 행성 + additive 글로우 빌보드(속도에 따라 색 보간)
    var planet = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x1e1b4b, metalness: 0.3, roughness: 0.5 }));
    scene.add(planet);
    var planetGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex(128, 'rgba(255,255,255,1)', 'rgba(170,180,255,0.45)', 'rgba(120,130,255,0)'), color: 0x818cf8, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.85 }));
    planetGlow.scale.set(2.6, 2.6, 1);
    scene.add(planetGlow);

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
    // 우상단 생존 게이지: 텍스트 + DOM 프로그레스 바(폭 트랜지션, 80% 이후 골드 펄스)
    var live = document.createElement('div');
    live.style.cssText = 'position:absolute;right:12px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#a5f3c0;text-shadow:0 1px 4px rgba(0,0,0,.7);pointer-events:none;text-align:right;line-height:1.5';
    var liveText = document.createElement('div');
    var liveBarWrap = document.createElement('div');
    liveBarWrap.style.cssText = 'width:150px;height:7px;margin:5px 0 0 auto;border-radius:4px;background:rgba(148,163,184,.25);display:none';
    var liveBar = document.createElement('div');
    liveBar.style.cssText = 'height:100%;width:0%;border-radius:4px;background:linear-gradient(90deg,#22d3ee,#4ade80);transition:width .12s linear';
    liveBarWrap.appendChild(liveBar); live.appendChild(liveText); live.appendChild(liveBarWrap);
    host.appendChild(live);
    var liveGold = false;
    var styleEl = document.createElement('style');
    styleEl.textContent = '@keyframes nmOrbGold{0%,100%{box-shadow:0 0 3px rgba(251,191,36,.35)}50%{box-shadow:0 0 11px 3px rgba(251,191,36,.9)}}';
    document.head.appendChild(styleEl);

    function setHud(extra) {
      var L = levels[lvl];
      hud.innerHTML = '🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + levels.length + ' (' + L.name + ')<br>μ=GM ' + L.mu + ' · 목표 생존 ' + L.target + '초 · 시도 ' + attempts + (extra ? '<br>' + extra : '');
    }
    function setLive(t, r, v) {
      if (!flying) {
        liveText.innerHTML = ''; liveBarWrap.style.display = 'none';
        liveGold = false; liveBarWrap.style.animation = 'none';
        liveBar.style.background = 'linear-gradient(90deg,#22d3ee,#4ade80)';
        return;
      }
      var L = levels[lvl];
      liveText.innerHTML = '⏱ ' + t.toFixed(1) + ' / ' + L.target + 's<br>거리 ' + r.toFixed(1) + ' · 속도 ' + v.toFixed(1);
      liveBarWrap.style.display = 'block';
      var pct = Math.min(100, t / L.target * 100);
      liveBar.style.width = pct + '%';
      var gold = pct >= 80;
      if (gold !== liveGold) {
        liveGold = gold;
        liveBar.style.background = gold ? 'linear-gradient(90deg,#fbbf24,#ffd24a)' : 'linear-gradient(90deg,#22d3ee,#4ade80)';
        liveBarWrap.style.animation = gold && !RM ? 'nmOrbGold .55s ease-in-out infinite' : 'none';
      }
    }

    // 점수 팝업(+획득점수)
    function scorePop(txt) {
      var d = document.createElement('div');
      d.textContent = txt;
      d.style.cssText = 'position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);font:800 30px "Noto Sans KR",sans-serif;color:#ffd24a;text-shadow:0 2px 14px rgba(255,180,40,.65);pointer-events:none;opacity:1;transition:' + (RM ? 'opacity 1s ease-out' : 'transform 1s ease-out,opacity 1s ease-out');
      host.appendChild(d);
      setTimeout(function () { if (!RM) d.style.transform = 'translate(-50%,-160%)'; d.style.opacity = '0'; }, 30);
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1150);
    }

    placeRings(); setHud();

    // 물리 상태(게임 진행)
    var flying = false, st = { x: 0, y: 0, vx: 0, vy: 0 }, survT = 0;
    var won = false, lastTick = 99;

    // 행성 시작 위치(별 우측). world(x,0,z) = (st.x, 0, st.y)
    var START = { x: 12, y: 0 };
    function placePlanetStart() { planet.position.set(START.x, 0, START.y); }

    // ── 트레일: 고정 크기 포지션/컬러 버퍼의 THREE.Line(DynamicDrawUsage + drawRange) ──
    var TRAIL_N = 240, trailCount = 0;
    var trailPos = new Float32Array(TRAIL_N * 3);
    var trailColArr = new Float32Array(TRAIL_N * 3);
    var trailGeo = new THREE.BufferGeometry();
    var trailPosAttr = new THREE.BufferAttribute(trailPos, 3).setUsage(THREE.DynamicDrawUsage);
    var trailColAttr = new THREE.BufferAttribute(trailColArr, 3).setUsage(THREE.DynamicDrawUsage);
    trailGeo.setAttribute('position', trailPosAttr);
    trailGeo.setAttribute('color', trailColAttr);
    trailGeo.setDrawRange(0, 0);
    var trailLine = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    trailLine.frustumCulled = false;
    scene.add(trailLine);
    function pushTrail(x, z, cr, cg, cb) {
      if (trailCount === TRAIL_N) { trailPos.copyWithin(0, 3); trailColArr.copyWithin(0, 3); trailCount--; }
      var i = trailCount * 3;
      trailPos[i] = x; trailPos[i + 1] = 0; trailPos[i + 2] = z;
      trailColArr[i] = cr; trailColArr[i + 1] = cg; trailColArr[i + 2] = cb;
      trailCount++;
      trailGeo.setDrawRange(0, trailCount);
      trailPosAttr.needsUpdate = true; trailColAttr.needsUpdate = true;
    }
    function clearTrail() { trailCount = 0; trailGeo.setDrawRange(0, 0); }

    // 속도 → 색 보간: 위험하게 느림=붉은 경고, 원형속도 근처=청록 (비교에 circularSpeed만 사용)
    var tmpCol = { r: 0.5, g: 0.55, b: 1 };
    function speedTint(r, v, mu) {
      var vc = circularSpeed(Math.max(0.001, r), mu);
      var f = (v / vc - 0.55) / 0.5; f = f < 0 ? 0 : f > 1 ? 1 : f;
      tmpCol.r = 1 + (0.35 - 1) * f;
      tmpCol.g = 0.28 + (0.95 - 0.28) * f;
      tmpCol.b = 0.18 + (1 - 0.18) * f;
      var hf = (v / vc - 1.25) / 0.6; // 과속이면 백색광 쪽으로
      if (hf > 0) { if (hf > 1) hf = 1; tmpCol.r += (1 - tmpCol.r) * hf; tmpCol.g += (1 - tmpCol.g) * hf; }
    }
    var goldFxT = 0; // 승리 시 트레일 골드 물들이기 타이머

    function resetPlanet() {
      flying = false; won = false; survT = 0; clearTrail(); goldFxT = 0;
      st = { x: START.x, y: START.y, vx: 0, vy: 0 };
      placePlanetStart(); hidePreview(); setLive(0, 0, 0); setHud();
      planetGlow.material.color.setHex(0x818cf8);
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

    // 고무줄 라인(행성→당김점, 탄성 미세 진동)
    var BAND_N = 16;
    var bandPos = new Float32Array(BAND_N * 3);
    var bandGeo = new THREE.BufferGeometry();
    var bandPosAttr = new THREE.BufferAttribute(bandPos, 3).setUsage(THREE.DynamicDrawUsage);
    bandGeo.setAttribute('position', bandPosAttr);
    var bandMat = new THREE.LineBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: 0.85 });
    var bandLine = new THREE.Line(bandGeo, bandMat);
    bandLine.frustumCulled = false; bandLine.visible = false;
    scene.add(bandLine);
    var pull = { x: 0, z: 0, len: 0 };
    function setPull(cx, cy) {
      var K = 0.04;
      var px = (cx - sx) * K, pz = (cy - sy) * K;
      var l = Math.hypot(px, pz);
      if (l > 11) { px *= 11 / l; pz *= 11 / l; l = 11; }
      pull.x = px; pull.z = pz; pull.len = l;
    }

    // 발사 전 궤적 미리보기(짧게 예측) — marching 점 + 적정 세기면 초록 글로우 힌트
    var preview = [], prevCount = 0, hintNear = false;
    for (var pi = 0; pi < 40; pi++) { var d = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshBasicMaterial({ color: 0xe0e7ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); d.visible = false; scene.add(d); preview.push(d); }
    function setHint(near) {
      if (near === hintNear) return;
      hintNear = near;
      var hex = near ? 0x4ade80 : 0xe0e7ff;
      for (var i = 0; i < preview.length; i++) preview[i].material.color.setHex(hex);
      bandMat.color.setHex(near ? 0x4ade80 : 0xa5b4fc);
    }
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
      prevCount = pIdx;
      for (; pIdx < preview.length; pIdx++) preview[pIdx].visible = false;
      var spd = Math.hypot(vx, vy);
      var vcirc = circularSpeed(Math.hypot(START.x, START.y), L.mu);
      setHint(Math.abs(spd - vcirc) <= vcirc * 0.12);
      setHud('세기 ' + spd.toFixed(1) + ' · 원형궤도 적정 ≈ ' + vcirc.toFixed(1));
    }
    function hidePreview() { prevCount = 0; for (var i = 0; i < preview.length; i++) preview[i].visible = false; setHint(false); }

    function launch(vx, vy) {
      flying = true; won = false; attempts++; survT = 0; clearTrail(); goldFxT = 0; lastTick = 99;
      st = { x: START.x, y: START.y, vx: vx, vy: vy };
      hidePreview(); launchSweep(); setHud();
    }

    function onDown(e) { if (flying) return; aiming = true; var p = toLocal(e); sx = p.x; sy = p.y; pull.len = 0; e.preventDefault(); }
    function onMove(e) { if (!aiming || flying) return; var p = toLocal(e); var v = aimVel(p.x, p.y); setPull(p.x, p.y); showPreview(v.vx, v.vy); e.preventDefault(); }
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

    // ── 파티클: 고정 풀 + 상한(재할당 없음). RM이면 끔 ──
    var POOL_N = 96, poolIdx = 0;
    var poolGeo = new THREE.SphereGeometry(0.14, 6, 6);
    var pool = [];
    for (var pj = 0; pj < POOL_N; pj++) {
      var pm = new THREE.Mesh(poolGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
      pm.visible = false; pm.userData.life = 0; pm.userData.maxLife = 1; pm.userData.v = new THREE.Vector3();
      scene.add(pm); pool.push(pm);
    }
    function burst(pos, color, n, dir) {
      if (RM) return;
      n = n || 18;
      for (var i = 0; i < n; i++) {
        var s = pool[poolIdx]; poolIdx = (poolIdx + 1) % POOL_N;
        s.visible = true; s.position.copy(pos);
        s.material.color.setHex(color);
        var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
        s.userData.v.set(Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)).multiplyScalar(4 + Math.random() * 5);
        if (dir) s.userData.v.addScaledVector(dir, 9);
        s.userData.maxLife = s.userData.life = 0.7 + Math.random() * 0.5;
        s.scale.setScalar(0.7 + Math.random() * 0.9);
      }
    }

    // 승리 쇼크웨이브 링(1개 재사용)
    var shock = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 64), new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    shock.rotation.x = -Math.PI / 2; shock.position.y = 0.05; shock.visible = false;
    scene.add(shock);
    var shockT = -1;

    // 카메라 연출 상태(줌 트윈 + 감쇠 노이즈 셰이크, RM 게이트)
    var CAMX = 0, CAMY = 26, CAMZ = 30;
    var shakeT = 0, shakeDur = 0.65, shakeAmp = 0, zoomT = -1, flashT = 0;
    var escDir = new THREE.Vector3();

    function win() {
      won = true; flying = false;
      var gained = 100 + Math.max(0, 50 - attempts * 5);
      score += gained;
      scorePop('+' + gained);
      goldFxT = 1.4;
      if (!RM) { shockT = 0; zoomT = 0; }
      burst(planet.position, 0xffd24a, 28);
      burst(planet.position, 0x86efac, 18);
      chime();
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
    function crash() {
      flying = false;
      burst(planet.position, 0xff6b35, 26);
      burst(planet.position, 0xffd24a, 12);
      flashT = 1;
      if (!RM) { shakeT = shakeDur; shakeAmp = 1.25; }
      boom();
      setHud('💥 별에 추락 — 더 빠르게 옆으로');
      setTimeout(function () { if (!won) resetPlanet(); }, 1400);
    }
    function escape() {
      flying = false;
      var dd = Math.hypot(st.x, st.y) || 1;
      escDir.set(st.x / dd, 0, st.y / dd);
      burst(planet.position, 0x60a5fa, 22, escDir);
      fallSweep();
      setHud('🚀 궤도 이탈 — 속도를 줄이세요');
      setTimeout(function () { if (!won) resetPlanet(); }, 1400);
    }

    resetPlanet();

    // 메인 루프(단일 rAF) — 게임 물리는 고정 스텝으로 누적(결정론적, 순수함수와 동일)
    var last = null, acc = 0;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      star.rotation.y += 0.01;
      var pulse = 1 + 0.05 * Math.sin(ts / 400); star.scale.setScalar(pulse);
      if (!RM) {
        flareMat.rotation += dt * 0.12;
        corona.scale.setScalar(8.5 * (1 + 0.05 * Math.sin(ts / 620)));
        farStars.rotation.y += dt * 0.004; nearStars.rotation.y += dt * 0.012;
        farStars.material.opacity = 0.5 + 0.16 * Math.sin(ts / 1700);
        nearStars.material.opacity = 0.72 + 0.2 * Math.sin(ts / 950 + 2);
      }

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
          // 마지막 2초 tick 비프(피치 상승)
          var remain = L.target - survT;
          if (remain <= 2) { var tk = Math.ceil(remain * 2); if (tk < lastTick && tk > 0) { lastTick = tk; beep(620 + (4 - tk) * 150, 0.06, 'square'); } }
          // 트레일 + 행성 글로우 색(느림=붉음, 원형속도 근처=청록)
          speedTint(r, v, L.mu);
          pushTrail(st.x, st.y, tmpCol.r, tmpCol.g, tmpCol.b);
          planetGlow.material.color.setRGB(tmpCol.r, tmpCol.g, tmpCol.b);
        }
      }
      planetGlow.position.copy(planet.position);

      // 트레일 꼬리 페이드 / 승리 시 골드 물들이기
      if (goldFxT > 0) goldFxT -= dt;
      if (trailCount > 0) {
        var n3 = trailCount * 3;
        if (goldFxT > 0) {
          var gk = Math.min(1, dt * 5);
          for (var gi = 0; gi < n3; gi += 3) {
            trailColArr[gi] += (1.0 - trailColArr[gi]) * gk;
            trailColArr[gi + 1] += (0.84 - trailColArr[gi + 1]) * gk;
            trailColArr[gi + 2] += (0.35 - trailColArr[gi + 2]) * gk;
          }
        } else {
          for (var fi = 0; fi < n3; fi++) trailColArr[fi] *= 0.995;
        }
        trailColAttr.needsUpdate = true;
      }

      // 파티클 풀 갱신
      for (var i = 0; i < POOL_N; i++) {
        var s = pool[i];
        if (s.userData.life <= 0) continue;
        s.userData.life -= dt;
        if (s.userData.life <= 0) { s.visible = false; continue; }
        s.userData.v.y -= 6 * dt;
        s.position.addScaledVector(s.userData.v, dt);
        s.material.opacity = Math.max(0, s.userData.life / s.userData.maxLife);
      }

      // 쇼크웨이브
      if (shockT >= 0) {
        shockT += dt / 0.9;
        if (shockT >= 1) { shockT = -1; shock.visible = false; }
        else {
          shock.visible = true;
          shock.scale.setScalar(1 + shockT * 26);
          shock.material.opacity = 0.85 * (1 - shockT);
        }
      }

      // 프리뷰 marching(RM이면 정지) + 고무줄 라인 진동
      if (!flying && prevCount > 0 && !RM) {
        for (var mi = 0; mi < prevCount; mi++) preview[mi].material.opacity = 0.2 + 0.45 * (0.5 + 0.5 * Math.sin(ts / 130 - mi * 0.55));
      }
      bandLine.visible = aiming && !flying && pull.len > 0.35;
      if (bandLine.visible) {
        var ilen = 1 / pull.len, perx = -pull.z * ilen, perz = pull.x * ilen;
        for (var bi = 0; bi < BAND_N; bi++) {
          var bt = bi / (BAND_N - 1);
          var wob = RM ? 0 : Math.sin(Math.PI * bt) * Math.sin(ts / 26 + bi * 1.9) * 0.03 * pull.len;
          bandPos[bi * 3] = START.x + pull.x * bt + perx * wob;
          bandPos[bi * 3 + 1] = 0.05;
          bandPos[bi * 3 + 2] = START.y + pull.z * bt + perz * wob;
        }
        bandPosAttr.needsUpdate = true;
      }

      // 추락 플래시(PointLight 스파이크) + 카메라 줌 트윈/감쇠 셰이크
      if (flashT > 0) { flashT -= dt * 2.2; if (flashT < 0) flashT = 0; }
      pl.intensity = 1.8 + flashT * flashT * 10;
      var zk = 0;
      if (zoomT >= 0) { zoomT += dt / 1.3; if (zoomT >= 1) zoomT = -1; else zk = Math.sin(Math.PI * zoomT) * 0.1; }
      var cs = 1 - zk, ox = 0, oy = 0, oz = 0;
      if (shakeT > 0) {
        shakeT -= dt;
        var sf = Math.max(0, shakeT / shakeDur), sa = shakeAmp * sf * sf;
        ox = (Math.random() - 0.5) * 2 * sa; oy = (Math.random() - 0.5) * 2 * sa; oz = (Math.random() - 0.5) * 2 * sa;
      }
      cam.position.set(CAMX * cs + ox, CAMY * cs + oy, CAMZ * cs + oz);
      cam.lookAt(0, 0, 0);

      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // 사운드(전부 WebAudio 합성 — AudioContext는 최초 사용 시 lazy 생성)
    var actx = null, muted = false;
    function beep(f, d, type) { if (muted) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }
    // 발사: 짧은 로우패스 필터 스윕
    function launchSweep() {
      if (muted) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        var t = actx.currentTime;
        var o = actx.createOscillator(), fl = actx.createBiquadFilter(), g = actx.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(180, t);
        fl.type = 'lowpass'; fl.Q.value = 8;
        fl.frequency.setValueAtTime(240, t);
        fl.frequency.exponentialRampToValueAtTime(3200, t + 0.16);
        fl.frequency.exponentialRampToValueAtTime(500, t + 0.3);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(fl); fl.connect(g); g.connect(actx.destination);
        o.start(t); o.stop(t + 0.32);
      } catch (e) {}
    }
    // 추락: white-noise 버퍼 폭발음(로우패스 하강)
    function boom() {
      if (muted) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        var t = actx.currentTime, dur = 0.45;
        var n = (actx.sampleRate * dur) | 0;
        var buf = actx.createBuffer(1, n, actx.sampleRate);
        var ch = buf.getChannelData(0);
        for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
        var src = actx.createBufferSource(); src.buffer = buf;
        var fl = actx.createBiquadFilter(); fl.type = 'lowpass';
        fl.frequency.setValueAtTime(2200, t);
        fl.frequency.exponentialRampToValueAtTime(120, t + dur);
        var g = actx.createGain();
        g.gain.setValueAtTime(0.28, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(fl); fl.connect(g); g.connect(actx.destination);
        src.start(t);
      } catch (e) {}
    }
    // 이탈: 하강 피치 스윕(frequency ramp)
    function fallSweep() {
      if (muted) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        var t = actx.currentTime;
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(660, t);
        o.frequency.exponentialRampToValueAtTime(90, t + 0.55);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        o.connect(g); g.connect(actx.destination);
        o.start(t); o.stop(t + 0.6);
      } catch (e) {}
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
