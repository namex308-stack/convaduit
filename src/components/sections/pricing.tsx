"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Sparkles, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BentoPanel, Container, SectionHeader } from "@/components/design-system/section";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useT, type TranslationKey } from "@/lib/i18n";
import { MARKETING_PLANS, formatEgp, yearlySavingsEgp, type PlanId } from "@/lib/billing/plans";
import {
  assertNoUpgradeLoop,
  resolvePlanSelectionPath,
} from "@/lib/billing/upgrade-flow";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { CRAWLABLE_START_AUDIT_HREF } from "@/lib/use-navigate";
import { withTimeout } from "@/lib/with-timeout";

export type BillingInterval = "monthly" | "yearly";

interface PricingProps {
  /** Optional handler when Free plan CTA is clicked (e.g. landing free CTA). */
  onFreeCta?: () => void;
  className?: string;
  /** Landing shows marketing header; page relies on PageShell header. */
  variant?: "landing" | "page";
}

const PLAN_META: Record<
  PlanId,
  {
    nameKey: TranslationKey;
    taglineKey: TranslationKey;
    auditsKey: TranslationKey;
    ctaKey: TranslationKey;
    periodFreeKey: TranslationKey;
  }
> = {
  free: {
    nameKey: "plan.starter.name",
    taglineKey: "plan.starter.tagline",
    auditsKey: "plan.starter.audits",
    ctaKey: "plan.starter.cta",
    periodFreeKey: "plan.starter.period",
  },
  pro: {
    nameKey: "plan.pro.name",
    taglineKey: "plan.pro.tagline",
    auditsKey: "plan.pro.audits",
    ctaKey: "plan.pro.cta",
    periodFreeKey: "plan.starter.period",
  },
  business: {
    nameKey: "plan.business.name",
    taglineKey: "plan.business.tagline",
    auditsKey: "plan.business.audits",
    ctaKey: "plan.business.cta",
    periodFreeKey: "plan.starter.period",
  },
};

export function Pricing({ onFreeCta, className, variant = "landing" }: PricingProps) {
  const t = useT();
  const router = useRouter();
  const [interval, setInterval] = React.useState<BillingInterval>("monthly");
  const [checkingOut, setCheckingOut] = React.useState<PlanId | null>(null);

  const isYearly = interval === "yearly";

  const handleCta = async (planId: PlanId) => {
    if (planId === "free") {
      if (onFreeCta) {
        onFreeCta();
        return;
      }
      router.push(CRAWLABLE_START_AUDIT_HREF);
      return;
    }

    setCheckingOut(planId);
    try {
      let authenticated = false;
      const sb = getSupabaseBrowser();
      if (sb) {
        const user = await withTimeout(
          sb.auth.getUser().then((r) => r.data.user),
          2500,
          null
        );
        authenticated = !!user;
      }

      const destination = resolvePlanSelectionPath(planId, interval, authenticated);
      assertNoUpgradeLoop(destination);
      router.push(destination);
    } catch {
      toast.error(t("pricing.checkoutFailed"));
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <section id="pricing" className={cn("w-full scroll-mt-24", variant === "landing" && "py-14 sm:py-20 lg:py-28", className)} aria-labelledby="pricing-heading">
      <Container className={variant === "landing" ? undefined : "px-0 sm:px-0 lg:px-0 max-w-none"}>
      {variant === "landing" ? (
        <SectionHeader
          align="center"
          eyebrow={t("landingPricing.eyebrow")}
          title={t("landingPricing.title")}
          description={t("landingPricing.subtitle")}
          className="mb-10"
          titleId="pricing-heading"
        />
      ) : (
        <h2 id="pricing-heading" className="sr-only">
          {t("pricing.title")}
        </h2>
      )}

      {/* Monthly / Annual toggle */}
      <div className="flex justify-center">
        <div
          role="group"
          aria-label={t("pricing.billingInterval")}
          className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 p-1 shadow-[var(--shadow-card)]"
        >
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            aria-pressed={!isYearly}
            className={cn(
              "px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-200 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
              !isYearly
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("landingPricing.monthly")}
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            aria-pressed={isYearly}
            className={cn(
              "px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-200 motion-reduce:transition-none flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring",
              isYearly
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("landingPricing.yearly")}
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full text-[10px] font-bold px-2 py-0 border-0",
                isYearly ? "bg-white/20 text-white" : "bg-primary/15 text-primary"
              )}
            >
              {t("plan.saveFourMonths")}
            </Badge>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <BentoPanel className="mt-10 max-w-6xl mx-auto">
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-px list-none p-0 m-0">
        {MARKETING_PLANS.map((plan) => {
          const meta = PLAN_META[plan.id];
          const isFree = plan.id === "free";
          const isPro = plan.id === "pro";
          const displayPrice = isFree ? 0 : isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isLoading = checkingOut === plan.id;

          return (
            <li key={plan.id} className="flex">
              <article
                className={cn(
                  "relative flex flex-col w-full bg-card p-6 sm:p-8 transition-colors duration-200 motion-reduce:transition-none",
                  isPro
                    ? "bg-primary/[0.04]"
                    : "hover:bg-muted/30"
                )}
              >
                {isPro && (
                  <div className="mb-4">
                    <Badge className="rounded-full px-3 py-1 gap-1.5 border-0">
                      <Sparkles className="size-3.5" aria-hidden />
                      {t("plan.mostPopular")}
                    </Badge>
                  </div>
                )}

                <header className="mb-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl font-bold tracking-tight">
                      {t(meta.nameKey)}
                    </h3>
                    {plan.id === "business" && (
                      <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden />
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed min-h-[2.5rem]">
                    {t(meta.taglineKey)}
                  </p>
                </header>

                {/* Price block */}
                <div className="mb-4">
                  <div className="flex items-end gap-1.5 flex-wrap">
                    <span className="font-display text-4xl sm:text-[2.75rem] font-extrabold tabular-nums tracking-tight">
                      {isFree ? (
                        <span className="text-foreground">0 EGP</span>
                      ) : (
                        <span className={cn(isPro && "text-primary")}>
                          {formatEgp(displayPrice)} EGP
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground mb-1.5">
                      {isFree
                        ? t(meta.periodFreeKey)
                        : isYearly
                          ? t("pricing.perYear")
                          : t("pricing.perMonth")}
                    </span>
                  </div>

                  {!isFree && isYearly && (
                    <Badge
                      variant="outline"
                      className="mt-2.5 text-xs font-semibold border-primary/40 text-primary bg-primary/5"
                    >
                      {t("plan.saveYearlyAmount", {
                        amount: formatEgp(
                          yearlySavingsEgp(plan.id === "business" ? "business" : "pro")
                        ),
                      })}
                    </Badge>
                  )}

                  {!isFree && !isYearly && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatEgp(plan.yearlyPrice)} EGP{t("pricing.perYear")}{" "}
                      <span className="text-primary font-medium">
                        —{" "}
                        {t("plan.saveYearlyAmount", {
                          amount: formatEgp(
                            yearlySavingsEgp(plan.id === "business" ? "business" : "pro")
                          ),
                        })}
                      </span>
                    </p>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full w-fit mb-5">
                  <Zap className="size-3.5 shrink-0" aria-hidden />
                  {t(meta.auditsKey)}
                </div>

                <Button
                  onClick={() => handleCta(plan.id)}
                  disabled={isLoading}
                  size="lg"
                  className={cn(
                    "w-full rounded-full font-semibold h-11",
                    isPro && "shadow-glow"
                  )}
                  variant={isPro ? "default" : isFree ? "outline" : "secondary"}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" aria-label={t("common.loading")} />
                  ) : (
                    t(meta.ctaKey)
                  )}
                </Button>

                <ul
                  className="mt-6 space-y-3 flex-1"
                  aria-label={t("pricing.planFeatures", { plan: t(meta.nameKey) })}
                >
                  {plan.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-2.5 text-sm leading-snug">
                      <span
                        className={cn(
                          "mt-0.5 size-5 rounded-full grid place-items-center shrink-0",
                          isPro ? "bg-brand/15" : "bg-primary/15"
                        )}
                        aria-hidden
                      >
                        <Check
                          className={cn(
                            "size-3",
                            isPro ? "text-brand" : "text-primary"
                          )}
                        />
                      </span>
                      <span className="text-foreground/85">{t(featureKey as TranslationKey)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          );
        })}
      </ul>
      </BentoPanel>

      {/* Paymob trust footer */}
      <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary shrink-0" aria-hidden />
          {t("landingPricing.secureCheckout")}
        </span>
        <span className="hidden sm:inline text-border" aria-hidden>
          ·
        </span>
        <span>{t("landingPricing.paymentMethods")}</span>
        <span className="hidden sm:inline text-border" aria-hidden>
          ·
        </span>
        <span>{t("landingPricing.billedEGP")}</span>
        <span className="hidden sm:inline text-border" aria-hidden>
          ·
        </span>
        <Link href="/pricing" className="hover:text-foreground underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
          {t("landingPricing.cancelAnytime")}
        </Link>
      </footer>
      </Container>
    </section>
  );
}
