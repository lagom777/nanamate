import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';
import { sealSession } from './session.js';
import { parseStyle } from './style.js';

const secret = 'test';
const later = Math.floor(Date.now() / 1000) + 3600;

// user_styles 한 테이블만 흉내 내는 D1: 바인딩된 user_id 로만 찾는다
function fakeDb(rows) {
  const asked = [];
  return {
    asked,
    prepare(sql) {
      return {
        bind(...args) {
          asked.push({ sql, args });
          return { first: async () => rows[args[0]] || null, run: async () => ({}) };
        },
      };
    },
  };
}

async function getStyle(env, uid) {
  const headers = uid ? { Cookie: 'sn_session=' + (await sealSession(secret, uid, later)) } : {};
  return worker.fetch(new Request('https://nanamate.test/api/style', { headers }), env);
}

test('로그인하지 않으면 성향을 주지 않는다', async () => {
  const DB = fakeDb({ 'kakao:1': { body: '{"title":"논리형"}', updated_at: 1 } });
  const r = await getStyle({ SESSION_SECRET: secret, DB }, null);
  assert.equal(r.status, 401);
  assert.equal(DB.asked.length, 0);
});

test('위조한 세션으로는 볼 수 없다', async () => {
  const DB = fakeDb({ 'kakao:1': { body: '{"title":"논리형"}', updated_at: 1 } });
  const cookie = await sealSession('other', 'kakao:1', later);
  const r = await worker.fetch(new Request('https://nanamate.test/api/style', { headers: { Cookie: 'sn_session=' + cookie } }), { SESSION_SECRET: secret, DB });
  assert.equal(r.status, 401);
  assert.equal(DB.asked.length, 0);
});

test('로그인한 본인의 성향만 돌려준다', async () => {
  const DB = fakeDb({
    'kakao:1': { body: '{"title":"논리형"}', updated_at: 5 },
    'kakao:2': { body: '{"title":"다른 사람"}', updated_at: 6 },
  });
  const r = await getStyle({ SESSION_SECRET: secret, DB }, 'kakao:1');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await r.json(), { style: { title: '논리형' }, updated_at: 5 });
  assert.deepEqual(DB.asked.map((a) => a.args), [['kakao:1']]);
});

test('저장된 성향이 없으면 style: null', async () => {
  const r = await getStyle({ SESSION_SECRET: secret, DB: fakeDb({}) }, 'kakao:3');
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { style: null });
});

const good = {
  title: ' 논리형 ',
  summary: '‘왜’를 끝까지 묻는다',
  groups: [{ title: '공부 습관', items: ['**왜**를 두 번', '  ', '말로 설명'] }, { title: '', items: [] }],
  source: '',
};

test('저장 형식: 다듬고 빈 항목·빈 카드는 뺀다', () => {
  assert.deepEqual(parseStyle(good), {
    ok: true,
    style: { title: '논리형', summary: '‘왜’를 끝까지 묻는다', groups: [{ title: '공부 습관', items: ['**왜**를 두 번', '말로 설명'] }], source: '' },
  });
});

test('저장 형식: 틀리거나 너무 길거나 비어 있으면 거부', () => {
  const bad = [
    null, [], 'x', {},
    { ...good, title: 1 },
    { ...good, title: 'x'.repeat(61) },
    { ...good, groups: 'x' },
    { ...good, groups: Array.from({ length: 9 }, () => ({ title: 'a', items: [] })) },
    { ...good, groups: [{ title: 'a', items: Array.from({ length: 21 }, () => 'b') }] },
    { ...good, groups: [{ title: 'a', items: ['x'.repeat(301)] }] },
    { ...good, groups: [{ title: 'a', items: [3] }] },
    { title: '', summary: ' ', groups: [], source: '' },
  ];
  for (const b of bad) assert.equal(parseStyle(b).ok, false, JSON.stringify(b));
});

async function postStyle(env, uid, body, origin = 'https://nanamate.test') {
  const headers = { 'Content-Type': 'application/json', Origin: origin };
  if (uid) headers.Cookie = 'sn_session=' + (await sealSession(secret, uid, later));
  return worker.fetch(new Request('https://nanamate.test/api/style', { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) }), env);
}

test('저장: 로그인 안 하면 401, 다른 사이트에서 보내면 403, 틀린 형식은 400', async () => {
  const DB = fakeDb({});
  assert.equal((await postStyle({ SESSION_SECRET: secret, DB }, null, good)).status, 401);
  assert.equal((await postStyle({ SESSION_SECRET: secret, DB }, 'kakao:1', good, 'https://evil.test')).status, 403);
  assert.equal((await postStyle({ SESSION_SECRET: secret, DB }, 'kakao:1', '{')).status, 400);
  assert.equal((await postStyle({ SESSION_SECRET: secret, DB }, 'kakao:1', { title: 1 })).status, 400);
  assert.equal(DB.asked.length, 0);
});

test('저장: 로그인한 본인 행에만 쓴다', async () => {
  const DB = fakeDb({});
  const r = await postStyle({ SESSION_SECRET: secret, DB }, 'kakao:7', good);
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.style.title, '논리형');
  assert.equal(DB.asked.length, 1);
  const [uid, body, ts] = DB.asked[0].args;
  assert.equal(uid, 'kakao:7');
  assert.deepEqual(JSON.parse(body), j.style);
  assert.equal(ts, j.updated_at);
  assert.match(DB.asked[0].sql, /ON CONFLICT\(user_id\) DO UPDATE/);
});
