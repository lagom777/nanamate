import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  INK,
  PAPER,
  SLATE,
  CLAY,
  type Palette,
  clear,
  grain,
  label,
  display,
  roundRect,
  inRect,
  burst,
  stepSparks,
  drawSparks,
  shuffle,
  type Spark,
} from "@/lib/games/draw";

type Ptr = { x: number; y: number; down: boolean };

type GameApi = {
  readonly level: number;
  readonly hold: number;
  readonly flash: number;
  readonly t: number;
  readonly rm: boolean;
  sparks: Spark[];
  emit: () => void;
  succeed: (msg: string) => void;
  miss: (msg: string) => void;
  setNote: (s: string) => void;
};

type BoardSetup = {
  load: () => void;
  title: () => string;
  coach: () => string;
  draw: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dt: number,
    ptr: Ptr,
    justDown: boolean,
    justUp: boolean,
  ) => void;
};

const NTH = ["첫 번째", "두 번째", "세 번째", "네 번째", "다섯 번째", "여섯 번째", "일곱 번째"];

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
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

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

function boot(
  canvas: HTMLCanvasElement,
  hooks: GameHooks,
  pal: Palette,
  total: number,
  setup: (api: GameApi) => BoardSetup,
): GameHandle {
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
  let flash = 0;
  let note = "";

  let game: BoardSetup = {
    load: () => undefined,
    title: () => "",
    coach: () => "",
    draw: () => undefined,
  };

  const api: GameApi = {
    get level() {
      return level;
    },
    get hold() {
      return hold;
    },
    get flash() {
      return flash;
    },
    get t() {
      return t;
    },
    get rm() {
      return rm;
    },
    sparks,
    emit() {
      hooks.onHud({
        level: level + 1,
        total,
        score,
        status: game.title(),
        coach: note || game.coach(),
      });
    },
    succeed(msg: string) {
      if (hold > 0) return;
      score += Math.max(28, 108 - mistakes * 8);
      hold = 0.95;
      note = msg;
      const { w, h } = view.size();
      if (!rm) burst(sparks, w * 0.5, h * 0.38, pal.ok, 18);
      tone(500, 0.12, "sine", 0.07);
      tone(740, 0.18, "triangle", 0.05);
      if (level + 1 >= total && !cleared) {
        cleared = true;
        hooks.onClear(score);
      }
      api.emit();
    },
    miss(msg: string) {
      flash = 0.35;
      mistakes += 1;
      score = Math.max(0, score - 6);
      note = msg;
      noiseBurst(0.07, 0.04);
      api.emit();
    },
    setNote(s: string) {
      note = s;
    },
  };

  game = setup(api);

  const stop = startLoop((dt) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    flash = Math.max(0, flash - dt);
    if (!rm) stepSparks(sparks, dt);
    else sparks.length = 0;
    if (hold > 0) {
      hold -= dt;
      if (hold <= 0 && !cleared) {
        level += 1;
        note = "";
        mistakes = 0;
        game.load();
        api.emit();
      }
    }
    const justDown = view.ptr.down && !wasDown;
    const justUp = !view.ptr.down && wasDown;
    if (justDown) unlockAudio();
    clear(ctx, w, h, pal);
    if (flash > 0) {
      ctx.globalAlpha = flash * 0.12;
      ctx.fillStyle = pal.bad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    game.draw(ctx, w, h, dt, view.ptr, justDown, justUp);
    if (hold > 0) {
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = pal.ok;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    grain(ctx, w, h, Math.floor(t * 7) % 16, 0.03);
    drawSparks(ctx, sparks);
    wasDown = view.ptr.down;
  });

  game.load();
  api.emit();

  return {
    destroy() {
      stop();
      view.destroy();
    },
    restart() {
      level = 0;
      score = 0;
      mistakes = 0;
      cleared = false;
      hold = 0;
      flash = 0;
      note = "";
      sparks.length = 0;
      game.load();
      api.emit();
    },
  };
}

type SlotDef = { id: string; label: string; accept: string };
type ChipDef = {
  id: string;
  text: string;
  target: string;
  role?: string;
  sub?: string;
  trap?: boolean;
};
type BoardLevel = {
  title: string;
  coach: string;
  win: string;
  sequential: boolean;
  slots: SlotDef[];
  chips: ChipDef[];
};

type SlotBox = SlotDef & { x: number; y: number; w: number; h: number };
type ChipLive = ChipDef & {
  x: number;
  y: number;
  w: number;
  h: number;
  homeX: number;
  homeY: number;
  placed: string | null;
  fx: number;
  fy: number;
  ft: number;
  bounce: number;
};

type BoardEnv = {
  slots: SlotBox[];
  chips: ChipLive[];
  pal: Palette;
  t: number;
  hold: number;
  filled: boolean;
  level: BoardLevel;
  sparks: Spark[];
};

type BoardSpec = {
  pal: Palette;
  levels: BoardLevel[];
  headY: number;
  titleSize?: number;
  longChips?: boolean;
  sideTray?: boolean;
  wrongMsg: (chip: ChipDef, slot: SlotDef, level: BoardLevel) => string;
  layoutSlots: (level: BoardLevel, w: number, h: number, headY: number, trayTop: number) => SlotBox[];
  drawExtra?: (pass: "back" | "front", ctx: CanvasRenderingContext2D, w: number, h: number, dt: number, env: BoardEnv) => void;
  onLoad?: () => void;
};

function trayLayout(n: number, w: number, long: boolean) {
  const cols = long ? (n <= 2 ? 1 : 2) : n <= 3 ? Math.max(1, n) : n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / Math.max(1, cols));
  const gap = 8;
  const ch = Math.max(44, long ? 50 : 46);
  const cw = Math.max(44, (w - 24 - gap * (cols - 1)) / cols);
  const h = rows * ch + (rows - 1) * gap + 12;
  return { cols, rows, gap, ch, cw, h };
}

function playBoard(canvas: HTMLCanvasElement, hooks: GameHooks, spec: BoardSpec): GameHandle {
  return boot(canvas, hooks, spec.pal, spec.levels.length, (api) => {
    let chips: ChipLive[] = [];
    let selected: string | null = null;
    let drag: { id: string; ox: number; oy: number; moved: boolean } | null = null;

    const current = () => spec.levels[api.level];

    const load = () => {
      const L = current();
      const order = shuffle(L.chips.map((_, i) => i));
      chips = order.map((i) => {
        const c = L.chips[i];
        return {
          ...c,
          x: 0,
          y: 0,
          w: 44,
          h: 44,
          homeX: 0,
          homeY: 0,
          placed: null,
          fx: 0,
          fy: 0,
          ft: 1,
          bounce: 0,
        };
      });
      selected = null;
      drag = null;
      spec.onLoad?.();
    };

    const occupy = (slotId: string) => chips.find((c) => c.placed === slotId);

    const tryPlace = (chipId: string, slot: SlotBox) => {
      if (api.hold > 0) return;
      const chip = chips.find((c) => c.id === chipId);
      if (!chip || chip.placed) return;
      if (occupy(slot.id)) return;
      const L = current();
      if (L.sequential) {
        const next = L.slots.find((s) => !occupy(s.id));
        if (next && slot.id !== next.id) {
          chip.bounce = 0.35;
          api.miss("다음 빈 자리에 놓으세요.");
          return;
        }
      }
      if (chip.trap || chip.target !== slot.accept) {
        chip.bounce = 0.35;
        api.miss(spec.wrongMsg(chip, slot, L));
        return;
      }
      chip.placed = slot.id;
      chip.fx = chip.x;
      chip.fy = chip.y;
      chip.ft = 0;
      selected = null;
      tone(340 + L.slots.findIndex((s) => s.id === slot.id) * 40, 0.07, "sine", 0.055);
      if (L.slots.every((s) => occupy(s.id))) api.succeed(L.win);
      else api.emit();
    };

    const draw = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      dt: number,
      ptr: Ptr,
      justDown: boolean,
      justUp: boolean,
    ) => {
      const L = current();
      const loose = chips.filter((c) => !c.placed);
      const tray = spec.sideTray
        ? { cols: 1, rows: loose.length, gap: 8, ch: 46, cw: Math.max(44, w * 0.42), h: 0 }
        : trayLayout(Math.max(1, chips.length), w, !!spec.longChips);
      const trayTop = spec.sideTray ? h : h - tray.h;
      const slots = spec.layoutSlots(L, w, h, spec.headY, trayTop);

      if (spec.sideTray) {
        const n = Math.max(1, loose.length);
        const gap = 8;
        const ch = Math.max(44, Math.min(56, (h - spec.headY - 16 - gap * (n - 1)) / n));
        const cw = Math.max(44, w * 0.42);
        const x = w - 12 - cw;
        const total = n * ch + (n - 1) * gap;
        const y0 = spec.headY + Math.max(0, (h - spec.headY - 8 - total) / 2);
        loose.forEach((c, i) => {
          c.w = cw;
          c.h = ch;
          c.homeX = x;
          c.homeY = y0 + i * (ch + gap);
        });
      } else {
        loose.forEach((c, i) => {
          const col = i % tray.cols;
          const row = Math.floor(i / tray.cols);
          c.w = tray.cw;
          c.h = tray.ch;
          c.homeX = 12 + col * (tray.cw + tray.gap);
          c.homeY = trayTop + row * (tray.ch + tray.gap);
        });
      }

      chips.forEach((c) => {
        if (c.placed) {
          const s = slots.find((x) => x.id === c.placed);
          if (!s) return;
          const tw = Math.min(c.w, s.w - 8);
          const th = Math.min(c.h, Math.max(44, s.h - 18));
          c.w = tw;
          c.h = th;
          const tx = s.x + (s.w - tw) / 2;
          const ty = s.y + s.h - th - 4;
          if (c.ft < 1) {
            c.ft = Math.min(1, c.ft + dt / 0.22);
            const e = easeOut(c.ft);
            c.x = c.fx + (tx - c.fx) * e;
            c.y = c.fy + (ty - c.fy) * e;
          } else {
            c.x = tx;
            c.y = ty;
          }
        } else if (drag && drag.id === c.id) {
          c.x = ptr.x - drag.ox;
          c.y = ptr.y - drag.oy;
        } else if (c.bounce > 0) {
          c.bounce = Math.max(0, c.bounce - dt);
          c.x = c.homeX + Math.sin(c.bounce * 42) * 11 * (c.bounce / 0.35);
          c.y = c.homeY;
        } else {
          c.x = c.homeX;
          c.y = c.homeY;
        }
      });

      if (justDown && api.hold <= 0) {
        const hitChip = [...chips].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
        if (hitChip) {
          if (selected === hitChip.id) {
            const next = L.sequential ? L.slots.find((s) => !occupy(s.id)) : slots.find((s) => !occupy(s.id) && s.accept === hitChip.target);
            if (next) {
              const box = slots.find((s) => s.id === next.id);
              if (box) tryPlace(hitChip.id, box);
            } else {
              selected = null;
            }
          } else {
            selected = hitChip.id;
            drag = { id: hitChip.id, ox: ptr.x - hitChip.x, oy: ptr.y - hitChip.y, moved: false };
          }
        } else {
          const hitSlot = slots.find((s) => inRect(ptr.x, ptr.y, s.x, s.y, s.w, s.h));
          if (hitSlot && selected) tryPlace(selected, hitSlot);
        }
      }

      if (drag && ptr.down) {
        const c = chips.find((x) => x.id === drag!.id);
        if (c && !c.placed) {
          const dx = ptr.x - (c.homeX + drag.ox);
          const dy = ptr.y - (c.homeY + drag.oy);
          if (dx * dx + dy * dy > 64) drag.moved = true;
        }
      }

      if (justUp && drag) {
        const c = chips.find((x) => x.id === drag!.id);
        if (c && !c.placed && drag.moved) {
          const hitSlot = slots.find((s) => inRect(c.x + c.w / 2, c.y + c.h / 2, s.x, s.y, s.w, s.h));
          if (hitSlot) tryPlace(c.id, hitSlot);
        }
        drag = null;
      }

      const env: BoardEnv = {
        slots,
        chips,
        pal: spec.pal,
        t: api.t,
        hold: api.hold,
        filled: L.slots.every((s) => occupy(s.id)),
        level: L,
        sparks: api.sparks,
      };

      spec.drawExtra?.("back", ctx, w, h, dt, env);

      display(ctx, L.title, 16, 22, spec.pal.fg, spec.titleSize ?? 20, "left");
      label(ctx, `${api.level + 1} / ${spec.levels.length}`, w - 16, 22, spec.pal.muted, 12, "right");

      for (const s of slots) {
        const taken = occupy(s.id);
        const hot = inRect(ptr.x, ptr.y, s.x, s.y, s.w, s.h);
        ctx.globalAlpha = taken ? 0.22 : 1;
        ctx.fillStyle = taken ? spec.pal.ok : hot && selected ? spec.pal.accent : spec.pal.fill;
        roundRect(ctx, s.x, s.y, s.w, s.h, 10);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = spec.pal.line;
        ctx.lineWidth = 1;
        roundRect(ctx, s.x, s.y, s.w, s.h, 10);
        ctx.stroke();
        label(ctx, s.label, s.x + s.w / 2, s.y + 12, taken ? spec.pal.ok : spec.pal.muted, 11, "center");
      }

      spec.drawExtra?.("front", ctx, w, h, dt, env);

      for (const c of chips) {
        if (c.placed && c.ft >= 1) {
          const s = slots.find((x) => x.id === c.placed);
          if (s) {
            const size = c.text.length > 18 ? 12 : 14;
            ctx.font = `500 ${size}px Pretendard, 'Pretendard Variable', sans-serif`;
            const lines = wrapLines(ctx, c.text, s.w - 14);
            const lh = lines.length > 2 ? 13 : 15;
            const start = s.y + 26 + ((s.h - 30) / 2 - ((lines.length - 1) * lh) / 2);
            lines.forEach((ln, i) => label(ctx, ln, s.x + s.w / 2, start + i * lh, spec.pal.fg, size, "center"));
            if (c.sub) label(ctx, c.sub, s.x + s.w / 2, s.y + s.h - 10, spec.pal.muted, 10, "center");
          }
          continue;
        }
        const hot = inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h);
        const sel = selected === c.id;
        const wrong = c.bounce > 0;
        ctx.fillStyle = wrong ? spec.pal.bad : sel || hot ? spec.pal.accent : spec.pal.fill;
        roundRect(ctx, c.x, c.y, c.w, c.h, 12);
        ctx.fill();
        ctx.strokeStyle = sel ? spec.pal.fg : spec.pal.line;
        ctx.lineWidth = sel ? 1.6 : 1;
        roundRect(ctx, c.x, c.y, c.w, c.h, 12);
        ctx.stroke();
        const ink = wrong || sel || hot ? (wrong ? spec.pal.fg : spec.pal.bg) : spec.pal.fg;
        ctx.font = "500 13px Pretendard, 'Pretendard Variable', sans-serif";
        const lines = wrapLines(ctx, c.text, c.w - 14);
        const lh = 15;
        const start = c.y + c.h / 2 - ((lines.length - 1) * lh) / 2 - (c.sub ? 6 : 0);
        lines.forEach((ln, i) => label(ctx, ln, c.x + c.w / 2, start + i * lh, ink, 13, "center"));
        if (c.sub) label(ctx, c.sub, c.x + c.w / 2, c.y + c.h - 12, sel || hot ? spec.pal.bg : spec.pal.muted, 10, "center");
      }
    };

    return { load, title: () => current().title, coach: () => current().coach, draw };
  });
}

/* ---------------- English · SVO slot machine ---------------- */

const ENGLISH: BoardLevel[] = [
  {
    title: "원리",
    coach: "영어의 뼈는 SVO.",
    win: "주어 동사 목적어. 자리가 뜻이다.",
    sequential: false,
    slots: [
      { id: "s0", label: "주어", accept: "She" },
      { id: "s1", label: "동사", accept: "drinks" },
      { id: "s2", label: "목적어", accept: "tea" },
    ],
    chips: [
      { id: "c0", text: "She", target: "She", role: "주어" },
      { id: "c1", text: "drinks", target: "drinks", role: "동사" },
      { id: "c2", text: "tea", target: "tea", role: "목적어" },
    ],
  },
  {
    title: "관사",
    coach: "관사가 명사 앞에 앉습니다.",
    win: "The cat sat on the mat.",
    sequential: false,
    slots: [
      { id: "s0", label: "관사", accept: "The" },
      { id: "s1", label: "주어", accept: "cat" },
      { id: "s2", label: "동사", accept: "sat" },
      { id: "s3", label: "전치사", accept: "on" },
      { id: "s4", label: "관사", accept: "the" },
      { id: "s5", label: "명사", accept: "mat" },
    ],
    chips: [
      { id: "c0", text: "The", target: "The", role: "관사" },
      { id: "c1", text: "cat", target: "cat", role: "주어" },
      { id: "c2", text: "sat", target: "sat", role: "동사" },
      { id: "c3", text: "on", target: "on", role: "전치사" },
      { id: "c4", text: "the", target: "the", role: "관사" },
      { id: "c5", text: "mat", target: "mat", role: "명사" },
    ],
  },
  {
    title: "문법",
    coach: "시제·조동사가 시간의 뼈.",
    win: "I have never seen it.",
    sequential: false,
    slots: [
      { id: "s0", label: "주어", accept: "I" },
      { id: "s1", label: "조동사", accept: "have" },
      { id: "s2", label: "부사", accept: "never" },
      { id: "s3", label: "동사", accept: "seen" },
      { id: "s4", label: "목적어", accept: "it" },
    ],
    chips: [
      { id: "c0", text: "I", target: "I", role: "주어" },
      { id: "c1", text: "have", target: "have", role: "조동사" },
      { id: "c2", text: "never", target: "never", role: "부사" },
      { id: "c3", text: "seen", target: "seen", role: "동사" },
      { id: "c4", text: "it", target: "it", role: "목적어" },
    ],
  },
  {
    title: "어휘",
    coach: "콜로케이션. 같이 다니는 말.",
    win: "make a decision. do가 아닙니다.",
    sequential: false,
    slots: [
      { id: "s0", label: "동사", accept: "make" },
      { id: "s1", label: "관사", accept: "a" },
      { id: "s2", label: "명사", accept: "decision" },
    ],
    chips: [
      { id: "c0", text: "make", target: "make", role: "동사" },
      { id: "c1", text: "a", target: "a", role: "관사" },
      { id: "c2", text: "decision", target: "decision", role: "명사" },
      { id: "c3", text: "do", target: "make", role: "동사", trap: true },
    ],
  },
  {
    title: "회화",
    coach: "공손은 조동사와 간접 화법.",
    win: "Would you mind closing the door.",
    sequential: false,
    slots: [
      { id: "s0", label: "조동사", accept: "Would" },
      { id: "s1", label: "주어", accept: "you" },
      { id: "s2", label: "동사", accept: "mind" },
      { id: "s3", label: "동명사", accept: "closing" },
      { id: "s4", label: "관사", accept: "the" },
      { id: "s5", label: "목적어", accept: "door" },
    ],
    chips: [
      { id: "c0", text: "Would", target: "Would", role: "조동사" },
      { id: "c1", text: "you", target: "you", role: "주어" },
      { id: "c2", text: "mind", target: "mind", role: "동사" },
      { id: "c3", text: "closing", target: "closing", role: "동명사" },
      { id: "c4", text: "the", target: "the", role: "관사" },
      { id: "c5", text: "door", target: "door", role: "목적어" },
    ],
  },
  {
    title: "독해",
    coach: "주어·동사를 먼저 찾는다.",
    win: "Despite the rain we walked.",
    sequential: false,
    slots: [
      { id: "s0", label: "전치사", accept: "Despite" },
      { id: "s1", label: "관사", accept: "the" },
      { id: "s2", label: "명사", accept: "rain" },
      { id: "s3", label: "주어", accept: "we" },
      { id: "s4", label: "동사", accept: "walked" },
    ],
    chips: [
      { id: "c0", text: "Despite", target: "Despite", role: "전치사" },
      { id: "c1", text: "the", target: "the", role: "관사" },
      { id: "c2", text: "rain", target: "rain", role: "명사" },
      { id: "c3", text: "we", target: "we", role: "주어" },
      { id: "c4", text: "walked", target: "walked", role: "동사" },
    ],
  },
  {
    title: "작문",
    coach: "한 문장 한 생각.",
    win: "She writes one idea per sentence.",
    sequential: false,
    slots: [
      { id: "s0", label: "주어", accept: "She" },
      { id: "s1", label: "동사", accept: "writes" },
      { id: "s2", label: "수사", accept: "one" },
      { id: "s3", label: "명사", accept: "idea" },
      { id: "s4", label: "전치사", accept: "per" },
      { id: "s5", label: "명사", accept: "sentence" },
    ],
    chips: [
      { id: "c0", text: "She", target: "She", role: "주어" },
      { id: "c1", text: "writes", target: "writes", role: "동사" },
      { id: "c2", text: "one", target: "one", role: "수사" },
      { id: "c3", text: "idea", target: "idea", role: "명사" },
      { id: "c4", text: "per", target: "per", role: "전치사" },
      { id: "c5", text: "sentence", target: "sentence", role: "명사" },
    ],
  },
  {
    title: "비즈니스",
    coach: "요청은 조동사로 부드럽게.",
    win: "Could you send the file today.",
    sequential: false,
    slots: [
      { id: "s0", label: "조동사", accept: "Could" },
      { id: "s1", label: "주어", accept: "you" },
      { id: "s2", label: "동사", accept: "send" },
      { id: "s3", label: "관사", accept: "the" },
      { id: "s4", label: "목적어", accept: "file" },
      { id: "s5", label: "부사", accept: "today" },
    ],
    chips: [
      { id: "c0", text: "Could", target: "Could", role: "조동사" },
      { id: "c1", text: "you", target: "you", role: "주어" },
      { id: "c2", text: "send", target: "send", role: "동사" },
      { id: "c3", text: "the", target: "the", role: "관사" },
      { id: "c4", text: "file", target: "file", role: "목적어" },
      { id: "c5", text: "today", target: "today", role: "부사" },
    ],
  },
  {
    title: "미디어",
    coach: "도치와 강조가 헤드라인의 문법.",
    win: "Never have I seen such rain.",
    sequential: false,
    slots: [
      { id: "s0", label: "부사", accept: "Never" },
      { id: "s1", label: "조동사", accept: "have" },
      { id: "s2", label: "주어", accept: "I" },
      { id: "s3", label: "동사", accept: "seen" },
      { id: "s4", label: "한정사", accept: "such" },
      { id: "s5", label: "목적어", accept: "rain" },
    ],
    chips: [
      { id: "c0", text: "Never", target: "Never", role: "부사" },
      { id: "c1", text: "have", target: "have", role: "조동사" },
      { id: "c2", text: "I", target: "I", role: "주어" },
      { id: "c3", text: "seen", target: "seen", role: "동사" },
      { id: "c4", text: "such", target: "such", role: "한정사" },
      { id: "c5", text: "rain", target: "rain", role: "목적어" },
    ],
  },
];

function gridSlots(level: BoardLevel, w: number, h: number, headY: number, trayTop: number, forceCols?: number): SlotBox[] {
  const n = level.slots.length;
  const cols = forceCols ?? (n <= 4 ? n : Math.ceil(n / 2));
  const rows = Math.ceil(n / cols);
  const gap = 8;
  const areaH = Math.max(80, trayTop - headY - 10);
  const labelH = 16;
  const bw = Math.max(44, (w - 24 - gap * (cols - 1)) / cols);
  const bh = Math.max(44, Math.min(58, (areaH - labelH * rows - gap * (rows - 1)) / rows));
  const totalH = rows * (bh + labelH) + (rows - 1) * gap;
  const y0 = headY + Math.max(0, (areaH - totalH) / 2);
  return level.slots.map((s, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    return {
      ...s,
      x: 12 + c * (bw + gap),
      y: y0 + r * (bh + labelH + gap) + labelH,
      w: bw,
      h: bh,
    };
  });
}

function playEnglish(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  return playBoard(canvas, hooks, {
    pal: INK,
    levels: ENGLISH,
    headY: 54,
    wrongMsg: (chip, _slot, level) => {
      if (chip.trap) return `${chip.text}는 이 자리에 오지 않습니다. make a decision.`;
      const idx = level.slots.findIndex((s) => s.accept === chip.target);
      return `${chip.text}는 ${chip.role ?? "그 역할"}입니다. ${NTH[idx] ?? ""} 칸.`;
    },
    layoutSlots: (L, w, h, headY, trayTop) => gridSlots(L, w, h, headY, trayTop),
    drawExtra: (pass, ctx, _w, _h, _dt, env) => {
      if (pass !== "front") return;
      const built = env.level.slots
        .map((s) => {
          const c = env.chips.find((x) => x.placed === s.id && x.ft > 0.6);
          return c ? c.text : "—";
        })
        .join(" ");
      label(ctx, built, 16, 42, env.pal.muted, 13, "left");
    },
  });
}

/* ---------------- Writing · paragraph scaffold ---------------- */

const WRITING: BoardLevel[] = [
  {
    title: "기초",
    coach: "한 문단 한 주장.",
    win: "주장에서 근거로, 맺음으로 닫혔습니다.",
    sequential: false,
    slots: [
      { id: "claim", label: "주장", accept: "claim" },
      { id: "reason", label: "근거", accept: "reason" },
      { id: "close", label: "맺음", accept: "close" },
    ],
    chips: [
      { id: "a", text: "주장은 문단의 맨 앞에 밝혀야 한다.", target: "claim", role: "주장" },
      { id: "b", text: "근거 없는 주장은 설득력이 없다.", target: "reason", role: "근거" },
      { id: "c", text: "그러므로 문단은 주장에서 시작해야 한다.", target: "close", role: "맺음" },
    ],
  },
  {
    title: "문법",
    coach: "주어와 서술어가 맞아야 뼈가 선다.",
    win: "주어·서술·호응이 한 줄로 섰습니다.",
    sequential: false,
    slots: [
      { id: "sub", label: "주어", accept: "sub" },
      { id: "pred", label: "서술", accept: "pred" },
      { id: "fit", label: "호응", accept: "fit" },
    ],
    chips: [
      { id: "a", text: "주어는 문장 앞에 선다.", target: "sub", role: "주어" },
      { id: "b", text: "서술어가 그 동작을 받는다.", target: "pred", role: "서술" },
      { id: "c", text: "둘이 맞아야 문장의 뼈가 선다.", target: "fit", role: "호응" },
    ],
  },
  {
    title: "논리",
    coach: "주장 → 근거 → 예시 → 맺음.",
    win: "논증의 네 칸이 이어졌습니다.",
    sequential: false,
    slots: [
      { id: "claim", label: "주장", accept: "claim" },
      { id: "reason", label: "근거", accept: "reason" },
      { id: "ex", label: "예시", accept: "ex" },
      { id: "close", label: "맺음", accept: "close" },
    ],
    chips: [
      { id: "a", text: "충분한 수면은 학습에 필수다.", target: "claim", role: "주장" },
      { id: "b", text: "기억의 고정은 밤에 일어난다.", target: "reason", role: "근거" },
      { id: "c", text: "시험 전날 잠을 줄이면 점수가 떨어진다.", target: "ex", role: "예시" },
      { id: "d", text: "따라서 잠을 줄여 공부하는 전략은 실패한다.", target: "close", role: "맺음" },
    ],
  },
  {
    title: "설득",
    coach: "반론을 먼저 불러 재반박한다.",
    win: "반론을 불러 다시 닫았습니다.",
    sequential: false,
    slots: [
      { id: "claim", label: "주장", accept: "claim" },
      { id: "reason", label: "근거", accept: "reason" },
      { id: "ex", label: "예시", accept: "ex" },
      { id: "counter", label: "반론", accept: "counter" },
      { id: "rebut", label: "재반박", accept: "rebut" },
      { id: "close", label: "맺음", accept: "close" },
    ],
    chips: [
      { id: "a", text: "공공 도서관은 늘려야 한다.", target: "claim", role: "주장" },
      { id: "b", text: "무료 공간은 학습 격차를 줄인다.", target: "reason", role: "근거" },
      { id: "c", text: "야간 열람실을 연 구의 성적이 올랐다.", target: "ex", role: "예시" },
      { id: "d", text: "예산이 부족하다는 반대가 있다.", target: "counter", role: "반론" },
      { id: "e", text: "다른 중복 사업보다 단가가 낮다.", target: "rebut", role: "재반박" },
      { id: "f", text: "그러므로 도서관은 우선 투자다.", target: "close", role: "맺음" },
    ],
  },
  {
    title: "스토리",
    coach: "장면이 논증을 기억하게 한다.",
    win: "장면이 근거를 붙들었습니다.",
    sequential: false,
    slots: [
      { id: "claim", label: "주장", accept: "claim" },
      { id: "scene", label: "장면예시", accept: "scene" },
      { id: "reason", label: "근거", accept: "reason" },
      { id: "close", label: "맺음", accept: "close" },
    ],
    chips: [
      { id: "a", text: "손으로 쓰면 생각이 정리된다.", target: "claim", role: "주장" },
      { id: "b", text: "창가에서 펜이 멈추자 문장이 보였다.", target: "scene", role: "장면예시" },
      { id: "c", text: "근육 기억이 주의를 붙잡아 둔다.", target: "reason", role: "근거" },
      { id: "d", text: "중요한 대목은 손으로 남기는 편이 낫다.", target: "close", role: "맺음" },
    ],
  },
  {
    title: "실용",
    coach: "결론을 위에, 이유는 아래에.",
    win: "결론이 위에 앉았습니다.",
    sequential: false,
    slots: [
      { id: "close", label: "맺음", accept: "close" },
      { id: "why", label: "이유", accept: "why" },
      { id: "reason", label: "근거", accept: "reason" },
    ],
    chips: [
      { id: "a", text: "그러니 안건이 단순한 날은 밖으로 나가자.", target: "close", role: "맺음" },
      { id: "b", text: "짧은 회의는 걸으며 하는 편이 낫다.", target: "why", role: "이유" },
      { id: "c", text: "움직임은 고착된 관점을 흔든다.", target: "reason", role: "근거" },
    ],
  },
  {
    title: "에세이",
    coach: "서론이 질문을 열고 결론이 닫는다.",
    win: "질문이 열고 결론이 닫았습니다.",
    sequential: false,
    slots: [
      { id: "q", label: "질문", accept: "q" },
      { id: "claim", label: "주장", accept: "claim" },
      { id: "reason", label: "근거", accept: "reason" },
      { id: "close", label: "결론", accept: "close" },
    ],
    chips: [
      { id: "a", text: "도시는 누구의 그늘을 빌려 사는가.", target: "q", role: "질문" },
      { id: "b", text: "도시는 나무를 더 심어야 한다.", target: "claim", role: "주장" },
      { id: "c", text: "녹지는 여름 온도를 낮춘다.", target: "reason", role: "근거" },
      { id: "d", text: "그러므로 가로수는 공공의 그늘이다.", target: "close", role: "결론" },
    ],
  },
  {
    title: "교정",
    coach: "빼는 일이 쓰는 일의 반.",
    win: "군더더기를 버렸습니다.",
    sequential: false,
    slots: [
      { id: "claim", label: "주장", accept: "claim" },
      { id: "reason", label: "근거", accept: "reason" },
      { id: "close", label: "맺음", accept: "close" },
      { id: "bin", label: "빼기", accept: "bin" },
    ],
    chips: [
      { id: "a", text: "공공 도서관은 늘려야 한다.", target: "claim", role: "주장" },
      { id: "b", text: "무료 공간은 학습 격차를 줄인다.", target: "reason", role: "근거" },
      { id: "c", text: "그러므로 도서관은 우선 투자다.", target: "close", role: "맺음" },
      { id: "d", text: "오늘 점심은 김치찌개였다.", target: "bin", role: "빼기" },
    ],
  },
  {
    title: "AI 글쓰기",
    coach: "초안은 기계, 판단은 사람.",
    win: "초안을 확인하고 다듬었습니다.",
    sequential: false,
    slots: [
      { id: "draft", label: "초안", accept: "draft" },
      { id: "fact", label: "사실확인", accept: "fact" },
      { id: "judge", label: "판단", accept: "judge" },
      { id: "edit", label: "다듬기", accept: "edit" },
    ],
    chips: [
      { id: "a", text: "기계가 초고를 쏟아 낸다.", target: "draft", role: "초안" },
      { id: "b", text: "숫자는 출처와 맞춰 본다.", target: "fact", role: "사실확인" },
      { id: "c", text: "이 문장이 주장에 필요한가.", target: "judge", role: "판단" },
      { id: "d", text: "군더더기를 잘라 리듬을 고친다.", target: "edit", role: "다듬기" },
    ],
  },
];

function playWriting(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  return playBoard(canvas, hooks, {
    pal: PAPER,
    levels: WRITING,
    headY: 38,
    longChips: true,
    wrongMsg: (chip) => `${chip.role ?? "그 문장"}은 ${chip.role} 칸에 둡니다.`,
    layoutSlots: (L, w, h, headY, trayTop) => {
      const n = L.slots.length;
      const areaH = trayTop - headY - 8;
      const cols = n >= 5 && areaH < n * 58 ? 2 : 1;
      return gridSlots(L, w, h, headY, trayTop, cols);
    },
    drawExtra: (pass, ctx, _w, _h, _dt, env) => {
      if (pass !== "front" || !env.filled) return;
      const boxes = env.slots;
      ctx.strokeStyle = env.pal.ok;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < boxes.length - 1; i++) {
        const a = boxes[i];
        const b = boxes[i + 1];
        const x1 = a.x + a.w / 2;
        const y1 = a.y + a.h;
        const x2 = b.x + b.w / 2;
        const y2 = b.y;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  });
}

/* ---------------- Harness · circular agent loop ---------------- */

const HARNESS: BoardLevel[] = [
  {
    title: "하네스란",
    coach: "모델 밖의 루프. 계획하고 실행하고 닫습니다.",
    win: "짧은 고리가 닫혔습니다.",
    sequential: false,
    slots: [
      { id: "plan", label: "계획", accept: "계획" },
      { id: "act", label: "실행", accept: "실행" },
      { id: "done", label: "완료", accept: "완료" },
    ],
    chips: [
      { id: "a", text: "계획", target: "계획" },
      { id: "b", text: "실행", target: "실행" },
      { id: "c", text: "완료", target: "완료" },
    ],
  },
  {
    title: "에이전트 루프",
    coach: "계획 → 실행 → 관찰.",
    win: "관찰이 루프에 붙었습니다.",
    sequential: false,
    slots: [
      { id: "plan", label: "계획", accept: "계획" },
      { id: "act", label: "실행", accept: "실행" },
      { id: "see", label: "관찰", accept: "관찰" },
      { id: "done", label: "완료", accept: "완료" },
    ],
    chips: [
      { id: "a", text: "계획", target: "계획" },
      { id: "b", text: "실행", target: "실행" },
      { id: "c", text: "관찰", target: "관찰" },
      { id: "d", text: "완료", target: "완료" },
    ],
  },
  {
    title: "도구",
    coach: "도구 없이 생각만 하면 루프가 샌다.",
    win: "도구실행이 자리에 앉았습니다.",
    sequential: false,
    slots: [
      { id: "plan", label: "계획", accept: "계획" },
      { id: "tool", label: "도구실행", accept: "도구실행" },
      { id: "see", label: "관찰", accept: "관찰" },
      { id: "done", label: "완료", accept: "완료" },
    ],
    chips: [
      { id: "a", text: "계획", target: "계획" },
      { id: "b", text: "도구실행", target: "도구실행" },
      { id: "c", text: "관찰", target: "관찰" },
      { id: "d", text: "완료", target: "완료" },
    ],
  },
  {
    title: "컨텍스트",
    coach: "창이 작으면 계획을 다시 적는다.",
    win: "다시계획이 고리를 돌립니다.",
    sequential: false,
    slots: [
      { id: "plan", label: "계획", accept: "계획" },
      { id: "act", label: "실행", accept: "실행" },
      { id: "see", label: "관찰", accept: "관찰" },
      { id: "re", label: "다시계획", accept: "다시계획" },
    ],
    chips: [
      { id: "a", text: "계획", target: "계획" },
      { id: "b", text: "실행", target: "실행" },
      { id: "c", text: "관찰", target: "관찰" },
      { id: "d", text: "다시계획", target: "다시계획" },
    ],
  },
  {
    title: "검증",
    coach: "검증이 없으면 루프가 샌다.",
    win: "검증이 루프를 닫았습니다.",
    sequential: false,
    slots: [
      { id: "plan", label: "계획", accept: "계획" },
      { id: "act", label: "실행", accept: "실행" },
      { id: "see", label: "관찰", accept: "관찰" },
      { id: "check", label: "검증", accept: "검증" },
      { id: "done", label: "완료", accept: "완료" },
    ],
    chips: [
      { id: "a", text: "계획", target: "계획" },
      { id: "b", text: "실행", target: "실행" },
      { id: "c", text: "관찰", target: "관찰" },
      { id: "d", text: "검증", target: "검증" },
      { id: "e", text: "완료", target: "완료" },
    ],
  },
  {
    title: "오케스트레이션",
    coach: "여러 에이전트의 순서와 권한.",
    win: "위임과 취합이 검증으로 모였습니다.",
    sequential: false,
    slots: [
      { id: "plan", label: "계획", accept: "계획" },
      { id: "del", label: "위임", accept: "위임" },
      { id: "act", label: "실행", accept: "실행" },
      { id: "join", label: "취합", accept: "취합" },
      { id: "check", label: "검증", accept: "검증" },
    ],
    chips: [
      { id: "a", text: "계획", target: "계획" },
      { id: "b", text: "위임", target: "위임" },
      { id: "c", text: "실행", target: "실행" },
      { id: "d", text: "취합", target: "취합" },
      { id: "e", text: "검증", target: "검증" },
    ],
  },
  {
    title: "메모리",
    coach: "긴 작업은 밖에 적는다.",
    win: "기록과 회수가 검증을 받칩니다.",
    sequential: false,
    slots: [
      { id: "plan", label: "계획", accept: "계획" },
      { id: "mem", label: "기록", accept: "기록" },
      { id: "act", label: "실행", accept: "실행" },
      { id: "get", label: "회수", accept: "회수" },
      { id: "check", label: "검증", accept: "검증" },
    ],
    chips: [
      { id: "a", text: "계획", target: "계획" },
      { id: "b", text: "기록", target: "기록" },
      { id: "c", text: "실행", target: "실행" },
      { id: "d", text: "회수", target: "회수" },
      { id: "e", text: "검증", target: "검증" },
    ],
  },
  {
    title: "안전",
    coach: "위험한 도구는 게이트 뒤.",
    win: "게이트가 실행 앞에 섰습니다.",
    sequential: false,
    slots: [
      { id: "plan", label: "계획", accept: "계획" },
      { id: "gate", label: "게이트", accept: "게이트" },
      { id: "act", label: "실행", accept: "실행" },
      { id: "check", label: "검증", accept: "검증" },
      { id: "done", label: "완료", accept: "완료" },
    ],
    chips: [
      { id: "a", text: "계획", target: "계획" },
      { id: "b", text: "게이트", target: "게이트" },
      { id: "c", text: "실행", target: "실행" },
      { id: "d", text: "검증", target: "검증" },
      { id: "e", text: "완료", target: "완료" },
    ],
  },
  {
    title: "실패",
    coach: "같은 실수를 두 번 하지 않게 고친다.",
    win: "수정 뒤 재실행으로 고리를 닫았습니다.",
    sequential: false,
    slots: [
      { id: "plan", label: "계획", accept: "계획" },
      { id: "act", label: "실행", accept: "실행" },
      { id: "see", label: "관찰", accept: "관찰" },
      { id: "check", label: "검증", accept: "검증" },
      { id: "fix", label: "수정", accept: "수정" },
      { id: "redo", label: "재실행", accept: "재실행" },
    ],
    chips: [
      { id: "a", text: "계획", target: "계획" },
      { id: "b", text: "실행", target: "실행" },
      { id: "c", text: "관찰", target: "관찰" },
      { id: "d", text: "검증", target: "검증" },
      { id: "e", text: "수정", target: "수정" },
      { id: "f", text: "재실행", target: "재실행" },
    ],
  },
];

function ringLayout(level: BoardLevel, w: number, _h: number, headY: number, trayTop: number): SlotBox[] {
  const n = level.slots.length;
  const cx = w / 2;
  const cy = (headY + trayTop) / 2;
  const R = Math.max(70, Math.min(w * 0.34, (trayTop - headY) * 0.36));
  return level.slots.map((s, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const bw = Math.max(44, Math.min(88, 18 + s.label.length * 11));
    const bh = 46;
    return { ...s, x: cx + Math.cos(a) * R - bw / 2, y: cy + Math.sin(a) * R - bh / 2, w: bw, h: bh };
  });
}

function playHarness(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const packets = [0, 0.18, 0.36, 0.54, 0.72];
  let leakT = 0;
  return playBoard(canvas, hooks, {
    pal: SLATE,
    levels: HARNESS,
    headY: 40,
    wrongMsg: (chip) => `${chip.text}는 ${chip.text} 소켓에 앉습니다.`,
    layoutSlots: ringLayout,
    onLoad: () => {
      leakT = 0;
      packets[0] = 0;
      packets[1] = 0.18;
      packets[2] = 0.36;
      packets[3] = 0.54;
      packets[4] = 0.72;
    },
    drawExtra: (pass, ctx, w, _h, dt, env) => {
      const cx = w / 2;
      const cy = env.slots.reduce((a, s) => a + s.y + s.h / 2, 0) / Math.max(1, env.slots.length);
      const R =
        env.slots.reduce((a, s) => {
          const dx = s.x + s.w / 2 - cx;
          const dy = s.y + s.h / 2 - cy;
          return a + Math.hypot(dx, dy);
        }, 0) / Math.max(1, env.slots.length);
      const check = env.slots.find((s) => s.accept === "검증");
      const checkEmpty = !!check && !env.chips.some((c) => c.placed === check.id);
      const sealed = env.filled;

      if (pass === "back") {
        ctx.strokeStyle = sealed ? env.pal.ok : checkEmpty ? env.pal.bad : env.pal.line;
        ctx.lineWidth = sealed ? 3 : 2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(20, R - 10), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        label(ctx, sealed ? "순환" : checkEmpty ? "누수" : "대기", cx, cy, sealed ? env.pal.ok : env.pal.muted, 12, "center");
        return;
      }

      const speed = sealed ? 0.22 : 0.16;
      for (let i = 0; i < packets.length; i++) packets[i] = (packets[i] + dt * speed) % 1;
      if (checkEmpty) {
        leakT += dt;
        if (leakT > 0.32) {
          leakT = 0;
          const ci = env.slots.findIndex((s) => s.accept === "검증");
          const a = -Math.PI / 2 + (ci / env.slots.length) * Math.PI * 2;
          burst(env.sparks, cx + Math.cos(a) * R, cy + Math.sin(a) * R, env.pal.bad, 8);
        }
      }

      for (const u of packets) {
        const a = -Math.PI / 2 + u * Math.PI * 2;
        let px = cx + Math.cos(a) * R;
        let py = cy + Math.sin(a) * R;
        if (checkEmpty) {
          const ci = env.slots.findIndex((s) => s.accept === "검증") / env.slots.length;
          const du = Math.abs(((u - ci + 1.5) % 1) - 0.5);
          if (du > 0.42) {
            px += Math.cos(a) * 16;
            py += Math.sin(a) * 16;
          }
        }
        ctx.fillStyle = sealed ? env.pal.ok : checkEmpty ? env.pal.bad : env.pal.warn;
        ctx.beginPath();
        ctx.arc(px, py, sealed ? 4 : 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  });
}

/* ---------------- Tarot · fool's journey ---------------- */

const TAROT: BoardLevel[] = [
  {
    title: "타로란",
    coach: "78장 중 메이저.",
    win: "바보에서 마법사로 첫 걸음.",
    sequential: true,
    slots: [
      { id: "s0", label: "0", accept: "fool" },
      { id: "s1", label: "1", accept: "mage" },
    ],
    chips: [
      { id: "a", text: "바보", target: "fool", sub: "출발과 믿음" },
      { id: "b", text: "마법사", target: "mage", sub: "의지와 도구" },
    ],
  },
  {
    title: "메이저 앞",
    coach: "0 바보에서 3 여황제.",
    win: "출발의 네 장이 섰습니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "0", accept: "fool" },
      { id: "s1", label: "1", accept: "mage" },
      { id: "s2", label: "2", accept: "priestess" },
      { id: "s3", label: "3", accept: "empress" },
    ],
    chips: [
      { id: "a", text: "바보", target: "fool", sub: "출발과 믿음" },
      { id: "b", text: "마법사", target: "mage", sub: "의지와 도구" },
      { id: "c", text: "여사제", target: "priestess", sub: "내면의 앎" },
      { id: "d", text: "여황제", target: "empress", sub: "풍요와 돌봄" },
    ],
  },
  {
    title: "메이저 뒤",
    coach: "황제에서 전차까지.",
    win: "세계의 법이 이어졌습니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "4", accept: "emp" },
      { id: "s1", label: "5", accept: "hier" },
      { id: "s2", label: "6", accept: "lov" },
      { id: "s3", label: "7", accept: "cha" },
    ],
    chips: [
      { id: "a", text: "황제", target: "emp", sub: "질서와 구조" },
      { id: "b", text: "교황", target: "hier", sub: "전통과 가르침" },
      { id: "c", text: "연인", target: "lov", sub: "선택과 결합" },
      { id: "d", text: "전차", target: "cha", sub: "의지와 전진" },
    ],
  },
  {
    title: "마이너",
    coach: "완드 컵 소드 펜타클. 불 물 공기 흙.",
    win: "네 원소의 순서가 앉았습니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "불", accept: "wand" },
      { id: "s1", label: "물", accept: "cup" },
      { id: "s2", label: "공기", accept: "sword" },
      { id: "s3", label: "흙", accept: "pent" },
    ],
    chips: [
      { id: "a", text: "완드", target: "wand", sub: "불 · 의지" },
      { id: "b", text: "컵", target: "cup", sub: "물 · 감정" },
      { id: "c", text: "소드", target: "sword", sub: "공기 · 사유" },
      { id: "d", text: "펜타클", target: "pent", sub: "흙 · 물질" },
    ],
  },
  {
    title: "코트",
    coach: "페이지·나이트·퀸·킹이 역할.",
    win: "네 얼굴이 자리에 섰습니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "전령", accept: "page" },
      { id: "s1", label: "행동", accept: "knight" },
      { id: "s2", label: "숙성", accept: "queen" },
      { id: "s3", label: "주권", accept: "king" },
    ],
    chips: [
      { id: "a", text: "페이지", target: "page", sub: "전령" },
      { id: "b", text: "나이트", target: "knight", sub: "행동" },
      { id: "c", text: "퀸", target: "queen", sub: "숙성" },
      { id: "d", text: "킹", target: "king", sub: "주권" },
    ],
  },
  {
    title: "역방향",
    coach: "역방향은 막힘, 내면, 과잉.",
    win: "막힘의 네 장을 읽었습니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "8", accept: "str" },
      { id: "s1", label: "9", accept: "her" },
      { id: "s2", label: "10", accept: "whl" },
      { id: "s3", label: "11", accept: "jus" },
    ],
    chips: [
      { id: "a", text: "힘", target: "str", sub: "억압된 용기" },
      { id: "b", text: "은둔자", target: "her", sub: "고립과 침묵" },
      { id: "c", text: "바퀴", target: "whl", sub: "정체된 운행" },
      { id: "d", text: "정의", target: "jus", sub: "기울어진 저울" },
    ],
  },
  {
    title: "스프레드",
    coach: "자리가 시간의 문법. 과거-현재-미래.",
    win: "바보의 과거, 탑의 현재, 별의 미래.",
    sequential: true,
    slots: [
      { id: "s0", label: "과거", accept: "fool" },
      { id: "s1", label: "현재", accept: "tower" },
      { id: "s2", label: "미래", accept: "star" },
    ],
    chips: [
      { id: "a", text: "바보", target: "fool", sub: "출발이 과거" },
      { id: "b", text: "탑", target: "tower", sub: "지금의 붕괴" },
      { id: "c", text: "별", target: "star", sub: "회복의 미래" },
    ],
  },
  {
    title: "리딩",
    coach: "카드는 답이 아니라 질문의 거울.",
    win: "질문과 거울과 응답이 마주 봤습니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "질문", accept: "ask" },
      { id: "s1", label: "거울", accept: "mirror" },
      { id: "s2", label: "응답", accept: "ans" },
    ],
    chips: [
      { id: "a", text: "질문", target: "ask", sub: "무엇을 묻는가" },
      { id: "b", text: "거울", target: "mirror", sub: "카드는 거울" },
      { id: "c", text: "응답", target: "ans", sub: "읽기의 말" },
    ],
  },
  {
    title: "윤리",
    coach: "운명을 단정하지 않는다.",
    win: "조언과 질문만 자리에 남겼습니다.",
    sequential: false,
    slots: [
      { id: "s0", label: "조언", accept: "advice" },
      { id: "s1", label: "질문", accept: "ask" },
    ],
    chips: [
      { id: "a", text: "조언", target: "advice", sub: "할 수 있는 말" },
      { id: "b", text: "질문", target: "ask", sub: "열어 두는 말" },
      { id: "c", text: "운명", target: "fate", sub: "단정", trap: true },
    ],
  },
];

function pathPoint(u: number, w: number, headY: number, trayTop: number) {
  const x = 36 + u * (w - 72);
  const mid = (headY + trayTop) / 2;
  const amp = Math.max(28, (trayTop - headY) * 0.22);
  const y = mid + Math.sin(u * Math.PI) * amp;
  return { x, y };
}

function pathLayout(level: BoardLevel, w: number, _h: number, headY: number, trayTop: number): SlotBox[] {
  const n = level.slots.length;
  return level.slots.map((s, i) => {
    const u = n <= 1 ? 0.5 : i / (n - 1);
    const p = pathPoint(u, w, headY, trayTop);
    const bw = Math.max(44, Math.min(92, 20 + s.label.length * 12));
    const bh = 52;
    return { ...s, x: p.x - bw / 2, y: p.y - bh / 2, w: bw, h: bh };
  });
}

function playTarot(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  let walk = 0;
  return playBoard(canvas, hooks, {
    pal: CLAY,
    levels: TAROT,
    headY: 40,
    wrongMsg: (chip) => (chip.trap ? "운명을 단정하지 않습니다." : `${chip.text}는 그 자리가 아닙니다.`),
    layoutSlots: pathLayout,
    onLoad: () => {
      walk = 0;
    },
    drawExtra: (pass, ctx, _w, _h, dt, env) => {
      const pts = env.slots.map((s) => ({ x: s.x + s.w / 2, y: s.y + s.h / 2 }));
      if (pass === "back") {
        ctx.strokeStyle = env.pal.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        return;
      }
      const placed = env.slots.filter((s) => env.chips.some((c) => c.placed === s.id)).length;
      const target = Math.max(0, placed - 1);
      walk += (target - walk) * Math.min(1, dt * 4);
      const i0 = Math.max(0, Math.min(pts.length - 1, Math.floor(walk)));
      const i1 = Math.max(0, Math.min(pts.length - 1, i0 + 1));
      const u = walk - i0;
      const x = pts[i0].x + (pts[i1].x - pts[i0].x) * u;
      const y = pts[i0].y + (pts[i1].y - pts[i0].y) * u;
      ctx.fillStyle = env.pal.accent;
      ctx.beginPath();
      ctx.arc(x, y - 30, 5, 0, Math.PI * 2);
      ctx.fill();
    },
  });
}

/* ---------------- Religion · tradition path ---------------- */

const RELIGION: BoardLevel[] = [
  {
    title: "힌두",
    coach: "다르마·카르마·윤회.",
    win: "다르마가 카르마를 낳고 윤회로 이어집니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "1", accept: "dharma" },
      { id: "s1", label: "2", accept: "karma" },
      { id: "s2", label: "3", accept: "samsara" },
    ],
    chips: [
      { id: "a", text: "다르마", target: "dharma", sub: "도리" },
      { id: "b", text: "카르마", target: "karma", sub: "업" },
      { id: "c", text: "윤회", target: "samsara", sub: "되돎" },
    ],
  },
  {
    title: "유대",
    coach: "계약과 율법, 한 분의 신.",
    win: "계약이 율법을 열고 유일신으로 모입니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "1", accept: "covenant" },
      { id: "s1", label: "2", accept: "law" },
      { id: "s2", label: "3", accept: "one" },
    ],
    chips: [
      { id: "a", text: "계약", target: "covenant" },
      { id: "b", text: "율법", target: "law" },
      { id: "c", text: "유일신", target: "one" },
    ],
  },
  {
    title: "불교",
    coach: "계·정·혜. 고집멸도.",
    win: "괴로움에서 도에 이르는 네 진리.",
    sequential: true,
    slots: [
      { id: "s0", label: "1", accept: "dukkha" },
      { id: "s1", label: "2", accept: "sam" },
      { id: "s2", label: "3", accept: "nirodha" },
      { id: "s3", label: "4", accept: "marga" },
    ],
    chips: [
      { id: "a", text: "고", target: "dukkha", sub: "괴로움" },
      { id: "b", text: "집", target: "sam", sub: "일어남" },
      { id: "c", text: "멸", target: "nirodha", sub: "소멸" },
      { id: "d", text: "도", target: "marga", sub: "길" },
    ],
  },
  {
    title: "유교",
    coach: "인·의·예. 관계의 윤리.",
    win: "인이 의를 낳고 예로 드러납니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "1", accept: "ren" },
      { id: "s1", label: "2", accept: "yi" },
      { id: "s2", label: "3", accept: "li" },
    ],
    chips: [
      { id: "a", text: "인", target: "ren", sub: "사람다움" },
      { id: "b", text: "의", target: "yi", sub: "옳음" },
      { id: "c", text: "예", target: "li", sub: "형식" },
    ],
  },
  {
    title: "맹자",
    coach: "성선. 사단을 기른다.",
    win: "측은·수오·사양·시비. 네 싹.",
    sequential: true,
    slots: [
      { id: "s0", label: "1", accept: "ce" },
      { id: "s1", label: "2", accept: "su" },
      { id: "s2", label: "3", accept: "sa" },
      { id: "s3", label: "4", accept: "si" },
    ],
    chips: [
      { id: "a", text: "측은", target: "ce", sub: "인" },
      { id: "b", text: "수오", target: "su", sub: "의" },
      { id: "c", text: "사양", target: "sa", sub: "예" },
      { id: "d", text: "시비", target: "si", sub: "지" },
    ],
  },
  {
    title: "노자",
    coach: "무위. 억지로 하지 않는 다스림.",
    win: "도가 무위를 열고 자연으로 갑니다.",
    sequential: true,
    slots: [
      { id: "s0", label: "1", accept: "dao" },
      { id: "s1", label: "2", accept: "wu" },
      { id: "s2", label: "3", accept: "ziran" },
    ],
    chips: [
      { id: "a", text: "도", target: "dao", sub: "길" },
      { id: "b", text: "무위", target: "wu", sub: "억지 없음" },
      { id: "c", text: "자연", target: "ziran", sub: "스스로 그러함" },
    ],
  },
  {
    title: "장자",
    coach: "소요. 쓸모의 경계를 넘는다.",
    win: "소요에서 제물로, 양생으로.",
    sequential: true,
    slots: [
      { id: "s0", label: "1", accept: "xiao" },
      { id: "s1", label: "2", accept: "qi" },
      { id: "s2", label: "3", accept: "yang" },
    ],
    chips: [
      { id: "a", text: "소요", target: "xiao", sub: "거닐다" },
      { id: "b", text: "제물", target: "qi", sub: "가지런히" },
      { id: "c", text: "양생", target: "yang", sub: "삶을 기르다" },
    ],
  },
  {
    title: "그리스도",
    coach: "믿음과 은혜, 이웃 사랑.",
    win: "들음에서 믿음, 은혜, 사랑.",
    sequential: true,
    slots: [
      { id: "s0", label: "1", accept: "hear" },
      { id: "s1", label: "2", accept: "faith" },
      { id: "s2", label: "3", accept: "grace" },
      { id: "s3", label: "4", accept: "love" },
    ],
    chips: [
      { id: "a", text: "들음", target: "hear" },
      { id: "b", text: "믿음", target: "faith" },
      { id: "c", text: "은혜", target: "grace" },
      { id: "d", text: "사랑", target: "love" },
    ],
  },
  {
    title: "이슬람",
    coach: "다섯 기둥. 복종과 공동체.",
    win: "신앙고백에서 성지순례까지.",
    sequential: true,
    slots: [
      { id: "s0", label: "1", accept: "shahada" },
      { id: "s1", label: "2", accept: "salat" },
      { id: "s2", label: "3", accept: "zakat" },
      { id: "s3", label: "4", accept: "sawm" },
      { id: "s4", label: "5", accept: "hajj" },
    ],
    chips: [
      { id: "a", text: "신앙고백", target: "shahada" },
      { id: "b", text: "예배", target: "salat" },
      { id: "c", text: "자선", target: "zakat" },
      { id: "d", text: "단식", target: "sawm" },
      { id: "e", text: "성지순례", target: "hajj" },
    ],
  },
];

function playReligion(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  return playBoard(canvas, hooks, {
    pal: PAPER,
    levels: RELIGION,
    headY: 48,
    titleSize: 28,
    sideTray: true,
    wrongMsg: (chip, _slot, level) => {
      const idx = level.slots.findIndex((s) => s.accept === chip.target);
      return `${chip.text}는 ${NTH[idx] ?? ""} 걸음입니다.`;
    },
    layoutSlots: (L, w, h, headY, _trayTop) => {
      const n = L.slots.length;
      const gap = 8;
      const bh = Math.max(44, Math.min(64, (h - headY - 16 - gap * (n - 1)) / n));
      const bw = Math.max(44, w * 0.44);
      const total = n * bh + (n - 1) * gap;
      const y0 = headY + Math.max(0, (h - headY - 8 - total) / 2);
      return L.slots.map((s, i) => ({ ...s, x: 12, y: y0 + i * (bh + gap), w: bw, h: bh }));
    },
    drawExtra: (pass, ctx, _w, _h, _dt, env) => {
      if (pass !== "back") return;
      const boxes = env.slots;
      ctx.strokeStyle = env.filled ? env.pal.ok : env.pal.line;
      ctx.lineWidth = 2;
      for (let i = 0; i < boxes.length - 1; i++) {
        const a = boxes[i];
        const b = boxes[i + 1];
        ctx.beginPath();
        ctx.moveTo(a.x + 10, a.y + a.h);
        ctx.lineTo(b.x + 10, b.y);
        ctx.stroke();
      }
    },
  });
}

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  if (id === "writing") return playWriting(canvas, hooks);
  if (id === "harness") return playHarness(canvas, hooks);
  if (id === "tarot") return playTarot(canvas, hooks);
  if (id === "religion") return playReligion(canvas, hooks);
  return playEnglish(canvas, hooks);
}
