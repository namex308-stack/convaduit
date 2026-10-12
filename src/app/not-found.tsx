import Link from "next/link";
import type { Metadata } from "next";
import { Search, ArrowRight, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Page not found (404)",
  description:
    "The page you're looking for doesn't exist. Browse our free online tools or search Convaduit.",
  robots: { index: false, follow: true },
};

/**
 * 404 Not Found page.
 *
 * - Search input (submits to /search?q= — reserved for future search page)
 * - Popular tools grid (the first 6 tools by slug)
 * - Link back home
 */
export default function NotFound() {
  // Show a curated selection of popular tools
  const popularTools = TOOLS.slice(0, 6);

  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center px-5 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-7xl font-bold tracking-tight text-muted-foreground/30 sm:text-9xl">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try searching, or browse our popular tools below.
      </p>

      {/* Search (submits to /search — reserved path) */}
      <form
        action="/search"
        method="get"
        className="mt-8 flex w-full max-w-md items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            placeholder="Search Convaduit..."
            className="pl-9"
            aria-label="Search Convaduit"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Button asChild variant="outline" className="mt-4">
        <Link href="/">
          <HomeIcon className="mr-1.5 h-4 w-4" />
          Back to home
        </Link>
      </Button>

      {/* Popular tools */}
      <section className="mt-16 w-full">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Popular tools
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex flex-col gap-1.5 rounded-xl border border-border/70 bg-card p-4 text-left transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: tool.accent }}
                      aria-hidden
                    />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {tool.category}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold tracking-tight">
                    {tool.name}
                  </h3>
                </div>
                <ArrowRight
                  className="h-3.5 w-3.5 flex-none text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
                  aria-hidden
                />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
