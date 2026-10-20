import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const trophy = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M-22 -52H22V-24Q22 -4 0 -4Q-22 -4 -22 -24Z', '#ffd34d', 'stroke="#d99a00" stroke-width="3"')}${R(-5, -4, 10, 14, '#d99a00')}${R(-18, 10, 36, 8, '#b45309', 2)}${L('M-22 -44Q-38 -44 -34 -28Q-32 -20 -22 -22M22 -44Q38 -44 34 -28Q32 -20 22 -22', '#d99a00', 3)}</g>`;
const well = (x, y) => `<g transform="translate(${x} ${y})">${R(-44, -50, 88, 50, '#a8aebd', 6, 'stroke="#6b7384" stroke-width="3"')}${E(0, -50, 44, 10, '#475569')}${R(-44, -110, 6, 60, '#8c5a2a')}${R(38, -110, 6, 60, '#8c5a2a')}${P('M-54 -110L0 -140L54 -110Z', '#a0522d')}</g>`;
const iceberg = (x, y) => `<g transform="translate(${x} ${y})">${P('M-60 0L-34 -60L-10 -40L18 -86L50 -36L70 0Z', '#eaf6ff', 'stroke="#b7d4ea" stroke-width="3"')}</g>`;

export default [
  ['downplay', '#6b7280', '큰 트로피를 손으로 눌러 작아 보이게 대수롭지 않은 듯 축소한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, trophy(380, 250, 2.6), { cls: 'up', e: 2 });
    s.step(2, person({ x: 160, y: 254, shirt: '#6b7280', fc: 'smile', armR: [60, -60] }) + arrow(380, 60, 380, 110, '#6b7280', 5, 12), { cls: 'up', e: 2 });
    s.step(3, person({ x: 160, y: 254, shirt: '#6b7280', fc: 'smile', armL: [-10, 6], armR: [24, 4] }) + trophy(380, 250, 0.9) + L('M120 120Q140 110 160 120', '#6b7280', 3), { });
  }],
  ['equanimity', '#0ea5e9', '바람에도 쌓은 돌탑이 흔들리지 않고 마음이 평온한 평정심', (s) => {
    s.sky('day'); s.ground('water', 200);
    s.step(1, `<g transform="translate(200 210)">${E(0, 0, 60, 14, '#8a93a5')}${E(0, -22, 44, 12, '#a8aebd')}${E(0, -42, 30, 10, '#8a93a5')}${E(0, -58, 18, 8, '#a8aebd')}</g>`, { cls: 'up' });
    s.step(2, L('M40 90H150M20 120H130M30 150H140', '#fff', 5, 'stroke-opacity=".9"') + cloud(120, 60, 1.4), { cls: 'wipe' });
    s.step(3, person({ x: 400, y: 214, shirt: '#0ea5e9', fc: 'smile', legs: 'hide', armL: [-26, 14], armR: [26, 14], sh: false }) + E(400, 216, 40, 6, '#0369a1') + chk(500, 50), { cls: 'up' });
  }],
  ['formidable', '#7f1d1d', '거대한 상대 앞에서 압도당해 떨게 되는 만만찮은 존재', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, person({ x: 130, y: 262, shirt: '#3b82f6', s: 0.7, fc: 'neutral' }), { cls: 'up' });
    s.step(2, person({ x: 400, y: 254, shirt: '#7f1d1d', pants: '#1f2937', s: 2, fc: 'angry', armL: [-26, -10], armR: [26, -10] }), { cls: 'up' });
    s.step(3, person({ x: 130, y: 262, shirt: '#3b82f6', s: 0.7, fc: 'shock', armL: [-14, -20], armR: [14, -20] }) + drop(116, 190, 0.7) + drop(150, 194, 0.7) + L('M92 200L82 196M170 200L180 196', '#3b82f6', 3), { });
  }],
  ['humility', '#0d9488', '우승하고도 허리를 숙여 공을 동료에게 돌리는 겸손', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 200, y: 254, shirt: '#0d9488', fc: 'cheer', armR: [30, -40] }) + trophy(250, 170, 1), { cls: 'up', e: 1 });
    s.step(2, person({ x: 200, y: 254, shirt: '#0d9488', fc: 'smile', rot: 16, armL: [10, 24], armR: [-10, 24] }) + trophy(262, 190, 0.9), { e: 2 });
    s.step(3, person({ x: 200, y: 254, shirt: '#0d9488', fc: 'smile', rot: 16, armL: [10, 24], armR: [-10, 24] }) + person({ x: 380, y: 254, shirt: '#f59e0b', fc: 'cheer', armL: [-20, -40] }) + person({ x: 470, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armL: [-20, -40] }) + arrow(250, 130, 340, 130, '#0d9488', 4, 10) + L('M180 66Q200 56 220 66', '#facc15', 4), { });
  }],
  ['multitude', '#2563eb', '광장을 가득 메운 셀 수 없이 많은 군중', (s) => {
    s.sky('day'); s.ground('stone', 150);
    const row = (y, n, k) => [...Array(n)].map((_, i) => `<g transform="translate(${30 + i * (500 / (n - 1))} ${y})">${C(0, -10 * k, 8 * k, ['#ffd7b5', '#f0c6a4', '#e0ac69'][i % 3])}${R(-9 * k, -2 * k, 18 * k, 22 * k, ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'][i % 5], 6 * k)}</g>`).join('');
    s.step(1, row(240, 6, 1.6), { cls: 'up' });
    s.step(2, row(200, 9, 1.3) + row(168, 11, 1.1), { cls: 'up' });
    s.step(3, row(140, 12, 1) + row(112, 14, 0.9) + row(276, 10, 2) + arrow(280, 40, 280, 70, '#2563eb', 4, 10), { cls: 'up' });
  }],
  ['liability', '#991b1b', '차로 남의 담장을 부숴 법적 책임 서류를 받고, 무거운 배상 짐을 짊어진다', (s) => {
    s.sky('day'); s.ground('grass', 236);
    const fence = (broken) => R(380, 196, 160, 8, '#d6b98c', 3) + [392, 416, 440, 464, 488, 512].map((x, i) => R(x, 176, 14, 64, '#e7d3b0', 4, broken && i === 0 ? 'transform="rotate(-28 399 240)"' : '')).join('');
    s.step(1, fence(false), { cls: 'up', e: 1 });
    s.step(2, fence(true) + sparks(392, 200, 18, 32, '#ef4444', 8, 4), {});
    s.mv(1, 'translateX(-240px)', car(330, 230, '#3b82f6'), { d: 0.9 });
    s.step(2, person({ x: 200, y: 244, shirt: '#991b1b', fc: 'shock', armL: [-20, -30], armR: [20, -30] }), { cls: 'up', e: 2 });
    s.step(2, R(420, 34, 96, 116, '#fff', 6, 'stroke="#cbd5e1" stroke-width="3"') + L('M436 56H500M436 72H500M436 88H480', '#94a3b8', 3) + T(468, 140, scales(0, 0, 0), 'scale(0.32)') + C(496, 128, 13, 'none', 'stroke="#dc2626" stroke-width="3.5"'), { cls: 'pop' });
    s.step(3, person({ x: 200, y: 244, shirt: '#991b1b', fc: 'sad', rot: 16, armL: [-24, -36], armR: [-14, -40] }) + sack(182, 168, 1.35, '#a16207') + C(182, 130, 11, '#ffd34d', 'stroke="#d99a00" stroke-width="2"') + arrow(160, 30, 160, 70, '#991b1b', 4, 10) + arrow(204, 30, 204, 70, '#991b1b', 4, 10) + drop(234, 150, 0.7) + cross(500, 56, 18), {});
  }],
  ['pester', '#f59e0b', '일하는 어른의 소매를 계속 잡아당기며 조르는 아이', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 360, y: 254, shirt: '#475569', fc: 'neutral', armL: [-30, -10] }) + R(300, 190, 120, 10, '#8c5a2a', 3) + paper(340, 180, 40, 28, 2), { cls: 'up' });
    s.step(2, person({ x: 220, y: 254, shirt: '#f59e0b', s: 0.7, fc: 'cry', armR: [60, -30] }), { cls: 'up' });
    s.step(3, [250, 280, 310].map((x, i) => bubble(x, 80 + i * 10, 40, 30, '#fff', 'l') + L(`M${x - 6} ${80 + i * 10}H${x + 6}`, '#ef4444', 3)).join('') + person({ x: 360, y: 254, shirt: '#475569', fc: 'angry', armL: [-30, -10] }), { cls: 'pop' });
  }],
  ['deviate', '#dc2626', '표시된 오솔길을 벗어나 숲속으로 들어가 길을 잃는다', (s) => {
    s.sky('green'); s.ground('grass', 246);
    s.step(1, L('M60 250Q200 220 330 240T500 200', '#a8946c', 16) + tree(110, 230, 0.7) + tree(420, 220, 0.7), { cls: 'up' });
    s.step(2, person({ x: 200, y: 246, shirt: '#16a34a', legs: 'walk', fc: 'smile', s: 0.8 }), { cls: 'up', e: 2 });
    s.step(3, person({ x: 360, y: 276, shirt: '#16a34a', fc: 'think', legs: 'walk', s: 0.8, rot: 8 }) + L('M200 240Q280 270 350 270', '#16a34a', 3, 'stroke-dasharray="5 7"') + qm(360, 150, '#dc2626', 1.3) + cross(500, 50), { cls: 'up' });
  }],
  ['peripheral', '#7c3aed', '과녁의 한가운데가 아닌 바깥 가장자리에 놓인 주변부', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, C(280, 150, 100, '#ddd6fe', 'stroke="#7c3aed" stroke-width="4"') + C(280, 150, 66, '#c4b5fd', 'stroke="#7c3aed" stroke-width="4"') + C(280, 150, 32, '#a78bfa', 'stroke="#7c3aed" stroke-width="4"'), { cls: 'pop' });
    s.step(2, star(280, 150, 14, '#ffd34d'), { cls: 'pop' });
    s.step(3, C(370, 100, 10, '#ef4444') + arrow(450, 60, 390, 90, '#ef4444', 4, 10), { cls: 'pop' });
  }],
  ['petition', '#2563eb', '많은 사람이 서명한 긴 청원서를 모아 관청에 올린다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, paper(200, 150, 160, 200, 0) + [0, 1, 2, 3, 4].map((i) => L(`M130 ${90 + i * 28}H210`, '#aab4c6', 3) + L(`M222 ${90 + i * 28}Q232 ${80 + i * 28} 242 ${94 + i * 28}T262 ${88 + i * 28}`, '#2563eb', 2.4)).join(''), { cls: 'up' });
    s.step(2, [380, 450].map((x, i) => person({ x, y: 254, shirt: ['#ec4899', '#f59e0b'][i], hs: i ? 'short' : 'long', s: 0.8, fc: 'smile', armL: [-40, -10] })).join(''), { cls: 'up' });
    s.step(3, person({ x: 500, y: 254, shirt: '#1f2937', pants: '#1f2937', s: 0.8, hat: tie, fc: 'neutral' }) + C(220, 120, 18, '#dc2626', 'fill-opacity=".85"') + star(220, 120, 8, '#fff') + chk(300, 70), { cls: 'up' });
  }],
  ['oblivion', '#78716c', '덩굴과 안개에 묻혀 점점 잊혀 사라지는 망각', (s) => {
    s.sky('gray'); s.ground('grass', 250);
    s.step(1, R(240, 160, 80, 92, '#cbd5e1', 14, 'stroke="#8a93a5" stroke-width="3"') + heart(280, 200, 0.8, '#ef4444'), { cls: 'up', e: 2 });
    s.step(2, R(240, 160, 80, 92, '#cbd5e1', 14, 'stroke="#8a93a5" stroke-width="3"') + L('M250 252Q240 200 260 170M310 252Q320 200 300 180', '#3f8f3a', 6) + P('M250 200C232 190 224 202 236 212Z M310 190C328 180 336 192 324 202Z', '#5fb85a'), { e: 2 });
    s.step(3, R(240, 160, 80, 92, 'none', 14, 'stroke="#aab4c6" stroke-width="3" stroke-dasharray="6 8"') + cloud(280, 150, 2.2, '#fff', 0.9) + cloud(200, 210, 1.6, '#fff', 0.8) + cloud(360, 210, 1.6, '#fff', 0.8), { cls: 'pop' });
  }],
  ['restless', '#f59e0b', '한곳에 가만히 있지 못하고 왔다 갔다 서성이는 불안한 모습', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#f59e0b', fc: 'think', legs: 'walk' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 200, y: 254, shirt: '#f59e0b', fc: 'think', legs: 'walk' }) + arrow(240, 150, 340, 150, '#f59e0b', 4, 10) + arrow(340, 170, 240, 170, '#f59e0b', 4, 10), { e: 2 });
    s.step(3, person({ x: 360, y: 254, shirt: '#f59e0b', fc: 'sad', legs: 'walk' }) + [[160, 266], [220, 270], [280, 266], [330, 270]].map(([x, y]) => E(x, y, 12, 5, '#a8742a', 'fill-opacity=".5"')).join('') + drop(340, 160, 0.8) + clock(460, 90, 22, 4.5, 1), { });
  }],
  ['rhetorical', '#7c3aed', '대답을 바라지 않고 던지는 말솜씨 좋은 수사적인 물음', (s) => {
    s.sky('wall'); s.ground('carpet', 252);
    s.step(1, R(120, 190, 100, 62, '#7a461f', 4) + person({ x: 170, y: 190, shirt: '#7c3aed', fc: 'cheer', legs: 'hide', armR: [34, -40], armL: [-30, -20], sh: false }), { cls: 'up' });
    s.step(2, bubble(300, 90, 110, 66, '#fff', 'l') + qm(300, 90, '#7c3aed', 1.3), { cls: 'pop' });
    s.step(3, [380, 450, 510].map((x, i) => person({ x, y: 270, shirt: ['#3b82f6', '#22c55e', '#f59e0b'][i], s: 0.65, fc: 'neutral' })).join('') + L('M360 190H400M430 190H470', '#aab4c6', 3, 'stroke-opacity="0"') + L('M240 150Q300 130 360 150', '#7c3aed', 4, 'stroke-dasharray="5 7"'), { cls: 'up' });
  }],
  ['stale', '#78716c', '갓 구운 빵이 시간이 지나 딱딱하게 말라 곰팡이가 핀 케케묵은 상태', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, bread(130, 226, 2.2) + L('M110 160Q118 140 110 120M150 160Q158 140 150 120', '#cbd5e1', 4), { cls: 'up', e: 1 });
    s.step(2, `<g transform="translate(280 70)">${R(-30, -26, 60, 52, '#fff', 6, 'stroke="#aab4c6" stroke-width="3"')}${R(-30, -26, 60, 16, '#ef4444', 6)}</g>` + arrow(280, 110, 280, 140, '#78716c', 4, 10), { cls: 'pop' });
    s.step(3, `<g transform="translate(440 226) scale(2.2)">${E(0, -14, 26, 15, '#a8794a')}${L('M-12 -22L-6 -10M0 -26L4 -12', '#6a4a2a', 3)}</g>` + C(420, 190, 5, '#65a30d') + C(450, 196, 5, '#65a30d') + C(470, 186, 4, '#65a30d') + cross(500, 50), { cls: 'pop' });
  }],
  ['scenic', '#16a34a', '전망대에서 호수와 산이 펼쳐진 경치를 카메라에 담는 절경', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, P('M0 200L120 110L220 170L330 90L440 170L560 120V210H0Z', '#8aa3b8', 'stroke="#64748b" stroke-width="3"') + R(0, 190, 560, 60, '#7dd3fc') + sun(460, 60, 24, '#fff3a8'), { cls: 'up' });
    s.step(2, R(30, 250, 150, 8, '#8c5a2a', 2) + person({ x: 110, y: 262, shirt: '#16a34a', fc: 'smile', armR: [30, -30] }) + R(130, 200, 30, 20, '#1f2937', 4) + C(145, 210, 6, '#9fd8ff'), { cls: 'up' });
    s.step(3, sparks(145, 210, 24, 38, '#ffd34d', 8, 4) + heart(300, 70, 0.9, '#ef4444') + star(420, 100, 8), { cls: 'pop' });
  }],
  ['utilitarian', '#475569', '화려한 꽃병보다 비를 받아 내는 소박한 양동이가 쓸모 있는 실용적인 물건', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(150 252)">${P('M-20 -70H20L26 -30Q40 -10 20 0H-20Q-40 -10 -26 -30Z', '#ffd34d', 'stroke="#d99a00" stroke-width="3"')}${star(0, -34, 8, '#fff')}</g>` + `<g transform="translate(420 252)">${P('M-26 -44H26L20 0H-20Z', '#9ca3af', 'stroke="#6b7280" stroke-width="3"')}${L('M-26 -44Q0 -66 26 -44', '#6b7280', 3)}</g>`, { cls: 'up' });
    s.step(2, P('M0 0H560V40Q400 60 300 40T0 50Z', '#6b7280', 'fill-opacity=".8"') + `<g fill="#6fb8ee">${[120, 210, 330, 420, 470].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.5}s" d="M${x} 60c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>`, {});
    s.step(3, E(420, 220, 18, 5, '#6fb8ee') + chk(420, 130, 20) + cross(150, 150, 20), { cls: 'pop' });
  }],
  ['unencumbered', '#0ea5e9', '무거운 짐을 내려놓고 홀가분하게 팔을 벌려 달린다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 150, y: 262, shirt: '#0ea5e9', fc: 'sad', rot: 10, legs: 'walk', armL: [-6, 24], armR: [6, 24] }) + R(110, 170, 60, 80, '#c2410c', 10) + R(98, 160, 84, 20, '#9a3412', 8), { cls: 'up', e: 2 });
    s.step(2, R(260, 240, 60, 20, '#c2410c', 8) + arrow(170, 150, 240, 190, '#0ea5e9', 4, 10), { cls: 'pop' });
    s.mv(3, 'translateX(-130px)', person({ x: 430, y: 262, shirt: '#0ea5e9', fc: 'cheer', legs: 'walk', armL: [-30, -30], armR: [30, -30] }), { d: 1 });
    s.step(3, bird(150, 90, 1.2) + bird(220, 60, 1) + sparks(430, 150, 50, 64, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['assemble', '#16a34a', '흩어진 부품이 모여 하나의 로봇으로 조립된다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.mv(1, 'translate(-140px,-60px) rotate(-12deg)', R(240, 200, 26, 46, '#6b7384', 5) + R(294, 200, 26, 46, '#6b7384', 5), { d: 1 });
    s.mv(2, 'translate(140px,-20px)', R(236, 110, 88, 86, '#2563eb', 8) + R(210, 118, 22, 60, '#475569', 6) + R(328, 118, 22, 60, '#475569', 6), { d: 1 });
    s.mv(3, 'translateY(-120px)', R(246, 50, 68, 52, '#cbd5e1', 10) + C(264, 76, 6, '#ef4444') + C(296, 76, 6, '#ef4444') + L('M280 50V32', '#475569', 4) + C(280, 30, 5, '#facc15'), { d: 1 });
    s.step(3, gear(130, 150, 22, '#16a34a') + chk(480, 56), { cls: 'pop' });
  }],
  ['implication', '#0891b2', '바다 위로 드러난 빙산 끝이 물속에 숨은 거대한 부분을 암시한다', (s) => {
    s.sky('day'); s.ground('water', 170);
    s.step(1, iceberg(280, 172), { cls: 'up' });
    s.step(2, P('M220 172L340 172L360 240L280 290L200 240Z', '#cfeaff', 'stroke="#9fd8ff" stroke-width="3" stroke-dasharray="6 6"'), { cls: 'wipe-d' });
    s.step(3, qm(440, 90, '#0891b2', 1.4) + arrow(420, 130, 340, 220, '#0891b2', 4, 10) + sparks(280, 230, 90, 104, '#9fd8ff', 8, 3), { cls: 'pop' });
  }],
  ['inhibit', '#6b7280', '돌이 눌러 새싹이 크지 못하고 억눌려 자라지 못한다', (s) => {
    s.sky('day'); s.ground('soil', 190);
    s.step(1, R(0, 190, 560, 110, '#9a6a3a') + L('M280 190V150', '#3f8f3a', 6) + P('M280 160C262 150 250 162 262 172Z M280 150C298 138 310 150 298 160Z', '#5fb85a'), { cls: 'up', e: 1 });
    s.step(2, R(0, 190, 560, 110, '#9a6a3a') + L('M280 190V130', '#3f8f3a', 6) + C(280, 100, 36, '#8a7a68', 'stroke="#5f5242" stroke-width="3"'), { e: 2 });
    s.step(3, R(0, 190, 560, 110, '#9a6a3a') + C(280, 166, 30, '#8a7a68', 'stroke="#5f5242" stroke-width="3"') + L('M280 190Q250 190 240 176', '#9aa94a', 5) + L('M280 190Q310 188 322 172', '#9aa94a', 5) + arrow(280, 90, 280, 130, '#6b7280', 5, 12) + cross(480, 50), { });
  }],
  ['scarcity', '#a16207', '바닥난 우물 앞에 빈 컵을 든 사람들이 기다리는 물의 부족', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, well(280, 250), { cls: 'up' });
    s.step(2, person({ x: 120, y: 262, shirt: '#3b82f6', fc: 'sad', armR: [30, 4] }) + cup(160, 220, 1.2) + person({ x: 440, y: 262, shirt: '#ec4899', hs: 'long', fc: 'sad', armL: [-30, 4] }) + cup(400, 220, 1.2), { cls: 'up' });
    s.step(3, drop(280, 170, 0.8, '#6fb8ee') + L('M250 110L310 110', '#a16207', 3, 'stroke-opacity="0"') + cross(500, 50) + L('M200 262H220M340 262H360', '#a8742a', 4), { cls: 'pop' });
  }],
  ['tease', '#f97316', '깃털로 간지럽히자 까르르 웃음을 터뜨리는 장난', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 170, y: 254, shirt: '#f97316', fc: 'smirk', armR: [60, -10] }) + `<g transform="translate(240 190) rotate(-20)">${P('M0 0C20 -14 40 -12 50 -4C40 4 20 10 0 0Z', '#f4f6fa', 'stroke="#cbd5e1" stroke-width="2"')}${L('M0 0L-16 12', '#8a93a5', 3)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 400, y: 254, shirt: '#3b82f6', fc: 'neutral', s: 0.9 }), { cls: 'up' });
    s.step(3, person({ x: 400, y: 254, shirt: '#3b82f6', fc: 'cheer', s: 0.9, rot: -6, armL: [-14, -30], armR: [14, -30] }) + L('M350 150L336 140M450 150L464 140M340 190L322 190', '#f97316', 4) + heart(300, 100, 0.6, '#ec4899'), { });
  }],
  ['presumable', '#6366f1', '먹구름이 몰리니 비가 오리라 짐작해 미리 우산을 펴는 추정', (s) => {
    s.sky('gray'); s.ground('grass', 246);
    s.step(1, cloud(130, 70, 1.8, '#6b7384') + cloud(300, 50, 2, '#5b6577') + cloud(450, 76, 1.6, '#6b7384'), { cls: 'up' });
    s.step(2, person({ x: 280, y: 262, shirt: '#6366f1', fc: 'think', armR: [16, -34] }) + qm(310, 130, '#6366f1', 1.1), { cls: 'up', e: 2 });
    s.step(3, person({ x: 280, y: 262, shirt: '#6366f1', fc: 'smile', armR: [14, -52] }) + `<g transform="translate(294 150)">${P('M-50 0Q0 -56 50 0Z', '#ef4444')}${L('M0 0V30', '#6b4a2a', 3)}</g>` + L('M110 120V150M160 130V160M400 120V150M450 130V160', '#6fb8ee', 3, 'stroke-dasharray="4 6"'), { });
  }],
  ['restraint', '#16a34a', '케이크로 뻗는 손을 다른 손으로 붙잡아 꾹 참는 자제', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, table(400, 238, 200) + cake(400, 226, 1.4), { cls: 'up' });
    s.step(2, person({ x: 180, y: 254, shirt: '#16a34a', fc: 'shy', armR: [90, -20], armL: [10, -20] }), { cls: 'up', e: 2 });
    s.step(3, person({ x: 180, y: 254, shirt: '#16a34a', fc: 'smile', armR: [-10, 14], armL: [10, 14] }) + drop(200, 160, 0.7) + chk(500, 56), { cls: 'up' });
  }],
  ['subsidize', '#0d9488', '정부 지원금이 버스 요금 일부를 대신 내 주어 값이 싸진다', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, `<g transform="translate(300 250)">${R(-80, -70, 160, 70, '#facc15', 10)}${[-56, -20, 16, 52].map((x) => R(x, -58, 28, 24, '#cfeaff', 3)).join('')}${C(-40, 4, 14, '#1f2937')}${C(40, 4, 14, '#1f2937')}</g>` + `<g transform="translate(420 150)">${R(-32, -16, 64, 32, '#fff', 6, 'stroke="#aab4c6" stroke-width="2"')}${coin(-14, 0, 9)}${R(2, -4, 24, 8, '#aab4c6', 3)}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(110 250)">${R(-50, -80, 100, 80, '#e8e4d8', 3)}${P('M-62 -80L0 -116L62 -80Z', '#cbbf9c')}${flag(0, -116, '#0d9488', 30)}</g>`, { cls: 'up' });
    s.mv(3, 'translateX(-150px)', bag(290, 150, 1.1, '#d9772e'), { d: 0.8 });
    s.step(3, arrow(430, 100, 430, 130, '#0d9488', 4, 10) + chk(500, 56), { cls: 'pop' });
  }],
  ['termination', '#7f1d1d', '해고 통지서를 받고 짐 상자를 들고 회사를 떠나는 종료', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(150, 190, 120, 10, '#8c5a2a', 3) + R(160, 200, 8, 52, '#6b4a2a') + R(252, 200, 8, 52, '#6b4a2a') + person({ x: 440, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: tie, fc: 'angry', armL: [-60, -10] }), { cls: 'up' });
    s.step(2, person({ x: 300, y: 254, shirt: '#475569', fc: 'shock', armR: [30, -10] }) + R(350, 190, 40, 28, '#fecaca', 4, 'stroke="#dc2626" stroke-width="2"'), { cls: 'up', e: 2 });
    s.mv(3, 'translateX(-140px)', person({ x: 440, y: 254, shirt: '#475569', fc: 'sad', legs: 'walk', armL: [-26, 10], armR: [26, 10] }) + box(440, 224, 50, 36, '#c99a5b'), { d: 1 });
    s.step(3, door(60, 252, 70, 140, '#7a461f') + cross(500, 56), { cls: 'pop' });
  }],
  ['adhere', '#0ea5e9', '풀칠한 종이를 벽에 눌러 붙이자 손을 떼도 착 달라붙는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(240, 60, 220, 190, '#e8d0b0', 6) + paper(150, 160, 70, 90, 3) + R(100, 240, 30, 10, '#fff', 3, 'stroke="#aab4c6" stroke-width="2"'), { cls: 'up' });
    s.mv(2, 'translateX(120px)', paper(310, 140, 70, 90, 3), { d: 0.9, e: 2 });
    s.step(2, L('M280 100H340M280 118H340M280 136H340', '#fde68a', 6, 'stroke-opacity=".9"'), { cls: 'wipe', e: 2 });
    s.step(3, paper(350, 140, 70, 90, 3) + C(350, 100, 5, '#ef4444') + chk(480, 56), { cls: 'pop' });
  }],
  ['alleviate', '#16a34a', '혹 난 자리에 얼음주머니를 대자 아픔이 가라앉고 웃음이 돌아온다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#16a34a', fc: 'cry' }) + C(298, 164, 8, '#ef4444') + L('M330 150L350 140M330 170L354 172', '#ef4444', 4), { cls: 'up', e: 2 });
    s.step(2, person({ x: 280, y: 254, shirt: '#16a34a', fc: 'sad' }) + `<g transform="translate(310 160) rotate(-10)">${R(-18, -16, 36, 32, '#e6f6ff', 6, 'stroke="#9fd8ff" stroke-width="3"')}${L('M-6 -6L6 6M6 -6L-6 6', '#38bdf8', 3)}</g>`, { e: 2 });
    s.step(3, person({ x: 280, y: 254, shirt: '#16a34a', fc: 'smile' }) + `<g transform="translate(310 160) rotate(-10)">${R(-18, -16, 36, 32, '#e6f6ff', 6, 'stroke="#9fd8ff" stroke-width="3"')}${L('M-6 -6L6 6M6 -6L-6 6', '#38bdf8', 3)}</g>` + heart(370, 110, 0.7, '#ef4444') + chk(500, 50), { });
  }],
  ['crave', '#ec4899', '진열창 속 아이스크림에 눈이 반짝이며 침 흘리게 간절히 원한다', (s) => {
    s.sky('pink'); s.ground('stone', 250);
    s.step(1, R(300, 90, 200, 160, '#cfeaff', 8, 'stroke="#fff" stroke-width="8"') + [[370, 190], [440, 190]].map(([x, y]) => `<g transform="translate(${x} ${y})">${P('M-14 0L14 0L0 44Z', '#d9a05a')}${C(0, -6, 18, '#f9a8d4')}${C(0, -22, 12, '#fde68a')}</g>`).join(''), { cls: 'up' });
    s.step(2, person({ x: 200, y: 254, shirt: '#ec4899', fc: 'shy', rot: -10, armR: [60, -10] }), { cls: 'up' });
    s.step(3, drop(222, 170, 0.8, '#8fd0ff') + heart(260, 120, 0.8, '#ef4444') + star(290, 90, 8) + sparks(200, 130, 30, 44, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['disperse', '#0ea5e9', '아이가 달려오자 비둘기 떼가 사방으로 흩어져 날아간다', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, [[220, 246], [260, 252], [300, 244], [340, 250], [280, 258]].map(([x, y]) => bird(x, y, 1.2, '#94a3b8')).join(''), { cls: 'up', e: 2 });
    s.step(2, person({ x: 100, y: 262, shirt: '#f59e0b', s: 0.7, legs: 'walk', fc: 'cheer', armL: [-20, -30], armR: [20, -30] }) + arrow(150, 190, 200, 210, '#0ea5e9', 4, 10), { cls: 'up', e: 2 });
    s.step(3, [[140, 90], [260, 60], [400, 80], [480, 130], [200, 150], [360, 150]].map(([x, y]) => bird(x, y, 1.1, '#94a3b8')).join('') + [[190, 110, 150, 90], [330, 110, 380, 80]].map(([a, b, c, d]) => L(`M${a} ${b}L${c} ${d}`, '#0ea5e9', 2, 'stroke-opacity="0"')).join('') + person({ x: 200, y: 262, shirt: '#f59e0b', s: 0.7, fc: 'cheer', armL: [-20, -30], armR: [20, -30] }), { cls: 'up' });
  }],
  ['fatality', '#7f1d1d', '충돌 사고 현장에 구급차가 달려오고 경고판이 세워진 치명적 사고', (s) => {
    s.sky('gray'); s.ground('road', 246);
    s.step(1, car(180, 250, '#3b82f6', 1.1) + `<g transform="translate(250 250) rotate(-20)">${car(0, 0, '#ef4444', 1.1)}</g>` + sparks(230, 220, 20, 40, '#ffd34d', 8, 4), { cls: 'up' });
    s.mv(2, 'translateX(-200px)', `<g transform="translate(450 250)">${R(-60, -50, 120, 50, '#fff', 8, 'stroke="#aab4c6" stroke-width="2"')}${R(-60, -24, 120, 8, '#ef4444')}${C(-34, 6, 12, '#1f2937')}${C(34, 6, 12, '#1f2937')}${L('M0 -44V-30M-7 -37H7', '#dc2626', 5)}</g>`, { d: 1 });
    s.step(3, P('M330 130L300 180H360Z', '#facc15', 'stroke="#1f2937" stroke-width="4" stroke-linejoin="round"') + L('M330 144V162M330 168V170', '#1f2937', 5) + cross(500, 50), { cls: 'pop' });
  }],
  ['fraud', '#7f1d1d', '번쩍이는 가짜 금덩이로 속여 돈만 챙기는 사기', (s) => {
    s.sky('dark'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#374151', fc: 'smirk', armR: [50, -20], hat: '<rect x="-17" y="-92" width="34" height="10" fill="#111827"/>' }) + `<g transform="translate(230 190)">${P('M-24 0L-18 -28H18L24 0Z', '#ffd34d', 'stroke="#d99a00" stroke-width="3"')}${sparks(0, -14, 26, 38, '#ffd34d', 6, 3)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 440, y: 254, shirt: '#16a34a', fc: 'cheer', armL: [-50, -10] }) + bag(350, 210, 1.1, '#d9772e') + arrow(380, 180, 330, 190, '#7f1d1d', 4, 10), { cls: 'up' });
    s.step(3, `<g transform="translate(230 190)">${P('M-24 0L-18 -28H18L24 0Z', '#9ca3af', 'stroke="#6b7280" stroke-width="3"')}</g>` + person({ x: 440, y: 254, shirt: '#16a34a', fc: 'cry', armL: [-14, -20] }) + cross(500, 50), { });
  }],
  ['divulge', '#dc2626', '자물쇠로 잠가 둔 비밀을 입 밖에 내자 여러 사람에게 퍼져 나간다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#dc2626', fc: 'neutral' }) + bubble(250, 100, 90, 54, '#fff', 'l') + lock(250, 112, 0.8), { cls: 'up', e: 2 });
    s.step(2, person({ x: 150, y: 254, shirt: '#dc2626', fc: 'cheer', armR: [30, -20] }) + bubble(260, 100, 100, 54, '#fff', 'l') + L('M230 92H290M230 110H280', '#aab4c6', 4), { e: 2 });
    s.step(3, person({ x: 150, y: 254, shirt: '#dc2626', fc: 'shock', armR: [30, -20] }) + [380, 450, 510].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#22c55e', '#f59e0b'][i], s: 0.7, fc: 'shock', armL: [-14, -30] }) + bubble(x, 120 - i * 10, 34, 26, '#fff', 'l')).join('') + cross(280, 60), { cls: 'up' });
  }],
  ['liken', '#7c3aed', '구름을 양에 빗대어 서로 닮았다고 견주는 비유', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, cloud(150, 110, 2, '#fff'), { cls: 'up' });
    s.step(2, `<g transform="translate(410 230)">${E(0, 0, 40, 28, '#fff', 'stroke="#d6dbe5" stroke-width="3"')}${C(-18, -10, 14, '#fff')}${C(18, -12, 14, '#fff')}${C(-44, -4, 14, '#3b3f4a')}${R(-24, 22, 8, 18, '#3b3f4a', 2)}${R(18, 22, 8, 18, '#3b3f4a', 2)}</g>`, { cls: 'up' });
    s.step(3, R(240, 90, 50, 8, '#7c3aed', 3) + R(240, 112, 50, 8, '#7c3aed', 3) + L('M180 120L230 120M300 120L360 150', '#7c3aed', 3, 'stroke-dasharray="4 6"') + sparks(265, 105, 40, 54, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['dignity', '#ca8a04', '어떤 상황에서도 가슴을 펴고 턱을 당당히 든 품위와 존엄', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: tie, fc: 'neutral' }), { cls: 'up' });
    s.step(2, L('M280 90V240', '#ca8a04', 4, 'stroke-dasharray="6 6"') + arrow(280, 110, 280, 60, '#ca8a04', 5, 12), { cls: 'wipe-d' });
    s.step(3, crown(280, 56, 1) + `<ellipse cx="280" cy="42" rx="22" ry="6" fill="none" stroke="#facc15" stroke-width="5"/>`.replace(/.*/, '') + sparks(280, 150, 80, 96, '#ffd34d', 12, 3) + star(120, 100, 10) + star(440, 100, 10), { cls: 'pop' });
  }],
  ['prevail', '#f59e0b', '먹구름을 뚫고 햇살이 우세하게 퍼져 마을을 환히 비춘다', (s) => {
    s.sky('gray'); s.ground('grass', 246);
    s.step(1, house(130, 252, 90, '#f3d9b5', '#c0392b') + house(330, 252, 100, '#cfe3f4', '#3b6aa0') + cloud(130, 60, 2, '#4a5568') + cloud(300, 50, 2.4, '#3b4558') + cloud(470, 60, 2, '#4a5568'), { cls: 'up', e: 2 });
    s.step(2, sun(300, 80, 36, '#ffd34d') + `<path d="M300 90L180 250H420Z" fill="#fff3b8" fill-opacity=".45"/>`, { cls: 'pop', e: 2 });
    s.step(3, `<rect width="560" height="300" fill="#bfe6ff"/>` + sun(300, 70, 40, '#ffd34d') + sparks(300, 70, 52, 70, '#ffd34d', 14, 5) + `<path d="M0 248C150 232 310 252 560 238V300H0Z" fill="#6fcf66"/>` + house(130, 252, 90, '#f3d9b5', '#c0392b') + house(330, 252, 100, '#cfe3f4', '#3b6aa0') + chk(500, 60), { });
  }],
];
