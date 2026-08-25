import { describe, expect, it } from "vitest";
import {
  hasSupabaseSessionCookie,
  shouldRefreshAuthSession,
} from "@/lib/supabase/auth-cookie";

describe("hasSupabaseSessionCookie", () => {
  it("returns false when no auth token cookie is present", () => {
    expect(
      hasSupabaseSessionCookie([
        { name: "theme", value: "dark" },
        { name: "sb-xxxx-auth-token-code-verifier", value: "pkce" },
      ])
    ).toBe(false);
  });

  it("detects chunked and unchunked session cookies", () => {
    expect(
      hasSupabaseSessionCookie([{ name: "sb-xxxx-auth-token", value: "jwt" }])
    ).toBe(true);
    expect(
      hasSupabaseSessionCookie([{ name: "sb-xxxx-auth-token.0", value: "chunk" }])
    ).toBe(true);
  });

  it("ignores empty values", () => {
    expect(
      hasSupabaseSessionCookie([{ name: "sb-xxxx-auth-token", value: "" }])
    ).toBe(false);
  });
});

describe("shouldRefreshAuthSession", () => {
  it("never refreshes on the auth callback", () => {
    expect(
      shouldRefreshAuthSession({ hasSessionCookie: true, isAuthCallback: true })
    ).toBe(false);
  });

  it("refreshes only when a session cookie exists", () => {
    expect(
      shouldRefreshAuthSession({ hasSessionCookie: true, isAuthCallback: false })
    ).toBe(true);
    expect(
      shouldRefreshAuthSession({ hasSessionCookie: false, isAuthCallback: false })
    ).toBe(false);
  });
});
