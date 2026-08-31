"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { GeoTrackingView } from "@/components/app/geo-tracking-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { GeoTrackingSummary } from "@/lib/geo-tracking/types";

export default function GeoTrackingPage() {
  const t = useT();
  const { data: tracking, error, needsAuth, needsUpgrade, loading, retry } = useApiQuery({
    url: "/api/geo-tracking",
    parse: (json) => (json as { tracking: GeoTrackingSummary }).tracking,
    fallbackError: t("geoTracking.loadError"),
    signInMessage: t("geoTracking.signInRequired"),
  });

  return (
    <PageShell>
      <PageHeader
        title={t("geoTracking.title")}
        subtitle={t("geoTracking.subtitle")}
        icon={Sparkles}
        back="/dashboard"
      />
      <PageContent className="max-w-5xl">
        <ApiPageBody
          error={error}
          needsAuth={needsAuth}
          needsUpgrade={needsUpgrade}
          loading={loading}
          onRetry={retry}
        >
          {tracking &&
            (tracking.points.length === 0 ? (
              <div className="rounded-2xl border border-border/50 bg-card p-10 text-center text-sm text-muted-foreground">
                {t("geoTracking.empty")}
              </div>
            ) : (
              <GeoTrackingView tracking={tracking} />
            ))}
        </ApiPageBody>
      </PageContent>
    </PageShell>
  );
}
