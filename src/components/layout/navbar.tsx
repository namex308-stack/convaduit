"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { getUserDisplayName, getUserInitials } from "@/lib/auth/display-user";
import { ROUTES } from "@/lib/routes";
import { useNavigateAfterAction } from "@/lib/use-navigate";
import { cn } from "@/lib/utils";
import { useT, type TranslationKey } from "@/lib/i18n";

const NAV: readonly { labelKey: TranslationKey; target: string }[] = [
  { labelKey: "navbar.nav.product", target: "features" },
  { labelKey: "navbar.nav.how", target: "how" },
  { labelKey: "navbar.nav.methodology", target: "methodology" },
  { labelKey: "navbar.nav.security", target: "security" },
  { labelKey: "navbar.nav.pricing", target: "pricing" },
];

export function Navbar() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthed, user, loading, signOut } = useAuth();
  const {
    startAuditHref,
    newAuditHref,
  } = useNavigateAfterAction();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [active, setActive] = React.useState<string | null>(null);
  const isHome = pathname === "/";
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) return;

    const panel = panelRef.current;
    const focusable = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled])'
            )
          )
        : [];

    const first = focusable()[0];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    setActive(id);
    setMobileOpen(false);
    if (!isHome) {
      router.push(`/#${id}`);
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 80);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const onStartAuditClick = () => {
    setMobileOpen(false);
  };

  const showAuthed = mounted && !loading && isAuthed && user;
  const displayName = user ? getUserDisplayName(user) : "";
  const initials = user ? getUserInitials(user) : "";
  const authReady = mounted && !loading;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none",
        scrolled
          ? "glass border-b border-border/50 shadow-[0_1px_0_0_oklch(0.21_0.004_250_/_0.04)]"
          : "bg-background/80 border-b border-transparent backdrop-blur-sm"
      )}
    >
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3"
        aria-label={t("navbar.primaryNav")}
      >
        <Link
          href="/"
          className="flex items-center min-w-0 rounded-md focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("navbar.homeAriaLabel")}
        >
          <Logo />
        </Link>

        <div className="hidden lg:flex items-center gap-0.5">
          {NAV.map((item) => (
            <Link
              key={item.target}
              href={`/#${item.target}`}
              onClick={(e) => {
                if (isHome) {
                  e.preventDefault();
                  scrollTo(item.target);
                } else {
                  setActive(item.target);
                  setMobileOpen(false);
                }
              }}
              className={cn(
                "h-9 px-3 flex items-center text-[13px] font-medium rounded-lg transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring",
                active === item.target
                  ? "text-foreground bg-accent/70"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="size-9">
            {mounted ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={t("nav.toggleTheme")}
                className="size-9 rounded-full"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            ) : null}
          </div>

          {!authReady ? (
            <span className="hidden sm:block h-9 w-[7.5rem]" aria-hidden />
          ) : showAuthed ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={ROUTES.dashboard}
                className="flex h-9 items-center gap-2 px-2 rounded-lg hover:bg-accent/60 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="size-7 rounded-full gradient-brand text-white text-xs font-bold grid place-items-center">
                  {initials}
                </span>
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {displayName.split(" ")[0]}
                </span>
              </Link>
              <Button size="sm" asChild className="h-9 px-4 font-semibold rounded-full shadow-glow">
                <Link href={newAuditHref} onClick={onStartAuditClick}>
                  {t("nav.newAudit")}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleLogout()}
                className="h-9"
              >
                {t("navbar.logout")}
              </Button>
            </div>
          ) : (
            <Button size="sm" asChild className="hidden sm:inline-flex h-9 px-4 font-semibold rounded-full shadow-glow">
              <Link href={startAuditHref} onClick={onStartAuditClick}>
                {t("navbar.startFreeAudit")}
              </Link>
            </Button>
          )}

          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            className="size-9 rounded-full lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 top-16 z-40 bg-background/70 backdrop-blur-[2px] lg:hidden"
          aria-label={t("nav.closeMenu")}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div
        id="mobile-nav"
        ref={panelRef}
        inert={mounted && !mobileOpen ? true : undefined}
        aria-hidden={!mobileOpen}
        className={cn(
          "lg:hidden relative z-50 border-b border-border/60 overflow-y-auto overscroll-contain bg-background/95 backdrop-blur motion-safe:transition-[max-height,opacity] motion-safe:duration-200",
          mobileOpen
            ? "max-h-[min(70dvh,32rem)] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="px-4 py-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.target}
              href={`/#${item.target}`}
              onClick={(e) => {
                if (isHome) {
                  e.preventDefault();
                  scrollTo(item.target);
                } else {
                  setActive(item.target);
                  setMobileOpen(false);
                }
              }}
              className="block w-full text-start px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
              tabIndex={mobileOpen ? undefined : -1}
            >
              {t(item.labelKey)}
            </Link>
          ))}
          <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
            <Button asChild className="w-full rounded-full shadow-glow">
              <Link
                href={showAuthed ? newAuditHref : startAuditHref}
                onClick={onStartAuditClick}
                tabIndex={mobileOpen ? undefined : -1}
              >
                {t("navbar.startFreeAudit")}
              </Link>
            </Button>
            {showAuthed && (
              <Button
                variant="ghost"
                onClick={() => {
                  setMobileOpen(false);
                  void handleLogout();
                }}
                className="w-full"
              >
                {t("navbar.logout")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
