import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { getAboutDescription, getAboutTitle } from "@/app/about/copy";
import { getServerLocaleId } from "@/lib/locale/server";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocaleId();
  return publicPageMetadata({
    title: getAboutTitle(locale),
    description: getAboutDescription(locale),
    path: ROUTES.about,
    locale,
  });
}

export default async function AboutLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocaleId();
  const title = getAboutTitle(locale);
  const description = getAboutDescription(locale);

  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: title,
          path: ROUTES.about,
          description,
          locale,
        })}
      />
      {children}
    </>
  );
}
