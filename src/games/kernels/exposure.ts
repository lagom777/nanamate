import { INK } from "@/lib/games/draw";
import { display, head, label, playKnow, popAt, scene, type KnowApi, type KnowFrame } from "@/lib/games/know";

const LV: { name: string; why: string; grow: number; shrink: number }[] = [
  { name: "가까운 위협", why: "공포는 경보다. 비추면 크기를 읽을 수 있다.", grow: 22, shrink: 28 },
  { name: "얼어붙기", why: "싸우기·도망 전에 몸이 먼저 멈춘다. 그래도 비춘다.", grow: 24, shrink: 26 },
  { name: "편도", why: "편도가 먼저, 피질이 나중. 빛을 유지해야 피질이 따라온다.", grow: 26, shrink: 24 },
  { name: "회피", why: "눈을 돌리면 덩어리가 커진다. 회피가 공포를 키운다.", grow: 32, shrink: 22 },
  { name: "다른 얼굴", why: "대상은 달라도 회로는 같다. 같은 노출.", grow: 28, shrink: 24 },
  { name: "안전한 접근", why: "안전한 거리에서 비추는 것이 소거의 시작.", grow: 26, shrink: 26 },
  { name: "노출", why: "노출은 회피의 반대. 2초를 견딘다.", grow: 30, shrink: 22 },
  { name: "견딤", why: "비추고 견디면 방이 넓어진다.", grow: 28, shrink: 28 },
  { name: "예측", why: "예측 가능한 위협은 크기가 줄어든다.", grow: 22, shrink: 30 },
];

let blob = { x: 0.62, y: 0.52, r: 86, hold: 0 };
let lamp = { x: 0.18, y: 0.78 };
let cool = 0;

function load(_api: KnowApi) {
  blob = { x: 0.58 + Math.random() * 0.12, y: 0.48 + Math.random() * 0.1, r: 82, hold: 0 };
  lamp = { x: 0.18, y: 0.78 };
  cool = 0;
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr } = f;
  const spec = LV[api.level] ?? LV[0]!;
  head(ctx, w, "손전등", api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 12, "left");
  cool = Math.max(0, cool - dt);

  const k = 1 - Math.exp(-10 * dt);
  lamp.x += (ptr.x / w - lamp.x) * k;
  lamp.y += (ptr.y / h - lamp.y) * k;
  const lx = lamp.x * w;
  const ly = lamp.y * h;
  const cone = Math.max(48, Math.min(w, h) * 0.14);

  const bx = blob.x * w;
  const by = blob.y * h;
  const lit = (lx - bx) ** 2 + (ly - by) ** 2 <= (cone + blob.r * 0.35) ** 2;

  if (api.hold <= 0) {
    if (lit) {
      blob.r = Math.max(28, blob.r - spec.shrink * dt);
      blob.hold += dt;
    } else {
      blob.r = Math.min(170, blob.r + spec.grow * dt);
      blob.hold = Math.max(0, blob.hold - dt * 1.4);
    }
    if (blob.r >= 165 && cool <= 0) {
      cool = 1;
      blob.r = 82;
      blob.hold = 0;
      api.miss("회피가 방을 채웠다. 다시 비추세요.");
    }
    if (blob.r <= 36 && blob.hold >= 2) {
      popAt(api, bx, by, api.pal.ok, 16);
      api.succeed(spec.why);
    }
  }

  ctx.fillStyle = "rgba(0,0,0,0.62)";
  ctx.fillRect(0, 52, w, h - 52);
  const g = ctx.createRadialGradient(lx, ly, 6, lx, ly, cone * 2.4);
  g.addColorStop(0, "rgba(236,232,225,0.28)");
  g.addColorStop(0.5, "rgba(236,232,225,0.07)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.beginPath();
  ctx.arc(bx, by, blob.r, 0, Math.PI * 2);
  ctx.fillStyle = lit ? "rgba(196,122,114,0.55)" : "rgba(28,22,24,0.92)";
  ctx.fill();
  ctx.strokeStyle = lit ? api.pal.warn : "rgba(236,232,225,0.1)";
  ctx.lineWidth = 2;
  ctx.stroke();
  label(ctx, spec.name, bx, by, api.pal.fg, 13, "center");

  if (blob.hold > 0 && lit) {
    ctx.beginPath();
    ctx.arc(bx, by, blob.r + 8, -Math.PI / 2, -Math.PI / 2 + Math.min(1, blob.hold / 2) * Math.PI * 2);
    ctx.strokeStyle = api.pal.ok;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(lx, ly, 7, 0, Math.PI * 2);
  ctx.fillStyle = api.pal.fg;
  ctx.fill();

  const need = blob.r <= 36 ? `견딤 ${blob.hold.toFixed(1)} / 2.0초` : `크기 ${Math.round(blob.r)} · 작게 만들고 2초`;
  display(ctx, need, 16, h - 18, api.pal.muted, 12, "left");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("fear", canvas, hooks, INK, { load, step });
}
