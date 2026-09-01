import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

const { afterQueue } = vi.hoisted(() => ({
  afterQueue: [] as Array<() => unknown>,
}));
const requireApiUser = vi.fn();
const crawlWithFallback = vi.fn();
const runAudit = vi.fn();
const persistAuditResults = vi.fn();
const runSiteIntegrations = vi.fn();
const applySiteIntegrationsToAudit = vi.fn(
  (audit: Record<string, unknown>, integrations: unknown) => ({
    ...audit,
    siteIntegrations: integrations,
  })
);

vi.mock("@/lib/auth/require-api-user", () => ({
  requireApiUser: (...args: unknown[]) => requireApiUser(...args),
}));

vi.mock("@/lib/firecrawl", () => ({
  crawlWithFallback: (...args: unknown[]) => crawlWithFallback(...args),
  isFirecrawlConfigured: () => false,
  FIRECRAWL_NOT_CONFIGURED_MESSAGE: "firecrawl missing",
}));

vi.mock("@/lib/gemini", () => ({
  runAudit: (...args: unknown[]) => runAudit(...args),
  isGeminiConfigured: () => false,
}));

vi.mock("@/lib/redis", () => ({
  checkRateLimit: vi.fn(async () => ({ success: true, remaining: 10, limit: 50 })),
}));

vi.mock("@/lib/db/audit-repository", () => ({
  createAuditRecord: vi.fn(async () => "audit-1"),
  ensurePersonalWorkspace: vi.fn(async () => "ws-1"),
  ensureWorkspaceStore: vi.fn(async () => ({ ok: true, storeId: "store-1" })),
  finishAnalysisRun: vi.fn(),
  markAuditFailed: vi.fn(),
  persistAuditResults: (...args: unknown[]) => persistAuditResults(...args),
  recordUsageEvent: vi.fn(),
  releaseUsageQuota: vi.fn(),
  saveAuditPage: vi.fn(),
  startAnalysisRun: vi.fn(),
  tryConsumeUsageQuota: vi.fn(async () => ({
    allowed: true,
    used: 1,
    usageEventId: "evt-1",
  })),
  updateAuditStatus: vi.fn(),
}));

vi.mock("@/lib/db/workspace-stats", () => ({
  getPlanForWorkspace: vi.fn(async () => ({
    planId: "pro",
    displayName: "Pro",
    auditsPerMonth: 50,
    aiGensPerMonth: 50,
    storesLimit: 5,
    features: {
      aiGenerator: true,
      competitor: true,
      api: true,
      competitorMonitoring: false,
      weeklyMonitoring: false,
      automatedAlerts: false,
    },
  })),
  getCurrentUsagePeriod: vi.fn(() => ({
    start: "2026-09-01",
    end: "2026-09-30",
  })),
}));

vi.mock("@/lib/db/onboarding-repository", () => ({
  getOnboardingState: vi.fn(async () => ({
    completed: true,
    resumePath: "/onboarding/done",
    storeUrl: "https://shop.example/",
    businessName: "Shop",
  })),
  toAnalyzerOnboarding: vi.fn(() => null),
}));

vi.mock("@/lib/notifications/emit", () => ({
  emitSubscriptionWarningNotification: vi.fn(),
}));

vi.mock("@/lib/url-safety", () => ({
  assertSafePublicHttpUrl: vi.fn(async (raw: string) => ({
    ok: true as const,
    href: raw,
  })),
}));

vi.mock("@/lib/integrations", () => ({
  runSiteIntegrations: (...args: unknown[]) => runSiteIntegrations(...args),
  applySiteIntegrationsToAudit: (...args: unknown[]) =>
    applySiteIntegrationsToAudit(...(args as [Record<string, unknown>, unknown])),
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    after: (task: () => unknown) => {
      afterQueue.push(task);
    },
  };
});

import { POST } from "./route";

const PAGE = {
  url: "https://shop.example/p/1",
  title: "Serum",
  description: "desc",
  pageType: "product",
  markdown: "# Product",
  imageCount: 1,
  contentHash: "hash",
  structuredData: {},
  scrapeStatus: "ok",
  scrapeMs: 12,
};

const AUDIT = {
  productUrl: PAGE.url,
  storeName: "Shop",
  productName: "Serum",
  overallScore: 70,
  breakdown: [],
  recommendations: [],
  geoReadability: { chatgpt: 1, perplexity: 1, googleAI: 1 },
  createdAt: new Date().toISOString(),
};

const INTEGRATIONS = {
  sslTls: { service: "ssl_tls", status: "ok", checkedAt: new Date().toISOString(), durationMs: 1 },
  pageSpeed: { service: "pagespeed", status: "ok", checkedAt: new Date().toISOString(), durationMs: 1 },
  webRisk: { service: "web_risk", status: "skipped", checkedAt: new Date().toISOString(), durationMs: 1, skipReason: "not_configured" },
  ipGeo: { service: "ip_geo", status: "ok", checkedAt: new Date().toISOString(), durationMs: 1 },
  whois: { service: "whois", status: "ok", checkedAt: new Date().toISOString(), durationMs: 1 },
};

describe("POST /api/audit site integrations pipeline", () => {
  beforeEach(() => {
    afterQueue.length = 0;
    persistAuditResults.mockClear();
    runSiteIntegrations.mockReset();
    applySiteIntegrationsToAudit.mockReset();
    requireApiUser.mockResolvedValue({ ok: true, user: { id: "user-1" } });
    crawlWithFallback.mockResolvedValue({ page: PAGE, errorCode: null, source: "fallback" });
    runAudit.mockResolvedValue(AUDIT);
    persistAuditResults.mockResolvedValue(undefined);
    runSiteIntegrations.mockResolvedValue(INTEGRATIONS);
    applySiteIntegrationsToAudit.mockImplementation(
      (audit: Record<string, unknown>, integrations: unknown) => ({
        ...audit,
        siteIntegrations: integrations,
      })
    );
  });

  it("runs free integrations and persists them on the existing audit", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productUrl: "https://shop.example/p/1" }),
      })
    );
    expect(res.status).toBe(200);
    for (const task of afterQueue.splice(0)) await task();
    expect(runSiteIntegrations).toHaveBeenCalledWith("https://shop.example/p/1");
    expect(applySiteIntegrationsToAudit).toHaveBeenCalled();
    expect(persistAuditResults).toHaveBeenCalled();
    const persisted = persistAuditResults.mock.calls[0]?.[2] as { siteIntegrations?: unknown };
    expect(persisted.siteIntegrations).toEqual(INTEGRATIONS);
  });

  it("still persists the audit when integrations throw", async () => {
    runSiteIntegrations.mockRejectedValue(new Error("boom"));
    const res = await POST(
      new NextRequest("http://localhost/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productUrl: "https://shop.example/p/1" }),
      })
    );
    expect(res.status).toBe(200);
    for (const task of afterQueue.splice(0)) await task();
    expect(persistAuditResults).toHaveBeenCalled();
    const persisted = persistAuditResults.mock.calls.at(-1)?.[2] as { siteIntegrations?: unknown };
    expect(persisted.siteIntegrations).toBeUndefined();
  });
});
