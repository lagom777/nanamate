import { CLAY } from "@/lib/games/draw";
import { display, head, label, playKnow, popAt, scene, type KnowApi, type KnowFrame } from "@/lib/games/know";

type Body = { name: string; kind: "goal" | "siren" | "reef"; x: number; y: number; r: number };

const LV: { goal: string; sirens: string[]; reefs: string[]; why: string }[] = [
  { goal: "트로이 출항", sirens: ["약탈"], reefs: ["폭풍"], why: "귀향은 승리 다음의 일이다." },
  { goal: "키코네스 탈출", sirens: ["더 많은 전리품"], reefs: ["지연"], why: "탐욕이 출항을 묶는다." },
  { goal: "로토파고이", sirens: ["망각의 열매"], reefs: ["잠"], why: "잊으면 집이 사라진다." },
  { goal: "키클롭스", sirens: ["자랑"], reefs: ["바위"], why: "이름을 자랑하면 추적당한다." },
  { goal: "아이올로스", sirens: ["바람 주머니를 열기"], reefs: ["역풍"], why: "의심이 순풍을 역풍으로 만든다." },
  { goal: "키르케", sirens: ["안주"], reefs: ["변신"], why: "안주는 달콤하고 귀향을 삼킨다." },
  { goal: "세이렌", sirens: ["세이렌의 노래"], reefs: ["암초"], why: "돛대에 묶여야 노래를 지나간다." },
  { goal: "스킬라·카리브디스", sirens: ["둘 다 피하기"], reefs: ["소용돌이"], why: "둘을 다 피하려다 둘에 삼킨다. 하나를 택한다." },
  { goal: "이타케", sirens: ["마지막 허세"], reefs: ["구혼자"], why: "노스토스: 유혹을 거절하고 집에 닿는다." },
];

let ship = { x: 0.12, y: 0.55 };
let bound = 0;
let cool = 0;
let bodies: Body[] = [];

function load(api: KnowApi) {
  const spec = LV[api.level] ?? LV[0]!;
  ship = { x: 0.12, y: 0.55 };
  bound = 0;
  cool = 0;
  bodies = [
    { name: spec.goal, kind: "goal", x: 0.84, y: 0.5, r: 30 },
    ...spec.sirens.map((name, i) => ({ name, kind: "siren" as const, x: 0.4 + i * 0.12, y: 0.28 + (i % 2) * 0.36, r: 22 })),
    ...spec.reefs.map((name, i) => ({ name, kind: "reef" as const, x: 0.38 + i * 0.18, y: 0.62 - (i % 2) * 0.2, r: 18 })),
  ];
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr, justDown } = f;
  head(ctx, w, "귀향", api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 12, "left");
  cool = Math.max(0, cool - dt);
  bound = Math.max(0, bound - dt);

  if (justDown) bound = 1.6;
  const sx = ship.x * w;
  const sy = ship.y * h;

  let ax = 0;
  let ay = 0;
  if (ptr.down && bound <= 0) {
    ax += (ptr.x - sx) * 1.8;
    ay += (ptr.y - sy) * 1.8;
  }
  for (const b of bodies) {
    if (b.kind !== "siren") continue;
    const dx = b.x * w - sx;
    const dy = b.y * h - sy;
    const d = Math.hypot(dx, dy) || 1;
    const pull = bound > 0 ? 8 : 46;
    ax += (dx / d) * pull * 12;
    ay += (dy / d) * pull * 12;
  }
  ship.x += (ax / w) * dt * 0.018;
  ship.y += (ay / h) * dt * 0.018;
  ship.x = Math.max(0.06, Math.min(0.94, ship.x));
  ship.y = Math.max(0.18, Math.min(0.88, ship.y));

  ctx.fillStyle = "rgba(40,70,90,0.35)";
  ctx.fillRect(0, h * 0.42, w, h * 0.5);

  for (const b of bodies) {
    const x = b.x * w;
    const y = b.y * h;
    ctx.beginPath();
    ctx.arc(x, y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.kind === "goal" ? "rgba(155,176,137,0.45)" : b.kind === "siren" ? "rgba(196,122,114,0.4)" : "rgba(60,55,50,0.7)";
    ctx.fill();
    label(ctx, b.name, x, y, api.pal.fg, 11, "center");
    const d = Math.hypot(ship.x * w - x, ship.y * h - y);
    if (d < b.r + 10 && api.hold <= 0 && cool <= 0) {
      if (b.kind === "goal") {
        popAt(api, x, y, api.pal.ok, 14);
        api.succeed(LV[api.level]!.why);
      } else if (b.kind === "siren") {
        cool = 0.8;
        api.miss(bound > 0 ? "묶여 있어도 너무 가까웠다." : "세이렌이 배를 꺾었다. 눌러 돛대에 묶어라.");
        ship.x = 0.12;
        ship.y = 0.55;
      } else {
        cool = 0.8;
        api.miss("암초. 길을 옆으로.");
        ship.x = Math.max(0.1, ship.x - 0.08);
      }
    }
  }

  ctx.beginPath();
  ctx.moveTo(ship.x * w, ship.y * h - 12);
  ctx.lineTo(ship.x * w + 16, ship.y * h + 10);
  ctx.lineTo(ship.x * w - 16, ship.y * h + 10);
  ctx.closePath();
  ctx.fillStyle = bound > 0 ? api.pal.ok : api.pal.fg;
  ctx.fill();
  display(ctx, bound > 0 ? "돛대에 묶임" : "눌러 묶고, 밀어 이타케로", 16, h - 18, api.pal.muted, 12, "left");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("myth", canvas, hooks, CLAY, { load, step });
}
