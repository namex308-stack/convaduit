import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { fetchWebRisk } from "@/lib/integrations/web-risk";
import type { ResolvedSafePublicUrl } from "@/lib/url-safety";

const PUBLIC: ResolvedSafePublicUrl = {
  ok: true,
  href: "https://example.com/",
  hostname: "example.com",
  addresses: [{ address: "93.184.216.34", family: 4 }],
};

describe("fetchWebRisk", () => {
  it("skips when no API key is configured — does not invent a safe verdict", async () => {
    const fetchJson = vi.fn();
    const result = await fetchWebRisk("https://example.com/", {
      lookup: async () => PUBLIC,
      getApiKey: () => undefined,
      fetchJson,
    });
    expect(result.status).toBe("skipped");
    expect(result.skipReason).toBe("not_configured");
    expect(result.isSafe).toBeUndefined();
    expect(fetchJson).not.toHaveBeenCalled();
  });

  it("treats an empty Lookup API body as no listed threats", async () => {
    const fetchJson = vi.fn(async (url: string) => {
      expect(url).toContain("webrisk.googleapis.com/v1/uris:search");
      expect(url).toContain("threatTypes=MALWARE");
      expect(url).not.toContain("threatLists.computeDiff");
      expect(url).not.toContain("hashes.search");
      return { ok: true as const, status: 200, json: {} };
    });
    const result = await fetchWebRisk("https://example.com/", {
      lookup: async () => PUBLIC,
      getApiKey: () => "wr-key",
      fetchJson,
    });
    expect(result.status).toBe("ok");
    expect(result.isSafe).toBe(true);
    expect(result.threatTypes).toEqual([]);
  });

  it("returns the threat types from the Lookup API without fabricating others", async () => {
    const result = await fetchWebRisk("https://example.com/", {
      lookup: async () => PUBLIC,
      getApiKey: () => "wr-key",
      fetchJson: async () => ({
        ok: true,
        status: 200,
        json: { threat: { threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"] } },
      }),
    });
    expect(result.status).toBe("ok");
    expect(result.isSafe).toBe(false);
    expect(result.threatTypes).toEqual(["MALWARE", "SOCIAL_ENGINEERING"]);
  });

  it("returns error when Lookup API fails", async () => {
    const result = await fetchWebRisk("https://example.com/", {
      lookup: async () => PUBLIC,
      getApiKey: () => "wr-key",
      fetchJson: async () => ({ ok: false, status: 403, error: "HTTP 403" }),
    });
    expect(result.status).toBe("error");
    expect(result.isSafe).toBeUndefined();
  });
});
