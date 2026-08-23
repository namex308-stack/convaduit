import { beforeEach, describe, expect, it, vi } from "vitest";
import { PLAN_LIMITS } from "@/lib/billing/plans";

vi.mock("server-only", () => ({}));

const getPlanForWorkspace = vi.fn();
vi.mock("@/lib/db/workspace-stats", () => ({
  getPlanForWorkspace: (...args: unknown[]) => getPlanForWorkspace(...args),
}));

import { workspaceAllowsPlanFeature } from "./workspace-entitlement";

const FREE = {
  planId: "free" as const,
  displayName: "مجاني",
  auditsPerMonth: PLAN_LIMITS.free.auditsPerMonth,
  aiGensPerMonth: PLAN_LIMITS.free.aiGensPerMonth,
  storesLimit: PLAN_LIMITS.free.storesLimit,
  features: {
    aiGenerator: false,
    competitor: false,
    api: false,
    competitorMonitoring: false,
    weeklyMonitoring: false,
    automatedAlerts: false,
  },
};

const BUSINESS = {
  planId: "business" as const,
  displayName: "أعمال",
  auditsPerMonth: PLAN_LIMITS.business.auditsPerMonth,
  aiGensPerMonth: PLAN_LIMITS.business.aiGensPerMonth,
  storesLimit: PLAN_LIMITS.business.storesLimit,
  features: {
    aiGenerator: true,
    competitor: true,
    api: true,
    competitorMonitoring: true,
    weeklyMonitoring: true,
    automatedAlerts: true,
  },
};

describe("workspaceAllowsPlanFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies Free for Business-only features", async () => {
    getPlanForWorkspace.mockResolvedValue(FREE);
    expect(await workspaceAllowsPlanFeature("ws-1", "weeklyMonitoring")).toBe(
      false
    );
    expect(await workspaceAllowsPlanFeature("ws-1", "automatedAlerts")).toBe(
      false
    );
    expect(
      await workspaceAllowsPlanFeature("ws-1", "competitorMonitoring")
    ).toBe(false);
  });

  it("allows Business for monitoring features", async () => {
    getPlanForWorkspace.mockResolvedValue(BUSINESS);
    expect(await workspaceAllowsPlanFeature("ws-b", "weeklyMonitoring")).toBe(
      true
    );
    expect(await workspaceAllowsPlanFeature("ws-b", "automatedAlerts")).toBe(
      true
    );
    expect(
      await workspaceAllowsPlanFeature("ws-b", "competitorMonitoring")
    ).toBe(true);
  });

  it("caches per workspace+feature and does not leak across workspaces", async () => {
    getPlanForWorkspace
      .mockResolvedValueOnce(FREE)
      .mockResolvedValueOnce(BUSINESS);
    const cache = new Map<string, boolean>();

    expect(
      await workspaceAllowsPlanFeature("ws-free", "weeklyMonitoring", cache)
    ).toBe(false);
    expect(
      await workspaceAllowsPlanFeature("ws-biz", "weeklyMonitoring", cache)
    ).toBe(true);

    // Cache hit for free — no third plan lookup
    expect(
      await workspaceAllowsPlanFeature("ws-free", "weeklyMonitoring", cache)
    ).toBe(false);
    expect(getPlanForWorkspace).toHaveBeenCalledTimes(2);
  });
});
