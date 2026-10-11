import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const qm = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const flame = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M0 0C-30 -10 -26 -50 -6 -70C-4 -48 6 -52 4 -76C26 -52 34 -16 0 0Z', '#ff7a1a')}${P('M0 0C-14 -6 -12 -26 -2 -36C0 -22 8 -24 6 -40C14 -26 16 -8 0 0Z', '#ffd34d')}</g>`;
const bush = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${C(-22, -16, 20, '#4fa04a')}${C(0, -26, 24, '#3f8f3a')}${C(24, -16, 20, '#4fa04a')}${R(-30, -12, 60, 14, '#4fa04a', 6)}</g>`;
const train = (x, y, col = '#ef4444') => `<g transform="translate(${x} ${y})">${R(-70, -50, 90, 50, col, 8)}${R(10, -76, 40, 76, col, 6)}${R(18, -66, 24, 22, '#cfeaff', 3)}${C(-40, 4, 12, '#1f2937')}${C(0, 4, 12, '#1f2937')}${C(30, 4, 12, '#1f2937')}${R(-60, -66, 20, 16, '#6b7384', 3)}</g>`;

export default [
  ['proponent', '#2563eb', '배너를 들고 확성기로 자기 주장을 옹호하는 지지자', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, person({ x: 220, y: 262, shirt: '#2563eb', fc: 'cheer', armR: [30, -40], armL: [-30, -10] }) + `<g transform="translate(160 150)">${R(-3, 0, 6, 110, '#8c6238')}${R(-50, -40, 100, 50, '#2563eb', 4)}${heart(0, -14, 0.7, '#fff')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(300 160) rotate(-8)">${P('M0 -14L56 -34V34L0 14Z', '#ef4444', 'stroke="#b91c1c" stroke-width="3"')}${R(-22, -14, 22, 28, '#6b7384', 4)}</g>`, { cls: 'pop' });
    s.step(3, [400, 460, 510].map((x, i) => person({ x, y: 266, shirt: ['#22c55e', '#f59e0b', '#ec4899'][i], s: 0.7, fc: 'cheer', armR: [14, -46] })).join('') + L('M370 150Q420 130 470 150', '#2563eb', 3, 'stroke-dasharray="4 6"'), { cls: 'up' });
  }],
  ['refashion', '#ec4899', '낡은 옷을 잘라 꿰매 새로운 가방으로 다시 만든다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, P('M100 120L140 100H180L220 120L200 150L186 140V220H134V140L120 150Z', '#60a5fa', 'stroke="#2563eb" stroke-width="3"'), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(300 150) rotate(30)">${L('M0 0L50 -30', '#8a93a5', 5)}${L('M0 0L50 30', '#8a93a5', 5)}${C(-8, 0, 8, 'none', 'stroke="#ef4444" stroke-width="5"')}</g>` + L('M130 130L190 130', '#ef4444', 3, 'stroke-dasharray="5 6"'), { cls: 'pop', e: 2 });
    s.step(3, `<g transform="translate(400 220)">${R(-40, -50, 80, 60, '#60a5fa', 10, 'stroke="#2563eb" stroke-width="3"')}${L('M-24 -50Q0 -90 24 -50', '#2563eb', 6)}${L('M-30 -30H30', '#fff', 2, 'stroke-dasharray="4 4"')}</g>` + sparks(400, 160, 50, 64, '#ffd34d', 8, 3) + chk(500, 56), { cls: 'pop' });
  }],
  ['intertwine', '#16a34a', '두 가닥 줄이 서로 휘감겨 꼬이며 뒤얽힌다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, L('M80 130H480', '#ef4444', 14) + L('M80 190H480', '#3b82f6', 14), { cls: 'wipe' });
    s.step(2, L('M80 130Q140 130 180 160T280 160', '#ef4444', 14) + L('M80 190Q140 190 180 160T280 160', '#3b82f6', 14), { cls: 'wipe', e: 2 });
    s.step(3, L('M80 130Q130 190 180 160T280 190T380 130T480 160', '#ef4444', 14) + L('M80 190Q130 130 180 160T280 130T380 190T480 160', '#3b82f6', 14) + chk(500, 50), { cls: 'wipe' });
  }],
  ['shrub', '#16a34a', '나무보다 낮게 둥글게 자란 열매 달린 관목', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, tree(110, 252, 1.2) + tree(480, 254, 1.1), { cls: 'up' });
    s.step(2, bush(280, 252, 1.8), { cls: 'pop' });
    s.step(3, [[250, 200], [290, 190], [320, 212], [270, 222]].map(([x, y]) => C(x, y, 6, '#dc2626')).join('') + bird(330, 150, 1.2) + arrow(190, 130, 230, 170, '#16a34a', 4, 10), { cls: 'pop' });
  }],
  ['submerge', '#0ea5e9', '공을 손으로 눌러 물속 깊이 잠기게 한다', (s) => {
    s.sky('cool'); s.ground('water', 150);
    s.step(1, ball(280, 140, 22, '#ef4444') + L('M0 150Q40 142 80 150T160 150T240 150T320 150T400 150T480 150T560 150', '#e6f6ff', 3), { cls: 'up', e: 1 });
    s.step(2, `<g transform="translate(280 70)">${R(-12, -20, 60, 24, '#ffd7b5', 10, 'stroke="#e8b48c" stroke-width="2"')}</g>` + ball(280, 150, 22, '#ef4444'), { e: 2 });
    s.step(3, ball(280, 240, 22, '#ef4444') + [[250, 200], [270, 170], [300, 190]].map(([x, y]) => C(x, y, 6, '#fff', 'fill-opacity=".8" stroke="#cfeaff" stroke-width="2"')).join('') + arrow(380, 150, 380, 230, '#0ea5e9', 5, 12), { cls: 'up' });
  }],
  ['advent', '#ef4444', '텅 빈 승강장에 기차가 처음 들어오며 사람들이 환호하는 도래', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, L('M0 250H560', '#6b7384', 8) + R(40, 240, 480, 12, '#cbd5e1', 3), { cls: 'up' });
    s.mv(2, 'translateX(-340px)', train(380, 250), { d: 1.3, ease: 'cubic-bezier(.2,.6,.4,1)' });
    s.step(3, [90, 160].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#ec4899'][i], hs: i ? 'long' : 'short', fc: 'cheer', armR: [14, -50], s: 0.8 })).join('') + sparks(380, 150, 40, 56, '#ffd34d', 8, 3) + chk(500, 50), { cls: 'up' });
  }],
  ['affluent', '#ca8a04', '저택과 자동차, 흩뿌리는 동전으로 넉넉한 부유함', (s) => {
    s.sky('sun'); s.ground('grass', 246);
    s.step(1, house(130, 250, 150, '#f3d9b5', '#7c2d12') + crown(130, 36, 0.9), { cls: 'up' });
    s.step(2, car(400, 250, '#1f2937', 1.4) + sparks(400, 190, 60, 74, '#ffd34d', 6, 3), { cls: 'up' });
    s.step(3, person({ x: 280, y: 262, shirt: '#1f2937', pants: '#1f2937', hat: tie, fc: 'cheer', armL: [-30, -40], armR: [30, -40] }) + [[200, 100], [230, 70], [330, 80], [360, 110], [280, 60]].map(([x, y]) => coin(x, y, 12)).join(''), { cls: 'pop' });
  }],
  ['agenda', '#0d9488', '회의 칠판에 안건을 순서대로 적고 하나씩 확인해 나가는 의제', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(100, 50, 360, 160, '#2f6a3a', 8, 'stroke="#8c5a2a" stroke-width="8"'), { cls: 'up' });
    s.step(2, [0, 1, 2].map((i) => C(140, 92 + i * 40, 8, '#fff') + L(`M170 ${92 + i * 40}H${360 - i * 30}`, '#fff', 4)).join(''), { cls: 'wipe' });
    s.step(3, [0, 1, 2].map((i) => L(`M130 ${92 + i * 40}L138 ${100 + i * 40}L152 ${82 + i * 40}`, '#22c55e', 5)).join('') + person({ x: 490, y: 254, shirt: '#0d9488', fc: 'cheer', armL: [-60, -80] }), { cls: 'pop' });
  }],
  ['anarchy', '#7f1d1d', '신호등이 꺼지고 질서가 무너져 사람들이 뒤엉킨 무정부 상태', (s) => {
    s.sky('dusk'); s.ground('road', 246);
    s.step(1, `<g transform="translate(280 250)">${R(-5, -150, 10, 150, '#475569')}${R(-16, -170, 32, 60, '#1f2937', 6)}${C(0, -156, 8, '#ef4444')}${C(0, -140, 8, '#6b7280')}${C(0, -124, 8, '#22c55e')}</g>` + flag(100, 250, '#2563eb', 120), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(280 250) rotate(20)">${R(-5, -150, 10, 150, '#475569')}${R(-16, -170, 32, 60, '#1f2937', 6)}${C(0, -156, 8, '#6b7280')}${C(0, -140, 8, '#6b7280')}${C(0, -124, 8, '#6b7280')}</g>` + `<g transform="translate(100 250) rotate(-70 0 0)"><rect x="-2" y="-120" width="4" height="120" fill="#6b7384"/></g>`, { e: 2 });
    s.step(3, `<g transform="translate(280 250) rotate(40)">${R(-5, -150, 10, 150, '#475569')}${R(-16, -170, 32, 60, '#1f2937', 6)}</g>` + [150, 330, 430].map((x, i) => person({ x, y: 262, shirt: ['#ef4444', '#f59e0b', '#8b5cf6'][i], fc: 'shock', legs: 'walk', rot: i * 10 - 10, armL: [-30, -30], armR: [30, -30], s: 0.8 })).join('') + flame(480, 252, 1) + sparks(260, 230, 24, 40, '#ffd34d', 6, 3), { cls: 'up' });
  }],
  ['suppress', '#475569', '튀어나오려는 장난감 상자 뚜껑을 손으로 꾹 눌러 억누른다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(210, 190, 140, 62, '#f59e0b', 6) + `<g transform="translate(280 190)">${R(-14, -50, 28, 50, '#ef4444', 6)}${C(0, -64, 16, '#ffd7b5')}${C(-5, -66, 2.4, '#111')}${C(5, -66, 2.4, '#111')}</g>` + R(206, 180, 148, 12, '#a8774a', 4), { cls: 'up', e: 1 });
    s.step(2, R(210, 190, 140, 62, '#f59e0b', 6) + R(206, 176, 148, 14, '#a8774a', 4) + person({ x: 130, y: 254, shirt: '#475569', fc: 'angry', armR: [110, -50] }), { cls: 'up', e: 2 });
    s.step(3, R(210, 190, 140, 62, '#f59e0b', 6) + R(206, 176, 148, 14, '#a8774a', 4) + person({ x: 130, y: 254, shirt: '#475569', fc: 'angry', armR: [110, -50] }) + drop(150, 160, 0.8) + arrow(280, 90, 280, 150, '#475569', 6, 14), { });
  }],
  ['authenticate', '#16a34a', '지문을 대자 잠금이 풀리며 본인임을 증명해 인증된다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, phone(280, 230, 3) + R(240, 150, 80, 6, '#cbd5e1', 2), { cls: 'up' });
    s.step(2, `<g transform="translate(280 190)">${E(0, 0, 22, 28, 'none', 'stroke="#2563eb" stroke-width="4"')}${E(0, 0, 14, 20, 'none', 'stroke="#2563eb" stroke-width="3"')}${E(0, 0, 6, 12, 'none', 'stroke="#2563eb" stroke-width="3"')}</g>` + `<g transform="translate(340 150)">${R(-10, -10, 50, 24, '#ffd7b5', 10, 'stroke="#e8b48c" stroke-width="2"')}</g>`, { cls: 'pop' });
    s.step(3, chk(280, 190, 32) + sparks(280, 190, 44, 58, '#ffd34d', 8, 3) + lock(440, 160, 0.9, '#22c55e'), { cls: 'pop' });
  }],
  ['concur', '#2563eb', '두 사람이 똑같이 찬성을 말하고 고개를 끄덕이며 동의한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#2563eb', fc: 'cheer' }) + bubble(210, 100, 80, 50, '#fff', 'l') + L('M190 100L204 114L232 82', '#22c55e', 7), { cls: 'up' });
    s.step(2, person({ x: 430, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer' }) + bubble(350, 100, 80, 50, '#fff', 'r') + L('M330 100L344 114L372 82', '#22c55e', 7), { cls: 'up' });
    s.step(3, heart(280, 160, 1, '#ef4444') + L('M250 140H310M250 158H310', '#2563eb', 5, 'stroke-opacity="0"') + chk(280, 80, 24), { cls: 'pop' });
  }],
  ['bland', '#9ca3af', '간이 안 된 밍밍한 수프에 아무 감흥 없는 맛', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, table(380, 238, 220) + `<g transform="translate(380 226)">${P('M-44 -24H44L34 6Q0 20 -34 6Z', '#fff', 'stroke="#d6dbe5" stroke-width="3"')}${E(0, -24, 44, 8, '#e5e7eb')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 150, y: 254, shirt: '#9ca3af', fc: 'neutral', armR: [50, -20] }), { cls: 'up' });
    s.step(3, person({ x: 150, y: 254, shirt: '#9ca3af', fc: 'neutral', armR: [50, -20] }) + L('M120 120H180', '#9ca3af', 4) + cross(500, 56), { });
  }],
  ['benevolent', '#ec4899', '가난한 아이에게 따뜻하게 빵을 건네는 자애로운 마음', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#16a34a', fc: 'smile', armR: [50, -4] }) + `<ellipse cx="150" cy="156" rx="20" ry="6" fill="none" stroke="#facc15" stroke-width="5"/>`, { cls: 'up' });
    s.step(2, person({ x: 420, y: 262, shirt: '#94a3b8', s: 0.7, fc: 'sad', armL: [-20, -10] }), { cls: 'up' });
    s.mv(3, 'translateX(-90px)', bread(320, 200, 1.1), { d: 0.8 });
    s.step(3, heart(285, 120, 1, '#ef4444') + sparks(285, 130, 36, 50, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['consensus', '#16a34a', '모두의 손이 한가운데로 포개져 의견이 하나로 모이는 합의', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, [100, 200, 360, 460].map((x, i) => person({ x, y: 254, shirt: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'][i], hs: i % 2 ? 'long' : 'short', fc: 'think', s: 0.85, sh: false })).join(''), { cls: 'up' });
    s.step(2, [[130, 150], [220, 130], [340, 130], [430, 150]].map(([x, y]) => R(x - 16, y - 10, 32, 20, '#ffd7b5', 8, 'stroke="#e8b48c" stroke-width="2"')).join('') + arrow(150, 150, 250, 150, '#16a34a', 4, 10) + arrow(410, 150, 310, 150, '#16a34a', 4, 10), { cls: 'pop' });
    s.step(3, R(250, 130, 60, 40, '#ffd7b5', 10, 'stroke="#e8b48c" stroke-width="2"') + chk(280, 90, 24) + sparks(280, 150, 50, 66, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['convergence', '#7c3aed', '여러 방향의 선이 한 점으로 모여 만나는 수렴', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, [[60, 70], [500, 70], [60, 230], [500, 230], [280, 40], [280, 250]].map(([x, y]) => C(x, y, 9, '#7c3aed')).join(''), { cls: 'pop' });
    s.step(2, [[60, 70], [500, 70], [60, 230], [500, 230], [280, 40], [280, 250]].map(([x, y]) => L(`M${x} ${y}L${280 + (x - 280) * 0.5} ${150 + (y - 150) * 0.5}`, '#a78bfa', 4, 'stroke-dasharray="6 6"')).join(''), { cls: 'wipe' });
    s.step(3, [[60, 70], [500, 70], [60, 230], [500, 230], [280, 40], [280, 250]].map(([x, y]) => L(`M${x} ${y}L280 150`, '#7c3aed', 4)).join('') + star(280, 150, 16, '#ffd34d') + sparks(280, 150, 26, 40, '#ffd34d', 8, 3), { cls: 'wipe' });
  }],
  ['defective', '#dc2626', '바퀴가 빠지고 금이 간 불량 장난감은 반품 대상이다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(250 230)">${R(-50, -30, 100, 30, '#3b82f6', 8)}${P('M-26 -30L-14 -52H20L34 -30Z', '#60a5fa')}${C(-30, 2, 14, '#1f2937')}${C(30, 2, 14, '#1f2937')}</g>`, { cls: 'up', e: 1 });
    s.step(2, `<g transform="translate(250 230) rotate(-8)">${R(-50, -30, 100, 30, '#3b82f6', 8)}${P('M-26 -30L-14 -52H20L34 -30Z', '#60a5fa')}${C(-30, 2, 14, '#1f2937')}</g>` + C(310, 250, 14, '#1f2937') + L('M240 190L226 178M262 196L270 176', '#dc2626', 4), { e: 2 });
    s.step(3, `<g transform="translate(250 230) rotate(-8)">${R(-50, -30, 100, 30, '#3b82f6', 8)}${P('M-26 -30L-14 -52H20L34 -30Z', '#60a5fa')}${C(-30, 2, 14, '#1f2937')}</g>` + C(330, 252, 14, '#1f2937') + L('M0 0', '#000', 0.1, 'stroke-opacity="0"') + cross(500, 56) + person({ x: 130, y: 254, shirt: '#dc2626', fc: 'angry', armR: [60, -20] }), { });
  }],
  ['farsighted', '#0891b2', '쌍안경으로 아득히 먼 산을 또렷이 내다보는 선견지명', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, P('M300 250L400 120L500 250Z', '#94a3b8', 'stroke="#64748b" stroke-width="3"') + P('M380 150L400 120L420 152L406 156L400 146L392 158Z', '#fff'), { cls: 'up' });
    s.step(2, person({ x: 130, y: 262, shirt: '#0891b2', fc: 'smile', armR: [30, -52] }) + `<g transform="translate(176 190)">${R(-10, -8, 14, 22, '#1f2937', 4)}${R(8, -8, 14, 22, '#1f2937', 4)}</g>`, { cls: 'up' });
    s.step(3, L('M200 190L380 140', '#0891b2', 3, 'stroke-dasharray="5 6"') + C(420, 80, 34, 'none', 'stroke="#0891b2" stroke-width="4"') + star(420, 80, 10, '#ffd34d') + chk(500, 56), { cls: 'pop' });
  }],
  ['definitive', '#1e3a8a', '여럿 가운데 망치를 내리쳐 하나로 결정지은 확정적 결론', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [100, 220, 340].map((x, i) => bubble(x + 40, 90, 90, 50, '#fff', 'l') + qm(x + 40, 90, '#6366f1', 0.9)).join(''), { cls: 'pop', e: 2 });
    s.step(2, `<g transform="translate(420 130) rotate(-40)">${R(-4, 0, 8, 56, '#8c5a2a', 3)}${R(-22, -14, 44, 20, '#a8774a', 4)}</g>`, { cls: 'pop', e: 2 });
    s.step(3, `<g transform="translate(300 190) rotate(10)">${R(-4, 0, 8, 40, '#8c5a2a', 3)}${R(-22, -10, 44, 18, '#a8774a', 4)}</g>` + chk(280, 90, 34) + sparks(280, 90, 44, 58, '#ffd34d', 10, 3) + R(200, 238, 160, 12, '#a0602e', 3), { cls: 'pop' });
  }],
  ['degenerative', '#78716c', '젊은 몸이 해가 갈수록 구부정해지고 지팡이에 의지하는 퇴행', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#16a34a', fc: 'cheer' }), { cls: 'up' });
    s.step(2, person({ x: 280, y: 254, shirt: '#16a34a', fc: 'neutral', rot: 8, hair: '#9ca3af' }), { cls: 'up' });
    s.step(3, person({ x: 430, y: 254, shirt: '#16a34a', fc: 'sad', rot: 18, hair: '#e5e7eb', armR: [10, 30] }) + L('M456 190L462 254', '#8c6238', 6) + arrow(130, 100, 430, 130, '#78716c', 5, 14), { cls: 'up' });
  }],
  ['stipulate', '#0d9488', '계약서의 조건 항목에 밑줄을 긋고 서명해 명시한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, paper(280, 150, 220, 200, 0) + [100, 130, 160, 190].map((y) => L(`M190 ${y}H370`, '#aab4c6', 4)).join(''), { cls: 'up' });
    s.step(2, L('M190 130H350M190 190H330', '#dc2626', 5) + C(180, 130, 6, '#dc2626') + C(180, 190, 6, '#dc2626'), { cls: 'wipe' });
    s.step(3, L('M300 240Q320 220 336 238T370 230', '#2563eb', 3) + C(380, 200, 20, '#dc2626', 'fill-opacity=".85"') + star(380, 200, 9, '#fff') + pencil(420, 240, 1.2, 40), { cls: 'pop' });
  }],
  ['disproportionate', '#dc2626', '작은 못에 비해 터무니없이 큰 망치를 휘두르는 불균형', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(180, 230, 200, 22, '#c99a5b', 3) + R(276, 200, 8, 32, '#8a93a5', 1) + R(272, 196, 16, 6, '#8a93a5', 2), { cls: 'up' });
    s.step(2, `<g transform="translate(280 90) rotate(20)">${R(-8, 0, 16, 110, '#8c5a2a', 3)}${R(-70, -50, 140, 56, '#6b7384', 8)}</g>`, { cls: 'pop' });
    s.step(3, L('M200 200H360', '#dc2626', 4, 'stroke-opacity="0"') + cross(480, 56) + arrow(150, 150, 150, 220, '#dc2626', 4, 10) + L('M236 214L220 206M324 214L340 206', '#dc2626', 4), { cls: 'pop' });
  }],
  ['dormant', '#64748b', '겨울 동굴 속에서 곰이 겨울잠을 자듯 활동을 멈춘 휴면', (s) => {
    s.sky('night'); s.ground('snow', 250);
    s.step(1, P('M60 250Q120 90 260 110Q400 90 480 250Z', '#6b7384', 'stroke="#475569" stroke-width="4"') + P('M180 250Q200 160 280 160Q360 160 380 250Z', '#1f2937') + `<g fill="#fff">${C(60, 60, 3)}${C(500, 90, 3)}${C(150, 40, 3)}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(280 250)">${E(0, -20, 54, 28, '#8a5a2e')}${C(-40, -30, 24, '#8a5a2e')}${C(-52, -50, 8, '#8a5a2e')}${C(-30, -50, 8, '#8a5a2e')}${L('M-48 -32H-40M-34 -32H-26', '#111', 3)}${E(-34, -22, 10, 7, '#d9b48a')}</g>`, { cls: 'up' });
    s.step(3, moon(450, 70, 18, '#0f1730') + `<g fill="#fff" fill-opacity=".9">${[100, 220, 340, 460].map((x, i) => `<circle class="a-fall" style="animation-delay:-${i * 0.7}s" cx="${x}" cy="20" r="4"/>`).join('')}</g>`, { cls: 'pop' });
  }],
  ['dreary', '#6b7280', '잿빛 하늘에 비가 내리는 쓸쓸하고 음울한 풍경', (s) => {
    s.sky('gray'); s.ground('grass', 250);
    s.step(1, cloud(130, 60, 2, '#6b7384') + cloud(310, 50, 2.4, '#5b6577') + cloud(470, 70, 1.8, '#6b7384'), { cls: 'up' });
    s.step(2, `<g fill="#8fb4d8">${[70, 150, 230, 310, 390, 470].map((x, i) => `<path class="a-fall" style="animation-delay:-${(i * 0.5) % 3}s" d="M${x} 30c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>`, {});
    s.step(3, `<g transform="translate(150 252)">${L('M0 0V-90M0 -50L-30 -80M0 -66L26 -92', '#6b5a3a', 7)}</g>` + person({ x: 400, y: 262, shirt: '#6b7280', fc: 'sad', rot: 6, armR: [14, -52] }) + `<g transform="translate(414 150)">${P('M-44 0Q0 -50 44 0Z', '#475569')}${L('M0 0V40', '#8c6238', 3)}</g>`, { cls: 'up' });
  }],
  ['evade', '#0ea5e9', '날아오는 공을 몸을 홱 틀어 이리저리 피한다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 280, y: 262, shirt: '#0ea5e9', fc: 'shock' }) + ball(60, 160, 16, '#ef4444'), { cls: 'up', e: 1 });
    s.step(2, person({ x: 340, y: 262, shirt: '#0ea5e9', fc: 'cheer', rot: 18, armL: [-30, -20], armR: [30, -20] }) + ball(200, 170, 16, '#ef4444') + L('M80 160L180 170', '#ef4444', 3, 'stroke-dasharray="5 7"'), { e: 2 });
    s.step(3, person({ x: 340, y: 262, shirt: '#0ea5e9', fc: 'cheer', rot: 18, armL: [-30, -20], armR: [30, -20] }) + ball(480, 190, 16, '#ef4444') + L('M80 160L460 190', '#ef4444', 3, 'stroke-dasharray="5 7"') + chk(500, 56), { });
  }],
  ['faculty', '#7c3aed', '학사 가운에 책을 든 교수진이 대학 앞에 나란히 선 모습', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, `<g transform="translate(280 250)">${R(-100, -110, 200, 110, '#e8e4d8', 4, 'stroke="#c4bda8" stroke-width="3"')}${P('M-116 -110L0 -170L116 -110Z', '#9a7b3a')}${[-60, -20, 20, 60].map((x) => R(x - 7, -100, 14, 94, '#f4f1e6', 2)).join('')}</g>`, { cls: 'up' });
    s.step(2, [150, 230, 330, 410].map((x, i) => person({ x, y: 270, shirt: '#1f2937', pants: '#1f2937', s: 0.75, fc: 'smile', hs: i % 2 ? 'long' : 'short', hat: '<rect x="-20" y="-104" width="40" height="6" fill="#1f2937"/><path d="M-10 -98H10L8 -92H-8Z" fill="#1f2937"/>' })).join(''), { cls: 'up' });
    s.step(3, star(280, 40, 14) + sparks(280, 40, 24, 38, '#ffd34d', 8, 3) + book(120, 190, '#ef4444', 30, 20) + book(440, 190, '#3b82f6', 30, 20), { cls: 'pop' });
  }],
  ['demolition', '#7f1d1d', '쇠공이 휘둘러져 건물이 무너지고 먼지가 이는 철거', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, building(380, 250, 120, 190, '#9fb4d0') + `<g transform="translate(130 250)">${R(-30, -30, 60, 30, '#f59e0b', 4)}${R(-4, -190, 8, 160, '#6b7384')}${R(-4, -190, 100, 8, '#6b7384')}</g>`, { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(130 250)">${R(-30, -30, 60, 30, '#f59e0b', 4)}${R(-4, -190, 8, 160, '#6b7384')}${R(-4, -190, 100, 8, '#6b7384')}${L('M96 -186L190 -100', '#475569', 4)}${C(194, -94, 24, '#1f2937')}</g>` + building(380, 250, 120, 190, '#9fb4d0'), { e: 2 });
    s.step(3, P('M320 250L340 210L380 230L420 200L440 250Z', '#9ca3af') + C(340, 220, 30, '#cbd5e1', 'fill-opacity=".7"') + C(420, 210, 34, '#cbd5e1', 'fill-opacity=".7"') + sparks(380, 200, 50, 70, '#9ca3af', 10, 4) + `<g transform="translate(130 250)">${R(-30, -30, 60, 30, '#f59e0b', 4)}${R(-4, -190, 8, 160, '#6b7384')}${R(-4, -190, 100, 8, '#6b7384')}</g>`, { cls: 'pop' });
  }],
  ['frenzy', '#dc2626', '세일 문이 열리자 서로 밀치며 우르르 몰려드는 광란', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(400, 80, 120, 172, '#cfeaff', 6, 'stroke="#fff" stroke-width="6"') + R(410, 56, 100, 22, '#ef4444', 4) + door(460, 252, 60, 120, '#7a461f'), { cls: 'up' });
    s.step(2, [100, 190, 270].map((x, i) => person({ x, y: 262, shirt: ['#3b82f6', '#22c55e', '#f59e0b'][i], fc: 'shock', legs: 'walk', rot: -12, armL: [-30, -30], armR: [30, -30], s: 0.8 })).join('') + L('M60 150H140M60 180H120', '#dc2626', 4), { cls: 'up' });
    s.step(3, [[300, 90, '#fff'], [340, 60, '#fecaca'], [220, 80, '#fff'], [380, 120, '#fecaca']].map(([x, y, c]) => paper(x, y, 30, 40, 1, c)).join('') + sparks(380, 170, 30, 46, '#dc2626', 8, 4), { cls: 'pop' });
  }],
  ['discernible', '#0891b2', '안개 속 흐릿한 형체가 가까이 다가가자 또렷이 알아볼 수 있게 된다', (s) => {
    s.sky('gray'); s.ground('grass', 250);
    s.step(1, tree(420, 252, 1.4) + `<rect width="560" height="300" fill="#e5eaf0" fill-opacity=".75"/>`, { cls: 'up', e: 1 });
    s.step(2, tree(420, 252, 1.4) + `<rect width="560" height="300" fill="#e5eaf0" fill-opacity=".45"/>` + person({ x: 220, y: 262, shirt: '#0891b2', fc: 'think', legs: 'walk' }), { e: 2 });
    s.step(3, tree(420, 252, 1.4) + person({ x: 320, y: 262, shirt: '#0891b2', fc: 'cheer', legs: 'walk' }) + C(420, 100, 70, 'none', 'stroke="#0891b2" stroke-width="4"') + chk(500, 56), { });
  }],
  ['dysfunctional', '#dc2626', '톱니가 어긋나 연기와 불꽃을 내며 제대로 돌아가지 않는 고장', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-110, -140, 220, 140, '#6b7384', 10, 'stroke="#475569" stroke-width="3"')}${R(-90, -120, 180, 60, '#1f2937', 6)}</g>`, { cls: 'up' });
    s.step(2, gear(240, 150, 28, '#ca8a04') + gear(320, 150, 28, '#ca8a04') + L('M268 140L292 160', '#ef4444', 4, 'stroke-opacity="0"'), { cls: 'pop' });
    s.step(3, `<g fill="#6b7280" fill-opacity=".8">${C(280, 70, 18)}${C(300, 48, 14)}${C(262, 52, 12)}</g>` + sparks(280, 190, 30, 50, '#ffd34d', 8, 4) + cross(480, 56), { cls: 'pop' });
  }],
  ['fulfilling', '#ec4899', '나무를 다 심고 나서 마음이 가득 차올라 뿌듯해하는 보람', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 160, y: 262, shirt: '#16a34a', fc: 'neutral', armR: [40, 10] }) + `<g transform="translate(240 252)">${R(-12, -10, 24, 10, '#7a5230', 3)}${L('M0 -10V-30', '#3f8f3a', 4)}</g>`, { cls: 'up' });
    s.step(2, tree(300, 252, 0.9), { cls: 'up' });
    s.step(3, person({ x: 160, y: 262, shirt: '#16a34a', fc: 'cheer', armL: [-30, -50], armR: [30, -50] }) + heart(160, 100, 1.4, '#ef4444') + sparks(160, 110, 40, 56, '#ffd34d', 10, 3) + chk(500, 56), { cls: 'pop' });
  }],
  ['glimpse', '#7c3aed', '울타리 틈으로 토끼가 휙 지나가는 모습을 잠깐 흘끗 본다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, [150, 190, 230, 290, 330, 370, 410].map((x) => R(x - 6, 150, 12, 100, '#a8774a', 2)).join('') + R(138, 176, 284, 8, '#8c5a2a', 2), { cls: 'up' });
    s.step(2, person({ x: 70, y: 262, shirt: '#7c3aed', fc: 'think', armR: [30, -30], s: 0.9 }) + C(260, 190, 10, '#7c3aed', 'fill-opacity="0"'), { cls: 'up' });
    s.step(3, `<g transform="translate(260 220)">${E(0, 0, 14, 10, '#f4f6fa')}${C(12, -8, 8, '#f4f6fa')}${E(8, -22, 3, 10, '#f4f6fa')}${E(14, -22, 3, 10, '#f4f6fa')}</g>` + L('M200 200H240M190 220H236', '#7c3aed', 3) + sparks(260, 200, 24, 36, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['grin', '#f59e0b', '입을 귀까지 쭉 벌려 이를 드러내며 씩 웃는다', (s) => {
    s.sky('sun'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#f59e0b', fc: 'neutral' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 280, y: 254, shirt: '#f59e0b', fc: 'smile' }), { e: 2 });
    s.step(3, person({ x: 280, y: 254, shirt: '#f59e0b', fc: 'cheer' }) + P('M270 174Q280 188 290 174Z', '#fff', 'stroke="#2a1a12" stroke-width="1.6"') + sparks(280, 170, 30, 46, '#ffd34d', 8, 3) + star(360, 120, 10) + star(200, 110, 8), { });
  }],
  ['heritage', '#b45309', '조상이 지켜 온 옛집을 아이가 이어받아 소중히 간직하는 유산', (s) => {
    s.sky('warm'); s.ground('grass', 246);
    s.step(1, `<g transform="translate(300 250)">${R(-90, -60, 180, 60, '#c99a5b', 3)}${P('M-110 -60Q-60 -110 0 -90Q60 -110 110 -60Z', '#6b3a26')}${R(-20, -40, 40, 40, '#5a3a22', 3)}${[-64, 64].map((x) => R(x - 12, -46, 24, 24, '#f3e9c8', 2)).join('')}</g>`, { cls: 'up' });
    s.step(2, person({ x: 130, y: 262, shirt: '#94a3b8', hair: '#e5e7eb', fc: 'smile', armR: [50, -10] }), { cls: 'up' });
    s.step(3, person({ x: 220, y: 262, shirt: '#f59e0b', s: 0.7, fc: 'cheer', armL: [-20, -10] }) + `<g transform="translate(190 190)">${R(-12, -20, 24, 30, '#facc15', 5, 'stroke="#d99a00" stroke-width="2"')}${star(0, -6, 6, '#fff')}</g>` + heart(300, 90, 0.9, '#ef4444'), { cls: 'up' });
  }],
  ['impart', '#2563eb', '선생님 머리의 지식 불빛이 학생 머리로 옮겨져 전해진다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#2563eb', fc: 'cheer' }) + bulb(130, 120, 1.1) + person({ x: 430, y: 254, shirt: '#ec4899', hs: 'long', fc: 'think', s: 0.85 }), { cls: 'up' });
    s.mv(2, 'translateX(-180px)', C(310, 100, 14, '#ffd34d', 'stroke="#d99a00" stroke-width="2"'), { d: 1 });
    s.step(3, bulb(430, 130, 1.1) + sparks(430, 100, 40, 56, '#ffd34d', 8, 3) + person({ x: 430, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', s: 0.85 }) + L('M200 100Q300 70 400 100', '#2563eb', 3, 'stroke-dasharray="5 7"'), { });
  }],
  ['distress', '#dc2626', '폭풍 속 바다에 갇혀 신호탄을 쏘며 구조를 바라는 고난', (s) => {
    s.sky('gray'); s.ground('water', 190);
    s.step(1, `<g transform="translate(280 200) rotate(-8)">${P('M-70 0H70L50 26H-50Z', '#8c5a2a')}${R(-2, -80, 4, 80, '#6b4a2a')}${P('M2 -76L40 -10H2Z', '#f4f6fa')}</g>` + person({ x: 270, y: 196, shirt: '#dc2626', fc: 'shock', s: 0.5, legs: 'hide', armL: [-20, -30], armR: [20, -40], sh: false }), { cls: 'up' });
    s.step(2, L('M280 100L330 30', '#ff7a1a', 5) + C(334, 24, 10, '#ff7a1a') + sparks(334, 24, 16, 34, '#ffd34d', 8, 4) + cloud(120, 56, 1.8, '#4a5568') + cloud(430, 50, 2, '#3b4558'), { cls: 'pop' });
    s.step(3, P('M0 200Q40 180 80 200T160 200T240 200T320 200T400 200T480 200T560 200V300H0Z', '#0b6fa8', 'fill-opacity=".5"') + `<g transform="translate(470 100)">${E(0, 0, 50, 22, '#ef4444')}${R(-10, -34, 20, 14, '#cbd5e1', 3)}${L('M-60 -34H60', '#475569', 4)}</g>` + chk(500, 200), { cls: 'up' });
  }],
];
