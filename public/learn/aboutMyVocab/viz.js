/* 단어 한 장 해설 — 단계별로 움직이는 그림 해설(재생·일시정지·단계 이동).
   window.VIZ[소문자 단어] = { color, t(단계당 초), tag, ipa, pos, kr, lead, scene(SVG), steps:[[제목, 설명, 예문?]], origin, ex, rel }
   scene 안에서 data-s="n" 인 요소는 n단계부터, data-e="m" 이 있으면 m단계까지 보인다.
   등장 방식: .vs(서서히) + .up(아래에서) .pop(커지며) .wipe(왼→오) .wipe-d(위→아래) .draw(선 긋기, pathLength="1")
   이동: .mv (--from 위치에서 제자리로). 반복 움직임: .a-fall .a-drip .a-rise .a-dash .a-bob .a-flap .a-pulse .a-slide .a-flow .a-flip .a-press */
(function () {
  const pts = (a) => a.map((p) => p.join(",")).join(" ");
  const badge = (k, x, y, c = "#1e5f99") =>
    `<g class="vs pop" data-s="${k}"><circle cx="${x}" cy="${y}" r="11.5" fill="${c}" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y + 4.4}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#fff">${k}</text></g>`;

  /* ───────── glacier ───────── */
  const glacier = (() => {
    const rock = [[0, 170], [55, 112], [100, 52], [112, 40], [128, 60], [200, 105], [280, 150], [360, 190], [440, 222], [500, 240], [560, 246], [560, 300], [0, 300]];
    const ice = [[116, 38], [150, 58], [200, 86], [280, 126], [360, 168], [440, 205], [464, 216], [464, 228], [440, 222], [360, 190], [280, 150], [200, 105], [128, 60], [112, 42]];
    const pack = [[116, 38], [150, 58], [200, 86], [280, 126], [300, 142], [300, 160], [280, 150], [200, 105], [128, 60], [112, 42]];
    const snow = [[116, 38], [150, 58], [200, 86], [280, 126], [292, 132], [286, 141], [280, 135], [200, 95], [150, 67], [116, 47]];
    const line = (off) => pts([[150, 58 + off], [200, 86 + off], [280, 126 + off], [360, 168 + off], [440, 205 + off]]);
    const flake = (x, y, s, d) =>
      `<g transform="translate(${x} ${y}) scale(${s})"><g class="a-fall" style="animation-delay:${d}s"><path d="M-5 0H5M0 -5V5M-3.5 -3.5L3.5 3.5M-3.5 3.5L3.5 -3.5"/></g></g>`;
    const pill = (x, inner, dl) =>
      `<g class="vs pop" data-s="2" style="--dl:${dl}s"><rect x="${x}" y="12" width="44" height="30" rx="15" fill="#fff" stroke="#3b8fcf" stroke-opacity=".5"/><g transform="translate(${x + 22} 27)">${inner}</g></g>`;
    const next = (x, dl) => `<g class="vs" data-s="2" style="--dl:${dl}s"><path d="M${x - 6} 27H${x + 6}M${x + 2} 23L${x + 6} 27L${x + 2} 31" stroke="#1e5f99" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
    const iFlake = `<g stroke="#5aa9dd" stroke-width="1.8" stroke-linecap="round"><path d="M-8 0H8M0 -8V8M-5.6 -5.6L5.6 5.6M-5.6 5.6L5.6 -5.6"/></g>`;
    const iPack = `<g fill="#dcecf8" stroke="#8fb8d8" stroke-width="1"><circle cx="-6" cy="-5" r="3.2"/><circle cx="0" cy="-5" r="3.2"/><circle cx="6" cy="-5" r="3.2"/><circle cx="-3" cy="1" r="3.2"/><circle cx="3" cy="1" r="3.2"/><circle cx="0" cy="7" r="3.2"/></g>`;
    const iIce = `<rect x="-8" y="-8" width="16" height="16" rx="3" fill="url(#gl-ice)" stroke="#5eaadf" stroke-width="1.2"/><path d="M-4 -3.5L2 -3.5M-4 0L-1 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
    const drip = (d, dl) => `<g class="a-drip" style="animation-delay:${dl}s"><path d="${d}"/></g>`;
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="빙하가 만들어져 흘러내리는 과정">
<defs>
<linearGradient id="gl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b7dcff"/><stop offset="1" stop-color="#f1f8ff"/></linearGradient>
<linearGradient id="gl-rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76869b"/><stop offset="1" stop-color="#3b4658"/></linearGradient>
<linearGradient id="gl-ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaf8ff"/><stop offset=".55" stop-color="#9bd2f3"/><stop offset="1" stop-color="#5eaadf"/></linearGradient>
<linearGradient id="gl-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcecf8"/></linearGradient>
<linearGradient id="gl-water" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fd0f2"/><stop offset="1" stop-color="#3b8fcf"/></linearGradient>
<radialGradient id="gl-sun"><stop offset="0" stop-color="#fff4c4"/><stop offset="1" stop-color="#fff4c4" stop-opacity="0"/></radialGradient>
<marker id="gl-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1e5f99"/></marker>
<clipPath id="gl-clip"><rect width="560" height="300" rx="14"/></clipPath>
</defs>
<g clip-path="url(#gl-clip)">
<rect width="560" height="300" fill="url(#gl-sky)"/>
<circle cx="524" cy="96" r="46" fill="url(#gl-sun)"/><circle cx="524" cy="96" r="15" fill="#ffe9a8"/>
<polygon points="0,205 60,152 110,186 170,122 232,192 300,160 362,202 424,172 500,206 560,192 560,300 0,300" fill="#cdd9e8" opacity=".7"/>
<polygon points="${pts(rock)}" fill="url(#gl-rock)"/>
<polygon class="vs wipe" data-s="1" style="--d:1.6s" points="${pts(pack)}" fill="url(#gl-snow)"/>
<g class="vs wipe" data-s="2" style="--d:2s"><polygon points="${pts(ice)}" fill="url(#gl-ice)"/>
<polyline points="${line(8)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/>
<polyline points="${line(15)}" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1"/></g>
<g class="vs" data-s="3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="14 16">
<polyline class="a-dash" points="${line(8)}" stroke-opacity=".95"/><polyline class="a-dash" points="${line(15)}" stroke-opacity=".7" style="animation-delay:-.6s"/></g>
<polygon class="vs wipe" data-s="1" style="--d:1.6s" points="${pts(snow)}" fill="#fff"/>
<g class="vs" data-s="3" stroke="#3b82c4" stroke-width="1.7" stroke-linecap="round"><path d="M318 147l6 12M340 157l6 11M300 138l5 10M388 178l5 9"/></g>
<g class="vs" data-s="2" data-e="2" style="--dl:.2s"><g class="a-press" fill="none" stroke="#1e5f99" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M172 46v14m-5-5 5 5 5-5M212 68v14m-5-5 5 5 5-5M246 85v14m-5-5 5 5 5-5"/></g></g>
${pill(346, iFlake, 0.3)}${next(404, 0.7)}${pill(420, iPack, 0.9)}${next(478, 1.3)}${pill(494, iIce, 1.5)}
<g class="vs" data-s="3" fill="none" stroke="#1e5f99" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="8 7" marker-end="url(#gl-ar)">
<path class="a-dash" d="M338 132Q362 142 386 156"/><path class="a-dash" d="M408 168Q428 177 448 189"/></g>
<g class="vs wipe" data-s="4" style="--d:1.4s;--dl:.3s">
<path d="M462 227 Q492 232 530 240 L560 246 L560 260 Q520 254 480 245 L462 233Z" fill="url(#gl-water)"/>
<ellipse cx="520" cy="266" rx="38" ry="8" fill="url(#gl-water)" opacity=".85"/>
<g stroke="#fff" stroke-opacity=".7" stroke-width="1.2" fill="none"><path d="M500 266q8-3 16 0M524 263q8-3 14 0M510 270q10-2 20 0"/></g></g>
<g class="vs" data-s="4"><g fill="#4aa3e0">${drip("M449 184q-4 7 0 9q4-2 0-9z", 0)}${drip("M468 191q-4 7 0 9q4-2 0-9z", -0.5)}${drip("M482 205q-4 7 0 9q4-2 0-9z", -1)}</g></g>
<g class="vs" data-s="4" data-e="4"><circle class="a-pulse" cx="524" cy="96" r="18" fill="none" stroke="#f59e0b" stroke-width="2.4"/></g>
<g class="vs" data-s="1" stroke="#5aa9dd" stroke-width="1.4" stroke-linecap="round" fill="none">
${flake(126, 14, 1.1, 0)}${flake(152, 30, 1, -1.1)}${flake(232, 16, 0.9, -2)}${flake(262, 36, 1.1, -0.6)}${flake(92, 26, 0.9, -1.6)}</g>
</g></svg>`;
    return { pic: true, n: 4, color: "#2b8cc4", t: 3.8, scene: svg };
  })();

  /* ───────── pollination ───────── */
  const pollination = (() => {
    const cx = 330;
    const petal = (a, fill, o = 1) => `<g transform="translate(${cx} 206) rotate(${a})" opacity="${o}"><path d="M0 0C-26-28-32-82 0-112C32-82 26-28 0 0Z" fill="${fill}" stroke="#e0709f" stroke-width="1"/><path d="M0-8V-96M-8-30Q-14-60 -4-92M8-30Q14-60 4-92" stroke="#e0709f" stroke-opacity=".35" fill="none"/></g>`;
    const grains = [[280, 112], [282, 130], [274, 122], [378, 106], [385, 116], [376, 138]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.3" fill="#f2b705"/>`).join("");
    const leader = (k, dl, x1, y1, x2, y2, label, sub) =>
      `<g class="vs up" data-s="${k}" style="--dl:${dl}s"><path d="M${x1} ${y1}L${x2} ${y2}" stroke="#7b8794" stroke-width="1" fill="none"/><circle cx="${x1}" cy="${y1}" r="2.5" fill="#7b8794"/><text x="${x2 + 6}" y="${y2 + 4}" font-size="15" font-weight="700" fill="#374151">${label}</text><text x="${x2 + 6}" y="${y2 + 19}" font-size="12.5" fill="#6b7280">${sub}</text></g>`;
    // 벌(오른쪽을 봄) — 작은 꽃(100,160)에서 출발해 암술머리 옆(296,90)으로 날아간다. 가로·세로 속도를 달리해 곡선으로 난다
    const bee = `<g transform="translate(296 90)">
<g class="mv" data-s="2" style="--from:translateX(-196px);--d:1.9s;--ease:cubic-bezier(.45,0,.35,1)">
<g class="mv" data-s="2" style="--from:translateY(70px);--d:1.9s;--ease:cubic-bezier(.15,.7,.3,1)">
<g class="a-bob">
<g class="a-flap"><ellipse cx="-6" cy="-20" rx="8" ry="14" transform="rotate(-20 -6 -20)" fill="#fff" fill-opacity=".85" stroke="#8fb8e6" stroke-width="1.2"/><ellipse cx="7" cy="-20" rx="8" ry="14" transform="rotate(22 7 -20)" fill="#fff" fill-opacity=".85" stroke="#8fb8e6" stroke-width="1.2"/></g>
<ellipse rx="24" ry="14" fill="#f6c343" stroke="#7a5a00" stroke-width="1.2"/>
<g clip-path="url(#po-bee)" fill="#3b2f00" opacity=".88"><rect x="-14" y="-16" width="5.5" height="32"/><rect x="-4" y="-16" width="5.5" height="32"/><rect x="6" y="-16" width="5.5" height="32"/></g>
<circle cx="27" cy="-1" r="9" fill="#3b2f00"/><circle cx="30" cy="-3" r="2.2" fill="#fff"/>
<path d="M32-9l6-7M27-10l2-9" stroke="#3b2f00" stroke-width="1.4" stroke-linecap="round"/>
<path d="M-24 0l-8 3 8 3z" fill="#3b2f00"/>
<path d="M8 13l3 9M-2 14l0 9M-12 13l-3 8" stroke="#3b2f00" stroke-width="1.6" stroke-linecap="round"/>
<g class="vs pop" data-s="1" data-e="2" style="--dl:.8s"><circle cx="11" cy="24" r="3.6" fill="#f2b705"/><circle cx="0" cy="25" r="3.6" fill="#f2b705"/><circle cx="-15" cy="23" r="3.4" fill="#f2b705"/></g>
</g></g></g></g>`;
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="벌이 꽃가루를 옮겨 수분이 일어나는 과정">
<defs>
<linearGradient id="po-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6fa"/><stop offset="1" stop-color="#e8f5e2"/></linearGradient>
<linearGradient id="po-style" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8cc86f"/><stop offset="1" stop-color="#5aa75a"/></linearGradient>
<linearGradient id="po-anther" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#f2b705"/></linearGradient>
<clipPath id="po-clip"><rect width="560" height="300" rx="14"/></clipPath>
<clipPath id="po-bee"><ellipse cx="0" cy="0" rx="24" ry="14"/></clipPath>
</defs>
<g clip-path="url(#po-clip)">
<rect width="560" height="300" fill="url(#po-bg)"/>
<path d="M0 262Q140 240 280 258T560 250V300H0Z" fill="#d6edc9"/>
<g><path d="M66 212V268" stroke="#5aa75a" stroke-width="3.5" fill="none"/>
${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="66" cy="196" rx="8" ry="13" fill="#ffb3d1" stroke="#e0709f" stroke-width=".8" transform="rotate(${a} 66 206)"/>`).join("")}
<circle cx="66" cy="206" r="8" fill="#f2b705"/><circle cx="62" cy="203" r="1.8" fill="#fff3b0"/><circle cx="70" cy="209" r="1.8" fill="#fff3b0"/></g>
<path d="M${cx} 268V214" stroke="#5aa75a" stroke-width="9" stroke-linecap="round"/>
<path d="M${cx} 216Q${cx - 24} 214 ${cx - 34} 226Q${cx - 16} 228 ${cx} 222ZM${cx} 216Q${cx + 24} 214 ${cx + 34} 226Q${cx + 16} 228 ${cx} 222Z" fill="#6fb55f"/>
${petal(-62, "#ffe3ee", 0.95)}${petal(62, "#ffe3ee", 0.95)}${petal(-26, "#ffb3d1")}${petal(26, "#ffb3d1")}
<path d="M${cx - 5} 196Q${cx - 24} 160 ${cx - 34} 128" stroke="#86c66a" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M${cx + 5} 196Q${cx + 24} 160 ${cx + 34} 128" stroke="#86c66a" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="${cx - 36}" cy="122" rx="8" ry="12" transform="rotate(-18 ${cx - 36} 122)" fill="url(#po-anther)" stroke="#d99a00" stroke-width="1"/>
<ellipse cx="${cx + 36}" cy="122" rx="8" ry="12" transform="rotate(18 ${cx + 36} 122)" fill="url(#po-anther)" stroke="#d99a00" stroke-width="1"/>
${grains}
<rect x="${cx - 4.5}" y="120" width="9" height="76" rx="4" fill="url(#po-style)"/>
<path class="vs draw" data-s="4" pathLength="1" style="--d:1.6s" d="M${cx} 121V194" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round" fill="none"/>
<ellipse cx="${cx}" cy="206" rx="21" ry="16" fill="#b6e08f" stroke="#5aa75a" stroke-width="1.2"/>
<ellipse cx="${cx - 7}" cy="203" rx="4.5" ry="6" fill="#fff3c4"/><ellipse cx="${cx + 7}" cy="203" rx="4.5" ry="6" fill="#fff3c4"/><ellipse cx="${cx}" cy="211" rx="4.5" ry="5.5" fill="#fff3c4"/>
<g class="vs pop" data-s="4" style="--dl:1.5s" fill="#f7b500" stroke="#c98a00" stroke-width=".8"><ellipse cx="${cx - 7}" cy="203" rx="4.5" ry="6"/><ellipse cx="${cx + 7}" cy="203" rx="4.5" ry="6"/><ellipse cx="${cx}" cy="211" rx="4.5" ry="5.5"/></g>
<ellipse cx="${cx}" cy="114" rx="14" ry="8.5" fill="#ff8fb8" stroke="#d6568a" stroke-width="1"/>
<g class="vs" data-s="3" data-e="3"><ellipse class="a-pulse" cx="${cx}" cy="114" rx="14" ry="8.5" fill="none" stroke="#d6568a" stroke-width="2"/></g>
<g class="vs pop" data-s="3" style="--dl:.5s" fill="#f2b705" stroke="#b98900" stroke-width=".6"><circle cx="${cx - 6}" cy="111" r="2.6"/><circle cx="${cx + 2}" cy="109" r="2.6"/><circle cx="${cx + 8}" cy="114" r="2.6"/></g>
<g class="vs wipe" data-s="2" style="--d:1.9s"><path d="M104 146C140 96 200 70 262 84" stroke="#d6568a" stroke-width="2.2" stroke-dasharray="5 4" fill="none"/></g>
${leader(1, 0.4, cx + 36, 122, 438, 138, "꽃가루", "pollen")}${leader(3, 0.6, cx + 14, 112, 438, 98, "암술머리", "stigma")}${leader(4, 0.4, cx + 3, 160, 438, 178, "꽃가루관", "pollen tube")}${leader(4, 1.3, cx + 20, 208, 438, 226, "씨방", "ovary → 열매")}
${bee}
${badge(1, 30, 178, "#d6568a")}${badge(2, 166, 64, "#d6568a")}${badge(3, 358, 78, "#d6568a")}${badge(4, 294, 246, "#d6568a")}
</g></svg>`;
    return {
      color: "#d6568a", t: 3.8, tag: "움직이는 해설 · 과정", ipa: "/ˌpɑːləˈneɪʃn/", pos: "n.", kr: "수분(受粉)",
      lead: "꽃가루가 곤충·바람에 실려 암술머리에 닿는 일 — 열매와 씨앗의 시작",
      scene: svg,
      steps: [
        ["꽃가루가 묻는다", "벌이 꿀을 찾아 꽃에 앉을 때 다리와 몸에 꽃가루가 묻습니다"],
        ["다른 꽃으로 이동", "꽃가루를 단 채 다른 꽃으로 날아갑니다 (바람·새도 옮겨 줌)"],
        ["암술머리에 닿는다", "끈적한 암술머리에 꽃가루가 붙는 순간 — 이것이 수분입니다"],
        ["수정 → 열매", "꽃가루관이 자라 씨방 속 밑씨에 닿으면 씨앗과 열매가 생깁니다"],
      ],
      origin: ["어원", "pollen(고운 가루, 라틴어) + ate + ion → 꽃가루를 옮기는 일"],
      ex: ["Bees play a key role in the pollination of many crops.", "벌은 많은 농작물의 수분에서 핵심 역할을 한다."],
      rel: [["pollen", "꽃가루"], ["pollinate", "수분하다"], ["pollinator", "수분 매개자"]],
    };
  })();

  /* ───────── vessel ───────── */
  const vessel = (() => {
    const tile = (k, x, c, title, en, chip, icon) => `
<g transform="translate(${x} 0)">
<path class="vs draw" data-s="${k}" pathLength="1" style="--d:.5s" d="M83 58V80" stroke="${c}" stroke-width="2" fill="none" stroke-opacity=".5"/>
<g class="vs up" data-s="${k}" style="--dl:.25s">
<rect x="0" y="80" width="166" height="206" rx="16" fill="#fff" stroke="${c}" stroke-opacity=".35" stroke-width="1.4"/>
<rect x="10" y="90" width="146" height="104" rx="12" fill="${c}" fill-opacity=".08"/>
<g transform="translate(83 142)" clip-path="url(#ve-ic)">${icon}</g>
<text x="83" y="222" text-anchor="middle" font-size="18" font-weight="700" fill="#1f2937">${title}</text>
<text x="83" y="241" text-anchor="middle" font-size="12" fill="#6b7280">${en}</text>
<rect x="${83 - chip.length * 3.9 - 12}" y="251" width="${chip.length * 7.8 + 24}" height="24" rx="12" fill="${c}" fill-opacity=".12"/>
<text x="83" y="267" text-anchor="middle" font-size="12.5" font-weight="600" fill="${c}">${chip}</text></g></g>`;
    const wave = (y, w, c, op) => `<path d="M-102 ${y}${" q10 -6 20 0".repeat(10)}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`;
    const box = (x, y, c, dl) => `<g class="vs pop" data-s="1" style="--dl:${dl}s"><rect x="${x}" y="${y}" width="11" height="9" rx="1.5" fill="${c}" stroke="#0f172a" stroke-opacity=".35" stroke-width=".8"/></g>`;
    const ship = `<g class="a-bob" style="animation-duration:2.4s">
<path d="M-50 12H50L36 36H-36Z" fill="#0f766e"/><path d="M-50 12H50" stroke="#99f6e4" stroke-width="2"/>
<rect x="-30" y="-12" width="34" height="24" rx="3" fill="#e2e8f0" stroke="#94a3b8"/>
<g fill="#38bdf8"><rect x="-24" y="-6" width="7" height="7" rx="1"/><rect x="-13" y="-6" width="7" height="7" rx="1"/><rect x="-2" y="-6" width="4" height="7" rx="1"/></g>
<rect x="-14" y="-30" width="11" height="18" rx="2" fill="#ef4444"/><rect x="-14" y="-30" width="11" height="4" fill="#111827"/>
${box(12, 3, "#f59e0b", 0.8)}${box(24, 3, "#6366f1", 1)}${box(36, 3, "#f59e0b", 1.2)}${box(18, -6, "#ec4899", 1.4)}${box(30, -6, "#22c55e", 1.6)}
</g>
<g class="a-slide">${wave(40, 3.2, "#38bdf8", 1)}</g><g class="a-slide" style="animation-duration:2.3s;animation-direction:reverse">${wave(48, 2.4, "#7dd3fc", 0.8)}</g>`;
    const jarPath = "M-20-36H20V-28C42-14 46 12 32 36C24 46-24 46-32 36C-46 12-42-14-20-28Z";
    const jar = `<path d="${jarPath}" fill="#fbbf24" stroke="#b45309" stroke-width="1.6"/>
<g clip-path="url(#ve-jar)"><g class="mv" data-s="2" style="--from:translateY(46px);--d:2.2s;--dl:.5s"><g class="a-slide" style="animation-duration:2s">
<path d="M-102 0${" q10 -6 20 0".repeat(10)}V60H-102Z" fill="#38bdf8" opacity=".75"/>${wave(0, 2, "#fff", 0.85)}</g></g></g>
<path d="M-37 6Q0 -4 37 6M-39 18Q0 8 39 18" stroke="#b45309" stroke-opacity=".35" stroke-width="2" fill="none"/>
<ellipse cx="0" cy="-36" rx="20" ry="5.5" fill="#fde68a" stroke="#b45309" stroke-width="1.4"/>`;
    const cells = Array.from({ length: 8 }, (_, i) => {
      const x = -105 + i * 30, y = i % 2 ? 3 : -1;
      return `<ellipse cx="${x}" cy="${y}" rx="10" ry="6.5" fill="#dc2626"/><ellipse cx="${x}" cy="${y}" rx="4" ry="2.4" fill="#fca5a5"/>`;
    }).join("");
    const vein = `<path d="M-58-16C-36-24 28-8 58-16V20C28 28-36 12-58 20Z" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
<g clip-path="url(#ve-tube)"><g class="a-flow">${cells}</g></g>
<g class="vs wipe" data-s="3" style="--dl:.6s;--d:1s" opacity=".8"><path d="M-46 -34H38" stroke="#dc2626" stroke-width="2.4" fill="none"/><path d="M36 -40L48 -34L36 -28Z" fill="#dc2626"/></g>
<text x="0" y="48" text-anchor="middle" font-size="12.5" fill="#b91c1c">피가 흐르는 관</text>`;
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="vessel의 세 가지 뜻">
<defs><linearGradient id="ve-rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#14b8a6"/></linearGradient>
<clipPath id="ve-clip"><rect width="560" height="300" rx="14"/></clipPath>
<clipPath id="ve-ic"><rect x="-73" y="-52" width="146" height="104" rx="12"/></clipPath>
<clipPath id="ve-jar"><path d="${jarPath}"/></clipPath>
<clipPath id="ve-tube"><path d="M-57-15C-36-23 28-7 57-15V19C28 27-36 11-57 19Z"/></clipPath></defs>
<g clip-path="url(#ve-clip)">
<rect width="560" height="300" fill="#f1f8f7"/>
<rect x="40" y="12" width="480" height="46" rx="23" fill="url(#ve-rb)"/>
<text x="280" y="31" text-anchor="middle" font-size="12" fill="#ccfbf1" letter-spacing="1.5">vas (라틴어 · 그릇)</text>
<text x="280" y="49" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">무언가를 담아 나르는 것 = vessel</text>
${tile(1, 14, "#0f766e", "선박", "a large ship", "cargo vessel", ship)}${tile(2, 197, "#b45309", "그릇·용기", "a container for liquid", "a vessel of water", jar)}${tile(3, 380, "#dc2626", "혈관", "a tube carrying blood", "blood vessel", vein)}
</g></svg>`;
    return {
      color: "#0f766e", t: 3.4, tag: "움직이는 해설 · 다의어", ipa: "/ˈvesl/", pos: "n.", kr: "선박 · 그릇 · 혈관",
      lead: "뜻은 셋이지만 그림은 하나 — ‘안에 무언가를 담아 나르는 통’",
      scene: svg,
      steps: [
        ["선박", "사람과 짐을 싣고 바다 위를 나르는 큰 배", "The vessel sank in the storm. (그 선박은 폭풍 속에서 가라앉았다.)"],
        ["그릇·용기", "물이나 술 같은 액체를 담아 두는 통", "Pour the water into a clean vessel. (깨끗한 그릇에 물을 부어라.)"],
        ["혈관", "피를 싣고 온몸을 도는 관 — blood vessel", "Smoking can damage blood vessels. (흡연은 혈관을 손상시킬 수 있다.)"],
      ],
      origin: ["어원", "vas(그릇, 라틴어) → 작은 그릇 vasculum → 고대 프랑스어 vaissel → vessel"],
      ex: ["Cholesterol can block the blood vessels near the heart.", "콜레스테롤은 심장 가까운 혈관을 막을 수 있다."],
      rel: [["vase", "꽃병"], ["vascular", "혈관의"], ["blood vessel", "혈관"]],
    };
  })();

  /* ───────── chronic ───────── */
  const chronic = (() => {
    const acute = "M70 226C104 226 122 64 154 56C186 64 204 222 238 226L520 226";
    const chron = "M70 226C118 214 168 172 224 152C262 138 296 142 330 136C366 130 396 140 430 134C466 128 494 134 520 130";
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="급성과 만성의 차이">
<defs>
<linearGradient id="ch-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e11d48" stop-opacity=".28"/><stop offset="1" stop-color="#e11d48" stop-opacity="0"/></linearGradient>
<linearGradient id="ch-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d5bd0" stop-opacity=".28"/><stop offset="1" stop-color="#6d5bd0" stop-opacity="0"/></linearGradient>
<marker id="ch-ax" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#6b7280"/></marker>
<clipPath id="ch-clip"><rect width="560" height="300" rx="14"/></clipPath>
</defs>
<g clip-path="url(#ch-clip)">
<rect width="560" height="300" fill="#f7f6fd"/>
<g stroke="#d9d6f0" stroke-width="1"><path d="M70 60H520M70 110H520M70 160H520"/></g>
<path d="M70 24V232H524" stroke="#6b7280" stroke-width="1.6" fill="none" marker-end="url(#ch-ax)"/>
<text x="76" y="22" font-size="13.5" fill="#6b7280" font-weight="600">증상의 세기</text>
<text x="524" y="280" text-anchor="end" font-size="13.5" fill="#6b7280" font-weight="600">시간 →</text>
<path class="vs" data-s="1" style="--dl:1s" d="${acute}V232H70Z" fill="url(#ch-a)"/>
<path class="vs" data-s="2" style="--dl:2s" d="${chron}V232H70Z" fill="url(#ch-c)"/>
<path class="vs draw" data-s="1" pathLength="1" style="--d:1.5s" d="${acute}" stroke="#e11d48" stroke-width="3" fill="none" stroke-linecap="round"/>
<path class="vs draw" data-s="2" pathLength="1" style="--d:2.6s" d="${chron}" stroke="#6d5bd0" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<g class="vs pop" data-s="1" style="--dl:.7s"><circle cx="154" cy="56" r="5" fill="#e11d48" stroke="#fff" stroke-width="2"/></g>
<g class="vs up" data-s="1" style="--dl:1.2s"><rect x="212" y="30" width="184" height="52" rx="10" fill="#fff" stroke="#fecdd3"/><text x="224" y="52" font-size="16" font-weight="700" fill="#be123c">급성 acute</text><text x="224" y="71" font-size="12.5" fill="#6b7280">갑자기 · 심하게 · 금방 지나감</text></g>
<g class="vs up" data-s="2" style="--dl:2.2s"><rect x="258" y="160" width="226" height="52" rx="10" fill="#fff" stroke="#ddd8fa"/><text x="270" y="182" font-size="16" font-weight="700" fill="#4f3fb5">만성 chronic</text><text x="270" y="201" font-size="12.5" fill="#6b7280">세지 않아도 · 오랫동안 · 계속</text></g>
<g class="vs wipe" data-s="2" style="--dl:1s;--d:1.6s"><path d="M232 246H512" stroke="#6d5bd0" stroke-width="1.8" fill="none"/><path d="M234 240.5L224 246L234 251.5ZM510 240.5L520 246L510 251.5Z" fill="#6d5bd0"/>
<text x="372" y="266" text-anchor="middle" font-size="13.5" fill="#4f3fb5" font-weight="600">오랜 기간 이어짐</text></g>
<g transform="translate(486 58)"><g class="vs pop" data-s="3"><g class="a-flip"><path d="M-12-16H12L2 0L12 16H-12L-2 0Z" fill="#ede9ff" stroke="#6d5bd0" stroke-width="1.8" stroke-linejoin="round"/><path d="M-7-12H7L2 -4H-2ZM-3 8H3L7 13H-7Z" fill="#6d5bd0"/></g></g></g>
<g class="vs up" data-s="3" style="--dl:.4s"><text x="486" y="96" text-anchor="middle" font-size="12.5" fill="#4f3fb5" font-weight="700">chrono = 시간</text></g>
</g></svg>`;
    return {
      color: "#6d5bd0", t: 4, tag: "움직이는 해설 · 비교", ipa: "/ˈkrɑːnɪk/", pos: "adj.", kr: "만성의",
      lead: "세기가 약해도 ‘시간’을 길게 끌며 이어지는 것 — 반대말은 acute(급성의)",
      scene: svg,
      steps: [
        ["acute — 급성", "갑자기 시작해 심하게 나타나고, 비교적 빨리 가라앉습니다"],
        ["chronic — 만성", "천천히 생겨 오래 이어집니다. 병뿐 아니라 문제·상황에도 씁니다 (chronic shortage 만성적 부족)"],
        ["chron(o) = 시간", "chronology(연대기), synchronize(시간을 맞추다), chronicle(연대기·기록)이 같은 뿌리"],
      ],
      origin: ["어원", "chronos(시간, 그리스어) + ic → 시간에 걸친 → 오래 끄는"],
      ex: ["She has suffered from chronic back pain for years.", "그녀는 수년째 만성 요통에 시달려 왔다."],
      rel: [["acute", "급성의"], ["chronology", "연대기"], ["synchronize", "동시에 맞추다"]],
    };
  })();

  /* ───────── sediment ───────── */
  const sediment = (() => {
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="강물이 흙을 실어 와 호수 바닥에 가라앉아 층을 이루는 과정">
<defs>
<linearGradient id="se-water" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9e0f4"/><stop offset="1" stop-color="#8ccbe9"/></linearGradient>
<clipPath id="se-clip"><rect width="560" height="300" rx="14"/></clipPath>
<clipPath id="se-in"><rect x="301" y="91" width="238" height="184"/></clipPath>
</defs>
<g clip-path="url(#se-clip)">
<rect width="560" height="300" fill="#efe4cf"/>
<rect x="298" y="88" width="244" height="190" rx="10" fill="none" stroke="#8a6a48" stroke-width="6"/>
<path d="M0 96H304V132H0Z" fill="url(#se-water)"/>
<g class="vs" data-s="1" data-e="2"><path class="a-slide" d="M0 110q15 -5 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6"/></g>
<g class="vs" data-s="1" data-e="2" fill="#7a5a36"><g class="a-flow"><circle cx="40" cy="112" r="3.5"/><circle cx="92" cy="122" r="3"/><circle cx="150" cy="106" r="3.8"/><circle cx="206" cy="118" r="3.2"/><circle cx="250" cy="110" r="3.6"/><circle cx="276" cy="124" r="3"/></g></g>
<rect x="301" y="91" width="238" height="184" fill="#cfe9f7"/>
<g clip-path="url(#se-in)">
<rect class="vs up" data-s="3" style="--dl:0s" x="301" y="244" width="238" height="31" fill="#dcbf8c"/>
<rect class="vs up" data-s="3" style="--dl:.7s" x="301" y="216" width="238" height="28" fill="#b98f5f"/>
<rect class="vs up" data-s="3" style="--dl:1.4s" x="301" y="190" width="238" height="26" fill="#8e6c46"/>
</g>
<g class="vs" data-s="2" data-e="2" fill="#7a5a36">
<circle class="a-fall" style="animation-delay:0s" cx="330" cy="140" r="3"/>
<circle class="a-fall" style="animation-delay:-.8s" cx="362" cy="158" r="2.6"/>
<circle class="a-fall" style="animation-delay:-1.6s" cx="398" cy="146" r="3.2"/>
<circle class="a-fall" style="animation-delay:-2.2s" cx="430" cy="166" r="2.8"/>
<circle class="a-fall" style="animation-delay:-.4s" cx="466" cy="150" r="3"/>
<circle class="a-fall" style="animation-delay:-2.8s" cx="500" cy="172" r="2.6"/>
</g>
<g class="vs up" data-s="1" style="--dl:.3s"><text x="150" y="86" text-anchor="middle" font-size="13" font-weight="700" fill="#2a4d69">강물 흐름 →</text></g>
<g class="vs up" data-s="3" style="--dl:.2s" fill="#3a2a18" font-size="12.5" font-weight="700" text-anchor="end"><text x="530" y="263">모래</text></g>
<g class="vs up" data-s="3" style="--dl:.9s" fill="#3a2a18" font-size="12.5" font-weight="700" text-anchor="end"><text x="530" y="234">진흙</text></g>
<g class="vs up" data-s="3" style="--dl:1.6s" fill="#f5efe4" font-size="12.5" font-weight="700" text-anchor="end"><text x="530" y="205">점토</text></g>
<g class="vs up" data-s="3" style="--dl:2s"><text x="150" y="214" text-anchor="middle" font-size="13.5" font-weight="700" fill="#5b4327">퇴적층 (층층이 쌓인 흙)</text><path d="M236 206H290" stroke="#5b4327" stroke-width="1.6" fill="none"/><path d="M286 201L296 206L286 211Z" fill="#5b4327"/></g>
${badge(1, 40, 70)}${badge(2, 330, 74)}${badge(3, 520, 166)}
</g></svg>`;
    return {
      color: "#8e6c46", t: 3.6, tag: "움직이는 해설 · 과정", ipa: "/ˈsedɪmənt/", pos: "n.", kr: "침전물",
      lead: "물에 실려 온 흙과 모래가 가라앉아 층층이 쌓인 것 — 굳으면 퇴적암이 됩니다",
      scene: svg,
      steps: [
        ["강물이 흙을 싣고 흐른다", "물살에 흙과 모래 알갱이가 떠서 실려 갑니다"],
        ["물살이 느려지면 가라앉는다", "고요한 호수에서는 무거운 알갱이부터 바닥으로 가라앉습니다"],
        ["층층이 쌓여 퇴적층이 된다", "쌓인 층이 오랜 세월 눌려 굳으면 퇴적암(sedimentary rock)이 됩니다"],
      ],
      origin: ["어원", "sedere(앉다, 라틴어) → sedimentum(가라앉은 것) → sediment : 바닥에 앉은 것"],
      ex: ["The river deposits sediment at its mouth.", "강은 하구에 침전물을 쌓아 놓는다."],
      rel: [["sedimentary", "퇴적의"], ["settle", "가라앉다"], ["deposit", "퇴적시키다"]],
    };
  })();

  /* ───────── condense ───────── */
  const condense = (() => {
    const cloud = [[60, 230, 4], [84, 212, 3], [112, 236, 3.5], [140, 206, 4], [170, 232, 3], [196, 212, 4], [226, 236, 3.5], [250, 216, 3], [110, 194, 3], [186, 194, 3.5], [240, 196, 3]];
    const vapor = cloud.map(([x, y, r], i) => `<circle class="a-rise" style="animation-delay:${-(i * 0.42).toFixed(2)}s" cx="${x}" cy="${y}" r="${r}"/>`).join("");
    const drops = [[392, 132, 4], [390, 154, 3], [498, 128, 4.5], [492, 174, 3.5], [396, 198, 3], [494, 214, 4], [388, 234, 3.5], [474, 146, 2.5], [480, 226, 3]];
    const beads = drops.map(([x, y, r], i) => `<circle class="vs pop" data-s="3" style="--dl:${(i * 0.12).toFixed(2)}s" cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="#6fa8c9" stroke-width="1"/>`).join("");
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="공기 속 수증기가 차가운 컵에 닿아 물방울로 응결하는 과정">
<defs>
<linearGradient id="co-bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fdf1e4"/><stop offset="1" stop-color="#e7f3fb"/></linearGradient>
<linearGradient id="co-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".6"/><stop offset="1" stop-color="#dff1fb" stop-opacity=".35"/></linearGradient>
<linearGradient id="co-liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8f2"/><stop offset="1" stop-color="#5fb4de"/></linearGradient>
<clipPath id="co-clip"><rect width="560" height="300" rx="14"/></clipPath>
<clipPath id="co-cup"><path d="M385 110H495L485 250Q485 258 477 258H403Q395 258 395 250Z"/></clipPath>
</defs>
<g clip-path="url(#co-clip)">
<rect width="560" height="300" fill="url(#co-bg)"/>
<g class="vs" data-s="1" data-e="2" fill="#86aac4" fill-opacity=".9">${vapor}</g>
<g class="vs wipe" data-s="2" style="--d:1.4s" fill="#3b82c4"><path d="M240 150H346" stroke="#3b82c4" stroke-width="2.4" stroke-dasharray="7 6" fill="none"/><path d="M342 142L355 150L342 158Z"/></g>
<path d="M385 110H495L485 250Q485 258 477 258H403Q395 258 395 250Z" fill="url(#co-glass)" stroke="#6fa8c9" stroke-width="2.2"/>
<g clip-path="url(#co-cup)"><rect x="380" y="160" width="120" height="110" fill="url(#co-liq)" opacity=".45"/>
<g class="vs pop" data-s="2" style="--dl:.4s"><rect x="410" y="170" width="28" height="28" rx="5" fill="#eaf9ff" stroke="#9dd0ea"/><rect x="448" y="186" width="26" height="26" rx="5" fill="#eaf9ff" stroke="#9dd0ea"/></g></g>
<g transform="translate(440 88)"><g class="vs pop" data-s="2" style="--dl:.3s"><g stroke="#4aa0d8" stroke-width="2.4" stroke-linecap="round"><path d="M-12 0H12M0 -12V12M-8.5 -8.5L8.5 8.5M-8.5 8.5L8.5 -8.5"/></g></g></g>
${beads}
<g class="vs" data-s="3" data-e="3" fill="#6fb4dc"><circle class="a-drip" style="animation-delay:0s" cx="402" cy="262" r="2.6"/><circle class="a-drip" style="animation-delay:-.8s" cx="488" cy="262" r="2.6"/></g>
</g></svg>`;
    return { pic: true, n: 3, color: "#3b82c4", t: 3.6, scene: svg };
  })();

  /* ───────── friction ───────── */
  const friction = (() => {
    let teeth = "M180 200";
    for (let x = 180; x < 280; x += 10) teeth += " l5 6 l5 -6";
    let saw = "";
    for (let k = -6; k <= 6; k++) saw += `${k === -6 ? "M" : "L"}${k * 10} ${k % 2 === 0 ? 9 : -9} `;
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="바닥 위 물체를 밀 때 돌기가 맞물려 마찰력이 생기는 과정">
<defs><clipPath id="fr-clip"><rect width="560" height="300" rx="14"/></clipPath><clipPath id="fr-lens"><circle cx="440" cy="78" r="44"/></clipPath></defs>
<g clip-path="url(#fr-clip)">
<rect width="560" height="300" fill="#f3f4f6"/>
<rect x="0" y="200" width="560" height="100" fill="#d6dbe3"/>
<path d="M0 200H560" stroke="#6b7280" stroke-width="2"/>
<g class="vs" data-s="3" data-e="3" fill="none" stroke="#f59e0b" stroke-width="3.4" stroke-linecap="round"><path class="a-rise" style="animation-delay:0s" d="M196 250q-7 -8 0 -16t0 -16t0 -16"/><path class="a-rise" style="animation-delay:-1.1s" d="M232 250q-7 -8 0 -16t0 -16t0 -16"/><path class="a-rise" style="animation-delay:-2.2s" d="M268 250q-7 -8 0 -16t0 -16t0 -16"/></g>
<g class="mv" data-s="2" style="--from:translateX(-40px);--d:1.8s;--ease:cubic-bezier(.3,.7,.3,1)">
<rect x="180" y="146" width="100" height="54" rx="6" fill="#c98b4a" stroke="#7a4d1e" stroke-width="2"/>
<rect x="194" y="154" width="72" height="8" rx="4" fill="#e2b27a" opacity=".7"/>
<path d="${teeth}" fill="none" stroke="#7a4d1e" stroke-width="1.6"/>
</g>
<g class="vs pop" data-s="2" style="--dl:.5s"><polygon points="404,110 452,116 284,206 262,206" fill="#7a4d1e" fill-opacity=".1" stroke="#7a4d1e" stroke-opacity=".35" stroke-dasharray="4 4"/>
<g clip-path="url(#fr-lens)"><g transform="translate(440 78)"><path d="${saw}L60 -60 L-60 -60Z" fill="#c98b4a"/><path d="${saw}L60 60 L-60 60Z" fill="#9ca3af"/><path d="${saw}" fill="none" stroke="#4b3320" stroke-width="1.8" stroke-linejoin="round"/></g></g>
<circle cx="440" cy="78" r="44" fill="none" stroke="#7a4d1e" stroke-width="3"/></g>
<g class="vs wipe" data-s="2" style="--d:1.2s" fill="#2563eb"><path d="M288 173H386" stroke="#2563eb" stroke-width="3" fill="none"/><path d="M382 165L396 173L382 181Z"/></g>
<g class="vs wipe" data-s="3" style="--d:1.2s" fill="#dc2626"><path d="M172 173H84" stroke="#dc2626" stroke-width="3" fill="none"/><path d="M88 165L74 173L88 181Z"/></g>
</g></svg>`;
    return { pic: true, n: 3, color: "#c2410c", t: 3.6, scene: svg };
  })();

  /* ───────── erosion ───────── */
  const erosion = (() => {
    const lines = (x1, x2, ys) => ys.map((y) => `<path d="M${x1} ${y}H${x2}" stroke="#6b4a2a" stroke-width="2" stroke-opacity=".45"/>`).join("");
    const rock = (x, y, s, dl) =>
      `<g class="vs" data-s="3" style="--dl:${dl}s"><g class="mv" data-s="3" style="--from:translateY(-70px);--d:.9s;--dl:${dl}s;--ease:cubic-bezier(.5,0,.9,.5)"><polygon transform="translate(${x} ${y}) scale(${s})" points="-9,2 -4,-8 7,-6 11,3 2,9" fill="#a47c4f" stroke="#6b4a2a" stroke-width="1.4"/></g></g>`;
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="파도가 절벽 아래를 깎아 절벽이 무너져 물러나는 과정">
<defs>
<linearGradient id="er-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3f8"/><stop offset="1" stop-color="#eef8fe"/></linearGradient>
<linearGradient id="er-rock" gradientUnits="userSpaceOnUse" x1="0" y1="92" x2="0" y2="300"><stop offset="0" stop-color="#cfa774"/><stop offset="1" stop-color="#8a6842"/></linearGradient>
<linearGradient id="er-sea" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6db8e6"/><stop offset="1" stop-color="#3f91cf"/></linearGradient>
<clipPath id="er-clip"><rect width="560" height="300" rx="14"/></clipPath>
</defs>
<g clip-path="url(#er-clip)">
<rect width="560" height="300" fill="url(#er-sky)"/>
<rect x="210" y="180" width="350" height="120" fill="url(#er-sea)"/>
<g class="a-slide"><path d="M190 180q15 -7 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2"/></g>
<polygon points="0,92 150,92 150,300 0,300" fill="url(#er-rock)"/>${lines(0, 150, [114, 136, 158, 180, 202, 224, 246, 268, 290])}
<rect x="0" y="86" width="150" height="8" fill="#6fae52"/>
<polygon points="150,182 210,200 210,300 150,300" fill="url(#er-rock)"/>${lines(150, 210, [218, 238, 258, 278, 294])}
<polygon points="210,166 150,182 210,200" fill="#4b3a2a"/>
<g class="vs" data-s="1" data-e="1"><polygon points="210,166 150,182 210,200" fill="url(#er-rock)"/></g>
<g class="vs" data-s="1" data-e="2"><polygon points="150,92 210,92 210,166 150,182" fill="url(#er-rock)"/>${lines(150, 210, [114, 136, 156])}<rect x="150" y="86" width="60" height="8" fill="#6fae52"/></g>
<g class="vs" data-s="1" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="10 9">
<path class="a-dash" d="M520 200H252"/><path class="a-dash" style="animation-delay:-.5s" d="M520 226H252"/><path class="a-dash" style="animation-delay:-.9s" d="M520 252H252"/></g>
<g class="vs" data-s="1" fill="#fff"><path d="M258 192L242 200L258 208Z"/><path d="M258 218L242 226L258 234Z"/><path d="M258 244L242 252L258 260Z"/></g>
<g class="vs" data-s="2" data-e="2" fill="#fff"><circle class="a-rise" style="animation-delay:0s" cx="216" cy="178" r="3.2"/><circle class="a-rise" style="animation-delay:-.7s" cx="226" cy="182" r="2.4"/><circle class="a-rise" style="animation-delay:-1.4s" cx="212" cy="184" r="2.8"/><circle class="a-rise" style="animation-delay:-2.1s" cx="232" cy="176" r="2.2"/></g>
${rock(224, 176, 1, 0)}${rock(240, 181, 0.8, 0.25)}${rock(213, 185, 0.7, 0.5)}
<g class="vs" data-s="3" data-e="3" fill="#d9cbb6"><g class="vs pop" data-s="3" data-e="3" style="--dl:.1s"><circle cx="196" cy="156" r="9"/><circle cx="182" cy="140" r="7"/><circle cx="204" cy="132" r="6"/></g></g>
<g class="vs" data-s="3" style="--dl:.6s"><polygon points="150,92 210,92 210,166 150,182" fill="none" stroke="#7a5a36" stroke-width="2" stroke-dasharray="6 5"/></g>
<g class="vs wipe" data-s="3" style="--dl:1s;--d:.9s"><path d="M202 128H168" stroke="#dc2626" stroke-width="3" fill="none"/><path d="M172 121L158 128L172 135Z" fill="#dc2626"/></g>
</g></svg>`;
    return { pic: true, n: 3, color: "#8a6842", t: 3.8, scene: svg };
  })();

  /* ───────── refraction ───────── */
  const refraction = (() => {
    const glass = "M258 80H402L388 252Q387 260 378 260H282Q273 260 272 252Z";
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="물이 담긴 컵 속 빨대가 꺾여 보이는 이유, 빛의 굴절">
<defs>
<linearGradient id="rf-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8f2"/><stop offset="1" stop-color="#5fb4de"/></linearGradient>
<clipPath id="rf-clip"><rect width="560" height="300" rx="14"/></clipPath>
<clipPath id="rf-in"><path d="${glass}"/></clipPath>
<clipPath id="rf-under"><rect x="240" y="150" width="190" height="120"/></clipPath>
</defs>
<g clip-path="url(#rf-clip)">
<rect width="560" height="300" fill="#f4f7fb"/>
<g transform="translate(26 -8) scale(1.1)">
<ellipse cx="330" cy="268" rx="96" ry="9" fill="#000" fill-opacity=".07"/>
<path d="M330 40L306 150" stroke="#ef4444" stroke-width="9" stroke-linecap="round" fill="none"/>
<path d="M330 40L306 150" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-dasharray="7 11" fill="none"/>
<g clip-path="url(#rf-under)"><g class="mv" data-s="2" style="--from:translateX(16px);--d:1.4s;--dl:1.1s"><path d="M290 150L268 250" stroke="#ef4444" stroke-width="12" stroke-linecap="butt" fill="none"/><path d="M290 150L268 250" stroke="#fff" stroke-opacity=".75" stroke-width="4" stroke-dasharray="7 11" fill="none"/></g></g>
<g clip-path="url(#rf-in)"><g class="mv" data-s="2" style="--from:translateY(120px);--d:2.2s;--ease:cubic-bezier(.3,.6,.4,1)"><rect x="240" y="150" width="190" height="130" fill="url(#rf-water)" fill-opacity=".5"/><g class="a-slide"><path d="M230 150q10 -5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2"/></g></g></g>
<path d="${glass}" fill="#dff1fb" fill-opacity=".25" stroke="#6fa8c9" stroke-width="2.4" stroke-linejoin="round"/>
<path class="vs draw" data-s="3" pathLength="1" style="--d:1.6s" d="M274 212L270 152L112 136" stroke="#f59e0b" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<g class="vs pop" data-s="3" style="--dl:1.2s"><circle cx="270" cy="152" r="5.5" fill="#fff" stroke="#f59e0b" stroke-width="2.4"/></g>
<g class="vs pop" data-s="3" style="--dl:1.5s" fill="#f59e0b"><path d="M130 128L112 136L130 144Z"/></g>
<g class="vs pop" data-s="3" style="--dl:1.7s"><ellipse cx="70" cy="136" rx="26" ry="15" fill="#fff" stroke="#374151" stroke-width="2.4"/><circle cx="76" cy="136" r="8.5" fill="#2563eb"/><circle cx="76" cy="136" r="3.6" fill="#111827"/><circle cx="79" cy="133" r="1.6" fill="#fff"/></g>
</g>
</g></svg>`;
    return { pic: true, n: 3, color: "#f59e0b", t: 3.6, scene: svg };
  })();

  /* ───────── dissolve ───────── */
  const dissolve = (() => {
    const glass = "M192 70H368L352 244Q351 252 343 252H217Q209 252 208 244Z";
    const cube = (x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${(s / 8).toFixed(1)}" fill="#fff" stroke="#c7d2de" stroke-width="1.6"/><path d="M${x + s * 0.2} ${y + s * 0.25}H${x + s * 0.6}M${x + s * 0.2} ${y + s * 0.45}H${x + s * 0.4}" stroke="#dbe4ee" stroke-width="2" stroke-linecap="round"/>`;
    const near = Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 10, rad = 26 + (i % 3) * 9;
      return `<circle class="vs pop" data-s="2" data-e="2" style="--dl:${(0.3 + i * 0.08).toFixed(2)}s" cx="${(280 + Math.cos(a) * rad).toFixed(1)}" cy="${Math.min(244, 226 + Math.sin(a) * rad * 0.75).toFixed(1)}" r="${(3 + (i % 2) * 0.8).toFixed(1)}" fill="#fff" stroke="#4a9fd0" stroke-width="1.4"/>`;
    }).join("");
    const spread = Array.from({ length: 30 }, (_, i) =>
      `<circle class="vs pop" data-s="3" style="--dl:${((i % 10) * 0.09).toFixed(2)}s" cx="${220 + ((i * 37) % 121)}" cy="${126 + ((i * 53) % 112)}" r="${(3 + (i % 3) * 0.7).toFixed(1)}" fill="#fff" stroke="#4a9fd0" stroke-width="1.4"/>`).join("");
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="각설탕이 물에 들어가 작아지다 물 전체에 퍼져 녹는 과정">
<defs>
<linearGradient id="dl-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9ddf5"/><stop offset="1" stop-color="#62b6e0"/></linearGradient>
<clipPath id="dl-clip"><rect width="560" height="300" rx="14"/></clipPath>
<clipPath id="dl-in"><path d="${glass}"/></clipPath>
</defs>
<g clip-path="url(#dl-clip)">
<rect width="560" height="300" fill="#f4f7fb"/>
<ellipse cx="280" cy="258" rx="100" ry="9" fill="#000" fill-opacity=".07"/>
<g class="vs" data-s="1" data-e="1"><g class="mv" data-s="1" style="--from:translateY(-170px);--d:1.1s;--ease:cubic-bezier(.4,0,.8,.6)">${cube(251, 192, 58)}</g></g>
<g class="vs" data-s="2" data-e="2" style="--dl:.2s">${cube(261, 212, 38)}</g>
${near}${spread}
<g clip-path="url(#dl-in)"><rect x="190" y="110" width="180" height="150" fill="url(#dl-water)" fill-opacity=".5"/><g class="a-slide"><path d="M170 110q10 -5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2"/></g></g>
<g class="vs" data-s="1" data-e="1" style="--dl:.9s"><ellipse class="a-pulse" cx="280" cy="112" rx="14" ry="4" fill="none" stroke="#fff" stroke-width="2.4"/></g>
<path d="${glass}" fill="#dff1fb" fill-opacity=".2" stroke="#6fa8c9" stroke-width="2.4" stroke-linejoin="round"/>
</g></svg>`;
    return { pic: true, n: 3, color: "#38a4d8", t: 3.6, scene: svg };
  })();

  /* ───────── inflate ───────── */
  const inflate = (() => {
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="공기를 불어넣어 풍선이 점점 부푸는 과정">
<defs>
<radialGradient id="in-ball" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#ff9db4"/><stop offset=".6" stop-color="#f43f5e"/><stop offset="1" stop-color="#be123c"/></radialGradient>
<linearGradient id="in-pump" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cbd5e1"/><stop offset="1" stop-color="#8d9bb0"/></linearGradient>
<clipPath id="in-clip"><rect width="560" height="300" rx="14"/></clipPath>
</defs>
<g clip-path="url(#in-clip)">
<rect width="560" height="300" fill="#f6f3fb"/>
<rect x="0" y="262" width="560" height="38" fill="#e7e2f3"/>
<g class="a-press"><path d="M76 160V112" stroke="#64748b" stroke-width="7" stroke-linecap="round"/><rect x="48" y="100" width="56" height="12" rx="6" fill="#475569"/></g>
<rect x="34" y="158" width="84" height="48" rx="10" fill="url(#in-pump)" stroke="#64748b" stroke-width="2"/>
<rect x="116" y="173" width="100" height="14" rx="7" fill="#64748b"/>
<path class="a-dash" d="M122 180H210" stroke="#fff" stroke-opacity=".85" stroke-width="3" stroke-dasharray="8 10" stroke-linecap="round" fill="none"/>
<g class="mv" data-s="2" style="--from:scale(.62);--d:1.6s;transform-box:fill-box;transform-origin:0% 50%"><g class="mv" data-s="3" style="--from:scale(.8);--d:1.6s;transform-box:fill-box;transform-origin:0% 50%">
<ellipse cx="332" cy="180" rx="106" ry="86" fill="url(#in-ball)"/><ellipse cx="292" cy="136" rx="28" ry="14" transform="rotate(-28 292 136)" fill="#fff" fill-opacity=".45"/></g></g>
<polygon points="228,180 212,170 212,190" fill="#be123c"/>
</g></svg>`;
    return { pic: true, n: 3, color: "#e11d48", t: 3.6, scene: svg };
  })();

  /* ───────── decay ───────── */
  const decay = (() => {
    const apple = "M280 112C262 96 214 102 206 150C198 200 236 250 262 250C272 250 276 246 280 246C284 246 288 250 298 250C324 250 362 200 354 150C346 102 298 96 280 112Z";
    const fly = (x, y, dl) => `<g transform="translate(${x} ${y})"><g class="vs pop" data-s="3" style="--dl:${dl}s"><g class="a-bob"><g class="a-flap"><ellipse cx="-4" cy="-6" rx="7" ry="3.4" fill="#fff" fill-opacity=".8" stroke="#9ca3af"/><ellipse cx="5" cy="-6" rx="7" ry="3.4" fill="#fff" fill-opacity=".8" stroke="#9ca3af"/></g><ellipse rx="7" ry="4.6" fill="#1f2937"/><circle cx="-7" cy="0" r="3" fill="#111827"/></g></g></g>`;
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="신선한 사과가 시간이 지나며 썩어 가는 과정">
<defs>
<radialGradient id="dc-red" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ef5350"/><stop offset="1" stop-color="#a51c1c"/></radialGradient>
<clipPath id="dc-clip"><rect width="560" height="300" rx="14"/></clipPath>
<clipPath id="dc-apple"><path d="${apple}"/></clipPath>
</defs>
<g clip-path="url(#dc-clip)">
<rect width="560" height="300" fill="#f8f4ee"/>
<ellipse cx="280" cy="262" rx="84" ry="10" fill="#000" fill-opacity=".09"/>
<path d="M280 112C282 96 286 86 292 76" stroke="#6b4423" stroke-width="6" stroke-linecap="round" fill="none"/>
<path d="M290 92C310 70 338 74 344 84C330 100 306 102 290 92Z" fill="#5aa84a"/>
<path d="${apple}" fill="url(#dc-red)"/>
<ellipse cx="238" cy="150" rx="12" ry="26" transform="rotate(14 238 150)" fill="#fff" fill-opacity=".28"/>
<g clip-path="url(#dc-apple)">
<g class="vs pop" data-s="2" style="--dl:.2s" fill="#6b4423"><ellipse cx="256" cy="176" rx="20" ry="17"/><ellipse cx="320" cy="204" rx="15" ry="13"/><ellipse cx="294" cy="140" rx="11" ry="10"/></g>
<g class="vs pop" data-s="3" style="--dl:0s"><ellipse cx="280" cy="198" rx="86" ry="64" fill="#5a3a22" fill-opacity=".9"/></g>
<g class="vs" data-s="3" style="--dl:.4s"><rect x="190" y="90" width="180" height="170" fill="#3b2614" fill-opacity=".35"/></g>
</g>
<g class="vs" data-s="3" style="--dl:.8s" fill="none" stroke="#2a1a0c" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"><path d="M232 140q10 20 0 40"/><path d="M328 130q-10 22 0 44"/><path d="M262 226q18 10 40 0"/></g>
<g class="vs pop" data-s="3" style="--dl:1s" fill="#bfe6a0" stroke="#7fb257" stroke-width="1.2"><circle cx="262" cy="200" r="5.5"/><circle cx="300" cy="216" r="4.5"/><circle cx="284" cy="180" r="3.6"/><circle cx="318" cy="190" r="3.2"/></g>
${fly(206, 112, 1.2)}${fly(364, 132, 1.5)}
<g transform="translate(468 70)"><g class="vs pop" data-s="2"><g class="a-flip"><path d="M-14-18H14L3 0L14 18H-14L-3 0Z" fill="#fff4e0" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/><path d="M-8-13H8L3-4H-3ZM-4 9H4L8 14H-8Z" fill="#b45309"/></g></g></g>
</g></svg>`;
    return { pic: true, n: 3, color: "#b45309", t: 3.6, scene: svg };
  })();

  /* ───────── collide ───────── */
  const collide = (() => {
    const star = Array.from({ length: 16 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 16 - Math.PI / 2, r = i % 2 ? 16 : 42;
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    }).join(" ");
    const ball = (base, fromMid, fromPost, grad) =>
      `<g class="mv" data-s="2" data-e="2" style="--from:translateX(${fromMid}px);--d:1.1s;--ease:cubic-bezier(.5,0,.9,.6)"><g class="mv" data-s="3" style="--from:translateX(${fromPost}px);--d:1.1s;--ease:cubic-bezier(.2,.7,.3,1)"><g transform="translate(${base} 162)"><ellipse cx="0" cy="37" rx="32" ry="6" fill="#000" fill-opacity=".14"/><circle r="38" fill="url(#${grad})"/><ellipse cx="-13" cy="-15" rx="13" ry="8" transform="rotate(-30 -13 -15)" fill="#fff" fill-opacity=".5"/></g></g></g>`;
    const svg = `<svg viewBox="0 0 560 300" role="img" aria-label="두 공이 서로를 향해 달려와 부딪친 뒤 튕겨 나가는 과정">
<defs>
<radialGradient id="co2-a" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fb7185"/><stop offset="1" stop-color="#be123c"/></radialGradient>
<radialGradient id="co2-b" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#1d4ed8"/></radialGradient>
<clipPath id="co2-clip"><rect width="560" height="300" rx="14"/></clipPath>
</defs>
<g clip-path="url(#co2-clip)">
<rect width="560" height="300" fill="#f4f7fb"/>
<rect x="0" y="200" width="560" height="100" fill="#e2e8f0"/><path d="M0 200H560" stroke="#94a3b8" stroke-width="2"/>
${ball(292, -122, -50, "co2-a")}${ball(268, 122, 50, "co2-b")}
<g class="vs" data-s="1" data-e="1"><g stroke-width="4" stroke-linecap="round" fill="none"><path d="M78 100H148" stroke="#e11d48"/><path d="M482 100H412" stroke="#2563eb"/></g><path d="M148 93L164 100L148 107Z" fill="#e11d48"/><path d="M412 93L396 100L412 107Z" fill="#2563eb"/></g>
<g transform="translate(280 162)"><g class="vs pop" data-s="2" data-e="2" style="--dl:.9s"><polygon points="${star}" fill="#fde047" stroke="#f59e0b" stroke-width="2.4" stroke-linejoin="round"/></g></g>
<g class="vs" data-s="2" data-e="2" style="--dl:.9s"><ellipse class="a-pulse" cx="280" cy="162" rx="38" ry="38" fill="none" stroke="#f59e0b" stroke-width="2.6"/></g>
<g class="vs" data-s="3"><g stroke-width="4" stroke-linecap="round" fill="none"><path d="M214 100H146" stroke="#e11d48"/><path d="M346 100H414" stroke="#2563eb"/></g><path d="M148 93L132 100L148 107Z" fill="#e11d48"/><path d="M412 93L428 100L412 107Z" fill="#2563eb"/></g>
</g></svg>`;
    return { pic: true, n: 3, color: "#2563eb", t: 3.2, scene: svg };
  })();

  const VIZ = (window.VIZ = { glacier, pollination, vessel, chronic, sediment, condense, friction, erosion, refraction, dissolve, inflate, decay, collide });

  /* 카드 옆 패널 HTML */
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ICON = `<svg class="ic-play" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg><svg class="ic-pause" viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg><svg class="ic-again" viewBox="0 0 24 24"><path d="M12 5a7 7 0 1 1-6.6 4.7l1.9.6A5 5 0 1 0 12 7v3L7.5 6 12 2z"/></svg>`;
  window.vizHtml = function (word) {
    const v = VIZ[word.toLowerCase()];
    if (!v) return null;
    if (v.pic) {
      return `<div class="vz pic" data-state="idle" style="--vz:${v.color};--t:${v.t}s">
<div class="vz-scene">${v.scene}</div>
<div class="vz-ctl"><button class="vz-play" type="button" aria-label="해설 재생">${ICON}</button>
<div class="vz-segs">${Array.from({ length: v.n }, (_, i) => `<button class="vz-seg" type="button" data-k="${i + 1}" aria-label="${i + 1}단계 보기"><b><i></i></b></button>`).join("")}</div></div></div>`;
    }
    const n = v.steps.length;
    return `<div class="vz" data-state="idle" style="--vz:${v.color};--t:${v.t}s">
<div class="vz-head"><span class="vz-tag">${esc(v.tag)}</span>
<div class="vz-word"><b>${esc(word)}</b><i>${esc(v.ipa)}</i><span>${esc(v.pos)}</span></div>
<div class="vz-kr">${esc(v.kr)}</div><p class="vz-lead">${esc(v.lead)}</p></div>
<div class="vz-scene">${v.scene}</div>
<div class="vz-ctl"><button class="vz-play" type="button" aria-label="해설 재생">${ICON}</button>
<div class="vz-segs">${v.steps.map((s, i) => `<button class="vz-seg" type="button" data-k="${i + 1}" aria-label="${i + 1}단계 보기: ${esc(s[0])}"><b><i></i></b></button>`).join("")}</div>
<span class="vz-time">0 / ${n}</span></div>
<ol class="vz-steps">${v.steps.map((s, i) => `<li data-k="${i + 1}"><span class="n">${i + 1}</span><div><b>${esc(s[0])}</b><span>${esc(s[1])}</span>${s[2] ? `<em>${esc(s[2])}</em>` : ""}</div></li>`).join("")}</ol>
<div class="vz-foot"><div class="vz-org"><b>${esc(v.origin[0])}</b>${esc(v.origin[1])}</div>
<div class="vz-ex"><p class="en">${esc(v.ex[0])}</p><p class="ko">${esc(v.ex[1])}</p></div>
<div class="vz-rel">${v.rel.map((r) => `<span>${esc(r[0])}<em>${esc(r[1])}</em></span>`).join("")}</div></div></div>`;
  };

  /* 재생기: 단계 막대의 채움 애니메이션이 끝나면 다음 단계로 — 일시정지하면 애니메이션째 멈춘다 */
  window.vizMount = function (root, autoplay) {
    const scene = root.querySelector(".vz-scene");
    const parts = [...scene.querySelectorAll("[data-s]")];
    const segs = [...root.querySelectorAll(".vz-seg")];
    const lis = [...root.querySelectorAll(".vz-steps li")];
    const btn = root.querySelector(".vz-play");
    const time = root.querySelector(".vz-time");
    const n = segs.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let step = 0;
    const LABEL = { idle: "해설 재생", run: "해설 일시정지", pause: "해설 이어서 재생", end: "해설 다시 보기" };
    const set = (st) => { root.dataset.state = st; btn.setAttribute("aria-label", LABEL[st]); };
    function show(k, instant) {
      if (instant) scene.classList.add("vz-reset");
      parts.forEach((el) => {
        const s = +el.dataset.s, e = el.dataset.e ? +el.dataset.e : n;
        el.classList.toggle("in", k >= s && k <= e);
      });
      if (instant) { void scene.offsetWidth; scene.classList.remove("vz-reset"); }
    }
    function go(k, instant) {
      step = k;
      show(k, instant);
      segs.forEach((s, i) => { s.classList.toggle("done", i + 1 < k); s.classList.remove("run"); });
      if (k >= 1) { const s = segs[k - 1]; void s.offsetWidth; s.classList.add("run"); }
      lis.forEach((li, i) => li.classList.toggle("on", i + 1 === k));
      if (time) time.textContent = `${k} / ${n}`;
    }
    function end() {
      set("end");
      root.dispatchEvent(new CustomEvent("vzend"));
      segs.forEach((s) => { s.classList.remove("run"); s.classList.add("done"); });
      lis.forEach((li) => li.classList.remove("on"));
    }
    function play() { set("run"); go(0, true); go(1); }
    function jump(k) {
      if (reduce) { go(k); set("pause"); return; }
      set("run"); go(k);
    }
    root.addEventListener("animationend", (e) => {
      if (root.dataset.state !== "run" || !e.target.matches(".vz-seg.run i")) return;
      if (step < n) go(step + 1); else end();
    });
    btn.addEventListener("click", () => {
      const st = root.dataset.state;
      if (reduce) { jump(step < n && st !== "end" ? step + 1 : 1); return; }
      if (st === "run") set("pause");
      else if (st === "pause") set("run");
      else play();
    });
    root.addEventListener("click", (e) => {
      const t = e.target.closest(".vz-seg, .vz-steps li");
      if (t) jump(+t.dataset.k);
    });
    if (reduce) { go(n, true); end(); }
    else if (autoplay) play();
    else { set("idle"); go(0, true); }
    return { reveal() { if (root.dataset.state === "idle") play(); } };
  };
})();
