#!/usr/bin/env node
// 셋업 점검 — 키/토큰/설정/스케줄 상태를 한눈에. 키 없이도 안전하게 실행됨.
// 사용: node doctor.mjs

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");           // realestate-blog/
const readJSON = p => { try{ return JSON.parse(readFileSync(p,"utf8")); }catch{ return null; } };

const checks=[];
const add=(status,name,detail)=>checks.push({status,name,detail}); // status: ok|warn|fail

// 1. Node
const major=Number(process.versions.node.split(".")[0]);
add(major>=18?"ok":"fail", `Node ${process.versions.node}`, major>=18?"":"18 이상 필요(내장 fetch/FormData)");

// 2. Gemini 키 (핵심 필수)
const local = readJSON(join(DIR,"config.local.json")) || {};
const gKey = process.env.GEMINI_API_KEY || local.geminiKey;
add(gKey?"ok":"fail", "Gemini 키", gKey?"설정됨":"config.local.json {geminiKey} 또는 env GEMINI_API_KEY — aistudio.google.com/apikey");

// 3. Threads 토큰 (선택)
const authPath=join(ROOT,"threads-tool",".threads-auth.json");
const auth = existsSync(authPath) ? readJSON(authPath) : null;
if(!auth) add("warn","Threads 토큰","없음 — 자동게시 쓰려면 threads-tool/setup-threads.mjs (선택)");
else { const days = auth.expires_at ? Math.floor((auth.expires_at-Date.now())/86400000) : null;
  if(days!=null && days<0) add("fail","Threads 토큰","만료됨 — setup-threads.mjs 재실행");
  else add("ok","Threads 토큰", days!=null?`유효(약 ${days}일 남음)`:"설정됨"); }

// 4. 실거래가 연동 (선택)
const cfg = readJSON(join(DIR,"config.json")) || {};
const dKey = process.env.DATA_GO_KR_KEY || local.dataGoKrKey;
const codes = cfg.lawdCodes||[];
if(dKey && codes.length) add("ok","실거래가 연동", `키+지역 ${codes.length}개`);
else add("warn","실거래가 연동","미설정(선택) — config.local.json {dataGoKrKey} + config.json lawdCodes");
const badCodes = codes.filter(c=>!/^\d{5}$/.test(String(c)));
if(badCodes.length) add("warn","lawdCodes 형식","5자리 숫자여야: "+badCodes.join(", "));

// 5. Threads 이미지(선택)
if(cfg.imageForThreads){ const img=cfg.imageForThreads;
  if(/^https?:\/\//.test(img)) add("ok","Threads 이미지","URL 설정됨");
  else if(existsSync(img)) add("ok","Threads 이미지","파일 "+img);
  else add("warn","Threads 이미지","파일 없음: "+img); }

// 6. launchd 주 2회 자동(선택)
const lc = spawnSync("launchctl",["list"],{encoding:"utf8"});
const loaded = lc.status===0 && /com\.studywithai\.reblog/.test(lc.stdout||"");
add(loaded?"ok":"warn","launchd 주 2회 자동", loaded?"등록됨":"미등록(선택) — auto/README.md의 launchctl load …");

// 7. topics.csv(일괄생성, 선택)
const hasCsv=existsSync(join(DIR,"topics.csv"));
add(hasCsv?"ok":"warn","topics.csv(일괄생성)", hasCsv?"있음":"없음 — batch.mjs 쓸 때 topics.sample.csv 복사");

const icon={ok:"✅",warn:"⚠️ ",fail:"❌"};
console.log("\n=== 부동산 블로그 도구 셋업 점검 ===\n");
for(const c of checks) console.log(`${icon[c.status]} ${c.name}${c.detail?` — ${c.detail}`:""}`);
const fails=checks.filter(c=>c.status==="fail").length;
const warns=checks.filter(c=>c.status==="warn").length;
console.log(`\n핵심: ${fails?`❌ ${fails}개 해결 필요(글 생성 불가)`:"✅ 글 생성 가능"} / 선택 미설정 ${warns}개`);
console.log("자세한 설정: realestate-blog/README.md\n");
process.exit(fails?1:0);
