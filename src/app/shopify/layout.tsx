import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import {
  SHOPIFY_META_DESCRIPTION,
  SHOPIFY_PAGE_TITLE,
} from "@/app/shopify/copy";
import { getServerLocaleId } from "@/lib/locale/server";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  return publicPageMetadata({
    title: SHOPIFY_PAGE_TITLE,
    description: SHOPIFY_META_DESCRIPTION,
    path: ROUTES.shopify,
    locale,
  });
}

export default async function ShopifyLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: SHOPIFY_PAGE_TITLE,
          path: ROUTES.shopify,
          description: SHOPIFY_META_DESCRIPTION,
          locale,
        })}
      />
      {children}
    </>
  );
}
