"use client";

import Link from "next/link";
import { BadgePercent, CircleHelp, CreditCard, Mail, MessageSquare } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { SocialLinks } from "@/components/layout/social-links";
import { ContactEmailActions } from "@/components/contact/email-actions";
import { CONTACT_EMAIL, contactMailto } from "@/lib/seo/contact";
import { ROUTES } from "@/lib/routes";

const TOPICS = [
  {
    title: "استفسار عام",
    body: "أسئلة عن التحليل، الباقات، أو كيفية استخدام المنصة.",
    href: contactMailto("استفسار عام — ConvAudit"),
    icon: MessageSquare,
  },
  {
    title: "الفوترة والاشتراك",
    body: "مدفوعات Kashier، ترقية الباقة، أو معرّف عملية الدفع.",
    href: contactMailto("فوترة واشتراك — ConvAudit"),
    icon: CreditCard,
  },
  {
    title: "طلبات الاسترداد",
    body: "ضمان 14 يوماً. اذكر البريد المرتبط بالحساب وتاريخ الدفع أو الاشتراك.",
    href: contactMailto("طلب استرداد — ConvAudit"),
    icon: BadgePercent,
    policyHref: ROUTES.refundPolicy,
    policyLabel: "سياسة الاسترداد",
  },
] as const;

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        title="اتصل بنا"
        subtitle="القناة الرسمية الوحيدة للتواصل مع فريق ConvAudit — المنتج، الفوترة، وطلبات الاسترداد."
        icon={Mail}
      />
      <PageContent className="max-w-5xl space-y-8">
        <SurfaceCard className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            البريد الرسمي
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight" dir="ltr">
            {CONTACT_EMAIL}
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            أرسل من البريد المرتبط بحسابك، واذكر نوع الطلب (استفسار عام، فوترة، أو استرداد) وأي رقم اشتراك
            أو معرّف دفع إن وُجد. هذه هي قناة الدعم والاسترداد المعتمدة.
          </p>
          <ContactEmailActions />
        </SurfaceCard>

        <div className="grid gap-4 sm:grid-cols-2">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <SurfaceCard key={topic.title} className="p-6">
                <span className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display font-semibold">{topic.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{topic.body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a href={topic.href} className="text-sm font-medium text-primary hover:underline">
                    أرسل رسالة ←
                  </a>
                  {"policyHref" in topic ? (
                    <Link href={topic.policyHref} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                      {topic.policyLabel}
                    </Link>
                  ) : null}
                </div>
              </SurfaceCard>
            );
          })}

          <SurfaceCard className="p-6">
            <span className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <CircleHelp className="size-5" />
            </span>
            <h3 className="mt-4 font-display font-semibold">أسئلة شائعة</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              إجابات سريعة عن المنتج والباقات قبل إرسال رسالة.
            </p>
            <Link href="/#faq" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
              الأسئلة الشائعة ←
            </Link>
          </SurfaceCard>
        </div>

        <SurfaceCard className="p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="font-display font-semibold">الحسابات الرسمية</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              تابع ConvAudit على X وLinkedIn للأخبار وتحديثات المنتج. الدعم يتم عبر البريد أعلاه.
            </p>
          </div>
          <SocialLinks className="mt-4 sm:mt-0 shrink-0" />
        </SurfaceCard>
      </PageContent>
    </PageShell>
  );
}
