import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, tie } from './props.mjs';

const qmark = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const grape = (x, y, r = 10, col = '#7c3aed') => C(x, y, r, col, 'stroke="#4c1d95" stroke-width="1.6"') + C(x - r * 0.3, y - r * 0.3, r * 0.3, '#fff', 'fill-opacity=".4"');
const trefoil = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${C(0, 0, 40, '#facc15', 'stroke="#2a2e3a" stroke-width="4"')}${[0, 120, 240].map((a) => P('M0 0L-17 -29A34 34 0 0 1 17 -29Z', '#2a2e3a', `transform="rotate(${a} 0 0) translate(0 -2)"`)).join('')}${C(0, 0, 7, '#facc15', 'stroke="#2a2e3a" stroke-width="3"')}</g>`;
const snake = (x, y, col, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${L('M-80 10Q-50 -30 -20 10T40 10T90 -10', col, 18)}${C(94, -14, 12, col)}${C(98, -17, 2.4, '#fff')}${L('M104 -12L118 -12', '#ef4444', 2.4)}</g>`;

export default [
  ['stroke', '#ec4899', '손으로 고양이를 부드럽게 쓰다듬는다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, cat(300, 250, 2.4), { cls: 'up' });
    s.step(2, `<g transform="translate(180 120)">${R(-10, -14, 70, 28, '#ffd7b5', 12, 'stroke="#e8b48c" stroke-width="2.4"')}</g>`, { cls: 'up' });
    s.mv(3, 'translateX(70px)', `<g transform="translate(290 156)">${R(-10, -14, 70, 28, '#ffd7b5', 12, 'stroke="#e8b48c" stroke-width="2.4"')}</g>`, { d: 0.8, appear: false });
    s.step(3, heart(380, 100, 0.8, '#ec4899') + heart(420, 70, 0.6, '#ef4444'), { cls: 'pop' });
  }],
  ['cluster', '#7c3aed', '흩어진 포도알이 한데 모여 송이를 이룬다', (s) => {
    s.sky('green'); s.ground('grass', 252);
    s.step(1, [[110, 150], [180, 210], [420, 140], [470, 210], [330, 110]].map(([x, y]) => grape(x, y)).join(''), { cls: 'pop', e: 2 });
    s.step(2, arrow(130, 160, 230, 170, '#7c3aed') + arrow(410, 160, 330, 170, '#7c3aed'), { cls: 'wipe', e: 2 });
    s.step(3, L('M280 40V90', '#6b4a2a', 6) + P('M290 56C320 36 350 50 340 70C320 78 300 72 290 56Z', '#5fb85a') + [[280, 100], [256, 114], [304, 114], [236, 130], [280, 130], [324, 130], [258, 148], [302, 148], [280, 166]].map(([x, y]) => grape(x, y, 13)).join(''), { cls: 'up' });
  }],
  ['plea', '#6366f1', '무릎 꿇고 두 손을 모아 눈물로 간청한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 410, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'angry', s: 1.15, armL: [-20, -6], hat: tie }), { cls: 'up' });
    s.step(2, person({ x: 170, y: 236, shirt: '#6366f1', fc: 'cry', legs: 'hide', s: 0.92, armL: [20, -36], armR: [-20, -36], sh: false }) + R(140, 236, 60, 14, '#6366f1', 6), { cls: 'up' });
    s.step(3, bubble(260, 110, 90, 54, '#fff', 'l') + heart(260, 112, 0.7, '#ef4444') + drop(150, 150, 0.8) + drop(190, 154, 0.8), { cls: 'pop' });
  }],
  ['derive', '#0ea5e9', '산속 샘물에서 시작된 물줄기가 흘러 마을로 이어진다', (s) => {
    s.sky('day'); s.ground('grass', 252);
    s.step(1, P('M0 252L160 70L300 252Z', '#94a3b8', 'stroke="#64748b" stroke-width="3"') + P('M130 100L160 70L190 100L172 108L160 96L148 110Z', '#fff') + C(176, 150, 12, '#4fc3f7'), { cls: 'up' });
    s.step(2, L('M176 160Q200 200 260 220Q340 240 380 250', '#4fc3f7', 14), { cls: 'wipe' });
    s.step(3, house(440, 252, 90, '#f3d9b5', '#c0392b') + drop(470, 140, 0.9) + arrow(300, 130, 400, 130, '#0ea5e9'), { cls: 'up' });
  }],
  ['lame', '#6b7280', '다리를 다쳐 목발을 짚고 절뚝거리며 걷는다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, person({ x: 280, y: 258, shirt: '#6b7280', legs: 'stand' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 280, y: 258, shirt: '#6b7280', fc: 'sad', armL: [-26, 34], armR: [30, 30], rot: 4 }) + `<g>${L('M246 202L226 258', '#8c6238', 6)}${L('M330 202L350 258', '#8c6238', 6)}</g>` + R(279, 246, 16, 12, '#fff', 3, 'stroke="#aab4c6" stroke-width="2"'), { cls: 'up' });
    s.step(3, L('M240 170L226 160M320 170L334 160', '#6b7280', 4) + L('M280 280H320M280 292H340', '#8a93a5', 4, 'stroke-dasharray="6 8"'), { cls: 'pop' });
    s.step(2, drop(262, 150, 0.7), { cls: 'pop', e: 2 });
  }],
  ['embrace', '#ec4899', '멀리서 달려온 두 사람이 서로를 따뜻하게 껴안는다', (s) => {
    s.sky('dusk'); s.ground('grass', 246);
    s.mv(1, 'translateX(-150px)', person({ x: 255, y: 260, shirt: '#3b82f6', fc: 'cheer', legs: 'walk', armR: [30, -16] }), { d: 1 });
    s.mv(1, 'translateX(150px)', person({ x: 305, y: 260, shirt: '#ef4444', hs: 'long', fc: 'cheer', legs: 'walk', armL: [-30, -16] }), { d: 1 });
    s.step(2, L('M120 150H170M110 170H160M450 150H400M460 170H410', '#ec4899', 4), { cls: 'wipe', e: 2 });
    s.step(3, heart(280, 96, 1.2, '#ef4444') + heart(230, 130, 0.6, '#ec4899') + heart(330, 126, 0.6, '#ec4899') + sparks(280, 120, 70, 84, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['accommodate', '#0d9488', '호텔이 짐을 든 손님들을 방으로 맞아 들인다', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, `<g transform="translate(400 250)">${R(-80, -200, 160, 200, '#d9c6a3', 4, 'stroke="#a89260" stroke-width="3"')}${[0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((c) => R(-58 + c * 44, -184 + r * 36, 28, 22, '#cfeaff', 3)).join('')).join('')}${door(0, 0, 40, 48, '#7a461f')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 120, y: 262, shirt: '#0d9488', fc: 'smile', legs: 'walk', armR: [26, 20] }) + R(150, 236, 30, 24, '#c99a5b', 3) + person({ x: 220, y: 262, shirt: '#f59e0b', hs: 'long', legs: 'walk' }), { cls: 'up' });
    s.mv(3, 'translateX(-150px)', person({ x: 370, y: 262, shirt: '#0d9488', s: 0.6, legs: 'walk' }), { d: 0.8 });
    s.step(3, [0, 1, 2].map((c) => R(342 + c * 44, 76, 28, 22, '#ffe9a0', 3)).join('') + [0, 1].map((c) => R(342 + c * 44, 112, 28, 22, '#ffe9a0', 3)).join('') + key(300, 160, 1), { cls: 'pop' });
  }],
  ['cozy', '#ea580c', '벽난로 곁 담요 속에서 따뜻한 차를 마시는 아늑함', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, `<g transform="translate(130 252)">${R(-70, -150, 140, 150, '#a8774a', 6)}${R(-46, -100, 92, 100, '#2a2e3a', 4)}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(130 252)"><g class="a-bob">${P('M-20 0Q-30 -30 -8 -50Q-10 -30 4 -36Q0 -18 20 -10Q30 0 20 0Z', '#ff9a1f')}${P('M-10 0Q-14 -16 0 -26Q-2 -14 10 -8Q14 0 10 0Z', '#ffd34d')}</g></g>` + `<circle cx="130" cy="200" r="90" fill="#ffd27a" fill-opacity=".22"/>`, {});
    s.step(3, person({ x: 330, y: 246, shirt: '#ea580c', fc: 'shy', legs: 'hide', armR: [-20, -4] }) + `<g transform="translate(330 240)">${P('M-40 0Q-40 -40 0 -44Q40 -40 40 0Z', '#f59e0b', 'stroke="#c2410c" stroke-width="2"')}</g>` + cup(372, 220, 1) + cat(440, 250, 1.3, '#9aa3b5') + heart(330, 110, 0.8, '#ef4444'), { cls: 'up' });
  }],
  ['obsess', '#7c3aed', '눈에 소용돌이가 돌 만큼 금화 하나에 사로잡혀 놓지 못한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 220, y: 254, shirt: '#7c3aed', fc: 'think', armL: [30, -16], armR: [-30, -16] }), { cls: 'up' });
    s.step(2, coin(300, 190, 30), { cls: 'pop' });
    s.step(3, L('M205 80a10 10 0 1 1 10 10a18 18 0 1 1 -18 -18a26 26 0 1 1 26 26', '#7c3aed', 4) + sparks(300, 190, 40, 54, '#ffd34d', 10, 3) + L('M250 150L296 176', '#7c3aed', 3, 'stroke-dasharray="4 6"'), { cls: 'pop' });
  }],
  ['suitor', '#ec4899', '꽃다발을 들고 무릎 꿇어 반지를 내밀며 구혼한다', (s) => {
    s.sky('dusk'); s.ground('grass', 246);
    s.step(1, person({ x: 420, y: 258, shirt: '#ec4899', hs: 'long', fc: 'shy', armL: [-20, 10] }), { cls: 'up' });
    s.mv(2, 'translateX(-170px)', person({ x: 240, y: 258, shirt: '#2563eb', fc: 'smile', legs: 'walk', armR: [30, -16] }) + `<g transform="translate(274 208)">${C(0, 0, 10, '#ef4444')}${C(14, 6, 10, '#f472b6')}${C(-12, 8, 10, '#facc15')}${L('M0 12L-6 36', '#3a8a3a', 3)}</g>`, { d: 0.9 });
    s.step(3, `<g transform="translate(282 210)">${C(0, 0, 12, 'none', 'stroke="#ffd34d" stroke-width="5"')}${P('M0 -12L5 -20H-5Z', '#60a5fa')}</g>` + heart(340, 100, 1.1, '#ef4444') + sparks(340, 100, 28, 44, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['discreet', '#475569', '입에 손가락을 대고 비밀을 조심스럽게 지킨다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, person({ x: 200, y: 254, shirt: '#475569', fc: 'neutral' }) + person({ x: 360, y: 254, shirt: '#14b8a6', hs: 'long', fc: 'neutral' }), { cls: 'up' });
    s.step(2, person({ x: 200, y: 254, shirt: '#475569', fc: 'neutral', armR: [14, -26] }), {});
    s.step(2, bubble(280, 90, 70, 44, '#fff', 'l') + C(262, 90, 4, '#aab4c6') + C(280, 90, 4, '#aab4c6') + C(298, 90, 4, '#aab4c6'), { cls: 'pop' });
    s.step(3, lock(430, 150, 1) + L('M180 150L220 150', '#475569', 3, 'stroke-opacity="0"'), { cls: 'pop' });
  }],
  ['pioneer', '#b45309', '미개척지에 첫 깃발을 꽂고 뒤따라온 이들이 집을 짓는다', (s) => {
    s.sky('sun'); s.ground('grass', 244);
    s.step(1, P('M0 244L100 160L200 244Z', '#a8946c') + P('M380 244L470 170L560 244Z', '#a8946c'), { cls: 'up' });
    s.step(2, person({ x: 270, y: 258, shirt: '#b45309', fc: 'cheer', armR: [20, -54] }) + flag(310, 258, '#ef4444', 110), { cls: 'up' });
    s.step(3, house(130, 252, 70, '#f3d9b5', '#c0392b', 0.9) + `<g transform="translate(450 252)">${R(-40, -34, 80, 34, '#c99a5b', 4)}${P('M-44 -34Q0 -80 44 -34Z', '#f4f1e6', 'stroke="#d6d0c0" stroke-width="2"')}${C(-22, 4, 12, '#6b4a2a')}${C(22, 4, 12, '#6b4a2a')}</g>` + person({ x: 380, y: 270, shirt: '#14b8a6', s: 0.6, legs: 'walk' }), { cls: 'up' });
  }],
  ['assert', '#dc2626', '손가락을 곧추세우고 당당하게 자기 주장을 내세운다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#94a3b8', fc: 'think', s: 0.85 }) + person({ x: 450, y: 254, shirt: '#94a3b8', hs: 'long', fc: 'think', s: 0.85 }), { cls: 'up' });
    s.step(2, person({ x: 300, y: 254, shirt: '#dc2626', fc: 'angry', armR: [22, -62], armL: [-26, -6] }), { cls: 'up' });
    s.step(3, sparks(300, 150, 70, 90, '#dc2626', 10, 4) + bubble(300, 50, 70, 46, '#fff', 'l') + L('M300 36V52M300 60V62', '#dc2626', 7), { cls: 'pop' });
  }],
  ['elaborate', '#0891b2', '단순한 원에 무늬를 하나하나 더해 정교하게 다듬는다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, C(280, 150, 70, 'none', 'stroke="#0891b2" stroke-width="5"'), { cls: 'up' });
    s.step(2, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * 6.283; return C(280 + Math.cos(a) * 46, 150 + Math.sin(a) * 46, 11, 'none', 'stroke="#0891b2" stroke-width="3"'); }).join('') + C(280, 150, 14, '#0891b2'), { cls: 'pop' });
    s.step(3, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * 6.283 + 0.4; return L(`M${f2(280 + Math.cos(a) * 74)} ${f2(150 + Math.sin(a) * 74)}L${f2(280 + Math.cos(a) * 92)} ${f2(150 + Math.sin(a) * 92)}`, '#0891b2', 4) + C(280 + Math.cos(a) * 98, 150 + Math.sin(a) * 98, 5, '#f59e0b'); }).join('') + C(280, 150, 28, 'none', 'stroke="#f59e0b" stroke-width="3"') + star(280, 150, 12, '#f59e0b'), { cls: 'pop' });
    s.mv(2, 'translate(60px,-30px)', pencil(380, 210, 1.5, 30), { d: 0.7 });
  }],
  ['auditorium', '#7c3aed', '무대 조명 아래 객석이 부채꼴로 가득 찬 강당', (s) => {
    s.sky('dark'); s.ground('carpet', 262);
    s.step(1, R(150, 70, 260, 14, '#7c3aed', 3) + P('M280 0L190 140H370Z', '#fff3b8', 'fill-opacity=".25"') + R(40, 20, 90, 120, '#9b1c1c', 4) + R(430, 20, 90, 120, '#9b1c1c', 4), { cls: 'up' });
    s.step(2, [0, 1, 2].map((r) => [...Array(7 + r * 2)].map((_, i) => { const n = 7 + r * 2, x = 280 + (i - (n - 1) / 2) * 38; return R(x - 14, 190 + r * 36, 28, 22, '#3b4a6b', 6); }).join('')).join(''), { cls: 'up' });
    s.step(3, person({ x: 280, y: 144, shirt: '#7c3aed', s: 0.5, fc: 'cheer', armL: [-20, -30], armR: [20, -30], sh: false }) + [...Array(7)].map((_, i) => C(280 + (i - 3) * 38, 204, 9, '#ffd7b5')).join('') + [...Array(9)].map((_, i) => C(280 + (i - 4) * 38, 240, 9, '#f0c6a4')).join(''), { cls: 'up' });
  }],
  ['radioactive', '#65a30d', '초록빛 방사선이 새어 나오는 통과 경고 표지', (s) => {
    s.sky('dark'); s.ground('stone', 252);
    s.step(1, `<g transform="translate(180 252)">${R(-44, -110, 88, 110, '#65a30d', 10, 'stroke="#365314" stroke-width="3"')}${R(-44, -86, 88, 8, '#365314')}${R(-44, -30, 88, 8, '#365314')}${trefoil(0, -58, 0.48)}</g>`, { cls: 'up' });
    s.step(2, `<g fill="none" stroke="#a3e635" stroke-width="5" stroke-linecap="round"><path class="a-pulse" d="M236 150Q260 150 260 170M236 130Q290 130 290 180M236 110Q320 110 320 190"/></g><circle cx="180" cy="190" r="100" fill="#a3e635" fill-opacity=".14"/>`, {});
    s.step(3, trefoil(430, 130, 1.4) + R(380, 200, 100, 44, '#374151', 8) + C(430, 222, 14, '#a3e635') + L('M430 222L444 210', '#1f2937', 3), { cls: 'pop' });
    s.badge('excl', 510, 40);
  }],
  ['impair', '#6b7280', '안경이 깨져 시야가 흐려지고 잘 보이지 않게 된다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 150, y: 260, shirt: '#6b7280', fc: 'smile', hat: '<g fill="#cfeaff" fill-opacity=".6" stroke="#2a2e3a" stroke-width="2.4"><circle cx="-7" cy="-83" r="6"/><circle cx="7" cy="-83" r="6"/></g>' }) + flag(420, 250, '#16a34a', 110), { cls: 'up' });
    s.step(2, `<g transform="translate(150 260)"><g fill="none" stroke="#2a2e3a" stroke-width="2"><path d="M-10 -88L-4 -80L-8 -77L-3 -73"/><path d="M6 -88L10 -82"/></g></g>`, {});
    s.step(3, `<rect x="380" y="100" width="130" height="150" fill="#eef2f7" fill-opacity=".75"/>` + person({ x: 150, y: 260, shirt: '#6b7280', fc: 'sad', hat: '<g fill="none" stroke="#ef4444" stroke-width="2"><path d="M-12 -80L-3 -86M3 -80L12 -86"/></g>' }) + L('M110 150L96 140M200 150L214 140', '#6b7280', 3), { });
  }],
  ['attorney', '#1e3a8a', '법정에서 변호사가 의뢰인을 변호해 판사의 판결을 이끈다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(210, 130, 140, 124, '#7a461f', 6) + person({ x: 280, y: 188, shirt: '#1f2937', pants: '#1f2937', hat: '<ellipse cx="0" cy="-102" rx="16" ry="6" fill="#e5e7eb"/>', legs: 'hide', sh: false, fc: 'neutral' }) + R(250, 126, 60, 10, '#a8774a', 3) + `<g transform="translate(320 128)">${R(-20, -8, 24, 10, '#8c5a2a', 3)}${R(-4, -22, 8, 24, '#8c5a2a', 3)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 120, y: 254, shirt: '#1e3a8a', pants: '#1e3a8a', fc: 'cheer', armR: [40, -30], armL: [-6, 24], hat: tie }) + paper(190, 190, 40, 50, 2), { cls: 'up' });
    s.step(3, person({ x: 450, y: 254, shirt: '#ef6a3a', fc: 'cheer', armL: [-20, -40], hs: 'long' }) + heart(450, 130, 0.8, '#ef4444'), { cls: 'up' });
    s.badge('check', 500, 56);
  }],
  ['sanitation', '#16a34a', '쓰레기를 쓸어 담아 깨끗하게 만드는 위생 관리', (s) => {
    s.sky('day'); s.ground('road', 250);
    s.step(1, [[110, 252, '#ef4444'], [200, 262, '#3b82f6'], [330, 258, '#f59e0b'], [420, 266, '#22c55e']].map(([x, y, c]) => R(x - 12, y - 10, 24, 16, c, 4, 'transform="rotate(14 ' + x + ' ' + y + ')"')).join('') + C(260, 252, 10, '#8a7a68'), { cls: 'pop', e: 2 });
    s.step(2, person({ x: 150, y: 262, shirt: '#16a34a', hat: hatCap('#16a34a'), armR: [40, 20], armL: [30, 6] }) + `<g transform="translate(212 252) rotate(-24)">${L('M0 0V-100', '#8c6238', 6)}${P('M-18 -4H18L22 14H-22Z', '#e8c25a')}</g>`, { cls: 'up' });
    s.step(3, `<g transform="translate(420 252)">${R(-26, -50, 52, 50, '#6b7a8c', 6)}${R(-30, -58, 60, 9, '#8393a6', 3)}</g>` + sparks(300, 230, 30, 46, '#ffd34d', 8, 4) + sparks(190, 240, 24, 36, '#fff', 6, 3), { cls: 'pop' });
    s.badge('check', 500, 56);
  }],
  ['heredity', '#ec4899', '부모의 유전자가 이어져 아이에게 닮은 모습이 나타난다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#3b82f6', hair: '#c2410c', hs: 'curly' }) + person({ x: 430, y: 254, shirt: '#ec4899', hair: '#1f1209', hs: 'long' }), { cls: 'up' });
    s.step(2, `<g transform="translate(280 130)">${[...Array(7)].map((_, i) => { const y = -60 + i * 20, w = Math.sin(i * 0.9) * 30; return L(`M${-w} ${y}L${w} ${y}`, '#a78bfa', 3) + C(-w, y, 5, '#3b82f6') + C(w, y, 5, '#ec4899'); }).join('')}${L('M-30 -60Q0 -40 30 -20T-30 20T30 60', '#6366f1', 4)}</g>`, { cls: 'pop' });
    s.step(3, person({ x: 280, y: 262, shirt: '#f59e0b', hair: '#c2410c', hs: 'curly', s: 0.7, fc: 'cheer' }) + heart(280, 150, 0.7, '#ef4444'), { cls: 'up' });
  }],
  ['shed', '#16a34a', '뱀이 낡은 허물을 벗고 새 몸으로 빠져나온다', (s) => {
    s.sky('sun'); s.ground('sand', 244);
    s.step(1, snake(280, 210, '#a8a29e', 1.3), { cls: 'up', e: 1 });
    s.step(2, snake(280, 210, '#a8a29e', 1.3), { e: 2 });
    s.step(2, L('M170 190Q220 160 250 200', '#e5e7eb', 4) + L('M180 200Q230 170 260 210', '#e5e7eb', 3), { cls: 'pop', e: 2 });
    s.step(3, snake(340, 210, '#22c55e', 1.3), { cls: 'up' });
    s.step(3, L('M120 230Q170 200 200 230T260 230', '#e5e7eb', 12) + L('M120 230Q170 200 200 230T260 230', '#cbd5e1', 3), { cls: 'up' });
  }],
  ['prolong', '#0891b2', '짧던 시간 막대를 고무줄처럼 길게 늘여 연장한다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(100, 130, 120, 36, '#0891b2', 18) + clock(100, 148, 30, 0.6, 3.4), { cls: 'up', e: 1 });
    s.step(2, R(100, 130, 220, 36, '#0891b2', 18) + clock(100, 148, 30, 1.6, 4.2) + arrow(330, 148, 410, 148, '#0891b2', 6, 16), { e: 2 });
    s.step(3, R(100, 130, 360, 36, '#0891b2', 18) + R(100, 130, 120, 36, '#0e7490', 18) + clock(100, 148, 30, 2.6, 5.2) + sun(480, 76, 20, '#ffd34d') + sparks(480, 76, 28, 40, '#ffd34d', 6, 3), { });
  }],
  ['induce', '#7c3aed', '흔들리는 추가 사람을 서서히 잠들게 유도한다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 30)">${L('M0 0V70', '#aab4c6', 3)}<g class="a-flip" style="transform-origin:280px 30px">${L('M0 0V70', '#aab4c6', 3)}${C(0, 76, 14, '#ffd34d', 'stroke="#d99a00" stroke-width="3"')}</g></g>`, { cls: 'up' });
    s.step(1, person({ x: 150, y: 254, shirt: '#7c3aed', fc: 'think' }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 150, y: 254, shirt: '#7c3aed', fc: 'yawn' }), { e: 2 });
    s.step(3, person({ x: 150, y: 254, shirt: '#7c3aed', fc: 'sleep', rot: 10, armL: [-10, 28], armR: [10, 28] }) + moon(330, 150, 20, '#0f1730') + star(400, 110, 8) + star(360, 190, 6) + star(450, 160, 7), { });
  }],
  ['ornament', '#dc2626', '트리에 방울과 별을 달아 꾸미는 장식', (s) => {
    s.sky('night'); s.ground('snow', 250);
    s.step(1, `<g transform="translate(280 252)">${R(-8, -20, 16, 20, '#6b4a2a')}${P('M0 -200L-90 -20H90Z', '#2f7a3f')}${P('M0 -200L-66 -80H66Z', '#3a8f4d')}</g>`, { cls: 'up' });
    s.step(2, [[0, -150, '#ef4444'], [-30, -110, '#3b82f6'], [34, -100, '#facc15'], [-48, -60, '#ec4899'], [10, -60, '#ef4444'], [52, -40, '#3b82f6'], [-20, -30, '#facc15']].map(([x, y, c]) => C(280 + x, 252 + y, 10, c, 'stroke="#fff" stroke-width="1.6"')).join(''), { cls: 'pop' });
    s.step(3, star(280, 46, 18, '#ffd34d') + sparks(280, 46, 28, 42, '#ffd34d', 8, 3) + L('M200 150Q230 130 250 160T300 140', '#ffe9a0', 3, 'stroke-dasharray="3 8"'), { cls: 'pop' });
  }],
  ['speculate', '#ca8a04', '오르내리는 그래프를 보고 짐작해 오를 쪽에 돈을 건다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(60, 70, 240, 150, '#fff', 8, 'stroke="#b9c1cf" stroke-width="3"') + L('M80 190L120 130L160 170L200 100L250 150L280 90', '#3b82f6', 5), { cls: 'up' });
    s.step(2, person({ x: 420, y: 254, shirt: '#ca8a04', fc: 'think', armR: [16, -34] }) + qmark(370, 120, '#6366f1', 1.1), { cls: 'up' });
    s.step(3, coin(300, 90, 14) + coin(320, 104, 14) + arrow(300, 150, 300, 110, '#16a34a', 6, 14) + star(480, 80, 12), { cls: 'pop' });
  }],
  ['breathtaking', '#f59e0b', '산 위로 해가 떠오르는 장관에 입이 벌어져 숨이 멎는다', (s) => {
    s.sky('dusk'); s.ground('grass', 250);
    s.step(1, P('M0 250L120 120L220 200L330 90L440 190L560 250Z', '#64748b', 'stroke="#475569" stroke-width="3"') + P('M300 118L330 90L360 124L342 132L330 118L318 134Z', '#fff'), { cls: 'up' });
    s.step(2, C(330, 70, 40, '#ffb347') + sparks(330, 70, 52, 70, '#ffd34d', 12, 4), { cls: 'pop' });
    s.step(3, person({ x: 150, y: 270, shirt: '#f59e0b', fc: 'shock', armL: [-30, -40], armR: [30, -40], s: 0.85 }) + star(430, 60, 8, '#fff') + star(480, 100, 6, '#fff'), { cls: 'up' });
  }],
  ['overturn', '#dc2626', '달리던 차가 뒤집혀 바퀴가 하늘을 향한다', (s) => {
    s.sky('day'); s.ground('road', 240);
    s.step(1, L('M0 276H560', '#fff', 4, 'stroke-dasharray="26 18" stroke-opacity=".8"'), {});
    s.step(1, `<g transform="translate(180 250)">${R(-46, -12, 92, 28, '#3b82f6', 10)}${P('M-26 -12L-14 -34H20L34 -12Z', '#3a74d8')}${C(-26, 18, 9, '#1f2937', 'stroke="#9aa3b2" stroke-width="3"')}${C(26, 18, 9, '#1f2937', 'stroke="#9aa3b2" stroke-width="3"')}</g>`, { cls: 'up', e: 1 });
    s.mv(2, 'translate(-120px,0px) rotate(180deg)', `<g transform="translate(300 210) rotate(180)"><g transform="translate(0 -24)"><g>${R(-46, -12, 92, 28, '#3b82f6', 10)}${P('M-26 -12L-14 -34H20L34 -12Z', '#3a74d8')}${C(-26, 18, 9, '#1f2937', 'stroke="#9aa3b2" stroke-width="3"')}${C(26, 18, 9, '#1f2937', 'stroke="#9aa3b2" stroke-width="3"')}</g></g></g>`, { d: 1, appear: true, e: undefined });
    s.step(3, sparks(300, 230, 40, 60, '#ffd34d', 8, 4) + L('M240 200L220 180M360 200L380 180', '#ef4444', 4), { cls: 'pop' });
    s.badge('excl', 500, 50);
  }],
  ['conflict', '#dc2626', '두 편이 줄다리기를 하듯 팽팽히 맞서다 줄이 끊어질 듯하다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 100, y: 254, shirt: '#3b82f6', fc: 'angry', rot: -14, armL: [30, 4], armR: [30, 8] }) + person({ x: 180, y: 254, shirt: '#60a5fa', fc: 'angry', rot: -14, armL: [30, 4], armR: [30, 8] }) + person({ x: 380, y: 254, shirt: '#ef4444', fc: 'angry', rot: 14, armL: [-30, 4], armR: [-30, 8] }) + person({ x: 460, y: 254, shirt: '#f87171', fc: 'angry', rot: 14, armL: [-30, 4], armR: [-30, 8] }), { cls: 'up' });
    s.step(2, L('M130 200H430', '#c2884e', 7) + P('M270 190L290 190L280 206Z', '#dc2626'), { cls: 'wipe' });
    s.step(3, `<path d="M280 150L262 190H284L270 232L306 180H286Z" fill="#ffd34d"/>` + L('M240 160L226 150M320 160L334 150', '#dc2626', 4), { cls: 'pop' });
  }],
  ['tuition', '#2563eb', '수업료를 내고 학교에 들어가 배움을 얻는다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(430 250)">${R(-80, -90, 160, 90, '#e8d0b0', 4)}${P('M-96 -90L0 -140L96 -90Z', '#c0392b')}${R(-14, -56, 28, 56, '#8c5a2a', 3)}${flag(0, -140, '#2563eb', 40)}${[-56, 56].map((x) => R(x - 12, -72, 24, 24, '#cfeaff', 2, 'stroke="#fff" stroke-width="3"')).join('')}</g>`, { cls: 'up' });
    s.step(1, person({ x: 120, y: 260, shirt: '#2563eb', fc: 'smile', armR: [36, 6] }) + book(180, 240, '#f59e0b', 30, 40), { cls: 'up', e: 2 });
    s.mv(2, 'translateX(-190px)', bag(380, 190, 1.1, '#d9772e') + coin(410, 180, 11), { d: 0.9 });
    s.step(3, person({ x: 360, y: 260, shirt: '#2563eb', fc: 'cheer', s: 0.7, legs: 'walk' }) + sparks(430, 120, 30, 46, '#ffd34d', 6, 3), { cls: 'up' });
  }],
];

function f2(n) { return Math.round(n * 10) / 10; }
