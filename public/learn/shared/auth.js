/* 카카오 로그인 · 풀이 기록. 전역 window.SnAuth */
(function (w) {
  var KEY = 'sn:queue';
  var meCache = null;

  function readQ() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function writeQ(q) {
    try { localStorage.setItem(KEY, JSON.stringify(q.slice(-2000))); } catch (e) {}
  }
  function enqueue(items) { writeQ(readQ().concat(items)); }

  function post(items) {
    return fetch('/api/attempts', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempts: items })
    }).then(function (r) {
      if (r.status === 401) { meCache = { id: null }; throw new Error('auth'); }
      if (r.status === 400) return false;
      if (!r.ok) throw new Error('post');
      return true;
    });
  }
  function sendAll(items) {
    if (!items.length) return Promise.resolve();
    return post(items.slice(0, 200)).then(function () { return sendAll(items.slice(200)); });
  }
  function flush() {
    if (!meCache || !meCache.id) return Promise.resolve();
    var q = readQ();
    if (!q.length) return Promise.resolve();
    return sendAll(q).then(function () {
      var now = readQ();
      var same = now.length >= q.length;
      for (var i = 0; same && i < q.length; i++) if (JSON.stringify(now[i]) !== JSON.stringify(q[i])) same = false;
      if (same) writeQ(now.slice(q.length));
    }).catch(function () {});
  }

  function me() {
    return fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : { id: null }; })
      .catch(function () { return { id: null }; })
      .then(function (j) {
        meCache = j && j.id ? { id: j.id, nickname: j.nickname || '학생' } : { id: null };
        return flush().then(function () { return meCache; });
      });
  }
  function login() {
    location.assign('/api/auth/kakao/login?next=' + encodeURIComponent(location.pathname + location.search));
  }
  function logout() {
    return fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('logout');
      meCache = { id: null };
    });
  }
  function record(attempts) {
    if (!attempts || !attempts.length) return Promise.resolve();
    if (!meCache || !meCache.id) { enqueue(attempts); return Promise.resolve(); }
    return sendAll(attempts).catch(function () { enqueue(attempts); });
  }
  function wrong(sub) {
    return fetch('/api/wrong?sub=' + encodeURIComponent(sub), { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('wrong'); return r.json(); });
  }
  function exportAttempts(sub) {
    return fetch('/api/export?sub=' + encodeURIComponent(sub), { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('export'); return r.json(); });
  }

  /* 문제별 메모·선지 표시(○△✕): 과목 것을 읽고, 바뀐 것만 보낸다 */
  function notes(sub) {
    return fetch('/api/qnotes?sub=' + encodeURIComponent(sub), { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('notes'); return r.json(); });
  }
  function saveNotes(rows) {
    return fetch('/api/qnotes', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: rows })
    }).then(function (r) {
      if (r.status === 401) { meCache = { id: null }; throw new Error('auth'); }
      if (!r.ok) throw new Error('notes');
    });
  }

  /* 오늘 다시 풀 오답(1·3·7일): sub 를 주면 그 과목만 */
  function due(sub) {
    return fetch('/api/due' + (sub ? '?sub=' + encodeURIComponent(sub) : ''), { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('due'); return r.json(); });
  }

  w.SnAuth = { me: me, login: login, logout: logout, record: record, wrong: wrong, exportAttempts: exportAttempts, notes: notes, saveNotes: saveNotes, due: due };
})(window);
