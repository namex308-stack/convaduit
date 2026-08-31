import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { getServerLocaleId } from "@/lib/locale/server";
import { ROADMAP_COPY } from "@/lib/marketing/static-copy";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  return publicPageMetadata({
    title: ROADMAP_COPY.pageTitle,
    description: ROADMAP_COPY.metaDescription,
    path: ROUTES.roadmap,
    locale,
  });
}

export default async function RoadmapLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: ROADMAP_COPY.pageTitle,
          path: ROUTES.roadmap,
          description: ROADMAP_COPY.metaDescription,
          locale,
        })}
      />
      {children}
    </>
  );
}
