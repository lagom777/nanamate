import { tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  SLATE,
  clear,
  grain,
  label,
  display,
  hit,
  burst,
  stepSparks,
  drawSparks,
  type Spark,
} from "@/lib/games/draw";

type Kind = "diverge" | "converge" | "transform";
type Level = { name: string; target: Kind };
type Pt = { x: number; y: number };

const LEVELS: Level[] = [
  { name: "해령", target: "diverge" },
  { name: "습곡대", target: "converge" },
  { name: "변환단층", target: "transform" },
  { name: "대서양 중앙", target: "diverge" },
  { name: "히말라야", target: "converge" },
  { name: "산안드레아스", target: "transform" },
  { name: "동아프리카 열곡", target: "diverge" },
  { name: "일본 해구", target: "converge" },
  { name: "북아나톨리아", target: "transform" },
];

const KIND_KO: Record<Kind, string> = {
  diverge: "발산 · 해령",
  converge: "수렴 · 습곡",
  transform: "보존 · 변환단층",
};

const pal = SLATE;
const HOLD = 1.2;

function blob(cx: number, cy: number, rx: number, ry: number, seed: number, face: -1 | 1): Pt[] {
  const n = 22;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wob = 0.84 + 0.12 * Math.sin(a * 3 + seed) + 0.07 * Math.sin(a * 7 + seed * 1.6);
    const facing = Math.cos(a) * face;
    const pinch = facing > 0.15 ? 0.58 + 0.2 * (1 - facing) : 1;
    pts.push({
      x: cx + Math.cos(a) * rx * wob * pinch,
      y: cy + Math.sin(a) * ry * wob,
    });
  }
  return pts;
}

function pathBlob(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  if (pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % pts.length];
    ctx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) * 0.5, (p0.y + p1.y) * 0.5);
  }
  ctx.closePath();
}

function classify(gap: number, shear: number): Kind | null {
  if (gap > 140) return "diverge";
  if (gap < 90) return "converge";
  if (Math.abs(shear) > 50 && gap >= 90 && gap <= 140) return "transform";
  return null;
}

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  void id;
  unlockAudio();
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  let dead = false;
  let level = 0;
  let score = 0;
  let sparks: Spark[] = [];
  let finished = false;
  let lx = 0;
  let ly = 0;
  let rx = 0;
  let ry = 0;
  let drag: "left" | "gap" | null = null;
  let offX = 0;
  let offY = 0;
  let wasDown = false;
  let hold = 0;
  let celebrate = 0;
  let clock = 0;
  let status = "";
  let coach = "판을 벌리면 해령, 밀면 습곡, 비비면 변환단층";
  let lastKind: Kind | null = null;
  let lw = 0;
  let lh = 0;
  let phase = 0;

  const layoutHome = () => {
    const { w, h } = view.size();
    rx = w * 0.6;
    ry = h * 0.54;
    lx = rx - 115;
    ly = ry;
  };

  const load = () => {
    layoutHome();
    drag = null;
    hold = 0;
    celebrate = 0;
    clock = 0;
    lastKind = null;
    status = LEVELS[level].name;
    coach = "판을 벌리면 해령, 밀면 습곡, 비비면 변환단층";
    emit();
  };

  const emit = () => {
    hooks.onHud({ level: level + 1, total: LEVELS.length, score, status, coach });
  };

  const winLevel = () => {
    if (finished) return;
    const leftoverBonus = Math.max(0, Math.round(70 - clock * 2.4));
    score += 100 + leftoverBonus;
    if (level + 1 >= LEVELS.length) {
      finished = true;
      status = "경계 완성";
      coach = "발산은 해령, 수렴은 습곡, 보존은 변환단층";
      emit();
      hooks.onClear(score);
    } else {
      level += 1;
      load();
    }
  };

  const restart = () => {
    finished = false;
    level = 0;
    score = 0;
    sparks = [];
    load();
  };

  const plateR = () => {
    const { w, h } = view.size();
    return {
      lrx: Math.min(118, w * 0.2),
      lry: Math.min(150, h * 0.34),
      rrx: Math.min(122, w * 0.21),
      rry: Math.min(148, h * 0.33),
    };
  };

  const inLeft = (x: number, y: number) => {
    const { lrx, lry } = plateR();
    const nx = (x - lx) / lrx;
    const ny = (y - ly) / lry;
    return nx * nx + ny * ny <= 1.05;
  };

  const inGap = (x: number, y: number) => {
    const { lry } = plateR();
    return hit(x, y, (lx + rx) * 0.5, (ly + ry) * 0.5, Math.max(44, Math.min(80, lry * 0.55)));
  };

  const arrow = (ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, col: string) => {
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const ex = x + dx;
    const ey = y + dy;
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - ux * 10 - uy * 5, ey - uy * 10 + ux * 5);
    ctx.lineTo(ex - ux * 10 + uy * 5, ey - uy * 10 - ux * 5);
    ctx.closePath();
    ctx.fill();
  };

  const stop = startLoop((dt) => {
    if (dead) return;
    const pressed = view.ptr.down && !wasDown;
    const released = !view.ptr.down && wasDown;
    wasDown = view.ptr.down;

    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx) return;

    if (lw > 0 && lh > 0 && (w !== lw || h !== lh)) {
      lx *= w / lw;
      ly *= h / lh;
      rx *= w / lw;
      ry *= h / lh;
    } else if (lw === 0) {
      layoutHome();
    }
    lw = w;
    lh = h;
    phase += dt;
    clock += dt;

    const { lrx, lry, rrx, rry } = plateR();

    if (!finished && celebrate <= 0) {
      if (pressed) {
        if (inLeft(view.ptr.x, view.ptr.y)) {
          drag = "left";
          offX = view.ptr.x - lx;
          offY = view.ptr.y - ly;
          tone(190, 0.04, "sine", 0.03);
        } else if (inGap(view.ptr.x, view.ptr.y)) {
          drag = "gap";
          offX = view.ptr.x - lx;
          offY = view.ptr.y - ly;
          tone(170, 0.04, "sine", 0.03);
        }
      }
      if (drag && view.ptr.down) {
        lx = Math.min(w - 70, Math.max(70, view.ptr.x - offX));
        ly = Math.min(h - 70, Math.max(70, view.ptr.y - offY));
      }
      if (released) drag = null;
    } else if (released) {
      drag = null;
    }

    const gap = Math.hypot(rx - lx, ry - ly);
    const shear = ly - ry;
    const kind = classify(gap, shear);

    if (!finished && celebrate <= 0) {
      const target = LEVELS[level].target;
      if (kind === target) {
        hold += dt;
        if (kind !== lastKind) {
          tone(360, 0.06, "sine", 0.04);
          coach =
            target === "diverge"
              ? "해령이 열리고 있다. 유지하세요"
              : target === "converge"
                ? "습곡이 솟는다. 유지하세요"
                : "단층이 어긋난다. 유지하세요";
          emit();
        }
        if (hold >= HOLD) {
          celebrate = rm ? 0.18 : 0.55;
          hold = HOLD;
          if (!rm) burst(sparks, (lx + rx) * 0.5, (ly + ry) * 0.5, pal.ok, 20);
          tone(540, 0.12, "sine", 0.06);
          tone(720, 0.16, "triangle", 0.04);
          status = `${LEVELS[level].name} 형성`;
          emit();
        }
      } else {
        if (hold > 0.15) {
          coach = "목표 지형에서 벗어났습니다";
          emit();
        }
        hold = 0;
      }
      lastKind = kind;
    }

    if (celebrate > 0) {
      celebrate -= dt;
      if (celebrate <= 0) winLevel();
    }

    stepSparks(sparks, dt);
    clear(ctx, w, h, pal);
    ctx.fillStyle = "#0c1016";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(127,179,160,0.04)";
    for (let y = 0; y < h; y += 28) ctx.fillRect(0, y + ((phase * 8) % 28), w, 1);
    grain(ctx, w, h, 4, 0.04);

    const left = blob(lx, ly, lrx, lry, 1.2, 1);
    const right = blob(rx, ry, rrx, rry, 2.4, -1);
    const midX = (lx + rx) * 0.5;
    const midY = (ly + ry) * 0.5;

    if (kind === "diverge") {
      for (let i = 0; i < 5; i++) {
        const t = (i + 0.5) / 5 - 0.5;
        const px = midX + t * 18;
        const py = midY + t * 90;
        const pulse = rm ? 1 : 0.85 + 0.15 * Math.sin(phase * 4 + i);
        ctx.fillStyle = `rgba(196,165,116,${0.35 * pulse})`;
        ctx.beginPath();
        ctx.moveTo(px, py - 14);
        ctx.lineTo(px + 9, py + 6);
        ctx.lineTo(px - 9, py + 6);
        ctx.closePath();
        ctx.fill();
      }
    } else if (kind === "converge") {
      for (let i = 0; i < 6; i++) {
        const t = (i + 0.5) / 6 - 0.5;
        const px = midX + t * 10;
        const py = midY + t * 86;
        const ht = 18 + (i % 3) * 7;
        ctx.fillStyle = i % 2 ? "#3d4552" : "#4a5362";
        ctx.beginPath();
        ctx.moveTo(px, py - ht);
        ctx.lineTo(px + 11, py + 8);
        ctx.lineTo(px - 11, py + 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(12,13,16,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(midX - 8, midY - 70);
      ctx.lineTo(midX + 6, midY);
      ctx.lineTo(midX - 10, midY + 72);
      ctx.stroke();
    } else if (kind === "transform") {
      ctx.strokeStyle = pal.warn;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(midX, midY - 80);
      ctx.lineTo(midX, midY + 80);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "#2a3340";
    pathBlob(ctx, left);
    ctx.fill();
    ctx.fillStyle = "#323c4a";
    pathBlob(ctx, right);
    ctx.fill();
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 1.4;
    pathBlob(ctx, left);
    ctx.stroke();
    pathBlob(ctx, right);
    ctx.stroke();

    ctx.fillStyle = "rgba(159,176,148,0.18)";
    pathBlob(ctx, left);
    ctx.save();
    ctx.clip();
    ctx.fillRect(lx - lrx, ly - 8, lrx * 2, 16);
    ctx.restore();
    pathBlob(ctx, right);
    ctx.save();
    ctx.clip();
    ctx.fillRect(rx - rrx, ry - 8, rrx * 2, 16);
    ctx.restore();

    if (kind === "diverge") {
      arrow(ctx, lx + 20, ly - 40, -36, 0, pal.warn);
      arrow(ctx, rx - 20, ry - 40, 36, 0, pal.warn);
    } else if (kind === "converge") {
      arrow(ctx, lx - 10, ly - 44, 36, 0, pal.bad);
      arrow(ctx, rx + 10, ry - 44, -36, 0, pal.bad);
    } else if (kind === "transform") {
      arrow(ctx, lx + 8, ly - 50, 0, -34, pal.accent);
      arrow(ctx, rx - 8, ry + 50, 0, 34, pal.accent);
    }

    display(ctx, LEVELS[level].name, 20, 28, pal.fg, 26, "left");
    const nowLabel = kind ? KIND_KO[kind] : "경계 없음";
    label(ctx, `현재  ${nowLabel}`, w - 18, 22, kind === LEVELS[level].target ? pal.ok : pal.muted, 13, "right");
    label(ctx, `목표  ${KIND_KO[LEVELS[level].target]}`, w - 18, 40, pal.accent, 12, "right");

    const barW = Math.min(220, w * 0.4);
    const barX = (w - barW) * 0.5;
    const barY = h - 28;
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, 8);
    ctx.fillStyle = kind === LEVELS[level].target ? pal.ok : pal.muted;
    ctx.fillRect(barX, barY, barW * Math.min(1, hold / HOLD), 8);
    label(ctx, "유지", barX - 8, barY + 4, pal.muted, 11, "right");

    if (finished) display(ctx, "판의 경계", w * 0.5, 64, pal.ok, 24, "center");
    drawSparks(ctx, sparks);
  });

  load();
  return {
    restart,
    destroy: () => {
      dead = true;
      stop();
      view.destroy();
    },
  };
}
