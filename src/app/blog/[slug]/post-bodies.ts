import type { BlogPostBody } from "@/lib/blog-content-blocks";
import { ROUTES } from "@/lib/routes";

/**
 * Article bodies only. Listing/SEO fields live in `@/lib/blog-posts`.
 */
export const POST_BODIES: readonly BlogPostBody[] = [
  {
    slug: "geo-ai-visibility-guide",
    titleKey: "blog.post1.title",
    content: [
      { type: "h2", textKey: "blog.post1.h2_what" },
      { type: "p", textKey: "blog.post1.p_what_1" },
      { type: "p", textKey: "blog.post1.p_what_2" },
      {
        type: "pLinks",
        textKey: "blog.post1.pLinks_pillar",
        links: [
          {
            href: ROUTES.blogPost("seo-for-ai-complete-guide"),
            labelKey: "blog.post1.link.seoForAi",
          },
        ],
      },
      { type: "h2", textKey: "blog.post1.h2_why" },
      { type: "p", textKey: "blog.post1.p_why_1" },
      { type: "p", textKey: "blog.post1.p_why_2" },
      { type: "h2", textKey: "blog.post1.h2_steps" },
      { type: "h3", textKey: "blog.post1.h3_s1" },
      { type: "p", textKey: "blog.post1.p_s1" },
      { type: "h3", textKey: "blog.post1.h3_s2" },
      { type: "p", textKey: "blog.post1.p_s2" },
      { type: "h3", textKey: "blog.post1.h3_s3" },
      { type: "p", textKey: "blog.post1.p_s3" },
      {
        type: "pLinks",
        textKey: "blog.post1.pLinks_s3",
        links: [
          {
            href: ROUTES.blogPost("product-schema-markup"),
            labelKey: "blog.post1.link.schema",
          },
        ],
      },
      { type: "h3", textKey: "blog.post1.h3_s4" },
      { type: "p", textKey: "blog.post1.p_s4" },
      { type: "h3", textKey: "blog.post1.h3_s5" },
      { type: "p", textKey: "blog.post1.p_s5" },
      { type: "h2", textKey: "blog.post1.h2_table" },
      {
        type: "table",
        headers: ["blog.post1.table.h1", "blog.post1.table.h2", "blog.post1.table.h3"],
        rows: [
          ["blog.post1.table.r1c1", "blog.post1.table.r1c2", "blog.post1.table.r1c3"],
          ["blog.post1.table.r2c1", "blog.post1.table.r2c2", "blog.post1.table.r2c3"],
          ["blog.post1.table.r3c1", "blog.post1.table.r3c2", "blog.post1.table.r3c3"],
        ],
      },
      { type: "h2", textKey: "blog.post1.h2_check" },
      {
        type: "checklist",
        itemKeys: [
          "blog.post1.check_1",
          "blog.post1.check_2",
          "blog.post1.check_3",
          "blog.post1.check_4",
          "blog.post1.check_5",
          "blog.post1.check_6",
        ],
      },
      { type: "h2", textKey: "blog.post1.h2_faq" },
      {
        type: "faq",
        items: [
          { qKey: "blog.post1.faq.q1", aKey: "blog.post1.faq.a1" },
          { qKey: "blog.post1.faq.q2", aKey: "blog.post1.faq.a2" },
          { qKey: "blog.post1.faq.q3", aKey: "blog.post1.faq.a3" },
          { qKey: "blog.post1.faq.q4", aKey: "blog.post1.faq.a4" },
          { qKey: "blog.post1.faq.q5", aKey: "blog.post1.faq.a5" },
          { qKey: "blog.post1.faq.q6", aKey: "blog.post1.faq.a6" },
        ],
      },
      { type: "h2", textKey: "blog.post1.h2_close" },
      { type: "p", textKey: "blog.post1.p_close" },
      {
        type: "cta",
        titleKey: "blog.post1.cta.title",
        bodyKey: "blog.post1.cta.body",
        buttonKey: "blog.post1.cta.button",
        href: ROUTES.auditNew,
      },
    ],
  },
  {
    slug: "conversion-rate-optimization",
    titleKey: "blog.post2.title",
    content: [
      { type: "h2", textKey: "blog.post2.h2_why" },
      { type: "p", textKey: "blog.post2.p_why_1" },
      { type: "p", textKey: "blog.post2.p_why_2" },
      { type: "h2", textKey: "blog.post2.h2_list" },
      { type: "h3", textKey: "blog.post2.h3_1" },
      { type: "p", textKey: "blog.post2.p_1" },
      { type: "h3", textKey: "blog.post2.h3_2" },
      { type: "p", textKey: "blog.post2.p_2" },
      { type: "h3", textKey: "blog.post2.h3_3" },
      { type: "p", textKey: "blog.post2.p_3" },
      { type: "h3", textKey: "blog.post2.h3_4" },
      { type: "p", textKey: "blog.post2.p_4" },
      { type: "h3", textKey: "blog.post2.h3_5" },
      { type: "p", textKey: "blog.post2.p_5" },
      { type: "h3", textKey: "blog.post2.h3_6" },
      { type: "p", textKey: "blog.post2.p_6" },
      { type: "h3", textKey: "blog.post2.h3_7" },
      { type: "p", textKey: "blog.post2.p_7" },
      { type: "h3", textKey: "blog.post2.h3_8" },
      { type: "p", textKey: "blog.post2.p_8" },
      { type: "h3", textKey: "blog.post2.h3_9" },
      { type: "p", textKey: "blog.post2.p_9" },
      { type: "h3", textKey: "blog.post2.h3_10" },
      { type: "p", textKey: "blog.post2.p_10" },
      { type: "h2", textKey: "blog.post2.h2_measure" },
      { type: "p", textKey: "blog.post2.p_measure" },
      {
        type: "pLinks",
        textKey: "blog.post2.pLinks",
        links: [
          {
            href: ROUTES.blogPost("trust-signals-ecommerce"),
            labelKey: "blog.post2.link.trust",
          },
          {
            href: ROUTES.blogPost("competitor-analysis-strategy"),
            labelKey: "blog.post2.link.competitors",
          },
        ],
      },
      { type: "h2", textKey: "blog.post2.h2_check" },
      {
        type: "checklist",
        itemKeys: [
          "blog.post2.check_1",
          "blog.post2.check_2",
          "blog.post2.check_3",
          "blog.post2.check_4",
          "blog.post2.check_5",
          "blog.post2.check_6",
        ],
      },
      { type: "h2", textKey: "blog.post2.h2_faq" },
      {
        type: "faq",
        items: [
          { qKey: "blog.post2.faq.q1", aKey: "blog.post2.faq.a1" },
          { qKey: "blog.post2.faq.q2", aKey: "blog.post2.faq.a2" },
          { qKey: "blog.post2.faq.q3", aKey: "blog.post2.faq.a3" },
          { qKey: "blog.post2.faq.q4", aKey: "blog.post2.faq.a4" },
          { qKey: "blog.post2.faq.q5", aKey: "blog.post2.faq.a5" },
          { qKey: "blog.post2.faq.q6", aKey: "blog.post2.faq.a6" },
        ],
      },
      { type: "h2", textKey: "blog.post2.h2_close" },
      { type: "p", textKey: "blog.post2.p_close" },
      {
        type: "cta",
        titleKey: "blog.post2.cta.title",
        bodyKey: "blog.post2.cta.body",
        buttonKey: "blog.post2.cta.button",
        href: ROUTES.auditNew,
      },
    ],
  },
  {
    slug: "product-schema-markup",
    titleKey: "blog.post3.title",
    content: [
      { type: "h2", textKey: "blog.post3.h2_what" },
      { type: "p", textKey: "blog.post3.p_what_1" },
      { type: "p", textKey: "blog.post3.p_what_2" },
      { type: "h2", textKey: "blog.post3.h2_platforms" },
      { type: "h3", textKey: "blog.post3.h3_shopify" },
      { type: "p", textKey: "blog.post3.p_shopify" },
      { type: "h3", textKey: "blog.post3.h3_woo" },
      { type: "p", textKey: "blog.post3.p_woo" },
      { type: "h3", textKey: "blog.post3.h3_salla_zid" },
      { type: "p", textKey: "blog.post3.p_salla_zid" },
      { type: "h2", textKey: "blog.post3.h2_validate" },
      { type: "p", textKey: "blog.post3.p_validate_1" },
      {
        type: "pLinks",
        textKey: "blog.post3.pLinks",
        links: [
          {
            href: ROUTES.blogPost("seo-for-ai-complete-guide"),
            labelKey: "blog.post3.link.seoForAi",
          },
          {
            href: ROUTES.blogPost("geo-ai-visibility-guide"),
            labelKey: "blog.post3.link.geo",
          },
        ],
      },
      { type: "h2", textKey: "blog.post3.h2_check" },
      {
        type: "checklist",
        itemKeys: [
          "blog.post3.check_1",
          "blog.post3.check_2",
          "blog.post3.check_3",
          "blog.post3.check_4",
          "blog.post3.check_5",
          "blog.post3.check_6",
        ],
      },
      { type: "h2", textKey: "blog.post3.h2_faq" },
      {
        type: "faq",
        items: [
          { qKey: "blog.post3.faq.q1", aKey: "blog.post3.faq.a1" },
          { qKey: "blog.post3.faq.q2", aKey: "blog.post3.faq.a2" },
          { qKey: "blog.post3.faq.q3", aKey: "blog.post3.faq.a3" },
          { qKey: "blog.post3.faq.q4", aKey: "blog.post3.faq.a4" },
          { qKey: "blog.post3.faq.q5", aKey: "blog.post3.faq.a5" },
          { qKey: "blog.post3.faq.q6", aKey: "blog.post3.faq.a6" },
        ],
      },
      { type: "h2", textKey: "blog.post3.h2_close" },
      { type: "p", textKey: "blog.post3.p_close" },
      {
        type: "cta",
        titleKey: "blog.post3.cta.title",
        bodyKey: "blog.post3.cta.body",
        buttonKey: "blog.post3.cta.button",
        href: ROUTES.auditNew,
      },
    ],
  },
  {
    slug: "competitor-analysis-strategy",
    titleKey: "blog.post4.title",
    content: [
      { type: "h2", textKey: "blog.post4.h2_why" },
      { type: "p", textKey: "blog.post4.p_why_1" },
      { type: "p", textKey: "blog.post4.p_why_2" },
      { type: "h2", textKey: "blog.post4.h2_what" },
      {
        type: "ul",
        itemKeys: [
          "blog.post4.ul_1",
          "blog.post4.ul_2",
          "blog.post4.ul_3",
          "blog.post4.ul_4",
          "blog.post4.ul_5",
          "blog.post4.ul_6",
        ],
      },
      { type: "p", textKey: "blog.post4.p_what" },
      { type: "h2", textKey: "blog.post4.h2_plan" },
      { type: "p", textKey: "blog.post4.p_plan_1" },
      {
        type: "pLinks",
        textKey: "blog.post4.pLinks",
        links: [
          {
            href: ROUTES.blogPost("conversion-rate-optimization"),
            labelKey: "blog.post4.link.cro",
          },
          {
            href: ROUTES.blogPost("trust-signals-ecommerce"),
            labelKey: "blog.post4.link.trust",
          },
          {
            href: ROUTES.blogPost("geo-ai-visibility-guide"),
            labelKey: "blog.post4.link.geo",
          },
        ],
      },
      { type: "h2", textKey: "blog.post4.h2_check" },
      {
        type: "checklist",
        itemKeys: [
          "blog.post4.check_1",
          "blog.post4.check_2",
          "blog.post4.check_3",
          "blog.post4.check_4",
          "blog.post4.check_5",
          "blog.post4.check_6",
        ],
      },
      { type: "h2", textKey: "blog.post4.h2_faq" },
      {
        type: "faq",
        items: [
          { qKey: "blog.post4.faq.q1", aKey: "blog.post4.faq.a1" },
          { qKey: "blog.post4.faq.q2", aKey: "blog.post4.faq.a2" },
          { qKey: "blog.post4.faq.q3", aKey: "blog.post4.faq.a3" },
          { qKey: "blog.post4.faq.q4", aKey: "blog.post4.faq.a4" },
          { qKey: "blog.post4.faq.q5", aKey: "blog.post4.faq.a5" },
          { qKey: "blog.post4.faq.q6", aKey: "blog.post4.faq.a6" },
        ],
      },
      { type: "h2", textKey: "blog.post4.h2_close" },
      { type: "p", textKey: "blog.post4.p_close" },
      {
        type: "cta",
        titleKey: "blog.post4.cta.title",
        bodyKey: "blog.post4.cta.body",
        buttonKey: "blog.post4.cta.button",
        href: ROUTES.auditNew,
      },
    ],
  },
  {
    slug: "ai-product-descriptions",
    titleKey: "blog.post5.title",
    content: [
      { type: "h2", textKey: "blog.post5.h2_why" },
      { type: "p", textKey: "blog.post5.p_why_1" },
      { type: "p", textKey: "blog.post5.p_why_2" },
      { type: "h2", textKey: "blog.post5.h2_how" },
      {
        type: "ol",
        itemKeys: [
          "blog.post5.ol_1",
          "blog.post5.ol_2",
          "blog.post5.ol_3",
          "blog.post5.ol_4",
          "blog.post5.ol_5",
        ],
      },
      { type: "p", textKey: "blog.post5.p_how" },
      { type: "h2", textKey: "blog.post5.h2_review" },
      { type: "p", textKey: "blog.post5.p_review_1" },
      {
        type: "pLinks",
        textKey: "blog.post5.pLinks",
        links: [
          {
            href: ROUTES.blogPost("seo-for-ai-complete-guide"),
            labelKey: "blog.post5.link.seoForAi",
          },
          {
            href: ROUTES.blogPost("geo-ai-visibility-guide"),
            labelKey: "blog.post5.link.geo",
          },
          {
            href: ROUTES.blogPost("product-schema-markup"),
            labelKey: "blog.post5.link.schema",
          },
        ],
      },
      { type: "h2", textKey: "blog.post5.h2_check" },
      {
        type: "checklist",
        itemKeys: [
          "blog.post5.check_1",
          "blog.post5.check_2",
          "blog.post5.check_3",
          "blog.post5.check_4",
          "blog.post5.check_5",
          "blog.post5.check_6",
        ],
      },
      { type: "h2", textKey: "blog.post5.h2_faq" },
      {
        type: "faq",
        items: [
          { qKey: "blog.post5.faq.q1", aKey: "blog.post5.faq.a1" },
          { qKey: "blog.post5.faq.q2", aKey: "blog.post5.faq.a2" },
          { qKey: "blog.post5.faq.q3", aKey: "blog.post5.faq.a3" },
          { qKey: "blog.post5.faq.q4", aKey: "blog.post5.faq.a4" },
          { qKey: "blog.post5.faq.q5", aKey: "blog.post5.faq.a5" },
          { qKey: "blog.post5.faq.q6", aKey: "blog.post5.faq.a6" },
        ],
      },
      { type: "h2", textKey: "blog.post5.h2_close" },
      { type: "p", textKey: "blog.post5.p_close" },
      {
        type: "cta",
        titleKey: "blog.post5.cta.title",
        bodyKey: "blog.post5.cta.body",
        buttonKey: "blog.post5.cta.button",
        href: ROUTES.auditNew,
      },
    ],
  },
  {
    slug: "trust-signals-ecommerce",
    titleKey: "blog.post6.title",
    content: [
      { type: "h2", textKey: "blog.post6.h2_what" },
      { type: "p", textKey: "blog.post6.p_what_1" },
      { type: "p", textKey: "blog.post6.p_what_2" },
      { type: "h2", textKey: "blog.post6.h2_where" },
      {
        type: "ul",
        itemKeys: [
          "blog.post6.ul_1",
          "blog.post6.ul_2",
          "blog.post6.ul_3",
          "blog.post6.ul_4",
        ],
      },
      { type: "p", textKey: "blog.post6.p_where" },
      { type: "h2", textKey: "blog.post6.h2_practice" },
      { type: "p", textKey: "blog.post6.p_practice_1" },
      {
        type: "pLinks",
        textKey: "blog.post6.pLinks",
        links: [
          {
            href: ROUTES.blogPost("conversion-rate-optimization"),
            labelKey: "blog.post6.link.cro",
          },
          {
            href: ROUTES.blogPost("competitor-analysis-strategy"),
            labelKey: "blog.post6.link.competitors",
          },
          {
            href: ROUTES.blogPost("product-schema-markup"),
            labelKey: "blog.post6.link.schema",
          },
        ],
      },
      { type: "h2", textKey: "blog.post6.h2_check" },
      {
        type: "checklist",
        itemKeys: [
          "blog.post6.check_1",
          "blog.post6.check_2",
          "blog.post6.check_3",
          "blog.post6.check_4",
          "blog.post6.check_5",
          "blog.post6.check_6",
        ],
      },
      { type: "h2", textKey: "blog.post6.h2_faq" },
      {
        type: "faq",
        items: [
          { qKey: "blog.post6.faq.q1", aKey: "blog.post6.faq.a1" },
          { qKey: "blog.post6.faq.q2", aKey: "blog.post6.faq.a2" },
          { qKey: "blog.post6.faq.q3", aKey: "blog.post6.faq.a3" },
          { qKey: "blog.post6.faq.q4", aKey: "blog.post6.faq.a4" },
          { qKey: "blog.post6.faq.q5", aKey: "blog.post6.faq.a5" },
          { qKey: "blog.post6.faq.q6", aKey: "blog.post6.faq.a6" },
        ],
      },
      { type: "h2", textKey: "blog.post6.h2_close" },
      { type: "p", textKey: "blog.post6.p_close" },
      {
        type: "cta",
        titleKey: "blog.post6.cta.title",
        bodyKey: "blog.post6.cta.body",
        buttonKey: "blog.post6.cta.button",
        href: ROUTES.auditNew,
      },
    ],
  },
  {
    slug: "seo-for-ai-complete-guide",
    titleKey: "blog.post7.title",
    content: [
      { type: "h2", textKey: "blog.post7.h2_intro" },
      { type: "p", textKey: "blog.post7.p_intro_1" },
      { type: "p", textKey: "blog.post7.p_intro_2" },

      { type: "h2", textKey: "blog.post7.h2_what" },
      { type: "p", textKey: "blog.post7.p_what_1" },
      { type: "p", textKey: "blog.post7.p_what_2" },
      { type: "p", textKey: "blog.post7.p_what_3" },

      { type: "h2", textKey: "blog.post7.h2_diff" },
      { type: "p", textKey: "blog.post7.p_diff_1" },
      {
        type: "table",
        headers: ["blog.post7.table.h1", "blog.post7.table.h2", "blog.post7.table.h3"],
        rows: [
          ["blog.post7.table.r1c1", "blog.post7.table.r1c2", "blog.post7.table.r1c3"],
          ["blog.post7.table.r2c1", "blog.post7.table.r2c2", "blog.post7.table.r2c3"],
          ["blog.post7.table.r3c1", "blog.post7.table.r3c2", "blog.post7.table.r3c3"],
          ["blog.post7.table.r4c1", "blog.post7.table.r4c2", "blog.post7.table.r4c3"],
          ["blog.post7.table.r5c1", "blog.post7.table.r5c2", "blog.post7.table.r5c3"],
        ],
      },

      { type: "h2", textKey: "blog.post7.h2_gcc" },
      { type: "p", textKey: "blog.post7.p_gcc_1" },
      { type: "p", textKey: "blog.post7.p_gcc_2" },
      { type: "p", textKey: "blog.post7.p_gcc_3" },
      { type: "p", textKey: "blog.post7.p_gcc_4" },

      { type: "h2", textKey: "blog.post7.h2_how" },
      { type: "p", textKey: "blog.post7.p_how_1" },
      {
        type: "ul",
        itemKeys: [
          "blog.post7.ul_how_1",
          "blog.post7.ul_how_2",
          "blog.post7.ul_how_3",
          "blog.post7.ul_how_4",
        ],
      },
      { type: "p", textKey: "blog.post7.p_how_2" },
      {
        type: "pLinks",
        textKey: "blog.post7.pLinks_how",
        links: [
          {
            href: ROUTES.blogPost("geo-ai-visibility-guide"),
            labelKey: "blog.post7.link.geoGuide",
          },
          { href: ROUTES.docs, labelKey: "blog.post7.link.docs" },
        ],
      },

      { type: "h2", textKey: "blog.post7.h2_onpage" },
      { type: "h3", textKey: "blog.post7.h3_title" },
      { type: "p", textKey: "blog.post7.p_title_1" },
      { type: "h3", textKey: "blog.post7.h3_facts" },
      { type: "p", textKey: "blog.post7.p_facts_1" },
      { type: "h3", textKey: "blog.post7.h3_faq" },
      { type: "p", textKey: "blog.post7.p_faq_1" },
      { type: "h3", textKey: "blog.post7.h3_structure" },
      { type: "p", textKey: "blog.post7.p_structure_1" },
      { type: "h3", textKey: "blog.post7.h3_media" },
      { type: "p", textKey: "blog.post7.p_media_1" },

      { type: "h2", textKey: "blog.post7.h2_schema" },
      { type: "p", textKey: "blog.post7.p_schema_1" },
      { type: "p", textKey: "blog.post7.p_schema_2" },
      { type: "p", textKey: "blog.post7.p_schema_3" },
      {
        type: "pLinks",
        textKey: "blog.post7.pLinks_schema",
        links: [
          {
            href: ROUTES.blogPost("product-schema-markup"),
            labelKey: "blog.post7.link.schemaGuide",
          },
        ],
      },

      { type: "h2", textKey: "blog.post7.h2_measure" },
      { type: "p", textKey: "blog.post7.p_measure_1" },
      { type: "p", textKey: "blog.post7.p_measure_2" },

      { type: "h2", textKey: "blog.post7.h2_content" },
      { type: "p", textKey: "blog.post7.p_content_1" },
      { type: "p", textKey: "blog.post7.p_content_2" },
      {
        type: "pLinks",
        textKey: "blog.post7.pLinks_content",
        links: [
          {
            href: ROUTES.blogPost("ai-product-descriptions"),
            labelKey: "blog.post7.link.aiDescriptions",
          },
        ],
      },

      { type: "h2", textKey: "blog.post7.h2_trust" },
      { type: "p", textKey: "blog.post7.p_trust_1" },
      {
        type: "pLinks",
        textKey: "blog.post7.pLinks_trust",
        links: [
          {
            href: ROUTES.blogPost("trust-signals-ecommerce"),
            labelKey: "blog.post7.link.trustGuide",
          },
        ],
      },

      { type: "h2", textKey: "blog.post7.h2_platforms" },
      { type: "p", textKey: "blog.post7.p_platforms_1" },
      {
        type: "ul",
        itemKeys: [
          "blog.post7.ul_plat_1",
          "blog.post7.ul_plat_2",
          "blog.post7.ul_plat_3",
        ],
      },
      {
        type: "pLinks",
        textKey: "blog.post7.pLinks_platforms",
        links: [{ href: "/#platforms", labelKey: "blog.post7.link.platforms" }],
      },

      { type: "h2", textKey: "blog.post7.h2_mistakes" },
      {
        type: "ol",
        itemKeys: [
          "blog.post7.ol_m1",
          "blog.post7.ol_m2",
          "blog.post7.ol_m3",
          "blog.post7.ol_m4",
          "blog.post7.ol_m5",
          "blog.post7.ol_m6",
        ],
      },

      { type: "h2", textKey: "blog.post7.h2_process" },
      { type: "p", textKey: "blog.post7.p_process_1" },
      {
        type: "ol",
        itemKeys: [
          "blog.post7.ol_p1",
          "blog.post7.ol_p2",
          "blog.post7.ol_p3",
          "blog.post7.ol_p4",
          "blog.post7.ol_p5",
        ],
      },

      { type: "h2", textKey: "blog.post7.h2_checklist" },
      {
        type: "checklist",
        itemKeys: [
          "blog.post7.check_1",
          "blog.post7.check_2",
          "blog.post7.check_3",
          "blog.post7.check_4",
          "blog.post7.check_5",
          "blog.post7.check_6",
          "blog.post7.check_7",
          "blog.post7.check_8",
          "blog.post7.check_9",
          "blog.post7.check_10",
        ],
      },

      { type: "h2", textKey: "blog.post7.h2_faq" },
      {
        type: "faq",
        items: [
          { qKey: "blog.post7.faq.q1", aKey: "blog.post7.faq.a1" },
          { qKey: "blog.post7.faq.q2", aKey: "blog.post7.faq.a2" },
          { qKey: "blog.post7.faq.q3", aKey: "blog.post7.faq.a3" },
          { qKey: "blog.post7.faq.q4", aKey: "blog.post7.faq.a4" },
          { qKey: "blog.post7.faq.q5", aKey: "blog.post7.faq.a5" },
          { qKey: "blog.post7.faq.q6", aKey: "blog.post7.faq.a6" },
          { qKey: "blog.post7.faq.q7", aKey: "blog.post7.faq.a7" },
        ],
      },

      { type: "h2", textKey: "blog.post7.h2_close" },
      { type: "p", textKey: "blog.post7.p_close_1" },
      { type: "p", textKey: "blog.post7.p_close_2" },
      {
        type: "pLinks",
        textKey: "blog.post7.pLinks_close",
        links: [{ href: "/#methodology", labelKey: "blog.post7.link.methodology" }],
      },

      {
        type: "cta",
        titleKey: "blog.post7.cta.title",
        bodyKey: "blog.post7.cta.body",
        buttonKey: "blog.post7.cta.button",
        href: ROUTES.auditNew,
      },
    ],
  }
];
