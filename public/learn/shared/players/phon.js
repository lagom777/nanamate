/* ============================================================
   nanamate · 음운 변동 재생기 장면 — shared/player.js 가 <div data-player="phon"> 자리에 띄운다.
   단어를 자모 칸(음운)으로 쪼갠 뒤 ① 환경 → ② 변동 → ③ 결과를 차례로 보여 준다.
   이름은 음운 개수로: 교체 그대로 · 탈락 −1 · 첨가 +1 · 축약 둘이 하나.
   장면 정의와 계산(plan·compose)은 DOM 없이 window.NM_PLAYERS.phon 에 노출한다(테스트용).
   ============================================================ */
(function () {
  'use strict';

  var CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  var JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  var JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  var PAIR = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
  function isV(ch) { return JUNG.indexOf(ch) >= 0; }
  /* 자모 묶음 → 음절 한 글자. 모음으로 시작하면 소리 없는 ㅇ을 앞에 둔다(첫소리 ㅇ은 음운이 아니라 칸이 없다) */
  function compose(g) {
    var i = 0, cho = 'ㅇ';
    if (!isV(g[0])) { cho = g[0]; i = 1; }
    var fin = g.slice(i + 1).join('');
    if (fin.length === 2) fin = PAIR[fin] || fin;
    var c = CHO.indexOf(cho), j = JUNG.indexOf(g[i]), k = JONG.indexOf(fin);
    if (c < 0 || j < 0 || k < 0) return g.join('');
    return String.fromCharCode(0xAC00 + (c * 21 + j) * 28 + k);
  }
  /* 'ㄱㅜㄱ|ㅁㅜㄹ' → { seq: 자모들, groups: 음절마다 자모 수 } */
  function parse(w) {
    var parts = w.split('|');
    return { seq: Array.from(parts.join('')), groups: parts.map(function (p) { return Array.from(p).length; }) };
  }
  function syllables(seq, groups) {
    var out = [], at = 0;
    groups.forEach(function (n) { out.push(compose(seq.slice(at, at + n))); at += n; });
    return out.join('');
  }

  var KINDS = [
    { k: '교체', n: '개수 그대로', a: ['ㄱ', 'ㅁ'], b: ['ㅇ', 'ㅁ'], hi: [0], c: '2 → 2' },
    { k: '탈락', n: '하나가 빠짐', a: ['ㄹ', 'ㄱ'], b: ['ㄱ'], hi: [], c: '2 → 1' },
    { k: '첨가', n: '하나가 덧남', a: ['ㅁ', 'ㅣ'], b: ['ㅁ', 'ㄴ', 'ㅣ'], hi: [1], c: '2 → 3' },
    { k: '축약', n: '둘이 합쳐 하나', a: ['ㅎ', 'ㄱ'], b: ['ㅋ'], hi: [0], c: '2 → 1' }
  ];
  var SUB = { '교체': '교체 · 개수 그대로', '탈락': '탈락 · 하나 빠짐 (−1)', '첨가': '첨가 · 하나 덧남 (+1)', '축약': '축약 · 둘이 합쳐 하나 (−1)' };

  /* steps[]: tgt = 바뀔 칸, env = 조건이 되는 칸(둘 다 그 단계 직전 칸 번호), cond = 환경 한 줄,
     ops = [['swap', i, 새 자모] | ['drop', i] | ['add', i(이 앞에), 자모] | ['merge', i(i와 i+1), 새 자모]],
     to = 단계 뒤 음절 묶음(개수가 바뀌거나 받침이 넘어갈 때), what = 변동 한 줄, kind = 교체·탈락·첨가·축약(null = 변동 없음) */
  var SCENES = [
    { id: 'intro', label: '시작', title: '음운 변동', sub: '환경 → 변동 → 결과', intro: true, dur: 10,
      text: '단어를 소리 하나하나(음운)로 쪼갠 뒤, 어디서(환경) 무엇이(변동) 어떻게 되는지(결과)만 봅니다.',
      memo: '이름은 개수로 — 교체 그대로 · 탈락 −1 · 첨가 +1 · 축약 둘이 하나' },
    { id: 'nasal', label: '비음화', title: '비음화', word: 'ㄱㅜㄱ|ㅁㅜㄹ', say: '궁물',
      steps: [{ kind: '교체', tgt: [2], env: [3], cond: '받침 ㄱ + 비음 ㅁ', ops: [['swap', 2, 'ㅇ']], what: 'ㄱ → ㅇ' }],
      text: '비음 ㅁ 앞에서 ㄱ이 비음 ㅇ으로 바뀝니다. 소리 개수는 6 그대로라서 교체.',
      memo: 'ㄱ·ㄷ·ㅂ 이 ㄴ·ㅁ 앞에서 → ㅇ·ㄴ·ㅁ : 밥물[밤물], 닫는[단는]' },
    { id: 'liquid', label: '유음화', title: '유음화', word: 'ㅅㅣㄴ|ㄹㅏ', say: '실라',
      steps: [{ kind: '교체', tgt: [2], env: [3], cond: 'ㄴ + ㄹ', ops: [['swap', 2, 'ㄹ']], what: 'ㄴ → ㄹ' }],
      text: 'ㄹ 옆에 붙은 ㄴ이 ㄹ로 바뀝니다. 개수 그대로 → 교체.',
      memo: 'ㄹ 앞이든 뒤든: 난로[날로], 달님[달림]' },
    { id: 'palatal', label: '구개음화', title: '구개음화', word: 'ㄱㅏㅌ|ㅣ', say: '가치',
      steps: [{ kind: '교체', tgt: [2], env: [3], cond: '받침 ㅌ + 뒤에 붙은 ㅣ', ops: [['swap', 2, 'ㅊ']], to: 'ㄱㅏ|ㅊㅣ', what: 'ㅌ → ㅊ' }],
      text: '받침 ㅌ이 뒤에 붙은 ‘-이’를 만나 ㅊ이 됩니다. 개수 그대로 → 교체.',
      memo: '한 낱말 안의 ‘티·디’는 그대로: 티끌, 견디다' },
    { id: 'tense', label: '된소리되기', title: '된소리되기', word: 'ㄱㅜㄱ|ㅂㅏㅂ', say: '국빱',
      steps: [{ kind: '교체', tgt: [3], env: [2], cond: '받침 ㄱ 뒤의 ㅂ', ops: [['swap', 3, 'ㅃ']], what: 'ㅂ → ㅃ' }],
      text: '받침 ㄱ 뒤에서 예사소리 ㅂ이 된소리 ㅃ이 됩니다. 개수 그대로 → 교체.',
      memo: '정해진 자리에서만: 받침 ㄱ·ㄷ·ㅂ 뒤, ‘-ㄹ’ 뒤(할 것[할껏])' },
    { id: 'cluster', label: '자음군 단순화', title: '자음군 단순화', word: 'ㄷㅏㄹㄱ', say: '닥',
      steps: [{ kind: '탈락', tgt: [2], env: [3], cond: '겹받침 ㄺ, 뒤에 모음 없음', ops: [['drop', 2]], to: 'ㄷㅏㄱ', what: 'ㄹ이 빠짐' }],
      text: '받침 자리에서는 소리가 하나만 납니다. ㄺ에서 ㄹ이 빠져 [닥]. 개수 −1 → 탈락.',
      memo: '뒤에 모음이 오면 둘 다 산다: 닭이[달기]' },
    { id: 'hdrop', label: 'ㅎ 탈락', title: 'ㅎ 탈락', word: 'ㅈㅗㅎ|ㅏ', say: '조아',
      steps: [{ kind: '탈락', tgt: [2], env: [3], cond: '받침 ㅎ + 모음', ops: [['drop', 2]], to: 'ㅈㅗ|ㅏ', what: 'ㅎ이 빠짐' }],
      text: '모음 앞에서 받침 ㅎ이 소리 나지 않습니다. 개수 −1 → 탈락.',
      memo: 'ㄱ·ㄷ·ㅈ 앞이면 빠지지 않고 합쳐진다 → 축약(좋고[조코])' },
    { id: 'nadd', label: 'ㄴ 첨가', title: 'ㄴ 첨가', word: 'ㅅㅗㅁ|ㅣ|ㅂㅜㄹ', say: '솜니불',
      steps: [{ kind: '첨가', tgt: [], env: [2, 3], cond: '두 말이 합쳐짐: 자음 끝 + ㅣ', ops: [['add', 3, 'ㄴ']], to: 'ㅅㅗㅁ|ㄴㅣ|ㅂㅜㄹ', what: 'ㄴ이 덧남' }],
      text: '솜 + 이불처럼 앞말이 자음으로 끝나고 뒷말이 ‘이’로 시작하면 ㄴ이 덧납니다. 개수 +1 → 첨가.',
      memo: '담요[담뇨], 한여름[한녀름] — 한자어 ‘음악’은 [으막]' },
    { id: 'aspir', label: '거센소리되기', title: '거센소리되기', word: 'ㅈㅗㅎ|ㄱㅗ', say: '조코',
      steps: [{ kind: '축약', tgt: [2, 3], env: [], cond: 'ㅎ + ㄱ', ops: [['merge', 2, 'ㅋ']], to: 'ㅈㅗ|ㅋㅗ', what: 'ㅎ + ㄱ → ㅋ' }],
      text: 'ㅎ과 ㄱ이 합쳐 ㅋ 하나가 됩니다. 두 소리의 성질이 남아 있으니 탈락이 아니라 축약.',
      memo: '많고[만코] — 된소리 [만꼬]가 아니다' },
    { id: 'multi', label: '여러 번', title: '꽃잎 → [꼰닙]', sub: '여러 변동 · 순서대로', word: 'ㄲㅗㅊ|ㅣㅍ', say: '꼰닙',
      steps: [
        { kind: '교체', tgt: [2, 4], env: [], cond: '받침 ㅊ·ㅍ (뒤는 새 낱말 ‘잎’)', ops: [['swap', 2, 'ㄷ'], ['swap', 4, 'ㅂ']], what: '받침 정리 ㅊ→ㄷ, ㅍ→ㅂ' },
        { kind: '첨가', tgt: [], env: [2, 3], cond: '꽃 + 잎: 자음 끝 + ㅣ', ops: [['add', 3, 'ㄴ']], to: 'ㄲㅗㄷ|ㄴㅣㅂ', what: 'ㄴ 첨가' },
        { kind: '교체', tgt: [2], env: [3], cond: 'ㄷ + 비음 ㄴ', ops: [['swap', 2, 'ㄴ']], what: '비음화 ㄷ→ㄴ' }
      ],
      text: '받침 정리 → ㄴ 첨가 → 비음화 순서로. 바뀐 자리마다 이름을 붙이면 교체 3번 + 첨가 1번.',
      memo: '한 번에 바뀐 것을 두 번으로 쪼개 세지 않는다' },
    { id: 'counter', label: '반례', title: '국이 → [구기]', sub: '반례 · 조건이 없으면 변동도 없다', word: 'ㄱㅜㄱ|ㅣ', say: '구기',
      steps: [{ kind: null, tgt: [2], env: [3], cond: '받침 ㄱ + 모음 (비음 없음)', ops: [], to: 'ㄱㅜ|ㄱㅣ', what: '없음 — 받침이 다음 칸으로 넘어갈 뿐' }],
      text: '뒤에 비음이 없으면 비음화도 없습니다. 받침이 다음 음절로 넘어갈 뿐(연음), 소리는 그대로.',
      memo: '선지마다 ‘환경이 있나’부터 확인' }
  ];

  /* ───────── 칸 배치(단위: 재생기 폭의 %, cqw) ───────── */
  var TW = 6.2, GAP = 0.8, SGAP = 3.2;
  function layout(groups) {
    var n = groups.reduce(function (a, b) { return a + b; }, 0);
    var W = n * TW + (n - 1) * GAP + (groups.length - 1) * (SGAP - GAP);
    var x = [], gi = [], spans = [], at = (100 - W) / 2;
    groups.forEach(function (g, k) {
      var s = at;
      for (var j = 0; j < g; j++) { x.push(at); gi.push(k); at += TW + GAP; }
      at += SGAP - GAP;
      spans.push({ x: s, w: (at - (SGAP - GAP) - GAP) - s });
    });
    return { x: x, gi: gi, spans: spans };
  }

  /* 장면 → 박자(beat) 목록. 박자마다 칸 위치·모양·사슬 문구를 모두 계산해 둔다(그리기는 그대로 옮기기만) */
  var circled = '①②③④⑤';
  function plan(sc) {
    if (sc.intro) {
      sc.beats = [0, 0.7, 1.9, 3.1, 4.3].map(function (t, i) { return { t: t, k: 'intro', show: i }; });
      return sc;
    }
    var p = parse(sc.word);
    var tiles = p.seq.map(function (ch, i) { return { id: i, ch: ch }; });
    var groups = p.groups, nid = tiles.length, n0 = tiles.length;
    var chg = {}, gone = [], chain = [], kinds = [], last = {}, born = {};
    var single = sc.steps.length === 1, beats = [], t = 0;
    function snap(k, extra) {
      var L = layout(groups), pos = {};
      tiles.forEach(function (tl, i) {
        var sp = L.spans[L.gi[i]];
        pos[tl.id] = extra.split ? { x: L.x[i], y: 0, s: 1, o: 1, r: 0 } : { x: sp.x + sp.w / 2 - TW / 2, y: 0, s: 0.55, o: 0, r: 0 };
        last[tl.id] = L.x[i];
      });
      gone.forEach(function (g) {
        pos[g.id] = g.how === 'drop' ? { x: g.x, y: 7, s: 0.8, o: 0, r: -16 } : { x: last[g.into], y: 0, s: 0.9, o: 0, r: 0 };
      });
      beats.push({
        t: t, k: k, split: !!extra.split, env: extra.env || [], tgt: extra.tgt || [],
        tiles: tiles.map(function (x) { return { id: x.id, ch: x.ch, chg: !!chg[x.id] }; }),
        syl: groups.map(function (g, gi) { var sp = L.spans[gi]; return { x: sp.x + sp.w / 2, w: sp.w, bx: sp.x }; }),
        sylText: (function () { var out = [], at = 0; groups.forEach(function (g) { out.push(compose(tiles.slice(at, at + g).map(function (x) { return x.ch; }))); at += g; }); return out; })(),
        pos: pos, chain: chain.slice(), kinds: kinds.slice(), res: k === 'res'
      });
    }
    snap('word', { split: false });
    t = 0.8; snap('split', { split: true });
    sc.steps.forEach(function (st, si) {
      t += 1.3;
      var ids = function (arr) { return arr.map(function (i) { return tiles[i].id; }); };
      if (single) chain.push({ k: 'env', h: '① 환경', v: st.cond });
      snap('env', { split: true, env: ids(st.env), tgt: ids(st.tgt) });
      t += 1.6;
      st.ops.slice().sort(function (a, b) { return b[1] - a[1]; }).forEach(function (op) {
        var i = op[1];
        if (op[0] === 'swap') { tiles[i] = { id: tiles[i].id, ch: op[2] }; chg[tiles[i].id] = 1; }
        if (op[0] === 'drop') { var d = tiles.splice(i, 1)[0]; gone.push({ id: d.id, how: 'drop', x: last[d.id] }); }
        if (op[0] === 'add') { var nt = { id: nid++, ch: op[2] }; tiles.splice(i, 0, nt); chg[nt.id] = 1; born[nt.id] = 1; }
        if (op[0] === 'merge') { var a = tiles[i], b = tiles[i + 1]; tiles.splice(i, 2, { id: a.id, ch: op[2] }); chg[a.id] = 1; gone.push({ id: b.id, how: 'merge', into: a.id }); }
      });
      if (st.to) groups = parse(st.to).groups;
      if (st.kind && kinds.indexOf(st.kind) < 0) kinds.push(st.kind);
      chain.push(single ? { k: 'op', h: '② 변동', v: st.what, kind: st.kind } : { k: 'op', h: circled[si] + ' ' + (st.kind || ''), v: st.what, kind: st.kind });
      snap('op', { split: true });
    });
    t += 1.4;
    chain.push({ k: 'res', h: single ? '③ 결과' : '결과', v: '[' + sc.say + ']', n: '음운 ' + n0 + ' → ' + tiles.length });
    snap('res', { split: true });
    sc.dur = Math.round((t + 3.6) * 10) / 10;
    sc.beats = beats;
    sc.ids = nid;
    sc.born = born;
    sc.final = { seq: tiles.map(function (x) { return x.ch; }), groups: groups };
    if (!sc.sub) sc.sub = sc.steps[0].kind ? SUB[sc.steps[0].kind] : '변동 없음';
    return sc;
  }
  SCENES.forEach(plan);

  /* ───────── 그리기 ───────── */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function miniRow(arr, hi, cls) {
    var r = el('span', 'ph-mini' + (cls ? ' ' + cls : ''));
    arr.forEach(function (ch, i) { r.appendChild(el('i', (isV(ch) ? 'is-v' : '') + (hi.indexOf(i) >= 0 ? ' is-chg' : ''), ch)); });
    return r;
  }

  function setup(box) {
    var layer = el('div', 'ph');
    var legend = el('div', 'ph-legend');
    var badges = KINDS.map(function (K) {
      var b = el('span', 'ph-badge');
      b.appendChild(el('b', null, K.k));
      b.appendChild(el('span', null, K.c));
      legend.appendChild(b);
      return b;
    });
    var cards = el('div', 'ph-cards');
    var cardEls = KINDS.map(function (K) {
      var c = el('div', 'ph-card');
      c.appendChild(el('b', 'ph-card-k', K.k));
      var m = el('span', 'ph-card-m');
      m.appendChild(miniRow(K.a, K.k === '탈락' ? [0] : K.k === '축약' ? [0, 1] : [], K.k === '탈락' ? 'is-drop' : ''));
      m.appendChild(el('span', 'ph-card-ar', '→'));
      m.appendChild(miniRow(K.b, K.hi));
      c.appendChild(m);
      c.appendChild(el('span', 'ph-card-n', K.n + ' · ' + K.c));
      cards.appendChild(c);
      return c;
    });
    var syls = el('div', 'ph-syls');
    var row = el('div', 'ph-row');
    var bars = el('div', 'ph-bars');
    var chain = el('div', 'ph-chain');
    [legend, cards, syls, row, bars, chain].forEach(function (n) { layer.appendChild(n); });
    box.appendChild(layer);

    var cur = { idx: -1, beat: -1 }, tileEls = [], sylEls = [], barEls = [], timers = [];

    function build(sc) {
      timers.forEach(clearTimeout);
      timers = [];
      row.textContent = '';
      syls.textContent = '';
      bars.textContent = '';
      tileEls = [];
      sylEls = [];
      barEls = [];
      layer.classList.toggle('is-intro', !!sc.intro);
      if (sc.intro) return;
      for (var id = 0; id < sc.ids; id++) {
        var e = el('span', 'ph-tile');
        e.appendChild(el('i'));
        row.appendChild(e);
        tileEls.push(e);
      }
      var maxG = 0;
      sc.beats.forEach(function (B) { maxG = Math.max(maxG, B.syl.length); });
      for (var g = 0; g < maxG; g++) {
        sylEls.push(syls.appendChild(el('span', 'ph-syl')));
        barEls.push(bars.appendChild(el('span', 'ph-bar')));
      }
    }

    function setGlyph(e, ch, animate) {
      var i = e.firstChild;
      if (i.textContent === ch) return;
      if (!animate || !i.textContent) { i.textContent = ch; return; }
      e.classList.remove('is-flip');
      void e.offsetWidth;
      e.classList.add('is-flip');
      timers.push(setTimeout(function () { i.textContent = ch; }, 220));
    }

    function apply(sc, bi, jump) {
      var B = sc.beats[bi];
      if (jump) box.classList.add('pl-cut');
      if (sc.intro) {
        cardEls.forEach(function (c, k) { c.classList.toggle('is-on', k < B.show); });
      } else {
        var lit = {}, env = {}, tgt = {};
        B.env.forEach(function (id) { env[id] = 1; });
        B.tgt.forEach(function (id) { tgt[id] = 1; });
        B.tiles.forEach(function (tl) { lit[tl.id] = tl; });
        tileEls.forEach(function (e, id) {
          var p = B.pos[id];
          var tl = lit[id];
          if (!p) {
            /* 아직 덧나지 않은 칸: 나중에 생길 자리에서 작게 숨어 있다가 커지며 나타난다 */
            var later = null;
            for (var k = bi + 1; k < sc.beats.length && !later; k++) later = sc.beats[k].pos[id];
            p = later ? { x: later.x, y: 0, s: 0.2, o: 0, r: 0 } : { x: 50, y: 0, s: 0.2, o: 0, r: 0 };
          }
          e.style.transform = 'translate(' + p.x.toFixed(2) + 'cqw,' + p.y + 'cqw) rotate(' + p.r + 'deg) scale(' + p.s + ')';
          e.style.opacity = p.o;
          e.style.transitionDelay = (!jump && B.k === 'split' && tl) ? (B.tiles.indexOf(tl) * 45) + 'ms' : '0ms';
          if (tl) setGlyph(e, tl.ch, !jump);
          e.classList.toggle('is-v', !!tl && isV(tl.ch));
          e.classList.toggle('is-env', !!env[id]);
          e.classList.toggle('is-tgt', !!tgt[id]);
          e.classList.toggle('is-chg', !!tl && tl.chg);
          e.classList.toggle('is-gone', !tl && !!B.pos[id]);
        });
        layer.classList.toggle('is-split', B.split);
        layer.classList.toggle('is-res', B.res);
        sylEls.forEach(function (s, g) {
          var S = B.syl[g];
          s.style.opacity = S ? 1 : 0;
          if (!S) return;
          if (s.textContent !== B.sylText[g]) {
            s.textContent = B.sylText[g];
            if (!jump && B.k !== 'word' && B.k !== 'split') {
              s.classList.remove('is-bump');
              void s.offsetWidth;
              s.classList.add('is-bump');
            }
          }
          s.style.transform = 'translateX(calc(' + S.x.toFixed(2) + 'cqw - 50%))';
          var b = barEls[g];
          b.style.opacity = B.split && S ? 1 : 0;
          b.style.transform = 'translateX(' + S.bx.toFixed(2) + 'cqw)';
          b.style.width = S.w.toFixed(2) + 'cqw';
        });
        barEls.forEach(function (b, g) { if (!B.syl[g]) b.style.opacity = 0; });
        var prevN = jump ? 0 : (cur.beat >= 0 ? sc.beats[cur.beat].chain.length : 0);
        chain.innerHTML = '';
        B.chain.forEach(function (c, k) {
          if (k) chain.appendChild(el('span', 'ph-arrow' + (k >= prevN ? ' is-new' : ''), '→'));
          var s = el('span', 'ph-seg ph-seg-' + c.k + (k >= prevN ? ' is-new' : '') + (c.k === 'op' && !c.kind ? ' is-none' : ''));
          s.appendChild(el('i', null, c.h));
          s.appendChild(el('b', null, c.v));
          if (c.n) s.appendChild(el('span', null, c.n));
          chain.appendChild(s);
        });
        badges.forEach(function (bd, k) { bd.classList.toggle('is-on', B.kinds.indexOf(KINDS[k].k) >= 0); });
      }
      if (jump) {
        void box.offsetWidth;
        requestAnimationFrame(function () { box.classList.remove('pl-cut'); });
      }
    }

    return {
      show: function (sc, idx, lt, jump) {
        if (idx !== cur.idx) { build(sc); cur.idx = idx; cur.beat = -1; jump = true; }
        var bi = 0;
        for (var k = 0; k < sc.beats.length; k++) if (lt >= sc.beats[k].t) bi = k;
        if (jump || bi !== cur.beat) {
          apply(sc, bi, jump || bi < cur.beat);
          cur.beat = bi;
        }
      }
    };
  }

  var root = typeof window !== 'undefined' ? window : {};
  (root.NM_PLAYERS = root.NM_PLAYERS || {}).phon = {
    title: '음운 변동 재생기', sub: '환경 → 변동 → 결과', tag: '음운 변동',
    scenes: SCENES, setup: setup,
    lib: { compose: compose, parse: parse, syllables: syllables, plan: plan, layout: layout, KINDS: KINDS }
  };
})();
