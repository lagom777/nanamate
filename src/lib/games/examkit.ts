import type { Palette } from "./draw";
import type { GameHandle, GameHooks } from "./runtime";
import {
  display,
  fillRound,
  head,
  inRect,
  label,
  playKnow,
  popAt,
  scene,
  strokeRound,
  wrapText,
  type KnowApi,
  type KnowFrame,
} from "./know";

export type ExamChip = { text: string; role: string };
export type ExamSlot = { id: string; label: string; accept: string };
export type ExamItem = {
  title: string;
  body: string[];
  slots: ExamSlot[];
  chips: ExamChip[];
  why: string;
};

type Chip = ExamChip & { id: string; x: number; y: number; w: number; h: number; placed?: string };
type Slot = ExamSlot & { text?: string; x: number; y: number; w: number; h: number };
type Mode = { title: string; body: string[]; slots: Slot[]; chips: Chip[]; why: string };

export function playExam(
  id: string,
  canvas: HTMLCanvasElement,
  hooks: GameHooks,
  pal: Palette,
  heading: string,
  bank: ExamItem[][],
): GameHandle {
  let itemI = 0;
  let mode: Mode;
  let drag: Chip | null = null;
  let ox = 0;
  let oy = 0;

  function startItem(api: KnowApi) {
    drag = null;
    const spec = bank[api.level]?.[itemI] ?? bank[0]![0]!;
    mode = {
      title: spec.title,
      body: spec.body,
      slots: spec.slots.map((s) => ({ ...s, x: 0, y: 0, w: 0, h: 0 })),
      chips: spec.chips.map((c, i) => ({
        id: `${i}`,
        text: c.text,
        role: c.role,
        x: 0,
        y: 0,
        w: 120,
        h: 48,
      })),
      why: spec.why,
    };
    api.setCoach(`${itemI + 1}/${bank[api.level]?.length ?? 1} · ${spec.why}`);
  }

  function load(api: KnowApi) {
    itemI = 0;
    startItem(api);
  }

  function clearItem(api: KnowApi, x: number, y: number) {
    popAt(api, x, y, api.pal.ok, 12);
    const why = mode.why;
    if (itemI + 1 < (bank[api.level]?.length ?? 1)) {
      itemI += 1;
      startItem(api);
      api.setNote(why);
    } else api.succeed(why);
  }

  function layoutChips(chips: Chip[], w: number, h: number) {
    const loose = chips.filter((c) => !c.placed);
    const stacked = loose.some((c) => c.text.length > 14) || loose.length > 4;
    if (stacked) {
      const cw = w - 32;
      const ch = 40;
      loose.forEach((c, i) => {
        c.w = cw;
        c.h = ch;
        if (drag !== c) {
          c.x = 16;
          c.y = h - 12 - (loose.length - i) * (ch + 5);
        }
      });
      return;
    }
    const gap = 8;
    const n = Math.max(1, loose.length);
    const cw = Math.max(70, Math.min(160, (w - 24 - (n - 1) * gap) / n));
    const total = loose.length * cw + Math.max(0, loose.length - 1) * gap;
    const x0 = (w - total) / 2;
    loose.forEach((c, i) => {
      c.w = cw;
      c.h = 46;
      if (drag !== c) {
        c.x = x0 + i * (cw + gap);
        c.y = h - 56;
      }
    });
  }

  function drawChip(ctx: CanvasRenderingContext2D, c: Chip, hot: boolean, pal0: Palette) {
    fillRound(ctx, c.x, c.y, c.w, c.h, 8, hot ? pal0.accent : pal0.fill);
    strokeRound(ctx, c.x, c.y, c.w, c.h, 8, pal0.line);
    const color = hot ? pal0.bg : pal0.fg;
    ctx.font = "500 12px Pretendard, 'Pretendard Variable', sans-serif";
    const lines = wrapText(ctx, c.text, c.w - 12);
    const fs = lines.length > 1 ? 11 : 12;
    lines.slice(0, 2).forEach((ln, i) => {
      label(
        ctx,
        ln,
        c.x + c.w / 2,
        c.y + c.h / 2 + (i - (Math.min(lines.length, 2) - 1) / 2) * 13,
        color,
        fs,
        "center",
      );
    });
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown, justUp } = f;
    const n = bank[api.level]?.length ?? 1;
    head(ctx, w, `${heading}  ·  ${itemI + 1}/${n}`, api.level + 1, api.pal);
    label(ctx, api.note || api.teach, 16, 42, api.pal.muted, 11, "left");
    display(ctx, mode.title, 16, 62, api.pal.fg, 14, "left");
    let by = 80;
    ctx.font = "500 12px Pretendard, 'Pretendard Variable', sans-serif";
    mode.body.forEach((line) => {
      wrapText(ctx, line, w - 32).forEach((ln) => {
        label(ctx, ln, 16, by, api.pal.muted, 12, "left");
        by += 15;
      });
    });
    const tray = Math.max(52, 12 + mode.chips.filter((c) => !c.placed).length * 45);
    const room = h - tray - 10;
    const top = Math.min(room - mode.slots.length * 50, by + 8);
    const cols = mode.slots.length >= 4 ? 2 : 1;
    const sw = cols === 1 ? w - 32 : (w - 40) / 2;
    const sh = 46;
    mode.slots.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      s.x = 16 + col * (sw + 8);
      s.y = top + row * (sh + 6);
      s.w = sw;
      s.h = sh;
      fillRound(ctx, s.x, s.y, s.w, s.h, 8, api.pal.fill);
      strokeRound(ctx, s.x, s.y, s.w, s.h, 8, s.text ? api.pal.ok : api.pal.line);
      label(ctx, s.label, s.x + 10, s.y + 12, api.pal.muted, 11, "left");
      if (s.text) label(ctx, s.text, s.x + 10, s.y + 30, api.pal.fg, 12, "left");
    });

    layoutChips(mode.chips, w, h);
    if (justDown && api.hold <= 0) {
      const hit = [...mode.chips].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
      if (hit) {
        drag = hit;
        ox = ptr.x - hit.x;
        oy = ptr.y - hit.y;
      }
    }
    if (drag) {
      drag.x = ptr.x - ox;
      drag.y = ptr.y - oy;
    }
    if (justUp && drag) {
      const x = drag.x + drag.w / 2;
      const y = drag.y + drag.h / 2;
      const hit = mode.slots.find((s) => inRect(x, y, s.x, s.y, s.w, s.h));
      if (hit) {
        if (drag.role === hit.accept && !hit.text) {
          drag.placed = hit.id;
          hit.text = drag.text;
          popAt(api, x, y, api.pal.ok, 8);
          const need = mode.slots.filter((s) => s.accept !== "x").length;
          const got = mode.slots.filter((s) => s.accept !== "x" && s.text).length;
          if (got >= need) clearItem(api, x, y);
          else api.setCoach(`${hit.label} ← ${drag.text}`);
        } else api.miss("그 칸의 답이 아닙니다.");
      }
      drag = null;
    }
    for (const c of mode.chips) if (!c.placed) drawChip(ctx, c, drag === c, api.pal);
  }

  return playKnow(id, canvas, hooks, pal, { load, step });
}
