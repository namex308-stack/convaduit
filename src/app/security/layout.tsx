import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

const TITLE = "أمان المنتج والبيانات";
const DESCRIPTION =
  "نهجنا الحالي في أمان المنتج: تحليل الصفحات العامة فقط، النقل عبر HTTPS، وحدّ أدنى من الصلاحيات — دون الادعاء بشهادات غير موثّقة.";

export const metadata: Metadata = publicPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.security,
});

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: TITLE,
          path: ROUTES.security,
          description: DESCRIPTION,
        })}
      />
      {children}
    </>
  );
}
