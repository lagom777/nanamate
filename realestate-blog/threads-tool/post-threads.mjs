#!/usr/bin/env node
// 저장된 토큰으로 Threads에 텍스트를 자동 게시합니다.
// 사용법:
//   node post-threads.mjs "올릴 내용"
//   node post-threads.mjs --file summary.txt
//   node post-threads.mjs            (실행 후 붙여넣고 Ctrl+D 또는 'EOF')

import { readFileSync, writeFileSync, existsSync, chmodSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = join(DIR, ".threads-auth.json");
const GRAPH = "https://graph.threads.net/v1.0";
const MAX = 500;

function die(msg){ console.error("\n❌ " + msg); process.exit(1); }
function loadAuth(){
  if(!existsSync(AUTH_FILE)) die("토큰이 없습니다. 먼저 'node setup-threads.mjs' 를 실행하세요.");
  try{ return JSON.parse(readFileSync(AUTH_FILE,"utf8")); }
  catch{ die(".threads-auth.json 을 읽을 수 없습니다."); }
}
function saveAuth(a){ writeFileSync(AUTH_FILE, JSON.stringify(a,null,2), {mode:0o600}); try{ chmodSync(AUTH_FILE,0o600); }catch{} }

export function parseArgs(argv){
  const o={ file:null, image:null, alt:null, _:[] };
  for(let i=0;i<argv.length;i++){
    const a=argv[i];
    if(a==="--file") o.file=argv[++i];
    else if(a==="--image") o.image=argv[++i];
    else if(a==="--alt") o.alt=argv[++i];
    else o._.push(a);
  }
  return o;
}

async function readText(args){
  if(args.file) return readFileSync(args.file,"utf8").trim();
  if(args._.length) return args._.join(" ").trim();
  // 대화형 멀티라인 입력
  return await new Promise((res)=>{
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    console.log("올릴 내용을 붙여넣고, 끝나면 빈 줄에서 Ctrl+D (또는 한 줄에 EOF) 입력:");
    const lines=[];
    rl.on("line", (l)=>{ if(l.trim()==="EOF") rl.close(); else lines.push(l); });
    rl.on("close", ()=> res(lines.join("\n").trim()));
  });
}

// 로컬 이미지면 catbox에 올려 공개 URL 반환, 이미 http(s) URL이면 그대로.
async function resolveImage(img){
  if(!img) return null;
  if(/^https?:\/\//i.test(img)) return img;
  if(!existsSync(img)) die(`이미지 파일을 찾을 수 없습니다: ${img}`);
  if(!/\.(jpe?g|png)$/i.test(img)) die("Threads 이미지는 JPEG/PNG만 지원합니다.");
  const buf = readFileSync(img);
  if(buf.length > 8*1024*1024) die("이미지가 8MB를 초과합니다 (Threads 제한).");
  console.log("이미지 업로드 중 (catbox)...");
  const fd = new FormData();
  fd.append("reqtype","fileupload");
  fd.append("fileToUpload", new Blob([buf]), basename(img));
  const r = await fetch("https://catbox.moe/user/api.php", { method:"POST", body:fd, signal: AbortSignal.timeout(30000) });
  const url = (await r.text()).trim();
  if(!r.ok || !/^https?:\/\//.test(url)) die("이미지 업로드 실패: " + url.slice(0,200));
  console.log("업로드 완료: " + url);
  return url;
}

async function refreshIfNeeded(auth){
  const SEVEN_DAYS = 7*24*3600*1000;
  if(auth.expires_at && (auth.expires_at - Date.now()) < SEVEN_DAYS){
    try{
      const r = await fetch(`https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token`
        + `&access_token=${encodeURIComponent(auth.access_token)}`, { signal: AbortSignal.timeout(15000) });
      const j = await r.json().catch(()=>({}));
      if(r.ok && j.access_token){
        auth.access_token = j.access_token;
        auth.expires_at = Date.now() + (Number(j.expires_in||5184000)*1000);
        saveAuth(auth);
        console.log("🔄 토큰을 갱신했습니다.");
      }
    }catch{ /* 갱신 실패해도 기존 토큰으로 시도 */ }
  }
  return auth;
}

export function containerParams(auth, text, imageUrl, alt){
  const p = imageUrl
    ? { media_type:"IMAGE", image_url:imageUrl, text, access_token: auth.access_token }
    : { media_type:"TEXT", text, access_token: auth.access_token };
  if(imageUrl && alt) p.alt_text = alt;
  return p;
}
async function createContainer(auth, text, imageUrl, alt){
  const r = await fetch(`${GRAPH}/${auth.user_id}/threads`, {
    method:"POST", headers:{ "Content-Type":"application/x-www-form-urlencoded" },
    body: new URLSearchParams(containerParams(auth, text, imageUrl, alt)),
    signal: AbortSignal.timeout(20000)
  });
  const j = await r.json().catch(()=>({}));
  if(!r.ok || !j.id) die("컨테이너 생성 실패: " + JSON.stringify(j));
  return j.id;
}

async function publish(auth, creationId){
  // Meta 권장: 컨테이너 생성 후 평균 ~30초 처리 대기. 즉시 시도 후 실패하면 10초 간격 재시도.
  for(let attempt=1; attempt<=4; attempt++){
    const r = await fetch(`${GRAPH}/${auth.user_id}/threads_publish`, {
      method:"POST", headers:{ "Content-Type":"application/x-www-form-urlencoded" },
      body: new URLSearchParams({ creation_id: creationId, access_token: auth.access_token }),
      signal: AbortSignal.timeout(15000)
    });
    const j = await r.json().catch(()=>({}));
    if(r.ok && j.id) return j.id;
    if(attempt<4){ console.log(`처리 대기 중... 재시도 (${attempt}/4)`); await new Promise(s=>setTimeout(s,10000)); }
    else die("게시 실패: " + JSON.stringify(j));
  }
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  let auth = loadAuth();
  const text = await readText(args);
  if(!text && !args.image) die("올릴 내용이 비어 있습니다.");
  const len = [...text].length;
  if(len > MAX) die(`Threads는 500자까지입니다. 현재 ${len}자 — 줄여주세요.`);
  const imageUrl = await resolveImage(args.image);
  auth = await refreshIfNeeded(auth);
  console.log(`\nThreads에 게시 중... (${len}자${imageUrl?" + 이미지":""})`);
  const cid = await createContainer(auth, text, imageUrl, args.alt);
  if(imageUrl) await new Promise(s=>setTimeout(s,5000)); // 이미지 서버 처리 대기
  const id = await publish(auth, cid);
  console.log(`\n✅ 게시 완료! (media id: ${id})`);
  console.log(`   확인: https://www.threads.net/@me`);
}

import { pathToFileURL } from "node:url";
if(import.meta.url === pathToFileURL(process.argv[1]||"").href){
  main().catch(e=>die(e?.message || String(e)));
}
