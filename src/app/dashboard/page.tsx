"use client";

import * as React from "react";
import { PageShell, PageContent } from "@/components/app/page-shell";
import { DashboardSkeleton } from "@/components/app/dashboard-skeleton";
import { DashboardView } from "@/components/app/dashboard-view";
import { ApiLoadError } from "@/components/runtime/api-load-error";
import { useT } from "@/lib/i18n";
import type { DashboardPayload } from "@/lib/dashboard/types";
import { sanitizeDisplayName } from "@/lib/auth/display-user";

function greetingKey(hour: number): "dashboard.goodMorning" | "dashboard.goodAfternoon" | "dashboard.goodEvening" {
  if (hour < 12) return "dashboard.goodMorning";
  if (hour < 18) return "dashboard.goodAfternoon";
  return "dashboard.goodEvening";
}

export default function DashboardPage() {
  const t = useT();
  const [data, setData] = React.useState<DashboardPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = React.useState(false);
  const [retryKey, setRetryKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setNeedsAuth(false);
    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          if (!cancelled) {
            setNeedsAuth(res.status === 401);
            setError(
              res.status === 401 ? t("dashboard.signInToView") : t("dashboard.loadError")
            );
          }
          return;
        }
        const json = (await res.json()) as { dashboard: DashboardPayload };
        if (!cancelled) setData(json.dashboard);
      } catch {
        if (!cancelled) setError(t("dashboard.loadError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retryKey, t]);

  const refresh = React.useCallback(() => {
    setData(null);
    setRetryKey((k) => k + 1);
  }, []);

  return (
    <PageShell>
      <PageContent className="space-y-6">
        {data ? (
          <div className="sm:hidden">
            <h1 className="font-display text-lg font-bold tracking-tight">
              {t(greetingKey(new Date().getHours()), {
                name: sanitizeDisplayName(data.displayName)?.split(/\s+/)[0] || "بك",
              })}
            </h1>
            <p className="mb-1 text-xs text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
        ) : null}

        {!data && !error ? <DashboardSkeleton /> : null}

        {error ? (
          <ApiLoadError
            message={error}
            needsAuth={needsAuth}
            onRetry={refresh}
          />
        ) : null}

        {data ? <DashboardView data={data} onRefresh={refresh} /> : null}
      </PageContent>
    </PageShell>
  );
}
