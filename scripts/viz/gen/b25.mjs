import { R, E, P, L, sparks, heart, tree, house, money, crown, bubble, arrow, star, drop } from './kit.mjs';
import { person } from './kit.mjs';
import { cup, car, bottle, thermo } from './props.mjs';

/* 화분에 심은 약초(잎이 여러 장) */
const herb = (x, y) => `<g transform="translate(${x} ${y})">${P('M-26 -30H26L20 0H-20Z', '#b45309')}${R(-30, -36, 60, 9, '#92400e', 3)}` +
  L('M0 -36V-96M0 -58Q-20 -66 -30 -84M0 -70Q20 -78 30 -94', '#15803d', 4) +
  E(-30, -86, 14, 7, '#22c55e', 'transform="rotate(-35 -30 -86)"') + E(30, -96, 14, 7, '#22c55e', 'transform="rotate(30 30 -96)"') + E(0, -100, 9, 15, '#16a34a') +
  E(-14, -64, 10, 6, '#4ade80', 'transform="rotate(-20 -14 -64)"') + E(16, -76, 10, 6, '#4ade80', 'transform="rotate(25 16 -76)"') + `</g>`;
/* 초록 약병(흰 십자) */
const medBottle = (x, y, k = 1.6) => bottle(x, y, k, '#22c55e') + R(x - 8 * k / 1.6, y - 31 * k / 1.6, 16 * k / 1.6, 5 * k / 1.6, '#fff', 1) + R(x - 2.5 * k / 1.6, y - 37 * k / 1.6, 5 * k / 1.6, 17 * k / 1.6, '#fff', 1);

// 새로 넣은 단어(2026-11). build.mjs 는 generated.json 에 있는 단어만 덮어쓴다.
export default [
  ['contentment', '#16a34a', '작은 집 앞에서 차 한 잔을 들고, 큰 차·돈·왕관이 떠올라도 지금으로 충분하다며 눈을 감고 미소 짓는 만족', (s) => {
    s.sky('warm'); s.ground('grass', 240);
    s.step(1, house(110, 240, 120, '#f3dfc1', '#16a34a') + tree(484, 240, 0.9), { cls: 'up' });
    s.step(1, person({ x: 300, y: 242, shirt: '#16a34a', fc: 'smile', armR: [26, -2] }) + cup(334, 196, 1.1), { cls: 'up', e: 2 });
    s.step(2, bubble(424, 92, 172, 92, '#fff', 'l') + car(384, 104, '#ef4444', 0.55) + crown(456, 86, 0.75) + money(458, 118, 40), { cls: 'pop', e: 2 });
    s.step(3, person({ x: 300, y: 242, shirt: '#16a34a', fc: 'sleep', armR: [26, -2] }) + cup(334, 196, 1.1) + L('M326 160Q332 148 326 136M342 160Q348 148 342 136', '#cbd5e1', 3) + heart(300, 98, 0.9, '#ef4444') + sparks(300, 96, 30, 42, '#ffd34d', 6, 3));
    s.badge('check', 500, 56);
  }],
  ['medicinal', '#15803d', '열이 나 아픈 사람, 화분의 약초가 약병의 약이 되고, 그 약을 먹고 열이 내려 건강해진다 — 약효가 있는', (s) => {
    s.sky('mint'); s.ground('floor', 240);
    s.step(1, person({ x: 130, y: 242, shirt: '#64748b', fc: 'sick', armL: [-6, 26], armR: [6, 26] }) + drop(104, 146, 0.7) + drop(160, 150, 0.6) + thermo(196, 232, 0.9, '#ef4444'), { cls: 'up', e: 2 });
    s.step(2, herb(330, 240) + arrow(372, 180, 418, 180, '#15803d', 4, 10) + medBottle(456, 240), { cls: 'up' });
    s.step(3, person({ x: 130, y: 242, shirt: '#15803d', fc: 'cheer', armL: [-26, -30], armR: [30, -6] }) + medBottle(176, 186, 0.9) + thermo(214, 232, 0.3, '#3b82f6') + star(92, 118, 9) + star(170, 104, 8) + star(130, 92, 7));
    s.badge('check', 500, 56);
  }],
];
