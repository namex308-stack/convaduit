import "server-only";

import tls from "node:tls";
import { isIP } from "node:net";
import { ssrfLookup } from "@/lib/safe-http-fetch";
import { resolveSafePublicHttpUrl } from "@/lib/url-safety";
import type { SslTlsIntegration } from "@/lib/types";
import { caughtErrorMessage, integrationBase } from "@/lib/integrations/result";

const TLS_TIMEOUT_MS = 10_000;

export type TlsConnect = typeof tls.connect;

export type InspectTlsDeps = {
  connect?: TlsConnect;
  lookup?: typeof resolveSafePublicHttpUrl;
};

function daysUntil(iso: string, now = Date.now()): number | null {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  return Math.floor((ms - now) / 86_400_000);
}

function parseSans(subjectaltname: string | undefined): string[] {
  if (!subjectaltname) return [];
  return subjectaltname
    .split(",")
    .map((part) => part.trim())
    .filter((entry) => entry.startsWith("DNS:") || entry.startsWith("IP Address:"))
    .map((entry) => entry.replace(/^DNS:|^IP Address:/, "").trim())
    .filter(Boolean);
}

function hostnameMatchesCert(hostname: string, cn: string | undefined, sans: string[]): boolean {
  const host = hostname.toLowerCase();
  const names = [...sans, cn].filter((n): n is string => Boolean(n)).map((n) => n.toLowerCase());
  return names.some((name) => {
    if (name === host) return true;
    if (name.startsWith("*.") && host.endsWith(name.slice(1)) && !host.slice(0, -name.slice(1).length).includes(".")) {
      return host.split(".").length === name.split(".").length;
    }
    return false;
  });
}

function firstName(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

function issuerName(cert: tls.PeerCertificate): string | undefined {
  const issuer = cert.issuer as { O?: string | string[]; CN?: string | string[] } | undefined;
  return firstName(issuer?.O) || firstName(issuer?.CN);
}

function gradeFor(input: {
  authorized: boolean;
  expired: boolean;
  hostnameMatches: boolean;
  daysUntilExpiry: number | null;
  protocol: string | null;
}): "ok" | "warn" | "fail" {
  if (!input.authorized || input.expired || !input.hostnameMatches) return "fail";
  if (input.protocol === "TLSv1" || input.protocol === "TLSv1.1") return "fail";
  if (input.daysUntilExpiry != null && input.daysUntilExpiry <= 21) return "warn";
  return "ok";
}

function readCertificate(
  socket: tls.TLSSocket,
  hostname: string,
  port: number,
  start: number
): SslTlsIntegration {
  const cert = socket.getPeerCertificate();
  const protocol = socket.getProtocol();
  const authorized = socket.authorized;
  if (!cert || Object.keys(cert).length === 0) {
    return {
      service: "ssl_tls",
      ...integrationBase(start, "error", { error: "No TLS certificate presented." }),
      hostname,
      port,
      protocol,
      authorized,
      grade: "fail",
    };
  }

  const validFrom = cert.valid_from ? new Date(cert.valid_from).toISOString() : undefined;
  const validTo = cert.valid_to ? new Date(cert.valid_to).toISOString() : undefined;
  const expiryDays = validTo ? daysUntil(validTo) : null;
  const expired = expiryDays != null ? expiryDays < 0 : false;
  const sans = parseSans(cert.subjectaltname);
  const subjectCn = firstName(cert.subject?.CN);
  const matches = hostnameMatchesCert(hostname, subjectCn, sans);

  return {
    service: "ssl_tls",
    ...integrationBase(start, "ok"),
    hostname,
    port,
    protocol,
    authorized,
    validFrom,
    validTo,
    daysUntilExpiry: expiryDays,
    issuer: issuerName(cert),
    subjectCn,
    sans,
    hostnameMatches: matches,
    expired,
    grade: gradeFor({
      authorized,
      expired,
      hostnameMatches: matches,
      daysUntilExpiry: expiryDays,
      protocol,
    }),
  };
}

/**
 * Direct TLS handshake to the target host (no paid SSL API).
 * Connect-time DNS uses the existing SSRF lookup.
 */
export async function inspectTlsCertificate(
  rawUrl: string,
  deps: InspectTlsDeps = {}
): Promise<SslTlsIntegration> {
  const start = Date.now();
  const resolve = deps.lookup ?? resolveSafePublicHttpUrl;
  const resolved = await resolve(rawUrl);
  if (!resolved.ok) {
    return {
      service: "ssl_tls",
      ...integrationBase(start, "skipped", { skipReason: resolved.reason }),
    };
  }

  let target: URL;
  try {
    target = new URL(resolved.href);
  } catch {
    return {
      service: "ssl_tls",
      ...integrationBase(start, "skipped", { skipReason: "رابط غير صالح." }),
    };
  }

  const hostname = resolved.hostname;
  const port =
    target.protocol === "https:"
      ? Number(target.port || 443)
      : 443;

  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    return {
      service: "ssl_tls",
      ...integrationBase(start, "error", { error: "Invalid TLS port." }),
      hostname,
    };
  }

  const connect = deps.connect ?? tls.connect;

  return new Promise((settle) => {
    let settled = false;
    const finish = (result: SslTlsIntegration) => {
      if (settled) return;
      settled = true;
      settle(result);
    };

    const socket = connect(
      {
        host: hostname,
        port,
        servername: isIP(hostname) ? undefined : hostname,
        rejectUnauthorized: false,
        lookup: ssrfLookup as tls.ConnectionOptions["lookup"],
      },
      () => {
        try {
          finish(readCertificate(socket, hostname, port, start));
        } catch (err) {
          finish({
            service: "ssl_tls",
            ...integrationBase(start, "error", { error: caughtErrorMessage(err) }),
            hostname,
            port,
          });
        } finally {
          socket.end();
        }
      }
    );

    socket.setTimeout(TLS_TIMEOUT_MS, () => {
      socket.destroy();
      finish({
        service: "ssl_tls",
        ...integrationBase(start, "error", { error: "TLS handshake timed out." }),
        hostname,
        port,
        grade: "fail",
      });
    });

    socket.on("error", (err) => {
      finish({
        service: "ssl_tls",
        ...integrationBase(start, "error", { error: caughtErrorMessage(err) }),
        hostname,
        port,
        grade: "fail",
      });
    });
  });
}
