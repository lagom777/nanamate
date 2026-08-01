/* 나나메이트 플래그십 3D 게임 — 파동 간섭 (aboutPhysics/04-waves)
 * 두 점파원이 동심원 파동을 낸다. 파원 간격 d 와 위상차 φ 를 슬라이더/드래그로 조절해,
 * 표적 지점에서 보강간섭(마루+마루, 합성 진폭 최대)이 일어나도록 맞추면 클리어.
 * 실시간 2D 간섭장을 3D 평면(높이=합성 변위)으로 시각화한다. 단계별 표적 위치.
 *
 * 물리(정확):  두 동위상/위상차 결맞은 파원의 한 점 P에서의 합성 진폭은
 *   δ = k·(r1 − r2) + φ ,   k = 2π/λ ,   λ = v/f
 *   A합성 = 2A·|cos(δ/2)|   →  δ = 2πn 일 때 보강간섭(최대), δ = (2n+1)π 일 때 상쇄간섭(0).
 * 보강간섭 조건은 경로차 r1−r2 = (n − φ/2π)·λ.
 *
 * 컨테이너: <div id="nm-waves"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문(graceful).
 */
(function () {
  'use strict';

  /* ===== 순수 물리/판정 로직 (테스트 가능, THREE 비의존) ===== */
  var Physics = {
    // 파장 λ = v/f
    wavelength: function (v, f) { return v / f; },
    // 점 P=(px,py)에서 두 파원 S1=(x1,y1), S2=(x2,y2)까지의 경로차 r1 - r2
    pathDiff: function (px, py, x1, y1, x2, y2) {
      var r1 = Math.hypot(px - x1, py - y1);
      var r2 = Math.hypot(px - x2, py - y2);
      return r1 - r2;
    },
    // 점 P에서의 총 위상차 δ = k(r1-r2) + φ
    phaseDiff: function (px, py, x1, y1, x2, y2, lambda, phi) {
      var k = 2 * Math.PI / lambda;
      return k * Physics.pathDiff(px, py, x1, y1, x2, y2) + phi;
    },
    // 정규화 합성 진폭 ∈ [0,1]:  |cos(δ/2)|  (두 파원 진폭 동일 가정, 1/r 감쇠는 시각화 전용)
    normAmplitude: function (px, py, x1, y1, x2, y2, lambda, phi) {
      var d = Physics.phaseDiff(px, py, x1, y1, x2, y2, lambda, phi);
      return Math.abs(Math.cos(d / 2));
    },
    // 승리판정: 표적에서 정규화 합성 진폭이 임계 이상이면 보강간섭 성립
    isConstructive: function (amp, threshold) { return amp >= threshold; },
    // 한 번에: 표적이 보강간섭인지
    targetWins: function (target, x1, y1, x2, y2, lambda, phi, threshold) {
      var amp = Physics.normAmplitude(target.x, target.y, x1, y1, x2, y2, lambda, phi);
      return Physics.isConstructive(amp, threshold);
    }
  };

  // 노드 테스트용 export (브라우저에선 무시)
  if (typeof module !== 'undefined' && module.exports) { module.exports = { Physics: Physics }; }

  function init() {
    var host = document.getElementById('nm-waves');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var W = host.clientWidth || 640, H = 380, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 300);
      cam.position.set(0, 16, 20); cam.lookAt(0, 0, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    var kernel = window.NMGameKernel && window.NMGameKernel.create ? window.NMGameKernel.create(host, { gameId: 'waves' }) : null;
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:grab;touch-action:none;display:block;background:#04121b';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    var dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(4, 12, 6); scene.add(dl);

    // 시뮬레이션 평면(월드) 범위:  x∈[-FW/2,FW/2], y∈[-FD/2,FD/2]
    var FW = 24, FD = 24, SEG = 96;

    // 간섭장 평면(높이=합성 변위, 색=진폭)
    var geo = new THREE.PlaneGeometry(FW, FD, SEG, SEG);
    var mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, metalness: 0.1, roughness: 0.85, flatShading: false });
    var field = new THREE.Mesh(geo, mat);
    field.rotation.x = -Math.PI / 2; scene.add(field);
    // 정점 색 버퍼
    var vcount = geo.attributes.position.count;
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(vcount * 3), 3));

    // 평면 격자 (월드 좌표 -> field local 좌표는 동일 x, 그리고 local y = world y, 회전으로 z<-y)
    var grid = new THREE.GridHelper(FW, 24, 0x14506b, 0x0c3247); grid.position.y = -0.02; scene.add(grid);

    // 두 파원 마커 + 표적 마커 (월드: x = local x, z = -local y  ← rotation.x=-90°)
    function srcMesh(color) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 20), new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 }));
      scene.add(m); return m;
    }
    var src1 = srcMesh(0x00d4ff), src2 = srcMesh(0x00d4ff);
    var targetMesh = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.16, 12, 28), new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0x5b4500, emissiveIntensity: 0.6 }));
    targetMesh.rotation.x = Math.PI / 2; scene.add(targetMesh);
    var targetPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
    scene.add(targetPost);

    // 월드<->필드 좌표 헬퍼:  파원/표적은 시뮬 평면의 (sx, sy) 좌표계로 다룬다.
    //   world.x = sx ,  world.z = -sy ,  world.y = height
    function place(mesh, sx, sy, hY) { mesh.position.set(sx, hY || 0, -sy); }

    /* ===== 게임 상태 ===== */
    var SOUND_V = 6;        // 시뮬 단위 파동 속력 (시각화/계산 일관)
    var THRESH = 0.92;      // 보강간섭 판정 임계(정규화 진폭)
    var levels = [
      { f: 1.5, target: { x: 0, y: 7 }, hint: '대칭 파원 → 중앙선은 보강' },
      { f: 1.8, target: { x: 2, y: 6 }, hint: '살짝 치우친 표적 — d 미세 조정' },
      { f: 2.0, target: { x: 5, y: 6 }, hint: '치우친 표적 — 간격 d' },
      { f: 2.2, target: { x: -4, y: 5 }, hint: '반대쪽 표적' },
      { f: 2.5, target: { x: -6, y: 4 }, hint: '위상차 φ로 마루 맞추기' },
      { f: 2.7, target: { x: 3, y: -4 }, hint: '아래쪽 표적 + φ' },
      { f: 3.0, target: { x: 4, y: -5 }, hint: '경로차 ≈ (n−φ/2π)·λ' },
      { f: 3.2, target: { x: -5, y: -3 }, hint: '마스터 — d·φ 동시' }
    ];
    var TRANSFER_LINE = '두 파동이 마루+마루로 만나면 보강간섭, 마루+골이면 상쇄한다.';
    var lvl = 0, score = 0, won = false;

    // 조절 변수:  d = 파원 간격(두 파원은 x=±d/2), phi = 위상차
    // 초기값은 일부러 상쇄 상태(phi=pi)에서 시작 → 플레이어가 조절해야 보강 달성
    var D_INIT = 4, PHI_INIT = Math.PI;
    var d = D_INIT, phi = PHI_INIT;
    var SRC_Y = -8;         // 두 파원이 놓인 y (아래쪽 가장자리)

    function s1() { return { x: -d / 2, y: SRC_Y }; }
    function s2() { return { x: d / 2, y: SRC_Y }; }
    function lambda() { return Physics.wavelength(SOUND_V, levels[lvl].f); }

    /* ===== HUD / 컨트롤 ===== */
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:10px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#e6f7ff;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;line-height:1.55';
    host.appendChild(hud);

    var ctrl = document.createElement('div');
    ctrl.style.cssText = 'position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:5px;align-items:flex-end;font:600 12px "Noto Sans KR",sans-serif;color:#cdeeff';
    function mkSlider(labelText, min, max, step, val, onIn) {
      var wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:1px';
      var lab = document.createElement('label'); lab.textContent = labelText;
      var s = document.createElement('input'); s.type = 'range'; s.min = min; s.max = max; s.step = step; s.value = val; s.style.cssText = 'width:140px;accent-color:#00d4ff';
      s.oninput = function () { onIn(parseFloat(s.value)); }; wrap.appendChild(lab); wrap.appendChild(s); ctrl.appendChild(wrap); return s;
    }
    var dSlider = mkSlider('파원 간격 d', '1', '16', '0.2', String(D_INIT), function (v) { d = v; refresh(true); });
    var phiSlider = mkSlider('위상차 φ (×π)', '0', '2', '0.02', String(PHI_INIT / Math.PI), function (v) { phi = v * Math.PI; refresh(true); });
    var rb = document.createElement('button'); rb.textContent = '↺ 리셋'; rb.style.cssText = 'border:1px solid #1c6f8f;border-radius:8px;background:#06283a;color:#bfe6ff;padding:4px 12px;font-weight:700;cursor:pointer';
    rb.onclick = function () { resetLevel(); };
    ctrl.appendChild(rb); host.appendChild(ctrl);

    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;left:10px;bottom:10px;right:10px;font:600 12px "Noto Sans KR",sans-serif;color:#9fd9ef;text-shadow:0 1px 2px rgba(0,0,0,.7)';
    host.appendChild(tip);

    function setHud(msg) {
      var amp = Physics.normAmplitude(levels[lvl].target.x, levels[lvl].target.y, s1().x, s1().y, s2().x, s2().y, lambda(), phi);
      var pct = Math.round(amp * 100);
      var bar = '';
      var fill = Math.round(amp * 14);
      for (var i = 0; i < 14; i++) bar += i < fill ? '█' : '░';
      var color = amp >= THRESH ? '#34d399' : (amp < 0.2 ? '#f87171' : '#fbbf24');
      hud.innerHTML =
        'λ = ' + lambda().toFixed(2) + ' (f=' + levels[lvl].f + ')<br>' +
        '표적 합성 진폭 <span style="color:' + color + '">' + pct + '%</span> ' +
        '<span style="font-family:monospace;color:' + color + '">' + bar + '</span><br>' +
        '🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + levels.length +
        (msg ? '<br><b style="color:#34d399">' + msg + '</b>' : '');
    }

    /* ===== 간섭장 갱신 (시각화) ===== */
    var tNow = 0;
    function updateField() {
      var pos = geo.attributes.position, col = geo.attributes.color;
      var S1 = s1(), S2 = s2(), lam = lambda(), k = 2 * Math.PI / lam, omega = 2 * Math.PI * levels[lvl].f;
      // 시간 위상: 시각화용 (정적 간섭무늬는 t 평균이므로 형태 동일, 애니메이션만 부여)
      var phase = omega * tNow * 0.0006;
      for (var i = 0; i < pos.count; i++) {
        var lx = pos.getX(i), ly = pos.getY(i);       // 평면 local 좌표 (= 시뮬 sx, sy)
        var r1 = Math.hypot(lx - S1.x, ly - S1.y);
        var r2 = Math.hypot(lx - S2.x, ly - S2.y);
        var w1 = Math.sin(k * r1 - phase) / (1 + r1 * 0.18);
        var w2 = Math.sin(k * r2 - phase + phi) / (1 + r2 * 0.18);
        var z = (w1 + w2) * 1.6;
        pos.setZ(i, z);
        // 색: 시간평균 합성 진폭(=정적 간섭무늬) |cos(δ/2)| 로 칠한다
        var delta = k * (r1 - r2) + phi;
        var amp = Math.abs(Math.cos(delta / 2));     // 0(상쇄)~1(보강)
        // 파랑(상쇄) -> 청록 -> 초록(보강)
        col.setXYZ(i, 0.0 + amp * 0.2, 0.35 + amp * 0.55, 0.75 - amp * 0.25);
      }
      pos.needsUpdate = true; col.needsUpdate = true; geo.computeVertexNormals();
    }

    /* ===== 갱신 + 승리판정 ===== */
    // checkWin: 슬라이더 입력에서만 true. 표적 드래그(탐색용)는 시각화만 갱신하고 승리판정을 하지 않는다
    // — 드래그 가능한 영역엔 항상 보강 무늬가 존재하므로, 드래그만으로 전 단계 클리어되는 꼼수 방지.
    function refresh(checkWin) {
      var S1 = s1(), S2 = s2();
      place(src1, S1.x, S1.y); place(src2, S2.x, S2.y);
      var T = levels[lvl].target;
      var amp = Physics.normAmplitude(T.x, T.y, S1.x, S1.y, S2.x, S2.y, lambda(), phi);
      var hY = 1.6 + amp * 1.4;
      place(targetMesh, T.x, T.y, hY); place(targetPost, T.x, T.y, hY / 2); targetPost.scale.y = hY / 1.4;
      targetMesh.material.color.setHex(amp >= THRESH ? 0x34d399 : 0xfacc15);
      targetMesh.material.emissive.setHex(amp >= THRESH ? 0x065f46 : 0x5b4500);
      setHud();
      if (checkWin && !won && Physics.isConstructive(amp, THRESH)) win();
    }

    function resetLevel() {
      won = false; d = D_INIT;
      // 시작 위상차를 현재 표적에서 "정확히 상쇄(δ=π)"가 되게 잡아, 매 단계 비-승리 상태로 출발시킨다.
      // δ = k(r1−r2) + φ = π  ⇒  φ = π − k(r1−r2), [0,2π) 로 정규화 (φ 슬라이더 범위 내).
      var k = 2 * Math.PI / lambda();
      var pd = Physics.pathDiff(levels[lvl].target.x, levels[lvl].target.y, s1().x, s1().y, s2().x, s2().y);
      phi = Math.PI - k * pd;
      phi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      dSlider.value = String(D_INIT); phiSlider.value = String(phi / Math.PI);
      tip.textContent = '💡 ' + levels[lvl].hint;
      refresh();
    }

    function win() {
      if (won) return;
      won = true; score += 100; chime();
      burst(targetMesh.position.clone(), 0x34d399);
      setHud('보강간섭! 마루+마루로 진폭 최대 🎉');
      if (kernel) kernel.teach({ kind: 'success', coach: '보강간섭 — 표적 진폭이 최대에 가깝습니다' });
      if (lvl + 1 >= levels.length) {
        // 마지막 단계: lvl 을 범위 밖(levels.length)으로 올리지 않는다 — rAF 루프가 매 프레임
        // levels[lvl] 을 읽으므로 3초 대기 동안 TypeError 가 쏟아진다. 컨트롤도 잠가 refresh/setHud 재진입 차단.
        hud.innerHTML = '🎉 모든 단계 클리어! 총 ' + score + '점';
        rndr.domElement.style.pointerEvents = 'none';
        dSlider.disabled = true; phiSlider.disabled = true; rb.disabled = true;
        if (kernel) {
          kernel.saveBest(score);
          kernel.teach({ kind: 'clear', transfer: TRANSFER_LINE, onAgain: function () {
            rndr.domElement.style.pointerEvents = '';
            dSlider.disabled = false; phiSlider.disabled = false; rb.disabled = false;
            lvl = 0; score = 0; won = false; resetLevel();
          }});
        } else {
          setTimeout(function () {
            rndr.domElement.style.pointerEvents = '';
            dSlider.disabled = false; phiSlider.disabled = false; rb.disabled = false;
            lvl = 0; score = 0; resetLevel();
          }, 3000);
        }
      } else {
        lvl++;
        setTimeout(function () { resetLevel(); }, 1500);
      }
    }

    /* ===== 표적 드래그(평면 위에서 표적 위치 이동) + 카메라 회전 ===== */
    var ray = new THREE.Raycaster(), gplane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    var dragTarget = false, rotCam = false, rotStartX = 0, camAng = 0;
    function ndc(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return new THREE.Vector2(((p.clientX - r.left) / r.width) * 2 - 1, -((p.clientY - r.top) / r.height) * 2 + 1); }
    function worldPt(e) { ray.setFromCamera(ndc(e), cam); var pt = new THREE.Vector3(); ray.ray.intersectPlane(gplane, pt); return pt; }
    function onDown(e) {
      var pt = worldPt(e); if (!pt) return;
      var sx = pt.x, sy = -pt.z, T = levels[lvl].target;
      if (Math.hypot(sx - T.x, sy - T.y) < 2.0) { dragTarget = true; rndr.domElement.style.cursor = 'grabbing'; }
      else { rotCam = true; rotStartX = (e.touches ? e.touches[0].clientX : e.clientX); }
      e.preventDefault();
    }
    function onMove(e) {
      if (dragTarget) {
        var pt = worldPt(e); if (pt) {
          var T = levels[lvl].target;
          T.x = Math.max(-FW / 2 + 1, Math.min(FW / 2 - 1, Math.round(pt.x * 2) / 2));
          T.y = Math.max(SRC_Y + 4, Math.min(FD / 2 - 1, Math.round(-pt.z * 2) / 2));
          refresh();
        }
        e.preventDefault();
      } else if (rotCam) {
        var cx = (e.touches ? e.touches[0].clientX : e.clientX);
        camAng += (cx - rotStartX) * 0.005; rotStartX = cx;
        var R = Math.hypot(20, 0);
        cam.position.set(Math.sin(camAng) * R, 16, Math.cos(camAng) * R); cam.lookAt(0, 0, 0);
        e.preventDefault();
      }
    }
    function onUp() { dragTarget = false; rotCam = false; rndr.domElement.style.cursor = 'grab'; }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    /* ===== 파티클 ===== */
    var parts = [];
    function burst(p, color) {
      for (var i = 0; i < 18; i++) {
        var s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: color }));
        s.position.copy(p); var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
        s.userData.v = new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.abs(Math.cos(b)) + 0.5, Math.sin(a) * Math.sin(b)).multiplyScalar(4 + Math.random() * 3);
        s.userData.life = 0.8; scene.add(s); parts.push(s);
      }
    }

    /* ===== 루프 ===== */
    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts; tNow = ts;
      updateField();
      targetMesh.rotation.z += 0.04;
      var puls = 1 + 0.12 * Math.sin(ts / 280);
      src1.scale.setScalar(puls); src2.scale.setScalar(puls);
      for (var i = parts.length - 1; i >= 0; i--) {
        var s = parts[i]; s.userData.life -= dt;
        if (s.userData.life <= 0) { scene.remove(s); parts.splice(i, 1); continue; }
        s.userData.v.y -= 8 * dt; s.position.addScaledVector(s.userData.v, dt);
        s.material.transparent = true; s.material.opacity = Math.max(0, s.userData.life);
      }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    /* ===== 사운드 ===== */
    var actx = null;
    function beep(fr, dur, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = fr; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (fr, i) { setTimeout(function () { beep(fr, 0.18, 'triangle'); }, i * 110); }); }

    resetLevel();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
