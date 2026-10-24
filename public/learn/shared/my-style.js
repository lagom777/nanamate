/* 내 성향: 로그인한 본인의 공부 성향(/api/style — 계정별로 D1 에 저장, 공개 파일에는 두지 않음)을 보여 준다.
 * 글은 textContent 로만 넣고 **굵게** 표시만 <b> 로 바꾼다. 로그인·로그아웃은 shared/auth.js(SnAuth). */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function btn(cls, text, onClick) {
    var b = el('button', cls, text);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }
  function rich(parent, s) {
    String(s || '').split('**').forEach(function (part, i) {
      if (part) parent.appendChild(i % 2 ? el('b', null, part) : document.createTextNode(part));
    });
    return parent;
  }
  function msg(body, text) {
    body.textContent = '';
    body.appendChild(el('p', 'ms-msg', text));
  }

  function loginCard(body) {
    body.textContent = '';
    var card = el('div', 'ms-lock');
    card.appendChild(el('p', 'ms-lock-t', '🔒 내 성향은 로그인한 본인에게만 보여요'));
    card.appendChild(el('p', null, '카카오로 로그인하면 이 계정에 저장해 둔 공부 성향이 여기에 나옵니다.'));
    card.appendChild(btn('ms-kakao', '카카오로 로그인', function () { SnAuth.login(); }));
    body.appendChild(card);
  }

  function paintAuth(box, me) {
    box.textContent = '';
    if (!me || !me.id) return;
    box.appendChild(el('span', null, (me.nickname || '학생') + '님'));
    box.appendChild(btn('ms-out', '로그아웃', function () {
      SnAuth.logout().then(function () { location.reload(); }).catch(function () {});
    }));
  }

  function render(body, style, updated) {
    body.textContent = '';
    if (!style) { msg(body, '아직 이 계정에 저장된 성향이 없어요.'); return; }
    if (style.title) body.appendChild(el('p', 'ms-type', '🧭 ' + style.title));
    if (style.summary) body.appendChild(rich(el('p', 'ms-summary'), style.summary));
    var grid = el('div', 'ms-grid');
    (style.groups || []).forEach(function (g) {
      var card = el('section', 'ms-card');
      card.appendChild(el('h2', null, g.title || ''));
      var ul = el('ul');
      (g.items || []).forEach(function (x) { ul.appendChild(rich(el('li'), x)); });
      card.appendChild(ul);
      grid.appendChild(card);
    });
    body.appendChild(grid);
    var src = [style.source || '', updated ? '저장 ' + new Date(updated).toLocaleDateString('ko-KR') : ''].filter(Boolean).join(' · ');
    if (src) body.appendChild(el('p', 'ms-source', src));
  }

  function init() {
    var body = document.querySelector('[data-ms-body]');
    var auth = document.querySelector('[data-ms-auth]');
    if (!body) return;
    if (!window.SnAuth) { msg(body, '로그인 기능을 불러오지 못했어요. 새로 고침해 주세요.'); return; }
    SnAuth.me().then(function (me) {
      if (auth) paintAuth(auth, me);
      if (!me.id) { loginCard(body); return; }
      return fetch('/api/style', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) {
        if (r.status === 401) { loginCard(body); return; }
        if (!r.ok) throw new Error('style');
        return r.json().then(function (j) { render(body, j.style, j.updated_at); });
      });
    }).catch(function () { msg(body, '성향을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
