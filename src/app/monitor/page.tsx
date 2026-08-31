"use client";

import * as React from "react";
import { Swords } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { CompetitorMonitorOverviewView } from "@/components/app/competitor-monitor-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { CompetitorMonitorOverview } from "@/lib/competitor-monitor/types";

export default function CompetitorMonitorPage() {
  const t = useT();
  const { data: monitor, error, needsAuth, needsUpgrade, loading, retry } = useApiQuery({
    url: "/api/competitor-monitor",
    parse: (json) => (json as { monitor: CompetitorMonitorOverview }).monitor,
    fallbackError: t("monitor.loadError"),
    signInMessage: t("monitor.signInRequired"),
  });

  return (
    <PageShell>
      <PageHeader
        title={t("monitor.title")}
        subtitle={t("monitor.subtitle")}
        icon={Swords}
        back="/dashboard"
      />
      <PageContent className="max-w-4xl">
        <ApiPageBody
          error={error}
          needsAuth={needsAuth}
          needsUpgrade={needsUpgrade}
          loading={loading}
          onRetry={retry}
        >
          {monitor && <CompetitorMonitorOverviewView monitor={monitor} />}
        </ApiPageBody>
      </PageContent>
    </PageShell>
  );
}
