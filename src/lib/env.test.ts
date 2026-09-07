import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getPagespeedApiKey, getWebRiskApiKey, sanitizeEnvValue } from "@/lib/env";

describe("optional Google integration keys", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers dedicated PageSpeed / Web Risk keys over the shared Google key", () => {
    vi.stubEnv("GOOGLE_API_KEY", "shared");
    vi.stubEnv("GOOGLE_PAGESPEED_API_KEY", "psi");
    vi.stubEnv("GOOGLE_WEB_RISK_API_KEY", "wr");
    expect(getPagespeedApiKey()).toBe("psi");
    expect(getWebRiskApiKey()).toBe("wr");
  });

  it("falls back to GOOGLE_API_KEY and returns undefined when nothing is set", () => {
    vi.stubEnv("GOOGLE_API_KEY", "shared");
    vi.stubEnv("GOOGLE_PAGESPEED_API_KEY", "");
    vi.stubEnv("GOOGLE_WEB_RISK_API_KEY", "");
    expect(getPagespeedApiKey()).toBe("shared");
    expect(getWebRiskApiKey()).toBe("shared");

    vi.stubEnv("GOOGLE_API_KEY", "");
    expect(getPagespeedApiKey()).toBeUndefined();
    expect(getWebRiskApiKey()).toBeUndefined();
  });
});

describe("sanitizeEnvValue", () => {
  it("strips wrapping quotes copied from the Vercel dashboard", () => {
    expect(sanitizeEnvValue('"https://skilled-flounder-35351.upstash.io"')).toBe(
      "https://skilled-flounder-35351.upstash.io"
    );
    expect(sanitizeEnvValue("'https://example.com'")).toBe("https://example.com");
    expect(sanitizeEnvValue('""https://example.com""')).toBe("https://example.com");
    expect(sanitizeEnvValue("https://example.com")).toBe("https://example.com");
    expect(sanitizeEnvValue("  ")).toBeUndefined();
    expect(sanitizeEnvValue(undefined)).toBeUndefined();
  });
});
