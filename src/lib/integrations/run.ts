import "server-only";

import type { SiteIntegrations } from "@/lib/types";
import { inspectTlsCertificate } from "@/lib/integrations/ssl-tls";
import { fetchPageSpeed } from "@/lib/integrations/pagespeed";
import { fetchWebRisk } from "@/lib/integrations/web-risk";
import { fetchIpGeo } from "@/lib/integrations/ip-geo";
import { fetchWhois } from "@/lib/integrations/whois";
import { caughtErrorMessage, integrationBase } from "@/lib/integrations/result";

async function settled<T>(promise: Promise<T>, fallback: (error: string) => T): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    return fallback(caughtErrorMessage(err));
  }
}

/**
 * Run free website-analysis integrations against a crawl URL that already passed SSRF.
 * Each check is isolated: one failure never fails the audit.
 */
export async function runSiteIntegrations(rawUrl: string): Promise<SiteIntegrations> {
  const start = Date.now();
  const [sslTls, pageSpeed, webRisk, ipGeo, whois] = await Promise.all([
    settled(inspectTlsCertificate(rawUrl), (error) => ({
      service: "ssl_tls" as const,
      ...integrationBase(start, "error", { error }),
      grade: "fail" as const,
    })),
    settled(fetchPageSpeed(rawUrl), (error) => ({
      service: "pagespeed" as const,
      ...integrationBase(start, "error", { error }),
    })),
    settled(fetchWebRisk(rawUrl), (error) => ({
      service: "web_risk" as const,
      ...integrationBase(start, "error", { error }),
    })),
    settled(fetchIpGeo(rawUrl), (error) => ({
      service: "ip_geo" as const,
      ...integrationBase(start, "error", { error }),
    })),
    settled(fetchWhois(rawUrl), (error) => ({
      service: "whois" as const,
      ...integrationBase(start, "error", { error }),
    })),
  ]);

  return { sslTls, pageSpeed, webRisk, ipGeo, whois };
}
