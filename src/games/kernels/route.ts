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
const UNUSED = [INK, PAPER, CLAY];

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
  if (id === "security") return playSecurity(canvas, hooks);
  return playBackend(canvas, hooks);
}

const ALL_SEGS = ["인증", "검증", "로그", "핸들러", "응답"] as const;

const BACK_LV = [
  { name: "짧은 관", segs: [0, 3, 4], interval: 2.35, speed: 78 },
  { name: "조금 빠르게", segs: [0, 3, 4], interval: 1.9, speed: 92 },
  { name: "검증을 끼우다", segs: [0, 1, 3, 4], interval: 2.05, speed: 86 },
  { name: "로그가 끼어든다", segs: [0, 1, 2, 3, 4], interval: 1.95, speed: 90 },
  { name: "엄격한 순서", segs: [0, 1, 2, 3, 4], interval: 1.7, speed: 100 },
  { name: "바쁜 게이트웨이", segs: [0, 1, 2, 3, 4], interval: 1.45, speed: 112 },
  { name: "인증 필수", segs: [0, 1, 3, 4], interval: 1.35, speed: 118 },
  { name: "관측 강화", segs: [0, 1, 2, 3, 4], interval: 1.25, speed: 124 },
  { name: "배포 직전", segs: [0, 1, 2, 3, 4], interval: 1.12, speed: 132 },
];

type Pkt = {
  x: number;
  needs: number[];
  label: string;
  alive: boolean;
  failed: boolean;
  ok: boolean;
  checked: Set<number>;
};

function playBackend(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  unlockAudio();
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  const pal: Palette = SLATE;
  let sparks: Spark[] = [];
  let level = 0;
  let score = 0;
  let won = false;
  let wasDown = false;
  let t = 0;
  let open: boolean[] = [];
  let packets: Pkt[] = [];
  let passed = 0;
  let failedN = 0;
  let acc = 0;
  let failT = 0;
  let winT = 0;
  let coach = "관을 열어 필요한 미들웨어만 통과시키세요.";

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: TOTAL,
      score,
      status: `통과 ${passed}/8`,
      coach,
    });
  };

  const load = () => {
    const n = BACK_LV[level].segs.length;
    open = Array.from({ length: n }, () => true);
    packets = [];
    passed = 0;
    failedN = 0;
    acc = 0.6;
    failT = 0;
    winT = 0;
    coach = "필요한 관만 열고, 불필요한 관은 닫으세요.";
    emit();
  };

  const makeNeeds = (): number[] => {
    const idxs = BACK_LV[level].segs.map((_, i) => i);
    const count = 1 + Math.floor(Math.random() * Math.min(3, idxs.length));
    const pick = shuffle(idxs).slice(0, count).sort((a, b) => a - b);
    if (pick.length === 0) pick.push(idxs[idxs.length - 1]);
    return pick;
  };

  const spawn = () => {
    const needs = makeNeeds();
    packets.push({
      x: 12,
      needs,
      label: needs.map((i) => ALL_SEGS[BACK_LV[level].segs[i]]).join("·"),
      alive: true,
      failed: false,
      ok: false,
      checked: new Set(),
    });
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    stepSparks(sparks, dt);
    if (UNUSED[0] && hit(-9, 0, 0, 0, 0.1)) t += 0;
    const L = BACK_LV[level];
    const n = L.segs.length;
    const pad = 16;
    const pipeY = h * 0.46;
    const pipeH = 64;
    const gap = 8;
    const pw = (w - pad * 2 - gap * (n - 1)) / n;
    const segs: Rect[] = Array.from({ length: n }, (_, i) => ({
      x: pad + i * (pw + gap),
      y: pipeY,
      w: pw,
      h: pipeH,
    }));

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

    const pressed = view.ptr.down && !wasDown;
    if (pressed && failT <= 0 && winT <= 0 && !won) {
      unlockAudio();
      for (let i = 0; i < segs.length; i++) {
        const r = segs[i];
        if (inRect(view.ptr.x, view.ptr.y, r.x, r.y, r.w, r.h)) {
          open[i] = !open[i];
          tone(open[i] ? 480 : 200, 0.05, "square", 0.04);
        }
      }
    }
    wasDown = view.ptr.down;

    if (failT <= 0 && winT <= 0 && !won) {
      acc += dt;
      if (acc >= L.interval && passed < 8) {
        acc = 0;
        spawn();
      }
      for (const p of packets) {
        if (!p.alive) continue;
        p.x += L.speed * dt;
        for (let i = 0; i < n; i++) {
          const r = segs[i];
          const mid = r.x + r.w / 2;
          if (p.x >= mid && !p.checked.has(i)) {
            p.checked.add(i);
            const need = p.needs.includes(i);
            if (need && !open[i]) {
              p.failed = true;
              p.alive = false;
              failedN += 1;
              coach = `${ALL_SEGS[L.segs[i]]}가 닫혀 필수 단계가 빠졌다.`;
              noiseBurst(0.06, 0.04);
              emit();
            } else if (!need && open[i]) {
              p.failed = true;
              p.alive = false;
              failedN += 1;
              coach = `${ALL_SEGS[L.segs[i]]}는 이 요청에 필요 없다.`;
              noiseBurst(0.06, 0.04);
              emit();
            }
          }
        }
        if (p.alive && p.x > w - 10) {
          p.alive = false;
          p.ok = true;
          passed += 1;
          score += 12;
          tone(540, 0.07, "sine", 0.05);
          if (!rm) burst(sparks, w - 24, pipeY + pipeH / 2, pal.ok, 10);
          if (passed >= 8) {
            score += 50;
            coach = "여덟 패킷이 올바른 순서로 지나갔다.";
            winT = 0.7;
          }
          emit();
        }
      }
      if (failedN >= 5 && winT <= 0) {
        score = Math.max(0, score - 20);
        coach = "너무 많은 요청이 깨졌다. 관을 다시.";
        failT = 0.9;
        emit();
      }
    }

    clear(ctx, w, h, pal);
    grain(ctx, w, h, Math.floor(t * 10), 0.04);
    display(ctx, "미들웨어 관", pad, 28, pal.fg, 26);
    label(ctx, L.name, w - pad, 26, pal.muted, 12, "right");
    label(ctx, `통과 ${passed}/8 · 실패 ${failedN}/5`, pad, 56, pal.muted, 13);

    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, pipeY + pipeH / 2);
    ctx.lineTo(w - 8, pipeY + pipeH / 2);
    ctx.stroke();

    segs.forEach((r, i) => {
      fillRound(ctx, r, 12, open[i] ? "#1e2833" : "#14181f");
      strokeRound(ctx, r, 12, open[i] ? pal.ok : pal.bad, 1.6);
      label(ctx, ALL_SEGS[L.segs[i]], r.x + r.w / 2, r.y + r.h / 2 - 8, pal.fg, 13, "center");
      label(ctx, open[i] ? "열림" : "닫힘", r.x + r.w / 2, r.y + r.h / 2 + 12, open[i] ? pal.ok : pal.bad, 11, "center");
    });

    for (const p of packets) {
      if (!p.alive && !p.ok && !p.failed) continue;
      const y = pipeY - 36;
      const bw = Math.min(128, 28 + p.label.length * 9);
      ctx.globalAlpha = p.alive ? 1 : 0.35;
      ctx.fillStyle = p.failed ? pal.bad : p.ok ? pal.ok : pal.fill;
      roundRect(ctx, p.x - bw / 2, y, bw, 28, 8);
      ctx.fill();
      ctx.strokeStyle = pal.line;
      roundRect(ctx, p.x - bw / 2, y, bw, 28, 8);
      ctx.stroke();
      label(ctx, p.label, p.x, y + 14, pal.fg, 10, "center");
      ctx.globalAlpha = 1;
      if (p.alive) {
        ctx.fillStyle = pal.accent;
        ctx.beginPath();
        ctx.arc(p.x, pipeY + pipeH / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (failT > 0) display(ctx, "거부", w / 2, h * 0.28, pal.bad, 34, "center");
    if (winT > 0) display(ctx, "통과", w / 2, h * 0.28, pal.ok, 34, "center");
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

type Kind = "정상" | "로그인" | "SQL주입" | "XSS" | "스캔" | "위장스캔";
type Rule = { id: string; label: string; on: boolean };
type Fall = { kind: Kind; x: number; y: number; judged: boolean; correct: boolean; a: number };

const SEC_LV = [
  { name: "기본 거절", kinds: ["정상", "SQL주입"] as Kind[], speed: 70, rules: ["allow", "sql"] },
  { name: "로그인 포함", kinds: ["정상", "로그인", "SQL주입"] as Kind[], speed: 78, rules: ["allow", "sql"] },
  { name: "스크립트", kinds: ["정상", "로그인", "SQL주입", "XSS"] as Kind[], speed: 86, rules: ["allow", "sql", "xss"] },
  { name: "정찰", kinds: ["정상", "로그인", "SQL주입", "XSS", "스캔"] as Kind[], speed: 92, rules: ["allow", "sql", "xss", "scan"] },
  { name: "위장", kinds: ["정상", "로그인", "스캔", "위장스캔", "XSS"] as Kind[], speed: 98, rules: ["allow", "sql", "xss", "scan"] },
  { name: "혼선", kinds: ["정상", "로그인", "SQL주입", "XSS", "스캔", "위장스캔"] as Kind[], speed: 110, rules: ["allow", "sql", "xss", "scan"] },
  { name: "피크 트래픽", kinds: ["정상", "로그인", "SQL주입", "XSS", "스캔"] as Kind[], speed: 118, rules: ["allow", "sql", "xss", "scan"] },
  { name: "제로트러스트", kinds: ["정상", "로그인", "SQL주입", "XSS", "스캔", "위장스캔"] as Kind[], speed: 126, rules: ["allow", "sql", "xss", "scan"] },
  { name: "사고 대응", kinds: ["정상", "로그인", "SQL주입", "XSS", "스캔", "위장스캔"] as Kind[], speed: 134, rules: ["allow", "sql", "xss", "scan"] },
];

function isGood(k: Kind) {
  return k === "정상" || k === "로그인";
}

function playSecurity(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  unlockAudio();
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  const pal: Palette = SLATE;
  let sparks: Spark[] = [];
  let level = 0;
  let score = 0;
  let won = false;
  let wasDown = false;
  let t = 0;
  let rules: Rule[] = [];
  let falls: Fall[] = [];
  let queue: Kind[] = [];
  let judged = 0;
  let correctN = 0;
  let acc = 0;
  let failT = 0;
  let winT = 0;
  let coach = "정상은 통과, 공격은 떨어내세요.";

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: TOTAL,
      score,
      status: `${judged}/10 · 정확 ${judged ? Math.round((correctN / judged) * 100) : 0}%`,
      coach,
    });
  };

  const load = () => {
    const L = SEC_LV[level];
    const all: Rule[] = [
      { id: "allow", label: "허용:정상", on: false },
      { id: "sql", label: "차단:SQL", on: false },
      { id: "xss", label: "차단:XSS", on: false },
      { id: "scan", label: "차단:스캔", on: false },
    ];
    rules = all.filter((r) => L.rules.includes(r.id));
    const bag: Kind[] = [];
    while (bag.length < 10) bag.push(L.kinds[bag.length % L.kinds.length]);
    queue = shuffle(bag);
    falls = [];
    judged = 0;
    correctN = 0;
    acc = 0.35;
    failT = 0;
    winT = 0;
    coach = "규칙을 켜고, 패킷이 선에 닿기 전에 판단하세요.";
    emit();
  };

  const apply = (k: Kind): { allow: boolean } => {
    const allowOn = rules.find((r) => r.id === "allow")?.on ?? false;
    const sql = rules.find((r) => r.id === "sql")?.on ?? false;
    const xss = rules.find((r) => r.id === "xss")?.on ?? false;
    const scan = rules.find((r) => r.id === "scan")?.on ?? false;
    if (k === "정상" || k === "로그인") return { allow: allowOn };
    if (k === "SQL주입") return { allow: !sql };
    if (k === "XSS") return { allow: !xss };
    if (k === "스캔" || k === "위장스캔") return { allow: !scan };
    return { allow: false };
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    stepSparks(sparks, dt);
    const L = SEC_LV[level];
    const pad = 14;
    const lineY = h * 0.62;
    const chipH = 48;
    const chipY = h - pad - chipH;
    const gap = 8;
    const cw = (w - pad * 2 - gap * (rules.length - 1)) / Math.max(1, rules.length);
    const chips: Rect[] = rules.map((_, i) => ({ x: pad + i * (cw + gap), y: chipY, w: cw, h: chipH }));

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

    const pressed = view.ptr.down && !wasDown;
    if (pressed && failT <= 0 && winT <= 0 && !won) {
      unlockAudio();
      for (let i = 0; i < chips.length; i++) {
        const r = chips[i];
        if (inRect(view.ptr.x, view.ptr.y, r.x, r.y, r.w, r.h)) {
          rules[i].on = !rules[i].on;
          tone(rules[i].on ? 500 : 220, 0.05, "square", 0.04);
        }
      }
    }
    wasDown = view.ptr.down;

    if (failT <= 0 && winT <= 0 && !won) {
      acc += dt;
      if (acc >= 0.85 && queue.length) {
        acc = 0;
        const kind = queue.shift()!;
        falls.push({ kind, x: w * (0.18 + Math.random() * 0.64), y: 58, judged: false, correct: false, a: 1 });
      }
      for (const f of falls) {
        if (f.judged) {
          f.y += 30 * dt;
          f.a = Math.max(0, f.a - dt * 1.4);
          continue;
        }
        f.y += L.speed * dt;
        if (f.y >= lineY) {
          const { allow } = apply(f.kind);
          const shouldAllow = isGood(f.kind);
          f.judged = true;
          f.correct = allow === shouldAllow;
          judged += 1;
          if (f.correct) {
            correctN += 1;
            score += 10;
            tone(shouldAllow ? 560 : 240, 0.06, "sine", 0.04);
            if (!rm) burst(sparks, f.x, lineY, shouldAllow ? pal.ok : pal.warn, 8);
          } else {
            noiseBurst(0.05, 0.04);
            coach =
              f.kind === "위장스캔"
                ? "정상처럼 보이는 스캔이다. 차단:스캔."
                : allow
                  ? `${f.kind}을 잘못 통과시켰다.`
                  : `${f.kind}을 잘못 막았다.`;
          }
          if (judged >= 10) {
            const accu = correctN / 10;
            if (accu >= 0.8) {
              score += 40 + correctN * 2;
              coach = `정확도 ${Math.round(accu * 100)}%. 검문이 섰다.`;
              winT = 0.75;
            } else {
              score = Math.max(0, score - 20);
              coach = `정확도 ${Math.round(accu * 100)}%. 80%가 필요하다.`;
              failT = 0.95;
            }
          }
          emit();
        }
      }
    }

    clear(ctx, w, h, pal);
    grain(ctx, w, h, Math.floor(t * 11), 0.04);
    display(ctx, "패킷 검문", pad, 28, pal.fg, 26);
    label(ctx, L.name, w - pad, 26, pal.muted, 12, "right");

    ctx.strokeStyle = pal.accent;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(12, lineY);
    ctx.lineTo(w - 12, lineY);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, "검문선", 16, lineY - 12, pal.muted, 11);

    for (const f of falls) {
      if (f.a <= 0) continue;
      ctx.globalAlpha = f.a;
      const lab = f.kind === "위장스캔" ? "정상?" : f.kind;
      const bw = Math.max(72, lab.length * 14);
      ctx.fillStyle = f.judged ? (f.correct ? pal.ok : pal.bad) : pal.fill;
      roundRect(ctx, f.x - bw / 2, f.y - 16, bw, 32, 8);
      ctx.fill();
      ctx.strokeStyle = f.kind === "위장스캔" ? pal.warn : pal.line;
      roundRect(ctx, f.x - bw / 2, f.y - 16, bw, 32, 8);
      ctx.stroke();
      label(ctx, lab, f.x, f.y, pal.fg, 12, "center");
      ctx.globalAlpha = 1;
    }

    chips.forEach((r, i) => {
      fillRound(ctx, r, 12, rules[i].on ? "#243040" : pal.fill);
      strokeRound(ctx, r, 12, rules[i].on ? pal.ok : pal.line, rules[i].on ? 1.6 : 1);
      label(ctx, rules[i].label, r.x + r.w / 2, r.y + r.h / 2, rules[i].on ? pal.ok : pal.muted, 13, "center");
    });

    if (failT > 0) display(ctx, "누수", w / 2, h * 0.36, pal.bad, 34, "center");
    if (winT > 0) display(ctx, "봉쇄", w / 2, h * 0.36, pal.ok, 34, "center");
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
