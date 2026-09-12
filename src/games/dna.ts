import { tone, unlockAudio } from "@/lib/games/audio";
import {
  bindCanvas,
  startLoop,
  type GameHandle,
  type GameHooks,
} from "@/lib/games/runtime";

const BASES = ["A", "T", "G", "C"] as const;
type Base = (typeof BASES)[number];
const PAIR: Record<Base, Base> = { A: "T", T: "A", G: "C", C: "G" };
const COLOR: Record<Base, string> = {
  A: "#c47a72",
  T: "#6a8eae",
  G: "#6f9b78",
  C: "#b8956a",
};

const STRANDS: Base[][] = [
  ["A", "T", "G"],
  ["G", "C", "A", "T"],
  ["A", "A", "T", "G", "C"],
  ["T", "G", "C", "G", "A", "T"],
  ["C", "A", "T", "G", "G", "C", "A"],
  ["A", "T", "G", "C", "T", "A", "G", "C"],
  ["G", "G", "C", "A", "T", "T", "A", "C", "G"],
  ["T", "A", "C", "G", "A", "T", "G", "C", "T", "A"],
  ["C", "G", "T", "A", "A", "C", "G", "T", "G", "C", "A"],
];

export function startDna(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const view = bindCanvas(canvas);
  let level = 0;
  let score = 0;
  let idx = 0;
  let wrongFlash = 0;
  let lastWrong: Base | null = null;
  let pop: { i: number; life: number }[] = [];
  let coach = "주형(위)의 상보쌍을 누르세요. A–T, G–C.";
  let keys: Partial<Record<string, boolean>> = {};

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: STRANDS.length,
      score,
      status: `염기 ${idx}/${STRANDS[level].length}`,
      coach,
    });
  };

  const press = (b: Base) => {
    const strand = STRANDS[level];
    if (idx >= strand.length) return;
    const need = PAIR[strand[idx]];
    unlockAudio();
    if (b === need) {
      pop.push({ i: idx, life: 0.35 });
      idx += 1;
      score += 20 + level * 4;
      tone(b === "A" || b === "T" ? 420 : 560, 0.07, "sine", 0.06);
      coach = `${strand[idx - 1]} ↔ ${b}`;
      if (idx >= strand.length) {
        score += 60;
        coach = "가닥 완성.";
        emit();
        if (level + 1 >= STRANDS.length) {
          hooks.onClear(score);
          return;
        }
        level += 1;
        idx = 0;
      }
    } else {
      wrongFlash = 0.35;
      lastWrong = b;
      coach = `${strand[idx]}의 짝은 ${need}입니다. ${b}가 아닙니다.`;
      tone(140, 0.12, "square", 0.05);
    }
    emit();
  };

  const onKey = (e: KeyboardEvent) => {
    const k = e.key.toUpperCase();
    if (BASES.includes(k as Base) && !keys[k]) {
      keys[k] = true;
      press(k as Base);
    }
  };
  const onUp = (e: KeyboardEvent) => {
    keys[e.key.toUpperCase()] = false;
  };
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onUp);

  const hitTest = (x: number, y: number) => {
    const { w, h } = view.size();
    const bw = Math.min(72, (w - 48) / 4);
    const by = h - 28 - 56;
    BASES.forEach((b, i) => {
      const bx = w / 2 - (bw * 4 + 24) / 2 + i * (bw + 8);
      if (x >= bx && x <= bx + bw && y >= by && y <= by + 56) press(b);
    });
  };

  const onClick = () => {
    if (view.ptr.down) hitTest(view.ptr.x, view.ptr.y);
  };
  canvas.addEventListener("pointerup", onClick);

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx) return;
    wrongFlash = Math.max(0, wrongFlash - dt);
    pop = pop.filter((p) => {
      p.life -= dt;
      return p.life > 0;
    });

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#101816");
    bg.addColorStop(1, "#0c1212");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const strand = STRANDS[level];
    const cell = Math.min(52, (w - 48) / Math.max(8, strand.length));
    const startX = (w - strand.length * (cell + 8)) / 2 + 4;
    const yTemp = h * 0.28;
    const yComp = h * 0.48;

    ctx.strokeStyle = "rgba(236,232,225,0.12)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(startX - 10, yTemp + cell / 2);
    ctx.lineTo(startX + strand.length * (cell + 8), yTemp + cell / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX - 10, yComp + cell / 2);
    ctx.lineTo(startX + strand.length * (cell + 8), yComp + cell / 2);
    ctx.stroke();

    strand.forEach((b, i) => {
      const x = startX + i * (cell + 8);
      drawBase(ctx, x, yTemp, cell, b, i === idx);
      if (i < idx) {
        const p = PAIR[b];
        const extra = pop.find((q) => q.i === i);
        const lift = extra ? (0.35 - extra.life) * -10 : 0;
        drawBase(ctx, x, yComp + lift, cell, p, false);
        ctx.strokeStyle = "rgba(236,232,225,0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + cell / 2, yTemp + cell);
        ctx.lineTo(x + cell / 2, yComp);
        ctx.stroke();
      } else if (i === idx) {
        ctx.strokeStyle = "rgba(236,232,225,0.35)";
        ctx.setLineDash([3, 4]);
        ctx.strokeRect(x - 2, yComp - 2, cell + 4, cell + 4);
        ctx.setLineDash([]);
      }
    });

    ctx.fillStyle = "rgba(236,232,225,0.4)";
    ctx.font = "500 13px Pretendard, sans-serif";
    ctx.fillText("주형 가닥", startX, yTemp - 12);
    ctx.fillText("상보 가닥", startX, yComp - 12);

    const bw = Math.min(72, (w - 48) / 4);
    const by = h - 28 - 56;
    BASES.forEach((b, i) => {
      const bx = w / 2 - (bw * 4 + 24) / 2 + i * (bw + 8);
      ctx.fillStyle = lastWrong === b && wrongFlash > 0 ? "#6a3030" : COLOR[b];
      roundRect(ctx, bx, by, bw, 56, 10);
      ctx.fill();
      ctx.fillStyle = "#0c0d10";
      ctx.font = "700 20px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(b, bx + bw / 2, by + 34);
      ctx.textAlign = "left";
    });
  };

  emit();
  const stop = startLoop(tick);
  return {
    destroy: () => {
      stop();
      view.destroy();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
      canvas.removeEventListener("pointerup", onClick);
    },
    restart: () => {
      level = 0;
      score = 0;
      idx = 0;
      coach = "주형(위)의 상보쌍을 누르세요. A–T, G–C.";
      emit();
    },
  };
}

function drawBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  b: Base,
  active: boolean,
) {
  ctx.fillStyle = COLOR[b];
  roundRect(ctx, x, y, s, s, 8);
  ctx.fill();
  if (active) {
    ctx.strokeStyle = "#ece8e1";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = "#0c0d10";
  ctx.font = `700 ${Math.floor(s * 0.42)}px 'IBM Plex Mono', monospace`;
  ctx.textAlign = "center";
  ctx.fillText(b, x + s / 2, y + s * 0.64);
  ctx.textAlign = "left";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
