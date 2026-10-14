"use client";

import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Ad-block detector.
 *
 * Uses a bait-element technique: we create a fake ad element with a class
 * name that ad blockers target (e.g. "adsbox", "ad-banner"), append it to
 * the DOM, and check if it was hidden. If it was, an ad blocker is active.
 *
 * When an ad blocker is detected, we show a polite, dismissible banner
 * asking the user to whitelist Convaudit. The banner:
 *  - Only appears once per session (sessionStorage flag)
 *  - Is dismissible (X button)
 *  - Doesn't block content
 *  - Explains why ads matter (they keep the tools free)
 */
export function AdBlockDetector() {
  const [blocked, setBlocked] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't run on the server
    if (typeof window === "undefined") return;

    // Check if the user already dismissed the banner this session.
    // Use a microtask to defer setState and avoid the synchronous-setState-in-effect rule.
    try {
      if (sessionStorage.getItem("convaudit-adblock-dismissed") === "1") {
        Promise.resolve().then(() => setDismissed(true));
        return;
      }
    } catch {
      // sessionStorage may be unavailable
    }

    // Bait element — uses class names that ad blockers target
    const bait = document.createElement("div");
    bait.className = "adsbox ad-banner ad-placement pub_300x250";
    bait.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;";
    bait.innerHTML = "&nbsp;";
    document.body.appendChild(bait);

    // Check after a short delay (ad blockers run synchronously on insertion)
    const timer = setTimeout(() => {
      const computed = window.getComputedStyle(bait);
      const isHidden =
        bait.offsetHeight === 0 ||
        bait.offsetParent === null ||
        computed.display === "none" ||
        computed.visibility === "hidden" ||
        computed.opacity === "0";

      if (isHidden) {
        setBlocked(true);
      }
      bait.remove();
    }, 100);

    return () => {
      clearTimeout(timer);
      bait.remove();
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("convaudit-adblock-dismissed", "1");
    } catch {
      // Silently fail
    }
  };

  if (!blocked || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-in slide-in-from-bottom-4">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-lg">
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Heart className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Ad blocker detected</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Ads keep Convaudit&apos;s tools free. If you enjoy using them,
              please whitelist convaudit.com in your ad blocker — or use our
              built-in reduced-ads mode.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleDismiss}>
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
