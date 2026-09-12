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

type BandSkin = {
  pal: Palette;
  names: string[];
  verb: string;
  lowFail: string;
  highFail: string;
  keep: string;
  btn: string;
  lo: number;
  hi: number;
  hold: number;
  kind: "heat" | "water";
};

const ANGER_NAMES = ["정의", "진화", "신경", "발달", "문화", "일상", "임상", "조절", "앞날"];
const SAD_NAMES = ["정의", "진화", "신경", "발달", "문화", "일상", "임상", "조절", "앞날"];

function playBand(canvas: HTMLCanvasElement, hooks: GameHooks, skin: BandSkin): GameHandle {
  const pal = skin.pal;
  const rm = reducedMotion();
  const total = 9;
  let level = 0;
  let score = 0;
  let phase: Phase = "play";
  let finished = false;
  let value = 0.45;
  let inside = 0;
  let t = 0;
  let lock = 0;
  let flash = 0;
  let sparks: Spark[] = [];
  let coach = skin.keep;

  const rise = () => 0.11 + level * 0.038;

  const load = () => {
    phase = "play";
    value = 0.42 + Math.random() * 0.12;
    inside = 0;
    lock = 0.35;
    flash = 0;
    coach = skin.keep;
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
    lock = 0.4;
    coach = why;
    noiseBurst(0.14, 0.055);
    hud(hooks, level + 1, total, score, skin.names[level], coach);
  };

  const winLevel = (w: number, h: number) => {
    if (phase !== "play" || finished) return;
    score += 70 + level * 14 + Math.round((1 - Math.abs(value - (skin.lo + skin.hi) / 2)) * 20);
    burst(sparks, w / 2, h * 0.42, pal.ok, rm ? 6 : 18);
    tone(520, 0.1, "sine", 0.06);
    tone(780, 0.16, "triangle", 0.04);
    if (level + 1 >= total) {
      phase = "done";
      finished = true;
      coach = "조절은 억압이 아니다.";
      hud(hooks, total, total, score, "안정", coach);
      hooks.onClear(score);
      return;
    }
    phase = "pass";
    lock = 1.0;
    coach = "다음 단계.";
    hud(hooks, level + 1, total, score, skin.names[level], coach);
  };

  return run(canvas, resetAll, (dt, ctx, w, h, ptr, justDown) => {
    t += dt;
    lock = Math.max(0, lock - dt);
    flash = Math.max(0, flash - dt);
    const btnR = 36;
    const bx = w / 2;
    const by = h - 52;

    if (phase === "play" && lock <= 0) {
      value = clamp(value + rise() * dt, 0, 1);
      if (justDown && hit(ptr.x, ptr.y, bx, by, btnR + 8)) {
        value = clamp(value - 0.12, 0, 1);
        flash = 0.18;
        tone(skin.kind === "heat" ? 180 : 240, 0.07, "sine", 0.05);
      }
      if (value >= 0.999) fail(skin.highFail);
      else if (value <= 0.001) fail(skin.lowFail);
      else if (value >= skin.lo && value <= skin.hi) {
        inside += dt;
        coach = `${skin.verb} ${inside.toFixed(1)} / ${skin.hold.toFixed(1)}초`;
        hud(hooks, level + 1, total, score, skin.names[level], coach);
        if (inside >= skin.hold) winLevel(w, h);
      } else {
        inside = Math.max(0, inside - dt * 1.4);
      }
    } else if (phase === "fail" && justDown && lock <= 0) {
      load();
    } else if (phase === "pass" && lock <= 0) {
      level += 1;
      load();
    }

    clear(ctx, w, h, pal);
    if (skin.kind === "heat") {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#140e0c");
      g.addColorStop(1, pal.bg);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    display(ctx, skin.names[level], 20, 28, pal.fg, 26, "left");
    label(ctx, coach, 20, 52, pal.muted, 13, "left");

    if (skin.kind === "heat") {
      const cx = w / 2;
      const cy = h * 0.42;
      const R = Math.min(110, w * 0.28);
      ctx.strokeStyle = pal.line;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI * 0.75, Math.PI * 2.25);
      ctx.stroke();
      const a0 = Math.PI * 0.75 + Math.PI * 1.5 * skin.lo;
      const a1 = Math.PI * 0.75 + Math.PI * 1.5 * skin.hi;
      ctx.strokeStyle = pal.ok;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, a1);
      ctx.stroke();
      ctx.strokeStyle = pal.fg;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * value);
      ctx.stroke();
      const ang = Math.PI * 0.75 + Math.PI * 1.5 * value;
      ctx.strokeStyle = value > skin.hi || value < skin.lo ? pal.bad : pal.accent;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * (R - 8), cy + Math.sin(ang) * (R - 8));
      ctx.stroke();
      ctx.fillStyle = pal.fg;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, `${Math.round(value * 100)}`, cx, cy + 28, pal.fg, 16, "center");
    } else {
      const tw = Math.min(120, w * 0.28);
      const th = Math.min(220, h * 0.46);
      const tx = (w - tw) / 2;
      const ty = h * 0.18;
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      roundRect(ctx, tx, ty, tw, th, 10);
      ctx.stroke();
      const waterH = th * value;
      const gy = ctx.createLinearGradient(0, ty + th - waterH, 0, ty + th);
      gy.addColorStop(0, "rgba(127,179,160,0.55)");
      gy.addColorStop(1, "rgba(90,130,150,0.8)");
      ctx.save();
      roundRect(ctx, tx + 3, ty + 3, tw - 6, th - 6, 8);
      ctx.clip();
      ctx.fillStyle = gy;
      ctx.fillRect(tx, ty + th - waterH, tw, waterH);
      ctx.strokeStyle = "rgba(228,232,238,0.25)";
      ctx.beginPath();
      for (let x = tx; x <= tx + tw; x += 6) ctx.lineTo(x, ty + th - waterH + Math.sin(x * 0.18 + t * 3) * 3);
      ctx.stroke();
      ctx.restore();
      const yLo = ty + th - th * skin.hi;
      const yHi = ty + th - th * skin.lo;
      ctx.strokeStyle = pal.ok;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tx - 8, yLo);
      ctx.lineTo(tx + tw + 8, yLo);
      ctx.moveTo(tx - 8, yHi);
      ctx.lineTo(tx + tw + 8, yHi);
      ctx.stroke();
      ctx.setLineDash([]);
      label(ctx, `${Math.round(value * 100)}`, w / 2, ty + th + 18, pal.fg, 14, "center");
    }

    const holdW = 160;
    ctx.fillStyle = pal.fill;
    roundRect(ctx, (w - holdW) / 2, 70, holdW, 8, 4);
    ctx.fill();
    ctx.fillStyle = pal.ok;
    roundRect(ctx, (w - holdW) / 2, 70, holdW * clamp(inside / skin.hold, 0, 1), 8, 4);
    ctx.fill();

    const hot = hit(ptr.x, ptr.y, bx, by, btnR + 8);
    ctx.fillStyle = flash > 0 ? pal.accent : hot ? pal.ok : pal.fill;
    ctx.beginPath();
    ctx.arc(bx, by, btnR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    label(ctx, skin.btn, bx, by, flash > 0 || hot ? pal.bg : pal.fg, 14, "center");

    grain(ctx, w, h, Math.floor(t * 7), 0.035);
    stepSparks(sparks, dt);
    drawSparks(ctx, sparks);
    if (phase === "fail") {
      const title = skin.kind === "heat" ? (value > 0.5 ? "폭발" : "억압") : value > 0.5 ? "홍수" : "메마름";
      overlay(ctx, w, h, pal, title, "눌러 이 단계를 다시");
    }
    if (phase === "pass") overlay(ctx, w, h, pal, "유지", "다음");
    if (phase === "done") overlay(ctx, w, h, pal, "안정", "배출의 속도");
    void inRect;
    void shuffle;
  });
}

const SURP_NAMES = ["정의", "진화", "신경", "발달", "문화", "일상", "임상", "조절", "앞날"];
const CUE_ACC = [0.85, 0.74, 0.64, 0.52, 0.4, 0.34, 0.3, 0.26, 0.22];
const THRESH = [2.6, 2.3, 2.1, 1.9, 1.7, 1.5, 1.4, 1.3, 1.2];

function playSurprise(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = INK;
  const rm = reducedMotion();
  const total = 9;
  const trials = 5;
  let level = 0;
  let score = 0;
  let phase: Phase = "play";
  let mode: "pick" | "reveal" = "pick";
  let finished = false;
  let trial = 0;
  let err = 0;
  let outcome = 1;
  let cue = 1;
  let pick = -1;
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  let coach = "어느 문이 열릴지 고르세요.";

  const roll = () => {
    outcome = Math.floor(Math.random() * 3);
    cue = Math.random() < CUE_ACC[level] ? outcome : Math.floor(Math.random() * 3);
    pick = -1;
    mode = "pick";
    lock = 0.2;
    coach = `시행 ${trial + 1}/${trials} · 힌트를 읽고 예측.`;
    hud(hooks, level + 1, total, score, SURP_NAMES[level], coach);
  };

  const load = () => {
    phase = "play";
    trial = 0;
    err = 0;
    roll();
  };

  const resetAll = () => {
    level = 0;
    score = 0;
    finished = false;
    sparks = [];
    t = 0;
    load();
  };

  const commit = (k: number, w: number, h: number) => {
    if (mode !== "pick" || phase !== "play" || finished) return;
    pick = k;
    const add = Math.abs(k - outcome);
    err += add;
    mode = "reveal";
    lock = 0.9;
    if (add === 0) {
      score += 18;
      coach = "예측이 맞았다.";
      burst(sparks, w / 2, h * 0.38, pal.ok, rm ? 4 : 12);
      tone(620, 0.09, "sine", 0.055);
    } else {
      coach = `오차 +${add.toFixed(0)} · 누적 ${err.toFixed(1)} / ${THRESH[level].toFixed(1)}`;
      noiseBurst(0.07, 0.035);
    }
    hud(hooks, level + 1, total, score, SURP_NAMES[level], coach);
  };

  const afterReveal = (w: number, h: number) => {
    trial += 1;
    if (trial >= trials) {
      if (err <= THRESH[level]) {
        score += 50 + Math.round((THRESH[level] - err) * 20);
        burst(sparks, w / 2, h * 0.3, pal.ok, rm ? 6 : 16);
        tone(520, 0.1, "sine", 0.06);
        if (level + 1 >= total) {
          phase = "done";
          finished = true;
          coach = "놀람은 예측 오차다.";
          hud(hooks, total, total, score, "학습", coach);
          hooks.onClear(score);
          return;
        }
        phase = "pass";
        lock = 1.0;
        coach = "모델을 고쳤다. 다음.";
        hud(hooks, level + 1, total, score, SURP_NAMES[level], coach);
      } else {
        phase = "fail";
        lock = 0.35;
        coach = "오차가 문턱을 넘었다. 눌러 다시.";
        noiseBurst(0.12, 0.05);
        hud(hooks, level + 1, total, score, SURP_NAMES[level], coach);
      }
    } else {
      roll();
    }
  };

  return run(canvas, resetAll, (dt, ctx, w, h, ptr, justDown) => {
    t += dt;
    lock = Math.max(0, lock - dt);
    const doors = [0, 1, 2].map((i) => {
      const bw = Math.max(72, (w - 64) / 3);
      const gap = 12;
      const x0 = (w - (bw * 3 + gap * 2)) / 2;
      return { i, x: x0 + i * (bw + gap), y: h * 0.34, w: bw, h: Math.max(110, h * 0.28) };
    });

    if (phase === "play" && mode === "pick" && justDown && lock <= 0) {
      const d = doors.find((d) => inRect(ptr.x, ptr.y, d.x, d.y, d.w, d.h));
      if (d) commit(d.i, w, h);
    } else if (phase === "play" && mode === "reveal" && lock <= 0) {
      afterReveal(w, h);
    } else if (phase === "fail" && justDown && lock <= 0) {
      load();
    } else if (phase === "pass" && lock <= 0) {
      level += 1;
      load();
    }

    clear(ctx, w, h, pal);
    display(ctx, SURP_NAMES[level], 20, 28, pal.fg, 26, "left");
    label(ctx, coach, 20, 52, pal.muted, 13, "left");

    const mw = w - 40;
    ctx.fillStyle = pal.fill;
    roundRect(ctx, 20, 70, mw, 10, 4);
    ctx.fill();
    ctx.fillStyle = err > THRESH[level] * 0.75 ? pal.bad : pal.warn;
    roundRect(ctx, 20, 70, mw * clamp(err / (THRESH[level] + 0.01), 0, 1), 10, 4);
    ctx.fill();
    label(ctx, `오차 ${err.toFixed(1)} / ${THRESH[level].toFixed(1)}`, 20, 94, pal.muted, 12, "left");

    doors.forEach((d) => {
      const hot = inRect(ptr.x, ptr.y, d.x, d.y, d.w, d.h);
      const isCue = d.i === cue && mode === "pick";
      const isOut = mode !== "pick" && d.i === outcome;
      const isPick = d.i === pick;
      ctx.fillStyle = isOut ? pal.ok : isPick && !isOut ? pal.bad : hot ? pal.accent : pal.fill;
      roundRect(ctx, d.x, d.y, d.w, d.h, 12);
      ctx.fill();
      ctx.strokeStyle = isCue ? pal.warn : pal.line;
      ctx.lineWidth = isCue ? 2.4 : 1;
      roundRect(ctx, d.x, d.y, d.w, d.h, 12);
      ctx.stroke();
      if (isCue && mode === "pick") {
        ctx.globalAlpha = 0.25 + Math.sin(t * 4) * 0.12;
        ctx.fillStyle = pal.warn;
        roundRect(ctx, d.x + 8, d.y + 8, d.w - 16, 10, 4);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      label(ctx, ["왼쪽", "가운데", "오른쪽"][d.i], d.x + d.w / 2, d.y + d.h / 2, hot ? pal.bg : pal.fg, 15, "center");
      if (isOut) label(ctx, "열림", d.x + d.w / 2, d.y + d.h - 18, pal.bg, 12, "center");
    });

    grain(ctx, w, h, Math.floor(t * 6), 0.03);
    stepSparks(sparks, dt);
    drawSparks(ctx, sparks);
    if (phase === "fail") overlay(ctx, w, h, pal, "과다 오차", "눌러 이 단계를 다시");
    if (phase === "pass") overlay(ctx, w, h, pal, "모델을 고침", "다음 예측");
    if (phase === "done") overlay(ctx, w, h, pal, "학습", "오차를 줄이는 쪽");
    void hit;
    void shuffle;
  });
}

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  if (id === "sadness") {
    return playBand(canvas, hooks, {
      pal: SLATE,
      names: SAD_NAMES,
      verb: "허용",
      lowFail: "완전히 말렸다. 눌러 다시.",
      highFail: "물이 넘쳤다. 눌러 다시.",
      keep: "0.3–0.75 사이를 4초 유지.",
      btn: "수문",
      lo: 0.3,
      hi: 0.75,
      hold: 4,
      kind: "water",
    });
  }
  if (id === "surprise") return playSurprise(canvas, hooks);
  return playBand(canvas, hooks, {
    pal: INK,
    names: ANGER_NAMES,
    verb: "조절",
    lowFail: "억압. 눌러 다시.",
    highFail: "폭발. 눌러 다시.",
    keep: "0.25–0.7 사이를 4초 유지.",
    btn: "밸브",
    lo: 0.25,
    hi: 0.7,
    hold: 4,
    kind: "heat",
  });
}
