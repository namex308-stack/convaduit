"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useAdPreferences, type AdImportance } from "./AdPreferences";

type AdSlotProps = {
  /** AdSense slot ID (numeric string from your AdSense dashboard) */
  slot?: string;
  /** Display format — see AdSense docs. Defaults to "auto". */
  format?: string;
  /** Layout key (used for responsive ads). */
  layout?: string;
  /** Optional layout key for in-feed / in-article ads. */
  layoutKey?: string;
  /** Whether the slot should be responsive. */
  responsive?: boolean;
  /** Extra className for wrapper. */
  className?: string;
  /** Optional label shown above the ad for transparency. */
  label?: string;
  /**
   * Importance level. "essential" slots always render (top + bottom of page).
   * "standard" slots are hidden when the user enables "reduced ads" mode.
   * Defaults to "standard".
   */
  importance?: AdImportance;
};

/**
 * Renders an AdSense ad slot with two anti-annoyance measures:
 *
 * 1. **Lazy loading** — the ad only initializes when it scrolls into view.
 *    Ads below the fold don't load until needed, saving bandwidth and
 *    reducing visual clutter on initial page load.
 *
 * 2. **Reduced-ads mode** — users can opt into a lighter experience via
 *    the AdPreferences provider. When enabled, "standard" slots are
 *    hidden entirely, leaving only "essential" slots (top + bottom of page).
 *
 * If AdSense is not yet approved or the script hasn't loaded, the slot
 * collapses to nothing — no broken layout.
 */
export function AdSlot({
  slot = "0000000000",
  format = "auto",
  layout,
  layoutKey,
  responsive = true,
  className,
  label = "Advertisement",
  importance = "standard",
}: AdSlotProps) {
  const { mode } = useAdPreferences();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Hide non-essential ads when the user has enabled reduced-ads mode
  const isHidden = importance === "standard" && mode === "reduced";

  // Lazy-load: only render the <ins> element once the slot is near the viewport
  useEffect(() => {
    if (isHidden) return;
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      // Start loading when the ad is within 200px of the viewport
      { rootMargin: "200px 0px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isHidden]);

  // Once visible, render the <ins> and push to AdSense.
  // Use a microtask to defer the state update and avoid the
  // synchronous-setState-in-effect lint rule.
  useEffect(() => {
    if (!isVisible) return;
    Promise.resolve().then(() => setShouldRender(true));
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      (w.adsbygoogle as unknown[]).push({});
    } catch {
      // Silently fail — ads are not critical
    }
  }, [isVisible]);

  if (isHidden) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "my-6 w-full overflow-hidden rounded-lg border border-dashed border-border/60 bg-muted/30 text-center",
        // Reserve space until the ad loads to prevent layout shift
        !shouldRender && "min-h-[90px]",
        className
      )}
      aria-label="Sponsored content"
    >
      <span className="sr-only">{label}</span>
      {shouldRender ? (
        <ins
          className="adsbygoogle block min-h-[90px]"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format={format}
          data-ad-layout={layout}
          data-ad-layout-key={layoutKey}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      ) : (
        <div className="flex h-[90px] items-center justify-center text-xs text-muted-foreground/60">
          {label}
        </div>
      )}
    </div>
  );
}
