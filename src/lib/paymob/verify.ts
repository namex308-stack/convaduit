import { getCheckoutPrice, type BillingPeriod, type PlanId } from "@/lib/billing/plans";
import { parseOrderId } from "@/lib/paymob/order-id";
import { verifyTransactionProcessedHmac } from "@/lib/paymob/hmac";

export type PaidPlan = Exclude<PlanId, "free">;

export type PaymobEvalFailure =
  | "hmac"
  | "failed"
  | "pending"
  | "voided"
  | "refunded"
  | "error"
  | "amount"
  | "currency"
  | "reference"
  | "plan_mismatch";

export type PaymobEvalResult =
  | {
      eligible: true;
      orderId: string;
      plan: PaidPlan;
      period: BillingPeriod;
      userId: string;
      amountCents: number;
      currency: "EGP";
      transactionId: string;
    }
  | { eligible: false; reason: PaymobEvalFailure };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function firstNonEmptyString(candidates: unknown[]): string {
  for (const c of candidates) {
    if (c == null || c === "") continue;
    if (typeof c === "object") continue;
    const s = String(c).trim();
    if (s) return s;
  }
  return "";
}

export function asPaymobBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const n = value.trim().toLowerCase();
    return n === "true" || n === "1";
  }
  return false;
}

export function egpToCents(amountEgp: number): number {
  return Math.round(amountEgp * 100);
}

export function expectedAmountCents(plan: PaidPlan, period: BillingPeriod): number {
  return egpToCents(getCheckoutPrice(plan, period));
}

export function unwrapPaymobTransaction(event: Record<string, unknown>): Record<string, unknown> {
  return asRecord(event.obj) ?? event;
}

export function extractMerchantOrderId(obj: Record<string, unknown>): string {
  const order = asRecord(obj.order);
  return firstNonEmptyString([
    obj.merchant_order_id,
    order?.merchant_order_id,
    obj.merchantOrderId,
    order?.merchantOrderId,
  ]);
}

export function extractAmountCents(obj: Record<string, unknown>): number | null {
  const raw = obj.amount_cents ?? obj.amountCents;
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function extractCurrency(obj: Record<string, unknown>): string {
  const order = asRecord(obj.order);
  return firstNonEmptyString([obj.currency, order?.currency]).toUpperCase();
}

export function extractTransactionId(obj: Record<string, unknown>): string {
  return firstNonEmptyString([obj.id, obj.transaction_id]);
}

/**
 * Server-side eligibility: HMAC, success flags, currency, amount, and payment reference.
 * Does not write to the database.
 */
export function evaluatePaymobTransaction(
  obj: Record<string, unknown>,
  receivedHmac: string,
  secret?: string | null
): PaymobEvalResult {
  if (!verifyTransactionProcessedHmac(obj, receivedHmac, secret ?? undefined)) {
    return { eligible: false, reason: "hmac" };
  }

  if (asPaymobBool(obj.pending)) {
    return { eligible: false, reason: "pending" };
  }
  if (asPaymobBool(obj.error_occured) || asPaymobBool(obj.error_occurred)) {
    return { eligible: false, reason: "error" };
  }
  if (asPaymobBool(obj.is_voided)) {
    return { eligible: false, reason: "voided" };
  }
  if (asPaymobBool(obj.is_refunded)) {
    return { eligible: false, reason: "refunded" };
  }
  if (!asPaymobBool(obj.success)) {
    return { eligible: false, reason: "failed" };
  }

  const currency = extractCurrency(obj);
  if (currency !== "EGP") {
    return { eligible: false, reason: "currency" };
  }

  const orderId = extractMerchantOrderId(obj);
  const parsed = orderId ? parseOrderId(orderId) : null;
  if (!parsed) {
    return { eligible: false, reason: "reference" };
  }

  const amountCents = extractAmountCents(obj);
  const expected = expectedAmountCents(parsed.plan, parsed.period);
  if (amountCents == null || amountCents !== expected) {
    return { eligible: false, reason: "amount" };
  }

  return {
    eligible: true,
    orderId,
    plan: parsed.plan,
    period: parsed.period,
    userId: parsed.userId,
    amountCents,
    currency: "EGP",
    transactionId: extractTransactionId(obj),
  };
}

/** Client-supplied amounts are ignored; checkout always uses PLAN_PRICES. */
export function serverCheckoutAmountEgp(
  planId: PaidPlan,
  period: BillingPeriod,
  _clientAmount?: unknown
): number {
  return getCheckoutPrice(planId, period);
}
