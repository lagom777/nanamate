import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  INK,
  SLATE,
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
type Drop = { x: number; y: number; r: number; vy: number; good: boolean; alive: boolean; wob: number };

type Skin = {
  pal: Palette;
  names: string[];
  goodName: string;
  badName: string;
  good: string;
  bad: string;
  title: string;
  need: number;
  lives: number;
};

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
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  ctx.fillRect(0, 0, w, h);
  display(ctx, title, w / 2, h / 2 - 12, pal.fg, 32, "center");
  label(ctx, sub, w / 2, h / 2 + 22, pal.muted, 14, "center");
}

const JOY_NAMES = ["정의", "진화", "신경", "발달", "문화", "일상", "임상", "조절", "앞날"];
const DIS_NAMES = ["정의", "진화", "신경", "발달", "문화", "일상", "임상", "조절", "앞날"];

function playFall(canvas: HTMLCanvasElement, hooks: GameHooks, skin: Skin): GameHandle {
  const pal = skin.pal;
  const rm = reducedMotion();
  const total = 9;
  let level = 0;
  let score = 0;
  let phase: Phase = "play";
  let finished = false;
  let caught = 0;
  let hits = 0;
  let basket = 160;
  let items: Drop[] = [];
  let spawn = 0.4;
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  let coach = `${skin.goodName}만 받으세요.`;

  const speed = () => 90 + level * 22;
  const interval = () => Math.max(0.42, 1.12 - level * 0.11);
  const badP = () => 0.28 + level * 0.03;

  const load = () => {
    phase = "play";
    caught = 0;
    hits = 0;
    items = [];
    spawn = 0.35;
    lock = 0.35;
    coach = `${skin.goodName} ${skin.need}개. ${skin.badName}은 ${skin.lives}개까지.`;
    hud(hooks, level + 1, total, score, skin.names[level], coach);
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
    hud(hooks, level + 1, total, score, skin.names[level], coach);
  };

  const winLevel = (w: number, h: number) => {
    if (phase !== "play" || finished) return;
    score += 70 + level * 16 + (skin.lives - hits) * 12;
    burst(sparks, w / 2, h - 40, pal.ok, rm ? 6 : 18);
    tone(520, 0.1, "sine", 0.06);
    tone(780, 0.16, "triangle", 0.04);
    if (level + 1 >= total) {
      phase = "done";
      finished = true;
      coach = skin.title;
      hud(hooks, total, total, score, "완성", coach);
      hooks.onClear(score);
      return;
    }
    phase = "pass";
    lock = 1.0;
    coach = "다음 속도.";
    hud(hooks, level + 1, total, score, skin.names[level], coach);
  };

  return run(canvas, resetAll, (dt, ctx, w, h, ptr, justDown) => {
    t += dt;
    lock = Math.max(0, lock - dt);
    const bw = Math.max(72, Math.min(110, w * 0.22));
    const by = h - 28;
    basket = clamp(ptr.x, bw / 2 + 8, w - bw / 2 - 8);

    if (phase === "play" && lock <= 0) {
      spawn -= dt;
      if (spawn <= 0) {
        spawn = interval() * (0.75 + Math.random() * 0.5);
        const good = Math.random() > badP();
        items.push({
          x: 28 + Math.random() * (w - 56),
          y: -16,
          r: good ? 11 : 17,
          vy: speed() * (0.82 + Math.random() * 0.36),
          good,
          alive: true,
          wob: Math.random() * Math.PI * 2,
        });
      }
      for (const it of items) {
        if (!it.alive) continue;
        it.y += it.vy * dt;
        it.x += Math.sin(t * 2.2 + it.wob) * 18 * dt;
        it.x = clamp(it.x, 16, w - 16);
        const catchY = it.y + it.r > by - 18 && it.y < by + 10;
        const catchX = Math.abs(it.x - basket) < bw / 2 + it.r * 0.4;
        if (catchY && catchX) {
          it.alive = false;
          if (it.good) {
            caught += 1;
            score += 10;
            burst(sparks, it.x, it.y, skin.good, rm ? 3 : 10);
            tone(520 + caught * 18, 0.07, "sine", 0.05);
            coach = `${skin.goodName} ${caught}/${skin.need}`;
            hud(hooks, level + 1, total, score, skin.names[level], coach);
            if (caught >= skin.need) winLevel(w, h);
          } else {
            hits += 1;
            burst(sparks, it.x, it.y, pal.bad, rm ? 4 : 12);
            noiseBurst(0.08, 0.04);
            coach = `${skin.badName} ${hits}/${skin.lives}`;
            hud(hooks, level + 1, total, score, skin.names[level], coach);
            if (hits >= skin.lives) fail(`${skin.badName}을 너무 많이 담았다. 눌러 다시.`);
          }
        } else if (it.y > h + 30) {
          it.alive = false;
        }
      }
      items = items.filter((it) => it.alive);
    } else if (phase === "fail" && justDown && lock <= 0) {
      load();
    } else if (phase === "pass" && lock <= 0) {
      level += 1;
      load();
    }

    clear(ctx, w, h, pal);
    if (skin.pal === INK) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#1a120e");
      g.addColorStop(1, pal.bg);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    display(ctx, skin.names[level], 20, 28, pal.fg, 26, "left");
    label(ctx, coach, 20, 52, pal.muted, 13, "left");
    label(ctx, `${caught}/${skin.need} · 실수 ${hits}/${skin.lives}`, w - 20, 28, pal.muted, 12, "right");

    for (const it of items) {
      const x = it.x;
      const y = it.y;
      if (it.good) {
        const grd = ctx.createRadialGradient(x, y, 0, x, y, it.r * 2.2);
        grd.addColorStop(0, skin.good);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, it.r * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = skin.good;
        ctx.beginPath();
        ctx.arc(x, y, it.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = skin.bad;
        ctx.beginPath();
        ctx.arc(x, y, it.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(x - 3, y - 3, it.r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = pal.fill;
    ctx.beginPath();
    ctx.moveTo(basket - bw / 2, by - 16);
    ctx.lineTo(basket + bw / 2, by - 16);
    ctx.lineTo(basket + bw / 2 - 8, by + 14);
    ctx.lineTo(basket - bw / 2 + 8, by + 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    grain(ctx, w, h, Math.floor(t * 8), 0.035);
    stepSparks(sparks, dt);
    drawSparks(ctx, sparks);
    if (phase === "fail") overlay(ctx, w, h, pal, "과함", "눌러 이 단계를 다시");
    if (phase === "pass") overlay(ctx, w, h, pal, "리듬", "다음 낙하");
    if (phase === "done") overlay(ctx, w, h, pal, skin.title, "강도가 아니라 선택");
    void roundRect;
    void inRect;
    void hit;
    void shuffle;
  });
}

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  if (id === "disgust") {
    return playFall(canvas, hooks, {
      pal: SLATE,
      names: DIS_NAMES,
      goodName: "신선",
      badName: "상함",
      good: "#d7ddd4",
      bad: "#6b6a3a",
      title: "경계를 지켰다",
      need: 10,
      lives: 3,
    });
  }
  return playFall(canvas, hooks, {
    pal: INK,
    names: JOY_NAMES,
    goodName: "따뜻한 불씨",
    badName: "과열",
    good: "#d4a05a",
    bad: "#f2efe8",
    title: "회복의 리듬",
    need: 10,
    lives: 3,
  });
}
