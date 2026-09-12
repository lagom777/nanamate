import { tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  PAPER,
  clear,
  grain,
  label,
  display,
  inRect,
  burst,
  stepSparks,
  drawSparks,
  type Spark,
} from "@/lib/games/draw";

type Level = { name: string; mu: number; sig: number };

const LEVELS: Level[] = [
  { name: "중심", mu: 0.5, sig: 0.12 },
  { name: "왼쪽", mu: 0.32, sig: 0.1 },
  { name: "오른쪽", mu: 0.68, sig: 0.11 },
  { name: "넓은", mu: 0.5, sig: 0.22 },
  { name: "뾰족", mu: 0.5, sig: 0.07 },
  { name: "치우친 폭", mu: 0.4, sig: 0.16 },
  { name: "오른 봉우리", mu: 0.62, sig: 0.09 },
  { name: "회귀의 구름", mu: 0.55, sig: 0.18 },
  { name: "결정의 폭", mu: 0.48, sig: 0.14 },
];

const pal = PAPER;
const HOLD = 0.7;
const N = 40;
const BINS = 18;
const SIG_MIN = 0.04;
const SIG_MAX = 0.32;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pdf(x: number, mu: number, sig: number) {
  const s = Math.max(0.0008, sig);
  const z = (x - mu) / s;
  return Math.exp(-0.5 * z * z) / (s * Math.sqrt(2 * Math.PI));
}

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  void id;
  unlockAudio();
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  let dead = false;
  let level = 0;
  let score = 0;
  let sparks: Spark[] = [];
  let finished = false;
  let samples: number[] = [];
  let counts: number[] = [];
  let mu = 0.5;
  let sig = 0.15;
  let drag: "mu" | "sig" | null = null;
  let wasDown = false;
  let hold = 0;
  let celebrate = 0;
  let clock = 0;
  let status = "";
  let coach = "평균은 위치, 표준편차는 폭";
  let closeTone = false;

  const regen = () => {
    const L = LEVELS[level];
    const rng = mulberry32(2100 + level * 97);
    samples = [];
    for (let i = 0; i < N; i++) {
      let u = 0;
      let v = 0;
      while (u === 0) u = rng();
      while (v === 0) v = rng();
      const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
      samples.push(L.mu + L.sig * g);
    }
    counts = Array.from({ length: BINS }, () => 0);
    for (const x of samples) {
      const t = Math.min(0.999, Math.max(0, x));
      counts[Math.floor(t * BINS)] += 1;
    }
  };

  const load = () => {
    regen();
    mu = 0.5;
    sig = 0.15;
    drag = null;
    hold = 0;
    celebrate = 0;
    clock = 0;
    closeTone = false;
    status = LEVELS[level].name;
    coach = "평균은 위치, 표준편차는 폭";
    emit();
  };

  const emit = () => {
    hooks.onHud({ level: level + 1, total: LEVELS.length, score, status, coach });
  };

  const winLevel = () => {
    if (finished) return;
    const leftoverBonus = Math.max(0, Math.round(70 - clock * 2.5));
    score += 100 + leftoverBonus;
    if (level + 1 >= LEVELS.length) {
      finished = true;
      status = "추정 완료";
      coach = "정규분포는 평균으로 중심을, 표준편차로 퍼짐을 정한다";
      emit();
      hooks.onClear(score);
    } else {
      level += 1;
      load();
    }
  };

  const restart = () => {
    finished = false;
    level = 0;
    score = 0;
    sparks = [];
    load();
  };

  const layout = (w: number, h: number) => {
    const padL = 40;
    const padR = 20;
    const padT = 52;
    const padB = 108;
    return { padL, padR, padT, padB, pw: w - padL - padR, ph: h - padT - padB, muY: h - 74, sigY: h - 26 };
  };

  const xOf = (t: number, w: number, h: number) => {
    const L = layout(w, h);
    return L.padL + t * L.pw;
  };
  const tOf = (x: number, w: number, h: number) => {
    const L = layout(w, h);
    return Math.min(1, Math.max(0, (x - L.padL) / L.pw));
  };

  const fitOk = () => {
    const L = LEVELS[level];
    return Math.abs(mu - L.mu) < 0.18 && Math.abs(sig - L.sig) / L.sig < 0.22;
  };

  const hint = () => {
    const L = LEVELS[level];
    const dMu = mu - L.mu;
    const dS = (sig - L.sig) / L.sig;
    if (Math.abs(dMu) >= 0.18 && Math.abs(dMu) >= Math.abs(dS) * L.sig) {
      return dMu > 0 ? "평균을 왼쪽으로" : "평균을 오른쪽으로";
    }
    if (Math.abs(dS) >= 0.22) return dS > 0 ? "폭을 좁히세요" : "폭을 넓히세요";
    return "거의 맞습니다. 유지";
  };

  const stop = startLoop((dt) => {
    if (dead) return;
    const pressed = view.ptr.down && !wasDown;
    const released = !view.ptr.down && wasDown;
    wasDown = view.ptr.down;

    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx) return;
    clock += dt;

    const box = layout(w, h);
    const muX = xOf(mu, w, h);
    const sigT = (sig - SIG_MIN) / (SIG_MAX - SIG_MIN);
    const sigX = xOf(sigT, w, h);
    const hw = 52;
    const hh = 44;

    if (!finished && celebrate <= 0) {
      if (pressed) {
        if (inRect(view.ptr.x, view.ptr.y, muX - hw * 0.5, box.muY - hh * 0.5, hw, hh)) {
          drag = "mu";
          tone(220, 0.04, "sine", 0.03);
        } else if (inRect(view.ptr.x, view.ptr.y, sigX - hw * 0.5, box.sigY - hh * 0.5, hw, hh)) {
          drag = "sig";
          tone(200, 0.04, "sine", 0.03);
        } else if (inRect(view.ptr.x, view.ptr.y, box.padL, box.muY - 24, box.pw, 48)) {
          drag = "mu";
        } else if (inRect(view.ptr.x, view.ptr.y, box.padL, box.sigY - 24, box.pw, 48)) {
          drag = "sig";
        }
      }
      if (drag && view.ptr.down) {
        if (drag === "mu") mu = tOf(view.ptr.x, w, h);
        else sig = SIG_MIN + tOf(view.ptr.x, w, h) * (SIG_MAX - SIG_MIN);
      }
      if (released) drag = null;
    } else if (released) {
      drag = null;
    }

    const ok = fitOk();
    if (!finished && celebrate <= 0) {
      if (ok) {
        hold += dt;
        if (!closeTone) {
          closeTone = true;
          tone(400, 0.06, "sine", 0.04);
          coach = hint();
          emit();
        }
        if (hold >= HOLD) {
          celebrate = rm ? 0.16 : 0.5;
          if (!rm) burst(sparks, xOf(LEVELS[level].mu, w, h), box.padT + box.ph * 0.25, pal.ok, 18);
          tone(560, 0.1, "sine", 0.055);
          tone(740, 0.14, "triangle", 0.04);
          status = `${LEVELS[level].name} 적합`;
          emit();
        }
      } else {
        if (hold > 0.15) {
          coach = hint();
          emit();
        }
        hold = 0;
        closeTone = false;
      }
    }

    if (celebrate > 0) {
      celebrate -= dt;
      if (celebrate <= 0) winLevel();
    }

    stepSparks(sparks, dt);
    clear(ctx, w, h, pal);
    grain(ctx, w, h, 1, 0.028);

    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const y = box.padT + (box.ph * i) / 6;
      ctx.beginPath();
      ctx.moveTo(box.padL, y);
      ctx.lineTo(box.padL + box.pw, y);
      ctx.stroke();
    }

    const maxC = Math.max(1, ...counts);
    const bw = box.pw / BINS;
    for (let i = 0; i < BINS; i++) {
      const bh = (counts[i] / maxC) * box.ph * 0.82;
      const x = box.padL + i * bw;
      const y = box.padT + box.ph - bh;
      ctx.fillStyle = pal.fill;
      ctx.fillRect(x + 1.5, y, bw - 3, bh);
      ctx.strokeStyle = pal.line;
      ctx.strokeRect(x + 1.5, y, bw - 3, bh);
    }

    const densScale = (maxC / N / (1 / BINS)) * 1.05;
    const yMax = Math.max(densScale, pdf(mu, mu, sig), pdf(LEVELS[level].mu, LEVELS[level].mu, LEVELS[level].sig));

    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const x = xOf(t, w, h);
      const yn = pdf(t, mu, sig) / yMax;
      const y = box.padT + box.ph * (1 - yn * 0.88);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = ok ? pal.ok : pal.accent;
    ctx.lineWidth = 2.3;
    ctx.stroke();

    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = pal.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(muX, box.padT);
    ctx.lineTo(muX, box.padT + box.ph);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = pal.fg;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(box.padL, box.padT);
    ctx.lineTo(box.padL, box.padT + box.ph);
    ctx.lineTo(box.padL + box.pw, box.padT + box.ph);
    ctx.stroke();

    const drawHandle = (x: number, y: number, title: string, active: boolean) => {
      const hx = x - hw * 0.5;
      const hy = y - hh * 0.5;
      ctx.fillStyle = active ? "#f4efe6" : pal.fill;
      ctx.strokeStyle = active ? pal.fg : pal.accent;
      ctx.lineWidth = active ? 2 : 1.3;
      const rr = 8;
      ctx.beginPath();
      ctx.moveTo(hx + rr, hy);
      ctx.arcTo(hx + hw, hy, hx + hw, hy + hh, rr);
      ctx.arcTo(hx + hw, hy + hh, hx, hy + hh, rr);
      ctx.arcTo(hx, hy + hh, hx, hy, rr);
      ctx.arcTo(hx, hy, hx + hw, hy, rr);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      label(ctx, title, x, y, pal.fg, 13, "center");
    };

    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(box.padL, box.muY);
    ctx.lineTo(box.padL + box.pw, box.muY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(box.padL, box.sigY);
    ctx.lineTo(box.padL + box.pw, box.sigY);
    ctx.stroke();

    drawHandle(muX, box.muY, "μ", drag === "mu");
    drawHandle(sigX, box.sigY, "σ", drag === "sig");

    display(ctx, LEVELS[level].name, 20, 26, pal.fg, 24, "left");
    label(ctx, `μ ${mu.toFixed(2)}   σ ${sig.toFixed(2)}`, w - 18, 22, ok ? pal.ok : pal.muted, 12, "right");

    const barW = Math.min(180, w * 0.32);
    const barX = w - 18 - barW;
    ctx.strokeStyle = pal.line;
    ctx.strokeRect(barX, 36, barW, 6);
    ctx.fillStyle = ok ? pal.ok : pal.muted;
    ctx.fillRect(barX, 36, barW * Math.min(1, hold / HOLD), 6);

    if (finished) display(ctx, "적합 완료", w * 0.5, 68, pal.ok, 24, "center");
    drawSparks(ctx, sparks);
  });

  load();
  return {
    restart,
    destroy: () => {
      dead = true;
      stop();
      view.destroy();
    },
  };
}
