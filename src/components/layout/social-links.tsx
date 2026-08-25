"use client";

import { Linkedin } from "lucide-react";
import { SOCIAL_LINKEDIN_URL, SOCIAL_X_URL } from "@/lib/seo/social";
import { useT, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_LINKS: readonly {
  id: "x" | "linkedin";
  url: string;
  labelKey: TranslationKey;
  Icon: typeof XLogo | typeof Linkedin;
}[] = [
  { id: "x", url: SOCIAL_X_URL, labelKey: "footer.social.x", Icon: XLogo },
  { id: "linkedin", url: SOCIAL_LINKEDIN_URL, labelKey: "footer.social.linkedin", Icon: Linkedin },
];

export function SocialLinks({ className }: { className?: string }) {
  const t = useT();
  return (
    <nav aria-label={t("footer.social.label")} className={cn("flex items-center gap-2", className)}>
      {SOCIAL_LINKS.map((profile) => {
        const Icon = profile.Icon;
        return (
          <a
            key={profile.id}
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(profile.labelKey)}
            className="size-9 rounded-full border border-border/60 grid place-items-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Icon className="size-4" />
          </a>
        );
      })}
    </nav>
  );
}
