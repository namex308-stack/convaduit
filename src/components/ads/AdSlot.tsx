"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

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
};

/**
 * Renders an AdSense ad slot.
 *
 * The actual <ins> element uses the placeholder publisher ID
 * "ca-pub-XXXXXXXXXXXXXXXX" — replace with your real publisher ID before
 * deploying, both here and in the AdSense <script> tag in the root layout.
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
}: AdSlotProps) {
  useEffect(() => {
    try {
      // Push to AdSense queue. The script in <head> initializes the array.
      const w = window as unknown as {
        adsbygoogle?: unknown[];
      };
      w.adsbygoogle = w.adsbygoogle || [];
      (w.adsbygoogle as unknown[]).push({});
    } catch {
      // Silently fail — ads are not critical to functionality.
    }
  }, []);

  return (
    <div
      className={cn(
        "my-6 w-full overflow-hidden rounded-lg border border-dashed border-border/60 bg-muted/30 text-center",
        className
      )}
      aria-label="Sponsored content"
    >
      <span className="sr-only">{label}</span>
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
    </div>
  );
}
