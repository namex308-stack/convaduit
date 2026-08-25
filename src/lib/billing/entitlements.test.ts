import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
import { NextRequest } from "next/server";
import { POST } from "@/app/api/audit/route";

const integration = vi.hoisted(() => {
  const WORKSPACE_ID = "ws-free";
  type StoreRow = {
    id: string;
    workspace_id: string;
    primary_url: string;
    created_at: string;
  };

  const LEGIT_STORE: StoreRow = {
    id: "store-1",
    workspace_id: WORKSPACE_ID,
    primary_url: "https://legit.example.com",
    created_at: "2026-01-01T00:00:00.000Z",
  };
  const BYPASS_STORE: StoreRow = {
    id: "store-2",
    workspace_id: WORKSPACE_ID,
    primary_url: "https://bypass.example.com",
    created_at: "2026-01-02T00:00:00.000Z",
  };

  let storeRows: StoreRow[] = [LEGIT_STORE, BYPASS_STORE];

  function queryStores(workspaceId: string): StoreRow[] {
    return storeRows
      .filter((row) => row.workspace_id === workspaceId)
      .sort(
        (a, b) =>
          a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)
      );
  }

  function createSupabaseMock() {
    return {
      from: (table: string) => {
        if (table !== "stores") {
          throw new Error(`Unexpected table in integration mock: ${table}`);
        }
        let workspaceId = "";
        const builder = {
          select: (..._args: unknown[]) => builder,
          eq: (_column: string, value: string) => {
            workspaceId = value;
            return builder;
          },
          order: (..._args: unknown[]) => builder,
          update: () => ({
            eq: async () => ({ data: null, error: null }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({ data: { id: "unused" }, error: null }),
            }),
          }),
          then(
            onFulfilled: (value: { data: StoreRow[] }) => unknown,
            onRejected?: (reason: unknown) => unknown
          ) {
            return Promise.resolve({ data: queryStores(workspaceId) }).then(
              onFulfilled,
              onRejected
            );
          },
        };
        return builder;
      },
    };
  }

  const getSupabaseAdmin = vi.fn(() => createSupabaseMock());
  const requireApiUser = vi.fn();
  const getOnboardingState = vi.fn();
  const ensurePersonalWorkspace = vi.fn();
  const ensureWorkspaceStore = vi.fn();
  const createAuditRecord = vi.fn();
  const tryConsumeUsageQuota = vi.fn();
  const getPlanForUser = vi.fn();
  const checkRateLimit = vi.fn();

  return {
    WORKSPACE_ID,
    LEGIT_STORE,
    BYPASS_STORE,
    resetStores: () => {
      storeRows = [LEGIT_STORE, BYPASS_STORE];
    },
    getSupabaseAdmin,
    requireApiUser,
    getOnboardingState,
    ensurePersonalWorkspace,
    ensureWorkspaceStore,
    createAuditRecord,
    tryConsumeUsageQuota,
    getPlanForUser,
    checkRateLimit,
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => integration.getSupabaseAdmin(),
}));
vi.mock("@/lib/auth/require-api-user", () => ({
  requireApiUser: (...args: unknown[]) => integration.requireApiUser(...args),
}));
vi.mock("@/lib/db/onboarding-repository", () => ({
  getOnboardingState: (...args: unknown[]) => integration.getOnboardingState(...args),
  toAnalyzerOnboarding: () => null,
}));
vi.mock("@/lib/db/workspace-stats", () => ({
  getPlanForUser: (...args: unknown[]) => integration.getPlanForUser(...args),
  getPlanForWorkspace: (...args: unknown[]) => integration.getPlanForUser(...args),
  getCurrentUsagePeriod: () => ({
    start: "2026-08-01T00:00:00.000Z",
    end: "2026-08-31T23:59:59.999Z",
  }),
}));
vi.mock("@/lib/redis", () => ({
  checkRateLimit: (...args: unknown[]) => integration.checkRateLimit(...args),
}));
vi.mock("@/lib/url-safety", () => ({
  assertSafePublicHttpUrl: vi.fn(async (raw: string) => ({
    ok: true as const,
    href: raw,
  })),
}));
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    after: vi.fn((fn: () => void) => fn()),
  };
});
vi.mock("@/lib/gemini", () => ({
  isGeminiConfigured: () => false,
  runAudit: vi.fn(),
}));
vi.mock("@/lib/firecrawl", () => ({
  isFirecrawlConfigured: () => false,
  crawlWithFallback: vi.fn(),
  FIRECRAWL_NOT_CONFIGURED_MESSAGE: "Firecrawl is not configured",
}));
vi.mock("@/lib/db/audit-repository", () => ({
  ensurePersonalWorkspace: (...args: unknown[]) =>
    integration.ensurePersonalWorkspace(...args),
  ensureWorkspaceStore: (...args: unknown[]) =>
    integration.ensureWorkspaceStore(...args),
  createAuditRecord: (...args: unknown[]) => integration.createAuditRecord(...args),
  tryConsumeUsageQuota: (...args: unknown[]) =>
    integration.tryConsumeUsageQuota(...args),
  finishAnalysisRun: vi.fn(),
  markAuditFailed: vi.fn(),
  persistAuditResults: vi.fn(),
  recordUsageEvent: vi.fn(),
  releaseUsageQuota: vi.fn(),
  saveAuditPage: vi.fn(),
  startAnalysisRun: vi.fn(),
  updateAuditStatus: vi.fn(),
}));

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

type EnsureWorkspaceStoreInput = {
  workspaceId: string;
  storeUrl: string;
  storesLimit?: number | null;
};

/**
 * Mirrors production `ensureWorkspaceStore` decision wiring (stores list +
 * `decideStoreEnsure`) without loading the real audit-repository / Gemini stack.
 */
async function mockedEnsureWorkspaceStore(input: EnsureWorkspaceStoreInput) {
  const sb = integration.getSupabaseAdmin();
  if (!sb) return { ok: false as const, code: "FAILED" as const };

  const { data: workspaceStores } = await sb
    .from("stores")
    .select("id, primary_url, created_at")
    .eq("workspace_id", input.workspaceId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  const rows = workspaceStores ?? [];
  const existing = rows.find((row) => row.primary_url === input.storeUrl);
  const existingId = existing?.id ? String(existing.id) : null;
  const decision = decideStoreEnsure({
    existingId,
    currentCount: rows.length,
    storesLimit: input.storesLimit,
    oldestAllowedStoreIds: oldestAllowedStoreIds(
      rows.map((row) => String(row.id)),
      input.storesLimit
    ),
  });

  if (decision.action === "reject") {
    return {
      ok: false as const,
      code: "STORE_LIMIT_REACHED" as const,
      used: decision.used,
      limit: decision.limit,
    };
  }
  return { ok: false as const, code: "FAILED" as const };
}

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

describe("Free plan bypass store + /api/audit integration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    integration.resetStores();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    integration.requireApiUser.mockResolvedValue({
      ok: true,
      user: { id: "user-free" },
    });
    integration.ensurePersonalWorkspace.mockResolvedValue(integration.WORKSPACE_ID);
    integration.ensureWorkspaceStore.mockImplementation(mockedEnsureWorkspaceStore);
    integration.getPlanForUser.mockResolvedValue(freePlan);
    integration.checkRateLimit.mockResolvedValue({
      success: true,
      remaining: 2,
      limit: 3,
    });
    integration.getOnboardingState.mockResolvedValue({
      completed: true,
      resumePath: "/onboarding/done",
      storeUrl: integration.LEGIT_STORE.primary_url,
      businessName: "Legit Shop",
      platform: "shopify",
      country: "EG",
      primaryLanguage: "ar",
      storeVerifiedAt: null,
      competitorUrl: null,
      homepageTitle: null,
    });
  });

  it("rejects ensureWorkspaceStore for a bypass-inserted store via decideStoreEnsure", async () => {
    const result = await integration.ensureWorkspaceStore({
      workspaceId: integration.WORKSPACE_ID,
      storeUrl: integration.BYPASS_STORE.primary_url,
      storesLimit: PLAN_LIMITS.free.storesLimit,
    });

    expect(result).toEqual({
      ok: false,
      code: "STORE_LIMIT_REACHED",
      used: 2,
      limit: 1,
    });
    expect(integration.getSupabaseAdmin).toHaveBeenCalled();
  });

  it("POST /api/audit returns 403 STORE_LIMIT_REACHED when bypass store row exists", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storeUrl: integration.BYPASS_STORE.primary_url,
        }),
      })
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({
      code: ENTITLEMENT_CODES.STORE_LIMIT_REACHED,
      plan: "free",
      used: 2,
      limit: 1,
    });
    expect(integration.ensurePersonalWorkspace).toHaveBeenCalledWith("user-free");
    expect(integration.createAuditRecord).not.toHaveBeenCalled();
    expect(integration.tryConsumeUsageQuota).not.toHaveBeenCalled();
  });
});
