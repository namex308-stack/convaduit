import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { translate } from "@/lib/locale/t";
import { ROUTES } from "@/lib/routes";

const TITLE = "التوثيق ودليل البدء";
const DESCRIPTION = translate("docs.subtitle");

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
