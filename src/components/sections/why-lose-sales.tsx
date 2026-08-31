import { EyeOff, FileWarning, ShieldAlert, Swords } from "lucide-react";
import { BentoCell, BentoPanel, Container, IconWell, Section, SectionHeader } from "@/components/design-system/section";
import { translate as t } from "@/lib/i18n";

const PROBLEMS = [
  {
    icon: EyeOff,
    titleKey: "whyLose.card1.title" as const,
    descKey: "whyLose.card1.desc" as const,
    color: "#FF6600",
  },
  {
    icon: FileWarning,
    titleKey: "whyLose.card2.title" as const,
    descKey: "whyLose.card2.desc" as const,
    color: "#ff983f",
  },
  {
    icon: ShieldAlert,
    titleKey: "whyLose.card3.title" as const,
    descKey: "whyLose.card3.desc" as const,
    color: "#cc5200",
  },
  {
    icon: Swords,
    titleKey: "whyLose.card4.title" as const,
    descKey: "whyLose.card4.desc" as const,
    color: "#ff983f",
  },
] as const;

export function WhyLoseSales() {
  return (
    <Section id="why-lose-sales">
      <Container>
        <SectionHeader
          eyebrow={t("whyLose.eyebrow")}
          title={t("whyLose.title")}
          description={t("whyLose.subtitle")}
          className="mb-8 sm:mb-10"
        />

        <BentoPanel>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px">
            {PROBLEMS.map((item) => (
              <BentoCell key={item.titleKey}>
                <IconWell style={{ background: `${item.color}1a`, color: item.color }}>
                  <item.icon className="size-5" aria-hidden />
                </IconWell>
                <h3 className="mt-4 font-display text-base sm:text-lg font-semibold text-balance">
                  {t(item.titleKey)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {t(item.descKey)}
                </p>
              </BentoCell>
            ))}
          </div>
        </BentoPanel>
      </Container>
    </Section>
  );
}
