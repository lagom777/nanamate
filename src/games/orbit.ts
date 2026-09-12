import { tone, unlockAudio } from "@/lib/games/audio";
import {
  bindCanvas,
  reducedMotion,
  startLoop,
  type GameHandle,
  type GameHooks,
} from "@/lib/games/runtime";

type Level = { name: string; mass: number; r0: number; hold: number };

const LEVELS: Level[] = [
  { name: "저궤도", mass: 14000, r0: 0.28, hold: 5.5 },
  { name: "조금 더 멀리", mass: 16000, r0: 0.34, hold: 6 },
  { name: "무거운 행성", mass: 22000, r0: 0.3, hold: 6 },
  { name: "얇은 대기권", mass: 15000, r0: 0.26, hold: 7 },
  { name: "넓은 고리", mass: 18000, r0: 0.4, hold: 7 },
  { name: "정밀 원궤도", mass: 20000, r0: 0.32, hold: 8 },
  { name: "관측 창", mass: 17000, r0: 0.36, hold: 8 },
  { name: "호만 전이", mass: 21000, r0: 0.42, hold: 8.5 },
  { name: "탐사 진입", mass: 24000, r0: 0.3, hold: 9 },
];

export function startOrbit(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  let level = 0;
  let score = 0;
  let launched = false;
  let crashed = false;
  let escaped = false;
  let hold = 0;
  let sx = 0;
  let sy = 0;
  let vx = 0;
  let vy = 0;
  let trail: { x: number; y: number }[] = [];
  let aiming = false;
  let ax = 0;
  let ay = 0;
  let t = 0;
  let wasDown = false;
  let coach = "";
  let stars: { x: number; y: number; s: number }[] = [];

  const planetR = () => Math.min(view.size().w, view.size().h) * 0.09;
  const cx = () => view.size().w * 0.5;
  const cy = () => view.size().h * 0.52;

  const resetPos = () => {
    const L = LEVELS[level];
    const r = Math.min(view.size().w, view.size().h) * L.r0 + planetR();
    sx = cx() - r;
    sy = cy();
    vx = 0;
    vy = 0;
    launched = false;
    crashed = false;
    escaped = false;
    hold = 0;
    trail = [];
    coach = "접선 방향으로 끌어 원궤도 속력을 맞추세요.";
    emit();
  };

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: LEVELS.length,
      score,
      status: LEVELS[level].name,
      coach,
    });
  };

  const circularSpeed = () => {
    const L = LEVELS[level];
    const r = Math.hypot(sx - cx(), sy - cy());
    return Math.sqrt(L.mass / Math.max(40, r));
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx) return;
    t += dt;
    if (stars.length === 0) {
      stars = Array.from({ length: 80 }, () => ({
        x: Math.random(),
        y: Math.random(),
        s: 0.5 + Math.random() * 1.4,
      }));
    }

    const pr = planetR();
    const L = LEVELS[level];

    if (!launched) {
      if (view.ptr.down) {
        aiming = true;
        ax = view.ptr.x;
        ay = view.ptr.y;
      } else if (aiming && wasDown) {
        const dx = ax - sx;
        const dy = ay - sy;
        const mag = Math.hypot(dx, dy);
        if (mag > 12) {
          const k = 2.15;
          vx = dx * k;
          vy = dy * k;
          launched = true;
          unlockAudio();
          tone(240, 0.1, "sine", 0.06);
          coach = "궤도 유지 중…";
          emit();
        }
        aiming = false;
      }
      if (!view.ptr.down) aiming = false;
    }
    wasDown = view.ptr.down;

    if (launched && !crashed && !escaped) {
      const dx = cx() - sx;
      const dy = cy() - sy;
      const r = Math.hypot(dx, dy);
      const acc = L.mass / Math.max(80, r * r);
      vx += (dx / r) * acc * dt;
      vy += (dy / r) * acc * dt;
      sx += vx * dt;
      sy += vy * dt;
      trail.push({ x: sx, y: sy });
      if (trail.length > 220) trail.shift();

      const r0 = Math.min(w, h) * L.r0 + pr;
      if (r < pr + 6) {
        crashed = true;
        coach = "추락. 접선 속력이 √(GM/r)보다 작았습니다.";
        unlockAudio();
        tone(110, 0.2, "sawtooth", 0.05);
        emit();
        setTimeout(resetPos, 900);
      } else if (r > r0 * 3.4) {
        escaped = true;
        coach = "탈출. 속력이 너무 큽니다. 원을 그리려면 더 약하게.";
        unlockAudio();
        tone(160, 0.16, "square", 0.04);
        emit();
        setTimeout(resetPos, 900);
      } else if (r > r0 * 0.82 && r < r0 * 1.22) {
        hold += dt;
        if (hold >= L.hold) {
          score += 140 + Math.round(hold * 8);
          coach = "원궤도 확보.";
          unlockAudio();
          tone(520, 0.1, "sine", 0.06);
          tone(780, 0.14, "triangle", 0.04);
          emit();
          if (level + 1 >= LEVELS.length) hooks.onClear(score);
          else {
            level += 1;
            resetPos();
          }
        }
      } else {
        hold = Math.max(0, hold - dt * 0.35);
      }
    }

    ctx.fillStyle = "#07080c";
    ctx.fillRect(0, 0, w, h);
    for (const s of stars) {
      ctx.globalAlpha = 0.35 + 0.4 * Math.sin(t * 1.2 + s.x * 8);
      ctx.fillStyle = "#ece8e1";
      ctx.fillRect(s.x * w, s.y * h, s.s, s.s);
    }
    ctx.globalAlpha = 1;

    const glow = ctx.createRadialGradient(cx(), cy(), pr * 0.4, cx(), cy(), pr * 3.2);
    glow.addColorStop(0, "rgba(110,140,180,0.18)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx(), cy(), pr * 3.2, 0, Math.PI * 2);
    ctx.fill();

    const body = ctx.createRadialGradient(cx() - pr * 0.3, cy() - pr * 0.3, 4, cx(), cy(), pr);
    body.addColorStop(0, "#8aa0b8");
    body.addColorStop(0.55, "#3d4d62");
    body.addColorStop(1, "#1a222c");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx(), cy(), pr, 0, Math.PI * 2);
    ctx.fill();

    const r0 = Math.min(w, h) * L.r0 + pr;
    ctx.setLineDash(rm ? [] : [5, 7]);
    ctx.strokeStyle = "rgba(236,232,225,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx(), cy(), r0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(143,191,154,0.22)";
    ctx.beginPath();
    ctx.arc(cx(), cy(), r0 * 0.82, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx(), cy(), r0 * 1.22, 0, Math.PI * 2);
    ctx.stroke();

    if (trail.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(200,214,226,0.55)";
      ctx.lineWidth = 1.4;
      ctx.moveTo(trail[0].x, trail[0].y);
      for (const p of trail) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    if (!launched && aiming) {
      ctx.strokeStyle = "rgba(236,232,225,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ax, ay);
      ctx.stroke();
      const vcirc = circularSpeed();
      ctx.fillStyle = "rgba(236,232,225,0.5)";
      ctx.font = "500 11px 'IBM Plex Mono', monospace";
      const mag = Math.hypot(ax - sx, ay - sy) * 2.15;
      ctx.fillText(`v ${mag.toFixed(0)}  ·  circ ${vcirc.toFixed(0)}`, 16, h - 18);
    }

    ctx.fillStyle = "#ece8e1";
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(236,232,225,0.35)";
    ctx.beginPath();
    ctx.arc(sx, sy, 9, 0, Math.PI * 2);
    ctx.stroke();

    if (launched && hold > 0) {
      const p = Math.min(1, hold / L.hold);
      ctx.fillStyle = "rgba(236,232,225,0.12)";
      ctx.fillRect(w * 0.3, 16, w * 0.4, 4);
      ctx.fillStyle = "#c5cfd8";
      ctx.fillRect(w * 0.3, 16, w * 0.4 * p, 4);
    }
  };

  resetPos();
  const stop = startLoop(tick);
  return {
    destroy: () => {
      stop();
      view.destroy();
    },
    restart: () => {
      level = 0;
      score = 0;
      resetPos();
    },
  };
}
