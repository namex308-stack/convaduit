"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  FileSearch,
  Gauge,
  Minus,
  PieChart,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Swords,
  TrendingUp,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { ScoreTrendPoint } from "@/components/app/score-trend-chart";
import { DashboardRecentAudits } from "@/components/app/dashboard-recent-audits";
import { DashboardSummaryHeader } from "@/components/app/dashboard-summary-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { localizedPlanName } from "@/lib/billing/localized-plan-name";
import type { PlanId } from "@/lib/billing/plans";
import { useT, type TranslationKey } from "@/lib/i18n";
import { useLocale } from "@/lib/locale/resolve";
import type {
  DashboardMetric,
  DashboardMetricSource,
  DashboardPayload,
  DashboardPillars,
} from "@/lib/dashboard/types";
import {
  defaultTrendRange,
  formatSignedDelta,
  trendSupportsRangeFilter,
} from "@/lib/dashboard/metrics";
import { filterTrendByMonths, labelTrendPoints } from "@/lib/dashboard/trend";
import { cn } from "@/lib/utils";
import { decodeHtmlEntities } from "@/lib/text/decode-html";

const ScoreTrendChart = dynamic(
  () =>
    import("@/components/app/score-trend-chart").then((m) => ({
      default: m.ScoreTrendChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-xl bg-muted/40" aria-hidden />
    ),
  }
);

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

function sourceKey(source: DashboardMetricSource): TranslationKey {
  switch (source) {
    case "audits":
      return "dashboard.source.audits";
    case "reports":
      return "dashboard.source.reports";
    case "audit_scores":
      return "dashboard.source.audit_scores";
    case "usage_events":
      return "dashboard.source.usage_events";
    case "recommendations":
      return "dashboard.source.recommendations";
    case "geo_signals":
      return "dashboard.source.geo_signals";
    case "audit_pages":
      return "dashboard.source.audit_pages";
    default: {
      const _exhaustive: never = source;
      return _exhaustive;
    }
  }
}

function PlanRing({ pct, pctLabel }: { pct: number; pctLabel: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const safePct = Math.max(0, Math.round(pct));
  const ringPct = Math.min(100, safePct);
  const offset = c - (ringPct / 100) * c;
  const overQuota = safePct > 100;
  return (
    <div className="relative size-[120px]">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" className="text-muted/60" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          className={overQuota ? "text-rose-500" : "text-primary"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className={cn(
              "font-display text-xl font-extrabold tabular-nums leading-none",
              overQuota && "text-rose-600"
            )}
          >
            {safePct}%
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {pctLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeltaLine({
  metric,
  emptyLabel,
  compare,
}: {
  metric: DashboardMetric;
  emptyLabel: string;
  compare: "previous-audit" | "last-month";
}) {
  const t = useT();
  const signed = formatSignedDelta(metric.delta);
  if (metric.value == null) {
    return <p className="mt-1.5 text-xs text-muted-foreground">{emptyLabel}</p>;
  }
  if (metric.direction == null || signed == null) {
    return <p className="mt-1.5 text-xs text-muted-foreground">{t("dashboard.deltaNone")}</p>;
  }
  if (metric.direction === "flat") {
    return (
      <p className="mt-1.5 flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
        <Minus className="size-3.5" />
        {t("dashboard.deltaFlat")}
      </p>
    );
  }
  const label =
    compare === "last-month"
      ? t("dashboard.deltaVsLastMonth", { delta: signed })
      : t("dashboard.deltaVsPrevious", { delta: signed });
  return (
    <p
      className={cn(
        "mt-1.5 flex items-center gap-0.5 text-xs font-medium",
        metric.direction === "up" ? "text-emerald-600" : "text-rose-600"
      )}
    >
      {metric.direction === "up" ? (
        <ArrowUpRight className="size-3.5" />
      ) : (
        <ArrowDownRight className="size-3.5" />
      )}
      {label}
    </p>
  );
}

function KpiCard({
  label,
  value,
  meaning,
  metric,
  emptyLabel,
  extra,
  hideDelta,
  icon: Icon,
  iconClass,
  delay,
  reduceMotion,
  emphasis = false,
}: {
  label: string;
  value: string;
  meaning: string;
  metric: DashboardMetric;
  emptyLabel: string;
  extra?: React.ReactNode;
  hideDelta?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  delay: number;
  reduceMotion: boolean | null;
  emphasis?: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full p-4 transition-colors hover:border-primary/20",
          emphasis && "border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className={cn("grid size-9 place-items-center rounded-xl", iconClass)}>
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-3 text-xs font-medium text-muted-foreground">{label}</p>
        <div
          className={cn(
            "mt-1 font-display font-extrabold tracking-tight tabular-nums",
            emphasis ? "text-3xl" : "text-2xl"
          )}
        >
          {value}
        </div>
        {hideDelta ? null : (
          <DeltaLine metric={metric} emptyLabel={emptyLabel} compare="previous-audit" />
        )}
        {extra}
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{meaning}</p>
      </Card>
    </motion.div>
  );
}

function severityBadgeClass(severity: "critical" | "warning" | "opportunity"): string {
  switch (severity) {
    case "critical":
      return "bg-rose-500/15 text-rose-700";
    case "warning":
      return "bg-amber-500/15 text-amber-800";
    case "opportunity":
      return "bg-sky-500/15 text-sky-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function severityLabel(
  severity: "critical" | "warning" | "opportunity",
  t: (key: TranslationKey) => string
): string {
  switch (severity) {
    case "critical":
      return t("severity.critical");
    case "warning":
      return t("severity.warning");
    case "opportunity":
      return t("severity.opportunity");
    default: {
      const _exhaustive: never = severity;
      return _exhaustive;
    }
  }
}

const PILLAR_ROWS: Array<{
  key: keyof DashboardPillars;
  labelKey: TranslationKey;
}> = [
  { key: "seo", labelKey: "dashboard.kpiSeo" },
  { key: "geo", labelKey: "dashboard.kpiGeo" },
  { key: "conversion", labelKey: "dashboard.kpiConversion" },
  { key: "trust", labelKey: "dashboard.kpiTrust" },
];

function PillarBars({
  latest,
  previous,
  t,
}: {
  latest: DashboardPillars;
  previous: DashboardPillars | null;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  return (
    <ul className="space-y-3">
      {PILLAR_ROWS.map((row) => {
        const value = latest[row.key];
        const prev = previous?.[row.key] ?? null;
        const width = value == null ? 0 : Math.max(0, Math.min(100, value));
        const delta = value != null && prev != null ? value - prev : null;
        const signed = formatSignedDelta(delta);
        return (
          <li key={row.key}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-medium">{t(row.labelKey)}</span>
              <span className="tabular-nums text-muted-foreground">
                {value == null ? t("dashboard.kpiEmptyValue") : `${value}`}
                {signed ? (
                  <span
                    className={cn(
                      "ms-1.5",
                      delta != null && delta > 0
                        ? "text-emerald-600"
                        : delta != null && delta < 0
                          ? "text-rose-600"
                          : ""
                    )}
                  >
                    {signed}
                  </span>
                ) : prev != null ? (
                  <span className="ms-1.5">{t("dashboard.pillarPrevious", { value: prev })}</span>
                ) : null}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function WorkspaceEmpty({ t }: { t: (key: TranslationKey) => string }) {
  return (
    <Card>
      <CardContent className="px-6 py-14 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <FileSearch className="size-6" />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold">{t("dashboard.emptyWorkspaceTitle")}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("dashboard.emptyWorkspaceBody")}
        </p>
        <Button asChild className="mt-6 rounded-xl shadow-glow">
          <Link href="/audit/new">{t("dashboard.runFirstAudit")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function DashboardView({
  data,
  onRefresh,
}: {
  data: DashboardPayload;
  onRefresh: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const planLabel = localizedPlanName(data.plan.displayName, t, data.plan.planId);
  const [range, setRange] = React.useState<"3" | "6" | "12">(() => defaultTrendRange(data.trend));

  const latestId = data.latestAudit?.id ?? null;
  const generateHref = latestId ? `/audit/${latestId}/generate` : "/audit/new";
  const compareHref = latestId ? `/audit/${latestId}/compare` : "/audit/new";
  const reportHref = latestId ? `/audit/${latestId}/report` : "/audit/new";
  const showRangeFilter = trendSupportsRangeFilter(data.trend);
  const months = range === "3" ? 3 : range === "6" ? 6 : 12;

  const chartData = React.useMemo(() => {
    if (!data.trend.length) return [];
    const filtered = showRangeFilter ? filterTrendByMonths(data.trend, months) : data.trend;
    return labelTrendPoints(
      filtered.map((p) => ({ score: p.score, date: p.date })),
      locale
    );
  }, [data.trend, months, showRangeFilter, locale]);

  const hasTrendHistory = data.trend.length >= 2;
  const rangeHasChart = chartData.length >= 2;

  const planFeatures = React.useMemo(() => {
    const auditsLabel =
      data.plan.auditsPerMonth == null
        ? t("dashboard.featureUnlimited")
        : `${data.stats.auditsThisMonth} / ${data.plan.auditsPerMonth}`;
    const aiLabel =
      data.plan.aiGensPerMonth == null
        ? t("dashboard.featureUnlimited")
        : data.plan.features.aiGenerator
          ? `${data.plan.aiGensPerMonth}${t("dashboard.perMonthShort")}`
          : t("dashboard.featureLocked");
    const storesLabel =
      data.plan.storesLimit == null ? t("dashboard.featureUnlimited") : String(data.plan.storesLimit);
    return [
      { label: t("dashboard.auditsLabel"), value: auditsLabel },
      { label: t("nav.aiGenerator"), value: aiLabel },
      {
        label: t("nav.competitors"),
        value: data.plan.features.competitor
          ? t("dashboard.featureIncluded")
          : t("dashboard.featureLocked"),
      },
      { label: t("dashboard.storesLimit"), value: storesLabel },
    ];
  }, [data, t]);

  const emptyWorkspace = data.stats.totalAudits === 0 && data.recent.length === 0;
  const needAudit = t("dashboard.kpiNeedAudit");
  const auditsRemaining =
    data.stats.auditsLimit != null
      ? Math.max(0, data.stats.auditsLimit - data.stats.auditsThisMonth)
      : null;

  const openIssuesMetric: DashboardMetric = {
    value: data.stats.openRecommendations,
    previous: null,
    delta: null,
    direction: null,
    source: "recommendations",
    asOf: data.latestAudit?.completedAt ?? null,
  };

  const pagesMetric: DashboardMetric = {
    value: data.stats.pagesScanned,
    previous: null,
    delta: null,
    direction: null,
    source: "audit_pages",
    asOf: data.latestAudit?.completedAt ?? null,
  };

  const primaryKpis = [
    {
      key: "overall" as const,
      label: t("dashboard.kpiScore"),
      metric: data.kpis.overall,
      meaning: t("dashboard.kpiScoreHint"),
      value:
        data.kpis.overall.value != null
          ? t("dashboard.kpiOutOf", { value: data.kpis.overall.value })
          : t("dashboard.kpiEmptyValue"),
      emptyLabel: needAudit,
      icon: Gauge,
      iconClass: "bg-primary/15 text-primary",
      hideDelta: false,
      emphasis: true,
      extra: undefined as React.ReactNode,
    },
    {
      key: "issues" as const,
      label: t("dashboard.kpiIssues"),
      metric: openIssuesMetric,
      meaning: t("dashboard.kpiIssuesHint"),
      value: String(data.stats.openRecommendations),
      emptyLabel: t("dashboard.noOpenIssues"),
      icon: AlertTriangle,
      iconClass: "bg-rose-500/10 text-rose-600",
      hideDelta: true,
      emphasis: false,
      extra:
        data.stats.openRecommendations > 0 && latestId ? (
          <Button asChild variant="link" size="sm" className="mt-1 h-auto px-0 text-xs">
            <Link href={reportHref}>{t("dashboard.fixCta")}</Link>
          </Button>
        ) : undefined,
    },
    {
      key: "geo" as const,
      label: t("dashboard.kpiGeo"),
      metric: data.kpis.geo,
      meaning: t("dashboard.kpiGeoHint"),
      value:
        data.kpis.geo.value != null
          ? t("dashboard.kpiOutOf", { value: data.kpis.geo.value })
          : t("dashboard.kpiEmptyValue"),
      emptyLabel: needAudit,
      icon: PieChart,
      iconClass: "bg-gold/25 text-gold-foreground",
      hideDelta: false,
      emphasis: false,
      extra: undefined as React.ReactNode,
    },
    {
      key: "quota" as const,
      label: t("dashboard.auditsMonth"),
      metric: data.kpis.audits,
      meaning:
        auditsRemaining != null
          ? t("dashboard.remaining", { count: auditsRemaining })
          : t("dashboard.kpiAuditsMeaning"),
      value:
        data.stats.auditsLimit != null
          ? `${data.stats.auditsThisMonth} / ${data.stats.auditsLimit}`
          : String(data.stats.auditsThisMonth),
      emptyLabel: needAudit,
      icon: TrendingUp,
      iconClass: "bg-brand/10 text-brand",
      hideDelta: true,
      emphasis: false,
      extra: (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {t("dashboard.monthVolumeCompare", {
            current: data.stats.auditsThisMonth,
            previous: data.stats.auditsLastMonth,
          })}
        </p>
      ),
    },
  ];

  const secondaryKpis = [
    {
      key: "seo" as const,
      label: t("dashboard.kpiSeo"),
      metric: data.kpis.seo,
      meaning: t("dashboard.kpiSeoHint"),
      value:
        data.kpis.seo.value != null
          ? t("dashboard.kpiOutOf", { value: data.kpis.seo.value })
          : t("dashboard.kpiEmptyValue"),
      emptyLabel: needAudit,
      icon: Search,
      iconClass: "bg-brand/15 text-brand",
    },
    {
      key: "conversion" as const,
      label: t("dashboard.kpiConversion"),
      metric: data.kpis.conversion,
      meaning: t("dashboard.kpiConversionHint"),
      value:
        data.kpis.conversion.value != null
          ? t("dashboard.kpiOutOf", { value: data.kpis.conversion.value })
          : t("dashboard.kpiEmptyValue"),
      emptyLabel: needAudit,
      icon: ShoppingBag,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      key: "trust" as const,
      label: t("dashboard.kpiTrust"),
      metric: data.kpis.trust,
      meaning: t("dashboard.kpiTrustHint"),
      value:
        data.kpis.trust.value != null
          ? t("dashboard.kpiOutOf", { value: data.kpis.trust.value })
          : t("dashboard.kpiEmptyValue"),
      emptyLabel: needAudit,
      icon: ShieldCheck,
      iconClass: "bg-muted text-muted-foreground",
    },
    {
      key: "pages" as const,
      label: t("dashboard.kpiPages"),
      metric: pagesMetric,
      meaning: t("dashboard.pagesScannedHint"),
      value: String(data.stats.pagesScanned),
      emptyLabel: needAudit,
      icon: FileSearch,
      iconClass: "bg-muted text-muted-foreground",
    },
  ];

  if (emptyWorkspace) {
    return (
      <div className="space-y-6">
        <DashboardSummaryHeader data={data} />
        <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <WorkspaceEmpty t={t} />
        </div>
        <Card className="lg:col-span-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">{t("dashboard.yourPlan")}</h2>
            <Badge className="rounded-full border-0 bg-primary/15 font-semibold text-primary">
              {planLabel}
            </Badge>
          </div>
          <div className="mt-5 flex flex-col items-center">
            <PlanRing pct={data.usagePct} pctLabel={t("dashboard.usagePct")} />
            <p className="mt-3 text-sm font-semibold tabular-nums">
              {data.stats.auditsThisMonth}
              {data.stats.auditsLimit != null ? ` / ${data.stats.auditsLimit}` : ""}{" "}
              {t("dashboard.auditsLabel")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{t("dashboard.renewsHint")}</p>
          </div>
        </Card>
        </div>
      </div>
    );
  }

  const geoSignals = data.geoSignals;
  const hasGeoSignals = Boolean(
    geoSignals &&
      [geoSignals.chatgpt, geoSignals.perplexity, geoSignals.googleAi].some(
        (n) => n != null && Number.isFinite(n)
      )
  );

  return (
    <div className="space-y-6">
      <DashboardSummaryHeader data={data} />

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
          {primaryKpis.map((item, i) => (
            <KpiCard
              key={item.key}
              label={item.label}
              value={item.value}
              meaning={item.meaning}
              metric={item.metric}
              emptyLabel={item.emptyLabel}
              extra={item.extra}
              hideDelta={item.hideDelta}
              emphasis={item.emphasis}
              icon={item.icon}
              iconClass={item.iconClass}
              delay={reduceMotion ? 0 : i * 0.04}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
          {secondaryKpis.map((item, i) => (
            <KpiCard
              key={item.key}
              label={item.label}
              value={item.value}
              meaning={item.meaning}
              metric={item.metric}
              emptyLabel={item.emptyLabel}
              hideDelta={false}
              icon={item.icon}
              iconClass={item.iconClass}
              delay={reduceMotion ? 0 : (i + 4) * 0.04}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>

      <div className="grid items-stretch gap-4 sm:gap-5 lg:grid-cols-12">
        {hasTrendHistory ? (
          <section className="lg:col-span-8">
            <Card className="h-full p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold">{t("dashboard.scoreTrend")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.trendSub")}</p>
                </div>
                {showRangeFilter ? (
                  <div
                    role="group"
                    aria-label={t("dashboard.trendRange")}
                    className="relative z-10 inline-flex h-11 shrink-0 rounded-xl border border-border/60 bg-muted/50 p-1"
                  >
                    {(
                      [
                        ["3", "dashboard.range3"],
                        ["6", "dashboard.range6"],
                        ["12", "dashboard.range12"],
                      ] as const
                    ).map(([value, labelKey]) => {
                      const selected = range === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setRange(value)}
                          className={cn(
                            "h-full rounded-lg px-3 text-sm font-medium transition-colors",
                            selected
                              ? "bg-card text-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                          )}
                        >
                          {t(labelKey)}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <div className="mt-4 h-[220px] w-full sm:h-[260px]">
                {rangeHasChart ? (
                  <ScoreTrendChart key={range} data={chartData as ScoreTrendPoint[]} />
                ) : (
                  <div className="grid h-full place-items-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                    <p className="text-sm text-muted-foreground">{t("dashboard.rangeTooSparse")}</p>
                  </div>
                )}
              </div>
            </Card>
          </section>
        ) : (
          <Card className="lg:col-span-8 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">{t("dashboard.scoreTrend")}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t("dashboard.trendEmpty")}</p>
            {data.stats.completedCount < 2 ? (
              <Button asChild className="mt-4 rounded-xl" size="sm">
                <Link href="/audit/new">{t("dashboard.runFirstAudit")}</Link>
              </Button>
            ) : null}
          </Card>
        )}

        <Card className="flex flex-col p-5 sm:p-6 lg:col-span-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">{t("dashboard.yourPlan")}</h2>
            <Badge className="rounded-full border-0 bg-primary/15 font-semibold text-primary">
              {planLabel}
            </Badge>
          </div>
          <div className="mt-5 flex flex-col items-center">
            <PlanRing pct={data.usagePct} pctLabel={t("dashboard.usagePct")} />
            <div className="mt-3 text-center">
              <div className="text-sm font-semibold tabular-nums">
                {data.stats.auditsThisMonth}
                {data.stats.auditsLimit != null ? ` / ${data.stats.auditsLimit}` : ""}{" "}
                {t("dashboard.auditsLabel")}
              </div>
              <div className="mx-auto mt-2 h-2 w-40 max-w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, data.usagePct)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t("dashboard.renewsHint")}</p>
            </div>
          </div>
          <ul className="mt-5 flex-1 space-y-2.5">
            {planFeatures.map((f) => (
              <li key={f.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  <Check className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">{f.label}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-foreground">{f.value}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="mt-5 h-11 w-full rounded-xl font-semibold shadow-glow">
            <Link href={data.plan.planId === "business" ? "/settings/billing" : "/pricing"}>
              {data.plan.planId === "business"
                ? t("dashboard.usage")
                : t("dashboard.upgradePlanCta")}
            </Link>
          </Button>
        </Card>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-12">
        <div className="space-y-4 sm:space-y-5 lg:col-span-8">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
              <h2 className="font-display text-lg font-bold">{t("dashboard.latestAnalytics")}</h2>
              {latestId ? (
                <Button variant="ghost" size="sm" className="rounded-full text-xs" asChild>
                  <Link href={reportHref}>{t("dashboard.viewReport")}</Link>
                </Button>
              ) : null}
            </div>
            {data.latestAudit && data.latestPillars ? (
              <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
                <div>
                  <p className="font-semibold">{decodeHtmlEntities(data.latestAudit.productName)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {decodeHtmlEntities(data.latestAudit.storeName)}
                    {data.latestAudit.completedAt
                      ? ` · ${relativeDate(data.latestAudit.completedAt, t)}`
                      : ""}
                  </p>
                  <div className="mt-4 flex items-end gap-3">
                    <span
                      className={cn(
                        "inline-grid size-14 place-items-center rounded-2xl font-display text-lg font-bold tabular-nums",
                        scoreTone(data.latestAudit.overallScore)
                      )}
                    >
                      {data.latestAudit.overallScore ?? t("dashboard.kpiEmptyValue")}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      <p>{t("dashboard.storeScore")}</p>
                      <p className="mt-1 text-xs">{t(sourceKey(data.kpis.overall.source))}</p>
                    </div>
                  </div>
                  {hasGeoSignals && geoSignals ? (
                    <div className="mt-5">
                      <p className="text-xs font-semibold">{t("dashboard.geoSignalsTitle")}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {t("dashboard.geoSignalsHint")}
                      </p>
                      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                        {(
                          [
                            ["chatgpt", geoSignals.chatgpt, "report.geoEngineChatgpt"],
                            ["perplexity", geoSignals.perplexity, "report.geoEnginePerplexity"],
                            ["googleAi", geoSignals.googleAi, "report.geoEngineGoogleAi"],
                          ] as const
                        ).map(([key, value, labelKey]) => (
                          <div key={key} className="rounded-xl bg-muted/50 px-2 py-3">
                            <dt className="text-[10px] text-muted-foreground">{t(labelKey)}</dt>
                            <dd className="mt-1 font-display text-sm font-bold tabular-nums">
                              {value == null ? t("dashboard.kpiEmptyValue") : value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t("dashboard.pillarCompare")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.pillarCompareSub")}</p>
                  <div className="mt-4">
                    <PillarBars latest={data.latestPillars} previous={data.previousPillars} t={t} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">{t("dashboard.kpiNeedAudit")}</p>
                <Button asChild className="mt-4 rounded-xl" size="sm">
                  <Link href="/audit/new">{t("dashboard.runFirstAudit")}</Link>
                </Button>
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-4 sm:px-6">
              <h2 className="font-display text-lg font-bold">{t("dashboard.recentAudits")}</h2>
              <Button variant="ghost" size="sm" className="rounded-full text-xs" asChild>
                <Link href="/history">{t("dashboard.viewAll")}</Link>
              </Button>
            </div>
            <DashboardRecentAudits audits={data.recent} onDeleted={onRefresh} />
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-5 lg:col-span-4">
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">{t("dashboard.insightsTitle")}</h2>
            {data.priorityIssue ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                    {t("dashboard.priorityIssue")}
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full text-[10px] font-semibold",
                      severityBadgeClass(data.priorityIssue.severity)
                    )}
                  >
                    {severityLabel(data.priorityIssue.severity, t)}
                  </Badge>
                </div>
                <p className="text-sm font-medium leading-snug">{data.priorityIssue.problem}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {data.priorityIssue.solution}
                </p>
                {data.priorityIssue.projectedImpact ? (
                  <p className="text-xs font-medium text-primary">
                    {data.priorityIssue.projectedImpact}
                  </p>
                ) : null}
                <Button asChild size="sm" className="rounded-xl">
                  <Link href={`/audit/${data.priorityIssue.auditId}/report`}>
                    {t("dashboard.fixCta")}
                  </Link>
                </Button>
                {data.nextFixes.length > 0 ? (
                  <ul className="space-y-2 border-t border-border/50 pt-3">
                    {data.nextFixes.map((fix) => (
                      <li key={fix.id}>
                        <Link
                          href={`/audit/${fix.auditId}/report`}
                          className="block rounded-lg px-1 py-1 text-sm hover:bg-accent/40"
                        >
                          <span className="text-[11px] text-muted-foreground">{t("dashboard.thenFix")}</span>
                          <span className="mt-0.5 block line-clamp-2 font-medium">{fix.problem}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
                <p className="text-sm font-medium">{t("dashboard.noOpenIssues")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.emptyIssuesTitle")}</p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">{t("dashboard.topIssues")}</h2>
            <ul className="mt-4 space-y-3">
              {data.topIssues.length ? (
                data.topIssues.map((issue) => (
                  <li key={`${issue.problem}-${issue.auditId}`}>
                    <Link
                      href={issue.auditId ? `/audit/${issue.auditId}/report` : reportHref}
                      className="flex items-start gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-accent/40"
                    >
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-rose-500/10 text-rose-600">
                        <AlertTriangle className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium leading-snug line-clamp-2">
                          {issue.problem}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("dashboard.occurrences", { count: issue.count })}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center">
                  <p className="text-sm font-medium">{t("dashboard.emptyIssuesTitle")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.noTopIssues")}</p>
                </li>
              )}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">{t("dashboard.quickActions")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(
                [
                  {
                    href: "/audit/new",
                    label: t("nav.newAudit"),
                    icon: Plus,
                    className: "bg-primary/10 text-primary",
                  },
                  {
                    href: generateHref,
                    label: t("nav.aiGenerator"),
                    icon: Sparkles,
                    className: "bg-brand/10 text-brand",
                  },
                  {
                    href: compareHref,
                    label: t("nav.competitors"),
                    icon: Swords,
                    className: "bg-gold/20 text-gold-foreground",
                  },
                  {
                    href: "/settings/usage",
                    label: t("nav.monitoring"),
                    icon: Activity,
                    className: "bg-muted text-muted-foreground",
                  },
                ] as const
              ).map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-background/60 px-3 py-5 text-center transition-colors hover:border-primary/30 hover:bg-primary/[0.04]"
                >
                  <span className={cn("grid size-10 place-items-center rounded-xl", action.className)}>
                    <action.icon className="size-5" />
                  </span>
                  <span className="text-xs font-semibold leading-tight">{action.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
