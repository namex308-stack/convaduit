"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, User } from "lucide-react";
import { useT, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ITEMS: Array<{
  href: string;
  labelKey: TranslationKey;
  icon: typeof User;
  match: "exact" | "prefix";
}> = [
  { href: "/settings", labelKey: "settings.nav.account", icon: User, match: "exact" },
  {
    href: "/settings/billing",
    labelKey: "settings.nav.billing",
    icon: CreditCard,
    match: "prefix",
  },
  {
    href: "/settings/usage",
    labelKey: "settings.nav.usage",
    icon: BarChart3,
    match: "prefix",
  },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix"): boolean {
  switch (match) {
    case "exact":
      return pathname === href;
    case "prefix":
      return pathname === href || pathname.startsWith(`${href}/`);
    default: {
      const _exhaustive: never = match;
      return _exhaustive;
    }
  }
}

export function SettingsNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav
      aria-label={t("settings.title")}
      className="flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-muted/40 p-1 lg:flex-col lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0"
    >
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.match);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors lg:h-auto lg:px-3 lg:py-2.5",
              active
                ? "bg-card text-foreground shadow-sm lg:bg-primary/10 lg:text-primary lg:shadow-none"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground lg:hover:bg-accent"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="whitespace-nowrap">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SettingsFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[220px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-[88px]">
        <SettingsNav />
      </div>
      <div className="mt-5 min-w-0 space-y-6 lg:mt-0">{children}</div>
    </div>
  );
}
