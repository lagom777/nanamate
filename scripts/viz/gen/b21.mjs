import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const castle = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${R(-70, -80, 140, 80, '#b8bfcf', 4, 'stroke="#8a93a5" stroke-width="3"')}${R(-86, -110, 36, 110, '#a8aebd', 4)}${R(50, -110, 36, 110, '#a8aebd', 4)}${P('M-30 0V-30Q0 -50 30 -30V0Z', '#5a3a22')}${P('M-86 -110L-68 -140L-50 -110Z M50 -110L68 -140L86 -110Z', '#ef4444')}</g>`;
const thumb = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${R(-20, -10, 44, 46, '#ffd7b5', 12, 'stroke="#e8b48c" stroke-width="3"')}${R(-6, -46, 16, 42, '#ffd7b5', 8, 'stroke="#e8b48c" stroke-width="3"')}${L('M-12 6H18M-12 18H18', '#e8b48c', 2.4)}</g>`;
const glove = (x, y, col, flip = 1) => `<g transform="translate(${x} ${y}) scale(${flip} 1)">${R(-18, -10, 36, 44, col, 12)}${R(-16, -44, 8, 40, col, 4)}${R(-5, -50, 8, 46, col, 4)}${R(6, -44, 8, 40, col, 4)}${R(18, 0, 24, 14, col, 6)}</g>`;

export default [
  ['unpaved', '#a16207', '포장 안 된 흙길에서 차가 덜컹대며 먼지를 일으킨다', (s) => {
    s.sky('sun'); s.ground('sand', 240);
    s.step(1, L('M0 250H260', '#5b6575', 40) + L('M0 250H260', '#fff', 3, 'stroke-dasharray="20 14"'), { cls: 'wipe', e: 2 });
    s.step(2, P('M0 230L560 230V300H0Z', '#b98650') + [[310, 262], [380, 270], [450, 260]].map(([x, y]) => E(x, y, 24, 7, '#7a461f', 'fill-opacity=".6"')).join('') + C(340, 240, 8, '#8a7a68') + C(430, 248, 10, '#8a7a68'), { cls: 'up' });
    s.mv(3, 'translateX(-120px)', `<g class="a-bob" style="animation-duration:.4s">${car(430, 244, '#3b82f6', 1)}</g>` + C(340, 250, 14, '#d9bd7a', 'fill-opacity=".7"') + C(320, 238, 10, '#d9bd7a', 'fill-opacity=".7"'), { d: 1 });
  }],
  ['viable', '#16a34a', '씨앗에서 싹이 터 자라날 수 있는 실현 가능한 계획', (s) => {
    s.sky('day'); s.ground('soil', 190);
    s.step(1, R(0, 190, 560, 110, '#9a6a3a') + E(280, 200, 12, 8, '#7a5a2a') + sun(450, 70, 24, '#fff3a8'), { cls: 'up' });
    s.step(2, L('M280 200V170', '#3f8f3a', 5) + P('M280 176C266 166 256 176 266 186Z M280 170C294 160 304 170 294 180Z', '#5fb85a'), { cls: 'pop' });
    s.step(3, tree(280, 200, 0.7) + chk(480, 56) + drop(210, 130, 0.8) + L('M180 140L200 150', '#6fb8ee', 3, 'stroke-opacity="0"'), { cls: 'up' });
  }],
  ['verification', '#0891b2', '서류를 돋보기로 하나하나 대조해 맞는지 확인하는 검증', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, paper(170, 150, 120, 150, 4) + paper(310, 150, 120, 150, 4), { cls: 'up' });
    s.step(2, magnifier(240, 120, 1.3) + L('M200 110L330 110', '#0891b2', 3, 'stroke-dasharray="5 6"'), { cls: 'pop' });
    s.step(3, C(310, 150, 22, '#16a34a', 'fill-opacity=".85"') + L('M298 150L308 160L326 138', '#fff', 5) + chk(480, 56) + sparks(310, 150, 30, 44, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['vie', '#dc2626', '트로피를 두고 막상막하로 달려 서로 다투는 경쟁', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, trophyL(470, 252, 1.3), { cls: 'up' });
    s.step(2, person({ x: 120, y: 262, shirt: '#3b82f6', fc: 'angry', legs: 'walk', rot: 12 }) + person({ x: 180, y: 262, shirt: '#ef4444', fc: 'angry', legs: 'walk', rot: 12 }), { cls: 'up', e: 2 });
    s.mv(3, 'translateX(-160px)', person({ x: 400, y: 262, shirt: '#3b82f6', fc: 'angry', legs: 'walk', rot: 12 }) + person({ x: 360, y: 276, shirt: '#ef4444', fc: 'angry', legs: 'walk', rot: 12 }), { d: 1 });
    s.step(3, sparks(430, 190, 30, 46, '#ffd34d', 8, 4) + L('M80 230H150M70 260H130', '#dc2626', 4), { cls: 'pop' });
  }],
  ['unimpeded', '#16a34a', '장애물이 모두 치워져 막힘없이 쭉 달리는 길', (s) => {
    s.sky('day'); s.ground('road', 240);
    s.step(1, L('M0 262H560', '#fff', 4, 'stroke-dasharray="26 18" stroke-opacity=".8"') + [200, 300, 400].map((x) => P(`M${x - 12} 262L${x} 220L${x + 12} 262Z`, '#f97316', 'stroke="#fff" stroke-width="2"')).join('') + car(90, 250, '#3b82f6', 1.1), { cls: 'up', e: 1 });
    s.step(2, L('M0 262H560', '#fff', 4, 'stroke-dasharray="26 18" stroke-opacity=".8"') + arrow(160, 200, 220, 200, '#16a34a', 4, 10) + car(90, 250, '#3b82f6', 1.1), { e: 2 });
    s.mv(3, 'translateX(-260px)', car(420, 250, '#3b82f6', 1.1) + L('M300 220H360M290 240H350', '#16a34a', 4), { d: 1 });
    s.step(3, L('M0 262H560', '#fff', 4, 'stroke-dasharray="26 18" stroke-opacity=".8"') + chk(500, 56), { cls: 'pop' });
  }],
  ['adjacent', '#7c3aed', '벽을 맞대고 바로 곁에 나란히 붙어 있는 이웃한 집', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, house(210, 252, 120, '#f3d9b5', '#c0392b'), { cls: 'up' });
    s.step(2, house(350, 252, 120, '#cfe3f4', '#3b6aa0'), { cls: 'up' });
    s.step(3, L('M280 120V252', '#7c3aed', 4, 'stroke-dasharray="6 6"') + arrow(240, 100, 280, 100, '#7c3aed', 4, 10) + arrow(320, 100, 280, 100, '#7c3aed', 4, 10) + chk(480, 56), { cls: 'pop' });
  }],
  ['withhold', '#6b7280', '조르는 친구에게 선물을 등 뒤로 감추고 내주지 않는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 400, y: 254, shirt: '#6b7280', fc: 'smirk', armL: [-14, 20] }) + gift(430, 190, 1, '#f43f5e'), { cls: 'up', e: 2 });
    s.step(2, person({ x: 130, y: 254, shirt: '#16a34a', fc: 'cheer', armR: [60, -20] }) + gift(430, 190, 1, '#f43f5e'), { cls: 'up', e: 2 });
    s.step(3, person({ x: 400, y: 254, shirt: '#6b7280', fc: 'smirk', armL: [14, 20], armR: [14, 24] }) + person({ x: 130, y: 254, shirt: '#16a34a', fc: 'sad', armR: [60, -20] }) + gift(446, 210, 0.8, '#f43f5e') + cross(500, 56), { });
  }],
  ['ambiguous', '#6366f1', '꽃병으로도 마주 본 두 얼굴로도 읽히는 모호한 그림', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(200, 50, 160, 190, '#fde68a', 8, 'stroke="#d99a00" stroke-width="3"'), { cls: 'up' });
    s.step(2, P('M240 50H280Q300 100 290 150Q280 200 300 240H240Z', '#1f2937') + P('M360 50H320Q300 100 310 150Q320 200 300 240H360Z', '#1f2937'), { cls: 'wipe' });
    s.step(3, qm(440, 90, '#6366f1', 1.6) + arrow(430, 130, 360, 150, '#6366f1', 3, 8) + arrow(130, 130, 200, 150, '#6366f1', 3, 8), { cls: 'pop' });
  }],
  ['approval', '#16a34a', '서류에 승인 도장이 찍히고 엄지를 치켜세우는 허락', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, paper(200, 150, 120, 150, 4), { cls: 'up' });
    s.mv(2, 'translateY(-90px)', stamp(200, 150, 1.2), { d: 0.5, ease: 'cubic-bezier(.6,0,.9,1)' });
    s.step(2, C(200, 180, 22, '#16a34a', 'fill-opacity=".85"') + L('M188 180L198 190L216 168', '#fff', 5), { cls: 'pop', dl: 0.5 });
    s.step(3, thumb(400, 170, 1.8) + sparks(400, 150, 70, 86, '#ffd34d', 10, 3) + chk(500, 50), { cls: 'pop' });
  }],
  ['assess', '#d97706', '물건을 재어 보고 별점으로 가치를 매겨 평가한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(200, 238, 220) + `<g transform="translate(200 226)">${P('M-24 0L-14 -40H14L24 0Z', '#60a5fa', 'stroke="#2563eb" stroke-width="3"')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 400, y: 254, shirt: '#d97706', fc: 'think', armL: [-60, -10] }) + magnifier(280, 150, 1), { cls: 'up' });
    s.step(3, [440, 480, 520].map((x, i) => star(x, 80, 14, i < 2 ? '#ffd34d' : '#e5e7eb')).join(''), { cls: 'pop' });
  }],
  ['complementary', '#ea580c', '왼쪽과 오른쪽이 짝이 되어 서로를 채우는 장갑 한 켤레', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, glove(150, 180, '#f97316', 1), { cls: 'up' });
    s.mv(2, 'translateX(120px)', glove(410, 180, '#3b82f6', -1), { d: 0.9 });
    s.step(3, L('M200 120H360', '#ea580c', 4, 'stroke-opacity="0"') + heart(280, 110, 0.9, '#ef4444') + sparks(280, 130, 60, 76, '#ffd34d', 8, 3) + chk(500, 56), { cls: 'pop' });
  }],
  ['specify', '#2563eb', '여러 케이크 가운데 딱 이것이라고 손가락으로 짚어 명확히 지정한다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, table(380, 238, 300) + cake(280, 226, 1) + cake(380, 226, 1) + cake(480, 226, 1), { cls: 'up' });
    s.step(2, person({ x: 120, y: 254, shirt: '#2563eb', fc: 'think', armR: [110, -50] }), { cls: 'up' });
    s.step(3, C(380, 190, 50, 'none', 'stroke="#ef4444" stroke-width="5"') + arrow(380, 90, 380, 130, '#2563eb', 5, 12) + chk(500, 50), { cls: 'pop' });
  }],
  ['unattainable', '#6b7280', '아무리 뛰어도 손이 닿지 않는 높이 뜬 별', (s) => {
    s.sky('night'); s.ground('grass', 250);
    s.step(1, star(280, 50, 22, '#ffd34d') + sparks(280, 50, 32, 46, '#ffd34d', 8, 3), { cls: 'pop' });
    s.step(2, person({ x: 280, y: 214, shirt: '#6b7280', fc: 'cheer', armL: [-20, -60], armR: [20, -60] }), { cls: 'up', e: 2 });
    s.step(3, person({ x: 280, y: 262, shirt: '#6b7280', fc: 'sad', armL: [-6, 28], armR: [6, 28] }) + L('M280 110V70', '#6b7280', 3, 'stroke-dasharray="4 6"') + cross(480, 56) + drop(256, 160, 0.7), { });
  }],
  ['abound', '#16a34a', '들판이 온통 꽃으로 가득 넘쳐 나는 풍부함', (s) => {
    s.sky('day'); s.ground('grass', 220);
    const pts = (n, seed) => [...Array(n)].map((_, i) => [30 + ((i * 97 + seed) % 500), 230 + ((i * 53 + seed) % 60)]);
    const fl = (pp, cols) => pp.map(([x, y], i) => L(`M${x} ${y}V${y - 14}`, '#3f8f3a', 2.4) + C(x, y - 18, 6, cols[i % cols.length])).join('');
    s.step(1, fl(pts(8, 10), ['#f472b6']), { cls: 'up' });
    s.step(2, fl(pts(18, 33), ['#facc15', '#fff', '#a78bfa']), { cls: 'pop' });
    s.step(3, fl(pts(30, 71), ['#ef4444', '#f97316', '#22c55e', '#3b82f6']) + sun(470, 60, 24, '#fff3a8') + chk(100, 50), { cls: 'pop' });
  }],
  ['vain', '#6b7280', '구멍 난 양동이에 아무리 물을 부어도 새어 버리는 헛수고', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(360 252)">${P('M-40 -70H40L30 0H-30Z', '#9ca3af', 'stroke="#6b7280" stroke-width="3"')}${C(0, -18, 6, '#475569')}</g>` + person({ x: 160, y: 254, shirt: '#6b7280', fc: 'cheer', armR: [60, -40] }), { cls: 'up' });
    s.step(2, L('M220 150Q280 110 350 190', '#38bdf8', 8) + drop(360, 190, 0.8) + E(360, 240, 24, 6, '#4fc3f7'), { cls: 'wipe' });
    s.step(3, person({ x: 160, y: 254, shirt: '#6b7280', fc: 'sad', armR: [60, -40] }) + cross(480, 56) + drop(345, 236, 0.6) + drop(380, 242, 0.6), { cls: 'pop' });
  }],
  ['authorize', '#2563eb', '책임자가 서명하고 출입증을 건네 문을 통과하도록 허가한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 120, y: 254, shirt: '#334155', hat: tie, armR: [50, 0] }) + R(180, 214, 70, 8, '#8c5a2a', 3) + paper(210, 200, 40, 28, 2), { cls: 'up' });
    s.step(2, pencil(214, 180, 1.2, 40) + L('M196 210Q206 200 214 212T236 204', '#2563eb', 3), { cls: 'pop' });
    s.mv(3, 'translateX(-90px)', R(360, 190, 40, 28, '#facc15', 4) + C(372, 198, 5, '#1f2937'), { d: 0.8 });
    s.step(3, door(470, 252, 70, 130, '#7a461f') + `<path d="M440 252V122L470 110V252Z" fill="#ffe9a0" fill-opacity=".7"/>` + chk(500, 50), { cls: 'up' });
  }],
  ['belittle', '#7f1d1d', '비웃으며 손가락질해 상대를 한없이 작게 만든다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#7f1d1d', fc: 'smirk', armR: [60, -10] }) + person({ x: 410, y: 254, shirt: '#3b82f6', fc: 'neutral' }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 150, y: 254, shirt: '#7f1d1d', s: 1.2, fc: 'smirk', armR: [70, -10] }) + person({ x: 410, y: 254, shirt: '#3b82f6', fc: 'sad', s: 0.85 }) + L('M250 130L330 150', '#7f1d1d', 3, 'stroke-dasharray="5 6"'), { e: 2 });
    s.step(3, person({ x: 150, y: 254, shirt: '#7f1d1d', s: 1.4, fc: 'smirk', armR: [80, -10] }) + person({ x: 410, y: 262, shirt: '#3b82f6', fc: 'cry', s: 0.5 }) + arrow(470, 100, 470, 180, '#7f1d1d', 5, 12), { });
  }],
  ['besiege', '#b91c1c', '성을 빙 둘러싸 사다리를 걸고 포위한 병사들', (s) => {
    s.sky('dusk'); s.ground('grass', 250);
    s.step(1, castle(280, 252, 1.5), { cls: 'up' });
    s.step(2, [60, 120, 440, 500].map((x, i) => person({ x, y: 266, shirt: '#b91c1c', pants: '#1f2937', s: 0.7, fc: 'angry', armR: [20, -44], hat: '<path d="M-18 -90Q0 -118 18 -90Z" fill="#aab4c6"/>' })).join(''), { cls: 'up' });
    s.step(3, L('M170 250L190 110M200 250L220 110', '#8c6238', 5) + L('M390 250L370 110M360 250L340 110', '#8c6238', 5) + flag(60, 200, '#b91c1c', 60) + flag(500, 200, '#b91c1c', 60), { cls: 'up' });
  }],
  ['covert', '#374151', '신문 뒤에 숨어 몰래 엿보며 사진을 찍는 은밀한 첩보', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#374151', pants: '#111827', fc: 'smirk', hat: '<rect x="-20" y="-96" width="40" height="8" fill="#111827"/><path d="M-14 -96Q0 -112 14 -96Z" fill="#111827"/>' }), { cls: 'up' });
    s.step(2, R(120, 150, 60, 80, '#e5e7eb', 3, 'stroke="#9ca3af" stroke-width="2"') + C(138, 168, 5, '#111') + C(162, 168, 5, '#111') + L('M130 192H170M130 204H160', '#9ca3af', 3), { cls: 'pop' });
    s.step(3, person({ x: 400, y: 254, shirt: '#1f2937', fc: 'neutral', legs: 'walk' }) + sparks(280, 160, 24, 38, '#ffd34d', 6, 4) + L('M180 190L260 170', '#374151', 3, 'stroke-dasharray="4 6"'), { cls: 'up' });
  }],
  ['cram', '#0ea5e9', '옷가지를 가방에 억지로 꾹꾹 눌러 채워 넣는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-90, -60, 180, 60, '#475569', 10)}${R(-90, -64, 180, 8, '#334155', 3)}</g>`, { cls: 'up', e: 2 });
    s.step(2, P('M200 170Q220 90 260 130Q290 70 330 120Q370 100 380 170Z', '#f472b6') + P('M230 170Q250 120 290 140Q320 110 350 170Z', '#60a5fa'), { cls: 'pop', e: 2 });
    s.step(3, `<g transform="translate(280 252)">${R(-90, -60, 180, 60, '#475569', 10)}${R(-90, -90, 180, 34, '#334155', 14)}${R(-14, -80, 28, 12, '#ffd34d', 3)}</g>` + L('M190 168Q180 140 200 120M370 168Q380 140 360 120', '#f472b6', 5) + person({ x: 470, y: 254, shirt: '#0ea5e9', fc: 'angry', armL: [-60, -20] }) + drop(450, 170, 0.7), { cls: 'pop' });
  }],
  ['unprecedented', '#7c3aed', '아무도 밟지 않은 달 표면에 처음으로 발자국을 남긴 전례 없는 일', (s) => {
    s.sky('night'); s.ground('dark', 220);
    s.step(1, C(120, 70, 4, '#fff') + C(240, 40, 3, '#fff') + C(460, 80, 4, '#fff') + P('M0 220Q140 200 280 215T560 205V300H0Z', '#9ca3af') + E(120, 250, 24, 6, '#6b7280') + E(420, 262, 30, 7, '#6b7280'), { cls: 'up' });
    s.step(2, person({ x: 220, y: 250, shirt: '#f4f6fa', pants: '#f4f6fa', fc: 'cheer', armL: [-20, -40], armR: [24, -30], hat: '<path d="M-19 -86Q0 -112 19 -86Z" fill="#e5e9f0" stroke="#aab4c6" stroke-width="2"/>' }), { cls: 'up' });
    s.step(3, P('M250 258q-6 -8 0 -12h14q6 4 0 12Z', '#6b7280') + P('M284 262q-6 -8 0 -12h14q6 4 0 12Z', '#6b7280') + flag(340, 250, '#ef4444', 80) + star(480, 70, 10) + chk(500, 140), { cls: 'pop' });
  }],
  ['dictate', '#0d9488', '상사가 말하는 대로 비서가 받아 적는 받아쓰기와 명령', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 410, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: tie, fc: 'cheer', armL: [-30, -20] }) + bubble(300, 100, 130, 60, '#fff', 'r') + L('M250 92H340M250 110H330', '#aab4c6', 4), { cls: 'up' });
    s.step(2, person({ x: 130, y: 254, shirt: '#0d9488', hs: 'long', fc: 'smile', armR: [40, 6] }) + R(190, 210, 60, 8, '#8c5a2a', 3) + paper(220, 200, 40, 30, 0), { cls: 'up' });
    s.step(3, L('M200 192H240M200 202H232', '#2563eb', 3) + pencil(250, 190, 1, 30) + chk(500, 56), { cls: 'pop' });
  }],
  ['anatomy', '#dc2626', '몸의 겉모습 속 뼈와 장기의 구조를 해부해 살펴보는 해부학', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-60, -190, 120, 190, '#fde8c8', 44, 'stroke="#d9a47c" stroke-width="4"')}</g>`, { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(280 252)">${R(-60, -190, 120, 190, '#fde8c8', 44, 'stroke="#d9a47c" stroke-width="4"')}${P('M-8 -140C-30 -150 -40 -120 -30 -100C-20 -90 -8 -100 -8 -120Z', '#fda4af', 'stroke="#e11d48" stroke-width="2"')}${P('M8 -140C30 -150 40 -120 30 -100C20 -90 8 -100 8 -120Z', '#fda4af', 'stroke="#e11d48" stroke-width="2"')}${heart(0, -92, 0.7, '#ef4444')}${E(0, -50, 24, 18, '#fbbf24')}</g>`, { e: 2 });
    s.step(3, `<g transform="translate(280 252)">${C(0, -170, 26, '#f4f6fa', 'stroke="#aab4c6" stroke-width="3"')}${L('M0 -144V-40', '#f4f6fa', 10)}${[0, 1, 2, 3].map((i) => L(`M-36 ${-130 + i * 22}Q0 ${-146 + i * 22} 36 ${-130 + i * 22}`, '#e5e9f0', 6)).join('')}${R(-34, -34, 68, 14, '#f4f6fa', 6)}</g>` + magnifier(420, 150, 1), { cls: 'pop' });
  }],
  ['epidemic', '#65a30d', '병 한 건이 마을 집집으로 번져 모두가 마스크를 쓰는 유행병', (s) => {
    s.sky('green'); s.ground('grass', 246);
    s.step(1, house(110, 250, 80, '#f3d9b5', '#c0392b') + house(280, 250, 80, '#cfe3f4', '#3b6aa0') + house(450, 250, 80, '#e8d0e8', '#7c3aed') + C(110, 130, 8, '#84cc16'), { cls: 'up' });
    s.step(2, [[160, 150], [200, 130], [240, 160], [280, 140]].map(([x, y]) => C(x, y, 7, '#84cc16', 'stroke="#4d7c0f" stroke-width="2"')).join(''), { cls: 'pop' });
    s.step(3, [[320, 150], [360, 130], [400, 160], [450, 140]].map(([x, y]) => C(x, y, 7, '#84cc16', 'stroke="#4d7c0f" stroke-width="2"')).join('') + [90, 280, 420].map((x, i) => person({ x, y: 270, shirt: ['#3b82f6', '#ec4899', '#f59e0b'][i], s: 0.55, fc: 'sick', skin: '#d8e8a0' }) + R(x - 8, 220, 16, 8, '#fff', 3)).join('') + cross(500, 50), { cls: 'up' });
  }],
  ['figurative', '#6366f1', '"시간은 금이다" — 시계를 금에 빗대는 비유적 표현', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, clock(140, 150, 52, 1, 3.4), { cls: 'pop' });
    s.step(2, R(242, 128, 76, 14, '#6366f1', 7) + R(242, 158, 76, 14, '#6366f1', 7), { cls: 'pop' });
    s.step(3, coin(420, 150, 56) + L('M420 150V122M420 150L442 162', '#d99a00', 4) + sparks(420, 150, 68, 84, '#ffd34d', 10, 3), { cls: 'pop' });
  }],
  ['fleeting', '#38bdf8', '두둥실 떠오르다 금세 터져 사라지는 순간의 비눗방울', (s) => {
    s.sky('sun'); s.ground('grass', 250);
    s.step(1, C(160, 200, 26, '#e0f2fe', 'fill-opacity=".7" stroke="#7dd3fc" stroke-width="3"') + C(150, 190, 6, '#fff', 'fill-opacity=".8"'), { cls: 'pop', e: 1 });
    s.step(2, C(280, 120, 34, '#e0f2fe', 'fill-opacity=".7" stroke="#7dd3fc" stroke-width="3"') + C(268, 108, 8, '#fff', 'fill-opacity=".8"') + L('M180 190Q230 160 260 140', '#7dd3fc', 3, 'stroke-dasharray="4 6"'), { e: 2 });
    s.step(3, sparks(380, 70, 14, 40, '#7dd3fc', 10, 3) + C(380, 70, 4, '#bae6fd') + L('M300 110Q340 90 370 76', '#7dd3fc', 3, 'stroke-dasharray="4 6"'), { cls: 'pop' });
  }],
  ['fortify', '#7c2d12', '허술한 울타리에 벽돌을 덧쌓아 튼튼한 요새로 강화한다', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, [150, 200, 250, 300, 350, 400].map((x) => R(x - 5, 190, 10, 60, '#a8774a', 2)).join(''), { cls: 'up', e: 2 });
    s.step(2, [0, 1, 2].map((r) => [0, 1, 2, 3, 4, 5, 6].map((c) => R(130 + c * 42 + (r % 2) * 20, 210 - r * 22, 40, 20, '#b8bfcf', 2, 'stroke="#8a93a5" stroke-width="2"')).join('')).join(''), { cls: 'wipe-d', e: 2 });
    s.step(3, R(120, 130, 330, 120, '#b8bfcf', 6, 'stroke="#8a93a5" stroke-width="3"') + [150, 210, 270, 330, 390].map((x) => R(x - 12, 112, 24, 22, '#a8aebd', 3)).join('') + R(250, 190, 60, 60, '#5a3a22', 4) + flag(300, 112, '#7c2d12', 40) + chk(500, 56), { cls: 'up' });
  }],
  ['incur', '#dc2626', '신호를 무시하고 달리다 딱지를 떼여 벌금을 물게 된다', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, `<g transform="translate(450 250)">${R(-3, -120, 6, 120, '#475569')}${R(-12, -140, 24, 44, '#1f2937', 4)}${C(0, -128, 7, '#ef4444')}${C(0, -112, 7, '#6b7280')}</g>`, { cls: 'up' });
    s.mv(2, 'translateX(-280px)', car(420, 250, '#3b82f6', 1.1), { d: 1 });
    s.step(2, person({ x: 150, y: 262, shirt: '#1d4ed8', pants: '#1e293b', fc: 'angry', armR: [40, -4], hat: '<path d="M-18 -92Q0 -116 18 -92Z" fill="#1d4ed8"/><rect x="-22" y="-94" width="44" height="6" rx="3" fill="#1d4ed8"/>' }), { cls: 'up', e: 2 });
    s.step(3, person({ x: 150, y: 262, shirt: '#1d4ed8', pants: '#1e293b', fc: 'angry', armR: [40, -4], hat: '<path d="M-18 -92Q0 -116 18 -92Z" fill="#1d4ed8"/><rect x="-22" y="-94" width="44" height="6" rx="3" fill="#1d4ed8"/>' }) + paper(230, 190, 40, 50, 2, '#fde68a') + coin(300, 190, 12) + cross(500, 50), { cls: 'up' });
  }],
  ['inscribe', '#78716c', '정으로 돌판을 쪼아 무늬와 글자를 새겨 넣는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(180, 80, 200, 170, '#cbd5e1', 14, 'stroke="#8a93a5" stroke-width="4"'), { cls: 'up' });
    s.step(2, `<g transform="translate(300 120) rotate(40)">${R(-4, -10, 8, 60, '#8a93a5', 2)}${R(-8, -50, 16, 40, '#8c6238', 3)}</g>` + sparks(284, 150, 12, 30, '#ffd34d', 8, 4), { cls: 'pop' });
    s.step(3, L('M210 120H350M210 150H340M210 180H350M210 210H320', '#6b7384', 5) + star(280, 110, 0.1, '#6b7384') + chk(480, 56), { cls: 'wipe' });
  }],
  ['irrigate', '#0ea5e9', '스프링클러가 물을 뿌려 메마른 밭을 푸르게 되살린다', (s) => {
    s.sky('sun'); s.ground('soil', 200);
    s.step(1, R(0, 200, 560, 100, '#c9a257') + [100, 200, 300, 400, 500].map((x) => L(`M${x} 220V200`, '#a8801c', 3)).join(''), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(280 200)">${R(-4, -50, 8, 50, '#6b7384')}${E(0, -52, 14, 6, '#475569')}</g>` + L('M280 150Q220 110 160 180M280 150Q340 110 400 180M280 150Q250 90 230 130M280 150Q310 90 330 130', '#38bdf8', 4, 'stroke-dasharray="3 6"') + drop(200, 150, 0.8, '#7dd3fc') + drop(360, 150, 0.8, '#7dd3fc'), { cls: 'pop', e: 3 });
    s.step(3, R(0, 200, 560, 100, '#7a5230') + [100, 200, 300, 400, 500].map((x) => L(`M${x} 220V190`, '#3f8f3a', 4) + P(`M${x} 200C${x - 14} 188 ${x - 22} 200 ${x - 14} 210Z M${x} 194C${x + 14} 182 ${x + 22} 194 ${x + 14} 204Z`, '#5fb85a')).join('') + chk(500, 56), { cls: 'up' });
  }],
  ['oblige', '#ec4899', '떨어뜨린 책을 주워 건네 주는 친절을 베푸는 호의', (s) => {
    s.sky('warm'); s.ground('stone', 250);
    s.step(1, person({ x: 400, y: 262, shirt: '#3b82f6', fc: 'shock', armL: [-30, 10] }) + [[300, 252], [330, 258], [350, 248]].map(([x, y], i) => R(x - 14, y - 10, 28, 12, ['#ef4444', '#22c55e', '#f59e0b'][i], 2, `transform="rotate(${i * 12} ${x} ${y})"`)).join(''), { cls: 'up' });
    s.step(2, person({ x: 130, y: 262, shirt: '#ec4899', hs: 'long', fc: 'smile', rot: 18, armR: [60, 30] }), { cls: 'up' });
    s.mv(3, 'translateX(-60px)', book(330, 214, '#ef4444', 40, 28) + book(330, 188, '#22c55e', 40, 22), { d: 0.8 });
    s.step(3, heart(300, 110, 0.9, '#ef4444') + sparks(300, 120, 30, 44, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['refute', '#dc2626', '날아온 주장 말풍선을 라켓으로 되받아쳐 반박한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#3b82f6', fc: 'smirk' }) + bubble(200, 90, 90, 50, '#fff', 'l') + L('M175 90H225M175 106H215', '#aab4c6', 4), { cls: 'up', e: 2 });
    s.step(2, person({ x: 420, y: 254, shirt: '#ef4444', hs: 'long', fc: 'angry', armL: [-50, -40] }) + `<g transform="translate(350 120) rotate(-30)">${R(-3, 0, 6, 40, '#8c5a2a', 2)}${E(0, -16, 22, 28, 'none', 'stroke="#dc2626" stroke-width="5"')}</g>` + bubble(280, 90, 90, 50, '#fff', 'l'), { cls: 'up', e: 2 });
    s.step(3, bubble(150, 90, 90, 50, '#fff', 'l') + cross(150, 90, 18) + person({ x: 420, y: 254, shirt: '#ef4444', hs: 'long', fc: 'cheer', armL: [-50, -40] }) + L('M200 130L120 110', '#dc2626', 3, 'stroke-dasharray="5 6"'), { cls: 'pop' });
  }],
  ['regressive', '#78716c', '앞으로 올라가던 계단을 되돌아 내려가 뒷걸음질 치는 퇴행', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-150, -30, 100, 30, '#cbd5e1', 3)}${R(-50, -60, 100, 60, '#cbd5e1', 3)}${R(50, -90, 100, 90, '#cbd5e1', 3)}</g>` + arrow(100, 150, 250, 100, '#16a34a', 5, 12), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(280 252)">${R(-150, -30, 100, 30, '#cbd5e1', 3)}${R(-50, -60, 100, 60, '#cbd5e1', 3)}${R(50, -90, 100, 90, '#cbd5e1', 3)}</g>` + person({ x: 420, y: 162, shirt: '#78716c', s: 0.7, fc: 'sad', legs: 'walk' }), { e: 2 });
    s.step(3, `<g transform="translate(280 252)">${R(-150, -30, 100, 30, '#cbd5e1', 3)}${R(-50, -60, 100, 60, '#cbd5e1', 3)}${R(50, -90, 100, 90, '#cbd5e1', 3)}</g>` + person({ x: 130, y: 222, shirt: '#78716c', s: 0.7, fc: 'sad', legs: 'walk' }) + arrow(420, 80, 160, 130, '#dc2626', 5, 12) + cross(500, 56), { });
  }],
  ['postulate', '#0891b2', '일단 맞다고 가정한 첫 블록 위에 논리의 탑을 쌓아 올린다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#0891b2', fc: 'think', armR: [50, -10] }) + qm(150, 90, '#0891b2', 1.2), { cls: 'up' });
    s.step(2, R(250, 220, 90, 32, '#0891b2', 4, 'stroke="#fff" stroke-width="3"') + flag(300, 218, '#facc15', 40), { cls: 'pop' });
    s.step(3, R(260, 188, 70, 30, '#38bdf8', 4, 'stroke="#fff" stroke-width="3"') + R(270, 158, 50, 28, '#7dd3fc', 4, 'stroke="#fff" stroke-width="3"') + R(280, 130, 30, 26, '#bae6fd', 4, 'stroke="#fff" stroke-width="3"') + chk(480, 56), { cls: 'up' });
  }],
  ['stroll', '#16a34a', '손잡고 공원길을 천천히 거닐며 산책하는 한가로운 걸음', (s) => {
    s.sky('dusk'); s.ground('grass', 246);
    s.step(1, L('M40 250Q200 230 340 250T540 240', '#a8946c', 16) + tree(110, 250, 1) + tree(470, 250, 1.1), { cls: 'up' });
    s.mv(2, 'translateX(-130px)', person({ x: 280, y: 262, shirt: '#16a34a', fc: 'smile', legs: 'walk', armR: [24, 20] }) + person({ x: 340, y: 262, shirt: '#ec4899', hs: 'long', fc: 'smile', legs: 'walk', armL: [-24, 20] }), { d: 1.4, ease: 'linear' });
    s.step(3, heart(280, 110, 0.9, '#ef4444') + sun(470, 70, 24, '#ffb347') + sparks(470, 70, 34, 48, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['validate', '#16a34a', '주차권을 기계에 대자 초록 표시가 떠 유효함이 확인된다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(60, 80, 90, 100, '#6b7384', 10) + R(76, 100, 58, 40, '#1f2937', 4) + paper(110, 220, 36, 50, 2, '#fde68a'), { cls: 'up' });
    s.mv(2, 'translate(70px,-110px)', paper(110, 150, 36, 50, 2, '#fde68a'), { d: 0.8, appear: false });
    s.step(3, R(76, 100, 58, 40, '#22c55e', 4) + L('M90 120L104 130L124 108', '#fff', 5) + chk(300, 150, 36) + sparks(300, 150, 48, 62, '#ffd34d', 10, 3), { cls: 'pop' });
  }],
];

function gift(x, y, k = 1, col = '#f43f5e') { return `<g transform="translate(${x} ${y}) scale(${k})">${R(-22, -22, 44, 38, col, 4)}${R(-4, -22, 8, 38, '#fff')}${R(-22, -6, 44, 8, '#fff')}</g>`; }
function trophyL(x, y, k = 1) { return `<g transform="translate(${x} ${y}) scale(${k})">${P('M-22 -52H22V-24Q22 -4 0 -4Q-22 -4 -22 -24Z', '#ffd34d', 'stroke="#d99a00" stroke-width="3"')}${R(-5, -4, 10, 14, '#d99a00')}${R(-18, 10, 36, 8, '#b45309', 2)}</g>`; }
