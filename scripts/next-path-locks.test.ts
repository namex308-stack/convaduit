import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUILD_LOCK_RELATIVE_PATHS,
  resolveBuildLockPaths,
  resolveRepoRoot,
  resolveStandaloneDir,
  shouldUnlockProcess,
} from "./next-path-locks.mjs";

const ROOT = String.raw`C:\Users\IT\Downloads\convaduit`;

describe("next-path-locks", () => {
  it("resolves lock paths from the repo root, not the process cwd", () => {
    const repoRoot = resolveRepoRoot();
    expect(repoRoot.replaceAll("\\", "/")).toMatch(/\/convaduit$/);
    expect(resolveStandaloneDir(repoRoot)).toBe(join(repoRoot, ".next", "standalone"));
    expect(resolveBuildLockPaths(repoRoot)).toEqual(
      BUILD_LOCK_RELATIVE_PATHS.map((relative) => join(repoRoot, relative))
    );
    expect(BUILD_LOCK_RELATIVE_PATHS).toEqual(
      expect.arrayContaining([
        join(".next", "required-server-files.js"),
        join(".next", "standalone", ".next", "required-server-files.js"),
      ])
    );
  });

  it("unlocks next start and standalone servers that reference this repo", () => {
    expect(
      shouldUnlockProcess(
        String.raw`"node" "C:\Users\IT\Downloads\convaduit\node_modules\next\dist\bin\next" start -p 3001`,
        ROOT
      )
    ).toBe(true);
    expect(
      shouldUnlockProcess(
        String.raw`node C:\Users\IT\Downloads\convaduit\.next\standalone\server.js`,
        ROOT
      )
    ).toBe(true);
    expect(
      shouldUnlockProcess(
        String.raw`node C:\Users\IT\Downloads\convaduit\scripts\start.mjs`,
        ROOT
      )
    ).toBe(true);
  });

  it("does not unlock next dev, next build, wrappers without a repo path, or other repos", () => {
    expect(
      shouldUnlockProcess(
        String.raw`"node" "C:\Users\IT\Downloads\convaduit\node_modules\next\dist\bin\next" dev -p 3000`,
        ROOT
      )
    ).toBe(false);
    expect(
      shouldUnlockProcess(
        String.raw`C:\nvm4w\nodejs\node.exe C:\Users\IT\Downloads\convaduit\node_modules\next\dist\server\lib\start-server.js`,
        ROOT
      )
    ).toBe(false);
    expect(
      shouldUnlockProcess(
        String.raw`"node" "C:\Users\IT\Downloads\convaduit\node_modules\next\dist\bin\next" build`,
        ROOT
      )
    ).toBe(false);
    expect(
      shouldUnlockProcess(
        String.raw`"C:\nvm4w\nodejs\node.exe" C:\nvm4w\nodejs/node_modules/npm/bin/npx-cli.js next start -p 3001`,
        ROOT
      )
    ).toBe(false);
    expect(
      shouldUnlockProcess(
        String.raw`node C:\Users\IT\Downloads\other-app\.next\standalone\server.js`,
        ROOT
      )
    ).toBe(false);
  });
});
