import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_CONFIG } from "@/lib/tools";
import { buildStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "About Convaudit and Its Browser-Based File Tools",
  description:
    "Learn about Convaudit — free, private, browser-based tools for images, PDFs, and YouTube creators. No uploads, no sign-up, no backend.",
  path: "/about",
  keywords: [
    "about convaudit",
    "free online tools",
    "private image tools",
    "browser based pdf tools",
    "youtube creator tools",
    "no upload tools",
  ],
});

/**
 * Static About page. Explains the project's mission and how the tools
 * work under the hood.
 */
export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        About {SITE_CONFIG.name}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {SITE_CONFIG.name} is a free collection of online tools for working
        with images and PDFs. We believe online tools should be fast, private,
        and respectful of your data — so we built {SITE_CONFIG.name} to run
        entirely in your browser.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Our mission</h2>
        <p className="leading-relaxed text-muted-foreground">
          Most &quot;free&quot; online tools require you to upload your files
          to a server you don&apos;t control. That&apos;s a privacy risk,
          especially for sensitive documents like contracts, medical records,
          or personal photos. We wanted to prove that you can build powerful
          online tools without ever touching a user&apos;s file.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          Every tool on {SITE_CONFIG.name} runs locally in your browser using
          modern web standards like WebAssembly, the Canvas API, and the File
          System Access API. Your files are processed on your device and never
          sent over the network. The only network requests we make are for the
          page itself and for ads that help us keep the site free.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
        <p className="leading-relaxed text-muted-foreground">
          Each tool is built with industry-standard open-source libraries:
        </p>
        <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">browser-image-compression</strong>{" "}
            for image compression
          </li>
          <li>
            <strong className="text-foreground">heic2any</strong> (which wraps
            libheif) for HEIC to JPG conversion
          </li>
          <li>
            <strong className="text-foreground">pdf-lib</strong> for PDF
            merging, splitting, and creation
          </li>
          <li>
            <strong className="text-foreground">pdfjs-dist</strong>{" "}
            (Mozilla&apos;s PDF.js) for reading PDFs
          </li>
          <li>
            <strong className="text-foreground">file-saver</strong> for
            triggering browser downloads
          </li>
        </ul>
        <p className="leading-relaxed text-muted-foreground">
          These libraries run as JavaScript (or WebAssembly) directly in your
          browser tab. When you drag a file into one of our tools, your
          browser reads it from disk, processes it, and offers the result back
          to you as a download — all without a single network request
          containing your file.
        </p>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Private</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Files never leave your browser. We have no server that receives
            them.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Free</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No sign-up, no watermarks, no limits. Supported by unobtrusive
            ads.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Open standards</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Built on proven open-source libraries like pdf-lib and PDF.js.
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
        <p className="leading-relaxed text-muted-foreground">
          Found a bug or have a tool request? Email us at{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            support@convaudit.com
          </code>
          . We&apos;d love to hear from you.
        </p>
      </section>
    </article>
  );
}
