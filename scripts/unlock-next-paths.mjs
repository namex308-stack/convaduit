import { existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import {
  resolveBuildLockPaths,
  resolveRepoRoot,
  resolveStandaloneDir,
  shouldUnlockProcess,
} from "./next-path-locks.mjs";

const repoRoot = resolveRepoRoot();
const lockPaths = resolveBuildLockPaths(repoRoot);

function parseProcessRows(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed) return [];
  const parsed = JSON.parse(trimmed);
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  return rows
    .map((row) => ({
      pid: Number(row.ProcessId ?? row.pid),
      ppid: Number(row.ParentProcessId ?? row.ppid),
      commandLine: String(row.CommandLine ?? row.args ?? ""),
    }))
    .filter((row) => Number.isInteger(row.pid) && row.pid > 0);
}

function listCandidateProcesses() {
  if (process.platform === "win32") {
    const result = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        "Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^(node|cmd)\\.exe$' } | Select-Object ProcessId, ParentProcessId, CommandLine | ConvertTo-Json -Compress",
      ],
      { encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024 }
    );
    if (result.status !== 0) {
      console.warn("Could not list processes:", result.stderr?.trim() || result.status);
      return [];
    }
    try {
      return parseProcessRows(result.stdout || "[]");
    } catch (err) {
      console.warn("Could not parse process list:", err);
      return [];
    }
  }

  const result = spawnSync("ps", ["-ax", "-o", "pid=,ppid=,args="], {
    encoding: "utf8",
  });
  if (result.status !== 0) return [];
  return (result.stdout || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const match = line.match(/^(\d+)\s+(\d+)\s+(.*)$/);
      if (!match) return [];
      return [{ pid: Number(match[1]), ppid: Number(match[2]), commandLine: match[3] }];
    });
}

function killPid(pid) {
  if (pid === process.pid || pid === process.ppid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      encoding: "utf8",
      windowsHide: true,
    });
    return;
  }
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // Process already gone.
  }
}

async function removeWithRetry(target, attempts = 8) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (!existsSync(target)) return;
    try {
      rmSync(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
      return;
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? err.code : "";
      if (!["EBUSY", "EPERM", "EACCES", "ENOTEMPTY"].includes(String(code)) || attempt === attempts) {
        throw err;
      }
      await delay(150 * attempt);
    }
  }
}

const matches = listCandidateProcesses().filter((proc) =>
  shouldUnlockProcess(proc.commandLine, repoRoot)
);
const matchPids = new Set(matches.map((proc) => proc.pid));
const roots = matches.filter((proc) => !matchPids.has(proc.ppid));

for (const proc of roots) {
  console.log(`Unlocking pid ${proc.pid}: ${proc.commandLine.trim()}`);
  killPid(proc.pid);
}

if (roots.length > 0) {
  await delay(400);
}

await removeWithRetry(resolveStandaloneDir(repoRoot));

for (const lockPath of lockPaths) {
  console.log(`Unlocked path: ${lockPath}`);
}
