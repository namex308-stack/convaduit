import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractFirecrawlCrawledUrl,
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

describe("extractFirecrawlCrawledUrl", () => {
  const fallback = "https://shop.example.com/products/serum";

  it("prefers metadata.url (post-redirect) over sourceURL", () => {
    expect(
      extractFirecrawlCrawledUrl(
        {
          metadata: {
            url: "https://www.shop.example.com/products/serum",
            sourceURL: "https://shop.example.com/products/serum",
          },
        },
        fallback
      )
    ).toBe("https://www.shop.example.com/products/serum");
  });

  it("falls back to sourceURL then the scrape target", () => {
    expect(
      extractFirecrawlCrawledUrl(
        { metadata: { sourceURL: "https://www.shop.example.com/products/serum" } },
        fallback
      )
    ).toBe("https://www.shop.example.com/products/serum");
    expect(extractFirecrawlCrawledUrl({ markdown: "# Hi" }, fallback)).toBe(fallback);
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("accepts a www.-only host difference as the same public URL", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const shot = "https://cdn.firecrawl.dev/target-shot.png";
    const withWww = resolveWebsitePagePreview({
      analyzedUrl: TARGET,
      pageUrl: "https://www.shop.example.com/products/serum",
      pageScreenshotUrl: shot,
    });
    const withoutWww = resolveWebsitePagePreview({
      analyzedUrl: "https://www.shop.example.com/products/serum",
      pageUrl: TARGET,
      pageScreenshotUrl: shot,
    });
    expect(withWww).toEqual({ kind: "screenshot", url: shot });
    expect(withoutWww).toEqual({ kind: "screenshot", url: shot });
    expect(warn).not.toHaveBeenCalled();
  });

  it("rejects a screenshot when the page URL is not the analyzed target", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pageUrl = "https://shop.example.com/collections/all";
    const preview = resolveWebsitePagePreview({
      analyzedUrl: TARGET,
      pageUrl,
      pageScreenshotUrl: "https://cdn.firecrawl.dev/other-shot.png",
    });
    expect(preview).toEqual({ kind: "unavailable" });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toMatch(/URL mismatch/i);
    expect(warn.mock.calls[0]?.[1]).toEqual({ analyzedUrl: TARGET, pageUrl });
  });

  it("returns Preview unavailable when screenshot capture is missing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(
      resolveWebsitePagePreview({
        analyzedUrl: TARGET,
        pageUrl: TARGET,
        pageScreenshotUrl: null,
      })
    ).toEqual({ kind: "unavailable" });
    expect(warn).not.toHaveBeenCalled();
  });
});
