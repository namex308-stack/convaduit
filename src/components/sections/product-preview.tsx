import Image from "next/image";
import { ArrowRight, LayoutDashboard, Link2 } from "lucide-react";
import { StartAuditCta } from "@/components/common/start-audit-cta";
import { MotionLift } from "@/components/common/motion-lift";
import { AppFrame, Container, Section, SectionHeader } from "@/components/design-system/section";
import { getServerTranslate } from "@/lib/locale/server-t";

/**
 * Display width of each screenshot in the homepage grid:
 * max-w-7xl (1280) − lg padding (4rem) − gap (1.5rem) ÷ 2 = 596px.
 * `vw` tokens must be standalone so next/image's srcset width picker can see them.
 */
const PRODUCT_PREVIEW_SIZES =
  "(min-width: 1280px) 596px, (min-width: 768px) 45vw, 92vw";

/** Intrinsic size of `/public/product/*.png` (1119×653 ≈ 1.713). */
const PRODUCT_SHOT_SIZE = { width: 1119, height: 653 } as const;

const SHOTS = [
  {
    src: "/product/audit-new.png",
    icon: Link2,
    titleKey: "productPreview.shot1.title" as const,
    captionKey: "productPreview.shot1.caption" as const,
    loading: "lazy" as const,
  },
  {
    src: "/product/dashboard.png",
    icon: LayoutDashboard,
    titleKey: "productPreview.shot2.title" as const,
    captionKey: "productPreview.shot2.caption" as const,
    loading: "eager" as const,
  },
] as const;

/** Real product screenshots — no mockups, no fabricated scores. */
export async function ProductPreview() {
  const t = await getServerTranslate();
  return (
    <Section id="product-preview" tone="muted">
      <Container>
        <SectionHeader
          align="center"
          eyebrow={t("productPreview.eyebrow")}
          title={t("productPreview.title")}
          description={t("productPreview.subtitle")}
          className="mb-8 sm:mb-10"
        />

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {SHOTS.map((shot) => (
            <MotionLift key={shot.src}>
              <figure className="h-full flex flex-col min-w-0">
                <AppFrame
                  label={
                    <span className="inline-flex items-center gap-2">
                      <shot.icon className="size-3.5 text-primary shrink-0" aria-hidden />
                      {t(shot.titleKey)}
                    </span>
                  }
                >
                  <Image
                    src={shot.src}
                    alt={t(shot.titleKey)}
                    width={PRODUCT_SHOT_SIZE.width}
                    height={PRODUCT_SHOT_SIZE.height}
                    sizes={PRODUCT_PREVIEW_SIZES}
                    className="h-auto w-full"
                    loading={shot.loading}
                  />
                </AppFrame>
                <figcaption className="mt-3 px-0.5 text-sm text-muted-foreground leading-relaxed">
                  {t(shot.captionKey)}
                </figcaption>
              </figure>
            </MotionLift>
          ))}
        </div>

        <div className="mt-10 text-center">
          <StartAuditCta className="font-semibold h-11 px-7 rounded-full shadow-glow group">
            {t("productPreview.cta")}
            <ArrowRight className="size-4 ms-0.5 rtl:rotate-180 group-hover:translate-x-0.5 motion-reduce:transition-none transition-transform" />
          </StartAuditCta>
          <p className="mt-3 text-xs text-muted-foreground">{t("productPreview.ctaSub")}</p>
        </div>
      </Container>
    </Section>
  );
}
