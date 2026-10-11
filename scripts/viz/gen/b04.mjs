import { T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, car, building, key, lock, tie } from './props.mjs';

const cone = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M-12 0L12 0L0 40Z', '#d9a05a', 'stroke="#a8742a" stroke-width="2"')}${C(0, -6, 14, '#f9a8d4')}${C(0, -18, 10, '#fde68a')}</g>`;
const fish = (x, y, k = 1, col = '#38bdf8') => `<g transform="translate(${x} ${y}) scale(${k})">${E(0, 0, 26, 14, col)}${P('M-24 0L-42 -12L-42 12Z', col)}${C(14, -3, 3, '#fff')}${C(15, -3, 1.4, '#2a1a12')}</g>`;
const derrick = (x, y) => `<g transform="translate(${x} ${y})">${L('M-40 0L0 -140L40 0M-26 -40H26M-14 -84H14', '#6b7a8c', 6)}${R(-8, -146, 16, 10, '#475569', 2)}</g>`;
const barrel = (x, y, fill = '#1f2937') => `<g transform="translate(${x} ${y})">${R(-26, -56, 52, 56, fill, 8, 'stroke="#475569" stroke-width="3"')}${R(-26, -40, 52, 5, '#6b7a8c')}${R(-26, -18, 52, 5, '#6b7a8c')}</g>`;

export default [
  ['lease', '#0369a1', '계약서에 서명하고 열쇠를 건네받아 집을 빌린다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, house(130, 250, 130, '#f3d9b5', '#c0392b') + person({ x: 330, y: 260, shirt: '#0369a1', fc: 'smile' }), { cls: 'up' });
    s.step(2, paper(400, 160, 110, 130, 4) + L('M366 186Q380 170 392 190T414 184', '#2563eb', 3), { cls: 'up' });
    s.mv(2, 'translate(30px,-40px)', pencil(430, 200, 1, 40), { d: 0.8 });
    s.mv(3, 'translateX(-140px)', key(300, 210, 1.4), { d: 0.9 });
    s.step(3, coin(220, 190, 12) + sparks(130, 130, 50, 62, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['perseverance', '#ea580c', '넘어져도 포기하지 않고 가파른 산을 꾸준히 올라 정상에 선다', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, P('M0 250L240 80L330 160L400 110L560 250Z', '#94a3b8', 'stroke="#64748b" stroke-width="3"') + P('M220 100L240 80L260 100L248 108L240 98L230 110Z', '#fff'), { cls: 'up' });
    s.step(1, person({ x: 90, y: 262, shirt: '#ea580c', legs: 'walk', s: 0.7 }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 170, y: 190, shirt: '#ea580c', legs: 'walk', s: 0.7, fc: 'sad', rot: 18 }) + drop(190, 120, 0.6), { e: 2 });
    s.step(3, flag(240, 80, '#ef4444', 60) + person({ x: 270, y: 120, shirt: '#ea580c', s: 0.6, fc: 'cheer', armL: [-20, -40], armR: [20, -40] }) + sparks(250, 50, 30, 44, '#ffd34d', 8, 4), { cls: 'pop' });
    s.badge('check', 500, 56);
  }],
  ['renowned', '#f59e0b', '무대 위 유명인을 카메라 플래시가 둘러싸고 군중이 환호한다', (s) => {
    s.sky('night'); s.ground('carpet', 250);
    s.step(1, person({ x: 280, y: 254, shirt: '#ec4899', hs: 'long', hair: '#6b3a1a', fc: 'cheer', armL: [-30, -26], armR: [30, -26] }) + star(280, 70, 14), { cls: 'up' });
    s.step(2, [70, 130, 430, 490].map((x, i) => person({ x, y: 296, shirt: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'][i], fc: 'cheer', armR: [14, -50], s: 0.8 })).join(''), { cls: 'up' });
    s.step(3, [[130, 180], [180, 150], [390, 150], [430, 190]].map(([x, y]) => `<g fill="#fff">${star(x, y, 12, '#ffffff')}</g>`).join('') + sparks(280, 110, 80, 96, '#ffd34d', 12, 4), { cls: 'pop' });
  }],
  ['era', '#7c3aed', '동굴 시대에서 성의 시대, 우주 시대로 이어지는 시대의 흐름', (s) => {
    s.sky('cool'); s.ground('floor', 262);
    s.step(1, R(30, 70, 150, 170, '#fde8c8', 14, 'stroke="#c9a37a" stroke-width="3"') + P('M50 220Q105 120 160 220Z', '#8a7a68') + P('M100 220Q105 190 110 220Z', '#2a2e3a') + P('M85 200L105 150L125 200Z', '#ff9a1f'), { cls: 'up' });
    s.step(2, R(205, 70, 150, 170, '#e2e6f4', 14, 'stroke="#aab4c6" stroke-width="3"') + R(240, 150, 80, 70, '#b8bfcf') + R(230, 130, 20, 30, '#b8bfcf') + R(310, 130, 20, 30, '#b8bfcf') + R(268, 110, 24, 40, '#aab4c6') + P('M262 110L280 90L298 110Z', '#ef4444'), { cls: 'up' });
    s.step(3, R(380, 70, 150, 170, '#1b1f4a', 14, 'stroke="#3a3f86" stroke-width="3"') + P('M455 90L470 150V200H440V150Z', '#f4f6fa', 'stroke="#aab4c6" stroke-width="2"') + P('M440 170L418 210L440 200ZM470 170L492 210L470 200Z', '#ef4444') + P('M446 200H464L455 226Z', '#ff9a1f') + star(410, 100, 5, '#fff') + star(500, 120, 4, '#fff'), { cls: 'up' });
    s.step(2, arrow(182, 262, 205, 262, '#7c3aed', 5, 10), {});
    s.step(3, arrow(358, 262, 380, 262, '#7c3aed', 5, 10), {});
  }],
  ['discriminate', '#dc2626', '문지기가 어떤 사람은 들이고 다른 사람은 막아 차별한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(400 252)">${R(-8, -160, 16, 160, '#6b7384')}${R(-90, -160, 100, 14, '#8a93a5', 4)}</g>` + door(470, 252, 60, 130, '#7a461f'), { cls: 'up' });
    s.step(1, person({ x: 120, y: 254, shirt: '#3b82f6' }) + person({ x: 220, y: 254, shirt: '#f59e0b', hs: 'long' }), { cls: 'up' });
    s.step(2, person({ x: 330, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'angry', armL: [-20, -6], hat: hatCap('#1f2937') }), { cls: 'up' });
    s.mv(2, 'translateX(-140px)', person({ x: 470, y: 254, shirt: '#3b82f6', fc: 'cheer', s: 0.9 }), { d: 0.9, e: undefined });
    s.step(3, person({ x: 220, y: 254, shirt: '#f59e0b', hs: 'long', fc: 'sad' }) + L('M180 130L240 190M240 130L180 190', '#ef4444', 6), { cls: '' });
  }],
  ['exemplify', '#0ea5e9', '많은 과일 중 하나를 집어 대표 예로 보여 준다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, basket(200, 250, 2) + apple(170, 170, 1) + apple(214, 172, 1, '#f59e0b') + apple(190, 150, 1, '#22c55e') + apple(240, 160, 1, '#a855f7'), { cls: 'up' });
    s.mv(2, 'translate(-130px,70px)', apple(390, 130, 1.8), { d: 0.9 });
    s.step(2, arrow(250, 140, 340, 130, '#0ea5e9'), { cls: 'wipe' });
    s.step(3, `<circle cx="390" cy="120" r="64" fill="#ffe9a0" fill-opacity=".45"/>` + sparks(390, 120, 64, 80, '#ffd34d', 10, 4) + bulb(470, 90, 0.8), { cls: 'pop' });
  }],
  ['peculiar', '#8b5cf6', '똑같은 새들 사이에 홀로 줄무늬에 별을 단 이상한 새', (s) => {
    s.sky('cool'); s.ground('grass', 244);
    s.step(1, bird(110, 232, 2) + bird(210, 232, 2) + bird(430, 232, 2), { cls: 'up' });
    s.step(2, `<g transform="translate(320 232) scale(2.4)">${E(0, 0, 14, 9, '#ec4899')}${L('M-8 -6L-4 6M0 -8L2 8M8 -6L10 6', '#facc15', 2.4)}${C(11, -6, 7, '#8b5cf6')}${P('M17 -6L26 -4L17 -2Z', '#f59e0b')}${C(13, -7, 1.6, '#fff')}${P('M-8 -2Q-20 -14 -6 -12Z', '#22c55e')}</g>`, { cls: 'pop' });
    s.step(3, star(320, 70, 12) + L('M270 60Q276 40 296 40Q320 40 320 62Q320 74 308 80V90M308 100V104', '#8b5cf6', 7, 'transform="translate(30 -20)"'), { cls: 'pop' });
  }],
  ['sake', '#e11d48', '사랑하는 가족을 위해 땀 흘려 일하는 이를 위한 목적', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, person({ x: 150, y: 258, shirt: '#e11d48', fc: 'smile', armR: [40, -4], armL: [30, 6] }) + `<g transform="translate(212 224) rotate(-30)">${R(-4, -50, 8, 50, '#8c6238')}${P('M-18 -50H18L10 -32H-10Z', '#8a93a5')}</g>`, { cls: 'up' });
    s.step(1, drop(180, 150, 0.8) + drop(120, 140, 0.8), { cls: 'pop' });
    s.step(2, house(430, 250, 110, '#f3d9b5', '#c0392b') + person({ x: 380, y: 266, shirt: '#f59e0b', s: 0.6, fc: 'cheer' }) + person({ x: 470, y: 266, shirt: '#ec4899', s: 0.55, hs: 'long', fc: 'cheer' }), { cls: 'up' });
    s.step(3, arrow(240, 130, 380, 130, '#e11d48') + heart(310, 90, 0.9, '#ef4444'), { cls: 'wipe' });
  }],
  ['tender', '#d97706', '칼이 푹 들어가는 부드럽고 연한 스테이크', (s) => {
    s.sky('warm'); s.ground('floor', 250);
    s.step(1, table(280, 236, 340) + `<g transform="translate(280 226)">${E(0, 0, 100, 20, '#fff', 'stroke="#d6dbe5" stroke-width="3"')}<path d="M-60 -2Q-70 -24 -20 -28Q40 -34 60 -10Q62 6 20 8Q-40 12 -60 -2Z" fill="#9a4a2a" stroke="#6a2a14" stroke-width="3"/>${L('M-40 -14Q-10 -22 30 -14', '#c9795a', 3)}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(250 190) rotate(20)">${R(-4, -40, 8, 48, '#d6dbe5', 2)}${P('M-4 8H4L20 40H-4Z', '#aab4c6')}</g>` + L('M290 160Q300 140 290 120M270 160Q280 140 270 120', '#cbd5e1', 4), { cls: 'up' });
    s.step(3, `<g transform="translate(320 212) rotate(-14)"><path d="M-30 0Q-34 -14 0 -16Q30 -14 30 0Q28 8 0 8Q-28 8 -30 0Z" fill="#b8643e" stroke="#6a2a14" stroke-width="2.4"/></g>` + sparks(280, 170, 80, 96, '#ffd34d', 6, 4) + heart(430, 90, 0.8, '#ef4444'), { cls: 'pop' });
  }],
  ['afflict', '#6b7280', '먹구름과 번개가 사람을 따라다니며 고통을 준다', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, person({ x: 280, y: 254, shirt: '#6b7280', fc: 'sad' }), { cls: 'up' });
    s.step(2, cloud(280, 80, 2.2, '#4a5568') + P('M270 110L252 150H274L260 190L296 138H274L286 110Z', '#ffd34d'), { cls: 'up' });
    s.step(3, person({ x: 280, y: 254, shirt: '#6b7280', fc: 'cry', skin: '#e4c5ab', armL: [10, -30], armR: [-10, -30] }) + L('M240 160L228 150M320 160L332 150M236 190L222 194M324 190L338 194', '#ef4444', 4), {});
    s.badge('excl', 500, 56);
  }],
  ['empirical', '#0d9488', '직접 실험하고 관찰해 얻은 자료로 확인하는 경험적 방법', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, table(180, 236, 200) + `<g transform="translate(180 226)">${P('M-10 -50H10V-30L26 0H-26L-10 -30Z', '#dff1fc', 'stroke="#8a93a5" stroke-width="3"')}${P('M-20 -8H20L26 0H-26Z', '#34d399')}</g>`, { cls: 'up' });
    s.step(1, person({ x: 70, y: 254, shirt: '#0d9488', hs: 'bun', armR: [40, 4] }), { cls: 'up' });
    s.step(2, paper(400, 150, 110, 120, 0) + L('M360 180L380 160L400 170L420 130L440 120', '#0d9488', 4) + C(360, 180, 5, '#ef4444') + C(380, 160, 5, '#ef4444') + C(400, 170, 5, '#ef4444') + C(420, 130, 5, '#ef4444') + C(440, 120, 5, '#ef4444'), { cls: 'up' });
    s.step(3, L('M340 200H460M350 110V210', '#aab4c6', 3) + arrow(350, 190, 460, 106, '#0d9488', 4, 12), { cls: 'wipe' });
    s.badge('check', 500, 56);
  }],
  ['coherent', '#2563eb', '흩어진 생각들이 줄줄이 이어져 앞뒤가 맞는 논리가 된다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, bulb(110, 120, 1) + bulb(250, 190, 1) + bulb(380, 100, 1) + bulb(470, 200, 1), { cls: 'pop', e: 1 });
    s.step(2, bulb(90, 150, 1) + bulb(210, 150, 1) + bulb(330, 150, 1) + bulb(450, 150, 1), { cls: 'pop', e: 3 });
    s.step(2, L('M110 130H190M230 130H310M350 130H430', '#2563eb', 5), { cls: 'wipe' });
    s.step(3, arrow(80, 220, 480, 220, '#2563eb', 6, 16), { cls: 'wipe' });
    s.badge('check', 500, 56);
  }],
  ['intolerable', '#dc2626', '귀가 찢어질 듯한 소음을 도저히 참을 수 없어 귀를 막는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(110 252)">${R(-44, -130, 88, 130, '#1f2937', 8)}${C(0, -90, 24, '#475569')}${C(0, -90, 10, '#1f2937')}${C(0, -38, 16, '#475569')}</g>`, { cls: 'up' });
    s.step(2, `<g fill="none" stroke="#dc2626" stroke-width="5" stroke-linecap="round"><path d="M170 150Q190 170 170 190"/><path d="M190 130Q220 170 190 210"/><path d="M212 110Q252 170 212 230"/></g>`, { cls: 'wipe' });
    s.step(3, person({ x: 360, y: 254, shirt: '#6b7280', fc: 'shock', armL: [16, -30], armR: [-16, -30] }) + L('M330 120L320 100M390 120L400 100M310 150L290 150M410 150L430 150', '#ef4444', 4), { cls: 'up' });
    s.badge('excl', 500, 56);
  }],
  ['conceive', '#7c3aed', '머릿속에 번뜩 떠오른 생각을 설계도로 옮긴다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#7c3aed', fc: 'think', armR: [16, -34] }), { cls: 'up' });
    s.step(2, bulb(190, 130, 1.4) + sparks(190, 98, 40, 56, '#ffd34d', 8, 4), { cls: 'pop' });
    s.step(3, paper(390, 150, 150, 150, 0, '#e8f3ff') + L('M330 110H450M330 170H450', '#93c5fd', 2) + R(350, 120, 40, 40, 'none', 2, 'stroke="#2563eb" stroke-width="3"') + C(430, 140, 18, 'none', 'stroke="#2563eb" stroke-width="3"') + L('M350 200L400 180L440 200', '#2563eb', 3), { cls: 'up' });
    s.step(3, arrow(230, 130, 320, 140, '#7c3aed'), { cls: 'wipe' });
  }],
  ['absurd', '#f59e0b', '물고기가 자전거를 타는 터무니없는 광경에 사람이 어이없어한다', (s) => {
    s.sky('sun'); s.ground('grass', 244);
    s.step(1, `<g transform="translate(330 250)">${C(-50, -20, 28, 'none', 'stroke="#2a2e3a" stroke-width="5"')}${C(50, -20, 28, 'none', 'stroke="#2a2e3a" stroke-width="5"')}${L('M-50 -20L0 -60L50 -20M0 -60L-14 -80H-4', '#ef4444', 5)}${L('M0 -60L18 -80', '#2a2e3a', 5)}</g>`, { cls: 'up' });
    s.step(2, fish(330, 162, 1.8), { cls: 'pop' });
    s.step(3, person({ x: 120, y: 262, shirt: '#f59e0b', fc: 'shock', armL: [-30, -40], armR: [26, -10] }) + L('M100 110Q106 90 126 90Q150 90 150 112Q150 126 130 132V142M130 152V156', '#f59e0b', 8), { cls: 'up' });
  }],
  ['prone', '#475569', '돌에 걸려 넘어져 엎드린 채 쓰러지기 쉬운', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, person({ x: 120, y: 258, shirt: '#475569', legs: 'walk', armR: [-20, 20], armL: [20, 20] }) + C(260, 248, 14, '#8a7a68'), { cls: 'up', e: 1 });
    s.step(2, person({ x: 190, y: 258, shirt: '#475569', fc: 'shock', rot: 28, legs: 'walk', armL: [-30, 20], armR: [30, 10] }) + C(260, 248, 14, '#8a7a68') + L('M200 180L180 160', '#ffd34d', 4), { e: 2 });
    s.step(3, person({ x: 360, y: 244, shirt: '#475569', fc: 'sleep', rot: 90, rotO: '0 0', legs: 'hide', armL: [-30, 10], armR: [30, 10], sh: false }) + C(260, 248, 14, '#8a7a68') + star(400, 180, 9) + star(430, 200, 7), { });
  }],
  ['compulsive', '#be185d', '잠갔는데도 자꾸 되돌아와 열쇠를 다시 확인하는 강박', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, door(400, 252, 70, 140) + lock(400, 190, 0.9), { cls: 'up' });
    s.step(1, person({ x: 240, y: 254, shirt: '#be185d', fc: 'think', armR: [60, -20] }), { cls: 'up' });
    s.step(2, L('M310 100A70 70 0 1 1 250 160', '#be185d', 5) + P('M240 148L256 168L232 170Z', '#be185d'), { cls: 'pop' });
    s.step(3, lock(120, 110, 0.7) + lock(160, 80, 0.7) + lock(200, 110, 0.7) + lock(160, 140, 0.7), { cls: 'pop' });
    s.badge('excl', 500, 56);
  }],
  ['malnutrition', '#a16207', '빈 그릇 앞에서 말라 가는 아이', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(340, 238, 260) + `<g transform="translate(340 228)">${E(0, 0, 50, 10, '#fff', 'stroke="#d6dbe5" stroke-width="3"')}${P('M-50 0Q0 36 50 0Z', '#eef2f7', 'stroke="#d6dbe5" stroke-width="3"')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(150 254) scale(.62 1)">${person({ shirt: '#cbd5e1', pants: '#94a3b8', fc: 'sad', s: 1, sh: false })}</g>`, { cls: 'up' });
    s.step(3, L('M146 190H168M146 200H168M146 210H168', '#9aa3b5', 2) + L('M300 120L360 150M360 120L300 150', '#ef4444', 5), { cls: 'pop' });
    s.step(3, drop(170, 130, 0.8) + drop(130, 130, 0.8), { cls: 'pop' });
  }],
  ['boast', '#f59e0b', '으스대며 자랑을 늘어놓지만 주위는 시큰둥하다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 180, y: 254, shirt: '#f59e0b', fc: 'cheer', armL: [-28, -10], armR: [28, -10] }), { cls: 'up' });
    s.step(2, bubble(310, 110, 170, 90, '#fff', 'l') + `<g transform="translate(310 112)">${P('M-16 -26H16V-6Q16 6 0 6Q-16 6 -16 -6Z', '#ffd34d')}${R(-10, 6, 20, 8, '#d99a00', 2)}${star(-46, -4, 10)}${star(46, -4, 10)}</g>`, { cls: 'pop' });
    s.step(3, person({ x: 430, y: 254, shirt: '#6b7280', fc: 'neutral' }) + L('M410 176L398 170', '#6b7280', 3) + person({ x: 500, y: 296, shirt: '#475569', fc: 'neutral', s: 0.7, hs: 'long' }), { cls: 'up' });
  }],
  ['incentive', '#16a34a', '코앞에 매달린 돈주머니를 보고 신나게 달려가는 동기', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, person({ x: 150, y: 258, shirt: '#16a34a', fc: 'neutral', legs: 'walk' }), { cls: 'up', e: 2 });
    s.step(2, L('M170 170L320 150', '#8c6238', 5) + L('M320 150V170', '#8c6238', 3) + bag(320, 210, 1.2, '#d9772e') + coin(360, 150, 12), { cls: 'pop' });
    s.mv(3, 'translateX(-110px)', person({ x: 270, y: 258, shirt: '#16a34a', fc: 'cheer', legs: 'walk', armR: [50, -20] }), { d: 0.9, e: undefined });
    s.step(3, L('M120 200H60M130 220H50M120 240H70', '#16a34a', 4), { cls: 'pop' });
  }],
  ['confucian', '#b45309', '긴 수염의 스승이 두루마리를 펼쳐 제자들을 가르치는 유교의 모습', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#8b5a2b', pants: '#8b5a2b', hair: '#e5e7eb', hs: 'bald', armR: [40, -10], hat: '<path d="M-10 -72Q0 -46 10 -72Z" fill="#e5e7eb"/><rect x="-16" y="-98" width="32" height="10" rx="4" fill="#1f2937"/>' }), { cls: 'up' });
    s.step(2, R(220, 150, 14, 90, '#d6c9a8', 4, 'stroke="#a89260" stroke-width="2"'), { cls: 'up' });
    s.step(2, [110, 170, 390, 450].map((x, i) => person({ x, y: 296, shirt: ['#3b82f6', '#22c55e', '#ec4899', '#f59e0b'][i], s: 0.75, fc: 'smile', armL: [10, 10], armR: [-10, 10] })).join(''), { cls: 'up' });
    s.step(3, `<g transform="translate(350 130)">${R(-50, -16, 100, 32, '#f3e9c8', 4, 'stroke="#a89260" stroke-width="3"')}${L('M-34 -6H34M-34 6H34', '#a89260', 3)}${R(-56, -20, 8, 40, '#8c6238', 3)}${R(48, -20, 8, 40, '#8c6238', 3)}</g>` + sparks(350, 130, 66, 80, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['draft', '#64748b', '거칠게 쓴 초안이 고쳐지고 다듬어져 깔끔한 최종본이 된다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, paper(170, 150, 150, 170, 0) + L('M120 100Q140 90 160 104T200 100M118 124L222 128M120 150Q150 140 180 154T222 150', '#475569', 3) + L('M130 180L210 200', '#ef4444', 4), { cls: 'up' });
    s.step(2, C(300, 230, 18, '#e5e9f0', 'stroke="#aab4c6" stroke-width="2.4"') + pencil(250, 120, 1.4, 30), { cls: 'pop' });
    s.step(3, paper(400, 150, 150, 170, 6, '#fff') + arrow(250, 150, 330, 150, '#64748b'), { cls: 'up' });
    s.badge('check', 500, 36);
  }],
  ['crude', '#1f2937', '땅에서 시커멓게 솟는 원유를 퍼 올려 통에 모은다', (s) => {
    s.sky('sun'); s.ground('sand', 244);
    s.step(1, derrick(170, 250), { cls: 'up' });
    s.step(2, R(166, 190, 8, 60, '#1f2937', 3) + `<path d="M174 250H340" stroke="#1f2937" stroke-width="14" stroke-linecap="round"/>` + `<g fill="#1f2937">${drop(168, 170, 1.4, '#1f2937')}</g>`, { cls: 'wipe' });
    s.step(3, barrel(400, 252) + barrel(450, 252) + barrel(425, 196), { cls: 'up' });
    s.step(3, `<ellipse cx="170" cy="250" rx="70" ry="10" fill="#1f2937" fill-opacity=".85"/>`, {});
  }],
  ['dismay', '#6b7280', '아이스크림 한 덩이가 땅에 떨어져 낙담한다', (s) => {
    s.sky('sun'); s.ground('stone', 250);
    s.step(1, person({ x: 280, y: 254, shirt: '#3b82f6', fc: 'cheer', armR: [30, -14] }) + cone(312, 160, 1), { cls: 'up', e: 1 });
    s.step(2, person({ x: 280, y: 254, shirt: '#3b82f6', fc: 'shock', armR: [30, -14] }) + P('M300 150L324 150L312 192Z', '#d9a05a', 'stroke="#a8742a" stroke-width="2"') + L('M330 120L350 110M334 140L356 140', '#ffd34d', 4), { e: 2 });
    s.mv(2, 'translateY(-70px)', C(312, 244, 14, '#f9a8d4') , { d: 0.5, ease: 'cubic-bezier(.5,0,1,1)' });
    s.step(3, person({ x: 280, y: 254, shirt: '#3b82f6', fc: 'sad', armR: [30, 4] }) + cone(312, 176, 1).replace('<circle cx="0" cy="-6" r="14" fill="#f9a8d4"/><circle cx="0" cy="-18" r="10" fill="#fde68a"/>', '') + E(318, 248, 22, 6, '#f9a8d4') + drop(262, 168, 0.8), {});
  }],
];
