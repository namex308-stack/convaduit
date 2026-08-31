"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/layout/social-links";
import { ROUTES } from "@/lib/routes";
import { useT, type TranslationKey } from "@/lib/i18n";

/**
 * Public footer link inventory — real `href`s only (no JS-only destinations).
 * Every sitemap static marketing page should appear here as a crawlable href.
 */
export const FOOTER_LINK_COLS: readonly {
  titleKey: TranslationKey;
  links: readonly { labelKey: TranslationKey; href: string }[];
}[] = [
  {
    titleKey: "footer.col.product",
    links: [
      { labelKey: "footer.link.features", href: "/#features" },
      { labelKey: "footer.link.howItWorks", href: "/#how" },
      { labelKey: "footer.pricing", href: ROUTES.pricing },
      { labelKey: "footer.docs", href: ROUTES.docs },
      { labelKey: "footer.link.geoVisibility", href: "/#methodology" },
      { labelKey: "footer.link.platforms", href: "/#platforms" },
      { labelKey: "footer.link.shopify", href: ROUTES.shopify },
      { labelKey: "footer.link.aiGenerator", href: `${ROUTES.docs}#2` },
    ],
  },
  {
    titleKey: "footer.col.company",
    links: [
      { labelKey: "footer.link.about", href: ROUTES.about },
      { labelKey: "footer.link.contact", href: ROUTES.contact },
      { labelKey: "footer.link.faqs", href: "/#faq" },
    ],
  },
  {
    titleKey: "footer.col.resources",
    links: [
      { labelKey: "footer.blog", href: ROUTES.blog },
      { labelKey: "footer.link.geoGuide", href: ROUTES.blogPost("geo-ai-visibility-guide") },
      { labelKey: "footer.link.seoForAiGuide", href: ROUTES.blogPost("seo-for-ai-complete-guide") },
      { labelKey: "footer.link.seoIssuesGuide", href: ROUTES.blogPost("identify-seo-issues-store-growth") },
      { labelKey: "footer.link.conversionGuide", href: ROUTES.blogPost("conversion-rate-optimization") },
      { labelKey: "footer.link.competitorGuide", href: ROUTES.blogPost("competitor-analysis-strategy") },
      { labelKey: "footer.link.trustGuide", href: ROUTES.blogPost("trust-signals-ecommerce") },
      { labelKey: "footer.link.schemaGuide", href: ROUTES.blogPost("product-schema-markup") },
      { labelKey: "footer.link.aiCopyGuide", href: ROUTES.blogPost("ai-product-descriptions") },
      { labelKey: "footer.link.roadmap", href: ROUTES.roadmap },
    ],
  },
  {
    titleKey: "footer.col.trust",
    links: [
      { labelKey: "footer.link.security", href: ROUTES.security },
      { labelKey: "footer.link.privacy", href: ROUTES.privacy },
      { labelKey: "footer.link.terms", href: ROUTES.terms },
      { labelKey: "footer.link.refundPolicy", href: ROUTES.refundPolicy },
    ],
  },
];

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-auto border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href={ROUTES.home} className="inline-flex rounded-md focus-visible:ring-2 focus-visible:ring-ring">
              <Logo />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              {t("footer.tagline")}
            </p>
            <SocialLinks className="mt-5" />
          </div>

          {FOOTER_LINK_COLS.map((col) => (
            <div key={col.titleKey}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70">
                {t(col.titleKey)}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={`${link.labelKey}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
