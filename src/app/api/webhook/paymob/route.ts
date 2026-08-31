import { NextRequest, NextResponse } from "next/server";
import { parseOrderId } from "@/lib/paymob/order-id";
import {
  evaluatePaymobTransaction,
  unwrapPaymobTransaction,
} from "@/lib/paymob/verify";
import { buildPostPaymentPath } from "@/lib/billing/upgrade-flow";
import { getSupabaseAdmin } from "@/lib/supabase";
import { activateSubscription } from "@/lib/billing/activate-subscription";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

async function activateVerifiedPayment(evalResult: {
  orderId: string;
  plan: "pro" | "business";
  period: "monthly" | "yearly";
  userId: string;
}): Promise<{ activated: boolean; alreadyProcessed: boolean }> {
  const { orderId, plan, period, userId } = evalResult;
  console.info("[webhook/paymob] activate start", { orderId, plan, period, userId });

  const sb = getSupabaseAdmin();
  if (!sb) {
    console.error("[webhook/paymob] Supabase admin client unavailable", { orderId, userId });
    return { activated: false, alreadyProcessed: false };
  }

  const { data: profile, error: profileLookupError } = await sb
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileLookupError) {
    console.error("[webhook/paymob] profile lookup failed:", {
      userId,
      error: profileLookupError.message,
    });
    return { activated: false, alreadyProcessed: false };
  }

  if (!profile) {
    console.error("[webhook/paymob] user not found:", userId);
    return { activated: false, alreadyProcessed: false };
  }

  const result = await activateSubscription(profile.id, plan, period, orderId);
  console.info("[webhook/paymob] activateSubscription result", {
    orderId,
    userId,
    plan,
    period,
    activated: result.activated,
    alreadyProcessed: result.alreadyProcessed,
  });
  return result;
}

/** Paymob processed callback — HMAC verify, then activate. */
export async function POST(req: NextRequest) {
  try {
    const hmac = req.nextUrl.searchParams.get("hmac") ?? "";
    const rawBody = await req.text();

    console.info("[webhook/paymob] POST received", {
      bodyBytes: rawBody.length,
      hasHmac: !!hmac,
    });

    const event = JSON.parse(rawBody) as Record<string, unknown>;
    const type = typeof event.type === "string" ? event.type.toUpperCase() : "TRANSACTION";
    if (type && type !== "TRANSACTION") {
      console.info("[webhook/paymob] ignoring non-transaction event", { type });
      return NextResponse.json({ received: true });
    }

    const obj = unwrapPaymobTransaction(event);
    const evaluated = evaluatePaymobTransaction(obj, hmac);

    if (!evaluated.eligible) {
      if (evaluated.reason === "hmac") {
        console.error("[webhook/paymob] invalid HMAC");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      if (
        evaluated.reason === "failed" ||
        evaluated.reason === "pending" ||
        evaluated.reason === "voided" ||
        evaluated.reason === "refunded" ||
        evaluated.reason === "error"
      ) {
        console.info("[webhook/paymob] non-success transaction — no activation", {
          reason: evaluated.reason,
        });
        return NextResponse.json({ received: true, activated: false, reason: evaluated.reason });
      }
      console.error("[webhook/paymob] refusing activation", { reason: evaluated.reason });
      return NextResponse.json(
        { error: "Payment verification failed", reason: evaluated.reason },
        { status: 422 }
      );
    }

    const result = await activateVerifiedPayment(evaluated);
    if (!result.activated) {
      return NextResponse.json({ error: "Activation failed" }, { status: 502 });
    }

    return NextResponse.json({
      received: true,
      activated: true,
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (err) {
    console.error("[webhook/paymob] error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/** Paymob browser redirect (response callback). Never activates entitlements. */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const successRaw = searchParams.get("success") ?? "";
    const success = successRaw.toLowerCase() === "true" || successRaw === "1";
    const orderId =
      searchParams.get("merchant_order_id") ??
      searchParams.get("merchantOrderId") ??
      "";

    console.info("[webhook/paymob] GET redirect callback", {
      success,
      orderId: orderId || null,
      queryKeys: [...searchParams.keys()],
    });

    const appUrl = getSiteUrl();
    const parsed = orderId ? parseOrderId(orderId) : null;
    const plan = parsed?.plan ?? "pro";

    if (success) {
      const dest = buildPostPaymentPath(plan, {
        orderId: orderId || undefined,
        appUrl,
      });
      console.info("[webhook/paymob] redirecting to success", { dest, plan });
      return NextResponse.redirect(dest);
    }

    const failureDest = absoluteUrl("/checkout?error=payment_failed");
    console.info("[webhook/paymob] redirecting to failure", { failureDest });
    return NextResponse.redirect(failureDest);
  } catch (err) {
    console.error("[webhook/paymob] GET callback error:", err);
    return NextResponse.redirect(absoluteUrl("/checkout?error=payment_failed"));
  }
}
