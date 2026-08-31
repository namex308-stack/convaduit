/**
 * Shared marketing copy for root defaults + homepage metadata.
 * Keep claims factual — no unsupported SLAs or invented statistics.
 */
export const SITE_NAME = "ConvAudit";

/** Canonical brand sentence for Organization / WebSite JSON-LD and llms.txt. */
export const SITE_OFFICIAL_DESCRIPTION =
  "ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.";

/** Browser / SERP title — keep ≤60 characters (Google display limit). */
export const SITE_TITLE_MAX = 60;

/**
 * Arabic-first homepage title. Latin tokens (ConvAudit, SEO, GEO) are the
 * product name and category terms already used in the Arabic UI — not a
 * separate English page.
 */
export const SITE_DEFAULT_TITLE = "ConvAudit | تدقيق SEO وGEO للمتاجر";

/**
 * Open Graph / Twitter title — same string as the document title so one URL
 * does not advertise two headlines.
 */
export const SITE_OG_TITLE = SITE_DEFAULT_TITLE;

/**
 * Homepage / root meta description — Arabic-first, unique vs `/about`.
 * Official English entity sentence stays on Organization/WebSite JSON-LD,
 * About (ltr paragraph), and llms.txt.
 */
export const SITE_DESCRIPTION =
  "ConvAudit منصة تدقيق متاجر إلكترونية: نحلّل صفحات المنتجات عبر SEO والتحويل وظهور الذكاء الاصطناعي (GEO) وإشارات الثقة.";

/** Metadata keywords — Arabic product terms plus the English queries we actually serve. */
export const SITE_KEYWORDS = [
  "ecommerce SEO audit",
  "ecommerce SEO audit tool",
  "ecommerce website audit",
  "online store audit",
  "ecommerce conversion audit",
  "Shopify SEO audit",
  "WooCommerce SEO audit",
  "AI visibility audit",
  "ecommerce AI visibility",
  "AI search optimization",
  "GEO audit",
  "ecommerce AI SEO",
  "ecommerce competitor analysis",
  "تحليل متجر إلكتروني",
  "تحسين صفحة المنتج",
  "تحسين معدل التحويل",
  "GEO SEO",
  "تحليل متجر بالذكاء الاصطناعي",
  "تحليل Shopify",
  "سلة",
  "زد",
  "تحليل WooCommerce",
] as const;
