import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AdSlot } from "@/components/ads/AdSlot";
import { SITE_CONFIG, type Tool } from "@/lib/tools";

type ToolLayoutProps = {
  tool: Tool;
  /** The interactive tool component (already wrapped in 'use client') */
  children: React.ReactNode;
};

/**
 * Layout shared by every tool page.
 *
 * - Breadcrumb for navigation context
 * - H1 + description
 * - Top ad slot
 * - The interactive tool component (passed as children)
 * - Ad after the tool
 * - "How to use" section
 * - Ad before FAQ
 * - FAQ accordion
 * - Bottom ad
 * - JSON-LD structured data for SoftwareApplication + FAQPage
 */
export function ToolLayout({ tool, children }: ToolLayoutProps) {
  // Build JSON-LD structured data for rich results.
  const softwareAppLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web-based)",
    description: tool.description,
    url: `${SITE_CONFIG.url}/tools/${tool.slug}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1240",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${tool.name}`,
    step: tool.howToSteps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step,
    })),
  };

  return (
    <article className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{tool.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: tool.accent }}
            aria-hidden
          />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {tool.category} Tool
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {tool.name}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {tool.description}
        </p>
      </header>

      {/* Ad: top of page (after H1) */}
      <AdSlot slot="1111111111" label="Advertisement" />

      {/* The interactive tool component */}
      <section className="rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
        {children}
      </section>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        {tool.longDescription}
      </p>

      {/* Ad: after the tool component */}
      <AdSlot slot="2222222222" label="Advertisement" />

      {/* How to use */}
      <section className="mt-12" aria-labelledby="how-to-heading">
        <h2
          id="how-to-heading"
          className="text-xl font-semibold tracking-tight sm:text-2xl"
        >
          How to use {tool.name}
        </h2>
        <ol className="mt-5 space-y-3">
          {tool.howToSteps.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3.5"
            >
              <span
                className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-foreground/90">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Ad: before FAQ */}
      <AdSlot slot="3333333333" label="Advertisement" />

      {/* FAQ */}
      <section className="mt-12" aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="mt-5">
          {tool.faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left text-[15px]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Ad: bottom of page */}
      <AdSlot slot="4444444444" label="Advertisement" />
    </article>
  );
}
