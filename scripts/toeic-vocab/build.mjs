#!/usr/bin/env node
// 토익 단어장 빌드·검사
//   node scripts/toeic-vocab/build.mjs                 → 전체 검사 후 words.js · viz/index.json 생성
//   node scripts/toeic-vocab/build.mjs --check a b c   → 해당 단어의 viz/<단어>.json · .svg 만 검사 (파일 생성 없음)
// 그림 규칙은 scripts/viz/GUIDE.md, 해설 JSON 규칙은 scripts/toeic-vocab/SPEC.md.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { WORDS, THEMES, LEVELS } from './words.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PAGE = path.join(ROOT, 'public/learn/aboutToeicVocab');
const VIZ = path.join(PAGE, 'viz');
const VALIDATE = path.join(ROOT, 'scripts/validate-viz.mjs');

const args = process.argv.slice(2);
const checkOnly = args[0] === '--check';
const byWord = new Map(WORDS.map((w) => [w.w, w]));
const targets = checkOnly ? args.slice(1).map((s) => s.toLowerCase()) : WORDS.map((w) => w.w);

const isStr = (v, min = 1) => typeof v === 'string' && v.trim().length >= min;
const HANGUL = /[가-힣]/;

function checkJson(word, j, n) {
  const e = [];
  if (j.w !== word) e.push(`"w"는 "${word}"`);
  if (!isStr(j.e, 6)) e.push('"e"(어원) 필요');
  else {
    if (!j.e.includes(' → ')) e.push('"e"는 "어근(뜻) + 어근(뜻) → 풀이 → 뜻" 형식(" → " 포함)');
    if (/[\n<>]/.test(j.e)) e.push('"e"에 줄바꿈·꺾쇠 금지');
  }
  if (!isStr(j.note, 4) || !HANGUL.test(j.note)) e.push('"note"(빈출 표현 + 한국어 뜻) 필요');
  if (!isStr(j.icon) || j.icon.length > 8 || /[A-Za-z0-9가-힣]/.test(j.icon)) e.push('"icon"은 이모지 1개');
  if (!/^\/[^/]+\/$/.test(j.ipa || '')) e.push('"ipa"는 "/.../" 형식');
  if (!isStr(j.tag, 2)) e.push('"tag" 필요');
  if (!isStr(j.lead, 10) || !HANGUL.test(j.lead)) e.push('"lead"(한국어 한두 문장) 필요');
  if (!Array.isArray(j.steps) || j.steps.length < 2 || j.steps.length > 5) e.push('"steps"는 2~5개');
  else {
    if (n && j.steps.length !== n) e.push(`"steps" 개수(${j.steps.length}) ≠ SVG data-n(${n})`);
    j.steps.forEach((s, i) => {
      if (!Array.isArray(s) || s.length < 2 || s.length > 3 || !s.every((x) => isStr(x))) e.push(`steps[${i}]는 ["제목", "설명", "예문(선택)"]`);
      else if (!HANGUL.test(s[1])) e.push(`steps[${i}] 설명은 한국어`);
    });
  }
  if (!Array.isArray(j.ex) || j.ex.length !== 2 || !isStr(j.ex[0], 8) || !isStr(j.ex[1], 4)) e.push('"ex"는 ["영어 예문", "한국어 해석"]');
  else if (!new RegExp(`\\b${word.slice(0, Math.max(4, word.length - 3))}`, 'i').test(j.ex[0])) e.push('"ex" 영어 예문에 표제어(또는 변화형)가 들어가야 함');
  if (!Array.isArray(j.rel) || j.rel.length < 2 || j.rel.length > 4 || !j.rel.every((r) => Array.isArray(r) && r.length === 2 && isStr(r[0]) && isStr(r[1]))) e.push('"rel"은 [["단어", "뜻"], …] 2~4개');
  return e;
}

// SVG 일괄 검사 (validate-viz.mjs 재사용) — 실패한 파일 이름 → 오류 목록
function validateSvgs(files) {
  const bad = new Map();
  if (!files.length) return bad;
  let out = '';
  try { out = execFileSync('node', [VALIDATE, ...files], { encoding: 'utf8' }); } catch (err) { out = String(err.stdout || ''); }
  let cur = null;
  out.split('\n').forEach((line) => {
    const m = line.match(/^✗ (.+)\.svg/);
    if (m) { cur = m[1]; bad.set(cur, []); return; }
    const d = line.match(/^\s+- (.*)/);
    if (d && cur) bad.get(cur).push(d[1]);
  });
  return bad;
}

const unknown = targets.filter((w) => !byWord.has(w));
if (unknown.length) console.log(`⚠ 목록에 없는 단어: ${unknown.join(', ')}`);

const svgFiles = targets.filter((w) => fs.existsSync(path.join(VIZ, `${w}.svg`))).map((w) => path.join(VIZ, `${w}.svg`));
const svgBad = validateSvgs(svgFiles);

const ok = new Set();
const report = [];
const missing = [];
const data = new Map();
for (const w of targets) {
  if (!byWord.has(w)) continue;
  const svgPath = path.join(VIZ, `${w}.svg`), jsonPath = path.join(VIZ, `${w}.json`);
  const hasSvg = fs.existsSync(svgPath), hasJson = fs.existsSync(jsonPath);
  if (!hasSvg && !hasJson) { missing.push(w); continue; }
  const errs = [];
  let n = 0;
  if (!hasSvg) errs.push('SVG 없음');
  else {
    const src = fs.readFileSync(svgPath, 'utf8');
    n = Number((src.match(/data-n="(\d+)"/) || [])[1]) || 0;
    (svgBad.get(w) || []).forEach((x) => errs.push('SVG: ' + x));
  }
  if (!hasJson) errs.push('JSON 없음');
  else {
    let j = null;
    try { j = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch (err) { errs.push('JSON 문법 오류: ' + err.message); }
    if (j) { checkJson(w, j, n).forEach((x) => errs.push('JSON: ' + x)); data.set(w, j); }
  }
  if (errs.length) report.push(`✗ ${w}\n   - ${errs.join('\n   - ')}`);
  else ok.add(w);
}

if (report.length) console.log(report.join('\n'));
const tried = targets.filter((w) => byWord.has(w) && !missing.includes(w)).length;
console.log(`${ok.size}/${tried} 통과` + (missing.length ? ` · 아직 없음 ${missing.length}개${checkOnly ? ': ' + missing.join(', ') : ''}` : ''));

if (checkOnly) process.exit(report.length || (checkOnly && missing.length) ? 1 : 0);

// ── 빌드: 카드용 데이터(words.js)와 그림 해설 목록(viz/index.json) ──
const cards = WORDS.map((x) => {
  const j = data.get(x.w) || {};
  const o = { w: x.w, pos: x.pos, m: x.m, e: j.e || '', lv: x.lv, t: x.t };
  if (j.note) o.note = j.note;
  if (j.icon) o.icon = j.icon;
  return o;
});
const js = `/* 자동 생성 파일 — 고치지 말고 scripts/toeic-vocab/words.mjs · viz/<단어>.json 을 고친 뒤
   node scripts/toeic-vocab/build.mjs 를 실행하세요. */
window.TOEIC = ${JSON.stringify({
  levels: LEVELS,
  themes: THEMES.map((t) => ({ key: t.key, label: t.label })),
  words: cards,
}, null, 0).replace(/\},\{"w"/g, '},\n{"w"')};
`;
fs.writeFileSync(path.join(PAGE, 'words.js'), js);
fs.mkdirSync(VIZ, { recursive: true });
fs.writeFileSync(path.join(VIZ, 'index.json'), JSON.stringify(WORDS.map((x) => x.w).filter((w) => ok.has(w))) + '\n');
console.log(`words.js(${cards.length}단어) · viz/index.json(${ok.size}개) 생성`);
