import { dokseo, munhak, csateng, khist } from "./lang";
import { hwajak, eonmae } from "./korean-select";
import { mathcsat, probstat, calc, geom } from "./math";
import { lifeeth, thought, smun, polilaw } from "./social";
import { econ, korgeo, worldgeo, worldhist, eahist } from "./inquiry";
import { phys1, chem1, bio1, earth1 } from "./science";
import type { CsatPack } from "./types";

export { getCsatDiff, setCsatDiff, type Diff } from "./types";

export const CSAT: Record<string, CsatPack> = {
  dokseo,
  munhak,
  hwajak,
  eonmae,
  csateng,
  khist,
  mathcsat,
  probstat,
  calc,
  geom,
  lifeeth,
  thought,
  smun,
  polilaw,
  econ,
  korgeo,
  worldgeo,
  worldhist,
  eahist,
  phys1,
  chem1,
  bio1,
  earth1,
};

export const CSAT_IDS = Object.keys(CSAT);
