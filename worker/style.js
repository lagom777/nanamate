// 내 정보(공부 성향) 저장 형식 검사. 글은 문자열 그대로 두고 화면에서 textContent 로만 그린다.
const MAX = { title: 60, summary: 600, source: 200, groups: 8, groupTitle: 40, items: 20, item: 300 };

function text(v, max) {
  if (v == null) return '';
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length > max ? null : s;
}

export function parseStyle(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false };
  const title = text(body.title, MAX.title);
  const summary = text(body.summary, MAX.summary);
  const source = text(body.source, MAX.source);
  if (title === null || summary === null || source === null) return { ok: false };
  if (!Array.isArray(body.groups) || body.groups.length > MAX.groups) return { ok: false };
  const groups = [];
  for (const g of body.groups) {
    if (!g || typeof g !== 'object' || Array.isArray(g) || !Array.isArray(g.items) || g.items.length > MAX.items) return { ok: false };
    const gt = text(g.title, MAX.groupTitle);
    if (gt === null) return { ok: false };
    const items = [];
    for (const x of g.items) {
      const t = text(x, MAX.item);
      if (t === null) return { ok: false };
      if (t) items.push(t);
    }
    if (gt || items.length) groups.push({ title: gt, items });
  }
  if (!title && !summary && !groups.length) return { ok: false };
  return { ok: true, style: { title, summary, groups, source } };
}
