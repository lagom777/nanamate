import { CLAY } from "@/lib/games/draw";
import { display, fillRound, head, inRect, label, playKnow, popAt, scene, strokeRound, type KnowApi, type KnowFrame } from "@/lib/games/know";

type Chip = { id: string; text: string; kind: "stitch" | "poison"; order: number; x: number; y: number; placed: boolean };

const PROMPT = [
  "거짓말했다",
  "다시 들어가기",
  "아픈 곳을 말하기",
  "행위만 고친다",
  "그 자리의 규칙",
  "숨기지 않기",
  "행위와 존재를 가른다",
  "끊긴 상대에게",
  "다시 잇는 습관",
];

const TEACH = [
  "행위부터 잇는다. 죄책은 행위, 수치는 자기.",
  "추방되지 않으려는 신호. 수리는 복귀.",
  "아픈 곳을 말해야 실이 간다.",
  "거울은 존재 대신 행위만 고친다.",
  "그 자리의 규칙부터 인정한다.",
  "숨기면 구멍이 커진다. 드러내야 잇는다.",
  "행위와 존재를 가른 뒤에 바늘을 든다.",
  "끊긴 상대에게 인정부터.",
  "다시 잇는 습관이 유지를 만든다.",
];

const ORDER = ["인정", "듣기", "사과", "고침"];

let chips: Chip[] = [];
let drag: Chip | null = null;
let ox = 0;
let oy = 0;
let stitches = 0;
let hole = 0;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function load(_api: KnowApi) {
  const base: Chip[] = [
    ...ORDER.map((text, order) => ({ id: text, text, kind: "stitch" as const, order, x: 0, y: 0, placed: false })),
    { id: "숨김", text: "숨김", kind: "poison", order: -1, x: 0, y: 0, placed: false },
    { id: "변명", text: "변명", kind: "poison", order: -1, x: 0, y: 0, placed: false },
  ];
  chips = shuffle(base);
  drag = null;
  stitches = 0;
  hole = 0;
}

function face(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, pal: KnowApi["pal"], ok: boolean) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = pal.fill;
  ctx.fill();
  ctx.strokeStyle = ok ? pal.ok : pal.line;
  ctx.lineWidth = ok ? 2 : 1.2;
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = pal.fg;
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.12, 2.4, 0, Math.PI * 2);
  ctx.arc(x + r * 0.28, y - r * 0.12, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = pal.muted;
  ctx.arc(x, y + r * 0.12, r * 0.28, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function quad(t: number, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) {
  const u = 1 - t;
  return { x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * y0 + 2 * u * t * cy + t * t * y1 };
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  head(ctx, w, "찢어진 끈", api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 13, "left");
  display(ctx, PROMPT[api.level], w / 2, 68, api.pal.fg, 18, "center");

  const r = Math.max(28, Math.min(40, w * 0.08));
  const ly = h * 0.36;
  const lx = 28 + r;
  const rx = w - 28 - r;
  const cx = (lx + rx) / 2;
  const cy = ly + 36 + hole * 10;
  face(ctx, lx, ly, r, api.pal, stitches >= 4);
  face(ctx, rx, ly, r, api.pal, stitches >= 4);

  const tEnd = 0.12 + stitches * 0.22;
  ctx.strokeStyle = stitches >= 4 ? api.pal.ok : api.pal.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const t = (tEnd * i) / 24;
    const p = quad(t, lx + r, ly, cx, cy, rx - r, ly);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  const tStart = Math.max(tEnd, 0.88 - stitches * 0.08);
  ctx.beginPath();
  for (let i = 0; i <= 16; i++) {
    const t = tStart + ((1 - tStart) * i) / 16;
    const p = quad(t, lx + r, ly, cx, cy, rx - r, ly);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.lineWidth = 1;

  const mid = quad(0.5, lx + r, ly, cx, cy, rx - r, ly);
  const gap = 10 + hole * 14;
  if (stitches < 4) {
    ctx.strokeStyle = api.pal.bad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mid.x, mid.y, gap, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  const tw = Math.max(88, Math.min(140, w * 0.34));
  const th = 56;
  const tear = { x: mid.x - tw / 2, y: mid.y - th / 2, w: tw, h: th };
  strokeRound(ctx, tear.x, tear.y, tear.w, tear.h, 10, api.pal.line, 1);
  label(ctx, stitches >= 4 ? "이어짐" : "찢어진 곳", mid.x, mid.y + (stitches < 4 ? 18 : 0), api.pal.muted, 11, "center");

  const bin = { x: w - 78, y: h - 132, w: 62, h: 56 };
  fillRound(ctx, bin.x, bin.y, bin.w, bin.h, 8, api.pal.fill);
  strokeRound(ctx, bin.x, bin.y, bin.w, bin.h, 8, api.pal.bad, 1.2);
  label(ctx, "버림", bin.x + bin.w / 2, bin.y + bin.h / 2, api.pal.muted, 12, "center");

  const loose = chips.filter((c) => !c.placed);
  const gapC = 6;
  const cw = Math.max(52, Math.min(88, (w - 24 - (loose.length - 1) * gapC) / Math.max(1, loose.length)));
  const ch = 48;
  const tray = loose.length * cw + Math.max(0, loose.length - 1) * gapC;
  const tx = (w - tray) / 2;
  loose.forEach((c, i) => {
    if (drag !== c) {
      c.x = tx + i * (cw + gapC);
      c.y = h - 58;
    }
  });

  if (justDown && api.hold <= 0) {
    const hit = [...chips].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, cw, ch));
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
    const cxp = drag.x + cw / 2;
    const cyp = drag.y + ch / 2;
    const onTear = inRect(cxp, cyp, tear.x, tear.y, tear.w, tear.h);
    const onBin = inRect(cxp, cyp, bin.x, bin.y, bin.w, bin.h);
    if (onTear && drag.kind === "stitch") {
      if (drag.order === stitches) {
        drag.placed = true;
        stitches += 1;
        popAt(api, mid.x, mid.y, api.pal.ok, 10);
        api.setCoach(`${drag.text}. ${stitches} / 4`);
        if (stitches >= 4) api.succeed(TEACH[api.level]);
      } else api.miss(`순서는 ${ORDER.join(" → ")}.`);
    } else if (onTear && drag.kind === "poison") {
      hole = Math.min(4, hole + 1);
      api.miss("숨김과 변명은 구멍을 키운다. 버림으로.");
    } else if (onBin && drag.kind === "poison") {
      drag.placed = true;
      popAt(api, bin.x + bin.w / 2, bin.y + bin.h / 2, api.pal.warn, 8);
      api.setCoach(`${drag.text}을 버렸다.`);
    } else if (onBin && drag.kind === "stitch") {
      api.miss("그건 이을 바늘입니다.");
    }
    drag = null;
  }

  for (const c of chips) {
    if (c.placed) continue;
    const poison = c.kind === "poison";
    fillRound(ctx, c.x, c.y, cw, ch, 10, drag === c ? (poison ? api.pal.bad : api.pal.accent) : api.pal.fill);
    strokeRound(ctx, c.x, c.y, cw, ch, 10, poison ? api.pal.bad : api.pal.line, 1.2);
    label(ctx, c.text, c.x + cw / 2, c.y + ch / 2, drag === c ? api.pal.bg : api.pal.fg, 13, "center");
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.2, api.pal.ok, 15, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("shame", canvas, hooks, CLAY, { load, step });
}
