import { book, T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, gear, clock, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, cup, note, pencil, bulb, magnifier, ball, dog, bird, cat, car, building, key, lock, thermo, phone, coinStack, stamp, tie } from './props.mjs';

const chk = (x, y, r = 22, col = '#22c55e') => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="3"/><path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
const cross = (x, y, r = 22) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#ef4444" stroke="#fff" stroke-width="3"/><path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>`;
const vase = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${P('M-20 -70H20L26 -30Q40 -10 20 0H-20Q-40 -10 -26 -30Z', '#60a5fa', 'stroke="#2563eb" stroke-width="3"')}${L('M-12 -40Q0 -30 12 -40', '#fff', 3)}</g>`;
const flowerBloom = (x, y, k = 1, col = '#f472b6') => `<g transform="translate(${x} ${y}) scale(${k})">${L('M0 0V-80', '#3f8f3a', 6)}${P('M0 -30C-22 -44 -38 -30 -24 -16Z M0 -44C22 -58 38 -44 24 -30Z', '#5fb85a')}${[0, 1, 2, 3, 4].map((i) => C(Math.cos((i / 5) * 6.28) * 18, -90 + Math.sin((i / 5) * 6.28) * 18, 13, col)).join('')}${C(0, -90, 10, '#facc15')}</g>`;

export default [
  ['amplify', '#0ea5e9', '작은 목소리가 확성기를 거쳐 크게 울려 퍼진다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, person({ x: 120, y: 254, shirt: '#0ea5e9', fc: 'cheer', armR: [24, -12] }) + L('M160 160Q168 168 160 176', '#0ea5e9', 3), { cls: 'up' });
    s.step(2, `<g transform="translate(210 150) rotate(-8)">${P('M0 -14L56 -34V34L0 14Z', '#ef4444', 'stroke="#b91c1c" stroke-width="3"')}${R(-22, -14, 22, 28, '#6b7384', 4)}</g>`, { cls: 'pop' });
    s.step(3, `<g fill="none" stroke="#0ea5e9" stroke-linecap="round"><path d="M300 150Q326 120 300 90" stroke-width="5"/><path d="M330 160Q376 120 330 70" stroke-width="6"/><path d="M360 170Q430 120 360 50" stroke-width="7"/><path d="M390 180Q490 120 390 30" stroke-width="8"/></g>`, { cls: 'wipe' });
  }],
  ['contradict', '#dc2626', '한 사람이 맞다고 하자 다른 사람이 아니라고 맞받아 부딪친다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 110, y: 254, shirt: '#3b82f6', fc: 'cheer' }) + bubble(190, 100, 90, 56, '#fff', 'l') + L('M168 100L184 116L212 80', '#22c55e', 8), { cls: 'up' });
    s.step(2, person({ x: 450, y: 254, shirt: '#ef4444', hs: 'long', fc: 'angry' }) + bubble(370, 100, 90, 56, '#fff', 'r') + L('M350 82L390 118M390 82L350 118', '#ef4444', 8), { cls: 'up' });
    s.step(3, `<path d="M280 120L262 160H284L270 202L306 150H286Z" fill="#ffd34d"/>` + L('M240 120L226 110M320 120L334 110', '#dc2626', 4), { cls: 'pop' });
  }],
  ['falsify', '#7f1d1d', '서류의 숫자를 몰래 고쳐 가짜 도장을 찍어 위조한다', (s) => {
    s.sky('dark'); s.ground('floor', 252);
    s.step(1, paper(190, 150, 130, 160, 5), { cls: 'up' });
    s.step(2, L('M150 120H230', '#dc2626', 5) + pencil(250, 130, 1.4, 30) + `<g transform="translate(150 190)">${R(-10, -6, 40, 14, '#f9a8d4', 4)}</g>`, { cls: 'pop' });
    s.step(3, C(190, 190, 22, '#dc2626', 'fill-opacity=".8"') + star(190, 190, 10, '#fff') + magnifier(380, 140, 1.3) + cross(380, 82) + L('M340 190L330 200M420 190L430 200', '#7f1d1d', 4), { cls: 'pop' });
  }],
  ['affection', '#ec4899', '강아지를 품에 안고 쓰다듬으며 따뜻한 애정을 나눈다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 170, y: 254, shirt: '#ec4899', hs: 'long', fc: 'smile', armR: [30, 4] }) + dog(380, 252, 1.8), { cls: 'up' });
    s.step(2, `<g transform="translate(260 190)">${R(-10, -14, 70, 28, '#ffd7b5', 12, 'stroke="#e8b48c" stroke-width="2.4"')}</g>`, { cls: 'up' });
    s.step(3, heart(290, 110, 1.2, '#ef4444') + heart(240, 140, 0.7, '#ec4899') + heart(340, 140, 0.7, '#ec4899') + sparks(290, 120, 50, 64, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['bid', '#ca8a04', '경매에서 손을 번쩍 들어 값을 부르고 망치가 내리쳐진다', (s) => {
    s.sky('wall'); s.ground('carpet', 252);
    s.step(1, R(210, 190, 140, 62, '#7a461f', 4) + vase(280, 190, 1.2) + person({ x: 430, y: 254, shirt: '#1f2937', pants: '#1f2937', hat: tie, armL: [-30, -10] }) + `<g transform="translate(404 190) rotate(-30)">${R(-18, -8, 30, 16, '#8c5a2a', 3)}${R(-2, -26, 6, 24, '#8c5a2a', 3)}</g>`, { cls: 'up' });
    s.step(2, [70, 150].map((x, i) => person({ x, y: 254, shirt: ['#3b82f6', '#22c55e'][i], fc: 'cheer', armR: [14, -56] })).join('') + R(76, 108, 22, 18, '#fff', 2, 'stroke="#aab4c6" stroke-width="2"') + R(156, 108, 22, 18, '#fff', 2, 'stroke="#aab4c6" stroke-width="2"'), { cls: 'up' });
    s.step(3, coin(280, 100, 16) + coin(310, 90, 14) + sparks(280, 130, 90, 104, '#ffd34d', 10, 4), { cls: 'pop' });
  }],
  ['temperament', '#7c3aed', '같은 일에도 차분한 사람과 불같은 사람의 타고난 성격이 다르다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(240, 214, 80, 12, '#a0602e', 4) + cup(280, 214, 1.2), { cls: 'up', e: 2 });
    s.step(2, drop(290, 190, 1.2, '#7c4a2a') + drop(310, 200, 1, '#7c4a2a') + E(300, 230, 40, 8, '#7c4a2a', 'fill-opacity=".7"'), { cls: 'pop' });
    s.step(2, person({ x: 120, y: 254, shirt: '#3b82f6', fc: 'smile' }) + person({ x: 460, y: 254, shirt: '#ef4444', fc: 'angry', skin: '#ff9a86', hs: 'long' }), { cls: 'up' });
    s.step(3, `<g fill="none" stroke="#3b82f6" stroke-width="5" stroke-linecap="round"><path d="M80 130Q100 118 120 130T160 130"/></g>` + sparks(460, 150, 50, 66, '#ef4444', 8, 4) + L('M440 90L448 70M470 90L480 70', '#cbd5e1', 4), { cls: 'pop' });
  }],
  ['shred', '#475569', '문서를 파쇄기에 넣어 가느다란 종이 조각으로 갈아 버린다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-60, -70, 120, 70, '#475569', 8)}${R(-50, -78, 100, 10, '#2a2e3a', 3)}${C(40, -34, 6, '#22c55e')}</g>` + paper(280, 90, 60, 80, 3), { cls: 'up' });
    s.mv(2, 'translateY(-40px)', paper(280, 140, 60, 70, 3), { d: 0.8, e: 2 });
    s.step(3, [...Array(14)].map((_, i) => R(262 + (i % 7) * 8 - 10, 250 + (i % 3) * 6, 5, 30, '#fff', 1, 'stroke="#aab4c6" stroke-width="1.4"').replace(/transform=""/, '')).join('') + `<g>${[[220, 270], [340, 276], [300, 282]].map(([x, y]) => R(x, y - 18, 5, 26, '#fff', 1, 'stroke="#aab4c6" stroke-width="1.4"')).join('')}</g>`, { cls: 'pop' });
  }],
  ['tribute', '#f59e0b', '사람들이 영웅에게 꽃과 박수를 바치며 존경을 표한다', (s) => {
    s.sky('sun'); s.ground('carpet', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#f59e0b', fc: 'smile', hat: crown(0, -98, 0.7) }) + R(230, 254, 100, 14, '#a8794a', 3), { cls: 'up' });
    s.step(2, person({ x: 100, y: 262, shirt: '#3b82f6', armR: [30, 10], s: 0.9 }) + `<g transform="translate(140 220)">${C(0, 0, 10, '#ef4444')}${C(14, 6, 10, '#f472b6')}${L('M0 12L-4 36', '#3a8a3a', 3)}</g>` + person({ x: 460, y: 262, shirt: '#ec4899', hs: 'long', armL: [-30, 10], s: 0.9 }) + `<g transform="translate(420 220)">${C(0, 0, 10, '#facc15')}${C(-14, 6, 10, '#ef4444')}${L('M0 12L4 36', '#3a8a3a', 3)}</g>`, { cls: 'up' });
    s.step(3, heart(280, 70, 1, '#ef4444') + sparks(280, 130, 80, 96, '#ffd34d', 12, 4), { cls: 'pop' });
  }],
  ['inherent', '#16a34a', '도토리 속에 이미 큰 나무가 될 힘이 본래부터 들어 있다', (s) => {
    s.sky('green'); s.ground('grass', 252);
    s.step(1, `<g transform="translate(200 220)">${E(0, 8, 46, 56, '#a8774a', 'stroke="#6b4a2a" stroke-width="3"')}${P('M-52 -16Q0 -60 52 -16Q40 -34 0 -38Q-40 -34 -52 -16Z', '#6b4a2a')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(200 220)">${E(0, 8, 46, 56, '#fde8c8', 'stroke="#6b4a2a" stroke-width="3"')}${P('M-52 -16Q0 -60 52 -16Q40 -34 0 -38Q-40 -34 -52 -16Z', '#6b4a2a')}</g>`, { e: 2 });
    s.step(2, L('M200 250V210', '#3f8f3a', 5) + P('M200 220C190 206 180 214 188 224Z M200 214C212 202 222 210 214 220Z', '#5fb85a'), { cls: 'pop', e: 2 });
    s.step(3, `<g transform="translate(200 220)">${E(0, 8, 46, 56, '#fde8c8', 'stroke="#6b4a2a" stroke-width="3"')}${P('M-52 -16Q0 -60 52 -16Q40 -34 0 -38Q-40 -34 -52 -16Z', '#6b4a2a')}${L('M0 36V0', '#3f8f3a', 5)}${P('M0 10C-10 -4 -20 4 -12 14Z M0 4C12 -8 22 0 14 10Z', '#5fb85a')}</g>` + arrow(260, 190, 340, 160, '#16a34a') + tree(430, 252, 1.1), { cls: 'up' });
  }],
  ['harass', '#7c3aed', '쉴 새 없이 울리는 전화와 알림에 시달리는 괴롭힘', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#7c3aed', fc: 'neutral' }), { cls: 'up', e: 2 });
    s.step(2, [[150, 120], [210, 70], [350, 70], [410, 120], [130, 200], [430, 200]].map(([x, y], i) => phone(x, y + 36, 1.1) + L(`M${x - 22} ${y - 8}L${x - 30} ${y - 16}M${x + 22} ${y - 8}L${x + 30} ${y - 16}`, '#ef4444', 3)).join(''), { cls: 'pop' });
    s.step(3, person({ x: 280, y: 254, shirt: '#7c3aed', fc: 'cry', armL: [16, -30], armR: [-16, -30] }) + drop(250, 150, 0.8) + drop(310, 150, 0.8), { });
    s.badge('excl', 500, 40);
  }],
  ['narrative', '#0891b2', '책을 펼쳐 이야기를 들려주자 아이들 상상 속에 장면이 펼쳐진다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#0891b2', hs: 'long', fc: 'cheer', armR: [40, 10] }) + book(210, 220, '#ef4444', 54, 40), { cls: 'up' });
    s.step(2, E(300, 100, 100, 60, '#fff', 'stroke="#aab4c6" stroke-width="3"') + `<g transform="translate(300 100)">${P('M-50 20L-30 -20H30L50 20Z', '#b8bfcf')}${R(-14, -20, 28, 40, '#a8aebd')}${P('M-20 -20L0 -46L20 -20Z', '#ef4444')}</g>` + C(230, 150, 5, '#fff', 'stroke="#aab4c6" stroke-width="2"'), { cls: 'pop' });
    s.step(3, person({ x: 400, y: 262, shirt: '#3b82f6', s: 0.7, fc: 'shock' }) + person({ x: 470, y: 262, shirt: '#ec4899', hs: 'long', s: 0.7, fc: 'shock' }) + star(310, 50, 8) + star(250, 60, 6), { cls: 'up' });
  }],
  ['sneak', '#475569', '잠든 개 옆으로 발끝을 들고 살금살금 몰래 지나간다', (s) => {
    s.sky('night'); s.ground('floor', 252);
    s.step(1, dog(380, 252, 2, '#6b4a2a') + L('M350 150Q356 140 364 150', '#aab4c6', 3, 'stroke-opacity="0"') + moon(470, 70, 18, '#0f1730'), { cls: 'up' });
    s.mv(2, 'translateX(-190px)', person({ x: 220, y: 254, shirt: '#475569', fc: 'neutral', legs: 'walk', armL: [-6, 28], armR: [14, -28], s: 1 }), { d: 1.1, ease: 'linear' });
    s.step(3, L('M80 262L120 262M120 262L160 262', '#8a93a5', 3, 'stroke-dasharray="3 10"') + chk(500, 56), { cls: 'pop' });
  }],
  ['obstruct', '#92400e', '큰 바위가 길을 막아 달리던 차가 더 가지 못한다', (s) => {
    s.sky('day'); s.ground('road', 240);
    s.step(1, L('M0 270H560', '#fff', 4, 'stroke-dasharray="26 18" stroke-opacity=".8"') + car(130, 250, '#3b82f6', 1.3), { cls: 'up' });
    s.mv(2, 'translate(60px,-120px) rotate(40deg)', `<g transform="translate(360 220)">${P('M-70 20Q-80 -60 -10 -76Q60 -80 74 -8Q80 20 40 24Z', '#8a7a68', 'stroke="#5f5242" stroke-width="4"')}${L('M-30 -30Q0 -50 30 -34', '#fff', 5, 'stroke-opacity=".4"')}</g>`, { d: 0.9, ease: 'cubic-bezier(.5,0,.9,.9)' });
    s.step(3, L('M230 200L216 180M240 230L220 232', '#ef4444', 4) + cross(500, 56), { cls: 'pop' });
  }],
  ['heatstroke', '#dc2626', '뙤약볕 아래 얼굴이 붉어져 쓰러지고 얼음주머니로 식힌다', (s) => {
    s.sky('sun'); s.ground('sand', 246);
    s.step(1, sun(440, 66, 36, '#ff8a1a') + sparks(440, 66, 46, 64, '#ffb347', 12, 5) + thermo(120, 250, 0.95, '#ef4444'), { cls: 'pop' });
    s.step(2, person({ x: 280, y: 258, shirt: '#3b82f6', fc: 'sick', skin: '#ff8a7a', armL: [-14, 20] }) + drop(250, 160, 0.9) + drop(312, 164, 0.9), { cls: 'up', e: 2 });
    s.step(3, person({ x: 290, y: 250, shirt: '#3b82f6', fc: 'sleep', skin: '#ff8a7a', rot: 90, rotO: '0 0', legs: 'hide', armL: [-14, 20], sh: false }) + `<g transform="translate(360 236) rotate(-10)">${R(-16, -16, 32, 32, '#e6f6ff', 6, 'stroke="#9fd8ff" stroke-width="3"')}${L('M-6 -6L6 6M6 -6L-6 6', '#38bdf8', 3)}</g>` + L('M300 190Q330 170 360 190', '#9fd8ff', 3), { });
  }],
  ['oval', '#0d9488', '동그란 원이 양옆으로 늘어나 달걀 같은 타원이 된다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, C(150, 140, 60, '#5eead4', 'stroke="#0d9488" stroke-width="5"'), { cls: 'pop', e: 1 });
    s.step(2, arrow(60, 140, 30, 140, '#0d9488', 5, 12) + arrow(240, 140, 270, 140, '#0d9488', 5, 12) + E(150, 140, 90, 60, '#5eead4', 'stroke="#0d9488" stroke-width="5"'), { e: 2 });
    s.step(3, E(150, 140, 90, 60, '#5eead4', 'stroke="#0d9488" stroke-width="5"') + `<g transform="translate(400 190)">${E(0, 0, 40, 54, '#fff3d2', 'stroke="#d9c58a" stroke-width="3"')}</g>` + E(400, 80, 24, 16, 'none', 'stroke="#0d9488" stroke-width="5"') + L('M300 140H340', '#0d9488', 4, 'stroke-dasharray="4 8"'), { cls: 'pop' });
  }],
  ['vocation', '#ea580c', '여러 길 중 부름을 느낀 길을 골라 요리사로서 천직을 살린다', (s) => {
    s.sky('warm'); s.ground('floor', 252);
    s.step(1, person({ x: 280, y: 254, shirt: '#ea580c', fc: 'think' }) + `<g transform="translate(110 210)">${R(-24, -8, 48, 16, '#8a93a5', 8)}${R(-6, -40, 12, 36, '#6b7384', 4)}</g>` + `<g transform="translate(450 210)">${E(0, 0, 30, 12, '#475569')}${R(28, -4, 40, 8, '#475569', 3)}</g>`, { cls: 'up' });
    s.step(2, `<path d="M450 0L420 210H490Z" fill="#fff3b8" fill-opacity=".45"/>` + sparks(450, 200, 30, 44, '#ffd34d', 8, 3), { cls: 'wipe-d' });
    s.step(3, person({ x: 280, y: 254, shirt: '#fff', pants: '#334155', fc: 'cheer', armR: [50, 0], hat: '<path d="M-16 -96Q-20 -120 0 -118Q20 -120 16 -96Z" fill="#fff"/><rect x="-16" y="-98" width="32" height="8" fill="#fff"/>' }) + heart(280, 76, 0.9, '#ef4444'), { });
  }],
  ['fellow', '#2563eb', '어깨동무한 두 친구는 같은 처지의 동료다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 200, y: 260, shirt: '#2563eb', fc: 'smile' }), { cls: 'up' });
    s.mv(2, 'translateX(150px)', person({ x: 360, y: 260, shirt: '#16a34a', hs: 'long', fc: 'smile', legs: 'walk' }), { d: 0.9 });
    s.step(3, person({ x: 240, y: 260, shirt: '#2563eb', fc: 'cheer', armR: [30, -34] }), { e: 3 });
    s.step(3, heart(300, 90, 1, '#ef4444') + sparks(300, 100, 40, 56, '#ffd34d', 6, 3), { cls: 'pop' });
  }],
  ['mandate', '#b91c1c', '두루마리에 도장을 찍은 명령이 내려지자 사람들이 따른다', (s) => {
    s.sky('warm'); s.ground('stone', 250);
    s.step(1, R(180, 120, 200, 130, '#a8774a', 4) + R(170, 112, 220, 14, '#8c5a2a', 4) + person({ x: 280, y: 190, shirt: '#b91c1c', legs: 'hide', fc: 'neutral', armR: [30, -8], armL: [-30, -8], sh: false }) + R(250, 130, 60, 36, '#f3e9c8', 3, 'stroke="#a89260" stroke-width="2"'), { cls: 'up' });
    s.step(2, `<g transform="translate(300 100)">${R(-40, -16, 80, 32, '#f3e9c8', 4, 'stroke="#a89260" stroke-width="3"')}${C(30, 10, 14, '#dc2626')}${star(30, 10, 7, '#fff')}</g>`, { cls: 'pop' });
    s.step(3, [90, 170, 400, 480].map((x, i) => person({ x, y: 266, shirt: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'][i], s: 0.75, rot: 14 * (x < 280 ? 1 : -1), armL: [4, 20], armR: [-4, 20] })).join(''), { cls: 'up' });
  }],
  ['perish', '#6b7280', '곱게 핀 꽃이 시들어 고개를 숙이고 꽃잎이 떨어져 사라진다', (s) => {
    s.sky('gray'); s.ground('soil', 250);
    s.step(1, flowerBloom(280, 252, 1.4), { cls: 'up', e: 1 });
    s.step(2, `<g transform="translate(280 252) scale(1.4)">${L('M0 0Q0 -50 34 -70', '#7a8a3a', 6)}${P('M0 -30C-22 -40 -34 -28 -22 -14Z', '#8a8a4a')}${C(40, -64, 10, '#c084a0')}</g>`, { e: 2 });
    s.step(3, L('M280 252Q280 210 310 190', '#6a5a2a', 6) + `<g>${C(306, 190, 8, '#8a6a7a')}${P('M240 250l14 -6l-4 12Z', '#8a6a7a')}${P('M330 252l12 -8l-2 12Z', '#8a6a7a')}${P('M290 256l10 -4l-2 8Z', '#8a6a7a')}</g>` + cross(480, 56), { });
  }],
  ['statesman', '#1e3a8a', '연단에서 연설하는 정치인과 귀 기울이는 청중', (s) => {
    s.sky('day'); s.ground('stone', 250);
    s.step(1, flag(110, 250, '#16a34a', 150) + flag(450, 250, '#2563eb', 150) + R(220, 186, 120, 68, '#7a461f', 4), { cls: 'up' });
    s.step(2, person({ x: 280, y: 200, shirt: '#1e3a8a', pants: '#1e3a8a', fc: 'cheer', legs: 'hide', armR: [34, -26], armL: [-34, -20], hat: tie, sh: false }), { cls: 'up' });
    s.step(3, [80, 150, 410, 480].map((x, i) => person({ x, y: 296, shirt: ['#ef4444', '#f59e0b', '#22c55e', '#8b5cf6'][i], s: 0.7, fc: 'cheer', armR: [14, -40] })).join('') + sparks(280, 110, 60, 74, '#ffd34d', 8, 3), { cls: 'up' });
  }],
  ['connotation', '#dc2626', '빨간 장미 한 송이가 사랑이라는 숨은 뜻을 떠올리게 한다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, flowerBloom(160, 252, 1.3, '#ef4444'), { cls: 'up' });
    s.step(2, arrow(220, 150, 330, 120, '#dc2626'), { cls: 'wipe' });
    s.step(3, E(400, 100, 90, 56, '#fff', 'stroke="#aab4c6" stroke-width="3"') + heart(400, 100, 1.4, '#ef4444') + C(310, 150, 5, '#fff', 'stroke="#aab4c6" stroke-width="2"') + sparks(400, 100, 70, 84, '#ffd34d', 8, 3), { cls: 'pop' });
  }],
  ['mortgage', '#0369a1', '집을 담보로 은행에서 큰돈을 빌려 오래 갚는 대출', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, house(130, 252, 110, '#f3d9b5', '#c0392b') + `<g transform="translate(440 246)">${R(-60, -80, 120, 80, '#e8e4d8', 3)}${P('M-72 -80L0 -122L72 -80Z', '#cbbf9c')}${[-36, -12, 12, 36].map((x) => R(x - 5, -74, 10, 66, '#f4f1e6', 2)).join('')}${C(0, -90, 10, '#ffd34d', 'stroke="#d99a00" stroke-width="2.4"')}</g>`, { cls: 'up' });
    s.mv(2, 'translateX(150px)', bag(280, 220, 1.3, '#d9772e') + coin(310, 210, 12), { d: 0.9 });
    s.step(2, L('M130 130V160', '#6b7384', 3, 'stroke-opacity="0"'), { });
    s.step(3, L('M230 100H350', '#0369a1', 4, 'stroke-dasharray="1 10"') + coin(250, 100, 12) + coin(290, 100, 12) + coin(330, 100, 12) + key(130, 150, 1) + arrow(350, 100, 400, 100, '#0369a1'), { cls: 'wipe' });
  }],
  ['mimic', '#0ea5e9', '한 사람의 몸짓을 거울처럼 똑같이 따라 하는 흉내', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, person({ x: 150, y: 254, shirt: '#0ea5e9', fc: 'cheer', armL: [-30, -44], armR: [30, 10] }), { cls: 'up' });
    s.step(2, person({ x: 410, y: 254, shirt: '#f59e0b', fc: 'smirk', armL: [-30, -44], armR: [30, 10] }), { cls: 'up' });
    s.step(3, `<g transform="translate(280 150)">${E(0, 0, 18, 12, '#22c55e')}${C(14, -10, 10, '#22c55e')}${P('M22 -10L32 -6L22 -2Z', '#f59e0b')}${C(17, -12, 2, '#fff')}${L('M-16 4L-30 24', '#16a34a', 4)}</g>` + sparks(280, 140, 40, 54, '#ffd34d', 6, 3) + L('M200 110Q280 70 360 110', '#0ea5e9', 3, 'stroke-dasharray="6 8"'), { cls: 'pop' });
  }],
  ['unearth', '#a16207', '삽으로 땅을 파헤쳐 묻혀 있던 보물 상자를 찾아낸다', (s) => {
    s.sky('day'); s.ground('soil', 190);
    s.step(1, R(0, 190, 560, 110, '#9a6a3a') + L('M240 190L250 200M250 190L240 200', '#ef4444', 5, 'transform="translate(30 0)"'), { cls: 'up' });
    s.step(2, `<g transform="translate(200 190) rotate(30)">${R(-4, -80, 8, 70, '#8c6238', 3)}${P('M-16 -10H16L10 20H-10Z', '#8a93a5')}</g>` + P('M230 190L330 190L310 230L250 230Z', '#4a2f18') + C(380, 180, 18, '#7a5230'), { cls: 'pop' });
    s.step(3, `<g transform="translate(280 232)">${R(-40, -30, 80, 34, '#a8774a', 4, 'stroke="#6b4a2a" stroke-width="3"')}${P('M-40 -30Q0 -66 40 -30Z', '#8c5a2a', 'stroke="#6b4a2a" stroke-width="3"')}${R(-8, -34, 16, 14, '#ffd34d', 2)}${coin(-14, -42, 8)}${coin(18, -46, 8)}</g>` + sparks(280, 180, 60, 78, '#ffd34d', 10, 4), { cls: 'pop' });
  }],
  ['wail', '#2563eb', '아기가 눈물을 쏟으며 온 집이 떠나가라 울부짖는다', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, person({ x: 240, y: 258, shirt: '#93c5fd', s: 0.9, fc: 'cry', armL: [-20, -10], armR: [20, -10] }), { cls: 'up' });
    s.step(2, drop(212, 150, 1.2, '#8fd0ff') + drop(268, 154, 1.2, '#8fd0ff') + L('M206 176Q196 220 200 240M274 178Q282 220 280 240', '#8fd0ff', 5), { cls: 'wipe-d' });
    s.step(3, `<g fill="none" stroke="#2563eb" stroke-linecap="round"><path d="M320 150Q340 130 320 110" stroke-width="5"/><path d="M350 160Q384 130 350 90" stroke-width="6"/><path d="M380 170Q430 130 380 70" stroke-width="7"/></g>`, { cls: 'wipe' });
  }],
  ['stride', '#16a34a', '다리를 쭉 벌려 성큼성큼 큰 걸음으로 걸어간다', (s) => {
    s.sky('day'); s.ground('grass', 246);
    s.step(1, person({ x: 140, y: 262, shirt: '#16a34a', legs: 'walk', fc: 'smile' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 270, y: 262, shirt: '#16a34a', legs: 'walk', fc: 'cheer', armL: [-20, 20], armR: [24, 20] }), { e: 2 });
    s.step(3, person({ x: 420, y: 262, shirt: '#16a34a', legs: 'walk', fc: 'cheer', armL: [-24, 20], armR: [28, 20] }) + [[110, 268], [200, 268], [290, 268], [380, 268]].map(([x, y]) => E(x, y, 16, 6, '#2a6a3a', 'fill-opacity=".5"')).join('') + L('M110 280H380', '#16a34a', 4) + P('M376 272L392 280L376 288Z', '#16a34a'), { });
  }],
  ['applicant', '#0d9488', '이력서를 든 지원자들이 줄을 서 면접관에게 서류를 낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, R(330, 190, 160, 14, '#a0602e', 5) + R(342, 204, 10, 48, '#7a461f') + R(470, 204, 10, 48, '#7a461f') + person({ x: 410, y: 190, shirt: '#334155', pants: '#334155', legs: 'hide', fc: 'neutral', armL: [-26, 4], hat: tie, sh: false }), { cls: 'up' });
    s.step(2, [70, 140, 210].map((x, i) => person({ x, y: 254, shirt: ['#0d9488', '#f59e0b', '#8b5cf6'][i], armR: [20, 16], hs: i === 1 ? 'long' : 'short', s: 0.9 }) + paper(x + 30, 214, 24, 32, 2)).join(''), { cls: 'up' });
    s.mv(3, 'translateX(-60px)', paper(330, 180, 36, 44, 3), { d: 0.7 });
    s.step(3, chk(500, 56), { cls: 'pop' });
  }],
  ['disprove', '#dc2626', '증거를 들이대 그럴듯하던 주장이 틀렸음을 밝혀 낸다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, E(170, 110, 100, 60, '#fff', 'stroke="#aab4c6" stroke-width="3"') + L('M130 110H210M130 128H190', '#aab4c6', 5) + person({ x: 120, y: 254, shirt: '#94a3b8', fc: 'smirk' }), { cls: 'up' });
    s.step(2, person({ x: 440, y: 254, shirt: '#0d9488', hs: 'long', fc: 'cheer', armL: [-30, -20] }) + magnifier(340, 190, 1.2) + L('M380 100L400 120L440 80', '#16a34a', 7), { cls: 'up' });
    s.step(3, L('M100 60L240 160M240 60L100 160', '#dc2626', 9) + chk(500, 56), { cls: 'pop' });
  }],
  ['recur', '#7c3aed', '해가 뜨고 지고 다시 뜨는 일이 되풀이되는 반복', (s) => {
    s.sky('day'); s.ground('grass', 250);
    s.step(1, sun(160, 150, 40, '#ffb347') + sparks(160, 150, 50, 66, '#ffd34d', 10, 4), { cls: 'pop' });
    s.step(2, moon(410, 150, 34, '#cfd6e8') + star(450, 90, 6, '#fff') + star(370, 80, 5, '#fff'), { cls: 'pop' });
    s.step(3, L('M200 80Q285 20 370 80', '#7c3aed', 6) + P('M360 64L380 84L352 90Z', '#7c3aed') + L('M370 230Q285 290 200 230', '#7c3aed', 6) + P('M210 214L190 234L218 240Z', '#7c3aed'), { cls: 'wipe' });
  }],
  ['indigenous', '#15803d', '땅속 깊이 뿌리내린 오래된 나무처럼 그 땅 고유의 토착', (s) => {
    s.sky('day'); s.ground('soil', 180);
    s.step(1, R(0, 180, 560, 120, '#8a5a2e') + P('M0 180H560V196H0Z', '#5fb85a') + tree(280, 190, 1.1), { cls: 'up' });
    s.step(2, L('M280 190Q270 230 220 260M280 190Q290 240 340 270M280 190V280M280 220Q240 240 190 240M280 220Q320 230 380 244', '#c9a37a', 7), { cls: 'wipe-d' });
    s.step(3, house(110, 190, 70, '#f3d9b5', '#c0392b', 0.9) + person({ x: 450, y: 192, shirt: '#16a34a', s: 0.7, fc: 'cheer' }) + heart(450, 110, 0.7, '#ef4444'), { cls: 'up' });
  }],
  ['morale', '#f59e0b', '풀 죽었던 팀이 응원에 힘입어 사기가 올라 펄쩍 뛰며 환호한다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.step(1, [100, 190, 280, 370].map((x, i) => person({ x, y: 260, shirt: ['#ef4444', '#3b82f6', '#22c55e', '#8b5cf6'][i], fc: 'sad', rot: 6, armL: [-6, 24], armR: [6, 24] })).join('') + R(480, 80, 14, 160, '#e5e9f0', 4, 'stroke="#aab4c6" stroke-width="2"') + R(484, 190, 6, 50, '#ef4444', 2), { cls: 'up', e: 2 });
    s.step(2, person({ x: 480, y: 262, shirt: '#f59e0b', fc: 'cheer', armL: [-30, -50], armR: [30, -50] }) + bubble(420, 130, 80, 50, '#fff', 'r') + star(420, 130, 12), { cls: 'up', e: 2 });
    s.step(3, [100, 190, 280, 370].map((x, i) => person({ x, y: 230, shirt: ['#ef4444', '#3b82f6', '#22c55e', '#8b5cf6'][i], fc: 'cheer', armL: [-30, -50], armR: [30, -50] })).join('') + R(480, 80, 14, 160, '#e5e9f0', 4, 'stroke="#aab4c6" stroke-width="2"') + R(484, 100, 6, 140, '#ef4444', 2) + sparks(240, 120, 150, 170, '#ffd34d', 14, 4), { });
  }],
];
