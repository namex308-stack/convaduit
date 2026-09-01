import type { NormalizedPage } from "@/lib/db/types";
import { parseScreenshotUrl } from "@/lib/firecrawl/screenshot";

export type ProductLookupFaq = { q: string; a: string };

export type ProductLookupResult = {
  url: string;
  title: string;
  price: string | null;
  brand: string | null;
  rating: string | null;
  reviews: string | null;
  images: string[];
  faq: ProductLookupFaq[];
  ogImage: string | null;
};

function asTrimmedString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function asHttpsUrl(value: unknown): string | null {
  const parsed = parseScreenshotUrl(value);
  if (!parsed || !parsed.startsWith("https:")) return null;
  return parsed;
}

function asHttpUrlList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const parsed = asHttpsUrl(item);
    if (!parsed) continue;
    out.push(parsed);
    if (out.length >= max) break;
  }
  return out;
}

function asFaqList(value: unknown, max: number): ProductLookupFaq[] {
  if (!Array.isArray(value)) return [];
  const out: ProductLookupFaq[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const q = asTrimmedString(record.q);
    const a = asTrimmedString(record.a);
    if (!q || !a) continue;
    out.push({ q, a });
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Flatten crawl `structuredData` (already `extractionToStructuredData()`)
 * into the public product-lookup payload. No scoring.
 */
export function toProductLookupResult(page: NormalizedPage): ProductLookupResult {
  const structured = page.structuredData ?? {};
  const images = asHttpUrlList(structured.images, 12);
  const ogImage =
    asHttpsUrl(structured.ogImage) ||
    asHttpsUrl(structured.primaryImageUrl) ||
    images[0] ||
    null;

  return {
    url: page.url,
    title: page.title?.trim() || "",
    price: asTrimmedString(structured.price),
    brand: asTrimmedString(structured.brand),
    rating: asTrimmedString(structured.rating),
    reviews: asTrimmedString(structured.reviews),
    images,
    faq: asFaqList(structured.faq, 20),
    ogImage,
  };
}
