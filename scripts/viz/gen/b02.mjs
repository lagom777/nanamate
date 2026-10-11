import { T, R, C, E, P, L, G, shadow, arrow, star, drop, sparks, cloud, sun, moon, heart, coin, tree, house, table, paper, money, bubble, door, flag, crown, chair, bed, scales } from './kit.mjs';
import { person, hatCap } from './kit.mjs';
import { apple, bread, cake, sack, crate, bottle, bag, box, basket, note, pencil, bulb, thermo, magnifier, ball, bomb, tie } from './props.mjs';

const horns = '<path d="M-14 -94L-18 -108L-8 -98ZM14 -94L18 -108L8 -98Z" fill="#ef4444"/>';
const specs = '<g fill="none" stroke="#2a2e3a" stroke-width="2.4"><circle cx="-7" cy="-83" r="5.4"/><circle cx="7" cy="-83" r="5.4"/><path d="M-1.6 -83H1.6"/></g>';
const trash = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-22 -50H22L18 0H-18Z" fill="#6b7a8c" stroke="#4a5666" stroke-width="2.4"/><rect x="-26" y="-58" width="52" height="9" rx="3" fill="#8393a6"/>${L('M-8 -42V-8M0 -42V-8M8 -42V-8', '#4a5666', 2.4)}</g>`;
const brokenHeart = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 14C-26 -4 -20 -22 -9 -22C-3 -22 0 -16 0 -14L-4 -4L4 4L-3 14Z" fill="#ef4444" transform="translate(-4 0) rotate(-6)"/><path d="M0 14C26 -4 20 -22 9 -22C3 -22 0 -16 0 -14L4 -4L-2 4L3 14Z" fill="#c92a2a" transform="translate(4 2) rotate(6)"/></g>`;

export default [
  ['eager', '#f59e0b', '교실에서 한 학생이 신이 나서 손을 번쩍 들고 나서고 싶어 한다', (s) => {
    s.sky('wall'); s.ground('floor', 250);
    s.step(1, person({ x: 130, y: 254, shirt: '#94a3b8', fc: 'neutral' }) + person({ x: 430, y: 254, shirt: '#94a3b8', hs: 'long', fc: 'neutral' }), { cls: 'up' });
    s.step(1, person({ x: 280, y: 254, shirt: '#f59e0b', fc: 'cheer' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 280, y: 254, shirt: '#f59e0b', fc: 'cheer', armR: [10, -62] }));
    s.step(3, sparks(280, 160, 40, 58, '#ffd34d', 8, 5) + star(340, 100, 10) + star(220, 100, 8), { cls: 'pop' });
  }],
  ['spare', '#0ea5e9', '빵을 반으로 나눠 배고픈 친구에게 한 조각을 내어 준다', (s) => {
    s.sky('warm'); s.ground('floor', 250);
    s.step(1, person({ x: 140, y: 254, shirt: '#0ea5e9', armR: [36, -10] }) + person({ x: 430, y: 254, shirt: '#94a3b8', fc: 'sad', armL: [-10, 30] }), { cls: 'up' });
    s.step(1, bread(230, 218, 1.3), { e: 1 });
    s.step(2, bread(214, 218, 0.9) + bread(250, 218, 0.9), { cls: 'pop' , e: 2 });
    s.step(3, bread(210, 218, 1), {});
    s.mv(3, 'translateX(-150px)', bread(360, 200, 1), { d: 0.9 });
    s.step(3, person({ x: 430, y: 254, shirt: '#94a3b8', fc: 'cheer', armL: [-40, -22] }));
    s.step(3, heart(285, 130, 1, '#ef4444'), { cls: 'pop', dl: 0.3 });
  }],
  ['discipline', '#475569', '줄 맞춰 선 학생들이 호루라기 신호에 맞춰 일제히 경례한다', (s) => {
    s.sky('wall'); s.ground('floor', 250);
    s.step(1, [90, 190, 290, 390].map((x, i) => person({ x, y: 254, shirt: '#1e3a8a', pants: '#1e293b', armL: [-6, 30], armR: [6, 30], fc: 'neutral', hs: i % 2 ? 'long' : 'short' })).join(''), { cls: 'up' });
    s.step(2, person({ x: 490, y: 254, shirt: '#475569', armR: [-4, -52], fc: 'angry' }) + C(468, 148, 7, '#ffd34d', 'stroke="#d99a00" stroke-width="2"'), { cls: 'up' });
    s.step(3, [90, 190, 290, 390].map((x, i) => person({ x, y: 254, shirt: '#1e3a8a', pants: '#1e293b', armL: [-6, 30], armR: [12, -30], fc: 'smile', hs: i % 2 ? 'long' : 'short' })).join(''));
    s.badge('check', 500, 60);
  }],
  ['scarce', '#b45309', '선반의 물건이 하나둘 사라져 겨우 하나만 남는다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 250)">${R(-190, -160, 380, 160, '#b98650', 4, 'stroke="#7a461f" stroke-width="3"')}${R(-190, -84, 380, 6, '#7a461f')}</g>`, { cls: 'up' });
    const xs = [130, 190, 250, 310, 370, 430];
    xs.forEach((x, i) => {
      const e = i === 2 ? undefined : i < 2 ? 1 : 2;
      s.step(1, apple(x, 175, 1.1) + apple(x, 95, 1.1), { e: i === 2 ? undefined : (i < 2 ? 1 : 2) });
    });
    s.step(2, person({ x: 70, y: 262, shirt: '#14b8a6', legs: 'walk', s: 0.9, armR: [22, 6] }), { cls: 'up' });
    s.step(3, L('M150 120L230 200M230 120L150 200', '#ef4444', 6) , { cls: 'pop' });
    s.badge('excl', 500, 40);
  }],
  ['regulate', '#0891b2', '밸브를 돌려 쏟아지던 물의 양을 알맞게 조절한다', (s) => {
    s.sky('cool'); s.ground('tile', 250);
    s.step(1, R(60, 80, 230, 26, '#8a93a5', 6, 'stroke="#5a6475" stroke-width="3"') + R(262, 100, 28, 40, '#8a93a5', 4) + `<g transform="translate(160 66)">${R(-3, 0, 6, 16, '#5a6475')}${L('M-26 -4H26', '#ef4444', 8)}</g>` + `<g transform="translate(300 250)">${R(-50, -60, 100, 60, '#c99a5b', 6, 'stroke="#8c6238" stroke-width="3"')}${R(-44, -50, 88, 8, '#7fd0ff', 3)}</g>`, { cls: 'up' });
    s.step(1, R(268, 140, 16, 102, '#7fd0ff', 3, 'fill-opacity=".85"'), { e: 1 });
    s.step(2, L('M130 52A30 30 0 1 1 190 52', '#ef4444', 4) + P('M190 44L200 58L184 58Z', '#ef4444'), { cls: 'pop' });
    s.step(3, R(273, 140, 6, 102, '#7fd0ff', 2, 'fill-opacity=".85"') + drop(276, 232, 0.5), { cls: '' });
    s.step(3, `<g transform="translate(450 180)">${C(0, 0, 40, '#fff', 'stroke="#6b7384" stroke-width="5"')}${P('M-30 14A36 36 0 0 1 -14 -32L0 0Z', '#ef4444', 'fill-opacity=".5"')}${P('M-14 -32A36 36 0 0 1 14 -32L0 0Z', '#22c55e', 'fill-opacity=".7"')}${P('M14 -32A36 36 0 0 1 30 14L0 0Z', '#ef4444', 'fill-opacity=".5"')}${L('M0 0L2 -30', '#2a2e3a', 4)}${C(0, 0, 4, '#2a2e3a')}</g>`, { cls: 'pop' });
  }],
  ['yield', '#16a34a', '나무에서 열매가 열려 수확한 바구니가 가득 찬다', (s) => {
    s.sky('day'); s.ground('grass', 240);
    s.step(1, tree(190, 252, 1.2), { cls: 'up' });
    s.step(2, apple(150, 120, 0.9) + apple(200, 90, 0.9) + apple(240, 130, 0.9) + apple(170, 150, 0.9) + apple(220, 170, 0.9), { cls: 'pop' });
    s.step(3, basket(400, 256, 1.5) + apple(380, 214, 1) + apple(414, 212, 1) + apple(398, 196, 1), { cls: 'up' });
    s.step(3, arrow(250, 190, 340, 220, '#16a34a'), { cls: 'wipe' });
  }],
  ['contemporary', '#2563eb', '고대 기둥에서 옛집을 거쳐 오늘날의 고층 건물로 이어지는 시대', (s) => {
    s.sky('cool'); s.ground('stone', 246);
    s.step(1, `<g transform="translate(110 246)">${R(-14, -100, 28, 100, '#e4e0d4', 3, 'stroke="#b8b09c" stroke-width="2"')}${R(-24, -112, 48, 12, '#d6d0c0', 3)}${R(-24, -8, 48, 8, '#d6d0c0', 3)}</g>`, { cls: 'up' });
    s.step(2, house(280, 246, 100, '#e8d0b0', '#8c4a2a'), { cls: 'up' });
    s.step(3, `<g transform="translate(440 246)">${R(-30, -190, 60, 190, '#9fb4d0', 3, 'stroke="#5f7694" stroke-width="2.4"')}${[0, 1, 2, 3, 4, 5].map((i) => R(-22, -178 + i * 28, 18, 16, '#e8f3ff', 2) + R(4, -178 + i * 28, 18, 16, '#e8f3ff', 2)).join('')}</g>`, { cls: 'up' });
    s.step(2, arrow(150, 270, 300, 270, '#2563eb', 5), { cls: 'wipe' });
    s.step(3, arrow(300, 270, 470, 270, '#2563eb', 5) + star(440, 40, 14), { cls: 'wipe' });
  }],
  ['tempt', '#ec4899', '맛있는 케이크의 유혹에 침을 흘리며 손을 뻗는다', (s) => {
    s.sky('pink'); s.ground('floor', 250);
    s.step(1, table(420, 236, 180) + cake(420, 226, 1.4) + sparks(420, 150, 30, 44, '#ffd34d', 6, 4), { cls: 'up' });
    s.step(1, person({ x: 130, y: 254, shirt: '#3b82f6', fc: 'neutral' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 180, y: 254, shirt: '#3b82f6', fc: 'shy', armR: [60, -10], hat: horns }), { cls: '' });
    s.step(3, drop(204, 178, 0.7, '#8fd0ff') + drop(214, 190, 0.5, '#8fd0ff') + heart(250, 130, 0.8, '#ec4899'), { cls: 'pop' });
  }],
  ['trait', '#7c3aed', '부모와 아이가 같은 곱슬머리와 안경이라는 특징을 물려받았다', (s) => {
    s.sky('cool'); s.ground('floor', 250);
    s.step(1, person({ x: 200, y: 254, shirt: '#7c3aed', hs: 'curly', hair: '#c2410c', hat: specs }), { cls: 'up' });
    s.step(2, person({ x: 380, y: 254, shirt: '#f59e0b', hs: 'curly', hair: '#c2410c', hat: specs, s: 0.7, fc: 'cheer' }), { cls: 'up' });
    s.step(3, `<g fill="none" stroke="#7c3aed" stroke-width="3.4" stroke-dasharray="6 6"><circle cx="200" cy="166" r="30"/><circle cx="380" cy="198" r="22"/><path d="M230 166Q300 120 358 190" stroke-linecap="round"/></g>`, { cls: 'pop' });
    s.badge('heart', 500, 60);
  }],
  ['contrary', '#dc2626', '두 사람이 등을 돌리고 서로 반대 방향으로 걸어간다', (s) => {
    s.sky('wall'); s.ground('floor', 250);
    s.step(1, L('M280 90V250', '#aab4c6', 4, 'stroke-dasharray="8 8"'), { cls: '' });
    s.mv(2, 'translateX(70px)', person({ x: 170, y: 254, shirt: '#3b82f6', legs: 'walk', fc: 'angry' }), { d: 1 });
    s.mv(2, 'translateX(-70px)', person({ x: 390, y: 254, shirt: '#ec4899', hs: 'long', legs: 'walk', fc: 'angry' }), { d: 1 });
    s.step(2, arrow(240, 130, 110, 130, '#dc2626', 6, 14) + arrow(320, 130, 450, 130, '#dc2626', 6, 14), { cls: 'wipe' });
    s.step(3, star(280, 90, 12, '#dc2626') + L('M200 270H360', '#dc2626', 4), { cls: 'pop' });
  }],
  ['impose', '#9a3412', '윗사람이 무거운 짐을 아랫사람 등에 잔뜩 얹어 짓누른다', (s) => {
    s.sky('wall'); s.ground('floor', 250);
    s.step(1, person({ x: 150, y: 254, shirt: '#14b8a6', fc: 'neutral' }), { cls: 'up', e: 2 });
    s.step(2, person({ x: 430, y: 254, shirt: '#1f2937', pants: '#1f2937', s: 1.15, fc: 'angry', armL: [-40, -6], hat: tie }), { cls: 'up' });
    s.mv(2, 'translateX(150px)', box(190, 150, 60, 44, '#c99a5b') + box(190, 106, 50, 40, '#d6a86a'), { d: 0.9 });
    s.step(3, person({ x: 150, y: 254, shirt: '#14b8a6', fc: 'sad', rot: 10, armL: [-10, 22], armR: [10, 22] }) + drop(176, 140, 0.8, '#8fd0ff'), { cls: '' });
    s.badge('down', 500, 60);
  }],
  ['criteria', '#0d9488', '기준선과 견주어 넘는 것은 합격, 못 넘는 것은 탈락시킨다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, L('M70 140H490', '#0d9488', 4, 'stroke-dasharray="10 8"') + C(70, 140, 6, '#0d9488') + C(490, 140, 6, '#0d9488'), { cls: 'wipe' });
    s.step(2, R(110, 100, 70, 152, '#3b82f6', 6) + R(245, 170, 70, 82, '#94a3b8', 6) + R(380, 90, 70, 162, '#3b82f6', 6), { cls: 'up' });
    s.step(3, C(145, 70, 20, '#22c55e', 'stroke="#fff" stroke-width="3"') + L('M135 70L142 78L156 62', '#fff', 5) + C(415, 60, 20, '#22c55e', 'stroke="#fff" stroke-width="3"') + L('M405 60L412 68L426 52', '#fff', 5) + C(280, 130, 20, '#ef4444', 'stroke="#fff" stroke-width="3"') + L('M271 121L289 139M289 121L271 139', '#fff', 5), { cls: 'pop' });
  }],
  ['tragic', '#475569', '비 내리는 날 깨진 마음 앞에서 사람이 슬피 운다', (s) => {
    s.sky('gray'); s.ground('stone', 250);
    s.step(1, brokenHeart(380, 232, 1.8), { cls: 'up' });
    s.step(2, `<g fill="#8fb4d8" stroke="#fff" stroke-width="1">${[70, 150, 230, 310, 390, 470].map((x, i) => `<path class="a-fall" style="animation-delay:-${(i * 0.5) % 3}s" d="M${x} 20c-5 8-5 12 0 12s5-4 0-12z"/>`).join('')}</g>`, {});
    s.step(2, cloud(110, 50, 1.6, '#6b7384') + cloud(300, 40, 1.8, '#5b6577') + cloud(470, 54, 1.5, '#6b7384'), { cls: '' });
    s.step(3, person({ x: 190, y: 254, shirt: '#475569', fc: 'cry', armR: [16, -26], armL: [-6, 28] }), { cls: 'up' });
  }],
  ['conscious', '#0ea5e9', '잠들어 있던 사람이 눈을 뜨고 번쩍 정신이 든다', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, bed(300, 252), { cls: 'up' });
    s.step(1, person({ x: 297, y: 224, shirt: '#f59e0b', rot: -90, fc: 'sleep', legs: 'hide' }) + `<g transform="translate(300 210)"><path d="M-70 -10Q0 -34 80 -10V26H-70Z" fill="#5f6fd0"/></g>`, { e: 1 });
    s.step(2, person({ x: 297, y: 224, shirt: '#f59e0b', rot: -90, fc: 'shock', legs: 'hide' }) + `<g transform="translate(300 210)"><path d="M-70 -10Q0 -34 80 -10V26H-70Z" fill="#5f6fd0"/></g>`, {});
    s.step(2, sun(470, 70, 24, '#ffd34d') + sparks(470, 70, 34, 48, '#ffb347', 8, 4), { cls: 'pop' });
    s.step(3, bulb(230, 160, 1.2) + sparks(230, 134, 36, 52, '#ffd34d', 6, 4), { cls: 'pop' });
  }],
  ['ethnic', '#d97706', '다양한 민족이 저마다의 옷차림으로 한데 어우러진다', (s) => {
    s.sky('sun'); s.ground('grass', 244);
    s.step(1, `<path d="M40 40Q280 90 520 40" stroke="#6b7384" stroke-width="3" fill="none"/>` + ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'].map((c, i) => P(`M${90 + i * 75} ${54 + Math.sin(i / 1.6) * 26}l16 0l-8 24z`, c)).join(''), { cls: 'up' });
    s.step(1, person({ x: 110, y: 262, shirt: '#ef4444', skin: '#ffd7b5', hs: 'long', hair: '#3a2418' }) + person({ x: 220, y: 262, shirt: '#22c55e', skin: '#e0ac69', hair: '#1f1209', hs: 'curly' }), { cls: 'up' });
    s.step(2, person({ x: 340, y: 262, shirt: '#f59e0b', skin: '#8d5524', hair: '#1f1209', hs: 'curly', fc: 'cheer' }) + person({ x: 450, y: 262, shirt: '#3b82f6', skin: '#f1c27d', hs: 'bun', hair: '#2a1a12', fc: 'cheer' }), { cls: 'up' });
    s.step(3, heart(280, 110, 1.2, '#ef4444') + sparks(280, 110, 30, 46, '#ffd34d', 6, 4), { cls: 'pop' });
  }],
  ['confront', '#dc2626', '두 사람이 정면으로 마주 서서 팽팽하게 맞선다', (s) => {
    s.sky('wall'); s.ground('floor', 250);
    s.step(1, person({ x: 130, y: 254, shirt: '#3b82f6', fc: 'angry', armR: [34, -6] }), { cls: 'up' });
    s.mv(2, 'translateX(150px)', person({ x: 430, y: 254, shirt: '#ef4444', fc: 'angry', armL: [-34, -6] }), { d: 0.9 });
    s.step(3, `<path d="M222 150L262 130L246 154L286 140L270 166" stroke="#ffd34d" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M338 150L298 130L314 154L274 140L290 166" stroke="#ffd34d" stroke-width="5" fill="none" stroke-linejoin="round"/>`, { cls: 'pop' });
    s.badge('excl', 500, 60);
  }],
  ['dispose', '#475569', '쓰레기봉투를 쓰레기통에 던져 버린다', (s) => {
    s.sky('day'); s.ground('stone', 246);
    s.step(1, person({ x: 140, y: 254, shirt: '#14b8a6', armR: [34, -26] }) + trash(420, 246, 1.4), { cls: 'up' });
    s.step(1, bag(188, 160, 1, '#475569'), { e: 1 });
    s.step(2, L('M188 150Q300 40 410 150', '#475569', 3.4, 'stroke-dasharray="6 7"'), { cls: 'wipe' });
    s.mv(2, 'translate(-210px,-6px)', bag(420, 154, 1, '#475569'), { d: 0.9 , e: 2 });
    s.step(3, bag(420, 164, 0.9, '#475569'), { cls: 'pop' });
    s.badge('check', 500, 60);
  }],
  ['optimal', '#16a34a', '너무 낮지도 높지도 않은 딱 알맞은 최적의 온도', (s) => {
    s.sky('cool'); s.ground('floor', 252);
    s.step(1, thermo(130, 230, 0.15, '#3b82f6') + thermo(280, 230, 0.5, '#22c55e') + thermo(430, 230, 0.95, '#ef4444'), { cls: 'up' });
    s.step(2, L('M90 150H470', '#16a34a', 3, 'stroke-dasharray="8 8"'), { cls: 'wipe' });
    s.step(3, `<circle cx="280" cy="150" r="70" fill="#22c55e" fill-opacity=".18"/>` + star(280, 56, 16, '#ffd34d') + L('M120 90L140 110M140 90L120 110M420 90L440 110M440 90L420 110', '#ef4444', 5), { cls: 'pop' });
    s.badge('check', 500, 56);
  }],
  ['dynasty', '#b91c1c', '왕관이 왕에게서 아들에게로 이어지는 왕조', (s) => {
    s.sky('warm'); s.ground('carpet', 252);
    s.step(1, `<g transform="translate(150 252)">${R(-50, -120, 100, 120, '#7a1f1f', 8)}${R(-60, -10, 120, 14, '#a8794a', 4)}</g>`, { cls: 'up' });
    s.step(1, person({ x: 150, y: 244, shirt: '#b91c1c', hair: '#8a8f99', hs: 'short', legs: 'hide', armL: [-6, 30], armR: [6, 30], hat: crown(0, -96, 0.9) }), { cls: 'up' });
    s.step(2, person({ x: 410, y: 254, shirt: '#2563eb', s: 0.8, fc: 'smile' }), { cls: 'up' });
    s.mv(3, 'translate(-250px,-6px)', crown(410, 152, 0.8), { d: 1 });
    s.step(3, arrow(210, 110, 360, 110, '#b91c1c'), { cls: 'wipe' });
    s.step(3, star(410, 100, 10), { cls: 'pop' });
  }],
  ['temper', '#ea580c', '참다가 화가 폭발해 얼굴이 빨개지고 김이 난다', (s) => {
    s.sky('wall'); s.ground('floor', 250);
    s.step(1, person({ x: 280, y: 254, shirt: '#3b82f6', fc: 'neutral' }), { cls: 'up', e: 1 });
    s.step(2, person({ x: 280, y: 254, shirt: '#3b82f6', fc: 'angry', skin: '#ff9a86', armL: [-14, 20], armR: [14, 20] }), { e: 2 });
    s.step(2, `<g fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"><path class="a-rise" d="M254 150Q244 136 254 124"/><path class="a-rise" style="animation-delay:-1.2s" d="M306 150Q316 136 306 124"/></g>`, { e: 2 });
    s.step(3, person({ x: 280, y: 254, shirt: '#3b82f6', fc: 'angry', skin: '#ff6a5a', armL: [-34, -34], armR: [34, -34] }));
    s.step(3, `<g transform="translate(280 64) scale(.5) translate(-280 -110)"><path d="M280 40L296 80L336 70L312 106L350 130L304 134L300 176L270 140L226 160L246 120L204 96L252 88Z" fill="#ffd34d" stroke="#f59e0b" stroke-width="5"/></g>` + sparks(280, 150, 40, 58, '#ef4444', 8, 4), { cls: 'pop' });
  }],
  ['undoubtedly', '#16a34a', '물음표가 걷히고 확실하다는 확신으로 고개를 끄덕인다', (s) => {
    s.sky('cool'); s.ground('floor', 250);
    s.step(1, person({ x: 170, y: 254, shirt: '#6366f1', fc: 'think', armR: [16, -34] }), { cls: 'up', e: 2 });
    s.step(1, bubble(330, 110, 120, 70, '#fff', 'l') + L('M310 96Q310 82 330 82Q352 82 352 98Q352 110 332 118V126M332 138V142', '#6366f1', 8), { cls: 'pop', e: 2 });
    s.step(2, L('M270 70L390 150M390 70L270 150', '#ef4444', 7), { cls: 'pop' });
    s.step(3, person({ x: 170, y: 254, shirt: '#6366f1', fc: 'cheer', armR: [30, -52] }), {});
    s.step(3, C(330, 110, 54, '#22c55e', 'stroke="#fff" stroke-width="5"') + L('M304 110L324 132L360 88', '#fff', 11), { cls: 'pop' });
  }],
  ['cease', '#0ea5e9', '쏟아지던 비가 점점 잦아들다 그치고 해가 난다', (s) => {
    s.sky('gray'); s.ground('grass', 244);
    s.step(1, `<g fill="#8fb4d8" stroke="#fff" stroke-width="1">${[80, 150, 220, 290, 360, 430, 500].map((x, i) => `<path class="a-fall" style="animation-delay:-${(i * 0.45) % 3}s" d="M${x} 20c-6 10-6 15 0 15s6-5 0-15z"/>`).join('')}</g>` + cloud(120, 56, 1.6, '#6b7384') + cloud(300, 46, 1.9, '#5b6577') + cloud(470, 60, 1.5, '#6b7384'), { e: 1 });
    s.step(2, cloud(120, 56, 1.3, '#aab4c6') + cloud(430, 56, 1.3, '#aab4c6'), { e: 2 });
    s.step(3, `<rect width="560" height="300" fill="#bfe6ff"/>` + sun(330, 80, 36, '#ffd34d') + sparks(330, 80, 48, 64, '#ffd34d', 10, 5) + cloud(130, 64, 1, '#fff'), { });
    s.step(3, `<path d="M0 252C150 238 310 254 560 242V300H0Z" fill="#6fcf66"/>`, {});
    s.step(3, `<path d="M120 200A90 90 0 0 1 330 200" stroke="#ef4444" stroke-width="5" fill="none" opacity=".7"/><path d="M130 204A80 80 0 0 1 320 204" stroke="#22c55e" stroke-width="5" fill="none" opacity=".7"/><path d="M140 208A70 70 0 0 1 310 208" stroke="#3b82f6" stroke-width="5" fill="none" opacity=".7"/>`, { cls: 'wipe' });
  }],
  ['unify', '#2563eb', '흩어진 세 조각이 하나로 합쳐져 하나의 깃발로 통일된다', (s) => {
    s.sky('cool'); s.ground('grass', 244);
    s.mv(2, 'translateX(-130px)', R(190, 90, 60, 100, '#22c55e', 4), { d: 0.9 });
    s.mv(2, 'translateY(-60px) rotate(8deg)', R(250, 90, 60, 100, '#facc15', 4), { d: 0.9 });
    s.mv(2, 'translateX(130px)', R(310, 90, 60, 100, '#8b5cf6', 4), { d: 0.9 });
    s.step(3, R(170, 80, 6, 170, '#8a93a5', 3), { cls: 'up' });
    s.step(3, sparks(280, 140, 90, 106, '#ffd34d', 10, 4) + heart(280, 60, 0.9, '#ef4444'), { cls: 'pop', dl: 0.2 });
    s.step(1, arrow(120, 140, 170, 140, '#2563eb') + arrow(440, 140, 390, 140, '#2563eb'), { e: 1 });
  }],
  ['doom', '#1f2937', '빙산에 부딪힌 배가 기울어 바다 속으로 가라앉는다', (s) => {
    s.sky('dark'); s.ground('water', 190);
    s.step(1, `<g transform="translate(400 200)"><path d="M-70 0L-30 -90L10 -60L40 -110L80 0Z" fill="#eaf6ff" stroke="#b7d4ea" stroke-width="3"/></g>`, { cls: 'up' });
    s.step(1, `<g transform="translate(200 196)"><path d="M-80 -4H80L56 30H-56Z" fill="#7a1f1f"/><rect x="-40" y="-40" width="70" height="36" fill="#f4f6fa"/><rect x="-6" y="-66" width="16" height="26" fill="#e1e6ee"/><rect x="-2" y="-84" width="8" height="18" fill="#2a2e3a"/></g>`, { cls: 'up', e: 2 });
    s.step(2, sparks(300, 170, 18, 40, '#ffd34d', 8, 5), { cls: 'pop' });
    s.step(3, `<g transform="translate(330 214) rotate(24)"><path d="M-80 -4H80L56 30H-56Z" fill="#7a1f1f"/><rect x="-40" y="-40" width="70" height="36" fill="#f4f6fa"/><rect x="-6" y="-66" width="16" height="26" fill="#e1e6ee"/><rect x="-2" y="-84" width="8" height="18" fill="#2a2e3a"/></g>`, { });
    s.step(3, `<path d="M0 214Q40 204 80 214T160 214T240 214T320 214T400 214T480 214T560 214V300H0Z" fill="#0b6fa8" fill-opacity=".92"/>` + `<path d="M260 20L240 70H262L246 118L290 60H268Z" fill="#ffd34d"/>`, { });
    s.badge('excl', 500, 56);
  }],
  ['strain', '#dc2626', '온 힘을 다해 무거운 역기를 들어 올리며 얼굴이 붉어진다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(280 252)">${R(-110, -14, 220, 6, '#8a93a5')}${R(-120, -40, 16, 52, '#2a2e3a', 4)}${R(104, -40, 16, 52, '#2a2e3a', 4)}${R(-104, -34, 12, 40, '#475569', 3)}${R(92, -34, 12, 40, '#475569', 3)}</g>`, { cls: 'up', e: 1 });
    s.step(1, person({ x: 280, y: 254, shirt: '#475569', fc: 'neutral' }), { e: 1 });
    s.step(2, person({ x: 280, y: 254, shirt: '#475569', fc: 'angry', skin: '#ff9a86', armL: [-30, -58], armR: [30, -58] }) + `<g transform="translate(280 160)">${R(-110, -14, 220, 6, '#8a93a5')}${R(-120, -40, 16, 52, '#2a2e3a', 4)}${R(104, -40, 16, 52, '#2a2e3a', 4)}</g>`, { e: 2 });
    s.step(3, person({ x: 280, y: 254, shirt: '#475569', fc: 'angry', skin: '#ff6a5a', armL: [-34, -96], armR: [34, -96] }) + `<g transform="translate(280 92)">${R(-110, -14, 220, 6, '#8a93a5')}${R(-120, -40, 16, 52, '#2a2e3a', 4)}${R(104, -40, 16, 52, '#2a2e3a', 4)}${R(-104, -34, 12, 40, '#475569', 3)}${R(92, -34, 12, 40, '#475569', 3)}</g>` + drop(250, 140, 0.8, '#8fd0ff') + drop(312, 150, 0.8, '#8fd0ff'), {});
  }],
  ['editorial', '#475569', '신문의 의견란에 붉은 펜으로 표시하며 논설을 살핀다', (s) => {
    s.sky('wall'); s.ground('floor', 252);
    s.step(1, `<g transform="translate(260 150)">${R(-150, -110, 300, 220, '#f4f1e6', 4, 'stroke="#b8b09c" stroke-width="3"')}${R(-130, -92, 260, 26, '#2a2e3a', 3)}${R(-130, -54, 110, 80, '#cbd5e1', 3)}${C(-96, -22, 16, '#94a3b8')}${L('M-6 -52H130M-6 -38H130M-6 -24H110M-6 -10H130M-6 4H100', '#aab4c6', 3)}${L('M-130 40H130M-130 54H130M-130 68H110M-130 82H130', '#aab4c6', 3)}</g>`, { cls: 'up' });
    s.step(2, `<ellipse cx="320" cy="140" rx="94" ry="56" fill="none" stroke="#dc2626" stroke-width="5" stroke-dasharray="1 0"/>`, { cls: 'wipe' });
    s.mv(2, 'translate(-70px,-60px)', pencil(430, 100, 1.4, 35), { d: 0.8 });
    s.step(3, star(470, 66, 14) + magnifier(400, 220, 0.8), { cls: 'pop' });
  }],
  ['diabetes', '#b91c1c', '단 음식을 많이 먹어 혈당이 높아져 주사로 조절한다', (s) => {
    s.sky('pink'); s.ground('floor', 252);
    s.step(1, table(150, 236, 220) + cake(110, 226, 1.1) + `<g transform="translate(190 226)">${C(0, -12, 12, '#ef4444')}${C(26, -12, 12, '#3b82f6')}${C(13, -30, 12, '#facc15')}</g>`, { cls: 'up' });
    s.step(2, `<g transform="translate(380 200)">${R(-40, -30, 80, 56, '#e5e9f0', 8, 'stroke="#aab4c6" stroke-width="3"')}${R(-30, -22, 60, 22, '#1f2937', 3)}${R(-26, -16, 52, 10, '#ef4444', 2)}${C(0, 14, 5, '#aab4c6')}</g>` + drop(380, 130, 1.1, '#e0182d'), { cls: 'pop' });
    s.step(3, `<g transform="translate(470 120) rotate(-30)">${R(-36, -6, 72, 12, '#fff', 4, 'stroke="#aab4c6" stroke-width="2"')}${R(36, -2, 26, 4, '#8a93a5')}${R(-48, -10, 12, 20, '#8a93a5', 3)}${R(-12, -5, 30, 10, '#3b82f6', 3)}</g>`, { cls: 'up' });
    s.badge('check', 500, 250, 3);
  }],
  ['constitute', '#0369a1', '여러 벽돌이 모여 하나의 집을 구성한다', (s) => {
    s.sky('day'); s.ground('grass', 244);
    s.mv(1, 'translate(-120px,-50px) rotate(-10deg)', R(200, 160, 160, 84, '#c9a37a', 3, 'stroke="#8c6238" stroke-width="3"') + L('M200 188H360M200 216H360M240 160V188M300 188V216M330 160V188M260 216V244', '#8c6238', 3), { d: 1 });
    s.mv(2, 'translateY(-120px)', P('M186 160L280 80L374 160Z', '#c0392b'), { d: 0.9 });
    s.step(3, door(280, 244, 40, 56) + R(215, 180, 34, 28, '#cfeaff', 2, 'stroke="#fff" stroke-width="3"') + R(311, 180, 34, 28, '#cfeaff', 2, 'stroke="#fff" stroke-width="3"'), { cls: 'up' });
    s.step(3, star(430, 90, 12), { cls: 'pop' });
  }],
];
