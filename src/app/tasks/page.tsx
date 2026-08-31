"use client";

import * as React from "react";
import { ListChecks } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { GrowthTasksView } from "@/components/app/growth-tasks-view";
import { ApiPageBody } from "@/components/runtime/api-page-body";
import { useApiQuery } from "@/hooks/use-api-query";
import { useT } from "@/lib/i18n";
import type { GrowthTasksOverview } from "@/lib/growth-tasks/types";

export default function GrowthTasksPage() {
  const t = useT();
  const { data: overview, setData, error, needsAuth, needsUpgrade, loading, retry } =
    useApiQuery({
      url: "/api/growth-tasks",
      parse: (json) => (json as { tasks: GrowthTasksOverview }).tasks,
      fallbackError: t("growthTasks.loadError"),
      signInMessage: t("growthTasks.signInRequired"),
    });

  const toggleComplete = async (taskId: string, completed: boolean) => {
    const res = await fetch(`/api/growth-tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      task: GrowthTasksOverview["groups"][number]["tasks"][number];
    };
    setData((prev) => {
      if (!prev) return prev;
      const groups = prev.groups.map((group) => ({
        ...group,
        tasks: group.tasks.map((task) =>
          task.id === taskId ? data.task : task
        ),
      }));
      const flat = groups.flatMap((g) => g.tasks);
      return {
        groups,
        openCount: flat.filter((task) => task.status === "open").length,
        doneCount: flat.filter((task) => task.status === "done").length,
        autoResolvedCount: flat.filter((task) => task.status === "auto_resolved").length,
        totalCount: flat.length,
      };
    });
  };

  return (
    <PageShell>
      <PageHeader
        title={t("growthTasks.title")}
        subtitle={t("growthTasks.subtitle")}
        icon={ListChecks}
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
            <GrowthTasksView
              overview={overview}
              onToggleComplete={(id, completed) => void toggleComplete(id, completed)}
            />
          )}
        </ApiPageBody>
      </PageContent>
    </PageShell>
  );
}
