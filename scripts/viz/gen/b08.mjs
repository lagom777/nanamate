import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, tie } from './props.mjs';

const qmark = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const gem = (x, y, k = 1, fill = '#7dd3fc') => `<g transform="translate(${x} ${y}) scale(${k})">${P('M-26 -16L-14 -34H14L26 -16L0 20Z', fill, 'stroke="#0284c7" stroke-width="3" stroke-linejoin="round"')}${L('M-26 -16H26M-14 -34L-6 -16L0 20M14 -34L6 -16', '#fff', 2.4, 'stroke-opacity=".7"')}</g>`;
const domino = (x, y, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot} 14 0)">${R(0, -64, 28, 64, '#fff', 4, 'stroke="#475569" stroke-width="3"')}${C(14, -48, 4, '#475569')}${C(14, -16, 4, '#475569')}</g>`;

export default [
  ['liberate', '#16a34a', '열쇠로 새장 문을 열어 갇혀 있던 새를 자유롭게 풀어 준다', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, `<g transform="translate(200 250)">${R(-60, -130, 120, 8, '#8a6a2a', 3)}${R(-60, -10, 120, 10, '#8a6a2a', 3)}${[-48, -24, 0, 24, 48].map((x) => R(x - 2, -122, 4, 112, '#b88a2a')).join('')}${P('M-60 -130Q0 -190 60 -130Z', '#b88a2a')}</g>` + bird(200, 214, 2.4, '#f59e0b'), { cls: 'up', e: 2 });
    s.step(2, key(300, 190, 1.4) + L('M250 190H270', '#ffd34d', 3) + sparks(250, 160, 14, 26, '#ffd34d', 6, 3), { cls: 'pop', e: 2 });
    s.step(3, `<g transform="translate(200 250)">${R(-60, -130, 120, 8, '#8a6a2a', 3)}${R(-60, -10, 120, 10, '#8a6a2a', 3)}${[-48, -24, 0, 24].map((x) => R(x - 2, -122, 4, 112, '#b88a2a')).join('')}${P('M-60 -130Q0 -190 60 -130Z', '#b88a2a')}</g>`, {});
    s.mv(3, 'translate(-220px,120px)', bird(430, 90, 2.4, '#f59e0b') + sparks(430, 90, 40, 54, '#ffd34d', 8, 3), { d: 1 });
  }],
  ['contemplate', '#0ea5e9', '석양 호숫가에 앉아 턱을 괴고 깊이 생각에 잠긴다', (s) => {
    s.sky('dusk'); s.ground('water', 190);
    s.step(1, sun(420, 150, 40, '#ffb347') + L('M0 190Q30 182 60 190T120 190T180 190T240 190T300 190T360 190T420 190T480 190T540 190', '#ffe9c0', 3, 'stroke-opacity=".7"') + R(60, 188, 150, 12, '#8a6a2a'), { cls: 'up' });
    s.step(2, person({ x: 150, y: 212, shirt: '#0ea5e9', fc: 'think', legs: 'hide', armR: [16, -34], armL: [-6, 24], sh: false }), { cls: 'up' });
    s.step(3, C(210, 120, 5, '#fff') + C(236, 100, 8, '#fff') + E(320, 70, 66, 40, '#fff', 'fill-opacity=".9" stroke="#aab4c6" stroke-width="3"') + L('M300 70Q320 50 340 70', '#0ea5e9', 4) + star(300, 90, 6) + star(344, 90, 6), { cls: 'pop' });
  }],
  ['segregation', '#475569', '울타리가 세워져 서로 다른 무리가 갈라져 떨어지게 된다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [150, 230, 330, 410].map((x, i) => person({ x, y: 254, shirt: ['#ef4444', '#3b82f6', '#ef4444', '#3b82f6'][i], hs: i % 2 ? 'long' : 'short' })).join(''), { cls: 'up' });
    s.step(2, R(274, 60, 12, 200, '#6b7384', 4) + L('M270 90H290M270 130H290M270 170H290M270 210H290', '#475569', 3), { cls: 'wipe-d' });
    s.step(3, arrow(260, 150, 190, 150, '#475569', 5, 12) + arrow(300, 150, 370, 150, '#475569', 5, 12) + L('M90 110L100 120M460 110L450 120', '#475569', 3), { cls: 'wipe' });
    s.badge('x', 500, 50);
  }],
  ['consecutive', '#7c3aed', '도미노가 차례차례 쓰러지며 이어지는 연속', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    const xs = [90, 150, 210, 270, 330, 390, 450];
    s.step(1, xs.map((x) => domino(x, 252, 0)).join(''), { cls: 'up', e: 1 });
    s.step(2, xs.map((x, i) => domino(x, 252, i < 3 ? 74 : i === 3 ? 30 : 0)).join(''), { e: 2 });
    s.step(3, xs.map((x, i) => domino(x, 252, 74)).join('') + arrow(100, 80, 460, 80, '#7c3aed', 6, 16), { });
  }],
  ['norm', '#0d9488', '대부분이 가운데에 몰리는 종 모양의 평균적인 표준', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, [[90, 30], [150, 70], [210, 120], [280, 150], [350, 120], [410, 70], [470, 30]].map(([x, h]) => R(x - 26, 252 - h, 52, h, '#93c5fd', 4, 'stroke="#fff" stroke-width="3"')).join(''), { cls: 'up' });
    s.step(2, L('M280 70V252', '#0d9488', 4, 'stroke-dasharray="8 8"') + L('M60 232Q150 232 210 160T280 90T350 160T410 232Q470 236 500 236', '#0d9488', 5), { cls: 'wipe' });
    s.step(3, R(254, 102, 52, 150, '#0d9488', 4, 'stroke="#fff" stroke-width="3"') + star(280, 60, 12) , { cls: 'pop' });
    s.badge('check', 500, 50);
  }],
  ['drowsy', '#6366f1', '책상에서 꾸벅꾸벅 졸다 결국 잠들고 만다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(150, 190, 260, 14, '#a0602e', 5) + R(170, 204, 10, 50, '#7a461f') + R(380, 204, 10, 50, '#7a461f') + book(260, 190, '#3b82f6', 60, 10) + cup(350, 190, 1), { cls: 'up' });
    s.step(1, person({ x: 260, y: 254, shirt: '#6366f1', legs: 'hide', fc: 'yawn', armL: [-10, 28], armR: [10, 28], sh: false }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 260, y: 254, shirt: '#6366f1', legs: 'hide', fc: 'sleep', rot: 10, armL: [-10, 28], armR: [10, 28], sh: false }), { e: 2 });
    s.step(3, person({ x: 262, y: 254, shirt: '#6366f1', legs: 'hide', fc: 'sleep', rot: 22, armL: [-10, 28], armR: [10, 28], sh: false }) + moon(450, 90, 20, '#e8eaf6') + star(400, 60, 6) + star(480, 130, 5), { });
  }],
  ['primitive', '#92400e', '동굴 앞에서 창을 든 원시인이 모닥불을 피우며 사는 원시 시대', (s) => {
    s.sky('sun'); s.ground('sand', 244);
    s.step(1, P('M30 250Q80 90 220 120Q290 140 300 250Z', '#8a7a68', 'stroke="#5f5242" stroke-width="4"') + P('M90 250Q120 170 200 190Q240 200 250 250Z', '#2a2e3a'), { cls: 'up' });
    s.step(2, person({ x: 350, y: 258, shirt: '#b45309', pants: '#b45309', hair: '#2a1a12', hs: 'curly', fc: 'angry', armR: [30, -40] }) + L('M390 150L380 260', '#8c6238', 6) + P('M390 132L380 154L400 154Z', '#8a93a5'), { cls: 'up' });
    s.step(3, `<g transform="translate(470 252)">${L('M-24 0L24 -14M24 0L-24 -14', '#6b4a2a', 8)}${P('M-10 -12C-18 -28 -8 -40 0 -54C8 -40 18 -28 10 -12Z', '#ff9a1f')}${P('M-4 -12C-8 -22 -2 -30 0 -38C4 -30 8 -22 4 -12Z', '#ffd34d')}</g>`, { cls: 'pop' });
  }],
  ['compress', '#0891b2', '부푼 옷가지를 눌러 작은 가방에 꾹 눌러 담는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-110, -50, 220, 50, '#475569', 8)}${P('M-100 -50Q-80 -110 -30 -90Q0 -130 40 -92Q90 -110 100 -50Z', '#f472b6')}${P('M-60 -50Q-40 -90 0 -76Q40 -96 70 -50Z', '#60a5fa')}</g>`, { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(280 120)">${R(-100, -20, 200, 40, '#94a3b8', 10)}</g>` + arrow(280, 40, 280, 90, '#0891b2', 6, 14), { cls: 'wipe-d', e: 2 });
    s.step(3, `<g transform="translate(280 252)">${R(-110, -62, 220, 62, '#475569', 8)}${R(-110, -62, 220, 12, '#334155', 6)}${R(-12, -44, 24, 10, '#ffd34d', 3)}</g>` + arrow(100, 170, 150, 170, '#0891b2', 5, 12) + arrow(460, 170, 410, 170, '#0891b2', 5, 12), { cls: 'pop' });
    s.badge('check', 500, 50);
  }],
  ['steep', '#b45309', '거의 수직에 가까운 가파른 비탈을 밧줄에 매달려 오른다', (s) => {
    s.sky('day'); s.ground('grass', 252);
    s.step(1, P('M0 252L60 252L400 40L420 252Z', '#94a3b8', 'stroke="#64748b" stroke-width="3"') + P('M380 56L400 40L412 68Z', '#fff'), { cls: 'up' });
    s.step(2, L('M120 250L300 90', '#8c6238', 4) + [[160, 214], [220, 162], [270, 118]].map(([x, y]) => C(x, y, 5, '#6b4a2a')).join(''), { cls: 'wipe' });
    s.step(3, person({ x: 240, y: 178, shirt: '#b45309', fc: 'angry', rot: 36, rotO: '0 -30', legs: 'walk', armL: [30, -30], armR: [26, -46], sh: false }) + drop(210, 130, 0.8) + L('M90 250L100 230', '#b45309', 3), { });
  }],
  ['commemorate', '#7c3aed', '천을 걷어 기념 동상을 공개하고 꽃과 함께 기린다', (s) => {
    s.sky('day'); s.ground('stone', 246);
    s.step(1, R(220, 190, 120, 56, '#cfd6e2', 4) + R(210, 238, 140, 12, '#b8c2d4', 3) + P('M236 190L246 90H334L344 190Z', '#f4f1e6', 'stroke="#c4bda8" stroke-width="3"'), { cls: 'up', e: 2 });
    s.step(2, P('M230 190L240 80Q290 60 340 80L350 190Z', '#ef4444'), { e: 2 });
    s.mv(2, 'translateY(-20px)', R(100, 100, 14, 14, '#ef4444', 2, 'fill-opacity="0"'), { d: 0.2 });
    s.step(3, R(220, 190, 120, 56, '#cfd6e2', 4) + R(210, 238, 140, 12, '#b8c2d4', 3) + `<g transform="translate(280 190)">${R(-20, -80, 40, 80, '#e8e4d8', 6, 'stroke="#c4bda8" stroke-width="3"')}${C(0, -100, 20, '#e8e4d8', 'stroke="#c4bda8" stroke-width="3"')}${L('M-20 -60L-44 -30M20 -60L44 -30', '#e8e4d8', 9)}</g>` + sparks(280, 120, 70, 86, '#ffd34d', 10, 4) + C(150, 250, 7, '#ef4444') + C(170, 254, 7, '#f472b6') + C(410, 252, 7, '#facc15') + C(430, 250, 7, '#ef4444'), { cls: 'pop' });
  }],
  ['designate', '#2563eb', '여럿 가운데 한 사람을 손가락으로 지목해 대표로 지정한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [110, 210, 310, 410, 500].map((x, i) => person({ x, y: 254, shirt: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'][i], hs: i % 2 ? 'long' : 'short', s: 0.9 })).join(''), { cls: 'up' });
    s.step(2, arrow(310, 30, 310, 100, '#2563eb', 7, 18), { cls: 'wipe-d' });
    s.step(3, person({ x: 310, y: 254, shirt: '#2563eb', fc: 'cheer', s: 0.9, armL: [-20, -40], armR: [20, -40] }) + star(310, 74, 14) + sparks(310, 150, 60, 76, '#ffd34d', 8, 3), { });
  }],
  ['improvise', '#ea580c', '냉장고에 남은 재료를 즉석에서 섞어 뚝딱 요리를 만들어 낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(110 252)">${R(-50, -160, 100, 160, '#e5e9f0', 8, 'stroke="#aab4c6" stroke-width="3"')}${L('M-50 -90H50', '#aab4c6', 3)}${apple(-10, -92, 0.7)}${bottle(20, -92, 0.7, '#f59e0b')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(290 220)">${E(0, 0, 60, 16, '#475569')}${R(60, -4, 50, 8, '#475569', 3)}${apple(-20, -2, 0.6)}${C(10, -8, 8, '#f59e0b')}${C(-4, -14, 7, '#22c55e')}</g>` + person({ x: 360, y: 254, shirt: '#ea580c', fc: 'think', armL: [-40, 6] }), { cls: 'up' });
    s.step(3, `<g transform="translate(450 210)">${E(0, 20, 52, 12, '#fff', 'stroke="#d6dbe5" stroke-width="3"')}${E(0, 8, 36, 20, '#f59e0b')}${C(-10, 0, 8, '#ef4444')}${C(12, 4, 7, '#22c55e')}</g>` + sparks(450, 190, 50, 64, '#ffd34d', 8, 3), { cls: 'pop' });
    s.badge('check', 500, 50);
  }],
  ['executive', '#1e293b', '높은 사무실 책상에 앉아 도시를 내려다보며 서명하는 경영진', (s) => {
    s.sky('day'); s.ground('floor', 252);
    s.step(1, R(80, 60, 400, 150, '#cfeaff', 6, 'stroke="#fff" stroke-width="8"') + building(180, 210, 50, 110, '#9fb4d0') + building(300, 210, 60, 140, '#8fa6c4') + building(400, 210, 50, 90, '#9fb4d0'), { cls: 'up' });
    s.step(2, R(130, 200, 300, 14, '#4a3320', 5) + R(150, 214, 10, 40, '#3a2810') + R(400, 214, 10, 40, '#3a2810') + person({ x: 280, y: 214, shirt: '#1e293b', pants: '#1e293b', fc: 'smile', hat: tie, legs: 'hide', armR: [24, 12], sh: false }), { cls: 'up' });
    s.step(3, paper(360, 190, 60, 24, 0) + pencil(350, 190, 1, 30) + star(280, 54, 14) + crown(470, 90, 1), { cls: 'pop' });
  }],
  ['authentic', '#16a34a', '돋보기로 살펴 진짜 보석에는 합격, 가짜에는 탈락을 매긴다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(150, 190, 100, 14, '#a0602e', 4) + gem(200, 170, 1.4, '#7dd3fc') + R(310, 190, 100, 14, '#a0602e', 4) + gem(360, 170, 1.4, '#9ca3af'), { cls: 'up' });
    s.step(2, magnifier(200, 110, 1.2) + sparks(200, 150, 50, 64, '#ffd34d', 8, 3), { cls: 'pop' });
    s.step(3, chk(200, 80) + cross(360, 80) + sparks(200, 160, 50, 64, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['compel', '#dc2626', '몸집 큰 사람이 가리켜 시키자 어쩔 수 없이 책상으로 끌려간다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 400, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'angry', s: 1.3, armL: [-60, -20], hat: tie }), { cls: 'up' });
    s.step(1, person({ x: 230, y: 254, shirt: '#6b7280', fc: 'sad', rot: 8 }), { cls: 'up', e: 2 });
    s.step(2, arrow(340, 140, 250, 140, '#dc2626', 8, 18), { cls: 'wipe', e: 2 });
    s.mv(3, 'translateX(120px)', person({ x: 110, y: 254, shirt: '#6b7280', fc: 'sad', legs: 'walk', armL: [-6, 28], armR: [6, 28] }), { d: 0.9 });
    s.step(3, R(40, 190, 160, 12, '#a0602e', 4) + R(50, 202, 8, 50, '#7a461f') + R(180, 202, 8, 50, '#7a461f') + book(120, 190, '#3b82f6', 50, 14), { cls: 'up' });
  }],
  ['incline', '#0ea5e9', '평평하던 판이 한쪽으로 기울어 공이 비탈로 굴러 내려간다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(290, 170, 14, 82, '#8a6a2a', 3) + P('M260 252L320 252L290 170Z', '#a8774a'), { cls: 'up' });
    s.step(1, R(120, 170, 340, 14, '#c99a5b', 5, 'stroke="#8c6238" stroke-width="3"') + ball(190, 154, 16, '#ef4444'), { e: 1 });
    s.mv(2, 'rotate(22deg)', `<g transform="rotate(-22 290 177)">${R(120, 170, 340, 14, '#c99a5b', 5, 'stroke="#8c6238" stroke-width="3"')}</g>`, { d: 0.8, appear: true });
    s.step(2, ball(190, 154, 16, '#ef4444'), { e: 2 });
    s.mv(3, 'translate(-70px,-110px)', ball(420, 258, 16, '#ef4444'), { d: 0.9, ease: 'cubic-bezier(.5,0,.9,.6)' });
    s.step(3, arrow(180, 80, 280, 120, '#0ea5e9') + L('M120 180L130 200', '#0ea5e9', 3), { cls: 'wipe' });
  }],
  ['attain', '#f59e0b', '사다리를 한 칸씩 올라 마침내 꼭대기의 트로피에 이른다', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, L('M230 250L290 40M300 250L360 40', '#8c6238', 8) + [[238, 212], [246, 170], [254, 128], [262, 86]].map(([x, y]) => L(`M${x} ${y}L${x + 70} ${y}`, '#8c6238', 6)).join(''), { cls: 'up' });
    s.step(1, person({ x: 150, y: 262, shirt: '#f59e0b', legs: 'walk', s: 0.8 }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 290, y: 190, shirt: '#f59e0b', fc: 'angry', s: 0.7, legs: 'walk', armL: [20, -34], armR: [24, -50], sh: false }), { e: 2 });
    s.step(3, person({ x: 325, y: 80, shirt: '#f59e0b', fc: 'cheer', s: 0.7, legs: 'hide', armR: [30, -40], armL: [-6, 20], sh: false }) + `<g transform="translate(390 30)">${P('M-16 -26H16V-6Q16 6 0 6Q-16 6 -16 -6Z', '#ffd34d')}${R(-10, 6, 20, 8, '#d99a00', 2)}</g>` + sparks(390, 20, 28, 42, '#ffd34d', 8, 3), { });
  }],
  ['deficient', '#6b7280', '채워야 할 기준선보다 물이 모자란 부족한 상태', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-60, -160, 120, 160, '#fff', 8, 'fill-opacity=".6" stroke="#aab4c6" stroke-width="4"')}</g>` + L('M200 120H360', '#ef4444', 4, 'stroke-dasharray="10 8"'), { cls: 'up' });
    s.step(2, R(228, 200, 104, 44, '#4fc3f7', 4), { cls: 'wipe' });
    s.step(2, drop(280, 70, 1, '#4fc3f7', 'class="a-drip"'), {});
    s.step(3, arrow(280, 90, 280, 190, '#ef4444', 6, 14) + cross(420, 90), { cls: 'pop' });
  }],
  ['outlaw', '#7f1d1d', '복면 쓴 무법자가 수배 전단에 붙고 보안관이 쫓는다', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, person({ x: 150, y: 260, shirt: '#374151', pants: '#374151', fc: 'smirk', legs: 'walk', hat: '<path d="M-22 -92Q0 -118 22 -92Z" fill="#1f2937"/><rect x="-28" y="-94" width="56" height="7" rx="3" fill="#1f2937"/><rect x="-14" y="-78" width="28" height="9" fill="#111827"/>' }), { cls: 'up' });
    s.step(2, `<g transform="translate(330 150)">${R(-50, -70, 100, 130, '#e8d9b0', 3, 'stroke="#a89260" stroke-width="3"')}${C(0, -20, 26, '#ffd7b5', 'stroke="#a89260" stroke-width="2"')}${R(-18, -44, 36, 14, '#374151')}${R(-26, -14, 52, 12, '#e8d9b0', 0)}${L('M-34 30H34M-34 44H20', '#a89260', 3)}${C(0, -64, 4, '#6b7384')}</g>`, { cls: 'pop' });
    s.mv(3, 'translateX(-130px)', person({ x: 470, y: 260, shirt: '#2563eb', fc: 'angry', legs: 'walk', armL: [-30, -10], hat: '<path d="M-22 -92Q0 -118 22 -92Z" fill="#92400e"/><rect x="-28" y="-94" width="56" height="7" rx="3" fill="#92400e"/>' }) + star(470, 196, 8, '#facc15'), { d: 1 });
  }],
  ['consent', '#16a34a', '부모가 동의서에 서명해 주어 아이가 신나게 현장 학습을 간다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 130, y: 260, shirt: '#16a34a', s: 0.75, fc: 'neutral', armR: [30, -16] }) + paper(180, 200, 36, 46, 2), { cls: 'up' });
    s.step(2, person({ x: 320, y: 260, shirt: '#334155', fc: 'smile', armL: [-60, -8] }) + pencil(262, 196, 1, 40) + L('M244 210Q252 200 260 212', '#2563eb', 3), { cls: 'up' });
    s.step(3, `<g transform="translate(450 246)">${R(-60, -60, 120, 60, '#facc15', 10)}${[-40, -10, 20].map((x) => R(x, -48, 24, 20, '#cfeaff', 3)).join('')}${C(-34, 4, 12, '#1f2937')}${C(36, 4, 12, '#1f2937')}</g>` + person({ x: 130, y: 260, shirt: '#16a34a', s: 0.75, fc: 'cheer', armR: [14, -52] }) + chk(480, 50), { cls: 'up' });
  }],
  ['nuisance', '#7f1d1d', '자려는 사람 곁에서 앵앵거리는 모기가 짜증스러운 골칫거리', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, bed(280, 252) + person({ x: 276, y: 224, shirt: '#f59e0b', rot: -90, fc: 'sleep', legs: 'hide' }) + `<g transform="translate(300 210)"><path d="M-70 -10Q0 -34 80 -10V26H-70Z" fill="#5f6fd0"/></g>`, { cls: 'up', e: 2 });
    s.step(2, `<g class="a-bob" style="animation-duration:.4s"><g transform="translate(330 120)">${E(0, 0, 10, 5, '#2a2e3a')}${L('M-6 -4Q-14 -16 -2 -14M6 -4Q14 -16 2 -14', '#cbd5e1', 2.4)}${L('M10 0L24 4', '#2a2e3a', 2)}</g></g>` + L('M290 120Q330 90 370 130M300 140Q340 160 380 120', '#aab4c6', 3, 'stroke-dasharray="4 6"'), { cls: 'pop' });
    s.step(3, bed(280, 252) + person({ x: 276, y: 224, shirt: '#f59e0b', rot: -90, fc: 'angry', legs: 'hide' }) + `<g transform="translate(300 210)"><path d="M-70 -10Q0 -34 80 -10V26H-70Z" fill="#5f6fd0"/></g>` + C(230, 190, 5, '#ef4444') + L('M220 170L210 158M240 170L250 158', '#ef4444', 3), { });
  }],
  ['surpass', '#16a34a', '높이뛰기 선수가 지난 기록선을 훌쩍 넘어서 더 높이 오른다', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, L('M150 250V90M410 250V90', '#8a93a5', 6) + L('M150 140H410', '#ef4444', 5, 'stroke-dasharray="10 8"'), { cls: 'up' });
    s.step(2, person({ x: 100, y: 262, shirt: '#16a34a', legs: 'walk', fc: 'angry', s: 0.8, armL: [-20, -30], armR: [20, -30] }) + arrow(110, 190, 180, 140, '#16a34a', 4, 12), { cls: 'up', e: 2 });
    s.step(3, person({ x: 280, y: 100, shirt: '#16a34a', rot: 90, rotO: '0 -30', fc: 'cheer', s: 0.75, legs: 'hide', armL: [-26, 10], armR: [26, 10], sh: false }) + L('M150 100H410', '#16a34a', 4, 'stroke-dasharray="10 8"') + star(450, 70, 14) + R(120, 250, 320, 10, '#7a5230', 3, 'fill-opacity="0"'), { });
  }],
  ['correlation', '#0d9488', '기온이 오르면 아이스크림 판매도 함께 오르는 둘의 상관관계', (s) => {
    s.sky('sun'); s.ground('floor', 252);
    s.step(1, thermo(110, 250, 0.2, '#3b82f6') + [200, 260, 320].map((x, i) => R(x, 250 - 30, 40, 30, '#fbbf24', 4)).join(''), { cls: 'up', e: 1 });
    s.step(2, thermo(110, 250, 0.6, '#f59e0b') + R(200, 250 - 60, 40, 60, '#fbbf24', 4) + R(260, 250 - 90, 40, 90, '#fbbf24', 4) + R(320, 250 - 120, 40, 120, '#fbbf24', 4), { e: 2 });
    s.step(3, thermo(110, 250, 1, '#ef4444') + R(200, 250 - 80, 40, 80, '#fbbf24', 4) + R(260, 250 - 130, 40, 130, '#fbbf24', 4) + R(320, 250 - 180, 40, 180, '#fbbf24', 4) + L('M110 60Q220 60 340 50', '#0d9488', 4, 'stroke-dasharray="6 8"') + arrow(320, 60, 400, 60, '#0d9488', 4, 12) + sun(470, 70, 26, '#ffd34d'), { });
  }],
  ['aesthetics', '#ec4899', '그림 앞에서 아름다움에 넋을 잃고 감탄하는 미적 감상', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(180, 50, 200, 130, '#c9a96a', 6) + R(194, 64, 172, 102, '#cfeaff', 3), { cls: 'up' });
    s.step(2, P('M194 150L240 100L280 140L320 90L366 150V166H194Z', '#6fbf4a') + sun(330, 90, 14, '#ffd34d'), { cls: 'pop' });
    s.step(3, person({ x: 280, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armL: [-20, -30], armR: [20, -30] }) + heart(230, 200, 0.7, '#ef4444') + heart(330, 200, 0.7, '#ef4444') + sparks(280, 110, 140, 156, '#ffd34d', 12, 3), { cls: 'up' });
  }],
  ['earnest', '#f59e0b', '꽃을 들고 허리 숙여 진심을 담아 사과하는 진지한 태도', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 200, y: 254, shirt: '#f59e0b', fc: 'sad', armL: [10, 20], armR: [30, 10] }) + `<g transform="translate(236 214)">${C(0, 0, 10, '#ef4444')}${C(14, 6, 10, '#f472b6')}${C(-12, 8, 10, '#facc15')}${L('M0 12L-4 40', '#3a8a3a', 3)}</g>`, { cls: 'up', e: 2 });
    s.step(2, person({ x: 200, y: 254, shirt: '#f59e0b', fc: 'sad', rot: 24, rotO: '0 0', armL: [10, 20], armR: [30, 10] }), { e: 2 });
    s.step(3, person({ x: 400, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armL: [-20, -30] }) + heart(300, 120, 1.1, '#ef4444') + sparks(300, 120, 28, 42, '#ffd34d', 6, 3), { cls: 'up' });
    s.step(3, person({ x: 200, y: 254, shirt: '#f59e0b', fc: 'smile', armR: [30, 10] }), {});
  }],
  ['tremble', '#6366f1', '그림자 괴물 앞에서 무서워 온몸이 바들바들 떨린다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, person({ x: 170, y: 254, shirt: '#6366f1', fc: 'shock' }), { cls: 'up' });
    s.step(2, L('M120 140L106 140M120 160L104 164M220 140L234 140M220 160L236 164', '#6366f1', 4) + drop(146, 130, 0.8) + drop(196, 126, 0.8), { cls: 'pop' });
    s.step(3, `<g transform="translate(400 254)">${P('M-60 0Q-70 -90 0 -120Q70 -90 60 0Z', '#1f2937')}${C(-20, -80, 10, '#facc15')}${C(20, -80, 10, '#facc15')}${C(-20, -80, 4, '#111')}${C(20, -80, 4, '#111')}${P('M-30 -50L-16 -38L0 -52L16 -38L30 -50L24 -30H-24Z', '#fff')}</g>`, { cls: 'up' });
  }],
  ['slaughter', '#7f1d1d', '정육점에서 고기를 매달아 놓고 손질하는 푸줏간', (s) => {
    s.sky('wall'); s.ground('tile', 252);
    s.step(1, R(100, 150, 360, 14, '#a0602e', 4) + R(110, 164, 12, 90, '#7a461f') + R(430, 164, 12, 90, '#7a461f') + L('M80 70H480', '#8a93a5', 5), { cls: 'up' });
    s.step(2, [150, 260, 370].map((x) => L(`M${x} 70V90`, '#8a93a5', 4) + P(`M${x - 22} 90Q${x - 30} 130 ${x} 140Q${x + 30} 130 ${x + 22} 90Z`, '#c0392b', 'stroke="#7f1d1d" stroke-width="3"')).join(''), { cls: 'wipe-d' });
    s.step(3, person({ x: 280, y: 254, shirt: '#fff', pants: '#334155', fc: 'neutral', armR: [40, 20], armL: [-6, 28], hat: '<rect x="-16" y="-110" width="32" height="14" rx="4" fill="#fff"/>' }) + `<g transform="translate(340 218) rotate(-20)">${R(-30, -10, 60, 20, '#aab4c6', 3)}${R(26, -6, 30, 12, '#6b4a2a', 3)}</g>`, { cls: 'up' });
  }],
  ['deplete', '#0891b2', '물탱크의 물이 점점 빠져 바닥이 드러나 고갈된다', (s) => {
    s.sky('sun'); s.ground('sand', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-90, -170, 180, 170, '#e5e9f0', 10, 'stroke="#8a93a5" stroke-width="4"')}${R(-84, -164, 168, 158, '#4fc3f7', 6)}</g>` + R(188, 244, 20, 10, '#6b7384'), { cls: 'up', e: 1 });
    s.step(2, `<g transform="translate(280 252)">${R(-90, -170, 180, 170, '#e5e9f0', 10, 'stroke="#8a93a5" stroke-width="4"')}${R(-84, -90, 168, 84, '#4fc3f7', 6)}</g>` + drop(420, 190, 1) + arrow(380, 150, 440, 200, '#0891b2', 4, 10), { e: 2 });
    s.step(3, `<g transform="translate(280 252)">${R(-90, -170, 180, 170, '#e5e9f0', 10, 'stroke="#8a93a5" stroke-width="4"')}${R(-84, -20, 168, 14, '#4fc3f7', 6)}${L('M-60 -6L-20 -40L10 -8L40 -50', '#a8742a', 3)}</g>` + cross(480, 56), { });
  }],
  ['blunt', '#6b7280', '무딘 칼날은 토마토조차 자르지 못하고 눌러 뭉개기만 한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(150, 214, 260, 14, '#a0602e', 5) + C(280, 194, 28, '#ef4444') + L('M280 168Q286 160 294 164', '#3f8f3a', 4), { cls: 'up' });
    s.step(2, `<g transform="translate(280 130) rotate(8)">${R(-6, -60, 12, 60, '#8c6238', 4)}${P('M-6 0H6L70 0Q76 14 70 22L-6 22Z', '#c4c9d3', 'stroke="#8a93a5" stroke-width="3"')}</g>`, { cls: 'up' });
    s.step(3, E(280, 202, 34, 24, '#ef4444') + L('M240 150L226 140M320 150L334 140', '#6b7280', 4) + cross(470, 60), { cls: 'pop' });
  }],
  ['blow', '#f97316', '생일 케이크의 촛불을 훅 불어 꺼 버린다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(400 250)">${R(-56, -50, 112, 50, '#f8d6e0', 8)}${P('M-56 -50Q-40 -70 -20 -50Q0 -70 20 -50Q40 -70 56 -50Z', '#ff8aa8')}${[-24, 0, 24].map((x) => R(x - 3, -88, 6, 38, '#fff3d2')).join('')}</g>`, { cls: 'up' });
    s.step(1, [-24, 0, 24].map((x) => `<g class="a-bob" style="animation-duration:.5s">${P(`M${400 + x} 162C${394 + x} 154 ${396 + x} 148 ${400 + x} 142C${404 + x} 148 ${406 + x} 154 ${400 + x} 162Z`, '#ff9a1f')}</g>`).join(''), { e: 2 });
    s.step(2, person({ x: 170, y: 254, shirt: '#f97316', fc: 'shock', s: 1 }) + L('M200 150Q250 140 300 150M200 164Q250 160 310 168M200 136Q240 124 290 132', '#9fd8ff', 4, 'stroke-dasharray="1 0"'), { cls: 'up' });
    s.step(3, [-24, 0, 24].map((x) => L(`M${400 + x} 140Q${394 + x} 126 ${402 + x} 112`, '#cbd5e1', 3)).join('') + sparks(400, 100, 60, 76, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['resilience', '#16a34a', '바닥에 부딪혀 납작해졌다가도 탄력으로 다시 튀어 오르는 회복력', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, ball(280, 70, 22, '#f59e0b') + L('M280 110V130', '#aab4c6', 3, 'stroke-dasharray="4 6"'), { cls: 'pop', e: 1 });
    s.step(2, E(280, 238, 34, 14, '#f59e0b') + L('M230 232L214 230M330 232L346 230', '#aab4c6', 3), { e: 2 });
    s.mv(3, 'translateY(150px)', ball(280, 70, 22, '#f59e0b'), { d: 0.9, ease: 'cubic-bezier(.2,.6,.4,1)' });
    s.step(3, arrow(330, 170, 330, 90, '#16a34a', 6, 14) + sparks(280, 70, 34, 48, '#ffd34d', 8, 3), { cls: 'wipe' });
    s.badge('check', 500, 50);
  }],
];
