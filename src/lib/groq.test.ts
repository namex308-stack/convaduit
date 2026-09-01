import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockGroqCreate = vi.fn();

vi.mock("groq-sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockGroqCreate,
      },
    },
  })),
}));

const mockGeminiGenerate = vi.fn();

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: mockGeminiGenerate,
    }),
  })),
}));

import type { NormalizedPage } from "@/lib/db/types";
import { generateGroqBatchedAnalysis, getGroqModelId, isGroqConfigured } from "@/lib/groq";
import { runBatchedPillarAnalysis } from "@/lib/gemini";

function page(): NormalizedPage {
  return {
    url: "https://shop.example.com/products/serum",
    title: "سيروم الوجه",
    description: "وصف منتج مناسب للبشرة الجافة.",
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

function validBatchedJson(overrides: Record<string, unknown> = {}) {
  return {
    pillars: {
      conversion: {
        score: 75,
        findings: ["زر الشراء واضح على الصفحة."],
        severity: "medium",
        summary: "أداء تحويل جيد مع مجال للتحسين.",
      },
      seo: {
        score: 70,
        findings: ["العنوان يحتوي على كلمات مفتاحية."],
        severity: "medium",
        summary: "أساسيات SEO موجودة.",
      },
      trust: {
        score: 65,
        findings: ["تقييمات العملاء ظاهرة."],
        severity: "medium",
        summary: "إشارات ثقة مقبولة.",
      },
    },
    recommendations: [],
    overallScoreHint: 70,
    ...overrides,
  };
}

describe("groq configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("isGroqConfigured is false without GROQ_API_KEY", () => {
    vi.stubEnv("GROQ_API_KEY", "");
    expect(isGroqConfigured()).toBe(false);
  });

  it("isGroqConfigured is true when GROQ_API_KEY is set", () => {
    vi.stubEnv("GROQ_API_KEY", "gsk_test_key");
    expect(isGroqConfigured()).toBe(true);
  });

  it("getGroqModelId defaults to openai/gpt-oss-120b", () => {
    vi.stubEnv("GROQ_MODEL", "");
    expect(getGroqModelId()).toBe("openai/gpt-oss-120b");
  });

  it("getGroqModelId reads GROQ_MODEL when set", () => {
    vi.stubEnv("GROQ_MODEL", "openai/gpt-oss-20b");
    expect(getGroqModelId()).toBe("openai/gpt-oss-20b");
  });
});

describe("generateGroqBatchedAnalysis", () => {
  beforeEach(() => {
    mockGroqCreate.mockReset();
    vi.stubEnv("GROQ_API_KEY", "gsk_test_key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns groq-sourced pillar analysis for valid JSON", async () => {
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(validBatchedJson()) } }],
      usage: { total_tokens: 512 },
    });

    const result = await generateGroqBatchedAnalysis(page(), null, null);
    expect(result.pillarSource).toBe("groq");
    expect(result.modules.conversion.score).toBe(75);
    expect(result.recommendationsResult.tokensUsed).toBe(512);
    expect(mockGroqCreate).toHaveBeenCalledOnce();
  });

  it("enforces Arabic output when Groq returns English findings", async () => {
    mockGroqCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(
              validBatchedJson({
                pillars: {
                  conversion: {
                    score: 75,
                    findings: ["Buy button is visible above the fold."],
                    severity: "medium",
                    summary: "Conversion is acceptable but CTA could be stronger.",
                  },
                  seo: {
                    score: 70,
                    findings: ["Title tag includes keywords."],
                    severity: "medium",
                    summary: "Basic SEO signals are present.",
                  },
                  trust: {
                    score: 65,
                    findings: ["Customer reviews are shown."],
                    severity: "medium",
                    summary: "Trust signals are moderate.",
                  },
                },
              })
            ),
          },
        },
      ],
      usage: { total_tokens: 400 },
    });

    const result = await generateGroqBatchedAnalysis(page(), null, null);
    expect(result.pillarSource).toBe("groq");
    expect(result.modules.conversion.summary).toMatch(/[\u0600-\u06FF]/);
    expect(result.modules.conversion.findings[0]).toMatch(/[\u0600-\u06FF]/);
  });
});

describe("runBatchedPillarAnalysis fallback ladder", () => {
  beforeEach(() => {
    mockGeminiGenerate.mockReset();
    mockGroqCreate.mockReset();
    vi.stubEnv("GEMINI_API_KEY", "gemini-test-key");
    vi.stubEnv("GROQ_API_KEY", "gsk_test_key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses Groq when Gemini fails", async () => {
    mockGeminiGenerate.mockRejectedValue(new Error("fetch failed"));
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(validBatchedJson()) } }],
      usage: { total_tokens: 300 },
    });

    const result = await runBatchedPillarAnalysis(page(), null, null);
    expect(result.pillarSource).toBe("groq");
    expect(mockGeminiGenerate).toHaveBeenCalledTimes(2);
    expect(mockGroqCreate).toHaveBeenCalledOnce();
  });

  it("uses heuristic when Gemini and Groq are unavailable", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GROQ_API_KEY", "");

    const result = await runBatchedPillarAnalysis(page(), null, null);
    expect(result.pillarSource).toBe("heuristic");
    expect(mockGroqCreate).not.toHaveBeenCalled();
  });

  it("uses heuristic when both Gemini and Groq fail", async () => {
    mockGeminiGenerate.mockRejectedValue(new Error("fetch failed"));
    mockGroqCreate.mockRejectedValue(new Error("fetch failed"));

    const result = await runBatchedPillarAnalysis(page(), null, null);
    expect(result.pillarSource).toBe("heuristic");
  });
});
