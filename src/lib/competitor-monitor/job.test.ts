import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const workspaceAllowsPlanFeature = vi.fn();
vi.mock("@/lib/billing/workspace-entitlement", () => ({
  workspaceAllowsPlanFeature: (...args: unknown[]) =>
    workspaceAllowsPlanFeature(...args),
}));

const syncCompetitorTargetsFromAudits = vi.fn();
const listDueCompetitorTargets = vi.fn();
const touchCompetitorTarget = vi.fn();
const insertCompetitorSnapshot = vi.fn();
const insertCompetitorChanges = vi.fn();
const loadCompetitorPageFromAudits = vi.fn();

vi.mock("@/lib/db/competitor-monitor-repository", () => ({
  syncCompetitorTargetsFromAudits: (...args: unknown[]) =>
    syncCompetitorTargetsFromAudits(...args),
  listDueCompetitorTargets: (...args: unknown[]) =>
    listDueCompetitorTargets(...args),
  touchCompetitorTarget: (...args: unknown[]) => touchCompetitorTarget(...args),
  insertCompetitorSnapshot: (...args: unknown[]) =>
    insertCompetitorSnapshot(...args),
  insertCompetitorChanges: (...args: unknown[]) =>
    insertCompetitorChanges(...args),
  loadCompetitorPageFromAudits: (...args: unknown[]) =>
    loadCompetitorPageFromAudits(...args),
}));

vi.mock("@/lib/alerts/emit", () => ({
  emitAlertsForCompetitorChanges: vi.fn(async () => 0),
}));

vi.mock("@/lib/firecrawl", () => ({
  crawlWithFallback: vi.fn(),
}));

vi.mock("./crawl-policy", () => ({
  isCompetitorCrawlAllowed: () => false,
}));

import { runCompetitorMonitorJob } from "./job";

const FREE_WS = "ws-free";
const PRO_WS = "ws-pro";
const BIZ_WS = "ws-business";

function target(workspaceId: string, id: string) {
  return {
    id,
    workspaceId,
    storeId: "store-1",
    label: "Competitor",
    url: "https://competitor.example",
    isActive: true,
    cadenceHours: 24,
    lastCheckedAt: null,
    lastChangedAt: null,
    lastSnapshotSignals: null,
    lastSnapshotId: null,
  };
}

describe("runCompetitorMonitorJob plan gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    syncCompetitorTargetsFromAudits.mockResolvedValue(0);
    touchCompetitorTarget.mockResolvedValue(undefined);
    workspaceAllowsPlanFeature.mockImplementation(
      async (workspaceId: string) => workspaceId === BIZ_WS
    );
    listDueCompetitorTargets.mockResolvedValue([
      target(FREE_WS, "t-free"),
      target(PRO_WS, "t-pro"),
      target(BIZ_WS, "t-biz"),
    ]);
    // Business target: no page → processTarget fails soft without writing success path.
    loadCompetitorPageFromAudits.mockResolvedValue(null);
  });

  it("skips Free and Pro targets and advances cadence without processing", async () => {
    const result = await runCompetitorMonitorJob(
      new Date("2026-08-20T07:00:00.000Z")
    );

    expect(workspaceAllowsPlanFeature).toHaveBeenCalledWith(
      FREE_WS,
      "competitorMonitoring",
      expect.any(Map)
    );
    expect(workspaceAllowsPlanFeature).toHaveBeenCalledWith(
      PRO_WS,
      "competitorMonitoring",
      expect.any(Map)
    );
    expect(workspaceAllowsPlanFeature).toHaveBeenCalledWith(
      BIZ_WS,
      "competitorMonitoring",
      expect.any(Map)
    );

    expect(touchCompetitorTarget).toHaveBeenCalledWith({
      targetId: "t-free",
      changed: false,
    });
    expect(touchCompetitorTarget).toHaveBeenCalledWith({
      targetId: "t-pro",
      changed: false,
    });
    expect(result.skipped).toBeGreaterThanOrEqual(2);
    expect(insertCompetitorChanges).not.toHaveBeenCalled();
  });

  it("allows Business targets past the entitlement gate", async () => {
    await runCompetitorMonitorJob(new Date("2026-08-20T07:00:00.000Z"));
    expect(loadCompetitorPageFromAudits).toHaveBeenCalledWith(
      BIZ_WS,
      "https://competitor.example"
    );
  });

  it("direct job invocation cannot bypass Pro entitlement", async () => {
    listDueCompetitorTargets.mockResolvedValue([target(PRO_WS, "t-pro")]);
    workspaceAllowsPlanFeature.mockResolvedValue(false);

    const result = await runCompetitorMonitorJob(
      new Date("2026-08-20T07:00:00.000Z")
    );

    expect(result.skipped).toBe(1);
    expect(result.checked).toBe(0);
    expect(loadCompetitorPageFromAudits).not.toHaveBeenCalled();
    expect(insertCompetitorSnapshot).not.toHaveBeenCalled();
  });
});
