/* 플래그십 9종 게임의 순수 로직 단위 테스트 — node --test shared/flagship.test.mjs
   각 flagship-*.js를 텍스트로 읽어 new Function('module','exports','window', src)로
   인스턴스화해 가드된 module.exports를 뽑아낸다(type:module 컨텍스트에서 require/import가
   빈 객체를 주는 모호성을 우회). window/document 미주입 → 브라우저 init 자동 스킵.
   프로덕션 파일은 건드리지 않는다. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** flagship-*.js의 module.exports(순수 로직)만 격리 반환. */
function load(file) {
  const src = readFileSync(new URL('./' + file, import.meta.url), 'utf8');
  const module = { exports: {} };
  new Function('module', 'exports', 'window', src)(module, module.exports, undefined);
  return module.exports;
}

test('market: 균형가/수요·공급 단조성/초과 부호/청산 경계', () => {
  const M = load('flagship-market.js');
  const model = { a: 100, b: 2, c: 10, d: 3 }; // P* = (100-10)/(2+3) = 18, Q* = 64
  assert.equal(M.equilibriumPrice(model), 18);
  assert.equal(M.equilibriumQty(model), 64);
  assert.equal(M.demandQty(model, 18), M.supplyQty(model, 18)); // 균형에서 D=S
  // 수요 우하향(감소), 공급 우상향(증가)
  assert.ok(M.demandQty(model, 10) > M.demandQty(model, 20));
  assert.ok(M.supplyQty(model, 20) > M.supplyQty(model, 10));
  // 초과 부호: 균형가 위=잉여(+), 아래=부족(-), 균형=0
  assert.ok(M.excess(model, 25) > 0);
  assert.ok(M.excess(model, 5) < 0);
  assert.equal(M.excess(model, 18), 0);
  // 청산 허용오차 경계: P=19에서 excess = -90 + 5·19 = 5
  assert.equal(M.excess(model, 19), 5);
  assert.equal(M.isCleared(model, 19, 5), true);
  assert.equal(M.isCleared(model, 19, 4.999), false);
});

test('dna: 상보(A↔T·G↔C 양방향)/페어/상보가닥/완성판정', () => {
  const D = load('flagship-dna.js');
  assert.equal(D.complement('A'), 'T');
  assert.equal(D.complement('T'), 'A');
  assert.equal(D.complement('G'), 'C');
  assert.equal(D.complement('C'), 'G');
  assert.equal(D.complement('X'), null);
  assert.equal(D.isCorrectPair('A', 'T'), true);
  assert.equal(D.isCorrectPair('A', 'G'), false);
  assert.deepEqual(D.complementStrand('ATGC'), ['T', 'A', 'C', 'G']);
  assert.equal(D.complementStrand('ATX'), null); // 유효하지 않은 염기
  assert.equal(D.isStrandComplete('AT', ['T', 'A']), true);
  assert.equal(D.isStrandComplete('AT', ['T', 'G']), false); // 오답 포함
  assert.equal(D.isStrandComplete('AT', ['T']), false);      // 길이 불일치
  assert.equal(D.isStrandComplete('', []), false);           // 빈 가닥
});

test('timeline: 시대 경계/분류 정답 여부', () => {
  const T = load('flagship-timeline.js');
  // 476~999 early, 1000~1299 high, 1300~1453 late (경계 포함)
  assert.equal(T.eraForYear(476), 'early');
  assert.equal(T.eraForYear(999), 'early');
  assert.equal(T.eraForYear(1000), 'high');
  assert.equal(T.eraForYear(1299), 'high');
  assert.equal(T.eraForYear(1300), 'late');
  assert.equal(T.eraForYear(1453), 'late');
  assert.equal(T.eraForYear(475), null);
  assert.equal(T.eraForYear(1454), null);
  assert.equal(T.classify(800, 'early'), true);
  assert.equal(T.classify(800, 'high'), false);
});

test('molecule: 완성판정/원자가 충족/구성 일치/결합 상한', () => {
  const C = load('flagship-molecule.js');
  const H2O = C.TARGETS[0]; // O·H·H, 단일결합 2개
  const CO2 = C.TARGETS[1]; // C·O·O, 이중결합 2개
  const waterBonds = [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 1 }];
  const co2Bonds = [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 2 }];
  assert.equal(C.isComplete(H2O, H2O.atoms, waterBonds), true);
  assert.equal(C.isComplete(CO2, CO2.atoms, co2Bonds), true);
  // 결합 하나 빠지면 원자가 미충족 → 미완성
  assert.equal(C.isComplete(H2O, H2O.atoms, [{ a: 0, b: 1, order: 1 }]), false);
  assert.equal(C.allValenceSatisfied(H2O.atoms, waterBonds), true);
  assert.equal(C.allValenceSatisfied(H2O.atoms, [{ a: 0, b: 1, order: 1 }]), false);
  assert.equal(C.sameComposition(C.composition(H2O.atoms), { O: 1, H: 2 }), true);
  assert.equal(C.sameComposition(C.composition(H2O.atoms), { O: 1, H: 1 }), false);
  // 원자가 상한: H(1)는 이미 단일결합을 쓰면 추가 결합 불가
  assert.equal(C.canBond(H2O.atoms, [], 0, 1, 1), true);
  assert.equal(C.canBond(H2O.atoms, [{ a: 0, b: 1, order: 1 }], 0, 1, 1), false);
  assert.equal(C.canBond(H2O.atoms, [], 0, 0, 1), false); // 같은 원자끼리 불가
});

test('tectonics: 운동 분류(수렴/발산/변환)/승리/수렴 지형', () => {
  const K = load('flagship-tectonics.js');
  const conv = K.classifyMotion({ x: 1, z: 0 }, { x: -1, z: 0 });  // 서로 다가감
  const div = K.classifyMotion({ x: -1, z: 0 }, { x: 1, z: 0 });   // 서로 멀어짐
  const trans = K.classifyMotion({ x: 0, z: 1 }, { x: 0, z: -1 }); // 엇갈림
  assert.equal(conv.type, 'convergent');
  assert.equal(div.type, 'divergent');
  assert.equal(trans.type, 'transform');
  assert.equal(K.isWin('convergent', conv), true);
  assert.equal(K.isWin('divergent', conv), false);
  // 대륙-대륙만 습곡산맥, 해양 포함 시 섭입(해구)
  assert.equal(K.convergentLandform('continental', 'continental'), 'mountain');
  assert.equal(K.convergentLandform('oceanic', 'continental'), 'trench');
  assert.equal(K.convergentLandform('oceanic', 'oceanic'), 'trench');
});

test('chord: midiToFreq/화음 구성/완성(순서무관)/올바른 음', () => {
  const C = load('flagship-chord.js');
  assert.equal(C.midiToFreq(69), 440);
  assert.equal(C.midiToFreq(81), 880);
  assert.deepEqual(C.chordNotes(60, 'major'), [60, 64, 67]); // 장3도 4, 완전5도 7
  assert.deepEqual(C.chordNotes(60, 'minor'), [60, 63, 67]); // 단3도 3, 완전5도 7
  assert.equal(C.isChordComplete([67, 60, 64], [60, 64, 67]), true);  // 순서 무관
  assert.equal(C.isChordComplete([60, 64], [60, 64, 67]), false);      // 개수 부족
  assert.equal(C.isChordComplete([60, 64, 68], [60, 64, 67]), false);  // 구성 불일치
  assert.equal(C.isCorrectNote(64, [60, 64, 67]), true);
  assert.equal(C.isCorrectNote(65, [60, 64, 67]), false);
});

test('geometry: 빗변/정수빗변/단계 클리어/정사각형 넓이', () => {
  const G = load('flagship-geometry.js');
  assert.equal(G.hypotenuse(3, 4), 5);
  assert.equal(G.isIntegerHypotenuse(3, 4), true);
  assert.equal(G.isIntegerHypotenuse(2, 2), false);
  assert.equal(G.isIntegerHypotenuse(-1, 4), false);
  const L0 = G.LEVELS[0]; // 3-4-5
  assert.equal(G.isLevelCleared(3, 4, L0), true);
  assert.equal(G.isLevelCleared(4, 3, L0), true);          // 순서 무관
  assert.equal(G.isLevelCleared(3, 5, L0), false);         // 9+25=34 ≠ 25
  assert.equal(G.isLevelCleared(6, 8, G.LEVELS[1]), true); // 36+64=100
  assert.equal(G.isLevelCleared(0, 4, L0), false);
  assert.deepEqual(G.squares(3, 4), { aSq: 9, bSq: 16, sum: 25, cSq: 25 });
});

test('orbit: 원형속도/중력 방향/판정/시뮬(안정=승리, 저속=충돌)', () => {
  const O = load('flagship-orbit.js');
  assert.equal(O.circularSpeed(4, 16), 2); // sqrt(16/4)=2
  // 중력은 원점을 향한다: (5,0)에서 ax<0, ay=0
  const g = O.gravityAccel(5, 0, 1);
  assert.ok(g.ax < 0);
  assert.ok(g.ay === 0); // -0도 통과(원점 방향, y성분 없음)
  assert.equal(O.classifyOutcome({ x: 0, y: 0.5 }, 1, 10), 'crash');
  assert.equal(O.classifyOutcome({ x: 20, y: 0 }, 1, 10), 'escape');
  assert.equal(O.classifyOutcome({ x: 5, y: 0 }, 1, 10), 'alive');
  const mu = 100, r = 10;
  // 원형속도로 발사 → 안정 궤도 유지 → win
  const stable = O.simulateOrbit({ x: r, y: 0, vx: 0, vy: O.circularSpeed(r, mu), mu, eps: 0, rStar: 2, rMax: 40, target: 20, dt: 1 / 240 });
  assert.equal(stable.outcome, 'win');
  // 원형속도보다 크게 느리면 별로 낙하 → crash
  const slow = O.simulateOrbit({ x: r, y: 0, vx: 0, vy: 1, mu, eps: 0, rStar: 2, rMax: 40, target: 20, dt: 1 / 240 });
  assert.equal(slow.outcome, 'crash');
});

test('waves: 파장/경로차/위상차/보강간섭 판정', () => {
  const W = load('flagship-waves.js').Physics;
  assert.equal(W.wavelength(340, 340), 1);
  // 두 파원(-1,0),(1,0)에서 등거리인 (0,5)는 경로차 0
  assert.equal(W.pathDiff(0, 5, -1, 0, 1, 0), 0);
  assert.equal(W.phaseDiff(0, 5, -1, 0, 1, 0, 1, 0), 0);
  // 등거리·위상차0 → 정규화 진폭 |cos0|=1 (보강간섭 최대)
  assert.equal(W.normAmplitude(0, 5, -1, 0, 1, 0, 1, 0), 1);
  assert.equal(W.isConstructive(1, 0.9), true);
  assert.equal(W.isConstructive(0.5, 0.9), false);
  assert.equal(W.targetWins({ x: 0, y: 5 }, -1, 0, 1, 0, 1, 0, 0.9), true);
});
