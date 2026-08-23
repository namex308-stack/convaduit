import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireApiUser = vi.fn();
const getEntitledAuditReportForUser = vi.fn();
const getAuditAccessForUser = vi.fn();
const deleteAuditForUser = vi.fn();

vi.mock("@/lib/auth/require-api-user", () => ({
  requireApiUser: (...args: unknown[]) => requireApiUser(...args),
}));

vi.mock("@/lib/billing/audit-report-access", () => ({
  getEntitledAuditReportForUser: (...args: unknown[]) =>
    getEntitledAuditReportForUser(...args),
}));

vi.mock("@/lib/db/audit-repository", () => ({
  getAuditAccessForUser: (...args: unknown[]) => getAuditAccessForUser(...args),
  deleteAuditForUser: (...args: unknown[]) => deleteAuditForUser(...args),
}));

import { GET } from "@/app/api/audit/[id]/route";
import { applyReportPlanAccess } from "@/lib/billing/report-preview";
import type { AuditData, Recommendation } from "@/lib/types";

const AUDIT_ID = "11111111-1111-4111-8111-111111111111";

function rec(
  partial: Partial<Recommendation> & Pick<Recommendation, "id" | "problem" | "severity">
): Recommendation {
  return {
    solution: "إصلاح",
    impact: "high",
    effort: "quick",
    pillar: "conversion",
    ...partial,
  };
}

function fullAudit(): AuditData {
  return {
    id: AUDIT_ID,
    productUrl: "https://shop.example/p/1",
    storeName: "Shop",
    productName: "Product",
    overallScore: 55,
    competitorScore: 80,
    competitorBreakdown: [
      {
        pillar: "conversion",
        score: 80,
        max: 100,
        label: "sales",
        summary: "comp",
      },
    ],
    breakdown: [
      {
        pillar: "conversion",
        score: 50,
        max: 100,
        label: "sales",
        summary: "s",
      },
    ],
    recommendations: [
      rec({ id: "c1", problem: "c1", severity: "critical" }),
      rec({ id: "c2", problem: "c2", severity: "critical" }),
      rec({ id: "c3", problem: "c3", severity: "critical" }),
      rec({ id: "w1", problem: "w1", severity: "warning" }),
    ],
    geoReadability: { chatgpt: 1, perplexity: 2, googleAI: 3 },
    geoAnalysis: {
      score: 40,
      summary: "geo",
      findings: [{ id: "f", status: "fail", label: "x", detail: "secret finding" }],
      componentScores: {
        faq: 1,
        productSchema: 1,
        organizationSchema: 1,
        breadcrumbSchema: 1,
        headings: 1,
        contentStructure: 1,
        internalLinks: 1,
        entityRichness: 1,
        metadata: 1,
        contentClarity: 1,
      },
      signals: {
        faqCount: 0,
        hasFaq: false,
        hasFaqSchema: false,
        hasProductSchema: false,
        hasOrganizationSchema: false,
        hasBreadcrumbSchema: false,
        headingCount: 0,
        internalLinkCount: 0,
        wordCount: 0,
      },
    },
    generatedContent: {
      title: "secret title",
      description: "secret desc",
      faq: [],
      metaDescription: "meta",
      adCopy: [],
      source: "gemini",
    },
    createdAt: new Date().toISOString(),
    status: "completed",
  };
}

function entitledFromPlan(planId: "free" | "pro" | "business") {
  const applied = applyReportPlanAccess(fullAudit(), planId);
  return {
    workspaceId: "ws-1",
    audit: applied.audit,
    demoMode: false,
    aiConfigured: true,
    analysisRuns:
      applied.access.mode === "full"
        ? [
            {
              id: "run-1",
              analyzer: "geo",
              status: "ok",
              durationMs: 10,
              tokensUsed: 5,
              estimatedCost: 0.01,
              errorMessage: null,
            },
          ]
        : [],
    reportAccess: applied.access,
  };
}

describe("GET /api/audit/:id report access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUser.mockResolvedValue({
      ok: true,
      user: { id: "user-1" },
    });
  });

  it("Free cannot access protected report fields via direct API", async () => {
    getEntitledAuditReportForUser.mockResolvedValue(entitledFromPlan("free"));

    const res = await GET(new NextRequest("http://localhost/api/audit/" + AUDIT_ID), {
      params: Promise.resolve({ id: AUDIT_ID }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.reportAccess.mode).toBe("preview");
    expect(body.audit.competitorBreakdown).toBeUndefined();
    expect(body.audit.generatedContent).toBeUndefined();
    expect(body.audit.geoAnalysis?.findings ?? []).toEqual([]);
    expect(body.analysisRuns).toEqual([]);
    expect(
      body.audit.recommendations.filter((r: Recommendation) => r.severity === "critical")
        .length
    ).toBeLessThanOrEqual(2);
    expect(JSON.stringify(body)).not.toContain("secret finding");
    expect(JSON.stringify(body)).not.toContain("secret title");
  });

  it("Pro receives full report via API", async () => {
    getEntitledAuditReportForUser.mockResolvedValue(entitledFromPlan("pro"));

    const res = await GET(new NextRequest("http://localhost/api/audit/" + AUDIT_ID), {
      params: Promise.resolve({ id: AUDIT_ID }),
    });
    const body = await res.json();

    expect(body.reportAccess.mode).toBe("full");
    expect(body.audit.recommendations).toHaveLength(4);
    expect(body.audit.competitorBreakdown).toHaveLength(1);
    expect(body.audit.generatedContent?.title).toBe("secret title");
    expect(body.audit.geoAnalysis.findings).toHaveLength(1);
    expect(body.analysisRuns).toHaveLength(1);
  });

  it("Business receives full report via API", async () => {
    getEntitledAuditReportForUser.mockResolvedValue(entitledFromPlan("business"));

    const res = await GET(new NextRequest("http://localhost/api/audit/" + AUDIT_ID), {
      params: Promise.resolve({ id: AUDIT_ID }),
    });
    const body = await res.json();

    expect(body.reportAccess.mode).toBe("full");
    expect(body.audit.recommendations).toHaveLength(4);
    expect(body.audit.competitorScore).toBe(80);
  });
});
