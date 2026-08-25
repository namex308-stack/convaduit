import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

const TITLE = "سياسة الاسترداد";
const DESCRIPTION =
  "ضمان استرداد خلال 14 يوماً لاشتراكات ConvAudit المدفوعة — بشروط واضحة على صفحة السياسة.";

export const metadata: Metadata = publicPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.refundPolicy,
});

export default function RefundPolicyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: TITLE,
          path: ROUTES.refundPolicy,
          description: DESCRIPTION,
        })}
      />
      {children}
    </>
  );
}
