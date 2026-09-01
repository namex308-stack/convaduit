"use client";

import { Linkedin } from "lucide-react";
import { SOCIAL_PROFILES, type SocialProfileId } from "@/lib/seo/social";
import { useT, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.76-.31 2.89 2.89 0 0 1 3.7-2.81V9.07a6.27 6.27 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 12.68 0V8.31a8.2 8.2 0 0 0 4.76 1.52V6.7a4.84 4.84 0 0 1-1-.01z" />
    </svg>
  );
}

type SocialIcon = typeof XLogo | typeof Linkedin | typeof TikTokLogo;

function socialProfileUi(id: SocialProfileId): {
  labelKey: TranslationKey;
  Icon: SocialIcon;
} {
  switch (id) {
    case "x":
      return { labelKey: "footer.social.x", Icon: XLogo };
    case "linkedin":
      return { labelKey: "footer.social.linkedin", Icon: Linkedin };
    case "tiktok":
      return { labelKey: "footer.social.tiktok", Icon: TikTokLogo };
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function SocialLinks({ className }: { className?: string }) {
  const t = useT();
  if (SOCIAL_PROFILES.length === 0) return null;

  return (
    <nav aria-label={t("footer.social.label")} className={cn("flex items-center gap-2", className)}>
      {SOCIAL_PROFILES.map((profile) => {
        const { Icon, labelKey } = socialProfileUi(profile.id);
        return (
          <a
            key={profile.id}
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(labelKey)}
            className="size-9 rounded-full border border-border/60 grid place-items-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Icon className="size-4" />
          </a>
        );
      })}
    </nav>
  );
}
