#!/usr/bin/env node
// AI 뉴스 한 건 → 사람 말투 Threads 초안 → (옵션) Aside로 게시
//   node run.mjs            수집·작성·저장
//   node run.mjs --post     저장 후 Aside로 게시
//   node run.mjs --dry      콘솔만

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { scrub, leftoverConnectives, countChars, stripSourceSuffix } from "./style.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "output");
const config = JSON.parse(readFileSync(join(DIR, "config.json"), "utf8"));
const args = new Set(process.argv.slice(2));

function decodeEntities(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&");
}

function parseRss(xml) {
  const items = [];
  for (const b of String(xml || "").match(/<item\b[\s\S]*?<\/item>/g) || []) {
    const pick = (tag) => {
      const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? decodeEntities(m[1]).trim() : "";
    };
    const sm = b.match(/<source[^>]*>([\s\S]*?)</);
    const title = pick("title");
    if (title) items.push({
      title,
      link: pick("link"),
      pubDate: pick("pubDate"),
      source: sm ? decodeEntities(sm[1]).trim() : "",
    });
  }
  return items;
}

async function rssSearch(q, hl, gl, ceid) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  const r = await fetch(url, { headers: { "User-Agent": "ai-threads/1.0" }, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return parseRss(await r.text());
}

function score(item) {
  const t = `${item.title} ${item.source}`.toLowerCase();
  let s = 0;
  for (const k of ["openai", "오픈ai", "chatgpt", "챗gpt", "anthropic", "클로드", "gemini", "제미나이", "xai", "grok", "엔비디아", "nvidia"]) {
    if (t.includes(k)) s += 3;
  }
  if ((config.preferSources || []).some((src) => item.source.includes(src))) s += 2;
  const ageH = (Date.now() - Date.parse(item.pubDate || 0)) / 36e5;
  if (Number.isFinite(ageH) && ageH < 24) s += 2;
  if (/출시|매출|손실|규제|청소년|부모/.test(t)) s += 3;
  if (/전교생|대학|캠퍼스|꿀팁|상위 0\.1|portfolio|베트남어|특징주/.test(t)) s -= 5;
  if (/daum\.net|youtube|instagram|facebook/.test(t)) s -= 10;
  return s;
}

function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = stripSourceSuffix(it.title).replace(/\s+/g, "").slice(0, 40);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function spokenLead(title) {
  let t = stripSourceSuffix(title)
    .replace(/^[“"'‘]+|[”"'’]+$/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\s*[…⋯]|\.{3}/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
  t = t.replace(/출시(?:했다|합니다|함)?$/, "냄");
  t = t.replace(/공개(?:했다|합니다|함)?$/, "공개함");
  t = t.replace(/밝혔다$/, "밝힘");
  t = t.replace(/나왔다$/, "나옴");
  if (!/[.다함음냄]$/.test(t) && t.length < 40) t = `${t}.`;
  return t;
}

function draftFromItem(item) {
  const lead = spokenLead(item.title);
  const src = item.source ? item.source.replace(/\s+/g, "") : "";
  const extra = [];
  if (/청소년/.test(item.title)) extra.push("13~17세로 적거나 미성년으로 보이면 그 모드로 바뀜.");
  if (/유해|차단|통제|부모/.test(item.title)) extra.push("유해 대화 막고 부모 통제 넣었다고 함.");
  if (/매출/.test(item.title) && /손실/.test(item.title)) extra.push("매출은 늘고 손실은 커진 숫자.");
  if (/욕|비속어/.test(item.title)) extra.push("오픈AI 공식 해명은 이 헤드라인만으론 없음.");
  const lines = [lead, "", ...extra];
  if (src) lines.push("", `${src} 보도.`);
  return scrub(lines.filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n"));
}

export async function gather() {
  const raw = [];
  for (const q of config.queriesKR || []) raw.push(...await rssSearch(q, "ko", "KR", "KR:ko"));
  for (const q of config.queriesEN || []) raw.push(...await rssSearch(q, "en-US", "US", "US:en"));
  return dedupe(raw).sort((a, b) => score(b) - score(a)).slice(0, config.maxItems || 8);
}

function gate(text, item) {
  const reasons = [];
  const n = countChars(text);
  if (n < 20) reasons.push("너무 짧음");
  if (n > 500) reasons.push("500자 초과");
  const leftover = leftoverConnectives(text);
  if (leftover.length) reasons.push(`접속부사 남음: ${leftover.join(", ")}`);
  if (/https?:\/\//i.test(text)) reasons.push("링크");
  const tokens = stripSourceSuffix(item.title).replace(/[^0-9A-Za-z가-힣]+/g, " ").split(" ").filter((w) => w.length >= 2);
  if (!tokens.some((w) => text.includes(w))) reasons.push("원 헤드라인 단어가 없음");
  return { ok: reasons.length === 0, reasons };
}

async function main() {
  const items = await gather();
  if (!items.length) {
    console.error("뉴스 없음");
    process.exit(1);
  }
  const item = items[0];
  const text = draftFromItem(item);
  const checked = gate(text, item);
  mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = join(OUT, stamp);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "threads.txt"), text);
  writeFileSync(join(dir, "meta.json"), JSON.stringify({ item, items, gate: checked }, null, 2));
  writeFileSync(join(OUT, "latest.txt"), text);
  writeFileSync(join(OUT, "latest.json"), JSON.stringify({ item, text, gate: checked, dir }, null, 2));
  console.log(text);
  console.log("---");
  console.log(checked.ok ? `ok ${countChars(text)}자` : `review: ${checked.reasons.join("; ")}`);
  console.log(dir);
  if (args.has("--dry") || !args.has("--post")) return;
  if (!checked.ok) {
    console.error("검증 실패 — 게시 안 함");
    process.exit(2);
  }
  const poster = join(DIR, "post-aside.mjs");
  const r = spawnSync(process.execPath, [poster, join(OUT, "latest.txt")], { stdio: "inherit" });
  process.exit(r.status ?? 1);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main().catch((err) => {
  console.error(err);
  process.exit(1);
});
