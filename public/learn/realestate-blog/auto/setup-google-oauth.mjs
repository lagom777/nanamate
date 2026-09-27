#!/usr/bin/env node
// Google 계정으로 Gemini API를 쓰기 위한 공식 OAuth 1회 설정.
// 사전 준비: Google Cloud에서 Generative Language API 활성화 + Desktop OAuth client JSON 다운로드.

import { createServer } from "node:http";
import { createInterface } from "node:readline";
import { randomBytes, createHash } from "node:crypto";
import { readFileSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { GOOGLE_OAUTH_FILE } from "./google-oauth.mjs";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((resolveAnswer) => rl.question(question, (answer) => resolveAnswer(answer.trim())));
const base64url = (buffer) => buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function openBrowser(url) {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try { spawn(command, args, { detached: true, stdio: "ignore" }).unref(); } catch {}
}

function waitForCallbackServer() {
  let server;
  let resolveCode;
  const ready = new Promise((resolveReady, rejectReady) => {
    server = createServer((request, response) => {
      const url = new URL(request.url || "/", "http://127.0.0.1");
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      response.writeHead(code ? 200 : 400, { "Content-Type": "text/html; charset=utf-8" });
      response.end(code ? "<h2>인증 완료. 이 창은 닫아도 됩니다.</h2>" : "<h2>인증을 완료하지 못했습니다.</h2>");
      if (error) resolveCode.reject(new Error(`Google 인증 취소: ${error}`));
      else if (code) resolveCode.resolve(code);
    });
    server.once("error", rejectReady);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolveReady(`http://127.0.0.1:${address.port}`);
    });
  });
  const code = new Promise((resolve, reject) => { resolveCode = { resolve, reject }; });
  const close = () => { try { server.close(); } catch {} };
  return { ready, code, close };
}

async function main() {
  console.log("\n=== Google OAuth로 Gemini 연결 ===\n");
  console.log("Gemini 웹 로그인 쿠키를 읽지 않고 Google 공식 OAuth를 사용합니다.");
  console.log("사전 준비: Google Cloud 프로젝트 → Generative Language API 활성화 → OAuth 데스크톱 클라이언트 JSON 다운로드\n");

  const defaultSecret = existsSync("client_secret.json") ? resolve("client_secret.json") : "";
  const secretPath = resolve((await ask(`OAuth client JSON 경로${defaultSecret ? ` [${defaultSecret}]` : ""}: `)) || defaultSecret);
  const projectId = await ask("Google Cloud 프로젝트 ID: ");
  if (!secretPath || !projectId) throw new Error("OAuth client JSON 경로와 프로젝트 ID가 필요합니다.");

  const source = JSON.parse(readFileSync(secretPath, "utf8"));
  const client = source.installed;
  if (!client?.client_id || !client?.client_secret) throw new Error("Desktop OAuth client JSON 형식이 아닙니다.");

  const callback = waitForCallbackServer();
  const redirectUri = await callback.ready;
  const verifier = base64url(randomBytes(48));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const scope = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/generative-language.retriever",
  ].join(" ");
  const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: client.client_id,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  console.log("브라우저에서 Google 계정을 선택하고 권한을 승인해 주세요.");
  console.log(`브라우저가 열리지 않으면 이 주소를 직접 여세요:\n${authUrl}\n`);
  openBrowser(authUrl);

  let code;
  try { code = await Promise.race([
    callback.code,
    new Promise((_, reject) => setTimeout(() => reject(new Error("3분 안에 인증되지 않았습니다.")), 180_000)),
  ]); }
  finally { callback.close(); }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: client.client_id,
      client_secret: client.client_secret,
      code,
      code_verifier: verifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const token = await response.json().catch(() => ({}));
  if (!response.ok || !token.access_token || !token.refresh_token) {
    throw new Error(`OAuth 토큰 교환 실패 ${response.status}: ${token.error_description || token.error || "응답 없음"}`);
  }

  writeFileSync(GOOGLE_OAUTH_FILE, JSON.stringify({
    project_id: projectId,
    client_id: client.client_id,
    client_secret: client.client_secret,
    refresh_token: token.refresh_token,
    access_token: token.access_token,
    expires_at: Date.now() + Number(token.expires_in || 3600) * 1000,
    scope: token.scope || scope,
  }, null, 2), { mode: 0o600 });
  try { chmodSync(GOOGLE_OAUTH_FILE, 0o600); } catch {}

  console.log(`\n✅ Google OAuth 연결 완료: ${GOOGLE_OAUTH_FILE}`);
  console.log("이제 API 키 없이 Gemini AI로 글을 작성합니다. 토큰은 자동 갱신됩니다.\n");
}

main().catch((error) => { console.error(`\n❌ ${error.message || error}`); process.exitCode = 1; }).finally(() => rl.close());
