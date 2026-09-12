import { PAPER } from "@/lib/games/draw";
import { display, head, label, playKnow, popAt, scene, type KnowApi, type KnowFrame } from "@/lib/games/know";

type Stone = { name: string; x: number; y: number; r: number };

const PATHS: { names: string[]; win: string }[] = [
  { names: ["다르마", "카르마", "윤회"], win: "다르마가 카르마를 낳고 윤회로 이어진다." },
  { names: ["계약", "율법", "한 분"], win: "계약이 율법을 연다. 한 분의 신." },
  { names: ["고", "집", "멸", "도"], win: "고집멸도. 고에서 도로." },
  { names: ["인", "의", "예"], win: "인이 의를 낳고 예로 드러난다." },
  { names: ["측은", "수오", "사양", "시비"], win: "측은·수오·사양·시비. 네 싹을 기른다." },
  { names: ["비움", "무위", "자연"], win: "비움에서 무위, 무위에서 자연." },
  { names: ["쓸모없음", "소요", "경계 너머"], win: "쓸모의 경계를 넘으면 산다." },
  { names: ["믿음", "은혜", "이웃"], win: "믿음과 은혜가 이웃에서 사랑이 된다." },
  { names: ["증언", "예배", "자선", "단식", "순례"], win: "다섯 기둥. 증언에서 순례까지." },
];

let names: string[] = PATHS[0]!.names;
let win = PATHS[0]!.win;
let next = 0;
let dragging = false;
let ox = 0;
let oy = 0;
let px = 0;
let py = 0;

function load(api: KnowApi) {
  const pack = PATHS[api.level] ?? PATHS[0]!;
  names = pack.names;
  win = pack.win;
  next = 0;
  dragging = false;
  px = 0;
  py = 0;
}

function inCircle(px0: number, py0: number, x: number, y: number, r: number) {
  const dx = px0 - x;
  const dy = py0 - y;
  return dx * dx + dy * dy <= r * r;
}

function disc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
  stroke: string,
  lw = 1,
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
  ctx.lineWidth = 1;
}

function layout(w: number, h: number) {
  const n = names.length;
  const r = 26;
  const top = 100;
  const bot = h - 64;
  const midY = (top + bot) / 2;
  const amp = Math.min(64, Math.max(28, (bot - top) / 2 - r));
  const left = 70;
  const right = w - 44;
  const stones: Stone[] = names.map((name, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    return {
      name,
      x: left + t * (right - left),
      y: midY + (i % 2 === 0 ? amp * 0.5 : -amp * 0.65),
      r,
    };
  });
  const start = { x: 30, y: stones[0]?.y ?? midY };
  return { stones, start };
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "계율의 길", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 13, "left");

  const { stones, start } = layout(w, h);
  const rest = next <= 0 ? start : { x: stones[next - 1]!.x, y: stones[next - 1]!.y };
  if (!dragging) {
    px = rest.x;
    py = rest.y;
  }

  ctx.save();
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  for (const s of stones) ctx.lineTo(s.x, s.y);
  ctx.stroke();
  ctx.restore();

  label(ctx, "시작", start.x, start.y + 40, pal.muted, 11, "center");
  disc(ctx, start.x, start.y, 10, pal.fill, pal.line, 1);

  for (let i = 0; i < stones.length; i++) {
    const s = stones[i]!;
    const done = i < next || api.hold > 0;
    disc(ctx, s.x, s.y, s.r, done ? pal.ok : pal.fill, done ? pal.ok : pal.line, done ? 2 : 1);
    const size = s.name.length > 3 ? 11 : 13;
    label(ctx, s.name, s.x, s.y, done ? pal.bg : pal.fg, size, "center");
  }

  const hitR = 22;
  if (justDown && api.hold <= 0 && inCircle(ptr.x, ptr.y, px, py, hitR)) {
    dragging = true;
    ox = ptr.x - px;
    oy = ptr.y - py;
  }
  if (dragging) {
    px = ptr.x - ox;
    py = ptr.y - oy;
  }
  if (justUp && dragging) {
    const hit = stones.findIndex((s) => inCircle(px, py, s.x, s.y, s.r));
    if (hit === next) {
      next += 1;
      popAt(api, stones[hit]!.x, stones[hit]!.y, pal.ok, 12);
      if (next >= stones.length) api.succeed(win);
      else api.setCoach(`다음, ${stones[next]!.name}.`);
    } else if (hit >= 0) {
      api.miss("다음 돌이 아닙니다. 순서를 지키세요.");
    }
    dragging = false;
  }

  disc(ctx, px, py, 12, dragging ? pal.accent : pal.fg, pal.accent, 2);

  if (api.hold > 0) display(ctx, api.note, w / 2, 72, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("religion", canvas, hooks, PAPER, { load, step });
}
