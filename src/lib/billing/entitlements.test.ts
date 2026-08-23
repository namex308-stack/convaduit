import { afterEach, describe, expect, it, vi } from "vitest";
import {
  aiGeneratorLockedMessage,
  apiLockedMessage,
  canCreateStore,
  competitorLockedMessage,
  automatedAlertsLockedMessage,
  competitorMonitoringLockedMessage,
  decideStoreEnsure,
  ENTITLEMENT_CODES,
  featureLockedBody,
  isPlanFeatureEnabled,
  oldestAllowedStoreIds,
  shouldBypassEntitlementLimits,
  shouldBypassStoreLimit,
  storeLimitReachedBody,
  storeLimitReachedMessage,
  weeklyMonitoringLockedMessage,
} from "@/lib/billing/entitlements";
import { PLAN_LIMITS } from "@/lib/billing/plans";
import type { PlanLimits } from "@/lib/dashboard/types";

const freePlan: PlanLimits = {
  planId: "free",
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

const proPlan: PlanLimits = {
  planId: "pro",
  displayName: "احترافي",
  auditsPerMonth: PLAN_LIMITS.pro.auditsPerMonth,
  aiGensPerMonth: PLAN_LIMITS.pro.aiGensPerMonth,
  storesLimit: PLAN_LIMITS.pro.storesLimit,
  features: {
    aiGenerator: true,
    competitor: true,
    api: false,
    competitorMonitoring: false,
    weeklyMonitoring: false,
    automatedAlerts: false,
  },
};

const businessPlan: PlanLimits = {
  planId: "business",
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

describe("isPlanFeatureEnabled", () => {
  it("locks competitor / AI / monitoring / API on Free", () => {
    expect(isPlanFeatureEnabled(freePlan, "competitor")).toBe(false);
    expect(isPlanFeatureEnabled(freePlan, "aiGenerator")).toBe(false);
    expect(isPlanFeatureEnabled(freePlan, "api")).toBe(false);
    expect(isPlanFeatureEnabled(freePlan, "competitorMonitoring")).toBe(false);
    expect(isPlanFeatureEnabled(freePlan, "weeklyMonitoring")).toBe(false);
    expect(isPlanFeatureEnabled(freePlan, "automatedAlerts")).toBe(false);
  });

  it("unlocks compare + AI on Pro but not Business-only monitoring", () => {
    expect(isPlanFeatureEnabled(proPlan, "competitor")).toBe(true);
    expect(isPlanFeatureEnabled(proPlan, "aiGenerator")).toBe(true);
    expect(isPlanFeatureEnabled(proPlan, "api")).toBe(false);
    expect(isPlanFeatureEnabled(proPlan, "competitorMonitoring")).toBe(false);
    expect(isPlanFeatureEnabled(proPlan, "weeklyMonitoring")).toBe(false);
    expect(isPlanFeatureEnabled(proPlan, "automatedAlerts")).toBe(false);
  });

  it("unlocks all features on Business", () => {
    expect(isPlanFeatureEnabled(businessPlan, "competitor")).toBe(true);
    expect(isPlanFeatureEnabled(businessPlan, "aiGenerator")).toBe(true);
    expect(isPlanFeatureEnabled(businessPlan, "api")).toBe(true);
    expect(isPlanFeatureEnabled(businessPlan, "competitorMonitoring")).toBe(true);
    expect(isPlanFeatureEnabled(businessPlan, "weeklyMonitoring")).toBe(true);
    expect(isPlanFeatureEnabled(businessPlan, "automatedAlerts")).toBe(true);
  });
});

describe("shouldBypassEntitlementLimits", () => {
  it("bypasses outside production", () => {
    expect(shouldBypassEntitlementLimits({ NODE_ENV: "development" })).toBe(true);
    expect(shouldBypassEntitlementLimits({ NODE_ENV: "test" })).toBe(true);
    expect(shouldBypassStoreLimit({ NODE_ENV: "development" })).toBe(true);
  });

  it("never bypasses in production", () => {
    expect(shouldBypassEntitlementLimits({ NODE_ENV: "production" })).toBe(false);
    expect(shouldBypassStoreLimit({ NODE_ENV: "production" })).toBe(false);
  });
});

describe("canCreateStore (production)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enforces Free stores_limit of 1", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(PLAN_LIMITS.free.storesLimit).toBe(1);
    expect(canCreateStore(0, 1)).toBe(true);
    expect(canCreateStore(1, 1)).toBe(false);
  });

  it("enforces Pro stores_limit of 5", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(canCreateStore(4, 5)).toBe(true);
    expect(canCreateStore(5, 5)).toBe(false);
  });

  it("enforces Business stores_limit of 15", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(canCreateStore(14, 15)).toBe(true);
    expect(canCreateStore(15, 15)).toBe(false);
  });
});

describe("canCreateStore (development)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows multiple stores even when Free plan limit is 1", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(PLAN_LIMITS.free.storesLimit).toBe(1);
    expect(canCreateStore(1, PLAN_LIMITS.free.storesLimit)).toBe(true);
    expect(canCreateStore(5, PLAN_LIMITS.free.storesLimit)).toBe(true);
  });
});

describe("decideStoreEnsure (production)", () => {
  const freeLimit = freePlan.storesLimit;
  const proLimit = proPlan.storesLimit;
  const businessLimit = businessPlan.storesLimit;

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects Free store #2 (insert)", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      decideStoreEnsure({
        existingId: null,
        currentCount: 1,
        storesLimit: freeLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(["store-1"], freeLimit),
      })
    ).toEqual({ action: "reject", used: 1, limit: 1 });
  });

  it("allows updating the existing Free store", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      decideStoreEnsure({
        existingId: "store-1",
        currentCount: 1,
        storesLimit: freeLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(["store-1"], freeLimit),
      })
    ).toEqual({ action: "update" });
  });

  it("rejects ensureWorkspaceStore on a bypass extra when a store already exists", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      decideStoreEnsure({
        existingId: "store-2",
        currentCount: 2,
        storesLimit: freeLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(["store-1", "store-2"], freeLimit),
      })
    ).toEqual({ action: "reject", used: 2, limit: 1 });
  });

  it("enforces Pro stores_limit of 5", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      decideStoreEnsure({
        existingId: null,
        currentCount: 4,
        storesLimit: proLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(["s1", "s2", "s3", "s4"], proLimit),
      })
    ).toEqual({ action: "insert" });
    expect(
      decideStoreEnsure({
        existingId: null,
        currentCount: 5,
        storesLimit: proLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(["s1", "s2", "s3", "s4", "s5"], proLimit),
      })
    ).toEqual({ action: "reject", used: 5, limit: 5 });
  });

  it("enforces Business stores_limit of 15", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(
      decideStoreEnsure({
        existingId: null,
        currentCount: 15,
        storesLimit: businessLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(
          Array.from({ length: 15 }, (_, i) => `s${i}`),
          businessLimit
        ),
      })
    ).toEqual({ action: "reject", used: 15, limit: 15 });
  });

  it("does not count another workspace's stores toward this workspace quota", () => {
    vi.stubEnv("NODE_ENV", "production");
    const thisWorkspaceIds = ["ws-a-store-1"];
    expect(
      oldestAllowedStoreIds(["ws-b-store-1", "ws-b-store-2"], freeLimit)
    ).not.toEqual(thisWorkspaceIds);
    expect(
      decideStoreEnsure({
        existingId: null,
        currentCount: thisWorkspaceIds.length,
        storesLimit: freeLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(thisWorkspaceIds, freeLimit),
      })
    ).toEqual({ action: "reject", used: 1, limit: 1 });
    expect(
      decideStoreEnsure({
        existingId: null,
        currentCount: 0,
        storesLimit: freeLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds([], freeLimit),
      })
    ).toEqual({ action: "insert" });
  });
});

describe("decideStoreEnsure (development)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows inserting Free store #2 and beyond", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(PLAN_LIMITS.free.storesLimit).toBe(1);
    expect(
      decideStoreEnsure({
        existingId: null,
        currentCount: 1,
        storesLimit: PLAN_LIMITS.free.storesLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(["store-1"], PLAN_LIMITS.free.storesLimit),
      })
    ).toEqual({ action: "insert" });
    expect(
      decideStoreEnsure({
        existingId: null,
        currentCount: 4,
        storesLimit: PLAN_LIMITS.free.storesLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(
          ["s1", "s2", "s3", "s4"],
          PLAN_LIMITS.free.storesLimit
        ),
      })
    ).toEqual({ action: "insert" });
  });

  it("allows updating an over-quota existing store", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(
      decideStoreEnsure({
        existingId: "store-2",
        currentCount: 2,
        storesLimit: PLAN_LIMITS.free.storesLimit,
        oldestAllowedStoreIds: oldestAllowedStoreIds(
          ["store-1", "store-2"],
          PLAN_LIMITS.free.storesLimit
        ),
      })
    ).toEqual({ action: "update" });
  });
});

describe("featureLockedBody", () => {
  it("returns deterministic COMPETITOR_LOCKED payload", () => {
    expect(featureLockedBody("competitor", "free")).toEqual({
      error: competitorLockedMessage(),
      code: ENTITLEMENT_CODES.COMPETITOR_LOCKED,
      plan: "free",
    });
  });

  it("returns deterministic AI_GENERATOR_LOCKED payload", () => {
    expect(featureLockedBody("aiGenerator", "free")).toEqual({
      error: aiGeneratorLockedMessage(),
      code: ENTITLEMENT_CODES.AI_GENERATOR_LOCKED,
      plan: "free",
    });
  });

  it("returns deterministic API_LOCKED payload for non-Business plans", () => {
    expect(featureLockedBody("api", "pro")).toEqual({
      error: apiLockedMessage(),
      code: ENTITLEMENT_CODES.API_LOCKED,
      plan: "pro",
    });
  });

  it("returns COMPETITOR_MONITORING_LOCKED for Pro direct API bypass attempts", () => {
    expect(featureLockedBody("competitorMonitoring", "pro")).toEqual({
      error: competitorMonitoringLockedMessage(),
      code: ENTITLEMENT_CODES.COMPETITOR_MONITORING_LOCKED,
      plan: "pro",
    });
  });

  it("returns WEEKLY_MONITORING_LOCKED for Free/Pro direct API bypass attempts", () => {
    expect(featureLockedBody("weeklyMonitoring", "free")).toEqual({
      error: weeklyMonitoringLockedMessage(),
      code: ENTITLEMENT_CODES.WEEKLY_MONITORING_LOCKED,
      plan: "free",
    });
    expect(featureLockedBody("weeklyMonitoring", "pro")).toEqual({
      error: weeklyMonitoringLockedMessage(),
      code: ENTITLEMENT_CODES.WEEKLY_MONITORING_LOCKED,
      plan: "pro",
    });
  });

  it("returns AUTOMATED_ALERTS_LOCKED for Free/Pro direct API bypass attempts", () => {
    expect(featureLockedBody("automatedAlerts", "free")).toEqual({
      error: automatedAlertsLockedMessage(),
      code: ENTITLEMENT_CODES.AUTOMATED_ALERTS_LOCKED,
      plan: "free",
    });
    expect(featureLockedBody("automatedAlerts", "pro")).toEqual({
      error: automatedAlertsLockedMessage(),
      code: ENTITLEMENT_CODES.AUTOMATED_ALERTS_LOCKED,
      plan: "pro",
    });
  });
});

describe("storeLimitReachedBody", () => {
  it("returns STORE_LIMIT_REACHED with used/limit for Free", () => {
    const body = storeLimitReachedBody(freePlan, 1);
    expect(body.code).toBe(ENTITLEMENT_CODES.STORE_LIMIT_REACHED);
    expect(body.plan).toBe("free");
    expect(body.used).toBe(1);
    expect(body.limit).toBe(1);
    expect(body.error).toBe(storeLimitReachedMessage("مجاني", 1, 1));
    expect(body.error).toContain("1/1");
  });
});
