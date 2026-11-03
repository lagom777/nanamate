/* shared/daily.js 순수 로직 단위 테스트 — node --test shared/daily.test.mjs
   daily.js를 텍스트로 읽어 new Function으로 인스턴스화한다.
   document=undefined → 자동 init 스킵. winStub이 localStorage(Map)와
   location.search(?nmdate= 날짜 훅)를 제공한다. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('./daily.js', import.meta.url), 'utf8');

/** 격리된 daily 인스턴스 + winStub 반환. search로 오늘 날짜(?nmdate=) 주입. */
function load(search) {
  const store = new Map();
  const win = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); }
    },
    location: { search: search || '' }
  };
  new Function('window', 'document', src)(win, undefined);
  return { D: win.NanamateDaily, win };
}

test('mulberry32: 같은 시드 재현 + 출력 [0,1)', () => {
  const { D } = load();
  const a = D.mulberry32(12345), b = D.mulberry32(12345);
  for (let i = 0; i < 8; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
  assert.notEqual(D.mulberry32(1)(), D.mulberry32(2)());
});

test('seedFrom: 동일 입력 안정 + salt 민감', () => {
  const { D } = load();
  assert.equal(D.seedFrom('2026-07-08', 'ENGLISH'), D.seedFrom('2026-07-08', 'ENGLISH'));
  assert.notEqual(D.seedFrom('2026-07-08', 'ENGLISH'), D.seedFrom('2026-07-08', 'ENGLISH-quiz'));
});

test('pickDaily: 결정적 · n개 · 원본 불변', () => {
  const { D } = load();
  const bank = Array.from({ length: 20 }, (_, i) => ({ id: i }));
  const snapshot = bank.map((x) => ({ ...x }));
  const a = D.pickDaily(bank, 5, 'S', '2026-07-08');
  assert.deepEqual(a, D.pickDaily(bank, 5, 'S', '2026-07-08'));
  assert.equal(a.length, 5);
  assert.notDeepEqual(a, D.pickDaily(bank, 5, 'S', '2026-07-09'));
  assert.deepEqual(bank, snapshot);
});

test('dayNumber: epoch 당일=1, +7일=8', () => {
  const { D } = load();
  assert.equal(D.dayNumber('2026-07-01', '2026-07-01'), 1);
  assert.equal(D.dayNumber('2026-07-01', '2026-07-08'), 8);
});

test('daySlice: totalDays · 인덱스 · 순환 · 빈 은행', () => {
  const { D } = load();
  const bank = Array.from({ length: 25 }, (_, i) => i);
  const s = D.daySlice(bank, 10, '2026-07-01', '2026-07-01');
  assert.equal(s.totalDays, 3); // ceil(25/10)
  assert.equal(s.day, 1);
  assert.deepEqual(s.items, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(D.daySlice(bank, 10, '2026-07-01', '2026-07-02').day, 2);
  for (const date of ['2026-06-01', '2027-05-01', '2024-01-01']) {
    const r = D.daySlice(bank, 10, '2026-07-01', date);
    assert.ok(r.day >= 1 && r.day <= r.totalDays); // 음수/큰 오프셋도 범위 내
  }
  assert.deepEqual(D.daySlice([], 10, '2026-07-01', '2026-07-01'), { day: 1, totalDays: 0, items: [] });
});

test('markDone: 스트릭/best/멱등 + getState 기본값 + storageKey 대문자', () => {
  const { D, win } = load('?nmdate=2026-07-01');
  assert.deepEqual(D.getState('MATH'), { streak: 0, lastDone: null, totalDone: 0, best: null });
  assert.equal(D.storageKey('english'), 'NANAMATE_DAILY_ENGLISH');

  let s = D.markDone('MATH', 5);
  assert.deepEqual([s.streak, s.totalDone, s.best], [1, 1, 5]);

  s = D.markDone('MATH', 9); // 같은 날 재호출 → 멱등
  assert.deepEqual([s.streak, s.totalDone, s.best], [1, 1, 5]);

  win.location.search = '?nmdate=2026-07-02'; // 연속일 → streak+1, best=max
  s = D.markDone('MATH', 3);
  assert.deepEqual([s.streak, s.totalDone, s.best], [2, 2, 5]);

  win.location.search = '?nmdate=2026-07-05'; // 건너뜀 → streak=1
  s = D.markDone('MATH', 10);
  assert.deepEqual([s.streak, s.totalDone, s.best], [1, 3, 10]);
});
