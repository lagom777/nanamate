const EXAM = /^[0-9]{4}-(?:csat|jun|sep)$/;
const SUB = /^[a-z][a-z0-9]{0,15}$/;

export function validExam(s) { return typeof s === 'string' && EXAM.test(s); }
export function validSub(s) { return typeof s === 'string' && SUB.test(s); }

export function parseAttempts(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || !Array.isArray(body.attempts)) return { ok: false };
  if (body.attempts.length > 200) return { ok: false };
  const attempts = [];
  for (const a of body.attempts) {
    if (!a || typeof a !== 'object' || Array.isArray(a)) return { ok: false };
    if (!validExam(a.exam) || !validSub(a.sub)) return { ok: false };
    if (!Number.isInteger(a.q) || a.q < 1 || a.q > 99) return { ok: false };
    if (!Number.isInteger(a.picked) || a.picked < 0 || a.picked > 999) return { ok: false };
    if (a.ok !== 0 && a.ok !== 1) return { ok: false };
    if (!Number.isInteger(a.ts) || a.ts < 0 || !Number.isSafeInteger(a.ts)) return { ok: false };
    attempts.push({ exam: a.exam, sub: a.sub, q: a.q, picked: a.picked, ok: a.ok, ts: a.ts });
  }
  return { ok: true, attempts };
}
