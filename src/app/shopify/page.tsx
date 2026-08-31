"use client";

import Link from "next/link";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { Button } from "@/components/ui/button";
import {
  SHOPIFY_PAGE_SUBTITLE,
  SHOPIFY_PAGE_TITLE,
} from "@/app/shopify/copy";
import {
  SHOPIFY_AFFILIATE_DISCLOSURE,
  SHOPIFY_AFFILIATE_URL,
} from "@/lib/affiliates/shopify";
import { useT } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";

export default function ShopifyPage() {
  const t = useT();

  return (
    <PageShell>
      <PageHeader title={SHOPIFY_PAGE_TITLE} subtitle={SHOPIFY_PAGE_SUBTITLE} icon={ShoppingBag} />
      <PageContent className="max-w-3xl space-y-8">
        <SurfaceCard className="p-6 sm:p-8 space-y-4">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty">
            {t("shopify.intro")}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty">
            {t("shopify.auditNote")}
          </p>
          <ul className="list-disc space-y-2 ps-5 text-sm text-foreground/85">
            <li>{t("shopify.point1")}</li>
            <li>{t("shopify.point2")}</li>
            <li>{t("shopify.point3")}</li>
          </ul>
        </SurfaceCard>

        <SurfaceCard className="p-6 sm:p-8 text-center space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
            {t("shopify.ctaHeading")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("shopify.ctaBody")}
          </p>
          <Button asChild size="lg" className="rounded-full font-semibold shadow-glow px-8">
            <a
              href={SHOPIFY_AFFILIATE_URL}
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              Start your Shopify store
              <ExternalLink className="size-4" aria-hidden />
            </a>
          </Button>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto" dir="ltr">
            {SHOPIFY_AFFILIATE_DISCLOSURE}
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold">{t("shopify.nextTitle")}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t("shopify.nextBody")}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href={ROUTES.auditNew} className="text-sm font-medium text-primary hover:underline">
              {t("shopify.link.audit")}
            </Link>
            <Link
              href={ROUTES.blogPost("product-schema-markup")}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("shopify.link.schema")}
            </Link>
            <Link href={ROUTES.blog} className="text-sm font-medium text-primary hover:underline">
              {t("shopify.link.blog")}
            </Link>
            <Link href="/#platforms" className="text-sm font-medium text-primary hover:underline">
              {t("shopify.link.platforms")}
            </Link>
          </div>
        </SurfaceCard>
      </PageContent>
    </PageShell>
  );
}
