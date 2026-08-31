import type { Direction, LocaleId } from "./types";

export interface LocaleConfig {
  id: LocaleId;
  label: string;
  htmlLang: string;
  dir: Direction;
  ogLocale: string;
  enabled: boolean;
}

/** Locale registry — Arabic only in the product UI. */
export const LOCALES: Record<LocaleId, LocaleConfig> = {
  ar: {
    id: "ar",
    label: "العربية (فصحى)",
    htmlLang: "ar",
    dir: "rtl",
    ogLocale: "ar_EG",
    enabled: true,
  },
  "ar-gulf": {
    id: "ar-gulf",
    label: "العربية (خليجي)",
    htmlLang: "ar",
    dir: "rtl",
    ogLocale: "ar_SA",
    enabled: false,
  },
};

export const DEFAULT_LOCALE: LocaleId = "ar";

export function getLocaleConfig(id: LocaleId): LocaleConfig {
  return LOCALES[id] ?? LOCALES[DEFAULT_LOCALE];
}

export function getEnabledLocales(): LocaleConfig[] {
  return Object.values(LOCALES).filter((l) => l.enabled);
}
