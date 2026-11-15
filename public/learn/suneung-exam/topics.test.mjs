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

// 과목 첫 화면의 '이 단원은 결국 이걸 배운다': 기출 링크가 풀어보기에 있는 파트·유형을 가리키고, 노트 링크의 파일이 있다.
for (const [sub, folder] of [["phys1", "aboutSuneungPhysics1"], ["bio1", "aboutSuneungBio1"]]) {
  test(`${sub}: 첫 화면 요약 표의 링크가 살아 있다`, () => {
    const html = fs.readFileSync(new URL(`../${folder}/index.html`, here), "utf8");
    const ids = new Set();
    for (const p of cfgOf(folder).parts) { ids.add("part:" + p.id); for (const t of p.topics || []) ids.add("topic:" + t.id); }
    const rows = html.split('<div class="core-row">').slice(1).map((c) => {
      const line = c.split("\n")[0];
      const m = /^<a class="core-name" href="chapters\/([^"]+)">([^<]+)<\/a>/.exec(line), g = /href="practice\.html#([^"]+)"/.exec(line);
      return [m && m[1], m && m[2], g && g[1]];
    });
    assert.ok(rows.length >= 12, `줄 수 ${rows.length}`);
    for (const [file, name, go] of rows) {
      assert.ok(file && fs.existsSync(new URL(`../${folder}/chapters/${file}`, here)), `${name}: ${file}`);
      assert.ok(go && ids.has(go), `${name}: 기출 링크 ${go}`);
    }
    assert.ok(html.indexOf('class="core-sec"') < html.indexOf("이 노트가 다루는 것"), "요약 표가 소개 글보다 먼저");
  });
}
