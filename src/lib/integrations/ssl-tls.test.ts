import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import type tls from "node:tls";

vi.mock("server-only", () => ({}));

import { inspectTlsCertificate } from "@/lib/integrations/ssl-tls";
import type { ResolvedSafePublicUrl } from "@/lib/url-safety";

const PUBLIC: ResolvedSafePublicUrl = {
  ok: true,
  href: "https://example.com/",
  hostname: "example.com",
  addresses: [{ address: "93.184.216.34", family: 4 }],
};

function lookupOk(): Promise<ResolvedSafePublicUrl> {
  return Promise.resolve(PUBLIC);
}

function lookupBlocked(): Promise<{ ok: false; reason: string }> {
  return Promise.resolve({ ok: false, reason: "blocked" });
}

function fakeSocket(overrides: {
  authorized?: boolean;
  protocol?: string;
  cert?: Record<string, unknown>;
}) {
  const socket = new EventEmitter() as tls.TLSSocket;
  Object.assign(socket, {
    authorized: overrides.authorized ?? true,
    getProtocol: () => overrides.protocol ?? "TLSv1.3",
    getPeerCertificate: () =>
      overrides.cert ?? {
        valid_from: "Jan 1 00:00:00 2024 GMT",
        valid_to: "Jan 1 00:00:00 2028 GMT",
        subject: { CN: "example.com" },
        issuer: { O: "Let's Encrypt" },
        subjectaltname: "DNS:example.com, DNS:www.example.com",
      },
    setTimeout: () => socket,
    end: () => socket,
    destroy: () => socket,
  });
  return socket;
}

function connectThatEmits(socket: tls.TLSSocket): typeof tls.connect {
  return ((_opts, onSecure) => {
    queueMicrotask(() => onSecure?.());
    return socket;
  }) as typeof tls.connect;
}

describe("inspectTlsCertificate", () => {
  it("skips when SSRF blocks the URL and does not invent a certificate", async () => {
    const result = await inspectTlsCertificate("http://127.0.0.1/", {
      lookup: lookupBlocked,
      connect: () => {
        throw new Error("should not connect");
      },
    });
    expect(result.status).toBe("skipped");
    expect(result.skipReason).toBe("blocked");
    expect(result.issuer).toBeUndefined();
    expect(result.validTo).toBeUndefined();
  });

  it("reads a handshake certificate without fabricating fields", async () => {
    const socket = fakeSocket({});
    const result = await inspectTlsCertificate("https://example.com/", {
      lookup: lookupOk,
      connect: connectThatEmits(socket),
    });
    expect(result.status).toBe("ok");
    expect(result.service).toBe("ssl_tls");
    expect(result.hostname).toBe("example.com");
    expect(result.issuer).toBe("Let's Encrypt");
    expect(result.hostnameMatches).toBe(true);
    expect(result.expired).toBe(false);
    expect(result.grade).toBe("ok");
    expect(result.protocol).toBe("TLSv1.3");
  });

  it("marks an expired certificate as fail with real dates", async () => {
    const socket = fakeSocket({
      cert: {
        valid_from: "Jan 1 00:00:00 2020 GMT",
        valid_to: "Jan 1 00:00:00 2021 GMT",
        subject: { CN: "example.com" },
        issuer: { O: "Expired CA" },
        subjectaltname: "DNS:example.com",
      },
    });
    const result = await inspectTlsCertificate("https://example.com/", {
      lookup: lookupOk,
      connect: connectThatEmits(socket),
    });
    expect(result.status).toBe("ok");
    expect(result.expired).toBe(true);
    expect(result.grade).toBe("fail");
  });

  it("returns error when the handshake fails — never a fake passing cert", async () => {
    const connect = ((_opts, _cb) => {
      const socket = fakeSocket({});
      queueMicrotask(() => socket.emit("error", new Error("ECONNREFUSED")));
      return socket;
    }) as typeof tls.connect;
    const result = await inspectTlsCertificate("https://example.com/", {
      lookup: lookupOk,
      connect,
    });
    expect(result.status).toBe("error");
    expect(result.error).toContain("ECONNREFUSED");
    expect(result.issuer).toBeUndefined();
  });
});
