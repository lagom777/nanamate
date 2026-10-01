/* 수능 풀어보기 — 실제 시험지 이미지 + OMR 채점 + 해설
 * window.SUNEUNG_PRACTICE = {
 *   subject:'phys1', label:'물리학Ⅰ', base:'../suneung-exam/', parts:[{id,name,href}], mount:'practice-root',
 *   kind:'items' (문항별 이미지, 기본) | 'paper' (시험지 단 조각 + 답안지: 국어·영어),
 *   imgBase:'https://…r2.dev/' (문항·시험지 이미지 주소, 없으면 base),
 *   qn:20, minutes:30                                   // items: 문항 수·제한 시간(분)
 * }
 * exams.json 의 과목 항목: items → {a:[정답], p:[배점], t?:[파트], n?:[단답형 문항 번호]} / paper → {paper:1} (+ <key>/<sub>/meta.json)
 */
(function () {
  var cfg = window.SUNEUNG_PRACTICE;
  if (!cfg) return;
  var root = document.getElementById(cfg.mount || 'practice-root');
  if (!root) return;
  var SUB = cfg.subject;
  var KIND = cfg.kind || 'items';
  var PAPER = KIND === 'paper';
  var QN = cfg.qn || 20;
  var EXAM_SECONDS = (cfg.minutes || 30) * 60;
  var CIRC = ['①', '②', '③', '④', '⑤'];

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
      if (val === null) { localStorage.removeItem(key); return null; }
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

  var EXAMS = [], partName = {}, partHref = {};
  (cfg.parts || []).forEach(function (p) { partName[p.id] = p.name; partHref[p.id] = p.href; });
  var HAS_PARTS = !!(cfg.parts && cfg.parts.length);
  var explainCache = {}, metaCache = {};

  var S = {
    set: '', mode: 'exam', items: [], ans: [], graded: false, timer: false, left: EXAM_SECONDS, tick: null,
    count: 10, revealed: {}, sel: 'a', meta: null, pa: {}
  };

  function examList() { return EXAMS.filter(function (e) { return e[SUB]; }); }
  function examOf(key) { return examList().filter(function (e) { return e.key === key; })[0]; }
  function isRight(it, a) { return it.ans === 0 ? true : Array.isArray(it.ans) ? it.ans.indexOf(a) >= 0 : a === it.ans; }
  function chLabel(a) { return a ? CIRC[a - 1] : '-'; }

  /* ───────── items (문항별 이미지) ───────── */
  function buildItems(setId) {
    var items = [];
    var parts = setId.split(':');
    if (parts[0] === 'exam') {
      var e = examOf(parts[1]);
      for (var n = 1; n <= QN; n++) items.push(mk(e, n));
    } else if (parts[0] === 'part') {
      examList().forEach(function (e) {
        (e[SUB].t || []).forEach(function (t, i) { if (t === parts[1]) items.push(mk(e, i + 1)); });
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
      id: e.key + '/' + n, ex: e.key, title: e.title, n: n, ans: s.a[n - 1], pts: s.p[n - 1], tag: s.t ? s.t[n - 1] : null,
      num: !!(s.n && s.n.indexOf(n) >= 0),
      img: (cfg.imgBase || cfg.base) + e.key + '/' + SUB + '/q' + pad(n) + '.webp'
    };
  }

  /* ───────── paper (국어·영어) ───────── */
  var SEC_NAME = { c: '공통', a: '선택 · 화법과 작문', b: '선택 · 언어와 매체' };
  var SEC_LO = { c: 1, a: 35, b: 35 };
  function paperSecs() { return SUB === 'korean' && S.meta && S.meta.answers[S.sel] ? ['c', S.sel] : ['c']; }
  function buildPaper() {
    var m = S.meta, items = [];
    paperSecs().forEach(function (sec) {
      m.answers[sec].forEach(function (a, i) {
        items.push({ id: sec + (SEC_LO[sec] + i), sec: sec, n: SEC_LO[sec] + i, ans: a, pts: m.points[sec][i] });
      });
    });
    return items;
  }
  function loadMeta(key) {
    if (!metaCache[key]) {
      metaCache[key] = fetch(cfg.base + key + '/' + SUB + '/meta.json').then(function (r) { return r.json(); });
    }
    return metaCache[key];
  }

  /* ───────── UI shell ───────── */
  var fab, bar, list, omr, timerEl, progEl, setSel, selSel, modeBtns = {}, countSel, countWrap;

  function buildShell() {
    root.innerHTML = '';
    var ex = examList();
    setSel = el('select', { 'aria-label': '문제 세트', onchange: function () { startSet(setSel.value); } });
    var g1 = el('optgroup', { label: '기출 시험 (' + QN + '문항 · ' + (EXAM_SECONDS / 60) + '분)' });
    ex.forEach(function (e) { g1.appendChild(el('option', { value: 'exam:' + e.key, text: e.title })); });
    setSel.appendChild(g1);
    if (HAS_PARTS && !PAPER) {
      var g2 = el('optgroup', { label: '파트별 모아 풀기 (전 시험에서 뽑기)' });
      cfg.parts.forEach(function (p) {
        var c = 0; ex.forEach(function (e) { (e[SUB].t || []).forEach(function (t) { if (t === p.id) c++; }); });
        g2.appendChild(el('option', { value: 'part:' + p.id, text: p.name + ' (' + c + '문항)' }));
      });
      setSel.appendChild(g2);
    }
    if (!PAPER) {
      var g3 = el('optgroup', { label: '내 오답' });
      g3.appendChild(el('option', { value: 'wrong:all', text: '틀린 문제 다시 풀기' }));
      setSel.appendChild(g3);
    }

    modeBtns.exam = el('button', { type: 'button', class: 'pr-seg', text: '시험 모드', onclick: function () { setMode('exam'); } });
    modeBtns.practice = el('button', { type: 'button', class: 'pr-seg', text: '연습 모드', onclick: function () { setMode('practice'); } });
    countSel = el('select', { 'aria-label': '출제 수', onchange: function () { S.count = +countSel.value; startSet(setSel.value); } }, [
      el('option', { value: '10', text: '10문항' }), el('option', { value: '20', text: '20문항' }), el('option', { value: '0', text: '전체' })
    ]);
    countSel.value = '10'; S.count = 10;
    countWrap = el('label', { class: 'pr-count' }, ['출제 ', countSel]);
    var row1 = [setSel];
    if (SUB === 'korean') {
      selSel = el('select', { 'aria-label': '선택과목', onchange: function () { S.sel = selSel.value; store('sn:' + SUB + ':sel', S.sel); startSet(setSel.value, true); } }, [
        el('option', { value: 'a', text: '선택과목: 화법과 작문' }), el('option', { value: 'b', text: '선택과목: 언어와 매체' })
      ]);
      row1.push(selSel);
    } else row1.push(countWrap);
    timerEl = el('button', { type: 'button', class: 'pr-timer', onclick: toggleTimer, 'aria-label': '타이머 켜기/끄기' });
    progEl = el('span', { class: 'pr-prog' });
    bar = el('div', { class: 'pr-bar' }, [
      el('div', { class: 'pr-bar-row' }, row1),
      el('div', { class: 'pr-bar-row' }, [el('div', { class: 'pr-segs', role: 'group', 'aria-label': '모드' }, [modeBtns.exam, modeBtns.practice]), timerEl, progEl])
    ]);
    list = el('div', { class: 'pr-list' + (PAPER ? ' paper' : '') });
    omr = el('div', { class: 'pr-omr', role: 'complementary', 'aria-label': '답안지' });
    root.appendChild(bar);
    root.appendChild(el('div', { class: 'pr-body' + (PAPER ? ' paper' : '') }, [list, omr]));
    if (PAPER) {
      fab = el('button', { type: 'button', class: 'pr-fab', text: '📝 답안지', onclick: function () { toggleOmr(); } });
      root.appendChild(fab);
    }
    root.appendChild(el('p', { class: 'pr-src', html: '문항 출처: 한국교육과정평가원(KICE) 대학수학능력시험·6월/9월 모의평가 공개 문제지. 문제지에 관한 저작권은 한국교육과정평가원에 있으며, 이 페이지는 학습용으로 문항 이미지를 그대로 보여 주고 정답표로 채점합니다.' + (HAS_PARTS ? ' 파트 분류는 문항 내용 기반 자동 분류라 일부 오차가 있을 수 있습니다.' : '') + (PAPER && SUB === 'english' ? ' 듣기 음성은 제공하지 않으며, 채점 후 듣기평가 대본을 볼 수 있습니다.' : '') }));
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

  function startSet(setId, keepAns) {
    stopTimer();
    S.set = setId;
    var isExam = setId.indexOf('exam:') === 0;
    if (PAPER) {
      S.graded = false; S.left = EXAM_SECONDS; S.usedTimer = false; S.revealed = {};
      if (!isExam) setId = S.set = 'exam:' + examList()[0].key;
      var key = setId.slice(5);
      var saved = store('sn:' + SUB + ':' + setId);
      S.pa = saved && saved.pa ? saved.pa : {};
      setSel.value = setId;
      try { history.replaceState(null, '', '#' + encodeURIComponent(setId)); } catch (e) {}
      loadMeta(key).then(function (m) {
        if (S.set !== setId) return;
        S.meta = m;
        if (selSel) selSel.style.display = m.answers.a ? '' : 'none';
        S.items = buildPaper();
        S.ans = S.items.map(function (it) { return S.pa[it.id] || 0; });
        renderAll();
        if (!keepAns) window.scrollTo && root.scrollIntoView && root.scrollIntoView({ block: 'start' });
      }).catch(function () { list.textContent = '시험지 데이터를 불러오지 못했습니다.'; });
      return;
    }
    S.items = buildItems(setId);
    S.ans = S.items.map(function () { return 0; });
    S.graded = false; S.left = EXAM_SECONDS; S.revealed = {}; S.usedTimer = false;
    if (!isExam && S.mode === 'exam') S.mode = 'practice';
    if (isExam) {
      var sv = store('sn:' + SUB + ':' + setId);
      if (sv && sv.ans && sv.ans.length === S.items.length) S.ans = sv.ans;
    }
    setSel.value = setId;
    try { history.replaceState(null, '', '#' + encodeURIComponent(setId)); } catch (e) {}
    renderAll();
    window.scrollTo && root.scrollIntoView && root.scrollIntoView({ block: 'start' });
  }

  function persist() {
    if (S.set.indexOf('exam:') !== 0) return;
    if (PAPER) {
      S.items.forEach(function (it, i) { S.pa[it.id] = S.ans[i]; });
      store('sn:' + SUB + ':' + S.set, { pa: S.pa });
    } else store('sn:' + SUB + ':' + S.set, { ans: S.ans });
  }

  /* ───────── render ───────── */
  function renderBar() {
    modeBtns.exam.setAttribute('aria-pressed', S.mode === 'exam');
    modeBtns.practice.setAttribute('aria-pressed', S.mode === 'practice');
    var isExam = S.set.indexOf('exam:') === 0;
    if (!PAPER || SUB !== 'korean') countWrap.style.display = S.set.indexOf('part:') === 0 ? '' : 'none';
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
    if (PAPER) renderPaper();
    else {
      if (!S.items.length) {
        list.appendChild(el('p', { class: 'pr-empty', text: '아직 저장된 오답이 없습니다. 문제를 풀고 채점하면 틀린 문항이 여기에 모입니다.' }));
      }
      S.items.forEach(function (it, i) { list.appendChild(card(it, i)); });
    }
    renderOmr();
  }

  function isShown(i) {
    if (S.revealed[i] !== undefined) return S.revealed[i];
    return S.graded || (S.mode === 'practice' && S.ans[i]);
  }
  /* 문항 하나만 채점·해설 열기/접기 (시험 모드에서도 가능) */
  function toggleReveal(i) {
    S.revealed[i] = !isShown(i);
    if (!PAPER) refreshCard(i);
    renderOmr();
  }
  function stateCls(it, i) {
    if (!isShown(i)) return '';
    return isRight(it, S.ans[i]) ? ' ok' : (S.ans[i] ? ' bad' : ' skip');
  }

  function card(it, i) {
    var shown = isShown(i);
    var c = el('article', { class: 'pr-card' + stateCls(it, i), id: 'q-' + i });
    var head = el('div', { class: 'pr-card-head' }, [
      el('span', { class: 'pr-no', text: (i + 1) }),
      el('span', { class: 'pr-meta', text: it.title + ' · ' + it.n + '번 · ' + it.pts + '점' }),
      it.tag && partName[it.tag] ? el('a', { class: 'pr-tag', href: partHref[it.tag] || '#', text: partName[it.tag] }) : null
    ]);
    var img = el('img', { class: 'pr-img', src: it.img, alt: it.title + ' ' + it.n + '번 문항', loading: 'lazy', decoding: 'async' });
    c.appendChild(head); c.appendChild(el('div', { class: 'pr-paper' }, [img]));
    if (it.num) {
      var inp = el('input', {
        type: 'text', inputmode: 'numeric', pattern: '[0-9]*', maxlength: '3', class: 'pr-num', 'aria-label': (i + 1) + '번 답 입력',
        placeholder: '정답(0~999)', value: S.ans[i] ? String(S.ans[i]) : '', disabled: S.graded ? 'disabled' : false,
        onchange: function () { setNum(i, inp.value); },
        onkeydown: function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); setNum(i, inp.value); } }
      });
      c.appendChild(el('div', { class: 'pr-numrow' }, [el('span', { text: '단답형 · 답 입력' }), inp]));
    } else {
      var ch = el('div', { class: 'pr-choices', role: 'group', 'aria-label': (i + 1) + '번 답 선택' });
      for (var k = 1; k <= 5; k++) (function (k) {
        var cls = 'pr-ch';
        if (S.ans[i] === k) cls += ' sel';
        if (shown && it.ans !== 0 && isRight(it, k)) cls += ' right';
        if (shown && S.ans[i] === k && !isRight(it, k)) cls += ' wrong';
        ch.appendChild(el('button', { type: 'button', class: cls, 'aria-pressed': S.ans[i] === k, text: CIRC[k - 1], onclick: function () { choose(i, k); } }));
      })(k);
      c.appendChild(ch);
    }
    c.appendChild(el('button', { type: 'button', class: 'pr-chk-btn' + (shown ? ' on' : ''), text: shown ? '해설 접기' : '이 문제 채점 · 해설 보기', onclick: function () { toggleReveal(i); } }));
    if (shown) c.appendChild(reveal(it, i));
    return c;
  }

  function ansText(it, a) { return it.num ? String(a) : chLabel(a); }

  function reveal(it, i) {
    var okk = isRight(it, S.ans[i]);
    var verdict = S.ans[i] ? (okk ? '정답입니다' : '오답입니다 · 내 답 ' + ansText(it, S.ans[i])) : '풀지 않은 문항';
    var corr = it.ans === 0 ? '정답 없음(배점 인정)' : Array.isArray(it.ans) ? it.ans.map(function (x) { return ansText(it, x); }).join(' 또는 ') + ' (복수 정답)' : ansText(it, it.ans);
    var box = el('div', { class: 'pr-explain' }, [
      el('p', { class: 'pr-verdict' }, [el('b', { text: verdict }), ' · ' + (it.ans === 0 ? '' : '정답 ') + corr + ' · 배점 ' + it.pts + '점']),
    ]);
    var body = el('div', { class: 'pr-exp-body', text: '해설 불러오는 중…' });
    box.appendChild(body);
    loadExplain(it.ex).then(function (map) {
      var t = map && map[it.n];
      if (t) { body.className = 'pr-exp-body has'; body.innerHTML = t; }
      else {
        body.className = 'pr-exp-body none';
        body.textContent = '이 문항의 상세 해설은 아직 없습니다. 정답은 ' + corr + '입니다.';
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

  function refreshCard(i) {
    var old = document.getElementById('q-' + i);
    if (old) old.parentNode.replaceChild(card(S.items[i], i), old);
  }
  function choose(i, k) {
    if (S.graded) return;
    S.ans[i] = S.ans[i] === k ? 0 : k;
    persist();
    if (S.mode === 'practice' && !PAPER) recordWrong(S.items[i], S.ans[i]);
    if (!PAPER) refreshCard(i);
    renderBar(); renderOmr();
  }
  function setNum(i, v) {
    if (S.graded) return;
    var n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
    S.ans[i] = isNaN(n) ? 0 : n;
    persist();
    if (S.mode === 'practice') recordWrong(S.items[i], S.ans[i]);
    refreshCard(i);
    renderBar(); renderOmr();
  }
  function recordWrong(it, a) {
    if (!a) return;
    var w = store('sn:' + SUB + ':wrong') || [];
    var idx = w.indexOf(it.id);
    if (!isRight(it, a) && idx < 0) w.push(it.id);
    else if (isRight(it, a) && idx >= 0) w.splice(idx, 1);
    store('sn:' + SUB + ':wrong', w);
  }

  /* ───────── paper 렌더 ───────── */
  function renderPaper() {
    var m = S.meta;
    if (SUB === 'english' && m.script) list.appendChild(scriptBox());
    paperSecs().forEach(function (sec) {
      list.appendChild(el('h3', { class: 'pr-sec', text: SEC_NAME[sec] + ' (' + SEC_LO[sec] + '~' + (SEC_LO[sec] + m.answers[sec].length - 1) + '번)' }));
      var wrap = el('div', { class: 'pr-strips' });
      var strips = m.strips[sec], anchors = m.anchors[sec];
      strips.forEach(function (s, idx) {
        var box = el('div', { class: 'pr-strip' }, [
          el('img', { src: (cfg.imgBase || cfg.base) + S.set.slice(5) + '/' + SUB + '/' + s.file, width: s.w, height: s.h, alt: SEC_NAME[sec] + ' 시험지 ' + (idx + 1) + '단', loading: 'lazy', decoding: 'async' })
        ]);
        for (var n in anchors) {
          var a = anchors[n];
          if (a[0] === idx) box.appendChild(el('span', { class: 'pr-anchor', id: 'pq-' + sec + n, style: 'top:' + (a[1] / s.h * 100).toFixed(2) + '%', 'aria-hidden': 'true' }));
        }
        wrap.appendChild(box);
      });
      list.appendChild(wrap);
    });
  }
  function scriptBox() {
    var m = S.meta;
    var d = el('details', { class: 'pr-script' }, [el('summary', { text: S.graded ? '🎧 듣기평가 대본 (1~17번)' : '🎧 듣기평가 대본 (채점 후 열립니다)' })]);
    if (S.graded && m.script) {
      for (var n = 1; n <= 17; n++) {
        var t = m.script[String(n)];
        if (t) d.appendChild(el('div', { class: 'pr-script-q' }, [el('b', { text: n + '번' }), el('pre', { text: t.replace(/^\[?\d+[～~]?\d*\]?\.?\s*/, '') })]));
      }
      d.setAttribute('open', 'open');
    }
    if (!S.graded) d.classList.add('locked');
    return d;
  }
  function isNarrow() { return window.matchMedia && window.matchMedia('(max-width: 900px)').matches; }
  function toggleOmr(force) {
    var open = force === undefined ? !omr.classList.contains('open') : force;
    omr.classList.toggle('open', open);
    if (fab) fab.textContent = open ? '✕ 닫기' : '📝 답안지';
  }
  function jump(i) {
    if (PAPER && isNarrow()) toggleOmr(false);
    var it = S.items[i], t;
    if (PAPER) t = document.getElementById('pq-' + it.sec + it.n);
    else t = document.getElementById('q-' + i);
    t && t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ───────── 답안지 ───────── */
  function renderOmr() {
    omr.innerHTML = '';
    omr.appendChild(el('h3', { text: '답안지' }));
    var grid = el('div', { class: 'pr-grid' });
    var lastSec = null;
    S.items.forEach(function (it, i) {
      if (PAPER && it.sec !== lastSec) {
        lastSec = it.sec;
        grid.appendChild(el('div', { class: 'pr-omr-sec', text: SEC_NAME[it.sec] }));
      }
      var row = el('div', { class: 'pr-row' + stateCls(it, i) + (it.num ? ' numrow' : '') });
      var label = PAPER ? it.n : (i + 1);
      row.appendChild(el('a', { class: 'pr-rn', href: '#q-' + i, text: label, onclick: function (e) { e.preventDefault(); jump(i); } }));
      if (it.num) {
        row.appendChild(el('input', {
          type: 'text', inputmode: 'numeric', pattern: '[0-9]*', maxlength: '3', class: 'pr-numo', 'aria-label': (i + 1) + '번 답 입력', placeholder: '단답', value: S.ans[i] ? String(S.ans[i]) : '',
          disabled: S.graded ? 'disabled' : false, onchange: function (ev) { setNum(i, ev.target.value); }
        }));
        if (S.graded) row.appendChild(el('span', { class: 'pr-numans', text: '정답 ' + it.ans }));
      } else for (var k = 1; k <= 5; k++) (function (k) {
        var cls = 'pr-b';
        if (S.ans[i] === k) cls += ' sel';
        if (isShown(i) && it.ans !== 0 && isRight(it, k)) cls += ' right';
        row.appendChild(el('button', { type: 'button', class: cls, 'aria-label': label + '번 ' + k + '번 선택', text: k, onclick: function () { choose(i, k); } }));
      })(k);
      if (PAPER) row.appendChild(el('button', { type: 'button', class: 'pr-chk' + (isShown(i) ? ' on' : ''), title: isShown(i) ? '정답 가리기' : '이 문제 채점', 'aria-label': label + '번 채점', text: '✓', onclick: function () { toggleReveal(i); } }));
      grid.appendChild(row);
    });
    omr.appendChild(grid);
    if (!S.graded && S.items.length) {
      omr.appendChild(el('button', { type: 'button', class: 'pr-submit', text: S.mode === 'exam' ? '제출하고 채점하기' : '지금까지 채점하기', onclick: grade }));
    }
    if (S.graded) omr.appendChild(resultPanel());
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
    if (p[0] === 'exam') return examOf(p[1]).title + (SUB === 'korean' ? ' (' + (S.sel === 'a' ? '화작' : '언매') + ')' : '');
    if (p[0] === 'part') return partName[p[1]] + ' 모아 풀기';
    return '오답 다시 풀기';
  }

  function grade() {
    if (S.graded) return;
    stopTimer();
    S.graded = true; S.revealed = {};
    var sc = 0, tot = 0, right = 0, wrongIds = [], bySec = {};
    S.items.forEach(function (it, i) {
      tot += it.pts;
      var ok = isRight(it, S.ans[i]);
      if (ok) { sc += it.pts; right++; }
      var g = it.sec || 'c';
      bySec[g] = bySec[g] || { sc: 0, tot: 0 };
      bySec[g].tot += it.pts; if (ok) bySec[g].sc += it.pts;
      if (!PAPER) recordWrong(it, S.ans[i]);
      if (S.ans[i] && !ok) wrongIds.push(PAPER ? it.n : i + 1);
    });
    var listen = null;
    if (SUB === 'english') {
      listen = { sc: 0, tot: 0 };
      S.items.forEach(function (it, i) { if (it.n <= 17) { listen.tot += it.pts; if (isRight(it, S.ans[i])) listen.sc += it.pts; } });
    }
    S.result = { sc: sc, tot: tot, right: right, n: S.items.length, wrong: wrongIds, unanswered: S.ans.filter(function (a) { return !a; }).length, used: EXAM_SECONDS - S.left, bySec: bySec, listen: listen };
    var hist = store('sn:' + SUB + ':hist') || [];
    var d = new Date();
    hist.push({ d: (d.getMonth() + 1) + '/' + d.getDate(), s: setLabel(), sc: sc, t: tot });
    store('sn:' + SUB + ':hist', hist.slice(-40));
    renderAll();
    if (PAPER && isNarrow()) toggleOmr(true);
    else omr.scrollIntoView && omr.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function engGrade(sc) {
    var cuts = [90, 80, 70, 60, 50, 40, 30, 20];
    for (var i = 0; i < cuts.length; i++) if (sc >= cuts[i]) return (i + 1) + '등급';
    return '9등급';
  }

  function resultPanel() {
    var r = S.result;
    var box = el('div', { class: 'pr-result' });
    box.appendChild(el('div', { class: 'pr-score' }, [el('b', { text: r.sc }), ' / ' + r.tot + '점']));
    if (SUB === 'english' && S.set.indexOf('exam:') === 0) box.appendChild(el('p', { class: 'pr-sub', text: '절대평가 환산 ' + engGrade(r.sc) + ' (원점수 90점 이상 1등급 기준)' }));
    box.appendChild(el('p', { class: 'pr-sub', text: r.right + ' / ' + r.n + '문항 정답' + (r.unanswered ? ' · 미풀이 ' + r.unanswered : '') + (S.usedTimer && r.used > 0 ? ' · 소요 ' + fmtTime(r.used) : '') }));
    if (PAPER) {
      var ks0 = Object.keys(r.bySec);
      if (ks0.length > 1) box.appendChild(el('p', { class: 'pr-sub', text: ks0.map(function (k) { return SEC_NAME[k] + ' ' + r.bySec[k].sc + '/' + r.bySec[k].tot; }).join(' · ') }));
      if (r.listen) box.appendChild(el('p', { class: 'pr-sub', text: '듣기 ' + r.listen.sc + '/' + r.listen.tot + ' · 독해 ' + (r.sc - r.listen.sc) + '/' + (r.tot - r.listen.tot) }));
    }
    if (r.wrong.length) box.appendChild(el('p', { class: 'pr-sub', text: '오답 번호: ' + r.wrong.join(', ') }));
    var partStat = {};
    S.items.forEach(function (it, i) {
      var p = it.tag; if (!p) return;
      partStat[p] = partStat[p] || { n: 0, ok: 0 };
      partStat[p].n++; if (isRight(it, S.ans[i])) partStat[p].ok++;
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
    if (r.wrong.length && !PAPER) acts.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '틀린 문제 모아 풀기', onclick: function () { startSet('wrong:all'); } }));
    box.appendChild(acts);
    return box;
  }

  /* ───────── boot ───────── */
  fetch(cfg.base + 'exams.json').then(function (r) { return r.json(); }).then(function (d) {
    EXAMS = d.exams;
    var ex = examList();
    buildShell();
    var savedMode = store('sn:' + SUB + ':mode');
    S.mode = savedMode === 'practice' ? 'practice' : 'exam';
    var sv = store('sn:' + SUB + ':sel');
    if (sv === 'a' || sv === 'b') S.sel = sv;
    if (selSel) selSel.value = S.sel;
    var h = decodeURIComponent((location.hash || '').slice(1));
    var start = /^(exam|part|wrong):/.test(h) ? h : 'exam:' + ex[0].key;
    if (start.indexOf('exam:') === 0 && !examOf(start.slice(5))) start = 'exam:' + ex[0].key;
    if (start.indexOf('part:') === 0 && !partName[start.slice(5)]) start = 'exam:' + ex[0].key;
    startSet(start);
    window.scrollTo(0, 0);
  }).catch(function () {
    root.textContent = '문제 데이터를 불러오지 못했습니다. 로컬에서는 python3 -m http.server로 public/learn을 열어 주세요.';
  });
})();
