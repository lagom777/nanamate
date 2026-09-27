import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "public", "learn");
const dest = join(process.cwd(), "dist");
if (!existsSync(src)) {
  throw new Error(`missing ${src}`);
}
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`exported ${src} -> ${dest}`);
