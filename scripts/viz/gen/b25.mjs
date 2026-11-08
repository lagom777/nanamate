import { L, sparks, heart, tree, house, money, crown, bubble } from './kit.mjs';
import { person } from './kit.mjs';
import { cup, car } from './props.mjs';

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
];
