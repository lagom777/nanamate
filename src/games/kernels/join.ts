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

type Table = { name: string; cols: string[]; rows: string[][]; key: string; lab: string };
type Hit = { side: "L" | "R"; col: string; row: number; val: string; x: number; y: number; w: number; h: number };
type Ghost = { x: number; y: number; vx: number; vy: number; life: number; t: string };
type Pair = { a: string; b: string };
type Lv = { left: Table; right: Table; msg: string; nosql?: boolean };

const ADA = [
  ["1", "Ada"],
  ["2", "Beo"],
  ["3", "Cal"],
];

const LV: Lv[] = [
  { left: { name: "users", cols: ["id", "name"], rows: ADA, key: "id", lab: "name" }, right: { name: "orders", cols: ["user_id", "item"], rows: [["1", "책"], ["2", "펜"], ["9", "컵"]], key: "user_id", lab: "item" }, msg: "같은 키로 행을 맞춘다." },
  { left: { name: "users", cols: ["id", "name"], rows: ADA, key: "id", lab: "name" }, right: { name: "orders", cols: ["user_id", "item"], rows: [["1", "책"], ["2", "펜"], ["9", "컵"]], key: "user_id", lab: "item" }, msg: "JOIN 은 키 동등이다." },
  { left: { name: "customers", cols: ["id", "name"], rows: ADA, key: "id", lab: "name" }, right: { name: "addresses", cols: ["cust_id", "city"], rows: [["1", "서울"], ["2", "부산"], ["9", "제주"]], key: "cust_id", lab: "city" }, msg: "주소를 키로 밀어 냈다." },
  { left: { name: "products", cols: ["sku", "name"], rows: [["A1", "펜"], ["B2", "책"], ["C3", "컵"]], key: "sku", lab: "name" }, right: { name: "stock", cols: ["sku", "qty"], rows: [["A1", "12"], ["B2", "3"], ["X9", "1"]], key: "sku", lab: "qty" }, msg: "SKU 가 목차다." },
  { left: { name: "accounts", cols: ["id", "name"], rows: ADA, key: "id", lab: "name" }, right: { name: "tx", cols: ["account_id", "amt"], rows: [["1", "+50"], ["2", "-20"], ["9", "+8"]], key: "account_id", lab: "amt" }, msg: "거래는 계좌 키로 묶인다." },
  { left: { name: "users", cols: ["id", "name"], rows: ADA, key: "id", lab: "name" }, right: { name: "doc", cols: ["_id", "orders"], rows: [["1", "책"], ["2", "펜"]], key: "_id", lab: "orders" }, msg: "문서는 조인 대신 내장한다.", nosql: true },
  { left: { name: "node A", cols: ["id", "val"], rows: ADA, key: "id", lab: "val" }, right: { name: "node B", cols: ["id", "val"], rows: [["1", "책"], ["2", "펜"], ["9", "컵"]], key: "id", lab: "val" }, msg: "노드를 같은 id 로 잇는다." },
  { left: { name: "질의", cols: ["user_id", "q"], rows: [["1", "Ada주문"], ["2", "Beo주문"], ["3", "Cal주문"]], key: "user_id", lab: "q" }, right: { name: "orders", cols: ["user_id", "item"], rows: [["1", "책"], ["2", "펜"], ["9", "컵"]], key: "user_id", lab: "item" }, msg: "질의가 필요한 키를 정한다." },
  { left: { name: "users", cols: ["id", "name"], rows: ADA, key: "id", lab: "name" }, right: { name: "orders", cols: ["user_id", "item"], rows: [["1", "책"], ["2", "펜"], ["9", "컵"]], key: "user_id", lab: "item" }, msg: "키로 맞추면 곱집합이 아니다." },
];

let left: Table;
let right: Table;
let msg = "";
let nosql = false;
let result: Pair[] = [];
let drag: Hit | null = null;
let ghosts: Ghost[] = [];
let need = 2;

function colI(t: Table, name: string) {
  return t.cols.indexOf(name);
}

function load(api: KnowApi) {
  const L = LV[api.level];
  left = L.left;
  right = L.right;
  msg = L.msg;
  nosql = Boolean(L.nosql);
  result = [];
  drag = null;
  ghosts = [];
  need = Math.min(2, L.right.rows.filter((r) => L.left.rows.some((a) => a[colI(L.left, L.left.key)] === r[colI(L.right, L.right.key)])).length);
}

function drawTable(f: KnowFrame, t: Table, x: number, y: number, tw: number, side: "L" | "R"): Hit[] {
  const { ctx, api } = f;
  const pal = api.pal;
  const n = t.cols.length;
  const cw = tw / n;
  const rh = 44;
  const hits: Hit[] = [];
  label(ctx, t.name, x + 4, y - 12, pal.muted, 11, "left");
  t.cols.forEach((c, ci) => {
    const cx = x + ci * cw;
    const key = c === t.key;
    fillRound(ctx, cx, y, cw - 2, rh, 6, key ? pal.accent : pal.fill);
    label(ctx, c, cx + (cw - 2) / 2, y + rh / 2, key ? pal.bg : pal.fg, 12, "center");
    hits.push({ side, col: c, row: -1, val: "", x: cx, y, w: cw - 2, h: rh });
  });
  t.rows.forEach((r, ri) => {
    r.forEach((cell, ci) => {
      const cx = x + ci * cw;
      const cy = y + (ri + 1) * rh;
      const key = t.cols[ci] === t.key;
      const used = result.some((p) => (side === "L" ? p.a === r[colI(t, t.lab)] : p.b === r[colI(t, t.lab)]));
      fillRound(ctx, cx, cy, cw - 2, rh - 2, 6, used ? pal.fill : pal.fill);
      strokeRound(ctx, cx, cy, cw - 2, rh - 2, 6, used ? pal.ok : key ? pal.accent : pal.line, used || key ? 1.6 : 1);
      label(ctx, cell, cx + (cw - 2) / 2, cy + (rh - 2) / 2, pal.fg, 13, "center");
      hits.push({ side, col: t.cols[ci], row: ri, val: cell, x: cx, y: cy, w: cw - 2, h: rh - 2 });
    });
  });
  return hits;
}

function explode(f: KnowFrame) {
  const { w, h, api } = f;
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12;
    ghosts.push({
      x: w / 2,
      y: h * 0.42,
      vx: Math.cos(a) * (80 + (i % 4) * 30),
      vy: Math.sin(a) * (60 + (i % 3) * 24),
      life: 0.9,
      t: `${(i % 3) + 1}x${Math.floor(i / 3) + 1}`,
    });
  }
  api.miss(api.level === 8 || api.level === 1 ? "곱집합. 키로 맞추세요." : "잘못된 열입니다. 키로 이으세요.");
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, dt, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "조인 키", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 13, "left");

  const tw = Math.min(168, (w - 36) / 2);
  const y = 86;
  const lx = 12;
  const rx = w - 12 - tw;
  const lh = drawTable(f, left, lx, y, tw, "L");
  const rh = drawTable(f, right, rx, y, tw, "R");
  const hits = [...lh, ...rh];

  if (justDown && api.hold <= 0) {
    const hit = hits.find((c) => c.side === "L" && c.row >= 0 && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
    if (hit) drag = hit;
  }
  if (drag && ptr.down) {
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = drag.col === left.key ? pal.accent : pal.bad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(drag.x + drag.w / 2, drag.y + drag.h / 2);
    ctx.lineTo(ptr.x, ptr.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
  }
  if (justUp && drag && api.hold <= 0) {
    const drop = hits.find((c) => c.side === "R" && c.row >= 0 && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
    if (drop) {
      const keyOk = drag.col === left.key && drop.col === right.key;
      const nameTrap = nosql && drag.col === left.lab && drop.col === right.lab;
      if (!keyOk || nameTrap) explode(f);
      else {
        const lrow = left.rows[drag.row];
        const rrow = right.rows[drop.row];
        const lv = lrow[colI(left, left.key)];
        const rv = rrow[colI(right, right.key)];
        if (lv === rv) {
          const a = lrow[colI(left, left.lab)];
          const b = rrow[colI(right, right.lab)];
          if (!result.some((p) => p.a === a && p.b === b)) {
            result.push({ a, b });
            popAt(api, drop.x + drop.w / 2, drop.y + drop.h / 2, pal.ok, 10);
            if (result.length >= need) api.succeed(msg);
            else api.setCoach(`${a} · ${b}. 남은 키를 맞추세요.`);
          }
        } else api.miss("키가 다릅니다.");
      }
    }
    drag = null;
  }

  const ry = y + 4 * 44 + 18;
  label(ctx, "결과", 16, ry, pal.muted, 11, "left");
  const shown = result.slice();
  left.rows.forEach((r) => {
    const lab = r[colI(left, left.lab)];
    const kv = r[colI(left, left.key)];
    const has = right.rows.some((rr) => rr[colI(right, right.key)] === kv);
    if (!has && result.length > 0) shown.push({ a: lab, b: "없음" });
  });
  const cw = Math.min(150, (w - 36) / 2);
  shown.forEach((p, i) => {
    const x = 12 + (i % 2) * (cw + 10);
    const yy = ry + 10 + Math.floor(i / 2) * 36;
    fillRound(ctx, x, yy, cw, 32, 8, p.b === "없음" ? pal.fill : pal.fill);
    strokeRound(ctx, x, yy, cw, 32, 8, p.b === "없음" ? pal.line : pal.ok, 1);
    label(ctx, `${p.a} · ${p.b}`, x + cw / 2, yy + 16, p.b === "없음" ? pal.muted : pal.fg, 12, "center");
  });

  for (const g of ghosts) {
    g.life -= dt;
    g.x += g.vx * dt;
    g.y += g.vy * dt;
    ctx.globalAlpha = Math.max(0, g.life);
    fillRound(ctx, g.x - 22, g.y - 12, 44, 24, 6, "rgba(196,122,114,0.35)");
    label(ctx, g.t, g.x, g.y, pal.bad, 11, "center");
    ctx.globalAlpha = 1;
  }
  ghosts = ghosts.filter((g) => g.life > 0);

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.2, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("db", canvas, hooks, SLATE, { load, step });
}
