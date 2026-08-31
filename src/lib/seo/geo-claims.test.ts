import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ABOUT_SECTIONS } from "@/app/about/copy";
import {
  BLOG_POSTS,
  blogPostMetaDescription,
} from "@/lib/blog-posts";
import { arMessages } from "@/lib/locale/messages/ar";
import { translate } from "@/lib/locale/t";
import { buildLlmsTxt } from "@/lib/seo/llms-txt";
import { SITE_OFFICIAL_DESCRIPTION } from "@/lib/seo/site-copy";
import { buildBlogArticleJsonLd, buildFaqPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

const REPORT_NOW = new Date("2026-08-30T12:00:00.000Z");

const FORBIDDEN_PUBLIC_CLAIMS = [
  /يوصون بمنتجاتك/,
  /ترفع المبيعات فوراً/,
  /أمثلة حقيقية/,
  /لتظهر في إجابات مساعدات الذكاء الاصطناعي مثل ChatGPT وPerplexity وGoogle AI Overviews/,
  /يكسبك الظهور في بحث الذكاء الاصطناعي/,
  /قد لا يراك ChatGPT أو Google AI/,
  /تشير الدراسات/,
  /نختبر صفحتك داخل ChatGPT/,
  /مضمون(?:ة)?\s*(?:الظهور|المبيعات|التحويل)/,
] as const;

function publicBlogCopy(): string {
  return Object.entries(arMessages)
    .filter(([key]) => key.startsWith("blog.post") || key.startsWith("blog.subtitle"))
    .map(([, value]) => value)
    .join("\n");
}

function publicHomepageGeoCopy(): string {
  return [
    arMessages["hero.subheadline"],
    arMessages["hero.preview.geoNote"],
    arMessages["whyLose.card1.desc"],
    arMessages["features.subtitle"],
    arMessages["features.geo.desc"],
    arMessages["faq.a2"],
    arMessages["methodology.geo.desc"],
  ].join("\n");
}

describe("GEO claim honesty", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.convaudit.com");
    vi.useFakeTimers();
    vi.setSystemTime(REPORT_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("does not reintroduce unsupported AI-engine or guaranteed-sales claims in public copy", () => {
    const blob = [
      publicBlogCopy(),
      publicHomepageGeoCopy(),
      ABOUT_SECTIONS.flatMap((s) => s.paragraphs.map((p) => p.text)).join("\n"),
      buildLlmsTxt(),
    ].join("\n");

    for (const pattern of FORBIDDEN_PUBLIC_CLAIMS) {
      expect(blob, String(pattern)).not.toMatch(pattern);
    }
  });

  it("states GEO as page-signal analysis, not live engine citations", () => {
    expect(arMessages["blog.post1.p_what_2"]).toMatch(/إشارات/);
    expect(arMessages["blog.post1.p_what_2"]).toMatch(/لا يُنفَّذ كاستعلام توصية حي/);
    expect(arMessages["blog.post1.p_what_2"]).not.toMatch(/لتظهر في إجابات/);
    expect(arMessages["blog.post1.p_why_1"]).toMatch(/ولا يضمن مبيعات أو اقتباساً/);
    expect(arMessages["faq.a2"]).toMatch(/وليست نتائج اختبار حي/);
    expect(buildLlmsTxt()).toMatch(/does not query ChatGPT, Perplexity/);
    expect(buildLlmsTxt()).toContain(SITE_OFFICIAL_DESCRIPTION);
  });

  it("keeps the official description consistent on About, llms.txt, and FAQ product framing", () => {
    const aboutBody = ABOUT_SECTIONS.flatMap((s) => s.paragraphs.map((p) => p.text)).join("\n");
    expect(aboutBody).toContain(SITE_OFFICIAL_DESCRIPTION);
    expect(buildLlmsTxt()).toContain(`> ${SITE_OFFICIAL_DESCRIPTION}`);
    expect(JSON.stringify(buildFaqPageJsonLd())).toMatch(/تحليل محلي لإشارات الصفحة/);
  });

  it("emits Article JSON-LD from the canonical factual meta description", () => {
    const layoutSrc = readFileSync(
      resolve(process.cwd(), "src/app/blog/[slug]/layout.tsx"),
      "utf8"
    );
    expect(layoutSrc).toMatch(/blogPostMetaDescription/);
    expect(layoutSrc).not.toMatch(/description:\s*translate\(post\.excerptKey\)/);
    expect(layoutSrc).not.toMatch(/"Blog"/);

    for (const post of BLOG_POSTS) {
      expect(post.metaDescription, post.slug).toBeTruthy();
      const excerpt = translate(post.excerptKey);
      const description = blogPostMetaDescription(post, excerpt);
      expect(description).toBe(post.metaDescription);
      const article = buildBlogArticleJsonLd({
        title: translate(post.titleKey),
        description,
        path: ROUTES.blogPost(post.slug),
        publishedOn: post.publishedOn,
      });
      expect(article.description).toBe(description);
      expect(article["@type"]).toBe("Article");
      expect(article.datePublished).toBeUndefined();
      expect(JSON.stringify(article)).not.toMatch(/يوصون بمنتجاتك/);
      expect(JSON.stringify(article)).not.toMatch(/أمثلة حقيقية/);
    }
  });
});
