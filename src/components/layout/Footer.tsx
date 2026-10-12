import Link from "next/link";
import { Wrench } from "lucide-react";
import { TOOLS } from "@/lib/tools";

/**
 * Site footer with brand, tool links, and legal links.
 * Footer sticks to the bottom via the root layout's flex column wrapper.
 */
export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wrench className="h-4 w-4" />
              </span>
              <span className="text-lg">ToolKit</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Free, private, browser-based tools for images and PDFs. No uploads.
              No sign-up. Just open and use.
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Tools
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About Us
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

        <div className="mt-8 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} ToolKit. All processing happens
            locally in your browser. We never upload your files.
          </p>
        </div>
      </div>
    </footer>
  );
}
