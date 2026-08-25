import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

const TITLE = "خارطة طريق المنتج";
const DESCRIPTION =
  "أولويات توجيهية معلنة للمنتج — ليست تعهدات تعاقدية ولا مواعيد تسليم ملزمة.";

export const metadata: Metadata = publicPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.roadmap,
});

export default function RoadmapLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: TITLE,
          path: ROUTES.roadmap,
          description: DESCRIPTION,
        })}
      />
      {children}
    </>
  );
}
