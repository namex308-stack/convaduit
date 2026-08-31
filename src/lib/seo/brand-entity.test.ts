import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ABOUT_SECTIONS, ABOUT_SUBTITLE } from "@/app/about/copy";
import { translate } from "@/lib/locale/t";
import { arMessages } from "@/lib/locale/messages/ar";
import { buildLlmsTxt } from "@/lib/seo/llms-txt";
import { SITE_NAME, SITE_OFFICIAL_DESCRIPTION } from "@/lib/seo/site-copy";
import { ORGANIZATION_SAME_AS, SOCIAL_PROFILES } from "@/lib/seo/social";
import {
  buildHomeJsonLdGraph,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/structured-data";

const PRODUCTION = "https://www.convaudit.com";
const FORBIDDEN_PUBLIC_BRAND = /StorePulse|Store Pulse|ConvaDuit|CONVADUIT|conva-aduit/i;
const OFFICIAL_DESCRIPTION =
  "ConvAudit is an AI-powered ecommerce audit and analytics platform for Gulf GCC online stores, analyzing SEO audits, conversion rate optimization (CRO), AI visibility (GEO), competitor performance, product page optimization, and trust signals for Shopify, Salla, Zid, WooCommerce, and custom storefronts.";

const PUBLIC_MESSAGE_PREFIXES = [
  "hero.",
  "footer.",
  "features.",
  "whyLose.",
  "cta.",
  "methodology.",
  "logos.",
  "how.",
  "faq.",
  "pricing.",
  "comparison.",
  "decision.",
  "trust.",
  "blog.",
  "contact.",
  "auth.",
] as const;

function homepageH1(): string {
  return `${translate("hero.headline1")} ${translate("hero.headline3")}`;
}

function readSrc(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("public brand entity", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", PRODUCTION);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps one official English description on About, schema, and llms.txt", () => {
    expect(SITE_NAME).toBe("ConvAudit");
    expect(SITE_OFFICIAL_DESCRIPTION).toBe(OFFICIAL_DESCRIPTION);

    const aboutBody = ABOUT_SECTIONS.flatMap((section) =>
      section.paragraphs.map((p) => p.text)
    ).join("\n");
    expect(aboutBody).toContain(SITE_OFFICIAL_DESCRIPTION);
    expect(ABOUT_SUBTITLE).toContain("ConvAudit");

    expect(buildLlmsTxt()).toContain(`> ${SITE_OFFICIAL_DESCRIPTION}`);
    expect(buildOrganizationJsonLd().description).toBe(SITE_OFFICIAL_DESCRIPTION);
    expect(buildWebSiteJsonLd().description).toBe(SITE_OFFICIAL_DESCRIPTION);
  });

  it("puts ConvAudit in the visible homepage H1 without a hidden heading workaround", () => {
    const h1 = homepageH1();
    expect(h1).toMatch(/ConvAudit/);
    expect(h1).toMatch(/متجرك يخسر مبيعات/);
    expect(h1).toMatch(/الذكاء الاصطناعي/);

    const heroSrc = readSrc("src/components/sections/hero.tsx");
    expect(heroSrc).toMatch(/<h1\b/);
    expect(heroSrc).not.toMatch(/<h1[^>]*sr-only/);
    expect(heroSrc).not.toMatch(/className="sr-only"/);

    const homeSrc = readSrc("src/app/page.tsx");
    expect(homeSrc).toContain("<Hero />");
    expect(homeSrc).not.toMatch(/sr-only/);
    expect(homeSrc).not.toMatch(/HomeEntityCopy/);
  });

  it("states ecommerce audit, SEO, conversion, GEO, and trust on the visible homepage", () => {
    const visible = [
      homepageH1(),
      translate("hero.subheadline"),
      translate("hero.pillar.seo"),
      translate("hero.pillar.conversion"),
      translate("hero.pillar.geo"),
      translate("hero.pillar.trust"),
      translate("features.geo.name"),
      translate("features.seo.name"),
      translate("features.conversion.name"),
      translate("features.trust.name"),
    ].join("\n");

    expect(visible).toMatch(/ConvAudit/);
    expect(visible).toMatch(/تدقيق.*متاجر إلكترونية/);
    expect(visible).toMatch(/SEO/);
    expect(visible).toMatch(/تحويل/);
    expect(visible).toMatch(/GEO/);
    expect(visible).toMatch(/إشارات الثقة|الثقة/);
  });

  it("positions the footer as an ecommerce audit/visibility platform", () => {
    const tagline = translate("footer.tagline");
    expect(tagline).not.toMatch(/مستشار نمو/);
    expect(tagline).toContain("منصة تدقيق وظهور للمتاجر الإلكترونية بالذكاء الاصطناعي");
  });

  it("does not invent Organization sameAs profiles", () => {
    expect(SOCIAL_PROFILES).toEqual([]);
    expect(ORGANIZATION_SAME_AS).toEqual([]);
    const org = buildOrganizationJsonLd() as Record<string, unknown>;
    expect(org.sameAs).toBeUndefined();
    expect(JSON.stringify(org)).not.toMatch(/x\.com|linkedin\.com|facebook\.com|instagram\.com/i);
  });

  it("does not use StorePulse or ConvaDuit as public brand names", () => {
    expect(SITE_NAME).not.toMatch(FORBIDDEN_PUBLIC_BRAND);
    expect(SITE_OFFICIAL_DESCRIPTION).not.toMatch(FORBIDDEN_PUBLIC_BRAND);
    expect(homepageH1()).not.toMatch(FORBIDDEN_PUBLIC_BRAND);
    expect(translate("footer.tagline")).not.toMatch(FORBIDDEN_PUBLIC_BRAND);
    expect(JSON.stringify(buildHomeJsonLdGraph())).not.toMatch(FORBIDDEN_PUBLIC_BRAND);
    expect(buildLlmsTxt()).not.toMatch(FORBIDDEN_PUBLIC_BRAND);

    for (const [key, value] of Object.entries(arMessages)) {
      if (PUBLIC_MESSAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        expect(value, key).not.toMatch(FORBIDDEN_PUBLIC_BRAND);
      }
    }
  });
});
