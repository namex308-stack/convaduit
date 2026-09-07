import { cache } from "react";
import { DEFAULT_LOCALE } from "./config";
import type { LocaleId } from "./types";

export const LOCALE_REQUEST_HEADER = "x-convaudit-locale";

/**
 * Product UI is Arabic-only. Skip `headers()` / cookies so marketing routes can
 * be statically generated instead of blocking TTFB on a dynamic request.
 */
export const getServerLocaleId = cache(async (): Promise<LocaleId> => DEFAULT_LOCALE);
