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
            b: "تحليل صفحات المنتجات العامة، مقارنة الفجوات عند توفر الباقة، وتتبع إشارات قابلية الظهور في محركات التوليد من هيكل الصفحة، مع مولد محتوى بالذكاء الاصطناعي للعناوين والأوصاف والأسئلة الشائعة.",
          },
          {
            t: "المنتج والموقع الرسمي",
            b: "المنتج هو ConvAudit. الموقع الرسمي هو نطاق الخدمة العام (convaudit.com). نقدّم تدقيق صفحات المنتجات، تحليل GEO، تقدير قابلية الظهور في محركات الذكاء الاصطناعي من إشارات الصفحة، مولّد محتوى، وتحسين التجارة الإلكترونية.",
          },
          {
            t: "المنصات والجمهور",
            b: "موجّه لتجار التجزئة الإلكترونيين على Shopify وWooCommerce وسلة وزد والمتاجر المخصصة — أي صفحة منتج عامة يمكن زحفها.",
          },
          {
            t: "حدود التحليل",
            b: "لا نطلب بيانات دخول لوحة التحكم. تحليل GEO محلي من إشارات الصفحة وليس استعلاماً حياً لـ ChatGPT أو Perplexity — لا يوجد تكامل بحث مع تلك المحركات حالياً. إن فشل Gemini لا تُسجَّل النتيجة كتحليل Gemini.",
          },
          {
            t: "نهجنا",
            b: "نركّز على صفحات عامة فقط. نوضّح حدود المنتج بشفافية، ولا نقدّم ادعاءات غير موثّقة.",
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
