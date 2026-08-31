"use client";

import Link from "next/link";
import { ScrollText } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { ROUTES } from "@/lib/routes";

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader
        title="الشروط والأحكام"
        subtitle="شروط استخدام خدمة ConvAudit كمنصة برمجيات كخدمة (SaaS)."
        icon={ScrollText}
      />
      <PageContent className="max-w-3xl space-y-4">
        {[
          {
            t: "قبول الشروط",
            b: "باستخدامك للمنصة أو إنشائك لحساب، فإنك توافق على هذه الشروط. إذا لم توافق، يُرجى عدم استخدام الخدمة.",
          },
          {
            t: "وصف الخدمة",
            b: "ConvAudit يوفّر أدوات تحليل وتوصيات لتحسين صفحات منتجات المتاجر الإلكترونية. قد تعتمد بعض الميزات على مزودين اختياريين (ذكاء اصطناعي، استخراج صفحات، دفع) عند تفعيلهم.",
          },
          {
            t: "الحساب والمسؤولية",
            b: "أنت مسؤول عن الحفاظ على سرية بيانات الدخول وعن النشاط الذي يتم عبر حسابك. قدّم معلومات دقيقة عند التسجيل والفوترة.",
          },
          {
            t: "الاشتراكات والدفع",
            b: "تُعرض الأسعار والباقات في صفحة التسعير. تتم المدفوعات عبر مزود الدفع المعتمد في المنصة (مثل Paymob عند تفعيله). إلغاء الاشتراك لا يعني تلقائياً استرداد المبالغ المدفوعة — راجع سياسة الاسترداد.",
          },
          {
            t: "الاستخدام المقبول",
            b: "لا تستخدم الخدمة بطريقة تنتهك القانون، أو تسيء إلى أنظمة الغير، أو تحاول الوصول غير المصرح به إلى بيانات أو واجهات غير مخصصة لك.",
          },
          {
            t: "إخلاء المسؤولية",
            b: "التقارير والتوصيات تقديرية لأغراض تحسين المنتج وليست ضماناً لنتائج مبيعات أو ترتيب بحث محدد. الخدمة تُقدَّم «كما هي» ضمن الحدود التي يسمح بها القانون المعمول به.",
          },
        ].map((item) => (
          <SurfaceCard key={item.t} className="p-5">
            <h2 className="font-display font-semibold text-sm">{item.t}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.b}</p>
          </SurfaceCard>
        ))}
        <p className="text-xs text-muted-foreground pt-2">
          هذه الصفحة نظرة عامة على شروط الاستخدام وليست بديلاً عن استشارة قانونية خاصة بنطاقك القضائي.
          راجع أيضاً{" "}
          <Link href={ROUTES.privacy} className="text-primary hover:underline">
            الخصوصية
          </Link>{" "}
          و{" "}
          <Link href={ROUTES.refundPolicy} className="text-primary hover:underline">
            سياسة الاسترداد
          </Link>
          .
        </p>
      </PageContent>
    </PageShell>
  );
}
