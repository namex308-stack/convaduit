import { describe, expect, it } from "vitest";
import {
  extractFirecrawlScreenshotUrl,
  parseScreenshotUrl,
  resolveWebsitePagePreview,
} from "@/lib/firecrawl/screenshot";

const TARGET = "https://shop.example.com/products/serum";

describe("parseScreenshotUrl", () => {
  it("accepts http(s) URLs only", () => {
    expect(parseScreenshotUrl("https://cdn.firecrawl.dev/shot.png")).toBe(
      "https://cdn.firecrawl.dev/shot.png"
    );
    expect(parseScreenshotUrl("javascript:alert(1)")).toBeNull();
    expect(parseScreenshotUrl("")).toBeNull();
    expect(parseScreenshotUrl(null)).toBeNull();
  });
});

describe("extractFirecrawlScreenshotUrl", () => {
  it("reads screenshot from Firecrawl scrape data", () => {
    expect(
      extractFirecrawlScreenshotUrl({
        markdown: "# Hi",
        screenshot: "https://cdn.firecrawl.dev/target-shot.png",
      })
    ).toBe("https://cdn.firecrawl.dev/target-shot.png");
  });

  it("returns null when screenshot is missing", () => {
    expect(extractFirecrawlScreenshotUrl({ markdown: "# Hi" })).toBeNull();
  });
});

describe("resolveWebsitePagePreview", () => {
  it("keeps the analyzed URL as the preview target and shows its screenshot", () => {
    const preview = resolveWebsitePagePreview({
      analyzedUrl: TARGET,
      pageUrl: TARGET,
      pageScreenshotUrl: "https://cdn.firecrawl.dev/target-shot.png",
      productImageUrl: "https://cdn.shop.com/product.jpg",
    });
    expect(preview).toEqual({
      kind: "screenshot",
      url: "https://cdn.firecrawl.dev/target-shot.png",
    });
  });

  it("does not use a product/OG image as the website page preview", () => {
    const productOnly = resolveWebsitePagePreview({
      analyzedUrl: TARGET,
      pageUrl: TARGET,
      pageScreenshotUrl: undefined,
      productImageUrl: "https://cdn.shop.com/product.jpg",
    });
    expect(productOnly).toEqual({ kind: "unavailable" });

    // Same URL in both fields must still be rejected as a product-image collision.
    const collision = resolveWebsitePagePreview({
      analyzedUrl: TARGET,
      pageUrl: TARGET,
      pageScreenshotUrl: "https://cdn.shop.com/product.jpg",
      productImageUrl: "https://cdn.shop.com/product.jpg",
    });
    expect(collision).toEqual({ kind: "unavailable" });
  });

  it("rejects a screenshot when the page URL is not the analyzed target", () => {
    const preview = resolveWebsitePagePreview({
      analyzedUrl: TARGET,
      pageUrl: "https://shop.example.com/collections/all",
      pageScreenshotUrl: "https://cdn.firecrawl.dev/other-shot.png",
    });
    expect(preview).toEqual({ kind: "unavailable" });
  });

  it("returns Preview unavailable when screenshot capture is missing", () => {
    expect(
      resolveWebsitePagePreview({
        analyzedUrl: TARGET,
        pageUrl: TARGET,
        pageScreenshotUrl: null,
      })
    ).toEqual({ kind: "unavailable" });
  });
});
