#!/usr/bin/env node
// topics.csv 의 여러 주제를 한 번에 글로 생성 + (옵션) Threads 연속 게시.
// run.mjs의 검증된 Gemini 호출·변환 함수를 재사용.
// 사용:
//   node batch.mjs                      (topics.csv 전체 생성 + 설정에 따라 Threads 게시)
//   node batch.mjs --file my.csv --limit 3 --no-post
//   node batch.mjs --dry-run            (CSV 파싱·프롬프트만 확인, 생성/게시 안 함)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { callGemini, loadConfig, parseJsonLoose, toNaverPlain, normalizeHashtags, composeThreads } from "./run.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = join(DIR, "output");
const THREADS_POSTER = join(DIR, "..", "threads-tool", "post-threads.mjs");
const THREADS_AUTH   = join(DIR, "..", "threads-tool", ".threads-auth.json");

function die(m){ console.error("\n❌ "+m); process.exit(1); }

/* ---------- CSV (따옴표·콤마·"" 이스케이프·개행 포함 필드 처리) ---------- */
export function parseCsv(text){
  const rows=[]; let row=[], field="", inQ=false;
  const s=String(text).replace(/^﻿/,""); // BOM 제거
  for(let i=0;i<s.length;i++){
    const c=s[i];
    if(inQ){
      if(c==='"'){ if(s[i+1]==='"'){ field+='"'; i++; } else inQ=false; }
      else field+=c;
    }else{
      if(c==='"') inQ=true;
      else if(c===','){ row.push(field); field=""; }
      else if(c==='\n'){ row.push(field); rows.push(row); row=[]; field=""; }
      else if(c==='\r'){ /* skip */ }
      else field+=c;
    }
  }
  if(field!=="" || row.length){ row.push(field); rows.push(row); }
  return rows.filter(r=>r.some(c=>c.trim()!==""));  // 빈 줄 제거
}
export function rowsToObjects(rows){
  if(rows.length<2) return [];
  const head=rows[0].map(h=>h.trim().toLowerCase());
  return rows.slice(1).map(r=>{ const o={}; head.forEach((h,i)=>o[h]=(r[i]||"").trim()); return o; });
}

/* ---------- 글 유형 (생성기 HTML과 동일) ---------- */
const TYPE_META = {
  listing:{ name:"매물 소개(광고형)", structure:"도입 인사 → 단지/매물 개요(표) → 내부 구조·특장점 → 가격·관리비 → 입지·교통·학군 → 솔직한 장점/주의점 → 방문·문의 CTA" },
  price:{ name:"시세·실거래가 분석", structure:"도입 → 단지 개요 → 실거래가/시세 현황(표, 기준일·출처 명시) → 가격 추이와 요인 분석 → 전세가율·평당가 → 적정가·전망(단정 금지) → 매수/매도 체크포인트" },
  location:{ name:"동네·입지·학군·교통 소개", structure:"도입 → 지역 개요 → 교통 → 학군·학원가 → 생활 인프라 → 개발·교통 호재 → 종합 평가(장단점)" },
  subscription:{ name:"청약·분양 정보", structure:"도입 → 분양 개요 → 분양가·일정 → 청약 자격·가점 → 특별공급 → 경쟁률 전망(근거 기반) → 자가진단 체크 → 청약홈 확인 안내" },
  policy:{ name:"정책·세금·대출 가이드", structure:"도입 → 제도 핵심 요약 → 적용 대상·요건(표) → 계산 예시(가정 명시) → 최신 개정(시행일 명시) → FAQ → 전문가 상담 권유" },
  interior:{ name:"인테리어·집들이", structure:"도입 → 평형/구조·콘셉트 → 공간별 시공 포인트 → 시공 항목·예산(표) → 비포애프터 → 만족/아쉬운점 → 마무리" },
  invest:{ name:"투자·시장 전망", structure:"도입 → 지역/단지 개요 → 시장 현황·데이터(출처·기준일) → 호재 분석 → 리스크 분석 → 투자 포인트(보장·단정 금지) → 체크리스트 → 투자 책임 본인 고지" },
  process:{ name:"거래 절차·실무", structure:"도입 → 절차 단계별 → 필요 서류 → 주의사항(전세사기 예방 등) → 부대비용·세금 → 체크리스트 → 마무리" },
  custom:{ name:"자유 주제", structure:"도입 → 핵심 정보를 소제목+표/리스트로 분할 → 데이터·근거(출처·기준일) → 장단점/주의 균형 → 실행 가이드 → 요약" }
};
const LEN_MAP = { short:"공백 제외 약 700~900자", mid:"공백 제외 약 1,400~1,700자", long:"공백 제외 약 2,300~2,700자" };

const SYSTEM_PROMPT = `당신은 한국 부동산 전문 블로그 카피라이터입니다.
[문체] 부드러운 존댓말, 친근하지만 신뢰감. 1인칭 경험 허용(허위 금지). 어려운 용어는 풀어서.
[신뢰] 과장·단정('무조건 오른다' 등) 금지. 입력에 없는 구체 수치(가격·시세·통계)를 지어내지 말 것. 시세/실거래가는 기준일·출처를 본문에 명시하도록 유도, 입력에 없으면 "(출처·기준일 직접 확인 필요)"로 표기.
[면책] 투자·시세는 '투자 판단·책임은 본인', 세금·청약·대출·규제는 '시행 시점 확인 및 세무사·공인중개사 등 전문가 상담 권장'을 1회 포함.
[SEO] 핵심 키워드를 제목 앞·본문에 자연스럽게 5~7회(억지 반복 금지), 동의어 병기.
[AI 티 회피] 상투적 도입·맺음, 동일 문형 반복, 빈 일반론 지양. 구체성 우선.
[출력 — JSON 객체 하나만, 코드펜스/설명 없이]
{
  "title_options": ["제목1","제목2","제목3"],
  "body_markdown": "## 소제목\\n문단...",
  "body_naver": "소제목\\n\\n문단...",
  "info_table": [["거래유형","매매 23.5억"]],
  "social": { "threads": "Threads 요약(본문 420자 이내, 단정·날조 금지)", "x": "X 요약(230자 이내)" },
  "social_hashtags": ["#짧은태그"],
  "hashtags": ["#블로그태그"],
  "meta_description": "1~2문장",
  "review_notes": ["게시 전 확인 항목 2~5개"]
}`;

const LABELS = { topic:"주제", area:"지역/주소", name:"단지·건물명", deal:"거래유형", price:"가격", size:"면적",
  struct:"구조/층/향", transit:"교통", life:"학군·생활편의", data:"데이터 기준일·출처", keyword:"핵심 키워드",
  audience:"대상 독자·톤", contact:"연락처·중개사무소", notes:"추가 정보·셀링포인트" };

export function buildUserPrompt(o){
  const type = TYPE_META[o.type] ? o.type : (o.topic ? "custom" : "listing");
  const meta = TYPE_META[type];
  const typeName = (type==="custom" && o.topic) ? `자유 주제 — ${o.topic}` : meta.name;
  const lines=[];
  Object.keys(LABELS).forEach(k=>{ if(k==="topic" && type!=="custom") return; if(o[k]) lines.push(`- ${LABELS[k]}: ${o[k]}`); });
  const sensitive = ["policy","invest","subscription"].includes(type);
  const snsNote = sensitive ? `\n[SNS 주의] social 요약에도 구체 수치·단정 금지, 면책 cue(기준·요건은 블로그 확인 / 투자 판단은 본인) 1개 포함.` : "";
  return `[글 유형] ${typeName}
[권장 구조] ${meta.structure}
[분량] ${LEN_MAP[o.length]||LEN_MAP.mid}
[핵심 키워드] ${o.keyword || "(미지정 — 주제/지역/단지명 기반 설정)"}${snsNote}

[입력 정보]
${lines.length ? lines.join("\n") : "- (구체 정보가 적으니 정확한 일반 정보 위주로, 단정 대신 '확인 권장')"}

위 정보로 "${typeName}" 블로그 글과 SNS 요약을 작성하세요. 입력에 없는 수치는 지어내지 말고, JSON 객체 하나만 출력하세요.`;
}

function slug(s){ return String(s||"post").replace(/[^0-9A-Za-z가-힣]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40)||"post"; }

function writeOne(obj, row, dir){
  mkdirSync(dir,{recursive:true});
  const titles=(obj.title_options||[]).map((t,i)=>`${i+1}. ${t}`).join("\n");
  const tags=normalizeHashtags(obj.hashtags).join(" ");
  const blog=`# ${(obj.title_options||[""])[0]}\n\n[제목 후보]\n${titles}\n\n---\n\n${obj.body_markdown||""}\n\n---\n해시태그: ${tags}\n\n메타설명: ${obj.meta_description||""}`;
  writeFileSync(join(dir,"blog.md"), blog);
  writeFileSync(join(dir,"naver.txt"), toNaverPlain(obj.body_naver||obj.body_markdown));
  writeFileSync(join(dir,"threads.txt"), composeThreads(obj));
  writeFileSync(join(dir,"meta.json"), JSON.stringify({ input: row, obj }, null, 2));
}

function parseArgs(argv){
  const o={ file:null, limit:Infinity, noPost:false, dry:false };
  for(let i=0;i<argv.length;i++){ const a=argv[i];
    if(a==="--file") o.file=argv[++i];
    else if(a==="--limit") o.limit=parseInt(argv[++i],10)||Infinity;
    else if(a==="--no-post") o.noPost=true;
    else if(a==="--dry-run") o.dry=true;
  }
  return o;
}

async function main(){
  const args=parseArgs(process.argv.slice(2));
  const config=loadConfig();
  const csvPath=args.file || join(DIR,"topics.csv");
  if(!existsSync(csvPath)) die(`${csvPath} 없음 — topics.sample.csv 를 topics.csv 로 복사해 채우세요.`);
  let items=rowsToObjects(parseCsv(readFileSync(csvPath,"utf8")));
  if(!items.length) die("CSV에 데이터 행이 없습니다.");
  if(items.length>args.limit) items=items.slice(0,args.limit);
  console.log(`${items.length}개 주제 처리 시작${args.dry?" (dry-run)":""}`);

  if(args.dry){
    items.forEach((o,i)=>console.log(`\n[${i+1}] ${o.type||"(auto)"} / ${o.topic||o.area||o.name}\n`+buildUserPrompt(o)));
    return;
  }
  if(!config.geminiKey) die("GEMINI_API_KEY 없음 — config.local.json 또는 환경변수 설정 필요.");

  const d=new Date();
  const root=join(OUT_ROOT, `batch-${d.toISOString().slice(0,10)}-${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}`);
  const canPost = !args.noPost && config.autoPostThreads && existsSync(THREADS_AUTH);
  let okCount=0, postCount=0;

  for(let i=0;i<items.length;i++){
    const o=items[i];
    const label=o.topic||o.name||o.area||`#${i+1}`;
    try{
      console.log(`\n[${i+1}/${items.length}] 생성: ${label}`);
      const raw=await callGemini(config.geminiKey, config.geminiModel||"gemini-2.5-flash", SYSTEM_PROMPT, buildUserPrompt(o));
      const obj=parseJsonLoose(raw);
      const dir=join(root, `${String(i+1).padStart(2,"0")}-${slug(label)}`);
      writeOne(obj, o, dir);
      okCount++;
      console.log(`  저장: ${dir}`);
      if(canPost){
        const postArgs=[THREADS_POSTER,"--file",join(dir,"threads.txt")];
        if(config.imageForThreads) postArgs.push("--image", config.imageForThreads);
        const res=spawnSync(process.execPath, postArgs, {stdio:"inherit"});
        if(res.status===0){ postCount++; if(i<items.length-1) await new Promise(s=>setTimeout(s,10000)); } // 연속 게시 간 간격
      }
    }catch(e){ console.error(`  실패: ${label} — ${e?.message||e}`); }
  }
  console.log(`\n완료: 생성 ${okCount}/${items.length}${canPost?`, Threads 게시 ${postCount}`:""}. 저장 위치: ${root}`);
  console.log(`네이버는 각 폴더의 naver.txt 를 붙여넣어 발행하세요.`);
}

if(import.meta.url === pathToFileURL(process.argv[1]||"").href){
  main().catch(e=>die(e?.message||String(e)));
}
