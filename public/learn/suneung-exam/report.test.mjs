import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildReport, buildReportHtml, kstDate } = require('./report.js');

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

test('이상치(10분 초과)는 시간 통계에서 빠지고 표기만 남긴다', () => {
  const md = report({
    attempts: [
      { exam: '2026-csat', q: 1, picked: 5, ok: 1, ts: T16, ms: 10000, mode: 'exam' },
      { exam: '2026-csat', q: 2, picked: 1, ok: 0, ts: T16 + 1000, ms: 20000, mode: 'exam' },
      { exam: '2026-csat', q: 2, picked: 3, ok: 1, ts: T17, ms: 60000, mode: 'practice' },
      { exam: '2026-csat', q: 1, picked: 2, ok: 0, ts: T16b, ms: 720000, mode: 'exam' }
    ]
  });
  assert.match(md, /풀이 시간\(이상치 제외\): 중앙값 20초, 평균 30초, 측정된 시도 3회, 이상치 1회/);
  assert.match(md, /\| 30초 미만 \| 2 \| 1 \| 50% \|/);
  assert.match(md, /\| 3분 이상 \| 0 \| 0 \| 0% \|/);
  assert.match(md, /맞힌 문항 평균 35초, 틀린 문항 평균 20초/);
  const unit = chunk(md, '### 단원별 평균 풀이 시간', '### 모드별');
  assert.ok(unit.indexOf('| 유전 정보와 세포 분열 | 40 | 50% |') < unit.indexOf('| 신경계와 항상성 | 10 | 100% |'));
  assert.match(md, /\| 시험 \| 3 \| 1 \| 33\.3% \|/);
  assert.match(md, /\| 연습 \| 1 \| 1 \| 100% \|/);
  assert.match(chunk(md, '## 현재 오답', '## 반복해서 틀린 문항'), /시도 기록: 2026-10-16 ⑤✔ 10초, 2026-10-16 ② \(이상치 12분, 통계 제외\)/);
  assert.match(md, /찍기 의심\(매우 빠르고 틀림이 반복\)도 같이 판단해 줘\. 이상치 표시는 자리를 비운 시간이니 무시해 줘\./);
});

test('시간 구간 경계: 30초와 90초는 그 구간의 시작이다', () => {
  const spec = [
    [29999, 1],
    [30000, 0],
    [89999, 1],
    [90000, 0],
    [179999, 1],
    [180000, 0],
    [600000, 1],
    [600001, 0]
  ];
  const md = buildReport({
    subLabel: '생명과학Ⅰ',
    now: NOW,
    sub: 'bio1',
    exams: exams,
    partName: partName,
    attempts: spec.map(function (row, i) {
      return { exam: '2026-csat', q: i + 1, picked: 1, ok: row[1], ts: T16 + i * 1000, ms: row[0], mode: 'exam' };
    })
  });
  const bands = chunk(md, '### 시간 구간별 정답률', '### 맞힌 문항');
  assert.match(bands, /\| 30초 미만 \| 1 \| 1 \| 100% \|/);
  assert.match(bands, /\| 30~90초 \| 2 \| 1 \| 50% \|/);
  assert.match(bands, /\| 90초~3분 \| 2 \| 1 \| 50% \|/);
  assert.match(bands, /\| 3분 이상 \| 2 \| 1 \| 50% \|/);
  assert.match(md, /중앙값 90초, 평균 171초, 측정된 시도 7회, 이상치 1회/);
  assert.match(md, /이상치 10분, 통계 제외/);
});

test('ms 없는 구버전 행은 시간 통계에 넣지 않고 모드는 미기록이다', () => {
  const md = report({
    attempts: [
      { exam: '2026-csat', q: 2, picked: 4, ok: 0, ts: T16 },
      { exam: '2026-csat', q: 2, picked: 1, ok: 0, ts: T17, ms: 42000, mode: 'practice' },
      { exam: '2026-csat', q: 1, picked: 5, ok: 1, ts: T16b, ms: 30000, mode: 'exam' }
    ]
  });
  assert.match(md, /중앙값 36초, 평균 36초, 측정된 시도 2회, 이상치 0회/);
  assert.match(chunk(md, '### 시간 구간별 정답률', '### 맞힌 문항'), /\| 30~90초 \| 2 \| 1 \| 50% \|/);
  assert.match(chunk(md, '### 시간 구간별 정답률', '### 맞힌 문항'), /\| 30초 미만 \| 0 \| 0 \| 0% \|/);
  assert.match(md, /\| 시험 \| 1 \| 1 \| 100% \|/);
  assert.match(md, /\| 연습 \| 1 \| 0 \| 0% \|/);
  assert.match(md, /\| 미기록 \| 1 \| 0 \| 0% \|/);
  assert.match(chunk(md, '## 현재 오답', '## 반복해서 틀린 문항'), /시도 기록: 2026-10-16 ④, 2026-10-17 ① 42초/);
});

test('buildReportHtml 은 데이터를 이스케이프하고 문항 이미지를 넣는다', () => {
  const html = buildReportHtml({
    subLabel: '생명과학Ⅰ',
    now: NOW,
    sub: 'bio1',
    exams: [{
      key: '2026-csat',
      title: '시험 <script> & "A"',
      bio1: { a: [5], p: [2], t: ['b4'] }
    }],
    partName: { b4: "신경<'>계" },
    trap: { '2026-csat': { 1: { o: { 2: '<script>alert(1)</script>' } } } },
    explain: { '2026-csat': { 1: '<script>alert(1)</script><b>해설</b>' } },
    imgBase: 'https://img.example/',
    attempts: [{ exam: '2026-csat', q: 1, picked: 2, ok: 0, ts: T16, ms: 42000, mode: 'exam' }]
  });
  assert.equal(html.startsWith('<!doctype html>'), true);
  assert.equal(/<script/i.test(html), false);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&amp;/);
  assert.match(html, /&quot;A&quot;/);
  assert.match(html, /&#39;/);
  assert.match(html, /<img src="https:\/\/img\.example\/2026-csat\/bio1\/q01\.webp" alt="[^"]*" loading="eager">/);
  assert.match(html, /onclick="window\.print\(\)"/);
  assert.match(html, /@media print/);
  assert.match(html, /break-inside:\s*avoid/);
  assert.match(html, /max-width:\s*100%/);
  assert.match(html, /PDF로 저장/);

  const many = [];
  for (let q = 1; q <= 31; q++) many.push({ exam: '2026-csat', q: q, picked: 1, ok: 0, ts: q * 1000 });
  const manyHtml = buildReportHtml({
    subLabel: '생명과학Ⅰ',
    now: NOW,
    sub: 'bio1',
    imgBase: 'https://img.example/',
    attempts: many
  });
  assert.equal((manyHtml.match(/<img /g) || []).length, 30);
  assert.match(manyHtml, /q31\.webp/);
  assert.match(manyHtml, /q02\.webp/);
  assert.doesNotMatch(manyHtml, /q01\.webp/);
  assert.match(manyHtml, /외 1문항/);
});

test('빈 입력', () => {
  assert.equal(buildReport({ attempts: [] }), '아직 기록이 없습니다\n');
  assert.equal(buildReport(null), '아직 기록이 없습니다\n');
  const html = buildReportHtml({ attempts: [] });
  assert.equal(html.startsWith('<!doctype html>'), true);
  assert.match(html, /아직 기록이 없습니다/);
  assert.match(html, /PDF로 저장/);
  assert.match(html, /window\.print\(\)/);
  assert.doesNotMatch(html, /<img /);
  assert.equal(buildReportHtml(null).startsWith('<!doctype html>'), true);
});

test('문항 메모와 선지 표시(○△✕)는 현재 오답 상세에만 붙는다', () => {
  const notes = {
    '2026-csat/1': { m: 'o-x-t', t: '음성 피드백 방향을\n거꾸로 봄 <b>' },
    '2026-csat/2': { m: '-----', t: '맞힌 문항 메모' }
  };
  const md = report({ notes });
  const cur = chunk(md, '## 현재 오답 (문항별 최신 시도가 오답)', '## 반복해서 틀린 문항');
  assert.match(cur, /- 내 메모: 음성 피드백 방향을 \/ 거꾸로 봄 <b>/);
  assert.match(cur, /- 내 선지 표시: ①○ ③✕ ⑤△/);
  assert.doesNotMatch(md, /맞힌 문항 메모/);
  assert.doesNotMatch(report(), /내 메모|내 선지 표시/);
  const html = buildReportHtml({ subLabel: '생명과학Ⅰ', now: NOW, attempts, exams, sub: 'bio1', partName, imgBase: 'https://img.example/', notes });
  assert.match(html, /<p>내 메모: 음성 피드백 방향을 \/ 거꾸로 봄 &lt;b&gt;<\/p>/);
  assert.match(html, /<p>내 선지 표시: ①○ ③✕ ⑤△<\/p>/);
});
