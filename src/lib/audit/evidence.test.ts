import { describe, expect, it } from "vitest";
import {
  evidenceStatusFromFindingStatus,
  isPageVerifiable,
  notVerifiedEvidence,
  resolveFindingEvidence,
} from "@/lib/audit/evidence";
import { analyzeGeo } from "@/lib/audit/geo-analyzer";
import type { NormalizedPage } from "@/lib/db/types";

function page(
  partial: Partial<NormalizedPage> & { structuredData?: Record<string, unknown> } = {}
): NormalizedPage {
  return {
    url: partial.url ?? "https://shop.example.com/products/serum",
    title: partial.title ?? "Serum",
    description: partial.description ?? "Hydrating serum for dry skin.",
    pageType: partial.pageType ?? "product",
    markdown: partial.markdown ?? "# Serum\n\nFor dry skin.",
    imageCount: partial.imageCount ?? 1,
    contentHash: partial.contentHash ?? "hash",
    structuredData: partial.structuredData ?? {},
    scrapeStatus: partial.scrapeStatus ?? "ok",
    scrapeMs: partial.scrapeMs,
  };
}

describe("Evidence Engine", () => {
  it("treats only scrapeStatus=ok pages as verifiable", () => {
    expect(isPageVerifiable(null)).toBe(false);
    expect(isPageVerifiable(undefined)).toBe(false);
    expect(isPageVerifiable(page({ scrapeStatus: "failed" }))).toBe(false);
    expect(isPageVerifiable(page({ scrapeStatus: "ok" }))).toBe(true);
  });

  it("maps finding status to PASS/FAIL without inventing NOT_VERIFIED", () => {
    expect(evidenceStatusFromFindingStatus("pass")).toBe("PASS");
    expect(evidenceStatusFromFindingStatus("warn")).toBe("FAIL");
    expect(evidenceStatusFromFindingStatus("fail")).toBe("FAIL");
  });

  it("returns NOT_VERIFIED with null detected values when page is unverifiable", () => {
    const resolved = resolveFindingEvidence({
      findingStatus: "fail",
      page: null,
      detectedValue: true,
      detectedState: "should-not-leak",
    });
    expect(resolved.evidenceStatus).toBe("NOT_VERIFIED");
    expect(resolved.evidence).toEqual(notVerifiedEvidence(null));
    expect(resolved.evidence.detectedValue).toBeNull();
    expect(resolved.evidence.detectedState).toBeNull();
  });

  it("keeps URL but clears invented detection when scrape failed", () => {
    const failed = page({
      url: "https://shop.example.com/products/serum",
      scrapeStatus: "failed",
    });
    const resolved = resolveFindingEvidence({
      findingStatus: "pass",
      page: failed,
      detectedValue: 3,
      detectedState: "faqCount=3",
    });
    expect(resolved.evidenceStatus).toBe("NOT_VERIFIED");
    expect(resolved.evidence.url).toBe("https://shop.example.com/products/serum");
    expect(resolved.evidence.detectedValue).toBeNull();
    expect(resolved.evidence.detectedState).toBeNull();
  });

  it("attaches PASS evidence with detected schema state on a rich page", () => {
    const rich = analyzeGeo(
      page({
        structuredData: {
          jsonLdTypes: ["Product", "FAQPage"],
          faq: [
            { q: "Q1?", a: "A1" },
            { q: "Q2?", a: "A2" },
            { q: "Q3?", a: "A3" },
          ],
        },
      })
    );

    const product = rich.findings.find((f) => f.id === "geo-product-schema");
    expect(product?.status).toBe("pass");
    expect(product?.evidenceStatus).toBe("PASS");
    expect(product?.evidence?.url).toBe("https://shop.example.com/products/serum");
    expect(product?.evidence?.detectedValue).toBe(true);
    expect(product?.evidence?.detectedState).toContain("hasProductSchema=true");
  });

  it("attaches FAIL evidence with detected absence when crawl verifies a gap", () => {
    const weak = analyzeGeo(
      page({
        title: "Product",
        description: "",
        markdown: "Buy now.",
        structuredData: {},
      })
    );

    const product = weak.findings.find((f) => f.id === "geo-product-schema");
    expect(product?.status).toBe("fail");
    expect(product?.evidenceStatus).toBe("FAIL");
    expect(product?.evidence?.url).toBe("https://shop.example.com/products/serum");
    expect(product?.evidence?.detectedValue).toBe(false);
    expect(product?.evidence?.detectedState).toBe("hasProductSchema=false");
  });

  it("marks all findings NOT_VERIFIED when crawl cannot verify the page", () => {
    const unverified = analyzeGeo(
      page({
        scrapeStatus: "failed",
        structuredData: { jsonLdTypes: ["Product"] },
      })
    );

    expect(unverified.findings.length).toBeGreaterThan(0);
    for (const finding of unverified.findings) {
      expect(finding.evidenceStatus).toBe("NOT_VERIFIED");
      expect(finding.evidence?.detectedValue).toBeNull();
      expect(finding.evidence?.detectedState).toBeNull();
      expect(finding.evidence?.url).toBe("https://shop.example.com/products/serum");
    }
  });

  it("marks findings NOT_VERIFIED for null page input without inventing detection", () => {
    const empty = analyzeGeo(null);
    expect(empty.findings.length).toBeGreaterThan(0);
    for (const finding of empty.findings) {
      expect(finding.evidenceStatus).toBe("NOT_VERIFIED");
      expect(finding.evidence?.url).toBeNull();
      expect(finding.evidence?.detectedValue).toBeNull();
      expect(finding.evidence?.detectedState).toBeNull();
    }
  });
});
