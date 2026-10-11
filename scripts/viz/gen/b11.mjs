import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const piggy = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${E(0, -22, 38, 28, '#f9a8d4', 'stroke="#db2777" stroke-width="3"')}${C(34, -26, 14, '#f9a8d4', 'stroke="#db2777" stroke-width="3"')}${E(44, -24, 6, 5, '#f472b6')}${C(34, -34, 2.4, '#2a1a12')}${P('M22 -46L28 -58L34 -44Z', '#f472b6')}${R(-12, -50, 24, 4, '#9d174d', 2)}${R(-26, -2, 10, 14, '#f9a8d4', 3)}${R(16, -2, 10, 14, '#f9a8d4', 3)}</g>`;
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;

export default [
  ['frugal', '#16a34a', '진열장 앞을 그냥 지나쳐 아낀 동전을 돼지 저금통에 모은다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(60, 80, 150, 120, '#cfeaff', 6, 'stroke="#fff" stroke-width="6"') + `<g transform="translate(135 200)">${P('M-20 -20H20L12 0H-12Z', '#f59e0b')}${C(0, -34, 10, '#ef4444')}</g>` + person({ x: 130, y: 254, shirt: '#16a34a', fc: 'smile', legs: 'walk', armR: [-6, 28] }), { cls: 'up' });
    s.mv(2, 'translateX(-120px)', coin(380, 130, 14), { d: 0.9 });
    s.step(2, piggy(380, 252, 1.6), { cls: 'up' });
    s.step(3, coinStack(280, 252, 5) + coin(440, 220, 12) + coin(470, 230, 12) + chk(500, 56), { cls: 'pop' });
  }],
  ['rejoice', '#f59e0b', '기쁜 소식에 펄쩍 뛰며 친구들과 함께 환호한다', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, paper(110, 190, 50, 64, 2) + person({ x: 180, y: 262, shirt: '#f59e0b', fc: 'shock', armL: [-30, 10] }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 280, y: 230, shirt: '#f59e0b', fc: 'cheer', armL: [-30, -52], armR: [30, -52] }), { e: 2 });
    s.step(3, person({ x: 280, y: 214, shirt: '#f59e0b', fc: 'cheer', armL: [-30, -52], armR: [30, -52] }) + person({ x: 130, y: 262, shirt: '#3b82f6', fc: 'cheer', armR: [14, -56], s: 0.85 }) + person({ x: 430, y: 262, shirt: '#ec4899', hs: 'long', fc: 'cheer', armL: [-14, -56], s: 0.85 }) + `<g>${[[90, 70, '#ef4444'], [200, 50, '#3b82f6'], [350, 60, '#22c55e'], [470, 80, '#8b5cf6'], [250, 100, '#facc15'], [400, 110, '#ec4899']].map(([x, y, c]) => R(x, y, 10, 6, c, 1, `transform="rotate(30 ${x} ${y})"`)).join('')}</g>`, { });
  }],
  ['comprise', '#2563eb', '큰 상자 하나가 여러 부분으로 이루어져 모두 담고 있다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(160, 100, 240, 140, 'none', 12, 'stroke="#2563eb" stroke-width="6" stroke-dasharray="14 10"'), { cls: 'up' });
    s.mv(2, 'translate(-120px,-40px)', R(180, 120, 60, 100, '#ef4444', 8), { d: 0.8 });
    s.mv(2, 'translate(0px,-80px)', R(250, 120, 60, 100, '#f59e0b', 8), { d: 0.8, dl: 0.15 });
    s.mv(2, 'translate(120px,-40px)', R(320, 120, 60, 100, '#22c55e', 8), { d: 0.8, dl: 0.3 });
    s.step(3, R(160, 100, 240, 140, 'none', 12, 'stroke="#2563eb" stroke-width="6"') + chk(500, 56), { cls: 'pop' });
  }],
  ['textile', '#7c3aed', '베틀에서 실을 엮어 알록달록한 직물을 짜낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(120, 70, 12, 180, '#8c5a2a', 3) + R(330, 70, 12, 180, '#8c5a2a', 3) + R(120, 70, 222, 12, '#8c5a2a', 3) + [150, 180, 210, 240, 270, 300].map((x, i) => L(`M${x} 82V200`, ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'][i], 5)).join(''), { cls: 'up' });
    s.step(2, [200, 180, 160].map((y, i) => L(`M140 ${y}H320`, ['#ffe9a0', '#fbbf24', '#fde68a'][i], 9)).join(''), { cls: 'wipe' });
    s.step(3, `<g transform="translate(450 252)">${R(-40, -60, 80, 60, '#a78bfa', 8)}${[-24, -8, 8, 24].map((x) => R(x - 3, -60, 6, 60, ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6'][Math.round((x + 24) / 16)] || '#fff')).join('')}</g>` + R(120, 120, 222, 90, '#c4b5fd', 3, 'fill-opacity=".6"'), { cls: 'up' });
  }],
  ['approximate', '#0d9488', '정확히 재지 않고 눈대중으로 대략 맞추는 어림', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(100, 150, 240, 24, '#14b8a6', 6), { cls: 'up' });
    s.step(2, R(100, 120, 260, 6, '#cbd5e1', 2) + [100, 140, 180, 220, 260, 300, 340].map((x) => L(`M${x} 120V108`, '#6b7384', 3)).join('') + person({ x: 440, y: 254, shirt: '#0d9488', fc: 'think', armR: [-20, -34] }), { cls: 'up' });
    s.step(3, L('M300 60Q320 40 340 60T380 60M300 90Q320 70 340 90T380 90', '#0d9488', 6) + L('M330 150V120', '#0d9488', 3, 'stroke-dasharray="4 5"'), { cls: 'pop' });
  }],
  ['terrain', '#92400e', '산과 계곡, 강이 어우러진 땅의 생김새', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, P('M0 250L120 110L220 210L320 80L430 200L560 130V250Z', '#94a3b8', 'stroke="#64748b" stroke-width="3"') + P('M300 108L320 80L342 112L328 118L318 104L308 120Z', '#fff'), { cls: 'up' });
    s.step(2, L('M240 250Q250 210 300 200T320 150', '#4fc3f7', 12) + tree(110, 252, 0.6) + tree(440, 252, 0.7), { cls: 'up' });
    s.step(3, person({ x: 180, y: 262, shirt: '#92400e', s: 0.8, legs: 'walk', armR: [24, -30] }) + `<g transform="translate(200 220)">${R(-14, -14, 28, 20, '#f3e9c8', 2, 'stroke="#a89260" stroke-width="2"')}</g>` + L('M200 250Q260 238 330 244', '#92400e', 3, 'stroke-dasharray="3 8"'), { cls: 'up' });
  }],
  ['clumsy', '#ef4444', '접시를 나르다 바나나 껍질에 미끄러져 와장창 쏟는 서투름', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 160, y: 254, shirt: '#ef4444', fc: 'smile', armL: [30, -14], armR: [34, -14] }) + `<g transform="translate(212 170)">${E(0, 0, 26, 6, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${E(0, -8, 22, 6, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${E(0, -16, 18, 5, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}</g>`, { cls: 'up', e: 1 });
    s.step(1, P('M260 250Q280 236 300 250Q280 256 260 250Z', '#facc15', 'stroke="#d99a00" stroke-width="2"'), { cls: 'up' });
    s.step(2, person({ x: 250, y: 254, shirt: '#ef4444', fc: 'shock', rot: -22, armL: [30, -34], armR: [34, -30] }), { e: 2 });
    s.step(3, person({ x: 330, y: 244, shirt: '#ef4444', fc: 'sad', rot: -90, rotO: '0 0', legs: 'hide', armL: [-10, 20], armR: [10, 20], sh: false }) + [[200, 262], [240, 268], [290, 262], [180, 270]].map(([x, y]) => P(`M${x} ${y}l10 -6l8 6l-6 8Z`, '#fff', 'stroke="#aab4c6" stroke-width="2"')).join('') + star(380, 190, 8) + star(410, 170, 6), { });
  }],
  ['poise', '#0ea5e9', '한 발로 서서 머리 위 책을 떨어뜨리지 않고 균형 잡는 침착한 자세', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(130, 210, 300, 14, '#8c5a2a', 5) + R(150, 224, 12, 28, '#6b4a2a') + R(400, 224, 12, 28, '#6b4a2a'), { cls: 'up' });
    s.step(2, person({ x: 280, y: 210, shirt: '#0ea5e9', fc: 'smile', legs: 'hide', armL: [-44, -4], armR: [44, -4], sh: false }) + R(266, 204, 11, 18, '#334155', 4) + R(282, 212, 20, 6, '#334155', 3, 'transform="rotate(-40 292 214)"'), { cls: 'up' });
    s.step(3, R(262, 102, 36, 8, '#ef4444', 2) + R(264, 94, 32, 8, '#3b82f6', 2) + L('M200 130H230M330 130H360', '#0ea5e9', 3) + chk(480, 56), { cls: 'pop' });
  }],
  ['disciple', '#b45309', '스승 뒤를 따르며 가르침을 받는 제자', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 360, y: 254, shirt: '#b45309', pants: '#b45309', hair: '#e5e7eb', hs: 'bald', fc: 'smile', armR: [30, -16], hat: '<path d="M-12 -74Q0 -52 12 -74Z" fill="#e5e7eb"/>' }), { cls: 'up' });
    s.step(2, person({ x: 150, y: 254, shirt: '#2563eb', fc: 'cheer', rot: 14, armL: [10, 24], armR: [-10, 24] }), { cls: 'up' });
    s.step(3, R(220, 190, 90, 36, '#f3e9c8', 4, 'stroke="#a89260" stroke-width="3"') + L('M236 200H296M236 214H284', '#a89260', 3) + arrow(190, 150, 300, 130, '#b45309', 4, 10) + star(470, 70, 12), { cls: 'pop' });
  }],
  ['compatible', '#16a34a', '모양이 꼭 들어맞아 함께 쓸 수 있는 호환', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(60, 120, 80, 50, '#475569', 6) + R(78, 134, 44, 22, '#1f2937', 3) + R(60, 210, 80, 50, '#475569', 6) + C(100, 235, 14, '#1f2937'), { cls: 'up' });
    s.step(2, R(400, 126, 40, 38, '#f59e0b', 4) + L('M360 145H400', '#f59e0b', 8) + cross(300, 190) + R(400, 216, 38, 38, '#3b82f6', 4) + L('M360 235H400', '#3b82f6', 8), { cls: 'up', e: 2 });
    s.step(3, R(78, 134, 44, 22, '#f59e0b', 3) + C(100, 235, 14, '#3b82f6') + chk(300, 145) + chk(300, 235) + sparks(100, 145, 40, 52, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['verdict', '#1e3a8a', '판사가 망치를 내리쳐 유죄 아니면 무죄의 평결을 선고한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(160, 160, 240, 92, '#7a461f', 6) + R(150, 152, 260, 14, '#8c5a2a', 4) + person({ x: 280, y: 160, shirt: '#1f2937', legs: 'hide', fc: 'neutral', armR: [30, -14], sh: false }), { cls: 'up' });
    s.step(2, `<g transform="translate(360 100) rotate(-40)">${R(-4, 0, 8, 46, '#8c5a2a', 3)}${R(-20, -14, 40, 18, '#a8774a', 4)}</g>`, { cls: 'pop', e: 2 });
    s.step(3, `<g transform="translate(350 148) rotate(10)">${R(-4, 0, 8, 28, '#8c5a2a', 3)}${R(-20, -8, 40, 18, '#a8774a', 4)}</g>` + paper(130, 120, 60, 80, 3) + chk(130, 90, 18) + sparks(350, 150, 24, 38, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['stall', '#d97706', '차양 아래 과일을 늘어놓고 손님을 맞는 가판대', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, R(130, 100, 8, 150, '#8c5a2a') + R(440, 100, 8, 150, '#8c5a2a') + P('M110 100H470L450 60H130Z', '#ef4444') + P('M110 100H470V112Q440 124 410 112Q380 124 350 112Q320 124 290 112Q260 124 230 112Q200 124 170 112Q140 124 110 112Z', '#fff'), { cls: 'up' });
    s.step(2, R(140, 200, 300, 50, '#c99a5b', 4) + [[180, 196, '#e53e3e'], [230, 196, '#f59e0b'], [280, 196, '#22c55e'], [330, 196, '#a855f7'], [380, 196, '#e53e3e']].map(([x, y, c]) => apple(x, y, 0.9, c)).join(''), { cls: 'up' });
    s.step(3, person({ x: 290, y: 200, shirt: '#16a34a', legs: 'hide', fc: 'cheer', armL: [-20, 4], sh: false, s: 0.8 }) + person({ x: 80, y: 262, shirt: '#3b82f6', fc: 'smile', armR: [30, 4], s: 0.85 }) + coin(130, 186, 10), { cls: 'up' });
  }],
  ['apparatus', '#0d9488', '플라스크와 관, 버너가 이어진 실험 장치', (s) => {
    s.sky('cool'); s.ground('tile', 252);
    s.step(1, R(140, 220, 280, 14, '#8a93a5', 4) + R(160, 90, 10, 130, '#6b7384') + R(160, 100, 120, 8, '#6b7384'), { cls: 'up' });
    s.step(2, `<g transform="translate(260 220)">${P('M-10 -70H10V-48L34 0H-34L-10 -48Z', '#dff1fc', 'stroke="#8a93a5" stroke-width="3"')}${P('M-26 -12H26L34 0H-34Z', '#34d399')}</g>` + L('M270 150Q340 130 380 180V220', '#9aa3b5', 6) + R(366, 200, 28, 20, '#dff1fc', 3, 'stroke="#8a93a5" stroke-width="2"') + `<g transform="translate(260 252)">${R(-14, -16, 28, 16, '#475569', 3)}</g>`, { cls: 'up' });
    s.step(3, flame(260, 236, 0.5) + [[270, 160], [284, 140], [262, 124]].map(([x, y]) => C(x, y, 5, '#fff', 'fill-opacity=".85" stroke="#cfeaff" stroke-width="1.5"')).join('') + chk(480, 56), { cls: 'pop' });
  }],
  ['outburst', '#dc2626', '참았던 분노가 압력계를 넘어 화산처럼 폭발한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 220, y: 254, shirt: '#dc2626', fc: 'neutral' }) + `<g transform="translate(400 150)">${C(0, 0, 44, '#fff', 'stroke="#6b7384" stroke-width="5"')}${P('M-34 14A38 38 0 0 1 -14 -32L0 0Z', '#22c55e', 'fill-opacity=".6"')}${P('M14 -32A38 38 0 0 1 34 14L0 0Z', '#ef4444', 'fill-opacity=".6"')}${L('M0 0L-24 12', '#2a2e3a', 4)}${C(0, 0, 4, '#2a2e3a')}</g>`, { cls: 'up' });
    s.step(2, L('M376 150L400 150M0 0', '#2a2e3a', 0.1, 'stroke-opacity="0"') + `<g transform="translate(400 150)">${L('M0 0L22 -22', '#2a2e3a', 4)}${C(0, 0, 4, '#2a2e3a')}</g>` + L('M180 130L172 112M260 130L268 112', '#cbd5e1', 4), { cls: 'pop' });
    s.step(3, person({ x: 220, y: 254, shirt: '#dc2626', fc: 'angry', skin: '#ff6a5a', armL: [-34, -46], armR: [34, -46] }) + `<path d="M220 40L240 90L290 78L260 126L310 150L252 160L246 214L214 164L160 190L190 138L136 110L196 100Z" fill="#ffd34d" stroke="#f59e0b" stroke-width="4"/>`, { cls: 'pop' });
  }],
  ['vanity', '#a855f7', '거울 속 자기 모습에 취해 으스대는 허영', (s) => {
    s.sky('pink'); s.ground('carpet', 252);
    s.step(1, R(330, 60, 120, 180, '#cfeaff', 14, 'stroke="#c9a96a" stroke-width="10"') + L('M360 100L400 200', '#fff', 5, 'stroke-opacity=".7"'), { cls: 'up' });
    s.step(2, person({ x: 180, y: 254, shirt: '#a855f7', hs: 'long', fc: 'cheer', armR: [40, -8] }), { cls: 'up' });
    s.step(3, crown(390, 120, 1.1) + heart(430, 160, 0.7, '#ef4444') + sparks(390, 150, 60, 74, '#ffd34d', 10, 3) + L('M230 160L330 150', '#a855f7', 3, 'stroke-dasharray="5 7"'), { cls: 'pop' });
  }],
  ['obesity', '#ea580c', '기름진 음식을 많이 먹어 몸집이 불고 체중계 바늘이 치솟는다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, table(120, 238, 160) + `<g transform="translate(110 228)">${E(0, -8, 30, 10, '#d99a4e')}${R(-30, -16, 60, 8, '#8fd06a')}${R(-30, -8, 60, 8, '#7a3a1a')}${E(0, -22, 30, 10, '#d99a4e')}</g>`, { cls: 'up', e: 2 });
    s.step(2, person({ x: 280, y: 254, shirt: '#ea580c', fc: 'cheer', armR: [40, -16] }), { cls: 'up', e: 2 });
    s.step(3, `<g transform="translate(280 254)">${shadow(0, 12, 50)}${E(0, -34, 52, 44, '#ea580c')}${R(-3, -72, 6, 8, '#ffd7b5')}${C(0, -86, 18, '#ffd7b5')}${P('M-19 -88Q-21 -110 0 -108Q21 -110 19 -88Q10 -100 0 -100Q-10 -100 -19 -88Z', '#3a2418')}${L('M-6 -84Q0 -78 6 -84', '#2a1a12', 3)}${C(-6, -90, 2.4, '#2a1a12')}${C(6, -90, 2.4, '#2a1a12')}${R(-26, 10, 14, 14, '#334155', 4)}${R(12, 10, 14, 14, '#334155', 4)}</g>` + `<g transform="translate(440 220)">${R(-40, 0, 80, 22, '#cbd5e1', 6)}${R(-30, -50, 60, 50, '#fff', 8, 'stroke="#aab4c6" stroke-width="3"')}${L('M0 -10L18 -36', '#ef4444', 4)}${C(0, -10, 4, '#2a2e3a')}</g>`, { });
  }],
  ['indispensable', '#7c3aed', '맨 위 쐐기돌을 빼면 아치 전체가 무너지는 없어서는 안 될 존재', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${P('M-110 0V-100Q-110 -170 0 -170Q110 -170 110 -100V0H70V-100Q70 -130 0 -130Q-70 -130 -70 -100V0Z', '#cbd5e1', 'stroke="#8a93a5" stroke-width="3"')}${P('M-14 -170L14 -170L10 -130H-10Z', '#7c3aed')}</g>`, { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(280 252)">${P('M-110 0V-100Q-110 -150 -30 -165L-30 -130Q-70 -126 -70 -100V0Z M110 0V-100Q110 -150 30 -165L30 -130Q70 -126 70 -100V0Z', '#cbd5e1', 'stroke="#8a93a5" stroke-width="3"')}</g>` + P('M266 60L294 60L290 100H270Z', '#7c3aed') + arrow(280, 112, 280, 150, '#ef4444', 4, 10), { cls: 'pop', e: 2 });
    s.step(3, P('M100 252L140 230L180 252Z', '#cbd5e1') + P('M170 252L220 220L260 252Z', '#b8bfcf') + P('M330 252L370 226L420 252Z', '#cbd5e1') + P('M280 252L310 238L340 252Z', '#a8aebd') + cross(480, 56), { cls: 'up' });
  }],
  ['outdated', '#78716c', '먼지 쌓인 구형 전화가 새 스마트폰에 밀려 버려진다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(150 252)">${R(-24, -90, 48, 90, '#8a7a68', 6)}${R(-16, -80, 32, 24, '#6b7a5a', 2)}${[0, 1, 2].map((r) => [0, 1, 2].map((c) => R(-16 + c * 12, -48 + r * 14, 8, 8, '#cbd5e1', 2)).join('')).join('')}${L('M-30 -20Q-40 0 -20 6', '#c9a37a', 3, 'stroke-opacity=".6"')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(400 252)">${R(-30, -140, 60, 140, '#1f2937', 12)}${R(-24, -128, 48, 110, '#9fd8ff', 4)}${C(0, -10, 5, '#475569')}</g>`, { cls: 'pop' });
    s.step(3, cross(150, 90) + arrow(180, 160, 230, 160, '#78716c', 4, 10) + `<g transform="translate(60 252)">${R(-20, -40, 40, 40, '#6b7a8c', 6)}</g>` + star(400, 70, 12), { cls: 'pop' });
  }],
  ['counteract', '#0ea5e9', '활활 타오르는 불길을 물줄기로 맞서 꺼 버린다', (s) => {
    s.sky('dusk'); s.ground('stone', 250);
    s.step(1, flame(390, 252, 1.8), { cls: 'up', e: 2 });
    s.step(2, person({ x: 120, y: 254, shirt: '#ef4444', hat: hatCap('#facc15'), armR: [44, -8] }) + L('M170 190Q250 150 340 200', '#4fc3f7', 10) + L('M170 190Q250 150 340 200', '#e6f6ff', 3), { cls: 'up' });
    s.step(3, `<g fill="#9ca3af" fill-opacity=".7">${C(390, 210, 18)}${C(410, 190, 14)}${C(374, 192, 12)}</g>` + chk(500, 56), { cls: 'pop' });
  }],
  ['discourse', '#475569', '두 사람이 말을 주고받으며 길게 이어가는 담론', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 110, y: 254, shirt: '#2563eb', fc: 'cheer', armR: [30, -20] }) + bubble(200, 100, 130, 60, '#fff', 'l') + L('M150 90H250M150 108H240', '#aab4c6', 4), { cls: 'up' });
    s.step(2, person({ x: 450, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armL: [-30, -20] }) + bubble(360, 160, 130, 60, '#fff', 'r') + L('M310 150H410M310 168H400', '#aab4c6', 4), { cls: 'up' });
    s.step(3, bubble(240, 60, 90, 44, '#e8f3ff', 'l') + L('M205 52H275M205 68H260', '#93c5fd', 4) + bubble(330, 210, 90, 44, '#fde8f0', 'r') + L('M295 202H365M295 218H350', '#f9a8d4', 4), { cls: 'pop' });
  }],
  ['bribe', '#7f1d1d', '책상 밑으로 돈다발을 슬쩍 건네 부정한 이득을 노리는 뇌물', (s) => {
    s.sky('dark'); s.ground('floor', 252);
    s.step(1, R(240, 180, 140, 14, '#4a3320', 4) + R(252, 194, 10, 58, '#3a2810') + R(360, 194, 10, 58, '#3a2810') + person({ x: 440, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'neutral', hat: tie, armL: [-40, 6] }), { cls: 'up' });
    s.step(2, person({ x: 160, y: 254, shirt: '#334155', fc: 'smirk', hat: '<rect x="-17" y="-92" width="34" height="10" fill="#111827"/>', armR: [60, 10] }) + L('M170 210L250 224', '#111827', 3, 'stroke-opacity="0"'), { cls: 'up' });
    s.mv(3, 'translateX(-130px)', bag(390, 220, 1.1, '#d9772e') + coin(420, 214, 10), { d: 0.8 });
    s.step(3, L('M420 120L410 100M450 124L460 104', '#ffd34d', 4) + cross(500, 56), { cls: 'pop' });
  }],
  ['perspiration', '#0ea5e9', '달리기를 하며 쏟아지는 땀방울을 수건으로 닦는다', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, person({ x: 150, y: 262, shirt: '#0ea5e9', legs: 'walk', fc: 'smile', armL: [-24, 16], armR: [24, 16] }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 280, y: 262, shirt: '#0ea5e9', legs: 'walk', fc: 'sad', armL: [-24, 16], armR: [24, 16] }) + drop(250, 150, 1, '#6fb8ee') + drop(310, 154, 1, '#6fb8ee') + drop(236, 190, 0.8, '#6fb8ee') + drop(324, 194, 0.8, '#6fb8ee'), { cls: 'up', e: 2 });
    s.step(3, person({ x: 280, y: 262, shirt: '#0ea5e9', fc: 'smile', armR: [10, -50] }) + R(260, 164, 40, 14, '#fff', 4, 'stroke="#aab4c6" stroke-width="2"') + E(280, 266, 30, 6, '#6fb8ee', 'fill-opacity=".7"') + sun(470, 60, 24, '#ffd34d'), { });
  }],
  ['retention', '#0d9488', '물을 가득 머금고 놓치지 않고 간직하는 스펀지의 보유', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(60, 190, 160, 62, '#4fc3f7', 8) + E(140, 190, 80, 12, '#7dd3fc') + `<g transform="translate(140 180)">${R(-34, -26, 68, 40, '#fbbf24', 8, 'stroke="#d99a00" stroke-width="3"')}${[[-16, -10], [8, -4], [18, -14]].map(([x, y]) => C(x, y, 4, '#d99a00', 'fill-opacity=".5"')).join('')}</g>`, { cls: 'up', e: 1 });
    s.mv(2, 'translate(-60px,50px)', `<g transform="translate(300 130)">${R(-34, -26, 68, 40, '#fbbf24', 8, 'stroke="#d99a00" stroke-width="3"')}${[[-16, -10], [8, -4], [18, -14]].map(([x, y]) => C(x, y, 4, '#d99a00', 'fill-opacity=".5"')).join('')}</g>`, { d: 0.9 });
    s.step(3, drop(290, 160, 0.8, '#6fb8ee') + drop(310, 170, 0.6, '#6fb8ee') + `<g transform="translate(300 130)">${C(0, -50, 4, 'none')}</g>` + chk(480, 56) + L('M270 170V240', '#6fb8ee', 2, 'stroke-opacity="0"'), { cls: 'pop' });
  }],
  ['notion', '#6366f1', '머리 위에 막연히 떠오른 도형 하나가 생각이라는 개념이 된다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#6366f1', fc: 'think', armR: [16, -34] }), { cls: 'up' });
    s.step(2, C(214, 150, 5, '#fff', 'stroke="#aab4c6" stroke-width="2"') + C(240, 126, 8, '#fff', 'stroke="#aab4c6" stroke-width="2"') + E(330, 90, 100, 56, '#fff', 'stroke="#aab4c6" stroke-width="3"'), { cls: 'pop' });
    s.step(3, P('M310 112L336 64L362 112Z', '#f59e0b') + C(300, 86, 12, '#6366f1') + R(356, 74, 24, 24, '#22c55e', 3) + sparks(330, 90, 70, 84, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['oversee', '#475569', '높은 곳에서 작업 현장을 지켜보며 감독한다', (s) => {
    s.sky('day'); s.ground('stone', 252);
    s.step(1, [100, 190, 380, 470].map((x, i) => person({ x, y: 262, shirt: ['#f59e0b', '#22c55e', '#f59e0b', '#22c55e'][i], armR: [20, -10], s: 0.8, hat: hardHatLocal() })).join('') + R(220, 190, 120, 12, '#8c5a2a', 3) + R(230, 202, 8, 50, '#6b4a2a') + R(320, 202, 8, 50, '#6b4a2a'), { cls: 'up' });
    s.step(2, person({ x: 280, y: 190, shirt: '#475569', fc: 'neutral', legs: 'hide', hat: hardHatLocal('#ef4444'), armR: [30, -22], armL: [-30, 4], sh: false }), { cls: 'up' });
    s.step(3, L('M300 100L120 200M300 100L420 200', '#475569', 3, 'stroke-dasharray="6 8"') + C(280, 110, 22, 'none', 'stroke="#475569" stroke-width="4"') + C(280, 110, 8, '#475569'), { cls: 'pop' });
  }],
  ['contagious', '#65a30d', '한 사람의 병균이 옆 사람으로 옮겨 번져 간다', (s) => {
    s.sky('green'); s.ground('floor', 252);
    s.step(1, person({ x: 120, y: 254, shirt: '#94a3b8', fc: 'sick', skin: '#d8e8a0', armL: [16, -30] }) + [[160, 150], [180, 130]].map(([x, y]) => C(x, y, 6, '#84cc16', 'stroke="#4d7c0f" stroke-width="2"')).join(''), { cls: 'up' });
    s.step(2, [[220, 150], [250, 130], [280, 160], [310, 140], [340, 160]].map(([x, y]) => C(x, y, 6, '#84cc16', 'stroke="#4d7c0f" stroke-width="2"')).join('') + person({ x: 280, y: 254, shirt: '#94a3b8', hs: 'long', fc: 'neutral' }), { cls: 'pop' });
    s.step(3, person({ x: 280, y: 254, shirt: '#94a3b8', hs: 'long', fc: 'sick', skin: '#d8e8a0' }) + person({ x: 440, y: 254, shirt: '#94a3b8', fc: 'sick', skin: '#d8e8a0' }) + [[360, 150], [390, 130], [410, 160]].map(([x, y]) => C(x, y, 6, '#84cc16', 'stroke="#4d7c0f" stroke-width="2"')).join('') + cross(500, 56), { cls: 'up' });
  }],
  ['deterioration', '#78716c', '새집이 시간이 흐르며 금 가고 낡아 쇠락해 간다', (s) => {
    s.sky('gray'); s.ground('grass', 250);
    s.step(1, house(280, 252, 160, '#f3d9b5', '#c0392b'), { cls: 'up', e: 1 });
    s.step(2, house(280, 252, 160, '#d8c3a0', '#a0392b') + L('M240 190L256 210L244 226M330 200L316 220', '#6b5a46', 3), { e: 2 });
    s.step(3, house(280, 252, 160, '#b5a283', '#7a4a3a') + L('M240 190L256 210L244 226M330 200L316 220M280 150L296 170', '#4a3a2a', 4) + L('M200 252Q210 220 220 200M360 252Q350 220 340 200', '#3f8f3a', 6) + L('M120 70L170 140', '#9aa3b5', 3, 'stroke-opacity="0"') + arrow(470, 80, 470, 140, '#78716c', 6, 14), { });
  }],
  ['janitor', '#0d9488', '대걸레로 바닥을 닦고 열쇠 꾸러미를 찬 관리인', (s) => {
    s.sky('wall'); s.ground('tile', 252);
    s.step(1, [[100, 262], [180, 270], [260, 262]].map(([x, y]) => E(x, y, 22, 6, '#8a6a3a', 'fill-opacity=".55"')).join(''), { cls: 'pop', e: 2 });
    s.step(2, person({ x: 360, y: 254, shirt: '#0d9488', pants: '#334155', hat: hatCap('#0d9488'), armR: [-40, 20], armL: [-6, 30] }) + `<g transform="translate(300 252) rotate(-14)">${L('M0 0V-110', '#8c6238', 6)}${P('M-26 -2H26L32 16H-32Z', '#cbd5e1', 'stroke="#8a93a5" stroke-width="2"')}</g>` + R(430, 224, 36, 30, '#3b82f6', 6), { cls: 'up' });
    s.step(3, sparks(180, 262, 22, 36, '#ffd34d', 6, 3) + sparks(100, 262, 20, 32, '#fff', 6, 3) + key(470, 120, 1) + key(500, 140, 0.9), { cls: 'pop' });
  }],
  ['blush', '#ef4444', '칭찬 한마디에 쑥스러워 볼이 새빨개진다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#ef4444', fc: 'neutral' }) + person({ x: 410, y: 254, shirt: '#3b82f6', fc: 'cheer', armL: [-20, -30] }), { cls: 'up' });
    s.step(2, bubble(330, 120, 90, 50, '#fff', 'r') + star(330, 120, 14), { cls: 'pop' });
    s.step(3, person({ x: 150, y: 254, shirt: '#ef4444', fc: 'shy', skin: '#ffb0a0', armL: [16, -30] }) + C(138, 178, 8, '#ff4d6d', 'fill-opacity=".7"') + C(162, 178, 8, '#ff4d6d', 'fill-opacity=".7"') + heart(200, 110, 0.7, '#ef4444') + sparks(150, 170, 26, 38, '#ef4444', 8, 3), { });
  }],
  ['intervene', '#2563eb', '다투는 두 사람 사이에 끼어들어 팔을 벌려 말린다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#ef4444', fc: 'angry', armR: [40, -30] }) + person({ x: 410, y: 254, shirt: '#f59e0b', fc: 'angry', armL: [-40, -30] }) + `<path d="M280 110L262 150H284L270 192L306 140H286Z" fill="#ffd34d"/>`, { cls: 'up', e: 2 });
    s.step(2, person({ x: 280, y: 254, shirt: '#2563eb', fc: 'cheer', legs: 'walk', armL: [-40, -10], armR: [40, -10] }), { cls: 'up' });
    s.step(3, person({ x: 150, y: 254, shirt: '#ef4444', fc: 'sad', armR: [10, 28] }) + person({ x: 410, y: 254, shirt: '#f59e0b', fc: 'sad', armL: [-10, 28] }) + sparks(280, 130, 30, 46, '#7dd3fc', 8, 3), { });
  }],
  ['nomad', '#b45309', '천막을 걷고 낙타와 함께 사막을 옮겨 다니는 유목민', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, `<g transform="translate(170 250)">${P('M-60 0L0 -70L60 0Z', '#f3e9c8', 'stroke="#a89260" stroke-width="3"')}${P('M-14 0L0 -34L14 0Z', '#5a3a22')}</g>`, { cls: 'up', e: 2 });
    s.step(2, arrow(250, 160, 330, 160, '#b45309', 5, 12), { cls: 'wipe', e: 2 });
    s.mv(3, 'translateX(-200px)', `<g transform="translate(430 250)">${E(0, -50, 44, 22, '#d9a05a')}${R(-34, -34, 10, 36, '#c4893a', 3)}${R(24, -34, 10, 36, '#c4893a', 3)}${C(-10, -78, 14, '#d9a05a')}${L('M-4 -62Q16 -80 40 -76', '#d9a05a', 12)}${C(44, -78, 9, '#d9a05a')}${C(46, -80, 1.8, '#2a1a12')}${R(-20, -76, 40, 20, '#ef4444', 6)}</g>` + person({ x: 380, y: 250, shirt: '#b45309', s: 0.8, legs: 'walk' }), { d: 1.1 });
    s.step(3, sun(470, 60, 26, '#ffb347'), { cls: 'pop' });
  }],
  ['cuisine', '#ea580c', '요리사가 갓 지은 다채로운 접시들을 상 위에 차려 내는 요리', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 120, y: 254, shirt: '#fff', pants: '#334155', fc: 'cheer', armR: [40, 4], hat: '<path d="M-16 -96Q-22 -122 0 -120Q22 -122 16 -96Z" fill="#fff"/><rect x="-16" y="-98" width="32" height="8" fill="#fff"/>' }), { cls: 'up' });
    s.step(2, table(340, 238, 280), { cls: 'up' });
    s.step(2, [[240, '#f59e0b'], [310, '#ef4444'], [380, '#22c55e'], [440, '#8b5cf6']].map(([x, c], i) => E(x, 222, 28, 8, '#fff', 'stroke="#d6dbe5" stroke-width="2"') + E(x, 214, 18, 10, c) + L(`M${x - 6} 196Q${x} 184 ${x - 6} 172`, '#cbd5e1', 3)).join(''), { cls: 'pop' });
    s.step(3, star(340, 110, 14) + sparks(340, 110, 24, 38, '#ffd34d', 8, 3) + heart(450, 100, 0.8, '#ef4444'), { cls: 'pop' });
  }],
  ['solvent', '#16a34a', '빚보다 훨씬 많은 돈이 있어 갚을 능력이 충분하다', (s) => {
    s.sky('sun'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#16a34a', fc: 'smile', armR: [34, -10] }), { cls: 'up' });
    s.step(2, R(380, 190, 70, 60, '#fecaca', 6, 'stroke="#dc2626" stroke-width="3"') + L('M394 210H436M394 226H426', '#dc2626', 4), { cls: 'up' });
    s.step(3, coinStack(250, 252, 8) + coinStack(290, 252, 6) + bag(330, 252, 1.5, '#d9772e') + arrow(420, 130, 420, 180, '#16a34a', 5, 12) + chk(500, 56), { cls: 'up' });
  }],
  ['ascent', '#0ea5e9', '열기구가 땅을 떠나 구름 위로 높이 솟아오른다', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, cloud(100, 110, 1.4) + cloud(440, 80, 1.6), { cls: 'up' });
    s.mv(2, 'translateY(130px)', `<g transform="translate(280 130)">${C(0, -30, 56, '#ef4444')}${P('M-56 -30Q-30 20 -18 36H18Q30 20 56 -30Z', '#ef4444')}${L('M-28 -30Q-14 20 -6 36M0 -86V36M28 -30Q14 20 6 36', '#fff', 5)}${L('M-18 36L-14 62M18 36L14 62', '#6b4a2a', 3)}${R(-20, 62, 40, 24, '#a0602e', 5)}</g>`, { d: 1.2, ease: 'cubic-bezier(.3,0,.4,1)' });
    s.step(3, arrow(420, 220, 420, 110, '#0ea5e9', 7, 18) + sun(480, 56, 22, '#fff3a8'), { cls: 'wipe-d' });
  }],
];

function hardHatLocal(c = '#facc15') { return `<path d="M-19 -88Q0 -112 19 -88Z" fill="${c}"/><rect x="-22" y="-92" width="44" height="7" rx="3" fill="${c}"/>`; }
