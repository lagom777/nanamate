import { play as playTies } from "./ties";
import type { GameHandle, GameHooks } from "@/lib/games/runtime";

export function play(id: string, canvas: HTMLCanvasElement, hooks: GameHooks): GameHandle {
  return playTies(id, canvas, hooks);
}
