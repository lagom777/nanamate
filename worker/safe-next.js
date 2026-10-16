export function safeNext(next) {
  if (typeof next !== 'string' || !next || next.length > 512) return '/';
  if (next[0] !== '/' || next[1] === '/' || next[1] === '\\') return '/';
  if (next.includes('\\') || next.includes('//')) return '/';
  for (let i = 0; i < next.length; i++) {
    const c = next.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return '/';
  }
  return next;
}

export function failedNext(next) {
  const path = safeNext(next);
  const i = path.indexOf('#');
  const base = i >= 0 ? path.slice(0, i) : path;
  const hash = i >= 0 ? path.slice(i) : '';
  return base + (base.includes('?') ? '&' : '?') + 'login=failed' + hash;
}
