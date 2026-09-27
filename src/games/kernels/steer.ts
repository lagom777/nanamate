import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  INK,
  CLAY,
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

type Phase = "play" | "fail" | "pass" | "done";
type Ptr = { x: number; y: number; down: boolean };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function lerpAng(a: number, b: number, k: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}

function vignette(ctx: CanvasRenderingContext2D, w: number, h: number, amt: number, cx = 0.5, cy = 0.5) {
  const g = ctx.createRadialGradient(w * cx, h * cy, Math.min(w, h) * 0.12, w * cx, h * cy, Math.max(w, h) * 0.74);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${amt})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function follow(x: number, y: number, tx: number, ty: number, dt: number, rate: number, w: number, h: number, pad = 18) {
  const k = 1 - Math.exp(-rate * dt);
  return { x: clamp(x + (tx - x) * k, pad, w - pad), y: clamp(y + (ty - y) * k, pad, h - pad) };
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a = 0.35) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function banner(ctx: CanvasRenderingContext2D, pal: Palette, title: string, sub: string) {
  display(ctx, title, 20, 28, pal.fg, 26, "left");
  label(ctx, sub, 20, 52, pal.muted, 13, "left");
}

function overlay(ctx: CanvasRenderingContext2D, w: number, h: number, pal: Palette, title: string, sub: string) {
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  ctx.fillRect(0, 0, w, h);
  display(ctx, title, w / 2, h / 2 - 12, pal.fg, 32, "center");
  label(ctx, sub, w / 2, h / 2 + 22, pal.muted, 14, "center");
}

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

/* -------------------------------- philo -------------------------------- */

type CaveRoom = {
  name: string;
  goods: { nx: number; ny: number }[];
  bads: { nx: number; ny: number; amp: number }[];
  exit: { nx: number; ny: number };
};

const CAVES: CaveRoom[] = [
  {
    name: "사슬의 벽",
    goods: [
      { nx: 0.38, ny: 0.48 },
      { nx: 0.58, ny: 0.62 },
    ],
    bads: [{ nx: 0.48, ny: 0.28, amp: 0.02 }],
    exit: { nx: 0.88, ny: 0.5 },
  },
  {
    name: "불의 그림",
    goods: [
      { nx: 0.3, ny: 0.7 },
      { nx: 0.5, ny: 0.36 },
      { nx: 0.68, ny: 0.58 },
    ],
    bads: [
      { nx: 0.42, ny: 0.5, amp: 0.04 },
      { nx: 0.62, ny: 0.28, amp: 0.03 },
    ],
    exit: { nx: 0.9, ny: 0.42 },
  },
  {
    name: "출구의 소문",
    goods: [
      { nx: 0.26, ny: 0.32 },
      { nx: 0.44, ny: 0.7 },
      { nx: 0.64, ny: 0.4 },
    ],
    bads: [
      { nx: 0.36, ny: 0.5, amp: 0.06 },
      { nx: 0.56, ny: 0.58, amp: 0.05 },
      { nx: 0.74, ny: 0.3, amp: 0.04 },
    ],
    exit: { nx: 0.9, ny: 0.62 },
  },
  {
    name: "꺾인 통로",
    goods: [
      { nx: 0.22, ny: 0.62 },
      { nx: 0.4, ny: 0.28 },
      { nx: 0.58, ny: 0.72 },
      { nx: 0.7, ny: 0.38 },
    ],
    bads: [
      { nx: 0.32, ny: 0.42, amp: 0.07 },
      { nx: 0.5, ny: 0.52, amp: 0.08 },
      { nx: 0.66, ny: 0.56, amp: 0.06 },
    ],
    exit: { nx: 0.9, ny: 0.28 },
  },
  {
    name: "거의 빛",
    goods: [
      { nx: 0.24, ny: 0.28 },
      { nx: 0.28, ny: 0.74 },
      { nx: 0.52, ny: 0.46 },
      { nx: 0.72, ny: 0.68 },
    ],
    bads: [
      { nx: 0.38, ny: 0.36, amp: 0.09 },
      { nx: 0.46, ny: 0.66, amp: 0.08 },
      { nx: 0.64, ny: 0.32, amp: 0.07 },
      { nx: 0.78, ny: 0.5, amp: 0.06 },
    ],
    exit: { nx: 0.9, ny: 0.78 },
  },
  {
    name: "태양의 문",
    goods: [
      { nx: 0.2, ny: 0.5 },
      { nx: 0.36, ny: 0.24 },
      { nx: 0.38, ny: 0.76 },
      { nx: 0.58, ny: 0.4 },
      { nx: 0.7, ny: 0.66 },
    ],
    bads: [
      { nx: 0.3, ny: 0.38, amp: 0.1 },
      { nx: 0.48, ny: 0.56, amp: 0.1 },
      { nx: 0.62, ny: 0.26, amp: 0.08 },
      { nx: 0.74, ny: 0.48, amp: 0.09 },
      { nx: 0.56, ny: 0.74, amp: 0.07 },
    ],
    exit: { nx: 0.9, ny: 0.5 },
  },
];

function playPhilo(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = INK;
  const rm = reducedMotion();
  let level = 0;
  let score = 0;
  let phase: Phase = "play";
  let finished = false;
  let px = 48;
  let py = 240;
  let got: boolean[] = [];
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  let coach = "형상을 모으고 그림자를 피해 태양으로.";

  const load = () => {
    phase = "play";
    const r = canvas.getBoundingClientRect();
    px = Math.max(40, r.width * 0.1);
    py = Math.max(80, r.height * 0.55);
    got = CAVES[level].goods.map(() => false);
    lock = 0.3;
    coach = `${CAVES[level].goods.length}개의 형상을 모은 뒤 태양에 닿으세요.`;
    hud(hooks, level + 1, CAVES.length, score, CAVES[level].name, coach);
  };

  const resetAll = () => {
    level = 0;
    score = 0;
    finished = false;
    sparks = [];
    t = 0;
    load();
  };

  const fail = (why: string) => {
    if (phase !== "play" || finished) return;
    phase = "fail";
    lock = 0.35;
    coach = why;
    noiseBurst(0.12, 0.05);
    hud(hooks, level + 1, CAVES.length, score, CAVES[level].name, coach);
  };

  const winLevel = (w: number, h: number) => {
    if (phase !== "play" || finished) return;
    score += 80 + level * 12;
    burst(sparks, w * 0.88, h * 0.5, "#e8c98a", rm ? 6 : 22);
    if (level + 1 >= CAVES.length) {
      phase = "done";
      finished = true;
      coach = "동굴 밖으로. 그림자가 아니라 형상을 보았다.";
      hud(hooks, CAVES.length, CAVES.length, score, "해방", coach);
      hooks.onClear(score);
      return;
    }
    phase = "pass";
    lock = 1.05;
    coach = "다음 방으로.";
    hud(hooks, level + 1, CAVES.length, score, CAVES[level].name, coach);
    tone(520, 0.1, "sine", 0.06);
    tone(780, 0.16, "triangle", 0.04);
  };

  return run(canvas, resetAll, (dt, ctx, w, h, ptr, justDown) => {
    t += dt;
    lock = Math.max(0, lock - dt);
    if (phase === "play") {
      if (ptr.down) {
        const n = follow(px, py, ptr.x, ptr.y, dt, 7.4, w, h, 16);
        px = n.x;
        py = n.y;
      }
      if (lock <= 0) {
        const room = CAVES[level];
        room.goods.forEach((g, i) => {
          if (got[i]) return;
          if (hit(px, py, g.nx * w, g.ny * h, 22)) {
            got[i] = true;
            score += 18;
            burst(sparks, g.nx * w, g.ny * h, pal.ok, rm ? 4 : 16);
            tone(640 + i * 40, 0.08, "sine", 0.06);
            coach = got.every(Boolean) ? "태양이 열렸다." : "형상을 담았다.";
            hud(hooks, level + 1, CAVES.length, score, room.name, coach);
          }
        });
        room.bads.forEach((b, i) => {
          const bx = (b.nx + Math.sin(t * (0.7 + i * 0.15) + i) * b.amp) * w;
          const by = (b.ny + Math.cos(t * (0.55 + i * 0.12) + i * 1.7) * b.amp * 0.7) * h;
          if (hit(px, py, bx, by, 20)) fail("그림자에 삼켜졌다. 눌러 다시.");
        });
        if (got.every(Boolean) && hit(px, py, room.exit.nx * w, room.exit.ny * h, 28)) winLevel(w, h);
      }
    } else if (phase === "fail" && justDown && lock <= 0) {
      load();
    } else if (phase === "pass" && lock <= 0) {
      level += 1;
      load();
    }

    clear(ctx, w, h, pal);
    const cave = ctx.createLinearGradient(0, 0, 0, h);
    cave.addColorStop(0, "#101218");
    cave.addColorStop(1, "#0a0b0e");
    ctx.fillStyle = cave;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(236,232,225,0.028)";
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.ellipse((((i * 89) % 97) / 97) * w, (((i * 53) % 89) / 89) * h, 48, 18, i, 0, Math.PI * 2);
      ctx.fill();
    }
    const room = CAVES[level];
    room.goods.forEach((g, i) => {
      if (got[i]) return;
      const gx = g.nx * w;
      const gy = g.ny * h;
      glow(ctx, gx, gy, 28, pal.ok, 0.42 + Math.sin(t * 3 + i) * 0.08);
      ctx.fillStyle = pal.ok;
      const s = 9 + Math.sin(t * 2 + i) * 1.1;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.restore();
      label(ctx, "형상", gx, gy + 22, pal.muted, 11, "center");
    });
    room.bads.forEach((b, i) => {
      const bx = (b.nx + Math.sin(t * (0.7 + i * 0.15) + i) * b.amp) * w;
      const by = (b.ny + Math.cos(t * (0.55 + i * 0.12) + i * 1.7) * b.amp * 0.7) * h;
      ctx.fillStyle = "#2a2826";
      ctx.beginPath();
      ctx.ellipse(bx, by, 16 + Math.sin(t + i) * 2, 18, 0.25, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, "그림자", bx, by + 24, pal.muted, 10, "center");
    });
    const ex = room.exit.nx * w;
    const ey = room.exit.ny * h;
    const open = got.every(Boolean);
    glow(ctx, ex, ey, open ? 48 : 20, "#e8c98a", open ? 0.55 : 0.12);
    ctx.fillStyle = open ? "#e8c98a" : pal.fill;
    ctx.beginPath();
    ctx.arc(ex, ey, 16, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, "태양", ex, ey + 28, open ? pal.fg : pal.muted, 12, "center");
    glow(ctx, px, py, 22, pal.fg, 0.32);
    ctx.fillStyle = pal.fg;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    vignette(ctx, w, h, 0.64 + level * 0.035);
    grain(ctx, w, h, Math.floor(t * 8), 0.04);
    stepSparks(sparks, dt);
    drawSparks(ctx, sparks);
    banner(ctx, pal, room.name, coach);
    if (phase === "fail") overlay(ctx, w, h, pal, "삼켜짐", "눌러 이 방을 다시");
    if (phase === "pass") overlay(ctx, w, h, pal, "형상을 보다", "다음 동굴");
    if (phase === "done") overlay(ctx, w, h, pal, "밖으로", "태양 아래");
    void roundRect;
    void inRect;
    void shuffle;
  });
}

/* -------------------------------- myth --------------------------------- */

type Sea = { name: string; sirens: { nx: number; ny: number; pull: number }[]; rocks: { nx: number; ny: number; r: number }[] };

const SEAS: Sea[] = [
  {
    name: "연안",
    sirens: [{ nx: 0.48, ny: 0.32, pull: 46 }],
    rocks: [
      { nx: 0.36, ny: 0.62, r: 16 },
      { nx: 0.7, ny: 0.48, r: 14 },
    ],
  },
  {
    name: "세이렌의 암초",
    sirens: [
      { nx: 0.4, ny: 0.28, pull: 58 },
      { nx: 0.62, ny: 0.64, pull: 52 },
    ],
    rocks: [
      { nx: 0.3, ny: 0.52, r: 16 },
      { nx: 0.72, ny: 0.36, r: 15 },
    ],
  },
  {
    name: "두 노래",
    sirens: [
      { nx: 0.34, ny: 0.36, pull: 64 },
      { nx: 0.56, ny: 0.7, pull: 60 },
      { nx: 0.7, ny: 0.28, pull: 56 },
    ],
    rocks: [
      { nx: 0.48, ny: 0.48, r: 15 },
      { nx: 0.78, ny: 0.58, r: 14 },
    ],
  },
  {
    name: "키르케의 물",
    sirens: [
      { nx: 0.3, ny: 0.24, pull: 72 },
      { nx: 0.46, ny: 0.58, pull: 70 },
      { nx: 0.68, ny: 0.38, pull: 68 },
    ],
    rocks: [
      { nx: 0.22, ny: 0.62, r: 16 },
      { nx: 0.58, ny: 0.26, r: 14 },
      { nx: 0.76, ny: 0.68, r: 15 },
    ],
  },
  {
    name: "스킬라 너머",
    sirens: [
      { nx: 0.28, ny: 0.4, pull: 80 },
      { nx: 0.5, ny: 0.22, pull: 78 },
      { nx: 0.52, ny: 0.68, pull: 82 },
      { nx: 0.74, ny: 0.44, pull: 76 },
    ],
    rocks: [
      { nx: 0.38, ny: 0.56, r: 15 },
      { nx: 0.66, ny: 0.3, r: 14 },
      { nx: 0.8, ny: 0.7, r: 16 },
    ],
  },
  {
    name: "이타케 앞바다",
    sirens: [
      { nx: 0.26, ny: 0.28, pull: 88 },
      { nx: 0.4, ny: 0.62, pull: 90 },
      { nx: 0.58, ny: 0.36, pull: 86 },
      { nx: 0.7, ny: 0.7, pull: 84 },
      { nx: 0.78, ny: 0.24, pull: 80 },
    ],
    rocks: [
      { nx: 0.34, ny: 0.46, r: 15 },
      { nx: 0.52, ny: 0.54, r: 14 },
      { nx: 0.72, ny: 0.5, r: 16 },
    ],
  },
];

function playMyth(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = CLAY;
  const rm = reducedMotion();
  let level = 0;
  let score = 0;
  let phase: Phase = "play";
  let finished = false;
  let px = 50;
  let py = 240;
  let ang = 0;
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  let coach = "세이렌과 암초를 지나 이타케로.";

  const load = () => {
    phase = "play";
    const r = canvas.getBoundingClientRect();
    px = Math.max(36, r.width * 0.1);
    py = Math.max(80, r.height * 0.55);
    ang = 0;
    lock = 0.3;
    coach = "배를 밀어 유혹을 거절하세요.";
    hud(hooks, level + 1, SEAS.length, score, SEAS[level].name, coach);
  };

  const resetAll = () => {
    level = 0;
    score = 0;
    finished = false;
    sparks = [];
    t = 0;
    load();
  };

  const fail = (why: string) => {
    if (phase !== "play" || finished) return;
    phase = "fail";
    lock = 0.35;
    coach = why;
    noiseBurst(0.14, 0.05);
    hud(hooks, level + 1, SEAS.length, score, SEAS[level].name, coach);
  };

  const winLevel = (w: number, h: number) => {
    if (phase !== "play" || finished) return;
    score += 90 + level * 14;
    burst(sparks, w * 0.9, h * 0.5, pal.ok, rm ? 6 : 20);
    tone(440, 0.1, "sine", 0.06);
    tone(660, 0.18, "triangle", 0.045);
    if (level + 1 >= SEAS.length) {
      phase = "done";
      finished = true;
      coach = "귀향. 노래보다 키를 지켰다.";
      hud(hooks, SEAS.length, SEAS.length, score, "이타케", coach);
      hooks.onClear(score);
      return;
    }
    phase = "pass";
    lock = 1.05;
    coach = "다음 바다.";
    hud(hooks, level + 1, SEAS.length, score, SEAS[level].name, coach);
  };

  return run(canvas, resetAll, (dt, ctx, w, h, ptr, justDown) => {
    t += dt;
    lock = Math.max(0, lock - dt);
    const sea = SEAS[level];
    if (phase === "play") {
      const prevx = px;
      const prevy = py;
      if (ptr.down) {
        const n = follow(px, py, ptr.x, ptr.y, dt, 5.6, w, h, 16);
        px = n.x;
        py = n.y;
      }
      if (lock <= 0) {
        for (const s of sea.sirens) {
          const sx = s.nx * w;
          const sy = s.ny * h;
          const dx = sx - px;
          const dy = sy - py;
          const d = Math.hypot(dx, dy);
          if (d < 18) {
            fail("세이렌에 붙들렸다. 눌러 다시.");
            break;
          }
          if (d < 130 && d > 1) {
            const f = s.pull * (1 - d / 130);
            px += (dx / d) * f * dt;
            py += (dy / d) * f * dt;
          }
        }
        px = clamp(px, 16, w - 16);
        py = clamp(py, 16, h - 16);
        for (const rk of sea.rocks) {
          if (hit(px, py, rk.nx * w, rk.ny * h, rk.r + 8)) fail("암초에 부딪혔다. 눌러 다시.");
        }
        if (px > w * 0.88 && Math.abs(py - h * 0.5) < 48) winLevel(w, h);
      }
      const vx = px - prevx;
      const vy = py - prevy;
      if (Math.hypot(vx, vy) > 0.4) ang = lerpAng(ang, Math.atan2(vy, vx), 1 - Math.exp(-dt * 10));
    } else if (phase === "fail" && justDown && lock <= 0) {
      load();
    } else if (phase === "pass" && lock <= 0) {
      level += 1;
      load();
    }

    const water = ctx.createLinearGradient(0, 0, 0, h);
    water.addColorStop(0, "#1a1612");
    water.addColorStop(0.45, "#16110e");
    water.addColorStop(1, "#12100e");
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(216,196,168,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const y = 70 + i * ((h - 90) / 8);
      for (let x = 0; x <= w; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.02 + t * 1.2 + i) * 3.5);
      ctx.stroke();
    }
    glow(ctx, w * 0.93, h * 0.5, 70, pal.warn, 0.28);
    ctx.fillStyle = "#3a3228";
    ctx.beginPath();
    ctx.ellipse(w * 0.93, h * 0.5, 36, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.arc(w * 0.93, h * 0.44, 10, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, "이타케", w * 0.93, h * 0.5 + 44, pal.fg, 12, "center");

    for (const rk of sea.rocks) {
      const x = rk.nx * w;
      const y = rk.ny * h;
      ctx.fillStyle = "#2c261f";
      ctx.beginPath();
      ctx.moveTo(x, y - rk.r);
      ctx.lineTo(x + rk.r * 0.9, y - rk.r * 0.2);
      ctx.lineTo(x + rk.r * 0.5, y + rk.r * 0.85);
      ctx.lineTo(x - rk.r * 0.7, y + rk.r * 0.7);
      ctx.lineTo(x - rk.r, y - rk.r * 0.15);
      ctx.closePath();
      ctx.fill();
      label(ctx, "암초", x, y + rk.r + 12, pal.muted, 10, "center");
    }
    sea.sirens.forEach((s, i) => {
      const x = s.nx * w;
      const y = s.ny * h;
      const pulse = 22 + Math.sin(t * 2.4 + i) * 4;
      ctx.strokeStyle = `rgba(196,122,114,${0.18 + Math.sin(t * 2 + i) * 0.08})`;
      ctx.lineWidth = 1.4;
      for (let k = 1; k <= 3; k++) {
        ctx.beginPath();
        ctx.arc(x, y, pulse + k * 14, 0, Math.PI * 2);
        ctx.stroke();
      }
      glow(ctx, x, y, 26, pal.bad, 0.4);
      ctx.fillStyle = pal.bad;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, "세이렌", x, y + 26, pal.muted, 10, "center");
    });

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang);
    ctx.fillStyle = pal.fg;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-11, 9);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-11, -9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    grain(ctx, w, h, Math.floor(t * 6), 0.03);
    stepSparks(sparks, dt);
    drawSparks(ctx, sparks);
    banner(ctx, pal, sea.name, coach);
    if (phase === "fail") overlay(ctx, w, h, pal, "난파", "눌러 이 바다를 다시");
    if (phase === "pass") overlay(ctx, w, h, pal, "지나갔다", "다음 항해");
    if (phase === "done") overlay(ctx, w, h, pal, "귀향", "이타케");
  });
}

/* -------------------------------- fear --------------------------------- */

type FearRoom = { name: string; ox: number; oy: number; dark: number; cone: number; need: number };

const FEARS: FearRoom[] = [
  { name: "문지방", ox: 0.58, oy: 0.46, dark: 0.62, cone: 0.46, need: 2 },
  { name: "좁은 복도", ox: 0.7, oy: 0.34, dark: 0.7, cone: 0.4, need: 2 },
  { name: "닫힌 방", ox: 0.78, oy: 0.62, dark: 0.76, cone: 0.36, need: 2 },
  { name: "지하", ox: 0.82, oy: 0.28, dark: 0.82, cone: 0.32, need: 2 },
  { name: "거울 앞", ox: 0.84, oy: 0.72, dark: 0.86, cone: 0.28, need: 2 },
  { name: "이름 없는 것", ox: 0.88, oy: 0.42, dark: 0.9, cone: 0.25, need: 2 },
];

function playFear(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = INK;
  const rm = reducedMotion();
  let level = 0;
  let score = 0;
  let phase: Phase = "play";
  let finished = false;
  let px = 60;
  let py = 280;
  let look = -0.4;
  let expo = 0;
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  let coach = "손전등으로 비추고, 가까이 머무르세요.";

  const load = () => {
    phase = "play";
    const r = canvas.getBoundingClientRect();
    px = Math.max(40, r.width * 0.14);
    py = Math.max(80, r.height * 0.62);
    look = -0.35;
    expo = 0;
    lock = 0.3;
    coach = "비춘 채 2초를 견디면 방이 열린다.";
    hud(hooks, level + 1, FEARS.length, score, FEARS[level].name, coach);
  };

  const resetAll = () => {
    level = 0;
    score = 0;
    finished = false;
    sparks = [];
    t = 0;
    load();
  };

  const winLevel = (w: number, h: number) => {
    if (phase !== "play" || finished) return;
    score += 85 + level * 15;
    burst(sparks, FEARS[level].ox * w, FEARS[level].oy * h, pal.ok, rm ? 5 : 18);
    tone(380, 0.12, "sine", 0.06);
    tone(570, 0.18, "triangle", 0.04);
    if (level + 1 >= FEARS.length) {
      phase = "done";
      finished = true;
      coach = "회피하지 않고 보았다.";
      hud(hooks, FEARS.length, FEARS.length, score, "소거", coach);
      hooks.onClear(score);
      return;
    }
    phase = "pass";
    lock = 1.05;
    coach = "다음 방.";
    hud(hooks, level + 1, FEARS.length, score, FEARS[level].name, coach);
  };

  return run(canvas, resetAll, (dt, ctx, w, h, ptr, justDown) => {
    t += dt;
    lock = Math.max(0, lock - dt);
    const room = FEARS[level];
    const ox = room.ox * w;
    const oy = room.oy * h;
    if (phase === "play") {
      if (ptr.down) {
        const n = follow(px, py, ptr.x, ptr.y, dt, 6.4, w, h, 16);
        px = n.x;
        py = n.y;
      }
      const dx = ptr.x - px;
      const dy = ptr.y - py;
      if (Math.hypot(dx, dy) > 10) look = lerpAng(look, Math.atan2(dy, dx), 1 - Math.exp(-dt * 8));
      const spread = 0.38;
      const length = Math.min(w, h) * room.cone;
      const ax = ox - px;
      const ay = oy - py;
      const dist = Math.hypot(ax, ay);
      let dAng = Math.atan2(ay, ax) - look;
      while (dAng > Math.PI) dAng -= Math.PI * 2;
      while (dAng < -Math.PI) dAng += Math.PI * 2;
      const lit = Math.abs(dAng) < spread && dist < length;
      const near = dist < 56;
      if (lit && near && lock <= 0) {
        expo += dt;
        coach = `노출 ${Math.min(room.need, expo).toFixed(1)} / ${room.need.toFixed(1)}초`;
        hud(hooks, level + 1, FEARS.length, score, room.name, coach);
        if (expo >= room.need) winLevel(w, h);
      } else if (expo > 0 && !(lit && near)) {
        expo = Math.max(0, expo - dt * 0.85);
      }
    } else if (phase === "pass" && lock <= 0) {
      level += 1;
      load();
    }

    clear(ctx, w, h, pal);
    ctx.fillStyle = "#07080a";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(236,232,225,0.04)";
    ctx.strokeRect(24, 64, w - 48, h - 88);

    const spread = 0.38;
    const length = Math.min(w, h) * room.cone;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, length, look - spread, look + spread);
    ctx.closePath();
    const beam = ctx.createRadialGradient(px, py, 8, px, py, length);
    beam.addColorStop(0, "rgba(236,232,225,0.22)");
    beam.addColorStop(1, "rgba(236,232,225,0)");
    ctx.fillStyle = beam;
    ctx.fill();
    ctx.restore();

    const dist = Math.hypot(ox - px, oy - py);
    let dAng = Math.atan2(oy - py, ox - px) - look;
    while (dAng > Math.PI) dAng -= Math.PI * 2;
    while (dAng < -Math.PI) dAng += Math.PI * 2;
    const lit = Math.abs(dAng) < spread && dist < length;
    const vis = lit ? 0.85 : 0.08 + (1 - room.dark) * 0.15;
    ctx.save();
    ctx.globalAlpha = vis;
    glow(ctx, ox, oy, 34, pal.bad, 0.5);
    ctx.fillStyle = pal.bad;
    ctx.beginPath();
    ctx.ellipse(ox, oy, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.fg;
    ctx.beginPath();
    ctx.arc(ox - 4, oy - 4, 2.2, 0, Math.PI * 2);
    ctx.arc(ox + 5, oy - 4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (lit) label(ctx, "두려움", ox, oy + 28, pal.muted, 11, "center");

    ctx.fillStyle = pal.fg;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(look);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(6, -3, 10, 6);
    ctx.restore();

    const bw = 140;
    const bx = 20;
    const by = h - 28;
    ctx.fillStyle = pal.fill;
    roundRect(ctx, bx, by, bw, 10, 4);
    ctx.fill();
    ctx.fillStyle = pal.ok;
    roundRect(ctx, bx, by, Math.max(0, bw * clamp(expo / room.need, 0, 1)), 10, 4);
    ctx.fill();

    vignette(ctx, w, h, room.dark, px / w, py / h);
    grain(ctx, w, h, Math.floor(t * 10), 0.045);
    stepSparks(sparks, dt);
    drawSparks(ctx, sparks);
    banner(ctx, pal, room.name, coach);
    if (phase === "pass") overlay(ctx, w, h, pal, "보았다", "다음 방");
    if (phase === "done") overlay(ctx, w, h, pal, "소거", "회피하지 않았다");
    void justDown;
    void inRect;
  });
}

/* -------------------------------- pride -------------------------------- */

function ridgeX(yn: number, w: number, lv: number) {
  return (
    w * 0.5 +
    Math.sin(yn * Math.PI * (1.55 + lv * 0.32)) * w * (0.22 - lv * 0.016) +
    Math.sin(yn * Math.PI * 4.1) * w * 0.04
  );
}

function ridgeHalf(lv: number) {
  return Math.max(22, 62 - lv * 5.4);
}

type Vanity = { yn: number; side: number };

const CLIMBS: { name: string; vanities: Vanity[] }[] = [
  { name: "낮은 능선", vanities: [{ yn: 0.45, side: 1 }] },
  {
    name: "바람 능선",
    vanities: [
      { yn: 0.32, side: -1 },
      { yn: 0.62, side: 1 },
    ],
  },
  {
    name: "흰 바위",
    vanities: [
      { yn: 0.28, side: 1 },
      { yn: 0.5, side: -1 },
      { yn: 0.72, side: 1 },
    ],
  },
  {
    name: "좁아지는 길",
    vanities: [
      { yn: 0.22, side: -1 },
      { yn: 0.4, side: 1 },
      { yn: 0.58, side: -1 },
      { yn: 0.76, side: 1 },
    ],
  },
  {
    name: "허영의 턱",
    vanities: [
      { yn: 0.18, side: 1 },
      { yn: 0.34, side: -1 },
      { yn: 0.5, side: 1 },
      { yn: 0.66, side: -1 },
      { yn: 0.8, side: 1 },
    ],
  },
  {
    name: "정상 직전",
    vanities: [
      { yn: 0.16, side: -1 },
      { yn: 0.3, side: 1 },
      { yn: 0.44, side: -1 },
      { yn: 0.58, side: 1 },
      { yn: 0.7, side: -1 },
      { yn: 0.84, side: 1 },
    ],
  },
];

function playPride(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = CLAY;
  const rm = reducedMotion();
  let level = 0;
  let score = 0;
  let phase: Phase = "play";
  let finished = false;
  let px = 200;
  let py = 400;
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  let coach = "능선을 따라 정상에. 허영의 빛은 피하세요.";

  const placeStart = (w: number, h: number) => {
    const top = 70;
    const bot = h - 36;
    py = bot - 8;
    const yn = clamp(1 - (py - top) / Math.max(1, bot - top), 0, 1);
    px = ridgeX(yn, w, level);
  };

  const load = () => {
    phase = "play";
    const r = canvas.getBoundingClientRect();
    placeStart(Math.max(280, r.width), Math.max(280, r.height));
    lock = 0.7;
    coach = "눌러 끌어 능선을 오르세요. 허영의 빛은 피하세요.";
    hud(hooks, level + 1, CLIMBS.length, score, CLIMBS[level].name, coach);
  };

  const resetAll = () => {
    level = 0;
    score = 0;
    finished = false;
    sparks = [];
    t = 0;
    load();
  };

  const fail = (why: string) => {
    if (phase !== "play" || finished) return;
    phase = "fail";
    lock = 0.35;
    coach = why;
    noiseBurst(0.12, 0.05);
    hud(hooks, level + 1, CLIMBS.length, score, CLIMBS[level].name, coach);
  };

  const winLevel = (w: number) => {
    if (phase !== "play" || finished) return;
    score += 90 + level * 16;
    burst(sparks, w * 0.5, 78, pal.ok, rm ? 6 : 20);
    tone(490, 0.1, "sine", 0.06);
    tone(735, 0.18, "triangle", 0.04);
    if (level + 1 >= CLIMBS.length) {
      phase = "done";
      finished = true;
      coach = "정상. 비교가 아니라 기록이다.";
      hud(hooks, CLIMBS.length, CLIMBS.length, score, "정상", coach);
      hooks.onClear(score);
      return;
    }
    phase = "pass";
    lock = 1.05;
    coach = "다음 능선.";
    hud(hooks, level + 1, CLIMBS.length, score, CLIMBS[level].name, coach);
  };

  return run(canvas, resetAll, (dt, ctx, w, h, ptr, justDown) => {
    t += dt;
    lock = Math.max(0, lock - dt);
    const top = 70;
    const bot = h - 36;
    const climb = CLIMBS[level];
    const half = ridgeHalf(level);
    if (phase === "play") {
      if (ptr.down) {
        const n = follow(px, py, ptr.x, ptr.y, dt, 6.8, w, h, 14);
        px = n.x;
        py = n.y;
      }
      const yn = clamp(1 - (py - top) / Math.max(1, bot - top), 0, 1);
      const rx = ridgeX(yn, w, level);
      if (lock <= 0 && ptr.down && Math.abs(px - rx) > half + 8) fail("능선에서 떨어졌다. 눌러 다시.");
      for (const v of climb.vanities) {
        const vx = ridgeX(v.yn, w, level) + v.side * (half + 22);
        const vy = top + (1 - v.yn) * (bot - top);
        if (lock <= 0 && hit(px, py, vx, vy, 14)) fail("허영에 손을 뻗었다. 눌러 다시.");
      }
      if (lock <= 0 && yn > 0.93 && Math.abs(px - ridgeX(1, w, level)) < half + 10) winLevel(w);
    } else if (phase === "fail" && justDown && lock <= 0) {
      load();
    } else if (phase === "pass" && lock <= 0) {
      level += 1;
      load();
    }

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#2a221c");
    sky.addColorStop(0.4, "#1a1512");
    sky.addColorStop(1, "#12100e");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i <= 24; i++) {
      const yn = i / 24;
      ctx.lineTo(ridgeX(yn, w, level) - half - 40, top + (1 - yn) * (bot - top));
    }
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = "#0e0c0a";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w, h);
    for (let i = 0; i <= 24; i++) {
      const yn = i / 24;
      ctx.lineTo(ridgeX(yn, w, level) + half + 40, top + (1 - yn) * (bot - top));
    }
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = half * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const yn = i / 40;
      const x = ridgeX(yn, w, level);
      const y = top + (1 - yn) * (bot - top);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(240,230,216,0.55)";
    ctx.lineWidth = Math.max(6, half * 0.35);
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const yn = i / 40;
      const x = ridgeX(yn, w, level);
      const y = top + (1 - yn) * (bot - top);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const peakX = ridgeX(1, w, level);
    glow(ctx, peakX, top, 36, pal.ok, 0.4);
    ctx.fillStyle = pal.ok;
    ctx.beginPath();
    ctx.arc(peakX, top, 8, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, "정상", peakX, top - 16, pal.fg, 12, "center");

    climb.vanities.forEach((v, i) => {
      const vx = ridgeX(v.yn, w, level) + v.side * (half + 22);
      const vy = top + (1 - v.yn) * (bot - top);
      const tw = 0.55 + Math.sin(t * 5 + i) * 0.25;
      glow(ctx, vx, vy, 18, pal.warn, tw);
      ctx.fillStyle = pal.warn;
      ctx.beginPath();
      ctx.arc(vx, vy, 4 + Math.sin(t * 6 + i) * 1.2, 0, Math.PI * 2);
      ctx.fill();
      if (i === 0) label(ctx, "허영", vx, vy + 16, pal.muted, 10, "center");
    });

    glow(ctx, px, py, 18, pal.fg, 0.28);
    ctx.fillStyle = pal.fg;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();

    grain(ctx, w, h, Math.floor(t * 7), 0.035);
    stepSparks(sparks, dt);
    drawSparks(ctx, sparks);
    banner(ctx, pal, climb.name, coach);
    if (phase === "fail") overlay(ctx, w, h, pal, "추락", "눌러 이 능선을 다시");
    if (phase === "pass") overlay(ctx, w, h, pal, "올랐다", "다음 등반");
    if (phase === "done") overlay(ctx, w, h, pal, "정상", "능선을 지켰다");
  });
}

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  if (id === "myth") return playMyth(canvas, hooks);
  if (id === "fear") return playFear(canvas, hooks);
  if (id === "pride") return playPride(canvas, hooks);
  return playPhilo(canvas, hooks);
}
