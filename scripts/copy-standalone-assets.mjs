import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

// Cross-platform replacement for:
//   cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
// `cp` doesn't exist on Windows, which broke `npm run build` there.
// Next's standalone output needs these two copies to serve static assets.
const root = process.cwd();
const standaloneNext = join(root, ".next", "standalone", ".next");

if (!existsSync(join(root, ".next", "standalone", "server.js"))) {
  console.error("standalone server.js not found — did `next build` succeed?");
  process.exit(1);
}

cpSync(join(root, ".next", "static"), join(standaloneNext, "static"), {
  recursive: true,
});
cpSync(join(root, "public"), join(root, ".next", "standalone", "public"), {
  recursive: true,
});
console.log("standalone assets copied.");
