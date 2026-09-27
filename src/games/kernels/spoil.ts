import { INK } from "@/lib/games/draw";
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

type Kind = "fresh" | "spoil" | "person";
type Dot = {
  name: string;
  kind: Kind;
  ang: number;
  rad: number;
  x: number;
  y: number;
  stain: number;
  gone: boolean;
};

const FRESH = ["밥", "국", "나물", "생선", "과일", "김치", "계란", "두부"];
const DOT_R = 22;
const N_SPOIL = [2, 3, 3, 4, 4, 5, 5, 6, 4];
const N_FRESH = [4, 3, 4, 3, 3, 3, 3, 2, 3];

let dots: Dot[] = [];
let drag: Dot | null = null;
let ox = 0;
let oy = 0;
let rate = 10;

function load(api: KnowApi) {
  const L = api.level;
  const ns = N_SPOIL[L] ?? 2;
  const nf = N_FRESH[L] ?? 4;
  const n = ns + nf;
  dots = [];
  for (let i = 0; i < n; i++) {
    const spoil = i < ns;
    dots.push({
      name: spoil ? "상함" : FRESH[i - ns] ?? "음식",
      kind: spoil ? "spoil" : "fresh",
      ang: (i / n) * Math.PI * 2 + 0.35,
      rad: 0.36 + (i % 2) * 0.16,
      x: 0,
      y: 0,
      stain: spoil ? DOT_R : 0,
      gone: false,
    });
  }
  if (L === 8) {
    dots.push({
      name: "사람",
      kind: "person",
      ang: 0,
      rad: 0,
      x: 0,
      y: 0,
      stain: 0,
      gone: false,
    });
  }
  drag = null;
  rate = 9 + L * 4.2;
}

function plate(w: number, h: number) {
  const cx = w / 2;
  const cy = h * 0.46;
  const rx = Math.min(w * 0.38, h * 0.28);
  const ry = rx * 0.78;
  return { cx, cy, rx, ry };
}

function trashBox(w: number, h: number) {
  return { x: w - 86, y: h - 86, w: 70, h: 70 };
}

function seat(w: number, h: number) {
  const { cx, cy, rx, ry } = plate(w, h);
  for (const d of dots) {
    if (drag === d || d.gone) continue;
    if (d.kind === "person") {
      d.x = Math.max(DOT_R + 8, cx - rx - 40);
      d.y = cy + 8;
    } else {
      d.x = cx + Math.cos(d.ang) * rx * d.rad;
      d.y = cy + Math.sin(d.ang) * ry * d.rad;
    }
  }
}

function hitDot(px: number, py: number, d: Dot) {
  return Math.hypot(px - d.x, py - d.y) <= DOT_R;
}

function win(api: KnowApi) {
  const spoil = dots.filter((d) => !d.gone && d.kind === "spoil");
  const fresh = dots.filter((d) => !d.gone && d.kind === "fresh");
  if (spoil.length === 0 && fresh.length > 0) {
    api.succeed(api.teach || "상한 것은 거르고, 경계는 남긴다.");
  }
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "상한 것", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 12, "left");

  const p = plate(w, h);
  const bin = trashBox(w, h);
  seat(w, h);

  if (justDown && api.hold <= 0) {
    const hit = [...dots].reverse().find((d) => !d.gone && hitDot(ptr.x, ptr.y, d));
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
  if (justUp && drag) {
    const over = inRect(drag.x, drag.y, bin.x, bin.y, bin.w, bin.h);
    if (over) {
      if (drag.kind === "person") {
        api.miss("혐오는 음식이 아니라 경계를 지키는 일");
      } else if (drag.kind === "fresh") {
        api.miss("신선한 것은 접시에 남깁니다.");
      } else {
        drag.gone = true;
        popAt(api, bin.x + bin.w / 2, bin.y + bin.h / 2, pal.ok, 12);
        api.setCoach("상한 것은 밖으로. 오염 회피.");
        win(api);
      }
    }
    drag = null;
  }

  if (api.hold <= 0) {
    for (const d of dots) {
      if (d.gone || d.kind !== "spoil" || drag === d) continue;
      d.stain = Math.min(d.stain + rate * dt, Math.max(p.rx, p.ry) * 1.15);
    }
    for (const s of dots) {
      if (s.gone || s.kind !== "spoil" || drag === s) continue;
      for (const o of dots) {
        if (o.gone || o.kind !== "fresh") continue;
        if (Math.hypot(o.x - s.x, o.y - s.y) < s.stain) {
          o.kind = "spoil";
          o.name = "상함";
          o.stain = DOT_R;
          api.setCoach("상한 것이 옆을 오염시킵니다. 거리를 두세요.");
        }
      }
    }
    const freshN = dots.filter((d) => !d.gone && d.kind === "fresh").length;
    const spoilN = dots.filter((d) => !d.gone && d.kind === "spoil").length;
    const covered = dots.some((d) => !d.gone && d.kind === "spoil" && d.stain >= Math.min(p.rx, p.ry) * 0.98);
    if (spoilN > 0 && (freshN === 0 || covered)) {
      api.miss("오염이 접시를 덮었습니다. 상한 것을 먼저 거르세요.");
      load(api);
    }
  }

  ctx.beginPath();
  ctx.ellipse(p.cx, p.cy, p.rx, p.ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(196,165,116,0.08)";
  ctx.fill();
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.lineWidth = 1;
  label(ctx, "접시", p.cx, p.cy + p.ry + 16, pal.muted, 11, "center");

  for (const d of dots) {
    if (d.gone || d.kind !== "spoil") continue;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.stain, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(90, 86, 40, 0.16)";
    ctx.fill();
  }

  fillRound(ctx, bin.x, bin.y, bin.w, bin.h, 10, pal.fill);
  strokeRound(ctx, bin.x, bin.y, bin.w, bin.h, 10, pal.line, 1.3);
  ctx.beginPath();
  ctx.moveTo(bin.x + 10, bin.y + 16);
  ctx.lineTo(bin.x + bin.w - 10, bin.y + 16);
  ctx.strokeStyle = pal.muted;
  ctx.stroke();
  label(ctx, "쓰레기", bin.x + bin.w / 2, bin.y + bin.h / 2 + 8, pal.muted, 12, "center");

  for (const d of dots) {
    if (d.gone) continue;
    const warm = d.kind === "fresh";
    const person = d.kind === "person";
    const fill = person ? pal.accent : warm ? "#c4a574" : d.stain > DOT_R + 18 ? "#5a4630" : "#6a6b3a";
    ctx.beginPath();
    ctx.arc(d.x, d.y, DOT_R, 0, Math.PI * 2);
    ctx.fillStyle = drag === d ? pal.accent : fill;
    ctx.fill();
    ctx.strokeStyle = person ? pal.fg : warm ? pal.warn : pal.bad;
    ctx.lineWidth = person ? 1.8 : 1.2;
    ctx.stroke();
    ctx.lineWidth = 1;
    label(ctx, d.name, d.x, d.y, drag === d || person ? pal.bg : pal.fg, 11, "center");
  }

  const left = dots.filter((d) => !d.gone && d.kind === "spoil").length;
  label(ctx, `상함 ${left}`, 16, h - 18, pal.muted, 12, "left");
  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.2, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("disgust", canvas, hooks, INK, { load, step });
}
