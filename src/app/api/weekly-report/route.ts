import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { listWeeklyReportsForUser } from "@/lib/db/weekly-report-repository";
import { getPlanForUser } from "@/lib/db/workspace-stats";
import {
  featureLockedBody,
  isPlanFeatureEnabled,
} from "@/lib/billing/entitlements";
import { ensureWeeklyReportsForUser } from "@/lib/weekly-report/ensure-for-user";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const plan = await getPlanForUser(auth.user.id);
  if (!isPlanFeatureEnabled(plan, "weeklyMonitoring")) {
    return NextResponse.json(featureLockedBody("weeklyMonitoring", plan.planId), {
      status: 403,
    });
  }

  let reports = await listWeeklyReportsForUser(auth.user.id, 30);
  if (!reports.length) {
    await ensureWeeklyReportsForUser(auth.user.id);
    reports = await listWeeklyReportsForUser(auth.user.id, 30);
  }

  return NextResponse.json({ reports });
}
