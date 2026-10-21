import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const stairs = (x, y) => `<g transform="translate(${x} ${y})">${R(-150, -30, 100, 30, '#cbd5e1', 3)}${R(-50, -60, 100, 60, '#cbd5e1', 3)}${R(50, -90, 100, 90, '#cbd5e1', 3)}</g>`;

export default [
  ['indifferent', '#6b7280', '우는 아이 옆을 휴대폰만 보며 어깨를 으쓱하고 그냥 지나치는 무관심', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, person({ x: 160, y: 262, shirt: '#3b82f6', s: 0.7, fc: 'cry', armL: [-10, -20], armR: [10, -20] }) + drop(140, 190, 0.7) + drop(180, 194, 0.7), { cls: 'up' });
    s.mv(2, 'translateX(-200px)', person({ x: 440, y: 254, shirt: '#6b7280', fc: 'neutral', legs: 'walk', armL: [-20, 4], armR: [14, -24] }) + phone(458, 196, 0.8), { d: 1.1, ease: 'linear' });
    s.step(3, L('M380 128Q400 108 420 128', '#6b7280', 4) + L('M404 152H436', '#6b7280', 3) + cross(500, 56), { cls: 'pop' });
  }],
  ['spatial', '#2563eb', '가로·세로·높이의 세 축으로 이루어진 입체 공간', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, P('M200 220L320 220L320 110L200 110Z', '#bfdbfe', 'stroke="#2563eb" stroke-width="4"') + P('M200 110L250 70H370L320 110Z', '#93c5fd', 'stroke="#2563eb" stroke-width="4"') + P('M320 110L370 70V180L320 220Z', '#60a5fa', 'stroke="#2563eb" stroke-width="4"'), { cls: 'pop' });
    s.step(2, arrow(190, 230, 330, 230, '#ef4444', 5, 12) + arrow(180, 220, 180, 110, '#22c55e', 5, 12) + arrow(325, 225, 385, 185, '#f59e0b', 5, 12), { cls: 'wipe' });
    s.step(3, person({ x: 470, y: 262, shirt: '#2563eb', s: 0.7, fc: 'smile' }) + R(430, 110, 80, 4, '#2563eb', 1) + sparks(280, 150, 100, 114, '#ffd34d', 8, 3), { cls: 'up' });
  }],
  ['establish', '#0d9488', '주춧돌을 놓고 벽을 올려 깃발을 꽂아 새로 세운다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, R(230, 236, 100, 14, '#8a93a5', 3), { cls: 'up' });
    s.step(2, R(240, 140, 80, 96, '#e8d0b0', 3) + P('M230 140L280 90L330 140Z', '#c0392b'), { cls: 'wipe-d' });
    s.step(3, flag(280, 90, '#0d9488', 40) + L('M160 250H400', '#ef4444', 6) + sparks(280, 80, 24, 38, '#ffd34d', 8, 3) + chk(480, 56), { cls: 'pop' });
  }],
  ['engage', '#7c3aed', '두 사람이 서로 교류하며 톱니바퀴처럼 맞물려 돌아간다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 110, y: 254, shirt: '#7c3aed', fc: 'cheer', armR: [30, -10] }) + person({ x: 450, y: 254, shirt: '#14b8a6', hs: 'long', fc: 'cheer', armL: [-30, -10] }), { cls: 'up' });
    s.step(2, gear(240, 150, 36, '#7c3aed') + gear(320, 150, 36, '#14b8a6'), { cls: 'pop' });
    s.step(3, heart(280, 80, 0.9, '#ef4444') + L('M170 180H230M330 180H390', '#7c3aed', 4, 'stroke-dasharray="5 7"'), { cls: 'pop' });
  }],
  ['immediate', '#f59e0b', '버튼을 누르는 즉시 곧바로 불이 번쩍 켜지는 즉각적인 반응', (s) => {
    s.sky('dark'); s.ground('floor', 252);
    s.step(1, R(140, 200, 70, 40, '#6b7384', 6) + C(175, 200, 22, '#ef4444') + bulb(400, 200, 1.4, false), { cls: 'up' });
    s.step(2, `<g transform="translate(175 130)">${R(-12, 0, 60, 24, '#ffd7b5', 10, 'stroke="#e8b48c" stroke-width="2"')}</g>`, { cls: 'up' });
    s.step(3, bulb(400, 200, 1.4) + sparks(400, 160, 50, 70, '#ffd34d', 10, 4) + clock(280, 100, 22, 0, 0) + L('M190 170H400', '#f59e0b', 4, 'stroke-dasharray="3 6"'), { cls: 'pop' });
  }],
  ['sophisticated', '#b45309', '평범해 보이는 시계 속을 돋보기로 보니 작은 톱니가 빽빽이 맞물린 정교한 장치', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    const cx = 210, cy = 146;
    const ticks = Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `M${(cx + Math.sin(a) * 50).toFixed(1)} ${(cy - Math.cos(a) * 50).toFixed(1)}L${(cx + Math.sin(a) * 57).toFixed(1)} ${(cy - Math.cos(a) * 57).toFixed(1)}`; }).join('');
    s.step(1, L(`M${cx} ${cy - 80}Q${cx - 50} ${cy - 112} ${cx - 104} ${cy - 92}`, '#b45309', 4) + R(cx - 10, cy - 90, 20, 14, '#d4a017', 4) + C(cx, cy, 74, '#e9b949', 'stroke="#a16207" stroke-width="5"'), { cls: 'pop' });
    s.step(1, C(cx, cy, 62, '#fffdf5', 'stroke="#d4a017" stroke-width="3"') + L(ticks, '#7c5c12', 3) + L(`M${cx} ${cy}V${cy - 40}M${cx} ${cy}L${cx + 28} ${cy + 12}`, '#3b2f1a', 4) + C(cx, cy, 4, '#3b2f1a'), { cls: 'pop', e: 1 });
    s.step(1, person({ x: 440, y: 254, shirt: '#475569', fc: 'think', armR: [-10, -30] }), { cls: 'up', e: 2 });
    const gears = [[-22, -18, 17, '#d4a017'], [17, -25, 12, '#9ca3af'], [24, 14, 15, '#d4a017'], [-12, 24, 11, '#9ca3af'], [2, -1, 8, '#b45309'], [-36, 8, 8, '#9ca3af'], [40, -6, 7, '#b45309']];
    s.step(2, C(cx, cy, 62, '#f5e6c4', 'stroke="#d4a017" stroke-width="3"') + gears.map(([dx, dy, r, c]) => gear(cx + dx, cy + dy, r, c)).join('') + [[-22, -18], [24, 14], [2, -1]].map(([dx, dy]) => C(cx + dx, cy + dy, 3, '#dc2626')).join('') + C(cx, cy, 70, 'none', 'stroke="#334155" stroke-width="10"') + L(`M${cx + 52} ${cy + 50}L${cx + 96} ${cy + 94}`, '#7a5230', 14) + L(`M${cx - 40} ${cy - 30}Q${cx - 30} ${cy - 46} ${cx - 10} ${cy - 50}`, '#fff', 4, 'stroke-opacity=".8"'), { cls: 'pop' });
    s.step(3, sparks(cx, cy, 86, 104, '#ffd34d', 12, 4) + person({ x: 440, y: 254, shirt: '#475569', fc: 'shock', armL: [-22, -40], armR: [22, -40] }) + star(500, 56, 14, '#f59e0b'), { cls: 'pop' });
  }],
  ['compassion', '#ec4899', '울고 있는 아이의 어깨를 감싸 안고 위로하는 동정심', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 360, y: 262, shirt: '#94a3b8', s: 0.75, fc: 'cry', armL: [-6, 24], armR: [6, 24] }) + drop(340, 196, 0.7) + drop(380, 200, 0.7), { cls: 'up' });
    s.mv(2, 'translateX(-90px)', person({ x: 230, y: 254, shirt: '#ec4899', hs: 'long', fc: 'sad', armR: [100, -10] }), { d: 0.9 });
    s.step(3, heart(300, 100, 1.2, '#ef4444') + heart(250, 130, 0.6, '#ec4899') + heart(350, 136, 0.6, '#ec4899') + sparks(300, 110, 40, 54, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['exacerbate', '#dc2626', '작은 불에 기름을 부어 불길을 더 크게 악화시킨다', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, flame(380, 252, 0.8) + R(330, 252, 100, 10, '#6b4a2a', 3), { cls: 'up', e: 2 });
    s.step(2, bottle(180, 130, 1.6, '#f59e0b') + L('M200 120L300 190', '#f59e0b', 5, 'stroke-dasharray="1 8"'), { cls: 'up', e: 2 });
    s.step(3, flame(380, 252, 2.6) + flame(340, 256, 1.8) + flame(420, 256, 1.6) + arrow(480, 140, 480, 80, '#dc2626', 6, 14) + cross(60, 56), { cls: 'pop' });
  }],
  ['introduction', '#0891b2', '새로운 것이 문을 통해 안으로 흘러 들어오는 유입', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, R(240, 130, 12, 120, '#8c5a2a', 3) + R(308, 130, 12, 120, '#8c5a2a', 3) + R(240, 120, 80, 14, '#8c5a2a', 3) + house(430, 250, 100, '#f3d9b5', '#c0392b'), { cls: 'up' });
    s.mv(2, 'translateX(-200px)', person({ x: 280, y: 262, shirt: '#0891b2', legs: 'walk', fc: 'cheer', s: 0.8 }) + person({ x: 210, y: 262, shirt: '#f59e0b', legs: 'walk', hs: 'long', s: 0.8 }), { d: 1.2 });
    s.step(3, arrow(80, 190, 200, 190, '#0891b2', 6, 14) + star(430, 90, 12), { cls: 'wipe' });
  }],
  ['sympathetic', '#dc2626', '놀라자 신경 신호가 뇌에서 심장으로 전해져 심장이 쿵쾅 뛴다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 120, y: 254, shirt: '#dc2626', fc: 'shock' }) + spiderL(260, 140), { cls: 'up' });
    s.step(2, L('M130 170Q200 130 280 160', '#facc15', 4, 'stroke-dasharray="4 7"') + `<g transform="translate(400 140)">${P('M-50 14Q-70 -30 -30 -50Q-10 -70 24 -54Q70 -40 66 0Q64 36 20 40Q-20 56 -50 14Z', '#f9a8d4', 'stroke="#db2777" stroke-width="3"')}</g>`, { cls: 'pop' });
    s.step(3, heart(400, 230, 1.6, '#ef4444') + L('M340 230L360 230L370 210L382 250L394 220L406 230H450', '#fff', 3) + sparks(400, 230, 40, 54, '#ef4444', 8, 3) + drop(150, 150, 0.8), { cls: 'pop' });
  }],
  ['consequences', '#7c3aed', '볼링공이 굴러가 핀이 와르르 쓰러지는 행동의 결과', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [380, 410, 440, 395, 425, 410].map((x, i) => `<g transform="translate(${x} ${i < 3 ? 230 : 204})">${E(0, -20, 8, 20, '#fff', 'stroke="#aab4c6" stroke-width="2"')}${R(-4, -42, 8, 6, '#ef4444', 2)}</g>`).join('') + L('M60 240H520', '#c99a5b', 18), { cls: 'up', e: 2 });
    s.mv(2, 'translateX(-250px)', ball(300, 232, 22, '#2563eb'), { d: 0.9, e: 2 });
    s.step(3, [[380, 252, 70], [420, 258, -60], [450, 250, 40], [410, 222, 90], [440, 216, -40], [400, 270, 30]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})">${E(0, 0, 8, 20, '#fff', 'stroke="#aab4c6" stroke-width="2"')}</g>`).join('') + star(410, 160, 16) + sparks(410, 190, 40, 56, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['reliance', '#0d9488', '지팡이와 친구의 어깨에 기대어 의지하는 모습', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 360, y: 258, shirt: '#0d9488', fc: 'smile' }), { cls: 'up' });
    s.step(2, person({ x: 200, y: 258, shirt: '#94a3b8', hair: '#e5e7eb', fc: 'sad', rot: 10, armR: [120, -20] }) + L('M170 190L160 258', '#8c6238', 6), { cls: 'up' });
    s.step(3, heart(280, 110, 1, '#ef4444') + L('M230 130Q280 100 330 130', '#0d9488', 3, 'stroke-dasharray="4 7"') + chk(480, 56), { cls: 'pop' });
  }],
  ['cognition', '#7c3aed', '눈으로 사과를 보고 뇌가 그것이 무엇인지 알아보는 인지', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, apple(110, 220, 2) + `<g transform="translate(220 130)">${E(0, 0, 36, 22, '#fff', 'stroke="#6b7384" stroke-width="3"')}${C(0, 0, 12, '#2563eb')}${C(0, 0, 5, '#111')}</g>`, { cls: 'up' });
    s.step(2, L('M256 130Q310 110 340 130', '#7c3aed', 4, 'stroke-dasharray="5 7"'), { cls: 'wipe' });
    s.step(3, `<g transform="translate(420 130)">${P('M-60 14Q-80 -30 -40 -50Q-10 -70 30 -54Q80 -40 76 0Q72 36 24 40Q-20 56 -60 14Z', '#f9a8d4', 'stroke="#db2777" stroke-width="3"')}${apple(0, 20, 0.9)}</g>` + sparks(420, 120, 80, 96, '#ffd34d', 10, 3), { cls: 'pop' });
  }],
  ['homogeneous', '#2563eb', '여러 색 공이 모두 같은 색으로 통일된 동질적 모습', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    const xs = [100, 190, 280, 370, 460];
    s.step(1, xs.map((x, i) => C(x, 190, 34, ['#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899'][i])).join(''), { cls: 'pop', e: 2 });
    s.step(2, arrow(280, 90, 280, 130, '#2563eb', 6, 14), { cls: 'wipe-d', e: 2 });
    s.step(3, xs.map((x) => C(x, 190, 34, '#3b82f6') + C(x - 10, 180, 8, '#fff', 'fill-opacity=".4"')).join('') + chk(500, 56), { cls: 'pop' });
  }],
  ['exploitation', '#7f1d1d', '일꾼은 무거운 짐을 지고 푼돈만 받는데 사장은 돈자루를 챙기는 착취', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#6b7280', fc: 'sad', rot: 12, armL: [-6, 24], armR: [6, 24] }) + sack(130, 140, 1.4), { cls: 'up' });
    s.step(2, person({ x: 430, y: 254, shirt: '#1f2937', pants: '#1f2937', s: 1.2, fc: 'smirk', hat: tie }) + bag(380, 252, 1.8, '#d9772e') + coin(490, 200, 14), { cls: 'up' });
    s.step(3, coin(210, 200, 10) + arrow(280, 150, 220, 190, '#7f1d1d', 4, 10) + cross(500, 56), { cls: 'pop' });
  }],
  ['distribution', '#0891b2', '공장에서 만든 상자를 트럭이 가게로 실어 날라 퍼뜨리는 유통', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, `<g transform="translate(90 246)">${R(-50, -80, 100, 80, '#9ca3af', 4)}${R(26, -120, 20, 40, '#6b7384', 3)}${R(-30, -50, 30, 50, '#5a3a22', 3)}</g>` + box(150, 250, 36, 30) + box(190, 250, 36, 30), { cls: 'up' });
    s.mv(2, 'translateX(-180px)', `<g transform="translate(340 250)">${R(-60, -50, 80, 50, '#3b82f6', 5)}${R(20, -38, 40, 38, '#2563eb', 5)}${C(-30, 4, 12, '#1f2937')}${C(40, 4, 12, '#1f2937')}${box(-30, -50, 30, 24)}</g>`, { d: 1 });
    s.step(3, `<g transform="translate(470 246)">${R(-40, -60, 80, 60, '#e8d0b0', 3)}${P('M-48 -60L-30 -80H30L48 -60Z', '#ef4444')}${R(-10, -34, 20, 34, '#8c5a2a', 2)}</g>` + chk(500, 56), { cls: 'up' });
  }],
  ['prevailing', '#0ea5e9', '한 방향에서 줄곧 부는 우세한 바람에 나무가 모두 한쪽으로 기울었다', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, [100, 220, 340, 460].map((x) => `<g transform="translate(${x} 252) rotate(14)"><g transform="scale(0.8)"><rect x="-6" y="-60" width="12" height="60" fill="#6b4a2a"/><circle cx="0" cy="-80" r="34" fill="#4fa04a"/><circle cx="-24" cy="-62" r="22" fill="#3f8f3a"/><circle cx="24" cy="-64" r="22" fill="#3f8f3a"/></g></g>`).join(''), { cls: 'up' });
    s.step(2, L('M20 90H150M10 120H130M30 150H140', '#fff', 6, 'stroke-opacity=".9"'), { cls: 'wipe' });
    s.step(3, arrow(180, 60, 440, 60, '#0ea5e9', 10, 22) + sparks(480, 60, 20, 30, '#ffd34d', 6, 3).replace(/.*/, ''), { cls: 'wipe' });
  }],
  ['ambiguity', '#6366f1', '하나의 모양이 두 가지로 읽혀 어느 쪽인지 모호하다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, C(280, 150, 40, '#fbbf24', 'stroke="#d99a00" stroke-width="4"'), { cls: 'pop' });
    s.step(2, arrow(240, 130, 160, 100, '#6366f1', 4, 10) + arrow(320, 130, 400, 100, '#6366f1', 4, 10) + C(120, 90, 30, '#ef4444') + L('M110 90H130M120 80V100', '#fff', 0.1, 'stroke-opacity="0"') + sun(440, 90, 26, '#ffd34d'), { cls: 'pop' });
    s.step(3, qm(280, 80, '#6366f1', 1.6) + person({ x: 280, y: 262, shirt: '#6366f1', fc: 'think', s: 0.8, armR: [16, -34] }), { cls: 'pop' });
  }],
  ['further', '#16a34a', '표지를 지나 한 걸음 더 앞으로 나아가는', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, L('M70 250H500', '#a8946c', 18) + person({ x: 110, y: 262, shirt: '#16a34a', legs: 'walk', fc: 'smile' }), { cls: 'up', e: 2 });
    s.step(2, R(266, 160, 8, 90, '#8c5a2a', 2) + R(266, 160, 40, 14, '#ef4444', 3) + person({ x: 270, y: 262, shirt: '#16a34a', legs: 'walk', fc: 'smile' }), { e: 2 });
    s.step(3, R(266, 160, 8, 90, '#8c5a2a', 2) + R(266, 160, 40, 14, '#ef4444', 3) + person({ x: 430, y: 262, shirt: '#16a34a', legs: 'walk', fc: 'cheer', armR: [30, -10] }) + arrow(300, 100, 460, 100, '#16a34a', 6, 16), { });
  }],
  ['distinctive', '#dc2626', '검은 우산 무리 속에서 홀로 눈에 띄는 빨간 우산', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, [90, 190, 380, 470].map((x) => `<g transform="translate(${x} 160)">${P('M-44 0Q0 -56 44 0Z', '#1f2937')}${L('M0 0V70', '#475569', 4)}</g>` + person({ x, y: 262, shirt: '#94a3b8', s: 0.6, sh: false })).join('') + `<g fill="#8fb4d8">${[70, 160, 250, 340, 430].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.6}s" d="M${x} 20c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(280 150)">${P('M-52 0Q0 -66 52 0Z', '#ef4444')}${L('M0 0V80', '#475569', 4)}</g>` + person({ x: 280, y: 262, shirt: '#ef4444', s: 0.6, sh: false, fc: 'cheer' }), { cls: 'pop' });
    s.step(3, sparks(280, 120, 70, 86, '#ffd34d', 10, 3) + star(280, 50, 12), { cls: 'pop' });
  }],
  ['preference', '#ec4899', '두 가지 중 마음에 드는 것을 골라 손을 뻗는 선호', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, table(280, 238, 300) + apple(200, 226, 1.4) + cake(360, 226, 1.1), { cls: 'up' });
    s.step(2, person({ x: 100, y: 254, shirt: '#ec4899', fc: 'think', armR: [90, -20] }), { cls: 'up' });
    s.step(3, heart(200, 130, 1.2, '#ef4444') + sparks(200, 130, 40, 54, '#ffd34d', 8, 3) + L('M340 150L380 190M380 150L340 190', '#aab4c6', 5), { cls: 'pop' });
  }],
  ['commitment', '#ea580c', '신발끈을 단단히 묶고 목표 깃발을 향해 전념해 달려간다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, flag(470, 250, '#ef4444', 140), { cls: 'up' });
    s.step(2, person({ x: 130, y: 262, shirt: '#ea580c', fc: 'angry', rot: 20, legs: 'walk', armL: [20, 20], armR: [24, 20], s: 0.9 }), { cls: 'up', e: 2 });
    s.mv(3, 'translateX(-220px)', person({ x: 360, y: 262, shirt: '#ea580c', fc: 'angry', legs: 'walk', armL: [-24, 20], armR: [30, -10] }), { d: 1.1, ease: 'cubic-bezier(.4,0,.8,1)' });
    s.step(3, L('M120 200H80M110 230H70M120 250H90', '#ea580c', 4) + heart(360, 120, 0.8, '#ef4444'), { cls: 'pop' });
  }],
  ['drain', '#0ea5e9', '욕조 마개를 뽑자 물이 소용돌이치며 빠진다', (s) => {
    s.sky('mint'); s.ground('tile', 252);
    s.step(1, `<g transform="translate(280 250)">${R(-150, -90, 300, 90, '#fff', 30, 'stroke="#cbd5e1" stroke-width="4"')}${R(-136, -70, 272, 56, '#7dd3fc', 20)}${R(-150, -96, 300, 12, '#e5e9f0', 6)}${R(-120, 0, 14, 14, '#cbd5e1', 3)}${R(106, 0, 14, 14, '#cbd5e1', 3)}</g>`, { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(280 250)">${R(-150, -90, 300, 90, '#fff', 30, 'stroke="#cbd5e1" stroke-width="4"')}${R(-136, -50, 272, 36, '#7dd3fc', 20)}${C(0, -20, 16, '#475569')}${L('M0 -20Q20 -30 30 -20T10 -4', '#e6f6ff', 3)}</g>` + `<g transform="translate(280 150)">${C(0, 0, 8, '#cbd5e1')}${L('M0 0V-40', '#aab4c6', 3)}</g>`, { e: 2 });
    s.step(3, `<g transform="translate(280 250)">${R(-150, -90, 300, 90, '#fff', 30, 'stroke="#cbd5e1" stroke-width="4"')}${R(-136, -70, 272, 56, '#eef2f7', 20)}${C(0, -20, 16, '#475569')}</g>` + arrow(280, 110, 280, 190, '#0ea5e9', 6, 14), { });
  }],
  ['equilibrium', '#0d9488', '기울었던 시소가 알맞게 맞춰져 수평을 이루는 평형', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(280 250)">${P('M-24 0L0 -40L24 0Z', '#8a93a5')}<g transform="rotate(-14 0 -40)">${R(-130, -46, 260, 10, '#a8774a', 4)}</g></g>` + person({ x: 160, y: 232, shirt: '#3b82f6', s: 0.55, sh: false, legs: 'hide', fc: 'cheer' }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 400, y: 276, shirt: '#ef4444', s: 0.55, sh: false, legs: 'hide', fc: 'cheer' }) + arrow(400, 120, 400, 170, '#0d9488', 5, 12), { cls: 'up', e: 2 });
    s.step(3, `<g transform="translate(280 250)">${P('M-24 0L0 -40L24 0Z', '#8a93a5')}${R(-130, -46, 260, 10, '#a8774a', 4)}</g>` + person({ x: 180, y: 204, shirt: '#3b82f6', s: 0.55, sh: false, legs: 'hide', fc: 'cheer' }) + person({ x: 380, y: 204, shirt: '#ef4444', s: 0.55, sh: false, legs: 'hide', fc: 'cheer' }) + chk(480, 56), { cls: 'up' });
  }],
  ['fierce', '#dc2626', '이빨과 발톱을 드러내고 으르렁거리는 사나운 호랑이', (s) => {
    s.sky('green'); s.ground('grass', 250);
    s.step(1, `<g transform="translate(280 240)">${E(0, -70, 70, 60, '#f59e0b')}${P('M-70 -90L-80 -130L-44 -100Z M70 -90L80 -130L44 -100Z', '#f59e0b')}${L('M-30 -120L-18 -100M30 -120L18 -100M0 -130V-108', '#2a1a12', 7)}${C(-22, -80, 8, '#fff')}${C(22, -80, 8, '#fff')}${C(-22, -80, 4, '#111')}${C(22, -80, 4, '#111')}${E(0, -50, 16, 10, '#fff4e0')}${P('M-6 -56H6L0 -48Z', '#2a1a12')}</g>`, { cls: 'up' });
    s.step(2, P('M250 192L258 214L266 192L274 214L282 192L290 214L298 192L306 214L314 192Z', '#fff', 'stroke="#2a1a12" stroke-width="2"') + P('M258 190Q280 180 302 190Q280 230 258 190Z', '#7a1f1f', 'fill-opacity=".8"'), { cls: 'pop' });
    s.step(3, L('M120 100L180 160M110 140L170 190M130 70L190 130', '#dc2626', 7) + L('M440 100L380 160M450 140L390 190', '#dc2626', 7) + cross(500, 50), { cls: 'wipe' });
  }],
  ['depreciate', '#78716c', '새 차가 해가 갈수록 낡아 가격표가 뚝 떨어진다', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, car(150, 250, '#ef4444', 1.3) + `<g transform="translate(150 150)">${R(-36, -16, 72, 32, '#fff', 6, 'stroke="#aab4c6" stroke-width="2"')}${coin(-14, 0, 9)}${R(0, -4, 28, 8, '#aab4c6', 3)}</g>`, { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(280 100)">${R(-40, -40, 80, 80, '#fff', 8, 'stroke="#aab4c6" stroke-width="3"')}${R(-40, -40, 80, 22, '#ef4444', 8)}${L('M-20 4H20M-20 20H14', '#aab4c6', 3)}</g>`, { cls: 'pop' });
    s.step(3, car(430, 250, '#a8a29e', 1.3) + L('M400 230L416 244M450 234L436 248', '#7a4a2a', 4) + `<g transform="translate(430 150)">${R(-36, -16, 72, 32, '#fff', 6, 'stroke="#aab4c6" stroke-width="2"')}${coin(-14, 0, 9)}${R(0, -4, 12, 8, '#aab4c6', 3)}</g>` + arrow(520, 140, 520, 200, '#dc2626', 6, 14), { cls: 'up' });
  }],
  ['sublime', '#7c3aed', '오로라 뜬 장엄한 산 앞에서 작은 사람이 경외에 젖는 숭고함', (s) => {
    s.sky('night'); s.ground('snow', 250);
    s.step(1, P('M0 250L120 120L220 200L330 90L440 200L560 130V250Z', '#475569', 'stroke="#334155" stroke-width="3"') + P('M306 118L330 90L356 124L340 130L330 116L318 132Z', '#fff'), { cls: 'up' });
    s.step(2, P('M0 90Q140 20 280 70T560 50V100Q420 80 280 110T0 130Z', '#34d399', 'fill-opacity=".55"') + P('M0 130Q140 60 280 100T560 90V130Q420 110 280 140T0 170Z', '#a78bfa', 'fill-opacity=".4"'), { cls: 'wipe' });
    s.step(3, person({ x: 150, y: 270, shirt: '#7c3aed', s: 0.5, fc: 'shock', armL: [-20, -30], armR: [20, -30] }) + star(440, 40, 5, '#fff') + star(80, 50, 4, '#fff') + star(340, 30, 5, '#fff'), { cls: 'up' });
  }],
  ['ingredient', '#16a34a', '썰어 둔 채소와 재료를 냄비에 넣어 요리를 만든다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, table(150, 238, 260) + `<g transform="translate(110 226)">${E(0, -10, 16, 12, '#f59e0b')}${P('M30 -4L50 -34L56 -2Z', '#f97316')}${C(70, -10, 12, '#ef4444')}${P('M92 -2Q100 -26 112 -4Z', '#22c55e')}</g>`, { cls: 'up' });
    s.mv(2, 'translate(-80px,-40px)', `<g transform="translate(380 200)">${P('M-50 -30H50L40 20Q0 36 -40 20Z', '#475569')}${R(-56, -34, 112, 8, '#334155', 3)}</g>`, { d: 0.8 });
    s.step(3, L('M356 150Q364 130 356 110M380 150Q388 130 380 110M404 150Q412 130 404 110', '#cbd5e1', 4) + heart(380, 80, 0.7, '#ef4444') + chk(500, 56), { cls: 'pop' });
  }],
  ['appliance', '#2563eb', '전원을 꽂자 냉장고, 세탁기, 전자레인지 같은 가전이 작동한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(60, 80, 90, 170, '#e5e9f0', 8, 'stroke="#aab4c6" stroke-width="3"') + R(180, 150, 110, 100, '#e5e9f0', 8, 'stroke="#aab4c6" stroke-width="3"') + C(235, 200, 30, '#9fd8ff', 'stroke="#8a93a5" stroke-width="4"') + R(320, 190, 100, 60, '#475569', 8) + R(334, 200, 60, 40, '#1f2937', 4), { cls: 'up' });
    s.step(2, L('M440 250H500', '#1f2937', 5) + R(500, 238, 22, 24, '#1f2937', 4), { cls: 'wipe' });
    s.step(3, R(334, 200, 60, 40, '#fde68a', 4) + sparks(360, 130, 30, 44, '#ffd34d', 6, 3) + L('M80 110H130', '#38bdf8', 4) + chk(500, 56), { cls: 'pop' });
  }],
  ['deteriorate', '#78716c', '싱싱하던 사과가 갈색으로 무르다 썩어 가는 악화', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, apple(120, 226, 2.2), { cls: 'up', e: 1 });
    s.step(2, apple(280, 226, 2.2, '#b45309') + C(268, 190, 6, '#78350f') + C(296, 200, 5, '#78350f'), { e: 2 });
    s.step(3, apple(440, 226, 2.2, '#57402a') + C(424, 194, 8, '#2a1a12') + C(460, 204, 7, '#2a1a12') + C(500, 150, 4, '#2a2e3a') + C(400, 130, 4, '#2a2e3a') + arrow(300, 100, 440, 100, '#78716c', 4, 10), { cls: 'pop' });
  }],
  ['recipient', '#ec4899', '선물 상자를 두 손으로 받아 든 기쁜 수령인', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#3b82f6', armR: [60, -10] }) + `<g transform="translate(230 190)">${R(-24, -24, 48, 40, '#f43f5e', 4)}${R(-4, -24, 8, 40, '#fff')}${R(-24, -6, 48, 8, '#fff')}</g>`, { cls: 'up', e: 2 });
    s.mv(2, 'translateX(-90px)', `<g transform="translate(380 190)">${R(-24, -24, 48, 40, '#f43f5e', 4)}${R(-4, -24, 8, 40, '#fff')}${R(-24, -6, 48, 8, '#fff')}</g>`, { d: 0.8 });
    s.step(2, person({ x: 450, y: 254, shirt: '#ec4899', hs: 'long', fc: 'shy', armL: [-60, -10] }), { cls: 'up' });
    s.step(3, heart(420, 110, 0.9, '#ef4444') + sparks(420, 120, 36, 50, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['transaction', '#ca8a04', '돈을 내고 물건을 받으며 서로 맞바꾸는 거래', (s) => {
    s.sky('sun'); s.ground('floor', 252);
    s.step(1, person({ x: 120, y: 254, shirt: '#ca8a04', armR: [34, -4] }) + person({ x: 440, y: 254, shirt: '#334155', hs: 'long', armL: [-34, -4] }) + R(230, 214, 100, 14, '#a0602e', 4), { cls: 'up' });
    s.mv(2, 'translateX(-60px)', coin(250, 190, 14), { d: 0.8 });
    s.mv(2, 'translateX(60px)', bag(310, 206, 1, '#d9772e'), { d: 0.8 });
    s.step(3, arrow(260, 150, 320, 150, '#ca8a04', 4, 10) + arrow(320, 170, 260, 170, '#ca8a04', 4, 10) + chk(500, 56), { cls: 'pop' });
  }],
  ['expertise', '#0d9488', '고장 난 시계를 능숙한 솜씨로 척척 고쳐 내는 전문 기술', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(280, 238, 340) + C(280, 200, 36, '#fff', 'stroke="#8a93a5" stroke-width="5"') + L('M280 200V176M280 200L296 208', '#6b7384', 4) + cross(340, 150), { cls: 'up', e: 2 });
    s.step(2, person({ x: 130, y: 254, shirt: '#0d9488', fc: 'think', armR: [90, -20], hat: '<g fill="none" stroke="#2a2e3a" stroke-width="2"><circle cx="6" cy="-83" r="6"/></g>' }) + gear(280, 200, 20, '#ca8a04'), { cls: 'up' });
    s.step(3, C(280, 200, 36, '#fff', 'stroke="#8a93a5" stroke-width="5"') + L('M280 200V176M280 200L296 190', '#2a2e3a', 4) + chk(340, 150) + `<g transform="translate(460 100)">${C(0, 0, 18, '#ffd34d', 'stroke="#d99a00" stroke-width="3"')}${star(0, 0, 9, '#fff')}${P('M-12 16L-18 40L-6 34L0 42V18Z M12 16L18 40L6 34L0 42V18Z', '#ef4444')}</g>`, { cls: 'pop' });
  }],
  ['inferior', '#6b7280', '높은 단 위 존재에 비해 한참 아래 단에 선 열등한 처지', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, stairs(280, 252), { cls: 'up' });
    s.step(2, person({ x: 430, y: 162, shirt: '#16a34a', fc: 'cheer', s: 0.9 }) + person({ x: 130, y: 222, shirt: '#6b7280', fc: 'sad', s: 0.7, armL: [-6, 24], armR: [6, 24] }), { cls: 'up' });
    s.step(3, arrow(130, 90, 130, 150, '#6b7280', 6, 14) + crown(430, 62, 0.9) + L('M170 200L330 140', '#6b7280', 3, 'stroke-dasharray="5 7"'), { cls: 'pop' });
  }],
  ['facilitate', '#16a34a', '계단 대신 경사로를 만들자 짐이 수월하게 미끄러져 오른다', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, R(250, 220, 60, 30, '#cbd5e1', 3) + R(310, 190, 60, 60, '#cbd5e1', 3) + R(370, 160, 100, 90, '#cbd5e1', 3) + person({ x: 130, y: 262, shirt: '#16a34a', fc: 'sad', armR: [30, 4] }) + box(190, 250, 50, 40), { cls: 'up' });
    s.step(2, P('M210 250L370 160V250Z', '#f59e0b', 'stroke="#b45309" stroke-width="3"'), { cls: 'wipe' });
    s.step(3, arrow(220, 220, 340, 160, '#16a34a', 5, 12) + person({ x: 130, y: 262, shirt: '#16a34a', fc: 'cheer', armR: [30, -10] }) + chk(500, 56), { cls: 'pop' });
  }],
  ['coverage', '#dc2626', '사건 현장을 카메라로 담아 텔레비전으로 보도하는 취재', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, building(110, 250, 80, 150, '#9fb4d0') + flame(110, 108, 1.1) + flame(90, 118, 0.7), { cls: 'up' });
    s.step(2, person({ x: 280, y: 262, shirt: '#dc2626', hs: 'long', fc: 'smile', armR: [30, -20] }) + R(300, 190, 30, 20, '#475569', 4) + `<g transform="translate(340 210)">${R(-6, -10, 26, 20, '#1f2937', 3)}${C(26, 0, 8, '#9fd8ff')}</g>`, { cls: 'up' });
    s.step(3, `<g transform="translate(450 150)">${R(-60, -40, 120, 80, '#1f2937', 10)}${R(-52, -32, 104, 64, '#9fd8ff', 4)}${flame(0, 20, 0.6)}${R(-20, 40, 40, 8, '#475569', 2)}</g>` + L('M370 190L400 170', '#dc2626', 3, 'stroke-dasharray="4 6"') + sparks(450, 150, 76, 90, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
];

function spiderL(x, y) { return `<g transform="translate(${x} ${y})">${C(0, 0, 10, '#1f2937')}${C(0, -12, 6, '#1f2937')}${L('M-8 -2L-22 -10M-8 2L-22 6M8 -2L22 -10M8 2L22 6M-6 -6L-18 -18M6 -6L18 -18M-6 6L-16 16M6 6L16 16', '#1f2937', 2.4)}</g>`; }
