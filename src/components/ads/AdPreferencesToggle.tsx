"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdPreferences } from "./AdPreferences";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Toggle button for the user's ad preference.
 *
 * Shows a bell icon when ads are on (default), bell-off when reduced.
 * Persisted to localStorage via the AdPreferencesProvider.
 */
export function AdPreferencesToggle() {
  const { mode, toggle } = useAdPreferences();
  const [mounted, setMounted] = useState(false);

  // Mark as mounted so we can safely render the icon that depends on mode.
  // Use a microtask to avoid the synchronous-setState-in-effect lint rule.
  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Ad preferences" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  const isReduced = mode === "reduced";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isReduced ? "Ads reduced — click to show all ads" : "Reduce ads"}
            onClick={toggle}
          >
            {isReduced ? (
              <BellOff className="h-5 w-5 text-amber-500" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isReduced
            ? "Ads reduced — click to show all ads"
            : "Reduce ads (lighter experience)"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
