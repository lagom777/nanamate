/* 성향별 공부법 전환 — [data-nms] 상자 안의 [data-set] 버튼으로 성향을 고르면 같은 페이지의 모든 상자가 함께 바뀐다.
 * 고른 성향은 과목을 넘어 기억한다(localStorage 'nm-study-style', 기본 논리형). 스크립트가 없으면 모든 성향이 다 보인다. */
(function () {
  'use strict';
  var KEY = 'nm-study-style';
  var TYPES = ['logic', 'memory', 'visual', 'practice'];

  function get() {
    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    return TYPES.indexOf(v) >= 0 ? v : 'logic';
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }
  function apply(v) {
    var boxes = document.querySelectorAll('[data-nms]');
    var i, j, btns, on;
    for (i = 0; i < boxes.length; i++) {
      boxes[i].setAttribute('data-cur', v);
      btns = boxes[i].querySelectorAll('[data-set]');
      for (j = 0; j < btns.length; j++) {
        on = btns[j].getAttribute('data-set') === v;
        btns[j].classList.toggle('is-on', on);
        btns[j].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    }
  }
  function init() {
    document.documentElement.classList.add('nms-js');
    apply(get());
    document.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-nms] [data-set]') : null;
      if (!b) return;
      var v = b.getAttribute('data-set');
      if (TYPES.indexOf(v) < 0) return;
      save(v);
      apply(v);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
