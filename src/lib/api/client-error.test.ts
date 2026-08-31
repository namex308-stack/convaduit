import { describe, expect, it } from "vitest";
import { parseApiErrorResponse } from "./client-error";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("parseApiErrorResponse", () => {
  it("maps 401 to sign-in state", async () => {
    const parsed = await parseApiErrorResponse(
      jsonResponse(401, { error: "unauthorized" }),
      "fallback",
      "sign in"
    );
    expect(parsed).toEqual({
      message: "sign in",
      needsAuth: true,
      needsUpgrade: false,
    });
  });

  it("maps 403 entitlement body to upgrade state", async () => {
    const parsed = await parseApiErrorResponse(
      jsonResponse(403, {
        error: "المراقبة الأسبوعية غير متاحة في باقتك الحالية.",
        code: "WEEKLY_MONITORING_LOCKED",
      }),
      "fallback",
      "sign in"
    );
    expect(parsed).toEqual({
      message: "المراقبة الأسبوعية غير متاحة في باقتك الحالية.",
      needsAuth: false,
      needsUpgrade: true,
    });
  });

  it("falls back when body is not JSON", async () => {
    const parsed = await parseApiErrorResponse(
      new Response("bad gateway", { status: 502 }),
      "fallback",
      "sign in"
    );
    expect(parsed).toEqual({
      message: "fallback",
      needsAuth: false,
      needsUpgrade: false,
    });
  });
});
