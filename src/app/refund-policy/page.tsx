"use client";

import Link from "next/link";
import { BadgePercent } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { ROUTES } from "@/lib/routes";
import { useLocale } from "@/lib/locale/resolve";
import { REFUND_COPY } from "@/lib/marketing/static-copy";

export default function RefundPolicyPage() {
  const { locale } = useLocale();
  const copy = REFUND_COPY;

  return (
    <PageShell>
      <PageHeader title={copy.pageTitle} subtitle={copy.pageSubtitle} icon={BadgePercent} />
      <PageContent className="max-w-3xl space-y-4">
        {copy.sections.map((item) => (
          <SurfaceCard key={item.title} className="p-5">
            <h2 className="font-display font-semibold text-sm">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </SurfaceCard>
        ))}
        {copy.linkText ? (
          <p className="text-sm">
            <Link href={ROUTES.contact} className="font-medium text-primary hover:underline">
              {copy.linkText}
            </Link>
          </p>
        ) : null}
        {copy.footer ? (
          <p className="text-xs text-muted-foreground pt-2">{copy.footer}</p>
        ) : null}
      </PageContent>
    </PageShell>
  );
}
