import { SLATE } from "@/lib/games/draw";
import {
  display,
  fillRound,
  head,
  inRect,
  label,
  playKnow,
  popAt,
  scene,
  strokeRound,
  type KnowApi,
  type KnowFrame,
} from "@/lib/games/know";

type Key = { name: string; ok: boolean; raw: number };
type Lv = { query: string; keys: { name: string; ok: boolean }[]; msg: string };

const LV: Lv[] = [
  { query: "기호", keys: [{ name: "논리", ok: true }, { name: "규칙", ok: true }, { name: "픽셀", ok: false }, { name: "확률", ok: false }], msg: "기호주의는 논리와 규칙에 주목한다." },
  { query: "손실", keys: [{ name: "오차", ok: true }, { name: "기울기", ok: true }, { name: "문법", ok: false }, { name: "신화", ok: false }], msg: "손실은 오차와 기울기다." },
  { query: "층", keys: [{ name: "특징", ok: true }, { name: "변환", ok: true }, { name: "세금", ok: false }], msg: "층은 특징을 변환한다." },
  { query: "어텐션", keys: [{ name: "관련토큰", ok: true }, { name: "가중치", ok: true }, { name: "전부보기", ok: false }], msg: "어텐션은 관련 토큰에 가중치를 준다." },
  { query: "다음토큰", keys: [{ name: "문맥", ok: true }, { name: "예측", ok: true }, { name: "검색엔진", ok: false }], msg: "다음 토큰은 문맥에서 예측한다." },
  { query: "디코딩", keys: [{ name: "샘플", ok: true }, { name: "온도", ok: true }, { name: "하드디스크", ok: false }], msg: "디코딩은 온도와 샘플이다." },
  { query: "이미지", keys: [{ name: "패치", ok: true }, { name: "텍스트", ok: true }, { name: "금리", ok: false }], msg: "이미지는 패치와 텍스트를 같이 본다." },
  { query: "근거", keys: [{ name: "출처", ok: true }, { name: "인용", ok: true }, { name: "추측", ok: false }], msg: "근거는 출처와 인용이다." },
  { query: "도구호출", keys: [{ name: "함수", ok: true }, { name: "인자", ok: true }, { name: "명상", ok: false }], msg: "도구 호출은 함수와 인자다." },
];

const LO = 0.08;
const HI = 0.9;

let query = "";
let keys: Key[] = [];
let msg = "";
let drag = -1;
let paint = false;
let dwell = 0;

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function softmax(raws: number[]): number[] {
  const t = 0.28;
  const m = Math.max(...raws);
  const ex = raws.map((z) => Math.exp((z - m) / t));
  const s = ex.reduce((a, b) => a + b, 0) || 1;
  return ex.map((e) => e / s);
}

function load(api: KnowApi) {
  const L = LV[api.level];
  query = L.query;
  keys = L.keys.map((k) => ({ ...k, raw: 0.36 }));
  msg = L.msg;
  drag = -1;
  paint = false;
  dwell = 0;
}

function layout(w: number, h: number) {
  const top = 72;
  const bot = h - 18;
  const n = keys.length;
  const rowH = Math.max(56, Math.min(78, (bot - top) / n));
  const qW = Math.max(88, Math.min(118, w * 0.26));
  const qH = 64;
  const qx = 16;
  const qy = top + (n * rowH) / 2 - qH / 2;
  const kx = qx + qW + 22;
  const kw = w - kx - 16;
  const kh = Math.max(44, rowH - 18);
  return { top, rowH, qW, qH, qx, qy, kx, kw, kh };
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "어텐션 헤드", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 13, "left");

  const L = layout(w, h);
  const p = softmax(keys.map((k) => k.raw));
  const okMass = keys.reduce((s, k, i) => s + (k.ok ? p[i] : 0), 0);
  const irrOk = keys.every((k, i) => k.ok || p[i] < 0.15);

  if (justDown && api.hold <= 0) {
    if (inRect(ptr.x, ptr.y, L.qx, L.qy, L.qW, L.qH)) paint = true;
    else {
      const i = keys.findIndex((_, i) => inRect(ptr.x, ptr.y, L.kx, L.top + i * L.rowH, L.kw, L.kh));
      if (i >= 0) drag = i;
    }
  }
  if (paint && ptr.down && api.hold <= 0) {
    keys.forEach((k, i) => {
      if (inRect(ptr.x, ptr.y, L.kx, L.top + i * L.rowH, L.kw, L.kh)) {
        k.raw = clamp(k.raw + dt * 1.4, LO, HI);
      }
    });
  }
  if (drag >= 0 && ptr.down && api.hold <= 0) {
    const y0 = L.top + drag * L.rowH;
    keys[drag].raw = clamp(HI - ((ptr.y - y0) / L.kh) * (HI - LO), LO, HI);
  }
  if (justUp) {
    drag = -1;
    paint = false;
  }

  if (api.hold <= 0) {
    if (okMass >= 0.7 && irrOk) {
      dwell += dt;
      if (dwell >= 1.2) {
        popAt(api, L.qx + L.qW / 2, L.qy + L.qH / 2, pal.ok, 14);
        api.succeed(msg);
      }
    } else dwell = 0;
  }

  fillRound(ctx, L.qx, L.qy, L.qW, L.qH, 10, pal.fill);
  strokeRound(ctx, L.qx, L.qy, L.qW, L.qH, 10, paint ? pal.accent : pal.ok, paint ? 2 : 1.4);
  label(ctx, "질의", L.qx + L.qW / 2, L.qy + 14, pal.muted, 10, "center");
  display(ctx, query, L.qx + L.qW / 2, L.qy + L.qH / 2 + 6, pal.fg, 16, "center");

  const qcx = L.qx + L.qW;
  const qcy = L.qy + L.qH / 2;
  keys.forEach((k, i) => {
    const y = L.top + i * L.rowH;
    const hot = drag === i || inRect(ptr.x, ptr.y, L.kx, y, L.kw, L.kh);
    const kcx = L.kx;
    const kcy = y + L.kh / 2;
    ctx.beginPath();
    ctx.moveTo(qcx, qcy);
    ctx.lineTo(kcx, kcy);
    ctx.strokeStyle = k.ok ? pal.ok : pal.line;
    ctx.globalAlpha = 0.18 + p[i] * 0.75;
    ctx.lineWidth = 1 + p[i] * 6;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    fillRound(ctx, L.kx, y, L.kw, L.kh, 10, drag === i ? pal.accent : pal.fill);
    strokeRound(ctx, L.kx, y, L.kw, L.kh, 10, k.ok && p[i] > 0.28 ? pal.ok : hot ? pal.accent : pal.line, hot ? 1.6 : 1);
    label(ctx, k.name, L.kx + 14, kcy, drag === i ? pal.bg : pal.fg, 14, "left");
    label(ctx, p[i].toFixed(2), L.kx + L.kw - 36, kcy, drag === i ? pal.bg : pal.muted, 12, "right");

    const hy = y + ((HI - k.raw) / (HI - LO)) * L.kh;
    ctx.beginPath();
    ctx.arc(L.kx + L.kw - 16, hy, 7, 0, Math.PI * 2);
    ctx.fillStyle = drag === i ? pal.bg : pal.accent;
    ctx.fill();

    const barY = y + L.kh + 4;
    const barW = L.kw;
    fillRound(ctx, L.kx, barY, barW, 8, 4, pal.bg);
    fillRound(ctx, L.kx, barY, Math.max(4, barW * p[i]), 8, 4, k.ok ? pal.ok : pal.warn);
  });

  if (dwell > 0 && api.hold <= 0) {
    const pw = Math.min(160, w - 40);
    const px = (w - pw) / 2;
    const py = h - 14;
    fillRound(ctx, px, py - 4, pw, 6, 3, pal.line);
    fillRound(ctx, px, py - 4, pw * clamp(dwell / 1.2, 0, 1), 6, 3, pal.ok);
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.2, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("ai", canvas, hooks, SLATE, { load, step });
}
