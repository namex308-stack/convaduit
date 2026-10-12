"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { TOOLS } from "@/lib/tools";

/**
 * Site header with primary navigation and a mobile menu (Sheet).
 * The mobile menu lists every tool so users can jump directly from any page.
 */
export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </span>
          <span className="text-lg">ToolKit</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/#tools">All Tools</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/about">About</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/privacy">Privacy</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/terms">Terms</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] overflow-y-auto">
              <SheetTitle className="px-1 text-base font-semibold">
                Navigation
              </SheetTitle>
              <div className="mt-4 flex flex-col gap-1">
                <Button asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                  <Link href="/">Home</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                  <Link href="/about">About</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                  <Link href="/privacy">Privacy Policy</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                  <Link href="/terms">Terms of Service</Link>
                </Button>
              </div>
              <div className="mt-6 border-t pt-4">
                <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  All Tools
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  {TOOLS.map((t) => (
                    <Button
                      key={t.slug}
                      asChild
                      variant="ghost"
                      className="justify-start text-sm"
                      onClick={() => setOpen(false)}
                    >
                      <Link href={`/tools/${t.slug}`}>{t.name}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
