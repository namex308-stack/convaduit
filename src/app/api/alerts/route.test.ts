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

const listAlertsForUser = vi.fn();
const markAllAlertsReadForUser = vi.fn();
const markAlertReadForUser = vi.fn();
vi.mock("@/lib/db/alerts-repository", () => ({
  listAlertsForUser: (...args: unknown[]) => listAlertsForUser(...args),
  markAllAlertsReadForUser: (...args: unknown[]) =>
    markAllAlertsReadForUser(...args),
  markAlertReadForUser: (...args: unknown[]) => markAlertReadForUser(...args),
}));

import { GET as listAlerts, PATCH as patchAlerts } from "./route";
import { PATCH as patchAlertById } from "./[id]/route";

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

describe("GET /api/alerts entitlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUser.mockResolvedValue({ ok: true, user: USER });
    listAlertsForUser.mockResolvedValue([]);
  });

  it("blocks Free with AUTOMATED_ALERTS_LOCKED", async () => {
    getPlanForUser.mockResolvedValue(FREE_PLAN);
    const res = await listAlerts();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe(ENTITLEMENT_CODES.AUTOMATED_ALERTS_LOCKED);
    expect(listAlertsForUser).not.toHaveBeenCalled();
  });

  it("blocks Pro with AUTOMATED_ALERTS_LOCKED", async () => {
    getPlanForUser.mockResolvedValue(PRO_PLAN);
    const res = await listAlerts();
    expect(res.status).toBe(403);
    expect(listAlertsForUser).not.toHaveBeenCalled();
  });

  it("allows Business", async () => {
    getPlanForUser.mockResolvedValue(BUSINESS_PLAN);
    listAlertsForUser.mockResolvedValue([{ id: "a1", isRead: false }]);
    const res = await listAlerts();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.alerts.unreadCount).toBe(1);
    expect(listAlertsForUser).toHaveBeenCalledWith(USER.id, 60);
  });
});

describe("PATCH /api/alerts entitlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUser.mockResolvedValue({ ok: true, user: USER });
  });

  it("blocks Pro mark-all (direct API cannot bypass)", async () => {
    getPlanForUser.mockResolvedValue(PRO_PLAN);
    const res = await patchAlerts(
      new Request("http://localhost/api/alerts", {
        method: "PATCH",
        body: JSON.stringify({ action: "read_all" }),
      })
    );
    expect(res.status).toBe(403);
    expect(markAllAlertsReadForUser).not.toHaveBeenCalled();
  });

  it("allows Business mark-all", async () => {
    getPlanForUser.mockResolvedValue(BUSINESS_PLAN);
    markAllAlertsReadForUser.mockResolvedValue(3);
    const res = await patchAlerts(
      new Request("http://localhost/api/alerts", {
        method: "PATCH",
        body: JSON.stringify({ action: "read_all" }),
      })
    );
    expect(res.status).toBe(200);
    expect(markAllAlertsReadForUser).toHaveBeenCalledWith(USER.id);
  });
});

describe("PATCH /api/alerts/[id] entitlement + isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUser.mockResolvedValue({ ok: true, user: USER });
  });

  it("blocks Free before mutation", async () => {
    getPlanForUser.mockResolvedValue(FREE_PLAN);
    const res = await patchAlertById(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ isRead: true }),
      }),
      { params: Promise.resolve({ id: "alert-1" }) }
    );
    expect(res.status).toBe(403);
    expect(markAlertReadForUser).not.toHaveBeenCalled();
  });

  it("returns 404 for alert outside user workspaces", async () => {
    getPlanForUser.mockResolvedValue(BUSINESS_PLAN);
    markAlertReadForUser.mockResolvedValue(null);
    const res = await patchAlertById(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ isRead: true }),
      }),
      { params: Promise.resolve({ id: "other-ws-alert" }) }
    );
    expect(res.status).toBe(404);
    expect(markAlertReadForUser).toHaveBeenCalledWith("other-ws-alert", USER.id);
  });

  it("rejects unauthenticated callers", async () => {
    requireApiUser.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    });
    const res = await patchAlertById(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ isRead: true }),
      }),
      { params: Promise.resolve({ id: "alert-1" }) }
    );
    expect(res.status).toBe(401);
    expect(getPlanForUser).not.toHaveBeenCalled();
  });
});
