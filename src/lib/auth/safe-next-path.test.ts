import { describe, expect, it } from "vitest";
import { ROUTES } from "@/lib/routes";
import {
  isAllowedExplicitPostAuthPath,
  resolvePostAuthPath,
  safeNextPath,
} from "@/lib/auth/safe-next-path";

const incompleteProfile = {
  onboarding_completed_at: null,
  business_name: null,
  store_url: null,
  country: null,
  primary_language: null,
  platform: null,
  store_size: null,
  business_category: null,
  primary_goal: null,
  monthly_traffic: null,
  monthly_orders: null,
  main_challenge: null,
};

const completedProfile = {
  ...incompleteProfile,
  onboarding_completed_at: "2026-01-01T00:00:00.000Z",
  business_name: "Store",
  store_url: "https://shop.example",
  country: "EG",
  primary_language: "ar",
  platform: "shopify",
};

describe("safeNextPath", () => {
  it("allows onboarding, dashboard, and deep app paths", () => {
    expect(safeNextPath("/onboarding")).toBe("/onboarding");
    expect(safeNextPath("/onboarding/platform")).toBe("/onboarding/platform");
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/checkout?plan=pro")).toBe("/checkout?plan=pro");
    expect(safeNextPath("/audit/new")).toBe("/audit/new");
  });

  it("rejects marketing home and auth entry to prevent post-OAuth landing loops", () => {
    expect(safeNextPath("/")).toBe(ROUTES.dashboard);
    expect(safeNextPath("/auth")).toBe(ROUTES.dashboard);
    expect(safeNextPath("/auth?mode=login")).toBe(ROUTES.dashboard);
    expect(safeNextPath("/auth/callback")).toBe(ROUTES.dashboard);
    expect(safeNextPath("/auth/callback?next=/dashboard")).toBe(ROUTES.dashboard);
  });

  it("rejects open redirects and empty values", () => {
    expect(safeNextPath("https://example.com")).toBe(ROUTES.dashboard);
    expect(safeNextPath("//example.com")).toBe(ROUTES.dashboard);
    expect(safeNextPath(null)).toBe(ROUTES.dashboard);
    expect(safeNextPath("")).toBe(ROUTES.dashboard);
    expect(safeNextPath(undefined)).toBe(ROUTES.dashboard);
  });

  it("honors a custom fallback when blocked or invalid", () => {
    expect(safeNextPath("/", ROUTES.onboarding)).toBe(ROUTES.onboarding);
    expect(safeNextPath("https://evil.example", ROUTES.onboarding)).toBe(ROUTES.onboarding);
  });
});

describe("resolvePostAuthPath", () => {
  it("honors explicit onboarding and dashboard targets", () => {
    expect(resolvePostAuthPath("/onboarding", incompleteProfile)).toBe("/onboarding");
    expect(resolvePostAuthPath("/dashboard", incompleteProfile)).toBe("/dashboard");
    expect(resolvePostAuthPath("/checkout?plan=pro", completedProfile)).toBe(
      "/checkout?plan=pro"
    );
  });

  it("never resolves to marketing home or external URLs", () => {
    expect(resolvePostAuthPath("/", incompleteProfile)).toBe("/onboarding/business-name");
    expect(resolvePostAuthPath("/", completedProfile)).toBe(ROUTES.dashboard);
    expect(resolvePostAuthPath("https://example.com", incompleteProfile)).toBe(
      "/onboarding/business-name"
    );
    expect(resolvePostAuthPath("//example.com", incompleteProfile)).toBe(
      "/onboarding/business-name"
    );
    expect(resolvePostAuthPath("/auth", incompleteProfile)).toBe("/onboarding/business-name");
  });

  it("routes new users to onboarding and completed users to dashboard when next is absent", () => {
    expect(resolvePostAuthPath(null, incompleteProfile)).toBe("/onboarding/business-name");
    expect(resolvePostAuthPath(null, completedProfile)).toBe(ROUTES.dashboard);
    expect(resolvePostAuthPath("", incompleteProfile)).toBe("/onboarding/business-name");
  });

  it("documents allowed explicit post-auth paths", () => {
    expect(isAllowedExplicitPostAuthPath("/onboarding")).toBe(true);
    expect(isAllowedExplicitPostAuthPath("/")).toBe(false);
    expect(isAllowedExplicitPostAuthPath("https://example.com")).toBe(false);
  });
});
