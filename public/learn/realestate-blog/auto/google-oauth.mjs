// Google 공식 OAuth로 Gemini API를 호출한다. 브라우저의 Gemini 쿠키는 읽지 않는다.
// setup-google-oauth.mjs가 만든 로컬 자격 증명을 갱신해 사용한다.

import { existsSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
export const GOOGLE_OAUTH_FILE = join(DIR, ".google-oauth.json");

function readAuth() {
  if (!existsSync(GOOGLE_OAUTH_FILE)) return null;
  try { return JSON.parse(readFileSync(GOOGLE_OAUTH_FILE, "utf8")); }
  catch { return null; }
}

function saveAuth(auth) {
  writeFileSync(GOOGLE_OAUTH_FILE, JSON.stringify(auth, null, 2), { mode: 0o600 });
  try { chmodSync(GOOGLE_OAUTH_FILE, 0o600); } catch {}
}

export function googleOAuthStatus() {
  const auth = readAuth();
  if (!auth) return { ready: false, reason: "인증 파일 없음" };
  if (!auth.client_id || !auth.client_secret || !auth.refresh_token || !auth.project_id) {
    return { ready: false, reason: "OAuth 정보 불완전" };
  }
  return { ready: true, projectId: auth.project_id, expiresAt: auth.expires_at || 0 };
}

async function refreshAccessToken(auth) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: auth.client_id,
      client_secret: auth.client_secret,
      refresh_token: auth.refresh_token,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.access_token) {
    throw new Error(`Google OAuth 토큰 갱신 실패 ${response.status}: ${result.error_description || result.error || "응답 없음"}`);
  }
  const next = {
    ...auth,
    access_token: result.access_token,
    expires_at: Date.now() + Number(result.expires_in || 3600) * 1000,
  };
  if (result.refresh_token) next.refresh_token = result.refresh_token;
  saveAuth(next);
  return next;
}

export async function getGoogleOAuthAccess() {
  let auth = readAuth();
  const status = googleOAuthStatus();
  if (!status.ready) throw new Error(`Google OAuth 미설정: ${status.reason}`);
  if (!auth.access_token || Number(auth.expires_at || 0) < Date.now() + 60_000) {
    auth = await refreshAccessToken(auth);
  }
  return { accessToken: auth.access_token, projectId: auth.project_id };
}

export async function callGeminiOAuth(model, system, user) {
  const { accessToken, projectId } = await getGoogleOAuthAccess();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "x-goog-user-project": projectId,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 16384,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Gemini OAuth ${response.status}: ${(await response.text()).slice(0, 240)}`);
  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const text = (candidate?.content?.parts || []).filter((part) => typeof part.text === "string").map((part) => part.text).join("");
  if (!text) throw new Error(`Gemini OAuth 빈 응답 (finishReason: ${candidate?.finishReason || "?"})`);
  return text;
}
