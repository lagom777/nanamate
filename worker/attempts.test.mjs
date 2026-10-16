import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAttempts } from './attempts.js';

const row = { exam: '2025-csat', sub: 'math', q: 3, picked: 2, ok: 0, ts: 1_700_000_000_000 };

test('정상적인 풀이 기록', () => {
  const parsed = parseAttempts({ attempts: [row, { ...row, q: 16, picked: 42, ok: 1 }] });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.attempts.length, 2);
  assert.deepEqual(parsed.attempts[0], row);
});

test('이전용 picked 0 허용, 빈 배열 허용', () => {
  assert.equal(parseAttempts({ attempts: [{ ...row, picked: 0, ok: 0 }] }).ok, true);
  assert.equal(parseAttempts({ attempts: [] }).ok, true);
});

test('잘못된 입력은 거부', () => {
  assert.equal(parseAttempts(null).ok, false);
  assert.equal(parseAttempts({ attempts: 'no' }).ok, false);
  assert.equal(parseAttempts({ attempts: new Array(201).fill(row) }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, exam: 'https://evil' }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, exam: "2025-csat'; drop table attempts;--" }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, sub: "math' OR 1=1" }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, q: 0 }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, q: '3' }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, picked: 1.5 }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, picked: -1 }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, picked: 1000 }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, ok: 2 }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, ok: true }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, ts: 1.5 }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [null] }).ok, false);
});
