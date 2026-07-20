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

    // 모션 최소화 — 셰이크·색종이·플리커·먼지·파티클 게이트
    var RM = false; try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    var W = host.clientWidth || 640, H = 380, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
      cam.position.set(0, 0, 14); cam.lookAt(0, 0, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    // 배경: 양피지+횃불 톤 (아래에서 번지는 온기, 위는 어둠)
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:grab;touch-action:none;display:block;background:' +
      'radial-gradient(120% 70% at 50% 110%,rgba(255,147,41,.30) 0%,rgba(186,94,22,.15) 40%,rgba(0,0,0,0) 70%),' +
      'radial-gradient(60% 42% at 10% 102%,rgba(255,176,64,.16),rgba(0,0,0,0) 70%),' +
      'radial-gradient(60% 42% at 90% 102%,rgba(255,176,64,.16),rgba(0,0,0,0) 70%),' +
      'linear-gradient(180deg,#120b03 0%,#231505 45%,#372108 78%,#462c0b 100%)';
    host.appendChild(rndr.domElement);

    // 이펙트용 CSS (1회 주입)
    if (!document.getElementById('nmtl-style')) {
      var st = document.createElement('style'); st.id = 'nmtl-style';
      st.textContent = [
        '.nmtl-vig{position:absolute;inset:0;border-radius:12px;pointer-events:none;z-index:2;box-shadow:inset 0 48px 64px -20px rgba(0,0,0,.78),inset 0 -20px 48px -18px rgba(0,0,0,.5),inset 0 0 90px rgba(0,0,0,.4)}',
        '.nmtl-red{position:absolute;inset:0;border-radius:12px;pointer-events:none;z-index:3;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 42%,rgba(185,28,28,.55) 100%)}',
        '.nmtl-hint{transition:transform .12s ease,box-shadow .2s ease}',
        '.nmtl-hint:hover{box-shadow:0 0 16px rgba(253,224,71,.5),0 0 3px rgba(253,224,71,.9)}',
        '.nmtl-hint:active{transform:scale(.95)}',
        '.nmtl-heart{display:inline-block;transition:filter .45s ease,opacity .45s ease}',
        '.nmtl-heart.lost{filter:grayscale(1) brightness(.7);opacity:.5;animation:nmtl-hloss .6s cubic-bezier(.3,1.6,.4,1)}',
        '@keyframes nmtl-hloss{0%{transform:scale(1)}35%{transform:scale(1.6)}70%{transform:scale(.75)}100%{transform:scale(1)}}',
        '.nmtl-pop{position:absolute;transform:translate(-50%,-50%);font:900 18px "Noto Sans KR",sans-serif;color:#fde047;text-shadow:0 0 10px rgba(253,224,71,.8),0 2px 4px rgba(0,0,0,.7);pointer-events:none;z-index:5;animation:nmtl-rise .9s ease-out forwards}',
        '@keyframes nmtl-rise{0%{opacity:1;transform:translate(-50%,-50%) scale(.7)}25%{transform:translate(-50%,-70%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-160%) scale(1)}}',
        '.nmtl-combo{position:absolute;left:50%;top:42px;transform:translateX(-50%);font:900 14px "Noto Sans KR",sans-serif;color:#fff;background:linear-gradient(135deg,#b45309,#f59e0b);padding:4px 14px;border-radius:999px;box-shadow:0 0 18px rgba(245,158,11,.55);pointer-events:none;z-index:4;text-shadow:0 1px 2px rgba(0,0,0,.4)}',
        '.nmtl-cpop{animation:nmtl-cpopk .35s cubic-bezier(.3,1.6,.4,1)}',
        '@keyframes nmtl-cpopk{0%{transform:translateX(-50%) scale(.6)}60%{transform:translateX(-50%) scale(1.18)}100%{transform:translateX(-50%) scale(1)}}',
        '.nmtl-prog{position:absolute;left:12px;bottom:12px;display:flex;gap:4px;z-index:4;pointer-events:none}',
        '.nmtl-seg{width:20px;height:9px;border-radius:3px;background:rgba(58,38,10,.8);border:1px solid rgba(253,224,71,.3);overflow:hidden;position:relative}',
        '.nmtl-seg i{position:absolute;inset:0;background:linear-gradient(90deg,#b45309,#fde047 55%,#f59e0b);transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.2,.8,.3,1.15)}',
        '.nmtl-seg.on i{transform:scaleX(1)}',
        '.nmtl-seg.on::after{content:"";position:absolute;top:0;bottom:0;left:-12px;width:10px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),transparent);animation:nmtl-glint .55s ease .25s}',
        '@keyframes nmtl-glint{to{left:26px}}',
        '.nmtl-conf{position:absolute;top:-12px;width:9px;height:14px;border-radius:2px;pointer-events:none;z-index:6;animation:nmtl-fall 2.6s linear forwards}',
        '@keyframes nmtl-fall{to{transform:translateY(420px) rotate(540deg);opacity:.35}}',
        '.nmtl-lose{position:absolute;inset:0;border-radius:12px;background:rgba(12,7,2,0);transition:background .7s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:7;pointer-events:none;color:#fca5a5;font:800 20px "Noto Sans KR",sans-serif;text-shadow:0 2px 8px rgba(0,0,0,.85)}',
        '.nmtl-lose.on{background:rgba(12,7,2,.68)}',
        '.nmtl-lose small{font:700 14px "Noto Sans KR",sans-serif;color:#fde68a;margin-top:8px}',
        '@media (prefers-reduced-motion:reduce){.nmtl-pop,.nmtl-conf,.nmtl-heart.lost,.nmtl-cpop,.nmtl-seg.on::after{animation:none}.nmtl-seg i,.nmtl-heart{transition:none}}'
      ].join('');
      document.head.appendChild(st);
    }

    // 어두운 vignette 오버레이 (DOM)
    var vig = document.createElement('div'); vig.className = 'nmtl-vig'; host.appendChild(vig);
    // 오답 붉은 플래시 오버레이 (DOM)
    var redVig = document.createElement('div'); redVig.className = 'nmtl-red'; host.appendChild(redVig);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    var dl = new THREE.DirectionalLight(0xfff0d0, 0.6); dl.position.set(2, 5, 8); scene.add(dl);

    // 루트 그룹 — 셰이크는 이 그룹 전체를 흔든다
    var root = new THREE.Group(); scene.add(root);

    // 좌표계: x ∈ [-9, 9], y ∈ [위 카드 진입 ~ 아래 슬롯]
    var XL = -8.4, XR = 8.4;            // 좌우 경계
    var TOP_Y = 6.2;                    // 카드 진입 높이
    var SLOT_Y = -4.6;                  // 슬롯 중심 높이
    var FAIL_Y = -5.9;                  // 이 아래로 내려가면 통과(실점)
    var SLOT_W = 5.0, SLOT_H = 1.7;     // 슬롯 크기

    // 슬롯 뒤 받침대(램버트) — 촛불 PointLight 플리커가 비치는 면
    var ledge = new THREE.Mesh(new THREE.PlaneGeometry(26, 4.8), new THREE.MeshLambertMaterial({ color: 0x2e1c08 }));
    ledge.position.set(0, SLOT_Y - 0.3, -0.9); root.add(ledge);

    // 레일(세 줄)
    var railMat = new THREE.LineDashedMaterial({ color: 0x8a6a2a, dashSize: 0.3, gapSize: 0.25, transparent: true, opacity: 0.55 });
    var railXs = [-5.2, 0, 5.2];
    railXs.forEach(function (rx) {
      var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(rx, TOP_Y, 0), new THREE.Vector3(rx, SLOT_Y + 0.9, 0)]);
      var ln = new THREE.Line(g, railMat); ln.computeLineDistances(); root.add(ln);
    });

    // 부유 먼지 입자 (Points 한 겹, RM이면 생략)
    var DN = 60, dust = null, dustV = null;
    if (!RM) {
      var dpos = new Float32Array(DN * 3); dustV = [];
      for (var dii = 0; dii < DN; dii++) {
        dpos[dii * 3] = XL + Math.random() * (XR - XL);
        dpos[dii * 3 + 1] = -5.5 + Math.random() * 12;
        dpos[dii * 3 + 2] = -0.5 + Math.random();
        dustV.push({ vx: (Math.random() - 0.5) * 0.12, vy: 0.06 + Math.random() * 0.12, ph: Math.random() * 6.28 });
      }
      var dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
      dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xe8c87a, size: 0.09, transparent: true, opacity: 0.45, depthWrite: false }));
      root.add(dust);
    }

    // 부드러운 라디얼 글로우 텍스처 (촛불 후광용)
    function radialTex(inner, outer) {
      var cv = document.createElement('canvas'); cv.width = cv.height = 128; var g = cv.getContext('2d');
      var gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
      gr.addColorStop(0, inner); gr.addColorStop(1, outer);
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter; return tx;
    }
    var glowTex = radialTex('rgba(255,190,90,0.85)', 'rgba(255,140,40,0)');

    // 캔버스 라벨 → 텍스처 스프라이트 (카드는 금테 보더 + 드롭섀도)
    function makeLabel(text, sub, bg, fg) {
      var cv = document.createElement('canvas'); var ctx = cv.getContext('2d');
      cv.width = 320; cv.height = 150;
      var framed = bg !== 'rgba(0,0,0,0)';
      if (framed) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
        ctx.fillStyle = bg; roundRect(ctx, 12, 8, 296, 128, 16); ctx.fill();
        ctx.restore();
        var gold = ctx.createLinearGradient(0, 8, 0, 136);
        gold.addColorStop(0, '#f7dd8a'); gold.addColorStop(0.5, '#9a6c1c'); gold.addColorStop(1, '#eabc50');
        ctx.strokeStyle = gold; ctx.lineWidth = 4; roundRect(ctx, 12, 8, 296, 128, 16); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,241,196,0.45)'; ctx.lineWidth = 1.5; roundRect(ctx, 17, 13, 286, 118, 12); ctx.stroke();
      }
      ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 30px "Noto Sans KR",sans-serif';
      wrapText(ctx, text, 160, sub ? 58 : 75, 280, 34);
      if (sub) {
        ctx.font = '800 40px "Noto Sans KR",sans-serif'; ctx.fillStyle = '#fde68a';
        ctx.shadowColor = 'rgba(253,224,71,0.65)'; ctx.shadowBlur = 12;
        ctx.fillText(sub, 160, 110); ctx.shadowBlur = 0;
      }
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

    // 슬롯 (3 시대) — 화면 하단 가로 배치 + 촛불(PointLight 플리커, RM이면 고정)
    var slotMeshes = [], candles = [];
    var slotXs = [-5.6, 0, 5.6];
    LOGIC.ERAS.forEach(function (era, i) {
      var sx = slotXs[i];
      var hue = [0x6b3f12, 0x8a5a16, 0xb45309][i];
      var geo = new THREE.PlaneGeometry(SLOT_W, SLOT_H);
      var mat = new THREE.MeshBasicMaterial({ color: hue, transparent: true, opacity: 0.5 });
      var m = new THREE.Mesh(geo, mat); m.position.set(sx, SLOT_Y, -0.2); root.add(m);
      // 테두리
      var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xf59e0b }));
      edges.position.copy(m.position); edges.position.z = -0.15; root.add(edges);
      // 라벨 스프라이트
      var rg = era.range;
      var tx = makeLabel(era.name, rg[0] + '~' + rg[1], 'rgba(0,0,0,0)', '#fde68a');
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false }));
      sp.position.set(sx, SLOT_Y, 0.1); sp.scale.set(4.2, 1.97, 1); root.add(sp);
      // 촛불: 포인트라이트(받침대에 비침) + 후광 스프라이트
      var pl = new THREE.PointLight(0xffa94d, 0.8, 7.5); pl.position.set(sx, SLOT_Y + 1.3, 1.6); root.add(pl);
      var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb45e, transparent: true, opacity: 0.42, depthTest: false, blending: THREE.AdditiveBlending }));
      glow.position.set(sx, SLOT_Y + 0.15, -0.6); glow.scale.set(6.4, 3.6, 1); root.add(glow);
      candles.push({ light: pl, glow: glow, p1: Math.random() * 6.28, p2: Math.random() * 6.28, p3: Math.random() * 6.28 });
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
      root.add(sp);
      return { ev: ev, sprite: sp, vy: -0.0, settled: false, yearShown: false, holdT: 0, ph: Math.random() * 6.28, sK: 1, tK: 1 };
    }
    // 카드 스프라이트에 연도를 노출(힌트/착지 피드백 공용)
    function revealYear(sprite, ev) {
      var tx = makeLabel(ev.label, String(ev.year), 'rgba(20,24,30,0.92)', '#f3f4f6');
      sprite.material.map.dispose(); sprite.material.map = tx; sprite.material.needsUpdate = true;
    }
    function disposeSprite(sp) { if (sp.material.map) sp.material.map.dispose(); sp.material.dispose(); }

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
    var combo = 0;           // 연속 정답 (표시/사운드 전용 — 점수는 그대로 +10)

    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function nextEvent() { if (deckIdx >= deck.length) { deck = shuffle(LOGIC.EVENTS.slice()); deckIdx = 0; } return deck[deckIdx++]; }
    function spawn() { if (!running) return; active = makeCard(nextEvent()); }

    // HUD — 하트는 span 3개(개별 애니메이션용)
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:12px;top:10px;font:700 14px "Noto Sans KR",sans-serif;color:#fde68a;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;line-height:1.6;z-index:4';
    var hudLine = document.createElement('span');
    var heartWrap = document.createElement('span');
    var heartEls = [];
    for (var hi = 0; hi < 3; hi++) { var hs = document.createElement('span'); hs.className = 'nmtl-heart'; hs.textContent = '❤️'; heartWrap.appendChild(hs); heartEls.push(hs); }
    var hudSub = document.createElement('div');
    hud.appendChild(hudLine); hud.appendChild(heartWrap); hud.appendChild(hudSub);
    host.appendChild(hud);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;right:12px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#fcd9a0;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;text-align:right;max-width:55%;z-index:4';
    tip.textContent = '연도는 숨겨져요 — 사건으로 시대를 추리! 카드를 올바른 시대 슬롯에 넣으세요';
    host.appendChild(tip);

    // 진행 바 — GOAL(8)칸 세그먼트, 채워질 때 골드 슬라이드 + 글린트
    var prog = document.createElement('div'); prog.className = 'nmtl-prog';
    var segEls = [];
    for (var pi = 0; pi < GOAL; pi++) { var sg = document.createElement('span'); sg.className = 'nmtl-seg'; sg.appendChild(document.createElement('i')); prog.appendChild(sg); segEls.push(sg); }
    host.appendChild(prog);
    function updateProg() { for (var i = 0; i < GOAL; i++) segEls[i].classList.toggle('on', i < state.correct); }

    // 연도 힌트 버튼 — 현재 카드의 연도를 노출(−10점, 횟수 무제한이지만 비쌈)
    var hintBtn = document.createElement('button');
    hintBtn.textContent = '💡 연도 힌트 (−10점)';
    hintBtn.className = 'nmtl-hint';
    hintBtn.style.cssText = 'position:absolute;right:12px;top:10px;border:1px solid rgba(253,224,71,.55);border-radius:8px;background:rgba(40,34,12,.85);color:#fde047;font:700 12px "Noto Sans KR",sans-serif;padding:5px 10px;cursor:pointer;z-index:4';
    hintBtn.onclick = function () {
      if (!active || !running || active.yearShown) return;
      active.yearShown = true;
      score = Math.max(0, score - 10);
      revealYear(active.sprite, active.ev);
      setHud('힌트: 이 사건은 ' + active.ev.year + '년 (−10점)');
    };
    host.appendChild(hintBtn);

    function syncHearts() {
      for (var i = 0; i < 3; i++) {
        if (i < state.lives) { heartEls[i].classList.remove('lost'); }
        else { heartEls[i].classList.add('lost'); }
      }
    }
    function setHud(msg) {
      hudLine.textContent = '🏆 ' + score + '점 · ' + state.correct + '/' + GOAL + ' 정답 · ';
      hudSub.innerHTML = '<span style="font-size:12px;color:#fcd9a0">총 분류 ' + totalPlaced + '</span>' +
        (msg ? '<br><b style="color:#fff">' + msg + '</b>' : '');
      syncHearts(); updateProg();
    }
    setHud();

    // 콤보 배지 (🔥 xN — 표시 전용)
    var comboEl = null;
    function showCombo(n) {
      if (!comboEl) { comboEl = document.createElement('div'); comboEl.className = 'nmtl-combo'; host.appendChild(comboEl); }
      comboEl.textContent = '🔥 x' + n + ' 콤보';
      comboEl.style.display = 'block';
      comboEl.classList.remove('nmtl-cpop'); void comboEl.offsetWidth; comboEl.classList.add('nmtl-cpop');
    }
    function hideCombo() { if (comboEl) comboEl.style.display = 'none'; }

    // 월드 → 화면 좌표 (DOM 팝업용)
    function toScreen(v) {
      var p = v.clone().project(cam);
      var w = rndr.domElement.clientWidth || W, h = rndr.domElement.clientHeight || H;
      return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h };
    }
    function popText(worldPos, txt) {
      var s = toScreen(worldPos);
      var d = document.createElement('div'); d.className = 'nmtl-pop'; d.textContent = txt;
      d.style.left = s.x + 'px'; d.style.top = s.y + 'px';
      host.appendChild(d); setTimeout(function () { d.remove(); }, 900);
    }

    // 붉은 vignette 플래시
    function redFlash() {
      redVig.style.transition = 'none'; redVig.style.opacity = '0.85';
      void redVig.offsetWidth;
      redVig.style.transition = 'opacity .5s ease'; redVig.style.opacity = '0';
    }
    // 루트 그룹 감쇠 셰이크 (RM 게이트)
    var shakeT = 0;
    function shake() { if (RM) return; shakeT = 0.5; }

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
        if (!RM) active.tK = 1.06; // 잡기 팝
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
      active.tK = 1;
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

    // 스프링 안착 중인 카드들
    var settles = [];
    // 착지한 카드의 연도를 잠깐 보여준 뒤 제거 (오답이든 정답이든 학습의 순간)
    // slot이 있으면 슬롯 중심으로 스프링 트윈 안착 (즉시 텔레포트 금지 · RM이면 바로 정렬)
    function landFeedback(slot) {
      if (!active) return;
      var sprite = active.sprite, ev = active.ev; active = null;
      revealYear(sprite, ev);
      sprite.scale.set(3.4, 1.6, 1); sprite.material.rotation = 0;
      if (slot) {
        if (RM) sprite.position.set(slot.x, SLOT_Y, 0.5);
        else settles.push({ sp: sprite, tx: slot.x, ty: SLOT_Y, vx: 0, vy: 0, life: 0.85 });
      }
      setTimeout(function () { root.remove(sprite); disposeSprite(sprite); }, 850);
    }

    // 카드를 슬롯에 떨어뜨림 → 분류 채점 (판정은 기존 slotAt/drop 그대로)
    function drop(slot) {
      var ev = active.ev;
      var ok = LOGIC.classify(ev.year, slot.era.key);
      totalPlaced++;
      var pos = active.sprite.position.clone();
      if (ok) {
        state.correct++;
        score += 10;
        combo++;
        var mult = Math.pow(1.06, Math.min(combo - 1, 10)); // 콤보마다 차임 피치 상승 (사운드 전용)
        flashSlot(slot, 0xfacc15); coinBurst(pos); popText(pos, '+10');
        if (combo >= 2) showCombo(combo);
        beep(880 * mult, 0.1, 'sine'); setTimeout(function () { beep(1320 * mult, 0.13, 'sine'); }, 80);
        landFeedback(slot);
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
        landFeedback(slot);
        if (!lost) spawn();
      }
    }
    function loseLife(msg) {
      state.lives--; combo = 0; hideCombo();
      bellSad(); shake(); redFlash();
      setHud(msg);
      if (LOGIC.isLose(state)) doLose();
    }
    function removeActive() { if (active) { root.remove(active.sprite); disposeSprite(active.sprite); active = null; } }

    function doWin() {
      won = true; running = false; removeActive();
      setHud('🎉 클리어! ' + GOAL + '개 사건을 올바른 시대로 분류했습니다');
      chime(); confettiRain();
      // 슬롯 3개 순차 골드 웨이브
      slotMeshes.forEach(function (s, i) {
        setTimeout(function () {
          flashSlot(s, 0xfacc15); slotPulse(s);
          burst(new THREE.Vector3(s.x, SLOT_Y, 0.5), 0xfde047);
          coinBurst(new THREE.Vector3(s.x, SLOT_Y + 0.3, 0.5));
        }, i * 180);
      });
      setTimeout(restart, 3600);
    }
    var loseEl = null, loseIv = null;
    function doLose() {
      lost = true; running = false; removeActive();
      setHud('💥 라이프 소진 — 다시 도전!'); beep(110, 0.4, 'sawtooth');
      loseOverlay();
      setTimeout(restart, 2600);
    }
    function loseOverlay() {
      loseEl = document.createElement('div'); loseEl.className = 'nmtl-lose';
      loseEl.innerHTML = '<div>💥 라이프 소진</div><small></small>';
      host.appendChild(loseEl);
      void loseEl.offsetWidth; loseEl.classList.add('on');
      var cnt = 3, sm = loseEl.querySelector('small');
      sm.textContent = '다시 도전까지 ' + cnt;
      loseIv = setInterval(function () {
        cnt--;
        if (cnt <= 0) { clearInterval(loseIv); loseIv = null; sm.textContent = '다시 도전!'; return; }
        sm.textContent = '다시 도전까지 ' + cnt;
      }, 800);
    }
    function restart() {
      if (loseIv) { clearInterval(loseIv); loseIv = null; }
      if (loseEl) { loseEl.remove(); loseEl = null; }
      combo = 0; hideCombo();
      state = { correct: 0, lives: 3, goal: GOAL }; score = 0; totalPlaced = 0; fallSpeed = 1.05;
      won = false; lost = false; running = true; deck = shuffle(LOGIC.EVENTS.slice()); deckIdx = 0;
      setHud('새 게임'); spawn();
    }

    function flashSlot(slot, color) {
      slot.mesh.material.color.setHex(color); slot.mesh.material.opacity = 0.9;
      setTimeout(function () { slot.mesh.material.color.setHex(slot.baseColor); slot.mesh.material.opacity = 0.5; }, 450);
    }
    // 슬롯 스케일 펄스 트윈 (승리 웨이브용)
    var tweens = [];
    function slotPulse(s) { if (RM) return; tweens.push({ t: 0, dur: 0.55, s: s }); }

    // DOM 색종이 (승리 — learngame3d 스타일, RM 게이트)
    function confettiRain() {
      if (RM) return;
      var cols = ['#fde047', '#f59e0b', '#b45309', '#fff7ed', '#dc2626', '#7c3aed'];
      for (var i = 0; i < 40; i++) {
        var c = document.createElement('div'); c.className = 'nmtl-conf';
        c.style.left = (Math.random() * 100) + '%';
        c.style.background = cols[i % cols.length];
        c.style.animationDelay = (Math.random() * 0.35) + 's';
        c.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
        host.appendChild(c);
        (function (el2) { setTimeout(function () { el2.remove(); }, 3000); })(c);
      }
    }

    // 금화 텍스처 (합성 — 외부 에셋 0)
    var coinTex = (function () {
      var cv = document.createElement('canvas'); cv.width = cv.height = 64; var c = cv.getContext('2d');
      var g = c.createRadialGradient(26, 22, 4, 32, 32, 30);
      g.addColorStop(0, '#fff7cf'); g.addColorStop(0.45, '#fcd34d'); g.addColorStop(1, '#b45309');
      c.fillStyle = g; c.beginPath(); c.arc(32, 32, 28, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#8a5a16'; c.lineWidth = 3; c.beginPath(); c.arc(32, 32, 26, 0, Math.PI * 2); c.stroke();
      var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter; return tx;
    })();

    // 파티클 — 풀링 + 상한 (RM 게이트)
    var parts = [], poolPlain = [], poolCoin = [], MAX_PARTS = 90;
    function acquire(coin) {
      var pool = coin ? poolCoin : poolPlain;
      var s = pool.pop();
      if (!s) s = new THREE.Sprite(new THREE.SpriteMaterial(coin ? { map: coinTex, transparent: true, depthTest: false } : { transparent: true, depthTest: false }));
      s.visible = true; s.material.rotation = 0; root.add(s);
      return s;
    }
    function releasePart(p) { p.sp.visible = false; root.remove(p.sp); (p.coin ? poolCoin : poolPlain).push(p.sp); }
    function burst(p, color) {
      if (RM) return;
      for (var i = 0; i < 14; i++) {
        if (parts.length >= MAX_PARTS) break;
        var s = acquire(false);
        s.material.color.setHex(color); s.material.opacity = 1;
        s.position.copy(p); s.scale.set(0.22, 0.22, 1);
        var ang = Math.random() * Math.PI * 2;
        parts.push({ sp: s, coin: false, vx: Math.cos(ang) * 4, vy: Math.sin(ang) * 4 + 1.5, life: 0.7, max: 0.7, g: 8, spin: 0 });
      }
    }
    // 금화 분수 — 위로 솟았다 낙하
    function coinBurst(p) {
      if (RM) return;
      for (var i = 0; i < 12; i++) {
        if (parts.length >= MAX_PARTS) break;
        var s = acquire(true);
        s.material.color.setHex(0xffffff); s.material.opacity = 1;
        s.position.set(p.x, p.y, 0.6);
        var sc = 0.3 + Math.random() * 0.18; s.scale.set(sc, sc, 1);
        parts.push({ sp: s, coin: true, vx: (Math.random() - 0.5) * 3.4, vy: 4.5 + Math.random() * 3.2, life: 1.1, max: 1.1, g: 11, spin: (Math.random() - 0.5) * 6 });
      }
    }

    // 루프 (단일 rAF)
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
      // 카드 juice: 낙하 살랑임(rotation) + 잡기 팝 스케일
      if (active) {
        if (!RM) {
          if (drag) active.sprite.material.rotation += (0 - active.sprite.material.rotation) * Math.min(1, dt * 12);
          else active.sprite.material.rotation = 0.07 * Math.sin(ts / 380 + active.ph);
        }
        active.sK += (active.tK - active.sK) * Math.min(1, dt * 14);
        active.sprite.scale.set(3.4 * active.sK, 1.6 * active.sK, 1);
      }
      // 스프링 안착 트윈
      for (var si = settles.length - 1; si >= 0; si--) {
        var sset = settles[si]; sset.life -= dt;
        sset.vx += ((sset.tx - sset.sp.position.x) * 60 - 9 * sset.vx) * dt;
        sset.vy += ((sset.ty - sset.sp.position.y) * 60 - 9 * sset.vy) * dt;
        sset.sp.position.x += sset.vx * dt; sset.sp.position.y += sset.vy * dt;
        if (sset.life <= 0) settles.splice(si, 1);
      }
      // 슬롯 라벨 미세 펄스
      var pulse = 0.5 + 0.06 * Math.sin(ts / 400);
      if (!drag) slotMeshes.forEach(function (s) { if (s.mesh.material.color.getHex() === s.baseColor) s.mesh.material.opacity = pulse; });
      // 슬롯 웨이브 스케일 트윈
      for (var ti = tweens.length - 1; ti >= 0; ti--) {
        var tw = tweens[ti]; tw.t += dt;
        var k = Math.min(1, tw.t / tw.dur);
        var sc2 = 1 + 0.16 * Math.sin(k * Math.PI);
        tw.s.mesh.scale.set(sc2, sc2, 1); tw.s.edges.scale.set(sc2, sc2, 1);
        if (k >= 1) { tw.s.mesh.scale.set(1, 1, 1); tw.s.edges.scale.set(1, 1, 1); tweens.splice(ti, 1); }
      }
      // 파티클 (풀 반환)
      for (var i = parts.length - 1; i >= 0; i--) {
        var p2 = parts[i]; p2.life -= dt;
        if (p2.life <= 0) { releasePart(p2); parts.splice(i, 1); continue; }
        p2.vy -= p2.g * dt;
        p2.sp.position.x += p2.vx * dt; p2.sp.position.y += p2.vy * dt;
        if (p2.spin) p2.sp.material.rotation += p2.spin * dt;
        p2.sp.material.opacity = Math.max(0, Math.min(1, p2.life / (p2.max * 0.55)));
      }
      // 부유 먼지
      if (dust) {
        var arr = dust.geometry.attributes.position.array;
        for (var di = 0; di < DN; di++) {
          var dv = dustV[di];
          arr[di * 3] += (dv.vx + Math.sin(ts / 1400 + dv.ph) * 0.05) * dt;
          arr[di * 3 + 1] += dv.vy * dt;
          if (arr[di * 3 + 1] > 6.8) { arr[di * 3 + 1] = -5.8; arr[di * 3] = XL + Math.random() * (XR - XL); }
          if (arr[di * 3] > XR + 0.5) arr[di * 3] = XL - 0.5; else if (arr[di * 3] < XL - 0.5) arr[di * 3] = XR + 0.5;
        }
        dust.geometry.attributes.position.needsUpdate = true;
      }
      // 촛불 플리커 (저주파 노이즈 — RM이면 고정 강도 유지)
      if (!RM) {
        var tsec = ts / 1000;
        for (var ci = 0; ci < candles.length; ci++) {
          var cd = candles[ci];
          var n = 0.5 + 0.275 * Math.sin(tsec * 7.3 + cd.p1) + 0.15 * Math.sin(tsec * 13.7 + cd.p2) + 0.075 * Math.sin(tsec * 3.1 + cd.p3);
          cd.light.intensity = 0.45 + 0.7 * n;
          cd.glow.material.opacity = 0.28 + 0.3 * n;
        }
      }
      // 감쇠 셰이크
      if (shakeT > 0) {
        shakeT = Math.max(0, shakeT - dt);
        var amp = (shakeT / 0.5) * 0.22;
        root.position.x = (Math.random() * 2 - 1) * amp;
        root.position.y = (Math.random() * 2 - 1) * amp;
        if (shakeT === 0) { root.position.x = 0; root.position.y = 0; }
      }
      rndr.render(scene, cam);
    }
    spawn();
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // 사운드 (AudioContext lazy — beep 내부에서 생성)
    var actx = null;
    function beep(f, d, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }
    // 낮은 불협 벨 (단2도 비팅 + 저음)
    function bellSad() { beep(196, 0.4, 'triangle'); beep(207, 0.4, 'triangle'); setTimeout(function () { beep(147, 0.5, 'triangle'); }, 90); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
