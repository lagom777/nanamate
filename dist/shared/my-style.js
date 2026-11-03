/* 내 정보: 로그인한 본인의 공부 성향(/api/style — 계정별로 D1 에 저장, 공개 파일에는 두지 않음)을 보여 주고 직접 고치게 한다.
 * 글은 textContent 로만 넣고 **굵게** 표시만 <b> 로 바꾼다. 로그인·로그아웃은 shared/auth.js(SnAuth). */
(function () {
  'use strict';
  var LIMIT = { groups: 8, items: 20, item: 300 };
  var TEMPLATE = ['잘 맞는 것', '조심할 것', '공부 습관', '과목 메모'];

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
  function field(tag, cls, value, max, placeholder) {
    var f = el(tag, cls);
    if (tag === 'input') f.type = 'text';
    if (max) f.maxLength = max;
    f.value = value || '';
    if (placeholder) f.placeholder = placeholder;
    return f;
  }
  function labeled(text, control) {
    var l = el('label', 'ms-field');
    l.appendChild(el('span', 'ms-field-t', text));
    l.appendChild(control);
    return l;
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
    card.appendChild(el('p', 'ms-lock-t', '🔒 내 정보는 로그인한 본인에게만 보여요'));
    card.appendChild(el('p', null, '카카오로 로그인하면 이 계정에 저장해 둔 공부 성향을 보고, 직접 적거나 고칠 수 있습니다.'));
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

  function render(body, style, updated, note) {
    body.textContent = '';
    var bar = el('div', 'ms-actions');
    if (note) bar.appendChild(el('span', 'ms-saved', note));
    bar.appendChild(btn('ms-edit-btn', style ? '✏️ 내 정보 고치기' : '✏️ 내 정보 입력하기', function () {
      editor(body, style, function (saved) {
        if (saved) render(body, saved.style, saved.updated_at, '저장했어요 ✓');
        else render(body, style, updated);
      });
    }));
    body.appendChild(bar);
    if (!style) { body.appendChild(el('p', 'ms-msg', '아직 이 계정에 적어 둔 내 정보가 없어요. ‘내 정보 입력하기’로 적어 두세요.')); return; }
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

  /* 고치기: 카드마다 제목 + 항목(한 줄에 하나). done(저장 결과 | null=취소) */
  function cardEditor(g, example) {
    var box = el('div', 'ms-edit-card');
    box.appendChild(labeled('카드 제목', field('input', 'ms-edit-gt', g && g.title, 40, '예: ' + example)));
    var items = field('textarea', 'ms-edit-items', g && g.items ? g.items.join('\n') : '', 0, '한 줄에 하나씩');
    items.rows = 5;
    box.appendChild(labeled('항목 (한 줄에 하나씩)', items));
    box.appendChild(btn('ms-edit-del', '이 카드 빼기', function () { box.parentNode.removeChild(box); }));
    return box;
  }

  function editor(body, style, done) {
    var s = style || {};
    body.textContent = '';
    var form = el('form', 'ms-edit');
    form.appendChild(el('p', 'ms-edit-hint', '항목은 한 줄에 하나씩 쓰고, **두 별표** 사이 글은 굵게 보여요. 이 계정에만 저장됩니다.'));
    var title = field('input', 'ms-edit-title', s.title, 60, '예: 논리형');
    var summary = field('textarea', 'ms-edit-summary', s.summary, 600, '어떻게 공부할 때 잘 되는지 한두 문장');
    summary.rows = 3;
    form.appendChild(labeled('유형', title));
    form.appendChild(labeled('한 줄 요약', summary));
    var cards = el('div', 'ms-edit-cards');
    var groups = s.groups && s.groups.length ? s.groups : TEMPLATE.map(function () { return null; });
    groups.forEach(function (g, i) { cards.appendChild(cardEditor(g, TEMPLATE[i % TEMPLATE.length])); });
    form.appendChild(cards);
    var status = el('p', 'ms-edit-status');
    status.setAttribute('aria-live', 'polite');
    function say(t) { status.textContent = t; }
    form.appendChild(btn('ms-edit-add', '＋ 카드 추가', function () {
      if (cards.children.length >= LIMIT.groups) { say('카드는 ' + LIMIT.groups + '장까지예요.'); return; }
      cards.appendChild(cardEditor(null, TEMPLATE[cards.children.length % TEMPLATE.length]));
    }));
    var source = field('input', 'ms-edit-source', s.source, 200, '예: 2026-10-21 공부법 리포트');
    form.appendChild(labeled('메모 (어디서 온 내용인지)', source));
    var bar = el('div', 'ms-edit-bar');
    var save = el('button', 'ms-save', '저장');
    save.type = 'submit';
    bar.appendChild(save);
    bar.appendChild(btn('ms-cancel', '취소', function () { done(null); }));
    bar.appendChild(status);
    form.appendChild(bar);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = { title: title.value, summary: summary.value, source: source.value, groups: [] };
      var bad = '';
      Array.prototype.forEach.call(cards.children, function (c) {
        var items = c.querySelector('.ms-edit-items').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
        if (items.length > LIMIT.items) bad = '카드 하나에 항목은 ' + LIMIT.items + '개까지예요.';
        items.forEach(function (x) { if (x.length > LIMIT.item) bad = '항목 하나는 ' + LIMIT.item + '자까지예요.'; });
        data.groups.push({ title: c.querySelector('.ms-edit-gt').value, items: items });
      });
      if (!bad && !data.title.trim() && !data.summary.trim() && !data.groups.some(function (g) { return g.title.trim() || g.items.length; })) bad = '적은 내용이 없어요.';
      if (bad) { say(bad); return; }
      save.disabled = true;
      say('저장하는 중…');
      fetch('/api/style', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.status === 401) { loginCard(body); return; }
        if (!r.ok) throw new Error('save');
        return r.json().then(function (j) { done(j); });
      }).catch(function () {
        save.disabled = false;
        say('저장하지 못했어요. 잠시 뒤 다시 눌러 주세요.');
      });
    });
    body.appendChild(form);
    title.focus();
  }

  /* 📅 오늘 다시 풀 오답(1·3·7일, /api/due): 과목마다 개수와 그 과목 풀어보기로 가는 길. 국어·영어(시험지형)는 목록 창(#due) */
  var SUBJECTS = [
    ['korean', '국어', 'aboutSuneungKorean/practice.html', 1], ['math', '수학', 'aboutSuneungMath/practice.html'],
    ['english', '영어', 'aboutSuneungEnglish/practice.html', 1], ['hist', '한국사', 'aboutSuneungHistory/practice.html'],
    ['phys1', '물리학Ⅰ', 'aboutSuneungPhysics1/practice.html'], ['chem1', '화학Ⅰ', 'aboutSuneungChem1/practice.html'],
    ['bio1', '생명과학Ⅰ', 'aboutSuneungBio1/practice.html'], ['earth1', '지구과학Ⅰ', 'aboutSuneungEarth1/practice.html'],
    ['phys2', '물리학Ⅱ', 'aboutSuneungScience2/practice-phys2.html'], ['chem2', '화학Ⅱ', 'aboutSuneungScience2/practice-chem2.html'],
    ['bio2', '생명과학Ⅱ', 'aboutSuneungScience2/practice-bio2.html'], ['earth2', '지구과학Ⅱ', 'aboutSuneungScience2/practice-earth2.html']
  ];
  function paintDue(box, j) {
    var n = {};
    (j.due || []).forEach(function (r) { n[r.sub] = (n[r.sub] || 0) + 1; });
    box.textContent = '';
    box.appendChild(el('h2', null, '📅 오늘 다시 풀 오답'));
    box.appendChild(el('p', 'ms-due-sub', '틀리거나 헷갈린 문제를 1·3·7일 뒤에 다시 풉니다. 그날 맞히면 다음 간격으로, 틀리면 다음 날 다시 나와요.'));
    var ul = el('ul', 'ms-due-list');
    SUBJECTS.forEach(function (s) {
      if (!n[s[0]]) return;
      var li = el('li');
      li.appendChild(el('b', null, s[1]));
      li.appendChild(el('span', null, n[s[0]] + '문항'));
      var a = el('a', null, '풀러 가기 →');
      a.href = s[2] + (s[3] ? '#due' : '#due:today');
      li.appendChild(a);
      ul.appendChild(li);
    });
    box.appendChild(ul.children.length ? ul : el('p', 'ms-due-none', '오늘은 다시 풀 문제가 없어요 ✓'));
    if (j.next && j.next.length) {
      box.appendChild(el('p', 'ms-due-next', '다음 7일: ' + j.next.map(function (x) { return x.date.slice(5).replace('-', '/') + ' ' + x.n + '문항'; }).join(' · ')));
    }
    box.hidden = false;
  }

  function init() {
    var body = document.querySelector('[data-ms-body]');
    var auth = document.querySelector('[data-ms-auth]');
    var dueBox = document.querySelector('[data-ms-due]');
    if (!body) return;
    if (!window.SnAuth) { msg(body, '로그인 기능을 불러오지 못했어요. 새로 고침해 주세요.'); return; }
    SnAuth.me().then(function (me) {
      if (auth) paintAuth(auth, me);
      if (!me.id) { loginCard(body); return; }
      if (dueBox && SnAuth.due) SnAuth.due().then(function (j) { paintDue(dueBox, j); }).catch(function () {});
      return fetch('/api/style', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) {
        if (r.status === 401) { loginCard(body); return; }
        if (!r.ok) throw new Error('style');
        return r.json().then(function (j) { render(body, j.style, j.updated_at); });
      });
    }).catch(function () { msg(body, '내 정보를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
