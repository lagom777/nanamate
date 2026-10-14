#!/usr/bin/env node
// 생성 장면 자동 프레이밍: node scripts/viz/frame.mjs [단어…]  → scripts/viz/gen/frame.json, 이어서 build.mjs 를 돌리면 적용된다.
// 모든 단계(이동 시작 자리·반복 움직임 포함)의 그림이 차지하는 영역을 브라우저로 재서, 잘리지 않는 한도(최대 ZMAX배)에서
// 주인공이 화면을 채우도록 확대한다. 작은 폰 화면에서 사람 얼굴·소품이 읽히게 하려는 것. 배경은 확대해도 화면을 덮는다.
// 크롬이 따로 있으면 CHROME=/경로 로 지정.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ZMAX = 1.4, M = 12, ZMIN = 1.06;
const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(here, '../../public/learn/aboutMyVocab');
const genDir = path.join(here, 'gen');
const frameFile = path.join(genDir, 'frame.json');
const generated = JSON.parse(fs.readFileSync(path.join(genDir, 'generated.json'), 'utf8'));
const words = process.argv.slice(2).length ? process.argv.slice(2) : generated;
const frames = fs.existsSync(frameFile) ? JSON.parse(fs.readFileSync(frameFile, 'utf8')) : {};
const style = fs.readFileSync(path.join(app, 'index.html'), 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];

/* 그림 영역 u=[x0,y0,x1,y1] → [배율, x이동, y이동] (가운데 맞춤, 배경이 화면 밖으로 밀려 빈 곳이 생기지 않게) */
function fit(u) {
  const [x0, y0, x1, y1] = u;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  for (let z = Math.min(ZMAX, (560 - 2 * M) / (x1 - x0), (300 - 2 * M) / (y1 - y0)); z >= ZMIN; z -= 0.01) {
    const tx = clamp(280 - (z * (x0 + x1)) / 2, 560 * (1 - z), 0);
    const ty = clamp(150 - (z * (y0 + y1)) / 2, 300 * (1 - z), 0);
    if (z * x0 + tx >= M - 0.5 && z * x1 + tx <= 560 - M + 0.5 && z * y0 + ty >= M - 0.5 && z * y1 + ty <= 300 - M + 0.5)
      return [+z.toFixed(2), Math.round(tx), Math.round(ty)];
  }
  return null;
}

/* 페이지 안에서: 단계 0…n 각각과, 그 단계에 출발하는 .mv 의 출발 자리까지 합친 그림 영역 */
function measure() {
  const scene = document.querySelector('.vz-scene'), svg = scene.querySelector('svg');
  const clip = svg.querySelector(':scope > g[clip-path]');
  const wrap = clip.children.length === 1 && clip.firstElementChild.tagName === 'g' && /scale\(/.test(clip.firstElementChild.getAttribute('transform') || '') ? clip.firstElementChild : null;
  if (wrap) wrap.removeAttribute('transform');   // 이미 프레이밍된 파일이면 원래 좌표로 잰다
  const n = +svg.dataset.n;
  const R0 = svg.getBoundingClientRect(), k = 560 / R0.width;
  const shown = (el) => { for (let p = el; p && p !== svg; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.display === 'none' || +cs.opacity === 0) return false; } return true; };
  let u = null, ground = 300;
  const add = (a) => { u = u ? [Math.min(u[0], a[0]), Math.min(u[1], a[1]), Math.max(u[2], a[2]), Math.max(u[3], a[3])] : a; };
  const scan = () => {
    for (const el of svg.querySelectorAll('path,circle,ellipse,rect,polygon,polyline,line')) {
      if (el.closest('defs,clipPath') || !shown(el)) continue;
      const r = el.getBoundingClientRect();
      let x0 = (r.left - R0.left) * k, y0 = (r.top - R0.top) * k, x1 = (r.right - R0.left) * k, y1 = (r.bottom - R0.top) * k;
      if (x1 - x0 >= 500) { if (y0 > 150 && y0 < 290) ground = Math.min(ground, y0); continue; }   // 하늘·땅·물 띠
      if (y1 - y0 >= 270) continue;
      const faint = +(el.getAttribute('fill-opacity') ?? 1) * +(el.getAttribute('opacity') ?? 1) < 0.5 && !el.hasAttribute('stroke');
      if (faint || (el.tagName === 'circle' && x1 - x0 > 150)) continue;   // 그림자·후광은 잘려도 된다
      const a = el.closest('.a-fall,.a-drip,.a-rise,.a-flow,.a-slide');
      if (a) { if (a.matches('.a-fall,.a-drip')) { y0 -= 14; y1 += 26; } else if (a.matches('.a-rise')) { y0 -= 34; y1 += 14; } else x0 -= 30; }
      add([x0, y0, x1, y1]);
    }
  };
  const set = (s) => { svg.querySelectorAll('[data-s]').forEach((el) => { const a = +el.dataset.s, b = el.dataset.e ? +el.dataset.e : n; el.classList.toggle('in', s >= a && s <= b); }); void scene.offsetWidth; };
  for (let s = 0; s <= n; s++) {
    set(s); scan();
    const mv = [...svg.querySelectorAll(`.mv[data-s="${s}"]`)];
    if (mv.length) { mv.forEach((el) => el.classList.remove('in')); void scene.offsetWidth; scan(); }
  }
  if (u && ground < 300) u[3] = Math.max(u[3], ground + 16);   // 땅이 보이던 장면은 땅이 한 줄은 남게
  return u;
}

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await browser.newPage({ viewport: { width: 600, height: 400 } });
let changed = 0;
for (const w of words) {
  const svg = fs.readFileSync(path.join(app, 'viz', `${w}.svg`), 'utf8');
  await page.setContent(`<style>${style}</style><div style="width:560px"><div class="vz pic"><div class="vz-scene vz-reset">${svg}</div></div></div>`);
  const u = await page.evaluate(measure);
  const f = u && fit(u);
  if (JSON.stringify(frames[w] || null) !== JSON.stringify(f)) changed++;
  if (f) frames[w] = f; else delete frames[w];
}
await browser.close();
fs.writeFileSync(frameFile, JSON.stringify(Object.fromEntries(Object.entries(frames).sort()), null, 0).replace(/\],"/g, '],\n"') + '\n');
console.log(`프레이밍 ${Object.keys(frames).length}개(이번에 바뀐 것 ${changed}개) → ${path.relative(process.cwd(), frameFile)}`);
