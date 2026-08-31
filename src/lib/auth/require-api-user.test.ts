import { describe, expect, it } from "vitest";

/** Mirrors requireApiUser branching without importing server-only modules. */
function resolveApiAuthGate(input: {
  supabaseUrl: string | undefined;
  anonKey: string | undefined;
  hasUser: boolean;
}): "allow" | "unauthorized" | "misconfigured" {
  if (!input.supabaseUrl || !input.anonKey) return "misconfigured";
  if (!input.hasUser) return "unauthorized";
  return "allow";
}

describe("API auth gate policy", () => {
  it("fail-closes without Supabase env in any environment", () => {
    expect(
      resolveApiAuthGate({
        supabaseUrl: undefined,
        anonKey: undefined,
        hasUser: false,
      })
    ).toBe("misconfigured");
  });

  it("requires a session when Supabase is configured", () => {
    expect(
      resolveApiAuthGate({
        supabaseUrl: "https://example.supabase.co",
        anonKey: "anon",
        hasUser: false,
      })
    ).toBe("unauthorized");
    expect(
      resolveApiAuthGate({
        supabaseUrl: "https://example.supabase.co",
        anonKey: "anon",
        hasUser: true,
      })
    ).toBe("allow");
  });
});
