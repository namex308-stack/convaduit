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
import { BentoPanel, Container, IconWell, Section, SectionHeader } from "@/components/design-system/section";
import { getServerTranslate } from "@/lib/locale/server-t";
import { ROUTES } from "@/lib/routes";

export const TRUST_RESOURCE_LINKS = [
  {
    icon: BookOpen,
    titleKey: "trust.docs.title" as const,
    descKey: "trust.docs.desc" as const,
    href: ROUTES.docs,
  },
  {
    icon: FileText,
    titleKey: "trust.methodology.title" as const,
    descKey: "trust.methodology.desc" as const,
    href: "/#methodology",
  },
  {
    icon: Shield,
    titleKey: "trust.security.title" as const,
    descKey: "trust.security.desc" as const,
    href: ROUTES.security,
  },
  {
    icon: Lock,
    titleKey: "trust.privacy.title" as const,
    descKey: "trust.privacy.desc" as const,
    href: ROUTES.privacy,
  },
  {
    icon: Server,
    titleKey: "trust.infra.title" as const,
    descKey: "trust.infra.desc" as const,
    href: `${ROUTES.security}#infrastructure`,
  },
  {
    icon: Map,
    titleKey: "trust.roadmap.title" as const,
    descKey: "trust.roadmap.desc" as const,
    href: ROUTES.roadmap,
  },
] as const;

export async function TrustResources() {
  const t = await getServerTranslate();
  return (
    <Section id="resources">
      <Container>
        <SectionHeader
          align="center"
          eyebrow={t("trust.eyebrow")}
          title={t("trust.title")}
          description={t("trust.subtitle")}
          className="mb-8 sm:mb-10"
        />
        <BentoPanel>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px">
            {TRUST_RESOURCE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex h-full min-w-0 flex-col bg-card p-5 sm:p-6 transition-colors duration-200 motion-reduce:transition-none hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <IconWell>
                    <item.icon className="size-5" aria-hidden />
                  </IconWell>
                  <ArrowUpRight className="size-4 text-muted-foreground/50 group-hover:text-primary transition-colors motion-reduce:transition-none rtl:-scale-x-100" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-sm">{t(item.titleKey)}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">
                  {t(item.descKey)}
                </p>
                <span className="mt-4 inline-flex w-fit text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {t("trust.view")}
                </span>
              </Link>
            ))}
          </div>
        </BentoPanel>
      </Container>
    </Section>
  );
}
