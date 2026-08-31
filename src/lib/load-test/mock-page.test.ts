import { describe, expect, it } from "vitest";
import { buildLoadTestNormalizedPage } from "@/lib/load-test/mock-page";

describe("buildLoadTestNormalizedPage", () => {
  it("returns a complete NormalizedPage without calling external services", () => {
    const page = buildLoadTestNormalizedPage("https://shop.example/p/1");
    expect(page.url).toBe("https://shop.example/p/1");
    expect(page.scrapeStatus).toBe("ok");
    expect(page.pageType).toBe("product");
    expect(page.markdown.length).toBeGreaterThan(20);
    expect(page.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
