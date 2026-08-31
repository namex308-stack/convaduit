"use client";

import Link from "next/link";
import { Bell, FileSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { DashboardPayload } from "@/lib/dashboard/types";
import { sanitizeDisplayName } from "@/lib/auth/display-user";
import { formatSignedDelta } from "@/lib/dashboard/metrics";

function greetingKey(
  hour: number
): "dashboard.goodMorning" | "dashboard.goodAfternoon" | "dashboard.goodEvening" {
  if (hour < 12) return "dashboard.goodMorning";
  if (hour < 18) return "dashboard.goodAfternoon";
  return "dashboard.goodEvening";
}

function buildSummary(
  data: DashboardPayload,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): string | null {
  const parts: string[] = [];

  if (data.stats.latestStoreScore != null) {
    parts.push(
      t("dashboard.summaryScore", { score: data.stats.latestStoreScore })
    );
  }

  const delta = formatSignedDelta(data.kpis.overall.delta);
  if (delta && data.kpis.overall.direction && data.kpis.overall.direction !== "flat") {
    parts.push(
      t(
        data.kpis.overall.direction === "up"
          ? "dashboard.summaryDeltaUp"
          : "dashboard.summaryDeltaDown",
        { delta }
      )
    );
  }

  if (data.stats.openRecommendations > 0) {
    parts.push(
      t("dashboard.summaryOpenIssues", { count: data.stats.openRecommendations })
    );
  } else if (data.stats.completedCount > 0) {
    parts.push(t("dashboard.summaryNoIssues"));
  }

  if (data.stats.auditsLimit != null) {
    const remaining = Math.max(0, data.stats.auditsLimit - data.stats.auditsThisMonth);
    parts.push(t("dashboard.summaryAuditsRemaining", { count: remaining }));
  }

  return parts.length ? parts.join(" · ") : null;
}

export function DashboardSummaryHeader({ data }: { data: DashboardPayload }) {
  const t = useT();
  const firstName =
    sanitizeDisplayName(data.displayName)?.split(/\s+/)[0] || t("report.you");
  const summary = buildSummary(data, t);
  const latestId = data.latestAudit?.id ?? null;
  const reportHref = latestId ? `/audit/${latestId}/report` : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
          {t(greetingKey(new Date().getHours()), { name: firstName })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        {summary ? (
          <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/90">
            {summary}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {data.notificationCount > 0 ? (
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/notifications">
              <Bell className="size-4 me-1.5" />
              {t("dashboard.notifications")}
              <Badge className="ms-2 rounded-full px-1.5 py-0 text-[10px]" variant="secondary">
                {data.notificationCount}
              </Badge>
            </Link>
          </Button>
        ) : null}
        {reportHref ? (
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={reportHref}>
              <FileSearch className="size-4 me-1.5" />
              {t("dashboard.viewReport")}
            </Link>
          </Button>
        ) : null}
        <Button asChild size="sm" className="rounded-full shadow-glow">
          <Link href="/audit/new">
            <Plus className="size-4 me-1.5" />
            {t("dashboard.newAudit")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
