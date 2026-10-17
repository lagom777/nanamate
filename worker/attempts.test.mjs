import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAttempts } from './attempts.js';

const row = { exam: '2025-csat', sub: 'math', q: 3, picked: 2, ok: 0, ts: 1_700_000_000_000 };

test('정상적인 풀이 기록', () => {
  const parsed = parseAttempts({ attempts: [row, { ...row, q: 16, picked: 42, ok: 1 }] });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.attempts.length, 2);
  assert.deepEqual(parsed.attempts[0], { ...row, ms: null, mode: null });
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

test('ms와 mode는 선택이고, 범위 밖이면 거부', () => {
  const withTime = parseAttempts({ attempts: [{ ...row, ms: 42000, mode: 'exam' }] });
  assert.equal(withTime.ok, true);
  assert.equal(withTime.attempts[0].ms, 42000);
  assert.equal(withTime.attempts[0].mode, 'exam');

  const practice = parseAttempts({ attempts: [{ ...row, ms: 0, mode: 'practice' }] });
  assert.equal(practice.ok, true);
  assert.equal(practice.attempts[0].ms, 0);
  assert.equal(practice.attempts[0].mode, 'practice');

  const cap = parseAttempts({ attempts: [{ ...row, ms: 3600000 }] });
  assert.equal(cap.ok, true);
  assert.equal(cap.attempts[0].ms, 3600000);
  assert.equal(cap.attempts[0].mode, null);

  const modeOnly = parseAttempts({ attempts: [{ ...row, mode: 'exam' }] });
  assert.equal(modeOnly.ok, true);
  assert.equal(modeOnly.attempts[0].ms, null);
  assert.equal(modeOnly.attempts[0].mode, 'exam');

  assert.equal(parseAttempts({ attempts: [{ ...row, ms: null, mode: null }] }).attempts[0].ms, null);
  assert.equal(parseAttempts({ attempts: [{ ...row, ms: -1 }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, ms: 3600001 }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, ms: 1.5 }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, ms: '42' }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, mode: 'rush' }] }).ok, false);
  assert.equal(parseAttempts({ attempts: [{ ...row, mode: '' }] }).ok, false);
});
