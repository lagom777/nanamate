import { noiseBurst, tone, unlockAudio } from "./audio";
import { gameById } from "./catalog";
import {
  INK,
  PAPER,
  burst,
  drawSparks,
  stepSparks,
  type Palette,
  type Spark,
} from "./draw";
import {
  bindCanvas,
  startLoop,
  type GameHandle,
  type GameHooks,
  type Pointer,
} from "./runtime";

export type Frame = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dt: number;
  t: number;
  pal: Palette;
  ptr: Pointer;
  justDown: boolean;
  justUp: boolean;
  clicked: boolean;
  pressX: number;
  pressY: number;
  sparks: Spark[];
  ended: boolean;
};

export type Kit = {
  id: string;
  pal: Palette;
  s: {
    level: number;
    score: number;
    total: number;
    coach: string;
    status: string;
    ended: boolean;
  };
  emit: () => void;
  setCoach: (c: string) => void;
  ok: (pts: number, msg: string, x?: number, y?: number) => void;
  bad: (msg: string) => void;
  advance: (pts: number, msg: string) => "next" | "done";
  pop: (x: number, y: number, color: string, n?: number) => void;
  loop: (tick: (f: Frame) => void) => GameHandle;
};

export function makeKit(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): Kit {
  const meta = gameById(id);
  const pal = meta?.paper ? PAPER : INK;
  const view = bindCanvas(canvas);
  const sparks: Spark[] = [];
  const s = {
    level: 0,
    score: 0,
    total: 9,
    coach: meta?.how ?? "",
    status: "",
    ended: false,
  };
  let t = 0;
  let wasDown = false;
  let pressX = 0;
  let pressY = 0;
  let drag = 0;

  const emit = () => {
    hooks.onHud({
      level: Math.min(s.level + 1, s.total),
      total: s.total,
      score: s.score,
      status: s.status,
      coach: s.coach,
    });
  };

  const setCoach = (c: string) => {
    s.coach = c;
    emit();
  };

  const pop = (x: number, y: number, color: string, n = 12) => {
    burst(sparks, x, y, color, n);
  };

  const ok = (pts: number, msg: string, x?: number, y?: number) => {
    s.score += pts;
    s.coach = msg;
    tone(560, 0.08, "sine", 0.06);
    tone(840, 0.1, "triangle", 0.03);
    if (x != null && y != null) pop(x, y, pal.ok);
    emit();
  };

  const bad = (msg: string) => {
    s.coach = msg;
    tone(140, 0.11, "square", 0.045);
    noiseBurst(0.05, 0.02);
    emit();
  };

  const advance = (pts: number, msg: string): "next" | "done" => {
    s.score += pts;
    s.coach = msg;
    if (s.level + 1 >= s.total) {
      s.ended = true;
      emit();
      hooks.onClear(s.score);
      return "done";
    }
    s.level += 1;
    emit();
    return "next";
  };

  const loop = (tick: (f: Frame) => void): GameHandle => {
    emit();
    const stop = startLoop((dt) => {
      const ctx = view.ctx();
      const { w, h } = view.size();
      if (!ctx || w < 20) return;
      t += dt;
      const justDown = view.ptr.down && !wasDown;
      const justUp = !view.ptr.down && wasDown;
      if (justDown) {
        pressX = view.ptr.x;
        pressY = view.ptr.y;
        drag = 0;
        unlockAudio();
      }
      if (view.ptr.down) drag = Math.hypot(view.ptr.x - pressX, view.ptr.y - pressY);
      const clicked = justUp && drag < 14;
      tick({
        ctx,
        w,
        h,
        dt,
        t,
        pal,
        ptr: view.ptr,
        justDown,
        justUp,
        clicked,
        pressX,
        pressY,
        sparks,
        ended: s.ended,
      });
      stepSparks(sparks, dt);
      drawSparks(ctx, sparks);
      wasDown = view.ptr.down;
    });
    return {
      destroy: () => {
        stop();
        view.destroy();
      },
      restart: () => {
        s.level = 0;
        s.score = 0;
        s.ended = false;
        s.coach = meta?.how ?? "";
        s.status = "";
        sparks.length = 0;
        emit();
      },
    };
  };

  return { id, pal, s, emit, setCoach, ok, bad, advance, pop, loop };
}
