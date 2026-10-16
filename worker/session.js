const enc = new TextEncoder();
const dec = new TextDecoder();

export function bytesToB64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function b64urlToBytes(s) {
  if (typeof s !== 'string' || !s || /[^A-Za-z0-9_-]/.test(s)) return null;
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = pad + '='.repeat((4 - (pad.length % 4)) % 4);
  let bin;
  try { bin = atob(padded); } catch { return null; }
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

function safeEqualBytes(a, b) {
  let diff = 0;
  const n = 32;
  if (!(a instanceof Uint8Array) || a.length !== n || !(b instanceof Uint8Array) || b.length !== n) diff = 1;
  for (let i = 0; i < n; i++) diff |= ((a && a[i]) || 0) ^ ((b && b[i]) || 0);
  return diff === 0;
}

export function safeEqual(a, b) {
  const aa = typeof a === 'string' ? enc.encode(a) : new Uint8Array();
  const bb = typeof b === 'string' ? enc.encode(b) : new Uint8Array();
  const n = Math.max(aa.length, bb.length, 1);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < n; i++) diff |= (aa[i] || 0) ^ (bb[i] || 0);
  return diff === 0;
}

export async function sealSession(secret, uid, exp) {
  const payload = bytesToB64url(enc.encode(JSON.stringify({ uid, exp })));
  const sig = bytesToB64url(await hmac(secret, payload));
  return payload + '.' + sig;
}

export async function openSession(secret, token, now) {
  if (typeof secret !== 'string' || !secret || typeof token !== 'string' || token.length > 512) return null;
  const dot = token.indexOf('.');
  if (dot <= 0 || token.indexOf('.', dot + 1) !== -1) return null;
  const payload = token.slice(0, dot);
  const given = b64urlToBytes(token.slice(dot + 1));
  const expected = await hmac(secret, payload);
  if (!safeEqualBytes(given, expected)) return null;
  let data;
  try {
    const raw = b64urlToBytes(payload);
    if (!raw) return null;
    data = JSON.parse(dec.decode(raw));
  } catch { return null; }
  if (!data || typeof data.uid !== 'string' || !data.uid || typeof data.exp !== 'number' || !Number.isFinite(data.exp)) return null;
  if (data.exp <= now) return null;
  return { uid: data.uid, exp: data.exp };
}
