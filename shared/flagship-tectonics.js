/* 나나메이트 플래그십 3D 게임 — 판 구조 (aboutEarthScience/02-plate-tectonics)
 * 두 지각판(블록)을 마우스/터치로 드래그해 경계 운동을 만든다:
 *   수렴(서로 다가감) → 충돌해 솟음(습곡산맥) / 해양판 섭입(해구·화산호)
 *   발산(서로 멀어짐) → 사이로 마그마가 올라와 해령·열곡 형성
 *   보존(서로 반대로 어긋남) → 변환단층(수평으로 스쳐 지남)
 * 각 라운드 프롬프트가 요구하는 경계 유형의 운동을 수행하면 해당 지형이 3D로 솟아오르고 클리어.
 * 실제 판구조 개념(수렴/발산/변환, 산맥/해구/해령/변환단층)에 충실.
 * 컨테이너: <div id="nm-tectonics"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문(graceful).
 * 연출: 태양 글로우·드리프트 구름·마그마 맨틀 펄스, 드래그 먼지+럼블, 지진 셰이크,
 *        easeOutBack 지형 트윈, 증기/용암/파편 파티클(풀링), 합성 사운드.
 *        prefers-reduced-motion 이면 셰이크·럼블·파티클을 끈다.
 */
(function () {
  'use strict';

  /* ===================== 순수 로직 (테스트 가능) ===================== */
  /* 두 판의 변위(displacement)로 경계 운동을 분류한다.
   * 좌표계: x축은 두 판을 가르는 경계에 수직(좌판은 음의 x, 우판은 양의 x 영역),
   *        z축은 경계를 따라가는 방향(transform 운동의 축).
   * dL = {x,z}: 왼쪽 판의 변위,  dR = {x,z}: 오른쪽 판의 변위.
   * - 수렴(convergent): 두 판의 x방향 상대운동이 서로 다가감 (간격이 줄어듦).
   * - 발산(divergent):  두 판의 x방향 상대운동이 서로 멀어짐 (간격이 늘어남).
   * - 보존/변환(transform): x방향 변화는 작고, z방향으로 서로 반대(엇갈림)로 움직임.
   */
  function classifyMotion(dL, dR, opts) {
    opts = opts || {};
    var MOVE_MIN = opts.moveMin != null ? opts.moveMin : 0.25; // 의미있는 운동으로 인정할 최소 변위
    var DOMINANCE = opts.dominance != null ? opts.dominance : 1.25; // 한 축이 다른 축을 지배한다고 볼 비율

    // 경계에 수직(x) 방향 상대 접근/이탈. 음수면 가까워짐(수렴), 양수면 멀어짐(발산).
    var relX = dR.x - dL.x;            // 우판이 좌판 대비 +x로 더 가면 멀어짐
    // 경계를 따라가는(z) 방향 상대 엇갈림.
    var relZ = dR.z - dL.z;

    var aX = Math.abs(relX), aZ = Math.abs(relZ);

    // 아무 의미있는 운동도 없음
    if (aX < MOVE_MIN && aZ < MOVE_MIN) return { type: 'none', relX: relX, relZ: relZ };

    // 변환(보존): z 엇갈림이 x 접근/이탈을 지배
    if (aZ >= aX * DOMINANCE && aZ >= MOVE_MIN) return { type: 'transform', relX: relX, relZ: relZ };

    // 수렴/발산: x 운동이 지배적
    if (aX >= aZ * DOMINANCE && aX >= MOVE_MIN) {
      return { type: relX < 0 ? 'convergent' : 'divergent', relX: relX, relZ: relZ };
    }

    // 어느 쪽도 명확히 지배하지 못함(대각선) → 모호
    return { type: 'ambiguous', relX: relX, relZ: relZ };
  }

  /* 라운드 승리 판정: 분류된 운동 타입이 요구된 경계 타입과 일치하는가. */
  function isWin(requiredType, motion) {
    return !!motion && motion.type === requiredType;
  }

  /* 수렴 경계의 결과 지형: 두 판의 밀도 차이로 섭입 여부를 결정.
   * 대륙-대륙(둘 다 대륙)이면 섭입 불가 → 습곡산맥. 그 외(해양 포함)는 섭입 → 해구+화산호. */
  function convergentLandform(leftType, rightType) {
    if (leftType === 'continental' && rightType === 'continental') return 'mountain'; // 히말라야형
    return 'trench'; // 안데스/일본형 (섭입)
  }

  /* 라운드 정의 (실제 판구조 사실 기반). */
  var ROUNDS = [
    {
      required: 'convergent', leftType: 'continental', rightType: 'continental',
      prompt: '두 대륙판을 서로 밀어붙여 습곡산맥을 만드세요',
      hint: '두 블록을 가운데로 끌어 충돌시키면 둘 다 솟아 산맥이 됩니다',
      fact: '대륙-대륙 수렴: 둘 다 가벼워 섭입하지 못하고 솟아 습곡산맥이 됩니다. 예) 히말라야'
    },
    {
      required: 'divergent', leftType: 'oceanic', rightType: 'oceanic',
      prompt: '두 판을 서로 벌려 해령(중앙해령)을 만드세요',
      hint: '두 블록을 바깥쪽으로 끌어 벌리면 사이로 마그마가 올라옵니다',
      fact: '발산 경계: 판이 벌어지며 맨틀이 솟아 새 해양지각·해령이 생깁니다. 예) 대서양 중앙해령'
    },
    {
      required: 'transform', leftType: 'oceanic', rightType: 'continental',
      prompt: '두 판을 서로 반대로 어긋나게 밀어 변환단층을 만드세요',
      hint: '한 블록은 앞으로, 다른 블록은 뒤로 (서로 반대 방향으로) 미끄러뜨리세요',
      fact: '변환(보존) 경계: 판이 수평으로 스쳐 지나가며 지각이 생기지도 사라지지도 않습니다. 예) 산안드레아스 단층'
    },
    {
      required: 'convergent', leftType: 'oceanic', rightType: 'continental',
      prompt: '해양판을 대륙판 쪽으로 밀어 섭입(해구·화산호)을 만드세요',
      hint: '두 블록을 가운데로 끌어 충돌시키면 무거운 해양판이 아래로 섭입합니다',
      fact: '해양-대륙 수렴: 무거운 해양판이 섭입해 해구와 화산호가 생깁니다. 예) 안데스 산맥'
    }
  ];

  /* 노출 (헤드리스 테스트용) */
  var LOGIC = {
    classifyMotion: classifyMotion,
    isWin: isWin,
    convergentLandform: convergentLandform,
    ROUNDS: ROUNDS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = LOGIC;
  if (typeof window !== 'undefined') window.NM_TECTONICS_LOGIC = LOGIC;

  /* ===================== 3D / DOM (브라우저) ===================== */
  function init() {
    if (typeof document === 'undefined') return;
    var host = document.getElementById('nm-tectonics');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    // 모션 최소화 선호 시 셰이크·럼블·파티클·드리프트를 끈다.
    var RM = false;
    try { RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e0) {}

    var W = host.clientWidth || 640, H = 380, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 200);
      cam.position.set(0, 8.5, 13); cam.lookAt(0, -0.3, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative'; host.style.overflow = 'hidden';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:grab;touch-action:none;display:block;background:linear-gradient(180deg,#7fbdf2 0%,#b7e0ff 30%,#eaf6ff 44%,#ffe9c2 54%,#bfe0ff 68%,#9fd0f2 100%)';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var dl = new THREE.DirectionalLight(0xfff3df, 0.6); dl.position.set(-4, 10, 6); scene.add(dl);

    /* ---- 배경: 태양 글로우 스프라이트 + 캔버스 구름(시차 드리프트) ---- */
    function radialSpriteTex(stops, size) {
      var c = document.createElement('canvas'); c.width = c.height = size;
      var g = c.getContext('2d');
      var gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      for (var i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
      g.fillStyle = gr; g.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }
    var sun = new THREE.Sprite(new THREE.SpriteMaterial({
      map: radialSpriteTex([[0, 'rgba(255,252,235,1)'], [0.22, 'rgba(255,238,170,0.95)'], [0.55, 'rgba(255,214,110,0.35)'], [1, 'rgba(255,200,90,0)']], 128),
      transparent: true, depthWrite: false
    }));
    sun.position.set(-7.5, 2.4, -16); sun.scale.set(6.5, 6.5, 1); scene.add(sun);

    function cloudTexture() {
      var c = document.createElement('canvas'); c.width = 200; c.height = 100;
      var g = c.getContext('2d');
      var puffs = [[52, 62, 26], [88, 50, 32], [130, 58, 28], [70, 70, 22], [112, 70, 24], [158, 68, 18]];
      for (var i = 0; i < puffs.length; i++) {
        var p = puffs[i], gr = g.createRadialGradient(p[0], p[1], p[2] * 0.15, p[0], p[1], p[2]);
        gr.addColorStop(0, 'rgba(255,255,255,0.95)');
        gr.addColorStop(0.7, 'rgba(255,255,255,0.45)');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], p[2], 0, 6.283); g.fill();
      }
      return new THREE.CanvasTexture(c);
    }
    var clouds = [];
    for (var ci = 0; ci < 3; ci++) {
      var cl = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTexture(), transparent: true, depthWrite: false, opacity: 0.9 - ci * 0.18 }));
      cl.position.set(-10 + ci * 7.5, 2.3 - ci * 0.25, -14 + ci * 2); // 가까운 구름일수록 빠르게 = 시차
      cl.scale.set(4.6 - ci * 0.5, 2.3 - ci * 0.3, 1);
      cl.userData.speed = 0.16 + ci * 0.13;
      scene.add(cl); clouds.push(cl);
    }

    /* ---- 맨틀: 캔버스 노이즈 마그마 emissive 텍스처 + 저주파 펄스 ---- */
    function magmaTexture() {
      var c = document.createElement('canvas'); c.width = 256; c.height = 128;
      var g = c.getContext('2d');
      g.fillStyle = '#3d0c04'; g.fillRect(0, 0, 256, 128);
      for (var i = 0; i < 380; i++) { // 뜨거운 반점 노이즈
        var x = Math.random() * 256, y = Math.random() * 128, r = 3 + Math.random() * 15, hot = Math.random();
        var gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(255,' + (70 + Math.floor(hot * 130)) + ',25,' + (0.1 + hot * 0.3).toFixed(2) + ')');
        gr.addColorStop(1, 'rgba(120,20,5,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      }
      g.strokeStyle = 'rgba(255,160,40,0.55)'; g.lineWidth = 1.6; // 용암 균열 줄기
      for (var k = 0; k < 10; k++) {
        var xx = Math.random() * 256, yy = Math.random() * 128;
        g.beginPath(); g.moveTo(xx, yy);
        for (var s = 0; s < 5; s++) { xx += (Math.random() - 0.5) * 46; yy += (Math.random() - 0.5) * 26; g.lineTo(xx, yy); }
        g.stroke();
      }
      var tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; return tx;
    }
    var magmaTex = magmaTexture();
    var mantleMat = new THREE.MeshStandardMaterial({ color: 0x9a2a12, map: magmaTex, emissive: 0xff5a1f, emissiveMap: magmaTex, emissiveIntensity: 0.5, roughness: 0.9 });
    var mantle = new THREE.Mesh(new THREE.BoxGeometry(16, 1.4, 8), mantleMat);
    mantle.position.set(0, -1.5, 0); scene.add(mantle);

    // 승리 연출용 오렌지 포인트라이트(평소 꺼짐)
    var glowLight = new THREE.PointLight(0xff6d00, 0, 14);
    glowLight.position.set(0, 1.4, 0); scene.add(glowLight);

    // 두 지각판(드래그 대상). x로 가르는 경계, z는 경계를 따라가는 방향.
    var PLATE_W = 5.6, PLATE_H = 1.0, PLATE_D = 7;
    function makePlate(color) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(PLATE_W, PLATE_H, PLATE_D), new THREE.MeshLambertMaterial({ color: color, flatShading: true }));
      return m;
    }
    // 색: 대륙(갈색), 해양(짙은 파랑) — 라운드에 따라 칠함
    var COL = { continental: 0x8d6e63, oceanic: 0x1565c0 };
    var plateL = makePlate(COL.continental), plateR = makePlate(COL.continental);
    scene.add(plateL, plateR);

    // 지형 결과 메시들(라운드 클리어 시 솟음)
    var landGroup = new THREE.Group(); scene.add(landGroup);

    // 라벨(어느 판이 무엇인지)
    var tipPlateL = makeBadge(), tipPlateR = makeBadge();
    function makeBadge() { var d = document.createElement('div'); d.style.cssText = 'position:absolute;font:700 11px "Noto Sans KR",sans-serif;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.7);pointer-events:none'; host.appendChild(d); return d; }

    /* ---- HUD: 점수 카운트업 + 4칸 진행 바 + 프롬프트 글로우 ---- */
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:10px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#0d2b4e;text-shadow:0 1px 2px rgba(255,255,255,.6);pointer-events:none;line-height:1.55;max-width:62%';
    host.appendChild(hud);
    var hudTop = document.createElement('div');
    hudTop.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap';
    var hudScoreWrap = document.createElement('span');
    var hudScore = document.createElement('span'); hudScore.textContent = '0';
    hudScoreWrap.appendChild(document.createTextNode('🏆 '));
    hudScoreWrap.appendChild(hudScore);
    hudScoreWrap.appendChild(document.createTextNode('점'));
    var segWrap = document.createElement('span'); segWrap.style.cssText = 'display:inline-flex;gap:3px;align-items:center';
    var segs = [];
    for (var si = 0; si < ROUNDS.length; si++) {
      var sg = document.createElement('span');
      sg.style.cssText = 'width:16px;height:7px;border-radius:3px;background:rgba(13,43,78,.18);transition:background .3s,box-shadow .3s';
      segWrap.appendChild(sg); segs.push(sg);
    }
    var hudStage = document.createElement('span'); hudStage.style.cssText = 'font-size:12px';
    hudTop.appendChild(hudScoreWrap); hudTop.appendChild(segWrap); hudTop.appendChild(hudStage);
    var hudPrompt = document.createElement('b');
    hudPrompt.style.cssText = 'display:block;font-size:14px;color:#b71c1c;transition:color .25s,text-shadow .25s';
    var hudPlates = document.createElement('div'); hudPlates.style.cssText = 'font-weight:600;font-size:12px';
    var hudMsg = document.createElement('div'); hudMsg.style.cssText = 'font-size:12px';
    hud.appendChild(hudTop); hud.appendChild(hudPrompt); hud.appendChild(hudPlates); hud.appendChild(hudMsg);
    function setPromptGlow(on) {
      if (on) { hudPrompt.style.color = '#1b7a2f'; hudPrompt.style.textShadow = '0 0 8px rgba(67,231,109,.9),0 1px 2px rgba(255,255,255,.6)'; }
      else { hudPrompt.style.color = '#b71c1c'; hudPrompt.style.textShadow = ''; }
    }

    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;right:10px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#1f3a5f;text-shadow:0 1px 2px rgba(255,255,255,.6);pointer-events:none;text-align:right;max-width:58%';
    host.appendChild(tip);
    var rb = document.createElement('button');
    rb.textContent = '↺ 다시'; rb.style.cssText = 'position:absolute;right:10px;top:10px;border:1px solid #90caf9;border-radius:8px;background:#fff;padding:4px 10px;font:700 12px "Noto Sans KR",sans-serif;color:#1565c0;cursor:pointer;transition:transform .12s,box-shadow .15s,background .15s';
    host.appendChild(rb);
    rb.addEventListener('mouseenter', function () { rb.style.transform = 'translateY(-1px)'; rb.style.boxShadow = '0 3px 10px rgba(21,101,192,.3)'; rb.style.background = '#f2f9ff'; });
    rb.addEventListener('mouseleave', function () { rb.style.transform = ''; rb.style.boxShadow = ''; rb.style.background = '#fff'; });
    rb.addEventListener('mousedown', function () { rb.style.transform = 'scale(.92)'; });
    rb.addEventListener('mouseup', function () { rb.style.transform = 'translateY(-1px)'; });

    /* ---- fact 토스트 카드 + '+100' 팝업 + 오답 플래시 ---- */
    var toast = document.createElement('div');
    toast.style.cssText = 'position:absolute;left:50%;bottom:14px;transform:translate(-50%,150%);transition:transform .45s cubic-bezier(.2,.9,.3,1.15),opacity .4s;opacity:0;background:rgba(13,32,58,.93);color:#fff;padding:10px 16px;border-radius:12px;font:600 12.5px "Noto Sans KR",sans-serif;max-width:86%;pointer-events:none;box-shadow:0 6px 24px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.16);line-height:1.5';
    host.appendChild(toast);
    function showToast(text) { toast.textContent = '💡 ' + text; toast.style.transform = 'translate(-50%,0)'; toast.style.opacity = '1'; }
    function hideToast() { toast.style.transform = 'translate(-50%,150%)'; toast.style.opacity = '0'; }
    function popScore() {
      var d = document.createElement('div'); d.textContent = '+100';
      d.style.cssText = 'position:absolute;left:50%;top:42%;transform:translate(-50%,0) scale(.7);font:800 26px "Noto Sans KR",sans-serif;color:#ffd54f;text-shadow:0 0 10px rgba(255,160,0,.85),0 2px 4px rgba(0,0,0,.4);pointer-events:none;transition:transform .9s cubic-bezier(.17,.8,.3,1),opacity .9s;opacity:1';
      host.appendChild(d);
      requestAnimationFrame(function () { requestAnimationFrame(function () { d.style.transform = 'translate(-50%,-58px) scale(1.15)'; d.style.opacity = '0'; }); });
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1000);
    }
    var flashEl = document.createElement('div');
    flashEl.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;border-radius:12px;pointer-events:none;background:radial-gradient(circle,rgba(229,57,53,.16),rgba(229,57,53,.34));opacity:0;transition:opacity .5s';
    host.appendChild(flashEl);
    function flashRed() {
      flashEl.style.transition = 'none'; flashEl.style.opacity = '1';
      void flashEl.offsetWidth;
      flashEl.style.transition = 'opacity .5s'; flashEl.style.opacity = '0';
    }

    var lvl = 0, score = 0, busy = false;
    // 승리 연출 타이머 추적: '다시' 로 재진입해도 타이머가 중첩돼 라운드를 건너뛰거나
    // 같은 라운드를 다시 이겨 +100 을 중복으로 받는 일이 없게 한다.
    var winTimer = null, resetTimer = null, needScoreReset = false;
    var scoreShown = 0;      // HUD 카운트업 표시용
    var returning = false;   // 오답 스프링 복귀 중 드래그 잠금
    // 각 판의 시작 위치 기준값
    var BASE_X = (PLATE_W / 2) + 0.15; // 경계에서 약간 떨어져 시작
    var startL, startR; // 이번 라운드 시작 위치(분류 기준)

    /* ---- 트윈 엔진(단일 rAF 루프에서 갱신) ---- */
    var tweens = [];
    function easeOutBack(k) { var s = 1.70158; k = k - 1; return k * k * ((s + 1) * k + s) + 1; }
    function easeOutCubic(k) { return 1 - Math.pow(1 - k, 3); }
    function linear(k) { return k; }
    function springEase(k) { return 1 - Math.exp(-5.2 * k) * Math.cos(9 * k); } // 감쇠 스프링(살짝 오버슈트)
    function tw(delay, dur, fn, ease, onStart, onDone) {
      tweens.push({ t: -delay, d: dur, fn: fn, e: ease || easeOutCubic, s: onStart || null, c: onDone || null, st: false });
    }

    /* ---- 파티클 풀(상한 고정, 재사용) ---- */
    var POOL = 130, pool = [], poolIdx = 0;
    var partGeo = new THREE.SphereGeometry(0.11, 6, 5);
    for (var pi = 0; pi < POOL; pi++) {
      var pm = new THREE.Mesh(partGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
      pm.visible = false;
      pm.userData = { v: new THREE.Vector3(), life: 0, max: 1, grav: 0, grow: 0, size: 1 };
      scene.add(pm); pool.push(pm);
    }
    function spawnP(x, y, z, vx, vy, vz, life, color, size, grav, grow) {
      if (RM) return;
      for (var t = 0; t < POOL; t++) {
        poolIdx = (poolIdx + 1) % POOL;
        var s = pool[poolIdx];
        if (s.visible) continue;
        s.visible = true; s.position.set(x, y, z);
        var u = s.userData; u.v.set(vx, vy, vz); u.life = life; u.max = life; u.grav = grav; u.grow = grow; u.size = size;
        s.scale.set(size, size, size); s.material.color.setHex(color); s.material.opacity = 1;
        return;
      }
    }
    function burst(p, color) {
      for (var i = 0; i < 18; i++) {
        var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI, sp = 3.5 + Math.random() * 2.5;
        spawnP(p.x, p.y, p.z, Math.cos(a) * Math.sin(b) * sp, (Math.abs(Math.cos(b)) + 0.5) * sp, Math.sin(a) * Math.sin(b) * sp,
          0.8, color, 1, 8, 0);
      }
    }
    function debris(x, y, z) { // 암석 파편
      for (var j = 0; j < 6; j++)
        spawnP(x + (Math.random() - 0.5) * 0.6, y, z + (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 3.5, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 3.5,
          0.7 + Math.random() * 0.3, Math.random() < 0.5 ? 0x8d6e63 : 0x5d4037, 0.7 + Math.random() * 0.6, 10, 0);
    }
    function steam(x, y, z) { // 회색 증기(상승·확산)
      spawnP(x + (Math.random() - 0.5) * 0.3, y, z, (Math.random() - 0.5) * 0.5, 1.4 + Math.random() * 1.2, (Math.random() - 0.5) * 0.5,
        1.3 + Math.random() * 0.5, 0xcfd8dc, 1.1 + Math.random() * 0.9, -1.6, 2.2);
    }
    function lavaGlow(x, y, z) { // 용암 글로우 불티
      spawnP(x + (Math.random() - 0.5) * 0.25, y, z, (Math.random() - 0.5) * 0.8, 1.8 + Math.random() * 1.6, (Math.random() - 0.5) * 0.8,
        0.6 + Math.random() * 0.3, Math.random() < 0.5 ? 0xffab40 : 0xff7043, 0.6 + Math.random() * 0.5, 4, 0);
    }
    /* 지속 분출 이미터: {dur, rate, acc, fn} */
    var emitters = [];

    /* ---- 카메라 셰이크(감쇠, RM 게이트) ---- */
    var shakeAmp = 0;
    function addShake(a) { if (RM) return; shakeAmp = Math.min(0.6, shakeAmp + a); }

    function roundColors() {
      var R = ROUNDS[lvl];
      plateL.material.color.setHex(COL[R.leftType]);
      plateR.material.color.setHex(COL[R.rightType]);
    }

    function clearLand() {
      while (landGroup.children.length) {
        var c = landGroup.children.pop(); landGroup.remove(c);
        if (c.geometry && c.geometry.dispose) c.geometry.dispose();
        if (c.material && c.material.dispose) c.material.dispose();
      }
    }

    function setupRound() {
      // 예약된 승리/재시작 타이머 취소 — 어떤 경로로 라운드가 시작되든 오래된 타이머가 남지 않는다.
      clearTimeout(winTimer); clearTimeout(resetTimer); winTimer = resetTimer = null;
      if (needScoreReset) { score = 0; needScoreReset = false; } // 전판 클리어 후 새 사이클: 정확히 1회 리셋
      busy = false; clearLand();
      plateL.scale.set(1, 1, 1); plateR.scale.set(1, 1, 1);
      plateL.rotation.set(0, 0, 0); plateR.rotation.set(0, 0, 0);
      plateL.position.set(-BASE_X, 0, 0); plateR.position.set(BASE_X, 0, 0);
      startL = plateL.position.clone(); startR = plateR.position.clone();
      roundColors();
      setHud();
      var R = ROUNDS[lvl];
      tip.innerHTML = '🛈 ' + R.hint;
    }

    function setHud(msg) {
      var R = ROUNDS[lvl];
      var names = { continental: '대륙판', oceanic: '해양판' };
      hudStage.textContent = '단계 ' + (lvl + 1) + '/' + ROUNDS.length;
      hudPrompt.textContent = R.prompt;
      hudPlates.textContent = '왼쪽=' + names[R.leftType] + ' · 오른쪽=' + names[R.rightType];
      hudMsg.innerHTML = msg || '';
      for (var i = 0; i < segs.length; i++) { // 단계 진행 4칸 세그먼트 바
        if (i < lvl) { segs[i].style.background = '#2e7d32'; segs[i].style.boxShadow = '0 0 6px rgba(76,175,80,.7)'; }
        else if (i === lvl) { segs[i].style.background = '#ffb300'; segs[i].style.boxShadow = '0 0 6px rgba(255,179,0,.6)'; }
        else { segs[i].style.background = 'rgba(13,43,78,.18)'; segs[i].style.boxShadow = 'none'; }
      }
    }

    // 화면상 판 라벨 위치 갱신
    function projectToScreen(v3) {
      var v = v3.clone().project(cam);
      var r = rndr.domElement.getBoundingClientRect();
      return { x: (v.x * 0.5 + 0.5) * r.width, y: (-v.y * 0.5 + 0.5) * r.height };
    }
    function updateBadges() {
      var R = ROUNDS[lvl];
      var names = { continental: '🟤 대륙판', oceanic: '🔵 해양판' };
      var pL = projectToScreen(new THREE.Vector3(plateL.position.x, plateL.position.y + 0.8, 0));
      var pR = projectToScreen(new THREE.Vector3(plateR.position.x, plateR.position.y + 0.8, 0));
      tipPlateL.textContent = names[R.leftType]; tipPlateL.style.left = (pL.x - 24) + 'px'; tipPlateL.style.top = (pL.y - 8) + 'px';
      tipPlateR.textContent = names[R.rightType]; tipPlateR.style.left = (pR.x - 24) + 'px'; tipPlateR.style.top = (pR.y - 8) + 'px';
    }

    /* ---- 드래그: z=0 평면이 아닌 y=0(지면) 평면에 레이캐스트해 x·z 둘 다 끌기 ---- */
    var ray = new THREE.Raycaster();
    var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // y=0
    var dragging = null, dragOff = new THREE.Vector3();
    var lastDragT = 0, rumbleHot = false;
    function ndc(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return new THREE.Vector2(((p.clientX - r.left) / r.width) * 2 - 1, -((p.clientY - r.top) / r.height) * 2 + 1); }
    function planePt(e) { ray.setFromCamera(ndc(e), cam); var pt = new THREE.Vector3(); ray.ray.intersectPlane(groundPlane, pt); return pt; }
    function pickPlate(pt) {
      // 어느 판에 더 가까운가(평면상 x·z 거리)
      var dl = Math.hypot(pt.x - plateL.position.x, pt.z - plateL.position.z);
      var drr = Math.hypot(pt.x - plateR.position.x, pt.z - plateR.position.z);
      var p = dl < drr ? plateL : plateR;
      var d = Math.min(dl, drr);
      return d < (PLATE_W / 2 + 1.2) ? p : null;
    }
    function onDown(e) {
      if (busy || returning) return; var pt = planePt(e); if (!pt) return;
      ensureRumble(); // 첫 포인터 입력 이후에만 AudioContext 생성
      var p = pickPlate(pt);
      if (p) { dragging = p; dragOff.set(p.position.x - pt.x, 0, p.position.z - pt.z); rndr.domElement.style.cursor = 'grabbing'; e.preventDefault(); }
    }
    function onMove(e) {
      if (!dragging || busy) return; var pt = planePt(e); if (!pt) return;
      var nx = pt.x + dragOff.x, nz = pt.z + dragOff.z;
      // 좌판은 음의 x 영역, 우판은 양의 x 영역에 머무르게(경계 침범 방지, 자연스러운 충돌 한계)
      if (dragging === plateL) nx = Math.max(-8, Math.min(-0.1, nx));
      else nx = Math.min(8, Math.max(0.1, nx));
      nz = Math.max(-4, Math.min(4, nz));
      var moved = Math.hypot(nx - dragging.position.x, nz - dragging.position.z); // 이동 속도 근사
      dragging.position.x = nx; dragging.position.z = nz;
      // 이동 속도 비례 저주파 럼블 + 경계 부근 먼지 분출
      setRumble(Math.min(0.1, moved * 0.55)); rumbleHot = true; lastDragT = Date.now();
      if (!RM && moved > 0.03) {
        var edge = dragging === plateL ? nx + PLATE_W / 2 : nx - PLATE_W / 2;
        if (Math.abs(edge) < 1.5) {
          var n = Math.min(3, Math.ceil(moved * 14));
          for (var di = 0; di < n; di++)
            spawnP(edge + (Math.random() - 0.5) * 0.3, PLATE_H / 2 + 0.1, nz + (Math.random() - 0.5) * PLATE_D * 0.8,
              (Math.random() - 0.5) * 1.2, 1 + Math.random() * 1.4, (Math.random() - 0.5) * 1.2,
              0.55, 0xd7ccc8, 0.8 + Math.random() * 0.6, 6, 0.8);
        }
      }
      // 실시간 분류로 힌트
      var m = currentMotion();
      var R = ROUNDS[lvl];
      var label = { convergent: '수렴', divergent: '발산', transform: '변환', none: '—', ambiguous: '대각선…', }[m.type] || m.type;
      setHud('현재 운동: ' + label + (m.type === R.required ? ' ✓ (놓으면 확정)' : ''));
      setPromptGlow(m.type === R.required);
      e.preventDefault();
    }
    function onUp(e) {
      if (!dragging) return; dragging = null; rndr.domElement.style.cursor = 'grab';
      setRumble(0); rumbleHot = false; // 놓으면 럼블 gain 0
      setPromptGlow(false);
      if (busy) return;
      var m = currentMotion();
      var R = ROUNDS[lvl];
      if (m.type === 'none') { setHud('판을 충분히 움직여 보세요'); return; }
      if (isWin(R.required, m)) win(m); else fail(m);
      e.preventDefault();
    }
    function currentMotion() {
      var dL = { x: plateL.position.x - startL.x, z: plateL.position.z - startL.z };
      var dR = { x: plateR.position.x - startR.x, z: plateR.position.z - startR.z };
      return classifyMotion(dL, dR);
    }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });
    rb.addEventListener('click', function () {
      // 승리 확정 후 연출 대기 중이면 '다시' = 즉시 다음으로 진행.
      // (busy 만 풀고 같은 라운드를 재개하면 같은 라운드 재승리로 +100 중복 + 타이머 중첩으로 라운드 건너뜀)
      if (winTimer != null) { clearTimeout(winTimer); winTimer = null; advance(); return; }
      setupRound();
    });

    /* ---- 지형 생성(승리 연출: easeOutBack 오버슈트 트윈 + 파편/증기/글로우) ---- */
    function spawnMountain() {
      // 경계 위로 솟는 습곡산맥(여러 봉우리) — 순차 성장, 돋을 때 암석 파편, 눈 캡 반짝
      var mat = new THREE.MeshLambertMaterial({ color: 0x6d4c41, flatShading: true });
      for (var i = 0; i < 5; i++) {
        (function (i) {
          var hgt = 1.6 + Math.random() * 1.8;
          var peak = new THREE.Mesh(new THREE.ConeGeometry(0.7 + Math.random() * 0.5, hgt, 5), mat);
          peak.position.set((Math.random() - 0.5) * 1.4, PLATE_H / 2 + hgt / 2 - 0.2, (i - 2) * 1.2 + (Math.random() - 0.5));
          peak.scale.set(0.01, 0.01, 0.01); landGroup.add(peak);
          var snow = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true, emissive: 0xcfe8ff, emissiveIntensity: 0 });
          var cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, hgt * 0.32, 5), snow);
          cap.position.set(peak.position.x, peak.position.y + hgt * 0.34, peak.position.z);
          cap.scale.set(0.01, 0.01, 0.01); landGroup.add(cap);
          var dlay = i * 0.13;
          tw(dlay, 0.85, function (ev) { var sc = Math.max(0.01, ev); peak.scale.set(sc, sc, sc); }, easeOutBack,
            function () { debris(peak.position.x, PLATE_H / 2 + 0.3, peak.position.z); });
          tw(dlay + 0.25, 0.7, function (ev) { var sc = Math.max(0.01, ev); cap.scale.set(sc, sc, sc); }, easeOutBack, null,
            function () { tw(0, 0.5, function (e2) { snow.emissiveIntensity = 1.5 * (1 - e2); }, linear); });
        })(i);
      }
    }
    function spawnRidge() {
      // 벌어진 틈으로 마그마/해령 솟음 + 오렌지 글로우 스파이크 + 스팀
      var magma = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, PLATE_D), new THREE.MeshStandardMaterial({ color: 0xff6d00, emissive: 0xff3d00, emissiveIntensity: 0.9 }));
      magma.position.set(0, 0, 0); magma.scale.set(0.01, 1, 1); landGroup.add(magma);
      var ridge = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.2, 4), new THREE.MeshLambertMaterial({ color: 0x37474f, flatShading: true }));
      ridge.position.set(0, PLATE_H / 2 + 0.4, 0); ridge.scale.set(1, 0.01, 5); landGroup.add(ridge);
      tw(0, 0.8, function (ev) { magma.scale.x = Math.max(0.01, ev); }, easeOutBack);
      tw(0.3, 0.9, function (ev) { ridge.scale.y = Math.max(0.01, ev); }, easeOutBack);
      glowLight.position.set(0, 1.4, 0);
      tw(0, 1.6, function (ev) { glowLight.intensity = ev < 0.18 ? (ev / 0.18) * 2.8 : 2.8 * (1 - (ev - 0.18) / 0.82); }, linear);
      emitters.push({ dur: 2.2, rate: 13, acc: 0, fn: function () { steam(0, 1.0, (Math.random() - 0.5) * PLATE_D * 0.8); } });
      emitters.push({ dur: 1.6, rate: 10, acc: 0, fn: function () { lavaGlow(0, 0.9, (Math.random() - 0.5) * PLATE_D * 0.7); } });
    }
    function spawnTransform() {
      // 단층 균열이 z축을 따라 지그재그로 순차적으로 그려짐
      var matC = new THREE.MeshStandardMaterial({ color: 0x212121, emissive: 0x3e2723, emissiveIntensity: 0.35 });
      var N = 9, total = PLATE_D + 1, seg = total / N;
      for (var i = 0; i < N; i++) {
        (function (i) {
          var box = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, seg * 1.15), matC);
          box.position.set((i % 2 === 0 ? 1 : -1) * 0.13, PLATE_H / 2 + 0.05, -total / 2 + seg * (i + 0.5));
          box.rotation.y = (i % 2 === 0 ? 1 : -1) * 0.22;
          box.scale.set(1, 1, 0.01); landGroup.add(box);
          tw(i * 0.07, 0.2, function (ev) { box.scale.z = Math.max(0.01, ev); }, easeOutCubic,
            function () { spawnP(box.position.x, box.position.y + 0.1, box.position.z, 0, 1.5, 0, 0.4, 0x9e9e9e, 0.6, 3, 1); });
        })(i);
      }
    }
    function spawnTrench() {
      // 섭입: 화산호 순차 성장 + 해구 증기 기둥 + 분화구 용암 글로우
      var arc = new THREE.MeshLambertMaterial({ color: 0x5d4037, flatShading: true });
      var craters = [];
      for (var i = 0; i < 4; i++) {
        (function (i) {
          var z = (i - 1.5) * 1.6;
          var v = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 6), arc);
          v.position.set(0.9, PLATE_H / 2 + 0.7, z); v.scale.set(0.01, 0.01, 0.01); landGroup.add(v);
          var fire = new THREE.MeshStandardMaterial({ color: 0xff7043, emissive: 0xbf360c, emissiveIntensity: 0.9 });
          var lava = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 6), fire);
          lava.position.set(0.9, PLATE_H / 2 + 1.55, z); lava.scale.set(0.01, 0.01, 0.01); landGroup.add(lava);
          tw(0.25 + i * 0.14, 0.8, function (ev) { var sc = Math.max(0.01, ev); v.scale.set(sc, sc, sc); }, easeOutBack,
            function () { debris(0.9, PLATE_H / 2 + 0.5, z); });
          tw(0.55 + i * 0.14, 0.6, function (ev) { var sc = Math.max(0.01, ev); lava.scale.set(sc, sc, sc); }, easeOutBack);
          craters.push(z);
        })(i);
      }
      glowLight.position.set(0.9, 2.2, 0);
      tw(0.5, 1.8, function (ev) { glowLight.intensity = ev < 0.2 ? (ev / 0.2) * 2.2 : 2.2 * (1 - (ev - 0.2) / 0.8); }, linear);
      emitters.push({ dur: 2.6, rate: 15, acc: 0, fn: function () { steam(-0.25 + Math.random() * 0.3, 0.7, (Math.random() - 0.5) * PLATE_D * 0.85); } });
      emitters.push({ dur: 2.4, rate: 9, acc: 0, fn: function () { var z = craters[(Math.random() * craters.length) | 0]; lavaGlow(0.9, PLATE_H / 2 + 1.8, z); } });
    }

    function win(m) {
      busy = true; score += 100; beep(660, 0.1, 'sine'); setTimeout(function () { beep(990, 0.14, 'sine'); }, 90);
      setRumble(0); rumbleHot = false;
      var R = ROUNDS[lvl];
      if (R.required === 'convergent') {
        var land = convergentLandform(R.leftType, R.rightType);
        if (land === 'mountain') { spawnMountain(); pushPlatesTogetherAnim(); addShake(0.45); } // '지진' 셰이크 강+감쇠
        else { spawnTrench(); subductAnim(); addShake(0.5); boom(); }
      } else if (R.required === 'divergent') { spawnRidge(); addShake(0.22); }
      else if (R.required === 'transform') { spawnTransform(); addShake(0.18); creak(); }
      burst(new THREE.Vector3(0, PLATE_H / 2 + 1, 0), 0xffd54f);
      chime(); popScore();
      setHud('✅ 정답! 지형이 만들어집니다…');
      showToast(R.fact);
      winTimer = setTimeout(advance, 3000);
    }
    /* 승리 연출 뒤 다음 라운드로 진행 (타이머 또는 '다시' 버튼이 호출) */
    function advance() {
      winTimer = null;
      lvl++;
      if (lvl >= ROUNDS.length) {
        lvl = 0;
        setHud('🎉 모든 단계 클리어! 총 ' + score + '점 — 다시 시작합니다');
        needScoreReset = true; // 점수 리셋은 다음 setupRound 에서 — 대기 중 '다시'를 눌러도 진행 중 점수가 갑자기 지워지지 않는다
        resetTimer = setTimeout(function () { resetTimer = null; setupRound(); }, 2600);
      } else { setupRound(); }
    }
    function fail(m) {
      beep(150, 0.18, 'square');
      addShake(0.12); flashRed(); springBack(); // 약한 셰이크 + 붉은 플래시 + 스프링 복귀
      var label = { convergent: '수렴(다가감)', divergent: '발산(멀어짐)', transform: '변환(엇갈림)', ambiguous: '대각선 운동' }[m.type] || m.type;
      setHud('❌ 지금은 ' + label + ' 운동이에요. 프롬프트가 요구한 운동으로 다시 시도하세요. (다시 버튼으로 초기화)');
    }
    /* 오답: 판이 감쇠 스프링 트윈으로 시작 위치 복귀 */
    function springBack() {
      returning = true;
      var aL = plateL.position.clone(), aR = plateR.position.clone();
      tw(0, 0.75, function (ev) {
        plateL.position.set(aL.x + (startL.x - aL.x) * ev, 0, aL.z + (startL.z - aL.z) * ev);
        plateR.position.set(aR.x + (startR.x - aR.x) * ev, 0, aR.z + (startR.z - aR.z) * ev);
      }, springEase, null, function () {
        plateL.position.copy(startL); plateR.position.copy(startR); returning = false;
      });
    }

    // 산맥: 충돌 시 두 판을 약간 솟구치게
    function pushPlatesTogetherAnim() { plateL.userData.tilt = 0.18; plateR.userData.tilt = -0.18; }
    function subductAnim() { plateL.userData.dive = 1; } // 왼(해양)판이 내려감

    /* ---- 단일 rAF 루프: 트윈/이미터/파티클/구름/맨틀펄스/셰이크/카운트업 ---- */
    var last = null, elapsed = 0;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      elapsed += dt;
      // 트윈
      for (var ti = tweens.length - 1; ti >= 0; ti--) {
        var twn = tweens[ti]; twn.t += dt;
        if (twn.t < 0) continue;
        if (!twn.st) { twn.st = true; if (twn.s) twn.s(); }
        var k = Math.min(1, twn.t / twn.d);
        twn.fn(twn.e(k));
        if (k >= 1) { tweens.splice(ti, 1); if (twn.c) twn.c(); }
      }
      // 이미터(증기/용암 지속 분출)
      for (var ei = emitters.length - 1; ei >= 0; ei--) {
        var em = emitters[ei]; em.dur -= dt; em.acc += em.rate * dt;
        while (em.acc >= 1) { em.acc -= 1; em.fn(); }
        if (em.dur <= 0) emitters.splice(ei, 1);
      }
      // 파티클 풀 갱신
      for (var pj = 0; pj < POOL; pj++) {
        var ps = pool[pj];
        if (!ps.visible) continue;
        var u = ps.userData; u.life -= dt;
        if (u.life <= 0) { ps.visible = false; continue; }
        u.v.y -= u.grav * dt; ps.position.addScaledVector(u.v, dt);
        var lk = u.life / u.max;
        ps.material.opacity = Math.min(1, lk * 1.6);
        var sc2 = u.size * (1 + u.grow * (1 - lk));
        ps.scale.set(sc2, sc2, sc2);
      }
      // 구름 드리프트(시차) + 맨틀 emissive 저주파 펄스 (RM이면 정지)
      if (!RM) {
        for (var cj = 0; cj < clouds.length; cj++) { var c2 = clouds[cj]; c2.position.x += c2.userData.speed * dt; if (c2.position.x > 13) c2.position.x = -13; }
        mantleMat.emissiveIntensity = 0.45 + 0.18 * Math.sin(elapsed * 1.3) + 0.07 * Math.sin(elapsed * 3.1);
        magmaTex.offset.x = elapsed * 0.008;
      }
      // 판 연출(승리 후)
      if (plateL.userData.tilt) plateL.rotation.z += (plateL.userData.tilt - plateL.rotation.z) * dt * 3;
      if (plateR.userData.tilt) plateR.rotation.z += (plateR.userData.tilt - plateR.rotation.z) * dt * 3;
      if (plateL.userData.dive) { plateL.rotation.z += (-0.5 - plateL.rotation.z) * dt * 2; plateL.position.y += (-0.6 - plateL.position.y) * dt * 2; }
      // 카메라 셰이크(감쇠)
      if (shakeAmp > 0.002) {
        shakeAmp *= Math.exp(-3.4 * dt);
        cam.position.set((Math.random() * 2 - 1) * shakeAmp, 8.5 + (Math.random() * 2 - 1) * shakeAmp * 0.7, 13);
      } else { shakeAmp = 0; cam.position.set(0, 8.5, 13); }
      cam.lookAt(0, -0.3, 0);
      // 점수 카운트업
      if (scoreShown !== score) {
        var sd = score - scoreShown;
        if (Math.abs(sd) < 1) scoreShown = score; else scoreShown += sd * Math.min(1, dt * 9);
        hudScore.textContent = String(Math.round(scoreShown));
      }
      // 럼블 안전 감쇠(포인터 정지 시)
      if (rumbleHot && (!dragging || Date.now() - lastDragT > 140)) { setRumble(0); rumbleHot = false; }
      updateBadges();
      rndr.render(scene, cam);
    }

    // 라운드 시작 시 판 연출 플래그 초기화
    var _origSetup = setupRound;
    setupRound = function () {
      plateL.userData.tilt = 0; plateR.userData.tilt = 0; plateL.userData.dive = 0;
      tweens.length = 0; emitters.length = 0; returning = false;
      glowLight.intensity = 0; setPromptGlow(false); hideToast();
      for (var i = 0; i < POOL; i++) pool[i].visible = false;
      _origSetup();
    };

    setupRound();
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    /* ---- 사운드(전부 WebAudio 합성, 첫 포인터 입력 후 생성) ---- */
    var actx = null;
    function beep(f, d, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }
    /* 드래그 럼블: white-noise 루프 + lowpass, gain=이동속도 (RM 게이트) */
    var rumble = null;
    function ensureRumble() {
      if (RM || rumble) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        var len = Math.floor(actx.sampleRate * 0.8), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        var src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
        var f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 95; f.Q.value = 0.8;
        var g = actx.createGain(); g.gain.value = 0;
        src.connect(f); f.connect(g); g.connect(actx.destination); src.start();
        rumble = { g: g };
      } catch (e) {}
    }
    function setRumble(v) { if (!rumble || !actx) return; try { rumble.g.gain.setTargetAtTime(v, actx.currentTime, 0.06); } catch (e) {} }
    /* 낮은 폭발음: 노이즈 + lowpass 스윕 */
    function boom() {
      try {
        if (!actx) return;
        var dur = 0.6, buf = actx.createBuffer(1, Math.floor(actx.sampleRate * dur), actx.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
        var s = actx.createBufferSource(); s.buffer = buf;
        var f = actx.createBiquadFilter(); f.type = 'lowpass';
        var t = actx.currentTime;
        f.frequency.setValueAtTime(420, t); f.frequency.exponentialRampToValueAtTime(60, t + dur);
        var g = actx.createGain(); g.gain.value = 0.5;
        s.connect(f); f.connect(g); g.connect(actx.destination); s.start(t);
      } catch (e) {}
    }
    /* 마찰 삐걱음: sawtooth 피치 벤드 다운 */
    function creak() {
      try {
        if (!actx) return;
        var o = actx.createOscillator(); o.type = 'sawtooth';
        var t = actx.currentTime;
        o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.5);
        var g = actx.createGain();
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.6);
      } catch (e) {}
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
