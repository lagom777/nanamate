import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';
import { sealSession } from './session.js';
import { parseState, validStateId, MAX_STATE } from './pstate.js';

const secret = 'test';
const later = Math.floor(Date.now() / 1000) + 3600;
const one = { sub: 'phys1', id: 'exam:2027-sep', ts: 1_700_000_000_000, data: { ans: [1, 2, 0, 5, 3], g: 1, gs: '', left: 812.4, ut: 1 } };

// exam_states 만 흉내 내는 D1
function fakeDb(rows = []) {
  const asked = [], batches = [];
  return {
    asked, batches,
    prepare(sql) {
      return { sql, bind(...args) {
        const st = { sql, args,
          all: async () => ({ results: rows.filter((r) => r.user_id === args[0] && r.sub === args[1]).sort((a, b) => b.updated_at - a.updated_at).map((r) => ({ id: r.id, data: r.data, ts: r.updated_at })) }),
          run: async () => ({}) };
        asked.push(st); return st;
      } };
    },
    async batch(sts) { batches.push(sts.map((s) => s.sql)); return []; },
  };
}
async function call(env, method, uid, { body, sub = 'phys1', origin = 'https://nanamate.test' } = {}) {
  const headers = { Origin: origin, 'Content-Type': 'application/json' };
  if (uid) headers.Cookie = 'sn_session=' + (await sealSession(secret, uid, later));
  const url = 'https://nanamate.test/api/pstate' + (method === 'GET' ? '?sub=' + encodeURIComponent(sub) : '');
  return worker.fetch(new Request(url, { method, headers, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined }), env);
}

test('풀이 상태 이름: exam:<회차> 만', () => {
  for (const id of ['exam:2027-sep', 'exam:2026-csat', 'exam:2022-jun']) assert.equal(validStateId(id), true, id);
  for (const id of ['part:1', 'exam:', 'exam:2027 sep', 'exam:' + 'x'.repeat(50), 'wrong:all', 5]) assert.equal(validStateId(id), false, String(id));
});

test('풀이 상태 형식: 맞는 것은 정리해 JSON 으로, 틀리면 거부', () => {
  const r = parseState(one);
  assert.equal(r.ok, true);
  assert.deepEqual(JSON.parse(r.state.data), { ans: [1, 2, 0, 5, 3], g: 1, gs: '', left: 812, ut: 1 });
  assert.deepEqual(JSON.parse(parseState({ ...one, sub: 'korean', data: { pa: { c1: 3, a35: 5, b45: 0 }, g: 1, gs: 'b', extra: 'x' } }).state.data), { pa: { c1: 3, a35: 5, b45: 0 }, g: 1, gs: 'b', ut: 0 });
  assert.deepEqual(JSON.parse(parseState({ ...one, data: {} }).state.data), {}, '다시 풀기: 빈 상태');
  assert.deepEqual(JSON.parse(parseState({ ...one, data: { ans: [1, 999], left: 5 } }).state.data), { ans: [1, 999] }, '채점 전이면 채점 정보는 싣지 않는다');
  const bad = [
    null, [], {}, { ...one, sub: 'PHYS' }, { ...one, id: 'part:3' }, { ...one, ts: -1 }, { ...one, ts: 1.5 }, { ...one, data: null }, { ...one, data: [] },
    { ...one, data: { ans: 'x' } }, { ...one, data: { ans: [1, -1] } }, { ...one, data: { ans: [1.5] } }, { ...one, data: { ans: Array(81).fill(1) } },
    { ...one, data: { pa: [1] } }, { ...one, data: { pa: { 'c1"': 1 } } }, { ...one, data: { pa: { c1: 10 } } },
    { ...one, data: { ans: [1], g: 1, gs: 'B!' } }, { ...one, data: { ans: [1], g: 1, left: 'soon' } }, { ...one, data: { ans: [1], g: 1, left: Infinity } },
  ];
  for (const b of bad) assert.equal(parseState(b).ok, false, JSON.stringify(b)?.slice(0, 80));
  assert.ok(JSON.stringify({ ans: Array(80).fill(99999) }).length < MAX_STATE, '가장 큰 답안도 한도 안');
});

test('목록: 로그인 안 하면 401, 틀린 과목 400, 본인·그 과목 것만 — 표는 처음에 만든다', async () => {
  const DB = fakeDb([
    { user_id: 'kakao:1', sub: 'phys1', id: 'exam:2027-sep', data: JSON.stringify({ ans: [1, 2] }), updated_at: 10 },
    { user_id: 'kakao:1', sub: 'phys1', id: 'exam:2026-csat', data: JSON.stringify({}), updated_at: 30 },
    { user_id: 'kakao:2', sub: 'phys1', id: 'exam:2027-sep', data: JSON.stringify({ ans: [5] }), updated_at: 99 },
    { user_id: 'kakao:1', sub: 'chem1', id: 'exam:2027-sep', data: JSON.stringify({ ans: [4] }), updated_at: 50 },
  ]);
  const env = { SESSION_SECRET: secret, DB };
  assert.equal((await call(env, 'GET', null)).status, 401);
  assert.equal((await call(env, 'GET', 'kakao:1', { sub: 'PHYS!' })).status, 400);
  const r = await call(env, 'GET', 'kakao:1');
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), [{ id: 'exam:2026-csat', ts: 30, data: {} }, { id: 'exam:2027-sep', ts: 10, data: { ans: [1, 2] } }]);
  assert.deepEqual(DB.asked.at(-1).args, ['kakao:1', 'phys1']);
  assert.ok(DB.batches.length >= 1 && DB.batches[0].every((s) => /IF NOT EXISTS/.test(s)));
});

test('쓰기: 로그인 안 하면 401, 다른 사이트 403, 틀린 형식 400, 맞으면 늦은 것을 남기며 저장', async () => {
  const DB = fakeDb();
  const env = { SESSION_SECRET: secret, DB };
  assert.equal((await call(env, 'POST', null, { body: one })).status, 401);
  assert.equal((await call(env, 'POST', 'kakao:1', { body: one, origin: 'https://evil.test' })).status, 403);
  assert.equal((await call(env, 'POST', 'kakao:1', { body: '{' })).status, 400);
  assert.equal((await call(env, 'POST', 'kakao:1', { body: { ...one, id: 'wrong:all' } })).status, 400);
  const r = await call(env, 'POST', 'kakao:1', { body: one });
  assert.equal(r.status, 204);
  const st = DB.asked.at(-1);
  assert.match(st.sql, /ON CONFLICT\(user_id, sub, id\) DO UPDATE .* WHERE excluded\.updated_at >= exam_states\.updated_at/);
  assert.deepEqual(st.args.slice(0, 3), ['kakao:1', 'phys1', 'exam:2027-sep']);
  assert.equal(st.args[4], one.ts);
});
