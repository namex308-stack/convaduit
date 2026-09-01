import "server-only";

import { getWebRiskApiKey } from "@/lib/env";
import { resolveSafePublicHttpUrl } from "@/lib/url-safety";
import type { WebRiskIntegration } from "@/lib/types";
import { asRecord, asString, fetchJson } from "@/lib/integrations/http";
import { caughtErrorMessage, integrationBase } from "@/lib/integrations/result";

const WEB_RISK_TIMEOUT_MS = 8_000;
const WEB_RISK_ENDPOINT = "https://webrisk.googleapis.com/v1/uris:search";

/** Lookup API threat types (free-tier uris.search). Never uses the paid Update API. */
export const WEB_RISK_THREAT_TYPES = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "UNWANTED_SOFTWARE",
] as const;

export type WebRiskDeps = {
  fetchJson?: typeof fetchJson;
  getApiKey?: typeof getWebRiskApiKey;
  lookup?: typeof resolveSafePublicHttpUrl;
};

function parseThreatTypes(json: unknown): string[] {
  const body = asRecord(json);
  const threat = asRecord(body?.threat);
  if (!threat) return [];
  const raw = threat.threatTypes;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item));
}

/**
 * Google Web Risk Lookup API (`uris.search`) — free for the first 100k calls/month.
 * Skipped when no API key is configured. Does not call paid Update/hashes APIs.
 */
export async function fetchWebRisk(
  rawUrl: string,
  deps: WebRiskDeps = {}
): Promise<WebRiskIntegration> {
  const start = Date.now();
  try {
    const key = (deps.getApiKey ?? getWebRiskApiKey)();
    if (!key) {
      return {
        service: "web_risk",
        ...integrationBase(start, "skipped", { skipReason: "not_configured" }),
      };
    }

    const resolve = deps.lookup ?? resolveSafePublicHttpUrl;
    const resolved = await resolve(rawUrl);
    if (!resolved.ok) {
      return {
        service: "web_risk",
        ...integrationBase(start, "skipped", { skipReason: resolved.reason }),
      };
    }

    const params = new URLSearchParams({ key, uri: resolved.href });
    for (const threatType of WEB_RISK_THREAT_TYPES) {
      params.append("threatTypes", threatType);
    }

    const getJson = deps.fetchJson ?? fetchJson;
    const res = await getJson(`${WEB_RISK_ENDPOINT}?${params.toString()}`, {
      timeoutMs: WEB_RISK_TIMEOUT_MS,
    });
    if (!res.ok) {
      return {
        service: "web_risk",
        ...integrationBase(start, "error", { error: res.error }),
      };
    }

    const threatTypes = parseThreatTypes(res.json);
    return {
      service: "web_risk",
      ...integrationBase(start, "ok"),
      threatTypes,
      isSafe: threatTypes.length === 0,
    };
  } catch (err) {
    return {
      service: "web_risk",
      ...integrationBase(start, "error", { error: caughtErrorMessage(err) }),
    };
  }
}
