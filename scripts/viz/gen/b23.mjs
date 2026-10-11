import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const gift = (x, y, k = 1, col = '#f43f5e') => `<g transform="translate(${x} ${y}) scale(${k})">${R(-22, -22, 44, 38, col, 4)}${R(-4, -22, 8, 38, '#fff')}${R(-22, -6, 44, 8, '#fff')}</g>`;
const trainCar = (x, y, col) => `<g transform="translate(${x} ${y})">${R(-50, -46, 100, 46, col, 6)}${C(-30, 4, 11, '#1f2937')}${C(30, 4, 11, '#1f2937')}${R(-38, -34, 24, 18, '#cfeaff', 3)}${R(-6, -34, 24, 18, '#cfeaff', 3)}</g>`;

export default [
  ['seductive', '#ec4899', '반짝이는 케이크가 손짓하듯 사람을 홀려 끌어당기는 유혹적인 매력', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, table(400, 238, 200) + cake(400, 226, 1.5) + sparks(400, 150, 36, 52, '#ffd34d', 8, 4), { cls: 'up' });
    s.step(2, `<g transform="translate(300 150)">${R(-10, -10, 60, 20, '#ffd7b5', 10, 'stroke="#e8b48c" stroke-width="2"')}${R(44, -22, 10, 20, '#ffd7b5', 5)}</g>` + L('M300 110Q330 90 360 110', '#ec4899', 3, 'stroke-dasharray="4 6"'), { cls: 'pop' });
    s.step(3, person({ x: 150, y: 254, shirt: '#ec4899', fc: 'shy', rot: -12, armR: [70, -20] }) + heart(210, 120, 0.8, '#ef4444') + heart(180, 90, 0.6, '#ec4899'), { cls: 'up' });
  }],
  ['relish', '#ea580c', '한 입 베어 물고 눈을 감은 채 맛을 한껏 즐기는', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, table(400, 238, 220) + `<g transform="translate(400 226)">${E(0, -8, 50, 14, '#d99a4e')}${R(-50, -14, 100, 8, '#ef4444')}${R(-50, -8, 100, 6, '#fbbf24')}${E(0, -20, 50, 12, '#c4893a')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 160, y: 254, shirt: '#ea580c', fc: 'smile', armR: [60, -30] }), { cls: 'up' });
    s.step(3, person({ x: 160, y: 254, shirt: '#ea580c', fc: 'cheer', armR: [60, -30] }) + heart(210, 110, 0.9, '#ef4444') + sparks(160, 160, 40, 56, '#ffd34d', 8, 3) + chk(500, 56), { });
  }],
  ['condemn', '#7f1d1d', '군중이 한 사람을 손가락질하며 잘못을 비난하고 판결이 내려진다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 420, y: 254, shirt: '#6b7280', fc: 'sad', armL: [-6, 24], armR: [6, 24] }) + bag(470, 240, 1, '#d9772e'), { cls: 'up' });
    s.step(2, [90, 160, 230].map((x, i) => person({ x, y: 254, shirt: ['#3b82f6', '#22c55e', '#f59e0b'][i], fc: 'angry', armR: [100 - i * 20, -10] })).join(''), { cls: 'up' });
    s.step(3, `<g transform="translate(300 120) rotate(-30)">${R(-4, 0, 8, 50, '#8c5a2a', 3)}${R(-22, -14, 44, 20, '#a8774a', 4)}</g>` + cross(420, 100, 26), { cls: 'pop' });
  }],
  ['extinguish', '#dc2626', '소화기에서 하얀 거품을 뿜어 타오르는 불을 꺼 버린다', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, flame(400, 252, 1.8), { cls: 'up', e: 2 });
    s.step(2, flame(400, 252, 1.4) + `<g transform="translate(150 252)">${R(-20, -80, 40, 80, '#ef4444', 10)}${R(-8, -96, 16, 18, '#475569', 3)}${L('M0 -96Q40 -110 60 -90', '#475569', 5)}</g>` + L('M210 160Q300 140 380 200', '#fff', 10) + L('M210 160Q300 140 380 200', '#e5e7eb', 3), { e: 2 });
    s.step(3, `<g fill="#9ca3af" fill-opacity=".7">${C(400, 200, 22)}${C(420, 170, 16)}</g>` + `<g transform="translate(150 252)">${R(-20, -80, 40, 80, '#ef4444', 10)}${R(-8, -96, 16, 18, '#475569', 3)}</g>` + chk(480, 56), { cls: 'pop' });
  }],
  ['criterion', '#0d9488', '키 제한선보다 커야 통과하는 판단의 기준', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, `<g transform="translate(300 250)">${R(-6, -170, 12, 170, '#6b7384')}${R(-60, -110, 120, 8, '#ef4444', 2)}${R(-6, -170, 60, 20, '#facc15', 4)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 160, y: 262, shirt: '#3b82f6', s: 0.62, fc: 'smile' }) + person({ x: 430, y: 262, shirt: '#ec4899', hs: 'long', s: 0.95, fc: 'smile' }), { cls: 'up' });
    s.step(3, cross(160, 90, 20) + chk(430, 90, 20) + L('M120 142H220', '#ef4444', 3, 'stroke-opacity="0"'), { cls: 'pop' });
  }],
  ['freight', '#2563eb', '항구에서 컨테이너를 크레인으로 배에 실어 나르는 화물 운송', (s) => {
    s.sky('day'); s.ground('water', 190);
    s.step(1, R(0, 190, 220, 110, '#9ca3af') + `<g transform="translate(110 190)">${R(-60, -130, 12, 130, '#f59e0b')}${R(-60, -130, 120, 12, '#f59e0b')}${L('M40 -118V-60', '#475569', 3)}</g>` + R(30, 160, 50, 30, '#ef4444', 2) + R(90, 160, 50, 30, '#22c55e', 2), { cls: 'up' });
    s.step(2, `<g transform="translate(380 220)">${P('M-120 0H120L90 30H-90Z', '#1f2937')}</g>`, { cls: 'up' });
    s.mv(3, 'translate(-190px,-30px)', R(330, 176, 50, 30, '#ef4444', 2) + R(390, 176, 50, 30, '#22c55e', 2) + R(360, 146, 50, 30, '#3b82f6', 2), { d: 1 });
    s.step(3, arrow(430, 120, 500, 120, '#2563eb', 5, 12), { cls: 'wipe' });
  }],
  ['imperative', '#dc2626', '사이렌이 울리고 느낌표가 번쩍이는 반드시 해야 할 다급한 일', (s) => {
    s.sky('gray'); s.ground('road', 246);
    s.step(1, `<g transform="translate(280 150)">${R(-30, 10, 60, 30, '#475569', 4)}${P('M-24 10Q0 -40 24 10Z', '#ef4444')}</g>` + sparks(280, 130, 44, 66, '#ef4444', 8, 4), { cls: 'up' });
    s.step(2, L('M280 40V92M280 110V112', '#dc2626', 12), { cls: 'pop' });
    s.mv(3, 'translateX(-250px)', `<g transform="translate(450 250)">${R(-60, -50, 120, 50, '#fff', 8, 'stroke="#aab4c6" stroke-width="2"')}${R(-60, -24, 120, 8, '#ef4444')}${C(-34, 6, 12, '#1f2937')}${C(34, 6, 12, '#1f2937')}${L('M0 -44V-30M-7 -37H7', '#dc2626', 5)}</g>`, { d: 0.9 });
  }],
  ['resourceful', '#16a34a', '높은 사과를 상자를 쌓아 올려 기발하게 따 내는 수완', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, tree(380, 252, 1.6) + apple(380, 90, 1.1), { cls: 'up' });
    s.step(2, person({ x: 160, y: 262, shirt: '#16a34a', fc: 'think' }) + bulb(160, 100, 0.9) + sparks(160, 80, 34, 48, '#ffd34d', 8, 3), { cls: 'up' });
    s.step(3, box(300, 252, 70, 50, '#c99a5b') + box(300, 202, 60, 46, '#d6a86a') + person({ x: 300, y: 160, shirt: '#16a34a', fc: 'cheer', legs: 'hide', armR: [60, -20], s: 0.6, sh: false }) + chk(500, 56), { cls: 'up' });
  }],
  ['ingratitude', '#7f1d1d', '선물을 받고도 고마워하기는커녕 등을 돌려 버리는 배은망덕', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#3b82f6', fc: 'smile', armR: [60, -10] }) + gift(230, 190, 1, '#f43f5e'), { cls: 'up' });
    s.mv(2, 'translateX(-90px)', gift(330, 190, 1, '#f43f5e'), { d: 0.7 });
    s.step(2, person({ x: 430, y: 254, shirt: '#1f2937', fc: 'neutral', armL: [-40, -10] }), { cls: 'up', e: 2 });
    s.step(3, person({ x: 430, y: 254, shirt: '#1f2937', fc: 'smirk', rot: 8 }) + person({ x: 130, y: 254, shirt: '#3b82f6', fc: 'cry' }) + drop(112, 172, 0.7) + cross(500, 56), { });
  }],
  ['shabby', '#78716c', '여기저기 기운 해진 옷과 낡아 빠진 집의 초라한 모습', (s) => {
    s.sky('gray'); s.ground('grass', 250);
    s.step(1, `<g transform="translate(400 250)">${R(-70, -60, 140, 60, '#a8774a', 3)}${P('M-80 -60L0 -110L80 -60Z', '#7a5a3a')}${R(-14, -40, 28, 40, '#3a2410', 2)}${L('M-40 -50L-30 -30M30 -40L50 -20', '#5a3a22', 3)}</g>`, { cls: 'up' });
    s.step(2, person({ x: 180, y: 262, shirt: '#94a3b8', pants: '#78716c', fc: 'sad' }), { cls: 'up' });
    s.step(3, R(166, 200, 14, 14, '#ef4444', 2) + R(190, 230, 14, 14, '#3b82f6', 2) + L('M160 215L172 227M200 208L190 220', '#475569', 2.4) + cross(500, 56), { cls: 'pop' });
  }],
  ['certify', '#16a34a', '시험을 통과해 도장과 리본이 붙은 자격증을 받아 공식 인정받는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#16a34a', fc: 'smile', armR: [40, 4] }) + paper(220, 190, 40, 50, 3), { cls: 'up' });
    s.mv(2, 'translateY(-90px)', stamp(220, 190, 1.1), { d: 0.5, ease: 'cubic-bezier(.6,0,.9,1)' });
    s.step(3, R(300, 80, 200, 140, '#fff8e8', 6, 'stroke="#a89260" stroke-width="4"') + L('M330 120H470M330 144H460M330 168H440', '#aab4c6', 4) + `<g transform="translate(450 200)">${C(0, 0, 22, '#16a34a', 'stroke="#14532d" stroke-width="3"')}${star(0, 0, 10, '#fff')}${P('M-12 20L-18 44L-4 36L0 46V22Z M12 20L18 44L4 36L0 46V22Z', '#22c55e')}</g>`, { cls: 'pop' });
  }],
  ['segregate', '#475569', '뒤섞인 구슬을 색깔별로 갈라 따로따로 나누어 담는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [[220, 170, '#ef4444'], [260, 190, '#3b82f6'], [300, 160, '#ef4444'], [340, 180, '#3b82f6'], [280, 210, '#ef4444'], [320, 220, '#3b82f6']].map(([x, y, c]) => C(x, y, 14, c)).join(''), { cls: 'pop', e: 2 });
    s.step(2, arrow(200, 190, 130, 220, '#475569', 4, 10) + arrow(360, 190, 430, 220, '#475569', 4, 10), { cls: 'wipe', e: 2 });
    s.step(3, R(70, 200, 120, 52, '#fecaca', 6, 'stroke="#ef4444" stroke-width="3"') + [[100, 236], [140, 236], [120, 214]].map(([x, y]) => C(x, y, 14, '#ef4444')).join('') + R(370, 200, 120, 52, '#bfdbfe', 6, 'stroke="#3b82f6" stroke-width="3"') + [[400, 236], [440, 236], [420, 214]].map(([x, y]) => C(x, y, 14, '#3b82f6')).join('') + chk(280, 100), { cls: 'up' });
  }],
  ['excavate', '#a16207', '붓과 삽으로 흙을 걷어 내 묻혀 있던 공룡 뼈를 발굴해 낸다', (s) => {
    s.sky('sun'); s.ground('sand', 210);
    s.step(1, R(0, 210, 560, 90, '#c9a257') + L('M120 210V300M240 210V300M360 210V300M480 210V300M0 255H560', '#a8801c', 2, 'stroke-opacity=".6"'), { cls: 'up' });
    s.step(2, person({ x: 120, y: 214, shirt: '#a16207', s: 0.7, fc: 'smile', legs: 'hide', armR: [40, 30], sh: false }) + `<g transform="translate(180 230) rotate(30)">${R(-3, -4, 6, 34, '#8c6238', 2)}${R(-8, -14, 16, 10, '#d9bd7a', 3)}</g>`, { cls: 'up' });
    s.step(3, `<g transform="translate(340 256)">${L('M-70 0Q-30 -26 0 -10T70 -6', '#f4f1e6', 12)}${[-50, -20, 10, 40].map((x) => L(`M${x} -8V14`, '#f4f1e6', 7)).join('')}${C(-76, 0, 14, '#f4f1e6')}</g>` + sparks(340, 240, 60, 76, '#ffd34d', 8, 3) + chk(500, 56), { cls: 'pop' });
  }],
  ['marital', '#ec4899', '반지를 나누어 끼고 부부의 연을 맺는 결혼식 부부 사이의', (s) => {
    s.sky('pink'); s.ground('carpet', 252);
    s.step(1, person({ x: 200, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'smile', armR: [30, -10], hat: tie }) + person({ x: 360, y: 254, shirt: '#fff', pants: '#fff', hs: 'long', fc: 'smile', armL: [-30, -10] }), { cls: 'up' });
    s.step(2, C(270, 190, 12, 'none', 'stroke="#ffd34d" stroke-width="5"') + C(296, 192, 12, 'none', 'stroke="#ffd34d" stroke-width="5"') + P('M262 176L270 168L278 176Z', '#60a5fa'), { cls: 'pop' });
    s.step(3, heart(280, 110, 1.6, '#ef4444') + sparks(280, 120, 56, 72, '#ffd34d', 10, 3), { cls: 'pop' });
  }],
  ['tilt', '#7c3aed', '곧던 탑이 천천히 한쪽으로 기울어 서 있는 모습', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, R(250, 90, 60, 160, '#f4f1e6', 4, 'stroke="#c4bda8" stroke-width="3"') + P('M246 90L280 56L314 90Z', '#9a7b3a'), { cls: 'up', e: 1 });
    s.step(2, `<g transform="translate(280 250) rotate(5)">${R(-30, -160, 60, 160, '#f4f1e6', 4, 'stroke="#c4bda8" stroke-width="3"')}${P('M-34 -160L0 -194L34 -160Z', '#9a7b3a')}</g>` + arrow(380, 100, 420, 100, '#7c3aed', 4, 10), { e: 2 });
    s.step(3, `<g transform="translate(280 250) rotate(14)">${R(-30, -160, 60, 160, '#f4f1e6', 4, 'stroke="#c4bda8" stroke-width="3"')}${P('M-34 -160L0 -194L34 -160Z', '#9a7b3a')}${[0, 1, 2, 3].map((i) => L(`M-30 ${-130 + i * 34}H30`, '#c4bda8', 2)).join('')}</g>` + arrow(400, 90, 450, 110, '#7c3aed', 5, 12), { });
  }],
  ['deploy', '#b91c1c', '한곳에 뭉친 병사들이 넓게 퍼져 제 위치에 배치된다', (s) => {
    s.sky('dusk'); s.ground('grass', 246);
    s.step(1, [250, 280, 310].map((x) => person({ x, y: 262, shirt: '#b91c1c', pants: '#334155', s: 0.6, fc: 'neutral', sh: false, hat: '<path d="M-18 -90Q0 -118 18 -90Z" fill="#aab4c6"/>' })).join(''), { cls: 'up', e: 2 });
    s.step(2, arrow(240, 150, 120, 150, '#b91c1c', 5, 12) + arrow(320, 150, 440, 150, '#b91c1c', 5, 12) + arrow(280, 120, 280, 70, '#b91c1c', 5, 12), { cls: 'wipe', e: 2 });
    s.step(3, [90, 180, 280, 380, 470].map((x, i) => person({ x, y: 262 + (i % 2) * 6, shirt: '#b91c1c', pants: '#334155', s: 0.6, fc: 'neutral', sh: false, hat: '<path d="M-18 -90Q0 -118 18 -90Z" fill="#aab4c6"/>' })).join('') + L('M60 280H500', '#b91c1c', 3, 'stroke-dasharray="4 8"') + chk(500, 56), { cls: 'up' });
  }],
  ['intimidate', '#7f1d1d', '주먹을 쥐고 몸집으로 윽박질러 작은 상대를 겁먹게 한다', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, person({ x: 400, y: 254, shirt: '#7f1d1d', s: 1.5, fc: 'angry', armL: [-40, -20], armR: [-30, -10] }), { cls: 'up' });
    s.step(2, person({ x: 140, y: 262, shirt: '#3b82f6', s: 0.7, fc: 'neutral' }), { cls: 'up', e: 2 });
    s.step(3, person({ x: 140, y: 262, shirt: '#3b82f6', s: 0.7, fc: 'shock', rot: -12, armL: [-14, -20], armR: [14, -20] }) + drop(120, 180, 0.7) + drop(160, 184, 0.7) + L('M250 130L180 150M250 160L190 170', '#7f1d1d', 5), { });
  }],
  ['disjoin', '#0891b2', '연결된 객차의 고리를 풀어 두 칸을 따로 갈라놓는다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, L('M0 250H560', '#6b7384', 6) + trainCar(220, 250, '#ef4444') + trainCar(320, 250, '#3b82f6') + L('M270 224H270', '#6b7384', 6), { cls: 'up', e: 2 });
    s.step(2, L('M0 250H560', '#6b7384', 6) + trainCar(220, 250, '#ef4444') + trainCar(320, 250, '#3b82f6') + `<g transform="translate(270 220)">${R(-12, -8, 24, 16, '#6b7384', 4)}</g>`, { e: 2 });
    s.step(3, L('M0 250H560', '#6b7384', 6) + trainCar(160, 250, '#ef4444') + trainCar(400, 250, '#3b82f6') + arrow(240, 160, 180, 160, '#0891b2', 4, 10) + arrow(320, 160, 380, 160, '#0891b2', 4, 10), { });
  }],
  ['catalyst', '#f97316', '작은 한 방울 첨가제가 반응을 폭발적으로 빠르게 일으키는 촉매', (s) => {
    s.sky('cool'); s.ground('tile', 252);
    s.step(1, `<g transform="translate(280 252)">${P('M-14 -140H14V-96L52 0H-52L-14 -96Z', '#dff1fc', 'stroke="#8a93a5" stroke-width="3"')}${P('M-40 -20H40L52 0H-52Z', '#34d399')}</g>`, { cls: 'up' });
    s.step(2, drop(280, 40, 1.4, '#f97316') + arrow(280, 90, 280, 120, '#f97316', 4, 10), { cls: 'pop' });
    s.step(3, [[250, 120], [284, 100], [316, 124], [270, 70], [300, 60]].map(([x, y]) => C(x, y, 9, '#fff', 'fill-opacity=".85" stroke="#cfeaff" stroke-width="2"')).join('') + sparks(280, 120, 70, 90, '#ffd34d', 12, 4) + chk(480, 56), { cls: 'pop' });
  }],
  ['altruistic', '#ec4899', '대가를 바라지 않고 모금함에 선뜻 돈을 넣어 남을 돕는 이타심', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(400 252)">${R(-44, -90, 88, 90, '#ef4444', 8)}${R(-30, -96, 60, 8, '#991b1b', 3)}${heart(0, -48, 0.9, '#fff')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 160, y: 254, shirt: '#16a34a', fc: 'smile', armR: [60, -40] }) + coin(240, 170, 14), { cls: 'up' });
    s.mv(3, 'translateX(-130px)', coin(380, 130, 14), { d: 0.7, e: undefined });
    s.step(3, heart(280, 100, 1.1, '#ef4444') + sparks(280, 110, 36, 50, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['posture', '#0d9488', '구부정하던 등을 곧게 펴 바른 자세를 만드는 자세 교정', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 160, y: 254, shirt: '#0d9488', fc: 'sad', rot: 16, armL: [4, 24], armR: [-4, 24] }), { cls: 'up' });
    s.step(2, L('M340 70V250', '#0d9488', 3, 'stroke-dasharray="6 6"') + arrow(300, 140, 300, 90, '#0d9488', 5, 12), { cls: 'wipe-d' });
    s.step(3, person({ x: 340, y: 254, shirt: '#0d9488', fc: 'smile' }) + chk(480, 56) + sparks(340, 150, 50, 66, '#ffd34d', 8, 3), { cls: 'up' });
  }],
  ['immerse', '#0ea5e9', '수영장에 풍덩 뛰어들어 몸 전체를 물에 푹 담근다', (s) => {
    s.sky('day'); s.ground('water', 170);
    s.step(1, L('M0 170Q40 160 80 170T160 170T240 170T320 170T400 170T480 170T560 170', '#e6f6ff', 3) + person({ x: 120, y: 160, shirt: '#0ea5e9', fc: 'cheer', s: 0.8, legs: 'hide', armL: [-30, -40], armR: [30, -40], sh: false }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 280, y: 190, shirt: '#0ea5e9', fc: 'cheer', s: 0.8, legs: 'hide', armL: [-30, -30], armR: [30, -30], sh: false }) + P('M240 170Q280 150 320 170Z', '#bfe6ff'), { e: 2 });
    s.step(3, person({ x: 360, y: 250, shirt: '#0ea5e9', fc: 'cheer', s: 0.8, rot: 180, legs: 'hide', sh: false }) + [[330, 210], [360, 190], [390, 220], [400, 190]].map(([x, y]) => C(x, y, 6, '#fff', 'fill-opacity=".8" stroke="#cfeaff" stroke-width="2"')).join('') + arrow(450, 140, 450, 210, '#0ea5e9', 5, 12), { });
  }],
  ['traverse', '#16a34a', '깊은 골짜기 위 줄다리를 조심조심 가로질러 건넌다', (s) => {
    s.sky('day'); s.ground('grass', 220);
    s.step(1, R(0, 150, 130, 150, '#8a7a68', 6) + R(430, 150, 130, 150, '#8a7a68', 6) + P('M130 300H430V240Q280 280 130 240Z', '#4fc3f7', 'fill-opacity=".5"'), { cls: 'up' });
    s.step(2, L('M130 150Q280 190 430 150', '#8c5a2a', 6) + [160, 200, 240, 280, 320, 360, 400].map((x, i) => R(x - 12, 156 + Math.sin((i / 6) * 3.14) * 28 + 6, 24, 6, '#a8774a', 2)).join(''), { cls: 'wipe' });
    s.mv(3, 'translateX(-230px)', person({ x: 420, y: 150, shirt: '#16a34a', s: 0.6, legs: 'walk', fc: 'smile', sh: false }), { d: 1.2, ease: 'linear' });
    s.step(3, flag(470, 150, '#ef4444', 60), { cls: 'pop' });
  }],
  ['pious', '#ca8a04', '두 손을 모으고 머리 위에서 내려오는 빛 아래 경건히 기도하는 독실함', (s) => {
    s.sky('warm'); s.ground('stone', 250);
    s.step(1, person({ x: 280, y: 254, shirt: '#7c3aed', pants: '#7c3aed', fc: 'sleep', armL: [14, -20], armR: [-14, -20], hs: 'bald' }), { cls: 'up' });
    s.step(2, `<path d="M240 20L170 250H390L320 20Z" fill="#fff3b8" fill-opacity=".5"/>`, { cls: 'wipe-d' });
    s.step(3, `<ellipse cx="280" cy="154" rx="20" ry="6" fill="none" stroke="#facc15" stroke-width="5"/>` + sparks(280, 140, 60, 80, '#ffd34d', 12, 3) + star(180, 80, 8) + star(380, 70, 8), { cls: 'pop' });
  }],
  ['savor', '#b45309', '김이 오르는 차를 천천히 머금고 눈을 감은 채 음미한다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, table(400, 238, 200) + cup(400, 226, 1.8) + L('M380 150Q390 130 380 110M410 150Q420 130 410 110', '#cbd5e1', 4), { cls: 'up' });
    s.step(2, person({ x: 160, y: 254, shirt: '#b45309', fc: 'sleep', armR: [60, -30] }), { cls: 'up' });
    s.step(3, person({ x: 160, y: 254, shirt: '#b45309', fc: 'sleep', armR: [60, -30] }) + heart(210, 110, 0.9, '#ef4444') + sparks(160, 160, 40, 56, '#ffd34d', 8, 3) + chk(500, 56), { });
  }],
  ['verse', '#6366f1', '펼친 시집의 시구를 가락에 얹어 소리 내어 읊는다', (s) => {
    s.sky('dusk'); s.ground('grass', 250);
    s.step(1, book(330, 250, '#6366f1', 120, 90) + L('M290 200H370M290 214H360M290 228H370', '#fff', 3), { cls: 'up' });
    s.step(2, person({ x: 160, y: 262, shirt: '#6366f1', hs: 'long', fc: 'cheer', armR: [60, 0] }), { cls: 'up' });
    s.step(3, `<g class="a-rise">${note(200, 130)}</g><g class="a-rise" style="animation-delay:-1s">${note(250, 120, '#ec4899')}</g><g class="a-rise" style="animation-delay:-2s">${note(300, 130, '#6366f1')}</g>` + L('M200 100Q280 70 360 100', '#6366f1', 3, 'stroke-dasharray="4 6"') + moon(470, 70, 18, '#2c3a68'), { cls: 'pop' });
  }],
  ['strangle', '#3f8f3a', '덩굴이 나무줄기를 칭칭 감아 조여 시들게 한다', (s) => {
    s.sky('green'); s.ground('grass', 250);
    s.step(1, tree(280, 252, 1.6), { cls: 'up', e: 1 });
    s.step(2, `<g transform="translate(280 252) scale(1.6)"><rect x="-6" y="-60" width="12" height="60" fill="#6b4a2a"/><circle cx="0" cy="-80" r="34" fill="#4fa04a"/></g>` + L('M262 250Q300 230 262 210Q300 190 262 170', '#3f8f3a', 7) + P('M300 232C316 226 322 238 308 242Z M262 190C246 184 240 196 254 200Z', '#5fb85a'), { e: 2 });
    s.step(3, `<g transform="translate(280 252) scale(1.6)"><rect x="-6" y="-60" width="12" height="60" fill="#6b4a2a"/><circle cx="0" cy="-80" r="34" fill="#9aa94a"/><circle cx="-24" cy="-62" r="22" fill="#8a9a3a"/></g>` + L('M262 250Q300 230 262 210Q300 190 262 170Q300 150 262 130', '#2f6a2f', 8) + cross(480, 56), { });
  }],
  ['hostage', '#7f1d1d', '의자에 묶인 사람을 두고 악당이 돈을 요구하는 인질극', (s) => {
    s.sky('dark'); s.ground('floor', 252);
    s.step(1, person({ x: 220, y: 214, shirt: '#94a3b8', fc: 'cry', legs: 'hide', armL: [-6, 24], armR: [6, 24], sh: false }) + chair(240, 254) + L('M200 170H240M200 190H240', '#8c6238', 4), { cls: 'up' });
    s.step(2, person({ x: 420, y: 254, shirt: '#111827', pants: '#111827', fc: 'smirk', armL: [-40, -10], hat: '<rect x="-17" y="-92" width="34" height="10" fill="#111827"/><rect x="-14" y="-78" width="28" height="9" fill="#111827"/>' }), { cls: 'up' });
    s.step(3, bag(340, 210, 1.2, '#d9772e') + coin(320, 180, 10) + cross(500, 56) + L('M250 130L330 160', '#7f1d1d', 3, 'stroke-dasharray="4 6"'), { cls: 'pop' });
  }],
  ['inconsistent', '#dc2626', '같은 기둥의 표지판이 서로 반대 방향을 가리켜 앞뒤가 맞지 않는다', (s) => {
    s.sky('day'); s.ground('road', 246);
    s.step(1, `<g transform="translate(280 250)">${R(-4, -140, 8, 140, '#6b7384')}${P('M4 -140H60L72 -124L60 -108H4Z', '#16a34a')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(280 250)">${P('M-4 -100H-60L-72 -84L-60 -68H-4Z', '#dc2626')}</g>`, { cls: 'pop' });
    s.step(3, person({ x: 130, y: 262, shirt: '#475569', fc: 'think', armR: [20, -30] }) + qm(130, 100, '#dc2626', 1.4) + cross(480, 56), { cls: 'up' });
  }],
  ['traitor', '#7f1d1d', '아군 몰래 비밀 지도를 적에게 넘기고 금화를 받는 배신자', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, flag(70, 250, '#2563eb', 110) + person({ x: 140, y: 262, shirt: '#2563eb', fc: 'smile', armR: [30, -10] }), { cls: 'up' });
    s.step(2, flag(490, 250, '#b91c1c', 110) + person({ x: 420, y: 262, shirt: '#b91c1c', fc: 'smirk', armL: [-40, -10] }) + person({ x: 260, y: 262, shirt: '#374151', fc: 'smirk', legs: 'walk', armR: [40, 0], armL: [-30, 0] }), { cls: 'up' });
    s.step(3, paper(340, 180, 40, 50, 2, '#fde68a') + coin(360, 220, 12) + cross(500, 56) + L('M180 130L120 150', '#7f1d1d', 3, 'stroke-dasharray="4 6"'), { cls: 'pop' });
  }],
  ['unfounded', '#6b7280', '받침 없이 공중에 떠 있다가 조사하자 무너지는 근거 없는 주장', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(210, 80, 140, 30, '#a78bfa', 6) + R(230, 50, 100, 30, '#c4b5fd', 6) + R(250, 20, 60, 30, '#ddd6fe', 6), { cls: 'up', e: 2 });
    s.step(2, magnifier(200, 200, 1.1) + L('M240 130V250', '#6b7280', 3, 'stroke-dasharray="4 6"') + qm(280, 190, '#6b7280', 1.3), { cls: 'pop', e: 2 });
    s.step(3, [[220, 240, 20], [270, 252, -30], [320, 244, 40]].map(([x, y, r], i) => R(x - 30, y - 14, 60, 28, ['#a78bfa', '#c4b5fd', '#ddd6fe'][i], 6, `transform="rotate(${r} ${x} ${y})"`)).join('') + cross(480, 56), { cls: 'pop' });
  }],
  ['marginalize', '#475569', '무리 한가운데서 밀려나 가장자리 바깥에 홀로 선 소외', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, C(280, 160, 110, 'none', 'stroke="#475569" stroke-width="4" stroke-dasharray="8 8"') + [[250, 200], [310, 200], [280, 140], [230, 160], [330, 160]].map(([x, y], i) => person({ x, y: y + 60, shirt: ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'][i], s: 0.45, fc: 'smile', sh: false })).join(''), { cls: 'up', e: 2 });
    s.step(2, arrow(240, 220, 160, 240, '#475569', 5, 12) + arrow(340, 220, 420, 240, '#475569', 5, 12), { cls: 'wipe', e: 2 });
    s.step(3, C(280, 160, 110, 'none', 'stroke="#475569" stroke-width="4" stroke-dasharray="8 8"') + [[250, 200], [310, 200], [280, 140], [230, 160]].map(([x, y], i) => person({ x, y: y + 60, shirt: ['#3b82f6', '#22c55e', '#f59e0b', '#ec4899'][i], s: 0.45, fc: 'smile', sh: false })).join('') + person({ x: 480, y: 262, shirt: '#475569', s: 0.6, fc: 'sad' }) + cross(500, 56), { });
  }],
  ['legislature', '#1e3a8a', '돔 지붕 의사당에서 의원들이 손을 들어 표결해 법을 만드는 입법부', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, `<g transform="translate(280 250)">${R(-130, -90, 260, 90, '#e8e4d8', 4, 'stroke="#c4bda8" stroke-width="3"')}${P('M-60 -90Q0 -190 60 -90Z', '#9fb4d0', 'stroke="#5f7694" stroke-width="3"')}${R(-2, -190, 4, 26, '#6b7384')}${P('M2 -190H28L20 -182L28 -174H2Z', '#2563eb')}${[-90, -50, 50, 90].map((x) => R(x - 8, -80, 16, 74, '#f4f1e6', 2)).join('')}</g>`, { cls: 'up' });
    s.step(2, [90, 150, 410, 470].map((x, i) => person({ x, y: 266, shirt: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'][i], s: 0.65, fc: 'cheer', armR: [14, -46] })).join(''), { cls: 'up' });
    s.step(3, paper(280, 130, 50, 60, 3) + C(280, 150, 12, '#dc2626', 'fill-opacity=".85"') + chk(500, 56), { cls: 'pop' });
  }],
  ['plead', '#6366f1', '재판관 앞에서 두 팔을 벌려 사정을 호소하며 간청하고 변호한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(300, 160, 180, 92, '#7a461f', 4) + person({ x: 390, y: 160, shirt: '#1f2937', legs: 'hide', fc: 'neutral', sh: false }) + R(350, 126, 80, 8, '#a8774a', 3), { cls: 'up' });
    s.step(2, person({ x: 150, y: 254, shirt: '#6366f1', fc: 'cry', armL: [-30, -50], armR: [30, -50] }) + bubble(250, 110, 90, 50, '#fff', 'l') + L('M225 102H275M225 118H265', '#aab4c6', 4), { cls: 'up' });
    s.step(3, person({ x: 390, y: 160, shirt: '#1f2937', legs: 'hide', fc: 'smile', sh: false }) + heart(430, 90, 0.8, '#ef4444') + chk(500, 56), { cls: 'pop' });
  }],
  ['grim', '#475569', '먹구름과 까마귀 아래 굳은 얼굴로 서 있는 음산하고 엄한 분위기', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, cloud(130, 60, 2, '#4a5568') + cloud(310, 50, 2.4, '#3b4558') + cloud(470, 70, 1.8, '#4a5568'), { cls: 'up' });
    s.step(2, person({ x: 280, y: 262, shirt: '#374151', fc: 'angry', armL: [-6, 28], armR: [6, 28] }), { cls: 'up' });
    s.step(3, `<g transform="translate(400 130)">${E(0, 0, 18, 10, '#111827')}${C(16, -6, 8, '#111827')}${P('M22 -6L34 -3L22 0Z', '#facc15')}${P('M-10 -4Q-34 -26 -6 -14Z', '#111827')}${C(18, -7, 1.6, '#fff')}</g>` + L('M130 130L100 150M450 120L480 140', '#6b7384', 3) + `<g fill="#8fb4d8">${[220, 330, 400].map((x, i) => `<path class="a-fall" style="animation-delay:-${i * 0.7}s" d="M${x} 80c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>`, { cls: 'pop' });
  }],
];
