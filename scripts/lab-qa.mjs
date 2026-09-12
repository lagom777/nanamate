import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

async function shot(page, name) {
  await page.screenshot({ path: `/workspace/screenshots/${name}.png` });
}

async function visit(page, path, name) {
  const cons = [];
  const pages = [];
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.on("console", (m) => { if (m.type() === "error") cons.push(m.text()); });
  page.on("pageerror", (e) => pages.push(String(e?.message || e)));
  const r = await page.goto("http://127.0.0.1:8080" + path, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(600);
  await shot(page, name);
  const body = (await page.locator("body").innerText().catch(() => "")).trim();
  return { path, status: r?.status(), cons, pages, bodyLen: body.length };
}

const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const reports = [];
reports.push(await visit(desktop, "/", "qa-hub"));
reports.push(await visit(desktop, "/play/era", "qa-era"));
reports.push(await visit(desktop, "/play/chinese", "qa-chinese"));
reports.push(await visit(desktop, "/play/chem", "qa-chem"));
reports.push(await visit(desktop, "/login", "qa-login"));

{
  await desktop.goto("http://127.0.0.1:8080/play/cannon", { waitUntil: "networkidle" });
  await desktop.waitForTimeout(400);
  const box = await desktop.locator("canvas").boundingBox();
  if (box) {
    await desktop.mouse.move(box.x + box.width * 0.12, box.y + box.height * 0.82);
    await desktop.mouse.down();
    await desktop.mouse.move(box.x + box.width * 0.05, box.y + box.height * 0.92, { steps: 8 });
    await desktop.mouse.up();
    await desktop.waitForTimeout(700);
  }
  await shot(desktop, "qa-cannon-shot");
}

{
  await desktop.goto("http://127.0.0.1:8080/play/psy", { waitUntil: "networkidle" });
  await desktop.waitForTimeout(400);
  const box = await desktop.locator("canvas").boundingBox();
  if (box) {
    await desktop.mouse.click(box.x + box.width * 0.28, box.y + box.height * 0.58);
    await desktop.waitForTimeout(300);
  }
  await shot(desktop, "qa-psy-click");
}

{
  await desktop.goto("http://127.0.0.1:8080/play/era", { waitUntil: "networkidle" });
  await desktop.waitForTimeout(400);
  const rails = desktop.locator("button").filter({ hasText: "초기 중세" });
  if (await rails.count()) await rails.first().click();
  await desktop.waitForTimeout(300);
  await shot(desktop, "qa-era-click");
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
reports.push(await visit(mobile, "/", "qa-hub-mobile"));
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
reports.push(await visit(mobile, "/play/cannon", "qa-cannon-mobile"));
reports.push(await visit(mobile, "/play/era", "qa-era-mobile"));
reports.push(await visit(mobile, "/play/ideology", "qa-ideology"));
reports.push(await visit(mobile, "/play/iching", "qa-iching"));
reports.push(await visit(mobile, "/play/ai", "qa-ai"));

console.log(JSON.stringify({ reports, overflow }, null, 2));
await browser.close();
