import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Volume2, VolumeX } from "lucide-react";
import { LabHeader } from "@/components/lab/shell";
import { startCannon } from "@/games/cannon";
import { startChord } from "@/games/chord";
import { startDna } from "@/games/dna";
import { startEra } from "@/games/era";
import { startMarket } from "@/games/market";
import { startOrbit } from "@/games/orbit";
import { gameById } from "@/lib/games/catalog";
import { chapterAt, chaptersOf } from "@/lib/games/curriculum";
import { startKernelGame } from "@/lib/games/factory";
import { unlockAudio } from "@/lib/games/audio";
import { isMuted, pushLearned, saveBest, setMuted } from "@/lib/games/save";
import { getCsatDiff, setCsatDiff, type Diff } from "@/lib/suneung";
import type { GameHandle, Hud } from "@/lib/games/runtime";

export const Route = createFileRoute("/play/$id")({ component: Play });

function Play() {
  const { id } = Route.useParams();
  const meta = gameById(id);
  if (!meta) return <Navigate to="/" />;
  return <PlayInner id={meta.id} />;
}

function PlayInner({ id }: { id: string }) {
  const meta = gameById(id)!;
  const chapters = chaptersOf(id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const [hud, setHud] = useState<Hud>({
    level: 1,
    total: chapters.length || 1,
    score: 0,
    status: "",
    coach: meta.how,
  });
  const [cleared, setCleared] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [best, setBest] = useState(0);
  const [csatDiff, setCsatDiffUi] = useState<Diff>("basic");

  const chapter = chapterAt(id, hud.level);
  const paper = Boolean(meta.paper);
  const isCsat = meta.group === "suneung";

  const onHud = useCallback((h: Hud) => setHud(h), []);
  const onClear = useCallback(
    (score: number) => {
      const b = saveBest(id, score);
      pushLearned(id, meta.transfer);
      setBest(b);
      setHud((prev) => ({ ...prev, score, coach: meta.transfer }));
      setCleared(true);
    },
    [id, meta.transfer],
  );

  useEffect(() => {
    setMutedState(isMuted());
    setCleared(false);
    if (isCsat) {
      const stored = getCsatDiff();
      if (stored !== csatDiff) {
        setCsatDiffUi(stored);
        return;
      }
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    unlockAudio();
    void document.fonts?.load("500 16px Pretendard");
    const custom =
      id === "cannon"
        ? startCannon
        : id === "orbit"
          ? startOrbit
          : id === "dna"
            ? startDna
            : id === "market"
              ? startMarket
              : id === "chord"
                ? startChord
                : id === "era"
                  ? startEra
                  : null;
    const h = custom ? custom(canvas, { onHud, onClear }) : startKernelGame(id, canvas, { onHud, onClear });
    if (!h) return;
    handleRef.current = h;
    return () => {
      h.destroy();
      handleRef.current = null;
    };
  }, [id, onClear, onHud, isCsat ? csatDiff : "off"]);

  const restart = () => {
    setCleared(false);
    handleRef.current?.restart();
  };

  const pickDiff = (d: Diff) => {
    if (d === csatDiff) return;
    setCsatDiff(d);
    setCsatDiffUi(d);
    setCleared(false);
  };

  return (
    <div className={`flex h-dvh flex-col overflow-hidden ${paper ? "bg-[#efeae2] text-[#1c1916]" : "bg-bg text-fg"}`}>
      <LabHeader compact />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[12px] text-muted">
              {meta.subject} · {meta.kindLabel}
              {isCsat ? ` · ${csatDiff === "hard" ? "심화" : "기본"}` : ""}
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{meta.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-[13px] tabular-nums text-muted">
            {isCsat && (
              <div className="mr-1 flex overflow-hidden rounded-md border border-line text-[12px] font-medium">
                <button
                  type="button"
                  onClick={() => pickDiff("basic")}
                  className={`px-3 py-1.5 ${
                    csatDiff === "basic"
                      ? paper
                        ? "bg-[#1c1916] text-[#efeae2]"
                        : "bg-accent text-accent-fg"
                      : ""
                  }`}
                >
                  기본
                </button>
                <button
                  type="button"
                  onClick={() => pickDiff("hard")}
                  className={`px-3 py-1.5 ${
                    csatDiff === "hard"
                      ? paper
                        ? "bg-[#1c1916] text-[#efeae2]"
                        : "bg-accent text-accent-fg"
                      : ""
                  }`}
                >
                  심화
                </button>
              </div>
            )}
            <span>
              {hud.level}/{hud.total}
            </span>
            <span>{hud.score}점</span>
            {hud.shots != null && <span>탄 {hud.shots}</span>}
            <button
              type="button"
              aria-label={muted ? "소리 켜기" : "소리 끄기"}
              className="grid size-10 place-items-center rounded-md border border-line"
              onClick={() => {
                const next = !muted;
                setMutedState(next);
                setMuted(next);
              }}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <Link to="/" className="grid h-10 place-items-center px-2 text-sm no-underline">
              허브
            </Link>
          </div>
        </div>

        {chapters.length > 0 && (
          <div className="flex gap-1 overflow-x-auto border-b border-line px-4 py-2 sm:px-6">
            {chapters.map((c, i) => {
              const on = i === hud.level - 1 || (cleared && i === chapters.length - 1);
              const done = i < hud.level - 1 || cleared;
              return (
                <span
                  key={c.name}
                  className={`shrink-0 rounded-md px-2 py-1 text-[12px] ${
                    on
                      ? paper
                        ? "bg-[#1c1916] text-[#efeae2]"
                        : "bg-accent text-accent-fg"
                      : done
                        ? "text-ok"
                        : "text-muted"
                  }`}
                >
                  {i + 1} {c.name}
                </span>
              );
            })}
          </div>
        )}

        <div className="px-4 pt-3 sm:px-6">
          {chapter && (
            <p className="text-[12px] font-medium text-muted">
              {hud.level}장 · {chapter.name}
            </p>
          )}
          <p className="mt-0.5 min-h-0 text-[15px] leading-relaxed sm:min-h-10">
            {hud.coach || chapter?.teach || meta.how}
          </p>
        </div>

        <div className="relative mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-line sm:mx-6">
          <canvas ref={canvasRef} className="block h-full w-full" />

          {cleared && (
            <div
              className={`absolute inset-0 z-10 grid place-items-center p-6 ${
                paper ? "bg-[#efeae2]/88 text-[#1c1916]" : "bg-bg/80 text-fg"
              }`}
            >
              <div className="w-full max-w-sm rounded-xl border border-line bg-elevated p-6 text-center text-fg">
                <p className="text-xs font-medium tracking-[0.14em] text-muted uppercase">9장을 닫았습니다</p>
                <p className="mt-3 text-lg font-semibold leading-snug">{meta.transfer}</p>
                <p className="mt-3 text-[13px] tabular-nums text-muted">
                  점수 {hud.score} · 최고 {best || hud.score}
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={restart}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
                  >
                    한 판 더
                  </button>
                  <Link
                    to="/"
                    className="rounded-md border border-line px-4 py-2 text-sm text-fg no-underline"
                  >
                    다른 과목
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
