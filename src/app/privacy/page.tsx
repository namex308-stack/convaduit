import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for ToolKit. We don't upload your files — all processing happens in your browser.",
  alternates: { canonical: "/privacy" },
};

/**
 * Static privacy policy page.
 * Placeholder content — replace with your own legal review before launch.
 */
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="prose prose-slate mt-8 max-w-none space-y-6 dark:prose-invert">
        <section>
          <h2 className="text-xl font-semibold">1. Overview</h2>
          <p className="mt-2 text-muted-foreground">
            ToolKit (&quot;we&quot;, &quot;us&quot;) operates a website at
            your-toolkit.example.com (the &quot;Site&quot;). The Site provides
            free, browser-based tools for working with images and PDFs. We are
            committed to protecting your privacy.
          </p>
          <p className="mt-2 text-muted-foreground">
            <strong>Important:</strong> We do not upload, store, or transmit
            the files you process with our tools. All file processing happens
            locally in your browser using JavaScript and WebAssembly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Files you process</h2>
          <p className="mt-2 text-muted-foreground">
            When you use any tool on the Site, the files you select are read
            directly by your browser and processed locally. The contents of
            those files are never sent to our servers or any third-party
            server. We have no ability to see, store, or recover your files.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Information we collect</h2>
          <p className="mt-2 text-muted-foreground">
            We do not collect personally identifiable information through the
            Site itself. We may collect anonymous analytics (page views,
            browser type, country) through a third-party analytics provider to
            understand how the Site is used.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Advertising</h2>
          <p className="mt-2 text-muted-foreground">
            We display ads through Google AdSense. AdSense may use cookies and
            similar technologies to serve ads based on your prior visits to
            this and other websites. You can opt out of personalized
            advertising by visiting Google&apos;s Ads Settings page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Cookies</h2>
          <p className="mt-2 text-muted-foreground">
            The Site uses a minimal set of cookies for theme preference
            (light/dark mode) and for ad personalization via AdSense. We do
            not use cookies for tracking across other sites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Children&apos;s privacy</h2>
          <p className="mt-2 text-muted-foreground">
            The Site is not directed to children under 13, and we do not
            knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Changes to this policy</h2>
          <p className="mt-2 text-muted-foreground">
            We may update this Privacy Policy from time to time. Changes will
            be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Contact</h2>
          <p className="mt-2 text-muted-foreground">
            If you have questions about this Privacy Policy, contact us at
            privacy@your-toolkit.example.com.
          </p>
        </section>
      </div>
    </article>
  );
}
