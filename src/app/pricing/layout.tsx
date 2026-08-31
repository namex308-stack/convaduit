import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { getServerLocaleId } from "@/lib/locale/server";
import { translate } from "@/lib/locale/t";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  return publicPageMetadata({
    title: translate("pricing.title", undefined, locale),
    description: translate("pricing.metaDescription", undefined, locale),
    path: ROUTES.pricing,
    locale,
  });
}

export default async function PricingLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();
  const title = translate("pricing.title", undefined, locale);
  const description = translate("pricing.metaDescription", undefined, locale);

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: title,
          path: ROUTES.pricing,
          description,
          locale,
        })}
      />
      {children}
    </>
  );
}
