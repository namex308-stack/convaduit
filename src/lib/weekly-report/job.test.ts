import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const workspaceAllowsPlanFeature = vi.fn();
vi.mock("@/lib/billing/workspace-entitlement", () => ({
  workspaceAllowsPlanFeature: (...args: unknown[]) =>
    workspaceAllowsPlanFeature(...args),
}));

const listActiveStoresForWeeklyReport = vi.fn();
const getLatestAuditPairForStore = vi.fn();
const getWeeklyReportByStorePeriod = vi.fn();
const upsertWeeklyReport = vi.fn();
const getWorkspaceOwnerEmail = vi.fn();
const markWeeklyReportEmailSent = vi.fn();

vi.mock("@/lib/db/weekly-report-repository", () => ({
  listActiveStoresForWeeklyReport: (...args: unknown[]) =>
    listActiveStoresForWeeklyReport(...args),
  getLatestAuditPairForStore: (...args: unknown[]) =>
    getLatestAuditPairForStore(...args),
  getWeeklyReportByStorePeriod: (...args: unknown[]) =>
    getWeeklyReportByStorePeriod(...args),
  upsertWeeklyReport: (...args: unknown[]) => upsertWeeklyReport(...args),
  getWorkspaceOwnerEmail: (...args: unknown[]) => getWorkspaceOwnerEmail(...args),
  markWeeklyReportEmailSent: (...args: unknown[]) =>
    markWeeklyReportEmailSent(...args),
}));

vi.mock("@/lib/email", () => ({
  normalizeEmailRecipient: (v: string | null) => v,
  sendTransactionalEmail: vi.fn(async () => ({ ok: false, reason: "disabled" })),
}));

vi.mock("@/lib/notifications/emit", () => ({
  emitWeeklyReportNotification: vi.fn(async () => 0),
}));

vi.mock("./ai-summary", () => ({
  generateAiExecutiveSummary: vi.fn(async () => "ملخص"),
}));

import { runWeeklyReportJob } from "./job";

const FREE_WS = "ws-free";
const PRO_WS = "ws-pro";
const BIZ_WS = "ws-business";

function store(workspaceId: string, storeId: string) {
  return {
    storeId,
    workspaceId,
    storeName: "متجر",
    storeUrl: "https://shop.example",
    lastReportAt: null as string | null,
  };
}

describe("runWeeklyReportJob plan gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listActiveStoresForWeeklyReport.mockResolvedValue([
      store(FREE_WS, "store-free"),
      store(PRO_WS, "store-pro"),
      store(BIZ_WS, "store-biz"),
    ]);
    workspaceAllowsPlanFeature.mockImplementation(
      async (workspaceId: string) => workspaceId === BIZ_WS
    );
    getLatestAuditPairForStore.mockResolvedValue(null);
  });

  it("skips Free and Pro workspaces without generating reports", async () => {
    const result = await runWeeklyReportJob(new Date("2026-08-20T06:00:00.000Z"));

    expect(workspaceAllowsPlanFeature).toHaveBeenCalledWith(
      FREE_WS,
      "weeklyMonitoring",
      expect.any(Map)
    );
    expect(workspaceAllowsPlanFeature).toHaveBeenCalledWith(
      PRO_WS,
      "weeklyMonitoring",
      expect.any(Map)
    );
    expect(workspaceAllowsPlanFeature).toHaveBeenCalledWith(
      BIZ_WS,
      "weeklyMonitoring",
      expect.any(Map)
    );

    // Free/Pro never reach audit pair / upsert paths.
    const calledStoreIds = getLatestAuditPairForStore.mock.calls.map(
      (c: unknown[]) => c[0]
    );
    expect(calledStoreIds).not.toContain("store-free");
    expect(calledStoreIds).not.toContain("store-pro");
    expect(calledStoreIds).toContain("store-biz");
    expect(upsertWeeklyReport).not.toHaveBeenCalled();
    expect(result.skipped).toBeGreaterThanOrEqual(2);
    expect(result.generated).toBe(0);
  });

  it("allows Business workspaces past the entitlement gate", async () => {
    await runWeeklyReportJob(new Date("2026-08-20T06:00:00.000Z"));
    expect(getLatestAuditPairForStore).toHaveBeenCalledWith("store-biz");
  });

  it("direct job invocation cannot bypass Free entitlement", async () => {
    listActiveStoresForWeeklyReport.mockResolvedValue([store(FREE_WS, "store-free")]);
    workspaceAllowsPlanFeature.mockResolvedValue(false);

    const result = await runWeeklyReportJob(new Date("2026-08-20T06:00:00.000Z"));

    expect(result).toMatchObject({
      considered: 1,
      generated: 0,
      skipped: 1,
      failed: 0,
      emailed: 0,
    });
    expect(getLatestAuditPairForStore).not.toHaveBeenCalled();
    expect(upsertWeeklyReport).not.toHaveBeenCalled();
  });
});
