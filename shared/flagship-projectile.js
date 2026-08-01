/* 나나메이트 플래그십 3D 게임 — 캐논 랩 / 포물선 발사 (aboutPhysics/01-mechanics)
 * 슬링샷 조준 → 포물선 명중. 실패 코칭으로 각·속을 배우며, discover→master 10단계.
 * 컨테이너: <div id="nm-flagship"></div>. THREE(r128). 선택: game-kernel.js (teach 패널).
 */
(function () {
  // ───────────────────────────── 순수 로직 (테스트 가능) ─────────────────────────────
  var G = 16;            // 중력(scene units/s^2)
  var LX = -6, LY = 0.6; // 대포 발사 지점
  // stage: discover|practice|challenge|master · wind=수평 가속도 · shotLimit · moveAmp/moveSpeed
  var LEVELS = [
    { x: 4, y: 1.6, stage: 'discover' },
    { x: 5.5, y: 1.5, stage: 'discover' },
    { x: 7, y: 1.8, stage: 'practice' },
    { x: 6.2, y: 3.2, stage: 'practice' },
    { x: 9, y: 1.4, stage: 'practice' },
    { x: 7.5, y: 2.4, wind: 2.2, stage: 'challenge' },
    { x: 8.2, y: 2.0, wind: -2.4, stage: 'challenge' },
    { x: 6.8, y: 2.2, moveAmp: 1.15, moveSpeed: 1.15, stage: 'challenge' },
    { x: 9.2, y: 2.8, shotLimit: 3, stage: 'master' },
    { x: 10, y: 2.2, wind: 1.4, shotLimit: 2, stage: 'master' }
  ];

  var TRANSFER_LINE = '수평면에 가깝게 쏠 때, 같은 속력이면 약 45° 근처에서 사거리가 가장 길다.';

  // 명중 점수: 기본 100 + 발사 수가 적을수록 보너스(최대 60, 음수는 0으로 바닥)
  function hitScore(shots) { return 100 + Math.max(0, 60 - shots * 5); }

  // 포물선 시뮬. wind = 수평 가속도(바람). 명중 반경 1.1 · 지면 y<0.2 · 경계 |x|>16
  function simulateShot(vx, vy, targetX, targetY, dt, wind) {
    dt = dt || 0.016;
    wind = wind || 0;
    var x = LX, y = LY, vX = vx, vY = vy;
    for (var i = 0; i < 20000; i++) {
      vY -= G * dt;
      vX += wind * dt;
      x += vX * dt;
      y += vY * dt;
      if (Math.hypot(x - targetX, y - targetY) < 1.1) return { hit: true, x: x, y: y };
      if (y < 0.2 || x > 16 || x < -16) return { hit: false, x: x, y: y };
    }
    return { hit: false, x: x, y: y };
  }

  // 빗나감 원인 분류 → 코칭 키
  function classifyMiss(endX, endY, targetX, targetY) {
    if (endY < 0.25) {
      if (endX < targetX - 1.0) return 'short';
      if (endX > targetX + 1.0) return 'long';
      return 'under';
    }
    if (endX > 16) return 'long';
    if (endX < -16) return 'back';
    return 'miss';
  }

  function coachFor(outcome, wind) {
    var w = wind || 0;
    var map = {
      short: {
        coach: '너무 짧아요 — 각을 조금 올리거나 더 세게 당겨 보세요',
        coachMid: '착지점이 표적보다 앞입니다. 세기↑ 또는 각도↑',
        coachDeep: '45° 근처에서 같은 세기의 사거리가 가장 깁니다. 지금보다 세게·조금 높게'
      },
      long: {
        coach: '너무 길어요 — 당김을 줄이거나 각을 낮춰 보세요',
        coachMid: '착지점이 표적보다 뒤입니다. 세기↓',
        coachDeep: '세기를 눈에 띄게 줄이고, 높은 표적이면 각만 살짝 유지'
      },
      under: {
        coach: '거의 밑을 스쳤어요 — 각을 조금 더 올려 높이 맞춰 보세요',
        coachMid: '수평 거리는 비슷한 데 높이가 부족합니다. 각도↑',
        coachDeep: '표적 높이까지 올리려면 같은 거리에서 각을 키우세요'
      },
      back: {
        coach: '뒤로 갔어요 — 대포 반대쪽으로 당기세요(슬링샷)',
        coachMid: '조준 방향이 반대입니다. 표적 쪽으로 당겼다 놓기',
        coachDeep: '당긴 방향의 반대로 날아갑니다. 표적 쪽을 향해 당기세요'
      },
      miss: {
        coach: '빗나감 — 궤적 점선을 보고 각·세기를 미세 조정',
        coachMid: '한 번에 크게 바꾸지 말고 각 또는 세기 하나만 조정',
        coachDeep: '프리뷰 점선이 표적을 스치게 맞춘 뒤 발사'
      },
      wind: {
        coach: '바람 단계 — 궤적이 옆으로 밀립니다. 바람 반대로 보정',
        coachMid: w > 0 ? '오른쪽 바람 → 조금 더 세게 또는 왼쪽 여유' : '왼쪽 바람 → 보정 조준',
        coachDeep: '바람이 수평 속도를 바꿉니다. 프리뷰로 휜 궤적을 확인'
      },
      limit: {
        coach: '발사 횟수 초과 — 신중히. 프리뷰로 궤적을 확인한 뒤',
        coachMid: '한 발의 가치↑ — 각과 세기를 천천히 맞추세요',
        coachDeep: '마스터 단계: 프리뷰 끝점이 표적 근처일 때만 놓으세요'
      }
    };
    return map[outcome] || map.miss;
  }

  // 레벨이 명중 가능한 조준이 있는지 그리드 탐색(테스트·밸런스용)
  function levelSolvable(level, step) {
    step = step || 2;
    var wind = level.wind || 0;
    var tx = level.x, ty = level.y;
    for (var spd = 6; spd <= 22; spd += step) {
      for (var deg = 15; deg <= 75; deg += step) {
        var r = (deg * Math.PI) / 180;
        var res = simulateShot(spd * Math.cos(r), spd * Math.sin(r), tx, ty, 1 / 120, wind);
        if (res.hit) return { ok: true, speed: spd, deg: deg };
      }
    }
    return { ok: false };
  }

  var LOGIC = {
    G: G, LX: LX, LY: LY,
    LEVELS: LEVELS,
    TRANSFER_LINE: TRANSFER_LINE,
    hitScore: hitScore,
    simulateShot: simulateShot,
    classifyMiss: classifyMiss,
    coachFor: coachFor,
    levelSolvable: levelSolvable
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = LOGIC; }
  if (typeof window !== 'undefined') { window.NM_PROJECTILE_LOGIC = LOGIC; }

  // ───────────────────────────── 3D 게임 (브라우저 전용) ─────────────────────────────
  function init() {
    if (typeof document === 'undefined') return;
    var host = document.getElementById('nm-flagship');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    // prefers-reduced-motion 게이트 — 셰이크·파티클·구름 드리프트·marching dots를 끈다 (learngame3d.js:12와 동일 패턴)
    var RM = false; try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    var W = host.clientWidth || 640, H = 340;
    var CAMX = 1, CAMY = 6, CAMZ = 17;
    var scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(48, W / H, 0.1, 200);
      cam.position.set(CAMX, CAMY, CAMZ); cam.lookAt(1, 2.2, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    var kernel =
      window.NMGameKernel && typeof window.NMGameKernel.create === 'function'
        ? window.NMGameKernel.create(host, { gameId: 'projectile' })
        : null;
    // 새벽 하늘: 딥블루 → 호라이즌 오렌지 그라디언트(캔버스 배경, 외부 에셋 0)
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:crosshair;touch-action:none;display:block;background:linear-gradient(180deg,#0b1026 0%,#1d2b5e 38%,#54387a 62%,#c75b39 82%,#f2a35c 100%)';
    host.appendChild(rndr.domElement);

    // 이징(라이브러리 금지 — 직접 구현)
    function easeOutElastic(t) { if (t <= 0) return 0; if (t >= 1) return 1; var c4 = (2 * Math.PI) / 3; return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1; }
    function easeOutBack(t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

    // 새벽 조명 + 원경 안개
    scene.fog = new THREE.Fog(0x3b2f5e, 26, 78);
    scene.add(new THREE.AmbientLight(0xbcc7ff, 0.7));
    var dl = new THREE.DirectionalLight(0xffc08a, 0.9); dl.position.set(-6, 7, 9); scene.add(dl);

    // 캔버스 합성 텍스처(radial-gradient) — 글로우/연기/구름 공용
    function radialTex(stops) {
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
      for (var i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }
    var glowTex = radialTex([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,214,130,.85)'], [1, 'rgba(255,170,50,0)']]);
    var softTex = radialTex([[0, 'rgba(255,255,255,.95)'], [0.5, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]);

    // 원경 저폴리 언덕 실루엣 2겹(서로 다른 z — 깊이감)
    function hills(color, z, amp, lift) {
      var sh = new THREE.Shape(); sh.moveTo(-70, -4);
      for (var x = -70; x <= 70; x += 5) sh.lineTo(x, lift + amp * (0.55 + 0.45 * Math.sin(x * 0.11 + z)) + 0.7 * Math.sin(x * 0.33 + z * 2.1));
      sh.lineTo(70, -4);
      var m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: color }));
      m.position.z = z; scene.add(m); return m;
    }
    hills(0x121834, -26, 5.5, 1.4);
    hills(0x1e2650, -16, 3.2, 0.3);

    // 구름 스프라이트 4개 — 서로 다른 속도로 x축 드리프트(시차)
    var cloudMat = new THREE.SpriteMaterial({ map: softTex, transparent: true, opacity: 0.4, depthWrite: false });
    var clouds = [];
    for (var ci = 0; ci < 4; ci++) {
      var cl = new THREE.Sprite(cloudMat);
      cl.position.set(-26 + ci * 15, 6.5 + (ci % 2) * 2.4, -12 - ci * 3);
      cl.scale.set(7 + ci * 2.2, 2 + (ci % 2) * 0.9, 1);
      cl.userData.sp = 0.25 + ci * 0.2; scene.add(cl); clouds.push(cl);
    }

    // 지면
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshLambertMaterial({ color: 0x123c26 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = 0; scene.add(ground);
    var grid = new THREE.GridHelper(60, 30, 0x27593c, 0x1c4530); grid.position.y = 0.01; scene.add(grid);

    // 대포
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 0.8, 16), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    base.position.set(LX, 0.4, 0); scene.add(base);
    var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 2.4, 14), new THREE.MeshLambertMaterial({ color: 0x64748b }));
    barrel.position.set(LX, LY, 0); scene.add(barrel);

    // 발사체(캔버스 텍스처 → 자전이 보이게) + additive 글로우 빌보드
    var ballCanvas = document.createElement('canvas'); ballCanvas.width = ballCanvas.height = 64;
    var bctx = ballCanvas.getContext('2d');
    bctx.fillStyle = '#facc15'; bctx.fillRect(0, 0, 64, 64);
    bctx.fillStyle = '#b45309';
    for (var bi = 0; bi < 4; bi++) { bctx.beginPath(); bctx.arc(16 + (bi % 2) * 32, 16 + ((bi / 2) | 0) * 32, 7, 0, Math.PI * 2); bctx.fill(); }
    var ball = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 18), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(ballCanvas), emissive: 0x664f00, metalness: 0.3, roughness: 0.4 }));
    ball.visible = false; scene.add(ball);
    var ballGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.85, depthWrite: false }));
    ballGlow.scale.set(1.5, 1.5, 1); ball.add(ballGlow);

    // 표적(토러스)
    var target = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.18, 12, 28), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x5b1212 }));
    target.position.set(4, 1.6, 0); scene.add(target);
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), new THREE.MeshLambertMaterial({ color: 0x9ca3af }));
    pole.position.set(4, 0.8, 0); scene.add(pole);

    // 궤적 미리보기 점(marching dots — 위치는 loop에서 시간 오프셋으로 갱신)
    var preview = []; for (var i = 0; i < 26; i++) { var d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })); d.visible = false; scene.add(d); preview.push(d); }

    // 트레일: 풀링된 additive 글로우 스프라이트(공유 material, 40개 순환 재사용 — 페이드는 scale 감쇠)
    var trailMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
    var TRAIL_N = 40, trailPool = [], trailHead = 0;
    for (var ti = 0; ti < TRAIL_N; ti++) { var tsp = new THREE.Sprite(trailMat); tsp.visible = false; tsp.userData.life = 0; scene.add(tsp); trailPool.push(tsp); }

    // 파편 풀(공유 geometry + 공유 material 2종, 상한 30 순환)
    var shardGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    var goldMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    var dustMat = new THREE.MeshBasicMaterial({ color: 0x8a6f4d });
    var shards = [], shardHead = 0;
    for (var si = 0; si < 30; si++) { var sd0 = new THREE.Mesh(shardGeo, goldMat); sd0.visible = false; sd0.userData.v = new THREE.Vector3(); sd0.userData.life = 0; sd0.userData.spin = 0; scene.add(sd0); shards.push(sd0); }

    // 연기/흙먼지 퍼프 풀(10개 — 초기화 때 1회 생성, 개별 페이드가 필요해 material만 각자 소유)
    var smokes = [], smokeHead = 0;
    for (var pi0 = 0; pi0 < 10; pi0++) { var smk = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, transparent: true, opacity: 0, depthWrite: false })); smk.visible = false; smk.userData.life = 0; scene.add(smk); smokes.push(smk); }

    // 머즐 플래시(1개 재사용) + 쇼크웨이브 링(1개 재사용)
    var flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false }));
    flash.visible = false; scene.add(flash); var flashLife = 0;
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.8, 40), new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
    ring.visible = false; scene.add(ring); var ringLife = 0;

    var lvl = 0, score = 0, shots = 0, levelShots = 0, combo = 0, dispScore = 0, hudExtra = '';
    var cleared = false, levelT0 = 0;

    // HUD
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:10px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);pointer-events:none;line-height:1.5';
    host.appendChild(hud);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;right:10px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#e5e7eb;text-shadow:0 1px 3px rgba(0,0,0,.6);pointer-events:none;text-align:right';
    tip.textContent = '당겼다 놓아 조준 · 빗나가면 왜인지 알려줘요 · 45°≈최대 사거리';
    host.appendChild(tip);
    // 진행 미니 바
    var barWrap = document.createElement('div');
    barWrap.style.cssText = 'position:absolute;right:10px;top:12px;width:110px;height:6px;border-radius:3px;background:rgba(255,255,255,.22);overflow:hidden;pointer-events:none';
    var barFill = document.createElement('div');
    barFill.style.cssText = 'height:100%;width:0%;border-radius:3px;background:linear-gradient(90deg,#fbbf24,#f97316);transition:width .5s ease';
    barWrap.appendChild(barFill); host.appendChild(barWrap);
    function stageLabel(s) {
      return s === 'discover' ? '발견' : s === 'practice' ? '연습' : s === 'challenge' ? '도전' : s === 'master' ? '마스터' : '';
    }
    function setBar() { barFill.style.width = Math.round(Math.min(lvl, LEVELS.length) / LEVELS.length * 100) + '%'; }
    function renderHud() {
      var L = LEVELS[Math.min(lvl, LEVELS.length - 1)] || {};
      var lim = L.shotLimit ? ' · 잔여 ' + Math.max(0, L.shotLimit - levelShots) + '발' : '';
      var wind = L.wind ? ' · 바람 ' + (L.wind > 0 ? '→' : '←') : '';
      var best = kernel ? kernel.getBest() : 0;
      hud.innerHTML =
        '🏆 ' + Math.round(dispScore) + '점' + (best ? ' · 최고 ' + best : '') +
        ' · ' + stageLabel(L.stage) + ' ' + Math.min(lvl + 1, LEVELS.length) + '/' + LEVELS.length +
        ' · 발사 ' + shots + lim + wind +
        (combo >= 2 ? ' · 🔥×' + combo : '') +
        (hudExtra ? '<br>' + hudExtra : '');
    }
    function setHud(extra) { hudExtra = extra || ''; renderHud(); }

    // 명중 점수 DOM 팝업(+n) — learngame3d.js floatText 스타일(절대배치+상승+페이드)
    function scorePop(gained) {
      var v = new THREE.Vector3(target.position.x, target.position.y, target.position.z).project(cam);
      var px = (v.x * 0.5 + 0.5) * (host.clientWidth || W), py = (-v.y * 0.5 + 0.5) * H;
      var f = document.createElement('div');
      f.textContent = '+' + gained;
      f.style.cssText = 'position:absolute;left:' + Math.round(px) + 'px;top:' + Math.round(py - 18) + 'px;transform:translate(-50%,0);font:800 20px "Noto Sans KR",sans-serif;color:#fde047;text-shadow:0 2px 8px rgba(0,0,0,.75);pointer-events:none;opacity:1;transition:transform .8s ease-out,opacity .8s ease-out;z-index:5';
      host.appendChild(f);
      setTimeout(function () { f.style.transform = 'translate(-50%,-40px)'; f.style.opacity = '0'; }, 30);
      setTimeout(function () { f.remove(); }, 900);
    }

    var popT = 1; // 표적 등장 팝(easeOutBack) 진행도
    var baseTX = 4, baseTY = 1.6;
    function placeTarget() {
      var L = LEVELS[lvl];
      baseTX = L.x; baseTY = L.y;
      levelShots = 0;
      levelT0 = performance.now ? performance.now() : Date.now();
      target.position.set(L.x, L.y, 0);
      pole.position.set(L.x, L.y / 2, 0);
      pole.scale.y = L.y / 1.6;
      if (RM) { popT = 1; target.scale.set(1, 1, 1); } else { popT = 0; target.scale.set(0.001, 0.001, 0.001); }
      if (L.wind && kernel) {
        kernel.teach({ kind: 'hint', coach: coachFor('wind', L.wind).coach });
      } else if (L.shotLimit && kernel) {
        kernel.teach({ kind: 'hint', coach: '이번 단계 발사 ' + L.shotLimit + '발 제한 — 프리뷰를 믿으세요' });
      } else if (L.moveAmp && kernel) {
        kernel.teach({ kind: 'hint', coach: '표적이 움직입니다 — 궤적과 타이밍을 맞춰 보세요' });
      }
    }
    placeTarget(); setBar(); setHud();

    // 발사 물리 상태
    var flying = false, vel = new THREE.Vector3(), pos = new THREE.Vector3();
    function resetBall() { flying = false; ball.visible = false; clearTrail(); }
    function clearTrail() { for (var i = 0; i < TRAIL_N; i++) { trailPool[i].visible = false; trailPool[i].userData.life = 0; } }

    // 카메라 셰이크(0.25s 감쇠 노이즈)·빗나감 딥
    var shakeT = 0, shakeDur = 1, shakeAmp = 0, dipT = 0, dipDur = 1, dipAmp = 0;
    function shake(amp, dur) { if (RM) return; shakeAmp = amp; shakeT = dur; shakeDur = dur; }
    function dip(amp) { if (RM) return; dipAmp = amp; dipT = 0.35; dipDur = 0.35; }

    function shockwave(p) { if (RM) return; ring.position.set(p.x, p.y, 0.15); ring.scale.set(0.5, 0.5, 1); ring.material.opacity = 0.9; ringLife = 1; ring.visible = true; }

    function burst(p, mat, n) {
      if (RM) return;
      for (var i = 0; i < n && i < shards.length; i++) {
        var s = shards[shardHead++ % shards.length];
        s.visible = true; s.material = mat; s.position.copy(p);
        var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
        s.userData.v.set(Math.cos(a) * Math.sin(b), Math.abs(Math.cos(b)) * 0.9 + 0.5, Math.sin(a) * Math.sin(b)).multiplyScalar(3.5 + Math.random() * 4);
        s.userData.life = 0.65 + Math.random() * 0.3; s.userData.spin = 5 + Math.random() * 8;
        s.scale.set(1, 1, 1);
      }
    }

    function puff(x, y, hex, vx0) {
      if (RM) return;
      var sm = smokes[smokeHead++ % smokes.length];
      sm.visible = true; sm.material.color.setHex(hex); sm.material.opacity = 0.5;
      sm.position.set(x + (Math.random() - 0.5) * 0.5, Math.max(0.3, y + (Math.random() - 0.5) * 0.4), 0.3);
      var sc = 0.7 + Math.random() * 0.6; sm.scale.set(sc, sc, 1);
      sm.userData.life = 1; sm.userData.vx = typeof vx0 === 'number' ? vx0 : (Math.random() - 0.5) * 0.8; sm.userData.vy = 0.9 + Math.random() * 0.7;
    }

    // 포신 반동(발사 반대방향 0.3 → easeOutElastic 복귀)
    var recoilT = 1, recoilVec = new THREE.Vector2();

    function launch(vx, vy) {
      if (cleared) return;
      var L = LEVELS[lvl];
      if (L.shotLimit && levelShots >= L.shotLimit) {
        var limC = coachFor('limit');
        if (kernel) kernel.teach({ kind: 'fail', outcome: 'limit', coach: limC.coach, coachMid: limC.coachMid, coachDeep: limC.coachDeep });
        else setHud(limC.coach);
        return;
      }
      flying = true; shots++; levelShots++; ball.visible = true;
      pos.set(LX, LY, 0); ball.position.copy(pos); vel.set(vx, vy, 0);
      hidePreview(); beep(220, 0.12, 'sawtooth'); boom(); setHud();
      var ang = Math.atan2(vy, vx), ax = Math.cos(ang), ay = Math.sin(ang);
      if (!RM) {
        recoilT = 0; recoilVec.set(-ax * 0.3, -ay * 0.3);
        flash.position.set(LX + ax * 1.45, LY + ay * 1.45, 0.2); flash.scale.set(2.6, 2.6, 1); flash.material.opacity = 1; flashLife = 1; flash.visible = true;
        for (var i = 0; i < 4; i++) puff(LX + ax * (1.2 + i * 0.3), LY + ay * (1.2 + i * 0.3), 0x9aa3b2, ax * 0.6);
      }
    }

    // 조준(슬링샷): 당긴 반대 방향으로, 당긴 길이만큼 세게
    var aiming = false, sx = 0, sy = 0, aimOn = false, aimVX = 0, aimVY = 0;
    function toLocal(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return { x: p.clientX - r.left, y: p.clientY - r.top }; }
    function aimVec(cx, cy) {
      var dx = cx - sx, dy = cy - sy;            // 당긴 벡터(화면)
      var vx = -dx * 0.06, vy = dy * 0.06;        // 반대 방향, 화면 아래로 당기면 위로 발사
      var sp = Math.hypot(vx, vy), MAX = 22;
      if (sp > MAX) { vx *= MAX / sp; vy *= MAX / sp; }
      return { vx: vx, vy: vy };
    }
    function showPreview(vx, vy) {
      aimOn = true; aimVX = vx; aimVY = vy;
      // 당김 세기에 따라 흰 → 주황 보간
      var pw = Math.min(1, Math.hypot(vx, vy) / 22);
      for (var i = 0; i < preview.length; i++) { preview[i].material.color.setRGB(1, 1 - 0.38 * pw, 1 - 0.8 * pw); preview[i].material.opacity = 0.45 + 0.4 * pw; }
      // 각도 HUD
      var ang = Math.round(Math.atan2(vy, vx) * 180 / Math.PI), spd = Math.round(Math.hypot(vx, vy));
      setHud('조준 ' + ang + '° · 세기 ' + spd);
    }
    function hidePreview() { aimOn = false; for (var i = 0; i < preview.length; i++) preview[i].visible = false; }

    function onDown(e) { if (flying) return; aiming = true; var p = toLocal(e); sx = p.x; sy = p.y; e.preventDefault(); }
    function onMove(e) { if (!aiming || flying) return; var p = toLocal(e); var v = aimVec(p.x, p.y); barrel.rotation.z = Math.atan2(v.vy, v.vx) - Math.PI / 2; showPreview(v.vx, v.vy); e.preventDefault(); }
    function onUp(e) { if (!aiming || flying) return; aiming = false; var p = toLocal(e.changedTouches ? { touches: e.changedTouches } : e); var v = aimVec(p.x, p.y); if (Math.hypot(v.vx, v.vy) < 2) { hidePreview(); setHud(); return; } launch(v.vx, v.vy); e.preventDefault(); }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    function restartRun() {
      cleared = false;
      lvl = 0; combo = 0; shots = 0; score = 0; dispScore = 0;
      el.style.pointerEvents = '';
      if (kernel) kernel.resetStreak();
      placeTarget(); setBar(); setHud();
    }
    function hit() {
      var gained = hitScore(levelShots);
      score += gained; combo++;
      var pitch = Math.min(3.2, Math.pow(1.12, combo - 1));
      beep(880 * pitch, 0.1, 'sine'); setTimeout(function () { beep(1320 * pitch, 0.14, 'sine'); }, 90);
      burst(target.position, goldMat, 30);
      shockwave(target.position); shake(0.22, 0.25); scorePop(gained);
      resetBall();
      if (kernel) kernel.teach({ kind: 'success', coach: combo >= 2 ? '명중! 콤보 ×' + combo : '명중! 궤적이 표적과 맞았어요' });
      lvl++; setBar();
      if (lvl >= LEVELS.length) {
        cleared = true;
        flying = false;
        el.style.pointerEvents = 'none';
        chime();
        if (kernel) {
          kernel.saveBest(score);
          kernel.teach({
            kind: 'clear',
            transfer: TRANSFER_LINE,
            onAgain: restartRun
          });
        } else {
          setHud('🎉 클리어! ' + TRANSFER_LINE);
          setTimeout(restartRun, 3200);
        }
      } else {
        placeTarget();
        setHud(combo >= 2 ? '명중! 🔥 콤보 ×' + combo : '명중! 다음 표적');
      }
    }
    function miss(p) {
      combo = 0;
      var L = LEVELS[lvl] || {};
      var outcome = classifyMiss(p.x, p.y, target.position.x, target.position.y);
      if (L.wind && (outcome === 'short' || outcome === 'long' || outcome === 'miss')) {
        // 바람 단계에서는 바람 코칭을 우선 노출할 때가 많음
        if (Math.abs(L.wind) >= 1.5 && Math.random() < 0.45) outcome = 'wind';
      }
      var c = coachFor(outcome, L.wind);
      burst(p, dustMat, 18);
      puff(p.x, Math.max(0.5, p.y), 0xa78b62); puff(p.x + 0.5, Math.max(0.4, p.y), 0x8a744f); puff(p.x - 0.5, Math.max(0.4, p.y), 0x9c8258);
      dip(0.3); beep(150, 0.16, 'square');
      resetBall();
      if (kernel) kernel.teach({ kind: 'fail', outcome: outcome, coach: c.coach, coachMid: c.coachMid, coachDeep: c.coachDeep });
      else setHud(c.coach);
      if (L.shotLimit && levelShots >= L.shotLimit) {
        var limC = coachFor('limit');
        if (kernel) kernel.teach({ kind: 'fail', outcome: 'limit', coach: limC.coach, coachMid: limC.coachMid, coachDeep: limC.coachDeep });
        levelShots = 0; // 재도전 허용(같은 단계 유지)
        setHud('발사 소진 — 같은 단계 재도전');
      }
    }

    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop); var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      target.rotation.y += 0.03; target.rotation.x = 0.4 + 0.15 * Math.sin(ts / 600);

      // 표적 등장 팝(easeOutBack scale 0→1)
      if (popT < 1) { popT = Math.min(1, popT + dt / 0.45); var ps = Math.max(0.001, easeOutBack(popT)); target.scale.set(ps, ps, ps); }

      // 구름 시차 드리프트
      if (!RM) for (var c2 = 0; c2 < clouds.length; c2++) { var cd = clouds[c2]; cd.position.x += cd.userData.sp * dt; if (cd.position.x > 34) cd.position.x = -34; }

      // 포신 반동 복귀
      if (recoilT < 1) { recoilT = Math.min(1, recoilT + dt / 0.55); var rk = 1 - easeOutElastic(recoilT); barrel.position.set(LX + recoilVec.x * rk, LY + recoilVec.y * rk, 0); }

      // 조준 미리보기 — 바람 포함 적분(실제 발사와 동일)
      if (aimOn) {
        var phase = RM ? 0 : (ts * 0.0022) % 1;
        var windP = (LEVELS[Math.min(lvl, LEVELS.length - 1)] || {}).wind || 0;
        var pvX = aimVX, pvY = aimVY, px = LX, py = LY, step = 0.018;
        var samples = [];
        for (var si = 0; si < 80; si++) {
          pvY -= G * step; pvX += windP * step; px += pvX * step; py += pvY * step;
          if (py < 0.05 || px > 16 || px < -16) break;
          samples.push({ x: px, y: py });
        }
        for (var pd = 0; pd < preview.length; pd++) {
          var idx = Math.min(samples.length - 1, Math.floor((pd + phase) / preview.length * samples.length));
          if (!samples.length || idx < 0) { preview[pd].visible = false; continue; }
          preview[pd].visible = true;
          preview[pd].position.set(samples[idx].x, samples[idx].y, 0);
        }
      }

      // 이동 표적
      var Lc = LEVELS[Math.min(lvl, LEVELS.length - 1)] || {};
      if (Lc.moveAmp && !cleared) {
        var tsec = ((performance.now ? performance.now() : Date.now()) - levelT0) / 1000;
        var mx = baseTX + Lc.moveAmp * Math.sin(tsec * (Lc.moveSpeed || 1));
        target.position.x = mx;
        pole.position.x = mx;
      }

      if (flying) {
        // simulateShot()과 동일: 중력 + wind 가속도
        var windA = Lc.wind || 0;
        vel.y -= G * dt;
        vel.x += windA * dt;
        pos.addScaledVector(vel, dt); ball.position.copy(pos);
        ball.rotation.z -= vel.x * dt * 1.4; ball.rotation.x += 2.2 * dt;
        if (!RM) { var tp = trailPool[trailHead++ % TRAIL_N]; tp.visible = true; tp.position.copy(pos); tp.userData.life = 1; }
        if (pos.distanceTo(target.position) < 1.1) hit();
        else if (pos.y < 0.2 || pos.x > 16 || pos.x < -16) miss(pos.clone());
      }

      // 트레일 페이드(공유 material → scale 감쇠)
      for (var t2 = 0; t2 < TRAIL_N; t2++) { var tr = trailPool[t2]; if (!tr.visible) continue; tr.userData.life -= dt * 1.7; if (tr.userData.life <= 0) { tr.visible = false; continue; } var tls = 0.12 + 0.6 * tr.userData.life; tr.scale.set(tls, tls, 1); }

      // 머즐 플래시(1~2프레임 글로우)
      if (flash.visible) { flashLife -= dt / 0.09; if (flashLife <= 0) flash.visible = false; else flash.material.opacity = Math.max(0, flashLife); }

      // 연기/흙먼지 퍼프(상승·확산·페이드)
      for (var s2 = 0; s2 < smokes.length; s2++) { var sm = smokes[s2]; if (!sm.visible) continue; sm.userData.life -= dt / 0.9; if (sm.userData.life <= 0) { sm.visible = false; continue; } sm.position.x += sm.userData.vx * dt; sm.position.y += sm.userData.vy * dt; var gs = 1 + 1.5 * dt; sm.scale.x *= gs; sm.scale.y *= gs; sm.material.opacity = 0.5 * sm.userData.life; }

      // 파편(중력·자전·수명)
      for (var h2 = 0; h2 < shards.length; h2++) { var sd = shards[h2]; if (!sd.visible) continue; sd.userData.life -= dt; if (sd.userData.life <= 0) { sd.visible = false; continue; } sd.userData.v.y -= 9 * dt; sd.position.addScaledVector(sd.userData.v, dt); sd.rotation.x += sd.userData.spin * dt; sd.rotation.z += sd.userData.spin * 0.7 * dt; var ss = Math.min(1, sd.userData.life * 1.6); sd.scale.set(ss, ss, ss); }

      // 쇼크웨이브 링(확장+페이드)
      if (ring.visible) { ringLife -= dt / 0.5; if (ringLife <= 0) ring.visible = false; else { var rs = 0.5 + (1 - ringLife) * 3.6; ring.scale.set(rs, rs, 1); ring.material.opacity = 0.9 * ringLife; } }

      // 카메라 셰이크(감쇠 노이즈)·딥 — 매 프레임 base에서 재계산해 원위치 보장
      var ox = 0, oy = 0;
      if (shakeT > 0) { shakeT -= dt; var sk = Math.max(0, shakeT / shakeDur) * shakeAmp; ox += (Math.random() * 2 - 1) * sk; oy += (Math.random() * 2 - 1) * sk; }
      if (dipT > 0) { dipT -= dt; oy -= Math.sin((1 - Math.max(0, dipT) / dipDur) * Math.PI) * dipAmp; }
      cam.position.set(CAMX + ox, CAMY + oy, CAMZ);

      // 점수 카운트업 트윈
      if (dispScore !== score) { if (RM) dispScore = score; else dispScore = Math.min(score, dispScore + Math.max(90 * dt, (score - dispScore) * 7 * dt)); renderHud(); }

      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // 사운드 — kernel 뮤트와 동기
    var actx = null;
    function isMuted() { return kernel ? kernel.isMuted() : false; }
    function beep(f, d, type) {
      if (isMuted()) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
        var t = actx.currentTime;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.start(t); o.stop(t + d + 0.02);
      } catch (e) {}
    }
    function boom() {
      if (isMuted()) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        var len = Math.floor(actx.sampleRate * 0.4), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
        var src = actx.createBufferSource(); src.buffer = buf;
        var fl = actx.createBiquadFilter(); fl.type = 'lowpass';
        var g = actx.createGain(), t = actx.currentTime;
        fl.frequency.setValueAtTime(1500, t); fl.frequency.exponentialRampToValueAtTime(120, t + 0.35);
        g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        src.connect(fl); fl.connect(g); g.connect(actx.destination); src.start(t);
      } catch (e) {}
    }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
