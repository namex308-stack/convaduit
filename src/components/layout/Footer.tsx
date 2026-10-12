import Link from "next/link";
import { TOOLS, SITE_CONFIG } from "@/lib/tools";

/**
 * Site footer — minimal, brand-forward, with tool links organized in a grid.
 * Sticks to the bottom via the root layout's flex column wrapper.
 */
export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background"
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 5.5a9 9 0 1 0 0 13" />
                </svg>
              </span>
              <span className="text-[17px] font-semibold tracking-tight">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Free, private, browser-based tools for images and PDFs. Files
              never leave your device.
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tools
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {TOOLS.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/tools/${t.slug}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All processing
            happens locally in your browser.
          </p>
          <p className="text-muted-foreground/70">
            Built with Next.js, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}
