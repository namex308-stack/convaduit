import type { LocaleId } from "../types";
import { arMessages, type MessageKey } from "./ar";
import { arGulfMessages } from "./ar-gulf";

export type { MessageKey };
export { arMessages };

const CATALOGS: Record<LocaleId, Partial<Record<MessageKey, string>>> = {
  ar: arMessages,
  "ar-gulf": arGulfMessages,
};

/** Arabic message catalog (default and only enabled UI locale). */
export function getMessages(locale: LocaleId): Partial<Record<MessageKey, string>> {
  if (locale === "ar") return arMessages;
  return CATALOGS[locale] ?? arMessages;
}
