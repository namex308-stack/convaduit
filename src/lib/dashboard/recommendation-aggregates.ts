import { parseSeverity } from "@/lib/audits/parse";
import type { DashboardTopIssue } from "@/lib/dashboard/types";

export type RecommendationAggregateRow = {
  audit_id: string;
  status: string | null;
  severity: string | null;
  problem?: string | null;
};

const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  warning: 1,
  opportunity: 2,
};

function isActionableSeverity(severity: string | null): boolean {
  return severity === "critical" || severity === "warning";
}

export function recommendationStatsFromRows(
  rows: readonly RecommendationAggregateRow[],
  auditIds: ReadonlySet<string>
): { open: number; total: number } {
  const actionable = rows.filter((row) => {
    if (!auditIds.has(String(row.audit_id))) return false;
    return isActionableSeverity(String(row.severity || ""));
  });
  return {
    total: actionable.length,
    open: actionable.filter((row) => row.status === "open").length,
  };
}

export function topIssuesFromRows(
  rows: readonly RecommendationAggregateRow[],
  auditIds: ReadonlySet<string>
): DashboardTopIssue[] {
  const grouped = new Map<
    string,
    { problem: string; count: number; severity: string; auditId: string }
  >();

  for (const row of rows) {
    const auditId = String(row.audit_id);
    if (!auditIds.has(auditId)) continue;
    if (row.status !== "open") continue;
    if (!isActionableSeverity(String(row.severity || ""))) continue;

    const problem = String(row.problem || "").trim();
    if (!problem) continue;
    const key = problem.toLowerCase();
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
      const nextRank = SEVERITY_RANK[String(row.severity)] ?? 9;
      const curRank = SEVERITY_RANK[existing.severity] ?? 9;
      if (nextRank < curRank) existing.severity = String(row.severity);
    } else {
      grouped.set(key, {
        problem,
        count: 1,
        severity: String(row.severity || "opportunity"),
        auditId,
      });
    }
  }

  return [...grouped.values()]
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9);
    })
    .slice(0, 5)
    .map((item) => ({
      problem: item.problem,
      count: item.count,
      severity: parseSeverity(item.severity),
      auditId: item.auditId,
    }));
}

export function pageStatsFromRows(
  pages: readonly { audit_id: string }[],
  recs: readonly RecommendationAggregateRow[],
  auditsThisMonthIds: ReadonlySet<string>
): {
  totalPages: number;
  pagesThisMonth: number;
  byAudit: Record<string, number>;
  openIssuesByAudit: Record<string, number>;
} {
  const byAudit: Record<string, number> = {};
  let pagesThisMonth = 0;
  for (const row of pages) {
    const id = String(row.audit_id);
    byAudit[id] = (byAudit[id] ?? 0) + 1;
    if (auditsThisMonthIds.has(id)) pagesThisMonth += 1;
  }

  const openIssuesByAudit: Record<string, number> = {};
  for (const row of recs) {
    if (row.status !== "open") continue;
    if (!isActionableSeverity(String(row.severity || ""))) continue;
    const id = String(row.audit_id);
    openIssuesByAudit[id] = (openIssuesByAudit[id] ?? 0) + 1;
  }

  return {
    totalPages: pages.length,
    pagesThisMonth,
    byAudit,
    openIssuesByAudit,
  };
}
