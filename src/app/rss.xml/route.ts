import { SITE_CONFIG } from "@/lib/tools";
import { getAllPosts } from "@/lib/blog";

/**
 * RSS 2.0 feed available at /rss.xml.
 *
 * Returns RSS 2.0 XML with all blog posts. The feed helps readers subscribe
 * via RSS readers and provides another entry point for search engines.
 */
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();
  const pubDate = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${SITE_CONFIG.url}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>Convaudit Team</author>
      ${post.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_CONFIG.name)} Blog</title>
    <link>${SITE_CONFIG.url}/blog</link>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${SITE_CONFIG.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
