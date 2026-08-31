import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { resolveRepoRoot } from "./next-path-locks.mjs";

/**
 * Local production server. `next start` cannot serve `output: "standalone"`
 * builds; Vercel builds omit standalone and should use `next start`.
 */
const root = resolveRepoRoot();
process.env.PORT ||= "3000";

const standalone = join(root, ".next", "standalone", "server.js");
const child = existsSync(standalone)
  ? spawn(process.execPath, [standalone], {
      stdio: "inherit",
      env: process.env,
      cwd: root,
    })
  : spawn("npx", ["next", "start", "-p", process.env.PORT], {
      stdio: "inherit",
      env: process.env,
      shell: true,
      cwd: root,
    });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
