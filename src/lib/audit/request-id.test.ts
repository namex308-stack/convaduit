import { describe, expect, it } from "vitest";
import { getAuditRequestId } from "@/lib/audit/request-id";

describe("getAuditRequestId", () => {
  it("prefers the Vercel request id", () => {
    const headers = new Headers({ "x-vercel-id": "fra1::abc" });
    expect(getAuditRequestId(headers)).toBe("fra1::abc");
  });

  it("falls back to x-request-id then a UUID", () => {
    const incoming = new Headers({ "x-request-id": "audit-test-01" });
    expect(getAuditRequestId(incoming)).toBe("audit-test-01");

    const generated = getAuditRequestId(new Headers());
    expect(generated).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });
});
