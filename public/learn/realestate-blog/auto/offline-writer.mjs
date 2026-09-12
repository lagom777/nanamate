// API 키 없이도 매물·주제·수집 자료만으로 게시 가능한 초안을 만드는 로컬 작성 엔진.
// 입력에 없는 가격·통계·정책 수치를 만들지 않는 것을 최우선으로 한다.

const TYPE_NAMES = {
  listing: "매물 소개",
  price: "시세 분석",
  location: "입지 소개",
  subscription: "청약 정보",
  policy: "정책·세금·대출",
  interior: "인테리어",
  invest: "투자 점검",
  process: "거래 절차",
  custom: "부동산 정보",
};

const clean = (value, fallback = "") => String(value || "").replace(/\s+/g, " ").trim() || fallback;
const uniq = (items) => [...new Set(items.map((item) => clean(item)).filter(Boolean))];
const clip = (text, max) => [...clean(text)].slice(0, max).join("");
function objectParticle(word) {
  const last = [...clean(word)].at(-1);
  if (!last) return "을";
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "을";
  return (code - 0xac00) % 28 === 0 ? "를" : "을";
}

function infoTable(row) {
  const entries = [
    ["지역", row.area],
    ["단지·건물", row.name],
    ["거래 유형", row.deal],
    ["가격", row.price],
    ["면적", row.size],
    ["구조·층·향", row.struct],
    ["교통", row.transit],
    ["학군·생활 편의", row.life],
    ["자료 기준", row.data],
  ].filter(([, value]) => clean(value));
  if (!entries.length) return "";
  return `| 항목 | 입력 정보 |\n|---|---|\n${entries.map(([key, value]) => `| ${key} | ${clean(value)} |`).join("\n")}`;
}

function listingBody(row, subject, keyword) {
  const dealLine = [row.deal, row.price, row.size].map((v) => clean(v)).filter(Boolean).join(" · ");
  const strengths = uniq([row.struct, row.transit, row.life, row.notes]);
  return `## ${subject}, 조건부터 차분히 보겠습니다

${keyword}${objectParticle(keyword)} 찾는 분이라면 사진의 첫인상보다 먼저 거래 조건과 생활 동선을 함께 확인하는 편이 좋습니다. 이 글은 제공된 매물 정보만으로 핵심을 정리했습니다. 실제 상태와 계약 가능 여부는 방문 전에 다시 확인해 주세요.

${infoTable(row)}

## 이 매물에서 눈여겨볼 부분

${strengths.length ? strengths.map((item) => `- **확인된 특징**: ${item}`).join("\n") : "현재 입력된 특징이 많지 않습니다. 내부 상태, 수리 이력, 일조와 소음, 주차 여건을 현장에서 확인하면 판단이 훨씬 선명해집니다."}

${dealLine ? `현재 입력된 조건은 **${dealLine}**입니다. 이 숫자만으로 저렴하거나 비싸다고 단정하기보다 같은 단지의 최근 실거래, 현재 경쟁 매물, 내부 수리 상태를 같은 기준일로 나란히 비교해야 합니다.` : "가격과 거래 조건은 최신 매물표와 등기·실거래 자료를 기준으로 확인해야 합니다. 조건이 바뀌었을 수 있으므로 방문 예약 때 한 번 더 문의해 주세요."}

## 현장 방문에서는 이것을 보세요

1. 거실과 방의 실제 채광, 맞통풍 여부를 시간대에 맞춰 확인합니다.
2. 창을 열고 닫아 외부 소음과 냄새, 결로 흔적을 살펴봅니다.
3. 수납 동선과 가구 배치 가능 폭을 직접 재봅니다.
4. 관리비 포함 항목, 주차 방식, 장기수선 계획을 관리사무소 자료와 대조합니다.
5. 계약 전에는 등기부등본과 권리관계, 중개대상물 확인설명서를 반드시 확인합니다.

사진을 볼 때는 넓어 보이는 각도보다 창의 위치, 문이 열리는 방향, 고정 가구와 콘센트 위치를 눈여겨보세요. 방문할 때는 사진과 현재 상태가 같은지도 확인해야 합니다. 도배·바닥·주방처럼 수리 여부가 가격에 영향을 주는 항목은 ‘수리됨’이라는 표현만 믿지 말고 시공 시점과 범위를 물어보는 편이 좋습니다.

비교 매물은 세 개 정도만 같은 표에 적어도 판단이 쉬워집니다. 가격, 전용면적, 층·향, 내부 상태, 입주 가능일과 관리비를 한 줄씩 정리하면 이 매물의 장점이 가격에 이미 반영됐는지 살펴볼 수 있습니다.

## 이런 분이라면 직접 볼 가치가 있습니다

${row.audience ? `${clean(row.audience)}에게 우선 검토할 만한 조건입니다.` : "온라인 정보만으로 결론 내리기보다 출퇴근 동선과 평소 생활 반경이 맞는지 직접 확인하려는 분에게 적합합니다."} ${row.transit ? `교통 조건은 **${clean(row.transit)}**로 입력돼 있으니 실제 이동 시간도 같은 시간대에 확인해 보세요.` : "지도상의 거리와 실제 이동 시간은 다를 수 있으니 출퇴근 시간대에 한 번 걸어보는 것이 좋습니다."}

## 방문·문의 안내

${row.contact ? `자세한 조건과 방문 일정은 **${clean(row.contact)}**로 문의해 주세요.` : "관심이 있다면 최신 가격과 방문 가능 시간을 먼저 확인한 뒤 현장에서 장점과 주의점을 함께 비교해 보세요."} 매물 광고는 현장 상태와 권리관계 확인을 대신할 수 없습니다.`;
}

function priceBody(row, subject, keyword) {
  return `## ${subject} 시세, 숫자 하나보다 기준을 맞춰야 합니다

${keyword}을 확인할 때 가장 흔한 실수는 서로 다른 시점과 조건의 가격을 한 줄에 놓고 비교하는 것입니다. 같은 면적이라도 층·향·수리 상태·입주 가능 시점이 다르면 체감 가격이 달라집니다.

${infoTable(row)}

## 현재 입력 자료에서 읽을 수 있는 범위

${row.notes ? clean(row.notes) : "이번 글에는 별도의 실거래 표가 입력되지 않았습니다."} ${row.data ? `자료 기준은 **${clean(row.data)}**입니다.` : "게시 전 국토교통부 실거래가 공개시스템과 현재 중개 매물을 같은 기준일로 확인해야 합니다."} 입력에 없는 거래가나 상승률은 추정하지 않았습니다.

## 비교할 때 꼭 맞춰야 할 네 가지

1. **계약일**: 신고일이 아니라 실제 계약 시점을 기준으로 흐름을 봅니다.
2. **동일 면적**: 공급면적과 전용면적을 섞지 않고 같은 전용면적끼리 비교합니다.
3. **개별 조건**: 층·향·동 위치·수리 여부·입주 조건을 함께 기록합니다.
4. **호가와 실거래 분리**: 현재 매도자의 희망 가격과 실제 체결 가격은 따로 봅니다.

## 매수자와 매도자의 확인 순서

매수자는 최근 거래 몇 건의 범위와 현재 남은 매물의 조건을 함께 보고, 대출 가능액과 보유 현금을 먼저 계산하는 편이 안전합니다. 매도자는 같은 단지 경쟁 매물보다 내 집의 차이가 무엇인지 정리해야 가격 협상에서 흔들리지 않습니다.

자료를 정리할 때는 계약일, 전용면적, 층, 거래금액, 특이 조건을 한 표에 기록해 보세요. 거래 건수가 적은 달은 한 건의 고가·저가 거래가 전체 분위기처럼 보일 수 있으므로 기간을 넓혀 보는 것이 좋습니다. 반대로 오래된 거래만 보면 현재 매도자와 매수자의 간격을 놓칠 수 있어 현재 호가도 별도 열에 적어야 합니다.

협상 전에는 ‘희망 가격’과 ‘넘지 않을 가격’을 구분해 두세요. 취득세와 중개보수, 이사·수리비처럼 거래금액 밖에서 필요한 비용까지 더한 총예산을 기준으로 보면 순간적인 분위기에 끌려가는 일을 줄일 수 있습니다.

${row.price ? `입력된 가격은 **${clean(row.price)}**입니다. 이 조건이 적절한지는 같은 면적·비슷한 층과 상태의 최신 자료를 대조한 뒤 판단해야 합니다.` : "구체 가격은 최신 자료 확인 후 본문에 보완해 주세요."} 시장 전망은 가능성일 뿐 보장이 아니며 투자 판단과 책임은 본인에게 있습니다.`;
}

function locationBody(row, subject, keyword) {
  return `## ${subject}, 생활 동선으로 보는 입지

${keyword}의 입지는 역과의 직선거리 하나로 평가하기 어렵습니다. 출퇴근, 등하교, 장보기, 병원과 공원처럼 매일 반복되는 이동을 실제 시간대에 확인해야 생활 만족도를 가늠할 수 있습니다.

${infoTable(row)}

## 교통과 이동

${row.transit ? `입력된 교통 정보는 **${clean(row.transit)}**입니다. 지도상 거리뿐 아니라 환승 대기, 언덕, 횡단보도와 출퇴근 혼잡까지 직접 확인해 보세요.` : "교통 정보는 아직 입력되지 않았습니다. 평일 아침과 저녁에 목적지까지 실제 이동 시간을 확인하는 것을 권합니다."}

## 학군과 생활 편의

${row.life ? `학군·생활 편의 정보는 **${clean(row.life)}**입니다.` : "학교 배정, 학원가, 장보기와 의료시설 정보는 최신 지자체·교육청 자료로 보완해야 합니다."} 가족 구성에 따라 중요한 시설이 다르므로 ‘시설이 많다’보다 집에서 자주 가는 곳까지의 동선을 기준으로 보는 편이 현실적입니다.

## 낮과 밤을 모두 확인하세요

낮에는 채광·상권·보행 환경을, 밤에는 귀가 동선·조도·소음을 확인해 보세요. 주말에는 주차와 상권 혼잡이 달라질 수 있습니다. 개발 계획이나 교통 호재는 발표와 착공, 개통이 서로 다른 단계이므로 공식 일정과 사업 진행 상태를 구분해야 합니다.

## 정리

${row.notes ? `추가로 눈여겨볼 내용은 **${clean(row.notes)}**입니다. ` : ""}${subject}의 가치는 결국 내 생활 반경과 맞는지에 달려 있습니다. 한 번의 방문보다 평일과 주말, 낮과 밤을 나눠 확인하면 판단 오류를 줄일 수 있습니다.`;
}

function guideBody(row, subject, keyword, type) {
  const isSensitive = ["policy", "subscription", "invest", "process"].includes(type);
  const focus = row.notes || row.topic || `${subject}에서 실제로 확인해야 할 항목`;
  const typeGuide = {
    subscription: ["입주자모집공고 원문과 공고일을 확인합니다.", "지역·세대·주택 보유 요건을 본인 상황에 맞춰 대조합니다.", "계약금부터 잔금까지 필요한 현금 흐름을 계산합니다."],
    policy: ["제도의 시행일과 적용 대상을 먼저 확인합니다.", "내 주택 수·지역·거래 형태가 예외에 해당하는지 살펴봅니다.", "세금과 대출은 공식 계산과 전문가 확인을 거칩니다."],
    invest: ["실거래와 호가를 분리해 기록합니다.", "보유 비용과 공실·수리 가능성을 함께 계산합니다.", "낙관·기준·비관 세 가지 경우로 자금 계획을 점검합니다."],
    process: ["계약 상대방과 권리관계를 서류로 확인합니다.", "계약 특약과 지급 일정을 문장으로 명확히 남깁니다.", "신고·등기·전입 등 후속 절차의 기한을 달력에 기록합니다."],
    interior: ["현재 구조와 수리가 필요한 범위를 분리합니다.", "견적서의 자재·수량·부가세·폐기 비용을 확인합니다.", "공사 후 하자 확인과 보수 기한을 계약서에 남깁니다."],
    custom: ["주장의 기준일과 원문 출처를 확인합니다.", "내 상황에 적용되는 조건과 예외를 구분합니다.", "계약이나 비용이 생기기 전 전문가에게 최종 확인합니다."],
  };
  const checks = typeGuide[type] || typeGuide.custom;
  return `## ${subject}, 핵심부터 정리합니다

${keyword}을 검색하는 분들이 가장 먼저 확인할 내용은 **${clean(focus)}**입니다. 부동산 정보는 같은 표현이라도 적용 시점과 개인 조건에 따라 결과가 달라질 수 있어, 결론보다 확인 순서를 갖는 것이 중요합니다.

${infoTable(row)}

## 먼저 구분할 것

공식 자료에 적힌 사실, 중개 현장의 설명, 개인의 전망을 한 문단에 섞지 마세요. 금액이나 비율을 쓸 때는 기준일과 출처를 함께 적고, 입력에 없는 숫자는 추정하지 않는 것이 안전합니다.

## 실행 체크리스트

${checks.map((item, index) => `${index + 1}. ${item}`).join("\n")}
4. 확인한 날짜와 담당 기관·전문가의 답변을 메모합니다.
5. 중요한 결정 전에는 최신 원문을 다시 열어 변경 여부를 확인합니다.

## 실제 판단에 적용하는 방법

‘가능하다’는 설명만 보지 말고 필요한 현금, 처리 기한, 실패했을 때의 비용을 함께 적어 보세요. 온라인 글은 방향을 잡는 데 유용하지만 개인별 권리관계와 세금·대출 한도를 대신 판단해 주지는 못합니다.

## 정보를 기록하는 가장 간단한 방법

확인 항목마다 ‘확인한 날짜·출처·내 상황에 적용되는지·추가 질문’을 한 줄로 적어 보세요. 검색 결과의 짧은 요약만 저장하기보다 공식 페이지 주소와 담당 기관의 답변을 함께 남겨야 나중에 기준이 바뀌었을 때 비교할 수 있습니다. 비용이 들어가는 항목은 예상액과 실제 견적을 분리하고, 기한이 있는 절차는 계약일을 기준으로 달력에 표시하는 편이 안전합니다.

## 게시 전에 독자 관점으로 다시 보기

이 글만 읽고 바로 계약하거나 송금해도 된다는 인상을 주지 않는지 확인해야 합니다. 장점만 나열했다면 적용되지 않는 경우와 주의점을 덧붙이고, 특정 기관이나 상품을 언급했다면 현재도 운영되는지 공식 채널에서 확인하세요. 사진을 넣을 때는 주소·차량번호·계약서처럼 개인정보가 드러나지 않도록 점검하는 것도 중요합니다.

## 한 번 더 확인해야 하는 이유

${row.data ? `이 글에 입력된 자료 기준은 **${clean(row.data)}**입니다.` : "현재 자료 기준일이 입력되지 않았으므로 게시 전에 공식 원문의 시행일과 최신 개정 여부를 보완해야 합니다."} ${row.notes ? `입력된 참고 사항은 **${clean(row.notes)}**입니다.` : "세부 요건은 사람마다 달라질 수 있습니다."}

${isSensitive ? "정책·세제·청약·대출 기준은 시점에 따라 바뀔 수 있습니다. 시행 시점의 공식 문서를 확인하고 세무사·공인중개사·금융기관 등 해당 분야 전문가와 상담하세요. 투자 판단과 책임은 본인에게 있습니다." : "게시 전 현장 조건과 최신 자료를 다시 확인해 주세요."}`;
}

export function createOfflineBatchPost(input = {}) {
  const row = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, clean(value)]));
  const type = TYPE_NAMES[row.type] ? row.type : (row.topic ? "custom" : "listing");
  const subject = clean(row.topic, [row.area, row.name].filter(Boolean).join(" ") || "부동산 정보");
  const keyword = clean(row.keyword, [row.area, row.name, TYPE_NAMES[type]].filter(Boolean).join(" "));
  const body = type === "listing"
    ? listingBody(row, subject, keyword)
    : type === "price"
      ? priceBody(row, subject, keyword)
      : type === "location"
        ? locationBody(row, subject, keyword)
        : guideBody(row, subject, keyword, type);
  const titleBase = type === "listing" ? `${keyword}, 조건과 현장 체크포인트` : `${keyword}, 핵심과 확인 순서`;
  const titleOptions = uniq([
    clip(titleBase, 45),
    clip(`${subject} 알아보기, 놓치기 쉬운 체크포인트`, 45),
    clip(`${keyword} 판단 전에 확인할 ${type === "listing" ? "5가지" : "핵심 정리"}`, 45),
  ]);
  const hashtags = uniq([row.area, row.name, row.deal, row.keyword, TYPE_NAMES[type], "부동산정보", "부동산체크리스트"]);
  const socialText = clip(`${titleOptions[0]}\n\n입력된 정보만 바탕으로 장점과 현장 확인 항목을 정리했습니다. 가격·권리관계·정책 기준은 게시 시점에 다시 확인해 주세요.`, 410);
  return {
    title_options: titleOptions,
    body_markdown: body,
    body_naver: "",
    info_table: [],
    social: { threads: socialText, x: clip(`${titleOptions[0]} — 핵심 조건과 확인 순서를 정리했습니다.`, 220) },
    social_hashtags: hashtags.slice(0, 4),
    hashtags: hashtags.slice(0, 12),
    meta_description: clip(`${subject}에 관해 입력된 조건, 장점과 현장·계약 전 확인할 내용을 정리했습니다.`, 150),
    review_notes: [
      "가격·면적·거래 가능 여부가 현재도 유효한지 확인하세요.",
      "실거래가와 정책·세제 정보에는 기준일과 출처를 추가하세요.",
      "현장 사진과 직접 확인한 내용을 더한 뒤 게시하세요.",
    ],
    _engine: "offline",
  };
}

function sourceLine(item) {
  const meta = [clean(item.source), clean(item.pubDate).slice(0, 16)].filter(Boolean).join(" · ");
  return `- **${clean(item.title, "제목 없음")}**${item.desc ? ` — ${clean(item.desc)}` : ""}${meta ? ` (${meta})` : ""}`;
}

export function createOfflineTrendPost(brief = {}, config = {}) {
  const kr = (brief.kr || []).slice(0, 5);
  const global = (brief.global || []).slice(0, 3);
  const realprice = (brief.realprice || []).slice(0, 3);
  const reddit = (brief.reddit || []).slice(0, 1);
  const lead = kr[0] || global[0] || { title: "이번 주 부동산 흐름" };
  const topic = clean(lead.title).replace(/\s*[-–]\s*[^-–]+$/, "") || "이번 주 부동산 흐름";
  const date = clean(brief.generatedAt).slice(0, 10) || new Date().toISOString().slice(0, 10);
  const body = `## ${date}, 먼저 눈에 들어온 흐름

이번 글은 자동 수집된 기사 제목과 설명, 공개 실거래가 요약만 바탕으로 정리했습니다. 숫자와 전망을 새로 만들어 넣지 않고, 서로 다른 자료가 어떤 질문을 던지는지에 초점을 맞췄습니다.

${kr.length ? `## 국내 보도에서 확인된 내용\n\n${kr.map(sourceLine).join("\n")}` : "## 국내 자료 수집 상태\n\n이번 실행에서는 국내 기사 자료가 충분히 모이지 않았습니다. 해외 흐름을 국내 시장에 그대로 적용하지 말고 국내 공식 통계를 별도로 확인해야 합니다."}

${realprice.length ? `## 공개 실거래가 요약\n\n${realprice.map((item) => `- ${clean(item)}`).join("\n")}\n\n위 수치는 공개 자료 요약이므로 계약일·면적·층 등 개별 조건을 원문에서 다시 확인해야 합니다.` : "## 실거래가는 따로 확인하세요\n\n이번 실행에는 국토부 실거래가 연동 자료가 포함되지 않았습니다. 가격 흐름을 언급하려면 지역·면적·계약일을 맞춘 공식 원문을 먼저 확인하세요."}

${global.length ? `## 해외에서는 무엇을 이야기하나\n\n${global.map(sourceLine).join("\n")}\n\n해외 보도는 비교 관점으로만 참고해야 합니다. 금리 구조와 대출 제도, 공급 환경이 달라 한국 시장의 결론으로 바로 옮길 수 없습니다.` : ""}

${reddit.length ? `## 커뮤니티 분위기는 참고만\n\n해외 커뮤니티에는 **${clean(reddit[0].title)}**라는 주제가 올라왔습니다. 이는 검증된 통계가 아닌 개인 경험과 관심의 신호이므로 사실 근거나 시장 전망으로 사용하지 않았습니다.` : ""}

## 독자가 확인할 순서

1. 관심 지역의 같은 전용면적 실거래를 계약일 기준으로 확인합니다.
2. 기사에 나온 정책과 통계는 해당 기관의 원문과 발표일을 대조합니다.
3. 호가·실거래·전망을 구분해 메모하고 자금 계획을 다시 계산합니다.
4. 매수·매도 결정을 서두르기보다 내 소득과 보유 기간에 맞는지 점검합니다.

## 여러 자료를 같이 읽는 방법

기사 수가 많다고 거래가 반드시 같은 방향으로 움직이는 것은 아닙니다. 정책 발표 기사는 ‘무엇이 바뀌는지’를 확인하는 자료이고, 실거래 자료는 ‘이미 어떤 계약이 체결됐는지’를 보여 주는 자료입니다. 현재 매물의 호가는 매도자의 기대를 담고 있어 세 자료의 역할이 서로 다릅니다.

따라서 먼저 공식 발표의 적용 대상과 시행일을 확인하고, 그다음 관심 지역의 동일 면적 실거래를 살핀 뒤, 마지막에 현재 호가와 비교하는 순서가 좋습니다. 기사 설명에 없는 원인이나 상승률을 임의로 덧붙이지 말고, 확인하지 못한 내용은 확인 과제로 남기는 편이 글의 신뢰를 지킵니다.

게시 전에는 본문에 인용한 매체명과 날짜가 원문과 일치하는지, 오래된 기사가 최신 정책처럼 읽히지 않는지 점검해야 합니다. 지역명이 같은 다른 단지나 면적의 수치가 섞이지 않았는지도 확인하세요.

## 이번 주 정리

헤드라인 하나만으로 시장 전체를 단정하기보다, 같은 방향의 보도가 반복되는지와 실제 거래 자료가 뒤따르는지를 함께 보는 편이 안전합니다. 정책·세제·대출 기준은 시점에 따라 바뀔 수 있으므로 시행 시점의 공식 문서와 전문가 설명을 확인하세요. 투자 판단과 책임은 본인에게 있습니다.`;
  const sources = [...kr, ...global].slice(0, 7).map((item) => ({
    title: clean(item.title), source: clean(item.source), url: clean(item.link || item.url),
  }));
  const titles = uniq([
    clip(`${topic}, 이번 주 부동산 흐름과 확인할 것`, 45),
    clip(`${date} 부동산 뉴스, 헤드라인보다 중요한 체크포인트`, 45),
    clip(`이번 주 부동산 동향, 실수요자가 볼 자료 순서`, 45),
  ]);
  const tags = uniq(["부동산뉴스", "부동산동향", "실거래가", "부동산정책", "내집마련", "부동산체크"]);
  return {
    topic,
    title_options: titles,
    body_markdown: body,
    body_naver: "",
    social: {
      threads: clip(`${date} 부동산 보도를 모아 기사에 실제로 적힌 내용만 정리했습니다. 헤드라인보다 먼저 실거래·기준일·정책 원문을 확인해 보세요.`, 410),
      x: clip(`${date} 부동산 동향 정리. 실거래·기준일·정책 원문을 함께 확인하세요.`, 220),
    },
    social_hashtags: tags.slice(0, 4),
    hashtags: tags,
    meta_description: clip(`${date} 부동산 기사와 공개 자료를 바탕으로 시장 흐름과 실수요자 확인 순서를 정리했습니다.`, 150),
    review_notes: [
      "인용한 기사 제목·매체·발행 시점을 원문에서 확인하세요.",
      "가격이나 정책을 덧붙일 경우 공식 출처와 기준일을 표시하세요.",
      "지역별 시장 차이를 확인한 뒤 게시하세요.",
    ],
    sources_used: sources,
    _engine: "offline",
    _lengthHint: config.lengthHint || "",
  };
}
