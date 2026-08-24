import "server-only";

export type ServiceKey =
  | "supabase"
  | "google"
  | "gemini"
  | "firecrawl"
  | "kashier"
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
  | "FIRECRAWL_API_KEY"
  | "KASHIER_MERCHANT_ID"
  | "KASHIER_API_KEY"
  | "KASHIER_SECRET_KEY"
  | "KASHIER_MODE"
  | "UPSTASH_REDIS_REST_URL"
  | "UPSTASH_REDIS_REST_TOKEN";

const CHECKS: Record<ServiceKey, { name: string; vars: KnownEnvVar[]; docs: string }> = {
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
  firecrawl: {
    name: "Firecrawl",
    vars: ["FIRECRAWL_API_KEY"],
    docs: "https://www.firecrawl.dev/",
  },
  kashier: {
    name: "Kashier",
    vars: ["KASHIER_MERCHANT_ID", "KASHIER_API_KEY", "KASHIER_SECRET_KEY", "KASHIER_MODE"],
    docs: "https://docs.kashier.io/",
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
    case "FIRECRAWL_API_KEY":
      return process.env.FIRECRAWL_API_KEY;
    case "KASHIER_MERCHANT_ID":
      return process.env.KASHIER_MERCHANT_ID;
    case "KASHIER_API_KEY":
      return process.env.KASHIER_API_KEY;
    case "KASHIER_SECRET_KEY":
      return process.env.KASHIER_SECRET_KEY;
    case "KASHIER_MODE":
      return process.env.KASHIER_MODE;
    case "UPSTASH_REDIS_REST_URL":
      return process.env.UPSTASH_REDIS_REST_URL;
    case "UPSTASH_REDIS_REST_TOKEN":
      return process.env.UPSTASH_REDIS_REST_TOKEN;
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
  return getAllServices().every((s) => s.configured);
}

export function requireEnv(key: string): string {
  const known = key as KnownEnvVar;
  const fromKnown =
    key in {
      NEXT_PUBLIC_SUPABASE_URL: 1,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 1,
      SUPABASE_SERVICE_ROLE_KEY: 1,
      GEMINI_API_KEY: 1,
      FIRECRAWL_API_KEY: 1,
      KASHIER_MERCHANT_ID: 1,
      KASHIER_API_KEY: 1,
      KASHIER_SECRET_KEY: 1,
      KASHIER_MODE: 1,
      UPSTASH_REDIS_REST_URL: 1,
      UPSTASH_REDIS_REST_TOKEN: 1,
    }
      ? readKnownEnv(known)?.trim()
      : undefined;
  const v = fromKnown || process.env[key]?.trim();
  if (!v) throw new Error(`Missing required environment variable: ${key}`);
  return v;
}
