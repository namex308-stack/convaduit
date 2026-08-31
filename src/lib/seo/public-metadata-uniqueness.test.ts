import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ABOUT_DESCRIPTION, ABOUT_TITLE } from "@/app/about/copy";
import { BLOG_INDEX_DESCRIPTION, BLOG_INDEX_TITLE } from "@/app/blog/copy";
import { BLOG_POSTS, BLOG_SLUGS, blogPostMetaDescription } from "@/lib/blog-posts";
import { translate } from "@/lib/locale/t";
import { CONTACT_EMAIL, CONTACT_WHATSAPP_DISPLAY } from "@/lib/seo/contact";
import { PUBLIC_PAGE_ROBOTS, publicPageMetadata, resolvePublicTitle } from "@/lib/seo/page-metadata";
import { SITE_DEFAULT_TITLE, SITE_DESCRIPTION } from "@/lib/seo/site-copy";
import { ROUTES } from "@/lib/routes";

const CANONICAL = "https://www.convaudit.com";

const STATIC_PUBLIC_PAGES = [
  { path: ROUTES.home, title: SITE_DEFAULT_TITLE, description: SITE_DESCRIPTION, absoluteTitle: SITE_DEFAULT_TITLE },
  {
    path: ROUTES.pricing,
    title: "أسعار تدقيق وتحليل المتاجر في الخليج",
    description:
      "باقات ConvAudit لتدقيق وتحليل المتاجر الإلكترونية: SEO وCRO وGEO Audit وتحليلات المتجر والمنافسين. للسعودية والإمارات وقطر والكويت والبحرين وعُمان — ابدأ مجاناً.",
  },
  {
    path: ROUTES.docs,
    title: "دليل تدقيق وتحليل متاجر الخليج",
    description:
      "كيف يعمل تدقيق وتحليل صفحة المنتج: CRO وSEO وGEO Audit وتحليلات المتجر — Shopify وWooCommerce وسلة وزد والمتاجر المخصصة.",
  },
  { path: ROUTES.blog, title: BLOG_INDEX_TITLE, description: BLOG_INDEX_DESCRIPTION },
  {
    path: ROUTES.about,
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
  },
  {
    path: ROUTES.contact,
    title: "اتصل بنا",
    description: `تواصل مع ConvAudit عبر البريد الرسمي ${CONTACT_EMAIL} أو واتساب ${CONTACT_WHATSAPP_DISPLAY} للاستفسارات العامة والفوترة وطلبات الاسترداد.`,
  },
  {
    path: ROUTES.security,
    title: "أمان المنتج والبيانات",
    description:
      "نهجنا الحالي في أمان المنتج: تحليل الصفحات العامة فقط، النقل عبر HTTPS، وحدّ أدنى من الصلاحيات — دون الادعاء بشهادات غير موثّقة.",
  },
  {
    path: ROUTES.privacy,
    title: "سياسة الخصوصية",
    description: "ما نجمعه لتشغيل الحسابات والتحليلات، لماذا نجمعه، وكيف تطلب حذف البيانات المرتبطة بحسابك.",
  },
  {
    path: ROUTES.terms,
    title: "الشروط والأحكام",
    description: "شروط استخدام ConvAudit كمنصة برمجيات كخدمة لتحليل صفحات منتجات المتاجر الإلكترونية.",
  },
  {
    path: ROUTES.refundPolicy,
    title: "سياسة الاسترداد",
    description: "ضمان استرداد خلال 14 يوماً لاشتراكات ConvAudit المدفوعة — بشروط واضحة على صفحة السياسة.",
  },
  {
    path: ROUTES.roadmap,
    title: "خارطة طريق المنتج",
    description:
      "خارطة طريق ConvAudit لمتاجر في السعودية والإمارات وقطر والكويت والبحرين وعُمان: الآن والتالي ولاحقاً — دون تعهدات تسليم ملزمة.",
  },
] as const;

function documentTitle(title: string, absoluteTitle?: string): string {
  if (absoluteTitle) return absoluteTitle;
  const resolved = resolvePublicTitle(title);
  return typeof resolved === "string" ? `${resolved} · ConvAudit` : title;
}

describe("public metadata uniqueness and indexability", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", CANONICAL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("gives every public page a unique title, description, and www canonical", () => {
    const pages = [
      ...STATIC_PUBLIC_PAGES.map((page) => ({
        ...page,
        meta: publicPageMetadata({
          title: page.title,
          description: page.description,
          path: page.path,
        }),
      })),
      ...BLOG_POSTS.map((post) => {
        const title = translate(post.titleKey);
        const description = blogPostMetaDescription(post, translate(post.excerptKey));
        return {
          path: ROUTES.blogPost(post.slug),
          title,
          description,
          meta: publicPageMetadata({
            title,
            description,
            path: ROUTES.blogPost(post.slug),
            type: "article",
          }),
        };
      }),
    ];

    const titles = pages.map((p) => {
      const absolute =
        "absoluteTitle" in p && typeof p.absoluteTitle === "string"
          ? p.absoluteTitle
          : undefined;
      return documentTitle(p.title, absolute);
    });
    const descriptions = pages.map((p) => p.description);
    const canonicals = pages.map((p) => String(p.meta.alternates?.canonical ?? ""));

    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    expect(new Set(canonicals).size).toBe(canonicals.length);

    for (const page of pages) {
      expect(page.meta.alternates?.canonical).toBe(
        page.path === "/" ? `${CANONICAL}/` : `${CANONICAL}${page.path}`
      );
      expect(page.meta.robots).toEqual(PUBLIC_PAGE_ROBOTS);
    }
  });

  it("statically generates every published blog slug", async () => {
    const { generateStaticParams } = await import("@/app/blog/[slug]/layout");
    expect(generateStaticParams().map((p) => p.slug).sort()).toEqual([...BLOG_SLUGS].sort());
  });
});
