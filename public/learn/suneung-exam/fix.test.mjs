// 다시 자른 문항 그림(fix/): practice.js 의 IMG_FIX 목록과 fix/ 폴더의 파일이 하나씩 맞는지
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const js = fs.readFileSync(path.join(here, 'practice.js'), 'utf8');
const block = js.slice(js.indexOf('var IMG_FIX = {'), js.indexOf('function imgFixed'));
const listed = [];
for (const m of block.matchAll(/(\w+): '([^']*)'/g)) for (const x of m[2].split(' ').filter(Boolean)) {
  const [key, n] = x.split('/');
  listed.push(`${key}/${m[1]}/q${String(n).padStart(2, '0')}.webp`);
}
const files = [];
(function walk(d, rel) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, rel ? rel + '/' + f : f);
    else files.push(rel + '/' + f);
  }
})(path.join(here, 'fix'), '');

test('IMG_FIX 목록과 fix/ 파일이 서로 빠짐없이 맞는다', () => {
  assert.ok(listed.length > 100);
  assert.equal(new Set(listed).size, listed.length, '겹친 항목 없음');
  assert.deepEqual([...listed].sort(), [...files].sort());
});

test('다시 자른 그림의 폭이 ①~⑤ 자리 표(hot/)에 적힌 폭과 같다', () => {
  for (const f of files) {
    const [key, sub, q] = f.split('/');
    const hot = JSON.parse(fs.readFileSync(path.join(here, 'hot', sub + '.json'), 'utf8'));
    const e = hot[key] && hot[key][String(parseInt(q.slice(1), 10))];
    if (!e) continue;
    const b = fs.readFileSync(path.join(here, 'fix', f));
    // WebP(VP8 손실): 'VP8 ' 조각의 26~29번째 바이트가 폭·높이(14비트)
    assert.equal(b.toString('ascii', 12, 16), 'VP8 ', f + ' 형식');
    const w = b.readUInt16LE(26) & 0x3fff, h = b.readUInt16LE(28) & 0x3fff;
    assert.deepEqual([w, h], [e[0], e[1]], f + ' 크기');
  }
});
