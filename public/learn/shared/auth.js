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
  /* 문항별 마지막 풀이 결과 [{exam, q, ok, ts}] — 유형별 '몇 문제 풀었나' 표시용 */
  function done(sub) {
    return fetch('/api/done?sub=' + encodeURIComponent(sub), { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('done'); return r.json(); });
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

  /* 계정별 AI 키(AI 해설): 있는지와 앞뒤 몇 글자만 받는다. 저장은 saveAiKey('sk-ant-…'), 지우기는 saveAiKey(null).
     키 원문은 서버에 암호화해 두고 다시 내려오지 않는다 — AI 요청은 /api/claude 가 이 키로 전달한다 */
  function aiKey() {
    return fetch('/api/aikey', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('aikey'); return r.json(); });
  }
  function saveAiKey(key) {
    return fetch('/api/aikey', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok) return j;
        var e = new Error(j.error || 'aikey');
        e.code = r.status === 401 ? 'login' : j.error;
        throw e;
      });
    });
  }

  /* 계정별 AI 해설·분석(수능 풀어보기): aiIndex(sub) → [{id, ts}] 이름과 고친 시각만, aiGet(sub, ids) → [{id, ts, data}] 내용(20개씩),
     saveAiNote(id, sub, data, ts) → true(저장) · false(서버가 받지 않는 모양 — 다시 보내지 않는다) */
  function aiJson(r) {
    if (r.status === 401) meCache = { id: null };
    if (!r.ok) throw new Error('ai');
    return r.json();
  }
  function aiIndex(sub) {
    return fetch('/api/ai?sub=' + encodeURIComponent(sub), { credentials: 'same-origin', cache: 'no-store' }).then(aiJson);
  }
  function aiGet(sub, ids) {
    return fetch('/api/ai/get', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sub: sub, ids: ids })
    }).then(aiJson);
  }
  function saveAiNote(id, sub, data, ts) {
    return fetch('/api/ai', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, sub: sub, data: data, ts: ts })
    }).then(function (r) {
      if (r.status === 401) { meCache = { id: null }; throw new Error('auth'); }
      if (r.status === 400) return false;
      if (!r.ok) throw new Error('ai');
      return true;
    });
  }

  /* 계정별 풀이 상태(회차마다 고른 답·채점 여부): examStates(sub) → [{id, ts, data}], saveExamState(sub, id, data, ts, keep) → true · false(서버가 받지 않는 모양).
     keep: 화면을 떠나는 순간에도 끝까지 보내기(keepalive) */
  function examStates(sub) {
    return fetch('/api/pstate?sub=' + encodeURIComponent(sub), { credentials: 'same-origin', cache: 'no-store' }).then(aiJson);
  }
  function saveExamState(sub, id, data, ts, keep) {
    return fetch('/api/pstate', {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: !!keep,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sub: sub, id: id, data: data, ts: ts })
    }).then(function (r) {
      if (r.status === 401) { meCache = { id: null }; throw new Error('auth'); }
      if (r.status === 400) return false;
      if (!r.ok) throw new Error('pstate');
      return true;
    });
  }

  w.SnAuth = { done: done, pending: function () { return readQ().slice(); }, examStates: examStates, saveExamState: saveExamState, me: me, login: login, logout: logout, record: record, wrong: wrong, exportAttempts: exportAttempts, notes: notes, saveNotes: saveNotes, due: due, aiKey: aiKey, saveAiKey: saveAiKey, aiIndex: aiIndex, aiGet: aiGet, saveAiNote: saveAiNote };
})(window);
