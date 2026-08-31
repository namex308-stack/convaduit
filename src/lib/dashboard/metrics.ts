/**
 * Pure dashboard metric helpers — period deltas, pillar merge, trend windows.
 * Numbers come from caller-supplied audit/report/usage rows; this module never
 * invents fallback scores.
 */

import type {
  DashboardMetric,
  DashboardMetricDirection,
  DashboardMetricSource,
  DashboardPillars,
} from "@/lib/dashboard/types";
import type { TrendPoint } from "@/lib/dashboard/trend";
import { filterTrendByMonths } from "@/lib/dashboard/trend";

export type PillarSlug = "seo" | "geo" | "conversion" | "trust";

export type ReportPillarRow = {
  audit_id: string;
  version?: number | null;
  overall_score?: number | null;
  geo_score?: number | null;
  seo_score?: number | null;
  conversion_score?: number | null;
  trust_score?: number | null;
};

export type AuditScoreRow = {
  audit_id: string;
  category_id: string;
  subject?: string | null;
  score: number | null;
};

export type CategoryRow = {
  id: string;
  slug: string;
};

function roundScore(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(Number(value))) return null;
  return Math.max(0, Math.min(100, Math.round(Number(value))));
}

export function metricDirection(delta: number): DashboardMetricDirection {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

export function buildMetric(input: {
  value: number | null;
  previous: number | null;
  source: DashboardMetricSource;
  asOf: string | null;
}): DashboardMetric {
  const value = input.value == null || !Number.isFinite(input.value) ? null : input.value;
  const previous =
    input.previous == null || !Number.isFinite(input.previous) ? null : input.previous;
  if (value == null || previous == null) {
    return {
      value,
      previous,
      delta: null,
      direction: null,
      source: input.source,
      asOf: input.asOf,
    };
  }
  const delta = value - previous;
  return {
    value,
    previous,
    delta,
    direction: metricDirection(delta),
    source: input.source,
    asOf: input.asOf,
  };
}

export function emptyPillars(): DashboardPillars {
  return {
    overall: null,
    seo: null,
    geo: null,
    conversion: null,
    trust: null,
  };
}

export function pickLatestReportByAudit(
  rows: readonly ReportPillarRow[]
): Map<string, ReportPillarRow> {
  const map = new Map<string, ReportPillarRow>();
  for (const row of rows) {
    const id = String(row.audit_id);
    const existing = map.get(id);
    const nextVersion = Number(row.version) || 0;
    const prevVersion = Number(existing?.version) || 0;
    if (!existing || nextVersion >= prevVersion) {
      map.set(id, row);
    }
  }
  return map;
}

export function scoresBySlugForAudit(
  auditId: string,
  scores: readonly AuditScoreRow[],
  categories: readonly CategoryRow[]
): Partial<Record<PillarSlug, number>> {
  const slugById = new Map(
    categories.map((c) => [String(c.id), String(c.slug)])
  );
  const out: Partial<Record<PillarSlug, number>> = {};
  for (const row of scores) {
    if (String(row.audit_id) !== auditId) continue;
    if (row.subject && row.subject !== "self") continue;
    const slug = slugById.get(String(row.category_id));
    if (slug !== "seo" && slug !== "geo" && slug !== "conversion" && slug !== "trust") {
      continue;
    }
    const score = roundScore(row.score);
    if (score == null) continue;
    out[slug] = score;
  }
  return out;
}

export type PillarSourceMap = Record<PillarSlug | "overall", DashboardMetricSource>;

export function mergePillarSnapshot(input: {
  overallFromAudit: number | null;
  geoFromAudit: number | null;
  report: ReportPillarRow | null;
  scoresBySlug: Partial<Record<PillarSlug, number>>;
}): { pillars: DashboardPillars; sources: PillarSourceMap } {
  const reportOverall = roundScore(input.report?.overall_score);
  const reportSeo = roundScore(input.report?.seo_score);
  const reportGeo = roundScore(input.report?.geo_score);
  const reportConversion = roundScore(input.report?.conversion_score);
  const reportTrust = roundScore(input.report?.trust_score);
  const auditOverall = roundScore(input.overallFromAudit);
  const auditGeo = roundScore(input.geoFromAudit);

  const overall = auditOverall ?? reportOverall;
  const seo = reportSeo ?? input.scoresBySlug.seo ?? null;
  const geo = reportGeo ?? auditGeo ?? input.scoresBySlug.geo ?? null;
  const conversion = reportConversion ?? input.scoresBySlug.conversion ?? null;
  const trust = reportTrust ?? input.scoresBySlug.trust ?? null;

  return {
    pillars: { overall, seo, geo, conversion, trust },
    sources: {
      overall: auditOverall != null ? "audits" : "reports",
      seo: reportSeo != null ? "reports" : "audit_scores",
      geo: reportGeo != null ? "reports" : auditGeo != null ? "audits" : "audit_scores",
      conversion: reportConversion != null ? "reports" : "audit_scores",
      trust: reportTrust != null ? "reports" : "audit_scores",
    },
  };
}

/** True when a range selector would show two different usable windows. */
export function trendSupportsRangeFilter(trend: readonly TrendPoint[]): boolean {
  if (trend.length < 2) return false;
  const in3 = filterTrendByMonths(trend, 3);
  const in6 = filterTrendByMonths(trend, 6);
  const in12 = filterTrendByMonths(trend, 12);
  const usable = [in3, in6, in12].filter((points) => points.length >= 2);
  if (usable.length < 2) return false;
  return new Set(usable.map((points) => points.length)).size > 1;
}

export function defaultTrendRange(
  trend: readonly TrendPoint[]
): "3" | "6" | "12" {
  if (filterTrendByMonths(trend, 6).length >= 2) return "6";
  if (filterTrendByMonths(trend, 3).length >= 2) return "3";
  if (filterTrendByMonths(trend, 12).length >= 2) return "12";
  return "6";
}

export function formatSignedDelta(delta: number | null): string | null {
  if (delta == null || !Number.isFinite(delta)) return null;
  if (delta === 0) return "0";
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function previousMonthPeriod(now = new Date()): { start: string; end: string } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59));
  return { start: start.toISOString(), end: end.toISOString() };
}

export function sortCompletedByRecency<T extends { completedAt: string | null; createdAt: string }>(
  rows: readonly T[]
): T[] {
  return [...rows].sort((a, b) => {
    const ta = new Date(a.completedAt || a.createdAt).getTime();
    const tb = new Date(b.completedAt || b.createdAt).getTime();
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
  });
}
