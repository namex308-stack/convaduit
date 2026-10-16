import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/tools";

/**
 * Public pages are available to search and answer-engine crawlers.
 * General model-training and dataset crawlers are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "PerplexityBot"],
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot"],
        disallow: "/",
      },
    ],
    sitemap: [`${SITE_CONFIG.url}/sitemap.xml`, `${SITE_CONFIG.url}/rss.xml`],
    host: SITE_CONFIG.url,
  };
}
