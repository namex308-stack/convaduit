import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAllPosts, formatDate, type BlogPostMeta } from "@/lib/blog";
import { SITE_CONFIG } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Image, PDF & YouTube Guides for Everyday Tasks",
  description:
    "Practical guides to image formats, photo metadata, PDF workflows, and YouTube thumbnail requirements.",
  keywords: [
    "image compression guide",
    "heic vs jpg",
    "pdf compression tips",
    "webp optimization",
    "youtube creator tools blog",
    "merge pdf without uploading",
    "reduce pdf file size",
    "image formats comparison",
  ],
  alternates: {
    canonical: "/blog",
    languages: {
      en: `${SITE_CONFIG.url}/blog`,
      ar: `${SITE_CONFIG.url}/blog`,
    },
  },
  openGraph: {
    title: "Convaudit Blog — Guides for Images, PDFs & YouTube",
    description:
      "Practical guides to image formats, photo metadata, PDF workflows, and YouTube thumbnail requirements.",
    url: `${SITE_CONFIG.url}/blog`,
    type: "website",
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Convaudit Blog — Guides for Images, PDFs & YouTube",
    description:
      "Practical guides to image formats, photo metadata, PDF workflows, and YouTube thumbnail requirements.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Blog index page.
 *
 * Lists all posts sorted by date (newest first). Each card shows the title,
 * description, date, reading time, and tags. The first post gets a featured
 * layout; the rest follow in a responsive grid.
 */
export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      {/* BreadcrumbList JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_CONFIG.url },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_CONFIG.url}/blog` },
            ],
          }),
        }}
      />

      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Blog</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-12 max-w-2xl">
        <Badge variant="outline" className="mb-3 text-xs font-medium">
          {posts.length} article{posts.length === 1 ? "" : "s"}
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          The Convaudit Blog
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Guides, comparisons, and best practices for working with images and
          PDFs. Everything we publish is informed by the same principle that
          drives our tools: your files should stay private.
        </p>
      </header>

      {posts.length === 0 && (
        <p className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          No articles published yet. Check back soon.
        </p>
      )}

      {/* Featured post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group mb-12 block overflow-hidden rounded-2xl border border-border/70 bg-card p-7 transition-all hover:border-border hover:shadow-sm sm:p-9"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium uppercase tracking-wider">
                Featured
              </span>
              <span aria-hidden>·</span>
              <time dateTime={featured.date}>{formatDate(featured.date)}</time>
              <span aria-hidden>·</span>
              <span>{featured.readingTime} min read</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-1 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {featured.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {featured.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
            <span className="mt-5 inline-flex items-center text-sm font-medium text-foreground">
              Read article
              <ArrowRight
                className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </div>
        </Link>
      )}

      {/* Remaining posts grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}

function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTime} min read</span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{post.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {post.description}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        {post.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs font-normal">
            {tag}
          </Badge>
        ))}
      </div>
    </Link>
  );
}
