import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRepoRoot } from "./next-path-locks.mjs";

const root = resolveRepoRoot();
const preload = join(dirname(fileURLToPath(import.meta.url)), "retry-locked-copy.cjs").replaceAll(
  "\\",
  "/"
);
const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const nodeOptions = [process.env.NODE_OPTIONS, `--require ${preload}`].filter(Boolean).join(" ");

const child = spawn(process.execPath, [nextBin, "build", ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
