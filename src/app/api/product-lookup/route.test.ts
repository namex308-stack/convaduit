import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { NormalizedPage } from "@/lib/db/types";

vi.mock("server-only", () => ({}));

const { crawlWithFallback } = vi.hoisted(() => ({
  crawlWithFallback: vi.fn(),
}));

vi.mock("@/lib/firecrawl", () => ({
  crawlWithFallback: (...args: unknown[]) => crawlWithFallback(...args),
  FIRECRAWL_NOT_CONFIGURED_MESSAGE:
    "وضع التطوير: أضف FIRECRAWL_API_KEY في ملف البيئة للحصول على تحليل حقيقي.",
  FIRECRAWL_CREDITS_MESSAGE:
    "رصيد Firecrawl منتهٍ. أضف رصيداً عبر https://firecrawl.dev/pricing — سيتم استخدام الجلب المدمج بدلاً من ذلك.",
}));

const { checkProductLookupRateLimit } = vi.hoisted(() => ({
  checkProductLookupRateLimit: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
  checkProductLookupRateLimit: (...args: unknown[]) => checkProductLookupRateLimit(...args),
  checkRateLimit: vi.fn(),
}));

import { POST } from "./route";

const FIRECRAWL_NOT_CONFIGURED_MESSAGE =
  "وضع التطوير: أضف FIRECRAWL_API_KEY في ملف البيئة للحصول على تحليل حقيقي.";
const FIRECRAWL_CREDITS_MESSAGE =
  "رصيد Firecrawl منتهٍ. أضف رصيداً عبر https://firecrawl.dev/pricing — سيتم استخدام الجلب المدمج بدلاً من ذلك.";

const PRODUCT_URL = "https://shop.example.com/products/serum";

const PAGE: NormalizedPage = {
  url: PRODUCT_URL,
  title: "Argan Serum",
  description: "Hydrating serum",
  pageType: "product",
  markdown: "# Argan Serum",
  imageCount: 1,
  contentHash: "abc",
  structuredData: {
    price: "299 SAR",
    brand: "Acme",
    rating: "4.6",
    reviews: "128",
    images: ["https://cdn.shop.example.com/serum.jpg"],
    faq: [{ q: "هل يناسب البشرة الجافة؟", a: "نعم، مع مرطب يومي." }],
    ogImage: "https://cdn.shop.example.com/og.jpg",
  },
  scrapeStatus: "ok",
  scrapeMs: 12,
};

function jsonRequest(
  body: unknown,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest("http://localhost/api/product-lookup", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/product-lookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkProductLookupRateLimit.mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: 0,
    });
  });

  it("returns extracted product fields on a successful crawl", async () => {
    crawlWithFallback.mockResolvedValue({
      page: PAGE,
      errorCode: null,
      source: "firecrawl",
    });

    const res = await POST(
      jsonRequest({ url: PRODUCT_URL }, { "x-forwarded-for": "203.0.113.9" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(checkProductLookupRateLimit).toHaveBeenCalledWith("product-lookup:203.0.113.9");
    expect(crawlWithFallback).toHaveBeenCalledWith(PRODUCT_URL);
    expect(body).toEqual({
      url: PRODUCT_URL,
      title: "Argan Serum",
      price: "299 SAR",
      brand: "Acme",
      rating: "4.6",
      reviews: "128",
      images: ["https://cdn.shop.example.com/serum.jpg"],
      faq: [{ q: "هل يناسب البشرة الجافة؟", a: "نعم، مع مرطب يومي." }],
      ogImage: "https://cdn.shop.example.com/og.jpg",
    });
    expect(body).not.toHaveProperty("overallScore");
    expect(body).not.toHaveProperty("breakdown");
  });

  it("rejects an SSRF-blocked URL with an Arabic error", async () => {
    crawlWithFallback.mockResolvedValue({
      page: null,
      errorCode: "BLOCKED_URL",
      errorMessage: "عناوين الشبكات الخاصة أو المحجوزة غير مسموحة.",
      source: "none",
    });

    const res = await POST(jsonRequest({ url: "http://127.0.0.1/admin" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.code).toBe("BLOCKED_URL");
    expect(body.error).toMatch(/[\u0600-\u06FF]/);
    expect(res.status).not.toBe(500);
  });

  it("returns 429 when the product-lookup rate limit is exceeded", async () => {
    checkProductLookupRateLimit.mockResolvedValue({
      success: false,
      limit: 20,
      remaining: 0,
      reset: 0,
    });

    const res = await POST(jsonRequest({ url: PRODUCT_URL }));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toMatch(/[\u0600-\u06FF]/);
    expect(crawlWithFallback).not.toHaveBeenCalled();
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("returns a clean Arabic error when Firecrawl fails instead of a raw 500", async () => {
    crawlWithFallback.mockResolvedValue({
      page: null,
      errorCode: "FAILED",
      errorMessage: "تعذّر الوصول إلى الصفحة. تحقق من الرابط.",
      source: "none",
    });

    const res = await POST(jsonRequest({ url: PRODUCT_URL }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.code).toBe("FAILED");
    expect(body.error).toBe("تعذّر الوصول إلى الصفحة. تحقق من الرابط.");
    expect(body.error).toMatch(/[\u0600-\u06FF]/);
  });

  it("surfaces Firecrawl configuration Arabic copy when the provider is missing", async () => {
    crawlWithFallback.mockResolvedValue({
      page: null,
      errorCode: "NOT_CONFIGURED",
      errorMessage: FIRECRAWL_NOT_CONFIGURED_MESSAGE,
      source: "none",
    });

    const res = await POST(jsonRequest({ url: PRODUCT_URL }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.code).toBe("NOT_CONFIGURED");
    expect(body.error).toBe(FIRECRAWL_NOT_CONFIGURED_MESSAGE);
  });

  it("surfaces Firecrawl credits Arabic copy", async () => {
    crawlWithFallback.mockResolvedValue({
      page: null,
      errorCode: "CREDITS",
      errorMessage: FIRECRAWL_CREDITS_MESSAGE,
      source: "none",
    });

    const res = await POST(jsonRequest({ url: PRODUCT_URL }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.code).toBe("CREDITS");
    expect(body.error).toBe(FIRECRAWL_CREDITS_MESSAGE);
  });
});
