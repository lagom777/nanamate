import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  INK,
  PAPER,
  type Palette,
  clear,
  grain,
  label,
  display,
  roundRect,
  inRect,
  hit,
  burst,
  stepSparks,
  drawSparks,
  shuffle,
  type Spark,
} from "@/lib/games/draw";

type Phase = "fix" | "trial" | "feedback" | "pass" | "fail" | "done";
type Ptr = { x: number; y: number; down: boolean };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function hud(hooks: GameHooks, level: number, total: number, score: number, status: string, coach: string) {
  hooks.onHud({ level, total, score, status, coach });
}

function run(
  canvas: HTMLCanvasElement,
  reset: () => void,
  step: (dt: number, ctx: CanvasRenderingContext2D, w: number, h: number, ptr: Ptr, justDown: boolean) => void,
): GameHandle {
  const view = bindCanvas(canvas);
  let wasDown = false;
  reset();
  const stop = startLoop((dt) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    const justDown = view.ptr.down && !wasDown;
    if (justDown) unlockAudio();
    step(dt, ctx, w, h, view.ptr, justDown);
    wasDown = view.ptr.down;
  });
  return {
    destroy: () => {
      stop();
      view.destroy();
    },
    restart: () => reset(),
  };
}

function overlay(ctx: CanvasRenderingContext2D, w: number, h: number, pal: Palette, title: string, sub: string) {
  ctx.fillStyle = pal === PAPER ? "rgba(239,234,226,0.78)" : "rgba(0,0,0,0.48)";
  ctx.fillRect(0, 0, w, h);
  display(ctx, title, w / 2, h / 2 - 12, pal.fg, 32, "center");
  label(ctx, sub, w / 2, h / 2 + 22, pal.muted, 14, "center");
}

const COLORS = [
  { name: "빨강", ink: "#c47a72" },
  { name: "파랑", ink: "#6a8eae" },
  { name: "초록", ink: "#8fbf9a" },
  { name: "노랑", ink: "#c4a574" },
] as const;

const SOA = [3.4, 2.9, 2.4, 2.0, 1.65, 1.35, 1.2, 1.05, 0.92];
const FIX = [0.35, 0.3, 0.26, 0.22, 0.18, 0.15, 0.13, 0.12, 0.1];
const PSY_NAMES = ["주의", "감각", "학습", "기억", "사고", "발달", "성격", "사회", "임상"];

function playPsy(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = INK;
  const rm = reducedMotion();
  const total = 9;
  const per = 12;
  let level = 0;
  let score = 0;
  let phase: Phase = "fix";
  let finished = false;
  let trial = 0;
  let correct = 0;
  let word = 0;
  let ink = 1;
  let pick = -1;
  let left = SOA[0];
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  let coach = "글자가 아니라 잉크의 색.";

  const nextStim = () => {
    word = Math.floor(Math.random() * 4);
    const others = [0, 1, 2, 3].filter((i) => i !== word);
    ink = others[Math.floor(Math.random() * others.length)];
    pick = -1;
    phase = "fix";
    lock = FIX[level];
    left = SOA[level];
    coach = `시행 ${trial + 1}/${per} · 잉크를 누르세요.`;
    hud(hooks, level + 1, total, score, PSY_NAMES[level], coach);
  };

  const load = () => {
    trial = 0;
    correct = 0;
    nextStim();
  };

  const resetAll = () => {
    level = 0;
    score = 0;
    finished = false;
    sparks = [];
    t = 0;
    load();
  };

  const settle = (ok: boolean, w: number, h: number) => {
    if (phase !== "trial" || finished) return;
    phase = "feedback";
    lock = 0.38;
    if (ok) {
      correct += 1;
      score += 12 + Math.round(left * 8);
      burst(sparks, w / 2, h * 0.38, pal.ok, rm ? 4 : 12);
      tone(640, 0.07, "sine", 0.055);
      coach = "잉크.";
    } else {
      noiseBurst(0.07, 0.04);
      coach = `잉크는 ${COLORS[ink].name}.`;
    }
    hud(hooks, level + 1, total, score, PSY_NAMES[level], coach);
  };

  const after = (w: number, h: number) => {
    trial += 1;
    if (trial >= per) {
      const acc = correct / per;
      if (acc >= 0.8) {
        score += 40 + Math.round(acc * 40);
        if (level + 1 >= total) {
          phase = "done";
          finished = true;
          coach = "주의는 억제다.";
          hud(hooks, total, total, score, "억제", coach);
          hooks.onClear(score);
          return;
        }
        phase = "pass";
        lock = 1.0;
        coach = `정확 ${(acc * 100).toFixed(0)}%. 다음.`;
        hud(hooks, level + 1, total, score, PSY_NAMES[level], coach);
        burst(sparks, w / 2, h * 0.3, pal.ok, rm ? 5 : 14);
      } else {
        phase = "fail";
        lock = 0.35;
        coach = `정확 ${(acc * 100).toFixed(0)}% — 80%가 필요하다. 눌러 다시.`;
        noiseBurst(0.1, 0.045);
        hud(hooks, level + 1, total, score, PSY_NAMES[level], coach);
      }
    } else {
      nextStim();
    }
  };

  return run(canvas, resetAll, (dt, ctx, w, h, ptr, justDown) => {
    t += dt;
    lock = Math.max(0, lock - dt);
    const btns = COLORS.map((c, i) => {
      const bw = Math.max(72, (w - 50) / 4);
      return { i, x: 16 + i * (bw + 6), y: h - 78, w: bw, h: 58, name: c.name, ink: c.ink };
    });

    if (phase === "fix" && lock <= 0) phase = "trial";
    if (phase === "trial") {
      left -= dt;
      if (left <= 0) settle(false, w, h);
      else if (justDown) {
        const b = btns.find((b) => inRect(ptr.x, ptr.y, b.x, b.y, b.w, b.h));
        if (b) {
          pick = b.i;
          settle(b.i === ink, w, h);
        }
      }
    } else if (phase === "feedback" && lock <= 0) {
      after(w, h);
    } else if (phase === "fail" && justDown && lock <= 0) {
      load();
    } else if (phase === "pass" && lock <= 0) {
      level += 1;
      load();
    }

    clear(ctx, w, h, pal);
    display(ctx, PSY_NAMES[level], 20, 28, pal.fg, 26, "left");
    label(ctx, coach, 20, 52, pal.muted, 13, "left");

    const barW = w - 40;
    ctx.fillStyle = pal.fill;
    roundRect(ctx, 20, 70, barW, 8, 4);
    ctx.fill();
    ctx.fillStyle = left < 0.6 ? pal.bad : pal.accent;
    if (phase === "trial") {
      roundRect(ctx, 20, 70, barW * clamp(left / SOA[level], 0, 1), 8, 4);
      ctx.fill();
    }

    if (phase === "fix") {
      ctx.fillStyle = pal.muted;
      ctx.fillRect(w / 2 - 10, h * 0.38 - 1.5, 20, 3);
      ctx.fillRect(w / 2 - 1.5, h * 0.38 - 10, 3, 20);
    } else {
      display(ctx, COLORS[word].name, w / 2, h * 0.38, COLORS[ink].ink, 56, "center");
    }

    btns.forEach((b) => {
      const hot = inRect(ptr.x, ptr.y, b.x, b.y, b.w, b.h);
      ctx.fillStyle = b.ink;
      roundRect(ctx, b.x, b.y, b.w, b.h, 10);
      ctx.fill();
      if (phase === "feedback" && b.i === ink) {
        ctx.strokeStyle = pal.ok;
        ctx.lineWidth = 3;
        roundRect(ctx, b.x, b.y, b.w, b.h, 10);
        ctx.stroke();
      } else if (phase === "feedback" && b.i === pick && pick !== ink) {
        ctx.strokeStyle = pal.bad;
        ctx.lineWidth = 3;
        roundRect(ctx, b.x, b.y, b.w, b.h, 10);
        ctx.stroke();
      }
      label(ctx, b.name, b.x + b.w / 2, b.y + b.h / 2, hot ? "#111" : "#1a1814", 15, "center");
    });

    label(ctx, `${correct}/${trial} · ${SOA[level].toFixed(1)}초`, w - 20, 28, pal.muted, 12, "right");
    grain(ctx, w, h, Math.floor(t * 6), 0.03);
    stepSparks(sparks, dt);
    drawSparks(ctx, sparks);
    if (phase === "fail") overlay(ctx, w, h, pal, "억제 실패", "눌러 이 단계를 다시");
    if (phase === "pass") overlay(ctx, w, h, pal, "통과", "더 빠른 SOA");
    if (phase === "done") overlay(ctx, w, h, pal, "스트룹", "자동을 꺾었다");
    void hit;
  });
}

type Item = { word: string; ok: string; trap: string; d1: string; d2: string };

const TEPS_BANK: Item[][] = [
  [
    { word: "mitigate", ok: "완화하다", trap: "exacerbate", d1: "운반하다", d2: "장식하다" },
    { word: "abundant", ok: "풍부한", trap: "scarce", d1: "둥근", d2: "시끄러운" },
    { word: "refuse", ok: "거절하다", trap: "accept", d1: "달리다", d2: "요리하다" },
    { word: "ancient", ok: "고대의", trap: "modern", d1: "달콤한", d2: "빠른" },
    { word: "vanish", ok: "사라지다", trap: "appear", d1: "계산하다", d2: "붙이다" },
    { word: "timid", ok: "소심한", trap: "bold", d1: "비싼", d2: "축축한" },
    { word: "expand", ok: "확장하다", trap: "shrink", d1: "속삭이다", d2: "빌리다" },
    { word: "fragile", ok: "깨지기 쉬운", trap: "sturdy", d1: "유명한", d2: "늦은" },
    { word: "reluctant", ok: "마지못한", trap: "eager", d1: "짠", d2: "미끄러운" },
    { word: "genuine", ok: "진짜의", trap: "fake", d1: "노란", d2: "시끄러운" },
  ],
  [
    { word: "concise", ok: "간결한", trap: "verbose", d1: "무거운", d2: "노란" },
    { word: "prohibit", ok: "금지하다", trap: "permit", d1: "노래하다", d2: "접다" },
    { word: "vivid", ok: "선명한", trap: "dull", d1: "짠", d2: "비싼" },
    { word: "omit", ok: "생략하다", trap: "include", d1: "달리다", d2: "심다" },
    { word: "hostile", ok: "적대적인", trap: "friendly", d1: "둥근", d2: "축축한" },
    { word: "prosper", ok: "번영하다", trap: "fail", d1: "속삭이다", d2: "자르다" },
    { word: "scarce", ok: "희소한", trap: "plentiful", d1: "달콤한", d2: "빠른" },
    { word: "candid", ok: "솔직한", trap: "deceitful", d1: "무거운", d2: "파란" },
    { word: "endure", ok: "견디다", trap: "quit", d1: "장식하다", d2: "빌리다" },
    { word: "trivial", ok: "사소한", trap: "crucial", d1: "미끄러운", d2: "늦은" },
  ],
  [
    { word: "alleviate", ok: "덜어 주다", trap: "aggravate", d1: "수집하다", d2: "번역하다" },
    { word: "prudent", ok: "신중한", trap: "reckless", d1: "향기로운", d2: "좁은" },
    { word: "obscure", ok: "모호한", trap: "obvious", d1: "달콤한", d2: "거친" },
    { word: "commend", ok: "칭찬하다", trap: "criticize", d1: "측정하다", d2: "빌려주다" },
    { word: "meager", ok: "빈약한", trap: "ample", d1: "둥근", d2: "빠른" },
    { word: "adhere", ok: "고수하다", trap: "abandon", d1: "요리하다", d2: "접다" },
    { word: "plausible", ok: "그럴듯한", trap: "absurd", d1: "축축한", d2: "비싼" },
    { word: "diminish", ok: "줄어들다", trap: "increase", d1: "속삭이다", d2: "심다" },
    { word: "arduous", ok: "힘든", trap: "effortless", d1: "노란", d2: "짠" },
    { word: "willing", ok: "기꺼이 하는", trap: "reluctant", d1: "미끄러운", d2: "늦은" },
  ],
  [
    { word: "exacerbate", ok: "악화시키다", trap: "mitigate", d1: "수집하다", d2: "장식하다" },
    { word: "ubiquitous", ok: "어디에나 있는", trap: "rare", d1: "향기로운", d2: "둥근" },
    { word: "ephemeral", ok: "덧없는", trap: "lasting", d1: "짠", d2: "빠른" },
    { word: "scrutinize", ok: "면밀히 살피다", trap: "ignore", d1: "달리다", d2: "접다" },
    { word: "ambiguous", ok: "애매한", trap: "explicit", d1: "축축한", d2: "비싼" },
    { word: "bolster", ok: "떠받치다", trap: "undermine", d1: "속삭이다", d2: "심다" },
    { word: "tentative", ok: "잠정적인", trap: "definitive", d1: "노란", d2: "거친" },
    { word: "discrepancy", ok: "불일치", trap: "agreement", d1: "향기", d2: "무게" },
    { word: "obsolete", ok: "쓸모없어진", trap: "current", d1: "미끄러운", d2: "늦은" },
    { word: "impartial", ok: "편견 없는", trap: "biased", d1: "달콤한", d2: "좁은" },
  ],
  [
    { word: "recalcitrant", ok: "완강한", trap: "compliant", d1: "향기로운", d2: "둥근" },
    { word: "esoteric", ok: "소수만 아는", trap: "mainstream", d1: "짠", d2: "빠른" },
    { word: "vindicate", ok: "결백을 밝히다", trap: "incriminate", d1: "측정하다", d2: "접다" },
    { word: "prolific", ok: "다작의", trap: "barren", d1: "축축한", d2: "비싼" },
    { word: "tenuous", ok: "빈약한", trap: "robust", d1: "속삭이다", d2: "심다" },
    { word: "ameliorate", ok: "개선하다", trap: "worsen", d1: "요리하다", d2: "빌리다" },
    { word: "equivocal", ok: "두 가지로 읽히는", trap: "unequivocal", d1: "노란", d2: "거친" },
    { word: "sycophant", ok: "아첨꾼", trap: "critic", d1: "농부", d2: "선원" },
    { word: "laconic", ok: "간결한", trap: "garrulous", d1: "미끄러운", d2: "늦은" },
    { word: "austere", ok: "엄격한", trap: "indulgent", d1: "달콤한", d2: "좁은" },
  ],
  [
    { word: "intransigent", ok: "타협하지 않는", trap: "flexible", d1: "향기로운", d2: "둥근" },
    { word: "obfuscate", ok: "흐리다", trap: "clarify", d1: "달리다", d2: "접다" },
    { word: "perfunctory", ok: "형식적인", trap: "thorough", d1: "짠", d2: "빠른" },
    { word: "recondite", ok: "난해한", trap: "accessible", d1: "축축한", d2: "비싼" },
    { word: "abrogate", ok: "폐지하다", trap: "enact", d1: "속삭이다", d2: "심다" },
    { word: "pulchritude", ok: "아름다움", trap: "ugliness", d1: "속도", d2: "무게" },
    { word: "pusillanimous", ok: "비겁한", trap: "courageous", d1: "노란", d2: "거친" },
    { word: "inchoate", ok: "초기 단계의", trap: "fully formed", d1: "달콤한", d2: "좁은" },
    { word: "magnanimous", ok: "도량이 넓은", trap: "petty", d1: "빠른", d2: "짠" },
    { word: "apocryphal", ok: "출처가 의심되는", trap: "authentic", d1: "미끄러운", d2: "늦은" },
  ],
  [
    { word: "salient", ok: "두드러진", trap: "obscure", d1: "달콤한", d2: "둥근" },
    { word: "curtail", ok: "줄이다", trap: "extend", d1: "요리하다", d2: "심다" },
    { word: "benevolent", ok: "자비로운", trap: "malicious", d1: "빠른", d2: "짠" },
    { word: "tentative", ok: "잠정적인", trap: "certain", d1: "축축한", d2: "노란" },
    { word: "lucid", ok: "명쾌한", trap: "confused", d1: "무거운", d2: "늦은" },
    { word: "adhere", ok: "고수하다", trap: "depart", d1: "접다", d2: "빌리다" },
    { word: "paucity", ok: "부족", trap: "abundance", d1: "향기", d2: "속도" },
    { word: "candid", ok: "솔직한", trap: "evasive", d1: "미끄러운", d2: "좁은" },
    { word: "robust", ok: "튼튼한", trap: "fragile", d1: "달콤한", d2: "파란" },
    { word: "omit", ok: "빼다", trap: "insert", d1: "달리다", d2: "속삭이다" },
  ],
  [
    { word: "pragmatic", ok: "실용적인", trap: "idealistic", d1: "향기로운", d2: "둥근" },
    { word: "elicit", ok: "이끌어 내다", trap: "suppress", d1: "요리하다", d2: "접다" },
    { word: "coherent", ok: "일관된", trap: "disjointed", d1: "짠", d2: "빠른" },
    { word: "sparse", ok: "드문", trap: "dense", d1: "축축한", d2: "비싼" },
    { word: "endorse", ok: "지지하다", trap: "oppose", d1: "심다", d2: "빌리다" },
    { word: "subtle", ok: "미묘한", trap: "blatant", d1: "노란", d2: "거친" },
    { word: "viable", ok: "실행 가능한", trap: "unworkable", d1: "달콤한", d2: "좁은" },
    { word: "concise", ok: "간결한", trap: "wordy", d1: "미끄러운", d2: "늦은" },
    { word: "impair", ok: "손상시키다", trap: "improve", d1: "속삭이다", d2: "달리다" },
    { word: "plausible", ok: "그럴듯한", trap: "implausible", d1: "무거운", d2: "파란" },
  ],
  [
    { word: "resilient", ok: "회복력 있는", trap: "fragile", d1: "향기로운", d2: "둥근" },
    { word: "defer", ok: "미루다", trap: "advance", d1: "요리하다", d2: "접다" },
    { word: "acute", ok: "예리한", trap: "dull", d1: "짠", d2: "빠른" },
    { word: "scarce", ok: "부족한", trap: "plenty", d1: "축축한", d2: "비싼" },
    { word: "assert", ok: "주장하다", trap: "deny", d1: "심다", d2: "빌리다" },
    { word: "mundane", ok: "일상적인", trap: "extraordinary", d1: "노란", d2: "거친" },
    { word: "feasible", ok: "가능한", trap: "impossible", d1: "달콤한", d2: "좁은" },
    { word: "vague", ok: "모호한", trap: "precise", d1: "미끄러운", d2: "늦은" },
    { word: "hinder", ok: "방해하다", trap: "facilitate", d1: "속삭이다", d2: "달리다" },
    { word: "sincere", ok: "진실한", trap: "insincere", d1: "무거운", d2: "파란" },
  ],
];

const TEPS_NAMES = ["개요", "듣기 대화", "듣기 강연", "어휘", "문법", "독해 기초", "독해 심화", "시간", "점수"];

function playTeps(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = PAPER;
  const rm = reducedMotion();
  const total = 9;
  const per = 10;
  const LIMIT = 8;
  let level = 0;
  let score = 0;
  let phase: Phase = "trial";
  let finished = false;
  let items: Item[] = [];
  let order: number[] = [0, 1, 2, 3];
  let trial = 0;
  let correct = 0;
  let pick = -1;
  let left = LIMIT;
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  let coach = "같은 뜻. 반의어 함정을 피하세요.";

  const stim = () => items[Math.min(trial, items.length - 1)];

  const deal = () => {
    const it = stim();
    order = shuffle([0, 1, 2, 3]);
    pick = -1;
    phase = "trial";
    left = LIMIT;
    lock = 0.12;
    coach = `${it.word} 의 동의어`;
    hud(hooks, level + 1, total, score, TEPS_NAMES[level], coach);
  };

  const load = () => {
    items = shuffle(TEPS_BANK[level]).slice(0, per);
    trial = 0;
    correct = 0;
    deal();
  };

  const resetAll = () => {
    level = 0;
    score = 0;
    finished = false;
    sparks = [];
    t = 0;
    load();
  };

  const settle = (ok: boolean, w: number, h: number) => {
    if (phase !== "trial" || finished) return;
    phase = "feedback";
    lock = 0.55;
    if (ok) {
      correct += 1;
      score += 14 + Math.round(left * 3);
      burst(sparks, w / 2, h * 0.28, pal.ok, rm ? 4 : 12);
      tone(640, 0.07, "sine", 0.055);
      coach = "동의.";
    } else {
      noiseBurst(0.07, 0.04);
      coach = `동의어는 ${stim().ok}. 함정은 ${stim().trap}.`;
    }
    hud(hooks, level + 1, total, score, TEPS_NAMES[level], coach);
  };

  const after = (w: number, h: number) => {
    trial += 1;
    if (trial >= per) {
      if (correct >= 7) {
        score += 50 + correct * 4;
        if (level + 1 >= total) {
          phase = "done";
          finished = true;
          coach = "동의는 교집합이지 전체가 아니다.";
          hud(hooks, total, total, score, "질주", coach);
          hooks.onClear(score);
          return;
        }
        phase = "pass";
        lock = 1.0;
        coach = `${correct}/${per}. 다음 난이도.`;
        hud(hooks, level + 1, total, score, TEPS_NAMES[level], coach);
        burst(sparks, w / 2, h * 0.3, pal.ok, rm ? 5 : 14);
      } else {
        phase = "fail";
        lock = 0.35;
        coach = `${correct}/${per} — 7개가 필요하다. 눌러 다시.`;
        noiseBurst(0.1, 0.045);
        hud(hooks, level + 1, total, score, TEPS_NAMES[level], coach);
      }
    } else {
      deal();
    }
  };

  return run(canvas, resetAll, (dt, ctx, w, h, ptr, justDown) => {
    t += dt;
    lock = Math.max(0, lock - dt);
    const it = stim();
    const labels = order.map((oi) => [it.ok, it.trap, it.d1, it.d2][oi]);
    const btns = labels.map((text, i) => {
      const cols = 2;
      const bw = Math.max(44, (w - 42) / 2);
      const bh = 56;
      const c = i % cols;
      const r = Math.floor(i / cols);
      return { i, x: 16 + c * (bw + 10), y: h - 20 - (2 - r) * (bh + 10) + 10, w: bw, h: bh, text, key: order[i] };
    });

    if (phase === "trial") {
      left -= dt;
      if (left <= 0) settle(false, w, h);
      else if (justDown && lock <= 0) {
        const b = btns.find((b) => inRect(ptr.x, ptr.y, b.x, b.y, b.w, b.h));
        if (b) {
          pick = b.key;
          settle(b.key === 0, w, h);
        }
      }
    } else if (phase === "feedback" && lock <= 0) {
      after(w, h);
    } else if (phase === "fail" && justDown && lock <= 0) {
      load();
    } else if (phase === "pass" && lock <= 0) {
      level += 1;
      load();
    }

    clear(ctx, w, h, pal);
    display(ctx, TEPS_NAMES[level], 20, 28, pal.fg, 26, "left");
    label(ctx, coach, 20, 52, pal.muted, 13, "left");

    const barW = w - 40;
    ctx.fillStyle = pal.fill;
    roundRect(ctx, 20, 70, barW, 8, 4);
    ctx.fill();
    ctx.fillStyle = left < 2 ? pal.bad : pal.accent;
    if (phase === "trial") {
      roundRect(ctx, 20, 70, barW * clamp(left / LIMIT, 0, 1), 8, 4);
      ctx.fill();
    }

    display(ctx, it.word, w / 2, h * 0.32, pal.fg, 40, "center");
    label(ctx, `${correct}/${trial} · ${left > 0 && phase === "trial" ? left.toFixed(1) : "—"}초`, w - 20, 28, pal.muted, 12, "right");

    btns.forEach((b) => {
      const hot = inRect(ptr.x, ptr.y, b.x, b.y, b.w, b.h);
      let fill = hot ? pal.accent : pal.fill;
      if (phase === "feedback" || phase === "pass" || phase === "done") {
        if (b.key === 0) fill = pal.ok;
        else if (b.key === pick) fill = pal.bad;
      }
      ctx.fillStyle = fill;
      roundRect(ctx, b.x, b.y, b.w, b.h, 10);
      ctx.fill();
      ctx.strokeStyle = pal.line;
      roundRect(ctx, b.x, b.y, b.w, b.h, 10);
      ctx.stroke();
      label(ctx, b.text, b.x + b.w / 2, b.y + b.h / 2, hot && phase === "trial" ? pal.bg : pal.fg, 15, "center");
    });

    grain(ctx, w, h, Math.floor(t * 5), 0.03);
    stepSparks(sparks, dt);
    drawSparks(ctx, sparks);
    if (phase === "fail") overlay(ctx, w, h, pal, "시간 · 함정", "눌러 이 단계를 다시");
    if (phase === "pass") overlay(ctx, w, h, pal, "통과", "더 얇은 뉘앙스");
    if (phase === "done") overlay(ctx, w, h, pal, "질주", "동의는 교집합");
    void hit;
  });
}

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  if (id === "teps") return playTeps(canvas, hooks);
  return playPsy(canvas, hooks);
}
