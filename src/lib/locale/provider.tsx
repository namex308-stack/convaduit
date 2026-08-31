"use client";

import * as React from "react";
import { LocaleHtmlSync } from "@/components/locale/locale-html-sync";
import { DEFAULT_LOCALE, getLocaleConfig } from "./config";
import type { Direction, LocaleId } from "./types";

export const LOCALE_CHANGED_EVENT = "convaudit:locale-changed";

type LocaleContextValue = {
  locale: LocaleId;
  lang: string;
  dir: Direction;
  setLocale: (id: LocaleId) => void;
  syncLocale: (id: LocaleId) => void;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale: _initialLocale,
  children,
}: {
  initialLocale: LocaleId;
  children: React.ReactNode;
}) {
  const locale = DEFAULT_LOCALE;
  const config = getLocaleConfig(locale);

  const value = React.useMemo(
    () => ({
      locale,
      lang: config.htmlLang,
      dir: config.dir,
      setLocale: () => {},
      syncLocale: () => {},
    }),
    [config.dir, config.htmlLang]
  );

  return (
    <LocaleContext.Provider value={value}>
      <LocaleHtmlSync />
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    const config = getLocaleConfig(DEFAULT_LOCALE);
    return {
      locale: DEFAULT_LOCALE,
      lang: config.htmlLang,
      dir: config.dir,
      setLocale: () => {},
      syncLocale: () => {},
    };
  }
  return ctx;
}
