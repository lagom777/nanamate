import { validExam, validSub } from './attempts.js';

// 문제별 메모·선지 표시 검사. q: 1~199(국어 언매 35~45 는 135~145), marks: '' 또는 다섯 글자 o·t·x·-
// unsure(헷갈림 0·1)·cause(오답 원인)는 보내지 않으면 null — 저장된 값을 그대로 둔다(예전 화면이 지우지 않게)
const MARKS = /^[otx-]{5}$/;
export const CAUSES = ['concept', 'cond', 'choice', 'calc', 'time'];

export function parseNotes(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || !Array.isArray(body.notes)) return { ok: false };
  if (body.notes.length > 200) return { ok: false };
  const notes = [];
  for (const n of body.notes) {
    if (!n || typeof n !== 'object' || Array.isArray(n)) return { ok: false };
    if (!validExam(n.exam) || !validSub(n.sub)) return { ok: false };
    if (!Number.isInteger(n.q) || n.q < 1 || n.q > 199) return { ok: false };
    if (typeof n.marks !== 'string' || (n.marks !== '' && !MARKS.test(n.marks))) return { ok: false };
    if (typeof n.memo !== 'string' || n.memo.length > 1000) return { ok: false };
    if (!Number.isSafeInteger(n.ts) || n.ts < 0) return { ok: false };
    if (n.unsure !== undefined && n.unsure !== 0 && n.unsure !== 1) return { ok: false };
    if (n.cause !== undefined && n.cause !== '' && !CAUSES.includes(n.cause)) return { ok: false };
    notes.push({
      exam: n.exam, sub: n.sub, q: n.q, marks: n.marks === '-----' ? '' : n.marks, memo: n.memo,
      unsure: n.unsure === undefined ? null : n.unsure, cause: n.cause === undefined ? null : n.cause, ts: n.ts,
    });
  }
  return { ok: true, notes };
}
