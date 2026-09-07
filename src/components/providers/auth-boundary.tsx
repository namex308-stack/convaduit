"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { isAuthRuntimePath } from "@/lib/app-routes";
import { AuthProvider } from "@/components/providers/auth-provider";
import { UNAUTHED_AUTH, type AuthContextValue } from "@/components/providers/auth-context";

function hasBrowserSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => {
    const name = part.trim().split("=")[0] ?? "";
    return name.includes("-auth-token") && !name.includes("code-verifier");
  });
}

/**
 * Keeps `@supabase/supabase-js` out of anonymous marketing bundles.
 * The context wrapper is stable so app-shell children do not remount when
 * the session module loads.
 */
export function AuthBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const needsAuth = isAuthRuntimePath(pathname);
  const [sessionHint, setSessionHint] = React.useState(false);
  const [value, setValue] = React.useState<AuthContextValue>(() =>
    needsAuth ? { ...UNAUTHED_AUTH, loading: true } : UNAUTHED_AUTH
  );

  React.useEffect(() => {
    if (hasBrowserSessionCookie()) setSessionHint(true);
  }, [pathname]);

  const loadSession = needsAuth || sessionHint;

  React.useEffect(() => {
    if (!loadSession) {
      setValue(UNAUTHED_AUTH);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    setValue((current) => (current.loading ? current : { ...UNAUTHED_AUTH, loading: true }));

    void import("@/components/providers/auth-session").then(({ subscribeAuth }) => {
      if (cancelled) return;
      unsubscribe = subscribeAuth((next) => {
        if (!cancelled) setValue(next);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [loadSession]);

  return <AuthProvider value={value}>{children}</AuthProvider>;
}
