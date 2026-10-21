import { T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, heart } from './kit.mjs';
import { person } from './kit.mjs';

// 손그림이던 장면을 생성 장면으로 바꾼 것(2026-10). build.mjs 는 generated.json 에 있는 단어만 덮어쓴다.
export default [
  ['chronic', '#7c3aed', '봄이 가고 여름·겨울이 와도 허리 통증이 계속된다 — 만성의', (s) => {
    s.sky('day'); s.ground('grass', 240);
    const trunk = R(114, 150, 14, 92, '#6b4a2a');
    const crown3 = (c1, c2) => C(121, 128, 40, c1) + C(92, 150, 26, c2) + C(150, 150, 26, c2);
    const flower = (x, y) => [0, 1, 2, 3, 4].map((i) => C(x + Math.cos(i * 1.257) * 6, y + Math.sin(i * 1.257) * 6, 4.5, '#f472b6')).join('') + C(x, y, 3, '#fde047');
    const snowflake = (x, y, r = 9) => L(`M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}M${x - r * 0.7} ${y - r * 0.7}L${x + r * 0.7} ${y + r * 0.7}M${x + r * 0.7} ${y - r * 0.7}L${x - r * 0.7} ${y + r * 0.7}`, '#60a5fa', 2.6);
    const sunIcon = (x, y) => C(x, y, 9, '#f59e0b') + L(`M${x} ${y - 15}V${y - 12}M${x} ${y + 12}V${y + 15}M${x - 15} ${y}H${x - 12}M${x + 12} ${y}H${x + 15}`, '#f59e0b', 2.6);
    const ache = `<g class="a-pulse">${C(386, 182, 16, 'none', 'stroke="#ef4444" stroke-width="3"')}</g>` + L('M372 204L388 186L378 182L398 160', '#ef4444', 5);   // 통증 표시는 늘 보이게, 뒤의 고리만 퍼진다
    s.add(trunk);
    s.step(1, crown3('#fbcfe8', '#f9a8d4') + flower(104, 120) + flower(138, 110) + flower(150, 148) + flower(94, 154), { cls: 'pop', e: 1 });
    s.step(2, crown3('#4ade80', '#22c55e') + sun(470, 64, 26, '#fde047'), { cls: 'pop', e: 2 });
    s.step(3, R(0, 236, 560, 64, '#f1f5f9') + L('M121 150L96 112M121 140L150 104M121 130V90M106 124L88 120M136 120L156 124', '#6b4a2a', 7) + E(96, 110, 10, 4, '#fff') + E(150, 102, 10, 4, '#fff') + E(121, 88, 9, 4, '#fff') + `<g fill="#fff">${[60, 180, 250, 420, 500].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.6}s" d="M${x} 20c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>`, { cls: 'pop' });
    s.step(1, person({ x: 346, y: 250, shirt: '#7c3aed', fc: 'sad', armR: [10, 18] }), { cls: 'up', e: 2 });
    s.step(3, person({ x: 346, y: 250, shirt: '#7c3aed', fc: 'sad', armR: [10, 18] }) + R(330, 184, 34, 10, '#ef4444', 5) + R(352, 186, 9, 24, '#ef4444', 4), {});
    s.step(1, ache, {});
    s.step(1, flower(250, 36), { cls: 'pop' });
    s.step(2, arrow(268, 36, 306, 36, '#7c3aed', 3, 8) + sunIcon(330, 36), { cls: 'pop' });
    s.step(3, arrow(348, 36, 386, 36, '#7c3aed', 3, 8) + snowflake(410, 36), { cls: 'pop' });
  }],
];
