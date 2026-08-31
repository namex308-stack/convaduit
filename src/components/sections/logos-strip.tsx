import { Marquee } from "@/components/magicui/marquee";
import { Container } from "@/components/design-system/section";
import { translate as t, type TranslationKey } from "@/lib/i18n";

/** Supported platforms — not customer logos. Brand names stay Latin. */
const PLATFORM_KEYS: readonly TranslationKey[] = [
  "logos.shopify",
  "logos.wooCommerce",
  "logos.salla",
  "logos.zid",
  "logos.magento",
  "logos.customStorefronts",
];

function PlatformName({ messageKey }: { messageKey: TranslationKey }) {
  return (
    <span className="font-display text-sm sm:text-base font-semibold tracking-wide text-muted-foreground/70 whitespace-nowrap">
      {t(messageKey)}
    </span>
  );
}

export function LogosStrip() {
  return (
    <section id="platforms" className="py-7 sm:py-9 border-y border-border/40 bg-muted/15" aria-label={t("logos.title")}>
      <Container>
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-5">
          {t("logos.title")}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 motion-safe:hidden">
          {PLATFORM_KEYS.map((key) => (
            <li key={key}>
              <PlatformName messageKey={key} />
            </li>
          ))}
        </ul>
        <div className="relative hidden overflow-hidden motion-safe:block [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <Marquee pauseOnHover className="[--duration:36s] [--gap:3rem]">
            {PLATFORM_KEYS.map((key) => (
              <PlatformName key={key} messageKey={key} />
            ))}
          </Marquee>
        </div>
      </Container>
    </section>
  );
}
