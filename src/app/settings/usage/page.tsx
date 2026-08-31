"use client";

import * as React from "react";
import { BarChart3, Zap, Bot, Swords, Activity } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SettingsFrame } from "@/components/app/settings-nav";
import { ApiLoadError } from "@/components/runtime/api-load-error";
import { ScoreRadial } from "@/components/common/score-viz";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { localizedPlanName } from "@/lib/billing/localized-plan-name";
import type { PlanId } from "@/lib/billing/plans";
import { useT } from "@/lib/i18n";
import { usageDescParams } from "@/lib/billing/plan-copy";

type UsageData = {
  plan: { planId: string; displayName: string; auditsPerMonth: number | null; aiGensPerMonth: number | null };
  periodStart: string;
  periodEnd: string;
  counts: {
    audit: number;
    ai_generation: number;
    competitor_compare: number;
    api_call: number;
  };
  endpoints: { metric: string; used: number; limit: number | null }[];
  usagePct: number;
};

const METRIC_META: Record<
  string,
  { icon: typeof Zap; labelKey: "usage.auditsThisMonth" | "usage.aiGenerations" | "usage.competitorComparisons" | "usage.apiCalls"; color: string }
> = {
  audit: { icon: Zap, labelKey: "usage.auditsThisMonth", color: "#FF6600" },
  ai_generation: { icon: Bot, labelKey: "usage.aiGenerations", color: "#ff983f" },
  competitor_compare: { icon: Swords, labelKey: "usage.competitorComparisons", color: "#929292" },
  api_call: { icon: Activity, labelKey: "usage.apiCalls", color: "#cc5200" },
};

function formatLimit(limit: number | null): string {
  return limit == null ? "∞" : String(limit);
}

export default function UsagePage() {
  const t = useT();
  const [usage, setUsage] = React.useState<UsageData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = React.useState(false);
  const [retryKey, setRetryKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setNeedsAuth(false);
    (async () => {
      try {
        const res = await fetch("/api/usage");
        if (!res.ok) {
          if (!cancelled) {
            setNeedsAuth(res.status === 401);
            setError(res.status === 401 ? t("usage.signInToView") : t("usage.loadError"));
          }
          return;
        }
        const json = (await res.json()) as { usage: UsageData };
        if (!cancelled) setUsage(json.usage);
      } catch {
        if (!cancelled) setError(t("usage.loadError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retryKey, t]);

  const renewLabel = usage
    ? new Date(usage.periodEnd).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const planLabel = usage
    ? localizedPlanName(usage.plan.displayName, t, usage.plan.planId as PlanId)
    : "";

  return (
    <PageShell>
      <PageHeader title={t("usage.title")} subtitle={t("usage.subtitle")} icon={BarChart3} />
      <PageContent>
        <SettingsFrame>
          {!usage && !error && (
            <div className="space-y-6" aria-busy="true">
              <Card className="flex items-center gap-6 p-6">
                <Skeleton className="size-[100px] rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56 max-w-full" />
                </div>
              </Card>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-5">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="mt-3 h-4 w-32" />
                    <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {error && (
            <ApiLoadError
              message={error}
              needsAuth={needsAuth}
              onRetry={() => {
                setUsage(null);
                setRetryKey((k) => k + 1);
              }}
            />
          )}

          {usage && (
            <>
              <Card className="p-5 sm:p-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                  <ScoreRadial score={usage.usagePct} size={100} stroke={8} label={t("settings.usage")} />
                  <div className="text-center sm:text-start">
                    <h2 className="font-display text-xl font-bold">{t("usage.planUsage")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("usage.usageDesc", usageDescParams(usage.usagePct, planLabel))}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("usage.periodEnds", { date: renewLabel })}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {usage.endpoints
                  .filter((e) => e.metric !== "api_call")
                  .map((e) => {
                    const meta = METRIC_META[e.metric] ?? METRIC_META.audit!;
                    const pct =
                      e.limit != null && e.limit > 0
                        ? Math.min(100, Math.round((e.used / e.limit) * 100))
                        : e.used > 0
                          ? 5
                          : 0;
                    return (
                      <Card key={e.metric} className="p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <span
                            className="grid size-9 place-items-center rounded-lg"
                            style={{ background: `${meta.color}1a`, color: meta.color }}
                          >
                            <meta.icon className="size-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold">{t(meta.labelKey)}</div>
                            <div className="text-xs tabular-nums text-muted-foreground">
                              {e.used} / {formatLimit(e.limit)}
                            </div>
                          </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{ background: meta.color, width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-1.5 text-[11px] text-muted-foreground">
                          {t("usage.used", { used: `${pct}%` })}
                        </div>
                      </Card>
                    );
                  })}
              </div>

              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle>{t("usage.apiUsage")}</CardTitle>
                  <CardDescription>{t("settings.usageDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-1">
                    {usage.endpoints.map((api) => (
                      <div
                        key={api.metric}
                        className="flex items-center gap-3 border-b border-border/50 py-3 last:border-0"
                      >
                        <code className="rounded bg-primary/5 px-2 py-1 font-mono text-xs text-primary">
                          {api.metric}
                        </code>
                        <div className="flex-1 text-xs text-muted-foreground">
                          {t("usage.calls", {
                            used: api.used,
                            limit: formatLimit(api.limit),
                          })}
                        </div>
                        <div className="text-xs font-semibold tabular-nums">
                          {api.limit != null && api.limit > 0
                            ? `${((api.used / api.limit) * 100).toFixed(1)}%`
                            : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </SettingsFrame>
      </PageContent>
    </PageShell>
  );
}
