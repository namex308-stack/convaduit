import { describe, expect, it } from "vitest";
import {
  ABOUT_DESCRIPTION,
  ABOUT_SECTIONS,
  ABOUT_TITLE,
  collectAboutInternalLinks,
  aboutParagraphParts,
} from "@/app/about/copy";
import { SITE_OFFICIAL_DESCRIPTION } from "@/lib/seo/site-copy";

function aboutBody(): string {
  return ABOUT_SECTIONS.flatMap((section) => [
    section.t,
    ...section.paragraphs.map((p) => p.text),
  ]).join("\n");
}

describe("about content SEO", () => {
  it("keeps the about H1 label and a unique factual description", () => {
    expect(ABOUT_TITLE).toBe("من نحن");
    expect(ABOUT_DESCRIPTION).toContain("ConvAudit");
    expect(ABOUT_DESCRIPTION).toContain("https://www.convaudit.com");
    expect(ABOUT_DESCRIPTION).not.toMatch(/\d+\s*%/);
    expect(ABOUT_DESCRIPTION.length).toBeGreaterThan(80);
    expect(ABOUT_DESCRIPTION.length).toBeLessThanOrEqual(200);
  });

  it("states the official brand sentence and required topics without stuffing", () => {
    const body = aboutBody();
    expect(body).toContain(SITE_OFFICIAL_DESCRIPTION);
    expect(body).toContain("ما هو ConvAudit؟");
    expect(body).toContain("لمن؟");
    expect(body).toContain("المشكلة التي نحلها");
    expect(body).toContain("كيف يعمل");
    expect(body).toContain("تدقيق SEO للمتاجر الإلكترونية");
    expect(body).toContain("تدقيق المتاجر الإلكترونية");
    expect(body).toContain("تدقيق موقع المتجر الإلكتروني");
    expect(body).toContain("تحسين التحويل للمتاجر الإلكترونية");
    expect(body).toContain("Shopify");
    expect(body).toContain("WooCommerce");
    expect(body).toContain("الظهور في الذكاء الاصطناعي");
    expect(body).toContain("GEO");
    expect(body).toContain("إشارات الثقة");
    expect(body).toContain("تحليل المنافسين");
    expect(body).toMatch(/Shopify/);
    expect(body).toMatch(/WooCommerce/);
    expect(body).toMatch(/سلة/);
    expect(body).toMatch(/زد/);

    expect((body.match(/تدقيق SEO للمتاجر الإلكترونية/g) ?? []).length).toBe(1);
    expect((body.match(/Shopify/g) ?? []).length).toBeGreaterThan(0);
    expect((body.match(/WooCommerce/g) ?? []).length).toBeGreaterThan(0);
    expect(body).not.toMatch(/StorePulse|ConvaDuit|CONVADUIT/i);
    expect(body).not.toMatch(/بنسبة\s*\d+\s*%/);
    expect(body).toMatch(/ليست استعلاماً حياً/);
  });

  it("wraps topic phrases as public internal links without inventing destinations", () => {
    const links = collectAboutInternalLinks();
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const host = ABOUT_SECTIONS.flatMap((s) => s.paragraphs).find((p) =>
        (p.links ?? []).some((item) => item.phrase === link.phrase && item.href === link.href)
      );
      expect(host, link.phrase).toBeTruthy();
      expect(host?.text.includes(link.phrase)).toBe(true);
      const parts = aboutParagraphParts(host!);
      expect(parts.some((part) => part.type === "link" && part.href === link.href)).toBe(
        true
      );
    }
  });
});
