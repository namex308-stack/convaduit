import { describe, expect, it } from "vitest";
import { arMessages } from "@/lib/locale/messages/ar";

describe("dashboard copy honesty", () => {
  it("does not ship hardcoded fake deltas in dashboard strings", () => {
    expect(arMessages["dashboard.thisQuarter"]).not.toMatch(/\+\d+/);
    expect(arMessages["dashboard.sinceMay"]).not.toMatch(/\+\d+/);
    expect(arMessages["dashboard.auditsPerMonth"]).not.toMatch(/^\d+/);
  });

  it("asks for a second real audit instead of drawing a one-point trend", () => {
    expect(arMessages["dashboard.trendEmpty"]).toBe(
      "شغّل تحليل تاني بعد ما تصلح المشاكل عشان تشوف تقدمك هنا"
    );
  });
});
