/* nanamate · 왼쪽 목차 접기
   (원래 후원 위젯 파일이었다. 600여 페이지가 이미 이 파일을 불러오므로 페이지를 고치지 않고 여기에 공용 기능을 둔다.)
   - 목차 맨 위 '« 목차 접기' 버튼 → 목차를 숨기고 본문을 넓힌다.
   - 접힌 상태에서는 왼쪽 위 '☰ 목차' 버튼으로 다시 편다.
   - 상태는 localStorage 에 기억(실패해도 동작). */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  var KEY = 'nm-aside-off';

  function read() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function write(v) { try { if (v) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) {} }

  function css() {
    var s = document.createElement('style');
    s.textContent =
      'html.nm-aside-off .nm-aside{display:none!important}' +
      'html.nm-aside-off .nm-aside ~ main{margin-left:auto;margin-right:auto}' +
      'button.nm-aside-close{display:flex!important;align-items:center;justify-content:flex-end;gap:4px;width:100%;margin:0 0 10px!important;padding:6px 8px!important;' +
      'border:0!important;border-radius:8px!important;background:transparent!important;color:var(--text-mute,#6b7280)!important;font:inherit;font-size:12.5px!important;' +
      'font-weight:500!important;cursor:pointer;box-shadow:none!important;transform:none!important;min-height:0!important;height:auto!important}' +
      'button.nm-aside-close:hover{background:rgba(0,0,0,.05)!important;color:var(--text,#1a1f2e)!important}' +
      'button.nm-aside-open{position:fixed!important;z-index:9990;top:12px;left:12px;display:none;align-items:center;gap:6px;height:38px!important;padding:0 14px!important;margin:0!important;' +
      'border:1px solid var(--border,rgba(0,0,0,.12))!important;border-radius:999px!important;background:var(--bg-card,#fff)!important;color:var(--text,#1a1f2e)!important;' +
      'font:inherit;font-size:13.5px!important;font-weight:600!important;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.12)!important;width:auto!important}' +
      'button.nm-aside-open:hover{transform:translateY(-1px)}' +
      'html.nm-aside-off button.nm-aside-open{display:inline-flex}' +
      '.nm-aside-close:focus-visible,.nm-aside-open:focus-visible{outline:2px solid var(--accent,#0066cc);outline-offset:2px}' +
      '@media (max-width:900px){html.nm-aside-off body{padding-top:52px!important}}' +
      '@media print{.nm-aside-close,.nm-aside-open{display:none!important}}';
    document.head.appendChild(s);
  }

  function boot() {
    var aside = document.querySelector('.layout > aside, .container > aside, .layout-wrapper > aside, body > aside:not(.study-controls-sidebar)');
    if (!aside || aside.querySelector('.nm-aside-close')) return;
    css();
    aside.classList.add('nm-aside');
    if (!aside.id) aside.id = 'nm-aside';

    var parent = aside.parentElement;
    var gridParent = parent && getComputedStyle(parent).display.indexOf('grid') !== -1;
    /* 목차가 고정(fixed)이면 본문이 margin-left 로 비켜 있으니 접을 때 그 여백도 없앤다 */
    var shifted = [];
    if (getComputedStyle(aside).position === 'fixed') {
      var w = aside.getBoundingClientRect().width;
      Array.prototype.forEach.call(parent.children, function (el) {
        if (el !== aside && parseFloat(getComputedStyle(el).marginLeft) >= w * 0.8) shifted.push(el);
      });
    }

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'nm-aside-close';
    close.textContent = '« 목차 접기';
    close.setAttribute('aria-controls', aside.id);
    aside.insertBefore(close, aside.firstChild);

    var open = document.createElement('button');
    open.type = 'button';
    open.className = 'nm-aside-open';
    open.textContent = '☰ 목차';
    open.setAttribute('aria-controls', aside.id);
    document.body.appendChild(open);

    function apply(off) {
      document.documentElement.classList.toggle('nm-aside-off', off);
      if (gridParent) parent.style.gridTemplateColumns = off ? 'minmax(0,1fr)' : '';
      shifted.forEach(function (el) { el.style.marginLeft = off ? '0' : ''; });
      close.setAttribute('aria-expanded', off ? 'false' : 'true');
      open.setAttribute('aria-expanded', off ? 'false' : 'true');
    }

    close.addEventListener('click', function () { write(true); apply(true); open.focus(); });
    open.addEventListener('click', function () { write(false); apply(false); close.focus(); });
    apply(read());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
