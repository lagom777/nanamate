// 세부 유형(exams.json 의 u): 파트 태그(t)와 맞고, 풀어보기 페이지 설정에 이름이 있는 id 만 쓴다.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const here = new URL(".", import.meta.url);
const { exams } = JSON.parse(fs.readFileSync(new URL("exams.json", here), "utf8"));
const cfgOf = (folder) => JSON.parse(/window\.SUNEUNG_PRACTICE=(\{.*?\});<\/script>/.exec(fs.readFileSync(new URL(`../${folder}/practice.html`, here), "utf8"))[1]);

for (const [sub, folder] of [["phys1", "aboutSuneungPhysics1"], ["bio1", "aboutSuneungBio1"]]) {
  test(`${sub}: 세부 유형이 파트와 맞고 페이지 설정에 있다`, () => {
    const topicPart = {};
    for (const p of cfgOf(folder).parts) for (const t of p.topics || []) topicPart[t.id] = p.id;
    assert.ok(Object.keys(topicPart).length > 10);
    const seen = new Set();
    for (const e of exams) {
      const s = e[sub];
      if (!s) continue;
      assert.equal(s.u.length, s.a.length, e.key);
      s.u.forEach((u, i) => {
        if (u === "x") return;   // 옛 교육과정에만 있던 내용
        assert.equal(topicPart[u], s.t[i], `${e.key} ${i + 1}번: ${u} ↔ ${s.t[i]}`);
        seen.add(u);
      });
      if (e.year >= 2021) assert.ok(!s.u.includes("x"), `${e.key}: 지금 교육과정 시험에 범위 밖 표시`);
    }
    for (const id of Object.keys(topicPart)) assert.ok(seen.has(id), `${id} 문항이 하나도 없다`);
  });
}
