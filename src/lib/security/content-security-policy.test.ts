import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "./content-security-policy";

describe("buildContentSecurityPolicy", () => {
  it("blocks unsafe-eval in production", () => {
    const csp = buildContentSecurityPolicy({ isProd: true });
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("allows unsafe-eval in development for Turbopack HMR", () => {
    const csp = buildContentSecurityPolicy({ isProd: false });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("does not use blanket https: or wss: in connect-src", () => {
    const csp = buildContentSecurityPolicy({ isProd: true });
    expect(csp).toMatch(/connect-src[^;]+'self'/);
    expect(csp).not.toMatch(/connect-src[^;]+\bhttps:\b/);
    expect(csp).not.toMatch(/connect-src[^;]+\bwss:\b/);
    expect(csp).not.toMatch(/connect-src[^;]+\bws:\b/);
  });

  it("pins the Supabase project host when configured", () => {
    const csp = buildContentSecurityPolicy({
      isProd: true,
      supabaseUrl: "https://abcxyz.supabase.co",
    });
    expect(csp).toContain("https://abcxyz.supabase.co");
    expect(csp).toContain("wss://abcxyz.supabase.co");
    expect(csp).toContain("https://*.supabase.co");
  });

  it("allows required third-party script and analytics origins", () => {
    const csp = buildContentSecurityPolicy({ isProd: true });
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("https://www.google-analytics.com");
    expect(csp).toContain("https://va.vercel-scripts.com");
  });

  it("allows Firecrawl CDN and merchant https images", () => {
    const csp = buildContentSecurityPolicy({ isProd: true });
    expect(csp).toContain("https://cdn.firecrawl.dev");
    expect(csp).toMatch(/img-src[^;]+ https:/);
  });

  it("does not load Google Fonts in the browser", () => {
    const csp = buildContentSecurityPolicy({ isProd: true });
    expect(csp).not.toContain("fonts.googleapis.com");
    expect(csp).not.toContain("fonts.gstatic.com");
  });

  it("blocks embedded frames", () => {
    const csp = buildContentSecurityPolicy({ isProd: true });
    expect(csp).toContain("frame-src 'none'");
  });
});
