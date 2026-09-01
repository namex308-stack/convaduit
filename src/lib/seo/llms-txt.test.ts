import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildLlmsTxt } from "@/lib/seo/llms-txt";
import { PUBLIC_INDEXABLE_PATHS } from "@/lib/seo/internal-links";
import { PRIVATE_APP_PATHS } from "@/lib/seo/private-app-paths";
import { absoluteUrl } from "@/lib/site-url";

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
      "ConvAudit is an AI-powered ecommerce audit and analytics platform for Gulf GCC online stores, analyzing SEO audits, conversion rate optimization (CRO), AI visibility (GEO), competitor performance, product page optimization, and trust signals for Shopify, Salla, Zid, WooCommerce, and custom storefronts."
    );
    expect(text).toContain("https://www.convaudit.com");
    expect(text).toMatch(/does not query ChatGPT, Perplexity/);
    expect(text).toMatch(/SEO audit/);
    expect(text).toMatch(/competitor analysis/);
    expect(text).toContain("https://www.tiktok.com/@convaduit");
    expect(text).not.toMatch(/StorePulse/);
    expect(text).not.toMatch(/CONVADUIT|conva-aduit/);
    expect(text).not.toMatch(/cited in ChatGPT/);
  });

  it("lists every public indexable path and every private app prefix", () => {
    const text = buildLlmsTxt();
    for (const path of PUBLIC_INDEXABLE_PATHS) {
      expect(text).toContain(absoluteUrl(path));
    }
    for (const path of PRIVATE_APP_PATHS) {
      expect(text).toContain(absoluteUrl(path));
    }
  });

  it("uses www URLs when NEXT_PUBLIC_APP_URL is the apex origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://convaudit.com");
    const text = buildLlmsTxt();
    expect(text).toContain("Site: https://www.convaudit.com");
    expect(text).toContain("https://www.convaudit.com/pricing");
    expect(text).not.toMatch(/https:\/\/convaudit\.com(?:\/|$)/);
  });
});
