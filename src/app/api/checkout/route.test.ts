import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

const requireApiUser = vi.fn();
vi.mock("@/lib/auth/require-api-user", () => ({
  requireApiUser: (...args: unknown[]) => requireApiUser(...args),
}));

const createCheckoutUrl = vi.fn();
vi.mock("@/lib/paymob", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/paymob")>();
  return {
    ...actual,
    createCheckoutUrl: (...args: unknown[]) => createCheckoutUrl(...args),
    isPaymobConfigured: () => true,
    getCheckoutEnvironmentError: () => null,
  };
});

const activateSubscription = vi.fn();
vi.mock("@/lib/billing/activate-subscription", () => ({
  activateSubscription: (...args: unknown[]) => activateSubscription(...args),
}));

vi.mock("@/lib/site-url", () => ({
  getSiteUrl: () => "https://www.convaudit.com",
  absoluteUrl: (path: string) => `https://www.convaudit.com${path}`,
}));

import { POST } from "./route";

const USER_ID = "11111111-1111-1111-1111-111111111111";

function checkoutRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/checkout", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("ignores a client-supplied amount and charges PLAN_PRICES", async () => {
    requireApiUser.mockResolvedValue({
      ok: true,
      user: { id: USER_ID, email: "owner@example.com", user_metadata: {} },
    });
    createCheckoutUrl.mockResolvedValue(
      "https://accept.paymob.com/api/acceptance/iframes/1?payment_token=tok"
    );

    const res = await POST(
      checkoutRequest({
        planId: "pro",
        period: "monthly",
        amount: 1,
        currency: "USD",
        paymentMethod: "credit_card",
      })
    );
    const json = (await res.json()) as { amount: number; currency: string };

    expect(res.status).toBe(200);
    expect(json.amount).toBe(399);
    expect(json.currency).toBe("EGP");
    expect(createCheckoutUrl).toHaveBeenCalledTimes(1);
    expect(createCheckoutUrl.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        amount: 399,
        currency: "EGP",
        planId: "pro",
        period: "monthly",
        paymentMethod: "credit_card",
      })
    );
    expect(activateSubscription).not.toHaveBeenCalled();
  });
});
