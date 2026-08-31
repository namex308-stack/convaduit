import { ArrowRight } from "lucide-react";
import { StartAuditCta } from "@/components/common/start-audit-cta";
import { getServerTranslate } from "@/lib/locale/server-t";
import { Container, Section } from "@/components/design-system/section";

export async function CTA() {
  const t = await getServerTranslate();
  return (
    <Section>
      <Container className="max-w-5xl">
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card px-6 py-10 sm:p-14 text-center shadow-[var(--shadow-elevated)]">
          <div
            className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.68_0.19_55_/_0.1),transparent_65%)]"
            aria-hidden
          />
          <div className="relative">
            <p className="inline-flex items-center rounded-full border border-primary/15 bg-primary/[0.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {t("cta.badge")}
            </p>
            <h2 className="mt-4 font-display text-[1.65rem] sm:text-3xl lg:text-[2.35rem] font-bold tracking-tight text-balance leading-[1.25]">
              {t("cta.title")}
            </h2>
            <p className="mt-4 text-sm sm:text-[0.95rem] text-muted-foreground max-w-xl mx-auto text-pretty leading-relaxed">
              {t("cta.subtitle")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <StartAuditCta className="h-11 px-7 font-semibold rounded-full shadow-glow group">
                {t("cta.button")}
                <ArrowRight className="size-4 ms-0.5 rtl:rotate-180 group-hover:translate-x-0.5 motion-reduce:transition-none transition-transform" />
              </StartAuditCta>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("cta.social")}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
