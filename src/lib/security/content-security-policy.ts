/**
 * Content-Security-Policy for ConvAudit HTTP response headers.
 *
 * Resource inventory (browser-facing only):
 * - Scripts: Next.js chunks ('self'), inline GA init, googletagmanager.com/gtag/js,
 *   Vercel Analytics/Speed Insights (prod: /_vercel/* on 'self'; dev: va.vercel-scripts.com).
 * - Styles: Tailwind + Next experimental.inlineCss ('unsafe-inline' required).
 * - Fonts: next/font Cairo self-hosted under /_next/static ('self').
 * - Images: local assets, Firecrawl screenshots (cdn.firecrawl.dev), merchant store
 *   product images in audit reports (arbitrary https hosts), Google OAuth avatars.
 * - Connect: same-origin /api/*, Supabase Auth/REST/Realtime, GA beacons, Vercel dev scripts.
 * - Frames: none embedded (Paymob + Google OAuth use top-level redirects).
 *
 * Server-only (not in CSP): Firecrawl API, Gemini, Paymob API, Resend, Upstash.
 */

const GOOGLE_TAG_MANAGER = "https://www.googletagmanager.com";

const GOOGLE_ANALYTICS_CONNECT = [
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://analytics.google.com",
  GOOGLE_TAG_MANAGER,
  // GA4 enhanced measurement occasionally posts here.
  "https://stats.g.doubleclick.net",
] as const;

const VERCEL_DEV_SCRIPT_ORIGIN = "https://va.vercel-scripts.com";

const FIRECRAWL_CDN = "https://cdn.firecrawl.dev";

export type ContentSecurityPolicyOptions = {
  isProd: boolean;
  /** NEXT_PUBLIC_SUPABASE_URL — pins the project host in connect-src. */
  supabaseUrl?: string;
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function supabaseConnectOrigins(supabaseUrl?: string): string[] {
  const fallback = ["https://*.supabase.co", "wss://*.supabase.co"];
  const trimmed = supabaseUrl?.trim();
  if (!trimmed) return fallback;

  try {
    const { host, protocol } = new URL(trimmed);
    if (protocol !== "https:" && protocol !== "http:") return fallback;
    return unique([`https://${host}`, `wss://${host}`, ...fallback]);
  } catch {
    return fallback;
  }
}

/**
 * Builds the semicolon-separated CSP directive string applied via next.config headers.
 */
export function buildContentSecurityPolicy(
  options: ContentSecurityPolicyOptions
): string {
  const { isProd, supabaseUrl } = options;

  const scriptSrc = unique([
    "'self'",
    "'unsafe-inline'",
    ...(isProd ? [] : ["'unsafe-eval'"]),
    GOOGLE_TAG_MANAGER,
    VERCEL_DEV_SCRIPT_ORIGIN,
  ]);

  const styleSrc = ["'self'", "'unsafe-inline'"];

  const fontSrc = ["'self'", "data:"];

  const imgSrc = [
    "'self'",
    "data:",
    FIRECRAWL_CDN,
    // Audit reports render merchant product images from store CDNs (cannot enumerate).
    // Google OAuth avatars (lh3.googleusercontent.com) also rely on this.
    "https:",
  ];

  const connectSrc = unique([
    "'self'",
    ...supabaseConnectOrigins(supabaseUrl),
    ...GOOGLE_ANALYTICS_CONNECT,
    ...(isProd ? [] : [VERCEL_DEV_SCRIPT_ORIGIN]),
  ]);

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `font-src ${fontSrc.join(" ")}`,
    `img-src ${imgSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'none'",
    "frame-ancestors 'self'",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}
