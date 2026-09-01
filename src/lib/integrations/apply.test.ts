import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { applySiteIntegrationsToAudit } from "@/lib/integrations/apply";
import type { AuditData, SiteIntegrations } from "@/lib/types";

function audit(): AuditData {
  return {
    productUrl: "https://example.com/",
    storeName: "Example",
    productName: "Serum",
    overallScore: 70,
    breakdown: [
      { pillar: "conversion", score: 70, max: 100, label: "تحويل", summary: "ok" },
      { pillar: "seo", score: 70, max: 100, label: "SEO", summary: "ok" },
      { pillar: "geo", score: 70, max: 100, label: "GEO", summary: "ok" },
      { pillar: "trust", score: 70, max: 100, label: "ثقة", summary: "ok" },
    ],
    recommendations: [],
    geoReadability: { chatgpt: 50, perplexity: 50, googleAI: 50 },
    createdAt: new Date().toISOString(),
  };
}

function baseOk(): SiteIntegrations {
  const now = new Date().toISOString();
  return {
    sslTls: {
      service: "ssl_tls",
      status: "ok",
      checkedAt: now,
      durationMs: 10,
      hostname: "example.com",
      port: 443,
      protocol: "TLSv1.3",
      authorized: true,
      hostnameMatches: true,
      expired: false,
      daysUntilExpiry: 400,
      grade: "ok",
      issuer: "Let's Encrypt",
    },
    pageSpeed: {
      service: "pagespeed",
      status: "ok",
      checkedAt: now,
      durationMs: 10,
      strategy: "mobile",
      performance: 80,
      seo: 90,
    },
    webRisk: {
      service: "web_risk",
      status: "ok",
      checkedAt: now,
      durationMs: 10,
      isSafe: true,
      threatTypes: [],
    },
    ipGeo: {
      service: "ip_geo",
      status: "ok",
      checkedAt: now,
      durationMs: 10,
      ip: "93.184.216.34",
      country: "United States",
      provider: "geojs",
    },
    whois: {
      service: "whois",
      status: "ok",
      checkedAt: now,
      durationMs: 10,
      domain: "example.com",
      source: "rdap",
    },
  };
}

describe("applySiteIntegrationsToAudit", () => {
  it("attaches integration results and does not invent findings when checks are skipped", async () => {
    const skipped: SiteIntegrations = {
      sslTls: { service: "ssl_tls", status: "skipped", checkedAt: new Date().toISOString(), durationMs: 1, skipReason: "blocked" },
      pageSpeed: { service: "pagespeed", status: "skipped", checkedAt: new Date().toISOString(), durationMs: 1, skipReason: "blocked" },
      webRisk: { service: "web_risk", status: "skipped", checkedAt: new Date().toISOString(), durationMs: 1, skipReason: "not_configured" },
      ipGeo: { service: "ip_geo", status: "skipped", checkedAt: new Date().toISOString(), durationMs: 1, skipReason: "blocked" },
      whois: { service: "whois", status: "skipped", checkedAt: new Date().toISOString(), durationMs: 1, skipReason: "blocked" },
    };
    const next = applySiteIntegrationsToAudit(audit(), skipped);
    expect(next.siteIntegrations).toBe(skipped);
    expect(next.recommendations).toHaveLength(0);
    expect(next.breakdown.find((b) => b.pillar === "trust")?.score).toBe(70);
  });

  it("adds a trust finding when Web Risk reports real threats", () => {
    const integrations = baseOk();
    integrations.webRisk = {
      ...integrations.webRisk,
      isSafe: false,
      threatTypes: ["MALWARE"],
    };
    const next = applySiteIntegrationsToAudit(audit(), integrations);
    expect(next.recommendations.some((r) => r.id === "site-webrisk-threat")).toBe(true);
    expect(next.breakdown.find((b) => b.pillar === "trust")?.score).toBeLessThan(70);
  });

  it("adds an SSL finding for an expired certificate", () => {
    const integrations = baseOk();
    integrations.sslTls = {
      ...integrations.sslTls,
      expired: true,
      grade: "fail",
      daysUntilExpiry: -3,
    };
    const next = applySiteIntegrationsToAudit(audit(), integrations);
    expect(next.recommendations.some((r) => r.id === "site-ssl-expired")).toBe(true);
  });

  it("does not create PageSpeed findings when the check errored", () => {
    const integrations = baseOk();
    integrations.pageSpeed = {
      service: "pagespeed",
      status: "error",
      checkedAt: new Date().toISOString(),
      durationMs: 5,
      error: "HTTP 429",
    };
    const next = applySiteIntegrationsToAudit(audit(), integrations);
    expect(next.recommendations.some((r) => r.id?.startsWith("site-pagespeed"))).toBe(false);
  });
});
