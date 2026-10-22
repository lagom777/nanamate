/* 논리형 공부법 — 사슬 가리고 떠올리기, 파트 끝내기 체크·진행률, 50분 집중 타이머.
 * 체크('nm-ss-done')와 타이머('nm-ss-timer')는 localStorage 에 두고 과목을 넘어 이어진다.
 * 스크립트가 없으면 사슬·해설은 그대로 보이고 이 기능들만 빠진다. */
(function () {
  'use strict';
  var DONE = 'nm-ss-done';
  var TIMER = 'nm-ss-timer';
  var FOCUS = 50 * 60 * 1000;
  var REST = 10 * 60 * 1000;

  function load(k, fallback) {
    try {
      var v = localStorage.getItem(k);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function store(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function each(sel, fn, root) {
    var list = (root || document).querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  /* ── 사슬 가리고 떠올리기: 첫 단계만 두고 나머지를 흐리게, 누르면 하나씩 드러난다(그 파트의 사슬만) ── */
  function setRecall(btn, on) {
    var pane = btn.closest('.nms-logic') || btn.parentNode.parentNode;
    pane.classList.toggle('is-recall', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? '👀 모두 보기' : '🙈 가리고 떠올리기';
    each('.nms-chain li', function (li, i) {
      var hide = on && i > 0;
      li.classList.toggle('is-hidden', hide);
      if (hide) {
        li.setAttribute('tabindex', '0');
        li.setAttribute('role', 'button');
        li.setAttribute('aria-label', (i + 1) + '번째 단계 — 눌러서 보기');
      } else {
        li.removeAttribute('tabindex');
        li.removeAttribute('role');
        li.removeAttribute('aria-label');
      }
    }, pane);
  }
  function reveal(li) {
    li.classList.remove('is-hidden');
    li.removeAttribute('tabindex');
    li.removeAttribute('role');
    li.removeAttribute('aria-label');
  }

  /* ── 파트 끝내기 체크와 진행률 ── */
  function doneMap() { return load(DONE, {}) || {}; }
  function countOf(arr) {
    var n = 0, i;
    for (i = 0; arr && i < arr.length; i++) if (arr[i]) n++;
    return n;
  }
  function paintDone() {
    var map = doneMap();
    each('[data-done]', function (box) {
      var arr = map[box.getAttribute('data-done')] || [];
      each('input[data-chk]', function (inp) {
        inp.checked = !!arr[+inp.getAttribute('data-chk')];
      }, box);
      var n = countOf(arr);
      var label = box.querySelector('.nms-done-n');
      if (label) label.textContent = n === 3 ? ' 3/3 끝!' : ' ' + n + '/3';
      box.classList.toggle('is-complete', n === 3);
    });
    each('[data-prog]', function (el) {
      var n = countOf(map[el.getAttribute('data-prog')]);
      el.textContent = n === 3 ? '✓ 끝' : n ? n + '/3' : '';
      el.className = 'nms-prog' + (n === 3 ? ' is-complete' : n ? ' is-part' : '');
    });
    each('[data-prog-total]', function (el) {
      var folder = el.getAttribute('data-prog-total') + '/';
      var total = +el.getAttribute('data-prog-count');
      var finished = 0, k;
      for (k in map) if (map.hasOwnProperty(k) && k.indexOf(folder) === 0 && countOf(map[k]) === 3) finished++;
      el.textContent = '끝낸 파트 ' + finished + ' / ' + total + ' — 파트 첫머리 카드의 ‘이 파트 끝내기’ 세 칸을 모두 채우면 끝난 것으로 셉니다.';
    });
  }
  function onCheck(inp) {
    var box = inp.closest('[data-done]');
    if (!box) return;
    var map = doneMap();
    var key = box.getAttribute('data-done');
    var arr = map[key] || [false, false, false];
    arr[+inp.getAttribute('data-chk')] = inp.checked;
    map[key] = arr;
    store(DONE, map);
    paintDone();
  }

  /* ── 50분 집중 + 10분 휴식 타이머: 시작 시각만 저장하므로 다른 파트로 옮겨도 이어진다 ── */
  var chip = null, tick = 0, baseTitle = document.title;
  function timerState() {
    var t = load(TIMER, null);
    if (!t || !t.start) return null;
    var el = Date.now() - t.start;
    if (el < FOCUS) return { phase: 'focus', left: FOCUS - el };
    if (el < FOCUS + REST) return { phase: 'rest', left: FOCUS + REST - el };
    return { phase: 'over', left: 0 };
  }
  function mmss(ms) {
    var s = Math.ceil(ms / 1000), m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function ensureChip() {
    if (chip) return chip;
    chip = document.createElement('div');
    chip.className = 'nms-timer';
    chip.setAttribute('role', 'status');
    chip.setAttribute('aria-live', 'polite');
    chip.innerHTML = '<span class="nms-timer-t"></span><button type="button" class="nms-timer-x" aria-label="타이머 끄기">✕</button>';
    chip.querySelector('.nms-timer-x').addEventListener('click', stopTimer);
    document.body.appendChild(chip);
    return chip;
  }
  function paintTimer() {
    var st = timerState();
    each('[data-timer]', function (b) {
      b.textContent = st && st.phase !== 'over' ? '⏹ 타이머 끄기' : '⏱ 50분 집중';
    });
    if (!st) {
      if (chip) chip.hidden = true;
      document.title = baseTitle;
      return;
    }
    ensureChip().hidden = false;
    var t = chip.querySelector('.nms-timer-t');
    chip.className = 'nms-timer is-' + st.phase;
    if (st.phase === 'focus') {
      t.textContent = '⏱ 집중 ' + mmss(st.left) + ' — 주제 하나를 끝내는 단위';
      document.title = baseTitle;
    } else if (st.phase === 'rest') {
      t.textContent = '☕ 쉬는 시간 ' + mmss(st.left) + ' — 화면에서 눈을 떼세요';
      document.title = '☕ 쉬는 시간 — ' + baseTitle;
    } else {
      t.textContent = '✅ 50분 + 휴식 끝! 오늘 끝낸 것 하나를 말로 설명해 보세요';
      document.title = baseTitle;
    }
  }
  function startTimer() {
    store(TIMER, { start: Date.now() });
    runTimer();
  }
  function stopTimer() {
    try { localStorage.removeItem(TIMER); } catch (e) {}
    if (tick) { clearInterval(tick); tick = 0; }
    paintTimer();
  }
  function runTimer() {
    paintTimer();
    if (!tick && timerState()) tick = setInterval(function () {
      var st = timerState();
      paintTimer();
      if (!st || st.phase === 'over') { clearInterval(tick); tick = 0; }
    }, 1000);
  }

  function init() {
    paintDone();
    runTimer();
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var r = t.closest('[data-recall]');
      if (r) { setRecall(r, r.getAttribute('aria-pressed') !== 'true'); return; }
      var li = t.closest('.is-recall .nms-chain li.is-hidden');
      if (li) { reveal(li); return; }
      var tb = t.closest('[data-timer]');
      if (tb) {
        var st = timerState();
        if (st && st.phase !== 'over') stopTimer();
        else startTimer();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var li = e.target && e.target.closest ? e.target.closest('.is-recall .nms-chain li.is-hidden') : null;
      if (li) { e.preventDefault(); reveal(li); }
    });
    document.addEventListener('change', function (e) {
      if (e.target && e.target.matches && e.target.matches('[data-done] input[data-chk]')) onCheck(e.target);
    });
    /* 다른 탭에서 체크·타이머를 바꾸면 이 탭도 따라간다 */
    window.addEventListener('storage', function (e) {
      if (e.key === DONE) paintDone();
      if (e.key === TIMER) runTimer();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
