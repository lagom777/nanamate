import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';
import { sealSession } from './session.js';
import { parseAiNote, parseAiIds, validAiId, MAX_DATA, MAX_GET } from './ainotes.js';

const secret = 'test';
const later = Math.floor(Date.now() / 1000) + 3600;
const data = { turns: [{ a: '핵심: 대동법\n\n===자세히===\n자세한 해설' }, { q: '더 쉽게', p: '더 쉽게 설명해 주세요', a: '쉽게 말하면…' }], u: { input_tokens: 900, output_tokens: 300 }, c: [['더 쉽게', '…']], w: { q: '2027-sep/2', auto: true } };
const one = { id: 'q:hist:2027-sep/2:1', sub: 'hist', ts: 1_700_000_000_000, data };

// ai_notes 만 흉내 내는 D1: 표 만들기(batch)와 바인딩된 문장을 기록한다. 목록(id, ts)과 IN (…) 내용 받기를 흉내 낸다
function fakeDb(rows = []) {
  const asked = [];
  const batches = [];
  return {
    asked,
    batches,
    prepare(sql) {
      return {
        sql,
        bind(...args) {
          const st = {
            sql, args,
            all: async () => {
              const [uid, sub, ...ids] = args;
              const mine = rows.filter((r) => r.user_id === uid && r.sub === sub && (!/ IN \(/.test(sql) || ids.includes(r.id)));
              return { results: / IN \(/.test(sql) ? mine.map((r) => ({ id: r.id, data: r.data, ts: r.updated_at })) : mine.sort((a, b) => b.updated_at - a.updated_at).map((r) => ({ id: r.id, ts: r.updated_at })) };
            },
            run: async () => ({}),
          };
          asked.push(st);
          return st;
        },
      };
    },
    async batch(sts) { batches.push(sts.map((s) => s.sql)); return []; },
  };
}

async function call(env, method, uid, { body, sub = 'hist', path = '/api/ai', origin = 'https://nanamate.test' } = {}) {
  const headers = { Origin: origin, 'Content-Type': 'application/json' };
  if (uid) headers.Cookie = 'sn_session=' + (await sealSession(secret, uid, later));
  const url = 'https://nanamate.test' + path + (method === 'GET' ? '?sub=' + encodeURIComponent(sub) : '');
  return worker.fetch(new Request(url, { method, headers, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined }), env);
}

test('AI 해설 이름: 화면이 쓰는 다섯 꼴만, 과목이 맞아야', () => {
  for (const id of ['q:hist:2027-sep/2:1', 'q:korean:2026-csat/a35:3', 'h:math:2025-jun/30', 'x:hist:exam:2027-sep:3,2,0,1', 'x:korean:exam:2026-csat:' + Array(45).fill(3).join(','), 's:english', 'w:hist:선사·고조선:3']) {
    assert.equal(validAiId(id, id.split(':')[1]), true, id);
  }
  for (const [id, sub] of [['q:hist:2027-sep/2:1', 'math'], ['z:hist:1', 'hist'], ['q:Hist:1', 'Hist'], ['q:hist:a\nb', 'hist'], ['q:hist:' + 'x'.repeat(1100), 'hist'], [3, 'hist']]) {
    assert.equal(validAiId(id, sub), false, String(id).slice(0, 40));
  }
});

test('AI 해설 형식: 맞는 것은 정리해 JSON 으로, 틀리면 거부', () => {
  const r = parseAiNote(one);
  assert.equal(r.ok, true);
  assert.deepEqual(JSON.parse(r.note.data), { turns: data.turns, u: data.u, c: data.c, w: data.w });
  assert.deepEqual(JSON.parse(parseAiNote({ ...one, data: { turns: [{ a: '답', extra: 1 }] } }).note.data), { turns: [{ a: '답' }], u: null, c: [], w: null });
  const bad = [
    null, [], {},
    { ...one, sub: 'math' },
    { ...one, id: 'q:hist' + ':x'.repeat(600) },
    { ...one, ts: -1 }, { ...one, ts: 1.5 },
    { ...one, data: null }, { ...one, data: { turns: [] } }, { ...one, data: { turns: [{ q: '질문만' }] } },
    { ...one, data: { turns: [{ a: 3 }] } },
    { ...one, data: { turns: Array.from({ length: 61 }, () => ({ a: 'x' })) } },
    { ...one, data: { turns: [{ a: 'x'.repeat(MAX_DATA) }] } },
  ];
  for (const b of bad) assert.equal(parseAiNote(b).ok, false, JSON.stringify(b).slice(0, 80));
});

const ROWS = [
  { user_id: 'kakao:1', sub: 'hist', id: 'q:hist:2027-sep/2:1', data: JSON.stringify(data), updated_at: 10 },
  { user_id: 'kakao:1', sub: 'hist', id: 's:hist', data: JSON.stringify({ turns: [{ a: '옛것' }] }), updated_at: 3 },
  { user_id: 'kakao:2', sub: 'hist', id: 'x:hist:exam:2027-sep:1,2', data: JSON.stringify({ turns: [{ a: '남의 것' }] }), updated_at: 11 },
  { user_id: 'kakao:1', sub: 'math', id: 's:math', data: JSON.stringify({ turns: [{ a: '다른 과목' }] }), updated_at: 12 },
];

test('목록: 로그인 안 하면 401, 틀린 과목 400, 본인·그 과목의 이름과 시각만(새 것부터) — 표는 처음에 만든다', async () => {
  const DB = fakeDb(ROWS);
  const env = { SESSION_SECRET: secret, DB };
  assert.equal((await call(env, 'GET', null)).status, 401);
  assert.equal((await call(env, 'GET', 'kakao:1', { sub: 'HIST!' })).status, 400);
  const r = await call(env, 'GET', 'kakao:1');
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), [{ id: 'q:hist:2027-sep/2:1', ts: 10 }, { id: 's:hist', ts: 3 }]);
  assert.deepEqual(DB.asked.at(-1).args, ['kakao:1', 'hist']);
  assert.doesNotMatch(DB.asked.at(-1).sql, /data/, '목록은 내용을 싣지 않는다');
  assert.ok(DB.batches.length >= 1 && DB.batches[0].every((s) => /IF NOT EXISTS/.test(s)), '표를 IF NOT EXISTS 로 만든다');
});

test('내용 받기: 고른 이름만, 남의 것·다른 과목은 안 나온다 · 형식이 틀리면 400 · 다른 사이트 403', async () => {
  const DB = fakeDb(ROWS);
  const env = { SESSION_SECRET: secret, DB };
  const ask = (body, o = {}) => call(env, 'POST', 'kakao:1', { path: '/api/ai/get', body, ...o });
  assert.equal((await call(env, 'POST', null, { path: '/api/ai/get', body: { sub: 'hist', ids: ['s:hist'] } })).status, 401);
  assert.equal((await ask({ sub: 'hist', ids: ['s:hist'] }, { origin: 'https://evil.test' })).status, 403);
  for (const bad of ['{', { sub: 'hist' }, { sub: 'hist', ids: [] }, { sub: 'hist', ids: ['s:math'] }, { sub: 'hist', ids: Array.from({ length: MAX_GET + 1 }, (_, k) => 'w:hist:g:' + k) }]) {
    assert.equal((await ask(bad)).status, 400, JSON.stringify(bad));
  }
  const r = await ask({ sub: 'hist', ids: ['q:hist:2027-sep/2:1', 'x:hist:exam:2027-sep:1,2', 'q:hist:2027-sep/2:1'] });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), [{ id: 'q:hist:2027-sep/2:1', ts: 10, data }]);
  assert.deepEqual(DB.asked.at(-1).args, ['kakao:1', 'hist', 'q:hist:2027-sep/2:1', 'x:hist:exam:2027-sep:1,2'], '겹친 이름은 한 번만');
  assert.deepEqual(parseAiIds({ sub: 'hist', ids: ['s:hist', 's:hist'] }), { ok: true, sub: 'hist', ids: ['s:hist'] });
});

test('쓰기: 로그인 안 하면 401, 다른 사이트 403, 틀린 형식 400, 맞으면 늦은 것을 남기며 저장', async () => {
  const DB = fakeDb();
  const env = { SESSION_SECRET: secret, DB };
  assert.equal((await call(env, 'POST', null, { body: one })).status, 401);
  assert.equal((await call(env, 'POST', 'kakao:1', { body: one, origin: 'https://evil.test' })).status, 403);
  assert.equal((await call(env, 'POST', 'kakao:1', { body: '{' })).status, 400);
  assert.equal((await call(env, 'POST', 'kakao:1', { body: { ...one, sub: 'math' } })).status, 400);
  const r = await call(env, 'POST', 'kakao:1', { body: one });
  assert.equal(r.status, 204);
  const st = DB.asked.at(-1);
  assert.match(st.sql, /ON CONFLICT\(user_id, id\) DO UPDATE .* WHERE excluded\.updated_at >= ai_notes\.updated_at/);
  assert.deepEqual(st.args.slice(0, 3), ['kakao:1', 'q:hist:2027-sep/2:1', 'hist']);
  assert.equal(st.args[4], one.ts);
});
