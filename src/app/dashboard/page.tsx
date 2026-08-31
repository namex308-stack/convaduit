"use client";

import { PageShell, PageContent } from "@/components/app/page-shell";
import { DashboardSkeleton } from "@/components/app/dashboard-skeleton";
import { DashboardView } from "@/components/app/dashboard-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { DashboardPayload } from "@/lib/dashboard/types";

export default function DashboardPage() {
  const t = useT();
  const { data, error, needsAuth, needsUpgrade, loading, retry } = useApiQuery({
    url: "/api/dashboard",
    parse: (json) => (json as { dashboard: DashboardPayload }).dashboard,
    fallbackError: t("dashboard.loadError"),
    signInMessage: t("dashboard.signInToView"),
  });

  return (
    <PageShell>
      <PageContent className="space-y-6">
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
      </PageContent>
    </PageShell>
  );
}
