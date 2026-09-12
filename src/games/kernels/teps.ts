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

type Chip = { id: string; text: string; role: string; x: number; y: number; w: number; h: number; placed?: string };
type Slot = { id: string; label: string; accept: string; text?: string; x: number; y: number; w: number; h: number };
type Spec = {
  title: string;
  body: string[];
  slots: { id: string; label: string; accept: string }[];
  chips: { text: string; role: string }[];
  why: string;
};

const BANK: Spec[][] = [
  [
    {
      title: "mitigate",
      body: ["같은 방향만 동의. 반의어는 함정 칸."],
      slots: [
        { id: "ok", label: "동의", accept: "ok" },
        { id: "trap", label: "함정(반의)", accept: "trap" },
      ],
      chips: [
        { text: "완화하다", role: "ok" },
        { text: "악화시키다", role: "trap" },
        { text: "운반하다", role: "x" },
      ],
      why: "mitigate = 덜다. exacerbate가 짝 함정.",
    },
    {
      title: "refuse / decline / deny",
      body: ["거절하다와 부인하다는 다르다. deny는 '사실이 아니다'."],
      slots: [
        { id: "ref", label: "refuse", accept: "ref" },
        { id: "den", label: "deny", accept: "den" },
      ],
      chips: [
        { text: "거절하다", role: "ref" },
        { text: "사실이 아니라고 하다", role: "den" },
        { text: "연기하다", role: "x" },
      ],
      why: "decline은 공손한 refuse. deny는 진술의 부정.",
    },
    {
      title: "imply / infer",
      body: ["말하는 쪽이 imply, 듣는 쪽이 infer."],
      slots: [
        { id: "im", label: "imply", accept: "im" },
        { id: "in", label: "infer", accept: "in" },
      ],
      chips: [
        { text: "암시하다", role: "im" },
        { text: "추론하다", role: "in" },
        { text: "강조하다", role: "x" },
      ],
      why: "작가가 imply, 독자가 infer. 주어를 보면 갈린다.",
    },
  ],
  [
    {
      title: "Could you send the file by noon?",
      body: ["말의 기능. 요청 · 거절 · 제안 · 정보."],
      slots: [{ id: "fn", label: "기능", accept: "요청" }],
      chips: [
        { text: "요청", role: "요청" },
        { text: "거절", role: "거절" },
        { text: "제안", role: "제안" },
        { text: "정보", role: "정보" },
      ],
      why: "Could you… 는 공손한 요청.",
    },
    {
      title: "I'm afraid Tuesday won't work for us.",
      body: ["I'm afraid + 안 됨 = 거절. 사과 형식을 빌린다."],
      slots: [{ id: "fn", label: "기능", accept: "거절" }],
      chips: [
        { text: "거절", role: "거절" },
        { text: "요청", role: "요청" },
        { text: "제안", role: "제안" },
        { text: "정보", role: "정보" },
      ],
      why: "I'm afraid … won't work 는 거절의 정석.",
    },
    {
      title: "Why don't we split the work and meet Friday?",
      body: ["Why don't we… 는 제안이지 질문이 아니다."],
      slots: [{ id: "fn", label: "기능", accept: "제안" }],
      chips: [
        { text: "제안", role: "제안" },
        { text: "요청", role: "요청" },
        { text: "거절", role: "거절" },
        { text: "정보", role: "정보" },
      ],
      why: "Why don't we / How about / Let's = 제안.",
    },
    {
      title: "Just so you know, the lab closes at six.",
      body: ["Just so you know는 행동을 요구하지 않는다."],
      slots: [{ id: "fn", label: "기능", accept: "정보" }],
      chips: [
        { text: "정보", role: "정보" },
        { text: "요청", role: "요청" },
        { text: "거절", role: "거절" },
        { text: "제안", role: "제안" },
      ],
      why: "알림만 있으면 정보. 동사 명령이 없다.",
    },
  ],
  [
    {
      title: "강의 · 주제와 세부",
      body: [
        "Most people think hours of sleep matter most.",
        "In fact, sleep quality — continuity — predicts next-day recall.",
        "A 2019 study used word lists after interrupted REM.",
        "Caffeine was not controlled.",
      ],
      slots: [
        { id: "topic", label: "주제", accept: "topic" },
        { id: "det", label: "세부(실험)", accept: "det" },
        { id: "lim", label: "한계", accept: "lim" },
      ],
      chips: [
        { text: "질의 연속성이 기억", role: "topic" },
        { text: "REM 방해 + 단어 목록", role: "det" },
        { text: "카페인 통제 안 함", role: "lim" },
        { text: "수면 시간이 핵심", role: "x" },
      ],
      why: "Most people think… In fact… 에서 In fact가 주제.",
    },
  ],
  [
    {
      title: "scarce",
      body: ["희소. 반의는 plentiful. rare는 겹치지만 '진귀' 쪽."],
      slots: [
        { id: "ok", label: "동의", accept: "ok" },
        { id: "trap", label: "함정", accept: "trap" },
      ],
      chips: [
        { text: "부족한, 드문", role: "ok" },
        { text: "풍부한", role: "trap" },
        { text: "둥근", role: "x" },
      ],
      why: "scarce = 양이 적다. rare = 드물고 특별하다. 교집합이지 동일하지 않다.",
    },
    {
      title: "economic / economical",
      body: ["economic은 경제의. economical은 절약하는."],
      slots: [
        { id: "ec", label: "economic", accept: "ec" },
        { id: "al", label: "economical", accept: "al" },
      ],
      chips: [
        { text: "경제의, 경제학의", role: "ec" },
        { text: "절약되는", role: "al" },
        { text: "비싼", role: "x" },
      ],
      why: "economic policy / economical car. 접미사 하나가 뜻을 가른다.",
    },
    {
      title: "reluctant",
      body: ["마지못함. 반대는 eager. hesitant는 겹치되 '망설임'이지 거절은 아니다."],
      slots: [
        { id: "ok", label: "동의", accept: "ok" },
        { id: "trap", label: "함정", accept: "trap" },
      ],
      chips: [
        { text: "마지못한", role: "ok" },
        { text: "열망하는", role: "trap" },
        { text: "정확한", role: "x" },
      ],
      why: "reluctant ≈ unwilling. hesitant는 더 약한 망설임.",
    },
  ],
  [
    {
      title: "The committee ____ decided to delay the vote.",
      body: ["집합명사가 한 몸으로 움직이면 단수."],
      slots: [{ id: "v", label: "동사", accept: "ok" }],
      chips: [
        { text: "has", role: "ok" },
        { text: "have", role: "no" },
        { text: "are", role: "no" },
        { text: "were", role: "no" },
      ],
      why: "committee + 하나의 결정 = has. 구성원이 따로면 have.",
    },
    {
      title: "Each of the reports ____ missing a signature.",
      body: ["Each of + 복수여도 동사는 단수."],
      slots: [{ id: "v", label: "동사", accept: "ok" }],
      chips: [
        { text: "was", role: "ok" },
        { text: "were", role: "no" },
        { text: "are", role: "no" },
        { text: "have", role: "no" },
      ],
      why: "Each / every / neither → 단수.",
    },
    {
      title: "If I had known, I ____ have called.",
      body: ["가정법 과거완료. had pp → would have pp."],
      slots: [{ id: "v", label: "조동사", accept: "ok" }],
      chips: [
        { text: "would", role: "ok" },
        { text: "will", role: "no" },
        { text: "can", role: "no" },
        { text: "was", role: "no" },
      ],
      why: "과거 사실의 반대 = would have. will은 미래.",
    },
    {
      title: "She suggested that he ____ early.",
      body: ["suggest/insist/demand that + 원형 (가정법 현재)."],
      slots: [{ id: "v", label: "동사", accept: "ok" }],
      chips: [
        { text: "leave", role: "ok" },
        { text: "leaves", role: "no" },
        { text: "left", role: "no" },
        { text: "leaving", role: "no" },
      ],
      why: "suggest that + 원형. leaves는 직설법 함정.",
    },
  ],
  [
    {
      title: "문단의 뼈 — 첫 문장과 끝 문장",
      body: [
        "Cities trap heat at night.",
        "Asphalt stores the day's sun and releases it after dusk.",
        "Parks and rivers cool the edges of a block.",
        "So green space is policy, not décor.",
      ],
      slots: [
        { id: "first", label: "도입(주장)", accept: "first" },
        { id: "last", label: "맺음", accept: "last" },
      ],
      chips: [
        { text: "Cities trap heat at night.", role: "first" },
        { text: "So green space is policy, not décor.", role: "last" },
        { text: "Asphalt stores the day's sun.", role: "x" },
      ],
      why: "첫 문장이 현상, 끝이 so·therefore로 정책 결론.",
    },
  ],
  [
    {
      title: "본문에 있는가 — 추론 함정",
      body: [
        "Iron made tools cheap. Bronze was already precise.",
        "The difference was access, not rarity.",
        "Villages that could smelt iron armed more people.",
      ],
      slots: [
        { id: "in", label: "본문에 있음", accept: "in" },
        { id: "out", label: "본문에 없음", accept: "out" },
      ],
      chips: [
        { text: "철의 차이는 접근성이다", role: "in" },
        { text: "청동은 이미 정밀했다", role: "in" },
        { text: "철기 시대가 문자보다 앞선다", role: "out" },
      ],
      why: "추론 문항은 본문이 안 말한 시대 비교를 심는다.",
    },
    {
      title: "본문에 있는가 2",
      body: ["Villages that could smelt iron armed more people."],
      slots: [
        { id: "in", label: "본문에 있음", accept: "in" },
        { id: "out", label: "본문에 없음", accept: "out" },
      ],
      chips: [
        { text: "제련 가능한 마을이 더 무장했다", role: "in" },
        { text: "철이 청동보다 항상 강하다", role: "out" },
      ],
      why: "'더 무장'은 있음. '항상 강하다'는 본문이 안 함.",
    },
  ],
  [
    {
      title: "시간 — 모르는 문항은 건너뛴다",
      body: ["쉬운 두 칸을 먼저 채우고, 모르는 단어는 건너뛰기 칸으로."],
      slots: [
        { id: "e1", label: "쉬운 1", accept: "e1" },
        { id: "e2", label: "쉬운 2", accept: "e2" },
        { id: "skip", label: "건너뛰기", accept: "hard" },
      ],
      chips: [
        { text: "cat = 고양이", role: "e1" },
        { text: "run = 달리다", role: "e2" },
        { text: "pulchritude = ?", role: "hard" },
      ],
      why: "한 문항에 묶이면 세 문항을 잃는다. 먼저 건너뛴다.",
    },
  ],
  [
    {
      title: "약한 영역에 시간을 둔다",
      body: ["듣기 78 · 어휘 51 · 문법 70 · 독해 66.", "같은 한 시간이면 51을 올리는 편이 싸다."],
      slots: [
        { id: "L", label: "듣기 78", accept: "x" },
        { id: "V", label: "어휘 51", accept: "ok" },
        { id: "G", label: "문법 70", accept: "x" },
        { id: "R", label: "독해 66", accept: "x" },
      ],
      chips: [{ text: "공부 시간", role: "ok" }],
      why: "가장 낮은 칸을 한 구간 올리는 게 총점 효율.",
    },
  ],
];

type Mode = { title: string; body: string[]; slots: Slot[]; chips: Chip[]; why: string };

let itemI = 0;
let mode: Mode;
let drag: Chip | null = null;
let ox = 0;
let oy = 0;

function startItem(api: KnowApi) {
  drag = null;
  const spec = BANK[api.level][itemI];
  mode = {
    title: spec.title,
    body: spec.body,
    slots: spec.slots.map((s) => ({ ...s, x: 0, y: 0, w: 0, h: 0 })),
    chips: spec.chips.map((c, i) => ({
      id: `${i}`,
      text: c.text,
      role: c.role,
      x: 0,
      y: 0,
      w: 120,
      h: 48,
    })),
    why: spec.why,
  };
  api.setCoach(`${itemI + 1}/${BANK[api.level].length} · ${spec.why}`);
}

function load(api: KnowApi) {
  itemI = 0;
  startItem(api);
}

function clearItem(api: KnowApi, x: number, y: number) {
  popAt(api, x, y, api.pal.ok, 12);
  const why = mode.why;
  if (itemI + 1 < BANK[api.level].length) {
    itemI += 1;
    startItem(api);
    api.setNote(why);
  } else api.succeed(why);
}

function layoutChips(chips: Chip[], w: number, h: number) {
  const loose = chips.filter((c) => !c.placed);
  const stacked = loose.some((c) => c.text.length > 16) || loose.length > 4;
  if (stacked && loose.length <= 4) {
    const cw = w - 32;
    const ch = 42;
    loose.forEach((c, i) => {
      c.w = cw;
      c.h = ch;
      if (drag !== c) {
        c.x = 16;
        c.y = h - 14 - (loose.length - i) * (ch + 6);
      }
    });
    return;
  }
  const gap = 8;
  const n = Math.max(1, loose.length);
  const cw = Math.max(70, Math.min(168, (w - 24 - (n - 1) * gap) / n));
  const total = loose.length * cw + Math.max(0, loose.length - 1) * gap;
  const x0 = (w - total) / 2;
  loose.forEach((c, i) => {
    c.w = cw;
    c.h = 48;
    if (drag !== c) {
      c.x = x0 + i * (cw + gap);
      c.y = h - 58;
    }
  });
}

function drawChip(ctx: CanvasRenderingContext2D, c: Chip, hot: boolean, pal: KnowApi["pal"]) {
  fillRound(ctx, c.x, c.y, c.w, c.h, 8, hot ? pal.accent : pal.fill);
  strokeRound(ctx, c.x, c.y, c.w, c.h, 8, pal.line);
  const color = hot ? pal.bg : pal.fg;
  ctx.font = "500 12px Pretendard, 'Pretendard Variable', sans-serif";
  const lines = wrapText(ctx, c.text, c.w - 12);
  const fs = lines.length > 1 ? 11 : 12;
  lines.slice(0, 2).forEach((ln, i) => {
    label(ctx, ln, c.x + c.w / 2, c.y + c.h / 2 + (i - (Math.min(lines.length, 2) - 1) / 2) * 14, color, fs, "center");
  });
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  const bank = BANK[api.level];
  head(ctx, w, `텝스  ·  ${itemI + 1}/${bank.length}`, api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 12, "left");
  display(ctx, mode.title, 16, 66, api.pal.fg, 15, "left");
  let by = 86;
  ctx.font = "500 12px Pretendard, 'Pretendard Variable', sans-serif";
  mode.body.forEach((line) => {
    const lines = wrapText(ctx, line, w - 32);
    lines.forEach((ln) => {
      label(ctx, ln, 16, by, api.pal.muted, 12, "left");
      by += 16;
    });
  });
  const top = Math.min(h * 0.5, by + 10);
  const cols = mode.slots.length >= 4 ? 2 : 1;
  const sw = cols === 1 ? w - 32 : (w - 40) / 2;
  const sh = 48;
  mode.slots.forEach((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    s.x = 16 + col * (sw + 8);
    s.y = top + row * (sh + 6);
    s.w = sw;
    s.h = sh;
    fillRound(ctx, s.x, s.y, s.w, s.h, 8, api.pal.fill);
    strokeRound(ctx, s.x, s.y, s.w, s.h, 8, s.text ? api.pal.ok : api.pal.line);
    label(ctx, s.label, s.x + 10, s.y + 13, api.pal.muted, 11, "left");
    if (s.text) label(ctx, s.text, s.x + 10, s.y + 32, api.pal.fg, 13, "left");
  });

  layoutChips(mode.chips, w, h);
  if (justDown && api.hold <= 0) {
    const hit = [...mode.chips].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
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
    const x = drag.x + drag.w / 2;
    const y = drag.y + drag.h / 2;
    const hit = mode.slots.find((s) => inRect(x, y, s.x, s.y, s.w, s.h));
    if (hit) {
      if (drag.role === hit.accept && !hit.text) {
        drag.placed = hit.id;
        hit.text = drag.text;
        popAt(api, x, y, api.pal.ok, 8);
        const need = mode.slots.filter((s) => s.accept !== "x").length;
        const got = mode.slots.filter((s) => s.accept !== "x" && s.text).length;
        if (got >= need) clearItem(api, x, y);
        else api.setCoach(`${hit.label} ← ${drag.text}`);
      } else api.miss("그 칸이 아닙니다.");
    }
    drag = null;
  }
  for (const c of mode.chips) if (!c.placed) drawChip(ctx, c, drag === c, api.pal);
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("teps", canvas, hooks, PAPER, { load, step });
}
