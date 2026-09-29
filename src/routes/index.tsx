import { createFileRoute } from "@tanstack/react-router";
import { LabHeader } from "@/components/lab/shell";

export const Route = createFileRoute("/")({ component: Home });

const TRACKS = [
  {
    href: "/learn/aboutSuneungKorean/index.html",
    tag: "국어",
    title: "수능 국어",
    blurb: "독서 유형과 함정 문장, 문학 갈래와 보기.",
  },
  {
    href: "/learn/aboutSuneungCalculus/index.html",
    tag: "수학",
    title: "수능 미적분",
    blurb: "극한·미분·적분. 선택 미적분만 모았습니다.",
  },
  {
    href: "/learn/aboutSuneungEnglish/index.html",
    tag: "영어",
    title: "수능 영어",
    blurb: "듣기 17, 빈칸·순서·삽입·장문. 90점이 1등급 선.",
  },
  {
    href: "/learn/aboutSuneungPhysics1/index.html",
    tag: "탐구",
    title: "수능 물리학Ⅰ",
    blurb: "7파트 정리, 모션 노트, 기출 16회 채점·해설.",
  },
  {
    href: "/learn/aboutSuneungBio1/index.html",
    tag: "탐구",
    title: "수능 생명과학Ⅰ",
    blurb: "8파트 정리, 모션 노트, 기출 16회 채점·해설.",
  },
];

function Home() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <LabHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">
          2027 수능 · 이과 다섯 과목
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
          국어 · 미적분 · 영어 · 물리 I · 생 I
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          과목마다 파트별로 개념을 읽고, 짝짓기와 선택 문제로 확인한 뒤 실제 기출을
          풀어 봅니다.{" "}
          <a href="/learn/" className="text-fg underline-offset-2 hover:underline">
            다른 강의 노트
          </a>
          도 허브에서 열 수 있습니다.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((row) => (
            <li key={row.href}>
              <a
                href={row.href}
                className="group flex h-full flex-col rounded-xl border border-line bg-elevated p-3.5 no-underline transition-colors hover:border-line-strong sm:p-4"
              >
                <p className="text-[12px] text-muted">{row.tag}</p>
                <h2 className="mt-0.5 text-[17px] font-semibold leading-snug tracking-tight">
                  {row.title}
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{row.blurb}</p>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
