import { CLAY } from "@/lib/games/draw";
import { display, fillRound, head, inRect, label, playKnow, popAt, scene, strokeRound, type KnowApi, type KnowFrame } from "@/lib/games/know";

type Gate = { name: string; ok: boolean };

const ST = [
  { name: "바보", sub: "출발", teach: "0. 짐을 메고 첫 발을 디딘다." },
  { name: "마법사", sub: "의지", teach: "I. 도구를 쥔다. 의지가 일을 시작한다." },
  { name: "여교황", sub: "내면", teach: "II. 장막 안. 말하지 않은 것을 듣는다." },
  { name: "여황제", sub: "풍요", teach: "III. 땅이 키운다. 풍요는 돌봄에서 온다." },
  { name: "황제", sub: "질서", teach: "IV. 뼈대를 세운다. 질서가 자리를 만든다." },
  { name: "연인", sub: "선택", teach: "VI. 마음이 갈라진다. 선택이 가치를 드러낸다." },
  { name: "전차", sub: "의지", teach: "VII. 두 말을 한쪽으로. 의지가 속도를 낸다." },
  { name: "힘", sub: "용기", teach: "VIII. 부드러운 손. 용기는 억압이 아니다." },
  { name: "세계", sub: "완성", teach: "XXI. 한 바퀴를 닫는다. 완성은 다음 출발." },
];

const WRONG: [string, string][] = [
  ["탑", "세계"],
  ["은둔자", "달"],
  ["교황", "별"],
  ["정의", "힘"],
  ["전차", "연인"],
  ["악마", "태양"],
  ["운명", "죽음"],
  ["절제", "달"],
  ["바보", "심판"],
];

let gates: Gate[] = [];
let fool = { x: 0, y: 0 };
let drag = false;
let ox = 0;
let oy = 0;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stationAt(i: number, n: number, w: number, h: number) {
  const u = n <= 1 ? 0.5 : i / (n - 1);
  const x = 24 + u * (w - 48);
  const mid = h * 0.3;
  const amp = Math.min(36, h * 0.07);
  return { x, y: mid + Math.sin(u * Math.PI * 2.1) * amp };
}

function load(api: KnowApi) {
  const s = ST[api.level];
  const [a, b] = WRONG[api.level];
  gates = shuffle([
    { name: s.name, ok: true },
    { name: a, ok: false },
    { name: b, ok: false },
  ]);
  drag = false;
  fool.x = 0;
  fool.y = 0;
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  head(ctx, w, "바보의 길", api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 13, "left");

  const n = ST.length;
  const pts = ST.map((_, i) => stationAt(i, n, w, h));
  const from = pts[Math.max(0, api.level - 1)];
  const home = api.level === 0 ? { x: Math.max(28, from.x - 8), y: from.y } : from;
  if (!drag) {
    fool.x = home.x;
    fool.y = home.y;
  }

  ctx.save();
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = api.pal.line;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();

  pts.forEach((p, i) => {
    const done = i < api.level || api.hold > 0;
    const cur = i === api.level;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
    ctx.fillStyle = done ? api.pal.ok : api.pal.fill;
    ctx.fill();
    ctx.strokeStyle = cur ? api.pal.accent : api.pal.line;
    ctx.lineWidth = cur ? 2 : 1;
    ctx.stroke();
    ctx.lineWidth = 1;
    label(ctx, done || cur ? ST[i].name : String(i), p.x, p.y + 22, api.pal.muted, 10, "center");
  });

  const gn = gates.length;
  const gw = Math.max(88, Math.min(118, (w - 36 - (gn - 1) * 10) / gn));
  const gh = Math.max(108, Math.min(140, h * 0.3));
  const total = gn * gw + (gn - 1) * 10;
  const gx0 = (w - total) / 2;
  const gy = Math.min(h - gh - 16, h * 0.5);
  const boxes = gates.map((g, i) => ({ ...g, x: gx0 + i * (gw + 10), y: gy, w: gw, h: gh }));

  const fr = 22;
  if (justDown && api.hold <= 0) {
    const dx = ptr.x - fool.x;
    const dy = ptr.y - fool.y;
    if (dx * dx + dy * dy <= (fr + 8) * (fr + 8)) {
      drag = true;
      ox = ptr.x - fool.x;
      oy = ptr.y - fool.y;
    }
  }
  if (drag) {
    fool.x = ptr.x - ox;
    fool.y = ptr.y - oy;
  }
  if (justUp && drag) {
    const hit = boxes.find((b) => inRect(fool.x, fool.y, b.x, b.y, b.w, b.h));
    if (hit?.ok) {
      popAt(api, hit.x + hit.w / 2, hit.y + hit.h / 2, api.pal.ok, 12);
      api.succeed(ST[api.level].teach);
    } else if (hit) {
      api.miss(`다음 역은 ${ST[api.level].name}입니다.`);
    }
    drag = false;
  }

  for (const b of boxes) {
    const hot = inRect(ptr.x, ptr.y, b.x, b.y, b.w, b.h);
    fillRound(ctx, b.x, b.y, b.w, b.h, 8, api.pal.fill);
    strokeRound(ctx, b.x, b.y, b.w, b.h, 8, hot || (api.hold > 0 && b.ok) ? api.pal.accent : api.pal.line, hot ? 1.8 : 1);
    strokeRound(ctx, b.x + 6, b.y + 6, b.w - 12, b.h - 12, 5, api.pal.line, 1);
    display(ctx, b.name, b.x + b.w / 2, b.y + b.h / 2 - 8, api.pal.fg, b.name.length > 3 ? 14 : 16, "center");
    if (b.ok && api.hold > 0) label(ctx, ST[api.level].sub, b.x + b.w / 2, b.y + b.h / 2 + 14, api.pal.ok, 12, "center");
    else label(ctx, "다음 장", b.x + b.w / 2, b.y + b.h / 2 + 14, api.pal.muted, 11, "center");
  }

  ctx.beginPath();
  ctx.arc(fool.x, fool.y, fr, 0, Math.PI * 2);
  ctx.fillStyle = drag ? api.pal.accent : api.pal.ok;
  ctx.fill();
  ctx.strokeStyle = api.pal.fg;
  ctx.stroke();
  label(ctx, "바보", fool.x, fool.y, api.pal.bg, 11, "center");

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.18, api.pal.ok, 15, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("tarot", canvas, hooks, CLAY, { load, step });
}
