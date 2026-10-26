// 오늘 다시 풀 오답: 틀린(또는 🤔 헷갈림 표시한) 문항을 1·3·7일 뒤에 다시 풀게 한다. 날짜는 한국 시간(KST) 하루 단위.
// 틀리면 다음 날부터 다시 시작하고, 예정일이나 그 뒤에 맞히면 다음 간격(3일·7일)으로, 7일 복습까지 맞히면 끝난다.
// 예정일 전에 맞힌 것(틀리고 바로 고친 것 등)은 복습으로 치지 않는다.
const DAY = 86400000;
const KST = 9 * 3600000;
export const STEPS = [1, 3, 7];

export function kstDay(ms) { return Math.floor((ms + KST) / DAY); }
export function dayStr(day) { return new Date(day * DAY).toISOString().slice(0, 10); }

// attempts: [{ sub, exam, q, ok, ts }], flags: [{ sub, exam, q, unsure, ts }] — unsure 는 표시한 시각(예전 값 1 이면 ts)
export function schedule(attempts, flags) {
  const byKey = new Map();
  const get = (sub, exam, q) => {
    const k = sub + '|' + exam + '|' + q;
    if (!byKey.has(k)) byKey.set(k, { sub, exam, q, ev: [] });
    return byKey.get(k);
  };
  for (const a of attempts) get(a.sub, a.exam, a.q).ev.push({ ts: a.ts, ok: a.ok ? 1 : 0 });
  for (const f of flags) if (f.unsure) get(f.sub, f.exam, f.q).ev.push({ ts: f.unsure > 1 ? f.unsure : f.ts, ok: 0, flag: 1 });
  const out = [];
  for (const e of byKey.values()) {
    e.ev.sort((x, y) => x.ts - y.ts || x.ok - y.ok);
    let stage = -1, due = null, why = '';
    for (const v of e.ev) {
      const d = kstDay(v.ts);
      if (!v.ok) { stage = 0; due = d + STEPS[0]; why = v.flag ? 'unsure' : 'wrong'; continue; }
      if (due === null || d < due) continue;
      stage++;
      due = stage < STEPS.length ? d + STEPS[stage] : null;
    }
    if (due !== null) out.push({ sub: e.sub, exam: e.exam, q: e.q, stage, due, why });
  }
  return out;
}

// 오늘(밀린 것 포함) 풀 것과 앞으로 7일 동안 날짜별 개수
export function dueList(attempts, flags, now) {
  const today = kstDay(now);
  const all = schedule(attempts, flags);
  const due = all.filter((x) => x.due <= today)
    .sort((a, b) => (a.sub < b.sub ? -1 : a.sub > b.sub ? 1 : 0) || (a.exam < b.exam ? 1 : a.exam > b.exam ? -1 : 0) || a.q - b.q)
    .map((x) => ({ sub: x.sub, exam: x.exam, q: x.q, step: STEPS[x.stage], late: today - x.due, why: x.why }));
  const next = {};
  for (const x of all) if (x.due > today && x.due <= today + 7) next[x.due] = (next[x.due] || 0) + 1;
  return { today: dayStr(today), due, next: Object.keys(next).map(Number).sort((a, b) => a - b).map((d) => ({ date: dayStr(d), n: next[d] })) };
}
