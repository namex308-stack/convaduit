import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditData } from "@/lib/types";
import type { DetectedCompetitorChange } from "@/lib/competitor-monitor/types";

vi.mock("server-only", () => ({}));

const workspaceAllowsPlanFeature = vi.fn();
vi.mock("@/lib/billing/workspace-entitlement", () => ({
  workspaceAllowsPlanFeature: (...args: unknown[]) =>
    workspaceAllowsPlanFeature(...args),
}));

const insertAlertDrafts = vi.fn();
const loadPreviousAuditForAlerts = vi.fn();
vi.mock("@/lib/db/alerts-repository", () => ({
  insertAlertDrafts: (...args: unknown[]) => insertAlertDrafts(...args),
  loadPreviousAuditForAlerts: (...args: unknown[]) =>
    loadPreviousAuditForAlerts(...args),
}));

import {
  emitAlertsForCompletedAudit,
  emitAlertsForCompetitorChanges,
} from "./emit";

const MIN_AUDIT = {
  productUrl: "https://shop.example/p/1",
  storeName: "متجر",
  productName: "منتج",
  overallScore: 40,
  breakdown: [],
  recommendations: [
    {
      id: "r1",
      pillar: "conversion",
      severity: "critical",
      impact: "high",
      problem: "مشكلة",
      solution: "حل",
    },
  ],
  geoReadability: { chatgpt: 40, perplexity: 40, googleAI: 40 },
  geoAnalysis: {
    score: 40,
    summary: "geo",
    findings: [],
    componentScores: {
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
      wordCount: 10,
    },
  },
} as unknown as AuditData;

const CHANGE: DetectedCompetitorChange = {
  changeType: "price_drop",
  severity: "critical",
  fieldPath: "signals.price",
  summary: "تغير السعر",
  businessImpact: "أثر",
  recommendedAction: "راجع التسعير",
  previousValue: "100",
  currentValue: "80",
};

describe("emitAlerts entitlement gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertAlertDrafts.mockResolvedValue([{ id: "a1" }]);
    loadPreviousAuditForAlerts.mockResolvedValue(null);
  });

  it("blocks Free workspace audit alert emit", async () => {
    workspaceAllowsPlanFeature.mockResolvedValue(false);
    const n = await emitAlertsForCompletedAudit({
      workspaceId: "ws-free",
      storeId: "s1",
      auditId: "audit-1",
      audit: MIN_AUDIT,
    });
    expect(n).toBe(0);
    expect(workspaceAllowsPlanFeature).toHaveBeenCalledWith(
      "ws-free",
      "automatedAlerts"
    );
    expect(loadPreviousAuditForAlerts).not.toHaveBeenCalled();
    expect(insertAlertDrafts).not.toHaveBeenCalled();
  });

  it("blocks Pro workspace audit alert emit", async () => {
    workspaceAllowsPlanFeature.mockResolvedValue(false);
    const n = await emitAlertsForCompletedAudit({
      workspaceId: "ws-pro",
      storeId: "s1",
      auditId: "audit-1",
      audit: MIN_AUDIT,
    });
    expect(n).toBe(0);
    expect(insertAlertDrafts).not.toHaveBeenCalled();
  });

  it("allows Business workspace audit alert emit", async () => {
    workspaceAllowsPlanFeature.mockResolvedValue(true);
    const n = await emitAlertsForCompletedAudit({
      workspaceId: "ws-business",
      storeId: "s1",
      auditId: "audit-1",
      audit: MIN_AUDIT,
    });
    expect(workspaceAllowsPlanFeature).toHaveBeenCalledWith(
      "ws-business",
      "automatedAlerts"
    );
    expect(loadPreviousAuditForAlerts).toHaveBeenCalled();
    expect(insertAlertDrafts).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: "ws-business" })
    );
    expect(n).toBe(1);
  });

  it("blocks Free/Pro competitor alert emit even on direct invocation", async () => {
    workspaceAllowsPlanFeature.mockResolvedValue(false);
    const n = await emitAlertsForCompetitorChanges({
      workspaceId: "ws-pro",
      storeId: "s1",
      targetId: "t1",
      snapshotId: "snap1",
      changes: [CHANGE],
    });
    expect(n).toBe(0);
    expect(insertAlertDrafts).not.toHaveBeenCalled();
  });

  it("allows Business competitor alert emit", async () => {
    workspaceAllowsPlanFeature.mockResolvedValue(true);
    insertAlertDrafts.mockResolvedValue([{ id: "a2" }]);
    const n = await emitAlertsForCompetitorChanges({
      workspaceId: "ws-business",
      storeId: "s1",
      targetId: "t1",
      snapshotId: "snap1",
      changes: [CHANGE],
    });
    expect(n).toBe(1);
    expect(insertAlertDrafts).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: "ws-business" })
    );
  });
});
