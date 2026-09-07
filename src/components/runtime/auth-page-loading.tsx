"use client";

import { Logo } from "@/components/brand/logo";
import { useT } from "@/lib/i18n";

/**
 * Client-safe Suspense fallback for `/auth` — matches RouteLoading branding
 * without needing the async server translator.
 */
export function AuthPageLoading() {
  const t = useT();
  return (
    <div
      className="min-h-screen grid place-items-center px-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Logo showWordmark={false} size={48} />
          <span className="absolute -inset-3 rounded-2xl border-2 border-primary/30 animate-pulse-ring" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="size-2 rounded-full bg-primary animate-bounce" />
        </div>
        <p className="text-sm text-muted-foreground">{t("common.loadingConvAudit")}</p>
      </div>
    </div>
  );
}
