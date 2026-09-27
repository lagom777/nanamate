import { CLAY } from "@/lib/games/draw";
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

type Kind = "sofa" | "desk" | "plant" | "water";
type Piece = {
  name: string;
  kind: Kind;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
  x: number;
  y: number;
  w: number;
  h: number;
};
type Dust = { x: number; y: number; vx: number; vy: number; life: number; pooled: boolean };

let pieces: Piece[] = [];
let dust: Dust[] = [];
let drag: Piece | null = null;
let ox = 0;
let oy = 0;
let poolT = 0;
let flowT = 0;
let spawnAcc = 0;

function item(name: string, kind: Kind, nx: number, ny: number, nw: number, nh: number): Piece {
  return { name, kind, nx, ny, nw, nh, x: 0, y: 0, w: 0, h: 0 };
}

function sofa(nx: number, ny: number) {
  return item("소파", "sofa", nx, ny, 0.34, 0.16);
}
function desk(nx: number, ny: number) {
  return item("책상", "desk", nx, ny, 0.28, 0.14);
}
function plant(nx: number, ny: number) {
  return item("화분", "plant", nx, ny, 0.2, 0.16);
}
function water(nx: number, ny: number) {
  return item("물", "water", nx, ny, 0.3, 0.13);
}

function layout(L: number): Piece[] {
  if (L === 0) return [sofa(0.33, 0.78)];
  if (L === 1) return [desk(0.36, 0.4), plant(0.08, 0.18)];
  if (L === 2) return [plant(0.4, 0.78), sofa(0.08, 0.28)];
  if (L === 3) return [sofa(0.33, 0.36), desk(0.36, 0.56)];
  if (L === 4) return [water(0.35, 0.06), sofa(0.08, 0.38)];
  if (L === 5) return [plant(0.08, 0.1), sofa(0.08, 0.4)];
  if (L === 6) return [sofa(0.33, 0.78), desk(0.08, 0.32)];
  if (L === 7) return [sofa(0.33, 0.6), plant(0.08, 0.2)];
  return [sofa(0.33, 0.78), plant(0.7, 0.18)];
}

function load(api: KnowApi) {
  pieces = layout(api.level);
  dust = [];
  drag = null;
  poolT = 0;
  flowT = 0;
  spawnAcc = 0;
  if (api.level === 8) api.setCoach("채광·통풍·동선");
}

function roomBox(w: number, h: number) {
  const top = 70;
  const bot = h - 22;
  const s = Math.min(w - 28, bot - top);
  return { x: (w - s) / 2, y: top + Math.max(0, (bot - top - s) / 2), s };
}

function sync(room: { x: number; y: number; s: number }) {
  for (const p of pieces) {
    p.w = Math.max(48, p.nw * room.s);
    p.h = Math.max(44, p.nh * room.s);
    if (drag !== p) {
      p.x = room.x + p.nx * room.s;
      p.y = room.y + p.ny * room.s;
    }
    p.x = Math.max(room.x + 4, Math.min(room.x + room.s - p.w - 4, p.x));
    p.y = Math.max(room.y + 8, Math.min(room.y + room.s - p.h - 14, p.y));
  }
}

function blocks(p: Piece, room: { x: number; y: number; s: number }, door: { x: number; y: number; w: number; h: number }) {
  if (p.kind === "water") return false;
  const ax0 = room.x + room.s / 2 - 20;
  const ax1 = room.x + room.s / 2 + 20;
  const onAxis = p.x < ax1 && p.x + p.w > ax0 && p.y + p.h > room.y + 70 && p.y < room.y + room.s;
  const onDoor = p.x < door.x + door.w && p.x + p.w > door.x && p.y + p.h > door.y - 16;
  return onAxis || onDoor;
}

function extraOk(L: number, room: { x: number; y: number; s: number }) {
  if (L === 4) {
    const wt = pieces.find((p) => p.kind === "water");
    return Boolean(wt && wt.y + wt.h / 2 > room.y + room.s * 0.55);
  }
  if (L === 5) {
    const pl = pieces.find((p) => p.kind === "plant");
    return Boolean(pl && pl.x + pl.w / 2 > room.x + room.s * 0.62 && pl.y + pl.h / 2 > room.y + room.s * 0.62);
  }
  if (L === 7) {
    const sf = pieces.find((p) => p.kind === "sofa");
    return Boolean(sf && sf.y <= room.y + 20);
  }
  return true;
}

function mountain(ctx: CanvasRenderingContext2D, room: { x: number; y: number; s: number }, fill: string, line: string) {
  const cx = room.x + room.s / 2;
  ctx.fillStyle = fill;
  ctx.strokeStyle = line;
  ctx.beginPath();
  ctx.moveTo(cx - room.s * 0.28, room.y + 2);
  ctx.lineTo(cx - 8, room.y - 26);
  ctx.lineTo(cx + 10, room.y - 8);
  ctx.lineTo(cx + room.s * 0.26, room.y - 22);
  ctx.lineTo(cx + room.s * 0.34, room.y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "기의 방위", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 12, "left");

  const room = roomBox(w, h);
  const door = { x: room.x + room.s / 2 - 28, y: room.y + room.s - 8, w: 56, h: 14 };
  sync(room);

  if (justDown && api.hold <= 0) {
    const hit = [...pieces].reverse().find((p) => inRect(ptr.x, ptr.y, p.x, p.y, p.w, p.h));
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
    drag.nx = (drag.x - room.x) / room.s;
    drag.ny = (drag.y - room.y) / room.s;
    drag = null;
  }

  const blocked = pieces.some((p) => blocks(p, room, door));
  const ready = !blocked && extraOk(api.level, room);

  if (api.hold <= 0) {
    spawnAcc += dt;
    if (spawnAcc > 0.14 && dust.length < 26) {
      spawnAcc = 0;
      dust.push({
        x: door.x + door.w / 2 + (Math.random() - 0.5) * 18,
        y: door.y,
        vx: (Math.random() - 0.5) * 12,
        vy: -50 - Math.random() * 18,
        life: 2.6,
        pooled: blocked,
      });
    }
    for (const d of dust) {
      const hitFurn = pieces.some((p) => p.kind !== "water" && inRect(d.x, d.y, p.x, p.y, p.w, p.h));
      d.pooled = blocked || hitFurn;
      if (d.pooled) {
        d.vx += (Math.random() - 0.5) * 70 * dt;
        d.vy = d.vy * 0.9 + 14 * dt;
      } else {
        d.vy = -72;
        d.vx += (room.x + room.s / 2 - d.x) * 1.6 * dt;
      }
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.life -= dt;
    }
    dust = dust.filter((d) => d.life > 0 && d.y > room.y - 16);
    if (blocked) {
      poolT += dt;
      flowT = 0;
      if (poolT >= 3) {
        api.miss("기가 고입니다. 문과 가운데 축을 여세요.");
        poolT = 0;
        dust = [];
      }
    } else {
      poolT = 0;
      if (ready) {
        flowT += dt;
        if (flowT >= 2.5) {
          popAt(api, room.x + room.s / 2, room.y + 20, pal.ok, 16);
          api.succeed(api.teach || "문이 열리고 축이 통하면 기가 돕니다.");
        }
      } else flowT = 0;
    }
  }

  fillRound(ctx, room.x, room.y, room.s, room.s, 8, pal.fill);
  strokeRound(ctx, room.x, room.y, room.s, room.s, 8, pal.line, 1.3);
  mountain(ctx, room, pal.fill, pal.muted);
  label(ctx, "배산", room.x + room.s / 2, room.y - 30, pal.muted, 11, "center");
  ctx.fillStyle = "rgba(236,232,225,0.05)";
  ctx.fillRect(room.x + room.s / 2 - 20, room.y + 70, 40, room.s - 78);
  fillRound(ctx, door.x, door.y, door.w, door.h, 3, pal.accent);
  label(ctx, "문", door.x + door.w / 2, door.y + 22, pal.muted, 11, "center");

  for (const p of pieces) {
    if (p.kind === "water") {
      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(122,147,168,0.34)";
      ctx.fill();
      ctx.strokeStyle = drag === p ? pal.accent : "#7a93a8";
      ctx.stroke();
      label(ctx, p.name, p.x + p.w / 2, p.y + p.h / 2, pal.fg, 12, "center");
      continue;
    }
    const bad = blocks(p, room, door);
    fillRound(ctx, p.x, p.y, p.w, p.h, 8, drag === p ? pal.accent : pal.bg);
    strokeRound(ctx, p.x, p.y, p.w, p.h, 8, bad ? pal.bad : pal.ok, 1.5);
    label(ctx, p.name, p.x + p.w / 2, p.y + p.h / 2, drag === p ? pal.bg : pal.fg, 13, "center");
  }

  for (const d of dust) {
    ctx.globalAlpha = Math.max(0.2, d.life / 2.6);
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.pooled ? 3.2 : 2.4, 0, Math.PI * 2);
    ctx.fillStyle = d.pooled ? pal.bad : pal.accent;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const hint =
    api.level === 4
      ? "물을 문 앞(남)으로"
      : api.level === 5
        ? "화분을 남동(오른쪽 아래)으로"
        : api.level === 7
          ? "소파를 배산(뒷벽)에"
          : api.level === 8
            ? "채광·통풍·동선"
            : "문과 가운데 축을 여세요";
  label(ctx, hint, w / 2, h - 14, pal.muted, 12, "center");
  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.2, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("fengshui", canvas, hooks, CLAY, { load, step });
}
