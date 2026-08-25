import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { CONTACT_EMAIL } from "@/lib/seo/contact";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildContactPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = publicPageMetadata({
  title: "اتصل بنا",
  description: `تواصل مع ConvAudit عبر البريد الرسمي ${CONTACT_EMAIL} للاستفسارات العامة والفوترة وطلبات الاسترداد.`,
  path: ROUTES.contact,
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={buildContactPageJsonLd()} />
      {children}
    </>
  );
}
