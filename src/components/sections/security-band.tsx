import { ShieldCheck, Lock, Server, FileCheck2, Eye, KeyRound } from "lucide-react";
import { BentoCell, BentoPanel, Container, IconWell, Section, SectionHeader } from "@/components/design-system/section";
import { translate as t, type TranslationKey } from "@/lib/i18n";

const ITEMS = [
  { icon: ShieldCheck, titleKey: "security.s1.title" as const, descKey: "security.s1.desc" as const },
  { icon: Lock, titleKey: "security.s2.title" as const, descKey: "security.s2.desc" as const },
  { icon: Server, titleKey: "security.s3.title" as const, descKey: "security.s3.desc" as const },
  { icon: KeyRound, titleKey: "security.s4.title" as const, descKey: "security.s4.desc" as const },
  { icon: FileCheck2, titleKey: "security.s5.title" as const, descKey: "security.s5.desc" as const },
  { icon: Eye, titleKey: "security.s6.title" as const, descKey: "security.s6.desc" as const },
] as const;

/** Honest posture badges — no unverified certifications. */
const POSTURE_KEYS: readonly TranslationKey[] = [
  "security.posture.tls",
  "security.posture.encryptedSecrets",
  "security.posture.leastPrivilege",
  "security.posture.auditLogging",
];

export function SecurityBand() {
  return (
    <Section id="security" tone="muted">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.35fr] gap-10 lg:gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <SectionHeader
              eyebrow={t("security.eyebrow")}
              title={t("security.title")}
              description={t("security.subtitle")}
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {POSTURE_KEYS.map((key) => (
                <span
                  key={key}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-border/50 bg-card/80 text-foreground/80"
                >
                  {t(key)}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed max-w-md">
              {t("security.complianceNote")}
            </p>
          </div>

          <BentoPanel>
            <div className="grid sm:grid-cols-2 gap-px">
              {ITEMS.map((item) => (
                <BentoCell key={item.titleKey}>
                  <IconWell className="size-9 mb-3">
                    <item.icon className="size-4" aria-hidden />
                  </IconWell>
                  <h3 className="font-display font-semibold text-sm">{t(item.titleKey)}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">{t(item.descKey)}</p>
                </BentoCell>
              ))}
            </div>
          </BentoPanel>
        </div>
      </Container>
    </Section>
  );
}
