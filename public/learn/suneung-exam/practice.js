/* 수능 풀어보기 — 실제 시험지 문항 이미지 + OMR 채점 + 해설
 * window.SUNEUNG_PRACTICE = { subject:'phys1', label:'물리학Ⅰ', base:'../suneung-exam/', parts:[{id,name,href}], mount:'practice-root' }
 */
(function () {
  var cfg = window.SUNEUNG_PRACTICE;
  if (!cfg) return;
  var root = document.getElementById(cfg.mount || 'practice-root');
  if (!root) return;
  var SUB = cfg.subject;
  var CIRC = ['①', '②', '③', '④', '⑤'];
  var EXAM_SECONDS = 30 * 60;

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function store(key, val) {
    try {
      if (val === undefined) { var r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtTime(s) { return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }

  var DATA = null, EXAMS = [], partName = {}, partHref = {};
  (cfg.parts || []).forEach(function (p) { partName[p.id] = p.name; partHref[p.id] = p.href; });
  var explainCache = {};

  var S = {
    set: 'exam:' + '', mode: 'exam', items: [], ans: [], graded: false, timer: false, left: EXAM_SECONDS, tick: null,
    count: 20, revealed: {}
  };

  function examOf(key) { return EXAMS.filter(function (e) { return e.key === key; })[0]; }

  function buildItems(setId) {
    var items = [];
    var parts = setId.split(':');
    if (parts[0] === 'exam') {
      var e = examOf(parts[1]);
      for (var n = 1; n <= 20; n++) items.push(mk(e, n));
    } else if (parts[0] === 'part') {
      EXAMS.forEach(function (e) {
        e[SUB].t.forEach(function (t, i) { if (t === parts[1]) items.push(mk(e, i + 1)); });
      });
      items = shuffle(items);
      if (S.count && S.count < items.length) items = items.slice(0, S.count);
    } else if (parts[0] === 'wrong') {
      var w = store('sn:' + SUB + ':wrong') || [];
      w.forEach(function (id) {
        var p = id.split('/'), e2 = examOf(p[0]);
        if (e2) items.push(mk(e2, +p[1]));
      });
      items = shuffle(items);
    }
    return items;
  }
  function mk(e, n) {
    var s = e[SUB];
    return {
      id: e.key + '/' + n, ex: e.key, title: e.title, n: n, ans: s.a[n - 1], pts: s.p[n - 1], tag: s.t[n - 1],
      img: cfg.base + e.key + '/' + SUB + '/q' + pad(n) + '.webp'
    };
  }

  /* ───────── UI shell ───────── */
  var bar, list, omr, resultBox, timerEl, progEl, setSel, modeBtns = {}, countSel, countWrap;

  function buildShell() {
    root.innerHTML = '';
    setSel = el('select', { 'aria-label': '문제 세트', onchange: function () { startSet(setSel.value); } });
    var g1 = el('optgroup', { label: '기출 시험 (20문항 · 30분)' });
    EXAMS.forEach(function (e) { g1.appendChild(el('option', { value: 'exam:' + e.key, text: e.title })); });
    var g2 = el('optgroup', { label: '파트별 모아 풀기 (전 시험에서 뽑기)' });
    (cfg.parts || []).forEach(function (p) {
      var c = 0; EXAMS.forEach(function (e) { e[SUB].t.forEach(function (t) { if (t === p.id) c++; }); });
      g2.appendChild(el('option', { value: 'part:' + p.id, text: p.name + ' (' + c + '문항)' }));
    });
    var g3 = el('optgroup', { label: '내 오답' });
    g3.appendChild(el('option', { value: 'wrong:all', text: '틀린 문제 다시 풀기' }));
    setSel.appendChild(g1); setSel.appendChild(g2); setSel.appendChild(g3);

    modeBtns.exam = el('button', { type: 'button', class: 'pr-seg', text: '시험 모드', onclick: function () { setMode('exam'); } });
    modeBtns.practice = el('button', { type: 'button', class: 'pr-seg', text: '연습 모드', onclick: function () { setMode('practice'); } });
    countSel = el('select', { 'aria-label': '출제 수', onchange: function () { S.count = +countSel.value; startSet(setSel.value); } }, [
      el('option', { value: '10', text: '10문항' }), el('option', { value: '20', text: '20문항' }), el('option', { value: '0', text: '전체' })
    ]);
    countSel.value = '10'; S.count = 10;
    countWrap = el('label', { class: 'pr-count' }, ['출제 ', countSel]);
    timerEl = el('button', { type: 'button', class: 'pr-timer', onclick: toggleTimer, 'aria-label': '타이머 켜기/끄기' });
    progEl = el('span', { class: 'pr-prog' });
    bar = el('div', { class: 'pr-bar' }, [
      el('div', { class: 'pr-bar-row' }, [setSel, countWrap]),
      el('div', { class: 'pr-bar-row' }, [el('div', { class: 'pr-segs', role: 'group', 'aria-label': '모드' }, [modeBtns.exam, modeBtns.practice]), timerEl, progEl])
    ]);
    list = el('div', { class: 'pr-list' });
    omr = el('aside', { class: 'pr-omr', 'aria-label': '답안지' });
    resultBox = el('div', { class: 'pr-result', hidden: 'hidden' });
    root.appendChild(bar);
    root.appendChild(el('div', { class: 'pr-body' }, [list, omr]));
    root.appendChild(el('p', { class: 'pr-src', html: '문항 출처: 한국교육과정평가원(KICE) 대학수학능력시험·6월/9월 모의평가 공개 문제지. 문제지에 관한 저작권은 한국교육과정평가원에 있으며, 이 페이지는 학습용으로 문항 이미지를 그대로 보여 주고 정답표로 채점합니다. 파트 분류는 문항 본문 키워드 기반 자동 분류라 일부 오차가 있을 수 있습니다.' }));
  }

  function setMode(m) {
    S.mode = m;
    store('sn:' + SUB + ':mode', m);
    if (S.graded) return renderAll();
    if (m === 'practice') stopTimer();
    renderAll();
  }
  function toggleTimer() {
    if (S.mode !== 'exam' || S.graded) return;
    if (S.tick) stopTimer(); else startTimer();
    renderBar();
  }
  function startTimer() {
    stopTimer();
    S.timer = true; S.usedTimer = true;
    S.tick = setInterval(function () {
      S.left--;
      if (S.left <= 0) { S.left = 0; stopTimer(); grade(); return; }
      renderBar();
    }, 1000);
  }
  function stopTimer() { if (S.tick) clearInterval(S.tick); S.tick = null; S.timer = false; }

  function startSet(setId) {
    stopTimer();
    S.set = setId;
    S.items = buildItems(setId);
    S.ans = S.items.map(function () { return 0; });
    S.graded = false; S.left = EXAM_SECONDS; S.revealed = {}; S.usedTimer = false;
    var isExam = setId.indexOf('exam:') === 0;
    if (!isExam && S.mode === 'exam') S.mode = 'practice';
    if (isExam) {
      var saved = store('sn:' + SUB + ':' + setId);
      if (saved && saved.ans && saved.ans.length === S.items.length) S.ans = saved.ans;
    }
    setSel.value = setId;
    try { history.replaceState(null, '', '#' + encodeURIComponent(setId)); } catch (e) {}
    renderAll();
    window.scrollTo && root.scrollIntoView && root.scrollIntoView({ block: 'start' });
  }

  function persist() {
    if (S.set.indexOf('exam:') === 0) store('sn:' + SUB + ':' + S.set, { ans: S.ans });
  }

  /* ───────── render ───────── */
  function renderBar() {
    modeBtns.exam.setAttribute('aria-pressed', S.mode === 'exam');
    modeBtns.practice.setAttribute('aria-pressed', S.mode === 'practice');
    var isExam = S.set.indexOf('exam:') === 0;
    countWrap.style.display = S.set.indexOf('part:') === 0 ? '' : 'none';
    modeBtns.exam.disabled = !isExam;
    var done = S.ans.filter(Boolean).length;
    progEl.textContent = '푼 문항 ' + done + ' / ' + S.items.length;
    if (S.mode === 'exam' && isExam && !S.graded) {
      timerEl.style.display = '';
      timerEl.textContent = (S.tick ? '⏱ ' : '⏱ 타이머 시작 ') + fmtTime(S.left);
      timerEl.classList.toggle('on', !!S.tick);
    } else timerEl.style.display = 'none';
  }

  function renderAll() {
    renderBar();
    list.innerHTML = '';
    if (!S.items.length) {
      list.appendChild(el('p', { class: 'pr-empty', text: '아직 저장된 오답이 없습니다. 문제를 풀고 채점하면 틀린 문항이 여기에 모입니다.' }));
    }
    S.items.forEach(function (it, i) { list.appendChild(card(it, i)); });
    renderOmr();
  }

  function isShown(i) { return S.graded || (S.mode === 'practice' && S.ans[i]); }

  function card(it, i) {
    var shown = isShown(i);
    var c = el('article', { class: 'pr-card' + (shown ? (S.ans[i] === it.ans ? ' ok' : (S.ans[i] ? ' bad' : ' skip')) : ''), id: 'q-' + i });
    var head = el('div', { class: 'pr-card-head' }, [
      el('span', { class: 'pr-no', text: (i + 1) }),
      el('span', { class: 'pr-meta', text: it.title + ' · ' + it.n + '번 · ' + it.pts + '점' }),
      it.tag && partName[it.tag] ? el('a', { class: 'pr-tag', href: partHref[it.tag] || '#', text: partName[it.tag] }) : null
    ]);
    var img = el('img', { class: 'pr-img', src: it.img, alt: it.title + ' ' + it.n + '번 문항', loading: 'lazy', decoding: 'async' });
    var ch = el('div', { class: 'pr-choices', role: 'group', 'aria-label': (i + 1) + '번 답 선택' });
    for (var k = 1; k <= 5; k++) (function (k) {
      var cls = 'pr-ch';
      if (S.ans[i] === k) cls += ' sel';
      if (shown && k === it.ans) cls += ' right';
      if (shown && S.ans[i] === k && k !== it.ans) cls += ' wrong';
      ch.appendChild(el('button', { type: 'button', class: cls, 'aria-pressed': S.ans[i] === k, text: CIRC[k - 1], onclick: function () { choose(i, k); } }));
    })(k);
    c.appendChild(head); c.appendChild(el('div', { class: 'pr-paper' }, [img])); c.appendChild(ch);
    if (shown) c.appendChild(reveal(it, i));
    return c;
  }

  function reveal(it, i) {
    var okk = S.ans[i] === it.ans;
    var verdict = S.ans[i] ? (okk ? '정답입니다' : '오답입니다 · 내 답 ' + CIRC[S.ans[i] - 1]) : '풀지 않은 문항';
    var box = el('div', { class: 'pr-explain' }, [
      el('p', { class: 'pr-verdict' }, [el('b', { text: verdict }), ' · 정답 ' + CIRC[it.ans - 1] + ' · 배점 ' + it.pts + '점']),
    ]);
    var body = el('div', { class: 'pr-exp-body', text: '해설 불러오는 중…' });
    box.appendChild(body);
    loadExplain(it.ex).then(function (map) {
      var t = map && map[it.n];
      if (t) { body.className = 'pr-exp-body has'; body.innerHTML = t; }
      else {
        body.className = 'pr-exp-body none';
        body.textContent = '이 문항의 상세 해설은 아직 없습니다. 정답은 ' + CIRC[it.ans - 1] + '입니다.';
        if (it.tag && partHref[it.tag]) {
          body.appendChild(document.createTextNode(' 관련 개념: '));
          body.appendChild(el('a', { href: partHref[it.tag], text: partName[it.tag] }));
        }
      }
    });
    return box;
  }
  function loadExplain(key) {
    var ck = key + '-' + SUB;
    if (!explainCache[ck]) {
      explainCache[ck] = fetch(cfg.base + 'explain/' + ck + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    return explainCache[ck];
  }

  function choose(i, k) {
    if (S.graded) return;
    S.ans[i] = S.ans[i] === k ? 0 : k;
    persist();
    if (S.mode === 'practice') recordWrong(S.items[i], S.ans[i]);
    var old = document.getElementById('q-' + i);
    old.parentNode.replaceChild(card(S.items[i], i), old);
    renderBar(); renderOmr();
  }
  function recordWrong(it, a) {
    if (!a) return;
    var w = store('sn:' + SUB + ':wrong') || [];
    var idx = w.indexOf(it.id);
    if (a !== it.ans && idx < 0) w.push(it.id);
    else if (a === it.ans && idx >= 0) w.splice(idx, 1);
    store('sn:' + SUB + ':wrong', w);
  }

  function renderOmr() {
    omr.innerHTML = '';
    omr.appendChild(el('h3', { text: '답안지' }));
    var grid = el('div', { class: 'pr-grid' });
    S.items.forEach(function (it, i) {
      var shown = isShown(i);
      var row = el('div', { class: 'pr-row' + (shown ? (S.ans[i] === it.ans ? ' ok' : (S.ans[i] ? ' bad' : ' skip')) : '') });
      row.appendChild(el('a', { class: 'pr-rn', href: '#q-' + i, text: i + 1, onclick: function (e) { e.preventDefault(); var t = document.getElementById('q-' + i); t && t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }));
      for (var k = 1; k <= 5; k++) (function (k) {
        var cls = 'pr-b';
        if (S.ans[i] === k) cls += ' sel';
        if (S.graded && k === it.ans) cls += ' right';
        row.appendChild(el('button', { type: 'button', class: cls, 'aria-label': (i + 1) + '번 ' + k + '번 선택', text: k, onclick: function () { choose(i, k); } }));
      })(k);
      grid.appendChild(row);
    });
    omr.appendChild(grid);
    if (!S.graded && S.items.length) {
      omr.appendChild(el('button', { type: 'button', class: 'pr-submit', text: S.mode === 'exam' ? '제출하고 채점하기' : '지금까지 채점하기', onclick: grade }));
    }
    if (S.graded) {
      omr.appendChild(resultPanel());
    }
    var hist = store('sn:' + SUB + ':hist') || [];
    if (hist.length) {
      var h = el('details', { class: 'pr-hist' }, [el('summary', { text: '내 기록 (최근 ' + Math.min(hist.length, 8) + '회)' })]);
      hist.slice(-8).reverse().forEach(function (r) {
        h.appendChild(el('div', { class: 'pr-hrow', text: r.d + ' · ' + r.s + ' · ' + r.sc + ' / ' + r.t + '점' }));
      });
      omr.appendChild(h);
    }
  }

  function setLabel() {
    var p = S.set.split(':');
    if (p[0] === 'exam') return examOf(p[1]).title;
    if (p[0] === 'part') return partName[p[1]] + ' 모아 풀기';
    return '오답 다시 풀기';
  }

  function grade() {
    if (S.graded) return;
    stopTimer();
    S.graded = true;
    var sc = 0, tot = 0, right = 0, wrongIds = [];
    S.items.forEach(function (it, i) {
      tot += it.pts;
      if (S.ans[i] === it.ans) { sc += it.pts; right++; }
      recordWrong(it, S.ans[i]);
      if (S.ans[i] && S.ans[i] !== it.ans) wrongIds.push(i + 1);
    });
    S.result = { sc: sc, tot: tot, right: right, n: S.items.length, wrong: wrongIds, unanswered: S.ans.filter(function (a) { return !a; }).length, used: EXAM_SECONDS - S.left };
    var hist = store('sn:' + SUB + ':hist') || [];
    var d = new Date();
    hist.push({ d: (d.getMonth() + 1) + '/' + d.getDate(), s: setLabel(), sc: sc, t: tot });
    store('sn:' + SUB + ':hist', hist.slice(-40));
    renderAll();
    omr.scrollIntoView && omr.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resultPanel() {
    var r = S.result;
    var box = el('div', { class: 'pr-result' });
    box.appendChild(el('div', { class: 'pr-score' }, [el('b', { text: r.sc }), ' / ' + r.tot + '점']));
    box.appendChild(el('p', { class: 'pr-sub', text: r.right + ' / ' + r.n + '문항 정답' + (r.unanswered ? ' · 미풀이 ' + r.unanswered : '') + (S.usedTimer && r.used > 0 ? ' · 소요 ' + fmtTime(r.used) : '') }));
    if (r.wrong.length) box.appendChild(el('p', { class: 'pr-sub', text: '오답 번호: ' + r.wrong.join(', ') }));
    var partStat = {};
    S.items.forEach(function (it, i) {
      var p = it.tag; if (!p) return;
      partStat[p] = partStat[p] || { n: 0, ok: 0 };
      partStat[p].n++; if (S.ans[i] === it.ans) partStat[p].ok++;
    });
    var ks = Object.keys(partStat);
    if (ks.length > 1) {
      var ul = el('ul', { class: 'pr-parts' });
      ks.forEach(function (p) {
        var s = partStat[p];
        ul.appendChild(el('li', {}, [el('a', { href: partHref[p] || '#', text: partName[p] || p }), ' ' + s.ok + '/' + s.n]));
      });
      box.appendChild(el('p', { class: 'pr-sub', text: '파트별 정답' }));
      box.appendChild(ul);
    }
    var acts = el('div', { class: 'pr-acts' });
    acts.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '다시 풀기', onclick: function () { if (S.set.indexOf('exam:') === 0) store('sn:' + SUB + ':' + S.set, null); startSet(S.set); } }));
    if (r.wrong.length) acts.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '틀린 문제 모아 풀기', onclick: function () { startSet('wrong:all'); } }));
    box.appendChild(acts);
    return box;
  }

  /* ───────── boot ───────── */
  fetch(cfg.base + 'exams.json').then(function (r) { return r.json(); }).then(function (d) {
    DATA = d; EXAMS = d.exams;
    buildShell();
    var savedMode = store('sn:' + SUB + ':mode');
    S.mode = savedMode === 'practice' ? 'practice' : 'exam';
    var h = decodeURIComponent((location.hash || '').slice(1));
    var start = /^(exam|part|wrong):/.test(h) ? h : 'exam:' + EXAMS[0].key;
    if (start.indexOf('exam:') === 0 && !examOf(start.slice(5))) start = 'exam:' + EXAMS[0].key;
    if (start.indexOf('part:') === 0 && !partName[start.slice(5)]) start = 'exam:' + EXAMS[0].key;
    startSet(start);
    window.scrollTo(0, 0);
  }).catch(function () {
    root.textContent = '문제 데이터를 불러오지 못했습니다. 로컬에서는 python3 -m http.server로 public/learn을 열어 주세요.';
  });
})();
