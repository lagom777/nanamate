#!/usr/bin/env node
// 부동산 트렌드 기반 자동 글 생성 (주 2회 launchd로 실행).
// 흐름: 트렌드 수집(구글뉴스 RSS 한/영 + Reddit) → Gemini로 한국어 블로그 글+SNS 요약 생성
//      → 파일 저장(네이버용은 직접 붙여넣기) → Threads 자동 게시 → 데스크톱 알림.
// 사용: node run.mjs            (전체 실행)
//      node run.mjs --gather-only   (수집만, 네트워크/파싱 점검)
//      node run.mjs --no-post       (생성·저장하되 Threads 게시 안 함)

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { realPriceBrief } from "./realprice.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = join(DIR, "output");
const LOGFILE = join(DIR, "run.log");
const THREADS_POSTER = join(DIR, "..", "threads-tool", "post-threads.mjs");
const THREADS_AUTH   = join(DIR, "..", "threads-tool", ".threads-auth.json");

/* ---------------- utils ---------------- */
function stamp(){ return new Date().toISOString().replace("T"," ").slice(0,19); }
function log(msg){ const l=`[${stamp()}] ${msg}`; console.log(l); try{ appendFileSync(LOGFILE,l+"\n"); }catch{} }

export function decodeEntities(s){
  return String(s||"")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"')
    .replace(/&#0?39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n))
    .replace(/&nbsp;/g," ").replace(/&amp;/g,"&");
}
export function stripTags(s){ return String(s||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(); }

export function parseRss(xml){
  const items=[];
  const x=String(xml||"");
  const pickIn=(b,tag)=>{ const m=b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)); return m?decodeEntities(m[1]).trim():""; };
  // RSS 2.0 <item> (예: 구글뉴스)
  for(const b of x.match(/<item\b[\s\S]*?<\/item>/g)||[]){
    const title=pickIn(b,"title"), link=pickIn(b,"link"), pubDate=pickIn(b,"pubDate");
    const desc=stripTags(decodeEntities(pickIn(b,"description"))).slice(0,180); // 구글뉴스 desc는 이중 인코딩 → 2회 디코드
    const sm=b.match(/<source[^>]*>([\s\S]*?)<\/source>/); const source=sm?decodeEntities(sm[1]).trim():"";
    if(title) items.push({ title, link, pubDate, desc, source });
  }
  // Atom <entry> (예: Reddit .rss)
  for(const b of x.match(/<entry\b[\s\S]*?<\/entry>/g)||[]){
    const title=pickIn(b,"title");
    const lm=b.match(/<link[^>]*href="([^"]+)"/); const link=lm?decodeEntities(lm[1]):"";
    const pubDate=pickIn(b,"updated")||pickIn(b,"published");
    const desc=stripTags(decodeEntities(pickIn(b,"content"))).slice(0,180);
    if(title) items.push({ title, link, pubDate, desc, source:"" });
  }
  return items;
}

export function parseReddit(json){
  let data; try{ data = typeof json==="string"?JSON.parse(json):json; }catch{ return []; }
  const kids = data?.data?.children || [];
  return kids.filter(k=>k?.data && !k.data.stickied).map(k=>({
    title: k.data.title || "",
    text: String(k.data.selftext||"").replace(/\s+/g," ").slice(0,200),
    url: "https://www.reddit.com"+(k.data.permalink||""),
    score: k.data.score||0,
    subreddit: k.data.subreddit||""
  })).filter(x=>x.title);
}

async function fetchText(url, headers={}){
  const r = await fetch(url, { headers:{ "User-Agent":"reblog-auto/1.0 (personal)", ...headers }, signal: AbortSignal.timeout(15000) });
  if(!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.text();
}

async function gather(config){
  const brief = { generatedAt: stamp(), realprice:[], kr:[], global:[], reddit:[] };
  const N = config.maxItemsPerSource || 6;
  // 한국 부동산 뉴스/통계
  for(const q of (config.newsKR||[])){
    try{
      const xml = await fetchText(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`);
      brief.kr.push(...parseRss(xml).slice(0,N).map(i=>({...i, q})));
    }catch(e){ log(`뉴스(KR) '${q}' 수집 실패: ${e.message}`); }
  }
  // 글로벌 부동산 추세
  for(const q of (config.newsGlobal||[])){
    try{
      const xml = await fetchText(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`);
      brief.global.push(...parseRss(xml).slice(0,N).map(i=>({...i, q})));
    }catch(e){ log(`뉴스(Global) '${q}' 수집 실패: ${e.message}`); }
  }
  // 쿼리 간 중복·유사 헤드라인 정리
  const krBefore=brief.kr.length, glBefore=brief.global.length;
  brief.kr = dedupeNews(brief.kr);
  brief.global = dedupeNews(brief.global);
  if(krBefore-brief.kr.length || glBefore-brief.global.length)
    log(`유사 헤드라인 정리: KR ${krBefore}→${brief.kr.length}, Global ${glBefore}→${brief.global.length}`);
  // Reddit 인기글: JSON → 실패 시 RSS 폴백 → 둘 다 막히면 graceful skip
  for(const sub of (config.subreddits||[])){
    const s = encodeURIComponent(sub);
    try{
      const j = await fetchText(`https://www.reddit.com/r/${s}/top.json?t=week&limit=${N}`);
      brief.reddit.push(...parseReddit(j).slice(0,N));
    }catch(e1){
      try{
        const x = await fetchText(`https://www.reddit.com/r/${s}/top/.rss?t=week`);
        brief.reddit.push(...parseRss(x).slice(0,N).map(i=>({ title:i.title, url:i.link, subreddit:sub, score:0, text:(i.desc||"").slice(0,160) })));
        log(`Reddit r/${sub} JSON 실패 → RSS로 수집`);
      }catch(e2){ log(`Reddit r/${sub} 수집 실패(건너뜀): ${e1.message} / ${e2.message}`); }
    }
  }
  // 국토부 실거래가 (DATA_GO_KR_KEY + config.lawdCodes 설정 시에만)
  try{ const rp=await realPriceBrief(config); if(rp.length){ brief.realprice=rp; log(`실거래가 ${rp.length}개 지역 수집`); } }
  catch(e){ log("실거래가 수집 실패(건너뜀): "+e.message); }
  return brief;
}

// 유사 헤드라인 정리 (구글뉴스가 같은 사건을 매체별로 다수 반환 → 노이즈·편향 감소)
function normTitle(t){
  return String(t||"").replace(/\s*[-–]\s*[^-–]+$/,"")  // 끝의 " - 매체명" 제거
    .replace(/\[[^\]]*\]/g," ")                            // [돈앤톡] 등 제거
    .replace(/[^0-9A-Za-z가-힣]/g," ").toLowerCase().replace(/\s+/g," ").trim();
}
// 글자 bigram 집합 — 한국어 조사 변형(방향/방향은)에 강함
function titleGrams(t){
  const s=normTitle(t).replace(/\s+/g,"");
  const g=new Set();
  for(let i=0;i<s.length-1;i++) g.add(s.slice(i,i+2));
  if(s.length===1) g.add(s);
  return g;
}
function jaccard(a,b){ let i=0; for(const x of a) if(b.has(x)) i++; const u=a.size+b.size-i; return u? i/u : 0; }
export function dedupeNews(items, threshold=0.5){
  const kept=[], grams=[];
  for(const it of items){
    const g=titleGrams(it.title);
    if(g.size===0){ kept.push(it); continue; }
    if(grams.some(k=>jaccard(g,k)>=threshold)) continue; // 유사 → 버림
    kept.push(it); grams.push(g);
  }
  return kept;
}

export function briefToText(brief){
  const lines=[];
  const add = (head, arr, fmt)=>{ if(arr.length){ lines.push(`## ${head}`); arr.forEach(x=>lines.push("- "+fmt(x))); lines.push(""); } };
  const meta = x=>[x.source, x.pubDate && x.pubDate.slice(0,16)].filter(Boolean).join(", ");
  add("실거래가 (국토부 공개 — 실제 거래 수치, 출처 명시해 인용 가능)", brief.realprice||[], x=>x);
  add("한국 부동산 뉴스·통계", brief.kr, x=>`${x.title}${x.desc?` — ${x.desc}`:""}${meta(x)?` (${meta(x)})`:""}`);
  add("글로벌 부동산 추세", brief.global, x=>`${x.title}${x.desc?` — ${x.desc}`:""}${meta(x)?` (${meta(x)})`:""}`);
  add("Reddit (해외 익명 개인글 — 통계·사실 아님, 분위기 참고만)", brief.reddit, x=>`[r/${x.subreddit}] ${x.title}${x.text?` — ${x.text}`:""}`);
  return lines.join("\n").trim();
}

/* ---------------- prompt ---------------- */
const SYSTEM_PROMPT = `당신은 한국 부동산 전문 블로그 카피라이터입니다. 매주 화제가 되는 부동산 동향을 한국 독자에게 도움이 되게 정리합니다.

[근거·날조 금지 — 가장 중요]
- 아래 '이번 주 트렌드 자료'에 실제로 적힌 내용에만 근거하세요.
- 자료 텍스트에 명시적으로 나오지 않는 숫자(가격·증감률·금리·세대수·경쟁률 등)는 절대 쓰지 마세요. 수치가 자료에 없으면 '상승세가 보도됨'처럼 정성적으로만 쓰고, review_notes에 "구체 수치는 직접 확인"을 넣으세요.
- 자료가 빈약하면 억지로 분량을 채우지 말고 짧고 밀도 있게 쓰세요.

[출처]
- 동향·수치를 언급하면 자료에 적힌 매체명과 시점을 함께 적으세요. 매체명·날짜가 자료에 없으면 추측하지 마세요.
- sources_used에는 위 자료에 실제로 존재하고 본문 근거로 쓴 항목만 넣으세요. url은 자료에 있을 때만 그대로 복사하고, 없으면 빈 문자열("")로 두세요. 링크를 지어내지 마세요.

[Reddit 자료 주의]
- Reddit 항목은 해외 익명 개인의 의견·경험담일 뿐 검증된 통계·사실이 아닙니다. 특정 Reddit 글의 주장·수치를 사실처럼 인용하거나 한국 시장에 일반화하지 마세요.
- "해외 커뮤니티에서는 이런 분위기/관심이 있다" 수준으로 본문에서 최대 1회만 가볍게 언급하고, 핵심 근거로 삼지 마세요.

[문체·신뢰·면책]
- 부드러운 존댓말, 친근하지만 신뢰감 있게. 과장·단정('무조건 오른다' 등) 금지. 한국 독자 관점의 각도 하나에 집중.
- 투자·시세를 다루면 '투자 판단과 책임은 본인'을, 세금·청약·대출·규제를 다루면 '정책·세제는 시점에 따라 바뀌니 시행 시점 확인 및 세무사·공인중개사 등 전문가 상담 권장'을 본문에 자연스럽게 1회 포함. SNS 요약(social)에도 단정 금지.

[네이버 저품질(AI 티) 회피]
- 상투적 도입·맺음("오늘은 ~에 대해 알아보겠습니다", "~하시기 바랍니다" 남발) 금지. 동일 문형 반복·키워드 억지 반복 금지. 빈 일반론 대신 자료 기반 구체성을 우선.

[출력 — JSON 객체 하나만, 코드펜스/설명 없이]
{
  "topic": "이번 글의 주제(한 줄)",
  "title_options": ["제목1","제목2","제목3"],        // 25~45자, 키워드 앞배치
  "body_markdown": "## 소제목\\n문단...",              // 마크다운(##,###, 표, - 목록, **강조**)
  "body_naver": "소제목\\n\\n문단...",                  // 네이버 붙여넣기용 plain text(기호 없음)
  "social": { "threads": "Threads 요약(본문 420자 이내, 클릭 유도, 단정·날조 금지)", "x": "X 요약(230자 이내)" },
  "social_hashtags": ["#짧은태그"],                    // 3~5개
  "hashtags": ["#블로그태그"],                          // 8~12개
  "meta_description": "검색 스니펫용 1~2문장",
  "review_notes": ["게시 전 직접 확인할 항목 2~5개"],
  "sources_used": [ { "title":"자료 제목", "source":"매체명(자료에 있을 때)", "url":"자료에 있으면 그대로, 없으면 \\"\\"" } ]
}`;

export function buildUserPrompt(briefText, config){
  return `[이번 주 트렌드 자료]
${briefText || "(자료 수집 실패 — 새 글을 억지로 만들지 말고, review_notes에 '자료 부족, 생성 보류 권장'만 넣어 짧게 반환하세요.)"}

[분량] 자료가 충분하면 ${config.lengthHint || "공백 제외 약 1,800자"}; 자료가 적으면 더 짧게(분량보다 밀도·정확성 우선).
[작성 지침] 위 자료 중 한국 독자에게 가장 의미 있는 주제 하나를 골라, 자료에 적힌 근거(매체·시점)와 함께 한국 부동산 블로그 글과 SNS 요약을 작성하세요. 한국(KR) 자료가 없으면 해외 동향 '소개' 위주로 쓰되 한국 시장에 단정적으로 일반화하지 마세요. 자료에 없는 수치는 쓰지 마세요. JSON 객체 하나만 출력하세요.`;
}

/* ---------------- output helpers ---------------- */
export function extractFirstObject(t){
  const start=String(t).indexOf("{"); if(start===-1) return null;
  let depth=0,inStr=false,esc=false;
  for(let i=start;i<t.length;i++){ const c=t[i];
    if(esc){esc=false;continue;}
    if(inStr){ if(c==="\\")esc=true; else if(c==='"')inStr=false; continue; }
    if(c==='"')inStr=true; else if(c==="{")depth++; else if(c==="}"){ depth--; if(depth===0) return t.slice(start,i+1); }
  }
  return null;
}
export function parseJsonLoose(text){
  let t=String(text).trim().replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"").trim();
  const o=extractFirstObject(t); if(o){ try{ return JSON.parse(o); }catch{} }
  return JSON.parse(t);
}
export function toNaverPlain(md){
  const lines=String(md||"").replace(/\r\n/g,"\n").split("\n"); const out=[]; let i=0;
  while(i<lines.length){
    if(/^\s*\|.*\|\s*$/.test(lines[i])){
      const tbl=[]; while(i<lines.length && /^\s*\|.*\|\s*$/.test(lines[i])){ tbl.push(lines[i]); i++; }
      let rows=tbl.map(r=>r.trim().replace(/^\||\|$/g,"").split("|").map(c=>c.trim()))
                  .filter(r=>!r.every(c=>/^:?-{2,}:?$/.test(c)||c===""));
      if(rows.length){ const head=rows[0],data=rows.slice(1);
        if(head.length<=2)(data.length?data:rows).forEach(r=>out.push(r.filter(Boolean).join(": ")));
        else (data.length?data:[]).forEach(r=>out.push(head.map((h,k)=>`${h}: ${r[k]??""}`).join(" / ")));
      }
      out.push(""); continue;
    }
    out.push(lines[i].replace(/^\s*#{1,3}\s+/,"").replace(/\*\*(.+?)\*\*/g,"$1")); i++;
  }
  return out.join("\n").replace(/\n{3,}/g,"\n\n").trim();
}
export function normalizeHashtags(arr){
  if(!Array.isArray(arr)) return [];
  const seen=new Set(), out=[];
  for(const raw of arr){ const t=String(raw||"").replace(/^#+/,"").replace(/[^0-9A-Za-z가-힣]/g,"");
    if(!t||seen.has(t.toLowerCase())) continue; seen.add(t.toLowerCase()); out.push("#"+t); }
  return out.slice(0,12);
}
export function composeThreads(obj){
  const soc=(obj.social&&typeof obj.social==="object")?obj.social:{};
  let body=String(soc.threads||obj.meta_description||"").trim();
  const tags=normalizeHashtags((obj.social_hashtags&&obj.social_hashtags.length)?obj.social_hashtags:obj.hashtags).slice(0,4);
  let full=(body+(tags.length?"\n\n"+tags.join(" "):"")).trim();
  if([...full].length>500){ full=[...body.trim()].slice(0,490).join(""); }  // 태그 빼고 본문만, 그래도 길면 코드포인트 단위로 자름
  return full;
}

function writeOutputs(obj, brief, outDir){
  mkdirSync(outDir,{recursive:true});
  const titles=(obj.title_options||[]).map((t,i)=>`${i+1}. ${t}`).join("\n");
  const tags=normalizeHashtags(obj.hashtags).join(" ");
  const srcMd=(obj.sources_used||[]).map(s=>`- ${s.title||""}${s.source?` (${s.source})`:""}${s.url?` ${s.url}`:""}`).join("\n");
  const blog=`# ${obj.topic||"부동산 트렌드"}\n\n[제목 후보]\n${titles}\n\n---\n\n${obj.body_markdown||""}\n\n---\n해시태그: ${tags}\n\n메타설명: ${obj.meta_description||""}\n\n[인용 자료]\n${srcMd}`;
  writeFileSync(join(outDir,"blog.md"), blog);
  writeFileSync(join(outDir,"naver.txt"), toNaverPlain(obj.body_naver||obj.body_markdown));
  writeFileSync(join(outDir,"threads.txt"), composeThreads(obj));
  writeFileSync(join(outDir,"meta.json"), JSON.stringify({ obj, sources: brief }, null, 2));
  // 사람이 검수할 트렌드 원천
  const allSrc=[...brief.kr.map(x=>`[KR] ${x.title} ${x.link||""}`),
                ...brief.global.map(x=>`[Global] ${x.title} ${x.link||""}`),
                ...brief.reddit.map(x=>`[r/${x.subreddit}] ${x.title} ${x.url||""}`)].join("\n");
  writeFileSync(join(outDir,"sources.md"), `# 수집된 트렌드 (${brief.generatedAt})\n\n${allSrc}`);
  return outDir;
}

function notify(title, msg){
  try{ spawnSync("osascript",["-e",`display notification ${JSON.stringify(msg)} with title ${JSON.stringify(title)}`]); }catch{}
}

export async function callGemini(key, model, system, user){
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const r=await fetch(url,{ method:"POST",
    headers:{ "Content-Type":"application/json", "x-goog-api-key":key },
    body:JSON.stringify({ systemInstruction:{parts:[{text:system}]}, contents:[{role:"user",parts:[{text:user}]}],
      generationConfig:{ temperature:0.8, maxOutputTokens:16384, responseMimeType:"application/json", thinkingConfig:{thinkingBudget:0} } }),
    signal: AbortSignal.timeout(60000) });
  if(!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0,200)}`);
  const d=await r.json();
  const cand=d?.candidates?.[0];
  const txt=(cand?.content?.parts||[]).filter(p=>typeof p.text==="string").map(p=>p.text).join("");
  if(!txt) throw new Error(`Gemini 빈 응답 (finishReason: ${cand?.finishReason||"?"})`);
  return txt;
}

export function loadConfig(){
  const base=JSON.parse(readFileSync(join(DIR,"config.json"),"utf8"));
  let local={}; const lp=join(DIR,"config.local.json");
  if(existsSync(lp)){ try{ local=JSON.parse(readFileSync(lp,"utf8")); }catch{} }
  return { ...base, ...local, geminiKey: process.env.GEMINI_API_KEY || local.geminiKey || "" };
}

async function main(){
  const args=process.argv.slice(2);
  const gatherOnly=args.includes("--gather-only");
  const noPost=args.includes("--no-post");
  const config=loadConfig();

  log("트렌드 수집 시작...");
  const brief=await gather(config);
  const counts=`실거래가 ${brief.realprice.length} · KR ${brief.kr.length} · Global ${brief.global.length} · Reddit ${brief.reddit.length}`;
  log("수집 완료: "+counts);

  if(gatherOnly){ console.log("\n"+briefToText(brief)); return; }
  if(brief.realprice.length+brief.kr.length+brief.global.length+brief.reddit.length === 0){
    log("수집된 자료가 없어 중단합니다."); notify("부동산 자동글 실패","트렌드 수집 0건"); process.exit(1);
  }
  if(!config.geminiKey){
    log("GEMINI_API_KEY 없음 — config.local.json 또는 환경변수 설정 필요."); notify("부동산 자동글 실패","Gemini 키 없음"); process.exit(1);
  }

  log("Gemini로 글 생성 중...");
  const raw=await callGemini(config.geminiKey, config.geminiModel||"gemini-2.5-flash", SYSTEM_PROMPT, buildUserPrompt(briefToText(brief), config));
  const obj=parseJsonLoose(raw);

  const d=new Date();
  const dirName=`${d.toISOString().slice(0,10)}-${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}`;
  const outDir=join(OUT_ROOT, dirName);
  writeOutputs(obj, brief, outDir);
  log("저장 완료: "+outDir);

  // Threads 자동 게시
  let posted=false;
  if(config.autoPostThreads && !noPost){
    if(existsSync(THREADS_AUTH)){
      log("Threads 게시 중...");
      const postArgs=[THREADS_POSTER,"--file",join(outDir,"threads.txt")];
      if(config.imageForThreads){ postArgs.push("--image", config.imageForThreads); } // 고정 배너/차트 등(파일경로 또는 공개 URL)
      const res=spawnSync(process.execPath, postArgs, {stdio:"inherit"});
      posted = res.status===0;
      log(posted?"Threads 게시 완료":"Threads 게시 실패(수동 확인 필요)");
    }else{
      log("Threads 토큰 없음 — 게시 건너뜀 (threads-tool/setup-threads.mjs 먼저 실행).");
    }
  }

  notify("부동산 자동글 준비됨",
    `${obj.topic||"새 글"}\n네이버 초안: ${dirName}/naver.txt${posted?" · Threads 게시됨":""}`);
  log("끝. 네이버는 "+join(outDir,"naver.txt")+" 를 붙여넣어 발행하세요.");
}

if(import.meta.url === pathToFileURL(process.argv[1]||"").href){
  main().catch(e=>{ log("오류: "+(e?.message||e)); notify("부동산 자동글 오류", String(e?.message||e).slice(0,120)); process.exit(1); });
}
