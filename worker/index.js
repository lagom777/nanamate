import { b64urlToBytes, bytesToB64url, openSession, safeEqual, sealSession } from './session.js';
import { failedNext, safeNext } from './safe-next.js';
import { parseAttempts, validExam, validSub } from './attempts.js';
import { parseStyle } from './style.js';
import { parseNotes } from './qnotes.js';
import { dueList } from './due.js';

const SESSION = 'sn_session';
const OAUTH = 'sn_oauth';
const SESSION_AGE = 60 * 60 * 24 * 30;
const OAUTH_AGE = 1800;
const enc = new TextEncoder();
const dec = new TextDecoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function readCookies(request) {
  const out = Object.create(null);
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 1) continue;
    const k = part.slice(0, i).trim();
    try { out[k] = decodeURIComponent(part.slice(i + 1).trim()); }
    catch { out[k] = part.slice(i + 1).trim(); }
  }
  return out;
}

function setCookie(name, value, maxAge, secure) {
  let c = name + '=' + value + '; HttpOnly; SameSite=Lax; Path=/; Max-Age=' + maxAge;
  if (secure) c += '; Secure';
  return c;
}

function redirect(location, cookies) {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
  for (const c of cookies) headers.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers });
}

function packOauth(state, next) {
  return bytesToB64url(enc.encode(JSON.stringify({ state, next })));
}

function unpackOauth(raw) {
  try {
    const b = b64urlToBytes(raw || '');
    if (!b) return null;
    const o = JSON.parse(dec.decode(b));
    if (!o || typeof o.state !== 'string' || typeof o.next !== 'string') return null;
    return o;
  } catch { return null; }
}

function nickOf(me) {
  const cands = [
    me && me.properties && me.properties.nickname,
    me && me.kakao_account && me.kakao_account.profile && me.kakao_account.profile.nickname,
  ];
  for (const c of cands) {
    if (typeof c === 'string' && c.trim()) return c.trim().slice(0, 40);
  }
  return '학생';
}

function kakaoUid(text, me) {
  const m = typeof text === 'string' && text.match(/"id"\s*:\s*(\d+)/);
  if (m) return 'kakao:' + m[1];
  const id = me && me.id;
  if (typeof id === 'string' && /^[0-9]+$/.test(id)) return 'kakao:' + id;
  if (typeof id === 'number' && Number.isSafeInteger(id) && id >= 0) return 'kakao:' + id;
  return null;
}

async function current(request, env) {
  if (!env.SESSION_SECRET) return null;
  const token = readCookies(request)[SESSION];
  if (!token) return null;
  return openSession(env.SESSION_SECRET, token, Math.floor(Date.now() / 1000));
}

function originOk(request, url) {
  const origin = request.headers.get('Origin');
  return !origin || origin === url.origin;
}

async function login(env, url) {
  if (!env.KAKAO_REST_API_KEY) return json({ error: 'server' }, 500);
  const next = safeNext(url.searchParams.get('next'));
  const state = bytesToB64url(crypto.getRandomValues(new Uint8Array(16)));
  const redirectUri = url.origin + '/api/auth/kakao/callback';
  const auth = new URL('https://kauth.kakao.com/oauth/authorize');
  auth.searchParams.set('client_id', env.KAKAO_REST_API_KEY);
  auth.searchParams.set('redirect_uri', redirectUri);
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('state', state);
  const secure = url.protocol === 'https:';
  return redirect(auth.toString(), [setCookie(OAUTH, packOauth(state, next), OAUTH_AGE, secure)]);
}

async function callback(request, env, url) {
  const secure = url.protocol === 'https:';
  const packed = unpackOauth(readCookies(request)[OAUTH]);
  const next = safeNext(packed && packed.next);
  const fail = () => redirect(failedNext(next), [setCookie(OAUTH, '', 0, secure)]);
  const qState = url.searchParams.get('state') || '';
  const code = url.searchParams.get('code') || '';
  if (!packed || !code || qState.length > 128 || !safeEqual(packed.state, qState)) return fail();
  if (!env.KAKAO_REST_API_KEY || !env.SESSION_SECRET) return fail();
  const redirectUri = url.origin + '/api/auth/kakao/callback';
  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: env.KAKAO_REST_API_KEY,
    redirect_uri: redirectUri,
    code,
  });
  if (env.KAKAO_CLIENT_SECRET) form.set('client_secret', env.KAKAO_CLIENT_SECRET);
  const tr = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!tr.ok) return fail();
  const token = await tr.json();
  if (!token || typeof token.access_token !== 'string' || !token.access_token) return fail();
  const ur = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: 'Bearer ' + token.access_token },
  });
  if (!ur.ok) return fail();
  const text = await ur.text();
  let me;
  try { me = JSON.parse(text); } catch { return fail(); }
  const uid = kakaoUid(text, me);
  if (!uid) return fail();
  const nickname = nickOf(me);
  await env.DB.prepare(
    'INSERT INTO users (id, nickname, created_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET nickname = excluded.nickname'
  ).bind(uid, nickname, Date.now()).run();
  const exp = Math.floor(Date.now() / 1000) + SESSION_AGE;
  const session = await sealSession(env.SESSION_SECRET, uid, exp);
  return redirect(next, [
    setCookie(SESSION, session, SESSION_AGE, secure),
    setCookie(OAUTH, '', 0, secure),
  ]);
}

async function me(request, env) {
  const session = await current(request, env);
  if (!session) return json({ id: null });
  const row = await env.DB.prepare('SELECT id, nickname FROM users WHERE id = ?').bind(session.uid).first();
  if (!row) return json({ id: null });
  return json({ id: row.id, nickname: row.nickname });
}

async function getStyle(request, env) {
  const session = await current(request, env);
  if (!session) return json({ error: 'unauthorized' }, 401);
  const row = await env.DB.prepare('SELECT body, updated_at FROM user_styles WHERE user_id = ?').bind(session.uid).first();
  if (!row) return json({ style: null });
  let style = null;
  try { style = JSON.parse(row.body); } catch { return json({ error: 'server' }, 500); }
  return json({ style, updated_at: row.updated_at });
}

async function saveStyle(request, env) {
  const session = await current(request, env);
  if (!session) return json({ error: 'unauthorized' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const parsed = parseStyle(body);
  if (!parsed.ok) return json({ error: 'bad style' }, 400);
  const now = Date.now();
  await env.DB.prepare(
    'INSERT INTO user_styles (user_id, body, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at'
  ).bind(session.uid, JSON.stringify(parsed.style), now).run();
  return json({ style: parsed.style, updated_at: now });
}

async function listNotes(request, env, url) {
  const session = await current(request, env);
  if (!session) return json({ error: 'unauthorized' }, 401);
  const sub = url.searchParams.get('sub');
  if (!validSub(sub)) return json({ error: 'bad query' }, 400);
  const { results } = await env.DB.prepare(
    'SELECT exam, q, marks, memo, unsure, cause, updated_at AS ts FROM question_notes WHERE user_id = ? AND sub = ? ORDER BY exam, q LIMIT 5000'
  ).bind(session.uid, sub).all();
  return json(results || []);
}

// 기기마다 고친 시각(ts)이 더 늦은 쪽을 남긴다
async function saveNotes(request, env) {
  const session = await current(request, env);
  if (!session) return json({ error: 'unauthorized' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const parsed = parseNotes(body);
  if (!parsed.ok) return json({ error: 'bad notes' }, 400);
  if (parsed.notes.length) {
    await env.DB.batch(parsed.notes.map((n) => env.DB.prepare(
      'INSERT INTO question_notes (user_id, sub, exam, q, marks, memo, unsure, cause, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, COALESCE(?7, 0), COALESCE(?8, \'\'), ?9) ON CONFLICT(user_id, sub, exam, q) DO UPDATE SET marks = excluded.marks, memo = excluded.memo, unsure = COALESCE(?7, question_notes.unsure), cause = COALESCE(?8, question_notes.cause), updated_at = excluded.updated_at WHERE excluded.updated_at >= question_notes.updated_at'
    ).bind(session.uid, n.sub, n.exam, n.q, n.marks, n.memo, n.unsure, n.cause, n.ts)));
  }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

// 오늘 다시 풀 오답(1·3·7일): sub 가 없으면 모든 과목
async function due(request, env, url) {
  const session = await current(request, env);
  if (!session) return json({ error: 'unauthorized' }, 401);
  const sub = url.searchParams.get('sub');
  if (sub !== null && !validSub(sub)) return json({ error: 'bad query' }, 400);
  const where = sub ? ' AND sub = ?' : '';
  const args = sub ? [session.uid, sub] : [session.uid];
  const [att, flags] = await env.DB.batch([
    env.DB.prepare('SELECT sub, exam, q, ok, ts FROM attempts WHERE user_id = ?' + where + ' ORDER BY ts LIMIT 20000').bind(...args),
    env.DB.prepare('SELECT sub, exam, q, unsure, updated_at AS ts FROM question_notes WHERE user_id = ? AND unsure > 0' + where).bind(...args),
  ]);
  return json(dueList(att.results || [], flags.results || [], Date.now()));
}

async function postAttempts(request, env) {
  const session = await current(request, env);
  if (!session) return json({ error: 'unauthorized' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const parsed = parseAttempts(body);
  if (!parsed.ok) return json({ error: 'bad attempts' }, 400);
  if (!parsed.attempts.length) return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  await env.DB.batch(parsed.attempts.map((a) => env.DB.prepare(
    'INSERT INTO attempts (user_id, exam, sub, q, picked, ok, ts, ms, mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(session.uid, a.exam, a.sub, a.q, a.picked, a.ok, a.ts, a.ms, a.mode)));
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

async function listAttempts(request, env, url) {
  const session = await current(request, env);
  if (!session) return json({ error: 'unauthorized' }, 401);
  const sub = url.searchParams.get('sub');
  const exam = url.searchParams.get('exam');
  if (!validSub(sub) || !validExam(exam)) return json({ error: 'bad query' }, 400);
  const { results } = await env.DB.prepare(
    'SELECT exam, sub, q, picked, ok, ts, ms, mode FROM attempts WHERE user_id = ? AND sub = ? AND exam = ? ORDER BY ts DESC, id DESC LIMIT 500'
  ).bind(session.uid, sub, exam).all();
  return json(results || []);
}

async function exportAttempts(request, env, url) {
  const session = await current(request, env);
  if (!session) return json({ error: 'unauthorized' }, 401);
  const sub = url.searchParams.get('sub');
  if (!validSub(sub)) return json({ error: 'bad query' }, 400);
  const { results } = await env.DB.prepare(
    'SELECT exam, q, picked, ok, ts, ms, mode FROM attempts WHERE user_id = ? AND sub = ? ORDER BY ts ASC, id ASC LIMIT 5000'
  ).bind(session.uid, sub).all();
  return json(results || []);
}

async function wrong(request, env, url) {
  const session = await current(request, env);
  if (!session) return json({ error: 'unauthorized' }, 401);
  const sub = url.searchParams.get('sub');
  if (!validSub(sub)) return json({ error: 'bad query' }, 400);
  const { results } = await env.DB.prepare(
    `SELECT a.exam, a.q, a.picked, a.ts FROM attempts a
     WHERE a.user_id = ? AND a.sub = ? AND a.ok = 0
     AND NOT EXISTS (
       SELECT 1 FROM attempts b
       WHERE b.user_id = a.user_id AND b.sub = a.sub AND b.exam = a.exam AND b.q = a.q
       AND (b.ts > a.ts OR (b.ts = a.ts AND b.id > a.id))
     )
     ORDER BY a.ts DESC`
  ).bind(session.uid, sub).all();
  return json(results || []);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
      if (request.method === 'POST' && !originOk(request, url)) return json({ error: 'forbidden' }, 403);
      const path = url.pathname;
      const secure = url.protocol === 'https:';
      if (path === '/api/auth/kakao/login' && request.method === 'GET') return await login(env, url);
      if (path === '/api/auth/kakao/callback' && request.method === 'GET') return await callback(request, env, url);
      if (path === '/api/auth/logout' && request.method === 'POST') {
        return new Response(null, {
          status: 204,
          headers: { 'Cache-Control': 'no-store', 'Set-Cookie': setCookie(SESSION, '', 0, secure) },
        });
      }
      if (path === '/api/me' && request.method === 'GET') return await me(request, env);
      if (path === '/api/style' && request.method === 'GET') return await getStyle(request, env);
      if (path === '/api/style' && request.method === 'POST') return await saveStyle(request, env);
      if (path === '/api/qnotes' && request.method === 'GET') return await listNotes(request, env, url);
      if (path === '/api/qnotes' && request.method === 'POST') return await saveNotes(request, env);
      if (path === '/api/due' && request.method === 'GET') return await due(request, env, url);
      if (path === '/api/attempts' && request.method === 'POST') return await postAttempts(request, env);
      if (path === '/api/attempts' && request.method === 'GET') return await listAttempts(request, env, url);
      if (path === '/api/export' && request.method === 'GET') return await exportAttempts(request, env, url);
      if (path === '/api/wrong' && request.method === 'GET') return await wrong(request, env, url);
      return new Response('not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    } catch {
      return json({ error: 'server' }, 500);
    }
  },
};
