// 정답표 점검: 한 회차에서 서로 다른 과목의 정답이 통째로 같을 수는 없다.
// (2018~2020학년도 수능 과탐은 정답표가 8과목이 한 PDF 라, 물리Ⅰ 정답이 생명과학Ⅰ·지구과학Ⅰ·Ⅱ과목에 잘못 들어간 적이 있다)
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const { exams } = JSON.parse(fs.readFileSync(new URL("exams.json", import.meta.url), "utf8"));

test("한 회차 안에서 과목마다 정답표가 다르다", () => {
  for (const e of exams) {
    const seen = new Map();
    for (const [sub, v] of Object.entries(e)) {
      if (!v || !Array.isArray(v.a)) continue;
      const k = JSON.stringify(v.a);
      assert.ok(!seen.has(k), `${e.key}: ${seen.get(k)} 와 ${sub} 의 정답이 같다`);
      seen.set(k, sub);
    }
  }
});

test("과탐 배점: 20문항, 2점·3점, 합 50점", () => {
  for (const e of exams) for (const sub of ["phys1", "chem1", "bio1", "earth1", "phys2", "chem2", "bio2", "earth2"]) {
    const v = e[sub];
    if (!v) continue;
    assert.equal(v.a.length, 20, `${e.key} ${sub}`);
    assert.ok(v.p.every((p) => p === 2 || p === 3), `${e.key} ${sub} 배점`);
    assert.equal(v.p.reduce((a, b) => a + b, 0), 50, `${e.key} ${sub} 배점 합`);
  }
});
