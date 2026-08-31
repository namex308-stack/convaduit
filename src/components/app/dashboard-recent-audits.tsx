"use client";

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { AuditRowActions } from "@/components/app/audit-row-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useT, type TranslationKey } from "@/lib/i18n";
import { isAuditInProgress, type AuditHistoryItem } from "@/lib/audits/types";
import { displayHostFromUrl } from "@/lib/url-display";
import { decodeHtmlEntities } from "@/lib/text/decode-html";
import { cn } from "@/lib/utils";

function relativeDate(
  iso: string,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - d.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return t("dashboard.today");
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return t("dashboard.hoursAgo", { count: diffHours });
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
  if (diffDays <= 0) return t("dashboard.today");
  if (diffDays === 1) return t("dashboard.yesterday");
  if (diffDays < 7) return t("dashboard.daysAgo", { count: diffDays });
  return t("dashboard.weekAgo");
}

function scoreTone(score: number | null): string {
  if (score == null) return "bg-muted text-muted-foreground";
  if (score >= 80) return "bg-primary/15 text-primary";
  if (score >= 60) return "bg-brand/15 text-brand";
  return "bg-muted text-muted-foreground";
}

function auditHref(audit: AuditHistoryItem): string {
  return isAuditInProgress(audit.status) || audit.status === "failed"
    ? `/audit/${audit.id}/scanning`
    : `/audit/${audit.id}/report`;
}

function AuditIdentity({ audit }: { audit: AuditHistoryItem }) {
  return (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 font-display text-xs font-bold text-primary">
        {decodeHtmlEntities(audit.storeName || audit.productName)
          .slice(0, 2)
          .toUpperCase()}
      </span>
      <span className="min-w-0 text-start">
        <span className="block truncate font-semibold">
          {decodeHtmlEntities(audit.productName)}
        </span>
        <span className="block truncate text-xs text-muted-foreground" dir="ltr">
          {displayHostFromUrl(audit.productUrl) || decodeHtmlEntities(audit.storeName)}
        </span>
      </span>
    </>
  );
}

export function DashboardRecentAudits({
  audits,
  onDeleted,
}: {
  audits: AuditHistoryItem[];
  onDeleted: () => void;
}) {
  const t = useT();

  if (!audits.length) {
    return (
      <div className="p-10 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Search className="size-5" />
        </span>
        <p className="mt-4 font-display text-base font-bold">{t("dashboard.emptyRecentTitle")}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("dashboard.emptyDecisionBody")}</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/audit/new">{t("dashboard.runFirstAudit")}</Link>
        </Button>
      </div>
    );
  }

  const rows = audits.slice(0, 5);

  return (
    <>
      <ul className="divide-y divide-border/50 md:hidden">
        {rows.map((audit) => (
          <li key={audit.id}>
            <div className="flex items-center gap-3 px-4 py-4">
              <Link href={auditHref(audit)} className="flex min-w-0 flex-1 items-center gap-3">
                <AuditIdentity audit={audit} />
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-grid size-9 place-items-center rounded-full text-xs font-bold tabular-nums",
                    scoreTone(audit.overallScore)
                  )}
                >
                  {audit.overallScore ?? t("dashboard.kpiEmptyValue")}
                </span>
                <AuditRowActions
                  auditId={audit.id}
                  status={audit.status ?? "completed"}
                  onDeleted={onDeleted}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-4 text-xs text-muted-foreground">
              <span>
                {t("dashboard.colIssues")}:{" "}
                <span className="font-semibold text-primary tabular-nums">
                  {audit.openIssues ?? 0}
                </span>
              </span>
              <span>
                {t("dashboard.colPages")}:{" "}
                <span className="font-semibold tabular-nums">{audit.pageCount ?? 0}</span>
              </span>
              <span>{relativeDate(audit.completedAt || audit.createdAt, t)}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[560px] text-start text-sm">
          <thead>
            <tr className="border-b border-border/50 text-start text-[11px] tracking-wider text-muted-foreground">
              <th className="px-5 py-3 text-start font-semibold sm:px-6">{t("dashboard.colAudit")}</th>
              <th className="px-3 py-3 text-start font-semibold">{t("dashboard.colScore")}</th>
              <th className="hidden px-3 py-3 text-start font-semibold lg:table-cell">
                {t("dashboard.colPages")}
              </th>
              <th className="px-3 py-3 text-start font-semibold">{t("dashboard.colIssues")}</th>
              <th className="px-3 py-3 text-start font-semibold">{t("dashboard.colDate")}</th>
              <th className="w-24 px-4 py-3 text-end" />
            </tr>
          </thead>
          <tbody>
            {rows.map((audit) => (
              <tr
                key={audit.id}
                className="border-b border-border/50 transition-colors last:border-0 hover:bg-accent/30"
              >
                <td className="px-5 py-3.5 text-start sm:px-6">
                  <Link href={auditHref(audit)} className="flex min-w-0 items-center gap-3">
                    <AuditIdentity audit={audit} />
                  </Link>
                </td>
                <td className="px-3 py-3.5 text-start">
                  <span
                    className={cn(
                      "inline-grid size-9 place-items-center rounded-full text-xs font-bold tabular-nums",
                      scoreTone(audit.overallScore)
                    )}
                  >
                    {audit.overallScore ?? t("dashboard.kpiEmptyValue")}
                  </span>
                </td>
                <td className="hidden px-3 py-3.5 text-start tabular-nums text-muted-foreground lg:table-cell">
                  {audit.pageCount ?? 0}
                </td>
                <td className="px-3 py-3.5 text-start font-medium tabular-nums text-primary">
                  {audit.openIssues ?? 0}
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-start text-muted-foreground">
                  {relativeDate(audit.completedAt || audit.createdAt, t)}
                </td>
                <td className="px-2 py-3.5 text-end">
                  <div className="inline-flex items-center justify-end gap-0.5">
                    <AuditRowActions
                      auditId={audit.id}
                      status={audit.status ?? "completed"}
                      onDeleted={onDeleted}
                    />
                    <Link
                      href={auditHref(audit)}
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                      aria-label={t("dashboard.viewReport")}
                    >
                      <ChevronRight className="size-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
