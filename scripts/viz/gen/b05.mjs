import { T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, car, building, key, lock, thermo, tie } from './props.mjs';

const qmark = (x, y, col = '#6366f1', k = 1) => L(`M${x - 6 * k} ${y - 6 * k}Q${x - 6 * k} ${y - 14 * k} ${x} ${y - 14 * k}Q${x + 8 * k} ${y - 14 * k} ${x + 8 * k} ${y - 7 * k}Q${x + 8 * k} ${y - 2 * k} ${x + 2 * k} ${y + 1 * k}Q${x} ${y + 3 * k} ${x} ${y + 6 * k}M${x} ${y + 11 * k}V${y + 13 * k}`, col, 5 * k);
const glass = (x, y, lvl = 0.5) => `<g transform="translate(${x} ${y})"><path d="M-22 -60H22L18 0H-18Z" fill="#fff" fill-opacity=".6" stroke="#aab4c6" stroke-width="3"/><path d="M${-22 + (1 - lvl) * 4} ${-60 + (1 - lvl) * 60}H${22 - (1 - lvl) * 4}L18 0H-18Z" fill="#4fc3f7"/></g>`;

export default [
  ['conform', '#2563eb', '혼자 다른 색이던 사람이 무리와 똑같은 옷으로 맞춰 따른다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, [90, 190, 390, 490].map((x) => person({ x, y: 254, shirt: '#2563eb', fc: 'neutral' })).join(''), { cls: 'up' });
    s.step(1, person({ x: 290, y: 254, shirt: '#f59e0b', fc: 'smirk' }), { cls: 'up', e: 2 });
    s.step(2, arrow(290, 90, 290, 130, '#2563eb', 6, 14), { cls: 'wipe-d' });
    s.step(3, person({ x: 290, y: 254, shirt: '#2563eb', fc: 'smile' }), {});
    s.badge('check', 500, 50);
  }],
  ['tangible', '#0d9488', '점선으로만 있던 형태가 단단한 실물이 되어 손으로 만져진다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, R(230, 130, 100, 100, 'none', 6, 'stroke="#0d9488" stroke-width="4" stroke-dasharray="10 8"'), { cls: 'up', e: 2 });
    s.step(2, `<g transform="translate(130 200)">${R(-12, -14, 80, 28, '#ffd7b5', 12, 'stroke="#e8b48c" stroke-width="2.4"')}${L('M70 -4H84', '#e8b48c', 8)}</g>`, { cls: 'up', e: 2 });
    s.step(3, R(230, 130, 100, 100, '#0d9488', 6, 'stroke="#0a5c54" stroke-width="3"') + P('M230 130L260 106H360L330 130Z', '#14b8a6') + P('M330 130L360 106V206L330 230Z', '#0a8076'), { cls: 'pop' });
    s.step(3, `<g transform="translate(170 190)">${R(-12, -14, 70, 28, '#ffd7b5', 12, 'stroke="#e8b48c" stroke-width="2.4"')}</g>` + sparks(280, 170, 90, 106, '#ffd34d', 8, 4), {});
  }],
  ['embody', '#ec4899', '마음속 사랑이라는 생각이 조각상이라는 형체로 구현된다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 130, y: 254, shirt: '#ec4899', fc: 'think', armR: [16, -34] }) + E(250, 110, 70, 46, '#fff', 'stroke="#aab4c6" stroke-width="3"') + heart(250, 108, 1.2, '#ec4899'), { cls: 'up', e: 2 });
    s.step(2, arrow(300, 130, 380, 170, '#ec4899'), { cls: 'wipe' });
    s.step(3, R(360, 200, 120, 52, '#d6d0c0', 4) + R(350, 244, 140, 12, '#c4bda8', 3) + heart(420, 160, 2.2, '#f9a8d4') + sparks(420, 150, 70, 86, '#ffd34d', 8, 3), { cls: 'up' });
  }],
  ['intact', '#16a34a', '상자 속 꽃병이 충격에도 깨지지 않고 온전히 남는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, box(280, 252, 200, 120, '#c99a5b'), { cls: 'up' });
    s.step(2, P('M180 132L260 90L280 132Z', '#d6a86a') + P('M380 132L300 90L280 132Z', '#b98650'), { cls: 'up' });
    s.step(2, `<g transform="translate(280 200)">${P('M-20 -70H20L26 -30Q40 -10 20 0H-20Q-40 -10 -26 -30Z', '#60a5fa', 'stroke="#2563eb" stroke-width="3"')}${L('M-12 -40Q0 -30 12 -40', '#fff', 3)}</g>`, { cls: 'up' });
    s.step(3, sparks(280, 150, 80, 98, '#ffd34d', 10, 4) + `<g transform="translate(470 70)"><circle r="22" fill="#22c55e" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`, { cls: 'pop' });
  }],
  ['confine', '#475569', '울타리에 갇혀 좁은 곳에 가두어진 사람', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#475569', fc: 'smile' }), { cls: 'up' });
    s.step(2, [200, 240, 280, 320, 360].map((x) => R(x - 5, 120, 10, 140, '#6b7384', 3)).join('') + R(190, 120, 180, 10, '#6b7384', 3), { cls: 'wipe-d' });
    s.step(3, person({ x: 280, y: 254, shirt: '#475569', fc: 'sad', armL: [-10, -20], armR: [10, -20] }), {});
    s.step(3, [200, 240, 280, 320, 360].map((x) => R(x - 5, 120, 10, 140, '#6b7384', 3)).join(''), { });
  }],
  ['anecdote', '#f59e0b', '친구들에게 짧고 재미난 지난 일화를 들려주며 웃는다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 140, y: 254, shirt: '#f59e0b', fc: 'cheer', armR: [30, -20] }), { cls: 'up' });
    s.step(2, bubble(250, 110, 150, 90, '#fff', 'l') + house(240, 130, 50, '#f3d9b5', '#c0392b', 0.8) + sun(290, 82, 10, '#ffd34d') + person({ x: 285, y: 140, shirt: '#3b82f6', s: 0.35, sh: false }), { cls: 'pop' });
    s.step(3, person({ x: 400, y: 254, shirt: '#3b82f6', fc: 'cheer' }) + person({ x: 490, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer' }) + L('M380 160L368 148M420 160L432 148M470 160L458 148M510 160L522 148', '#f59e0b', 4), { cls: 'up' });
  }],
  ['pledge', '#dc2626', '손을 들고 가슴에 얹어 굳게 맹세한다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, flag(420, 250, '#2563eb', 170), { cls: 'up' });
    s.step(1, person({ x: 200, y: 260, shirt: '#dc2626', fc: 'neutral' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 200, y: 260, shirt: '#dc2626', fc: 'smile', armR: [20, -62], armL: [10, -16] }), { e: 3 });
    s.step(3, sparks(200, 150, 60, 78, '#ffd34d', 10, 4) + heart(200, 56, 0.8, '#ef4444'), { cls: 'pop' });
  }],
  ['temperate', '#16a34a', '덥지도 춥지도 않은 온화한 봄 날씨', (s) => {
    s.sky('day'); s.ground('grass', 240);
    s.step(1, thermo(110, 252, 0.5, '#22c55e'), { cls: 'up' });
    s.step(2, sun(330, 76, 28, '#ffd34d') + cloud(400, 90, 1.2, '#fff'), { cls: 'pop' });
    s.step(3, tree(250, 252, 1.1) + `<g>${C(160, 252, 5, '#f472b6')}${C(180, 258, 5, '#facc15')}${C(330, 256, 5, '#f472b6')}${C(360, 250, 5, '#fff')}</g>` + bird(440, 150, 1.4), { cls: 'up' });
    s.badge('check', 500, 250, 3);
  }],
  ['mock', '#b91c1c', '우스운 모자를 쓴 사람을 가리키며 비웃어 놀린다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 420, y: 254, shirt: '#6b7280', fc: 'sad', hat: '<path d="M-14 -94L0 -134L14 -94Z" fill="#ef4444"/><circle cx="0" cy="-136" r="5" fill="#facc15"/>' }), { cls: 'up' });
    s.step(2, person({ x: 110, y: 254, shirt: '#3b82f6', fc: 'cheer', armR: [60, -10] }) + person({ x: 220, y: 254, shirt: '#ec4899', hs: 'long', fc: 'cheer', armR: [50, -20] }), { cls: 'up' });
    s.step(3, L('M90 150L78 136M130 150L142 136M200 150L188 136M240 150L252 136', '#f59e0b', 4) + drop(442, 160, 0.8), { cls: 'pop' });
    s.badge('x', 500, 50);
  }],
  ['disclose', '#0ea5e9', '잠긴 상자가 열리며 숨겨 둔 내용이 환히 드러난다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, R(210, 180, 140, 72, '#8c5a2a', 6, 'stroke="#5a3a1a" stroke-width="3"') + P('M210 180Q210 150 280 150Q350 150 350 180Z', '#a8774a', 'stroke="#5a3a1a" stroke-width="3"') + lock(280, 190, 0.8), { cls: 'up' });
    s.step(2, `<path d="M210 180L190 120H370L350 180Z" fill="#ffe9a0" fill-opacity=".5"/>`, { cls: 'wipe-d' });
    s.step(3, paper(280, 100, 80, 90, 3) + star(280, 100, 12) + sparks(280, 100, 60, 76, '#ffd34d', 8, 4) + person({ x: 90, y: 254, shirt: '#0ea5e9', fc: 'shock' }), { cls: 'pop' });
  }],
  ['signify', '#16a34a', '올리브 가지를 문 비둘기가 평화를 뜻하는 상징이 된다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, `<g transform="translate(150 150)">${E(0, 0, 40, 24, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${C(34, -14, 16, '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${P('M48 -14L62 -10L48 -6Z', '#f59e0b')}${C(40, -16, 2.4, '#2a1a12')}${P('M-10 -14Q-50 -60 -20 -40Z', '#e5e9f0')}${L('M44 -6Q70 10 90 -4', '#16a34a', 4)}${P('M70 6Q76 -6 84 4Z M82 -4Q88 -16 94 -2Z', '#4fa04a')}</g>`, { cls: 'up' });
    s.step(2, arrow(240, 150, 330, 150, '#16a34a', 6, 14), { cls: 'wipe' });
    s.step(3, person({ x: 380, y: 258, shirt: '#3b82f6', armR: [34, -10], s: 0.85 }) + person({ x: 470, y: 258, shirt: '#ef4444', armL: [-34, -10], s: 0.85 }) + heart(425, 140, 0.9, '#ef4444'), { cls: 'up' });
  }],
  ['flourish', '#16a34a', '어린 싹이 자라 꽃과 열매로 가득한 무성한 나무로 번창한다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, tree(280, 252, 0.4), { cls: 'up', e: 1 });
    s.step(2, tree(280, 252, 0.8), { e: 2 });
    s.step(3, tree(280, 252, 1.3) + [[230, 120], [320, 100], [280, 140], [250, 90], [340, 140]].map(([x, y]) => C(x, y, 7, '#f472b6')).join('') + apple(210, 160, 0.8) + apple(350, 170, 0.8), { });
    s.step(3, bird(430, 90, 1.3) + sun(480, 56, 22, '#fff3a8') + sparks(480, 56, 30, 42, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['sole', '#ca8a04', '황량한 사막에 단 하나만 남은 외로운 나무', (s) => {
    s.sky('sun'); s.ground('sand', 244);
    s.step(1, sun(440, 70, 30, '#ffb347'), { cls: 'pop' });
    s.step(2, tree(280, 252, 1.2), { cls: 'up' });
    s.step(3, `<circle cx="280" cy="150" r="100" fill="#ffe9a0" fill-opacity=".3"/>` + star(280, 36, 14) + L('M100 260L120 244M160 262L176 250M420 262L440 246', '#a8742a', 4), { cls: 'pop' });
  }],
  ['divine', '#facc15', '구름 사이로 빛이 내려와 후광을 두른 천사가 나타나는 신성한 모습', (s) => {
    s.sky('day'); s.ground('grass', 252);
    s.step(1, cloud(140, 80, 2.2, '#fff') + cloud(420, 70, 2, '#fff') + cloud(280, 40, 2.4, '#fff'), { cls: 'up' });
    s.step(2, `<path d="M240 50L160 250H400L320 50Z" fill="#fff3b8" fill-opacity=".45"/>`, { cls: 'wipe-d' });
    s.step(3, `<g transform="translate(280 150)">${P('M-8 -10Q-70 -50 -62 10Q-30 0 -8 8Z', '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${P('M8 -10Q70 -50 62 10Q30 0 8 8Z', '#fff', 'stroke="#d6dbe5" stroke-width="2"')}${R(-14, -10, 28, 50, '#fff', 12, 'stroke="#e5e9f0" stroke-width="2"')}${C(0, -30, 15, '#ffd7b5')}<ellipse cx="0" cy="-54" rx="18" ry="5" fill="none" stroke="#facc15" stroke-width="5"/></g>` + sparks(280, 130, 66, 84, '#ffd34d', 10, 4), { cls: 'pop' });
  }],
  ['revenue', '#16a34a', '가게로 동전이 흘러들어 매출 그래프가 오른다', (s) => {
    s.sky('sun'); s.ground('stone', 246);
    s.step(1, `<g transform="translate(130 246)">${R(-70, -80, 140, 80, '#e8d0b0', 3)}${P('M-80 -80L-60 -110H60L80 -80Z', '#ef4444')}${R(-50, -56, 36, 56, '#8c5a2a', 3)}${R(0, -60, 50, 34, '#cfeaff', 3, 'stroke="#fff" stroke-width="3"')}</g>`, { cls: 'up' });
    s.step(2, `<g fill="#ffd34d" stroke="#d99a00" stroke-width="2">${[[230, 190], [260, 176], [290, 196]].map(([x, y]) => C(x, y, 11)).join('')}</g>` + arrow(200, 200, 320, 200, '#16a34a'), { cls: 'wipe' });
    s.step(3, R(340, 90, 150, 140, '#fff', 8, 'stroke="#b9c1cf" stroke-width="3"') + L('M360 210L390 180L420 190L470 120', '#16a34a', 6) + C(470, 120, 6, '#16a34a') + C(360, 210, 4, '#16a34a') + R(356, 216, 120, 3, '#aab4c6'), { cls: 'pop' });
    s.badge('up', 500, 40);
  }],
  ['corrupt', '#7f1d1d', '돈주머니의 무게로 정의의 저울이 한쪽으로 기울어 부패한다', (s) => {
    s.sky('dark'); s.ground('dark', 262);
    s.step(1, R(276, 90, 8, 172, '#8a6a2a') + R(210, 254, 140, 10, '#8a6a2a', 3) + `<g transform="translate(280 94)">${R(-110, -4, 220, 8, '#b88a2a', 4)}${L('M-100 4L-120 70M-100 4L-80 70M100 4L80 70M100 4L120 70', '#b88a2a', 2)}${E(-100, 72, 30, 6, '#ffd34d', 'stroke="#b88a2a" stroke-width="2"')}${E(100, 72, 30, 6, '#ffd34d', 'stroke="#b88a2a" stroke-width="2"')}</g>`, { cls: 'up', e: 2 });
    s.step(2, bag(180, 150, 1.3, '#d9772e'), { cls: 'pop' });
    s.step(3, R(276, 90, 8, 172, '#8a6a2a') + R(210, 254, 140, 10, '#8a6a2a', 3) + `<g transform="translate(280 94) rotate(-14)">${R(-110, -4, 220, 8, '#b88a2a', 4)}${L('M-100 4L-120 70M-100 4L-80 70M100 4L80 70M100 4L120 70', '#b88a2a', 2)}${E(-100, 72, 30, 6, '#ffd34d', 'stroke="#b88a2a" stroke-width="2"')}${E(100, 72, 30, 6, '#ffd34d', 'stroke="#b88a2a" stroke-width="2"')}</g>`, {});
    s.step(3, bag(172, 230, 1.3, '#d9772e') + C(400, 220, 20, '#7f1d1d', 'fill-opacity=".6"'), { });
    s.badge('x', 500, 50);
  }],
  ['cognitive', '#8b5cf6', '머릿속 두뇌 속 톱니바퀴가 돌며 생각하는 인지 활동', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 170, y: 254, shirt: '#8b5cf6', fc: 'think' }), { cls: 'up' });
    s.step(2, `<g transform="translate(330 120)"><path d="M-60 10Q-80 -30 -40 -50Q-10 -70 24 -54Q70 -40 66 0Q64 36 20 40Q-20 56 -60 10Z" fill="#f9a8d4" stroke="#db2777" stroke-width="3"/>${L('M-30 -20Q0 -30 30 -10M-20 10Q10 0 40 20', '#db2777', 3)}</g>`, { cls: 'pop' });
    s.step(3, gear(310, 120, 20, '#8b5cf6') + gear(356, 130, 14, '#f59e0b') + bulb(430, 130, 0.9) + L('M222 130Q250 120 270 120', '#8b5cf6', 3, 'stroke-dasharray="6 6"'), { cls: 'pop' });
  }],
  ['hinder', '#475569', '발목에 쇠공이 묶여 앞으로 나아가려 해도 끌려 방해받는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 330, y: 254, shirt: '#3b82f6', fc: 'angry', legs: 'walk', armL: [-26, 24], armR: [26, -14], rot: 8 }), { cls: 'up' });
    s.step(2, L('M310 250Q250 266 190 252', '#6b7384', 5, 'stroke-dasharray="1 8"') + C(166, 236, 28, '#2a2e3a') + C(158, 228, 6, '#fff', 'fill-opacity=".3"'), { cls: 'pop' });
    s.step(3, arrow(420, 150, 500, 150, '#3b82f6', 5) + L('M395 120L410 110M400 140L418 138', '#ef4444', 4) + drop(300, 160, 0.8), { cls: 'wipe' });
  }],
  ['controversy', '#dc2626', '한 가지 주제를 두고 찬성과 반대로 갈려 논란이 벌어진다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, E(280, 80, 56, 34, '#fff', 'stroke="#aab4c6" stroke-width="3"') + qmark(280, 80, '#6366f1', 1.2), { cls: 'pop' });
    s.step(2, [90, 170].map((x, i) => person({ x, y: 254, shirt: '#22c55e', fc: 'cheer', hs: i ? 'long' : 'short', armR: [14, -52] })).join('') + `<g transform="translate(130 140)"><circle r="22" fill="#22c55e" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`, { cls: 'up' });
    s.step(3, [390, 470].map((x, i) => person({ x, y: 254, shirt: '#ef4444', fc: 'angry', hs: i ? 'long' : 'short', armL: [-14, -52] })).join('') + `<g transform="translate(430 140)"><circle r="22" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>` + `<path d="M280 150L262 190H284L270 232L306 180H286Z" fill="#ffd34d"/>`, { cls: 'up' });
  }],
  ['flattery', '#f59e0b', '윗사람에게 입에 발린 칭찬을 늘어놓아 비위를 맞춘다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 400, y: 254, shirt: '#1f2937', pants: '#1f2937', fc: 'smirk', hat: tie, s: 1.1 }), { cls: 'up' });
    s.step(2, person({ x: 150, y: 254, shirt: '#f59e0b', fc: 'cheer', rot: 8, armL: [-16, 24], armR: [-20, 10] }) + bubble(250, 100, 100, 54, '#fff', 'l') + star(228, 100, 9) + heart(252, 100, 0.45, '#ef4444') + star(276, 100, 9), { cls: 'up' });
    s.step(3, coin(120, 200, 11) + sparks(400, 150, 70, 86, '#ffd34d', 8, 4) + heart(470, 100, 0.9, '#ef4444'), { cls: 'pop' });
  }],
  ['subjective', '#7c3aed', '같은 반 잔 물을 보고도 한 사람은 가득, 한 사람은 텅 빈 것으로 느낀다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, glass(280, 250, 0.5), { cls: 'up' });
    s.step(2, person({ x: 100, y: 254, shirt: '#22c55e', fc: 'cheer' }) + person({ x: 460, y: 254, shirt: '#ef4444', fc: 'sad' }), { cls: 'up' });
    s.step(3, bubble(120, 100, 76, 60, '#fff', 'l') + glass(120, 126, 0.9) + bubble(440, 100, 76, 60, '#fff', 'r') + glass(440, 126, 0.1), { cls: 'pop' });
  }],
  ['trivial', '#6b7280', '작은 부스러기를 두고 호들갑을 떨지만 곁의 사람은 하품한다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, C(280, 232, 4, '#c99a5b') + C(290, 236, 3, '#c99a5b'), { cls: 'pop' });
    s.step(2, person({ x: 160, y: 254, shirt: '#6b7280', fc: 'shock', armR: [60, 20] }) + magnifier(250, 214, 1.2), { cls: 'up' });
    s.step(3, person({ x: 420, y: 254, shirt: '#14b8a6', fc: 'yawn', armR: [-10, -30] }) + L('M380 150L364 140M460 150L476 140', '#6b7280', 4), { cls: 'up' });
  }],
  ['accord', '#2563eb', '두 사람이 합의해 서류 위에서 손을 맞잡는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 110, y: 254, shirt: '#2563eb', armR: [40, 6] }) + person({ x: 450, y: 254, shirt: '#16a34a', hs: 'long', armL: [-40, 6] }), { cls: 'up' });
    s.step(2, paper(280, 190, 110, 130, 3), { cls: 'up' });
    s.step(3, `<g transform="translate(280 150)">${R(-40, -8, 52, 16, '#ffd7b5', 8, 'stroke="#e8b48c" stroke-width="2"')}${R(-12, -8, 52, 16, '#f0c6a4', 8, 'stroke="#e8b48c" stroke-width="2"')}</g>` + heart(280, 100, 0.9, '#ef4444'), { cls: 'pop' });
    s.badge('check', 500, 56);
  }],
  ['sewage', '#78716c', '길가 하수구로 들어간 더러운 물이 땅속 관을 거쳐 정화조로 흐른다', (s) => {
    s.sky('gray'); s.ground('soil', 150);
    s.step(1, `<rect x="0" y="130" width="560" height="22" fill="#6b7384"/>` + R(80, 128, 70, 8, '#475569', 2) + L('M92 128V136M106 128V136M120 128V136M134 128V136', '#1f2937', 3), { cls: 'up' });
    s.step(2, R(0, 190, 380, 36, '#475569', 14) + R(8, 198, 364, 20, '#8a6a3a', 10) + L('M60 208H340', '#c9a37a', 4, 'stroke-dasharray="14 12"') + L('M114 136V198', '#8a6a3a', 6) + arrow(40, 208, 330, 208, '#fef3c7', 4, 12), { cls: 'wipe' });
    s.step(3, R(380, 170, 120, 80, '#9fb4d0', 6, 'stroke="#5f7694" stroke-width="3"') + R(386, 210, 108, 34, '#4fc3f7', 4) + R(380, 190, 8, 20, '#475569') + L('M500 232H540', '#4fc3f7', 10), { cls: 'up' });
    s.badge('check', 500, 56);
  }],
  ['reconciliation', '#16a34a', '다투던 두 사람이 서로 화해하고 따뜻하게 껴안는다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, person({ x: 170, y: 258, shirt: '#3b82f6', fc: 'angry', rot: -4 }) + person({ x: 390, y: 258, shirt: '#ef4444', fc: 'angry', hs: 'long', rot: 4 }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 220, y: 258, shirt: '#3b82f6', fc: 'sad', armR: [30, -4] }) + person({ x: 340, y: 258, shirt: '#ef4444', fc: 'sad', hs: 'long', armL: [-30, -4] }), { e: 2 });
    s.step(3, person({ x: 262, y: 258, shirt: '#3b82f6', fc: 'cheer', armR: [30, -18] }) + person({ x: 298, y: 258, shirt: '#ef4444', fc: 'cheer', hs: 'long', armL: [-30, -18] }) + heart(280, 110, 1.1, '#ef4444') + sun(470, 66, 24, '#ffd34d'), { cls: '' });
  }],
  ['warrant', '#1d4ed8', '경찰이 도장 찍힌 영장을 내밀자 문이 열린다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, door(440, 252, 80, 160, '#7a461f'), { cls: 'up' });
    s.step(1, person({ x: 160, y: 254, shirt: '#1d4ed8', pants: '#1e293b', armR: [60, -26], hat: '<path d="M-18 -92Q0 -116 18 -92Z" fill="#1d4ed8"/><rect x="-22" y="-94" width="44" height="6" rx="3" fill="#1d4ed8"/>' }), { cls: 'up' });
    s.step(2, paper(290, 150, 90, 110, 3) + C(290, 188, 14, '#dc2626', 'fill-opacity=".85"') + star(290, 188, 8, '#fff'), { cls: 'pop' });
    s.step(3, `<path d="M400 252V92L430 80V252Z" fill="#ffe9a0" fill-opacity=".8"/>` + sparks(440, 100, 50, 64, '#ffd34d', 6, 3), { });
  }],
  ['complement', '#ea580c', '서로 모자란 반쪽이 맞물려 하나의 온전한 원이 된다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.mv(1, 'translateX(-120px)', P('M280 100A60 60 0 0 0 280 220Z', '#3b82f6'), { d: 1, appear: true });
    s.mv(1, 'translateX(120px)', P('M280 100A60 60 0 0 1 280 220Z', '#f97316'), { d: 1 });
    s.step(2, arrow(130, 160, 200, 160, '#475569') + arrow(430, 160, 360, 160, '#475569'), { cls: 'wipe', e: 2 });
    s.step(3, sparks(280, 160, 76, 96, '#ffd34d', 12, 4) + star(480, 70, 12), { cls: 'pop' });
  }],
  ['halt', '#dc2626', '손을 든 신호에 달리던 차가 급히 멈춰 선다', (s) => {
    s.sky('day'); s.ground('road', 240);
    s.step(1, L('M0 270H560', '#fff', 4, 'stroke-dasharray="26 18" stroke-opacity=".8"'), { });
    s.mv(1, 'translateX(-200px)', car(220, 250, '#3b82f6', 1.3), { d: 1 });
    s.step(2, person({ x: 470, y: 238, shirt: '#f59e0b', fc: 'angry', armR: [20, -52], hat: '<rect x="-14" y="-98" width="28" height="6" fill="#f59e0b"/>' }) + `<g transform="translate(400 150)">${R(-3, 0, 6, 70, '#6b7384')}${P('M-22 -18L-8 -34H8L22 -18V0L8 16H-8L-22 0Z', '#dc2626', 'stroke="#fff" stroke-width="3"')}</g>`, { cls: 'up' });
    s.step(3, L('M80 276L160 276M70 266L150 266', '#2a2e3a', 5, 'stroke-opacity=".5"') + sparks(300, 230, 20, 36, '#ffd34d', 6, 4), { cls: 'pop' });
  }],
  ['ponder', '#6366f1', '턱을 괴고 앉아 물음표를 곱씹으며 곰곰이 생각한다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(180 254)">${shadow(0, 8, 40)}${R(-40, -40, 80, 14, '#8a93a5', 6)}${R(-12, -26, 24, 28, '#6b7384')}</g>` + person({ x: 180, y: 214, shirt: '#6366f1', fc: 'think', legs: 'hide', armR: [16, -34], armL: [-10, 24], sh: false }), { cls: 'up' });
    s.step(2, C(240, 150, 5, '#fff', 'stroke="#aab4c6" stroke-width="2"') + C(262, 128, 8, '#fff', 'stroke="#aab4c6" stroke-width="2"'), { cls: 'pop' });
    s.step(3, E(360, 100, 90, 56, '#fff', 'stroke="#aab4c6" stroke-width="3"') + qmark(360, 100, '#6366f1', 1.4) + gear(300, 100, 10, '#aab4c6') + gear(420, 90, 8, '#aab4c6'), { cls: 'pop' });
  }],
];
