import type { MetadataRoute } from "next";
import { TOOLS, SITE_CONFIG } from "@/lib/tools";
import { getAllPosts } from "@/lib/blog";

/**
 * Generate the sitemap from the TOOLS array, blog posts, plus static pages.
 * Available at /sitemap.xml.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_CONFIG.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_CONFIG.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_CONFIG.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_CONFIG.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_CONFIG.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolPages: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${SITE_CONFIG.url}/tools/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_CONFIG.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...toolPages, ...blogPages];
}
