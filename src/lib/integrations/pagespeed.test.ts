import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { fetchPageSpeed } from "@/lib/integrations/pagespeed";
import type { FetchJsonResult } from "@/lib/integrations/http";
import type { ResolvedSafePublicUrl } from "@/lib/url-safety";

const PUBLIC: ResolvedSafePublicUrl = {
  ok: true,
  href: "https://example.com/",
  hostname: "example.com",
  addresses: [{ address: "93.184.216.34", family: 4 }],
};

const LIGHTHOUSE = {
  lighthouseResult: {
    categories: {
      performance: { score: 0.42 },
      accessibility: { score: 0.91 },
      "best-practices": { score: 0.8 },
      seo: { score: 0.88 },
    },
    audits: {
      "largest-contentful-paint": { displayValue: "2.4 s", numericValue: 2400 },
      "cumulative-layout-shift": { numericValue: 0.05 },
      "server-response-time": { displayValue: "180 ms" },
    },
  },
};

describe("fetchPageSpeed", () => {
  it("skips blocked URLs without calling PageSpeed", async () => {
    const fetchJson = vi.fn(async (): Promise<FetchJsonResult> => {
      throw new Error("should not fetch");
    });
    const result = await fetchPageSpeed("http://127.0.0.1/", {
      lookup: async () => ({ ok: false, reason: "blocked" }),
      fetchJson,
    });
    expect(result.status).toBe("skipped");
    expect(fetchJson).not.toHaveBeenCalled();
    expect(result.performance).toBeUndefined();
  });

  it("maps lighthouse category scores from the real API payload", async () => {
    const fetchJson = vi.fn(async (_url: string) => ({
      ok: true as const,
      status: 200,
      json: LIGHTHOUSE,
    }));
    const result = await fetchPageSpeed("https://example.com/", {
      lookup: async () => PUBLIC,
      fetchJson,
      getApiKey: () => "test-key",
    });
    expect(result.status).toBe("ok");
    expect(result.performance).toBe(42);
    expect(result.accessibility).toBe(91);
    expect(result.bestPractices).toBe(80);
    expect(result.seo).toBe(88);
    expect(result.lcp).toBe("2.4 s");
    expect(result.cls).toBe(0.05);
    expect(fetchJson).toHaveBeenCalledTimes(1);
    const url = String(fetchJson.mock.calls[0]?.[0]);
    expect(url).toContain("pagespeedonline/v5/runPagespeed");
    expect(url).toContain("key=test-key");
    expect(url).toContain("strategy=mobile");
  });

  it("returns error (not fake scores) when the API payload is empty", async () => {
    const result = await fetchPageSpeed("https://example.com/", {
      lookup: async () => PUBLIC,
      fetchJson: async () => ({ ok: true, status: 200, json: {} }),
    });
    expect(result.status).toBe("error");
    expect(result.performance).toBeUndefined();
    expect(result.error).toMatch(/lighthouseResult/i);
  });

  it("returns error when the API responds with HTTP failure", async () => {
    const result = await fetchPageSpeed("https://example.com/", {
      lookup: async () => PUBLIC,
      fetchJson: async () => ({ ok: false, status: 429, error: "HTTP 429" }),
    });
    expect(result.status).toBe("error");
    expect(result.error).toBe("HTTP 429");
  });
});
