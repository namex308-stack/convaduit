/**
 * JSON fetch for known third-party APIs (Google, GeoJS, RDAP).
 * Not used for user-supplied crawl URLs — those go through fetchSafePublicHttpUrl.
 */

const USER_AGENT = "ConvAudit/0.3 (+https://www.convaudit.com)";

export type FetchJsonSuccess = {
  ok: true;
  status: number;
  json: unknown;
};

export type FetchJsonFailure = {
  ok: false;
  status: number | null;
  error: string;
};

export type FetchJsonResult = FetchJsonSuccess | FetchJsonFailure;

export async function fetchJson(
  url: string,
  init: {
    timeoutMs?: number;
    headers?: Record<string, string>;
    method?: string;
  } = {}
): Promise<FetchJsonResult> {
  const timeoutMs = init.timeoutMs ?? 12_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: init.method ?? "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        ...init.headers,
      },
      signal: controller.signal,
      redirect: "follow",
    });

    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: `HTTP ${res.status}`,
      };
    }

    if (!text.trim()) {
      return { ok: true, status: res.status, json: {} };
    }

    try {
      return { ok: true, status: res.status, json: JSON.parse(text) as unknown };
    } catch {
      return { ok: false, status: res.status, error: "Invalid JSON response." };
    }
  } catch (err) {
    const aborted =
      (err instanceof Error && err.name === "AbortError") ||
      (err instanceof DOMException && err.name === "AbortError");
    return {
      ok: false,
      status: null,
      error: aborted
        ? "Request timed out."
        : err instanceof Error
          ? err.message
          : "Network error.",
    };
  } finally {
    clearTimeout(timer);
  }
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
