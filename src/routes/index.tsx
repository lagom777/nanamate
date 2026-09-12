import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LabHeader } from "@/components/lab/shell";
import { GameMark } from "@/components/lab/marks";
import { GAMES, GROUPS, type GameId, type GroupId } from "@/lib/games/catalog";
import { chaptersOf } from "@/lib/games/curriculum";
import { getBest, getLearned, type Learned } from "@/lib/games/save";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [best, setBest] = useState<Record<string, number>>({});
  const [learned, setLearned] = useState<Learned[]>([]);
  const [group, setGroup] = useState<GroupId | "all">("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const b: Record<string, number> = {};
    for (const g of GAMES) b[g.id] = getBest(g.id);
    setBest(b);
    setLearned(getLearned());
  }, []);

  const cleared = GAMES.filter((g) => (best[g.id] ?? 0) > 0).length;

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return GAMES.filter((g) => {
      if (group !== "all" && g.group !== group) return false;
      if (!qq) return true;
      return (
        g.title.toLowerCase().includes(qq) ||
        g.subject.toLowerCase().includes(qq) ||
        g.titleEn.toLowerCase().includes(qq) ||
        g.kindLabel.toLowerCase().includes(qq)
      );
    });
  }, [group, q]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <LabHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
          {GAMES.length}과목 · 과목당 9장
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
          지식마다 다른 게임을 둔다.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          퀴즈 스킨이 아닙니다. 각 장의 개념을 손으로 한 번 해봐야 남습니다.
          수능은 기본·심화 두 난이도. 깬 과목 {cleared}/{GAMES.length}.{" "}
          <a href="/learn/" className="text-fg underline-offset-2 hover:underline">
            기존 강의 노트
          </a>
          도 그대로 둡니다.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <Tab active={group === "all"} onClick={() => setGroup("all")}>
              전체
            </Tab>
            {GROUPS.map((g) => (
              <Tab key={g.id} active={group === g.id} onClick={() => setGroup(g.id)}>
                {g.label}
              </Tab>
            ))}
          </div>
          <label className="block sm:w-56">
            <span className="sr-only">검색</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="과목, 제목"
              className="h-10 w-full rounded-md border border-line bg-elevated px-3 text-sm text-fg outline-none placeholder:text-faint focus:border-line-strong"
            />
          </label>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => {
            const n = chaptersOf(g.id).length || 9;
            return (
              <li key={g.id}>
                <Link
                  to="/play/$id"
                  params={{ id: g.id }}
                  className="group flex h-full gap-3 rounded-xl border border-line bg-elevated p-3.5 no-underline transition-colors hover:border-line-strong sm:p-4"
                >
                  <div className="size-11 shrink-0 text-muted group-hover:text-fg sm:size-12">
                    <GameMark id={g.id} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] text-muted">
                      {g.subject} · {g.kindLabel} · {n}장
                    </p>
                    <h2 className="mt-0.5 text-[17px] font-semibold leading-snug tracking-tight">
                      {g.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">{g.blurb}</p>
                    <p className="mt-2 text-[12px] tabular-nums text-faint">
                      {best[g.id] ? `최고 ${best[g.id]}` : "아직 기록 없음"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {list.length === 0 && (
          <p className="mt-10 text-sm text-muted">해당하는 과목이 없습니다.</p>
        )}

        <section className="mt-14 border-t border-line pt-8">
          <h2 className="text-xs font-medium tracking-[0.12em] text-muted uppercase">
            가져간 한 줄
          </h2>
          {learned.length === 0 ? (
            <p className="mt-3 text-sm text-faint">
              한 과목을 끝까지 깨면 여기에 전이 문장이 쌓입니다.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {learned.slice(0, 10).map((row) => (
                <li key={row.id + row.at} className="text-sm text-fg">
                  <span className="text-muted">{label(row.id)} — </span>
                  {row.transfer}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-md px-3 text-sm ${
        active ? "bg-accent text-accent-fg" : "border border-line text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function label(id: GameId) {
  return GAMES.find((g) => g.id === id)?.title ?? id;
}
