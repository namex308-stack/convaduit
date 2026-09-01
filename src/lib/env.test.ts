import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getPagespeedApiKey, getWebRiskApiKey } from "@/lib/env";

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
