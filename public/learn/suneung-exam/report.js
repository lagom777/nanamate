/* 수능 오답 분석 마크다운·인쇄용 HTML. 브라우저·node 공용. 입력만으로 문자열을 만든다. */
(function (root) {
  var CIRC = ['①', '②', '③', '④', '⑤'];
  var PROMPT = '아래는 내 수능 SUB 풀이 기록이다. 단원별 약점, 반복되는 실수 유형(틀린 진술을 옳다고 본 것 / 옳은 진술을 놓친 것 / 계산·자료 해석 실수 등), 시간에 따른 변화를 분석하고, 우선순위를 정해 앞으로 2주 학습 계획을 제안해 줘. 근거는 아래 기록의 날짜·문항을 인용해서 말해 줘. 풀이 시간 기록으로 서두름(빠르고 틀림)·막힘(오래 걸리고 틀림)·찍기 의심(매우 빠르고 틀림이 반복)도 같이 판단해 줘. 이상치 표시는 자리를 비운 시간이니 무시해 줘.';
  var OUTLIER_MS = 600000;
  var BUCKETS = [
    { name: '30초 미만', max: 30000 },
    { name: '30~90초', max: 90000 },
    { name: '90초~3분', max: 180000 },
    { name: '3분 이상', max: Infinity }
  ];

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

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function readMs(a) {
    if (a.ms == null || a.ms === '') return null;
    var n = Number(a.ms);
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  }

  function readMode(a) {
    if (a.mode === 'exam' || a.mode === 'practice') return a.mode;
    return null;
  }

  function fmtSec(ms) {
    if (ms == null) return '-';
    return Math.round(ms / 1000) + '초';
  }

  function outlierNote(ms) {
    return '(이상치 ' + Math.round(ms / 60000) + '분, 통계 제외)';
  }

  function histItem(r, num) {
    var s = kstDate(r.ts) + ' ' + pickLabel(r.picked, num);
    if (r.ok) s += '✔';
    if (r.ms == null) return s;
    if (r.ms > OUTLIER_MS) return s + ' ' + outlierNote(r.ms);
    return s + ' ' + Math.round(r.ms / 1000) + '초';
  }

  function historyLine(g) {
    return g.rows.map(function (r) { return histItem(r, g.meta.num); }).join(', ');
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

  function avg(vals) {
    if (!vals.length) return null;
    var s = 0;
    for (var i = 0; i < vals.length; i++) s += vals[i];
    return s / vals.length;
  }

  function median(vals) {
    if (!vals.length) return null;
    var s = vals.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(s.length / 2);
    if (s.length % 2) return s[mid];
    return (s[mid - 1] + s[mid]) / 2;
  }

  function bucketOf(ms) {
    for (var i = 0; i < BUCKETS.length; i++) if (ms < BUCKETS[i].max) return i;
    return BUCKETS.length - 1;
  }

  function answerLine(g) {
    var mine = '내가 고른 답(최신): ' + pickLabel(g.latest.picked, g.meta.num);
    var ans = ansLabel(g.meta.ans, g.meta.num);
    if (ans) mine += ' / 정답: ' + ans;
    return mine;
  }

  function analyze(opts) {
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
        ms: readMs(a),
        mode: readMode(a),
        i: i
      });
    }
    if (!raw.length) return null;

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

    var timed = [];
    var outlierN = 0;
    raw.forEach(function (a) {
      if (a.ms == null) return;
      if (a.ms > OUTLIER_MS) { outlierN++; return; }
      timed.push(a);
    });
    var buckets = BUCKETS.map(function (b) { return { name: b.name, n: 0, ok: 0 }; });
    var hit = [], miss = [];
    var byPartTime = {};
    timed.forEach(function (a) {
      var b = buckets[bucketOf(a.ms)];
      b.n++;
      if (a.ok) b.ok++;
      (a.ok ? hit : miss).push(a.ms);
      var meta = qMeta(opts.exams, opts.sub, a.exam, a.q);
      var name = partOf(meta, opts.partName);
      if (!byPartTime[name]) byPartTime[name] = { name: name, n: 0, ok: 0, sum: 0 };
      byPartTime[name].n++;
      byPartTime[name].sum += a.ms;
      if (a.ok) byPartTime[name].ok++;
    });
    var partTimes = Object.keys(byPartTime).map(function (k) {
      var p = byPartTime[k];
      p.avg = p.sum / p.n;
      return p;
    });
    partTimes.sort(function (a, b) {
      if (a.avg !== b.avg) return b.avg - a.avg;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    var modeOrder = [{ key: 'exam', name: '시험' }, { key: 'practice', name: '연습' }, { key: '', name: '미기록' }];
    var modeMap = {};
    modeOrder.forEach(function (m) { modeMap[m.key] = { name: m.name, n: 0, ok: 0 }; });
    raw.forEach(function (a) {
      var k = a.mode || '';
      modeMap[k].n++;
      if (a.ok) modeMap[k].ok++;
    });
    var modes = modeOrder.map(function (m) { return modeMap[m.key]; }).filter(function (m) { return m.n; });
    var msVals = timed.map(function (a) { return a.ms; });

    return {
      opts: opts,
      label: opts.subLabel || '',
      raw: raw,
      groups: groups,
      parts: parts,
      byDate: byDate,
      dates: dates,
      current: current,
      repeated: repeated,
      fixed: fixed,
      minTs: minTs,
      maxTs: maxTs,
      time: {
        n: timed.length,
        outlierN: outlierN,
        median: median(msVals),
        mean: avg(msVals),
        buckets: buckets,
        hit: avg(hit),
        miss: avg(miss),
        parts: partTimes,
        modes: modes
      }
    };
  }

  function timeSummary(t) {
    return '풀이 시간(이상치 제외): 중앙값 ' + fmtSec(t.median) + ', 평균 ' + fmtSec(t.mean) + ', 측정된 시도 ' + t.n + '회, 이상치 ' + t.outlierN + '회';
  }

  function hitSummary(t) {
    return '맞힌 문항 평균 ' + fmtSec(t.hit) + ', 틀린 문항 평균 ' + fmtSec(t.miss);
  }

  function buildReport(opts) {
    var model = analyze(opts);
    if (!model) return '아직 기록이 없습니다\n';
    var lines = [];
    lines.push('# 수능 ' + model.label + ' 오답 분석 자료 (' + kstDate(model.opts.now) + ')');
    lines.push('');
    lines.push('## 이 파일 사용법');
    lines.push('(아래 프롬프트를 그대로 AI 에게 붙여 넣으면 됨. 문항 이미지 링크는 이미지를 볼 수 있는 AI 에게만 유용.)');
    lines.push('');
    lines.push('> ' + PROMPT.split('SUB').join(model.label));
    lines.push('');
    lines.push('## 요약');
    lines.push('- 기간: ' + kstDate(model.minTs) + ' ~ ' + kstDate(model.maxTs) + ', 총 시도 ' + model.raw.length + '회(문항 ' + model.groups.length + '개), 현재 오답 ' + model.current.length + '개');
    lines.push('- ' + timeSummary(model.time));
    lines.push('');
    lines.push('### 단원별 (시도 문항 기준 최신 시도 정오)');
    lines.push('| 단원 | 푼 문항 | 맞힘 | 정답률 |');
    lines.push('| --- | --- | --- | --- |');
    model.parts.forEach(function (p) {
      lines.push('| ' + cell(p.name) + ' | ' + p.n + ' | ' + p.ok + ' | ' + pct(p.ok, p.n) + ' |');
    });
    lines.push('');
    lines.push('### 날짜별 (그날 시도의 정답률)');
    lines.push('| 날짜 | 시도 | 정답 | 정답률 |');
    lines.push('| --- | --- | --- | --- |');
    model.dates.forEach(function (d) {
      var row = model.byDate[d];
      lines.push('| ' + row.d + ' | ' + row.n + ' | ' + row.ok + ' | ' + pct(row.ok, row.n) + ' |');
    });
    lines.push('');
    lines.push('### 시간 구간별 정답률');
    lines.push('| 구간 | 시도 | 정답 | 정답률 |');
    lines.push('| --- | --- | --- | --- |');
    model.time.buckets.forEach(function (b) {
      lines.push('| ' + b.name + ' | ' + b.n + ' | ' + b.ok + ' | ' + pct(b.ok, b.n) + ' |');
    });
    lines.push('');
    lines.push('### 맞힌 문항 vs 틀린 문항 평균 시간');
    lines.push(hitSummary(model.time));
    lines.push('');
    lines.push('### 단원별 평균 풀이 시간');
    if (!model.time.parts.length) {
      lines.push('없음');
    } else {
      lines.push('| 단원 | 평균초 | 정답률 |');
      lines.push('| --- | --- | --- |');
      model.time.parts.forEach(function (p) {
        lines.push('| ' + cell(p.name) + ' | ' + Math.round(p.avg / 1000) + ' | ' + pct(p.ok, p.n) + ' |');
      });
    }
    lines.push('');
    lines.push('### 모드별(시험/연습) 정답률');
    lines.push('| 모드 | 시도 | 정답 | 정답률 |');
    lines.push('| --- | --- | --- | --- |');
    model.time.modes.forEach(function (m) {
      lines.push('| ' + m.name + ' | ' + m.n + ' | ' + m.ok + ' | ' + pct(m.ok, m.n) + ' |');
    });
    lines.push('');
    lines.push('## 현재 오답 (문항별 최신 시도가 오답)');
    if (!model.current.length) {
      lines.push('없음');
    } else {
      model.current.slice(0, 60).forEach(function (g) {
        lines.push('');
        lines.push(detailHead(g, model.opts.partName));
        lines.push('- 시도 기록: ' + historyLine(g));
        lines.push('- ' + answerLine(g));
        var trap = trapText(model.opts.trap, g);
        if (trap) lines.push('- 왜 이 선지를 골랐을까: ' + trap);
        var exp = explainText(model.opts.explain, g);
        if (exp) lines.push('- 정답 해설: ' + exp);
        lines.push('- 문항 이미지: ' + imgUrl(model.opts.imgBase, g.exam, model.opts.sub, g.q));
      });
      if (model.current.length > 60) {
        lines.push('');
        lines.push('외 ' + (model.current.length - 60) + '문항');
      }
    }
    lines.push('');
    lines.push('## 반복해서 틀린 문항 (오답 시도 2회 이상)');
    if (!model.repeated.length) lines.push('없음');
    model.repeated.forEach(function (g) {
      lines.push('- ' + g.meta.title + ' ' + g.q + '번 · 오답 ' + g.wrongN + '회 · ' + wrongPicks(g));
    });
    lines.push('');
    lines.push('## 틀렸다가 고친 문항');
    if (!model.fixed.length) lines.push('없음');
    model.fixed.forEach(function (g) {
      lines.push('- ' + g.meta.title + ' ' + g.q + '번 · 오답 ' + g.wrongN + '회 후 맞춤');
    });

    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    return lines.join('\n') + '\n';
  }

  function htmlTable(headers, rows) {
    var h = '<tr>' + headers.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr>';
    var b = rows.map(function (r) {
      return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<table>' + h + b + '</table>';
  }

  function buildReportHtml(opts) {
    var model = analyze(opts);
    opts = opts || {};
    var label = model ? model.label : (opts.subLabel || '');
    var title = '수능 ' + label + ' 오답 분석 자료' + (model ? ' (' + kstDate(opts.now) + ')' : '');
    var parts = [];
    parts.push('<!doctype html>');
    parts.push('<html lang="ko">');
    parts.push('<head>');
    parts.push('<meta charset="utf-8">');
    parts.push('<title>' + esc(title) + '</title>');
    parts.push('<style>');
    parts.push('body{margin:24px;color:#17202a;font:15px/1.55 sans-serif}');
    parts.push('h1{font-size:22px;margin:0 0 12px}h2{font-size:18px;margin:22px 0 8px}h3{font-size:16px;margin:16px 0 6px}');
    parts.push('table{border-collapse:collapse;margin:0 0 8px}th,td{border:1px solid #d5dbe3;padding:4px 8px;text-align:left}');
    parts.push('blockquote{margin:8px 0 16px;padding:8px 12px;background:#f4f7fb}');
    parts.push('.q{margin:0 0 28px}img{max-width:100%;height:auto;display:block}');
    parts.push('.noprint{margin:0 0 16px}.noprint button{font:inherit;padding:8px 14px;cursor:pointer}');
    parts.push('.hint{color:#526071;margin:0 0 8px}');
    parts.push('@media print{.noprint{display:none}.q{break-inside:avoid;page-break-inside:avoid}img{max-width:100%}}');
    parts.push('</style>');
    parts.push('</head>');
    parts.push('<body>');
    parts.push('<div class="noprint"><button type="button" onclick="window.print()">PDF로 저장</button>');
    parts.push('<p class="hint">인쇄 창에서 대상(PDF로 저장)을 고르면 이 보고서가 파일로 남습니다.</p></div>');
    if (!model) {
      parts.push('<h1>' + esc(title) + '</h1>');
      parts.push('<p>아직 기록이 없습니다</p>');
      parts.push('</body></html>');
      return parts.join('\n');
    }
    parts.push('<h1>' + esc(title) + '</h1>');
    parts.push('<h2>이 파일 사용법</h2>');
    parts.push('<p class="hint">아래 프롬프트를 그대로 AI 에게 붙여 넣으면 됩니다. 문항 이미지는 이 문서에 포함되어 있습니다.</p>');
    parts.push('<blockquote>' + esc(PROMPT.split('SUB').join(model.label)) + '</blockquote>');
    parts.push('<h2>요약</h2>');
    parts.push('<ul>');
    parts.push('<li>기간: ' + esc(kstDate(model.minTs) + ' ~ ' + kstDate(model.maxTs) + ', 총 시도 ' + model.raw.length + '회(문항 ' + model.groups.length + '개), 현재 오답 ' + model.current.length + '개') + '</li>');
    parts.push('<li>' + esc(timeSummary(model.time)) + '</li>');
    parts.push('</ul>');
    parts.push('<h3>단원별 (시도 문항 기준 최신 시도 정오)</h3>');
    parts.push(htmlTable(['단원', '푼 문항', '맞힘', '정답률'], model.parts.map(function (p) {
      return [p.name, p.n, p.ok, pct(p.ok, p.n)];
    })));
    parts.push('<h3>날짜별 (그날 시도의 정답률)</h3>');
    parts.push(htmlTable(['날짜', '시도', '정답', '정답률'], model.dates.map(function (d) {
      var row = model.byDate[d];
      return [row.d, row.n, row.ok, pct(row.ok, row.n)];
    })));
    parts.push('<h3>시간 구간별 정답률</h3>');
    parts.push(htmlTable(['구간', '시도', '정답', '정답률'], model.time.buckets.map(function (b) {
      return [b.name, b.n, b.ok, pct(b.ok, b.n)];
    })));
    parts.push('<h3>맞힌 문항 vs 틀린 문항 평균 시간</h3>');
    parts.push('<p>' + esc(hitSummary(model.time)) + '</p>');
    parts.push('<h3>단원별 평균 풀이 시간</h3>');
    if (!model.time.parts.length) parts.push('<p>없음</p>');
    else parts.push(htmlTable(['단원', '평균초', '정답률'], model.time.parts.map(function (p) {
      return [p.name, Math.round(p.avg / 1000), pct(p.ok, p.n)];
    })));
    parts.push('<h3>모드별(시험/연습) 정답률</h3>');
    parts.push(htmlTable(['모드', '시도', '정답', '정답률'], model.time.modes.map(function (m) {
      return [m.name, m.n, m.ok, pct(m.ok, m.n)];
    })));
    parts.push('<h2>현재 오답 (문항별 최신 시도가 오답)</h2>');
    if (!model.current.length) {
      parts.push('<p>없음</p>');
    } else {
      model.current.slice(0, 30).forEach(function (g) {
        var head = g.meta.title + ' ' + g.q + '번';
        if (g.meta.tag) head += ' · ' + partOf(g.meta, model.opts.partName);
        if (typeof g.meta.pts === 'number') head += ' · ' + g.meta.pts + '점';
        var src = imgUrl(model.opts.imgBase, g.exam, model.opts.sub, g.q);
        parts.push('<section class="q">');
        parts.push('<h3>' + esc(head) + '</h3>');
        parts.push('<img src="' + esc(src) + '" alt="' + esc(head) + '" loading="eager">');
        parts.push('<p>시도 기록: ' + esc(historyLine(g)) + '</p>');
        parts.push('<p>' + esc(answerLine(g)) + '</p>');
        var trap = trapText(model.opts.trap, g);
        if (trap) parts.push('<p>왜 이 선지를 골랐을까: ' + esc(trap) + '</p>');
        var exp = explainText(model.opts.explain, g);
        if (exp) parts.push('<p>정답 해설: ' + esc(exp) + '</p>');
        parts.push('</section>');
      });
      if (model.current.length > 30) parts.push('<p>외 ' + (model.current.length - 30) + '문항</p>');
    }
    parts.push('</body></html>');
    return parts.join('\n');
  }

  var api = { kstDate: kstDate, buildReport: buildReport, buildReportHtml: buildReportHtml };
  root.SnReport = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
