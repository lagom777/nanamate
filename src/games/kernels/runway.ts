import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  INK,
  PAPER,
  SLATE,
  CLAY,
  type Palette,
  clear,
  grain,
  label,
  display,
  roundRect,
  inRect,
  hit,
  burst,
  stepSparks,
  drawSparks,
  shuffle,
  type Spark,
} from "@/lib/games/draw";

const TOTAL = 9;
const UNUSED = [INK, SLATE, CLAY];

type Rect = { x: number; y: number; w: number; h: number };

function fillRound(ctx: CanvasRenderingContext2D, r: Rect, rad: number, fill: string) {
  roundRect(ctx, r.x, r.y, r.w, r.h, rad);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRound(ctx: CanvasRenderingContext2D, r: Rect, rad: number, stroke: string, lw = 1) {
  roundRect(ctx, r.x, r.y, r.w, r.h, rad);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function npvOf(cfs: number[], rate: number) {
  let s = 0;
  for (let i = 0; i < cfs.length; i++) s += cfs[i] / Math.pow(1 + rate, i + 1);
  return s;
}

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  if (id === "finance") return playFinance(canvas, hooks);
  return playStartup(canvas, hooks);
}

type StartLv = {
  name: string;
  months: number;
  cash: number;
  burn: number;
  users: number;
  growth: number;
  userGoal: number;
};

const START_LV: StartLv[] = [
  { name: "시드", months: 6, cash: 88, burn: 10, users: 42, growth: 0.05, userGoal: 0 },
  { name: "엔젤", months: 6, cash: 72, burn: 12, users: 30, growth: 0.04, userGoal: 72 },
  { name: "시리즈 A", months: 8, cash: 84, burn: 14, users: 55, growth: 0.04, userGoal: 0 },
  { name: "성장통", months: 8, cash: 64, burn: 15, users: 38, growth: 0.03, userGoal: 130 },
  { name: "시리즈 B", months: 10, cash: 78, burn: 16, users: 70, growth: 0.028, userGoal: 0 },
  {
    name: "수익화",
    months: 10,
    cash: 70,
    burn: 14,
    users: 80,
    growth: 0.03,
    userGoal: 160,
  },
  {
    name: "흑자 직전",
    months: 10,
    cash: 62,
    burn: 13,
    users: 90,
    growth: 0.025,
    userGoal: 0,
  },
  {
    name: "마지막 활주로",
    months: 12,
    cash: 54,
    burn: 12,
    users: 70,
    growth: 0.02,
    userGoal: 220,
  },
];

function playStartup(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  unlockAudio();
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  const pal: Palette = PAPER;
  let sparks: Spark[] = [];
  let level = 0;
  let score = 0;
  let won = false;
  let wasDown = false;
  let t = 0;
  let month = 0;
  let cash = 0;
  let burn = 0;
  let users = 0;
  let growth = 0;
  let lastInvest = -99;
  let tickAcc = 0;
  let failT = 0;
  let winT = 0;
  let coach = "채용·삭감·마케팅·투자로 달을 넘기세요.";
  let flash = 0;
  let paused = false;

  const emit = () => {
    const L = START_LV[level];
    hooks.onHud({
      level: level + 1,
      total: TOTAL,
      score,
      status: L.name,
      coach,
    });
  };

  const load = () => {
    const L = START_LV[level];
    month = 0;
    cash = L.cash;
    burn = L.burn;
    users = L.users;
    growth = L.growth;
    lastInvest = -99;
    tickAcc = 0;
    failT = 0;
    winT = 0;
    paused = false;
    flash = 0;
    coach = L.userGoal > 0 ? `${L.months}개월 생존, 사용자 ${L.userGoal}명` : `${L.months}개월 동안 현금이 바닥나지 않게`;
    emit();
  };

  const failLevel = () => {
    score = Math.max(0, score - 20);
    coach = "현금이 끊겼다. 소진을 읽고 다시.";
    tone(140, 0.16, "sawtooth", 0.05);
    noiseBurst(0.1, 0.05);
    failT = 0.9;
    paused = true;
    emit();
  };

  const winLevel = () => {
    if (won) return;
    score += 90 + Math.round(cash + users * 0.2);
    coach = `${START_LV[level].name} 통과. 활주로를 읽었다.`;
    winT = 0.7;
    paused = true;
    emit();
  };

  const advanceMonth = () => {
    if (paused || won) return;
    cash -= burn;
    users = Math.max(0, Math.round(users * (1 + growth)));
    month += 1;
    flash = 0.25;
    tone(220 + month * 8, 0.05, "sine", 0.04);
    const L = START_LV[level];
    if (cash <= 0) {
      cash = 0;
      failLevel();
      return;
    }
    const usersOk = L.userGoal <= 0 || users >= L.userGoal;
    if (month >= L.months && usersOk) {
      winLevel();
      return;
    }
    if (month >= L.months && !usersOk) coach = `달은 채웠다. 사용자 ${L.userGoal}명이 더 필요하다.`;
    else {
      const runway = burn > 0 ? cash / burn : 99;
      coach = `활주로 ${runway.toFixed(1)}개월 · 성장 ${(growth * 100).toFixed(1)}%`;
    }
    emit();
  };

  const act = (kind: string, cx: number, cy: number) => {
    if (paused || won) return;
    if (kind === "hire") {
      burn += 8;
      growth += 0.03;
      coach = "채용. 소진이 늘고 성장이 붙는다.";
      tone(420, 0.07, "triangle", 0.05);
    } else if (kind === "cut") {
      burn = Math.max(3, burn - 6);
      growth = Math.max(0, growth - 0.012);
      coach = "삭감. 숨은 길어지고 성장은 둔해진다.";
      tone(260, 0.07, "sine", 0.05);
    } else if (kind === "mkt") {
      if (cash < 12) {
        coach = "마케팅 비용 12가 없다.";
        tone(160, 0.08, "square", 0.04);
        emit();
        return;
      }
      cash -= 12;
      users += 20;
      coach = "마케팅. 현금을 사용자로 바꿨다.";
      tone(500, 0.07, "triangle", 0.05);
      if (cash <= 0) {
        failLevel();
        return;
      }
    } else if (kind === "inv") {
      if (month - lastInvest < 3) {
        coach = "투자는 세 달에 한 번.";
        tone(160, 0.08, "square", 0.04);
        emit();
        return;
      }
      cash += 40;
      lastInvest = month;
      coach = "투자 유치. 희석은 나중에.";
      tone(620, 0.1, "sine", 0.06);
    } else if (kind === "next") {
      advanceMonth();
      return;
    }
    if (!rm) burst(sparks, cx, cy, pal.accent, 10);
    emit();
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    flash = Math.max(0, flash - dt);
    stepSparks(sparks, dt);
    if (hit(UNUSED[0] ? -99 : 0, 0, 0, 0, 1)) t += 0;

    if (failT > 0) {
      failT -= dt;
      if (failT <= 0) load();
    }
    if (winT > 0) {
      winT -= dt;
      if (winT <= 0) {
        if (level + 1 >= TOTAL) {
          if (!won) {
            won = true;
            hooks.onClear(score);
          }
        } else {
          level += 1;
          load();
        }
      }
    }

    if (!paused && !won) {
      tickAcc += dt;
      if (tickAcc >= 1.1) {
        tickAcc = 0;
        advanceMonth();
      }
    }

    const pad = 16;
    const top = 52;
    const btnH = 52;
    const nextH = 46;
    const gap = 8;
    const btnY = h - pad - btnH;
    const nextY = btnY - gap - nextH;
    const btnW = (w - pad * 2 - gap * 3) / 4;
    const btns: { id: string; r: Rect; title: string; sub: string }[] = [
      { id: "hire", r: { x: pad, y: btnY, w: btnW, h: btnH }, title: "채용", sub: "소진+8" },
      { id: "cut", r: { x: pad + (btnW + gap), y: btnY, w: btnW, h: btnH }, title: "삭감", sub: "소진-6" },
      { id: "mkt", r: { x: pad + (btnW + gap) * 2, y: btnY, w: btnW, h: btnH }, title: "마케팅", sub: "현금-12" },
      { id: "inv", r: { x: pad + (btnW + gap) * 3, y: btnY, w: btnW, h: btnH }, title: "투자", sub: "현금+40" },
    ];
    const nextR: Rect = { x: pad, y: nextY, w: w - pad * 2, h: nextH };
    const canInvest = month - lastInvest >= 3;

    const pressed = view.ptr.down && !wasDown;
    if (pressed && !paused && !won) {
      unlockAudio();
      for (const b of btns) {
        if (inRect(view.ptr.x, view.ptr.y, b.r.x, b.r.y, b.r.w, b.r.h)) {
          act(b.id, b.r.x + b.r.w / 2, b.r.y + b.r.h / 2);
        }
      }
      if (inRect(view.ptr.x, view.ptr.y, nextR.x, nextR.y, nextR.w, nextR.h)) {
        act("next", nextR.x + nextR.w / 2, nextR.y);
      }
    }
    wasDown = view.ptr.down;

    const L = START_LV[level];
    clear(ctx, w, h, pal);
    if (flash > 0) {
      ctx.globalAlpha = flash * 0.18;
      ctx.fillStyle = pal.warn;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    grain(ctx, w, h, Math.floor(t * 9), 0.04);

    display(ctx, "활주로", pad, 26, pal.fg, 28);
    label(ctx, `${L.name} · ${month}/${L.months}개월`, w - pad, 26, pal.muted, 13, "right");

    const cardH = Math.max(88, nextY - top - 12);
    const card: Rect = { x: pad, y: top, w: w - pad * 2, h: cardH };
    fillRound(ctx, card, 14, pal.fill);
    strokeRound(ctx, card, 14, pal.line);

    const cols = [
      { k: "현금", v: `${Math.round(cash)}`, c: cash < burn * 2 ? pal.bad : pal.fg },
      { k: "소진", v: `${Math.round(burn)}`, c: pal.warn },
      { k: "사용자", v: `${Math.round(users)}`, c: pal.ok },
      { k: "성장", v: `${(growth * 100).toFixed(1)}%`, c: pal.accent },
    ];
    const cw = card.w / 4;
    for (let i = 0; i < 4; i++) {
      const cx = card.x + cw * i + cw / 2;
      label(ctx, cols[i].k, cx, card.y + 22, pal.muted, 12, "center");
      display(ctx, cols[i].v, cx, card.y + 52, cols[i].c, Math.min(30, cardH * 0.28), "center");
    }

    const barY = card.y + card.h - 28;
    const barW = card.w - 28;
    const runway = burn > 0 ? cash / burn : L.months;
    const ratio = Math.max(0, Math.min(1, runway / Math.max(1, L.months)));
    ctx.fillStyle = pal.line;
    roundRect(ctx, card.x + 14, barY, barW, 10, 5);
    ctx.fill();
    ctx.fillStyle = ratio < 0.35 ? pal.bad : ratio < 0.6 ? pal.warn : pal.ok;
    roundRect(ctx, card.x + 14, barY, Math.max(6, barW * ratio), 10, 5);
    ctx.fill();
    label(ctx, L.userGoal > 0 ? `목표 사용자 ${L.userGoal}` : `목표 ${L.months}개월`, card.x + 16, barY - 12, pal.muted, 11);

    fillRound(ctx, nextR, 12, pal.accent);
    label(ctx, "다음 달", nextR.x + nextR.w / 2, nextR.y + nextR.h / 2, pal.bg, 16, "center");

    for (const b of btns) {
      const hot = inRect(view.ptr.x, view.ptr.y, b.r.x, b.r.y, b.r.w, b.r.h) && view.ptr.down;
      const locked = b.id === "inv" && !canInvest;
      fillRound(ctx, b.r, 12, hot ? pal.accent : pal.fill);
      strokeRound(ctx, b.r, 12, locked ? pal.line : pal.fg, locked ? 1 : 1.2);
      label(ctx, b.title, b.r.x + b.r.w / 2, b.r.y + 18, hot ? pal.bg : locked ? pal.muted : pal.fg, 15, "center");
      label(ctx, locked ? "대기" : b.sub, b.r.x + b.r.w / 2, b.r.y + 36, hot ? pal.bg : pal.muted, 11, "center");
    }

    if (failT > 0) {
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = pal.bad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      display(ctx, "파산", w / 2, h * 0.42, pal.bad, 36, "center");
    }
    if (winT > 0) display(ctx, "생존", w / 2, h * 0.42, pal.ok, 34, "center");
    drawSparks(ctx, sparks);
  };

  load();
  const stop = startLoop(tick);
  return {
    restart: () => {
      level = 0;
      score = 0;
      won = false;
      sparks = [];
      load();
    },
    destroy: () => {
      stop();
      view.destroy();
    },
  };
}

type Proj = { name: string; cf: number[] };
type FinLv = { name: string; projects: Proj[]; pick: number[]; rate: number };

const FIN_LV: FinLv[] = [
  { name: "한 줄의 사업", projects: [{ name: "임대", cf: [20, 20, 20, 20] }], pick: [0], rate: 0.1 },
  {
    name: "둘 중 하나",
    projects: [
      { name: "카페", cf: [25, 25, 25, 25] },
      { name: "팝업", cf: [50, 6, 4, 2] },
    ],
    pick: [0],
    rate: 0.1,
  },
  {
    name: "묶어서 산다",
    projects: [
      { name: "구독", cf: [20, 20, 20, 20] },
      { name: "확장", cf: [12, 12, 12, 12] },
    ],
    pick: [0, 1],
    rate: 0.1,
  },
  {
    name: "가짜를 거르다",
    projects: [
      { name: "선매출", cf: [32, 10, 8, 6] },
      { name: "잔존", cf: [8, 12, 18, 42] },
      { name: "실험", cf: [6, 6, 6, 6] },
    ],
    pick: [0, 1],
    rate: 0.1,
  },
  {
    name: "먼 현금",
    projects: [
      { name: "단기", cf: [42, 16, 8, 4] },
      { name: "장기", cf: [4, 10, 22, 48] },
      { name: "중간", cf: [16, 16, 16, 16] },
    ],
    pick: [0, 1],
    rate: 0.15,
  },
  {
    name: "네 해의 무게",
    projects: [
      { name: "선수금", cf: [58, 0, 0, 4] },
      { name: "만기", cf: [0, 0, 6, 78] },
      { name: "안정", cf: [18, 18, 18, 18] },
    ],
    pick: [0, 2],
    rate: 0.12,
  },
  {
    name: "할인율의 힘",
    projects: [
      { name: "가까운 현금", cf: [40, 20, 8, 4] },
      { name: "먼 대박", cf: [2, 4, 10, 90] },
      { name: "고른 흐름", cf: [16, 16, 16, 16] },
    ],
    pick: [0, 2],
    rate: 0.18,
  },
  {
    name: "위험 분산",
    projects: [
      { name: "핵심", cf: [22, 22, 22, 22] },
      { name: "옵션", cf: [6, 10, 18, 30] },
      { name: "도박", cf: [80, 0, 0, 0] },
    ],
    pick: [0, 1],
    rate: 0.14,
  },
  {
    name: "자본비용",
    projects: [
      { name: "국채형", cf: [12, 12, 12, 12] },
      { name: "성장형", cf: [4, 8, 20, 48] },
      { name: "순환", cf: [28, 8, 28, 8] },
    ],
    pick: [0, 2],
    rate: 0.16,
  },
];

function playFinance(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  unlockAudio();
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  const pal: Palette = PAPER;
  let sparks: Spark[] = [];
  let level = 0;
  let score = 0;
  let won = false;
  let wasDown = false;
  let t = 0;
  let on: boolean[] = [];
  let rate = 0.1;
  let drag = false;
  let hold = 0;
  let coach = "내일의 1원은 오늘보다 작다";
  let target = 0;

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: TOTAL,
      score,
      status: FIN_LV[level].name,
      coach,
    });
  };

  const load = () => {
    const L = FIN_LV[level];
    on = L.projects.map(() => false);
    rate = 0.1;
    hold = 0;
    drag = false;
    const cfs = [0, 0, 0, 0];
    for (const i of L.pick) for (let y = 0; y < 4; y++) cfs[y] += L.projects[i].cf[y];
    target = npvOf(cfs, L.rate);
    coach = "내일의 1원은 오늘보다 작다";
    emit();
  };

  const currentNpv = () => {
    const cfs = [0, 0, 0, 0];
    FIN_LV[level].projects.forEach((p, i) => {
      if (!on[i]) return;
      for (let y = 0; y < 4; y++) cfs[y] += p.cf[y];
    });
    return npvOf(cfs, rate);
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    stepSparks(sparks, dt);

    const pad = 16;
    const sliderY = h - 56;
    const sliderX = pad + 8;
    const sliderW = w - pad * 2 - 16;
    const n = FIN_LV[level].projects.length;
    const listTop = 118;
    const listBot = sliderY - 18;
    const rowH = Math.max(52, Math.min(72, (listBot - listTop) / n - 8));
    const rows: Rect[] = FIN_LV[level].projects.map((_, i) => ({
      x: pad,
      y: listTop + i * (rowH + 8),
      w: w - pad * 2,
      h: rowH,
    }));

    if (view.ptr.down) {
      if (!wasDown) {
        unlockAudio();
        let hitRow = false;
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          if (inRect(view.ptr.x, view.ptr.y, r.x, r.y, r.w, r.h)) {
            on[i] = !on[i];
            hitRow = true;
            tone(on[i] ? 480 : 220, 0.06, "sine", 0.045);
            if (!rm) burst(sparks, r.x + 24, r.y + r.h / 2, pal.accent, 8);
            emit();
          }
        }
        if (!hitRow && view.ptr.y > sliderY - 28) drag = true;
      }
      if (drag) {
        const u = Math.max(0, Math.min(1, (view.ptr.x - sliderX) / sliderW));
        rate = 0.05 + u * 0.15;
      }
    } else drag = false;
    wasDown = view.ptr.down;

    const npv = currentNpv();
    const close = Math.abs(npv - target) <= 8;
    if (close && !won) {
      hold += dt;
      coach = `NPV ${npv.toFixed(1)} · 목표 ${target.toFixed(0)} ±8`;
      if (hold > 0.85) {
        score += 100 + Math.round(12 - Math.abs(npv - target));
        tone(560, 0.12, "triangle", 0.06);
        if (!rm) burst(sparks, w / 2, 70, pal.ok, 16);
        if (level + 1 >= TOTAL) {
          won = true;
          coach = "내일의 1원은 오늘보다 작다";
          hooks.onClear(score);
        } else {
          level += 1;
          load();
        }
        emit();
      }
    } else {
      if (hold > 0) emit();
      hold = 0;
      if (!won) {
        const d = npv - target;
        coach =
          Math.abs(d) < 20
            ? "가깝다. 할인율이나 사업을 미세하게."
            : d > 0
              ? "NPV가 크다. 할인율을 올리거나 사업을 빼라."
              : "NPV가 작다. 할인율을 내리거나 사업을 넣어라.";
      }
    }

    clear(ctx, w, h, pal);
    grain(ctx, w, h, Math.floor(t * 8), 0.04);
    display(ctx, "할인된 내일", pad, 26, pal.fg, 26);
    label(ctx, FIN_LV[level].name, w - pad, 24, pal.muted, 12, "right");
    display(ctx, npv.toFixed(1), pad, 72, close ? pal.ok : pal.fg, 36);
    label(ctx, `목표 ${target.toFixed(0)} ±8`, pad + 120, 76, pal.muted, 13);
    label(ctx, `r ${(rate * 100).toFixed(1)}%`, w - pad, 72, pal.accent, 14, "right");

    const years = ["1년", "2년", "3년", "4년"];
    for (let i = 0; i < n; i++) {
      const r = rows[i];
      const p = FIN_LV[level].projects[i];
      fillRound(ctx, r, 12, on[i] ? "#ddd6c8" : pal.fill);
      strokeRound(ctx, r, 12, on[i] ? pal.accent : pal.line, on[i] ? 1.6 : 1);
      label(ctx, p.name, r.x + 14, r.y + r.h / 2 - 8, pal.fg, 14);
      label(ctx, on[i] ? "포함" : "제외", r.x + 14, r.y + r.h / 2 + 12, on[i] ? pal.ok : pal.muted, 11);
      const cellW = Math.min(56, (r.w - 110) / 4);
      for (let y = 0; y < 4; y++) {
        const cx = r.x + r.w - 12 - (3 - y) * (cellW + 6) - cellW / 2;
        label(ctx, years[y], cx, r.y + 14, pal.muted, 10, "center");
        label(ctx, String(p.cf[y]), cx, r.y + r.h / 2 + 8, pal.fg, 13, "center");
      }
    }

    ctx.fillStyle = pal.line;
    roundRect(ctx, sliderX, sliderY, sliderW, 8, 4);
    ctx.fill();
    const hx = sliderX + ((rate - 0.05) / 0.15) * sliderW;
    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.arc(hx, sliderY + 4, 14, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, "5%", sliderX, sliderY + 28, pal.muted, 11, "left");
    label(ctx, "20%", sliderX + sliderW, sliderY + 28, pal.muted, 11, "right");
    label(ctx, "할인율", w / 2, sliderY + 28, pal.muted, 11, "center");

    if (close) {
      ctx.globalAlpha = 0.12 + hold * 0.2;
      ctx.fillStyle = pal.ok;
      ctx.fillRect(0, 0, w, 6);
      ctx.globalAlpha = 1;
    }
    drawSparks(ctx, sparks);
  };

  load();
  const stop = startLoop(tick);
  return {
    restart: () => {
      level = 0;
      score = 0;
      won = false;
      sparks = [];
      load();
    },
    destroy: () => {
      stop();
      view.destroy();
    },
  };
}
