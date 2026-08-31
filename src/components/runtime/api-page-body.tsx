"use client";

import * as React from "react";
import { ListPageSkeleton } from "@/components/app/dashboard-skeleton";
import { ApiLoadError } from "@/components/runtime/api-load-error";
import { useT } from "@/lib/i18n";

type ApiPageBodyProps = {
  error: string | null;
  needsAuth: boolean;
  needsUpgrade: boolean;
  loading: boolean;
  onRetry: () => void;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
};

/** Consistent loading, entitlement, and error chrome for data-driven app pages. */
export function ApiPageBody({
  error,
  needsAuth,
  needsUpgrade,
  loading,
  onRetry,
  skeleton,
  children,
}: ApiPageBodyProps) {
  const t = useT();

  if (error) {
    return (
      <ApiLoadError
        message={error}
        needsAuth={needsAuth}
        actionHref={needsUpgrade ? "/settings/billing" : undefined}
        actionLabel={needsUpgrade ? t("common.upgradeCta") : undefined}
        onRetry={needsUpgrade ? undefined : onRetry}
      />
    );
  }

  if (loading) {
    return <>{skeleton ?? <ListPageSkeleton />}</>;
  }

  return <>{children}</>;
}
