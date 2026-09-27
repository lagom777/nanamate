#!/usr/bin/env node
// 국토교통부 아파트 매매 실거래가(공공데이터포털) 커넥터.
// 트렌드 자동 글에 '실제 수치(실거래가)' 근거를 제공해 헤드라인 의존을 줄입니다.
// 키는 사용자 설정: 환경변수 DATA_GO_KR_KEY 또는 auto/config.local.json { "dataGoKrKey": "..." }
// 사용: node realprice.mjs <LAWD_CD(시군구 5자리)> <YYYYMM>
//   예: node realprice.mjs 11710 202605   (서울 송파구, 2026년 5월)

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
// data.go.kr 등록 시 받는 정확한 엔드포인트로 config의 realPriceEndpoint에서 덮어쓸 수 있음
const DEFAULT_ENDPOINT = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev";

function getKey(){
  let k = process.env.DATA_GO_KR_KEY || "";
  if(!k){ const lp=join(DIR,"config.local.json");
    if(existsSync(lp)){ try{ k=JSON.parse(readFileSync(lp,"utf8")).dataGoKrKey||""; }catch{} } }
  return k;
}
const pick = (b,tag)=>{ const m=b.match(new RegExp(`<${tag}>\\s*([\\s\\S]*?)\\s*</${tag}>`)); return m?m[1].trim():""; };

// 응답 XML → { ok, code, msg, items[] }
export function parseRealPrice(xml){
  const x=String(xml||"");
  const code = pick(x,"resultCode") || pick(x,"returnReasonCode");
  const msg  = pick(x,"resultMsg")  || pick(x,"returnAuthMsg") || pick(x,"errMsg");
  const items=[];
  for(const b of x.match(/<item>[\s\S]*?<\/item>/g)||[]){
    const amount = Number(pick(b,"거래금액").replace(/[,\s]/g,"")) || 0; // 만원
    items.push({
      apt: pick(b,"아파트"),
      dong: pick(b,"법정동"),
      areaM2: Number(pick(b,"전용면적")) || 0,
      amountManwon: amount,
      floor: pick(b,"층"),
      builtYear: pick(b,"건축년도"),
      date: `${pick(b,"년")}-${String(pick(b,"월")).padStart(2,"0")}-${String(pick(b,"일")).padStart(2,"0")}`
    });
  }
  const ok = items.length>0 || ["00","000"].includes(code);
  return { ok, code, msg, items };
}

const eok = manwon => (manwon/10000).toFixed(1); // 만원 → 억
export function summarize(items, label){
  if(!items.length) return "";
  const won = items.map(i=>i.amountManwon).filter(Boolean).sort((a,b)=>a-b);
  if(!won.length) return "";
  const avg = won.reduce((a,b)=>a+b,0)/won.length;
  const byApt={}; items.forEach(i=>{ if(i.apt) byApt[i.apt]=(byApt[i.apt]||0)+1; });
  const topApts = Object.entries(byApt).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([a,n])=>`${a}(${n}건)`);
  return `${label?label+" ":""}실거래 ${items.length}건, 매매가 ${eok(won[0])}~${eok(won[won.length-1])}억(평균 ${eok(avg)}억)`
    + (topApts.length?` · 주요 단지 ${topApts.join(", ")}`:"");
}

export async function fetchRealPrice(lawdCd, dealYmd, opts={}){
  const key = opts.key || getKey();
  if(!key) throw new Error("DATA_GO_KR_KEY 없음 — config.local.json 또는 환경변수 설정 필요 (data.go.kr 무료 발급).");
  const endpoint = opts.endpoint || DEFAULT_ENDPOINT;
  const url = `${endpoint}?serviceKey=${encodeURIComponent(key)}&LAWD_CD=${encodeURIComponent(lawdCd)}`
    + `&DEAL_YMD=${encodeURIComponent(dealYmd)}&numOfRows=${opts.numOfRows||100}&pageNo=1`;
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const parsed = parseRealPrice(await r.text());
  if(!parsed.items.length && parsed.code && !["00","000"].includes(parsed.code))
    throw new Error(`실거래가 API 오류 ${parsed.code}: ${parsed.msg||""}`);
  return parsed;
}

function recentYmd(back){ const d=new Date(); d.setMonth(d.getMonth()-(back||1));
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}`; }

// run.mjs gather에서 사용: 설정된 지역코드 × 최근월 → 요약 라인 배열(키/코드 없으면 [])
export async function realPriceBrief(config){
  const key=getKey();
  if(!key || !(config.lawdCodes||[]).length) return [];
  const ym=recentYmd(config.realPriceMonthsBack||1);
  const lines=[];
  for(const code of config.lawdCodes){
    try{
      const p=await fetchRealPrice(code, ym, { key, endpoint: config.realPriceEndpoint });
      const s=summarize(p.items, `[${code} ${ym}]`);
      if(s) lines.push(s);
    }catch{ /* graceful skip */ }
  }
  return lines;
}

async function main(){
  const [lawd, ymd] = process.argv.slice(2);
  if(!lawd || !ymd){ console.error("사용: node realprice.mjs <LAWD_CD 5자리> <YYYYMM>"); process.exit(1); }
  const p = await fetchRealPrice(lawd, ymd);
  console.log(summarize(p.items, `[${lawd} ${ymd}]`) || "거래 없음");
  console.log(`(총 ${p.items.length}건)`);
}
if(import.meta.url === pathToFileURL(process.argv[1]||"").href){
  main().catch(e=>{ console.error("❌ "+(e?.message||e)); process.exit(1); });
}
