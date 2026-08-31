"use client";

import Link from "next/link";
import { Shield, Server, FileCheck2, Lock } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { useLocale } from "@/lib/locale/resolve";
import { SECURITY_COPY } from "@/lib/marketing/static-copy";

export default function SecurityPage() {
  const { locale } = useLocale();
  const copy = SECURITY_COPY;

  return (
    <PageShell>
      <PageHeader title={copy.pageTitle} subtitle={copy.pageSubtitle} icon={Shield} />
      <PageContent className="space-y-10 max-w-3xl">
        <section className="grid sm:grid-cols-2 gap-4">
          {copy.practices.map((p) => (
            <SurfaceCard key={p.title} className="p-5">
              <h2 className="font-display font-semibold text-sm">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </SurfaceCard>
          ))}
        </section>

        <section id="infrastructure" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-3">
            <span className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <Server className="size-5" />
            </span>
            <h2 className="font-display text-xl font-semibold">{copy.infrastructureTitle}</h2>
          </div>
          <SurfaceCard className="p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{copy.infrastructureBody}</p>
          </SurfaceCard>
        </section>

        <section id="compliance" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-3">
            <span className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <FileCheck2 className="size-5" />
            </span>
            <h2 className="font-display text-xl font-semibold">{copy.complianceTitle}</h2>
          </div>
          <SurfaceCard className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{copy.complianceBody}</p>
            <p className="text-sm text-muted-foreground leading-relaxed inline-flex items-start gap-2">
              <Lock className="size-4 mt-0.5 shrink-0 text-primary" />
              {copy.complianceNote}
            </p>
            <Link href="/privacy" className="text-sm font-medium text-primary hover:underline">
              {copy.privacyLink}
            </Link>
          </SurfaceCard>
        </section>
      </PageContent>
    </PageShell>
  );
}
