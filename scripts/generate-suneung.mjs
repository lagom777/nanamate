import fs from "fs";
import path from "path";

const ROOT = "/Users/kg/coding/studywithai/public/learn/aboutSuneung";
const COLOR = "#dc2626";

const TOC = [
  ["index.html", "표지 · 이과 총람"],
  ["chapters/01-overview.html", "1. 수능 이과 한눈에"],
  ["chapters/02-korean-reading.html", "2. 국어 독서"],
  ["chapters/03-korean-lit.html", "3. 국어 문학"],
  ["chapters/04-calc-diff.html", "4. 미적분 — 극한·미분"],
  ["chapters/05-calc-int.html", "5. 미적분 — 적분·활용"],
  ["chapters/06-english.html", "6. 수능 영어"],
  ["chapters/07-phys1.html", "7. 물리학 I"],
  ["chapters/08-bio1.html", "8. 생명과학 I"],
  ["chapters/09-strategy.html", "9. 실전 시간·오답"],
];

function aside(active) {
  const items = TOC.map(([href, label]) => {
    const file = href.startsWith("chapters/") ? href.slice(9) : href;
    const here = active === href || active === file;
    const prefix = active.startsWith("chapters/") || active.includes("/") ? "" : "";
    const link = active.startsWith("01") || active.includes("chapter") || /^\d/.test(active)
      ? (href.startsWith("chapters/") ? href.slice(9) : "../" + href)
      : href;
    // From index: href as-is. From chapters: index -> ../index.html, others -> filename
    let u = href;
    if (active !== "index.html") {
      u = href === "index.html" ? "../index.html" : href.replace("chapters/", "");
    }
    const style = here ? ' style="color:var(--accent);font-weight:600;"' : "";
    return `<li><a href="${u}"${style}>${label}</a></li>`;
  }).join("\n");
  const back = active === "index.html" ? "../index.html" : "../../index.html";
  return `<aside><a href="${back}" class="hub-back-link">↑ 통합 허브</a><h3>전체 목차</h3><ol>
${items}
</ol></aside>`;
}

function head(title, isChapter) {
  const css = isChapter ? "../styles.css" : "styles.css";
  const shared = isChapter ? "../../shared" : "../shared";
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="${css}">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<link rel="stylesheet" href="${shared}/light-theme.css">
<script defer src="${shared}/i18n.js"></script>
<script defer src="${shared}/support.js"></script>
<script defer src="${shared}/search.js"></script>
<script defer src="${shared}/difficulty.js"></script>
<script defer src="${shared}/quizgame3d.js"></script>
<script defer src="${shared}/learngame3d.js"></script>
</head>`;
}

function tabs(easy, hard) {
  return `<h2>난이도별 학습</h2>
<p>본인 수준에 맞춰 탭을 선택하세요. 왼쪽 사이드바에서 난이도를 바꿀 수 있습니다.</p>
<div class="difficulty-tabs">
  <button class="difficulty-tab" data-target="easy">쉬움</button>
  <button class="difficulty-tab" data-target="hard">고급</button>
</div>
<div class="difficulty-content" data-level="easy">
  <span class="difficulty-badge easy">쉬움</span>
${easy}
</div>
<div class="difficulty-content" data-level="hard">
  <span class="difficulty-badge hard">고급</span>
${hard}
</div>`;
}

function games(prompt, pairs, questions) {
  return `<h2>직접 해보기</h2>
<p>${prompt}</p>
<div id="nm-game-host"></div>
<script>window.NANAMATE_GAME=${JSON.stringify({ type: "matching", color: COLOR, prompt, pairs })};</script>
<h2>개념 확인</h2>
<p>이 장에서 정리한 핵심만 고르세요. 게임은 이 페이지 안에 있습니다.</p>
<div id="nm-quiz-host"></div>
<script>window.NANAMATE_QUIZ=${JSON.stringify({ color: COLOR, questions })};</script>`;
}

function sceneScript(caps) {
  return `<script>
(function(){
  var c=document.getElementById('sim-scene'); if(!c||typeof THREE==='undefined') return;
  var s=new THREE.Scene();
  var cam=new THREE.PerspectiveCamera(50,c.clientWidth/c.clientHeight,0.1,1000);
  cam.position.set(0,0.4,9); cam.lookAt(0,0,0);
  var r; try{r=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){return;}
  r.setSize(c.clientWidth,c.clientHeight); r.setPixelRatio(Math.min(window.devicePixelRatio,2));
  c.appendChild(r.domElement);
  var core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,1), new THREE.MeshBasicMaterial({color:0xdc2626,wireframe:true}));
  s.add(core);
  var ring=new THREE.Mesh(new THREE.TorusGeometry(2.2,0.05,10,64), new THREE.MeshBasicMaterial({color:0xf59e0b,transparent:true,opacity:0.7}));
  ring.rotation.x=Math.PI/2.4; s.add(ring);
  var hint=document.querySelector('.interact-hint');
  var caps=${JSON.stringify(caps)}; var ci=0,t=0;
  if(hint) hint.textContent=caps[0];
  var md=false,px=0,py=0;
  c.addEventListener('mousedown',function(e){md=true;px=e.clientX;py=e.clientY;});
  window.addEventListener('mouseup',function(){md=false;});
  c.addEventListener('mousemove',function(e){if(!md)return;s.rotation.y+=(e.clientX-px)*0.005;s.rotation.x+=(e.clientY-py)*0.005;px=e.clientX;py=e.clientY;});
  function a(){requestAnimationFrame(a);t+=0.016;core.rotation.y+=0.006;ring.rotation.z+=0.004;
    if(hint&&t>4){t=0;ci=(ci+1)%caps.length;hint.textContent=caps[ci];}
    r.render(s,cam);} a();
})();
</script>`;
}

const files = {};

files["index.html"] = `${head("수능 이과: 국어·미적·영어·물리1·생1", false)}
<body><div class="layout">
${aside("index.html")}
<main>
<header class="paper-header">
  <h1>수능 이과,<br><em>다섯 과목</em>을<br>한 흐름으로</h1>
  <p class="authors">2027학년도 수능 · 국어 · 수학(미적분) · 영어 · 물리학 I · 생명과학 I</p>
  <p class="affiliation">게임을 따로 모으지 않습니다. 각 장 본문 안에서 손으로 확인합니다.</p>
</header>
<div class="scene-3d" id="sim-scene"></div>
<span class="interact-hint">이과 선택: 국어 · 미적분 · 영어 · 물리1 · 생1</span>
<h2>이 트랙이 다루는 것</h2>
<p>2027학년도 수능(2015 개정) 기준으로 <strong>이과가 실제로 치는 다섯 축</strong>만 모았습니다. 국어는 공통 독서·문학, 수학은 공통(수학Ⅰ·Ⅱ) 위의 <strong>미적분</strong>, 영어는 절대평가 듣기·독해, 탐구는 <strong>물리학 I</strong>과 <strong>생명과학 I</strong>입니다. 대학 교양 물리·생물 노트와 달리, 여기서는 출제 범위와 보기 함정을 기준으로 정리합니다.</p>
<div class="info-card"><h4>Lab은 따로 두지 않습니다</h4><p>예전에 있던 시그니처 게임 허브는 뺐습니다. 포물선·염기쌍·그래프 같은 조작은 해당 과목 장 안에 있습니다. 수능 장도 짝짓기·선택 문제를 본문 바로 아래에 붙였습니다.</p></div>
<h2>학습 로드맵</h2>
<div class="outline-grid">
  <div class="outline-card"><div class="num">01</div><h4>이과 한눈에</h4><p>시간표, 공통+선택, 절대평가</p></div>
  <div class="outline-card"><div class="num">02–03</div><h4>국어</h4><p>독서 유형 · 문학 갈래와 보기</p></div>
  <div class="outline-card"><div class="num">04–05</div><h4>미적분</h4><p>극한·미분 · 적분과 활용</p></div>
  <div class="outline-card"><div class="num">06</div><h4>영어</h4><p>듣기 17 · 빈칸·순서·삽입·장문</p></div>
  <div class="outline-card"><div class="num">07</div><h4>물리학 I</h4><p>역학부터 파동·광전까지</p></div>
  <div class="outline-card"><div class="num">08</div><h4>생명과학 I</h4><p>세포·유전·항상성·생태계</p></div>
  <div class="outline-card"><div class="num">09</div><h4>실전</h4><p>시간 배분과 오답 패턴</p></div>
</div>
<h2>시험 뼈대</h2>
<p>국어 45문항 80분(공통 독서·문학 + 화작/언매 택1). 수학 30문항 100분(공통 수학Ⅰ·Ⅱ + 미적분). 영어 45문항 70분(듣기 17 포함, 등급만). 탐구는 과목당 20문항 30분, 최대 2과목. 이 노트는 탐구를 물리1·생1로 고정합니다.</p>
</main></div>
${sceneScript(["국어·미적·영어가 점수 뼈대입니다.", "탐구는 물리1과 생1, 과목당 30분.", "게임은 허브가 아니라 각 장 안에 있습니다."])}
</body></html>`;

function chapter({ file, title, sub, body, easy, hard, prompt, pairs, questions, caps }) {
  files["chapters/" + file] = `${head(title + " — 수능 이과", true)}
<body><div class="layout">
${aside(file)}
<main>
<header class="paper-header"><h1>${title}</h1><p class="authors">${sub}</p></header>
<div class="scene-3d" id="sim-scene"></div>
<span class="interact-hint">${caps[0]}</span>
${body}
${tabs(easy, hard)}
${games(prompt, pairs, questions)}
</main></div>
${sceneScript(caps)}
</body></html>`;
}

chapter({
  file: "01-overview.html",
  title: "수능 이과 한눈에",
  sub: "Chapter 1 — 2027학년도 체제",
  body: `<h2>무엇을 치르나</h2>
<p>2027학년도 수능은 2015 개정 교육과정입니다. 국어·수학은 <strong>공통과목 + 선택과목</strong>, 영어·한국사는 절대평가, 탐구는 17과목 중 최대 2과목입니다. 이과 트랙에서 이 노트가 고정하는 선택은 <strong>수학 미적분</strong>, 탐구 <strong>물리학 I · 생명과학 I</strong>입니다.</p>
<div class="info-card"><h4>시간표</h4><p>1교시 국어 80분 · 2교시 수학 100분 · 3교시 영어 70분 · 4교시 한국사 30분 후 탐구 과목당 30분. 한국사를 안 치면 성적 전체가 무효입니다.</p></div>`,
  easy: `<h3>한 줄</h3><p>이과는 국어·영어를 공통으로 치고, 수학은 미적분, 탐구는 물리1이랑 생1을 고르는 길입니다.</p>
<h3>왜 이렇게 짜나</h3><p>국어·영어는 모든 모집단이 같아서 표준점수가 안정적입니다. 수학 미적분과 과탐은 응시 풀이 겹쳐 변별이 여기서 납니다. 탐구 한 과목을 쉽게 고르면 다른 과목 실수가 바로 백분위에 붙습니다.</p>
<ul><li>국어: 독서·문학이 공통, 선택 한 과목</li><li>수학: Ⅰ·Ⅱ 공통 + 미적분</li><li>영어: 등급만, 듣기 17문항</li><li>탐구: 물1·생1, 각 20문항</li></ul>`,
  hard: `<h3>공통 75% · 선택 25%</h3><p>국어·수학은 공통과목 비중이 큽니다. 미적분에서 점수를 깎여도 공통(지수로그·삼각·수열·극한·미분적분의 공통분)을 놓치면 회복이 어렵습니다. 선택 과목 유불리 보정은 있으나, 공통 원점수가 뼈대입니다.</p>
<div class="warning-box"><strong>자주 하는 착각:</strong> “미적만 잘하면 된다”는 아닙니다. 수학Ⅰ·Ⅱ 문항이 더 많습니다.</div>
<h3>영어 절대평가</h3><p>1등급 컷은 원점수 90입니다. 빈칸·장문에서 두세 개 놓치면 2등급으로 내려갑니다. 듣기 17을 먼저 고정하는 것이 1등급의 최소 조건입니다.</p>`,
  prompt: "영역과 구성을 짝지으세요.",
  pairs: [
    { term: "국어", def: "45문항 · 80분 · 공통+선택" },
    { term: "수학 미적분", def: "공통 Ⅰ·Ⅱ + 미적 선택 · 100분" },
    { term: "영어", def: "45문항 · 듣기 17 · 절대평가" },
    { term: "물리학 I", def: "20문항 · 30분 · 역학~현대" },
    { term: "생명과학 I", def: "20문항 · 30분 · 유전·항상성" },
  ],
  questions: [
    { q: "2027 수능 국어 시간은?", choices: ["70분", "80분", "100분", "60분"], answer: 1 },
    { q: "수학 선택으로 이 노트가 고정한 과목은?", choices: ["확률과 통계", "기하", "미적분", "경제수학"], answer: 2 },
    { q: "영어 1등급 원점수 컷은?", choices: ["80", "85", "90", "95"], answer: 2 },
    { q: "한국사를 안 치면?", choices: ["한국사만 0점", "탐구만 무효", "성적 전체 무효", "재응시 가능"], answer: 2 },
    { q: "탐구 한 과목 문항 수는?", choices: ["15", "20", "30", "45"], answer: 1 },
  ],
  caps: ["공통이 점수 뼈대입니다.", "미적은 선택 25% 안쪽입니다.", "영어는 90점부터 1등급입니다."],
});

chapter({
  file: "02-korean-reading.html",
  title: "국어 독서",
  sub: "Chapter 2 — 인문·사회·과학 지문",
  body: `<h2>독서가 묻는 것</h2>
<p>공통 독서는 지문 밖 배경지식을 요구하지 않습니다. 답이 되는 문장은 거의 항상 <strong>지문이 실제로 말한 범위</strong> 안에 있습니다. 유형은 중심 내용, 세부 정보, 추론, 적용, 빈칸·순서·삽입입니다.</p>
<div class="info-card"><h4>읽는 순서</h4><p>첫 문단에서 화제와 입장을 잡고, 중간에서 구분 기준(A와 B를 가르는 축)을 표시한 뒤, 보기와 지문을 한 줄씩 대조합니다. 보기 중 “지문이 가능성만 말한 것을 필연으로 바꾼 문장”이 최다 오답입니다.</p></div>`,
  easy: `<h3>한 줄</h3><p>독서는 ‘내가 아는 이야기’가 아니라 ‘이 글이 한 말’을 고르는 시험입니다.</p>
<h3>유형</h3><ul><li>중심: 글 전체가 밀고 가는 주장</li><li>세부: 숫자·고유명사·조건</li><li>추론: 지문이 허용하는 다음 문장</li><li>적용: 사례를 지문 기준에 넣기</li></ul>
<div class="study-tip"><strong>TIP:</strong> 과학 지문은 원인과 조건을 동그라미. 사회 지문은 분류 기준을 네모.</div>`,
  hard: `<h3>함정 셋</h3><p>① 부분 참 — 한 문단만 맞으면 전체를 대표하지 못합니다. ② 가치 첨가 — “바람직하다”처럼 지문이 평가하지 않은 말을 넣습니다. ③ 인과 뒤집기 — 결과가 원인으로 바뀝니다.</p>
<p>인문은 개념 정의 → 구분 → 한계. 사회는 분류와 전환(일상화, 제도화). 과학은 구조·조건·실험 결과의 대응입니다. 빈칸은 앞뒤 지시어와 접속 관계를 먼저 보고, 수식어가 긴 보기를 의심합니다.</p>
<div class="warning-box"><strong>함정:</strong> 선지에 ‘항상’, ‘오직’, ‘반드시’가 있으면 지문의 양보·예외 문장을 다시 찾으세요.</div>`,
  prompt: "독서 유형과 묻는 것을 짝지으세요.",
  pairs: [
    { term: "중심 내용", def: "글 전체가 밀고 가는 주장" },
    { term: "세부 정보", def: "숫자·조건·고유명사 일치" },
    { term: "추론", def: "지문이 허용하는 다음 진술" },
    { term: "적용", def: "사례를 지문 기준에 넣기" },
    { term: "부분 참", def: "한 문단만 맞아 전체를 대표 못 함" },
  ],
  questions: [
    { q: "독서 정답의 근거는?", choices: ["교과 지식", "지문이 말한 범위", "상식", "작가 연보"], answer: 1 },
    { q: "최다 오답 형태는?", choices: ["맞춤법", "가능성→필연으로 바꾼 문장", "짧은 보기", "숫자 없음"], answer: 1 },
    { q: "과학 지문에서 먼저 표시할 것은?", choices: ["운율", "원인과 조건", "화자", "각운"], answer: 1 },
    { q: "‘반드시’가 있는 선지를 보면?", choices: ["바로 정답", "예외·양보 문장을 다시 찾는다", "건너뛴다", "길어서 고른다"], answer: 1 },
    { q: "공통 독서 출제 소재가 아닌 것은?", choices: ["인문", "사회", "과학", "듣기 대본"], answer: 3 },
  ],
  caps: ["답이 지문 안에 있습니다.", "부분 참을 전체로 키우지 마세요.", "양보 문장이 함정을 가릅니다."],
});

chapter({
  file: "03-korean-lit.html",
  title: "국어 문학",
  sub: "Chapter 3 — 갈래·시점·보기",
  body: `<h2>문학이 묻는 것</h2>
<p>작품 지식을 외우는 시험이 아닙니다. <strong>갈래의 관습</strong>(시·소설·수필·극)과 <strong>이 작품이 지금 하는 말</strong>을 보기에 대응합니다. 현대시·고전시가·현대소설·고전산문이 묶음으로 나옵니다.</p>
<div class="info-card"><h4>먼저 볼 표지</h4><p>시: 화자의 태도, 이미지의 전환, 종결 어미. 소설: 시점, 서술자 개입, 인물 관계, 시간의 배열. 고전: 우의(다른 것을 빌려 말하기)와 교훈의 층.</p></div>`,
  easy: `<h3>한 줄</h3><p>문학은 ‘이 작품이 좋아하는 감정’을 고르는 게 아니라, 표현이 가리키는 태도를 고릅니다.</p>
<ul><li>화자가 달래면 체념·수용일 수 있고, 달래지 못하면 저항입니다.</li><li>1인칭은 아는 것이 좁고, 전지적은 속까지 봅니다.</li><li>보기의 ‘아름다운 자연 예찬’은 자연이 위로가 아니라 대비일 때 틀립니다.</li></ul>`,
  hard: `<h3>보기 언어</h3><p>수능 문학 선지는 ‘대상화’, ‘거리 두기’, ‘자기화’, ‘우의’처럼 짧은 개념어로 태도를 압축합니다. 지문의 비유가 대상을 낮추면 예찬이 아닙니다. 고전소설의 전기적 요소(초월·예언)를 리얼리즘 용어로 읽으면 어긋납니다.</p>
<p>복합 지문은 현대와 고전을 <strong>공유하는 주제 한 줄</strong>로 묶습니다. 공통점을 물을 때는 갈래 차이를 정답으로 내지 않습니다. 차이를 물을 때는 주제를 같다고 우기는 보기가 함정입니다.</p>`,
  prompt: "갈래와 먼저 볼 표지를 짝지으세요.",
  pairs: [
    { term: "시", def: "화자 태도 · 이미지 전환" },
    { term: "소설", def: "시점 · 인물 관계 · 시간 배열" },
    { term: "고전시가", def: "우의와 교훈의 층" },
    { term: "극", def: "대사·지문으로 드러난 갈등" },
    { term: "복합 지문", def: "공유 주제 한 줄로 묶기" },
  ],
  questions: [
    { q: "문학 정답의 기준은?", choices: ["작가 연보", "작품이 지금 하는 말", "유행 해석", "암기 작품 수"], answer: 1 },
    { q: "1인칭 시점의 특징은?", choices: ["모든 속마음", "아는 범위가 좁다", "카메라만", "운율"], answer: 1 },
    { q: "자연이 대비로 쓰이면?", choices: ["무조건 예찬", "예찬 보기를 의심", "무조건 풍자", "정답 없음"], answer: 1 },
    { q: "복합 지문에서 공통점을 물을 때 함정은?", choices: ["갈래 차이를 정답처럼 쓰기", "주제를 적기", "화자 찾기", "각운"], answer: 0 },
    { q: "고전소설의 초월·예언을 리얼리즘으로 읽으면?", choices: ["정석", "어긋난다", "필수", "1점"], answer: 1 },
  ],
  caps: ["갈래 관습을 먼저 봅니다.", "예찬 보기를 바로 믿지 마세요.", "복합은 공유 주제 한 줄입니다."],
});

chapter({
  file: "04-calc-diff.html",
  title: "미적분 — 극한·미분",
  sub: "Chapter 4 — 수열 극한부터 도함수",
  body: `<h2>미적분이 실제로 묻는 앞부분</h2>
<p>선택 미적분의 앞은 <strong>수열의 극한, 급수, 함수의 극한·연속, 미분법</strong>입니다. 공통 수학Ⅱ의 미분과 겹치되, 지수·로그·삼각의 합성, 음함수·매개변수, 도함수의 활용(접선, 증가감소, 최대최소)까지 깊이가 커집니다.</p>
<div class="formula">|r|&lt;1 ⇒ rⁿ→0 · (1+1/n)ⁿ→e · (sinθ)/θ→1 (θ→0, 라디안)</div>
<div class="info-card"><h4>기호를 먼저 고정</h4><p>수렴하면 극한은 유일합니다. 유계라고 수렴하지는 않습니다(진동). 미분가능하면 연속이지만 역은 거짓입니다(|x| at 0).</p></div>`,
  easy: `<h3>한 줄</h3><p>극한은 ‘가까워지는 값’, 미분은 ‘그 순간 기울기’입니다.</p>
<ul><li>등비수열 rⁿ은 |r|&lt;1일 때만 0으로 갑니다.</li><li>접선 기울기가 f'(a)입니다.</li><li>최고점·최저점은 f'=0이거나 끝점입니다. 기울기 0이 항상 극값은 아닙니다.</li></ul>`,
  hard: `<h3>합성·역함수</h3><p>(f∘g)' = f'(g)g'. 역함수 미분은 1/f'(x). 로그미분은 곱·지수가 얽힌 식에서 양변에 ln을 씌웁니다. 매개변수 x=x(t), y=y(t)이면 dy/dx = (dy/dt)/(dx/dt) (dx/dt≠0).</p>
<p>로피탈은 0/0, ∞/∞에서만. 한 번으로 안 끝나면 조건을 다시 확인합니다. 평균값 정리: 연속+미분가능 구간에서 f'(c)=평균변화율인 c가 존재합니다. 존재만 말하고 위치를 구하라는 문제는 롤의 정리로 근을 가릅니다.</p>
<div class="warning-box"><strong>함정:</strong> 삼각 극한을 도(degree)로 넣으면 계수가 π/180만큼 틀어집니다. 수능은 라디안입니다.</div>`,
  prompt: "미적분 앞부분 공식과 조건을 짝지으세요.",
  pairs: [
    { term: "rⁿ→0", def: "|r|&lt;1" },
    { term: "(sinθ)/θ→1", def: "θ→0, 라디안" },
    { term: "미분가능", def: "연속은 필요, 역은 거짓" },
    { term: "합성함수 미분", def: "바깥 미분 × 안 미분" },
    { term: "로피탈", def: "0/0 또는 ∞/∞" },
  ],
  questions: [
    { q: "|r|=1인 등비수열 rⁿ은?", choices: ["항상 0", "항상 1", "1 또는 진동·발산", "e"], answer: 2 },
    { q: "미분가능하면?", choices: ["불연속일 수 있다", "연속이다", "적분 불가능", "극대만 있다"], answer: 1 },
    { q: "삼각 극한의 기본 단위는?", choices: ["도", "라디안", "그레이드", "퍼센트"], answer: 1 },
    { q: "역함수 미분은?", choices: ["f'(x)", "1/f'(x)", "f(x)²", "ln f"], answer: 1 },
    { q: "f'=0이면 항상 극값인가?", choices: ["예", "아니오", "적분일 때만", "연속일 때만"], answer: 1 },
  ],
  caps: ["|r|&lt;1이어야 rⁿ이 죽습니다.", "기울기 0 ≠ 극값.", "각은 라디안입니다."],
});

chapter({
  file: "05-calc-int.html",
  title: "미적분 — 적분·활용",
  sub: "Chapter 5 — 부정적분부터 넓이·부피",
  body: `<h2>적분이 묻는 것</h2>
<p>미적분 선택 뒷부분은 <strong>부정적분, 치환·부분적분, 정적분, 넓이, 속도와 위치, 회전체 부피</strong>입니다. 미분의 역연산이라는 한 줄이 출발점이고, 정적분은 리만 합의 극한입니다.</p>
<div class="formula">∫f' = f+C · ∫ₐᵇ f = F(b)−F(a) · 부분적분 ∫u dv = uv−∫v du</div>`,
  easy: `<h3>한 줄</h3><p>적분은 조각을 더해 넓이(또는 변화의 누적)를 되돌리는 일입니다.</p>
<ul><li>속도 v를 적분하면 위치의 변화입니다.</li><li>곡선 사이 넓이는 위−아래를 적분합니다. 구간에서 누가 위인지 먼저 봅니다.</li><li>치환은 합성미분을 거꾸로, 부분적분은 곱의 미분을 거꾸로입니다.</li></ul>`,
  hard: `<h3>회전체</h3><p>x축 회전 원판법: π∫[R(x)]² dx. 껍질법: 2π∫ r h dx. 축이 y면 변수를 바꿉니다. 단면이 환이면 바깥제곱−안제곱입니다.</p>
<p>정적분으로 정의된 함수 F(x)=∫ₐˣ f 이면 F'=f (FTC). 위끝이 합성 g(x)이면 연쇄 f(g)g'. 이상적분처럼 무한대를 넣으라는 식은 교육과정 밖이지만, 급수와 정적분을 섞어 수렴을 묻는 문항은 미적 선택에 있습니다.</p>
<div class="warning-box"><strong>함정:</strong> 넓이에 부호를 남기면 아래쪽 넓이가 음수가 되어 합이 줄어듭니다. 넓이 문제는 절댓값 또는 구간 분할입니다.</div>`,
  prompt: "적분 도구와 쓰임을 짝지으세요.",
  pairs: [
    { term: "부정적분", def: "미분의 역 · +C" },
    { term: "정적분", def: "F(b)−F(a)" },
    { term: "치환적분", def: "합성미분의 역" },
    { term: "부분적분", def: "곱의 미분의 역" },
    { term: "회전체 원판", def: "π∫R² dx" },
  ],
  questions: [
    { q: "속도의 정적분은?", choices: ["가속도", "위치의 변화", "질량", "기울기"], answer: 1 },
    { q: "넓이 계산에서 아래쪽 그래프를 그대로 더하면?", choices: ["항상 맞다", "음수 구간이 넓이를 깎는다", "부피가 된다", "C가 생긴다"], answer: 1 },
    { q: "F(x)=∫ₐˣ f 이면 F'은?", choices: ["0", "f", "F", "1/f"], answer: 1 },
    { q: "위끝이 g(x)이면?", choices: ["f(g)만", "f(g)·g'", "g/f", "적분 불가"], answer: 1 },
    { q: "부분적분 공식은?", choices: ["uv+∫v du", "uv−∫v du", "u/v", "ln uv"], answer: 1 },
  ],
  caps: ["적분은 누적입니다.", "넓이는 부호를 버립니다.", "위끝이 합성이면 연쇄입니다."],
});

chapter({
  file: "06-english.html",
  title: "수능 영어",
  sub: "Chapter 6 — 듣기 17 · 독해 유형",
  body: `<h2>영어가 실제로 묻는 것</h2>
<p>45문항 70분, 절대평가입니다. 앞 <strong>17문항이 듣기</strong>이고 나머지는 독해입니다. 독해 유형은 주제·요지, 빈칸, 순서, 삽입, 장문(제목·내용 불일치·함의)이 뼈대입니다. 문법·어휘는 따로 보이지만 빈칸·장문 안에서 다시 나옵니다.</p>
<div class="info-card"><h4>1등급의 최소 조건</h4><p>듣기에서 16 이상을 고정하고, 빈칸·순서·삽입에서 두 개 이상 잃지 않는 것입니다. 원점수 90이 1등급 선입니다.</p></div>`,
  easy: `<h3>한 줄</h3><p>듣기는 ‘다음에 할 말’, 독해는 ‘글이 밀고 가는 한 줄’입니다.</p>
<ul><li>듣기: 숫자·장소·거절 이유를 미리 선지에 표시합니다.</li><li>주제: 반복되는 명사와 태도가 답입니다.</li><li>빈칸: 빈칸 앞 문장의 논리(그러나/그래서)를 먼저 봅니다.</li><li>순서·삽입: 지시어(this, such, these)와 접속 부사가 열쇠입니다.</li></ul>`,
  hard: `<h3>빈칸</h3><p>빈칸이 문장 끝에 있으면 결론, 중간에 있으면 전제입니다. 선지가 길면 공통 뼈대만 남기고 수식어를 접습니다. 지문이 양보(although)인데 선지가 전면 부정하면 틀립니다.</p>
<p>순서 문제는 첫 문장에 지시어가 있는 보기를 맨 앞에 두지 않습니다. 삽입은 앞 문장과 뒤 문장의 주어가 바뀌는 지점이 힌트입니다. 장문 함의(implied)는 글이 칭찬하는 대상을 반대로 읽는 보기가 함정입니다.</p>
<div class="warning-box"><strong>함정:</strong> 주제 문제에서 세부 사례를 주제로 올리면 오답입니다. 사례는 수단입니다.</div>`,
  prompt: "영어 유형과 공략을 짝지으세요.",
  pairs: [
    { term: "듣기", def: "숫자·장소·거절을 선지에 선표시" },
    { term: "주제", def: "반복 명사와 태도" },
    { term: "빈칸", def: "앞 문장 논리(그러나/그래서)" },
    { term: "순서", def: "지시어가 있는 문장은 뒤쪽" },
    { term: "삽입", def: "주어가 바뀌는 틈" },
  ],
  questions: [
    { q: "영어 듣기 문항 수는?", choices: ["10", "17", "22", "28"], answer: 1 },
    { q: "1등급 원점수는?", choices: ["80", "85", "90", "100"], answer: 2 },
    { q: "순서 문제에서 지시어가 있는 문장은?", choices: ["무조건 맨 앞", "앞에 지시 대상이 있어야 함", "정답 아님", "듣기다"], answer: 1 },
    { q: "주제 문제의 흔한 오답은?", choices: ["태도", "세부 사례를 주제로 올림", "반복 명사", "빈칸"], answer: 1 },
    { q: "영어 성적 표기는?", choices: ["표준점수만", "등급만", "백분위만", "원점수만"], answer: 1 },
  ],
  caps: ["듣기 17을 먼저 고정합니다.", "빈칸은 접속 논리입니다.", "90점이 1등급 선입니다."],
});

chapter({
  file: "07-phys1.html",
  title: "물리학 I",
  sub: "Chapter 7 — 역학부터 광전 효과",
  body: `<h2>물1 범위</h2>
<p>물리학 I은 역학(힘·운동·에너지·운동량), 열과 에너지, 전기와 자기, 파동, 빛과 물질(광전 효과 수준)입니다. 물Ⅱ의 케플러·전자기 유도 심화·상대론 형식은 빼되, <strong>그래프 읽기</strong>와 <strong>보존량</strong>은 매 시험에 나옵니다.</p>
<div class="formula">F=ma · p=mv · Δp=FΔt · K=½mv² · v=fλ · Kmax=hf−W</div>
<div class="info-card"><h4>그래프</h4><p>v–t 기울기가 가속도, 아래 넓이가 변위. 최고점에서 vy=0이어도 ay=g입니다. 정지 전하에는 자기력이 없습니다.</p></div>`,
  easy: `<h3>한 줄</h3><p>물1은 공식을 외우는 시험이 아니라, 어느 양이 남고 어느 양이 0이 되는지 가리는 시험입니다.</p>
<ul><li>등속 직선: 알짜힘 0</li><li>탄성 충돌: p와 K, 비탄성: p만</li><li>파동: 보강 mλ, 소멸 (m+½)λ</li><li>광전: 진동수가 문턱, 세기는 전자 수</li></ul>`,
  hard: `<h3>함정 문장</h3><p>최고점에서 가속도 0. 반작용이 같은 물체에서 상쇄. 완전 비탄성도 K 보존. 같은 부호 전하 사이에 중성점. 세기를 높이면 문턱 아래에서도 전자가 나온다. 이 다섯이 반복됩니다.</p>
<p>운동량 보존은 외력이 무시될 때입니다. 바닥에 붙은 계는 외력이 있습니다. 전기장 중성점은 벡터 합이 0인 점이고, 같은 부호면 두 전하 <strong>바깥</strong>에 있습니다. 평행 전류는 같은 방향이 끌어당깁니다.</p>`,
  prompt: "물리1 법칙과 식을 짝지으세요.",
  pairs: [
    { term: "2법칙", def: "F=ma" },
    { term: "충격량", def: "Δp=FΔt" },
    { term: "탄성 충돌", def: "p와 K 보존" },
    { term: "파동", def: "v=fλ" },
    { term: "광전 Kmax", def: "hf−W" },
  ],
  questions: [
    { q: "최고점에서 수직 가속도는?", choices: ["0", "g", "무한", "v"], answer: 1 },
    { q: "완전 비탄성 충돌에서 보존되는 것은?", choices: ["K만", "p만", "p와 K", "각운동량만"], answer: 1 },
    { q: "광전 효과에서 세기가 키우는 것은?", choices: ["Kmax", "문턱 진동수", "광전자 수", "일함수"], answer: 2 },
    { q: "정지한 전하에 자기력은?", choices: ["최대", "없다", "전기력과 같음", "항상 원궤도"], answer: 1 },
    { q: "같은 부호 두 전하의 중성점은?", choices: ["사이", "바깥", "전하 위", "무한대만"], answer: 1 },
  ],
  caps: ["속력 0 ≠ 가속도 0.", "비탄성은 K를 버립니다.", "세기는 전자 수입니다."],
});

chapter({
  file: "08-bio1.html",
  title: "생명과학 I",
  sub: "Chapter 8 — 세포·유전·항상성·생태",
  body: `<h2>생1 범위</h2>
<p>생명과학 I은 생명 현상의 특성, 세포와 물질대사, <strong>유전</strong>(멘델·가계도·염색체), 화신경과 항상성, 방어 작용, 생태계입니다. 생Ⅱ의 분자생물 실험·진화 심화·식물 생리는 범위 밖이지만, 효소·삼투·피드백은 매해 나옵니다.</p>
<div class="info-card"><h4>가계도</h4><p>열성은 건너뛰고, 우성은 매 세대에 나타날 수 있습니다. 성염색체는 남녀 비가 어긋납니다. 보인자(정상 표현형)를 환자로 읽으면 한 세대를 망칩니다.</p></div>`,
  easy: `<h3>한 줄</h3><p>생1은 ‘어디가 무엇을 하는가’와 ‘누가 누구에게 유전자를 넘기는가’입니다.</p>
<ul><li>효소: 활성 부위가 활성화 에너지를 낮춥니다. 온도·pH가 구조를 흔듭니다.</li><li>항상성: 음성 피드백이 기본(혈당·체온).</li><li>면역: 1차는 장벽, 2차는 식균, 3차는 림프구의 특이성.</li><li>생태계: 생산자→소비자, 에너지 10% 규칙의 감각.</li></ul>`,
  hard: `<h3>유전 문항</h3><p>가계도에서 열성 환자 부모는 둘 다 보인자일 수 있습니다. X열성은 아들에게 나타나고 어머니가 보인자인 그림이 전형입니다. 염색체 비분리는 제1분열이면 상동염색체, 제2분열이면 자매염색분체가 붙습니다. 핵형에서 n과 2n을 먼저 셉니다.</p>
<p>흥분의 전도는 분극→탈분극→재분극. 시냅스는 화학 전달이라 한 방향입니다. 혈당은 인슐린이 낮추고 글루카곤이 높입니다. 둘이 같은 방향으로 적힌 보기가 함정입니다.</p>
<div class="warning-box"><strong>함정:</strong> 효소가 반응열을 공급한다는 문장. 효소는 경로의 문턱을 낮출 뿐 에너지를 만들어 주지 않습니다.</div>`,
  prompt: "생1 개념과 한 줄을 짝지으세요.",
  pairs: [
    { term: "효소", def: "활성화 에너지를 낮춘다" },
    { term: "음성 피드백", def: "혈당·체온을 되돌린다" },
    { term: "X열성", def: "아들에게 나타나기 쉽다" },
    { term: "시냅스", def: "한 방향 화학 전달" },
    { term: "인슐린", def: "혈당을 낮춘다" },
  ],
  questions: [
    { q: "효소의 역할은?", choices: ["반응열 공급", "활성화 에너지 하강", "유전자 복제", "산소 운반"], answer: 1 },
    { q: "인슐린의 효과는?", choices: ["혈당 상승", "혈당 하강", "항상 일정", "면역 억제"], answer: 1 },
    { q: "시냅스 전달 방향은?", choices: ["양방향", "한 방향", "무작위", "빛만"], answer: 1 },
    { q: "열성 형질이 세대를 건너뛰면?", choices: ["불가능", "보인자가 있을 수 있다", "항상 우성", "성염색체만"], answer: 1 },
    { q: "생1 범위가 아닌 것은?", choices: ["가계도", "항상성", "식물 광인산화 심화", "방어 작용"], answer: 2 },
  ],
  caps: ["효소는 열을 주지 않습니다.", "인슐린은 혈당을 내립니다.", "가계도는 보인자를 먼저 봅니다."],
});

chapter({
  file: "09-strategy.html",
  title: "실전 시간·오답",
  sub: "Chapter 9 — 면 배치와 버리는 문항",
  body: `<h2>하루에 쓰는 체력</h2>
<p>이과 수능은 오전에 국어·수학, 오후에 영어·탐구입니다. 점수는 모르는 문항을 붙잡는 시간이 아니라 <strong>아는 문항을 놓치지 않는 시간</strong>에서 납니다. 각 영역마다 ‘버리는 번호’를 미리 정합니다.</p>
<div class="info-card"><h4>권장 골격</h4><p>국어: 독서 한 지문 16분, 문학 한 묶음 14분. 수학: 공통 앞 12문항 35분, 미적 킬러 2문항은 마지막. 영어: 듣기 후 빈칸 전에 주제·일치 먼저. 탐구: 자료 해석 4문항을 먼저, 계산 긴 문항은 표시 후 복귀.</p></div>`,
  easy: `<h3>한 줄</h3><p>못 푸는 한 문항보다, 쉬운 세 문항을 지키는 쪽이 등급을 올립니다.</p>
<ul><li>표시하고 넘어가는 습관을 모의에서 연습합니다.</li><li>오답 노트는 정답이 아니라 ‘내가 고른 함정 문장’을 적습니다.</li><li>탐구 두 과목 사이 쉬는 시간에 물1 공식 한 장만 봅니다.</li></ul>`,
  hard: `<h3>영역별 컷 감각</h3><p>영어는 90 고정이 목표라 모의에서 88~92 구간을 반복합니다. 수학 미적은 공통 실수가 표준점수를 더 깎습니다. 과탐은 20문항이라 두 개가 백분위 한 칸입니다. 시간 부족형 오답과 개념 혼동형 오답을 노트에서 갈라 적습니다.</p>
<p>시험 전주에는 새 유형을 넣지 않습니다. 이미 틀린 함정 문장만 다시 봅니다. 한국사는 평이하게 나오므로 핵심 연표만 유지합니다.</p>`,
  prompt: "영역과 시간 전략을 짝지으세요.",
  pairs: [
    { term: "국어", def: "독서 16분 · 문학 14분 감각" },
    { term: "수학", def: "공통 앞을 먼저, 킬러는 마지막" },
    { term: "영어", def: "듣기 고정 후 주제·일치" },
    { term: "탐구", def: "자료 해석 먼저, 긴 계산은 표시" },
    { term: "오답 노트", def: "함정 문장을 적는다" },
  ],
  questions: [
    { q: "등급을 올리는 쪽은?", choices: ["킬러 한 문항", "쉬운 문항을 안 놓침", "전 문항 평균 시간", "새로운 유형"], answer: 1 },
    { q: "수학에서 먼저 지킬 것은?", choices: ["미적 킬러", "공통 앞부분", "기하", "확률만"], answer: 1 },
    { q: "영어 1등급 선은?", choices: ["80", "90", "70", "100"], answer: 1 },
    { q: "오답 노트에 적을 것은?", choices: ["정답만", "함정 문장", "점수만", "시험장 주소"], answer: 1 },
    { q: "탐구 두 문항 실수는?", choices: ["무시", "백분위 한 칸이 될 수 있음", "국어만 영향", "영어 등급"], answer: 1 },
  ],
  caps: ["아는 문항을 먼저 지킵니다.", "킬러는 마지막에 둡니다.", "함정 문장을 노트에 남깁니다."],
});

for (const [rel, html] of Object.entries(files)) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log("wrote", rel);
}
console.log("done", Object.keys(files).length);
