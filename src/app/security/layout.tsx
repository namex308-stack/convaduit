import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { getServerLocaleId } from "@/lib/locale/server";
import { SECURITY_COPY } from "@/lib/marketing/static-copy";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  return publicPageMetadata({
    title: SECURITY_COPY.pageTitle,
    description: SECURITY_COPY.metaDescription,
    path: ROUTES.security,
    locale,
  });
}

export default async function SecurityLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: SECURITY_COPY.pageTitle,
          path: ROUTES.security,
          description: SECURITY_COPY.metaDescription,
          locale,
        })}
      />
      {children}
    </>
  );
}
