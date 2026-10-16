import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/tools";

/**
 * robots.txt — keep the site crawlable while excluding the API endpoints.
 *
 * Explicitly allow major AI crawler bots to read the public content and
 * discover the llms.txt summary in addition to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/about", "/privacy", "/terms", "/search"],
        disallow: ["/api/"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT", "ClaudeBot", "Google-Extended", "PerplexityBot", "CCBot"],
        allow: ["/", "/blog", "/about", "/privacy", "/terms", "/search"],
        disallow: ["/api/"],
      },
    ],
    sitemap: [`${SITE_CONFIG.url}/sitemap.xml`, `${SITE_CONFIG.url}/rss.xml`],
    host: SITE_CONFIG.url,
  };
}
