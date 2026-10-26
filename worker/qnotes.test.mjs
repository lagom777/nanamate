import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';
import { sealSession } from './session.js';
import { parseNotes } from './qnotes.js';

const secret = 'test';
const later = Math.floor(Date.now() / 1000) + 3600;
const one = { exam: '2025-csat', sub: 'korean', q: 135, marks: 'o-x-t', memo: '조건 ㄴ을 거꾸로 읽음', unsure: 1, cause: 'cond', ts: 1_700_000_000_000 };

// question_notes 만 흉내 내는 D1: 바인딩된 값과 batch 로 보낸 문장을 기록한다
function fakeDb(rows = []) {
  const asked = [];
  const batches = [];
  return {
    asked,
    batches,
    prepare(sql) {
      return {
        bind(...args) {
          const st = { sql, args, all: async () => ({ results: rows.filter((r) => r.user_id === args[0] && r.sub === args[1]).map(({ user_id, sub, ...r }) => r) }) };
          asked.push(st);
          return st;
        },
      };
    },
    async batch(sts) { batches.push(sts); return []; },
  };
}

async function call(env, method, uid, { body, sub = 'korean', origin = 'https://nanamate.test' } = {}) {
  const headers = { Origin: origin, 'Content-Type': 'application/json' };
  if (uid) headers.Cookie = 'sn_session=' + (await sealSession(secret, uid, later));
  const url = 'https://nanamate.test/api/qnotes' + (method === 'GET' ? '?sub=' + encodeURIComponent(sub) : '');
  return worker.fetch(new Request(url, { method, headers, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined }), env);
}

test('메모 형식: 맞는 것은 그대로, 다섯 칸이 모두 비면 빈 표시로', () => {
  assert.deepEqual(parseNotes({ notes: [one] }), { ok: true, notes: [one] });
  assert.equal(parseNotes({ notes: [{ ...one, marks: '-----' }] }).notes[0].marks, '');
  assert.equal(parseNotes({ notes: [{ ...one, marks: '', memo: '' }] }).ok, true);
  const { unsure, cause, ...old } = one;
  assert.deepEqual(parseNotes({ notes: [old] }).notes[0], { ...old, unsure: null, cause: null });
  assert.equal(parseNotes({ notes: [{ ...one, unsure: 0, cause: '' }] }).ok, true);
  assert.equal(parseNotes({ notes: [{ ...one, unsure: 1_700_000_000_000 }] }).notes[0].unsure, 1_700_000_000_000);
});

test('메모 형식: 틀리면 통째로 거부', () => {
  const bad = [
    null, [], {}, { notes: 'x' },
    { notes: Array.from({ length: 201 }, () => one) },
    { notes: [{ ...one, exam: '2025-xxx' }] },
    { notes: [{ ...one, sub: 'Korean' }] },
    { notes: [{ ...one, q: 0 }] },
    { notes: [{ ...one, q: 200 }] },
    { notes: [{ ...one, marks: 'oox' }] },
    { notes: [{ ...one, marks: 'oooo?' }] },
    { notes: [{ ...one, memo: 'x'.repeat(1001) }] },
    { notes: [{ ...one, memo: 3 }] },
    { notes: [{ ...one, ts: -1 }] },
    { notes: [{ ...one, ts: 1.5 }] },
    { notes: [{ ...one, unsure: -1 }] },
    { notes: [{ ...one, unsure: 1.5 }] },
    { notes: [{ ...one, unsure: true }] },
    { notes: [{ ...one, cause: 'lazy' }] },
  ];
  for (const b of bad) assert.equal(parseNotes(b).ok, false, JSON.stringify(b).slice(0, 80));
});

test('읽기: 로그인 안 하면 401, 과목이 틀리면 400, 본인·그 과목 것만', async () => {
  const DB = fakeDb([
    { user_id: 'kakao:1', sub: 'korean', exam: '2025-csat', q: 3, marks: 'o----', memo: '내 것', unsure: 1, cause: 'choice', ts: 5 },
    { user_id: 'kakao:2', sub: 'korean', exam: '2025-csat', q: 3, marks: 'x----', memo: '남의 것', ts: 6 },
    { user_id: 'kakao:1', sub: 'english', exam: '2025-csat', q: 3, marks: '', memo: '다른 과목', ts: 7 },
  ]);
  assert.equal((await call({ SESSION_SECRET: secret, DB }, 'GET', null)).status, 401);
  assert.equal((await call({ SESSION_SECRET: secret, DB }, 'GET', 'kakao:1', { sub: 'KOR!' })).status, 400);
  const r = await call({ SESSION_SECRET: secret, DB }, 'GET', 'kakao:1');
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), [{ exam: '2025-csat', q: 3, marks: 'o----', memo: '내 것', unsure: 1, cause: 'choice', ts: 5 }]);
  assert.deepEqual(DB.asked.at(-1).args, ['kakao:1', 'korean']);
});

test('쓰기: 로그인 안 하면 401, 다른 사이트 403, 틀린 형식 400', async () => {
  const DB = fakeDb();
  assert.equal((await call({ SESSION_SECRET: secret, DB }, 'POST', null, { body: { notes: [one] } })).status, 401);
  assert.equal((await call({ SESSION_SECRET: secret, DB }, 'POST', 'kakao:1', { body: { notes: [one] }, origin: 'https://evil.test' })).status, 403);
  assert.equal((await call({ SESSION_SECRET: secret, DB }, 'POST', 'kakao:1', { body: '{' })).status, 400);
  assert.equal((await call({ SESSION_SECRET: secret, DB }, 'POST', 'kakao:1', { body: { notes: [{ ...one, q: 0 }] } })).status, 400);
  assert.equal(DB.batches.length, 0);
});

test('쓰기: 본인 행에만, 더 늦게 고친 것만 덮어쓴다', async () => {
  const DB = fakeDb();
  const r = await call({ SESSION_SECRET: secret, DB }, 'POST', 'kakao:9', { body: { notes: [one, { ...one, q: 4, marks: '', memo: '' }] } });
  assert.equal(r.status, 204);
  assert.equal(DB.batches.length, 1);
  assert.equal(DB.batches[0].length, 2);
  assert.deepEqual(DB.batches[0][0].args, ['kakao:9', 'korean', '2025-csat', 135, 'o-x-t', '조건 ㄴ을 거꾸로 읽음', 1, 'cond', 1_700_000_000_000]);
  assert.match(DB.batches[0][0].sql, /WHERE excluded\.updated_at >= question_notes\.updated_at/);
  assert.match(DB.batches[0][0].sql, /unsure = COALESCE\(\?7, question_notes\.unsure\), cause = COALESCE\(\?8, question_notes\.cause\)/);
});
