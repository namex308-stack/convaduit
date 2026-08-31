"use client";

import { Lock } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { PRIVACY_COPY } from "@/lib/marketing/static-copy";

export default function PrivacyPage() {
  const copy = PRIVACY_COPY;

  return (
    <PageShell>
      <PageHeader title={copy.pageTitle} subtitle={copy.pageSubtitle} icon={Lock} />
      <PageContent className="max-w-3xl space-y-4">
        {copy.sections.map((item) => (
          <SurfaceCard key={item.title} className="p-5">
            <h2 className="font-display font-semibold text-sm">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </SurfaceCard>
        ))}
        {copy.footer ? (
          <p className="text-xs text-muted-foreground pt-2">{copy.footer}</p>
        ) : null}
      </PageContent>
    </PageShell>
  );
}
