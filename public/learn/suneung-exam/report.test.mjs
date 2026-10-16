import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildReport, kstDate } = require('./report.js');

const T16 = Date.UTC(2026, 9, 15, 15, 0, 0);
const T16b = Date.UTC(2026, 9, 16, 14, 30, 0);
const T17 = Date.UTC(2026, 9, 16, 15, 0, 0);
const NOW = Date.UTC(2026, 9, 17, 15, 0, 0);

const exams = [{
  key: '2026-csat',
  title: '2026학년도 대학수학능력시험',
  bio1: {
    a: [5, 3],
    p: [2, 3],
    t: ['b4', 'b6']
  }
}];
const partName = { b4: '신경계와 항상성', b6: '유전 정보와 세포 분열' };
const attempts = [
  { exam: '2026-csat', q: 1, picked: 3, ok: 0, ts: T16 },
  { exam: '2026-csat', q: 2, picked: 1, ok: 0, ts: T16 + 1000 },
  { exam: '2026-csat', q: 1, picked: 2, ok: 0, ts: T16b },
  { exam: '2026-csat', q: 2, picked: 3, ok: 1, ts: T17 }
];

function report(extra) {
  return buildReport(Object.assign({
    subLabel: '생명과학Ⅰ',
    now: NOW,
    attempts: attempts,
    exams: exams,
    sub: 'bio1',
    partName: partName,
    trap: { '2026-csat': { 1: { ans: 5, o: { 2: '부교감이라고 착각', 3: '교감으로 봄' } } } },
    explain: { '2026-csat': { 1: '<p><b>음성 피드백</b>입니다. TSH는 &amp; 억제됩니다.</p>' } },
    imgBase: 'https://img.example/'
  }, extra));
}

function chunk(md, start, end) {
  const i = md.indexOf(start);
  assert.ok(i >= 0, start);
  const from = i + start.length;
  const j = end ? md.indexOf(end, from) : md.length;
  return md.slice(from, j < 0 ? md.length : j);
}

test('단원별 정답률은 최신 시도 기준, 낮은 순', () => {
  const md = report();
  const unit = chunk(md, '### 단원별 (시도 문항 기준 최신 시도 정오)', '### 날짜별');
  const low = unit.indexOf('| 신경계와 항상성 | 1 | 0 | 0% |');
  const high = unit.indexOf('| 유전 정보와 세포 분열 | 1 | 1 | 100% |');
  assert.ok(low >= 0 && high > low);
  assert.match(md, /\| 2026-10-16 \| 3 \| 0 \| 0% \|/);
  assert.match(md, /\| 2026-10-17 \| 1 \| 1 \| 100% \|/);
  assert.ok(md.indexOf('| 2026-10-16 |') < md.indexOf('| 2026-10-17 |'));
  assert.match(md, /기간: 2026-10-16 ~ 2026-10-17, 총 시도 4회\(문항 2개\), 현재 오답 1개/);
  assert.match(md, /^# 수능 생명과학Ⅰ 오답 분석 자료 \(2026-10-18\)/m);
});

test('반복 오답과 고친 문항을 나눈다', () => {
  const md = report();
  const again = chunk(md, '## 반복해서 틀린 문항 (오답 시도 2회 이상)', '## 틀렸다가 고친 문항');
  const fixed = chunk(md, '## 틀렸다가 고친 문항', '');
  assert.match(again, /2026학년도 대학수학능력시험 1번 · 오답 2회 · ③, ②/);
  assert.doesNotMatch(again, /2번/);
  assert.match(fixed, /2026학년도 대학수학능력시험 2번 · 오답 1회 후 맞춤/);
  assert.doesNotMatch(fixed, /1번/);
});

test('현재 오답은 문항별 최신 시도가 틀린 것만', () => {
  const md = report();
  const cur = chunk(md, '## 현재 오답 (문항별 최신 시도가 오답)', '## 반복해서 틀린 문항');
  assert.match(cur, /### 2026학년도 대학수학능력시험 1번 · 신경계와 항상성 · 2점/);
  assert.doesNotMatch(cur, /### 2026학년도 대학수학능력시험 2번/);
  assert.match(cur, /시도 기록: 2026-10-16 ③, 2026-10-16 ②/);
  assert.match(cur, /내가 고른 답\(최신\): ② \/ 정답: ⑤/);
  assert.match(cur, /왜 이 선지를 골랐을까: 부교감이라고 착각/);
  assert.match(cur, /정답 해설: 음성 피드백입니다\. TSH는 & 억제됩니다\./);
  assert.match(cur, /문항 이미지: https:\/\/img\.example\/2026-csat\/bio1\/q01\.webp/);
  assert.match(md, /> 아래는 내 수능 생명과학Ⅰ 풀이 기록이다\. 단원별 약점/);
});

test('KST 날짜는 UTC 15:00에 다음 날로 넘어간다', () => {
  assert.equal(kstDate(Date.UTC(2026, 9, 16, 14, 59, 59, 999)), '2026-10-16');
  assert.equal(kstDate(Date.UTC(2026, 9, 16, 15, 0, 0)), '2026-10-17');
  assert.equal(kstDate(Date.UTC(2026, 9, 15, 15, 0, 0)), '2026-10-16');
});

test('시도가 없으면 한 줄만', () => {
  assert.equal(buildReport({ subLabel: '생명과학Ⅰ', now: NOW, attempts: [] }), '아직 기록이 없습니다\n');
  assert.equal(buildReport({ attempts: null }), '아직 기록이 없습니다\n');
  assert.equal(buildReport({}), '아직 기록이 없습니다\n');
});

test('정답 시도 ✔, 단답형은 숫자이고 trap 을 빼며, 복수정답은 ok 만 본다', () => {
  const a = Array(30).fill(1);
  a[0] = [1, 5];
  a[15] = 42;
  const md = buildReport({
    subLabel: '수학',
    now: NOW,
    sub: 'math',
    exams: [{
      key: '2026-sep',
      title: '2026학년도 9월 모의평가',
      math: { a: a, p: Array(30).fill(4), t: Array(30).fill('a1'), n: [16] }
    }],
    partName: { a1: '지수와 로그' },
    trap: {
      '2026-sep': {
        1: { o: { 1: '선지 함정' } },
        16: { o: { 7: '단답 함정은 보이지 않는다' } }
      }
    },
    attempts: [
      { exam: '2026-sep', q: 1, picked: 4, ok: 1, ts: T16 },
      { exam: '2026-sep', q: 1, picked: 1, ok: 0, ts: T17 },
      { exam: '2026-sep', q: 16, picked: 7, ok: 0, ts: T17 + 1 }
    ],
    imgBase: 'https://img.example/'
  });
  const cur = chunk(md, '## 현재 오답 (문항별 최신 시도가 오답)', '## 반복해서 틀린 문항');
  assert.match(cur, /16번 · 지수와 로그 · 4점/);
  assert.match(cur, /내가 고른 답\(최신\): 7 \/ 정답: 42/);
  assert.doesNotMatch(cur, /단답 함정은 보이지 않는다/);
  assert.match(cur, /1번 · 지수와 로그 · 4점/);
  assert.match(cur, /시도 기록: 2026-10-16 ④✔, 2026-10-17 ①/);
  assert.match(cur, /내가 고른 답\(최신\): ① \/ 정답: ① 또는 ⑤/);
  assert.match(cur, /왜 이 선지를 골랐을까: 선지 함정/);
  assert.match(md, /q01\.webp/);
  assert.match(md, /q16\.webp/);
});

test('해설은 태그를 지우고 400자에서 자르고, 오답 61개면 60개만 펼친다', () => {
  const long = buildReport({
    subLabel: '생명과학Ⅰ',
    now: NOW,
    sub: 'bio1',
    exams: exams,
    partName: partName,
    explain: { '2026-csat': { 1: '<p>' + '가'.repeat(450) + '</p><b>끝</b>' } },
    attempts: [{ exam: '2026-csat', q: 1, picked: 1, ok: 0, ts: T16 }]
  });
  const line = long.split('\n').find((l) => l.startsWith('- 정답 해설:'));
  assert.equal(line.slice('- 정답 해설: '.length), '가'.repeat(400));
  assert.equal(long.includes('<p>'), false);
  assert.equal(long.includes('끝'), false);

  const many = [];
  for (let q = 1; q <= 61; q++) many.push({ exam: '2026-csat', q: q, picked: 1, ok: 0, ts: q * 1000 });
  const md = buildReport({ subLabel: '생명과학Ⅰ', now: NOW, sub: 'bio1', attempts: many });
  const heads = md.match(/^### 2026-csat .+$/gm);
  assert.equal(heads.length, 60);
  assert.equal(heads[0], '### 2026-csat 61번');
  assert.equal(heads[59], '### 2026-csat 2번');
  assert.match(md, /^외 1문항$/m);
  assert.match(md, /현재 오답 61개/);
});

test('두 번 틀린 뒤 맞추면 반복과 고친 문항에 모두 들어가고 현재 오답은 아니다', () => {
  const md = buildReport({
    subLabel: '물리학Ⅰ',
    now: NOW,
    sub: 'phys1',
    exams: [{ key: '2026-csat', title: '2026학년도 대학수학능력시험', phys1: { a: [2], p: [3], t: ['p1'] } }],
    partName: { p1: '힘과 운동' },
    attempts: [
      { exam: '2026-csat', q: 1, picked: 1, ok: 0, ts: T16 },
      { exam: '2026-csat', q: 1, picked: 3, ok: 0, ts: T16b },
      { exam: '2026-csat', q: 1, picked: 2, ok: 1, ts: T17 }
    ]
  });
  assert.match(chunk(md, '## 반복해서 틀린 문항', '## 틀렸다가 고친 문항'), /오답 2회 · ①, ③/);
  assert.match(chunk(md, '## 틀렸다가 고친 문항', ''), /오답 2회 후 맞춤/);
  assert.match(chunk(md, '## 현재 오답', '## 반복해서 틀린 문항'), /없음/);
  assert.doesNotMatch(md, /^### 2026/m);
});
