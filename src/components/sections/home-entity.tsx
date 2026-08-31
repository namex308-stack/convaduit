import { ROUTES } from "@/lib/routes";

/**
 * Topical homepage entity links — used by crawlability inventory tests.
 * Visible co-occurrence lives in the hero H1/subheadline and existing sections;
 * do not reintroduce a hidden/sr-only keyword block.
 */
export const HOME_ENTITY_LINKS = [
  { href: "/#features", label: "تدقيق SEO للمتاجر الإلكترونية" },
  {
    href: ROUTES.blogPost("conversion-rate-optimization"),
    label: "تدقيق التحويل لصفحات المنتجات",
  },
  {
    href: "/#methodology",
    label: "تحليل قابلية الظهور في الذكاء الاصطناعي (GEO)",
  },
  {
    href: ROUTES.blogPost("trust-signals-ecommerce"),
    label: "تدقيق إشارات الثقة",
  },
  {
    href: ROUTES.blogPost("competitor-analysis-strategy"),
    label: "تحليل المنافسين",
  },
] as const;
