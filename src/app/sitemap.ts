import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { ROUTES } from "@/lib/routes";
import { canonicalPageUrl } from "@/lib/site-url";

/**
 * Canonical public URLs only.
 *
 * Excluded (by design):
 * - Private/authenticated app surfaces (dashboard, audit, settings, auth, …)
 * - API routes
 * - lastModified — omitted when no reliable modification timestamp exists
 *   (do not invent or stamp “today” / synthetic dates)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFreq: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  }> = [
    { path: ROUTES.home, priority: 1, changeFreq: "weekly" },
    { path: ROUTES.pricing, priority: 0.9, changeFreq: "monthly" },
    { path: ROUTES.docs, priority: 0.7, changeFreq: "monthly" },
    { path: ROUTES.blog, priority: 0.8, changeFreq: "weekly" },
    { path: ROUTES.security, priority: 0.5, changeFreq: "monthly" },
    { path: ROUTES.privacy, priority: 0.5, changeFreq: "monthly" },
    { path: ROUTES.terms, priority: 0.5, changeFreq: "monthly" },
    { path: ROUTES.refundPolicy, priority: 0.5, changeFreq: "monthly" },
    { path: ROUTES.about, priority: 0.5, changeFreq: "monthly" },
    { path: ROUTES.contact, priority: 0.5, changeFreq: "monthly" },
    { path: ROUTES.roadmap, priority: 0.4, changeFreq: "monthly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: canonicalPageUrl(r.path),
    changeFrequency: r.changeFreq,
    priority: r.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: canonicalPageUrl(ROUTES.blogPost(post.slug)),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const entries = [...staticEntries, ...blogEntries];
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
