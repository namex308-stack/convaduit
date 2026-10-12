import type { MetadataRoute } from "next";
import { TOOLS, SITE_CONFIG } from "@/lib/tools";

/**
 * Generate the sitemap from the TOOLS array plus static pages.
 * Available at /sitemap.xml.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_CONFIG.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
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

  return [...staticPages, ...toolPages];
}
