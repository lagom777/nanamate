import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  INK,
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

type Kind = "H" | "O" | "C" | "N" | "Na" | "Cl";

type Atom = {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  used: number;
  r: number;
  flash: number;
};

type Bond = { a: number; b: number; order: number };

type Level = {
  name: string;
  formula: string;
  atoms: Kind[];
  coach: string;
  allow: [Kind, Kind][];
};

const VAL: Record<Kind, number> = { H: 1, O: 2, C: 4, N: 3, Na: 1, Cl: 1 };
const COL: Record<Kind, string> = {
  H: "#d7d2c8",
  O: "#c47a72",
  C: "#9a958c",
  N: "#8fbf9a",
  Na: "#c4a574",
  Cl: "#8fbf9a",
};
const RAD: Record<Kind, number> = { H: 24, O: 28, C: 30, N: 28, Na: 30, Cl: 28 };

const LEVELS: Level[] = [
  { name: "물", formula: "H₂O", atoms: ["H", "H", "O"], coach: "산소는 손이 두 개", allow: [["O", "H"]] },
  {
    name: "이산화탄소",
    formula: "CO₂",
    atoms: ["C", "O", "O"],
    coach: "탄소는 네 자리, 산소와는 이중결합",
    allow: [["C", "O"]],
  },
  { name: "암모니아", formula: "NH₃", atoms: ["N", "H", "H", "H"], coach: "질소는 손이 세 개", allow: [["N", "H"]] },
  { name: "메탄", formula: "CH₄", atoms: ["C", "H", "H", "H", "H"], coach: "탄소는 네 자리", allow: [["C", "H"]] },
  { name: "염화수소", formula: "HCl", atoms: ["H", "Cl"], coach: "수소와 염소는 손 하나", allow: [["H", "Cl"]] },
  { name: "산소 분자", formula: "O₂", atoms: ["O", "O"], coach: "같은 산소는 손을 두 개씩 맞잡는다", allow: [["O", "O"]] },
  { name: "질소 분자", formula: "N₂", atoms: ["N", "N"], coach: "질소는 세 겹으로 붙는다", allow: [["N", "N"]] },
  { name: "염화나트륨", formula: "NaCl", atoms: ["Na", "Cl"], coach: "나트륨과 염소는 한 손으로 만난다", allow: [["Na", "Cl"]] },
  { name: "메탄올", formula: "CH₃OH", atoms: ["C", "H", "H", "H", "O", "H"], coach: "탄소 넷, 산소 둘, 수소는 하나", allow: [["C", "H"], ["C", "O"], ["O", "H"]] },
];

const pal = INK;

function remaining(a: Atom): number {
  return VAL[a.kind] - a.used;
}

function pairOk(a: Kind, b: Kind, allow: [Kind, Kind][]): boolean {
  return allow.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function alreadyBonded(bonds: Bond[], i: number, j: number): boolean {
  return bonds.some((b) => (b.a === i && b.b === j) || (b.a === j && b.b === i));
}

function connected(n: number, bonds: Bond[]): boolean {
  if (n <= 1) return true;
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const b of bonds) {
    adj[b.a].push(b.b);
    adj[b.b].push(b.a);
  }
  const seen = new Uint8Array(n);
  const q = [0];
  seen[0] = 1;
  let count = 1;
  while (q.length) {
    const i = q.pop()!;
    for (const j of adj[i]) {
      if (!seen[j]) {
        seen[j] = 1;
        count += 1;
        q.push(j);
      }
    }
  }
  return count === n;
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
  let atoms: Atom[] = [];
  let bonds: Bond[] = [];
  let drag = -1;
  let grabX = 0;
  let grabY = 0;
  let wasDown = false;
  let reject = 0;
  let celebrate = 0;
  let clock = 0;
  let status = "";
  let coach = "";
  let bounceFlash = 0;
  let lw = 0;
  let lh = 0;
  let phase = 0;

  const load = () => {
    const L = LEVELS[level];
    const { w, h } = view.size();
    lw = w;
    lh = h;
    const n = L.atoms.length;
    const cx = w * 0.5;
    const cy = h * 0.54;
    const rad = Math.min(w, h) * (n <= 2 ? 0.16 : 0.24);
    atoms = L.atoms.map((kind, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2 + 0.18;
      return {
        kind,
        x: cx + Math.cos(a) * rad,
        y: cy + Math.sin(a) * rad * 0.82,
        vx: 0,
        vy: 0,
        used: 0,
        r: RAD[kind],
        flash: 0,
      };
    });
    bonds = [];
    drag = -1;
    reject = 0;
    celebrate = 0;
    clock = 0;
    bounceFlash = 0;
    status = L.formula;
    coach = L.coach;
    emit();
  };

  const emit = () => {
    hooks.onHud({ level: level + 1, total: LEVELS.length, score, status, coach });
  };

  const winLevel = () => {
    if (finished) return;
    const leftoverBonus = Math.max(0, Math.round(70 - clock * 3.2));
    score += 100 + leftoverBonus;
    if (level + 1 >= LEVELS.length) {
      finished = true;
      status = "완성";
      coach = "원자가가 분자를 결정한다";
      emit();
      hooks.onClear(score);
    } else {
      level += 1;
      load();
    }
  };

  const bump = (A: Atom, B: Atom, msg: string) => {
    const dx = A.x - B.x;
    const dy = A.y - B.y;
    const d = Math.hypot(dx, dy) || 1;
    A.vx += (dx / d) * 220;
    B.vx -= (dx / d) * 220;
    A.vy += (dy / d) * 220;
    B.vy -= (dy / d) * 220;
    reject = 0.28;
    bounceFlash = 0.22;
    tone(140, 0.1, "square", 0.05);
    noiseBurst(0.05, 0.03);
    coach = msg;
    emit();
  };

  const tryBond = (i: number, j: number): boolean => {
    if (i === j || i < 0 || j < 0) return false;
    if (alreadyBonded(bonds, i, j)) return false;
    const A = atoms[i];
    const B = atoms[j];
    if (!pairOk(A.kind, B.kind, LEVELS[level].allow)) {
      bump(A, B, "그 둘은 이 분자에서 붙지 않습니다");
      return false;
    }
    const ra = remaining(A);
    const rb = remaining(B);
    if (ra <= 0 || rb <= 0) {
      bump(A, B, "남은 손이 없습니다");
      return false;
    }
    const order = Math.min(ra, rb);
    A.used += order;
    B.used += order;
    bonds.push({ a: i, b: j, order });
    A.flash = 0.35;
    B.flash = 0.35;
    if (!rm) burst(sparks, (A.x + B.x) * 0.5, (A.y + B.y) * 0.5, pal.ok, 10);
    tone(320 + order * 80, 0.09, "sine", 0.06);
    if (order === 2) coach = "이중결합 — 손을 두 개씩";
    else if (order === 3) coach = "삼중결합 — 세 겹";
    else coach = LEVELS[level].coach;
    emit();
    return true;
  };

  const complete = () => {
    if (celebrate > 0 || finished) return;
    if (!atoms.every((a) => remaining(a) === 0)) return;
    if (!connected(atoms.length, bonds)) return;
    celebrate = rm ? 0.2 : 0.62;
    status = `${LEVELS[level].formula} 완성`;
    coach = "분자 완성";
    const { w, h } = view.size();
    if (!rm) burst(sparks, w * 0.5, h * 0.5, pal.ok, 22);
    tone(520, 0.12, "sine", 0.06);
    tone(780, 0.18, "triangle", 0.045);
    emit();
  };

  const restart = () => {
    finished = false;
    level = 0;
    score = 0;
    sparks = [];
    load();
  };

  const pickAtom = (x: number, y: number): number => {
    let best = -1;
    let bestD = 1e9;
    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i];
      if (hit(x, y, a.x, a.y, Math.max(a.r, 22))) {
        const d = Math.hypot(x - a.x, y - a.y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
    }
    return best;
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
      const sx = w / lw;
      const sy = h / lh;
      for (const a of atoms) {
        a.x *= sx;
        a.y *= sy;
      }
    }
    lw = w;
    lh = h;
    phase += dt;
    clock += dt;
    reject = Math.max(0, reject - dt);
    bounceFlash = Math.max(0, bounceFlash - dt);

    if (!finished && celebrate <= 0) {
      if (pressed) {
        drag = pickAtom(view.ptr.x, view.ptr.y);
        if (drag >= 0) {
          grabX = view.ptr.x - atoms[drag].x;
          grabY = view.ptr.y - atoms[drag].y;
          atoms[drag].vx = 0;
          atoms[drag].vy = 0;
          tone(240, 0.04, "sine", 0.03);
        }
      }
      if (drag >= 0 && view.ptr.down) {
        const a = atoms[drag];
        a.x = Math.min(w - a.r, Math.max(a.r, view.ptr.x - grabX));
        a.y = Math.min(h - a.r - 8, Math.max(48 + a.r, view.ptr.y - grabY));
        a.vx = 0;
        a.vy = 0;
        if (reject <= 0) {
          for (let j = 0; j < atoms.length; j++) {
            if (j === drag) continue;
            const b = atoms[j];
            if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r + 6) {
              tryBond(drag, j);
              break;
            }
          }
        }
      }
      if (released) drag = -1;
    } else if (released) {
      drag = -1;
    }

    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i];
      a.flash = Math.max(0, a.flash - dt * 2.2);
      if (i === drag) continue;
      if (!rm) {
        a.x += Math.sin(phase * 0.9 + i * 1.7) * 6 * dt;
        a.y += Math.cos(phase * 0.7 + i * 1.3) * 5 * dt;
      }
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.vx *= Math.pow(0.08, dt);
      a.vy *= Math.pow(0.08, dt);
      if (Math.hypot(a.vx, a.vy) < 4) {
        a.vx = 0;
        a.vy = 0;
      }
      a.x = Math.min(w - a.r, Math.max(a.r, a.x));
      a.y = Math.min(h - a.r - 8, Math.max(48 + a.r, a.y));
    }

    for (const b of bonds) {
      const A = atoms[b.a];
      const B = atoms[b.b];
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const d = Math.hypot(dx, dy) || 1;
      const rest = A.r + B.r + 10;
      const stretch = d - rest;
      const fx = (dx / d) * stretch * 8.5 * dt;
      const fy = (dy / d) * stretch * 8.5 * dt;
      if (b.a !== drag) {
        A.x += fx;
        A.y += fy;
      }
      if (b.b !== drag) {
        B.x -= fx;
        B.y -= fy;
      }
    }

    if (celebrate > 0) {
      celebrate -= dt;
      if (celebrate <= 0) winLevel();
    } else {
      complete();
    }

    stepSparks(sparks, dt);
    clear(ctx, w, h, pal);
    grain(ctx, w, h, 3);

    ctx.fillStyle = pal.fill;
    ctx.fillRect(0, 0, w, 44);
    display(ctx, LEVELS[level].formula, 20, 22, pal.fg, 26, "left");
    label(ctx, LEVELS[level].name, w - 18, 22, pal.muted, 13, "right");

    for (const b of bonds) {
      const A = atoms[b.a];
      const B = atoms[b.b];
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      const px = -uy;
      const py = ux;
      const x1 = A.x + ux * A.r * 0.72;
      const y1 = A.y + uy * A.r * 0.72;
      const x2 = B.x - ux * B.r * 0.72;
      const y2 = B.y - uy * B.r * 0.72;
      const spacing = b.order === 3 ? 5.2 : 4.4;
      ctx.strokeStyle = pal.accent;
      ctx.lineCap = "round";
      ctx.lineWidth = b.order === 1 ? 3.2 : 2.2;
      const offsets =
        b.order === 1 ? [0] : b.order === 2 ? [-spacing * 0.5, spacing * 0.5] : [-spacing, 0, spacing];
      for (const o of offsets) {
        ctx.beginPath();
        ctx.moveTo(x1 + px * o, y1 + py * o);
        ctx.lineTo(x2 + px * o, y2 + py * o);
        ctx.stroke();
      }
    }

    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i];
      if (a.flash > 0) {
        ctx.globalAlpha = a.flash * 0.45;
        ctx.fillStyle = pal.ok;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = COL[a.kind];
      ctx.fill();
      ctx.strokeStyle = i === drag ? pal.fg : pal.line;
      ctx.lineWidth = i === drag ? 2.2 : 1.2;
      ctx.stroke();
      ctx.fillStyle = "rgba(12,13,16,0.18)";
      ctx.beginPath();
      ctx.ellipse(a.x - a.r * 0.22, a.y - a.r * 0.28, a.r * 0.42, a.r * 0.28, -0.4, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, a.kind, a.x, a.y + 1, pal.bg, a.kind === "Na" || a.kind === "Cl" ? 16 : 18, "center");

      const hands = VAL[a.kind];
      for (let k = 0; k < hands; k++) {
        const ang = -Math.PI / 2 + (k * Math.PI * 2) / hands;
        ctx.beginPath();
        ctx.arc(a.x + Math.cos(ang) * (a.r + 7), a.y + Math.sin(ang) * (a.r + 7), 2.4, 0, Math.PI * 2);
        ctx.fillStyle = k < a.used ? pal.muted : pal.fg;
        ctx.globalAlpha = k < a.used ? 0.35 : 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (remaining(a) === 0) {
        ctx.strokeStyle = pal.ok;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    if (bounceFlash > 0) {
      ctx.globalAlpha = bounceFlash * 0.18;
      ctx.fillStyle = pal.bad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    if (finished) display(ctx, "실험 종료", w * 0.5, h * 0.18, pal.ok, 28, "center");
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
