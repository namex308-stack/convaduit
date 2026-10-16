import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Blog post types and helpers.
 *
 * Posts are stored as markdown files in /content/blog with YAML frontmatter.
 * At build time we read the filesystem, parse frontmatter, and expose
 * structured data to the App Router pages.
 */

export type BlogPostMeta = {
  /** URL slug, derived from the filename (e.g. "heic-vs-jpg") */
  slug: string;
  /** Post title (from frontmatter) */
  title: string;
  /** Short SEO description (from frontmatter) */
  description: string;
  /** Publication date (ISO string, from frontmatter) */
  date: string;
  /** Optional last-modified date (ISO string, from frontmatter) */
  modifiedDate?: string;
  /** Author name (from frontmatter) */
  author: string;
  /** Tags for categorization (from frontmatter) */
  tags: string[];
  /** Optional cover image URL (from frontmatter) */
  coverImage?: string;
  /** Estimated reading time in minutes (computed) */
  readingTime: number;
  /** Optional slug of the primary tool associated with this article */
  toolSlug?: string;
};

export type BlogPost = BlogPostMeta & {
  /** Raw markdown body (without frontmatter) */
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

/**
 * Estimate reading time from markdown content.
 * Average adult reading speed is ~200-250 words per minute.
 */
function estimateReadingTime(markdown: string): number {
  const words = markdown
    .replace(/[#*`>\-\[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Convert a filename like "heic-vs-jpg.md" into the slug "heic-vs-jpg".
 */
function filenameToSlug(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

/**
 * List all blog post metadata, sorted by date (newest first).
 * Used by the blog index page and the home page's "From the blog" section.
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse(); // newest first assuming ISO-date-prefixed filenames

  const posts: BlogPostMeta[] = files.map((filename) => {
    const fullPath = path.join(POSTS_DIR, filename);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);
    return {
      slug: filenameToSlug(filename),
      title: String(data.title ?? filename),
      description: String(data.description ?? ""),
      date: String(data.date ?? new Date().toISOString().split("T")[0]),
      modifiedDate: data.modifiedDate ? String(data.modifiedDate) : undefined,
      author: String(data.author ?? "Convaudit Team"),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      coverImage: data.coverImage ? String(data.coverImage) : undefined,
      readingTime: estimateReadingTime(content),
      toolSlug: data.toolSlug ? String(data.toolSlug) : undefined,
    };
  });

  // Sort by date descending (newest first)
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * Fetch a single blog post by slug, including its markdown content.
 * Returns undefined if the post doesn't exist.
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return undefined;

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? new Date().toISOString().split("T")[0]),
    modifiedDate: data.modifiedDate ? String(data.modifiedDate) : undefined,
    author: String(data.author ?? "Convaudit Team"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    readingTime: estimateReadingTime(content),
    toolSlug: data.toolSlug ? String(data.toolSlug) : undefined,
    content,
  };
}

/**
 * Return the n most recent posts (by date). Used on the home page.
 */
export function getRecentPosts(n: number): BlogPostMeta[] {
  return getAllPosts().slice(0, n);
}

/**
 * Return all unique tags across all posts, sorted alphabetically.
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tagSet.add(tag);
  }
  return Array.from(tagSet).sort();
}

/**
 * Format an ISO date string as a human-readable date (e.g. "September 12, 2025").
 */
export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
