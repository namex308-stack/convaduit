import { DEFAULT_LOCALE } from "./config";
import { arMessages } from "./messages/ar";
import { getMessages, type MessageKey } from "./messages";
import { useLocaleContext } from "./provider";
import type { LocaleId } from "./types";

export type { MessageKey };

function format(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
}

/** Resolves a message key against the Arabic catalog. */
export function translate(
  key: MessageKey,
  params?: Record<string, string | number>,
  locale?: LocaleId
): string {
  const active = locale ?? DEFAULT_LOCALE;
  const messages = getMessages(active);
  const text = messages[key] ?? arMessages[key] ?? key;
  return format(text, params);
}

/** Client hook — re-renders when locale context updates (always Arabic). */
export function useT() {
  const { locale } = useLocaleContext();
  return (key: MessageKey, params?: Record<string, string | number>) =>
    translate(key, params, locale);
}
