import { describe, expect, it } from "vitest";
import {
  formatFailedAuditMessage,
  mapUnknownAuditError,
  redactSecrets,
} from "@/lib/audit/pipeline-error";

describe("pipeline error mapping", () => {
  it("maps quoted Upstash URL crashes to REDIS_UNAVAILABLE without leaking the URL", () => {
    const mapped = mapUnknownAuditError(
      new Error(
        'Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: ""https://skilled-flounder-35351.upstash.io"".'
      )
    );
    expect(mapped.code).toBe("REDIS_UNAVAILABLE");
    expect(mapped.stage).toBe("rate_limit");
    expect(mapped.publicMessage).not.toMatch(/upstash|skilled-flounder|https?:\/\//i);
  });

  it("redacts secrets and URLs", () => {
    expect(redactSecrets("Bearer sk-abc Authorization https://secret.example/path")).not.toMatch(
      /sk-abc|secret\.example/
    );
  });

  it("includes stage and request id in persisted failure text", () => {
    const message = formatFailedAuditMessage({
      publicMessage: "تعذّر حفظ نتائج التحليل. حاول مرة أخرى.",
      requestId: "req-123",
      stage: "persist",
    });
    expect(message).toContain("req-123");
    expect(message).toContain("حفظ النتائج");
  });
});
