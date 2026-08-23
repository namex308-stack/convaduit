/**
 * Free-plan audit report preview boundary.
 * Pro/Business receive the full audit payload unchanged.
 */

import { prioritizeRecommendations } from "@/lib/ai/recommendations";
import type { PlanId } from "@/lib/billing/plans";
import { isAuditInProgress } from "@/lib/audits/types";
import { buildOpenQuickWins } from "@/lib/report/quick-wins";
import type { AuditData, GeoAnalysisResult, Recommendation } from "@/lib/types";

export const FREE_PREVIEW_CRITICAL_LIMIT = 2;
export const FREE_PREVIEW_QUICK_WINS_LIMIT = 2;
export const FREE_PREVIEW_ROADMAP_TASK_LIMIT = 2;

export type ReportAccessMode = "full" | "preview";

export type ReportAccess = {
  mode: ReportAccessMode;
  /** Total critical recommendations on the full report (not just preview rows). */
  criticalIssueCount: number;
  /** Total recommendations on the full report. */
  totalRecommendations: number;
  /** How many recommendation cards the Free UI may render in full. */
  visibleCriticalLimit: number;
  /** How many quick-win cards the Free UI may render. */
  visibleQuickWinsLimit: number;
  /** How many growth-roadmap tasks the Free UI may render. */
  visibleRoadmapTaskLimit: number;
};

/** Paid plans see the complete report; Free gets a teaser payload. */
export function hasFullReportAccess(planId: PlanId): boolean {
  return planId === "pro" || planId === "business";
}

function emptyGeoComponents(): GeoAnalysisResult["componentScores"] {
  return {
    faq: 0,
    productSchema: 0,
    organizationSchema: 0,
    breadcrumbSchema: 0,
    headings: 0,
    contentStructure: 0,
    internalLinks: 0,
    entityRichness: 0,
    metadata: 0,
    contentClarity: 0,
  };
}

/** Keep AI Visibility score + short summary; strip detailed GEO findings. */
function previewGeoAnalysis(
  geo: GeoAnalysisResult | undefined
): GeoAnalysisResult | undefined {
  if (!geo) return undefined;
  return {
    score: geo.score,
    summary: geo.summary,
    findings: [],
    componentScores: emptyGeoComponents(),
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
  };
}

function mergeRecommendationsById(
  ...groups: Recommendation[][]
): Recommendation[] {
  const byId = new Map<string, Recommendation>();
  for (const group of groups) {
    for (const rec of group) {
      const key = rec.id || rec.problem;
      if (!key || byId.has(key)) continue;
      byId.set(key, rec);
    }
  }
  return [...byId.values()];
}

function countsFromAudit(audit: AuditData): {
  criticalIssueCount: number;
  totalRecommendations: number;
} {
  const prioritized = prioritizeRecommendations(audit.recommendations ?? []);
  return {
    criticalIssueCount: prioritized.filter((r) => r.severity === "critical").length,
    totalRecommendations: prioritized.length,
  };
}

function fullAccessFromAudit(audit: AuditData): ReportAccess {
  const counts = countsFromAudit(audit);
  return {
    mode: "full",
    ...counts,
    visibleCriticalLimit: Number.POSITIVE_INFINITY,
    visibleQuickWinsLimit: Number.POSITIVE_INFINITY,
    visibleRoadmapTaskLimit: Number.POSITIVE_INFINITY,
  };
}

/**
 * Build the Free-plan audit payload: scores + limited teaser rows only.
 * Does not mutate the input audit.
 */
export function buildFreeReportPreview(audit: AuditData): {
  audit: AuditData;
  access: ReportAccess;
} {
  const prioritized = prioritizeRecommendations(audit.recommendations ?? []);
  const criticalAll = prioritized.filter((r) => r.severity === "critical");
  const topCritical = criticalAll.slice(0, FREE_PREVIEW_CRITICAL_LIMIT);

  const quickWinIds = new Set(
    buildOpenQuickWins(audit)
      .slice(0, FREE_PREVIEW_QUICK_WINS_LIMIT)
      .map((t) => t.id)
  );
  const quickWinRecs = prioritized.filter((r) => r.id && quickWinIds.has(r.id));

  const previewRecs = mergeRecommendationsById(topCritical, quickWinRecs);

  const access: ReportAccess = {
    mode: "preview",
    criticalIssueCount: criticalAll.length,
    totalRecommendations: prioritized.length,
    visibleCriticalLimit: FREE_PREVIEW_CRITICAL_LIMIT,
    visibleQuickWinsLimit: FREE_PREVIEW_QUICK_WINS_LIMIT,
    visibleRoadmapTaskLimit: FREE_PREVIEW_ROADMAP_TASK_LIMIT,
  };

  const previewAudit: AuditData = {
    ...audit,
    recommendations: previewRecs,
    competitorScore: undefined,
    competitorBreakdown: undefined,
    competitorUrl: undefined,
    generatedContent: undefined,
    geoAnalysis: previewGeoAnalysis(audit.geoAnalysis),
  };

  return { audit: previewAudit, access };
}

/**
 * Apply plan-based report access.
 * Incomplete audits are not redacted (scanning polls need status fields).
 * Completed Free audits receive a preview-only payload.
 */
export function applyReportPlanAccess(
  audit: AuditData,
  planId: PlanId
): { audit: AuditData; access: ReportAccess } {
  if (hasFullReportAccess(planId)) {
    return { audit, access: fullAccessFromAudit(audit) };
  }

  const status = audit.status;
  if (status && (isAuditInProgress(status) || status === "failed")) {
    const counts = countsFromAudit(audit);
    return {
      audit,
      access: {
        mode: "preview",
        ...counts,
        visibleCriticalLimit: FREE_PREVIEW_CRITICAL_LIMIT,
        visibleQuickWinsLimit: FREE_PREVIEW_QUICK_WINS_LIMIT,
        visibleRoadmapTaskLimit: FREE_PREVIEW_ROADMAP_TASK_LIMIT,
      },
    };
  }

  return buildFreeReportPreview(audit);
}
