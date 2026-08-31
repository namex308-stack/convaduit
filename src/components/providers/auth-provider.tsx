"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { useAppStore } from "@/lib/store";
import { PROFILE_UPDATED_EVENT } from "@/lib/auth/display-user";
import { clearCachedShell } from "@/lib/app/shell-cache";
import { ROUTES } from "@/lib/routes";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthed: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

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
  user: User | null;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const clearLocalSession = useAppStore((s) => s.clearLocalSession);

  React.useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const settle = () => {
      if (mounted) setLoading(false);
    };
    const settleTimer = window.setTimeout(settle, 4_000);

    try {
      const {
        data: { subscription: nextSubscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!mounted) return;
        window.clearTimeout(settleTimer);
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      });
      subscription = nextSubscription;
    } catch {
      window.clearTimeout(settleTimer);
      settle();
    }

    const onProfileUpdated = () => {
      void supabase.auth
        .refreshSession()
        .then(({ data }) => {
          if (!mounted) return;
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
          }
        })
        .catch(() => {
          // Network failures during refresh are non-fatal for the UI.
        });
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);

    return () => {
      mounted = false;
      window.clearTimeout(settleTimer);
      subscription?.unsubscribe();
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    };
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseBrowser();
    clearLocalSession();
    clearCachedShell();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthed: !!user,
        signOut,
      }}
    >
      <AuthedMarketingRedirect user={user} loading={loading} />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
