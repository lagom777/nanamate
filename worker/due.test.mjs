import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';
import { sealSession } from './session.js';
import { dayStr, dueList, kstDay, schedule } from './due.js';

const DAY = 86400000;
// 2026-10-20 10:00 KST 를 0일로
const T0 = Date.UTC(2026, 9, 20, 1, 0, 0);
const at = (days, h = 0) => T0 + days * DAY + h * 3600000;
const A = (q, ok, days, extra = {}) => ({ sub: 'bio1', exam: '2027-sep', q, ok, ts: at(days), ...extra });

test('KST 날짜: 한국 자정에 날짜가 바뀐다', () => {
  assert.equal(dayStr(kstDay(Date.UTC(2026, 9, 25, 14, 59))), '2026-10-25');
  assert.equal(dayStr(kstDay(Date.UTC(2026, 9, 25, 15, 0))), '2026-10-26');
});

test('틀리면 다음 날, 그날 맞히면 3일 뒤, 또 맞히면 7일 뒤, 그것도 맞히면 끝', () => {
  const d0 = kstDay(at(0));
  assert.deepEqual(schedule([A(3, 0, 0)], []), [{ sub: 'bio1', exam: '2027-sep', q: 3, stage: 0, due: d0 + 1, why: 'wrong' }]);
  assert.equal(schedule([A(3, 0, 0), A(3, 1, 1)], [])[0].due, d0 + 4);
  assert.equal(schedule([A(3, 0, 0), A(3, 1, 1), A(3, 1, 4)], [])[0].due, d0 + 11);
  assert.deepEqual(schedule([A(3, 0, 0), A(3, 1, 1), A(3, 1, 4), A(3, 1, 11)], []), []);
});

test('예정일 전에 맞힌 것은 복습으로 치지 않고, 다시 틀리면 처음부터', () => {
  const d0 = kstDay(at(0));
  assert.equal(schedule([A(3, 0, 0), A(3, 1, 0)], [])[0].due, d0 + 1);
  assert.equal(schedule([A(3, 0, 0), A(3, 1, 1), A(3, 1, 2)], [])[0].due, d0 + 4);
  const r = schedule([A(3, 0, 0), A(3, 1, 1), A(3, 0, 5)], [])[0];
  assert.equal(r.stage, 0);
  assert.equal(r.due, d0 + 6);
  assert.deepEqual(schedule([A(4, 1, 0), A(4, 1, 2)], []), []);
});

test('늦게 와서 맞혀도 그날부터 다음 간격', () => {
  const d0 = kstDay(at(0));
  assert.equal(schedule([A(3, 0, 0), A(3, 1, 5)], [])[0].due, d0 + 8);
});

test('헷갈림 표시는 표시한 시각에 틀린 것처럼(예전 값 1 은 고친 시각)', () => {
  const d0 = kstDay(at(0));
  const f = schedule([], [{ sub: 'bio1', exam: '2027-sep', q: 7, unsure: at(0), ts: at(9) }])[0];
  assert.equal(f.why, 'unsure');
  assert.equal(f.due, d0 + 1);
  assert.equal(schedule([], [{ sub: 'bio1', exam: '2027-sep', q: 7, unsure: 1, ts: at(2) }])[0].due, d0 + 3);
  assert.equal(schedule([A(7, 1, 1)], [{ sub: 'bio1', exam: '2027-sep', q: 7, unsure: at(0), ts: at(0) }])[0].due, d0 + 4);
});

test('오늘 풀 것(밀린 것 포함)과 앞으로 7일 개수', () => {
  const r = dueList([A(1, 0, 0), A(2, 0, 3), A(3, 0, 5), A(4, 0, 20)], [], at(4));
  assert.equal(r.today, '2026-10-24');
  assert.deepEqual(r.due.map((x) => [x.q, x.step, x.late, x.why]), [[1, 1, 3, 'wrong'], [2, 1, 0, 'wrong']]);
  assert.deepEqual(r.next, [{ date: '2026-10-26', n: 1 }]);
});

// 엔드포인트: 로그인한 본인 것만, 과목을 주면 그 과목만
function fakeDb(att, notes) {
  const asked = [];
  return {
    asked,
    prepare(sql) {
      return { bind(...args) { const st = { sql, args }; asked.push(st); return st; } };
    },
    async batch(sts) {
      return sts.map((st) => {
        const [uid, sub] = st.args;
        const rows = (/FROM attempts/.test(st.sql) ? att : notes).filter((r) => r.user_id === uid && (!sub || r.sub === sub));
        return { results: rows.map(({ user_id, ...r }) => r) };
      });
    },
  };
}

test('/api/due: 로그인 안 하면 401, 과목이 틀리면 400, 본인 것만', async () => {
  const later = Math.floor(Date.now() / 1000) + 3600;
  const now = Date.now();
  const DB = fakeDb([
    { user_id: 'kakao:1', sub: 'bio1', exam: '2027-sep', q: 3, ok: 0, ts: now - 2 * DAY },
    { user_id: 'kakao:1', sub: 'math', exam: '2027-sep', q: 9, ok: 0, ts: now - 2 * DAY },
    { user_id: 'kakao:2', sub: 'bio1', exam: '2027-sep', q: 5, ok: 0, ts: now - 2 * DAY },
  ], []);
  const call = async (uid, q = '') => worker.fetch(new Request('https://nanamate.test/api/due' + q, { headers: uid ? { Cookie: 'sn_session=' + (await sealSession('test', uid, later)) } : {} }), { SESSION_SECRET: 'test', DB });
  assert.equal((await call(null)).status, 401);
  assert.equal((await call('kakao:1', '?sub=Bio!')).status, 400);
  const all = await (await call('kakao:1')).json();
  assert.deepEqual(all.due.map((x) => x.sub + '/' + x.q), ['bio1/3', 'math/9']);
  const one = await (await call('kakao:1', '?sub=bio1')).json();
  assert.deepEqual(one.due.map((x) => x.sub + '/' + x.q), ['bio1/3']);
  assert.ok(DB.asked.every((st) => st.args[0] === 'kakao:1'));
});
