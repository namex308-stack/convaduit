"use client";

import Image from "next/image";
import { ArrowRight, LayoutDashboard, Link2 } from "lucide-react";
import { StartAuditCta } from "@/components/common/start-audit-cta";
import { Container, Section, SectionHeader } from "@/components/design-system/section";
import { BlurFade } from "@/components/magicui/blur-fade";
import { useT } from "@/lib/i18n";

/**
 * Display width of each screenshot in the homepage grid:
 * max-w-7xl (1280) − lg padding (4rem) − gap (1.5rem) ÷ 2 = 596px.
 * `vw` tokens must be standalone so next/image's srcset width picker can see them.
 */
const PRODUCT_PREVIEW_SIZES =
  "(min-width: 1280px) 596px, (min-width: 768px) 45vw, 92vw";

/** Intrinsic size of `/public/product/*.png` (1119×653). */
const PRODUCT_SHOT_SIZE = { width: 1119, height: 653 } as const;

const SHOTS = [
  {
    src: "/product/audit-new.png",
    icon: Link2,
    titleKey: "productPreview.shot1.title" as const,
    captionKey: "productPreview.shot1.caption" as const,
  },
  {
    src: "/product/dashboard.png",
    icon: LayoutDashboard,
    titleKey: "productPreview.shot2.title" as const,
    captionKey: "productPreview.shot2.caption" as const,
  },
] as const;

/** Real product screenshots — no mockups, no fabricated scores. */
export function ProductPreview() {
  const t = useT();

  return (
    <Section id="product-preview" tone="muted">
      <Container>
        <SectionHeader
          align="center"
          eyebrow={t("productPreview.eyebrow")}
          title={t("productPreview.title")}
          description={t("productPreview.subtitle")}
          className="mb-12"
        />

        <div className="grid md:grid-cols-2 gap-6">
          {SHOTS.map((shot, i) => (
            <BlurFade key={shot.src} delay={i * 0.08} className="h-full">
              <figure className="h-full flex flex-col">
                <div className="relative rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-elevated)] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 bg-muted/40">
                    <shot.icon className="size-4 text-primary shrink-0" aria-hidden />
                    <span className="text-sm font-semibold truncate">{t(shot.titleKey)}</span>
                  </div>
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={shot.src}
                      alt={t(shot.titleKey)}
                      width={PRODUCT_SHOT_SIZE.width}
                      height={PRODUCT_SHOT_SIZE.height}
                      sizes={PRODUCT_PREVIEW_SIZES}
                      className="absolute inset-0 size-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                </div>
                <figcaption className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {t(shot.captionKey)}
                </figcaption>
              </figure>
            </BlurFade>
          ))}
        </div>

        <div className="mt-10 text-center">
          <StartAuditCta className="font-semibold h-11 px-7 rounded-full shadow-glow group">
            {t("productPreview.cta")}
            <ArrowRight className="size-4 ms-0.5 rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
          </StartAuditCta>
          <p className="mt-3 text-xs text-muted-foreground">{t("productPreview.ctaSub")}</p>
        </div>
      </Container>
    </Section>
  );
}
