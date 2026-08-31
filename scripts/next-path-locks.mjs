import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const NEXT_START_RE = /(?:^|[\\/\s"'])next(?:\.cmd|\.exe)?["']?\s+start(?:\s|$)/i;
const STANDALONE_SERVER_RE = /standalone[/\\]server\.js/i;
const START_SCRIPT_RE = /scripts[/\\]start\.mjs/i;

/** Files Next copies into standalone output — EBUSY on Windows if another process has them open. */
export const BUILD_LOCK_RELATIVE_PATHS = [
  join(".next", "required-server-files.js"),
  join(".next", "standalone", ".next", "required-server-files.js"),
  join(".next", "standalone", "server.js"),
];

export function resolveRepoRoot(fromUrl = import.meta.url) {
  return resolve(dirname(fileURLToPath(fromUrl)), "..");
}

export function resolveBuildLockPaths(repoRoot) {
  return BUILD_LOCK_RELATIVE_PATHS.map((relative) => resolve(repoRoot, relative));
}

export function resolveStandaloneDir(repoRoot) {
  return resolve(repoRoot, ".next", "standalone");
}

export function shouldUnlockProcess(commandLine, repoRoot) {
  if (!commandLine || !repoRoot) return false;
  const command = commandLine.replaceAll("/", "\\").toLowerCase();
  const root = repoRoot.replaceAll("/", "\\").toLowerCase();
  if (!command.includes(root)) return false;
  if (/\sdev(?:\s|$)/i.test(commandLine) && !NEXT_START_RE.test(commandLine)) {
    return false;
  }
  return (
    NEXT_START_RE.test(commandLine) ||
    STANDALONE_SERVER_RE.test(commandLine) ||
    START_SCRIPT_RE.test(commandLine)
  );
}
