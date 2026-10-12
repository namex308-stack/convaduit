import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  ServerOff,
  ArrowRight,
  Sparkles,
  ImageIcon,
  FileText,
  RefreshCw,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TOOLS } from "@/lib/tools";
import { AdSlot } from "@/components/ads/AdSlot";
import { getRecentPosts, formatDate } from "@/lib/blog";

/**
 * Convaduit landing page.
 *
 * Design language: Linear / Vercel / Raycast.
 *  - Generous vertical spacing
 *  - Subtle grid background on the hero
 *  - Soft cards with low-opacity borders
 *  - Single accent color (violet) used sparingly
 */
export default function HomePage() {
  const categories = Array.from(new Set(TOOLS.map((t) => t.category)));
  const recentPosts = getRecentPosts(3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        {/* Subtle grid backdrop */}
        <div
          aria-hidden
          className="bg-grid mask-fade-b absolute inset-0 -z-10 opacity-50"
        />
        {/* Soft radial glow at the top */}
        <div
          aria-hidden
          className="absolute left-1/2 top-0 -z-10 h-[480px] w-[680px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.72 0.18 280), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              100% client-side — your files never leave your browser
              <ArrowRight className="h-3 w-3" />
            </Link>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
              File tools that respect your{" "}
              <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                privacy
              </span>
              .
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Compress images, convert HEIC, merge and split PDFs, and more —
              all in your browser. No uploads. No sign-up. No watermarks.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 px-6 text-sm">
                <Link href="#tools">
                  Browse all tools
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 px-6 text-sm"
              >
                <Link href="/about">How it works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Top ad — constrained and unobtrusive */}
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <AdSlot slot="5555555555" className="my-2" />
      </div>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Feature
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Private by design"
            description="Files are processed locally with WebAssembly. Nothing is uploaded, ever."
          />
          <Feature
            icon={<Zap className="h-4 w-4" />}
            title="Fast and free"
            description="No sign-up, no watermarks, no limits. Open a tool and start working."
          />
          <Feature
            icon={<ServerOff className="h-4 w-4" />}
            title="No backend"
            description="Convaduit has no file server. There's nothing to hack, nothing to leak."
          />
        </div>
      </section>

      {/* Tools */}
      <section
        id="tools"
        className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-10 max-w-2xl">
          <Badge variant="outline" className="mb-3 text-xs font-medium">
            {TOOLS.length} tools
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Every tool you need, none of the friction
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built with proven open-source libraries like{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">pdf-lib</code>,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">pdfjs</code>,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">heic2any</code>{" "}
            and the Canvas API.
          </p>
        </div>

        {categories.map((cat) => {
          const tools = TOOLS.filter((t) => t.category === cat);
          return (
            <div key={cat} className="mb-12">
              <div className="mb-4 flex items-baseline gap-2">
                <div className="flex items-center gap-2">
                  {cat === "Image" && <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                  {cat === "PDF" && <FileText className="h-4 w-4 text-muted-foreground" />}
                  {cat === "Conversion" && <RefreshCw className="h-4 w-4 text-muted-foreground" />}
                  {cat === "YouTube" && <Youtube className="h-4 w-4 text-red-600" />}
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground/70">
                  {tools.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="group relative flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-5 transition-all hover:border-border hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium tracking-tight">{t.name}</h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                      <ArrowRight
                        className="h-4 w-4 flex-none text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
                        aria-hidden
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom ad */}
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <AdSlot slot="6666666666" className="my-2" />
      </div>

      {/* From the blog */}
      {recentPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-3 text-xs font-medium">
                From the blog
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Guides &amp; best practices
              </h2>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              <Link href="/blog">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden>·</span>
                  <span>{post.readingTime} min read</span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {post.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {post.description}
                </p>
                <span className="mt-auto inline-flex items-center pt-3 text-sm font-medium text-foreground">
                  Read article
                  <ArrowRight
                    className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6 sm:hidden">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/blog">
                View all articles
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-8 sm:p-12">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, oklch(0.72 0.18 280), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for people who care about privacy
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Every tool on Convaduit runs entirely in your browser. We
              don&apos;t have a server that stores your files — because we
              never receive them in the first place.
            </p>
            <Button asChild className="mt-6">
              <Link href="/about">Read about how it works</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-border">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
