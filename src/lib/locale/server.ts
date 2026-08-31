import { headers } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE } from "./config";
import { parseEnabledLocale } from "./cookie";
import type { LocaleId } from "./types";

export const LOCALE_REQUEST_HEADER = "x-convaudit-locale";

/**
 * Request-scoped locale from middleware (cookie → header). Falls back to Arabic.
 */
export const getServerLocaleId = cache(async (): Promise<LocaleId> => {
  const headerStore = await headers();
  const fromHeader = headerStore.get(LOCALE_REQUEST_HEADER);
  if (fromHeader) return parseEnabledLocale(fromHeader);
  return DEFAULT_LOCALE;
});
