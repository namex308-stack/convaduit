import "server-only";

import { getPagespeedApiKey } from "@/lib/env";
import { resolveSafePublicHttpUrl } from "@/lib/url-safety";
import type { PageSpeedIntegration } from "@/lib/types";
import { asFiniteNumber, asRecord, asString, fetchJson } from "@/lib/integrations/http";
import { caughtErrorMessage, integrationBase } from "@/lib/integrations/result";

const PAGESPEED_TIMEOUT_MS = 50_000;
const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export type PageSpeedDeps = {
  fetchJson?: typeof fetchJson;
  getApiKey?: typeof getPagespeedApiKey;
  lookup?: typeof resolveSafePublicHttpUrl;
};

function categoryScore(lighthouse: Record<string, unknown> | null, id: string): number | null {
  const categories = asRecord(lighthouse?.categories);
  const category = asRecord(categories?.[id]);
  const score = asFiniteNumber(category?.score);
  if (score == null) return null;
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

function auditDisplay(lighthouse: Record<string, unknown> | null, id: string): string | null {
  const audits = asRecord(lighthouse?.audits);
  const audit = asRecord(audits?.[id]);
  return asString(audit?.displayValue);
}

function auditNumeric(lighthouse: Record<string, unknown> | null, id: string): number | null {
  const audits = asRecord(lighthouse?.audits);
  const audit = asRecord(audits?.[id]);
  return asFiniteNumber(audit?.numericValue);
}

/**
 * Google PageSpeed Insights API (free; key optional for higher quota).
 * Analysis runs on Google's servers — we only send URLs that passed SSRF checks.
 */
export async function fetchPageSpeed(
  rawUrl: string,
  deps: PageSpeedDeps = {}
): Promise<PageSpeedIntegration> {
  const start = Date.now();
  try {
    const resolve = deps.lookup ?? resolveSafePublicHttpUrl;
    const resolved = await resolve(rawUrl);
    if (!resolved.ok) {
      return {
        service: "pagespeed",
        ...integrationBase(start, "skipped", { skipReason: resolved.reason }),
      };
    }

    const params = new URLSearchParams({
      url: resolved.href,
      strategy: "mobile",
    });
    for (const category of ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"] as const) {
      params.append("category", category);
    }
    const key = (deps.getApiKey ?? getPagespeedApiKey)();
    if (key) params.set("key", key);

    const getJson = deps.fetchJson ?? fetchJson;
    const res = await getJson(`${PAGESPEED_ENDPOINT}?${params.toString()}`, {
      timeoutMs: PAGESPEED_TIMEOUT_MS,
    });
    if (!res.ok) {
      return {
        service: "pagespeed",
        ...integrationBase(start, "error", { error: res.error }),
        strategy: "mobile",
      };
    }

    const body = asRecord(res.json);
    const lighthouse = asRecord(body?.lighthouseResult);
    if (!lighthouse) {
      return {
        service: "pagespeed",
        ...integrationBase(start, "error", { error: "PageSpeed response missing lighthouseResult." }),
        strategy: "mobile",
      };
    }

    const cls = auditNumeric(lighthouse, "cumulative-layout-shift");

    return {
      service: "pagespeed",
      ...integrationBase(start, "ok"),
      strategy: "mobile",
      performance: categoryScore(lighthouse, "performance"),
      accessibility: categoryScore(lighthouse, "accessibility"),
      bestPractices: categoryScore(lighthouse, "best-practices"),
      seo: categoryScore(lighthouse, "seo"),
      lcp: auditDisplay(lighthouse, "largest-contentful-paint"),
      cls: cls != null ? Math.round(cls * 1000) / 1000 : null,
      ttfb: auditDisplay(lighthouse, "server-response-time"),
    };
  } catch (err) {
    return {
      service: "pagespeed",
      ...integrationBase(start, "error", { error: caughtErrorMessage(err) }),
    };
  }
}
