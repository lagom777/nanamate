import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const castle = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${R(-70, -80, 140, 80, '#b8bfcf', 4, 'stroke="#8a93a5" stroke-width="3"')}${R(-86, -110, 36, 110, '#a8aebd', 4)}${R(50, -110, 36, 110, '#a8aebd', 4)}${[-86, -74, -62].map((x) => R(x, -122, 10, 14, '#a8aebd')).join('')}${[50, 62, 74].map((x) => R(x, -122, 10, 14, '#a8aebd')).join('')}${P('M-30 0V-30Q0 -50 30 -30V0Z', '#5a3a22')}${P('M-86 -110L-68 -140L-50 -110Z M50 -110L68 -140L86 -110Z', '#ef4444')}</g>`;
const stairs = (x, y) => `<g transform="translate(${x} ${y})">${R(-150, -30, 100, 30, '#cbd5e1', 3)}${R(-50, -60, 100, 60, '#cbd5e1', 3)}${R(50, -90, 100, 90, '#cbd5e1', 3)}</g>`;

export default [
  ['yearn', '#ec4899', '창가에서 먼 바다 너머 그리운 이를 향해 팔을 뻗으며 갈망한다', (s) => {
    s.sky('dusk'); s.ground('water', 190);
    s.step(1, R(60, 120, 150, 140, '#7a461f', 6) + R(80, 140, 110, 90, '#ffd27a', 4) + L('M135 140V230M80 185H190', '#7a461f', 5), { cls: 'up' });
    s.step(2, `<g transform="translate(440 190)">${P('M-40 0H40L28 18H-28Z', '#fff')}${R(-2, -50, 4, 50, '#6b4a2a')}${P('M2 -48L34 -8H2Z', '#f4f1e6')}</g>` + sun(400, 120, 26, '#ffb347'), { cls: 'up' });
    s.step(3, person({ x: 135, y: 232, shirt: '#ec4899', hs: 'long', fc: 'sad', legs: 'hide', armL: [-6, -30], armR: [60, -26], sh: false }) + heart(300, 110, 0.9, '#ef4444') + heart(340, 90, 0.6, '#ec4899') + L('M200 170Q280 150 360 160', '#ec4899', 3, 'stroke-dasharray="4 8"'), { cls: 'pop' });
  }],
  ['sway', '#16a34a', '바람에 나무가 좌우로 살랑살랑 흔들린다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, tree(280, 252, 1.4), { cls: 'up', e: 1 });
    s.step(2, `<g transform="translate(280 252) rotate(-10)"><g transform="scale(1.4)"><rect x="-6" y="-60" width="12" height="60" fill="#6b4a2a"/><circle cx="0" cy="-80" r="34" fill="#4fa04a"/><circle cx="-24" cy="-62" r="22" fill="#3f8f3a"/><circle cx="24" cy="-64" r="22" fill="#3f8f3a"/></g></g>` + L('M60 100H140M50 130H120', '#fff', 5), { e: 2 });
    s.step(3, `<g transform="translate(280 252) rotate(10)"><g transform="scale(1.4)"><rect x="-6" y="-60" width="12" height="60" fill="#6b4a2a"/><circle cx="0" cy="-80" r="34" fill="#4fa04a"/><circle cx="-24" cy="-62" r="22" fill="#3f8f3a"/><circle cx="24" cy="-64" r="22" fill="#3f8f3a"/></g></g>` + L('M500 100H420M510 130H440', '#fff', 5) + arrow(210, 70, 150, 70, '#16a34a', 4, 10) + arrow(350, 70, 410, 70, '#16a34a', 4, 10), { });
  }],
  ['foremost', '#f59e0b', '무리 맨 앞에서 가장 먼저 결승선에 닿는 선두', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, L('M470 130V252', '#fff', 6) + R(466, 120, 8, 12, '#ef4444') + [120, 190].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#22c55e'][i], legs: 'walk', s: 0.75, sh: false })).join(''), { cls: 'up', e: 1 });
    s.step(2, [90, 160].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#22c55e'][i], legs: 'walk', s: 0.75, sh: false })).join('') + person({ x: 330, y: 262, shirt: '#f59e0b', legs: 'walk', s: 0.75, fc: 'cheer' }) + L('M470 130V252', '#fff', 6), { e: 2 });
    s.step(3, [90, 160].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#22c55e'][i], legs: 'walk', s: 0.75, fc: 'sad', sh: false })).join('') + person({ x: 430, y: 262, shirt: '#f59e0b', fc: 'cheer', armL: [-20, -44], armR: [20, -44] }) + L('M470 130V252', '#fff', 6) + L('M420 150Q445 140 470 150', '#fff', 6) + star(430, 80, 14) + crown(430, 60, 0.9), { });
  }],
  ['regime', '#7c2d12', '깃발 아래 병사들이 줄지어 서는 통치 체제', (s) => {
    s.sky('warm'); s.ground('stone', 250);
    s.step(1, castle(280, 250, 1.3), { cls: 'up' });
    s.step(2, [90, 150, 410, 470].map((x, i) => person({ x, y: 266, shirt: '#7c2d12', pants: '#1f2937', s: 0.8, fc: 'neutral', hat: '<path d="M-14 -96Q0 -114 14 -96Z" fill="#8a93a5"/>', armR: [8, -10], armL: [-8, 24] }) + L(`M${x + 22} 266V176`, '#8a6a2a', 4)).join(''), { cls: 'up' });
    s.step(3, flag(280, 147, '#b91c1c', 72) + crown(280, 66, 0.8) + sparks(280, 54, 38, 50, '#ffd34d', 10, 3), { cls: 'pop' });
  }],
  ['terminate', '#475569', '플러그를 뽑자 켜져 있던 전등이 꺼지며 끝난다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, bulb(210, 200, 1.6) + R(120, 240, 180, 12, '#475569', 4) + L('M300 246H380', '#1f2937', 5) + R(380, 232, 24, 28, '#1f2937', 4), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(420 60)">${R(-12, 0, 26, 30, '#f4f6fa', 4, 'stroke="#aab4c6" stroke-width="2"')}${R(-6, -14, 4, 14, '#aab4c6')}${R(6, -14, 4, 14, '#aab4c6')}</g>` + arrow(420, 120, 420, 200, '#ef4444', 5, 14), { cls: 'up', e: 2 });
    s.step(3, bulb(210, 200, 1.6).replace(/#ffd34d/g, '#cbd5e1').replace(/<circle[^>]*#ffe9a0[^>]*\/>/, '') + R(120, 240, 180, 12, '#475569', 4) + cross(480, 56) + moon(470, 150, 14, '#0f1730'), { });
  }],
  ['rebel', '#dc2626', '사슬을 끊고 주먹을 치켜든 사람이 압제에 맞서 저항한다', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, [100, 180, 380, 460].map((x, i) => person({ x, y: 262, shirt: '#6b7280', fc: 'sad', s: 0.85 }) + L(`M${x - 20} 232Q${x} 244 ${x + 20} 232`, '#475569', 4)).join(''), { cls: 'up' });
    s.step(2, person({ x: 280, y: 262, shirt: '#dc2626', fc: 'angry', armR: [24, -64], armL: [-24, -20] }) + L('M244 232L220 238M316 232L340 238', '#8a93a5', 5), { cls: 'up' });
    s.step(3, flag(400, 252, '#dc2626', 110) + sparks(280, 140, 60, 76, '#ffd34d', 10, 4) + L('M236 230L222 222M324 230L338 222', '#dc2626', 4), { cls: 'pop' });
  }],
  ['meanwhile', '#0891b2', '한쪽에서 요리하는 동안 다른 쪽에서는 독서하는 동시 진행', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(20, 40, 250, 200, '#fff8e8', 10, 'stroke="#d9c58a" stroke-width="3"') + person({ x: 110, y: 232, shirt: '#ea580c', armR: [40, 10] }) + `<g transform="translate(190 200)">${E(0, 0, 40, 12, '#475569')}${R(40, -4, 36, 8, '#475569', 3)}${L('M-10 -10Q-6 -26 -10 -38M10 -10Q14 -26 10 -38', '#cbd5e1', 4)}</g>`, { cls: 'up' });
    s.step(2, R(290, 40, 250, 200, '#e8f3ff', 10, 'stroke="#93c5fd" stroke-width="3"') + person({ x: 380, y: 232, shirt: '#2563eb', hs: 'long', armR: [34, 6] }) + book(440, 212, '#ef4444', 54, 40), { cls: 'up' });
    s.step(3, clock(280, 140, 30, 2, 5) + L('M250 140H270M290 140H310', '#0891b2', 4), { cls: 'pop' });
  }],
  ['folklore', '#b45309', '모닥불 곁에서 어른이 호랑이 옛이야기를 들려주는 민속', (s) => {
    s.sky('night'); s.ground('soil', 250);
    s.step(1, `<g transform="translate(280 252)">${L('M-26 0L26 -14M26 0L-26 -14', '#6b4a2a', 8)}${P('M-10 -12C-18 -28 -8 -40 0 -54C8 -40 18 -28 10 -12Z', '#ff9a1f')}${P('M-4 -12C-8 -22 -2 -30 0 -38C4 -30 8 -22 4 -12Z', '#ffd34d')}</g>` + `<circle cx="280" cy="230" r="90" fill="#ffd27a" fill-opacity=".18"/>`, { cls: 'up' });
    s.step(2, person({ x: 130, y: 262, shirt: '#b45309', hair: '#e5e7eb', fc: 'cheer', armR: [40, -30] }) + person({ x: 430, y: 266, shirt: '#3b82f6', s: 0.7, fc: 'shock' }) + person({ x: 490, y: 266, shirt: '#ec4899', hs: 'long', s: 0.7, fc: 'shock' }), { cls: 'up' });
    s.step(3, E(250, 80, 90, 54, '#fff', 'stroke="#aab4c6" stroke-width="3"') + `<g transform="translate(250 80)">${C(0, 0, 30, '#f59e0b')}${L('M-20 -14L-10 -6M20 -14L10 -6M-24 8L-12 6M24 8L12 6', '#2a1a12', 4)}${C(-10, -6, 3, '#2a1a12')}${C(10, -6, 3, '#2a1a12')}${P('M-8 10H8L0 18Z', '#7a2a2a')}${P('M-26 -22L-30 -42L-12 -28ZM26 -22L30 -42L12 -28Z', '#f59e0b')}</g>`, { cls: 'pop' });
  }],
  ['preliminary', '#2563eb', '결승에 앞서 치르는 첫 단계의 예선', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, stairs(280, 252), { cls: 'up' });
    s.step(2, R(130, 222, 100, 30, '#2563eb', 3) + person({ x: 180, y: 222, shirt: '#2563eb', s: 0.7, legs: 'walk', fc: 'cheer' }) + C(110, 130, 12, '#94a3b8') + C(150, 130, 12, '#94a3b8') + C(190, 130, 12, '#94a3b8') + C(230, 130, 12, '#94a3b8'), { cls: 'pop' });
    s.step(3, arrow(250, 200, 320, 170, '#2563eb', 5, 12) + arrow(350, 170, 420, 140, '#2563eb', 5, 12) + star(480, 80, 14, '#cbd5e1') + L('M460 70L500 90', '#cbd5e1', 3, 'stroke-opacity="0"'), { cls: 'wipe' });
  }],
  ['proliferation', '#16a34a', '하나이던 것이 둘, 넷, 여덟으로 순식간에 불어난다', (s) => {
    s.sky('mint'); s.ground('tile', 252);
    s.step(1, C(90, 150, 22, '#4ade80', 'stroke="#15803d" stroke-width="3"'), { cls: 'pop' });
    s.step(2, arrow(130, 150, 190, 150, '#16a34a') + C(230, 120, 20, '#4ade80', 'stroke="#15803d" stroke-width="3"') + C(230, 180, 20, '#4ade80', 'stroke="#15803d" stroke-width="3"'), { cls: 'pop' });
    s.step(3, arrow(270, 150, 320, 150, '#16a34a') + [[360, 100], [360, 150], [360, 200], [410, 120], [410, 180], [460, 100], [460, 150], [460, 200]].map(([x, y]) => C(x, y, 16, '#4ade80', 'stroke="#15803d" stroke-width="3"')).join(''), { cls: 'pop' });
  }],
  ['amend', '#0d9488', '법 문서의 잘못된 조항을 지우고 고쳐 쓴 개정', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, paper(200, 150, 150, 190, 5) + R(150, 138, 100, 12, '#fecaca', 2), { cls: 'up' });
    s.step(2, L('M150 144H250', '#dc2626', 5) + pencil(300, 130, 1.4, 30), { cls: 'wipe' });
    s.step(3, L('M150 164H240', '#16a34a', 4) + L('M150 180H220', '#16a34a', 4) + arrow(250, 150, 330, 100, '#0d9488', 5, 12) + chk(400, 80), { cls: 'pop' });
  }],
  ['recess', '#f59e0b', '종이 울리자 아이들이 교실에서 운동장으로 뛰어나가 쉰다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, R(30, 70, 230, 180, '#e8d0b0', 6, 'stroke="#c9a37a" stroke-width="3"') + R(50, 130, 40, 30, '#a0602e', 3) + R(110, 130, 40, 30, '#a0602e', 3) + R(170, 130, 40, 30, '#a0602e', 3) + R(210, 90, 36, 50, '#2f6a3a', 3), { cls: 'up' });
    s.step(2, `<g transform="translate(150 50)">${L('M0 -10V0', '#d99a00', 3)}${P('M-16 20Q-16 0 0 0Q16 0 16 20Z', '#ffd34d', 'stroke="#d99a00" stroke-width="2"')}</g>` + sparks(150, 62, 22, 34, '#ffd34d', 6, 3), { cls: 'pop' });
    s.step(3, person({ x: 340, y: 262, shirt: '#3b82f6', fc: 'cheer', armL: [-20, -44], armR: [20, -44], s: 0.8 }) + person({ x: 420, y: 262, shirt: '#ec4899', hs: 'long', fc: 'cheer', legs: 'walk', s: 0.8 }) + ball(480, 240, 14, '#ef4444') + sun(480, 60, 22, '#fff3a8'), { cls: 'up' });
  }],
  ['autonomy', '#16a34a', '부모가 잡아 주던 자전거에서 손을 떼자 아이가 스스로 달린다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(150 250)">${C(-30, -22, 22, 'none', 'stroke="#2a2e3a" stroke-width="5"')}${C(30, -22, 22, 'none', 'stroke="#2a2e3a" stroke-width="5"')}${L('M-30 -22L0 -52L30 -22M0 -52L-12 -70H-2', '#3b82f6', 5)}</g>` + person({ x: 150, y: 214, shirt: '#16a34a', s: 0.55, legs: 'hide', fc: 'sad', sh: false }) + person({ x: 80, y: 262, shirt: '#334155', armR: [50, -40] }), { cls: 'up', e: 2 });
    s.step(2, arrow(120, 150, 160, 150, '#16a34a', 4, 10), { cls: 'pop', e: 2 });
    s.mv(3, 'translateX(-190px)', `<g transform="translate(400 250)">${C(-30, -22, 22, 'none', 'stroke="#2a2e3a" stroke-width="5"')}${C(30, -22, 22, 'none', 'stroke="#2a2e3a" stroke-width="5"')}${L('M-30 -22L0 -52L30 -22M0 -52L-12 -70H-2', '#3b82f6', 5)}</g>` + person({ x: 400, y: 214, shirt: '#16a34a', s: 0.55, legs: 'hide', fc: 'cheer', armR: [14, -30], sh: false }), { d: 1 });
    s.step(3, heart(400, 100, 0.9, '#ef4444') + sparks(400, 110, 30, 44, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['mourn', '#374151', '검은 옷의 사람이 꽃을 놓고 눈물 흘리며 고인을 애도한다', (s) => {
    s.sky('gray'); s.ground('grass', 244);
    s.step(1, `<g transform="translate(360 252)">${R(-44, -90, 88, 90, '#cbd5e1', 12, 'stroke="#8a93a5" stroke-width="3"')}${L('M0 -70V-30M-14 -56H14', '#8a93a5', 5)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 200, y: 262, shirt: '#1f2937', pants: '#1f2937', fc: 'cry', armR: [34, 10], armL: [-6, 28] }) + `<g transform="translate(256 224)">${C(0, 0, 10, '#ffffff')}${C(14, 6, 10, '#ffffff')}${L('M0 12L-4 36', '#3a8a3a', 3)}</g>`, { cls: 'up' });
    s.step(3, `<g fill="#8fb4d8">${[100, 200, 300, 400, 480].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.6}s" d="M${x} 20c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>` + cloud(140, 56, 1.6, '#6b7384') + cloud(400, 50, 1.8, '#5b6577') + drop(190, 190, 0.8) + drop(212, 196, 0.8), { });
  }],
  ['evoke', '#f59e0b', '갓 구운 쿠키 향이 코끝에 닿자 할머니와의 추억이 떠오른다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, R(60, 214, 120, 10, '#a0602e', 4) + [[90, 210], [120, 206], [150, 210]].map(([x, y]) => C(x, y, 14, '#d99a4e', 'stroke="#a86b2a" stroke-width="2"') + C(x - 3, y - 2, 2, '#5a3a22')).join('') + L('M100 180Q108 166 100 152M130 180Q138 166 130 152M158 180Q166 166 158 152', '#cbd5e1', 4), { cls: 'up' });
    s.step(2, L('M200 170Q260 150 310 170', '#f59e0b', 4, 'stroke-dasharray="6 8"') + person({ x: 370, y: 254, shirt: '#f59e0b', fc: 'shy', armR: [14, -34] }), { cls: 'wipe' });
    s.step(3, E(430, 80, 100, 56, '#fff', 'stroke="#aab4c6" stroke-width="3"') + person({ x: 430, y: 100, shirt: '#ec4899', hs: 'bun', hair: '#d6dbe5', s: 0.4, fc: 'cheer', sh: false }) + heart(480, 60, 0.5, '#ef4444') + C(370, 140, 5, '#fff', 'stroke="#aab4c6" stroke-width="2"'), { cls: 'pop' });
  }],
  ['latitude', '#0ea5e9', '지구에 가로로 그은 위도선과 북쪽·남쪽을 가르는 적도', (s) => {
    s.sky('night'); s.ground('dark', 300);
    s.step(1, C(280, 150, 100, '#2a8fe0', 'stroke="#fff" stroke-opacity=".3" stroke-width="2"') + P('M220 90C250 70 290 80 300 110C290 140 250 130 240 160C220 140 200 110 220 90Z', '#5fb85a') + P('M320 140C350 130 370 150 360 180C340 200 320 180 320 140Z', '#5fb85a'), { cls: 'pop' });
    s.step(2, [60, 105, 150, 195, 240].map((y) => { const dx = Math.sqrt(10000 - (y - 150) * (y - 150)); return L(`M${280 - dx} ${y}H${280 + dx}`, '#fff', 2.4, 'stroke-opacity=".8"'); }).join(''), { cls: 'wipe' });
    s.step(3, L('M170 150H390', '#ffd34d', 4) + arrow(440, 140, 440, 60, '#0ea5e9', 5, 12) + arrow(440, 160, 440, 240, '#0ea5e9', 5, 12) + `<g transform="translate(300 105)">${C(0, 0, 8, '#ef4444')}${L('M0 8V22', '#ef4444', 3)}</g>`, { cls: 'wipe' });
  }],
  ['maternal', '#ec4899', '앞치마 두른 어머니가 아기를 품에 안고 사랑을 쏟는다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 220, y: 254, shirt: '#ec4899', hs: 'bun', hair: '#6b3a1a', fc: 'smile', armL: [30, -10], armR: [34, -12] }) + P('M-14 -60L14 -60L10 -20H-10Z', '#fff', 'transform="translate(220 254)" fill-opacity=".85"'), { cls: 'up' });
    s.step(2, `<g transform="translate(262 196)">${E(0, 0, 18, 22, '#fde8c8')}${C(0, -22, 14, '#ffd7b5')}${C(-5, -22, 2, '#2a1a12')}${C(5, -22, 2, '#2a1a12')}${L('M-4 -14Q0 -11 4 -14', '#2a1a12', 2)}</g>`, { cls: 'pop' });
    s.step(3, heart(300, 100, 1.2, '#ef4444') + heart(240, 90, 0.7, '#ec4899') + heart(350, 120, 0.7, '#ec4899') + sparks(262, 160, 50, 64, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['prestigious', '#ca8a04', '금빛 문장과 박수 속에 학사모를 던지는 명망 높은 명문', (s) => {
    s.sky('day'); s.ground('carpet', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-100, -130, 200, 130, '#e8e4d8', 4, 'stroke="#c4bda8" stroke-width="3"')}${P('M-116 -130L0 -190L116 -130Z', '#9a7b3a')}${[-70, -35, 0, 35, 70].map((x) => R(x - 7, -120, 14, 104, '#f4f1e6', 2)).join('')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(280 140)">${P('M0 -30Q-26 -30 -26 -6Q-26 20 0 34Q26 20 26 -6Q26 -30 0 -30Z', '#ffd34d', 'stroke="#d99a00" stroke-width="3"')}${star(0, -4, 10, '#fff')}</g>` + sparks(280, 140, 40, 54, '#ffd34d', 8, 3), { cls: 'pop' });
    s.step(3, [90, 470].map((x) => person({ x, y: 262, shirt: '#1f2937', fc: 'cheer', armL: [-20, -50], armR: [20, -50], hat: '<rect x="-20" y="-104" width="40" height="6" fill="#1f2937"/><path d="M-10 -98H10L8 -92H-8Z" fill="#1f2937"/>' })).join('') + `<g fill="#1f2937">${[[130, 80], [440, 60]].map(([x, y]) => R(x - 14, y, 28, 5, '#1f2937', 1, 'transform="rotate(14)"')).join('')}</g>`, { cls: 'up' });
  }],
  ['intermediate', '#7c3aed', '초급과 고급 사이 중간 계단에 서 있는 중급', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, stairs(280, 252), { cls: 'up' });
    s.step(2, person({ x: 280, y: 192, shirt: '#7c3aed', fc: 'smile', s: 0.8, legs: 'stand', armL: [-20, -10], armR: [20, -10] }), { cls: 'up' });
    s.step(3, R(180, 192, 100, 60, '#c4b5fd', 3) + R(230, 192, 100, 60, '#a78bfa', 3) + arrow(180, 110, 180, 150, '#94a3b8', 4, 10) + arrow(380, 110, 380, 70, '#94a3b8', 4, 10) + star(280, 70, 12, '#7c3aed'), { cls: 'pop' });
  }],
  ['paradigm', '#0891b2', '작은 틀이 깨지고 더 넓은 새 틀로 세상을 보게 되는 패러다임', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(210, 90, 140, 100, 'none', 4, 'stroke="#6b4a2a" stroke-width="12"') + R(220, 100, 120, 80, '#cfeaff', 2), { cls: 'up', e: 2 });
    s.step(2, `<path d="M290 40L270 90L296 82L284 130" stroke="#ffd34d" stroke-width="5" fill="none"/>` + bulb(280, 60, 1), { cls: 'pop', e: 2 });
    s.step(3, R(90, 50, 380, 190, 'none', 4, 'stroke="#6b4a2a" stroke-width="12"') + R(100, 60, 360, 170, '#cfeaff', 2) + P('M100 200L180 140L240 190L320 120L400 190L460 160V230H100Z', '#6fbf4a') + sun(380, 100, 24, '#ffd34d') + sparks(380, 100, 32, 46, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['pollute', '#475569', '공장 연기와 자동차 배기가스가 도시를 잿빛 스모그로 뒤덮는다', (s) => {
    s.sky('day'); s.ground('road', 250);
    s.step(1, building(110, 250, 70, 150, '#9fb4d0') + building(220, 250, 60, 110, '#8fa6c4') + tree(350, 252, 0.8) + L('M0 270H560', '#fff', 4, 'stroke-dasharray="26 18" stroke-opacity=".8"'), { cls: 'up' });
    s.step(2, `<g transform="translate(450 250)">${R(-40, -90, 80, 90, '#a0602e', 4)}${R(20, -150, 20, 60, '#6b7384', 3)}</g>` + car(250, 266, '#3b82f6', 0.9) + `<g fill="#6b7280" fill-opacity=".8">${C(480, 100, 24)}${C(510, 80, 20)}${C(450, 72, 18)}${C(200, 266, 12)}${C(180, 260, 10)}</g>`, { cls: 'up' });
    s.step(3, `<rect width="560" height="300" fill="#8a8f99" fill-opacity=".55"/>` + person({ x: 120, y: 280, shirt: '#3b82f6', fc: 'sick', armL: [16, -30], s: 0.7 }) + R(114, 218, 20, 10, '#fff', 3), { });
  }],
  ['altruism', '#ec4899', '자기 외투를 벗어 추위에 떠는 낯선 이에게 대가 없이 건넨다', (s) => {
    s.sky('gray'); s.ground('snow', 244);
    s.step(1, person({ x: 420, y: 258, shirt: '#94a3b8', fc: 'sad', armL: [-6, 24], armR: [6, 24] }) + L('M390 160L376 150M450 160L464 150', '#38bdf8', 3), { cls: 'up' });
    s.step(2, person({ x: 150, y: 258, shirt: '#3b82f6', fc: 'smile', armR: [40, -4] }) + R(190, 190, 40, 50, '#dc2626', 8, 'stroke="#991b1b" stroke-width="2"'), { cls: 'up' });
    s.mv(3, 'translateX(-130px)', R(390, 160, 60, 70, '#dc2626', 10, 'stroke="#991b1b" stroke-width="2"'), { d: 0.9 });
    s.step(3, heart(285, 100, 1.1, '#ef4444') + sparks(285, 110, 30, 44, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['fiber', '#7c3aed', '목화솜에서 뽑아낸 가느다란 섬유가 꼬여 실이 된다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(120 252)">${L('M0 0V-100', '#6b8a3a', 6)}${[[-14, -110], [14, -110], [0, -126]].map(([x, y]) => C(x, y, 16, '#fff', 'stroke="#d6dbe5" stroke-width="2"')).join('')}${P('M0 -50C-22 -64 -34 -50 -22 -38Z M0 -60C22 -74 34 -60 22 -48Z', '#5fb85a')}</g>`, { cls: 'up' });
    s.step(2, L('M170 150Q220 130 270 150T360 150', '#e5e7eb', 3) + L('M170 160Q220 140 270 160T360 160', '#d6dbe5', 3) + L('M170 140Q220 120 270 140T360 140', '#f4f6fa', 3), { cls: 'wipe' });
    s.step(3, L('M290 150Q320 130 350 150T410 150T470 150', '#a78bfa', 8) + L('M290 150Q320 170 350 150T410 150T470 150', '#7c3aed', 8) + `<g transform="translate(470 200)">${R(-22, -30, 44, 60, '#a78bfa', 6)}${R(-30, -36, 60, 10, '#6b4a2a', 3)}${R(-30, 24, 60, 10, '#6b4a2a', 3)}</g>`, { cls: 'wipe' });
  }],
  ['medieval', '#78350f', '성과 방패, 칼을 든 기사의 중세 시대', (s) => {
    s.sky('dusk'); s.ground('grass', 246);
    s.step(1, castle(400, 252, 1.2), { cls: 'up' });
    s.step(2, person({ x: 150, y: 262, shirt: '#9aa3b2', pants: '#6b7384', fc: 'angry', hat: '<path d="M-17 -84Q-17 -112 0 -112Q17 -112 17 -84Z" fill="#aab4c6"/><rect x="-16" y="-88" width="32" height="6" fill="#6b7384"/><path d="M-4 -112Q0 -124 4 -112Z" fill="#ef4444"/>', armL: [-20, 4], armR: [24, -50] }), { cls: 'up' });
    s.step(3, L('M196 130L204 214', '#aab4c6', 7) + P('M196 214L212 214L204 232Z', '#aab4c6') + P('M118 190Q126 220 150 230Q174 220 182 190Z', '#2563eb', 'stroke="#1e3a8a" stroke-width="3"') + flag(400, 70, '#b91c1c', 40), { cls: 'pop' });
  }],
  ['analogy', '#0d9488', '심장이 피를 보내는 것과 펌프가 물을 보내는 것을 견주어 같다고 이어 본다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, heart(120, 140, 2, '#ef4444') + L('M170 150H250', '#ef4444', 8) + arrow(230, 150, 260, 150, '#ef4444', 5, 12), { cls: 'up' });
    s.step(2, `<g transform="translate(360 160)">${R(-40, -30, 60, 60, '#3b82f6', 8)}${R(10, -10, 80, 20, '#93c5fd', 6)}${C(-10, 0, 14, '#dbeafe')}</g>` + L('M450 150H520', '#3b82f6', 8), { cls: 'up' });
    s.step(3, R(260, 70, 40, 8, '#0d9488', 3) + R(260, 90, 40, 8, '#0d9488', 3) + sparks(280, 84, 40, 54, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['composure', '#0ea5e9', '모두가 허둥대는 소란 속에서도 홀로 차분히 평정을 지킨다', (s) => {
    s.sky('gray'); s.ground('floor', 252);
    s.step(1, [90, 150, 410, 470].map((x, i) => person({ x, y: 262, shirt: ['#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'][i], fc: 'shock', legs: 'walk', rot: i % 2 ? 12 : -12, armL: [-30, -30], armR: [30, -30], s: 0.8 })).join('') + `<g fill="#8fb4d8">${[70, 160, 250, 340, 430, 520].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.5}s" d="M${x} 20c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>`, { cls: 'up', e: 2 });
    s.step(2, person({ x: 280, y: 254, shirt: '#0ea5e9', fc: 'smile', legs: 'hide', armL: [-26, 20], armR: [26, 20], sh: true }) + R(240, 252, 80, 10, '#0369a1', 4), { cls: 'up' });
    s.step(3, C(280, 190, 100, 'none', 'stroke="#38bdf8" stroke-width="4" stroke-opacity=".6"') + C(280, 190, 70, '#bae6fd', 'fill-opacity=".35"') + sparks(280, 190, 100, 114, '#7dd3fc', 10, 3), { cls: 'pop' });
  }],
  ['indulge', '#ec4899', '쌓인 디저트를 마음껏 먹어 치우며 한껏 즐긴다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, table(400, 238, 220) + cake(350, 228, 1.2) + `<g transform="translate(430 228)">${C(0, -10, 14, '#f472b6')}${C(30, -10, 14, '#fbbf24')}${C(15, -28, 14, '#60a5fa')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 170, y: 254, shirt: '#ec4899', fc: 'cheer', armR: [40, -4] }), { cls: 'up', e: 2 });
    s.step(3, `<g transform="translate(170 254)">${shadow(0, 12, 34)}${E(0, -30, 36, 40, '#ec4899')}${R(-3, -68, 6, 8, '#ffd7b5')}${C(0, -82, 16, '#ffd7b5')}${P('M-17 -84Q-19 -104 0 -102Q19 -104 17 -84Q9 -95 0 -95Q-9 -95 -17 -84Z', '#3a2418')}${L('M-6 -80Q0 -74 6 -80', '#2a1a12', 3)}${C(-6, -86, 2.4, '#2a1a12')}${C(6, -86, 2.4, '#2a1a12')}${L('M-30 -30Q-44 -20 -36 -6M30 -30Q44 -20 36 -6', '#ffd7b5', 7)}</g>` + heart(220, 130, 0.7, '#ef4444') + sparks(170, 150, 50, 64, '#ffd34d', 6, 3), { });
  }],
  ['complacent', '#f59e0b', '해먹에서 느긋하게 만족해하는 사이 경쟁자들이 앞질러 간다', (s) => {
    s.sky('sun'); s.ground('grass', 244);
    s.step(1, tree(90, 252, 1) + tree(300, 252, 1) + L('M110 170Q200 210 290 170', '#c9a37a', 8), { cls: 'up' });
    s.step(1, person({ x: 200, y: 200, shirt: '#f59e0b', fc: 'cheer', legs: 'hide', rot: 80, rotO: '0 0', armL: [-10, 20], armR: [10, 20], sh: false, hat: '<g fill="#2a2e3a"><rect x="-12" y="-86" width="10" height="6" rx="2"/><rect x="2" y="-86" width="10" height="6" rx="2"/></g>' }), { cls: 'up' });
    s.mv(2, 'translateX(-180px)', person({ x: 470, y: 262, shirt: '#3b82f6', legs: 'walk', s: 0.75, fc: 'angry' }) + person({ x: 530, y: 262, shirt: '#ef4444', legs: 'walk', s: 0.75, fc: 'angry' }), { d: 1 });
    s.step(3, moon(280, 100, 16, '#e8eaf6') + L('M150 120L170 120M170 120L150 136', '#94a3b8', 3, 'stroke-opacity="0"') + cross(500, 56), { cls: 'pop' });
  }],
  ['explicit', '#16a34a', '숨김없이 굵은 화살표로 분명하게 명시해 알려 주는 안내', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, `<g transform="translate(300 250)">${R(-6, -150, 12, 150, '#6b7384')}${R(-110, -150, 220, 70, '#16a34a', 10, 'stroke="#fff" stroke-width="4"')}</g>`, { cls: 'up' });
    s.step(2, arrow(220, 116, 380, 116, '#fff', 14, 30), { cls: 'wipe' });
    s.step(3, person({ x: 120, y: 258, shirt: '#2563eb', fc: 'cheer', armR: [40, -50] }) + chk(480, 80) + sparks(300, 116, 120, 136, '#ffd34d', 12, 3), { cls: 'up' });
  }],
  ['sturdy', '#92400e', '무거운 추를 잔뜩 얹어도 끄떡없이 버티는 튼튼한 탁자', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-120, -80, 240, 20, '#8c5a2a', 6, 'stroke="#5a3a1a" stroke-width="3"')}${R(-100, -60, 22, 60, '#6b4a2a', 3)}${R(78, -60, 22, 60, '#6b4a2a', 3)}</g>`, { cls: 'up' });
    s.step(2, [[-70, 'a'], [0, 'b'], [70, 'c']].map(([x]) => `<g transform="translate(${280 + x} 172)">${R(-26, -40, 52, 40, '#475569', 6)}${R(-12, -50, 24, 10, '#475569', 3)}</g>`).join('') + `<g transform="translate(280 132)">${R(-30, -40, 60, 40, '#6b7384', 6)}${R(-14, -50, 28, 10, '#6b7384', 3)}</g>`, { cls: 'up' });
    s.step(3, chk(480, 56) + L('M130 190L110 190M430 190L450 190', '#92400e', 4), { cls: 'pop' });
  }],
  ['primate', '#92400e', '나무에 매달려 바나나를 먹는 원숭이 같은 영장류', (s) => {
    s.sky('green'); s.ground('grass', 252);
    s.step(1, L('M280 252V70', '#6b4a2a', 14) + L('M280 110Q340 90 400 100', '#6b4a2a', 10) + P('M360 70C400 40 450 60 440 90C410 100 380 96 360 70Z', '#5fb85a'), { cls: 'up' });
    s.step(2, `<g transform="translate(360 140)">${E(0, 20, 22, 34, '#8a5a2e')}${C(0, -22, 22, '#8a5a2e')}${C(0, -18, 14, '#e8c9a0')}${C(-6, -22, 3, '#2a1a12')}${C(6, -22, 3, '#2a1a12')}${C(-22, -26, 8, '#8a5a2e')}${C(22, -26, 8, '#8a5a2e')}${L('M-4 -12Q0 -8 4 -12', '#2a1a12', 2)}${L('M-20 10L-60 -20', '#8a5a2e', 9)}${L('M24 20Q60 40 70 80', '#8a5a2e', 7)}</g>`, { cls: 'up' });
    s.step(3, `<g transform="translate(330 130) rotate(-30)">${P('M-8 -22C-18 -10 -14 12 4 20C10 14 14 -6 -8 -22Z', '#facc15', 'stroke="#d99a00" stroke-width="2"')}</g>` + heart(420, 60, 0.7, '#ef4444'), { cls: 'pop' });
  }],
  ['imperial', '#b91c1c', '황제의 땅이 지도 위로 넓게 퍼져 나가는 제국', (s) => {
    s.sky('warm'); s.ground('floor', 262);
    s.step(1, P('M80 150Q100 80 200 80Q300 70 360 110Q460 100 480 170Q470 230 380 240Q270 260 180 240Q90 220 80 150Z', '#e8d6a8', 'stroke="#b89a5a" stroke-width="3"'), { cls: 'up' });
    s.step(2, P('M120 150Q130 110 190 110Q230 112 240 150Q230 190 190 196Q130 190 120 150Z', '#ef4444', 'fill-opacity=".8"'), { cls: 'pop', e: 2 });
    s.step(3, P('M110 150Q110 100 200 96Q310 90 380 130Q420 160 400 200Q330 230 200 220Q110 200 110 150Z', '#ef4444', 'fill-opacity=".8"') + crown(240, 150, 1.4) + flag(420, 200, '#b91c1c', 50), { cls: 'pop' });
  }],
  ['populate', '#16a34a', '텅 빈 섬에 배를 타고 사람들이 건너와 마을을 이루어 산다', (s) => {
    s.sky('day'); s.ground('water', 200);
    s.step(1, E(280, 200, 160, 40, '#e8d6a8') + tree(250, 200, 0.7) + tree(320, 204, 0.6), { cls: 'up' });
    s.mv(2, 'translateX(-200px)', `<g transform="translate(470 220)">${P('M-50 0H50L34 20H-34Z', '#8c5a2a')}${person({ x: -14, y: 0, shirt: '#3b82f6', s: 0.4, sh: false, legs: 'hide' })}${person({ x: 16, y: 0, shirt: '#ec4899', hs: 'long', s: 0.4, sh: false, legs: 'hide' })}</g>`, { d: 1 });
    s.step(3, house(200, 204, 60, '#f3d9b5', '#c0392b', 0.8) + house(360, 208, 60, '#cfe3f4', '#3b6aa0', 0.8) + person({ x: 270, y: 218, shirt: '#22c55e', s: 0.5, fc: 'cheer' }) + person({ x: 300, y: 218, shirt: '#f59e0b', s: 0.5, fc: 'cheer' }) + person({ x: 330, y: 220, shirt: '#8b5cf6', s: 0.5, fc: 'cheer' }) + heart(280, 90, 0.7, '#ef4444'), { cls: 'up' });
  }],
];
