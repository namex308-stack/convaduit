import { describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import {
  PRIVATE_APP_PATHS,
  ROBOTS_DISALLOW_PATHS,
} from "@/lib/seo/private-app-paths";
import { PUBLIC_INDEXABLE_PATHS } from "@/lib/seo/internal-links";

/** Public marketing/content paths that must remain crawlable (+ llms.txt). */
const PUBLIC_CRAWLABLE_PATHS = [...PUBLIC_INDEXABLE_PATHS, "/llms.txt"] as const;

function isDisallowedByRobots(pathname: string): boolean {
  return ROBOTS_DISALLOW_PATHS.some((rule) => {
    if (rule.endsWith("/")) {
      return pathname === rule.slice(0, -1) || pathname.startsWith(rule);
    }
    return pathname === rule || pathname.startsWith(`${rule}/`);
  });
}

describe("robots disallow contract", () => {
  it("disallows API and every private app prefix", () => {
    expect(ROBOTS_DISALLOW_PATHS).toContain("/api/");
    for (const path of PRIVATE_APP_PATHS) {
      expect(ROBOTS_DISALLOW_PATHS).toContain(path);
      expect(isDisallowedByRobots(path)).toBe(true);
    }
    expect(isDisallowedByRobots("/api/audit")).toBe(true);
    expect(isDisallowedByRobots("/settings/billing")).toBe(true);
    expect(isDisallowedByRobots("/audit/new")).toBe(true);
  });

  it("does not disallow public marketing/content paths", () => {
    for (const path of PUBLIC_CRAWLABLE_PATHS) {
      expect(isDisallowedByRobots(path)).toBe(false);
    }
  });

  it("does not invent non-existent private roots from the phase checklist", () => {
    // Billing lives under /settings/billing; there is no /billing or /ai-studio page.
    expect(PRIVATE_APP_PATHS).not.toContain("/billing");
    expect(PRIVATE_APP_PATHS).not.toContain("/ai-studio");
  });

  it("advertises the www origin for Host and sitemap even when APP_URL is apex", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://convaudit.com");
    const policy = robots();
    expect(policy.host).toBe("https://www.convaudit.com");
    expect(policy.sitemap).toBe("https://www.convaudit.com/sitemap.xml");
    vi.unstubAllEnvs();
  });
});
