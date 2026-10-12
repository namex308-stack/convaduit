import Link from "next/link";
import {
  ImageIcon,
  FileText,
  RefreshCw,
  ShieldCheck,
  Zap,
  Server,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TOOLS } from "@/lib/tools";
import { AdSlot } from "@/components/ads/AdSlot";

/**
 * Site landing page.
 *
 * Hero section, feature highlights, the tools grid, and a closing CTA.
 * The tools grid is the primary navigation surface — every tool is one
 * click away.
 */
export default function HomePage() {
  const categories = Array.from(new Set(TOOLS.map((t) => t.category)));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/40 to-background" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              <ShieldCheck className="mr-1 h-3 w-3" />
              100% private — files never leave your browser
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Free Online Tools for{" "}
              <span className="text-primary">Images &amp; PDFs</span>
            </h1>
            <p className="mt-6 text-base text-muted-foreground sm:text-lg">
              Compress images, convert HEIC to JPG, merge and split PDFs, and
              more — all in your browser. No uploads, no sign-up, no watermarks.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#tools">
                  Browse all tools <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Learn more</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Top ad */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot slot="5555555555" />
      </div>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Private by design"
            description="All processing happens locally in your browser. Your files are never uploaded to a server."
          />
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Fast &amp; free"
            description="No sign-up, no watermarks, no limits. Open a tool and start using it instantly."
          />
          <Feature
            icon={<Server className="h-5 w-5" />}
            title="Works offline"
            description="Because everything runs in your browser, you can keep working even on a slow connection."
          />
        </div>
      </section>

      {/* Tools */}
      <section
        id="tools"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">All Tools</h2>
          <p className="mt-2 text-muted-foreground">
            {TOOLS.length} free tools across {categories.length} categories.
            Pick one to get started.
          </p>
        </div>

        {categories.map((cat) => {
          const tools = TOOLS.filter((t) => t.category === cat);
          return (
            <div key={cat} className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                {cat === "Image" && <ImageIcon className="h-5 w-5" />}
                {cat === "PDF" && <FileText className="h-5 w-5" />}
                {cat === "Conversion" && <RefreshCw className="h-5 w-5" />}
                <h3 className="text-xl font-semibold">{cat} Tools</h3>
                <span className="text-sm text-muted-foreground">
                  ({tools.length})
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ backgroundColor: t.accent }}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold">{t.name}</h4>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 flex-none text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom ad */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot slot="6666666666" />
      </div>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-muted/30 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built with privacy in mind
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Every tool on this site runs entirely in your browser using
            WebAssembly and the Canvas API. We don&apos;t have a server that
            stores your files — because we never receive them in the first place.
          </p>
          <Button asChild className="mt-6">
            <Link href="/about">Read about how it works</Link>
          </Button>
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
    <div className="rounded-xl border bg-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p
        className="mt-1 text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}
