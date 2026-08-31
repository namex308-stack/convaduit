"use client";

import { useT } from "@/lib/i18n";

/** First focusable control on marketing pages — works inside client shells. */
export function SkipToContent() {
  const t = useT();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:inset-s-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md"
    >
      {t("navbar.skipToContent")}
    </a>
  );
}
