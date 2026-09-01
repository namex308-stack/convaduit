import "server-only";

import { isIP } from "node:net";
import { isBlockedIpAddress, resolveSafePublicHttpUrl } from "@/lib/url-safety";
import type { IpGeoIntegration } from "@/lib/types";
import { asFiniteNumber, asRecord, asString, fetchJson } from "@/lib/integrations/http";
import { caughtErrorMessage, integrationBase } from "@/lib/integrations/result";

const GEO_TIMEOUT_MS = 8_000;
const GEOJS_URL = (ip: string) => `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`;
const IPWHOIS_URL = (ip: string) => `https://ipwho.is/${encodeURIComponent(ip)}`;

export type IpGeoDeps = {
  fetchJson?: typeof fetchJson;
  lookup?: typeof resolveSafePublicHttpUrl;
};

function pickPublicIp(
  addresses: Array<{ address: string; family: number }>
): string | null {
  const ipv4 = addresses.find((row) => row.family === 4 && !isBlockedIpAddress(row.address));
  if (ipv4) return ipv4.address;
  const ipv6 = addresses.find((row) => row.family === 6 && !isBlockedIpAddress(row.address));
  return ipv6?.address ?? null;
}

function fromGeoJs(ip: string, json: unknown, start: number): IpGeoIntegration | null {
  const body = asRecord(json);
  if (!asString(body?.country) && !asString(body?.country_code)) return null;
  const asn = asFiniteNumber(body?.asn);
  return {
    service: "ip_geo",
    ...integrationBase(start, "ok"),
    ip,
    country: asString(body?.country) ?? undefined,
    countryCode: asString(body?.country_code) ?? undefined,
    city: asString(body?.city) ?? undefined,
    region: asString(body?.region) ?? undefined,
    organization: asString(body?.organization_name) ?? asString(body?.organization) ?? undefined,
    timezone: asString(body?.timezone) ?? undefined,
    asn: asn != null ? String(asn) : asString(body?.asn) ?? undefined,
    provider: "geojs",
  };
}

function fromIpWhois(ip: string, json: unknown, start: number): IpGeoIntegration | null {
  const body = asRecord(json);
  if (body?.success === false) return null;
  if (!asString(body?.country) && !asString(body?.country_code)) return null;
  const connection = asRecord(body?.connection);
  return {
    service: "ip_geo",
    ...integrationBase(start, "ok"),
    ip,
    country: asString(body?.country) ?? undefined,
    countryCode: asString(body?.country_code) ?? undefined,
    city: asString(body?.city) ?? undefined,
    region: asString(body?.region) ?? undefined,
    organization: asString(connection?.org) ?? asString(body?.org) ?? undefined,
    timezone: asString(asRecord(body?.timezone)?.id) ?? asString(body?.timezone) ?? undefined,
    asn: asString(connection?.asn) ?? (asFiniteNumber(connection?.asn) != null ? String(connection?.asn) : undefined),
    provider: "ipwhois",
  };
}

/**
 * Free IP geolocation: GeoJS (no key) with ipwho.is fallback (no key, 10k/month).
 * Resolves the audit hostname via SSRF-safe DNS, then queries the geo API with that public IP.
 */
export async function fetchIpGeo(
  rawUrl: string,
  deps: IpGeoDeps = {}
): Promise<IpGeoIntegration> {
  const start = Date.now();
  try {
    const resolve = deps.lookup ?? resolveSafePublicHttpUrl;
    const resolved = await resolve(rawUrl);
    if (!resolved.ok) {
      return {
        service: "ip_geo",
        ...integrationBase(start, "skipped", { skipReason: resolved.reason }),
      };
    }

    const ip = pickPublicIp(resolved.addresses);
    if (!ip || isIP(ip) === 0 || isBlockedIpAddress(ip)) {
      return {
        service: "ip_geo",
        ...integrationBase(start, "error", { error: "No public IP to geolocate." }),
      };
    }

    const getJson = deps.fetchJson ?? fetchJson;
    const geojs = await getJson(GEOJS_URL(ip), { timeoutMs: GEO_TIMEOUT_MS });
    if (geojs.ok) {
      const parsed = fromGeoJs(ip, geojs.json, start);
      if (parsed) return parsed;
    }

    const fallback = await getJson(IPWHOIS_URL(ip), { timeoutMs: GEO_TIMEOUT_MS });
    if (fallback.ok) {
      const parsed = fromIpWhois(ip, fallback.json, start);
      if (parsed) return parsed;
    }

    return {
      service: "ip_geo",
      ...integrationBase(start, "error", {
        error: geojs.ok ? "Geo lookup returned no location." : geojs.error,
      }),
      ip,
    };
  } catch (err) {
    return {
      service: "ip_geo",
      ...integrationBase(start, "error", { error: caughtErrorMessage(err) }),
    };
  }
}
