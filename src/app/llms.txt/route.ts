import { NextResponse } from "next/server";
import { SITE_CONFIG, TOOLS } from "@/lib/tools";

const toolSummary = TOOLS.map(
  (tool) => `- ${tool.name}: ${tool.description}`,
).join("\n");

export async function GET() {
  const body = `# Convaudit

> Convaudit provides free, private, browser-based tools for image optimization, PDF handling, file conversion, and YouTube creator workflows. All processing happens locally in the user's browser; files are never uploaded to a server.

## Overview
- Website: ${SITE_CONFIG.url}
- About: ${SITE_CONFIG.url}/about
- Blog: ${SITE_CONFIG.url}/blog
- Privacy: ${SITE_CONFIG.url}/privacy
- Terms: ${SITE_CONFIG.url}/terms
- Search: ${SITE_CONFIG.url}/search
- Sitemap: ${SITE_CONFIG.url}/sitemap.xml
- RSS: ${SITE_CONFIG.url}/rss.xml

## Main tool categories
- Image optimization and compression
- PDF merging, splitting, conversion, and page extraction
- HEIC, JPG, PNG, WebP, and document conversion
- YouTube creator utilities and productivity helpers

## Core tools
${toolSummary}

## Content and discovery
Convaudit is designed to help users complete file and media tasks quickly in the browser without sign-up or account creation. The site publishes helpful guides and tool-specific explanations to improve discoverability for both search engines and AI assistants.
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
