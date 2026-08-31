import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

const HMAC_SECRET = "paymob-test-hmac-secret";
const USER_ID = "11111111-1111-1111-1111-111111111111";
const ORDER_ID = `sp-pro-monthly-${USER_ID}-1700000000000`;

vi.stubEnv("PAYMOB_HMAC_SECRET", HMAC_SECRET);

const activateSubscription = vi.fn();
vi.mock("@/lib/billing/activate-subscription", () => ({
  activateSubscription: (...args: unknown[]) => activateSubscription(...args),
}));

const maybeSingle = vi.fn();
vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle }),
      }),
    }),
  }),
}));

vi.mock("@/lib/site-url", () => ({
  getSiteUrl: () => "https://www.convaudit.com",
  absoluteUrl: (path: string) => `https://www.convaudit.com${path}`,
}));

import {
  concatenateTransactionHmacFields,
  computePaymobHmac,
} from "@/lib/paymob/hmac";
import { GET, POST } from "./route";

function sampleTransaction(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  const { order: orderOverride, ...rest } = overrides;
  return {
    amount_cents: 39900,
    created_at: "2026-01-01T00:00:00.000000",
    currency: "EGP",
    error_occured: false,
    has_parent_transaction: false,
    id: 55,
    integration_id: 19978,
    is_3d_secure: true,
    is_auth: false,
    is_capture: false,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    order:
      orderOverride && typeof orderOverride === "object"
        ? { id: 99, merchant_order_id: ORDER_ID, ...(orderOverride as object) }
        : { id: 99, merchant_order_id: ORDER_ID },
    owner: 1,
    pending: false,
    source_data: { pan: "xxxx", sub_type: "MasterCard", type: "card" },
    success: true,
    ...rest,
  };
}

function sign(obj: Record<string, unknown>): string {
  return computePaymobHmac(HMAC_SECRET, concatenateTransactionHmacFields(obj));
}

function postRequest(obj: Record<string, unknown>, hmac: string): NextRequest {
  return new NextRequest(`http://localhost/api/webhook/paymob?hmac=${hmac}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "TRANSACTION", obj }),
  });
}

describe("POST /api/webhook/paymob", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("activates on a successful HMAC-verified payment", async () => {
    const obj = sampleTransaction();
    maybeSingle.mockResolvedValue({ data: { id: USER_ID }, error: null });
    activateSubscription.mockResolvedValue({ activated: true, alreadyProcessed: false });

    const res = await POST(postRequest(obj, sign(obj)));
    const json = (await res.json()) as { activated: boolean };

    expect(res.status).toBe(200);
    expect(json.activated).toBe(true);
    expect(activateSubscription).toHaveBeenCalledWith(USER_ID, "pro", "monthly", ORDER_ID);
  });

  it("does not activate failed payments", async () => {
    const obj = sampleTransaction({ success: false });
    const res = await POST(postRequest(obj, sign(obj)));
    const json = (await res.json()) as { activated: boolean; reason: string };

    expect(res.status).toBe(200);
    expect(json.activated).toBe(false);
    expect(json.reason).toBe("failed");
    expect(activateSubscription).not.toHaveBeenCalled();
  });

  it("rejects an invalid HMAC", async () => {
    const obj = sampleTransaction();
    const res = await POST(postRequest(obj, "deadbeef"));
    expect(res.status).toBe(401);
    expect(activateSubscription).not.toHaveBeenCalled();
  });

  it("rejects an amount mismatch", async () => {
    const obj = sampleTransaction({ amount_cents: 100 });
    const res = await POST(postRequest(obj, sign(obj)));
    expect(res.status).toBe(422);
    expect(activateSubscription).not.toHaveBeenCalled();
  });

  it("is idempotent for a duplicate webhook", async () => {
    const obj = sampleTransaction();
    maybeSingle.mockResolvedValue({ data: { id: USER_ID }, error: null });
    activateSubscription
      .mockResolvedValueOnce({ activated: true, alreadyProcessed: false })
      .mockResolvedValueOnce({ activated: true, alreadyProcessed: true });

    const first = await POST(postRequest(obj, sign(obj)));
    const second = await POST(postRequest(obj, sign(obj)));
    const firstJson = (await first.json()) as { alreadyProcessed: boolean };
    const secondJson = (await second.json()) as { alreadyProcessed: boolean };

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(firstJson.alreadyProcessed).toBe(false);
    expect(secondJson.alreadyProcessed).toBe(true);
    expect(activateSubscription).toHaveBeenCalledTimes(2);
  });
});

describe("GET /api/webhook/paymob", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects without activating even when query params look successful", async () => {
    const req = new NextRequest(
      `http://localhost/api/webhook/paymob?success=true&merchant_order_id=${ORDER_ID}&hmac=anything`
    );
    const res = await GET(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
    expect(activateSubscription).not.toHaveBeenCalled();
  });
});
