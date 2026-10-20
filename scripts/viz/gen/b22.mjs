import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const goat = (x, y, flip, col = '#f4f1e6') => `<g transform="translate(${x} ${y}) scale(${flip} 1)">${E(0, -26, 30, 18, col, 'stroke="#aab4c6" stroke-width="2"')}${R(-22, -12, 7, 20, col, 2)}${R(14, -12, 7, 20, col, 2)}${C(28, -36, 12, col, 'stroke="#aab4c6" stroke-width="2"')}${P('M24 -46L20 -60L30 -48Z M32 -46L38 -58L36 -44Z', '#8a7a68')}${C(32, -38, 2, '#111')}</g>`;

export default [
  ['constrain', '#475569', '고무줄과 끈에 몸이 묶여 마음대로 움직이지 못하게 제약받는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#475569', fc: 'cheer', armL: [-30, -30], armR: [30, -30] }), { cls: 'up', e: 2 });
    s.step(2, L('M236 190Q280 210 324 190', '#ef4444', 6) + L('M240 210Q280 230 320 210', '#ef4444', 6), { cls: 'wipe', e: 2 });
    s.step(3, person({ x: 280, y: 254, shirt: '#475569', fc: 'sad', armL: [-10, 24], armR: [10, 24] }) + L('M236 190Q280 210 324 190', '#ef4444', 6) + L('M240 210Q280 230 320 210', '#ef4444', 6) + L('M240 160L220 150M320 160L340 150', '#475569', 3) + cross(480, 56), { });
  }],
  ['nomadic', '#b45309', '천막을 걷어 수레에 싣고 새 초원으로 옮겨 다니는 유목 생활', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(170 250)">${P('M-60 0Q-60 -60 0 -70Q60 -60 60 0Z', '#f3e9c8', 'stroke="#a89260" stroke-width="3"')}${P('M-12 0V-30Q0 -40 12 -30V0Z', '#5a3a22')}</g>`, { cls: 'up', e: 2 });
    s.step(2, box(170, 252, 60, 40, '#c99a5b') + box(210, 252, 40, 34, '#d6a86a') + person({ x: 110, y: 262, shirt: '#b45309', armR: [40, 6] }), { cls: 'up', e: 2 });
    s.mv(3, 'translateX(-200px)', `<g transform="translate(430 250)">${R(-50, -40, 100, 40, '#a0602e', 4)}${C(-30, 4, 14, '#6b4a2a')}${C(30, 4, 14, '#6b4a2a')}${box(-20, -40, 50, 34)}</g>` + `<g transform="translate(500 250)">${E(0, -34, 30, 18, '#d9a05a')}${R(-16, -20, 6, 24, '#c4893a', 2)}${R(10, -20, 6, 24, '#c4893a', 2)}${L('M20 -40Q34 -60 44 -56', '#d9a05a', 8)}</g>`, { d: 1.2 });
    s.step(3, L('M80 270H200', '#a8742a', 3, 'stroke-dasharray="3 10"') + sun(470, 60, 24, '#ffb347'), { cls: 'pop' });
  }],
  ['deform', '#dc2626', '둥근 공이 위에서 짓눌려 납작하고 찌그러진 모양으로 일그러진다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, C(280, 210, 40, '#3b82f6', 'stroke="#1d4ed8" stroke-width="3"') + C(268, 196, 10, '#fff', 'fill-opacity=".4"'), { cls: 'pop', e: 1 });
    s.step(2, R(200, 60, 160, 40, '#6b7384', 8) + L('M280 100V160', '#6b7384', 14) + C(280, 210, 40, '#3b82f6', 'stroke="#1d4ed8" stroke-width="3"'), { cls: 'up', e: 2 });
    s.step(3, E(280, 236, 70, 16, '#3b82f6', 'stroke="#1d4ed8" stroke-width="3"') + R(200, 130, 160, 40, '#6b7384', 8) + L('M280 170V210', '#6b7384', 14) + cross(480, 56), { });
  }],
  ['superstitious', '#7c3aed', '사다리 밑을 피해 돌아가고 검은 고양이를 보고 흠칫하는 미신', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, L('M240 250L270 100M320 250L290 100', '#8c6238', 7) + [[250, 200], [260, 160], [272, 124]].map(([x, y]) => L(`M${x} ${y}H${x + 54}`, '#8c6238', 6)).join('') + L('M300 100L440 250', '#8c6238', 5, 'stroke-opacity="0"'), { cls: 'up' });
    s.step(2, person({ x: 130, y: 262, shirt: '#7c3aed', fc: 'think', legs: 'walk', rot: -8 }) + arrow(160, 130, 230, 130, '#7c3aed', 4, 10) + L('M330 130Q440 80 440 200', '#7c3aed', 3, 'stroke-dasharray="5 7"'), { cls: 'up' });
    s.step(3, `<g transform="translate(450 250)">${E(0, -20, 22, 14, '#1f2937')}${C(20, -28, 11, '#1f2937')}${P('M12 -36L14 -48L20 -37Z M24 -37L30 -48L32 -36Z', '#1f2937')}${C(16, -28, 2.4, '#facc15')}${C(24, -28, 2.4, '#facc15')}${L('M-22 -22Q-34 -34 -28 -46', '#1f2937', 5)}</g>` + cross(500, 50), { cls: 'pop' });
  }],
  ['conscientious', '#0d9488', '일을 마치고도 다시 점검하며 빠짐없이 꼼꼼히 챙기는 성실함', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(300, 238, 280) + paper(260, 214, 50, 30, 3) + person({ x: 130, y: 254, shirt: '#0d9488', fc: 'smile', armR: [60, 10] }), { cls: 'up' });
    s.step(2, magnifier(310, 160, 1) + L('M240 190H340', '#0d9488', 3, 'stroke-dasharray="5 6"'), { cls: 'pop' });
    s.step(3, [0, 1, 2].map((i) => chk(430, 100 + i * 36, 12)).join('') + star(480, 60, 12), { cls: 'pop' });
  }],
  ['deliberate', '#6366f1', '체스 말 위에서 손을 멈추고 한참을 신중하게 곰곰이 생각한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(340, 238, 260) + R(240, 190, 120, 46, '#f3d9b5', 3, 'stroke="#8c5a2a" stroke-width="3"') + [0, 1, 2, 3].map((i) => R(240 + i * 30, 190, 30, 23, i % 2 ? '#8c5a2a' : '#f3d9b5')).join('') + [0, 1, 2, 3].map((i) => R(240 + i * 30, 213, 30, 23, i % 2 ? '#f3d9b5' : '#8c5a2a')).join(''), { cls: 'up' });
    s.step(2, person({ x: 130, y: 254, shirt: '#6366f1', fc: 'think', armR: [90, -20] }) + qm(130, 90, '#6366f1', 1.2), { cls: 'up' });
    s.step(3, `<g transform="translate(300 190)">${P('M-8 0H8L6 -22Q8 -30 0 -32Q-8 -30 -6 -22Z', '#1f2937')}${C(0, -38, 7, '#1f2937')}</g>` + L('M180 130L180 150', '#6366f1', 3, 'stroke-opacity="0"') + chk(480, 56), { cls: 'pop' });
  }],
  ['encompass', '#2563eb', '흩어진 양들을 커다란 울타리가 빙 둘러 에워싸 품는다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, [[190, 230], [260, 220], [330, 236], [400, 226], [300, 196]].map(([x, y]) => `<g transform="translate(${x} ${y}) scale(.8)">${E(0, 0, 28, 20, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${C(-12, -6, 10, '#fff')}${C(12, -8, 10, '#fff')}${C(32, 4, 10, '#3b3f4a')}</g>`).join(''), { cls: 'up' });
    s.step(2, E(295, 220, 150, 70, 'none', 'stroke="#2563eb" stroke-width="5" stroke-dasharray="12 8"'), { cls: 'wipe' });
    s.step(3, E(295, 220, 150, 70, 'none', 'stroke="#8c5a2a" stroke-width="8"') + [150, 200, 250, 295, 340, 390, 440].map((x) => R(x - 3, 190, 6, 60, '#a8774a', 2)).join('') + chk(500, 50), { cls: 'up' });
  }],
  ['proclaim', '#dc2626', '연단에 올라 두루마리를 펼쳐 나팔 소리와 함께 널리 선포한다', (s) => {
    s.sky('warm'); s.ground('stone', 250);
    s.step(1, R(120, 190, 100, 62, '#7a461f', 4) + person({ x: 170, y: 190, shirt: '#b91c1c', fc: 'cheer', legs: 'hide', armR: [34, -40], armL: [-30, -10], sh: false }), { cls: 'up' });
    s.step(2, `<g transform="translate(250 130) rotate(-10)">${P('M0 -12L56 -34V34L0 12Z', '#facc15', 'stroke="#d99a00" stroke-width="3"')}${R(-22, -12, 22, 24, '#d99a00', 4)}</g>` + L('M320 110Q350 130 320 150M340 100Q390 130 340 160', '#dc2626', 4), { cls: 'pop' });
    s.step(3, [400, 450, 500].map((x, i) => person({ x, y: 266, shirt: ['#3b82f6', '#22c55e', '#f59e0b'][i], s: 0.7, fc: 'cheer', armR: [14, -46] })).join(''), { cls: 'up' });
  }],
  ['impoverish', '#78716c', '지갑의 동전이 하나둘 날아가 빈 주머니만 남아 가난해진다', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, person({ x: 280, y: 262, shirt: '#94a3b8', fc: 'smile', armR: [14, 20] }) + bag(330, 240, 1.4, '#d9772e') + [[320, 180], [350, 190]].map(([x, y]) => coin(x, y, 10)).join(''), { cls: 'up', e: 2 });
    s.step(2, person({ x: 280, y: 262, shirt: '#94a3b8', fc: 'shock', armR: [14, 20] }) + [[360, 130], [420, 100], [470, 150], [400, 190]].map(([x, y]) => coin(x, y, 10)).join('') + L('M330 180L400 120', '#78716c', 3, 'stroke-dasharray="4 6"'), { e: 2 });
    s.step(3, person({ x: 280, y: 262, shirt: '#94a3b8', fc: 'sad', armL: [-30, 10], armR: [30, 10] }) + R(240, 190, 14, 24, '#6b7280', 4, 'transform="rotate(10 247 202)"') + R(310, 190, 14, 24, '#6b7280', 4, 'transform="rotate(-10 317 202)"') + cross(480, 56), { });
  }],
  ['aversion', '#65a30d', '뱀을 보자 소스라치며 뒤로 물러서는 몹시 싫은 반감', (s) => {
    s.sky('green'); s.ground('grass', 250);
    s.step(1, L('M360 252Q380 220 410 244T470 236', '#65a30d', 14) + C(474, 232, 10, '#65a30d') + C(478, 229, 2, '#fff') + L('M484 234L498 232', '#ef4444', 2.4), { cls: 'up' });
    s.step(2, person({ x: 220, y: 262, shirt: '#16a34a', fc: 'shock', armL: [-30, -20], armR: [30, -20] }), { cls: 'up', e: 2 });
    s.mv(3, 'translateX(70px)', person({ x: 110, y: 262, shirt: '#16a34a', fc: 'shock', rot: -12, legs: 'walk', armL: [-30, -20], armR: [30, -20] }), { d: 0.6 });
    s.step(3, L('M180 150L160 140M260 150L280 140', '#65a30d', 3) + cross(500, 56), { cls: 'pop' });
  }],
  ['augment', '#2563eb', '볼륨을 높이자 작던 소리 파동이 점점 커지고 늘어난다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(60, 150, 70, 100, '#1f2937', 10) + C(95, 190, 24, '#475569') + L('M150 190Q166 200 150 210', '#2563eb', 3), { cls: 'up' });
    s.step(2, C(230, 150, 22, '#e5e9f0', 'stroke="#6b7384" stroke-width="4"') + L('M230 150L240 134', '#ef4444', 5) + arrow(260, 150, 300, 150, '#2563eb', 4, 10), { cls: 'pop' });
    s.step(3, `<g fill="none" stroke="#2563eb" stroke-linecap="round"><path d="M340 170Q370 150 340 130" stroke-width="5"/><path d="M370 190Q420 150 370 110" stroke-width="7"/><path d="M400 210Q480 150 400 90" stroke-width="9"/></g>` + arrow(520, 220, 520, 130, '#2563eb', 5, 12), { cls: 'wipe' });
  }],
  ['behold', '#7c3aed', '비 갠 하늘에 무지개가 뜨자 눈을 크게 뜨고 바라본다', (s) => {
    s.sky('gray'); s.ground('grass', 250);
    s.step(1, cloud(130, 70, 1.6, '#6b7384') + `<g fill="#8fb4d8">${[90, 130, 170].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.6}s" d="M${x} 90c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>`, { cls: 'up', e: 2 });
    s.step(2, `<rect width="560" height="300" fill="#bfe6ff"/>` + ['#ef4444', '#f59e0b', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'].map((c, i) => `<path d="M${100 + i * 10} 250A${180 - i * 10} ${160 - i * 8} 0 0 1 ${460 - i * 10} 250" fill="none" stroke="${c}" stroke-width="10"/>`).join('') + `<path d="M0 250C150 238 310 254 560 242V300H0Z" fill="#6fcf66"/>`, { cls: 'wipe', e: 3 });
    s.step(3, person({ x: 280, y: 262, shirt: '#7c3aed', fc: 'shock', armL: [-30, -40], armR: [30, -40] }) + sparks(280, 150, 60, 76, '#ffd34d', 10, 3), { cls: 'up' });
  }],
  ['proactive', '#16a34a', '폭풍이 오기 전에 미리 지붕의 새는 곳을 고쳐 대비하는 선제적 행동', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, house(300, 252, 150, '#f3d9b5', '#c0392b') + drop(300, 130, 0.6, '#6fb8ee', 'class="a-drip"'), { cls: 'up' });
    s.step(2, L('M170 250L220 120', '#8c6238', 6) + L('M200 250L250 130', '#8c6238', 6) + person({ x: 230, y: 130, shirt: '#16a34a', s: 0.6, fc: 'smile', armR: [30, -10], sh: false, legs: 'hide' }) + `<g transform="translate(262 120) rotate(30)">${R(-3, -10, 6, 40, '#8c6238', 2)}${R(-14, -20, 28, 10, '#8a93a5', 2)}</g>`, { cls: 'up' });
    s.step(3, cloud(130, 50, 1.6, '#4a5568') + cloud(430, 50, 1.8, '#3b4558') + `<g fill="#8fb4d8">${[100, 160, 420, 480].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.5}s" d="M${x} 70c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>` + chk(500, 120), { cls: 'up' });
  }],
  ['compelling', '#dc2626', '자석처럼 눈과 발길을 끌어당겨 빠져들 수밖에 없는 설득력', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(430 250)">${R(-70, -150, 140, 100, '#1f2937', 8)}${R(-62, -142, 124, 84, '#9fd8ff', 4)}${heart(0, -100, 1, '#ef4444')}${R(-6, -50, 12, 50, '#6b7384')}</g>`, { cls: 'up' });
    s.step(2, arrow(170, 150, 330, 150, '#dc2626', 5, 12) + arrow(150, 190, 330, 170, '#dc2626', 5, 12) + arrow(170, 110, 330, 130, '#dc2626', 5, 12), { cls: 'wipe' });
    s.step(3, [110, 180, 250].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#22c55e', '#f59e0b'][i], s: 0.8, fc: 'shock', rot: -10, armL: [-10, -10], armR: [14, -20] })).join('') + sparks(430, 130, 90, 106, '#ffd34d', 12, 3), { cls: 'up' });
  }],
  ['extravagant', '#a855f7', '쇼핑백을 가득 안고 돈을 마구 뿌려 흥청망청 낭비하는 사치', (s) => {
    s.sky('pink'); s.ground('carpet', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#a855f7', hs: 'long', fc: 'cheer', armL: [-30, 10], armR: [30, 10] }) + [[200, 230, '#f43f5e'], [360, 232, '#3b82f6'], [180, 250, '#facc15']].map(([x, y, c]) => R(x - 22, y - 36, 44, 38, c, 5) + L(`M${x - 10} ${y - 36}Q${x} ${y - 52} ${x + 10} ${y - 36}`, '#6b7384', 3)).join(''), { cls: 'up', e: 2 });
    s.step(2, [[120, 80], [170, 120], [400, 70], [450, 120], [280, 50]].map(([x, y]) => money(x, y, 50)).join('') + person({ x: 280, y: 254, shirt: '#a855f7', hs: 'long', fc: 'cheer', armL: [-30, -30], armR: [30, -30] }), { cls: 'pop', e: 2 });
    s.step(3, person({ x: 280, y: 254, shirt: '#a855f7', hs: 'long', fc: 'sad', armL: [-30, 10], armR: [30, 10] }) + R(230, 190, 14, 24, '#6b7280', 4) + R(316, 190, 14, 24, '#6b7280', 4) + cross(480, 56), { });
  }],
  ['expel', '#7f1d1d', '교실 문밖으로 학생을 가리켜 쫓아내 퇴학시킨다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, door(450, 252, 80, 150, '#7a461f') + person({ x: 130, y: 254, shirt: '#7f1d1d', fc: 'angry', armR: [100, -10] }), { cls: 'up' });
    s.step(2, person({ x: 300, y: 254, shirt: '#3b82f6', s: 0.85, fc: 'shock', armL: [-6, 24], armR: [6, 24] }), { cls: 'up', e: 2 });
    s.mv(3, 'translateX(-160px)', person({ x: 500, y: 266, shirt: '#3b82f6', s: 0.85, fc: 'sad', legs: 'walk', armL: [-6, 24], armR: [6, 24] }) + box(470, 250, 36, 28), { d: 1 });
    s.step(3, arrow(250, 120, 400, 120, '#7f1d1d', 6, 14) + cross(300, 70), { cls: 'pop' });
  }],
  ['truce', '#16a34a', '맞서던 두 병사가 칼을 내리고 흰 깃발을 올려 싸움을 멈추는 휴전', (s) => {
    s.sky('dusk'); s.ground('sand', 250);
    s.step(1, person({ x: 130, y: 262, shirt: '#b91c1c', fc: 'angry', armR: [34, -40], hat: '<path d="M-18 -90Q0 -118 18 -90Z" fill="#aab4c6"/>' }) + person({ x: 430, y: 262, shirt: '#2563eb', fc: 'angry', armL: [-34, -40], hat: '<path d="M-18 -90Q0 -118 18 -90Z" fill="#aab4c6"/>' }), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(280 250)">${R(-2, -150, 4, 150, '#8c6238')}${P('M2 -150H56L46 -130L56 -110H2Z', '#fff', 'stroke="#d6dbe5" stroke-width="2"')}</g>`, { cls: 'pop', e: 2 });
    s.step(3, person({ x: 160, y: 262, shirt: '#b91c1c', fc: 'smile', armR: [34, 4] }) + person({ x: 400, y: 262, shirt: '#2563eb', fc: 'smile', armL: [-34, 4] }) + `<g transform="translate(280 250)">${R(-2, -150, 4, 150, '#8c6238')}${P('M2 -150H56L46 -130L56 -110H2Z', '#fff', 'stroke="#d6dbe5" stroke-width="2"')}</g>` + bird(280, 70, 1.4, '#f4f6fa') + chk(500, 56), { });
  }],
  ['reconcile', '#ec4899', '금 간 마음을 두 사람이 손잡고 다시 이어 붙여 화해한다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 140)"><path d="M0 14C-26 -4 -20 -22 -9 -22C-3 -22 0 -16 0 -14L-4 -4L4 4L-3 14Z" fill="#ef4444" transform="translate(-14 0) rotate(-10) scale(2)"/><path d="M0 14C26 -4 20 -22 9 -22C3 -22 0 -16 0 -14L4 -4L-2 4L3 14Z" fill="#c92a2a" transform="translate(14 4) rotate(10) scale(2)"/></g>` + person({ x: 110, y: 254, shirt: '#3b82f6', fc: 'sad' }) + person({ x: 450, y: 254, shirt: '#ec4899', hs: 'long', fc: 'sad' }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 110, y: 254, shirt: '#3b82f6', fc: 'smile', armR: [100, -30] }) + person({ x: 450, y: 254, shirt: '#ec4899', hs: 'long', fc: 'smile', armL: [-100, -30] }) + R(220, 188, 60, 16, '#ffd7b5', 8, 'stroke="#e8b48c" stroke-width="2"') + R(280, 188, 60, 16, '#f0c6a4', 8, 'stroke="#e8b48c" stroke-width="2"'), { e: 2 });
    s.step(3, heart(280, 130, 2.2, '#ef4444') + sparks(280, 130, 60, 76, '#ffd34d', 10, 3) + person({ x: 110, y: 254, shirt: '#3b82f6', fc: 'cheer', armR: [100, -30] }) + person({ x: 450, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armL: [-100, -30] }), { });
  }],
  ['inexhaustible', '#0ea5e9', '아무리 따라도 계속 채워져 마르지 않는 무궁무진한 샘', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, `<g transform="translate(200 250)">${P('M-40 -70Q-50 -30 -30 0H30Q50 -30 40 -70Z', '#60a5fa', 'stroke="#2563eb" stroke-width="3"')}${R(-24, -86, 48, 14, '#93c5fd', 6)}</g>`, { cls: 'up' });
    s.step(2, L('M240 150Q300 130 340 200', '#38bdf8', 10) + E(340, 214, 30, 8, '#4fc3f7') + drop(340, 130, 0.8), { cls: 'wipe' });
    s.step(3, L('M440 150C400 100 360 100 380 150C400 200 480 200 500 150C520 100 480 100 440 150', '#0ea5e9', 8) + arrow(300, 90, 220, 90, '#0ea5e9', 4, 10), { cls: 'wipe' });
  }],
  ['stifle', '#f59e0b', '아기가 자는 옆에서 터져 나오는 웃음을 두 손으로 입을 막아 꾹 참는다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    const zz = (x, y) => L(`M${x} ${y}H${x + 12}L${x} ${y + 12}H${x + 12}M${x + 18} ${y - 16}H${x + 26}L${x + 18} ${y - 8}H${x + 26}`, '#64748b', 2.6);
    s.step(1, bed(430, 252) + person({ x: 410, y: 214, shirt: '#fde8c8', s: 0.5, fc: 'sleep', legs: 'hide', sh: false }) + zz(440, 150), { cls: 'up' });
    s.step(1, person({ x: 170, y: 254, shirt: '#3b82f6', fc: 'smile' }) + `<g transform="translate(220 120)">${C(0, 0, 18, '#fde047', 'stroke="#d99a00" stroke-width="2"')}${L('M-7 -4V-1M7 -4V-1M-8 6Q0 13 8 6', '#2a1a12', 2.2)}</g>`, { cls: 'up', e: 1 });
    s.step(2, person({ x: 170, y: 254, shirt: '#f59e0b', fc: 'cheer', armL: [-30, -30], armR: [30, -30] }) + L('M120 150L106 140M220 150L234 140M128 126L118 112M212 126L222 112', '#f59e0b', 4), { cls: 'up', e: 2 });
    s.step(3, person({ x: 170, y: 254, shirt: '#f59e0b', fc: 'shy', armL: [14, -18], armR: [-14, -18] }) + R(150, 166, 40, 22, '#ffd7b5', 10, 'stroke="#c98f68" stroke-width="2.5"') + L('M160 168V186M170 167V187M180 168V186', '#c98f68', 2) + C(148, 168, 6, '#ff8aa0', 'fill-opacity=".75"') + C(192, 168, 6, '#ff8aa0', 'fill-opacity=".75"') + L('M124 132L112 124M216 132L228 124', '#f59e0b', 3) + drop(198, 150, 0.7) + chk(500, 56), {});
  }],
  ['deadlock', '#7f1d1d', '좁은 외나무다리에서 염소 두 마리가 이마를 맞대고 서로 비키지 않는 교착', (s) => {
    s.sky('day'); s.ground('water', 220);
    s.step(1, R(60, 190, 440, 18, '#8c5a2a', 5) + R(140, 208, 10, 40, '#6b4a2a') + R(410, 208, 10, 40, '#6b4a2a'), { cls: 'up' });
    s.step(2, goat(220, 190, 1) + goat(340, 190, -1, '#d6c9a8'), { cls: 'up' });
    s.step(3, `<path d="M280 110L262 150H284L270 190L306 140H286Z" fill="#ffd34d"/>` + cross(480, 56) + L('M240 120L226 110M330 120L344 110', '#7f1d1d', 4), { cls: 'pop' });
  }],
  ['omission', '#475569', '단체 사진에서 한 사람이 빠져 빈자리가 생긴 누락', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [150, 280, 410].map((x, i) => person({ x, y: 254, shirt: ['#3b82f6', '#ec4899', '#22c55e'][i], hs: i === 1 ? 'long' : 'short', fc: 'cheer', s: 0.9 })).join(''), { cls: 'up', e: 2 });
    s.step(2, R(120, 50, 330, 20, '#1f2937', 4) + R(250, 60, 60, 36, '#6b7384', 6) + C(280, 78, 10, '#9fd8ff'), { cls: 'pop', e: 2 });
    s.step(3, R(80, 70, 400, 160, '#fff', 8, 'stroke="#b9c1cf" stroke-width="6"') + person({ x: 170, y: 220, shirt: '#3b82f6', fc: 'cheer', s: 0.6, sh: false }) + person({ x: 390, y: 220, shirt: '#22c55e', fc: 'cheer', s: 0.6, sh: false }) + R(250, 110, 60, 100, 'none', 8, 'stroke="#475569" stroke-width="4" stroke-dasharray="8 6"') + qm(280, 160, '#475569', 1.2) + cross(500, 40), { cls: 'up' });
  }],
  ['aboriginal', '#b45309', '도시가 생기기 전부터 오두막과 모닥불을 지키며 살아온 원래의 주민', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, P('M0 246Q140 226 280 240T560 230V300H0Z', '#8bc866') + tree(100, 250, 0.9) + tree(480, 250, 1), { cls: 'up' });
    s.step(2, [[170, 250], [260, 254]].map(([x, y]) => `<g transform="translate(${x} ${y})">${P('M-34 0L0 -60L34 0Z', '#c9a37a', 'stroke="#8c6238" stroke-width="3"')}${P('M-8 0L0 -26L8 0Z', '#5a3a22')}</g>`).join('') + `<g transform="translate(330 252)">${L('M-18 0L18 -12M18 0L-18 -12', '#6b4a2a', 7)}${P('M-8 -10C-14 -24 -6 -34 0 -46C6 -34 14 -24 8 -10Z', '#ff9a1f')}</g>`, { cls: 'up' });
    s.step(3, person({ x: 410, y: 262, shirt: '#b45309', pants: '#b45309', hs: 'curly', fc: 'smile', armL: [-14, 10] }) + person({ x: 470, y: 270, shirt: '#16a34a', pants: '#16a34a', hs: 'curly', s: 0.6, fc: 'cheer' }) + `<g opacity=".7">${building(80, 150, 30, 70, '#b9c8dc')}${building(120, 150, 30, 50, '#b9c8dc')}</g>` + heart(440, 120, 0.7, '#ef4444'), { cls: 'up' });
  }],
  ['indignant', '#dc2626', '아이를 괴롭히는 모습을 보고 얼굴이 붉어져 분개하며 호통친다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 420, y: 254, shirt: '#7f1d1d', fc: 'smirk', armL: [-30, -20] }) + person({ x: 500, y: 266, shirt: '#94a3b8', s: 0.6, fc: 'cry' }), { cls: 'up' });
    s.step(2, person({ x: 130, y: 254, shirt: '#16a34a', fc: 'shock', armR: [30, -30] }), { cls: 'up', e: 2 });
    s.step(3, person({ x: 130, y: 254, shirt: '#16a34a', fc: 'angry', skin: '#ff8a7a', armL: [-30, -50], armR: [100, -30] }) + L('M100 150L90 140M160 150L170 140', '#dc2626', 4) + `<path d="M280 70L262 110H284L270 150L306 100H286Z" fill="#ffd34d"/>` + L('M190 130L220 130', '#dc2626', 5) + L('M190 150L230 160', '#dc2626', 5), { });
  }],
  ['desert', '#d97706', '타오르는 사막에서 짐수레를 버려 두고 떠나는 모습', (s) => {
    s.sky('sun'); s.ground('sand', 220);
    s.step(1, sun(450, 70, 32, '#ff8a1a') + sparks(450, 70, 42, 58, '#ffb347', 12, 4) + P('M0 230Q140 190 280 220T560 210V300H0Z', '#e6c27a') + `<g transform="translate(110 250)">${L('M0 0V-60M0 -30L-20 -50M0 -40L18 -60', '#3f8f3a', 7)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 250, y: 262, shirt: '#d97706', fc: 'sad', legs: 'walk', s: 0.8 }) + `<g transform="translate(330 252)">${R(-40, -30, 80, 30, '#a0602e', 4)}${C(-24, 4, 12, '#6b4a2a')}${C(24, 4, 12, '#6b4a2a')}</g>`, { cls: 'up', e: 2 });
    s.mv(3, 'translateX(-120px)', person({ x: 440, y: 262, shirt: '#d97706', fc: 'sad', legs: 'walk', s: 0.8 }), { d: 1 });
    s.step(3, `<g transform="translate(330 252) rotate(-14)">${R(-40, -30, 80, 30, '#a0602e', 4)}${C(-24, 4, 12, '#6b4a2a')}</g>` + C(370, 270, 12, '#6b4a2a') + cross(500, 56), { cls: 'pop' });
  }],
  ['sojourn', '#0d9488', '여관에 짐을 풀고 며칠만 머물다 떠나는 짧은 체류', (s) => {
    s.sky('dusk'); s.ground('floor', 252);
    s.step(1, bed(380, 252) + R(60, 190, 70, 56, '#7a461f', 6) + R(78, 176, 34, 18, '#a8774a', 4), { cls: 'up' });
    s.step(2, person({ x: 200, y: 254, shirt: '#0d9488', fc: 'smile', armR: [14, 24] }) + R(236, 224, 40, 30, '#c99a5b', 4), { cls: 'up', e: 2 });
    s.step(3, `<g transform="translate(120 100)">${R(-30, -26, 60, 52, '#fff', 6, 'stroke="#aab4c6" stroke-width="3"')}${R(-30, -26, 60, 16, '#ef4444', 6)}${L('M-16 8H16', '#aab4c6', 3)}</g>` + door(450, 252, 60, 120, '#7a461f') + arrow(300, 150, 400, 150, '#0d9488', 5, 12) + person({ x: 330, y: 262, shirt: '#0d9488', fc: 'smile', legs: 'walk', s: 0.7 }), { cls: 'up' });
  }],
  ['brag', '#f59e0b', '작은 물고기를 두 팔 활짝 벌려 엄청 큰 것처럼 허풍 떨며 자랑한다', (s) => {
    s.sky('day'); s.ground('water', 190);
    s.step(1, `<g transform="translate(180 220)">${E(0, 0, 18, 9, '#38bdf8')}${P('M-16 0L-30 -8L-30 8Z', '#38bdf8')}${C(8, -2, 2.4, '#fff')}</g>` + R(60, 210, 40, 10, '#8c5a2a', 3), { cls: 'up', e: 1 });
    s.step(2, person({ x: 160, y: 258, shirt: '#f59e0b', fc: 'cheer', armL: [-50, -20], armR: [50, -20] }) + bubble(330, 100, 120, 70, '#fff', 'l') + `<g transform="translate(330 100)">${E(0, 0, 44, 22, '#38bdf8')}${P('M-40 0L-60 -16L-60 16Z', '#38bdf8')}${C(24, -4, 4, '#fff')}</g>`, { cls: 'up' });
    s.step(3, person({ x: 440, y: 262, shirt: '#6b7280', fc: 'neutral', s: 0.8 }) + L('M410 190L398 186M470 190L482 186', '#6b7280', 3) + `<g transform="translate(180 220)">${E(0, 30, 10, 5, '#38bdf8')}</g>` + cross(500, 50), { cls: 'up' });
  }],
  ['grievous', '#7f1d1d', '불타 무너진 집터 앞에 주저앉아 깊이 슬퍼하는 통탄할 피해', (s) => {
    s.sky('gray'); s.ground('soil', 250);
    s.step(1, house(380, 252, 130, '#f3d9b5', '#c0392b'), { cls: 'up', e: 2 });
    s.step(2, house(380, 252, 130, '#6b5a4a', '#3a2a24') + flame(340, 190, 1.4) + flame(420, 200, 1.2) + `<g fill="#6b7280" fill-opacity=".7">${C(380, 70, 28)}${C(410, 50, 22)}</g>`, { e: 2 });
    s.step(3, P('M300 252L340 220L380 250L420 224L460 252Z', '#3a2a24') + R(330, 230, 50, 10, '#6b5a4a', 3, 'transform="rotate(8 355 235)"') + person({ x: 160, y: 262, shirt: '#475569', fc: 'cry', rot: 16, armL: [10, -30], armR: [-10, -30] }) + drop(150, 190, 0.8) + cross(500, 50), { });
  }],
  ['captive', '#6b7280', '철창 안에 갇혀 쇠창살을 붙잡고 있는 포로', (s) => {
    s.sky('dark'); s.ground('stone', 250);
    s.step(1, R(180, 60, 200, 190, '#374151', 6) + [210, 250, 290, 330, 360].map((x) => R(x - 5, 60, 10, 190, '#6b7384', 3)).join(''), { cls: 'up' });
    s.step(2, person({ x: 280, y: 250, shirt: '#6b7280', fc: 'sad', armL: [-20, -50], armR: [20, -50], sh: false }), { cls: 'up' });
    s.step(3, [210, 250, 290, 330, 360].map((x) => R(x - 5, 60, 10, 190, '#6b7384', 3)).join('') + person({ x: 470, y: 262, shirt: '#1d4ed8', fc: 'angry', armL: [-30, 4], hat: '<rect x="-17" y="-92" width="34" height="10" fill="#1d4ed8"/>' }) + key(420, 170, 1) + cross(120, 56), { cls: 'up' });
  }],
  ['bureaucratize', '#78716c', '창구가 겹겹이 늘고 서류 도장이 쌓여 절차가 복잡한 관료화', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(180, 190, 200, 10, '#8c5a2a', 3) + R(200, 200, 8, 50, '#6b4a2a') + R(352, 200, 8, 50, '#6b4a2a') + person({ x: 280, y: 190, shirt: '#475569', legs: 'hide', fc: 'neutral', sh: false }) + person({ x: 110, y: 254, shirt: '#3b82f6', fc: 'smile', s: 0.8 }), { cls: 'up', e: 1 });
    s.step(2, [60, 200, 340].map((x) => R(x, 190, 120, 10, '#8c5a2a', 3) + R(x + 12, 200, 8, 50, '#6b4a2a') + R(x + 100, 200, 8, 50, '#6b4a2a') + paper(x + 60, 176, 30, 24, 2)).join('') + person({ x: 110, y: 254, shirt: '#3b82f6', fc: 'think', s: 0.8 }), { cls: 'up', e: 2 });
    s.step(3, [60, 200, 340].map((x) => R(x, 190, 120, 10, '#8c5a2a', 3) + paper(x + 60, 170, 30, 40, 2) + paper(x + 40, 150, 30, 40, 2)).join('') + [110, 150, 190].map((x) => person({ x, y: 266, shirt: '#3b82f6', fc: 'sad', s: 0.6 })).join('') + L('M440 100H520M440 120H500', '#dc2626', 5) + cross(500, 56), { });
  }],
  ['elicit', '#0891b2', '질문으로 낚싯바늘을 드리워 상대 머릿속의 대답을 끌어낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#0891b2', fc: 'think', armR: [30, -20] }) + bubble(210, 100, 80, 50, '#fff', 'l') + qm(210, 100, '#0891b2', 1), { cls: 'up' });
    s.step(2, person({ x: 430, y: 254, shirt: '#ec4899', hs: 'long', fc: 'think' }) + L('M280 60V130', '#6b7384', 3) + C(280, 134, 8, 'none', 'stroke="#6b7384" stroke-width="4"'), { cls: 'up' });
    s.step(3, bubble(330, 90, 100, 56, '#fff', 'r') + bulb(330, 112, 0.7) + L('M290 150Q360 140 410 170', '#0891b2', 3, 'stroke-dasharray="5 6"') + chk(500, 56), { cls: 'pop' });
  }],
  ['quiver', '#0ea5e9', '과녁에 꽂힌 화살이 파르르 떨며 진동한다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(450 250)">${R(-3, -100, 6, 100, '#8c6238')}${C(0, -120, 50, '#fff', 'stroke="#dc2626" stroke-width="6"')}${C(0, -120, 30, '#fecaca', 'stroke="#dc2626" stroke-width="4"')}${C(0, -120, 12, '#dc2626')}</g>`, { cls: 'up' });
    s.mv(2, 'translateX(-260px)', `<g transform="translate(450 130)">${L('M0 0H-90', '#8c6238', 4)}${P('M0 0L12 -6V6Z', '#475569')}${P('M-90 0L-104 -10L-96 0L-104 10Z', '#ef4444')}</g>`, { d: 0.6, ease: 'cubic-bezier(.4,0,.9,1)' });
    s.step(3, L('M330 110Q320 130 330 150M340 104Q326 130 340 156M350 98Q332 130 350 162', '#0ea5e9', 3) + sparks(450, 130, 14, 30, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['evacuate', '#dc2626', '불이 나자 건물에서 사람들이 문을 열고 줄지어 밖으로 대피한다', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, building(150, 250, 150, 190, '#9fb4d0') + flame(110, 120, 0.9) + `<g fill="#6b7280" fill-opacity=".7">${C(100, 70, 22)}${C(130, 50, 18)}</g>`, { cls: 'up' });
    s.mv(2, 'translateX(-130px)', person({ x: 300, y: 262, shirt: '#3b82f6', fc: 'shock', legs: 'walk', s: 0.8 }) + person({ x: 350, y: 262, shirt: '#ec4899', hs: 'long', fc: 'shock', legs: 'walk', s: 0.8 }), { d: 1 });
    s.step(3, [430, 480].map((x, i) => person({ x, y: 266, shirt: ['#3b82f6', '#ec4899'][i], s: 0.75, fc: 'smile' })).join('') + chk(500, 56) + arrow(250, 150, 380, 150, '#dc2626', 5, 12), { cls: 'up' });
  }],
  ['electoral', '#2563eb', '표가 모여 막대가 자라고 이긴 쪽 머리에 왕관이 얹히는 선거', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(100, 230, 80, 22, '#ef4444', 4) + R(260, 230, 80, 22, '#2563eb', 4), { cls: 'up' });
    s.step(2, R(100, 190, 80, 62, '#ef4444', 4) + R(260, 130, 80, 122, '#2563eb', 4) + ballotL(430, 200) + L('M430 150V170M420 160H440', '#2563eb', 3, 'stroke-opacity="0"'), { cls: 'pop' });
    s.step(3, crown(300, 110, 1) + sparks(300, 100, 40, 56, '#ffd34d', 8, 3) + chk(500, 56), { cls: 'pop' });
  }],
  ['authoritarian', '#7f1d1d', '높은 단 위에서 손가락질로 명령하고 모두가 머리 숙여 따르는 권위주의', (s) => {
    s.sky('dark'); s.ground('stone', 250);
    s.step(1, R(200, 150, 160, 100, '#4a3320', 4) + person({ x: 280, y: 150, shirt: '#7f1d1d', fc: 'angry', s: 1.1, legs: 'hide', armR: [60, 0], hat: crown(0, -98, 0.7), sh: false }), { cls: 'up' });
    s.step(2, [80, 150, 410, 480].map((x) => person({ x, y: 266, shirt: '#6b7280', s: 0.7, fc: 'neutral', rot: 16, armL: [4, 24], armR: [-4, 24] })).join(''), { cls: 'up' });
    s.step(3, arrow(140, 100, 140, 140, '#7f1d1d', 5, 12) + arrow(420, 100, 420, 140, '#7f1d1d', 5, 12) + `<path d="M280 40L262 80H284L270 120L306 70H286Z" fill="#ffd34d"/>`, { cls: 'pop' });
  }],
  ['disdain', '#6b7280', '건넨 선물을 손가락 두 개로 집어 쓰레기통에 툭 버리는 멸시', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 140, y: 254, shirt: '#3b82f6', fc: 'smile', armR: [60, -10] }) + gift(220, 190, 0.9, '#f43f5e') + person({ x: 380, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'smirk', hat: tie, armL: [-40, -10] }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 380, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'smirk', hat: tie, armL: [-40, -10] }) + gift(340, 190, 0.7, '#f43f5e') + person({ x: 140, y: 254, shirt: '#3b82f6', fc: 'smile', armR: [60, -10] }), { e: 2 });
    s.step(3, person({ x: 380, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'smirk', hat: tie, armL: [-14, 20], armR: [14, 20], rot: 6 }) + person({ x: 140, y: 254, shirt: '#3b82f6', fc: 'sad' }) + `<g transform="translate(480 252)">${P('M-22 -50H22L18 0H-18Z', '#6b7a8c', 'stroke="#4a5666" stroke-width="2.4"')}</g>` + gift(480, 180, 0.6, '#f43f5e') + cross(300, 56), { });
  }],
];

function gift(x, y, k = 1, col = '#f43f5e') { return `<g transform="translate(${x} ${y}) scale(${k})">${R(-22, -22, 44, 38, col, 4)}${R(-4, -22, 8, 38, '#fff')}${R(-22, -6, 44, 8, '#fff')}</g>`; }
function ballotL(x, y) { return `<g transform="translate(${x} ${y})">${R(-40, -40, 80, 80, '#3b82f6', 8)}${R(-26, -44, 52, 8, '#173f94', 3)}${L('M-14 0L-2 14L18 -14', '#fff', 7)}</g>`; }
