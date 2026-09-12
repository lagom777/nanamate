import { INK } from "@/lib/games/draw";
import {
  display,
  head,
  label,
  playKnow,
  popAt,
  scene,
  type KnowApi,
  type KnowFrame,
} from "@/lib/games/know";

type Node = { id: string; g: 0 | 1; nx: number; ny: number; name: string };
type Edge = { a: string; b: string; weak: boolean };
type Rumor = { path: string[]; i: number; u: number };
type Lv = { left: string; right: string };

const LV: Lv[] = [
  { left: "결속", right: "정보" },
  { left: "위", right: "아래" },
  { left: "안", right: "바깥" },
  { left: "행위", right: "반응" },
  { left: "중심", right: "주변" },
  { left: "가족", right: "학교" },
  { left: "토박이", right: "이방인" },
  { left: "돌봄", right: "제도" },
  { left: "오프라인", right: "디지털" },
];

const OFFSETS: [number, number][] = [
  [-0.08, -0.14],
  [0.08, -0.1],
  [-0.1, 0.1],
  [0.07, 0.14],
];

let nodes: Node[] = [];
let edges: Edge[] = [];
let from: Node | null = null;
let rumor: Rumor | null = null;
let arrived = false;
let leftName = "";
let rightName = "";

function load(api: KnowApi) {
  const L = LV[api.level];
  leftName = L.left;
  rightName = L.right;
  const marks = ["가", "나", "다", "라", "마", "바", "사", "아"];
  nodes = [];
  for (let g = 0; g < 2; g++) {
    for (let i = 0; i < 4; i++) {
      const [ox, oy] = OFFSETS[i];
      nodes.push({
        id: `${g}${i}`,
        g: g as 0 | 1,
        nx: (g === 0 ? 0.22 : 0.78) + ox,
        ny: 0.5 + oy,
        name: marks[g * 4 + i],
      });
    }
  }
  edges = [];
  from = null;
  rumor = null;
  arrived = false;
}

function pos(n: Node, w: number, h: number) {
  return { x: 20 + n.nx * (w - 40), y: 78 + n.ny * (h - 130) };
}

function hitNode(px: number, py: number, w: number, h: number, r = 24) {
  return nodes.find((n) => {
    const p = pos(n, w, h);
    return Math.hypot(px - p.x, py - p.y) <= r;
  });
}

function hasEdge(a: string, b: string) {
  return edges.some((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));
}

function nbs(id: string) {
  const out: string[] = [];
  for (const e of edges) {
    if (e.a === id) out.push(e.b);
    else if (e.b === id) out.push(e.a);
  }
  return out;
}

function pathToRight(start: string): string[] | null {
  const q = [start];
  const prev = new Map<string, string | null>();
  prev.set(start, null);
  while (q.length) {
    const cur = q.shift()!;
    const node = nodes.find((n) => n.id === cur);
    if (node && node.g === 1 && cur !== start) {
      const path = [cur];
      let p = prev.get(cur) ?? null;
      while (p) {
        path.push(p);
        p = prev.get(p) ?? null;
      }
      return path.reverse();
    }
    for (const nb of nbs(cur)) {
      if (!prev.has(nb)) {
        prev.set(nb, cur);
        q.push(nb);
      }
    }
  }
  return null;
}

function strongOk() {
  return edges.some((e) => !e.weak);
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "관계망", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 13, "left");

  const leftC = { x: 20 + 0.22 * (w - 40), y: 78 + 0.5 * (h - 130) };
  const rightC = { x: 20 + 0.78 * (w - 40), y: 78 + 0.5 * (h - 130) };
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.arc(leftC.x, leftC.y, 78, 0, Math.PI * 2);
  ctx.fillStyle = pal.accent;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rightC.x, rightC.y, 78, 0, Math.PI * 2);
  ctx.fillStyle = pal.ok;
  ctx.fill();
  ctx.globalAlpha = 1;
  label(ctx, leftName, leftC.x, leftC.y - 92, pal.muted, 12, "center");
  label(ctx, rightName, rightC.x, rightC.y - 92, pal.muted, 12, "center");

  for (const e of edges) {
    const a = nodes.find((n) => n.id === e.a)!;
    const b = nodes.find((n) => n.id === e.b)!;
    const pa = pos(a, w, h);
    const pb = pos(b, w, h);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = e.weak ? pal.warn : pal.accent;
    ctx.lineWidth = e.weak ? 1.4 : 4.2;
    ctx.globalAlpha = e.weak ? 0.85 : 0.55;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  }

  if (from && ptr.down) {
    const p = pos(from, w, h);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(ptr.x, ptr.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
  }

  if (rumor) {
    const ru = rumor;
    const next = pathToRight(ru.path[0]);
    if (next && next.length > 1) ru.path = next;
    const a = nodes.find((n) => n.id === ru.path[Math.min(ru.i, ru.path.length - 1)]);
    const b = nodes.find((n) => n.id === ru.path[Math.min(ru.i + 1, ru.path.length - 1)]);
    if (a && b && ru.path.length > 1) {
      const pa = pos(a, w, h);
      const pb = pos(b, w, h);
      ru.u = Math.min(1, ru.u + dt * 0.85);
      const x = pa.x + (pb.x - pa.x) * ru.u;
      const y = pa.y + (pb.y - pa.y) * ru.u;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = pal.warn;
      ctx.fill();
      if (ru.u >= 1) {
        ru.i += 1;
        ru.u = 0;
        if (ru.i >= ru.path.length - 1) {
          arrived = true;
          const dest = pos(b, w, h);
          if (strongOk() && api.hold <= 0) {
            popAt(api, dest.x, dest.y, pal.ok, 14);
            api.succeed("정보는 약한 연결로 건넌다.");
          } else api.setCoach("무리를 묶는 강한 연결도 필요합니다.");
        }
      }
    } else {
      const p = pos(a ?? nodes[0], w, h);
      const pulse = 5 + Math.sin(api.t * 5) * 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
      ctx.fillStyle = pal.warn;
      ctx.fill();
    }
  }

  for (const n of nodes) {
    const p = pos(n, w, h);
    const hot = from === n || Math.hypot(ptr.x - p.x, ptr.y - p.y) <= 24;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = from === n ? pal.accent : pal.fill;
    ctx.fill();
    ctx.strokeStyle = hot ? pal.accent : n.g === 0 ? pal.accent : pal.ok;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.lineWidth = 1;
    label(ctx, n.name, p.x, p.y, from === n ? pal.bg : pal.fg, 13, "center");
  }

  if (justDown && api.hold <= 0) {
    const n = hitNode(ptr.x, ptr.y, w, h);
    if (n) from = n;
  }
  if (justUp && from && api.hold <= 0) {
    const dest = hitNode(ptr.x, ptr.y, w, h);
    if (dest && dest.id !== from.id && !hasEdge(from.id, dest.id)) {
      const weak = from.g !== dest.g;
      edges.push({ a: from.id, b: dest.id, weak });
      const mid = pos(from, w, h);
      const md = pos(dest, w, h);
      popAt(api, (mid.x + md.x) / 2, (mid.y + md.y) / 2, weak ? pal.warn : pal.accent, 8);
      if (weak && !rumor) {
        const start = from.g === 0 ? from : dest;
        rumor = { path: [start.id], i: 0, u: 0 };
      }
      if (!weak && !edges.some((e) => e.weak)) api.setCoach("정보는 약한 연결로 건넌다.");
      if (arrived && strongOk() && api.hold <= 0) {
        api.succeed("정보는 약한 연결로 건넌다.");
      }
    }
    from = null;
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.18, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("socio", canvas, hooks, INK, { load, step });
}
