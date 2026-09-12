import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

// mobile hub + writing + era
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/rw-mobile-hub.png" });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);

await page.goto("http://127.0.0.1:8080/play/writing", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const box = await page.locator("canvas").boundingBox();
// drag first chip upward toward first slot
if (box) {
  const sx = box.x + box.width * 0.18;
  const sy = box.y + box.height * 0.92;
  const tx = box.x + box.width * 0.42;
  const ty = box.y + box.height * 0.22;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(tx, ty, { steps: 12 });
  await page.mouse.up();
}
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/rw-mobile-writing.png" });

await page.goto("http://127.0.0.1:8080/play/era", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const box2 = await page.locator("canvas").boundingBox();
if (box2) {
  const sx = box2.x + box2.width * 0.2;
  const sy = box2.y + box2.height * 0.93;
  const tx = box2.x + box2.width * 0.5;
  const ty = box2.y + box2.height * 0.18;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(tx, ty, { steps: 14 });
  await page.mouse.up();
}
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/rw-mobile-era.png" });

await browser.close();
console.log(JSON.stringify({ overflow, errors }, null, 2));
