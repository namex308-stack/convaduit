import "server-only";

export type ServiceKey =
  | "supabase"
  | "google"
  | "gemini"
  | "groq"
  | "firecrawl"
  | "paymob"
  | "redis";

export interface ServiceStatus {
  key: ServiceKey;
  name: string;
  configured: boolean;
  missing: string[];
  docs: string;
}

type KnownEnvVar =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "GEMINI_API_KEY"
  | "GROQ_API_KEY"
  | "FIRECRAWL_API_KEY"
  | "PAYMOB_API_KEY"
  | "PAYMOB_INTEGRATION_ID"
  | "PAYMOB_IFRAME_ID"
  | "PAYMOB_HMAC_SECRET"
  | "PAYMOB_MODE"
  | "UPSTASH_REDIS_REST_URL"
  | "UPSTASH_REDIS_REST_TOKEN"
  | "GOOGLE_API_KEY"
  | "GOOGLE_PAGESPEED_API_KEY"
  | "GOOGLE_WEB_RISK_API_KEY";

const CHECKS: Record<
  ServiceKey,
  { name: string; vars: KnownEnvVar[]; docs: string; optional?: boolean }
> = {
  supabase: {
    name: "Supabase",
    vars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    docs: "https://supabase.com/dashboard/project/_/settings/api",
  },
  google: {
    // Google OAuth is enabled inside Supabase Auth — these Next.js vars are not required.
    name: "Google OAuth (via Supabase)",
    vars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    docs: "https://supabase.com/dashboard/project/_/auth/providers",
  },
  gemini: {
    name: "Gemini AI",
    vars: ["GEMINI_API_KEY"],
    docs: "https://aistudio.google.com/app/apikey",
  },
  groq: {
    name: "Groq AI (Gemini fallback)",
    vars: ["GROQ_API_KEY"],
    docs: "https://console.groq.com/keys",
    optional: true,
  },
  firecrawl: {
    name: "Firecrawl",
    vars: ["FIRECRAWL_API_KEY"],
    docs: "https://www.firecrawl.dev/",
  },
  paymob: {
    name: "Paymob",
    vars: [
      "PAYMOB_API_KEY",
      "PAYMOB_INTEGRATION_ID",
      "PAYMOB_IFRAME_ID",
      "PAYMOB_HMAC_SECRET",
      "PAYMOB_MODE",
    ],
    docs: "https://docs.paymob.com/",
  },
  redis: {
    name: "Upstash Redis",
    vars: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    docs: "https://console.upstash.com/",
  },
};

/**
 * Static process.env reads so Next.js/Turbopack includes these server vars
 * in the serverless function env (dynamic `process.env[name]` is unreliable).
 */
function readKnownEnv(name: KnownEnvVar): string | undefined {
  switch (name) {
    case "NEXT_PUBLIC_SUPABASE_URL":
      return process.env.NEXT_PUBLIC_SUPABASE_URL;
    case "NEXT_PUBLIC_SUPABASE_ANON_KEY":
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    case "SUPABASE_SERVICE_ROLE_KEY":
      return process.env.SUPABASE_SERVICE_ROLE_KEY;
    case "GEMINI_API_KEY":
      return process.env.GEMINI_API_KEY;
    case "GROQ_API_KEY":
      return process.env.GROQ_API_KEY;
    case "FIRECRAWL_API_KEY":
      return process.env.FIRECRAWL_API_KEY;
    case "PAYMOB_API_KEY":
      return process.env.PAYMOB_API_KEY;
    case "PAYMOB_INTEGRATION_ID":
      return process.env.PAYMOB_INTEGRATION_ID;
    case "PAYMOB_IFRAME_ID":
      return process.env.PAYMOB_IFRAME_ID;
    case "PAYMOB_HMAC_SECRET":
      return process.env.PAYMOB_HMAC_SECRET;
    case "PAYMOB_MODE":
      return process.env.PAYMOB_MODE;
    case "UPSTASH_REDIS_REST_URL":
      return process.env.UPSTASH_REDIS_REST_URL;
    case "UPSTASH_REDIS_REST_TOKEN":
      return process.env.UPSTASH_REDIS_REST_TOKEN;
    case "GOOGLE_API_KEY":
      return process.env.GOOGLE_API_KEY;
    case "GOOGLE_PAGESPEED_API_KEY":
      return process.env.GOOGLE_PAGESPEED_API_KEY;
    case "GOOGLE_WEB_RISK_API_KEY":
      return process.env.GOOGLE_WEB_RISK_API_KEY;
    default: {
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}

export function getServiceStatus(key: ServiceKey): ServiceStatus {
  const cfg = CHECKS[key];
  const missing = cfg.vars.filter((v) => !readKnownEnv(v)?.trim());
  return {
    key,
    name: cfg.name,
    configured: missing.length === 0,
    missing,
    docs: cfg.docs,
  };
}

export function getAllServices(): ServiceStatus[] {
  return (Object.keys(CHECKS) as ServiceKey[]).map(getServiceStatus);
}

export function isFullyConfigured(): boolean {
  return (Object.keys(CHECKS) as ServiceKey[])
    .filter((key) => !CHECKS[key].optional)
    .every((key) => getServiceStatus(key).configured);
}

/** Optional PageSpeed Insights key. The API also works without a key (shared quota). */
export function getPagespeedApiKey(): string | undefined {
  return (
    readKnownEnv("GOOGLE_PAGESPEED_API_KEY")?.trim() ||
    readKnownEnv("GOOGLE_API_KEY")?.trim() ||
    undefined
  );
}

/** Optional Web Risk Lookup API key. Missing key skips the check — never fails the audit. */
export function getWebRiskApiKey(): string | undefined {
  return (
    readKnownEnv("GOOGLE_WEB_RISK_API_KEY")?.trim() ||
    readKnownEnv("GOOGLE_API_KEY")?.trim() ||
    undefined
  );
}

export function requireEnv(key: string): string {
  const known = key as KnownEnvVar;
  const fromKnown =
    key in {
      NEXT_PUBLIC_SUPABASE_URL: 1,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 1,
      SUPABASE_SERVICE_ROLE_KEY: 1,
      GEMINI_API_KEY: 1,
      GROQ_API_KEY: 1,
      FIRECRAWL_API_KEY: 1,
      PAYMOB_API_KEY: 1,
      PAYMOB_INTEGRATION_ID: 1,
      PAYMOB_IFRAME_ID: 1,
      PAYMOB_HMAC_SECRET: 1,
      PAYMOB_MODE: 1,
      UPSTASH_REDIS_REST_URL: 1,
      UPSTASH_REDIS_REST_TOKEN: 1,
      GOOGLE_API_KEY: 1,
      GOOGLE_PAGESPEED_API_KEY: 1,
      GOOGLE_WEB_RISK_API_KEY: 1,
    }
      ? readKnownEnv(known)?.trim()
      : undefined;
  const v = fromKnown || process.env[key]?.trim();
  if (!v) throw new Error(`Missing required environment variable: ${key}`);
  return v;
}
