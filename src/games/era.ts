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
  type KnowApi,
  type KnowFrame,
} from "@/lib/games/know";

type EraId =
  | "ancient"
  | "classical"
  | "medieval"
  | "renaissance"
  | "revolution"
  | "imperial"
  | "cold"
  | "korea"
  | "modern";

type Event = { title: string; year: string; era: EraId; why: string };
type Chip = Event & { x: number; y: number; w: number; h: number; placed?: EraId };

const RAILS: { id: EraId; label: string; range: string }[] = [
  { id: "ancient", label: "고대", range: "문명·법" },
  { id: "classical", label: "고전", range: "그리스·로마" },
  { id: "medieval", label: "중세", range: "5–15세기" },
  { id: "renaissance", label: "르네상스", range: "항해·인쇄" },
  { id: "revolution", label: "혁명", range: "18세기" },
  { id: "imperial", label: "제국주의", range: "19세기" },
  { id: "cold", label: "냉전", range: "20세기 후반" },
  { id: "korea", label: "한국사", range: "근대 한국" },
  { id: "modern", label: "현대", range: "지구화" },
];

const EVENTS: Event[] = [
  { title: "함무라비 법전", year: "기원전 1754", era: "ancient", why: "성문법이 왕권과 정의를 처음으로 고정한다." },
  { title: "기자의 피라미드", year: "기원전 2560", era: "ancient", why: "강 유역 국가가 노동과 신앙을 한 돌에 모은다." },
  { title: "아테네 민주정", year: "기원전 508", era: "classical", why: "시민이 직접 법을 정하는 실험." },
  { title: "아우구스투스", year: "기원전 27", era: "classical", why: "공화의 껍질 아래 제국이 선다." },
  { title: "서로마 멸망", year: "476", era: "medieval", why: "고대의 끝이 중세를 연다." },
  { title: "카롤루스 대관", year: "800", era: "medieval", why: "서로마의 기억을 다시 쓴 대관식." },
  { title: "활판 인쇄", year: "1455", era: "renaissance", why: "인쇄가 지식을 복제 가능하게 한다." },
  { title: "콜럼버스", year: "1492", era: "renaissance", why: "대항해가 세계를 한 지도에 넣는다." },
  { title: "프랑스 혁명", year: "1789", era: "revolution", why: "주권이 왕에서 국민으로 옮아간다." },
  { title: "미국 독립", year: "1776", era: "revolution", why: "권리가 정부보다 앞선다는 문장." },
  { title: "베를린 회의", year: "1884", era: "imperial", why: "열강이 아프리카를 탁자 위에서 나눈다." },
  { title: "아편전쟁", year: "1840", era: "imperial", why: "산업과 함대가 동아시아를 연다." },
  { title: "철의 장막", year: "1946", era: "cold", why: "두 체제가 지구를 반으로 가른다." },
  { title: "장벽 붕괴", year: "1989", era: "cold", why: "냉전의 상징이 무너지며 질서가 바뀐다." },
  { title: "한일병합", year: "1910", era: "korea", why: "식민 지배가 근대 한국의 상처를 연다." },
  { title: "6·25 전쟁", year: "1950", era: "korea", why: "분단이 전쟁으로 고정된다." },
  { title: "월드와이드웹", year: "1991", era: "modern", why: "정보가 국경을 기본값으로 넘는다." },
  { title: "스마트폰", year: "2007", era: "modern", why: "호주머니가 단말기가 된다." },
];

let chips: Chip[] = [];
let drag: Chip | null = null;
let ox = 0;
let oy = 0;
let parked: Record<EraId, Event[]> = emptyPark();

function emptyPark(): Record<EraId, Event[]> {
  return {
    ancient: [],
    classical: [],
    medieval: [],
    renaissance: [],
    revolution: [],
    imperial: [],
    cold: [],
    korea: [],
    modern: [],
  };
}

function load(api: KnowApi) {
  if (api.level === 0) parked = emptyPark();
  const focus = RAILS[api.level].id;
  const mine = EVENTS.filter((e) => e.era === focus);
  const decoy = EVENTS.filter((e) => e.era !== focus)[api.level % 16];
  chips = [...mine, decoy].map((e) => ({ ...e, x: 0, y: 0, w: 120, h: 48 }));
  drag = null;
}

function railBox(w: number, h: number, i: number) {
  const top = 58;
  const bot = h - 72;
  const rh = (bot - top) / RAILS.length;
  return { x: 16, y: top + i * rh, w: w - 32, h: rh - 3 };
}

function step(f: KnowFrame) {
  scene(f);
  const { ctx, w, h, api, ptr, justDown, justUp } = f;
  const focus = RAILS[api.level];
  head(ctx, w, "연표 레일", api.level + 1, api.pal);
  label(ctx, api.note || `「${focus.label}」에 속하는 사건을 레일 위에 놓으세요.`, 16, 44, api.pal.muted, 12, "left");

  RAILS.forEach((r, i) => {
    const b = railBox(w, h, i);
    const on = r.id === focus.id;
    fillRound(ctx, b.x, b.y, b.w, b.h, 6, on ? "rgba(61,56,50,0.08)" : api.pal.fill);
    strokeRound(ctx, b.x, b.y, b.w, b.h, 6, on ? api.pal.accent : api.pal.line, on ? 1.6 : 1);
    label(ctx, r.label, b.x + 10, b.y + b.h / 2 - 6, on ? api.pal.fg : api.pal.muted, 12, "left");
    label(ctx, r.range, b.x + 10, b.y + b.h / 2 + 10, api.pal.muted, 10, "left");
    const years = parked[r.id].map((e) => e.year.replace("기원전 ", "BC ")).join(" · ");
    if (years) label(ctx, years, b.x + b.w - 10, b.y + b.h / 2, api.pal.ok, 10, "right");
  });

  const loose = chips.filter((c) => !c.placed);
  const gap = 8;
  const cw = Math.max(88, Math.min(150, (w - 24 - (loose.length - 1) * gap) / Math.max(1, loose.length)));
  const total = loose.length * cw + Math.max(0, loose.length - 1) * gap;
  const tx = (w - total) / 2;
  loose.forEach((c, i) => {
    c.w = cw;
    c.h = 50;
    if (drag !== c) {
      c.x = tx + i * (cw + gap);
      c.y = h - 58;
    }
  });

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
    const idx = RAILS.findIndex((_, i) => {
      const b = railBox(w, h, i);
      return inRect(cx, cy, b.x, b.y, b.w, b.h);
    });
    if (idx >= 0) {
      const rail = RAILS[idx];
      if (drag.era === rail.id) {
        drag.placed = rail.id;
        parked[rail.id] = [...parked[rail.id], drag];
        popAt(api, cx, cy, api.pal.ok, 12);
        api.setCoach(`${drag.year} · ${drag.why}`);
        const mine = chips.filter((c) => c.era === focus.id);
        if (mine.every((c) => c.placed)) {
          api.succeed(`${focus.label}이 연표에 앉았습니다.`);
        }
      } else {
        api.miss(`「${drag.title}」은 ${RAILS.find((r) => r.id === drag!.era)?.label}의 사건입니다.`);
      }
    }
    drag = null;
  }

  for (const c of chips) {
    if (c.placed) continue;
    fillRound(ctx, c.x, c.y, c.w, c.h, 8, drag === c ? api.pal.accent : api.pal.fill);
    strokeRound(ctx, c.x, c.y, c.w, c.h, 8, api.pal.line);
    label(ctx, c.title, c.x + c.w / 2, c.y + c.h / 2, drag === c ? api.pal.bg : api.pal.fg, 12, "center");
  }

  if (api.hold > 0) display(ctx, api.note, w / 2, 28, api.pal.ok, 15, "center");
}

export function startEra(canvas: HTMLCanvasElement, hooks: import("@/lib/games/runtime").GameHooks) {
  parked = emptyPark();
  return playKnow("era", canvas, hooks, PAPER, { load, step });
}
