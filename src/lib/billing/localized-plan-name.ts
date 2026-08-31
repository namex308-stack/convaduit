import type { TranslationKey } from "@/lib/i18n";
import type { PlanId } from "@/lib/billing/plans";

const PLAN_ID_KEYS: Record<PlanId, TranslationKey> = {
  free: "pricing.free",
  pro: "pricing.pro",
  business: "pricing.business",
};

/** Arabic display names returned by billing APIs — map back to plan ids. */
const ARABIC_PLAN_ALIASES: Record<string, PlanId> = {
  مجاني: "free",
  احترافي: "pro",
  أعمال: "business",
};

/**
 * Localize plan labels from API `displayName` strings (often Arabic) or plan id.
 */
export function localizedPlanName(
  input: string | null | undefined,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
  planId?: PlanId | null
): string {
  if (planId && PLAN_ID_KEYS[planId]) {
    return t(PLAN_ID_KEYS[planId]);
  }
  const raw = input?.trim();
  if (!raw) return t("pricing.free");
  const fromArabic = ARABIC_PLAN_ALIASES[raw];
  if (fromArabic) return t(PLAN_ID_KEYS[fromArabic]);
  const lower = raw.toLowerCase();
  if (lower === "free") return t("pricing.free");
  if (lower === "pro") return t("pricing.pro");
  if (lower === "business") return t("pricing.business");
  return raw;
}
