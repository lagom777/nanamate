/* 나나메이트 플래그십 3D 게임 — 판 구조 (aboutEarthScience/02-plate-tectonics)
 * 두 지각판(블록)을 마우스/터치로 드래그해 경계 운동을 만든다:
 *   수렴(서로 다가감) → 충돌해 솟음(습곡산맥) / 해양판 섭입(해구·화산호)
 *   발산(서로 멀어짐) → 사이로 마그마가 올라와 해령·열곡 형성
 *   보존(서로 반대로 어긋남) → 변환단층(수평으로 스쳐 지남)
 * 각 라운드 프롬프트가 요구하는 경계 유형의 운동을 수행하면 해당 지형이 3D로 솟아오르고 클리어.
 * 실제 판구조 개념(수렴/발산/변환, 산맥/해구/해령/변환단층)에 충실.
 * 컨테이너: <div id="nm-tectonics"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문(graceful).
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

    var W = host.clientWidth || 640, H = 380, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 200);
      cam.position.set(0, 8.5, 13); cam.lookAt(0, -0.3, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:grab;touch-action:none;display:block;background:linear-gradient(#dff1ff,#bfe0ff)';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(-4, 10, 6); scene.add(dl);

    // 맨틀(아래 뜨거운 층)
    var mantle = new THREE.Mesh(new THREE.BoxGeometry(16, 1.4, 8), new THREE.MeshLambertMaterial({ color: 0x7a1f12 }));
    mantle.position.set(0, -1.5, 0); scene.add(mantle);

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

    // HUD
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:10px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#0d2b4e;text-shadow:0 1px 2px rgba(255,255,255,.6);pointer-events:none;line-height:1.55;max-width:62%';
    host.appendChild(hud);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;right:10px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#1f3a5f;text-shadow:0 1px 2px rgba(255,255,255,.6);pointer-events:none;text-align:right;max-width:58%';
    host.appendChild(tip);
    var rb = document.createElement('button');
    rb.textContent = '↺ 다시'; rb.style.cssText = 'position:absolute;right:10px;top:10px;border:1px solid #90caf9;border-radius:8px;background:#fff;padding:4px 10px;font:700 12px "Noto Sans KR",sans-serif;color:#1565c0;cursor:pointer';
    host.appendChild(rb);

    var lvl = 0, score = 0, busy = false;
    // 각 판의 시작 위치 기준값
    var BASE_X = (PLATE_W / 2) + 0.15; // 경계에서 약간 떨어져 시작
    var startL, startR; // 이번 라운드 시작 위치(분류 기준)

    function roundColors() {
      var R = ROUNDS[lvl];
      plateL.material.color.setHex(COL[R.leftType]);
      plateR.material.color.setHex(COL[R.rightType]);
    }

    function clearLand() { while (landGroup.children.length) { var c = landGroup.children.pop(); landGroup.remove(c); } }

    function setupRound() {
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
      hud.innerHTML = '🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + ROUNDS.length +
        '<br><b style="font-size:14px;color:#b71c1c">' + R.prompt + '</b>' +
        '<br>왼쪽=' + names[R.leftType] + ' · 오른쪽=' + names[R.rightType] +
        (msg ? '<br>' + msg : '');
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
      if (busy) return; var pt = planePt(e); if (!pt) return;
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
      dragging.position.x = nx; dragging.position.z = nz;
      // 실시간 분류로 힌트
      var m = currentMotion();
      var R = ROUNDS[lvl];
      var label = { convergent: '수렴', divergent: '발산', transform: '변환', none: '—', ambiguous: '대각선…', }[m.type] || m.type;
      setHud('현재 운동: ' + label + (m.type === R.required ? ' ✓ (놓으면 확정)' : ''));
      e.preventDefault();
    }
    function onUp(e) {
      if (!dragging) return; dragging = null; rndr.domElement.style.cursor = 'grab';
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
    rb.addEventListener('click', function () { setupRound(); });

    /* ---- 지형 생성(승리 연출) ---- */
    function spawnMountain() {
      // 경계 위로 솟는 습곡산맥(여러 봉우리)
      var mat = new THREE.MeshLambertMaterial({ color: 0x6d4c41, flatShading: true });
      var snow = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
      for (var i = 0; i < 5; i++) {
        var hgt = 1.6 + Math.random() * 1.8;
        var peak = new THREE.Mesh(new THREE.ConeGeometry(0.7 + Math.random() * 0.5, hgt, 5), mat);
        peak.position.set((Math.random() - 0.5) * 1.4, PLATE_H / 2 + hgt / 2 - 0.2, (i - 2) * 1.2 + (Math.random() - 0.5));
        peak.userData.grow = 1; peak.scale.set(0.01, 0.01, 0.01); landGroup.add(peak);
        var cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, hgt * 0.32, 5), snow);
        cap.position.set(peak.position.x, peak.position.y + hgt * 0.34, peak.position.z); cap.userData.grow = 1; cap.scale.set(0.01, 0.01, 0.01); landGroup.add(cap);
      }
    }
    function spawnRidge() {
      // 벌어진 틈으로 마그마/해령 솟음
      var magma = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, PLATE_D), new THREE.MeshStandardMaterial({ color: 0xff6d00, emissive: 0xff3d00, emissiveIntensity: 0.6 }));
      magma.position.set(0, 0, 0); magma.userData.grow = 1; magma.scale.set(0.01, 1, 1); landGroup.add(magma);
      var ridge = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.2, 4), new THREE.MeshLambertMaterial({ color: 0x37474f, flatShading: true }));
      ridge.rotation.z = 0; ridge.position.set(0, PLATE_H / 2 + 0.4, 0); ridge.scale.set(1, 0.01, 5); ridge.userData.grow = 1; landGroup.add(ridge);
    }
    function spawnTransform() {
      // 어긋남을 강조하는 단층선(균열)
      var crack = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, PLATE_D + 1), new THREE.MeshStandardMaterial({ color: 0x212121, emissive: 0x3e2723, emissiveIntensity: 0.3 }));
      crack.position.set(0, PLATE_H / 2 + 0.05, 0); crack.userData.grow = 1; crack.scale.set(1, 1, 0.01); landGroup.add(crack);
    }
    function spawnTrench() {
      // 섭입: 무거운 판이 기울어 내려가고 위로 화산호 솟음
      var arc = new THREE.MeshLambertMaterial({ color: 0x5d4037, flatShading: true });
      var fire = new THREE.MeshStandardMaterial({ color: 0xff7043, emissive: 0xbf360c, emissiveIntensity: 0.4 });
      for (var i = 0; i < 4; i++) {
        var v = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 6), arc);
        v.position.set(0.9, PLATE_H / 2 + 0.7, (i - 1.5) * 1.6); v.userData.grow = 1; v.scale.set(0.01, 0.01, 0.01); landGroup.add(v);
        var lava = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 6), fire);
        lava.position.set(0.9, PLATE_H / 2 + 1.55, (i - 1.5) * 1.6); lava.userData.grow = 1; lava.scale.set(0.01, 0.01, 0.01); landGroup.add(lava);
      }
    }

    function win(m) {
      busy = true; score += 100; beep(660, 0.1, 'sine'); setTimeout(function () { beep(990, 0.14, 'sine'); }, 90);
      var R = ROUNDS[lvl];
      if (R.required === 'convergent') {
        var land = convergentLandform(R.leftType, R.rightType);
        if (land === 'mountain') { spawnMountain(); pushPlatesTogetherAnim(); }
        else { spawnTrench(); subductAnim(); }
      } else if (R.required === 'divergent') { spawnRidge(); }
      else if (R.required === 'transform') { spawnTransform(); }
      burst(new THREE.Vector3(0, PLATE_H / 2 + 1, 0), 0xffd54f);
      chime();
      setHud('✅ 정답! ' + R.fact);
      tip.innerHTML = '🛈 ' + R.fact;
      setTimeout(function () {
        lvl++;
        if (lvl >= ROUNDS.length) {
          lvl = 0;
          setHud('🎉 모든 단계 클리어! 총 ' + score + '점 — 다시 시작합니다');
          setTimeout(function () { score = 0; setupRound(); }, 2600);
        } else { setupRound(); }
      }, 3000);
    }
    function fail(m) {
      beep(150, 0.18, 'square');
      var label = { convergent: '수렴(다가감)', divergent: '발산(멀어짐)', transform: '변환(엇갈림)', ambiguous: '대각선 운동' }[m.type] || m.type;
      setHud('❌ 지금은 ' + label + ' 운동이에요. 프롬프트가 요구한 운동으로 다시 시도하세요. (다시 버튼으로 초기화)');
    }

    // 산맥: 충돌 시 두 판을 약간 솟구치게
    var growAnims = [];
    function pushPlatesTogetherAnim() { plateL.userData.tilt = 0.18; plateR.userData.tilt = -0.18; }
    function subductAnim() { plateL.userData.dive = 1; } // 왼(해양)판이 내려감

    /* ---- 파티클 ---- */
    var parts = [];
    function burst(p, color) {
      for (var i = 0; i < 18; i++) {
        var s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: color }));
        s.position.copy(p); var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
        s.userData.v = new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.abs(Math.cos(b)) + 0.5, Math.sin(a) * Math.sin(b)).multiplyScalar(3.5 + Math.random() * 2.5);
        s.userData.life = 0.8; scene.add(s); parts.push(s);
      }
    }

    /* ---- 루프 ---- */
    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      // 지형 자라남
      for (var c = 0; c < landGroup.children.length; c++) {
        var o = landGroup.children[c];
        if (o.userData.grow) { o.scale.x += (1 - o.scale.x) * Math.min(1, dt * 5); o.scale.y += (1 - o.scale.y) * Math.min(1, dt * 5); o.scale.z += (1 - o.scale.z) * Math.min(1, dt * 5); }
      }
      // 판 연출(승리 후)
      if (plateL.userData.tilt) plateL.rotation.z += (plateL.userData.tilt - plateL.rotation.z) * dt * 3;
      if (plateR.userData.tilt) plateR.rotation.z += (plateR.userData.tilt - plateR.rotation.z) * dt * 3;
      if (plateL.userData.dive) { plateL.rotation.z += (-0.5 - plateL.rotation.z) * dt * 2; plateL.position.y += (-0.6 - plateL.position.y) * dt * 2; }
      // 파티클
      for (var i = parts.length - 1; i >= 0; i--) {
        var s = parts[i]; s.userData.life -= dt;
        if (s.userData.life <= 0) { scene.remove(s); parts.splice(i, 1); continue; }
        s.userData.v.y -= 8 * dt; s.position.addScaledVector(s.userData.v, dt);
        s.material.transparent = true; s.material.opacity = Math.max(0, s.userData.life);
      }
      updateBadges();
      rndr.render(scene, cam);
    }

    // 라운드 시작 시 판 연출 플래그 초기화
    var _origSetup = setupRound;
    setupRound = function () { plateL.userData.tilt = 0; plateR.userData.tilt = 0; plateL.userData.dive = 0; _origSetup(); };

    setupRound();
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    /* ---- 사운드 ---- */
    var actx = null;
    function beep(f, d, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
