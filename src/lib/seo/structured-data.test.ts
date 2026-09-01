import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BLOG_POSTS, blogPostMetaDescription } from "@/lib/blog-posts";
import { MARKETING_PLANS } from "@/lib/billing/plans";
import { translate } from "@/lib/locale/t";
import { HOME_FAQ_KEYS } from "@/lib/seo/faq-keys";
import {
  buildBlogArticleJsonLd,
  buildContactPageJsonLd,
  buildFaqPageJsonLd,
  buildHomeJsonLdGraph,
  buildMarketingPageJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebSiteJsonLd,
  collectJsonLdUrls,
} from "@/lib/seo/structured-data";
import { CONTACT_EMAIL } from "@/lib/seo/contact";
import { SITE_NAME, SITE_OFFICIAL_DESCRIPTION } from "@/lib/seo/site-copy";
import { ORGANIZATION_SAME_AS } from "@/lib/seo/social";
import { ROUTES } from "@/lib/routes";

const CANONICAL = "https://convaudit.example";

function parseJsonLd(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

describe("structured data", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", CANONICAL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("serializes homepage graph as valid JSON-LD with linked @graph entities", () => {
    const graph = parseJsonLd(buildHomeJsonLdGraph()) as {
      "@context": string;
      "@graph": Array<Record<string, unknown>>;
    };

    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@graph"]).toHaveLength(5);

    const types = graph["@graph"].map((n) => n["@type"]);
    expect(types).toEqual([
      "Organization",
      "WebSite",
      "WebPage",
      ["SoftwareApplication", "Product"],
      "FAQPage",
    ]);

    const orgNodes = graph["@graph"].filter((n) => n["@type"] === "Organization");
    expect(orgNodes).toHaveLength(1);
    expect(orgNodes[0]?.["@id"]).toBe(`${CANONICAL}/#organization`);
    expect(orgNodes[0]?.name).toBe(SITE_NAME);
    expect(orgNodes[0]?.url).toBe(CANONICAL);
    expect(orgNodes[0]?.description).toBe(SITE_OFFICIAL_DESCRIPTION);
    expect(orgNodes[0]?.areaServed).toHaveLength(6);
    expect(orgNodes[0]?.sameAs).toEqual([...ORGANIZATION_SAME_AS]);

    const website = graph["@graph"].find((n) => n["@type"] === "WebSite");
    expect(website?.["@id"]).toBe(`${CANONICAL}/#website`);
    expect(website?.name).toBe(SITE_NAME);
    expect(website?.url).toBe(CANONICAL);
    expect(website?.inLanguage).toBe("ar");
    expect(website?.publisher).toEqual({ "@id": `${CANONICAL}/#organization` });
    expect(website?.about).toEqual({ "@id": `${CANONICAL}/#software` });
    expect(website?.description).toBe(SITE_OFFICIAL_DESCRIPTION);

    const page = graph["@graph"].find((n) => n["@type"] === "WebPage");
    expect(page?.["@id"]).toBe(`${CANONICAL}/`);
    expect(page?.url).toBe(`${CANONICAL}/`);
    expect(page?.isPartOf).toEqual({ "@id": `${CANONICAL}/#website` });
    expect(page?.publisher).toEqual({ "@id": `${CANONICAL}/#organization` });

    const software = graph["@graph"].find((n) => {
      const t = n["@type"];
      return t === "SoftwareApplication" || (Array.isArray(t) && t.includes("SoftwareApplication"));
    });
    expect(software?.["@id"]).toBe(`${CANONICAL}/#software`);
    expect(software?.name).toBe("ConvAudit");
    expect(software?.url).toBe(CANONICAL);
    expect(software?.areaServed).toHaveLength(6);
    const features = software?.featureList as string[];
    expect(features.join(" ")).not.toMatch(/استعلام حي داخل ChatGPT/);
    expect(features.some((f) => f.includes("بدون استعلام حي"))).toBe(true);
  });

  it("uses the canonical deployment domain for every site-owned absolute URL", () => {
    const urls = collectJsonLdUrls(buildHomeJsonLdGraph());
    const sameAs = new Set<string>(ORGANIZATION_SAME_AS);
    const siteOwned = urls.filter((url) => !sameAs.has(url));

    expect(siteOwned.length).toBeGreaterThan(0);
    for (const url of siteOwned) {
      expect(url.startsWith(CANONICAL)).toBe(true);
      expect(url).not.toContain("localhost");
    }
  });

  it("lists only confirmed official profiles on Organization sameAs", () => {
    const graph = parseJsonLd(buildHomeJsonLdGraph()) as {
      "@graph": Array<Record<string, unknown>>;
    };
    const org = graph["@graph"].find((n) => n["@type"] === "Organization");
    if (ORGANIZATION_SAME_AS.length > 0) {
      expect(org?.sameAs).toEqual([...ORGANIZATION_SAME_AS]);
    } else {
      expect(org?.sameAs).toBeUndefined();
    }
    expect(JSON.stringify(org)).not.toMatch(/conva-aduit|StorePulse/i);
    expect(org?.email).toBe(CONTACT_EMAIL);
    expect(org?.logo).toEqual({
      "@type": "ImageObject",
      url: `${CANONICAL}/apple-icon`,
      width: 180,
      height: 180,
    });
  });

  it("emits official www @ids when APP_URL is the production origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.convaudit.com");
    const graph = parseJsonLd(buildHomeJsonLdGraph()) as {
      "@graph": Array<Record<string, unknown>>;
    };
    const org = graph["@graph"].find((n) => n["@type"] === "Organization");
    const website = graph["@graph"].find((n) => n["@type"] === "WebSite");
    expect(org?.["@id"]).toBe("https://www.convaudit.com/#organization");
    expect(org?.name).toBe("ConvAudit");
    expect(org?.url).toBe("https://www.convaudit.com");
    expect(org?.description).toBe(SITE_OFFICIAL_DESCRIPTION);
    expect(org?.sameAs).toEqual([...ORGANIZATION_SAME_AS]);
    expect(website?.["@id"]).toBe("https://www.convaudit.com/#website");
    expect(website?.name).toBe("ConvAudit");
    expect(website?.url).toBe("https://www.convaudit.com");
    expect(website?.description).toBe(SITE_OFFICIAL_DESCRIPTION);
    expect(website?.inLanguage).toBe("ar");
    expect(website?.publisher).toEqual({ "@id": "https://www.convaudit.com/#organization" });
    const page = graph["@graph"].find((n) => n["@type"] === "WebPage");
    expect(page?.["@id"]).toBe("https://www.convaudit.com/");
    expect(page?.url).toBe("https://www.convaudit.com/");
  });

  it("builds standalone Organization and WebSite nodes with the official entity", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.convaudit.com");
    const org = parseJsonLd(buildOrganizationJsonLd()) as Record<string, unknown>;
    const website = parseJsonLd(buildWebSiteJsonLd()) as Record<string, unknown>;

    expect(org).toMatchObject({
      "@type": "Organization",
      "@id": "https://www.convaudit.com/#organization",
      name: "ConvAudit",
      url: "https://www.convaudit.com",
      description: SITE_OFFICIAL_DESCRIPTION,
    });
    expect(org.sameAs).toEqual([...ORGANIZATION_SAME_AS]);
    expect(JSON.stringify(org)).not.toMatch(/x\.com|linkedin\.com/i);

    expect(website).toMatchObject({
      "@type": "WebSite",
      "@id": "https://www.convaudit.com/#website",
      name: "ConvAudit",
      url: "https://www.convaudit.com",
      inLanguage: "ar",
      description: SITE_OFFICIAL_DESCRIPTION,
      publisher: { "@id": "https://www.convaudit.com/#organization" },
    });
  });

  it("builds ContactPage schema pointing at the Organization without a second WebPage", () => {
    const jsonLd = parseJsonLd(buildContactPageJsonLd()) as {
      "@graph": Array<Record<string, unknown>>;
    };
    const types = jsonLd["@graph"].map((n) => n["@type"]);
    expect(types).toEqual(["Organization", "WebSite", "ContactPage", "BreadcrumbList"]);
    expect(types).not.toContain("WebPage");

    const orgNodes = jsonLd["@graph"].filter((n) => n["@type"] === "Organization");
    expect(orgNodes).toHaveLength(1);

    const page = jsonLd["@graph"].find((n) => n["@type"] === "ContactPage");
    expect(page).toMatchObject({
      url: `${CANONICAL}${ROUTES.contact}`,
      mainEntity: { "@id": `${CANONICAL}/#organization` },
      isPartOf: { "@id": `${CANONICAL}/#website` },
      publisher: { "@id": `${CANONICAL}/#organization` },
    });
  });

  it("emits EGP offers that match marketing plan monthly prices", () => {
    const jsonLd = buildSoftwareApplicationJsonLd();
    const offers = jsonLd.offers as Array<{
      price: string;
      priceCurrency: string;
      name: string;
      url: string;
    }>;

    expect(offers).toHaveLength(MARKETING_PLANS.length);
    for (const plan of MARKETING_PLANS) {
      const offer = offers.find((o) => o.name === plan.name);
      expect(offer).toMatchObject({
        price: String(plan.monthlyPrice),
        priceCurrency: "EGP",
        url: `${CANONICAL}${ROUTES.pricing}`,
      });
    }
    expect(offers.some((o) => o.priceCurrency === "USD")).toBe(false);
  });

  it("builds FAQ schema from the same keys as the visible homepage FAQ", () => {
    const faq = buildFaqPageJsonLd();
    expect(faq.mainEntity).toHaveLength(HOME_FAQ_KEYS.length);
    for (const { qKey, aKey } of HOME_FAQ_KEYS) {
      const entity = faq.mainEntity.find((e) => e.name === translate(qKey));
      expect(entity?.acceptedAnswer.text).toBe(translate(aKey));
    }
    for (const entity of faq.mainEntity) {
      expect(String(entity.name)).not.toMatch(/بنسبة\s*\d+\s*%/);
      expect(String(entity.acceptedAnswer.text)).not.toMatch(/بنسبة\s*\d+\s*%/);
    }
  });

  it("builds blog Article schema from the canonical meta description without invented dates", () => {
    const now = new Date("2026-08-10T12:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    for (const post of BLOG_POSTS) {
      const title = translate(post.titleKey);
      const excerpt = translate(post.excerptKey);
      const description = blogPostMetaDescription(post, excerpt);
      const article = buildBlogArticleJsonLd({
        title,
        description,
        path: ROUTES.blogPost(post.slug),
        publishedOn: post.publishedOn,
      });

      expect(article.headline).toBe(title);
      expect(article.description).toBe(description);
      expect(article.description).not.toMatch(/يوصون بمنتجاتك/);
      expect(article.description).not.toMatch(/ترفع المبيعات فوراً/);
      expect(article.description).not.toMatch(/أمثلة حقيقية/);
      expect(article.url).toBe(`${CANONICAL}${ROUTES.blogPost(post.slug)}`);
      expect(article.dateModified).toBeUndefined();

      const published = article.datePublished as string | undefined;
      if (post.publishedOn <= "2026-08-10") {
        expect(published).toBe(post.publishedOn);
      } else {
        expect(published).toBeUndefined();
      }
    }

    vi.useRealTimers();
  });

  it("does not claim live ChatGPT or Perplexity search integrations", () => {
    const faq = buildFaqPageJsonLd();
    const blob = JSON.stringify(faq);
    expect(blob).toMatch(/لا يدمج ChatGPT أو Perplexity/);
    expect(blob).not.toMatch(/نختبر صفحتك داخل ChatGPT/);
    expect(blob).toMatch(/Shopify/);
    expect(blob).toMatch(/WooCommerce/);
    expect(blob).toMatch(/سلة \(Salla\)/);
    expect(blob).toMatch(/زد \(Zid\)/);

    const software = buildSoftwareApplicationJsonLd();
    expect(JSON.stringify(software.featureList)).toMatch(/بدون استعلام حي/);
    expect(JSON.stringify(software.featureList)).toMatch(/تحليل المنافسين/);
    expect(JSON.stringify(software.description)).toMatch(/Gemini/);
    expect(software.hasOfferCatalog.itemListElement).toHaveLength(5);
    expect(JSON.stringify(software.hasOfferCatalog)).toMatch(/تدقيق SEO/);
    expect(JSON.stringify(software.hasOfferCatalog)).toMatch(/تدقيق التحويل/);
    expect(JSON.stringify(software.hasOfferCatalog)).toMatch(/GEO/);
    expect(JSON.stringify(software.hasOfferCatalog)).toMatch(/إشارات الثقة/);
    expect(JSON.stringify(software.hasOfferCatalog)).toMatch(/تحليل المنافسين/);
  });

  it("builds inner marketing WebPage + BreadcrumbList linked to site entities", () => {
    const jsonLd = parseJsonLd(
      buildMarketingPageJsonLd({
        name: "التوثيق ودليل البدء",
        path: ROUTES.docs,
        description: "دليل المنتج",
      })
    ) as { "@graph": Array<Record<string, unknown>> };

    const org = jsonLd["@graph"].find((n) => n["@type"] === "Organization");
    const website = jsonLd["@graph"].find((n) => n["@type"] === "WebSite");
    const page = jsonLd["@graph"].find((n) => n["@type"] === "WebPage");
    const crumbs = jsonLd["@graph"].find((n) => n["@type"] === "BreadcrumbList");
    expect(jsonLd["@graph"].filter((n) => n["@type"] === "Organization")).toHaveLength(1);
    expect(org?.["@id"]).toBe(`${CANONICAL}/#organization`);
    expect(website?.["@id"]).toBe(`${CANONICAL}/#website`);
    expect(website?.publisher).toEqual({ "@id": `${CANONICAL}/#organization` });
    expect(page?.isPartOf).toEqual({ "@id": `${CANONICAL}/#website` });
    expect(page?.about).toEqual({ "@id": `${CANONICAL}/#software` });
    expect(page?.publisher).toEqual({ "@id": `${CANONICAL}/#organization` });
    expect(page?.url).toBe(`${CANONICAL}${ROUTES.docs}`);
    expect(crumbs?.itemListElement).toHaveLength(2);
  });
});
