import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/tools";

/**
 * robots.txt — allow all crawlers, disallow the API directory, point to
 * the sitemap and RSS feed.
 *
 * Available at /robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/search"],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
