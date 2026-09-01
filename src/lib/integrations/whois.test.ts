import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { fetchWhois, registrableDomain, resetWhoisBootstrapCache } from "@/lib/integrations/whois";
import type { FetchJsonResult } from "@/lib/integrations/http";
import type { ResolvedSafePublicUrl } from "@/lib/url-safety";

const PUBLIC: ResolvedSafePublicUrl = {
  ok: true,
  href: "https://www.example.com/shop",
  hostname: "www.example.com",
  addresses: [{ address: "93.184.216.34", family: 4 }],
};

const BOOTSTRAP = {
  services: [[["com", "net"], ["https://rdap.verisign.com/com/v1/"]]],
};

const RDAP = {
  objectClassName: "domain",
  ldhName: "EXAMPLE.COM",
  status: ["client delete prohibited", "client transfer prohibited"],
  nameservers: [{ ldhName: "A.IANA-SERVERS.NET" }, { ldhName: "B.IANA-SERVERS.NET" }],
  secureDNS: { delegationSigned: false },
  events: [
    { eventAction: "registration", eventDate: "1995-08-14T04:00:00Z" },
    { eventAction: "expiration", eventDate: "2026-08-13T04:00:00Z" },
  ],
  entities: [
    {
      roles: ["registrar"],
      vcardArray: ["vcard", [["fn", {}, "text", "RESERVED-Internet Assigned Numbers Authority"]]],
    },
  ],
};

describe("registrableDomain", () => {
  it("strips www and keeps eTLD+1", () => {
    expect(registrableDomain("www.example.com")).toBe("example.com");
    expect(registrableDomain("shop.example.co.uk")).toBe("example.co.uk");
  });

  it("returns null for IP literals", () => {
    expect(registrableDomain("8.8.8.8")).toBeNull();
  });
});

describe("fetchWhois", () => {
  it("skips IP literals instead of inventing domain data", async () => {
    resetWhoisBootstrapCache();
    const fetchJson = vi.fn(async (): Promise<FetchJsonResult> => {
      throw new Error("should not fetch");
    });
    const result = await fetchWhois("https://8.8.8.8/", {
      lookup: async () => ({
        ok: true,
        href: "https://8.8.8.8/",
        hostname: "8.8.8.8",
        addresses: [{ address: "8.8.8.8", family: 4 }],
      }),
      fetchJson,
    });
    expect(result.status).toBe("skipped");
    expect(result.skipReason).toBe("ip_literal");
    expect(fetchJson).not.toHaveBeenCalled();
  });

  it("parses RDAP registration fields from the registry", async () => {
    resetWhoisBootstrapCache();
    const fetchJson = vi.fn(async (url: string): Promise<FetchJsonResult> => {
      if (url.includes("data.iana.org/rdap/dns.json")) {
        return { ok: true, status: 200, json: BOOTSTRAP };
      }
      expect(url).toBe("https://rdap.verisign.com/com/v1/domain/example.com");
      return { ok: true, status: 200, json: RDAP };
    });
    const result = await fetchWhois("https://www.example.com/shop", {
      lookup: async () => PUBLIC,
      fetchJson,
    });
    expect(result.status).toBe("ok");
    expect(result.source).toBe("rdap");
    expect(result.domain).toBe("example.com");
    expect(result.registrar).toContain("Assigned Numbers");
    expect(result.registeredAt).toBe("1995-08-14T04:00:00.000Z");
    expect(result.nameservers?.[0]).toBe("a.iana-servers.net");
    expect(result.dnssec).toBe(false);
  });

  it("returns error when RDAP has no registration object — not a fake WHOIS", async () => {
    resetWhoisBootstrapCache();
    const result = await fetchWhois("https://www.example.com/", {
      lookup: async () => PUBLIC,
      fetchJson: async (url: string) => {
        if (url.includes("dns.json")) return { ok: true, status: 200, json: BOOTSTRAP };
        return { ok: true, status: 200, json: { message: "not a domain" } };
      },
    });
    expect(result.status).toBe("error");
    expect(result.registrar).toBeUndefined();
  });
});
