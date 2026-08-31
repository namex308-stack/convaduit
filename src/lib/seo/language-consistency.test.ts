import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ABOUT_DESCRIPTION } from "@/app/about/copy";
import { BLOG_POSTS, blogPostMetaDescription } from "@/lib/blog-posts";
import { hasArabicScript } from "@/lib/locale";
import { getEnabledLocales, getLocaleConfig, LOCALES } from "@/lib/locale/config";
import { translate } from "@/lib/locale/t";
import { ROUTES } from "@/lib/routes";
import { PUBLIC_PAGE_ROBOTS, publicPageMetadata } from "@/lib/seo/page-metadata";
import {
  PRIVATE_PAGE_ROBOTS,
  privatePageMetadata,
} from "@/lib/seo/private-page-metadata";
import {
  SITE_DEFAULT_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OFFICIAL_DESCRIPTION,
} from "@/lib/seo/site-copy";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo/structured-data";

describe("Arabic-first public language strategy", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.convaudit.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps the document language Arabic and does not enable an English locale", () => {
    expect(LOCALES.ar.htmlLang).toBe("ar");
    expect(LOCALES.ar.dir).toBe("rtl");
    expect(LOCALES.ar.enabled).toBe(true);
    expect(getLocaleConfig("ar").htmlLang).toBe("ar");
    expect(getEnabledLocales().map((locale) => locale.id)).toEqual(["ar"]);
    expect(Object.values(LOCALES).some((locale) => locale.htmlLang === "en")).toBe(
      false
    );
  });

  it("aligns homepage SERP title and description with Arabic UI", () => {
    expect(SITE_NAME).toBe("ConvAudit");
    expect(hasArabicScript(SITE_DEFAULT_TITLE)).toBe(true);
    expect(hasArabicScript(SITE_DESCRIPTION)).toBe(true);
    expect(SITE_DESCRIPTION).not.toBe(SITE_OFFICIAL_DESCRIPTION);
    expect(SITE_DESCRIPTION).not.toBe(ABOUT_DESCRIPTION);
    expect(hasArabicScript(SITE_OFFICIAL_DESCRIPTION)).toBe(false);
    expect(SITE_OFFICIAL_DESCRIPTION).toMatch(/AI-powered ecommerce audit and visibility platform/);
  });

  it("keeps the official English entity sentence on schema, not as the homepage meta description", () => {
    expect(buildOrganizationJsonLd().description).toBe(SITE_OFFICIAL_DESCRIPTION);
    expect(buildWebSiteJsonLd().description).toBe(SITE_OFFICIAL_DESCRIPTION);
    expect(SITE_DESCRIPTION).not.toBe(SITE_OFFICIAL_DESCRIPTION);
  });

  it("keeps public marketing pages indexable and private app routes noindex/nofollow", () => {
    const publicMeta = publicPageMetadata({
      title: SITE_DEFAULT_TITLE,
      description: SITE_DESCRIPTION,
      path: ROUTES.home,
    });
    expect(publicMeta.robots).toEqual(PUBLIC_PAGE_ROBOTS);
    expect(PUBLIC_PAGE_ROBOTS.index).toBe(true);
    expect(PUBLIC_PAGE_ROBOTS.follow).toBe(true);

    const privateMeta = privatePageMetadata();
    expect(privateMeta.robots).toEqual(PRIVATE_PAGE_ROBOTS);
    expect(PRIVATE_PAGE_ROBOTS.index).toBe(false);
    expect(PRIVATE_PAGE_ROBOTS.follow).toBe(false);
    expect(privateMeta.keywords).toEqual([]);
  });

  it("keeps blog metadata Arabic and representative of each article", () => {
    for (const post of BLOG_POSTS) {
      const title = translate(post.titleKey);
      const excerpt = translate(post.excerptKey);
      const description = blogPostMetaDescription(post, excerpt);
      expect(hasArabicScript(title)).toBe(true);
      expect(hasArabicScript(description)).toBe(true);
      expect(description).toBe(post.metaDescription);
      expect(description.length).toBeGreaterThan(40);
      expect(description).not.toMatch(/ecommerce SEO audit.*Shopify SEO audit.*WooCommerce SEO audit/);
    }
  });
});
