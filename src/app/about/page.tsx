import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about ToolKit — a free, private, browser-based collection of online tools for images and PDFs.",
  alternates: { canonical: "/about" },
};

/**
 * Static About page. Simple marketing copy that explains the project's
 * mission and how the tools work under the hood.
 */
export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        About ToolKit
      </h1>
      <p className="mt-4 text-muted-foreground">
        ToolKit is a free collection of online tools for working with images
        and PDFs. We believe online tools should be fast, private, and
        respectful of your data — so we built ToolKit to run entirely in your
        browser.
      </p>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Our mission</h2>
        <p>
          Most &quot;free&quot; online tools require you to upload your files to
          a server you don&apos;t control. That&apos;s a privacy risk, especially
          for sensitive documents like contracts, medical records, or personal
          photos. We wanted to prove that you can build powerful online tools
          without ever touching a user&apos;s file.
        </p>
        <p>
          Every tool on ToolKit runs locally in your browser using modern web
          standards like WebAssembly, the Canvas API, and the File System Access
          API. Your files are processed on your device and never sent over the
          network. The only network requests we make are for the page itself and
          for analytics or ads that help us keep the site free.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <p>
          Each tool is built with industry-standard open-source libraries:
        </p>
        <ul className="ml-6 list-disc space-y-2">
          <li>
            <strong>browser-image-compression</strong> for image compression
          </li>
          <li>
            <strong>heic2any</strong> (which wraps libheif) for HEIC to JPG
            conversion
          </li>
          <li>
            <strong>pdf-lib</strong> for PDF merging, splitting, and creation
          </li>
          <li>
            <strong>pdfjs-dist</strong> (Mozilla&apos;s PDF.js) for reading PDFs
          </li>
          <li>
            <strong>file-saver</strong> for triggering browser downloads
          </li>
        </ul>
        <p>
          These libraries run as JavaScript (or WebAssembly) directly in your
          browser tab. When you drag a file into one of our tools, your browser
          reads it from disk, processes it, and offers the result back to you as
          a download — all without a single network request containing your
          file.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Private</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Files never leave your browser. We have no server that receives
            them.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Free</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No sign-up, no watermarks, no limits. Supported by unobtrusive ads.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open standards</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Built on proven open-source libraries like pdf-lib and PDF.js.
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
        <p>
          Found a bug or have a tool request? Open an issue on our public
          repository or email us at <code>support@your-toolkit.example.com</code>.
          We&apos;d love to hear from you.
        </p>
      </section>
    </article>
  );
}
