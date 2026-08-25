import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

const TITLE = "الشروط والأحكام";
const DESCRIPTION =
  "شروط استخدام ConvAudit كمنصة برمجيات كخدمة لتحليل صفحات منتجات المتاجر الإلكترونية.";

export const metadata: Metadata = publicPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.terms,
});

export default function TermsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: TITLE,
          path: ROUTES.terms,
          description: DESCRIPTION,
        })}
      />
      {children}
    </>
  );
}
