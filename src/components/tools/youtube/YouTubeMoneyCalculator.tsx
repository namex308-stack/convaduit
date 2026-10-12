"use client";

import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  YOUTUBE_NICHES,
  calculateEarnings,
  formatCurrency,
  formatLargeNumber,
  type NicheCPM,
} from "@/lib/youtube";

/**
 * YouTube Money Calculator.
 *
 * Estimates ad revenue from monthly views and niche. Uses real-world
 * CPM ranges and YouTube's ~55% revenue share.
 */
export function YouTubeMoneyCalculator() {
  const [views, setViews] = useState<string>("100000");
  const [nicheName, setNicheName] = useState<string>("Tech / Software");

  const niche: NicheCPM = useMemo(
    () => YOUTUBE_NICHES.find((n) => n.niche === nicheName) ?? YOUTUBE_NICHES[0],
    [nicheName]
  );

  const earnings = useMemo(() => {
    const v = parseInt(views.replace(/[^0-9]/g, ""), 10) || 0;
    return calculateEarnings(v, niche);
  }, [views, niche]);

  const viewNumber = parseInt(views.replace(/[^0-9]/g, ""), 10) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="views">Monthly views</Label>
          <Input
            id="views"
            type="text"
            value={views}
            onChange={(e) => setViews(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 100000"
            inputMode="numeric"
          />
          <p className="text-xs text-muted-foreground">
            {formatLargeNumber(viewNumber)} views/month
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche">Content niche</Label>
          <Select value={nicheName} onValueChange={setNicheName}>
            <SelectTrigger id="niche">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {YOUTUBE_NICHES.map((n) => (
                <SelectItem key={n.niche} value={n.niche}>
                  {n.niche} (${n.cpmLow}-${n.cpmHigh} CPM)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            CPM range: ${niche.cpmLow}–${niche.cpmHigh} per 1,000 views
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Calculator className="h-3.5 w-3.5" />
          Estimated Monthly Ad Revenue
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/30 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Low estimate
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-muted-foreground">
              {formatCurrency(earnings.low)}
            </p>
          </div>
          <div className="rounded-lg bg-foreground p-4 text-center text-background">
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">
              Most likely
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {formatCurrency(earnings.mid)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              High estimate
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-muted-foreground">
              {formatCurrency(earnings.high)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/20 p-3 text-xs text-muted-foreground">
          <TrendingUp className="mt-0.5 h-3.5 w-3.5 flex-none" />
          <span>
            Based on {formatLargeNumber(viewNumber)} monthly views in the{" "}
            <strong className="text-foreground">{niche.niche}</strong> niche.
            RPM (revenue per 1K views after YouTube's {Math.round((1 - niche.rpmFactor) * 100)}% cut):{" "}
            <strong className="text-foreground">
              ${((niche.cpmLow + niche.cpmHigh) / 2 * niche.rpmFactor).toFixed(2)}–
              ${(niche.cpmHigh * niche.rpmFactor).toFixed(2)}
            </strong>.
            Does not include sponsorships, memberships, or merchandise.
          </span>
        </div>
      </div>

      {/* Annual projection */}
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <DollarSign className="h-3.5 w-3.5" />
          Projected Annual Revenue
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Low end / year</p>
            <p className="text-xl font-bold tracking-tight">
              {formatCurrency(earnings.low * 12)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">High end / year</p>
            <p className="text-xl font-bold tracking-tight">
              {formatCurrency(earnings.high * 12)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        These are rough estimates. Actual earnings depend on audience geography, watch time, ad format, season, and many other factors.
      </p>
    </div>
  );
}
