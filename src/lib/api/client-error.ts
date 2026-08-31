export type ApiErrorState = {
  message: string;
  needsAuth: boolean;
  needsUpgrade: boolean;
};

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
    const body = (await res.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error.trim()) {
      return {
        message: body.error,
        needsAuth: false,
        needsUpgrade: res.status === 403,
      };
    }
  } catch {
    // Non-JSON or empty body — fall through to generic message.
  }

  return { message: fallback, needsAuth: false, needsUpgrade: false };
}
