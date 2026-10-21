import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const horse = (x, y, k = 1, col = '#8a5a2e') => `<g transform="translate(${x} ${y}) scale(${k})">${shadow(0, 6, 60)}${E(0, -50, 52, 26, col)}${R(-40, -30, 10, 32, col, 3)}${R(-20, -30, 10, 32, col, 3)}${R(18, -30, 10, 32, col, 3)}${R(38, -30, 10, 32, col, 3)}${P('M36 -66L60 -100L76 -92L58 -52Z', col)}${E(76, -96, 18, 12, col, 'transform="rotate(20 76 -96)"')}${C(78, -100, 2.4, '#111')}${P('M54 -98L52 -118L62 -102Z', col)}${L('M44 -80Q34 -100 40 -112', '#2a1a12', 7)}${L('M-52 -56Q-70 -50 -66 -26', '#2a1a12', 6)}</g>`;
const spider = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${C(0, 0, 10, '#1f2937')}${C(0, -12, 6, '#1f2937')}${L('M-8 -2L-22 -10M-8 2L-22 6M8 -2L22 -10M8 2L22 6M-6 -6L-18 -18M6 -6L18 -18M-6 6L-16 16M6 6L16 16', '#1f2937', 2.4)}</g>`;
const plane = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${E(0, 0, 70, 16, '#f4f6fa', 'stroke="#aab4c6" stroke-width="3"')}${P('M-20 0L-50 -40L-30 -40L10 0Z', '#3b82f6')}${P('M-20 0L-50 40L-30 40L10 0Z', '#3b82f6')}${P('M-62 -2L-76 -22L-62 -22L-50 -2Z', '#ef4444')}${[-20, 0, 20].map((x2) => C(x2 + 14, -3, 3.4, '#9fd8ff')).join('')}</g>`;

export default [
  ['spur', '#b45309', '말 옆구리를 박차로 차서 힘차게 내달리도록 재촉한다', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, horse(250, 258, 1.5) + person({ x: 250, y: 190, shirt: '#b45309', s: 0.7, legs: 'hide', armR: [30, 10], armL: [20, 10], sh: false }), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(210 252)">${R(-14, -16, 28, 10, '#6b4a2a', 3)}${P('M-4 -8L-10 6L4 6Z', '#cbd5e1')}${C(-7, 10, 4, '#cbd5e1')}</g>` + sparks(210, 246, 14, 26, '#ffd34d', 6, 3), { cls: 'pop', e: 2 });
    s.mv(3, 'translateX(-170px)', horse(400, 258, 1.5) + person({ x: 400, y: 190, shirt: '#b45309', s: 0.7, legs: 'hide', armR: [30, 10], armL: [20, 10], sh: false, rot: 8 }), { d: 0.9 });
    s.step(3, L('M80 170H170M70 200H160M90 230H170', '#b45309', 4), { cls: 'wipe' });
  }],
  ['scheme', '#7c3aed', '어두운 방에서 선과 압정으로 음모를 꾸며 내는 계략', (s) => {
    s.sky('dark'); s.ground('floor', 252);
    s.step(1, R(220, 60, 260, 150, '#8c5a2a', 6) + [[260, 100], [340, 90], [420, 110], [300, 160], [400, 170]].map(([x, y]) => C(x, y, 7, '#ef4444')).join('') + L('M260 100L340 90L420 110L400 170L300 160Z', '#ef4444', 2.4), { cls: 'up' });
    s.step(2, person({ x: 130, y: 254, shirt: '#374151', fc: 'smirk', armR: [40, -30] }), { cls: 'up' });
    s.step(3, bulb(130, 90, 1) + coin(340, 130, 12) + bag(340, 250, 1.2, '#d9772e') + sparks(130, 70, 34, 48, '#a855f7', 8, 3), { cls: 'pop' });
  }],
  ['brisk', '#16a34a', '이른 아침 활기차게 빠른 걸음으로 걷는 상쾌한 산책', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, sun(450, 70, 28, '#ffd34d') + tree(110, 252, 0.8), { cls: 'up' });
    s.step(2, person({ x: 260, y: 262, shirt: '#16a34a', legs: 'walk', fc: 'cheer', armL: [-24, 16], armR: [24, 16], rot: -6 }), { cls: 'up' });
    s.step(3, L('M120 170H200M110 200H190M120 230H200', '#16a34a', 5) + sparks(260, 150, 50, 64, '#ffd34d', 6, 3) + clock(400, 190, 26, 0.5, 1.5), { cls: 'wipe' });
  }],
  ['exile', '#6b7280', '성문 밖으로 쫓겨나 짐 하나만 들고 홀로 떠나는 추방', (s) => {
    s.sky('gray'); s.ground('sand', 246);
    s.step(1, R(40, 80, 80, 170, '#b8bfcf', 4, 'stroke="#8a93a5" stroke-width="3"') + R(180, 80, 80, 170, '#b8bfcf', 4, 'stroke="#8a93a5" stroke-width="3"') + P('M40 80V50L80 20L120 50V80Z', '#a8aebd') + P('M180 80V50L220 20L260 50V80Z', '#a8aebd') + R(120, 130, 60, 120, '#5a3a22', 4), { cls: 'up' });
    s.step(2, person({ x: 120, y: 280, shirt: '#475569', s: 0.8, fc: 'angry', armR: [24, -10] }) + person({ x: 200, y: 280, shirt: '#475569', s: 0.8, fc: 'angry', armL: [-24, -10] }), { cls: 'up' });
    s.mv(3, 'translateX(-150px)', person({ x: 440, y: 258, shirt: '#6b7280', fc: 'sad', legs: 'walk', armR: [14, 24], armL: [-6, 24] }) + R(466, 224, 30, 24, '#c99a5b', 3), { d: 1.1 });
    s.step(3, L('M320 262H540', '#a8742a', 3, 'stroke-dasharray="3 10"') + arrow(330, 120, 420, 120, '#6b7280', 5, 12), { cls: 'wipe' });
  }],
  ['unanimous', '#16a34a', '모든 사람이 한꺼번에 손을 들어 의견이 하나로 일치한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    const xs = [100, 220, 340, 460], cs = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
    s.step(1, xs.map((x, i) => person({ x, y: 254, shirt: cs[i], hs: i % 2 ? 'long' : 'short', fc: 'neutral', sh: false })).join(''), { cls: 'up', e: 1 });
    s.step(2, xs.map((x, i) => person({ x, y: 254, shirt: cs[i], hs: i % 2 ? 'long' : 'short', fc: 'cheer', armR: [14, -56], sh: false })).join(''), {});
    s.step(3, chk(280, 60, 30) + sparks(280, 60, 40, 54, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['deviation', '#dc2626', '곧은 길을 벗어나 옆길로 빗나간 편차', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, L('M40 200H520', '#f4f6fa', 22) + L('M40 200H520', '#8a93a5', 3, 'stroke-dasharray="14 12"'), { cls: 'wipe' });
    s.mv(2, 'translateX(-200px)', car(330, 210, '#3b82f6', 0.9), { d: 0.9, e: 2 });
    s.step(3, `<g transform="translate(400 238) rotate(-26)">${car(0, 0, '#3b82f6', 0.9)}</g>` + arrow(330, 190, 420, 130, '#dc2626', 5, 12) + cross(500, 56), { cls: 'up' });
  }],
  ['constraint', '#475569', '양옆에서 벽이 조여 와 꼼짝 못 하게 제약받는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#475569', fc: 'smile', armL: [-30, -10], armR: [30, -10] }), { cls: 'up' });
    s.mv(2, 'translateX(-150px)', R(60, 70, 120, 190, '#6b7384', 6), { d: 1 });
    s.mv(2, 'translateX(150px)', R(380, 70, 120, 190, '#6b7384', 6), { d: 1 });
    s.step(3, person({ x: 280, y: 254, shirt: '#475569', fc: 'shock', armL: [-16, -10], armR: [16, -10] }) + arrow(200, 150, 240, 150, '#dc2626', 5, 10) + arrow(360, 150, 320, 150, '#dc2626', 5, 10), { });
  }],
  ['fling', '#f59e0b', '졸업 모자를 하늘 높이 휙 내던진다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 150, y: 262, shirt: '#1f2937', fc: 'cheer', armR: [24, -30], hat: '<rect x="-20" y="-104" width="40" height="6" fill="#1f2937"/><path d="M-10 -98H10L8 -92H-8Z" fill="#1f2937"/>' }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 150, y: 262, shirt: '#1f2937', fc: 'cheer', armL: [-26, -56], armR: [26, -56] }) + L('M170 130Q230 40 300 70', '#f59e0b', 3, 'stroke-dasharray="6 8"'), { e: 3 });
    s.mv(3, 'translate(-190px,170px) rotate(-30deg)', `<g transform="translate(420 70)">${R(-20, -4, 40, 6, '#1f2937', 1)}${P('M-10 2H10L8 8H-8Z', '#1f2937')}${L('M18 -2L24 10', '#facc15', 2.4)}</g>`, { d: 1, ease: 'cubic-bezier(.2,.7,.4,1)' });
    s.step(3, person({ x: 150, y: 262, shirt: '#1f2937', fc: 'cheer', armL: [-26, -56], armR: [26, -56] }) + sparks(420, 60, 34, 48, '#ffd34d', 8, 3), { });
  }],
  ['delude', '#0ea5e9', '사막에서 신기루 오아시스를 진짜로 믿었다가 허탈해진다', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, person({ x: 120, y: 262, shirt: '#0ea5e9', legs: 'walk', fc: 'sad', armR: [20, -10] }), { cls: 'up', e: 2 });
    s.step(2, E(340, 190, 110, 20, '#4fc3f7', 'fill-opacity=".7"') + tree(300, 190, 0.6) + tree(380, 190, 0.5) + L('M240 180Q280 172 320 180T400 180T460 180', '#e6f6ff', 3), { cls: 'wipe', e: 2 });
    s.step(3, person({ x: 220, y: 262, shirt: '#0ea5e9', fc: 'sad', armL: [-6, 28], armR: [6, 28], rot: 4 }) + L('M300 190Q330 180 360 190', '#c9a04a', 3, 'stroke-dasharray="4 6"') + cross(500, 56) + drop(210, 180, 0.8), { });
  }],
  ['metabolism', '#ea580c', '먹은 음식이 몸속에서 에너지로 바뀌어 힘이 되는 신진대사', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(110 252)">${E(0, -8, 32, 10, '#d99a4e')}${R(-32, -16, 64, 8, '#8fd06a')}${R(-32, -8, 64, 8, '#7a3a1a')}${E(0, -22, 32, 10, '#d99a4e')}</g>`, { cls: 'up' });
    s.step(2, arrow(160, 190, 220, 170, '#ea580c', 5, 12) + `<g transform="translate(290 170)">${E(0, 0, 60, 70, '#fde8c8', 'stroke="#d9a47c" stroke-width="3"')}${gear(-10, -10, 18, '#ea580c')}${gear(18, 20, 12, '#f59e0b')}</g>`, { cls: 'pop' });
    s.step(3, `<path d="M400 70L380 120H402L388 170L430 110H408Z" fill="#ffd34d" stroke="#f59e0b" stroke-width="2"/>` + person({ x: 470, y: 262, shirt: '#ea580c', legs: 'walk', fc: 'cheer', s: 0.8 }), { cls: 'pop' });
  }],
  ['pinch', '#ec4899', '엄지와 검지로 볼을 꼬집자 아야 하며 얼굴을 찡그린다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, person({ x: 220, y: 254, shirt: '#ec4899', fc: 'smile' }), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(330 170)">${R(-10, -12, 60, 24, '#ffd7b5', 10, 'stroke="#e8b48c" stroke-width="2.4"')}${R(40, -16, 14, 10, '#ffd7b5', 5)}${R(40, 6, 14, 10, '#ffd7b5', 5)}</g>` + arrow(440, 190, 380, 180, '#ec4899', 4, 10), { cls: 'up', e: 2 });
    s.step(3, person({ x: 220, y: 254, shirt: '#ec4899', fc: 'cry' }) + L('M240 170L256 164M240 182L256 184', '#ec4899', 4) + `<g transform="translate(248 178)">${R(0, -6, 40, 12, '#ffd7b5', 6, 'stroke="#e8b48c" stroke-width="2"')}</g>` + star(300, 140, 8, '#ef4444') + L('M170 140L156 132M270 120L282 110', '#ef4444', 3), { });
  }],
  ['punctual', '#16a34a', '시계가 울리는 정각에 딱 맞춰 도착한 시간 엄수', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, clock(430, 110, 44, 0, 6.28 - 0.0) + door(430, 252, 70, 100, '#7a461f'), { cls: 'up' });
    s.mv(2, 'translateX(-240px)', person({ x: 300, y: 254, shirt: '#16a34a', legs: 'walk', fc: 'cheer', rot: -6 }), { d: 1 });
    s.step(3, L('M470 80L480 60M390 80L380 60M430 52V32', '#ffd34d', 4) + chk(120, 90), { cls: 'pop' });
  }],
  ['arbitrary', '#8b5cf6', '규칙 없이 돌림판을 돌려 되는 대로 고르는 임의', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, [0, 1, 2, 3, 4, 5].map((i) => { const a0 = (i / 6) * 6.2832, a1 = ((i + 1) / 6) * 6.2832; return P(`M280 140L${280 + Math.cos(a0) * 80} ${140 + Math.sin(a0) * 80}A80 80 0 0 1 ${280 + Math.cos(a1) * 80} ${140 + Math.sin(a1) * 80}Z`, ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'][i], 'stroke="#fff" stroke-width="3"'); }).join('') + C(280, 140, 8, '#1f2937'), { cls: 'pop' });
    s.step(2, `<g class="a-flip" style="animation-duration:1.2s">${arrow(280, 140, 280, 70, '#1f2937', 6, 16)}</g>`, {});
    s.step(3, `<g transform="translate(450 190)">${R(-28, -28, 56, 56, '#fff', 10, 'stroke="#6b7384" stroke-width="3"')}${[[-12, -12], [12, -12], [0, 0], [-12, 12], [12, 12]].map(([x, y]) => C(x, y, 4.4, '#1f2937')).join('')}</g>` + qmarkLite(100, 130), { cls: 'pop' });
  }],
  ['aviate', '#0ea5e9', '조종사가 비행기를 타고 활주로를 박차고 하늘을 난다', (s) => {
    s.sky('day'); s.ground('road', 250);
    s.step(1, cloud(120, 100, 1.4) + cloud(430, 70, 1.6) + L('M0 276H560', '#fff', 5, 'stroke-dasharray="34 22"'), { cls: 'up' });
    s.step(1, plane(200, 244, 1), { e: 1 });
    s.step(2, plane(280, 232, 1.1) + person({ x: 330, y: 214, shirt: '#0ea5e9', s: 0.3, sh: false, legs: 'hide' }), { e: 2 });
    s.step(3, plane(380, 110, 1.3) + L('M120 160L260 120M110 190L240 150', '#cfeaff', 4), { cls: 'wipe' });
  }],
  ['headquarters', '#2563eb', '가운데 본부 건물이 지점들과 선으로 이어져 지휘한다', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, building(280, 250, 100, 190, '#9fb4d0') + flag(280, 60, '#2563eb', 40), { cls: 'up' });
    s.step(2, building(100, 250, 60, 90, '#b9c8dc') + building(180, 250, 50, 70, '#b9c8dc') + building(380, 250, 50, 70, '#b9c8dc') + building(460, 250, 60, 90, '#b9c8dc'), { cls: 'up' });
    s.step(3, L('M230 140L100 170M230 150L180 190M330 150L380 190M330 140L460 170', '#2563eb', 4, 'stroke-dasharray="6 8"') + star(280, 40, 12), { cls: 'wipe' });
  }],
  ['delegate', '#0d9488', '상사가 서류 일을 부하에게 넘기고 홀가분해한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 140, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: tie, fc: 'sad', armR: [30, 10] }) + R(180, 214, 60, 30, '#fff', 3, 'stroke="#aab4c6" stroke-width="2"'), { cls: 'up', e: 2 });
    s.mv(2, 'translateX(-130px)', paper(360, 200, 60, 40, 2), { d: 0.8, e: 2 });
    s.step(2, person({ x: 440, y: 254, shirt: '#0d9488', fc: 'smile', armL: [-30, 10] }), { cls: 'up' });
    s.step(3, person({ x: 140, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: tie, fc: 'cheer', armL: [-30, -30], armR: [30, -30] }) + person({ x: 440, y: 254, shirt: '#0d9488', fc: 'smile', armL: [-30, 10] }) + paper(380, 210, 40, 30, 2) + sparks(140, 160, 40, 54, '#ffd34d', 6, 3), { });
  }],
  ['wrench', '#475569', '렌치로 볼트를 돌려 단단히 조인다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(200, 190, 160, 60, '#6b7384', 6) + `<g transform="translate(280 190)">${P('M-22 0L-12 -22H12L22 0L12 22H-12Z', '#475569')}${C(0, 0, 8, '#1f2937')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(330 150) rotate(-40)">${R(-8, -80, 16, 90, '#aab4c6', 6, 'stroke="#6b7384" stroke-width="3"')}${P('M-24 -86A26 26 0 0 1 24 -86L8 -74H-8Z', '#aab4c6', 'stroke="#6b7384" stroke-width="3"')}</g>`, { cls: 'pop' });
    s.step(3, L('M230 130A52 52 0 1 1 340 130', '#16a34a', 5) + P('M342 118L350 140L326 138Z', '#16a34a') + chk(480, 56), { cls: 'pop' });
  }],
  ['retort', '#dc2626', '비꼬는 말에 곧바로 날카롭게 쏘아붙이며 받아친다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 120, y: 254, shirt: '#3b82f6', fc: 'smirk' }) + bubble(210, 100, 100, 54, '#fff', 'l') + L('M180 92H240M180 108H230', '#aab4c6', 4), { cls: 'up' });
    s.step(2, person({ x: 450, y: 254, shirt: '#ef4444', hs: 'long', fc: 'angry', armL: [-30, -20] }), { cls: 'up' });
    s.step(3, P('M300 150L330 128L316 150L350 144L324 164L356 168L320 176L338 196L296 180L290 204L276 176L246 188L264 166L232 154L268 150L258 126Z', '#fecaca', 'stroke="#dc2626" stroke-width="3"') + sparks(300, 160, 60, 74, '#dc2626', 8, 3), { cls: 'pop' });
  }],
  ['shudder', '#6366f1', '거미를 보고 소름이 돋아 온몸을 부르르 떤다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, L('M400 20V120', '#cbd5e1', 3) + spider(400, 130, 1.8), { cls: 'up' });
    s.step(2, person({ x: 180, y: 254, shirt: '#6366f1', fc: 'shock', armL: [-16, -24], armR: [16, -24] }), { cls: 'up' });
    s.step(3, L('M130 150L116 150M130 170L112 176M230 150L244 150M230 170L248 176M150 110L140 96M210 110L220 96', '#6366f1', 4) + drop(150, 130, 0.7) + drop(210, 134, 0.7), { cls: 'pop' });
  }],
  ['coexist', '#16a34a', '고양이와 개가 다투지 않고 한 지붕 아래 나란히 공존한다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, cat(150, 252, 2.2), { cls: 'up' });
    s.step(2, dog(410, 252, 2, '#b9772e'), { cls: 'up' });
    s.step(3, heart(280, 130, 1.3, '#ef4444') + sparks(280, 140, 50, 64, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['drawback', '#dc2626', '멋진 집(+)인데 바로 옆으로 기차가 시끄럽게 지나간다 — 단점(−)', (s) => {
    s.sky('day'); s.ground('grass', 236);
    const badge = (x, y, col, plus) => `<g transform="translate(${x} ${y})"><circle r="19" fill="${col}" stroke="#fff" stroke-width="3"/>${L(plus ? 'M-9 0H9M0 -9V9' : 'M-9 0H9', '#fff', 5)}</g>`;
    const car2 = (x, col) => R(x - 44, 160, 88, 38, col, 6) + R(x - 32, 168, 22, 14, '#e0f2fe', 3) + R(x - 4, 168, 22, 14, '#e0f2fe', 3) + C(x - 24, 202, 9, '#1f2937') + C(x + 24, 202, 9, '#1f2937');
    s.add(R(270, 208, 290, 6, '#6b7280') + [290, 330, 370, 410, 450, 490, 530].map((x) => R(x, 212, 8, 8, '#8a6a4a')).join(''));
    s.step(1, house(140, 236, 150, '#fde68a', '#dc2626') + badge(140, 60, '#16a34a', true), { cls: 'up' });
    s.step(1, person({ x: 240, y: 246, shirt: '#2563eb', fc: 'cheer', armR: [16, -40] }) + sparks(140, 140, 84, 98, '#ffd34d', 8, 3) + heart(210, 100, 0.6, '#ef4444'), { cls: 'up', e: 1 });
    s.mv(2, 'translateX(330px)', car2(330, '#f97316') + car2(426, '#f97316') + R(476, 150, 40, 48, '#ea580c', 6) + R(486, 132, 12, 20, '#475569', 2) + C(500, 202, 9, '#1f2937'), { d: 0.8 });
    s.step(2, person({ x: 240, y: 246, shirt: '#2563eb', fc: 'angry', armL: [12, -40], armR: [-12, -40] }) + L('M300 150Q290 170 300 190M282 140Q268 170 282 200', '#ef4444', 3), { cls: 'up' });
    s.step(3, badge(380, 110, '#dc2626', false), { cls: 'pop' });
  }],
  ['dispute', '#dc2626', '두 아이가 곰 인형을 서로 잡아당기며 다툰다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, `<g transform="translate(280 160)">${C(0, 0, 26, '#b9772e')}${C(-16, -22, 10, '#b9772e')}${C(16, -22, 10, '#b9772e')}${C(-8, -4, 3, '#111')}${C(8, -4, 3, '#111')}${E(0, 8, 8, 6, '#e8c9a0')}${R(-18, 24, 36, 40, '#b9772e', 14)}</g>`, { cls: 'pop' });
    s.step(2, person({ x: 150, y: 256, shirt: '#3b82f6', s: 0.85, fc: 'angry', armR: [80, -80] }) + person({ x: 410, y: 256, shirt: '#ef4444', s: 0.85, hs: 'long', fc: 'angry', armL: [-80, -80] }), { cls: 'up' });
    s.step(3, `<path d="M280 70L262 110H284L270 150L306 100H286Z" fill="#ffd34d"/>` + L('M240 90L226 82M330 90L344 82', '#dc2626', 4), { cls: 'pop' });
  }],
  ['reprove', '#7c3aed', '깨진 꽃병 앞에서 손가락을 흔들며 나무라는 꾸짖음', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 140, y: 254, shirt: '#f59e0b', s: 0.8, fc: 'neutral' }) + P('M240 252L255 230L270 252Z M280 252L296 238L310 252Z', '#60a5fa', 'stroke="#2563eb" stroke-width="2"'), { cls: 'up', e: 1 });
    s.step(2, person({ x: 420, y: 254, shirt: '#7c3aed', fc: 'angry', armL: [-26, -30] }), { cls: 'up' });
    s.step(3, person({ x: 140, y: 254, shirt: '#f59e0b', s: 0.8, fc: 'sad', rot: 14, armL: [4, 24], armR: [-4, 24] }) + P('M240 252L255 230L270 252Z M280 252L296 238L310 252Z', '#60a5fa', 'stroke="#2563eb" stroke-width="2"') + L('M360 130H320M360 150H310', '#7c3aed', 4), { cls: 'wipe' });
  }],
  ['engross', '#6366f1', '책에 푹 빠져 시간 가는 줄도 모르고 몰입한다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 180, y: 254, shirt: '#6366f1', fc: 'think', armL: [30, -10], armR: [34, -10] }) + book(246, 210, '#ef4444', 54, 40), { cls: 'up' });
    s.step(2, clock(400, 100, 40, 1, 3) + L('M340 60A60 60 0 0 1 460 60', '#6366f1', 4, 'stroke-dasharray="4 6"'), { cls: 'pop' });
    s.step(3, `<rect width="560" height="300" fill="#1b1f4a" fill-opacity=".45"/>` + moon(480, 60, 18, '#1b1f4a') + `<g transform="translate(360 252)">${E(0, 0, 36, 8, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${E(0, -8, 24, 10, '#c0392b')}</g>` + person({ x: 180, y: 254, shirt: '#6366f1', fc: 'think', armL: [30, -10], armR: [34, -10] }) + book(246, 210, '#ef4444', 54, 40), { });
  }],
];

function qmarkLite(x, y) { return L(`M${x - 6} ${y - 6}Q${x - 6} ${y - 14} ${x} ${y - 14}Q${x + 8} ${y - 14} ${x + 8} ${y - 7}Q${x + 8} ${y - 2} ${x + 2} ${y + 1}Q${x} ${y + 3} ${x} ${y + 6}M${x} ${y + 11}V${y + 13}`, '#8b5cf6', 6); }
