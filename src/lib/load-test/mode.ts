/**
 * Load-test signal for POST /api/audit.
 * Mock Gemini/Firecrawl only in development and test.
 * Production (and any other NODE_ENV) rejects the header/query outright.
 */

export const LOAD_TEST_HEADER = "x-load-test";
export const LOAD_TEST_QUERY = "loadTest";

export type LoadTestRequestSignal = {
  headerValue: string | null;
  queryValue: string | null;
};

export type LoadTestMode = "off" | "mock" | "rejected";

function isTruthyFlag(raw: string | null | undefined): boolean {
  if (typeof raw !== "string") return false;
  const value = raw.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

export function hasLoadTestSignal(signal: LoadTestRequestSignal): boolean {
  return isTruthyFlag(signal.headerValue) || isTruthyFlag(signal.queryValue);
}

/** `next dev` and Vitest only — never preview/production `NODE_ENV=production`. */
export function isLoadTestMockEnv(env: { NODE_ENV?: string } = process.env): boolean {
  return env.NODE_ENV === "development" || env.NODE_ENV === "test";
}

export function resolveLoadTestMode(
  signal: LoadTestRequestSignal,
  env: { NODE_ENV?: string } = process.env
): LoadTestMode {
  if (!hasLoadTestSignal(signal)) return "off";
  if (isLoadTestMockEnv(env)) return "mock";
  return "rejected";
}

export function loadTestSignalFromHeaders(
  headers: Headers,
  url: URL
): LoadTestRequestSignal {
  return {
    headerValue: headers.get(LOAD_TEST_HEADER),
    queryValue: url.searchParams.get(LOAD_TEST_QUERY),
  };
}
