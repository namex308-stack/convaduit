import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { resolveRepoRoot, resolveStandaloneDir } from "./next-path-locks.mjs";

const root = resolveRepoRoot();
const standalone = resolveStandaloneDir(root);

if (!existsSync(standalone)) {
  console.log("Skipping standalone copy — .next/standalone not found.");
  process.exit(0);
}

const staticSrc = join(root, ".next", "static");
const staticDest = join(standalone, ".next", "static");
const publicSrc = join(root, "public");
const publicDest = join(standalone, "public");

async function copyWithRetry(src, dest) {
  let lastErr;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      cpSync(src, dest, { recursive: true, force: true });
      return;
    } catch (err) {
      lastErr = err;
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      if (!["EBUSY", "EPERM", "EACCES"].includes(code) || attempt === 8) {
        throw err;
      }
      await delay(150 * attempt);
    }
  }
  throw lastErr;
}

mkdirSync(join(standalone, ".next"), { recursive: true });

if (existsSync(staticSrc)) {
  await copyWithRetry(staticSrc, staticDest);
  console.log("Copied .next/static → standalone");
}

if (existsSync(publicSrc)) {
  await copyWithRetry(publicSrc, publicDest);
  console.log("Copied public → standalone");
}
