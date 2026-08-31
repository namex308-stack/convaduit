"use client";

import * as React from "react";
import { HeartPulse } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { StoreHealthView } from "@/components/app/store-health-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { StoreHealthPayload } from "@/lib/store-health/types";

export default function StoreHealthPage() {
  const t = useT();
  const { data: health, error, needsAuth, needsUpgrade, loading, retry } = useApiQuery({
    url: "/api/store-health",
    parse: (json) => (json as { health: StoreHealthPayload }).health,
    fallbackError: t("storeHealth.loadError"),
    signInMessage: t("storeHealth.signInRequired"),
  });

  return (
    <PageShell>
      <PageHeader
        title={t("storeHealth.title")}
        subtitle={t("storeHealth.subtitle")}
        icon={HeartPulse}
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
          {health && <StoreHealthView health={health} />}
        </ApiPageBody>
      </PageContent>
    </PageShell>
  );
}
