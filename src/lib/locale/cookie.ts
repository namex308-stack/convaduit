import { DEFAULT_LOCALE } from "./config";
import type { LocaleId } from "./types";

/** Cookie storing the visitor's UI locale preference (Arabic only). */
export const LOCALE_COOKIE = "convaudit_locale";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocaleId(value: string | null | undefined): value is LocaleId {
  if (!value) return false;
  return value === "ar" || value === "ar-gulf";
}

/** Normalize cookie / profile values — always Arabic for the product UI. */
export function parseLocaleCookie(_value: string | null | undefined): LocaleId {
  return DEFAULT_LOCALE;
}

export function parseEnabledLocale(_value: string | null | undefined): LocaleId {
  return DEFAULT_LOCALE;
}
