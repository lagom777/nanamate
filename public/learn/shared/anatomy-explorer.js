/* 뇌·내분비 탐험기 — data-anatomy 요소를 찾아 붙인다.
 * 자료는 window.ANATOMY_DATA / window.ANATOMY_ART. 문자열은 textContent로만 넣는다.
 */
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var TARGET_NAME = {
    brain: '뇌', pituitary: '뇌하수체', thyroid: '갑상샘', adrenal: '부신',
    liver: '간', kidney: '콩팥', heart: '심장', muscle: '근육', bone: '뼈',
    gut: '창자', breast: '젖샘', uterus: '자궁', pancreas: '이자',
    ovary: '난소', testis: '정소', all: '온몸'
  };

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function clearNode(n) {
    while (n.firstChild) n.removeChild(n.firstChild);
  }
  function svgEl(tag) {
    return document.createElementNS(SVGNS, tag);
  }
  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }
  function coarse() {
    try { return window.matchMedia('(pointer: coarse)').matches; }
    catch (e) { return false; }
  }
  function durationMs(text) {
    var sec = ((text || '').length) / 15;
    if (sec < 4) sec = 4;
    if (sec > 8) sec = 8;
    return Math.round(sec * 1000);
  }
  function bez(p0, p1, p2, u) {
    var t = 1 - u;
    return {
      x: t * t * p0.x + 2 * t * u * p1.x + u * u * p2.x,
      y: t * t * p0.y + 2 * t * u * p1.y + u * u * p2.y
    };
  }
  function bendPoint(p0, p2, sign) {
    var mx = (p0.x + p2.x) / 2;
    var my = (p0.y + p2.y) / 2;
    var dx = p2.x - p0.x;
    var dy = p2.y - p0.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var mag = Math.max(18, Math.min(64, len * 0.18));
    return { x: mx + (-dy / len) * mag * sign, y: my + (dx / len) * mag * sign };
  }

  function mountAll() {
    var nodes = document.querySelectorAll('[data-anatomy]');
    var i;
    for (i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  function mount(root) {
    if (root.getAttribute('data-ax-mounted')) return;
    root.setAttribute('data-ax-mounted', '1');
    root.classList.add('anx');

    var DATA = window.ANATOMY_DATA;
    var ART = window.ANATOMY_ART;
    if (!DATA || !ART || !ART.viewBox || !ART.brainSide || !ART.brainMid || !ART.body) {
      var err = el('p', 'anx-error');
      err.textContent = '해부도 자료를 불러오지 못했습니다.';
      root.appendChild(err);
      return;
    }

    var mode = root.getAttribute('data-anatomy');
    if (mode !== 'brain' && mode !== 'endo') mode = 'both';
    var startTab = root.getAttribute('data-tab');
    var startView = root.getAttribute('data-start');
    var state = {
      mode: mode,
      tab: mode === 'endo' ? 'endo' : (mode === 'both' && startTab === 'endo' ? 'endo' : 'brain'),
      brainView: startView === 'mid' ? 'mid' : 'side',
      sex: 'f',
      hover: null,
      pinned: null,
      hormoneHover: null,
      hormonePinned: null,
      scenario: null,
      svg: null,
      flowSig: '',
      panelToken: '',
      onScreen: true,
      anim: { raf: 0, gen: 0, dots: [] }
    };

    var ui = {};

    function currentView() {
      var i;
      for (i = 0; i < DATA.brainViews.length; i++) {
        if (DATA.brainViews[i].id === state.brainView) return DATA.brainViews[i];
      }
      return DATA.brainViews[0];
    }

    function isShown(node) {
      var n = node;
      while (n && n !== root) {
        if (n.getAttribute) {
          var sex = n.getAttribute('data-sex');
          if (sex === 'f' && state.sex !== 'f') return false;
          if (sex === 'm' && state.sex !== 'm') return false;
        }
        n = n.parentNode;
      }
      return true;
    }

    function sexNeed(key) {
      if (key === 'ovary') return 'f';
      if (key === 'testis') return 'm';
      return null;
    }

    function ensureSex(key) {
      var need = sexNeed(key);
      if (!need || state.sex === need) return;
      state.sex = need;
      state.flowSig = '';
    }

    function displayKey() {
      if (state.hover) return state.hover;
      if (state.pinned) return state.pinned;
      if (state.scenario && state.scenario.playing) return state.scenario.key;
      return null;
    }

    function displayHormone() {
      if (state.hormoneHover) return state.hormoneHover;
      if (state.hormonePinned) return state.hormonePinned;
      if (state.scenario && state.scenario.playing && !state.hover && !state.pinned) {
        return state.scenario.hormone || null;
      }
      return null;
    }

    function shapesFor(key) {
      if (!key || !state.svg) return [];
      var direct = state.svg.querySelector('.ax-part[data-part="' + key + '"]');
      if (direct) return [direct];
      var members = (DATA.groups && DATA.groups[key]) || (DATA.parts[key] && DATA.parts[key].members) || null;
      if (!members) return [];
      var out = [];
      var i, node;
      for (i = 0; i < members.length; i++) {
        node = state.svg.querySelector('.ax-part[data-part="' + members[i] + '"]');
        if (node) out.push(node);
      }
      return out;
    }

    function linkShapes(key) {
      var part = DATA.parts[key];
      var links = (part && part.links) || [];
      var out = [];
      var i, node;
      for (i = 0; i < links.length; i++) {
        node = state.svg.querySelector('.ax-part[data-part="' + links[i] + '"]');
        if (node) out.push(node);
      }
      return out;
    }

    function centerOf(node) {
      var b = node.getBBox();
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    }

    function shapePoints(node) {
      var spots = node.querySelectorAll('.ax-spot');
      var nodes = [];
      var i, c, tag, kids, shapes;
      if (spots.length) {
        for (i = 0; i < spots.length; i++) nodes.push(spots[i]);
      } else {
        kids = node.children;
        shapes = [];
        for (i = 0; i < kids.length; i++) {
          c = kids[i];
          if (c.classList && c.classList.contains('ax-deco')) continue;
          tag = (c.localName || '').toLowerCase();
          if (tag === 'path' || tag === 'ellipse' || tag === 'circle' || tag === 'polygon') shapes.push(c);
        }
        nodes = shapes.length >= 2 ? shapes : [node];
      }
      var pts = [];
      for (i = 0; i < nodes.length; i++) {
        try {
          var b = nodes[i].getBBox();
          if (!b || (b.width === 0 && b.height === 0)) continue;
          pts.push({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
        } catch (e) {}
      }
      return pts;
    }

    function targetNodes(id) {
      if (!state.svg) return [];
      if (id === 'all') return Array.prototype.slice.call(state.svg.querySelectorAll('.ax-all-pt'));
      if (id === 'gonad') id = state.sex === 'm' ? 'testis' : 'ovary';
      if (id === 'brain') {
        var brain = state.svg.querySelector('.ax-target[data-target="brain"]');
        return brain ? [brain] : [];
      }
      var t = state.svg.querySelector('.ax-target[data-target="' + id + '"]');
      if (t && isShown(t)) return [t];
      var p = state.svg.querySelector('.ax-part[data-part="' + id + '"]');
      if (p && isShown(p)) return [p];
      return [];
    }

    function pointsOfTargets(ids) {
      var pts = [];
      var els = [];
      var i, j, nodes, one;
      for (i = 0; i < ids.length; i++) {
        nodes = targetNodes(ids[i]);
        for (j = 0; j < nodes.length; j++) {
          els.push(nodes[j]);
          if (nodes[j].classList.contains('ax-all-pt')) {
            try { pts.push(centerOf(nodes[j])); } catch (e) {}
          } else {
            one = shapePoints(nodes[j]);
            var k;
            for (k = 0; k < one.length; k++) pts.push(one[k]);
          }
        }
      }
      return { els: els, pts: pts };
    }

    /* ---------- 껍데기 ---------- */
    ui.tabs = el('div', 'anx-tabs');
    ui.controls = el('div', 'anx-controls');
    ui.views = el('div', 'anx-views');
    ui.sex = el('div', 'anx-sex');
    ui.main = el('div', 'anx-main');
    ui.col = el('div', 'anx-col');
    ui.stage = el('div', 'anx-stage');
    ui.host = el('div', 'anx-svghost');
    ui.tip = el('div', 'anx-tip');
    ui.tipName = el('span', 'anx-tip-name');
    ui.tipEn = el('span', 'anx-tip-en');
    ui.note = el('p', 'anx-note');
    ui.chips = el('div', 'anx-chips');
    ui.panel = el('div', 'anx-panel');
    ui.scenes = el('div', 'anx-scenes');
    ui.player = el('div', 'anx-player');
    ui.sub = el('p', 'anx-sub');
    ui.dots = el('div', 'anx-dots');
    ui.prev = el('button', 'anx-step');
    ui.play = el('button', 'anx-step');
    ui.next = el('button', 'anx-step');
    ui.legend = legendLine();

    ui.tip.hidden = true;
    ui.tip.setAttribute('aria-hidden', 'true');
    ui.tip.appendChild(ui.tipName);
    ui.tip.appendChild(ui.tipEn);
    ui.note.hidden = true;
    ui.player.hidden = true;
    ui.player.setAttribute('role', 'region');
    ui.player.setAttribute('aria-label', '영상 재생');
    ui.sub.setAttribute('aria-live', 'polite');
    ui.panel.setAttribute('role', 'region');
    ui.panel.setAttribute('aria-label', '설명');
    ui.prev.type = 'button';
    ui.play.type = 'button';
    ui.next.type = 'button';
    ui.prev.textContent = '⏮';
    ui.play.textContent = '▶';
    ui.next.textContent = '⏭';
    ui.prev.setAttribute('aria-label', '이전 단계');
    ui.play.setAttribute('aria-label', '재생');
    ui.next.setAttribute('aria-label', '다음 단계');

    var pc = el('div', 'anx-pc');
    pc.appendChild(ui.prev);
    pc.appendChild(ui.play);
    pc.appendChild(ui.next);
    pc.appendChild(ui.dots);
    ui.player.appendChild(ui.sub);
    ui.player.appendChild(pc);

    [['brain', '🧠 뇌'], ['endo', '🫀 내분비계 (몸)']].forEach(function (pair) {
      var b = el('button', 'anx-tab');
      b.type = 'button';
      b.setAttribute('data-tab', pair[0]);
      b.textContent = pair[1];
      b.addEventListener('click', function () { setTab(pair[0]); });
      ui.tabs.appendChild(b);
    });
    DATA.brainViews.forEach(function (v) {
      var b = el('button', 'anx-view');
      b.type = 'button';
      b.setAttribute('data-view', v.id);
      b.textContent = v.label;
      b.addEventListener('click', function () { setView(v.id); });
      ui.views.appendChild(b);
    });
    [['f', '♀ 여성'], ['m', '♂ 남성']].forEach(function (pair) {
      var b = el('button', 'anx-sexbtn');
      b.type = 'button';
      b.setAttribute('data-sex', pair[0]);
      b.textContent = pair[1];
      b.addEventListener('click', function () { setSex(pair[0]); });
      ui.sex.appendChild(b);
    });

    ui.stage.appendChild(ui.host);
    ui.stage.appendChild(ui.tip);
    ui.stage.appendChild(ui.note);
    ui.col.appendChild(ui.stage);
    ui.col.appendChild(ui.chips);
    ui.controls.appendChild(ui.views);
    ui.controls.appendChild(ui.sex);
    ui.main.appendChild(ui.col);
    ui.main.appendChild(ui.panel);
    root.appendChild(ui.tabs);
    root.appendChild(ui.controls);
    root.appendChild(ui.main);
    root.appendChild(ui.scenes);
    root.appendChild(ui.player);
    root.appendChild(ui.legend);

    ui.prev.addEventListener('click', goPrev);
    ui.next.addEventListener('click', goNext);
    ui.play.addEventListener('click', onPlay);

    function legendLine() {
      var p = el('p', 'anx-legend');
      p.appendChild(dot(true));
      p.appendChild(document.createTextNode(' 교과서 핵심'));
      var gap = el('span', 'anx-legend-gap');
      gap.textContent = '   ';
      p.appendChild(gap);
      p.appendChild(dot(false));
      p.appendChild(document.createTextNode(' 참고·교양'));
      return p;
    }
    function dot(core) {
      var i = el('i', 'anx-dot' + (core ? ' is-core' : ''));
      i.setAttribute('aria-hidden', 'true');
      return i;
    }

    /* ---------- 그림 ---------- */
    function rebuildStage() {
      clearNode(ui.host);
      var svg = svgEl('svg');
      var key = state.tab === 'brain' ? (state.brainView === 'mid' ? 'brainMid' : 'brainSide') : 'body';
      svg.setAttribute('viewBox', ART.viewBox[key]);
      svg.setAttribute('class', 'anx-svg');
      svg.setAttribute('role', 'group');
      svg.setAttribute('aria-label', state.tab === 'brain' ? '뇌 해부도' : '내분비계 해부도');
      svg.innerHTML = state.tab === 'brain' ? (state.brainView === 'mid' ? ART.brainMid : ART.brainSide) : ART.body;
      ui.host.appendChild(svg);
      state.svg = svg;
      state.flowSig = '';
      bindSvg(svg);
      if (state.tab === 'endo') {
        var ps = svg.querySelectorAll('.ax-part');
        var i;
        for (i = 0; i < ps.length; i++) ps[i].style.animationDelay = (i * 0.28) + 's';
      }
    }

    function partOf(node) {
      if (!node || !node.closest || !state.svg) return null;
      var g = node.closest('.ax-part');
      if (g && state.svg.contains(g)) return g;
      return null;
    }

    function bindSvg(svg) {
      var parts = svg.querySelectorAll('.ax-part');
      var i;
      for (i = 0; i < parts.length; i++) {
        (function (p) {
          var key = p.getAttribute('data-part');
          var meta = DATA.parts[key];
          p.setAttribute('tabindex', '0');
          p.setAttribute('role', 'button');
          p.setAttribute('aria-label', meta ? meta.name : key);
          p.addEventListener('focus', function () {
            pauseForUser();
            setHover(key);
          });
          p.addEventListener('blur', function () {
            if (state.hover === key) setHover(null);
          });
          p.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              pauseForUser();
              togglePin(key);
            }
          });
        })(parts[i]);
      }
      svg.addEventListener('pointerover', function (e) {
        var g = partOf(e.target);
        if (!g || e.pointerType === 'touch') return;
        pauseForUser();
        setHover(g.getAttribute('data-part'));
      });
      svg.addEventListener('pointerout', function (e) {
        var g = partOf(e.target);
        if (!g) return;
        var rel = e.relatedTarget;
        if (rel && g.contains(rel)) return;
        var next = rel && rel.closest && rel.closest('.ax-part');
        if (next && svg.contains(next)) return;
        if (state.hover === g.getAttribute('data-part')) setHover(null);
      });
      svg.addEventListener('pointermove', function (e) {
        if (coarse() || e.pointerType === 'touch') { hideTip(); return; }
        var g = partOf(e.target);
        if (!g) { hideTip(); return; }
        showTip(g.getAttribute('data-part'), e.clientX, e.clientY);
      });
      svg.addEventListener('pointerleave', hideTip);
      svg.addEventListener('click', function (e) {
        var g = partOf(e.target);
        pauseForUser();
        if (!g) {
          state.pinned = null;
          state.hormonePinned = null;
          state.hormoneHover = null;
          state.flowSig = '';
          refresh();
          return;
        }
        togglePin(g.getAttribute('data-part'));
      });
    }

    function showTip(key, clientX, clientY) {
      var part = DATA.parts[key];
      if (!part) return;
      ui.tipName.textContent = part.name;
      ui.tipEn.textContent = part.en;
      ui.tip.hidden = false;
      var rect = ui.stage.getBoundingClientRect();
      var x = clientX - rect.left + 14;
      var y = clientY - rect.top + 16;
      var tw = ui.tip.offsetWidth;
      var th = ui.tip.offsetHeight;
      if (x + tw > ui.stage.clientWidth - 6) x = clientX - rect.left - tw - 14;
      if (y + th > ui.stage.clientHeight - 6) y = clientY - rect.top - th - 10;
      if (x < 6) x = 6;
      if (y < 6) y = 6;
      ui.tip.style.left = x + 'px';
      ui.tip.style.top = y + 'px';
    }
    function hideTip() { ui.tip.hidden = true; }

    function setHover(key) {
      if (state.hover === key) return;
      state.hover = key;
      state.hormoneHover = null;
      if (key) ensureSex(key);
      refresh();
    }

    function togglePin(key) {
      ensureSex(key);
      if (state.pinned === key) {
        state.pinned = null;
        state.hormonePinned = null;
      } else {
        state.pinned = key;
        state.hormonePinned = null;
        state.hormoneHover = null;
      }
      state.flowSig = '';
      refresh();
      if (state.pinned) maybeRevealPanel();
    }

    function setHormoneHover(id) {
      if (state.hormoneHover === id) return;
      state.hormoneHover = id;
      syncHormoneClasses();
      state.flowSig = '';
      syncFlow();
    }

    function toggleHormone(id) {
      state.hormonePinned = state.hormonePinned === id ? null : id;
      state.flowSig = '';
      syncHormoneClasses();
      syncFlow();
    }

    function maybeRevealPanel() {
      try {
        /* 설명 패널이 그림 아래로 쌓인 배치(좁은 본문 칸·휴대폰)일 때만 */
        if (ui.panel.getBoundingClientRect().top >= ui.stage.getBoundingClientRect().bottom - 2) {
          ui.panel.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
        }
      } catch (e) {}
    }

    /* ---------- 탭·보기·성별 ---------- */
    function setTab(tab) {
      if (state.mode !== 'both' || state.tab === tab) return;
      stopScenario(true);
      state.tab = tab;
      state.hover = null;
      state.pinned = null;
      state.hormoneHover = null;
      state.hormonePinned = null;
      hideTip();
      rebuildStage();
      buildChips();
      buildScenarioButtons();
      refresh();
    }

    function setView(id) {
      if (state.brainView === id) return;
      pauseForUser();
      state.brainView = id;
      state.hover = null;
      state.hormoneHover = null;
      state.hormonePinned = null;
      if (state.pinned && currentView().parts.indexOf(state.pinned) === -1) state.pinned = null;
      state.flowSig = '';
      hideTip();
      rebuildStage();
      buildChips();
      refresh();
    }

    function setSex(sex) {
      if (state.sex === sex) return;
      pauseForUser();
      state.sex = sex;
      if (sex === 'm') {
        if (state.pinned === 'ovary') state.pinned = null;
        if (state.hover === 'ovary') state.hover = null;
      }
      if (sex === 'f') {
        if (state.pinned === 'testis') state.pinned = null;
        if (state.hover === 'testis') state.hover = null;
      }
      state.flowSig = '';
      refresh();
    }

    function jumpEndo(key) {
      stopScenario(true);
      state.tab = 'endo';
      state.hover = null;
      state.pinned = key;
      state.hormoneHover = null;
      state.hormonePinned = null;
      hideTip();
      rebuildStage();
      buildChips();
      buildScenarioButtons();
      refresh();
      maybeRevealPanel();
    }

    /* ---------- 칩 ---------- */
    function chipKeys() {
      if (state.tab === 'endo') return DATA.glands.slice();
      return currentView().parts.slice();
    }

    function buildChips() {
      clearNode(ui.chips);
      chipKeys().forEach(function (key) {
        var part = DATA.parts[key];
        if (!part) return;
        var b = el('button', 'anx-chip');
        b.type = 'button';
        b.setAttribute('data-key', key);
        b.appendChild(dot(part.level === 'core'));
        var t = el('span');
        t.textContent = part.name;
        b.appendChild(t);
        b.addEventListener('pointerenter', function (e) {
          if (e.pointerType === 'touch') return;
          pauseForUser();
          setHover(key);
        });
        b.addEventListener('pointerleave', function () {
          if (state.hover === key) setHover(null);
        });
        b.addEventListener('focus', function () { setHover(key); });
        b.addEventListener('blur', function () {
          if (state.hover === key) setHover(null);
        });
        b.addEventListener('click', function () {
          pauseForUser();
          togglePin(key);
        });
        ui.chips.appendChild(b);
      });
    }

    /* ---------- 설명 패널 ---------- */
    function section(title, node) {
      var s = el('section', 'anx-sec');
      var h = el('h4', 'anx-sec-h');
      h.textContent = title;
      s.appendChild(h);
      s.appendChild(node);
      return s;
    }

    function fillIdle(body) {
      var lead = el('p', 'anx-idle-lead');
      lead.textContent = '그림 위에 마우스를 올려 보세요(모바일은 눌러 보세요)';
      body.appendChild(lead);
      body.appendChild(legendLine());
      var note = el('p', 'anx-idle-note');
      if (state.tab === 'brain') {
        note.textContent = state.brainView === 'mid'
          ? '좌우로 반을 가른 정중 단면입니다. 간뇌(시상·시상 하부)와 뇌줄기(중간뇌·뇌교·연수)는 묶음으로도 고를 수 있습니다. 점선으로 그린 해마·편도체는 정중선에서 약간 옆에 있습니다.'
          : '바깥쪽(옆면)에서 본 대뇌입니다. 그림의 왼쪽이 앞(이마), 오른쪽이 뒤통수입니다.';
      } else {
        note.textContent = '호르몬은 혈액을 타고 전신을 돌지만 수용체가 있는 표적 세포에만 작용합니다.';
      }
      body.appendChild(note);
    }

    function visibleLinks(part) {
      var links = part.links || [];
      var out = [];
      var i, lk, view, resolved;
      for (i = 0; i < links.length; i++) {
        lk = links[i];
        if (state.tab === 'brain') {
          view = currentView();
          if (view.parts.indexOf(lk) === -1) continue;
          resolved = lk;
        } else if (lk === 'gonad') {
          resolved = state.sex === 'm' ? 'testis' : 'ovary';
        } else if (DATA.glands.indexOf(lk) !== -1) {
          resolved = lk;
        } else continue;
        if (out.indexOf(resolved) === -1) out.push(resolved);
      }
      return out;
    }

    function fillPart(body, key) {
      var part = DATA.parts[key];
      if (!part) { fillIdle(body); return; }
      var head = el('div', 'anx-head');
      var name = el('h3', 'anx-name');
      name.textContent = part.name;
      var badge = el('span', 'anx-badge ' + (part.level === 'core' ? 'is-core' : 'is-ref'));
      badge.textContent = part.level === 'core' ? '교과서 핵심' : '참고';
      var en = el('p', 'anx-en');
      en.textContent = part.en;
      head.appendChild(name);
      head.appendChild(badge);
      head.appendChild(en);
      body.appendChild(head);

      var where = el('p');
      where.textContent = part.where;
      body.appendChild(section('📍 위치', where));

      var etym = el('div', 'anx-etym');
      var ko = el('p', 'anx-etym-ko');
      ko.textContent = part.etym.ko;
      var eny = el('p', 'anx-etym-en');
      eny.textContent = part.etym.en;
      var memo = el('p', 'anx-memo');
      var lab = el('b');
      lab.textContent = '💡 기억 팁';
      memo.appendChild(lab);
      memo.appendChild(document.createTextNode('  ' + part.etym.memo));
      etym.appendChild(ko);
      etym.appendChild(eny);
      etym.appendChild(memo);
      body.appendChild(section('🔤 이름의 뜻', etym));

      var ul = el('ul', 'anx-role');
      var r;
      for (r = 0; r < part.role.length; r++) {
        var li = el('li');
        li.textContent = part.role[r];
        ul.appendChild(li);
      }
      body.appendChild(section('⚙️ 하는 일', ul));

      if (part.exam) {
        var ex = el('div', 'anx-exam');
        ex.textContent = part.exam;
        body.appendChild(section('🎯 시험 포인트', ex));
      }

      if (part.hormones && part.hormones.length) {
        body.appendChild(section('💉 분비하는 호르몬', hormoneBlock(part)));
        if (state.mode === 'both' && state.tab === 'brain' &&
            (key === 'hypothalamus' || key === 'pituitary' || key === 'pineal')) {
          var jump = el('button', 'anx-jump');
          jump.type = 'button';
          jump.textContent = '→ 내분비계 그림에서 보기';
          jump.addEventListener('click', function () { jumpEndo(key); });
          body.appendChild(jump);
        }
      }

      var links = visibleLinks(part);
      if (links.length) {
        var row = el('div', 'anx-links');
        var i;
        for (i = 0; i < links.length; i++) row.appendChild(linkChip(links[i]));
        body.appendChild(section('🔗 연결된 부위', row));
      }
    }

    function linkChip(key) {
      var part = DATA.parts[key];
      var b = el('button', 'anx-link');
      b.type = 'button';
      b.textContent = part ? part.name : key;
      b.addEventListener('click', function () {
        pauseForUser();
        state.hover = null;
        state.hormoneHover = null;
        state.hormonePinned = null;
        ensureSex(key);
        state.pinned = key;
        state.flowSig = '';
        refresh();
        maybeRevealPanel();
      });
      return b;
    }

    function hormoneBlock(part) {
      var wrap = el('div', 'anx-hormones');
      var i, j, group, id, h;
      for (i = 0; i < part.hormones.length; i++) {
        group = part.hormones[i];
        if (group.label) {
          var lab = el('p', 'anx-hlabel');
          lab.textContent = group.label;
          wrap.appendChild(lab);
        }
        for (j = 0; j < group.keys.length; j++) {
          id = group.keys[j];
          h = DATA.hormones[id];
          if (h) wrap.appendChild(hormoneCard(h, id));
        }
      }
      return wrap;
    }

    function hormoneCard(h, id) {
      var card = el('div', 'anx-hcard');
      card.setAttribute('data-hid', id);
      if (state.hormoneHover === id || state.hormonePinned === id) card.classList.add('is-on');
      if (state.hormonePinned === id) card.classList.add('is-pinned');

      var btn = el('button', 'anx-hcard-btn');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', state.hormonePinned === id ? 'true' : 'false');
      var top = el('span', 'anx-hcard-top');
      var nm = el('span', 'anx-hname');
      nm.textContent = h.name;
      top.appendChild(nm);
      if (h.abbr) {
        var ab = el('span', 'anx-habbr');
        ab.textContent = h.abbr;
        top.appendChild(ab);
      }
      var badge = el('span', 'anx-badge ' + (h.level === 'core' ? 'is-core' : 'is-ref'));
      badge.textContent = h.level === 'core' ? '교과서 핵심' : '참고';
      top.appendChild(badge);
      btn.appendChild(top);
      var ef = el('span', 'anx-heffect');
      ef.textContent = h.effect;
      btn.appendChild(ef);
      var wh = el('span', 'anx-hwhen');
      wh.textContent = '⏱ 언제 분비↑: ' + h.when;
      btn.appendChild(wh);
      var memo = el('span', 'anx-hmemo');
      memo.textContent = h.etym.memo;
      btn.appendChild(memo);

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        pauseForUser();
        toggleHormone(id);
      });
      btn.addEventListener('focus', function () { setHormoneHover(id); });
      btn.addEventListener('blur', function () {
        setTimeout(function () {
          if (!card.contains(document.activeElement) && state.hormoneHover === id) setHormoneHover(null);
        }, 0);
      });
      card.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'touch') return;
        setHormoneHover(id);
      });
      card.addEventListener('pointerleave', function () {
        if (state.hormoneHover === id) setHormoneHover(null);
      });

      var det = el('details', 'anx-hdetails');
      var sum = el('summary');
      sum.textContent = '어원 자세히';
      var ko = el('p');
      ko.textContent = h.etym.ko;
      var en = el('p');
      en.textContent = h.etym.en;
      det.appendChild(sum);
      det.appendChild(ko);
      det.appendChild(en);
      card.appendChild(btn);
      card.appendChild(det);
      return card;
    }

    function syncPanel() {
      var key = displayKey();
      var token = [key || '', state.sex, state.tab, state.brainView].join('|');
      if (token === state.panelToken && ui.panel.firstChild) return;
      state.panelToken = token;
      var body = el('div', 'anx-panel-body');
      if (key) fillPart(body, key);
      else fillIdle(body);
      clearNode(ui.panel);
      ui.panel.appendChild(body);
      ui.panel.scrollTop = 0;
    }

    function syncHormoneClasses() {
      var cards = ui.panel.querySelectorAll('.anx-hcard');
      var i, id, pinned, on, btn;
      for (i = 0; i < cards.length; i++) {
        id = cards[i].getAttribute('data-hid');
        pinned = state.hormonePinned === id;
        on = state.hormoneHover === id || pinned;
        cards[i].classList.toggle('is-on', on);
        cards[i].classList.toggle('is-pinned', pinned);
        btn = cards[i].querySelector('button');
        if (btn) btn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
      }
    }

    /* ---------- 하이라이트·흐름 ---------- */
    function applyHighlight() {
      if (!state.svg) return;
      var parts = state.svg.querySelectorAll('.ax-part');
      var targets = state.svg.querySelectorAll('.ax-target');
      var i;
      for (i = 0; i < parts.length; i++) {
        parts[i].classList.remove('is-hover', 'is-pinned', 'is-dim', 'is-linked', 'is-hot', 'is-warm');
      }
      for (i = 0; i < targets.length; i++) {
        targets[i].classList.remove('is-hot', 'is-warm');
      }
      var primary = displayKey();
      var primaryEls = primary ? shapesFor(primary) : [];
      root.classList.toggle('is-selected', !!primary && primaryEls.length > 0);
      if (!primary || !primaryEls.length) {
        for (i = 0; i < parts.length; i++) parts[i].setAttribute('aria-pressed', 'false');
        return;
      }
      var hoverSet = {};
      var pinSet = {};
      var primarySet = {};
      var linkSet = {};
      var list, n;
      list = state.hover ? shapesFor(state.hover) : [];
      for (n = 0; n < list.length; n++) hoverSet[list[n].getAttribute('data-part')] = 1;
      list = state.pinned ? shapesFor(state.pinned) : [];
      for (n = 0; n < list.length; n++) pinSet[list[n].getAttribute('data-part')] = 1;
      for (n = 0; n < primaryEls.length; n++) primarySet[primaryEls[n].getAttribute('data-part')] = 1;
      if (state.tab === 'brain') {
        list = linkShapes(primary);
        for (n = 0; n < list.length; n++) linkSet[list[n].getAttribute('data-part')] = 1;
      }
      for (i = 0; i < parts.length; i++) {
        var id = parts[i].getAttribute('data-part');
        if (hoverSet[id]) parts[i].classList.add('is-hover');
        else if (pinSet[id] || (primarySet[id] && !state.hover)) parts[i].classList.add('is-pinned');
        else if (linkSet[id]) parts[i].classList.add('is-linked');
        else parts[i].classList.add('is-dim');
        parts[i].setAttribute('aria-pressed', pinSet[id] ? 'true' : 'false');
      }
    }

    function paintHot(nodes, cls) {
      var i;
      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].classList.contains('ax-all-pt')) continue;
        nodes[i].classList.add(cls);
        nodes[i].classList.remove('is-dim');
      }
    }

    function flowSignature() {
      var sc = state.scenario;
      return [
        displayKey() || '',
        state.hormoneHover || '',
        state.hormonePinned || '',
        sc && sc.playing ? (sc.hormone || '') + '@' + sc.index : '',
        state.sex, state.tab, state.brainView, reduced() ? '1' : '0'
      ].join('|');
    }

    function syncFlow() {
      if (!state.svg) return;
      var sig = flowSignature();
      if (sig === state.flowSig && state.svg.querySelector('.ax-fx')) return;
      state.flowSig = sig;
      applyHighlight();
      drawFx();
    }

    function sourcePoints(key) {
      var node = state.svg.querySelector('.ax-part[data-part="' + key + '"]');
      if (!node || !isShown(node)) return [];
      var pts = shapePoints(node);
      if (!pts.length) {
        try { pts = [centerOf(node)]; } catch (e) { pts = []; }
      }
      return pts;
    }

    function drawFx() {
      stopAnim();
      var old = state.svg.querySelector('.ax-fx');
      if (old) old.parentNode.removeChild(old);
      var fx = svgEl('g');
      fx.setAttribute('class', 'ax-fx');
      fx.setAttribute('pointer-events', 'none');
      state.svg.appendChild(fx);

      var primary = displayKey();
      if (state.tab === 'brain' && primary) drawBrainLinks(fx, primary);

      var hid = displayHormone();
      var soft = false;
      var targetIds = [];
      var fromKey = null;
      if (hid && DATA.hormones[hid]) {
        targetIds = DATA.hormones[hid].targets.slice();
        fromKey = DATA.hormones[hid].from;
      } else if (state.tab === 'endo' && primary && DATA.parts[primary] && DATA.parts[primary].hormones) {
        soft = true;
        fromKey = primary;
        var seen = {};
        var groups = DATA.parts[primary].hormones;
        var i, j, id, h;
        for (i = 0; i < groups.length; i++) {
          for (j = 0; j < groups[i].keys.length; j++) {
            id = groups[i].keys[j];
            h = DATA.hormones[id];
            if (!h) continue;
            var t;
            for (t = 0; t < h.targets.length; t++) {
              if (!seen[h.targets[t]]) { seen[h.targets[t]] = 1; targetIds.push(h.targets[t]); }
            }
          }
        }
      }
      if (fromKey && targetIds.length) drawHormone(fx, fromKey, targetIds, soft);
      kick();
    }

    function addCurve(fx, p0, p2, sign, soft) {
      var p1 = bendPoint(p0, p2, sign);
      var path = svgEl('path');
      path.setAttribute('d', 'M ' + p0.x + ' ' + p0.y + ' Q ' + p1.x + ' ' + p1.y + ' ' + p2.x + ' ' + p2.y);
      path.setAttribute('class', 'ax-flow' + (soft ? ' is-soft' : ''));
      fx.appendChild(path);
      var dx = p2.x - p1.x;
      var dy = p2.y - p1.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= len; dy /= len;
      var s = 9;
      var bx = p2.x - dx * s;
      var by = p2.y - dy * s;
      var px = -dy * 4.5;
      var py = dx * 4.5;
      var head = svgEl('polygon');
      head.setAttribute('points', (bx + px) + ',' + (by + py) + ' ' + p2.x + ',' + p2.y + ' ' + (bx - px) + ',' + (by - py));
      head.setAttribute('class', 'ax-arrow' + (soft ? ' is-soft' : ''));
      fx.appendChild(head);
      return p1;
    }

    function drawBrainLinks(fx, key) {
      var from = shapesFor(key);
      if (!from.length) return;
      var origin = average(from.map(centerOf));
      var links = linkShapes(key);
      var i;
      for (i = 0; i < links.length; i++) {
        if (from.indexOf(links[i]) !== -1) continue;
        var dest = centerOf(links[i]);
        addCurve(fx, origin, dest, i % 2 === 0 ? 1 : -1, false);
      }
    }

    function average(pts) {
      var x = 0, y = 0, i;
      for (i = 0; i < pts.length; i++) { x += pts[i].x; y += pts[i].y; }
      return { x: x / pts.length, y: y / pts.length };
    }

    function drawHormone(fx, fromKey, targetIds, soft) {
      var sources = sourcePoints(fromKey);
      var pack = pointsOfTargets(targetIds);
      if (!sources.length || !pack.pts.length) return;
      paintHot(pack.els, soft ? 'is-warm' : 'is-hot');
      var i, s, d, p1, sign;
      var n = Math.max(sources.length, pack.pts.length, soft ? 8 : 10);
      if (n > 12) n = 12;
      if (soft && n > 8) n = 8;
      var useLine = reduced();
      var count = useLine ? Math.min(pack.pts.length, 8) : n;
      for (i = 0; i < count; i++) {
        s = sources[i % sources.length];
        d = pack.pts[i % pack.pts.length];
        sign = i % 2 === 0 ? 1 : -1;
        p1 = bendPoint(s, d, sign);
        if (useLine) addCurve(fx, s, d, sign, soft);
        else {
          var dot = svgEl('circle');
          dot.setAttribute('r', soft ? '3.2' : '4.2');
          dot.setAttribute('fill', 'var(--accent,#16a34a)');
          dot.setAttribute('opacity', '0');
          dot.setAttribute('class', 'ax-particle' + (soft ? ' is-soft' : ''));
          fx.appendChild(dot);
          state.anim.dots.push({
            el: dot, p0: s, p1: p1, p2: d,
            offset: i / n,
            speed: 0.38 + (i % 4) * 0.04,
            soft: soft
          });
        }
      }
      if (!soft) addLabels(fx, targetIds);
      if (targetIds.indexOf('all') !== -1) {
        var allPts = pointsOfTargets(['all']).pts;
        var a;
        for (a = 0; a < allPts.length; a++) {
          var ring = svgEl('circle');
          ring.setAttribute('cx', allPts[a].x);
          ring.setAttribute('cy', allPts[a].y);
          ring.setAttribute('r', soft ? '11' : '16');
          ring.setAttribute('class', 'ax-ring' + (soft ? ' is-soft' : ''));
          fx.appendChild(ring);
        }
      }
    }

    function addLabels(fx, ids) {
      var vb = state.svg.viewBox.baseVal;
      var fs = vb && vb.width ? Math.max(14, Math.round(vb.width / 36)) : 16;
      var i, id, pack, pos, text, b, rect, name;
      var seen = {};
      for (i = 0; i < ids.length; i++) {
        id = ids[i];
        if (seen[id]) continue;
        seen[id] = 1;
        name = labelOf(id);
        if (!name) continue;
        pack = pointsOfTargets([id]);
        if (!pack.pts.length) continue;
        pos = labelAnchor(pack.pts);
        text = svgEl('text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'ax-label');
        text.setAttribute('font-size', fs);
        text.textContent = name;
        fx.appendChild(text);
        try { b = text.getBBox(); } catch (e) { continue; }
        rect = svgEl('rect');
        rect.setAttribute('x', b.x - 5);
        rect.setAttribute('y', b.y - 2);
        rect.setAttribute('width', b.width + 10);
        rect.setAttribute('height', b.height + 4);
        rect.setAttribute('rx', '5');
        rect.setAttribute('class', 'ax-label-bg');
        fx.insertBefore(rect, text);
      }
    }

    function labelOf(id) {
      if (id === 'gonad') id = state.sex === 'm' ? 'testis' : 'ovary';
      if (id === 'all') return '온몸';
      if (DATA.parts[id]) return DATA.parts[id].name;
      return TARGET_NAME[id] || '';
    }

    function labelAnchor(pts) {
      var x = 0, minY = Infinity, i;
      for (i = 0; i < pts.length; i++) {
        x += pts[i].x;
        if (pts[i].y < minY) minY = pts[i].y;
      }
      var y = minY - 10;
      if (y < 16) y = minY + 22;
      return { x: x / pts.length, y: y };
    }

    function stopAnim() {
      state.anim.gen++;
      if (state.anim.raf) cancelAnimationFrame(state.anim.raf);
      state.anim.raf = 0;
      state.anim.dots = [];
    }

    function kick() {
      if (!state.anim.dots.length || reduced()) return;
      if (document.hidden || !state.onScreen) return;
      if (state.anim.raf) return;
      var gen = state.anim.gen;
      function frame(now) {
        if (gen !== state.anim.gen) return;
        if (document.hidden || !state.onScreen) {
          state.anim.raf = 0;
          return;
        }
        var dots = state.anim.dots;
        var i, u, p, fade;
        for (i = 0; i < dots.length; i++) {
          u = ((now / 1000) * dots[i].speed + dots[i].offset) % 1;
          p = bez(dots[i].p0, dots[i].p1, dots[i].p2, u);
          dots[i].el.setAttribute('cx', r1(p.x));
          dots[i].el.setAttribute('cy', r1(p.y));
          fade = Math.sin(u * Math.PI);
          dots[i].el.setAttribute('opacity', (dots[i].soft ? 0.35 : 0.92) * fade);
        }
        state.anim.raf = requestAnimationFrame(frame);
      }
      state.anim.raf = requestAnimationFrame(frame);
    }
    function r1(v) { return Math.round(v * 10) / 10; }

    function syncOff() {
      var off = document.hidden || !state.onScreen;
      root.classList.toggle('is-off', off);
      if (off) {
        if (state.anim.raf) { cancelAnimationFrame(state.anim.raf); state.anim.raf = 0; }
      } else kick();
    }

    /* ---------- 영상 ---------- */
    function scenarioList() {
      var bag = DATA.scenarios || {};
      return (state.tab === 'brain' ? bag.brain : bag.endo) || [];
    }

    function buildScenarioButtons() {
      clearNode(ui.scenes);
      scenarioList().forEach(function (s) {
        var b = el('button', 'anx-scene');
        b.type = 'button';
        b.setAttribute('data-sid', s.id);
        b.textContent = '▶ ' + s.title;
        b.addEventListener('click', function () { startScenario(s); });
        ui.scenes.appendChild(b);
      });
    }

    function startScenario(s) {
      if (state.scenario && state.scenario.id === s.id && state.scenario.playing) {
        stopScenario();
        return;
      }
      stopScenario(true);
      state.scenario = {
        id: s.id,
        steps: s.steps,
        index: 0,
        playing: true,
        paused: reduced(),
        key: null,
        hormone: null,
        timer: 0,
        remain: 0,
        started: 0
      };
      goStep(0);
    }

    function stopScenario(silent) {
      var sc = state.scenario;
      if (!sc) { if (!silent) refresh(); return; }
      if (sc.timer) clearTimeout(sc.timer);
      state.scenario = null;
      state.flowSig = '';
      ui.player.hidden = true;
      if (!silent) refresh();
    }

    function goStep(i) {
      var sc = state.scenario;
      if (!sc) return;
      if (i < 0) return;
      if (i >= sc.steps.length) { stopScenario(); return; }
      sc.index = i;
      sc.remain = 0;
      var step = sc.steps[i];
      state.hover = null;
      state.pinned = null;
      state.hormoneHover = null;
      state.hormonePinned = null;
      if (state.tab === 'brain') {
        sc.key = step.key;
        sc.hormone = null;
        if (step.view && step.view !== state.brainView) {
          state.brainView = step.view;
          rebuildStage();
          buildChips();
        }
      } else {
        sc.key = step.gland;
        sc.hormone = step.hormone || null;
      }
      state.flowSig = '';
      updatePlayer();
      refresh();
      schedule();
    }

    function schedule() {
      var sc = state.scenario;
      if (!sc || !sc.playing || sc.paused || reduced()) return;
      if (sc.timer) clearTimeout(sc.timer);
      var ms = sc.remain || durationMs(sc.steps[sc.index].text);
      sc.remain = ms;
      sc.started = Date.now();
      sc.timer = setTimeout(function () {
        if (!state.scenario) return;
        state.scenario.timer = 0;
        state.scenario.remain = 0;
        goStep(state.scenario.index + 1);
      }, ms);
    }

    function pauseForUser() {
      var sc = state.scenario;
      if (!sc || !sc.playing || sc.paused) return;
      sc.paused = true;
      if (sc.timer) {
        clearTimeout(sc.timer);
        sc.timer = 0;
        var elapsed = Date.now() - sc.started;
        sc.remain = Math.max(600, sc.remain - elapsed);
      }
      updatePlayer();
    }

    function onPlay() {
      var sc = state.scenario;
      if (!sc || reduced()) return;
      if (sc.paused) {
        sc.paused = false;
        state.hover = null;
        state.pinned = null;
        state.hormoneHover = null;
        state.hormonePinned = null;
        state.flowSig = '';
        updatePlayer();
        refresh();
        schedule();
      } else pauseForUser();
    }

    function goPrev() {
      if (!state.scenario || state.scenario.index <= 0) return;
      goStep(state.scenario.index - 1);
    }
    function goNext() {
      if (!state.scenario) return;
      goStep(state.scenario.index + 1);
    }

    function updatePlayer() {
      var sc = state.scenario;
      if (!sc || !sc.playing) { ui.player.hidden = true; return; }
      ui.player.hidden = false;
      var step = sc.steps[sc.index];
      clearNode(ui.sub);
      ui.sub.appendChild(document.createTextNode(step.text + ' '));
      var count = el('span', 'anx-count');
      count.textContent = (sc.index + 1) + '/' + sc.steps.length;
      ui.sub.appendChild(count);
      clearNode(ui.dots);
      var i, d;
      for (i = 0; i < sc.steps.length; i++) {
        d = el('i', 'anx-pdot' + (i === sc.index ? ' is-on' : (i < sc.index ? ' is-done' : '')));
        ui.dots.appendChild(d);
      }
      var paused = sc.paused || reduced();
      ui.play.hidden = !!reduced();
      ui.play.textContent = paused ? '▶' : '⏸';
      ui.play.setAttribute('aria-label', paused ? '재생' : '일시정지');
    }

    /* ---------- 새로고침 ---------- */
    function refresh() {
      root.classList.toggle('is-tab-brain', state.tab === 'brain');
      root.classList.toggle('is-tab-endo', state.tab === 'endo');
      root.classList.toggle('is-female', state.sex === 'f');
      root.classList.toggle('is-male', state.sex === 'm');
      root.classList.toggle('is-single', state.mode !== 'both');

      var tabs = ui.tabs.querySelectorAll('.anx-tab');
      var i;
      for (i = 0; i < tabs.length; i++) {
        var on = tabs[i].getAttribute('data-tab') === state.tab;
        tabs[i].classList.toggle('is-on', on);
        tabs[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      var views = ui.views.querySelectorAll('.anx-view');
      for (i = 0; i < views.length; i++) {
        var von = views[i].getAttribute('data-view') === state.brainView;
        views[i].classList.toggle('is-on', von);
        views[i].setAttribute('aria-pressed', von ? 'true' : 'false');
      }
      var sexes = ui.sex.querySelectorAll('.anx-sexbtn');
      for (i = 0; i < sexes.length; i++) {
        var son = sexes[i].getAttribute('data-sex') === state.sex;
        sexes[i].classList.toggle('is-on', son);
        sexes[i].setAttribute('aria-pressed', son ? 'true' : 'false');
      }
      var showNote = state.tab === 'brain' && state.brainView === 'mid';
      ui.note.hidden = !showNote;
      if (showNote) ui.note.textContent = '점선: 해마·편도체는 정중선에서 약간 옆에 있어 이렇게 표시합니다.';

      var key = displayKey();
      var chips = ui.chips.querySelectorAll('.anx-chip');
      for (i = 0; i < chips.length; i++) {
        var ck = chips[i].getAttribute('data-key');
        var con = ck === state.hover || ck === state.pinned || (ck === key && !state.hover);
        chips[i].classList.toggle('is-on', !!con);
        chips[i].setAttribute('aria-pressed', ck === state.pinned ? 'true' : 'false');
      }
      var scenes = ui.scenes.querySelectorAll('.anx-scene');
      var sid = state.scenario && state.scenario.playing ? state.scenario.id : '';
      for (i = 0; i < scenes.length; i++) {
        scenes[i].classList.toggle('is-on', scenes[i].getAttribute('data-sid') === sid);
      }
      syncPanel();
      syncFlow();
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!state.pinned && !state.hormonePinned && !state.hover && !state.hormoneHover) return;
      if (root.contains(document.activeElement) && document.activeElement.blur) document.activeElement.blur();
      state.pinned = null;
      state.hormonePinned = null;
      state.hormoneHover = null;
      state.hover = null;
      state.flowSig = '';
      refresh();
    });
    document.addEventListener('visibilitychange', syncOff);
    if (typeof IntersectionObserver === 'function') {
      var io = new IntersectionObserver(function (ents) {
        state.onScreen = !!(ents[0] && ents[0].isIntersecting);
        syncOff();
      }, { threshold: 0.01 });
      io.observe(root);
    }
    try {
      var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq.addEventListener) mq.addEventListener('change', function () {
        state.flowSig = '';
        syncFlow();
      });
    } catch (e) {}

    rebuildStage();
    buildChips();
    buildScenarioButtons();
    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();
