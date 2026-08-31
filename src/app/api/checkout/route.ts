import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  buildOrderId,
  createCheckoutUrl,
  getCheckoutEnvironmentError,
  getPaymobMode,
  isPaymobConfigured,
  isPaymobPaymentMethodId,
  type PaymobPaymentMethodId,
} from "@/lib/paymob";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { getCheckoutPrice } from "@/lib/billing/plans";
import { activateSubscription } from "@/lib/billing/activate-subscription";
import { buildPostPaymentPath } from "@/lib/billing/upgrade-flow";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

const Body = z.object({
  planId: z.enum(["pro", "business"]),
  period: z.enum(["monthly", "yearly"]),
  paymentMethod: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      console.warn("[api/checkout] invalid request body");
      return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
    }

    const auth = await requireApiUser();
    if (!auth.ok) return auth.response;
    const user = auth.user;

    const { planId, period, paymentMethod: methodId } = parsed.data;
    const appUrl = getSiteUrl();
    // Authoritative price — ignore any client-sent amount.
    const amount = getCheckoutPrice(planId, period);
    const orderId = buildOrderId(user.id, planId, period);

    console.info("[api/checkout] start", {
      userId: user.id,
      planId,
      period,
      amount,
      orderId,
      appUrl,
      paymobMode: getPaymobMode(),
      methodId: methodId ?? null,
      configured: isPaymobConfigured(),
    });

    if (!isPaymobConfigured()) {
      // NODE_ENV !== "production" is required in addition to the mode checks below
      // so a stray PAYMOB_MODE=test left set in a production environment can never
      // auto-activate a paid plan without payment.
      const allowDemo =
        process.env.NODE_ENV !== "production" &&
        (process.env.NODE_ENV === "development" || process.env.PAYMOB_MODE === "test");
      if (allowDemo) {
        console.info("[api/checkout] demo mode activation", { userId: user.id, orderId, planId });
        const demo = await activateSubscription(user.id, planId, period, orderId);
        if (!demo.activated) {
          console.error("[api/checkout] demo activation failed", { orderId });
          return NextResponse.json({ error: "تعذّر تفعيل الخطة التجريبية" }, { status: 500 });
        }
        return NextResponse.json({
          url: buildPostPaymentPath(planId, { orderId, appUrl }),
          demoMode: true,
          message: "لم يتم تهيئة Paymob — تم تفعيل الخطة في الوضع التجريبي.",
        });
      }
      return NextResponse.json(
        {
          error:
            "بوابة الدفع غير مهيأة. أضف PAYMOB_API_KEY وPAYMOB_INTEGRATION_ID وPAYMOB_IFRAME_ID وPAYMOB_HMAC_SECRET.",
        },
        { status: 503 }
      );
    }

    const envError = getCheckoutEnvironmentError(appUrl);
    if (envError) {
      console.error("[api/checkout] environment blocked checkout:", envError);
      return NextResponse.json({ error: envError }, { status: 503 });
    }

    if (methodId && !isPaymobPaymentMethodId(methodId)) {
      return NextResponse.json({ error: "طريقة دفع غير صالحة" }, { status: 400 });
    }

    const callbackUrl = absoluteUrl("/api/webhook/paymob");
    const successUrl = buildPostPaymentPath(planId, { orderId, appUrl });
    const failureUrl = absoluteUrl(
      `/checkout?plan=${planId}&period=${period}&error=payment_failed`
    );

    console.info("[api/checkout] creating Paymob URL", {
      orderId,
      callbackUrl,
      webhookUrl: callbackUrl,
      failureUrl,
      successUrl,
    });

    const url = await createCheckoutUrl({
      orderId,
      amount, // pro: 399/3990 · business: 999/9990 (from PLAN_PRICES)
      currency: "EGP",
      customerEmail: user.email ?? "",
      customerName: user.user_metadata?.full_name as string | undefined,
      customerReference: user.id,
      planId,
      period,
      successUrl,
      failureUrl,
      callbackUrl,
      webhookUrl: callbackUrl,
      paymentMethod: methodId as PaymobPaymentMethodId | undefined,
    });

    if (!url) {
      console.error("[api/checkout] createCheckoutUrl returned null", { orderId });
      return NextResponse.json({ error: "تعذّر إنشاء عملية الدفع" }, { status: 500 });
    }

    console.info("[api/checkout] checkout URL ready", {
      orderId,
      amount,
      currency: "EGP",
      urlHost: (() => {
        try {
          return new URL(url).host;
        } catch {
          return "invalid";
        }
      })(),
    });

    return NextResponse.json({ url, orderId, configured: true, amount, currency: "EGP" });
  } catch (err) {
    console.error("[api/checkout] error:", err);
    return NextResponse.json({ error: "فشلت عملية الدفع" }, { status: 500 });
  }
}
