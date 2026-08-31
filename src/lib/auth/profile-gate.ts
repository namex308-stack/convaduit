import { ROUTES } from "@/lib/routes";
import {
  computeResumeStep,
  onboardingPathForStep,
} from "@/lib/onboarding/constants";

/** Profile fields used to route users after sign-in. */
export type ProfileGateRow = {
  onboarding_completed_at: string | null;
  business_name: string | null;
  store_url: string | null;
  country: string | null;
  primary_language: string | null;
  platform: string | null;
  store_size: string | null;
  business_category: string | null;
  primary_goal: string | null;
  monthly_traffic: string | null;
  monthly_orders: string | null;
  main_challenge: string | null;
};

export const PROFILE_GATE_SELECT =
  "onboarding_completed_at, business_name, store_url, country, primary_language, platform, store_size, business_category, primary_goal, monthly_traffic, monthly_orders, main_challenge";

export function resolveAppEntryFromProfile(row: ProfileGateRow | null | undefined): string {
  if (Boolean(row?.onboarding_completed_at)) {
    return ROUTES.dashboard;
  }

  const step = computeResumeStep({
    businessName: row?.business_name ?? "",
    storeUrl: row?.store_url ?? "",
    country: row?.country ?? "",
    primaryLanguage: row?.primary_language ?? "",
    platform: row?.platform ?? "",
    storeSize: row?.store_size ?? "",
    businessCategory: row?.business_category ?? "",
    primaryGoal: row?.primary_goal ?? "",
    monthlyTraffic: row?.monthly_traffic ?? "",
    monthlyOrders: row?.monthly_orders ?? "",
    mainChallenge: row?.main_challenge ?? "",
  });

  return onboardingPathForStep(step);
}
