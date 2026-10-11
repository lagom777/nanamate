import { T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, note, piano, stamp, coinStack, bulb } from './props.mjs';

const tie = '<path d="M-6 -64L0 -58L6 -64L2 -56L0 -40L-2 -56Z" fill="#ef4444"/><path d="M-8 -64L0 -52L8 -64" fill="none" stroke="#fff" stroke-width="3"/>';

export default [
  ['commodity', '#d97706', '시장 가판대에 놓인 상품을 손님이 돈을 내고 산다', (s) => {
    s.sky('warm'); s.ground('floor', 250);
    s.step(1, table(300, 236, 300) + sack(210, 226) + crate(270, 226) + bottle(330, 226, 1) + bag(385, 226, 1), { cls: 'up' });
    s.step(1, person({ x: 100, y: 252, shirt: '#3b82f6', armR: [40, 6] }), { cls: 'up' });
    s.mv(2, 'translate(-70px,0px)', coin(190, 190, 13), { d: 0.8 });
    s.step(3, coinStack(300, 222, 3), { cls: 'pop' });
    s.step(3, bag(158, 218, 0.9), { cls: 'pop' });
    s.badge('check', 500, 60);
  }],
  ['compose', '#8b5cf6', '피아노 앞에서 음을 모아 곡을 짓는다', (s) => {
    s.sky('cool'); s.ground('floor', 250);
    s.step(1, piano(350, 216), { cls: 'up' });
    s.step(1, person({ x: 220, y: 252, shirt: '#8b5cf6', hs: 'long', hair: '#6b3a1a', armR: [34, 16], armL: [30, 22] }), { cls: 'up' });
    s.step(2, `<g class="a-rise">${note(300, 160)}</g><g class="a-rise" style="animation-delay:-1s">${note(350, 150, '#8b5cf6')}</g><g class="a-rise" style="animation-delay:-2s">${note(400, 160, '#ec4899')}</g>`);
    s.step(3, paper(480, 110, 100, 120, 0) + L('M440 80H520M440 94H520M440 108H520M440 122H520M440 136H520', '#aab4c6', 2) + note(462, 100) + note(484, 86, '#8b5cf6') + note(506, 112), { cls: 'pop' });
  }],
  ['resident', '#0d9488', '마을 집에 사는 주민이 문 앞에 서고 이웃도 손을 흔든다', (s) => {
    s.sky('day'); s.ground('grass', 236);
    s.step(1, house(130, 240, 110, '#f3d9b5', '#c0392b') + house(300, 240, 120, '#cfe3f4', '#3b6aa0') + house(470, 240, 110, '#e8d0e8', '#7c3aed'), { cls: 'up' });
    s.step(2, person({ x: 300, y: 262, shirt: '#14b8a6', fc: 'cheer', armR: [26, -40] }), { cls: 'up' });
    s.step(3, person({ x: 180, y: 268, shirt: '#f59e0b', hs: 'long', fc: 'cheer', armL: [-26, -40], s: 0.85 }) + person({ x: 420, y: 268, shirt: '#ec4899', fc: 'cheer', armR: [26, -40], s: 0.85 }), { cls: 'up' });
    s.step(3, heart(300, 86, 1.2, '#ef4444'), { cls: 'pop', dl: 0.3 });
  }],
  ['moral', '#16a34a', '주운 지갑을 주인에게 돌려주는 올바른 행동', (s) => {
    s.sky('day'); s.ground('grass', 236);
    s.step(1, R(240, 242, 34, 20, '#8a5a2a', 4, 'stroke="#5a3a1a" stroke-width="2"') + R(256, 248, 8, 8, '#ffd34d', 2), { e: 1 });
    s.step(1, person({ x: 150, y: 256, shirt: '#16a34a', armR: [34, 8] }), { cls: 'up' });
    s.mv(2, 'translate(-140px,64px)', R(358, 188, 34, 20, '#8a5a2a', 4, 'stroke="#5a3a1a" stroke-width="2"') + R(374, 194, 8, 8, '#ffd34d', 2), { d: 1 });
    s.step(2, person({ x: 430, y: 256, shirt: '#ef6a3a', fc: 'sad', armL: [-34, -12], hs: 'long', hair: '#6b3a1a' }), { cls: 'up', e: 2 });
    s.step(3, person({ x: 430, y: 256, shirt: '#ef6a3a', fc: 'cheer', armL: [-34, -12], hs: 'long', hair: '#6b3a1a' }));
    s.step(3, heart(150, 140, 1.1, '#ef4444') + sparks(150, 140, 22, 36, '#ffd34d', 6, 4), { cls: 'pop', dl: 0.3 });
    s.badge('check', 500, 60);
  }],
  ['recall', '#6366f1', '생각에 잠긴 사람이 지난 기억을 떠올린다', (s) => {
    s.sky('cool'); s.ground('floor', 250);
    s.step(1, person({ x: 150, y: 252, shirt: '#6366f1', fc: 'think', armR: [16, -34] }), { cls: 'up' });
    s.step(2, C(210, 152, 5, '#fff', 'stroke="#aab4c6" stroke-width="2"') + C(236, 132, 8, '#fff', 'stroke="#aab4c6" stroke-width="2"') + E(350, 100, 110, 66, '#fff', 'stroke="#aab4c6" stroke-width="3"'), { cls: 'pop' });
    s.step(3, G(house(330, 140, 90, '#f3d9b5', '#c0392b', 0.8) + sun(410, 66, 14, '#ffd34d') + heart(290, 70, 0.5, '#ef4444')), { cls: 'pop' });
    s.step(3, sparks(350, 100, 78, 92, '#ffd34d', 8, 4), { dl: 0.3 });
  }],
  ['mass', '#78716c', '흩어진 조각들이 모여 하나의 큰 덩어리가 된다', (s) => {
    s.sky('wall'); s.ground('floor', 250);
    s.step(1, G(C(120, 220, 14, '#9a8a78') + C(190, 200, 10, '#8a7a68') + C(420, 214, 12, '#9a8a78') + C(480, 190, 9, '#8a7a68') + C(150, 160, 8, '#9a8a78') + C(450, 150, 10, '#8a7a68')), { cls: 'up', e: 2 });
    s.step(2, arrow(150, 215, 232, 225, '#78716c') + arrow(410, 214, 330, 224, '#78716c'), { cls: 'wipe', e: 2 });
    s.step(3, `<g transform="translate(280 250)">${shadow(0, 2, 110, 0.22)}<path d="M-96 0Q-104 -60 -50 -84Q-20 -112 28 -92Q92 -80 98 -26Q100 0 70 2Z" fill="#8a7a68" stroke="#6a5a48" stroke-width="3"/><path d="M-60 -44Q-40 -76 0 -80" stroke="#fff" stroke-opacity=".4" stroke-width="7" stroke-linecap="round" fill="none"/></g>`, { cls: 'pop' });
  }],
  ['awful', '#65a30d', '썩은 음식 냄새에 코를 막고 얼굴을 찌푸린다', (s) => {
    s.sky('green'); s.ground('floor', 250);
    s.step(1, table(180, 236, 200) + `<g transform="translate(180 226)">${apple(0, 0, 1.3, '#7a5a2a')}${C(-6, -16, 3, '#6fbf4a')}${C(6, -10, 3, '#6fbf4a')}</g>`, { cls: 'up' });
    s.step(2, `<g fill="none" stroke="#84cc16" stroke-width="5" stroke-linecap="round"><path class="a-rise" d="M160 190Q172 176 160 162Q148 148 160 134"/><path class="a-rise" style="animation-delay:-1s" d="M190 190Q202 176 190 162Q178 148 190 134"/><path class="a-rise" style="animation-delay:-2s" d="M220 190Q232 176 220 162Q208 148 220 134"/></g>` + C(230, 150, 3.4, '#2a2e3a') + C(150, 140, 3.4, '#2a2e3a'));
    s.step(3, person({ x: 400, y: 252, shirt: '#65a30d', fc: 'sick', skin: '#d8e8a0', armR: [14, -26], armL: [-8, 28] }), { cls: 'up' });
    s.badge('x', 500, 60);
  }],
  ['grant', '#2563eb', '서류에 승인 도장을 찍고 지원금을 내준다', (s) => {
    s.sky('wall'); s.ground('floor', 250);
    s.step(1, table(280, 236, 280), { cls: 'up' });
    s.step(1, person({ x: 120, y: 252, shirt: '#334155', armR: [38, 12] }) + person({ x: 440, y: 252, shirt: '#ef6a3a', hs: 'long', hair: '#6b3a1a', fc: 'smile' }), { cls: 'up' });
    s.step(1, R(245, 204, 70, 22, '#fff', 3, 'stroke="#b9c1cf" stroke-width="2"'));
    s.mv(2, 'translateY(-70px)', stamp(280, 206, 1), { d: 0.5, ease: 'cubic-bezier(.6,0,.9,1)' });
    s.step(2, C(280, 214, 9, '#ef4444', 'fill-opacity=".8"'), { cls: 'pop', dl: 0.45 });
    s.mv(3, 'translateX(-160px)', bag(380, 222, 1), { d: 0.9 });
    s.step(3, person({ x: 440, y: 252, shirt: '#ef6a3a', hs: 'long', hair: '#6b3a1a', fc: 'cheer', armL: [-20, -20] }), { cls: '' });
    s.badge('check', 500, 60);
  }],
  ['institute', '#0f766e', '기둥 달린 큰 건물이 세워지고 사람들이 드나드는 기관', (s) => {
    s.sky('day'); s.ground('stone', 244);
    s.step(1, R(100, 232, 360, 12, '#cfd6e2', 2) + R(120, 220, 320, 12, '#dfe5ee', 2), { cls: 'up' });
    s.step(2, G([0, 1, 2, 3, 4].map((i) => R(150 + i * 62, 130, 22, 90, '#f4f6fa', 3, 'stroke="#c4cad6" stroke-width="2"')).join('')), { cls: 'up' });
    s.step(2, P('M120 130H440L280 62Z', '#e4e9f2', 'stroke="#c4cad6" stroke-width="3"') + C(280, 108, 12, '#0f766e'), { cls: 'up', dl: 0.2 });
    s.step(3, flag(280, 62, '#0f766e', 40) + person({ x: 90, y: 268, shirt: '#334155', s: 0.8, legs: 'walk' }) + person({ x: 480, y: 268, shirt: '#f59e0b', hs: 'long', s: 0.8, legs: 'walk' }), { cls: 'up' });
  }],
  ['ashamed', '#e11d48', '실수를 하자 사람들이 지켜보고 얼굴이 빨개져 손으로 가린다', (s) => {
    s.sky('wall'); s.ground('floor', 250);
    s.step(1, person({ x: 280, y: 252, shirt: '#f59e0b', fc: 'shock', armL: [-14, 28], armR: [14, 28] }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 110, y: 252, shirt: '#3b82f6', fc: 'smirk', armR: [40, -8] }) + person({ x: 450, y: 252, shirt: '#14b8a6', hs: 'long', fc: 'smirk', armL: [-40, -8] }), { cls: 'up' });
    s.step(3, person({ x: 280, y: 252, shirt: '#f59e0b', fc: 'shy', armL: [20, -28], armR: [-20, -28] }));
    s.step(3, sparks(280, 170, 26, 40, '#ef4444', 8, 4) + drop(300, 130, 0.8, '#8fd0ff'), { cls: 'pop' });
  }],
  ['formal', '#1e293b', '편한 차림에서 정장과 나비넥타이를 갖춘 격식 있는 모습으로', (s) => {
    s.sky('wall'); s.ground('carpet', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#f59e0b', pants: '#6b7a99', hat: hatCap('#3b82f6') }), { cls: 'up' });
    s.step(2, arrow(220, 190, 340, 190, '#1e293b', 6, 16), { cls: 'wipe' });
    s.step(3, person({ x: 420, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'smile', hat: tie, armL: [-10, 30], armR: [10, 30] }), { cls: 'up' });
    s.step(3, star(480, 90, 12, '#ffd34d') + star(350, 80, 8, '#ffd34d'), { cls: 'pop', dl: 0.3 });
  }],
  ['rite', '#7c3aed', '촛불 제단 앞에서 사람들이 팔을 들고 치르는 의식', (s) => {
    s.sky('night'); s.ground('stone', 246);
    s.step(1, R(240, 206, 80, 40, '#7a461f', 3) + R(236, 198, 88, 10, '#a8794a', 3) + R(262, 168, 8, 30, '#fff3d2') + R(290, 168, 8, 30, '#fff3d2') + `<g class="a-bob" style="animation-duration:.5s">${P('M266 166C260 156 264 150 266 144C270 150 272 156 266 166Z', '#ff9a1f')}${P('M294 166C288 156 292 150 294 144C298 150 300 156 294 166Z', '#ff9a1f')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 140, y: 262, shirt: '#7c3aed', pants: '#7c3aed', hs: 'bald', armL: [-24, -34], armR: [24, -34] }) + person({ x: 420, y: 262, shirt: '#7c3aed', pants: '#7c3aed', hs: 'bald', armL: [-24, -34], armR: [24, -34] }), { cls: 'up' });
    s.step(3, `<g fill="#ffe9a0">${star(280, 100, 7)}${star(200, 130, 5)}${star(360, 126, 5)}</g>` + `<circle cx="280" cy="160" r="80" fill="#ffe9a0" fill-opacity=".18"/>`, { cls: 'pop' });
  }],
];
