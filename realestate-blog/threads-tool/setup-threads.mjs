#!/usr/bin/env node
// Threads 자동 게시용 토큰 1회 설정 도구.
// OAuth로 60일짜리 장기 액세스 토큰을 받아 .threads-auth.json 에 저장합니다.
// 사용법: node setup-threads.mjs   (자세한 사전 설정은 README.md 참고)

import { createServer } from "node:http";
import { createInterface } from "node:readline";
import { writeFileSync, existsSync, readFileSync, chmodSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = join(DIR, ".threads-auth.json");
const PORT = 8723;
const DEFAULT_REDIRECT = `http://localhost:${PORT}/callback`;
const SCOPE = "threads_basic,threads_content_publish";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));

function extractCode(s){
  try{ const u = new URL(s); const c = u.searchParams.get("code"); if(c) return c.replace(/#_=_$/,""); }catch{}
  const raw = String(s).replace(/^code=/,"").replace(/#_=_$/,"").trim();
  return raw || null;
}

// 로컬 서버 자동 캡처 + 수동 붙여넣기 중 먼저 도착하는 코드 사용
function getCode(redirect){
  return new Promise((resolve)=>{
    let done=false, server=null;
    const finish=(code)=>{ if(done) return; done=true; try{ server && server.close(); }catch{} try{ rl.close(); }catch{} resolve(code); };

    ask("\n리디렉션된 전체 URL 또는 code 값 붙여넣기 (localhost 자동 인식되면 비워두고 Enter): ")
      .then(v=>{ if(v) finish(extractCode(v)); });

    try{
      const u = new URL(redirect);
      if(/^(localhost|127\.0\.0\.1)$/.test(u.hostname)){
        server = createServer((req,res)=>{
          const code = extractCode("http://x" + req.url);
          res.writeHead(200, { "Content-Type":"text/html; charset=utf-8" });
          res.end("<h2>인증 완료 — 터미널로 돌아가세요. 이 창은 닫아도 됩니다.</h2>");
          if(code) finish(code);
        });
        server.on("error", ()=>{}); // 포트 충돌 등은 무시 → 수동 붙여넣기로 진행
        server.listen(Number(u.port) || 80);
      }
    }catch{}
  });
}

async function main(){
  console.log("\n=== Threads 자동 게시 토큰 설정 ===\n");
  console.log("사전 준비: developers.facebook.com 에서 앱 생성 → 'Threads' 사용 사례 추가 →");
  console.log("App ID / App Secret 확보, Redirect URI 등록, 본인 계정을 Threads Tester로 추가(README.md 참고)\n");

  let prev = {};
  if(existsSync(AUTH_FILE)){ try{ prev = JSON.parse(readFileSync(AUTH_FILE,"utf8")); }catch{} }

  const appId     = (await ask(`Threads App ID${prev.app_id?` [${prev.app_id}]`:""}: `)) || prev.app_id;
  const appSecret = (await ask(`Threads App Secret${prev.app_secret?` [변경 안 하려면 Enter]`:""}: `)) || prev.app_secret;
  const redirect  = (await ask(`Redirect URI [${prev.redirect_uri||DEFAULT_REDIRECT}]: `)) || prev.redirect_uri || DEFAULT_REDIRECT;
  if(!appId || !appSecret){ console.error("App ID와 App Secret이 필요합니다."); rl.close(); process.exit(1); }

  const authUrl = `https://threads.net/oauth/authorize?client_id=${encodeURIComponent(appId)}`
    + `&redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent(SCOPE)}&response_type=code`;
  console.log("\n① 아래 URL을 브라우저에서 열어 권한을 허용하세요:\n");
  console.log("  " + authUrl + "\n");
  console.log("② 허용하면 Redirect URI로 이동합니다. localhost면 자동 인식되고,");
  console.log("   아니면 이동된 주소창의 URL(또는 code 값)을 복사해 아래에 붙여넣으세요.");

  const code = await getCode(redirect);
  if(!code){ console.error("\n인증 코드를 얻지 못했습니다. 다시 시도하세요."); rl.close(); process.exit(1); }

  // 1) code → 단기 토큰 + user_id
  const shortRes = await fetch("https://graph.threads.net/oauth/access_token", {
    method:"POST",
    headers:{ "Content-Type":"application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id:appId, client_secret:appSecret, grant_type:"authorization_code", redirect_uri:redirect, code }),
    signal: AbortSignal.timeout(15000)
  });
  const shortJson = await shortRes.json().catch(()=>({}));
  if(!shortRes.ok || !shortJson.access_token){
    console.error("\n단기 토큰 교환 실패:", JSON.stringify(shortJson)); rl.close(); process.exit(1);
  }
  const userId = String(shortJson.user_id);

  // 2) 단기 → 장기 토큰 (60일)
  const longRes = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token`
    + `&client_secret=${encodeURIComponent(appSecret)}&access_token=${encodeURIComponent(shortJson.access_token)}`,
    { signal: AbortSignal.timeout(15000) });
  const longJson = await longRes.json().catch(()=>({}));
  if(!longRes.ok || !longJson.access_token){
    console.error("\n장기 토큰 교환 실패:", JSON.stringify(longJson)); rl.close(); process.exit(1);
  }

  const expiresAt = Date.now() + (Number(longJson.expires_in || 5184000) * 1000);
  writeFileSync(AUTH_FILE, JSON.stringify({
    app_id:appId, app_secret:appSecret, redirect_uri:redirect,
    user_id:userId, access_token:longJson.access_token, expires_at:expiresAt
  }, null, 2), { mode: 0o600 });
  try{ chmodSync(AUTH_FILE, 0o600); }catch{} // 소유자 전용(시크릿·토큰 보호)

  console.log(`\n✅ 완료! 토큰을 저장했습니다 → ${AUTH_FILE}`);
  console.log(`   만료: ${new Date(expiresAt).toLocaleString()} (자동 갱신됨)`);
  console.log(`\n이제 게시:  node post-threads.mjs "올릴 내용"\n`);
  rl.close();
}

main().catch(e=>{ console.error(e); try{ rl.close(); }catch{} process.exit(1); });
