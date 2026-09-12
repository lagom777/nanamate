import { noiseBurst, tone, unlockAudio } from "@/lib/games/audio";
import { bindCanvas, reducedMotion, startLoop, type GameHandle, type GameHooks } from "@/lib/games/runtime";
import {
  SLATE,
  INK,
  type Palette,
  clear,
  grain,
  label,
  display,
  roundRect,
  inRect,
  burst,
  stepSparks,
  drawSparks,
  shuffle,
  type Spark,
} from "@/lib/games/draw";

type Ptr = { x: number; y: number; down: boolean };
type Btn = { x: number; y: number; w: number; h: number; text: string; sub?: string; key: number };

function hud(hooks: GameHooks, level: number, total: number, score: number, status: string, coach: string) {
  hooks.onHud({ level, total, score, status, coach });
}

function run(
  canvas: HTMLCanvasElement,
  reset: () => void,
  step: (dt: number, ctx: CanvasRenderingContext2D, w: number, h: number, ptr: Ptr, justDown: boolean, justUp: boolean) => void,
  onDestroy?: () => void,
): GameHandle {
  const view = bindCanvas(canvas);
  let wasDown = false;
  reset();
  const stop = startLoop((dt) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx || w < 10) return;
    const justDown = view.ptr.down && !wasDown;
    const justUp = !view.ptr.down && wasDown;
    if (justDown) unlockAudio();
    step(dt, ctx, w, h, view.ptr, justDown, justUp);
    wasDown = view.ptr.down;
  });
  return {
    destroy: () => {
      onDestroy?.();
      stop();
      view.destroy();
    },
    restart: () => reset(),
  };
}

function later(bag: number[], fn: () => void, ms: number) {
  bag.push(window.setTimeout(fn, ms));
}

function clearBag(bag: number[]) {
  bag.forEach(clearTimeout);
  bag.length = 0;
}

function drawBtn(ctx: CanvasRenderingContext2D, b: Btn, pal: Palette, state: "idle" | "hot" | "ok" | "bad") {
  const fill = state === "ok" ? pal.ok : state === "bad" ? pal.bad : state === "hot" ? pal.accent : pal.fill;
  ctx.fillStyle = fill;
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fill();
  ctx.strokeStyle = pal.line;
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.stroke();
  const ink = state === "hot" ? pal.bg : pal.fg;
  label(ctx, b.text, b.x + b.w / 2, b.y + b.h / 2 - (b.sub ? 8 : 0), ink, 15, "center");
  if (b.sub) label(ctx, b.sub, b.x + b.w / 2, b.y + b.h / 2 + 12, state === "hot" ? pal.bg : pal.muted, 11, "center");
}

function overlay(ctx: CanvasRenderingContext2D, w: number, h: number, pal: Palette, title: string, sub: string) {
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  ctx.fillRect(0, 0, w, h);
  display(ctx, title, w / 2, h / 2 - 12, pal.fg, 28, "center");
  label(ctx, sub, w / 2, h / 2 + 20, pal.muted, 14, "center");
}

/* ---------------- chinese tones ---------------- */

type ToneId = 1 | 2 | 3 | 4;
type Word = { syl: string; tone: ToneId; roman: string };

const WORDS: Word[] = [
  { syl: "妈", tone: 1, roman: "mā" },
  { syl: "麻", tone: 2, roman: "má" },
  { syl: "马", tone: 3, roman: "mǎ" },
  { syl: "骂", tone: 4, roman: "mà" },
  { syl: "书", tone: 1, roman: "shū" },
  { syl: "十", tone: 2, roman: "shí" },
  { syl: "水", tone: 3, roman: "shuǐ" },
  { syl: "是", tone: 4, roman: "shì" },
  { syl: "天", tone: 1, roman: "tiān" },
];

const TONE_NAME = ["", "1성 陰平", "2성 陽平", "3성 上聲", "4성 去聲"];

function contour(tone: ToneId): number[] {
  if (tone === 1) return [440, 440, 440];
  if (tone === 2) return [330, 392, 494];
  if (tone === 3) return [370, 262, 349];
  return [523, 392, 247];
}

function playToneWord(word: Word, bag: number[]) {
  const notes = contour(word.tone);
  notes.forEach((f, i) => later(bag, () => tone(f, 0.22, "sine", 0.07), i * 180));
}

function drawCurve(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tone: ToneId, pal: Palette) {
  const pts =
    tone === 1
      ? [0.2, 0.2, 0.2]
      : tone === 2
        ? [0.75, 0.45, 0.15]
        : tone === 3
          ? [0.4, 0.85, 0.35]
          : [0.1, 0.45, 0.85];
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, i) => {
    const px = x + (i / (pts.length - 1)) * w;
    const py = y + p * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.lineWidth = 1;
}

function playChinese(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = INK;
  const rm = reducedMotion();
  let level = 0;
  let score = 0;
  let finished = false;
  let pick = -1;
  let phase: "listen" | "choose" | "ok" | "done" = "listen";
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  const bag: number[] = [];
  const total = WORDS.length;

  const load = () => {
    phase = "listen";
    pick = -1;
    lock = 0.2;
    hud(hooks, level + 1, total, score, WORDS[level].roman, "곡선을 듣고 성조를 고르세요.");
    clearBag(bag);
    playToneWord(WORDS[level], bag);
    later(bag, () => {
      if (phase === "listen") phase = "choose";
    }, 700);
  };

  return run(
    canvas,
    () => {
      level = 0;
      score = 0;
      finished = false;
      sparks = [];
      load();
    },
    (dt, ctx, w, h, ptr, justDown) => {
      t += dt;
      lock = Math.max(0, lock - dt);
      const word = WORDS[level];
      const replay = { x: w - 132, y: 14, w: 116, h: 44, text: "다시 듣기", key: -1 };
      const labels = [
        { text: "1성", sub: "陰平 · 높고 평평" },
        { text: "2성", sub: "陽平 · 올라감" },
        { text: "3성", sub: "上聲 · 내려 올랐다" },
        { text: "4성", sub: "去聲 · 떨어짐" },
      ];
      const gap = 10;
      const bw = (w - 32 - gap) / 2;
      const bh = 58;
      const y0 = h - 20 - bh * 2 - gap;
      const btns: Btn[] = labels.map((L, i) => ({
        x: 16 + (i % 2) * (bw + gap),
        y: y0 + Math.floor(i / 2) * (bh + gap),
        w: bw,
        h: bh,
        text: L.text,
        sub: L.sub,
        key: i + 1,
      }));

      if (justDown && lock <= 0 && !finished) {
        if (inRect(ptr.x, ptr.y, replay.x, replay.y, replay.w, replay.h)) {
          playToneWord(word, bag);
        } else if (phase === "choose") {
          const hitB = btns.find((b) => inRect(ptr.x, ptr.y, b.x, b.y, b.w, b.h));
          if (hitB) {
            pick = hitB.key;
            if (pick === word.tone) {
              phase = "ok";
              score += 50 + level * 8;
              burst(sparks, w / 2, h * 0.32, pal.ok, rm ? 5 : 14);
              tone(620, 0.1, "sine", 0.06);
              hud(hooks, level + 1, total, score, word.roman, `${word.syl} ${word.roman} · ${TONE_NAME[word.tone]}`);
              lock = 0.8;
              if (level + 1 >= total) {
                finished = true;
                hooks.onClear(score);
              } else {
                later(bag, () => {
                  level += 1;
                  load();
                }, 800);
              }
            } else {
              noiseBurst(0.08, 0.04);
              hud(hooks, level + 1, total, score, word.roman, `${TONE_NAME[word.tone]}입니다.`);
            }
          }
        }
      }

      clear(ctx, w, h, pal);
      display(ctx, word.roman, 20, 34, pal.fg, 26, "left");
      drawBtn(ctx, replay, pal, "hot");
      const boxY = 62;
      const boxH = Math.max(110, y0 - 80);
      ctx.fillStyle = pal.fill;
      roundRect(ctx, 24, boxY, w - 48, boxH, 12);
      ctx.fill();
      ctx.strokeStyle = pal.line;
      roundRect(ctx, 24, boxY, w - 48, boxH, 12);
      ctx.stroke();
      display(ctx, word.syl, w / 2, boxY + 28, pal.fg, 36, "center");
      drawCurve(ctx, 48, boxY + 52, w - 96, boxH - 70, word.tone, pal);
      label(ctx, "높낮이 곡선", 36, boxY + boxH - 14, pal.muted, 11, "left");
      btns.forEach((b) => {
        let st: "idle" | "hot" | "ok" | "bad" = inRect(ptr.x, ptr.y, b.x, b.y, b.w, b.h) ? "hot" : "idle";
        if (phase === "ok" || finished) {
          if (b.key === word.tone) st = "ok";
          else if (b.key === pick) st = "bad";
        }
        drawBtn(ctx, b, pal, st);
      });
      grain(ctx, w, h, Math.floor(t * 4), 0.03);
      stepSparks(sparks, dt);
      drawSparks(ctx, sparks);
      if (finished) overlay(ctx, w, h, pal, "사성", "성조가 단어다");
    },
    () => clearBag(bag),
  );
}

/* ---------------- toeic scenes ---------------- */

type Pose = "sit" | "stand" | "walk" | "drink" | "read" | "talk" | "carry" | "look";
type Scene = { name: string; pose: Pose; motif: [number, number, number]; ok: string; opts: string[] };

const SCENES: Scene[] = [
  { name: "벤치", pose: "sit", motif: [262, 330, 392], ok: "A man is sitting on a bench.", opts: ["A man is sitting on a bench.", "A man is standing near a bench.", "A man is running past a bench.", "A man is drinking on a bench."] },
  { name: "기둥", pose: "stand", motif: [294, 294, 440], ok: "A woman is standing by a pole.", opts: ["A woman is standing by a pole.", "A woman is sitting under a tree.", "A woman is carrying a box.", "Two people are talking."] },
  { name: "보도", pose: "walk", motif: [330, 392, 330], ok: "A man is walking along the path.", opts: ["A man is walking along the path.", "A man is sitting on a bench.", "A man is looking out a window.", "A man is holding a cup."] },
  { name: "잔", pose: "drink", motif: [349, 440, 523], ok: "A woman is holding a cup.", opts: ["A woman is holding a cup.", "A woman is reading a book.", "A woman is carrying a box.", "A woman is standing by a pole."] },
  { name: "책", pose: "read", motif: [220, 277, 330], ok: "A man is reading a book.", opts: ["A man is reading a book.", "A man is talking to someone.", "A man is walking along the path.", "A man is looking out a window."] },
  { name: "대화", pose: "talk", motif: [392, 349, 392], ok: "Two people are talking to each other.", opts: ["Two people are talking to each other.", "A man is sitting alone on a bench.", "A woman is carrying a box.", "A man is holding a cup."] },
  { name: "상자", pose: "carry", motif: [196, 247, 196], ok: "A man is carrying a box.", opts: ["A man is carrying a box.", "A man is reading a book.", "A man is standing by a pole.", "A man is sitting on a bench."] },
  { name: "창", pose: "look", motif: [523, 440, 349], ok: "A woman is looking out the window.", opts: ["A woman is looking out the window.", "A woman is walking along the path.", "Two people are talking to each other.", "A woman is holding a cup."] },
  { name: "계단", pose: "walk", motif: [247, 311, 370], ok: "A man is walking up the stairs.", opts: ["A man is walking up the stairs.", "A man is sitting on a bench.", "A woman is looking out the window.", "Two people are talking to each other."] },
];

function playMotif(notes: [number, number, number], bag: number[]) {
  notes.forEach((f, i) => later(bag, () => tone(f, 0.16, "triangle", 0.06), i * 170));
}

function body(ctx: CanvasRenderingContext2D, x: number, y: number, pal: Palette) {
  ctx.fillStyle = pal.fg;
  ctx.beginPath();
  ctx.arc(x, y - 28, 8, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, x - 8, y - 18, 16, 26, 5);
  ctx.fill();
}

function drawScene(ctx: CanvasRenderingContext2D, w: number, y0: number, hh: number, pose: Pose, pal: Palette) {
  const cx = w / 2;
  const cy = y0 + hh * 0.62;
  ctx.fillStyle = pal.fill;
  roundRect(ctx, 24, y0, w - 48, hh, 12);
  ctx.fill();
  ctx.strokeStyle = pal.line;
  roundRect(ctx, 24, y0, w - 48, hh, 12);
  ctx.stroke();

  if (pose === "sit") {
    ctx.fillStyle = pal.muted;
    ctx.fillRect(cx - 46, cy + 10, 92, 8);
    ctx.fillRect(cx - 46, cy + 10, 8, 18);
    ctx.fillRect(cx + 38, cy + 10, 8, 18);
    body(ctx, cx, cy - 4, pal);
    ctx.fillStyle = pal.fg;
    ctx.fillRect(cx - 8, cy + 6, 7, 16);
    ctx.fillRect(cx + 2, cy + 6, 7, 16);
  } else if (pose === "stand") {
    ctx.fillStyle = pal.muted;
    ctx.fillRect(cx + 22, cy - 70, 6, 96);
    body(ctx, cx, cy, pal);
    ctx.fillStyle = pal.fg;
    ctx.fillRect(cx - 7, cy + 8, 6, 22);
    ctx.fillRect(cx + 2, cy + 8, 6, 22);
  } else if (pose === "walk") {
    ctx.strokeStyle = pal.line;
    ctx.beginPath();
    ctx.moveTo(40, cy + 30);
    ctx.lineTo(w - 40, cy + 30);
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.12);
    body(ctx, 0, 0, pal);
    ctx.fillStyle = pal.fg;
    ctx.fillRect(-10, 8, 6, 20);
    ctx.fillRect(4, 4, 6, 20);
    ctx.restore();
  } else if (pose === "drink") {
    body(ctx, cx, cy, pal);
    ctx.fillStyle = pal.fg;
    ctx.fillRect(cx + 8, cy - 14, 14, 5);
    ctx.fillStyle = pal.warn;
    roundRect(ctx, cx + 18, cy - 22, 10, 14, 2);
    ctx.fill();
    ctx.fillStyle = pal.fg;
    ctx.fillRect(cx - 7, cy + 8, 6, 22);
    ctx.fillRect(cx + 2, cy + 8, 6, 22);
  } else if (pose === "read") {
    ctx.fillStyle = pal.muted;
    ctx.fillRect(cx - 40, cy + 12, 80, 7);
    body(ctx, cx, cy - 2, pal);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(cx - 12, cy - 6, 24, 16);
    ctx.fillStyle = pal.fg;
    ctx.fillRect(cx - 8, cy + 8, 7, 14);
    ctx.fillRect(cx + 2, cy + 8, 7, 14);
  } else if (pose === "talk") {
    body(ctx, cx - 28, cy, pal);
    body(ctx, cx + 28, cy, pal);
    ctx.fillStyle = pal.fg;
    ctx.fillRect(cx - 35, cy + 8, 6, 22);
    ctx.fillRect(cx - 26, cy + 8, 6, 22);
    ctx.fillRect(cx + 21, cy + 8, 6, 22);
    ctx.fillRect(cx + 30, cy + 8, 6, 22);
    ctx.strokeStyle = pal.muted;
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 36, 6, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 10, cy - 36, 6, Math.PI, 0);
    ctx.stroke();
  } else if (pose === "carry") {
    body(ctx, cx, cy, pal);
    ctx.fillStyle = pal.warn;
    roundRect(ctx, cx - 16, cy - 8, 32, 20, 3);
    ctx.fill();
    ctx.fillStyle = pal.fg;
    ctx.fillRect(cx - 8, cy + 12, 6, 18);
    ctx.fillRect(cx + 3, cy + 12, 6, 18);
  } else {
    ctx.strokeStyle = pal.muted;
    ctx.strokeRect(cx + 18, cy - 64, 40, 52);
    ctx.beginPath();
    ctx.moveTo(cx + 38, cy - 64);
    ctx.lineTo(cx + 38, cy - 12);
    ctx.moveTo(cx + 18, cy - 38);
    ctx.lineTo(cx + 58, cy - 38);
    ctx.stroke();
    body(ctx, cx - 6, cy, pal);
    ctx.fillStyle = pal.fg;
    ctx.fillRect(cx - 13, cy + 8, 6, 22);
    ctx.fillRect(cx - 2, cy + 8, 6, 22);
  }
}

function playToeic(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = SLATE;
  const rm = reducedMotion();
  type Chip = { text: string; ok: boolean; x: number; y: number; w: number; h: number; placed: boolean };
  let level = 0;
  let score = 0;
  let finished = false;
  let chips: Chip[] = [];
  let drag: Chip | null = null;
  let ox = 0;
  let oy = 0;
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  const bag: number[] = [];
  const total = SCENES.length;

  const layoutChips = (w: number, h: number) => {
    const loose = chips.filter((c) => !c.placed && c !== drag);
    const gap = 8;
    const cw = Math.max(80, w - 24);
    const bh = 44;
    const y0 = h - 16 - loose.length * (bh + gap) + gap;
    loose.forEach((c, i) => {
      c.w = cw;
      c.h = bh;
      c.x = 12;
      c.y = y0 + i * (bh + gap);
    });
  };

  const load = () => {
    const scene = SCENES[level];
    chips = shuffle(scene.opts.slice()).map((text) => ({
      text,
      ok: text === scene.ok,
      x: 0,
      y: 0,
      w: 120,
      h: 44,
      placed: false,
    }));
    drag = null;
    lock = 0.15;
    hud(hooks, level + 1, total, score, scene.name, "보이는 동작과 같은 문장만 장면 위에 놓으세요.");
    clearBag(bag);
    playMotif(scene.motif, bag);
  };

  return run(
    canvas,
    () => {
      level = 0;
      score = 0;
      finished = false;
      sparks = [];
      load();
    },
    (dt, ctx, w, h, ptr, justDown, justUp) => {
      t += dt;
      lock = Math.max(0, lock - dt);
      const scene = SCENES[level];
      const sceneY = 62;
      const sceneH = Math.max(130, h * 0.4);
      layoutChips(w, h);
      const replay = { x: w - 132, y: 14, w: 116, h: 44, text: "다시 듣기", key: -1 };

      if (justDown && lock <= 0 && !finished) {
        if (inRect(ptr.x, ptr.y, replay.x, replay.y, replay.w, replay.h)) playMotif(scene.motif, bag);
        else {
          const hitC = [...chips].reverse().find((c) => !c.placed && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
          if (hitC) {
            drag = hitC;
            ox = ptr.x - hitC.x;
            oy = ptr.y - hitC.y;
          }
        }
      }
      if (drag) {
        drag.x = ptr.x - ox;
        drag.y = ptr.y - oy;
      }
      if (justUp && drag && !finished) {
        const onScene = inRect(drag.x + drag.w / 2, drag.y + drag.h / 2, 24, sceneY, w - 48, sceneH);
        if (onScene) {
          if (drag.ok) {
            drag.placed = true;
            score += 50 + level * 8;
            burst(sparks, w / 2, sceneY + sceneH / 2, pal.ok, rm ? 5 : 14);
            tone(620, 0.1, "sine", 0.06);
            hud(hooks, level + 1, total, score, scene.name, scene.ok);
            lock = 0.7;
            if (level + 1 >= total) {
              finished = true;
              hooks.onClear(score);
            } else {
              later(bag, () => {
                level += 1;
                load();
              }, 700);
            }
          } else {
            noiseBurst(0.08, 0.04);
            hud(hooks, level + 1, total, score, scene.name, "사진에 없는 말입니다.");
          }
        }
        drag = null;
      }

      clear(ctx, w, h, pal);
      display(ctx, scene.name, 20, 34, pal.fg, 24, "left");
      drawBtn(ctx, replay, pal, "hot");
      drawScene(ctx, w, sceneY, sceneH, scene.pose, pal);
      for (const c of chips) {
        if (c.placed) continue;
        ctx.fillStyle = drag === c ? pal.accent : pal.fill;
        roundRect(ctx, c.x, c.y, c.w, c.h, 8);
        ctx.fill();
        ctx.strokeStyle = pal.line;
        roundRect(ctx, c.x, c.y, c.w, c.h, 8);
        ctx.stroke();
        label(ctx, c.text, c.x + 12, c.y + c.h / 2, drag === c ? pal.bg : pal.fg, 13, "left");
      }
      grain(ctx, w, h, Math.floor(t * 5), 0.03);
      stepSparks(sparks, dt);
      drawSparks(ctx, sparks);
      if (finished) overlay(ctx, w, h, pal, "사진 속 문장", "보이는 것만 고른다");
    },
    () => clearBag(bag),
  );
}

/* ---------------- toefl lecture outline ---------------- */

type Lecture = { name: string; claim: string; example: string; counter: string; close: string };
const LECTURES: Lecture[] = [
  { name: "빙하", claim: "빙하는 기후의 기록 보관소다.", example: "빙핵 기포가 고대 대기를 남긴다.", counter: "일부 층은 녹았다 얼어 왜곡된다.", close: "그래도 장기 추세는 읽을 수 있다." },
  { name: "산호", claim: "산호초는 생물다양성 거점이다.", example: "작은 면적에 종이 몰린다.", counter: "일부 종은 모래 바닥에서도 산다.", close: "밀도는 산호초에서 비정상적으로 높다." },
  { name: "열섬", claim: "도시는 밤에도 더 덥다.", example: "콘크리트와 아스팔트가 열을 붙잡는다.", counter: "공원과 강변은 상대적으로 시원하다.", close: "녹지가 열섬을 누그러뜨린다." },
  { name: "수면", claim: "깊은 잠은 기억을 고정한다.", example: "학습 후 수면이 회상을 높인다.", counter: "너무 긴 잠은 오히려 둔하게 한다.", close: "질과 타이밍이 양보다 중요하다." },
  { name: "철", claim: "철은 도구를 싸게 만들어 사회를 바꿨다.", example: "쟁기와 무기가 널리 퍼졌다.", counter: "청동도 이미 정밀한 도구를 만들었다.", close: "차이는 희소성이 아니라 접근성이다." },
  { name: "조류", claim: "철새는 자기장과 별자리를 함께 쓴다.", example: "구름 낀 밤에도 방향을 유지한다.", counter: "일부 개체는 경로를 잃고 표류한다.", close: "다중 신호가 오류를 줄인다." },
  { name: "토양", claim: "건강한 흙은 탄소를 붙잡는다.", example: "뿌리와 균근이 유기물을 가둔다.", counter: "경운이 심하면 탄소가 대기로 돌아간다.", close: "경운을 줄이면 흙이 창고가 된다." },
  { name: "언어", claim: "이중 언어는 주의 전환을 단련한다.", example: "두 언어를 오가는 과제가 반응을 빠르게 한다.", counter: "어휘량은 한 언어 화자가 더 많을 수 있다.", close: "이점은 어휘가 아니라 전환에 있다." },
  { name: "수성", claim: "도시의 불빛은 밤하늘 관측을 가린다.", example: "광공해가 별의 대비를 떨어뜨린다.", counter: "일부 파장은 필터로 줄일 수 있다.", close: "차광 설계가 하늘을 되돌린다." },
];

const SLOTS = ["주장", "예시", "반례", "결론"] as const;

function playLectureTones(bag: number[]) {
  later(bag, () => tone(220, 0.22, "sine", 0.07), 0);
  later(bag, () => tone(330, 0.28, "sine", 0.07), 280);
  later(bag, () => tone(392, 0.07, "square", 0.04), 720);
  later(bag, () => tone(349, 0.18, "triangle", 0.06), 1320);
  later(bag, () => tone(330, 0.4, "sine", 0.07), 1900);
}

function playToefl(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pal = SLATE;
  const rm = reducedMotion();
  type Chip = { role: (typeof SLOTS)[number]; text: string; x: number; y: number; w: number; h: number; slot?: number };
  let level = 0;
  let score = 0;
  let finished = false;
  let chips: Chip[] = [];
  let drag: Chip | null = null;
  let ox = 0;
  let oy = 0;
  let t = 0;
  let lock = 0;
  let sparks: Spark[] = [];
  const bag: number[] = [];
  const total = LECTURES.length;

  const load = () => {
    const L = LECTURES[level];
    const raw: Chip[] = [
      { role: "주장", text: L.claim, x: 0, y: 0, w: 160, h: 48 },
      { role: "예시", text: L.example, x: 0, y: 0, w: 160, h: 48 },
      { role: "반례", text: L.counter, x: 0, y: 0, w: 160, h: 48 },
      { role: "결론", text: L.close, x: 0, y: 0, w: 160, h: 48 },
    ];
    chips = shuffle(raw);
    drag = null;
    lock = 0.15;
    hud(hooks, level + 1, total, score, L.name, "문장을 주장·예시·반례·결론 칸에 앉히세요.");
    clearBag(bag);
    playLectureTones(bag);
  };

  return run(
    canvas,
    () => {
      level = 0;
      score = 0;
      finished = false;
      sparks = [];
      load();
    },
    (dt, ctx, w, h, ptr, justDown, justUp) => {
      t += dt;
      lock = Math.max(0, lock - dt);
      const L = LECTURES[level];
      const replay = { x: w - 132, y: 14, w: 116, h: 44, text: "다시 듣기", key: -1 };
      const slotH = 52;
      const slotY0 = 62;
      const slots = SLOTS.map((name, i) => ({
        name,
        x: 16,
        y: slotY0 + i * (slotH + 8),
        w: w - 32,
        h: slotH,
      }));

      const loose = chips.filter((c) => c.slot == null && c !== drag);
      const gap = 6;
      const cw = Math.max(100, (w - 24 - (loose.length - 1) * gap) / Math.max(1, loose.length));
      loose.forEach((c, i) => {
        c.w = Math.min(200, cw);
        c.h = 48;
        c.x = 12 + i * (c.w + gap);
        c.y = h - 58;
      });

      if (justDown && lock <= 0 && !finished) {
        if (inRect(ptr.x, ptr.y, replay.x, replay.y, replay.w, replay.h)) playLectureTones(bag);
        else {
          const hitC = [...chips].reverse().find((c) => c.slot == null && inRect(ptr.x, ptr.y, c.x, c.y, c.w, c.h));
          if (hitC) {
            drag = hitC;
            ox = ptr.x - hitC.x;
            oy = ptr.y - hitC.y;
          }
        }
      }
      if (drag) {
        drag.x = ptr.x - ox;
        drag.y = ptr.y - oy;
      }
      if (justUp && drag && !finished) {
        const cx = drag.x + drag.w / 2;
        const cy = drag.y + drag.h / 2;
        const idx = slots.findIndex((s) => inRect(cx, cy, s.x, s.y, s.w, s.h));
        if (idx >= 0) {
          if (SLOTS[idx] === drag.role) {
            drag.slot = idx;
            popBurst(cx, cy);
            if (chips.every((c) => c.slot != null)) {
              score += 70 + level * 8;
              hud(hooks, level + 1, total, score, L.name, "구조가 닫혔습니다. 세부보다 뼈.");
              lock = 0.75;
              if (level + 1 >= total) {
                finished = true;
                hooks.onClear(score);
              } else {
                later(bag, () => {
                  level += 1;
                  load();
                }, 750);
              }
            }
          } else {
            noiseBurst(0.08, 0.04);
            hud(hooks, level + 1, total, score, L.name, `그 칸은 ${SLOTS[idx]}. 「${drag.role}」을 찾으세요.`);
          }
        }
        drag = null;
      }

      function popBurst(x: number, y: number) {
        burst(sparks, x, y, pal.ok, rm ? 5 : 12);
        tone(560, 0.08, "sine", 0.05);
      }

      clear(ctx, w, h, pal);
      display(ctx, L.name, 20, 34, pal.fg, 24, "left");
      drawBtn(ctx, replay, pal, "hot");
      slots.forEach((s, i) => {
        ctx.fillStyle = pal.fill;
        roundRect(ctx, s.x, s.y, s.w, s.h, 8);
        ctx.fill();
        ctx.strokeStyle = pal.line;
        roundRect(ctx, s.x, s.y, s.w, s.h, 8);
        ctx.stroke();
        label(ctx, s.name, s.x + 10, s.y + 14, pal.muted, 11, "left");
        const placed = chips.find((c) => c.slot === i);
        if (placed) label(ctx, placed.text, s.x + 10, s.y + 34, pal.fg, 12, "left");
      });
      for (const c of chips) {
        if (c.slot != null) continue;
        ctx.fillStyle = drag === c ? pal.accent : pal.fill;
        roundRect(ctx, c.x, c.y, c.w, c.h, 8);
        ctx.fill();
        ctx.strokeStyle = pal.line;
        roundRect(ctx, c.x, c.y, c.w, c.h, 8);
        ctx.stroke();
        label(ctx, c.text, c.x + c.w / 2, c.y + c.h / 2, drag === c ? pal.bg : pal.fg, 11, "center");
      }
      grain(ctx, w, h, Math.floor(t * 4), 0.03);
      stepSparks(sparks, dt);
      drawSparks(ctx, sparks);
      if (finished) overlay(ctx, w, h, pal, "강의 노트", "주장의 뼈를 건졌다");
    },
    () => clearBag(bag),
  );
}

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  if (id === "toeic") return playToeic(canvas, hooks);
  if (id === "toefl") return playToefl(canvas, hooks);
  return playChinese(canvas, hooks);
}
