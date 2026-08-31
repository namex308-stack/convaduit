import { useLocaleContext } from "./provider";

/** Client hook — reads active locale from `LocaleProvider`. */
export function useLocale() {
  const { locale, lang, dir, setLocale, syncLocale } = useLocaleContext();
  return { locale, lang, dir, setLocale, syncLocale };
}
