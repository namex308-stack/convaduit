"use client";

import { useParams } from "next/navigation";
import { Swords } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { CompetitorTargetDetailView } from "@/components/app/competitor-monitor-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { CompetitorTargetDetail } from "@/lib/competitor-monitor/types";

export default function CompetitorMonitorDetailPage() {
  const t = useT();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: detail, error, needsAuth, needsUpgrade, loading, retry } = useApiQuery({
    url: `/api/competitor-monitor/${id}`,
    parse: (json) => (json as { detail: CompetitorTargetDetail }).detail,
    fallbackError: t("monitor.loadError"),
    signInMessage: t("monitor.signInRequired"),
    notFoundMessage: t("monitor.notFound"),
    enabled: Boolean(id),
    deps: [id],
  });

  return (
    <PageShell>
      <PageHeader
        title={detail?.target.label || detail?.target.url || t("monitor.title")}
        subtitle={t("monitor.subtitle")}
        icon={Swords}
        back="/monitor"
      />
      <PageContent className="max-w-4xl">
        <ApiPageBody
          error={error}
          needsAuth={needsAuth}
          needsUpgrade={needsUpgrade}
          loading={loading}
          onRetry={retry}
        >
          {detail && <CompetitorTargetDetailView detail={detail} />}
        </ApiPageBody>
      </PageContent>
    </PageShell>
  );
}
