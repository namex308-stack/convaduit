import { Flame, TrendingUp, Sparkles } from "lucide-react";
import { BentoCell, BentoPanel, Container, IconWell, Section, SectionHeader } from "@/components/design-system/section";
import { getServerTranslate } from "@/lib/locale/server-t";
import { type TranslationKey } from "@/lib/i18n";

const PRIORITIES: {
  icon: typeof Flame;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  itemKeys: readonly TranslationKey[];
  accent: string;
  badge: string;
}[] = [
  {
    icon: Flame,
    titleKey: "decision.high.title",
    descKey: "decision.high.desc",
    itemKeys: ["decision.high.i1", "decision.high.i2", "decision.high.i3"],
    accent: "#FF6600",
    badge: "01",
  },
  {
    icon: TrendingUp,
    titleKey: "decision.growth.title",
    descKey: "decision.growth.desc",
    itemKeys: ["decision.growth.i1", "decision.growth.i2"],
    accent: "#ff983f",
    badge: "02",
  },
  {
    icon: Sparkles,
    titleKey: "decision.future.title",
    descKey: "decision.future.desc",
    itemKeys: ["decision.future.i1", "decision.future.i2"],
    accent: "#cc5200",
    badge: "03",
  },
];

export async function DecisionEngine() {
  const t = await getServerTranslate();
  return (
    <Section id="decision-engine" tone="bordered">
      <Container>
        <SectionHeader
          align="center"
          eyebrow={t("decision.eyebrow")}
          title={t("decision.title")}
          description={t("decision.subtitle")}
          className="mb-8 sm:mb-10"
        />

        <BentoPanel>
          <div className="grid md:grid-cols-3 gap-px">
            {PRIORITIES.map((tier) => (
              <BentoCell key={tier.titleKey}>
                <div className="flex items-start justify-between mb-5">
                  <IconWell
                    className="size-11 rounded-xl"
                    style={{ background: `${tier.accent}1a`, color: tier.accent }}
                  >
                    <tier.icon className="size-5" aria-hidden />
                  </IconWell>
                  <span
                    className="font-display text-2xl font-bold opacity-20"
                    style={{ color: tier.accent }}
                  >
                    {tier.badge}
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold">{t(tier.titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(tier.descKey)}</p>
                <ul className="mt-5 space-y-2.5">
                  {tier.itemKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <span
                        className="mt-1.5 size-1.5 rounded-full shrink-0"
                        style={{ background: tier.accent }}
                        aria-hidden
                      />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </BentoCell>
            ))}
          </div>
        </BentoPanel>
      </Container>
    </Section>
  );
}
