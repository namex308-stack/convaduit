import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

const TITLE = "من نحن";
const DESCRIPTION =
  "ConvAudit منصة تحليل متاجر إلكترونية: تدقيق صفحات المنتجات، تحليل GEO من إشارات الصفحة، ومولد محتوى. الموقع الرسمي للخدمة هو نطاق convaudit.com.";

export const metadata: Metadata = publicPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.about,
});

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: TITLE,
          path: ROUTES.about,
          description: DESCRIPTION,
        })}
      />
      {children}
    </>
  );
}
