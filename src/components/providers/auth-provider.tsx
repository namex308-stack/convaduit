"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext, UNAUTHED_AUTH, type AuthContextValue } from "@/components/providers/auth-context";
import { ROUTES } from "@/lib/routes";

export { AuthContext, useAuth, UNAUTHED_AUTH, type AuthContextValue } from "@/components/providers/auth-context";

type OnboardingPayload = {
  onboarding?: { completed?: boolean; resumePath?: string };
};

/**
 * Production fallback: Supabase Site URL can land OAuth on `/` with a session
 * already in the browser. Middleware handles cookie-based redirects; this
 * covers client-established sessions without a full document reload.
 */
function AuthedMarketingRedirect({
  user,
  loading,
}: {
  user: AuthContextValue["user"];
  loading: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const redirectedRef = React.useRef(false);

  React.useEffect(() => {
    if (loading || !user || redirectedRef.current || pathname !== ROUTES.home) {
      return;
    }
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).has("code")) return;

    redirectedRef.current = true;
    void fetch("/api/onboarding")
      .then((res) => (res.ok ? (res.json() as Promise<OnboardingPayload>) : null))
      .then((data) => {
        if (data?.onboarding?.completed) {
          router.replace(ROUTES.dashboard);
          return;
        }
        router.replace(data?.onboarding?.resumePath ?? ROUTES.onboarding);
      })
      .catch(() => {
        router.replace(ROUTES.onboarding);
      });
  }, [loading, pathname, router, user]);

  return null;
}

export function AuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AuthContextValue;
}) {
  return (
    <AuthContext.Provider value={value}>
      <AuthedMarketingRedirect user={value.user} loading={value.loading} />
      {children}
    </AuthContext.Provider>
  );
}
