import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, Bot, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppFrame, Container, IconWell } from "@/components/design-system/section";
import { CRAWLABLE_START_AUDIT_HREF } from "@/lib/marketing-hrefs";
import { getServerTranslate } from "@/lib/locale/server-t";

const PILLARS = [
  { icon: Zap, labelKey: "hero.pillar.conversion" as const },
  { icon: Search, labelKey: "hero.pillar.seo" as const },
  { icon: Bot, labelKey: "hero.pillar.geo" as const },
  { icon: ShieldCheck, labelKey: "hero.pillar.trust" as const },
] as const;

const TRUST_POINTS = [
  { icon: CheckCircle2, labelKey: "hero.trust.noCard" as const },
  { icon: CheckCircle2, labelKey: "hero.trust.transparent" as const },
  { icon: CheckCircle2, labelKey: "hero.trust.platforms" as const },
] as const;

const HERO_BRAND = "ConvAudit";

const HERO_SHOT = {
  src: "/product/audit-new.png",
  width: 1119,
  height: 653,
} as const;

/**
 * Marketing hero — server-rendered so the H1 is in the first HTML paint
 * (not opacity:0 behind a client BlurFade / hydration wait).
 */
export async function Hero() {
  const t = await getServerTranslate();
  const headline1 = t("hero.headline1");
  const headlineRest = headline1.startsWith(HERO_BRAND)
    ? headline1.slice(HERO_BRAND.length).trimStart()
    : headline1;

  return (
    <section className="relative overflow-hidden pt-10 pb-12 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-24">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_22%,transparent_70%)]" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_at_top,oklch(0.68_0.19_55_/_0.08),transparent_58%)]"
        aria-hidden
      />

      <Container>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8 lg:gap-14 lg:items-center">
          <div className="text-center lg:text-start min-w-0">
            <Link
              href="/#why-lose-sales"
              className="group inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-medium text-primary hover:border-primary/35 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              {t("hero.badge")}
              <ArrowRight className="size-3 rtl:rotate-180 text-muted-foreground group-hover:translate-x-0.5 motion-reduce:transition-none transition-transform" />
            </Link>

            <h1 className="mt-5 sm:mt-6 font-display text-[1.75rem] sm:text-4xl lg:text-[2.65rem] xl:text-[3.05rem] font-bold leading-[1.22] tracking-tight text-balance">
              <span className="block gradient-text">{HERO_BRAND}</span>
              <span className="block text-foreground">{headlineRest}</span>
              <span className="gradient-text">{t("hero.headline3")}</span>
            </h1>

            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed text-pretty">
              {t("hero.subheadline")}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center lg:justify-start">
              <Button size="lg" asChild className="h-11 px-7 font-semibold rounded-full shadow-glow group">
                <Link href={CRAWLABLE_START_AUDIT_HREF}>
                  {t("hero.startFreeAudit")}
                  <ArrowRight className="size-4 ms-0.5 rtl:rotate-180 group-hover:translate-x-0.5 motion-reduce:transition-none transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-11 px-7 font-semibold rounded-full bg-card/80 hover:border-primary/40 hover:bg-card">
                <Link href="/#how">
                  {t("hero.viewDemo")}
                </Link>
              </Button>
            </div>

            <ul className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-x-5 sm:gap-y-2">
              {TRUST_POINTS.map((item) => (
                <li
                  key={item.labelKey}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground"
                >
                  <item.icon className="size-3.5 text-primary shrink-0" aria-hidden />
                  <span>{t(item.labelKey)}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="relative min-w-0 mt-2 lg:mt-0">
            <div
              className="hero-glow pointer-events-none absolute -inset-8 sm:-inset-12 -z-10 rounded-full blur-2xl motion-reduce:hidden"
              aria-hidden
            />
            <AppFrame
              label="ConvAudit"
              meta={t("hero.preview.liveLabel")}
              footer={
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PILLARS.map((p) => (
                    <li key={p.labelKey} className="flex items-center gap-1.5 min-w-0">
                      <IconWell className="size-6 rounded-md">
                        <p.icon className="size-3" aria-hidden />
                      </IconWell>
                      <span className="text-[11px] font-semibold truncate">{t(p.labelKey)}</span>
                    </li>
                  ))}
                </ul>
              }
            >
              <Image
                src={HERO_SHOT.src}
                alt={t("productPreview.shot1.title")}
                width={HERO_SHOT.width}
                height={HERO_SHOT.height}
                sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 92vw"
                className="h-auto w-full"
                priority
              />
            </AppFrame>

            <figcaption className="mt-3 text-center lg:text-start text-xs text-muted-foreground text-pretty">
              {t("hero.preview.sampleNote")} {t("hero.preview.disclaimer")}
            </figcaption>
            <p className="mt-1.5 text-center lg:text-start text-xs text-muted-foreground text-pretty">
              {t("hero.preview.geoNote")}
            </p>
          </figure>
        </div>
      </Container>
    </section>
  );
}
