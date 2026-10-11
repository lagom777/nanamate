import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;
const dino = (x, y, k = 1, col = '#65a30d') => `<g transform="translate(${x} ${y}) scale(${k})">${E(0, -60, 70, 34, col)}${P('M50 -70Q86 -110 92 -150Q100 -158 112 -152Q116 -140 100 -126Q96 -90 66 -52Z', col)}${C(108, -148, 3, '#fff')}${C(109, -148, 1.4, '#111')}${P('M-66 -64Q-120 -60 -150 -30Q-110 -50 -60 -40Z', col)}${R(-34, -34, 18, 36, col, 6)}${R(20, -34, 18, 36, col, 6)}${[-30, -10, 10, 30].map((x2) => P(`M${x2 - 6} -92L${x2} -106L${x2 + 6} -92Z`, '#4d7c0f')).join('')}</g>`;
const mach = (x, y) => `<g transform="translate(${x} ${y})">${R(-50, -150, 100, 150, '#ef4444', 8, 'stroke="#991b1b" stroke-width="3"')}${R(-38, -136, 76, 70, '#cfeaff', 4)}${[-22, 0, 22].map((x2) => R(x2 - 8, -128, 16, 30, ['#22c55e', '#f59e0b', '#3b82f6'][Math.round((x2 + 22) / 22)], 3)).join('')}${R(-30, -50, 60, 20, '#475569', 3)}${R(-20, -20, 40, 20, '#1f2937', 3)}</g>`;
const duck = (x, y, k = 1, col = '#fde047') => `<g transform="translate(${x} ${y}) scale(${k})">${E(0, 0, 24, 14, col, 'stroke="#d99a00" stroke-width="2"')}${C(22, -14, 11, col, 'stroke="#d99a00" stroke-width="2"')}${P('M32 -14L44 -10L32 -6Z', '#f97316')}${C(25, -17, 2, '#111')}</g>`;

export default [
  ['bulk', '#a16207', '사람보다 훨씬 큰 짐 더미가 쌓여 부피가 엄청나다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 110, y: 254, shirt: '#a16207', fc: 'smile', s: 0.8 }), { cls: 'up' });
    s.step(2, box(300, 252, 120, 80, '#c99a5b') + box(300, 172, 100, 70, '#d6a86a'), { cls: 'up' });
    s.step(3, box(300, 102, 80, 60, '#b98650') + box(420, 252, 100, 70, '#c99a5b') + box(420, 182, 80, 60, '#d6a86a') + arrow(180, 120, 180, 60, '#a16207', 5, 12) + L('M250 90H350', '#a16207', 3, 'stroke-opacity="0"'), { cls: 'up' });
  }],
  ['despise', '#7f1d1d', '코를 치켜들고 상대를 깔보며 얕잡아 본다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#7f1d1d', fc: 'smirk', s: 1.1 }) + person({ x: 420, y: 254, shirt: '#6b7280', fc: 'neutral', s: 0.9 }), { cls: 'up' });
    s.step(2, L('M180 150Q260 130 330 170', '#7f1d1d', 3, 'stroke-dasharray="5 7"') + L('M130 110L116 100M170 108L184 96', '#7f1d1d', 3), { cls: 'wipe' });
    s.step(3, person({ x: 420, y: 254, shirt: '#6b7280', fc: 'sad', s: 0.75, rot: 6 }) + arrow(450, 90, 450, 150, '#7f1d1d', 5, 12) + drop(404, 170, 0.6), { });
  }],
  ['flee', '#dc2626', '번지는 불길을 피해 다급히 도망친다', (s) => {
    s.sky('dusk'); s.ground('grass', 246);
    s.step(1, flame(70, 256, 1.5) + flame(120, 260, 1.9) + flame(40, 258, 1.2), { cls: 'up' });
    s.mv(2, 'translateX(-200px)', person({ x: 400, y: 262, shirt: '#3b82f6', fc: 'shock', legs: 'walk', rot: -10, armL: [-24, 20], armR: [24, 20] }), { d: 1.1, ease: 'cubic-bezier(.3,0,.8,1)' });
    s.step(3, L('M240 170H330M230 200H320M240 230H330', '#dc2626', 5) + flame(200, 258, 1.8) + flame(240, 262, 1.4), { cls: 'wipe' });
  }],
  ['prehistoric', '#65a30d', '화산 곁에서 공룡이 거닐고 원시인이 발자국을 남기는 선사 시대', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, P('M300 250L400 120L500 250Z', '#7a5230') + P('M390 120L400 100L410 120Z', '#ef4444') + C(400, 80, 18, '#6b7280', 'fill-opacity=".7"') + C(420, 60, 14, '#6b7280', 'fill-opacity=".6"'), { cls: 'up' });
    s.step(2, dino(170, 252, 0.9), { cls: 'up' });
    s.step(3, person({ x: 300, y: 262, shirt: '#b45309', pants: '#b45309', hs: 'curly', s: 0.6, fc: 'shock', legs: 'walk' }) + [[260, 266], [340, 270]].map(([x, y]) => E(x, y, 14, 6, '#7a5a2e', 'fill-opacity=".6"')).join(''), { cls: 'up' });
  }],
  ['predecessor', '#475569', '앞선 주자가 다음 주자에게 바통을 넘겨주고 물러난다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 150, y: 262, shirt: '#3b82f6', legs: 'walk', fc: 'cheer', armR: [30, -10] }) + R(172, 196, 30, 6, '#facc15', 3), { cls: 'up', e: 1 });
    s.step(2, person({ x: 230, y: 262, shirt: '#3b82f6', legs: 'walk', armR: [30, -10] }) + person({ x: 300, y: 262, shirt: '#ef4444', legs: 'walk', armL: [-30, -10] }) + R(250, 196, 40, 6, '#facc15', 3), { e: 2 });
    s.step(3, person({ x: 250, y: 262, shirt: '#3b82f6', fc: 'smile' }) + person({ x: 400, y: 262, shirt: '#ef4444', legs: 'walk', fc: 'cheer', armR: [30, -10] }) + R(422, 196, 30, 6, '#facc15', 3) + L('M330 200H380M320 230H370', '#ef4444', 4), { });
  }],
  ['alienate', '#6b7280', '무리가 등을 돌려 한 사람만 홀로 따돌려 멀어지게 한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 120, y: 254, shirt: '#3b82f6', fc: 'cheer', armR: [20, -10] }) + person({ x: 200, y: 254, shirt: '#22c55e', hs: 'long', fc: 'cheer', armL: [-20, -10] }) + person({ x: 280, y: 254, shirt: '#f59e0b', fc: 'cheer' }), { cls: 'up' });
    s.step(2, person({ x: 450, y: 254, shirt: '#6b7280', fc: 'sad', armL: [-6, 28], armR: [6, 28] }), { cls: 'up' });
    s.step(3, C(450, 190, 70, 'none', 'stroke="#6b7280" stroke-width="4" stroke-dasharray="8 8"') + L('M330 150L350 150M330 180L350 180', '#6b7280', 4) + cross(300, 70), { cls: 'pop' });
  }],
  ['subordinate', '#475569', '높은 단 위 상사 아래에서 허리 숙여 따르는 부하', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(300, 190, 200, 62, '#cbd5e1', 4) + person({ x: 400, y: 190, shirt: '#1f2937', pants: '#1f2937', hat: tie, fc: 'smirk', armL: [-30, 10], s: 1.1 }), { cls: 'up' });
    s.step(2, person({ x: 160, y: 254, shirt: '#6b7280', fc: 'neutral', rot: 12, armL: [4, 24], armR: [-4, 24] }), { cls: 'up' });
    s.step(3, arrow(300, 90, 220, 140, '#475569', 6, 14) + L('M240 80H360', '#475569', 3, 'stroke-opacity="0"'), { cls: 'wipe' });
  }],
  ['furnish', '#0d9488', '텅 빈 방에 소파와 탁자, 조명을 들여 가구를 갖춘다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(60, 40, 440, 200, '#fff8e8', 8, 'stroke="#d9c58a" stroke-width="3"') + R(380, 80, 70, 70, '#cfeaff', 4, 'stroke="#fff" stroke-width="5"'), { cls: 'up' });
    s.mv(2, 'translateX(-150px)', `<g transform="translate(220 252)">${R(-80, -50, 160, 50, '#0d9488', 14)}${R(-80, -80, 160, 36, '#14b8a6', 14)}${R(-92, -60, 24, 60, '#0f766e', 10)}${R(68, -60, 24, 60, '#0f766e', 10)}</g>`, { d: 0.9 });
    s.step(3, table(400, 236, 120) + lampL(470, 236) + `<g transform="translate(110 252)">${R(-14, -30, 28, 30, '#c99a5b', 4)}${L('M0 -30V-60', '#3f8f3a', 5)}${P('M0 -50C-14 -62 -26 -52 -16 -42Z M0 -56C14 -68 26 -58 16 -48Z', '#5fb85a')}</g>` + sparks(280, 120, 90, 104, '#ffd34d', 8, 3), { cls: 'up' });
  }],
  ['fume', '#dc2626', '씩씩대며 발을 구르고 머리에서 김이 푹푹 나는 화난 모습', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#dc2626', fc: 'angry', skin: '#ff9a86', armL: [-14, 24], armR: [14, 24] }), { cls: 'up' });
    s.step(2, `<g fill="none" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"><path class="a-rise" d="M252 160Q240 140 252 120"/><path class="a-rise" style="animation-delay:-1s" d="M308 160Q320 140 308 120"/><path class="a-rise" style="animation-delay:-2s" d="M280 150Q268 130 280 110"/></g>`, {});
    s.step(3, L('M240 270L224 280M320 270L336 280M230 262L212 262M330 262L348 262', '#dc2626', 4) + sparks(280, 170, 40, 56, '#ef4444', 8, 3), { cls: 'pop' });
  }],
  ['staple', '#d97706', '매일 식탁에 오르는 밥이 주식이다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, table(280, 240, 340), { cls: 'up' });
    s.step(2, `<g transform="translate(280 232)">${P('M-44 0Q-44 -34 0 -34Q44 -34 44 0Z', '#fff', 'stroke="#d6dbe5" stroke-width="3"')}${P('M-40 -10Q0 -64 40 -10Z', '#f8f4e8')}</g>` + `<g transform="translate(170 232)">${E(0, 0, 26, 8, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${E(0, -6, 16, 8, '#ef4444')}</g>` + `<g transform="translate(390 232)">${E(0, 0, 26, 8, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${E(0, -6, 16, 8, '#22c55e')}</g>`, { cls: 'pop' });
    s.step(3, sun(110, 80, 24, '#ffd34d') + moon(450, 80, 20, '#f7c98f') + L('M150 60Q280 20 410 60', '#d97706', 4, 'stroke-dasharray="5 8"') + arrow(400, 52, 420, 70, '#d97706', 4, 10), { cls: 'pop' });
  }],
  ['dispersal', '#16a34a', '바람에 민들레 씨앗이 사방으로 흩어져 퍼진다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(130 252)">${L('M0 0V-90', '#3f8f3a', 5)}${[...Array(10)].map((_, i) => { const a = (i / 10) * 6.283; return L(`M0 -100L${Math.cos(a) * 26} ${-100 + Math.sin(a) * 26}`, '#e5e9f0', 2) + C(Math.cos(a) * 28, -100 + Math.sin(a) * 28, 4, '#fff', 'stroke="#cbd5e1" stroke-width="1"'); }).join('')}${C(0, -100, 5, '#aab4c6')}</g>`, { cls: 'up' });
    s.step(2, L('M20 120H100M10 150H90', '#fff', 5, 'stroke-opacity=".8"') + [[200, 100], [250, 70], [300, 120], [340, 90]].map(([x, y]) => L(`M${x} ${y}L${x + 14} ${y - 8}`, '#e5e9f0', 2) + C(x + 16, y - 9, 4, '#fff', 'stroke="#cbd5e1" stroke-width="1"')).join(''), { cls: 'wipe' });
    s.step(3, [[330, 190], [400, 160], [450, 120], [480, 210], [380, 240]].map(([x, y]) => L(`M${x} ${y}L${x + 12} ${y - 7}`, '#e5e9f0', 2) + C(x + 14, y - 8, 4, '#fff', 'stroke="#cbd5e1" stroke-width="1"')).join('') + [[420, 252], [500, 254]].map(([x, y]) => L(`M${x} ${y}V${y - 16}`, '#3f8f3a', 3) + C(x, y - 20, 5, '#facc15')).join(''), { cls: 'pop' });
  }],
  ['eloquent', '#7c3aed', '막힘없이 쏟아지는 유창한 말솜씨에 청중이 빠져든다', (s) => {
    s.sky('wall'); s.ground('carpet', 252);
    s.step(1, R(120, 190, 100, 62, '#7a461f', 4) + person({ x: 170, y: 190, shirt: '#7c3aed', fc: 'cheer', legs: 'hide', armR: [34, -30], armL: [-30, -20], sh: false }), { cls: 'up' });
    s.step(2, L('M230 120Q260 90 290 120T350 120T410 120', '#7c3aed', 6) + L('M230 144Q260 114 290 144T350 144T410 144', '#a78bfa', 5) + L('M230 168Q260 138 290 168T350 168', '#c4b5fd', 4), { cls: 'wipe' });
    s.step(3, [330, 410, 490].map((x, i) => person({ x, y: 272, shirt: ['#3b82f6', '#22c55e', '#f59e0b'][i], s: 0.7, fc: 'cheer', armR: [14, -40] })).join('') + heart(410, 70, 0.8, '#ef4444'), { cls: 'up' });
  }],
  ['innermost', '#dc2626', '겹겹의 껍질 한가운데 가장 깊숙이 간직한 마음', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, C(280, 150, 110, '#bfdbfe', 'stroke="#2563eb" stroke-width="5"'), { cls: 'pop' });
    s.step(2, C(280, 150, 78, '#93c5fd', 'stroke="#2563eb" stroke-width="5"') + C(280, 150, 48, '#60a5fa', 'stroke="#2563eb" stroke-width="5"'), { cls: 'pop' });
    s.step(3, heart(280, 150, 1.6, '#ef4444') + sparks(280, 150, 62, 76, '#ffd34d', 10, 3), { cls: 'pop' });
  }],
  ['hazardous', '#f59e0b', '독성 통에서 새는 물질 때문에 방호복 입고 조심해야 하는 위험한 곳', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, `<g transform="translate(150 252)">${R(-34, -80, 68, 80, '#65a30d', 8, 'stroke="#365314" stroke-width="3"')}${R(-34, -56, 68, 6, '#365314')}${P('M0 -48L10 -30H-10Z', '#facc15')}</g>` + P('M120 252Q150 262 190 252Z', '#a3e635'), { cls: 'up' });
    s.step(2, L('M60 130H320', '#facc15', 10) + L('M60 130H320', '#1f2937', 10, 'stroke-dasharray="14 14"'), { cls: 'wipe' });
    s.step(3, person({ x: 410, y: 254, shirt: '#facc15', pants: '#facc15', fc: 'neutral', hat: '<rect x="-20" y="-98" width="40" height="30" rx="14" fill="#facc15" stroke="#d99a00" stroke-width="2"/><rect x="-12" y="-90" width="24" height="14" rx="5" fill="#9fd8ff"/>' }) + P('M470 110L440 160H500Z', '#facc15', 'stroke="#1f2937" stroke-width="4" stroke-linejoin="round"') + L('M470 124V142M470 150V152', '#1f2937', 5), { cls: 'up' });
  }],
  ['detergent', '#0ea5e9', '세제를 풀어 거품을 내자 얼룩진 옷이 하얗게 깨끗해진다', (s) => {
    s.sky('cool'); s.ground('tile', 252);
    s.step(1, P('M110 120L150 100H190L230 120L210 150L196 140V220H144V140L130 150Z', '#fff', 'stroke="#aab4c6" stroke-width="3"') + C(160, 160, 8, '#a16207') + C(184, 190, 7, '#dc2626'), { cls: 'up', e: 2 });
    s.step(2, bottle(330, 150, 1.6, '#38bdf8') + [[300, 210], [330, 200], [360, 214], [320, 232], [350, 236], [380, 224]].map(([x, y]) => C(x, y, 12, '#fff', 'stroke="#9fd8ff" stroke-width="3"')).join(''), { cls: 'pop' });
    s.step(3, P('M110 120L150 100H190L230 120L210 150L196 140V220H144V140L130 150Z', '#fff', 'stroke="#aab4c6" stroke-width="3"') + sparks(170, 160, 50, 64, '#ffd34d', 8, 3) + chk(480, 56), { cls: 'pop' });
  }],
  ['rash', '#dc2626', '피부에 붉은 발진이 번져 가려워 긁게 된다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, R(120, 150, 300, 56, '#ffd7b5', 28, 'stroke="#e8b48c" stroke-width="3"') + R(400, 140, 70, 76, '#ffd7b5', 26, 'stroke="#e8b48c" stroke-width="3"'), { cls: 'up' });
    s.step(2, [[180, 170], [220, 190], [260, 168], [300, 188], [340, 172], [250, 150], [200, 150]].map(([x, y]) => C(x, y, 7, '#dc2626', 'fill-opacity=".85"')).join(''), { cls: 'pop' });
    s.step(3, L('M230 110L260 130M250 100L280 120M270 94L296 112', '#ef4444', 4) + R(250, 106, 56, 22, '#ffd7b5', 10, 'stroke="#e8b48c" stroke-width="2" transform="rotate(30 278 117)"') + drop(240, 90, 0.7), { cls: 'pop' });
  }],
  ['bypass', '#0891b2', '막힌 마을 길을 피해 바깥으로 둘러 가는 우회로', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, house(280, 220, 90, '#f3d9b5', '#c0392b', 1.0) + L('M40 220H520', '#8a93a5', 20) + L('M40 220H520', '#fff', 3, 'stroke-dasharray="14 12"') + R(260, 200, 40, 40, '#ef4444', 4, 'fill-opacity="0"'), { cls: 'up' });
    s.step(2, L('M180 220Q280 60 380 220', '#8a93a5', 20) + L('M180 220Q280 60 380 220', '#fff', 3, 'stroke-dasharray="14 12"') + P('M240 196L280 176L320 196Z', '#ef4444', 'fill-opacity="0"'), { cls: 'wipe' });
    s.step(3, car(280, 130, '#3b82f6', 0.7) + R(262, 204, 36, 32, '#ef4444', 4) + L('M268 212L292 232M292 212L268 232', '#fff', 4), { cls: 'up' });
  }],
  ['dispense', '#0d9488', '동전을 넣자 자판기가 음료를 내어 준다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, mach(300, 252), { cls: 'up' });
    s.mv(2, 'translate(-120px,-40px)', coin(260, 140, 12), { d: 0.8 });
    s.step(3, `<g transform="translate(300 252)">${R(-14, -44, 28, 34, '#38bdf8', 6, 'stroke="#0369a1" stroke-width="2"')}</g>` + arrow(300, 160, 300, 200, '#0d9488', 5, 12) + person({ x: 120, y: 254, shirt: '#0d9488', fc: 'cheer', armR: [44, 6] }) + chk(480, 56), { cls: 'pop' });
  }],
  ['tact', '#ec4899', '날카로운 말을 부드럽게 감싸 상대가 상처받지 않게 전하는 재치', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#ec4899', hs: 'long', fc: 'think' }) + P('M200 110L224 90L222 114L250 108L232 126L256 140L226 140L228 166L206 144L190 158L196 134L170 124L196 120Z', '#fecaca', 'stroke="#dc2626" stroke-width="3"'), { cls: 'up', e: 2 });
    s.step(2, E(230, 120, 56, 36, '#fff', 'stroke="#f9a8d4" stroke-width="4"') + heart(230, 120, 0.9, '#ec4899'), { cls: 'pop' });
    s.step(3, person({ x: 430, y: 254, shirt: '#3b82f6', fc: 'cheer' }) + arrow(300, 124, 380, 150, '#ec4899', 4, 10) + heart(430, 120, 0.8, '#ef4444'), { cls: 'up' });
  }],
  ['monotonous', '#6b7280', '똑같은 상자가 끝없이 지나가는 단조롭고 지루한 반복', (s) => {
    s.sky('gray'); s.ground('floor', 252);
    s.step(1, R(40, 190, 480, 20, '#6b7384', 6) + L('M40 200H520', '#475569', 3, 'stroke-dasharray="14 12"'), { cls: 'wipe' });
    s.step(2, [80, 170, 260, 350, 440].map((x) => R(x, 150, 54, 40, '#9ca3af', 4, 'stroke="#6b7280" stroke-width="2"')).join(''), { cls: 'pop' });
    s.step(3, person({ x: 280, y: 254, shirt: '#6b7280', fc: 'yawn', armL: [-30, -20], armR: [30, -20] }) + L('M230 80H330', '#6b7280', 4) + clock(440, 80, 24, 1, 3), { cls: 'up' });
  }],
  ['eligible', '#16a34a', '자격증을 내밀어 심사를 통과하고 문이 열린다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, door(430, 252, 80, 130, '#7a461f') + R(344, 120, 6, 132, '#6b7384') + R(344, 120, 70, 10, '#ef4444', 3), { cls: 'up', e: 2 });
    s.step(1, person({ x: 150, y: 254, shirt: '#16a34a', armR: [40, -4] }), { cls: 'up' });
    s.step(2, R(210, 170, 56, 38, '#fff', 4, 'stroke="#aab4c6" stroke-width="2"') + C(228, 188, 8, '#16a34a') + L('M244 182H258M244 196H258', '#aab4c6', 3), { cls: 'pop' });
    s.step(3, `<path d="M390 252V122L430 110V252Z" fill="#ffe9a0" fill-opacity=".8"/>` + door(470, 252, 40, 120, '#7a461f') + chk(480, 56), { });
  }],
  ['hierarchy', '#7c3aed', '맨 아래 많은 사람부터 꼭대기 한 사람까지 층층이 쌓인 위계', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, P('M80 250H480L430 200H130Z', '#c4b5fd', 'stroke="#7c3aed" stroke-width="3"') + [150, 220, 290, 360, 420].map((x) => person({ x, y: 246, shirt: '#8b5cf6', s: 0.4, sh: false, legs: 'hide' })).join(''), { cls: 'up' });
    s.step(2, P('M130 200H430L380 150H180Z', '#a78bfa', 'stroke="#7c3aed" stroke-width="3"') + [210, 280, 350].map((x) => person({ x, y: 196, shirt: '#7c3aed', s: 0.4, sh: false, legs: 'hide' })).join(''), { cls: 'up' });
    s.step(3, P('M180 150H380L280 60Z', '#7c3aed', 'stroke="#5b21b6" stroke-width="3"') + crown(280, 104, 0.9) + sparks(280, 100, 60, 74, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['enact', '#b91c1c', '의회가 법안에 도장을 찍어 법으로 제정한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, paper(190, 150, 120, 150, 5), { cls: 'up' });
    s.mv(2, 'translateY(-90px)', stamp(190, 130, 1.2), { d: 0.5, ease: 'cubic-bezier(.6,0,.9,1)' });
    s.step(2, C(190, 170, 20, '#dc2626', 'fill-opacity=".85"'), { cls: 'pop', dl: 0.5 });
    s.step(3, person({ x: 360, y: 254, shirt: '#1f2937', fc: 'cheer', armR: [24, -50] }) + person({ x: 450, y: 254, shirt: '#b91c1c', hs: 'long', fc: 'cheer', armL: [-24, -50] }) + flag(110, 100, '#b91c1c', 40) + chk(500, 56), { cls: 'up' });
  }],
  ['legitimate', '#16a34a', '공식 도장이 찍힌 증서로 합법임을 인정받는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(150, 80, 260, 160, '#fff8e8', 6, 'stroke="#a89260" stroke-width="4"') + L('M180 120H380M180 144H360M180 168H380', '#aab4c6', 4), { cls: 'up' });
    s.step(2, `<g transform="translate(350 200)">${C(0, 0, 30, '#16a34a', 'stroke="#14532d" stroke-width="3"')}${star(0, 0, 14, '#fff')}${P('M-16 28L-24 52L-8 44L0 54L0 30Z M16 28L24 52L8 44L0 54L0 30Z', '#22c55e')}</g>`, { cls: 'pop' });
    s.step(3, chk(280, 60, 26) + sparks(280, 60, 36, 50, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['plausible', '#6366f1', '앞뒤가 이어져 그럴듯해서 고개를 끄덕이게 되는 설명', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, bubble(220, 100, 260, 90, '#fff', 'l'), { cls: 'pop' });
    s.step(2, cloud(160, 100, 0.8, '#94a3b8') + arrow(200, 102, 240, 102, '#6366f1', 4, 10) + L('M250 82V98M244 90L250 84L256 90M264 92V108M258 100L264 94L270 100', '#6fb8ee', 3) + arrow(300, 102, 340, 102, '#6366f1', 4, 10) + P('M360 116H390Q392 100 380 96Q370 94 362 104Q356 110 360 116Z', '#22c55e'), { cls: 'wipe' });
    s.step(3, person({ x: 420, y: 254, shirt: '#6366f1', fc: 'smile', armR: [10, -50] }) + chk(480, 56), { cls: 'up' });
  }],
  ['endow', '#f59e0b', '하늘에서 내려온 별빛이 아이에게 재능을 부여한다', (s) => {
    s.sky('night'); s.ground('grass', 250);
    s.step(1, person({ x: 280, y: 262, shirt: '#f59e0b', s: 0.7, fc: 'smile' }), { cls: 'up' });
    s.mv(2, 'translateY(-130px)', star(280, 180, 16, '#ffd34d') + sparks(280, 180, 24, 36, '#ffd34d', 8, 3), { d: 1 });
    s.step(3, sparks(280, 180, 60, 78, '#ffd34d', 12, 4) + note(150, 180) + pencil(420, 180, 1.4, 20) + L('M120 100L140 120M440 100L420 120', '#ffd34d', 4), { cls: 'pop' });
  }],
  ['extrinsic', '#ca8a04', '스스로가 아닌 바깥의 보상 때문에 움직이는 외적 동기', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#ca8a04', fc: 'neutral', armR: [30, -10] }) + bubble(230, 90, 70, 44, '#e5e7eb', 'l'), { cls: 'up' });
    s.step(2, person({ x: 430, y: 254, shirt: '#334155', fc: 'smile', armL: [-40, -10] }) + coin(370, 180, 14) + arrow(340, 170, 260, 170, '#ca8a04', 5, 12), { cls: 'up' });
    s.step(3, person({ x: 150, y: 254, shirt: '#ca8a04', fc: 'cheer', armR: [30, -10] }) + sparks(150, 160, 36, 50, '#ffd34d', 8, 3) + coin(220, 150, 12) + L('M100 230H80M104 250H84', '#ca8a04', 4), { });
  }],
  ['frantic', '#dc2626', '시계는 늦었고 서류는 흩날려 허둥지둥 어쩔 줄 모른다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, clock(430, 100, 40, 3, 6) + L('M400 60L392 44M460 60L468 44', '#dc2626', 4), { cls: 'pop' });
    s.step(2, person({ x: 220, y: 254, shirt: '#dc2626', fc: 'shock', legs: 'walk', rot: -8, armL: [-30, -40], armR: [30, -40] }), { cls: 'up' });
    s.step(3, [[120, 80], [320, 60], [160, 160], [320, 150], [90, 190]].map(([x, y], i) => paper(x, y, 40, 52, 2).replace('translate', 'translate')).join('') + drop(190, 140, 0.8) + L('M150 230L130 238M300 230L322 238', '#dc2626', 4), { cls: 'pop' });
  }],
  ['moan', '#6b7280', '배를 움켜쥐고 누워 낮게 끙끙 앓는 신음', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, bed(280, 252), { cls: 'up' });
    s.step(2, person({ x: 276, y: 224, shirt: '#6b7280', rot: -90, fc: 'sick', skin: '#e4d5b5', legs: 'hide', armL: [-4, 30], armR: [14, 28] }) + `<g transform="translate(300 210)"><path d="M-70 -10Q0 -34 80 -10V26H-70Z" fill="#5f6fd0"/></g>`, { cls: 'up' });
    s.step(3, L('M170 160Q150 150 160 130M150 180Q120 160 140 120', '#6b7280', 5) + L('M390 150Q410 160 400 180', '#6b7280', 5) + drop(210, 170, 0.7), { cls: 'wipe' });
  }],
  ['subdue', '#b45309', '사나운 사자를 조련사가 의자와 채찍으로 제압해 얌전하게 만든다', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, `<g transform="translate(400 250)">${E(0, -40, 50, 28, '#d9a05a')}${C(-36, -66, 34, '#b9742a')}${C(-36, -64, 22, '#d9a05a')}${C(-44, -68, 3, '#111')}${C(-28, -68, 3, '#111')}${P('M-50 -54H-22L-36 -44Z', '#fff')}${R(-28, -20, 12, 22, '#d9a05a', 4)}${R(24, -20, 12, 22, '#d9a05a', 4)}</g>` + L('M310 110L296 100M330 100L328 82', '#dc2626', 4), { cls: 'up' });
    s.step(2, person({ x: 150, y: 258, shirt: '#b45309', fc: 'angry', armR: [34, -20], armL: [30, -4] }) + chair(230, 254), { cls: 'up' });
    s.step(3, `<g transform="translate(400 250)">${E(0, -40, 50, 28, '#d9a05a')}${C(-36, -46, 34, '#b9742a')}${C(-36, -44, 22, '#d9a05a')}${L('M-48 -48H-40M-30 -48H-22', '#111', 3)}${R(-28, -20, 12, 22, '#d9a05a', 4)}${R(24, -20, 12, 22, '#d9a05a', 4)}</g>` + chk(500, 56) + sparks(400, 150, 50, 64, '#ffd34d', 6, 3), { });
  }],
  ['conviction', '#2563eb', '밀려드는 무리에도 가슴에 손을 얹고 굳건히 지키는 확신', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#2563eb', fc: 'cheer', armR: [-10, -30], armL: [-6, 28] }), { cls: 'up' });
    s.step(2, arrow(60, 140, 200, 140, '#dc2626', 8, 18) + arrow(500, 140, 360, 140, '#dc2626', 8, 18), { cls: 'wipe' });
    s.step(3, heart(280, 150, 0.7, '#ef4444') + sparks(280, 160, 60, 76, '#ffd34d', 10, 4) + chk(500, 56), { cls: 'pop' });
  }],
  ['stout', '#92400e', '키는 작아도 몸집이 다부지고 단단하게 튼튼한 사람', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#94a3b8', fc: 'smile' }), { cls: 'up' });
    s.step(2, `<g transform="translate(380 254)">${shadow(0, 12, 50)}${R(-34, -64, 68, 64, '#92400e', 22)}${R(-30, -8, 20, 20, '#334155', 6)}${R(10, -8, 20, 20, '#334155', 6)}${C(0, -82, 18, '#ffd7b5')}${P('M-19 -84Q-21 -106 0 -104Q21 -106 19 -84Q10 -96 0 -96Q-10 -96 -19 -84Z', '#3a2418')}${C(-6, -86, 2.4, '#2a1a12')}${C(6, -86, 2.4, '#2a1a12')}${L('M-6 -76Q0 -72 6 -76', '#2a1a12', 2.4)}${L('M-34 -56Q-56 -50 -52 -30M34 -56Q56 -50 52 -30', '#ffd7b5', 12)}</g>`, { cls: 'up' });
    s.step(3, L('M230 150H300M230 170H290', '#92400e', 4, 'stroke-opacity="0"') + star(380, 90, 12) + chk(500, 56), { cls: 'pop' });
  }],
  ['reckon', '#0d9488', '주판을 튕기며 값을 따져 총합을 헤아려 본다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, coinStack(130, 252, 4) + coinStack(180, 252, 6) + coinStack(230, 252, 3), { cls: 'up' });
    s.step(2, person({ x: 380, y: 254, shirt: '#0d9488', fc: 'think', armR: [-30, 10] }) + `<g transform="translate(320 190)">${R(-36, -24, 72, 48, '#c99a5b', 4, 'stroke="#8c6238" stroke-width="3"')}${[-18, 0, 18].map((y) => L(`M-32 ${y}H32`, '#6b4a2a', 2) + C(-14, y, 5, '#ef4444') + C(8, y, 5, '#ef4444') + C(20, y, 5, '#ef4444')).join('')}</g>`, { cls: 'up' });
    s.step(3, coin(280, 90, 16) + coin(310, 100, 16) + chk(480, 56), { cls: 'pop' });
  }],
  ['entail', '#7c3aed', '돌 하나를 던지자 물결이 퍼지고 배까지 흔들리는 필연적인 연쇄', (s) => {
    s.sky('day'); s.ground('water', 170);
    s.step(1, `<g transform="translate(150 120)">${C(0, 0, 14, '#8a7a68')}${L('M0 20V40', '#aab4c6', 3, 'stroke-dasharray="3 5"')}</g>`, { cls: 'up' });
    s.step(2, E(150, 180, 30, 10, 'none', 'stroke="#fff" stroke-width="3"') + E(150, 180, 60, 20, 'none', 'stroke="#e6f6ff" stroke-width="3"'), { cls: 'pop' });
    s.step(3, E(150, 180, 100, 32, 'none', 'stroke="#e6f6ff" stroke-width="3"') + E(150, 180, 150, 46, 'none', 'stroke="#cfeaff" stroke-width="3"') + `<g transform="translate(400 190) rotate(-8)">${P('M-40 0H40L28 20H-28Z', '#8c5a2a')}${R(-2, -50, 4, 50, '#6b4a2a')}${P('M2 -48L28 -8H2Z', '#f4f6fa')}</g>` + arrow(250, 150, 330, 150, '#7c3aed', 4, 10), { cls: 'pop' });
  }],
  ['offspring', '#f59e0b', '어미 오리를 졸졸 따라 줄지어 헤엄치는 새끼들', (s) => {
    s.sky('day'); s.ground('water', 190);
    s.step(1, duck(150, 214, 1.8, '#f4f1e6'), { cls: 'up' });
    s.step(2, duck(240, 220, 1, '#fde047') + duck(290, 222, 1, '#fde047'), { cls: 'pop' });
    s.step(3, duck(340, 224, 1, '#fde047') + duck(390, 226, 1, '#fde047') + duck(440, 228, 1, '#fde047') + heart(220, 120, 0.8, '#ef4444'), { cls: 'pop' });
  }],
];

function lampL(x, y) { return `<g transform="translate(${x} ${y})"><rect x="-3" y="-90" width="6" height="90" fill="#6b7384"/><path d="M-24 -90L-12 -116H12L24 -90Z" fill="#ffd34d"/><circle cx="0" cy="-86" r="34" fill="#ffe9a0" fill-opacity=".35"/></g>`; }
