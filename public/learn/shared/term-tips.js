/* ============================================================
   nanamate · 용어 툴팁
   본문의 핵심 용어에 점선 밑줄을 긋고, 뜻·어원·기억 팁을 띄운다.
   데이터는 앞선 defer 스크립트가 window.NM_TERMS 에 넣는다.
   매칭 로직(NMTermTips)은 DOM 없이 동작한다.
   ============================================================ */

(function () {
  'use strict';

  /* 한글 음절·자모가 하나라도 있으면 조사 경계 검사를 하지 않는다. */
  var HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * terms → 매처. k·alt 를 모아 긴 표기 우선으로 정규식 하나를 만든다.
   * 한글이 없는 표기(ATP 등)만 앞뒤가 [A-Za-z0-9] 가 아닐 때로 제한한다.
   */
  function buildMatcher(terms) {
    var items = [];
    var seen = new Set();
    var list = Array.isArray(terms) ? terms : [];
    var i, j, term, surfaces, surface, fold;

    for (i = 0; i < list.length; i++) {
      term = list[i];
      if (!term || typeof term.k !== 'string' || term.k.length === 0) continue;
      surfaces = [term.k].concat(Array.isArray(term.alt) ? term.alt : []);
      for (j = 0; j < surfaces.length; j++) {
        surface = surfaces[j];
        if (typeof surface !== 'string' || surface.length === 0) continue;
        fold = surface.toLowerCase();
        if (seen.has(fold)) continue;
        seen.add(fold);
        items.push({
          term: term,
          surface: surface,
          latin: !HANGUL.test(surface)
        });
      }
    }

    items.sort(function (a, b) { return b.surface.length - a.surface.length; });

    var bySurface = new Map();
    for (i = 0; i < items.length; i++) {
      bySurface.set(items[i].surface.toLowerCase(), items[i].term);
    }

    if (!items.length) return { source: '', bySurface: bySurface };

    var source = items.map(function (item) {
      var body = escapeRe(item.surface);
      if (!item.latin) return body;
      return '(?<![A-Za-z0-9])' + body + '(?![A-Za-z0-9])';
    }).join('|');

    return { source: source, bySurface: bySurface };
  }

  /** 겹침은 긴 매칭만 남기고, 위치 순으로 [{start, end, term}] 를 반환한다. end 는 미포함. */
  function match(text, matcher) {
    if (!matcher || !matcher.source || typeof text !== 'string' || !text) return [];

    var re = new RegExp(matcher.source, 'gi');
    var found = [];
    var from = 0;
    var guard = 0;

    while (from < text.length && guard <= text.length) {
      re.lastIndex = from;
      var m = re.exec(text);
      if (!m || m.index < from) break;
      var raw = m[0];
      var term = raw ? matcher.bySurface.get(raw.toLowerCase()) : null;
      if (term) found.push({ start: m.index, end: m.index + raw.length, term: term });
      var next = m.index + 1;
      if (next <= from) break;
      from = next;
      guard += 1;
    }

    found.sort(function (a, b) {
      return (b.end - b.start) - (a.end - a.start) || a.start - b.start;
    });

    var kept = [];
    for (var i = 0; i < found.length; i++) {
      var hit = found[i];
      var clash = false;
      for (var j = 0; j < kept.length; j++) {
        if (hit.start < kept[j].end && kept[j].start < hit.end) {
          clash = true;
          break;
        }
      }
      if (!clash) kept.push(hit);
    }

    kept.sort(function (a, b) { return a.start - b.start; });
    return kept;
  }

  /** ch 가 있는 용어는 그 장(파일명 앞 두 자리)에서만 쓴다. 장 번호가 없는 페이지(요약 등)에서는 ch 용어를 뺀다. */
  function scope(terms, chap) {
    var list = Array.isArray(terms) ? terms : [];
    return list.filter(function (t) {
      return t && (!Array.isArray(t.ch) || t.ch.indexOf(chap) !== -1);
    });
  }

  window.NMTermTips = { buildMatcher: buildMatcher, match: match, scope: scope };

  if (typeof document === 'undefined') return;

  var EXCLUDE = 'h1, h2, a, button, script, style, textarea, input, select, svg, summary, code, pre, .paper-header, .nm-term, .nmt-list, .nmt-tip, .anx, .mg-wrap, #nm-game-host, #nm-quiz-host, [data-no-terms]';
  var OPEN_DELAY = 100;
  var CLOSE_DELAY = 150;
  var started = false;

  function storedOff() {
    try { return localStorage.getItem('nmt-off') === '1'; }
    catch (e) { return false; }
  }

  function writeOff(off) {
    try {
      if (off) localStorage.setItem('nmt-off', '1');
      else localStorage.removeItem('nmt-off');
    } catch (e) {}
  }

  function boot() {
    if (started) return;
    if (document.documentElement.lang !== 'ko') return;
    var chapMatch = location.pathname.match(/\/(\d\d)-[^/]*\.html$/);
    var terms = scope(window.NM_TERMS, chapMatch ? chapMatch[1] : '');
    if (terms.length === 0) return;

    var matcher = buildMatcher(terms);
    if (!matcher.source) return;
    started = true;

    var isOff = storedOff();
    if (isOff) document.documentElement.classList.add('nmt-off');

    var byKey = new Map();
    for (var t = 0; t < terms.length; t++) {
      if (terms[t] && typeof terms[t].k === 'string' && !byKey.has(terms[t].k)) {
        byKey.set(terms[t].k, terms[t]);
      }
    }

    var root = document.querySelector('main') || document.body;
    var firsts = wrapTerms(root, matcher, isOff);
    if (firsts.length >= 3) mountList(root, firsts);

    var tip = document.createElement('div');
    tip.className = 'nmt-tip';
    tip.id = 'nmt-tip';
    tip.setAttribute('role', 'tooltip');
    tip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tip);

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'nmt-toggle';
    toggleBtn.textContent = '🔤 어원';
    toggleBtn.setAttribute('aria-pressed', isOff ? 'false' : 'true');
    document.body.appendChild(toggleBtn);

    bindUi(root, tip, toggleBtn, byKey, isOff);
  }

  function excluded(node) {
    var parent = node.parentElement;
    if (!parent) return true;
    return !!parent.closest(EXCLUDE);
  }

  /** h2 와 h2 사이(첫 h2 앞의 도입부 포함)를 한 구역으로 본다. */
  function wrapTerms(root, matcher, isOff) {
    var nodes = [];
    var section = 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var node = walker.nextNode();
    while (node) {
      if (node.nodeType === 1) {
        if (node.tagName === 'H2') section += 1;
      } else if (node.nodeValue && /\S/.test(node.nodeValue) && !excluded(node)) {
        nodes.push({ node: node, section: section });
      }
      node = walker.nextNode();
    }

    var seenInSection = new Map();
    var seenDoc = new Set();
    var firsts = [];

    for (var i = 0; i < nodes.length; i++) {
      var item = nodes[i];
      var hits = match(item.node.nodeValue, matcher);
      if (!hits.length) continue;

      var bucket = seenInSection.get(item.section);
      if (!bucket) {
        bucket = new Set();
        seenInSection.set(item.section, bucket);
      }

      var keep = [];
      for (var h = 0; h < hits.length; h++) {
        var id = hits[h].term.k;
        if (bucket.has(id)) continue;
        bucket.add(id);
        keep.push(hits[h]);
      }
      if (!keep.length) continue;

      var spans = wrapNode(item.node, keep, isOff);
      for (var s = 0; s < keep.length; s++) {
        var key = keep[s].term.k;
        if (seenDoc.has(key)) continue;
        seenDoc.add(key);
        firsts.push({ term: keep[s].term, el: spans[s] });
      }
    }

    return firsts;
  }

  function wrapNode(textNode, hits, isOff) {
    var text = textNode.nodeValue;
    var frag = document.createDocumentFragment();
    var spans = [];
    var cursor = 0;

    for (var i = 0; i < hits.length; i++) {
      var hit = hits[i];
      if (hit.start < cursor || hit.end > text.length) continue;
      if (hit.start > cursor) frag.appendChild(document.createTextNode(text.slice(cursor, hit.start)));

      var span = document.createElement('span');
      span.className = 'nm-term';
      span.tabIndex = isOff ? -1 : 0;
      span.setAttribute('data-nmt', hit.term.k);
      span.setAttribute('role', 'button');
      span.setAttribute('aria-haspopup', 'true');
      span.textContent = text.slice(hit.start, hit.end);
      frag.appendChild(span);
      spans.push(span);
      cursor = hit.end;
    }

    if (cursor < text.length) frag.appendChild(document.createTextNode(text.slice(cursor)));
    textNode.parentNode.replaceChild(frag, textNode);
    return spans;
  }

  function mountList(root, firsts) {
    var box = document.createElement('details');
    box.className = 'nmt-list';

    var summary = document.createElement('summary');
    summary.textContent = '🔤 이 장의 용어 ' + firsts.length + '개 — 어원으로 한눈에 외우기';
    box.appendChild(summary);

    var rows = document.createElement('div');
    rows.className = 'nmt-rows';

    for (var i = 0; i < firsts.length; i++) {
      rows.appendChild(buildRow(firsts[i].term, firsts[i].el));
    }
    box.appendChild(rows);

    var header = root.querySelector('.paper-header');
    if (header) header.after(box);
    else if (root.firstChild) root.firstChild.after(box);
    else root.appendChild(box);
  }

  function buildRow(term, target) {
    var etym = term.etym || {};
    var row = document.createElement('div');
    row.className = 'nmt-row';

    var jump = document.createElement('button');
    jump.type = 'button';
    jump.className = 'nmt-jump';

    var k = document.createElement('span');
    k.className = 'nmt-k';
    k.textContent = term.k;
    jump.appendChild(k);

    if (term.en) {
      var en = document.createElement('span');
      en.className = 'nmt-en';
      en.lang = 'en';
      en.textContent = term.en;
      jump.appendChild(en);
    }
    row.appendChild(jump);

    if (etym.memo) {
      var sep = document.createElement('span');
      sep.className = 'nmt-sep';
      sep.textContent = '·';
      row.appendChild(sep);

      var memo = document.createElement('span');
      memo.className = 'nmt-memo';
      memo.textContent = etym.memo;
      row.appendChild(memo);
    }

    if (etym.ko || etym.en) {
      var fold = document.createElement('details');
      fold.className = 'nmt-fold';
      var foldSum = document.createElement('summary');
      foldSum.textContent = '어원';
      fold.appendChild(foldSum);
      if (etym.ko) {
        var ko = document.createElement('p');
        ko.textContent = etym.ko;
        fold.appendChild(ko);
      }
      if (etym.en) {
        var enLine = document.createElement('p');
        enLine.lang = 'en';
        enLine.textContent = etym.en;
        fold.appendChild(enLine);
      }
      row.appendChild(fold);
    }

    jump.addEventListener('click', function () {
      revealAndScroll(target);
    });
    return row;
  }

  var flashTimer = new WeakMap();

  function revealAndScroll(el) {
    if (!el) return;
    var p = el.parentElement;
    while (p) {
      if (p.tagName === 'DETAILS') p.open = true;
      p = p.parentElement;
    }
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center', inline: 'nearest' });
    el.classList.remove('nmt-flash');
    void el.offsetWidth;
    el.classList.add('nmt-flash');
    var prev = flashTimer.get(el);
    if (prev) clearTimeout(prev);
    flashTimer.set(el, setTimeout(function () {
      el.classList.remove('nmt-flash');
      flashTimer.delete(el);
    }, 1200));
  }

  function bindUi(root, tip, toggleBtn, byKey, initialOff) {
    var isOff = initialOff;
    var openEl = null;
    var openedBy = '';
    var openTimer = 0;
    var closeTimer = 0;
    var suppressFocusOpen = false;

    function cancelOpen() { clearTimeout(openTimer); }
    function cancelClose() { clearTimeout(closeTimer); }

    function hide() {
      cancelOpen();
      cancelClose();
      if (openEl) openEl.removeAttribute('aria-describedby');
      openEl = null;
      openedBy = '';
      tip.classList.remove('nmt-on');
      tip.setAttribute('aria-hidden', 'true');
    }

    function fill(term) {
      tip.replaceChildren();
      var etym = term.etym || {};

      var head = document.createElement('div');
      head.className = 'nmt-head';
      var k = document.createElement('span');
      k.className = 'nmt-k';
      k.textContent = term.k;
      head.appendChild(k);
      if (term.en) {
        var en = document.createElement('span');
        en.className = 'nmt-en';
        en.lang = 'en';
        en.textContent = term.en;
        head.appendChild(en);
      }
      tip.appendChild(head);

      var def = document.createElement('p');
      def.className = 'nmt-def';
      def.textContent = typeof term.def === 'string' ? term.def : '';
      tip.appendChild(def);

      /* see 필드는 연결 용어를 아직 지원하지 않으므로 그리지 않는다. */
      if (!(etym.ko || etym.en || etym.memo)) return;

      var box = document.createElement('div');
      box.className = 'nmt-etymbox';
      var title = document.createElement('div');
      title.className = 'nmt-etym-title';
      title.textContent = '🔤 이름의 뜻';
      box.appendChild(title);
      if (etym.ko) {
        var ko = document.createElement('p');
        ko.className = 'nmt-etym-line';
        ko.textContent = etym.ko;
        box.appendChild(ko);
      }
      if (etym.en) {
        var enLine = document.createElement('p');
        enLine.className = 'nmt-etym-line';
        enLine.lang = 'en';
        enLine.textContent = etym.en;
        box.appendChild(enLine);
      }
      var memo = document.createElement('p');
      memo.className = 'nmt-memo';
      var bulb = document.createElement('span');
      bulb.className = 'nmt-bulb';
      bulb.textContent = '💡';
      memo.appendChild(bulb);
      memo.appendChild(document.createTextNode(typeof etym.memo === 'string' ? etym.memo : ''));
      box.appendChild(memo);
      tip.appendChild(box);
    }

    function place(anchor) {
      var margin = 8;
      var vw = document.documentElement.clientWidth || window.innerWidth;
      var vh = window.innerHeight;
      var rect = anchor.getBoundingClientRect();
      var tw = tip.offsetWidth;
      var th = tip.offsetHeight;
      var top = rect.top - th - margin;
      if (top < margin) top = rect.bottom + margin;
      if (top + th > vh - margin) top = Math.max(margin, vh - th - margin);
      var left = rect.left + rect.width / 2 - tw / 2;
      var maxLeft = Math.max(margin, vw - tw - margin);
      if (left < margin) left = margin;
      if (left > maxLeft) left = maxLeft;
      tip.style.top = Math.round(top) + 'px';
      tip.style.left = Math.round(left) + 'px';
    }

    function show(el, how) {
      if (isOff || !el || !document.contains(el)) return;
      var term = byKey.get(el.getAttribute('data-nmt'));
      if (!term) return;
      cancelOpen();
      cancelClose();
      if (openEl && openEl !== el) openEl.removeAttribute('aria-describedby');
      openEl = el;
      openedBy = how;
      fill(term);
      place(el);
      el.setAttribute('aria-describedby', 'nmt-tip');
      tip.classList.add('nmt-on');
      tip.setAttribute('aria-hidden', 'false');
    }

    function toggle(el, how) {
      if (isOff) return;
      if (openEl === el && tip.classList.contains('nmt-on')) hide();
      else show(el, how);
    }

    function scheduleOpen(el) {
      if (isOff) return;
      if (openEl === el && tip.classList.contains('nmt-on')) {
        cancelClose();
        return;
      }
      cancelOpen();
      cancelClose();
      openTimer = setTimeout(function () { show(el, 'mouse'); }, OPEN_DELAY);
    }

    function scheduleClose() {
      cancelClose();
      closeTimer = setTimeout(hide, CLOSE_DELAY);
    }

    function termFrom(node) {
      if (!node || !node.closest) return null;
      var el = node.closest('.nm-term');
      if (!el || !root.contains(el)) return null;
      return el;
    }

    function setOff(off) {
      isOff = off;
      document.documentElement.classList.toggle('nmt-off', off);
      toggleBtn.setAttribute('aria-pressed', off ? 'false' : 'true');
      var nodes = document.querySelectorAll('.nm-term');
      for (var i = 0; i < nodes.length; i++) nodes[i].tabIndex = off ? -1 : 0;
      writeOff(off);
      if (off) hide();
    }

    toggleBtn.addEventListener('click', function () { setOff(!isOff); });

    root.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch' || isOff) return;
      var el = termFrom(e.target);
      if (!el) return;
      scheduleOpen(el);
    });

    root.addEventListener('pointerout', function (e) {
      if (e.pointerType === 'touch') return;
      var el = termFrom(e.target);
      if (!el) return;
      var next = e.relatedTarget;
      if (next && (el.contains(next) || tip.contains(next))) {
        if (tip.contains(next)) cancelClose();
        return;
      }
      cancelOpen();
      scheduleClose();
    });

    tip.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch') return;
      cancelClose();
    });

    tip.addEventListener('pointerout', function (e) {
      if (e.pointerType === 'touch') return;
      var next = e.relatedTarget;
      if (next && openEl && openEl.contains(next)) return;
      scheduleClose();
    });

    root.addEventListener('focusin', function (e) {
      if (suppressFocusOpen || isOff) return;
      var el = termFrom(e.target);
      if (!el) return;
      show(el, 'key');
    });

    root.addEventListener('focusout', function (e) {
      if (!termFrom(e.target)) return;
      var next = e.relatedTarget;
      if (next && (tip.contains(next) || termFrom(next))) return;
      setTimeout(function () {
        if (!openEl) return;
        if (tip.matches(':hover') || tip.contains(document.activeElement)) return;
        if (termFrom(document.activeElement)) return;
        hide();
      }, 0);
    });

    root.addEventListener('click', function (e) {
      var el = termFrom(e.target);
      if (!el || isOff || !suppressFocusOpen) return;
      e.preventDefault();
      toggle(el, 'touch');
    });

    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      var el = termFrom(e.target);
      if (!el || isOff) return;
      e.preventDefault();
      toggle(el, 'key');
    });

    document.addEventListener('pointerdown', function (e) {
      suppressFocusOpen = e.pointerType === 'touch';
      if (!openEl) return;
      var target = e.target;
      if (!target) return;
      if (tip.contains(target) || openEl.contains(target)) return;
      if (target.closest && target.closest('.nmt-toggle')) return;
      hide();
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') suppressFocusOpen = false;
      if (e.key === 'Escape') hide();
    }, true);

    document.addEventListener('scroll', function () {
      if (!openEl) return;
      if (openedBy === 'touch') hide();
      else place(openEl);
    }, true);

    window.addEventListener('resize', function () {
      if (openEl) place(openEl);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
