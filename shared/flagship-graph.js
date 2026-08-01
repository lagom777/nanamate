/* 나나메이트 플래그십 3D 게임 — 포물선 그래프 (aboutMath/03-functions)
 * 이차함수 y = a(x−h)² + k 의 꼭짓점(h,k)을 끌고 곡률 a를 바꿔, 떠 있는 코인을 모두 지나는 그래프를 만든다.
 * vertex form(꼭짓점 형태)의 a·h·k가 그래프를 어떻게 바꾸는지 직접 체득. 단계별·점수·이펙트·사운드.
 * 컨테이너: <div id="nm-graph"></div>. THREE(r128) 필요. WebGL 실패 시 안내문(graceful).
 */
(function () {
  // ───────────────────────────── 순수 로직 (테스트 가능) ─────────────────────────────
  // 레벨별 숨은 포물선(vertex form y=a(x−h)²+k)과 코인 x좌표. 코인을 모두 지나면 클리어.
  var LEVELS = [
    { a: 0.5, h: -1, k: 1, xs: [-4, 1, 3] },
    { a: 0.4, h: 0, k: 2, xs: [-3, 0, 3] },
    { a: -0.6, h: 1, k: 6, xs: [-2, 1, 4] },
    { a: 0.8, h: 2, k: 0.5, xs: [-1, 2, 4] },
    { a: -0.4, h: -2, k: 4, xs: [-4, -2, 1] },
    { a: 0.7, h: 1.5, k: 2, xs: [-1, 1.5, 4] },
    { a: -0.9, h: 0, k: 5, xs: [-3, 0, 2] },
    { a: 0.55, h: -1.5, k: 0, xs: [-4, -1.5, 2] }
  ];
  var TRANSFER_LINE = 'y=a(x−h)²+k 에서 h·k는 꼭짓점, a는 폭(열림)을 정한다.';

  // 이차함수 y = a(x−h)² + k
  function parabolaY(a, h, k, x) { return a * (x - h) * (x - h) + k; }

  // 코인 (x,y)가 현재 곡선 위(허용오차 tol)에 있는가
  function coinOnCurve(a, h, k, x, y, tol) { return Math.abs(parabolaY(a, h, k, x) - y) < tol; }

  // 레벨의 숨은 포물선에서 코인 좌표를 샘플
  function levelCoins(level) {
    return level.xs.map(function (cx) { return { x: cx, y: parabolaY(level.a, level.h, level.k, cx) }; });
  }

  // 승리 판정: 모든 코인이 현재 곡선 위(허용오차 tol)에 있다
  function allCoinsMatched(a, h, k, coins, tol) {
    if (!coins || coins.length === 0) return false;
    for (var i = 0; i < coins.length; i++) {
      if (!coinOnCurve(a, h, k, coins[i].x, coins[i].y, tol)) return false;
    }
    return true;
  }

  // 현재 곡선이 통과한 코인 수. 제출 피드백과 진행도에 함께 사용한다.
  function matchedCoinCount(a, h, k, coins, tol) {
    if (!coins || coins.length === 0) return 0;
    var count = 0;
    for (var i = 0; i < coins.length; i++) {
      if (coinOnCurve(a, h, k, coins[i].x, coins[i].y, tol)) count++;
    }
    return count;
  }

  // 오답 때 답을 바로 공개하지 않고, 가장 크게 어긋난 매개변수와 움직일 방향만 알려준다.
  function parameterHint(a, h, k, level) {
    if (!level) return { parameter: 'none', direction: 'none' };
    var gaps = [
      { parameter: 'a', gap: level.a - a, scale: 1.5 },
      { parameter: 'h', gap: level.h - h, scale: 7 },
      { parameter: 'k', gap: level.k - k, scale: 10 }
    ];
    gaps.sort(function (x, y) { return Math.abs(y.gap) / y.scale - Math.abs(x.gap) / x.scale; });
    return {
      parameter: gaps[0].parameter,
      direction: gaps[0].gap > 0 ? 'increase' : (gaps[0].gap < 0 ? 'decrease' : 'hold')
    };
  }

  function roundScore(lives, secondsLeft) {
    return 100 + Math.max(0, lives) * 20 + Math.max(0, Math.ceil(secondsLeft)) * 2;
  }

  // 꼭짓점 형태 y = a(x−h)² + k 의 우변을 수학 표기대로 만든다("(x − -1)"·"+ -3" 방지).
  // 부호를 흡수(h<0 → (x + |h|), k<0 → − |k|)하고, h=0이면 괄호를, k=0이면 k항을 생략한다.
  // digits(선택): {a,h,k} 소수점 자리수 고정. 자리수로 반올림한 값으로 부호·0 판정을 한다.
  function vertexFormLabel(a, h, k, digits) {
    var d = digits || {};
    function fix(v, p) { return typeof p === 'number' ? v.toFixed(p) : String(v); }
    function round(v, p) { return typeof p === 'number' ? parseFloat(v.toFixed(p)) : v; }
    var hr = round(h, d.h), kr = round(k, d.k);
    var inner = hr === 0 ? 'x' : '(x ' + (hr < 0 ? '+' : '−') + ' ' + fix(Math.abs(hr), d.h) + ')';
    // 계수 a의 음수 부호도 h·k와 같은 U+2212(−)로 통일 — toFixed는 ASCII 하이픈을 내므로
    // 그대로 두면 한 수식 안에서 '-0.60(x − 1)²'처럼 부호 글리프가 섞인다.
    var body = fix(a, d.a).replace('-', '−') + inner + '²';
    return kr === 0 ? body : body + (kr < 0 ? ' − ' : ' + ') + fix(Math.abs(kr), d.k);
  }

  var LOGIC = {
    LEVELS: LEVELS,
    parabolaY: parabolaY,
    coinOnCurve: coinOnCurve,
    levelCoins: levelCoins,
    allCoinsMatched: allCoinsMatched,
    matchedCoinCount: matchedCoinCount,
    parameterHint: parameterHint,
    roundScore: roundScore,
    vertexFormLabel: vertexFormLabel
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = LOGIC; }
  if (typeof window !== 'undefined') { window.NM_GRAPH_LOGIC = LOGIC; }

  // ───────────────────────────── 3D 게임 (브라우저 전용) ─────────────────────────────
  function init() {
    if (typeof document === 'undefined') return;
    var host = document.getElementById('nm-graph');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }
    var RM = false;
    try { RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e0) {}
    var W = host.clientWidth || 640, H = 390, CAM_Y = 3.8, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(46, W / H, 0.1, 200);
      cam.position.set(0, CAM_Y, 16); cam.lookAt(0, 3.4, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    var kernel = window.NMGameKernel && window.NMGameKernel.create ? window.NMGameKernel.create(host, { gameId: 'graph' }) : null;
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:16px;cursor:grab;touch-action:none;display:block;background:radial-gradient(circle at 50% 28%,#eff6ff 0%,#dbeafe 42%,#c7d2fe 100%)';
    rndr.domElement.setAttribute('aria-label', '포물선 그래프 조작 영역');
    host.appendChild(rndr.domElement);
    scene.fog = new THREE.Fog(0xdbeafe, 18, 31);
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    var dl = new THREE.DirectionalLight(0xffffff, 0.72); dl.position.set(2, 8, 8); scene.add(dl);
    var rim = new THREE.PointLight(0x818cf8, 0.65, 32); rim.position.set(-6, 5, 6); scene.add(rim);

    var flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;border-radius:16px;pointer-events:none;opacity:0;background:radial-gradient(circle,rgba(239,68,68,.05),rgba(239,68,68,.42));transition:opacity .18s;z-index:3';
    host.appendChild(flash);

    // 좌표 범위
    var XMIN = -7, XMAX = 7, YMIN = -1, YMAX = 9;
    // 격자/축
    var gmat = new THREE.LineBasicMaterial({ color: 0xd1d5db, transparent: true, opacity: 0.5 });
    for (var gx = XMIN; gx <= XMAX; gx++) addLine(gx, YMIN, gx, YMAX, gmat);
    for (var gy = YMIN; gy <= YMAX; gy++) addLine(XMIN, gy, XMAX, gy, gmat);
    addLine(XMIN, 0, XMAX, 0, new THREE.LineBasicMaterial({ color: 0x475569 }));
    addLine(0, YMIN, 0, YMAX, new THREE.LineBasicMaterial({ color: 0x475569 }));
    function addLine(x1, y1, x2, y2, m) { var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)]); scene.add(new THREE.Line(g, m)); }

    // 포물선은 단순 1px 선 대신 실제 두께와 광택이 있는 3D 튜브로 만든다.
    var curveMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1e3a8a, emissiveIntensity: 0.34, metalness: 0.3, roughness: 0.28 });
    var curve = new THREE.Mesh(new THREE.BufferGeometry(), curveMat); scene.add(curve);
    // 꼭짓점 핸들
    var vtx = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 18), new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x10245e })); scene.add(vtx);

    // 코인 등장 트윈용 오버슈트 이징(포물선 발사 게임과 동일).
    function easeOutBack(t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

    var a = 0.5, h = 0, k = 1;
    function redraw() {
      var pts = []; for (var x = XMIN; x <= XMAX + 0.001; x += 0.15) { var y = parabolaY(a, h, k, x); if (y >= YMIN - 2 && y <= YMAX + 4) pts.push(new THREE.Vector3(x, y, 0)); }
      curve.geometry.dispose();
      if (pts.length > 1) {
        curve.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(36, pts.length * 2), 0.065, 8, false);
      } else {
        curve.geometry = new THREE.BufferGeometry();
      }
      vtx.position.set(h, k, 0);
      checkCoins();
    }

    // 코인(레벨별 숨은 포물선에서 샘플) + 실제 라운드 상태
    var LEVEL_TIME = 45;
    var lvl = 0, score = 0, coins = [];
    var lives = 3, timeLeft = LEVEL_TIME, locked = false, started = false, feedback = '';
    var checkpointScore = 0, lastHudSecond = -1;
    function buildCoins() {
      coins.forEach(function (c) {
        scene.remove(c.mesh);
        c.mesh.geometry.dispose(); c.mesh.material.dispose();
      });
      coins = [];
      levelCoins(LEVELS[lvl]).forEach(function (pt) {
        var m = new THREE.Mesh(
          new THREE.TorusGeometry(0.34, 0.12, 10, 24),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x5b3a00, metalness: 0.55, roughness: 0.25 })
        );
        m.position.set(pt.x, pt.y, 0.08); m.scale.setScalar(RM ? 1 : 0.001);
        scene.add(m); coins.push({ x: pt.x, y: pt.y, mesh: m, on: false, pulse: 0, spawn: RM ? 1 : 0 });
      });
    }
    function checkCoins() {
      coins.forEach(function (c) {
        var on = coinOnCurve(a, h, k, c.x, c.y, 0.3);
        if (on && !c.on) { c.pulse = 1; beep(880, 0.05, 'sine', 0.035); }
        c.on = on;
        c.mesh.material.color.setHex(on ? 0x22c55e : 0xf59e0b);
        c.mesh.material.emissive.setHex(on ? 0x065f46 : 0x5b3a00);
      });
      setHud();
    }

    function feedbackText() {
      var hint = parameterHint(a, h, k, LEVELS[lvl]);
      var names = { a: '곡률 a', h: '꼭짓점의 가로 위치 h', k: '꼭짓점의 높이 k' };
      var dirs = { increase: '조금 키워 보세요', decrease: '조금 줄여 보세요', hold: '지금 값을 유지하세요' };
      return (names[hint.parameter] || '그래프') + '를 ' + (dirs[hint.direction] || '다시 살펴보세요');
    }

    function submitGraph() {
      if (locked) return;
      var matched = matchedCoinCount(a, h, k, coins, 0.3);
      if (matched === coins.length && coins.length) { win(); return; }
      lives--;
      score = Math.max(checkpointScore, score - 10);
      feedback = '✗ ' + matched + '/' + coins.length + '개 통과 · ' + feedbackText();
      flash.style.opacity = '1';
      setTimeout(function () { flash.style.opacity = '0'; }, 180);
      shake(0.24, 0.28);
      beep(150, 0.16, 'sawtooth', 0.06);
      burst(vtx.position.clone(), 0xef4444);
      setHud();
      if (lives <= 0) lose('실험 기회를 모두 사용했어요');
    }

    function win() {
      if (locked) return;
      locked = true;
      var earned = roundScore(lives, timeLeft);
      score += earned;
      feedback = '✓ 세 코인을 잇는 포물선 완성! +' + earned + '점';
      coins.forEach(function (c) { burst(c.mesh.position, 0x22c55e); });
      scorePop(vtx.position, '+' + earned);
      chime(); setHud();
      var finalLevel = lvl + 1 >= LEVELS.length;
      // 결과 카드는 오버레이(z-index 8)로 화면을 덮으므로, 파티클·점수팝이 먼저 읽히도록 한 박자 늦춘다.
      setTimeout(function () {
        showResult(
          finalLevel ? '🏆 포물선 마스터!' : '✨ 그래프 잠금 성공',
          finalLevel ? (TRANSFER_LINE + ' · 총 ' + score + '점') : 'a·h·k를 조절해 코인 궤도를 정확히 찾았습니다.',
          finalLevel ? '한 판 더' : '다음 함수',
          function () {
            hideResult();
            if (finalLevel) {
              if (kernel) {
                kernel.saveBest(score);
                kernel.teach({ kind: 'clear', transfer: TRANSFER_LINE, onAgain: function () { lvl = 0; score = 0; startLevel(); } });
              }
              lvl = 0; score = 0;
              if (!kernel) startLevel();
            } else {
              lvl++;
              startLevel();
            }
          }
        );
      }, 850);
    }

    function lose(reason) {
      if (locked) return;
      locked = true; feedback = '💥 ' + reason; setHud();
      beep(110, 0.28, 'sawtooth', 0.06);
      var L = LEVELS[lvl];
      showResult('라운드 실패', reason + ' · 정답은 y = ' + vertexFormLabel(L.a, L.h, L.k) + ' 입니다.', '이 단계 다시', function () {
        hideResult(); score = checkpointScore; startLevel();
      }, true);
    }

    function resetShape() {
      if (locked) return;
      a = 0.5; h = 0; k = 1; aSlider.value = '0.5';
      feedback = '모양만 초기화했어요. 시간과 기회는 계속됩니다.';
      redraw();
    }

    function startLevel() {
      locked = false; lives = 3; timeLeft = LEVEL_TIME; lastHudSecond = -1;
      checkpointScore = score; feedback = '파란 꼭짓점과 곡률을 조절한 뒤 그래프를 제출하세요.';
      a = 0.5; h = 0; k = 1; aSlider.value = '0.5';
      buildCoins(); redraw();
    }

    // HUD + 컨트롤
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:12px;top:11px;font:700 13px "Noto Sans KR",sans-serif;color:#172554;pointer-events:none;line-height:1.55;text-shadow:0 1px 2px rgba(255,255,255,.8);max-width:calc(100% - 178px);z-index:4';
    host.appendChild(hud);
    function setHud() {
      var hearts = ''; for (var i = 0; i < 3; i++) hearts += i < lives ? '♥' : '♡';
      var matched = coins.filter(function (c) { return c.on; }).length;
      hud.innerHTML = '<span style="font-size:14px">y = ' + vertexFormLabel(a, h, k, { a: 2, h: 1, k: 1 }) + '</span>' +
        '<br>🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + LEVELS.length +
        ' · <span style="color:#dc2626;letter-spacing:2px">' + hearts + '</span>' +
        ' · ⏱ ' + Math.max(0, Math.ceil(timeLeft)) + '초' +
        '<br>🪙 코인 ' + matched + '/' + coins.length +
        (feedback ? '<br><b style="color:' + (feedback.charAt(0) === '✗' || feedback.charAt(0) === '💥' ? '#dc2626' : '#1d4ed8') + '">' + feedback + '</b>' : '');
    }

    var ctrl = document.createElement('div');
    ctrl.style.cssText = 'position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px;align-items:stretch;font:700 12px "Noto Sans KR",sans-serif;color:#1e3a8a;background:rgba(255,255,255,.82);backdrop-filter:blur(8px);padding:9px;border:1px solid rgba(99,102,241,.24);border-radius:12px;box-shadow:0 8px 24px rgba(30,64,175,.14);z-index:5';
    var lab = document.createElement('label'); lab.textContent = '곡률 a (위/아래·폭)';
    var aSlider = document.createElement('input'); aSlider.type = 'range'; aSlider.min = '-1.5'; aSlider.max = '1.5'; aSlider.step = '0.05'; aSlider.value = '0.5'; aSlider.style.width = '130px';
    aSlider.setAttribute('aria-label', '포물선 곡률 a');
    aSlider.oninput = function () { if (locked) return; a = parseFloat(aSlider.value); feedback = ''; redraw(); };
    var submitBtn = document.createElement('button'); submitBtn.textContent = '그래프 제출';
    submitBtn.style.cssText = 'border:0;border-radius:9px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;padding:8px 11px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,.28)';
    submitBtn.onclick = submitGraph;
    var rb = document.createElement('button'); rb.textContent = '↺ 모양 초기화'; rb.style.cssText = 'border:1px solid #c7d2fe;border-radius:8px;background:#fff;color:#4338ca;padding:6px 10px;font-weight:700;cursor:pointer';
    rb.onclick = resetShape;
    ctrl.appendChild(lab); ctrl.appendChild(aSlider); ctrl.appendChild(submitBtn); ctrl.appendChild(rb); host.appendChild(ctrl);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;left:12px;bottom:10px;font:650 12px "Noto Sans KR",sans-serif;color:#334155;text-shadow:0 1px 2px rgba(255,255,255,.8);z-index:4';
    tip.textContent = '꼭짓점 드래그 → 곡률 조절 → 그래프 제출 · 실패 3번 또는 시간 종료 시 재도전';
    host.appendChild(tip);

    // 성공/실패를 플레이어가 확인하고 직접 다음 라운드 또는 재도전을 선택한다.
    var result = document.createElement('div');
    result.style.cssText = 'position:absolute;inset:0;border-radius:16px;background:rgba(15,23,42,.68);backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;z-index:8;padding:20px';
    var resultCard = document.createElement('div');
    resultCard.style.cssText = 'width:min(360px,88%);background:rgba(255,255,255,.96);border:1px solid rgba(255,255,255,.8);border-radius:18px;padding:22px;text-align:center;box-shadow:0 22px 60px rgba(15,23,42,.35);font-family:"Noto Sans KR",sans-serif';
    var resultTitle = document.createElement('div'); resultTitle.style.cssText = 'font-size:22px;font-weight:900;color:#172554;margin-bottom:7px';
    var resultBody = document.createElement('div'); resultBody.style.cssText = 'font-size:13px;font-weight:650;line-height:1.6;color:#475569;margin-bottom:16px';
    var resultBtn = document.createElement('button'); resultBtn.style.cssText = 'border:0;border-radius:10px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;padding:10px 18px;font-weight:850;cursor:pointer;min-width:150px';
    resultCard.appendChild(resultTitle); resultCard.appendChild(resultBody); resultCard.appendChild(resultBtn); result.appendChild(resultCard); host.appendChild(result);
    function showResult(title, body, buttonText, onClick, danger) {
      resultTitle.textContent = title; resultBody.textContent = body; resultBtn.textContent = buttonText;
      resultBtn.style.background = danger ? 'linear-gradient(135deg,#dc2626,#e11d48)' : 'linear-gradient(135deg,#2563eb,#4f46e5)';
      resultBtn.onclick = onClick; result.style.display = 'flex';
      submitBtn.disabled = true; rb.disabled = true; aSlider.disabled = true;
    }
    function hideResult() {
      result.style.display = 'none'; submitBtn.disabled = false; rb.disabled = false; aSlider.disabled = false;
    }

    // 꼭짓점 드래그(평면 z=0에 레이캐스트)
    var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), drag = false;
    function ndc(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return new THREE.Vector2(((p.clientX - r.left) / r.width) * 2 - 1, -((p.clientY - r.top) / r.height) * 2 + 1); }
    function planePt(e) { ray.setFromCamera(ndc(e), cam); var pt = new THREE.Vector3(); ray.ray.intersectPlane(plane, pt); return pt; }
    function onDown(e) { if (locked) return; var pt = planePt(e); if (pt && Math.hypot(pt.x - h, pt.y - k) < 1.2) { drag = true; rndr.domElement.style.cursor = 'grabbing'; e.preventDefault(); } }
    function onMove(e) { if (!drag || locked) return; var pt = planePt(e); if (pt) { h = Math.max(XMIN + 1, Math.min(XMAX - 1, Math.round(pt.x * 2) / 2)); k = Math.max(YMIN, Math.min(YMAX - 1, Math.round(pt.y * 2) / 2)); feedback = ''; redraw(); } e.preventDefault(); }
    function onUp() { drag = false; rndr.domElement.style.cursor = 'grab'; }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    // 파티클 — 공유 지오메트리 + 고정 크기 풀 재사용(프레임 중 생성/폐기 0 → 60fps 유지)
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
        var s = pool[poolIdx];
        if (s.visible) continue;
        s.visible = true; s.position.copy(p);
        var ang = Math.random() * Math.PI * 2;
        s.userData.v.set(Math.cos(ang) * 3, Math.sin(ang) * 3 + 1.5, (Math.random() - 0.5) * 2);
        s.userData.life = 0.7; s.material.color.setHex(color); s.material.opacity = 1;
        return;
      }
    }
    function burst(p, color) { if (RM) return; for (var i = 0; i < 14; i++) spawnP(p, color); }

    // 카메라 셰이크(감쇠 노이즈) — 오답 임팩트. 6종 플래그십과 동일 패턴.
    var shakeT = 0, shakeDur = 1, shakeAmp = 0;
    function shake(amp, dur) { if (RM) return; shakeAmp = amp; shakeT = dur; shakeDur = dur; }

    // 점수 팝업(+n) — 월드 좌표를 화면으로 투영해 절대배치 후 상승·페이드.
    function scorePop(worldPos, txt) {
      var v = worldPos.clone().project(cam);
      var px = (v.x * 0.5 + 0.5) * (host.clientWidth || W), py = (-v.y * 0.5 + 0.5) * H;
      var f = document.createElement('div');
      f.textContent = txt;
      f.style.cssText = 'position:absolute;left:' + Math.round(px) + 'px;top:' + Math.round(py - 18) + 'px;transform:translate(-50%,0);font:800 22px "Noto Sans KR",sans-serif;color:#fde047;text-shadow:0 2px 8px rgba(15,23,42,.6);pointer-events:none;opacity:1;transition:' + (RM ? 'opacity .8s ease-out' : 'transform .8s ease-out,opacity .8s ease-out') + ';z-index:9';
      host.appendChild(f);
      setTimeout(function () { if (!RM) f.style.transform = 'translate(-50%,-44px)'; f.style.opacity = '0'; }, 30);
      setTimeout(function () { f.remove(); }, 900);
    }

    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop); var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      if (!locked && started) {
        timeLeft = Math.max(0, timeLeft - dt);
        var sec = Math.ceil(timeLeft);
        if (sec !== lastHudSecond) { lastHudSecond = sec; setHud(); }
        if (timeLeft <= 0) lose('제한 시간이 끝났어요');
      }
      coins.forEach(function (c) {
        c.mesh.rotation.y += dt * 2.4;
        c.spawn = Math.min(1, c.spawn + dt / 0.45);
        c.pulse = Math.max(0, c.pulse - dt * 2.2);
        var grow = c.spawn < 1 ? Math.max(0.001, easeOutBack(c.spawn)) : 1;
        c.mesh.scale.setScalar(grow * (1 + Math.sin(c.pulse * Math.PI) * 0.32));
      });
      vtx.scale.setScalar(RM ? 1 : 1 + 0.08 * Math.sin(ts / 300));
      var sk = 0;
      if (shakeT > 0) { shakeT = Math.max(0, shakeT - dt); sk = (shakeT / shakeDur) * shakeAmp; }
      cam.position.set((Math.random() * 2 - 1) * sk, CAM_Y + (Math.random() * 2 - 1) * sk, 16);
      for (var i = 0; i < POOL; i++) {
        var s = pool[i]; if (!s.visible) continue;
        s.userData.life -= dt;
        if (s.userData.life <= 0) { s.visible = false; continue; }
        s.userData.v.y -= 7 * dt; s.position.addScaledVector(s.userData.v, dt);
        s.material.opacity = Math.max(0, s.userData.life);
      }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    var actx = null;
    function beep(fr, d, type, vol) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = fr; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (fr, i) { setTimeout(function () { beep(fr, 0.18, 'triangle'); }, i * 110); }); }

    startLevel();
    locked = true;
    showResult(
      '🪙 포물선 구조대',
      '45초 안에 꼭짓점(h, k)과 곡률(a)을 조절해 세 코인을 모두 통과시키세요. 그래프 제출은 세 번까지 가능합니다.',
      '도전 시작',
      function () {
        hideResult(); started = true; locked = false;
        feedback = '파란 꼭짓점과 곡률을 조절한 뒤 그래프를 제출하세요.'; setHud();
      }
    );
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
