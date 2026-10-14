// 사용: node scripts/viz/gen/build.mjs [batchfile…]   → public/learn/aboutMyVocab/viz/<단어>.svg 생성
// 배치 파일(b*.mjs)은 default export 로 [ [단어, 대표색, 설명, (s)=>{…}] , … ] 를 내보낸다.
// 손으로 그린 기존 장면은 건드리지 않는다(generated.json 에 적힌 단어만 덮어씀).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Scene } from './kit.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../../../public/learn/aboutMyVocab/viz');
const genFile = path.join(here, 'generated.json');
const gen = new Set(fs.existsSync(genFile) ? JSON.parse(fs.readFileSync(genFile, 'utf8')) : []);
const frameFile = path.join(here, 'frame.json');   // scripts/viz/frame.mjs 가 만든 자동 프레이밍
const frames = fs.existsSync(frameFile) ? JSON.parse(fs.readFileSync(frameFile, 'utf8')) : {};

const files = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(here).filter((f) => /^b\d+.*\.mjs$/.test(f));
let made = 0;
for (const f of files) {
  const mod = await import(path.resolve(here, f));
  for (const [word, color, label, fn, n] of mod.default) {
    const target = path.join(out, `${word}.svg`);
    if (fs.existsSync(target) && !gen.has(word)) { console.log(`skip (손그림 있음): ${word}`); continue; }
    const s = new Scene(word, { c: color, label, n: n || 3, frame: frames[word] });
    fn(s);
    fs.writeFileSync(target, s.svg());
    gen.add(word); made++;
    fs.writeFileSync(genFile, JSON.stringify([...gen].sort()));
  }
}
fs.writeFileSync(genFile, JSON.stringify([...gen].sort(), null, 0));
// index.json 재생성
const all = fs.readdirSync(out).filter((x) => x.endsWith('.svg')).map((x) => x.slice(0, -4)).sort();
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(all));
console.log(`생성 ${made}개 · index.json ${all.length}개`);
