import { tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  PAPER,
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

type Pt = { x: number; y: number };
type Level = { name: string; n: number; coach: string; f: (t: number) => number };

const LEVELS: Level[] = [
  { name: "직선 상승", n: 3, coach: "점의 높이가 계수다", f: (x) => 0.18 + 0.64 * x },
  {
    name: "완만한 언덕",
    n: 3,
    coach: "가운데를 올려 포물선을 만드세요",
    f: (x) => 0.22 + 0.56 * (1 - (2 * x - 1) ** 2),
  },
  {
    name: "골짜기",
    n: 3,
    coach: "가운데를 내려 골을 파세요",
    f: (x) => 0.22 + 0.56 * (2 * x - 1) ** 2,
  },
  {
    name: "S자",
    n: 3,
    coach: "왼쪽은 낮고 오른쪽은 높게, 가운데에서 꺾입니다",
    f: (x) => 0.18 + 0.64 / (1 + Math.exp(-9 * (x - 0.5))),
  },
  {
    name: "높은 봉우리",
    n: 3,
    coach: "가운데만 높이 올리세요",
    f: (x) => 0.16 + 0.72 * Math.exp(-14 * (x - 0.5) ** 2),
  },
  {
    name: "두 번 꺾임",
    n: 4,
    coach: "네 점으로 두 번 꺾습니다",
    f: (x) => 0.5 + 0.3 * Math.sin(2 * Math.PI * x),
  },
  {
    name: "급강하 후 평탄",
    n: 3,
    coach: "왼쪽은 높고, 곧 내려 평평하게",
    f: (x) => 0.2 + 0.64 * (1 - 1 / (1 + Math.exp(-14 * (x - 0.38)))),
  },
  {
    name: "미분의 접선",
    n: 3,
    coach: "왼쪽은 완만, 오른쪽은 가파르게",
    f: (x) => 0.16 + 0.7 * x * x,
  },
  {
    name: "적분의 언덕",
    n: 4,
    coach: "넓게 솟았다가 천천히 내려옵니다",
    f: (x) => 0.2 + 0.55 * Math.exp(-8 * (x - 0.42) ** 2),
  },
];

const pal = PAPER;
const HOLD = 0.8;
const ERR_LIM = 18;
const SAMPLES = 24;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function quad(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function cubic(p0: Pt, c1: Pt, c2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y,
  };
}

function interpQuadCtrl(a: Pt, b: Pt, c: Pt): Pt {
  return { x: 2 * b.x - 0.5 * a.x - 0.5 * c.x, y: 2 * b.y - 0.5 * a.y - 0.5 * c.y };
}

function interpCubicCtrls(p0: Pt, p1: Pt, p2: Pt, p3: Pt): [Pt, Pt] {
  const u = 1 / 3;
  const v = 2 / 3;
  const a1 = 3 * (1 - u) * (1 - u) * u;
  const b1 = 3 * (1 - u) * u * u;
  const a2 = 3 * (1 - v) * (1 - v) * v;
  const b2 = 3 * (1 - v) * v * v;
  const r1x = p1.x - (1 - u) ** 3 * p0.x - u ** 3 * p3.x;
  const r1y = p1.y - (1 - u) ** 3 * p0.y - u ** 3 * p3.y;
  const r2x = p2.x - (1 - v) ** 3 * p0.x - v ** 3 * p3.x;
  const r2y = p2.y - (1 - v) ** 3 * p0.y - v ** 3 * p3.y;
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-6) {
    return [
      { x: lerp(p0.x, p1.x, 0.6), y: lerp(p0.y, p1.y, 0.6) },
      { x: lerp(p3.x, p2.x, 0.6), y: lerp(p3.y, p2.y, 0.6) },
    ];
  }
  return [
    { x: (r1x * b2 - r2x * b1) / det, y: (r1y * b2 - r2y * b1) / det },
    { x: (a1 * r2x - a2 * r1x) / det, y: (a1 * r2y - a2 * r1y) / det },
  ];
}

function evalCurve(pts: Pt[], t: number): Pt {
  if (pts.length <= 2) {
    const a = pts[0];
    const b = pts[pts.length - 1] ?? pts[0];
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
  }
  if (pts.length === 3) return quad(pts[0], interpQuadCtrl(pts[0], pts[1], pts[2]), pts[2], t);
  const [c1, c2] = interpCubicCtrls(pts[0], pts[1], pts[2], pts[3]);
  return cubic(pts[0], c1, c2, pts[3], t);
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
  let pts: Pt[] = [];
  let drag = -1;
  let wasDown = false;
  let hold = 0;
  let celebrate = 0;
  let clock = 0;
  let status = "";
  let coach = "점의 높이가 계수다";
  let err = 999;
  let lw = 0;
  let lh = 0;

  const plot = (w: number, h: number) => {
    const padL = 48;
    const padR = 22;
    const padT = 56;
    const padB = 36;
    return { padL, padR, padT, padB, pw: w - padL - padR, ph: h - padT - padB };
  };
  const toX = (t: number, w: number, h: number) => {
    const p = plot(w, h);
    return p.padL + t * p.pw;
  };
  const toY = (yn: number, w: number, h: number) => {
    const p = plot(w, h);
    return p.padT + p.ph * (1 - yn);
  };
  const fromX = (x: number, w: number, h: number) => {
    const p = plot(w, h);
    return (x - p.padL) / p.pw;
  };
  const fromY = (y: number, w: number, h: number) => {
    const p = plot(w, h);
    return 1 - (y - p.padT) / p.ph;
  };

  const load = () => {
    const { w, h } = view.size();
    const L = LEVELS[level];
    pts = [];
    for (let i = 0; i < L.n; i++) {
      const t = L.n === 1 ? 0.5 : i / (L.n - 1);
      pts.push({ x: toX(0.12 + t * 0.76, w, h), y: toY(0.5, w, h) });
    }
    drag = -1;
    hold = 0;
    celebrate = 0;
    clock = 0;
    err = 999;
    status = L.name;
    coach = L.coach;
    lw = w;
    lh = h;
    emit();
  };

  const emit = () => {
    hooks.onHud({ level: level + 1, total: LEVELS.length, score, status, coach });
  };

  const winLevel = () => {
    if (finished) return;
    const leftoverBonus = Math.max(0, Math.round(70 - clock * 2.6));
    score += 100 + leftoverBonus;
    if (level + 1 >= LEVELS.length) {
      finished = true;
      status = "곡선 완성";
      coach = "함수의 모양은 점이 정한다";
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

  const meanErr = (w: number, h: number): number => {
    const p = plot(w, h);
    let sum = 0;
    const dense: Pt[] = [];
    for (let i = 0; i <= 64; i++) dense.push(evalCurve(pts, i / 64));
    for (let i = 0; i < SAMPLES; i++) {
      const t = i / (SAMPLES - 1);
      const x = p.padL + t * p.pw;
      const ty = toY(LEVELS[level].f(t), w, h);
      let uy = dense[0].y;
      for (let k = 0; k < dense.length - 1; k++) {
        const a = dense[k];
        const b = dense[k + 1];
        if ((a.x <= x && b.x >= x) || (b.x <= x && a.x >= x)) {
          const u = Math.abs(b.x - a.x) < 1e-6 ? 0 : (x - a.x) / (b.x - a.x);
          uy = lerp(a.y, b.y, u);
          break;
        }
        if (k === dense.length - 2) uy = b.y;
      }
      sum += Math.abs(uy - ty);
    }
    return sum / SAMPLES;
  };

  const stop = startLoop((dt) => {
    if (dead) return;
    const pressed = view.ptr.down && !wasDown;
    const released = !view.ptr.down && wasDown;
    wasDown = view.ptr.down;

    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx) return;

    if (lw > 0 && lh > 0 && (w !== lw || h !== lh) && pts.length) {
      for (const pt of pts) {
        const xn = fromX(pt.x, lw, lh);
        const yn = fromY(pt.y, lw, lh);
        pt.x = toX(xn, w, h);
        pt.y = toY(yn, w, h);
      }
    }
    lw = w;
    lh = h;
    clock += dt;
    const p = plot(w, h);

    if (!finished && celebrate <= 0) {
      if (pressed) {
        let best = -1;
        let bestD = 1e9;
        for (let i = 0; i < pts.length; i++) {
          if (hit(view.ptr.x, view.ptr.y, pts[i].x, pts[i].y, 22)) {
            const d = Math.hypot(view.ptr.x - pts[i].x, view.ptr.y - pts[i].y);
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          }
        }
        drag = best;
        if (drag >= 0) tone(250, 0.04, "sine", 0.03);
      }
      if (drag >= 0 && view.ptr.down) {
        const left = drag === 0 ? p.padL : pts[drag - 1].x + 18;
        const right = drag === pts.length - 1 ? p.padL + p.pw : pts[drag + 1].x - 18;
        pts[drag].x = Math.min(right, Math.max(left, view.ptr.x));
        pts[drag].y = Math.min(p.padT + p.ph, Math.max(p.padT, view.ptr.y));
      }
      if (released) drag = -1;
    } else if (released) {
      drag = -1;
    }

    err = meanErr(w, h);

    if (!finished && celebrate <= 0) {
      if (err < ERR_LIM) {
        hold += dt;
        if (hold > 0.05 && hold < 0.1) {
          coach = "거의 포개졌습니다. 유지";
          emit();
        }
        if (hold >= HOLD) {
          celebrate = rm ? 0.16 : 0.5;
          if (!rm) burst(sparks, w * 0.5, h * 0.45, pal.ok, 18);
          tone(560, 0.1, "sine", 0.055);
          tone(740, 0.14, "triangle", 0.04);
          status = `${LEVELS[level].name} 일치`;
          emit();
        }
      } else {
        if (hold > 0.2) {
          coach = LEVELS[level].coach;
          emit();
        }
        hold = 0;
      }
    }

    if (celebrate > 0) {
      celebrate -= dt;
      if (celebrate <= 0) winLevel();
    }

    stepSparks(sparks, dt);
    clear(ctx, w, h, pal);
    grain(ctx, w, h, 2, 0.03);

    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const x = p.padL + (p.pw * i) / 8;
      const y = p.padT + (p.ph * i) / 8;
      ctx.beginPath();
      ctx.moveTo(x, p.padT);
      ctx.lineTo(x, p.padT + p.ph);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.padL, y);
      ctx.lineTo(p.padL + p.pw, y);
      ctx.stroke();
    }

    ctx.strokeStyle = pal.fg;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(p.padL, p.padT);
    ctx.lineTo(p.padL, p.padT + p.ph);
    ctx.lineTo(p.padL + p.pw, p.padT + p.ph);
    ctx.stroke();
    label(ctx, "y", p.padL - 14, p.padT + 4, pal.muted, 12, "center");
    label(ctx, "x", p.padL + p.pw + 10, p.padT + p.ph, pal.muted, 12, "left");

    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = pal.muted;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      const x = toX(t, w, h);
      const y = toY(LEVELS[level].f(t), w, h);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = err < ERR_LIM ? pal.ok : pal.accent;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const q = evalCurve(pts, i / 48);
      if (i === 0) ctx.moveTo(q.x, q.y);
      else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();

    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = i === drag ? "#f6f1e8" : "#f3eee6";
      ctx.fill();
      ctx.strokeStyle = i === drag ? pal.fg : pal.accent;
      ctx.lineWidth = i === drag ? 2.2 : 1.4;
      ctx.stroke();
      label(ctx, String(i + 1), pt.x, pt.y + 1, pal.fg, 11, "center");
    }

    display(ctx, LEVELS[level].name, 20, 26, pal.fg, 24, "left");
    label(ctx, `오차 ${err.toFixed(1)}px`, w - 18, 22, err < ERR_LIM ? pal.ok : pal.muted, 12, "right");

    const barW = Math.min(200, w * 0.36);
    const barX = w - 18 - barW;
    ctx.strokeStyle = pal.line;
    ctx.strokeRect(barX, 36, barW, 6);
    ctx.fillStyle = err < ERR_LIM ? pal.ok : pal.muted;
    ctx.fillRect(barX, 36, barW * Math.min(1, hold / HOLD), 6);

    if (finished) display(ctx, "스케치 완료", w * 0.5, h * 0.2, pal.ok, 26, "center");
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
