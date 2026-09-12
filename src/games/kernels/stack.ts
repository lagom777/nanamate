import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  CLAY,
  clear,
  grain,
  label,
  display,
  roundRect,
  inRect,
  burst,
  stepSparks,
  drawSparks,
  type Spark,
} from "@/lib/games/draw";

type Hex = { name: string; han: string; code: string; hint: string };

const LEVELS: Hex[] = [
  { name: "중천건", han: "乾", code: "TTTTTT", hint: "하늘. 여섯 양효가 겹친 순양." },
  { name: "중지곤", han: "坤", code: "BBBBBB", hint: "땅. 여섯 음효가 겹친 순음." },
  { name: "중수감", han: "坎", code: "BTBBTB", hint: "물. 가운데가 양인 함정." },
  { name: "중화리", han: "離", code: "TBTTBT", hint: "불. 가운데가 음인 밝음." },
  { name: "중택태", han: "兌", code: "TTBTTB", hint: "연못. 위가 열린 기쁨." },
  { name: "중산간", han: "艮", code: "BBTBBT", hint: "산. 위에 양이 머무름." },
  { name: "중풍손", han: "巽", code: "BTTBTT", hint: "바람. 아래가 음인 스며듦." },
  { name: "중뢰진", han: "震", code: "TBBTBB", hint: "우레. 아래가 양인 움직임." },
  { name: "지천태", han: "泰", code: "TTTBBB", hint: "땅 위에 하늘. 소통과 안정." },
];

function drawYao(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  yang: boolean,
  color: string,
) {
  ctx.fillStyle = color;
  if (yang) {
    roundRect(ctx, x, y, w, h, 3);
    ctx.fill();
    return;
  }
  const gap = w * 0.16;
  const hw = (w - gap) / 2;
  roundRect(ctx, x, y, hw, h, 3);
  ctx.fill();
  roundRect(ctx, x + hw + gap, y, hw, h, 3);
  ctx.fill();
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = CLAY;
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  const sparks: Spark[] = [];

  let level = 0;
  let score = 0;
  let mistakes = 0;
  let cleared = false;
  let wasDown = false;
  let t = 0;
  let hold = 0;
  let stack: ("T" | "B")[] = [];
  let flash = 0;
  let note = "";

  const emit = () => {
    const L = LEVELS[level];
    hooks.onHud({
      level: level + 1,
      total: LEVELS.length,
      score,
      status: L.name,
      coach: note || `${L.hint} 아래(초효)부터 쌓습니다.`,
    });
  };

  const load = () => {
    stack = [];
    flash = 0;
    hold = 0;
    note = "";
    mistakes = 0;
    emit();
  };

  const succeed = () => {
    if (hold > 0) return;
    score += Math.max(30, 120 - mistakes * 10);
    hold = 0.95;
    note = `${LEVELS[level].name} — 맞았습니다.`;
    const { w, h } = view.size();
    if (!rm) burst(sparks, w * 0.42, h * 0.46, pal.ok, 20);
    tone(480, 0.12, "sine", 0.07);
    tone(720, 0.2, "triangle", 0.05);
    if (level + 1 >= LEVELS.length && !cleared) {
      cleared = true;
      hooks.onClear(score);
    }
    emit();
  };

  const push = (bit: "T" | "B") => {
    if (hold > 0 || stack.length >= 6) return;
    unlockAudio();
    stack.push(bit);
    tone(bit === "T" ? 360 : 280, 0.07, "sine", 0.055);
    if (stack.length < 6) {
      emit();
      return;
    }
    if (stack.join("") === LEVELS[level].code) {
      succeed();
      return;
    }
    flash = 0.4;
    mistakes += 1;
    score = Math.max(0, score - 8);
    note = "효가 다릅니다. 다시 쌓습니다.";
    noiseBurst(0.08, 0.04);
    hold = 0.55;
    emit();
  };

  const undo = () => {
    if (hold > 0 || stack.length === 0) return;
    stack.pop();
    tone(220, 0.05, "sine", 0.04);
    note = "";
    emit();
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    flash = Math.max(0, flash - dt);
    if (!rm) stepSparks(sparks, dt);
    else sparks.length = 0;

    if (hold > 0) {
      hold -= dt;
      if (hold <= 0) {
        if (stack.length === 6 && stack.join("") !== LEVELS[level].code) {
          stack = [];
          note = "";
          emit();
        } else if (!cleared && stack.length === 6) {
          level += 1;
          load();
        }
      }
    }

    const btnH = Math.max(56, Math.min(72, h * 0.12));
    const btnY = h - btnH - 16;
    const yang = { x: 16, y: btnY, w: (w - 42) / 2, h: btnH };
    const yin = { x: 26 + yang.w, y: btnY, w: yang.w, h: btnH };
    const undoBtn = { x: w - 92, y: 48, w: 76, h: 44 };

    const pressed = view.ptr.down && !wasDown;
    if (pressed && hold <= 0) {
      unlockAudio();
      const { x, y } = view.ptr;
      if (inRect(x, y, undoBtn.x, undoBtn.y, undoBtn.w, undoBtn.h)) undo();
      else if (inRect(x, y, yang.x, yang.y, yang.w, yang.h)) push("T");
      else if (inRect(x, y, yin.x, yin.y, yin.w, yin.h)) push("B");
    }
    wasDown = view.ptr.down;

    clear(ctx, w, h, pal);
    if (flash > 0) {
      ctx.globalAlpha = flash * 0.16;
      ctx.fillStyle = pal.bad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    const L = LEVELS[level];
    display(ctx, L.name, 20, 28, pal.fg, 26, "left");
    label(ctx, `${L.han}  ·  ${level + 1} / ${LEVELS.length}`, 20, 52, pal.muted, 13, "left");

    const uhot = inRect(view.ptr.x, view.ptr.y, undoBtn.x, undoBtn.y, undoBtn.w, undoBtn.h);
    ctx.fillStyle = uhot ? pal.accent : pal.fill;
    roundRect(ctx, undoBtn.x, undoBtn.y, undoBtn.w, undoBtn.h, 10);
    ctx.fill();
    ctx.strokeStyle = pal.line;
    ctx.stroke();
    label(ctx, "지우기", undoBtn.x + undoBtn.w / 2, undoBtn.y + undoBtn.h / 2, uhot ? pal.bg : pal.fg, 13, "center");

    const boardW = Math.min(280, w * 0.52);
    const boardX = w * 0.08;
    const bot = btnY - 20;
    const lineH = Math.min(28, (bot - 78) / 6 - 8);
    const step = (bot - 78) / 6;

    for (let i = 0; i < 6; i++) {
      const y = bot - step * (i + 0.55);
      const filled = stack[i];
      ctx.globalAlpha = filled ? 1 : 0.35;
      drawYao(ctx, boardX, y, boardW, lineH, filled ? filled === "T" : true, filled ? pal.fg : pal.line);
      ctx.globalAlpha = 1;
      label(ctx, `${i + 1}효`, boardX - 4, y + lineH / 2, pal.muted, 11, "right");
    }

    const refW = Math.min(120, w * 0.28);
    const refX = w - refW - 24;
    const refTop = 108;
    label(ctx, "본괘", refX + refW / 2, refTop - 16, pal.muted, 12, "center");
    const refStep = 22;
    for (let i = 0; i < 6; i++) {
      const bit = L.code[i] === "T";
      const y = refTop + (5 - i) * refStep;
      drawYao(ctx, refX, y, refW, 10, bit, pal.accent);
    }
    label(ctx, "아래부터 여섯 효", refX + refW / 2, refTop + 6 * refStep + 10, pal.muted, 11, "center");

    const yhot = inRect(view.ptr.x, view.ptr.y, yang.x, yang.y, yang.w, yang.h);
    const nhot = inRect(view.ptr.x, view.ptr.y, yin.x, yin.y, yin.w, yin.h);
    ctx.fillStyle = yhot ? pal.accent : pal.fill;
    roundRect(ctx, yang.x, yang.y, yang.w, yang.h, 12);
    ctx.fill();
    ctx.strokeStyle = pal.line;
    ctx.stroke();
    drawYao(ctx, yang.x + 24, yang.y + yang.h / 2 - 5, yang.w - 48, 10, true, yhot ? pal.bg : pal.fg);
    label(ctx, "양", yang.x + yang.w / 2, yang.y + 16, yhot ? pal.bg : pal.muted, 13, "center");

    ctx.fillStyle = nhot ? pal.accent : pal.fill;
    roundRect(ctx, yin.x, yin.y, yin.w, yin.h, 12);
    ctx.fill();
    ctx.strokeStyle = pal.line;
    ctx.stroke();
    drawYao(ctx, yin.x + 24, yin.y + yin.h / 2 - 5, yin.w - 48, 10, false, nhot ? pal.bg : pal.fg);
    label(ctx, "음", yin.x + yin.w / 2, yin.y + 16, nhot ? pal.bg : pal.muted, 13, "center");

    if (hold > 0 && stack.length === 6 && stack.join("") === L.code) {
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = pal.ok;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    grain(ctx, w, h, Math.floor(t * 6) % 15, 0.032);
    drawSparks(ctx, sparks);
  };

  load();
  const stop = startLoop(tick);
  return {
    destroy() {
      stop();
      view.destroy();
    },
    restart() {
      level = 0;
      score = 0;
      cleared = false;
      sparks.length = 0;
      load();
    },
  };
}
