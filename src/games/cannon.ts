import { chapterAt } from "@/lib/games/curriculum";
import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import {
  bindCanvas,
  reducedMotion,
  startLoop,
  type GameHandle,
  type GameHooks,
} from "@/lib/games/runtime";

type Target = { x: number; y: number; r: number; vx: number; hit: boolean; wob: number };
type Shot = { x: number; y: number; vx: number; vy: number; alive: boolean };
type Dust = { x: number; y: number; vx: number; vy: number; life: number };

type Level = {
  name: string;
  wind: number;
  shots: number;
  targets: { x: number; y: number; r: number; vx: number }[];
};

const LEVELS: Level[] = [
  { name: "가까운 상자", wind: 0, shots: 4, targets: [{ x: 0.72, y: 0.18, r: 28, vx: 0 }] },
  { name: "먼 사거리", wind: 0, shots: 4, targets: [{ x: 0.86, y: 0.16, r: 26, vx: 0 }] },
  { name: "두 표적", wind: 0, shots: 5, targets: [{ x: 0.58, y: 0.18, r: 24, vx: 0 }, { x: 0.82, y: 0.34, r: 22, vx: 0 }] },
  { name: "맞바람", wind: -55, shots: 5, targets: [{ x: 0.78, y: 0.22, r: 26, vx: 0 }] },
  { name: "순풍 + 높이", wind: 40, shots: 5, targets: [{ x: 0.74, y: 0.48, r: 24, vx: 0 }] },
  { name: "움직이는 표적", wind: 0, shots: 6, targets: [{ x: 0.7, y: 0.22, r: 24, vx: 90 }] },
  { name: "바람과 이동", wind: -35, shots: 6, targets: [{ x: 0.62, y: 0.4, r: 22, vx: 70 }, { x: 0.84, y: 0.18, r: 20, vx: -50 }] },
  { name: "제한 사격", wind: 20, shots: 3, targets: [{ x: 0.56, y: 0.46, r: 20, vx: 60 }, { x: 0.86, y: 0.2, r: 20, vx: 0 }] },
  { name: "핵의 각", wind: -20, shots: 3, targets: [{ x: 0.5, y: 0.52, r: 18, vx: 80 }, { x: 0.78, y: 0.28, r: 18, vx: -40 }, { x: 0.9, y: 0.16, r: 16, vx: 0 }] },
];

export function startCannon(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const view = bindCanvas(canvas);
  const rm = reducedMotion();
  let level = 0;
  let score = 0;
  let shotsLeft = 0;
  let targets: Target[] = [];
  let shot: Shot | null = null;
  let dust: Dust[] = [];
  let aiming = false;
  let pullX = 0;
  let pullY = 0;
  let wind = 0;
  let trauma = 0;
  let groundHitCoach = "";
  let status = "";
  let t = 0;
  let wasDown = false;

  const cannon = () => {
    const { w, h } = view.size();
    return { x: w * 0.1, y: h * 0.82 };
  };

  const load = () => {
    const L = LEVELS[level];
    const { w, h } = view.size();
    wind = L.wind;
    shotsLeft = L.shots;
    shot = null;
    aiming = false;
    groundHitCoach = "";
    const ch = chapterAt("cannon", level + 1);
    status = ch?.name ?? L.name;
    groundHitCoach = ch?.teach ?? L.name;
    targets = L.targets.map((tg) => ({
      x: tg.x * w,
      y: h - tg.y * h,
      r: tg.r,
      vx: tg.vx,
      hit: false,
      wob: 0,
    }));
    emit();
  };

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: LEVELS.length,
      score,
      shots: shotsLeft,
      status,
      coach: groundHitCoach || chapterAt("cannon", level + 1)?.teach || "",
    });
  };

  const burst = (x: number, y: number, n: number, spd: number) => {
    if (rm) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = spd * (0.4 + Math.random());
      dust.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.5 + Math.random() * 0.4 });
    }
  };

  const fire = () => {
    if (shot?.alive || shotsLeft <= 0) return;
    const c = cannon();
    const dx = c.x - pullX;
    const dy = c.y - pullY;
    const mag = Math.hypot(dx, dy);
    if (mag < 18) return;
    const power = Math.min(920, 180 + mag * 2.4);
    const ux = dx / mag;
    const uy = dy / mag;
    shot = { x: c.x, y: c.y, vx: ux * power, vy: uy * power, alive: true };
    shotsLeft -= 1;
    unlockAudio();
    tone(180, 0.08, "square", 0.05);
    noiseBurst(0.05, 0.03);
    emit();
  };

  const advance = () => {
    if (level + 1 >= LEVELS.length) {
      hooks.onClear(score);
      return;
    }
    level += 1;
    load();
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    trauma = Math.max(0, trauma - dt * 2.2);
    const c = cannon();
    const ground = h * 0.88;

    if (view.ptr.down && !shot?.alive) {
      aiming = true;
      pullX = view.ptr.x;
      pullY = view.ptr.y;
    } else if (aiming && !view.ptr.down && wasDown) {
      fire();
      aiming = false;
    }
    if (!view.ptr.down) aiming = false;
    wasDown = view.ptr.down;

    for (const tg of targets) {
      if (tg.hit) continue;
      tg.x += tg.vx * dt;
      const minX = w * 0.42;
      const maxX = w * 0.92;
      if (tg.x < minX || tg.x > maxX) {
        tg.vx *= -1;
        tg.x = Math.min(maxX, Math.max(minX, tg.x));
      }
      tg.wob += dt * 6;
    }

    if (shot?.alive) {
      shot.vx += wind * dt;
      if (level === 2) {
        shot.vx *= 1 - 0.55 * dt;
        shot.vy *= 1 - 0.55 * dt;
      }
      shot.vy += 520 * dt;
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      for (const tg of targets) {
        if (tg.hit) continue;
        if (Math.hypot(shot.x - tg.x, shot.y - tg.y) < tg.r + 8) {
          tg.hit = true;
          shot.alive = false;
          score += 120 + shotsLeft * 15;
          trauma = Math.min(1, trauma + 0.45);
          burst(tg.x, tg.y, 18, 160);
          unlockAudio();
          tone(620, 0.09, "triangle", 0.07);
          tone(930, 0.12, "sine", 0.04);
          groundHitCoach = chapterAt("cannon", level + 1)?.teach ?? "명중.";
          status = chapterAt("cannon", level + 1)?.name ?? LEVELS[level].name;
          emit();
        }
      }
      if (shot.alive && (shot.y > ground || shot.x > w + 40 || shot.x < -40 || shot.y < -80)) {
        shot.alive = false;
        const short = shot.x < w * 0.55;
        const ch = chapterAt("cannon", level + 1);
        groundHitCoach = short
          ? ch?.teach ?? "짧았습니다. 45° 근처에서 사거리가 가장 깁니다."
          : wind < 0
            ? "맞바람이 수평 속도를 깎습니다."
            : ch?.teach ?? "길었습니다. 힘을 줄이거나 각을 낮추세요.";
        burst(shot.x, Math.min(shot.y, ground), 10, 80);
        unlockAudio();
        noiseBurst(0.07, 0.035);
        if (shotsLeft <= 0 && targets.some((tg) => !tg.hit)) {
          status = "탄약 소진 — 다시 이 스테이지";
          setTimeout(load, 700);
        }
        emit();
      }
    }

    if (targets.length && targets.every((tg) => tg.hit) && !shot?.alive) {
      score += 80;
      emit();
      advance();
    }

    dust = dust.filter((d) => {
      d.life -= dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 220 * dt;
      return d.life > 0;
    });

    const shake = rm ? 0 : trauma * trauma;
    const ox = (Math.random() * 2 - 1) * 10 * shake;
    const oy = (Math.random() * 2 - 1) * 8 * shake;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(ox, oy);

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#1a2230");
    sky.addColorStop(0.55, "#141820");
    sky.addColorStop(1, "#101218");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(236,232,225,0.06)";
    for (let i = 0; i < 28; i++) {
      const sx = ((i * 97) % w);
      const sy = ((i * 53) % (h * 0.55));
      ctx.fillRect(sx, sy, 1.4, 1.4);
    }

    ctx.fillStyle = "#2a241c";
    ctx.fillRect(0, ground, w, h - ground);
    ctx.fillStyle = "#3a3228";
    ctx.fillRect(0, ground, w, 3);

    if (Math.abs(wind) > 1) {
      ctx.strokeStyle = "rgba(236,232,225,0.18)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = 28 + i * 16;
        const phase = t * wind * 0.04 + i;
        ctx.beginPath();
        ctx.moveTo(w * 0.35, y);
        ctx.lineTo(w * 0.35 + Math.sign(wind) * 70 + Math.sin(phase) * 8, y + Math.sin(phase * 1.4) * 3);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(236,232,225,0.45)";
      ctx.font = "500 12px Pretendard, sans-serif";
      ctx.fillText(wind < 0 ? "WIND  ←" : "WIND  →", w * 0.35, 18);
    }

    if (aiming) {
      const dx = c.x - pullX;
      const dy = c.y - pullY;
      const mag = Math.hypot(dx, dy);
      const deg = Math.round((Math.atan2(-(c.y - pullY), c.x - pullX) * 180) / Math.PI);
      const pe = Math.min(1, mag / 220);
      ctx.fillStyle = "rgba(236,232,225,0.7)";
      ctx.font = "500 12px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`각 ${deg}° · 탄성 ${Math.round(pe * 100)}`, 16, 18);
      if (level === 8) ctx.fillText("수평 최대 ≈ 45°", 16, 36);
      const power = Math.min(920, 180 + mag * 2.4);
      const ux = mag > 1 ? dx / mag : 1;
      const uy = mag > 1 ? dy / mag : -1;
      let px = c.x;
      let py = c.y;
      let vx = ux * power;
      let vy = uy * power;
      ctx.fillStyle = "rgba(215,210,200,0.55)";
      for (let i = 0; i < 18; i++) {
        vx += wind * 0.035;
        vy += 520 * 0.035;
        px += vx * 0.035;
        py += vy * 0.035;
        const r = 2.2 - i * 0.08;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.8, r), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const tg of targets) {
      ctx.save();
      ctx.translate(tg.x, tg.y + Math.sin(tg.wob) * 1.5);
      ctx.fillStyle = tg.hit ? "rgba(143,191,154,0.25)" : "#8a5a3a";
      rounded(ctx, -tg.r, -tg.r, tg.r * 2, tg.r * 2, 5);
      ctx.fill();
      ctx.strokeStyle = tg.hit ? "rgba(143,191,154,0.7)" : "#c4a07a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-tg.r + 4, -tg.r + 4);
      ctx.lineTo(tg.r - 4, tg.r - 4);
      ctx.moveTo(tg.r - 4, -tg.r + 4);
      ctx.lineTo(-tg.r + 4, tg.r - 4);
      ctx.strokeStyle = "rgba(12,13,16,0.35)";
      ctx.stroke();
      ctx.restore();
    }

    const ang = aiming ? Math.atan2(c.y - pullY, c.x - pullX) : -0.35;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = "#2c241c";
    ctx.beginPath();
    ctx.ellipse(0, 16, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(ang);
    const barrel = ctx.createLinearGradient(0, -10, 0, 10);
    barrel.addColorStop(0, "#c4b8a8");
    barrel.addColorStop(0.5, "#6a5c4e");
    barrel.addColorStop(1, "#3a322c");
    ctx.fillStyle = barrel;
    rounded(ctx, -12, -9, 56, 18, 6);
    ctx.fill();
    ctx.fillStyle = "#1c1814";
    ctx.fillRect(40, -6, 8, 12);
    ctx.restore();

    if (shot?.alive) {
      ctx.fillStyle = "#ece8e1";
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(236,232,225,0.25)";
      ctx.beginPath();
      ctx.arc(shot.x - shot.vx * 0.03, shot.y - shot.vy * 0.03, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const d of dust) {
      ctx.globalAlpha = Math.max(0, d.life);
      ctx.fillStyle = "#d7c4a8";
      ctx.fillRect(d.x, d.y, 2.4, 2.4);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  };

  load();
  const stop = startLoop(tick);
  return {
    destroy: () => {
      stop();
      view.destroy();
    },
    restart: () => {
      level = 0;
      score = 0;
      load();
    },
  };
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
