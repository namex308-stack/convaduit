"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, ChevronLeft } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { WeeklyReportListItem } from "@/lib/weekly-report/types";
import { cn } from "@/lib/utils";
import { decodeHtmlEntities } from "@/lib/text/decode-html";

export default function WeeklyReportsPage() {
  const t = useT();
  const { data: reports, error, needsAuth, needsUpgrade, loading, retry } = useApiQuery({
    url: "/api/weekly-report",
    parse: (json) => (json as { reports: WeeklyReportListItem[] }).reports ?? [],
    fallbackError: t("weeklyReport.loadError"),
    signInMessage: t("weeklyReport.signInRequired"),
  });

  return (
    <PageShell>
      <PageHeader
        title={t("weeklyReport.title")}
        subtitle={t("weeklyReport.subtitle")}
        icon={FileText}
        back="/dashboard"
      />
      <PageContent className="max-w-3xl space-y-4">
        <ApiPageBody
          error={error}
          needsAuth={needsAuth}
          needsUpgrade={needsUpgrade}
          loading={loading}
          onRetry={retry}
        >
          {reports &&
            (reports.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center space-y-4">
                  <p className="text-sm text-muted-foreground">{t("weeklyReport.empty")}</p>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/audit/new">{t("weeklyReport.startAudit")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-3">
                {reports.map((report) => (
                  <li key={report.id}>
                    <Link
                      href={`/reports/weekly/${report.id}`}
                      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Card className="transition-colors hover:border-primary/30">
                        <CardContent className="flex items-center justify-between gap-4 py-5">
                          <div className="min-w-0">
                            <p className="font-display font-bold truncate">
                              {decodeHtmlEntities(report.storeName)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {report.periodStart.slice(0, 10)} → {report.periodEnd.slice(0, 10)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("weeklyReport.meaningfulCount", {
                                count: report.meaningfulChangeCount,
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "tabular-nums",
                                (report.overallDelta ?? 0) > 0 &&
                                  "bg-emerald-500/15 text-emerald-700",
                                (report.overallDelta ?? 0) < 0 &&
                                  "bg-rose-500/15 text-rose-700"
                              )}
                            >
                              {report.overallScore ?? "—"}
                              {report.overallDelta != null
                                ? ` (${report.overallDelta > 0 ? "+" : ""}${report.overallDelta})`
                                : ""}
                            </Badge>
                            <ChevronLeft className="size-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
        </ApiPageBody>
      </PageContent>
    </PageShell>
  );
}
