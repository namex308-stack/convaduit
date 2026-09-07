import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const redisCtor = vi.fn();
const limit = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: class Redis {
    constructor(opts: { url: string; token: string }) {
      redisCtor(opts);
      if (!opts.url.startsWith("https://") && !opts.url.startsWith("http://")) {
        const err = new Error(
          `Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: "${opts.url}".`
        );
        err.name = "UrlError";
        throw err;
      }
      if (opts.url.includes('"')) {
        const err = new Error(
          `Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: "${opts.url}".`
        );
        err.name = "UrlError";
        throw err;
      }
    }
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class Ratelimit {
    static slidingWindow() {
      return {};
    }
    constructor() {}
    limit(...args: unknown[]) {
      return limit(...args);
    }
  },
}));

import {
  checkRateLimit,
  getRedis,
  isRedisConfigured,
  resetRedisClientForTests,
} from "@/lib/redis";

describe("redis rate limit fail-open", () => {
  beforeEach(() => {
    resetRedisClientForTests();
    redisCtor.mockClear();
    limit.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetRedisClientForTests();
  });

  it("strips quoted Upstash URLs so the client can construct", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", '"https://skilled-flounder-35351.upstash.io"');
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", '"tok"');
    expect(isRedisConfigured()).toBe(true);
    expect(getRedis()).not.toBeNull();
    expect(redisCtor).toHaveBeenCalledWith({
      url: "https://skilled-flounder-35351.upstash.io",
      token: "tok",
    });
  });

  it("returns null instead of throwing when the URL is still invalid", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "not-a-url");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
    expect(getRedis()).toBeNull();
  });

  it("allows audits in production when Redis is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const result = await checkRateLimit("user:1", "free");
    expect(result.success).toBe(true);
  });

  it("allows audits when limiter.limit throws", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://skilled-flounder-35351.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
    limit.mockRejectedValue(
      new Error(
        'Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: ""https://skilled-flounder-35351.upstash.io"".'
      )
    );
    const result = await checkRateLimit("user:1", "free");
    expect(result.success).toBe(true);
  });

  it("still denies when Redis successfully rate-limits", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://skilled-flounder-35351.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
    limit.mockResolvedValue({ success: false, limit: 10, remaining: 0, reset: 1 });
    const result = await checkRateLimit("user:1", "free");
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
