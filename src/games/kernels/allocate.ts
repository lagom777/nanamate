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
const UNUSED = [SLATE, CLAY];

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

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  if (id === "politics") return playPolitics(canvas, hooks);
  if (id === "love") return playLove(canvas, hooks);
  return playInvest(canvas, hooks);
}

function playInvest(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
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
  let d1 = 0.34;
  let d2 = 0.67;
  let drag: 1 | 2 | null = null;
  let wealth = 100;
  let storms = 0;
  let acc = 0;
  let flash = 0;
  let failT = 0;
  let winT = 0;
  let lastR = 0;
  let coach = "막대를 밀어 비중을 나누세요. 한 바구니에 담지 마세요.";
  const STORM_N = 5;

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: TOTAL,
      score,
      status: `폭풍 ${storms}/${STORM_N}`,
      coach,
    });
  };

  const load = () => {
    d1 = 0.34;
    d2 = 0.67;
    drag = null;
    wealth = 100;
    storms = 0;
    acc = 0;
    flash = 0;
    failT = 0;
    winT = 0;
    lastR = 0;
    coach = "주식·채권·현금. 폭풍 다섯 번을 70 이상으로.";
    emit();
  };

  const weights = () => {
    const stock = Math.max(0.02, Math.min(0.96, d1));
    const bond = Math.max(0.02, Math.min(0.96, d2 - d1));
    const cash = Math.max(0.02, 1 - d2);
    const s = stock + bond + cash;
    return { stock: stock / s, bond: bond / s, cash: cash / s };
  };

  const storm = (cx: number, cy: number) => {
    const wts = weights();
    const rMin = 8 + level * 1.6;
    const rMax = 16 + level * 2.2;
    const r = rMin + Math.random() * (rMax - rMin);
    lastR = r;
    const ret = wts.stock * (1 - r / 100) + wts.bond * (1 - r / 300) + wts.cash * 1;
    wealth = Math.max(0, wealth * ret);
    storms += 1;
    flash = 0.45;
    noiseBurst(0.09, 0.05);
    tone(180 + r * 4, 0.1, "sawtooth", 0.045);
    if (!rm) burst(sparks, cx, cy, pal.bad, 18);
    if (wealth < 70 && storms >= STORM_N) {
      score = Math.max(0, score - 20);
      coach = `잔고 ${wealth.toFixed(0)}. 주식에 너무 실었다.`;
      failT = 0.95;
      emit();
      return;
    }
    if (storms >= STORM_N && wealth >= 70) {
      score += 80 + Math.round(wealth - 70);
      coach = `잔고 ${wealth.toFixed(0)}. 분산이 버텼다.`;
      winT = 0.75;
      emit();
      return;
    }
    coach =
      wts.stock > 0.72
        ? `충격 -${r.toFixed(0)}%. 주식이 과하다.`
        : `충격 -${r.toFixed(0)}%. 비중을 다시 읽으세요.`;
    emit();
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    flash = Math.max(0, flash - dt);
    stepSparks(sparks, dt);
    if (UNUSED[0] && hit(-9, 0, 0, 0, 0.1)) t += 0;

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

    const pad = 16;
    const barY = h * 0.46;
    const barH = 56;
    const barX = pad;
    const barW = w - pad * 2;

    if (view.ptr.down && failT <= 0 && winT <= 0 && !won) {
      const px = view.ptr.x;
      const py = view.ptr.y;
      const x1 = barX + d1 * barW;
      const x2 = barX + d2 * barW;
      if (!wasDown) {
        unlockAudio();
        if (Math.abs(px - x1) < 28 && Math.abs(py - (barY + barH / 2)) < 36) drag = 1;
        else if (Math.abs(px - x2) < 28 && Math.abs(py - (barY + barH / 2)) < 36) drag = 2;
      }
      if (drag === 1) d1 = Math.max(0.06, Math.min(d2 - 0.08, (px - barX) / barW));
      else if (drag === 2) d2 = Math.max(d1 + 0.08, Math.min(0.94, (px - barX) / barW));
    } else drag = null;
    wasDown = view.ptr.down;

    if (failT <= 0 && winT <= 0 && !won) {
      acc += dt;
      if (acc >= 2.2) {
        acc = 0;
        storm(w / 2, barY);
      }
    }

    const wt = weights();
    clear(ctx, w, h, pal);
    if (flash > 0) {
      ctx.globalAlpha = flash * 0.28;
      ctx.fillStyle = pal.bad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    grain(ctx, w, h, Math.floor(t * 10), 0.04);
    display(ctx, "포트폴리오 폭풍", pad, 28, pal.fg, 26);
    label(ctx, `단계 ${level + 1}`, w - pad, 26, pal.muted, 12, "right");
    display(ctx, wealth.toFixed(1), pad, 86, wealth < 70 ? pal.bad : pal.fg, 40);
    label(ctx, "잔고 · 하한 70", pad, 118, pal.muted, 12);

    const names = [
      { k: "주식", p: wt.stock, c: "#8a4a42" },
      { k: "채권", p: wt.bond, c: "#6a5a38" },
      { k: "현금", p: wt.cash, c: "#3d5a48" },
    ];
    let accX = barX;
    for (const n of names) {
      const ww = n.p * barW;
      ctx.fillStyle = n.c;
      ctx.fillRect(accX, barY, ww, barH);
      if (ww > 48) {
        label(ctx, n.k, accX + ww / 2, barY + 18, "#f3eee6", 13, "center");
        label(ctx, `${Math.round(n.p * 100)}%`, accX + ww / 2, barY + 38, "#f3eee6", 13, "center");
      }
      accX += ww;
    }
    strokeRound(ctx, { x: barX, y: barY, w: barW, h: barH }, 4, pal.fg, 1.2);

    for (const d of [d1, d2]) {
      const x = barX + d * barW;
      ctx.fillStyle = pal.bg;
      roundRect(ctx, x - 7, barY - 8, 14, barH + 16, 6);
      ctx.fill();
      ctx.fillStyle = pal.fg;
      ctx.fillRect(x - 1.2, barY - 4, 2.4, barH + 8);
    }

    const pipY = barY + barH + 28;
    for (let i = 0; i < STORM_N; i++) {
      ctx.beginPath();
      ctx.arc(pad + 14 + i * 28, pipY, 7, 0, Math.PI * 2);
      ctx.fillStyle = i < storms ? pal.bad : pal.line;
      ctx.fill();
    }
    if (lastR > 0) label(ctx, `직전 충격 ${lastR.toFixed(0)} / ${(lastR / 3).toFixed(0)} / 0`, w - pad, pipY, pal.muted, 12, "right");

    const meterY = pipY + 28;
    const meterW = w - pad * 2;
    ctx.fillStyle = pal.line;
    roundRect(ctx, pad, meterY, meterW, 10, 5);
    ctx.fill();
    ctx.fillStyle = wealth < 70 ? pal.bad : pal.ok;
    roundRect(ctx, pad, meterY, meterW * Math.max(0.02, Math.min(1, wealth / 130)), 10, 5);
    ctx.fill();
    ctx.fillStyle = pal.fg;
    ctx.fillRect(pad + meterW * (70 / 130), meterY - 3, 2, 16);

    if (failT > 0) display(ctx, "무너짐", w / 2, h * 0.32, pal.bad, 34, "center");
    if (winT > 0) display(ctx, "버텼다", w / 2, h * 0.32, pal.ok, 34, "center");
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

type Party = { name: string; seats: number; ideo: number };

const POL_LV: { name: string; parties: Party[] }[] = [
  {
    name: "제21대",
    parties: [
      { name: "진보", seats: 28, ideo: 0.2 },
      { name: "중도", seats: 18, ideo: 0.5 },
      { name: "보수", seats: 30, ideo: 0.8 },
      { name: "녹색", seats: 12, ideo: 0.15 },
      { name: "국민", seats: 12, ideo: 0.6 },
    ],
  },
  {
    name: "제22대",
    parties: [
      { name: "민주", seats: 34, ideo: 0.28 },
      { name: "국민힘", seats: 36, ideo: 0.78 },
      { name: "개혁", seats: 12, ideo: 0.45 },
      { name: "정의", seats: 10, ideo: 0.16 },
      { name: "진보당", seats: 4, ideo: 0.1 },
      { name: "무소속", seats: 4, ideo: 0.55 },
    ],
  },
  {
    name: "시의회",
    parties: [
      { name: "노동", seats: 16, ideo: 0.18 },
      { name: "시민", seats: 22, ideo: 0.38 },
      { name: "중도", seats: 14, ideo: 0.52 },
      { name: "자유", seats: 20, ideo: 0.74 },
      { name: "미래", seats: 10, ideo: 0.62 },
      { name: "녹색", seats: 8, ideo: 0.22 },
    ],
  },
  {
    name: "분열 의회",
    parties: [
      { name: "좌파", seats: 19, ideo: 0.12 },
      { name: "사민", seats: 17, ideo: 0.32 },
      { name: "중도", seats: 15, ideo: 0.5 },
      { name: "보수", seats: 21, ideo: 0.76 },
      { name: "민족", seats: 11, ideo: 0.68 },
      { name: "녹색", seats: 9, ideo: 0.2 },
      { name: "무소속", seats: 8, ideo: 0.48 },
    ],
  },
  {
    name: "협소 과반",
    parties: [
      { name: "거대여", seats: 41, ideo: 0.36 },
      { name: "거대야", seats: 39, ideo: 0.7 },
      { name: "농민", seats: 7, ideo: 0.44 },
      { name: "도시", seats: 6, ideo: 0.58 },
      { name: "생태", seats: 4, ideo: 0.18 },
      { name: "자유", seats: 3, ideo: 0.84 },
    ],
  },
  {
    name: "극단의 거리",
    parties: [
      { name: "급진", seats: 14, ideo: 0.08 },
      { name: "진보", seats: 18, ideo: 0.24 },
      { name: "중도좌", seats: 13, ideo: 0.4 },
      { name: "중도", seats: 12, ideo: 0.5 },
      { name: "중도우", seats: 13, ideo: 0.62 },
      { name: "보수", seats: 16, ideo: 0.78 },
      { name: "극우", seats: 14, ideo: 0.92 },
    ],
  },
  {
    name: "지방선거",
    parties: [
      { name: "현역", seats: 32, ideo: 0.48 },
      { name: "도전자", seats: 28, ideo: 0.56 },
      { name: "지역", seats: 16, ideo: 0.4 },
      { name: "청년", seats: 12, ideo: 0.22 },
      { name: "보수연합", seats: 12, ideo: 0.8 },
    ],
  },
  {
    name: "연정 실험",
    parties: [
      { name: "사회", seats: 24, ideo: 0.26 },
      { name: "자유", seats: 22, ideo: 0.7 },
      { name: "녹색", seats: 18, ideo: 0.2 },
      { name: "중도", seats: 16, ideo: 0.5 },
      { name: "농촌", seats: 12, ideo: 0.58 },
      { name: "무소속", seats: 8, ideo: 0.44 },
    ],
  },
  {
    name: "소수 캐스팅",
    parties: [
      { name: "거대A", seats: 38, ideo: 0.32 },
      { name: "거대B", seats: 37, ideo: 0.72 },
      { name: "캐스팅", seats: 9, ideo: 0.5 },
      { name: "좌파", seats: 8, ideo: 0.14 },
      { name: "우파", seats: 8, ideo: 0.88 },
    ],
  },
];

function playPolitics(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
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
  let sel: boolean[] = [];
  let coach = "과반은 51. 이념 거리는 비용이다.";
  let flash = 0;

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: TOTAL,
      score,
      status: POL_LV[level].name,
      coach,
    });
  };

  const load = () => {
    sel = POL_LV[level].parties.map(() => false);
    coach = "정당을 눌러 연립을 짜세요. 과반이되 가깝게.";
    flash = 0;
    emit();
  };

  const stats = () => {
    const ps = POL_LV[level].parties;
    let seats = 0;
    let mn = 1;
    let mx = 0;
    let n = 0;
    ps.forEach((p, i) => {
      if (!sel[i]) return;
      seats += p.seats;
      mn = Math.min(mn, p.ideo);
      mx = Math.max(mx, p.ideo);
      n += 1;
    });
    return { seats, span: n >= 2 ? mx - mn : n === 1 ? 0 : 1, n };
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    flash = Math.max(0, flash - dt);
    stepSparks(sparks, dt);

    const pad = 14;
    const parties = POL_LV[level].parties;
    const confirmH = 50;
    const confirm: Rect = { x: pad, y: h - pad - confirmH, w: w - pad * 2, h: confirmH };
    const gridTop = 128;
    const gridBot = confirm.y - 12;
    const cols = parties.length > 5 ? 3 : 2;
    const rowsN = Math.ceil(parties.length / cols);
    const gap = 8;
    const cw = (w - pad * 2 - gap * (cols - 1)) / cols;
    const ch = Math.max(56, Math.min(88, (gridBot - gridTop - gap * (rowsN - 1)) / rowsN));
    const cards: Rect[] = parties.map((_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      return { x: pad + c * (cw + gap), y: gridTop + r * (ch + gap), w: cw, h: ch };
    });

    const { seats, span, n } = stats();
    const majority = seats >= 51;

    const pressed = view.ptr.down && !wasDown;
    if (pressed && !won) {
      unlockAudio();
      for (let i = 0; i < cards.length; i++) {
        const r = cards[i];
        if (inRect(view.ptr.x, view.ptr.y, r.x, r.y, r.w, r.h)) {
          sel[i] = !sel[i];
          tone(sel[i] ? 440 : 200, 0.06, "sine", 0.045);
          const st = stats();
          coach = st.seats >= 51 ? `과반 ${st.seats}석 · 거리 ${st.span.toFixed(2)}` : `아직 ${st.seats}석. 51이 필요하다.`;
          emit();
        }
      }
      if (inRect(view.ptr.x, view.ptr.y, confirm.x, confirm.y, confirm.w, confirm.h)) {
        if (!majority || n < 1) {
          flash = 0.35;
          coach = "과반이 안 된다. 의석을 더 모아라.";
          tone(150, 0.1, "square", 0.04);
          emit();
        } else {
          const pts = Math.round(50 + (1 - span) * 90);
          score += pts;
          coach = `연립 성립. 거리 ${span.toFixed(2)} · +${pts}`;
          tone(620, 0.12, "triangle", 0.06);
          if (!rm) burst(sparks, w / 2, confirm.y, pal.ok, 16);
          if (level + 1 >= TOTAL) {
            won = true;
            hooks.onClear(score);
          } else {
            level += 1;
            load();
          }
          emit();
        }
      }
    }
    wasDown = view.ptr.down;

    clear(ctx, w, h, pal);
    if (flash > 0) {
      ctx.globalAlpha = flash * 0.2;
      ctx.fillStyle = pal.bad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    grain(ctx, w, h, Math.floor(t * 8), 0.035);
    display(ctx, "연립의 수", pad, 26, pal.fg, 26);
    label(ctx, POL_LV[level].name, w - pad, 24, pal.muted, 12, "right");
    display(ctx, `${seats}`, pad, 78, majority ? pal.ok : pal.fg, 34);
    label(ctx, `/ 51  ·  거리 ${n ? span.toFixed(2) : "—"}`, pad + 64, 82, pal.muted, 13);

    const axisY = 104;
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, axisY);
    ctx.lineTo(w - pad, axisY);
    ctx.stroke();
    parties.forEach((p, i) => {
      const x = pad + p.ideo * (w - pad * 2);
      ctx.beginPath();
      ctx.arc(x, axisY, sel[i] ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = sel[i] ? pal.accent : pal.muted;
      ctx.fill();
    });

    for (let i = 0; i < parties.length; i++) {
      const r = cards[i];
      const p = parties[i];
      fillRound(ctx, r, 12, sel[i] ? "#d8d0c4" : pal.fill);
      strokeRound(ctx, r, 12, sel[i] ? pal.accent : pal.line, sel[i] ? 1.8 : 1);
      label(ctx, p.name, r.x + 12, r.y + r.h / 2 - 8, pal.fg, 15);
      label(ctx, `${p.seats}석 · 이념 ${p.ideo.toFixed(2)}`, r.x + 12, r.y + r.h / 2 + 12, pal.muted, 11);
    }

    fillRound(ctx, confirm, 12, majority ? pal.accent : pal.fill);
    strokeRound(ctx, confirm, 12, pal.line);
    label(ctx, "연립 성립", confirm.x + confirm.w / 2, confirm.y + confirm.h / 2, majority ? pal.bg : pal.muted, 16, "center");
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

const LOVE_LV = [
  { name: "가까운 궤도", ampI: 0.08, ampA: 0.07, freqI: 0.35, freqA: 0.32, sign: 1 },
  { name: "조금 더 빠르게", ampI: 0.11, ampA: 0.1, freqI: 0.5, freqA: 0.46, sign: 1 },
  { name: "반대 방향", ampI: 0.12, ampA: 0.12, freqI: 0.48, freqA: 0.48, sign: -1 },
  { name: "어긋난 주기", ampI: 0.14, ampA: 0.13, freqI: 0.7, freqA: 0.42, sign: -1 },
  { name: "흔들리는 둘", ampI: 0.16, ampA: 0.16, freqI: 0.85, freqA: 0.95, sign: -1 },
  { name: "동시 충족", ampI: 0.2, ampA: 0.18, freqI: 1.05, freqA: 0.88, sign: -1 },
  { name: "거친 바람", ampI: 0.22, ampA: 0.2, freqI: 1.15, freqA: 1.02, sign: -1 },
  { name: "멀리 떨어짐", ampI: 0.24, ampA: 0.22, freqI: 1.2, freqA: 0.7, sign: 1 },
  { name: "마지막 균형", ampI: 0.26, ampA: 0.24, freqI: 1.28, freqA: 1.18, sign: -1 },
];

function playLove(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  unlockAudio();
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  const pal: Palette = INK;
  let sparks: Spark[] = [];
  let level = 0;
  let score = 0;
  let won = false;
  let wasDown = false;
  let t = 0;
  let intimacy = 0.52;
  let autonomy = 0.5;
  let drag: "i" | "a" | null = null;
  let hold = 0;
  let coach = "친밀과 자율, 둘 다 녹색 띠에 3초.";

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: TOTAL,
      score,
      status: LOVE_LV[level].name,
      coach,
    });
  };

  const load = () => {
    intimacy = 0.52;
    autonomy = 0.5;
    drag = null;
    hold = 0;
    t = 0;
    coach = "둘 다 0.35–0.75에 머물게. 융합도 단절도 안 된다.";
    emit();
  };

  const inBand = (v: number) => v >= 0.35 && v <= 0.75;

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    stepSparks(sparks, dt);
    const L = LOVE_LV[level];

    if (!won) {
      if (drag !== "i") intimacy += Math.sin(t * L.freqI * Math.PI * 2) * L.ampI * dt * 1.6;
      if (drag !== "a") autonomy += Math.sin(t * L.freqA * Math.PI * 2) * L.ampA * dt * 1.6 * L.sign;
      intimacy = Math.max(0.02, Math.min(0.98, intimacy));
      autonomy = Math.max(0.02, Math.min(0.98, autonomy));
    }

    const pad = 20;
    const trackW = w - pad * 2;
    const iY = h * 0.4;
    const aY = h * 0.66;

    if (view.ptr.down && !won) {
      if (!wasDown) {
        unlockAudio();
        if (Math.abs(view.ptr.y - iY) < 44) drag = "i";
        else if (Math.abs(view.ptr.y - aY) < 44) drag = "a";
      }
      const u = Math.max(0.02, Math.min(0.98, (view.ptr.x - pad) / trackW));
      if (drag === "i") intimacy = u;
      if (drag === "a") autonomy = u;
    } else drag = null;
    wasDown = view.ptr.down;

    const ok = inBand(intimacy) && inBand(autonomy);
    if (ok && !won) {
      hold += dt;
      coach = `유지 ${hold.toFixed(1)} / 3.0초`;
      if (hold >= 3) {
        score += 110 + Math.round((1 - Math.abs(intimacy - 0.55) - Math.abs(autonomy - 0.55)) * 40);
        tone(640, 0.14, "sine", 0.06);
        if (!rm) {
          burst(sparks, pad + intimacy * trackW, iY, pal.ok, 12);
          burst(sparks, pad + autonomy * trackW, aY, pal.ok, 12);
        }
        if (level + 1 >= TOTAL) {
          won = true;
          coach = "접근과 자율의 동시 충족.";
          hooks.onClear(score);
        } else {
          level += 1;
          load();
        }
        emit();
      }
    } else {
      if (hold > 0.2) emit();
      hold = 0;
      if (!won) {
        if (!inBand(intimacy) && !inBand(autonomy)) coach = "둘 다 띠를 벗어났다.";
        else if (!inBand(intimacy)) coach = intimacy < 0.35 ? "친밀이 식는다." : "친밀이 삼킨다. 거리를 열어라.";
        else coach = autonomy < 0.35 ? "자율이 사라진다." : "너무 멀다. 궤도 밖으로.";
      }
    }

    clear(ctx, w, h, pal);
    grain(ctx, w, h, Math.floor(t * 11), 0.045);
    display(ctx, "두 궤도", pad, 30, pal.fg, 28);
    label(ctx, L.name, w - pad, 28, pal.muted, 12, "right");

    const drawMeter = (name: string, v: number, y: number) => {
      const trackH = 28;
      const bandX = pad + 0.35 * trackW;
      const bandW = 0.4 * trackW;
      ctx.fillStyle = pal.fill;
      roundRect(ctx, pad, y - trackH / 2, trackW, trackH, 14);
      ctx.fill();
      ctx.fillStyle = "rgba(143,191,154,0.22)";
      ctx.fillRect(bandX, y - trackH / 2, bandW, trackH);
      ctx.strokeStyle = pal.line;
      ctx.strokeRect(bandX, y - trackH / 2, bandW, trackH);
      const hx = pad + v * trackW;
      ctx.fillStyle = inBand(v) ? pal.ok : pal.bad;
      ctx.beginPath();
      ctx.arc(hx, y, 16, 0, Math.PI * 2);
      ctx.fill();
      if (hit(view.ptr.x, view.ptr.y, hx, y, 22) && view.ptr.down) {
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      label(ctx, name, pad, y - 28, pal.muted, 13);
      label(ctx, v.toFixed(2), w - pad, y - 28, inBand(v) ? pal.ok : pal.bad, 13, "right");
    };

    drawMeter("친밀", intimacy, iY);
    drawMeter("자율", autonomy, aY);

    ctx.fillStyle = pal.line;
    roundRect(ctx, pad, h - 36, trackW, 8, 4);
    ctx.fill();
    ctx.fillStyle = pal.ok;
    roundRect(ctx, pad, h - 36, Math.max(0, trackW * Math.min(1, hold / 3)), 8, 4);
    ctx.fill();
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

void shuffle;
