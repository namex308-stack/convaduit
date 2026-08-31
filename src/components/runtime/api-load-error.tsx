"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

type ApiLoadErrorProps = {
  message: string;
  /** When true, show a sign-in CTA instead of retry (401 responses). */
  needsAuth?: boolean;
  /** When set, show a primary action link (e.g. billing upgrade for 403). */
  actionHref?: string;
  actionLabel?: string;
  onRetry?: () => void;
  className?: string;
};

/**
 * Inline recovery UI for client-side API fetch failures.
 * Keeps the existing card look used on dashboard/history.
 */
export function ApiLoadError({
  message,
  needsAuth = false,
  actionHref,
  actionLabel,
  onRetry,
  className,
}: ApiLoadErrorProps) {
  const t = useT();
  return (
    <Card className={className ?? "p-8 text-center"} role="alert">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {needsAuth ? (
          <Button asChild className="rounded-full">
            <Link href="/auth">{t("apiLoad.signIn")}</Link>
          </Button>
        ) : actionHref && actionLabel ? (
          <Button asChild className="rounded-full">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          onRetry && (
            <Button type="button" onClick={onRetry} className="rounded-full">
              <RotateCcw className="size-4 me-1.5" /> {t("apiLoad.retry")}
            </Button>
          )
        )}
      </div>
    </Card>
  );
}
