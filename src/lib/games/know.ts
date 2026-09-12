import { noiseBurst, tone, unlockAudio } from "./audio";
import { chapterAt, chaptersOf } from "./curriculum";
import {
  burst,
  clear,
  display,
  drawSparks,
  grain,
  inRect,
  label,
  roundRect,
  stepSparks,
  type Palette,
  type Spark,
} from "./draw";
import {
  bindCanvas,
  reducedMotion,
  startLoop,
  type GameHandle,
  type GameHooks,
  type Pointer,
} from "./runtime";

export const TOTAL = 9;
export const HOLD = 0.95;

export type KnowApi = {
  id: string;
  pal: Palette;
  level: number;
  total: number;
  score: number;
  mistakes: number;
  hold: number;
  t: number;
  flash: number;
  note: string;
  coach: string;
  cleared: boolean;
  rm: boolean;
  sparks: Spark[];
  chapterName: string;
  teach: string;
  setCoach: (s: string) => void;
  setNote: (s: string) => void;
  succeed: (msg: string) => void;
  miss: (msg: string) => void;
  emit: () => void;
};

export type KnowFrame = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dt: number;
  ptr: Pointer;
  justDown: boolean;
  justUp: boolean;
  api: KnowApi;
};

export function playKnow(
  id: string,
  canvas: HTMLCanvasElement,
  hooks: GameHooks,
  pal: Palette,
  handlers: {
    load: (api: KnowApi) => void;
    step: (f: KnowFrame) => void;
  },
): GameHandle {
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  const sparks: Spark[] = [];
  const chapters = chaptersOf(id);
  let wasDown = false;
  let pendingAdvance = false;

  const api: KnowApi = {
    id,
    pal,
    level: 0,
    total: TOTAL,
    score: 0,
    mistakes: 0,
    hold: 0,
    t: 0,
    flash: 0,
    note: "",
    coach: "",
    cleared: false,
    rm,
    sparks,
    chapterName: chapters[0]?.name ?? "",
    teach: chapters[0]?.teach ?? "",
    setCoach(s) {
      api.coach = s;
      emit();
    },
    setNote(s) {
      api.note = s;
    },
    succeed(msg) {
      if (api.hold > 0 || api.cleared) return;
      api.score += Math.max(28, 120 - api.mistakes * 8);
      api.hold = HOLD;
      api.coach = msg;
      api.note = msg;
      pendingAdvance = true;
      tone(520, 0.14, "sine", 0.07);
      tone(780, 0.2, "triangle", 0.05);
      if (api.level + 1 >= TOTAL) {
        api.cleared = true;
        hooks.onClear(api.score);
      }
      emit();
    },
    miss(msg) {
      if (api.hold > 0 || api.cleared) return;
      api.mistakes += 1;
      api.score = Math.max(0, api.score - 6);
      api.flash = 0.28;
      api.note = msg;
      api.coach = msg;
      noiseBurst(0.07, 0.04);
      emit();
    },
    emit() {
      emit();
    },
  };

  function syncChapter() {
    const ch = chapterAt(id, api.level + 1);
    api.chapterName = ch?.name ?? `${api.level + 1}장`;
    api.teach = ch?.teach ?? "";
  }

  function emit() {
    hooks.onHud({
      level: api.level + 1,
      total: TOTAL,
      score: api.score,
      status: api.chapterName,
      coach: api.coach || api.teach,
    });
  }

  function load() {
    syncChapter();
    api.mistakes = 0;
    api.hold = 0;
    api.flash = 0;
    api.note = "";
    api.coach = api.teach;
    pendingAdvance = false;
    handlers.load(api);
    emit();
  }

  load();

  const stop = startLoop((dt) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    const justDown = view.ptr.down && !wasDown;
    const justUp = !view.ptr.down && wasDown;
    if (justDown) unlockAudio();
    api.t += dt;
    api.flash = Math.max(0, api.flash - dt);
    if (!rm) stepSparks(sparks, dt);
    else sparks.length = 0;
    if (api.hold > 0) {
      api.hold -= dt;
      if (api.hold <= 0 && pendingAdvance && !api.cleared) {
        api.level += 1;
        load();
      }
    }
    handlers.step({
      ctx,
      w,
      h,
      dt,
      ptr: view.ptr,
      justDown,
      justUp,
      api,
    });
    wasDown = view.ptr.down;
  });

  return {
    destroy() {
      stop();
      view.destroy();
    },
    restart() {
      api.level = 0;
      api.score = 0;
      api.cleared = false;
      sparks.length = 0;
      load();
    },
  };
}

export function head(ctx: CanvasRenderingContext2D, w: number, title: string, n: number, pal: Palette) {
  display(ctx, title, 16, 22, pal.fg, 18, "left");
  label(ctx, `${n} / ${TOTAL}`, w - 16, 22, pal.muted, 12, "right");
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const ch of text) {
    const trial = cur + ch;
    if (ctx.measureText(trial).width > maxW && cur) {
      lines.push(cur);
      cur = ch;
    } else cur = trial;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function fillRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function strokeRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
  width = 1,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.lineWidth = 1;
}

export function tapBtn(
  f: KnowFrame,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  opts?: { sub?: string; accent?: boolean; dim?: boolean; ok?: boolean; bad?: boolean },
): boolean {
  const { ctx, ptr, justDown, api } = f;
  const pal = api.pal;
  const hot = inRect(ptr.x, ptr.y, x, y, w, h);
  const fill = opts?.accent ? pal.accent : opts?.ok ? pal.ok : opts?.bad ? pal.bad : pal.fill;
  const ink = opts?.accent ? pal.bg : pal.fg;
  ctx.globalAlpha = opts?.dim ? 0.45 : 1;
  fillRound(ctx, x, y, w, h, 10, fill);
  strokeRound(ctx, x, y, w, h, 10, opts?.ok ? pal.ok : hot ? pal.accent : pal.line, hot ? 1.6 : 1);
  label(ctx, text, x + w / 2, y + h / 2 - (opts?.sub ? 7 : 0), ink, text.length > 16 ? 12 : 14, "center");
  if (opts?.sub) label(ctx, opts.sub, x + w / 2, y + h / 2 + 10, opts?.accent ? pal.bg : pal.muted, 11, "center");
  ctx.globalAlpha = 1;
  return Boolean(justDown && api.hold <= 0 && !api.cleared && hot);
}

export function scene(f: KnowFrame) {
  const { ctx, w, h, api } = f;
  clear(ctx, w, h, api.pal);
  grain(ctx, w, h, (api.level + 1) * 13, 0.03);
  if (api.flash > 0) {
    ctx.fillStyle = `rgba(196,122,114,${api.flash * 0.18})`;
    ctx.fillRect(0, 0, w, h);
  }
}

export function popAt(api: KnowApi, x: number, y: number, color: string, n = 14) {
  if (!api.rm) burst(api.sparks, x, y, color, n);
}

export { inRect, label, display, roundRect };
