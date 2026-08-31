import "server-only";
import type { BillingPeriod } from "@/lib/billing/plans";
import {
  getPaymobIntegrationId,
  type PaymobPaymentMethodId,
} from "@/lib/paymob/methods";
import { egpToCents } from "@/lib/paymob/verify";

export { buildOrderId, parseOrderId } from "@/lib/paymob/order-id";
export {
  evaluatePaymobTransaction,
  expectedAmountCents,
  serverCheckoutAmountEgp,
} from "@/lib/paymob/verify";
export { isPaymobPaymentMethodId } from "@/lib/paymob/methods";
export type { PaymobPaymentMethodId };

const PAYMOB_API_BASE = "https://accept.paymob.com";

interface PaymobConfig {
  apiKey: string;
  iframeId: string;
  hmacSecret: string;
  integrationId: number;
  mode: "live" | "test";
}

function normalizePaymobMode(raw: string | undefined): "live" | "test" {
  if (raw === "live") return "live";
  return "test";
}

function getConfig(): PaymobConfig | null {
  const apiKey = process.env.PAYMOB_API_KEY?.trim();
  const iframeId = process.env.PAYMOB_IFRAME_ID?.trim();
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET?.trim();
  const integrationId = Number.parseInt(process.env.PAYMOB_INTEGRATION_ID?.trim() ?? "", 10);
  if (!apiKey || !iframeId || !hmacSecret) return null;
  if (!Number.isFinite(integrationId) || integrationId <= 0) return null;
  return {
    apiKey,
    iframeId,
    hmacSecret,
    integrationId,
    mode: normalizePaymobMode(process.env.PAYMOB_MODE),
  };
}

export function isPaymobConfigured(): boolean {
  return getConfig() !== null;
}

export function getPaymobMode(): "live" | "test" {
  return normalizePaymobMode(process.env.PAYMOB_MODE);
}

/** True when PAYMOB_MODE is explicitly set (required in production). */
export function isPaymobModeExplicit(): boolean {
  const raw = process.env.PAYMOB_MODE?.trim().toLowerCase();
  return raw === "live" || raw === "test";
}

/**
 * APP_URL used for Paymob redirection / processed callbacks must be publicly reachable
 * in production — localhost callbacks never receive Paymob server webhooks.
 */
export function isPublicAppUrl(appUrl: string): boolean {
  try {
    const u = new URL(appUrl);
    if (/^(localhost|127\.0\.0\.1)$/i.test(u.hostname)) return false;
    if (process.env.NODE_ENV === "production" && u.protocol !== "https:") return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Production gate for live checkout: public HTTPS APP_URL + explicit PAYMOB_MODE.
 * Returns an error message when checkout must be blocked; null when OK.
 */
export function getCheckoutEnvironmentError(appUrl: string): string | null {
  if (process.env.NODE_ENV !== "production") return null;
  if (!isPublicAppUrl(appUrl)) {
    return (
      "يجب أن يكون NEXT_PUBLIC_APP_URL رابط HTTPS عامًا في بيئة الإنتاج " +
      "(وليس localhost). لا يمكن لخطافات Paymob وإعادة التوجيه الوصول إلى روابط محلية."
    );
  }
  if (!isPaymobModeExplicit()) {
    return (
      "يجب تحديد PAYMOB_MODE صريحًا في بيئة الإنتاج إلى \"live\" أو \"test\". " +
      "القيمة غير المحددة تُستخدم كـ test افتراضيًا وقد لا تتوافق مع مفاتيح التاجر الفعلية."
    );
  }
  return null;
}

export interface CheckoutParams {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName?: string;
  customerReference?: string;
  planId: string;
  period: BillingPeriod;
  successUrl: string;
  failureUrl: string;
  callbackUrl: string;
  webhookUrl: string;
  paymentMethod?: PaymobPaymentMethodId;
}

function splitName(full?: string): { first_name: string; last_name: string } {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "Customer", last_name: "ConvAudit" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "ConvAudit" };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

async function paymobJson<T>(
  path: string,
  body: Record<string, unknown>
): Promise<{ ok: true; data: T } | { ok: false; status: number; data: unknown }> {
  const res = await fetch(`${PAYMOB_API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) return { ok: false, status: res.status, data };
  return { ok: true, data: data as T };
}

/**
 * Create a Paymob iframe checkout URL (auth token → order → payment key).
 * Amount is expected in EGP (same units as PLAN_PRICES); converted to cents for Paymob.
 */
export async function createCheckoutUrl(params: CheckoutParams): Promise<string | null> {
  const config = getConfig();
  if (!config) {
    console.error("[paymob] createCheckoutUrl: not configured");
    return null;
  }

  const currency = params.currency ?? "EGP";
  if (currency !== "EGP") {
    console.error("[paymob] unsupported currency", { currency, orderId: params.orderId });
    return null;
  }

  const amountCents = egpToCents(params.amount);
  const integrationId =
    getPaymobIntegrationId(params.paymentMethod) ?? config.integrationId;
  const names = splitName(params.customerName);

  console.info("[paymob] createCheckoutUrl start", {
    orderId: params.orderId,
    planId: params.planId,
    period: params.period,
    amount: params.amount,
    amountCents,
    mode: config.mode,
    integrationId,
    paymentMethod: params.paymentMethod ?? "default",
  });

  try {
    const auth = await paymobJson<{ token?: string }>("/api/auth/tokens", {
      api_key: config.apiKey,
    });
    if (!auth.ok || !auth.data.token) {
      console.error("[paymob] auth token failed", { status: auth.ok ? 200 : auth.status });
      return null;
    }
    const authToken = auth.data.token;

    const order = await paymobJson<{ id?: number }>("/api/ecommerce/orders", {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency,
      merchant_order_id: params.orderId,
      items: [],
    });
    if (!order.ok || order.data.id == null) {
      console.error("[paymob] create order failed", {
        status: order.ok ? 200 : order.status,
        orderId: params.orderId,
      });
      return null;
    }

    const paymentKey = await paymobJson<{ token?: string }>("/api/acceptance/payment_keys", {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: order.data.id,
      billing_data: {
        apartment: "NA",
        email: params.customerEmail || "billing@convaudit.com",
        floor: "NA",
        first_name: names.first_name,
        street: "NA",
        building: "NA",
        phone_number: "+201000000000",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "EG",
        last_name: names.last_name,
        state: "NA",
      },
      currency,
      integration_id: integrationId,
      lock_order_when_paid: true,
      redirection_url: params.callbackUrl,
    });
    if (!paymentKey.ok || !paymentKey.data.token) {
      console.error("[paymob] payment key failed", {
        status: paymentKey.ok ? 200 : paymentKey.status,
        orderId: params.orderId,
      });
      return null;
    }

    const url = `${PAYMOB_API_BASE}/api/acceptance/iframes/${encodeURIComponent(config.iframeId)}?payment_token=${encodeURIComponent(paymentKey.data.token)}`;
    console.info("[paymob] checkout URL ready", {
      orderId: params.orderId,
      paymobOrderId: order.data.id,
      iframeId: config.iframeId,
      webhookUrl: params.webhookUrl,
    });
    return url;
  } catch (err) {
    console.error("[paymob] createCheckoutUrl error:", err);
    return null;
  }
}
