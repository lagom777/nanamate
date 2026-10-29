/* 나나메이트 플래그십 3D 게임 — 3D 기하: 피타고라스 직각삼각형 (aboutMath/04-geometry)
 * 두 직각변 a, b를 드래그(격자 스냅)로 정하면 빗변 c가 그려지고, 각 변 위에 정사각형(넓이 a²·b²·c²)이 3D로 솟는다.
 * 목표는 정수 피타고라스 쌍(3-4-5, 6-8-10, 5-12-13). a²+b²이 목표 빗변 c²와 같아지면 클리어. 3D 회전·점수·파티클·사운드.
 * 컨테이너: <div id="nm-geometry"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문(graceful).
 *
 * 사실성: 피타고라스 정리 a²+b²=c²와 실제 정수 피타고라스 세 쌍만 사용.
 *   3-4-5 (9+16=25), 6-8-10 (36+64=100), 5-12-13 (25+144=169) — 모두 a²+b²=c² 성립.
 */
(function () {
  'use strict';

  // ───────────────────────────── 순수 로직 (테스트 가능) ─────────────────────────────
  // 목표 단계: 정수 피타고라스 세 쌍. c = 목표 빗변 길이.
  // snap 상한 42 이내 정수 피타고라스 쌍
  var LEVELS = [
    { a: 3, b: 4, c: 5 },
    { a: 6, b: 8, c: 10 },
    { a: 5, b: 12, c: 13 },
    { a: 9, b: 12, c: 15 },
    { a: 8, b: 15, c: 17 },
    { a: 12, b: 16, c: 20 },
    { a: 7, b: 24, c: 25 },
    { a: 20, b: 21, c: 29 }
  ];
  var TRANSFER_LINE = '직각삼각형에서 a²+b²=c² — 각 변 위 정사각형 넓이의 합이 빗변 정사각형과 같다.';

  // 빗변 길이 c = √(a²+b²)
  function hypotenuse(a, b) {
    return Math.sqrt(a * a + b * b);
  }

  // 각 변 위 정사각형의 넓이
  function squares(a, b) {
    return { aSq: a * a, bSq: b * b, sum: a * a + b * b, cSq: a * a + b * b };
  }

  // 빗변이 정수가 되는가(정수 피타고라스 세 쌍 형성)
  function isIntegerHypotenuse(a, b) {
    if (a <= 0 || b <= 0) return false;
    var c2 = a * a + b * b;
    var c = Math.round(Math.sqrt(c2));
    return c * c === c2;
  }

  // 승리 판정: 드래그한 두 직각변 a,b가 목표 빗변 c를 만든다 (a²+b² === c²).
  //   정수 격자 위에서 a²+b² === level.c² 이면, 그 a,b는 목표 세 쌍의 직각변(순서 무관)이다.
  //   틀린 입력(예: 3,4 목표에 3,5)은 9+25=34 ≠ 25 이므로 거짓.
  function isLevelCleared(a, b, level) {
    if (!level) return false;
    if (a <= 0 || b <= 0) return false;
    return (a * a + b * b) === (level.c * level.c);
  }

  var LOGIC = {
    LEVELS: LEVELS, TRANSFER_LINE: TRANSFER_LINE,
    hypotenuse: hypotenuse,
    squares: squares,
    isIntegerHypotenuse: isIntegerHypotenuse,
    isLevelCleared: isLevelCleared
  };

  // node 테스트용 export (브라우저에선 무시됨)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LOGIC;
  }
  if (typeof window !== 'undefined') {
    window.NM_GEOMETRY_LOGIC = LOGIC;
  }

  // ───────────────────────────── 3D 게임 (브라우저 전용) ─────────────────────────────
  function init() {
    if (typeof document === 'undefined') return;
    var host = document.getElementById('nm-geometry');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var W = host.clientWidth || 640, H = 380, scene, cam, rndr;
    var P3 = window.NMP3 || null;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 400);
      if (P3) rndr = P3.renderer(W, H);
      if (!rndr) {
        rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    var kernel = window.NMGameKernel && window.NMGameKernel.create ? window.NMGameKernel.create(host, { gameId: 'geometry' }) : null;
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:grab;touch-action:none;display:block;background:linear-gradient(180deg,#fff5f7,#fde8ec)';
    host.appendChild(rndr.domElement);

    if (P3) {
      P3.lightRig(scene, {
        sky: 0xfff1f4, ground: 0xe6c6cf, hemiI: 0.7,
        keyColor: 0xffe2b0, keyI: 1.0, keyX: 6, keyY: 14, keyZ: 8,
        rimColor: 0x9fb6ff, rimI: 0.5, rimX: -8, rimY: 6, rimZ: -6
      });
    } else {
      scene.add(new THREE.AmbientLight(0xffffff, 0.85));
      var dl = new THREE.DirectionalLight(0xffffff, 0.55); dl.position.set(6, 14, 8); scene.add(dl);
      var dl2 = new THREE.DirectionalLight(0xffffff, 0.25); dl2.position.set(-8, 6, -6); scene.add(dl2);
    }

    // 회전 그룹(전체 도형을 3D 회전)
    var ROOT = new THREE.Group(); scene.add(ROOT);

    // 격자 평면(XZ). 직각은 원점 A에 둔다. a는 +X, b는 +Z 방향.
    var GRID = 14;
    var grid = new THREE.GridHelper(GRID, GRID, 0xf9a8b8, 0xfbcdd6); grid.position.y = 0; ROOT.add(grid);

    // 좌표축 축선(a축=빨강계열, b축=파랑계열)
    function lineSeg(p1, p2, color, w) {
      var g = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      var m = new THREE.LineBasicMaterial({ color: color, linewidth: w || 1 });
      return new THREE.Line(g, m);
    }
    var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };

    // 핸들(드래그 점): a핸들은 +X축, b핸들은 +Z축
    function makeHandle(color) {
      return new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20),
        new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.25, roughness: 0.4 }));
    }
    var aHandle = makeHandle(0x16a34a); ROOT.add(aHandle); // 초록 = a변
    var bHandle = makeHandle(0x2563eb); ROOT.add(bHandle); // 파랑 = b변

    // 삼각형 변(선)과 정사각형(넓이) 메쉬는 매 redraw에서 갱신
    var triLines = []; var squareMeshes = []; var sqLabels = [];

    function clearGroup(arr) { for (var i = 0; i < arr.length; i++) ROOT.remove(arr[i]); arr.length = 0; }

    // 캔버스 라벨 스프라이트
    function lbl(txt, color) {
      var cv = document.createElement('canvas'), ctx = cv.getContext('2d');
      var fs = 40, font = '700 ' + fs + 'px "Noto Sans KR",sans-serif';
      ctx.font = font; cv.width = Math.ceil(ctx.measureText(txt).width) + 24; cv.height = fs + 20;
      ctx = cv.getContext('2d'); ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = color || '#1f2430'; ctx.fillText(txt, cv.width / 2, cv.height / 2);
      var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false }));
      var k = 0.013; sp.scale.set(cv.width * k, cv.height * k, 1); return sp;
    }

    var a = 3, b = 2; // 현재 직각변 (격자 정수)
    var lvl = 0, score = 0, won = false;

    // 변 위에 정사각형(넓이 시각화)을 세운다. 변은 평면 위, 정사각형은 바깥쪽으로 솟음(높이 = 변 길이만큼)
    function buildSquare(corner, dirAlong, dirOut, len, color, opacity) {
      // corner: 변의 시작점, dirAlong: 변 방향 단위, dirOut: 정사각형이 뻗는 단위(평면 바깥/옆)
      var w = len, hgt = len;
      var geo = new THREE.PlaneGeometry(w, hgt);
      var mat = new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: opacity == null ? 0.55 : opacity, side: THREE.DoubleSide, roughness: 0.6 });
      var mesh = new THREE.Mesh(geo, mat);
      // 정사각형 중심 = corner + dirAlong*len/2 + dirOut*len/2
      var center = corner.clone().add(dirAlong.clone().multiplyScalar(len / 2)).add(dirOut.clone().multiplyScalar(len / 2));
      mesh.position.copy(center);
      // 평면의 법선을 (dirAlong × dirOut)로 정렬
      var normal = new THREE.Vector3().crossVectors(dirAlong, dirOut).normalize();
      // PlaneGeometry는 기본 법선 +Z, x축은 +X. quaternion으로 정렬
      var m4 = new THREE.Matrix4();
      var xAxis = dirAlong.clone().normalize();
      var yAxis = dirOut.clone().normalize();
      m4.makeBasis(xAxis, yAxis, normal);
      mesh.quaternion.setFromRotationMatrix(m4);
      return mesh;
    }

    function redraw() {
      clearGroup(triLines); clearGroup(squareMeshes); clearGroup(sqLabels);
      var A = V(0, 0, 0), B = V(a, 0, 0), C = V(0, 0, b);
      // 삼각형 윤곽: A-B (a변, X축), A-C (b변, Z축), B-C (빗변 c)
      triLines.push(lineSeg(A, B, 0x16a34a, 3));
      triLines.push(lineSeg(A, C, 0x2563eb, 3));
      triLines.push(lineSeg(B, C, 0xf43f5e, 3));
      // 직각 표시(작은 ㄱ자)
      triLines.push(lineSeg(V(0.5, 0.01, 0), V(0.5, 0.01, 0.5), 0x64748b, 1));
      triLines.push(lineSeg(V(0.5, 0.01, 0.5), V(0, 0.01, 0.5), 0x64748b, 1));
      for (var i = 0; i < triLines.length; i++) ROOT.add(triLines[i]);

      // a² 정사각형: A→B 변(+X) 위, 바깥(−Z)으로 솟되 평면에서 위(+Y)로 세운다.
      // 평면 위로 세우기 위해 dirOut을 +Y로. → 변 위 수직 정사각형(벽처럼)
      var sqA = buildSquare(A, V(1, 0, 0), V(0, 1, 0), a, 0x16a34a, 0.5);
      var sqB = buildSquare(A, V(0, 0, 1), V(0, 1, 0), b, 0x2563eb, 0.5);
      // 빗변 c 정사각형: B→C 방향, 위(+Y)로 세움
      var cVec = C.clone().sub(B); var cLen = cVec.length();
      var cDir = cVec.clone().normalize();
      var sqC = buildSquare(B, cDir, V(0, 1, 0), cLen, 0xf43f5e, 0.5);
      squareMeshes.push(sqA, sqB, sqC);
      for (var s = 0; s < squareMeshes.length; s++) ROOT.add(squareMeshes[s]);

      // 라벨: 변 길이 + 정사각형 넓이
      var sq = LOGIC.squares(a, b);
      var la = lbl('a=' + a + '  a²=' + sq.aSq, '#16a34a'); la.position.set(a / 2, a + 0.6, -0.2); sqLabels.push(la);
      var lb = lbl('b=' + b + '  b²=' + sq.bSq, '#2563eb'); lb.position.set(-0.2, b + 0.6, b / 2); sqLabels.push(lb);
      var cMid = B.clone().add(C).multiplyScalar(0.5);
      var lc = lbl('c=' + cLen.toFixed(2) + '  c²=' + sq.cSq, '#f43f5e'); lc.position.set(cMid.x, cLen + 0.6, cMid.z); sqLabels.push(lc);
      for (var L = 0; L < sqLabels.length; L++) ROOT.add(sqLabels[L]);

      aHandle.position.set(a, 0, 0);
      bHandle.position.set(0, 0, b);

      setHud();
      checkWin();
    }

    // ── HUD ──
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:10px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#1f2430;pointer-events:none;line-height:1.55;text-shadow:0 1px 2px rgba(255,255,255,.7)';
    host.appendChild(hud);
    function setHud(msg) {
      var L = LEVELS[lvl];
      var sq = LOGIC.squares(a, b);
      var goal = L ? ('목표 빗변 c = ' + L.c + ' (' + L.a + '-' + L.b + '-' + L.c + ')') : '';
      hud.innerHTML = '🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + LEVELS.length +
        '<br>' + goal +
        '<br>현재: a²(' + sq.aSq + ') + b²(' + sq.bSq + ') = ' + sq.sum +
        (L ? ('  /  c²=' + (L.c * L.c)) : '') +
        (msg ? '<br><b style="color:#f43f5e">' + msg + '</b>' : '');
    }
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;left:10px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#6b7280;text-shadow:0 1px 2px rgba(255,255,255,.7)';
    tip.textContent = '초록·파랑 점을 끌어 직각변 a, b를 정하세요 · 빈 곳을 끌면 3D 회전';
    host.appendChild(tip);
    var rb = document.createElement('button');
    rb.textContent = '↺ 리셋'; rb.style.cssText = 'position:absolute;right:10px;top:10px;border:1px solid #f9a8b8;border-radius:8px;background:#fff;padding:4px 10px;font-weight:700;cursor:pointer;color:#f43f5e';
    rb.onclick = function () { resetLevel(); };
    host.appendChild(rb);

    function resetLevel() { won = false; a = 3; b = 2; redraw(); }

    function checkWin() {
      var L = LEVELS[lvl];
      if (!L || won) return;
      if (LOGIC.isLevelCleared(a, b, L)) {
        won = true; score += 100; chime();
        burst(V(a, 0.5, b), 0xf43f5e); burst(V(a / 2, a, 0), 0x16a34a); burst(V(0, b, b / 2), 0x2563eb);
        if (cine) cine.shake(0.22, 0.45);
        lvl++;
        if (lvl >= LEVELS.length) {
          setHud('🎉 모든 단계 클리어! 총 ' + score + '점');
          if (kernel) {
            kernel.saveBest(score);
            kernel.teach({ kind: 'clear', transfer: TRANSFER_LINE, onAgain: function () { lvl = 0; score = 0; resetLevel(); } });
          } else setTimeout(function () { lvl = 0; score = 0; resetLevel(); }, 2800);
        } else {
          setHud('정답! a² + b² = c² 성립 → 다음 단계');
          if (kernel) kernel.teach({ kind: 'success', coach: 'a²+b²=c² 성립!' });
          setTimeout(function () { won = false; a = 3; b = 2; redraw(); }, 1500);
        }
      }
    }

    // ── 입력: 핸들 드래그(격자 스냅) + 빈 공간 드래그로 회전 ──
    var ray = new THREE.Raycaster();
    var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // y=0 평면
    var dragMode = null; // 'a' | 'b' | 'rotate'
    var lastX = 0, lastY = 0;
    ROOT.rotation.y = -0.5; ROOT.rotation.x = 0; // 초기 시점

    function ndc(e) {
      var r = rndr.domElement.getBoundingClientRect();
      var p = e.touches ? e.touches[0] : e;
      return new THREE.Vector2(((p.clientX - r.left) / r.width) * 2 - 1, -((p.clientY - r.top) / r.height) * 2 + 1);
    }
    function planePt(e) { ray.setFromCamera(ndc(e), cam); var pt = new THREE.Vector3(); ray.ray.intersectPlane(plane, pt); return pt; }

    function pickHandle(e) {
      ray.setFromCamera(ndc(e), cam);
      var hits = ray.intersectObjects([aHandle, bHandle], false);
      if (hits.length) return hits[0].object === aHandle ? 'a' : 'b';
      return null;
    }

    function onDown(e) {
      var pe = e.touches ? e.touches[0] : e;
      lastX = pe.clientX; lastY = pe.clientY;
      var h = pickHandle(e);
      if (h) { dragMode = h; rndr.domElement.style.cursor = 'grabbing'; }
      else { dragMode = 'rotate'; rndr.domElement.style.cursor = 'move'; }
      e.preventDefault();
    }
    function snap(v) { return Math.max(1, Math.min(42, Math.round(v))); }
    function onMove(e) {
      if (!dragMode) return;
      if (dragMode === 'rotate') {
        var pe = e.touches ? e.touches[0] : e;
        var dx = pe.clientX - lastX, dy = pe.clientY - lastY;
        lastX = pe.clientX; lastY = pe.clientY;
        ROOT.rotation.y += dx * 0.01;
        ROOT.rotation.x = Math.max(-0.2, Math.min(1.2, ROOT.rotation.x + dy * 0.01));
      } else {
        // 핸들 드래그: 평면 위 교점을 ROOT 로컬 좌표로 변환 후 해당 축 성분만 사용
        var pt = planePt(e);
        if (pt) {
          var local = ROOT.worldToLocal(pt.clone());
          if (dragMode === 'a') a = snap(local.x);
          else b = snap(local.z);
          redraw();
        }
      }
      e.preventDefault();
    }
    function onUp() { dragMode = null; rndr.domElement.style.cursor = 'grab'; }

    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onUp, { passive: false });

    // 카메라 — 도형 전체가 보이도록 위/뒤에서
    var cine = P3 ? P3.cineCam(cam, { x: 2, y: 14, z: 18 }, { lookAt: { x: 2, y: 3, z: 2 }, dollyY: -3, dollyZ: 7, driftAmp: 0.12 }) : null;
    if (!cine) { cam.position.set(2, 14, 18); cam.lookAt(2, 3, 2); }

    // ── 파티클 ──
    var parts = [];
    var fx = P3 ? P3.particles(ROOT, { max: 48 }) : null;
    function burst(p, color) {
      if (fx) { fx.burst(p, color, 14, 3.4, 0.8, 0.6, 1.0); return; }
      for (var i = 0; i < 14; i++) {
        var s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: color }));
        s.position.copy(p); var ang = Math.random() * Math.PI * 2, el2 = Math.random() * Math.PI;
        s.userData.v = new THREE.Vector3(Math.cos(ang) * Math.sin(el2), Math.cos(el2) + 1, Math.sin(ang) * Math.sin(el2)).multiplyScalar(3 + Math.random() * 3);
        s.userData.life = 0.8; ROOT.add(s); parts.push(s);
      }
    }

    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      if (cine) cine.tick(dt, ts / 1000);
      if (fx) fx.tick(dt);
      // 핸들 살짝 펄스
      var pulse = 1 + 0.08 * Math.sin(ts / 300);
      aHandle.scale.setScalar(pulse); bHandle.scale.setScalar(pulse);
      for (var i = parts.length - 1; i >= 0; i--) {
        var s = parts[i]; s.userData.life -= dt;
        if (s.userData.life <= 0) { ROOT.remove(s); parts.splice(i, 1); continue; }
        s.userData.v.y -= 7 * dt; s.position.addScaledVector(s.userData.v, dt);
        s.material.transparent = true; s.material.opacity = Math.max(0, s.userData.life);
      }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () {
      var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H);
    });

    // ── 사운드 ──
    var actx = null;
    function beep(fr, d, type) {
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = type || 'sine'; o.frequency.value = fr; o.connect(g); g.connect(actx.destination);
        var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.1, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.start(t); o.stop(t + d + 0.02);
      } catch (e) {}
    }
    function chime() { [523, 659, 784, 1047].forEach(function (fr, i) { setTimeout(function () { beep(fr, 0.18, 'triangle'); }, i * 110); }); }

    redraw();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
