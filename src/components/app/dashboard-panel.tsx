"use client";

import { DashboardSkeleton } from "@/components/app/dashboard-skeleton";
import { DashboardView } from "@/components/app/dashboard-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { DashboardPayload } from "@/lib/dashboard/types";

export function DashboardPanel({ initial }: { initial: DashboardPayload }) {
  const t = useT();
  const { data, error, needsAuth, needsUpgrade, loading, retry } = useApiQuery({
    url: "/api/dashboard",
    parse: (json) => (json as { dashboard: DashboardPayload }).dashboard,
    fallbackError: t("dashboard.loadError"),
    signInMessage: t("dashboard.signInToView"),
    initialData: initial,
  });

  return (
    <ApiPageBody
      error={error}
      needsAuth={needsAuth}
      needsUpgrade={needsUpgrade}
      loading={loading}
      onRetry={retry}
      skeleton={<DashboardSkeleton />}
    >
      {data ? <DashboardView data={data} onRefresh={retry} /> : null}
    </ApiPageBody>
  );
}
