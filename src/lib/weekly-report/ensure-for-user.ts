import "server-only";

import {
  listUserStoresForWeeklyReport,
} from "@/lib/db/weekly-report-repository";
import { weeklyPeriodBounds } from "./build";
import { generateWeeklyReportForStore } from "./job";

export type EnsureWeeklyReportsResult = {
  attempted: number;
  generated: number;
};

/**
 * Generate current-period weekly reports for the signed-in user's stores
 * when cron has not run yet (first visit / empty list).
 */
export async function ensureWeeklyReportsForUser(
  userId: string
): Promise<EnsureWeeklyReportsResult> {
  const stores = await listUserStoresForWeeklyReport(userId);
  if (!stores.length) {
    return { attempted: 0, generated: 0 };
  }

  const { periodStart, periodEnd } = weeklyPeriodBounds();
  const periodStartIso = periodStart.toISOString();
  const periodEndIso = periodEnd.toISOString();

  let generated = 0;
  for (const store of stores) {
    const outcome = await generateWeeklyReportForStore(
      store,
      periodStartIso,
      periodEndIso
    );
    if (outcome.reportId) generated += 1;
  }

  return { attempted: stores.length, generated };
}
