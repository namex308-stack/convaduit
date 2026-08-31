"use client";

import Link from "next/link";
import { ScrollText } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { ROUTES } from "@/lib/routes";
import { useT } from "@/lib/i18n";
import { TERMS_COPY } from "@/lib/marketing/static-copy";

export default function TermsPage() {
  const t = useT();
  const copy = TERMS_COPY;

  return (
    <PageShell>
      <PageHeader title={copy.pageTitle} subtitle={copy.pageSubtitle} icon={ScrollText} />
      <PageContent className="max-w-3xl space-y-4">
        {copy.sections.map((item) => (
          <SurfaceCard key={item.title} className="p-5">
            <h2 className="font-display font-semibold text-sm">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </SurfaceCard>
        ))}
        {copy.footer ? (
          <p className="text-xs text-muted-foreground pt-2">
            {copy.footer}{" "}
            <Link href={ROUTES.privacy} className="text-primary hover:underline">
              {copy.linkText}
            </Link>{" "}
            {t("terms.and")}{" "}
            <Link href={ROUTES.refundPolicy} className="text-primary hover:underline">
              {t("terms.refundPolicyLink")}
            </Link>
            .
          </p>
        ) : null}
      </PageContent>
    </PageShell>
  );
}
