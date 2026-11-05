import { validSub } from './attempts.js';

// 계정별 AI 해설·분석(수능 풀어보기). id 는 화면이 쓰는 이름 그대로:
//   q:과목:회차/번호:답(문항 해설) · h:과목:회차/번호(힌트) · x:과목:세트:답들(시험 분석) · s:과목(과목 분석) · w:과목:파트:개수(약점 고치기)
// data 는 화면이 이 기기에 두는 것과 같은 { turns:[{a, q?, p?}], u, c, w } — JSON 길이 MAX_DATA 까지.
const ID = /^[qxswh]:[a-z][a-z0-9]{0,15}(?::[^\u0000-\u001f]{1,1000})?$/;   // 시험 분석(x)은 고른 답 전부가 이름에 든다
export const MAX_DATA = 300_000;
export const MAX_GET = 20;   // 내용은 한 번에 이만큼씩 골라 받는다

// 처음 쓸 때 표가 없으면 만든다(d1/migrations/0007_ai_notes.sql 과 같은 문장 — 나중에 그 파일을 적용해도 겹치지 않는다)
export const AI_NOTES_DDL = [
  'CREATE TABLE IF NOT EXISTS ai_notes (user_id TEXT NOT NULL, id TEXT NOT NULL, sub TEXT NOT NULL, data TEXT NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (user_id, id))',
  'CREATE INDEX IF NOT EXISTS ai_notes_sub ON ai_notes (user_id, sub, updated_at)',
];

export function validAiId(id, sub) {
  return typeof id === 'string' && id.length <= 1024 && ID.test(id) && id.split(':')[1] === sub;
}

function str(v, max) { return v === undefined || (typeof v === 'string' && v.length <= max); }

export function parseAiNote(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false };
  if (!validSub(body.sub) || !validAiId(body.id, body.sub)) return { ok: false };
  if (!Number.isSafeInteger(body.ts) || body.ts < 0) return { ok: false };
  const d = body.data;
  if (!d || typeof d !== 'object' || Array.isArray(d) || !Array.isArray(d.turns) || !d.turns.length || d.turns.length > 60) return { ok: false };
  for (const t of d.turns) {
    if (!t || typeof t !== 'object' || Array.isArray(t) || typeof t.a !== 'string' || !str(t.q, 4000) || !str(t.p, 4000)) return { ok: false };
  }
  const turns = d.turns.map((t) => {
    const o = { a: t.a };
    if (t.q !== undefined) o.q = t.q;
    if (t.p !== undefined) o.p = t.p;
    return o;
  });
  const data = JSON.stringify({ turns, u: d.u && typeof d.u === 'object' ? d.u : null, c: Array.isArray(d.c) ? d.c : [], w: d.w && typeof d.w === 'object' ? d.w : null });
  if (data.length > MAX_DATA) return { ok: false };
  return { ok: true, note: { id: body.id, sub: body.sub, data, ts: body.ts } };
}

// 내용 받기: { sub, ids:[…MAX_GET개까지] } — 겹친 이름은 하나로
export function parseAiIds(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || !validSub(body.sub) || !Array.isArray(body.ids)) return { ok: false };
  const ids = [...new Set(body.ids)];
  if (!ids.length || ids.length > MAX_GET || !ids.every((id) => validAiId(id, body.sub))) return { ok: false };
  return { ok: true, sub: body.sub, ids };
}
