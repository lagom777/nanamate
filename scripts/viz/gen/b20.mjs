import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const spiral = (x, y, col = '#7c3aed') => L(`M${x} ${y}a4 4 0 1 1 4 4a8 8 0 1 1 -8 -8a12 12 0 1 1 12 12`, col, 2.4);

export default [
  ['incompetent', '#6b7280', '서툰 손놀림에 연장을 놓치고 일을 망쳐 상사에게 한심한 눈길을 받는 무능', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#6b7280', fc: 'cheer', armR: [40, -10] }) + R(240, 210, 80, 10, '#8c5a2a', 3) + R(260, 160, 40, 50, '#c99a5b', 4), { cls: 'up' });
    s.step(2, person({ x: 150, y: 254, shirt: '#6b7280', fc: 'shock', rot: -8, armR: [40, 20] }) + `<g transform="translate(230 220) rotate(70)">${R(-4, -10, 8, 60, '#8c6238', 3)}${R(-22, -22, 44, 16, '#8a93a5', 3)}</g>` + drop(130, 160, 0.8), { cls: 'pop' });
    s.step(3, person({ x: 440, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: tie, fc: 'angry', armL: [-24, -10] }) + cross(500, 56) + R(260, 210, 60, 40, '#c99a5b', 4, 'transform="rotate(20 290 230)"'), { cls: 'up' });
  }],
  ['insanity', '#7c3aed', '눈이 소용돌이치고 머리카락이 곤두서 생각이 뒤죽박죽 미쳐 버린 광기', (s) => {
    s.sky('dark'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#7c3aed', fc: 'neutral' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 280, y: 254, shirt: '#7c3aed', fc: 'shock' }) + L('M200 90Q220 60 250 80T290 60T340 90', '#a78bfa', 4) + L('M210 130Q240 110 270 130T330 120', '#c4b5fd', 4), { e: 2 });
    s.step(3, person({ x: 280, y: 254, shirt: '#7c3aed', fc: 'cheer', armL: [-30, -40], armR: [30, -40] }) + L('M262 166H274M286 166H298', '#a78bfa', 0.1, 'stroke-opacity="0"') + spiral(268, 170) + spiral(292, 170) + L('M260 150L250 120M280 148V116M300 150L310 120', '#2a1a12', 5) + L('M190 80L210 60M370 70L350 50', '#ffd34d', 4) + star(200, 120, 8, '#fff') + star(360, 110, 8, '#fff'), { });
  }],
  ['insurmountable', '#475569', '구름까지 닿는 거대한 벽 앞에서 사다리가 턱없이 모자라 넘을 수 없다', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, R(300, 0, 120, 250, '#9ca3af', 6, 'stroke="#6b7280" stroke-width="3"') + cloud(360, 60, 1.4), { cls: 'up' });
    s.step(2, person({ x: 160, y: 262, shirt: '#475569', fc: 'shock', s: 0.8 }), { cls: 'up' });
    s.step(3, L('M230 250L250 120M280 250L300 120', '#8c6238', 6) + [200, 160, 130].map((y) => L(`M${240 + (250 - y) * 0.2} ${y + 40}H${290 + (250 - y) * 0.2}`, '#8c6238', 5)).join('') + cross(500, 56) + L('M270 90L290 70', '#475569', 3, 'stroke-opacity="0"'), { cls: 'up' });
  }],
  ['introspective', '#6366f1', '눈을 감고 자기 마음속을 들여다보며 스스로를 성찰한다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, person({ x: 170, y: 254, shirt: '#6366f1', fc: 'sleep', armR: [16, -34] }), { cls: 'up' });
    s.step(2, E(350, 120, 110, 70, '#fff', 'stroke="#aab4c6" stroke-width="3"') + C(236, 170, 5, '#fff') + C(262, 150, 8, '#fff'), { cls: 'pop' });
    s.step(3, person({ x: 350, y: 156, shirt: '#6366f1', fc: 'think', s: 0.5, sh: false, legs: 'hide' }) + heart(420, 110, 0.5, '#ef4444') + gear(300, 100, 12, '#aab4c6') + sparks(350, 120, 80, 94, '#c7d2fe', 8, 3), { cls: 'pop' });
  }],
  ['intuitive', '#f59e0b', '따져 보지 않고도 번뜩이는 직감으로 맞는 문을 골라낸다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, door(300, 252, 70, 130, '#7a461f') + door(420, 252, 70, 130, '#7a461f') + person({ x: 130, y: 254, shirt: '#f59e0b', fc: 'think' }), { cls: 'up' });
    s.step(2, bulb(130, 100, 0.9) + heart(150, 160, 0.6, '#ec4899') + sparks(130, 100, 34, 48, '#ffd34d', 8, 3), { cls: 'pop' });
    s.step(3, `<path d="M390 252V122L420 110V252Z" fill="#ffe9a0" fill-opacity=".8"/>` + chk(420, 90, 22) + coin(440, 220, 12), { cls: 'pop' });
  }],
  ['irreplaceable', '#ca8a04', '수많은 열쇠 중 오직 하나뿐인 금 열쇠만이 자물쇠에 맞아 대신할 수 없다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [90, 150, 210].map((x) => key(x, 180, 1.1, '#9ca3af')).join('') + lock(420, 230, 1.6), { cls: 'up' });
    s.step(2, key(280, 130, 1.5, '#ffd34d') + sparks(280, 130, 40, 56, '#ffd34d', 8, 3), { cls: 'pop' });
    s.step(3, L('M300 150L400 190', '#ca8a04', 3, 'stroke-dasharray="5 7"') + chk(440, 150) + cross(150, 120, 18), { cls: 'pop' });
  }],
  ['meticulous', '#0891b2', '핀셋으로 작은 부품을 하나하나 줄 맞춰 꼼꼼하게 놓는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(100, 190, 360, 14, '#a0602e', 5) + [140, 180, 220, 260].map((x, i) => C(x, 180, 7, ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'][i])).join(''), { cls: 'up' });
    s.step(2, magnifier(340, 130, 1.1) + `<g transform="translate(240 120) rotate(30)">${L('M0 0L50 40', '#aab4c6', 4)}${L('M8 -6L56 30', '#aab4c6', 4)}</g>`, { cls: 'pop' });
    s.step(3, [140, 180, 220, 260, 300, 340, 380, 420].map((x, i) => C(x, 160, 7, ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'][i % 4])).join('') + L('M120 172H440', '#0891b2', 2, 'stroke-dasharray="4 5"') + chk(500, 50), { cls: 'pop' });
  }],
  ['legacy', '#16a34a', '할아버지가 심은 묘목이 자라 손주에게 그늘을 드리우는 유산', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 120, y: 262, shirt: '#94a3b8', hair: '#e5e7eb', fc: 'smile', armR: [40, 10] }) + `<g transform="translate(180 252)">${R(-10, -8, 20, 8, '#7a5230', 3)}${L('M0 -8V-28', '#3f8f3a', 4)}${P('M0 -22C-10 -30 -16 -22 -10 -16Z', '#5fb85a')}</g>`, { cls: 'up', e: 2 });
    s.step(2, tree(300, 252, 1.1) + E(300, 252, 60, 8, '#000', 'fill-opacity=".15"'), { cls: 'up', e: 2 });
    s.step(3, tree(300, 252, 1.7) + person({ x: 420, y: 262, shirt: '#f59e0b', s: 0.7, fc: 'cheer' }) + person({ x: 120, y: 262, shirt: '#94a3b8', hair: '#e5e7eb', fc: 'smile', s: 0.8 }) + heart(300, 40, 0.9, '#ef4444'), { });
  }],
  ['leisurely', '#16a34a', '서두르지 않고 느긋하게 거닐다 나무 그늘에서 쉬어 가는 여유', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, L('M40 250Q200 230 340 250T520 240', '#a8946c', 16) + tree(440, 250, 1), { cls: 'up' });
    s.mv(2, 'translateX(-160px)', person({ x: 300, y: 262, shirt: '#16a34a', fc: 'smile', legs: 'walk', armR: [14, 24] }), { d: 1.4, ease: 'linear' });
    s.step(3, person({ x: 410, y: 262, shirt: '#16a34a', fc: 'sleep', armL: [-6, 24], armR: [6, 24] }) + cup(450, 250, 0.8) + heart(330, 90, 0.7, '#ef4444'), { cls: 'up' });
  }],
  ['mandatory', '#2563eb', '헬멧 착용 표지판 앞에서 헬멧을 써야만 통과할 수 있는 의무', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, `<g transform="translate(400 250)">${R(-3, -140, 6, 140, '#6b7384')}${C(0, -150, 32, '#2563eb', 'stroke="#fff" stroke-width="4"')}${P('M-18 -146Q0 -176 18 -146Z', '#fff')}${R(-20, -146, 40, 6, '#fff', 2)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 150, y: 262, shirt: '#16a34a', fc: 'think', armR: [20, -30] }) + R(300, 190, 6, 60, '#ef4444', 2) + R(300, 190, 70, 8, '#ef4444', 2, 'fill-opacity="0"'), { cls: 'up', e: 2 });
    s.step(3, person({ x: 150, y: 262, shirt: '#16a34a', fc: 'smile', hat: '<path d="M-19 -88Q0 -112 19 -88Z" fill="#facc15"/><rect x="-22" y="-92" width="44" height="7" rx="3" fill="#facc15"/>' }) + chk(500, 56) + arrow(200, 150, 290, 150, '#2563eb', 5, 12), { });
  }],
  ['maternity', '#ec4899', '아기를 품은 어머니가 아기 침대를 준비하고 품에 안는 모성', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 200, y: 254, shirt: '#ec4899', hs: 'bun', fc: 'smile', armL: [20, 10], armR: [20, 14] }) + E(214, 200, 24, 22, '#ec4899') + heart(214, 190, 0.5, '#fff'), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(420 252)">${R(-50, -40, 100, 40, '#f9a8d4', 8)}${L('M-50 -40V-80M50 -40V-80M-50 -80H50', '#f472b6', 6)}${[-30, -10, 10, 30].map((x) => L(`M${x} -78V-42`, '#f472b6', 3)).join('')}</g>`, { cls: 'up' });
    s.step(3, person({ x: 200, y: 254, shirt: '#ec4899', hs: 'bun', fc: 'cheer', armL: [30, -10], armR: [34, -12] }) + `<g transform="translate(240 186)">${E(0, 0, 14, 18, '#fde8c8')}${C(0, -16, 12, '#ffd7b5')}</g>` + heart(300, 110, 1.1, '#ef4444'), { });
  }],
  ['municipal', '#0891b2', '시청과 청소차, 공원처럼 도시가 운영하는 지방 자치의 일', (s) => {
    s.sky('day'); s.ground('road', 250);
    s.step(1, `<g transform="translate(150 250)">${R(-70, -110, 140, 110, '#e8e4d8', 4)}${P('M-86 -110L0 -160L86 -110Z', '#9a7b3a')}${[-40, 0, 40].map((x) => R(x - 7, -100, 14, 94, '#f4f1e6', 2)).join('')}${flag(0, -160, '#0891b2', 36)}</g>`, { cls: 'up' });
    s.mv(2, 'translateX(-130px)', `<g transform="translate(430 250)">${R(-60, -50, 80, 50, '#22c55e', 5)}${R(20, -38, 40, 38, '#16a34a', 5)}${C(-30, 4, 12, '#1f2937')}${C(40, 4, 12, '#1f2937')}</g>`, { d: 0.9 });
    s.step(3, tree(300, 246, 0.7) + tree(340, 248, 0.6) + chk(500, 56) + L('M260 270H340', '#a8742a', 3, 'stroke-opacity="0"'), { cls: 'up' });
  }],
  ['needy', '#a16207', '빈 그릇을 든 가난한 이가 도움의 손길과 빵을 받고 웃는다', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, person({ x: 400, y: 262, shirt: '#94a3b8', pants: '#78716c', s: 0.85, fc: 'sad', armL: [-30, 10] }) + E(364, 230, 20, 6, '#fff', 'stroke="#d6dbe5" stroke-width="2"'), { cls: 'up' });
    s.step(2, person({ x: 160, y: 254, shirt: '#16a34a', fc: 'smile', armR: [50, 0] }) + bread(230, 214, 1), { cls: 'up' });
    s.mv(3, 'translateX(110px)', bread(250, 214, 1), { d: 0.9, e: undefined, appear: false });
    s.step(3, person({ x: 400, y: 262, shirt: '#94a3b8', pants: '#78716c', s: 0.85, fc: 'cheer', armL: [-30, 10] }) + heart(290, 120, 1, '#ef4444'), { });
  }],
  ['negligence', '#dc2626', '휴대폰에 정신이 팔려 끓는 냄비를 방치해 넘치고 불이 나는 부주의', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(400 250)">${R(-60, -70, 120, 70, '#6b7384', 6)}${R(-40, -90, 80, 22, '#475569', 4)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 160, y: 254, shirt: '#dc2626', fc: 'cheer', armR: [30, -20] }) + phone(196, 170, 1) + P('M370 180Q400 140 430 180Z', '#94a3b8', 'stroke="#6b7384" stroke-width="3"'), { cls: 'up' });
    s.step(3, flame(400, 180, 1.1) + L('M360 150Q350 120 360 100M440 150Q450 120 440 100', '#cbd5e1', 4) + person({ x: 160, y: 254, shirt: '#dc2626', fc: 'shock', armR: [30, -20] }) + cross(500, 50), { cls: 'pop' });
  }],
  ['imperceptible', '#94a3b8', '점점 잦아들어 귀를 기울여도 아무것도 느껴지지 않는 감지 불가', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, L('M60 150Q90 70 120 150T180 150', '#0ea5e9', 5), { cls: 'wipe' });
    s.step(2, L('M180 150Q200 110 220 150T260 150', '#38bdf8', 4) + L('M260 150Q270 134 280 150T300 150', '#7dd3fc', 3), { cls: 'wipe' });
    s.step(3, L('M300 150H520', '#bae6fd', 3) + person({ x: 420, y: 254, shirt: '#94a3b8', fc: 'think', armR: [16, -34] }) + qm(420, 90, '#94a3b8', 1.2), { cls: 'wipe' });
  }],
  ['litter', '#78716c', '깨끗한 공원에 쓰레기를 버려 휴지통 옆에까지 널브러진다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(420 252)">${R(-24, -50, 48, 50, '#6b7a8c', 6)}${R(-28, -58, 56, 9, '#8393a6', 3)}</g>` + tree(120, 250, 0.9), { cls: 'up' });
    s.step(2, person({ x: 260, y: 262, shirt: '#f59e0b', fc: 'smirk', armR: [30, 10] }) + R(300, 230, 14, 14, '#ef4444', 3), { cls: 'up', e: 2 });
    s.step(3, [[300, 250], [330, 262], [270, 266], [360, 256]].map(([x, y], i) => R(x - 8, y - 8, 16, 14, ['#ef4444', '#3b82f6', '#fff', '#f59e0b'][i], 3, `transform="rotate(${i * 30} ${x} ${y})"`)).join('') + person({ x: 160, y: 262, shirt: '#16a34a', fc: 'sad', s: 0.8 }) + cross(500, 56), { cls: 'pop' });
  }],
  ['pessimism', '#475569', '해가 떠 있어도 머리 위만 먹구름이 낀 채 매사를 어둡게 보는 비관', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, sun(450, 70, 28, '#ffd34d') + sparks(450, 70, 38, 52, '#ffd34d', 10, 4) + flower(120, 250, 1.2), { cls: 'up' });
    s.step(2, person({ x: 280, y: 262, shirt: '#475569', fc: 'sad', armL: [-6, 28], armR: [6, 28] }), { cls: 'up' });
    s.step(3, cloud(280, 100, 1.8, '#4a5568') + `<g fill="#8fb4d8">${[250, 280, 310].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.6}s" d="M${x} 120c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>` + cross(500, 56), { cls: 'up' });
  }],
  ['pervasive', '#7c3aed', '물감 한 방울이 물 전체로 번져 구석구석 퍼지는 만연', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(180, 100, 200, 140, '#e6f6ff', 14, 'stroke="#9fd8ff" stroke-width="5"') + drop(280, 70, 1.6, '#7c3aed'), { cls: 'up' });
    s.step(2, C(280, 170, 44, '#7c3aed', 'fill-opacity=".6"'), { cls: 'pop' });
    s.step(3, R(186, 106, 188, 128, '#7c3aed', 10, 'fill-opacity=".55"') + R(180, 100, 200, 140, 'none', 14, 'stroke="#9fd8ff" stroke-width="5"') + arrow(130, 170, 170, 170, '#7c3aed', 4, 10) + arrow(430, 170, 390, 170, '#7c3aed', 4, 10), { cls: 'pop' });
  }],
  ['proficient', '#0d9488', '칼질이 번개처럼 빠르고 정확한 능숙한 요리사', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(300, 238, 280) + person({ x: 160, y: 254, shirt: '#fff', pants: '#334155', fc: 'smile', armR: [60, 10], hat: '<path d="M-16 -96Q-22 -122 0 -120Q22 -122 16 -96Z" fill="#fff"/><rect x="-16" y="-98" width="32" height="8" fill="#fff"/>' }), { cls: 'up' });
    s.step(2, `<g transform="translate(260 190) rotate(-10)">${P('M0 0H60L56 14H0Z', '#cbd5e1', 'stroke="#8a93a5" stroke-width="2"')}${R(-24, -2, 24, 12, '#8c5a2a', 3)}</g>` + L('M290 150L300 180M310 146L322 180M330 150L340 180', '#0d9488', 3), { cls: 'pop' });
    s.step(3, [260, 290, 320, 350, 380].map((x) => R(x - 6, 214, 12, 12, '#ef4444', 2)).join('') + star(440, 130, 14) + sparks(440, 130, 24, 38, '#ffd34d', 8, 3) + chk(500, 56), { cls: 'pop' });
  }],
  ['prosperous', '#ca8a04', '황금빛 들판에 풍성한 수확과 동전이 쌓이는 번영', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, R(0, 220, 560, 80, '#d9b84a') + [60, 140, 220, 300, 380, 460].map((x) => L(`M${x} 240V200`, '#a8801c', 4) + E(x, 196, 5, 12, '#e8b830')).join(''), { cls: 'up' });
    s.step(2, sack(160, 250, 1.4) + sack(240, 250, 1.4) + basket(340, 250, 1.4) + apple(330, 214, 0.8) + apple(356, 214, 0.8), { cls: 'up' });
    s.step(3, coinStack(440, 252, 6) + coinStack(480, 252, 4) + sun(450, 70, 30, '#ffd34d') + sparks(450, 70, 40, 56, '#ffd34d', 12, 4) + chk(100, 50), { cls: 'pop' });
  }],
  ['reclaim', '#16a34a', '둑을 쌓아 물을 빼내 바다였던 땅을 푸른 농지로 되찾는 간척', (s) => {
    s.sky('day'); s.ground('water', 190);
    s.step(1, R(0, 190, 560, 110, '#38bdf8') + R(300, 170, 260, 130, '#e8d6a8'), { cls: 'up', e: 1 });
    s.step(2, R(300, 160, 20, 60, '#8a7a68', 4) + R(300, 160, 150, 14, '#8a7a68', 4) + R(0, 190, 560, 110, '#38bdf8') + `<g transform="translate(180 250)">${R(-20, -30, 40, 30, '#f59e0b', 4)}${L('M0 -30V-60H40', '#6b7384', 6)}</g>`, { cls: 'up', e: 2 });
    s.step(3, R(0, 190, 560, 110, '#8bc866') + [[100, 240], [200, 240], [300, 240], [400, 240]].map(([x, y]) => L(`M${x} ${y}V${y - 22}`, '#3f8f3a', 4) + P(`M${x} ${y - 18}C${x - 12} ${y - 30} ${x - 20} ${y - 18} ${x - 12} ${y - 10}Z`, '#5fb85a')).join('') + R(0, 180, 560, 12, '#8a7a68', 4) + chk(500, 56), { cls: 'up' });
  }],
  ['redundant', '#6b7280', '우산 하나면 충분한데 하나를 더 펴 든다 — 쓸데없이 중복되는', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    const umb = (x, y, col) => `<g transform="translate(${x} ${y})">${P('M-50 0Q-50 -46 0 -48Q50 -46 50 0Q38 -8 25 0Q12 -8 0 0Q-12 -8 -25 0Q-38 -8 -50 0Z', col)}${L('M0 0V34Q0 42 -8 40', '#475569', 4)}</g>`;
    s.add(`<g fill="#8fb4d8">${[50, 130, 210, 350, 430, 510].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.5}s" d="M${x} 20c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>`);
    s.step(1, person({ x: 280, y: 262, shirt: '#64748b', fc: 'smile', armR: [34, -38] }) + umb(330, 156, '#ef4444'), { cls: 'up', e: 1 });
    s.step(1, chk(330, 92, 16), { cls: 'pop' });
    s.step(2, person({ x: 280, y: 262, shirt: '#64748b', fc: 'smile', armL: [-34, -38], armR: [34, -38] }) + umb(330, 156, '#ef4444') + umb(230, 156, '#3b82f6'), { cls: 'up' });
    s.step(3, cross(230, 92, 18) + person({ x: 468, y: 262, s: 0.8, shirt: '#a3a3a3', fc: 'think', armR: [-8, -30] }) + qm(478, 140, '#6366f1', 1.2), { cls: 'pop' });
  }],
  ['remnant', '#a8a29e', '무너진 신전에 홀로 남은 기둥 하나뿐인 잔해', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, `<g transform="translate(280 250)">${R(-120, -100, 240, 100, '#e8e4d8', 4)}${P('M-136 -100L0 -160L136 -100Z', '#cbbf9c')}${[-90, -45, 0, 45, 90].map((x) => R(x - 9, -96, 18, 92, '#f4f1e6', 2)).join('')}</g>`, { cls: 'up', e: 2 });
    s.step(2, P('M160 250L200 200L240 250Z', '#cbbf9c') + C(260, 230, 18, '#cbbf9c', 'fill-opacity=".5"') + C(340, 240, 20, '#cbbf9c', 'fill-opacity=".5"'), { e: 2 });
    s.step(3, R(250, 150, 22, 100, '#f4f1e6', 2) + P('M160 252L190 236L220 252Z M320 252L350 238L380 252Z', '#cbbf9c') + R(236, 140, 50, 10, '#cbbf9c', 3) + sparks(260, 120, 30, 44, '#ffd34d', 6, 3, 3), { });
  }],
  ['replicate', '#2563eb', '복사기가 하나의 별을 똑같이 여러 개로 복제해 낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, star(110, 170, 24, '#ffd34d'), { cls: 'pop' });
    s.step(2, `<g transform="translate(250 250)">${R(-50, -90, 100, 90, '#e5e9f0', 8, 'stroke="#aab4c6" stroke-width="3"')}${R(-40, -80, 80, 14, '#2563eb', 3)}${R(-30, -40, 60, 8, '#475569', 2)}</g>` + arrow(150, 170, 190, 170, '#2563eb', 4, 10), { cls: 'up' });
    s.step(3, [360, 420, 480].map((x) => star(x, 150, 20, '#ffd34d')).join('') + [390, 450].map((x) => star(x, 210, 20, '#ffd34d')).join('') + arrow(310, 180, 340, 170, '#2563eb', 4, 10), { cls: 'pop' });
  }],
  ['respiratory', '#0ea5e9', '코로 들이쉰 숨이 폐를 부풀렸다가 다시 내쉬어지는 호흡', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 160, y: 254, shirt: '#0ea5e9', fc: 'sleep', armL: [-6, 28], armR: [6, 28] }) + arrow(70, 160, 140, 170, '#2dd4bf', 5, 12), { cls: 'up' });
    s.step(2, `<g transform="translate(400 160)">${L('M0 -70V-14', '#e0507a', 10)}${P('M0 -14C-14 -14 -60 -6 -64 36C-66 60 -50 72 -30 68C-10 62 -4 40 0 14Z', '#ff9ab0')}${P('M0 -14C14 -14 60 -6 64 36C66 60 50 72 30 68C10 62 4 40 0 14Z', '#ff9ab0')}</g>` + arrow(220, 160, 340, 160, '#2dd4bf', 5, 12), { cls: 'pop' });
    s.step(3, arrow(330, 120, 230, 100, '#38bdf8', 5, 12) + L('M400 120Q420 100 440 120', '#2dd4bf', 3, 'stroke-opacity="0"') + chk(500, 56), { cls: 'wipe' });
  }],
  ['rigorous', '#7f1d1d', '자를 든 엄격한 선생이 한 줄 한 줄 꼼꼼히 철저하게 검사한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 440, y: 254, shirt: '#7f1d1d', fc: 'angry', armL: [-60, -10] }) + R(300, 200, 90, 8, '#facc15', 2), { cls: 'up' });
    s.step(2, paper(190, 160, 120, 150, 5) + magnifier(250, 130, 1), { cls: 'up' });
    s.step(3, [110, 140, 170, 200].map((y) => chk(130, y - 20, 9) + L(`M150 ${y - 20}H250`, '#aab4c6', 3)).join('') + cross(130, 200, 9) + L('M150 200H230', '#ef4444', 3), { cls: 'pop' });
  }],
  ['stereotype', '#475569', '다양한 사람을 똑같은 틀로 찍어 내 같은 모습으로 굳히는 고정관념', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 110, y: 254, shirt: '#ef4444', skin: '#ffd7b5', fc: 'cheer', s: 0.9 }) + person({ x: 230, y: 254, shirt: '#22c55e', skin: '#8d5524', hs: 'curly', fc: 'cheer', s: 1.1 }) + person({ x: 350, y: 254, shirt: '#3b82f6', skin: '#e0ac69', hs: 'long', fc: 'cheer', s: 0.8 }), { cls: 'up', e: 2 });
    s.step(2, R(60, 40, 330, 30, '#475569', 6) + R(60, 60, 330, 12, '#6b7384', 3) + L('M120 70V100M280 70V100M360 70V100', '#475569', 6) + arrow(440, 100, 440, 180, '#475569', 6, 14), { cls: 'wipe-d', e: 2 });
    s.step(3, [110, 230, 350].map((x) => person({ x, y: 254, shirt: '#94a3b8', skin: '#cbd5e1', hair: '#6b7280', fc: 'neutral', s: 0.9, sh: false })).join('') + cross(480, 56), { cls: 'pop' });
  }],
  ['spontaneity', '#f59e0b', '계획 없이 웅덩이를 보자 불쑥 뛰어들어 신나게 첨벙대는 자발성', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, E(300, 252, 80, 12, '#4fc3f7') + person({ x: 130, y: 262, shirt: '#f59e0b', s: 0.8, legs: 'walk', fc: 'neutral' }), { cls: 'up', e: 1 });
    s.step(2, E(300, 252, 80, 12, '#4fc3f7') + person({ x: 270, y: 220, shirt: '#f59e0b', s: 0.8, legs: 'walk', fc: 'cheer', armL: [-30, -40], armR: [30, -40] }), { e: 2 });
    s.step(3, E(300, 252, 80, 12, '#4fc3f7') + person({ x: 300, y: 262, shirt: '#f59e0b', s: 0.8, fc: 'cheer', armL: [-30, -40], armR: [30, -40] }) + [[240, 220], [270, 190], [330, 190], [360, 220]].map(([x, y]) => drop(x, y, 0.9, '#7dd3fc')).join('') + sparks(300, 160, 70, 84, '#7dd3fc', 8, 3), { });
  }],
  ['solidarity', '#dc2626', '서로 팔짱을 끼고 한마음으로 뭉쳐 주먹을 드는 연대', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, [90, 190, 290, 390, 490].map((x, i) => person({ x, y: 262, shirt: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'][i], hs: i % 2 ? 'long' : 'short', s: 0.8, fc: 'neutral', sh: false })).join(''), { cls: 'up', e: 2 });
    s.step(2, [90, 190, 290, 390, 490].map((x, i) => person({ x, y: 262, shirt: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'][i], hs: i % 2 ? 'long' : 'short', s: 0.8, fc: 'cheer', armL: [-26, -10], armR: [26, -10], sh: false })).join(''), { });
    s.step(3, heart(290, 90, 1.3, '#ef4444') + sparks(290, 100, 40, 56, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['tedious', '#6b7280', '시계만 쳐다보며 하품이 나오는 길고 지루한 시간', (s) => {
    s.sky('gray'); s.ground('floor', 252);
    s.step(1, clock(430, 110, 44, 3, 0) + L('M390 60L380 50M470 60L480 50', '#6b7280', 3, 'stroke-opacity="0"'), { cls: 'up' });
    s.step(2, person({ x: 180, y: 254, shirt: '#6b7280', fc: 'yawn', armL: [-6, 24], armR: [6, 24] }), { cls: 'up' });
    s.step(3, clock(430, 110, 44, 3, 0.6) + L('M130 120Q160 100 190 120', '#6b7280', 3) + L('M190 130L206 120M200 140L220 138', '#6b7280', 3, 'stroke-opacity="0"') + L('M470 200H500M460 214H500', '#a8a29e', 3, 'stroke-opacity="0"') + moon(300, 80, 14, '#d4dbe6'), { cls: 'pop' });
  }],
  ['stern', '#7f1d1d', '팔짱을 끼고 찌푸린 얼굴로 학생들을 바라보는 엄한 선생', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#7f1d1d', fc: 'angry', armL: [10, -16], armR: [-10, -16] }) + R(210, 160, 6, 90, '#8c5a2a', 2, 'transform="rotate(-10 213 205)"'), { cls: 'up' });
    s.step(2, L('M120 156L140 168M180 156L160 168', '#7f1d1d', 4) + L('M250 100H300M250 120H290', '#7f1d1d', 3, 'stroke-opacity="0"'), { cls: 'pop' });
    s.step(3, [320, 400, 480].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#22c55e', '#f59e0b'][i], s: 0.75, fc: 'neutral', armL: [-6, 24], armR: [6, 24] })).join('') + drop(330, 190, 0.7), { cls: 'up' });
  }],
  ['subtract', '#16a34a', '사과 다섯 개에서 두 개를 덜어 내 세 개만 남는 뺄셈', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [120, 170, 220, 270, 320].map((x) => apple(x, 226, 1.1)).join(''), { cls: 'up', e: 2 });
    s.step(2, [120, 170, 220].map((x) => apple(x, 226, 1.1)).join('') + `<g transform="translate(300 160)">${R(-10, -14, 70, 28, '#ffd7b5', 12, 'stroke="#e8b48c" stroke-width="2.4"')}</g>` + apple(270, 190, 1.1) + apple(320, 190, 1.1), { e: 2 });
    s.step(3, [120, 170, 220].map((x) => apple(x, 226, 1.1)).join('') + R(380, 156, 60, 10, '#16a34a', 4) + apple(480, 100, 0.8, '#d1d5db') + apple(520, 100, 0.8, '#d1d5db') + L('M470 130L530 70M530 130L470 70', '#ef4444', 4, 'stroke-opacity="0"'), { });
  }],
  ['suspicious', '#475569', '몰래 다가오는 낯선 이를 눈을 가늘게 뜨고 의심스레 살핀다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, person({ x: 420, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'smirk', hat: '<rect x="-17" y="-92" width="34" height="10" fill="#111827"/>', legs: 'walk' }), { cls: 'up' });
    s.step(2, person({ x: 150, y: 254, shirt: '#475569', fc: 'think', armR: [20, -30] }) + qm(150, 90, '#475569', 1.3), { cls: 'up' });
    s.step(3, magnifier(280, 150, 1.3) + L('M190 170L260 160', '#475569', 3, 'stroke-dasharray="4 6"') + cross(500, 56), { cls: 'pop' });
  }],
  ['susceptible', '#0ea5e9', '찬 바람에 외투 없이 서 있다 병균에 걸려 재채기하는 취약함', (s) => {
    s.sky('gray'); s.ground('snow', 250);
    s.step(1, person({ x: 280, y: 258, shirt: '#94a3b8', fc: 'neutral', armL: [-14, 20], armR: [14, 20] }) + L('M40 120H150M30 150H130', '#fff', 5), { cls: 'up' });
    s.step(2, [[220, 150], [250, 130], [320, 140], [340, 170]].map(([x, y]) => C(x, y, 6, '#84cc16', 'stroke="#4d7c0f" stroke-width="2"')).join(''), { cls: 'pop' });
    s.step(3, person({ x: 280, y: 258, shirt: '#94a3b8', fc: 'sick', armL: [-6, -30], armR: [14, 20], skin: '#ffb0a0' }) + R(300, 150, 36, 24, '#fff', 4, 'stroke="#aab4c6" stroke-width="2"') + L('M320 130L340 110M330 140L356 134', '#38bdf8', 3), { });
  }],
  ['testimony', '#1e3a8a', '증인석에서 손을 들고 본 대로 말해 판사가 귀 기울이는 증언', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(60, 190, 130, 62, '#7a461f', 4) + R(310, 160, 150, 92, '#7a461f', 4) + person({ x: 385, y: 160, shirt: '#1f2937', legs: 'hide', fc: 'neutral', sh: false }), { cls: 'up' });
    s.step(2, person({ x: 125, y: 190, shirt: '#16a34a', fc: 'cheer', legs: 'hide', armR: [14, -56], sh: false }) + bubble(190, 120, 100, 54, '#fff', 'l') + L('M150 112H220M150 128H210', '#aab4c6', 4), { cls: 'up' });
    s.step(3, R(380, 130, 40, 6, '#a8774a', 2) + chk(500, 56) + `<g transform="translate(380 140) rotate(-20)">${R(-4, 0, 8, 28, '#8c5a2a', 3)}${R(-16, -8, 32, 12, '#a8774a', 3)}</g>`, { cls: 'pop' });
  }],
  ['underpin', '#0d9488', '처진 상판 밑에 기둥을 받쳐 건물을 단단히 떠받치는 뒷받침', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, `<g transform="translate(280 250)">${P('M-120 -100Q0 -70 120 -100V-80Q0 -50 -120 -80Z', '#cbd5e1', 'stroke="#8a93a5" stroke-width="3"')}</g>` + L('M170 150L180 130M390 150L380 130', '#ef4444', 4), { cls: 'up', e: 2 });
    s.step(2, [200, 360].map((x) => R(x - 12, 170, 24, 80, '#9ca3af', 3, 'stroke="#6b7280" stroke-width="2"')).join('') + arrow(280, 80, 280, 130, '#0d9488', 5, 12), { cls: 'up', e: 2 });
    s.step(3, R(150, 150, 260, 20, '#cbd5e1', 4, 'stroke="#8a93a5" stroke-width="3"') + [200, 280, 360].map((x) => R(x - 12, 170, 24, 80, '#9ca3af', 3, 'stroke="#6b7280" stroke-width="2"')).join('') + chk(480, 56), { cls: 'up' });
  }],
];

function flower(x, y, k) { return `<g transform="translate(${x} ${y}) scale(${k})">${L('M0 0V-60', '#3f8f3a', 5)}${[0, 1, 2, 3, 4].map((i) => C(Math.cos((i / 5) * 6.28) * 14, -68 + Math.sin((i / 5) * 6.28) * 14, 11, '#f472b6')).join('')}${C(0, -68, 8, '#facc15')}</g>`; }
