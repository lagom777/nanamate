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
  // 틀린 가격을 제출했을 때 경제 원리에 맞는 다음 행동을 알려준다.
  function priceGuidance(model, P, tol) {
    if (isCleared(model, P, tol)) return 'clear';
    return excess(model, P) > 0 ? 'lower' : 'raise';
  }
  function roundScore(lives, secondsLeft) {
    return 100 + Math.max(0, lives) * 20 + Math.max(0, Math.ceil(secondsLeft)) * 2;
  }

  // 노드 테스트용 export (브라우저에선 무시됨)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { demandQty: demandQty, supplyQty: supplyQty, equilibriumPrice: equilibriumPrice, equilibriumQty: equilibriumQty, excess: excess, isCleared: isCleared, priceGuidance: priceGuidance, roundScore: roundScore };
  }

  // ── 렌더링/상호작용(브라우저 전용) ──────────────────────────────────────
  function init() {
    var host = typeof document !== 'undefined' && document.getElementById('nm-market');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var RM = false;
    try { RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e0) {}
    var W = host.clientWidth || 640, H = 390, CAM_Y = 0.35, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 200);
      cam.position.set(0, CAM_Y, 13); cam.lookAt(0, 0, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    var kernel = window.NMGameKernel && window.NMGameKernel.create ? window.NMGameKernel.create(host, { gameId: 'market' }) : null;
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:16px;cursor:ns-resize;touch-action:none;display:block;background:radial-gradient(circle at 50% 20%,#ecfeff 0%,#cffafe 42%,#a5f3fc 100%)';
    rndr.domElement.setAttribute('aria-label', '시장 균형 가격 조절 영역');
    host.appendChild(rndr.domElement);

    scene.fog = new THREE.Fog(0xcffafe, 16, 28);
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    var dl = new THREE.DirectionalLight(0xffffff, 0.68); dl.position.set(2, 7, 8); scene.add(dl);
    var rim = new THREE.PointLight(0x0891b2, 0.5, 24); rim.position.set(-5, 2, 5); scene.add(rim);

    var flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;border-radius:16px;pointer-events:none;opacity:0;background:radial-gradient(circle,rgba(244,63,94,.04),rgba(244,63,94,.38));transition:opacity .16s;z-index:3';
    host.appendChild(flash);

    // ── 좌표계: 화면 X = 수량 Q, 화면 Y = 가격 P ──
    // 모델 P,Q 범위
    var PMIN = 0, PMAX = 10, QMIN = 0, QMAX = 12;
    // 화면(scene) 범위
    var SX0 = -4.5, SX1 = 4.5, SY0 = -3.2, SY1 = 3.2;
    function qToX(Q) { return SX0 + (Q - QMIN) / (QMAX - QMIN) * (SX1 - SX0); }
    function pToY(P) { return SY0 + (P - PMIN) / (PMAX - PMIN) * (SY1 - SY0); }
    function yToP(y) { return PMIN + (y - SY0) / (SY1 - SY0) * (PMAX - PMIN); }

    var board = new THREE.Mesh(
      new THREE.BoxGeometry(SX1 - SX0 + 1.2, SY1 - SY0 + 1.1, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.9, roughness: 0.5, metalness: 0.08 })
    );
    board.position.set((SX0 + SX1) / 2, (SY0 + SY1) / 2, -0.28); scene.add(board);

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
    var dMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1e3a8a, emissiveIntensity: 0.25, metalness: 0.28, roughness: 0.3 });
    var dCurve = new THREE.Mesh(new THREE.BufferGeometry(), dMat); scene.add(dCurve);
    var sMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: 0.24, metalness: 0.28, roughness: 0.3 });
    var sCurve = new THREE.Mesh(new THREE.BufferGeometry(), sMat); scene.add(sCurve);

    // 가격선(수평 점선, 드래그 핸들)
    var priceLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(SX0, 0, 0), new THREE.Vector3(SX1, 0, 0)]), new THREE.LineDashedMaterial({ color: 0x0ea5e9, dashSize: 0.22, gapSize: 0.13 }));
    priceLine.computeLineDistances(); scene.add(priceLine);
    var handle = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 18), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x064a63 })); scene.add(handle);

    // 수요량/공급량 지점 마커
    var dPt = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x10245e })); scene.add(dPt);
    var sPt = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x5b1212 })); scene.add(sPt);
    // 잉여/부족 갭 막대(수요량↔공급량 사이)
    var gapBar = new THREE.Mesh(new THREE.BoxGeometry(1, 0.16, 0.28), new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85, metalness: 0.35, roughness: 0.3 })); scene.add(gapBar);
    // 균형점(클리어 시 표시)
    var eq = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0 })); scene.add(eq);

    // ── 단계 정의: 선형 수요·공급. 균형이 격자 안에 오도록 설계 ──
    // P* = (a−c)/(b+d). 아래 셋은 각각 P*=5,4,6 / Q*가 0~12 범위.
    var levels = [
      { name: '동네 장터', a: 11, b: 1.0, c: 1, d: 1.0 },
      { name: '수요 급증', a: 12, b: 1.5, c: 2, d: 1.0 },
      { name: '공급 민감', a: 13, b: 0.9, c: 1, d: 1.1 },
      { name: '완만한 수요', a: 14, b: 0.8, c: 0, d: 1.2 },
      { name: '가파른 공급', a: 12, b: 1.0, c: 0, d: 2.0 },
      { name: '좁은 균형', a: 10, b: 1.2, c: 2, d: 0.8 },
      { name: '풍요 시장', a: 15, b: 1.0, c: 1, d: 1.5 },
      { name: '마스터', a: 16, b: 1.4, c: 0.5, d: 1.1 }
    ];
    var TRANSFER_LINE = '가격이 오르면 수요는 줄고 공급은 늘어 균형(교차)으로 간다.';
    var TOL = 0.6; // 균형 임계: |Qs−Qd| ≤ 0.6 이면 청산
    var LEVEL_TIME = 38;
    var lvl = 0, score = 0, model = levels[0];
    var P = 8; // 현재 설정 가격(처음엔 균형보다 높게 → 초과공급 체험)
    var locked = false, started = false;
    var lives = 3, timeLeft = LEVEL_TIME, checkpointScore = 0, feedback = '', lastHudSecond = -1;
    var eqPop = 1; // 균형점 등장 오버슈트 트윈 진행도

    function redrawCurves() {
      // 수요: Qd = a − b·P 를 P 스윕으로 (Q를 X, P를 Y로)
      var dp = [], sp2 = [];
      for (var pp = PMIN; pp <= PMAX + 0.001; pp += 0.25) {
        var qd = demandQty(model, pp), qs = supplyQty(model, pp);
        if (qd >= QMIN - 0.5 && qd <= QMAX + 0.5) dp.push(new THREE.Vector3(qToX(qd), pToY(pp), 0));
        if (qs >= QMIN - 0.5 && qs <= QMAX + 0.5) sp2.push(new THREE.Vector3(qToX(qs), pToY(pp), 0));
      }
      dCurve.geometry.dispose();
      dCurve.geometry = dp.length > 1
        ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dp), Math.max(24, dp.length * 2), 0.052, 7, false)
        : new THREE.BufferGeometry();
      sCurve.geometry.dispose();
      sCurve.geometry = sp2.length > 1
        ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sp2), Math.max(24, sp2.length * 2), 0.052, 7, false)
        : new THREE.BufferGeometry();
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
    }

    // ── HUD ──
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:12px;top:11px;font:700 13px "Noto Sans KR",sans-serif;color:#083344;text-shadow:0 1px 2px rgba(255,255,255,.75);pointer-events:none;line-height:1.55;max-width:calc(100% - 170px);z-index:4';
    host.appendChild(hud);
    function setHud(ex, qd, qs, msg) {
      var hearts = ''; for (var hi = 0; hi < 3; hi++) hearts += hi < lives ? '♥' : '♡';
      var state = Math.abs(ex) <= TOL ? '<span style="color:#16a34a">⚖ 균형 근접!</span>'
        : (ex > 0 ? '<span style="color:#d97706">📈 초과공급(잉여)</span>' : '<span style="color:#7c3aed">📉 초과수요(부족)</span>');
      hud.innerHTML = '<b style="font-size:14px">' + model.name + ' · 가격 P = ' + P.toFixed(1) + '</b>'
        + '<br>수요량 Qd = ' + qd.toFixed(1) + ' · 공급량 Qs = ' + qs.toFixed(1)
        + '<br>' + state + ' (격차 ' + Math.abs(ex).toFixed(1) + ')'
        + '<br>🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + levels.length
        + ' · <span style="color:#e11d48;letter-spacing:2px">' + hearts + '</span> · ⏱ ' + Math.max(0, Math.ceil(timeLeft)) + '초'
        + ((msg || feedback) ? '<br><b style="color:' + ((msg || feedback).charAt(0) === '✗' || (msg || feedback).charAt(0) === '💥' ? '#dc2626' : '#0f766e') + '">' + (msg || feedback) + '</b>' : '');
    }
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;left:12px;bottom:10px;font:650 12px "Noto Sans KR",sans-serif;color:#164e63;text-shadow:0 1px 2px rgba(255,255,255,.75);z-index:4';
    tip.textContent = '가격선 드래그 → 거래 실행 · 잉여면 가격↓, 부족이면 가격↑ · 실행 기회 3번';
    host.appendChild(tip);

    var controls = document.createElement('div');
    controls.style.cssText = 'position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,.84);backdrop-filter:blur(8px);padding:9px;border:1px solid rgba(8,145,178,.24);border-radius:12px;box-shadow:0 8px 24px rgba(8,145,178,.16);z-index:5;font-family:"Noto Sans KR",sans-serif';
    var nudge = document.createElement('div'); nudge.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:5px';
    var downBtn = document.createElement('button'); downBtn.textContent = '− 0.1'; downBtn.setAttribute('aria-label', '가격 0.1 내리기');
    var upBtn = document.createElement('button'); upBtn.textContent = '+ 0.1'; upBtn.setAttribute('aria-label', '가격 0.1 올리기');
    [downBtn, upBtn].forEach(function (b) { b.style.cssText = 'border:1px solid #a5f3fc;border-radius:8px;background:#ecfeff;color:#0e7490;padding:6px 8px;font-weight:800;cursor:pointer'; });
    downBtn.onclick = function () { changePrice(-0.1); }; upBtn.onclick = function () { changePrice(0.1); };
    nudge.appendChild(downBtn); nudge.appendChild(upBtn);
    var tradeBtn = document.createElement('button'); tradeBtn.textContent = '거래 실행';
    tradeBtn.style.cssText = 'border:0;border-radius:9px;background:linear-gradient(135deg,#0891b2,#0f766e);color:#fff;padding:8px 12px;font-weight:850;cursor:pointer;box-shadow:0 4px 12px rgba(8,145,178,.28)';
    tradeBtn.onclick = submitTrade;
    var rb = document.createElement('button'); rb.textContent = '↺ 가격 초기화';
    rb.style.cssText = 'border:1px solid #bae6fd;border-radius:8px;background:#fff;color:#0369a1;padding:6px 10px;font-weight:750;cursor:pointer';
    rb.onclick = resetPrice;
    controls.appendChild(nudge); controls.appendChild(tradeBtn); controls.appendChild(rb); host.appendChild(controls);

    var result = document.createElement('div');
    result.style.cssText = 'position:absolute;inset:0;border-radius:16px;background:rgba(8,47,73,.68);backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;z-index:8;padding:20px';
    var resultCard = document.createElement('div'); resultCard.style.cssText = 'width:min(360px,88%);background:rgba(255,255,255,.96);border-radius:18px;padding:22px;text-align:center;box-shadow:0 22px 60px rgba(8,47,73,.35);font-family:"Noto Sans KR",sans-serif';
    var resultTitle = document.createElement('div'); resultTitle.style.cssText = 'font-size:22px;font-weight:900;color:#083344;margin-bottom:7px';
    var resultBody = document.createElement('div'); resultBody.style.cssText = 'font-size:13px;font-weight:650;line-height:1.6;color:#475569;margin-bottom:16px';
    var resultBtn = document.createElement('button'); resultBtn.style.cssText = 'border:0;border-radius:10px;background:linear-gradient(135deg,#0891b2,#0f766e);color:#fff;padding:10px 18px;font-weight:850;cursor:pointer;min-width:150px';
    resultCard.appendChild(resultTitle); resultCard.appendChild(resultBody); resultCard.appendChild(resultBtn); result.appendChild(resultCard); host.appendChild(result);
    function setControlsDisabled(disabled) { tradeBtn.disabled = disabled; rb.disabled = disabled; downBtn.disabled = disabled; upBtn.disabled = disabled; }
    function showResult(title, body, buttonText, onClick, danger) {
      resultTitle.textContent = title; resultBody.textContent = body; resultBtn.textContent = buttonText;
      resultBtn.style.background = danger ? 'linear-gradient(135deg,#dc2626,#e11d48)' : 'linear-gradient(135deg,#0891b2,#0f766e)';
      resultBtn.onclick = onClick; result.style.display = 'flex'; setControlsDisabled(true);
    }
    function hideResult() { result.style.display = 'none'; setControlsDisabled(false); }

    // ── 드래그(가격선 위아래) ──
    var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), drag = false;
    function ndc(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches && e.touches[0] ? e.touches[0] : e; return new THREE.Vector2(((p.clientX - r.left) / r.width) * 2 - 1, -((p.clientY - r.top) / r.height) * 2 + 1); }
    function planePt(e) { ray.setFromCamera(ndc(e), cam); var pt = new THREE.Vector3(); ray.ray.intersectPlane(plane, pt); return pt; }
    function onDown(e) { if (locked) return; var pt = planePt(e); if (pt) { drag = true; setFromY(pt.y); e.preventDefault(); } }
    function onMove(e) { if (!drag || locked) return; var pt = planePt(e); if (pt) setFromY(pt.y); e.preventDefault(); }
    function onUp() { drag = false; }
    function setFromY(y) { var np = yToP(y); P = Math.max(PMIN, Math.min(PMAX, Math.round(np * 10) / 10)); feedback = ''; refresh(); }
    function changePrice(delta) {
      if (locked) return;
      P = Math.max(PMIN, Math.min(PMAX, Math.round((P + delta) * 10) / 10)); feedback = ''; refresh();
    }
    function resetPrice() {
      if (locked) return;
      var ep = equilibriumPrice(model);
      P = Math.min(PMAX, ep + 3); if (P - ep < 1) P = Math.max(PMIN, ep - 3);
      P = Math.round(P * 10) / 10; feedback = '가격만 초기화했어요. 시간과 실행 기회는 계속됩니다.'; refresh();
    }
    var el = rndr.domElement;
    el.tabIndex = 0;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { changePrice(0.1); e.preventDefault(); }
      else if (e.key === 'ArrowDown') { changePrice(-0.1); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') { submitTrade(); e.preventDefault(); }
    });

    // ── 파티클 — 공유 지오메트리 + 고정 크기 풀 재사용(프레임 중 생성/폐기 0 → 60fps 유지) ──
    var partGeo = new THREE.SphereGeometry(0.1, 6, 6);
    var pool = [], POOL = 96, poolIdx = -1;
    for (var pi = 0; pi < POOL; pi++) {
      var pm = new THREE.Mesh(partGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
      pm.visible = false; pm.userData = { v: new THREE.Vector3(), life: 0 };
      scene.add(pm); pool.push(pm);
    }
    function spawnP(p, color) {
      for (var t = 0; t < POOL; t++) {
        poolIdx = (poolIdx + 1) % POOL;
        var sm = pool[poolIdx];
        if (sm.visible) continue;
        sm.visible = true; sm.position.copy(p);
        var ang = Math.random() * Math.PI * 2;
        sm.userData.v.set(Math.cos(ang) * 3, Math.sin(ang) * 3 + 1.5, (Math.random() - 0.5) * 2);
        sm.userData.life = 0.7; sm.material.color.setHex(color); sm.material.opacity = 1;
        return;
      }
    }
    function burst(p, color) { if (RM) return; for (var i = 0; i < 16; i++) spawnP(p, color); }

    // ── 카메라 셰이크(감쇠 노이즈) — 거래 실패 임팩트. 6종 플래그십과 동일 패턴 ──
    var shakeT = 0, shakeDur = 1, shakeAmp = 0;
    function shake(amp, dur) { if (RM) return; shakeAmp = amp; shakeT = dur; shakeDur = dur; }
    function easeOutBack(t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

    // ── 점수 팝업(+n) — 월드 좌표를 화면으로 투영해 절대배치 후 상승·페이드 ──
    function scorePop(worldPos, txt) {
      var v = worldPos.clone().project(cam);
      var px = (v.x * 0.5 + 0.5) * (host.clientWidth || W), py = (-v.y * 0.5 + 0.5) * H;
      var f = document.createElement('div');
      f.textContent = txt;
      f.style.cssText = 'position:absolute;left:' + Math.round(px) + 'px;top:' + Math.round(py - 18) + 'px;transform:translate(-50%,0);font:800 22px "Noto Sans KR",sans-serif;color:#fbbf24;text-shadow:0 2px 8px rgba(8,47,73,.55);pointer-events:none;opacity:1;transition:' + (RM ? 'opacity .8s ease-out' : 'transform .8s ease-out,opacity .8s ease-out') + ';z-index:9';
      host.appendChild(f);
      setTimeout(function () { if (!RM) f.style.transform = 'translate(-50%,-44px)'; f.style.opacity = '0'; }, 30);
      setTimeout(function () { f.remove(); }, 900);
    }

    function submitTrade() {
      if (locked) return;
      var ex = excess(model, P);
      if (isCleared(model, P, TOL)) { win(); return; }
      lives--;
      var guide = priceGuidance(model, P, TOL);
      feedback = guide === 'lower'
        ? '✗ 재고가 ' + Math.abs(ex).toFixed(1) + ' 남았어요 · 가격을 내려 수요를 늘리세요'
        : '✗ 물건이 ' + Math.abs(ex).toFixed(1) + ' 부족해요 · 가격을 올려 수요를 줄이세요';
      if (kernel) kernel.teach({
        kind: 'fail',
        outcome: guide,
        coach: guide === 'lower' ? '잉여(공급>수요) — 가격을 내리세요' : '부족(수요>공급) — 가격을 올리세요',
        coachMid: guide === 'lower' ? '가격↓ → 수요↑·공급↓ 로 격차가 줄어듭니다' : '가격↑ → 수요↓·공급↑',
        coachDeep: '균형은 Qd=Qs인 가격. 격차 막대가 거의 사라질 때까지 가격선을 움직이세요'
      });
      flash.style.opacity = '1'; setTimeout(function () { flash.style.opacity = '0'; }, 170);
      shake(0.22, 0.26);
      beep(guide === 'lower' ? 180 : 220, 0.17, 'sawtooth', 0.06);
      burst(gapBar.position.clone(), guide === 'lower' ? 0xf59e0b : 0x8b5cf6);
      refresh();
      if (lives <= 0) lose('거래 실행 기회를 모두 사용했어요');
    }

    function win() {
      if (locked) return;
      locked = true;
      var earned = roundScore(lives, timeLeft);
      score += earned;
      burst(eq.position.clone(), 0x22c55e);
      eq.material.opacity = 1; eqPop = RM ? 1 : 0;
      scorePop(eq.position, '+' + earned);
      chime();
      feedback = '✓ 시장 청산! 수요와 공급이 만났습니다 · +' + earned + '점';
      refresh();
      var finalLevel = lvl + 1 >= levels.length;
      // 결과 카드는 오버레이(z-index 8)로 화면을 덮으므로, 파티클·점수팝이 먼저 읽히도록 한 박자 늦춘다.
      setTimeout(function () {
        showResult(
          finalLevel ? '🏆 시장 설계자!' : '⚖ 시장 청산 성공',
          finalLevel ? (TRANSFER_LINE + ' · 총 ' + score + '점') : '잉여와 부족 신호를 읽어 균형가격을 찾았습니다.',
          finalLevel ? '한 판 더' : '다음 시장',
          function () {
            hideResult();
            if (finalLevel) {
              if (kernel) {
                kernel.saveBest(score);
                kernel.teach({ kind: 'clear', transfer: TRANSFER_LINE, onAgain: function () { lvl = 0; score = 0; loadLevel(); } });
              }
              lvl = 0; score = 0;
              if (!kernel) loadLevel();
            } else {
              lvl++;
              loadLevel();
            }
          }
        );
      }, 850);
    }

    function lose(reason) {
      if (locked) return;
      locked = true; feedback = '💥 ' + reason; refresh();
      beep(105, 0.3, 'sawtooth', 0.06);
      showResult(
        '시장 청산 실패',
        reason + ' · 이 시장의 균형가격은 P* = ' + equilibriumPrice(model).toFixed(1) + ' 입니다. 잉여면 가격을 내리고, 부족이면 올립니다.',
        '이 시장 다시',
        function () { hideResult(); score = checkpointScore; loadLevel(); },
        true
      );
    }

    function loadLevel() {
      locked = false; lives = 3; timeLeft = LEVEL_TIME; lastHudSecond = -1;
      checkpointScore = score; feedback = '가격을 정한 뒤 거래를 실행하세요.';
      model = levels[lvl];
      eq.material.opacity = 0; eqPop = 1;
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
      if (!locked && started) {
        timeLeft = Math.max(0, timeLeft - dt);
        var sec = Math.ceil(timeLeft);
        if (sec !== lastHudSecond) { lastHudSecond = sec; refresh(); }
        if (timeLeft <= 0) lose('제한 시간이 끝났어요');
      }
      handle.scale.setScalar(RM ? 1 : 1 + 0.12 * Math.sin(T * 4));
      gapBar.position.z = 0.05 + (RM ? 0 : 0.04 * Math.sin(T * 3));
      if (eqPop < 1) eqPop = Math.min(1, eqPop + dt / 0.5);
      if (eq.material.opacity > 0) eq.scale.setScalar(Math.max(0.001, easeOutBack(eqPop)) * (RM ? 1 : 0.9 + 0.25 * Math.sin(T * 5)));
      var sk = 0;
      if (shakeT > 0) { shakeT = Math.max(0, shakeT - dt); sk = (shakeT / shakeDur) * shakeAmp; }
      cam.position.set((Math.random() * 2 - 1) * sk, CAM_Y + (Math.random() * 2 - 1) * sk, 13);
      for (var i = 0; i < POOL; i++) {
        var sm = pool[i]; if (!sm.visible) continue;
        sm.userData.life -= dt;
        if (sm.userData.life <= 0) { sm.visible = false; continue; }
        sm.userData.v.y -= 7 * dt; sm.position.addScaledVector(sm.userData.v, dt);
        sm.material.opacity = Math.max(0, sm.userData.life);
      }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // ── 사운드 ──
    var actx = null;
    function beep(fr, d, type, vol) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = fr; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (fr, i) { setTimeout(function () { beep(fr, 0.18, 'triangle'); }, i * 110); }); }

    loadLevel();
    locked = true;
    showResult(
      '⚖ 시장 청산 미션',
      '38초 안에 가격선을 움직여 수요량과 공급량을 맞추고 거래를 실행하세요. 잉여·부족 신호를 읽을 기회는 세 번입니다.',
      '시장 열기',
      function () { hideResult(); started = true; locked = false; feedback = '가격을 정한 뒤 거래를 실행하세요.'; refresh(); }
    );
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
