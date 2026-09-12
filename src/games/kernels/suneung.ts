import { PAPER } from "@/lib/games/draw";
import {
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
import { CSAT, getCsatDiff } from "@/lib/suneung";
import type { ExamItem } from "@/lib/games/examkit";
import type { GameHandle, GameHooks } from "@/lib/games/runtime";

function itemOf(id: string, level: number): ExamItem {
  const pack = CSAT[id];
  const bank = getCsatDiff() === "hard" ? pack.hard : pack.basic;
  return bank[level]?.[0] ?? bank[0]![0]!;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

type Box = { x: number; y: number; w: number; h: number };
type Line = { text: string; ok: boolean; box: Box; dead?: boolean };
type Chip = { text: string; ok: boolean; box: Box; gone?: boolean; order?: number };
type Node = { id: string; label: string; box: Box; on?: boolean };

function hit(p: { x: number; y: number }, b: Box) {
  return inRect(p.x, p.y, b.x, b.y, b.w, b.h);
}

function packHead(id: string) {
  const d = getCsatDiff() === "hard" ? "심화" : "기본";
  return `${CSAT[id]?.heading ?? id} · ${d}`;
}

/** 독서: 주장 줄을 형광펜으로 찍고 함정을 지운다. */
function playMark(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let lines: Line[] = [];
  let traps: Chip[] = [];
  let phase: "line" | "trap" = "line";
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    const trapLine = it.chips.find((c) => c.role === "x")?.text ?? "본문이 말하지 않은 단정";
    lines = shuffle([
      ...it.body.map((text, i) => ({ text, ok: i === 0, box: { x: 0, y: 0, w: 0, h: 0 } })),
      { text: trapLine, ok: false, box: { x: 0, y: 0, w: 0, h: 0 } },
    ]);
    traps = it.chips
      .filter((c) => c.role === "x")
      .map((c) => ({ text: c.text, ok: true, box: { x: 0, y: 0, w: 0, h: 0 } }));
    if (!traps.length) traps = [{ text: trapLine, ok: true, box: { x: 0, y: 0, w: 0, h: 0 } }];
    phase = "line";
    api.setCoach("주장(중심)이 있는 줄을 누르세요. 함정 문장은 본문이 아닙니다.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    label(ctx, api.note || api.teach, 16, 42, api.pal.muted, 11, "left");
    let y = 62;
    lines.forEach((ln) => {
      const wrapped = wrapText(ctx, ln.text, w - 40);
      const hh = Math.max(36, wrapped.length * 16 + 12);
      ln.box = { x: 16, y, w: w - 32, h: hh };
      fillRound(ctx, ln.box.x, ln.box.y, ln.box.w, ln.box.h, 8, ln.dead ? api.pal.ok : api.pal.fill);
      strokeRound(ctx, ln.box.x, ln.box.y, ln.box.w, ln.box.h, 8, api.pal.line);
      wrapped.slice(0, 4).forEach((s, i) => label(ctx, s, 28, y + 16 + i * 16, api.pal.fg, 13, "left"));
      y += hh + 8;
    });
    if (phase === "trap") {
      label(ctx, "함정 보기를 눌러 지우세요.", 16, y + 8, api.pal.bad, 12, "left");
      y += 24;
      traps.forEach((t, i) => {
        t.box = { x: 16, y: y + i * 50, w: w - 32, h: 44 };
        if (t.gone) return;
        fillRound(ctx, t.box.x, t.box.y, t.box.w, t.box.h, 8, api.pal.fill);
        strokeRound(ctx, t.box.x, t.box.y, t.box.w, t.box.h, 8, api.pal.bad);
        label(ctx, t.text, t.box.x + 12, t.box.y + 22, api.pal.fg, 13, "left");
      });
    }
    if (justDown && api.hold <= 0) {
      if (phase === "line") {
        const hitLn = lines.find((ln) => hit(ptr, ln.box));
        if (hitLn) {
          if (hitLn.ok) {
            hitLn.dead = true;
            popAt(api, ptr.x, ptr.y, api.pal.ok, 10);
            phase = "trap";
            api.setCoach("맞습니다. 이제 함정 보기를 지우세요.");
          } else api.miss("그 줄은 주장이 아닙니다. 구분 기준·세부와 주장을 가리세요.");
        }
      } else {
        const hitT = traps.find((t) => !t.gone && hit(ptr, t.box));
        if (hitT) {
          hitT.gone = true;
          popAt(api, ptr.x, ptr.y, api.pal.ok, 10);
          api.succeed(why);
        }
      }
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 문학: 시어를 눌러 기능을 붙인다. */
function playVerse(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let words: Chip[] = [];
  let slots: Node[] = [];
  let picked: Chip | null = null;
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    picked = null;
    words = shuffle(it.chips.map((c) => ({ text: c.text, ok: c.role !== "x", box: { x: 0, y: 0, w: 0, h: 0 } })));
    slots = it.slots.map((s) => ({ id: s.accept, label: s.label, box: { x: 0, y: 0, w: 0, h: 0 }, on: false }));
    api.setCoach("시어·보기를 누른 뒤, 오른쪽 기능 칸을 누르세요. 함정은 버리세요.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    const it = itemOf(id, api.level);
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    let y = 58;
    it.body.forEach((ln) => {
      wrapText(ctx, ln, w - 160).forEach((s) => {
        label(ctx, s, w / 2 - 60, y, api.pal.fg, 14, "center");
        y += 18;
      });
    });
    const sw = 130;
    slots.forEach((s, i) => {
      s.box = { x: w - 148, y: 58 + i * 58, w: sw, h: 50 };
      fillRound(ctx, s.box.x, s.box.y, s.box.w, s.box.h, 8, s.on ? api.pal.ok : api.pal.fill);
      strokeRound(ctx, s.box.x, s.box.y, s.box.w, s.box.h, 8, api.pal.line);
      label(ctx, s.label, s.box.x + 10, s.box.y + 26, api.pal.fg, 12, "left");
    });
    words.forEach((c, i) => {
      if (c.gone) return;
      c.box = { x: 16 + (i % 2) * ((w - 180) / 2), y: h - 56 - Math.floor(i / 2) * 50, w: (w - 196) / 2, h: 44 };
      fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, picked === c ? api.pal.accent : api.pal.fill);
      strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.line);
      label(ctx, c.text, c.box.x + c.box.w / 2, c.box.y + 22, picked === c ? api.pal.bg : api.pal.fg, 12, "center");
    });
    if (justDown && api.hold <= 0) {
      const wHit = words.find((c) => !c.gone && hit(ptr, c.box));
      if (wHit) {
        if (!wHit.ok) {
          api.miss("함정 보기입니다. 갈래의 형식·시어 기능만 남기세요.");
          return;
        }
        picked = wHit;
        return;
      }
      const sHit = slots.find((s) => hit(ptr, s.box));
      if (sHit && picked) {
        sHit.on = true;
        picked.gone = true;
        picked = null;
        popAt(api, ptr.x, ptr.y, api.pal.ok, 8);
        if (slots.every((s) => s.on)) api.succeed(why);
      }
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 화작: 목적 → 청자 → 매체를 삼각형으로 잇는다. */
function playTriangle(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  const ORDER = ["목적", "청자", "매체"];
  let need = 0;
  let nodes: Node[] = [];
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    need = 0;
    nodes = ORDER.map((label) => ({ id: label, label, box: { x: 0, y: 0, w: 0, h: 0 }, on: false }));
    api.setCoach(`${it.title}. 목적 → 청자 → 매체 순으로 꼭짓점을 누르세요.`);
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    const it = itemOf(id, api.level);
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    wrapText(ctx, it.body[0] ?? "", w - 32).forEach((s, i) => label(ctx, s, 16, 58 + i * 16, api.pal.muted, 13, "left"));
    const cx = w / 2;
    const cy = h * 0.52;
    const r = Math.min(w, h) * 0.28;
    const pts = [
      { x: cx, y: cy - r },
      { x: cx - r * 0.92, y: cy + r * 0.62 },
      { x: cx + r * 0.92, y: cy + r * 0.62 },
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0]!.x, pts[0]!.y);
    pts.forEach((p, i) => i && ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.strokeStyle = api.pal.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    nodes.forEach((n, i) => {
      const p = pts[i]!;
      n.box = { x: p.x - 44, y: p.y - 22, w: 88, h: 44 };
      fillRound(ctx, n.box.x, n.box.y, n.box.w, n.box.h, 22, n.on ? api.pal.ok : api.pal.fill);
      strokeRound(ctx, n.box.x, n.box.y, n.box.w, n.box.h, 22, api.pal.line);
      label(ctx, n.label, p.x, p.y + 1, api.pal.fg, 13, "center");
    });
    label(ctx, `다음: ${ORDER[need]}`, 16, h - 24, api.pal.muted, 13, "left");
    if (justDown && api.hold <= 0) {
      const n = nodes.find((x) => hit(ptr, x.box));
      if (!n) return;
      if (n.label === ORDER[need]) {
        n.on = true;
        need += 1;
        popAt(api, ptr.x, ptr.y, api.pal.ok, 8);
        if (need >= 3) api.succeed(why);
      } else api.miss("순서가 목적 → 청자 → 매체입니다. 매체를 먼저 고르면 글이 빈다.");
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 언매: 아래(작은 단위)에서 위로 쌓는다. */
function playLadder(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  const RUNGS = ["음운", "형태소", "단어", "문장", "담화"];
  let have = 0;
  let chips: Chip[] = [];
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    have = 0;
    const extras = ["의미(따로 칸)", "문자(표기)"];
    chips = shuffle([
      ...RUNGS.map((t) => ({ text: t, ok: true, box: { x: 0, y: 0, w: 0, h: 0 } })),
      { text: extras[api.level % 2]!, ok: false, box: { x: 0, y: 0, w: 0, h: 0 } },
    ]);
    api.setCoach("작은 단위부터 위로. 지금 칸: " + RUNGS[0]);
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    const rh = 40;
    RUNGS.forEach((r, i) => {
      const y = 56 + (RUNGS.length - 1 - i) * (rh + 6);
      fillRound(ctx, 16, y, w * 0.42, rh, 8, i < have ? api.pal.ok : api.pal.fill);
      strokeRound(ctx, 16, y, w * 0.42, rh, 8, api.pal.line);
      label(ctx, i < have ? r : "—", 28, y + 22, api.pal.fg, 13, "left");
    });
    chips.forEach((c, i) => {
      if (c.gone) return;
      c.box = { x: w * 0.5, y: 56 + i * 50, w: w * 0.46, h: 44 };
      fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.fill);
      strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.line);
      label(ctx, c.text, c.box.x + 12, c.box.y + 22, api.pal.fg, 13, "left");
    });
    if (justDown && api.hold <= 0) {
      const c = chips.find((x) => !x.gone && hit(ptr, x.box));
      if (!c) return;
      if (c.text === RUNGS[have]) {
        c.gone = true;
        have += 1;
        popAt(api, ptr.x, ptr.y, api.pal.ok, 8);
        if (have >= RUNGS.length) api.succeed(why);
        else api.setCoach("다음 칸: " + RUNGS[have]);
      } else api.miss("단위를 섞지 마세요. 음운 < 형태소 < 단어 < 문장 < 담화.");
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 수능 영어: 대조어(Yet/However)를 찍은 뒤 주제를 고른다. */
function playYet(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  const SENT = [
    { s: "True, the method is slow. Yet it remains the most reliable.", w: "Yet" },
    { s: "Costs rose. However, demand did not fall.", w: "However" },
    { s: "The result was noisy. Nevertheless, the pattern held.", w: "Nevertheless" },
    { s: "Many doubted the claim. Still, the data agreed.", w: "Still" },
    { s: "It looked random. In fact, a rule was hiding.", w: "In fact" },
    { s: "The intro lists tools. The thesis comes after But.", w: "But" },
    { s: "Details pile up. Therefore the topic is the last turn.", w: "Therefore" },
    { s: "Some facts help. Others, though, are off-topic.", w: "though" },
    { s: "The blank needs the claim after Yet, not the concession.", w: "Yet" },
  ];
  let words: { t: string; ok: boolean; box: Box }[] = [];
  let choices: Chip[] = [];
  let phase: "word" | "topic" = "word";
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    const row = SENT[api.level] ?? SENT[0]!;
    words = row.s.split(" ").map((t) => ({ t, ok: t.replace(/[.,]/g, "") === row.w, box: { x: 0, y: 0, w: 0, h: 0 } }));
    const topic = it.chips.find((c) => c.role !== "x")?.text ?? "Yet 뒤가 주장";
    const trap = it.chips.find((c) => c.role === "x")?.text ?? "True 앞이 주장";
    choices = shuffle([
      { text: topic, ok: true, box: { x: 0, y: 0, w: 0, h: 0 } },
      { text: trap, ok: false, box: { x: 0, y: 0, w: 0, h: 0 } },
    ]);
    phase = "word";
    api.setCoach("대조어(Yet/However/But)를 누르세요. 그 뒤가 주제입니다.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    let x = 16;
    let y = 70;
    words.forEach((wd) => {
      ctx.font = "500 16px Pretendard, sans-serif";
      const tw = Math.max(28, ctx.measureText(wd.t).width + 12);
      if (x + tw > w - 16) {
        x = 16;
        y += 36;
      }
      wd.box = { x, y, w: tw, h: 30 };
      fillRound(ctx, x, y, tw, 30, 6, api.pal.fill);
      strokeRound(ctx, x, y, tw, 30, 6, wd.ok && phase === "topic" ? api.pal.ok : api.pal.line);
      label(ctx, wd.t, x + tw / 2, y + 16, api.pal.fg, 14, "center");
      x += tw + 6;
    });
    if (phase === "topic") {
      choices.forEach((c, i) => {
        c.box = { x: 16, y: h - 120 + i * 54, w: w - 32, h: 48 };
        fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.fill);
        strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.line);
        label(ctx, c.text, c.box.x + 12, c.box.y + 24, api.pal.fg, 13, "left");
      });
    }
    if (justDown && api.hold <= 0) {
      if (phase === "word") {
        const wd = words.find((x) => hit(ptr, x.box));
        if (!wd) return;
        if (wd.ok) {
          phase = "topic";
          popAt(api, ptr.x, ptr.y, api.pal.ok, 8);
          api.setCoach("이제 주제를 고르세요. 양보 절은 주제가 아닙니다.");
        } else api.miss("그 단어는 양보·세부입니다. 방향이 꺾이는 접속어를 찾으세요.");
      } else {
        const c = choices.find((x) => hit(ptr, x.box));
        if (!c) return;
        if (c.ok) api.succeed(why);
        else api.miss("양보(True/Although)를 주제로 읽으면 빈칸이 반대가 됩니다.");
      }
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 한국사·세계사·동아사: 연표 위에 사건을 시간 순으로 올린다. */
function playRail(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let events: Chip[] = [];
  let placed = 0;
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    placed = 0;
    const oks = it.chips.filter((c) => c.role !== "x").map((c) => c.text);
    const trap = it.chips.find((c) => c.role === "x")?.text;
    const seq = oks.length ? oks : it.body;
    events = shuffle([
      ...seq.map((text, i) => ({ text, ok: true, box: { x: 0, y: 0, w: 0, h: 0 }, order: i })),
      ...(trap ? [{ text: trap, ok: false, box: { x: 0, y: 0, w: 0, h: 0 }, order: -1 }] : []),
    ]);
    api.setCoach("왼쪽이 먼저. 시간 순으로 칸을 채우세요. 순서를 뒤집는 보기는 버립니다.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    const n = events.filter((e) => e.ok).length;
    const slotW = (w - 32 - (n - 1) * 8) / n;
    for (let i = 0; i < n; i++) {
      const x = 16 + i * (slotW + 8);
      fillRound(ctx, x, 70, slotW, 54, 8, i < placed ? api.pal.ok : api.pal.fill);
      strokeRound(ctx, x, 70, slotW, 54, 8, api.pal.line);
      label(ctx, i < placed ? String(i + 1) : `${i + 1}`, x + slotW / 2, 98, api.pal.muted, 12, "center");
    }
    ctx.strokeStyle = api.pal.line;
    ctx.beginPath();
    ctx.moveTo(16, 140);
    ctx.lineTo(w - 16, 140);
    ctx.stroke();
    events.forEach((e, i) => {
      if (e.gone) return;
      e.box = { x: 16, y: 160 + i * 50, w: w - 32, h: 44 };
      fillRound(ctx, e.box.x, e.box.y, e.box.w, e.box.h, 8, api.pal.fill);
      strokeRound(ctx, e.box.x, e.box.y, e.box.w, e.box.h, 8, api.pal.line);
      label(ctx, e.text, e.box.x + 12, e.box.y + 22, api.pal.fg, 13, "left");
    });
    if (justDown && api.hold <= 0) {
      const e = events.find((x) => !x.gone && hit(ptr, x.box));
      if (!e) return;
      const order = (e as Chip & { order?: number }).order ?? -1;
      if (!e.ok) {
        api.miss("순서를 뒤집거나 시대를 건너뛰는 보기입니다.");
        return;
      }
      if (order === placed) {
        e.gone = true;
        placed += 1;
        popAt(api, ptr.x, ptr.y, api.pal.ok, 8);
        if (placed >= n) api.succeed(why);
      } else api.miss("아직 앞 사건이 남았습니다. 연표는 왼쪽이 먼저입니다.");
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 수학 공통: 참인 항등식을 두드린다. */
function playForge(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let cards: Chip[] = [];
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    cards = shuffle(it.chips.map((c) => ({ text: c.text, ok: c.role !== "x", box: { x: 0, y: 0, w: 0, h: 0 } })));
    api.setCoach("성립하는 항등식만 누르세요. 합의 로그, 곱의 미분 함정.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    const it = itemOf(id, api.level);
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    wrapText(ctx, it.body[0] ?? "", w - 32).forEach((s, i) => label(ctx, s, 16, 58 + i * 16, api.pal.muted, 13, "left"));
    cards.forEach((c, i) => {
      c.box = { x: 16, y: 110 + i * (h > 500 ? 70 : 56), w: w - 32, h: 52 };
      fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 10, api.pal.fill);
      strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 10, api.pal.line);
      label(ctx, c.text, c.box.x + 14, c.box.y + 26, api.pal.fg, 15, "left");
    });
    if (justDown && api.hold <= 0) {
      const c = cards.find((x) => hit(ptr, x.box));
      if (!c) return;
      if (c.ok) {
        popAt(api, ptr.x, ptr.y, api.pal.ok, 10);
        api.succeed(why);
      } else api.miss("그 식은 성립하지 않습니다. 조건을 다시 보세요.");
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 확통: 표본 점을 눌러 사건을 남긴다. */
function playPool(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let dots: { x: number; y: number; r: number; inA: boolean; on: boolean }[] = [];
  let need = 0;
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    const n = 10 + (api.level % 4);
    const k = 3 + (api.level % 3);
    dots = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + api.level;
      dots.push({
        x: 0.5 + Math.cos(ang) * 0.28,
        y: 0.52 + Math.sin(ang) * 0.22,
        r: 16,
        inA: i < k,
        on: false,
      });
    }
    need = k;
    api.setCoach(`사건 A에 들어가는 점 ${k}개를 누르세요. 표본공간이 줄어드는 손을 보여 줍니다. · ${it.title}`);
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    ctx.strokeStyle = api.pal.line;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.52, w * 0.34, h * 0.26, 0, 0, Math.PI * 2);
    ctx.stroke();
    dots.forEach((d, i) => {
      const x = d.x * w;
      const y = d.y * h;
      ctx.beginPath();
      ctx.arc(x, y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.on ? api.pal.ok : api.pal.fill;
      ctx.fill();
      ctx.strokeStyle = api.pal.line;
      ctx.stroke();
      label(ctx, String(i + 1), x, y + 1, api.pal.fg, 11, "center");
    });
    if (justDown && api.hold <= 0) {
      const d = dots.find((p) => {
        const dx = ptr.x - p.x * w;
        const dy = ptr.y - p.y * h;
        return dx * dx + dy * dy < (p.r + 8) ** 2;
      });
      if (!d) return;
      if (!d.inA) {
        api.miss("그 점은 A 밖입니다. 조건이 표본공간을 자릅니다.");
        return;
      }
      if (!d.on) {
        d.on = true;
        popAt(api, ptr.x, ptr.y, api.pal.ok, 8);
        if (dots.filter((x) => x.on).length >= need) api.succeed(why);
      }
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 미적: 영점을 찍고 넓이/정적분을 고른다. */
function playCut(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let zeros: { t: number; on: boolean }[] = [];
  let pick: Chip[] = [];
  let phase: "zero" | "kind" = "zero";
  let why = "";
  let wantAbs = false;

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    wantAbs = /거리|넓이|절댓값/.test(it.title + it.why + it.body.join(""));
    zeros = [0.3, 0.55, 0.78].map((t) => ({ t, on: false }));
    pick = [
      { text: "정적분 ∫v (부호 유지 = 변위)", ok: !wantAbs, box: { x: 0, y: 0, w: 0, h: 0 } },
      { text: "거리·넓이 ∫|v| (영점에서 자름)", ok: wantAbs, box: { x: 0, y: 0, w: 0, h: 0 } },
    ];
    phase = "zero";
    api.setCoach("축을 뚫는 영점을 모두 누르세요. 그다음 부호를 지울지 고릅니다.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    const x0 = 24;
    const x1 = w - 24;
    const y0 = h * 0.42;
    ctx.strokeStyle = api.pal.line;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y0);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = x0 + t * (x1 - x0);
      const y = y0 - Math.sin(t * Math.PI * 2.2) * 50;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = api.pal.fg;
    ctx.stroke();
    zeros.forEach((z) => {
      const x = x0 + z.t * (x1 - x0);
      ctx.beginPath();
      ctx.arc(x, y0, 10, 0, Math.PI * 2);
      ctx.fillStyle = z.on ? api.pal.ok : api.pal.fill;
      ctx.fill();
      ctx.strokeStyle = api.pal.line;
      ctx.stroke();
    });
    if (phase === "kind") {
      pick.forEach((c, i) => {
        c.box = { x: 16, y: h - 120 + i * 54, w: w - 32, h: 48 };
        fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.fill);
        strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.line);
        label(ctx, c.text, c.box.x + 12, c.box.y + 24, api.pal.fg, 13, "left");
      });
    }
    if (justDown && api.hold <= 0) {
      if (phase === "zero") {
        const z = zeros.find((p) => {
          const x = x0 + p.t * (x1 - x0);
          return (ptr.x - x) ** 2 + (ptr.y - y0) ** 2 < 18 ** 2;
        });
        if (z && !z.on) {
          z.on = true;
          popAt(api, ptr.x, ptr.y, api.pal.ok, 8);
          if (zeros.every((p) => p.on)) {
            phase = "kind";
            api.setCoach("문항이 넓이(거리)인지 정적분(변위)인지 고르세요.");
          }
        } else if (!z) api.miss("곡선이 축을 뚫는 점이 영점입니다.");
      } else {
        const c = pick.find((x) => hit(ptr, x.box));
        if (!c) return;
        if (c.ok) api.succeed(why);
        else api.miss("부호를 지울지 남길지가 문항입니다.");
      }
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 기하: 곡선을 보고 정의를 고른다. */
function playFocus(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  const KINDS = ["parabola", "ellipse", "hyperbola"] as const;
  let kind: (typeof KINDS)[number] = "parabola";
  let cards: Chip[] = [];
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    kind = KINDS[api.level % 3]!;
    cards = shuffle([
      { text: "초점거리 = 준선거리", ok: kind === "parabola", box: { x: 0, y: 0, w: 0, h: 0 } },
      { text: "두 초점거리의 합 = 2a", ok: kind === "ellipse", box: { x: 0, y: 0, w: 0, h: 0 } },
      { text: "두 초점거리의 차 = 2a", ok: kind === "hyperbola", box: { x: 0, y: 0, w: 0, h: 0 } },
    ]);
    api.setCoach("그림을 보고 정의 문장을 누르세요. 공식이 아니라 정의가 앞섭니다.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    const cx = w * 0.5;
    const cy = h * 0.38;
    ctx.strokeStyle = api.pal.fg;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (kind === "ellipse") ctx.ellipse(cx, cy, 70, 40, 0, 0, Math.PI * 2);
    else if (kind === "hyperbola") {
      ctx.ellipse(cx - 40, cy, 36, 50, 0, -1.1, 1.1);
      ctx.moveTo(cx + 76, cy - 46);
      ctx.ellipse(cx + 40, cy, 36, 50, 0, Math.PI - 1.1, Math.PI + 1.1);
    } else {
      for (let i = 0; i <= 24; i++) {
        const t = (i / 24) * 2 - 1;
        const x = cx + t * 80;
        const y = cy - 20 + t * t * 70;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.fillStyle = api.pal.ok;
    ctx.beginPath();
    ctx.arc(cx, cy + (kind === "parabola" ? 18 : 0), 3, 0, Math.PI * 2);
    ctx.fill();
    cards.forEach((c, i) => {
      c.box = { x: 16, y: h - 180 + i * 54, w: w - 32, h: 48 };
      fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.fill);
      strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.line);
      label(ctx, c.text, c.box.x + 12, c.box.y + 24, api.pal.fg, 14, "left");
    });
    if (justDown && api.hold <= 0) {
      const c = cards.find((x) => hit(ptr, x.box));
      if (!c) return;
      if (c.ok) api.succeed(why);
      else api.miss("타원은 합, 쌍곡선은 차, 포물선은 초점=준선.");
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 생윤·윤사: 사례를 사상가의 저울에 올린다. */
function playCase(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let cards: Chip[] = [];
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    cards = shuffle(it.chips.map((c) => ({ text: c.text, ok: c.role !== "x", box: { x: 0, y: 0, w: 0, h: 0 } })));
    api.setCoach("사례에 이 사상가의 척도를 올리세요. 다른 학파의 이름은 버립니다.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    const it = itemOf(id, api.level);
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    fillRound(ctx, 16, 56, w - 32, 120, 12, api.pal.fill);
    strokeRound(ctx, 16, 56, w - 32, 120, 12, api.pal.line);
    label(ctx, it.title, 28, 78, api.pal.muted, 12, "left");
    wrapText(ctx, it.body.join(" "), w - 56)
      .slice(0, 4)
      .forEach((s, i) => label(ctx, s, 28, 100 + i * 16, api.pal.fg, 13, "left"));
    ctx.strokeStyle = api.pal.line;
    ctx.beginPath();
    ctx.moveTo(w / 2, 190);
    ctx.lineTo(w / 2, 210);
    ctx.moveTo(w / 2 - 80, 210);
    ctx.lineTo(w / 2 + 80, 210);
    ctx.stroke();
    cards.forEach((c, i) => {
      c.box = { x: 16, y: 230 + i * 54, w: w - 32, h: 48 };
      fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.fill);
      strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.line);
      label(ctx, c.text, c.box.x + 12, c.box.y + 24, api.pal.fg, 13, "left");
    });
    if (justDown && api.hold <= 0) {
      const c = cards.find((x) => hit(ptr, x.box));
      if (!c) return;
      if (c.ok) api.succeed(why);
      else api.miss("다른 척도입니다. 같은 사례라도 저울이 바뀝니다.");
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 사문: 같은 사실을 기능/갈등으로 가른다. */
function playSplit(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let left = "기능론";
  let right = "갈등론";
  let cards: Chip[] = [];
  let why = "";
  let placed = 0;
  let need = 1;

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    left = api.level % 2 === 0 ? "기능론" : "양적";
    right = api.level % 2 === 0 ? "갈등론" : "질적";
    const ok = it.chips.find((c) => c.role !== "x")?.text ?? left;
    const trap = it.chips.find((c) => c.role === "x")?.text ?? right;
    cards = shuffle([
      { text: ok, ok: true, box: { x: 0, y: 0, w: 0, h: 0 } },
      { text: trap, ok: false, box: { x: 0, y: 0, w: 0, h: 0 } },
    ]);
    placed = 0;
    need = 1;
    api.setCoach(`이 자료는 어느 렌즈인가. 왼쪽 ${left} · 오른쪽 ${right}.`);
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    const it = itemOf(id, api.level);
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    const mid = w / 2;
    fillRound(ctx, 16, 56, mid - 22, 90, 10, api.pal.fill);
    fillRound(ctx, mid + 6, 56, mid - 22, 90, 10, api.pal.fill);
    label(ctx, left, (16 + mid - 6) / 2, 100, api.pal.fg, 14, "center");
    label(ctx, right, (mid + 6 + w - 16) / 2, 100, api.pal.fg, 14, "center");
    wrapText(ctx, it.body[0] ?? "", w - 32).forEach((s, i) => label(ctx, s, 16, 164 + i * 16, api.pal.muted, 13, "left"));
    cards.forEach((c, i) => {
      if (c.gone) return;
      c.box = { x: 16, y: h - 120 + i * 54, w: w - 32, h: 48 };
      fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.fill);
      strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.line);
      label(ctx, c.text, c.box.x + 12, c.box.y + 24, api.pal.fg, 13, "left");
    });
    if (justDown && api.hold <= 0) {
      const c = cards.find((x) => !x.gone && hit(ptr, x.box));
      if (c) {
        if (c.ok) {
          c.gone = true;
          placed += 1;
          popAt(api, ptr.x, ptr.y, api.pal.ok, 8);
          if (placed >= need) api.succeed(why);
        } else api.miss("렌즈가 바뀌면 같은 숫자도 다른 문장이 됩니다.");
      }
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 정법: 기관 책상에 안건을 찍는다. */
function playStamp(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  const DESKS = ["국회", "행정부", "헌재", "대법"];
  let desks: Node[] = [];
  let cards: Chip[] = [];
  let why = "";
  let picked: Chip | null = null;

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    desks = DESKS.map((label) => ({ id: label, label, box: { x: 0, y: 0, w: 0, h: 0 } }));
    cards = shuffle(it.chips.map((c) => ({ text: c.text, ok: c.role !== "x", box: { x: 0, y: 0, w: 0, h: 0 } })));
    picked = null;
    api.setCoach("안건을 고른 뒤 기관을 누르세요. 탄핵 소추는 국회, 심판은 헌재.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    desks.forEach((d, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      d.box = { x: 16 + col * ((w - 40) / 2 + 8), y: 58 + row * 70, w: (w - 40) / 2, h: 60 };
      fillRound(ctx, d.box.x, d.box.y, d.box.w, d.box.h, 8, api.pal.fill);
      strokeRound(ctx, d.box.x, d.box.y, d.box.w, d.box.h, 8, api.pal.line);
      label(ctx, d.label, d.box.x + d.box.w / 2, d.box.y + 32, api.pal.fg, 16, "center");
    });
    cards.forEach((c, i) => {
      if (c.gone) return;
      c.box = { x: 16, y: h - 160 + i * 50, w: w - 32, h: 44 };
      fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, picked === c ? api.pal.accent : api.pal.fill);
      strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.line);
      label(ctx, c.text, c.box.x + 12, c.box.y + 22, picked === c ? api.pal.bg : api.pal.fg, 13, "left");
    });
    if (justDown && api.hold <= 0) {
      const c = cards.find((x) => !x.gone && hit(ptr, x.box));
      if (c) {
        if (!c.ok) {
          api.miss("그 안건은 이 장의 기관이 아닙니다.");
          return;
        }
        picked = c;
        return;
      }
      const d = desks.find((x) => hit(ptr, x.box));
      if (d && picked) {
        const it = itemOf(id, api.level);
        const blob = (it.title + it.body.join(" ") + picked.text).toLowerCase();
        const want =
          /탄핵 심판|위헌 법률|헌재/.test(blob) ? "헌재"
          : /탄핵 소추|입법|예산/.test(blob) ? "국회"
          : /명령|규칙|대법/.test(blob) ? "대법"
          : /대통령|거부|내각/.test(blob) ? "행정부"
          : desks[api.level % 4]!.label;
        if (d.label === want || it.slots.some((s) => s.label.includes(d.label))) {
          picked.gone = true;
          picked = null;
          popAt(api, ptr.x, ptr.y, api.pal.ok, 10);
          api.succeed(why);
        } else api.miss(`${want}의 권한입니다. 기관을 섞지 마세요.`);
      }
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 경제: 수요·공급 곡선을 민다. */
function playCurve(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let want: "D+" | "D-" | "S+" | "S-" = "D+";
  let drag: "D" | "S" | null = null;
  let dShift = 0;
  let sShift = 0;
  let why = "";
  let ox = 0;

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    const t = it.title + it.body.join(" ") + it.why;
    want = /공급.*감소|비용.*증가|재해/.test(t) ? "S-"
      : /공급.*증가|기술/.test(t) ? "S+"
      : /수요.*감소|소득.*감소/.test(t) ? "D-"
      : "D+";
    drag = null;
    dShift = 0;
    sShift = 0;
    api.setCoach(
      want.startsWith("D")
        ? `수요 곡선을 ${want === "D+" ? "오른쪽" : "왼쪽"}으로 미세요. 수요량(점)이 아닙니다.`
        : `공급 곡선을 ${want === "S+" ? "오른쪽" : "왼쪽"}으로 미세요.`,
    );
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown, justUp } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    const x0 = 40;
    const y0 = h * 0.72;
    const x1 = w - 30;
    const y1 = 80;
    ctx.strokeStyle = api.pal.line;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x1, y0);
    ctx.stroke();
    label(ctx, "P", x0, y1 - 8, api.pal.muted, 11, "center");
    label(ctx, "Q", x1, y0 + 14, api.pal.muted, 11, "left");
    const drawLine = (up: boolean, shift: number, name: string) => {
      ctx.beginPath();
      const a = x0 + 30 + shift;
      const b = x1 - 40 + shift;
      if (up) {
        ctx.moveTo(a, y0 - 20);
        ctx.lineTo(b, y1 + 20);
      } else {
        ctx.moveTo(a, y1 + 20);
        ctx.lineTo(b, y0 - 20);
      }
      ctx.strokeStyle = name === "D" ? api.pal.fg : api.pal.ok;
      ctx.lineWidth = 2;
      ctx.stroke();
      label(ctx, name, b, up ? y1 + 20 : y0 - 20, api.pal.fg, 13, "left");
    };
    drawLine(false, dShift, "D");
    drawLine(true, sShift, "S");
    if (justDown) {
      drag = ptr.y < (y0 + y1) / 2 ? "S" : "D";
      ox = ptr.x;
    }
    if (drag && ptr.x) {
      const dx = ptr.x - ox;
      if (drag === "D") dShift = Math.max(-80, Math.min(80, dx));
      else sShift = Math.max(-80, Math.min(80, dx));
    }
    if (justUp && drag) {
      const sh = drag === "D" ? dShift : sShift;
      const got =
        drag === "D" && want === "D+" && sh > 28 ? true
        : drag === "D" && want === "D-" && sh < -28 ? true
        : drag === "S" && want === "S+" && sh > 28 ? true
        : drag === "S" && want === "S-" && sh < -28 ? true
        : false;
      if (got) {
        popAt(api, ptr.x, ptr.y, api.pal.ok, 10);
        api.succeed(why);
      } else api.miss("곡선 전체의 이동과 곡선 위 점의 이동을 가리세요.");
      drag = null;
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 지리: 지도를 눌러 자리를 찍는다. */
function playPin(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  const KR: { name: string; x: number; y: number }[] = [
    { name: "서해", x: 0.22, y: 0.48 },
    { name: "동해", x: 0.78, y: 0.4 },
    { name: "남해", x: 0.5, y: 0.78 },
    { name: "수도권", x: 0.38, y: 0.32 },
    { name: "영남", x: 0.62, y: 0.58 },
    { name: "호남", x: 0.36, y: 0.62 },
    { name: "관동", x: 0.66, y: 0.3 },
    { name: "제주", x: 0.28, y: 0.88 },
    { name: "울릉", x: 0.88, y: 0.28 },
  ];
  const WORLD: { name: string; x: number; y: number }[] = [
    { name: "열대", x: 0.5, y: 0.5 },
    { name: "사막", x: 0.3, y: 0.38 },
    { name: "지중해", x: 0.48, y: 0.36 },
    { name: "서안 해양성", x: 0.42, y: 0.28 },
    { name: "냉대", x: 0.7, y: 0.22 },
    { name: "극", x: 0.5, y: 0.1 },
    { name: "몬순 아시아", x: 0.72, y: 0.42 },
    { name: "사헬", x: 0.48, y: 0.46 },
    { name: "안데스", x: 0.28, y: 0.62 },
  ];
  let want = "";
  let nodes: { name: string; x: number; y: number; box: Box }[] = [];
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    const pool = id === "worldgeo" ? WORLD : KR;
    const row = pool[api.level % pool.length]!;
    want = row.name;
    nodes = pool.map((p) => ({ ...p, box: { x: 0, y: 0, w: 0, h: 0 } }));
    api.setCoach(`${it.title} — 지도에서 「${want}」를 누르세요.`);
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    ctx.strokeStyle = api.pal.line;
    ctx.strokeRect(24, 56, w - 48, h - 80);
    nodes.forEach((n) => {
      const x = 24 + n.x * (w - 48);
      const y = 56 + n.y * (h - 80);
      n.box = { x: x - 28, y: y - 14, w: 56, h: 28 };
      fillRound(ctx, n.box.x, n.box.y, n.box.w, n.box.h, 8, api.pal.fill);
      label(ctx, n.name, x, y + 1, api.pal.fg, 11, "center");
    });
    if (justDown && api.hold <= 0) {
      const n = nodes.find((x) => hit(ptr, x.box));
      if (!n) return;
      if (n.name === want) api.succeed(why);
      else api.miss(`그곳은 ${n.name}. ${want}를 다시 찾으세요.`);
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 물리: 충돌 후 남는 것을 고른다. */
function playSurvive(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  let cards: Chip[] = [];
  let t0 = 0;
  let why = "";
  let elastic = false;

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    elastic = /탄성/.test(it.title + it.body.join(""));
    t0 = api.t;
    cards = shuffle([
      { text: "운동량 p", ok: true, box: { x: 0, y: 0, w: 0, h: 0 } },
      { text: "운동 에너지 K", ok: elastic, box: { x: 0, y: 0, w: 0, h: 0 } },
      { text: "역학적 에너지(마찰 있으면)", ok: false, box: { x: 0, y: 0, w: 0, h: 0 } },
    ]);
    api.setCoach(elastic ? "탄성 충돌 — 남는 것을 누르세요." : "충돌 후 항상 남는 것을 누르세요. 외력이 없으면 p.");
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    const u = Math.min(1, (api.t - t0) * 0.7);
    const y = 110;
    const xL = 40 + u * (w * 0.28);
    const xR = w - 40 - u * (w * 0.28);
    ctx.beginPath();
    ctx.arc(xL, y, 18, 0, Math.PI * 2);
    ctx.arc(xR, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = api.pal.fg;
    ctx.fill();
    cards.forEach((c, i) => {
      c.box = { x: 16, y: 170 + i * 58, w: w - 32, h: 50 };
      fillRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.fill);
      strokeRound(ctx, c.box.x, c.box.y, c.box.w, c.box.h, 8, api.pal.line);
      label(ctx, c.text, c.box.x + 12, c.box.y + 26, api.pal.fg, 15, "left");
    });
    if (justDown && api.hold <= 0) {
      const c = cards.find((x) => hit(ptr, x.box));
      if (!c) return;
      if (c.ok) api.succeed(why);
      else api.miss("보존되는 것과 안 되는 것을 가리세요.");
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 화학: 계수를 +/- 로 맞춘다. */
function playRatio(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  const RXN = [
    { left: ["H2", "O2"], right: ["H2O"], want: [2, 1, 2] },
    { left: ["N2", "H2"], right: ["NH3"], want: [1, 3, 2] },
    { left: ["C", "O2"], right: ["CO2"], want: [1, 1, 1] },
    { left: ["CH4", "O2"], right: ["CO2", "H2O"], want: [1, 2, 1, 2] },
    { left: ["Fe", "O2"], right: ["Fe2O3"], want: [4, 3, 2] },
    { left: ["Al", "O2"], right: ["Al2O3"], want: [4, 3, 2] },
    { left: ["C2H6", "O2"], right: ["CO2", "H2O"], want: [2, 7, 4, 6] },
    { left: ["Na", "Cl2"], right: ["NaCl"], want: [2, 1, 2] },
    { left: ["H2", "Cl2"], right: ["HCl"], want: [1, 1, 2] },
  ];
  let spec = RXN[0]!;
  let vals: number[] = [];
  let labels: string[] = [];
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    spec = RXN[api.level] ?? RXN[0]!;
    labels = [...spec.left, ...spec.right];
    vals = labels.map(() => 1);
    api.setCoach("계수를 눌러 맞춤. 계수 비 = 몰 비. · " + it.title);
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    const boxes: Box[] = [];
    labels.forEach((name, i) => {
      const x = 16 + (i % 3) * ((w - 32) / 3);
      const y = 70 + Math.floor(i / 3) * 100;
      const box = { x, y, w: (w - 48) / 3, h: 84 };
      boxes.push(box);
      fillRound(ctx, box.x, box.y, box.w, box.h, 10, api.pal.fill);
      label(ctx, `${vals[i]} ${name}`, box.x + box.w / 2, box.y + 28, api.pal.fg, 16, "center");
      label(ctx, "−     +", box.x + box.w / 2, box.y + 58, api.pal.muted, 16, "center");
    });
    fillRound(ctx, 16, h - 64, w - 32, 44, 8, api.pal.accent);
    label(ctx, "이 비로 확정", w / 2, h - 40, api.pal.bg, 14, "center");
    if (justDown && api.hold <= 0) {
      if (ptr.y > h - 64) {
        if (vals.every((v, i) => v === spec.want[i])) api.succeed(why);
        else api.miss("질량 비가 아니라 몰(계수) 비입니다.");
        return;
      }
      boxes.forEach((b, i) => {
        if (!hit(ptr, b)) return;
        if (ptr.x < b.x + b.w / 2) vals[i] = Math.max(1, (vals[i] ?? 1) - 1);
        else vals[i] = Math.min(9, (vals[i] ?? 1) + 1);
      });
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 생명: 화살표를 올려 항상성을 맞춘다. */
function playToggle(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  const CASES = [
    { q: "혈당이 높다", up: "인슐린", down: "글루카곤", want: "down" as const },
    { q: "혈당이 낮다", up: "글루카곤", down: "인슐린", want: "up" as const },
    { q: "체온이 높다", up: "발열", down: "발한", want: "down" as const },
    { q: "탈분극", up: "Na 유입", down: "K 유입", want: "up" as const },
    { q: "재분극", up: "Na 유입", down: "K 유출", want: "down" as const },
    { q: "2차 면역", up: "기억 세포", down: "1차보다 느림", want: "up" as const },
    { q: "1분열", up: "상동 분리", down: "자매 분리", want: "up" as const },
    { q: "인슐린 작용", up: "혈당 ↑", down: "혈당 ↓", want: "down" as const },
    { q: "선택", up: "변이가 먼저", down: "필요해서 변이", want: "up" as const },
  ];
  let spec = CASES[0]!;
  let why = "";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    spec = CASES[api.level] ?? CASES[0]!;
    api.setCoach(`${spec.q}. 올리기/내리기 화살로 방향을 고르세요.`);
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    label(ctx, spec.q, w / 2, 90, api.pal.fg, 18, "center");
    const up = { x: w / 2 - 70, y: 130, w: 140, h: 90 };
    const down = { x: w / 2 - 70, y: 250, w: 140, h: 90 };
    fillRound(ctx, up.x, up.y, up.w, up.h, 12, api.pal.fill);
    fillRound(ctx, down.x, down.y, down.w, down.h, 12, api.pal.fill);
    label(ctx, "▲", w / 2, 162, api.pal.ok, 22, "center");
    label(ctx, spec.up, w / 2, 188, api.pal.fg, 13, "center");
    label(ctx, "▼", w / 2, 282, api.pal.bad, 22, "center");
    label(ctx, spec.down, w / 2, 308, api.pal.fg, 13, "center");
    if (justDown && api.hold <= 0) {
      const goUp = hit(ptr, up);
      const goDown = hit(ptr, down);
      if (!goUp && !goDown) return;
      const ok = (goUp && spec.want === "up") || (goDown && spec.want === "down");
      if (ok) api.succeed(why);
      else api.miss("방향이 반대입니다. 올리기/내리기를 가리세요.");
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

/** 지구: 두 판을 밀고 당겨 경계를 만든다. */
function playPull(id: string, canvas: HTMLCanvasElement, hooks: GameHooks) {
  const WANT = ["diverge", "converge", "transform", "diverge", "converge", "transform", "diverge", "converge", "transform"] as const;
  let a = { x: 0.38, y: 0.5 };
  let b = { x: 0.62, y: 0.5 };
  let drag: "a" | "b" | null = null;
  let why = "";
  let want: (typeof WANT)[number] = "diverge";

  function load(api: KnowApi) {
    const it = itemOf(id, api.level);
    why = it.why;
    want = WANT[api.level] ?? "diverge";
    a = { x: 0.4, y: 0.5 };
    b = { x: 0.6, y: 0.5 };
    drag = null;
    const ko = want === "diverge" ? "벌려 해령" : want === "converge" ? "밀어 해구·습곡" : "어긋내 변환단층";
    api.setCoach(`두 판을 ${ko}.`);
  }

  function kind() {
    const dx = (b.x - a.x) * 400;
    const dy = (b.y - a.y) * 400;
    const gap = Math.hypot(dx, dy);
    const shear = Math.abs(b.y - a.y) * 400;
    if (gap > 130) return "diverge";
    if (gap < 70) return "converge";
    if (shear > 40) return "transform";
    return null;
  }

  function step(f: KnowFrame) {
    scene(f);
    const { ctx, w, h, api, ptr, justDown, justUp } = f;
    head(ctx, w, packHead(id), api.level + 1, api.pal);
    const draw = (p: { x: number; y: number }, name: string) => {
      const x = p.x * w;
      const y = p.y * h;
      ctx.beginPath();
      ctx.ellipse(x, y, 56, 40, 0, 0, Math.PI * 2);
      ctx.fillStyle = api.pal.fill;
      ctx.fill();
      ctx.strokeStyle = api.pal.line;
      ctx.stroke();
      label(ctx, name, x, y, api.pal.fg, 13, "center");
    };
    draw(a, "판 A");
    draw(b, "판 B");
    const k = kind();
    label(ctx, k ? { diverge: "발산", converge: "수렴", transform: "보존" }[k] : "경계를 만드세요", w / 2, h - 28, api.pal.muted, 13, "center");
    if (justDown) {
      const da = Math.hypot(ptr.x - a.x * w, ptr.y - a.y * h);
      const db = Math.hypot(ptr.x - b.x * w, ptr.y - b.y * h);
      drag = da < db ? "a" : "b";
    }
    if (drag) {
      const p = drag === "a" ? a : b;
      p.x = Math.max(0.12, Math.min(0.88, ptr.x / w));
      p.y = Math.max(0.22, Math.min(0.82, ptr.y / h));
    }
    if (justUp) {
      drag = null;
      const k2 = kind();
      if (k2 === want) api.succeed(why);
      else if (k2) api.miss("그 경계가 아닙니다. 해령·해구·변환을 손으로 만드세요.");
    }
  }

  return playKnow(id, canvas, hooks, PAPER, { load, step });
}

const PLAY: Record<string, (id: string, canvas: HTMLCanvasElement, hooks: GameHooks) => GameHandle> = {
  dokseo: playMark,
  munhak: playVerse,
  hwajak: playTriangle,
  eonmae: playLadder,
  csateng: playYet,
  khist: playRail,
  worldhist: playRail,
  eahist: playRail,
  mathcsat: playForge,
  probstat: playPool,
  calc: playCut,
  geom: playFocus,
  lifeeth: playCase,
  thought: playCase,
  smun: playSplit,
  polilaw: playStamp,
  econ: playCurve,
  korgeo: playPin,
  worldgeo: playPin,
  phys1: playSurvive,
  chem1: playRatio,
  bio1: playToggle,
  earth1: playPull,
};

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const fn = PLAY[id];
  if (!fn) throw new Error(`no suneung play: ${id}`);
  return fn(id, canvas, hooks);
}
