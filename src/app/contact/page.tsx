"use client";

import Link from "next/link";
import { BadgePercent, CreditCard, Mail, MessageCircle, MessageSquare } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { SocialLinks } from "@/components/layout/social-links";
import { ContactEmailActions } from "@/components/contact/email-actions";
import { Button } from "@/components/ui/button";
import {
  CONTACT_EMAIL,
  CONTACT_WHATSAPP_DISPLAY,
  contactMailto,
  contactWhatsAppUrl,
} from "@/lib/seo/contact";
import { SOCIAL_PROFILES } from "@/lib/seo/social";
import { useT } from "@/lib/i18n";
import { CONTACT_COPY } from "@/lib/marketing/static-copy";

const TOPIC_ICONS = [MessageSquare, CreditCard, BadgePercent] as const;

export default function ContactPage() {
  const t = useT();
  const copy = CONTACT_COPY;

  return (
    <PageShell>
      <PageHeader title={copy.pageTitle} subtitle={copy.pageSubtitle} icon={Mail} />
      <PageContent className="max-w-5xl space-y-8">
        <SurfaceCard className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {copy.emailLabel}
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight" dir="ltr">
            {CONTACT_EMAIL}
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {copy.emailIntro}
          </p>
          <ContactEmailActions />
        </SurfaceCard>

        <SurfaceCard className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {copy.whatsappLabel}
          </p>
          <h2
            className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight"
            dir="ltr"
          >
            {CONTACT_WHATSAPP_DISPLAY}
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {copy.whatsappIntro}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full font-semibold shadow-glow">
              <a
                href={contactWhatsAppUrl(t("contact.whatsappPrefill"))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" />
                {t("contact.openWhatsApp")}
              </a>
            </Button>
          </div>
        </SurfaceCard>

        <div className="grid gap-4 sm:grid-cols-2">
          {copy.topics.map((topic, index) => {
            const Icon = TOPIC_ICONS[index] ?? MessageSquare;
            return (
              <SurfaceCard key={topic.title} className="p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-display font-semibold text-sm">{topic.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{topic.body}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a
                    href={contactMailto(topic.mailSubject)}
                    className="font-medium text-primary hover:underline"
                  >
                    {t("contact.sendEmail")}
                  </a>
                  {"policyHref" in topic && topic.policyHref && topic.policyLabel ? (
                    <Link href={topic.policyHref} className="text-muted-foreground hover:text-primary">
                      {topic.policyLabel}
                    </Link>
                  ) : null}
                </div>
              </SurfaceCard>
            );
          })}
        </div>

        {SOCIAL_PROFILES.length > 0 ? (
          <section>
            <h2 className="font-display text-lg font-semibold mb-3">{copy.socialHeading}</h2>
            <SocialLinks />
          </section>
        ) : null}
      </PageContent>
    </PageShell>
  );
}
