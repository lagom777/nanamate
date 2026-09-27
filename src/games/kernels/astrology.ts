import { INK } from "@/lib/games/draw";
import { display, fillRound, head, inRect, label, playKnow, popAt, scene, strokeRound, type KnowApi, type KnowFrame } from "@/lib/games/know";

type Planet = { name: string; house: number; hint: string; x: number; y: number; placed: boolean };

const MEAN = ["자아", "자원", "소통", "집", "창조", "일", "관계", "깊이", "여행", "소명", "벗", "무의식"];

const LV: { name: string; house: number; hint: string }[][] = [
  [
    { name: "태양", house: 5, hint: "자아·창조" },
    { name: "달", house: 4, hint: "습관·집" },
  ],
  [
    { name: "수성", house: 3, hint: "소통" },
    { name: "금성", house: 7, hint: "관계" },
  ],
  [
    { name: "화성", house: 1, hint: "자아" },
    { name: "목성", house: 9, hint: "여행" },
  ],
  [
    { name: "토성", house: 10, hint: "소명" },
    { name: "태양", house: 5, hint: "창조" },
  ],
  [
    { name: "달", house: 4, hint: "집" },
    { name: "금성", house: 2, hint: "자원" },
  ],
  [
    { name: "ASC", house: 1, hint: "상승" },
    { name: "태양", house: 5, hint: "자아" },
  ],
  [
    { name: "태양", house: 5, hint: "자아" },
    { name: "달", house: 4, hint: "습관" },
    { name: "상승", house: 1, hint: "가면" },
  ],
  [
    { name: "금성", house: 7, hint: "관계" },
    { name: "화성", house: 8, hint: "깊이" },
  ],
  [
    { name: "토성", house: 10, hint: "소명" },
    { name: "목성", house: 9, hint: "여행" },
  ],
];

const DONE = [
  "행성은 무엇, 하우스는 삶의 영역.",
  "수성은 말, 금성은 이끌림.",
  "화성은 출발, 목성은 멀리.",
  "토성은 꼭대기, 태양은 무대의 불.",
  "달은 뿌리, 금성은 가진 것.",
  "상승은 동쪽 지평선, 왼쪽.",
  "태양·달·상승이 첫 읽기.",
  "금성은 마주 봄, 화성은 맞물림.",
  "상징이지 인과가 아니다.",
];

let planets: Planet[] = [];
let drag: Planet | null = null;
let ox = 0;
let oy = 0;

function houseOf(px: number, py: number, cx: number, cy: number) {
  const a = Math.atan2(py - cy, px - cx);
  let ang = Math.PI - a;
  if (ang < 0) ang += Math.PI * 2;
  if (ang >= Math.PI * 2) ang -= Math.PI * 2;
  return (Math.floor(ang / (Math.PI / 6)) % 12) + 1;
}

function houseMid(n: number) {
  return Math.PI - (n - 0.5) * (Math.PI / 6);
}

function load(api: KnowApi) {
  planets = LV[api.level].map((p) => ({ ...p, x: 0, y: 0, placed: false }));
  drag = null;
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  head(ctx, w, "하우스에 앉히기", api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 13, "left");

  const cx = w / 2;
  const cy = h * 0.44;
  const R = Math.min(w * 0.38, (h - 160) * 0.48);
  const need = planets.filter((p) => !p.placed).map((p) => `${p.name}→${p.house}`);
  label(ctx, need.join("   "), w / 2, 64, api.pal.fg, 13, "center");

  for (let i = 1; i <= 12; i++) {
    const a0 = Math.PI - (i - 1) * (Math.PI / 6);
    const a1 = Math.PI - i * (Math.PI / 6);
    const filled = planets.some((p) => p.placed && p.house === i);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, a0, a1, true);
    ctx.closePath();
    ctx.fillStyle = filled ? "rgba(143,191,154,0.18)" : "transparent";
    ctx.fill();
    ctx.strokeStyle = api.pal.line;
    ctx.stroke();
    const mid = houseMid(i);
    label(ctx, String(i), cx + Math.cos(mid) * R * 0.82, cy + Math.sin(mid) * R * 0.82, api.pal.muted, 11, "center");
  }
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.fillStyle = api.pal.fill;
  ctx.fill();
  ctx.strokeStyle = api.pal.line;
  ctx.stroke();
  label(ctx, "ASC", cx - R - 6, cy, api.pal.accent, 11, "right");

  const loose = planets.filter((p) => !p.placed);
  const gap = 8;
  const cw = Math.max(72, Math.min(120, (w - 24 - (loose.length - 1) * gap) / Math.max(1, loose.length)));
  const ch = 48;
  const tray = loose.length * cw + Math.max(0, loose.length - 1) * gap;
  const tx = (w - tray) / 2;
  loose.forEach((p, i) => {
    if (drag !== p) {
      p.x = tx + i * (cw + gap);
      p.y = h - 58;
    }
  });

  if (justDown && api.hold <= 0) {
    const hit = [...planets].reverse().find((p) => !p.placed && inRect(ptr.x, ptr.y, p.x, p.y, cw, ch));
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
    const px = drag.x + cw / 2;
    const py = drag.y + ch / 2;
    const dist = Math.hypot(px - cx, py - cy);
    if (dist <= R && dist >= 16) {
      const hs = houseOf(px, py, cx, cy);
      if (hs === drag.house) {
        drag.placed = true;
        const mid = houseMid(drag.house);
        popAt(api, cx + Math.cos(mid) * R * 0.5, cy + Math.sin(mid) * R * 0.5, api.pal.ok, 10);
        api.setCoach(`${drag.name} → ${drag.house}하우스 · ${drag.hint}`);
        if (planets.every((p) => p.placed)) api.succeed(DONE[api.level]);
      } else {
        api.miss(`${drag.name}은 ${drag.house}하우스 (${MEAN[drag.house - 1]}).`);
      }
    }
    drag = null;
  }

  for (const p of planets) {
    if (p.placed) {
      const mid = houseMid(p.house);
      const x = cx + Math.cos(mid) * R * 0.48;
      const y = cy + Math.sin(mid) * R * 0.48;
      fillRound(ctx, x - 28, y - 14, 56, 28, 8, api.pal.fill);
      strokeRound(ctx, x - 28, y - 14, 56, 28, 8, api.pal.ok, 1.2);
      label(ctx, p.name, x, y, api.pal.ok, 12, "center");
    } else {
      fillRound(ctx, p.x, p.y, cw, ch, 10, drag === p ? api.pal.accent : api.pal.fill);
      strokeRound(ctx, p.x, p.y, cw, ch, 10, api.pal.line, 1.2);
      label(ctx, p.name, p.x + cw / 2, p.y + ch / 2, drag === p ? api.pal.bg : api.pal.fg, 14, "center");
    }
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.18, api.pal.ok, 15, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("astrology", canvas, hooks, INK, { load, step });
}
