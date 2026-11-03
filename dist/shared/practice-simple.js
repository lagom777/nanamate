/* 직접 해보기(짝 맞추기)·개념 확인(퀴즈) — 3D 없이 가벼운 화면.
 * window.NANAMATE_GAME = { type: "matching", pairs: [{ term, def }] } → #nm-game-host
 * window.NANAMATE_QUIZ = { questions: [{ q, choices, answer }] }     → #nm-quiz-host
 * 글은 모두 textContent 로 넣는다. 색은 페이지의 --accent 를 따른다. */
(function () {
  'use strict';
  var NUM = ['①', '②', '③', '④', '⑤', '⑥'];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function btn(cls, text) {
    var b = el('button', cls, text);
    b.type = 'button';
    return b;
  }
  function shuffled(list) {
    var a = list.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function bar(scoreEl, resetText) {
    var head = el('div', 'nm-p-head');
    var reset = btn('nm-p-reset', resetText);
    head.appendChild(scoreEl);
    head.appendChild(reset);
    return { head: head, reset: reset };
  }

  /* 짝 맞추기: 왼쪽 개념과 오른쪽 설명 가운데 하나씩 눌러 짝을 짓는다(어느 쪽을 먼저 눌러도 된다) */
  function renderMatch(host, G) {
    var pairs = (G.pairs || []).filter(function (p) { return p && p.term && p.def; });
    if (!pairs.length) return;
    host.textContent = '';
    host.classList.add('nm-p');
    var score = el('span', 'nm-p-score');
    var top = bar(score, '다시 하기');
    var grid = el('div', 'nm-m-grid');
    var left = el('div', 'nm-m-col');
    var right = el('div', 'nm-m-col');
    grid.appendChild(left);
    grid.appendChild(right);
    host.appendChild(top.head);
    host.appendChild(grid);
    var sel = null, done = 0;

    function item(kind, i, text) {
      var b = btn('nm-m-item nm-m-' + kind, text);
      b.setAttribute('data-i', i);
      b.setAttribute('data-k', kind);
      return b;
    }
    function paint() {
      score.textContent = done === pairs.length ? '모두 맞혔습니다 ✓' : '맞힌 짝 ' + done + ' / ' + pairs.length;
    }
    function draw() {
      left.textContent = '';
      right.textContent = '';
      sel = null;
      done = 0;
      pairs.forEach(function (p, i) { left.appendChild(item('term', i, p.term)); });
      shuffled(pairs.map(function (_, i) { return i; })).forEach(function (i) { right.appendChild(item('def', i, pairs[i].def)); });
      paint();
    }
    grid.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.nm-m-item') : null;
      if (!b || b.disabled) return;
      if (!sel || sel.getAttribute('data-k') === b.getAttribute('data-k')) {
        if (sel) sel.classList.remove('is-sel');
        sel = b;
        b.classList.add('is-sel');
        return;
      }
      var a = sel;
      sel = null;
      if (a.getAttribute('data-i') === b.getAttribute('data-i')) {
        [a, b].forEach(function (x) { x.classList.remove('is-sel'); x.classList.add('is-ok'); x.disabled = true; });
        done++;
        paint();
      } else {
        [a, b].forEach(function (x) { x.classList.add('is-no'); });
        setTimeout(function () { [a, b].forEach(function (x) { x.classList.remove('is-no', 'is-sel'); }); }, 650);
      }
    });
    top.reset.addEventListener('click', draw);
    draw();
  }

  /* 개념 확인: 문제를 한꺼번에 펼쳐 두고, 보기를 누르면 그 자리에서 맞았는지와 정답을 보여 준다 */
  function renderQuiz(host, Q) {
    var qs = (Q.questions || []).filter(function (q) { return q && q.q && q.choices && q.choices.length; });
    if (!qs.length) return;
    host.textContent = '';
    host.classList.add('nm-p');
    var list = el('ol', 'nm-q-list');
    var score = el('span', 'nm-p-score');
    var foot = bar(score, '다시 풀기');
    host.appendChild(list);
    host.appendChild(foot.head);
    var got = 0, answered = 0;

    function paint() {
      score.textContent = answered === qs.length ? qs.length + '문제 중 ' + got + '문제 맞힘' : '맞힌 문제 ' + got + ' / ' + qs.length;
    }
    function draw() {
      list.textContent = '';
      got = 0;
      answered = 0;
      qs.forEach(function (q) {
        var li = el('li', 'nm-q');
        li.appendChild(el('p', 'nm-q-t', q.q));
        var ch = el('div', 'nm-q-ch');
        q.choices.forEach(function (c, ci) {
          var b = btn('nm-q-btn');
          b.appendChild(el('span', 'nm-q-no', NUM[ci] || String(ci + 1)));
          b.appendChild(document.createTextNode(c));
          b.setAttribute('data-ci', ci);
          ch.appendChild(b);
        });
        var fb = el('p', 'nm-q-fb');
        fb.setAttribute('aria-live', 'polite');
        li.appendChild(ch);
        li.appendChild(fb);
        list.appendChild(li);
        ch.addEventListener('click', function (e) {
          var b = e.target.closest ? e.target.closest('.nm-q-btn') : null;
          if (!b || li.classList.contains('is-done')) return;
          var ok = +b.getAttribute('data-ci') === q.answer;
          li.classList.add('is-done');
          answered++;
          if (ok) got++;
          b.classList.add(ok ? 'is-ok' : 'is-no');
          if (!ok && ch.children[q.answer]) ch.children[q.answer].classList.add('is-ans');
          Array.prototype.forEach.call(ch.children, function (x) { x.disabled = true; });
          fb.textContent = ok ? '정답입니다.' : '정답은 ' + (NUM[q.answer] || q.answer + 1) + ' ' + q.choices[q.answer] + '입니다.';
          paint();
        });
      });
      paint();
    }
    foot.reset.addEventListener('click', draw);
    draw();
  }

  function init() {
    var g = document.getElementById('nm-game-host');
    if (g && window.NANAMATE_GAME) renderMatch(g, window.NANAMATE_GAME);
    var q = document.getElementById('nm-quiz-host');
    if (q && window.NANAMATE_QUIZ) renderQuiz(q, window.NANAMATE_QUIZ);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
