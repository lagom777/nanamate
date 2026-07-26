import test from "node:test";
import assert from "node:assert/strict";
import { createOfflineBatchPost, createOfflineTrendPost } from "./offline-writer.mjs";

test("매물 입력만으로 게시 가능한 장문 홍보글과 SNS 글을 만든다", () => {
  const post = createOfflineBatchPost({
    type: "listing",
    area: "서울 송파구 잠실동",
    name: "잠실엘스",
    deal: "매매",
    price: "23.5억",
    size: "전용 84㎡",
    transit: "잠실새내역 도보 5분",
    notes: "남향, 로열층",
    keyword: "잠실 84타입 매매",
  });
  assert.equal(post._engine, "offline");
  assert.ok(post.body_markdown.length > 1100);
  assert.match(post.body_markdown, /23\.5억/);
  assert.match(post.body_markdown, /매매를 찾는 분/);
  assert.doesNotMatch(post.body_markdown, /매매을/);
  assert.match(post.body_markdown, /잠실새내역 도보 5분/);
  assert.match(post.body_markdown, /등기부등본/);
  assert.equal(post.title_options.length, 3);
  assert.ok([...post.social.threads].length <= 420);
});

test("시세 글은 입력에 없는 가격을 만들지 않고 기준일 확인을 요구한다", () => {
  const post = createOfflineBatchPost({
    type: "price",
    area: "서울 강남구 대치동",
    name: "은마아파트",
    size: "전용 84㎡",
    keyword: "대치 은마 시세",
  });
  assert.ok(post.body_markdown.length > 900);
  assert.match(post.body_markdown, /입력에 없는 거래가나 상승률은 추정하지 않았습니다/);
  assert.doesNotMatch(post.body_markdown, /23\.5억/);
  assert.match(post.body_markdown, /국토교통부 실거래가 공개시스템/);
});

test("정책 글에는 시점 확인과 전문가 상담 경계를 넣는다", () => {
  const post = createOfflineBatchPost({ type: "policy", topic: "전세대출 제도 확인", keyword: "전세대출" });
  assert.match(post.body_markdown, /시행 시점의 공식 문서/);
  assert.match(post.body_markdown, /전문가와 상담/);
  assert.match(post.body_markdown, /투자 판단과 책임은 본인/);
  assert.ok(post.body_markdown.length > 1000);
});

test("트렌드 글은 수집된 기사와 출처만 사용해 완성 글을 만든다", () => {
  const brief = {
    generatedAt: "2026-07-16 09:00:00",
    realprice: ["송파구 실거래 12건 · 공개 자료 요약"],
    kr: [
      { title: "서울 아파트 거래 흐름 변화 - 한국경제", source: "한국경제", pubDate: "2026-07-15", desc: "지역별 거래량 차이가 나타났다는 보도", link: "https://example.com/a" },
      { title: "대출 기준 점검 필요 - 연합뉴스", source: "연합뉴스", pubDate: "2026-07-14", desc: "금융 여건을 확인해야 한다는 내용", link: "https://example.com/b" },
    ],
    global: [], reddit: [],
  };
  const post = createOfflineTrendPost(brief, {});
  assert.equal(post._engine, "offline");
  assert.ok(post.body_markdown.length > 1000);
  assert.match(post.body_markdown, /한국경제/);
  assert.match(post.body_markdown, /송파구 실거래 12건/);
  assert.equal(post.sources_used.length, 2);
  assert.ok([...post.social.threads].length <= 420);
});
