import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import {
  PRODUCT_LOOKUP_META_DESCRIPTION,
  PRODUCT_LOOKUP_PAGE_TITLE,
} from "@/app/product-lookup/copy";
import { getServerLocaleId } from "@/lib/locale/server";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  return publicPageMetadata({
    title: PRODUCT_LOOKUP_PAGE_TITLE,
    description: PRODUCT_LOOKUP_META_DESCRIPTION,
    path: ROUTES.productLookup,
    locale,
  });
}

export default async function ProductLookupLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: PRODUCT_LOOKUP_PAGE_TITLE,
          path: ROUTES.productLookup,
          description: PRODUCT_LOOKUP_META_DESCRIPTION,
          locale,
        })}
      />
      {children}
    </>
  );
}
