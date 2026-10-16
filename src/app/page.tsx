import type { Metadata } from "next";
import { ToolsOrganizer } from "@/components/tools/ToolsOrganizer";
import { buildStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "Free browser-based image, PDF and YouTube tools",
  description:
    "Convert files, compress images, merge PDFs, and use creator tools in your browser — no uploads, no sign-up, no watermarks.",
  path: "/",
  keywords: [
    "convaudit home",
    "free online image tools",
    "image compressor",
    "pdf tools online",
    "heic to jpg converter",
    "youtube creator tools",
    "browser file converter",
  ],
});

export default function HomePage() {
  return (
    <main id="tools" className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
      <section className="mb-10 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
            Private by default
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Free tools for creators, designers, and everyday work.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Compress images, convert HEIC files, merge or split PDFs, and use YouTube productivity tools directly in your browser.
            Nothing is uploaded. Nothing is stored on a server.
          </p>
        </div>
      </section>

      <ToolsOrganizer />
    </main>
  );
}
