"use client";

import { Building2 } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        title="من نحن"
        subtitle="ConvAudit — مستشار نمو بالذكاء الاصطناعي لمتاجر التجارة الإلكترونية."
        icon={Building2}
      />
      <PageContent className="max-w-3xl space-y-4">
        {[
          {
            t: "مهمتنا",
            b: "نساعد المتاجر الإلكترونية على اكتشاف أسباب مغادرة العملاء، وتحسين صفحات المنتجات عبر التحويل وSEO وGEO والثقة — بتوصيات مرتبة وقابلة للتنفيذ.",
          },
          {
            t: "ماذا نقدّم",
            b: "تحليل صفحات المنتجات العامة، مقارنة الفجوات، وتتبع الظهور في محركات التوليد، مع مولد محتوى بالذكاء الاصطناعي للعناوين والأوصاف والأسئلة الشائعة.",
          },
          {
            t: "نهجنا",
            b: "نركّز على صفحات عامة فقط دون طلب بيانات دخول لوحة التحكم. نوضّح حدود المنتج بشفافية، ولا نقدّم ادعاءات غير موثّقة.",
          },
        ].map((item) => (
          <SurfaceCard key={item.t} className="p-5">
            <h2 className="font-display font-semibold text-sm">{item.t}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.b}</p>
          </SurfaceCard>
        ))}
      </PageContent>
    </PageShell>
  );
}
