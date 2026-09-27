import { CLAY } from "@/lib/games/draw";
import { display, fillRound, head, inRect, label, playKnow, popAt, scene, strokeRound, type KnowApi, type KnowFrame } from "@/lib/games/know";

type Chip = { id: string; text: string; want: string; x: number; y: number; placed: boolean };
type Slot = { id: string; label: string; pre?: string; x: number; y: number; w: number; h: number };

const COLS = ["년", "월", "일", "시"] as const;
const MY = { 년: { s: "갑", b: "자" }, 월: { s: "병", b: "인" }, 일: { s: "경", b: "신" }, 시: { s: "임", b: "오" } };
const CYCLE = ["목", "화", "토", "금", "수"] as const;
const OH: Record<string, string> = { 갑: "목", 을: "목", 병: "화", 정: "화", 무: "토", 기: "토", 경: "금", 신: "금", 임: "수", 계: "수", 자: "수", 축: "토", 인: "목", 묘: "목", 진: "토", 사: "화", 오: "화", 미: "토", 유: "금", 술: "토", 해: "수" };

let chips: Chip[] = [];
let drag: Chip | null = null;
let ox = 0;
let oy = 0;
let cycleI = 0;
let slide = 0;
let sliding = false;
let kind: "chart" | "cycle" | "slide" | "pair" | "job" | "now" = "chart";

function load(api: KnowApi) {
  const L = api.level;
  drag = null;
  cycleI = 0;
  slide = 0.08;
  sliding = false;
  if (L === 0) {
    kind = "chart";
    chips = tile(["경", "갑", "임"], { 경: "일-s" });
  } else if (L === 1) {
    kind = "chart";
    chips = tile(["갑", "경", "병", "임"], { 갑: "년-s", 경: "일-s" });
  } else if (L === 2) {
    kind = "chart";
    chips = tile(["인", "오", "자", "신"], { 인: "월-b", 오: "시-b" });
  } else if (L === 3) {
    kind = "cycle";
    chips = CYCLE.map((t) => ({ id: t, text: t, want: t, x: 0, y: 0, placed: false }));
  } else if (L === 4) {
    kind = "chart";
    chips = tile(["갑", "인", "경", "오", "을", "묘"], { 갑: "년-s", 인: "월-b", 경: "일-s", 오: "시-b" });
  } else if (L === 5) {
    kind = "slide";
    chips = [];
  } else if (L === 6) {
    kind = "pair";
    chips = [
      { id: "경", text: "경", want: "나", x: 0, y: 0, placed: false },
      { id: "갑", text: "갑", want: "상대", x: 0, y: 0, placed: false },
      { id: "임", text: "임", want: "", x: 0, y: 0, placed: false },
    ];
  } else if (L === 7) {
    kind = "job";
    chips = CYCLE.map((t) => ({ id: t, text: t, want: t === "금" ? "적성" : "", x: 0, y: 0, placed: false }));
  } else {
    kind = "now";
    chips = [
      { id: "성격 언어", text: "성격 언어", want: "명식", x: 0, y: 0, placed: false },
      { id: "운명 확정", text: "운명 확정", want: "", x: 0, y: 0, placed: false },
    ];
  }
}

function tile(names: string[], map: Record<string, string>): Chip[] {
  return names.map((t) => ({ id: t, text: t, want: map[t] ?? "", x: 0, y: 0, placed: false }));
}

function needed(): Set<string> {
  return new Set(chips.filter((c) => c.want).map((c) => c.want));
}

function colLayout(w: number, top: number) {
  const gap = 10;
  const cw = Math.min(78, (w - 32 - 3 * gap) / 4);
  const x0 = (w - (4 * cw + 3 * gap)) / 2;
  return COLS.map((col, i) => ({ col, x: x0 + i * (cw + gap), y: top, w: cw }));
}

function chartSlots(w: number, top: number): Slot[] {
  const cols = colLayout(w, top);
  const sh = 56;
  const need = needed();
  const slots: Slot[] = [];
  for (const c of cols) {
    const stemId = `${c.col}-s`;
    const brId = `${c.col}-b`;
    const stemVal = MY[c.col].s;
    const brVal = MY[c.col].b;
    slots.push({
      id: stemId,
      label: `${c.col} 천간`,
      pre: need.has(stemId) ? undefined : stemVal,
      x: c.x,
      y: c.y + 22,
      w: c.w,
      h: sh,
    });
    slots.push({
      id: brId,
      label: `${c.col} 지지`,
      pre: need.has(brId) ? undefined : brVal,
      x: c.x,
      y: c.y + 22 + sh + 12,
      w: c.w,
      h: sh,
    });
  }
  return slots;
}

function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, ww: number, hh: number, text: string, fade: boolean, pal: KnowApi["pal"], ok = false, hot = false) {
  const el = OH[text] ?? "";
  fillRound(ctx, x, y, ww, hh, 8, fade ? pal.fill : pal.fill);
  strokeRound(ctx, x, y, ww, hh, 8, ok ? pal.ok : hot ? pal.accent : pal.line, ok || hot ? 1.6 : 1);
  ctx.globalAlpha = fade ? 0.4 : 1;
  label(ctx, text, x + ww / 2, y + hh / 2 - (el ? 7 : 0), pal.fg, 16, "center");
  if (el) label(ctx, el, x + ww / 2, y + hh / 2 + 11, pal.muted, 10, "center");
  ctx.globalAlpha = 1;
}

function layoutChips(h: number, w: number, cw: number) {
  const loose = chips.filter((c) => !c.placed);
  const gap = 8;
  const total = loose.length * cw + Math.max(0, loose.length - 1) * gap;
  const tx = (w - total) / 2;
  loose.forEach((c, i) => {
    if (drag !== c) {
      c.x = tx + i * (cw + gap);
      c.y = h - 58;
    }
  });
}

function handleDrag(f: KnowFrame, cw: number, ch: number, drop: (c: Chip, cx: number, cy: number) => void) {
  const { ptr, justDown, justUp, api } = f;
  if (justDown && api.hold <= 0) {
    const hit = [...chips].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, cw, ch));
    if (hit) {
      drag = hit;
      ox = ptr.x - hit.x;
      oy = ptr.y - hit.y;
    }
  }
  if (drag) {
    drag.x = ptr.x - ox;
    drag.y = ptr.y - oy;
  }
  if (justUp && drag) {
    drop(drag, drag.x + cw / 2, drag.y + ch / 2);
    drag = null;
  }
}

function drawChips(ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: KnowApi["pal"]) {
  for (const c of chips) {
    if (c.placed) continue;
    fillRound(ctx, c.x, c.y, cw, ch, 10, drag === c ? pal.accent : pal.fill);
    strokeRound(ctx, c.x, c.y, cw, ch, 10, pal.line, 1.2);
    label(ctx, c.text, c.x + cw / 2, c.y + ch / 2, drag === c ? pal.bg : pal.fg, c.text.length > 3 ? 12 : 14, "center");
  }
}

function stepChart(f: KnowFrame) {
  const { ctx, w, h, api, ptr } = f;
  display(ctx, api.level === 0 ? "일간 경을 앉히기" : api.level === 1 ? "년간 갑, 일간 경" : api.level === 2 ? "월지 인, 시지 오" : "빈 칸 네 개", w / 2, 68, api.pal.fg, 16, "center");
  const slots = chartSlots(w, 86);
  const cols = colLayout(w, 86);
  for (const c of cols) label(ctx, c.col, c.x + c.w / 2, c.y + 8, api.pal.muted, 12, "center");
  const cw = Math.max(56, Math.min(88, (w - 24 - (chips.filter((c) => !c.placed).length - 1) * 8) / Math.max(1, chips.filter((c) => !c.placed).length)));
  const ch = 48;
  layoutChips(h, w, cw);
  handleDrag(f, cw, ch, (c, cx, cy) => {
    const slot = slots.find((s) => !s.pre && inRect(cx, cy, s.x, s.y, s.w, s.h));
    if (!slot) return;
    if (c.want === slot.id) {
      c.placed = true;
      popAt(api, slot.x + slot.w / 2, slot.y + slot.h / 2, api.pal.ok, 10);
      api.setCoach(`${c.text} → ${slot.label}`);
      if (chips.filter((x) => x.want).every((x) => x.placed)) {
        const msg =
          api.level === 0
            ? "일간. 날의 천간이 나다."
            : api.level === 1
              ? "갑은 년, 경은 일. 천간의 뼈."
              : api.level === 2
                ? "인은 봄의 달, 오는 한낮의 시."
                : "간지를 기둥에 앉힌다.";
        api.succeed(msg);
      }
    } else api.miss(`${slot.label}에는 ${c.want ? "다른 글자" : "이 글자가 아닙니다"}.`);
  });
  for (const s of slots) {
    const put = chips.find((c) => c.placed && c.want === s.id);
    const text = put?.text ?? s.pre ?? "";
    const hot = inRect(ptr.x, ptr.y, s.x, s.y, s.w, s.h);
    drawCell(ctx, s.x, s.y, s.w, s.h, text || " ", Boolean(s.pre), api.pal, Boolean(put), hot && !s.pre);
  }
  drawChips(ctx, cw, ch, api.pal);
}

function stepCycle(f: KnowFrame) {
  const { ctx, w, h, api } = f;
  display(ctx, "상생 목 → 화 → 토 → 금 → 수", w / 2, 68, api.pal.fg, 16, "center");
  label(ctx, cycleI < 5 ? `다음 ${CYCLE[cycleI]}` : "상생", w / 2, 90, api.pal.muted, 12, "center");
  const cx = w / 2;
  const cy = h * 0.46;
  const rad = Math.min(w, h) * 0.2;
  const verts = CYCLE.map((el, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    return { el, i, x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad };
  });
  ctx.strokeStyle = api.pal.line;
  ctx.beginPath();
  verts.forEach((v, i) => (i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y)));
  ctx.closePath();
  ctx.stroke();
  const cw = Math.max(56, Math.min(80, (w - 24 - 32) / 5));
  const ch = 48;
  layoutChips(h, w, cw);
  handleDrag(f, cw, ch, (c, px, py) => {
    const v = verts.find((z) => Math.hypot(px - z.x, py - z.y) <= 26);
    if (!v) return;
    if (c.text === CYCLE[cycleI] && v.el === CYCLE[cycleI]) {
      c.placed = true;
      cycleI += 1;
      popAt(api, v.x, v.y, api.pal.ok, 10);
      if (cycleI >= 5) api.succeed("목생화생토생금생수.");
      else api.setCoach(`다음 ${CYCLE[cycleI]}`);
    } else api.miss(`지금은 ${CYCLE[cycleI]} 차례.`);
  });
  for (const v of verts) {
    const done = v.i < cycleI;
    const next = v.i === cycleI;
    ctx.beginPath();
    ctx.arc(v.x, v.y, 24, 0, Math.PI * 2);
    ctx.fillStyle = done || next ? api.pal.accent : api.pal.fill;
    ctx.fill();
    ctx.strokeStyle = next ? api.pal.ok : api.pal.line;
    ctx.lineWidth = next ? 2 : 1;
    ctx.stroke();
    ctx.lineWidth = 1;
    label(ctx, v.el, v.x, v.y, done || next ? api.pal.bg : api.pal.fg, 14, "center");
  }
  drawChips(ctx, cw, ch, api.pal);
}

function stepSlide(f: KnowFrame) {
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  display(ctx, "다음 십 년으로", w / 2, 68, api.pal.fg, 18, "center");
  label(ctx, "손잡이를 가운데 눈금에", w / 2, 90, api.pal.muted, 12, "center");
  const x0 = 36;
  const x1 = w - 36;
  const y = h * 0.46;
  const ticks = [0, 0.5, 1];
  const names = ["10세", "20세", "30세"];
  ctx.strokeStyle = api.pal.line;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
  ctx.lineWidth = 1;
  ticks.forEach((t, i) => {
    const x = x0 + t * (x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x, y - 16);
    ctx.lineTo(x, y + 16);
    ctx.strokeStyle = i === 1 ? api.pal.ok : api.pal.line;
    ctx.stroke();
    label(ctx, names[i], x, y + 32, i === 1 ? api.pal.ok : api.pal.muted, 12, "center");
    if (i === 0) label(ctx, "현재", x, y - 28, api.pal.accent, 11, "center");
    if (i === 1) label(ctx, "다음", x, y - 28, api.pal.ok, 11, "center");
  });
  const hx = x0 + slide * (x1 - x0);
  const hw = 48;
  const hh = 48;
  if (justDown && api.hold <= 0 && inRect(ptr.x, ptr.y, hx - hw / 2, y - hh / 2, hw, hh)) sliding = true;
  if (sliding) slide = Math.max(0, Math.min(1, (ptr.x - x0) / (x1 - x0)));
  if (justUp && sliding) {
    sliding = false;
    const nearest = ticks.reduce((a, t) => (Math.abs(t - slide) < Math.abs(a - slide) ? t : a), ticks[0]);
    slide = nearest;
    if (nearest === 0.5) {
      popAt(api, hx, y, api.pal.ok, 12);
      api.succeed("대운은 십 년. 현재 다음 칸.");
    } else api.miss("가운데, 다음 십 년입니다.");
  }
  fillRound(ctx, hx - hw / 2, y - hh / 2, hw, hh, 12, sliding ? api.pal.accent : api.pal.fill);
  strokeRound(ctx, hx - hw / 2, y - hh / 2, hw, hh, 12, api.pal.accent, 1.6);
  label(ctx, "대운", hx, y, sliding ? api.pal.bg : api.pal.fg, 12, "center");
}

function stepPair(f: KnowFrame) {
  const { ctx, w, h, api } = f;
  display(ctx, "일간을 자리에", w / 2, 68, api.pal.fg, 18, "center");
  const bw = Math.min(130, (w - 48) / 2);
  const slots: Slot[] = [
    { id: "나", label: "나", x: w / 2 - bw - 10, y: h * 0.32, w: bw, h: 80 },
    { id: "상대", label: "상대", x: w / 2 + 10, y: h * 0.32, w: bw, h: 80 },
  ];
  const cw = 72;
  const ch = 48;
  layoutChips(h, w, cw);
  handleDrag(f, cw, ch, (c, cx, cy) => {
    const slot = slots.find((s) => inRect(cx, cy, s.x, s.y, s.w, s.h));
    if (!slot) return;
    if (c.want === slot.id) {
      c.placed = true;
      popAt(api, slot.x + slot.w / 2, slot.y + slot.h / 2, api.pal.ok, 10);
      if (chips.filter((x) => x.want).every((x) => x.placed)) api.succeed("경은 나, 갑은 상대. 두 일간의 자리.");
    } else api.miss("경을 나, 갑을 상대에.");
  });
  for (const s of slots) {
    const put = chips.find((c) => c.placed && c.want === s.id);
    strokeRound(ctx, s.x, s.y, s.w, s.h, 10, put ? api.pal.ok : api.pal.line, put ? 2 : 1.2);
    label(ctx, s.label, s.x + s.w / 2, s.y + 16, api.pal.muted, 12, "center");
    if (put) drawCell(ctx, s.x + 16, s.y + 28, s.w - 32, 44, put.text, false, api.pal, true, false);
  }
  drawChips(ctx, cw, ch, api.pal);
}

function stepJob(f: KnowFrame) {
  const { ctx, w, h, api } = f;
  display(ctx, "강한 오행 금", w / 2, 68, api.pal.fg, 18, "center");
  label(ctx, "경금 일간. 적성의 자리에", w / 2, 90, api.pal.muted, 12, "center");
  const slot = { id: "적성", x: (w - 140) / 2, y: h * 0.34, w: 140, h: 72 };
  const cw = 56;
  const ch = 48;
  layoutChips(h, w, cw);
  handleDrag(f, cw, ch, (c, cx, cy) => {
    if (!inRect(cx, cy, slot.x, slot.y, slot.w, slot.h)) return;
    if (c.want === "적성") {
      c.placed = true;
      popAt(api, slot.x + slot.w / 2, slot.y + slot.h / 2, api.pal.ok, 12);
      api.succeed("강한 금은 결산·다듬기의 은유.");
    } else api.miss("이 명식의 강한 오행은 금.");
  });
  const put = chips.find((c) => c.placed);
  strokeRound(ctx, slot.x, slot.y, slot.w, slot.h, 10, put ? api.pal.ok : api.pal.line, 1.6);
  label(ctx, "적성", slot.x + slot.w / 2, slot.y + 16, api.pal.muted, 12, "center");
  if (put) label(ctx, put.text, slot.x + slot.w / 2, slot.y + 44, api.pal.ok, 20, "center");
  drawChips(ctx, cw, ch, api.pal);
}

function stepNow(f: KnowFrame) {
  const { ctx, w, h, api } = f;
  display(ctx, "명식을 무엇으로 읽나", w / 2, 68, api.pal.fg, 16, "center");
  const cols = colLayout(w, 96);
  for (const c of cols) {
    label(ctx, c.col, c.x + c.w / 2, c.y + 8, api.pal.muted, 12, "center");
    drawCell(ctx, c.x, c.y + 22, c.w, 52, MY[c.col].s, false, api.pal);
    drawCell(ctx, c.x, c.y + 82, c.w, 52, MY[c.col].b, false, api.pal);
  }
  const box = { x: 20, y: 96, w: w - 40, h: 150 };
  const cw = Math.max(120, Math.min(160, (w - 40) / 2));
  const ch = 48;
  layoutChips(h, w, cw);
  handleDrag(f, cw, ch, (c, cx, cy) => {
    if (!inRect(cx, cy, box.x, box.y, box.w, box.h)) return;
    if (c.want === "명식") {
      c.placed = true;
      popAt(api, w / 2, box.y + 40, api.pal.ok, 12);
      api.succeed("성격 언어로 번역해 읽는다. 운명 단정이 아니다.");
    } else api.miss("번역이지 선고가 아닙니다.");
  });
  drawChips(ctx, cw, ch, api.pal);
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, api } = f;
  head(ctx, w, "네 기둥", api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 12, "left");
  if (kind === "chart") stepChart(f);
  else if (kind === "cycle") stepCycle(f);
  else if (kind === "slide") stepSlide(f);
  else if (kind === "pair") stepPair(f);
  else if (kind === "job") stepJob(f);
  else stepNow(f);
  if (api.hold > 0) display(ctx, api.note, w / 2, f.h * 0.2, api.pal.ok, 15, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("saju", canvas, hooks, CLAY, { load, step });
}
