// 풀어보기 맨 위 '다른 과목 풀기' 줄: 적어 둔 주소가 모두 실제 풀어보기 화면이고, 풀어보기 화면이 있는 과목이 빠지지 않았는지
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const learn = path.join(here, '..');
const js = fs.readFileSync(path.join(here, 'practice.js'), 'utf8');
const block = js.slice(js.indexOf('var NAV_SUBS = ['), js.indexOf('function navRow'));
const subs = [...block.matchAll(/\['([a-z0-9]+)', '([^']+)', '([^']+)'\]/g)].map((m) => ({ sub: m[1], name: m[2], file: m[3] }));

test('과목 이동 줄의 주소는 그 과목의 풀어보기 화면이다', () => {
  assert.equal(subs.length, 6);   // 국어·수학·영어·한국사·통합사회·통합과학
  for (const s of subs) {
    const html = fs.readFileSync(path.join(learn, s.file), 'utf8');
    assert.match(html, new RegExp('"subject":"' + s.sub + '"'), s.file + ' ↔ ' + s.sub);
    assert.ok(html.includes(s.name), s.file + ' 에 과목 이름 ' + s.name);
  }
});

// 2027학년도 수능까지의 선택과목(지금 수능에는 없는 과목): 메뉴에서 내렸고 주소만 살아 있다
const ARCHIVED = ['aboutSuneungPhysics1', 'aboutSuneungChem1', 'aboutSuneungBio1', 'aboutSuneungEarth1', 'aboutSuneungScience2', 'aboutSuneungSocial', 'aboutSuneungArchive'];

test('풀어보기 화면이 있는 과목은 모두 과목 이동 줄에 있다', () => {
  const pages = [];
  for (const d of fs.readdirSync(learn)) {
    const dir = path.join(learn, d);
    if (!fs.statSync(dir).isDirectory() || ARCHIVED.includes(d)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/^practice.*\.html$/.test(f)) continue;
      const m = fs.readFileSync(path.join(dir, f), 'utf8').match(/window\.SUNEUNG_PRACTICE=\{"subject":"([a-z0-9]+)"/);
      if (m) pages.push({ sub: m[1], file: d + '/' + f });
    }
  }
  assert.deepEqual(pages.map((p) => p.sub + ' ' + p.file).sort(), subs.map((s) => s.sub + ' ' + s.file).sort());
});
