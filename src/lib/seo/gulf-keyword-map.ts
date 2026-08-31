import { ROUTES } from "@/lib/routes";
import { BLOG_SLUGS } from "@/lib/blog-posts";

/** GCC markets targeted in public copy and JSON-LD `areaServed`. */
export const GULF_CC_MARKETS = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
] as const;

export type SearchIntent = "commercial" | "informational";

export type GulfKeywordAssignment = {
  path: string;
  primary: readonly string[];
  secondary: readonly string[];
  intent: SearchIntent;
};

/**
 * Editorial keyword-to-page map for Gulf-market SEO.
 * Used as a content guide — not for automated keyword injection.
 */
export const GULF_KEYWORD_MAP: readonly GulfKeywordAssignment[] = [
  {
    path: ROUTES.home,
    primary: ["ecommerce audit", "ecommerce analytics", "AI visibility"],
    secondary: [
      "GEO audit",
      "SEO audit",
      "conversion rate optimization",
      "CRO",
      "store performance analysis",
      "store visibility in AI",
    ],
    intent: "commercial",
  },
  {
    path: ROUTES.pricing,
    primary: ["ecommerce audit", "ecommerce analytics"],
    secondary: [
      "Shopify audit",
      "WooCommerce audit",
      "Salla audit",
      "Zid audit",
      "custom stores",
      "competitor analysis",
      "conversion growth",
    ],
    intent: "commercial",
  },
  {
    path: ROUTES.docs,
    primary: ["ecommerce audit", "ecommerce analytics", "website audit"],
    secondary: [
      "SEO audit",
      "GEO audit",
      "AI visibility",
      "product page analysis",
      "user experience analysis",
      "Shopify audit",
      "Salla audit",
    ],
    intent: "informational",
  },
  {
    path: ROUTES.blog,
    primary: ["SEO audit", "GEO audit", "AI visibility"],
    secondary: [
      "ecommerce audit",
      "conversion rate optimization",
      "competitor analysis",
      "store visibility in search engines",
    ],
    intent: "informational",
  },
  {
    path: ROUTES.about,
    primary: ["ecommerce audit", "ecommerce analysis"],
    secondary: [
      "AI visibility",
      "GEO audit",
      "Shopify audit",
      "Salla audit",
      "Zid audit",
      "custom stores",
      "GCC Countries",
    ],
    intent: "informational",
  },
  {
    path: ROUTES.blogPost("geo-ai-visibility-guide"),
    primary: ["GEO audit", "store visibility in AI"],
    secondary: [
      "AI visibility",
      "ecommerce audit",
      "product page optimization",
      "GCC Countries",
    ],
    intent: "informational",
  },
  {
    path: ROUTES.blogPost("conversion-rate-optimization"),
    primary: ["conversion rate optimization", "CRO"],
    secondary: [
      "product page optimization",
      "user experience optimization",
      "ecommerce audit",
      "sales optimization",
    ],
    intent: "informational",
  },
  {
    path: ROUTES.blogPost("product-schema-markup"),
    primary: ["product page analysis", "SEO analysis"],
    secondary: [
      "Shopify audit",
      "WooCommerce audit",
      "Salla audit",
      "Zid audit",
      "store visibility in search engines",
    ],
    intent: "informational",
  },
  {
    path: ROUTES.blogPost("competitor-analysis-strategy"),
    primary: ["competitor analysis", "competitor performance analysis"],
    secondary: [
      "ecommerce analytics",
      "ecommerce audit",
      "store performance analysis",
      "GCC Countries",
    ],
    intent: "informational",
  },
  {
    path: ROUTES.blogPost("ai-product-descriptions"),
    primary: ["product page optimization"],
    secondary: [
      "user experience optimization",
      "ecommerce optimization",
      "AI visibility",
    ],
    intent: "informational",
  },
  {
    path: ROUTES.blogPost("trust-signals-ecommerce"),
    primary: ["trust signals", "store trust optimization"],
    secondary: [
      "user experience analysis",
      "conversion rate optimization",
      "ecommerce audit",
    ],
    intent: "informational",
  },
  {
    path: ROUTES.blogPost("seo-for-ai-complete-guide"),
    primary: ["SEO audit", "AI visibility"],
    secondary: [
      "GEO audit",
      "ecommerce audit",
      "store visibility in AI",
      "store visibility in search engines",
      "Shopify audit",
      "Salla audit",
      "Zid audit",
      "WooCommerce audit",
      "GCC Countries",
      "product page optimization",
    ],
    intent: "informational",
  },
] as const;

/** Schema.org `Country` nodes for Organization / Product graphs. */
export function gulfAreaServedSchema() {
  return GULF_CC_MARKETS.map((name) => ({
    "@type": "Country" as const,
    name,
  }));
}

/** Guardrail: every blog slug should appear in the map or inherit blog index keywords. */
export function blogSlugsInKeywordMap(): string[] {
  return BLOG_SLUGS.filter((slug) =>
    GULF_KEYWORD_MAP.some((entry) => entry.path === ROUTES.blogPost(slug))
  );
}
