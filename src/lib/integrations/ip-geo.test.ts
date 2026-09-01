import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { fetchIpGeo } from "@/lib/integrations/ip-geo";
import type { FetchJsonResult } from "@/lib/integrations/http";
import type { ResolvedSafePublicUrl } from "@/lib/url-safety";

const PUBLIC: ResolvedSafePublicUrl = {
  ok: true,
  href: "https://example.com/",
  hostname: "example.com",
  addresses: [{ address: "93.184.216.34", family: 4 }],
};

describe("fetchIpGeo", () => {
  it("skips blocked hosts and does not query a geo API", async () => {
    const fetchJson = vi.fn(async (): Promise<FetchJsonResult> => {
      throw new Error("should not fetch");
    });
    const result = await fetchIpGeo("http://10.0.0.5/", {
      lookup: async () => ({ ok: false, reason: "blocked" }),
      fetchJson,
    });
    expect(result.status).toBe("skipped");
    expect(fetchJson).not.toHaveBeenCalled();
    expect(result.country).toBeUndefined();
  });

  it("uses GeoJS data for the resolved public IP", async () => {
    const fetchJson = vi.fn(async (url: string) => {
      expect(url).toContain("get.geojs.io/v1/ip/geo/93.184.216.34.json");
      return {
        ok: true as const,
        status: 200,
        json: {
          ip: "93.184.216.34",
          country: "United States",
          country_code: "US",
          city: "Norwell",
          region: "Massachusetts",
          organization_name: "Edgecast",
          timezone: "America/New_York",
          asn: 15133,
        },
      };
    });
    const result = await fetchIpGeo("https://example.com/", {
      lookup: async () => PUBLIC,
      fetchJson,
    });
    expect(result.status).toBe("ok");
    expect(result.provider).toBe("geojs");
    expect(result.ip).toBe("93.184.216.34");
    expect(result.country).toBe("United States");
    expect(result.countryCode).toBe("US");
    expect(result.organization).toBe("Edgecast");
    expect(result.asn).toBe("15133");
  });

  it("falls back to ipwho.is when GeoJS has no country", async () => {
    const fetchJson = vi.fn(async (url: string): Promise<FetchJsonResult> => {
      if (url.includes("geojs")) {
        return { ok: true, status: 200, json: { ip: "93.184.216.34" } };
      }
      expect(url).toContain("ipwho.is/93.184.216.34");
      return {
        ok: true,
        status: 200,
        json: {
          success: true,
          country: "United States",
          country_code: "US",
          city: "Norwell",
          connection: { org: "Edgecast", asn: "AS15133" },
        },
      };
    });
    const result = await fetchIpGeo("https://example.com/", {
      lookup: async () => PUBLIC,
      fetchJson,
    });
    expect(result.status).toBe("ok");
    expect(result.provider).toBe("ipwhois");
    expect(result.organization).toBe("Edgecast");
  });

  it("returns error when both free providers fail — no fake location", async () => {
    const result = await fetchIpGeo("https://example.com/", {
      lookup: async () => PUBLIC,
      fetchJson: async () => ({ ok: false, status: 500, error: "HTTP 500" }),
    });
    expect(result.status).toBe("error");
    expect(result.country).toBeUndefined();
    expect(result.ip).toBe("93.184.216.34");
  });
});
