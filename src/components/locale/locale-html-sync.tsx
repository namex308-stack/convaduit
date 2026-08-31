"use client";

import * as React from "react";
import { useLocale } from "@/lib/locale/resolve";

/** Keeps `<html lang dir>` aligned with the active UI locale after client switches. */
export function LocaleHtmlSync() {
  const { lang, dir } = useLocale();

  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return null;
}
