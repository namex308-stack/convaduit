import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { getServerLocaleId } from "@/lib/locale/server";
import { REFUND_COPY } from "@/lib/marketing/static-copy";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  return publicPageMetadata({
    title: REFUND_COPY.pageTitle,
    description: REFUND_COPY.metaDescription,
    path: ROUTES.refundPolicy,
    locale,
  });
}

export default async function RefundPolicyLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: REFUND_COPY.pageTitle,
          path: ROUTES.refundPolicy,
          description: REFUND_COPY.metaDescription,
          locale,
        })}
      />
      {children}
    </>
  );
}
