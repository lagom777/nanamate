/* ============================================================
   nanamate · 작품·지문 내용 재생기 — 국어 EBS 연계 정리(ebs-2027.html)에서 ‘▶ 내용 재생’을 누르면 창에 띄운다.
   데이터 한 편(window.NM_LIT[id]) → shared/player.js 의 def. 문학: 인물 칩 · 단계별 정서 · 짧은 인용 · 정서 흐름 줄.
   독서: 문단 흐름 줄 · 핵심 개념어. 마지막 장면은 출제 포인트. 데이터 규격: scripts/suneung/lit-play.test.mjs
   ============================================================ */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  var len = function (s) { return Array.from(String(s || '')).length; };

  function def(e) {
    var lit = !!e.who;
    var scenes = [{ kind: 'intro', label: lit ? '작품' : '지문', title: lit ? '「' + e.t + '」' : e.t,
      sub: lit ? e.a + ' · ' + e.g : e.cat, dur: 7, text: lit ? (e.th || e.key) : e.key, memo: e.s || '' }];
    e.steps.forEach(function (s, i) {
      scenes.push({ kind: 'step', i: i, label: s.h, title: s.h, sub: lit ? s.feel : s.keys.join(' · '),
        dur: Math.max(6, Math.min(11, 4 + len(s.ev) / 14)), text: s.ev, memo: '' });
    });
    scenes.push({ kind: 'pt', label: '포인트', title: '출제 포인트', sub: '수능이 묻는 곳', dur: 4 + e.pt.length * 2.4, text: e.key, memo: '' });

    return {
      title: lit ? '「' + e.t + '」' : e.t, sub: lit ? e.a : e.cat, tag: lit ? '작품 재생기' : '지문 재생기', scenes: scenes,
      setup: function (box) {
        var root = el('div', 'lt');
        box.appendChild(root);
        // 인물 칩(문학)
        var who = el('div', 'lt-who');
        var chip = {};
        (e.who || []).forEach(function (w) { var c = el('span', 'lt-chip', w[0]); c.title = w[1]; chip[w[0]] = c; who.appendChild(c); });
        // 가운데
        var mid = el('div', 'lt-mid');
        var big = el('p', 'lt-big');
        var small = el('p', 'lt-small');
        var quote = el('p', 'lt-q');
        var keys = el('div', 'lt-keys');
        mid.appendChild(small); mid.appendChild(big); mid.appendChild(quote); mid.appendChild(keys);
        // 흐름 줄: 문학은 정서, 독서는 문단 이름
        var track = el('div', 'lt-track');
        var marks = e.steps.map(function (s, i) {
          if (i) track.appendChild(el('i', 'lt-arrow', '→'));
          var m = el('span', 'lt-mark');
          m.appendChild(el('b', null, lit ? s.feel : s.h));
          if (lit) m.appendChild(el('small', null, s.h));
          track.appendChild(m);
          return m;
        });
        // 첫 장면·마지막 장면
        var intro = el('div', 'lt-intro');
        var pts = el('ol', 'lt-pts');
        var ptItems = e.pt.map(function (p) { var li = el('li', null, p); pts.appendChild(li); return li; });
        if (lit) {
          var list = el('ul', 'lt-cast');
          e.who.forEach(function (w) { var li = el('li'); li.appendChild(el('b', null, w[0])); li.appendChild(el('span', null, w[1])); list.appendChild(li); });
          intro.appendChild(el('p', 'lt-key', e.key));
          intro.appendChild(list);
        } else {
          intro.appendChild(el('p', 'lt-key', e.key));
          var ol = el('ol', 'lt-outline');
          e.steps.forEach(function (s) { ol.appendChild(el('li', null, s.h)); });
          intro.appendChild(ol);
        }
        [who, mid, track, intro, pts].forEach(function (n) { root.appendChild(n); });

        var cur = -1, keyEls = [];
        function enter(sc, idx) {   // 장면이 바뀔 때 한 번만 다시 그린다
          cur = idx;
          root.className = 'lt is-' + sc.kind + (lit ? ' is-lit' : ' is-read');
          var s = sc.kind === 'step' ? e.steps[sc.i] : null;
          small.textContent = s ? (lit ? s.h : '핵심 개념') : '';
          big.textContent = s && lit ? s.feel : '';   // 독서는 문단 이름이 제목에 있으니 가운데엔 개념어만
          quote.textContent = s && s.q ? '“' + s.q + '”' : '';
          quote.style.display = s && s.q ? '' : 'none';
          keys.textContent = '';
          keyEls = s && !lit ? s.keys.map(function (k) { var c = el('span', 'lt-k', k); keys.appendChild(c); return c; }) : [];
          marks.forEach(function (m, j) { m.className = 'lt-mark' + (sc.kind === 'pt' || (s && j < sc.i) ? ' done' : s && j === sc.i ? ' now' : ''); });
          Object.keys(chip).forEach(function (n) { chip[n].className = 'lt-chip' + (!s || !s.who || s.who.indexOf(n) >= 0 ? ' on' : ''); });
        }
        return {
          show: function (sc, idx, lt) {
            if (idx !== cur) enter(sc, idx);
            keyEls.forEach(function (c, j) { c.classList.toggle('on', lt > 0.5 + j * 0.9); });
            ptItems.forEach(function (li, j) { li.classList.toggle('on', sc.kind === 'pt' && lt > 0.4 + j * 2); });
          }
        };
      }
    };
  }

  window.NM_LIT_DEF = def;
})();
