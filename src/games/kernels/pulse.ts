import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  INK,
  clear,
  grain,
  label,
  display,
  hit,
  burst,
  stepSparks,
  drawSparks,
  type Spark,
} from "@/lib/games/draw";

type Neuron = { charge: number; refr: number; flash: number; ring: number };
type Pulse = { from: number; to: number; t: number };
type Level = { name: string; n: number; leak: number };

const LEVELS: Level[] = [
  { name: "단발", n: 4, leak: 0.15 },
  { name: "이음", n: 4, leak: 0.18 },
  { name: "시냅스", n: 5, leak: 0.2 },
  { name: "수초", n: 5, leak: 0.22 },
  { name: "회로", n: 6, leak: 0.25 },
  { name: "피질", n: 7, leak: 0.28 },
  { name: "가소성", n: 7, leak: 0.3 },
  { name: "장애", n: 8, leak: 0.32 },
  { name: "전극", n: 8, leak: 0.34 },
];

const pal = INK;
const THRESH = 0.7;
const TAP = 0.45;
const JUMP = 0.55;
const DELAY = 0.12;
const REFR = 0.7;

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
  let neurons: Neuron[] = [];
  let pulses: Pulse[] = [];
  let wasDown = false;
  let celebrate = 0;
  let clock = 0;
  let taps = 0;
  let status = "";
  let coach = "역치를 넘겨야 전유한다. 직후엔 듣지 않는다.";
  let hover = -1;

  const load = () => {
    const L = LEVELS[level];
    neurons = Array.from({ length: L.n }, () => ({ charge: 0, refr: 0, flash: 0, ring: 0 }));
    pulses = [];
    celebrate = 0;
    clock = 0;
    taps = 0;
    hover = -1;
    status = L.name;
    coach = "역치를 넘겨야 전유한다. 직후엔 듣지 않는다.";
    emit();
  };

  const emit = () => {
    hooks.onHud({ level: level + 1, total: LEVELS.length, score, status, coach });
  };

  const winLevel = () => {
    if (finished) return;
    const leftoverBonus = Math.max(0, Math.round(90 - clock * 3 - taps * 2));
    score += 100 + leftoverBonus;
    if (level + 1 >= LEVELS.length) {
      finished = true;
      status = "회로 완성";
      coach = "활동전위는 전유이고, 직후 불응기가 있다";
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
    const n = neurons.length;
    const margin = Math.max(48, w * 0.08);
    const span = Math.max(1, w - margin * 2);
    const r = Math.max(22, Math.min(32, span / (n * 2.4)));
    const y = h * 0.5;
    const xs: number[] = [];
    for (let i = 0; i < n; i++) xs.push(n === 1 ? w * 0.5 : margin + (span * i) / (n - 1));
    return { xs, y, r };
  };

  const trySpike = (i: number) => {
    const n = neurons[i];
    if (n.refr > 0) return;
    if (n.charge < THRESH) return;
    n.charge = 0;
    n.refr = REFR;
    n.flash = 0.32;
    n.ring = 1;
    tone(380 + i * 55, 0.08, "sine", 0.055);
    if (i === neurons.length - 1) {
      if (celebrate <= 0 && !finished) {
        celebrate = rm ? 0.2 : 0.6;
        status = `${LEVELS[level].name} 도달`;
        coach = "종말까지 전유했다";
        const { w, h } = view.size();
        if (!rm) burst(sparks, w * 0.82, h * 0.5, pal.ok, 22);
        tone(640, 0.14, "triangle", 0.05);
        emit();
      }
      return;
    }
    pulses.push({ from: i, to: i + 1, t: 0 });
  };

  const tap = (i: number) => {
    const n = neurons[i];
    if (n.refr > 0) {
      tone(130, 0.08, "square", 0.04);
      noiseBurst(0.04, 0.025);
      coach = "불응기 — 지금은 듣지 않는다";
      emit();
      return;
    }
    n.charge = Math.min(1, n.charge + TAP);
    taps += 1;
    tone(260 + i * 30, 0.05, "sine", 0.04);
    trySpike(i);
  };

  const stop = startLoop((dt) => {
    if (dead) return;
    const pressed = view.ptr.down && !wasDown;
    wasDown = view.ptr.down;

    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx) return;
    clock += dt;

    const { xs, y, r } = layout(w, h);
    hover = -1;
    for (let i = 0; i < neurons.length; i++) {
      if (hit(view.ptr.x, view.ptr.y, xs[i], y, Math.max(r, 22))) hover = i;
    }
    if (pressed && hover >= 0 && !finished && celebrate <= 0) tap(hover);

    const leak = LEVELS[level].leak;
    for (let i = 0; i < neurons.length; i++) {
      const n = neurons[i];
      const wasRefr = n.refr > 0;
      n.charge = Math.max(0, n.charge - leak * dt);
      n.refr = Math.max(0, n.refr - dt);
      n.flash = Math.max(0, n.flash - dt * 2.4);
      n.ring = Math.max(0, n.ring - dt * 1.8);
      if (wasRefr && n.refr === 0) trySpike(i);
    }

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += dt;
      if (p.t >= DELAY) {
        neurons[p.to].charge = Math.min(1, neurons[p.to].charge + JUMP);
        trySpike(p.to);
        pulses.splice(i, 1);
      }
    }

    if (celebrate > 0) {
      celebrate -= dt;
      if (celebrate <= 0) winLevel();
    }

    stepSparks(sparks, dt);
    clear(ctx, w, h, pal);
    grain(ctx, w, h, 5);

    display(ctx, LEVELS[level].name, 20, 26, pal.fg, 26, "left");
    label(ctx, `누설 ${leak.toFixed(2)} /s`, w - 18, 24, pal.muted, 12, "right");

    for (let i = 0; i < neurons.length - 1; i++) {
      const x1 = xs[i] + r + 4;
      const x2 = xs[i + 1] - r - 4;
      ctx.strokeStyle = pal.line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.quadraticCurveTo((x1 + x2) * 0.5, y + (rm ? 0 : Math.sin(clock * 2 + i) * 3), x2, y);
      ctx.stroke();
    }

    for (const p of pulses) {
      const x1 = xs[p.from] + r;
      const x2 = xs[p.to] - r;
      const u = Math.min(1, p.t / DELAY);
      const px = x1 + (x2 - x1) * u;
      const py = y + (rm ? 0 : Math.sin(u * Math.PI) * -8);
      ctx.fillStyle = pal.ok;
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < neurons.length; i++) {
      const n = neurons[i];
      const x = xs[i];
      if (n.ring > 0) {
        ctx.strokeStyle = pal.ok;
        ctx.globalAlpha = n.ring * 0.55;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r + 8 + (1 - n.ring) * 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (n.flash > 0) {
        ctx.fillStyle = pal.ok;
        ctx.globalAlpha = n.flash * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = n.refr > 0 ? "#1a1d24" : pal.fill;
      ctx.fill();
      ctx.strokeStyle = hover === i ? pal.fg : pal.line;
      ctx.lineWidth = hover === i ? 2.2 : 1.3;
      ctx.stroke();

      const cr = r * 0.72 * n.charge;
      if (cr > 0.6) {
        ctx.beginPath();
        ctx.arc(x, y, cr, 0, Math.PI * 2);
        ctx.fillStyle = n.charge >= THRESH ? pal.ok : pal.accent;
        ctx.globalAlpha = 0.55 + n.charge * 0.35;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.strokeStyle = pal.muted;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(x, y, r - 4, -Math.PI / 2, -Math.PI / 2 + n.charge * Math.PI * 2);
      ctx.stroke();

      const tick = -Math.PI / 2 + THRESH * Math.PI * 2;
      ctx.strokeStyle = pal.warn;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(tick) * (r - 8), y + Math.sin(tick) * (r - 8));
      ctx.lineTo(x + Math.cos(tick) * (r + 1), y + Math.sin(tick) * (r + 1));
      ctx.stroke();

      const tag = i === 0 ? "입력" : i === neurons.length - 1 ? "출력" : "";
      if (tag) label(ctx, tag, x, y + r + 16, pal.muted, 11, "center");
      if (n.refr > 0) label(ctx, "불응", x, y + 1, pal.muted, 10, "center");
    }

    ctx.strokeStyle = pal.line;
    ctx.strokeRect(20, h - 28, 120, 8);
    const last = neurons[neurons.length - 1];
    ctx.fillStyle = last.flash > 0 ? pal.ok : pal.accent;
    ctx.fillRect(20, h - 28, 120 * last.charge, 8);
    label(ctx, "종말 전하", 148, h - 24, pal.muted, 11, "left");

    if (finished) display(ctx, "전유 완료", w * 0.5, 64, pal.ok, 24, "center");
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
