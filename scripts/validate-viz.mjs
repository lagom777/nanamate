#!/usr/bin/env node
// 영단어장 '그림만 해설' SVG 검증: node scripts/validate-viz.mjs <dir-or-file...>
// 규칙은 public/learn/aboutMyVocab/viz/GUIDE.md 참고.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const CLASSES = new Set(['vs', 'up', 'pop', 'wipe', 'wipe-d', 'draw', 'mv', 'a-fall', 'a-drip', 'a-rise', 'a-dash', 'a-bob', 'a-flap', 'a-pulse', 'a-slide', 'a-flow', 'a-flip', 'a-press']);
const TRANSFORM_CLASSES = new Set(['up', 'pop', 'mv', 'a-fall', 'a-drip', 'a-rise', 'a-bob', 'a-flap', 'a-pulse', 'a-slide', 'a-flow', 'a-flip', 'a-press']);
const BAD_TAGS = new Set(['text', 'tspan', 'foreignobject', 'script', 'image', 'style', 'iframe', 'use', 'animate', 'animatetransform', 'animatemotion', 'set']);

function check(file) {
  const errs = [];
  const word = path.basename(file, '.svg');
  const src = fs.readFileSync(file, 'utf8');
  try { execFileSync('xmllint', ['--noout', file], { stdio: 'pipe' }); } catch (e) { return ['XML 문법 오류: ' + String(e.stderr || e.message).split('\n')[0]]; }
  if (src.length > 16000) errs.push(`용량 ${src.length}B > 16000B`);
  const tags = [...src.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/g)].map(m => ({ tag: m[1].toLowerCase(), attrs: m[2] }));
  const attr = (a, name) => { const m = a.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`)); return m ? m[1] : null; };
  const root = tags[0];
  if (!root || root.tag !== 'svg') return ['첫 태그가 <svg>가 아님'];
  if (attr(root.attrs, 'viewBox') !== '0 0 560 300') errs.push('viewBox는 "0 0 560 300"');
  if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(root.attrs)) errs.push('xmlns 누락');
  const n = Number(attr(root.attrs, 'data-n')), t = Number(attr(root.attrs, 'data-t')), c = attr(root.attrs, 'data-c');
  if (!Number.isInteger(n) || n < 2 || n > 5) errs.push('data-n은 2~5의 정수');
  if (!(t >= 1.5 && t <= 4)) errs.push('data-t는 1.5~4(초)');
  if (!/^#[0-9a-fA-F]{6}$/.test(c || '')) errs.push('data-c는 #rrggbb');
  const ids = new Set(), refs = [];
  const stepHas = new Set();
  tags.forEach(({ tag, attrs }, i) => {
    if (BAD_TAGS.has(tag)) errs.push(`금지 태그 <${tag}>`);
    if (/\son[a-z]+=/.test(' ' + attrs)) errs.push('이벤트 속성 금지');
    if (/(href|src)="(?!#)/.test(attrs)) errs.push('외부 링크 금지');
    const id = attr(attrs, 'id');
    if (id) { ids.add(id); if (!id.startsWith(word + '_')) errs.push(`id "${id}"는 "${word}_"로 시작해야 함`); }
    for (const m of attrs.matchAll(/url\(#([^)]+)\)/g)) refs.push(m[1]);
    const cls = (attr(attrs, 'class') || '').split(/\s+/).filter(Boolean);
    cls.forEach(k => { if (!CLASSES.has(k)) errs.push(`알 수 없는 클래스 "${k}"`); });
    const s = attr(attrs, 'data-s'), e = attr(attrs, 'data-e');
    if (s !== null) {
      const sn = Number(s);
      if (!Number.isInteger(sn) || sn < 1 || sn > n) errs.push(`data-s="${s}" 범위 오류(1~${n})`);
      else stepHas.add(sn);
    }
    if (e !== null) { const en = Number(e); if (!Number.isInteger(en) || en < Number(s) || en > n) errs.push(`data-e="${e}" 범위 오류`); }
    if (cls.includes('vs') && s === null) errs.push('.vs 요소에 data-s 없음');
    if (cls.includes('mv') && s === null) errs.push('.mv 요소에 data-s 없음');
    if (cls.includes('draw') && attr(attrs, 'pathLength') !== '1') errs.push('.draw 요소는 pathLength="1" 필요');
    if (cls.some(k => TRANSFORM_CLASSES.has(k)) && attr(attrs, 'transform') !== null) errs.push(`transform 속성과 애니메이션 클래스(${cls.join(' ')})를 한 요소에 같이 쓰면 CSS가 덮어씀 — 바깥 <g transform>으로 분리`);
    if ((cls.includes('wipe') || cls.includes('wipe-d')) && attr(attrs, 'clip-path') !== null) errs.push('wipe 요소에 clip-path 속성 금지(바깥 <g>로 분리)');
  });
  refs.forEach(r => { if (!ids.has(r)) errs.push(`url(#${r}) 참조 대상 없음`); });
  for (let k = 2; k <= n; k++) if (!stepHas.has(k)) errs.push(`${k}단계에 새로 나타나는 요소(data-s="${k}")가 없음`);
  return [...new Set(errs)];
}

const targets = process.argv.slice(2).flatMap(p => fs.statSync(p).isDirectory()
  ? fs.readdirSync(p).filter(f => f.endsWith('.svg') && !f.startsWith('_')).map(f => path.join(p, f))
  : [p]);
let bad = 0;
for (const f of targets) {
  const errs = check(f);
  if (errs.length) { bad++; console.log(`✗ ${path.basename(f)}\n   - ${errs.join('\n   - ')}`); }
}
console.log(`${targets.length - bad}/${targets.length} 통과`);
process.exit(bad ? 1 : 0);
