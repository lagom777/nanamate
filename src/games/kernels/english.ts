import { PAPER } from "@/lib/games/draw";
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
} from "@/lib/games/know";

type Word = {
  text: string;
  role: string;
  placed: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Pack = {
  words: { text: string; role: string }[];
  slots: string[];
  hint: string;
  win: string;
};

const NAME: Record<string, string> = { S: "주어", V: "동사", O: "목적어", M: "수식" };

const LV: Pack[] = [
  {
    words: [
      { text: "She", role: "S" },
      { text: "reads", role: "V" },
      { text: "novels", role: "O" },
    ],
    slots: ["S", "V", "O"],
    hint: "",
    win: "주어 다음에 동사, 그다음 목적어.",
  },
  {
    words: [
      { text: "The team", role: "S" },
      { text: "won", role: "V" },
      { text: "the match", role: "O" },
    ],
    slots: ["S", "V", "O"],
    hint: "",
    win: "The team won the match. 자리가 뜻이다.",
  },
  {
    words: [
      { text: "I", role: "S" },
      { text: "sent", role: "V" },
      { text: "the mail", role: "O" },
    ],
    slots: ["S", "V", "O"],
    hint: "어제",
    win: "어제는 과거. sent.",
  },
  {
    words: [
      { text: "They", role: "S" },
      { text: "are holding", role: "V" },
      { text: "a meeting", role: "O" },
    ],
    slots: ["S", "V", "O"],
    hint: "지금",
    win: "지금이면 진행형. are holding.",
  },
  {
    words: [
      { text: "We", role: "S" },
      { text: "will finish", role: "V" },
      { text: "the report", role: "O" },
    ],
    slots: ["S", "V", "O"],
    hint: "내일까지",
    win: "미래는 will finish.",
  },
  {
    words: [
      { text: "Would you", role: "S" },
      { text: "send", role: "V" },
      { text: "the file", role: "O" },
    ],
    slots: ["S", "V", "O"],
    hint: "공손",
    win: "Would you가 주어 자리에 앉는다.",
  },
  {
    words: [
      { text: "The committee", role: "S" },
      { text: "has delayed", role: "V" },
      { text: "the vote", role: "O" },
    ],
    slots: ["S", "V", "O"],
    hint: "",
    win: "주어는 committee. 동사는 has delayed.",
  },
  {
    words: [
      { text: "One idea", role: "S" },
      { text: "needs", role: "V" },
      { text: "one sentence", role: "O" },
    ],
    slots: ["S", "V", "O"],
    hint: "",
    win: "한 생각, 한 문장.",
  },
  {
    words: [
      { text: "Markets", role: "S" },
      { text: "fell", role: "V" },
      { text: "yesterday", role: "M" },
    ],
    slots: ["S", "V", "M"],
    hint: "",
    win: "yesterday는 수식 M.",
  },
];

let pack: Pack = LV[0]!;
let words: Word[] = [];
let drag: Word | null = null;
let ox = 0;
let oy = 0;

function mix<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

function load(api: KnowApi) {
  pack = LV[api.level] ?? LV[0]!;
  words = mix(pack.words).map((w) => ({
    ...w,
    placed: null,
    x: 0,
    y: 0,
    w: 96,
    h: 48,
  }));
  drag = null;
}

function occupier(id: string) {
  return words.find((w) => w.placed === id);
}

function fit(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, color: string, size: number, maxW: number) {
  ctx.font = `500 ${size}px Pretendard, 'Pretendard Variable', sans-serif`;
  const rows = wrapText(ctx, text, maxW);
  const lh = size + 3;
  const start = cy - ((rows.length - 1) * lh) / 2;
  rows.forEach((ln, i) => label(ctx, ln, cx, start + i * lh, color, size, "center"));
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "문장 조립", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 13, "left");

  const loose = words.filter((c) => !c.placed);
  const n = Math.max(1, loose.length);
  const gap = 8;
  const cw = Math.max(88, Math.min(148, (w - 24 - (n - 1) * gap) / n));
  const total = n * cw + (n - 1) * gap;
  const tx = (w - total) / 2;
  loose.forEach((c, i) => {
    c.w = cw;
    c.h = 48;
    if (drag !== c) {
      c.x = tx + i * (cw + gap);
      c.y = h - 58;
    }
  });

  const sn = pack.slots.length;
  const sg = 10;
  const sw = Math.min(150, (w - 32 - (sn - 1) * sg) / sn);
  const sh = 78;
  const sx0 = (w - (sn * sw + (sn - 1) * sg)) / 2;
  const sy = h * 0.38;
  const slots = pack.slots.map((id, i) => ({
    id,
    x: sx0 + i * (sw + sg),
    y: sy,
    w: sw,
    h: sh,
  }));

  const built = pack.slots.map((id) => occupier(id)?.text ?? "—").join("  ");
  display(ctx, built, w / 2, sy - 36, pal.fg, 16, "center");
  if (pack.hint) label(ctx, pack.hint, w / 2, sy - 16, pal.muted, 12, "center");

  if (justDown && api.hold <= 0) {
    const hit = [...words].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
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
    const cx = drag.x + drag.w / 2;
    const cy = drag.y + drag.h / 2;
    const box = slots.find((s) => inRect(cx, cy, s.x, s.y, s.w, s.h));
    if (box) {
      if (occupier(box.id)) {
        api.miss("이미 채워진 칸입니다.");
      } else if (drag.role === box.id) {
        drag.placed = box.id;
        popAt(api, box.x + box.w / 2, box.y + box.h / 2, pal.ok, 10);
        api.setCoach(`${NAME[box.id] ?? box.id} — ${drag.text}`);
        if (pack.slots.every((id) => occupier(id))) api.succeed(pack.win);
      } else {
        api.miss("자리가 뜻을 만듭니다. 그 칸이 아닙니다.");
      }
    }
    drag = null;
  }

  for (const s of slots) {
    const put = occupier(s.id);
    fillRound(ctx, s.x, s.y, s.w, s.h, 10, pal.fill);
    strokeRound(ctx, s.x, s.y, s.w, s.h, 10, put ? pal.ok : pal.line, put ? 2 : 1);
    label(ctx, s.id, s.x + s.w / 2, s.y + 16, pal.muted, 12, "center");
    label(ctx, NAME[s.id] ?? "", s.x + s.w / 2, s.y + 32, pal.muted, 11, "center");
    if (put) fit(ctx, put.text, s.x + s.w / 2, s.y + s.h - 22, pal.fg, 13, s.w - 12);
  }

  for (const c of words) {
    if (c.placed) continue;
    const hot = drag === c;
    fillRound(ctx, c.x, c.y, c.w, c.h, 10, hot ? pal.accent : pal.fill);
    strokeRound(ctx, c.x, c.y, c.w, c.h, 10, hot ? pal.accent : pal.line, hot ? 2 : 1);
    fit(ctx, c.text, c.x + c.w / 2, c.y + c.h / 2, hot ? pal.bg : pal.fg, 13, c.w - 10);
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.2, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("english", canvas, hooks, PAPER, { load, step });
}
