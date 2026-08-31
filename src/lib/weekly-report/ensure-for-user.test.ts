import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const listUserStoresForWeeklyReport = vi.fn();
vi.mock("@/lib/db/weekly-report-repository", () => ({
  listUserStoresForWeeklyReport: (...args: unknown[]) =>
    listUserStoresForWeeklyReport(...args),
}));

const generateWeeklyReportForStore = vi.fn();
vi.mock("./job", () => ({
  generateWeeklyReportForStore: (...args: unknown[]) =>
    generateWeeklyReportForStore(...args),
}));

import { ensureWeeklyReportsForUser } from "./ensure-for-user";

describe("ensureWeeklyReportsForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zero when user has no eligible stores", async () => {
    listUserStoresForWeeklyReport.mockResolvedValue([]);
    await expect(ensureWeeklyReportsForUser("user-1")).resolves.toEqual({
      attempted: 0,
      generated: 0,
    });
    expect(generateWeeklyReportForStore).not.toHaveBeenCalled();
  });

  it("generates a report for each eligible store", async () => {
    listUserStoresForWeeklyReport.mockResolvedValue([
      {
        storeId: "s1",
        workspaceId: "ws-1",
        storeName: "متجر",
        storeUrl: "https://shop.test",
        lastReportAt: null,
      },
    ]);
    generateWeeklyReportForStore.mockResolvedValue({
      reportId: "r1",
      emailed: false,
      failed: false,
      reused: false,
    });

    await expect(ensureWeeklyReportsForUser("user-1")).resolves.toEqual({
      attempted: 1,
      generated: 1,
    });
    expect(generateWeeklyReportForStore).toHaveBeenCalledOnce();
  });
});
