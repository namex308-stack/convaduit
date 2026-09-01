import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const inspectTlsCertificate = vi.fn();
const fetchPageSpeed = vi.fn();
const fetchWebRisk = vi.fn();
const fetchIpGeo = vi.fn();
const fetchWhois = vi.fn();

vi.mock("@/lib/integrations/ssl-tls", () => ({
  inspectTlsCertificate: (...args: unknown[]) => inspectTlsCertificate(...args),
}));
vi.mock("@/lib/integrations/pagespeed", () => ({
  fetchPageSpeed: (...args: unknown[]) => fetchPageSpeed(...args),
}));
vi.mock("@/lib/integrations/web-risk", () => ({
  fetchWebRisk: (...args: unknown[]) => fetchWebRisk(...args),
}));
vi.mock("@/lib/integrations/ip-geo", () => ({
  fetchIpGeo: (...args: unknown[]) => fetchIpGeo(...args),
}));
vi.mock("@/lib/integrations/whois", () => ({
  fetchWhois: (...args: unknown[]) => fetchWhois(...args),
}));

import { runSiteIntegrations } from "@/lib/integrations/run";

function ok(service: string) {
  return {
    service,
    status: "ok" as const,
    checkedAt: new Date().toISOString(),
    durationMs: 1,
  };
}

describe("runSiteIntegrations", () => {
  it("returns every check even when one integration throws", async () => {
    inspectTlsCertificate.mockResolvedValue(ok("ssl_tls"));
    fetchPageSpeed.mockRejectedValue(new Error("pagespeed down"));
    fetchWebRisk.mockResolvedValue({ ...ok("web_risk"), isSafe: true, threatTypes: [] });
    fetchIpGeo.mockResolvedValue(ok("ip_geo"));
    fetchWhois.mockResolvedValue(ok("whois"));

    const result = await runSiteIntegrations("https://example.com/");
    expect(result.sslTls.status).toBe("ok");
    expect(result.pageSpeed.status).toBe("error");
    expect(result.pageSpeed.error).toContain("pagespeed down");
    expect(result.webRisk.status).toBe("ok");
    expect(result.ipGeo.status).toBe("ok");
    expect(result.whois.status).toBe("ok");
  });

  it("never rejects the caller", async () => {
    inspectTlsCertificate.mockRejectedValue(new Error("tls"));
    fetchPageSpeed.mockRejectedValue(new Error("psi"));
    fetchWebRisk.mockRejectedValue(new Error("risk"));
    fetchIpGeo.mockRejectedValue(new Error("geo"));
    fetchWhois.mockRejectedValue(new Error("whois"));

    await expect(runSiteIntegrations("https://example.com/")).resolves.toMatchObject({
      sslTls: { status: "error" },
      pageSpeed: { status: "error" },
      webRisk: { status: "error" },
      ipGeo: { status: "error" },
      whois: { status: "error" },
    });
  });
});
