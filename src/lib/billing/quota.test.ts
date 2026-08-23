import { afterEach, describe, expect, it, vi } from "vitest";
import {
  aiLimitReachedMessage,
  auditLimitReachedMessage,
  isUnderQuota,
  shouldBypassAuditQuota,
  shouldSkipUsageQuotaCheck,
} from "@/lib/billing/quota";
import { PLAN_LIMITS } from "@/lib/billing/plans";

describe("isUnderQuota", () => {
  it("treats a null limit as unlimited (legacy)", () => {
    expect(isUnderQuota(0, null)).toBe(true);
    expect(isUnderQuota(10_000, null)).toBe(true);
  });

  it("allows usage strictly below the limit", () => {
    expect(isUnderQuota(0, 3)).toBe(true);
    expect(isUnderQuota(2, 3)).toBe(true);
  });

  it("blocks usage at or above the limit", () => {
    expect(isUnderQuota(3, 3)).toBe(false);
    expect(isUnderQuota(4, 3)).toBe(false);
  });

  it("matches Free/Pro/Business plan boundaries", () => {
    const { free, pro, business } = PLAN_LIMITS;
    expect(isUnderQuota(free.auditsPerMonth - 1, free.auditsPerMonth)).toBe(true);
    expect(isUnderQuota(free.auditsPerMonth, free.auditsPerMonth)).toBe(false);
    expect(isUnderQuota(pro.auditsPerMonth - 1, pro.auditsPerMonth)).toBe(true);
    expect(isUnderQuota(pro.auditsPerMonth, pro.auditsPerMonth)).toBe(false);
    expect(isUnderQuota(business.auditsPerMonth - 1, business.auditsPerMonth)).toBe(true);
    expect(isUnderQuota(business.auditsPerMonth, business.auditsPerMonth)).toBe(false);

    expect(isUnderQuota(pro.aiGensPerMonth - 1, pro.aiGensPerMonth)).toBe(true);
    expect(isUnderQuota(pro.aiGensPerMonth, pro.aiGensPerMonth)).toBe(false);
    expect(isUnderQuota(business.aiGensPerMonth - 1, business.aiGensPerMonth)).toBe(true);
    expect(isUnderQuota(business.aiGensPerMonth, business.aiGensPerMonth)).toBe(false);
  });
});

describe("development audit quota bypass", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("bypasses monthly audit quota outside production", () => {
    expect(shouldBypassAuditQuota({ NODE_ENV: "development" })).toBe(true);
    expect(shouldBypassAuditQuota({ NODE_ENV: "test" })).toBe(true);
    expect(shouldSkipUsageQuotaCheck("audit", { NODE_ENV: "development" })).toBe(true);
    expect(PLAN_LIMITS.free.auditsPerMonth).toBe(3);
    // Exhausted Free plan usage would still be under quota when bypassed via null limit.
    expect(isUnderQuota(PLAN_LIMITS.free.auditsPerMonth, null)).toBe(true);
  });

  it("does not bypass AI generation quota checks in development", () => {
    expect(shouldSkipUsageQuotaCheck("ai_generation", { NODE_ENV: "development" })).toBe(false);
  });

  it("never bypasses monthly audit quota in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(shouldBypassAuditQuota()).toBe(false);
    expect(shouldSkipUsageQuotaCheck("audit")).toBe(false);
    expect(PLAN_LIMITS.free.auditsPerMonth).toBe(3);
    expect(isUnderQuota(3, PLAN_LIMITS.free.auditsPerMonth)).toBe(false);
  });
});

describe("auditLimitReachedMessage", () => {
  it("returns an Arabic message including the plan name and usage", () => {
    const message = auditLimitReachedMessage("مجاني", 3, 3);
    expect(message).toContain("مجاني");
    expect(message).toContain("3/3");
  });
});

describe("aiLimitReachedMessage", () => {
  it("returns an Arabic message including the plan name and usage", () => {
    const message = aiLimitReachedMessage("احترافي", 100, 100);
    expect(message).toContain("احترافي");
    expect(message).toContain("100/100");
  });
});
