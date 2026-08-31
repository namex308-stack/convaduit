import { describe, expect, it } from "vitest";
import { arMessages } from "@/lib/locale/messages/ar";

describe("dashboard copy honesty", () => {
  it("does not ship hardcoded fake deltas in dashboard strings", () => {
    expect(arMessages["dashboard.thisQuarter"]).not.toMatch(/\+\d+/);
    expect(arMessages["dashboard.sinceMay"]).not.toMatch(/\+\d+/);
    expect(arMessages["dashboard.auditsPerMonth"]).not.toMatch(/^\d+/);
  });
});
