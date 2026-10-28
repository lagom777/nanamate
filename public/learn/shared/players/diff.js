/* ============================================================
   nanamate · 선지 대조 재생기 장면 — shared/player.js 가 <div data-player="diff"> 자리에 띄운다.
   선지의 핵심어로 지문에서 같은 말을 하는 문장을 찾고(훑기), 둘을 나란히 놓아 바뀐 곳만 칠한 뒤 ○/✕ 를 찍는다.
   문장 표기: {바뀐 말} · {c:원인} {e:결과}. 장면 정의는 DOM 없이 window.NM_PLAYERS.diff 에 노출한다(테스트용).
   ============================================================ */
(function () {
  'use strict';

  var SCENES = [
    { id: 'intro', label: '시작', title: '선지 = 지문을 바꿔 쓴 문장', sub: '찾기 → 나란히 → 바뀐 곳', intro: true, dur: 9,
      steps: ['선지에서 핵심어 하나', '지문에서 같은 말 하는 문장 찾기', '둘을 나란히 놓기', '바뀐 곳: 뜻이 바뀌면 ✕'],
      text: '선지를 읽으면 먼저 지문에서 같은 말을 하는 문장을 찾습니다. 그다음 둘을 나란히 놓고 바뀐 곳만 봅니다.',
      memo: '바뀐 곳이 뜻을 바꾸면 ✕, 말만 바꾸고 뜻이 같으면 ○' },
    { id: 'dir', label: '방향', title: '방향 바꾸기', sub: '늘다 ↔ 줄다',
      pass: ['중앙은행은 물가가 오르면 금리를 올린다.', '금리가 오르면 기업의 투자는 {줄어든다}.', '투자가 줄면 경기도 식는다.'], hit: 1,
      opt: '금리가 오르면 기업의 투자는 {늘어난다}.', key: '투자', ok: false,
      why: '줄어든다 → 늘어난다 : 방향이 반대',
      text: '핵심어 ‘투자’로 둘째 문장을 찾았습니다. 앞은 같고 끝말만 반대 — 그래서 ✕.',
      memo: '늘다·줄다, 높다·낮다, 빠르다·느리다 — 방향 말부터 확인' },
    { id: 'who', label: '주어', title: '주어 바꾸기', sub: '누가 했나',
      pass: ['{칸트}는 도덕의 근거를 이성에서 찾았다.', '흄은 도덕의 근거를 감정에서 찾았다.'], hit: 0,
      opt: '{흄}은 도덕의 근거를 이성에서 찾았다.', key: '이성', ok: false,
      why: '칸트 → 흄 : 말한 사람이 바뀜',
      text: '‘이성에서 찾았다’는 첫 문장인데, 그 주인공은 흄이 아니라 칸트 — ✕.',
      memo: '두 사람이 나오면 선지마다 ‘누가’에 동그라미' },
    { id: 'deg', label: '정도', title: '정도 부풀리기', sub: '일부 ↔ 모두',
      pass: ['새 치료제는 {일부} 환자에게 효과가 있었다.', '부작용은 드물게 나타났다.'], hit: 0,
      opt: '새 치료제는 {모든} 환자에게 효과가 있었다.', key: '효과', ok: false,
      why: '일부 → 모든 : 범위를 부풀림',
      text: '같은 문장인데 ‘일부’가 ‘모든’으로 — 지문보다 세게 말하면 ✕.',
      memo: '항상·반드시·모든·유일한 — 센 말이 나오면 지문과 대 보기' },
    { id: 'cause', label: '인과', title: '원인 ↔ 결과 뒤집기', sub: '무엇 때문에 무엇이',
      pass: ['{c:기온이 오르자} {e:빙하가 녹았다}.', '빙하가 녹자 바다의 높이가 올라갔다.'], hit: 0,
      opt: '{e:빙하가 녹아서} {c:기온이 올랐다}.', key: '빙하', ok: false,
      why: '원인(기온) ↔ 결과(빙하) 자리가 바뀜',
      text: '지문은 기온이 원인, 빙하가 결과. 선지는 거꾸로 — ✕.',
      memo: '‘~해서·~때문에·~자’ 앞뒤를 화살표로 바꿔 보기' },
    { id: 'same', label: '같은 뜻', title: '말만 바꾸기', sub: '뜻이 같으면 ○',
      pass: ['새 제도는 행정 비용을 {낮추었다}.', '대신 처리 기간은 조금 늘었다.'], hit: 0,
      opt: '새 제도 덕분에 행정 비용이 {줄었다}.', key: '비용', ok: true,
      why: '낮추었다 = 줄었다 : 말은 달라도 뜻이 같음',
      text: '단어가 바뀌었다고 다 틀린 건 아닙니다. ‘낮추다’와 ‘줄다’는 같은 뜻 — ○.',
      memo: '바뀐 곳을 찾은 뒤 ‘뜻도 바뀌었나’를 한 번 더 묻기' },
    { id: 'extra', label: '근거 없음', title: '없는 말 보태기', sub: '상식 ≠ 근거',
      pass: ['도서관 이용자가 작년보다 늘었다.', '특히 주말 이용자가 많았다.'], hit: 0,
      opt: '도서관 이용자가 늘어 {주민의 독서량도 많아졌다}.', key: '이용자', ok: false,
      why: '독서량 이야기는 지문 어디에도 없음',
      text: '앞부분은 첫 문장과 같지만 ‘독서량’은 지문에 없습니다. 그럴듯해도 근거가 없으면 ✕.',
      memo: '선지 조각마다 지문에 근거 문장이 있나 확인' }
  ];

  /* '{c:기온이 오르자} {e:빙하가 녹았다}.' → [{ t, m: 바뀐 말?, r: 'c'|'e'|'' }] */
  function parse(s) {
    var out = [], re = /\{(?:([ce]):)?([^}]*)\}/g, at = 0, m;
    while ((m = re.exec(s))) {
      if (m.index > at) out.push({ t: s.slice(at, m.index), m: false, r: '' });
      out.push({ t: m[2], m: true, r: m[1] || '' });
      at = re.lastIndex;
    }
    if (at < s.length) out.push({ t: s.slice(at), m: false, r: '' });
    return out;
  }
  function plain(s) { return parse(s).map(function (x) { return x.t; }).join(''); }

  /* 박자: 보이기 → 지문 문장 하나씩 훑기(핵심어가 든 문장에서 멈춤) → 바뀐 곳 칠하기 → 판정 */
  function plan(sc) {
    if (sc.intro) {
      sc.beats = [0, 0.6, 1.8, 3.0, 4.2].map(function (t, i) { return { t: t, k: 'intro', show: i }; });
      return sc;
    }
    var b = [{ t: 0, k: 'show' }], t = 1.0;
    for (var i = 0; i <= sc.hit; i++) { b.push({ t: t, k: 'scan', i: i }); t += 0.6; }
    t += 0.5;
    b.push({ t: t, k: 'diff' });
    t += 1.3;
    b.push({ t: t, k: 'why' });
    sc.beats = b;
    sc.dur = Math.round((t + 3.8) * 10) / 10;
    return sc;
  }
  SCENES.forEach(plan);

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  /* 문장 하나를 조각 span 으로. key 가 든 일반 조각은 핵심어만 따로 감싼다 */
  function sentence(s, key) {
    var w = el('span', 'df-s');
    parse(s).forEach(function (x) {
      if (x.m) {
        var m = el('span', 'df-m' + (x.r ? ' is-' + x.r : ''), x.t);
        w.appendChild(m);
        return;
      }
      var parts = key ? x.t.split(key) : [x.t];
      parts.forEach(function (p, k) {
        if (k) w.appendChild(el('span', 'df-p df-key', key));
        if (p) w.appendChild(el('span', 'df-p', p));
      });
    });
    return w;
  }

  function setup(box) {
    var layer = el('div', 'df');
    var steps = el('div', 'df-steps');
    var cards = el('div', 'df-cards');
    var pass = el('div', 'df-card df-pass');
    var opt = el('div', 'df-card df-opt');
    var why = el('div', 'df-why');
    cards.appendChild(pass);
    cards.appendChild(opt);
    cards.appendChild(why);
    layer.appendChild(steps);
    layer.appendChild(cards);
    box.appendChild(layer);
    var cur = { idx: -1, beat: -1 }, sEls = [], stepEls = [];

    function build(sc) {
      layer.classList.toggle('is-intro', !!sc.intro);
      layer.classList.toggle('is-ok', !!sc.ok);
      steps.textContent = '';
      stepEls = [];
      pass.textContent = '';
      opt.textContent = '';
      why.textContent = '';
      sEls = [];
      if (sc.intro) {
        sc.steps.forEach(function (s, i) {
          var li = el('div', 'df-step');
          li.appendChild(el('b', null, '①②③④'[i]));
          li.appendChild(el('span', null, s));
          steps.appendChild(li);
          stepEls.push(li);
        });
        return;
      }
      pass.appendChild(el('span', 'df-lab', '지문'));
      var pt = el('span', 'df-text');
      sc.pass.forEach(function (s, i) {
        var n = sentence(s, i === sc.hit ? sc.key : '');
        pt.appendChild(n);
        sEls.push(n);
        if (i < sc.pass.length - 1) pt.appendChild(document.createTextNode(' '));
      });
      pass.appendChild(pt);
      opt.appendChild(el('span', 'df-lab', '선지'));
      var ot = el('span', 'df-text');
      ot.appendChild(sentence(sc.opt, sc.key));
      opt.appendChild(ot);
      why.appendChild(el('b', 'df-stamp', sc.ok ? '○' : '✕'));
      why.appendChild(el('span', 'df-why-t', sc.why));
    }

    function apply(sc, bi, jump) {
      var B = sc.beats[bi];
      if (jump) box.classList.add('pl-cut');
      if (sc.intro) {
        stepEls.forEach(function (s, k) { s.classList.toggle('is-on', k < B.show); });
      } else {
        var scan = B.k === 'scan' ? B.i : (B.k === 'show' ? -1 : sc.hit);
        sEls.forEach(function (s, i) {
          s.classList.toggle('is-scan', B.k === 'scan' && i === scan && i !== sc.hit);
          s.classList.toggle('is-hit', scan === sc.hit && i === sc.hit);
          s.classList.toggle('is-dim', scan === sc.hit && i !== sc.hit);
        });
        layer.classList.toggle('is-found', scan === sc.hit);
        layer.classList.toggle('is-diff', B.k === 'diff' || B.k === 'why');
        layer.classList.toggle('is-why', B.k === 'why');
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
  (root.NM_PLAYERS = root.NM_PLAYERS || {}).diff = {
    title: '선지 대조 재생기', sub: '찾기 → 나란히 → 바뀐 곳', tag: '선지 대조',
    scenes: SCENES, setup: setup,
    lib: { parse: parse, plain: plain, plan: plan }
  };
})();
