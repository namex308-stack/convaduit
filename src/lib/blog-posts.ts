import type { TranslationKey } from "@/lib/i18n";
import type { LocaleId } from "@/lib/locale/types";
import type { BlogFaqItem } from "@/lib/blog-content-blocks";
import { isCalendarDateOnOrBeforeToday } from "@/lib/seo/dates";

export interface BlogPostMeta {
  slug: string;
  titleKey: TranslationKey;
  excerptKey: TranslationKey;
  dateKey: TranslationKey;
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
  /** Estimated reading time in minutes. */
  readTime: number;
  categoryKey: TranslationKey;
  /** Accent for category chips and cover tint. */
  color: string;
  /** Short cover mark on listing/detail heroes (e.g. GEO, CRO). */
  coverLabel: string;
  /** When true, preferred as the index featured article. */
  featured?: boolean;
  /** Optional FAQ pairs for on-page FAQ + FAQPage JSON-LD. */
  faqKeys?: readonly BlogFaqItem[];
}

/**
 * Single registry for blog listing + SEO metadata.
 * Add a new post here, then add locale strings and body content under `/blog/[slug]`.
 */
export const BLOG_POSTS: readonly BlogPostMeta[] = [
  {
    slug: "geo-ai-visibility-guide",
    titleKey: "blog.post1.title",
    excerptKey: "blog.post1.excerpt",
    dateKey: "blog.post1.date",
    publishedOn: "2026-10-15",
    readTime: 11,
    categoryKey: "blog.post1.category",
    color: "#FF6600",
    coverLabel: "GEO",
    metaDescription:
      "دليل GEO Audit لإشارات صفحة المنتج في متاجر الخليج: FAQ وSchema وجملة التموضع — تقدير جاهزية محلي بعد الزحف وليس استعلاماً حياً في ChatGPT.",
    faqKeys: [
      { qKey: "blog.post1.faq.q1", aKey: "blog.post1.faq.a1" },
      { qKey: "blog.post1.faq.q2", aKey: "blog.post1.faq.a2" },
      { qKey: "blog.post1.faq.q3", aKey: "blog.post1.faq.a3" },
      { qKey: "blog.post1.faq.q4", aKey: "blog.post1.faq.a4" },
      { qKey: "blog.post1.faq.q5", aKey: "blog.post1.faq.a5" },
      { qKey: "blog.post1.faq.q6", aKey: "blog.post1.faq.a6" },
    ],
  },
  {
    slug: "conversion-rate-optimization",
    titleKey: "blog.post2.title",
    excerptKey: "blog.post2.excerpt",
    dateKey: "blog.post2.date",
    publishedOn: "2026-10-10",
    readTime: 10,
    categoryKey: "blog.post2.category",
    color: "#ff983f",
    coverLabel: "CRO",
    metaDescription:
      "10 إصلاحات CRO لصفحات منتجات متاجر الخليج: الصور والعنوان وزر الشراء والشحن والثقة — توصيات عملية دون ضمان نمو مبيعات.",
    faqKeys: [
      { qKey: "blog.post2.faq.q1", aKey: "blog.post2.faq.a1" },
      { qKey: "blog.post2.faq.q2", aKey: "blog.post2.faq.a2" },
      { qKey: "blog.post2.faq.q3", aKey: "blog.post2.faq.a3" },
      { qKey: "blog.post2.faq.q4", aKey: "blog.post2.faq.a4" },
      { qKey: "blog.post2.faq.q5", aKey: "blog.post2.faq.a5" },
      { qKey: "blog.post2.faq.q6", aKey: "blog.post2.faq.a6" },
    ],
  },
  {
    slug: "product-schema-markup",
    titleKey: "blog.post3.title",
    excerptKey: "blog.post3.excerpt",
    dateKey: "blog.post3.date",
    publishedOn: "2026-10-05",
    readTime: 10,
    categoryKey: "blog.post3.category",
    color: "#cc5200",
    coverLabel: "Schema",
    metaDescription:
      "دليل Product Schema (JSON-LD) لمتاجر الخليج على Shopify وWooCommerce وسلة وزد: اكتمال الحقول وفحص الأخطاء دون ضمان ترتيب.",
    faqKeys: [
      { qKey: "blog.post3.faq.q1", aKey: "blog.post3.faq.a1" },
      { qKey: "blog.post3.faq.q2", aKey: "blog.post3.faq.a2" },
      { qKey: "blog.post3.faq.q3", aKey: "blog.post3.faq.a3" },
      { qKey: "blog.post3.faq.q4", aKey: "blog.post3.faq.a4" },
      { qKey: "blog.post3.faq.q5", aKey: "blog.post3.faq.a5" },
      { qKey: "blog.post3.faq.q6", aKey: "blog.post3.faq.a6" },
    ],
  },
  {
    slug: "competitor-analysis-strategy",
    titleKey: "blog.post4.title",
    excerptKey: "blog.post4.excerpt",
    dateKey: "blog.post4.date",
    publishedOn: "2026-10-01",
    readTime: 9,
    categoryKey: "blog.post4.category",
    color: "#929292",
    coverLabel: "GCC",
    metaDescription:
      "تحليل المنافسين لصفحات المنتجات في السعودية والإمارات وبقية الخليج: الشحن والدفع والثقة — مقارنة عملية دون ترتيب سوق.",
    faqKeys: [
      { qKey: "blog.post4.faq.q1", aKey: "blog.post4.faq.a1" },
      { qKey: "blog.post4.faq.q2", aKey: "blog.post4.faq.a2" },
      { qKey: "blog.post4.faq.q3", aKey: "blog.post4.faq.a3" },
      { qKey: "blog.post4.faq.q4", aKey: "blog.post4.faq.a4" },
      { qKey: "blog.post4.faq.q5", aKey: "blog.post4.faq.a5" },
      { qKey: "blog.post4.faq.q6", aKey: "blog.post4.faq.a6" },
    ],
  },
  {
    slug: "ai-product-descriptions",
    titleKey: "blog.post5.title",
    excerptKey: "blog.post5.excerpt",
    dateKey: "blog.post5.date",
    publishedOn: "2026-09-28",
    readTime: 9,
    categoryKey: "blog.post5.category",
    color: "#FF6600",
    coverLabel: "Copy",
    metaDescription:
      "كتابة أوصاف منتجات بالذكاء الاصطناعي لمتاجر الخليج: مسودة من حقائق حقيقية ومراجعة بشرية إلزامية قبل النشر — دون ضمان ترتيب.",
    faqKeys: [
      { qKey: "blog.post5.faq.q1", aKey: "blog.post5.faq.a1" },
      { qKey: "blog.post5.faq.q2", aKey: "blog.post5.faq.a2" },
      { qKey: "blog.post5.faq.q3", aKey: "blog.post5.faq.a3" },
      { qKey: "blog.post5.faq.q4", aKey: "blog.post5.faq.a4" },
      { qKey: "blog.post5.faq.q5", aKey: "blog.post5.faq.a5" },
      { qKey: "blog.post5.faq.q6", aKey: "blog.post5.faq.a6" },
    ],
  },
  {
    slug: "trust-signals-ecommerce",
    titleKey: "blog.post6.title",
    excerptKey: "blog.post6.excerpt",
    dateKey: "blog.post6.date",
    publishedOn: "2026-09-20",
    readTime: 9,
    categoryKey: "blog.post6.category",
    color: "#ff983f",
    coverLabel: "Trust",
    metaDescription:
      "إشارات الثقة قبل الدفع في صفحات منتجات الخليج: الشحن والإرجاع والتقييمات الصادقة — لدعم التحويل دون ضمان مبيعات.",
    faqKeys: [
      { qKey: "blog.post6.faq.q1", aKey: "blog.post6.faq.a1" },
      { qKey: "blog.post6.faq.q2", aKey: "blog.post6.faq.a2" },
      { qKey: "blog.post6.faq.q3", aKey: "blog.post6.faq.a3" },
      { qKey: "blog.post6.faq.q4", aKey: "blog.post6.faq.a4" },
      { qKey: "blog.post6.faq.q5", aKey: "blog.post6.faq.a5" },
      { qKey: "blog.post6.faq.q6", aKey: "blog.post6.faq.a6" },
    ],
  },
  {
    slug: "seo-for-ai-complete-guide",
    titleKey: "blog.post7.title",
    excerptKey: "blog.post7.excerpt",
    dateKey: "blog.post7.date",
    publishedOn: "2026-09-18",
    readTime: 14,
    categoryKey: "blog.post7.category",
    color: "#FF6600",
    coverLabel: "AI SEO",
    metaDescription:
      "الدليل الكامل لـ SEO للذكاء الاصطناعي لمتاجر الخليج: وضوح صفحة المنتج وSchema وFAQ وإشارات قابلة للفهم — دون ضمان ظهور في ChatGPT أو ترتيب Google.",
    faqKeys: [
      { qKey: "blog.post7.faq.q1", aKey: "blog.post7.faq.a1" },
      { qKey: "blog.post7.faq.q2", aKey: "blog.post7.faq.a2" },
      { qKey: "blog.post7.faq.q3", aKey: "blog.post7.faq.a3" },
      { qKey: "blog.post7.faq.q4", aKey: "blog.post7.faq.a4" },
      { qKey: "blog.post7.faq.q5", aKey: "blog.post7.faq.a5" },
      { qKey: "blog.post7.faq.q6", aKey: "blog.post7.faq.a6" },
      { qKey: "blog.post7.faq.q7", aKey: "blog.post7.faq.a7" },
    ],
  },
  {
    slug: "identify-seo-issues-store-growth",
    titleKey: "blog.post8.title",
    excerptKey: "blog.post8.excerpt",
    dateKey: "blog.post8.date",
    publishedOn: "2026-10-22",
    readTime: 12,
    categoryKey: "blog.post8.category",
    color: "#cc5200",
    coverLabel: "SEO",
    featured: true,
    metaDescription:
      "كيف تكتشف مشاكل SEO التي تمنع ظهور متجرك في الخليج ونموه: فهرسة، صفحة المنتج، Schema وتجربة الجوال — دون ضمان ترتيب أو أرقام مخترعة.",
    faqKeys: [
      { qKey: "blog.post8.faq.q1", aKey: "blog.post8.faq.a1" },
      { qKey: "blog.post8.faq.q2", aKey: "blog.post8.faq.a2" },
      { qKey: "blog.post8.faq.q3", aKey: "blog.post8.faq.a3" },
      { qKey: "blog.post8.faq.q4", aKey: "blog.post8.faq.a4" },
      { qKey: "blog.post8.faq.q5", aKey: "blog.post8.faq.a5" },
      { qKey: "blog.post8.faq.q6", aKey: "blog.post8.faq.a6" },
      { qKey: "blog.post8.faq.q7", aKey: "blog.post8.faq.a7" },
    ],
  },
];

/** Stable slug list derived from `BLOG_POSTS` (single source of truth). */
export const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug);

/**
 * Topic-cluster related posts (3 max). Editorial order — not array position.
 */
export const BLOG_RELATED_SLUGS: Readonly<Record<string, readonly string[]>> = {
  "geo-ai-visibility-guide": [
    "seo-for-ai-complete-guide",
    "product-schema-markup",
    "identify-seo-issues-store-growth",
  ],
  "conversion-rate-optimization": [
    "trust-signals-ecommerce",
    "competitor-analysis-strategy",
    "identify-seo-issues-store-growth",
  ],
  "product-schema-markup": [
    "seo-for-ai-complete-guide",
    "identify-seo-issues-store-growth",
    "ai-product-descriptions",
  ],
  "competitor-analysis-strategy": [
    "conversion-rate-optimization",
    "trust-signals-ecommerce",
    "identify-seo-issues-store-growth",
  ],
  "ai-product-descriptions": [
    "seo-for-ai-complete-guide",
    "product-schema-markup",
    "identify-seo-issues-store-growth",
  ],
  "trust-signals-ecommerce": [
    "conversion-rate-optimization",
    "competitor-analysis-strategy",
    "identify-seo-issues-store-growth",
  ],
  "seo-for-ai-complete-guide": [
    "geo-ai-visibility-guide",
    "product-schema-markup",
    "identify-seo-issues-store-growth",
  ],
  "identify-seo-issues-store-growth": [
    "product-schema-markup",
    "seo-for-ai-complete-guide",
    "conversion-rate-optimization",
  ],
};

export function relatedBlogSlugs(slug: string): readonly string[] {
  return BLOG_RELATED_SLUGS[slug] ?? [];
}

export function blogPostMetaDescription(
  post: BlogPostMeta,
  excerpt: string,
  _locale: LocaleId = "ar"
): string {
  return post.metaDescription ?? excerpt;
}

export function getBlogPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Newest first — ready for growing catalogs. */
export function sortedBlogPosts(
  posts: readonly BlogPostMeta[] = BLOG_POSTS
): BlogPostMeta[] {
  return [...posts].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}

/** Unique category keys in first-seen order from the newest-sorted catalog. */
export function blogCategoryKeys(
  posts: readonly BlogPostMeta[] = BLOG_POSTS
): TranslationKey[] {
  const seen = new Set<string>();
  const keys: TranslationKey[] = [];
  for (const post of sortedBlogPosts(posts)) {
    if (seen.has(post.categoryKey)) continue;
    seen.add(post.categoryKey);
    keys.push(post.categoryKey);
  }
  return keys;
}

/** Featured post for the index hero; falls back to the newest article. */
export function getFeaturedBlogPost(
  posts: readonly BlogPostMeta[] = BLOG_POSTS
): BlogPostMeta | undefined {
  const sorted = sortedBlogPosts(posts);
  return sorted.find((p) => p.featured) ?? sorted[0];
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
