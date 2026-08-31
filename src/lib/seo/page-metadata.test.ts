import { hasArabicScript } from "@/lib/locale";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { translate } from "@/lib/locale/t";
import {
  OG_IMAGE,
  publicPageMetadata,
  resolvePublicTitle,
  TWITTER_IMAGE,
} from "@/lib/seo/page-metadata";
import {
  SITE_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_KEYWORDS,
  SITE_OFFICIAL_DESCRIPTION,
  SITE_OG_TITLE,
  SITE_TITLE_MAX,
} from "@/lib/seo/site-copy";
import { ROUTES } from "@/lib/routes";

const CANONICAL = "https://www.convaudit.com";

describe("public page metadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", CANONICAL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets unique absolute www canonical, OG, Twitter, and locale fields", () => {
    const meta = publicPageMetadata({
      title: "أسعار تدقيق المتاجر",
      description: "وصف فريد للأسعار",
      path: ROUTES.pricing,
    });

    expect(meta.title).toBe("أسعار تدقيق المتاجر");
    expect(meta.description).toBe("وصف فريد للأسعار");
    expect(meta.alternates).toEqual({
      canonical: `${CANONICAL}${ROUTES.pricing}`,
      languages: {
        ar: `${CANONICAL}${ROUTES.pricing}`,
        "x-default": `${CANONICAL}${ROUTES.pricing}`,
      },
    });
    expect(meta.openGraph).toMatchObject({
      title: "أسعار تدقيق المتاجر",
      description: "وصف فريد للأسعار",
      url: `${CANONICAL}${ROUTES.pricing}`,
      siteName: "ConvAudit",
      locale: "ar_EG",
      type: "website",
      images: [OG_IMAGE],
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: "أسعار تدقيق المتاجر",
      description: "وصف فريد للأسعار",
      images: [TWITTER_IMAGE],
    });
    expect(meta.twitter).not.toHaveProperty("site");
    expect(meta.twitter).not.toHaveProperty("creator");
    expect(meta.robots).toEqual({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    });
  });

  it("rewrites apex APP_URL to the www canonical", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://convaudit.com");
    const meta = publicPageMetadata({
      title: "من نحن",
      description: "وصف",
      path: ROUTES.about,
    });
    expect(meta.alternates).toEqual({
      canonical: `${CANONICAL}${ROUTES.about}`,
      languages: {
        ar: `${CANONICAL}${ROUTES.about}`,
        "x-default": `${CANONICAL}${ROUTES.about}`,
      },
    });
    expect(meta.openGraph).toMatchObject({ url: `${CANONICAL}${ROUTES.about}` });
  });

  it("supports noindex for non-indexable public surfaces", () => {
    const meta = publicPageMetadata({
      title: "صفحة غير مفهرسة",
      description: "وصف اختباري",
      path: "/temporary-public-shell",
      indexable: false,
    });
    expect(meta.robots).toEqual({
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    });
  });

  it("keeps the homepage document title within the SERP display limit", () => {
    expect(SITE_DEFAULT_TITLE.length).toBeGreaterThan(10);
    expect(SITE_DEFAULT_TITLE.length).toBeLessThanOrEqual(SITE_TITLE_MAX);
    expect(OG_IMAGE.alt).toBe(SITE_OG_TITLE);
    expect(TWITTER_IMAGE.alt).toBe(SITE_OG_TITLE);
    expect(SITE_DEFAULT_TITLE).toMatch(/SEO/i);
    expect(SITE_DEFAULT_TITLE).toMatch(/GEO/i);
    expect(SITE_DEFAULT_TITLE).toMatch(/تدقيق/);
    expect(hasArabicScript(SITE_DEFAULT_TITLE)).toBe(true);
  });

  it("emits the official www home canonical with a trailing slash", () => {
    const meta = publicPageMetadata({
      title: SITE_DEFAULT_TITLE,
      description: SITE_DESCRIPTION,
      path: ROUTES.home,
    });
    expect(meta.alternates).toEqual({
      canonical: `${CANONICAL}/`,
      languages: {
        ar: `${CANONICAL}/`,
        "x-default": `${CANONICAL}/`,
      },
    });
    expect(meta.openGraph).toMatchObject({
      title: SITE_DEFAULT_TITLE,
      description: SITE_DESCRIPTION,
      url: `${CANONICAL}/`,
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: SITE_DEFAULT_TITLE,
      description: SITE_DESCRIPTION,
    });
  });

  it("keeps the homepage description factual, Arabic-first, and free of keyword stuffing", () => {
    expect(SITE_DESCRIPTION).not.toBe(SITE_OFFICIAL_DESCRIPTION);
    expect(hasArabicScript(SITE_DESCRIPTION)).toBe(true);
    expect(SITE_DESCRIPTION).toMatch(/ConvAudit/);
    expect(SITE_DESCRIPTION).toMatch(/تدقيق/);
    expect(SITE_DESCRIPTION).toMatch(/SEO/);
    expect(SITE_DESCRIPTION).toMatch(/GEO/);
    expect(SITE_DESCRIPTION).toMatch(/تحويل/);
    expect(SITE_DESCRIPTION).not.toMatch(/\d+\s*%/);
    expect(SITE_DESCRIPTION.length).toBeGreaterThan(40);
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(180);
    expect((SITE_DESCRIPTION.match(/ecommerce SEO audit/gi) ?? []).length).toBe(0);
    const seoHits = SITE_DESCRIPTION.match(/SEO/g) ?? [];
    expect(seoHits.length).toBeLessThanOrEqual(2);
  });

  it("lists primary English keywords without repeating them in the description", () => {
    expect(SITE_KEYWORDS).toContain("ecommerce SEO audit");
    expect(SITE_KEYWORDS).toContain("Shopify SEO audit");
    expect(SITE_KEYWORDS).toContain("GEO audit");
    expect(SITE_KEYWORDS).toContain("ecommerce competitor analysis");
  });

  it("drops the site suffix when the composed title would exceed 60 characters", () => {
    const long = "الدليل الكامل لتحسين الظهور في محركات الذكاء الاصطناعي";
    expect(`${long} · ConvAudit`.length).toBeGreaterThan(SITE_TITLE_MAX);
    expect(resolvePublicTitle(long)).toEqual({ absolute: long });
    expect(resolvePublicTitle("الأسعار")).toBe("الأسعار");
  });

  it("keeps blog post titles/excerpts free of unsupported conversion percentages", () => {
    for (const post of BLOG_POSTS) {
      const title = translate(post.titleKey);
      const excerpt = translate(post.excerptKey);
      expect(title).not.toMatch(/بنسبة\s*\d+\s*%/);
      expect(excerpt).not.toMatch(/بنسبة\s*\d+\s*%/);
      expect(title.trim().length).toBeGreaterThan(0);
      expect(excerpt.trim().length).toBeGreaterThan(0);
    }
  });
});
