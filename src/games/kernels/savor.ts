import { INK } from "@/lib/games/draw";
import {
  display,
  fillRound,
  head,
  label,
  playKnow,
  popAt,
  scene,
  type KnowApi,
  type KnowFrame,
} from "@/lib/games/know";

type Ember = { x: number; y: number; vx: number; vy: number; hot: boolean; r: number };

const NEED = 3;
const HOT_N = [0, 0, 1, 1, 1, 2, 2, 3, 3];

let heat = 0.2;
let dwell = 0;
let entered = false;
let clock = 0;
let embers: Ember[] = [];
let drag: Ember | null = null;
let ox = 0;
let oy = 0;
let ready = false;

function band(level: number) {
  return { lo: 0.35 + level * 0.012, hi: 0.75 - level * 0.02 };
}

function rates(level: number) {
  return {
    ambient: 0.022 + level * 0.006,
    hold: 0.15 + level * 0.013,
    cool: 0.1 + level * 0.004,
  };
}

function load(_api: KnowApi) {
  heat = 0.2;
  dwell = 0;
  entered = false;
  clock = 0;
  embers = [];
  drag = null;
  ready = false;
}

function makeEmber(w: number, h: number, hot: boolean): Ember {
  const side = Math.floor(Math.random() * 4);
  const speed = 28 + Math.random() * 22;
  const r = 22;
  if (side === 0) return { x: -20, y: 80 + Math.random() * (h - 140), vx: speed, vy: (Math.random() - 0.5) * 16, hot, r };
  if (side === 1) return { x: w + 20, y: 80 + Math.random() * (h - 140), vx: -speed, vy: (Math.random() - 0.5) * 16, hot, r };
  if (side === 2) return { x: 40 + Math.random() * (w - 80), y: 50, vx: (Math.random() - 0.5) * 16, vy: speed, hot, r };
  return { x: 40 + Math.random() * (w - 80), y: h - 30, vx: (Math.random() - 0.5) * 16, vy: -speed, hot, r };
}

function coalAt(w: number, h: number) {
  return { cx: w / 2, cy: h * 0.44, r: Math.max(36, Math.min(w, h) * 0.13) };
}

function hitEmber(px: number, py: number, e: Ember) {
  return Math.hypot(px - e.x, py - e.y) <= e.r;
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "불씨 모으기", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 12, "left");

  if (!ready) {
    const nHot = HOT_N[api.level] ?? 0;
    embers = [];
    for (let i = 0; i < 3; i++) embers.push(makeEmber(w, h, false));
    for (let i = 0; i < nHot; i++) embers.push(makeEmber(w, h, true));
    ready = true;
  }

  const coal = coalAt(w, h);
  const { lo, hi } = band(api.level);
  const r = rates(api.level);

  if (justDown && api.hold <= 0) {
    const hit = [...embers].reverse().find((e) => hitEmber(ptr.x, ptr.y, e));
    if (hit) {
      drag = hit;
      ox = ptr.x - hit.x;
      oy = ptr.y - hit.y;
    }
  }
  if (drag && ptr.down) {
    drag.x = ptr.x - ox;
    drag.y = ptr.y - oy;
  }
  const holding = !drag && ptr.down && api.hold <= 0 && Math.hypot(ptr.x - coal.cx, ptr.y - coal.cy) <= coal.r;

  if (api.hold <= 0) {
    if (holding) heat += r.hold * dt;
    else heat -= r.cool * dt;
    heat += r.ambient * dt;
    heat = Math.max(0, Math.min(1, heat));
    clock += dt;
    if (heat >= lo && heat <= hi) {
      entered = true;
      dwell += dt;
      if (dwell >= NEED) {
        popAt(api, coal.cx, coal.cy, pal.ok, 16);
        api.succeed(api.teach || "지속은 강도가 아니라 회복의 리듬.");
      }
    } else dwell = 0;
    if (heat > 0.92) {
      api.miss("과열");
      load(api);
    } else if (!entered && clock > 8) {
      api.miss("불씨가 식었습니다. 따뜻한 띠에 머무르세요.");
      load(api);
    }
  }

  if (justUp && drag) {
    if (Math.hypot(drag.x - coal.cx, drag.y - coal.cy) < coal.r + 10) {
      if (drag.hot) {
        api.miss("과열은 흘리세요.");
      } else {
        heat = Math.min(1, heat + 0.08);
        popAt(api, coal.cx, coal.cy, pal.warn, 10);
        api.setCoach("온기를 보탰습니다. 과열 전에 손을 떼세요.");
      }
      const hot = drag.hot;
      const next = makeEmber(w, h, hot);
      drag.x = next.x;
      drag.y = next.y;
      drag.vx = next.vx;
      drag.vy = next.vy;
    }
    drag = null;
  }

  for (const e of embers) {
    if (drag === e) continue;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    if (e.x < -36 || e.x > w + 36 || e.y < 36 || e.y > h + 36) {
      const n = makeEmber(w, h, e.hot);
      e.x = n.x;
      e.y = n.y;
      e.vx = n.vx;
      e.vy = n.vy;
    }
  }

  const glow = 0.18 + heat * 0.62;
  ctx.beginPath();
  ctx.arc(coal.cx, coal.cy, coal.r + 22, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(196,165,116,${0.06 + heat * 0.14})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(coal.cx, coal.cy, coal.r, 0, Math.PI * 2);
  ctx.fillStyle = heat > 0.88 ? `rgba(196,122,114,${glow})` : `rgba(196,165,116,${glow})`;
  ctx.fill();
  ctx.strokeStyle = heat >= lo && heat <= hi ? pal.ok : heat > 0.88 ? pal.bad : pal.line;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 1;
  display(ctx, holding ? "음미" : "불씨", coal.cx, coal.cy, pal.fg, 16, "center");

  ctx.beginPath();
  ctx.arc(coal.cx, coal.cy, coal.r + 16, -Math.PI / 2, -Math.PI / 2 + (Math.min(1, dwell / NEED) * Math.PI * 2));
  ctx.strokeStyle = pal.ok;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.lineWidth = 1;

  const mx = w - 28;
  const my = 72;
  const mh = Math.max(120, h * 0.38);
  fillRound(ctx, mx - 8, my, 16, mh, 8, pal.fill);
  const by0 = my + mh * (1 - hi);
  const by1 = my + mh * (1 - lo);
  ctx.fillStyle = "rgba(143,191,154,0.28)";
  ctx.fillRect(mx - 8, by0, 16, by1 - by0);
  const hy = my + mh * (1 - heat);
  ctx.beginPath();
  ctx.arc(mx, hy, 8, 0, Math.PI * 2);
  ctx.fillStyle = heat > 0.88 ? pal.bad : heat >= lo && heat <= hi ? pal.ok : pal.warn;
  ctx.fill();
  label(ctx, "열", mx, my - 12, pal.muted, 11, "center");

  for (const e of embers) {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fillStyle = e.hot ? pal.bad : pal.warn;
    ctx.globalAlpha = drag === e ? 1 : 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
    label(ctx, e.hot ? "과열" : "온기", e.x, e.y, pal.bg, 11, "center");
  }

  label(ctx, entered ? `띠 ${dwell.toFixed(1)} / ${NEED}` : "따뜻한 띠에 머무르세요", w / 2, h - 20, pal.muted, 12, "center");
  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.18, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("joy", canvas, hooks, INK, { load, step });
}
