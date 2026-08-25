"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { SocialLinks } from "@/components/layout/social-links";
import { ROUTES } from "@/lib/routes";

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        title="اتصل بنا"
        subtitle="القناة الرسمية للتواصل مع فريق ConvAudit بشأن المنتج والفوترة وطلبات الاسترداد."
        icon={Mail}
      />
      <PageContent className="max-w-3xl space-y-4">
        <SurfaceCard className="p-5">
          <h2 className="font-display font-semibold text-sm">كيف تتواصل معنا</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            أرسل رسالة إلى فريق الدعم عبر البريد المرتبط بحسابك، مع ذكر موضوع الطلب (استفسار عام، فوترة،
            أو استرداد) وأي رقم اشتراك أو معرّف دفع إن وُجد. هذه الصفحة هي القناة الرسمية لتقديم طلبات
            الدعم والاسترداد.
          </p>
          <p className="mt-3 text-sm">
            <a
              href="mailto:support@convaudit.com?subject=طلب%20دعم%20ConvAudit"
              className="font-medium text-primary hover:underline"
            >
              support@convaudit.com
            </a>
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <h2 className="font-display font-semibold text-sm">الحسابات الرسمية</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            تابع ConvAudit على X وLinkedIn للأخبار وتحديثات المنتج.
          </p>
          <SocialLinks className="mt-4" />
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <h2 className="font-display font-semibold text-sm">طلبات الاسترداد</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            لطلب استرداد خلال فترة الضمان البالغة 14 يوماً، استخدم نفس القناة أعلاه واذكر تاريخ الشراء
            أو الاشتراك. راجع{" "}
            <Link href={ROUTES.refundPolicy} className="font-medium text-primary hover:underline">
              سياسة الاسترداد
            </Link>{" "}
            للتفاصيل.
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <h2 className="font-display font-semibold text-sm">أسئلة شائعة</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            للإجابات السريعة عن المنتج والباقات، راجع{" "}
            <Link href="/#faq" className="font-medium text-primary hover:underline">
              الأسئلة الشائعة
            </Link>{" "}
            على الصفحة الرئيسية.
          </p>
        </SurfaceCard>
      </PageContent>
    </PageShell>
  );
}
