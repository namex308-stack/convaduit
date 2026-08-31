"use client";

import * as React from "react";
import Link from "next/link";
import { CreditCard, Crown } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SettingsFrame } from "@/components/app/settings-nav";
import { ApiLoadError } from "@/components/runtime/api-load-error";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/i18n";
import {
  resolveBillingPaymentState,
  shouldShowBillingUpgradeCta,
} from "@/lib/billing/plan-copy";
import type { PlanId } from "@/lib/db/types";

type UsageData = {
  plan: {
    planId: string;
    displayName: string;
    auditsPerMonth: number | null;
    storesLimit: number | null;
  };
  periodEnd: string;
  counts: { audit: number };
  billingEvents: {
    id: string;
    eventType: string;
    provider: string;
    createdAt: string;
    externalId: string | null;
  }[];
  storeCount: number;
};

export default function BillingPage() {
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
            setError(t("billing.loadError"));
          }
          return;
        }
        const json = (await res.json()) as { usage: UsageData };
        if (!cancelled) setUsage(json.usage);
      } catch {
        if (!cancelled) setError(t("billing.loadError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retryKey, t]);

  const auditsUsed = usage?.counts.audit ?? 0;
  const auditsLimit = usage?.plan.auditsPerMonth;
  const remaining =
    auditsLimit != null ? Math.max(0, auditsLimit - auditsUsed) : null;
  const periodEnd = usage
    ? new Date(usage.periodEnd).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const planId = (usage?.plan.planId ?? "free") as PlanId;
  const paymentState = resolveBillingPaymentState(planId);
  const showUpgradeCta = shouldShowBillingUpgradeCta(planId);

  return (
    <PageShell>
      <PageHeader title={t("billing.title")} subtitle={t("billing.subtitle")} icon={CreditCard} />
      <PageContent>
        <SettingsFrame>
          {!usage && !error && (
            <div className="space-y-6" aria-busy="true">
              <Card className="p-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-3 h-4 w-56" />
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-4 h-16 w-full rounded-xl" />
              </Card>
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
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="font-display text-xl font-bold">{usage.plan.displayName}</h2>
                      <Badge className="gradient-brand rounded-full text-white">{usage.plan.planId}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("billing.planLimits", {
                        audits:
                          usage.plan.auditsPerMonth == null
                            ? "∞"
                            : String(usage.plan.auditsPerMonth),
                        stores:
                          usage.plan.storesLimit == null ? "∞" : String(usage.plan.storesLimit),
                      })}
                    </p>
                  </div>
                  {showUpgradeCta && (
                    <Button asChild className="rounded-xl shadow-glow">
                      <Link href="/pricing">
                        <Crown className="size-4 me-1 text-brand" /> {t("dashboard.upgrade")}
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{t("billing.auditsRemaining")}</div>
                    <div className="mt-1 font-display text-xl font-bold tabular-nums">
                      {remaining != null && auditsLimit != null
                        ? `${remaining} / ${auditsLimit}`
                        : `${auditsUsed} / ∞`}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t("billing.renewsOn")}</div>
                    <div className="mt-1 font-display text-base font-bold sm:text-xl">{periodEnd}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{t("billing.usedThisPeriod")}</div>
                    <div className="mt-1 font-display text-xl font-bold tabular-nums">{auditsUsed}</div>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle>{t("billing.paymentMethod")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <span className="grid size-10 place-items-center rounded-lg bg-background text-muted-foreground">
                      <CreditCard className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{t("billing.noPayment")}</div>
                      <div className="text-xs text-muted-foreground">
                        {paymentState === "free_needs_subscribe"
                          ? t("billing.noPaymentDesc")
                          : t("billing.paidNoPaymentDesc")}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link href="/pricing">
                        {paymentState === "free_needs_subscribe"
                          ? t("billing.addCard")
                          : t("billing.managePlan")}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle>{t("billing.invoices")}</CardTitle>
                </CardHeader>
                {usage.billingEvents.length === 0 ? (
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    {t("billing.noEvents")}
                  </CardContent>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {usage.billingEvents.map((ev) => (
                      <li
                        key={ev.id}
                        className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm sm:px-6"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium">{ev.eventType}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {ev.provider}
                            {ev.externalId ? ` · ${ev.externalId}` : ""}
                          </div>
                        </div>
                        <div className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(ev.createdAt).toLocaleDateString("ar")}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle>{t("dashboard.storesLimit")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {usage.storeCount}
                    {usage.plan.storesLimit != null ? ` / ${usage.plan.storesLimit}` : ""}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </SettingsFrame>
      </PageContent>
    </PageShell>
  );
}
