import "server-only";

import { workspaceAllowsPlanFeature } from "@/lib/billing/workspace-entitlement";
import {
  insertAlertDrafts,
  loadPreviousAuditForAlerts,
} from "@/lib/db/alerts-repository";
import type { AuditData } from "@/lib/types";
import type { DetectedCompetitorChange } from "@/lib/competitor-monitor/types";
import { generateAuditAlerts, generateCompetitorAlerts } from "./generate";

/** Compare latest audit to previous and persist resulting alerts (Business only). */
export async function emitAlertsForCompletedAudit(input: {
  workspaceId: string;
  storeId: string | null;
  auditId: string;
  audit: AuditData;
}): Promise<number> {
  try {
    const allowed = await workspaceAllowsPlanFeature(
      input.workspaceId,
      "automatedAlerts"
    );
    if (!allowed) {
      console.info("[alerts] skip audit emit — plan not entitled", {
        workspaceId: input.workspaceId,
        auditId: input.auditId,
      });
      return 0;
    }

    const previous = await loadPreviousAuditForAlerts({
      workspaceId: input.workspaceId,
      storeId: input.storeId,
      currentAuditId: input.auditId,
    });

    const drafts = generateAuditAlerts({
      latest: input.audit,
      previous,
      auditId: input.auditId,
    });

    if (!drafts.length) return 0;
    const inserted = await insertAlertDrafts({
      workspaceId: input.workspaceId,
      storeId: input.storeId,
      drafts,
    });
    return inserted.length;
  } catch (err) {
    console.error(
      "[alerts] emit audit failed:",
      err instanceof Error ? err.message : err
    );
    return 0;
  }
}

/** Persist alerts for competitor monitor diffs (Business automatedAlerts). */
export async function emitAlertsForCompetitorChanges(input: {
  workspaceId: string;
  storeId: string | null;
  targetId: string;
  snapshotId: string;
  targetLabel?: string | null;
  targetUrl?: string | null;
  changes: DetectedCompetitorChange[];
}): Promise<number> {
  try {
    const allowed = await workspaceAllowsPlanFeature(
      input.workspaceId,
      "automatedAlerts"
    );
    if (!allowed) {
      console.info("[alerts] skip competitor emit — plan not entitled", {
        workspaceId: input.workspaceId,
        targetId: input.targetId,
      });
      return 0;
    }

    const drafts = generateCompetitorAlerts({
      changes: input.changes,
      targetId: input.targetId,
      snapshotId: input.snapshotId,
      targetLabel: input.targetLabel,
      targetUrl: input.targetUrl,
    });
    if (!drafts.length) return 0;
    const inserted = await insertAlertDrafts({
      workspaceId: input.workspaceId,
      storeId: input.storeId,
      drafts,
    });
    return inserted.length;
  } catch (err) {
    console.error(
      "[alerts] emit competitor failed:",
      err instanceof Error ? err.message : err
    );
    return 0;
  }
}
