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
    const rows = html.split(/<div class="core-row"[^>]*>/).slice(1).map((c) => {
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

// 첫 화면 요약 표의 정답률(core-acc.js): 풀어보기와 같은 방법으로 센다.
test("요약 표 정답률: 범위·범위 밖 문항·고른 답 재채점", async () => {
  const { createRequire } = await import("node:module");
  const { count, merge } = createRequire(import.meta.url)("./core-acc.js");
  const ex = [
    { key: "2026-csat", kind: "csat", phys1: { a: [1, 2, 3, 4], t: ["p3", "p3", "p1", "p3"], u: ["p3a", "p3b", "p1a", "x"] } },
    { key: "2026-sep", kind: "sep", phys1: { a: [5, [1, 2]], t: ["p3", "p3"], u: ["p3b", "p3b"] } },
  ];
  const done = { "2026-csat/1": [1, 10, 1], "2026-csat/2": [1, 11, 5], "2026-csat/4": [1, 12, 4], "2026-sep/2": [0, 13, 2] };
  assert.deepEqual(count(ex, "phys1", "part:p3", done, "csat"), { n: 2, done: 2, ok: 1 });      // 범위 밖(x)은 세지 않고, 2번은 고른 답 5 ≠ 정답 2 라 틀림으로 다시 채점
  assert.deepEqual(count(ex, "phys1", "topic:p3b", done, "csat"), { n: 1, done: 1, ok: 0 });
  assert.deepEqual(count(ex, "phys1", "topic:p3b", done, "all"), { n: 3, done: 2, ok: 1 });     // 복수 정답 [1, 2] 에 2 를 고르면 맞음
  assert.deepEqual(count(ex, "phys1", "topic:p3b", done, "mock"), { n: 2, done: 1, ok: 1 });
  assert.deepEqual(count(ex, "phys1", "topic:p3a,topic:p3b", done, "csat"), { n: 2, done: 2, ok: 1 });   // 여러 유형을 묶은 줄
  const m = merge({ "2026-csat/1": [1, 10, 1] }, [{ exam: "2026-csat", q: 1, ok: 0, picked: 3, ts: 20 }, { exam: "2026-csat", q: 3, ok: 1, picked: 3, ts: 5 }]);
  assert.deepEqual(m["2026-csat/1"], [0, 20, 3]);
  assert.deepEqual(count(ex, "phys1", "part:p1", m, "csat"), { n: 1, done: 1, ok: 1 });
});
