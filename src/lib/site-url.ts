/**
 * Single source of truth for this deployment's public base URL.
 *
 * Every SEO-facing surface (metadataBase, canonicals, Open Graph, Twitter,
 * sitemap, robots, JSON-LD, llms.txt) and any redirect that must match the
 * public origin should read through this module — never re-parse
 * NEXT_PUBLIC_APP_URL or hard-code localhost fallbacks elsewhere.
 *
 * Production policy:
 * - Missing NEXT_PUBLIC_APP_URL → throw (no silent localhost fallback)
 * - Vercel production / ENFORCE_PUBLIC_SITE_URL=1 → reject loopback + require https
 * - Any non-loopback production URL → require https
 * - Apex `convaudit.com` is always rewritten to the www origin
 * - Stale `*.vercel.app` values on Vercel production are rewritten to the
 *   canonical public origin (https://www.convaudit.com)
 */

const DEV_FALLBACK = "http://localhost:3000";

/** Apex production host (duplicate of www — must 308 to the canonical origin). */
export const PRODUCTION_APEX_HOST = "convaudit.com";

/** Canonical public production host. */
export const PRODUCTION_CANONICAL_HOST = "www.convaudit.com";

/** Canonical public production origin (custom domain). */
export const PRODUCTION_CANONICAL_ORIGIN = `https://${PRODUCTION_CANONICAL_HOST}`;

export function hostnameWithoutPort(host: string): string {
  return host.trim().toLowerCase().replace(/\.$/, "").replace(/:\d+$/, "");
}

export function isProductionApexHostname(host: string): boolean {
  return hostnameWithoutPort(host) === PRODUCTION_APEX_HOST;
}

export function isProductionSiteHostname(host: string): boolean {
  const hostname = hostnameWithoutPort(host);
  return hostname === PRODUCTION_APEX_HOST || hostname === PRODUCTION_CANONICAL_HOST;
}

/**
 * Resolve the Host / X-Forwarded-Host of an incoming request (no `next/server`
 * dependency — safe for client bundles that import `absoluteUrl`).
 */
export function incomingRequestHostname(
  headers: { get(name: string): string | null },
  fallbackHostname: string
): string {
  const forwarded = headers.get("x-forwarded-host");
  const raw =
    forwarded?.split(",")[0]?.trim() || headers.get("host") || fallbackHostname;
  return hostnameWithoutPort(raw);
}

/**
 * Absolute Location for a permanent apex → www redirect, or null if the host
 * is already canonical (www, localhost, preview).
 */
export function wwwRedirectLocation(
  host: string,
  pathname: string,
  search = ""
): string | null {
  if (!isProductionApexHostname(host)) return null;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${PRODUCTION_CANONICAL_ORIGIN}${path}${search}`;
}

function isLoopbackHostname(hostname: string): boolean {
  const host = hostnameWithoutPort(hostname);
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1";
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Strict public-URL checks for real hosted production (not local `next build`
 * with an explicit localhost env for smoke-testing a production bundle).
 */
function mustRejectLoopbackSiteUrl(): boolean {
  if (process.env.VERCEL_ENV === "production") return true;
  // Opt-in for non-Vercel production hosts (Docker/VPS).
  if (process.env.ENFORCE_PUBLIC_SITE_URL === "1") return true;
  return false;
}

function isVercelAppHostname(hostname: string): boolean {
  return hostnameWithoutPort(hostname).endsWith(".vercel.app");
}

function canonicalizeKnownSiteUrl(parsed: URL): string {
  parsed.protocol = "https:";
  parsed.hostname = PRODUCTION_CANONICAL_HOST;
  parsed.port = "";
  if (parsed.pathname === "/" && !parsed.search && !parsed.hash) {
    return PRODUCTION_CANONICAL_ORIGIN;
  }
  return parsed.toString().replace(/\/+$/, "");
}

/**
 * On Vercel production (or enforced public hosts), replace legacy deployment
 * hostnames with the custom-domain canonical so sitemap/robots/canonicals
 * never advertise *.vercel.app. Apex is always rewritten to www.
 */
function resolveCanonicalOrigin(parsed: URL, normalized: string): string {
  if (isProductionApexHostname(parsed.hostname) || hostnameWithoutPort(parsed.hostname) === PRODUCTION_CANONICAL_HOST) {
    return PRODUCTION_CANONICAL_ORIGIN;
  }
  if (isVercelAppHostname(parsed.hostname)) {
    if (process.env.VERCEL_ENV === "production" || process.env.ENFORCE_PUBLIC_SITE_URL === "1") {
      return PRODUCTION_CANONICAL_ORIGIN;
    }
  }
  return normalized;
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!raw) {
    if (isProductionRuntime()) {
      throw new Error(
        "NEXT_PUBLIC_APP_URL is required in production. " +
          "It sets metadataBase, canonical URLs, sitemap, robots host, Open Graph, and JSON-LD. " +
          `Set it to your public HTTPS origin (e.g. ${PRODUCTION_CANONICAL_ORIGIN}).`
      );
    }
    return DEV_FALLBACK;
  }

  const normalized = raw.replace(/\/+$/, "");

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_APP_URL is invalid (${JSON.stringify(raw)}). ` +
        `Expected an absolute URL such as ${PRODUCTION_CANONICAL_ORIGIN}.`
    );
  }

  const loopback = isLoopbackHostname(parsed.hostname);

  if (loopback && mustRejectLoopbackSiteUrl()) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must not be a localhost/loopback URL in production. " +
        "Canonical URLs, sitemap, and Open Graph would point at an unreachable host."
    );
  }

  // Production public origins must be HTTPS (explicit localhost local prod builds exempt).
  if (isProductionRuntime() && !loopback && parsed.protocol !== "https:") {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must use https:// in production " +
        `(received protocol ${parsed.protocol}).`
    );
  }

  return resolveCanonicalOrigin(parsed, normalized);
}

/**
 * Build an absolute public URL from a path (or absolute URL passthrough).
 * Paths should start with `/`. Uses getSiteUrl() — never hard-code the domain.
 * Apex `convaudit.com` URLs are rewritten to the www origin.
 */
export function absoluteUrl(pathOrUrl: string = "/"): string {
  const base = getSiteUrl();
  const trimmed = pathOrUrl.trim();
  if (!trimmed || trimmed === "/") return base;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (isProductionSiteHostname(parsed.hostname)) {
        return canonicalizeKnownSiteUrl(parsed);
      }
    } catch {
      // Fall through to slash-strip of the original value.
    }
    return trimmed.replace(/\/+$/, "");
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

/**
 * HTML canonical / OG url for a public path.
 * Home uses the official origin with a trailing slash
 * (`https://www.convaudit.com/`); other paths stay slash-normalized.
 */
export function canonicalPageUrl(pathOrUrl: string = "/"): string {
  const trimmed = pathOrUrl.trim();
  const isHome =
    !trimmed ||
    trimmed === "/" ||
    trimmed === getSiteUrl() ||
    trimmed === `${getSiteUrl()}/`;
  if (isHome) {
    const origin = getSiteUrl();
    return origin.endsWith("/") ? origin : `${origin}/`;
  }
  return absoluteUrl(trimmed);
}
