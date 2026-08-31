import type { BillingPeriod, PlanId } from "@/lib/billing/plans";

/** Build merchant order id without colons (Paymob merchant_order_id). */
export function buildOrderId(
  userId: string,
  planId: Exclude<PlanId, "free">,
  period: BillingPeriod
): string {
  return `sp-${planId}-${period}-${userId}-${Date.now()}`;
}

export function parseOrderId(orderId: string): {
  plan: Exclude<PlanId, "free">;
  period: BillingPeriod;
  userId: string;
} | null {
  const modern = /^sp-(pro|business)-(monthly|yearly)-([0-9a-f-]{36})-(\d+)$/.exec(orderId);
  if (modern) {
    return {
      plan: modern[1] as Exclude<PlanId, "free">,
      period: modern[2] as BillingPeriod,
      userId: modern[3],
    };
  }

  const legacy = /^sp:(pro|business):(monthly|yearly):([0-9a-f-]{36}):(\d+)$/.exec(orderId);
  if (legacy) {
    return {
      plan: legacy[1] as Exclude<PlanId, "free">,
      period: legacy[2] as BillingPeriod,
      userId: legacy[3],
    };
  }

  return null;
}
