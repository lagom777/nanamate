import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';
import { sealSession } from './session.js';

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
          return { first: async () => rows[args[0]] || null };
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
