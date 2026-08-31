import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

const requireApiUser = vi.fn();
vi.mock("@/lib/auth/require-api-user", () => ({
  requireApiUser: (...args: unknown[]) => requireApiUser(...args),
}));

vi.mock("@/lib/firecrawl", () => ({
  crawlWithFallback: vi.fn(),
  isFirecrawlConfigured: () => false,
  FIRECRAWL_NOT_CONFIGURED_MESSAGE: "firecrawl missing",
}));

vi.mock("@/lib/gemini", () => ({
  runAudit: vi.fn(),
  isGeminiConfigured: () => false,
}));

vi.mock("@/lib/redis", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/db/audit-repository", () => ({
  createAuditRecord: vi.fn(),
  ensurePersonalWorkspace: vi.fn(),
  ensureWorkspaceStore: vi.fn(),
  finishAnalysisRun: vi.fn(),
  markAuditFailed: vi.fn(),
  persistAuditResults: vi.fn(),
  recordUsageEvent: vi.fn(),
  releaseUsageQuota: vi.fn(),
  saveAuditPage: vi.fn(),
  startAnalysisRun: vi.fn(),
  tryConsumeUsageQuota: vi.fn(),
  updateAuditStatus: vi.fn(),
}));

vi.mock("@/lib/db/workspace-stats", () => ({
  getPlanForWorkspace: vi.fn(),
  getCurrentUsagePeriod: vi.fn(),
}));

vi.mock("@/lib/db/onboarding-repository", () => ({
  getOnboardingState: vi.fn(),
  toAnalyzerOnboarding: vi.fn(),
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

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    after: (task: () => unknown) => {
      void task();
    },
  };
});

import { POST } from "./route";

function loadTestRequest(): NextRequest {
  return new NextRequest("http://localhost/api/audit?loadTest=true", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-load-test": "true",
    },
    body: JSON.stringify({ productUrl: "https://shop.example/p/1" }),
  });
}

describe("POST /api/audit load-test header", () => {
  beforeEach(() => {
    requireApiUser.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects X-Load-Test in production before auth or providers run", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const res = await POST(loadTestRequest());
    expect(res.status).toBe(403);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("LOAD_TEST_REJECTED");
    expect(requireApiUser).not.toHaveBeenCalled();
  });
});
