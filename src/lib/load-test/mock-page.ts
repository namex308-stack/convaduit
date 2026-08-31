import { createHash } from "node:crypto";
import type { NormalizedPage } from "@/lib/db/types";

const LOAD_TEST_MARKDOWN = `# Load-test product

Deterministic fixture for K6. Not a live crawl.

## Buy now

Price 199 EGP. Free returns in 14 days. FAQ included.
`;

/** In-memory page so load tests never call Firecrawl or a live HTTP fetch. */
export function buildLoadTestNormalizedPage(url: string): NormalizedPage {
  const href = typeof url === "string" && url.trim() ? url.trim() : "https://load-test.example/product";
  const markdown = LOAD_TEST_MARKDOWN;
  return {
    url: href,
    title: "Load-test product",
    description: "Deterministic product page used when X-Load-Test is enabled in development or test.",
    pageType: "product",
    markdown,
    imageCount: 2,
    contentHash: createHash("sha256").update(`${href}\n${markdown}`).digest("hex"),
    structuredData: {
      hasPriceSignal: true,
      hasCtaSignal: true,
      price: "199",
      brand: "LoadTest",
      rating: 4.4,
      jsonLdTypes: ["Product"],
      faq: [{ q: "هل هذا منتج تجريبي؟", a: "نعم، لتجربة التحميل فقط." }],
    },
    scrapeStatus: "ok",
    scrapeMs: 1,
  };
}
