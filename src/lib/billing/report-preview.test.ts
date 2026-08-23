import { describe, expect, it } from "vitest";
import {
  applyReportPlanAccess,
  buildFreeReportPreview,
  FREE_PREVIEW_CRITICAL_LIMIT,
  FREE_PREVIEW_QUICK_WINS_LIMIT,
  hasFullReportAccess,
} from "@/lib/billing/report-preview";
import type { AuditData, Recommendation } from "@/lib/types";

function rec(
  partial: Partial<Recommendation> & Pick<Recommendation, "id" | "problem" | "severity">
): Recommendation {
  return {
    solution: partial.solution ?? "طبّق الإصلاح",
    impact: partial.impact ?? "high",
    effort: partial.effort ?? "quick",
    pillar: partial.pillar ?? "conversion",
    ...partial,
  };
}

function sampleAudit(overrides: Partial<AuditData> = {}): AuditData {
  const recommendations: Recommendation[] = [
    rec({ id: "c1", problem: "حرج 1", severity: "critical", effort: "quick" }),
    rec({ id: "c2", problem: "حرج 2", severity: "critical", effort: "quick" }),
    rec({ id: "c3", problem: "حرج 3", severity: "critical", effort: "medium" }),
    rec({
      id: "w1",
      problem: "تحذير 1",
      severity: "warning",
      impact: "medium",
      effort: "quick",
    }),
    rec({
      id: "o1",
      problem: "فرصة 1",
      severity: "opportunity",
      impact: "low",
      effort: "involved",
    }),
  ];

  return {
    id: "audit-1",
    productUrl: "https://shop.example/p/1",
    storeName: "متجر تجريبي",
    productName: "منتج",
    overallScore: 62,
    competitorScore: 70,
    competitorUrl: "https://competitor.example",
    competitorBreakdown: [
      {
        pillar: "conversion",
        score: 70,
        max: 100,
        label: "المبيعات",
        summary: "منافس",
      },
    ],
    breakdown: [
      {
        pillar: "conversion",
        score: 55,
        max: 100,
        label: "المبيعات",
        summary: "ملخص مبيعات",
      },
      {
        pillar: "seo",
        score: 60,
        max: 100,
        label: "SEO",
        summary: "ملخص SEO",
      },
      {
        pillar: "geo",
        score: 50,
        max: 100,
        label: "GEO",
        summary: "ملخص GEO",
      },
      {
        pillar: "trust",
        score: 70,
        max: 100,
        label: "ثقة",
        summary: "ملخص ثقة",
      },
    ],
    recommendations,
    geoReadability: { chatgpt: 40, perplexity: 42, googleAI: 38 },
    geoAnalysis: {
      score: 48,
      summary: "رؤية AI محدودة",
      findings: [
        {
          id: "f1",
          status: "fail",
          label: "FAQ",
          detail: "لا يوجد FAQ",
        },
      ],
      componentScores: {
        faq: 0,
        productSchema: 10,
        organizationSchema: 10,
        breadcrumbSchema: 10,
        headings: 10,
        contentStructure: 10,
        internalLinks: 10,
        entityRichness: 10,
        metadata: 10,
        contentClarity: 10,
      },
      signals: {
        faqCount: 0,
        hasFaq: false,
        hasFaqSchema: false,
        hasProductSchema: true,
        hasOrganizationSchema: false,
        hasBreadcrumbSchema: false,
        headingCount: 4,
        internalLinkCount: 2,
        wordCount: 200,
      },
    },
    generatedContent: {
      title: "عنوان مولّد",
      description: "وصف مولّد",
      faq: [{ q: "س؟", a: "ج" }],
      metaDescription: "meta",
      adCopy: [],
      source: "gemini",
    },
    createdAt: new Date().toISOString(),
    status: "completed",
    ...overrides,
  };
}

describe("hasFullReportAccess", () => {
  it("allows Pro and Business only", () => {
    expect(hasFullReportAccess("free")).toBe(false);
    expect(hasFullReportAccess("pro")).toBe(true);
    expect(hasFullReportAccess("business")).toBe(true);
  });
});

describe("buildFreeReportPreview", () => {
  it("keeps scores and caps critical + quick-win recommendations", () => {
    const full = sampleAudit();
    const { audit, access } = buildFreeReportPreview(full);

    expect(access.mode).toBe("preview");
    expect(access.criticalIssueCount).toBe(3);
    expect(access.totalRecommendations).toBe(5);
    expect(audit.overallScore).toBe(62);
    expect(audit.breakdown).toHaveLength(4);
    expect(audit.geoReadability.chatgpt).toBe(40);
    expect(audit.geoAnalysis?.score).toBe(48);
    expect(audit.geoAnalysis?.findings).toEqual([]);
    expect(audit.competitorBreakdown).toBeUndefined();
    expect(audit.competitorScore).toBeUndefined();
    expect(audit.generatedContent).toBeUndefined();

    const critical = audit.recommendations.filter((r) => r.severity === "critical");
    expect(critical.length).toBeLessThanOrEqual(FREE_PREVIEW_CRITICAL_LIMIT);
    expect(audit.recommendations.length).toBeLessThanOrEqual(
      FREE_PREVIEW_CRITICAL_LIMIT + FREE_PREVIEW_QUICK_WINS_LIMIT
    );
  });
});

describe("applyReportPlanAccess", () => {
  it("Free completed audit receives preview only", () => {
    const { audit, access } = applyReportPlanAccess(sampleAudit(), "free");
    expect(access.mode).toBe("preview");
    expect(audit.recommendations.length).toBeLessThan(5);
    expect(audit.competitorBreakdown).toBeUndefined();
    expect(audit.geoAnalysis?.findings ?? []).toHaveLength(0);
  });

  it("Pro receives the full report unchanged", () => {
    const full = sampleAudit();
    const { audit, access } = applyReportPlanAccess(full, "pro");
    expect(access.mode).toBe("full");
    expect(audit.recommendations).toHaveLength(5);
    expect(audit.competitorBreakdown).toHaveLength(1);
    expect(audit.generatedContent?.title).toBe("عنوان مولّد");
    expect(audit.geoAnalysis?.findings).toHaveLength(1);
  });

  it("Business receives the full report unchanged", () => {
    const full = sampleAudit();
    const { audit, access } = applyReportPlanAccess(full, "business");
    expect(access.mode).toBe("full");
    expect(audit.recommendations).toHaveLength(5);
    expect(audit.competitorScore).toBe(70);
  });

  it("does not redact in-progress Free audits used for scanning polls", () => {
    const running = sampleAudit({
      status: "analyzing",
      recommendations: [],
      competitorBreakdown: [
        {
          pillar: "conversion",
          score: 70,
          max: 100,
          label: "المبيعات",
          summary: "منافس",
        },
      ],
    });
    const { audit, access } = applyReportPlanAccess(running, "free");
    expect(access.mode).toBe("preview");
    expect(audit.status).toBe("analyzing");
    // Incomplete audits keep the raw payload for polling; redaction applies after completion.
    expect(audit.competitorBreakdown).toHaveLength(1);
  });
});
