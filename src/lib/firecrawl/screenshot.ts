/**
 * Firecrawl screenshot helpers — viewport capture of the scrape target URL.
 * Never treat product/OG images as page screenshots.
 */

/** Accept only http(s) screenshot URLs from Firecrawl (or equivalent). */
export function parseScreenshotUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Read `screenshot` from a Firecrawl scrape `data` payload. */
export function extractFirecrawlScreenshotUrl(
  data: Record<string, unknown> | null | undefined
): string | null {
  if (!data) return null;
  return parseScreenshotUrl(data.screenshot);
}

/**
 * Final URL Firecrawl actually crawled after redirects.
 * Prefers `metadata.url`, then `metadata.sourceURL` / `sourceUrl`.
 */
export function extractFirecrawlCrawledUrl(
  data: Record<string, unknown> | null | undefined,
  fallback: string
): string {
  if (!data) return fallback;
  const metadata = data.metadata;
  const meta =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : null;
  const candidates = [meta?.url, meta?.sourceURL, meta?.sourceUrl];
  for (const candidate of candidates) {
    const parsed = parseScreenshotUrl(candidate);
    if (parsed) return parsed;
  }
  return fallback;
}

/**
 * Website preview for the audit report: only a screenshot of the analyzed
 * target URL — never a product/OG image from discovered page assets.
 */
export function resolveWebsitePagePreview(input: {
  analyzedUrl: string;
  pageUrl: string;
  pageScreenshotUrl?: string | null;
  /** Must not be used for the website page preview. */
  productImageUrl?: string | null;
}): { kind: "screenshot"; url: string } | { kind: "unavailable" } {
  const screenshot = parseScreenshotUrl(input.pageScreenshotUrl);
  if (!screenshot) return { kind: "unavailable" };

  if (!samePublicUrl(input.analyzedUrl, input.pageUrl)) {
    warnUrlMismatch(input.analyzedUrl, input.pageUrl);
    return { kind: "unavailable" };
  }

  // Defense: never fall back to product/OG imagery for the page chrome preview.
  if (
    input.productImageUrl &&
    parseScreenshotUrl(input.productImageUrl) === screenshot
  ) {
    return { kind: "unavailable" };
  }

  return { kind: "screenshot", url: screenshot };
}

function warnUrlMismatch(analyzedUrl: string, pageUrl: string): void {
  if (typeof window !== "undefined") return;
  console.warn(
    "[firecrawl/screenshot] page preview unavailable: URL mismatch (not a missing screenshot)",
    { analyzedUrl, pageUrl }
  );
}

/** Strip a single leading `www.` so apex and www hosts compare equal. */
function hostWithoutWww(host: string): string {
  return host.replace(/^www\./, "");
}

function samePublicUrl(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    const path = (u: URL) => u.pathname.replace(/\/$/, "") || "";
    return (
      ua.protocol === ub.protocol &&
      hostWithoutWww(ua.host.toLowerCase()) === hostWithoutWww(ub.host.toLowerCase()) &&
      path(ua) === path(ub)
    );
  } catch {
    return a.trim() === b.trim();
  }
}
