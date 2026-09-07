import "server-only";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { sanitizeEnvValue } from "@/lib/env";

let _redis: Redis | null = null;
let _redisInitFailed = false;

const UNLIMITED = {
  success: true as const,
  limit: Number.POSITIVE_INFINITY,
  remaining: Number.POSITIVE_INFINITY,
  reset: 0,
};

export function resetRedisClientForTests(): void {
  _redis = null;
  _redisInitFailed = false;
  for (const key of Object.keys(LIMITERS)) delete LIMITERS[key];
  _productLookupLimiter = null;
}

function redisCredentials(): { url: string; token: string } | null {
  const url = sanitizeEnvValue(process.env.UPSTASH_REDIS_REST_URL);
  const token = sanitizeEnvValue(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!url || !token) return null;
  return { url, token };
}

export function isRedisConfigured(): boolean {
  return redisCredentials() != null;
}

/**
 * Upstash Redis client. Returns null if missing or the URL/token cannot be used.
 * Quoted dashboard values (e.g. `"https://…"`) are stripped before construct.
 */
export function getRedis(): Redis | null {
  if (_redis) return _redis;
  if (_redisInitFailed) return null;

  const creds = redisCredentials();
  if (!creds) return null;

  if (!creds.url.startsWith("https://") && !creds.url.startsWith("http://")) {
    _redisInitFailed = true;
    console.error("[redis] client init skipped: URL must start with https");
    return null;
  }

  try {
    _redis = new Redis({ url: creds.url, token: creds.token });
    return _redis;
  } catch (err) {
    _redisInitFailed = true;
    console.error(
      "[redis] client init failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Per-user rate limiter for audit / generate requests.
 * Redis outages fail open so a misconfigured URL cannot abort audits.
 *   Free: 10 / hour
 *   Pro: 100 / hour
 *   Business: 1000 / hour
 */
const LIMITERS: Record<string, Ratelimit> = {};

export function getRatelimit(plan: "free" | "pro" | "business" = "free"): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const limits = { free: 10, pro: 100, business: 1000 };
  const key = `${plan}:${limits[plan]}`;

  if (!LIMITERS[key]) {
    LIMITERS[key] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limits[plan], "1 h"),
      prefix: `ratelimit:audit:${plan}`,
      analytics: true,
    });
  }
  return LIMITERS[key];
}

function allowWithoutRedis(reason: string): typeof UNLIMITED {
  console.error(`[redis] rate limit skipped (${reason}) — allowing request`);
  return UNLIMITED;
}

/**
 * Check rate limit for an identifier (IP or user ID).
 * Returns { success, limit, remaining, reset }.
 * Successful Redis denials still return 429.
 * Missing/misconfigured/unreachable Redis fails open (does not abort the audit).
 */
export async function checkRateLimit(
  identifier: string,
  plan: "free" | "pro" | "business" = "free"
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    const limiter = getRatelimit(plan);
    if (!limiter) return allowWithoutRedis("not configured or client init failed");
    return await limiter.limit(identifier);
  } catch (err) {
    console.error("[redis] rate limit check failed — allowing request:", err);
    return UNLIMITED;
  }
}

/** Generous anonymous cap — cheaper than a full audit (no Gemini). */
const PRODUCT_LOOKUP_PER_HOUR = 20;
let _productLookupLimiter: Ratelimit | null = null;

function getProductLookupRatelimit(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!_productLookupLimiter) {
    _productLookupLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(PRODUCT_LOOKUP_PER_HOUR, "1 h"),
      prefix: "ratelimit:product-lookup",
      analytics: true,
    });
  }
  return _productLookupLimiter;
}

/**
 * Rate limit for the free product-lookup tool.
 * Pass a namespaced identifier such as `product-lookup:ip:…` so this bucket
 * never shares quota with `checkRateLimit` audit keys.
 */
export async function checkProductLookupRateLimit(
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    const limiter = getProductLookupRatelimit();
    if (!limiter) return allowWithoutRedis("product-lookup not configured");
    return await limiter.limit(identifier);
  } catch (err) {
    console.error("[redis] product-lookup rate limit failed — allowing request:", err);
    return UNLIMITED;
  }
}
