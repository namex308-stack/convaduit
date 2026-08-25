import type { MessageKey } from "@/lib/locale/t";

/** FAQ pairs shown on the marketing homepage (`components/sections/faq.tsx`). */
export const HOME_FAQ_KEYS = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
  { qKey: "faq.q7", aKey: "faq.a7" },
  { qKey: "faq.q8", aKey: "faq.a8" },
  { qKey: "faq.q9", aKey: "faq.a9" },
  { qKey: "faq.q10", aKey: "faq.a10" },
] as const satisfies ReadonlyArray<{ qKey: MessageKey; aKey: MessageKey }>;
