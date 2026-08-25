"use client";

import Link from "next/link";
import {
  BookOpen,
  FileText,
  Map,
  Shield,
  Lock,
  Server,
  ArrowUpRight,
} from "lucide-react";
import { Container, Section, SectionHeader, SurfaceCard } from "@/components/design-system/section";
import { BlurFade } from "@/components/magicui/blur-fade";
import { useT } from "@/lib/i18n";

const RESOURCES = [
  {
    icon: BookOpen,
    titleKey: "trust.docs.title" as const,
    descKey: "trust.docs.desc" as const,
    href: "/docs",
  },
  {
    icon: FileText,
    titleKey: "trust.methodology.title" as const,
    descKey: "trust.methodology.desc" as const,
    href: "#methodology",
  },
  {
    icon: Shield,
    titleKey: "trust.security.title" as const,
    descKey: "trust.security.desc" as const,
    href: "/security",
  },
  {
    icon: Lock,
    titleKey: "trust.privacy.title" as const,
    descKey: "trust.privacy.desc" as const,
    href: "/privacy",
  },
  {
    icon: Server,
    titleKey: "trust.infra.title" as const,
    descKey: "trust.infra.desc" as const,
    href: "/security#infrastructure",
  },
  {
    icon: Map,
    titleKey: "trust.roadmap.title" as const,
    descKey: "trust.roadmap.desc" as const,
    href: "/roadmap",
  },
] as const;

export function TrustResources() {
  const t = useT();
  return (
    <Section id="resources" tone="muted">
      <Container>
        <SectionHeader
          align="center"
          eyebrow={t("trust.eyebrow")}
          title={t("trust.title")}
          description={t("trust.subtitle")}
          className="mb-12"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCES.map((item, i) => (
            <BlurFade key={item.href} delay={i * 0.04} className="h-full">
              <Link href={item.href} className="block h-full group focus-visible:outline-none">
                <SurfaceCard className="group-hover:border-primary/30">
                  <div className="flex items-start justify-between gap-3">
                    <span className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                      <item.icon className="size-5" aria-hidden />
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold text-sm">{t(item.titleKey)}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">
                    {t(item.descKey)}
                  </p>
                  <span className="mt-4 inline-flex w-fit text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {t("trust.view")}
                  </span>
                </SurfaceCard>
              </Link>
            </BlurFade>
          ))}
        </div>
      </Container>
    </Section>
  );
}
