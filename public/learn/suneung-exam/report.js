/* 수능 오답 분석 마크다운. 브라우저·node 공용. 입력만으로 문자열을 만든다. */
(function (root) {
  var CIRC = ['①', '②', '③', '④', '⑤'];
  var PROMPT = '아래는 내 수능 SUB 풀이 기록이다. 단원별 약점, 반복되는 실수 유형(틀린 진술을 옳다고 본 것 / 옳은 진술을 놓친 것 / 계산·자료 해석 실수 등), 시간에 따른 변화를 분석하고, 우선순위를 정해 앞으로 2주 학습 계획을 제안해 줘. 근거는 아래 기록의 날짜·문항을 인용해서 말해 줘.';

  function kstDate(ms) {
    var n = Number(ms);
    if (!Number.isFinite(n)) n = 0;
    var d = new Date(n + 9 * 60 * 60 * 1000);
    var m = d.getUTCMonth() + 1;
    var day = d.getUTCDate();
    return d.getUTCFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function pad2(n) {
    n = Number(n);
    return (n < 10 ? '0' : '') + n;
  }

  function pct(ok, n) {
    if (!n) return '0%';
    var v = Math.round((ok / n) * 1000) / 10;
    if (v === Math.round(v)) return String(Math.round(v)) + '%';
    return v.toFixed(1) + '%';
  }

  function cell(v) {
    return String(v).replace(/\|/g, '/');
  }

  function pickLabel(picked, num) {
    if (num) return String(picked);
    var n = Number(picked);
    if (n >= 1 && n <= 5) return CIRC[n - 1];
    if (!n) return '-';
    return String(picked);
  }

  function ansLabel(ans, num) {
    if (ans === undefined || ans === null) return null;
    if (Array.isArray(ans)) {
      if (!ans.length) return null;
      return ans.map(function (x) { return pickLabel(x, num); }).join(' 또는 ');
    }
    if (ans === 0) return '없음';
    return pickLabel(ans, num);
  }

  function stripHtml(html) {
    var s = String(html)
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6]|tr|ol|ul|table)>/gi, ' ')
      .replace(/<[^>]+>/g, '');
    s = s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, function (m, body) {
      var low = body.toLowerCase();
      if (low === 'amp') return '&';
      if (low === 'lt') return '<';
      if (low === 'gt') return '>';
      if (low === 'quot') return '"';
      if (low === 'apos') return "'";
      if (low === 'nbsp') return ' ';
      if (low.charAt(0) === '#') {
        var cp = low.charAt(1) === 'x' ? parseInt(low.slice(2), 16) : parseInt(low.slice(1), 10);
        if (!cp || cp < 0 || cp > 0x10FFFF) return m;
        try { return String.fromCodePoint(cp); } catch (e) { return m; }
      }
      return m;
    });
    return s.replace(/\s+/g, ' ').trim();
  }

  function findExam(exams, key) {
    if (!exams) return null;
    for (var i = 0; i < exams.length; i++) if (exams[i] && exams[i].key === key) return exams[i];
    return null;
  }

  function qMeta(exams, sub, examKey, q) {
    var exam = findExam(exams, examKey);
    var sheet = exam && sub ? exam[sub] : null;
    var idx = q - 1;
    var ans = sheet && sheet.a && idx >= 0 && idx < sheet.a.length ? sheet.a[idx] : undefined;
    var pts = sheet && sheet.p && idx >= 0 && idx < sheet.p.length ? sheet.p[idx] : undefined;
    var tag = sheet && sheet.t && idx >= 0 && idx < sheet.t.length ? sheet.t[idx] : '';
    var num = false;
    if (sheet && sheet.n) {
      for (var i = 0; i < sheet.n.length; i++) if (Number(sheet.n[i]) === Number(q)) num = true;
    }
    return { title: (exam && exam.title) || examKey, ans: ans, pts: pts, tag: tag || '', num: num };
  }

  function partOf(meta, partName) {
    if (!meta.tag) return '기타';
    return (partName && partName[meta.tag]) || meta.tag;
  }

  function imgUrl(base, exam, sub, q) {
    var b = base || '';
    if (b && b.charAt(b.length - 1) !== '/') b += '/';
    return b + exam + '/' + (sub || '') + '/q' + pad2(q) + '.webp';
  }

  function trapText(trap, g) {
    if (g.meta.num || !trap) return '';
    var examTrap = trap[g.exam];
    if (!examTrap) return '';
    var t = examTrap[g.q] != null ? examTrap[g.q] : examTrap[String(g.q)];
    if (!t || !t.o) return '';
    var picked = g.latest.picked;
    var text = t.o[picked] != null ? t.o[picked] : t.o[String(picked)];
    if (!text) return '';
    return String(text).replace(/\s+/g, ' ').trim();
  }

  function explainText(explain, g) {
    if (!explain) return '';
    var examEx = explain[g.exam];
    if (!examEx) return '';
    var html = examEx[g.q] != null ? examEx[g.q] : examEx[String(g.q)];
    if (typeof html !== 'string') return '';
    var text = stripHtml(html);
    if (text.length > 400) text = text.slice(0, 400);
    return text;
  }

  function historyLine(g) {
    return g.rows.map(function (r) {
      return kstDate(r.ts) + ' ' + pickLabel(r.picked, g.meta.num) + (r.ok ? '✔' : '');
    }).join(', ');
  }

  function wrongPicks(g) {
    var out = [];
    g.rows.forEach(function (r) { if (!r.ok) out.push(pickLabel(r.picked, g.meta.num)); });
    return out.join(', ');
  }

  function detailHead(g, partName) {
    var s = '### ' + g.meta.title + ' ' + g.q + '번';
    if (g.meta.tag) s += ' · ' + partOf(g.meta, partName);
    if (typeof g.meta.pts === 'number') s += ' · ' + g.meta.pts + '점';
    return s;
  }

  function buildReport(opts) {
    opts = opts || {};
    var attempts = Array.isArray(opts.attempts) ? opts.attempts : [];
    var raw = [];
    for (var i = 0; i < attempts.length; i++) {
      var a = attempts[i];
      if (!a || a.exam == null || a.q == null) continue;
      raw.push({
        exam: String(a.exam),
        q: Number(a.q),
        picked: a.picked,
        ok: Number(a.ok) === 1 ? 1 : 0,
        ts: Number(a.ts) || 0,
        i: i
      });
    }
    if (!raw.length) return '아직 기록이 없습니다\n';

    var grouped = {};
    var groups = [];
    raw.forEach(function (a) {
      var key = a.exam + '/' + a.q;
      var g = grouped[key];
      if (!g) {
        g = grouped[key] = { exam: a.exam, q: a.q, rows: [] };
        groups.push(g);
      }
      g.rows.push(a);
    });
    groups.forEach(function (g) {
      g.rows.sort(function (x, y) { return x.ts - y.ts || x.i - y.i; });
      g.latest = g.rows[g.rows.length - 1];
      g.wrongN = 0;
      g.rows.forEach(function (r) { if (!r.ok) g.wrongN++; });
      g.meta = qMeta(opts.exams, opts.sub, g.exam, g.q);
    });

    var minTs = raw[0].ts, maxTs = raw[0].ts;
    raw.forEach(function (a) {
      if (a.ts < minTs) minTs = a.ts;
      if (a.ts > maxTs) maxTs = a.ts;
    });

    var byPart = {};
    groups.forEach(function (g) {
      var name = partOf(g.meta, opts.partName);
      if (!byPart[name]) byPart[name] = { name: name, n: 0, ok: 0 };
      byPart[name].n++;
      if (g.latest.ok) byPart[name].ok++;
    });
    var parts = Object.keys(byPart).map(function (k) { return byPart[k]; });
    parts.sort(function (a, b) {
      var ra = a.ok / a.n, rb = b.ok / b.n;
      if (ra !== rb) return ra - rb;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    var byDate = {};
    raw.forEach(function (a) {
      var d = kstDate(a.ts);
      if (!byDate[d]) byDate[d] = { d: d, n: 0, ok: 0 };
      byDate[d].n++;
      if (a.ok) byDate[d].ok++;
    });
    var dates = Object.keys(byDate).sort();

    var current = groups.filter(function (g) { return !g.latest.ok; });
    current.sort(function (a, b) { return b.latest.ts - a.latest.ts || b.latest.i - a.latest.i; });
    var repeated = groups.filter(function (g) { return g.wrongN >= 2; });
    repeated.sort(function (a, b) { return b.wrongN - a.wrongN || b.latest.ts - a.latest.ts; });
    var fixed = groups.filter(function (g) { return g.wrongN >= 1 && g.latest.ok; });
    fixed.sort(function (a, b) { return b.latest.ts - a.latest.ts || b.latest.i - a.latest.i; });

    var label = opts.subLabel || '';
    var lines = [];
    lines.push('# 수능 ' + label + ' 오답 분석 자료 (' + kstDate(opts.now) + ')');
    lines.push('');
    lines.push('## 이 파일 사용법');
    lines.push('(아래 프롬프트를 그대로 AI 에게 붙여 넣으면 됨. 문항 이미지 링크는 이미지를 볼 수 있는 AI 에게만 유용.)');
    lines.push('');
    lines.push('> ' + PROMPT.split('SUB').join(label));
    lines.push('');
    lines.push('## 요약');
    lines.push('- 기간: ' + kstDate(minTs) + ' ~ ' + kstDate(maxTs) + ', 총 시도 ' + raw.length + '회(문항 ' + groups.length + '개), 현재 오답 ' + current.length + '개');
    lines.push('');
    lines.push('### 단원별 (시도 문항 기준 최신 시도 정오)');
    lines.push('| 단원 | 푼 문항 | 맞힘 | 정답률 |');
    lines.push('| --- | --- | --- | --- |');
    parts.forEach(function (p) {
      lines.push('| ' + cell(p.name) + ' | ' + p.n + ' | ' + p.ok + ' | ' + pct(p.ok, p.n) + ' |');
    });
    lines.push('');
    lines.push('### 날짜별 (그날 시도의 정답률)');
    lines.push('| 날짜 | 시도 | 정답 | 정답률 |');
    lines.push('| --- | --- | --- | --- |');
    dates.forEach(function (d) {
      var row = byDate[d];
      lines.push('| ' + row.d + ' | ' + row.n + ' | ' + row.ok + ' | ' + pct(row.ok, row.n) + ' |');
    });
    lines.push('');
    lines.push('## 현재 오답 (문항별 최신 시도가 오답)');
    if (!current.length) {
      lines.push('없음');
    } else {
      current.slice(0, 60).forEach(function (g) {
        lines.push('');
        lines.push(detailHead(g, opts.partName));
        lines.push('- 시도 기록: ' + historyLine(g));
        var mine = '- 내가 고른 답(최신): ' + pickLabel(g.latest.picked, g.meta.num);
        var ans = ansLabel(g.meta.ans, g.meta.num);
        if (ans) mine += ' / 정답: ' + ans;
        lines.push(mine);
        var trap = trapText(opts.trap, g);
        if (trap) lines.push('- 왜 이 선지를 골랐을까: ' + trap);
        var exp = explainText(opts.explain, g);
        if (exp) lines.push('- 정답 해설: ' + exp);
        lines.push('- 문항 이미지: ' + imgUrl(opts.imgBase, g.exam, opts.sub, g.q));
      });
      if (current.length > 60) {
        lines.push('');
        lines.push('외 ' + (current.length - 60) + '문항');
      }
    }
    lines.push('');
    lines.push('## 반복해서 틀린 문항 (오답 시도 2회 이상)');
    if (!repeated.length) lines.push('없음');
    repeated.forEach(function (g) {
      lines.push('- ' + g.meta.title + ' ' + g.q + '번 · 오답 ' + g.wrongN + '회 · ' + wrongPicks(g));
    });
    lines.push('');
    lines.push('## 틀렸다가 고친 문항');
    if (!fixed.length) lines.push('없음');
    fixed.forEach(function (g) {
      lines.push('- ' + g.meta.title + ' ' + g.q + '번 · 오답 ' + g.wrongN + '회 후 맞춤');
    });

    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    return lines.join('\n') + '\n';
  }

  var api = { kstDate: kstDate, buildReport: buildReport };
  root.SnReport = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
