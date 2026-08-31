"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { NotificationsView } from "@/components/app/notifications-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { NotificationsOverview } from "@/lib/notifications/types";

export default function NotificationsPage() {
  const t = useT();
  const [filter, setFilter] =
    React.useState<NotificationsOverview["filter"]>("all");

  const url =
    filter === "all"
      ? "/api/notifications"
      : `/api/notifications?category=${encodeURIComponent(filter)}`;

  const { data: overview, setData, error, needsAuth, needsUpgrade, loading, retry } =
    useApiQuery({
      url,
      parse: (json) => (json as { notifications: NotificationsOverview }).notifications,
      fallbackError: t("notifications.loadError"),
      signInMessage: t("notifications.signInRequired"),
      deps: [filter],
    });

  const markRead = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read" }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      notification: NotificationsOverview["notifications"][number];
    };
    setData((prev) => {
      if (!prev) return prev;
      const notifications = prev.notifications.map((n) =>
        n.id === id ? data.notification : n
      );
      return {
        ...prev,
        notifications,
        unreadCount: Math.max(
          0,
          prev.unreadCount -
            (prev.notifications.find((n) => n.id === id && !n.isRead) ? 1 : 0)
        ),
      };
    });
  };

  const archive = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });
    if (!res.ok) return;
    setData((prev) => {
      if (!prev) return prev;
      const wasUnread = prev.notifications.some((n) => n.id === id && !n.isRead);
      return {
        ...prev,
        notifications:
          prev.filter === "archived"
            ? prev.notifications
            : prev.notifications.filter((n) => n.id !== id),
        unreadCount: Math.max(0, prev.unreadCount - (wasUnread ? 1 : 0)),
        archivedCount: prev.archivedCount + 1,
      };
    });
  };

  const markAllRead = async () => {
    const res = await fetch("/api/notifications", {
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
        notifications: prev.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt ?? now,
        })),
      };
    });
  };

  return (
    <PageShell>
      <PageHeader
        title={t("notifications.title")}
        subtitle={t("notifications.subtitle")}
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
            <NotificationsView
              overview={overview}
              onFilter={(next) => setFilter(next)}
              onMarkRead={(id) => void markRead(id)}
              onArchive={(id) => void archive(id)}
              onMarkAllRead={() => void markAllRead()}
            />
          )}
        </ApiPageBody>
      </PageContent>
    </PageShell>
  );
}
