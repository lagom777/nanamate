import test from "node:test";
import assert from "node:assert/strict";
import { scrub, leftoverConnectives, countChars, THREADS_MAX } from "./style.mjs";

test("접속부사와 상투어를 뺀다", () => {
  const raw = "그러나 오픈AI가 냈다. 따라서 주목할 점은 부모 통제다. 또한 매출이 늘었다.";
  const out = scrub(raw);
  assert.equal(leftoverConnectives(out).length, 0);
  assert.doesNotMatch(out, /주목할/);
  assert.match(out, /오픈AI가 냈다/);
});

test("500자를 넘기지 않는다", () => {
  const out = scrub("가".repeat(600));
  assert.ok(countChars(out) <= THREADS_MAX);
});
