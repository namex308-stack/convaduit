import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { buildLoginRedirectTarget } from "@/lib/auth/login-redirect";
import {
  PROFILE_GATE_SELECT,
  resolveAppEntryFromProfile,
  type ProfileGateRow,
} from "@/lib/auth/profile-gate";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import {
  computeResumeStep,
  isOnboardingGatedPath,
  isOnboardingPath,
  onboardingIndexResumeRedirect,
  onboardingPathForStep,
} from "@/lib/onboarding/constants";
import {
  AUTH_APP_PATHS,
  PROTECTED_APP_PATHS,
} from "@/lib/seo/private-app-paths";
import { ROUTES } from "@/lib/routes";
import {
  hasSupabaseSessionCookie,
  shouldRefreshAuthSession,
} from "@/lib/supabase/auth-cookie";

/** App routes that require a Supabase session. */
const PROTECTED_PATHS = [...PROTECTED_APP_PATHS];

/** Real auth entry in this app (no /login or /signup pages). */
const AUTH_PATHS = [...AUTH_APP_PATHS];

/** Guard against Supabase network hangs blocking the whole request. */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  const guarded = Promise.resolve(promise).catch(() => fallback);
  return Promise.race([
    guarded,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Refresh the Supabase session cookie when a session cookie is present, then gate
 * protected App Router paths whenever Supabase is configured.
 * Anonymous public traffic skips getUser() to keep TTFB low.
 * Incomplete onboarding redirects to the resume step (Supabase is source of truth).
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAuthCallback = pathname === "/auth/callback";

  // Supabase may fall back to Site URL (/) with ?code= when redirectTo is not allowlisted.
  if (pathname === ROUTES.home && request.nextUrl.searchParams.has("code")) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    if (!callbackUrl.searchParams.get("next")) {
      callbackUrl.searchParams.set("next", ROUTES.onboarding);
    }
    return NextResponse.redirect(callbackUrl);
  }

  if (!url || !anonKey) {
    if (isProtected) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth";
      loginUrl.searchParams.set("error", "supabase_not_configured");
      loginUrl.searchParams.set(
        "next",
        buildLoginRedirectTarget(pathname, request.nextUrl.search, {
          isOnboardingRoute: isOnboardingPath(pathname),
        })
      );
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const hasSessionCookie = hasSupabaseSessionCookie(request.cookies.getAll());
  if (!hasSessionCookie && !isAuthCallback) {
    if (isProtected) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth";
      loginUrl.searchParams.set(
        "next",
        buildLoginRedirectTarget(pathname, request.nextUrl.search, {
          isOnboardingRoute: isOnboardingPath(pathname),
        })
      );
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  let user: { id: string } | null = null;
  if (
    shouldRefreshAuthSession({
      hasSessionCookie,
      isAuthCallback,
    })
  ) {
    try {
      const result = await withTimeout(
        supabase.auth.getUser(),
        5000,
        { data: { user: null }, error: null } as never
      );
      user = result.data.user;
    } catch {
      user = null;
    }
  }

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth";
    loginUrl.searchParams.set(
      "next",
      buildLoginRedirectTarget(pathname, request.nextUrl.search, {
        isOnboardingRoute: isOnboardingPath(pathname),
      })
    );
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPath && !isAuthCallback) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (user && pathname === ROUTES.home) {
    try {
      const profileResult = await withTimeout<{ data: ProfileGateRow | null }>(
        Promise.resolve(
          supabase
            .from("profiles")
            .select(PROFILE_GATE_SELECT)
            .eq("id", user.id)
            .maybeSingle()
        ).then((r) => ({ data: (r.data as ProfileGateRow | null) ?? null })),
        4000,
        { data: null }
      );
      const entry = resolveAppEntryFromProfile(profileResult.data);
      return NextResponse.redirect(new URL(entry, request.url));
    } catch {
      return NextResponse.redirect(new URL(ROUTES.onboarding, request.url));
    }
  }

  // Mandatory onboarding gate — Supabase profile is the source of truth.
  if (user && (isOnboardingGatedPath(pathname) || isOnboardingPath(pathname))) {
    try {
      type ProfileGate = ProfileGateRow | null;

      const profileResult = await withTimeout<{ data: ProfileGate }>(
        Promise.resolve(
          supabase
            .from("profiles")
            .select(PROFILE_GATE_SELECT)
            .eq("id", user.id)
            .maybeSingle()
        ).then((r) => ({ data: (r.data as ProfileGate) ?? null })),
        4000,
        { data: null }
      );

      const completed = Boolean(profileResult.data?.onboarding_completed_at);
      const row = profileResult.data;
      const step = computeResumeStep({
        businessName: row?.business_name ?? "",
        storeUrl: row?.store_url ?? "",
        country: row?.country ?? "",
        primaryLanguage: row?.primary_language ?? "",
        platform: row?.platform ?? "",
        storeSize: row?.store_size ?? "",
        businessCategory: row?.business_category ?? "",
        primaryGoal: row?.primary_goal ?? "",
        monthlyTraffic: row?.monthly_traffic ?? "",
        monthlyOrders: row?.monthly_orders ?? "",
        mainChallenge: row?.main_challenge ?? "",
      });

      const resume = onboardingPathForStep(step);

      if (!completed && isOnboardingGatedPath(pathname)) {
        return NextResponse.redirect(new URL(resume, request.url));
      }

      const indexResume = onboardingIndexResumeRedirect(pathname, completed, resume);
      if (indexResume) {
        return NextResponse.redirect(new URL(indexResume, request.url));
      }

      // Completed users who revisit the wizard (except /done celebration) go to dashboard.
      if (
        completed &&
        isOnboardingPath(pathname) &&
        pathname !== "/onboarding/done"
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // Fail closed: incomplete onboarding must not reach gated product routes
      // when the profile lookup errors or times out.
      if (isOnboardingGatedPath(pathname)) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  }

  return response;
}
