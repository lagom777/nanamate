import { tone, unlockAudio } from "@/lib/games/audio";
import {
  bindCanvas,
  startLoop,
  type GameHandle,
  type GameHooks,
} from "@/lib/games/runtime";

type Market = {
  name: string;
  dA: number;
  dB: number;
  sA: number;
  sB: number;
};

const MARKETS: Market[] = [
  { name: "감자", dA: 120, dB: -1.1, sA: 10, sB: 1.0 },
  { name: "커피", dA: 140, dB: -0.9, sA: 20, sB: 0.8 },
  { name: "임대주택", dA: 160, dB: -0.7, sA: 40, sB: 0.55 },
  { name: "콘서트", dA: 110, dB: -1.4, sA: 5, sB: 1.3 },
  { name: "휘발유", dA: 150, dB: -0.55, sA: 30, sB: 0.7 },
  { name: "온라인강의", dA: 130, dB: -1.0, sA: 15, sB: 0.95 },
  { name: "명품백", dA: 90, dB: -0.4, sA: 10, sB: 0.45 },
  { name: "마스크(급등)", dA: 180, dB: -0.85, sA: 8, sB: 0.6 },
  { name: "탄소배출권", dA: 100, dB: -0.65, sA: 25, sB: 0.85 },
];

export function startMarket(canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const view = bindCanvas(canvas);
  let level = 0;
  let score = 0;
  let price = 55;
  let dragging = false;
  let lock = 0;
  let coach = "가격선을 끌어 수요량과 공급량을 겹치세요.";
  let wasDown = false;

  const emit = () => {
    hooks.onHud({
      level: level + 1,
      total: MARKETS.length,
      score,
      status: MARKETS[level].name,
      coach,
    });
  };

  const qd = (p: number, m: Market) => Math.max(0, m.dA + m.dB * p);
  const qs = (p: number, m: Market) => Math.max(0, m.sA + m.sB * p);
  const pStar = (m: Market) => (m.dA - m.sA) / (m.sB - m.dB);

  const tick = (dt: number) => {
    const ctx = view.ctx();
    const { w, h } = view.size();
    if (!ctx) return;
    const m = MARKETS[level];
    const padL = 56;
    const padR = 24;
    const padT = 36;
    const padB = 48;
    const gw = w - padL - padR;
    const gh = h - padT - padB;
    const pMax = 140;
    const qMax = 200;
    const yOf = (p: number) => padT + gh * (1 - p / pMax);
    const xOf = (q: number) => padL + gw * (q / qMax);

    if (view.ptr.down) {
      const inside =
        view.ptr.x > padL &&
        view.ptr.x < w - padR &&
        view.ptr.y > padT &&
        view.ptr.y < h - padB;
      if (inside || dragging) {
        dragging = true;
        price = Math.min(pMax - 4, Math.max(8, (1 - (view.ptr.y - padT) / gh) * pMax));
      }
    } else {
      dragging = false;
    }
    if (!view.ptr.down) wasDown = false;
    else wasDown = true;

    const demand = qd(price, m);
    const supply = qs(price, m);
    const gap = demand - supply;
    const eq = pStar(m);
    const close = Math.abs(price - eq) < 2.4;

    if (close) {
      lock += dt;
      if (lock > 0.55) {
        score += 110 + Math.round(20 - Math.abs(price - eq) * 4);
        unlockAudio();
        tone(500, 0.1, "sine", 0.06);
        coach = `${m.name} 균형가 ≈ ${eq.toFixed(0)}`;
        emit();
        if (level + 1 >= MARKETS.length) {
          hooks.onClear(score);
          return;
        }
        level += 1;
        price = 50 + Math.random() * 30;
        lock = 0;
        coach = "다음 시장. 다시 가격선을 맞추세요.";
        emit();
      }
    } else {
      lock = 0;
      coach =
        gap > 4
          ? `부족 ${gap.toFixed(0)} — 가격을 올리세요.`
          : gap < -4
            ? `잉여 ${(-gap).toFixed(0)} — 가격을 내리세요.`
            : "거의 청산. 미세 조정.";
    }

    ctx.fillStyle = "#efeae2";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(20,18,16,0.08)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      const y = padT + (gh / 6) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(20,18,16,0.45)";
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + gh);
    ctx.lineTo(padL + gw, padT + gh);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#6a3a32";
    ctx.lineWidth = 2;
    for (let px = 4; px <= pMax; px += 2) {
      const q = qd(px, m);
      const x = xOf(q);
      const y = yOf(px);
      if (px === 4) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#2f4d44";
    for (let px = 4; px <= pMax; px += 2) {
      const q = qs(px, m);
      const x = xOf(q);
      const y = yOf(px);
      if (px === 4) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const yP = yOf(price);
    const xD = xOf(demand);
    const xS = xOf(supply);
    const left = Math.min(xD, xS);
    const right = Math.max(xD, xS);
    ctx.fillStyle = gap > 0 ? "rgba(196,122,114,0.22)" : "rgba(47,77,68,0.18)";
    ctx.fillRect(left, yP, Math.max(2, right - left), padT + gh - yP);

    ctx.strokeStyle = close ? "#2f4d44" : "#1c1916";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(padL, yP);
    ctx.lineTo(w - padR, yP);
    ctx.stroke();
    ctx.fillStyle = "#1c1916";
    ctx.beginPath();
    ctx.arc(padL, yP, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3a3530";
    ctx.font = "600 12px Pretendard, sans-serif";
    ctx.fillText("수요", xOf(qd(pMax * 0.75, m)) + 6, yOf(pMax * 0.75));
    ctx.fillText("공급", xOf(qs(pMax * 0.3, m)) + 6, yOf(pMax * 0.3));
    ctx.font = "500 11px 'IBM Plex Mono', monospace";
    ctx.fillText(`P ${price.toFixed(0)}`, padL + 10, yP - 8);
    ctx.fillText(`Qd ${demand.toFixed(0)}   Qs ${supply.toFixed(0)}`, padL, h - 18);
    ctx.fillStyle = "rgba(28,25,22,0.45)";
    ctx.font = "500 12px Pretendard, sans-serif";
    ctx.fillText("가격 ↑", 10, padT + 8);
    ctx.fillText("수량 →", w - 70, h - 18);
  };

  emit();
  const stop = startLoop(tick);
  return {
    destroy: () => {
      stop();
      view.destroy();
    },
    restart: () => {
      level = 0;
      score = 0;
      price = 55;
      lock = 0;
      coach = "가격선을 끌어 수요량과 공급량을 겹치세요.";
      emit();
    },
  };
}
