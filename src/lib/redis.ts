import "server-only";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let _redis: Redis | null = null;

export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Upstash Redis client. Returns null if not configured.
 */
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!_redis) {
    _redis = new Redis({ url, token });
  }
  return _redis;
}

/**
 * Per-user rate limiter for audit / generate requests.
 * Production fails closed when Redis is unset.
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

/**
 * Check rate limit for an identifier (IP or user ID).
 * Returns { success, limit, remaining, reset }.
 * Production without Redis: deny (fail closed).
 * Non-production without Redis: allow (local demo).
 */
export async function checkRateLimit(
  identifier: string,
  plan: "free" | "pro" | "business" = "free"
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiter = getRatelimit(plan);
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.error("[redis] rate limit denied: Upstash Redis not configured");
      return { success: false, limit: 0, remaining: 0, reset: 0 };
    }
    return { success: true, limit: Infinity, remaining: Infinity, reset: 0 };
  }
  return limiter.limit(identifier);
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
  const limiter = getProductLookupRatelimit();
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.error("[redis] product-lookup rate limit denied: Upstash Redis not configured");
      return { success: false, limit: 0, remaining: 0, reset: 0 };
    }
    return { success: true, limit: Infinity, remaining: Infinity, reset: 0 };
  }
  return limiter.limit(identifier);
}
