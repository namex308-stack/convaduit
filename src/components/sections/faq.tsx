import { ArrowRight } from "lucide-react";
import { StartAuditCta } from "@/components/common/start-audit-cta";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { Container, Section, SectionHeader } from "@/components/design-system/section";
import { HOME_FAQ_KEYS } from "@/lib/seo/faq-keys";
import { getServerTranslate } from "@/lib/locale/server-t";

export async function FAQ() {
  const t = await getServerTranslate();
  const items = HOME_FAQ_KEYS.map((f) => ({
    question: t(f.qKey),
    answer: t(f.aKey),
  }));

  return (
    <Section id="faq">
      <Container className="max-w-3xl">
        <SectionHeader
          align="center"
          eyebrow={t("faq.eyebrow")}
          title={t("faq.title")}
          className="mb-8 sm:mb-10"
        />

        <FaqAccordion items={items} />

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-4">{t("faq.stillQuestions")}</p>
          <StartAuditCta className="font-semibold h-11 px-7 rounded-full shadow-glow group">
            {t("faq.cta")}
            <ArrowRight className="size-4 ms-0.5 rtl:rotate-180 group-hover:translate-x-0.5 motion-reduce:transition-none transition-transform" />
          </StartAuditCta>
        </div>
      </Container>
    </Section>
  );
}
