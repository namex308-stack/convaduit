import { describe, expect, it } from "vitest";
import {
  OG_STORE_NAME_FALLBACK,
  OG_STORE_NAME_MAX,
  OG_TITLE_FALLBACK,
  OG_TITLE_MAX,
  ogFontSubsetText,
  sanitizeOgAnalysisTitle,
  sanitizeOgStoreName,
  sanitizeOgText,
} from "@/lib/og-text";

describe("sanitizeOgText", () => {
  it("never returns undefined/null and is always a string", () => {
    for (const input of [undefined, null, 0, false, {}, [], ""]) {
      const out = sanitizeOgText(input, { fallback: "ConvAudit" });
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
      expect(typeof out.codePointAt(0)).toBe("number");
    }
  });

  it("preserves Arabic analysis copy within the length cap", () => {
    const title = "حوّل كل صفحة منتج إلى آلة تحويل مبيعات";
    expect(sanitizeOgAnalysisTitle(title)).toBe(title);
  });

  it("preserves Latin store names", () => {
    expect(sanitizeOgStoreName("Acme Store")).toBe("Acme Store");
  });

  it("falls back when store name or analysis title is missing", () => {
    expect(sanitizeOgStoreName(undefined)).toBe(OG_STORE_NAME_FALLBACK);
    expect(sanitizeOgStoreName(null)).toBe(OG_STORE_NAME_FALLBACK);
    expect(sanitizeOgAnalysisTitle(undefined)).toBe(OG_TITLE_FALLBACK);
    expect(sanitizeOgAnalysisTitle("   ")).toBe(OG_TITLE_FALLBACK);
  });

  it("truncates to the requested maximum length in code points", () => {
    const long = "م".repeat(OG_STORE_NAME_MAX + 20);
    const out = sanitizeOgStoreName(long);
    expect(Array.from(out).length).toBe(OG_STORE_NAME_MAX);
  });

  it("strips control characters, zero-width marks, and emoji that break Satori", () => {
    const out = sanitizeOgText("Hello\u0000\u200B 🌍 World\uFE0F", {
      fallback: "x",
    });
    expect(out).toBe("Hello World");
    expect(out).not.toContain("\u0000");
    expect(out).not.toContain("🌍");
  });

  it("caps analysis titles at OG_TITLE_MAX", () => {
    const long = "تحليل ".repeat(40);
    const out = sanitizeOgAnalysisTitle(long);
    expect(Array.from(out).length).toBeLessThanOrEqual(OG_TITLE_MAX);
  });
});

describe("ogFontSubsetText", () => {
  it("returns unique safe glyphs and never an empty string", () => {
    const subset = ogFontSubsetText("aaab", "ba", undefined);
    expect(subset).toBe("ab");
    expect(ogFontSubsetText("", undefined)).toBe(OG_STORE_NAME_FALLBACK);
  });
});
