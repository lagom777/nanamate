// 수능 한국사 — 시대별 9파트 + 암기법 + 전략 (content/hi-*.mjs, 전략은 content/st-hi.mjs). 기출은 필수 영역이 된 2017학년도부터(exams.json 의 hist).
import { note, tip, tbl, examsOf } from "./lib.mjs";
import { UNITS, TERR, TERR_ORDER } from "./hist-scenes.mjs";
import { motionPages, mapPage, sceneIndex } from "./hist-motion.mjs";
import { styles } from "./content/style-hist.mjs";
import { quick } from "./content/quick-hist.mjs";

const load = async (n) => { try { return (await import(`./content/${n}.mjs`)).chapters; } catch { return []; } };
const chapters = [...(await load("hi-1")), ...(await load("hi-2")), ...(await load("hi-3")), ...(await load("hi-memo")), ...(await load("st-hi"))];

// 파트 챕터 ↔ 모션 노트: 합본의 장면 번호로 링크하고, 그 파트만 재생하는 페이지도 붙인다.
UNITS.forEach((u, k) => {
  const c = chapters.find((x) => x.file === u.file);
  if (!c) return;
  c.motion = sceneIndex(k).map(({ i, title }) => [i, title]);
  c.motionPage = u.file;
  const first = TERR_ORDER.find((id) => TERR[id].u === k);
  if (first) c.mapLink = `map.html#${first}`;
});

export const spec = {
  sub: "hist", styles, quick, folder: "aboutSuneungHistory", label: "수능 한국사", short: "한국사", color: "#be123c",
  glow: "rgba(190,18,60,0.12)", border: "rgba(190,18,60,0.16)",
  asideSub: "수능 한국사 — 시대별 9파트 + 암기법 + 전략",
  h1: "수능 한국사,<br><em>시대별</em>로<br>흐름 잡기",
  authors: "2015 개정 교육과정 · 2027학년도 수능까지 · 필수 영역 · 절대평가",
  affiliation: "고대 · 중세·근세 · 근대·현대 · 9파트 · 암기법 · 전략 · 한눈에 요약",
  summary: true, summaryBlurb: "파트별 연표·표·함정을 카드 한 장씩에 — 시험 직전 훑어보기용",
  motion: true, motionBlurb: "연표·지도·인과 사슬·퀴즈로 움직이며 외우기 — 전체 합본과 파트별 재생", extra: { ...motionPages(), "map.html": mapPage() },
  extraLinks: [{ href: "map.html", label: "🗺️ 영토 변화 지도", num: "MAP", blurb: "기원전 2세기부터 1953년까지, 연도 슬라이더로 넘겨 보는 지도 인포그래픽" }],
  kind: "items", qn: 20, minutes: 30,
  chapters,
  intro: `<h2>이 노트가 다루는 것</h2>
<p>수능 한국사는 <strong>모든 수험생이 응시해야 하는 필수 영역</strong>이고, 20문항 50점 만점의 절대평가입니다(40점 이상이면 1등급). 문항은 사료·유물·지도 같은 자료를 보고 시대와 사건을 알아맞힌 다음, 그에 맞는 설명을 고르는 방식이 대부분입니다. 이 노트는 선사 시대부터 현대까지를 아홉 파트로 나누어, 파트마다 <em>흐름 → 핵심 표(왕·제도·사건) → 함정 → 대표 예제 → 짝짓기·퀴즈</em> 순서로 정리했습니다.</p>
${note("시험 구조", "20문항 · 50점 · 30분. 2점 10문항 + 3점 10문항, 5지선다. 성적은 표준점수·백분위 없이 1~9등급으로만 통지되고, 응시하지 않으면 그 해 수능 성적이 모두 무효 처리됩니다.")}
<h2>파트 구성</h2>
${tbl(["시대", "파트", "핵심"], [["고대", "1 선사와 고조선·여러 나라 · 2 삼국과 가야 · 3 남북국 시대", "시대 구분·초기 국가 풍습·삼국 전성기·통일 과정·발해"], ["중세·근세", "4 고려 · 5 조선 전기 · 6 조선 후기", "왕별 정책·대외 항쟁·무신 정권·사화·양난·탕평·실학"], ["근대·현대", "7 근대(개항~국권 피탈) · 8 일제 강점기 · 9 현대", "개항·개혁·동학·독립운동·민주화·통일 정책"], ["암기법", "10 재밌게 외우는 법", "두음·숫자 리듬·간지 보너스·대비 쌍·이야기·하루 루틴"], ["전략", "11 실전 전략", "등급 계산·핵심 연표·사료 키워드·시간 배분"]])}
${tip("한국사는 ‘순서’의 과목입니다. 각 파트를 읽은 뒤 10번 암기법 파트와 11번 전략 파트의 핵심 연표로 돌아와 시대 사이의 앞뒤 관계를 확인하고, ‘한눈에 요약’에서 표만 다시 훑으면 복습이 빠릅니다.")}`,
  after: `<h2>기출 풀어보기</h2><p>한국사가 필수 영역·절대평가가 된 <strong>2017학년도부터</strong>의 수능과 6월·9월 모의평가 <strong>${examsOf("hist").length}회 ${examsOf("hist").length * 20}문항</strong>을 실제 시험지 그대로 풀고 채점할 수 있습니다. 20문항 30분, 40점 이상이면 1등급입니다.</p><p><a class="cta" href="practice.html">📝 한국사 기출 풀어보기 →</a></p>`,
};
