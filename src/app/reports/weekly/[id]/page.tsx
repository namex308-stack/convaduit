"use client";

import { useParams } from "next/navigation";
import { FileText } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { WeeklyReportView } from "@/components/app/weekly-report-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { WeeklyReportPayload } from "@/lib/weekly-report/types";

type ReportResponse = {
  id: string;
  latestAuditId: string | null;
  periodStart: string;
  periodEnd: string;
  payload: WeeklyReportPayload;
};

export default function WeeklyReportDetailPage() {
  const t = useT();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: report, error, needsAuth, needsUpgrade, loading, retry } = useApiQuery({
    url: `/api/weekly-report/${id}`,
    parse: (json) => (json as { report: ReportResponse }).report,
    fallbackError: t("weeklyReport.loadError"),
    signInMessage: t("weeklyReport.signInRequired"),
    notFoundMessage: t("weeklyReport.notFound"),
    enabled: Boolean(id),
    deps: [id],
  });

  return (
    <PageShell>
      <PageHeader
        title={report?.payload.storeName || t("weeklyReport.title")}
        subtitle={
          report
            ? `${report.periodStart.slice(0, 10)} → ${report.periodEnd.slice(0, 10)}`
            : t("weeklyReport.subtitle")
        }
        icon={FileText}
        back="/reports/weekly"
      />
      <PageContent className="max-w-4xl">
        <ApiPageBody
          error={error}
          needsAuth={needsAuth}
          needsUpgrade={needsUpgrade}
          loading={loading}
          onRetry={retry}
        >
          {report && (
            <WeeklyReportView
              reportId={report.id}
              payload={report.payload}
              latestAuditId={report.latestAuditId}
            />
          )}
        </ApiPageBody>
      </PageContent>
    </PageShell>
  );
}
