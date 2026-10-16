import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { getAllPosts, formatDate } from "@/lib/blog";
import { buildStaticPageMetadata } from "@/lib/seo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = buildStaticPageMetadata({
  title: "Search",
  description:
    "Search Convaudit tools and guides — images, PDFs, YouTube creator tools.",
  path: "/search",
  keywords: ["search convaudit", "find online tool"],
});

type Props = { searchParams: Promise<{ q?: string }> };

// The 404 page + layout SearchAction JSON-LD link to /search?q=…,
// but no route existed — every search 404'd. This page filters the
// static TOOLS array and blog posts (no server index needed).
export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const needle = query.toLowerCase();

  const matchedTools = needle
    ? TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(needle) ||
          t.description.toLowerCase().includes(needle) ||
          t.slug.includes(needle.replace(/\s+/g, "-")) ||
          t.keywords.some((k) => k.toLowerCase().includes(needle)),
      )
    : [];

  const matchedPosts = needle
    ? getAllPosts().filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle) ||
          p.tags.some((t) => t.toLowerCase().includes(needle)),
      )
    : [];

  const total = matchedTools.length + matchedPosts.length;

  return (
    <main className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Search</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Search across all {TOOLS.length} tools and blog guides.
      </p>
      <form action="/search" method="get" className="mt-8 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" name="q" defaultValue={query}
            placeholder="Try 'compress pdf' or 'thumbnail'…"
            className="pl-9" aria-label="Search Convaudit" />
        </div>
        <Button type="submit">Search</Button>
      </form>
      {query && (
        <p className="mt-6 text-sm text-muted-foreground">
          {total === 0 ? (
            <>No results for <strong className="text-foreground">“{query}”</strong>.</>
          ) : (
            <>{total} result{total === 1 ? "" : "s"} for{" "}
              <strong className="text-foreground">“{query}”</strong></>
          )}
        </p>
      )}
      {matchedTools.length > 0 && (
        <section className="mt-8" aria-label="Matching tools">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tools</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {matchedTools.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}
                className="group flex flex-col gap-1.5 rounded-xl border border-border/70 bg-card p-4 hover:shadow-sm">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{tool.category}</span>
                <h3 className="text-sm font-semibold tracking-tight">{tool.name}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{tool.description}</p>
                <span className="mt-1 inline-flex items-center text-xs font-medium">Open tool
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5" aria-hidden /></span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {matchedPosts.length > 0 && (
        <section className="mt-10" aria-label="Matching guides">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Guides</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {matchedPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="group flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-4 hover:shadow-sm">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">{tag}</Badge>
                  ))}
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{post.title}</h3>
                <p className="text-xs text-muted-foreground/70">{formatDate(post.date)} · {post.readingTime} min read</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
