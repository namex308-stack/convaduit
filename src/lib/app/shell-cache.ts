"use client";

/** In-memory shell payload for this browser tab only (never shared across users). */
export type CachedShell = {
  planName?: string;
  displayName?: string | null;
  latestAuditId?: string | null;
  notificationCount?: number;
};

const TTL_MS = 30_000;

let cached: { at: number; shell: CachedShell } | null = null;

export function getCachedShell(): CachedShell | null {
  if (!cached) return null;
  if (Date.now() - cached.at > TTL_MS) {
    cached = null;
    return null;
  }
  return cached.shell;
}

export function setCachedShell(shell: CachedShell): void {
  cached = { at: Date.now(), shell };
}

export function clearCachedShell(): void {
  cached = null;
}
