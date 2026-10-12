import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Convaduit. By using the site you agree to these terms.",
  alternates: { canonical: "/terms" },
};

/**
 * Static Terms of Service page.
 * Placeholder content — replace with your own legal review before launch.
 */
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Terms of Service
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
          <h2 className="text-lg font-semibold tracking-tight">
            1. Acceptance of terms
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            By accessing or using Convaduit (the &quot;Service&quot;), you
            agree to be bound by these Terms of Service. If you do not agree,
            please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            2. Use of the Service
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The Service provides free, browser-based tools for working with
            images and PDFs. You may use the Service for any lawful purpose.
            You agree not to use the Service to process material that you do
            not have the right to process.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            3. No warranty
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The Service is provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, either express or
            implied. We do not guarantee that the Service will be
            uninterrupted, error-free, or that results will be accurate or
            reliable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            4. Limitation of liability
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            To the maximum extent permitted by law, we shall not be liable
            for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of data, arising out of your use
            of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            5. Files and data
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            All files you process with the Service remain on your device. We
            do not have access to your files and are not responsible for any
            loss or damage to your files. You are solely responsible for
            maintaining backups of your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            6. Advertising
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The Service is supported by advertising. We are not responsible
            for the content of ads served by third-party networks.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            7. Changes to the Service
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            We reserve the right to modify, suspend, or discontinue the
            Service at any time without notice. We will not be liable to you
            or any third party for any modification, suspension, or
            discontinuance of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            8. Governing law
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            These Terms shall be governed by and construed in accordance
            with applicable law, without regard to conflict of law
            principles.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">9. Contact</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Questions about these Terms? Contact us at{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              legal@convaduit.com
            </code>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
