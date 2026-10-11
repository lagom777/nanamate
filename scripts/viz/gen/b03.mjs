import { T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, car, building, key, tie } from './props.mjs';

const medal = (x, y) => `<g transform="translate(${x} ${y})">${L('M-8 -22L0 0L8 -22', '#ef4444', 4)}${C(0, 8, 9, '#ffd34d', 'stroke="#d99a00" stroke-width="2.4"')}</g>`;
const book = (x, y, open = true) => `<g transform="translate(${x} ${y})"><path d="M-36 -4Q-18 -14 0 -4Q18 -14 36 -4V26Q18 16 0 26Q-18 16 -36 26Z" fill="#fff" stroke="#8a93a5" stroke-width="3"/>${L('M0 -4V26', '#8a93a5', 3)}${L('M-28 6Q-18 2 -8 6M-28 14Q-18 10 -8 14M8 6Q18 2 28 6M8 14Q18 10 28 14', '#aab4c6', 2)}</g>`;

export default [
  ['vague', '#64748b', '안개에 가려 모양이 흐릿하고 분명치 않다', (s) => {
    s.sky('day'); s.ground('grass', 240);
    s.step(1, house(330, 244, 130, '#f3d9b5', '#c0392b') + tree(180, 250, 1), { cls: 'up' });
    s.step(2, `<rect width="560" height="300" fill="#eef2f7" fill-opacity=".55"/>`, {});
    s.step(3, `<rect width="560" height="300" fill="#eef2f7" fill-opacity=".72"/>` + cloud(100, 150, 2, '#fff', 0.8) + cloud(430, 190, 2.2, '#fff', 0.8), {});
    s.step(3, person({ x: 90, y: 262, shirt: '#64748b', fc: 'think', armR: [16, -34] }), { cls: 'up' });
    s.badge('q', 500, 50);
  }],
  ['rough', '#a16207', '울퉁불퉁한 길 위에서 수레가 덜컹거리며 흔들린다', (s) => {
    s.sky('sun'); s.ground('sand', 244);
    s.step(1, P('M0 244L40 232L70 246L110 228L150 246L200 230L240 248L290 228L340 246L390 230L440 248L490 232L560 246V300H0Z', '#b98650', 'stroke="#7a461f" stroke-width="3" stroke-linejoin="round"') + C(110, 230, 10, '#8a7a68') + C(290, 230, 12, '#8a7a68') + C(440, 250, 9, '#8a7a68'), { cls: 'up' });
    s.mv(2, 'translateX(-250px)', `<g transform="translate(400 222)"><g class="a-bob" style="animation-duration:.35s">${R(-40, -34, 80, 36, '#3b82f6', 6)}${R(-46, -40, 92, 8, '#1d4ed8', 3)}</g>${C(-22, 8, 13, '#1f2937', 'stroke="#9aa3b2" stroke-width="3"')}${C(24, 8, 13, '#1f2937', 'stroke="#9aa3b2" stroke-width="3"')}</g>`, { d: 1 });
    s.step(3, L('M370 160L350 140M410 156L420 132M440 168L462 150', '#a16207', 5) + star(380, 120, 8), { cls: 'pop' });
  }],
  ['disgrace', '#7f1d1d', '메달을 빼앗기고 사람들에게 외면당해 고개를 숙인다', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, person({ x: 220, y: 254, shirt: '#16a34a', fc: 'cheer', armL: [-20, -40], armR: [20, -40] }) + medal(220, 200), { cls: 'up', e: 2 });
    s.mv(2, 'translateY(-50px)', medal(300, 244), { d: 0.8, ease: 'cubic-bezier(.5,0,1,1)' });
    s.step(3, person({ x: 220, y: 254, shirt: '#6b7280', fc: 'sad', rot: 6, armL: [-6, 28], armR: [6, 28], skin: '#e4c5ab' }), {});
    s.step(3, person({ x: 70, y: 254, shirt: '#475569', fc: 'angry', rot: -4, armL: [10, -6], armR: [-10, -6] }) + person({ x: 490, y: 254, shirt: '#475569', fc: 'angry', hs: 'long', armL: [10, -6], armR: [-10, -6] }), { cls: 'up' });
    s.badge('down', 500, 56);
  }],
  ['chore', '#0d9488', '설거지와 빨래, 청소 같은 집안일을 도맡아 한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(150 252)">${R(-70, -60, 140, 60, '#cbd5e1', 4)}${R(-62, -76, 124, 16, '#e5e9f0', 4)}${R(-50, -90, 30, 14, '#fff', 3)}${R(-12, -96, 36, 20, '#fff', 3)}${R(28, -90, 28, 14, '#fff', 3)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 280, y: 254, shirt: '#0d9488', hs: 'long', fc: 'smile', armL: [-60, 6], armR: [-50, -14] }), { cls: 'up' });
    s.step(2, C(120, 140, 8, '#cfeaff', 'fill-opacity=".8"') + C(160, 130, 6, '#cfeaff', 'fill-opacity=".8"') + C(185, 148, 10, '#cfeaff', 'fill-opacity=".8"'), { cls: 'pop' });
    s.step(3, basket(430, 252, 1.4, '#f472b6') + `<g transform="translate(500 252)">${L('M0 0V-110', '#8c6238', 6)}${P('M-20 -12L20 -12L28 8H-28Z', '#e8c25a')}</g>` + sparks(150, 130, 40, 56, '#ffd34d', 6, 4), { cls: 'up' });
    s.badge('check', 500, 40);
  }],
  ['radiant', '#f59e0b', '온몸에서 빛이 나는 듯 환하게 빛나는 모습', (s) => {
    s.sky('dusk'); s.ground('grass', 244);
    s.step(1, person({ x: 280, y: 258, shirt: '#ec4899', hs: 'long', hair: '#6b3a1a', fc: 'cheer', armL: [-30, -20], armR: [30, -20] }), { cls: 'up' });
    s.step(2, C(280, 180, 90, '#ffe9a0', 'fill-opacity=".35"') + C(280, 180, 60, '#fff3b8', 'fill-opacity=".35"'), { cls: 'pop' });
    s.step(3, sparks(280, 170, 100, 130, '#ffd34d', 14, 5) + star(180, 100, 10) + star(380, 90, 12) + star(240, 70, 8) + star(330, 130, 7), { cls: 'pop' });
  }],
  ['exclaim', '#ef4444', '놀라운 광경을 보고 외치는 소리가 터져 나온다', (s) => {
    s.sky('night'); s.ground('grass', 246);
    s.step(1, `<g fill="#ffd34d">${star(420, 70, 14)}${star(470, 110, 10, '#ef4444')}${star(380, 120, 9, '#3b82f6')}</g>` + sparks(420, 90, 20, 36, '#ffd34d', 8, 4), { cls: 'pop' });
    s.step(1, person({ x: 200, y: 262, shirt: '#ef4444', fc: 'shock', armL: [-20, -10], armR: [20, -10] }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 200, y: 262, shirt: '#ef4444', fc: 'cheer', armL: [-30, -46], armR: [30, -46] }), { e: 3 });
    s.step(3, bubble(280, 120, 90, 56, '#fff', 'l') + L('M280 100V122M280 134V136', '#ef4444', 10) + L('M226 150L206 140M236 168L214 168M230 186L210 196', '#ffd34d', 4), { cls: 'pop' });
  }],
  ['vicious', '#7f1d1d', '이빨을 드러내고 사납게 으르렁거리는 개에게 사람이 뒷걸음친다', (s) => {
    s.sky('gray'); s.ground('grass', 244);
    s.step(1, dog(380, 256, 1.8, '#6b4a2a'), { cls: 'up' });
    s.step(2, P('M340 192L346 204L352 192L358 204L364 192Z', '#fff', 'stroke="#2a1a12" stroke-width="1.6"') + L('M356 162L378 170M392 162L372 172', '#2a1a12', 3.4) + L('M310 150L292 140M330 140L322 122M310 170L288 172', '#ef4444', 4), { cls: 'pop' });
    s.mv(3, 'translateX(60px)', person({ x: 110, y: 262, shirt: '#3b82f6', fc: 'shock', legs: 'walk', rot: -8, armL: [-30, -20], armR: [-24, -30] }), { d: 0.9, dl: 0 });
    s.step(2, person({ x: 170, y: 262, shirt: '#3b82f6', fc: 'shock', armL: [-20, -10], armR: [20, -10] }), { cls: 'up', e: 2 });
    s.badge('excl', 500, 50);
  }],
  ['cope', '#0891b2', '여러 일이 몰려도 침착하게 공을 돌리며 대처해 낸다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#0891b2', fc: 'neutral', armL: [-30, -22], armR: [30, -22] }), { cls: 'up' });
    s.step(2, `<g class="a-bob" style="animation-duration:.9s">${C(210, 110, 12, '#ef4444')}</g><g class="a-bob" style="animation-duration:.9s;animation-delay:-.3s">${C(280, 70, 12, '#facc15')}</g><g class="a-bob" style="animation-duration:.9s;animation-delay:-.6s">${C(350, 110, 12, '#22c55e')}</g>` + L('M210 150Q280 20 350 150', '#aab4c6', 3, 'stroke-dasharray="6 6"'), {});
    s.step(2, drop(250, 96, 0.8) + drop(312, 100, 0.8), { cls: 'pop', e: 2 });
    s.step(3, person({ x: 280, y: 254, shirt: '#0891b2', fc: 'cheer', armL: [-30, -22], armR: [30, -22] }));
    s.badge('check', 500, 56);
  }],
  ['hence', '#6366f1', '먹구름이라서 그러므로 우산을 쓴다는 원인과 결과의 이어짐', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, cloud(130, 90, 1.8, '#6b7384') + L('M100 130V160M130 130V160M160 130V160', '#6fb8ee', 5), { cls: 'up' });
    s.step(2, arrow(210, 130, 340, 130, '#6366f1', 7, 18) + C(275, 70, 6, '#6366f1') + C(257, 100, 6, '#6366f1') + C(293, 100, 6, '#6366f1'), { cls: 'wipe' });
    s.step(3, person({ x: 430, y: 254, shirt: '#6366f1', fc: 'smile', armR: [20, -30] }) + `<g transform="translate(452 190)"><path d="M-44 0Q0 -48 44 0Z" fill="#ef4444"/><path d="M0 0V50" stroke="#6b4a2a" stroke-width="3"/></g>`, { cls: 'up' });
  }],
  ['flush', '#ef4444', '마음에 둔 사람을 보자 얼굴이 확 붉어진다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, person({ x: 160, y: 254, shirt: '#3b82f6', fc: 'neutral' }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 410, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armL: [-20, -40] }) + person({ x: 160, y: 254, shirt: '#3b82f6', fc: 'shy', skin: '#ffb8a6' }), { cls: 'up' });
    s.step(3, person({ x: 160, y: 254, shirt: '#3b82f6', fc: 'shy', skin: '#ff8a7a' }) + heart(200, 120, 0.8, '#ec4899') + heart(240, 90, 0.6, '#ef4444') + sparks(160, 170, 24, 36, '#ef4444', 8, 3), {});
  }],
  ['omit', '#475569', '줄지어 놓인 카드 가운데 하나를 빼먹어 빈자리가 생긴다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, [90, 190, 290, 390, 490].map((x, i) => R(x - 36, 120, 72, 100, ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'][i], 8, 'stroke="#fff" stroke-width="3"')).join('').replace(/<rect x="254"[^>]*\/>/, ''), { cls: 'up' });
    s.step(2, R(254, 120, 72, 100, 'none', 8, 'stroke="#475569" stroke-width="4" stroke-dasharray="10 8"'), {});
    s.mv(2, 'translateY(0px)', '<g class="a-bob" style="animation-duration:.8s">' + R(254, 40, 72, 60, '#22c55e', 8, 'stroke="#fff" stroke-width="3"') + '</g>', { d: 0.7 });
    s.step(3, L('M240 130L320 210M320 130L240 210', '#ef4444', 6) + arrow(290, 100, 290, 60, '#475569'), { cls: 'pop' });
  }],
  ['astonish', '#f59e0b', '모자에서 토끼가 튀어나오자 관객이 깜짝 놀란다', (s) => {
    s.sky('night'); s.ground('floor', 250);
    s.step(1, person({ x: 160, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: '<rect x="-14" y="-124" width="28" height="30" fill="#1f2937"/><rect x="-22" y="-96" width="44" height="6" rx="3" fill="#1f2937"/>', armR: [34, -10] }) + R(236, 206, 70, 44, '#7c3aed', 4) + E(271, 206, 36, 8, '#4c1d95'), { cls: 'up' });
    s.step(2, `<g transform="translate(271 200)">${E(0, -22, 16, 24, '#f4f6fa')}${C(0, -52, 12, '#f4f6fa')}${E(-6, -76, 4, 14, '#f4f6fa')}${E(6, -76, 4, 14, '#f4f6fa')}</g>`, { cls: 'up' });
    s.step(2, sparks(271, 160, 30, 46, '#ffd34d', 8, 4), { cls: 'pop' });
    s.step(3, person({ x: 430, y: 254, shirt: '#f59e0b', fc: 'shock', armL: [-30, -40], armR: [30, -40] }) + sparks(430, 170, 30, 44, '#f59e0b', 8, 4), { cls: 'up' });
  }],
  ['passage', '#a16207', '어두운 통로를 지나 반대편 밝은 곳으로 빠져나간다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, `<g transform="translate(280 250)"><path d="M-170 0V-70Q-170 -150 0 -150Q170 -150 170 -70V0Z" fill="#8a7a68" stroke="#5f5242" stroke-width="4"/><path d="M-120 0V-70Q-120 -118 0 -118Q120 -118 120 -70V0Z" fill="#2a2e3a"/></g>`, { cls: 'up' });
    s.step(1, `<g transform="translate(280 250)"><path d="M100 0V-62Q100 -90 120 -92V0Z" fill="#ffe9a0"/></g>`, {});
    s.mv(2, 'translateX(-170px)', person({ x: 360, y: 250, shirt: '#3b82f6', s: 0.6, legs: 'walk' }), { d: 1 });
    s.step(3, `<path d="M400 250V150Q400 120 430 120H440V250Z" fill="#fff3b8"/>` + sparks(450, 150, 20, 34, '#ffd34d', 6, 4) + arrow(300, 90, 440, 90, '#a16207', 6, 16), { cls: 'wipe' });
  }],
  ['decent', '#16a34a', '단정한 사람이 어르신 대신 문을 열어 품위 있게 배려한다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, door(420, 252, 70, 140) + person({ x: 180, y: 254, shirt: '#94a3b8', hair: '#d6dbe5', hs: 'short', armR: [24, 20] , s: 0.9 }), { cls: 'up' });
    s.step(2, person({ x: 330, y: 254, shirt: '#16a34a', fc: 'smile', armR: [40, -14] }), { cls: 'up' });
    s.step(2, R(386, 112, 8, 140, '#6b4a2a'), {});
    s.step(3, person({ x: 180, y: 254, shirt: '#94a3b8', hair: '#d6dbe5', fc: 'cheer', armR: [24, 20], s: 0.9 }) + heart(180, 120, 0.9, '#ef4444'), { cls: 'pop' });
    s.badge('check', 500, 56);
  }],
  ['distortion', '#7c3aed', '휘어진 거울에 비친 모습이 길게 늘어나 일그러진다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#7c3aed', fc: 'cheer' }), { cls: 'up' });
    s.step(2, `<g transform="translate(400 252)">${R(-70, -180, 140, 180, '#cfeaff', 8, 'stroke="#c9a96a" stroke-width="10"')}${L('M-50 -150L-10 -40M30 -160L50 -120', '#fff', 5, 'stroke-opacity=".7"')}</g>`, { cls: 'up' });
    s.step(3, `<g transform="translate(400 250) scale(1.7 .6)">${person({ x: 0, y: 0, shirt: '#7c3aed', fc: 'shock', sh: false })}</g>`.replace('translate(400 250) scale(1.7 .6)', 'translate(400 250) scale(1.7 .6)'), { cls: '' });
    s.step(3, L('M330 130Q350 110 340 90M470 150Q490 130 480 110', '#7c3aed', 4), { cls: 'pop' });
  }],
  ['resent', '#b91c1c', '남이 칭찬과 트로피를 받는 모습을 보고 분을 삭이며 원망한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 410, y: 254, shirt: '#16a34a', fc: 'cheer', armL: [-30, -40] }) + `<g transform="translate(372 150)">${R(-10, 0, 20, 10, '#d99a00', 2)}${P('M-16 -26H16V-8Q16 4 0 4Q-16 4 -16 -8Z', '#ffd34d')}</g>`, { cls: 'up' });
    s.step(1, person({ x: 130, y: 254, shirt: '#6b7280', fc: 'neutral', armL: [10, -16], armR: [-10, -16] }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 130, y: 254, shirt: '#6b7280', fc: 'angry', armL: [10, -16], armR: [-10, -16] }), { e: 3 });
    s.step(3, cloud(130, 100, 1.5, '#4a5568') + L('M100 84L110 100M130 78V96M160 84L150 100', '#ffd34d', 4) + P('M130 170L160 220L100 220Z', '#b91c1c', 'fill-opacity="0"'), { cls: 'pop' });
    s.step(3, L('M165 168L250 180M165 176L250 196', '#b91c1c', 4), { cls: 'wipe' });
  }],
  ['monetary', '#ca8a04', '동전과 지폐가 오가고 은행이 돈의 흐름을 맡는다', (s) => {
    s.sky('sun'); s.ground('stone', 246);
    s.step(1, coin(130, 220, 18) + coin(170, 226, 18) + coin(150, 200, 18), { cls: 'up' });
    s.step(2, money(280, 210, 90) + money(300, 190, 90), { cls: 'up' });
    s.step(3, `<g transform="translate(440 246)">${R(-60, -70, 120, 70, '#e8e4d8', 3)}${P('M-72 -70L0 -112L72 -70Z', '#cbbf9c')}${[-36, -12, 12, 36].map((x) => R(x - 5, -64, 10, 56, '#f4f1e6', 2)).join('')}${C(0, -80, 10, '#ffd34d', 'stroke="#d99a00" stroke-width="2.4"')}</g>` + arrow(330, 190, 380, 190, '#ca8a04'), { cls: 'up' });
  }],
  ['monologue', '#475569', '무대 위 배우가 스포트라이트 아래 홀로 길게 대사를 읊는다', (s) => {
    s.sky('dark'); s.ground('floor', 248);
    s.step(1, `<path d="M0 0H130L90 240H0Z" fill="#9b1c1c"/><path d="M560 0H430L470 240H560Z" fill="#9b1c1c"/><path d="M0 0H560V30H0Z" fill="#7a1414"/>`, { cls: 'wipe-d' });
    s.step(2, `<path d="M280 20L200 250H360Z" fill="#fff3b8" fill-opacity=".28"/>`, {});
    s.step(2, person({ x: 280, y: 254, shirt: '#7c3aed', fc: 'cheer', armL: [-30, -30], armR: [30, -22] }), { cls: 'up' });
    s.step(3, bubble(430, 110, 120, 60, '#fff', 'l') + L('M390 100H470M390 116H460', '#aab4c6', 4), { cls: 'pop' });
    s.step(3, `<g fill="#0f172a">${[60, 130, 200, 360, 430, 500].map((x) => C(x, 286, 18)).join('')}</g>`, { cls: 'up' });
  }],
  ['masculine', '#2563eb', '수염과 근육, 화성 기호로 상징되는 남성적인 모습', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 220, y: 254, shirt: '#2563eb', hair: '#2a1a12', hat: '<path d="M-12 -74Q0 -58 12 -74L8 -68Q0 -62 -8 -68Z" fill="#2a1a12"/>' }), { cls: 'up' });
    s.step(2, person({ x: 220, y: 254, shirt: '#2563eb', hair: '#2a1a12', fc: 'cheer', armL: [-34, -26], armR: [34, -26], hat: '<path d="M-12 -74Q0 -58 12 -74L8 -68Q0 -62 -8 -68Z" fill="#2a1a12"/>' }), {});
    s.step(2, `<g fill="#1d4ed8"><circle cx="186" cy="152" r="9"/><circle cx="254" cy="152" r="9"/></g>`, { cls: 'pop' });
    s.step(3, `<g transform="translate(400 140)">${C(-6, 6, 28, 'none', 'stroke="#2563eb" stroke-width="8"')}${L('M14 -14L44 -44M24 -44H44V-24', '#2563eb', 8)}</g>`, { cls: 'pop' });
  }],
  ['frown', '#6b7280', '나쁜 성적표를 보고 눈살을 찌푸린다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 170, y: 254, shirt: '#6b7280', fc: 'neutral', armR: [60, -8] }), { cls: 'up', e: 1 });
    s.step(1, paper(300, 160, 100, 130, 4), { cls: 'up' });
    s.step(2, L('M262 188H340', '#ef4444', 4) + C(300, 130, 22, 'none', 'stroke="#ef4444" stroke-width="5"') + L('M290 130H310', '#ef4444', 5), { cls: 'wipe' });
    s.step(2, person({ x: 170, y: 254, shirt: '#6b7280', fc: 'angry', armR: [60, -8] }), { e: 3 });
    s.step(3, L('M200 110L212 104M246 104L254 112', '#6b7280', 4) + drop(190, 122, 0.7), { cls: 'pop' });
  }],
  ['astound', '#9333ea', '머리 위로 거대한 비행접시가 나타나 사람이 경악해 뒤로 넘어질 듯 놀란다', (s) => {
    s.sky('night'); s.ground('grass', 246);
    s.step(1, person({ x: 170, y: 262, shirt: '#3b82f6', fc: 'neutral', legs: 'walk' }), { cls: 'up', e: 1 });
    s.step(2, `<g transform="translate(360 90)"><ellipse cx="0" cy="10" rx="80" ry="22" fill="#9aa3b5" stroke="#6b7384" stroke-width="3"/><path d="M-36 4Q0 -40 36 4Z" fill="#9fd8ff" stroke="#6b7384" stroke-width="3"/>${C(-50, 12, 5, '#ffd34d')}${C(0, 18, 5, '#ffd34d')}${C(50, 12, 5, '#ffd34d')}</g>`, { cls: 'wipe-d' });
    s.step(2, `<path d="M330 110L300 262H420L390 110Z" fill="#fff3b8" fill-opacity=".3"/>`, { cls: 'wipe-d' });
    s.step(3, person({ x: 170, y: 262, shirt: '#3b82f6', fc: 'shock', rot: -14, armL: [-34, -40], armR: [30, -44] }) + sparks(170, 170, 30, 44, '#ffd34d', 8, 4), {});
  }],
  ['foster', '#ec4899', '어른이 어린 새싹에 정성껏 물을 줘 꽃으로 길러 낸다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, `<g transform="translate(360 250)">${R(-20, -20, 40, 20, '#b98650', 3)}${L('M0 -20V-40', '#3f8f3a', 5)}${P('M0 -34C-12 -44 -22 -38 -14 -30Z M0 -34C12 -44 22 -38 14 -30Z', '#5fb85a')}</g>`, { cls: 'up' });
    s.step(1, person({ x: 170, y: 262, shirt: '#ec4899', hs: 'long', armR: [44, -22] }), { cls: 'up' });
    s.step(2, `<g transform="translate(250 190) rotate(30)">${P('M-20 -14H16L20 10H-16Z', '#60a5fa')}${L('M16 -8L40 -20', '#60a5fa', 5)}</g>` + drop(300, 190, 0.8) + drop(312, 208, 0.8) + drop(322, 190, 0.8), { cls: 'pop' });
    s.step(3, `<g transform="translate(360 210)">${L('M0 0V-70', '#3f8f3a', 6)}${P('M0 -30C-20 -40 -34 -30 -22 -20Z M0 -40C20 -50 34 -40 22 -30Z', '#5fb85a')}${C(0, -80, 10, '#facc15')}${[0, 1, 2, 3, 4].map((i) => C(Math.cos((i / 5) * 6.28) * 16, -80 + Math.sin((i / 5) * 6.28) * 16, 11, '#f472b6')).join('')}</g>` + heart(250, 100, 0.8, '#ec4899'), { cls: 'up' });
  }],
  ['reform', '#0d9488', '낡고 녹슨 톱니바퀴를 새것으로 바꿔 제대로 맞물려 돌게 한다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, gear(220, 170, 44, '#8a7a68') + gear(310, 190, 32, '#8a7a68') + L('M220 130L236 170M310 168L300 190', '#2a2e3a', 4), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(400 120) rotate(40)">${R(-6, -50, 12, 60, '#8a93a5', 3)}${P('M-16 -50A18 18 0 1 1 16 -50L6 -46H-6Z', '#8a93a5')}</g>`, { cls: 'pop' });
    s.step(3, gear(220, 170, 44, '#14b8a6') + gear(310, 190, 32, '#f59e0b') + arrow(260, 90, 360, 90, '#0d9488') + star(440, 80, 12), { cls: 'pop' });
    s.badge('check', 500, 250, 3);
  }],
  ['convention', '#7c3aed', '넓은 홀에 사람들이 모여 한 자리에서 대회를 연다', (s) => {
    s.sky('wall'); s.ground('carpet', 246);
    s.step(1, R(60, 120, 440, 14, '#7c3aed', 3) + R(240, 110, 80, 10, '#a78bfa', 3) + `<g transform="translate(280 130)">${R(-24, 0, 48, 50, '#8c5a2a', 4)}</g>` + P('M80 40H480L460 120H100Z', '#c4b5fd', 'fill-opacity=".7"') + star(280, 82, 14, '#7c3aed'), { cls: 'up' });
    s.step(2, [150, 230, 330, 410].map((x) => `<g><circle cx="${x}" cy="196" r="14" fill="#ffd7b5"/><rect x="${x - 15}" y="208" width="30" height="40" rx="10" fill="#3b82f6"/></g>`).join('') + [100, 190, 280, 370, 460].map((x) => `<g><circle cx="${x}" cy="236" r="16" fill="#f0c6a4"/><rect x="${x - 17}" y="250" width="34" height="46" rx="12" fill="#ec4899"/></g>`).join(''), { cls: 'up' });
    s.step(3, person({ x: 280, y: 138, shirt: '#475569', s: 0.55, fc: 'cheer', armL: [-20, -30], armR: [20, -30], sh: false }) + L('M180 170H250M310 170H380', '#7c3aed', 3), { cls: 'up' });
  }],
  ['devastate', '#7f1d1d', '회오리가 휩쓸고 지나가 마을이 폐허로 변한다', (s) => {
    s.sky('gray'); s.ground('soil', 250);
    s.step(1, house(120, 252, 90, '#f3d9b5', '#c0392b') + house(280, 252, 100, '#cfe3f4', '#3b6aa0') + house(450, 252, 90, '#e8d0e8', '#7c3aed'), { cls: 'up', e: 2 });
    s.step(2, P('M200 30H380L340 120L320 180L300 240H280L260 180L240 120Z', '#5b6577', 'fill-opacity=".85"') + L('M230 60H350M246 100H334M264 150H316', '#2a2e3a', 4), { cls: 'wipe-d' });
    s.step(3, P('M70 252L100 228L130 252Z', '#c0392b') + P('M210 252L260 222L300 252Z', '#3b6aa0') + R(140, 238, 40, 14, '#a8774a', 2, 'transform="rotate(-14 160 245)"') + R(330, 236, 50, 16, '#a8774a', 2, 'transform="rotate(10 355 244)"') + P('M420 252L450 226L490 252Z', '#7c3aed') + C(300, 246, 8, '#8a7a68') + C(190, 248, 6, '#8a7a68'), { cls: 'up' });
    s.badge('excl', 500, 56);
  }],
  ['affair', '#be185d', '노란 통제선 앞에 사람들이 모이고 탐정이 사건을 살핀다', (s) => {
    s.sky('dusk'); s.ground('stone', 248);
    s.step(1, L('M40 200L520 190', '#facc15', 8) + L('M40 200L520 190', '#2a2e3a', 8, 'stroke-dasharray="14 14"') + R(40, 170, 6, 80, '#6b7384') + R(514, 160, 6, 90, '#6b7384'), { cls: 'wipe' });
    s.step(2, [90, 160, 430, 490].map((x, i) => person({ x, y: 296, shirt: ['#3b82f6', '#ec4899', '#22c55e', '#f59e0b'][i], fc: 'shock', s: 0.8 })).join(''), { cls: 'up' });
    s.step(3, person({ x: 280, y: 254, shirt: '#8b6b4a', hat: '<path d="M-20 -90Q0 -112 20 -90Z" fill="#8b6b4a"/><rect x="-24" y="-92" width="48" height="6" rx="3" fill="#8b6b4a"/>', armR: [40, 10] }) + magnifier(340, 220, 0.9), { cls: 'up' });
  }],
  ['contend', '#dc2626', '탁자 위에서 팔씨름으로 서로 한 치도 안 밀리고 겨룬다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(150, 190, 260, 16, '#a0602e', 6) + R(170, 206, 12, 50, '#7a461f') + R(378, 206, 12, 50, '#7a461f'), { cls: 'up' });
    s.step(1, person({ x: 160, y: 232, shirt: '#3b82f6', fc: 'angry', legs: 'hide', armR: [90, 28], armL: [-4, 30] }) + person({ x: 400, y: 232, shirt: '#ef4444', fc: 'angry', legs: 'hide', hs: 'long', armL: [-90, 28], armR: [4, 30] }), { cls: 'up' });
    s.step(2, R(262, 164, 36, 26, '#ffd7b5', 10, 'stroke="#e8b48c" stroke-width="2"'), { cls: 'pop' });
    s.step(3, sparks(280, 170, 36, 54, '#ffd34d', 10, 5) + drop(190, 120, 0.8) + drop(380, 120, 0.8), { cls: 'pop' });
  }],
  ['literate', '#2563eb', '책을 읽고 글을 쓸 줄 아는 사람', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, table(250, 236, 280) + book(190, 232), { cls: 'up' });
    s.step(1, person({ x: 120, y: 254, shirt: '#2563eb', fc: 'smile', armR: [40, 10] }), { cls: 'up' });
    s.step(2, L('M170 190L160 160M210 190L220 160', '#facc15', 3) + bulb(190, 140, 0.8), { cls: 'pop' });
    s.step(3, paper(340, 212, 70, 44, 2).replace('translate(340 212)', 'translate(340 212)') + L('M318 206H360M318 218H350', '#2563eb', 3) + pencil(380, 206, 1, 30), { cls: 'up' });
    s.badge('check', 500, 50);
  }],
];
