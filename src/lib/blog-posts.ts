import type { TranslationKey } from "@/lib/i18n";
import { isCalendarDateOnOrBeforeToday } from "@/lib/seo/dates";

export interface BlogPostMeta {
  slug: string;
  titleKey: TranslationKey;
  excerptKey: TranslationKey;
  /**
   * ISO calendar date matching the existing Arabic display date in locale messages.
   * Used for Article JSON-LD only when not in the future (sitemap omits lastModified).
   */
  publishedOn: `${number}-${number}-${number}`;
  /**
   * Optional indexable meta description. When set, metadata and Article JSON-LD
   * use it instead of the on-page excerpt.
   */
  metaDescription?: string;
}

/**
 * Slug → title/excerpt lookup for `generateMetadata` on `/blog/[slug]`.
 * Kept as its own minimal module (rather than importing the full `POSTS`
 * array from `blog/[slug]/page.tsx`) so this stays a plain server-safe
 * import with no dependency on that "use client" page component.
 *
 * `publishedOn` mirrors the existing `blog.postN.date` strings in `ar.ts`
 * (machine-readable form of the same dates — not new editorial dates).
 */
export const BLOG_POSTS: readonly BlogPostMeta[] = [
  {
    slug: "geo-ai-visibility-guide",
    titleKey: "blog.post1.title",
    excerptKey: "blog.post1.excerpt",
    publishedOn: "2026-10-15",
    metaDescription:
      "دليل GEO لصفحات المنتجات: أسئلة شائعة، Schema، وحقائق قابلة للاقتباس. التقديرات من إشارات الصفحة وليست استعلاماً حياً في ChatGPT أو Perplexity.",
  },
  {
    slug: "conversion-rate-optimization",
    titleKey: "blog.post2.title",
    excerptKey: "blog.post2.excerpt",
    publishedOn: "2026-10-10",
    metaDescription:
      "إصلاحات لصفحات منتجات المتاجر: وضوح العرض والسعر ودعوة الإجراء في HTML. توصيات لتحسين التحويل دون ضمان معدل مبيعات.",
  },
  {
    slug: "product-schema-markup",
    titleKey: "blog.post3.title",
    excerptKey: "blog.post3.excerpt",
    publishedOn: "2026-10-05",
    metaDescription:
      "دليل إضافة Product JSON-LD على Shopify وWooCommerce للنتائج الغنية. تحقق بالأدوات الرسمية — دون ضمان ترتيب بحث.",
  },
  {
    slug: "competitor-analysis-strategy",
    titleKey: "blog.post4.title",
    excerptKey: "blog.post4.excerpt",
    publishedOn: "2026-10-01",
    metaDescription:
      "قارن صفحة منتجك بصفحات منافسين عامة: الشحن والدفع وإشارات الثقة. فجوات قابلة للتنفيذ — دون ترتيب سوق أو ضمان مبيعات.",
  },
  {
    slug: "ai-product-descriptions",
    titleKey: "blog.post5.title",
    excerptKey: "blog.post5.excerpt",
    publishedOn: "2026-09-28",
    metaDescription:
      "مسودة أوصاف منتجات بالذكاء الاصطناعي من بيانات المنتج، مع مراجعة قبل النشر. ليست دراسات حالة أو أمثلة عملاء موثّقة.",
  },
  {
    slug: "trust-signals-ecommerce",
    titleKey: "blog.post6.title",
    excerptKey: "blog.post6.excerpt",
    publishedOn: "2026-09-20",
    metaDescription:
      "إشارات الثقة الظاهرة في صفحة المنتج العامة: السياسات والتقييمات ووضوح الشحن قبل الدفع.",
  },
];

/** Stable slug list derived from `BLOG_POSTS` (single source of truth). */
export const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug);

/**
 * Topical related posts (3 max). Order is editorial, not array position.
 * Destinations are public blog slugs only.
 */
export const BLOG_RELATED_SLUGS: Readonly<Record<string, readonly string[]>> = {
  "geo-ai-visibility-guide": [
    "product-schema-markup",
    "ai-product-descriptions",
    "trust-signals-ecommerce",
  ],
  "conversion-rate-optimization": [
    "trust-signals-ecommerce",
    "competitor-analysis-strategy",
    "geo-ai-visibility-guide",
  ],
  "product-schema-markup": [
    "geo-ai-visibility-guide",
    "ai-product-descriptions",
    "conversion-rate-optimization",
  ],
  "competitor-analysis-strategy": [
    "conversion-rate-optimization",
    "trust-signals-ecommerce",
    "geo-ai-visibility-guide",
  ],
  "ai-product-descriptions": [
    "product-schema-markup",
    "geo-ai-visibility-guide",
    "conversion-rate-optimization",
  ],
  "trust-signals-ecommerce": [
    "conversion-rate-optimization",
    "competitor-analysis-strategy",
    "product-schema-markup",
  ],
};

export function relatedBlogSlugs(slug: string): readonly string[] {
  return BLOG_RELATED_SLUGS[slug] ?? [];
}

export function blogPostMetaDescription(
  post: BlogPostMeta,
  excerpt: string
): string {
  return post.metaDescription ?? excerpt;
}

export function getBlogPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** True when `publishedOn` is after today — keep the stamp, do not emit it as published. */
export function isBlogPostDateInTheFuture(publishedOn: string, now = new Date()): boolean {
  return !isCalendarDateOnOrBeforeToday(publishedOn, now);
}

/**
 * Visible date label. Future stamps stay the same calendar string and are
 * marked scheduled — no invented replacement date.
 */
export function visibleBlogDateLabel(
  publishedOn: string,
  displayDate: string,
  scheduledLabel: (date: string) => string,
  now = new Date()
): string {
  if (isBlogPostDateInTheFuture(publishedOn, now)) {
    return scheduledLabel(displayDate);
  }
  return displayDate;
}
