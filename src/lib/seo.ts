import type { Metadata } from "next";
import { SITE_CONFIG, type Tool } from "./tools";

/**
 * SEO helpers shared across all pages.
 *
 * Centralizes the title pattern, keyword expansion, and common metadata
 * fields (robots, alternates.languages, OpenGraph defaults) so every page
 * stays consistent.
 */

/** Build the per-page title following the site pattern. */
export function buildToolTitle(tool: Tool): string {
  // Pattern: "{Tool Name} — Free Online {Category} Tool"
  // The layout template appends " | Convaduit" automatically.
  return `${tool.name} — Free Online ${tool.category} Tool`;
}

/**
 * Expand a tool's base keywords into 8-12 long-tail variations.
 *
 * Google no longer uses the keywords meta tag for ranking, but other
 * search engines and directories still read it. We include a mix of:
 *  - The original explicit keywords (curated, high-intent)
 *  - Common modifier patterns (online, free, no signup, browser, etc.)
 */
export function expandKeywords(tool: Tool): string[] {
  const base = tool.keywords;
  const name = tool.name.toLowerCase();
  const slug = tool.slug;

  // Common long-tail modifiers that match search intent
  const modifiers = [
    `${name} online free`,
    `${name} no signup`,
    `${name} browser based`,
    `${name} without upload`,
    `free ${name.toLowerCase()}`,
    `${name} tool`,
  ];

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const result: string[] = [];
  for (const kw of [...base, ...modifiers]) {
    const lower = kw.toLowerCase();
    if (!seen.has(lower) && lower.length > 2) {
      seen.add(lower);
      result.push(lower);
    }
  }

  // Cap at 12 keywords
  return result.slice(0, 12);
}

/**
 * Build a full Metadata object for a tool page.
 * Includes title, description, keywords, canonical, OG, Twitter,
 * alternates.languages (en + ar), and robots.
 */
export function buildToolMetadata(tool: Tool): Metadata {
  const canonical = `${SITE_CONFIG.url}/tools/${tool.slug}`;
  const title = buildToolTitle(tool);
  const keywords = expandKeywords(tool);

  return {
    title,
    description: tool.description,
    keywords,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ar: canonical,
      },
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: tool.description,
      url: canonical,
      type: "website",
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_CONFIG.name}`,
      description: tool.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

/**
 * Build metadata for a blog post.
 */
export function buildBlogPostMetadata(post: {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}): Metadata {
  const canonical = `${SITE_CONFIG.url}/blog/${post.slug}`;
  const keywords = [...post.tags, `${post.title.toLowerCase()}`, "convaduit blog"];

  return {
    title: post.title,
    description: post.description,
    keywords,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ar: canonical,
      },
    },
    openGraph: {
      title: `${post.title} | ${SITE_CONFIG.name}`,
      description: post.description,
      url: canonical,
      type: "article",
      siteName: SITE_CONFIG.name,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${SITE_CONFIG.name}`,
      description: post.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

/**
 * Build metadata for a static page (about, privacy, terms, etc.).
 */
export function buildStaticPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const canonical = `${SITE_CONFIG.url}${options.path}`;

  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ar: canonical,
      },
    },
    openGraph: {
      title: `${options.title} | ${SITE_CONFIG.name}`,
      description: options.description,
      url: canonical,
      type: "website",
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${options.title} | ${SITE_CONFIG.name}`,
      description: options.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
