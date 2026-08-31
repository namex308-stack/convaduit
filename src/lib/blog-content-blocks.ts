import type { TranslationKey } from "@/lib/i18n";

export type BlogFaqItem = {
  qKey: TranslationKey;
  aKey: TranslationKey;
};

export type BlogContentBlock =
  | { type: "h2" | "h3" | "p"; textKey: TranslationKey }
  | {
      type: "pLinks";
      textKey: TranslationKey;
      links: readonly { href: string; labelKey: TranslationKey }[];
    }
  | { type: "ul" | "ol" | "checklist"; itemKeys: readonly TranslationKey[] }
  | {
      type: "table";
      headers: readonly TranslationKey[];
      rows: readonly (readonly TranslationKey[])[];
    }
  | { type: "faq"; items: readonly BlogFaqItem[] }
  | {
      type: "cta";
      titleKey: TranslationKey;
      bodyKey: TranslationKey;
      buttonKey: TranslationKey;
      href: string;
    };

export type BlogPostBody = {
  slug: string;
  titleKey: TranslationKey;
  content: readonly BlogContentBlock[];
};
