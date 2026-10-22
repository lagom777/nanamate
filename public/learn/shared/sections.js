/* 본문 절 접기(details.sec): ‘모두 펼치기/접기’, 링크·주소의 #목표가 접힌 절 안에 있으면 먼저 펼친다.
 * 절을 펼칠 때 resize 를 알려 크기를 다시 재는 그림이 제자리를 잡게 한다. */
(function () {
  'use strict';
  function openTo(el) {
    for (var n = el; n; n = n.parentElement) if (n.tagName === 'DETAILS' && !n.open) n.open = true;
  }
  function target(hash) {
    if (!hash || hash.length < 2 || hash.charAt(0) !== '#') return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; }
  }
  function init() {
    var secs = document.querySelectorAll('details.sec');
    if (!secs.length) return;
    var all = document.querySelector('[data-sec-all]');
    function paintAll() {
      if (!all) return;
      var open = Array.prototype.every.call(secs, function (d) { return d.open; });
      all.setAttribute('aria-pressed', open ? 'true' : 'false');
      all.textContent = open ? '모두 접기' : '모두 펼치기';
    }
    Array.prototype.forEach.call(secs, function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) window.dispatchEvent(new Event('resize'));
        paintAll();
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target || !e.target.closest) return;
      if (all && e.target.closest('[data-sec-all]')) {
        var open = all.getAttribute('aria-pressed') !== 'true';
        Array.prototype.forEach.call(secs, function (d) { d.open = open; });
        paintAll();
        return;
      }
      var a = e.target.closest('a[href^="#"]');
      var t = a && target(a.getAttribute('href'));
      if (t) openTo(t);
    });
    window.addEventListener('hashchange', function () {
      var t = target(location.hash);
      if (t) { openTo(t); t.scrollIntoView(); }
    });
    var t0 = target(location.hash);
    if (t0 && t0.closest('details:not([open])')) { openTo(t0); setTimeout(function () { t0.scrollIntoView(); }, 0); }
    paintAll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
