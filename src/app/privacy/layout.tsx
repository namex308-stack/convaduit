import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";
import { ROUTES } from "@/lib/routes";

const TITLE = "سياسة الخصوصية";
const DESCRIPTION =
  "ما نجمعه لتشغيل الحسابات والتحليلات، لماذا نجمعه، وكيف تطلب حذف البيانات المرتبطة بحسابك.";

export const metadata: Metadata = publicPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: ROUTES.privacy,
});

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: TITLE,
          path: ROUTES.privacy,
          description: DESCRIPTION,
        })}
      />
      {children}
    </>
  );
}
