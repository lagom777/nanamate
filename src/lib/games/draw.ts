export type Palette = {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  ok: string;
  bad: string;
  warn: string;
  line: string;
  fill: string;
};

export const INK: Palette = {
  bg: "#0c0d10",
  fg: "#ece8e1",
  muted: "#9a958c",
  accent: "#d7d2c8",
  ok: "#8fbf9a",
  bad: "#c47a72",
  warn: "#c4a574",
  line: "rgba(236,232,225,0.14)",
  fill: "#14161b",
};

export const PAPER: Palette = {
  bg: "#efeae2",
  fg: "#1c1916",
  muted: "#6f6a63",
  accent: "#3d3832",
  ok: "#3d6b4a",
  bad: "#9a433c",
  warn: "#8a6230",
  line: "rgba(28,25,22,0.12)",
  fill: "#e6e0d6",
};

export const SLATE: Palette = {
  bg: "#101318",
  fg: "#e4e8ee",
  muted: "#8b93a0",
  accent: "#c5ccd6",
  ok: "#7fb3a0",
  bad: "#c47a72",
  warn: "#c4a574",
  line: "rgba(228,232,238,0.12)",
  fill: "#171b22",
};

export const CLAY: Palette = {
  bg: "#16110e",
  fg: "#f0e6d8",
  muted: "#a89682",
  accent: "#d8c4a8",
  ok: "#9bb089",
  bad: "#c47a72",
  warn: "#c4a574",
  line: "rgba(240,230,216,0.12)",
  fill: "#1e1814",
};

export function clear(ctx: CanvasRenderingContext2D, w: number, h: number, pal: Palette) {
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);
}

export function grain(ctx: CanvasRenderingContext2D, w: number, h: number, seed = 1, a = 0.035) {
  ctx.save();
  ctx.globalAlpha = a;
  for (let i = 0; i < 80; i++) {
    const x = ((i * 73 + seed * 17) % 97) / 97 * w;
    const y = ((i * 41 + seed * 29) % 89) / 89 * h;
    ctx.fillStyle = i % 2 ? "#fff" : "#000";
    ctx.fillRect(x, y, 1.2, 1.2);
  }
  ctx.restore();
}

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size = 14,
  align: CanvasTextAlign = "left",
  font = "500 14px Pretendard, 'Pretendard Variable', sans-serif",
) {
  ctx.fillStyle = color;
  ctx.font = font.replace("14px", `${size}px`);
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

export function display(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size = 22,
  align: CanvasTextAlign = "left",
) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px Pretendard, 'Pretendard Variable', sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 8,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function inRect(px: number, py: number, x: number, y: number, w: number, h: number) {
  return px >= x && py >= y && px <= x + w && py <= y + h;
}

export function hit(px: number, py: number, x: number, y: number, r: number) {
  const dx = px - x;
  const dy = py - y;
  return dx * dx + dy * dy <= r * r;
}

export type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  color: string;
};

export function burst(list: Spark[], x: number, y: number, color: string, n = 14) {
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const s = 40 + Math.random() * 120;
    list.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 1,
      max: 0.45 + Math.random() * 0.35,
      r: 1.4 + Math.random() * 2,
      color,
    });
  }
}

export function stepSparks(list: Spark[], dt: number) {
  for (const p of list) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 180 * dt;
    p.life -= dt / p.max;
  }
  for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
}

export function drawSparks(ctx: CanvasRenderingContext2D, list: Spark[]) {
  for (const p of list) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
