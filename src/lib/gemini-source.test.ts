import { afterEach, describe, expect, it, vi } from "vitest";
import { runAudit } from "@/lib/gemini";
import type { NormalizedPage } from "@/lib/db/types";

vi.mock("server-only", () => ({}));

function page(): NormalizedPage {
  return {
    url: "https://shop.example.com/products/serum",
    title: "سيروم الوجه",
    description: "وصف منتج مناسب للبشرة الجافة والحساسة مع فوائد واضحة.",
    pageType: "product",
    markdown: "# سيروم\n\nاشترِ الآن مع ضمان الإرجاع.",
    imageCount: 2,
    contentHash: "hash",
    structuredData: {
      hasPriceSignal: true,
      hasCtaSignal: true,
      price: "199",
      brand: "Glow",
      rating: 4.5,
      jsonLdTypes: ["Product"],
      faq: [{ q: "هل يناسب البشرة الدهنية؟", a: "نعم" }],
    },
    scrapeStatus: "ok",
  };
}

describe("audit analysis source labeling", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not label heuristic pillar analysis as Gemini when the key is missing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const audit = await runAudit(page(), null, null);
    expect(audit.demoMode).toBe(true);
    const recSources = (audit.recommendations ?? []).map((r) => r.source);
    expect(recSources.some((s) => s === "gemini")).toBe(false);
  });

  it("forceHeuristic skips Gemini even when an API key is present", async () => {
    vi.stubEnv("GEMINI_API_KEY", "fake-key-for-load-test");
    const audit = await runAudit(page(), null, null, { forceHeuristic: true });
    expect(audit.demoMode).toBe(true);
    const recSources = (audit.recommendations ?? []).map((r) => r.source);
    expect(recSources.some((s) => s === "gemini")).toBe(false);
  });
});
