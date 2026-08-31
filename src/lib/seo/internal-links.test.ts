import { describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import { collectAboutInternalLinks } from "@/app/about/copy";
import { DOCS_RELATED_LINKS } from "@/app/docs/related-links";
import { FOOTER_LINK_COLS } from "@/components/layout/footer";
import { HOME_ENTITY_LINKS } from "@/components/sections/home-entity";
import { TRUST_RESOURCE_LINKS } from "@/components/sections/trust-resources";
import { BLOG_SLUGS, relatedBlogSlugs } from "@/lib/blog-posts";
import { ROUTES } from "@/lib/routes";
import {
  isPrivateOrNoindexPath,
  isResolvablePublicInternalHref,
  PUBLIC_INDEXABLE_PATHS,
  internalPathname,
} from "@/lib/seo/internal-links";
import {
  CRAWLABLE_LOGIN_HREF,
  CRAWLABLE_START_AUDIT_HREF,
} from "@/lib/use-navigate";

/** Indexable public paths that must appear as real footer hrefs. */
const SITEMAP_STATIC_PATHS = [
  ROUTES.pricing,
  ROUTES.docs,
  ROUTES.blog,
  ROUTES.security,
  ROUTES.privacy,
  ROUTES.terms,
  ROUTES.refundPolicy,
  ROUTES.about,
  ROUTES.contact,
  ROUTES.roadmap,
  ROUTES.shopify,
] as const;

const TOPIC_BLOG_HREFS = {
  seo: ROUTES.blogPost("product-schema-markup"),
  conversion: ROUTES.blogPost("conversion-rate-optimization"),
  geo: ROUTES.blogPost("geo-ai-visibility-guide"),
  trust: ROUTES.blogPost("trust-signals-ecommerce"),
  competitor: ROUTES.blogPost("competitor-analysis-strategy"),
} as const;

function marketingInventoryHrefs(): string[] {
  return [
    ...FOOTER_LINK_COLS.flatMap((col) => col.links.map((l) => l.href)),
    ...collectAboutInternalLinks().map((l) => l.href),
    ...DOCS_RELATED_LINKS.map((l) => l.href),
    ...TRUST_RESOURCE_LINKS.map((l) => l.href),
    ...HOME_ENTITY_LINKS.map((l) => l.href),
  ];
}

describe("public internal links crawlability", () => {
  it("exposes guest auth/audit CTAs as stable crawlable hrefs", () => {
    expect(CRAWLABLE_START_AUDIT_HREF).toMatch(/^\/auth\?/);
    expect(CRAWLABLE_START_AUDIT_HREF).toContain("mode=signup");
    expect(CRAWLABLE_START_AUDIT_HREF).toContain("next=");
    expect(CRAWLABLE_LOGIN_HREF).toMatch(/^\/auth\?/);
    expect(CRAWLABLE_LOGIN_HREF).toContain("mode=login");
  });

  it("covers every sitemap static page from the footer with real hrefs", () => {
    const hrefs = FOOTER_LINK_COLS.flatMap((col) => col.links.map((l) => l.href));
    for (const path of SITEMAP_STATIC_PATHS) {
      expect(hrefs, `missing footer link for ${path}`).toContain(path);
    }
    expect(hrefs.every((h) => h.startsWith("/") && !h.startsWith("javascript:"))).toBe(
      true
    );
  });

  it("does not send marketing GEO links to the private /geo app route", () => {
    const hrefs = FOOTER_LINK_COLS.flatMap((col) => col.links.map((l) => l.href));
    expect(hrefs).not.toContain(ROUTES.geo);
    expect(hrefs).toContain("/#methodology");
    expect(hrefs).toContain("/#platforms");
    expect(hrefs).toContain("/#how");
    expect(hrefs).toContain(`${ROUTES.docs}#2`);
    for (const slug of BLOG_SLUGS) {
      expect(hrefs).toContain(ROUTES.blogPost(slug));
    }
  });

  it("does not use empty or hash-only footer destinations", () => {
    const hrefs = FOOTER_LINK_COLS.flatMap((col) => col.links.map((l) => l.href));
    for (const href of hrefs) {
      expect(href.length).toBeGreaterThan(1);
      expect(href).not.toBe("#");
    }
  });
});

describe("internal linking inventory", () => {
  it("has no orphan indexable pages once footer inbound links are counted", () => {
    const inbound = new Set(
      [ROUTES.home, ...marketingInventoryHrefs()].map((href) => internalPathname(href))
    );
    const orphans = PUBLIC_INDEXABLE_PATHS.filter((path) => !inbound.has(path));
    expect(orphans).toEqual([]);
  });

  it("resolves marketing inventory hrefs to public indexable paths and known fragments", () => {
    for (const href of marketingInventoryHrefs()) {
      expect(href.startsWith("#"), `hash-only href ${href}`).toBe(false);
      expect(isResolvablePublicInternalHref(href), href).toBe(true);
      expect(isPrivateOrNoindexPath(internalPathname(href)), href).toBe(false);
    }
  });

  it("does not add topical content links to auth, dashboard, onboarding, or /geo", () => {
    const topical = [
      ...collectAboutInternalLinks().map((l) => l.href),
      ...DOCS_RELATED_LINKS.map((l) => l.href),
      ...HOME_ENTITY_LINKS.map((l) => l.href),
    ];
    for (const href of topical) {
      const path = internalPathname(href);
      expect(path).not.toBe(ROUTES.auth);
      expect(path).not.toBe(ROUTES.dashboard);
      expect(path).not.toBe(ROUTES.onboarding);
      expect(path).not.toBe(ROUTES.geo);
      expect(isPrivateOrNoindexPath(path)).toBe(false);
    }
  });

  it("links topical about and docs copy to ecommerce SEO, GEO, conversion, trust, and competitors", () => {
    const aboutHrefs = collectAboutInternalLinks().map((l) => l.href);
    const docsHrefs = DOCS_RELATED_LINKS.map((l) => l.href);
    expect(aboutHrefs).toContain(TOPIC_BLOG_HREFS.seo);
    expect(aboutHrefs).toContain(TOPIC_BLOG_HREFS.conversion);
    expect(aboutHrefs).toContain(TOPIC_BLOG_HREFS.geo);
    expect(aboutHrefs).toContain(TOPIC_BLOG_HREFS.trust);
    expect(aboutHrefs).toContain(TOPIC_BLOG_HREFS.competitor);
    expect(aboutHrefs).toContain(ROUTES.docs);
    expect(aboutHrefs).toContain("/#methodology");
    expect(docsHrefs).toContain(TOPIC_BLOG_HREFS.seo);
    expect(docsHrefs).toContain(TOPIC_BLOG_HREFS.conversion);
    expect(docsHrefs).toContain(TOPIC_BLOG_HREFS.geo);
    expect(docsHrefs).toContain(TOPIC_BLOG_HREFS.trust);
    expect(docsHrefs).toContain(TOPIC_BLOG_HREFS.competitor);
  });

  it("pairs each blog post with three other public topical posts", () => {
    for (const slug of BLOG_SLUGS) {
      const related = relatedBlogSlugs(slug);
      expect(related).toHaveLength(3);
      expect(related).not.toContain(slug);
      for (const relatedSlug of related) {
        expect(BLOG_SLUGS).toContain(relatedSlug);
      }
    }
  });

  it("keeps sitemap HTML URLs aligned with the public indexable path list", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.convaudit.com");
    const sitemapPaths = sitemap().map((entry) => {
      const pathname = new URL(entry.url).pathname;
      return pathname === "/" ? ROUTES.home : pathname;
    });
    expect([...sitemapPaths].sort()).toEqual([...PUBLIC_INDEXABLE_PATHS].sort());
    vi.unstubAllEnvs();
  });

  it("rejects hash-only, private, and unknown fragment hrefs", () => {
    expect(isResolvablePublicInternalHref("#methodology")).toBe(false);
    expect(isResolvablePublicInternalHref("/geo")).toBe(false);
    expect(isResolvablePublicInternalHref("/auth")).toBe(false);
    expect(isResolvablePublicInternalHref("/dashboard")).toBe(false);
    expect(isResolvablePublicInternalHref("/onboarding")).toBe(false);
    expect(isResolvablePublicInternalHref("/docs#99")).toBe(false);
    expect(isResolvablePublicInternalHref("/#methodology")).toBe(true);
    expect(isResolvablePublicInternalHref("/docs#2")).toBe(true);
  });
});
