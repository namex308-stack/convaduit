import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";
import { PUBLIC_INDEXABLE_PATHS } from "@/lib/seo/internal-links";
import { canonicalPageUrl } from "@/lib/site-url";

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

/**
 * Crawl signals for public indexable paths.
 * Defaults: blog posts → 0.6 / monthly; other static → 0.5 / monthly.
 */
const SITEMAP_SIGNAL: Partial<
  Record<string, { priority: number; changeFrequency: ChangeFreq }>
> = {
  [ROUTES.home]: { priority: 1, changeFrequency: "weekly" },
  [ROUTES.pricing]: { priority: 0.9, changeFrequency: "monthly" },
  [ROUTES.blog]: { priority: 0.8, changeFrequency: "weekly" },
  [ROUTES.docs]: { priority: 0.7, changeFrequency: "monthly" },
  [ROUTES.security]: { priority: 0.5, changeFrequency: "monthly" },
  [ROUTES.privacy]: { priority: 0.5, changeFrequency: "monthly" },
  [ROUTES.terms]: { priority: 0.5, changeFrequency: "monthly" },
  [ROUTES.refundPolicy]: { priority: 0.5, changeFrequency: "monthly" },
  [ROUTES.about]: { priority: 0.5, changeFrequency: "monthly" },
  [ROUTES.contact]: { priority: 0.5, changeFrequency: "monthly" },
  [ROUTES.roadmap]: { priority: 0.4, changeFrequency: "monthly" },
};

const BLOG_POST_SIGNAL = {
  priority: 0.6,
  changeFrequency: "monthly" as const satisfies ChangeFreq,
};

const DEFAULT_STATIC_SIGNAL = {
  priority: 0.5,
  changeFrequency: "monthly" as const satisfies ChangeFreq,
};

function sitemapSignal(path: string): {
  priority: number;
  changeFrequency: ChangeFreq;
} {
  const known = SITEMAP_SIGNAL[path];
  if (known) return known;
  if (path.startsWith(`${ROUTES.blog}/`)) return BLOG_POST_SIGNAL;
  return DEFAULT_STATIC_SIGNAL;
}

/**
 * Canonical public URLs only — driven by `PUBLIC_INDEXABLE_PATHS`.
 *
 * Excluded (by design):
 * - Private/authenticated app surfaces (dashboard, audit, settings, auth, …)
 * - API routes
 * - lastModified — omitted when no reliable modification timestamp exists
 *   (do not invent or stamp “today” / synthetic dates)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = PUBLIC_INDEXABLE_PATHS.map((path) => {
    const signal = sitemapSignal(path);
    return {
      url: canonicalPageUrl(path),
      changeFrequency: signal.changeFrequency,
      priority: signal.priority,
    };
  });

  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
