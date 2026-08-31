import Link from "next/link";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { Container, Section } from "@/components/design-system/section";
import { getServerTranslate } from "@/lib/locale/server-t";
import { ROUTES } from "@/lib/routes";

/** Short homepage CTA pointing to the internal Shopify affiliate landing page. */
export async function ShopifyPromoBand() {
  const t = await getServerTranslate();
  return (
    <Section className="py-10 sm:py-12" tone="bordered">
      <Container className="max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/50 bg-card px-5 py-6 sm:px-8 sm:py-7">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
              <ShoppingBag className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-base sm:text-lg font-bold tracking-tight">
                {t("shopify.home.title")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-xl">
                {t("shopify.home.body")}
              </p>
            </div>
          </div>
          <Link
            href={ROUTES.shopify}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
          >
            {t("shopify.home.button")}
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
