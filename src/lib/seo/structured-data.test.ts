import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { MARKETING_PLANS } from "@/lib/billing/plans";
import { translate } from "@/lib/locale/t";
import { HOME_FAQ_KEYS } from "@/lib/seo/faq-keys";
import {
  buildBlogArticleJsonLd,
  buildContactPageJsonLd,
  buildFaqPageJsonLd,
  buildHomeJsonLdGraph,
  buildSoftwareApplicationJsonLd,
  collectJsonLdUrls,
} from "@/lib/seo/structured-data";
import { CONTACT_EMAIL } from "@/lib/seo/contact";
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
    expect(graph["@graph"]).toHaveLength(4);

    const types = graph["@graph"].map((n) => n["@type"]);
    expect(types).toEqual(["Organization", "WebSite", "SoftwareApplication", "FAQPage"]);

    const orgNodes = graph["@graph"].filter((n) => n["@type"] === "Organization");
    expect(orgNodes).toHaveLength(1);

    const website = graph["@graph"].find((n) => n["@type"] === "WebSite");
    expect(website?.publisher).toEqual({ "@id": `${CANONICAL}#organization` });
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

  it("lists official X and LinkedIn profiles on Organization sameAs", () => {
    const graph = parseJsonLd(buildHomeJsonLdGraph()) as {
      "@graph": Array<Record<string, unknown>>;
    };
    const org = graph["@graph"].find((n) => n["@type"] === "Organization");
    expect(org?.sameAs).toEqual([...ORGANIZATION_SAME_AS]);
    expect(org?.email).toBe(CONTACT_EMAIL);
  });

  it("builds ContactPage schema pointing at the Organization", () => {
    const jsonLd = parseJsonLd(buildContactPageJsonLd()) as Record<string, unknown>;
    expect(jsonLd).toMatchObject({
      "@type": "ContactPage",
      url: `${CANONICAL}${ROUTES.contact}`,
      mainEntity: { "@id": `${CANONICAL}#organization` },
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

  it("builds blog Article schema from visible post title/excerpt without invented dates", () => {
    const now = new Date("2026-08-10T12:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    for (const post of BLOG_POSTS) {
      const title = translate(post.titleKey);
      const excerpt = translate(post.excerptKey);
      const article = buildBlogArticleJsonLd({
        title,
        description: excerpt,
        path: ROUTES.blogPost(post.slug),
        publishedOn: post.publishedOn,
      });

      expect(article.headline).toBe(title);
      expect(article.description).toBe(excerpt);
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
});
