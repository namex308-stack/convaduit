/**
 * Arabic site copy for metadata and JSON-LD.
 */
import type { LocaleId } from "@/lib/locale/types";

export const SITE_NAME = "ConvAudit";

/** Canonical brand sentence for Organization / WebSite JSON-LD and llms.txt. */
export const SITE_OFFICIAL_DESCRIPTION =
  "ConvAudit is an AI-powered ecommerce audit and analytics platform for Gulf GCC online stores, analyzing SEO audits, conversion rate optimization (CRO), AI visibility (GEO), competitor performance, product page optimization, and trust signals for Shopify, Salla, Zid, WooCommerce, and custom storefronts.";

export const SITE_OFFICIAL_DESCRIPTION_AR =
  "ConvAudit منصة تدقيق وتحليل متاجر إلكترونية بالذكاء الاصطناعي لمتاجر الخليج (GCC): تدقيق SEO، CRO، GEO وظهور AI، تحليلات المتجر، المنافسين، وإشارات الثقة — Shopify وسلة وزد وWooCommerce والمتاجر المخصصة.";

/** Browser / SERP title — keep ≤60 characters (Google display limit). */
export const SITE_TITLE_MAX = 60;

export const SITE_DEFAULT_TITLE_AR = "ConvAudit | تدقيق SEO وGEO لمتاجر الخليج";

export const SITE_DESCRIPTION_AR =
  "ConvAudit تدقيق وتحليل متاجر إلكترونية للخليج (GCC): SEO، CRO والتحويل، GEO Audit وظهور AI، تحليلات المتجر والمنافسين — Shopify وسلة وزد وWooCommerce. الصق رابطاً.";

/** @deprecated Use `getSiteDefaultTitle()` */
export const SITE_DEFAULT_TITLE = SITE_DEFAULT_TITLE_AR;

/** @deprecated Use `getSiteOgTitle()` */
export const SITE_OG_TITLE = SITE_DEFAULT_TITLE_AR;

/** @deprecated Use `getSiteDescription()` */
export const SITE_DESCRIPTION = SITE_DESCRIPTION_AR;

export const SITE_KEYWORDS = [
  "ecommerce audit",
  "ecommerce analytics",
  "ecommerce analysis",
  "ecommerce optimization",
  "store performance analysis",
  "user experience analysis",
  "conversion rate optimization",
  "CRO",
  "SEO audit",
  "SEO analysis",
  "store visibility optimization",
  "store visibility in search engines",
  "store visibility in AI",
  "AI visibility",
  "GEO",
  "GEO audit",
  "competitor analysis",
  "competitor performance analysis",
  "product page analysis",
  "landing page analysis",
  "product page optimization",
  "user experience optimization",
  "sales optimization",
  "conversion growth",
  "sales growth",
  "store trust optimization",
  "trust signals",
  "ecommerce SEO audit",
  "Shopify SEO audit",
  "WooCommerce SEO audit",
  "ecommerce competitor analysis",
  "ecommerce website audit",
  "Shopify audit",
  "Salla audit",
  "Zid audit",
  "WooCommerce audit",
  "custom stores",
  "Gulf ecommerce audit",
  "GCC ecommerce audit",
  "Saudi Arabia ecommerce",
  "UAE ecommerce audit",
  "تحليل متجر إلكتروني",
  "تدقيق متجر إلكتروني",
  "تحليلات المتجر الإلكتروني",
  "تدقيق SEO للمتاجر",
  "تحسين معدل التحويل",
  "ظهور المتجر في محركات البحث",
  "ظهور المتجر في الذكاء الاصطناعي",
  "تحليل المنافسين",
  "تحليل صفحة المنتج",
  "تحليل الصفحة المقصودة",
  "تحسين تجربة المستخدم",
  "إشارات الثقة",
  "متاجر الخليج",
  "دول الخليج",
] as const;

export function getSiteDefaultTitle(_locale?: LocaleId): string {
  return SITE_DEFAULT_TITLE_AR;
}

export function getSiteOgTitle(_locale?: LocaleId): string {
  return SITE_DEFAULT_TITLE_AR;
}

export function getSiteDescription(_locale?: LocaleId): string {
  return SITE_DESCRIPTION_AR;
}

export function getSiteOfficialDescription(_locale?: LocaleId): string {
  return SITE_OFFICIAL_DESCRIPTION_AR;
}
