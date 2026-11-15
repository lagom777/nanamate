/* 과목 첫 화면의 '이 단원은 결국 이걸 배운다' 표에 단원별 정답률을 붙인다. 브라우저·node 공용(세는 함수만 node 에서 쓴다).
 * 풀이 기록은 풀어보기가 이 기기에 두는 sn:<과목>:done(문항 id → [맞음 1·0, 시각, 고른 답])이고, 로그인했으면 계정 기록(/api/done)도 합친다.
 * 범위(수능 · 모의평가 · 둘 다)는 풀어보기에서 고른 것(sn:src)을 따른다. 세는 방법은 practice.js 의 doneCount 와 같다. */
(function (root) {
  function inSrc(e, src) { return src === 'all' || (src === 'csat') === (e.kind === 'csat'); }
  function right(key, picked) { return Array.isArray(key) ? key.indexOf(picked) >= 0 : key === picked; }
  /* go: 'part:p3' 또는 'topic:p3b', 쉼표로 여러 개('topic:p6a,topic:p6b') → { n 전체, done 푼 수, ok 맞은 수 } */
  function count(exams, sub, go, done, src) {
    var list = String(go).split(',');
    if (list.length > 1) return list.reduce(function (t, g) { var x = count(exams, sub, g, done, src); return { n: t.n + x.n, done: t.done + x.done, ok: t.ok + x.ok }; }, { n: 0, done: 0, ok: 0 });
    var kind = go.split(':')[0], id = go.split(':')[1], c = { n: 0, done: 0, ok: 0 };
    exams.forEach(function (e) {
      var s = e[sub];
      if (!s || !inSrc(e, src)) return;
      for (var n = 1; n <= s.a.length; n++) {
        var u = s.u ? s.u[n - 1] : null;
        var hit = kind === 'topic' ? u === id : (!!s.t && s.t[n - 1] === id && u !== 'x');
        if (!hit) continue;
        c.n++;
        var d = done[e.key + '/' + n];
        if (!d) continue;
        c.done++;
        if (d[2] ? right(s.a[n - 1], d[2]) : d[0]) c.ok++;   // 고른 답이 있으면 지금 정답표로 다시 채점
      }
    });
    return c;
  }
  /* 계정 기록을 이 기기 기록에 합친다(늦은 쪽이 남는다) */
  function merge(done, rows) {
    (rows || []).forEach(function (r) {
      var id = r.exam + '/' + r.q, d = done[id];
      if (!d || d[1] <= r.ts) done[id] = [r.ok ? 1 : 0, r.ts, r.picked || (d && d[2]) || 0];
    });
    return done;
  }
  var api = { count: count, merge: merge };
  root.SnCoreAcc = api;
  if (typeof module !== 'undefined') { module.exports = api; return; }
  if (typeof document === 'undefined') return;

  var SRC_NAME = { csat: '수능', mock: '모의평가', all: '수능+모의평가' };
  function get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function paint(sec, exams, sub, done, src) {
    var rows = [].slice.call(sec.querySelectorAll('.core-row[data-go]')), any = false, total = { n: 0, done: 0, ok: 0 }, seen = {};
    rows.forEach(function (row, i) {
      if (row.dataset.i == null) row.dataset.i = i;
      var c = count(exams, sub, row.dataset.go, done, src), box = row.querySelector('.core-acc') || row.appendChild(el('div', 'core-acc'));
      box.textContent = '';
      var pct = c.done ? Math.round(c.ok / c.done * 100) : null;
      row.dataset.pct = pct == null ? '' : pct;
      row.classList.toggle('weak', pct != null && pct < 50);
      var bar = el('span', 'core-bar'), okB = el('i', 'ok'), noB = el('i', 'no');
      okB.style.width = (c.n ? c.ok / c.n * 100 : 0).toFixed(1) + '%';
      noB.style.width = (c.n ? (c.done - c.ok) / c.n * 100 : 0).toFixed(1) + '%';
      bar.appendChild(okB); bar.appendChild(noB);
      bar.setAttribute('role', 'img');
      bar.setAttribute('aria-label', '전체 ' + c.n + '문항 중 맞음 ' + c.ok + ', 틀림 ' + (c.done - c.ok) + ', 안 풂 ' + (c.n - c.done));
      box.appendChild(bar);
      if (pct == null) box.appendChild(el('span', 'core-num none', c.n ? '아직 안 풂 · ' + c.n + '문항' : '문항 없음'));
      else {
        any = true;
        var num = el('span', 'core-num' + (pct >= 80 ? ' hi' : pct < 50 ? ' lo' : ''));
        num.appendChild(el('b', null, pct + '%'));
        num.appendChild(document.createTextNode(' ' + c.ok + '/' + c.done + ' 맞음 · 푼 ' + c.done + '/' + c.n));
        box.appendChild(num);
        if (pct < 50) box.appendChild(el('span', 'core-again', '다시 보기'));
      }
      if (!seen[row.dataset.go]) { seen[row.dataset.go] = 1; total.n += c.n; total.done += c.done; total.ok += c.ok; }
    });
    var head = sec.querySelector('.core-acc-head');
    if (!head) { head = el('div', 'core-acc-head'); sec.insertBefore(head, sec.querySelector('.core-list')); }
    head.textContent = '';
    var lab = el('span', 'core-acc-sum');
    lab.appendChild(document.createTextNode('내 정답률 (' + SRC_NAME[src] + ' 기출): '));
    if (total.done) { lab.appendChild(el('b', null, Math.round(total.ok / total.done * 100) + '%')); lab.appendChild(document.createTextNode(' · 맞음 ' + total.ok + ' / 푼 ' + total.done + ' · 전체 ' + total.n + '문항')); }
    else lab.appendChild(document.createTextNode('아직 푼 문제가 없습니다. ‘기출 →’로 풀면 여기에 단원별 정답률이 쌓입니다.'));
    head.appendChild(lab);
    if (any) {
      var list = sec.querySelector('.core-list'), sorted = sec.dataset.sort === '1';
      var btn = el('button', 'core-sort', sorted ? '단원 순서로' : '정답률 낮은 순으로');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', sorted ? 'true' : 'false');
      btn.addEventListener('click', function () { sec.dataset.sort = sorted ? '' : '1'; paint(sec, exams, sub, done, src); });
      head.appendChild(btn);
      rows.slice().sort(function (a, b) {
        if (!sorted) return a.dataset.i - b.dataset.i;
        var x = a.dataset.pct === '' ? 999 : +a.dataset.pct, y = b.dataset.pct === '' ? 999 : +b.dataset.pct;
        return x - y || a.dataset.i - b.dataset.i;
      }).forEach(function (r) { list.appendChild(r); });
    }
  }

  function boot() {
    var sec = document.querySelector('.core-sec[data-sub]');
    if (!sec) return;
    var sub = sec.dataset.sub, src = get('sn:src');
    if (src !== 'mock' && src !== 'all') src = 'csat';
    fetch('../suneung-exam/exams.json').then(function (r) { return r.json(); }).then(function (j) {
      var exams = j.exams, done = get('sn:' + sub + ':done') || {};
      paint(sec, exams, sub, done, src);
      // 로그인했으면 다른 기기에서 푼 것도 합쳐 다시 그린다(로그인 안 했으면 401 — 조용히 넘어간다)
      fetch('/api/done?sub=' + encodeURIComponent(sub), { credentials: 'same-origin', cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (rows) { if (rows && rows.length) paint(sec, exams, sub, merge(done, rows), src); })
        .catch(function () {});
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(typeof window !== 'undefined' ? window : globalThis);
