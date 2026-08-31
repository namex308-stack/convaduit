import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

const TITLE = "أسعار تدقيق المتاجر";
const DESCRIPTION =
  "باقات ConvAudit لتدقيق المتاجر الإلكترونية: تحويل، SEO، وGEO. ابدأ مجاناً — الأسعار بالجنيه المصري عبر Paymob.";

export const metadata: Metadata = publicPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.pricing,
});

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: TITLE,
          path: ROUTES.pricing,
          description: DESCRIPTION,
        })}
      />
      {children}
    </>
  );
}
