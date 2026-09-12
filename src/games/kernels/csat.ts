import { PAPER } from "@/lib/games/draw";
import { playExam } from "@/lib/games/examkit";
import { CSAT, getCsatDiff } from "@/lib/suneung";
import type { GameHandle, GameHooks } from "@/lib/games/runtime";

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  const pack = CSAT[id];
  if (!pack) throw new Error(`no csat pack: ${id}`);
  const diff = getCsatDiff();
  const bank = diff === "hard" ? pack.hard : pack.basic;
  const heading = `${pack.heading} · ${diff === "hard" ? "심화" : "기본"}`;
  return playExam(id, canvas, hooks, PAPER, heading, bank);
}
