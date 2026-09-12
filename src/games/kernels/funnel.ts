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
const UNUSED = [PAPER, SLATE, CLAY];

type Rect = { x: number; y: number; w: number; h: number };
type TileKind = "광고" | "랜딩" | "결제" | "리타겟" | "배너";

type Tile = {
  id: number;
  kind: TileKind;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  slot: number | null;
};

type Dot = {
  x: number;
  y: number;
  vy: number;
  stage: number;
  alive: boolean;
  converted: boolean;
  lost: boolean;
  a: number;
};

const WANT: TileKind[] = ["광고", "랜딩", "결제"];

const LEVELS = [
  { name: "인지", need: 12, spawn: 0.85, cap: 40 },
  { name: "고려", need: 12, spawn: 0.72, cap: 40 },
  { name: "좁아지는 목", need: 16, spawn: 0.7, cap: 40 },
  { name: "빠른 유입", need: 16, spawn: 0.58, cap: 40 },
  { name: "전환 압박", need: 20, spawn: 0.55, cap: 40 },
  { name: "예산의 끝", need: 20, spawn: 0.46, cap: 40 },
  { name: "분석", need: 22, spawn: 0.5, cap: 38 },
  { name: "그로스", need: 24, spawn: 0.44, cap: 36 },
  { name: "새는 단", need: 26, spawn: 0.4, cap: 34 },
];

export function play(_id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
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
  let tiles: Tile[] = [];
  let dots: Dot[] = [];
  let spawned = 0;
  let converted = 0;
  let acc = 0;
  let nextId = 1;
  let drag: Tile | null = null;
  let dragOffX = 0;
  let dragOffY = 0;
  let failT = 0;
  let winT = 0;
  let coach = "타일을 단에 놓아 떨어지는 방문객을 받으세요.";
  const MAX_PLACE = 8;
  const STAGE_SLOTS = 2;

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: TOTAL,
      score,
      status: `${converted}/${LEVELS[level].need} · 유입 ${spawned}/${LEVELS[level].cap}`,
      coach,
    });
  };

  const kindPool = (): TileKind[] => shuffle(["광고", "광고", "랜딩", "랜딩", "결제", "결제", "리타겟", "배너"] as TileKind[]);

  const placeCount = () => tiles.filter((tl) => tl.slot !== null).length;

  const load = () => {
    tiles = [];
    dots = [];
    spawned = 0;
    converted = 0;
    acc = 0.4;
    drag = null;
    failT = 0;
    winT = 0;
    nextId = 1;
    coach = `${LEVELS[level].need}명 전환. 유입 ${LEVELS[level].cap}명 전에.`;
    emit();
  };

  const stageRects = (w: number, h: number): Rect[] => {
    const top = 78;
    const bot = h - 118;
    const span = bot - top;
    return [0, 1, 2].map((i) => {
      const y = top + span * (0.18 + i * 0.26);
      const inset = 18 + i * 22;
      return { x: inset, y, w: w - inset * 2, h: 52 };
    });
  };

  const slotRect = (stages: Rect[], slot: number): Rect => {
    const si = Math.floor(slot / STAGE_SLOTS);
    const k = slot % STAGE_SLOTS;
    const st = stages[si];
    const sw = (st.w - 16) / STAGE_SLOTS;
    return { x: st.x + 8 + k * sw, y: st.y + 6, w: sw - 8, h: st.h - 12 };
  };

  const layoutTray = (w: number, h: number) => {
    if (tiles.length === 0) {
      const kinds = kindPool();
      const n = kinds.length;
      const tw = Math.min(72, (w - 24) / n - 4);
      kinds.forEach((k, i) => {
        const x = 12 + i * (tw + 4) + tw / 2;
        const y = h - 52;
        tiles.push({ id: nextId++, kind: k, x, y, homeX: x, homeY: y, slot: null });
      });
      return;
    }
    const free = tiles.filter((tl) => tl.slot === null && tl !== drag);
    const n = Math.max(1, free.length);
    const tw = Math.min(72, (w - 24) / n - 4);
    free.forEach((tl, i) => {
      tl.homeX = 12 + i * (tw + 4) + tw / 2;
      tl.homeY = h - 52;
      if (!drag || drag.id !== tl.id) {
        tl.x = tl.homeX;
        tl.y = tl.homeY;
      }
    });
    const stages = stageRects(w, h);
    for (const tl of tiles) {
      if (tl.slot === null || tl === drag) continue;
      const r = slotRect(stages, tl.slot);
      tl.x = r.x + r.w / 2;
      tl.y = r.y + r.h / 2;
    }
  };

  const chanceAt = (stage: number) => {
    let p = 0.2;
    for (const tl of tiles) {
      if (tl.slot === null) continue;
      if (Math.floor(tl.slot / STAGE_SLOTS) !== stage) continue;
      if (tl.kind === WANT[stage]) p += 0.42;
      else if (tl.kind === "리타겟") p += 0.12;
      else if (tl.kind === "배너") p -= 0.18;
      else p += 0.04;
    }
    return Math.max(0.06, Math.min(0.92, p));
  };

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    t += dt;
    stepSparks(sparks, dt);
    if (UNUSED[0] && hit(-9, 0, 0, 0, 0.1)) t += 0;
    const L = LEVELS[level];
    const stages = stageRects(w, h);
    layoutTray(w, h);

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

    const tw = 64;
    const th = 44;
    if (view.ptr.down) {
      if (!wasDown && failT <= 0 && winT <= 0 && !won) {
        unlockAudio();
        for (let i = tiles.length - 1; i >= 0; i--) {
          const tl = tiles[i];
          if (inRect(view.ptr.x, view.ptr.y, tl.x - tw / 2, tl.y - th / 2, tw, th)) {
            drag = tl;
            dragOffX = view.ptr.x - tl.x;
            dragOffY = view.ptr.y - tl.y;
            break;
          }
        }
      }
      if (drag) {
        drag.x = view.ptr.x - dragOffX;
        drag.y = view.ptr.y - dragOffY;
      }
    } else if (drag) {
      let placed = false;
      for (let s = 0; s < 6; s++) {
        const r = slotRect(stages, s);
        if (inRect(drag.x, drag.y, r.x, r.y, r.w, r.h)) {
          const occupied = tiles.find((tl) => tl.slot === s && tl.id !== drag!.id);
          if (occupied) occupied.slot = null;
          if (drag.slot === null && placeCount() >= MAX_PLACE) {
            coach = "예산 8칸이 가득하다.";
          } else {
            drag.slot = s;
            drag.x = r.x + r.w / 2;
            drag.y = r.y + r.h / 2;
            placed = true;
            tone(400 + s * 40, 0.06, "triangle", 0.045);
          }
        }
      }
      if (!placed) {
        drag.slot = null;
        drag.x = drag.homeX;
        drag.y = drag.homeY;
      }
      drag = null;
      emit();
    }
    wasDown = view.ptr.down;

    if (failT <= 0 && winT <= 0 && !won) {
      acc += dt;
      if (acc >= L.spawn && spawned < L.cap) {
        acc = 0;
        spawned += 1;
        dots.push({
          x: w * 0.5 + (Math.random() - 0.5) * w * 0.36,
          y: 58,
          vy: 70 + level * 8 + Math.random() * 20,
          stage: 0,
          alive: true,
          converted: false,
          lost: false,
          a: 1,
        });
        if (spawned === L.cap) emit();
      }
      for (const d of dots) {
        if (!d.alive) {
          d.a = Math.max(0, d.a - dt * 2.2);
          continue;
        }
        d.y += d.vy * dt;
        if (d.stage < 3) {
          const st = stages[d.stage];
          if (d.y >= st.y + 8) {
            if (Math.random() < chanceAt(d.stage)) {
              d.stage += 1;
              d.x += (w / 2 - d.x) * 0.18;
              tone(320 + d.stage * 80, 0.04, "sine", 0.03);
              if (d.stage >= 3) {
                d.converted = true;
                d.alive = false;
                converted += 1;
                score += 8;
                if (!rm) burst(sparks, d.x, st.y + st.h, pal.ok, 8);
                if (converted >= L.need) {
                  score += 60;
                  coach = `${L.name} 깔때기가 열렸다.`;
                  winT = 0.7;
                } else coach = `전환 ${converted}/${L.need}`;
                emit();
              }
            } else {
              d.lost = true;
              d.alive = false;
              d.vy = 20;
              noiseBurst(0.04, 0.025);
            }
          }
        }
      }
      if (spawned >= L.cap && converted < L.need && dots.every((d) => !d.alive) && winT <= 0) {
        score = Math.max(0, score - 20);
        coach = "유입이 끝났다. 단을 다시 짜세요.";
        failT = 0.9;
        emit();
      }
    }

    clear(ctx, w, h, pal);
    grain(ctx, w, h, Math.floor(t * 12), 0.04);
    display(ctx, "전환 깔때기", 16, 28, pal.fg, 26);
    label(ctx, L.name, w - 16, 26, pal.muted, 12, "right");

    ctx.fillStyle = "rgba(236,232,225,0.04)";
    ctx.beginPath();
    ctx.moveTo(20, 70);
    ctx.lineTo(w - 20, 70);
    ctx.lineTo(w * 0.62, h - 122);
    ctx.lineTo(w * 0.38, h - 122);
    ctx.closePath();
    ctx.fill();

    const names = ["인지 · 광고", "고려 · 랜딩", "행동 · 결제"];
    stages.forEach((st, i) => {
      ctx.fillStyle = pal.fill;
      roundRect(ctx, st.x, st.y, st.w, st.h, 12);
      ctx.fill();
      ctx.strokeStyle = pal.line;
      ctx.stroke();
      label(ctx, names[i], st.x + 10, st.y - 10, pal.muted, 11);
      label(ctx, `${Math.round(chanceAt(i) * 100)}%`, st.x + st.w - 8, st.y - 10, pal.accent, 11, "right");
      for (let k = 0; k < STAGE_SLOTS; k++) {
        const r = slotRect(stages, i * STAGE_SLOTS + k);
        ctx.strokeStyle = pal.line;
        ctx.setLineDash([4, 4]);
        roundRect(ctx, r.x, r.y, r.w, r.h, 8);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    for (const d of dots) {
      if (d.a <= 0) continue;
      ctx.globalAlpha = d.a;
      ctx.fillStyle = d.converted ? pal.ok : d.lost ? pal.bad : pal.accent;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const drawTile = (tl: Tile) => {
      const col = tl.kind === "배너" ? pal.bad : tl.kind === "리타겟" ? pal.warn : pal.accent;
      ctx.fillStyle = pal.fill;
      roundRect(ctx, tl.x - tw / 2, tl.y - th / 2, tw, th, 8);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.4;
      roundRect(ctx, tl.x - tw / 2, tl.y - th / 2, tw, th, 8);
      ctx.stroke();
      ctx.lineWidth = 1;
      label(ctx, tl.kind, tl.x, tl.y, pal.fg, 12, "center");
    };
    for (const tl of tiles) if (tl !== drag) drawTile(tl);
    if (drag) drawTile(drag);

    ctx.fillStyle = pal.line;
    roundRect(ctx, 16, h - 22, w - 32, 6, 3);
    ctx.fill();
    ctx.fillStyle = pal.ok;
    roundRect(ctx, 16, h - 22, (w - 32) * Math.min(1, converted / L.need), 6, 3);
    ctx.fill();

    if (failT > 0) display(ctx, "유실", w / 2, h * 0.36, pal.bad, 34, "center");
    if (winT > 0) display(ctx, "전환", w / 2, h * 0.36, pal.ok, 34, "center");
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
      tiles = [];
      load();
    },
    destroy: () => {
      stop();
      view.destroy();
    },
  };
}
