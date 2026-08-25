/**
 * Detect a Supabase SSR session cookie without calling Auth.
 * Cookie names look like `sb-<ref>-auth-token` (optionally chunked `.0`, `.1`).
 * The PKCE verifier is not a session and must not count.
 */
export function hasSupabaseSessionCookie(
  cookies: readonly { name: string; value: string }[]
): boolean {
  return cookies.some(
    (cookie) =>
      Boolean(cookie.value) &&
      cookie.name.includes("-auth-token") &&
      !cookie.name.includes("code-verifier")
  );
}

/**
 * Whether middleware should call `supabase.auth.getUser()` (network + JWT verify).
 * Anonymous public traffic skips this; protected routes still redirect when unsigned.
 */
export function shouldRefreshAuthSession(input: {
  hasSessionCookie: boolean;
  isAuthCallback: boolean;
}): boolean {
  if (input.isAuthCallback) return false;
  return input.hasSessionCookie;
}
