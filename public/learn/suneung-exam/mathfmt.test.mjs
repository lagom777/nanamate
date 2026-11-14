// 저장된 해설의 식 다듬기(mathfmt.js): 값이 달라지지 않는 꼴만 위아래 분수로 바꾼다.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { format } = require('./mathfmt.js');
// 분수를 ⟦분자⟋분모⟧ 로 적어 읽기 쉽게
const show = (t, o) => format(t, o || {}).replace(/<span class="mf"><span class="mf-n">/g, '⟦').replace(/<\/span><span class="mf-s">\/<\/span><span class="mf-d">/g, '⟋').replace(/<\/span><\/span>/g, '⟧').replace(/ /g, ' ');

test('분수로 바꾸는 꼴', () => {
  assert.equal(show('t=3L/(4v)'), 't = ⟦3L⟋4v⟧');
  assert.equal(show('(1/2)(2m)v<sup>2</sup>=18mgh'), '⟦1⟋2⟧(2m)v<sup>2</sup> = 18mgh');
  assert.equal(show('L=(v+5v/3)/2×t'), 'L = ⟦v+⟦5v⟋3⟧⟋2⟧ × t');
  assert.equal(show('F=m(2v)/(2t)=mv/t'), 'F = ⟦m(2v)⟋2t⟧ = ⟦mv⟋t⟧');
  assert.equal(show('v<sub>B</sub>/v<sub>C</sub>=3/2'), '⟦v<sub>B</sub>⟋v<sub>C</sub>⟧ = ⟦3⟋2⟧');
  assert.equal(show('1/√2'), '⟦1⟋√2⟧');
  assert.equal(show('4v²/a + 8a′v²/a².'), '⟦4v²⟋a⟧ + ⟦8a′v²⟋a²⟧.');
  assert.equal(show('f = |ΔE|/h이고'), 'f = ⟦|ΔE|⟋h⟧이고');
  assert.equal(show('sin45°/sin30° = √2'), '⟦sin45°⟋sin30°⟧ = √2');
  assert.equal(show('F = Δp/Δt.'), 'F = ⟦Δp⟋Δt⟧.');
  assert.equal(show('sin(πt/2)'), 'sin(⟦πt⟋2⟧)');            // 함수의 괄호는 남긴다
  assert.equal(show('3g/5(빗면 아래)'), '⟦3g⟋5⟧(빗면 아래)');   // 한글 괄호는 식이 아니다
  assert.equal(show('(m/h)v'), '⟦m⟋h⟧v');
  assert.equal(show('= m<sub>A</sub>g sinθ/(m<sub>A</sub>+m<sub>B</sub>)'), '= ⟦m<sub>A</sub>g sinθ⟋m<sub>A</sub>+m<sub>B</sub>⟧');   // 빈칸 뒤 sin 은 앞의 곱과 한 분자                    // 괄호 안에 혼자 있으면 단위가 아니라 식
});

test('값이 달라질 수 있거나 분수가 아닌 것은 그대로', () => {
  for (const t of ['K = p<sup>2</sup>/2m', 'v/2a', 'h/mv', 'a/b/c', '20 cm/s', '속력은 2 m/s', '6월/9월 모의평가', 'A|B 또는 C', '|dΦ/dt|에 비례']) assert.equal(show(t), t, t);
  assert.equal(show('4 m / 2 s = 2 m/s'), '4 m / 2 s = 2 m/s');
});

test('생명과학: 숫자/숫자만 분수로, 유전자형은 그대로', () => {
  const o = { numOnly: true };
  assert.equal(show('확률은 (3/4)×(1/2)=3/8', o), '확률은 ⟦3⟋4⟧ × ⟦1⟋2⟧ = ⟦3⟋8⟧');
  for (const t of ['Ab/aB', 'A/a', 'E–h–r / e–H–R', '2 cm/ms', 'ⓐ/㉢']) assert.equal(show(t, o), t, t);
});

test('태그 속성과 짝 안 맞는 괄호는 건드리지 않는다', () => {
  assert.equal(format('<a href="chapters/01.html?x=1">노트</a> (참고'), '<a href="chapters/01.html?x=1">노트</a> (참고');
  assert.equal(format('<span class="k">역학적 에너지</span>: 마찰이 없으면'), '<span class="k">역학적 에너지</span>: 마찰이 없으면');
  assert.equal(format(null), '');
});

test('실린 해설 전부: 글자는 그대로이고(괄호·빈칸만 다름) 태그 짝이 맞는다', () => {
  const dir = new URL('explain/', import.meta.url);
  const text = (h) => h.replace(/<[^>]+>/g, '').replace(/[()\s ]/g, '');
  let n = 0, fr = 0;
  for (const f of fs.readdirSync(dir)) {
    const map = JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'));
    for (const k of Object.keys(map)) {
      const st = { done: 0, skip: 0 }, out = format(String(map[k]), { numOnly: f.includes('bio') }, st);
      assert.equal(text(out), text(String(map[k])), `${f} ${k}번`);
      assert.equal((out.match(/<span/g) || []).length, (out.match(/<\/span>/g) || []).length, `${f} ${k}번 태그`);
      n++; fr += st.done;
    }
  }
  assert.ok(n > 600 && fr > 900, `${n}문항 ${fr}개`);
});
