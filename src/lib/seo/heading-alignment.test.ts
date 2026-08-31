import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ABOUT_TITLE } from "@/app/about/copy";
import { BLOG_INDEX_TITLE } from "@/app/blog/copy";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { translate } from "@/lib/locale/t";
import { SITE_DEFAULT_TITLE } from "@/lib/seo/site-copy";

function readSrc(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function layoutConstTitle(relativePath: string): string {
  const match = readSrc(relativePath).match(/const TITLE = "([^"]+)";/);
  if (!match?.[1]) {
    throw new Error(`const TITLE not found in ${relativePath}`);
  }
  return match[1];
}

function pageHeaderQuotedTitle(relativePath: string): string {
  const match = readSrc(relativePath).match(/<PageHeader[\s\S]*?title="([^"]+)"/);
  if (!match?.[1]) {
    throw new Error(`PageHeader title="..." not found in ${relativePath}`);
  }
  return match[1];
}

function homepageH1(): string {
  return `${translate("hero.headline1")} ${translate("hero.headline3")}`;
}

describe("H1 / title semantic alignment", () => {
  it("keeps homepage title and H1 related without forcing an exact match", () => {
    const h1 = homepageH1();
    expect(h1).not.toBe(SITE_DEFAULT_TITLE);
    expect(SITE_DEFAULT_TITLE).toMatch(/^ConvAudit/);
    expect(h1).toMatch(/^ConvAudit/);
    expect(SITE_DEFAULT_TITLE).toMatch(/تدقيق/);
    expect(SITE_DEFAULT_TITLE).toMatch(/SEO/);
    expect(SITE_DEFAULT_TITLE).toMatch(/GEO/);
    expect(h1).toMatch(/متجرك يخسر مبيعات/);
    expect(h1).toMatch(/الذكاء الاصطناعي/);
  });

  it("aligns inner marketing H1s with the document title source", () => {
    expect(translate("pricing.title")).toBe(layoutConstTitle("src/app/pricing/layout.tsx"));
    expect(readSrc("src/app/pricing/page.tsx")).toContain('title={t("pricing.title")}');

    expect(translate("docs.title")).toBe(layoutConstTitle("src/app/docs/layout.tsx"));
    expect(readSrc("src/app/docs/page.tsx")).toContain('title={t("docs.title")}');

    expect(translate("blog.title")).toBe(BLOG_INDEX_TITLE);
    expect(readSrc("src/app/blog/blog-index.tsx")).toContain('title={t("blog.title")}');

    expect(ABOUT_TITLE).toBe("من نحن");
    expect(readSrc("src/app/about/page.tsx")).toContain("title={ABOUT_TITLE}");
    expect(readSrc("src/app/about/layout.tsx")).toContain("title: ABOUT_TITLE");

    expect(pageHeaderQuotedTitle("src/app/security/page.tsx")).toBe(
      layoutConstTitle("src/app/security/layout.tsx")
    );
    expect(pageHeaderQuotedTitle("src/app/privacy/page.tsx")).toBe(
      layoutConstTitle("src/app/privacy/layout.tsx")
    );
    expect(pageHeaderQuotedTitle("src/app/roadmap/page.tsx")).toBe(
      layoutConstTitle("src/app/roadmap/layout.tsx")
    );

    expect(pageHeaderQuotedTitle("src/app/contact/page.tsx")).toBe("اتصل بنا");
    expect(readSrc("src/app/contact/layout.tsx")).toContain('title: "اتصل بنا"');

    expect(pageHeaderQuotedTitle("src/app/terms/page.tsx")).toBe(
      layoutConstTitle("src/app/terms/layout.tsx")
    );
    expect(pageHeaderQuotedTitle("src/app/refund-policy/page.tsx")).toBe(
      layoutConstTitle("src/app/refund-policy/layout.tsx")
    );
  });

  it("uses the same blog titleKey for metadata, JSON-LD, and the visible H1", () => {
    const layoutSrc = readSrc("src/app/blog/[slug]/layout.tsx");
    expect(layoutSrc).toContain("translate(post.titleKey)");
    expect(layoutSrc).toContain("blogPostMetaDescription(post");

    const pageSrc = readSrc("src/app/blog/[slug]/page.tsx");
    expect(pageSrc).toContain("{t(POST.titleKey)}");

    for (const post of BLOG_POSTS) {
      const title = translate(post.titleKey);
      expect(title.trim().length).toBeGreaterThan(0);
      expect(post.metaDescription).toBeTruthy();
      expect(post.metaDescription).not.toBe(title);
      expect(pageSrc).toContain(`slug: "${post.slug}"`);
      expect(pageSrc).toContain(`titleKey: "${post.titleKey}"`);
    }
  });
});
