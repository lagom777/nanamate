import { validSub } from './attempts.js';

// 계정별 풀이 상태(수능 풀어보기): 회차마다 고른 답과 채점 여부 — 다른 기기에서도 이어서 보이게.
// id 는 화면의 세트 이름('exam:<회차>'), data 는 화면이 이 기기에 두는 것과 같은 모양:
//   { ans:[번호…](탐구·수학·한국사) | pa:{문항:번호}(국어·영어), g:1(채점함), gs:선택과목, left:남은 초, ut:타이머 씀 } — 다시 풀기는 빈 {}.
const ID = /^exam:[a-z0-9][a-z0-9-]{0,39}$/;
const PA_KEY = /^[a-c][0-9]{1,2}$/;
export const MAX_STATE = 4000;   // JSON 길이
export const MAX_LIST = 400;

// 처음 쓸 때 표가 없으면 만든다(d1/migrations/0008_exam_states.sql 과 같은 문장)
export const EXAM_STATES_DDL = [
  'CREATE TABLE IF NOT EXISTS exam_states (user_id TEXT NOT NULL, sub TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (user_id, sub, id))',
];

export function validStateId(id) { return typeof id === 'string' && ID.test(id); }

const int = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;

export function parseState(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false };
  if (!validSub(body.sub) || !validStateId(body.id)) return { ok: false };
  if (!Number.isSafeInteger(body.ts) || body.ts < 0) return { ok: false };
  const d = body.data;
  if (!d || typeof d !== 'object' || Array.isArray(d)) return { ok: false };
  const out = {};
  if (d.ans !== undefined) {
    if (!Array.isArray(d.ans) || d.ans.length > 80 || !d.ans.every((a) => int(a, 99999))) return { ok: false };
    out.ans = d.ans;
  }
  if (d.pa !== undefined) {
    if (!d.pa || typeof d.pa !== 'object' || Array.isArray(d.pa)) return { ok: false };
    const keys = Object.keys(d.pa);
    if (keys.length > 120 || !keys.every((k) => PA_KEY.test(k) && int(d.pa[k], 9))) return { ok: false };
    out.pa = {};
    for (const k of keys) out.pa[k] = d.pa[k];
  }
  if (d.g) {
    out.g = 1;
    if (d.gs !== undefined && !(typeof d.gs === 'string' && /^[a-z]{0,8}$/.test(d.gs))) return { ok: false };
    out.gs = d.gs || '';
    if (d.left !== undefined) {
      if (typeof d.left !== 'number' || !Number.isFinite(d.left) || Math.abs(d.left) > 1e6) return { ok: false };
      out.left = Math.round(d.left);
    }
    out.ut = d.ut ? 1 : 0;
  }
  const data = JSON.stringify(out);
  if (data.length > MAX_STATE) return { ok: false };
  return { ok: true, state: { id: body.id, sub: body.sub, data, ts: body.ts } };
}
