import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { getServerLocaleId } from "@/lib/locale/server";
import { TERMS_COPY } from "@/lib/marketing/static-copy";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  return publicPageMetadata({
    title: TERMS_COPY.pageTitle,
    description: TERMS_COPY.metaDescription,
    path: ROUTES.terms,
    locale,
  });
}

export default async function TermsLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: TERMS_COPY.pageTitle,
          path: ROUTES.terms,
          description: TERMS_COPY.metaDescription,
          locale,
        })}
      />
      {children}
    </>
  );
}
