const REQUEST_ID_HEADER = "x-request-id";
const VERCEL_ID_HEADER = "x-vercel-id";

/** Correlate one audit attempt across Vercel logs, API JSON, and persisted failures. */
export function getAuditRequestId(headers: Headers): string {
  const vercelId = headers.get(VERCEL_ID_HEADER)?.trim();
  if (vercelId && vercelId.length <= 256) return vercelId;

  const incoming = headers.get(REQUEST_ID_HEADER)?.trim();
  if (incoming && /^[\w.:-]{8,128}$/.test(incoming)) return incoming;

  return crypto.randomUUID();
}

export function auditRequestHeaders(requestId: string): HeadersInit {
  return { [REQUEST_ID_HEADER]: requestId };
}

export function logAuditStage(
  requestId: string,
  stage: string,
  extra?: Record<string, unknown>
): void {
  console.info("[audit]", { requestId, stage, ...extra });
}
