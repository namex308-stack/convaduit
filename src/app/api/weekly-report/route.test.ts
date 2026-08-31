import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { ENTITLEMENT_CODES } from "@/lib/billing/entitlements";
import { PLAN_LIMITS } from "@/lib/billing/plans";

vi.mock("server-only", () => ({}));

const requireApiUser = vi.fn();
vi.mock("@/lib/auth/require-api-user", () => ({
  requireApiUser: (...args: unknown[]) => requireApiUser(...args),
}));

const getPlanForUser = vi.fn();
vi.mock("@/lib/db/workspace-stats", () => ({
  getPlanForUser: (...args: unknown[]) => getPlanForUser(...args),
}));

const listWeeklyReportsForUser = vi.fn();
const getWeeklyReportForUser = vi.fn();
vi.mock("@/lib/db/weekly-report-repository", () => ({
  listWeeklyReportsForUser: (...args: unknown[]) =>
    listWeeklyReportsForUser(...args),
  getWeeklyReportForUser: (...args: unknown[]) => getWeeklyReportForUser(...args),
}));

const ensureWeeklyReportsForUser = vi.fn();
vi.mock("@/lib/weekly-report/ensure-for-user", () => ({
  ensureWeeklyReportsForUser: (...args: unknown[]) =>
    ensureWeeklyReportsForUser(...args),
}));

import { GET as listWeeklyReports } from "./route";
import { GET as getWeeklyReport } from "./[id]/route";

const USER = { id: "user-1" };

const FREE_PLAN = {
  planId: "free" as const,
  displayName: "مجاني",
  auditsPerMonth: PLAN_LIMITS.free.auditsPerMonth,
  aiGensPerMonth: PLAN_LIMITS.free.aiGensPerMonth,
  storesLimit: PLAN_LIMITS.free.storesLimit,
  features: {
    aiGenerator: false,
    competitor: false,
    api: false,
    competitorMonitoring: false,
    weeklyMonitoring: false,
    automatedAlerts: false,
  },
};

const PRO_PLAN = {
  ...FREE_PLAN,
  planId: "pro" as const,
  displayName: "احترافي",
  auditsPerMonth: PLAN_LIMITS.pro.auditsPerMonth,
  aiGensPerMonth: PLAN_LIMITS.pro.aiGensPerMonth,
  storesLimit: PLAN_LIMITS.pro.storesLimit,
  features: {
    ...FREE_PLAN.features,
    aiGenerator: true,
    competitor: true,
  },
};

const BUSINESS_PLAN = {
  ...PRO_PLAN,
  planId: "business" as const,
  displayName: "أعمال",
  auditsPerMonth: PLAN_LIMITS.business.auditsPerMonth,
  aiGensPerMonth: PLAN_LIMITS.business.aiGensPerMonth,
  storesLimit: PLAN_LIMITS.business.storesLimit,
  features: {
    aiGenerator: true,
    competitor: true,
    api: true,
    competitorMonitoring: true,
    weeklyMonitoring: true,
    automatedAlerts: true,
  },
};

describe("GET /api/weekly-report entitlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUser.mockResolvedValue({ ok: true, user: USER });
    listWeeklyReportsForUser.mockResolvedValue([]);
    ensureWeeklyReportsForUser.mockResolvedValue({ attempted: 0, generated: 0 });
  });

  it("blocks Free with WEEKLY_MONITORING_LOCKED", async () => {
    getPlanForUser.mockResolvedValue(FREE_PLAN);
    const res = await listWeeklyReports();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe(ENTITLEMENT_CODES.WEEKLY_MONITORING_LOCKED);
    expect(listWeeklyReportsForUser).not.toHaveBeenCalled();
  });

  it("blocks Pro with WEEKLY_MONITORING_LOCKED", async () => {
    getPlanForUser.mockResolvedValue(PRO_PLAN);
    const res = await listWeeklyReports();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe(ENTITLEMENT_CODES.WEEKLY_MONITORING_LOCKED);
    expect(listWeeklyReportsForUser).not.toHaveBeenCalled();
  });

  it("allows Business", async () => {
    getPlanForUser.mockResolvedValue(BUSINESS_PLAN);
    listWeeklyReportsForUser.mockResolvedValue([{ id: "r1" }]);
    const res = await listWeeklyReports();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reports).toEqual([{ id: "r1" }]);
    expect(listWeeklyReportsForUser).toHaveBeenCalledWith(USER.id, 30);
    expect(ensureWeeklyReportsForUser).not.toHaveBeenCalled();
  });

  it("generates on first visit when Business list is empty", async () => {
    getPlanForUser.mockResolvedValue(BUSINESS_PLAN);
    listWeeklyReportsForUser
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "r-new" }]);
    ensureWeeklyReportsForUser.mockResolvedValue({ attempted: 1, generated: 1 });

    const res = await listWeeklyReports();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reports).toEqual([{ id: "r-new" }]);
    expect(ensureWeeklyReportsForUser).toHaveBeenCalledWith(USER.id);
    expect(listWeeklyReportsForUser).toHaveBeenCalledTimes(2);
  });
});

describe("GET /api/weekly-report/[id] entitlement + isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUser.mockResolvedValue({ ok: true, user: USER });
  });

  it("blocks Free before lookup (direct API cannot bypass)", async () => {
    getPlanForUser.mockResolvedValue(FREE_PLAN);
    const res = await getWeeklyReport(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000001" }),
    });
    expect(res.status).toBe(403);
    expect(getWeeklyReportForUser).not.toHaveBeenCalled();
  });

  it("blocks Pro before lookup", async () => {
    getPlanForUser.mockResolvedValue(PRO_PLAN);
    const res = await getWeeklyReport(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000001" }),
    });
    expect(res.status).toBe(403);
    expect(getWeeklyReportForUser).not.toHaveBeenCalled();
  });

  it("returns 404 for unauthorized workspace report (Business member isolation)", async () => {
    getPlanForUser.mockResolvedValue(BUSINESS_PLAN);
    getWeeklyReportForUser.mockResolvedValue(null);
    const res = await getWeeklyReport(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000099" }),
    });
    expect(res.status).toBe(404);
    expect(getWeeklyReportForUser).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000099",
      USER.id
    );
  });

  it("allows Business when report belongs to user workspace", async () => {
    getPlanForUser.mockResolvedValue(BUSINESS_PLAN);
    getWeeklyReportForUser.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000001",
      workspaceId: "ws-biz",
      storeId: "s1",
      periodStart: "2026-08-01",
      periodEnd: "2026-08-08",
      latestAuditId: "a1",
      previousAuditId: null,
      status: "ready",
      generatedAt: "2026-08-08T06:00:00.000Z",
      emailSentAt: null,
      payload: { storeId: "s1" },
      emailHtml: null,
    });
    const res = await getWeeklyReport(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000001" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.report.id).toBe("00000000-0000-4000-8000-000000000001");
  });

  it("rejects unauthenticated callers", async () => {
    requireApiUser.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    });
    const res = await getWeeklyReport(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "00000000-0000-4000-8000-000000000001" }),
    });
    expect(res.status).toBe(401);
    expect(getPlanForUser).not.toHaveBeenCalled();
  });
});
