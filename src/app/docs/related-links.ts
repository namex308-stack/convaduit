import type { TranslationKey } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

/** Crawlable related destinations on `/docs` — public indexable paths only. */
export const DOCS_RELATED_LINKS: readonly {
  href: string;
  labelKey: TranslationKey;
}[] = [
  { href: "/#how", labelKey: "docs.related.audit" },
  { href: "/#methodology", labelKey: "docs.related.geo" },
  { href: "/#platforms", labelKey: "docs.related.platforms" },
  { href: `${ROUTES.docs}#2`, labelKey: "docs.related.generator" },
  { href: ROUTES.pricing, labelKey: "docs.related.pricing" },
  {
    href: ROUTES.blogPost("geo-ai-visibility-guide"),
    labelKey: "docs.related.geoGuide",
  },
  {
    href: ROUTES.blogPost("conversion-rate-optimization"),
    labelKey: "docs.related.conversionGuide",
  },
  {
    href: ROUTES.blogPost("product-schema-markup"),
    labelKey: "docs.related.seoGuide",
  },
  {
    href: ROUTES.blogPost("trust-signals-ecommerce"),
    labelKey: "docs.related.trustGuide",
  },
  {
    href: ROUTES.blogPost("competitor-analysis-strategy"),
    labelKey: "docs.related.competitorGuide",
  },
];
