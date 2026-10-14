import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const cape = '<path d="M-16 -62L-34 0H34L16 -62Z" fill="#1f2937" fill-opacity=".9"/>';

export default [
  ['detest', '#65a30d', '싫어하는 채소를 보고 질색하며 접시를 밀어낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(360, 240, 240) + `<g transform="translate(360 230)">${E(0, 0, 40, 10, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${C(-10, -12, 14, '#4fa04a')}${C(10, -14, 14, '#5fb85a')}${C(0, -24, 12, '#4fa04a')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 150, y: 254, shirt: '#65a30d', fc: 'sick', rot: -10, armR: [30, -20], armL: [-20, -10] }), { cls: 'up' });
    s.step(3, arrow(250, 200, 300, 200, '#dc2626', 5, 10) + cross(480, 56) + L('M120 150L104 140M190 150L206 140', '#65a30d', 4), { cls: 'pop' });
  }],
  ['defy', '#dc2626', '윗사람의 명령에도 팔짱 끼고 고개를 돌려 정면으로 거역한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 420, y: 254, shirt: '#1f2937', pants: '#1f2937', s: 1.3, fc: 'angry', armL: [-50, -30], hat: tie }), { cls: 'up' });
    s.step(2, person({ x: 150, y: 254, shirt: '#2563eb', fc: 'smirk', armL: [10, -16], armR: [-10, -16] }), { cls: 'up' });
    s.step(3, L('M250 130L220 150M240 160L214 166', '#dc2626', 4) + `<path d="M300 110L282 150H304L290 190L326 140H306Z" fill="#ffd34d"/>` + cross(480, 56), { cls: 'pop' });
  }],
  ['inference', '#0891b2', '발자국이라는 단서를 돋보기로 살펴 범인을 추리해 낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [[110, 240], [160, 230], [210, 240], [260, 230]].map(([x, y]) => E(x, y, 14, 7, '#6b4a2a', 'fill-opacity=".7"')).join(''), { cls: 'pop' });
    s.step(2, magnifier(200, 190, 1.4) + person({ x: 400, y: 254, shirt: '#8b6b4a', fc: 'think', armR: [-30, -20] }), { cls: 'up' });
    s.step(3, bulb(400, 110, 1.2) + sparks(400, 90, 40, 56, '#ffd34d', 8, 3) + person({ x: 300, y: 130, shirt: '#475569', s: 0.5, sh: false, legs: 'hide', fc: 'smirk' }) + arrow(340, 130, 360, 120, '#0891b2', 3, 8), { cls: 'pop' });
  }],
  ['antagonist', '#7f1d1d', '정의의 주인공 앞을 가로막는 검은 망토의 적대자', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, person({ x: 150, y: 254, shirt: '#2563eb', fc: 'cheer', armL: [-20, -30], armR: [30, -4] }) + L('M182 190L210 150', '#aab4c6', 6), { cls: 'up' });
    s.step(2, person({ x: 420, y: 254, shirt: '#111827', pants: '#111827', fc: 'angry', hat: cape, armL: [-30, -20] }), { cls: 'up' });
    s.step(3, `<path d="M280 110L262 150H284L270 192L306 140H286Z" fill="#ffd34d"/>` + sparks(280, 150, 40, 56, '#dc2626', 8, 3), { cls: 'pop' });
  }],
  ['thrust', '#dc2626', '펜싱 선수가 몸을 쭉 뻗어 칼끝을 상대에게 힘껏 내지른다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#fff', pants: '#fff', fc: 'neutral', armR: [30, -4] }) + person({ x: 410, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'neutral', armL: [-30, -4] }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 190, y: 254, shirt: '#fff', pants: '#fff', fc: 'angry', rot: 10, armR: [60, -10] }) + L('M250 200L380 190', '#aab4c6', 4) + person({ x: 410, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'neutral', armL: [-30, -4] }), { e: 2 });
    s.step(3, person({ x: 190, y: 254, shirt: '#fff', pants: '#fff', fc: 'cheer', rot: 10, armR: [60, -10] }) + L('M250 200L396 192', '#aab4c6', 4) + person({ x: 420, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'shock', rot: -8, armL: [-30, -4] }) + sparks(396, 192, 14, 30, '#ffd34d', 8, 4), { });
  }],
  ['creed', '#7c3aed', '굳게 지키는 신조를 적은 석판을 가슴에 새기고 따르는 사람들', (s) => {
    s.sky('warm'); s.ground('stone', 250);
    s.step(1, `<g transform="translate(280 250)">${R(-50, -140, 100, 140, '#cbd5e1', 20, 'stroke="#8a93a5" stroke-width="4"')}${heart(0, -90, 0.9, '#ef4444')}${star(0, -50, 12, '#ffd34d')}${L('M-30 -30H30', '#8a93a5', 4)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 120, y: 262, shirt: '#7c3aed', fc: 'cheer', armR: [-10, -30], s: 0.9 }) + person({ x: 440, y: 262, shirt: '#14b8a6', fc: 'cheer', hs: 'long', armL: [10, -30], s: 0.9 }), { cls: 'up' });
    s.step(3, sparks(280, 140, 90, 106, '#ffd34d', 12, 3) + L('M180 150L200 150M360 150L380 150', '#7c3aed', 4, 'stroke-opacity="0"'), { cls: 'pop' });
  }],
  ['equate', '#0d9488', '서로 다른 두 물건을 저울에 올려 같다고 맞춰 본다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, bread(130, 180, 1.4) + coin(430, 160, 24), { cls: 'up' });
    s.step(2, `<g transform="translate(280 252)">${R(-5, -150, 10, 150, '#8a6a2a')}${R(-60, -6, 120, 8, '#8a6a2a', 3)}${R(-150, -150, 300, 8, '#b88a2a', 4)}${L('M-140 -142L-160 -80M-140 -142L-120 -80M140 -142L120 -80M140 -142L160 -80', '#b88a2a', 2)}${E(-140, -78, 34, 7, '#ffd34d', 'stroke="#b88a2a" stroke-width="2"')}${E(140, -78, 34, 7, '#ffd34d', 'stroke="#b88a2a" stroke-width="2"')}</g>`, { cls: 'up' });
    s.step(3, bread(140, 186, 1) + coin(420, 170, 14) + R(250, 70, 60, 8, '#0d9488', 3) + R(250, 90, 60, 8, '#0d9488', 3) + chk(480, 56), { cls: 'pop' });
  }],
  ['misplace', '#6366f1', '열쇠를 엉뚱한 곳에 넣어 두고 어디 뒀는지 몰라 헤맨다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(60, 80, 14, 14, '#6b7384', 3) + R(54, 60, 26, 6, '#6b7384', 3) + `<g transform="translate(400 252)">${R(-50, -150, 100, 150, '#e5e9f0', 8, 'stroke="#aab4c6" stroke-width="3"')}${L('M-50 -90H50', '#aab4c6', 3)}</g>`, { cls: 'up' });
    s.step(1, key(330, 180, 1.2), { e: 1 });
    s.step(2, person({ x: 150, y: 254, shirt: '#6366f1', fc: 'think', armR: [20, -40] }) + qm(150, 90, '#6366f1', 1.4) + L('M60 120H76', '#6366f1', 4, 'stroke-opacity="0"'), { cls: 'up' });
    s.step(3, key(400, 170, 1.1) + sparks(400, 170, 30, 44, '#ffd34d', 8, 3) + L('M230 130L330 160', '#6366f1', 3, 'stroke-dasharray="5 7"'), { cls: 'pop' });
  }],
  ['auditory', '#0ea5e9', '스피커 소리가 귀로 들어가 뇌에 전달되는 청각', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(60, 150, 70, 100, '#1f2937', 10) + C(95, 190, 24, '#475569') + C(95, 190, 8, '#1f2937') + `<g fill="none" stroke="#0ea5e9" stroke-width="5" stroke-linecap="round"><path d="M150 180Q170 200 150 220"/><path d="M168 160Q206 200 168 240"/></g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(300 180)">${P('M-20 -50Q-50 -40 -48 -6Q-46 24 -22 40Q-4 52 8 36Q-14 30 -12 4Q-10 -22 18 -26Q-2 -52 -20 -50Z', '#ffd7b5', 'stroke="#e8b48c" stroke-width="4"')}${C(-14, 6, 6, '#e8b48c')}</g>`, { cls: 'pop' });
    s.step(3, L('M330 190Q400 190 430 160', '#0ea5e9', 4, 'stroke-dasharray="6 8"') + `<g transform="translate(450 130)">${P('M-50 14Q-70 -30 -30 -50Q-10 -70 24 -54Q70 -40 66 0Q64 36 20 40Q-20 56 -50 14Z', '#f9a8d4', 'stroke="#db2777" stroke-width="3"')}${L('M-26 -20Q0 -30 30 -10M-16 10Q10 0 40 20', '#db2777', 3)}</g>` + sparks(450, 130, 64, 78, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['missionary', '#b45309', '배를 타고 먼 마을로 가 책으로 사람들을 가르치는 전도 활동', (s) => {
    s.sky('day'); s.ground('water', 200);
    s.step(1, `<g transform="translate(130 210)">${P('M-50 0H50L34 22H-34Z', '#8c5a2a')}${R(-2, -60, 4, 60, '#6b4a2a')}${P('M2 -58L34 -8H2Z', '#f4f6fa')}</g>` + person({ x: 130, y: 196, shirt: '#b45309', s: 0.5, sh: false, legs: 'hide' }), { cls: 'up', e: 2 });
    s.mv(2, 'translateX(-200px)', `<g transform="translate(330 210)">${P('M-50 0H50L34 22H-34Z', '#8c5a2a')}</g>`, { d: 1, e: 2 });
    s.step(3, P('M360 250Q420 200 480 250Z', '#e8d6a8') + house(430, 246, 60, '#f3d9b5', '#c0392b', 0.8) + person({ x: 300, y: 262, shirt: '#b45309', fc: 'cheer', armR: [34, 10] }) + book(350, 232, '#ef4444', 30, 24) + person({ x: 470, y: 270, shirt: '#22c55e', s: 0.6, fc: 'cheer' }), { cls: 'up' });
  }],
  ['cosmopolitan', '#2563eb', '지구본을 들고 여러 나라 친구와 어울리는 세계인', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 280, y: 262, shirt: '#2563eb', fc: 'cheer', armL: [-30, -30], armR: [30, -30] }) + C(280, 80, 34, '#2a8fe0', 'stroke="#fff" stroke-width="3"') + P('M262 66C276 58 290 66 292 80C282 92 266 86 262 66Z', '#5fb85a') + L('M246 80H314', '#fff', 2, 'stroke-opacity=".6"'), { cls: 'up' });
    s.step(2, person({ x: 120, y: 262, shirt: '#ef4444', skin: '#e0ac69', hair: '#1f1209', hs: 'curly', fc: 'cheer', armR: [14, -50], s: 0.9 }) + person({ x: 440, y: 262, shirt: '#f59e0b', skin: '#8d5524', hair: '#1f1209', hs: 'curly', fc: 'cheer', armL: [-14, -50], s: 0.9 }), { cls: 'up' });
    s.step(3, person({ x: 200, y: 270, shirt: '#ec4899', skin: '#f1c27d', hs: 'bun', fc: 'cheer', s: 0.75 }) + person({ x: 360, y: 270, shirt: '#14b8a6', fc: 'cheer', s: 0.75 }) + heart(280, 150, 0.8, '#ef4444'), { cls: 'up' });
  }],
  ['embed', '#7c3aed', '반지 홈에 보석을 눌러 박아 단단히 끼워 넣는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 230)">${C(0, 0, 60, 'none', 'stroke="#ffd34d" stroke-width="16"')}${P('M-14 -66H14L10 -56H-10Z', '#d99a00')}</g>`, { cls: 'up' });
    s.mv(2, 'translateY(-110px)', `<g transform="translate(280 166)">${P('M-24 -16L-12 -34H12L24 -16L0 20Z', '#a78bfa', 'stroke="#6d28d9" stroke-width="3" stroke-linejoin="round"')}${L('M-24 -16H24M-12 -34L-6 -16L0 20M12 -34L6 -16', '#fff', 2.4, 'stroke-opacity=".7"')}</g>`, { d: 0.9 });
    s.step(3, sparks(280, 166, 40, 56, '#ffd34d', 8, 4) + chk(480, 56), { cls: 'pop' });
  }],
  ['feat', '#f59e0b', '두 건물 사이 줄 위를 걸어 건너는 놀라운 위업', (s) => {
    s.sky('day'); s.ground('stone', 252);
    s.step(1, building(110, 252, 80, 190, '#9fb4d0') + building(450, 252, 80, 190, '#9fb4d0') + L('M150 70L410 70', '#475569', 4), { cls: 'up' });
    s.mv(2, 'translateX(-150px)', person({ x: 280, y: 70, shirt: '#f59e0b', s: 0.5, legs: 'walk', fc: 'cheer', armL: [-50, 4], armR: [50, 4], sh: false }), { d: 1 });
    s.step(3, [60, 160, 250, 330, 500].map((x, i) => C(x, 286, 12, ['#ffd7b5', '#f0c6a4', '#ffd7b5', '#e0ac69', '#ffd7b5'][i])).join('') + star(410, 40, 12) + sparks(280, 40, 40, 56, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['utensil', '#475569', '식탁에 가지런히 놓인 포크·칼·숟가락 같은 식사 도구', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, table(280, 238, 360) + E(280, 224, 70, 14, '#fff', 'stroke="#d6dbe5" stroke-width="3"'), { cls: 'up' });
    s.step(2, `<g transform="translate(180 226)">${L('M0 0V-50M-10 -50V-34M0 -50V-34M10 -50V-34M-10 -34Q0 -26 10 -34', '#aab4c6', 4)}</g>` + `<g transform="translate(380 226)">${R(-3, -50, 6, 50, '#aab4c6', 2)}${P('M3 -50Q18 -40 8 -16H3Z', '#cbd5e1')}</g>`, { cls: 'up' });
    s.step(3, `<g transform="translate(430 226)">${E(0, -44, 10, 14, '#aab4c6')}${R(-3, -34, 6, 34, '#aab4c6', 2)}</g>` + E(280, 218, 40, 8, '#f59e0b') + sparks(280, 190, 60, 74, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['intrude', '#dc2626', '허락 없이 울타리를 넘어 남의 집 마당에 몰래 들어온다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, house(400, 250, 120, '#f3d9b5', '#c0392b') + [180, 220, 260, 300].map((x) => R(x - 4, 190, 8, 60, '#8c5a2a', 2)).join('') + R(170, 200, 140, 8, '#8c5a2a', 2), { cls: 'up' });
    s.step(2, person({ x: 120, y: 262, shirt: '#111827', fc: 'smirk', legs: 'walk', hat: '<rect x="-14" y="-90" width="28" height="9" fill="#111827"/>' }), { cls: 'up', e: 2 });
    s.mv(2, 'translateX(-120px)', person({ x: 240, y: 190, shirt: '#111827', s: 0.9, fc: 'smirk', legs: 'walk', armL: [-20, -30], sh: false }), { d: 0.8, e: 2 });
    s.step(3, person({ x: 300, y: 262, shirt: '#111827', fc: 'shock', legs: 'walk', rot: -8 }) + person({ x: 480, y: 262, shirt: '#ef4444', fc: 'angry', armL: [-40, -30] }) + cross(500, 50), { cls: 'up' });
  }],
  ['grumble', '#6b7280', '청소를 하며 구시렁구시렁 불평을 늘어놓는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 200, y: 254, shirt: '#6b7280', fc: 'angry', armL: [-30, 24], armR: [-20, 30] }) + `<g transform="translate(160 252) rotate(-10)">${L('M0 0V-100', '#8c6238', 5)}${P('M-16 -4H16L20 12H-20Z', '#e8c25a')}</g>`, { cls: 'up' });
    s.step(2, L('M240 160Q256 150 270 160T300 160T330 160', '#6b7280', 4) + L('M240 176Q256 166 270 176T300 176', '#6b7280', 4), { cls: 'wipe' });
    s.step(3, cloud(200, 60, 1.6, '#4a5568') + L('M180 90L170 110M210 90L206 112M230 86L240 106', '#6b7280', 3), { cls: 'up' });
  }],
  ['scrutiny', '#0891b2', '문서를 돋보기로 샅샅이 훑어 작은 오류까지 찾아내는 정밀 조사', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, paper(200, 150, 180, 200, 8), { cls: 'up' });
    s.step(2, magnifier(260, 130, 1.8), { cls: 'pop' });
    s.step(3, C(300, 150, 22, 'none', 'stroke="#dc2626" stroke-width="5"') + arrow(380, 90, 330, 130, '#dc2626', 4, 10) + chk(480, 56), { cls: 'pop' });
  }],
  ['reckless', '#dc2626', '헬멧도 없이 가파른 내리막을 질주하다 앞뒤 가리지 않고 사고를 낸다', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, P('M60 90L380 230V250H60Z', '#a8774a', 'stroke="#7a461f" stroke-width="3"'), { cls: 'up' });
    s.mv(2, 'translate(-140px,-80px)', person({ x: 300, y: 205, shirt: '#dc2626', fc: 'cheer', rot: -14, s: 0.8, legs: 'walk', armL: [-30, -30], armR: [30, -30] }) + R(266, 205, 60, 8, '#475569', 4), { d: 0.9 });
    s.step(3, L('M120 120L170 140M130 100L180 120', '#dc2626', 4) + star(440, 220, 10) + star(470, 240, 8) + star(410, 250, 7) + person({ x: 430, y: 260, shirt: '#dc2626', fc: 'cry', rot: -70, rotO: '0 0', legs: 'hide', sh: false }) + cross(500, 50), { cls: 'pop' });
  }],
  ['synthetic', '#7c3aed', '실험실 플라스크에서 화학 반응으로 만들어 낸 인공 합성 소재', (s) => {
    s.sky('cool'); s.ground('tile', 252);
    s.step(1, `<g transform="translate(150 252)">${P('M-14 -90H14V-60L44 0H-44L-14 -60Z', '#dff1fc', 'stroke="#8a93a5" stroke-width="3"')}${P('M-34 -14H34L44 0H-44Z', '#a78bfa')}</g>`, { cls: 'up' });
    s.step(2, [[140, 130], [160, 108], [150, 84]].map(([x, y]) => C(x, y, 7, '#fff', 'fill-opacity=".8" stroke="#a78bfa" stroke-width="2"')).join('') + L('M200 190H260', '#7c3aed', 5) + L('M200 200H250', '#a78bfa', 5), { cls: 'pop' });
    s.step(3, `<g transform="translate(400 252)">${R(-14, -80, 28, 80, '#9fd8ff', 12, 'stroke="#38bdf8" stroke-width="3" fill-opacity=".8"')}${R(-8, -92, 16, 14, '#2563eb', 3)}</g>` + P('M440 160L470 140H500L530 160L516 184L506 178V240H464V178L454 184Z', '#c4b5fd', 'stroke="#7c3aed" stroke-width="3"') + chk(300, 70), { cls: 'up' });
  }],
  ['outset', '#16a34a', '출발선에서 신호와 함께 일제히 첫걸음을 내딛는 시작', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, L('M180 250V160', '#fff', 8) + [90, 140].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#ef4444'][i], rot: 24, legs: 'walk', fc: 'angry', armL: [20, 20], armR: [24, 20], s: 0.85 })).join(''), { cls: 'up', e: 2 });
    s.step(2, flag(300, 140, '#22c55e', 70) + `<g transform="translate(320 70)">${P('M0 0L30 -16L26 10Z', '#facc15')}</g>`, { cls: 'pop', e: 2 });
    s.step(3, [220, 300].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#ef4444'][i], legs: 'walk', fc: 'cheer', armL: [-24, 20], armR: [24, 20], s: 0.85 })).join('') + L('M180 250V160', '#fff', 8) + L('M110 210H70M100 236H60', '#16a34a', 4) + sparks(180, 140, 24, 38, '#ffd34d', 8, 3), { });
  }],
  ['peril', '#7f1d1d', '무너지는 절벽 끝에서 비바람까지 몰아치는 위험한 처지', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, P('M0 250V140H300V250Z', '#8a7a68', 'stroke="#5f5242" stroke-width="4"') + person({ x: 270, y: 140, shirt: '#3b82f6', fc: 'shock', s: 0.9, armL: [-20, -20], armR: [20, -20] }), { cls: 'up' });
    s.step(2, P('M300 140H330L310 190H300Z M280 140L300 150L290 180Z', '#8a7a68') + L('M320 190L330 220M300 200L306 232', '#5f5242', 4), { cls: 'pop' });
    s.step(3, L('M80 70H190M60 100H160', '#fff', 5) + cloud(400, 60, 1.6, '#4a5568') + P('M470 110L440 160H500Z', '#facc15', 'stroke="#1f2937" stroke-width="4" stroke-linejoin="round"') + L('M470 124V142M470 150V152', '#1f2937', 5), { cls: 'wipe' });
  }],
  ['liable', '#b91c1c', '유리창을 깬 아이가 변상 책임을 지고 돈을 물어 준다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, house(400, 250, 120, '#f3d9b5', '#c0392b') + person({ x: 130, y: 262, shirt: '#3b82f6', fc: 'cheer', armR: [34, -30] }), { cls: 'up' });
    s.mv(2, 'translateX(-200px)', ball(330, 200, 12, '#ef4444'), { d: 0.5, ease: 'cubic-bezier(.5,0,1,1)', e: 2 });
    s.step(2, L('M376 190L396 214M396 190L376 214M408 200H430', '#ffd34d', 4) + L('M372 188L388 196L380 210L396 222', '#8a93a5', 3), { cls: 'pop' });
    s.step(3, person({ x: 130, y: 262, shirt: '#3b82f6', fc: 'sad', armR: [34, 4] }) + coin(190, 200, 12) + coin(210, 210, 12) + person({ x: 300, y: 262, shirt: '#ef4444', fc: 'angry', armL: [-30, -10] }) + cross(500, 50), { });
  }],
  ['pitfall', '#92400e', '나뭇잎에 가려진 구덩이에 모르고 발을 디뎌 빠지는 함정', (s) => {
    s.sky('green'); s.ground('grass', 246);
    s.step(1, R(180, 244, 200, 12, '#9a6a3a', 3) + [[200, 240], [240, 244], [300, 240], [340, 244]].map(([x, y]) => P(`M${x} ${y}c10 -10 22 -4 20 6c-10 2 -16 0 -20 -6Z`, '#d97706')).join(''), { cls: 'up' });
    s.step(2, person({ x: 150, y: 260, shirt: '#92400e', legs: 'walk', fc: 'neutral' }) + L('M200 270H240', '#92400e', 3, 'stroke-opacity="0"'), { cls: 'up', e: 2 });
    s.step(3, R(230, 244, 100, 56, '#3a2810', 4) + person({ x: 280, y: 280, shirt: '#92400e', fc: 'cry', s: 0.7, legs: 'hide', armL: [-20, -30], armR: [20, -30], sh: false }) + star(260, 220, 8) + star(310, 214, 8) + cross(500, 50), { cls: 'pop' });
  }],
  ['uncover', '#7c3aed', '덮개를 걷어 올리자 감춰져 있던 보석이 드러난다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, R(200, 230, 160, 22, '#7a461f', 4) + P('M210 230Q220 160 280 150Q340 160 350 230Z', '#7c3aed', 'stroke="#4c1d95" stroke-width="3"'), { cls: 'up', e: 2 });
    s.step(2, P('M210 230Q220 160 280 150Q340 160 350 230Z', '#7c3aed', 'stroke="#4c1d95" stroke-width="3"') + `<g transform="translate(400 140) rotate(30)">${R(-14, -4, 60, 24, '#ffd7b5', 10, 'stroke="#e8b48c" stroke-width="2"')}</g>`, { e: 2 });
    s.step(3, `<g transform="translate(280 220)">${P('M-26 -16L-14 -34H14L26 -16L0 20Z', '#7dd3fc', 'stroke="#0284c7" stroke-width="3" stroke-linejoin="round"')}</g>` + P('M430 120Q470 130 480 200L440 190Z', '#7c3aed') + sparks(280, 210, 50, 68, '#ffd34d', 10, 4), { cls: 'pop' });
  }],
  ['limb', '#92400e', '나무의 굵은 큰 가지에 앉아 팔다리를 늘어뜨린 모습', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, tree(260, 252, 1.6), { cls: 'up' });
    s.step(2, L('M280 160Q360 140 440 150', '#6b4a2a', 14) + P('M420 130C460 110 500 130 490 160C460 168 440 156 420 130Z', '#4fa04a'), { cls: 'wipe' });
    s.step(3, person({ x: 380, y: 150, shirt: '#16a34a', s: 0.5, legs: 'walk', fc: 'cheer', armL: [-30, 10], armR: [30, 10], sh: false }) + star(430, 70, 10), { cls: 'up' });
  }],
  ['setback', '#6b7280', '앞으로 나아가다 벽에 막혀 뒤로 밀려나는 차질', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(70, 150, 380, 14, '#cbd5e1', 7) + R(70, 150, 120, 14, '#16a34a', 7) + person({ x: 130, y: 244, shirt: '#16a34a', s: 0.7, legs: 'walk', fc: 'cheer' }), { cls: 'up', e: 1 });
    s.step(2, R(70, 150, 380, 14, '#cbd5e1', 7) + R(70, 150, 280, 14, '#16a34a', 7) + R(380, 90, 36, 160, '#6b7384', 4) + person({ x: 320, y: 244, shirt: '#16a34a', s: 0.7, legs: 'walk', fc: 'shock', rot: -10 }), { e: 2 });
    s.step(3, R(70, 150, 380, 14, '#cbd5e1', 7) + R(70, 150, 150, 14, '#16a34a', 7) + R(380, 90, 36, 160, '#6b7384', 4) + person({ x: 220, y: 244, shirt: '#16a34a', s: 0.7, fc: 'sad', rot: 8 }) + arrow(300, 100, 220, 100, '#dc2626', 6, 14), { });
  }],
  ['prudent', '#16a34a', '건너기 전에 좌우를 꼼꼼히 살피고 횡단보도로 안전하게 건너는 신중함', (s) => {
    s.sky('day'); s.ground('road', 240);
    s.step(1, R(60, 240, 440, 40, '#5b6575') + [120, 170, 220, 270, 320, 370, 420].map((x) => R(x, 244, 30, 30, '#fff', 2)).join('') + person({ x: 100, y: 240, shirt: '#16a34a', s: 0.9, fc: 'think' }), { cls: 'up' });
    s.step(2, L('M70 160L40 160M130 160L160 160', '#16a34a', 4) + car(420, 262, '#3b82f6', 0.8), { cls: 'pop' });
    s.step(3, person({ x: 300, y: 262, shirt: '#16a34a', s: 0.9, legs: 'walk', fc: 'cheer' }) + chk(500, 50), { cls: 'up' });
  }],
  ['grudge', '#7f1d1d', '오랜 세월이 지나도 마음속 원한을 풀지 못하고 노려본다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#7f1d1d', fc: 'angry', armL: [10, -16], armR: [-10, -16] }) + person({ x: 430, y: 254, shirt: '#3b82f6', fc: 'smile' }) + drop(150, 150, 0.6, '#7c4a2a'), { cls: 'up' });
    s.step(2, `<g transform="translate(280 100)">${R(-46, -40, 92, 80, '#fff', 8, 'stroke="#aab4c6" stroke-width="3"')}${R(-46, -40, 92, 20, '#ef4444', 8)}${L('M-26 0H26M-26 16H20', '#aab4c6', 4)}</g>` + L('M340 70Q360 40 390 60', '#aab4c6', 3, 'stroke-dasharray="4 6"'), { cls: 'pop' });
    s.step(3, cloud(150, 60, 1.6, '#4a5568') + L('M180 150L370 150', '#7f1d1d', 3, 'stroke-dasharray="6 8"') + L('M230 100L238 114M260 100L258 116', '#dc2626', 3), { cls: 'up' });
  }],
  ['transcend', '#f59e0b', '한계선을 뛰어넘어 구름 위 하늘까지 솟아오르는 초월', (s) => {
    s.sky('day'); s.ground('grass', 252);
    s.step(1, L('M60 130H500', '#ef4444', 5, 'stroke-dasharray="12 8"'), { cls: 'up', e: 2 });
    s.step(1, person({ x: 280, y: 262, shirt: '#f59e0b', fc: 'smile' }), { cls: 'up', e: 1 });
    s.step(2, cloud(120, 130, 1.4) + cloud(440, 120, 1.6) + person({ x: 280, y: 190, shirt: '#f59e0b', fc: 'cheer', armL: [-26, -46], armR: [26, -46], sh: false }), { e: 2 });
    s.step(3, person({ x: 280, y: 118, shirt: '#f59e0b', fc: 'cheer', armL: [-26, -46], armR: [26, -46], sh: false }) + sparks(280, 58, 54, 68, '#ffd34d', 12, 4) + star(140, 60, 10) + star(420, 50, 10) + L('M60 130H500', '#ef4444', 5, 'stroke-dasharray="12 8"') + arrow(500, 260, 500, 170, '#f59e0b', 6, 14), { });
  }],
  ['subsidy', '#0d9488', '정부 건물에서 농부에게 지원금 자루를 보내 작물을 키우게 돕는다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(110 250)">${R(-60, -80, 120, 80, '#e8e4d8', 3)}${P('M-72 -80L0 -122L72 -80Z', '#cbbf9c')}${[-36, -12, 12, 36].map((x) => R(x - 5, -74, 10, 66, '#f4f1e6', 2)).join('')}${flag(0, -122, '#0d9488', 36)}</g>`, { cls: 'up' });
    s.mv(2, 'translateX(-160px)', bag(300, 210, 1.3, '#d9772e') + coin(330, 200, 12), { d: 0.9 });
    s.step(3, person({ x: 440, y: 262, shirt: '#16a34a', fc: 'cheer', armL: [-30, -10] }) + [[380, 262], [500, 264]].map(([x, y]) => L(`M${x} ${y}V${y - 26}`, '#3f8f3a', 4) + P(`M${x} ${y - 20}C${x - 14} ${y - 34} ${x - 24} ${y - 22} ${x - 14} ${y - 14}Z M${x} ${y - 26}C${x + 14} ${y - 40} ${x + 24} ${y - 28} ${x + 14} ${y - 20}Z`, '#5fb85a')).join('') + chk(500, 50), { cls: 'up' });
  }],
  ['prosper', '#16a34a', '작은 가게가 점점 커져 높은 건물과 동전이 넘치는 번영', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, `<g transform="translate(110 250)">${R(-40, -50, 80, 50, '#e8d0b0', 3)}${P('M-48 -50L-30 -70H30L48 -50Z', '#ef4444')}${R(-12, -30, 24, 30, '#8c5a2a', 2)}</g>`, { cls: 'up' });
    s.step(2, building(250, 250, 70, 120, '#9fb4d0'), { cls: 'up' });
    s.step(3, building(400, 250, 80, 190, '#8fa6c4') + coin(150, 120, 16) + coin(200, 90, 16) + coin(480, 100, 16) + sun(500, 50, 22, '#fff3a8') + arrow(110, 150, 110, 100, '#16a34a', 5, 12), { cls: 'up' });
  }],
  ['veterinarian', '#0891b2', '청진기로 아픈 강아지를 살펴 고쳐 주는 동물 의사', (s) => {
    s.sky('mint'); s.ground('tile', 252);
    s.step(1, R(180, 190, 200, 14, '#cbd5e1', 5) + R(200, 204, 10, 48, '#94a3b8') + R(350, 204, 10, 48, '#94a3b8') + dog(280, 190, 1.8, '#b9772e'), { cls: 'up' });
    s.step(2, person({ x: 450, y: 254, shirt: '#fff', pants: '#334155', fc: 'smile', armL: [-60, -20] }) + `<g transform="translate(360 196)">${L('M0 0Q-20 -20 0 -30M0 0Q20 -20 0 -30', '#475569', 3)}${C(0, 4, 8, '#aab4c6', 'stroke="#475569" stroke-width="3"')}</g>`, { cls: 'up' });
    s.step(3, heart(260, 90, 1.2, '#ef4444') + sparks(260, 100, 40, 54, '#ffd34d', 8, 3) + chk(480, 50), { cls: 'pop' });
  }],
  ['cumulative', '#ca8a04', '동전이 차곡차곡 한 개씩 더해져 점점 높은 탑이 된다', (s) => {
    s.sky('sun'); s.ground('floor', 252);
    s.step(1, coin(120, 236, 18), { cls: 'pop' });
    s.step(2, coinStack(250, 252, 4) + L('M160 220H200M180 200V240', '#ca8a04', 4), { cls: 'up' });
    s.step(3, coinStack(400, 252, 10) + L('M310 200H350M330 180V220', '#ca8a04', 4) + arrow(480, 220, 480, 100, '#ca8a04', 6, 14), { cls: 'up' });
  }],
  ['discrete', '#7c3aed', '서로 붙지 않고 뚝뚝 떨어져 따로따로 구분된 낱개', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, [[120, 150, '#ef4444'], [200, 150, '#3b82f6'], [160, 190, '#22c55e']].map(([x, y, c]) => C(x, y, 34, c, 'fill-opacity=".85"')).join(''), { cls: 'pop', e: 2 });
    s.step(2, arrow(250, 160, 320, 160, '#7c3aed', 5, 12), { cls: 'wipe', e: 2 });
    s.step(3, [[100, 150, '#ef4444'], [260, 150, '#3b82f6'], [420, 150, '#22c55e'], [180, 230, '#f59e0b'], [340, 230, '#8b5cf6']].map(([x, y, c]) => C(x, y, 30, c) + C(x, y, 44, 'none', 'stroke="#aab4c6" stroke-width="2" stroke-dasharray="4 6"')).join(''), { cls: 'pop' });
  }],
  ['fluctuation', '#0ea5e9', '그래프 선이 오르락내리락 출렁이는 변동', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(60, 60, 440, 170, '#fff', 8, 'stroke="#b9c1cf" stroke-width="3"') + L('M80 200L140 120', '#0ea5e9', 6), { cls: 'up' });
    s.step(2, L('M140 120L200 190L260 110', '#0ea5e9', 6), { cls: 'wipe' });
    s.step(3, L('M260 110L320 200L380 100L440 180', '#0ea5e9', 6) + [[140, 120], [200, 190], [260, 110], [320, 200], [380, 100]].map(([x, y]) => C(x, y, 6, '#ef4444')).join('') + arrow(470, 120, 470, 80, '#16a34a', 4, 10) + arrow(470, 150, 470, 190, '#dc2626', 4, 10), { cls: 'wipe' });
  }],
];
