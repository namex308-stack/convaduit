import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { CONTACT_EMAIL, CONTACT_WHATSAPP_DISPLAY } from "@/lib/seo/contact";
import { getServerLocaleId } from "@/lib/locale/server";
import { CONTACT_COPY } from "@/lib/marketing/static-copy";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  const description = `تواصل مع ConvAudit عبر البريد الرسمي ${CONTACT_EMAIL} أو واتساب ${CONTACT_WHATSAPP_DISPLAY} للاستفسارات العامة والفوترة وطلبات الاسترداد.`;
  return publicPageMetadata({
    title: CONTACT_COPY.pageTitle,
    description,
    path: ROUTES.contact,
    locale,
  });
}

export default async function ContactLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: CONTACT_COPY.pageTitle,
          path: ROUTES.contact,
          description: CONTACT_COPY.metaDescription,
          locale,
        })}
      />
      {children}
    </>
  );
}
