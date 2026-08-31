import { SITE_OFFICIAL_DESCRIPTION } from "@/lib/seo/site-copy";
import { ROUTES } from "@/lib/routes";

export const ABOUT_TITLE = "من نحن";

export const ABOUT_SUBTITLE =
  "ConvAudit — منصة تدقيق وتحليل متاجر إلكترونية بالذكاء الاصطناعي: SEO، CRO، GEO، تحليلات المتجر، وإشارات الثقة.";

/** Unique public meta description — factual, no invented metrics. */
export const ABOUT_DESCRIPTION =
  "ConvAudit: تدقيق وتحليل متاجر إلكترونية بالذكاء الاصطناعي للخليج (GCC) — SEO، CRO، GEO، تحليلات، ومنافسين. Shopify وسلة وزد وWooCommerce. https://www.convaudit.com";

export type AboutInlineLink = {
  phrase: string;
  href: string;
};

export type AboutParagraph = {
  text: string;
  dir?: "ltr" | "rtl";
  links?: readonly AboutInlineLink[];
};

export type AboutSection = {
  t: string;
  paragraphs: readonly AboutParagraph[];
};

export const ABOUT_SECTIONS: readonly AboutSection[] = [
  {
    t: "ما هو ConvAudit؟",
    paragraphs: [
      { text: SITE_OFFICIAL_DESCRIPTION, dir: "ltr" },
      {
        text: "ConvAudit منصة ويب لتدقيق المتاجر الإلكترونية. نقرأ صفحة منتج عامة ونُرجع درجات وتوصيات مرتبة عبر SEO والتحويل وظهور الذكاء الاصطناعي وإشارات الثقة. الموقع الرسمي هو https://www.convaudit.com.",
        links: [{ phrase: "تدقيق المتاجر الإلكترونية", href: ROUTES.docs }],
      },
    ],
  },
  {
    t: "لمن؟",
    paragraphs: [
      {
        text: "لمن يدير متجراً إلكترونياً في الخليج (السعودية، الإمارات، قطر، الكويت، البحرين، عُمان) ويريد تدقيق موقع المتجر الإلكتروني على مستوى صفحة المنتج: تجار Shopify وWooCommerce وسلة وزد وMagento والمتاجر المخصصة. الجمهور هو بائع التجزئة الإلكتروني، لا وكالة تدّعي أرقاماً غير موثّقة.",
        links: [{ phrase: "تدقيق موقع المتجر الإلكتروني", href: "/#how" }],
      },
    ],
  },
  {
    t: "المشكلة التي نحلها",
    paragraphs: [
      {
        text: "صفحة المنتج قد تكون ضعيفة في البحث، غير واضحة للشراء، أو صعبة الاقتباس لمساعدات الذكاء الاصطناعي. ConvAudit يُظهر الفجوات في الصفحة التي أرسلتها — دون ادّعاء عدد عملاء أو نسبة مبيعات.",
      },
    ],
  },
  {
    t: "كيف يعمل",
    paragraphs: [
      {
        text: "تلصق رابط صفحة منتج متاحة للعامة. نقرأ المحتوى الظاهر (العنوان، الوصف، السعر، الصور، الأسئلة الشائعة، Schema عند وجوده). ثم تُحسب درجات التحويل وSEO وGEO/الظهور في الذكاء الاصطناعي والثقة، مع توصيات مرتبة. لا نطلب بيانات دخول لوحة التحكم.",
        links: [{ phrase: "توصيات مرتبة", href: ROUTES.docs }],
      },
    ],
  },
  {
    t: "SEO للمتاجر الإلكترونية",
    paragraphs: [
      {
        text: "تدقيق SEO للمتاجر الإلكترونية هنا مراجعة لعناصر صفحة المنتج: العنوان، الوصف التعريفي، Schema، الصور، والوضوح للبحث. على Shopify وWooCommerce ينطبق نفس التدقيق على الصفحة العامة (حالات استخدام شائعة لـ Shopify وWooCommerce)، وليس تثبيتاً لتطبيق المنصة.",
        links: [
          {
            phrase: "تدقيق SEO للمتاجر الإلكترونية",
            href: ROUTES.blogPost("product-schema-markup"),
          },
        ],
      },
    ],
  },
  {
    t: "تحليل التحويل",
    paragraphs: [
      {
        text: "تحليل التحويل (CRO) ينظر إلى ما يساعد المتسوق على فهم العرض والشراء: وضوح القيمة، السعر، ودعوة الإجراء في HTML. هذا تحسين التحويل للمتاجر الإلكترونية على مستوى الصفحة — توصيات لنمو المبيعات، وليست ضمانة لمعدل تحويل.",
        links: [
          {
            phrase: "تحسين التحويل للمتاجر الإلكترونية",
            href: ROUTES.blogPost("conversion-rate-optimization"),
          },
        ],
      },
    ],
  },
  {
    t: "تحليل صفحات المنتج والصفحات المقصودة",
    paragraphs: [
      {
        text: "تحليل صفحة المنتج وتحليل الصفحة المقصودة (landing page) يركز على العنوان، الوصف، الصور، alt، والهيكل — مع تحليل تجربة المستخدم الظاهر في HTML العام. تحسين صفحة المنتج هدفه أوضح عرض وأسهل شراء، دون ادعاء نمو مبيعات مضمون.",
        links: [
          {
            phrase: "تحليل صفحة المنتج",
            href: ROUTES.blogPost("product-schema-markup"),
          },
          { phrase: "تحليل الصفحة المقصودة", href: ROUTES.docs },
        ],
      },
    ],
  },
  {
    t: "الظهور في الذكاء الاصطناعي وGEO",
    paragraphs: [
      {
        text: "الظهور في الذكاء الاصطناعي في ConvAudit يعني تقدير جاهزية الصفحة للاقتباس من إشاراتها بعد الزحف. GEO (تحسين محركات التوليد) هنا تحليل محلي: الأسئلة والأجوبة، Schema، والحقائق القابلة للاقتباس. الدرجات المرتبطة بـ ChatGPT أو Perplexity أو Google AI تقديرات من تلك الإشارات — وليست استعلاماً حياً داخل تلك المحركات، ولا يوجد تكامل بحث معها حالياً.",
        links: [
          {
            phrase: "الظهور في الذكاء الاصطناعي",
            href: ROUTES.blogPost("geo-ai-visibility-guide"),
          },
          { phrase: "GEO (تحسين محركات التوليد)", href: "/#methodology" },
        ],
      },
    ],
  },
  {
    t: "إشارات الثقة",
    paragraphs: [
      {
        text: "تدقيق إشارات الثقة يراجع ما يظهر للمتسوق قبل الدفع: السياسات، التقييمات إن وُجدت، والوضوح حول المتجر أو الضمان — كما هو ظاهر في الصفحة العامة.",
        links: [
          {
            phrase: "إشارات الثقة",
            href: ROUTES.blogPost("trust-signals-ecommerce"),
          },
        ],
      },
    ],
  },
  {
    t: "تحليل المنافسين",
    paragraphs: [
      {
        text: "تحليل المنافسين اختياري حسب الباقة: مقارنة فجوات صفحة منتجك بصفحات عامة لمنافسين تختارهم. لا نُخطر المنافسين، ولا نختلق ترتيب سوق.",
        links: [
          {
            phrase: "تحليل المنافسين",
            href: ROUTES.blogPost("competitor-analysis-strategy"),
          },
        ],
      },
    ],
  },
  {
    t: "المنصات المدعومة",
    paragraphs: [
      {
        text: "أي صفحة منتج عامة يمكن زحفها: Shopify، WooCommerce، سلة، زد، Magento، والمتاجر المخصصة. نقرأ HTML المعروض؛ لا يلزم تثبيت تطبيق منصة.",
        links: [{ phrase: "Shopify، WooCommerce، سلة، زد", href: "/#platforms" }],
      },
    ],
  },
  {
    t: "حدود التحليل",
    paragraphs: [
      {
        text: "صفحات عامة فقط. إن فشل Gemini لا تُنسب النتيجة إلى Gemini. مولّد العناوين والأوصاف والأسئلة الشائعة يتوفر حسب الباقة ومزوّد الذكاء الاصطناعي عند ضبطه. لا شهادات أو تقييمات عملاء مخترعة في هذه الصفحة.",
        links: [
          {
            phrase: "مولّد العناوين والأوصاف والأسئلة الشائعة",
            href: `${ROUTES.docs}#2`,
          },
        ],
      },
    ],
  },
];

export type AboutTextPart =
  | { type: "text"; value: string }
  | { type: "link"; href: string; value: string };

export function aboutParagraphParts(paragraph: AboutParagraph): AboutTextPart[] {
  const links = paragraph.links ?? [];
  let parts: AboutTextPart[] = [{ type: "text", value: paragraph.text }];
  for (const link of links) {
    const next: AboutTextPart[] = [];
    for (const part of parts) {
      if (part.type !== "text") {
        next.push(part);
        continue;
      }
      const index = part.value.indexOf(link.phrase);
      if (index < 0) {
        next.push(part);
        continue;
      }
      const before = part.value.slice(0, index);
      const after = part.value.slice(index + link.phrase.length);
      if (before) next.push({ type: "text", value: before });
      next.push({ type: "link", href: link.href, value: link.phrase });
      if (after) next.push({ type: "text", value: after });
    }
    parts = next;
  }
  return parts;
}

export function collectAboutInternalLinks(): readonly AboutInlineLink[] {
  return ABOUT_SECTIONS.flatMap((section) =>
    section.paragraphs.flatMap((paragraph) => paragraph.links ?? [])
  );
}

export function getAboutTitle(_locale?: string): string {
  return ABOUT_TITLE;
}

export function getAboutSubtitle(_locale?: string): string {
  return ABOUT_SUBTITLE;
}

export function getAboutDescription(_locale?: string): string {
  return ABOUT_DESCRIPTION;
}

export function getAboutSections(_locale?: string): readonly AboutSection[] {
  return ABOUT_SECTIONS;
}
