import { PAPER } from "@/lib/games/draw";
import { display, head, inRect, label, playKnow, popAt, scene, type KnowApi, type KnowFrame } from "@/lib/games/know";

type Card = { name: string; nx: number; ny: number; teach: string; placed: boolean; x: number; y: number };
type Lv = { cards: { name: string; nx: number; ny: number; teach: string }[] };

const LV: Lv[] = [
  { cards: [{ name: "보통선거", nx: 0.05, ny: -0.2, teach: "한 사람 한 표. 권력은 아래로부터." }, { name: "권력분립", nx: 0.15, ny: -0.25, teach: "나눠야 한곳에 고이지 않는다." }] },
  { cards: [{ name: "작은 정부", nx: 0.72, ny: -0.55, teach: "정부는 작을수록 개인이 크다." }, { name: "개인 권리", nx: 0.55, ny: -0.65, teach: "빼앗을 수 없는 것이 권리." }] },
  { cards: [{ name: "전통 가족", nx: 0.35, ny: 0.55, teach: "오래된 형식이 질서를 붙든다." }, { name: "급변 경계", nx: 0.2, ny: 0.65, teach: "빠른 변화는 뿌리를 흔든다." }] },
  { cards: [{ name: "사적 소유", nx: 0.78, ny: 0.08, teach: "내 것이 있어야 거래가 생긴다." }, { name: "가격 배분", nx: 0.82, ny: -0.08, teach: "가격이 무엇을 만들지 정한다." }] },
  { cards: [{ name: "생산 사회화", nx: -0.72, ny: 0.12, teach: "생산 수단을 함께 가진다." }, { name: "평등 우선", nx: -0.65, ny: -0.08, teach: "결과의 차이를 먼저 줄인다." }] },
  { cards: [{ name: "계급 철폐", nx: -0.75, ny: 0.55, teach: "계급이 없어야 평등이 끝난다." }, { name: "국가 소유", nx: -0.68, ny: 0.72, teach: "국가가 생산을 움켜쥔다." }] },
  { cards: [{ name: "재분배 세금", nx: -0.38, ny: -0.12, teach: "세금으로 시장 밖 격차를 보정." }, { name: "시장 유지", nx: 0.38, ny: -0.1, teach: "시장은 남기되 그 위에 그물을 친다." }] },
  { cards: [{ name: "국가가 삶 전부", nx: -0.08, ny: 0.88, teach: "공과 사의 경계가 사라진다." }, { name: "일당 독재", nx: 0.12, ny: 0.9, teach: "하나의 당이 모든 길을 닫는다." }] },
  { cards: [{ name: "강제 없는 질서", nx: 0, ny: -0.86, teach: "규칙은 합의에서만 온다." }, { name: "국가 거부", nx: -0.18, ny: -0.88, teach: "국가 자체가 강제다." }] },
];

let cards: Card[] = [];
let drag: Card | null = null;
let ox = 0;
let oy = 0;

function load(api: KnowApi) {
  cards = LV[api.level].cards.map((c) => ({ ...c, placed: false, x: 0, y: 0 }));
  drag = null;
}

function why(nx: number, ny: number) {
  const xs = nx <= -0.18 ? "계획·평등" : nx >= 0.18 ? "시장·자유" : "";
  const ys = ny >= 0.18 ? "권위" : ny <= -0.18 ? "해방" : "";
  if (xs && ys) return `${xs} · ${ys}`;
  return xs || ys || "원점 근처";
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  head(ctx, w, "좌표 위의 말", api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 13, "left");

  const top = 64;
  const bot = h - 70;
  const x0 = 24;
  const pw = w - 48;
  const ph = bot - top;
  const cx = x0 + pw / 2;
  const cy = top + ph / 2;

  ctx.strokeStyle = api.pal.line;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx, bot);
  ctx.moveTo(x0, cy);
  ctx.lineTo(x0 + pw, cy);
  ctx.stroke();
  label(ctx, "권위", cx, top + 10, api.pal.muted, 11, "center");
  label(ctx, "해방", cx, bot - 10, api.pal.muted, 11, "center");
  label(ctx, "계획", x0 + 8, cy - 10, api.pal.muted, 11, "left");
  label(ctx, "시장", x0 + pw - 8, cy - 10, api.pal.muted, 11, "right");

  const loose = cards.filter((c) => !c.placed);
  const gap = 8;
  const cw = Math.max(72, Math.min(140, (w - 24 - (loose.length - 1) * gap) / Math.max(1, loose.length)));
  const total = loose.length * cw + Math.max(0, loose.length - 1) * gap;
  const tx = (w - total) / 2;
  loose.forEach((c, i) => {
    if (drag !== c) {
      c.x = tx + i * (cw + gap);
      c.y = h - 58;
    }
  });

  if (justDown && api.hold <= 0) {
    const hit = [...cards].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, cw, 48));
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
    const nx = (drag.x + cw / 2 - cx) / (pw / 2);
    const ny = (cy - (drag.y + 24)) / (ph / 2);
    const d = Math.hypot(nx - drag.nx, ny - drag.ny);
    if (d < 0.32) {
      drag.placed = true;
      popAt(api, cx + drag.nx * (pw / 2), cy - drag.ny * (ph / 2), api.pal.ok, 12);
      api.setCoach(drag.teach);
      if (cards.every((c) => c.placed)) api.succeed(`그 자리는 ${why(drag.nx, drag.ny)}. 이념은 두 축 위의 위치.`);
    } else {
      api.miss(`그 자리는 ${why(nx, ny)}. 목표와 거리가 있습니다.`);
    }
    drag = null;
  }

  for (const c of cards) {
    const x = c.placed ? cx + c.nx * (pw / 2) - cw / 2 : c.x;
    const y = c.placed ? cy - c.ny * (ph / 2) - 24 : c.y;
    ctx.fillStyle = drag === c ? api.pal.accent : api.pal.fill;
    ctx.fillRect(x, y, cw, 48);
    ctx.strokeStyle = c.placed ? api.pal.ok : api.pal.line;
    ctx.strokeRect(x, y, cw, 48);
    label(ctx, c.name, x + cw / 2, y + 24, drag === c ? api.pal.bg : api.pal.fg, 12, "center");
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.2, api.pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("ideology", canvas, hooks, PAPER, { load, step });
}
