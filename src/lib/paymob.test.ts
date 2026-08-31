import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  concatenateTransactionHmacFields,
  computePaymobHmac,
  verifyTransactionProcessedHmac,
} from "./paymob/hmac";
import { parseOrderId } from "./paymob/order-id";
import {
  evaluatePaymobTransaction,
  expectedAmountCents,
  serverCheckoutAmountEgp,
} from "./paymob/verify";
import {
  createCheckoutUrl,
  getCheckoutEnvironmentError,
  isPublicAppUrl,
} from "./paymob";
import { getCheckoutPrice, PLAN_PRICES } from "./billing/plans";

const HMAC_SECRET = "paymob-test-hmac-secret";
const USER_ID = "11111111-1111-1111-1111-111111111111";
const ORDER_ID = `sp-pro-monthly-${USER_ID}-1700000000000`;

function sampleTransaction(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  const { order: orderOverride, source_data: sourceOverride, ...rest } = overrides;
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
    source_data: {
      pan: "xxxx",
      sub_type: "MasterCard",
      type: "card",
      ...(typeof sourceOverride === "object" && sourceOverride !== null
        ? (sourceOverride as object)
        : {}),
    },
    success: true,
    ...rest,
  };
}

function signTransaction(
  obj: Record<string, unknown>,
  secret = HMAC_SECRET
): string {
  return computePaymobHmac(secret, concatenateTransactionHmacFields(obj));
}

describe("parseOrderId", () => {
  it("parses modern order ids", () => {
    expect(parseOrderId(ORDER_ID)).toEqual({
      plan: "pro",
      period: "monthly",
      userId: USER_ID,
    });
  });

  it("parses legacy colon order ids", () => {
    const id = "sp:business:yearly:22222222-2222-2222-2222-222222222222:1700000000000";
    expect(parseOrderId(id)).toEqual({
      plan: "business",
      period: "yearly",
      userId: "22222222-2222-2222-2222-222222222222",
    });
  });
});

describe("Paymob HMAC", () => {
  it("accepts a valid processed-callback HMAC", () => {
    const obj = sampleTransaction();
    const hmac = signTransaction(obj);
    expect(verifyTransactionProcessedHmac(obj, hmac, HMAC_SECRET)).toBe(true);
  });

  it("rejects an invalid HMAC", () => {
    const obj = sampleTransaction();
    expect(verifyTransactionProcessedHmac(obj, "deadbeef", HMAC_SECRET)).toBe(false);
  });
});

describe("evaluatePaymobTransaction", () => {
  it("accepts a successful paid transaction", () => {
    const obj = sampleTransaction();
    const hmac = signTransaction(obj);
    const result = evaluatePaymobTransaction(obj, hmac, HMAC_SECRET);
    expect(result).toEqual({
      eligible: true,
      orderId: ORDER_ID,
      plan: "pro",
      period: "monthly",
      userId: USER_ID,
      amountCents: 39900,
      currency: "EGP",
      transactionId: "55",
    });
  });

  it("rejects failed payments", () => {
    const obj = sampleTransaction({ success: false });
    const hmac = signTransaction(obj);
    expect(evaluatePaymobTransaction(obj, hmac, HMAC_SECRET)).toEqual({
      eligible: false,
      reason: "failed",
    });
  });

  it("rejects pending payments", () => {
    const obj = sampleTransaction({ pending: true, success: false });
    const hmac = signTransaction(obj);
    expect(evaluatePaymobTransaction(obj, hmac, HMAC_SECRET)).toEqual({
      eligible: false,
      reason: "pending",
    });
  });

  it("rejects HMAC failures before looking at payment fields", () => {
    const obj = sampleTransaction();
    expect(evaluatePaymobTransaction(obj, "not-a-real-hmac", HMAC_SECRET)).toEqual({
      eligible: false,
      reason: "hmac",
    });
  });

  it("rejects amount mismatch even when the order id names a paid plan", () => {
    const obj = sampleTransaction({ amount_cents: 100 });
    const hmac = signTransaction(obj);
    expect(evaluatePaymobTransaction(obj, hmac, HMAC_SECRET)).toEqual({
      eligible: false,
      reason: "amount",
    });
  });

  it("rejects a non-EGP currency", () => {
    const obj = sampleTransaction({ currency: "USD" });
    const hmac = signTransaction(obj);
    expect(evaluatePaymobTransaction(obj, hmac, HMAC_SECRET)).toEqual({
      eligible: false,
      reason: "currency",
    });
  });

  it("rejects a missing payment reference", () => {
    const obj = sampleTransaction({
      order: { id: 99, merchant_order_id: "" },
      merchant_order_id: "",
    });
    const hmac = signTransaction(obj);
    expect(evaluatePaymobTransaction(obj, hmac, HMAC_SECRET)).toEqual({
      eligible: false,
      reason: "reference",
    });
  });
});

describe("customer cannot change the price", () => {
  it("uses PLAN_PRICES and ignores a client-supplied amount", () => {
    expect(serverCheckoutAmountEgp("pro", "monthly", 1)).toBe(PLAN_PRICES.pro.monthly);
    expect(serverCheckoutAmountEgp("pro", "monthly", 1)).toBe(getCheckoutPrice("pro", "monthly"));
    expect(serverCheckoutAmountEgp("business", "yearly", 0)).toBe(9990);
    expect(expectedAmountCents("pro", "monthly")).toBe(39900);
    expect(expectedAmountCents("business", "monthly")).toBe(99900);
  });
});

describe("getCheckoutEnvironmentError / isPublicAppUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects localhost app URLs", () => {
    expect(isPublicAppUrl("http://localhost:3000")).toBe(false);
    expect(isPublicAppUrl("https://app.example.com")).toBe(true);
  });

  it("blocks production checkout when APP_URL is localhost", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYMOB_MODE", "live");
    expect(getCheckoutEnvironmentError("http://localhost:3000")).toMatch(/NEXT_PUBLIC_APP_URL/);
  });

  it("blocks production checkout when PAYMOB_MODE unset", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYMOB_MODE", "");
    expect(getCheckoutEnvironmentError("https://app.example.com")).toMatch(/PAYMOB_MODE/);
  });

  it("allows production when URL and mode are valid", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYMOB_MODE", "live");
    expect(getCheckoutEnvironmentError("https://app.example.com")).toBeNull();
  });
});

describe("createCheckoutUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("creates an iframe URL with server-side amount_cents", async () => {
    vi.stubEnv("PAYMOB_API_KEY", "test-api-key");
    vi.stubEnv("PAYMOB_INTEGRATION_ID", "19978");
    vi.stubEnv("PAYMOB_IFRAME_ID", "4321");
    vi.stubEnv("PAYMOB_HMAC_SECRET", HMAC_SECRET);
    vi.stubEnv("PAYMOB_MODE", "test");

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      if (url.endsWith("/api/auth/tokens")) {
        return Response.json({ token: "auth-tok" });
      }
      if (url.endsWith("/api/ecommerce/orders")) {
        expect(body.amount_cents).toBe(39900);
        expect(body.currency).toBe("EGP");
        expect(body.merchant_order_id).toBe(ORDER_ID);
        return Response.json({ id: 77 });
      }
      if (url.endsWith("/api/acceptance/payment_keys")) {
        expect(body.amount_cents).toBe(39900);
        expect(body.integration_id).toBe(19978);
        expect(body.lock_order_when_paid).toBe(true);
        return Response.json({ token: "pay-tok" });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const url = await createCheckoutUrl({
      orderId: ORDER_ID,
      amount: 399,
      currency: "EGP",
      customerEmail: "owner@example.com",
      planId: "pro",
      period: "monthly",
      successUrl: "https://www.convaudit.com/dashboard",
      failureUrl: "https://www.convaudit.com/checkout?error=payment_failed",
      callbackUrl: "https://www.convaudit.com/api/webhook/paymob",
      webhookUrl: "https://www.convaudit.com/api/webhook/paymob",
    });

    expect(url).toBe(
      "https://accept.paymob.com/api/acceptance/iframes/4321?payment_token=pay-tok"
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
