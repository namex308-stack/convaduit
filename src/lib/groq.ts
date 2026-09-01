import "server-only";

import Groq from "groq-sdk";
import type { NormalizedPage } from "@/lib/db/types";
import type { OnboardingAnswers } from "@/lib/types";
import {
  sanitizeBatchedPillarAnalysis,
  type BatchedPillarAnalysis,
} from "@/lib/ai/sanitize-analyzer";
import { enrichTrustSubChecks } from "@/lib/audit/score-modules";
import { normalizeAppLocale, type AppLocale } from "@/lib/locale";
import { withRetry } from "@/lib/automation/retry";
import {
  buildBatchedPillarPrompt,
  enforceArabicBatchedOutput,
  heuristicBatchedPillarAnalysis,
  isRetryableGeminiTransportError,
  stripCodeFences,
  syncBatchedPerPillarResults,
} from "@/lib/gemini";

/** Interactive Groq calls — one retry max so the UI is not kept waiting. */
const GROQ_INTERACTIVE_RETRY_POLICY = {
  maxAttempts: 2,
  jitter: false,
} as const;

let _client: Groq | null = null;

function getClient(): Groq | null {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;
  if (!_client) _client = new Groq({ apiKey: key });
  return _client;
}

export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY?.trim();
}

/**
 * Default Groq model — `openai/gpt-oss-120b` (Groq's recommended replacement for
 * retired llama-3.3-70b-versatile). Override with GROQ_MODEL (e.g. openai/gpt-oss-20b).
 */
export function getGroqModelId(): string {
  const fromEnv = process.env.GROQ_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return "openai/gpt-oss-120b";
}

async function generateGroqChatCompletion(
  client: Groq,
  prompt: string,
  label: string
): Promise<{ text: string; tokensUsed?: number }> {
  return withRetry(
    async () => {
      const completion = await client.chat.completions.create({
        model: getGroqModelId(),
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });
      const text = completion.choices[0]?.message?.content;
      if (!text?.trim()) {
        throw new Error("Empty Groq completion");
      }
      const tokensUsed =
        typeof completion.usage?.total_tokens === "number"
          ? completion.usage.total_tokens
          : undefined;
      return { text, tokensUsed };
    },
    {
      policy: GROQ_INTERACTIVE_RETRY_POLICY,
      shouldRetry: isRetryableGeminiTransportError,
      onAttemptFailure: ({ attempt, error }) => {
        console.warn(
          `[groq] ${label} transport attempt ${attempt} failed:`,
          error instanceof Error ? error.message : error
        );
      },
    }
  );
}

/**
 * Run batched conversion/SEO/trust pillar analysis via Groq.
 * Same prompt, schema, anchors, and Arabic enforcement as Gemini.
 */
export async function generateGroqBatchedAnalysis(
  page: NormalizedPage,
  competitor: NormalizedPage | null,
  onboarding: OnboardingAnswers | null,
  outputLocale: AppLocale | string | null = "ar"
): Promise<BatchedPillarAnalysis> {
  const client = getClient();
  if (!client) {
    throw new Error("Groq not configured");
  }

  const locale = normalizeAppLocale(outputLocale);
  const heuristic = heuristicBatchedPillarAnalysis(page, competitor);
  const prompt = buildBatchedPillarPrompt(page, competitor, onboarding, locale);

  const { text, tokensUsed } = await generateGroqChatCompletion(
    client,
    prompt,
    "batched pillar analysis"
  );
  const parsed = JSON.parse(stripCodeFences(text)) as unknown;
  let sanitized = sanitizeBatchedPillarAnalysis(parsed);
  sanitized.pillarSource = "groq";

  sanitized.modules.trust = enrichTrustSubChecks(page, sanitized.modules.trust, {
    adjustScore: false,
  });
  if (competitor && sanitized.competitorModules?.trust) {
    sanitized.competitorModules.trust = enrichTrustSubChecks(
      competitor,
      sanitized.competitorModules.trust,
      { adjustScore: false }
    );
  }

  void locale;
  sanitized = enforceArabicBatchedOutput(sanitized, heuristic, "groq");
  sanitized = syncBatchedPerPillarResults(sanitized);

  if (tokensUsed != null) {
    sanitized.recommendationsResult.tokensUsed = tokensUsed;
  }

  return sanitized;
}
