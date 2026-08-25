import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { translate } from "@/lib/locale/t";
import { ROUTES } from "@/lib/routes";

const TITLE = "أسعار الباقات";
const DESCRIPTION = translate("pricing.subtitle");

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
