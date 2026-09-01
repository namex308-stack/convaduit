import type { SiteIntegrationBase, SiteIntegrationStatus } from "@/lib/types";

export function integrationBase(
  start: number,
  status: SiteIntegrationStatus,
  extra?: { error?: string; skipReason?: string }
): SiteIntegrationBase {
  return {
    status,
    checkedAt: new Date().toISOString(),
    durationMs: Math.max(0, Date.now() - start),
    ...(extra?.error ? { error: extra.error.slice(0, 400) } : {}),
    ...(extra?.skipReason ? { skipReason: extra.skipReason } : {}),
  };
}

export function caughtErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error.";
}
