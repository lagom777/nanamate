import type { ExamItem } from "@/lib/games/examkit";

export type Diff = "basic" | "hard";

export type CsatPack = {
  heading: string;
  basic: ExamItem[][];
  hard: ExamItem[][];
};

export function item(
  title: string,
  body: string[],
  slots: { label: string; accept: string; ok: string }[],
  traps: string[],
  why: string,
): ExamItem {
  return {
    title,
    body,
    slots: slots.map((s) => ({ id: s.accept, label: s.label, accept: s.accept })),
    chips: [
      ...slots.map((s) => ({ text: s.ok, role: s.accept })),
      ...traps.map((text) => ({ text, role: "x" })),
    ],
    why,
  };
}

const KEY = "nanamate-csat-diff";

let diff: Diff = "basic";
let loaded = false;

function readStored(): Diff {
  try {
    if (typeof localStorage === "undefined") return "basic";
    return localStorage.getItem(KEY) === "hard" ? "hard" : "basic";
  } catch {
    return "basic";
  }
}

export function setCsatDiff(d: Diff) {
  diff = d;
  loaded = true;
  try {
    localStorage.setItem(KEY, d);
  } catch {
    /* ignore quota / private mode */
  }
}

export function getCsatDiff(): Diff {
  if (!loaded) {
    diff = readStored();
    loaded = true;
  }
  return diff;
}

