import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { getServerLocaleId } from "@/lib/locale/server";
import { PRIVACY_COPY } from "@/lib/marketing/static-copy";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  return publicPageMetadata({
    title: PRIVACY_COPY.pageTitle,
    description: PRIVACY_COPY.metaDescription,
    path: ROUTES.privacy,
    locale,
  });
}

export default async function PrivacyLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: PRIVACY_COPY.pageTitle,
          path: ROUTES.privacy,
          description: PRIVACY_COPY.metaDescription,
          locale,
        })}
      />
      {children}
    </>
  );
}
