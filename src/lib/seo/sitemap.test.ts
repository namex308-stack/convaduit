import { describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import { PRIVATE_APP_PATHS } from "@/lib/seo/private-app-paths";
import { PUBLIC_INDEXABLE_PATHS } from "@/lib/seo/internal-links";
import { canonicalPageUrl } from "@/lib/site-url";

describe("sitemap", () => {
  it("includes every PUBLIC_INDEXABLE_PATHS URL and excludes private surfaces", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.convaudit.com");

    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    for (const path of PUBLIC_INDEXABLE_PATHS) {
      expect(urls).toContain(canonicalPageUrl(path));
    }

    // Removed affiliate program and placeholder shells must not reappear
    expect(urls.some((u) => u.endsWith("/status"))).toBe(false);
    expect(urls.some((u) => u.endsWith("/changelog"))).toBe(false);
    expect(urls.some((u) => u.endsWith("/affiliate"))).toBe(false);

    // No private / auth / API surfaces (prefix match on pathname, not substring)
    for (const path of PRIVATE_APP_PATHS) {
      expect(
        urls.some((u) => {
          const pathname = new URL(u).pathname;
          return pathname === path || pathname.startsWith(`${path}/`);
        })
      ).toBe(false);
    }
    expect(urls.some((u) => new URL(u).pathname.startsWith("/api/"))).toBe(false);

    for (const url of urls) {
      expect(new URL(url).origin).toBe("https://www.convaudit.com");
    }

    // No fabricated lastModified
    expect(entries.every((e) => e.lastModified === undefined)).toBe(true);

    // Exact sync: sitemap URLs === PUBLIC_INDEXABLE_PATHS (no extras, no missing)
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.length).toBe(PUBLIC_INDEXABLE_PATHS.length);

    vi.unstubAllEnvs();
  });

  it("emits www URLs even when NEXT_PUBLIC_APP_URL is the apex origin", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://convaudit.com");

    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://www.convaudit.com/");
    expect(urls).toContain("https://www.convaudit.com/pricing");
    expect(urls.some((u) => new URL(u).hostname === "convaudit.com")).toBe(false);

    vi.unstubAllEnvs();
  });
});
