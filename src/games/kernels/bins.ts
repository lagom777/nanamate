import { PAPER } from "@/lib/games/draw";
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
  wrapText,
  type KnowApi,
  type KnowFrame,
} from "@/lib/games/know";

type Area = "헌법" | "민법" | "형법";
type Chip = { text: string; ok: boolean; x: number; y: number; placed: boolean };
type Case = {
  fact: string;
  area: Area;
  why: string;
  miss: Partial<Record<Area, string>>;
  need: string[];
  decoys: string[];
  verdict: string;
};

const AREAS: Area[] = ["헌법", "민법", "형법"];

const CASES: Case[] = [
  {
    fact: "친구가 빌린 돈을 기한이 지나도 갚지 않는다. 당신은 그 돈을 돌려받고 싶다.",
    area: "민법",
    why: "사인간의 빚은 민법의 채권이다.",
    miss: {
      헌법: "헌법은 국가와 기본권의 물음이다. 친구의 빚은 사인간의 채권이다.",
      형법: "돈을 안 갚는 것만으로는 죄가 되지 않는다. 이행을 청구하는 민법이다.",
    },
    need: ["채권-채무", "계약위반"],
    decoys: ["형벌"],
    verdict: "민법상 대여금 채권이 성립한다.",
  },
  {
    fact: "시민들이 집회를 신고하고 거리에 모였다. 경찰이 해산 명령을 내렸다.",
    area: "헌법",
    why: "집회·시위의 자유는 헌법 기본권이다. 국가가 제한할 때 법률유보가 묻힌다.",
    miss: {
      민법: "민법은 사인간의 계약이다. 해산 명령은 국가가 시민에게 가하는 제한이다.",
      형법: "집회 자체는 죄가 아니다. 먼저 기본권 제한의 요건을 본다.",
    },
    need: ["기본권 제한", "법률유보"],
    decoys: ["사인간 계약"],
    verdict: "집회의 자유 제한에는 법률유보가 필요하다.",
  },
  {
    fact: "중고차 판매자가 엔진 하자를 숨기고 차를 팔았다. 산 사람은 계약을 취소하고 싶다.",
    area: "민법",
    why: "매매는 사인간의 계약이다. 하자와 기망은 착오·사기와 취소의 물음이다.",
    miss: {
      헌법: "탄핵이나 기본권 심사가 아니다. 두 사람 사이의 매매다.",
      형법: "기망이 있으면 사기가 될 수 있으나, 이 판은 취소의 민법이다.",
    },
    need: ["착오·사기", "취소"],
    decoys: ["절도"],
    verdict: "사기를 이유로 계약을 취소할 수 있다.",
  },
  {
    fact: "타인의 자전거를 몰래 가져갔다. 바로 중고로 팔아 돈을 챙겼다.",
    area: "형법",
    why: "타인의 재물을 절취하여 영득한 행위는 형법 절도죄의 물음이다.",
    miss: {
      헌법: "기본권·통치 구조가 아니다. 타인의 재물에 대한 죄다.",
      민법: "반환 청구가 겹칠 수 있으나, 몰래 가져가 판 행위는 먼저 죄의 요건이다.",
    },
    need: ["불법영득", "고의"],
    decoys: ["과실"],
    verdict: "절도죄가 성립한다.",
  },
  {
    fact: "수사기관이 영장 없이 휴대전화를 압수해 들여다보았다.",
    area: "헌법",
    why: "체포·압수·수색은 영장주의의 헌법 문제다.",
    miss: {
      민법: "압수는 사인간 계약이 아니다. 공권력이 신체를 넘는 강제다.",
      형법: "압수 자체의 죄를 묻기 전에, 영장 없는 강제처분의 한계를 본다.",
    },
    need: ["영장주의"],
    decoys: ["영장 불요", "사인간 계약"],
    verdict: "영장 없는 압수는 원칙적으로 위헌이다.",
  },
  {
    fact: "운전자의 과실로 보행자가 다쳤다. 형사 책임을 묻는다.",
    area: "형법",
    why: "과실치상은 형법이다. 과실과 결과가 맞닿아야 한다.",
    miss: {
      헌법: "교통사고의 형사 책임은 기본권 심사가 아니다.",
      민법: "손해배상은 민법이지만, 이 판은 과실치상의 형법이다.",
    },
    need: ["과실", "결과"],
    decoys: ["고의"],
    verdict: "과실치상죄가 성립할 수 있다.",
  },
  {
    fact: "회사가 근로자에게 이유를 대지 않고 해고를 통보했다. 근로자는 복직을 원한다.",
    area: "민법",
    why: "근로는 민법상 계약에 노동법이 겹친다. 개별 해고는 계약의 해지다.",
    miss: {
      헌법: "근로의 권리가 헌법에 있으나, 개별 해고는 근로계약의 종료다.",
      형법: "부당해고는 죄가 아니다. 정당한 이유와 구제의 문제다.",
    },
    need: ["계약", "해지"],
    decoys: ["형벌"],
    verdict: "정당한 이유 없는 해고는 무효다.",
  },
  {
    fact: "사실인 내용을 온라인에 공개해 타인의 명예를 훼손했다. 형사 고소를 검토한다.",
    area: "형법",
    why: "공연히 사실을 적시해 명예를 훼손하면 형법의 물음이다.",
    miss: {
      헌법: "표현의 자유가 겹치나, 이 판은 명예훼손의 구성요건이다.",
      민법: "위자료가 가능하나, 이 판의 물음은 형법 명예훼손이다.",
    },
    need: ["공연성", "사실적시"],
    decoys: ["모욕만"],
    verdict: "사실적시 명예훼손이 성립할 수 있다.",
  },
  {
    fact: "법률이 선거권 연령을 정한다. 그 범위가 참정권을 침해하는지가 다툼이다.",
    area: "헌법",
    why: "선거 연령은 참정권의 헌법 문제다.",
    miss: {
      민법: "나이의 법률 효과가 민법에 있으나, 선거권은 참정권이다.",
      형법: "선거 연령을 정하는 일은 죄가 아니다. 참정권의 범위다.",
    },
    need: ["참정권"],
    decoys: ["재산권", "형벌"],
    verdict: "선거 연령은 참정권의 헌법 문제다.",
  },
];

let phase: "area" | "elems" = "area";
let factX = 0;
let factY = 0;
let dragFact = false;
let chips: Chip[] = [];
let dragChip: Chip | null = null;
let ox = 0;
let oy = 0;

function mix<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

function load(api: KnowApi) {
  phase = "area";
  factX = 0;
  factY = 0;
  dragFact = false;
  chips = [];
  dragChip = null;
  api.setCoach("사실은 같고 물음이 갈라진다. 사실 카드를 조문으로 끌어 주세요.");
}

function factBox(w: number, h: number) {
  const reserve = 58 + 12 + 48 + 18;
  const fh = Math.max(64, Math.min(96, h - 58 - reserve));
  return { x: 16, y: 58, w: w - 32, h: fh };
}

function trays(w: number, h: number) {
  const gap = 8;
  const tw = (w - 32 - gap * 2) / 3;
  const th = 58;
  const y = h - th - 12;
  return AREAS.map((name, i) => ({ name, x: 16 + i * (tw + gap), y, w: tw, h: th }));
}

function seatChips(w: number, trayY: number) {
  const live = chips.filter((c) => !c.placed);
  const cw = Math.max(88, Math.min(132, (w - 24 - (live.length - 1) * 8) / Math.max(1, live.length)));
  const total = live.length * cw + Math.max(0, live.length - 1) * 8;
  const x0 = (w - total) / 2;
  live.forEach((c, i) => {
    if (dragChip !== c) {
      c.x = x0 + i * (cw + 8);
      c.y = trayY - 60;
    }
  });
}

function spawnChips(c: Case) {
  const raw = [...c.need.map((t) => ({ text: t, ok: true })), ...c.decoys.map((t) => ({ text: t, ok: false }))];
  chips = mix(raw).map((r) => ({ ...r, x: 0, y: 0, placed: false }));
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  const c = CASES[api.level] ?? CASES[0];
  head(ctx, w, "사실의 조문", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 12, "left");

  const fb = factBox(w, h);
  const ts = trays(w, h);
  if (factX === 0 && factY === 0) {
    factX = fb.x;
    factY = fb.y;
  }

  if (phase === "elems") seatChips(w, ts[0]!.y);
  const chipW =
    phase === "elems" ? Math.max(88, Math.min(132, (w - 24 - (chips.filter((x) => !x.placed).length - 1) * 8) / Math.max(1, chips.filter((x) => !x.placed).length))) : 100;

  if (justDown && api.hold <= 0) {
    if (phase === "area" && inRect(ptr.x, ptr.y, factX, factY, fb.w, fb.h)) {
      dragFact = true;
      ox = ptr.x - factX;
      oy = ptr.y - factY;
    } else if (phase === "elems") {
      const hit = [...chips].reverse().find((ch) => !ch.placed && inRect(ptr.x, ptr.y, ch.x, ch.y, chipW, 48));
      if (hit) {
        dragChip = hit;
        ox = ptr.x - hit.x;
        oy = ptr.y - hit.y;
      }
    }
  }
  if (dragFact && ptr.down) {
    factX = ptr.x - ox;
    factY = ptr.y - oy;
  }
  if (dragChip && ptr.down) {
    dragChip.x = ptr.x - ox;
    dragChip.y = ptr.y - oy;
  }
  if (justUp && dragFact) {
    const cx = factX + fb.w / 2;
    const cy = factY + fb.h / 2;
    const hit = ts.find((t) => inRect(cx, cy, t.x, t.y, t.w, t.h));
    if (hit) {
      if (hit.name === c.area) {
        phase = "elems";
        spawnChips(c);
        seatChips(w, ts[0]!.y);
        popAt(api, hit.x + hit.w / 2, hit.y + hit.h / 2, pal.ok, 12);
        api.setCoach(c.why);
        factX = fb.x;
        factY = fb.y;
      } else {
        api.miss(c.miss[hit.name] ?? "그 칸의 물음이 아니다.");
        factX = fb.x;
        factY = fb.y;
      }
    } else {
      factX = fb.x;
      factY = fb.y;
    }
    dragFact = false;
  }
  if (justUp && dragChip) {
    const file = ts.find((t) => t.name === c.area);
    const midX = dragChip.x + chipW / 2;
    const midY = dragChip.y + 24;
    if (file && inRect(midX, midY, file.x, file.y, file.w, file.h)) {
      if (dragChip.ok) {
        dragChip.placed = true;
        popAt(api, file.x + file.w / 2, file.y + file.h / 2, pal.ok, 10);
        api.setCoach(`${dragChip.text}. 요건을 모읍니다.`);
        const needLeft = c.need.filter((n) => !chips.some((ch) => ch.text === n && ch.placed));
        if (needLeft.length === 0) api.succeed(c.verdict);
      } else {
        api.miss("그 요건은 이 사건의 뼈가 아니다.");
      }
    }
    dragChip = null;
  }

  fillRound(ctx, factX, factY, fb.w, fb.h, 12, pal.fill);
  strokeRound(ctx, factX, factY, fb.w, fb.h, 12, dragFact ? pal.accent : pal.line, dragFact ? 1.8 : 1.2);
  label(ctx, "사실", factX + 14, factY + 16, pal.muted, 11, "left");
  const lines = wrapText(ctx, c.fact, fb.w - 28);
  lines.slice(0, 3).forEach((ln, i) => label(ctx, ln, factX + fb.w / 2, factY + 40 + i * 16, pal.fg, 13, "center"));

  for (const t of ts) {
    const filed = phase === "elems" && t.name === c.area;
    const hot = inRect(ptr.x, ptr.y, t.x, t.y, t.w, t.h);
    fillRound(ctx, t.x, t.y, t.w, t.h, 10, filed ? pal.bg : pal.fill);
    strokeRound(ctx, t.x, t.y, t.w, t.h, 10, filed ? pal.ok : hot ? pal.accent : pal.line, filed ? 2 : 1.2);
    label(ctx, t.name, t.x + t.w / 2, t.y + t.h / 2 - (filed ? 8 : 0), pal.fg, 16, "center");
    if (filed) label(ctx, "사건 기록", t.x + t.w / 2, t.y + t.h / 2 + 12, pal.ok, 11, "center");
  }

  if (phase === "elems") {
    label(ctx, "맞는 요건을 사건 기록으로", w / 2, ts[0]!.y - 72, pal.muted, 12, "center");
    for (const ch of chips) {
      if (ch.placed) continue;
      fillRound(ctx, ch.x, ch.y, chipW, 48, 10, dragChip === ch ? pal.accent : pal.fill);
      strokeRound(ctx, ch.x, ch.y, chipW, 48, 10, pal.line, 1.2);
      label(ctx, ch.text, ch.x + chipW / 2, ch.y + 24, dragChip === ch ? pal.bg : pal.fg, 13, "center");
    }
    const got = chips.filter((ch) => ch.placed).map((ch) => ch.text);
    if (got.length) label(ctx, got.join(" · "), w / 2, fb.y + fb.h + 16, pal.ok, 12, "center");
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.22, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("law", canvas, hooks, PAPER, { load, step });
}
