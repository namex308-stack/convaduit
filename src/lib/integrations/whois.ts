import "server-only";

import { isIP } from "node:net";
import { normalizeHostname, resolveSafePublicHttpUrl } from "@/lib/url-safety";
import type { WhoisIntegration } from "@/lib/types";
import { asRecord, asString, fetchJson } from "@/lib/integrations/http";
import { caughtErrorMessage, integrationBase } from "@/lib/integrations/result";

const RDAP_TIMEOUT_MS = 12_000;
const IANA_RDAP_BOOTSTRAP = "https://data.iana.org/rdap/dns.json";
const RDAP_ORG_FALLBACK = (domain: string) =>
  `https://rdap.org/domain/${encodeURIComponent(domain)}`;

/**
 * Common multi-part public suffixes so we query the registrable domain, not a subdomain.
 * Kept small on purpose — no PSL dependency.
 */
const MULTI_PART_TLDS = new Set([
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "com.au",
  "net.au",
  "org.au",
  "co.nz",
  "co.za",
  "com.br",
  "co.jp",
  "com.eg",
  "com.sa",
  "com.ae",
  "co.il",
  "com.tr",
  "com.mx",
  "co.in",
  "com.sg",
  "com.hk",
]);

export type WhoisDeps = {
  fetchJson?: typeof fetchJson;
  lookup?: typeof resolveSafePublicHttpUrl;
};

export function registrableDomain(hostname: string): string | null {
  const host = normalizeHostname(hostname);
  if (!host || isIP(host)) return null;
  const labels = host.split(".").filter(Boolean);
  if (labels.length < 2) return host;
  const last2 = labels.slice(-2).join(".");
  if (labels.length >= 3 && MULTI_PART_TLDS.has(last2)) {
    return labels.slice(-3).join(".");
  }
  return last2;
}

function tldCandidates(domain: string): string[] {
  const labels = domain.split(".").filter(Boolean);
  const out: string[] = [];
  for (let i = 1; i < labels.length; i += 1) {
    out.push(labels.slice(i).join("."));
  }
  return out;
}

function parseBootstrap(json: unknown): Map<string, string> {
  const map = new Map<string, string>();
  const body = asRecord(json);
  const services = body?.services;
  if (!Array.isArray(services)) return map;
  for (const service of services) {
    if (!Array.isArray(service) || service.length < 2) continue;
    const tlds = service[0];
    const urls = service[1];
    if (!Array.isArray(tlds) || !Array.isArray(urls)) continue;
    const base = asString(urls[0]);
    if (!base) continue;
    for (const tld of tlds) {
      const key = asString(tld)?.toLowerCase();
      if (key) map.set(key, base.replace(/\/+$/, ""));
    }
  }
  return map;
}

function eventDate(events: unknown, action: string): string | null {
  if (!Array.isArray(events)) return null;
  for (const event of events) {
    const row = asRecord(event);
    if (asString(row?.eventAction) === action) {
      const date = asString(row?.eventDate);
      if (date) {
        const iso = new Date(date).toISOString();
        return Number.isNaN(Date.parse(iso)) ? date : iso;
      }
    }
  }
  return null;
}

function vcardFn(entity: Record<string, unknown>): string | null {
  const vcard = entity.vcardArray;
  if (!Array.isArray(vcard) || vcard.length < 2 || !Array.isArray(vcard[1])) return null;
  for (const item of vcard[1]) {
    if (!Array.isArray(item) || item[0] !== "fn") continue;
    return asString(item[3]);
  }
  return null;
}

function registrarName(entities: unknown): string | null {
  if (!Array.isArray(entities)) return null;
  for (const entity of entities) {
    const row = asRecord(entity);
    if (!row) continue;
    const roles = Array.isArray(row.roles) ? row.roles.map((r) => asString(r)) : [];
    if (roles.includes("registrar")) {
      return vcardFn(row) ?? asString(row.handle);
    }
  }
  return null;
}

function nameservers(json: unknown): string[] {
  const body = asRecord(json);
  const list = body?.nameservers;
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => asString(asRecord(item)?.ldhName) ?? asString(item))
    .filter((item): item is string => Boolean(item))
    .map((name) => name.toLowerCase());
}

function statuses(json: unknown): string[] {
  const body = asRecord(json);
  const raw = body?.status;
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => asString(item)).filter((item): item is string => Boolean(item));
}

function dnssecEnabled(json: unknown): boolean | null {
  const body = asRecord(json);
  const secure = asRecord(body?.secureDNS);
  if (!secure) return null;
  if (typeof secure.delegationSigned === "boolean") return secure.delegationSigned;
  return null;
}

function parseRdap(json: unknown, domain: string, start: number): WhoisIntegration | null {
  const body = asRecord(json);
  if (!body) return null;
  const ldh = asString(body.ldhName)?.toLowerCase();
  if (!ldh && !asString(body.objectClassName)) return null;
  return {
    service: "whois",
    ...integrationBase(start, "ok"),
    domain: ldh || domain,
    registrar: registrarName(body.entities),
    registeredAt: eventDate(body.events, "registration"),
    expiresAt: eventDate(body.events, "expiration"),
    updatedAt: eventDate(body.events, "last changed") ?? eventDate(body.events, "last update of RDAP database"),
    statuses: statuses(json),
    nameservers: nameservers(json),
    dnssec: dnssecEnabled(json),
    source: "rdap",
  };
}

let bootstrapCache: Map<string, string> | null = null;

async function rdapBaseForDomain(
  domain: string,
  getJson: typeof fetchJson
): Promise<string | null> {
  if (!bootstrapCache) {
    const boot = await getJson(IANA_RDAP_BOOTSTRAP, { timeoutMs: RDAP_TIMEOUT_MS });
    bootstrapCache = boot.ok ? parseBootstrap(boot.json) : new Map();
  }
  for (const tld of tldCandidates(domain)) {
    const base = bootstrapCache.get(tld);
    if (base) return base;
  }
  return null;
}

/**
 * Free WHOIS via RDAP (IANA bootstrap + registry servers). No WhoisXML / paid WHOIS API.
 */
export async function fetchWhois(
  rawUrl: string,
  deps: WhoisDeps = {}
): Promise<WhoisIntegration> {
  const start = Date.now();
  try {
    const resolve = deps.lookup ?? resolveSafePublicHttpUrl;
    const resolved = await resolve(rawUrl);
    if (!resolved.ok) {
      return {
        service: "whois",
        ...integrationBase(start, "skipped", { skipReason: resolved.reason }),
      };
    }

    const domain = registrableDomain(resolved.hostname);
    if (!domain) {
      return {
        service: "whois",
        ...integrationBase(start, "skipped", { skipReason: "ip_literal" }),
      };
    }

    const getJson = deps.fetchJson ?? fetchJson;
    const base = await rdapBaseForDomain(domain, getJson);
    const primaryUrl = base
      ? `${base}/domain/${encodeURIComponent(domain)}`
      : RDAP_ORG_FALLBACK(domain);

    const primary = await getJson(primaryUrl, { timeoutMs: RDAP_TIMEOUT_MS });
    if (primary.ok) {
      const parsed = parseRdap(primary.json, domain, start);
      if (parsed) return parsed;
    }

    if (base) {
      const fallback = await getJson(RDAP_ORG_FALLBACK(domain), { timeoutMs: RDAP_TIMEOUT_MS });
      if (fallback.ok) {
        const parsed = parseRdap(fallback.json, domain, start);
        if (parsed) return parsed;
      }
    }

    return {
      service: "whois",
      ...integrationBase(start, "error", {
        error: primary.ok ? "RDAP response missing registration data." : primary.error,
      }),
      domain,
      source: "rdap",
    };
  } catch (err) {
    return {
      service: "whois",
      ...integrationBase(start, "error", { error: caughtErrorMessage(err) }),
    };
  }
}

/** Test-only: reset in-memory IANA bootstrap cache. */
export function resetWhoisBootstrapCache(): void {
  bootstrapCache = null;
}
