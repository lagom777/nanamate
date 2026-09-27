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

type Bone = "주장" | "근거" | "예시" | "반론" | "맺음";
type Role = Bone | "쓰레기";

type Chip = {
  text: string;
  role: Role;
  placed: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Pack = {
  order: Bone[];
  lines: { text: string; role: Role }[];
  win: string;
};

const BONES: Bone[] = ["주장", "근거", "예시", "반론", "맺음"];

const LV: Pack[] = [
  {
    order: BONES,
    lines: [
      { text: "원격은 집중을 늘린다", role: "주장" },
      { text: "출퇴근이 사라진다", role: "근거" },
      { text: "오전에 두 시간이 남았다", role: "예시" },
      { text: "협업이 줄 수 있다", role: "반론" },
      { text: "그래서 규칙을 먼저 정한다", role: "맺음" },
      { text: "도시는 녹지가 더 필요하다", role: "쓰레기" },
    ],
    win: "한 문단 한 주장. 다른 주장은 버린다.",
  },
  {
    order: BONES,
    lines: [
      { text: "주어와 서술어는 호응해야 한다", role: "주장" },
      { text: "주어가 단일이면 서술도 단일이다", role: "근거" },
      { text: "위원회는 결론을 발표한다", role: "예시" },
      { text: "복수처럼 들려 흔들리기도 한다", role: "반론" },
      { text: "그래서 주어를 먼저 붙든다", role: "맺음" },
      { text: "접속사는 문장을 길게 만든다", role: "쓰레기" },
    ],
    win: "주어와 서술어가 맞아야 뼈가 선다.",
  },
  {
    order: BONES,
    lines: [
      { text: "수면이 판단력을 가른다", role: "주장" },
      { text: "전전두 활동이 줄어든다", role: "근거" },
      { text: "야간 근무 뒤 실수가 늘었다", role: "예시" },
      { text: "커피로 버틸 수 있다는 말도 있다", role: "반론" },
      { text: "그래서 잠을 먼저 지킨다", role: "맺음" },
      { text: "운동은 근력에 도움이 된다", role: "쓰레기" },
    ],
    win: "주장에서 근거, 예시, 반론, 맺음.",
  },
  {
    order: BONES,
    lines: [
      { text: "기록만 남기면 협업은 산다", role: "주장" },
      { text: "비동기 기록이 결정을 남긴다", role: "근거" },
      { text: "주간 회고로 빈칸을 메웠다", role: "예시" },
      { text: "원격은 협업을 죽인다는 말이 있다", role: "반론" },
      { text: "그래서 규칙을 먼저 적는다", role: "맺음" },
      { text: "카페 창가 자리가 좋다", role: "쓰레기" },
    ],
    win: "반론을 불러 다시 닫았다.",
  },
  {
    order: BONES,
    lines: [
      { text: "밤은 판단을 줄인다", role: "주장" },
      { text: "전전두는 자정에 먼저 꺼진다", role: "근거" },
      { text: "회의실에 커피 잔만 남았다", role: "예시" },
      { text: "마감은 밤을 부른다는 말도 있다", role: "반론" },
      { text: "그래서 낮에 끝을 낸다", role: "맺음" },
      { text: "야근 수당을 올려야 한다", role: "쓰레기" },
    ],
    win: "장면 한 줄이 주장을 붙든다.",
  },
  {
    order: ["맺음", "주장", "근거", "예시", "반론"],
    lines: [
      { text: "이번 주 배송을 미룬다", role: "맺음" },
      { text: "부품이 목요일에야 들어온다", role: "주장" },
      { text: "조립은 부품 뒤에만 가능하다", role: "근거" },
      { text: "지난번에도 하루를 비웠다", role: "예시" },
      { text: "고객이 기다리지 않을 수 있다", role: "반론" },
      { text: "사무실 화분을 갈아야 한다", role: "쓰레기" },
    ],
    win: "실용문은 결론이 위, 이유가 아래.",
  },
  {
    order: BONES,
    lines: [
      { text: "왜 도시는 밤에도 밝은가?", role: "주장" },
      { text: "조명이 안전을 판 대신 잠을 샀다", role: "근거" },
      { text: "자정에도 가로등이 창을 연다", role: "예시" },
      { text: "어두운 골목이 더 위험하다는 말도 있다", role: "반론" },
      { text: "밝기를 줄이는 일이 답이다", role: "맺음" },
      { text: "지하철 요금을 내려야 한다", role: "쓰레기" },
    ],
    win: "서론이 질문을 열고 결론이 닫는다.",
  },
  {
    order: BONES,
    lines: [
      { text: "군더더기는 뼈를 가린다", role: "주장" },
      { text: "빼는 일이 쓰는 일의 반이다", role: "근거" },
      { text: "매우와 개인적으로를 지웠다", role: "예시" },
      { text: "수식어가 리듬을 살린다는 말도 있다", role: "반론" },
      { text: "그래서 한 줄씩 깎는다", role: "맺음" },
      { text: "오늘 점심은 김치찌개였다", role: "쓰레기" },
      { text: "사실 날씨가 매우 좋다", role: "쓰레기" },
    ],
    win: "빼는 일이 쓰는 일의 반.",
  },
  {
    order: BONES,
    lines: [
      { text: "초안은 기계, 판단은 사람이다", role: "주장" },
      { text: "사실과 윤리는 사람이 확인한다", role: "근거" },
      { text: "숫자가 원문과 같은지 맞춰 본다", role: "예시" },
      { text: "속도가 정확을 이긴다는 말도 있다", role: "반론" },
      { text: "그래서 판단을 남긴다", role: "맺음" },
      { text: "인공지능은 혁명이다", role: "쓰레기" },
      { text: "다양한 관점에서 살펴보겠습니다", role: "쓰레기" },
    ],
    win: "초안은 기계, 판단은 사람.",
  },
];

let pack: Pack = LV[0]!;
let chips: Chip[] = [];
let drag: Chip | null = null;
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
  pack = LV[api.level] ?? LV[0]!;
  chips = mix(pack.lines).map((c) => ({
    ...c,
    placed: null,
    x: 0,
    y: 0,
    w: 120,
    h: 52,
  }));
  drag = null;
}

function lines(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, color: string, size: number, maxW: number) {
  ctx.font = `500 ${size}px Pretendard, 'Pretendard Variable', sans-serif`;
  const rows = wrapText(ctx, text, maxW);
  const lh = size + 4;
  const start = cy - ((rows.length - 1) * lh) / 2;
  rows.forEach((ln, i) => label(ctx, ln, cx, start + i * lh, color, size, "center"));
}

function filled(role: string) {
  return chips.find((c) => c.placed === role);
}

function complete() {
  const bones = pack.order.every((r) => filled(r)?.role === r);
  const extras = chips.filter((c) => c.role === "쓰레기").every((c) => c.placed === "쓰레기");
  return bones && extras;
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  const pal = api.pal;
  head(ctx, w, "문단의 뼈", api.level + 1, pal);
  label(ctx, api.note || api.teach, 16, 44, pal.muted, 13, "left");

  const loose = chips.filter((c) => !c.placed);
  const n = Math.max(1, loose.length);
  const cols = n <= 3 ? n : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const gap = 8;
  const ch = 52;
  const cw = Math.max(96, (w - 24 - gap * (cols - 1)) / cols);
  const trayH = rows * ch + (rows - 1) * gap;
  const trayY = h - 12 - trayH;
  loose.forEach((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const rowN = Math.min(cols, n - row * cols);
    const rowW = rowN * cw + (rowN - 1) * gap;
    const x0 = (w - rowW) / 2;
    c.w = cw;
    c.h = ch;
    if (drag !== c) {
      c.x = x0 + col * (cw + gap);
      c.y = trayY + row * (ch + gap);
    }
  });

  const trashW = Math.max(84, Math.min(100, w * 0.22));
  const top = 58;
  const slotX = 12;
  const slotW = w - trashW - 32;
  const avail = Math.max(48, trayY - 8 - top);
  const sg = 5;
  const sh = Math.max(48, Math.min(56, (avail - sg * 4) / 5));
  const slots = pack.order.map((role, i) => ({
    role,
    x: slotX,
    y: top + i * (sh + sg),
    w: slotW,
    h: sh,
  }));
  const trash = { x: w - 12 - trashW, y: top, w: trashW, h: 5 * sh + 4 * sg };

  if (justDown && api.hold <= 0) {
    const hit = [...chips].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
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
    const cx = drag.x + drag.w / 2;
    const cy = drag.y + drag.h / 2;
    const slot = slots.find((s) => inRect(cx, cy, s.x, s.y, s.w, s.h));
    const onTrash = inRect(cx, cy, trash.x, trash.y, trash.w, trash.h);
    if (slot) {
      if (filled(slot.role)) {
        api.miss("이미 채워진 칸입니다.");
      } else if (drag.role === slot.role) {
        drag.placed = slot.role;
        popAt(api, slot.x + slot.w / 2, slot.y + slot.h / 2, pal.ok, 10);
        api.setCoach(`${slot.role}에 앉았습니다.`);
        if (complete()) api.succeed(pack.win);
      } else if (drag.role === "쓰레기") {
        api.miss("그건 뼈가 아닙니다. 버림으로.");
      } else {
        api.miss("그 칸의 기능이 아닙니다.");
      }
    } else if (onTrash) {
      if (drag.role === "쓰레기") {
        drag.placed = "쓰레기";
        popAt(api, trash.x + trash.w / 2, trash.y + 28, pal.ok, 10);
        api.setCoach("뼈가 아닌 문장을 버렸습니다.");
        if (complete()) api.succeed(pack.win);
      } else {
        api.miss("그건 뼈입니다. 칸에 두세요.");
      }
    }
    drag = null;
  }

  for (const s of slots) {
    const put = filled(s.role);
    fillRound(ctx, s.x, s.y, s.w, s.h, 10, pal.fill);
    strokeRound(ctx, s.x, s.y, s.w, s.h, 10, put ? pal.ok : pal.line, put ? 2 : 1);
    label(ctx, s.role, s.x + 10, s.y + 13, pal.muted, 11, "left");
    if (put) lines(ctx, put.text, s.x + s.w / 2, s.y + s.h / 2 + 6, pal.fg, 13, s.w - 18);
  }

  const dumped = chips.filter((c) => c.placed === "쓰레기");
  fillRound(ctx, trash.x, trash.y, trash.w, trash.h, 10, pal.fill);
  strokeRound(ctx, trash.x, trash.y, trash.w, trash.h, 10, dumped.length ? pal.ok : pal.line, dumped.length ? 2 : 1);
  label(ctx, "버림", trash.x + trash.w / 2, trash.y + 16, pal.muted, 12, "center");
  dumped.forEach((c, i) => {
    lines(ctx, c.text, trash.x + trash.w / 2, trash.y + 40 + i * 36, pal.fg, 11, trash.w - 12);
  });

  for (const c of chips) {
    if (c.placed) continue;
    const hot = drag === c;
    fillRound(ctx, c.x, c.y, c.w, c.h, 10, hot ? pal.accent : pal.fill);
    strokeRound(ctx, c.x, c.y, c.w, c.h, 10, hot ? pal.accent : pal.line, hot ? 2 : 1);
    lines(ctx, c.text, c.x + c.w / 2, c.y + c.h / 2, hot ? pal.bg : pal.fg, 13, c.w - 14);
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, h * 0.2, pal.ok, 16, "center");
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("writing", canvas, hooks, PAPER, { load, step });
}
