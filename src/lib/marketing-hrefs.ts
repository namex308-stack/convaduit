import { ROUTES } from "@/lib/routes";

/**
 * Stable guest destinations for marketing CTAs.
 * Server-safe (no `use client`) so the homepage hero can render crawlable hrefs
 * without pulling the auth/navigation client bundle.
 */
export const CRAWLABLE_START_AUDIT_HREF =
  `${ROUTES.auth}?mode=signup&next=${encodeURIComponent(ROUTES.onboarding)}` as const;

export const CRAWLABLE_LOGIN_HREF =
  `${ROUTES.auth}?mode=login&next=${encodeURIComponent(ROUTES.onboarding)}` as const;
