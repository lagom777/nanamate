/* 나나메이트 플래그십 3D 게임 — 시장 균형 (aboutEconomics/01-micro)
 * 수요곡선(우하향) Qd = a − b·P, 공급곡선(우상향) Qs = c + d·P 를 2.5D 그래프로 표시.
 * 가격선(수평 점선)을 마우스/터치로 위아래 드래그하면 수요량·공급량이 실시간 변하고,
 * 잉여(공급>수요)·부족(수요>공급)이 막대로 시각화된다. 균형가(D=S 교차)에 충분히 가까우면 "시장 청산" 클리어.
 * 단계별로 곡선의 기울기/절편이 바뀐다.
 * 컨테이너: <div id="nm-market"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문(graceful).
 *
 * 경제학적 사실: 수요는 가격에 반비례(우하향), 공급은 가격에 비례(우상향).
 * 균형가격 P* = (a − c)/(b + d), 균형거래량 Q* = a − b·P*. (선형 수요·공급 모형)
 */
(function () {
  // ── 순수 로직(테스트 가능) ───────────────────────────────────────────────
  // 수요량: Qd = a − b·P (b>0 → 우하향)
  function demandQty(model, P) { return model.a - model.b * P; }
  // 공급량: Qs = c + d·P (d>0 → 우상향)
  function supplyQty(model, P) { return model.c + model.d * P; }
  // 균형가격: Qd = Qs → a − bP = c + dP → P* = (a − c)/(b + d)
  function equilibriumPrice(model) { return (model.a - model.c) / (model.b + model.d); }
  // 균형거래량: Q* = a − b·P*
  function equilibriumQty(model) { return demandQty(model, equilibriumPrice(model)); }
  // 설정 가격에서의 초과(>0 공급과잉=잉여, <0 수요과잉=부족): Qs − Qd
  function excess(model, P) { return supplyQty(model, P) - demandQty(model, P); }
  // 승리 판정: |Qs − Qd| 이 임계 이하이면 시장 청산
  function isCleared(model, P, tol) { return Math.abs(excess(model, P)) <= tol; }

  // 노드 테스트용 export (브라우저에선 무시됨)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { demandQty: demandQty, supplyQty: supplyQty, equilibriumPrice: equilibriumPrice, equilibriumQty: equilibriumQty, excess: excess, isCleared: isCleared };
  }

  // ── 렌더링/상호작용(브라우저 전용) ──────────────────────────────────────
  function init() {
    var host = typeof document !== 'undefined' && document.getElementById('nm-market');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var W = host.clientWidth || 640, H = 360, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 200);
      cam.position.set(0, 0, 13); cam.lookAt(0, 0, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:ns-resize;touch-action:none;display:block';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    var dl = new THREE.DirectionalLight(0xffffff, 0.45); dl.position.set(2, 5, 8); scene.add(dl);

    // ── 좌표계: 화면 X = 수량 Q, 화면 Y = 가격 P ──
    // 모델 P,Q 범위
    var PMIN = 0, PMAX = 10, QMIN = 0, QMAX = 12;
    // 화면(scene) 범위
    var SX0 = -4.5, SX1 = 4.5, SY0 = -3.2, SY1 = 3.2;
    function qToX(Q) { return SX0 + (Q - QMIN) / (QMAX - QMIN) * (SX1 - SX0); }
    function pToY(P) { return SY0 + (P - PMIN) / (PMAX - PMIN) * (SY1 - SY0); }
    function yToP(y) { return PMIN + (y - SY0) / (SY1 - SY0) * (PMAX - PMIN); }

    // 격자
    var gmat = new THREE.LineBasicMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.45 });
    for (var gq = QMIN; gq <= QMAX; gq += 2) addLine(qToX(gq), SY0, qToX(gq), SY1, gmat);
    for (var gp = PMIN; gp <= PMAX; gp += 2) addLine(SX0, pToY(gp), SX1, pToY(gp), gmat);
    // 축
    var axMat = new THREE.LineBasicMaterial({ color: 0x64748b });
    addLine(SX0, SY0, SX0, SY1 + 0.3, axMat); // 가격축(세로)
    addLine(SX0, SY0, SX1 + 0.3, SY0, axMat); // 수량축(가로)
    function addLine(x1, y1, x2, y2, m) { var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)]); scene.add(new THREE.Line(g, m)); }

    // 라벨 스프라이트
    function lbl(txt, col) {
      var cv = document.createElement('canvas'), x = cv.getContext('2d'), f = '600 28px sans-serif';
      x.font = f; cv.width = Math.ceil(x.measureText(txt).width) + 16; cv.height = 38; x = cv.getContext('2d');
      x.font = f; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col || '#39415a'; x.fillText(txt, cv.width / 2, cv.height / 2);
      var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false }));
      sp.scale.set(cv.width * 0.011, cv.height * 0.011, 1); return sp;
    }
    var pAxL = lbl('가격 P', '#64748b'); pAxL.position.set(SX0 + 0.05, SY1 + 0.5, 0); scene.add(pAxL);
    var qAxL = lbl('수량 Q', '#64748b'); qAxL.position.set(SX1 + 0.4, SY0 - 0.3, 0); scene.add(qAxL);
    var dL = lbl('수요 D', '#2563eb'); scene.add(dL);
    var sL = lbl('공급 S', '#ef4444'); scene.add(sL);

    // 곡선
    var dMat = new THREE.LineBasicMaterial({ color: 0x2563eb });
    var dCurve = new THREE.Line(new THREE.BufferGeometry(), dMat); scene.add(dCurve);
    var sMat = new THREE.LineBasicMaterial({ color: 0xef4444 });
    var sCurve = new THREE.Line(new THREE.BufferGeometry(), sMat); scene.add(sCurve);

    // 가격선(수평 점선, 드래그 핸들)
    var priceLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(SX0, 0, 0), new THREE.Vector3(SX1, 0, 0)]), new THREE.LineDashedMaterial({ color: 0x0ea5e9, dashSize: 0.22, gapSize: 0.13 }));
    priceLine.computeLineDistances(); scene.add(priceLine);
    var handle = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 18), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x064a63 })); scene.add(handle);

    // 수요량/공급량 지점 마커
    var dPt = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x10245e })); scene.add(dPt);
    var sPt = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x5b1212 })); scene.add(sPt);
    // 잉여/부족 갭 막대(수요량↔공급량 사이)
    var gapBar = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.16), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 })); scene.add(gapBar);
    // 균형점(클리어 시 표시)
    var eq = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0 })); scene.add(eq);

    // ── 단계 정의: 선형 수요·공급. 균형이 격자 안에 오도록 설계 ──
    // P* = (a−c)/(b+d). 아래 셋은 각각 P*=5,4,6 / Q*가 0~12 범위.
    var levels = [
      { a: 11, b: 1.0, c: 1, d: 1.0 },   // P*=(11−1)/2=5,  Q*=11−5=6
      { a: 12, b: 1.5, c: 2, d: 1.0 },   // P*=(12−2)/2.5=4, Q*=12−6=6
      { a: 13, b: 0.9, c: 1, d: 1.1 }    // P*=(13−1)/2=6,  Q*=13−5.4=7.6
    ];
    var TOL = 0.6; // 균형 임계: |Qs−Qd| ≤ 0.6 이면 청산
    var lvl = 0, score = 0, model = levels[0];
    var P = 8; // 현재 설정 가격(처음엔 균형보다 높게 → 초과공급 체험)
    var won = false, locked = false;

    function redrawCurves() {
      // 수요: Qd = a − b·P 를 P 스윕으로 (Q를 X, P를 Y로)
      var dp = [], sp2 = [];
      for (var pp = PMIN; pp <= PMAX + 0.001; pp += 0.25) {
        var qd = demandQty(model, pp), qs = supplyQty(model, pp);
        if (qd >= QMIN - 0.5 && qd <= QMAX + 0.5) dp.push(new THREE.Vector3(qToX(qd), pToY(pp), 0));
        if (qs >= QMIN - 0.5 && qs <= QMAX + 0.5) sp2.push(new THREE.Vector3(qToX(qs), pToY(pp), 0));
      }
      dCurve.geometry.dispose(); dCurve.geometry = new THREE.BufferGeometry().setFromPoints(dp);
      sCurve.geometry.dispose(); sCurve.geometry = new THREE.BufferGeometry().setFromPoints(sp2);
      // 라벨을 곡선 끝 근처로
      if (dp.length) { dL.position.set(dp[0].x + 0.6, dp[0].y + 0.2, 0); }
      if (sp2.length) { sL.position.set(sp2[sp2.length - 1].x + 0.6, sp2[sp2.length - 1].y - 0.1, 0); }
      // 균형점 위치
      var ex = equilibriumPrice(model), eqQ = equilibriumQty(model);
      eq.position.set(qToX(eqQ), pToY(ex), 0);
    }

    function refresh(msg) {
      var y = pToY(P);
      priceLine.position.y = y;
      handle.position.set(SX0, y, 0);
      var qd = demandQty(model, P), qs = supplyQty(model, P);
      // 마커는 가격선 위(같은 P)에서의 수요량·공급량 위치
      dPt.position.set(qToX(Math.max(QMIN, Math.min(QMAX, qd))), y, 0);
      sPt.position.set(qToX(Math.max(QMIN, Math.min(QMAX, qs))), y, 0);
      // 갭 막대: 수요량↔공급량 사이를 가로질러. 색: 초과공급=주황(잉여), 초과수요=보라(부족)
      var ex = excess(model, P); // Qs − Qd
      var x1 = qToX(qd), x2 = qToX(qs), midx = (x1 + x2) / 2, wlen = Math.abs(x2 - x1);
      gapBar.position.set(midx, y, 0.01);
      gapBar.scale.set(Math.max(0.001, wlen), 1, 1);
      gapBar.material.color.setHex(ex > 0 ? 0xf59e0b : 0x8b5cf6);
      gapBar.material.opacity = Math.min(0.9, 0.25 + Math.abs(ex) * 0.12);
      setHud(ex, qd, qs, msg);
      if (!won && !locked && isCleared(model, P, TOL)) win();
    }

    // ── HUD ──
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:10px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#0f2230;text-shadow:0 1px 2px rgba(255,255,255,.6);pointer-events:none;line-height:1.55';
    host.appendChild(hud);
    function setHud(ex, qd, qs, msg) {
      var state = Math.abs(ex) <= TOL ? '<span style="color:#16a34a">⚖ 균형 근접!</span>'
        : (ex > 0 ? '<span style="color:#d97706">📈 초과공급(잉여)</span>' : '<span style="color:#7c3aed">📉 초과수요(부족)</span>');
      hud.innerHTML = '가격 P = ' + P.toFixed(1)
        + '<br>수요량 Qd = ' + qd.toFixed(1) + ' · 공급량 Qs = ' + qs.toFixed(1)
        + '<br>' + state + ' (격차 ' + Math.abs(ex).toFixed(1) + ')'
        + '<br>🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + levels.length
        + (msg ? '<br><b>' + msg + '</b>' : '');
    }
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;left:10px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#475569;text-shadow:0 1px 2px rgba(255,255,255,.6)';
    tip.textContent = '하늘색 가격선을 위아래로 드래그해 수요량=공급량(균형)으로 맞추세요';
    host.appendChild(tip);
    var rb = document.createElement('button');
    rb.textContent = '↺ 리셋';
    rb.style.cssText = 'position:absolute;right:10px;top:10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:4px 10px;font:700 12px "Noto Sans KR",sans-serif;cursor:pointer';
    rb.onclick = function () { lvl = 0; score = 0; loadLevel(); };
    host.appendChild(rb);

    // ── 드래그(가격선 위아래) ──
    var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), drag = false;
    function ndc(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches && e.touches[0] ? e.touches[0] : e; return new THREE.Vector2(((p.clientX - r.left) / r.width) * 2 - 1, -((p.clientY - r.top) / r.height) * 2 + 1); }
    function planePt(e) { ray.setFromCamera(ndc(e), cam); var pt = new THREE.Vector3(); ray.ray.intersectPlane(plane, pt); return pt; }
    function onDown(e) { if (locked) return; var pt = planePt(e); if (pt) { drag = true; setFromY(pt.y); e.preventDefault(); } }
    function onMove(e) { if (!drag || locked) return; var pt = planePt(e); if (pt) setFromY(pt.y); e.preventDefault(); }
    function onUp() { drag = false; }
    function setFromY(y) { var np = yToP(y); P = Math.max(PMIN, Math.min(PMAX, Math.round(np * 10) / 10)); refresh(); }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    // ── 파티클 ──
    var parts = [];
    function burst(p, color) { for (var i = 0; i < 16; i++) { var sm = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshBasicMaterial({ color: color })); sm.position.copy(p); var ang = Math.random() * Math.PI * 2; sm.userData.v = new THREE.Vector3(Math.cos(ang) * 3, Math.sin(ang) * 3 + 1.5, (Math.random() - 0.5) * 2); sm.userData.life = 0.7; scene.add(sm); parts.push(sm); } }

    function win() {
      won = true; locked = true;
      score += 100;
      burst(eq.position.clone(), 0x22c55e);
      eq.material.opacity = 1;
      chime();
      lvl++;
      if (lvl >= levels.length) {
        setHud(0, equilibriumQty(model), equilibriumQty(model), '🎉 시장 청산 완료! 모든 단계 클리어 — 총 ' + score + '점');
        setTimeout(function () { lvl = 0; score = 0; loadLevel(); }, 2800);
      } else {
        setHud(0, equilibriumQty(model), equilibriumQty(model), '✅ 시장 청산! 다음 단계');
        setTimeout(function () { loadLevel(); }, 1500);
      }
    }

    function loadLevel() {
      won = false; locked = false;
      model = levels[lvl];
      eq.material.opacity = 0;
      // 시작 가격은 균형에서 떨어뜨려 잉여/부족을 먼저 체험하게
      var ex = equilibriumPrice(model);
      P = Math.min(PMAX, ex + 3); if (P - ex < 1) P = Math.max(PMIN, ex - 3);
      P = Math.round(P * 10) / 10;
      redrawCurves();
      refresh();
    }

    // ── 루프 ──
    var last = null, T = 0;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts; T += dt;
      handle.scale.setScalar(1 + 0.12 * Math.sin(T * 4));
      if (eq.material.opacity > 0) eq.scale.setScalar(0.9 + 0.25 * Math.sin(T * 5));
      for (var i = parts.length - 1; i >= 0; i--) { var sm = parts[i]; sm.userData.life -= dt; if (sm.userData.life <= 0) { scene.remove(sm); parts.splice(i, 1); continue; } sm.userData.v.y -= 7 * dt; sm.position.addScaledVector(sm.userData.v, dt); sm.material.transparent = true; sm.material.opacity = Math.max(0, sm.userData.life); }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // ── 사운드 ──
    var actx = null;
    function beep(fr, d, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = fr; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (fr, i) { setTimeout(function () { beep(fr, 0.18, 'triangle'); }, i * 110); }); }

    loadLevel();
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
