import { MARKETING_PLANS } from "@/lib/billing/plans";
import { translate } from "@/lib/locale/t";
import { ROUTES } from "@/lib/routes";
import { absoluteUrl, canonicalPageUrl, getSiteUrl } from "@/lib/site-url";
import { HOME_FAQ_KEYS } from "@/lib/seo/faq-keys";
import { isCalendarDateOnOrBeforeToday } from "@/lib/seo/dates";
import { CONTACT_EMAIL, CONTACT_WHATSAPP_E164 } from "@/lib/seo/contact";
import type { LocaleId } from "@/lib/locale/types";
import {
  SITE_NAME,
  SITE_OFFICIAL_DESCRIPTION,
  getSiteOfficialDescription,
} from "@/lib/seo/site-copy";
import { ORGANIZATION_SAME_AS } from "@/lib/seo/social";
import { gulfAreaServedSchema } from "@/lib/seo/gulf-keyword-map";

export { HOME_FAQ_KEYS } from "@/lib/seo/faq-keys";

const SCHEMA_CONTEXT = "https://schema.org";
const ORG_FRAGMENT = "#organization";
const WEBSITE_FRAGMENT = "#website";
const SOFTWARE_FRAGMENT = "#software";

function entityId(base: string, fragment: string): string {
  return `${base.replace(/\/+$/, "")}/${fragment}`;
}

/** Stable `@id` for the site Organization (used in `@graph` to avoid duplicate nodes). */
export function organizationSchemaId(base: string): string {
  return entityId(base, ORG_FRAGMENT);
}

export function websiteSchemaId(base: string): string {
  return entityId(base, WEBSITE_FRAGMENT);
}

function softwareSchemaId(base: string): string {
  return entityId(base, SOFTWARE_FRAGMENT);
}

/**
 * Product description for schema — factual, aligned with homepage pillars.
 * Locale-aware via `schema.softwareDescription` message key.
 */
function softwareDescription(locale: LocaleId): string {
  return translate("schema.softwareDescription", undefined, locale);
}

function organizationNode(base: string) {
  return {
    "@type": "Organization" as const,
    "@id": organizationSchemaId(base),
    name: SITE_NAME,
    url: base,
    logo: {
      "@type": "ImageObject" as const,
      url: absoluteUrl("/apple-icon"),
      width: 180,
      height: 180,
    },
    description: SITE_OFFICIAL_DESCRIPTION,
    email: CONTACT_EMAIL,
    areaServed: gulfAreaServedSchema(),
    ...(ORGANIZATION_SAME_AS.length > 0 ? { sameAs: [...ORGANIZATION_SAME_AS] } : {}),
    contactPoint: {
      "@type": "ContactPoint" as const,
      email: CONTACT_EMAIL,
      telephone: `+${CONTACT_WHATSAPP_E164}`,
      contactType: "customer support",
      url: absoluteUrl(ROUTES.contact),
      availableLanguage: ["ar"],
    },
  };
}

function webSiteNode(base: string) {
  return {
    "@type": "WebSite" as const,
    "@id": websiteSchemaId(base),
    name: SITE_NAME,
    url: base,
    inLanguage: "ar",
    description: SITE_OFFICIAL_DESCRIPTION,
    publisher: { "@id": organizationSchemaId(base) },
    about: { "@id": softwareSchemaId(base) },
  };
}

function webPageNode(
  base: string,
  input: { name: string; url: string; description?: string },
  locale: LocaleId = "ar"
) {
  const inLanguage = "ar";
  return {
    "@type": "WebPage" as const,
    "@id": input.url,
    url: input.url,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    inLanguage,
    isPartOf: { "@id": websiteSchemaId(base) },
    about: { "@id": softwareSchemaId(base) },
    publisher: { "@id": organizationSchemaId(base) },
  };
}

function softwareApplicationNode(base: string, locale: LocaleId = "ar") {
  const description = softwareDescription(locale);
  const featureList = [
    translate("schema.feature.seo", undefined, locale),
    translate("schema.feature.conversion", undefined, locale),
    translate("schema.feature.geo", undefined, locale),
    translate("schema.feature.trust", undefined, locale),
    translate("schema.feature.competitors", undefined, locale),
    translate("schema.feature.aiGenerator", undefined, locale),
    translate("schema.feature.platforms", undefined, locale),
  ];
  const offerCatalogName = translate("schema.offerCatalogName", undefined, locale);

  return {
    "@type": ["SoftwareApplication", "Product"] as const,
    "@id": softwareSchemaId(base),
    name: "ConvAudit",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: base,
    image: absoluteUrl("/opengraph-image"),
    description,
    brand: { "@id": organizationSchemaId(base) },
    provider: { "@id": organizationSchemaId(base) },
    areaServed: gulfAreaServedSchema(),
    isPartOf: { "@id": websiteSchemaId(base) },
    offers: MARKETING_PLANS.map((plan) => ({
      "@type": "Offer" as const,
      name: plan.name,
      price: String(plan.monthlyPrice),
      priceCurrency: "EGP",
      url: absoluteUrl(ROUTES.pricing),
    })),
    featureList,
    hasOfferCatalog: {
      "@type": "OfferCatalog" as const,
      name: offerCatalogName,
      itemListElement: [
        {
          "@type": "ListItem" as const,
          position: 1,
          item: {
            "@type": "Service" as const,
            name: translate("schema.service.seo", undefined, locale),
            url: `${base}/#features`,
          },
        },
        {
          "@type": "ListItem" as const,
          position: 2,
          item: {
            "@type": "Service" as const,
            name: translate("schema.service.conversion", undefined, locale),
            url: `${base}/#features`,
          },
        },
        {
          "@type": "ListItem" as const,
          position: 3,
          item: {
            "@type": "Service" as const,
            name: translate("schema.service.geo", undefined, locale),
            url: `${base}/#methodology`,
          },
        },
        {
          "@type": "ListItem" as const,
          position: 4,
          item: {
            "@type": "Service" as const,
            name: translate("schema.service.trust", undefined, locale),
            url: absoluteUrl(ROUTES.blogPost("trust-signals-ecommerce")),
          },
        },
        {
          "@type": "ListItem" as const,
          position: 5,
          item: {
            "@type": "Service" as const,
            name: translate("schema.service.competitors", undefined, locale),
            url: absoluteUrl(ROUTES.blogPost("competitor-analysis-strategy")),
          },
        },
      ],
    },
  };
}

function faqPageNode(locale: LocaleId = "ar") {
  return {
    "@type": "FAQPage" as const,
    mainEntity: HOME_FAQ_KEYS.map(({ qKey, aKey }) => ({
      "@type": "Question" as const,
      name: translate(qKey, undefined, locale),
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: translate(aKey, undefined, locale),
      },
    })),
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

function breadcrumbNode(url: string, crumbs: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList" as const,
    "@id": `${url}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function buildContactPageJsonLd() {
  const base = getSiteUrl();
  const url = absoluteUrl(ROUTES.contact);
  const crumbs: BreadcrumbItem[] = [
    { name: SITE_NAME, path: ROUTES.home },
    { name: "اتصل بنا", path: ROUTES.contact },
  ];

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      organizationNode(base),
      webSiteNode(base),
      {
        "@type": "ContactPage" as const,
        "@id": url,
        url,
        name: "اتصل بنا",
        inLanguage: "ar",
        isPartOf: { "@id": websiteSchemaId(base) },
        about: { "@id": softwareSchemaId(base) },
        publisher: { "@id": organizationSchemaId(base) },
        mainEntity: { "@id": organizationSchemaId(base) },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbNode(url, crumbs),
    ],
  };
}

/** Standalone Organization block (tests / reuse). */
export function buildOrganizationJsonLd() {
  const base = getSiteUrl();
  return {
    "@context": SCHEMA_CONTEXT,
    ...organizationNode(base),
  };
}

export function buildWebSiteJsonLd() {
  const base = getSiteUrl();
  return {
    "@context": SCHEMA_CONTEXT,
    ...webSiteNode(base),
  };
}

/**
 * Offer prices mirror `MARKETING_PLANS` / Paymob EGP amounts — never invent USD.
 */
export function buildSoftwareApplicationJsonLd(locale: LocaleId = "ar") {
  const base = getSiteUrl();
  return {
    "@context": SCHEMA_CONTEXT,
    ...softwareApplicationNode(base, locale),
  };
}

export function buildFaqPageJsonLd(locale: LocaleId = "ar") {
  return {
    "@context": SCHEMA_CONTEXT,
    ...faqPageNode(locale),
  };
}

/** FAQPage JSON-LD from explicit Q/A pairs (e.g. blog article FAQs). */
export function buildFaqPageJsonLdFromPairs(
  items: readonly { question: string; answer: string }[],
  path: string
) {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "FAQPage" as const,
    url: absoluteUrl(path),
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question" as const,
      name: question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: answer,
      },
    })),
  };
}

/** BreadcrumbList + WebPage for inner marketing URLs — includes Organization/WebSite nodes once. */
export function buildMarketingPageJsonLd(input: {
  name: string;
  path: string;
  description?: string;
  locale?: LocaleId;
}) {
  const base = getSiteUrl();
  const url = absoluteUrl(input.path);
  const locale = input.locale ?? "ar";
  const crumbs: BreadcrumbItem[] = [
    { name: SITE_NAME, path: ROUTES.home },
    { name: input.name, path: input.path },
  ];

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      organizationNode(base),
      webSiteNode(base),
      {
        ...webPageNode(
          base,
          {
            name: input.name,
            url,
            description: input.description,
          },
          locale
        ),
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbNode(url, crumbs),
    ],
  };
}

export function buildBlogArticleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedOn?: string;
  locale?: LocaleId;
}) {
  const base = getSiteUrl();
  const url = absoluteUrl(input.path);
  const orgId = organizationSchemaId(base);
  const inLanguage = "ar";

  const jsonLd: Record<string, unknown> = {
    "@context": SCHEMA_CONTEXT,
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage,
    image: [absoluteUrl("/opengraph-image")],
    author: {
      "@type": "Organization",
      "@id": orgId,
      name: SITE_NAME,
      url: base,
    },
    publisher: {
      "@type": "Organization",
      "@id": orgId,
      name: SITE_NAME,
      url: base,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/apple-icon"),
        width: 180,
        height: 180,
      },
    },
  };

  // Emit datePublished only when the calendar date is not in the future.
  // Do not invent dateModified — we have no reliable modified timestamp.
  if (input.publishedOn && isCalendarDateOnOrBeforeToday(input.publishedOn)) {
    jsonLd.datePublished = input.publishedOn;
  }

  return jsonLd;
}

/**
 * Homepage graph — one JSON-LD script, linked entities via `@id` (no duplicate Organization nodes).
 */
export function buildHomeJsonLdGraph(locale: LocaleId = "ar") {
  const base = getSiteUrl();
  const description = getSiteOfficialDescription(locale);
  const inLanguage = "ar";
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      organizationNode(base),
      { ...webSiteNode(base), inLanguage },
      {
        ...webPageNode(
          base,
          {
            name: SITE_NAME,
            url: canonicalPageUrl("/"),
            description,
          },
          locale
        ),
        mainEntity: { "@id": softwareSchemaId(base) },
      },
      softwareApplicationNode(base, locale),
      faqPageNode(locale),
    ],
  };
}

/** Collect every absolute URL string embedded in a JSON-LD object (for tests). */
export function collectJsonLdUrls(node: unknown, out: string[] = []): string[] {
  if (node === null || node === undefined) return out;
  if (typeof node === "string") {
    if (/^https?:\/\//i.test(node)) out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdUrls(item, out);
    return out;
  }
  if (typeof node === "object") {
    // Ignore the @context property — it's an external JSON-LD context
    // (e.g. "https://schema.org") and not a site-owned canonical URL.
    const obj = node as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      if (key === "@context") continue;
      collectJsonLdUrls(value, out);
    }
  }
  return out;
}
