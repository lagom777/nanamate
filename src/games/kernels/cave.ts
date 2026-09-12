import { INK } from "@/lib/games/draw";
import { display, head, label, playKnow, popAt, scene, type KnowApi, type KnowFrame } from "@/lib/games/know";

type Thing = { name: string; kind: "form" | "shadow"; x: number; y: number; vx: number; vy: number; r: number; got: boolean; hold: number };

const LV: { forms: string[]; shadows: string[]; why: string }[] = [
  { forms: ["형상", "좋음"], shadows: ["그림자", "메아리"], why: "동굴: 그림자가 아니라 형상을 비춘다." },
  { forms: ["도", "무명"], shadows: ["이름", "말"], why: "도가 말보다 앞선다. 이름에 붙잡히지 마라." },
  { forms: ["이성", "믿음"], shadows: ["독단"], why: "중세: 믿음과 이성을 함께 비춘다." },
  { forms: ["코기토"], shadows: ["감각", "꿈"], why: "확실한 것은 생각하는 나. 감각은 속일 수 있다." },
  { forms: ["형식", "구성"], shadows: ["사물 자체"], why: "칸트: 경험이 형식을 지나 구성된다." },
  { forms: ["실존", "선택"], shadows: ["본질"], why: "실존이 본질에 앞선다. 선택이 나를 만든다." },
  { forms: ["의무"], shadows: ["편의", "결과만"], why: "의무의 길을 비춘다. 편의는 그림자." },
  { forms: ["계약", "정당성"], shadows: ["강제"], why: "정당한 강제는 계약에서 온다." },
  { forms: ["언어", "권력"], shadows: ["투명한 실재"], why: "현대: 언어와 권력이 실재를 가린다. 가림을 비춘다." },
];

let things: Thing[] = [];
let lamp = { x: 0, y: 0 };
let cool = 0;

function load(api: KnowApi) {
  const spec = LV[api.level] ?? LV[0]!;
  const n = spec.forms.length + spec.shadows.length;
  things = [];
  spec.forms.forEach((name, i) => {
    things.push({
      name,
      kind: "form",
      x: 0.22 + (i * 0.28) % 0.6,
      y: 0.28 + (i % 2) * 0.28,
      vx: 0,
      vy: 0,
      r: 28,
      got: false,
      hold: 0,
    });
  });
  spec.shadows.forEach((name, i) => {
    const ang = (i / Math.max(1, spec.shadows.length)) * Math.PI * 2 + api.level;
    things.push({
      name,
      kind: "shadow",
      x: 0.5 + Math.cos(ang) * 0.28,
      y: 0.52 + Math.sin(ang) * 0.22,
      vx: Math.cos(ang + 1) * (0.08 + api.level * 0.012),
      vy: Math.sin(ang + 1) * (0.08 + api.level * 0.012),
      r: 24,
      got: false,
      hold: 0,
    });
  });
  lamp.x = 0.5;
  lamp.y = 0.82;
  cool = 0;
  void n;
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr } = f;
  head(ctx, w, "동굴의 빛", api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 12, "left");

  const k = 1 - Math.exp(-8 * dt);
  lamp.x += (ptr.x / w - lamp.x) * k;
  lamp.y += (ptr.y / h - lamp.y) * k;
  cool = Math.max(0, cool - dt);
  const lx = lamp.x * w;
  const ly = lamp.y * h;
  const radius = Math.max(54, Math.min(w, h) * 0.16);

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 52, w, h - 52);
  const g = ctx.createRadialGradient(lx, ly, 8, lx, ly, radius * 2.2);
  g.addColorStop(0, "rgba(236,232,225,0.22)");
  g.addColorStop(0.45, "rgba(236,232,225,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (const t of things) {
    if (t.kind === "shadow" && !t.got) {
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      if (t.x < 0.12 || t.x > 0.88) t.vx *= -1;
      if (t.y < 0.2 || t.y > 0.82) t.vy *= -1;
    }
    const x = t.x * w;
    const y = t.y * h;
    const dx = x - lx;
    const dy = y - ly;
    const lit = dx * dx + dy * dy <= radius * radius;

    if (t.kind === "form" && !t.got) {
      if (lit && api.hold <= 0) {
        t.hold += dt;
        if (t.hold >= 0.7) {
          t.got = true;
          popAt(api, x, y, api.pal.ok, 12);
          const left = things.filter((s) => s.kind === "form" && !s.got).length;
          if (left === 0) api.succeed(LV[api.level]!.why);
          else api.setCoach(`${t.name} · 남은 형상 ${left}`);
        }
      } else t.hold = Math.max(0, t.hold - dt * 0.6);
    }
    if (t.kind === "shadow" && lit && api.hold <= 0 && cool <= 0) {
      cool = 0.9;
      api.miss("그림자를 실재로 봤다.");
      t.x = 0.12 + Math.random() * 0.76;
      t.y = 0.22 + Math.random() * 0.5;
    }

    ctx.beginPath();
    ctx.arc(x, y, t.r, 0, Math.PI * 2);
    if (t.kind === "form") {
      ctx.fillStyle = t.got ? "rgba(143,191,154,0.35)" : lit ? api.pal.accent : api.pal.fill;
      ctx.fill();
      ctx.strokeStyle = t.got ? api.pal.ok : api.pal.line;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (t.hold > 0 && !t.got) {
        ctx.beginPath();
        ctx.arc(x, y, t.r + 6, -Math.PI / 2, -Math.PI / 2 + (t.hold / 0.7) * Math.PI * 2);
        ctx.strokeStyle = api.pal.ok;
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "rgba(40,42,48,0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(236,232,225,0.12)";
      ctx.stroke();
    }
    label(ctx, t.name, x, y, t.kind === "form" ? api.pal.fg : api.pal.muted, 12, "center");
  }

  ctx.beginPath();
  ctx.arc(lx, ly, 7, 0, Math.PI * 2);
  ctx.fillStyle = api.pal.fg;
  ctx.fill();
  display(ctx, "램프를 형상 위에 0.7초", 16, h - 18, api.pal.muted, 12, "left");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("philo", canvas, hooks, INK, { load, step });
}
