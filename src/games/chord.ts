import { chordTones, tone, unlockAudio } from "@/lib/games/audio";
import {
  bindCanvas,
  startLoop,
  type GameHandle,
  type GameHooks,
} from "@/lib/games/runtime";

type Chord = { name: string; pcs: number[]; hint: string };

const CHORDS: Chord[] = [
  { name: "C 장3화음", pcs: [0, 4, 7], hint: "도–미–솔" },
  { name: "A 단3화음", pcs: [9, 12, 16], hint: "라–도–미" },
  { name: "G 장3화음", pcs: [7, 11, 14], hint: "솔–시–레" },
  { name: "E 단3화음", pcs: [4, 7, 11], hint: "미–솔–시" },
  { name: "B 감3화음", pcs: [11, 14, 17], hint: "시–레–파 (두 단3도)" },
  { name: "C 증3화음", pcs: [0, 4, 8], hint: "도–미–솔# (두 장3도)" },
  { name: "G7", pcs: [7, 11, 14, 17], hint: "솔–시–레–파" },
  { name: "F 장3화음", pcs: [5, 9, 12], hint: "파–라–도" },
  { name: "D 단7화음", pcs: [2, 5, 9, 12], hint: "레–파–라–도" },
];

const NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const WHITE = [0, 2, 4, 5, 7, 9, 11];

function freq(pc: number) {
  return 261.63 * Math.pow(2, pc / 12);
}

export function startChord(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const view = bindCanvas(canvas);
  let level = 0;
  let score = 0;
  let selected = new Set<number>();
  let coach = "목표 화음을 들은 뒤 같은 음을 고르세요.";
  let played = false;

  const whites = () => {
    const keys: number[] = [];
    for (let o = 0; o < 14; o++) {
      const pc = WHITE[o % 7] + Math.floor(o / 7) * 12;
      keys.push(pc);
    }
    return keys;
  };

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: CHORDS.length,
      score,
      status: CHORDS[level].name,
      coach,
    });
  };

  const playTarget = () => {
    unlockAudio();
    chordTones(CHORDS[level].pcs.map(freq), 0.85);
    played = true;
    coach = "같은 구성음을 건반에서 고르세요.";
    emit();
  };

  const playSel = () => {
    unlockAudio();
    chordTones([...selected].sort((a, b) => a - b).map(freq), 0.7);
  };

  const check = () => {
    const need = [...CHORDS[level].pcs].map((n) => n % 12).sort((a, b) => a - b);
    const got = [...selected].map((n) => n % 12);
    const uniq = [...new Set(got)].sort((a, b) => a - b);
    unlockAudio();
    if (uniq.length === need.length && uniq.every((n, i) => n === need[i])) {
      score += 130;
      coach = `맞았습니다. ${CHORDS[level].hint}`;
      tone(660, 0.1, "triangle", 0.06);
      emit();
      if (level + 1 >= CHORDS.length) {
        hooks.onClear(score);
        return;
      }
      level += 1;
      selected = new Set();
      played = false;
      setTimeout(playTarget, 500);
    } else {
      coach = `구성음이 다릅니다. 힌트: ${CHORDS[level].hint}`;
      tone(150, 0.12, "square", 0.05);
      emit();
    }
  };

  const layout = () => {
    const { w, h } = view.size();
    const wk = whites();
    const kw = Math.min(46, (w - 32) / wk.length);
    const kh = Math.min(168, h * 0.42);
    const x0 = (w - wk.length * kw) / 2;
    const y0 = h * 0.42;
    return { wk, kw, kh, x0, y0, w, h };
  };

  const hit = (x: number, y: number) => {
    const L = layout();
    const blackH = L.kh * 0.62;
    for (let i = 0; i < L.wk.length - 1; i++) {
      const pc = L.wk[i];
      const next = pc + 1;
      if (WHITE.includes(next % 12)) continue;
      const bx = L.x0 + i * L.kw + L.kw * 0.68;
      if (x >= bx && x <= bx + L.kw * 0.64 && y >= L.y0 && y <= L.y0 + blackH) {
        toggle(next);
        return;
      }
    }
    for (let i = 0; i < L.wk.length; i++) {
      const kx = L.x0 + i * L.kw;
      if (x >= kx && x <= kx + L.kw && y >= L.y0 && y <= L.y0 + L.kh) {
        toggle(L.wk[i]);
        return;
      }
    }
    if (y > L.h - 64) {
      if (x < L.w / 3) playTarget();
      else if (x < (L.w * 2) / 3) playSel();
      else check();
    }
  };

  const toggle = (pc: number) => {
    if (selected.has(pc)) selected.delete(pc);
    else selected.add(pc);
    unlockAudio();
    tone(freq(pc), 0.18, "triangle", 0.055);
    emit();
  };

  const onUp = () => hit(view.ptr.x, view.ptr.y);
  canvas.addEventListener("pointerup", onUp);

  const tick = () => {
    const ctx = view.ctx();
    if (!ctx) return;
    const L = layout();
    ctx.fillStyle = "#0e0f12";
    ctx.fillRect(0, 0, L.w, L.h);

    ctx.fillStyle = "rgba(236,232,225,0.72)";
    ctx.font = "600 24px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(CHORDS[level].name, L.w / 2, 48);
    ctx.font = "400 13px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(236,232,225,0.4)";
    ctx.fillText(played ? "구성음을 고른 뒤 확인" : "먼저 목표 화음을 들으세요", L.w / 2, 74);
    ctx.textAlign = "left";

    L.wk.forEach((pc, i) => {
      const x = L.x0 + i * L.kw;
      ctx.fillStyle = selected.has(pc) ? "#d7d2c8" : "#f4f0ea";
      ctx.fillRect(x, L.y0, L.kw - 1.5, L.kh);
      ctx.fillStyle = "#2a2622";
      ctx.font = "500 10px 'IBM Plex Mono', monospace";
      ctx.fillText(NOTE[pc % 12], x + 6, L.y0 + L.kh - 10);
    });
    L.wk.forEach((pc, i) => {
      const next = pc + 1;
      if (WHITE.includes(next % 12)) return;
      const x = L.x0 + i * L.kw + L.kw * 0.68;
      ctx.fillStyle = selected.has(next) ? "#6d6860" : "#1a1816";
      ctx.fillRect(x, L.y0, L.kw * 0.64, L.kh * 0.62);
    });

    const labels = ["목표 듣기", "내 화음", "확인"];
    labels.forEach((lab, i) => {
      const x = (L.w / 3) * i + 12;
      const y = L.h - 56;
      ctx.fillStyle = i === 2 ? "#d7d2c8" : "rgba(236,232,225,0.08)";
      ctx.fillRect(x, y, L.w / 3 - 24, 40);
      ctx.fillStyle = i === 2 ? "#0c0d10" : "#ece8e1";
      ctx.font = "600 13px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(lab, x + (L.w / 3 - 24) / 2, y + 26);
    });
    ctx.textAlign = "left";
  };

  emit();
  setTimeout(playTarget, 300);
  const stop = startLoop(tick);
  return {
    destroy: () => {
      stop();
      view.destroy();
      canvas.removeEventListener("pointerup", onUp);
    },
    restart: () => {
      level = 0;
      score = 0;
      selected = new Set();
      played = false;
      coach = "목표 화음을 들은 뒤 같은 음을 고르세요.";
      emit();
      playTarget();
    },
  };
}
