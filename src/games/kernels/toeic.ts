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
  wrapText,
  type KnowApi,
  type KnowFrame,
} from "@/lib/games/know";

type Chip = { id: string; text: string; role: string; x: number; y: number; w: number; h: number; placed?: string };
type Slot = { id: string; label: string; accept: string; text?: string; x: number; y: number; w: number; h: number };
type PhotoSpec = { k: "photo"; pose: "sit" | "carry" | "point"; ok: string; traps: string[]; why: string };
type SlotsSpec = {
  k: "slots";
  title: string;
  body: string[];
  slots: { id: string; label: string; accept: string }[];
  chips: { text: string; role: string }[];
  why: string;
};
type Spec = PhotoSpec | SlotsSpec;

const BANK: Spec[][] = [
  [
    {
      k: "photo",
      pose: "sit",
      ok: "A man is sitting on a bench.",
      traps: ["A man is about to sit down.", "A man is jogging past a bench."],
      why: "진행형은 지금 하는 동작. about to는 아직 안 앉음.",
    },
    {
      k: "photo",
      pose: "carry",
      ok: "A woman is carrying a cardboard box.",
      traps: ["A woman is opening a cardboard box.", "Boxes are stacked on a shelf."],
      why: "사진에 없는 동작(열다·쌓여 있다)은 오답.",
    },
    {
      k: "photo",
      pose: "point",
      ok: "A man is pointing at a chart.",
      traps: ["A man is writing on a whiteboard.", "Two people are shaking hands."],
      why: "사무실 소품이 비슷해도 동작이 다르면 틀린다.",
    },
  ],
  [
    {
      k: "slots",
      title: "Where did you put the invoices?",
      body: ["파트 2 · Wh-질문. Yes/No와 다른 의문사는 함정."],
      slots: [{ id: "r", label: "응답", accept: "ok" }],
      chips: [
        { text: "They're on your desk.", role: "ok" },
        { text: "Yes, I did.", role: "no" },
        { text: "At three o'clock.", role: "no" },
      ],
      why: "Where → 장소. Yes/No와 When은 질문이 바뀐 함정.",
    },
    {
      k: "slots",
      title: "Has the client confirmed the appointment?",
      body: ["Yes/No 질문. 장소·직업을 말하면 동문서답."],
      slots: [{ id: "r", label: "응답", accept: "ok" }],
      chips: [
        { text: "Not yet — I'll call her.", role: "ok" },
        { text: "In the conference room.", role: "no" },
        { text: "She's an accountant.", role: "no" },
      ],
      why: "확인 질문에는 확인·미확인. 장소/직업은 딴 소리.",
    },
    {
      k: "slots",
      title: "Would you like me to reserve a taxi?",
      body: ["제안. 수락하거나 거절한다. 이미 떠난 택시는 답이 아니다."],
      slots: [{ id: "r", label: "응답", accept: "ok" }],
      chips: [
        { text: "That would be great, thanks.", role: "ok" },
        { text: "No, it already left.", role: "no" },
        { text: "At the front desk.", role: "no" },
      ],
      why: "Would you like me to… 는 제안. 수락/거절만 맞다.",
    },
  ],
  [
    {
      k: "slots",
      title: "파트 3 · 전화 대화",
      body: [
        "A: Hi, this is Mark from Apex Shipping. I'm calling about order 4419.",
        "B: We still haven't received the crates.",
        "A: They left the warehouse Monday. I can send the tracking number.",
        "B: Please do — and call if they aren't here by Thursday.",
      ],
      slots: [
        { id: "목적", label: "목적", accept: "목적" },
        { id: "다음", label: "다음 행동", accept: "다음" },
        { id: "기한", label: "기한 단서", accept: "기한" },
      ],
      chips: [
        { text: "배송 확인", role: "목적" },
        { text: "송장번호 보내기", role: "다음" },
        { text: "목요일까지", role: "기한" },
        { text: "회의 일정 잡기", role: "x" },
      ],
      why: "파트 3는 목적 → 다음 행동 → 숫자/요일을 먼저 듣는다.",
    },
    {
      k: "slots",
      title: "파트 3 · 식당",
      body: ["A: Table for two, please.", "B: By the window?", "A: Yes — around seven."],
      slots: [
        { id: "목적", label: "목적", accept: "목적" },
        { id: "장소", label: "장소", accept: "장소" },
        { id: "시간", label: "시간", accept: "시간" },
      ],
      chips: [
        { text: "예약", role: "목적" },
        { text: "식당", role: "장소" },
        { text: "7시", role: "시간" },
        { text: "공항", role: "x" },
      ],
      why: "짧은 대화도 목적·장소·시간을 세 칸으로 고정한다.",
    },
  ],
  [
    {
      k: "slots",
      title: "파트 4 · 공항 안내",
      body: [
        "Attention passengers on Flight 208 to Osaka.",
        "This flight has been delayed due to weather.",
        "Please remain in the gate area. Boarding will begin at Gate 12 at 4:40.",
      ],
      slots: [
        { id: "누가", label: "청자", accept: "누가" },
        { id: "무엇", label: "핵심", accept: "무엇" },
        { id: "어디", label: "어디·언제", accept: "어디" },
      ],
      chips: [
        { text: "208편 승객", role: "누가" },
        { text: "기상 지연", role: "무엇" },
        { text: "12번 게이트 4:40", role: "어디" },
        { text: "탑승 완료", role: "x" },
      ],
      why: "안내는 청자 → 무슨 일 → 어디/언제 한 줄로 적는다.",
    },
    {
      k: "slots",
      title: "파트 4 · 사내 방송",
      body: [
        "This is building security.",
        "A fire drill will begin at 2 p.m. today.",
        "Use the stairs, not the elevators. Assemble in the north parking lot.",
      ],
      slots: [
        { id: "무엇", label: "무엇", accept: "무엇" },
        { id: "금지", label: "하지 말 것", accept: "금지" },
        { id: "어디", label: "집합", accept: "어디" },
      ],
      chips: [
        { text: "화재 대피 훈련", role: "무엇" },
        { text: "엘리베이터 금지", role: "금지" },
        { text: "북쪽 주차장", role: "어디" },
        { text: "퇴근 시간 변경", role: "x" },
      ],
      why: "지시 방송은 행동과 금지를 같이 듣는다.",
    },
  ],
  [
    {
      k: "slots",
      title: "The report ____ yesterday.",
      body: ["시제 + 태. yesterday면 과거. 보고서가 제출된 것이면 수동."],
      slots: [{ id: "b", label: "빈칸", accept: "ok" }],
      chips: [
        { text: "was submitted", role: "ok" },
        { text: "has submit", role: "no" },
        { text: "submitting", role: "no" },
        { text: "have submitted", role: "no" },
      ],
      why: "yesterday → 과거. 주어가 보고서 → was submitted.",
    },
    {
      k: "slots",
      title: "Neither of the applicants ____ qualified.",
      body: ["Neither/either/each는 단수 동사."],
      slots: [{ id: "b", label: "빈칸", accept: "ok" }],
      chips: [
        { text: "is", role: "ok" },
        { text: "are", role: "no" },
        { text: "have", role: "no" },
        { text: "were", role: "no" },
      ],
      why: "Neither of + 복수명사여도 동사는 단수.",
    },
    {
      k: "slots",
      title: "Please submit the form ____ Friday.",
      body: ["기한의 전치사. 그 날까지 포함하면 by."],
      slots: [{ id: "b", label: "빈칸", accept: "ok" }],
      chips: [
        { text: "by", role: "ok" },
        { text: "until", role: "no" },
        { text: "during", role: "no" },
        { text: "since", role: "no" },
      ],
      why: "submit는 한 점의 행동. until은 지속, by는 마감.",
    },
    {
      k: "slots",
      title: "The manager spoke ____ about the delay.",
      body: ["품사. spoke 다음엔 부사."],
      slots: [{ id: "b", label: "빈칸", accept: "ok" }],
      chips: [
        { text: "briefly", role: "ok" },
        { text: "brief", role: "no" },
        { text: "briefs", role: "no" },
        { text: "briefing", role: "no" },
      ],
      why: "동사 spoke를 수식하는 건 briefly.",
    },
  ],
  [
    {
      k: "slots",
      title: "파트 6 · 사내 메모",
      body: [
        "The cafeteria will close next week for renovation.",
        "____, boxed lunches will be provided in the lobby until 1 p.m.",
        "____ you have a client lunch, notify reception by Tuesday.",
      ],
      slots: [
        { id: "c1", label: "연결 1", accept: "c1" },
        { id: "c2", label: "연결 2", accept: "c2" },
      ],
      chips: [
        { text: "Meanwhile", role: "c1" },
        { text: "Unless", role: "c2" },
        { text: "However", role: "x" },
        { text: "Because", role: "x" },
      ],
      why: "닫히는 동안 = Meanwhile. 예외 조건 = Unless.",
    },
    {
      k: "slots",
      title: "Sales fell 8% in March. ____, we will expand marketing in April.",
      body: ["숫자가 나빠진 뒤 반대로 가면 However. 결과로 가면 Therefore."],
      slots: [{ id: "c", label: "연결어", accept: "ok" }],
      chips: [
        { text: "However", role: "ok" },
        { text: "Therefore", role: "no" },
        { text: "Moreover", role: "no" },
        { text: "Because", role: "no" },
      ],
      why: "하락 다음에 확장은 역접. Therefore면 하락을 원인으로 삼아 틀린다.",
    },
  ],
  [
    {
      k: "slots",
      title: "파트 7 · 메일 한 통",
      body: [
        "From: HR  ·  Subject: Parking permits",
        "Permits for 2026 must be renewed by March 15.",
        "Staff who commute by train do not need a permit.",
        "Apply at the security desk with your ID. Late applications: $20 fee.",
      ],
      slots: [
        { id: "목적", label: "목적", accept: "목적" },
        { id: "기한", label: "기한", accept: "기한" },
        { id: "제외", label: "허가 불필요", accept: "제외" },
      ],
      chips: [
        { text: "주차증 갱신 안내", role: "목적" },
        { text: "3월 15일", role: "기한" },
        { text: "기차 통근자", role: "제외" },
        { text: "경비팀 채용", role: "x" },
      ],
      why: "질문은 먼저 읽고, 본문에서 목적·숫자·예외만 건진다.",
    },
  ],
  [
    {
      k: "slots",
      title: "파트 7 · 메일 + 일정표",
      body: [
        "메일: Can we move the design review to Thursday 3 p.m.?",
        "일정: Wed 15:00  Room A  ·  Client call",
        "일정: Thu 15:00  Conference Room B  ·  Design review (tentative)",
      ],
      slots: [
        { id: "어디", label: "목 3시의 방", accept: "어디" },
        { id: "수", label: "수 3시는", accept: "수" },
      ],
      chips: [
        { text: "Conference Room B", role: "어디" },
        { text: "Client call", role: "수" },
        { text: "Gate 12", role: "x" },
        { text: "Legal office", role: "x" },
      ],
      why: "복수 지문은 메일에서 시간을, 표에서 장소를 교차한다.",
    },
  ],
  [
    {
      k: "slots",
      title: "We need to ____ a decision by Friday.",
      body: ["의사결정은 make. do a decision은 없다."],
      slots: [{ id: "v", label: "동사", accept: "ok" }],
      chips: [
        { text: "make", role: "ok" },
        { text: "do", role: "no" },
        { text: "have", role: "no" },
        { text: "give", role: "no" },
      ],
      why: "make a decision / reach a decision. do는 짝이 아니다.",
    },
    {
      k: "slots",
      title: "We cannot ____ the Friday deadline.",
      body: ["마감을 지키다 = meet a deadline."],
      slots: [{ id: "v", label: "동사", accept: "ok" }],
      chips: [
        { text: "meet", role: "ok" },
        { text: "catch", role: "no" },
        { text: "keep", role: "no" },
        { text: "hold", role: "no" },
      ],
      why: "meet a deadline. miss a deadline이 반대.",
    },
    {
      k: "slots",
      title: "I'd like to ____ an order for 200 units.",
      body: ["주문은 place. make an order는 비표준."],
      slots: [{ id: "v", label: "동사", accept: "ok" }],
      chips: [
        { text: "place", role: "ok" },
        { text: "make", role: "no" },
        { text: "put", role: "no" },
        { text: "do", role: "no" },
      ],
      why: "place an order / cancel an order.",
    },
    {
      k: "slots",
      title: "Please ____ the proposal to legal before noon.",
      body: ["제출은 submit. send는 가능하지만 공문 짝은 submit."],
      slots: [{ id: "v", label: "동사", accept: "ok" }],
      chips: [
        { text: "submit", role: "ok" },
        { text: "admit", role: "no" },
        { text: "permit", role: "no" },
        { text: "commit", role: "no" },
      ],
      why: "submit a proposal / report / application.",
    },
  ],
];

type Mode =
  | { k: "photo"; pose: PhotoSpec["pose"]; chips: Chip[]; why: string }
  | { k: "slots"; title: string; body: string[]; slots: Slot[]; chips: Chip[]; why: string };

let itemI = 0;
let mode: Mode;
let drag: Chip | null = null;
let ox = 0;
let oy = 0;

function chipOf(text: string, role: string, i: number): Chip {
  return { id: `${i}-${role}`, text, role, x: 0, y: 0, w: 120, h: 48 };
}

function startItem(api: KnowApi) {
  drag = null;
  const spec = BANK[api.level][itemI];
  if (spec.k === "photo") {
    const texts = [spec.ok, ...spec.traps].map((t, i) =>
      chipOf(t, t === spec.ok ? "ok" : "no", i),
    );
    for (let i = texts.length - 1; i > 0; i--) {
      const j = (i * 7 + api.level * 3 + itemI) % (i + 1);
      const tmp = texts[i];
      texts[i] = texts[j];
      texts[j] = tmp;
    }
    mode = { k: "photo", pose: spec.pose, chips: texts, why: spec.why };
  } else {
    mode = {
      k: "slots",
      title: spec.title,
      body: spec.body,
      slots: spec.slots.map((s) => ({ ...s, x: 0, y: 0, w: 0, h: 0 })),
      chips: spec.chips.map((c, i) => chipOf(c.text, c.role, i)),
      why: spec.why,
    };
  }
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
  } else {
    api.succeed(why);
  }
}

function layoutChips(chips: Chip[], w: number, h: number, stacked: boolean) {
  const loose = chips.filter((c) => !c.placed);
  if (stacked) {
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
    c.h = 50;
    if (drag !== c) {
      c.x = x0 + i * (cw + gap);
      c.y = h - 60;
    }
  });
}

function drawPerson(ctx: CanvasRenderingContext2D, x: number, y: number, fg: string) {
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(x, y - 26, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 7, y - 16, 14, 24);
  ctx.fillRect(x - 7, y + 8, 6, 16);
  ctx.fillRect(x + 1, y + 8, 6, 16);
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  w: number,
  y: number,
  hh: number,
  pose: PhotoSpec["pose"],
  pal: { fill: string; line: string; fg: string; muted: string; accent: string },
) {
  fillRound(ctx, 24, y, w - 48, hh, 12, pal.fill);
  strokeRound(ctx, 24, y, w - 48, hh, 12, pal.line);
  const cx = w / 2;
  const cy = y + hh * 0.62;
  if (pose === "sit") {
    ctx.fillStyle = pal.muted;
    ctx.fillRect(cx - 44, cy + 10, 88, 7);
    ctx.fillRect(cx - 44, cy + 10, 7, 16);
    ctx.fillRect(cx + 37, cy + 10, 7, 16);
    drawPerson(ctx, cx, cy - 2, pal.fg);
  } else if (pose === "carry") {
    drawPerson(ctx, cx - 8, cy, pal.fg);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(cx + 6, cy - 10, 22, 16);
    ctx.strokeStyle = pal.fg;
    ctx.strokeRect(cx + 6, cy - 10, 22, 16);
  } else {
    drawPerson(ctx, cx - 30, cy, pal.fg);
    ctx.strokeStyle = pal.fg;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 10);
    ctx.lineTo(cx + 8, cy - 28);
    ctx.stroke();
    ctx.fillStyle = pal.muted;
    ctx.fillRect(cx + 16, y + 18, 70, 48);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(cx + 22, y + 40, 18, 18);
    ctx.fillRect(cx + 44, y + 28, 12, 30);
    ctx.fillRect(cx + 60, y + 34, 16, 24);
  }
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

function grab(chips: Chip[], ptr: { x: number; y: number }, justDown: boolean, hold: number) {
  if (!justDown || hold > 0) return;
  const hit = [...chips].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
  if (hit) {
    drag = hit;
    ox = ptr.x - hit.x;
    oy = ptr.y - hit.y;
  }
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  const bank = BANK[api.level];
  head(ctx, w, `토익  ·  ${itemI + 1}/${bank.length}`, api.level + 1, api.pal);
  label(ctx, api.note || api.teach, 16, 44, api.pal.muted, 12, "left");
  const m = mode;

  if (m.k === "photo") {
    const photoY = 58;
    const photoH = Math.max(110, Math.min(168, h * 0.36));
    drawPhoto(ctx, w, photoY, photoH, m.pose, api.pal);
    layoutChips(m.chips, w, h, true);
    grab(m.chips, ptr, justDown, api.hold);
    if (drag) {
      drag.x = ptr.x - ox;
      drag.y = ptr.y - oy;
    }
    if (justUp && drag) {
      const on = inRect(drag.x + drag.w / 2, drag.y + drag.h / 2, 24, photoY, w - 48, photoH);
      if (on) {
        if (drag.role === "ok") {
          drag.placed = "photo";
          clearItem(api, w / 2, photoY + photoH / 2);
        } else api.miss("사진에 없는 말입니다.");
      }
      drag = null;
    }
    for (const c of m.chips) if (!c.placed) drawChip(ctx, c, drag === c, api.pal);
    return;
  }

  display(ctx, m.title, 16, 66, api.pal.fg, 15, "left");
  let by = 86;
  ctx.font = "500 12px Pretendard, 'Pretendard Variable', sans-serif";
  m.body.forEach((line) => {
    const lines = wrapText(ctx, line, w - 32);
    lines.forEach((ln) => {
      label(ctx, ln, 16, by, api.pal.muted, 12, "left");
      by += 16;
    });
  });
  const top = Math.min(h * 0.5, by + 8);
  const sh = 48;
  m.slots.forEach((s, i) => {
    s.x = 16;
    s.y = top + i * (sh + 6);
    s.w = w - 32;
    s.h = sh;
    fillRound(ctx, s.x, s.y, s.w, s.h, 8, api.pal.fill);
    strokeRound(ctx, s.x, s.y, s.w, s.h, 8, s.text ? api.pal.ok : api.pal.line);
    label(ctx, s.label, s.x + 10, s.y + 13, api.pal.muted, 11, "left");
    if (s.text) label(ctx, s.text, s.x + 10, s.y + 32, api.pal.fg, 13, "left");
  });

  const stacked = m.chips.some((c) => c.text.length > 18);
  layoutChips(m.chips, w, h, stacked);
  grab(m.chips, ptr, justDown, api.hold);
  if (drag) {
    drag.x = ptr.x - ox;
    drag.y = ptr.y - oy;
  }
  if (justUp && drag) {
    const x = drag.x + drag.w / 2;
    const y = drag.y + drag.h / 2;
    const hit = m.slots.find((s) => inRect(x, y, s.x, s.y, s.w, s.h));
    if (hit) {
      if (drag.role === hit.accept && !hit.text) {
        drag.placed = hit.id;
        hit.text = drag.text;
        popAt(api, x, y, api.pal.ok, 8);
        if (m.slots.every((s) => s.text)) clearItem(api, x, y);
        else api.setCoach(`${hit.label} ← ${drag.text}`);
      } else api.miss("그 칸의 답이 아닙니다.");
    }
    drag = null;
  }
  for (const c of m.chips) if (!c.placed) drawChip(ctx, c, drag === c, api.pal);
}

export function play(_id: string, canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  return playKnow("toeic", canvas, hooks, SLATE, { load, step });
}
