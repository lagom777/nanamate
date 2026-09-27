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

type Chip = { name: string; x: number; y: number; placed: string | null };
type Slot = { id: string; name: string; x: number; y: number; w: number; h: number };
type Dot = { u: number; leak: number; lx: number; ly: number; vx: number; vy: number };
type Extra = "none" | "tool" | "note" | "fail";
type Lv = { missing: string[]; tray: string[]; extra: Extra; fast?: boolean; msg: string };

const RING = ["계획", "실행", "관찰", "검증"];

const LV: Lv[] = [
  { missing: ["검증"], tray: ["계획", "실행", "관찰", "검증", "명상"], extra: "none", msg: "검증이 루프를 닫는다." },
  { missing: ["실행"], tray: ["계획", "실행", "관찰", "검증", "명상"], extra: "none", msg: "실행이 빠져 루프가 샜다." },
  { missing: ["관찰"], tray: ["계획", "실행", "관찰", "검증", "명상"], extra: "none", msg: "관찰이 있어야 다음이 온다." },
  { missing: [], tray: ["도구", "명상"], extra: "tool", msg: "도구를 실행 옆에 붙인다." },
  { missing: [], tray: ["밖에 적기", "명상"], extra: "note", msg: "창 밖 메모가 하네스다." },
  { missing: ["검증"], tray: ["검증", "명상"], extra: "none", fast: true, msg: "검증이 마지막 게이트다." },
  { missing: ["관찰", "검증"], tray: ["관찰", "검증", "명상"], extra: "none", msg: "두 칸을 모두 메워야 한다." },
  { missing: [], tray: ["밖에 적기", "명상"], extra: "note", msg: "긴 작업은 밖에 적는다." },
  { missing: ["검증"], tray: ["검증", "명상"], extra: "fail", msg: "같은 실수를 고친 뒤 다시 돈다." },
];

let missing: string[] = [];
let chips: Chip[] = [];
let extra: Extra = "none";
let fast = false;
let msg = "";
let sealed: Record<string, string> = {};
let drag: Chip | null = null;
let ox = 0;
let oy = 0;
let dots: Dot[] = [];
let spawn = 0;
let failOn = false;
let phase = 0;

function load(api: KnowApi) {
  const L = LV[api.level];
  missing = L.missing.slice();
  extra = L.extra;
  fast = Boolean(L.fast);
  msg = L.msg;
  chips = L.tray.map((name) => ({ name, x: 0, y: 0, placed: null }));
  sealed = {};
  drag = null;
  ox = 0;
  oy = 0;
  dots = [];
  spawn = 0;
  failOn = false;
  phase = 0;
}

function ringAt(cx: number, cy: number, R: number, i: number) {
  const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
  return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, a };
}

function openGaps() {
  return missing.filter((m) => !sealed[m]);
}

function ready() {
  if (missing.some((m) => !sealed[m])) return false;
  if (extra === "tool" && !sealed.tool) return false;
  if (extra === "note" && !sealed.note) return false;
  if (extra === "fail" && !sealed.fix) return false;
  return true;
}

function accept(slot: Slot, name: string) {
  if (slot.id === "tool") return name === "도구";
  if (slot.id === "note") return name === "밖에 적기";
  if (slot.id === "fix") return name === "고치기";
  return name === slot.name;
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "루프를 닫아라", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 13, "left");

  const cx = w / 2;
  const cy = h * 0.44;
  const bw = Math.max(64, Math.min(78, w * 0.2));
  const bh = 48;
  const R = Math.max(78, Math.min(w * 0.32, (h - 160) * 0.36));
  const slots: Slot[] = [];

  RING.forEach((name, i) => {
    const p = ringAt(cx, cy, R, i);
    const gap = missing.includes(name) && !sealed[name];
    const x = p.x - bw / 2;
    const y = p.y - bh / 2;
    if (gap) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      strokeRound(ctx, x, y, bw, bh, 8, pal.bad, 1.5);
      ctx.restore();
      label(ctx, name, p.x, p.y, pal.muted, 12, "center");
      slots.push({ id: name, name, x, y, w: bw, h: bh });
    } else {
      fillRound(ctx, x, y, bw, bh, 8, pal.fill);
      strokeRound(ctx, x, y, bw, bh, 8, sealed[name] ? pal.ok : pal.line, sealed[name] ? 1.8 : 1.3);
      label(ctx, name, p.x, p.y, pal.fg, 13, "center");
    }
  });

  if (extra === "tool") {
    const p = ringAt(cx, cy, R, 1);
    const x = p.x + bw / 2 + 8;
    const y = p.y - bh / 2;
    const on = Boolean(sealed.tool);
    if (!on) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      strokeRound(ctx, x, y, bw, bh, 8, pal.accent, 1.4);
      ctx.restore();
      label(ctx, "도구", x + bw / 2, y + bh / 2, pal.muted, 11, "center");
    } else {
      fillRound(ctx, x, y, bw, bh, 8, pal.fill);
      strokeRound(ctx, x, y, bw, bh, 8, pal.ok, 1.8);
      label(ctx, "도구", x + bw / 2, y + bh / 2, pal.fg, 13, "center");
    }
    slots.push({ id: "tool", name: "도구", x, y, w: bw, h: bh });
  }

  if (extra === "note") {
    const nw = Math.min(120, w * 0.28);
    const nh = 88;
    const x = w - 16 - nw;
    const y = 86;
    const on = Boolean(sealed.note);
    fillRound(ctx, x, y, nw, nh, 8, pal.fill);
    strokeRound(ctx, x, y, nw, nh, 8, on ? pal.ok : pal.line, on ? 1.8 : 1.3);
    label(ctx, "노트", x + nw / 2, y + 16, pal.muted, 11, "center");
    if (on) {
      for (let i = 0; i < 4; i++) fillRound(ctx, x + 12, y + 32 + i * 12, nw - 24, 5, 2, pal.accent);
    } else label(ctx, "밖에 적기", x + nw / 2, y + nh / 2 + 8, pal.muted, 11, "center");
    slots.push({ id: "note", name: "밖에 적기", x, y, w: nw, h: nh });
  }

  if (extra === "fail" && failOn) {
    const fx = cx + 18;
    const fy = cy + 8;
    fillRound(ctx, fx - 28, fy - 22, 56, 44, 8, pal.fill);
    strokeRound(ctx, fx - 28, fy - 22, 56, 44, 8, sealed.fix ? pal.ok : pal.bad, 1.8);
    label(ctx, sealed.fix ? "고침" : "실패", fx, fy, sealed.fix ? pal.ok : pal.bad, 12, "center");
    if (!sealed.fix) slots.push({ id: "fix", name: "고치기", x: fx - 28, y: fy - 22, w: 56, h: 44 });
  }

  const gaps = openGaps();
  const closed = gaps.length === 0;
  ctx.save();
  ctx.strokeStyle = closed ? pal.ok : pal.line;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  if (gaps.length) {
    ctx.strokeStyle = pal.bad;
    ctx.setLineDash([5, 4]);
    for (const g of gaps) {
      const i = RING.indexOf(g);
      const a0 = -Math.PI / 2 + ((i - 0.18) / 4) * Math.PI * 2;
      const a1 = -Math.PI / 2 + ((i + 0.18) / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, a1);
      ctx.stroke();
    }
  }
  ctx.restore();

  spawn -= dt;
  if (spawn <= 0) {
    dots.push({ u: 0, leak: 0, lx: 0, ly: 0, vx: 0, vy: 0 });
    spawn = fast ? 0.16 : 0.38;
  }
  const speed = fast ? 0.42 : 0.22;
  for (const d of dots) {
    if (d.leak > 0) {
      d.leak -= dt;
      d.lx += d.vx * dt;
      d.ly += d.vy * dt;
      if (d.leak <= 0) {
        d.leak = -1;
        continue;
      }
      ctx.beginPath();
      ctx.arc(d.lx, d.ly, 4, 0, Math.PI * 2);
      ctx.fillStyle = pal.bad;
      ctx.globalAlpha = d.leak;
      ctx.fill();
      ctx.globalAlpha = 1;
      continue;
    }
    d.u += dt * speed;
    if (d.u >= 1) d.u -= 1;
    const ang = -Math.PI / 2 + d.u * Math.PI * 2;
    const px = cx + Math.cos(ang) * R;
    const py = cy + Math.sin(ang) * R;
    let leaking = false;
    for (const g of gaps) {
      const gi = RING.indexOf(g);
      const gu = gi / 4;
      const du = Math.min(Math.abs(d.u - gu), 1 - Math.abs(d.u - gu));
      if (du < 0.055) {
        d.leak = 0.7;
        d.lx = px;
        d.ly = py;
        d.vx = Math.cos(ang) * 90;
        d.vy = Math.sin(ang) * 90;
        leaking = true;
      }
    }
    if (!leaking) {
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = closed ? pal.ok : pal.accent;
      ctx.fill();
    }
  }
  dots = dots.filter((d) => d.leak >= 0);
  if (dots.length > 14) dots.splice(0, dots.length - 14);

  const loose = chips.filter((c) => !c.placed);
  const n = Math.max(1, loose.length);
  const gap = 8;
  const cw = Math.max(52, Math.min(110, (w - 24 - (n - 1) * gap) / n));
  const total = loose.length * cw + Math.max(0, loose.length - 1) * gap;
  const tx = (w - total) / 2;
  loose.forEach((c, i) => {
    if (drag !== c) {
      c.x = tx + i * (cw + gap);
      c.y = h - 58;
    }
  });

  if (justDown && api.hold <= 0) {
    const hit = [...chips].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, cw, 48));
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
    const slot = slots.find((s) => inRect(drag!.x + cw / 2, drag!.y + 24, s.x, s.y, s.w, s.h));
    if (slot) {
      if (accept(slot, drag.name)) {
        drag.placed = slot.id;
        sealed[slot.id] = drag.name;
        popAt(api, slot.x + slot.w / 2, slot.y + slot.h / 2, pal.ok, 10);
        if (extra === "fail" && slot.id !== "fix" && phase === 0 && missing.every((m) => sealed[m])) {
          phase = 1;
          failOn = true;
          chips.push({ name: "고치기", x: 0, y: 0, placed: null });
          api.setCoach("실패가 났다. 고치기를 루프에 올리세요.");
        } else if (ready()) api.succeed(msg);
        else api.setCoach("남은 칸을 메우세요.");
      } else api.miss("그 칸이 아닙니다.");
    }
    drag = null;
  }

  for (const c of chips) {
    if (c.placed) continue;
    fillRound(ctx, c.x, c.y, cw, 48, 10, drag === c ? pal.accent : pal.fill);
    strokeRound(ctx, c.x, c.y, cw, 48, 10, drag === c ? pal.accent : pal.line, drag === c ? 1.8 : 1);
    label(ctx, c.name, c.x + cw / 2, c.y + 24, drag === c ? pal.bg : pal.fg, 13, "center");
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.18, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("harness", canvas, hooks, SLATE, { load, step });
}
