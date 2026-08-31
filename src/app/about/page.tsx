"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { useLocale } from "@/lib/locale/resolve";
import {
  aboutParagraphParts,
  getAboutSections,
  getAboutSubtitle,
  getAboutTitle,
  type AboutTextPart,
} from "@/app/about/copy";

function AboutPart({ part }: { part: AboutTextPart }) {
  switch (part.type) {
    case "text":
      return part.value;
    case "link":
      return (
        <Link href={part.href} className="font-medium text-primary hover:underline">
          {part.value}
        </Link>
      );
    default: {
      const _exhaustive: never = part;
      return _exhaustive;
    }
  }
}

export default function AboutPage() {
  const { locale } = useLocale();
  const sections = getAboutSections(locale);

  return (
    <PageShell>
      <PageHeader title={getAboutTitle(locale)} subtitle={getAboutSubtitle(locale)} icon={Building2} />
      <PageContent className="max-w-3xl space-y-4">
        {sections.map((item) => (
          <SurfaceCard key={item.t} className="p-5">
            <h2 className="font-display font-semibold text-sm">{item.t}</h2>
            {item.paragraphs.map((paragraph) => (
              <p
                key={paragraph.text}
                className="mt-2 text-sm text-muted-foreground leading-relaxed"
                dir={paragraph.dir}
              >
                {aboutParagraphParts(paragraph).map((part, index) => (
                  <AboutPart key={`${part.type}-${index}`} part={part} />
                ))}
              </p>
            ))}
          </SurfaceCard>
        ))}
      </PageContent>
    </PageShell>
  );
}
