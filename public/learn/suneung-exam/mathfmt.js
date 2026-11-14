/* 저장된 해설(HTML)의 식을 읽기 쉽게 고친다. 브라우저·node 공용, 입력 문자열만으로 문자열을 만든다.
 *   - a/b 꼴을 위아래 분수로 (분자는 / 왼쪽에 붙은 묶음 전체, 분모는 / 오른쪽의 한 덩어리)
 *   - = × ÷ 앞뒤를 조금 띄운다
 * 값이 달라질 수 있는 것은 건드리지 않는다:
 *   - 분모 뒤에 글자·괄호가 바로 붙은 꼴(p²/2m, h/mv — (p²/2)m 인지 p²/(2m) 인지 갈린다)
 *   - 단위(m/s, cm/ms), 유전자형(Ab/aB — numOnly 과목은 숫자/숫자만 분수로), / 앞뒤에 빈칸이 있는 것, a/b/c 처럼 이어진 것
 * 분자를 넓게 잡아도(mv²/r → (mv²)/r) 곱셈은 순서를 바꿔도 같으므로 값은 그대로다. */
(function (root) {
  var UNIT = /^(m|s|cm|mm|km|nm|ms|g|kg|h|min|N|J|W|V|A|C|K|L|mL|mol|Hz|Pa|eV|MeV)$/;
  var LETTER = /[A-Za-zͰ-Ͽ①-⓿㉠-㉿]/;   // 로마자 · 그리스 문자 · ⓐ ㉠ 같은 기호

  function tokenize(html) {
    var out = [], i = 0, n = html.length, m;
    var reSuf = /^<(sub|sup)>([^<]*)<\/\1>/, reTag = /^<[^>]*>/, reEnt = /^&[#\w]+;/, reNum = /^\d+(?:\.\d+)?/;
    while (i < n) {
      var rest = html.slice(i), c = html[i];
      if (c === '<') {
        if ((m = reSuf.exec(rest))) { out.push({ t: 'suf', s: m[0] }); i += m[0].length; continue; }
        if ((m = reTag.exec(rest))) { out.push({ t: 'tag', s: m[0] }); i += m[0].length; continue; }
      }
      if (c === '&' && (m = reEnt.exec(rest))) { out.push({ t: 'x', s: m[0] }); i += m[0].length; continue; }
      if ((m = reNum.exec(rest))) { out.push({ t: 'num', s: m[0] }); i += m[0].length; continue; }
      if (/[\u00BD\u2153\u00BC\u00BE]/.test(c)) { out.push({ t: 'num', s: c }); i++; continue; }   // ½ ⅓ ¼ ¾
      if (/[\u00B2\u00B3\u00B9\u2070-\u209F\u2032\u2033\u00B0]/.test(c)) { out.push({ t: 'suf', s: c }); i++; continue; }   // ² ³ ₀ ′ ° 같은 첨자 글자
      if (LETTER.test(c)) {
        var j = i + 1;
        while (j < n && LETTER.test(html[j])) j++;
        out.push({ t: 'let', s: html.slice(i, j) }); i = j; continue;
      }
      if (c === '(' || c === ')' || c === '/' || c === '|') { out.push({ t: c, s: c }); i++; continue; }
      if (c === '√') { out.push({ t: 'rt', s: c }); i++; continue; }
      if (/\s/.test(c)) { out.push({ t: 'sp', s: c }); i++; continue; }
      out.push({ t: 'x', s: c }); i++;
    }
    return out;
  }
  /* 짝이 맞는 괄호를 묶음(grp)으로. 짝 없는 괄호는 보통 글자로 둔다 */
  function nest(toks) {
    var stack = [[]];
    toks.forEach(function (k) {
      if (k.t === '(') stack.push([]);
      else if (k.t === ')' && stack.length > 1) { var kids = stack.pop(); stack[stack.length - 1].push({ t: 'grp', kids: kids }); }
      else stack[stack.length - 1].push(k.t === ')' ? { t: 'x', s: ')' } : k);
    });
    while (stack.length > 1) { var open = stack.pop(), top = stack[stack.length - 1]; top.push({ t: 'x', s: '(' }); open.forEach(function (k) { top.push(k); }); }
    return bars(stack[0]);
  }
  /* 한 줄 안에서 짝이 맞는 |…| 는 절댓값 묶음으로(막대는 그대로 그린다). 안에 = 나 한글이 있으면 식의 한 덩어리가 아니다 */
  function bars(list) {
    list.forEach(function (k) { if (k.t === 'grp') k.kids = bars(k.kids); });
    var at = [];
    list.forEach(function (k, i) { if (k.t === '|') at.push(i); });
    if (!at.length) return list;
    var good = at.length % 2 === 0;
    for (var p = 0; good && p < at.length; p += 2) {
      var seg = list.slice(at[p] + 1, at[p + 1]);
      if (!seg.length || seg.some(function (k) { return k.t === 'tag' || (k.t === 'x' && /[=\uAC00-\uD7A3,.]/.test(k.s)); })) good = false;
    }
    var out = [], q = 0;
    list.forEach(function (k, i) {
      if (k.t !== '|') { if (!(good && q % 2 === 1)) out.push(k); return; }
      if (!good) { out.push({ t: 'x', s: '|' }); return; }
      if (q % 2 === 0) out.push({ t: 'grp', abs: true, kids: list.slice(i + 1, at[q + 1]) });
      q++;
    });
    return out;
  }
  function hasHangul(k) { return k.t === 'grp' && k.kids.some(function (c) { return (c.t === 'x' && /[\uAC00-\uD7A3]/.test(c.s)) || hasHangul(c); }); }
  function single(s) { return /^\u0394?.$/u.test(s); }   // 글자 하나, 또는 Δt 처럼 Δ 가 붙은 하나
  function isAtom(k) { return !!k && (k.t === 'num' || k.t === 'let' || (k.t === 'grp' && !hasHangul(k)) || k.t === 'rt' || k.t === 'frac'); }
  function wrap(k, inside) { return k.abs ? '|' + inside + '|' : '(' + inside + ')'; }

  function render(list, o, stat) {
    list = fractions(list, o, stat);
    var h = '';
    list.forEach(function (k, i) {
      var prev = list[i - 1], next = list[i + 1];
      if (k.t === 'frac') h += k.html;
      else if (k.t === 'grp') {
        var kids = fractions(k.kids, o, stat);
        var only = kids.length === 1 && kids[0].t === 'frac';
        var glued = prev && (prev.t === 'let' || prev.t === 'num' || prev.t === 'suf' || prev.t === 'grp' || prev.t === 'rt' || prev.t === 'frac');
        if (only && !k.abs && !glued && !(next && next.t === 'suf')) h += kids[0].html;   // (1/2)mv² → 분수 하나면 괄호를 뗀다
        else h += wrap(k, render(k.kids, o, stat));
      } else if (k.t === 'x' && /^[=×÷]$/.test(k.s)) {
        h += (prev && prev.t !== 'sp' ? ' ' : '') + k.s + (next && next.t !== 'sp' ? ' ' : '');
      } else h += k.s;
    });
    return h;
  }
  function fracHtml(numHtml, denHtml) {
    return '<span class="mf"><span class="mf-n">' + numHtml + '</span><span class="mf-s">/</span><span class="mf-d">' + denHtml + '</span></span>';
  }
  function fractions(list, o, stat) {
    var out = list.slice(), i = 0;
    while (i < out.length) {
      if (out[i].t !== '/') { i++; continue; }
      var a = i - 1, b = i + 1;
      // 분자: / 왼쪽에 빈칸 없이 붙은 묶음
      while (a >= 0 && (out[a].t === 'num' || out[a].t === 'let' || out[a].t === 'suf' || out[a].t === 'grp' || out[a].t === 'rt')) a--;
      a++;
      // m<sub>A</sub>g sinθ/(…) 처럼 빈칸 하나를 두고 sin·cos·tan 이 이어지면 앞의 곱까지 분자로 잡는다(숫자/숫자만 보는 과목은 빼고)
      if (!o.numOnly && a >= 2 && out[a - 1].t === 'sp' && out[a].t === 'let' && /^(sin|cos|tan)/.test(out[a].s) && (out[a - 2].t === 'let' || out[a - 2].t === 'suf')) {
        var a2 = a - 2;
        while (a2 >= 0 && (out[a2].t === 'num' || out[a2].t === 'let' || out[a2].t === 'suf' || out[a2].t === 'grp')) a2--;
        a = a2 + 1;
      }
      var num = out.slice(a, i), ok = num.length > 0 && num[0].t !== 'suf' && num[num.length - 1].t !== 'rt';
      if (ok && a > 0 && (out[a - 1].t === '/' || out[a - 1].t === 'frac')) ok = false;   // a/b/c 는 두지 않는다
      // 분모: 한 덩어리(+ 첨자), √ 는 다음 덩어리까지
      var den = [], d = b;
      if (ok && out[d] && out[d].t === 'rt') { den.push(out[d]); d++; }
      var k0 = out[d], k1 = out[d + 1];
      if (ok && k0 && (k0.t === 'num' || k0.t === 'grp' || (k0.t === 'let' && (single(k0.s) || /^(sin|cos|tan)[A-Za-z\u0370-\u03FF]$/.test(k0.s))))) { den.push(k0); d++; }
      else if (ok && k0 && k0.t === 'let' && /^(sin|cos|tan)$/.test(k0.s) && k1 && (k1.t === 'num' || k1.t === 'grp' || (k1.t === 'let' && single(k1.s)))) { den.push(k0, k1); d += 2; }   // sin45°
      else ok = false;
      while (ok && out[d] && out[d].t === 'suf') { den.push(out[d]); d++; }
      var mains = den.filter(function (k) { return k.t !== 'suf' && k.t !== 'rt'; }), main = mains[mains.length - 1];
      if (ok && main.t !== 'grp' && isAtom(out[d])) ok = false;   // 분모 뒤에 글자·괄호가 붙으면 뜻이 갈린다
      if (ok && out[d] && out[d].t === '/') ok = false;
      if (ok && o.numOnly && !(num.length === 1 && num[0].t === 'num' && main.t === 'num' && den.length === 1 && !(a > 0 && (out[a - 1].t === 'let' || out[a - 1].t === 'suf')))) ok = false;
      if (ok && num.length === 1 && num[0].t === 'let' && main.t === 'let' && UNIT.test(num[0].s) && UNIT.test(main.s)) {
        var before = out[a - 1];   // 식의 한가운데(= · × + − 바로 뒤, 괄호 안에 혼자)가 아니면 단위로 본다: 10 m/s, 단위 cm/ms
        var mathy = (a === 0 && list.inGroup) || (!!before && before.t === 'x' && /^[=·×+\u2212\-]$/.test(before.s));
        if (!mathy) ok = false;
      }
      if (!ok) { if (stat) stat.skip++; i++; continue; }
      var nh = num.length === 1 && num[0].t === 'grp' && !num[0].abs ? render(num[0].kids, o, stat) : num.map(function (k) { return k.t === 'grp' ? wrap(k, render(k.kids, o, stat)) : k.s; }).join('');
      var dh = den.map(function (k) { return k.t === 'grp' ? (den.length === 1 && !k.abs ? render(k.kids, o, stat) : wrap(k, render(k.kids, o, stat))) : k.s; }).join('');
      if (stat) stat.done++;
      out.splice(a, d - a, { t: 'frac', html: fracHtml(nh, dh) });
      i = a + 1;
    }
    return out;
  }
  function markGroups(list) { list.forEach(function (k) { if (k.t === 'grp') { k.kids.inGroup = true; markGroups(k.kids); } }); return list; }

  /* html: 해설 한 문항의 HTML. opts.numOnly: 숫자/숫자만 분수로(생명과학처럼 / 가 유전자형 표기에 쓰이는 과목) */
  function format(html, opts, stat) {
    html = String(html == null ? '' : html);
    if (html.indexOf('/') < 0 && !/[=×÷]/.test(html)) return html;
    try { return render(markGroups(nest(tokenize(html))), opts || {}, stat); } catch (e) { return html; }
  }

  var api = { format: format };
  root.SnMathFmt = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
