export type ApiErrorState = {
  message: string;
  needsAuth: boolean;
  needsUpgrade: boolean;
};

/** Append a correlation id to a user-facing error without leaking secrets. */
export function withRequestId(message: string, requestId?: string | null): string {
  const id = requestId?.trim();
  if (!id) return message;
  if (message.includes(id)) return message;
  return `${message} رقم التتبع: ${id}`;
}

/** Parse a failed fetch response into user-facing recovery state. */
export async function parseApiErrorResponse(
  res: Response,
  fallback: string,
  signInMessage: string
): Promise<ApiErrorState> {
  if (res.status === 401) {
    return { message: signInMessage, needsAuth: true, needsUpgrade: false };
  }

  try {
    const body = (await res.json()) as { error?: unknown; requestId?: unknown };
    const requestId = typeof body.requestId === "string" ? body.requestId : undefined;
    if (typeof body.error === "string" && body.error.trim()) {
      return {
        message: withRequestId(body.error, requestId),
        needsAuth: false,
        needsUpgrade: res.status === 403,
      };
    }
  } catch {
    // Non-JSON or empty body — fall through to generic message.
  }

  return { message: fallback, needsAuth: false, needsUpgrade: false };
}
