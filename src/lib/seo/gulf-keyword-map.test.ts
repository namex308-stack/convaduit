import { describe, expect, it } from "vitest";
import { BLOG_SLUGS } from "@/lib/blog-posts";
import { ROUTES } from "@/lib/routes";
import {
  blogSlugsInKeywordMap,
  GULF_CC_MARKETS,
  GULF_KEYWORD_MAP,
  gulfAreaServedSchema,
} from "@/lib/seo/gulf-keyword-map";

describe("Gulf keyword map", () => {
  it("covers every GCC market in structured data", () => {
    expect(GULF_CC_MARKETS).toEqual([
      "Saudi Arabia",
      "United Arab Emirates",
      "Qatar",
      "Kuwait",
      "Bahrain",
      "Oman",
    ]);
    expect(gulfAreaServedSchema()).toHaveLength(6);
    expect(gulfAreaServedSchema()[0]).toEqual({ "@type": "Country", name: "Saudi Arabia" });
  });

  it("maps primary commercial intent to homepage and pricing", () => {
    const home = GULF_KEYWORD_MAP.find((entry) => entry.path === ROUTES.home);
    const pricing = GULF_KEYWORD_MAP.find((entry) => entry.path === ROUTES.pricing);
    expect(home?.intent).toBe("commercial");
    expect(pricing?.intent).toBe("commercial");
    expect(home?.primary).toContain("ecommerce audit");
    expect(pricing?.secondary).toContain("Salla audit");
  });

  it("maps every published blog slug to a keyword assignment", () => {
    expect(blogSlugsInKeywordMap().sort()).toEqual([...BLOG_SLUGS].sort());
  });
});
