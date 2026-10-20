import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const gift = (x, y, k = 1, col = '#f43f5e') => `<g transform="translate(${x} ${y}) scale(${k})">${R(-22, -22, 44, 38, col, 4)}${R(-4, -22, 8, 38, '#fff')}${R(-22, -6, 44, 8, '#fff')}</g>`;
const flower = (x, y, k = 1, col = '#f472b6') => `<g transform="translate(${x} ${y}) scale(${k})">${L('M0 0V-60', '#3f8f3a', 5)}${P('M0 -24C-18 -34 -30 -22 -20 -10Z', '#5fb85a')}${[0, 1, 2, 3, 4].map((i) => C(Math.cos((i / 5) * 6.28) * 14, -68 + Math.sin((i / 5) * 6.28) * 14, 11, col)).join('')}${C(0, -68, 8, '#facc15')}</g>`;
const beeL = (x, y) => `<g transform="translate(${x} ${y})">${E(0, 0, 12, 8, '#facc15', 'stroke="#2a1a12" stroke-width="2"')}${L('M-4 -6V6M2 -6V6', '#2a1a12', 3)}${E(-4, -10, 8, 5, '#e6f6ff', 'fill-opacity=".9"')}${E(6, -10, 8, 5, '#e6f6ff', 'fill-opacity=".9"')}</g>`;

export default [
  ['reciprocate', '#ec4899', '선물을 받은 사람이 답례로 다시 선물을 돌려주는 보답', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, person({ x: 110, y: 254, shirt: '#3b82f6', fc: 'smile', armR: [40, -4] }) + person({ x: 450, y: 254, shirt: '#ec4899', hs: 'long', fc: 'smile', armL: [-40, -4] }), { cls: 'up' });
    s.mv(2, 'translateX(-130px)', gift(300, 200, 1, '#3b82f6'), { d: 0.8 });
    s.mv(3, 'translateX(130px)', gift(260, 200, 1, '#f43f5e'), { d: 0.8 });
    s.step(3, heart(280, 100, 1, '#ef4444') + arrow(240, 150, 320, 150, '#ec4899', 4, 10), { cls: 'pop' });
  }],
  ['inspection', '#0891b2', '작업대 위 제품을 하나씩 살펴 불량품은 골라낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(40, 190, 480, 20, '#6b7384', 6) + [90, 200, 310, 420].map((x) => R(x, 150, 50, 40, '#9ca3af', 4, 'stroke="#6b7280" stroke-width="2"')).join(''), { cls: 'up' });
    s.step(2, person({ x: 280, y: 254, shirt: '#0891b2', fc: 'think', armR: [30, -40], hat: hatCap('#0891b2') }) + magnifier(210, 130, 1.1), { cls: 'up' });
    s.step(3, chk(115, 120, 16) + cross(225, 120, 16) + chk(335, 120, 16) + chk(445, 120, 16), { cls: 'pop' });
  }],
  ['retrieve', '#16a34a', '던진 공을 개가 달려가 물고 다시 되찾아 온다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 130, y: 262, shirt: '#16a34a', fc: 'cheer', armR: [30, -50] }) + dog(210, 258, 1.4, '#b9772e'), { cls: 'up', e: 1 });
    s.step(2, L('M180 130Q300 40 440 220', '#16a34a', 3, 'stroke-dasharray="6 8"') + ball(440, 230, 12) + dog(380, 258, 1.4, '#b9772e'), { e: 2 });
    s.mv(3, 'translateX(240px)', dog(220, 258, 1.4, '#b9772e') + ball(256, 220, 12), { d: 1.2 });
    s.step(3, person({ x: 130, y: 262, shirt: '#16a34a', fc: 'cheer', armR: [30, -10] }) + heart(200, 150, 0.7, '#ef4444'), { cls: 'pop' });
  }],
  ['solitary', '#6b7280', '노을 진 빈 공원 벤치에 홀로 앉은 쓸쓸한 사람', (s) => {
    s.sky('dusk'); s.ground('grass', 246);
    s.step(1, lampPost(430, 250) + tree(110, 252, 0.9), { cls: 'up' });
    s.step(2, R(220, 214, 120, 10, '#8c5a2a', 3) + R(230, 224, 8, 28, '#6b4a2a') + R(322, 224, 8, 28, '#6b4a2a') + R(220, 170, 120, 8, '#8c5a2a', 3) + person({ x: 280, y: 214, shirt: '#6b7280', fc: 'sad', legs: 'hide', armL: [-6, 24], armR: [6, 24], sh: false }), { cls: 'up' });
    s.step(3, E(360, 250, 80, 6, '#000', 'fill-opacity=".25"') + bird(80, 60, 0.8, '#6b7280') + bird(130, 90, 0.7, '#6b7280'), { cls: 'pop' });
  }],
  ['weary', '#78716c', '무거운 배낭을 메고 땀 흘리며 터덜터덜 걷다 지쳐 주저앉는다', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, L('M40 250H520', '#a8946c', 16) + sun(470, 70, 28, '#ffb347'), { cls: 'up' });
    s.step(2, person({ x: 220, y: 258, shirt: '#78716c', fc: 'sad', rot: 8, legs: 'walk', armL: [-6, 24], armR: [6, 24] }) + R(190, 180, 34, 46, '#c2410c', 8) + drop(200, 150, 0.8) + drop(240, 154, 0.8), { cls: 'up', e: 2 });
    s.step(3, person({ x: 330, y: 244, shirt: '#78716c', fc: 'sleep', legs: 'hide', rot: 16, armL: [-6, 24], armR: [6, 24], sh: false }) + R(300, 190, 40, 50, '#c2410c', 8) + L('M270 110L290 130M290 110L270 130', '#78716c', 4, 'stroke-opacity="0"'), { });
  }],
  ['superficial', '#dc2626', '겉은 번지르르한 사과가 속은 썩은 겉만의 것', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, apple(160, 230, 3.2) + sparks(160, 160, 60, 74, '#ffd34d', 8, 3), { cls: 'pop' });
    s.step(2, `<g transform="translate(400 230)">${C(0, -38, 42, '#e53e3e')}${P('M0 -80A42 42 0 0 1 0 4Z', '#fde8c8')}</g>`, { cls: 'pop' });
    s.step(3, `<g transform="translate(400 230)">${P('M0 -80A42 42 0 0 1 0 4Z', '#7a5a2a')}${C(14, -50, 6, '#2a1a12')}${C(20, -26, 5, '#2a1a12')}</g>` + cross(500, 56) + C(380, 170, 4, '#2a2e3a'), { cls: 'pop' });
  }],
  ['enthusiastic', '#f59e0b', '응원 도구를 흔들며 펄쩍 뛰어 열광하는 팬', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, person({ x: 280, y: 262, shirt: '#f59e0b', fc: 'cheer', armL: [-20, -30], armR: [20, -30] }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 280, y: 232, shirt: '#f59e0b', fc: 'cheer', armL: [-30, -56], armR: [30, -56] }), { e: 2 });
    s.step(3, person({ x: 280, y: 214, shirt: '#f59e0b', fc: 'cheer', armL: [-30, -56], armR: [30, -56] }) + star(180, 90, 10) + star(380, 80, 12) + star(240, 50, 8) + sparks(280, 120, 90, 108, '#ffd34d', 12, 4) + heart(120, 160, 0.7, '#ef4444') + heart(440, 160, 0.7, '#ef4444'), { });
  }],
  ['insulate', '#0ea5e9', '두툼한 단열재로 집을 감싸 찬 바람을 막고 따뜻하게 지킨다', (s) => {
    s.sky('gray'); s.ground('snow', 246);
    s.step(1, house(280, 252, 150, '#e8d0b0', '#8c5a2a') + `<g fill="#fff">${C(60, 60, 4)}${C(480, 90, 4)}${C(120, 120, 4)}${C(420, 50, 4)}</g>` + thermo(480, 250, 0.1, '#3b82f6'), { cls: 'up' });
    s.step(2, R(210, 180, 140, 74, 'none', 4, 'stroke="#f9a8d4" stroke-width="12"') + L('M200 180L280 130L360 180', '#f9a8d4', 12) + L('M60 100H150M40 130H130', '#fff', 5), { cls: 'wipe' });
    s.step(3, R(240, 200, 24, 24, '#ffe9a0', 3) + R(296, 200, 24, 24, '#ffe9a0', 3) + thermo(480, 250, 0.7, '#ef4444') + sparks(280, 140, 60, 76, '#ffd34d', 8, 3) + chk(500, 40), { cls: 'pop' });
  }],
  ['forge', '#ea580c', '불에 달군 쇠를 모루 위에서 망치로 두들겨 칼로 벼려 낸다', (s) => {
    s.sky('dark'); s.ground('stone', 252);
    s.step(1, `<g transform="translate(120 252)">${R(-60, -100, 120, 100, '#6b7384', 8)}${R(-40, -70, 80, 50, '#1f2937', 4)}${flame(0, -24, 0.8)}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(320 252)">${P('M-50 0L-40 -30H40L50 0Z', '#475569')}${R(-60, -46, 120, 18, '#6b7384', 4)}</g>` + R(270, 200, 80, 10, '#f97316', 3), { cls: 'up' });
    s.step(3, `<g transform="translate(360 150) rotate(-30)">${R(-4, -10, 8, 80, '#8c6238', 3)}${R(-26, -28, 52, 22, '#6b7384', 4)}</g>` + sparks(320, 196, 20, 44, '#ffd34d', 10, 4) + P('M260 200L360 196L372 204L360 210L260 208Z', '#cbd5e1'), { cls: 'pop' });
  }],
  ['integral', '#7c3aed', '마지막 퍼즐 조각이 딱 맞아 들어가야 비로소 완성되는 필수 부분', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(160, 80, 240, 160, '#c4b5fd', 8, 'stroke="#7c3aed" stroke-width="3"') + R(250, 140, 60, 60, '#eef2ff', 4, 'stroke="#7c3aed" stroke-width="3" stroke-dasharray="6 6"') + L('M160 140H250M310 140H400M160 200H250M310 200H400M250 80V140M250 200V240M310 80V140M310 200V240', '#7c3aed', 2, 'stroke-opacity=".5"'), { cls: 'up' });
    s.mv(2, 'translate(160px,-90px)', R(250, 140, 60, 60, '#ec4899', 6, 'stroke="#9d174d" stroke-width="3"'), { d: 0.9 });
    s.step(3, sparks(280, 170, 60, 80, '#ffd34d', 10, 4) + chk(480, 56), { cls: 'pop' });
  }],
  ['ritualize', '#7c3aed', '해마다 같은 절차로 촛불을 켜고 절하는 일을 의식처럼 되풀이한다', (s) => {
    s.sky('night'); s.ground('stone', 250);
    s.step(1, R(240, 206, 80, 40, '#7a461f', 3) + R(266, 170, 8, 30, '#fff3d2') + R(286, 170, 8, 30, '#fff3d2'), { cls: 'up' });
    s.step(2, `<g class="a-bob" style="animation-duration:.5s">${P('M270 168C264 158 268 152 270 146C274 152 276 158 270 168Z', '#ff9a1f')}${P('M290 168C284 158 288 152 290 146C294 152 296 158 290 168Z', '#ff9a1f')}</g>` + person({ x: 130, y: 262, shirt: '#7c3aed', fc: 'smile', rot: 16, armL: [10, 24], armR: [-10, 24] }), { cls: 'up' });
    s.step(3, sun(110, 70, 20, '#ffd34d') + moon(450, 70, 18, '#1b1f4a') + L('M150 60Q280 10 410 60', '#7c3aed', 4, 'stroke-dasharray="5 8"') + L('M410 110Q280 150 150 110', '#7c3aed', 4, 'stroke-dasharray="5 8"'), { cls: 'pop' });
  }],
  ['irrational', '#dc2626', '찌는 여름 해변에서 두꺼운 겨울 코트와 목도리를 걸친 앞뒤 안 맞는 행동', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, sun(450, 70, 34, '#ff8a1a') + sparks(450, 70, 44, 62, '#ffb347', 12, 4) + `<g transform="translate(110 246)">${R(-3, -80, 6, 80, '#8c6238')}${P('M-44 -80Q0 -122 44 -80Z', '#3b82f6')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 280, y: 262, shirt: '#7c2d12', fc: 'cheer', hat: '<rect x="-17" y="-70" width="34" height="10" rx="5" fill="#dc2626"/><rect x="-18" y="-96" width="36" height="6" rx="3" fill="#7c2d12"/>' }), { cls: 'up' });
    s.step(3, drop(250, 170, 0.9) + drop(312, 174, 0.9) + L('M240 150L226 140M320 150L334 140', '#dc2626', 4) + qm(280, 80, '#dc2626', 1.4) + cross(500, 56), { cls: 'pop' });
  }],
  ['proportion', '#0d9488', '조각이 전체에서 차지하는 알맞은 비율', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, C(170, 150, 70, '#bfdbfe', 'stroke="#2563eb" stroke-width="4"'), { cls: 'pop' });
    s.step(2, P('M170 150L170 80A70 70 0 0 1 231 185Z', '#2563eb') + P('M170 150L231 185A70 70 0 0 1 108 185Z', '#f59e0b'), { cls: 'pop' });
    s.step(3, R(340, 190, 40, 50, '#2563eb', 4) + R(390, 150, 40, 90, '#f59e0b', 4) + R(440, 120, 40, 120, '#22c55e', 4) + R(330, 240, 160, 4, '#6b7384') + chk(500, 50), { cls: 'up' });
  }],
  ['straightforward', '#16a34a', '돌아가지 않고 과녁을 향해 곧장 똑바로 나아가는 솔직한 방식', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, C(450, 160, 44, '#fff', 'stroke="#dc2626" stroke-width="6"') + C(450, 160, 26, '#fecaca', 'stroke="#dc2626" stroke-width="4"') + C(450, 160, 10, '#dc2626') + L('M450 204V250', '#8c6238', 6), { cls: 'up' });
    s.step(2, person({ x: 110, y: 262, shirt: '#16a34a', fc: 'smile', armR: [34, -10] }), { cls: 'up' });
    s.step(3, arrow(180, 160, 440, 160, '#16a34a', 6, 16) + sparks(450, 160, 50, 64, '#ffd34d', 8, 3) + chk(500, 50), { cls: 'wipe' });
  }],
  ['attentive', '#2563eb', '몸을 앞으로 기울이고 눈과 귀를 모아 귀 기울여 듣는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 420, y: 254, shirt: '#475569', fc: 'cheer', armL: [-40, -20] }) + bubble(340, 100, 100, 54, '#fff', 'r') + L('M300 92H380M300 108H370', '#aab4c6', 4), { cls: 'up' });
    s.step(2, person({ x: 150, y: 254, shirt: '#2563eb', fc: 'think', rot: -8, armL: [10, 10], armR: [-10, 10] }), { cls: 'up' });
    s.step(3, bulb(150, 110, 0.9) + L('M200 130L260 120', '#2563eb', 3, 'stroke-dasharray="4 6"') + chk(500, 56), { cls: 'pop' });
  }],
  ['sincerity', '#ec4899', '꾸밈없는 진심을 담은 손편지를 건네 마음을 전한다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 140, y: 254, shirt: '#ec4899', hs: 'long', fc: 'smile', armR: [40, -4] }) + `<g transform="translate(220 210)">${R(-22, -16, 44, 32, '#fff', 3, 'stroke="#aab4c6" stroke-width="2"')}${heart(0, 0, 0.5, '#ef4444')}</g>`, { cls: 'up' });
    s.mv(2, 'translateX(60px)', `<g transform="translate(300 210)">${R(-22, -16, 44, 32, '#fff', 3, 'stroke="#aab4c6" stroke-width="2"')}${heart(0, 0, 0.5, '#ef4444')}</g>`, { d: 0.8 });
    s.step(3, person({ x: 430, y: 254, shirt: '#3b82f6', fc: 'cry', armL: [-30, 6] }) + drop(410, 172, 0.7, '#8fd0ff') + heart(300, 120, 1, '#ef4444') + sparks(300, 130, 36, 50, '#ffd34d', 8, 3), { cls: 'up' });
  }],
  ['endeavor', '#ea580c', '땀 흘리며 바위를 언덕 위로 밀어 올리는 끈질긴 노력', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, P('M40 250L300 100L500 250Z', '#a8946c', 'stroke="#7a5a3a" stroke-width="3"') + flag(300, 100, '#ef4444', 40), { cls: 'up' });
    s.step(2, person({ x: 160, y: 218, shirt: '#ea580c', fc: 'angry', rot: 26, rotO: '0 0', legs: 'walk', armL: [40, -10], armR: [50, -6], s: 0.9 }) + C(210, 190, 30, '#8a7a68', 'stroke="#5f5242" stroke-width="3"') + drop(150, 150, 0.8), { cls: 'up', e: 2 });
    s.step(3, person({ x: 262, y: 138, shirt: '#ea580c', fc: 'cheer', rot: 26, rotO: '0 0', legs: 'walk', armL: [40, -10], armR: [50, -6], s: 0.9 }) + C(312, 106, 30, '#8a7a68', 'stroke="#5f5242" stroke-width="3"') + sparks(320, 70, 24, 38, '#ffd34d', 8, 3) + chk(500, 56), { });
  }],
  ['intrigue', '#7c3aed', '반짝이는 수상한 상자에 눈이 번쩍 뜨이고 궁금증이 솟는다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, R(360, 190, 90, 62, '#7a461f', 6, 'stroke="#4a2f18" stroke-width="3"') + P('M360 190Q360 160 405 160Q450 160 450 190Z', '#a8774a', 'stroke="#4a2f18" stroke-width="3"') + C(405, 200, 8, '#ffd34d'), { cls: 'up' });
    s.step(2, sparks(405, 170, 40, 60, '#ffd34d', 10, 4) + `<circle cx="405" cy="190" r="70" fill="#ffe9a0" fill-opacity=".2"/>`, { cls: 'pop' });
    s.step(3, person({ x: 160, y: 254, shirt: '#7c3aed', fc: 'think', rot: -8, armR: [30, -20] }) + qm(160, 80, '#7c3aed', 1.4) + star(100, 70, 6) + star(210, 60, 5), { cls: 'up' });
  }],
  ['notorious', '#7f1d1d', '수배 전단이 곳곳에 붙어 사람들이 수군거리는 악명', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, `<g transform="translate(150 150)">${R(-50, -70, 100, 130, '#e8d9b0', 3, 'stroke="#a89260" stroke-width="3"')}${C(0, -20, 26, '#ffd7b5', 'stroke="#a89260" stroke-width="2"')}${R(-18, -44, 36, 14, '#374151')}${L('M-34 30H34M-34 44H20', '#a89260', 3)}</g>`, { cls: 'pop' });
    s.step(2, `<g transform="translate(330 120)">${R(-34, -50, 68, 90, '#e8d9b0', 3, 'stroke="#a89260" stroke-width="3"')}${C(0, -14, 18, '#ffd7b5')}${R(-12, -32, 24, 10, '#374151')}</g>` + `<g transform="translate(450 150)">${R(-34, -50, 68, 90, '#e8d9b0', 3, 'stroke="#a89260" stroke-width="3"')}${C(0, -14, 18, '#ffd7b5')}${R(-12, -32, 24, 10, '#374151')}</g>`, { cls: 'pop' });
    s.step(3, person({ x: 250, y: 266, shirt: '#475569', s: 0.8, fc: 'shock', armR: [30, -30] }) + person({ x: 380, y: 266, shirt: '#6b7280', s: 0.8, hs: 'long', fc: 'shock', armL: [-30, -30] }) + L('M240 170L226 160M300 170L316 160', '#7f1d1d', 3), { cls: 'up' });
  }],
  ['prolific', '#16a34a', '쉬지 않고 책을 써내 책이 산더미처럼 쌓이는 다작', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(150, 238, 200) + person({ x: 150, y: 238, shirt: '#16a34a', legs: 'hide', fc: 'cheer', armR: [30, 10], sh: false }) + pencil(204, 200, 1.1, 40), { cls: 'up' });
    s.step(2, [[360, 252, '#ef4444'], [420, 252, '#3b82f6'], [390, 226, '#f59e0b']].map(([x, y, c]) => book(x, y, c, 50, 28)).join(''), { cls: 'up' });
    s.step(3, [[330, 252, '#8b5cf6'], [450, 252, '#22c55e'], [360, 198, '#ec4899'], [420, 198, '#06b6d4'], [390, 172, '#f59e0b'], [480, 226, '#ef4444']].map(([x, y, c]) => book(x, y, c, 50, 28)).join('') + chk(500, 40), { cls: 'up' });
  }],
  ['undermine', '#7c2d12', '성벽 밑을 몰래 파내려 가 탑을 기울게 만드는 약화', (s) => {
    s.sky('gray'); s.ground('soil', 190);
    s.step(1, R(0, 190, 560, 110, '#9a6a3a') + R(200, 70, 160, 120, '#b8bfcf', 4, 'stroke="#8a93a5" stroke-width="3"') + R(230, 40, 100, 30, '#a8aebd', 3), { cls: 'up', e: 2 });
    s.step(2, P('M200 190H360V250H200Z', '#4a2f18') + person({ x: 140, y: 270, shirt: '#7c2d12', s: 0.6, fc: 'angry', armR: [40, 10] }) + L('M170 250L200 230', '#8c6238', 5), { cls: 'up', e: 2 });
    s.step(3, `<g transform="translate(280 190) rotate(10 0 0)">${R(-80, -120, 160, 120, '#b8bfcf', 4, 'stroke="#8a93a5" stroke-width="3"')}${R(-50, -150, 100, 30, '#a8aebd', 3)}</g>` + P('M200 190H360V250H200Z', '#4a2f18') + L('M200 170L190 150M360 150L372 130', '#7c2d12', 4) + cross(500, 56), { });
  }],
  ['pollinate', '#f59e0b', '꿀벌이 꽃가루를 옮겨 묻혀 열매를 맺게 하는 수분', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, flower(130, 252, 1.4, '#f472b6') + flower(430, 252, 1.4, '#a78bfa') + beeL(150, 120), { cls: 'up', e: 1 });
    s.mv(2, 'translateX(-280px)', beeL(420, 130), { d: 1, e: 2 });
    s.step(2, flower(130, 252, 1.4, '#f472b6') + flower(430, 252, 1.4, '#a78bfa') + L('M190 110Q280 60 380 110', '#f59e0b', 3, 'stroke-dasharray="4 7"') + [[140, 110], [150, 120]].map(([x, y]) => C(x, y, 3, '#facc15')).join(''), { e: 2 });
    s.step(3, flower(130, 252, 1.4, '#f472b6') + flower(430, 252, 1.4, '#a78bfa') + apple(430, 252, 0.6) + C(420, 112, 4, '#facc15') + C(436, 118, 4, '#facc15') + heart(280, 100, 0.8, '#ef4444'), { });
  }],
  ['surge', '#0ea5e9', '잔잔하던 바다에서 파도가 솟구쳐 해안으로 몰려드는 급증', (s) => {
    s.sky('gray'); s.ground('water', 170);
    s.step(1, L('M0 170Q40 160 80 170T160 170T240 170T320 170T400 170T480 170T560 170', '#e6f6ff', 3) + R(380, 232, 180, 68, '#e8d6a8', 4), { cls: 'up', e: 1 });
    s.step(2, P('M0 170Q120 100 220 140T330 120V300H0Z', '#38bdf8', 'fill-opacity=".9"') + L('M0 170Q120 100 220 140', '#fff', 4), { cls: 'wipe', e: 2 });
    s.step(3, P('M0 300V150Q100 60 200 70Q330 70 390 160Q430 200 440 300Z', '#0ea5e9') + P('M180 70Q260 60 300 100Q250 90 220 120Z', '#fff') + arrow(160, 60, 340, 60, '#0ea5e9', 6, 14) + [[470, 250], [510, 270]].map(([x, y]) => C(x, y, 8, '#fff', 'fill-opacity=".8"')).join(''), { cls: 'wipe' });
  }],
  ['vendor', '#ea580c', '파라솔 아래 수레에서 길거리 음식을 파는 노점 상인', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, `<g transform="translate(300 250)">${R(-70, -70, 140, 50, '#a0602e', 4)}${C(-40, -14, 16, '#1f2937')}${C(40, -14, 16, '#1f2937')}${R(-3, -170, 6, 100, '#8c5a2a')}${P('M-80 -150Q0 -200 80 -150Z', '#ef4444')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 300, y: 214, shirt: '#ea580c', hat: hatCap('#fff'), fc: 'cheer', legs: 'hide', armL: [-30, -6], sh: false }) + [[270, 190], [300, 190], [330, 190]].map(([x, y], i) => E(x, y, 14, 8, ['#f59e0b', '#ef4444', '#22c55e'][i])).join(''), { cls: 'up' });
    s.step(3, person({ x: 130, y: 262, shirt: '#3b82f6', fc: 'smile', armR: [34, -4] }) + coin(190, 200, 12) + chk(500, 56), { cls: 'up' });
  }],
  ['utter', '#2563eb', '아기가 처음으로 소리 내어 말을 내뱉자 부모가 기뻐한다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 250, y: 262, shirt: '#fde8c8', s: 0.6, fc: 'cheer', armL: [-14, -10], armR: [14, -10] }), { cls: 'up' });
    s.step(2, bubble(330, 130, 80, 50, '#fff', 'l') + L('M310 124H350M310 140H340', '#aab4c6', 4) + L('M300 190Q320 180 340 190', '#2563eb', 3, 'stroke-dasharray="3 6"'), { cls: 'pop' });
    s.step(3, person({ x: 110, y: 254, shirt: '#3b82f6', fc: 'cheer', armR: [14, -50] }) + person({ x: 450, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armL: [-14, -50] }) + heart(280, 80, 0.9, '#ef4444'), { cls: 'up' });
  }],
  ['deference', '#7c3aed', '어르신이 오시자 자리를 내어 드리며 공손히 머리 숙여 존중을 표한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(240, 200, 120, 10, '#8c5a2a', 3) + R(250, 210, 8, 42, '#6b4a2a') + R(342, 210, 8, 42, '#6b4a2a') + R(240, 156, 120, 8, '#8c5a2a', 3) + person({ x: 300, y: 200, shirt: '#3b82f6', fc: 'smile', legs: 'hide', sh: false }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 460, y: 254, shirt: '#94a3b8', hair: '#e5e7eb', fc: 'smile', rot: 6, armR: [10, 24] }) + L('M490 190L498 254', '#8c6238', 5), { cls: 'up' });
    s.step(3, R(240, 200, 120, 10, '#8c5a2a', 3) + R(250, 210, 8, 42, '#6b4a2a') + R(342, 210, 8, 42, '#6b4a2a') + R(240, 156, 120, 8, '#8c5a2a', 3) + person({ x: 150, y: 254, shirt: '#3b82f6', fc: 'smile', rot: 20, armL: [10, 24], armR: [-10, 24] }) + heart(300, 100, 0.8, '#ef4444'), { });
  }],
  ['affirmative', '#16a34a', '동그라미 팻말을 번쩍 들어 긍정의 뜻을 분명히 밝힌다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, bubble(300, 90, 130, 56, '#fff', 'l') + qm(300, 90, '#6366f1', 1.1) + person({ x: 130, y: 254, shirt: '#6366f1', fc: 'think' }), { cls: 'up' });
    s.step(2, person({ x: 430, y: 254, shirt: '#16a34a', fc: 'cheer', armL: [-20, -60] }) + `<g transform="translate(410 150)">${C(0, 0, 30, '#fff', 'stroke="#16a34a" stroke-width="8"')}</g>`, { cls: 'up' });
    s.step(3, chk(280, 150, 40) + sparks(280, 150, 52, 68, '#ffd34d', 10, 3), { cls: 'pop' });
  }],
  ['barren', '#a16207', '푸르던 땅이 가물어 쩍쩍 갈라진 메마른 불모지', (s) => {
    s.sky('sun'); s.ground('sand', 220);
    s.step(1, tree(150, 230, 1.2) + R(0, 220, 560, 80, '#6fbf4a') + sun(450, 70, 30, '#ff9a1f'), { cls: 'up', e: 1 });
    s.step(2, R(0, 220, 560, 80, '#d9bd7a') + sparks(450, 70, 40, 58, '#ffb347', 12, 4), { e: 2 });
    s.step(3, R(0, 220, 560, 80, '#c9a257') + L('M60 240L100 260L80 290M200 236L240 270L220 296M340 240L380 262M460 250L500 280L480 296', '#7a5a2a', 4) + `<g transform="translate(280 230)">${L('M0 0V-90M0 -50L-30 -80M0 -66L26 -92', '#6b5a3a', 7)}</g>` + cross(500, 40), { });
  }],
  ['candid', '#0ea5e9', '가면을 벗고 숨김없이 솔직한 맨얼굴을 보여 준다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 200, y: 254, shirt: '#0ea5e9', fc: 'smile', hat: '<ellipse cx="0" cy="-84" rx="18" ry="12" fill="#a78bfa" stroke="#6d28d9" stroke-width="2"/>' }), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(330 140) rotate(20)"><ellipse cx="0" cy="0" rx="18" ry="12" fill="#a78bfa" stroke="#6d28d9" stroke-width="2"/></g>` + person({ x: 200, y: 254, shirt: '#0ea5e9', fc: 'neutral', armR: [30, -50] }), { e: 2 });
    s.step(3, person({ x: 200, y: 254, shirt: '#0ea5e9', fc: 'cheer', armL: [-30, -10], armR: [30, -10] }) + sparks(200, 160, 40, 56, '#ffd34d', 8, 3) + heart(300, 110, 0.8, '#ef4444') + chk(500, 56), { });
  }],
  ['combustion', '#dc2626', '성냥불이 장작에 옮겨붙어 산소를 먹고 활활 타오르는 연소', (s) => {
    s.sky('dusk'); s.ground('soil', 250);
    s.step(1, L('M210 250L350 230M350 250L210 230M240 250L320 226', '#6b4a2a', 14), { cls: 'up' });
    s.step(2, `<g transform="translate(150 150) rotate(-30)">${R(-3, 0, 6, 50, '#e8c25a', 2)}${C(0, -6, 8, '#dc2626')}</g>` + flame(150, 120, 0.4), { cls: 'pop' });
    s.step(3, flame(280, 236, 2) + flame(240, 240, 1.4) + flame(320, 240, 1.3) + arrow(100, 200, 190, 220, '#38bdf8', 4, 10) + arrow(460, 200, 370, 220, '#38bdf8', 4, 10) + `<g fill="#6b7280" fill-opacity=".6">${C(280, 70, 18)}${C(300, 50, 14)}</g>`, { cls: 'pop' });
  }],
  ['communal', '#16a34a', '마을 사람들이 큰 솥 하나를 함께 나눠 먹는 공동의 식사', (s) => {
    s.sky('warm'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(280 250)">${P('M-60 -50H60L48 0Q0 18 -48 0Z', '#475569')}${R(-66, -56, 132, 10, '#334155', 3)}${L('M-30 -60Q-24 -80 -30 -100M0 -60Q6 -80 0 -100M30 -60Q36 -80 30 -100', '#cbd5e1', 4)}</g>`, { cls: 'up' });
    s.step(2, [90, 170, 390, 470].map((x, i) => person({ x, y: 266, shirt: ['#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'][i], hs: i % 2 ? 'long' : 'short', s: 0.8, fc: 'cheer' })).join(''), { cls: 'up' });
    s.step(3, heart(280, 70, 1, '#ef4444') + sparks(280, 80, 40, 54, '#ffd34d', 8, 3) + [[130, 222], [210, 224], [350, 224], [430, 222]].map(([x, y]) => E(x, y, 14, 6, '#fff', 'stroke="#d6dbe5" stroke-width="2"')).join(''), { cls: 'pop' });
  }],
  ['disobedience', '#dc2626', '"마르지 않은 페인트" 팻말을 무시하고 손을 대 버리는 불복종', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(300, 90, 200, 160, '#60a5fa', 4) + R(380, 100, 8, 150, '#2563eb', 0, 'fill-opacity="0"') + `<g transform="translate(250 252)">${R(-3, -100, 6, 100, '#8c6238')}${P('M-40 -140H40V-96H-40Z', '#facc15', 'stroke="#d99a00" stroke-width="3"')}${L('M-26 -128H26M-26 -112H18', '#1f2937', 3)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 130, y: 254, shirt: '#dc2626', fc: 'smirk', armR: [30, -4] }) + cross(250, 70), { cls: 'up', e: 2 });
    s.step(3, person({ x: 360, y: 254, shirt: '#dc2626', fc: 'shock', armR: [30, -30], armL: [-6, 28] }) + C(396, 186, 12, '#2563eb') + L('M390 186L420 220', '#2563eb', 6), { cls: 'up' });
  }],
  ['console', '#0ea5e9', '슬퍼하는 친구에게 휴지를 건네며 곁에서 위로해 준다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 360, y: 254, shirt: '#94a3b8', fc: 'cry', armL: [-14, -20], armR: [14, -20] }) + drop(340, 170, 0.7) + drop(380, 174, 0.7), { cls: 'up' });
    s.step(2, person({ x: 180, y: 254, shirt: '#0ea5e9', hs: 'long', fc: 'smile', armR: [90, 0] }) + R(250, 184, 30, 24, '#fff', 4, 'stroke="#aab4c6" stroke-width="2"'), { cls: 'up' });
    s.step(3, person({ x: 360, y: 254, shirt: '#94a3b8', fc: 'smile', armL: [-30, -4] }) + heart(280, 110, 1, '#ef4444'), { });
  }],
  ['contagion', '#65a30d', '재채기로 퍼진 병균이 옆 사람에게 차례차례 옮아 모두 병이 난다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    const xs = [100, 220, 340, 460], shirts = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];
    const germ = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${L('M0 -11V11M-11 0H11M-8 -8L8 8M8 -8L-8 8', '#4d7c0f', 2.4)}${C(0, 0, 7, '#84cc16', 'stroke="#4d7c0f" stroke-width="2"')}</g>`;
    const who = (i, fc, skin) => person({ x: xs[i], y: 254, shirt: shirts[i], hs: i === 2 ? 'long' : 'short', fc, skin, sh: false });
    s.step(1, who(0, 'sick', '#cfe8a9') + germ(136, 152, 0.9) + germ(154, 170, 0.7), { cls: 'up' });
    s.step(1, who(1, 'smile'), { cls: 'up', e: 1 });
    s.step(1, who(2, 'smile') + who(3, 'smile'), { cls: 'up', e: 2 });
    s.step(2, who(1, 'sick', '#cfe8a9') + arrow(128, 128, 192, 128, '#65a30d', 4, 10) + germ(176, 108, 0.7) + germ(256, 152, 0.8), {});
    s.step(3, who(2, 'sick', '#cfe8a9') + who(3, 'sick', '#cfe8a9') + arrow(248, 128, 312, 128, '#65a30d', 4, 10) + arrow(368, 128, 432, 128, '#65a30d', 4, 10) + germ(376, 152, 0.8) + germ(496, 156, 0.7) + cross(520, 40, 18), {});
  }],
  ['contempt', '#7f1d1d', '내민 손을 거들떠보지도 않고 팔짱 낀 채 고개를 쳐들고 가 버리는 경멸', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 170, y: 254, shirt: '#94a3b8', s: 0.85, fc: 'smile', armR: [46, -4] }), { cls: 'up', e: 2 });
    s.step(1, person({ x: 380, y: 254, shirt: '#7f1d1d', fc: 'neutral' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 380, y: 254, shirt: '#7f1d1d', fc: 'sleep', rot: 12, armL: [16, -10], armR: [-16, -10] }) + L('M396 172Q404 166 412 170', '#2a1a12', 2.6) + L('M414 176L432 170M414 182L434 182', '#94a3b8', 3), { e: 2 });
    s.mv(3, 'translateX(-80px)', person({ x: 460, y: 254, shirt: '#7f1d1d', fc: 'sleep', rot: 12, legs: 'walk', armL: [16, -10], armR: [-16, -10] }) + L('M476 172Q484 166 492 170', '#2a1a12', 2.6), { d: 0.9 });
    s.step(3, person({ x: 170, y: 254, shirt: '#94a3b8', s: 0.85, fc: 'sad', armR: [14, 28] }) + drop(156, 186, 0.6) + cross(500, 56), {});
  }],
  ['dissent', '#dc2626', '모두가 찬성하는데 홀로 손을 들어 반대 의견을 낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [90, 190, 390, 470].map((x, i) => person({ x, y: 254, shirt: '#22c55e', hs: i % 2 ? 'long' : 'short', fc: 'cheer', armR: [14, -56], s: 0.85, sh: false })).join(''), { cls: 'up' });
    s.step(2, person({ x: 290, y: 254, shirt: '#dc2626', fc: 'angry', armL: [-14, -56], s: 0.85 }), { cls: 'up' });
    s.step(3, cross(290, 90, 24) + L('M90 90L190 90M390 90L470 90', '#22c55e', 5, 'stroke-opacity="0"') + chk(140, 90, 18) + chk(430, 90, 18), { cls: 'pop' });
  }],
];

function lampPost(x, y) { return `<g transform="translate(${x} ${y})"><rect x="-3" y="-90" width="6" height="90" fill="#6b7384"/><path d="M-24 -90L-12 -116H12L24 -90Z" fill="#ffd34d"/><circle cx="0" cy="-86" r="34" fill="#ffe9a0" fill-opacity=".35"/></g>`; }
