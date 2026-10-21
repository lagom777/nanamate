import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const babyL = (x, y, fc = 'cry') => person({ x, y, shirt: '#fde8c8', s: 0.6, fc, armL: [-14, -10], armR: [14, -10] });

export default [
  ['incorporate', '#2563eb', '흩어진 조각들이 하나의 큰 틀 안으로 합쳐져 통합된다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(180, 90, 200, 140, 'none', 10, 'stroke="#2563eb" stroke-width="6" stroke-dasharray="14 10"'), { cls: 'up' });
    s.mv(2, 'translate(-130px,30px)', R(196, 106, 80, 50, '#ef4444', 8), { d: 0.9 });
    s.mv(2, 'translate(130px,30px)', R(284, 106, 80, 50, '#22c55e', 8), { d: 0.9 });
    s.mv(2, 'translateY(100px)', R(196, 164, 168, 50, '#f59e0b', 8), { d: 0.9 });
    s.step(3, R(180, 90, 200, 140, 'none', 10, 'stroke="#2563eb" stroke-width="6"') + chk(480, 56), { cls: 'pop' });
  }],
  ['radical', '#7c3aed', '뿌리까지 파내 근본부터 뽑아내는 근본적인 방법', (s) => {
    s.sky('day'); s.ground('soil', 190);
    s.step(1, R(0, 190, 560, 110, '#9a6a3a') + L('M280 190V130', '#3f8f3a', 6) + P('M280 150C260 140 250 150 258 162Z M280 140C300 128 312 140 302 152Z', '#5fb85a'), { cls: 'up', e: 2 });
    s.step(2, person({ x: 140, y: 254, shirt: '#7c3aed', armR: [60, 10] }) + `<g transform="translate(200 190) rotate(30)">${R(-4, -60, 8, 56, '#8c6238', 3)}${P('M-14 -4H14L8 22H-8Z', '#8a93a5')}</g>` + P('M240 190L320 190L300 250L260 250Z', '#4a2f18'), { cls: 'up', e: 2 });
    s.step(3, L('M280 110V160', '#3f8f3a', 6) + L('M280 160Q250 190 230 230M280 160Q290 200 310 240M280 160V250M280 170Q260 200 250 250', '#c9a37a', 5) + P('M280 130C260 120 250 130 258 142Z M280 120C300 108 312 120 302 132Z', '#5fb85a') + person({ x: 140, y: 254, shirt: '#7c3aed', fc: 'cheer', armR: [14, -50] }) + chk(480, 56), { cls: 'up' });
  }],
  ['infer', '#0891b2', '언덕 너머 피어오르는 연기를 보고 불이 났다고 추론한다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, P('M200 250Q320 120 440 250Z', '#6fa85a') + `<g fill="#6b7280" fill-opacity=".8">${C(330, 110, 18)}${C(350, 90, 22)}${C(326, 70, 20)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 120, y: 262, shirt: '#0891b2', fc: 'think', armR: [16, -34] }) + qm(150, 100, '#0891b2', 1.2), { cls: 'up' });
    s.step(3, flame(330, 190, 0.9) + bulb(150, 100, 1) + arrow(200, 140, 290, 170, '#0891b2', 4, 10), { cls: 'pop' });
  }],
  ['revelation', '#f59e0b', '벽의 숨은 문이 열리며 눈부신 보물이 드러나 모두가 놀란다', (s) => {
    s.sky('dark'); s.ground('floor', 252);
    s.step(1, R(180, 60, 200, 192, '#8a8f99', 6, 'stroke="#5b606b" stroke-width="3"') + R(240, 120, 80, 132, '#6b7384', 4), { cls: 'up' });
    s.step(2, P('M240 120L240 252L280 240L280 132Z', '#4b5563') + `<path d="M280 132L320 120V252L280 240Z" fill="#ffe9a0"/>`, { cls: 'pop' });
    s.step(3, star(300, 190, 18) + coin(320, 220, 12) + sparks(300, 190, 50, 70, '#ffd34d', 12, 4) + person({ x: 110, y: 254, shirt: '#f59e0b', fc: 'shock', armL: [-26, -30], armR: [26, -30] }) + person({ x: 470, y: 254, shirt: '#ec4899', hs: 'long', fc: 'shock', armL: [-26, -30], armR: [26, -30] }), { cls: 'up' });
  }],
  ['aesthetic', '#ec4899', '붓으로 풍경을 그려 아름다움을 표현하는 미적인 감각', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(300 252)">${L('M-50 0L-30 -150M50 0L30 -150M0 0V-130', '#8c6238', 6)}${R(-80, -190, 160, 100, '#fff', 4, 'stroke="#c9a96a" stroke-width="6"')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(230 140) rotate(30)">${R(-3, -40, 6, 50, '#8c6238', 2)}${P('M-5 10H5L0 24Z', '#ec4899')}</g>` + P('M232 160L270 120L300 150L330 110L360 150V164H232Z', '#6fbf4a', 'fill-opacity=".9"') + sun(340, 90, 12, '#ffd34d'), { cls: 'wipe' });
    s.step(3, person({ x: 120, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armR: [40, -10] }) + `<g transform="translate(470 220)">${E(0, 0, 30, 20, '#f3d9b5', 'stroke="#c9a37a" stroke-width="3"')}${C(-10, -4, 5, '#ef4444')}${C(4, -8, 5, '#3b82f6')}${C(14, 2, 5, '#facc15')}</g>` + heart(300, 70, 0.8, '#ef4444') + sparks(300, 130, 100, 114, '#ffd34d', 10, 3), { cls: 'up' });
  }],
  ['avalanche', '#0ea5e9', '산비탈의 눈이 갈라져 나무를 삼키며 쏟아져 내리는 눈사태', (s) => {
    s.sky('gray'); s.ground('snow', 250);
    s.step(1, P('M0 250L180 90L340 250Z', '#94a3b8', 'stroke="#64748b" stroke-width="3"') + P('M130 130L180 90L230 140L200 148L180 130L160 150Z', '#fff') + tree(400, 252, 0.8) + tree(470, 254, 0.7), { cls: 'up' });
    s.step(2, L('M170 120L210 150', '#475569', 4) + P('M180 100L240 160L220 200L160 150Z', '#fff', 'stroke="#cbd5e1" stroke-width="3"'), { cls: 'pop' });
    s.step(3, P('M200 150Q320 190 420 250H220Z', '#fff', 'stroke="#cbd5e1" stroke-width="3"') + C(380, 220, 40, '#fff', 'fill-opacity=".8"') + C(440, 230, 36, '#fff', 'fill-opacity=".8"') + arrow(240, 120, 340, 180, '#0ea5e9', 6, 14), { cls: 'pop' });
  }],
  ['kin', '#16a34a', '할아버지 할머니부터 부모, 아이까지 이어진 가족과 친척', (s) => {
    s.sky('warm'); s.ground('grass', 246);
    s.step(1, person({ x: 220, y: 150, shirt: '#94a3b8', hair: '#e5e7eb', s: 0.55, sh: false, legs: 'hide', fc: 'smile' }) + person({ x: 340, y: 150, shirt: '#ec4899', hair: '#e5e7eb', hs: 'bun', s: 0.55, sh: false, legs: 'hide', fc: 'smile' }), { cls: 'up' });
    s.step(2, L('M280 160V190M160 190H400M160 190V200M400 190V200', '#16a34a', 4) + person({ x: 160, y: 240, shirt: '#3b82f6', s: 0.6, sh: false, legs: 'hide', fc: 'smile' }) + person({ x: 400, y: 240, shirt: '#f59e0b', hs: 'long', s: 0.6, sh: false, legs: 'hide', fc: 'smile' }), { cls: 'up' });
    s.step(3, [90, 230, 330, 470].map((x, i) => person({ x, y: 296, shirt: ['#22c55e', '#8b5cf6', '#ef4444', '#14b8a6'][i], s: 0.4, sh: false, legs: 'hide', fc: 'cheer' })).join('') + heart(280, 100, 1, '#ef4444'), { cls: 'up' });
  }],
  ['martial', '#7f1d1d', '투구와 방패를 들고 북소리에 맞춰 행진하는 군대의', (s) => {
    s.sky('dusk'); s.ground('sand', 246);
    s.step(1, person({ x: 150, y: 262, shirt: '#7f1d1d', pants: '#334155', fc: 'angry', hat: '<path d="M-18 -90Q0 -118 18 -90Z" fill="#aab4c6"/><rect x="-20" y="-92" width="40" height="7" fill="#8a93a5"/>', armL: [-20, 4], armR: [24, -50] }) + L('M176 120L176 262', '#8c6238', 5) + P('M170 118L176 100L182 118Z', '#cbd5e1'), { cls: 'up' });
    s.step(2, [260, 370].map((x) => person({ x, y: 262, shirt: '#7f1d1d', pants: '#334155', fc: 'angry', hat: '<path d="M-18 -90Q0 -118 18 -90Z" fill="#aab4c6"/><rect x="-20" y="-92" width="40" height="7" fill="#8a93a5"/>', armL: [-20, 4], armR: [24, -50] }) + L(`M${x + 26} 120L${x + 26} 262`, '#8c6238', 5) + P(`M${x + 20} 118L${x + 26} 100L${x + 32} 118Z`, '#cbd5e1')).join(''), { cls: 'up' });
    s.step(3, flag(480, 252, '#b91c1c', 130) + L('M100 290H440', '#a8742a', 3, 'stroke-dasharray="4 10"'), { cls: 'up' });
  }],
  ['niche', '#0d9488', '벽의 오목한 자리에 꼭 맞게 들어앉은 작은 꽃병', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(120, 60, 320, 192, '#d9c6a3', 6, 'stroke="#a89260" stroke-width="3"'), { cls: 'up' });
    s.step(2, P('M240 200V130Q280 90 320 130V200Z', '#7c6a4a', 'stroke="#6b5a3a" stroke-width="3"'), { cls: 'pop' });
    s.step(3, `<g transform="translate(280 200)">${P('M-16 -60H16L22 -24Q32 -4 16 0H-16Q-32 -4 -22 -24Z', '#60a5fa', 'stroke="#2563eb" stroke-width="3"')}</g>` + chk(480, 56), { cls: 'pop' });
  }],
  ['retrospect', '#6366f1', '걸어온 길을 뒤돌아보며 지난날을 회상한다', (s) => {
    s.sky('dusk'); s.ground('grass', 246);
    s.step(1, L('M60 250Q200 220 330 250', '#a8946c', 14) + person({ x: 340, y: 262, shirt: '#6366f1', fc: 'smile', rot: 0 }), { cls: 'up' });
    s.step(2, person({ x: 340, y: 262, shirt: '#6366f1', fc: 'think', armR: [-10, -40] }) + L('M310 150L290 140', '#6366f1', 3), { });
    s.step(3, E(170, 100, 100, 56, '#fff', 'stroke="#aab4c6" stroke-width="3"') + house(150, 120, 60, '#f3d9b5', '#c0392b', 0.7) + sun(210, 70, 12, '#ffd34d') + heart(110, 70, 0.5, '#ef4444') + L('M260 150L300 150', '#6366f1', 3, 'stroke-dasharray="4 6"'), { cls: 'pop' });
  }],
  ['reluctant', '#6b7280', '병원 문 앞에서 버티며 끌려가기 싫어 꼼짝 않는 아이', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, door(450, 252, 80, 150, '#7a461f') + R(420, 90, 60, 30, '#ef4444', 4) + L('M450 96V114M442 105H458', '#fff', 5), { cls: 'up' });
    s.step(2, person({ x: 330, y: 254, shirt: '#334155', fc: 'smile', armL: [70, -10] }), { cls: 'up' });
    s.step(3, person({ x: 180, y: 254, shirt: '#f59e0b', s: 0.75, fc: 'sad', rot: -16, armR: [70, -10], armL: [-6, 24] }) + L('M120 262H80M130 240H92', '#6b7280', 4) + drop(160, 170, 0.7), { cls: 'up' });
  }],
  ['instruct', '#2563eb', '칠판의 그림을 짚어 가며 학생들을 가르치는 교사', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(150, 50, 260, 130, '#2f6a3a', 8, 'stroke="#8c5a2a" stroke-width="8"') + C(210, 110, 22, 'none', 'stroke="#fff" stroke-width="4"') + P('M270 140L300 80L330 140Z', 'none', 'stroke="#fff" stroke-width="4"') + R(350, 90, 36, 36, 'none', 3, 'stroke="#fff" stroke-width="4"'), { cls: 'up' });
    s.step(2, person({ x: 450, y: 254, shirt: '#2563eb', fc: 'cheer', armL: [-100, -70] }) + L('M356 120L330 100', '#8c6238', 3, 'stroke-opacity="0"'), { cls: 'up' });
    s.step(3, [110, 190, 270].map((x, i) => person({ x, y: 296, shirt: ['#ef4444', '#22c55e', '#f59e0b'][i], s: 0.6, fc: 'smile' })).join('') + bulb(190, 190, 0.7) + chk(500, 56), { cls: 'up' });
  }],
  ['flatter', '#f59e0b', '치켜세우는 말로 상대의 머리를 풍선처럼 부풀려 비위를 맞춘다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 400, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: tie, fc: 'smirk' }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 150, y: 254, shirt: '#f59e0b', fc: 'cheer', rot: 6, armL: [-10, 24], armR: [20, 10] }) + bubble(250, 100, 100, 54, '#fff', 'l') + heart(230, 100, 0.4, '#ef4444') + star(270, 100, 9), { cls: 'up' });
    s.step(3, `<g transform="translate(400 254)">${shadow(0, 12, 26)}${R(-16, -64, 32, 60, '#1f2937', 12)}${C(0, -100, 34, '#ffd7b5')}${P('M-34 -102Q-34 -138 0 -136Q34 -138 34 -102Q18 -122 0 -122Q-18 -122 -34 -102Z', '#3a2418')}${C(-10, -104, 3.4, '#2a1a12')}${C(10, -104, 3.4, '#2a1a12')}${L('M-8 -90Q0 -82 8 -90', '#2a1a12', 3)}</g>` + sparks(400, 150, 50, 66, '#ffd34d', 8, 3), { });
  }],
  ['stir', '#92400e', '숟가락으로 컵 속을 휘휘 저어 우유와 커피를 섞는다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, table(280, 238, 280) + cup(280, 226, 3.4) + C(280, 140, 30, '#6b4a2a', 'fill-opacity="0"'), { cls: 'up' });
    s.step(1, `<g transform="translate(280 150)">${E(0, 0, 40, 10, '#7a4a2a')}${P('M-14 0Q0 -10 14 0Q0 8 -14 0Z', '#fff3d2')}</g>`, { e: 1 });
    s.step(2, `<g transform="translate(280 150)">${E(0, 0, 40, 10, '#7a4a2a')}${L('M-20 0Q0 -12 20 0', '#fff3d2', 5)}</g>` + `<g transform="translate(300 100) rotate(20)">${R(-3, -40, 6, 80, '#cbd5e1', 3)}${E(0, 44, 8, 12, '#cbd5e1')}</g>`, { e: 2 });
    s.step(3, `<g transform="translate(280 150)">${E(0, 0, 40, 10, '#a67a52')}${L('M-26 0Q-10 -8 0 0T26 0', '#d9b48a', 3)}</g>` + L('M200 100Q210 80 200 60M360 100Q370 80 360 60', '#cbd5e1', 4) + chk(480, 56), { cls: 'pop' });
  }],
  ['deprive', '#7f1d1d', '아이가 먹으려던 빵을 덩치 큰 사람이 빼앗아 들고 가 버린다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(268, 238, 140) + E(268, 230, 28, 6, '#fff', 'stroke="#d6dbe5" stroke-width="2"'), { cls: 'up' });
    s.step(1, bread(268, 220, 1.3), { cls: 'up', e: 1 });
    s.step(1, person({ x: 150, y: 254, s: 0.9, shirt: '#94a3b8', fc: 'smile', armR: [40, -6] }), { cls: 'up', e: 1 });
    s.mv(2, 'translateX(170px)', person({ x: 352, y: 254, s: 1.1, shirt: '#7f1d1d', fc: 'smirk', armL: [-44, -8] }) + bread(286, 192, 1.2), { d: 0.7, e: 2 });
    s.step(2, person({ x: 150, y: 254, s: 0.9, shirt: '#94a3b8', fc: 'shock', armR: [40, -6] }), { e: 2 });
    s.step(3, person({ x: 450, y: 254, s: 1.1, shirt: '#7f1d1d', fc: 'smirk', legs: 'walk', armR: [12, -58] }) + bread(481, 128, 1.2) + person({ x: 150, y: 254, s: 0.9, shirt: '#94a3b8', fc: 'cry', armR: [44, -22] }) + cross(70, 50, 18), {});
  }],
  ['disregard', '#6b7280', '친구의 경고를 못 들은 척 정지 표지판을 무시하고 걸어간다', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, `<g transform="translate(300 250)">${R(-3, -120, 6, 120, '#6b7384')}${P('M-26 -140L-10 -160H10L26 -140V-120L10 -104H-10L-26 -120Z', '#dc2626', 'stroke="#fff" stroke-width="3"')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 450, y: 262, shirt: '#16a34a', fc: 'shock', armL: [-40, -40] }) + bubble(450, 100, 70, 44, '#fff', 'r') + L('M450 88V104M450 112V114', '#ef4444', 6), { cls: 'up' });
    s.mv(3, 'translateX(-200px)', person({ x: 280, y: 262, shirt: '#6b7280', fc: 'neutral', legs: 'walk', armL: [16, -30], armR: [-16, -30] }), { d: 1.1, ease: 'linear' });
    s.step(3, cross(500, 56), { cls: 'pop' });
  }],
  ['domesticate', '#b45309', '숲의 늑대가 먹이를 받아먹다 목줄 찬 반려견으로 길들여진다', (s) => {
    s.sky('green'); s.ground('grass', 250);
    s.step(1, tree(90, 252, 1) + dog(150, 252, 1.8, '#8a8f99'), { cls: 'up', e: 2 });
    s.step(2, person({ x: 400, y: 262, shirt: '#b45309', fc: 'smile', armL: [-40, 20] }) + bone(340, 216), { cls: 'up', e: 2 });
    s.step(3, person({ x: 400, y: 262, shirt: '#b45309', fc: 'cheer', armL: [-40, 20] }) + dog(250, 252, 1.8, '#b9772e') + R(232, 190, 40, 6, '#ef4444', 3) + heart(300, 120, 0.8, '#ef4444'), { });
  }],
  ['invariable', '#0d9488', '날이 바뀌고 달력이 넘어가도 선은 평평하게 변하지 않는다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(70, 70, 420, 160, '#fff', 8, 'stroke="#b9c1cf" stroke-width="3"') + L('M100 150H460', '#0d9488', 6), { cls: 'up' });
    s.step(2, [150, 230, 310].map((x, i) => C(x, 150, 6, '#0d9488')).join('') + `<g transform="translate(450 50)">${R(-30, -26, 60, 52, '#fff', 6, 'stroke="#aab4c6" stroke-width="3"')}${R(-30, -26, 60, 16, '#ef4444', 6)}</g>`, { cls: 'pop' });
    s.step(3, [150, 230, 310, 390, 450].map((x) => C(x, 150, 6, '#0d9488')).join('') + R(250, 80, 60, 8, '#0d9488', 3) + R(250, 100, 60, 8, '#0d9488', 3), { cls: 'pop' });
  }],
  ['drastic', '#dc2626', '아래로 뚝 곧장 꺾이듯 갑작스럽고 극단적인 변화', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(70, 60, 420, 170, '#fff', 8, 'stroke="#b9c1cf" stroke-width="3"') + L('M100 100H280', '#16a34a', 6), { cls: 'up' });
    s.step(2, L('M280 100L310 200', '#dc2626', 7), { cls: 'wipe-d' });
    s.step(3, L('M310 200H460', '#dc2626', 6) + `<path d="M390 70L376 106H394L382 144L412 98H394Z" fill="#ffd34d"/>` + cross(500, 56) + thermo(130, 252, 0.05, '#3b82f6'), { cls: 'pop' });
  }],
  ['devour', '#ea580c', '햄버거 더미를 허겁지겁 입안 가득 쑤셔 넣으며 게걸스레 먹는다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, table(400, 238, 220) + [0, 1, 2].map((i) => `<g transform="translate(${360 + i * 36} 226)">${E(0, -10, 16, 12, '#d99a4e')}${R(-16, -12, 32, 6, '#8fd06a')}${R(-16, -6, 32, 6, '#7a3a1a')}</g>`).join(''), { cls: 'up', e: 2 });
    s.step(2, person({ x: 180, y: 254, shirt: '#ea580c', fc: 'cheer', armL: [30, -30], armR: [34, -26] }) + C(200, 170, 4, '#d99a4e') + C(150, 160, 3, '#d99a4e') + C(220, 190, 3, '#8fd06a'), { cls: 'up' });
    s.step(3, E(400, 226, 56, 8, '#fff', 'stroke="#d6dbe5" stroke-width="2"') + table(400, 238, 220) + `<g transform="translate(180 254)">${E(0, -34, 40, 44, '#ea580c')}${C(0, -84, 18, '#ffd7b5')}${P('M-19 -86Q-21 -108 0 -106Q21 -108 19 -86Q10 -98 0 -98Q-10 -98 -19 -86Z', '#3a2418')}${C(-6, -88, 2.4, '#2a1a12')}${C(6, -88, 2.4, '#2a1a12')}${L('M-6 -78Q0 -72 6 -78', '#2a1a12', 3)}</g>` + heart(250, 130, 0.7, '#ef4444'), { });
  }],
  ['patronize', '#ca8a04', '부유한 후원자가 화가에게 돈자루를 건네 작업을 돕는다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 140, y: 254, shirt: '#ec4899', hs: 'long', fc: 'think', armR: [40, -30] }) + `<g transform="translate(210 252)">${L('M-30 0L-10 -120M30 0L10 -120M0 0V-100', '#8c6238', 5)}${R(-44, -150, 88, 70, '#fff', 3, 'stroke="#c9a96a" stroke-width="4"')}</g>`, { cls: 'up' });
    s.mv(2, 'translateX(150px)', person({ x: 440, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: tie + crown(0, -98, 0.0).slice(0, 0), fc: 'smile', armL: [-40, 6] }), { d: 0.9 });
    s.mv(3, 'translateX(120px)', bag(340, 210, 1.3, '#d9772e') + coin(366, 200, 11), { d: 0.8 });
    s.step(3, heart(150, 120, 0.8, '#ef4444') + sparks(210, 120, 56, 72, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['subsequent', '#2563eb', '기관차 뒤로 객차가 차례로 이어져 따라오는 뒤이은', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, L('M20 250H540', '#6b7384', 6) + R(380, 190, 120, 54, '#ef4444', 8) + R(460, 160, 34, 32, '#dc2626', 4) + C(410, 250, 12, '#1f2937') + C(470, 250, 12, '#1f2937'), { cls: 'up' });
    s.step(2, R(250, 190, 110, 54, '#3b82f6', 8) + C(280, 250, 12, '#1f2937') + C(340, 250, 12, '#1f2937') + L('M360 218H380', '#6b7384', 4), { cls: 'wipe' });
    s.step(3, R(120, 190, 110, 54, '#22c55e', 8) + C(150, 250, 12, '#1f2937') + C(210, 250, 12, '#1f2937') + L('M230 218H250', '#6b7384', 4) + arrow(300, 120, 200, 120, '#2563eb', 5, 12), { cls: 'wipe' });
  }],
  ['substantial', '#a16207', '묵직한 금괴가 수북이 쌓인 상당한 양', (s) => {
    s.sky('sun'); s.ground('floor', 252);
    s.step(1, [[250, 252], [310, 252]].map(([x, y]) => P(`M${x - 28} ${y}L${x - 22} ${y - 28}H${x + 22}L${x + 28} ${y}Z`, '#ffd34d', 'stroke="#d99a00" stroke-width="3"')).join(''), { cls: 'up', e: 1 });
    s.step(2, [[190, 252], [250, 252], [310, 252], [370, 252], [220, 224], [280, 224], [340, 224]].map(([x, y]) => P(`M${x - 28} ${y}L${x - 22} ${y - 28}H${x + 22}L${x + 28} ${y}Z`, '#ffd34d', 'stroke="#d99a00" stroke-width="3"')).join(''), { e: 2 });
    s.step(3, [[160, 252], [220, 252], [280, 252], [340, 252], [400, 252], [190, 224], [250, 224], [310, 224], [370, 224], [220, 196], [280, 196], [340, 196], [250, 168], [310, 168]].map(([x, y]) => P(`M${x - 28} ${y}L${x - 22} ${y - 28}H${x + 22}L${x + 28} ${y}Z`, '#ffd34d', 'stroke="#d99a00" stroke-width="3"')).join('') + sparks(280, 120, 90, 106, '#ffd34d', 12, 3), { });
  }],
  ['suburb', '#16a34a', '도시 중심에서 길 따라 벗어난 한적한 교외의 주택가', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, building(80, 250, 50, 150, '#9fb4d0') + building(140, 250, 50, 110, '#8fa6c4') + building(40, 250, 40, 90, '#b9c8dc'), { cls: 'up' });
    s.step(2, L('M180 250Q300 240 540 250', '#8a93a5', 20), { cls: 'wipe' });
    s.step(3, house(300, 240, 70, '#f3d9b5', '#c0392b', 0.8) + house(400, 240, 70, '#cfe3f4', '#3b6aa0', 0.8) + house(500, 240, 70, '#e8d0e8', '#7c3aed', 0.8) + tree(350, 246, 0.5) + tree(450, 246, 0.5), { cls: 'up' });
  }],
  ['maneuver', '#0891b2', '장애물 콘 사이를 능숙하게 요리조리 빠져나가는 조종', (s) => {
    s.sky('day'); s.ground('road', 240);
    s.step(1, [150, 250, 350, 450].map((x) => P(`M${x - 12} 262L${x} 220L${x + 12} 262Z`, '#f97316', 'stroke="#fff" stroke-width="2"')).join(''), { cls: 'pop' });
    s.step(2, L('M60 250Q150 200 200 250T300 250T400 250T500 230', '#0891b2', 4, 'stroke-dasharray="6 8"'), { cls: 'wipe' });
    s.mv(3, 'translateX(-340px)', car(500, 240, '#3b82f6', 0.9), { d: 1.3, ease: 'linear' });
    s.step(3, chk(480, 56), { cls: 'pop' });
  }],
  ['sanction', '#dc2626', '국경 차단기가 내려져 화물 트럭이 못 들어가고 되돌아가는 제재', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, `<g transform="translate(330 250)">${R(-6, -90, 12, 90, '#6b7384')}</g>` + flag(60, 120, '#16a34a', 50) + flag(500, 120, '#2563eb', 50), { cls: 'up' });
    s.mv(2, 'translateX(-200px)', `<g transform="translate(250 250)">${R(-60, -50, 80, 50, '#3b82f6', 5)}${R(20, -38, 40, 38, '#2563eb', 5)}${C(-30, 4, 12, '#1f2937')}${C(40, 4, 12, '#1f2937')}${box(-30, -50, 30, 24)}</g>`, { d: 1, e: 2 });
    s.step(2, R(324, 140, 120, 10, '#ef4444', 3) + L('M340 140V170M380 140V170M420 140V170', '#fff', 4), { cls: 'wipe-d' });
    s.step(3, `<g transform="translate(180 250)">${R(-60, -50, 80, 50, '#3b82f6', 5)}${R(20, -38, 40, 38, '#2563eb', 5)}${C(-30, 4, 12, '#1f2937')}${C(40, 4, 12, '#1f2937')}${box(-30, -50, 30, 24)}</g>` + R(324, 140, 120, 10, '#ef4444', 3) + cross(500, 56) + arrow(250, 100, 180, 100, '#dc2626', 5, 12), { });
  }],
  ['awe', '#7c3aed', '거대한 폭포 앞에서 입을 벌리고 압도되어 경외감에 젖는다', (s) => {
    s.sky('night'); s.ground('stone', 250);
    s.step(1, P('M180 40H380L360 250H200Z', '#94a3b8', 'stroke="#64748b" stroke-width="3"') + R(240, 40, 80, 210, '#cfeaff', 4, 'fill-opacity=".9"') + L('M260 60V240M280 40V250M300 60V240', '#fff', 4, 'stroke-opacity=".8"'), { cls: 'up' });
    s.step(2, person({ x: 120, y: 262, shirt: '#7c3aed', s: 0.5, fc: 'shock', armL: [-14, -40], armR: [14, -40] }), { cls: 'up' });
    s.step(3, star(80, 60, 5, '#fff') + star(460, 50, 5, '#fff') + star(420, 100, 4, '#fff') + sparks(280, 140, 150, 166, '#c4b5fd', 12, 3), { cls: 'pop' });
  }],
  ['soothe', '#ec4899', '우는 아기를 토닥여 달래 새근새근 잠들게 한다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 360, y: 262, shirt: '#fde8c8', s: 0.6, fc: 'cry', armL: [-14, -10], armR: [14, -10] }) + drop(340, 206, 0.6) + drop(380, 210, 0.6), { cls: 'up', e: 2 });
    s.step(2, person({ x: 220, y: 254, shirt: '#ec4899', hs: 'long', fc: 'smile', armR: [100, 10] }) + L('M320 190Q340 180 360 190', '#ec4899', 3, 'stroke-dasharray="3 6"'), { cls: 'up' });
    s.step(3, person({ x: 360, y: 262, shirt: '#fde8c8', s: 0.6, fc: 'sleep', armL: [-14, 10], armR: [14, 10] }) + heart(300, 110, 1, '#ef4444') + moon(450, 70, 16, '#f7c98f'), { });
  }],
  ['disparity', '#475569', '으리으리한 저택과 허름한 오두막 사이의 큰 격차', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, house(130, 250, 170, '#f3d9b5', '#c0392b') + crown(130, 50, 0.9), { cls: 'up' });
    s.step(2, `<g transform="translate(430 250)">${R(-40, -40, 80, 40, '#a8774a', 3)}${P('M-50 -40L0 -66L50 -40Z', '#7a5a3a')}${R(-8, -26, 16, 26, '#3a2410', 2)}</g>`, { cls: 'up' });
    s.step(3, L('M240 120H340', '#475569', 4) + arrow(280, 120, 330, 120, '#475569', 4, 10) + arrow(300, 120, 250, 120, '#475569', 4, 10) + coin(130, 130, 0.1, 'none'), { cls: 'wipe' });
  }],
  ['evaporate', '#0ea5e9', '햇볕에 물웅덩이가 줄어들며 수증기가 되어 하늘로 오른다', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, E(280, 250, 110, 16, '#4fc3f7', 'stroke="#0284c7" stroke-width="2"') + sun(470, 70, 28, '#ffb347') + sparks(470, 70, 38, 54, '#ffd34d', 10, 4), { cls: 'up' });
    s.step(2, `<g fill="none" stroke="#bfe3fa" stroke-width="5" stroke-linecap="round"><path class="a-rise" d="M240 240Q252 220 240 200"/><path class="a-rise" style="animation-delay:-1s" d="M280 240Q292 220 280 200"/><path class="a-rise" style="animation-delay:-2s" d="M320 240Q332 220 320 200"/></g>` + E(280, 250, 70, 10, '#4fc3f7'), {});
    s.step(3, E(280, 252, 20, 4, '#4fc3f7') + cloud(280, 90, 1.6, '#fff') + L('M130 252Q150 246 170 252', '#a8742a', 3), { cls: 'up' });
  }],
  ['indecision', '#6366f1', '갈림길에서 어느 쪽으로 갈지 정하지 못하고 갈팡질팡한다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, P('M260 250L300 190L340 250Z', '#a8946c') + L('M300 190L180 130M300 190L420 130', '#a8946c', 18) + `<g transform="translate(300 250)">${R(-3, -140, 6, 90, '#8c5a2a')}${P('M3 -140H50L60 -128L50 -116H3Z M-3 -110H-50L-60 -98L-50 -86H-3Z', '#f59e0b')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 300, y: 262, shirt: '#6366f1', fc: 'think', armL: [-24, -20], armR: [24, -20] }), { cls: 'up' });
    s.step(3, qm(220, 100, '#6366f1', 1.2) + qm(380, 100, '#6366f1', 1.2) + drop(278, 170, 0.8) + L('M250 190L260 190M350 190L340 190', '#6366f1', 3), { cls: 'pop' });
  }],
  ['affordable', '#16a34a', '가격표를 보고 지갑 속 돈으로 넉넉히 살 수 있는 알맞은 값', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(400, 238, 200) + `<g transform="translate(400 226)">${P('M-24 0L-14 -40H14L24 0Z', '#60a5fa', 'stroke="#2563eb" stroke-width="3"')}${R(-20, -62, 40, 20, '#fff', 4, 'stroke="#aab4c6" stroke-width="2"')}${coin(-8, -52, 5)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 130, y: 254, shirt: '#16a34a', fc: 'think', armR: [30, -10] }) + coinStack(230, 252, 4) + coinStack(260, 252, 3), { cls: 'up' });
    s.step(3, person({ x: 130, y: 254, shirt: '#16a34a', fc: 'cheer', armR: [30, -10] }) + chk(500, 56) + L('M270 200Q330 170 380 200', '#16a34a', 3, 'stroke-dasharray="4 6"'), { });
  }],
  ['physiology', '#dc2626', '몸속에서 심장과 폐가 맞물려 움직이는 신체 기능', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-70, -200, 140, 200, '#fde8c8', 40, 'stroke="#d9a47c" stroke-width="4"')}${C(0, -170, 30, '#fde8c8', 'stroke="#d9a47c" stroke-width="4"')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(280 140)">${P('M-8 -20C-40 -30 -52 10 -40 40C-26 56 -10 40 -8 10Z', '#fda4af', 'stroke="#e11d48" stroke-width="2"')}${P('M8 -20C40 -30 52 10 40 40C26 56 10 40 8 10Z', '#fda4af', 'stroke="#e11d48" stroke-width="2"')}${heart(0, 50, 0.9, '#ef4444')}</g>`, { cls: 'pop' });
    s.step(3, `<g class="a-pulse">${sparks(280, 190, 40, 54, '#ef4444', 8, 3)}</g>` + L('M200 120L220 120L228 100L240 140L252 110L260 120H300', '#ef4444', 3, 'stroke-opacity="0"') + arrow(400, 150, 340, 160, '#dc2626', 4, 10) + chk(480, 56), { cls: 'pop' });
  }],
  ['confer', '#ca8a04', '시상식에서 메달을 목에 걸어 주며 영예를 수여한다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, R(180, 190, 200, 62, '#a8794a', 4) + person({ x: 130, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'smile', hat: tie, armR: [60, -10] }), { cls: 'up' });
    s.step(2, person({ x: 280, y: 190, shirt: '#16a34a', fc: 'cheer', legs: 'hide', sh: false }) + `<g transform="translate(200 150)">${L('M-8 -22L0 0L8 -22', '#ef4444', 4)}${C(0, 8, 9, '#ffd34d', 'stroke="#d99a00" stroke-width="2.4"')}</g>`, { cls: 'up' });
    s.step(3, `<g transform="translate(280 150)">${L('M-12 -10L0 12L12 -10', '#ef4444', 4)}${C(0, 18, 10, '#ffd34d', 'stroke="#d99a00" stroke-width="2.4"')}</g>` + [450, 500].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#ec4899'][i], s: 0.7, fc: 'cheer', armR: [14, -46] })).join('') + sparks(280, 100, 40, 56, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['curb', '#475569', '달려드는 개의 목줄을 당겨 멈추게 하는 억제', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, cat(470, 252, 1.4) + dog(300, 252, 1.8, '#b9772e'), { cls: 'up' });
    s.step(2, person({ x: 120, y: 262, shirt: '#475569', fc: 'angry', armR: [70, -20] }) + L('M190 210L270 200', '#ef4444', 3), { cls: 'up' });
    s.step(3, L('M370 170L350 160M380 190L360 188', '#475569', 4) + chk(500, 56) + L('M170 262H110', '#475569', 4), { cls: 'pop' });
  }],
  ['probe', '#2563eb', '탐사선이 행성 가까이 날아가 정보를 수집해 지구로 보낸다', (s) => {
    s.sky('night'); s.ground('dark', 300);
    s.step(1, C(420, 150, 70, '#d97706', 'stroke="#92400e" stroke-width="3"') + E(420, 150, 100, 18, 'none', 'stroke="#fbbf24" stroke-width="5"') + star(80, 50, 5, '#fff') + star(200, 100, 4, '#fff') + star(480, 40, 5, '#fff'), { cls: 'pop' });
    s.mv(2, 'translateX(-190px)', `<g transform="translate(280 150)">${R(-20, -14, 40, 28, '#cbd5e1', 6, 'stroke="#8a93a5" stroke-width="2"')}${R(-70, -8, 46, 16, '#2563eb', 2)}${R(24, -8, 46, 16, '#2563eb', 2)}${L('M0 -14V-34', '#aab4c6', 3)}${C(0, -36, 6, '#ef4444')}</g>`, { d: 1.2 });
    s.step(3, L('M280 130Q200 80 100 90', '#38bdf8', 3, 'stroke-dasharray="4 6"') + C(90, 90, 22, '#2a8fe0', 'stroke="#fff" stroke-width="2"') + P('M82 82C90 76 98 80 98 88C90 94 82 90 82 82Z', '#5fb85a') + chk(500, 56), { cls: 'pop' });
  }],
];

function bone(x, y) { return `<g transform="translate(${x} ${y})">${R(-20, -4, 40, 8, '#fff', 4, 'stroke="#d6dbe5" stroke-width="2"')}${C(-22, -6, 6, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${C(-22, 6, 6, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${C(22, -6, 6, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${C(22, 6, 6, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}</g>`; }
