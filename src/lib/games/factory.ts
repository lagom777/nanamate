import type { GameHandle, GameHooks } from "./runtime";
import { gameById, type KernelId } from "./catalog";
import { play as playBond } from "@/games/kernels/bond";
import { play as playPlates } from "@/games/kernels/plates";
import { play as playSketch } from "@/games/kernels/sketch";
import { play as playPulse } from "@/games/kernels/pulse";
import { play as playFit } from "@/games/kernels/fit";
import { play as playRunway } from "@/games/kernels/runway";
import { play as playAllocate } from "@/games/kernels/allocate";
import { play as playFunnel } from "@/games/kernels/funnel";
import { play as playRoute } from "@/games/kernels/route";
import { play as playBins } from "@/games/kernels/bins";
import { play as playWire } from "@/games/kernels/wire";
import { play as playPlace } from "@/games/kernels/place";
import { play as playStack } from "@/games/kernels/stack";
import { play as playOrder } from "@/games/kernels/order";
import { play as playLogic } from "@/games/kernels/logic";
import { play as playSteer } from "@/games/kernels/steer";
import { play as playListen } from "@/games/kernels/listen";
import { play as playMeter } from "@/games/kernels/meter";
import { play as playStroop } from "@/games/kernels/stroop";
import { play as playCollect } from "@/games/kernels/collect";
import { play as playSyntax } from "@/games/kernels/english";
import { play as playEssay } from "@/games/kernels/writing";
import { play as playLoop } from "@/games/kernels/harness";
import { play as playJourney } from "@/games/kernels/tarot";
import { play as playPrecept } from "@/games/kernels/religion";
import { play as playAttend } from "@/games/kernels/attend";
import { play as playJoin } from "@/games/kernels/join";
import { play as playBoxes } from "@/games/kernels/boxes";
import { play as playWheel } from "@/games/kernels/astrology";
import { play as playQi } from "@/games/kernels/qi";
import { play as playPillars } from "@/games/kernels/pillars";
import { play as playTies } from "@/games/kernels/ties";
import { play as playRepair } from "@/games/kernels/repair";
import { play as playSavor } from "@/games/kernels/savor";
import { play as playSpoil } from "@/games/kernels/spoil";
import { play as playToeic } from "@/games/kernels/toeic";
import { play as playTeps } from "@/games/kernels/teps";
import { play as playCave } from "@/games/kernels/cave";
import { play as playNostos } from "@/games/kernels/nostos";
import { play as playExposure } from "@/games/kernels/exposure";
import { play as playCsat } from "@/games/kernels/csat";
import { play as playSuneung } from "@/games/kernels/suneung";

type Starter = (id: string, canvas: HTMLCanvasElement, hooks: GameHooks) => GameHandle;

const KERNELS: Record<Exclude<KernelId, "custom">, Starter> = {
  bond: playBond,
  plates: playPlates,
  sketch: playSketch,
  pulse: playPulse,
  fit: playFit,
  runway: playRunway,
  allocate: playAllocate,
  funnel: playFunnel,
  route: playRoute,
  bins: playBins,
  wire: playWire,
  place: playPlace,
  stack: playStack,
  order: playOrder,
  logic: playLogic,
  steer: playSteer,
  listen: playListen,
  meter: playMeter,
  stroop: playStroop,
  collect: playCollect,
  syntax: playSyntax,
  essay: playEssay,
  loop: playLoop,
  journey: playJourney,
  precept: playPrecept,
  attend: playAttend,
  join: playJoin,
  boxes: playBoxes,
  wheel: playWheel,
  qi: playQi,
  pillars: playPillars,
  ties: playTies,
  repair: playRepair,
  savor: playSavor,
  spoil: playSpoil,
  toeic: playToeic,
  teps: playTeps,
  cave: playCave,
  nostos: playNostos,
  exposure: playExposure,
  csat: playCsat,
  suneung: playSuneung,
};

export function startKernelGame(
  id: string,
  canvas: HTMLCanvasElement,
  hooks: GameHooks,
): GameHandle | null {
  const meta = gameById(id);
  if (!meta || meta.kernel === "custom") return null;
  return KERNELS[meta.kernel](id, canvas, hooks);
}
