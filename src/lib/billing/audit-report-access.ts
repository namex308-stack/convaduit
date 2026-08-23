/**
 * Load an audit report with plan-based Free preview redaction applied.
 * Use this for client-facing report surfaces (page + GET /api/audit/:id).
 * Internal/paid-feature paths that need the full payload should call
 * getAuditByIdForUser directly after their own entitlement checks.
 */

import "server-only";

import {
  getAuditByIdForUser,
  type StoredAuditReport,
} from "@/lib/db/audit-repository";
import { getPlanForWorkspace } from "@/lib/db/workspace-stats";
import {
  applyReportPlanAccess,
  type ReportAccess,
} from "@/lib/billing/report-preview";

export type EntitledAuditReport = StoredAuditReport & {
  reportAccess: ReportAccess;
};

export async function getEntitledAuditReportForUser(
  auditId: string,
  userId: string
): Promise<EntitledAuditReport | null> {
  const stored = await getAuditByIdForUser(auditId, userId);
  if (!stored) return null;

  const plan = await getPlanForWorkspace(stored.workspaceId);
  const { audit, access } = applyReportPlanAccess(stored.audit, plan.planId);

  return {
    ...stored,
    audit,
    reportAccess: access,
    // Free preview must not leak analyzer cost/token detail either.
    analysisRuns: access.mode === "full" ? stored.analysisRuns : [],
  };
}
