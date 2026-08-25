import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { APEX_TO_WWW_REDIRECTS } from "@/lib/apex-www-redirects";
import { PRODUCTION_APEX_HOST, PRODUCTION_CANONICAL_ORIGIN } from "@/lib/site-url";
import { redirectApexToWww } from "@/lib/www-canonical";

function req(url: string, host?: string): NextRequest {
  const headers = host ? { host } : undefined;
  return new NextRequest(new URL(url), headers ? { headers } : undefined);
}

describe("redirectApexToWww", () => {
  it("permanently redirects apex requests to the www origin", () => {
    const res = redirectApexToWww(req("https://convaudit.com/pricing?ref=nav"));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(308);
    expect(res!.headers.get("location")).toBe(
      "https://www.convaudit.com/pricing?ref=nav"
    );
  });

  it("redirects the apex homepage", () => {
    const res = redirectApexToWww(req("https://convaudit.com/"));
    expect(res!.status).toBe(308);
    expect(res!.headers.get("location")).toBe("https://www.convaudit.com/");
  });

  it("uses the Host header when it differs from the request URL", () => {
    const res = redirectApexToWww(
      req("https://127.0.0.1:3000/docs", PRODUCTION_APEX_HOST)
    );
    expect(res!.headers.get("location")).toBe("https://www.convaudit.com/docs");
  });

  it("does not redirect www or localhost", () => {
    expect(redirectApexToWww(req("https://www.convaudit.com/pricing"))).toBeNull();
    expect(redirectApexToWww(req("http://localhost:3000/pricing"))).toBeNull();
  });
});

describe("APEX_TO_WWW_REDIRECTS", () => {
  it("permanently maps every apex path to the www origin", () => {
    expect(APEX_TO_WWW_REDIRECTS.every((rule) => rule.permanent)).toBe(true);
    expect(
      APEX_TO_WWW_REDIRECTS.every((rule) =>
        rule.has?.some((h) => h.type === "host" && h.value === PRODUCTION_APEX_HOST)
      )
    ).toBe(true);
    expect(
      APEX_TO_WWW_REDIRECTS.every((rule) =>
        rule.destination.startsWith(PRODUCTION_CANONICAL_ORIGIN)
      )
    ).toBe(true);
  });
});
