/** Product-shell prefixes — kept free of icon imports so layout JS stays small. */
export const APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/health",
  "/audit",
  "/history",
  "/reports",
  "/monitor",
  "/geo",
  "/alerts",
  "/notifications",
  "/tasks",
  "/settings",
  "/onboarding",
] as const;

export function isAppShellRoute(pathname: string): boolean {
  return APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Routes that need the full Supabase browser client (session, sign-out, checkout). */
export function isAuthRuntimePath(pathname: string): boolean {
  if (isAppShellRoute(pathname)) return true;
  if (pathname === "/auth" || pathname.startsWith("/auth/")) return true;
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) return true;
  return false;
}
