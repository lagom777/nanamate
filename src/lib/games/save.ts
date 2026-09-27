import type { GameId } from "./catalog";

const KEY = "nm-lab-v1";

export type Learned = { id: GameId; transfer: string; at: number };

type Store = {
  best: Partial<Record<GameId, number>>;
  learned: Learned[];
  muted: boolean;
};

function empty(): Store {
  return { best: {}, learned: [], muted: false };
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      best: parsed.best ?? {},
      learned: Array.isArray(parsed.learned) ? parsed.learned : [],
      muted: Boolean(parsed.muted),
    };
  } catch {
    return empty();
  }
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore quota */
  }
}

export function getBest(id: GameId): number {
  return read().best[id] ?? 0;
}

export function saveBest(id: GameId, score: number): number {
  const s = read();
  const next = Math.max(s.best[id] ?? 0, Math.round(score));
  s.best[id] = next;
  write(s);
  return next;
}

export function pushLearned(id: GameId, transfer: string) {
  const s = read();
  s.learned = [
    { id, transfer, at: Date.now() },
    ...s.learned.filter((x) => !(x.id === id && x.transfer === transfer)),
  ].slice(0, 24);
  write(s);
}

export function getLearned(): Learned[] {
  return read().learned;
}

export function isMuted(): boolean {
  return read().muted;
}

export function setMuted(muted: boolean) {
  const s = read();
  s.muted = muted;
  write(s);
}
