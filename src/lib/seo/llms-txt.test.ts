import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildLlmsTxt } from "@/lib/seo/llms-txt";

describe("llms.txt", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.convaudit.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("names ConvAudit, the official site, and real analysis limits", () => {
    const text = buildLlmsTxt();
    expect(text).toContain("# ConvAudit");
    expect(text).toContain(
      "ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores."
    );
    expect(text).toContain("https://www.convaudit.com");
    expect(text).toMatch(/does not query ChatGPT, Perplexity/);
    expect(text).toMatch(/SEO audit/);
    expect(text).toMatch(/competitor analysis/);
    expect(text).not.toMatch(/StorePulse/);
    expect(text).not.toMatch(/CONVADUIT|conva-aduit/);
    expect(text).not.toMatch(/cited in ChatGPT/);
  });

  it("uses www URLs when NEXT_PUBLIC_APP_URL is the apex origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://convaudit.com");
    const text = buildLlmsTxt();
    expect(text).toContain("Site: https://www.convaudit.com");
    expect(text).toContain("https://www.convaudit.com/pricing");
    expect(text).not.toMatch(/https:\/\/convaudit\.com(?:\/|$)/);
  });
});
