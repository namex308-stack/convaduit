"use client";

import Link from "next/link";
import { Map } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { ROADMAP_COPY, type RoadmapStatus } from "@/lib/marketing/static-copy";

export default function RoadmapPage() {
  const copy = ROADMAP_COPY;

  return (
    <PageShell>
      <PageHeader title={copy.pageTitle} subtitle={copy.pageSubtitle} icon={Map} />
      <PageContent className="max-w-2xl space-y-10">
        {copy.sectionOrder.map((status: RoadmapStatus) => {
          const items = copy.items.filter((item) => item.status === status);
          if (items.length === 0) return null;
          return (
            <section key={status} className="space-y-3" aria-labelledby={`roadmap-${status}`}>
              <h2
                id={`roadmap-${status}`}
                className="font-display text-lg font-semibold tracking-tight"
              >
                {copy.sectionLabels[status]}
              </h2>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.title}>
                    <SurfaceCard className="p-5 flex gap-4 items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md shrink-0">
                        {item.status}
                      </span>
                      <div>
                        <h3 className="font-display font-semibold text-sm">{item.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {item.note}
                        </p>
                      </div>
                    </SurfaceCard>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <div className="space-y-4 border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{copy.disclaimer}</p>
          <nav aria-label="روابط ذات صلة" className="flex flex-wrap gap-x-4 gap-y-2">
            {copy.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-primary hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </PageContent>
    </PageShell>
  );
}
