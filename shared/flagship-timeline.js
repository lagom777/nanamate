/* 나나메이트 플래그십 3D 게임 — 연표 디펜스 (aboutHistory/03-medieval)
 * 중세 실제 사건 카드가 레일을 따라 다가온다. 화면 아래 시대 슬롯(초기/전성기/말기)으로
 * 드래그해 올바른 구간에 분류하라. 통과/오답 시 라이프 감소, 정답 시 점수. 목표 개수를 맞히면 승리.
 * 시대 구분: 초기 중세(476~999) · 전성기 중세(1000~1299) · 말기 중세(1300~1453) — 표준 Early/High/Late Middle Ages.
 * 등장 사건과 연도는 모두 실제 역사 사실(서로마멸망 476, 헤지라 622, 샤를마뉴 대관 800,
 * 카노사 굴욕 1077, 십자군 시작 1095, 칭기즈칸 즉위 1206, 마그나카르타 1215, 흑사병 1347,
 * 잔다르크 화형 1431, 비잔티움 멸망 1453). 지어내기 없음.
 * 컨테이너: <div id="nm-timeline"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문(graceful).
 */
(function () {
  // ──────────────────────────────────────────────────────────────────────
  // 순수 로직 (테스트 가능) — DOM/THREE 의존 없음
  // ──────────────────────────────────────────────────────────────────────
  // 시대 구간: [시작, 끝] 포함. 표준 중세 3분기.
  var ERAS = [
    { key: 'early', name: '초기 중세', range: [476, 999] },
    { key: 'high', name: '전성기 중세', range: [1000, 1299] },
    { key: 'late', name: '말기 중세', range: [1300, 1453] }
  ];

  // 실제 중세 사건 (연도는 역사적 사실)
  var EVENTS = [
    { year: 476, label: '서로마 멸망' },
    { year: 622, label: '헤지라(이슬람력 원년)' },
    { year: 732, label: '투르-푸아티에 전투' },
    { year: 800, label: '샤를마뉴 황제 대관' },
    { year: 1054, label: '동서 교회 분열' },
    { year: 1077, label: '카노사 굴욕' },
    { year: 1095, label: '십자군 시작' },
    { year: 1206, label: '칭기즈 칸 즉위' },
    { year: 1215, label: '마그나카르타' },
    { year: 1347, label: '흑사병 유럽 상륙' },
    { year: 1431, label: '잔 다르크 화형' },
    { year: 1453, label: '비잔티움 멸망' }
  ];

  // 연도 → 올바른 시대 key (없으면 null)
  function eraForYear(year) {
    for (var i = 0; i < ERAS.length; i++) {
      var r = ERAS[i].range;
      if (year >= r[0] && year <= r[1]) return ERAS[i].key;
    }
    return null;
  }

  // 분류 정답 여부: 사건 연도가 선택한 시대 구간에 속하는가
  function classify(year, eraKey) {
    return eraForYear(year) === eraKey;
  }

  // 승리 판정: 라이프가 남아 있고(>0) 정답 개수가 목표 이상이면 승리.
  // state = { correct, lives, goal }
  function isWin(state) {
    return state.lives > 0 && state.correct >= state.goal;
  }

  // 패배 판정: 라이프 소진.
  function isLose(state) {
    return state.lives <= 0;
  }

  var LOGIC = {
    ERAS: ERAS,
    EVENTS: EVENTS,
    eraForYear: eraForYear,
    classify: classify,
    isWin: isWin,
    isLose: isLose
  };
  // Node 환경(테스트)에서 로직만 export하고 게임 초기화는 건너뛴다. 브라우저에선 게임 실행.
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    if (typeof module !== 'undefined' && module.exports) module.exports = LOGIC;
    if (typeof globalThis !== 'undefined') globalThis.NM_TIMELINE_LOGIC = LOGIC;
    return;
  }

  // ──────────────────────────────────────────────────────────────────────
  // 게임 (브라우저 전용)
  // ──────────────────────────────────────────────────────────────────────
  function init() {
    var host = document.getElementById('nm-timeline');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var W = host.clientWidth || 640, H = 380, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
      cam.position.set(0, 0, 14); cam.lookAt(0, 0, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:grab;touch-action:none;display:block;background:linear-gradient(180deg,#1f1505 0%,#2a1d08 100%)';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    var dl = new THREE.DirectionalLight(0xfff0d0, 0.6); dl.position.set(2, 5, 8); scene.add(dl);

    // 좌표계: x ∈ [-9, 9], y ∈ [위 카드 진입 ~ 아래 슬롯]
    var XL = -8.4, XR = 8.4;            // 좌우 경계
    var TOP_Y = 6.2;                    // 카드 진입 높이
    var SLOT_Y = -4.6;                  // 슬롯 중심 높이
    var FAIL_Y = -5.9;                  // 이 아래로 내려가면 통과(실점)
    var SLOT_W = 5.0, SLOT_H = 1.7;     // 슬롯 크기

    // 레일(세 줄)
    var railMat = new THREE.LineDashedMaterial({ color: 0x8a6a2a, dashSize: 0.3, gapSize: 0.25, transparent: true, opacity: 0.55 });
    var railXs = [-5.2, 0, 5.2];
    railXs.forEach(function (rx) {
      var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(rx, TOP_Y, 0), new THREE.Vector3(rx, SLOT_Y + 0.9, 0)]);
      var ln = new THREE.Line(g, railMat); ln.computeLineDistances(); scene.add(ln);
    });

    // 캔버스 라벨 → 텍스처 스프라이트
    function makeLabel(text, sub, bg, fg) {
      var cv = document.createElement('canvas'); var ctx = cv.getContext('2d');
      cv.width = 320; cv.height = 150;
      ctx.fillStyle = bg; roundRect(ctx, 6, 6, 308, 138, 18); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; roundRect(ctx, 6, 6, 308, 138, 18); ctx.stroke();
      ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 30px "Noto Sans KR",sans-serif';
      wrapText(ctx, text, 160, sub ? 58 : 75, 290, 34);
      if (sub) { ctx.font = '800 40px "Noto Sans KR",sans-serif'; ctx.fillStyle = '#fde68a'; ctx.fillText(sub, 160, 110); }
      var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter;
      return tx;
    }
    function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function wrapText(ctx, text, x, y, maxW, lh) {
      var words = text.split(' '), line = '', lines = [];
      for (var i = 0; i < words.length; i++) { var t = line + words[i] + ' '; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = words[i] + ' '; } else line = t; }
      lines.push(line);
      var oy = y - (lines.length - 1) * lh / 2;
      for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j].trim(), x, oy + j * lh);
    }

    // 슬롯 (3 시대) — 화면 하단 가로 배치
    var slotMeshes = [];
    var slotXs = [-5.6, 0, 5.6];
    LOGIC.ERAS.forEach(function (era, i) {
      var sx = slotXs[i];
      var hue = [0x6b3f12, 0x8a5a16, 0xb45309][i];
      var geo = new THREE.PlaneGeometry(SLOT_W, SLOT_H);
      var mat = new THREE.MeshBasicMaterial({ color: hue, transparent: true, opacity: 0.5 });
      var m = new THREE.Mesh(geo, mat); m.position.set(sx, SLOT_Y, -0.2); scene.add(m);
      // 테두리
      var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xf59e0b }));
      edges.position.copy(m.position); edges.position.z = -0.15; scene.add(edges);
      // 라벨 스프라이트
      var rg = era.range;
      var tx = makeLabel(era.name, rg[0] + '~' + rg[1], 'rgba(0,0,0,0)', '#fde68a');
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false }));
      sp.position.set(sx, SLOT_Y, 0.1); sp.scale.set(4.2, 1.97, 1); scene.add(sp);
      slotMeshes.push({ era: era, x: sx, mesh: m, edges: edges, baseColor: hue });
    });

    // 카드 클래스 — 연도는 숨김(사건명만). 연도는 힌트/착지 피드백으로만 노출.
    var palette = [0x3b2a52, 0x1e3a5f, 0x14532d, 0x5b2333, 0x4a3520, 0x274046];
    function makeCard(ev) {
      var tx = makeLabel(ev.label, null, 'rgba(20,24,30,0.92)', '#f3f4f6');
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false }));
      sp.scale.set(3.4, 1.6, 1);
      var lane = railXs[Math.floor(Math.random() * railXs.length)];
      sp.position.set(lane, TOP_Y, 0.4);
      scene.add(sp);
      return { ev: ev, sprite: sp, vy: -0.0, settled: false, yearShown: false, holdT: 0 };
    }
    // 카드 스프라이트에 연도를 노출(힌트/착지 피드백 공용)
    function revealYear(sprite, ev) {
      var tx = makeLabel(ev.label, String(ev.year), 'rgba(20,24,30,0.92)', '#f3f4f6');
      sprite.material.map.dispose(); sprite.material.map = tx; sprite.material.needsUpdate = true;
    }

    // 게임 상태
    var GOAL = 8;            // 목표 정답 개수
    var state = { correct: 0, lives: 3, goal: GOAL };
    var score = 0;          // 점수: 정답 +10, 연도 힌트 −10
    var totalPlaced = 0;
    var deck = shuffle(LOGIC.EVENTS.slice());
    var deckIdx = 0;
    var active = null;       // 현재 떨어지는 카드
    var fallSpeed = 1.05;    // units/sec, 점차 가속
    var HOLD_MAX = 4;        // 카드별 드래그 홀드 예산(초) — 무한 붙잡기 스톨 방지
    var running = true;
    var won = false, lost = false;

    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function nextEvent() { if (deckIdx >= deck.length) { deck = shuffle(LOGIC.EVENTS.slice()); deckIdx = 0; } return deck[deckIdx++]; }
    function spawn() { if (!running) return; active = makeCard(nextEvent()); }

    // HUD
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:12px;top:10px;font:700 14px "Noto Sans KR",sans-serif;color:#fde68a;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;line-height:1.6';
    host.appendChild(hud);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;right:12px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#fcd9a0;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;text-align:right;max-width:55%';
    tip.textContent = '연도는 숨겨져요 — 사건으로 시대를 추리! 카드를 올바른 시대 슬롯에 넣으세요';
    host.appendChild(tip);

    // 연도 힌트 버튼 — 현재 카드의 연도를 노출(−10점, 횟수 무제한이지만 비쌈)
    var hintBtn = document.createElement('button');
    hintBtn.textContent = '💡 연도 힌트 (−10점)';
    hintBtn.style.cssText = 'position:absolute;right:12px;top:10px;border:1px solid rgba(253,224,71,.55);border-radius:8px;background:rgba(40,34,12,.85);color:#fde047;font:700 12px "Noto Sans KR",sans-serif;padding:5px 10px;cursor:pointer';
    hintBtn.onclick = function () {
      if (!active || !running || active.yearShown) return;
      active.yearShown = true;
      score = Math.max(0, score - 10);
      revealYear(active.sprite, active.ev);
      setHud('힌트: 이 사건은 ' + active.ev.year + '년 (−10점)');
    };
    host.appendChild(hintBtn);

    function hearts() { var h = ''; for (var i = 0; i < 3; i++) h += i < state.lives ? '❤️' : '🖤'; return h; }
    function setHud(msg) {
      hud.innerHTML = '🏆 ' + score + '점 · ' + state.correct + '/' + GOAL + ' 정답 · ' + hearts() +
        '<br><span style="font-size:12px;color:#fcd9a0">총 분류 ' + totalPlaced + '</span>' +
        (msg ? '<br><b style="color:#fff">' + msg + '</b>' : '');
    }
    setHud();

    // 입력: 카드 드래그 (z=0 평면 레이캐스트)
    var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.4), drag = false, grabDX = 0, grabDY = 0;
    function ndc(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return new THREE.Vector2(((p.clientX - r.left) / r.width) * 2 - 1, -((p.clientY - r.top) / r.height) * 2 + 1); }
    function planePt(e) { ray.setFromCamera(ndc(e), cam); var pt = new THREE.Vector3(); ray.ray.intersectPlane(plane, pt); return pt; }
    function onDown(e) {
      if (!active || !running) return;
      if (active.holdT > HOLD_MAX) return; // 홀드 예산 소진된 카드는 다시 잡을 수 없다(잡았다 놓기 반복 방지)
      var pt = planePt(e); if (!pt) return;
      var p = active.sprite.position;
      if (Math.abs(pt.x - p.x) < 1.9 && Math.abs(pt.y - p.y) < 0.95) {
        drag = true; grabDX = p.x - pt.x; grabDY = p.y - pt.y;
        rndr.domElement.style.cursor = 'grabbing'; e.preventDefault();
      }
    }
    function onMove(e) {
      if (!drag || !active) return;
      var pt = planePt(e); if (!pt) return;
      var nx = Math.max(XL, Math.min(XR, pt.x + grabDX));
      var ny = Math.max(FAIL_Y + 0.3, Math.min(TOP_Y, pt.y + grabDY));
      if (active.holdT > HOLD_MAX) ny = Math.min(ny, active.sprite.position.y); // 예산 소진 후엔 위로 못 끌어올림(좌우 조준만 가능)
      active.sprite.position.set(nx, ny, 0.5);
      highlightSlots(nx, ny);
      e.preventDefault();
    }
    function onUp(e) {
      if (!drag || !active) { drag = false; return; }
      drag = false; rndr.domElement.style.cursor = 'grab';
      var p = active.sprite.position;
      var slot = slotAt(p.x, p.y);
      clearHighlights();
      if (slot) drop(slot);
      e.preventDefault();
    }
    function slotAt(x, y) {
      for (var i = 0; i < slotMeshes.length; i++) {
        var s = slotMeshes[i];
        if (Math.abs(x - s.x) < SLOT_W / 2 + 0.4 && Math.abs(y - SLOT_Y) < SLOT_H / 2 + 0.9) return s;
      }
      return null;
    }
    function highlightSlots(x, y) {
      var hit = slotAt(x, y);
      slotMeshes.forEach(function (s) { s.mesh.material.opacity = (s === hit) ? 0.85 : 0.5; });
    }
    function clearHighlights() { slotMeshes.forEach(function (s) { s.mesh.material.opacity = 0.5; s.mesh.material.color.setHex(s.baseColor); }); }

    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    // 착지한 카드의 연도를 잠깐 보여준 뒤 제거 (오답이든 정답이든 학습의 순간)
    function landFeedback() {
      if (!active) return;
      var sprite = active.sprite, ev = active.ev; active = null;
      revealYear(sprite, ev);
      setTimeout(function () { scene.remove(sprite); }, 850);
    }

    // 카드를 슬롯에 떨어뜨림 → 분류 채점
    function drop(slot) {
      var ev = active.ev;
      var ok = LOGIC.classify(ev.year, slot.era.key);
      totalPlaced++;
      var pos = active.sprite.position.clone();
      if (ok) {
        state.correct++;
        score += 10;
        flashSlot(slot, 0x22c55e); burst(pos, 0x86efac); beep(880, 0.1, 'sine'); setTimeout(function () { beep(1320, 0.13, 'sine'); }, 80);
        landFeedback();
        if (LOGIC.isWin(state)) return doWin();
        setHud('정답! ' + ev.year + '년은 ' + slot.era.name + ' (+10점)');
        fallSpeed = Math.min(2.6, fallSpeed + 0.06);
        spawn();
      } else {
        var correctEra = LOGIC.eraForYear(ev.year);
        var correctName = '';
        for (var i = 0; i < LOGIC.ERAS.length; i++) if (LOGIC.ERAS[i].key === correctEra) correctName = LOGIC.ERAS[i].name;
        loseLife(ev.year + '년은 ' + correctName + ' (' + slot.era.name + ' 아님)');
        flashSlot(slot, 0xef4444); burst(pos, 0xfca5a5);
        landFeedback();
        if (!lost) spawn();
      }
    }
    function loseLife(msg) {
      state.lives--; beep(150, 0.18, 'square'); setHud(msg);
      if (LOGIC.isLose(state)) doLose();
    }
    function removeActive() { if (active) { scene.remove(active.sprite); active = null; } }

    function doWin() {
      won = true; running = false; removeActive();
      setHud('🎉 클리어! ' + GOAL + '개 사건을 올바른 시대로 분류했습니다');
      chime(); slotMeshes.forEach(function (s) { burst(new THREE.Vector3(s.x, SLOT_Y, 0.5), 0xfde047); });
      setTimeout(restart, 3600);
    }
    function doLose() {
      lost = true; running = false; removeActive();
      setHud('💥 라이프 소진 — 다시 도전!'); beep(110, 0.4, 'sawtooth');
      setTimeout(restart, 2600);
    }
    function restart() {
      state = { correct: 0, lives: 3, goal: GOAL }; score = 0; totalPlaced = 0; fallSpeed = 1.05;
      won = false; lost = false; running = true; deck = shuffle(LOGIC.EVENTS.slice()); deckIdx = 0;
      setHud('새 게임'); spawn();
    }

    function flashSlot(slot, color) {
      slot.mesh.material.color.setHex(color); slot.mesh.material.opacity = 0.9;
      setTimeout(function () { slot.mesh.material.color.setHex(slot.baseColor); slot.mesh.material.opacity = 0.5; }, 450);
    }

    // 파티클
    var parts = [];
    function burst(p, color) { for (var i = 0; i < 14; i++) { var s = new THREE.Sprite(new THREE.SpriteMaterial({ color: color, transparent: true })); s.position.copy(p); s.scale.set(0.22, 0.22, 1); var ang = Math.random() * Math.PI * 2; s.userData.v = new THREE.Vector3(Math.cos(ang) * 4, Math.sin(ang) * 4 + 1.5, 0); s.userData.life = 0.7; scene.add(s); parts.push(s); } }

    // 루프
    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      if (running && active) {
        if (drag) active.holdT += dt; // 붙잡은 시간 누적(카드별) — 스톨 방지 예산
        if (!drag || active.holdT > HOLD_MAX) { // 예산 소진 시 잡고 있어도 낙하 재개
          active.sprite.position.y -= fallSpeed * dt;
          if (active.sprite.position.y <= FAIL_Y) {
            // 통과 = 분류 실패 → 실점
            var pos = active.sprite.position.clone();
            burst(pos, 0x94a3b8); totalPlaced++;
            removeActive();
            if (drag) { drag = false; rndr.domElement.style.cursor = 'grab'; clearHighlights(); } // 잡은 채 소멸 → 드래그 해제
            loseLife('놓침! 시대 분류 실패');
            if (!lost) spawn();
          }
        }
      }
      // 슬롯 라벨 미세 펄스
      var pulse = 0.5 + 0.06 * Math.sin(ts / 400);
      if (!drag) slotMeshes.forEach(function (s) { if (s.mesh.material.color.getHex() === s.baseColor) s.mesh.material.opacity = pulse; });
      for (var i = parts.length - 1; i >= 0; i--) { var s = parts[i]; s.userData.life -= dt; if (s.userData.life <= 0) { scene.remove(s); parts.splice(i, 1); continue; } s.userData.v.y -= 8 * dt; s.position.addScaledVector(s.userData.v, dt); s.material.opacity = Math.max(0, s.userData.life); }
      rndr.render(scene, cam);
    }
    spawn();
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // 사운드
    var actx = null;
    function beep(f, d, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
