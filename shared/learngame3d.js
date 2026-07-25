/* 나나메이트 인터랙티브 3D 학습게임 엔진 v5 (data-driven, 7타입 + 게임화 셸)
 * 게임화: 점수·콤보·진행바·파티클·효과음(WebAudio)·별점·최고기록(localStorage)·승리 오버레이·색종이.
 * 챕터 데이터(window.NANAMATE_GAME). 기존 4타입 호환 + 교습형 3타입.
 *
 *  ① sequence : { type, color, prompt, steps:[...] }                 // 정답 순서
 *  ② matching : { type, color, prompt, pairs:[{term,def}] }          // 용어↔설명
 *  ③ grouping : { type, color, prompt, groups:[{name,items}] }       // 분류
 *  ④ oddone   : { type, color, prompt, rounds:[{items,odd,why}] }    // 다른 하나
 *  ⑤ trace    : { type, color, prompt, stages:[{name,why}] }         // 순서+단계 설명(교습)
 *  ⑥ slots    : { type, color, prompt, slots:[{label,answer}], distractors? } // 구조 조립
 *  ⑦ scenario : { type, color, prompt, rounds:[{situation,choices,answer,why}] } // 상황 판단
 * THREE 부재/WebGL 실패에도 DOM만으로 완전 플레이(graceful·a11y).
 */
(function () {
  var RM = false; try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function init() {
    var G = window.NANAMATE_GAME, host = document.getElementById('nm-game-host');
    if (!G || !host) return;
    var type = G.type || 'sequence';
    var ok = type === 'matching' ? (Array.isArray(G.pairs) && G.pairs.length >= 2) :
      type === 'grouping' ? (Array.isArray(G.groups) && G.groups.length >= 2) :
      type === 'oddone' ? (Array.isArray(G.rounds) && G.rounds.length >= 1) :
      type === 'trace' ? (Array.isArray(G.stages) && G.stages.length >= 2) :
      type === 'slots' ? (Array.isArray(G.slots) && G.slots.length >= 2) :
      type === 'scenario' ? (Array.isArray(G.rounds) && G.rounds.length >= 1) :
      (Array.isArray(G.steps) && G.steps.length >= 2);
    if (!ok) return;

    injectStyle();
    var color = G.color || '#6366f1';
    var ctx = { G: G, color: color, colorHex: parseInt(color.replace('#', ''), 16) || 0x6366f1 };
    host.innerHTML = '';
    var wrap = el('div', 'nmg-wrap'); ctx.wrap = wrap;
    ctx.board = buildBoard();
    ctx.prompt = el('p', 'nmg-prompt'); ctx.prompt.textContent = G.prompt || defPrompt(type);
    ctx.canvasBox = el('div', 'nmg-canvas');
    ctx.status = el('div', 'nmg-status'); ctx.status.setAttribute('role', 'status'); ctx.status.setAttribute('aria-live', 'polite');
    ctx.body = el('div', 'nmg-body');
    ctx.resetBtn = el('button', 'nmg-reset'); ctx.resetBtn.type = 'button'; ctx.resetBtn.textContent = '↺ 다시하기';
    [ctx.board.bar, ctx.prompt, ctx.canvasBox, ctx.status, ctx.body, ctx.resetBtn].forEach(function (n) { wrap.appendChild(n); });
    host.appendChild(wrap);
    ctx.shell = makeShell(ctx);

    if (type === 'matching') setupMatching(ctx);
    else if (type === 'grouping') setupGrouping(ctx);
    else if (type === 'oddone') setupOddone(ctx);
    else if (type === 'trace') setupTrace(ctx);
    else if (type === 'slots') setupSlots(ctx);
    else if (type === 'scenario') setupScenario(ctx);
    else setupSequence(ctx);
  }
  function defPrompt(t) {
    return t === 'matching' ? '용어와 설명을 짝지으세요'
      : t === 'grouping' ? '항목을 알맞은 그룹으로 분류하세요'
      : t === 'oddone' ? '어울리지 않는 하나를 고르세요'
      : t === 'trace' ? '과정을 올바른 순서로 따라가며 배우세요'
      : t === 'slots' ? '빈 칸에 알맞은 개념을 넣으세요'
      : t === 'scenario' ? '상황에 맞는 답을 고르세요'
      : '올바른 순서대로 클릭하세요';
  }

  /* ===================== 게임화 셸 ===================== */
  function buildBoard() {
    var bar = el('div', 'nmg-board');
    var score = el('span', 'nmg-score'); score.innerHTML = '🏆 <b>0</b>';
    var combo = el('span', 'nmg-combo');
    var prog = el('div', 'nmg-prog'); var fill = el('div', 'nmg-prog-fill'); prog.appendChild(fill);
    var mute = el('button', 'nmg-mute'); mute.type = 'button'; mute.setAttribute('aria-label', '소리 켜기/끄기');
    bar.appendChild(score); bar.appendChild(combo); bar.appendChild(prog); bar.appendChild(mute);
    return { bar: bar, score: score.querySelector('b'), combo: combo, fill: fill, mute: mute };
  }
  function makeShell(ctx) {
    var b = ctx.board, score = 0, combo = 0, total = 1, muted = load('nmg-muted') === '1';
    var bestKey = 'nmg-best:' + (location && location.pathname || 'x');
    var best = parseInt(load(bestKey) || '0', 10) || 0;
    var actx = null;
    b.mute.textContent = muted ? '🔇' : '🔊';
    b.mute.onclick = function () { muted = !muted; save('nmg-muted', muted ? '1' : '0'); b.mute.textContent = muted ? '🔇' : '🔊'; };
    function beep(freq, dur, kind) {
      if (muted) return;
      try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = kind || 'sine'; o.frequency.value = freq; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.02); } catch (e) {}
    }
    function setScore() { b.score.textContent = score; b.combo.textContent = combo >= 2 ? '🔥 ' + combo + '연속' : ''; }
    function setBar(done) { b.fill.style.width = Math.round(100 * done / total) + '%'; }
    return {
      setTotal: function (n) { total = n || 1; setBar(0); },
      progress: function (done) { setBar(done); },
      good: function (btn, bonus) {
        combo++; var gain = 10 + (combo - 1) * 5 + (bonus || 0); score += gain; setScore();
        floatText(ctx, btn, '+' + gain + (combo >= 2 ? ' ×' + combo : '')); pop(btn); sparkle(ctx, btn);
        beep(560 + Math.min(combo, 8) * 70, 0.09, 'sine');
      },
      bad: function (btn) { combo = 0; setScore(); if (btn) shake(btn); beep(150, 0.16, 'square'); },
      win: function (wrong) {
        var stars = wrong === 0 ? 3 : wrong <= 2 ? 2 : 1, isBest = score > best;
        if (isBest) { best = score; save(bestKey, String(best)); }
        confetti(ctx); winChime(beep);
        overlay(ctx, stars, score, best, isBest);
      },
      reset: function () { score = 0; combo = 0; setScore(); setBar(0); var ov = ctx.wrap.querySelector('.nmg-overlay'); if (ov) ov.remove(); }
    };
  }
  function winChime(beep) { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }

  /* ---------- 이펙트 ---------- */
  function floatText(ctx, btn, txt) {
    var r = rectIn(ctx.wrap, btn); if (!r) return; var f = el('div', 'nmg-float'); f.textContent = txt; f.style.left = r.x + 'px'; f.style.top = r.y + 'px'; f.style.color = ctx.color; ctx.wrap.appendChild(f); setTimeout(function () { f.remove(); }, 900);
  }
  function sparkle(ctx, btn) {
    if (RM) return; var r = rectIn(ctx.wrap, btn); if (!r) return;
    for (var i = 0; i < 7; i++) { var d = el('div', 'nmg-spark'); var a = (i / 7) * Math.PI * 2; d.style.left = r.x + 'px'; d.style.top = r.y + 'px'; d.style.setProperty('--dx', Math.cos(a) * 34 + 'px'); d.style.setProperty('--dy', Math.sin(a) * 34 + 'px'); d.style.background = ctx.color; ctx.wrap.appendChild(d); (function (el2) { setTimeout(function () { el2.remove(); }, 560); })(d); }
  }
  function confetti(ctx) {
    if (RM) return; var cols = [ctx.color, '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#a855f7'];
    for (var i = 0; i < 40; i++) { var c = el('div', 'nmg-confetti'); c.style.left = (Math.random() * 100) + '%'; c.style.background = cols[i % cols.length]; c.style.animationDelay = (Math.random() * 0.3) + 's'; c.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)'; ctx.wrap.appendChild(c); (function (el2) { setTimeout(function () { el2.remove(); }, 2800); })(c); }
  }
  function overlay(ctx, stars, score, best, isBest) {
    var ov = el('div', 'nmg-overlay');
    var star = '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars);
    var card = el('div', 'nmg-ovcard');
    card.innerHTML = '<div class="nmg-stars">' + star + '</div><div class="nmg-ovscore">점수 ' + score + (isBest ? ' <span class="nmg-best">최고기록!</span>' : ' <span class="nmg-bestq">최고 ' + best + '</span>') + '</div>';
    var btn = el('button', 'nmg-again'); btn.type = 'button'; btn.textContent = '🔁 다시 도전'; btn.onclick = function () { ov.remove(); ctx.resetBtn.click(); };
    card.appendChild(btn); ov.appendChild(card); ctx.wrap.appendChild(ov);
  }
  function rectIn(wrap, btn) { try { var w = wrap.getBoundingClientRect(), b = btn.getBoundingClientRect(); return { x: b.left - w.left + b.width / 2, y: b.top - w.top }; } catch (e) { return null; } }
  function pop(b) { if (RM) return; b.classList.remove('nmg-pop'); void b.offsetWidth; b.classList.add('nmg-pop'); }
  function shake(b) { b.classList.add('bad'); setTimeout(function () { b.classList.remove('bad'); }, 440); }

  /* ===================== 게임 타입 ===================== */
  function setupSequence(ctx) {
    var steps = ctx.G.steps.slice(), N = steps.length, v = pathViz(ctx, N), next = 0, wrong = 0;
    ctx.shell.setTotal(N);
    function render() { ctx.body.className = 'nmg-body'; ctx.body.innerHTML = ''; shuffle(steps).forEach(function (t) { var b = chip(t); b.onclick = function () { pick(t, b); }; ctx.body.appendChild(b); }); }
    function pick(t, b) {
      if (b.disabled) return;
      if (t === steps[next]) { b.disabled = true; b.classList.add('ok'); b.textContent = (next + 1) + '. ' + t; ctx.shell.good(b); v.fill(next, t); next++; ctx.shell.progress(next); if (next === N) { setStatus(ctx, '🎉 완성! 순서를 정확히 맞췄어요.', 'done'); ctx.shell.win(wrong); } else setStatus(ctx, '좋아요! 다음 단계는? (' + next + '/' + N + ')'); }
      else { wrong++; ctx.shell.bad(b); setStatus(ctx, '❌ 순서가 아니에요 — 지금까지 ' + next + '/' + N, 'bad'); }
    }
    function reset() { next = 0; wrong = 0; v.clear(); ctx.shell.reset(); ctx.shell.setTotal(N); setStatus(ctx, '아래 용어를 올바른 순서대로 누르세요 (총 ' + N + '단계)'); render(); }
    ctx.resetBtn.onclick = reset; reset();
  }

  function setupMatching(ctx) {
    var pairs = ctx.G.pairs.slice(), N = pairs.length, v = matchViz(ctx, pairs), sel = null, selBtn = null, done = 0, wrong = 0;
    ctx.shell.setTotal(N);
    function render() { ctx.body.className = 'nmg-body nmg-match'; ctx.body.innerHTML = ''; var L = el('div', 'nmg-col'), R = el('div', 'nmg-col'); pairs.forEach(function (p, i) { var t = chip(p.term); t.onclick = function () { pickT(i, t); }; L.appendChild(t); }); shuffle(pairs.map(function (p, i) { return { def: p.def, k: i }; })).forEach(function (d) { var x = chip(d.def); x.classList.add('nmg-def'); x.onclick = function () { pickD(d.k, x); }; R.appendChild(x); }); ctx.body.appendChild(L); ctx.body.appendChild(R); }
    function pickT(k, b) { if (b.disabled) return; if (selBtn) selBtn.classList.remove('sel'); sel = k; selBtn = b; b.classList.add('sel'); setStatus(ctx, '"' + pairs[k].term + '"에 맞는 설명을 고르세요'); }
    function pickD(k, b) {
      if (b.disabled) return; if (sel === null) { setStatus(ctx, '먼저 왼쪽에서 용어를 고르세요'); return; }
      if (k === sel) { b.disabled = true; b.classList.add('ok'); if (selBtn) { selBtn.disabled = true; selBtn.classList.remove('sel'); selBtn.classList.add('ok'); } ctx.shell.good(b); v.link(k); done++; ctx.shell.progress(done); if (done === N) { setStatus(ctx, '🎉 완성! 모든 짝을 맞췄어요.', 'done'); ctx.shell.win(wrong); } else setStatus(ctx, '좋아요! (' + done + '/' + N + ') 다음 용어를 고르세요'); sel = null; selBtn = null; }
      else { wrong++; var sb = selBtn; ctx.shell.bad(b); if (sb) sb.classList.add('bad'); setStatus(ctx, '❌ 짝이 아니에요 — 다시', 'bad'); setTimeout(function () { if (sb) sb.classList.remove('bad', 'sel'); }, 460); sel = null; selBtn = null; }
    }
    function reset() { sel = null; selBtn = null; done = 0; wrong = 0; v.clear(); ctx.shell.reset(); ctx.shell.setTotal(N); setStatus(ctx, '왼쪽 용어를 누른 뒤 오른쪽에서 맞는 설명을 고르세요 (총 ' + N + '쌍)'); render(); }
    ctx.resetBtn.onclick = reset; reset();
  }

  function setupGrouping(ctx) {
    var groups = ctx.G.groups.slice(), total = 0, placed = 0, sel = null, selBtn = null, wrong = 0, itemOf = {};
    groups.forEach(function (g, gi) { (g.items || []).forEach(function (it) { itemOf[it] = gi; total++; }); });
    var v = bucketViz(ctx, groups);
    ctx.shell.setTotal(total);
    function render() {
      ctx.body.className = 'nmg-body nmg-group'; ctx.body.innerHTML = '';
      var pool = el('div', 'nmg-pool'), all = []; groups.forEach(function (g) { (g.items || []).forEach(function (it) { all.push(it); }); });
      shuffle(all).forEach(function (it) { var b = chip(it); b.onclick = function () { pickItem(it, b); }; pool.appendChild(b); });
      ctx.body.appendChild(pool);
      var row = el('div', 'nmg-buckets'); groups.forEach(function (g, gi) { var bk = el('button', 'nmg-bucket'); bk.type = 'button'; var nm = el('span', 'nmg-bk-name'); nm.textContent = g.name; bk.appendChild(nm); bk.onclick = function () { dropTo(gi, bk); }; row.appendChild(bk); }); ctx.body.appendChild(row);
    }
    function pickItem(it, b) { if (b.disabled) return; if (selBtn) selBtn.classList.remove('sel'); sel = it; selBtn = b; b.classList.add('sel'); setStatus(ctx, '"' + it + '" → 어느 그룹? 아래 버킷을 누르세요'); }
    function dropTo(gi, bk) {
      if (sel === null) { setStatus(ctx, '먼저 위에서 항목을 고르세요'); return; }
      if (itemOf[sel] === gi) { selBtn.disabled = true; selBtn.classList.remove('sel'); selBtn.classList.add('ok'); ctx.shell.good(selBtn); var tag = el('span', 'nmg-placed'); tag.textContent = sel; bk.appendChild(tag); v.drop(gi); placed++; ctx.shell.progress(placed); if (placed === total) { setStatus(ctx, '🎉 완성! 모두 올바르게 분류했어요.', 'done'); ctx.shell.win(wrong); } else setStatus(ctx, '좋아요! (' + placed + '/' + total + ')'); sel = null; selBtn = null; }
      else { wrong++; var sb = selBtn; ctx.shell.bad(bk); if (sb) sb.classList.remove('sel'); setStatus(ctx, '❌ 그 그룹이 아니에요 — 다시', 'bad'); sel = null; selBtn = null; }
    }
    function reset() { placed = 0; sel = null; selBtn = null; wrong = 0; v.clear(); ctx.shell.reset(); ctx.shell.setTotal(total); setStatus(ctx, '위 항목을 누르고 알맞은 그룹 버킷을 누르세요 (총 ' + total + '개)'); render(); }
    ctx.resetBtn.onclick = reset; reset();
  }

  function setupOddone(ctx) {
    var rounds = ctx.G.rounds.slice(), R = rounds.length, ri = 0, wrong = 0, v = ringViz(ctx);
    ctx.shell.setTotal(R);
    function render() { ctx.body.className = 'nmg-body'; ctx.body.innerHTML = ''; var r = rounds[ri]; v.show(r.items.length); r.items.forEach(function (it, i) { var b = chip(it); b.onclick = function () { pick(i, b); }; ctx.body.appendChild(b); }); }
    function pick(i, b) {
      if (b.disabled) return; var r = rounds[ri];
      if (i === r.odd) { b.classList.add('ok'); ctx.shell.good(b); v.mark(i); [].forEach.call(ctx.body.children, function (c) { c.disabled = true; }); var msg = '✅ 정답!' + (r.why ? ' ' + r.why : ''); ri++; ctx.shell.progress(ri); if (ri === R) { setStatus(ctx, '🎉 완성! ' + msg, 'done'); ctx.shell.win(wrong); } else { setStatus(ctx, msg + ' — 다음 문제로', 'done'); setTimeout(render, 950); } }
      else { wrong++; ctx.shell.bad(b); setStatus(ctx, '❌ 이건 어울려요 — 다른 걸 찾아보세요', 'bad'); }
    }
    function reset() { ri = 0; wrong = 0; ctx.shell.reset(); ctx.shell.setTotal(R); setStatus(ctx, '보기 중 어울리지 않는 하나를 고르세요 (' + R + '문제)'); render(); }
    ctx.resetBtn.onclick = reset; reset();
  }

  /* ---------- ⑤ trace: 순서 + 단계별 why 교습 ---------- */
  function setupTrace(ctx) {
    var stages = ctx.G.stages.slice(), N = stages.length;
    var v = pathViz(ctx, N), next = 0, wrong = 0, order = [], cardBy = {};
    ctx.shell.setTotal(N);
    function render() {
      ctx.body.className = 'nmg-body nmg-trace'; ctx.body.innerHTML = '';
      cardBy = {};
      var modebar = el('div', 'nmg-modebar');
      var kicker = el('span', 'nmg-kicker'); kicker.textContent = '⚡ 타임라인 복구';
      var hint = el('button', 'nmg-hint'); hint.type = 'button'; hint.textContent = '💡 힌트';
      hint.onclick = function () {
        wrong++; ctx.shell.bad(hint);
        setStatus(ctx, '힌트: 다음 단계는 “' + stages[next].name.charAt(0) + '”로 시작해요.', 'done');
      };
      modebar.appendChild(kicker); if (next < N) modebar.appendChild(hint); ctx.body.appendChild(modebar);

      var trail = el('div', 'nmg-trail');
      stages.forEach(function (s, i) {
        var slot = el('button', 'nmg-trail-slot'); slot.type = 'button';
        slot.setAttribute('aria-label', (i + 1) + '번 타임라인 슬롯');
        var no = el('span', 'nmg-stepno'); no.textContent = i < next ? '✓' : String(i + 1); slot.appendChild(no);
        if (i < next) {
          slot.classList.add('done');
          var nm = el('span', 'nmg-stepname'); nm.textContent = s.name; slot.appendChild(nm);
          if (s.why) { var wy = el('span', 'nmg-stepwhy'); wy.textContent = s.why; slot.appendChild(wy); }
        } else {
          var empty = el('span', 'nmg-stepempty'); empty.textContent = i === next ? '여기로 드래그' : '잠김'; slot.appendChild(empty);
          if (i === next) slot.classList.add('active'); else slot.disabled = true;
        }
        if (i === next) {
          slot.ondragover = function (e) { e.preventDefault(); slot.classList.add('over'); };
          slot.ondragleave = function () { slot.classList.remove('over'); };
          slot.ondrop = function (e) {
            e.preventDefault(); slot.classList.remove('over');
            var k = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (!isNaN(k)) attempt(k, cardBy[k], slot);
          };
        }
        trail.appendChild(slot);
      });
      ctx.body.appendChild(trail);

      var label = el('div', 'nmg-deck-label'); label.textContent = '단계 카드 · 끌어 놓거나 클릭하세요'; ctx.body.appendChild(label);
      var deck = el('div', 'nmg-deck');
      order.forEach(function (k) {
        if (k < next) return;
        var b = chip(stages[k].name); b.classList.add('nmg-card'); b.draggable = true; b.dataset.card = String(k);
        b.onclick = function () { attempt(k, b, ctx.body.querySelector('.nmg-trail-slot.active')); };
        b.ondragstart = function (e) { e.dataTransfer.setData('text/plain', String(k)); e.dataTransfer.effectAllowed = 'move'; b.classList.add('dragging'); };
        b.ondragend = function () { b.classList.remove('dragging'); };
        cardBy[k] = b; deck.appendChild(b);
      });
      ctx.body.appendChild(deck);
    }
    function attempt(k, b, slot) {
      if (!b || k < next || next >= N) return;
      if (k === next) {
        ctx.shell.good(b); v.fill(next, stages[k].name);
        var why = stages[k].why || '';
        next++; ctx.shell.progress(next);
        render();
        if (next === N) {
          setStatus(ctx, '🎉 타임라인 복구 완료! 모든 단계가 연결됐어요.', 'done'); ctx.shell.win(wrong);
        } else {
          v.focus(next);
          setStatus(ctx, '✅ 연결 성공! ' + (why || '다음 단계로 이동하세요.'), 'done');
        }
      } else {
        wrong++; ctx.shell.bad(b); v.miss(next);
        if (slot) { slot.classList.add('bad'); setTimeout(function () { slot.classList.remove('bad'); }, 460); }
        setStatus(ctx, '❌ 시간축이 맞지 않아요. ' + (next + 1) + '번째 단계를 다시 찾아보세요.', 'bad');
      }
    }
    function reset() {
      next = 0; wrong = 0; order = shuffle(stages.map(function (_, i) { return i; })); v.clear(); v.focus(0);
      ctx.shell.reset(); ctx.shell.setTotal(N);
      setStatus(ctx, '흩어진 단계 카드를 빛나는 타임라인 슬롯에 순서대로 연결하세요.');
      render();
    }
    ctx.resetBtn.onclick = reset; reset();
  }

  /* ---------- ⑥ slots: 구조 조립 (라벨 슬롯 ← 용어) ---------- */
  function setupSlots(ctx) {
    var slots = ctx.G.slots.slice(), N = slots.length;
    var terms = slots.map(function (s, i) { return { id: 'a' + i, text: s.answer }; });
    (Array.isArray(ctx.G.distractors) ? ctx.G.distractors : []).forEach(function (d, i) { terms.push({ id: 'd' + i, text: d }); });
    var filled = {}, used = {}, done = 0, wrong = 0, sel = null, selBtn = null, poolOrder = [], termBy = {};
    var v = matchViz(ctx, slots.map(function (s) { return { term: s.label, def: s.answer }; }));
    ctx.shell.setTotal(N);
    function render() {
      ctx.body.className = 'nmg-body nmg-slots'; ctx.body.innerHTML = '';
      termBy = {};
      var modebar = el('div', 'nmg-modebar');
      var kicker = el('span', 'nmg-kicker'); kicker.textContent = '🧩 코어 조립 ' + done + '/' + N;
      var hint = el('button', 'nmg-hint'); hint.type = 'button'; hint.textContent = '💡 스캔';
      hint.onclick = function () {
        var i = 0; while (i < N && filled[i]) i++;
        if (i < N) { wrong++; ctx.shell.bad(hint); v.focus(i); setStatus(ctx, '스캔 결과: “' + slots[i].answer.charAt(0) + '”로 시작하는 코어가 ' + slots[i].label + ' 슬롯과 반응합니다.', 'done'); }
      };
      modebar.appendChild(kicker); if (done < N) modebar.appendChild(hint); ctx.body.appendChild(modebar);
      var row = el('div', 'nmg-slot-row');
      slots.forEach(function (s, i) {
        var sk = el('button', 'nmg-slot'); sk.type = 'button';
        var lb = el('span', 'nmg-slot-label'); lb.textContent = s.label; sk.appendChild(lb);
        var val = el('span', 'nmg-slot-val');
        if (filled[i]) { val.textContent = filled[i].text; sk.classList.add('ok'); sk.disabled = true; }
        else { val.textContent = '코어를 장착하세요'; sk.classList.add('empty'); }
        sk.appendChild(val);
        sk.onclick = function () { dropTo(i, sk); };
        if (!filled[i]) {
          sk.ondragover = function (e) { e.preventDefault(); sk.classList.add('over'); };
          sk.ondragleave = function () { sk.classList.remove('over'); };
          sk.ondrop = function (e) {
            e.preventDefault(); sk.classList.remove('over');
            var id = e.dataTransfer.getData('text/plain');
            if (termBy[id]) { selectTerm(termBy[id], termBy[id].button); dropTo(i, sk); }
          };
        }
        row.appendChild(sk);
      });
      ctx.body.appendChild(row);
      var label = el('div', 'nmg-deck-label'); label.textContent = '개념 코어 · 슬롯으로 끌어 놓거나 선택 후 슬롯을 누르세요'; ctx.body.appendChild(label);
      var pool = el('div', 'nmg-deck');
      poolOrder.forEach(function (id) {
        if (used[id]) return;
        var t = terms.filter(function (x) { return x.id === id; })[0];
        var b = chip(t.text); b.classList.add('nmg-card', 'nmg-core'); b.draggable = true;
        t.button = b; termBy[id] = t;
        b.onclick = function () { selectTerm(t, b); };
        b.ondragstart = function (e) { selectTerm(t, b); e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; b.classList.add('dragging'); };
        b.ondragend = function () { b.classList.remove('dragging'); };
        pool.appendChild(b);
      });
      ctx.body.appendChild(pool);
    }
    function selectTerm(t, b) {
      if (b.disabled) return;
      if (selBtn) selBtn.classList.remove('sel');
      sel = t; selBtn = b; b.classList.add('sel');
      setStatus(ctx, '“' + t.text + '” 코어 선택 — 맞는 슬롯에 장착하세요.');
    }
    function dropTo(i, sk) {
      if (filled[i]) return;
      if (sel === null) { setStatus(ctx, '먼저 아래에서 개념 코어를 선택하거나 끌어오세요.'); return; }
      if (sel.text === slots[i].answer) {
        filled[i] = sel; used[sel.id] = true; done++; ctx.shell.good(selBtn || sk); v.link(i);
        sel = null; selBtn = null; ctx.shell.progress(done); render();
        if (done === N) { setStatus(ctx, '🎉 시스템 온라인! 모든 개념 코어가 정상 작동합니다.', 'done'); ctx.shell.win(wrong); }
        else setStatus(ctx, '✅ 코어 장착 성공! 남은 슬롯 ' + (N - done) + '개.', 'done');
      } else {
        wrong++; ctx.shell.bad(sk); v.miss(i); if (selBtn) selBtn.classList.add('bad');
        setStatus(ctx, '❌ 호환되지 않는 코어예요. “' + slots[i].label + '”의 역할을 다시 생각해 보세요.', 'bad');
        var sb = selBtn;
        setTimeout(function () { if (sb) sb.classList.remove('bad', 'sel'); }, 460);
        sel = null; selBtn = null;
      }
    }
    function reset() {
      filled = {}; used = {}; done = 0; wrong = 0; sel = null; selBtn = null;
      poolOrder = shuffle(terms.map(function (t) { return t.id; })); v.clear();
      ctx.shell.reset(); ctx.shell.setTotal(N);
      setStatus(ctx, '개념 코어를 알맞은 슬롯에 장착해 학습 시스템을 가동하세요.');
      render();
    }
    ctx.resetBtn.onclick = reset; reset();
  }

  /* ---------- ⑦ scenario: 상황 판단 + why ---------- */
  function setupScenario(ctx) {
    var rounds = ctx.G.rounds.slice(), R = rounds.length, ri = 0, wrong = 0, v = ringViz(ctx);
    var timer = null, timeLeft = 100, lives = 3, locked = false, run = 0, choiceBtns = [];
    ctx.shell.setTotal(R);
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function heartsText() { return '쉴드 ' + Array(lives + 1).join('♥') + Array(4 - lives).join('♡'); }
    function render() {
      stopTimer(); locked = false; choiceBtns = []; var myRun = ++run;
      ctx.body.className = 'nmg-body nmg-scenario'; ctx.body.innerHTML = '';
      var r = rounds[ri];
      var modebar = el('div', 'nmg-round-hud');
      var round = el('span', 'nmg-kicker'); round.textContent = '🎯 미션 ' + (ri + 1) + '/' + R;
      var hearts = el('span', 'nmg-hearts'); hearts.textContent = heartsText();
      modebar.appendChild(round); modebar.appendChild(hearts); ctx.body.appendChild(modebar);
      var sit = el('div', 'nmg-situation');
      sit.textContent = '📌 ' + r.situation;
      ctx.body.appendChild(sit);
      var time = el('div', 'nmg-timer'); time.setAttribute('aria-label', '남은 시간 보너스');
      var timeFill = el('div', 'nmg-timer-fill'); time.appendChild(timeFill); ctx.body.appendChild(time);
      var pool = el('div', 'nmg-choice-grid');
      v.show(r.choices.length);
      r.choices.forEach(function (c, i) {
        var b = chip(c); b.classList.add('nmg-choice');
        var key = el('span', 'nmg-key'); key.textContent = String(i + 1); b.insertBefore(key, b.firstChild);
        b.setAttribute('aria-keyshortcuts', String(i + 1));
        b.onclick = function () { pick(i, b, hearts); }; choiceBtns.push(b); pool.appendChild(b);
      });
      ctx.body.appendChild(pool);
      timeLeft = RM ? 0 : 100;
      if (RM) time.style.display = 'none';
      else timer = setInterval(function () {
        if (myRun !== run || locked) { stopTimer(); return; }
        timeLeft = Math.max(0, timeLeft - 1.6);
        timeFill.style.width = timeLeft + '%';
        if (timeLeft < 28) time.classList.add('danger');
        if (timeLeft === 0) stopTimer();
      }, 250);
    }
    function pick(i, b, hearts) {
      if (locked || b.disabled) return;
      var r = rounds[ri];
      if (i === r.answer) {
        locked = true; stopTimer(); b.classList.add('ok'); ctx.shell.good(b, Math.ceil(timeLeft / 10)); v.mark(i);
        choiceBtns.forEach(function (c) { c.disabled = true; if (c !== b) c.classList.add('muted'); });
        var msg = '✅ 정답!' + (r.why ? ' ' + r.why : '');
        var reveal = el('div', 'nmg-reveal'); reveal.textContent = msg; ctx.body.appendChild(reveal);
        lives = Math.min(3, lives + 1);
        hearts.textContent = heartsText();
        ri++; ctx.shell.progress(ri);
        if (ri === R) { setStatus(ctx, '🎉 완성! ' + msg, 'done'); ctx.shell.win(wrong); }
        else {
          setStatus(ctx, '미션 성공 — 다음 상황으로 이동합니다.', 'done');
          var myRun = run; setTimeout(function () { if (myRun === run) render(); }, 1450);
        }
      } else {
        wrong++; lives = Math.max(0, lives - 1); b.disabled = true; b.classList.add('bad'); ctx.shell.bad(b); v.miss(i);
        hearts.textContent = heartsText();
        setStatus(ctx, lives ? '❌ 쉴드 손상! 다른 전략을 선택하세요.' : '💥 쉴드 소진! 남은 선택지에서 핵심 단서를 찾아보세요.', 'bad');
      }
    }
    function reset() {
      stopTimer(); run++; ri = 0; wrong = 0; lives = 3; locked = false; ctx.shell.reset(); ctx.shell.setTotal(R);
      setStatus(ctx, '상황을 분석하고 최선의 전략을 선택하세요. 숫자 키 1~9도 사용할 수 있어요.');
      render();
    }
    ctx.wrap.onkeydown = function (e) {
      var i = parseInt(e.key, 10) - 1;
      if (i >= 0 && i < choiceBtns.length && !choiceBtns[i].disabled) { e.preventDefault(); choiceBtns[i].click(); }
    };
    ctx.resetBtn.onclick = reset; reset();
  }

  /* ===================== 공용 ===================== */
  function chip(txt) { var b = el('button', 'nmg-chip'); b.type = 'button'; b.textContent = txt; return b; }
  function setStatus(ctx, txt, cls) { ctx.status.textContent = txt; ctx.status.className = 'nmg-status' + (cls ? ' ' + cls : ''); }
  function load(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- 3D ---------- */
  function pathViz(ctx, N) {
    var base = baseScene(ctx), slots = [], labels = [], pulse = null;
    if (base) { var span = Math.min(2.2, 8 / N), x0 = -(N - 1) * span / 2; for (var i = 0; i < N; i++) { var n = ballm(0.42, 0xd1d5db); n.position.set(x0 + i * span, 0, 0); base.scene.add(n); slots.push({ m: n, x: x0 + i * span }); if (i < N - 1) { var lk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, span, 6), new THREE.MeshBasicMaterial({ color: 0xe5e7eb })); lk.rotation.z = Math.PI / 2; lk.position.set(x0 + i * span + span / 2, 0, 0); base.scene.add(lk); } } pulse = ballm(0.16, 0xfde047); pulse.visible = false; base.scene.add(pulse); base.tick(function () { if (pulse.visible) pulse.material.color.setHSL(0.13, 1, 0.5 + 0.2 * Math.sin(base.T() * 6)); }); }
    return {
      fill: function (i, t) { if (!base) return; slots[i].m.material.color.setHex(ctx.colorHex); var sp = labelSprite(t, ctx.color); sp.position.set(slots[i].x, 0.85, 0); base.scene.add(sp); labels.push(sp); pulse.visible = true; pulse.position.set(slots[i].x, 0, 0); },
      focus: function (i) { if (!base || !slots[i]) return; pulse.visible = true; pulse.position.set(slots[i].x, 0, 0); },
      miss: function (i) { if (!base || !slots[i]) return; var m = slots[i].m, old = m.material.color.getHex(); m.material.color.setHex(0xef4444); setTimeout(function () { m.material.color.setHex(old); }, 420); },
      clear: function () { if (!base) return; slots.forEach(function (s) { s.m.material.color.setHex(0xd1d5db); }); labels.forEach(function (s) { base.scene.remove(s); }); labels = []; pulse.visible = false; }
    };
  }
  function matchViz(ctx, pairs) {
    var base = baseScene(ctx), N = pairs.length, L = [], Rn = [], lines = [];
    if (base) { var gap = Math.min(1.4, 5 / N), y0 = (N - 1) * gap / 2; for (var i = 0; i < N; i++) { var l = ballm(0.26, 0xc7d2fe); l.position.set(-3, y0 - i * gap, 0); base.scene.add(l); L.push(l); var r = ballm(0.26, 0xe5e7eb); r.position.set(3, y0 - i * gap, 0); base.scene.add(r); Rn.push(r); } base.tick(function () { for (var j = 0; j < lines.length; j++) lines[j].material.opacity = 0.55 + 0.35 * Math.sin(base.T() * 3 + j); }); }
    return {
      link: function (k) { if (!base) return; L[k].material.color.setHex(ctx.colorHex); Rn[k].material.color.setHex(ctx.colorHex); var g = new THREE.BufferGeometry().setFromPoints([L[k].position.clone(), Rn[k].position.clone()]); var ln = new THREE.Line(g, new THREE.LineBasicMaterial({ color: ctx.colorHex, transparent: true, opacity: 0.7 })); base.scene.add(ln); lines.push(ln); },
      focus: function (k) { if (!base || !Rn[k]) return; Rn[k].scale.set(1.55, 1.55, 1.55); setTimeout(function () { Rn[k].scale.set(1, 1, 1); }, 700); },
      miss: function (k) { if (!base || !Rn[k]) return; var old = Rn[k].material.color.getHex(); Rn[k].material.color.setHex(0xef4444); setTimeout(function () { Rn[k].material.color.setHex(old); }, 420); },
      clear: function () { if (!base) return; L.forEach(function (m) { m.material.color.setHex(0xc7d2fe); }); Rn.forEach(function (m) { m.material.color.setHex(0xe5e7eb); m.scale.set(1, 1, 1); }); lines.forEach(function (l) { base.scene.remove(l); }); lines = []; }
    };
  }
  function bucketViz(ctx, groups) {
    var base = baseScene(ctx), G = groups.length, plat = [], cubes = [];
    if (base) { var span = Math.min(3, 8 / G), x0 = -(G - 1) * span / 2; for (var i = 0; i < G; i++) { var p = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.6), new THREE.MeshBasicMaterial({ color: 0xe5e7eb })); p.position.set(x0 + i * span, -1.2, 0); base.scene.add(p); plat.push({ m: p, x: x0 + i * span, c: 0 }); } base.tick(function () { for (var j = 0; j < cubes.length; j++) cubes[j].rotation.y += 0.02; }); }
    return { drop: function (gi) { if (!base) return; var pl = plat[gi]; pl.m.material.color.setHex(ctx.colorHex); var cu = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshBasicMaterial({ color: ctx.colorHex })); cu.position.set(pl.x + (pl.c % 3 - 1) * 0.45, -0.9 + Math.floor(pl.c / 3) * 0.45, 0); pl.c++; base.scene.add(cu); cubes.push(cu); }, clear: function () { if (!base) return; plat.forEach(function (p) { p.m.material.color.setHex(0xe5e7eb); p.c = 0; }); cubes.forEach(function (c) { base.scene.remove(c); }); cubes = []; } };
  }
  function ringViz(ctx) {
    var base = baseScene(ctx), nodes = [];
    function build(n) { if (!base) return; nodes.forEach(function (m) { base.scene.remove(m); }); nodes = []; for (var i = 0; i < n; i++) { var a = (i / n) * Math.PI * 2; var m = ballm(0.5, 0xc7d2fe); m.position.set(Math.cos(a) * 2.4, Math.sin(a) * 1.6, 0); m.userData.y = m.position.y; m.userData.phase = i; base.scene.add(m); nodes.push(m); } }
    if (base) base.tick(function () { nodes.forEach(function (m) { m.position.y = m.userData.y + Math.sin(base.T() * 2.4 + m.userData.phase) * 0.08; m.rotation.y += 0.012; }); });
    return {
      show: function (n) { build(n); },
      mark: function (i) { if (base && nodes[i]) { nodes[i].material.color.setHex(ctx.colorHex); nodes[i].scale.set(1.45, 1.45, 1.45); } },
      miss: function (i) { if (!base || !nodes[i]) return; var m = nodes[i], old = m.material.color.getHex(); m.material.color.setHex(0xef4444); setTimeout(function () { m.material.color.setHex(old); }, 420); }
    };
  }
  function ballm(r, c) { return new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), new THREE.MeshBasicMaterial({ color: c })); }
  function baseScene(ctx) {
    if (typeof THREE === 'undefined') return null;
    try {
      var w = ctx.canvasBox.clientWidth || 600, h = 190, scene = new THREE.Scene();
      var cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 100); cam.position.set(0, 0, 9); cam.lookAt(0, 0, 0);
      var rn = new THREE.WebGLRenderer({ antialias: true, alpha: true }); rn.setSize(w, h); rn.setPixelRatio(Math.min(window.devicePixelRatio, 2)); ctx.canvasBox.appendChild(rn.domElement);
      var T = 0, cbs = [];
      (function loop() { requestAnimationFrame(loop); T += 0.016; for (var i = 0; i < cbs.length; i++) cbs[i](); rn.render(scene, cam); })();
      window.addEventListener('resize', function () { var ww = ctx.canvasBox.clientWidth || 600; cam.aspect = ww / h; cam.updateProjectionMatrix(); rn.setSize(ww, h); });
      return { scene: scene, tick: function (cb) { cbs.push(cb); }, T: function () { return T; } };
    } catch (e) { return null; }
  }
  function labelSprite(txt, color) {
    var fs = 22, cv = document.createElement('canvas'), x = cv.getContext('2d'), font = '700 ' + fs + 'px "Noto Sans KR",sans-serif'; x.font = font;
    cv.width = Math.ceil(x.measureText(txt).width) + 16; cv.height = fs + 10; x = cv.getContext('2d'); x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color; x.fillText(txt, cv.width / 2, cv.height / 2);
    var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter; var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); sp.scale.set(cv.width * 0.0055, cv.height * 0.0055, 1); return sp;
  }

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function injectStyle() {
    if (document.getElementById('nmg-style')) return;
    var st = document.createElement('style'); st.id = 'nmg-style';
    st.textContent = [
      '.nmg-wrap{position:relative;overflow:hidden;border:1px solid color-mix(in srgb,var(--border,#e5e7eb) 72%,#6366f1);border-radius:18px;padding:16px;background:linear-gradient(145deg,color-mix(in srgb,var(--card,#fff) 94%,#eef2ff),var(--card,#fff));box-shadow:0 16px 45px rgba(30,41,59,.10);margin:8px 0}',
      '.nmg-board{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
      '.nmg-score{font-weight:800;font-size:15px;color:var(--text,#1f2430)}',
      '.nmg-combo{font-weight:800;font-size:13px;color:#f59e0b;min-width:62px}',
      '.nmg-prog{flex:1;height:8px;border-radius:99px;background:var(--border,#e5e7eb);overflow:hidden}',
      '.nmg-prog-fill{height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#6366f1,#22c55e);transition:width .3s ease}',
      '.nmg-wrap .nmg-mute{border:none!important;background:transparent!important;color:var(--text,#1f2430)!important;font-size:17px;cursor:pointer;line-height:1}',
      '.nmg-prompt{margin:0 0 10px;font-weight:700;color:var(--text,#1f2430)}',
      '.nmg-canvas{width:100%;height:190px;border:1px solid rgba(99,102,241,.14);border-radius:14px;overflow:hidden;background:radial-gradient(circle at 50% 42%,rgba(99,102,241,.16),transparent 42%),linear-gradient(180deg,rgba(15,23,42,.035),rgba(99,102,241,.07));box-shadow:inset 0 0 35px rgba(99,102,241,.08)}',
      '.nmg-status{min-height:22px;margin:10px 0;font-size:14px;font-weight:600;color:var(--muted,#6b7280)}',
      '.nmg-status.done{color:#15803d}.nmg-status.bad{color:#dc2626}',
      '.nmg-body{display:flex;flex-wrap:wrap;gap:8px}',
      '.nmg-body.nmg-match{gap:16px}.nmg-body.nmg-group{flex-direction:column;gap:14px}',
      '.nmg-body.nmg-trace,.nmg-body.nmg-slots,.nmg-body.nmg-scenario{flex-direction:column;gap:12px;width:100%}',
      '.nmg-modebar,.nmg-round-hud{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%}',
      '.nmg-kicker{font-weight:900;font-size:12px;letter-spacing:.04em;color:#4f46e5;text-transform:uppercase}',
      '.nmg-wrap .nmg-hint{border:1px solid #c7d2fe!important;border-radius:999px;background:#eef2ff!important;color:#4338ca!important;padding:6px 10px;font-size:12px;font-weight:800;cursor:pointer}',
      '.nmg-trail{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;width:100%}',
      '.nmg-wrap .nmg-trail-slot{position:relative;min-height:88px;border:1px solid var(--border,#d1d5db)!important;border-radius:13px;background:#fff!important;padding:10px;text-align:left;display:flex;flex-direction:column;gap:5px;color:var(--text,#1f2430)!important;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}',
      '.nmg-wrap .nmg-trail-slot.active{border:2px dashed #6366f1!important;background:#eef2ff!important;box-shadow:0 0 0 4px rgba(99,102,241,.10),0 8px 24px rgba(99,102,241,.14);cursor:pointer;animation:nmg-pulse 1.7s ease-in-out infinite}',
      '.nmg-wrap .nmg-trail-slot.over,.nmg-wrap .nmg-slot.over{transform:translateY(-3px) scale(1.015);border-color:#22c55e!important;background:#ecfdf5!important;box-shadow:0 10px 25px rgba(34,197,94,.18)}',
      '.nmg-wrap .nmg-trail-slot.done{border-color:#86efac!important;background:#f0fdf4!important}',
      '.nmg-wrap .nmg-trail-slot.bad{border-color:#ef4444!important;background:#fef2f2!important;animation:nmg-shake .4s}',
      '.nmg-stepno{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#e0e7ff;color:#4338ca;font-weight:900;font-size:12px}',
      '.nmg-trail-slot.done .nmg-stepno{background:#22c55e;color:#fff}',
      '.nmg-stepname{font-size:12px;font-weight:900;line-height:1.35}.nmg-stepwhy{font-size:11px;color:var(--muted,#64748b);line-height:1.38}',
      '.nmg-stepempty{font-size:12px;font-weight:800;color:#6366f1;margin:auto 0}.nmg-trail-slot:disabled .nmg-stepempty{color:var(--muted,#94a3b8)}',
      '.nmg-deck-label{font-size:11px;font-weight:800;color:var(--muted,#64748b);letter-spacing:.03em}',
      '.nmg-deck{display:flex;flex-wrap:wrap;gap:9px;padding:12px;border:1px solid var(--border,#e2e8f0);border-radius:14px;background:rgba(148,163,184,.08);min-height:54px}',
      '.nmg-slot-row{display:flex;flex-wrap:wrap;gap:10px;width:100%}',
      '.nmg-wrap .nmg-slot{flex:1;min-width:140px;min-height:84px;border:2px dashed var(--border,#cbd5e1)!important;border-radius:13px;background:#fff!important;color:var(--text,#1f2430)!important;padding:11px;cursor:pointer;display:flex;flex-direction:column;gap:7px;align-items:flex-start;text-align:left;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}',
      '.nmg-wrap .nmg-slot:hover{border-color:#818cf8!important}.nmg-slot.empty .nmg-slot-val{color:var(--muted,#9ca3af);font-weight:600}',
      '.nmg-wrap .nmg-slot.ok{border-style:solid!important;border-color:#22c55e!important;background:#dcfce7!important;cursor:default;box-shadow:0 7px 18px rgba(34,197,94,.12)}',
      '.nmg-wrap .nmg-slot.bad{border-color:#fca5a5!important;background:#fef2f2!important;animation:nmg-shake .4s}',
      '.nmg-slot-label{font-weight:800;font-size:12px;color:var(--muted,#6b7280)}',
      '.nmg-slot-val{font-weight:800;font-size:14px;color:var(--text,#1f2430)}',
      '.nmg-hearts{font-size:13px;font-weight:900;color:#e11d48;letter-spacing:.05em}',
      '.nmg-situation{box-sizing:border-box;width:100%;font-weight:800;font-size:15px;line-height:1.55;color:var(--text,#1f2430);background:linear-gradient(135deg,#eef2ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:14px;padding:15px 16px;box-shadow:0 7px 20px rgba(99,102,241,.08)}',
      '.nmg-timer{width:100%;height:6px;border-radius:99px;background:#e2e8f0;overflow:hidden}.nmg-timer-fill{width:100%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#22c55e,#84cc16);transition:width .24s linear}.nmg-timer.danger .nmg-timer-fill{background:linear-gradient(90deg,#ef4444,#f59e0b)}',
      '.nmg-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;width:100%}',
      '.nmg-choice{position:relative;min-height:58px;border-radius:13px!important;padding:11px 13px 11px 44px!important;display:flex;align-items:center;background:var(--card,#fff);box-shadow:0 5px 14px rgba(30,41,59,.07)}',
      '.nmg-choice.muted{opacity:.48}.nmg-key{position:absolute;left:11px;width:23px;height:23px;border-radius:7px;display:grid;place-items:center;background:#e0e7ff;color:#4338ca;font-size:11px;font-weight:900}',
      '.nmg-reveal{width:100%;box-sizing:border-box;border:1px solid #86efac;border-radius:13px;background:#f0fdf4;color:#166534;padding:11px 13px;font-size:13px;font-weight:800;line-height:1.45;animation:nmg-pop .28s ease}',
      '.nmg-col{display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}',
      '.nmg-pool{display:flex;flex-wrap:wrap;gap:8px}.nmg-buckets{display:flex;flex-wrap:wrap;gap:10px}',
      '.nmg-bucket{flex:1;min-width:120px;min-height:74px;border:2px dashed var(--border,#cbd5e1);border-radius:12px;background:var(--card,#fff);padding:8px;cursor:pointer;display:flex;flex-direction:column;gap:6px;align-items:center}',
      '.nmg-bucket:hover{border-color:#818cf8}.nmg-bucket.bad{border-color:#fca5a5;animation:nmg-shake .4s}',
      '.nmg-bk-name{font-weight:800;font-size:13px;color:var(--text,#1f2430)}',
      '.nmg-placed{font-size:12px;font-weight:700;color:#15803d;background:#dcfce7;border-radius:999px;padding:3px 9px}',
      '.nmg-wrap .nmg-chip{padding:9px 14px;border:1px solid var(--border,#d1d5db)!important;border-radius:999px;background:#fff!important;color:var(--text,#1f2430)!important;font-weight:700;font-size:14px;cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease,opacity .12s ease;text-align:left}',
      // 카드는 알약이 아니라 둥근 사각형(끌어 놓는 슬롯과 같은 계열)이다. 위 .nmg-wrap .nmg-chip과 특이도를 맞춰야 radius·cursor가 실제로 먹는다.
      '.nmg-wrap .nmg-card{border-radius:11px;box-shadow:0 4px 10px rgba(30,41,59,.08);cursor:grab;user-select:none}.nmg-card:active{cursor:grabbing}.nmg-card.dragging{opacity:.45;transform:scale(.96)}',
      '.nmg-core:before{content:"◆";color:#6366f1;margin-right:7px}',
      '.nmg-def{border-radius:12px;font-weight:600}',
      '.nmg-wrap .nmg-chip:hover{border-color:#818cf8!important;background:#f8fafc!important}.nmg-chip:focus-visible{outline:2px solid #6366f1;outline-offset:2px}',
      '.nmg-wrap .nmg-chip.sel{border-color:#6366f1!important;background:#eef2ff!important}',
      '.nmg-wrap .nmg-chip.ok{background:#dcfce7!important;border-color:#86efac!important;color:#15803d!important;cursor:default}',
      '.nmg-wrap .nmg-chip.bad{background:#fee2e2!important;border-color:#fca5a5!important;color:#b91c1c!important;animation:nmg-shake .4s}',
      '.nmg-pop{animation:nmg-pop .28s ease}',
      '.nmg-wrap .nmg-reset{margin-top:12px;padding:8px 14px;border:1px solid var(--border,#d1d5db)!important;border-radius:9px;background:transparent!important;color:var(--muted,#6b7280)!important;font-weight:700;font-size:13px;cursor:pointer}',
      '.nmg-float{position:absolute;transform:translate(-50%,-50%);font-weight:900;font-size:16px;pointer-events:none;animation:nmg-rise .9s ease-out forwards;z-index:5}',
      '.nmg-spark{position:absolute;width:7px;height:7px;border-radius:50%;pointer-events:none;animation:nmg-spk .55s ease-out forwards;z-index:5}',
      '.nmg-confetti{position:absolute;top:-12px;width:9px;height:14px;border-radius:2px;pointer-events:none;animation:nmg-fall 2.6s linear forwards;z-index:6}',
      '.nmg-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55);z-index:8;animation:nmg-fade .3s ease}',
      '.nmg-ovcard{background:var(--card,#fff);border-radius:16px;padding:22px 28px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.25)}',
      '.nmg-stars{font-size:38px;color:#f59e0b;letter-spacing:4px}',
      '.nmg-ovscore{margin:8px 0 14px;font-weight:800;color:var(--text,#1f2430)}',
      '.nmg-best{color:#15803d}.nmg-bestq{color:var(--muted,#6b7280);font-weight:600;font-size:13px}',
      '.nmg-wrap .nmg-again{padding:10px 20px;border:none!important;border-radius:10px;background:#6366f1!important;color:#fff!important;font-weight:800;font-size:15px;cursor:pointer}',
      '@keyframes nmg-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
      '@keyframes nmg-pop{0%{transform:scale(1)}40%{transform:scale(1.14)}100%{transform:scale(1)}}',
      '@keyframes nmg-pulse{0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.08),0 8px 24px rgba(99,102,241,.10)}50%{box-shadow:0 0 0 7px rgba(99,102,241,.16),0 10px 28px rgba(99,102,241,.18)}}',
      '@keyframes nmg-rise{0%{opacity:1;transform:translate(-50%,-50%)}100%{opacity:0;transform:translate(-50%,-150%)}}',
      '@keyframes nmg-spk{0%{opacity:1;transform:translate(-50%,-50%)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy)))}}',
      '@keyframes nmg-fall{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(420px) rotate(540deg);opacity:.4}}',
      '@keyframes nmg-fade{from{opacity:0}to{opacity:1}}',
      '@media (max-width:640px){.nmg-choice-grid{grid-template-columns:1fr}.nmg-trail{grid-template-columns:repeat(2,minmax(0,1fr))}.nmg-canvas{height:150px}.nmg-wrap .nmg-slot{min-width:calc(50% - 10px)}}',
      // 위 신규 규칙들은 .nmg-wrap 접두사로 특이도를 올렸으므로, 이 게이트도 같은 접두사를 붙여야 이긴다.
      '@media (prefers-reduced-motion:reduce){.nmg-wrap .nmg-chip,.nmg-wrap .nmg-chip.bad,.nmg-bucket.bad,.nmg-pop,.nmg-float,.nmg-reveal,.nmg-wrap .nmg-trail-slot,.nmg-wrap .nmg-trail-slot.active,.nmg-wrap .nmg-trail-slot.bad,.nmg-wrap .nmg-slot,.nmg-wrap .nmg-slot.bad{animation:none;transition:none}}'
    ].join('');
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
