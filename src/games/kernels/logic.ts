import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  PAPER,
  clear,
  grain,
  label,
  display,
  roundRect,
  inRect,
  burst,
  stepSparks,
  drawSparks,
  type Spark,
} from "@/lib/games/draw";

type Mark = 0 | 1 | -1;

type Puzzle = {
  title: string;
  rows: string[];
  cols: string[];
  clues: string[];
  sol: number[];
};

const PUZZLES: Puzzle[] = [
  {
    title: "세 사람의 전공",
    rows: ["가은", "나준", "다온"],
    cols: ["법", "경영", "철학"],
    clues: ["가은은 법이 아니다.", "나준은 철학이다.", "다온은 경영이 아니다."],
    sol: [1, 2, 0],
  },
  {
    title: "세 잔의 음료",
    rows: ["민서", "하린", "준호"],
    cols: ["커피", "차", "주스"],
    clues: ["민서는 차를 마시지 않는다.", "하린은 커피를 마신다.", "준호는 주스를 마시지 않는다."],
    sol: [2, 0, 1],
  },
  {
    title: "세 도시의 주소",
    rows: ["서윤", "도윤", "예린"],
    cols: ["서울", "부산", "제주"],
    clues: ["서윤은 제주에 살지 않는다.", "도윤은 서울에 산다.", "예린은 부산에 살지 않는다."],
    sol: [1, 0, 2],
  },
  {
    title: "세 사람의 악기",
    rows: ["지호", "수아", "태민"],
    cols: ["피아노", "바이올린", "드럼"],
    clues: [
      "지호는 드럼을 치지 않는다.",
      "수아는 피아노가 아니다.",
      "태민은 바이올린이 아니다.",
      "드럼을 치는 사람은 수아가 아니다.",
    ],
    sol: [0, 1, 2],
  },
  {
    title: "남는 전공",
    rows: ["가온", "나엘", "다윗"],
    cols: ["물리", "화학", "생물", "역사"],
    clues: [
      "가온은 물리가 아니다.",
      "나엘은 화학이다.",
      "다윗은 생물도 역사도 아니다.",
      "역사 전공자는 없다. 한 사람당 하나.",
    ],
    sol: [2, 1, 0],
  },
  {
    title: "네 빛깔",
    rows: ["은채", "로운", "시우", "하율"],
    cols: ["빨강", "파랑", "초록", "노랑"],
    clues: [
      "은채는 빨강이 아니다.",
      "로운은 파랑이다.",
      "시우는 초록이 아니다.",
      "하율은 노랑이다.",
      "은채는 초록이다.",
    ],
    sol: [2, 1, 0, 3],
  },
];

export function play(_id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = PAPER;
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  const sparks: Spark[] = [];

  let level = 0;
  let score = 0;
  let mistakes = 0;
  let cleared = false;
  let wasDown = false;
  let t = 0;
  let hold = 0;
  let grid: Mark[][] = [];
  let flash = 0;
  let note = "";

  const emit = () => {
    const P = PUZZLES[level];
    hooks.onHud({
      level: level + 1,
      total: PUZZLES.length,
      score,
      status: P.title,
      coach: note || "칸을 눌러 빈칸 → O → X. 확인으로 답을 봅니다.",
    });
  };

  const load = () => {
    const P = PUZZLES[level];
    grid = P.rows.map(() => P.cols.map(() => 0 as Mark));
    flash = 0;
    hold = 0;
    note = "";
    mistakes = 0;
    emit();
  };

  const succeed = () => {
    if (hold > 0) return;
    score += Math.max(40, 140 - mistakes * 12);
    hold = 0.95;
    note = "모순 없이 닫혔습니다.";
    const { w, h } = view.size();
    if (!rm) burst(sparks, w * 0.42, h * 0.42, pal.ok, 18);
    tone(500, 0.14, "sine", 0.07);
    tone(760, 0.2, "triangle", 0.05);
    if (level + 1 >= PUZZLES.length && !cleared) {
      cleared = true;
      hooks.onClear(score);
    }
    emit();
  };

  const verify = () => {
    if (hold > 0) return;
    const P = PUZZLES[level];
    for (let r = 0; r < P.rows.length; r++) {
      const os = grid[r].map((v, c) => (v === 1 ? c : -1)).filter((c) => c >= 0);
      if (os.length !== 1) {
        flash = 0.3;
        mistakes += 1;
        note = os.length === 0 ? "각 줄에 O가 하나 있어야 합니다." : "한 줄에 O가 둘입니다.";
        noiseBurst(0.07, 0.04);
        emit();
        return;
      }
      if (os[0] !== P.sol[r]) {
        flash = 0.3;
        mistakes += 1;
        note = "단서와 어긋난 O가 있습니다.";
        noiseBurst(0.07, 0.04);
        emit();
        return;
      }
    }
    succeed();
  };

  const cycle = (r: number, c: number) => {
    if (hold > 0) return;
    const cur = grid[r][c];
    grid[r][c] = cur === 0 ? 1 : cur === 1 ? -1 : 0;
    unlockAudio();
    tone(grid[r][c] === 1 ? 420 : grid[r][c] === -1 ? 240 : 180, 0.05, "sine", 0.04);
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    flash = Math.max(0, flash - dt);
    if (!rm) stepSparks(sparks, dt);
    else sparks.length = 0;

    if (hold > 0) {
      hold -= dt;
      if (hold <= 0 && !cleared) {
        level += 1;
        load();
      }
    }

    const P = PUZZLES[level];
    const rows = P.rows.length;
    const cols = P.cols.length;
    const left = 86;
    const top = 64;
    const btnH = 48;
    const clueH = Math.min(132, 22 + P.clues.length * 18);
    const availW = w - left - 16;
    const availH = h - top - btnH - clueH - 28;
    const cell = Math.max(44, Math.min(72, Math.floor(Math.min(availW / cols, availH / rows))));

    const btn = { x: (w - 132) / 2, y: h - btnH - 12, w: 132, h: btnH };

    const pressed = view.ptr.down && !wasDown;
    if (pressed && hold <= 0) {
      unlockAudio();
      const { x, y } = view.ptr;
      if (inRect(x, y, btn.x, btn.y, btn.w, btn.h)) verify();
      else {
        const c = Math.floor((x - left) / cell);
        const r = Math.floor((y - top) / cell);
        if (r >= 0 && r < rows && c >= 0 && c < cols) cycle(r, c);
      }
    }
    wasDown = view.ptr.down;

    clear(ctx, w, h, pal);
    if (flash > 0) {
      ctx.globalAlpha = flash * 0.14;
      ctx.fillStyle = pal.bad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    display(ctx, P.title, 18, 26, pal.fg, 22, "left");
    label(ctx, `${level + 1} / ${PUZZLES.length}`, w - 16, 26, pal.muted, 12, "right");

    for (let c = 0; c < cols; c++) {
      label(ctx, P.cols[c], left + c * cell + cell / 2, top - 16, pal.muted, 12, "center");
    }
    for (let r = 0; r < rows; r++) {
      label(ctx, P.rows[r], left - 10, top + r * cell + cell / 2, pal.fg, 13, "right");
      for (let c = 0; c < cols; c++) {
        const x = left + c * cell;
        const y = top + r * cell;
        const hot = inRect(view.ptr.x, view.ptr.y, x, y, cell, cell);
        ctx.fillStyle = hot ? pal.accent : pal.fill;
        ctx.globalAlpha = hot ? 0.18 : 1;
        roundRect(ctx, x + 3, y + 3, cell - 6, cell - 6, 8);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = pal.line;
        ctx.stroke();
        const m = grid[r][c];
        if (m === 1) {
          ctx.strokeStyle = pal.ok;
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(x + cell / 2, y + cell / 2, cell * 0.22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1;
        } else if (m === -1) {
          ctx.strokeStyle = pal.bad;
          ctx.lineWidth = 2.2;
          const s = cell * 0.18;
          ctx.beginPath();
          ctx.moveTo(x + cell / 2 - s, y + cell / 2 - s);
          ctx.lineTo(x + cell / 2 + s, y + cell / 2 + s);
          ctx.moveTo(x + cell / 2 + s, y + cell / 2 - s);
          ctx.lineTo(x + cell / 2 - s, y + cell / 2 + s);
          ctx.stroke();
          ctx.lineWidth = 1;
        }
      }
    }

    const clueY = top + cell * rows + 18;
    label(ctx, "단서", 18, clueY, pal.muted, 12, "left");
    P.clues.forEach((c, i) => {
      label(ctx, `${i + 1}. ${c}`, 18, clueY + 20 + i * 18, pal.fg, 13, "left");
    });

    const bhot = inRect(view.ptr.x, view.ptr.y, btn.x, btn.y, btn.w, btn.h);
    ctx.fillStyle = bhot ? pal.accent : pal.fill;
    roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
    ctx.fill();
    ctx.strokeStyle = pal.line;
    ctx.stroke();
    label(ctx, "확인", btn.x + btn.w / 2, btn.y + btn.h / 2, bhot ? pal.bg : pal.fg, 16, "center");

    if (hold > 0) {
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = pal.ok;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    grain(ctx, w, h, Math.floor(t * 6) % 14, 0.028);
    drawSparks(ctx, sparks);
  };

  load();
  const stop = startLoop(tick);
  return {
    destroy() {
      stop();
      view.destroy();
    },
    restart() {
      level = 0;
      score = 0;
      cleared = false;
      sparks.length = 0;
      load();
    },
  };
}
