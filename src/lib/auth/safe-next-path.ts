import { ROUTES } from "@/lib/routes";
import { resolveAppEntryFromProfile, type ProfileGateRow } from "@/lib/auth/profile-gate";

/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Blocks protocol-relative URLs, absolute URLs, marketing home, and auth entry
 * (open redirect + post-OAuth landing loops).
 */
const POST_AUTH_BLOCKED_PATHS = new Set<string>([ROUTES.home, ROUTES.auth]);

function pathnameOnly(raw: string): string {
  const withoutHash = raw.split("#")[0] ?? raw;
  const withoutQuery = withoutHash.split("?")[0] ?? withoutHash;
  if (!withoutQuery) return "/";
  return withoutQuery.endsWith("/") && withoutQuery.length > 1
    ? withoutQuery.replace(/\/+$/, "")
    : withoutQuery;
}

function isBlockedPostAuthPath(raw: string): boolean {
  const pathname = pathnameOnly(raw);
  if (POST_AUTH_BLOCKED_PATHS.has(pathname)) return true;
  return pathname === ROUTES.auth || pathname.startsWith(`${ROUTES.auth}/`);
}

export function isAllowedExplicitPostAuthPath(
  raw: string | null | undefined
): raw is string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return false;
  return !isBlockedPostAuthPath(raw);
}

export function safeNextPath(raw: string | null | undefined, fallback: string = ROUTES.dashboard): string {
  if (!isAllowedExplicitPostAuthPath(raw)) {
    return fallback;
  }
  return raw;
}

/**
 * Pick the post-auth destination: honor explicit in-app `next`, otherwise route by
 * onboarding completion (new users → onboarding resume, completed → dashboard).
 */
export function resolvePostAuthPath(
  rawNext: string | null | undefined,
  profile: ProfileGateRow | null | undefined
): string {
  if (isAllowedExplicitPostAuthPath(rawNext)) {
    return rawNext;
  }
  return resolveAppEntryFromProfile(profile);
}
