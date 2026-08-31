import type { Metadata } from "next";
import { DEFAULT_LOCALE, getLocaleConfig } from "@/lib/locale/config";
import type { LocaleId } from "@/lib/locale/types";
import { SITE_OG_TITLE, SITE_TITLE_MAX } from "@/lib/seo/site-copy";
import { twitterSiteFields } from "@/lib/seo/social";
import { canonicalPageUrl } from "@/lib/site-url";

const TITLE_TEMPLATE_SUFFIX = " · ConvAudit";

export const PUBLIC_PAGE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
  },
} as const satisfies NonNullable<Metadata["robots"]>;

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE_OG_TITLE,
} as const;

export const TWITTER_IMAGE = {
  url: "/twitter-image",
  width: 1200,
  height: 630,
  alt: SITE_OG_TITLE,
} as const;

type PublicPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  /** Defaults to `website`. Use `article` for blog posts. */
  type?: "website" | "article";
  /**
   * When false, page stays crawlable for UX but is not indexed
   * (use sparingly for thin or transitional public surfaces).
   */
  indexable?: boolean;
  /** UI locale for Open Graph `locale` tag. Defaults to Arabic. */
  locale?: LocaleId;
};

/**
 * Apply the root `%s · ConvAudit` template only when the composed document
 * title stays within the SERP display limit. Longer article titles keep their
 * full wording and drop the suffix instead of being truncated.
 */
export function resolvePublicTitle(title: string): Metadata["title"] {
  const composed = `${title}${TITLE_TEMPLATE_SUFFIX}`;
  if (composed.length <= SITE_TITLE_MAX) return title;
  return { absolute: title };
}

/**
 * Shared metadata shape for crawlable marketing/content pages.
 * Canonical + OG `url` use `canonicalPageUrl()` (www home ends with `/`).
 */
export function publicPageMetadata({
  title,
  description,
  path,
  type = "website",
  indexable = true,
  locale = DEFAULT_LOCALE,
}: PublicPageMetadataInput): Metadata {
  const localeConfig = getLocaleConfig(locale);
  const canonical = canonicalPageUrl(path);

  return {
    title: resolvePublicTitle(title),
    description,
    alternates: {
      canonical,
      languages: {
        ar: canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "ConvAudit",
      locale: localeConfig.ogLocale,
      type,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      ...twitterSiteFields(),
      title,
      description,
      images: [TWITTER_IMAGE],
    },
    robots: indexable
      ? PUBLIC_PAGE_ROBOTS
      : {
          // Non-indexable public surfaces — crawlable UX, not for search results.
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
  };
}
