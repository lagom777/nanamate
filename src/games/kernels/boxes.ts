import { SLATE } from "@/lib/games/draw";
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
  type KnowApi,
  type KnowFrame,
} from "@/lib/games/know";

type Key = "c" | "p" | "b" | "m";
type BoxV = Record<Key, number>;

const GOALS: BoxV[] = [
  { c: 40, p: 8, b: 4, m: 16 },
  { c: 28, p: 20, b: 4, m: 12 },
  { c: 48, p: 12, b: 4, m: 16 },
  { c: 40, p: 24, b: 6, m: 12 },
  { c: 36, p: 16, b: 4, m: 14 },
  { c: 32, p: 12, b: 8, m: 16 },
  { c: 40, p: 12, b: 4, m: 8 },
  { c: 36, p: 10, b: 2, m: 12 },
  { c: 24, p: 8, b: 4, m: 8 },
];

const ROWS: { key: Key; name: string }[] = [
  { key: "c", name: "콘텐츠" },
  { key: "p", name: "패딩" },
  { key: "b", name: "보더" },
  { key: "m", name: "마진" },
];

let v: BoxV = { c: 56, p: 22, b: 14, m: 30 };
let drag: Key | null = null;
let dwell = 0;

function tot(b: BoxV) {
  return b.c + 2 * b.p + 2 * b.b + 2 * b.m;
}

function close(a: BoxV, b: BoxV) {
  return (
    Math.abs(a.c - b.c) <= 6 && Math.abs(a.p - b.p) <= 6 && Math.abs(a.b - b.b) <= 6 && Math.abs(a.m - b.m) <= 6
  );
}

function load(_api: KnowApi) {
  v = { c: 56, p: 22, b: 14, m: 30 };
  drag = null;
  dwell = 0;
}

function clampVal(n: number) {
  return Math.max(2, Math.min(80, n));
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "박스 모델", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 12, "left");

  const goal = GOALS[api.level] ?? GOALS[0];
  const sliderH = 44;
  const stack = 4 * sliderH + 8;
  const areaTop = 64;
  const areaBot = h - stack - 10;
  const areaH = Math.max(80, areaBot - areaTop);
  const unit = Math.min((w - 48) / Math.max(tot(v), tot(goal), 80), areaH / Math.max(tot(v), tot(goal), 80));
  const cx = w / 2;
  const cy = areaTop + areaH / 2;

  const drawBox = (b: BoxV, ghost: boolean) => {
    const outer = tot(b) * unit;
    const x = cx - outer / 2;
    const y = cy - outer / 2;
    const m = b.m * unit;
    const bd = b.b * unit;
    const pd = b.p * unit;
    const c = b.c * unit;
    if (ghost) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = pal.warn;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(x, y, outer, outer);
      ctx.restore();
      return;
    }
    fillRound(ctx, x, y, outer, outer, 6, "rgba(196,165,116,0.14)");
    label(ctx, "마진", x + 8, y + 10, pal.muted, 10, "left");
    fillRound(ctx, x + m, y + m, outer - 2 * m, outer - 2 * m, 5, "rgba(197,204,214,0.22)");
    label(ctx, "보더", x + m + 6, y + m + 10, pal.muted, 10, "left");
    fillRound(ctx, x + m + bd, y + m + bd, outer - 2 * m - 2 * bd, outer - 2 * m - 2 * bd, 5, "rgba(127,179,160,0.28)");
    label(ctx, "패딩", x + m + bd + 6, y + m + bd + 10, pal.muted, 10, "left");
    fillRound(ctx, x + m + bd + pd, y + m + bd + pd, c, c, 4, pal.accent);
    if (c > 28) label(ctx, "콘텐츠", cx, cy, pal.bg, 11, "center");
  };

  if (api.level === 6) {
    const vw = tot(goal) * unit + 18;
    strokeRound(ctx, cx - vw / 2, cy - vw / 2, vw, vw, 6, pal.warn, 1.4);
    label(ctx, "뷰포트", cx, cy - vw / 2 - 12, pal.warn, 11, "center");
  }

  drawBox(v, false);
  drawBox(goal, true);
  label(ctx, `${Math.round(tot(v))}  /  목표 ${Math.round(tot(goal))}`, cx, areaBot - 4, pal.muted, 11, "center");

  const tx = 92;
  const tw = w - 148;
  ROWS.forEach((row, i) => {
    const y = areaBot + 6 + i * sliderH;
    const hot = inRect(ptr.x, ptr.y, tx - 12, y, tw + 24, sliderH);
    if (justDown && hot && api.hold <= 0) drag = row.key;
    if (drag === row.key && ptr.down && api.hold <= 0) {
      const t = Math.max(0, Math.min(1, (ptr.x - tx) / tw));
      v[row.key] = clampVal(Math.round(2 + t * 78));
    }
    label(ctx, row.name, 16, y + sliderH / 2, pal.muted, 12, "left");
    fillRound(ctx, tx, y + sliderH / 2 - 4, tw, 8, 4, pal.line);
    const gx = tx + ((goal[row.key] - 2) / 78) * tw;
    ctx.fillStyle = "rgba(127,179,160,0.35)";
    ctx.fillRect(gx - 4, y + sliderH / 2 - 7, 8, 14);
    const kx = tx + ((v[row.key] - 2) / 78) * tw;
    ctx.beginPath();
    ctx.arc(kx, y + sliderH / 2, 12, 0, Math.PI * 2);
    ctx.fillStyle = drag === row.key || hot ? pal.accent : pal.fg;
    ctx.fill();
    label(ctx, String(v[row.key]), w - 16, y + sliderH / 2, pal.muted, 12, "right");
  });
  if (justUp) drag = null;

  if (api.hold <= 0 && close(v, goal)) {
    dwell += dt;
    if (dwell >= 1) {
      popAt(api, cx, cy, pal.ok, 14);
      api.succeed(api.teach || "content → padding → border → margin.");
    }
  } else dwell = 0;

  if (dwell > 0 && api.hold <= 0) {
    label(ctx, "맞음. 유지하세요", cx, areaTop + 8, pal.ok, 12, "center");
  }
  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.2, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("frontend", canvas, hooks, SLATE, { load, step });
}
