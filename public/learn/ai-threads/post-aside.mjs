#!/usr/bin/env node
// Aside 로그인된 Threads 탭에서 작성창에 넣고 게시.
//   node post-aside.mjs [파일]
// 기본 파일: output/latest.txt

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const DIR = dirname(fileURLToPath(import.meta.url));
const file = resolve(process.argv[2] || join(DIR, "output", "latest.txt"));
const text = readFileSync(file, "utf8").trim();
if (!text) {
  console.error("빈 게시문:", file);
  process.exit(1);
}

const code = `
const text = ${JSON.stringify(text)};
const tabs = await listBrowserTabs();
const hit = tabs.find(t => /threads\\.(com|net)/i.test(t.url || ""));
if (hit) await attachBrowserTab(hit.targetId);
else await openTab("https://www.threads.com/");
await sleep(800);
if (!page || !/threads\\.(com|net)/i.test(page.url())) {
  await page.goto("https://www.threads.com/", { waitUntil: "domcontentloaded" });
  await sleep(1500);
}
let box = page.getByRole("textbox", { name: /텍스트 필드가 비어|새 게시물/ });
const boxReady = (await box.count()) && await box.last().isVisible().catch(() => false);
if (!boxReady) {
  const fab = page.getByRole("button", { name: "만들기" });
  if (await fab.count()) await fab.click({ timeout: 8000 });
  await sleep(1200);
  box = page.getByRole("textbox", { name: /텍스트 필드가 비어|새 게시물/ });
}
await box.last().click();
await box.last().fill(text);
await sleep(400);
const typed = await box.last().innerText();
console.log("TYPED_LEN", [...typed].length);
if (![...typed].length) throw new Error("composer empty");
await page.keyboard.press("Meta+Enter");
await sleep(4000);
const live = await page.getByText(text.slice(0, 12)).count();
console.log("LIVE", live, page.url());
if (!live) throw new Error("post not visible");
console.log("POST_CLICKED", page.url());
`;

const r = spawnSync("aside", ["repl", code], { encoding: "utf8" });
process.stdout.write(r.stdout || "");
process.stderr.write(r.stderr || "");
if (r.status !== 0) process.exit(r.status ?? 1);
if (!/POST_CLICKED/.test(r.stdout || "")) {
  console.error("게시 확인 실패");
  process.exit(1);
}
