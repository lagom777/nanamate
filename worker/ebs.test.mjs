import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';
import { sealSession } from './session.js';
import { ebsDenied, ebsKey } from './ebs.js';

const secret = 'test';
const later = Math.floor(Date.now() / 1000) + 3600;
const owner = 'kakao:1';

// R2 흉내: 꺼내 간 키를 기록한다
function fakeBucket(files) {
  const asked = [];
  return { asked, async get(k) { asked.push(k); return k in files ? { body: files[k] } : null; } };
}

async function call(env, path, uid) {
  const headers = {};
  if (uid) headers.Cookie = 'sn_session=' + (await sealSession(secret, uid, later));
  return worker.fetch(new Request('https://nanamate.test/api/ebs/' + path, { headers }), env);
}

test('그림 키: 세트/과목/목록·그림 모양만 받는다', () => {
  assert.equal(ebsKey('/api/ebs/2027-sutk/bio1/index.json'), '2027-sutk/bio1/index.json');
  assert.equal(ebsKey('/api/ebs/2027-sutk/physics1/p191-3.webp'), '2027-sutk/physics1/p191-3.webp');
  for (const bad of ['2027-sutk/bio1/../index.json', '2027-sutk/bio1/p1-1.webp', 'x/bio1/index.json', '2027-sutk/bio1/a.png', '2027-sutk/index.json', '']) {
    assert.equal(ebsKey('/api/ebs/' + bad), null, bad);
  }
});

test('주인 판정: 로그인 없음 401, 다른 계정·주인 시크릿 없음 403', () => {
  assert.equal(ebsDenied(null, owner), 401);
  assert.equal(ebsDenied({ uid: 'kakao:2' }, owner), 403);
  assert.equal(ebsDenied({ uid: owner }, undefined), 403);
  assert.equal(ebsDenied({ uid: owner }, ''), 403);
  assert.equal(ebsDenied({ uid: owner }, owner), 0);
});

test('그림 모음: 주인이 아니면 저장소를 열어 보지도 않는다', async () => {
  const EBS = fakeBucket({ '2027-sutk/bio1/index.json': '{}' });
  const env = { SESSION_SECRET: secret, EBS_OWNER: owner, EBS };
  assert.equal((await call(env, '2027-sutk/bio1/index.json')).status, 401);
  const r = await call(env, '2027-sutk/bio1/index.json', 'kakao:2');
  assert.equal(r.status, 403);
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
  assert.equal((await call({ ...env, EBS_OWNER: undefined }, '2027-sutk/bio1/index.json', owner)).status, 403);
  assert.deepEqual(EBS.asked, []);
});

test('그림 모음: 주인 계정은 목록과 그림을 받고, 없는 키·이상한 키는 404', async () => {
  const EBS = fakeBucket({ '2027-sutk/bio1/index.json': '{"sub":"bio1"}', '2027-sutk/bio1/p138-1.webp': 'WEBP' });
  const env = { SESSION_SECRET: secret, EBS_OWNER: owner, EBS };
  const list = await call(env, '2027-sutk/bio1/index.json', owner);
  assert.equal(list.status, 200);
  assert.equal(list.headers.get('Content-Type'), 'application/json; charset=utf-8');
  assert.equal(list.headers.get('Cache-Control'), 'private, max-age=86400');
  assert.deepEqual(await list.json(), { sub: 'bio1' });
  const img = await call(env, '2027-sutk/bio1/p138-1.webp', owner);
  assert.equal(img.headers.get('Content-Type'), 'image/webp');
  assert.equal(await img.text(), 'WEBP');
  assert.equal((await call(env, '2027-sutk/bio1/p999-9.webp', owner)).status, 404);
  assert.equal((await call(env, '2027-sutk/bio1/..%2Fx', owner)).status, 404);
  assert.deepEqual(EBS.asked, ['2027-sutk/bio1/index.json', '2027-sutk/bio1/p138-1.webp', '2027-sutk/bio1/p999-9.webp']);
});
