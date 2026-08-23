import "server-only";

import { getPlanForWorkspace } from "@/lib/db/workspace-stats";
import {
  isPlanFeatureEnabled,
  type PlanFeature,
} from "@/lib/billing/entitlements";

/**
 * Resolve whether a workspace's active plan enables `feature`.
 * Optional cache keys by `${workspaceId}:${feature}` for batch jobs.
 */
export async function workspaceAllowsPlanFeature(
  workspaceId: string,
  feature: PlanFeature,
  cache?: Map<string, boolean>
): Promise<boolean> {
  const cacheKey = `${workspaceId}:${feature}`;
  if (cache) {
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;
  }

  const plan = await getPlanForWorkspace(workspaceId);
  const allowed = isPlanFeatureEnabled(plan, feature);
  if (cache) cache.set(cacheKey, allowed);
  return allowed;
}
