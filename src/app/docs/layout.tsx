import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

const TITLE = "دليل تدقيق المتاجر وGEO";
const DESCRIPTION =
  "كيف يعمل تدقيق الصفحة في ConvAudit: تحويل، SEO، GEO، حدود التحليل، ومولد المحتوى لمتاجر Shopify وWooCommerce وسلة وزد.";

export const metadata: Metadata = publicPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.docs,
});

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: TITLE,
          path: ROUTES.docs,
          description: DESCRIPTION,
        })}
      />
      {children}
    </>
  );
}
