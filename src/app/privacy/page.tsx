import type { Metadata } from "next";
import { buildStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "Convaudit Privacy Policy for Online File Tools",
  description:
    "Convaudit privacy policy — all file processing happens in your browser. We never upload, store, or transmit your files. Learn what data we collect.",
  path: "/privacy",
  keywords: [
    "convaudit privacy policy",
    "private online tools",
    "browser based tools privacy",
    "no upload tools",
    "client side processing",
    "adsense privacy",
  ],
});

/**
 * Static privacy policy page.
 * Placeholder content — replace with your own legal review before launch.
 */
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-lg font-semibold tracking-tight">1. Overview</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Convaudit (&quot;we&quot;, &quot;us&quot;) operates a website at
            convaudit.com (the &quot;Site&quot;). The Site provides free,
            browser-based tools for working with images and PDFs. We are
            committed to protecting your privacy.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Important:</strong> We do not
            upload, store, or transmit the files you process with our tools.
            All file processing happens locally in your browser using
            JavaScript and WebAssembly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            2. Files you process
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            When you use any tool on the Site, the files you select are read
            directly by your browser and processed locally. The contents of
            those files are never sent to our servers or any third-party
            server. We have no ability to see, store, or recover your files.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            3. Information we collect
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We do not collect personally identifiable information through the
            Site itself. We may collect anonymous analytics (page views,
            browser type, country) through a third-party analytics provider
            to understand how the Site is used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            4. Advertising
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We display ads through Google AdSense. AdSense may use cookies
            and similar technologies to serve ads based on your prior visits
            to this and other websites. You can opt out of personalized
            advertising by visiting Google&apos;s Ads Settings page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">5. Cookies</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The Site uses a minimal set of cookies for theme preference
            (light/dark mode) and for ad personalization via AdSense. We do
            not use cookies for tracking across other sites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            6. Children&apos;s privacy
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The Site is not directed to children under 13, and we do not
            knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            7. Changes to this policy
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We may update this Privacy Policy from time to time. Changes will
            be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">8. Contact</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            If you have questions about this Privacy Policy, contact us at{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              privacy@convaudit.com
            </code>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
