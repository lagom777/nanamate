import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, tie } from './props.mjs';

const qmark = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const battery = (x, y, lvl = 1, col = '#22c55e') => `<g transform="translate(${x} ${y})">${R(-30, -16, 60, 32, '#fff', 6, 'stroke="#6b7384" stroke-width="4"')}${R(30, -7, 7, 14, '#6b7384', 2)}${lvl > 0 ? R(-26, -12, 52 * lvl, 24, col, 3) : ''}</g>`;
const lighthouse = (x, y) => `<g transform="translate(${x} ${y})">${P('M-26 0L-16 -120H16L26 0Z', '#f4f6fa', 'stroke="#c4cad6" stroke-width="3"')}${P('M-22 -30H22L19 -50H-19Z M-17 -76H17L15 -96H-15Z', '#ef4444')}${R(-18, -138, 36, 18, '#ffe9a0', 3, 'stroke="#c4cad6" stroke-width="3"')}${P('M-22 -138L0 -158L22 -138Z', '#ef4444')}</g>`;

export default [
  ['asymmetry', '#7c3aed', '크기와 무늬가 서로 다른 날개의 균형 잡히지 않은 비대칭', (s) => {
    s.sky('cool'); s.ground('grass', 252);
    s.step(1, L('M280 40V240', '#aab4c6', 3, 'stroke-dasharray="8 8"') + R(272, 120, 16, 80, '#4a3a2a', 8), { cls: 'up' });
    s.step(2, P('M272 150C220 80 130 90 120 150C130 210 220 200 272 170Z', '#a78bfa', 'stroke="#5b21b6" stroke-width="3"') + C(180, 146, 14, '#fff', 'fill-opacity=".6"'), { cls: 'pop' });
    s.step(3, P('M288 150C320 120 380 120 400 150C380 190 320 190 288 170Z', '#f59e0b', 'stroke="#b45309" stroke-width="3"') + C(350, 150, 8, '#fff', 'fill-opacity=".6"') + C(430, 150, 0.1, 'none'), { cls: 'pop' });
    s.step(3, arrow(180, 230, 170, 230, '#7c3aed', 3, 8) + L('M120 232H272M288 232H400', '#7c3aed', 4), { cls: 'wipe' });
  }],
  ['withstand', '#0ea5e9', '거센 파도와 비바람에도 쓰러지지 않고 버텨 내는 등대', (s) => {
    s.sky('gray'); s.ground('water', 220);
    s.step(1, R(200, 210, 160, 90, '#8a7a68', 8) + lighthouse(280, 214), { cls: 'up' });
    s.step(2, cloud(120, 56, 1.6, '#6b7384') + cloud(430, 50, 1.8, '#5b6577') + L('M60 120H150M40 150H130M480 120H540M500 150H550', '#fff', 5), { cls: 'wipe' });
    s.step(3, P('M150 220Q180 150 230 200Q200 190 190 230Z', '#9fd8ff', 'stroke="#fff" stroke-width="3"') + P('M410 220Q380 150 330 200Q360 190 370 230Z', '#9fd8ff', 'stroke="#fff" stroke-width="3"') + P('M262 80L240 140H284Z', '#ffe9a0', 'fill-opacity=".5"'), { cls: 'up' });
    s.badge('check', 500, 50);
  }],
  ['implement', '#16a34a', '설계도대로 망치질해 개집을 실제로 지어 낸다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, paper(120, 160, 120, 150, 0, '#e8f3ff') + L('M80 140H160V180H80Z M80 140L120 112L160 140', '#2563eb', 3), { cls: 'up' });
    s.step(2, `<g transform="translate(260 150) rotate(30)">${R(-4, -10, 8, 60, '#8c6238', 3)}${R(-22, -22, 44, 16, '#8a93a5', 3)}</g>` + person({ x: 330, y: 262, shirt: '#16a34a', armR: [30, -20] }), { cls: 'up', e: 2 });
    s.step(3, `<g transform="translate(400 250)">${R(-50, -50, 100, 50, '#c99a5b', 4, 'stroke="#8c6238" stroke-width="3"')}${P('M-60 -50L0 -92L60 -50Z', '#c0392b')}${R(-14, -36, 28, 36, '#3a2418', 14)}</g>` + chk(500, 56), { cls: 'up' });
  }],
  ['wander', '#64748b', '목적지 없이 구불구불한 길을 정처 없이 거닌다', (s) => {
    s.sky('day'); s.ground('grass', 240);
    s.step(1, person({ x: 90, y: 262, shirt: '#64748b', legs: 'walk', fc: 'neutral', s: 0.8 }), { cls: 'up', e: 2 });
    s.step(2, L('M110 250Q160 200 220 240T330 200T420 240T500 210', '#a8946c', 8, 'stroke-dasharray="1 14"'), { cls: 'wipe' });
    s.step(3, person({ x: 490, y: 262, shirt: '#64748b', legs: 'walk', fc: 'think', s: 0.8 }) + `<g transform="translate(400 250)">${R(-3, -80, 6, 80, '#8c6238')}${P('M3 -80H40L50 -70L40 -60H3Z M-3 -60H-40L-50 -50L-40 -40H-3Z', '#f59e0b')}</g>` + qmark(490, 120, '#64748b', 1.2), { cls: 'up' });
  }],
  ['preoccupation', '#7c3aed', '휴대폰 속에만 빠져 친구가 불러도 알아채지 못한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 170, y: 254, shirt: '#7c3aed', fc: 'think', armL: [28, -8], armR: [34, -12] }) + phone(222, 190, 1.2), { cls: 'up' });
    s.step(2, person({ x: 420, y: 254, shirt: '#14b8a6', hs: 'long', fc: 'shock', armL: [-34, -44] }) + bubble(330, 100, 70, 46, '#fff', 'r') + L('M330 84V102M330 110V112', '#ef4444', 7), { cls: 'up' });
    s.step(3, L('M250 130L270 140M240 150L262 156', '#aab4c6', 3) + `<g stroke="#7c3aed" stroke-width="4" fill="none" stroke-linecap="round"><path d="M130 130Q150 118 170 130"/></g>`, { cls: 'pop' });
  }],
  ['provoke', '#dc2626', '붉은 천을 흔들어 얌전하던 황소를 화나게 한다', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, `<g transform="translate(400 250)">${shadow(0, 6, 60)}${E(0, -34, 54, 32, '#6b4a2a')}${C(-52, -40, 22, '#6b4a2a')}${P('M-62 -58L-80 -80L-66 -52Z M-44 -58L-30 -80L-38 -52Z', '#f4f1e6')}${C(-58, -44, 3, '#fff')}${R(-34, -8, 10, 22, '#4a3320', 3)}${R(24, -8, 10, 22, '#4a3320', 3)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 130, y: 260, shirt: '#dc2626', fc: 'smirk', armR: [34, -26] }) + P('M170 140L230 130L214 190Z', '#ef4444'), { cls: 'up' });
    s.step(3, L('M370 160L354 140M350 190L330 186M392 150L396 128', '#dc2626', 4) + `<g class="a-bob" style="animation-duration:.4s"><g fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"><path d="M352 190Q340 180 346 168"/></g></g>` + L('M300 270H340M280 258H330', '#a8742a', 5), { cls: 'pop' });
  }],
  ['stool', '#a16207', '등받이도 팔걸이도 없는 둥근 의자에 걸터앉는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(240 252)">${E(0, -90, 44, 12, '#c99a5b', 'stroke="#8c6238" stroke-width="3"')}${R(-44, -90, 88, 10, '#b98650', 3)}${L('M-30 -80L-44 0M30 -80L44 0M0 -80V0', '#8c6238', 8)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 240, y: 164, shirt: '#a16207', legs: 'hide', armL: [-4, 28], armR: [4, 28], sh: false, fc: 'smile' }) + R(224, 130, 32, 36, '#334155', 8), { cls: 'up' });
    s.step(3, `<g transform="translate(400 252)">${R(-8, -110, 16, 110, '#8c6238', 3)}${R(-60, -110, 120, 12, '#8c6238', 3)}</g>`, { cls: 'up' });
    s.step(3, chkMark(), { cls: 'pop' });
  }],
  ['fad', '#ec4899', '유행 모자를 모두가 쓰다가 곧 시들해져 버려진다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    const hat = '<path d="M-14 -94L0 -134L14 -94Z" fill="#ec4899"/><circle cx="0" cy="-136" r="5" fill="#facc15"/>';
    s.step(1, person({ x: 280, y: 254, shirt: '#3b82f6', hat }), { cls: 'up' });
    s.step(2, person({ x: 120, y: 254, shirt: '#22c55e', hat, hs: 'long' }) + person({ x: 200, y: 254, shirt: '#f59e0b', hat }) + person({ x: 360, y: 254, shirt: '#8b5cf6', hat, hs: 'long' }) + person({ x: 440, y: 254, shirt: '#14b8a6', hat }), { cls: 'up', e: 2 });
    s.step(3, `<g>${[[120, 236], [200, 240], [280, 238], [360, 240], [440, 236]].map(([x, y]) => P(`M${x - 14} ${y}L${x} ${y - 40}L${x + 14} ${y}Z`, '#ec4899', `transform="rotate(${x % 3 ? 70 : -60} ${x} ${y})"`)).join('')}</g>` + arrow(480, 80, 480, 130, '#dc2626', 6, 14), { cls: 'up' });
    s.badge('down', 60, 56);
  }],
  ['gross', '#ca8a04', '여러 곳의 수입을 모두 합친 총액이 한 더미로 쌓인다', (s) => {
    s.sky('sun'); s.ground('floor', 252);
    s.step(1, coinStack(110, 252, 3) + coinStack(280, 252, 4) + coinStack(450, 252, 2), { cls: 'up', e: 2 });
    s.step(2, arrow(130, 230, 220, 230, '#ca8a04', 5) + arrow(430, 230, 340, 230, '#ca8a04', 5), { cls: 'wipe', e: 2 });
    s.step(3, coinStack(280, 252, 9) + coinStack(224, 252, 6) + coinStack(336, 252, 6) + crown(280, 90, 1.2) + sparks(280, 140, 90, 108, '#ffd34d', 10, 4), { cls: 'up' });
  }],
  ['tariff', '#475569', '국경 관문에서 수입품에 관세라는 돈을 매겨 거둔다', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, `<g transform="translate(280 246)">${R(-90, -110, 12, 110, '#6b7384')}${R(78, -110, 12, 110, '#6b7384')}${R(-96, -122, 192, 14, '#ef4444', 3)}</g>` + flag(130, 120, '#16a34a', 60) + flag(430, 120, '#2563eb', 60), { cls: 'up' });
    s.mv(2, 'translateX(-180px)', `<g transform="translate(300 250)">${R(-50, -34, 100, 34, '#3b82f6', 4)}${R(30, -48, 36, 48, '#2563eb', 4)}${crate(-20, -34, 36, 26)}${C(-30, 6, 11, '#1f2937')}${C(40, 6, 11, '#1f2937')}</g>`, { d: 1 });
    s.step(3, person({ x: 160, y: 250, shirt: '#475569', hat: hatCap('#475569'), armR: [30, -10] }) + coin(228, 196, 14) + arrow(280, 90, 280, 50, '#475569', 6, 14), { cls: 'up' });
  }],
  ['surplus', '#16a34a', '창고가 가득 차고도 남아 넘치는 곡식 더미', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, `<g transform="translate(180 246)">${R(-80, -110, 160, 110, '#c99a5b', 4, 'stroke="#8c6238" stroke-width="3"')}${P('M-94 -110L0 -156L94 -110Z', '#a8774a')}${R(-24, -60, 48, 60, '#6b4a2a', 3)}</g>`, { cls: 'up' });
    s.step(2, sack(130, 250, 1) + sack(180, 250, 1) + sack(230, 250, 1), { cls: 'pop' });
    s.step(3, `<g transform="translate(420 252)">${P('M-80 0Q-60 -70 0 -76Q60 -70 80 0Z', '#e8b830')}${sack(-30, 4, 0.8)}${sack(30, 4, 0.8)}</g>` + arrow(420, 100, 420, 60, '#16a34a', 6, 14), { cls: 'up' });
  }],
  ['integration', '#2563eb', '서로 다른 사람들이 하나로 모여 손을 잡고 어우러진다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, [90, 190, 390, 470].map((x, i) => person({ x, y: 262, shirt: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'][i], skin: ['#ffd7b5', '#e0ac69', '#8d5524', '#f1c27d'][i], fc: 'neutral' })).join(''), { cls: 'up', e: 2 });
    s.step(2, arrow(130, 150, 220, 150, '#2563eb') + arrow(430, 150, 340, 150, '#2563eb'), { cls: 'wipe', e: 2 });
    s.step(3, [[220, 262, '#ef4444', '#ffd7b5', 12], [270, 262, '#f59e0b', '#e0ac69', 4], [320, 262, '#22c55e', '#8d5524', -4], [370, 262, '#3b82f6', '#f1c27d', -12]].map(([x, y, c, sk, r]) => person({ x, y, shirt: c, skin: sk, fc: 'cheer', armL: [-24, -6], armR: [24, -6], s: 0.85 })).join('') + heart(295, 110, 1, '#ef4444'), { });
  }],
  ['hypothesis', '#0d9488', '빛이 있는 쪽이 더 잘 자랄 것이라는 가설을 세워 확인한다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(150 252)">${R(-40, -30, 80, 30, '#b98650', 4)}${L('M0 -30V-60', '#3f8f3a', 5)}${P('M0 -50C-12 -60 -22 -52 -14 -44Z M0 -50C12 -60 22 -52 14 -44Z', '#5fb85a')}</g>` + `<g transform="translate(410 252)">${R(-40, -30, 80, 30, '#b98650', 4)}${L('M0 -30V-60', '#3f8f3a', 5)}${P('M0 -50C-12 -60 -22 -52 -14 -44Z M0 -50C12 -60 22 -52 14 -44Z', '#5fb85a')}</g>` + sun(150, 70, 22, '#ffd34d') + R(360, 40, 100, 60, '#475569', 6, 'fill-opacity=".7"') + qmark(280, 120, '#6366f1', 1.4), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(150 252)">${R(-40, -30, 80, 30, '#b98650', 4)}${L('M0 -30V-90', '#3f8f3a', 6)}${P('M0 -70C-18 -84 -32 -72 -22 -60Z M0 -70C18 -84 32 -72 22 -60Z', '#5fb85a')}</g>` + `<g transform="translate(410 252)">${R(-40, -30, 80, 30, '#b98650', 4)}${L('M0 -30V-50', '#9aa94a', 4)}${P('M0 -44C-8 -50 -14 -46 -10 -40Z', '#9aa94a')}</g>` + sun(150, 70, 22, '#ffd34d') + R(360, 40, 100, 60, '#475569', 6, 'fill-opacity=".7"'), { e: 2 });
    s.step(3, `<g transform="translate(150 252)">${R(-40, -30, 80, 30, '#b98650', 4)}${L('M0 -30V-130', '#3f8f3a', 7)}${P('M0 -100C-24 -118 -42 -104 -28 -88Z M0 -100C24 -118 42 -104 28 -88Z', '#5fb85a')}${C(0, -138, 12, '#f472b6')}</g>` + `<g transform="translate(410 252)">${R(-40, -30, 80, 30, '#b98650', 4)}${L('M0 -30V-48', '#9aa94a', 4)}</g>` + sun(150, 70, 22, '#ffd34d') + R(360, 40, 100, 60, '#475569', 6, 'fill-opacity=".7"') + chk(500, 60), { cls: '' });
  }],
  ['affirm', '#16a34a', '고개를 끄덕이며 맞다고 분명하게 확인해 준다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, bubble(160, 100, 100, 62, '#fff', 'l') + qmark(160, 100, '#6366f1', 1.3) + person({ x: 120, y: 254, shirt: '#6366f1', fc: 'think' }), { cls: 'up' });
    s.step(2, person({ x: 400, y: 254, shirt: '#16a34a', fc: 'cheer', armL: [-20, -50] }), { cls: 'up' });
    s.step(3, C(300, 110, 46, '#22c55e', 'stroke="#fff" stroke-width="5"') + L('M280 110L294 126L324 90', '#fff', 10) + sparks(300, 110, 56, 72, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['fatigue', '#6b7280', '달리다 지쳐 땀범벅이 되어 배터리가 바닥난 듯 주저앉는다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 120, y: 260, shirt: '#16a34a', legs: 'walk', fc: 'cheer', rot: -6 }) + battery(450, 80, 1), { cls: 'up', e: 1 });
    s.step(2, person({ x: 220, y: 260, shirt: '#16a34a', legs: 'walk', fc: 'sad', rot: 6 }) + drop(240, 150, 0.8) + battery(450, 80, 0.4, '#f59e0b'), { e: 2 });
    s.step(3, R(250, 226, 130, 14, '#8c6238', 4) + R(260, 240, 10, 22, '#6b4a2a') + R(360, 240, 10, 22, '#6b4a2a') + person({ x: 310, y: 226, shirt: '#16a34a', legs: 'hide', fc: 'sleep', rot: 10, armL: [-10, 28], armR: [10, 28], sh: false }) + battery(450, 80, 0.06, '#ef4444') + drop(290, 150, 0.8), { cls: 'up' });
  }],
  ['bias', '#7c3aed', '색안경 때문에 똑같은 사람인데도 한쪽만 좋게 보는 편견', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#7c3aed', fc: 'smirk', hat: '<g fill="#ef4444" fill-opacity=".55" stroke="#2a2e3a" stroke-width="2.4"><circle cx="-7" cy="-83" r="6"/><circle cx="7" cy="-83" r="6"/></g>' }), { cls: 'up' });
    s.step(2, person({ x: 330, y: 254, shirt: '#94a3b8', fc: 'neutral' }) + person({ x: 450, y: 254, shirt: '#94a3b8', hs: 'long', fc: 'neutral' }), { cls: 'up' });
    s.step(3, E(330, 120, 18, 5, 'none', 'stroke="#facc15" stroke-width="5"') + P('M440 124L432 108L444 112L452 104L456 122Z', '#ef4444') + L('M200 140Q260 100 320 130', '#7c3aed', 3, 'stroke-dasharray="5 7"') + L('M200 150Q320 190 440 150', '#7c3aed', 3, 'stroke-dasharray="5 7"'), { cls: 'pop' });
  }],
  ['tread', '#78350f', '진흙을 한 걸음씩 밟고 지나가 발자국을 남긴다', (s) => {
    s.sky('gray'); s.ground('soil', 190);
    s.step(1, R(0, 190, 560, 110, '#6b4a2a') + E(280, 200, 240, 18, '#5a3a1a'), { cls: 'up' });
    s.step(2, `<g transform="translate(180 130)">${R(-14, -70, 28, 70, '#334155', 6)}${P('M-20 0H24Q34 0 34 12V22H-22Z', '#78350f', 'stroke="#451a03" stroke-width="3"')}</g>` + L('M170 160V176M190 160V176', '#a8742a', 3), { cls: 'up', e: 2 });
    s.step(3, [[130, 224], [210, 214], [290, 226], [370, 216], [450, 226]].map(([x, y], i) => P(`M${x - 12} ${y}Q${x - 14} ${y - 18} ${x} ${y - 20}Q${x + 14} ${y - 18} ${x + 12} ${y}Q${x} ${y + 6} ${x - 12} ${y}Z`, '#3d2610', `transform="rotate(${i % 2 ? 8 : -8} ${x} ${y})"`)).join(''), { cls: 'pop' });
  }],
  ['prophecy', '#7c3aed', '수정 구슬에 비친 미래의 별똥별이 예언대로 떨어진다', (s) => {
    s.sky('night'); s.ground('stone', 250);
    s.step(1, person({ x: 150, y: 254, shirt: '#6d28d9', pants: '#6d28d9', hs: 'bald', armL: [26, -10], armR: [-6, -16] }) + `<g transform="translate(220 200)">${C(0, 0, 26, '#c4b5fd', 'fill-opacity=".7" stroke="#7c3aed" stroke-width="3"')}${R(-16, 22, 32, 10, '#6b4a2a', 3)}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(220 200)"><circle r="20" fill="#312e81"/>${star(0, 0, 8, '#ffd34d')}</g>` + sparks(220, 200, 34, 46, '#c4b5fd', 8, 3), { cls: 'pop' });
    s.step(3, L('M470 20L370 150', '#ffd34d', 6) + C(366, 156, 14, '#ffb347') + sparks(366, 156, 24, 38, '#ffd34d', 8, 3) + R(360, 200, 100, 50, '#334155', 4), { cls: 'wipe' });
  }],
  ['correspond', '#0ea5e9', '편지를 주고받으며 서로 소식을 전하고 맞춰 본다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 110, y: 254, shirt: '#0ea5e9', armR: [34, 10] }) + R(150, 206, 60, 6, '#8c6238') + paper(180, 196, 40, 30, 3), { cls: 'up' });
    s.mv(2, 'translateX(-130px)', `<g transform="translate(300 150)">${R(-22, -14, 44, 28, '#fff', 3, 'stroke="#aab4c6" stroke-width="2.4"')}${L('M-22 -14L0 4L22 -14', '#aab4c6', 2.4)}</g>`, { d: 1 });
    s.step(3, person({ x: 460, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armL: [-30, -10] }) + heart(460, 130, 0.7, '#ef4444'), { cls: 'up' });
  }],
  ['mutation', '#9333ea', '평범하던 세포가 돌연 색과 모양이 바뀐 변이를 일으킨다', (s) => {
    s.sky('mint'); s.ground('tile', 252);
    s.step(1, [[110, 150], [200, 190], [320, 140], [420, 190]].map(([x, y]) => C(x, y, 28, '#60a5fa', 'stroke="#2563eb" stroke-width="3"') + C(x, y, 8, '#1d4ed8')).join(''), { cls: 'pop', e: 2 });
    s.step(2, `<g transform="translate(260 150)">${L('M-60 -50Q-20 -10 -60 50M0 -50Q-40 -10 0 50', '#7c3aed', 4)}${L('M-50 -30H-10M-52 0H-8M-50 30H-10', '#a78bfa', 3)}${L('M20 -50Q60 -10 20 50M80 -50Q40 -10 80 50', '#7c3aed', 4)}</g>` + P('M300 130L330 150L300 170Z', '#ef4444'), { cls: 'pop', e: 2 });
    s.step(3, [[110, 150], [200, 190], [420, 190]].map(([x, y]) => C(x, y, 28, '#60a5fa', 'stroke="#2563eb" stroke-width="3"') + C(x, y, 8, '#1d4ed8')).join('') + `<g transform="translate(320 150)">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * 6.283; return L(`M${Math.cos(a) * 28} ${Math.sin(a) * 28}L${Math.cos(a) * 42} ${Math.sin(a) * 42}`, '#ec4899', 5); }).join('')}${C(0, 0, 30, '#f472b6', 'stroke="#be185d" stroke-width="3"')}${C(-8, -4, 7, '#fff')}${C(10, -4, 7, '#fff')}${C(-8, -4, 3, '#2a1a12')}${C(10, -4, 3, '#2a1a12')}${C(1, 10, 5, '#fff')}</g>`, { cls: 'pop' });
  }],
  ['obscure', '#64748b', '덩굴에 가려 눈에 잘 띄지 않고 흐릿한 숨은 문', (s) => {
    s.sky('green'); s.ground('grass', 250);
    s.step(1, R(60, 80, 440, 170, '#8a8f99', 8, 'stroke="#5b606b" stroke-width="3"') + door(280, 250, 70, 120, '#7a461f'), { cls: 'up' });
    s.step(2, L('M240 80Q250 140 235 200M270 80Q285 150 270 230M300 80Q310 130 330 190M330 80Q350 140 340 220', '#3f8f3a', 7) + [[238, 140], [270, 170], [320, 130], [340, 190], [250, 200]].map(([x, y]) => P(`M${x} ${y}C${x - 12} ${y - 14} ${x - 24} ${y - 4} ${x - 14} ${y + 6}Z`, '#5fb85a')).join(''), { cls: 'wipe-d' });
    s.step(3, person({ x: 440, y: 262, shirt: '#64748b', fc: 'think', armR: [20, -30] }) + qmark(440, 110, '#64748b', 1.3), { cls: 'up' });
  }],
  ['tyrant', '#7f1d1d', '왕관 쓴 폭군이 채찍을 휘두르자 백성이 두려워 엎드린다', (s) => {
    s.sky('dark'); s.ground('dark', 250);
    s.step(1, person({ x: 400, y: 254, shirt: '#7f1d1d', fc: 'angry', s: 1.35, armL: [-40, -30], hat: crown(0, -98, 0.75) }), { cls: 'up' });
    s.step(2, [110, 190, 270].map((x) => person({ x, y: 262, shirt: '#6b7280', fc: 'sad', s: 0.8, rot: 18, armL: [-6, 24], armR: [6, 24] })).join(''), { cls: 'up' });
    s.step(3, L('M330 130Q250 70 190 130', '#a8742a', 5) + L('M190 130L170 120', '#a8742a', 4) + `<path d="M200 40L184 78H206L192 118L226 68H206Z" fill="#ffd34d"/>`, { cls: 'wipe' });
  }],
  ['intriguing', '#8b5cf6', '열쇠 구멍에서 새어 나오는 빛이 궁금증을 불러일으킨다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, door(300, 252, 110, 190, '#5a3a1a') + C(300, 150, 7, '#ffe9a0') + `<path d="M300 156L300 252" stroke="#ffe9a0" stroke-width="3"/>`, { cls: 'up' });
    s.step(2, person({ x: 160, y: 254, shirt: '#8b5cf6', fc: 'think', rot: -8, armR: [20, -26] }) + qmark(170, 100, '#8b5cf6', 1.3), { cls: 'up' });
    s.step(3, `<g class="a-pulse">${sparks(300, 150, 20, 36, '#ffd34d', 8, 4)}</g>` + `<path d="M300 150L420 120V200Z" fill="#ffe9a0" fill-opacity=".25"/>`, { cls: 'pop' });
  }],
  ['restrain', '#dc2626', '주먹을 치켜든 사람을 곁에서 붙잡아 억누르고 말린다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 230, y: 254, shirt: '#dc2626', fc: 'angry', armR: [24, -60], armL: [-14, 24] }), { cls: 'up' });
    s.step(2, person({ x: 360, y: 254, shirt: '#16a34a', fc: 'neutral', armL: [-76, -58] }), { cls: 'up' });
    s.step(3, person({ x: 230, y: 254, shirt: '#dc2626', fc: 'sad', armR: [24, -60], armL: [-14, 24], skin: '#ffd7b5' }) + R(256, 190, 60, 16, '#ffd7b5', 8, 'stroke="#e8b48c" stroke-width="2"') + L('M170 150L156 140M290 120L304 108', '#aab4c6', 3) + chk(470, 60), { });
  }],
  ['aid', '#dc2626', '넘어진 사람을 일으켜 세워 주고 구급상자로 돕는다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 260, y: 256, shirt: '#6b7280', fc: 'sad', rot: 80, rotO: '0 0', legs: 'hide', armL: [-20, 10], armR: [20, 10], sh: false }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 410, y: 262, shirt: '#16a34a', fc: 'smile', armL: [-70, 6] }), { cls: 'up' });
    s.step(3, person({ x: 260, y: 262, shirt: '#6b7280', fc: 'cheer' }) + R(350, 220, 40, 30, '#fff', 4, 'stroke="#dc2626" stroke-width="3"') + L('M370 228V242M363 235H377', '#dc2626', 5) + heart(300, 120, 0.8, '#ef4444'), { });
  }],
  ['spontaneous', '#f59e0b', '계획에 없이 갑자기 길에서 신나게 춤추기 시작한다', (s) => {
    s.sky('sun'); s.ground('stone', 250);
    s.step(1, person({ x: 140, y: 254, shirt: '#3b82f6', legs: 'walk' }) + person({ x: 420, y: 254, shirt: '#14b8a6', hs: 'long', legs: 'walk' }), { cls: 'up' });
    s.step(2, person({ x: 280, y: 254, shirt: '#f59e0b', fc: 'cheer', armL: [-30, -50], armR: [30, -30], rot: -8 }) + `<g class="a-rise">${note(240, 140)}</g><g class="a-rise" style="animation-delay:-1s">${note(330, 130, '#ec4899')}</g>`, { cls: 'up' });
    s.step(3, person({ x: 140, y: 254, shirt: '#3b82f6', fc: 'cheer', armL: [-30, -50], armR: [30, -30], rot: 8 }) + person({ x: 420, y: 254, shirt: '#14b8a6', hs: 'long', fc: 'cheer', armR: [30, -50], armL: [-30, -30], rot: -8 }) + `<g>${C(80, 80, 5, '#ef4444')}${C(480, 90, 5, '#3b82f6')}${C(220, 60, 5, '#facc15')}${C(360, 50, 5, '#ec4899')}</g>`, { });
  }],
  ['nasty', '#7f1d1d', '남이 쌓은 모래성을 심술궂게 걷어차 울리는 못된 행동', (s) => {
    s.sky('sun'); s.ground('sand', 244);
    s.step(1, person({ x: 130, y: 262, shirt: '#3b82f6', fc: 'cheer', s: 0.8 }) + P('M270 252L300 190H340L370 252Z', '#e5c47a', 'stroke="#c9a04a" stroke-width="3"') + R(296, 170, 12, 20, '#e5c47a') + R(330, 170, 12, 20, '#e5c47a') + P('M324 140L334 118L344 140Z', '#ef4444'), { cls: 'up' });
    s.step(2, person({ x: 470, y: 262, shirt: '#7f1d1d', fc: 'smirk', legs: 'walk', hat: horns2 }), { cls: 'up' });
    s.step(3, P('M270 252Q300 240 330 252Z', '#e5c47a') + C(330, 232, 8, '#e5c47a') + C(360, 222, 6, '#e5c47a') + C(310, 216, 6, '#e5c47a'), { cls: 'pop' });
    s.step(3, person({ x: 130, y: 262, shirt: '#3b82f6', fc: 'cry', s: 0.8 }), {});
  }],
  ['deed', '#16a34a', '길을 건너기 힘든 할머니를 부축해 돕는 선한 행동', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, L('M0 262H560', '#fff', 5, 'stroke-dasharray="30 18"') + person({ x: 150, y: 260, shirt: '#94a3b8', hair: '#e5e7eb', fc: 'neutral', rot: 6, armR: [20, 24] }) + L('M176 214L184 262', '#8c6238', 5), { cls: 'up' });
    s.step(2, person({ x: 270, y: 260, shirt: '#16a34a', fc: 'smile', armL: [-60, 4] }), { cls: 'up' });
    s.mv(3, 'translateX(-90px)', person({ x: 440, y: 260, shirt: '#94a3b8', hair: '#e5e7eb', fc: 'cheer', armR: [20, 24] }), { d: 1 });
    s.step(3, heart(400, 110, 1, '#ef4444') + sparks(400, 110, 28, 42, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['adverse', '#475569', '거센 맞바람과 폭우가 앞길을 막아 나아가기 힘든 불리한 상황', (s) => {
    s.sky('gray'); s.ground('grass', 244);
    s.step(1, person({ x: 420, y: 258, shirt: '#475569', legs: 'walk', fc: 'sad', rot: -14, armL: [10, -6], armR: [20, 10] }), { cls: 'up' });
    s.step(2, L('M60 110H300M40 150H260M70 190H280', '#fff', 6) + cloud(160, 56, 1.8, '#4a5568') + cloud(440, 50, 1.6, '#5b6577'), { cls: 'wipe' });
    s.step(3, `<g fill="#8fb4d8">${[110, 200, 300, 380].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.7}s" d="M${x} 20c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>` + arrow(520, 200, 480, 200, '#475569', 4, 10) + P('M360 120Q380 100 390 90L380 110Z', '#facc15'), { cls: 'pop' });
  }],
  ['censorship', '#111827', '글에 검은 줄을 쳐 가리고 입에 테이프를 붙여 말을 막는 검열', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, paper(170, 150, 150, 190, 6) + L('M120 190H220', '#aab4c6', 3), { cls: 'up' });
    s.step(2, R(124, 100, 92, 14, '#111827', 2) + R(124, 128, 70, 14, '#111827', 2) + R(124, 156, 92, 14, '#111827', 2) + R(124, 184, 60, 14, '#111827', 2), { cls: 'wipe' });
    s.step(3, person({ x: 410, y: 254, shirt: '#475569', fc: 'sad' }) + R(396, 176, 28, 8, '#9ca3af', 2), { cls: 'up' });
    s.badge('x', 500, 50);
  }],
  ['verbal', '#0ea5e9', '입으로 소리 내어 말한 말이 말풍선과 음파로 전해지는 구두의', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#0ea5e9', fc: 'cheer', armR: [24, -22] }), { cls: 'up' });
    s.step(2, L('M180 160Q196 172 180 184M196 148Q222 172 196 196M212 136Q250 172 212 208', '#0ea5e9', 5) + bubble(310, 110, 120, 60, '#fff', 'l') + L('M270 100H350M270 118H330', '#aab4c6', 4), { cls: 'wipe' });
    s.step(3, person({ x: 450, y: 254, shirt: '#ec4899', hs: 'long', fc: 'smile', armL: [-6, 28] }) + L('M418 150L404 160M488 150L500 160', '#ec4899', 3), { cls: 'up' });
    s.badge('check', 500, 50);
  }],
];

const horns2 = '<path d="M-14 -94L-18 -108L-8 -98ZM14 -94L18 -108L8 -98Z" fill="#7f1d1d"/>';
function chkMark() { return chk(500, 56); }
