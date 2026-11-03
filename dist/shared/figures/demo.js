/* 시험용 샘플 그림.
 * demo: update()가 크기·readout·active·follow를 바꾼다.
 * demo2: update가 없어 컨트롤이 바뀔 때마다 render를 다시 부르고, live로 시계만 흐른다.
 */
(function (NMFIG) {
  'use strict';

  function bg() {
    return '<rect x="8" y="8" width="624" height="344" rx="16" fill="var(--fgx-elev)" stroke="var(--fgx-line)"/>';
  }

  function structureSvg() {
    return [
      bg(),
      '<text x="28" y="48" font-size="14" fill="var(--fgx-mute)">밖</text>',
      '<text x="28" y="300" font-size="14" fill="var(--fgx-mute)">안</text>',
      '<g data-part="membrane">',
      '<rect class="fgx-vis" x="40" y="128" width="560" height="56" rx="12" fill="var(--fgx-c1-soft)" stroke="var(--fgx-c1)" stroke-width="2"/>',
      '<text x="56" y="162" font-size="14" fill="var(--fgx-ink)">세포막</text>',
      '</g>',
      '<g data-part="channel">',
      '<line x1="430" y1="116" x2="430" y2="196" stroke="var(--fgx-c8)" stroke-width="2" stroke-linecap="round"/>',
      '<rect class="js-size fgx-vis" data-cx="430" x="426" y="132" width="8" height="48" rx="3" fill="var(--fgx-c2)"/>',
      '<rect x="416" y="110" width="28" height="96" fill="transparent" pointer-events="all"/>',
      '</g>',
      '<g data-part="receptor">',
      '<circle class="fgx-vis" cx="210" cy="116" r="16" fill="var(--fgx-c4)"/>',
      '<text x="210" y="92" text-anchor="middle" font-size="13" fill="var(--fgx-ink)">수용체</text>',
      '</g>',
      '<g data-part="nucleus">',
      '<circle class="js-radius fgx-vis" cx="150" cy="270" r="26" fill="var(--fgx-c5-soft)" stroke="var(--fgx-c5)" stroke-width="2"/>',
      '<text x="150" y="275" text-anchor="middle" font-size="14" fill="var(--fgx-ink)">핵</text>',
      '</g>',
      '<g data-part="vesicle">',
      '<circle class="fgx-vis" cx="500" cy="268" r="20" fill="var(--fgx-c3-soft)" stroke="var(--fgx-c3)" stroke-width="2"/>',
      '<text x="500" y="273" text-anchor="middle" font-size="13" fill="var(--fgx-ink)">소포</text>',
      '</g>'
    ].join('');
  }

  function signalSvg() {
    return [
      bg(),
      '<text x="28" y="44" font-size="14" fill="var(--fgx-mute)">신호</text>',
      '<g data-part="membrane">',
      '<rect class="fgx-vis" x="40" y="150" width="560" height="40" rx="10" fill="var(--fgx-c1-soft)" stroke="var(--fgx-c1)" stroke-width="2"/>',
      '<text x="56" y="176" font-size="14" fill="var(--fgx-ink)">세포막</text>',
      '</g>',
      '<g data-part="channel">',
      '<line x1="320" y1="128" x2="320" y2="214" stroke="var(--fgx-c8)" stroke-width="2" stroke-linecap="round"/>',
      '<rect class="js-size fgx-vis" data-cx="320" x="316" y="136" width="8" height="70" rx="4" fill="var(--fgx-c2)"/>',
      '<rect x="306" y="122" width="28" height="100" fill="transparent" pointer-events="all"/>',
      '</g>',
      '<g data-part="receptor">',
      '<circle class="fgx-vis" cx="140" cy="140" r="14" fill="var(--fgx-c4)"/>',
      '<text x="140" y="116" text-anchor="middle" font-size="13" fill="var(--fgx-ink)">수용체</text>',
      '</g>',
      '<g data-part="nucleus">',
      '<circle class="js-radius fgx-vis" cx="100" cy="286" r="26" fill="var(--fgx-c5-soft)" stroke="var(--fgx-c5)" stroke-width="2"/>',
      '<text x="100" y="291" text-anchor="middle" font-size="14" fill="var(--fgx-ink)">핵</text>',
      '</g>',
      '<g data-part="vesicle">',
      '<circle class="fgx-vis" cx="540" cy="286" r="18" fill="var(--fgx-c3-soft)" stroke="var(--fgx-c3)" stroke-width="2"/>',
      '<text x="540" y="291" text-anchor="middle" font-size="13" fill="var(--fgx-ink)">소포</text>',
      '</g>'
    ].join('');
  }

  NMFIG.define('demo', {
    viewBox: [640, 360],
    views: [
      { id: 'structure', label: '구조', hint: '단면에서 본 막, 통로, 핵, 소포, 수용체.' },
      { id: 'signal', label: '신호', hint: '시간이 흐르면 통로가 넓어지고 핵이 조금 커진다.' }
    ],
    controls: [
      {
        id: 't', type: 'range', label: '시간', min: 0, max: 1, step: 0.01, value: 0,
        fmt: function (v) { return Math.round(v * 100) + '%'; },
        views: ['signal']
      },
      {
        id: 'ion', type: 'choice', label: '이온',
        options: [{ v: 'na', label: '나트륨' }, { v: 'k', label: '칼륨' }],
        value: 'na'
      },
      { id: 'gate', type: 'toggle', label: '통로 열기', value: false }
    ],
    animate: { control: 't', from: 0, to: 1, duration: 6000, loop: true, views: ['signal'] },
    render: function (v, view) {
      return view === 'signal' ? signalSvg() : structureSvg();
    },
    update: function (ctx) {
      var t = Number(ctx.v.t);
      if (t !== t) t = 0;
      var open = !!ctx.v.gate;
      var ion = ctx.v.ion === 'k' ? 'k' : 'na';
      var color = ion === 'k' ? 'var(--fgx-c5)' : 'var(--fgx-c2)';
      var w = (open ? 14 : 4) + t * (open ? 26 : 10);
      var nodes = ctx.part('channel');
      var i, node, cx, nuc, r, follow;
      for (i = 0; i < nodes.length; i++) {
        node = nodes[i].querySelector('.js-size');
        if (!node) continue;
        node.setAttribute('width', String(Math.round(w)));
        cx = Number(node.getAttribute('data-cx'));
        if (cx) node.setAttribute('x', String(cx - w / 2));
        node.setAttribute('fill', color);
      }
      r = 26 + t * 18;
      nuc = ctx.part('nucleus');
      for (i = 0; i < nuc.length; i++) {
        node = nuc[i].querySelector('.js-radius');
        if (node) node.setAttribute('r', String(Math.round(r)));
      }
      if (t < 0.08) follow = '';
      else if (t < 0.30) follow = 'membrane';
      else if (t < 0.55) follow = 'channel';
      else if (t < 0.78) follow = 'receptor';
      else follow = 'vesicle';
      var active = [];
      if (open || (t >= 0.30 && t < 0.78)) active.push('channel');
      if (t >= 0.78) active.push('vesicle');
      return {
        readout: '시간 ' + Math.round(t * 100) + '%\n' + (ion === 'k' ? '칼륨' : '나트륨') + (open ? ' · 통로 열림' : ' · 통로 닫힘'),
        active: active,
        follow: follow
      };
    }
  });

  function waveY(i, amp) {
    return 150 - Math.sin(i * Math.PI / 6) * amp * 64;
  }

  NMFIG.define('demo2', {
    viewBox: [640, 320],
    views: [
      { id: 'main', label: '파동', hint: '진폭을 키우면 마루와 골이 멀어진다.' }
    ],
    controls: [
      {
        id: 'amp', type: 'range', label: '진폭', min: 0.2, max: 1, step: 0.01, value: 0.45,
        fmt: function (v) { return Number(v).toFixed(2); }
      },
      {
        id: 'medium', type: 'choice', label: '매질',
        options: [{ v: 'air', label: '공기' }, { v: 'water', label: '물' }],
        value: 'air'
      },
      { id: 'show', type: 'toggle', label: '마루 표시', value: true }
    ],
    live: true,
    render: function (v) {
      var amp = Number(v.amp);
      if (amp !== amp) amp = 0.45;
      var show = !!v.show;
      var color = v.medium === 'water' ? 'var(--fgx-c6)' : 'var(--fgx-c1)';
      var pts = [];
      var i, x, y;
      for (i = 0; i <= 24; i++) {
        x = 48 + i * 22;
        y = waveY(i, amp);
        pts.push(x.toFixed(1) + ',' + y.toFixed(1));
      }
      var crestY = waveY(3, amp);
      var troughY = waveY(9, amp);
      return [
        '<rect x="8" y="8" width="624" height="304" rx="16" fill="var(--fgx-elev)" stroke="var(--fgx-line)"/>',
        '<line x1="48" y1="150" x2="580" y2="150" stroke="var(--fgx-line)" stroke-dasharray="4 6"/>',
        '<g data-part="string">',
        '<polyline fill="none" stroke="' + color + '" stroke-width="3" stroke-linejoin="round" points="' + pts.join(' ') + '"/>',
        '<rect x="40" y="60" width="540" height="200" fill="transparent" pointer-events="all"/>',
        '</g>',
        '<g data-part="source">',
        '<circle class="fgx-vis" cx="48" cy="150" r="12" fill="var(--fgx-c3)"/>',
        '<text x="48" y="128" text-anchor="middle" font-size="14" fill="var(--fgx-ink)">파원</text>',
        '</g>',
        '<g data-part="crest">',
        '<circle class="fgx-vis" cx="114" cy="' + crestY.toFixed(1) + '" r="10" fill="var(--fgx-c2)" opacity="' + (show ? '1' : '0') + '"/>',
        '<text x="114" y="' + (crestY - 16).toFixed(1) + '" text-anchor="middle" font-size="14" fill="var(--fgx-ink)">마루</text>',
        '</g>',
        '<g data-part="trough">',
        '<circle class="fgx-vis" cx="246" cy="' + troughY.toFixed(1) + '" r="10" fill="var(--fgx-c5)"/>',
        '<text x="246" y="' + (troughY + 28).toFixed(1) + '" text-anchor="middle" font-size="14" fill="var(--fgx-ink)">골</text>',
        '</g>'
      ].join('');
    }
  });
})(window.NMFIG);
