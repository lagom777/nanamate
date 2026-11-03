// 계정별 Anthropic API 키(AI 해설). SESSION_SECRET 에서 HKDF 로 뽑은 AES-GCM 키로 암호화해 D1 ai_keys 에 둔다.
// 암호문은 그 계정(uid)에 묶이고(AAD), 키 원문은 브라우저로 다시 내려보내지 않는다 —
// 브라우저는 /api/claude/v1/messages 로 보내고, 서버가 이 키로 Anthropic 에 전달한다.
import { b64urlToBytes, bytesToB64url } from './session.js';

const enc = new TextEncoder();
const dec = new TextDecoder();
const INFO = 'nanamate ai key v1';
export const ANTHROPIC = 'https://api.anthropic.com';

export function validKey(k) {
  return typeof k === 'string' && /^sk-ant-[A-Za-z0-9_-]{20,300}$/.test(k);
}

// 화면에 보여 줄 만큼만: 앞 10자 + 끝 4자
export function keyHint(k) {
  return k.slice(0, 10) + '…' + k.slice(-4);
}

async function aesKey(secret) {
  const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: enc.encode(INFO) },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

export async function sealKey(secret, uid, plain) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(uid) }, await aesKey(secret), enc.encode(plain));
  return { iv: bytesToB64url(iv), ct: bytesToB64url(new Uint8Array(ct)) };
}

export async function openKey(secret, uid, iv, ct) {
  const ivb = b64urlToBytes(iv), ctb = b64urlToBytes(ct);
  if (!ivb || !ctb) return null;
  try {
    const p = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivb, additionalData: enc.encode(uid) }, await aesKey(secret), ctb);
    return dec.decode(p);
  } catch { return null; }
}

// Anthropic 오류와 같은 모양으로 — 브라우저의 SDK 가 그대로 읽는다
export function anthropicError(status, type, message) {
  return new Response(JSON.stringify({ type: 'error', error: { type, message } }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

// 브라우저에서 온 Messages 요청을 저장된 키로 그대로 전달하고, 응답(스트림 포함)을 그대로 돌려준다
export async function relayMessages(request, key, search) {
  const body = await request.text();
  if (body.length > 4_000_000) return anthropicError(413, 'request_too_large', '요청이 너무 큽니다.');
  const headers = new Headers({
    'content-type': 'application/json',
    'x-api-key': key,
    'anthropic-version': request.headers.get('anthropic-version') || '2023-06-01',
  });
  const beta = request.headers.get('anthropic-beta');
  if (beta) headers.set('anthropic-beta', beta);
  const up = await fetch(ANTHROPIC + '/v1/messages' + (search || ''), { method: 'POST', headers, body });
  const out = new Headers({ 'Cache-Control': 'no-store' });
  for (const h of ['content-type', 'request-id', 'retry-after']) {
    const v = up.headers.get(h);
    if (v) out.set(h, v);
  }
  return new Response(up.body, { status: up.status, headers: out });
}

// 저장 전에 키가 살아 있는지: 모델 목록(무료)으로 확인. 401·403 만 '틀린 키'로 본다
export async function keyWorks(key) {
  try {
    const r = await fetch(ANTHROPIC + '/v1/models?limit=1', { headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' } });
    return !(r.status === 401 || r.status === 403);
  } catch { return true; }
}
