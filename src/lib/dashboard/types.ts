import type { PlanId, UsageMetric } from "@/lib/db/types";
import type { AuditHistoryItem } from "@/lib/audits/types";

export type PlanLimits = {
  planId: PlanId;
  displayName: string;
  auditsPerMonth: number | null;
  aiGensPerMonth: number | null;
  storesLimit: number | null;
  features: {
    aiGenerator: boolean;
    competitor: boolean;
    api: boolean;
    /** Scheduled competitor monitoring (Business). */
    competitorMonitoring: boolean;
    /** Weekly monitoring / reports (Business). */
    weeklyMonitoring: boolean;
    /** Automated alerts (Business). */
    automatedAlerts: boolean;
  };
};

export type UsageCounts = Record<UsageMetric, number>;

export type DashboardPriorityIssue = {
  id: string;
  auditId: string;
  problem: string;
  solution: string;
  severity: "critical" | "warning" | "opportunity";
  impact: "high" | "medium" | "low";
  effort: string | null;
  pillar: string | null;
  projectedImpact: string | null;
};

export type DashboardTopIssue = {
  problem: string;
  count: number;
  severity: "critical" | "warning" | "opportunity";
  auditId: string | null;
};

export type DashboardMetricDirection = "up" | "down" | "flat";

export type DashboardMetricSource =
  | "audits"
  | "reports"
  | "audit_scores"
  | "usage_events"
  | "recommendations"
  | "geo_signals"
  | "audit_pages";

export type DashboardMetric = {
  value: number | null;
  previous: number | null;
  delta: number | null;
  direction: DashboardMetricDirection | null;
  source: DashboardMetricSource;
  asOf: string | null;
};

export type DashboardPillars = {
  overall: number | null;
  seo: number | null;
  geo: number | null;
  conversion: number | null;
  trust: number | null;
};

/** Payload for GET /api/dashboard — shared by API and client. */
export type DashboardPayload = {
  plan: PlanLimits;
  stats: {
    avgScore: number | null;
    totalAudits: number;
    auditsThisMonth: number;
    auditsLastMonth: number;
    auditsLimit: number | null;
    geoScore: number | null;
    openRecommendations: number;
    totalRecommendations: number;
    latestStoreScore: number | null;
    pagesScanned: number;
    pagesThisMonth: number;
    completedCount: number;
  };
  kpis: {
    overall: DashboardMetric;
    seo: DashboardMetric;
    geo: DashboardMetric;
    conversion: DashboardMetric;
    trust: DashboardMetric;
    audits: DashboardMetric;
  };
  latestPillars: DashboardPillars | null;
  previousPillars: DashboardPillars | null;
  latestAudit: {
    id: string;
    productName: string;
    storeName: string;
    overallScore: number | null;
    completedAt: string | null;
  } | null;
  geoSignals: {
    chatgpt: number | null;
    perplexity: number | null;
    googleAi: number | null;
  } | null;
  priorityIssue: DashboardPriorityIssue | null;
  nextFixes: DashboardPriorityIssue[];
  topIssues: DashboardTopIssue[];
  trend: { label: string; score: number; date: string }[];
  recent: AuditHistoryItem[];
  notificationCount: number;
  usagePct: number;
  /** Preferred profile display name (profiles.full_name), when set. */
  displayName: string | null;
};
