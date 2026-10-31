import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';
import { sealSession } from './session.js';
import { keyHint, openKey, sealKey, validKey } from './aikey.js';

const secret = 'test';
const later = Math.floor(Date.now() / 1000) + 3600;
const KEY = 'sk-ant-api03-' + 'A'.repeat(40) + 'wxyz';

// ai_keys 만 흉내 내는 D1
function fakeDb() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      return {
        bind(...a) {
          return {
            async first() {
              const r = rows.get(a[0]);
              if (!r) return null;
              return /SELECT iv, ct/.test(sql) ? { iv: r.iv, ct: r.ct } : { hint: r.hint, updated_at: r.updated_at };
            },
            async run() {
              if (/^INSERT INTO ai_keys/.test(sql)) rows.set(a[0], { iv: a[1], ct: a[2], hint: a[3], updated_at: a[4] });
              if (/^DELETE FROM ai_keys/.test(sql)) rows.delete(a[0]);
              return {};
            },
          };
        },
      };
    },
  };
}

// Anthropic 대신 대답하는 fetch: 받은 요청을 기록한다
function stubFetch(status = 200) {
  const seen = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    seen.push({ url: String(url), headers: new Headers(init.headers), body: init.body });
    if (String(url).includes('/v1/models')) return new Response('{}', { status });
    return new Response('event: message_start\ndata: {}\n\n', { status, headers: { 'content-type': 'text/event-stream', 'request-id': 'req_1' } });
  };
  return { seen, restore() { globalThis.fetch = real; } };
}

async function call(env, path, { method = 'GET', uid, body, headers = {} } = {}) {
  const h = { Origin: 'https://nanamate.test', 'Content-Type': 'application/json', ...headers };
  if (uid) h.Cookie = 'sn_session=' + (await sealSession(secret, uid, later));
  return worker.fetch(new Request('https://nanamate.test' + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) }), env);
}

test('키 형식과 표시용 앞뒤 글자', () => {
  assert.ok(validKey(KEY));
  assert.ok(!validKey('sk-ant-짧음'));
  assert.ok(!validKey('sk-proj-' + 'A'.repeat(40)));
  assert.ok(!validKey(KEY + ' '));
  assert.equal(keyHint(KEY), 'sk-ant-api…wxyz');
});

test('암호화: 같은 계정만 열 수 있다', async () => {
  const s = await sealKey(secret, 'kakao:1', KEY);
  assert.ok(!s.ct.includes('AAAA'));
  assert.equal(await openKey(secret, 'kakao:1', s.iv, s.ct), KEY);
  assert.equal(await openKey(secret, 'kakao:2', s.iv, s.ct), null);
  assert.equal(await openKey('other', 'kakao:1', s.iv, s.ct), null);
});

test('저장·읽기·지우기: 로그인한 본인 것만, 원문은 내려보내지 않는다', async () => {
  const env = { DB: fakeDb(), SESSION_SECRET: secret };
  const f = stubFetch(200);
  try {
    assert.equal((await call(env, '/api/aikey')).status, 401);
    assert.equal((await call(env, '/api/aikey', { method: 'POST', body: { key: KEY } })).status, 401);
    assert.equal((await call(env, '/api/aikey', { method: 'POST', uid: 'kakao:1', body: { key: 'nope' } })).status, 400);
    const saved = await call(env, '/api/aikey', { method: 'POST', uid: 'kakao:1', body: { key: KEY } });
    const text = await saved.text();
    assert.equal(saved.status, 200);
    assert.ok(!text.includes(KEY));
    assert.equal(JSON.parse(text).hint, 'sk-ant-api…wxyz');
    assert.ok(!env.DB.rows.get('kakao:1').ct.includes(KEY));
    assert.deepEqual(await (await call(env, '/api/aikey', { uid: 'kakao:2' })).json(), { has: false });
    const mine = await (await call(env, '/api/aikey', { uid: 'kakao:1' })).json();
    assert.equal(mine.has, true);
    assert.equal(mine.hint, 'sk-ant-api…wxyz');
    assert.deepEqual(await (await call(env, '/api/aikey', { method: 'POST', uid: 'kakao:1', body: { key: null } })).json(), { has: false });
    assert.equal(env.DB.rows.size, 0);
    assert.equal((await call(env, '/api/aikey', { method: 'POST', uid: 'kakao:1', body: { key: KEY }, headers: { Origin: 'https://evil.test' } })).status, 403);
  } finally { f.restore(); }
});

test('Anthropic 이 거절한 키는 저장하지 않는다', async () => {
  const env = { DB: fakeDb(), SESSION_SECRET: secret };
  const f = stubFetch(401);
  try {
    const r = await call(env, '/api/aikey', { method: 'POST', uid: 'kakao:1', body: { key: KEY } });
    assert.equal(r.status, 400);
    assert.equal(env.DB.rows.size, 0);
  } finally { f.restore(); }
});

test('중계: 계정 키로 바꿔 보내고 응답을 그대로 돌려준다', async () => {
  const env = { DB: fakeDb(), SESSION_SECRET: secret };
  const f = stubFetch(200);
  try {
    const noLogin = await call(env, '/api/claude/v1/messages?beta=true', { method: 'POST', body: { model: 'm' } });
    assert.equal(noLogin.status, 401);
    assert.equal((await noLogin.json()).error.type, 'nanamate_login');
    const noKey = await call(env, '/api/claude/v1/messages?beta=true', { method: 'POST', uid: 'kakao:1', body: { model: 'm' } });
    assert.equal(noKey.status, 400);
    assert.equal((await noKey.json()).error.type, 'nanamate_nokey');
    await call(env, '/api/aikey', { method: 'POST', uid: 'kakao:1', body: { key: KEY } });
    f.seen.length = 0;
    const r = await call(env, '/api/claude/v1/messages?beta=true', {
      method: 'POST', uid: 'kakao:1', body: { model: 'claude-opus-5-5', messages: [] },
      headers: { 'x-api-key': 'account', 'anthropic-version': '2023-06-01', 'anthropic-beta': 'server-side-fallback-2026-07-01' },
    });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-type'), 'text/event-stream');
    assert.match(await r.text(), /message_start/);
    assert.equal(f.seen.length, 1);
    assert.equal(f.seen[0].url, 'https://api.anthropic.com/v1/messages?beta=true');
    assert.equal(f.seen[0].headers.get('x-api-key'), KEY);
    assert.equal(f.seen[0].headers.get('anthropic-beta'), 'server-side-fallback-2026-07-01');
    assert.equal(JSON.parse(f.seen[0].body).model, 'claude-opus-5-5');
    const other = await call(env, '/api/claude/v1/messages', { method: 'POST', uid: 'kakao:1', body: {}, headers: { Origin: 'https://evil.test' } });
    assert.equal(other.status, 403);
  } finally { f.restore(); }
});
