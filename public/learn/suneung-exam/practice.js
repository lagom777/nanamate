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
  /* 세부 유형: 파트 안을 한 번 더 나눈 것(exams.json 의 u — 예: 시간과 공간 › 특수 상대성 / 핵반응). 'x' 는 옛 교육과정에만 있던 내용(지금 범위 밖) */
  var topicName = {}, topicPart = {};
  (cfg.parts || []).forEach(function (p) { (p.topics || []).forEach(function (t) { topicName[t.id] = t.name; topicPart[t.id] = p.id; }); });
  function oos(s, n) { return !!(s && s.u) && s.u[n - 1] === 'x'; }
  /* 푼 문제 기록: 문항 id(시험/번호) → [맞았나 1·0, 푼 시각, 고른 답]. 이 기기에 두고, 로그인하면 계정의 풀이 기록(/api/done)과 합친다.
   * 유형·파트 모아 풀기에서 '몇 문제 풀었나'를 세고, 안 푼 문제를 먼저 내는 데 쓴다(시험지형 국어·영어는 쓰지 않는다). */
  var DONE_KEY = 'sn:' + SUB + ':done', DONE = null, doneDirty = false;
  function doneOf(id) { var d = DONE && DONE[id]; return d ? (d[0] ? 1 : 0) : -1; }   // -1 안 풂 · 0 틀림 · 1 맞음
  /* 출처 범위: 수능(대학수학능력시험) · 모의평가(6·9월) · 둘 다(수능이 먼저). 파트·유형 모아 풀기에 걸리고, 기본은 수능 — 수능 문항을 최우선으로 본다. 이 기기에 저장 */
  var SRC_KEY = 'sn:src', SRC_NAME = { csat: '수능', mock: '모의평가', all: '수능+모의평가' };
  var SRC = (function () { var v = store(SRC_KEY); return v === 'mock' || v === 'all' ? v : 'csat'; })();
  function isCsat(e) { return e.kind === 'csat'; }
  function inSrc(e) { return SRC === 'all' || (SRC === 'csat') === isCsat(e); }
  function pickedOf(id) { var d = DONE && DONE[id]; return (d && d[2]) || 0; }   // 그때 고른 답(모르면 0)
  function noteDone(exam, n, ok, ts, picked) {
    if (PAPER || !DONE || !exam || !n) return;
    var id = exam + '/' + n, d = DONE[id];
    ts = +ts || Date.now(); ok = ok ? 1 : 0; picked = +picked || 0;
    if (picked) { var ee = examOf(exam); if (ee && ee[SUB].a[n - 1] != null) ok = isRight(mk(ee, +n), picked) ? 1 : 0; }   // 고른 답이 있으면 지금 정답표로 다시 채점(옛 기록의 맞음·틀림이 정답표 수정 뒤에도 맞게)
    if (d && d[1] > ts) return;
    if (d && d[0] === ok && d[1] === ts && (d[2] || 0) === (picked || d[2] || 0)) return;   // 달라진 것이 없다
    DONE[id] = [ok, ts, picked || (d && d[1] === ts && d[2]) || 0]; doneDirty = true;
  }
  function saveDone() { if (doneDirty) { store(DONE_KEY, DONE); doneDirty = false; } }
  /* 이 세트에서 답을 고르거나 해설을 열었나(처음 차려 준 그대로가 아닌가) */
  function setTouched() {
    var pre = S.pre || [];
    return S.ans.some(function (a, i) { return a !== (pre[i] || 0); }) || Object.keys(S.revealed || {}).length > 0;
  }
  /* 처음 한 번: 이 기기에 남아 있는 채점한 시험과, 아직 계정에 못 보낸 풀이 기록에서 채운다 */
  function loadDone() {
    if (PAPER) return;
    DONE = store(DONE_KEY);
    if (DONE && typeof DONE === 'object') return;
    DONE = {};
    examList().forEach(function (e) {
      var st = store('sn:' + SUB + ':exam:' + e.key);
      if (!st || !st.g || !st.ans) return;
      st.ans.forEach(function (a, i) { if (a) noteDone(e.key, i + 1, isRight(mk(e, i + 1), a), st.t || 1, a); });
    });
    ((window.SnAuth && SnAuth.pending && SnAuth.pending()) || []).forEach(function (r) { if (r && r.sub === SUB) noteDone(r.exam, r.q, r.ok, r.ts, r.picked); });
    doneDirty = true; saveDone();
  }
  /* 계정에 쌓인 풀이 기록(다른 기기에서 푼 것 포함)을 받아 합친다 */
  function doneSync() {
    if (PAPER || !meUser.id || !window.SnAuth || !SnAuth.done) return;
    SnAuth.done(SUB).then(function (rows) {
      (rows || []).forEach(function (r) { noteDone(r.exam, r.q, r.ok, r.ts, r.picked); });
      if (!doneDirty) return;
      saveDone();
      if (/^(part|topic):/.test(S.set) && !setTouched()) startSet(S.set);   // 아직 손대지 않았으면 받은 기록(푼 문제·고른 답)으로 다시 차린다
      else paintTopics();
    }).catch(function () {});
  }
  /* 문항 묶음에서 푼 수·맞은 수: pick(시험의 과목 칸, 번호) 가 참인 문항만 */
  function doneCount(pick) {
    var c = { n: 0, done: 0, ok: 0 };
    examList().filter(inSrc).forEach(function (e) {
      var s = e[SUB];
      for (var n = 1; n <= s.a.length; n++) {
        if (!pick(s, n)) continue;
        c.n++;
        var d = doneOf(e.key + '/' + n);
        if (d >= 0) { c.done++; if (d) c.ok++; }
      }
    });
    return c;
  }
  function partPick(id) { return function (s, n) { return !!s.t && s.t[n - 1] === id && !oos(s, n); }; }
  function topicPick(id) { return function (s, n) { return !!s.u && s.u[n - 1] === id; }; }
  /* 모아 풀기 순서: 안 푼 문제(새 문제 — count 개까지) → 틀렸던 문제 → 맞힌 문제. 묶음 안에서는 섞는다.
   * 전에 푼 문제는 수를 줄이지 않고 다 낸다(그때 고른 답을 다시 볼 수 있게) */
  function freshFirst(items, count) {
    var g = [[], [], []];
    shuffle(items).forEach(function (it) { g[it.prev < 0 ? 0 : it.prev === 0 ? 1 : 2].push(it); });
    g = g.map(function (a) { return a.filter(function (it) { return it.csat; }).concat(a.filter(function (it) { return !it.csat; })); });   // 같은 묶음 안에서는 수능이 먼저
    return (count && count < g[0].length ? g[0].slice(0, count) : g[0]).concat(g[1], g[2]);
  }
  var explainCache = {}, metaCache = {};

  var S = {
    set: '', mode: 'exam', items: [], ans: [], graded: false, timer: false, left: EXAM_SECONDS, tick: null,
    count: 10, revealed: {}, sel: 'a', meta: null, pa: {}, wrongLoading: false, ms: {}, lastActive: null,
    markMode: false, memoOpen: {}, pendingJump: null, wrongRows: null, due: null, dueNext: null
  };
  var hiddenMs = 0, hiddenAt = 0;
  function activeNow() {
    var extra = (document.visibilityState === 'hidden' && hiddenAt) ? (Date.now() - hiddenAt) : 0;
    return Date.now() - hiddenMs - extra;
  }
  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      if (!hiddenAt) hiddenAt = Date.now();
    } else if (hiddenAt) {
      hiddenMs += Date.now() - hiddenAt;
      hiddenAt = 0;
    }
  }
  document.addEventListener('visibilitychange', onVisibility);
  if (document.visibilityState === 'hidden') hiddenAt = Date.now();
  function armClock() {
    S.ms = {};
    S.lastActive = activeNow();
  }
  function stampChoice(i) {
    var now = activeNow();
    if (S.ms[i] == null) {
      var d = now - (S.lastActive == null ? now : S.lastActive);
      if (d < 0) d = 0;
      if (d > 3600000) d = 3600000;
      S.ms[i] = d;
    }
    S.lastActive = now;
  }
  var meUser = null;

  function examList() { return EXAMS.filter(function (e) { return e[SUB]; }); }
  /* 회차 제목의 '(구 교육과정)'은 2022학년도에 체제가 바뀐 국어·수학 기준이다. 한국사는 2017학년도부터 같은 체제라 붙이지 않고,
   * 과학탐구는 2021학년도부터 지금 교육과정(2015 개정) 범위라 2021학년도 시험에는 붙이지 않는다(2018~2020학년도만 옛 범위). */
  var SCI_SUB = /^(phys|chem|bio|earth)[12]$/.test(SUB);
  function etitle(e) { return SUB === 'hist' || (SCI_SUB && +e.year >= 2021) ? e.title.replace(' (구 교육과정)', '') : e.title; }
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
      examList().filter(inSrc).forEach(function (e) {
        (e[SUB].t || []).forEach(function (t, i) { if (t === parts[1] && !oos(e[SUB], i + 1)) items.push(mk(e, i + 1)); });   // 범위 밖(옛 교육과정) 문항은 모아 풀기에 안 넣는다
      });
      items = freshFirst(items, S.count);
    } else if (parts[0] === 'topic') {
      examList().filter(inSrc).forEach(function (e) {
        (e[SUB].u || []).forEach(function (u, i) { if (u === parts[1]) items.push(mk(e, i + 1)); });
      });
      items = freshFirst(items, S.count);
    } else if (parts[0] === 'wrong') {
      var w = store('sn:' + SUB + ':wrong') || [];
      w.forEach(function (id) {
        var p = id.split('/'), e2 = examOf(p[0]);
        if (e2) items.push(mk(e2, +p[1]));
      });
      items = shuffle(withUnsure(items));
    }
    return items;
  }
  function wrongItems(rows) {
    var items = [];
    (rows || []).forEach(function (r) {
      var e2 = examOf(r.exam);
      if (e2 && +r.q) items.push(mk(e2, +r.q));
    });
    return shuffle(withUnsure(items));
  }
  /* 아래쪽 그림 선지(그래프·사진)가 잘려 있던 문항 그림을 다시 자른 것(crop.py 가 그림 블록을 문항 몸체로 안 세던 문제) — R2 에 다시 올리기 전까지
   * 사이트의 suneung-exam/fix/ 에서 준다. AI 도 그림을 주소로 받으므로 절대 주소로 */
  var IMG_FIX = { chem1: '2023-jun/19', chem2: '2026-csat/1 2026-jun/15', earth1: '2022-csat/16 2024-sep/17', phys1: '2022-jun/10 2022-sep/17 2023-jun/10 2023-sep/10 2023-sep/2 2024-csat/17 2024-sep/13 2027-sep/10', phys2: '2024-csat/5 2024-jun/5 2025-csat/7 2025-jun/6 2026-sep/15 2027-jun/11' };
  function imgFixed(key, n) { var l = IMG_FIX[SUB]; return !!l && (' ' + l + ' ').indexOf(' ' + key + '/' + n + ' ') >= 0; }
  function mk(e, n) {
    var s = e[SUB];
    return {
      id: e.key + '/' + n, ex: e.key, title: etitle(e), n: n, ans: s.a[n - 1], pts: s.p[n - 1], tag: s.t && !oos(s, n) ? s.t[n - 1] : null,
      tp: s.u && topicName[s.u[n - 1]] ? s.u[n - 1] : null, oos: oos(s, n), csat: isCsat(e), prev: doneOf(e.key + '/' + n), pp: pickedOf(e.key + '/' + n),
      num: !!(s.n && s.n.indexOf(n) >= 0),
      img: imgFixed(e.key, n) ? new URL(cfg.base + 'fix/' + e.key + '/' + SUB + '/q' + pad(n) + '.webp', location.href).href
        : (cfg.imgBase || cfg.base) + e.key + '/' + SUB + '/q' + pad(n) + '.webp'
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
  var fab, bar, list, omr, timerEl, progEl, setSel, selSel, modeBtns = {}, countSel, countWrap, topicRow, setOpts = [], setGroup = null, setGroupBase = '', scopeWrap = null, scopeBtns = {}, authBox, exportMsg, exportTimer, exporting = false, dueBtn = null, dueOpt = null, omrClock = null;

  var COLS_KEY = 'sn:pr:cols';
  function paintCols() {
    var n = String(store(COLS_KEY) || '');
    for (var k = 1; k <= 4; k++) root.classList.toggle('pr-cols-' + k, n === String(k));
  }
  function buildShell() {
    root.innerHTML = '';
    var ex = examList();
    setSel = el('select', { 'aria-label': '문제 세트', onchange: function () { startSet(setSel.value); } });
    var gC = el('optgroup', { label: '수능 (' + QN + '문항 · ' + (EXAM_SECONDS / 60) + '분)' });
    var gM = el('optgroup', { label: '모의평가 6월·9월 (' + QN + '문항 · ' + (EXAM_SECONDS / 60) + '분)' });
    ex.forEach(function (e) { (isCsat(e) ? gC : gM).appendChild(el('option', { value: 'exam:' + e.key, text: etitle(e) })); });
    if (gC.children.length) setSel.appendChild(gC);
    if (gM.children.length) setSel.appendChild(gM);
    if (HAS_PARTS && !PAPER) {
      var hasTopics = cfg.parts.some(function (p) { return p.topics && p.topics.length; });
      var g2 = el('optgroup', { label: (hasTopics ? '파트·유형별' : '파트별') + ' 모아 풀기' });
      setGroup = g2; setGroupBase = (hasTopics ? '파트·유형별' : '파트별') + ' 모아 풀기';
      cfg.parts.forEach(function (p) {
        var c = 0;
        var po = el('option', { value: 'part:' + p.id, text: p.name });
        g2.appendChild(po); setOpts.push({ el: po, name: p.name, pick: partPick(p.id) });
        (p.topics || []).forEach(function (tp) {
          var k = 0; ex.forEach(function (e) { (e[SUB].u || []).forEach(function (u) { if (u === tp.id) k++; }); });
          if (!k) return;
          var to = el('option', { value: 'topic:' + tp.id, text: '\u00a0\u00a0\u00a0└ ' + tp.name });
          g2.appendChild(to); setOpts.push({ el: to, name: '\u00a0\u00a0\u00a0└ ' + tp.name, pick: topicPick(tp.id) });
        });
      });
      setSel.appendChild(g2);
    }
    if (!PAPER) {
      var g3 = el('optgroup', { label: '내 오답' });
      g3.appendChild(el('option', { value: 'wrong:all', text: '틀린·헷갈린 문제 다시 풀기' }));
      g3.appendChild(dueOpt = el('option', { value: 'due:today', text: '오늘 다시 풀 오답' }));
      setSel.appendChild(g3);
    }

    modeBtns.exam = el('button', { type: 'button', class: 'pr-seg', text: '시험 모드', onclick: function () { setMode('exam'); } });
    modeBtns.practice = el('button', { type: 'button', class: 'pr-seg', text: '연습 모드', onclick: function () { setMode('practice'); } });
    countSel = el('select', { 'aria-label': '출제 수', onchange: function () { S.count = +countSel.value; startSet(setSel.value); } }, [
      el('option', { value: '10', text: '10문항' }), el('option', { value: '20', text: '20문항' }), el('option', { value: '0', text: '전체' })
    ]);
    countSel.value = '10'; S.count = 10;
    countWrap = el('label', { class: 'pr-count', title: '파트·유형 모아 풀기에서 한 번에 낼 새 문제 수(전에 푼 문제는 그 아래에 모두 나와요)' }, ['새 문제 ', countSel]);
    if (HAS_PARTS && !PAPER) {
      scopeWrap = el('div', { class: 'pr-segs pr-scope', role: 'group', 'aria-label': '출처 범위', title: '파트·유형 모아 풀기에서 어느 시험의 문제를 낼지' });
      [['csat', '수능', '대학수학능력시험 문제만'], ['mock', '모의평가', '6월·9월 모의평가 문제만'], ['all', '둘 다', '수능 문제를 먼저, 이어서 모의평가 문제']].forEach(function (o) {
        scopeBtns[o[0]] = el('button', { type: 'button', class: 'pr-seg', text: o[1], title: o[2], onclick: function () { setScope(o[0]); } });
        scopeWrap.appendChild(scopeBtns[o[0]]);
      });
    }
    var row1 = [setSel];
    if (SUB === 'korean') {
      selSel = el('select', { 'aria-label': '선택과목', onchange: function () { S.sel = selSel.value; store('sn:' + SUB + ':sel', S.sel); startSet(setSel.value, true); } }, [
        el('option', { value: 'a', text: '선택과목: 화법과 작문' }), el('option', { value: 'b', text: '선택과목: 언어와 매체' })
      ]);
      row1.push(selSel);
    } else row1.push(countWrap);
    if (scopeWrap) row1.push(scopeWrap);
    /* 가로 줄 수: 문제(시험지 단·문항 칸)를 가로로 몇 줄 놓을지 — 자동(화면 폭에 맞게: 보통 2줄, 아주 넓으면 4줄) 또는 1~4줄. 이 기기에 저장 */
    var colsSel = el('select', { 'aria-label': '문제를 가로로 몇 줄 놓을지', title: '문제를 가로로 몇 줄 놓을지 (이 기기에 저장)', onchange: function () { store(COLS_KEY, colsSel.value || null); paintCols(); } },
      [['', '자동'], ['1', '1줄'], ['2', '2줄'], ['3', '3줄'], ['4', '4줄']].map(function (o) { return el('option', { value: o[0], text: o[1] }); }));
    colsSel.value = /^[1-4]$/.test(String(store(COLS_KEY))) ? String(store(COLS_KEY)) : '';
    row1.push(el('label', { class: 'pr-count pr-cols' }, ['가로 ', colsSel]));
    paintCols();
    timerEl = el('button', { type: 'button', class: 'pr-timer', onclick: toggleTimer, 'aria-label': '타이머 켜기/끄기' });
    inkBtn = el('button', { type: 'button', class: 'pr-timer pr-weak-btn pr-ink-btn', title: '시험지·문항 그림에 낙서해요(이 기기에 저장). 펜슬은 그냥 쓰고 마우스는 끌면 써져요. 손가락은 이 단추를 켜야 써지고, 켜 둔 동안 두 손가락으로 화면을 움직여요. 형광펜·지우개도 여기서.', onclick: function () { toggleInk(); } });
    progEl = el('span', { class: 'pr-prog' });
    bar = el('div', { class: 'pr-bar' }, [
      el('div', { class: 'pr-bar-row' }, row1),
      topicRow = el('div', { class: 'pr-bar-row pr-topics', role: 'group', 'aria-label': '세부 유형' }),
      el('div', { class: 'pr-bar-row' }, [el('div', { class: 'pr-segs', role: 'group', 'aria-label': '모드' }, [modeBtns.exam, modeBtns.practice]), timerEl, inkBtn, weakBtn = el('button', { type: 'button', class: 'pr-timer pr-weak-btn', onclick: function () { openWeak(); } }), el('button', { type: 'button', class: 'pr-timer pr-weak-btn pr-nb-btn', text: '📋 오답 노트', onclick: openNotebook }), el('button', { type: 'button', class: 'pr-timer pr-weak-btn', text: '📊 오답 원인', onclick: openCauses }), dueBtn = el('button', { type: 'button', class: 'pr-timer pr-weak-btn pr-due-btn', text: '📅 오늘 다시 풀', onclick: openDue }), progEl])
    ]);
    authBox = el('div', { class: 'pr-auth' });
    bar.appendChild(authBox);
    list = el('div', { class: 'pr-list' + (PAPER ? ' paper' : '') });
    omr = el('div', { class: 'pr-omr', role: 'complementary', 'aria-label': '답안지' });
    root.appendChild(bar);
    renderWeakBtn();
    root.appendChild(el('div', { class: 'pr-body' + (PAPER ? ' paper' : '') }, [list, omr]));
    if (PAPER) {
      fab = el('button', { type: 'button', class: 'pr-fab', text: '📝 답안지', onclick: function () { toggleOmr(undefined, true); } });
      root.appendChild(fab);
    }
    root.appendChild(inkPal = inkPalette());
    root.appendChild(el('button', { type: 'button', class: 'pr-ink-fab', title: '손가락으로 낙서하려면 ✏️ 낙서를 켜요', 'aria-label': '✏️ 낙서 켜기', text: '✏️', onclick: function () { toggleInk(true); } }));   // 휴대폰: 위 막대가 스크롤로 사라져도 켤 수 있게
    paintInk();
    document.body.classList.add('pr-wide-page');   // 목차를 접고 본문 칸 가득 — 그림은 키우지 않고 넓으면 옆으로 나란히(practice.css)
    root.appendChild(el('p', { class: 'pr-src', html: '문항 출처: 한국교육과정평가원(KICE) 대학수학능력시험·6월/9월 모의평가 공개 문제지. 문제지에 관한 저작권은 한국교육과정평가원에 있으며, 이 페이지는 학습용으로 문항 이미지를 그대로 보여 주고 정답표로 채점합니다.' + (HAS_PARTS ? ' 파트 분류는 문항 내용 기반 자동 분류라 일부 오차가 있을 수 있습니다.' : '') + (PAPER && SUB === 'english' ? ' 듣기 음성은 평가원이 공개한 듣기평가 음원(저작권 한국교육과정평가원)을 회차마다 한 파일로 이은 것으로 시험지 위 🎧 막대에서 들을 수 있고, 채점 후 듣기평가 대본을 볼 수 있습니다.' : '') + (ABS_CUT[SUB] ? '' : ' 채점 후 등급은 <a href="https://www.ebsi.co.kr/ebs/xip/xipa/retrievePastGrdCutWrongAnswerRate.ebs?tab=1" target="_blank" rel="noopener">EBSi 역대 등급컷</a>(원점수는 EBSi 자체분석, 표준점수는 평가원) 기준 예상입니다.' + (SUB === 'korean' || SUB === 'math' ? ' 2022학년도부터 국어·수학은 선택과목별 원점수 컷이 공개되지 않아, 시험 직후 입시업체가 발표한 가채점 예상컷(위 몇 등급)으로 보여 줍니다.' : '')) }));
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
      if (S.left === 0) timeUp();   // 시간이 끝나도 채점하거나 잠그지 않는다 — 답은 계속 고르고, 넘친 시간은 +로 센다
      renderBar();
    }, 1000);
  }
  function stopTimer() { if (S.tick) clearInterval(S.tick); S.tick = null; S.timer = false; }
  function fmtClock(s) { return s > 0 ? fmtTime(s) : '+' + fmtTime(-s); }
  function timeUp() {
    var t = el('div', { class: 'pr-toast', role: 'status', text: '⏰ 시험 시간이 끝났어요. 답은 계속 고를 수 있어요 — 다 고르면 ‘제출하고 채점하기’를 누르세요. 넘긴 시간은 +로 셉니다.' });
    t.onclick = function () { t.remove(); };
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 9000);
  }

  function refreshAuth() {
    if (!authBox) return;
    authBox.textContent = '';
    if (!window.SnAuth) return;
    if (meUser && meUser.id) {
      authBox.appendChild(el('span', { class: 'pr-auth-name', text: (meUser.nickname || '학생') + '님 · ' }));
      authBox.appendChild(el('button', { type: 'button', class: 'pr-auth-out', text: '로그아웃', onclick: function () {
        SnAuth.logout().then(function () {
          meUser = { id: null };
          refreshAuth();
          if (S.set.indexOf('wrong:') === 0) startSet(S.set);
        });
      } }));
      authBox.appendChild(el('button', { type: 'button', class: 'pr-btn pr-ai-cta', text: '🤖 이 과목 AI 분석', onclick: askSubject }));
      authBox.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '분석용 PDF', onclick: function () { exportHtml(); } }));
      authBox.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '분석용 MD 복사', onclick: function () { exportMarkdown('copy'); } }));
      authBox.appendChild(el('button', { type: 'button', class: 'pr-btn', text: 'MD 다운로드', onclick: function () { exportMarkdown('download'); } }));
      exportMsg = el('span', { class: 'pr-auth-msg', 'aria-live': 'polite' });
      authBox.appendChild(exportMsg);
      authBox.appendChild(el('span', { class: 'pr-auth-note', text: '틀린 문제가 계정에 저장됩니다' }));
    } else {
      exportMsg = null;
      authBox.appendChild(el('button', { type: 'button', class: 'pr-kakao', text: '카카오로 로그인', onclick: function () { SnAuth.login(); } }));
    }
  }
  function migrateWrong() {
    if (!meUser || !meUser.id || !window.SnAuth || store('sn:' + SUB + ':migrated')) return Promise.resolve();
    var local = store('sn:' + SUB + ':wrong') || [];
    return SnAuth.wrong(SUB).then(function (rows) {
      if (!Array.isArray(rows)) return;
      var have = {};
      rows.forEach(function (r) { have[r.exam + '/' + r.q] = 1; });
      var ts = Date.now(), extra = [];
      local.forEach(function (id) {
        if (have[id]) return;
        var p = String(id).split('/');
        var q = parseInt(p[1], 10);
        if (!/^[0-9]{4}-(csat|jun|sep)$/.test(p[0]) || !q) return;
        extra.push({ exam: p[0], sub: SUB, q: q, picked: 0, ok: 0, ts: ts });
      });
      var mark = function () { store('sn:' + SUB + ':migrated', 1); };
      if (!extra.length) { mark(); return; }
      return SnAuth.record(extra).then(mark);
    }).catch(function () {});
  }
  /* 비슷한 문제 모아 풀기: 같은 파트 문제를 여러 시험에서 뽑은 세트로(출제 10·20·전체는 위 막대에서) */
  function goTopic(t) {
    if (aiDlg && aiDlg.open) aiDlg.close();
    if (setSel) setSel.value = 'topic:' + t;
    startSet('topic:' + t);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  /* 파트·유형 세트를 풀 때 위 막대에 그 파트의 유형 칩: 전체 | 유형 … (눌러서 바로 옮겨 간다) */
  function paintTopics() {
    if (!topicRow) return;
    paintSetCounts();
    topicRow.innerHTML = '';
    var sp = S.set.split(':'), pid = sp[0] === 'part' ? sp[1] : sp[0] === 'topic' ? topicPart[sp[1]] : null;
    var part = pid && (cfg.parts || []).filter(function (p) { return p.id === pid; })[0];
    if (!part || !part.topics || !part.topics.length) { topicRow.style.display = 'none'; return; }
    topicRow.style.display = '';
    var cur = null;
    var chip = function (id, text, on, c) {
      if (on) cur = c;
      return el('button', { type: 'button', class: 'pr-topic' + (c.n && c.done === c.n ? ' all' : ''), 'aria-pressed': on ? 'true' : 'false', title: c.n + '문항 중 ' + c.done + '문항 풂', onclick: function () { if (on) return; setSel.value = id; startSet(id); } },
        [text, el('span', { class: 'pr-topic-n', text: c.done + '/' + c.n })]);
    };
    topicRow.appendChild(el('span', { class: 'pr-topics-lab', text: part.name + ' ›' }));
    topicRow.appendChild(chip('part:' + pid, '전체', sp[0] === 'part', doneCount(partPick(pid))));   // (이 파트 안에서의 전체 — 출처 범위는 위 ‘수능·모의평가’ 단추)
    part.topics.forEach(function (t) { topicRow.appendChild(chip('topic:' + t.id, t.name, sp[0] === 'topic' && sp[1] === t.id, doneCount(topicPick(t.id)))); });
    if (cur) {
      topicRow.appendChild(el('span', { class: 'pr-topics-sum', html: '<em class="pr-src-name">' + SRC_NAME[SRC] + '</em> 푼 문제 <b>' + cur.done + '</b> / ' + cur.n + (cur.done ? ' · 맞음 ' + cur.ok + ' · 틀림 ' + (cur.done - cur.ok) : '') + (cur.done < cur.n ? ' · 새 문제가 먼저, 푼 문제는 아래에' : cur.n ? ' · 다 풀었어요 🎉' : '') }));
      if (cur.n && cur.done >= cur.n && SRC === 'csat') topicRow.appendChild(el('button', { type: 'button', class: 'pr-topic more', text: '모의평가 문제까지 풀기 →', onclick: function () { setScope('all'); } }));
    }
  }
  /* 세트 고르기 목록의 파트·유형 줄에도 문항 수와 푼 수(고른 출처 범위 기준) */
  function paintSetCounts() {
    setOpts.forEach(function (o) {
      var c = doneCount(o.pick), t = o.name + ' (' + c.n + '문항' + (c.done ? ' · ' + c.done + ' 풂' : '') + ')';
      if (o.el.textContent !== t) o.el.textContent = t;
    });
    if (setGroup) setGroup.label = setGroupBase + ' — ' + SRC_NAME[SRC];
  }
  function setScope(v) {
    if (v === SRC) return;
    SRC = v; store(SRC_KEY, v);
    if (/^(part|topic):/.test(S.set)) startSet(S.set); else { renderBar(); }
  }
  function goPart(p) {
    if (aiDlg && aiDlg.open) aiDlg.close();
    if (setSel) setSel.value = 'part:' + p;
    startSet('part:' + p);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  var redoSet = false;   // ‘다시 풀기’로 연 세트는 전에 고른 답을 채우지 않는다
  function startSet(setId, keepAns) {
    stopTimer();
    armClock();
    S.wrongLoading = false;
    S.set = setId;
    var isExam = setId.indexOf('exam:') === 0;
    if (PAPER) {
      S.graded = false; S.sent = null; S.regrade = false; S.left = EXAM_SECONDS; S.usedTimer = false; S.revealed = {};
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
        if (saved && saved.g && (saved.gs || '') === (S.sel || '')) restoreGraded(saved);
        armClock();
        renderAll();
        if (!keepAns) window.scrollTo && root.scrollIntoView && root.scrollIntoView({ block: 'start' });
        takeJump();
      }).catch(function () { list.textContent = '시험지 데이터를 불러오지 못했습니다.'; });
      return;
    }
    if (setId.indexOf('due:') === 0) {
      S.items = [];
      S.ans = [];
      S.graded = false; S.sent = null; S.regrade = false; S.left = EXAM_SECONDS; S.revealed = {}; S.usedTimer = false;
      S.mode = 'practice';
      S.wrongLoading = !!(meUser && meUser.id && window.SnAuth);
      setSel.value = setId;
      try { history.replaceState(null, '', '#' + encodeURIComponent(setId)); } catch (e) {}
      renderAll();
      if (!S.wrongLoading) return;
      var reqD = setId;
      SnAuth.due(SUB).then(function (j) {
        if (S.set !== reqD) return;
        S.wrongLoading = false;
        setDue(j);
        S.items = dueItems();
        S.ans = S.items.map(function () { return 0; });
        armClock();
        renderAll();
        window.scrollTo && root.scrollIntoView && root.scrollIntoView({ block: 'start' });
      }).catch(function () { if (S.set !== reqD) return; S.wrongLoading = false; renderAll(); });
      return;
    }
    if (setId.indexOf('wrong:') === 0 && meUser && meUser.id && window.SnAuth) {
      S.items = [];
      S.ans = [];
      S.graded = false; S.sent = null; S.regrade = false; S.left = EXAM_SECONDS; S.revealed = {}; S.usedTimer = false;
      S.mode = 'practice';
      S.wrongLoading = true;
      setSel.value = setId;
      try { history.replaceState(null, '', '#' + encodeURIComponent(setId)); } catch (e) {}
      renderAll();
      var req = setId;
      SnAuth.wrong(SUB).then(function (rows) {
        if (S.set !== req) return;
        S.wrongLoading = false;
        S.items = wrongItems(rows);
        S.ans = S.items.map(function () { return 0; });
        armClock();
        renderAll();
        window.scrollTo && root.scrollIntoView && root.scrollIntoView({ block: 'start' });
      }).catch(function () {
        if (S.set !== req) return;
        S.wrongLoading = false;
        S.items = buildItems(req);
        S.ans = S.items.map(function () { return 0; });
        armClock();
        renderAll();
      });
      return;
    }
    S.items = buildItems(setId);
    S.ans = S.items.map(function () { return 0; });
    S.graded = false; S.sent = null; S.regrade = false; S.left = EXAM_SECONDS; S.revealed = {}; S.usedTimer = false;
    if (!isExam && S.mode === 'exam') S.mode = 'practice';
    /* 파트·유형 모아 풀기: 전에 푼 문제는 그때 고른 답을 그대로 보여 준다(‘다시 풀기’를 누르면 비운다) */
    if (/^(part|topic):/.test(setId) && !redoSet) S.items.forEach(function (it, i) { if (it.prev >= 0 && it.pp) S.ans[i] = it.pp; });
    redoSet = false;
    S.pre = S.ans.slice();
    if (isExam) {
      var sv = store('sn:' + SUB + ':' + setId);
      if (sv && sv.ans && sv.ans.length === S.items.length) { S.ans = sv.ans; if (sv.g) restoreGraded(sv); }
    }
    setSel.value = setId;
    try { history.replaceState(null, '', '#' + encodeURIComponent(setId)); } catch (e) {}
    renderAll();
    window.scrollTo && root.scrollIntoView && root.scrollIntoView({ block: 'start' });
    takeJump();
  }

  function persist() {
    if (S.set.indexOf('exam:') !== 0) return;
    var g = S.graded ? { g: 1, gs: S.sel || '', left: S.left, ut: S.usedTimer ? 1 : 0 } : {};   // 채점했으면 그것도(국어는 선택과목까지)
    g.t = Date.now();   // 고친 시각 — 계정에 둔 것과 견줘 늦은 쪽을 남긴다
    if (PAPER) {
      S.items.forEach(function (it, i) { S.pa[it.id] = S.ans[i]; });
      store('sn:' + SUB + ':' + S.set, Object.assign({ pa: S.pa }, g));
    } else store('sn:' + SUB + ':' + S.set, Object.assign({ ans: S.ans }, g));
    psUp(S.set);
  }

  /* ───────── 풀이 상태를 계정에도: 고른 답·채점 여부는 이 기기에 바로 저장하고, 로그인하면 계정(/api/pstate)과 맞춘다
   * — 컴퓨터에서 푼 시험이 폰에서도 그대로 보이게. 회차마다 고친 시각(t)이 늦은 쪽을 남긴다.
   * 동기화 전부터 이 기기에 있던 기록(t 없음)은 한 번만: 계정 것과 견줘 더 많이 푼 쪽을 남긴다 */
  var psTimers = {}, psAt = 0, psBusy = false;
  function psOn() { return !!(meUser && meUser.id && window.SnAuth && SnAuth.examStates); }
  function psKey(id) { return 'sn:' + SUB + ':' + id; }
  function psBody(v) {
    var o = {};
    if (!v) return o;
    if (v.ans) o.ans = v.ans;
    if (v.pa) o.pa = v.pa;
    if (v.g) { o.g = 1; o.gs = v.gs || ''; if (typeof v.left === 'number') o.left = v.left; o.ut = v.ut ? 1 : 0; }
    return o;
  }
  function psCount(v) {   // 얼마나 풀었나: 고른 답 수(채점까지 했으면 더 크게)
    if (!v) return 0;
    var n = 0;
    if (v.ans) v.ans.forEach(function (a) { if (a) n++; });
    if (v.pa) Object.keys(v.pa).forEach(function (k) { if (v.pa[k]) n++; });
    return n + (v.g ? 1000 : 0);
  }
  function psSend(id, keep) {
    if (psTimers[id]) { clearTimeout(psTimers[id]); delete psTimers[id]; }
    if (!psOn()) return Promise.resolve();
    var v = store(psKey(id));
    return SnAuth.saveExamState(SUB, id, psBody(v), (v && v.t) || Date.now(), keep).catch(function () {});
  }
  function psUp(id) {   // 답을 고를 때마다 보내지 않게 잠깐 모았다가
    if (!psOn()) return;
    if (psTimers[id]) clearTimeout(psTimers[id]);
    psTimers[id] = setTimeout(function () { psSend(id); }, 1500);
  }
  function psFlush() { Object.keys(psTimers).forEach(function (id) { psSend(id, true); }); }   // 화면을 떠날 때: 아직 안 보낸 것을 바로
  function psReset(id) {   // 다시 풀기: 이 기기 것을 지우고, 계정에도 빈 상태를 남긴다(다른 기기의 옛 답이 되살아나지 않게)
    store(psKey(id), psOn() ? { t: Date.now() } : null);
    psSend(id);
  }
  function psTake(row) {
    var v = Object.assign({}, row.data, { t: row.ts });
    store(psKey(row.id), v);
    if (S.set !== row.id) return;
    // 지금 보고 있는 회차면 화면도 바꾼다
    if (PAPER) {
      if (v.g && (v.gs === 'a' || v.gs === 'b') && v.gs !== S.sel && SUB === 'korean') { S.sel = v.gs; store('sn:' + SUB + ':sel', S.sel); if (selSel) selSel.value = S.sel; }
      startSet(S.set, true);
      return;
    }
    stopTimer();
    S.graded = false; S.sent = null; S.regrade = false; S.left = EXAM_SECONDS; S.revealed = {}; S.usedTimer = false;
    S.ans = v.ans && v.ans.length === S.items.length ? v.ans.slice() : S.items.map(function () { return 0; });
    if (v.g && v.ans && v.ans.length === S.items.length) restoreGraded(v);
    armClock();
    renderAll();
  }
  function psSync() {
    if (!psOn() || psBusy) return;
    psBusy = true;
    psAt = Date.now();
    SnAuth.examStates(SUB).then(function (rows) {
      var seen = {}, up = [];
      (rows || []).forEach(function (row) {
        if (!row || typeof row.id !== 'string' || row.id.indexOf('exam:') !== 0 || !row.data) return;
        seen[row.id] = 1;
        var cur = store(psKey(row.id));
        if (cur && !cur.t) {   // 동기화 전 기록
          if (psCount(cur) >= psCount(row.data)) { cur.t = Date.now(); store(psKey(row.id), cur); up.push(row.id); return; }
        } else if (cur && cur.t >= row.ts) { if (cur.t > row.ts) up.push(row.id); return; }
        psTake(row);
      });
      examList().forEach(function (e) {   // 계정에 아직 없는 이 기기 기록
        var id = 'exam:' + e.key;
        if (seen[id]) return;
        var cur = store(psKey(id));
        if (!cur || !psCount(cur)) return;
        if (!cur.t) { cur.t = Date.now(); store(psKey(id), cur); }
        up.push(id);
      });
      var next = function () { var id = up.shift(); if (id) return psSend(id).then(next); };
      return next();
    }).catch(function () {}).then(function () { psBusy = false; });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') psFlush();
    else if (psAt && Date.now() - psAt > 30000) { psSync(); doneSync(); }   // 다른 기기에서 푼 것이 있으면 받아 온다
  });
  window.addEventListener('pagehide', psFlush);

  /* ───────── render ───────── */
  function renderBar() {
    modeBtns.exam.setAttribute('aria-pressed', S.mode === 'exam');
    modeBtns.practice.setAttribute('aria-pressed', S.mode === 'practice');
    var isExam = S.set.indexOf('exam:') === 0;
    var inGroup = S.set.indexOf('part:') === 0 || S.set.indexOf('topic:') === 0;
    if (!PAPER || SUB !== 'korean') countWrap.style.display = inGroup ? '' : 'none';
    if (scopeWrap) { scopeWrap.style.display = inGroup ? '' : 'none'; Object.keys(scopeBtns).forEach(function (k) { scopeBtns[k].setAttribute('aria-pressed', k === SRC); }); }
    paintTopics();
    modeBtns.exam.disabled = !isExam;
    var done = S.ans.filter(Boolean).length;
    progEl.textContent = '푼 문항 ' + done + ' / ' + S.items.length;
    if (S.mode === 'exam' && isExam && !S.graded) {
      timerEl.style.display = '';
      var over = S.left <= 0;
      timerEl.textContent = (over ? '⏰ 시간 끝 ' : S.tick ? '⏱ ' : '⏱ 타이머 시작 ') + fmtClock(S.left);
      timerEl.classList.toggle('on', !!S.tick && !over);
      timerEl.classList.toggle('over', over);
    } else timerEl.style.display = 'none';
    paintClock();
  }

  function paintClock() {
    if (!omrClock) return;
    omrClock.textContent = S.tick && !S.graded ? (S.left > 0 ? '⏱ ' : '⏰ 시간 끝 ') + fmtClock(S.left) : '';
    omrClock.classList.toggle('over', S.left <= 0);
  }
  function renderAll() {
    renderBar();
    list.innerHTML = '';
    var tip = inkTip();
    if (tip) list.appendChild(tip);
    if (PAPER) renderPaper();
    else {
      if (!S.items.length) {
        if (/^(part|topic):/.test(S.set)) {
          list.appendChild(el('p', { class: 'pr-empty', text: SRC === 'all' ? '이 파트·유형으로 분류된 문제가 아직 없습니다.' : '이 파트·유형은 ' + SRC_NAME[SRC] + ' 문제에는 아직 나오지 않았습니다. 위의 출처 범위를 바꿔 보세요.' }));
        } else if (S.set.indexOf('due:') === 0) list.appendChild(el('p', { class: 'pr-empty', text: S.wrongLoading ? '오늘 다시 풀 문제를 불러오는 중…' : meUser && meUser.id ? '오늘 다시 풀 오답이 없습니다 ✓ 틀리거나 헷갈린 문제는 1·3·7일 뒤에 여기로 돌아옵니다.' : '로그인하면 틀리거나 헷갈린 문제를 1·3·7일 뒤에 다시 풀도록 날짜별로 챙겨 드립니다.' }));
        else list.appendChild(el('p', { class: 'pr-empty', text: S.wrongLoading ? '오답을 불러오는 중…' : '아직 저장된 오답이 없습니다. 문제를 풀고 채점하면 틀린 문항이, 🤔 헷갈림을 눌러 두면 맞힌 문항도 여기에 모입니다.' }));
      }
      var gap = /^(part|topic):/.test(S.set) ? S.items.filter(function (it) { return it.prev >= 0; }).length : 0;
      S.items.forEach(function (it, i) {
        if (gap && it.prev >= 0 && (i === 0 || S.items[i - 1].prev < 0)) list.appendChild(el('div', { class: 'pr-prev-head', text: '✔ 전에 푼 문제 ' + gap + '개 — 그때 고른 답이 그대로 보여요 (틀렸던 문제 먼저)' }));
        list.appendChild(card(it, i));
      });
    }
    renderOmr();
  }

  function isShown(i) {
    if (S.revealed[i] !== undefined) return S.revealed[i];
    return S.graded || (S.mode === 'practice' && S.ans[i]);
  }
  /* 문항 하나만 채점·해설 열기/접기 (시험 모드에서도 가능) */
  function toggleReveal(i) {
    var open = !isShown(i);
    S.revealed[i] = open;
    if (open) sendAttempt(i);
    if (!PAPER) refreshCard(i);
    renderOmr();
  }
  function stateCls(it, i) {
    if (!isShown(i)) return '';
    return isRight(it, S.ans[i]) ? ' ok' : ' bad';   // 못 푼 문제도 틀린 것
  }

  function card(it, i) {
    var shown = isShown(i);
    var c = el('article', { class: 'pr-card' + stateCls(it, i) + (unsureOf(it) ? ' unsure' : ''), id: 'q-' + i });
    var head = el('div', { class: 'pr-card-head' }, [
      el('span', { class: 'pr-no', text: (i + 1) }),
      el('span', { class: 'pr-meta', text: it.title + ' · ' + it.n + '번 · ' + it.pts + '점' }),
      it.oos ? el('span', { class: 'pr-tag pr-tag-oos', title: '옛 교육과정(2020학년도까지) 시험에만 나오던 내용이라 지금 수능 범위가 아닙니다. 모아 풀기에는 나오지 않아요.', text: '지금 범위 밖 · 옛 교육과정' }) : null,
      it.tag && partName[it.tag] ? el('a', { class: 'pr-tag', href: partHref[it.tag] || '#', text: partName[it.tag] + (it.tp ? ' › ' + topicName[it.tp] : '') }) : null,
      HAS_PARTS && !PAPER && it.tp ? (S.set !== 'topic:' + it.tp ? el('button', { type: 'button', class: 'pr-tag pr-tag-go', title: topicName[it.tp] + ' 문제만 여러 시험에서 모아 풀기', text: '🔁 이 유형 더 풀기', onclick: function () { goTopic(it.tp); } }) : null)
        : HAS_PARTS && !PAPER && it.tag && partName[it.tag] && S.set !== 'part:' + it.tag ? el('button', { type: 'button', class: 'pr-tag pr-tag-go', title: partName[it.tag] + ' 문제를 여러 시험에서 모아 풀기', text: '🔁 이 파트 더 풀기', onclick: function () { goPart(it.tag); } }) : null,
      it.prev >= 0 && S.set.indexOf('exam:') !== 0 ? el('span', { class: 'pr-done-tag ' + (it.prev ? 'ok' : 'no'), title: '이 문제를 전에 풀었어요(마지막 결과)', text: it.prev ? '✔ 전에 풂 · 맞음' : '✔ 전에 풂 · 틀림' }) : null,
      it.dueInfo ? el('span', { class: 'pr-due-tag', text: '📅 ' + dueText(it.dueInfo) }) : null,
      unsureOf(it) ? el('span', { class: 'pr-unsure-tag', text: '🤔 헷갈림' }) : null,
      causeOf(it) ? el('span', { class: 'pr-cause-tag', text: CAUSE_NAME[causeOf(it)] }) : null
    ]);
    var img = el('img', { class: 'pr-img', src: it.img, alt: it.title + ' ' + it.n + '번 문항', loading: 'lazy', decoding: 'async' });
    var ib = inkWrap(img, inkKey(it.ex, 'q' + pad(it.n)), 0, 0, true), hz = hotOfItem(it);
    if (hz) hotAdd(ib, hz.list, hz.w, hz.h);   // 문항 그림의 ①~⑤ 를 눌러도 고른다
    c.appendChild(head); c.appendChild(el('div', { class: 'pr-paper' }, [ib]));
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
    c.appendChild(el('div', { class: 'pr-chk-row' }, [
      el('button', { type: 'button', class: 'pr-chk-btn' + (shown ? ' on' : ''), text: shown ? '해설 접기' : '이 문제 채점 · 해설 보기', onclick: function () { toggleReveal(i); } }),
      shown ? null : el('button', { type: 'button', class: 'pr-chk-btn pr-hint-btn', text: '💡 힌트만', title: '정답은 숨기고 실마리만', onclick: function () { askHint(i); } }),
      el('button', { type: 'button', class: 'pr-chk-btn pr-ai-btn', text: '🤖 AI 해설' + (shown && S.ans[i] && !isRight(it, S.ans[i]) ? ' · 내 실수 분석' : ''), onclick: function () { askItem(i); } }),
      el('button', { type: 'button', class: 'pr-chk-btn pr-unsure-btn', 'aria-pressed': unsureOf(it) ? 'true' : 'false', title: '맞았어도 확신이 없었으면 — 틀린·헷갈린 문제 다시 풀기에 들어갑니다', text: '🤔 헷갈림', onclick: function () { toggleUnsure(it, i); } }),
      el('button', { type: 'button', class: 'pr-chk-btn pr-memo-btn' + (noteFilled(it) ? ' has' : ''), 'data-memo-for': noteKey(it), 'aria-expanded': memoOpen(it, i) ? 'true' : 'false', text: '📝 메모', onclick: function () { toggleMemo(it, i); } }),
      (shown && !isRight(it, S.ans[i])) || unsureOf(it) ? el('button', { type: 'button', class: 'pr-chk-btn pr-sheet-btn', title: '시험지·내 답·원인·AI 분석·비슷한 기출을 한 화면에', text: '📋 한 장', onclick: function () {
        var bad = shown && !isRight(it, S.ans[i]);
        openSheet({ ref: qRef(examKeyOf(it), it.sec, it.n), why: bad ? (S.ans[i] ? { wrong: 1 } : { wrong: 1, skip: 1 }) : { unsure: 1 }, picked: S.ans[i] || 0, ts: Date.now() }, openNotebook);
      } }) : null
    ]));
    if (memoOpen(it, i)) c.appendChild(memoBox(it, i));
    if (!shown && aiNeed(hintAiId(i), function () { return hintReq(i); }).status !== 'idle') c.appendChild(el('div', { class: 'pr-explain pr-hint' }, [aiBox(hintAiId(i))]));
    if (!shown && aiRun(itemAiId(i)).status === 'ask') c.appendChild(el('div', { class: 'pr-explain pr-hint' }, [aiBox(itemAiId(i))]));
    if (shown) c.appendChild(reveal(it, i));
    return c;
  }

  function ansText(it, a) { return it.num ? String(a) : chLabel(a); }

  function reveal(it, i) {
    var okk = isRight(it, S.ans[i]);
    var verdict = S.ans[i] ? (okk ? '정답입니다' : '오답입니다 · 내 답 ' + ansText(it, S.ans[i])) : okk ? '풀지 않은 문항(모두 정답 처리)' : '오답입니다 · 못 푼 문항';   // 못 푼 문제도 틀린 것
    var corr = it.ans === 0 ? '정답 없음(배점 인정)' : Array.isArray(it.ans) ? it.ans.map(function (x) { return ansText(it, x); }).join(' 또는 ') + ' (복수 정답)' : ansText(it, it.ans);
    var box = el('div', { class: 'pr-explain' }, [
      el('p', { class: 'pr-verdict' }, [el('b', { text: verdict }), ' · ', el('b', { class: 'pr-ans-t', text: (it.ans === 0 ? '' : '정답 ') + corr }), ' · 배점 ' + it.pts + '점']),
    ]);
    if (S.ans[i] && !okk && !it.num && !Array.isArray(it.ans)) {
      var trap = el('p', { class: 'pr-trap', hidden: true });
      box.appendChild(trap);
      loadTrap(it.ex).then(function (map) {
        var t = map && map[it.n] && map[it.n].o && map[it.n].o[S.ans[i]];
        if (!t) return;
        trap.appendChild(el('b', { text: '내가 고른 ' + chLabel(S.ans[i]) + ' — 왜 오답일까? ' }));
        trap.appendChild(document.createTextNode(t));
        trap.hidden = false;
      });
    }
    var body = el('div', { class: 'pr-exp-body', text: '해설 불러오는 중…' });
    box.appendChild(body);
    var aid = itemAiId(i);
    if (aiNeed(aid, function () { return itemReq(i); }).status !== 'idle') box.appendChild(aiBox(aid));
    loadExplain(it.ex).then(function (map) {
      var t = map && map[it.n];
      if (t) { body.className = 'pr-exp-body has'; body.innerHTML = fmtExp(t); }
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
      explainCache[ck] = Promise.all([fetch(cfg.base + 'explain/' + ck + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }), loadFmt()]).then(function (r) { return r[0]; });
    }
    return explainCache[ck];
  }

  function loadTrap(key) {
    var ck = 'trap:' + key + '-' + SUB;
    if (!explainCache[ck]) {
      explainCache[ck] = fetch(cfg.base + 'trap/' + key + '-' + SUB + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    return explainCache[ck];
  }

  /* ───────── AI 해설·분석: 내 Anthropic API 키로 브라우저에서 바로 호출 (키는 이 브라우저에만 저장) ───────── */
  var AI_MODEL = 'claude-opus-5-5';
  var AI_SDK = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.131.0/+esm';
  var AI_KEY = 'sn:ai:key';
  /* 로그인해 계정에 키를 저장했으면 서버(/api/claude)가 그 키로 대신 보낸다 — 키 원문은 브라우저에 없다. 아니면 이 브라우저의 키 */
  var acctKey = null;
  function keyMode() { return acctKey && acctKey.has ? 'acct' : (store(AI_KEY) ? 'local' : ''); }
  function errType(e) { return e && e.error && e.error.error && e.error.error.type; }
  var aiRuns = {}, sdkP = null, aiDlg = null, SDK = null;
  var FORMULA = /^(math|phys|chem|earth|bio)/.test(SUB);   // 수식이 많은 과목: AI 가 LaTeX 로 쓰고 화면은 KaTeX 로 그린다
  /* 저장된 해설(explain/*.json)의 식: a/b 를 위아래 분수로, = 앞뒤를 띄운다(mathfmt.js — 못 불러오면 원문 그대로).
   * 생명과학은 / 가 유전자형(Ab/aB)에도 쓰여 숫자/숫자만 분수로 바꾼다 */
  var fmtP = null;
  function loadFmt() {
    if (!FORMULA) return Promise.resolve();
    if (!fmtP) fmtP = new Promise(function (res) {
      if (window.SnMathFmt) return res();
      var s = document.createElement('script');
      s.src = cfg.base + 'mathfmt.js'; s.onload = res; s.onerror = res;
      document.head.appendChild(s);
    });
    return fmtP;
  }
  function fmtExp(html) { return FORMULA && window.SnMathFmt ? SnMathFmt.format(html, { numOnly: /^bio/.test(SUB) }) : html; }
  var AI_SYS = '너는 대한민국 수능 ' + String(cfg.label || SUB).replace(/^수능\s+/, '') + ' 전문 강사다. 학생의 풀이 기록과 기출 문항 이미지를 받아 해설하고 분석한다. ' +
    '공식 정답은 주어진 것을 기준으로 하고, 네 풀이가 공식 정답과 다르면 다시 검토한다. 고등학생이 따라올 수 있게 한국어 존댓말로 쓴다. ' +
    (FORMULA
      ? '형식: 마크다운 제목(#)·표는 쓰지 않는다. 소제목은 한 줄짜리 **굵은 글씨**로, 목록은 "- "로 쓴다. ' +
        '수식은 모두 LaTeX로 쓴다(화면이 수식으로 그려 준다): 문장 속 짧은 식·값은 $…$ (예: $f(x)=x^2-3x$, $a_n$), 분수·극한·적분·시그마처럼 큰 식이나 계산은 한 줄에 따로 $$…$$, ' +
        '등호로 이어지는 여러 단계 계산은 $$\\begin{aligned} … &= … \\\\ &= … \\end{aligned}$$ 로 한 단계에 한 줄씩 = 를 맞춘다. 식 하나를 여러 $로 쪼개지 않고, 식 안에 한글이 필요하면 \\text{} 로 쓴다. 분수는 문장 속 식에서도 반드시 \\frac{a}{b} 로 쓴다 — a/b, 1/2mv^2 처럼 / 로 쓰지 않는다. 곱셈은 \\times 나 \\cdot, 단위는 $3\\,\\text{m/s}$ 처럼 \\text 안에 쓰고 값과 띄운다. 식과 한글 사이는 한 칸 띄운다. 유니코드 위첨자(x²)·√ 기호 대신 LaTeX(x^2, \\sqrt{3})를 쓴다. '
      : '형식: 마크다운 제목(#)·표·LaTeX는 쓰지 않는다. 소제목은 한 줄짜리 **굵은 글씨**로, 목록은 "- "로, 수식은 유니코드(x², √3, ≤, ∫, →)로 쓴다. ') +
    '읽기 쉽게: 문단은 2~3문장으로 짧게 끊고, 꼭 기억할 낱말과 결론은 **굵게** 쓴다. 해설·분석은 맨 앞에 "핵심: …" 한 줄로 결론부터 쓴다(힌트만 줄 때는 쓰지 않는다). ' +
    '그림: 글로만 길게 풀지 말고, 이해를 돕는 그림 블록을 넣는다(화면이 인포그래픽으로 그려 준다). 블록은 줄 맨 앞 ```이름 으로 열고 다음 줄들에 한 줄에 한 항목씩 쓴 뒤 ``` 한 줄로 닫는다. 쓸 수 있는 블록 — ' +
    '```선지: 한 줄에 선지 하나 "④ | 정답 | 근거", "② | ✕ 내 답 | 왜 틀렸나", "① | ○ | 근거" (○ 맞는 진술 · ✕ 틀린 진술 · 정답 · 내 답, 보기 ㄱ·ㄴ·ㄷ도 같은 꼴) / ' +
    '```흐름: "원인 → 과정 → 결과" 한 줄, 또는 한 줄에 한 단계 "단계 이름: 설명" / ' +
    '```비교: 첫 줄 "| 기준 | A | B |", 다음 줄부터 "| 항목 | … | … |" (정답 쪽 칸 제목 끝에 (정답), 칸에 ○·✕ 만 써도 된다) / ' +
    '```연표: 한 줄에 "연도 | 사건" (답과 이어지는 줄 끝에 ★)' +
    (FORMULA ? ' / ```그래프: "y = x^2 - 3x"(여러 줄이면 여러 곡선, 조각 함수는 "y = 식, 시작 ~ 끝"), "x: -1 ~ 4", "점: (1.5, -2.25) 꼭짓점"(빈 점은 이름에 ○), "x = 2", "넓이: 0 ~ 3"(곡선과 x축 사이, 두 곡선 사이는 "넓이: 0 ~ 3, 사이") — 식은 x^2·sqrt(x)·sin(x)·e^x·ln(x)·abs(x) 같은 계산식으로(LaTeX·$ 없이). 물리처럼 시간 그래프면 변수 t 와 물리량 이름을 쓰고 축 이름을 단다: "v = 2t, 0 ~ 3", "v = 6, 3 ~ 5", "t: 0 ~ 5", "축: t(s), v(m/s)", "넓이: 0 ~ 5"(이동 거리)' : '') +
    '. 블록 안에는 마크다운 꾸밈을 쓰지 않는다' + (FORMULA ? '(짧은 수식 $…$ 은 된다)' : '') + '.';

  function loadSdk() {
    if (!sdkP) {
      sdkP = import(AI_SDK).then(function (m) { SDK = m.default || m.Anthropic; return SDK; });
      sdkP.catch(function () { sdkP = null; });
    }
    return sdkP;
  }
  function textOf(html) { var d = document.createElement('div'); d.innerHTML = String(html || '').replace(/<\/(p|li|h5|div|tr)>|<br\s*\/?>/gi, '$&\n'); return (d.textContent || '').trim(); }
  /* AI 답변을 읽기 쉽게: 소제목(한 줄 **굵게**·#)은 제목 줄로, '핵심:'·'정답:' 같은 이름표는 꼬리표로, 핵심·결론 문단은 강조 상자로,
   * 굵은 낱말은 형광펜, ①~⑤는 색, "- "·"1." 목록, 표(| … |)까지. 먼저 모두 이스케이프하고 정해 둔 태그만 만든다 */
  var AI_KEYL = /^(정답|핵심|결론|요약|한 ?줄 정리|포인트|주의|함정|실수|원인|다음 할 일|팁)$/;
  var AI_KEYS = /(따라서|그래서|그러므로|결국|요컨대|결론|정답|핵심|중요|꼭 기억|기억하세요|주의하|헷갈리기 쉽)/;   // 이런 말이 든 문장은 진하게
  /* 수식(수학·과학): $…$ · $$…$$ · \(…\) · \[…\] 를 마크다운 손질 전에 떼어 두었다가 KaTeX 로 그려 끼운다.
   * KaTeX 는 처음 수식을 만날 때 불러오고(그동안은 식 글자 그대로), 불러오면 AI 칸을 다시 그린다 */
  var KX = null, kxP = null, kxCache = {}, KX_URL = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/';
  var MATH_RE = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g;
  function escH(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function loadKatex() {
    if (!kxP) {
      var l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = KX_URL + 'katex.min.css';
      document.head.appendChild(l);
      kxP = import(KX_URL + 'katex.mjs').then(function (m) { KX = m.default || m; kxCache = {}; Object.keys(aiRuns).forEach(aiPaintAll); });
      kxP.catch(function () { kxP = null; });
    }
    return kxP;
  }
  function mathOut(src) {
    var list = [];
    var text = String(src || '').replace(MATH_RE, function (all, d1, d2, i1, i2) {
      if (i2 !== undefined && /^\s|\s$/.test(i2)) return all;   // '$5 와 $' 같은 것은 수식이 아니다
      list.push({ tex: (d1 || d2 || i1 || i2).trim(), d: !!(d1 || d2) });
      return '\uE000' + (list.length - 1) + '\uE001';
    });
    return { text: text, list: list };
  }
  /* AI 가 식 안에 1/2 처럼 / 로 쓴 숫자 분수를 \frac 으로(\text{m/s}·지수·첨자 안은 그대로). 1/2mv^2 도 (1/2)mv^2 로 읽는 것이 식 그대로의 뜻이다 */
  function texFrac(tex) {
    return String(tex).split(/(\\(?:text|mathrm|operatorname|textbf)\s*\{[^{}]*\})/).map(function (seg, i) {
      if (i % 2) return seg;
      return seg.replace(/(^|[^\w.^_{\\\/])(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)(?![\d.\/])/g, '$1\\frac{$2}{$3}');
    }).join('');
  }
  function mathHTML(x) {
    if (!KX) { loadKatex(); return '<code class="pr-tex">' + escH(x.tex) + '</code>'; }
    var k = (x.d ? 'D' : 'I') + x.tex;
    if (!kxCache[k]) {
      var tex = texFrac(x.tex);
      if (!x.d) tex = tex.replace(/\\frac(?=\s*\{)/g, '\\dfrac');   // 문장 속 분수도 작게 줄이지 않고 제 크기로
      try { kxCache[k] = KX.renderToString(tex, { displayMode: x.d, throwOnError: false, strict: 'ignore' }); }
      catch (e) { kxCache[k] = '<code class="pr-tex">' + escH(x.tex) + '</code>'; }
    }
    return kxCache[k];
  }
  /* ───────── 그림 블록(인포그래픽): AI 가 줄 맨 앞 ```선지 · ```흐름 · ```비교 · ```연표 · ```그래프 로 연 블록을 그림으로 그린다.
   * 블록 안 글자는 모두 이스케이프해 끼우고(수학·과학은 $…$ 수식도 KaTeX 로), 그래프 식은 eval 없이 직접 해석해 SVG 로 그린다.
   * 받는 중(닫는 ``` 전)에는 '그림을 그리는 중…', 알아볼 수 없는 블록은 글자 그대로 보인다 ───────── */
  var VIS_KIND = { '선지': 'ch', '보기': 'ch', choices: 'ch', '흐름': 'flow', flow: 'flow', '비교': 'cmp', compare: 'cmp', '연표': 'tl', timeline: 'tl', '그래프': 'graph', graph: 'graph' };
  var VIS_TAG = /\s*(★|✓|\(정답\))\s*/g, visSeq = 0;
  function fenceOut(src) {
    var out = [], list = [], cur = null;
    String(src || '').split('\n').forEach(function (ln) {
      var m = /^\s*```\s*([^\s`]*)\s*$/.exec(ln);
      if (cur) {
        if (m && !m[1]) { list.push(cur); out.push('', '' + (list.length - 1) + '', ''); cur = null; }
        else cur.lines.push(ln);
        return;
      }
      if (m) { cur = { kind: VIS_KIND[m[1].toLowerCase()] || '', lines: [] }; return; }
      out.push(ln);
    });
    if (cur) { cur.open = true; list.push(cur); out.push('', '' + (list.length - 1) + '', ''); }
    return { text: out.join('\n'), list: list };
  }
  function richText(s) {   // 블록 안 글자: 이스케이프 + **굵게** + (수학·과학) $…$ 수식
    var mt = FORMULA ? mathOut(s) : null, h = escH(mt ? mt.text : s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return mt && mt.list.length ? h.replace(/(\d+)/g, function (a, k) { return mt.list[+k] ? mathHTML(mt.list[+k]) : ''; }) : h;
  }
  function visCells(ln) { return ln.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (c) { return c.trim(); }); }
  function visHTML(b) {
    if (b.open) return '<div class="pr-vis pr-vis-wait">🎨 그림을 그리는 중…</div>';
    var h = '';
    try { h = b.kind === 'ch' ? visChoices(b.lines) : b.kind === 'flow' ? visFlow(b.lines) : b.kind === 'cmp' ? visCmp(b.lines) : b.kind === 'tl' ? visTl(b.lines) : b.kind === 'graph' ? visGraph(b.lines) : ''; } catch (e) { h = ''; }
    return h || '<pre class="pr-vis-raw">' + escH(b.lines.join('\n')) + '</pre>';
  }
  /* 선지: "④ | 정답 | 근거" · "② | ✕ 내 답 | 왜 틀렸나" · "① | ○ | 근거" — 정답은 빨강(채점 색과 같게), 내 답은 검정 */
  function visChoices(lines) {
    var rows = [];
    lines.forEach(function (ln) {
      ln = ln.trim().replace(/^[-•*]\s+/, '');
      if (!ln) return;
      var c = ln.indexOf('|') >= 0 ? visCells(ln) : (/^(\S+)\s+(.+)$/.exec(ln) || [0, ln, '']).slice(1);
      var j = c[1] || '', ans = /정답/.test(j), mine = /내\s*답/.test(j), ok = /^\s*(○|O|o|⭕|맞|옳|참)/.test(j), no = /^\s*(✕|X|x|×|❌|틀|그르|거짓)/.test(j);
      var why = ans || mine || ok || no ? c.slice(2).join(' · ') : c.slice(1).join(' · ');
      rows.push({ n: c[0], ans: ans, mine: mine, ok: ok, no: no, why: why });
    });
    if (!rows.length) return '';
    return '<div class="pr-vis pr-vis-ch">' + rows.map(function (r) {
      var tags = (r.ans ? '<span class="pr-vc-b ans">정답</span>' : '') + (r.mine ? '<span class="pr-vc-b mine">내 답</span>' : '') +
        (r.ok ? '<span class="pr-vc-b ok">○ 맞는 말</span>' : '') + (r.no ? '<span class="pr-vc-b no">✕ 틀린 말</span>' : '');
      return '<div class="pr-vc-row' + (r.ans ? ' ans' : '') + (r.mine ? ' mine' : '') + (r.no && !r.ans ? ' dim' : '') + '"><b class="pr-vc-n">' + escH(r.n) + '</b>' +
        (tags ? '<span class="pr-vc-tags">' + tags + '</span>' : '') + '<span class="pr-vc-why">' + richText(r.why) + '</span></div>';
    }).join('') + '</div>';
  }
  /* 흐름: "원인 → 과정 → 결과" 또는 한 줄에 한 단계("단계: 설명") — 단계가 많거나 길면 세로로 */
  function visFlow(lines) {
    var steps = [];
    lines.forEach(function (ln) {
      ln = ln.trim().replace(/^[-•*]\s+|^\d{1,2}[.)]\s+/, '');
      if (ln) ln.split(/\s*(?:→|->|⇒|=>|⟶)\s*/).forEach(function (p) { if (p) steps.push(p); });
    });
    if (!steps.length) return '';
    var col = steps.length > 4 || steps.some(function (p) { return p.length > 26; });
    return '<div class="pr-vis pr-vis-flow' + (col ? ' col' : '') + '">' + steps.map(function (p, k) {
      var m = /^([^:：]{1,24}?)\s*[:：]\s+(.+)$/.exec(p);
      return (k ? '<i class="pr-vf-ar" aria-hidden="true"></i>' : '') + '<div class="pr-vf-st' + (k === steps.length - 1 && k ? ' last' : '') + '"><span class="pr-vf-k">' + (k + 1) + '</span>' +
        (m ? '<b>' + richText(m[1]) + '</b><span>' + richText(m[2]) + '</span>' : '<b>' + richText(p) + '</b>') + '</div>';
    }).join('') + '</div>';
  }
  /* 비교: 첫 줄 "| 기준 | A | B |", 다음 줄부터 "| 항목 | … | … |" — 제목 끝 (정답)·★ 인 칸은 빨간 테두리, ○·✕ 칸은 표시로 */
  function visCmp(lines) {
    var rows = lines.map(function (l) { return l.trim(); }).filter(function (l) { return l && l.indexOf('|') >= 0 && !/^\|?[\s:|-]+\|?$/.test(l); }).map(visCells);
    if (rows.length < 2) return '';
    var head = rows[0], n = head.length, hot = head.map(function (h) { VIS_TAG.lastIndex = 0; return VIS_TAG.test(h); });
    var cell = function (t, tag, k) {
      var v = String(t || '').trim(), cls = hot[k] ? ' class="hot"' : '';
      var inner = /^(○|O|⭕)$/.test(v) ? '<span class="pr-vt-o">○</span>' : /^(✕|X|×|❌)$/.test(v) ? '<span class="pr-vt-x">✕</span>' : richText(v.replace(VIS_TAG, ' ').trim());
      return '<' + tag + cls + '>' + inner + (hot[k] && tag === 'th' && k ? ' <span class="pr-vc-b ans">정답</span>' : '') + '</' + tag + '>';
    };
    return '<div class="pr-vis pr-vis-cmp"><table><thead><tr>' + head.map(function (h, k) { return cell(h, 'th', k); }).join('') + '</tr></thead><tbody>' +
      rows.slice(1).map(function (r) { var o = []; for (var k = 0; k < n; k++) o.push(cell(r[k], k ? 'td' : 'th', k)); return '<tr>' + o.join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  /* 연표: 한 줄에 "연도 | 사건" — 끝에 ★·(정답) 인 줄은 빨간 점 */
  function visTl(lines) {
    var rows = [];
    lines.forEach(function (l) {
      l = l.trim().replace(/^[-•*]\s+/, '');
      if (!l) return;
      var c = l.indexOf('|') >= 0 ? visCells(l) : (/^(\S+(?:\s?(?:년|세기|년대|경|무렵))?)\s*[:：-]?\s+(.+)$/.exec(l) || []).slice(1);
      if (c.length >= 2) rows.push(c);
    });
    if (!rows.length) return '';
    var yr = function (c) { var m = /^\s*(?:기원전\s*|BC\s*)?(\d{1,4})/.exec(c[0]); return m ? (/기원전|BC/.test(c[0]) ? -m[1] : +m[1]) : NaN; };
    if (rows.every(function (c) { return isFinite(yr(c)); })) rows = rows.map(function (c, k) { return [c, k]; }).sort(function (a, b) { return (yr(a[0]) - yr(b[0])) || (a[1] - b[1]); }).map(function (x) { return x[0]; });   // 모두 연도면 시간 순으로
    return '<div class="pr-vis pr-vis-tl"><ol>' + rows.map(function (c) {
      VIS_TAG.lastIndex = 0;
      var hot = VIS_TAG.test(c.join(' '));
      return '<li' + (hot ? ' class="hot"' : '') + '><b class="pr-vt-y">' + richText(c[0].replace(VIS_TAG, ' ').trim()) + '</b><span>' + richText(c.slice(1).join(' · ').replace(VIS_TAG, ' ').trim()) + '</span></li>';
    }).join('') + '</ol></div>';
  }
  /* 그래프 식 해석: 숫자·x·+ - * / ^·괄호·|…|·함수(sqrt sin cos tan ln log abs exp)·상수(pi e)·곱셈 생략(2x, 3(x+1), x(x-1), 2sin(x)). eval 은 쓰지 않는다 */
  var VIS_FN = { sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, ln: Math.log, log: function (v) { return Math.log(v) / Math.LN10; }, abs: Math.abs, exp: Math.exp };
  var VIS_WORDS = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'abs', 'log', 'ln', 'pi', 'x', 'e', 't'];   // t 는 x 와 같은 가로 변수(물리의 시간)
  function exprFn(src) {
    var s = String(src).replace(/\\left|\\right|\\[,;!]|\\displaystyle/g, '').replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '(($1)/($2))').replace(/\\sqrt\s*\{([^{}]*)\}/g, 'sqrt($1)')
      .replace(/\\cdot|\\times|×|·/g, '*').replace(/÷/g, '/').replace(/[−–—]/g, '-').replace(/π|\\pi/g, 'pi').replace(/\\(sin|cos|tan|ln|log|exp)/g, '$1')
      .replace(/√/g, 'sqrt').replace(/²/g, '^2').replace(/³/g, '^3').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\*\*/g, '^').toLowerCase();
    var toks = [], i = 0;
    while (i < s.length) {
      var ch = s.charAt(i), nm = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)), w = null;
      if (/\s/.test(ch)) { i++; continue; }
      if (nm) { toks.push({ t: 'n', v: parseFloat(nm[1]) }); i += nm[1].length; continue; }
      if ('+-*/^()|'.indexOf(ch) >= 0) { toks.push({ t: ch }); i++; continue; }
      for (var k = 0; k < VIS_WORDS.length; k++) if (s.substr(i, VIS_WORDS[k].length) === VIS_WORDS[k]) { w = VIS_WORDS[k]; break; }
      if (!w) return null;
      toks.push(VIS_FN[w] ? { t: 'f', v: w } : { t: 'id', v: w });
      i += w.length;
    }
    var p = 0, absIn = 0;
    var peek = function () { return toks[p]; }, eat = function (t) { if (toks[p] && toks[p].t === t) { p++; return true; } return false; };
    var bin = function (op, l, r) {
      return op === '+' ? function (x) { return l(x) + r(x); } : op === '-' ? function (x) { return l(x) - r(x); } : op === '*' ? function (x) { return l(x) * r(x); }
        : op === '/' ? function (x) { return l(x) / r(x); } : function (x) { return Math.pow(l(x), r(x)); };
    };
    var expr, term, unary, power, primary;
    expr = function () { var a = term(); while (peek() && (peek().t === '+' || peek().t === '-')) { var op = toks[p++].t; a = bin(op, a, term()); } return a; };
    term = function () {
      var a = unary();
      for (;;) {
        var tk = peek();
        if (tk && (tk.t === '*' || tk.t === '/')) { p++; a = bin(tk.t, a, unary()); }
        else if (tk && (tk.t === 'n' || tk.t === 'id' || tk.t === 'f' || tk.t === '(' || (tk.t === '|' && !absIn))) a = bin('*', a, power());   // 곱셈 생략
        else return a;
      }
    };
    unary = function () { if (eat('-')) { var u = unary(); return function (x) { return -u(x); }; } if (eat('+')) return unary(); return power(); };
    power = function () { var b = primary(); return eat('^') ? bin('^', b, unary()) : b; };
    primary = function () {
      var tk = toks[p++];
      if (!tk) throw 0;
      if (tk.t === 'n') { var v = tk.v; return function () { return v; }; }
      if (tk.t === 'id') { if (tk.v === 'x' || tk.v === 't') return function (x) { return x; }; var c = tk.v === 'pi' ? Math.PI : Math.E; return function () { return c; }; }
      if (tk.t === 'f') { var f = VIS_FN[tk.v], arg = peek() && peek().t === '(' ? primary() : power(); return function (x) { return f(arg(x)); }; }
      if (tk.t === '(') { var e = expr(); if (!eat(')')) throw 0; return e; }
      if (tk.t === '|') { absIn++; var a = expr(); absIn--; if (!eat('|')) throw 0; return function (x) { return Math.abs(a(x)); }; }
      throw 0;
    };
    try { var fn = expr(); return p === toks.length ? fn : null; } catch (e) { return null; }
  }
  function visNum(t) { var f = exprFn(String(t).trim()); var v = f ? f(0) : NaN; return isFinite(v) ? v : NaN; }
  function prettyExpr(src) {
    return escH(String(src).trim()).replace(/\*\*/g, '^').replace(/\^\(([^()]*)\)/g, '<sup>$1</sup>').replace(/\^(-?[\w.]+)/g, '<sup>$1</sup>')
      .replace(/sqrt/g, '√').replace(/\bpi\b/g, 'π').replace(/\*/g, '·').replace(/-/g, '−');
  }
  /* 그래프: "y = 식"(여러 개 · 조각 함수는 "y = 식, a ~ b") · "x: a ~ b" · "y: c ~ d" · "점: (x, y) 이름"(○ 를 붙이면 빈 점) · "x = k" · "넓이: a ~ b"(곡선과 x축 사이, ", 사이"면 두 곡선 사이) */
  function visGraph(lines) {
    var g = { cv: [], pts: [], vl: [], area: null, xr: null, yr: null };
    lines.forEach(function (raw) {
      var ln = raw.trim().replace(/\$/g, '').replace(/^[-•*]\s+/, ''), m;
      if (!ln) return;
      if ((m = /^(?:축|axes?)\s*[:：]\s*(.+?)\s*[,/]\s*(.+)$/i.exec(ln))) { g.ax = [m[1].trim(), m[2].trim()]; return; }   // "축: t(s), v(m/s)"
      if ((m = /^(?:가로|세로)(?:축)?\s*[:：]\s*(.+)$/.exec(ln))) { g.ax = g.ax || ['', '']; g.ax[/^가로/.test(ln) ? 0 : 1] = m[1].trim(); return; }
      if ((m = /^([a-z])\s*[:：]\s*(.+?)\s*(?:~|〜|부터)\s*(.+?)\s*(?:까지)?$/i.exec(ln))) { g[/^[xt]$/i.test(m[1]) ? 'xr' : 'yr'] = [visNum(m[2]), visNum(m[3])]; return; }   // x:·t: 는 가로, 그 밖의 글자는 세로 범위
      if ((m = /^(?:점|points?)\s*[:：]\s*(.+)$/i.exec(ln))) {
        var re = /\(\s*([^,()]+?)\s*,\s*([^()]+?)\s*\)\s*([^(]*)/g, q;
        while ((q = re.exec(m[1]))) { var lab = q[3].replace(/^[,\s]+|[,\s]+$/g, ''); g.pts.push({ x: visNum(q[1]), y: visNum(q[2]), open: /○|열린|빈/.test(lab), label: lab.replace(/○|●/g, '').trim() }); }
        return;
      }
      if ((m = /^(?:넓이|area)\s*[:：]\s*(.+?)\s*(?:~|〜)\s*([^,]+?)\s*(,\s*(?:사이|between).*)?$/i.exec(ln))) { g.area = { a: visNum(m[1]), b: visNum(m[2]), between: !!m[3] }; return; }
      if ((m = /^[xt]\s*=\s*([^,]+?)\s*(?:,\s*(.*))?$/i.exec(ln)) && isFinite(visNum(m[1])) && !/[xt](?![a-z])/i.test(m[1].replace(/tan|sqrt|exp/gi, ''))) { g.vl.push({ x: visNum(m[1]), label: m[2] || '' }); return; }   // 세로선: x = 4 · t = 4
      if ((m = /^([a-z]{1,2}(?:\s*\(\s*[xt]\s*\))?)\s*=\s*(.+)$/i.exec(ln))) {   // 곡선: y = … · f(x) = … · v = 2t · s(t) = …
        var body = m[2], dom = null, lb = '', d = /,\s*([^,~]+?)\s*(?:~|〜)\s*([^,]+?)\s*$/.exec(body);
        if (d) { dom = [visNum(d[1]), visNum(d[2])]; body = body.slice(0, d.index); }
        var l2 = /\s*\(([^()]*[가-힣][^()]*)\)\s*$/.exec(body);
        if (l2) { lb = l2[1]; body = body.slice(0, l2.index); }
        var f = exprFn(body);
        if (f) g.cv.push({ f: f, src: body, dom: dom, label: lb, name: m[1].replace(/\s+/g, '') });
      }
    });
    if (!g.cv.length && !g.pts.length) return '';
    var usesT = g.cv.some(function (c) { return /(^|[^a-z])t([^a-z]|$)/i.test(c.src.replace(/tan|sqrt/gi, '')) || /\(\s*t\s*\)/.test(c.name); });
    var yn = g.cv.length ? g.cv[0].name.replace(/\s*\(.*$/, '') : 'y';
    g.ax = [g.ax && g.ax[0] || (usesT ? 't' : 'x'), g.ax && g.ax[1] || (/^[fgh]$/i.test(yn) ? 'y' : yn)];   // 물리(v = 2t)면 가로 t · 세로 v
    return visPlot(g);
  }
  function visStep(r) { var s = Math.pow(10, Math.floor(Math.log(r / 5) / Math.LN10)), k = r / 5 / s; return s * (k < 1.5 ? 1 : k < 3.5 ? 2 : k < 7.5 ? 5 : 10); }
  function visPlot(g) {
    var W = 360, H = 240, L = 30, R = 12, T = 10, B = 22, ok2 = function (r) { return r && isFinite(r[0]) && isFinite(r[1]) && r[1] > r[0]; };
    var xr = ok2(g.xr) ? g.xr : null;
    if (!xr) {
      var xs = [];
      g.pts.forEach(function (q) { xs.push(q.x); }); g.vl.forEach(function (v) { xs.push(v.x); });
      g.cv.forEach(function (c) { if (c.dom) xs.push(c.dom[0], c.dom[1]); });
      if (g.area) xs.push(g.area.a, g.area.b);
      xs = xs.filter(isFinite);
      if (xs.length) { var lo0 = Math.min.apply(null, xs), hi0 = Math.max.apply(null, xs), pd = Math.max(1, (hi0 - lo0) * 0.3); xr = [lo0 - pd, hi0 + pd]; } else xr = [-5, 5];
    }
    var N = 400, sm = g.cv.map(function (c) {
      var a = c.dom && isFinite(c.dom[0]) ? Math.max(xr[0], c.dom[0]) : xr[0], b = c.dom && isFinite(c.dom[1]) ? Math.min(xr[1], c.dom[1]) : xr[1], arr = [];
      for (var k = 0; k <= N && b > a; k++) { var x = a + (b - a) * k / N, y = c.f(x); arr.push([x, isFinite(y) ? y : NaN]); }
      return arr;
    });
    var yr = ok2(g.yr) ? g.yr : null;
    if (!yr) {
      var ys = [];
      sm.forEach(function (s) { s.forEach(function (q) { if (isFinite(q[1])) ys.push(q[1]); }); });
      ys.sort(function (a, b) { return a - b; });
      var lo = ys.length ? ys[Math.round(ys.length * 0.02)] : -5, hi = ys.length ? ys[Math.min(ys.length - 1, Math.round(ys.length * 0.98))] : 5;
      g.pts.forEach(function (q) { if (isFinite(q.y)) { lo = Math.min(lo, q.y); hi = Math.max(hi, q.y); } });
      if (!(hi - lo > 1e-9)) { lo -= 1; hi += 1; }
      var pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
      if (lo > 0 && lo < (hi - lo) * 0.6) lo = -(hi - lo) * 0.05;   // x축이 가까우면 보이게
      if (hi < 0 && -hi < (hi - lo) * 0.6) hi = (hi - lo) * 0.05;
      yr = [lo, hi];
    }
    var sx = function (x) { return L + (x - xr[0]) / (xr[1] - xr[0]) * (W - L - R); }, sy = function (y) { return T + (yr[1] - y) / (yr[1] - yr[0]) * (H - T - B); };
    var f1 = function (v) { return Math.round(v * 10) / 10; }, fmt = function (v) { return String(Math.round(v * 1000) / 1000).replace('-', '−'); };
    var id = 'pr-vg' + (++visSeq), o = ['<defs><clipPath id="' + id + '"><rect x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - B) + '"/></clipPath></defs>'];
    var stx = visStep(xr[1] - xr[0]), sty = visStep(yr[1] - yr[0]), ax = yr[0] <= 0 && yr[1] >= 0 ? sy(0) : H - B, ay = xr[0] <= 0 && xr[1] >= 0 ? sx(0) : L;
    for (var gx = Math.ceil(xr[0] / stx) * stx; gx <= xr[1] + 1e-9; gx += stx) {
      o.push('<line class="pr-vg-grid" x1="' + f1(sx(gx)) + '" y1="' + T + '" x2="' + f1(sx(gx)) + '" y2="' + (H - B) + '"/>');
      if (Math.abs(gx) > stx / 1e3) o.push('<text class="pr-vg-tick" x="' + f1(sx(gx)) + '" y="' + f1(Math.min(H - 6, ax + 11)) + '" text-anchor="middle">' + fmt(gx) + '</text>');
    }
    for (var gy = Math.ceil(yr[0] / sty) * sty; gy <= yr[1] + 1e-9; gy += sty) {
      o.push('<line class="pr-vg-grid" x1="' + L + '" y1="' + f1(sy(gy)) + '" x2="' + (W - R) + '" y2="' + f1(sy(gy)) + '"/>');
      if (Math.abs(gy) > sty / 1e3) o.push('<text class="pr-vg-tick" x="' + f1(Math.max(L - 3, ay - 3)) + '" y="' + f1(sy(gy) + 3) + '" text-anchor="end">' + fmt(gy) + '</text>');
    }
    o.push('<line class="pr-vg-axis" x1="' + L + '" y1="' + f1(ax) + '" x2="' + (W - R) + '" y2="' + f1(ax) + '"/><line class="pr-vg-axis" x1="' + f1(ay) + '" y1="' + T + '" x2="' + f1(ay) + '" y2="' + (H - B) + '"/>');
    o.push('<text class="pr-vg-tick ax" x="' + (W - R - 2) + '" y="' + f1(ax - 4) + '" text-anchor="end">' + escH(g.ax ? g.ax[0] : 'x') + '</text><text class="pr-vg-tick ax" x="' + f1(ay + 5) + '" y="' + (T + 8) + '">' + escH(g.ax ? g.ax[1] : 'y') + '</text>');
    if (yr[0] <= 0 && yr[1] >= 0 && xr[0] <= 0 && xr[1] >= 0) o.push('<text class="pr-vg-tick" x="' + f1(ay - 3) + '" y="' + f1(ax + 11) + '" text-anchor="end">O</text>');
    if (g.area && isFinite(g.area.a) && isFinite(g.area.b) && g.cv[0]) {   // 넓이: 곡선과 x축(또는 두 곡선) 사이
      var fOn = function (x) { for (var i = 0; i < g.cv.length; i++) { var c = g.cv[i]; if (!c.dom || (x >= c.dom[0] - 1e-9 && x <= c.dom[1] + 1e-9)) return c.f(x); } return NaN; };   // 조각 함수면 그 구간의 식
      var a = Math.min(g.area.a, g.area.b), b = Math.max(g.area.a, g.area.b), top = [], bot = [], f0 = g.area.between ? g.cv[0].f : fOn, fb = g.area.between && g.cv[1] ? g.cv[1].f : null;
      for (var k = 0; k <= 160; k++) { var x = a + (b - a) * k / 160, y = f0(x), y2 = fb ? fb(x) : 0; if (isFinite(y) && isFinite(y2)) { top.push(f1(sx(x)) + ',' + f1(sy(y))); bot.unshift(f1(sx(x)) + ',' + f1(sy(y2))); } }
      if (top.length > 1) o.push('<polygon class="pr-vg-area" clip-path="url(#' + id + ')" points="' + top.concat(bot).join(' ') + '"/>');
    }
    sm.forEach(function (s, ci) {   // 곡선: 정의되지 않거나 크게 튀는 곳(점근선)은 끊는다
      var d = '', prev = null, span = yr[1] - yr[0];
      s.forEach(function (q) {
        if (!isFinite(q[1]) || q[1] < yr[0] - span * 3 || q[1] > yr[1] + span * 3) { prev = null; return; }
        d += (prev && Math.abs(q[1] - prev[1]) < span * 1.5 ? 'L' : 'M') + f1(sx(q[0])) + ' ' + f1(sy(q[1]));
        prev = q;
      });
      if (d) o.push('<path class="pr-vg-c pr-vg-c' + (ci % 4) + '" clip-path="url(#' + id + ')" d="' + d + '"/>');
    });
    g.vl.forEach(function (v) {
      if (!isFinite(v.x)) return;
      o.push('<line class="pr-vg-v" x1="' + f1(sx(v.x)) + '" y1="' + T + '" x2="' + f1(sx(v.x)) + '" y2="' + (H - B) + '"/>');
      if (v.label) o.push('<text class="pr-vg-lab" x="' + f1(sx(v.x) + 4) + '" y="' + f1(Math.min(H - B - 6, ax - 6)) + '">' + escH(v.label) + '</text>');   // 세로선 이름은 아래쪽(위쪽 점 이름과 겹치지 않게)
    });
    g.pts.forEach(function (q) {
      if (!isFinite(q.x) || !isFinite(q.y)) return;
      var px = sx(q.x), py = sy(q.y), right = px < W - 90;
      o.push('<circle class="pr-vg-pt' + (q.open ? ' open' : '') + '" cx="' + f1(px) + '" cy="' + f1(py) + '" r="3.4"/>');
      var t = q.label ? q.label + ' ' : '';
      o.push('<text class="pr-vg-lab" x="' + f1(right ? px + 6 : px - 6) + '" y="' + f1(py < T + 14 ? py + 13 : py - 6) + '" text-anchor="' + (right ? 'start' : 'end') + '">' + escH(t + '(' + fmt(q.x) + ', ' + fmt(q.y) + ')') + '</text>');
    });
    var vx = (g.ax ? g.ax[0] : 'x').replace(/\s*\(.*$/, '') || 'x';   // 범례의 범위도 가로 변수 이름으로(물리는 t)
    var leg = g.cv.map(function (c, ci) {
      return '<span><i class="pr-vg-k' + (ci % 4) + '"></i>' + escH(c.name) + ' = ' + prettyExpr(c.src) + (c.dom ? ' <small>(' + fmt(c.dom[0]) + ' ≤ ' + escH(vx) + ' ≤ ' + fmt(c.dom[1]) + ')</small>' : '') + (c.label ? ' · ' + escH(c.label) : '') + '</span>';
    }).join('');
    return '<div class="pr-vis pr-vis-graph"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="함수 그래프">' + o.join('') + '</svg>' + (leg ? '<p class="pr-vg-leg">' + leg + '</p>' : '') + '</div>';
  }
  function mdLite(src) {
    var fo = fenceOut(src);   // 그림 블록을 먼저 떼고(안의 글자는 블록이 그린다), 그다음 수식
    src = fo.text;
    var mt = FORMULA ? mathOut(src) : null;
    if (mt) src = mt.text;
    var html = mdLiteText(src);
    if (mt && mt.list.length) html = html.replace(/\uE000(\d+)\uE001/g, function (all, k) { return mt.list[+k] ? mathHTML(mt.list[+k]) : ''; });
    if (fo.list.length) html = html.replace(/<p>\uE002(\d+)\uE003<\/p>|\uE002(\d+)\uE003/g, function (all, a, b) { var blk = fo.list[+(a || b)]; return blk ? visHTML(blk) : ''; });
    return html;
  }
  function mdLiteText(src) {
    var esc = String(src || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    function inl(x) {
      return x.replace(/“[^”]{1,40}”|‘[^’]{1,40}’|"[^"]{1,40}"/g, '<span class="pr-ai-qt">$&</span>')   // 따옴표 속 낱말(사료 키워드 등)
        .replace(/(^|[.!?]\s+)(따라서|그래서|그러므로|결국|즉|결론적으로|요컨대)(?=[,\s])/g, '$1<b class="pr-ai-tie">$2</b>')   // 결론을 여는 말
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
        .replace(/[①②③④⑤]/g, '<span class="pr-ai-n">$&</span>');
    }
    function lab(x) {   // "정답: …", "**핵심**: …" → 이름표와 내용
      var m = /^\*\*([^*]{1,16}?)\*\*\s*[:：]\s*(.*)$/.exec(x) || /^([가-힣A-Za-z][가-힣A-Za-z0-9·]*(?: [가-힣A-Za-z0-9·]+){0,2})\s*[:：]\s+(.+)$/.exec(x);
      return m ? { k: m[1], v: m[2] } : null;
    }
    function line(x) { var l = lab(x); return l ? '<b class="pr-ai-lab">' + inl(l.k) + '</b> ' + inl(l.v) : inl(x); }
    var out = [], cur = null;
    function flush() {
      if (!cur) return;
      if (cur.t === 'ul') out.push('<ul>' + cur.items.map(function (x) { return '<li>' + line(x) + '</li>'; }).join('') + '</ul>');
      else if (cur.t === 'ol') out.push('<ol' + (cur.start > 1 ? ' start="' + cur.start + '"' : '') + '>' + cur.items.map(function (x) { return '<li>' + line(x) + '</li>'; }).join('') + '</ol>');
      else if (cur.t === 'q') out.push('<div class="pr-ai-call">' + cur.lines.map(line).join('<br>') + '</div>');
      else if (cur.t === 'tb') out.push('<div class="pr-ai-tbl"><table>' + cur.rows.map(function (r, i) { return '<tr>' + r.map(function (c) { return i ? '<td>' + inl(c) + '</td>' : '<th>' + inl(c) + '</th>'; }).join('') + '</tr>'; }).join('') + '</table></div>');
      else {
        var l0 = lab(cur.lines[0]);
        if (l0 && AI_KEYL.test(l0.k)) out.push('<div class="pr-ai-call">' + cur.lines.map(line).join('<br>') + '</div>');
        else prose(cur.lines);
      }
      cur = null;
    }
    /* 줄글: 결론·핵심 문장은 진하게, 긴 줄은 두 문장씩 끊어 문단으로(짧은 줄은 그대로 한 문단에 줄바꿈으로) */
    function sents(x) { return x.replace(/([가-힣A-Za-z0-9)”’"][.!?])\s+(?=\S)/g, '$1\u0001').split('\u0001'); }
    function keyS(x) { return sents(x).map(function (z) { return AI_KEYS.test(z) ? '<span class="pr-ai-ks">' + inl(z) + '</span>' : inl(z); }).join(' '); }
    function lineK(x) { var l = lab(x); return l ? '<b class="pr-ai-lab">' + inl(l.k) + '</b> ' + keyS(l.v) : keyS(x); }
    function prose(lines) {
      var buf = [];
      function put() { if (buf.length) out.push('<p>' + buf.map(lineK).join('<br>') + '</p>'); buf = []; }
      lines.forEach(function (x) {
        var ss = sents(x);
        if (x.length < 150 || ss.length < 3) { buf.push(x); return; }
        put();
        for (var k = 0; k < ss.length; k += 2) out.push('<p>' + lineK(ss.slice(k, k + 2).join(' ')) + '</p>');
      });
      put();
    }
    function open(t, extra) { if (!cur || cur.t !== t) { flush(); cur = Object.assign({ t: t }, extra); } }
    esc.split('\n').forEach(function (raw) {
      var t = raw.trim(), m;
      if (!t) { flush(); return; }
      if ((m = /^#{1,4}\s+(.+)$/.exec(t)) || (m = /^\*\*([^*]+)\*\*\s*[:：]?$/.exec(t))) { flush(); out.push('<h5 class="pr-ai-h">' + inl(m[1]) + '</h5>'); return; }
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flush(); out.push('<hr>'); return; }
      if (/^\|.*\|$/.test(t)) { open('tb', { rows: [] }); if (!/^\|[\s:|-]+\|$/.test(t)) cur.rows.push(t.slice(1, -1).split('|').map(function (c) { return c.trim(); })); return; }
      if ((m = /^[-•*]\s+(.+)$/.exec(t))) { open('ul', { items: [] }); cur.items.push(m[1]); return; }
      if ((m = /^(\d{1,2})[.)]\s+(.+)$/.exec(t))) { open('ol', { items: [], start: +m[1] }); cur.items.push(m[2]); return; }
      if ((m = /^&gt;\s?(.*)$/.exec(t))) { open('q', { lines: [] }); cur.lines.push(m[1]); return; }
      open('p', { lines: [] }); cur.lines.push(t);
    });
    flush();
    return out.join('');
  }
  /* 실행 상태: turns = [{q?, a}] (첫 턴은 해설, 이후는 추가 질문), msgs = API로 보낸 대화(어시스턴트 응답은 content 그대로 덧붙임).
   * status: idle · ask(시작 확인) · nokey · run · done · err · load(계정에 둔 것을 받는 중) */
  function aiRun(id) {
    if (!aiRuns[id]) {
      var c = store('sn:ai:' + id);
      aiRuns[id] = c && c.turns
        ? { id: id, status: 'done', turns: c.turns, usage: c.u || null, chips: c.c || [], weak: c.w || null, msgs: null }
        : { id: id, status: 'idle', turns: [], usage: null, msgs: null };
      if (aiCloudOn() && aiIdx && aiIdx[id] > aiT(c)) aiLoad(aiRuns[id]);
    }
    return aiRuns[id];
  }
  /* 그 자리에서 이어 묻기·다시 만들기를 하려면 처음 요청을 다시 만들 수 있어야 한다(저장해 둔 해설을 그냥 보여 주는 칸도) */
  function aiNeed(id, build) { var r = aiRun(id); if (!r.build) r.build = build; return r; }

  /* ───────── 계정에 둔 AI 해설: 로그인하면 이 과목 목록(이름·고친 시각)만 받아 두고(aiIdx), 내용은 그 해설 칸을 열 때 받아 이 기기에도 남긴다.
   * 이 기기에만 있거나 이 기기 것이 더 새 것이면 계정으로 올린다 — 휴대폰·컴퓨터 어디서 받은 해설이든 다시 요청(요금) 없이 본다.
   * 이 기기 저장 모양: sn:ai:<id> = { turns, u, c, w, t(고친 시각 ms · 예전 것은 없음 = 1로 친다), x(서버가 받지 않음) } ───────── */
  var aiIdx = null, aiWant = [], aiWantT = 0, AI_GET = 20;
  function aiCloudOn() { return !!(meUser && meUser.id && window.SnAuth && SnAuth.aiGet); }
  function aiT(v) { return v && v.turns ? v.t || 1 : 0; }
  function aiKeep(id, v) {   // 새로 받은(이어 물은) 해설: 이 기기에 남기고 계정에도
    v.t = Date.now();
    store('sn:ai:' + id, v);
    aiUp(id, v);
  }
  function aiUp(id, v) {
    if (!aiCloudOn() || !v || !v.turns) return Promise.resolve();
    var ts = aiT(v);
    return SnAuth.saveAiNote(id, SUB, { turns: v.turns, u: v.u || null, c: v.c || [], w: v.w || null }, ts).then(function (ok) {
      if (!ok) { var cur = store('sn:ai:' + id); if (cur && aiT(cur) === ts) { cur.x = 1; store('sn:ai:' + id, cur); } return; }
      if (!aiIdx) aiIdx = {};
      if ((aiIdx[id] || 0) < ts) aiIdx[id] = ts;
      var r = aiRuns[id];
      if (r && r.status === 'done') aiPaintAll(id);   // ☁️ 저장됨 표시
    }).catch(function () {});
  }
  /* 계정 것을 받는다: 이 기기에 없으면 '불러오는 중', 있으면(계정 것이 더 새 것) 이 기기 것을 보이다가 바꿔 넣는다 */
  function aiLoad(r) {
    if (r.status === 'idle') r.status = 'load';
    else if (r.status === 'done') r.stale = 1;
    else return;
    if (aiWant.indexOf(r.id) < 0) aiWant.push(r.id);
    if (!aiWantT) aiWantT = setTimeout(function () {
      aiWantT = 0;
      var ids = aiWant.splice(0, aiWant.length);
      for (var k = 0; k < ids.length; k += AI_GET) aiGetPart(ids.slice(k, k + AI_GET));
    }, 0);
    aiPaintAll(r.id);
  }
  function aiGetPart(ids) {
    SnAuth.aiGet(SUB, ids).then(function (rows) {
      var got = {};
      (rows || []).forEach(function (row) { if (row && row.data && Array.isArray(row.data.turns)) { got[row.id] = 1; aiTake(row); } });
      ids.forEach(function (id) { if (!got[id]) aiMiss(id, false); });
    }).catch(function () { ids.forEach(function (id) { aiMiss(id, true); }); });
  }
  function aiTake(row) {
    var v = row.data, id = row.id, r = aiRuns[id];
    v.t = row.ts;
    if (aiT(store('sn:ai:' + id)) < row.ts) store('sn:ai:' + id, v);   // 저장 공간이 차면 이번에는 화면에만
    if (!r || !(r.status === 'load' || (r.status === 'done' && r.stale))) return;
    r.status = 'done'; r.stale = 0; r.after = null;
    r.turns = v.turns; r.usage = v.u || null; r.chips = v.c || []; r.weak = v.w || null; r.msgs = null;
    aiPaintAll(id);
  }
  /* 받지 못함: 망 오류면 '다시 시도'로 다시 받고, 계정에 없으면 처음 상태로(그사이 AI 해설을 누른 칸은 시작 확인으로) */
  function aiMiss(id, net) {
    var r = aiRuns[id];
    if (!net && aiIdx) delete aiIdx[id];
    if (!r) return;
    if (r.stale) { r.stale = 0; return; }   // 이 기기 것을 그대로 본다
    if (r.status !== 'load') return;
    if (r.after) { var f = r.after; r.after = null; r.status = 'idle'; f(); return; }
    if (net) {
      r.status = 'err'; r.err = '계정에 저장해 둔 AI 해설을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.';
      r.retry = function () { r.retry = null; r.status = 'idle'; aiLoad(r); };
    } else r.status = 'idle';
    aiPaintAll(id);
  }
  /* 로그인 뒤 한 번(그리고 1분 넘게 다른 곳에 있다 이 탭으로 돌아올 때 — 그사이 다른 기기에서 받은 해설): 목록을 받아,
   * 이미 그린 칸 중 계정 것이 있거나 더 새 것을 받고, 이 기기에만 있는(더 새) 것은 3개씩 올린다 */
  var aiSyncAt = 0;
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && aiSyncAt && Date.now() - aiSyncAt > 60000) aiSync();
  });
  function aiSync() {
    if (!aiCloudOn() || !SnAuth.aiIndex) return;
    aiSyncAt = Date.now();
    SnAuth.aiIndex(SUB).then(function (rows) {
      var m = {};
      (rows || []).forEach(function (x) { if (x && typeof x.id === 'string' && x.ts > 0) m[x.id] = x.ts; });
      if (aiIdx) for (var k in aiIdx) if ((m[k] || 0) < aiIdx[k]) m[k] = aiIdx[k];   // 그사이 올린 것
      aiIdx = m;
      Object.keys(aiRuns).forEach(function (id) {
        var r = aiRuns[id];
        if (aiIdx[id] > aiT(store('sn:ai:' + id)) && (r.status === 'idle' || r.status === 'done')) aiLoad(r);
      });
      if (!PAPER) S.items.forEach(function (it, i) {
        if ((!isShown(i) && aiIdx[hintAiId(i)] && aiRun(hintAiId(i)).status === 'load') || (isShown(i) && aiIdx[itemAiId(i)] && aiRun(itemAiId(i)).status === 'load')) refreshCard(i);
      });
      aiPush();
    }).catch(function () {});
  }
  function aiPush() {
    var ids = [], re = new RegExp('^sn:ai:([qxswh]:' + SUB + '(?::.*)?)$');
    try {
      for (var k = 0; k < localStorage.length; k++) { var mm = re.exec(localStorage.key(k) || ''); if (mm) ids.push(mm[1]); }
    } catch (e) { return; }
    var q = ids.filter(function (id) { var v = store('sn:ai:' + id); return v && v.turns && !v.x && aiT(v) > (aiIdx[id] || 0); });
    var next = function () { var id = q.shift(); if (id) aiUp(id, store('sn:ai:' + id)).then(next); };
    for (var n = 0; n < 3; n++) next();
  }
  function aiPaintAll(id) {
    var r = aiRuns[id];
    if (!r || r.tm) return;
    r.tm = setTimeout(function () {
      r.tm = 0;
      var nodes = root.querySelectorAll('[data-ai]');
      for (var k = 0; k < nodes.length; k++) if (nodes[k].getAttribute('data-ai') === id) aiPaint(nodes[k], r);
    }, 60);
  }
  function aiBox(id) {
    var b = el('div', { class: 'pr-ai', 'data-ai': id });
    aiPaint(b, aiRun(id));
    return b;
  }
  /* 모델이 "===정답===" 줄 뒤에 쓴 부분은 접어 둔다(힌트·변형 문제). "===약점===" 줄 뒤는 약점 노트 한 줄 */
  function aiAnswer(text, r) {
    var wk = text.indexOf('===약점===');
    var note = wk >= 0 && r && r.weak ? weakParse(text, r.weak) : null;
    if (wk >= 0) text = text.slice(0, wk);
    var d = aiAnswerBody(text, r);
    if (note) {
      var has = weakHas(note.q);
      d.appendChild(el('div', { class: 'pr-weak-chip' + (has ? ' on' : '') }, [
        el('span', { text: '📌 ' + note.g + ' · ' + note.k + (note.t ? ' — ' + note.t : '') }),
        el('button', { type: 'button', class: 'pr-ai-link', text: has ? '약점 노트에서 빼기' : '약점 노트에 넣기', onclick: function () { if (has) weakDel(note.q); else weakAdd(note); aiPaintAll(r.id); } })
      ]));
    }
    return d;
  }
  /* 짧은 해설 / 자세한 해설: 모델이 "===자세히===" 줄 앞에 쓴 짧은 해설만 먼저 보이고 나머지는 접는다.
   * 그 줄이 없는 예전의 긴 답(500자 넘게)은 앞 문단(260자쯤)만 보이고 나머지를 접는다 */
  function aiSplit(t) {
    var m = t.indexOf('===자세히===');
    if (m >= 0) return { short: t.slice(0, m), long: t.slice(m + 9).replace(/^=*\s*/, '') };
    if (t.length < 500) return { short: t, long: '' };
    var blocks = t.split(/\n{2,}/), acc = '', i = 0;
    while (i < blocks.length && (i < 1 || acc.length < 260)) { acc += (acc ? '\n\n' : '') + blocks[i]; i++; }
    var rest = blocks.slice(i).join('\n\n');
    return rest.trim().length > 120 ? { short: acc, long: rest } : { short: t, long: '' };
  }
  function aiAnswerBody(text, r) {
    var k = text.indexOf('===정답===');
    var sp = aiSplit(k < 0 ? text : text.slice(0, k));
    var d = el('div', { class: 'pr-ai-body pr-exp-body has', html: mdLite(sp.short) });
    if (sp.long.trim()) {
      var det = el('details', { class: 'pr-ai-fold pr-ai-more' }, [el('summary', { text: '📖 자세한 해설 보기' }), el('div', { html: mdLite(sp.long) })]);
      if (r && r.more) det.open = true;   // 받는 동안 다시 그려도 펼친 채로
      det.firstChild.textContent = det.open ? '📖 자세한 해설 접기' : '📖 자세한 해설 보기';
      det.addEventListener('toggle', function () { if (r) r.more = det.open; det.firstChild.textContent = det.open ? '📖 자세한 해설 접기' : '📖 자세한 해설 보기'; });
      d.appendChild(det);
    }
    if (k >= 0) d.appendChild(el('details', { class: 'pr-ai-fold' }, [el('summary', { text: '정답·풀이 보기' }), el('div', { html: mdLite(text.slice(k + 9)) })]));
    return d;
  }
  function spent() { return store('sn:ai:spent') || { usd: 0, n: 0 }; }
  function aiPaint(b, r) {
    b.innerHTML = '';
    if (r.status === 'idle') { b.appendChild(el('p', { class: 'pr-ai-wait', text: '⏳ 차례를 기다리는 중' })); return; }
    if (r.status === 'load') { b.appendChild(el('p', { class: 'pr-ai-wait', text: '☁️ 내 계정에 저장해 둔 AI 해설을 불러오는 중…' })); return; }
    if (r.status === 'ask') {
      b.appendChild(el('div', { class: 'pr-ai-askbox' }, [
        el('p', { class: 'pr-ai-ask-h', text: '🤖 AI에게 물어볼까요?' }),
        el('p', { class: 'pr-ai-ask-w', text: r.what || '같은 자료로 AI 해설을 처음부터 다시 받아요.' }),
        el('p', { class: 'pr-ai-ask-c', text: (keyMode() === 'acct' ? '계정에 넣어 둔' : '이 브라우저에 넣어 둔') + ' 내 Anthropic API 키로 요청해요(요금이 조금 들어요).' }),
        el('div', { class: 'pr-ai-keyrow' }, [
          el('button', { type: 'button', class: 'pr-btn pr-ai-go', text: '시작', onclick: function () { if (r.go) r.go(); } }),
          el('button', { type: 'button', class: 'pr-btn', text: '취소', onclick: function () { aiCancel(r); } })
        ])
      ]));
      return;
    }
    if (r.status === 'nokey') {
      var acct = !!(meUser && meUser.id && window.SnAuth && SnAuth.saveAiKey);
      var inp = el('input', { type: 'password', class: 'pr-ai-key', placeholder: 'sk-ant-…', autocomplete: 'off', 'aria-label': 'Anthropic API 키' });
      var say = el('p', { class: 'pr-ai-err', 'aria-live': 'polite', hidden: true });
      var again = function () { r.retry ? r.retry() : aiStart(r.id, r.build); };
      var go = function () {
        var v = inp.value.trim();
        if (!v) return;
        if (!acct) { store(AI_KEY, v); again(); return; }
        say.hidden = false;
        say.textContent = '키를 확인하는 중…';
        SnAuth.saveAiKey(v).then(function (j) { acctKey = j; again(); }).catch(function (e) {
          say.textContent = e.code === 'bad key' ? '키 모양이 맞지 않아요. sk-ant- 로 시작하는 키를 그대로 붙여 넣어 주세요.'
            : e.code === 'key rejected' ? 'Anthropic이 이 키를 받지 않았어요. 콘솔에서 키가 살아 있는지 확인해 주세요.'
            : e.code === 'login' ? '로그인이 풀렸어요. 다시 로그인해 주세요.' : '저장하지 못했어요. 잠시 뒤 다시 해 주세요.';
        });
      };
      inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); go(); } });
      var where = acct
        ? '키는 <b>내 계정에 암호화해 저장</b>되어 휴대폰·컴퓨터 어디서 로그인해도 쓸 수 있고, 키 원문은 다시 화면으로 내려오지 않습니다. 요청은 나나메이트 서버가 이 키로 대신 전달합니다.'
        : '키는 <b>이 기기 브라우저에만</b> 저장되고 나나메이트 서버로는 보내지 않습니다. 로그인하면 계정에 저장해 다른 기기에서도 쓸 수 있어요.';
      b.appendChild(el('p', { class: 'pr-ai-note', html: (r.err ? '<b>' + r.err + '</b><br>' : '') + 'AI 해설은 <b>내 Anthropic API 키</b>로 요청합니다. ' + where + ' Claude 구독(Pro·Max)과는 별개로 API 사용량만큼 과금됩니다(문항 해설 1회 약 $0.05~0.2). 키 발급: <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>' }));
      b.appendChild(el('div', { class: 'pr-ai-keyrow' }, [inp, el('button', { type: 'button', class: 'pr-btn', text: acct ? '계정에 저장하고 요청' : '저장하고 요청', onclick: go })]));
      b.appendChild(say);
      return;
    }
    r.turns.forEach(function (t, k) {
      if (t.q) b.appendChild(el('p', { class: 'pr-ai-q', text: t.q }));
      if (t.a) b.appendChild(aiAnswer(t.a, k === 0 ? r : null));
      else if (r.status === 'run' && k === r.turns.length - 1) b.appendChild(el('p', { class: 'pr-ai-wait', text: '🤖 읽고 생각하는 중… (수십 초 걸릴 수 있어요)' }));
    });
    if (r.status === 'run') { if (r.turns.length && r.turns[r.turns.length - 1].a) b.appendChild(el('p', { class: 'pr-ai-wait', text: '쓰는 중…' })); return; }
    if (r.status === 'err') {
      b.appendChild(el('p', { class: 'pr-ai-err', text: r.err }));
      b.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '다시 시도', onclick: function () { r.retry ? r.retry() : aiStart(r.id, r.build, true); } }));
      return;
    }
    if (r.status !== 'done') return;
    /* 추가 질문: 바로 쓰는 질문 칩 + 직접 입력 */
    var ask = function (q, label) { q = String(q || '').trim(); if (q) aiFollow(r.id, q, label); };
    var qi = el('input', { type: 'text', class: 'pr-ai-key pr-ai-ask', placeholder: '이 해설에 더 물어보기…', 'aria-label': '추가 질문' });
    qi.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); ask(qi.value); } });
    var chips = el('div', { class: 'pr-ai-chips' });
    (r.chips || []).forEach(function (c) { chips.appendChild(el('button', { type: 'button', class: 'pr-ai-chip', text: c[0], onclick: function () { ask(c[1], c[0]); } })); });
    b.appendChild(chips);
    b.appendChild(el('div', { class: 'pr-ai-keyrow' }, [qi, el('button', { type: 'button', class: 'pr-btn', text: '묻기', onclick: function () { ask(qi.value); } })]));
    var foot = el('div', { class: 'pr-ai-foot' });
    if (r.usage) {
      var cost = r.usage.input_tokens * 4e-6 + r.usage.output_tokens * 20e-6;
      foot.appendChild(el('span', { text: '🤖 Claude Opus 5.5 · 입력 ' + r.usage.input_tokens + ' · 출력 ' + r.usage.output_tokens + ' 토큰 (약 $' + cost.toFixed(3) + ') · 누적 약 $' + spent().usd.toFixed(2) }));
    }
    if (aiCloudOn() && aiIdx && aiIdx[r.id]) foot.appendChild(el('span', { class: 'pr-ai-saved', text: '☁️ 내 계정에 저장됨 · 다른 기기에서도 보여요' }));
    else if (!aiCloudOn() && store('sn:ai:' + r.id)) foot.appendChild(el('span', { class: 'pr-ai-saved', text: '이 기기에만 저장됨 · 로그인하면 계정에도 저장돼요' }));
    if (r.build) foot.appendChild(el('button', { type: 'button', class: 'pr-ai-link', text: '처음부터 다시 생성', onclick: function () { aiStart(r.id, r.build, true, null, function () { store('sn:ai:' + r.id, null); }); } }));
    var rm = el('button', { type: 'button', class: 'pr-ai-link', text: keyMode() === 'acct' ? '계정의 API 키 지우기' : 'API 키 지우기', onclick: function () {
      if (keyMode() === 'acct') SnAuth.saveAiKey(null).then(function () { acctKey = { has: false }; rm.textContent = '계정에서 키를 지웠습니다'; }).catch(function () { rm.textContent = '지우지 못했어요'; });
      else { store(AI_KEY, null); rm.textContent = '키를 지웠습니다'; }
    } });
    foot.appendChild(rm);
    b.appendChild(foot);
  }
  function aiErr(e) {
    var A = SDK || {}, t = errType(e);
    if (t === 'nanamate_login') return { msg: '로그인이 풀렸어요. 다시 로그인한 뒤 시도해 주세요.' };
    if (t === 'nanamate_nokey') return { key: 1, msg: '계정에 저장된 API 키가 없습니다. 키를 넣어 주세요.' };
    if (keyMode() === 'acct' && A.AuthenticationError && e instanceof A.AuthenticationError) return { key: 1, msg: '계정에 저장한 API 키를 Anthropic이 받지 않습니다. 새 키를 넣어 주세요.' };
    if (A.AuthenticationError && e instanceof A.AuthenticationError) return { key: 1, msg: 'API 키가 올바르지 않습니다. 다시 넣어 주세요.' };
    if (A.PermissionDeniedError && e instanceof A.PermissionDeniedError) return { key: 1, msg: '이 키로는 이 모델을 쓸 권한이 없습니다.' };
    if (A.RateLimitError && e instanceof A.RateLimitError) return { msg: '요청 한도에 걸렸습니다. 잠시 뒤 다시 시도해 주세요.' };
    if (A.APIConnectionError && e instanceof A.APIConnectionError) return { msg: 'Anthropic에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.' };
    if (A.APIError && e instanceof A.APIError) return { msg: 'API 오류 ' + (e.status || '') + ': ' + ((e.error && e.error.error && e.error.error.message) || e.message) };
    if (!SDK) return { msg: 'AI 라이브러리를 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.' };
    return { msg: String(e && e.message || e) };
  }
  /* r.msgs 끝(사용자 턴)에 대한 답을 r.turns 마지막 칸에 받아 쓴다 */
  function aiSend(r) {
    var turn = r.turns[r.turns.length - 1];
    r.status = 'run'; r.err = ''; turn.a = '';
    aiPaintAll(r.id);
    return loadSdk().then(function (Anthropic) {
      var client = keyMode() === 'acct'
        ? new Anthropic({ apiKey: 'account', baseURL: location.origin + '/api/claude', dangerouslyAllowBrowser: true })
        : new Anthropic({ apiKey: store(AI_KEY), dangerouslyAllowBrowser: true });
      var stream = client.beta.messages.stream({
        model: AI_MODEL, max_tokens: 64000,
        betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
        thinking: { type: 'adaptive' }, output_config: { effort: 'high' },
        system: AI_SYS,
        messages: r.msgs
      });
      stream.on('text', function (d) { turn.a += d; aiPaintAll(r.id); });
      return stream.finalMessage();
    }).then(function (msg) {
      if (msg.stop_reason === 'refusal') { r.status = 'err'; r.err = '모델이 이 요청에 답하지 않았습니다. 다시 시도해 보세요.'; turn.a = ''; aiPaintAll(r.id); return; }
      if (msg.stop_reason === 'max_tokens') turn.a += '\n\n(길이 제한으로 잘렸습니다)';
      r.msgs.push({ role: 'assistant', content: msg.content });
      r.status = 'done';
      var u = msg.usage || {}, inT = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0), outT = u.output_tokens || 0;
      r.usage = { input_tokens: (r.usage ? r.usage.input_tokens : 0) + inT, output_tokens: (r.usage ? r.usage.output_tokens : 0) + outT };
      var sp = spent();
      store('sn:ai:spent', { usd: sp.usd + inT * 4e-6 + outT * 20e-6, n: sp.n + 1 });
      if (r.turns.length === 1 && r.weak && r.weak.auto) { var wn = weakParse(turn.a, r.weak); if (wn) weakAdd(wn); }
      if (r.persist) aiKeep(r.id, { turns: r.turns, u: r.usage, c: r.chips, w: r.weak });
      aiPaintAll(r.id);
    }).catch(function (e) {
      var x = aiErr(e);
      if (x.key) { if (keyMode() === 'acct') acctKey = { has: false }; else store(AI_KEY, null); }
      r.status = x.key ? 'nokey' : 'err'; r.err = x.msg; turn.a = '';
      aiPaintAll(r.id);
    });
  }
  /* AI 를 새로 부르기 전 확인: 창을 띄우지 않고 그 자리(옆 칸·문항 칸)에서 '무엇을 보내 무엇을 받는지'를 보이고 [시작]/[취소]
   * (저장된 결과를 다시 볼 때는 묻지 않는다). 취소하면 정답도 열지 않는다 */
  function aiCancel(r) {
    r.status = r.back || 'idle'; r.go = null;
    if (r.status !== 'idle') { aiPaintAll(r.id); return; }
    Array.prototype.forEach.call(root.querySelectorAll('[data-ai]'), function (n) {
      if (n.getAttribute('data-ai') !== r.id) return;
      if (aiDlg && aiDlg.open && aiDlg.contains(n)) aiDlg.close();
      var w = n.closest('.pr-hint') || n; if (w.parentNode) w.parentNode.removeChild(w);
    });
  }
  /* 채점 전에 맞고 틀림이 드러나지 않게 같은 말로 쓴다 */
  function aiWhatItem(label, it, a, opens) {
    return label + ' — 문항 그림, 내 답(' + (a > 0 ? ansText(it, a) : '없음') + ')·정답·해설' + (noteFilled(it) ? '·내 메모' : '') + '을 보내 해설과 내 답 분석을 받아요.' + (opens ? ' 이 문항 정답도 열려요.' : '');
  }
  /* build(): Promise<{ content:[...], persist?, chips? }> — 같은 id는 다시 요청하지 않는다(force면 새로). what: 확인창에 보일 '무엇을 분석하나'.
     확인창에서 취소하면 상태를 그대로 두고 돌아간다(처음이면 'idle' — 부른 쪽은 아무것도 띄우지 않는다) */
  function aiStart(id, build, force, what, onGo) {
    var r = aiRun(id);
    r.build = build;
    if (what) r.what = what;
    if (r.status === 'load') { r.after = function () { aiStart(id, build, force, what, onGo); }; return r; }
    if (r.status === 'run' || (r.status === 'done' && !force)) return r;
    if (!keyMode()) { r.status = 'nokey'; aiPaintAll(id); return r; }
    if (r.status !== 'ask') r.back = r.status;   // 취소하면 돌아갈 상태
    r.status = 'ask';
    r.go = function () { r.go = null; if (onGo) onGo(); aiRunNow(r, id, build); };
    aiPaintAll(id);
    return r;
  }
  function aiRunNow(r, id, build) {
    r.turns = [{ a: '' }]; r.usage = null; r.msgs = null; r.retry = null;
    r.status = 'run'; aiPaintAll(id);
    return build().then(function (req) {
      r.persist = !!req.persist; r.chips = req.chips || []; r.weak = req.weak || null;
      r.msgs = [{ role: 'user', content: req.content }];
      return aiSend(r);
    }).catch(function (e) { r.status = 'err'; r.err = aiErr(e).msg; aiPaintAll(id); });
  }
  /* 추가 질문 — 캐시에서 불러온 해설이면 첫 요청을 다시 만들고 이전 답을 글로 붙여 대화를 잇는다 */
  function aiFollow(id, q, label) {
    var r = aiRun(id);
    if (r.status !== 'done') return;
    r.turns.push(label ? { q: label, p: q, a: '' } : { q: q, a: '' });
    var go = function () {
      r.retry = go;
      if (!keyMode()) { r.status = 'nokey'; aiPaintAll(id); return; }
      var ready = r.msgs ? Promise.resolve() : r.build().then(function (req) {
        r.chips = req.chips || []; r.persist = !!req.persist;
        r.msgs = [{ role: 'user', content: req.content }];
        r.turns.slice(0, -1).forEach(function (t, k) {
          if (k) r.msgs.push({ role: 'user', content: t.p || t.q });
          r.msgs.push({ role: 'assistant', content: t.a });
        });
      });
      ready.then(function () {
        if (r.msgs[r.msgs.length - 1].role !== 'user') r.msgs.push({ role: 'user', content: q });
        return aiSend(r);
      }).catch(function (e) { r.status = 'err'; r.err = aiErr(e).msg; aiPaintAll(id); });
    };
    go();
  }
  /* AI 분석·해설·오답 노트 칸: 시험지를 가리지 않게 옆(휴대폰은 아래)에 붙여 연다 — 어둡게 덮지 않고, 시험지는 그대로 보고 넘길 수 있다.
   * 넓은 화면은 본문을 칸 폭만큼 왼쪽으로 비켜(body.pr-dock) 시험지·답안지가 칸 밑에 숨지 않는다. 닫기: ✕ 또는 Esc */
  /* 크게 보기: 옆 칸 → 화면 대부분(휴대폰은 화면 전체) + 글자 크게. 다시 누르면 옆 칸으로. 이 기기에 기억한다 */
  var AI_BIG = 'sn:pr:aibig';
  function aiBig() { return !!store(AI_BIG); }
  function paintBig(btn) {
    var on = aiBig();
    document.body.classList.toggle('pr-ai-big', on);
    if (btn) { btn.textContent = on ? '⤡ 작게' : '⤢ 크게'; btn.title = on ? '옆 칸으로 작게 — 시험지를 보면서 읽기' : '크게 보기 — 넓은 칸·큰 글자로 읽기'; btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  }
  function showDlg(title, node) {
    if (!aiDlg) {
      aiDlg = el('dialog', { class: 'pr-ai-dlg', 'aria-label': 'AI 해설' });
      aiDlg.addEventListener('close', function () { document.body.classList.remove('pr-dock'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && aiDlg.open) aiDlg.close(); });
      root.appendChild(aiDlg);
    }
    aiDlg.innerHTML = '';
    var big = el('button', { type: 'button', class: 'pr-ai-size', onclick: function () { store(AI_BIG, aiBig() ? null : 1); paintBig(big); } });
    paintBig(big);
    aiDlg.appendChild(el('div', { class: 'pr-ai-head' }, [el('b', { text: title }), el('span', { class: 'pr-ai-tools' }, [big, el('button', { type: 'button', class: 'pr-ai-x', 'aria-label': '닫기', text: '✕', onclick: function () { aiDlg.close(); } })])]));
    aiDlg.appendChild(node);
    document.body.classList.add('pr-dock');
    if (!aiDlg.open) aiDlg.show();
    aiDlg.scrollTop = 0;
  }
  function openAi(title, id, build, what) {
    if (aiStart(id, build, false, what).status === 'idle') return;   // 확인창에서 취소
    showDlg(title, aiBox(id));
  }

  /* ───────── ✏️ 펜(낙서): 시험지 단·문항 그림 위에 펜·형광펜으로 쓰고 지우개로 획째 지운다. T(글자)는 누른 자리에 글자를 쳐 넣는다.
     그림마다 SVG 층 하나(가로 1000 기준 좌표)라 화면 폭이 바뀌어도 제자리에 남고, 이 기기에 sn:<과목>:ink:<회차>:<그림> 로 저장한다
     (획 {t:'pen'|'hl', w, p:[x,y…]} · 글자 {t:'tx', x, y, s(글자 크기), v(내용)}).
     펜슬(애플 펜슬·S펜)은 언제나 바로 써지고, 마우스는 끌면 써진다(그냥 누르면 ①~⑤ 고르기만). 손가락은 ✏️ 펜을 켜야 써지고 그동안 두 손가락으로 화면을 움직인다 ───────── */
  var INK = { on: false, tool: 'pen', cur: null }, inkBtn = null, inkPal = null, inkTouch = {}, inkPan = false, inkDrew = 0;
  var INK_TOOL = { pen: { px: 2.4, lo: 2, hi: 9 }, hl: { px: 14, lo: 10, hi: 30 } };   // 굵기: 그릴 때 화면 px 를 그림 좌표로 바꿔 둔다(그림과 같이 커지고 작아진다)
  var INK_TX = { px: 16, lo: 8, hi: 90 };   // 글자 크기도 같은 식(화면 16px)
  function inkKey(exam, file) { return 'sn:' + SUB + ':ink:' + exam + ':' + String(file).replace(/\..*$/, ''); }   // c10.66ebca.webp(다시 자른 단)도 c10
  function svgEl(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function inkD(p) {
    var d = 'M' + p[0] + ' ' + p[1];
    for (var i = 2; i < p.length; i += 2) d += 'L' + p[i] + ' ' + p[i + 1];
    return p.length === 2 ? d + 'l0 .1' : d;   // 한 번 콕 → 점
  }
  function inkPath(s) { return svgEl('path', { d: inkD(s.p), class: 'pr-ink-' + s.t, 'stroke-width': s.w }); }
  /* 글자: 줄마다 tspan, (x, y)는 글상자 왼쪽 위 */
  function inkText(s) {
    var t = svgEl('text', { class: 'pr-ink-tx', x: s.x, y: s.y, 'font-size': s.s });
    String(s.v).split('\n').forEach(function (line, k) {
      var sp = svgEl('tspan', { x: s.x, dy: k ? '1.25em' : '0.8em' });   // 첫 줄 기준선: 글자 칸(줄 높이 1.25)과 같은 자리
      sp.textContent = line || ' ';
      t.appendChild(sp);
    });
    return t;
  }
  function inkNode(s) { return s.t === 'tx' ? inkText(s) : inkPath(s); }   // 층의 자식 하나 = 저장 항목 하나(지울 때 같은 번호)
  function inkLoad(svg) {
    svg.textContent = '';
    svg._s = store(svg._k) || [];
    svg._s.forEach(function (s) { svg.appendChild(inkNode(s)); });
  }
  /* w·h = 그림 원래 크기(비율). 저장된 획을 그려 둔 층 */
  function inkSvg(key, w, h, cls) {
    var svg = svgEl('svg', { class: cls, viewBox: '0 0 1000 ' + (w && h ? Math.round(1000 * h / w) : 1000), preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    svg._k = key;
    inkLoad(svg);
    return svg;
  }
  /* 그림을 잉크 층과 함께 감싼다. w·h 를 모르면(문항 그림) 불러온 뒤 맞춘다. rw = 쓸 수 있는 층(풀이 목록) — 손가락·펜슬·마우스를 감싼 상자에서 받는다 */
  function inkWrap(img, key, w, h, rw) {
    var svg = inkSvg(key, w, h, 'pr-ink' + (rw ? ' rw' : ''));
    if (!w) img.addEventListener('load', function () { svg.setAttribute('viewBox', '0 0 1000 ' + Math.round(1000 * img.naturalHeight / img.naturalWidth)); });
    var box = el('div', { class: 'pr-ink-box' }, [img, svg]);
    if (rw) {
      box.addEventListener('pointerdown', inkDown);
      box.addEventListener('pointermove', inkMove);
      box.addEventListener('touchstart', inkHold, { passive: false });
      box.addEventListener('touchmove', inkHold, { passive: false });
    }
    return box;
  }
  /* 오답 한 장·비슷한 기출처럼 보기만 하는 곳: 표시가 있을 때만 층을 얹는다 */
  function inkShow(img, key) { return store(key) ? inkWrap(img, key, 0, 0, false) : img; }
  function inkPt(svg, e) {
    var r = svg.getBoundingClientRect();
    return [Math.round((e.clientX - r.left) * 1000 / r.width), Math.round((e.clientY - r.top) * svg.viewBox.baseVal.height / r.height)];
  }
  function inkHit(s, q, r) {
    var p = s.p;
    for (var i = 0; i < p.length; i += 2) {
      var x = p[i], y = p[i + 1], dx = i + 2 < p.length ? p[i + 2] - x : 0, dy = i + 2 < p.length ? p[i + 3] - y : 0, L = dx * dx + dy * dy;
      var t = L ? Math.max(0, Math.min(1, ((q[0] - x) * dx + (q[1] - y) * dy) / L)) : 0;
      if (Math.hypot(q[0] - x - t * dx, q[1] - y - t * dy) <= r) return true;
    }
    return false;
  }
  /* 글자 상자(그림 좌표): 그려진 크기, 못 재면 글자 수로 어림 */
  function txBox(svg, i) {
    var s = svg._s[i], b = null;
    try { b = svg.childNodes[i].getBBox(); } catch (x) {}
    if (b && b.width) return { x: b.x, y: b.y, w: b.width, h: b.height };
    var lines = String(s.v).split('\n');
    return { x: s.x, y: s.y, w: s.s * 0.95 * Math.max.apply(null, lines.map(function (l) { return l.length; })), h: s.s * 1.25 * lines.length };
  }
  function txHit(svg, i, q, r) {
    var b = txBox(svg, i);
    return q[0] >= b.x - r && q[0] <= b.x + b.w + r && q[1] >= b.y - r && q[1] <= b.y + b.h + r;
  }
  function inkErase(c, q) {
    var svg = c.svg, r = 12 * 1000 / svg.getBoundingClientRect().width;   // 지우개 반경 12px
    for (var i = svg._s.length - 1; i >= 0; i--) {
      if (svg._s[i].t === 'tx' ? !txHit(svg, i, q, r) : !inkHit(svg._s[i], q, r + svg._s[i].w / 2)) continue;
      svg._s.splice(i, 1);
      svg.removeChild(svg.childNodes[i]);
      c.gone++;
    }
  }
  /* 저장하고, 같은 그림의 다른 층(오답 한 장 조각 등)도 다시 그린다 */
  function inkSave(svg) {
    store(svg._k, svg._s.length ? svg._s : null);
    Array.prototype.forEach.call(root.querySelectorAll('.pr-ink'), function (o) { if (o !== svg && o._k === svg._k) inkLoad(o); });
  }
  /* 펜슬로 쓰는 중이거나 ✏️ 펜이 켜져 있으면 화면이 끌려 가지 않게(iOS 는 펜슬도 터치 스크롤이다) */
  function inkHold(e) {
    if (e.target.closest && e.target.closest('.pr-ink-edit')) return;   // 글자 칸 안은 그대로(커서 옮기기)
    var t = e.changedTouches[0];
    if (INK.on || (t && t.touchType === 'stylus') || (INK.cur && INK.cur.kind === 'pen')) e.preventDefault();
  }
  function inkDown(e) {
    var box = e.currentTarget, c = INK.cur, kind = e.pointerType;
    if (e.target.closest && e.target.closest('.pr-ink-edit')) return;
    if (kind === 'mouse' && e.button !== 0) return;
    if (kind === 'touch') {
      inkTouch[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (!INK.on) return;   // 손가락은 ✏️ 낙서를 켰을 때만 — 아니면 스크롤
      if (Object.keys(inkTouch).length > 1) {   // 손가락 둘 = 화면 끌기(막 시작한 획은 버린다)
        if (c && c.kind === 'touch' && Date.now() - c.t0 < 500) { if (c.path) c.svg.removeChild(c.path); INK.cur = c = null; }
        if (!c) inkPan = true;
        return;
      }
    }
    if (c || inkPan) return;
    if (INK.tool === 'tx') {   // 글자: 톡 누른 자리에 글자 칸(뗄 때 연다 — 끌면 아무것도 안 한다)
      e.preventDefault();
      INK.cur = { box: box, svg: box.querySelector('.pr-ink'), id: e.pointerId, kind: kind, t0: Date.now(), x0: e.clientX, y0: e.clientY, far: 0, tx: true, hot: e.target.closest('.pr-hot') };
      return;
    }
    var drag = kind === 'mouse' && !INK.on;   // 펜을 안 켠 마우스: 끌어야 쓴다(그냥 누르면 ①~⑤ 고르기)
    e.preventDefault();
    c = INK.cur = { box: box, svg: box.querySelector('.pr-ink'), id: e.pointerId, kind: kind, t0: Date.now(), gone: 0, x0: e.clientX, y0: e.clientY, far: 0, wait: drag, hot: e.target.closest('.pr-hot') };
    if (!drag) inkStart(c, e);
  }
  function inkStart(c, e) {
    c.wait = false;
    try { c.box.setPointerCapture(c.id); } catch (x) {}
    if (INK.tool === 'er') return inkErase(c, inkPt(c.svg, e));
    var tl = INK_TOOL[INK.tool], w = tl.px * 1000 / c.svg.getBoundingClientRect().width;
    c.s = { t: INK.tool, w: Math.round(Math.max(tl.lo, Math.min(tl.hi, w)) * 10) / 10, p: inkPt(c.svg, e) };
    c.svg.appendChild(c.path = inkPath(c.s));
  }
  function inkMove(e) {   // 쓰는 중 · 두 손가락 끌기
    var c = INK.cur, tp = inkTouch[e.pointerId];
    if (tp) {
      if (inkPan) window.scrollBy({ left: (tp.x - e.clientX) / Object.keys(inkTouch).length, top: (tp.y - e.clientY) / Object.keys(inkTouch).length, behavior: 'instant' });   // 페이지의 scroll-behavior: smooth 를 건너뛴다
      tp.x = e.clientX; tp.y = e.clientY;
      if (inkPan) return;
    }
    if (!c || c.id !== e.pointerId) return;
    c.far = Math.max(c.far, Math.abs(e.clientX - c.x0) + Math.abs(e.clientY - c.y0));
    if (c.tx) return;
    if (c.wait) {
      if (c.far < 5) return;
      inkStart(c, { clientX: c.x0, clientY: c.y0 });
    }
    var evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [];
    (evs.length ? evs : [e]).forEach(function (ev) {
      var q = inkPt(c.svg, ev), p = c.s && c.s.p;
      if (!p) inkErase(c, q);
      else if (Math.abs(q[0] - p[p.length - 2]) + Math.abs(q[1] - p[p.length - 1]) >= 2) p.push(q[0], q[1]);
    });
    if (c.s) c.path.setAttribute('d', inkD(c.s.p));
  }
  /* 손을 떼면 획을 저장한다 — 창에서 받아 그리던 층이 다시 그려져 사라졌어도 손가락 기록이 남지 않는다 */
  function inkUp(e) {
    var c = INK.cur;
    if (inkTouch[e.pointerId]) { delete inkTouch[e.pointerId]; if (!Object.keys(inkTouch).length) inkPan = false; }
    if (!c || c.id !== e.pointerId) return;
    INK.cur = null;
    if (c.tx) {
      if (e.type === 'pointercancel' || c.far > 10 || !c.svg.isConnected) return;
      if (c.hot && Date.now() - c.t0 < 450) { if (c.kind !== 'mouse') c.hot.click(); return; }   // 번호를 톡 → 그 답 고르기(펜과 같게)
      txEdit(c.svg, inkPt(c.svg, { clientX: c.x0, clientY: c.y0 }));
      return;
    }
    if (c.wait) return;   // 끌지 않고 뗀 마우스 → 그대로 클릭(번호 고르기)
    if (c.s && c.hot && c.far < 8 && Date.now() - c.t0 < 450) {   // 번호를 톡 → 점 대신 그 답 고르기(마우스는 원래 클릭이 따라온다)
      c.svg.removeChild(c.path);
      if (c.kind !== 'mouse') c.hot.click();
      return;
    }
    inkDrew = Date.now();
    if (!c.svg.isConnected) return;   // 그사이 시험지를 다시 그렸으면 그 획은 버린다(새 층이 이미 저장본을 읽었다)
    if (c.s) {
      if (e.type === 'pointercancel') { c.svg.removeChild(c.path); return; }
      c.svg._s.push(c.s);
    } else if (!c.gone) return;
    inkSave(c.svg);
    inkTipDone();
  }
  window.addEventListener('pointerup', inkUp);
  window.addEventListener('pointercancel', inkUp);
  /* T 글자 칸: 누른 자리(있던 글자를 누르면 그 글자)를 고쳐 쓴다. Enter 저장 · Shift+Enter 줄 바꿈 · Esc 취소 · 다른 데를 누르면 저장, 비우면 지운다.
   * 칸은 그림 상자 안에 겹쳐 띄우고, 저장하면 SVG 글자로 바꿔 그림과 같이 커지고 작아진다(키보드 포커스는 누르는 그 순간에 줘야 아이패드 키보드가 뜬다) */
  function txSize(ta) {
    ta.style.width = '0px'; ta.style.height = '0px';
    ta.style.width = Math.max(ta.scrollWidth + 2, 48) + 'px';
    ta.style.height = ta.scrollHeight + 'px';
  }
  function txEdit(svg, q) {
    var box = svg.parentNode, k = svg.getBoundingClientRect().width / 1000, H = svg.viewBox.baseVal.height, it = null, node = null;
    for (var i = svg._s.length - 1; i >= 0; i--) if (svg._s[i].t === 'tx' && txHit(svg, i, q, 6 / k)) { it = svg._s[i]; node = svg.childNodes[i]; break; }
    if (!it) {
      var sz = Math.round(Math.max(INK_TX.lo, Math.min(INK_TX.hi, INK_TX.px / k)) * 10) / 10;
      it = { t: 'tx', x: q[0], y: Math.max(0, Math.round(q[1] - sz * 0.6)), s: sz, v: '' };   // 누른 자리가 첫 줄 가운데쯤
    }
    if (node) node.style.visibility = 'hidden';
    var ta = el('textarea', { class: 'pr-ink-edit', rows: '1', wrap: 'off', spellcheck: 'false', 'aria-label': '글자 쓰기 — Enter 저장, Shift+Enter 줄 바꿈, Esc 취소',
      style: 'left:calc(' + (it.x / 10) + '% - 4px);top:calc(' + (it.y / H * 100) + '% - 3px);font-size:' + (it.s * k).toFixed(1) + 'px' });
    ta.value = it.v;
    box.appendChild(ta);
    txSize(ta);
    ta.focus();
    var done = false;
    var finish = function (keep) {
      if (done) return;
      done = true;
      var v = ta.value.replace(/\s+$/, '');
      if (ta.parentNode) ta.parentNode.removeChild(ta);
      if (node) node.style.visibility = '';
      if (!keep || !svg.isConnected || v === it.v) return;
      var at = svg._s.indexOf(it);
      if (at >= 0 && !v) { svg._s.splice(at, 1); svg.removeChild(svg.childNodes[at]); }
      else if (at >= 0) { it.v = v; svg.replaceChild(inkNode(it), svg.childNodes[at]); }
      else if (v) { it.v = v; svg._s.push(it); svg.appendChild(inkNode(it)); }
      inkSave(svg);
      inkTipDone();
    };
    ta.addEventListener('keydown', function (ev) {
      if (ev.isComposing || ev.keyCode === 229) return;   // 한글 조합 중 Enter 는 조합을 끝낼 뿐
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); finish(true); }
      else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); finish(false); }
    });
    ta.addEventListener('input', function () { txSize(ta); });
    ta.addEventListener('blur', function () { finish(true); });
  }
  /* 처음 한 번만 쓰는 법 한 줄(써 보거나 '알겠어요'를 누르면 다시 안 나온다) */
  function inkTip() {
    if (store('sn:pr:inktip')) return null;
    return el('p', { class: 'pr-ink-tip' }, ['✏️ 시험지·문항 그림에 바로 낙서할 수 있어요 — 마우스는 끌기, 펜슬은 그냥 쓰기, 손가락은 ✏️ 낙서를 켜고. ', el('button', { type: 'button', class: 'pr-ai-link', text: '알겠어요', onclick: inkTipDone })]);
  }
  function inkTipDone() {
    if (store('sn:pr:inktip')) return;
    store('sn:pr:inktip', 1);
    var t = list.querySelector('.pr-ink-tip');
    if (t) t.parentNode.removeChild(t);
  }
  function inkClear() {
    var svgs = Array.prototype.slice.call(list.querySelectorAll('.pr-ink.rw')).filter(function (s) { return s._s.length; });
    if (!svgs.length || !confirm('지금 화면의 시험지·문항에 그린 표시를 모두 지울까요?')) return;
    svgs.forEach(function (s) { s._s = []; s.textContent = ''; inkSave(s); });
  }
  function toggleInk(on) {
    INK.on = typeof on === 'boolean' ? on : !INK.on;
    paintInk();
  }
  function paintInk() {
    root.classList.toggle('pr-pen', INK.on);
    root.classList.toggle('pr-pen-er', INK.tool === 'er');
    root.classList.toggle('pr-tool-tx', INK.tool === 'tx');
    inkBtn.setAttribute('aria-pressed', INK.on ? 'true' : 'false');
    inkBtn.classList.toggle('on', INK.on);
    inkBtn.textContent = INK.on ? '✏️ 낙서 켬' : '✏️ 낙서';
    inkPal.hidden = !INK.on;
    Array.prototype.forEach.call(root.querySelectorAll('.pr-ink-pal [data-t], .pr-omr-ink [data-t]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-t') === INK.tool ? 'true' : 'false'); });
  }
  /* 답안지 위 펜 도구: 오른쪽 답안지는 화면을 따라오므로 위 막대까지 올라가지 않고 펜·형광펜·지우개를 바꾼다
   * (마우스·펜슬은 낙서를 켜지 않아도 고른 도구로 쓴다. 손가락은 ✏️ 낙서를 켜야 한다) */
  function inkTools() {
    var b = function (t, icon, label) {
      return el('button', { type: 'button', class: 'pr-ink-t', 'data-t': t, title: label, 'aria-label': label, 'aria-pressed': INK.tool === t ? 'true' : 'false', onclick: function () { INK.tool = t; paintInk(); } },
        [el('span', { text: icon, 'aria-hidden': 'true' }), el('span', { class: 'pr-ink-l', text: label })]);
    };
    return el('div', { class: 'pr-omr-ink', role: 'toolbar', 'aria-label': '펜 도구' }, [
      b('pen', '✏️', '펜'), b('hl', '🖍️', '형광펜'), b('tx', 'T', '글자'), b('er', '🧽', '지우개'),
      el('button', { type: 'button', class: 'pr-ink-t', title: '그린 표시 모두 지우기', 'aria-label': '그린 표시 모두 지우기', onclick: inkClear }, [el('span', { text: '🗑', 'aria-hidden': 'true' })])
    ]);
  }
  function inkPalette() {
    var b = function (t, icon, label, f) {
      return el('button', { type: 'button', class: 'pr-ink-t', 'data-t': t || false, title: label, 'aria-label': label, onclick: f || function () { INK.tool = t; paintInk(); } },
        [el('span', { text: icon, 'aria-hidden': 'true' }), el('span', { class: 'pr-ink-l', text: label })]);
    };
    return el('div', { class: 'pr-ink-pal', role: 'toolbar', 'aria-label': '펜 도구', hidden: 'hidden' }, [
      b('pen', '✏️', '펜'), b('hl', '🖍️', '형광펜'), b('tx', 'T', '글자'), b('er', '🧽', '지우개'), b('', '🗑', '모두 지우기', inkClear), b('', '✕', '끄기', function () { toggleInk(false); })
    ]);
  }

  /* ───────── 파트별 약점 노트: AI 해설이 짚은 '몰랐던 것'을 과목별로 이 브라우저에 모은다 ───────── */
  function weakList() { return store('sn:' + SUB + ':weak') || []; }
  function weakSave(list) { store('sn:' + SUB + ':weak', list); renderWeakBtn(); }
  function weakHas(q) { return weakList().some(function (w) { return w.q === q; }); }
  function weakAdd(w) { var l = weakList().filter(function (x) { return x.q !== w.q; }); l.push(w); weakSave(l); }
  function weakDel(q) { weakSave(weakList().filter(function (x) { return x.q !== q; })); }
  /* "===약점===" 다음 줄: items "개념 | 설명", paper "유형 | 개념 | 설명" */
  function weakParse(text, meta) {
    var k = text.indexOf('===약점===');
    if (k < 0) return null;
    var line = text.slice(k + 8).split('\n').map(function (l) { return l.replace(/^[\s\-•*]+/, '').trim(); }).filter(Boolean)[0];
    if (!line) return null;
    var f = line.replace(/\$/g, '').split('|').map(function (x) { return x.replace(/\*\*/g, '').trim(); });   // 약점 노트는 글로(수식 기호 $ 는 뺀다)
    var g = meta.g;
    if (!g) { g = f.length > 2 ? f.shift() : '기타'; }
    return { q: meta.q, g: g.slice(0, 30), p: meta.p || '', k: (f[0] || '').slice(0, 60), t: f.slice(1).join(' | ').slice(0, 160), x: meta.x, d: Date.now() };
  }
  var weakBtn = null;
  function renderWeakBtn() {
    if (weakBtn) weakBtn.textContent = '📌 약점 노트 ' + weakList().length;
  }
  function weakGroups() {
    var groups = {}, order = [];
    weakList().forEach(function (w) {
      if (!groups[w.g]) { groups[w.g] = []; order.push(w.g); }
      groups[w.g].push(w);
    });
    order.sort(function (a, b) { return groups[b].length - groups[a].length; });
    return order.map(function (g) { return { g: g, list: groups[g] }; });
  }
  function weakText(list) {
    return list.map(function (w) { return '- [' + w.g + '] ' + w.k + (w.t ? ' — ' + w.t : '') + ' (' + w.x + ')'; }).join('\n');
  }
  function openWeak() {
    var box = el('div', { class: 'pr-weak' });
    var gs = weakGroups();
    if (!gs.length) box.appendChild(el('p', { class: 'pr-ai-note', text: '아직 기록된 약점이 없습니다. 틀린 문제에서 🤖 AI 해설을 열면, 그 문제에서 몰랐던 개념이 파트별로 여기에 자동으로 모입니다.' }));
    gs.forEach(function (grp) {
      var p = grp.list[0].p;
      var head = el('div', { class: 'pr-weak-head' }, [
        p && partHref[p] ? el('a', { href: partHref[p], text: grp.g }) : el('b', { text: grp.g }),
        el('span', { class: 'pr-weak-n', text: grp.list.length + '개' })
      ]);
      var ul = el('ul', { class: 'pr-weak-list' });
      grp.list.forEach(function (w) {
        ul.appendChild(el('li', {}, [
          el('span', {}, [el('b', { text: w.k }), w.t ? ' — ' + w.t : '', el('small', { text: ' · ' + w.x })]),
          el('button', { type: 'button', class: 'pr-ai-link', text: '고쳤어요 ✓', onclick: function () { weakDel(w.q); openWeak(); } })
        ]));
      });
      var acts = el('div', { class: 'pr-ai-chips' }, [
        el('button', { type: 'button', class: 'pr-ai-chip', text: '🤖 이 약점 고치기', onclick: function () { fixWeak(grp.g); } }),
        p && partName[p] && !PAPER ? el('button', { type: 'button', class: 'pr-ai-chip', text: '이 파트 모아 풀기', onclick: function () { goPart(p); } }) : null
      ]);
      box.appendChild(el('section', { class: 'pr-weak-grp' }, [head, ul, acts]));
    });
    box.appendChild(el('p', { class: 'pr-ai-foot', text: '약점 노트는 이 기기 브라우저에 과목별로 저장됩니다.' }));
    showDlg('📌 ' + exportSubject() + ' 약점 노트 (파트별)', box);
  }
  function fixWeak(g) {
    var list = weakList().filter(function (w) { return w.g === g; });
    openAi('📌 ' + g + ' 약점 고치기', 'w:' + SUB + ':' + g + ':' + list.length, function () {
      return Promise.resolve({
        persist: true,
        chips: [['확인 문제 더', '같은 약점을 점검하는 확인 문제를 3개 더 내 주세요. 문제를 먼저 쓰고 "===정답===" 줄 아래에 답과 짧은 풀이를 쓰세요.'], ['외울 것만', '이 약점들에서 시험 직전에 외울 것만 5줄로 정리해 주세요.']],
        content: [{ type: 'text', text: '내 ' + exportSubject() + ' "' + g + '" 파트 약점 노트입니다. 문제를 풀면서 몰랐거나 헷갈린 것들입니다.\n\n' + weakText(list) +
          '\n\n이 약점들을 고치게 도와주세요. 순서:\n**왜 헷갈리는지** 공통 원인\n**개념 다시 잡기** 각 개념을 짧고 정확하게\n**확인 문제** 3개 (문제를 다 쓴 뒤 "===정답===" 한 줄을 쓰고 그 아래에 답과 풀이)' }]
      });
    }, '"' + g + '" 약점 노트 ' + list.length + '개를 보내 왜 헷갈리는지·개념 다시 잡기·확인 문제를 받아요.');
  }

  function examKeyOf(it) { return it.ex || (S.set.indexOf('exam:') === 0 ? S.set.slice(5) : ''); }
  function aiIdOf(exam, sec, n, a) { return 'q:' + SUB + ':' + exam + '/' + (sec || '') + n + ':' + (a || 0); }
  function itemAiId(i) { var it = S.items[i]; return aiIdOf(examKeyOf(it), it.sec, it.n, S.ans[i]); }
  function corrText(it) {
    if (it.ans === 0) return '정답 없음(전원 정답 처리)';
    return Array.isArray(it.ans) ? it.ans.map(function (x) { return ansText(it, x); }).join(' 또는 ') : ansText(it, it.ans);
  }
  function pickText(it, a) {
    if (!a) return '미응답';
    return ansText(it, a) + (isRight(it, a) ? ' (정답)' : ' (오답)');
  }
  /* paper: 문항이 걸친 시험지 단 — 앞 단(지문)부터 다음 문항이 시작하는 단까지 */
  function stripUrl(it, k) { return (cfg.imgBase || cfg.base) + S.set.slice(5) + '/' + SUB + '/' + S.meta.strips[it.sec][k].file; }
  function stripUrls(it, m, key) {
    m = m || S.meta;
    key = key || S.set.slice(5);
    var an = m.anchors[it.sec], a = an[it.n], nx = an[it.n + 1];
    if (!a) return [];
    var from = Math.max(0, a[0] - (SUB === 'korean' ? 2 : 1));
    var to = Math.min(a[0] + 1, Math.max(a[0], nx ? nx[0] : a[0]));
    var out = [];
    for (var k = from; k <= to; k++) out.push((cfg.imgBase || cfg.base) + key + '/' + SUB + '/' + m.strips[it.sec][k].file);
    return out;
  }
  function imgBlock(url) { return { type: 'image', source: { type: 'url', url: url } }; }
  function itemLine(it, i) { return lineOf(it, S.ans[i], S.ms && S.ms[i]); }
  function lineOf(it, a, ms) {
    var t = ms != null && ms < 600000 ? ' · 풀이 시간 약 ' + Math.round(ms / 1000) + '초' : '';
    return it.n + '번 (' + it.pts + '점' + (it.tag && partName[it.tag] ? ', ' + partName[it.tag] + (it.tp ? ' › ' + topicName[it.tp] : '') : '') + (it.sec && SUB === 'korean' ? ', ' + SEC_NAME[it.sec] : '') + ') · 공식 정답 ' + corrText(it) + ' · 내 답 ' + (a === -1 ? '기록 없음(틀린 문제로 저장됨)' : pickText(it, a)) + t;
  }
  function itemReq(i) { return reqFor(S.items[i], S.ans[i], S.ms && S.ms[i], PAPER ? S.meta : null); }
  /* 문항 하나의 AI 해설 요청. a = 내 답(0 미응답, -1 틀렸지만 고른 답을 모름), m = 그 회차 시험지 meta(국어·영어) */
  /* 과목·문항에 맞는 그림 블록 권하기 */
  function visHint(it) {
    if (SUB === 'math') return '함수·그래프·넓이가 나오면 ```그래프, 아니면 풀이 단계를 ```흐름으로' + (it.num ? '' : ', 선지 판단이 핵심이면 ```선지');
    if (FORMULA) return '보기 ㄱ·ㄴ·ㄷ이나 선지 판단은 ```선지, 과정·원리는 ```흐름, 두 대상 비교는 ```비교, 함수·그래프가 나오면 ```그래프';
    if (SUB === 'hist') return '시대·사건 순서는 ```연표, 원인→결과는 ```흐름, 제도·인물 비교는 ```비교, 선지 판단은 ```선지';
    return '지문의 논리·구조는 ```흐름, 대상 비교는 ```비교, 선지 판단은 ```선지';
  }
  function reqFor(it, a, ms, m) {
    var key = examKeyOf(it), ex = examOf(key);
    return Promise.all([loadExplain(key), loadTrap(key)]).then(function (maps) {
      var content = (PAPER ? stripUrls(it, m, key) : [it.img]).map(imgBlock);
      var lines = [(ex ? etitle(ex) : key) + ' ' + (cfg.label || SUB) + ' ' + lineOf(it, a, ms)];
      if (PAPER) lines.push('이미지는 시험지의 연속된 단(段)입니다. 그중 ' + it.n + '번 문항을 해설하세요. 앞 단은 지문 맥락용입니다.');
      if (SUB === 'english' && it.n <= 17 && m.script && m.script[String(it.n)]) lines.push('듣기 대본:\n' + m.script[String(it.n)]);
      var mine = noteLines(it);
      if (mine) lines.push('내가 남긴 기록(학생 본인):\n' + mine);
      var wrong = a === -1 || (a && !isRight(it, a)), skip = !a, picked = a > 0;
      lines.push('먼저 **짧은 해설**을 쉬운 말로 4줄 이내로 쓰세요(30초 안에 읽게): "핵심: …"(이 문항이 묻는 것 한 줄) / "정답: …"(정답 번호와 한 줄 이유)' +
        (wrong ? ' / "내 실수: …"(' + (picked ? '내가 고른 ' + ansText(it, a) + '이(가) 왜 틀렸는지' : '흔히 고르는 오답이 왜 틀렸는지') + ' 한 줄)' : '') + '. ' +
        '짧은 해설 바로 아래에는 이 문항을 한눈에 보여 주는 그림 블록을 하나 넣으세요(' + visHint(it) + '). 그다음 "===자세히===" 한 줄을 쓰고, 그 아래에 자세한 해설을 쓰세요(풀이 단계·비교가 있으면 그림 블록을 하나 더 써도 됩니다).');
      lines.push('자세한 해설은 다음 순서로 써 주세요.\n**핵심 개념** 이 문항이 묻는 개념을 1~3줄로\n**풀이** 정답에 이르는 과정을 단계별로' +
        (wrong ? '\n**내 실수 분석** ' + (picked ? '내가 고른 ' + ansText(it, a) + '이(가) 왜 그럴듯해 보였는지' : '이 문항을 틀린 학생이 흔히 고르는 오답이 왜 그럴듯해 보이는지') + ', 어느 판단에서 갈렸는지, 같은 유형에서 이 실수를 막는 확인 습관' + (mine ? ' (위 "내가 남긴 기록"의 내 생각에서 출발해 짚고, 내가 고른 원인이 맞는지도 말해 주세요)' : '') :
          skip ? '\n**어디서 시작할까** 손대지 못했을 때 첫 실마리를 잡는 방법' :
          unsureOf(it) ? '\n**헷갈린 지점** 맞혔지만 확신이 없었던 이유와, 다음에 확신을 갖고 고르게 하는 판단 기준' : '\n**확인 포인트** 맞혔지만 시간을 줄이거나 실수를 막을 지점'));
      var exp = maps[0] && maps[0][it.n], trap = picked && wrong && maps[1] && maps[1][it.n] && maps[1][it.n].o && maps[1][it.n].o[a];
      if (exp || trap) lines.push('참고(사이트에 실린 기존 해설, 틀릴 수 있음):' + (exp ? '\n' + textOf(exp) : '') + (trap ? '\n고른 선택지 메모: ' + trap : ''));
      lines.push('맨 끝에 "===약점===" 한 줄을 쓰고, 그 다음 줄에 이 문항에서 ' + (wrong || skip ? '내가 몰랐거나 놓친' : '핵심이 되는') + ' 것을 ' +
        (PAPER ? '"문항 유형 | 개념 이름 | 한 줄 설명" (문항 유형 예: ' + (SUB === 'korean' ? '독서-과학, 문학-현대시, 언어와 매체' : '빈칸 추론, 어법, 글의 순서') + ')' : '"개념 이름 | 한 줄 설명"') + ' 형식으로 한 줄만 쓰세요.');
      content.push({ type: 'text', text: lines.join('\n\n') });
      var qid = key + '/' + (it.sec || '') + it.n;
      return { content: content, persist: true, chips: ITEM_CHIPS,
        weak: { q: qid, g: PAPER ? '' : (partName[it.tag] || '기타'), p: PAPER ? '' : (it.tag || ''), x: (ex ? etitle(ex).replace(/학년도 /, ' ').replace('대학수학능력시험', '수능') : key) + ' ' + it.n + '번', auto: !!(wrong || skip) } };
    });
  }
  var ITEM_CHIPS = [
    ['더 쉽게', '고등학교 1학년도 이해할 수 있게, 비유를 써서 더 쉽게 다시 설명해 주세요.'],
    ['비슷한 문제 내 줘', '이 문항과 같은 개념·같은 함정을 쓰는 변형 문제를 하나 만들어 주세요. 수능 형식(5지선다)으로 문제와 선택지를 먼저 쓰고, 그 아래 "===정답===" 한 줄을 쓴 다음 정답과 풀이를 쓰세요.'],
    ['요점 노트', '이 문항에 쓰인 개념과 함정을 시험 직전에 볼 수 있게 5줄 이내 요점 노트로 정리해 주세요.']
  ];
  /* 힌트: 정답을 밝히지 않고 실마리만 (채점 전) */
  function hintAiId(i) { var it = S.items[i]; return 'h:' + SUB + ':' + examKeyOf(it) + '/' + it.n; }
  function hintReq(i) {
    var it = S.items[i], ex = examOf(examKeyOf(it));
    return Promise.resolve({
      persist: true,
      chips: [['힌트 하나 더', '정답은 여전히 말하지 말고, 다음 단계 힌트를 하나만 더 주세요.']],
      content: [imgBlock(it.img), { type: 'text', text: (ex ? etitle(ex) : '') + ' ' + (cfg.label || SUB) + ' ' + it.n + '번 (' + it.pts + '점). 공식 정답은 ' + corrText(it) + '입니다. 이 정답은 학생에게 절대 밝히지 마세요.\n\n학생이 아직 이 문제를 풀고 있습니다. 정답 번호·최종 값·어느 선택지가 맞는지 틀린지는 말하지 말고, 스스로 풀 수 있게 첫 실마리 힌트를 1~2개만 짧게 주세요. **힌트 1**, **힌트 2** 형식으로.' }]
    });
  }
  function itemLabel(it) { return refLabel({ exam: examKeyOf(it), sec: it.sec, n: it.n }); }
  function askHint(i) {
    if (aiStart(hintAiId(i), function () { return hintReq(i); }, false, itemLabel(S.items[i]) + ' — 문항 그림만 보내 정답은 숨긴 힌트(실마리)를 받아요.').status === 'idle') return;
    refreshCard(i);
  }
  /* 틀린 문제 한꺼번에: 옆 칸에서 한 번 묻고, 동시에 AI_PAR 개씩 AI 해설을 받는다(이미 받은 문항은 그대로 보여 준다).
   * 옆 칸에 문항별로 모아 보이고, 문항 칸(수학·탐구·한국사)에도 같이 나온다. 결과는 문항 해설처럼 이 기기에 저장된다 */
  var AI_PAR = 4;
  function wrongIdxs() { var out = []; S.items.forEach(function (it, i) { if (!isRight(it, S.ans[i])) out.push(i); }); return out; }   // 못 푼 문제도 틀린 것
  function showItem(i) {
    var it = S.items[i], t = PAPER ? document.getElementById('pq-' + it.sec + it.n) : document.getElementById('q-' + i);
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function askWrongAll() {
    var list = wrongIdxs();
    if (!list.length) return;
    var todo = list.filter(function (i) { var st = aiNeed(itemAiId(i), function () { return itemReq(i); }).status; return st !== 'done' && st !== 'run' && st !== 'load'; });
    var head = el('div', { class: 'pr-ai-askbox' }), box = el('div', { class: 'pr-ai-batch' }, [head]);
    var go = function () {
      var q = todo.slice(), running = 0, fin = 0, bad = 0;
      var paint = function () {
        head.innerHTML = '';
        head.appendChild(el('p', { class: 'pr-ai-ask-h', text: fin < todo.length ? '🤖 ' + fin + ' / ' + todo.length + '개 끝 · 동시에 ' + AI_PAR + '개씩 받는 중…'
          : bad ? '⚠️ ' + (todo.length - bad) + '개 받았고 ' + bad + '개는 받지 못했어요 — 그 문항의 ‘다시 시도’를 눌러 주세요' : '✅ ' + todo.length + '개 모두 받았어요' }));
        head.appendChild(el('p', { class: 'pr-ai-ask-c', text: (aiCloudOn() ? '받은 해설은 이 기기와 내 계정에 저장돼요(다른 기기에서도 보여요).' : '받은 해설은 이 기기에 저장돼요(로그인하면 계정에도).') + ' 문항 이름을 누르면 시험지의 그 문항으로 가요.' }));
      };
      var next = function () {
        while (running < AI_PAR && q.length) {
          var i = q.shift(), id = itemAiId(i), r = aiRun(id), it = S.items[i];
          if (r.status === 'done' || r.status === 'run' || r.status === 'load') { fin++; paint(); continue; }   // 그사이 계정에서 받았거나 이미 받는 중
          r.build = (function (k) { return function () { return itemReq(k); }; })(i);
          r.what = aiWhatItem(itemLabel(it), it, S.ans[i], false);
          running++;
          aiRunNow(r, id, r.build).then((function (rr) { return function () { running--; fin++; if (rr.status !== 'done') bad++; paint(); next(); }; })(r));
          if (!PAPER) refreshCard(i);
        }
      };
      paint(); next();
    };
    if (!keyMode()) {
      aiStart(itemAiId(todo[0] != null ? todo[0] : list[0]), function () { return itemReq(todo[0] != null ? todo[0] : list[0]); });   // 첫 문항 칸에 키 넣는 칸
      head.appendChild(el('p', { class: 'pr-ai-ask-h', text: '🤖 AI 해설은 내 Anthropic API 키로 요청해요' }));
      head.appendChild(el('p', { class: 'pr-ai-ask-c', text: '아래 첫 문항 칸에 키를 넣어 저장한 뒤, 이 단추를 다시 눌러 주세요.' }));
    } else if (!todo.length) {
      head.appendChild(el('p', { class: 'pr-ai-ask-h', text: '✅ 틀린 문제 ' + list.length + '개 모두 AI 해설을 받아 두었어요' }));
    } else {
      head.appendChild(el('p', { class: 'pr-ai-ask-h', text: '🤖 틀린 문제 ' + todo.length + '개를 한꺼번에 AI 해설 받을까요?' }));
      head.appendChild(el('p', { class: 'pr-ai-ask-w', text: '문항마다 그림·내 답·정답·해설을 보내 해설과 내 답 분석을 받아요' + (list.length > todo.length ? '(이미 받은 ' + (list.length - todo.length) + '개는 그대로)' : '') + '. 동시에 ' + AI_PAR + '개씩 요청해요.' }));
      head.appendChild(el('p', { class: 'pr-ai-ask-c', text: (keyMode() === 'acct' ? '계정에 넣어 둔' : '이 브라우저에 넣어 둔') + ' 내 Anthropic API 키로 ' + todo.length + '번 요청해요(대략 $' + (0.05 * todo.length).toFixed(2) + '~$' + (0.2 * todo.length).toFixed(2) + ').' }));
      head.appendChild(el('div', { class: 'pr-ai-keyrow' }, [
        el('button', { type: 'button', class: 'pr-btn pr-ai-go', text: '모두 시작', onclick: go }),
        el('button', { type: 'button', class: 'pr-btn', text: '취소', onclick: function () { aiDlg.close(); } })
      ]));
    }
    list.forEach(function (i) {
      var it = S.items[i];
      box.appendChild(el('div', { class: 'pr-ai-bitem' }, [
        el('p', { class: 'pr-ai-bh' }, [el('button', { type: 'button', class: 'pr-ai-link', text: itemLabel(it) + ' (' + it.pts + '점)', onclick: function () { showItem(i); } }), (S.ans[i] ? ' · 내 답 ' + ansText(it, S.ans[i]) : ' · 못 풂') + ' → ', el('b', { class: 'pr-ans-t', text: '정답 ' + corrText(it) })]),
        aiBox(itemAiId(i))
      ]));
    });
    showDlg('🤖 틀린 문제 AI 해설 (' + list.length + ')', box);
  }
  function askItem(i) {
    var it = S.items[i], id = itemAiId(i), build = function () { return itemReq(i); };
    var open = function () { if (!isShown(i)) { S.revealed[i] = true; sendAttempt(i); } };   // AI 해설을 받으면 이 문항 정답도 열린다
    var r = aiStart(id, build, false, aiWhatItem(itemLabel(it), it, S.ans[i], !isShown(i)), function () { open(); if (!PAPER) refreshCard(i); renderOmr(); });
    if (r.status === 'idle') return;
    if (r.status !== 'ask') open();   // 묻는 중이면 '시작'을 누를 때 연다(취소하면 정답도 열지 않는다)
    if (PAPER) showDlg(it.n + '번 AI 해설', aiBox(id));
    else {
      refreshCard(i);
      var b = document.querySelector('#q-' + i + ' .pr-ai');
      b && b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    renderOmr();
  }

  /* 이번 시험(세트) 분석: 문항별 기록 + 틀린 문항 이미지 일부 */
  function examReq() {
    var r = S.result, rows = [], imgs = [], seen = {}, mine = false;
    S.items.forEach(function (it, i) {
      var b = noteBrief(it);
      if (b) mine = true;
      rows.push('- ' + itemLine(it, i) + b);
      if (!isRight(it, S.ans[i])) {   // 틀리거나 못 푼 문항
        var a = PAPER && S.meta.anchors[it.sec][it.n];
        var u = PAPER ? (a ? stripUrl(it, a[0]) : '') : it.img;
        if (u && !seen[u] && imgs.length < (PAPER ? 6 : 8)) { seen[u] = 1; imgs.push(u); }
      }
    });
    var gc = gradeCuts();
    var head = setLabel() + ' · ' + r.sc + '/' + r.tot + '점' + (gc ? ' (예상 ' + gradeText(r.sc, gc) + ')' : '') + ' · ' + r.right + '/' + r.n + '문항 정답' + (r.unanswered ? ' · 미풀이 ' + r.unanswered : '') + (S.usedTimer && r.used > 0 ? ' · 소요 ' + fmtTime(r.used) : '') + (r.over > 0 ? ' · 시간 넘김 +' + fmtTime(r.over) : '') + ' · ' + (S.mode === 'exam' ? '시험 모드' : '연습 모드');
    var content = imgs.map(imgBlock);
    var chips = [['약점 복습 계획', '이번 결과의 약점 단원 위주로 3일짜리 복습 계획을 하루 단위로 짜 주세요.'], ['다음 시험 전략', '다음 시험에서 시간 배분과 문항 순서를 어떻게 바꾸면 좋을지 구체적으로 알려 주세요.']];
    content.push({ type: 'text', text: '이번에 푼 세트의 내 기록입니다.\n' + head + '\n\n' + rows.join('\n') +
      (mine ? '\n\n(줄 끝의 헷갈림 표시·내가 고른 원인·메모는 내가 직접 남긴 기록입니다. 분석할 때 이것과 비교해 짚어 주세요.)' : '') +
      (imgs.length ? '\n\n앞의 이미지는 틀린 문항(일부)입니다.' : '') +
      '\n\n이 세트에서 드러난 나의 문제점과 강점을 분석해 주세요. 먼저 **한눈 요약** 3줄(가장 큰 문제점 하나 · 잘한 점 하나 · 바로 할 일 하나)을 쓰고, "===자세히===" 한 줄을 쓴 다음 자세한 분석을 이 순서로:\n**총평** 2~3줄\n**문제점** 약한 단원·유형과 반복된 실수 유형(개념 부족 / 조건·자료 해석 / 계산 / 시간 관리 / 찍기 의심), 근거 문항 번호를 들어서\n**강점** 안정적으로 맞힌 단원·유형, 근거 문항 번호\n**시간 사용** 풀이 시간 기록이 있으면 서두름·막힘 판단\n**다음에 할 것** 우선순위 3가지' });
    return Promise.resolve({ content: content, chips: chips, persist: true });   // 시험 분석도 남긴다(이 기기·로그인하면 계정 — 같은 답이면 다시 보기)
  }
  function askExam() {
    var what = (S.set.indexOf('exam:') === 0 ? '이번 시험' : '이번 세트') + '(' + setLabel() + ') — 문항별 내 답·정답·풀이 시간·메모와 틀린 문항 그림 몇 장을 보내 문제점·강점 분석을 받아요.';
    openAi('이번 ' + (S.set.indexOf('exam:') === 0 ? '시험' : '세트') + ' AI 분석', 'x:' + SUB + ':' + S.set + ':' + S.ans.join(','), examReq, what);
  }
  /* 과목 전체 분석: 계정에 쌓인 풀이 기록(분석용 MD와 같은 자료) */
  function askSubject() {
    openAi(exportSubject() + ' 과목 AI 분석', 's:' + SUB, function () {
      return prepareExport(Date.now()).catch(function () { throw new Error('계정의 풀이 기록을 불러오지 못했습니다. 로그인 상태를 확인하고 다시 시도해 주세요.'); }).then(function (res) {
        return { content: [{ type: 'text', text: res.md + '\n\n---\n위 자료는 이 과목에서 내가 지금까지 푼 기록 전체입니다. 이 과목에서의 나의 문제점과 강점을 분석해 주세요. 순서:\n**한눈 요약** 3줄 — 그 다음 줄에 "===자세히===" 한 줄\n**문제점** 단원별·실수 유형별 약점, 근거 날짜·문항을 인용해서\n**강점** 안정적인 단원·유형\n**변화** 시간에 따라 나아진 것·나빠진 것\n**시간 사용 습관** 서두름·막힘·찍기 의심\n**2주 학습 계획** 우선순위대로' + (weakList().length ? '\n\n참고로 AI 해설에서 모은 내 파트별 약점 노트입니다:\n' + weakText(weakList()) : '') }], persist: true, chips: [['이번 주 할 일만', '이번 주 7일 동안 하루 단위로 무엇을 풀고 복습할지만 짧게 정리해 주세요.'], ['가장 큰 약점 하나', '가장 먼저 고쳐야 할 약점 하나만 골라, 왜 그런지와 고치는 연습법을 알려 주세요.']] };
      });
    }, exportSubject() + ' — 계정에 쌓인 이 과목 풀이 기록 전체' + (weakList().length ? '와 약점 노트' : '') + '를 보내 과목 전체 분석(2주 공부 계획까지)을 받아요.');
  }

  var reportLoading = null;
  function loadReport() {
    if (window.SnReport) return Promise.resolve();
    if (reportLoading) return reportLoading;
    reportLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = cfg.base + 'report.js';
      s.onload = function () {
        if (window.SnReport) resolve();
        else { reportLoading = null; reject(new Error('report')); }
      };
      s.onerror = function () { reportLoading = null; reject(new Error('report')); };
      document.head.appendChild(s);
    });
    return reportLoading;
  }
  function exportSubject() {
    return String(cfg.label || SUB).replace(/^수능\s+/, '');
  }
  function countQuestions(attempts) {
    var seen = {}, n = 0;
    (attempts || []).forEach(function (a) {
      if (!a) return;
      var k = a.exam + '/' + a.q;
      if (seen[k]) return;
      seen[k] = 1;
      n++;
    });
    return n;
  }
  function loadExportMaps(attempts) {
    var seen = {}, keys = [];
    (attempts || []).forEach(function (a) {
      if (!a || !a.exam || seen[a.exam]) return;
      seen[a.exam] = 1;
      keys.push(a.exam);
    });
    return Promise.all(keys.map(function (key) {
      return Promise.all([loadTrap(key), loadExplain(key)]).then(function (pair) {
        return { key: key, trap: pair[0], explain: pair[1] };
      });
    })).then(function (rows) {
      var trap = {}, explain = {};
      rows.forEach(function (r) {
        if (r.trap) trap[r.key] = r.trap;
        if (r.explain) explain[r.key] = r.explain;
      });
      return { trap: trap, explain: explain };
    });
  }
  function downloadText(text, filename) {
    var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function flashExport(text) {
    if (!exportMsg) return;
    exportMsg.textContent = text;
    if (exportTimer) clearTimeout(exportTimer);
    exportTimer = setTimeout(function () { if (exportMsg) exportMsg.textContent = ''; }, 2000);
  }
  function prepareExport(now) {
    return loadReport().then(function () {
      return SnAuth.exportAttempts(SUB);
    }).then(function (attempts) {
      if (!Array.isArray(attempts)) throw new Error('export');
      return loadExportMaps(attempts).then(function (maps) {
        var reportOpts = {
          subLabel: exportSubject(),
          now: now,
          attempts: attempts,
          exams: EXAMS,
          sub: SUB,
          partName: partName,
          trap: maps.trap,
          explain: maps.explain,
          notes: reportNotes(),
          imgBase: cfg.imgBase || cfg.base || ''
        };
        var md = window.SnReport.buildReport(reportOpts);
        var subject = exportSubject().replace(/[\\/:*?"<>|]/g, '');
        return {
          md: md,
          opts: reportOpts,
          n: countQuestions(attempts),
          file: '분석-' + subject + '-' + window.SnReport.kstDate(now).replace(/-/g, '') + '.md'
        };
      });
    });
  }
  function saveExport(res) {
    downloadText(res.md, res.file);
    flashExport('내려받았습니다 (' + res.n + '문항)');
  }
  function exportMarkdown(kind) {
    if (exporting || !window.SnAuth) return;
    exporting = true;
    var now = Date.now();
    var work = prepareExport(now);
    var finish = function () { exporting = false; };
    if (kind === 'copy' && window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      try {
        navigator.clipboard.write([new ClipboardItem({
          'text/plain': work.then(function (res) { return new Blob([res.md], { type: 'text/plain' }); })
        })]).then(function () {
          return work.then(function (res) { flashExport('복사했습니다 (' + res.n + '문항)'); });
        }).catch(function () {
          return work.then(saveExport);
        }).then(finish, function () {
          flashExport('내보내지 못했습니다');
          finish();
        });
        return;
      } catch (e) {}
    }
    work.then(function (res) {
      if (kind === 'download' || !navigator.clipboard || !navigator.clipboard.writeText) {
        saveExport(res);
        return;
      }
      return navigator.clipboard.writeText(res.md).then(function () {
        flashExport('복사했습니다 (' + res.n + '문항)');
      }, function () { saveExport(res); });
    }).catch(function () {
      flashExport('내보내지 못했습니다');
    }).then(finish);
  }
  function exportHtml() {
    if (exporting || !window.SnAuth) return;
    var w = window.open('', '_blank');
    if (!w) { flashExport('팝업을 허용해 주세요'); return; }
    exporting = true;
    prepareExport(Date.now()).then(function (res) {
      var html = window.SnReport.buildReportHtml(res.opts);
      var blob = new Blob([html], { type: 'text/html' });
      var url = URL.createObjectURL(blob);
      w.location.href = url;
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    }).catch(function () {
      try { w.close(); } catch (e) {}
      flashExport('내보내지 못했습니다');
    }).then(function () { exporting = false; });
  }

  function refreshCard(i) {
    var old = document.getElementById('q-' + i);
    if (old) old.parentNode.replaceChild(card(S.items[i], i), old);
  }
  function choose(i, k) {
    if (S.graded) return;
    S.ans[i] = S.ans[i] === k ? 0 : k;
    if (S.ans[i]) stampChoice(i);
    persist();
    if (S.mode === 'practice' && !PAPER) recordWrong(S.items[i], S.ans[i]);
    if (S.mode === 'practice' || isShown(i)) sendAttempt(i);
    if (!PAPER) refreshCard(i);
    renderBar(); renderOmr();
  }
  function setNum(i, v) {
    if (S.graded) return;
    var n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
    S.ans[i] = isNaN(n) ? 0 : n;
    if (S.ans[i]) stampChoice(i);
    persist();
    if (S.mode === 'practice') recordWrong(S.items[i], S.ans[i]);
    if (S.mode === 'practice' || isShown(i)) sendAttempt(i);
    refreshCard(i);
    renderBar(); renderOmr();
  }
  function recordWrong(it, a, graded) {   // graded: 채점할 때 — 못 푼 문제(a 0)도 틀린 것으로 넣는다(연습 중 답을 지운 것은 그대로)
    if (!a && !graded) return;
    var w = store('sn:' + SUB + ':wrong') || [];
    var idx = w.indexOf(it.id);
    if (!isRight(it, a) && idx < 0) w.push(it.id);
    else if (isRight(it, a) && idx >= 0) w.splice(idx, 1);
    store('sn:' + SUB + ':wrong', w);
  }
  function attemptOf(it, i, ts, graded) {   // graded: 채점할 때 — 못 푼 문제도 picked 0 · 오답으로 남긴다(정답 없는 문항은 빼고)
    var a = S.ans[i];
    if (!it || (!a && (!graded || isRight(it, a)))) return null;
    var exam = it.ex || (S.set.indexOf('exam:') === 0 ? S.set.slice(5) : '');
    if (!exam) return null;
    var row = { exam: exam, sub: SUB, q: it.n, picked: a || 0, ok: isRight(it, a) ? 1 : 0, ts: ts || Date.now(), mode: S.mode === 'practice' ? 'practice' : 'exam' };
    if (S.ms && S.ms[i] != null) row.ms = S.ms[i];
    return row;
  }
  function sendAttempt(i) {
    var row = attemptOf(S.items[i], i);
    if (row) { noteDone(row.exam, row.q, row.ok, row.ts, row.picked); saveDone(); }
    if (!window.SnAuth) return;
    if (row) { SnAuth.record([row]); dueSoon(); }
  }
  function sendGraded() {
    var prev = S.sent;
    S.sent = S.ans.slice();
    if (!window.SnAuth) return;
    var ts = Date.now(), rows = [], tried = S.ans.some(function (a) { return a; });
    S.items.forEach(function (it, i) {
      if (prev && prev[i] === S.ans[i]) return;   // ‘답 이어서 고르기’ 뒤 다시 채점: 바뀐 답만 보낸다
      var row = attemptOf(it, i, ts, tried);   // 못 푼 문제도 오답으로(하나도 안 골랐으면 빼고)
      if (row) rows.push(row);
    });
    rows.forEach(function (r) { if (r.picked) noteDone(r.exam, r.q, r.ok, r.ts, r.picked); });   // 고른 문제만 '푼 문제'로
    saveDone();
    if (rows.length) { SnAuth.record(rows); dueSoon(); }
  }
  function reopen() { S.graded = false; S.revealed = {}; S.regrade = true; persist(); renderAll(); }

  /* ───────── 문제별 노트: 메모·선지 표시(○△✕)·헷갈림·오답 원인. 이 기기에 바로 저장하고, 로그인하면 계정(/api/qnotes)과 맞춘다 ─────────
   * notes["<회차>/<번호>"] = { m: 선지 1~5 표시 다섯 글자(o ○ · t △ · x ✕ · - 없음), t: 메모, f: 헷갈림 0·1, c: 오답 원인, u: 고친 시각 } */
  var NOTES = 'sn:' + SUB + ':qn', NOTES_DIRTY = NOTES + ':dirty';
  var notes = store(NOTES) || {}, noteDirty = store(NOTES_DIRTY) || {}, noteTimer = null;
  var MARK_SYM = { o: '○', t: '△', x: '✕' }, MARK_NEXT = { '-': 'o', o: 't', t: 'x', x: '-' };
  var CAUSES = [['concept', '개념 모름'], ['cond', '조건 놓침'], ['choice', '선지 판단 실수'], ['calc', '계산 실수'], ['time', '시간 부족']];
  var CAUSE_NAME = {};
  CAUSES.forEach(function (c) { CAUSE_NAME[c[0]] = c[1]; });
  function noteQ(it) { return it.sec === 'b' ? 100 + it.n : it.n; } // 국어 언매 35~45 는 화작과 번호가 겹쳐 135~145
  function noteKey(it) { var ex = it && examKeyOf(it); return ex ? ex + '/' + noteQ(it) : ''; }
  function noteOf(it) { return notes[noteKey(it)] || null; }
  function markOf(it, k) { var n = noteOf(it); return n ? n.m.charAt(k - 1) : '-'; }
  function memoOf(it) { var n = noteOf(it); return n ? n.t : ''; }
  function unsureOf(it) { var n = noteOf(it); return !!(n && n.f); }
  function causeOf(it) { var n = noteOf(it); return (n && n.c) || ''; }
  function noteFilled(it) { var n = noteOf(it); return !!(n && (n.t || n.f || n.c)); }
  function setNote(it, patch) {
    var key = noteKey(it);
    if (!key) return;
    var n = notes[key] || { m: '-----', t: '', f: 0, c: '' };
    notes[key] = {
      m: patch.m != null ? patch.m : n.m, t: patch.t != null ? patch.t : n.t,
      f: patch.f != null ? patch.f : (n.f || 0), c: patch.c != null ? patch.c : (n.c || ''), u: Date.now()
    };
    noteDirty[key] = 1;
    store(NOTES, notes);
    store(NOTES_DIRTY, noteDirty);
    clearTimeout(noteTimer);
    noteTimer = setTimeout(pushNotes, 800);
  }
  function pushNotes() {
    if (!meUser || !meUser.id || !window.SnAuth) return;
    var keys = Object.keys(noteDirty).slice(0, 200), sent = {};
    if (!keys.length) return;
    var rows = keys.map(function (key) {
      var p = key.split('/'), n = notes[key] || { m: '-----', t: '', u: Date.now() };
      sent[key] = n.u;
      return { exam: p[0], sub: SUB, q: +p[1], marks: n.m === '-----' ? '' : n.m, memo: n.t, unsure: n.f || 0, cause: n.c || '', ts: n.u };
    });
    SnAuth.saveNotes(rows).then(function () {
      keys.forEach(function (key) { if (notes[key] && notes[key].u === sent[key]) delete noteDirty[key]; });
      store(NOTES_DIRTY, noteDirty);
      if (Object.keys(noteDirty).length) { clearTimeout(noteTimer); noteTimer = setTimeout(pushNotes, 800); }
    }).catch(function () {});
  }
  /* 로그인했을 때: 계정 것과 이 기기 것 중 더 늦게 고친 쪽을 남기고, 이 기기에만 있던 것은 계정으로 보낸다 */
  function pullNotes() {
    if (!meUser || !meUser.id || !window.SnAuth) return;
    SnAuth.notes(SUB).then(function (rows) {
      var seen = {}, changed = false;
      (rows || []).forEach(function (r) {
        var key = r.exam + '/' + r.q, mine = notes[key];
        seen[key] = 1;
        if (!mine || mine.u < r.ts) {
          notes[key] = { m: r.marks || '-----', t: r.memo || '', f: r.unsure || 0, c: r.cause || '', u: r.ts };
          delete noteDirty[key];
          changed = true;
        } else if (mine.u > r.ts) noteDirty[key] = 1;
      });
      Object.keys(notes).forEach(function (key) { if (!seen[key]) noteDirty[key] = 1; });
      store(NOTES, notes);
      store(NOTES_DIRTY, noteDirty);
      if (changed && !(document.activeElement && document.activeElement.classList.contains('pr-memo-in'))) {
        if (PAPER) renderOmr(); else S.items.forEach(function (it, i) { refreshCard(i); });
      }
      pushNotes();
    }).catch(function () {});
  }
  function cycleMark(i, k) {
    var it = S.items[i], n = noteOf(it), m = n ? n.m : '-----';
    setNote(it, { m: m.slice(0, k - 1) + MARK_NEXT[m.charAt(k - 1)] + m.slice(k) });
    renderOmr();
  }
  function redraw(i) { if (!PAPER) refreshCard(i); renderOmr(); }
  function toggleUnsure(it, i) { setNote(it, { f: unsureOf(it) ? 0 : Date.now() }); redraw(i); } // f: 표시한 시각(오늘 다시 풀 오답의 시작일)
  function pickCause(it, i, c) { setNote(it, { c: causeOf(it) === c ? '' : c }); redraw(i); }
  /* 메모 칸: 문항 카드는 노트가 있거나 틀린 문제를 채점하면 저절로 열리고, 답안지(국어·영어)는 📝 를 눌러야 열린다 */
  function memoWanted(it, i) { return isShown(i) && !isRight(it, S.ans[i]); }   // 틀리거나 못 푼 문제
  function memoOpen(it, i) {
    var o = S.memoOpen[noteKey(it)];
    if (o !== undefined) return o;
    return !PAPER && (noteFilled(it) || !!(S.ans[i] && memoWanted(it, i)));
  }
  function memoBox(it, i, cls) {
    var label = (PAPER ? it.n : i + 1) + '번';
    var saved = el('span', { class: 'pr-memo-saved', 'aria-live': 'polite' });
    var ta = el('textarea', {
      class: 'pr-memo-in', rows: '2', maxlength: '1000', 'aria-label': label + ' 메모',
      placeholder: memoWanted(it, i) ? (S.ans[i] ? '왜 이 답을 골랐나 · 어느 단계에서 틀어졌나 — 한 줄로' : '왜 못 풀었나 · 어디서 막혔나 — 한 줄로') : '이 문제에서 남길 것 (풀이 실마리·헷갈린 점)',
      oninput: function () {
        setNote(it, { t: ta.value });
        saved.textContent = '저장됨 ✓';
        var b = document.querySelector('[data-memo-for="' + noteKey(it) + '"]');
        if (b) b.classList.toggle('has', noteFilled(it));
      }
    });
    ta.value = memoOf(it);
    var kids = [el('div', { class: 'pr-memo-h' }, [el('b', { text: '📝 ' + label + ' 메모' }), saved])];
    if (PAPER) kids.push(el('button', { type: 'button', class: 'pr-unsure-sw', 'aria-pressed': unsureOf(it) ? 'true' : 'false', text: '🤔 헷갈림 — 맞았어도 다시 볼 문제', onclick: function () { toggleUnsure(it, i); } }));
    var chips = el('div', { class: 'pr-cause', role: 'group', 'aria-label': label + ' 틀리거나 헷갈린 이유' }, [el('span', { class: 'pr-cause-h', text: '이유' })]);
    CAUSES.forEach(function (c) {
      chips.appendChild(el('button', { type: 'button', class: 'pr-cause-b', 'aria-pressed': causeOf(it) === c[0] ? 'true' : 'false', text: c[1], onclick: function () { pickCause(it, i, c[0]); } }));
    });
    kids.push(chips, ta);
    return el('div', { class: cls || 'pr-memo' }, kids);
  }
  function toggleMemo(it, i) {
    S.memoOpen[noteKey(it)] = !memoOpen(it, i);
    if (PAPER) renderOmr(); else refreshCard(i);
  }
  /* 분석 자료용: 시도 기록과 같은 "<회차>/<번호>" 로 바꾼다(언매 135~145 → 35~45, 화작과 겹치면 지금 고른 선택과목 것) */
  function reportNotes() {
    var out = {};
    Object.keys(notes).forEach(function (key) {
      var p = key.split('/'), q = +p[1], n = notes[key], b = q > 100;
      if (!n || (!n.t && n.m === '-----' && !n.f && !n.c)) return;
      var k = p[0] + '/' + (b ? q - 100 : q);
      if (out[k] && !(b ? S.sel === 'b' : S.sel !== 'b')) return;
      out[k] = { m: n.m, t: n.t, f: n.f ? 1 : 0, c: n.c || '' };
    });
    return out;
  }
  /* AI 해설에 넘길 내 기록 */
  function noteLines(it) {
    var n = noteOf(it), out = [], marks = [];
    if (!n) return '';
    if (n.f) out.push('헷갈림 표시: 맞았더라도 확신 없이 골랐음');
    if (n.c && CAUSE_NAME[n.c]) out.push('내가 고른 오답 원인: ' + CAUSE_NAME[n.c]);
    for (var k = 1; k <= 5; k++) { var s = MARK_SYM[n.m.charAt(k - 1)]; if (s) marks.push(CIRC[k - 1] + s); }
    if (marks.length) out.push('선지마다 내가 한 표시(○ 맞다고 봄 · △ 애매 · ✕ 틀리다고 봄, 발문에 따라 뜻이 다를 수 있음): ' + marks.join(' '));
    if (n.t) out.push('내 메모: ' + n.t);
    return out.join('\n');
  }
  function noteBrief(it) {
    var n = noteOf(it), s = '';
    if (!n) return '';
    if (n.f) s += ' · 헷갈림 표시';
    if (n.c && CAUSE_NAME[n.c]) s += ' · 내가 고른 원인 ' + CAUSE_NAME[n.c];
    if (n.t) s += ' · 메모 "' + n.t.replace(/\s+/g, ' ').slice(0, 80) + '"';
    return s;
  }
  /* 틀린 문제 다시 풀기에 헷갈림 표시한 문항도 넣는다(문항 카드 과목) */
  function withUnsure(items) {
    var have = {};
    items.forEach(function (it) { have[it.id] = 1; });
    Object.keys(notes).forEach(function (key) {
      if (!notes[key].f) return;
      var p = key.split('/'), e = examOf(p[0]), n = +p[1];
      if (e && n >= 1 && n <= QN && !have[e.key + '/' + n]) { have[e.key + '/' + n] = 1; items.push(mk(e, n)); }
    });
    return items;
  }
  function unsureCount() { return Object.keys(notes).filter(function (k) { return notes[k].f; }).length; }
  function shortTitle(e) { return etitle(e).replace(/학년도 /, ' ').replace('대학수학능력시험', '수능').replace(' 모의평가', ' 모평'); }
  function parseKey(key) {
    var p = key.split('/'), q = +p[1], e = examOf(p[0]);
    var sec = q > 100 ? 'b' : (PAPER && SUB === 'korean' && q >= 35 ? 'a' : 'c'), n = q > 100 ? q - 100 : q;
    return { exam: p[0], sec: sec, n: n, label: (e ? shortTitle(e) : p[0]) + ' ' + (sec === 'a' ? '화작 ' : sec === 'b' ? '언매 ' : '') + n + '번' };
  }
  /* 다른 회차·선택과목의 문항으로 가기(열고 나서 그 문항으로) */
  function goQuestion(exam, sec, n) {   // 옆 칸(AI 분석·오답 노트)은 열어 둔 채 — 읽으면서 문항을 확인한다
    if (PAPER && (sec === 'a' || sec === 'b') && S.sel !== sec) {
      S.sel = sec;
      if (selSel) selSel.value = sec;
      store('sn:' + SUB + ':sel', sec);
      S.set = '';
    }
    if (S.set === 'exam:' + exam && S.items.length) { jumpTo(sec, n); return; }
    S.pendingJump = { sec: sec, n: n };
    startSet('exam:' + exam);
  }
  function jumpTo(sec, n) {
    for (var i = 0; i < S.items.length; i++) {
      var it = S.items[i];
      if (it.n === n && (!PAPER || it.sec === sec)) { jump(i); return; }
    }
  }
  function takeJump() {
    var pj = S.pendingJump;
    S.pendingJump = null;
    if (pj) jumpTo(pj.sec, pj.n);
  }
  /* 국어·영어: 다시 볼 문제 = 헷갈림 표시 + 오답(계정 기록·지금 채점한 것) */
  function reviewRows() {
    var out = [], at = {};
    var add = function (exam, sec, n, why, c, picked) {
      var k = exam + '/' + sec + n;
      if (at[k]) { if (at[k].why.indexOf(why) < 0) at[k].why += ' · ' + why; if (picked > 0 && !at[k].picked) at[k].picked = picked; return; }
      at[k] = { exam: exam, sec: sec, n: n, why: why, c: c || '', picked: picked > 0 ? picked : 0 };
      out.push(at[k]);
    };
    Object.keys(notes).forEach(function (key) {
      if (!notes[key].f) return;
      var q = parseKey(key);
      add(q.exam, q.sec, q.n, '헷갈림', notes[key].c);
    });
    (S.wrongRows || []).forEach(function (r) {
      var sec = SUB === 'korean' && +r.q >= 35 ? S.sel : 'c', nt = notes[r.exam + '/' + (sec === 'b' ? 100 + (+r.q) : +r.q)];
      add(r.exam, sec, +r.q, +r.picked > 0 ? '오답' : '못 풂', nt && nt.c, +r.picked);
    });
    S.items.forEach(function (it, i) { if (memoWanted(it, i)) add(examKeyOf(it), it.sec, it.n, S.ans[i] ? '오답' : '못 풂', causeOf(it), S.ans[i]); });
    var order = {};
    examList().forEach(function (e, i) { order[e.key] = i; });
    var rank = { c: 0, a: 1, b: 2 };
    out.sort(function (a, b) { return (order[a.exam] - order[b.exam]) || (rank[a.sec] - rank[b.sec]) || (a.n - b.n); });
    return out;
  }
  function reviewBox() {
    var rows = reviewRows();
    if (!rows.length) return null;
    var ul = el('ul');
    rows.forEach(function (r) {
      var e = examOf(r.exam);
      ul.appendChild(el('li', {}, [
        el('a', { href: '#', text: (e ? shortTitle(e) : r.exam) + ' ' + (r.sec === 'a' ? '화작 ' : r.sec === 'b' ? '언매 ' : '') + r.n + '번', onclick: function (ev) { ev.preventDefault(); goQuestion(r.exam, r.sec, r.n); } }),
        ' · ' + r.why + (r.c && CAUSE_NAME[r.c] ? ' · ' + CAUSE_NAME[r.c] : '') + ' ',
        sheetLink(qRef(r.exam, r.sec, r.n), r.why === '헷갈림' ? { unsure: 1 } : !r.picked && r.why.indexOf('못 풂') >= 0 ? { wrong: 1, skip: 1 } : { wrong: 1 }, r.picked)
      ]));
    });
    return el('details', { class: 'pr-review' }, [el('summary', { text: '🔁 다시 볼 문제 (' + rows.length + ')' }), ul]);
  }
  /* 📅 오늘 다시 풀 오답(1·3·7일, /api/due): 문항 카드 과목은 세트로, 국어·영어는 목록에서 그 문항으로 */
  var dueTimer = null;
  function setDue(j) { S.due = (j && j.due) || []; S.dueNext = (j && j.next) || []; }
  function paintDue() {
    var n = S.due ? S.due.length : null;
    if (dueBtn) dueBtn.textContent = '📅 오늘 다시 풀' + (n === null ? '' : ' ' + n);
    if (dueOpt) dueOpt.textContent = '오늘 다시 풀 오답' + (n === null ? '' : ' (' + n + ')');
  }
  function loadDue(open) {
    if (!meUser || !meUser.id || !window.SnAuth) { if (open) openDue(); return; }
    SnAuth.due(SUB).then(function (j) { setDue(j); paintDue(); if (open) openDue(); }).catch(function () {});
  }
  function dueSoon() {
    if (!meUser || !meUser.id) return;
    clearTimeout(dueTimer);
    dueTimer = setTimeout(function () { loadDue(false); }, 2000);
  }
  function dueText(r) { return r.step + '일 뒤 복습' + (r.late ? ' · ' + r.late + '일 밀림' : ''); }
  function dueItems() {
    var items = [];
    (S.due || []).forEach(function (r) {
      var e = examOf(r.exam), q = +r.q;
      if (!e || !(q >= 1 && q <= QN)) return;
      var it = mk(e, q);
      it.dueInfo = r;
      items.push(it);
    });
    return shuffle(items);
  }
  function dueTarget(r) {
    var q = +r.q;
    if (q > 100) return { sec: 'b', n: q - 100 };
    return { sec: PAPER && SUB === 'korean' && q >= 35 ? S.sel : 'c', n: q };
  }
  function openDue() {
    if (!meUser || !meUser.id || !window.SnAuth) {
      showDlg('📅 오늘 다시 풀 오답', el('div', {}, [
        el('p', { class: 'pr-ai-note', text: '로그인하면 틀리거나 헷갈린 문제를 1·3·7일 뒤에 다시 풀도록 날짜별로 챙겨 드립니다.' }),
        window.SnAuth ? el('button', { type: 'button', class: 'pr-kakao', text: '카카오로 로그인', onclick: function () { SnAuth.login(); } }) : null
      ]));
      return;
    }
    if (!PAPER) { startSet('due:today'); return; }
    if (!S.due) { loadDue(true); return; }
    var box = el('div', { class: 'pr-due' }), ul = el('ul');
    S.due.forEach(function (r) {
      var t = dueTarget(r), e = examOf(r.exam);
      if (!e) return;
      ul.appendChild(el('li', {}, [
        el('a', { href: '#', text: shortTitle(e) + ' ' + (t.sec === 'a' ? '화작 ' : t.sec === 'b' ? '언매 ' : '') + t.n + '번', onclick: function (ev) { ev.preventDefault(); goQuestion(r.exam, t.sec, t.n); } }),
        ' · ' + (r.why === 'unsure' ? '헷갈림' : '오답') + ' · ' + dueText(r) + ' ',
        sheetLink(qRef(r.exam, t.sec, t.n), r.why === 'unsure' ? { unsure: 1 } : { wrong: 1 }, 0)
      ]));
    });
    box.appendChild(ul.children.length ? ul : el('p', { class: 'pr-ai-note', text: '오늘 다시 풀 오답이 없습니다 ✓' }));
    var next = (S.dueNext || []).map(function (x) { return x.date.slice(5).replace('-', '/') + ' ' + x.n + '문항'; }).join(' · ');
    box.appendChild(el('p', { class: 'pr-ai-foot', text: '문항을 다시 풀고 ✓(채점)를 누르면 다음 복습(3일·7일 뒤)으로 넘어갑니다. 틀리면 내일 다시 나옵니다.' + (next ? ' 다음 7일: ' + next : '') }));
    showDlg('📅 오늘 다시 풀 오답 (' + ul.children.length + ')', box);
  }
  /* 📊 오답 원인: 이 과목에서 내가 고른 원인을 모두 센다 */
  function openCauses() {
    var by = {}, total = 0, unsure = 0, box = el('div', { class: 'pr-causes' });
    Object.keys(notes).forEach(function (key) {
      var n = notes[key];
      if (n.f) unsure++;
      if (!n.c || !CAUSE_NAME[n.c]) return;
      total++;
      (by[n.c] = by[n.c] || []).push(key);
    });
    if (!total) box.appendChild(el('p', { class: 'pr-ai-note', text: '아직 고른 이유가 없습니다. 틀리거나 헷갈린 문제의 📝 메모에서 이유를 하나 골라 두면 여기에 모입니다.' }));
    CAUSES.slice().sort(function (a, b) { return (by[b[0]] || []).length - (by[a[0]] || []).length; }).forEach(function (c) {
      var keys = by[c[0]] || [];
      if (!keys.length) return;
      var pct = Math.round(keys.length / total * 100), ul = el('ul');
      keys.forEach(function (key) {
        var q = parseKey(key);
        ul.appendChild(el('li', {}, [el('a', { href: '#', text: q.label, onclick: function (ev) { ev.preventDefault(); goQuestion(q.exam, q.sec, q.n); } }), ' ', sheetLink(qRef(q.exam, q.sec, q.n), { wrong: 1 }, 0)]));
      });
      box.appendChild(el('details', { class: 'pr-cause-row' }, [el('summary', {}, [
        el('span', { class: 'pr-cause-name', text: c[1] }),
        el('span', { class: 'pr-cause-bar' }, [el('i', { style: 'width:' + pct + '%' })]),
        el('span', { class: 'pr-cause-n', text: keys.length + '문항 · ' + pct + '%' })
      ]), ul]));
    });
    if (unsure) box.appendChild(el('p', { class: 'pr-ai-foot', text: '🤔 헷갈림 표시 ' + unsure + '문항 — ' + (PAPER ? '답안지 아래 ‘다시 볼 문제’' : '‘틀린·헷갈린 문제 다시 풀기’') + '에 모여 있습니다.' }));
    showDlg('📊 ' + exportSubject() + ' 오답 원인', box);
  }
  /* 채점 결과: 이번 세트 오답의 원인 */
  function causeLine() {
    var cnt = {}, none = 0, wrong = 0;
    S.items.forEach(function (it, i) {
      if (isRight(it, S.ans[i])) return;   // 못 푼 문제도 오답
      wrong++;
      var c = causeOf(it);
      if (c) cnt[c] = (cnt[c] || 0) + 1; else none++;
    });
    if (!wrong) return null;
    var parts = CAUSES.filter(function (c) { return cnt[c[0]]; }).map(function (c) { return c[1] + ' ' + cnt[c[0]]; });
    if (none) parts.push('아직 안 고름 ' + none);
    return el('p', { class: 'pr-sub', text: '오답 원인: ' + parts.join(' · ') });
  }

  /* ───────── 📋 오답 노트 · 오답 한 장: 틀리거나 헷갈린 문제마다 시험지·내 답·정답·원인·메모·해설·AI 분석·비슷한 실제 기출을 한 화면에 ─────────
   * 문항은 { exam, sec, n } 으로 가리킨다(문항 카드 과목은 sec '', 국어·영어는 'c'·'a'·'b'). 고른 답은 계정 기록(/api/wrong)·지금 푼 것에서 */
  function qRef(exam, sec, n) { return { exam: exam, sec: PAPER ? (sec || 'c') : '', n: +n }; }
  function refKey(r) { return r.exam + '/' + r.sec + r.n; }
  function refLabel(r) {
    var e = examOf(r.exam);
    return (e ? shortTitle(e) : r.exam) + ' ' + (r.sec === 'a' ? '화작 ' : r.sec === 'b' ? '언매 ' : '') + r.n + '번';
  }
  function sheetLink(ref, why, picked) {
    return el('button', { type: 'button', class: 'pr-ai-link pr-sheet-link', text: '📋 한 장', onclick: function () { openSheet({ ref: ref, why: why, picked: picked || 0, ts: 0 }, openNotebook); } });
  }
  /* 노트·AI 에 넘기는 문항 모양. 국어·영어는 그 회차 시험지 meta 에서 정답·배점을 채운다 */
  function refItem(r, m) {
    if (!PAPER) { var e = examOf(r.exam); return e ? mk(e, r.n) : null; }
    var k = r.n - SEC_LO[r.sec];
    if (!m || !m.answers[r.sec] || m.answers[r.sec][k] == null) return null;
    return { ex: r.exam, sec: r.sec, n: r.n, ans: m.answers[r.sec][k], pts: m.points[r.sec][k] };
  }
  function refInfo(r) {
    if (!PAPER) return Promise.resolve({ it: refItem(r), m: null });
    return loadMeta(r.exam).then(function (m) { return { it: refItem(r, m), m: m }; });
  }
  function notebookRows() {
    var at = {}, out = [];
    function add(ref, why, picked, ts) {
      if (!examOf(ref.exam) || !(ref.n >= 1)) return;
      var k = refKey(ref), row = at[k];
      if (!row) { row = at[k] = { ref: ref, why: {}, picked: 0, ts: 0 }; out.push(row); }
      row.why[why] = 1;
      if (picked > 0 && !row.picked) row.picked = picked;
      if (ts > row.ts) row.ts = ts;
    }
    var acct = meUser && meUser.id && window.SnAuth;
    return (acct ? SnAuth.wrong(SUB).catch(function () { return null; }) : Promise.resolve(null)).then(function (rows) {
      (rows || []).forEach(function (r) { var t = dueTarget(r); add(qRef(r.exam, t.sec, t.n), 'wrong', +r.picked, +r.ts || 0); if (!(+r.picked > 0)) add(qRef(r.exam, t.sec, t.n), 'skip', 0, 0); });
      if (!rows && !PAPER) (store('sn:' + SUB + ':wrong') || []).forEach(function (id) { var p = String(id).split('/'); add(qRef(p[0], '', +p[1]), 'wrong', 0, 0); });
      Object.keys(notes).forEach(function (key) {
        var n = notes[key];
        if (!n.f && !n.c) return;
        var q = parseKey(key);
        add(qRef(q.exam, q.sec, q.n), n.f ? 'unsure' : 'wrong', 0, n.u || 0);
      });
      S.items.forEach(function (it, i) {
        if (isShown(i) && !isRight(it, S.ans[i])) { add(qRef(examKeyOf(it), it.sec, it.n), 'wrong', S.ans[i], Date.now()); if (!S.ans[i]) add(qRef(examKeyOf(it), it.sec, it.n), 'skip', 0, 0); }
      });
      var order = {};
      examList().forEach(function (e, i) { order[e.key] = i; });
      out.sort(function (a, b) { return (b.ts - a.ts) || (order[a.ref.exam] - order[b.ref.exam]) || (a.ref.n - b.ref.n); });
      return out;
    });
  }
  function openNotebook() {
    var box = el('div', { class: 'pr-nb' }, [el('p', { class: 'pr-ai-note', text: '불러오는 중…' })]);
    showDlg('📋 ' + exportSubject() + ' 오답 노트', box);
    notebookRows().then(function (rows) {
      box.innerHTML = '';
      if (!rows.length) {
        box.appendChild(el('p', { class: 'pr-ai-note', text: '아직 틀리거나 헷갈린 문제가 없습니다. 문제를 풀고 채점하면 틀린 문제가, 🤔 헷갈림을 눌러 두면 맞힌 문제도 여기에 모입니다.' + (meUser && meUser.id ? '' : ' 로그인하면 다른 기기에서 푼 기록까지 모입니다.') }));
        return;
      }
      var nw = rows.filter(function (r) { return r.why.wrong; }).length;
      box.appendChild(el('p', { class: 'pr-nb-sum', text: '오답 ' + nw + (rows.length > nw ? ' · 헷갈림 ' + (rows.length - nw) : '') + ' — 누르면 시험지·내 답·원인·AI 분석·비슷한 기출이 한 장에 나옵니다.' }));
      var ul = el('ul', { class: 'pr-nb-list' });
      rows.forEach(function (row) {
        var it = !PAPER ? refItem(row.ref) : null, c = causeOf({ ex: row.ref.exam, sec: row.ref.sec, n: row.ref.n });
        ul.appendChild(el('li', {}, [el('button', { type: 'button', class: 'pr-nb-row', onclick: function () { openSheet(row, openNotebook); } }, [
          el('b', { text: refLabel(row.ref) }),
          el('span', { class: 'pr-nb-tags' }, [
            it ? el('span', { text: it.pts + '점' }) : null,
            it && it.tag && partName[it.tag] ? el('span', { text: partName[it.tag] }) : null,
            el('span', { class: row.why.wrong ? 'pr-nb-w' : 'pr-nb-u', text: row.why.wrong ? (row.why.skip && !row.picked ? '못 풂' : '오답') + (row.why.unsure ? '·헷갈림' : '') : '헷갈림' }),
            c ? el('span', { class: 'pr-nb-c', text: CAUSE_NAME[c] }) : null
          ]),
          el('span', { class: 'pr-nb-go', text: '한 장 →' })
        ])]));
      });
      box.appendChild(ul);
    });
  }
  /* 국어·영어 시험지 단에서 그 문항 부분만 잘라 보인다(다음 문항이 시작하는 곳까지, 다음 단으로 넘어가면 그 앞부분도) */
  function cropOf(m, exam, sec, n) {
    var an = m.anchors[sec] || {}, a = an[n], nx = an[n + 1];
    if (!a) return null;
    var parts = [[a[0], Math.max(0, a[1] - 8), nx && nx[0] === a[0] ? nx[1] : m.strips[sec][a[0]].h]];
    if (nx && nx[0] === a[0] + 1 && nx[1] > 40) parts.push([nx[0], 0, nx[1]]);
    return el('div', { class: 'pr-crops' }, parts.map(function (p) {
      var st = m.strips[sec][p[0]], h = Math.max(60, p[2] - p[1]), shift = 'transform:translateY(' + (-p[1] / st.h * 100).toFixed(3) + '%)';
      var box = el('div', { class: 'pr-crop', style: 'aspect-ratio:' + st.w + '/' + h }, [el('img', {
        src: (cfg.imgBase || cfg.base) + exam + '/' + SUB + '/' + st.file, alt: refLabel({ exam: exam, sec: sec, n: n }) + ' 문항', loading: 'lazy', decoding: 'async',
        style: shift
      })]);
      /* 시험지 단에 펜으로 쓴 표시도 같은 자리만큼 옮겨 보인다 */
      if (store(inkKey(exam, st.file))) {
        var ink = inkSvg(inkKey(exam, st.file), st.w, st.h, 'pr-ink');
        ink.setAttribute('style', 'height:auto;aspect-ratio:' + st.w + '/' + st.h + ';' + shift);
        box.appendChild(ink);
      }
      return box;
    }));
  }
  /* 원인·헷갈림·메모: 문항 카드의 메모 칸과 같은 노트에 쓴다 */
  function noteEditor(it) {
    var saved = el('span', { class: 'pr-memo-saved', 'aria-live': 'polite' });
    var chips = el('div', { class: 'pr-cause', role: 'group', 'aria-label': '틀리거나 헷갈린 이유' }, [el('span', { class: 'pr-cause-h', text: '이유' })]);
    var paint = function () {
      Array.prototype.forEach.call(chips.querySelectorAll('.pr-cause-b'), function (b) { b.setAttribute('aria-pressed', causeOf(it) === b.getAttribute('data-c') ? 'true' : 'false'); });
      uns.setAttribute('aria-pressed', unsureOf(it) ? 'true' : 'false');
    };
    CAUSES.forEach(function (c) {
      chips.appendChild(el('button', { type: 'button', class: 'pr-cause-b', 'data-c': c[0], text: c[1], onclick: function () { setNote(it, { c: causeOf(it) === c[0] ? '' : c[0] }); paint(); saved.textContent = '저장됨 ✓'; } }));
    });
    var uns = el('button', { type: 'button', class: 'pr-unsure-sw', text: '🤔 헷갈림 — 맞았어도 다시 볼 문제', onclick: function () { setNote(it, { f: unsureOf(it) ? 0 : Date.now() }); paint(); saved.textContent = '저장됨 ✓'; } });
    var ta = el('textarea', { class: 'pr-memo-in', rows: '2', maxlength: '1000', 'aria-label': '메모', placeholder: '왜 이 답을 골랐나 · 어느 단계에서 틀어졌나 — 한 줄로',
      oninput: function () { setNote(it, { t: ta.value }); saved.textContent = '저장됨 ✓'; } });
    ta.value = memoOf(it);
    paint();
    return el('div', { class: 'pr-memo pr-sheet-memo' }, [el('div', { class: 'pr-memo-h' }, [el('b', { text: '📝 원인·메모' }), saved]), chips, uns, ta]);
  }
  /* 전에 받아 둔 AI 해설이 있으면(고른 답이 달라도) 그것부터 보인다 */
  function savedAi(r) {
    var pre = aiIdOf(r.exam, r.sec, r.n, 0).replace(/:0$/, ':');
    try {
      for (var k = 0; k < localStorage.length; k++) { var key = localStorage.key(k); if (key && key.indexOf('sn:ai:' + pre) === 0) return key.slice(6); }
    } catch (e) {}
    if (aiCloudOn() && aiIdx) for (var id in aiIdx) if (id.indexOf(pre) === 0) return id;
    return '';
  }
  function sheetSec(title, kids) { return el('section', { class: 'pr-sheet-sec' }, [el('h4', { text: title })].concat(kids)); }
  function openSheet(row, back) {
    var r = row.ref;
    var box = el('div', { class: 'pr-sheet' });
    box.appendChild(el('div', { class: 'pr-sheet-top' }, [
      back ? el('button', { type: 'button', class: 'pr-ai-link', text: '← 오답 목록', onclick: back }) : null,
      el('button', { type: 'button', class: 'pr-ai-link', text: '시험지에서 풀기 →', onclick: function () { goQuestion(r.exam, r.sec || 'c', r.n); } })
    ]));
    var body = el('div', {}, [el('p', { class: 'pr-ai-note', text: '불러오는 중…' })]);
    box.appendChild(body);
    showDlg('📋 ' + refLabel(r), box);
    refInfo(r).then(function (info) {
      var it = info.it;
      body.innerHTML = '';
      if (!it) { body.appendChild(el('p', { class: 'pr-ai-note', text: '이 문항의 자료를 찾지 못했습니다.' })); return; }
      var a = row.picked || 0, skip = !a && !!row.why.skip, lost = !a && row.why.wrong && !skip;
      /* ① 문제 */
      body.appendChild(el('div', { class: 'pr-sheet-q' }, [PAPER ? cropOf(info.m, r.exam, r.sec, r.n) : el('div', { class: 'pr-paper' }, [inkShow(el('img', { class: 'pr-img', src: it.img, alt: refLabel(r) + ' 문항', decoding: 'async' }), inkKey(r.exam, 'q' + pad(r.n)))])]));
      /* ② 내 답 · 정답 */
      var verdict = el('p', { class: 'pr-verdict pr-sheet-ans' }, [
        a ? el('span', { class: isRight(it, a) ? 'pr-sheet-ok' : 'pr-sheet-bad', text: '내 답 ' + ansText(it, a) }) : el('span', { class: 'pr-sheet-mute', text: skip ? '못 푼 문제' : lost ? '내 답 기록 없음' : '헷갈림 표시' }),
        ' → ', el('b', { class: 'pr-ans-t', text: '정답 ' + corrText(it) }), ' · ' + it.pts + '점',
        it.tag && partName[it.tag] ? el('a', { class: 'pr-tag', href: partHref[it.tag] || '#', text: partName[it.tag] }) : null
      ]);
      body.appendChild(verdict);
      if (a && !isRight(it, a) && !it.num) loadTrap(r.exam).then(function (map) {
        var t = map && map[r.n] && map[r.n].o && map[r.n].o[a];
        if (t) body.insertBefore(el('p', { class: 'pr-trap' }, [el('b', { text: '내가 고른 ' + chLabel(a) + ' — 왜 오답일까? ' }), t]), verdict.nextSibling);
      });
      /* ③ 원인·메모 */
      body.appendChild(noteEditor(it));
      /* ④ 해설 */
      var exp = el('details', { class: 'pr-sheet-exp' }, [el('summary', { text: '📖 해설' }), el('div', { class: 'pr-exp-body', text: '불러오는 중…' })]);
      body.appendChild(exp);
      loadExplain(r.exam).then(function (map) {
        var t = map && map[r.n], d = exp.lastChild;
        if (t) { d.className = 'pr-exp-body has'; d.innerHTML = fmtExp(t); exp.open = true; }
        else d.textContent = '이 문항의 상세 해설은 아직 없습니다. 아래 AI 분석을 받아 보세요.';
      });
      /* ⑤ AI 실수 분석 */
      var id = aiIdOf(r.exam, r.sec, r.n, a > 0 ? a : 0), have = aiRun(id).status !== 'idle' ? id : savedAi(r);
      var aiWrap = sheetSec('🤖 AI 실수 분석', []);
      if (have) {
        aiNeed(have, function () { var ha = +have.split(':').pop(); return reqFor(it, ha > 0 ? ha : lost ? -1 : 0, null, info.m); });
        aiWrap.appendChild(aiBox(have));
      }
      else {
        var go = el('button', { type: 'button', class: 'pr-btn pr-ai-cta', text: a > 0 && !isRight(it, a) ? '🤖 내가 ' + ansText(it, a) + '을(를) 고른 이유까지 분석 받기' : '🤖 AI 해설 받기', onclick: function () {
          if (aiStart(id, function () { return reqFor(it, lost ? -1 : a, null, info.m); }, false, aiWhatItem(refLabel(r), it, a)).status === 'idle') return;
          aiWrap.replaceChild(aiBox(id), go);
          if (hint.parentNode) hint.parentNode.removeChild(hint);
        } });
        var hint = el('p', { class: 'pr-sheet-hint', text: keyMode() ? '분석이 끝나면 ‘비슷한 문제 내 줘’로 같은 함정의 새 문제도 받을 수 있어요.' : 'AI 분석은 내 Anthropic API 키로 요청합니다. 로그인하고 ‘내 정보’에 키를 한 번 넣어 두면 어느 기기에서나 쓸 수 있어요.' });
        aiWrap.appendChild(go);
        aiWrap.appendChild(hint);
      }
      body.appendChild(aiWrap);
      /* ⑥ 비슷한 실제 기출 */
      body.appendChild(similarSec(r, it, function () { openSheet(row, back); }));
    });
  }
  /* 비슷한 실제 기출: 같은 파트(파트가 있는 과목) · 같은 번호 근처(한국사는 시대순이라 ±1) · 같은 번호(영어는 번호마다 유형이 같다, 국어는 같은 체제 회차) */
  function similarRefs(r, it) {
    var out = [], all = examList(), base = examOf(r.exam);
    var newKo = function (e) { return +e.year >= 2022; };
    all.forEach(function (e, ei) {
      var s = e[SUB];
      if (PAPER) {
        if (e.key === r.exam || (SUB === 'korean' && newKo(e) !== newKo(base))) return;
        out.push({ ref: qRef(e.key, r.sec, r.n), score: -ei });
        return;
      }
      for (var n = 1; n <= QN; n++) {
        if (e.key === r.exam && n === r.n) continue;
        if (oos(s, n) && !it.oos) continue;   // 범위 밖 문항은 권하지 않는다
        var near = it.tag ? (s.t && s.t[n - 1] === it.tag) : Math.abs(n - r.n) <= 1;
        if (!near) continue;
        out.push({ ref: qRef(e.key, '', n), score: (it.tp && s.u && s.u[n - 1] === it.tp ? 1000 : 0) + (isCsat(e) ? 300 : 0) + (s.p[n - 1] === it.pts ? 100 : 0) + (it.tag ? 0 : (n === r.n ? 50 : 0)) - ei });   // 같은 세부 유형이 먼저
      }
    });
    out.sort(function (x, y) { return y.score - x.score; });
    return out.map(function (x) { return x.ref; });
  }
  function similarSec(r, it, reopen) {
    var list = similarRefs(r, it), at = 0;
    var why = PAPER ? (SUB === 'english' ? '같은 번호(같은 유형)의 다른 회차' : '같은 체제 회차의 같은 번호') : it.tp ? '같은 유형(' + topicName[it.tp] + ')부터' : it.tag && partName[it.tag] ? '같은 파트(' + partName[it.tag] + ')' : '같은 시대(번호 근처)';
    var grid = el('div', { class: 'pr-sim' });
    var more = el('button', { type: 'button', class: 'pr-btn', text: '다른 문제 3개', onclick: function () { at += 3; paint(); } });
    function paint() {
      grid.innerHTML = '';
      if (at >= list.length) at = 0;
      list.slice(at, at + 3).forEach(function (q) { grid.appendChild(miniQ(q, reopen)); });
      more.hidden = list.length <= 3;
    }
    paint();
    return sheetSec('🔁 비슷한 실제 기출 바로 풀기', [el('p', { class: 'pr-sheet-hint', text: why + ' · 풀면 기록에 남고, 틀리면 오답 노트에 들어갑니다.' }), grid, more]);
  }
  /* 미니 풀기: 고르면 바로 채점하고 기록(계정·이 기기)에 남긴다 */
  function miniQ(q, reopen) {
    var box = el('div', { class: 'pr-mini' }, [el('p', { class: 'pr-mini-h', text: refLabel(q) + ' 불러오는 중…' })]);
    refInfo(q).then(function (info) {
      var it = info.it;
      box.innerHTML = '';
      if (!it) { box.appendChild(el('p', { class: 'pr-mini-h', text: refLabel(q) + ' — 자료 없음' })); return; }
      box.appendChild(el('p', { class: 'pr-mini-h' }, [el('b', { text: refLabel(q) }), ' · ' + it.pts + '점']));
      box.appendChild(PAPER ? cropOf(info.m, q.exam, q.sec, q.n) : el('div', { class: 'pr-paper' }, [inkShow(el('img', { class: 'pr-img', src: it.img, alt: refLabel(q) + ' 문항', loading: 'lazy', decoding: 'async' }), inkKey(q.exam, 'q' + pad(q.n)))]));
      var res = el('p', { class: 'pr-mini-res', 'aria-live': 'polite' });
      var ctl = el('div', { class: it.num ? 'pr-numrow' : 'pr-choices pr-mini-ch' });
      var done = function (a) {
        if (!a || box.getAttribute('data-done')) return;
        box.setAttribute('data-done', '1');
        var ok = isRight(it, a);
        Array.prototype.forEach.call(ctl.querySelectorAll('button, input'), function (x) { x.disabled = true; });
        Array.prototype.forEach.call(ctl.querySelectorAll('.pr-ch'), function (b, k) {
          if (k + 1 === a) b.classList.add('sel');   // 내 답은 검게(맞았으면 빨간 테두리가 더해진다)
          if (it.ans !== 0 && isRight(it, k + 1)) b.classList.add('right');
          if (k + 1 === a && !ok) b.classList.add('wrong');
        });
        res.className = 'pr-mini-res ' + (ok ? 'ok' : 'bad');
        res.textContent = ok ? '⭕ 정답!' : '❌ 오답 · 정답 ' + corrText(it);
        if (!PAPER) recordWrong(it, a);
        noteDone(q.exam, q.n, ok, 0, a); saveDone();
        if (window.SnAuth) { SnAuth.record([{ exam: q.exam, sub: SUB, q: q.n, picked: a, ok: ok ? 1 : 0, ts: Date.now(), mode: 'practice' }]); dueSoon(); }
        if (!ok) box.appendChild(el('button', { type: 'button', class: 'pr-ai-link', text: '이 문제도 한 장으로 보기 →', onclick: function () { openSheet({ ref: q, why: { wrong: 1 }, picked: a, ts: Date.now() }, reopen); } }));
      };
      if (it.num) {
        var inp = el('input', { type: 'text', inputmode: 'numeric', pattern: '[0-9]*', maxlength: '3', class: 'pr-num', placeholder: '정답(0~999)', 'aria-label': refLabel(q) + ' 답',
          onkeydown: function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); done(parseInt(inp.value, 10)); } } });
        ctl.appendChild(inp);
        ctl.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '확인', onclick: function () { done(parseInt(inp.value, 10)); } }));
      } else {
        for (var k = 1; k <= 5; k++) (function (k) {
          ctl.appendChild(el('button', { type: 'button', class: 'pr-ch', text: CIRC[k - 1], 'aria-label': refLabel(q) + ' ' + k + '번 고르기', onclick: function () { done(k); } }));
        })(k);
      }
      box.appendChild(ctl);
      box.appendChild(res);
    });
    return box;
  }

  /* ───────── paper 렌더 ───────── */
  function renderPaper() {
    var m = S.meta, key = S.set.slice(5);
    if (SUB === 'english' && m.script) list.appendChild(scriptBox());
    paperSecs().forEach(function (sec) {
      list.appendChild(el('h3', { class: 'pr-sec', text: SEC_NAME[sec] + ' (' + SEC_LO[sec] + '~' + (SEC_LO[sec] + m.answers[sec].length - 1) + '번)' }));
      var wrap = el('div', { class: 'pr-strips' });
      var strips = m.strips[sec], anchors = m.anchors[sec], hots = hotByStrip(m, sec);
      /* 영어 듣기(1~17번) 단은 음성 막대와 한 묶음 — 막대가 그 단을 지나는 동안만 위에 붙어 따라온다 */
      var a18 = SUB === 'english' && sec === 'c' && m.audio && anchors['18'], listen = null;
      if (a18) wrap.appendChild(listen = el('div', { class: 'pr-listen' }, [listenBar(key, m.audio)]));
      strips.forEach(function (s, idx) {
        var img = el('img', { src: (cfg.imgBase || cfg.base) + key + '/' + SUB + '/' + s.file, width: s.w, height: s.h, alt: SEC_NAME[sec] + ' 시험지 ' + (idx + 1) + '단', loading: 'lazy', decoding: 'async' });
        var ib = inkWrap(img, inkKey(key, s.file), s.w, s.h, true);
        hotAdd(ib, hots[idx], s.w, s.h);
        var box = el('div', { class: 'pr-strip' }, [ib]);
        for (var n in anchors) {
          var a = anchors[n];
          if (a[0] === idx) box.appendChild(el('span', { class: 'pr-anchor', id: 'pq-' + sec + n, style: 'top:' + (a[1] / s.h * 100).toFixed(2) + '%', 'aria-hidden': 'true' }));
        }
        (listen && (idx < a18[0] || (idx === a18[0] && a18[1] > 40)) ? listen : wrap).appendChild(box);
      });
      list.appendChild(wrap);
    });
  }
  /* ───────── 시험지 위 ①~⑤ 누르기: meta.choices(PDF 글자 자리, 단 이미지 픽셀)에 투명 단추를 얹어 답안지와 같은 답을 고른다.
     ○△✕ 표시 모드면 표시를 바꾸고, 고른 답·정답·오답은 번호에 테두리로 보인다 ───────── */
  function hotByStrip(m, sec) {
    var by = {}, ch = (m.choices || {})[sec] || {};
    for (var n in ch) ch[n].forEach(function (b, k) { (by[b[0]] = by[b[0]] || []).push([sec + n, k + 1, b[1], b[2], b[3], b[4], +n]); });
    return by;
  }
  /* 문항 그림(수학·탐구·한국사): hot/<과목>.json = {회차: {번호: [그림 폭, 높이, [[x, y, w, h] ×5]]}} */
  function hotOfItem(it) {
    var z = !it.num && HOT && HOT[it.ex] && HOT[it.ex][it.n];
    return z ? { list: z[2].map(function (b, k) { return [it.id, k + 1, b[0], b[1], b[2], b[3], it.n]; }), w: z[0], h: z[1] } : null;
  }
  /* list: [[문항 키(국·영 구역+번호, 그 밖은 회차/번호), 선지, x, y, w, h, 번호]] — w·h 는 그림 원래 크기 */
  function hotAdd(box, list, w, h) {
    if (!list || !list.length) return;
    box._hot = { list: list, w: w, h: h };
    list.forEach(function (c) {
      var q = c[0], k = c[1], p = 5;   // 누르기 쉽게 글자보다 조금 넓게
      box.appendChild(el('button', { type: 'button', class: 'pr-hot', 'data-q': q, 'data-k': k, 'aria-label': c[6] + '번 ' + k + '번 고르기',
        style: 'left:' + ((c[2] - p) / w * 100).toFixed(3) + '%;top:' + ((c[3] - p) / h * 100).toFixed(3) + '%;width:' + ((c[4] + 2 * p) / w * 100).toFixed(3) + '%;height:' + ((c[5] + 2 * p) / h * 100).toFixed(3) + '%',
        onclick: function () { hotPick(q, k); } }));
    });
  }
  function hotKey(it) { return it.sec ? it.sec + it.n : it.id; }
  function hotPick(q, k) {
    if (Date.now() - inkDrew < 400) return;   // 번호에서 시작해 끌어 쓴 경우
    for (var i = 0; i < S.items.length; i++) if (hotKey(S.items[i]) === q) return S.markMode ? cycleMark(i, k) : choose(i, k);
  }
  function paintHot() {
    var at = {};
    S.items.forEach(function (it, i) { at[hotKey(it)] = i; });
    Array.prototype.forEach.call(root.querySelectorAll('.pr-hot'), function (b) {
      var i = at[b.getAttribute('data-q')], it = S.items[i], k = +b.getAttribute('data-k');
      if (!it) return;
      var shown = isShown(i), mark = MARK_SYM[markOf(it, k)];
      b.classList.toggle('sel', S.ans[i] === k);
      b.classList.toggle('right', !!(shown && it.ans !== 0 && isRight(it, k)));
      b.classList.toggle('wrong', !!(shown && S.ans[i] === k && !isRight(it, k)));
      b.setAttribute('aria-pressed', S.ans[i] === k ? 'true' : 'false');
      if (mark) b.setAttribute('data-mark', mark); else b.removeAttribute('data-mark');
    });
  }
  /* ───────── 영어 듣기 음성: 평가원 듣기평가 음원을 회차마다 한 파일로 이은 것(meta.audio = { file, dur, q: 문항 시작 초 · 16 = 16~17번 }).
     소리(LS.a)는 막대와 따로 두어 채점·모드 전환으로 시험지를 다시 그려도 이어진다 ───────── */
  var LS = { a: null, key: '', q: null, dur: 0, bar: null, drag: false, pend: null, err: false };
  var RATES = [1, 1.25, 1.5, 0.75];
  function listenAt(t) {
    var cur = 0;
    for (var n in LS.q) if (LS.q[n] <= t + 0.5 && +n > cur) cur = +n;
    return cur;
  }
  /* 아직 안 불러온 소리는 위치를 기억해 두었다가 길이를 알면 옮긴다(iOS 는 그 전에 currentTime 을 무시한다) */
  function listenSeek(t) {
    if (LS.a.readyState >= 1) LS.a.currentTime = t;
    else LS.pend = t;
  }
  function listenPlay(t) {
    if (t != null) listenSeek(t);
    var p = LS.a.play();
    if (p && p.catch) p.catch(function () { LS.err = true; paintListen(); });
  }
  function listenBar(key, au) {
    if (LS.key !== key) {
      if (LS.a) LS.a.pause();
      var a = LS.a = new Audio(), r = +store('sn:' + SUB + ':rate') || 1;
      a.preload = 'none';
      a.defaultPlaybackRate = a.playbackRate = r;
      a.src = (cfg.imgBase || cfg.base) + key + '/' + SUB + '/' + au.file;
      a.addEventListener('loadedmetadata', function () { if (LS.pend != null) { a.currentTime = LS.pend; LS.pend = null; } });
      ['play', 'pause', 'ended', 'timeupdate', 'ratechange', 'playing', 'error'].forEach(function (ev) {
        a.addEventListener(ev, function () { if (a !== LS.a) return; if (ev === 'playing') LS.err = false; if (ev === 'error') LS.err = true; paintListen(); });
      });
      LS.key = key; LS.q = au.q; LS.dur = au.dur; LS.pend = null; LS.err = false;
    }
    var b = LS.bar = { cur: -1 };
    b.play = el('button', { type: 'button', class: 'pr-lb-play', onclick: function () { if (LS.a.paused) listenPlay(); else LS.a.pause(); } });
    b.now = el('b', { class: 'pr-lb-now' });
    b.time = el('span', { class: 'pr-lb-time' });
    b.seek = el('input', { type: 'range', class: 'pr-lb-seek', min: '0', max: String(Math.ceil(au.dur)), step: '1', value: '0', 'aria-label': '듣기 위치' });
    b.seek.addEventListener('input', function () { LS.drag = true; paintListen(); });
    b.seek.addEventListener('change', function () { LS.drag = false; listenSeek(+b.seek.value); paintListen(); });
    b.rate = el('button', { type: 'button', class: 'pr-lb-rate', title: '재생 속도', onclick: function () {
      var r = RATES[(RATES.indexOf(LS.a.playbackRate) + 1) % RATES.length];
      LS.a.defaultPlaybackRate = LS.a.playbackRate = r;
      store('sn:' + SUB + ':rate', r === 1 ? null : r);
    } });
    b.qs = el('div', { class: 'pr-lb-qs', role: 'group', 'aria-label': '이 문항부터 듣기' });
    Object.keys(au.q).sort(function (x, y) { return x - y; }).forEach(function (n) {
      b.qs.appendChild(el('button', { type: 'button', class: 'pr-lb-q', 'data-n': n, text: n === '16' ? '16~17' : n, 'aria-label': n + '번부터 듣기', onclick: function () { listenPlay(au.q[n]); } }));
    });
    b.root = el('div', { class: 'pr-listen-bar', role: 'region', 'aria-label': '영어 듣기 음성' }, [el('div', { class: 'pr-lb-row' }, [b.play, b.now, b.time, b.seek, b.rate]), b.qs]);
    paintListen();
    return b.root;
  }
  function paintListen() {
    var b = LS.bar, a = LS.a;
    if (!b || !a) return;
    var t = LS.drag ? +b.seek.value : LS.pend != null ? LS.pend : (a.currentTime || 0), cur = listenAt(t);
    b.play.textContent = a.paused ? '▶' : '❚❚';
    b.play.setAttribute('aria-label', a.paused ? '듣기 재생' : '일시 정지');
    b.now.textContent = LS.err ? '음성을 못 불러왔어요' : a.paused && t < 1 ? '🎧 듣기' : cur === 16 ? '16~17번' : cur ? cur + '번' : '안내';
    b.time.textContent = fmtTime(Math.floor(t)) + ' / ' + fmtTime(Math.round(LS.dur));
    if (!LS.drag) b.seek.value = String(Math.floor(t));
    b.seek.setAttribute('aria-valuetext', b.time.textContent);
    b.rate.textContent = a.playbackRate + '×';
    if (cur === b.cur) return;
    b.cur = cur;
    Array.prototype.forEach.call(b.qs.children, function (c) {
      var on = +c.getAttribute('data-n') === cur;
      c.classList.toggle('on', on);
      if (on) b.qs.scrollLeft = c.offsetLeft - (b.qs.clientWidth - c.offsetWidth) / 2;   // 지금 문항 칩을 가운데로(창은 안 굴린다)
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
  /* 좁은 화면의 답안지(📝)는 닫으면 화면에서 빠져 스크롤 자리를 잃는다 — 단추로 열 때는 지금 시험지에서 보고 있는 문항 줄로 바로 간다 */
  function toggleOmr(force, toNow) {
    var open = force === undefined ? !omr.classList.contains('open') : force;
    omr.classList.toggle('open', open);
    if (fab) fab.textContent = open ? '✕ 닫기' : '📝 답안지';
    if (open && toNow) omrTo(viewQ());
  }
  /* 지금 보고 있는 문항: 화면 위에서 35% 선을 지난 문항 머리 중 가장 아래 것(아직 없으면 화면 아래로 가장 가까운 것) */
  function viewQ() {
    var line = window.innerHeight * 0.35, best = -1, bestTop = -Infinity, next = -1, nextTop = Infinity;
    S.items.forEach(function (it, i) {
      var a = PAPER ? document.getElementById('pq-' + it.sec + it.n) : document.getElementById('q-' + i);
      if (!a) return;
      var top = a.getBoundingClientRect().top;
      if (top <= line) { if (top > bestTop) { bestTop = top; best = i; } }
      else if (top < nextTop) { nextTop = top; next = i; }
    });
    return best >= 0 ? best : next;
  }
  /* 답안지 안에서만 그 문항 줄을 가운데로 옮기고 잠깐 테두리로 짚는다(창은 굴리지 않는다) */
  function omrTo(i) {
    var row = i >= 0 && omr.querySelector('.pr-row[data-i="' + i + '"]');
    if (!row) return;
    omr.scrollTop += row.getBoundingClientRect().top - omr.getBoundingClientRect().top - (omr.clientHeight - row.offsetHeight) / 2;
    row.classList.add('now');
    setTimeout(function () { row.classList.remove('now'); }, 1600);
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
    omr.appendChild(el('div', { class: 'pr-omr-top' }, [   // 답안지 머리: 제목·남은 시간·펜 도구 — 답안지를 내려도 위에 붙어 있다
      el('h3', {}, ['답안지', omrClock = el('span', { class: 'pr-omr-clock' })]),   // 위 막대가 스크롤로 사라져도 남은 시간이 보이게
      inkTools()
    ]));
    paintClock();
    /* 국어·영어: 선지마다 ○△✕ 를 표시하는 모드(답과 따로 저장) */
    if (PAPER) {
      var modeSw = function (on, text) {
        return el('button', { type: 'button', class: 'pr-mark-sw', 'aria-pressed': S.markMode === on ? 'true' : 'false', text: text, onclick: function () { S.markMode = on; renderOmr(); } });
      };
      omr.appendChild(el('div', { class: 'pr-mark-tog', role: 'group', 'aria-label': '답안지 누르기' }, [modeSw(false, '답 고르기'), modeSw(true, '○△✕ 표시')]));
      if (S.markMode) omr.appendChild(el('p', { class: 'pr-mark-hint', text: '선지 번호를 누를 때마다 ○ → △ → ✕ → 지움. 고른 답은 그대로입니다.' }));
    }
    var grid = el('div', { class: 'pr-grid' });
    var lastSec = null;
    S.items.forEach(function (it, i) {
      if (PAPER && it.sec !== lastSec) {
        lastSec = it.sec;
        grid.appendChild(el('div', { class: 'pr-omr-sec', text: SEC_NAME[it.sec] }));
      }
      var row = el('div', { class: 'pr-row' + stateCls(it, i) + (it.num ? ' numrow' : '') + (PAPER && unsureOf(it) ? ' unsure' : ''), 'data-i': i });
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
        var mark = PAPER ? MARK_SYM[markOf(it, k)] : '';
        row.appendChild(el('button', {
          type: 'button', class: cls, 'data-mark': mark || false, text: k,
          'aria-label': label + '번 ' + k + '번 ' + (S.markMode && PAPER ? '표시 바꾸기' : '선택') + (mark ? ' (표시 ' + mark + ')' : ''),
          onclick: function () { if (PAPER && S.markMode) cycleMark(i, k); else choose(i, k); }
        }));
      })(k);
      if (PAPER) row.appendChild(el('button', { type: 'button', class: 'pr-chk' + (isShown(i) ? ' on' : ''), title: isShown(i) ? '정답 가리기' : '이 문제 채점', 'aria-label': label + '번 채점', text: '✓', onclick: function () { toggleReveal(i); } }));
      if (PAPER && !it.num) row.appendChild(el('button', { type: 'button', class: 'pr-chk pr-ai-mini', title: 'AI 해설 · 내 실수 분석', 'aria-label': label + '번 AI 해설', text: 'AI', onclick: function () { askItem(i); } }));
      if (PAPER) row.appendChild(el('button', {
        type: 'button', class: 'pr-chk pr-memo-mini' + (noteFilled(it) ? ' has' : memoWanted(it, i) ? ' want' : ''), title: '메모 · 헷갈림 · 틀린 이유', 'data-memo-for': noteKey(it),
        'aria-label': label + '번 메모', 'aria-expanded': memoOpen(it, i) ? 'true' : 'false', text: '📝', onclick: function () { toggleMemo(it, i); }
      }));
      grid.appendChild(row);
      if (PAPER && memoOpen(it, i)) grid.appendChild(memoBox(it, i, 'pr-memo pr-omr-memo'));
    });
    omr.appendChild(grid);
    if (PAPER) { var rv = reviewBox(); if (rv) omr.appendChild(rv); }
    if (!S.graded && S.items.length) {
      omr.appendChild(el('button', { type: 'button', class: 'pr-submit', text: S.mode === 'exam' ? '제출하고 채점하기' : '지금까지 채점하기', onclick: grade }));
    }
    if (S.graded) omr.appendChild(resultPanel());
    var hist = store('sn:' + SUB + ':hist') || [];
    if (hist.length) {
      var h = el('details', { class: 'pr-hist' }, [el('summary', { text: '내 기록 (최근 ' + Math.min(hist.length, 8) + '회)' })]);
      hist.slice(-8).reverse().forEach(function (r) {
        h.appendChild(el('div', { class: 'pr-hrow', text: r.d + ' · ' + r.s + ' · ' + r.sc + ' / ' + r.t + '점' + (r.g ? ' · ' + r.g + (typeof r.g === 'number' ? '등급' : '') : '') }));
      });
      omr.appendChild(h);
    }
    paintHot();
  }

  function setLabel() {
    var p = S.set.split(':');
    if (p[0] === 'exam') return etitle(examOf(p[1])) + (SUB === 'korean' ? ' (' + (S.sel === 'a' ? '화작' : '언매') + ')' : '');
    if (p[0] === 'part') return partName[p[1]] + ' 모아 풀기';
    if (p[0] === 'topic') return topicName[p[1]] + ' 모아 풀기';
    if (p[0] === 'due') return '오늘 다시 풀 오답';
    return '틀린·헷갈린 문제 다시 풀기';
  }

  /* 점수 계산만(기록·전송 없음) — 채점할 때와, 채점해 둔 시험을 다시 열 때 같이 쓴다 */
  function scoreOf() {
    var sc = 0, tot = 0, right = 0, wrongIds = [], bySec = {};
    S.items.forEach(function (it, i) {
      tot += it.pts;
      var ok = isRight(it, S.ans[i]);
      if (ok) { sc += it.pts; right++; }
      var g = it.sec || 'c';
      bySec[g] = bySec[g] || { sc: 0, tot: 0 };
      bySec[g].tot += it.pts; if (ok) bySec[g].sc += it.pts;
      if (!ok) wrongIds.push(PAPER ? it.n : i + 1);   // 못 푼 문제도 오답
    });
    var listen = null;
    if (SUB === 'english') {
      listen = { sc: 0, tot: 0 };
      S.items.forEach(function (it, i) { if (it.n <= 17) { listen.tot += it.pts; if (isRight(it, S.ans[i])) listen.sc += it.pts; } });
    }
    return { sc: sc, tot: tot, right: right, n: S.items.length, wrong: wrongIds, unanswered: S.ans.filter(function (a) { return !a; }).length, used: EXAM_SECONDS - S.left, over: Math.max(0, -S.left), bySec: bySec, listen: listen };
  }
  /* 채점해 둔 시험을 다시 열면 채점된 채로(점수·정답·오답 표시). 점수 기록·계정 전송은 다시 하지 않는다 */
  function restoreGraded(sv) {
    S.graded = true; S.revealed = {};
    if (typeof sv.left === 'number') S.left = sv.left;
    S.usedTimer = !!sv.ut;
    S.sent = S.ans.slice();
    S.result = scoreOf();
  }
  function grade() {
    if (S.graded) return;
    stopTimer();
    S.graded = true; S.revealed = {};
    var tried = S.ans.some(function (a) { return a; });   // 하나도 안 고르고 누른 채점은 못 푼 문제를 오답 기록으로 남기지 않는다(화면엔 오답으로 보인다)
    if (!PAPER) S.items.forEach(function (it, i) { recordWrong(it, S.ans[i], tried); });
    S.result = scoreOf();
    var sc = S.result.sc, tot = S.result.tot;
    var hist = store('sn:' + SUB + ':hist') || [];
    var d = new Date(), gc = gradeCuts();
    var entry = { d: (d.getMonth() + 1) + '/' + d.getDate(), s: setLabel(), sc: sc, t: tot, g: gc ? gradeText(sc, gc) : undefined };
    if (S.regrade && hist.length && hist[hist.length - 1].s === entry.s) hist[hist.length - 1] = entry; else hist.push(entry);   // 고쳐서 다시 채점하면 같은 기록을 바꾼다
    S.regrade = false;
    store('sn:' + SUB + ':hist', hist.slice(-40));
    persist();   // 채점했다는 것도 저장 — 다음에 들어와도 채점된 채로
    sendGraded();
    renderAll();
    if (PAPER && isNarrow()) toggleOmr(true);
    else omr.scrollIntoView && omr.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* 등급: 영어·한국사는 절대평가 점수 기준, 탐구와 2021학년도까지의 국어·수학(가형)은 EBSi 역대 등급컷(원점수, cuts.json).
     cuts 는 1~8등급 최저점 — null 은 그 시험에 없는 등급(위 등급 비율이 커서 비어 있음).
     2022학년도부터 국어·수학은 원점수 컷이 공개되지 않아, 시험 직후 입시업체가 낸 선택과목별 가채점 예상컷(est, 위 몇 등급만)을 쓴다 */
  var ABS_CUT = { english: [90, 80, 70, 60, 50, 40, 30, 20], hist: [40, 35, 30, 25, 20, 15, 10, 5] };
  var CUTS = null, EST = null, HOT = null;   // HOT: 문항 그림 ①~⑤ 자리(hot/<과목>.json)
  var EST_KEY = { hwajak: '화작', eonmae: '언매', calc: '미적분' };
  function estCut() {
    var e = EST && (SUB === 'korean' || SUB === 'math') && S.set.indexOf('exam:') === 0 && EST[S.set.slice(5)];
    return (e && e[SUB === 'math' ? 'calc' : S.sel === 'a' ? 'hwajak' : 'eonmae']) || null;
  }
  function gradeCuts() {
    if (S.set.indexOf('exam:') !== 0) return null;
    if (ABS_CUT[SUB]) return ABS_CUT[SUB];
    var c = CUTS && CUTS[S.set.slice(5)], e = estCut();
    return (c && c[SUB]) || (e && e.c) || null;
  }
  function gradeOf(sc, cuts) {
    for (var i = 0; i < cuts.length; i++) if (cuts[i] != null && sc >= cuts[i]) return i + 1;
    return cuts.length + 1;
  }
  /* 예상컷처럼 위 몇 등급만 있으면 그 아래는 'N등급 이하' */
  function gradeText(sc, cuts) {
    var g = gradeOf(sc, cuts);
    return g + '등급' + (g > cuts.length && cuts.length < 8 ? ' 이하' : '');
  }
  function gradeBox(sc) {
    var cuts = gradeCuts();
    if (!cuts) {
      if (S.set.indexOf('exam:') === 0 && (SUB === 'korean' || SUB === 'math') && +S.set.slice(5, 9) >= 2022)
        return el('p', { class: 'pr-sub', text: '등급: 2022학년도부터 국어·수학은 선택과목에 따라 같은 원점수도 등급이 달라서 원점수 등급컷이 공개되지 않아요(평가원·EBSi는 표준점수 컷만).' });
      return null;
    }
    var g = gradeOf(sc, cuts), up = -1, est = estCut();
    for (var j = g - 2; j >= 0; j--) if (cuts[j] != null) { up = j; break; }
    var ol = el('ol', { class: 'pr-cuts', 'aria-label': '등급별 최저 원점수' });
    cuts.forEach(function (c, i) {
      ol.appendChild(el('li', { class: i + 1 === g ? 'on' : '', title: c == null ? '이 시험은 ' + (i + 1) + '등급이 비어 있어요(위 등급 비율이 커서)' : (i + 1) + '등급 ' + c + '점 이상' },
        [el('i', { text: (i + 1) + '등급' }), el('b', { text: c == null ? '–' : c })]));
    });
    var src = [ABS_CUT[SUB] ? '절대평가 — 정해진 점수 기준' : 'EBSi 역대 등급컷(원점수) 기준 예상 · 실제 등급은 표준점수로 정해져요'];
    if (est && est.c === cuts) {
      var k = SUB === 'math' ? 'calc' : S.sel === 'a' ? 'hwajak' : 'eonmae';
      src = [EST_KEY[k] + ' 가채점 예상컷 — ' + est.by + ', 시험 직후 집계(', el('a', { href: est.url, target: '_blank', rel: 'noopener', text: '출처' }), ') · 공식 컷이 아니고, 실제 등급은 표준점수로 정해져요'];
    }
    return el('div', { class: 'pr-grade' }, [
      el('p', { class: 'pr-grade-main' }, [el('b', { text: gradeText(sc, cuts) }), up >= 0 ? ' · ' + (up + 1) + '등급까지 ' + (cuts[up] - sc) + '점' : '']),
      ol,
      el('p', { class: 'pr-grade-src' }, src)
    ]);
  }

  function resultPanel() {
    var r = S.result;
    var box = el('div', { class: 'pr-result' });
    box.appendChild(el('div', { class: 'pr-score' }, [el('b', { text: r.sc }), ' / ' + r.tot + '점']));
    var gb = gradeBox(r.sc);
    if (gb) box.appendChild(gb);
    box.appendChild(el('p', { class: 'pr-sub', text: r.right + ' / ' + r.n + '문항 정답' + (r.unanswered ? ' · 미풀이 ' + r.unanswered : '') + (S.usedTimer && r.used > 0 ? ' · 소요 ' + fmtTime(r.used) : '') + (r.over > 0 ? ' · 시간 넘김 +' + fmtTime(r.over) : '') }));
    if (PAPER) {
      var ks0 = Object.keys(r.bySec);
      if (ks0.length > 1) box.appendChild(el('p', { class: 'pr-sub', text: ks0.map(function (k) { return SEC_NAME[k] + ' ' + r.bySec[k].sc + '/' + r.bySec[k].tot; }).join(' · ') }));
      if (r.listen) box.appendChild(el('p', { class: 'pr-sub', text: '듣기 ' + r.listen.sc + '/' + r.listen.tot + ' · 독해 ' + (r.sc - r.listen.sc) + '/' + (r.tot - r.listen.tot) }));
    }
    if (r.wrong.length) box.appendChild(el('p', { class: 'pr-sub', text: '오답 번호: ' + r.wrong.join(', ') + (r.unanswered ? ' (못 푼 ' + r.unanswered + '문항 포함)' : '') }));
    var cl = causeLine();
    if (cl) box.appendChild(cl);
    var partStat = {}, topicMiss = {};
    S.items.forEach(function (it, i) {
      var p = it.tag; if (!p) return;
      partStat[p] = partStat[p] || { n: 0, ok: 0 };
      partStat[p].n++; if (isRight(it, S.ans[i])) partStat[p].ok++;
      else if (it.tp) { (topicMiss[p] = topicMiss[p] || {})[it.tp] = (topicMiss[p][it.tp] || 0) + 1; }
    });
    var ks = Object.keys(partStat).sort(function (a, b) { return (partStat[b].n - partStat[b].ok) - (partStat[a].n - partStat[a].ok); });   // 많이 틀린 파트부터
    if (ks.length > 1) {
      var ul = el('ul', { class: 'pr-parts' });
      ks.forEach(function (p) {
        var s = partStat[p], miss = s.n - s.ok;
        ul.appendChild(el('li', { class: miss ? 'miss' : '' }, [el('span', {}, [el('a', { href: partHref[p] || '#', text: partName[p] || p }), ' ' + s.ok + '/' + s.n + (miss ? ' · 틀림 ' + miss : '')]),
          partName[p] && !PAPER ? el('button', { type: 'button', class: 'pr-part-go', title: (partName[p] || p) + ' 문제를 여러 시험에서 모아 풀기', text: '🔁 모아 풀기', onclick: function () { goPart(p); } }) : null]));
        if (topicMiss[p] && !PAPER) ul.appendChild(el('li', { class: 'pr-parts-topics' }, [el('span', {}, Object.keys(topicMiss[p]).map(function (t) {
          return el('button', { type: 'button', class: 'pr-part-go', title: topicName[t] + ' 문제만 여러 시험에서 모아 풀기', text: '🔁 ' + topicName[t] + ' · 틀림 ' + topicMiss[p][t], onclick: function () { goTopic(t); } });
        }))]));
      });
      box.appendChild(el('p', { class: 'pr-sub', text: '파트별 정답 — 🔁 모아 풀기는 여러 시험에서 같은 파트 문제를 뽑아 풀어요' }));
      box.appendChild(ul);
    }
    var acts = el('div', { class: 'pr-acts' });
    acts.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '✏️ 답 이어서 고르기', title: '채점을 풀고 답을 더 고르거나 고친 뒤 다시 채점해요', onclick: reopen }));
    var wl = wrongIdxs(), wn = wl.length, wk = wl.filter(function (i) { return !S.ans[i]; }).length;
    if (wn) acts.appendChild(el('button', { type: 'button', class: 'pr-btn pr-ai-cta', text: '🤖 틀린 문제 ' + wn + '개' + (wk ? '(못 푼 ' + wk + '개 포함)' : '') + ' 한꺼번에 AI 해설', onclick: askWrongAll }));
    acts.appendChild(el('button', { type: 'button', class: 'pr-btn pr-ai-cta', text: '🤖 이번 ' + (S.set.indexOf('exam:') === 0 ? '시험' : '세트') + ' AI 분석 (문제점·강점)', onclick: askExam }));
    acts.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '다시 풀기', onclick: function () { if (S.set.indexOf('exam:') === 0) psReset(S.set); redoSet = true; startSet(S.set); } }));
    if ((r.wrong.length || unsureCount()) && !PAPER) acts.appendChild(el('button', { type: 'button', class: 'pr-btn', text: '틀린·헷갈린 문제 모아 풀기', onclick: function () { startSet('wrong:all'); } }));
    box.appendChild(acts);
    return box;
  }

  /* ───────── boot ───────── */
  var examsP = fetch(cfg.base + 'exams.json').then(function (r) { return r.json(); });
  var meP = window.SnAuth ? SnAuth.me() : Promise.resolve({ id: null });
  var cutsP = ABS_CUT[SUB] ? null : fetch(cfg.base + 'cuts.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  var hotP = PAPER ? null : fetch(cfg.base + 'hot/' + SUB + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  Promise.all([examsP, meP, cutsP, hotP]).then(function (pair) {
    EXAMS = pair[0].exams;
    meUser = pair[1] && pair[1].id ? pair[1] : { id: null };
    CUTS = pair[2] && pair[2].cuts;
    EST = pair[2] && pair[2].est;
    HOT = pair[3];
    var ex = examList();
    buildShell();
    refreshAuth();
    var savedMode = store('sn:' + SUB + ':mode');
    S.mode = savedMode === 'practice' ? 'practice' : 'exam';
    var sv = store('sn:' + SUB + ':sel');
    if (sv === 'a' || sv === 'b') S.sel = sv;
    if (selSel) selSel.value = S.sel;
    var h = decodeURIComponent((location.hash || '').slice(1));
    var wantDue = h === 'due' || h.indexOf('due:') === 0;
    var firstKey = (ex.filter(isCsat)[0] || ex[0]).key;   // 가장 최근 수능부터
    var start = /^(exam|part|topic|wrong):/.test(h) || (wantDue && !PAPER) ? (h === 'due' ? 'due:today' : h) : 'exam:' + firstKey;
    if (start.indexOf('exam:') === 0 && !examOf(start.slice(5))) start = 'exam:' + firstKey;
    if (start.indexOf('part:') === 0 && !partName[start.slice(5)]) start = 'exam:' + firstKey;
    if (start.indexOf('topic:') === 0 && !topicName[start.slice(6)]) start = 'exam:' + firstKey;
    loadDone();
    var begin = function () { startSet(start); window.scrollTo(0, 0); };
    if (meUser.id && start.indexOf('wrong:') === 0) migrateWrong().then(begin);
    else { begin(); if (meUser.id) migrateWrong(); }
    pullNotes();
    aiSync();
    psSync();
    doneSync();
    loadDue(PAPER && wantDue);
    if (meUser.id && window.SnAuth && SnAuth.aiKey) SnAuth.aiKey().then(function (j) { acctKey = j; }).catch(function () {});
    if (PAPER && meUser.id && window.SnAuth) SnAuth.wrong(SUB).then(function (rows) { S.wrongRows = rows; renderOmr(); }).catch(function () {});
  }).catch(function () {
    root.textContent = '문제 데이터를 불러오지 못했습니다. 로컬에서는 python3 -m http.server로 public/learn을 열어 주세요.';
  });
})();
