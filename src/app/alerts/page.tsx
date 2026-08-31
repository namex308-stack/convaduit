"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { AlertsView } from "@/components/app/alerts-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { AlertsOverview } from "@/lib/alerts/types";

export default function AlertsPage() {
  const t = useT();
  const { data: overview, setData, error, needsAuth, needsUpgrade, loading, retry } =
    useApiQuery({
      url: "/api/alerts",
      parse: (json) => (json as { alerts: AlertsOverview }).alerts,
      fallbackError: t("alerts.loadError"),
      signInMessage: t("alerts.signInRequired"),
    });

  const markRead = async (id: string) => {
    const res = await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { alert: AlertsOverview["alerts"][number] };
    setData((prev) => {
      if (!prev) return prev;
      const alerts = prev.alerts.map((a) => (a.id === id ? data.alert : a));
      return {
        ...prev,
        alerts,
        unreadCount: alerts.filter((a) => !a.isRead).length,
      };
    });
  };

  const markAllRead = async () => {
    const res = await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read_all" }),
    });
    if (!res.ok) return;
    setData((prev) => {
      if (!prev) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        unreadCount: 0,
        alerts: prev.alerts.map((a) => ({
          ...a,
          isRead: true,
          readAt: a.readAt ?? now,
        })),
      };
    });
  };

  return (
    <PageShell>
      <PageHeader
        title={t("alerts.title")}
        subtitle={t("alerts.subtitle")}
        icon={Bell}
        back="/dashboard"
      />
      <PageContent className="max-w-4xl">
        <ApiPageBody
          error={error}
          needsAuth={needsAuth}
          needsUpgrade={needsUpgrade}
          loading={loading}
          onRetry={retry}
        >
          {overview && (
            <AlertsView
              overview={overview}
              onMarkRead={(id) => void markRead(id)}
              onMarkAllRead={() => void markAllRead()}
            />
          )}
        </ApiPageBody>
      </PageContent>
    </PageShell>
  );
}
