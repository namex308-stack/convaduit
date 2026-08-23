import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { markAlertReadForUser } from "@/lib/db/alerts-repository";
import { getPlanForUser } from "@/lib/db/workspace-stats";
import {
  featureLockedBody,
  isPlanFeatureEnabled,
} from "@/lib/billing/entitlements";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const plan = await getPlanForUser(auth.user.id);
  if (!isPlanFeatureEnabled(plan, "automatedAlerts")) {
    return NextResponse.json(featureLockedBody("automatedAlerts", plan.planId), {
      status: 403,
    });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "معرّف التنبيه مطلوب." }, { status: 400 });
  }

  let body: { isRead?: boolean } = {};
  try {
    body = (await request.json()) as { isRead?: boolean };
  } catch {
    body = {};
  }

  if (body.isRead !== true) {
    return NextResponse.json(
      { error: "حالياً يُدعم تعليم التنبيه كمقروء فقط." },
      { status: 400 }
    );
  }

  const alert = await markAlertReadForUser(id, auth.user.id);
  if (!alert) {
    return NextResponse.json({ error: "التنبيه غير موجود." }, { status: 404 });
  }

  return NextResponse.json({ alert });
}
