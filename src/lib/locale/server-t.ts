import { cache } from "react";
import { getServerLocaleId } from "./server";
import { translate, type MessageKey } from "./t";

/** Server Components — resolves copy from the request locale cookie/header. */
export const getServerTranslate = cache(async () => {
  const locale = await getServerLocaleId();
  return (key: MessageKey, params?: Record<string, string | number>) =>
    translate(key, params, locale);
});
