import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openSession, sealSession } from './session.js';

const secret = 'test';
const uid = 'kakao:1';

test('세션 서명 왕복', async () => {
  const token = await sealSession(secret, uid, 1_700_000_100);
  const data = await openSession(secret, token, 1_700_000_000);
  assert.equal(data.uid, uid);
  assert.equal(data.exp, 1_700_000_100);
});

test('변조된 쿠키는 거부', async () => {
  const token = await sealSession(secret, uid, 2_000_000_000);
  const dot = token.indexOf('.');
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const flip = (s) => s.slice(0, -1) + (s.at(-1) === 'A' ? 'B' : 'A');
  assert.equal(await openSession(secret, flip(payload) + '.' + sig, 1_700_000_000), null);
  assert.equal(await openSession(secret, payload + '.' + flip(sig), 1_700_000_000), null);
  assert.equal(await openSession(secret, payload, 1_700_000_000), null);
  assert.equal(await openSession(secret, sig.slice(0, 10), 1_700_000_000), null);
  assert.equal(await openSession('other', token, 1_700_000_000), null);
});

test('만료된 세션은 거부', async () => {
  const token = await sealSession(secret, uid, 1000);
  assert.equal(await openSession(secret, token, 1000), null);
  assert.equal(await openSession(secret, token, 1001), null);
  assert.equal((await openSession(secret, token, 999)).uid, uid);
});
