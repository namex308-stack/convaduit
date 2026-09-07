"use client";

import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { useAppStore } from "@/lib/store";
import { PROFILE_UPDATED_EVENT } from "@/lib/auth/display-user";
import { clearCachedShell } from "@/lib/app/shell-cache";
import type { AuthContextValue } from "@/components/providers/auth-context";
import { UNAUTHED_AUTH } from "@/components/providers/auth-context";

export type AuthSessionListener = (value: AuthContextValue) => void;

/**
 * Browser auth subscription. Imported only from AuthBoundary after we know
 * the route actually needs Supabase (keeps marketing bundles free of supabase-js).
 */
export function subscribeAuth(onChange: AuthSessionListener): () => void {
  const supabase = getSupabaseBrowser();
  if (!supabase) {
    onChange(UNAUTHED_AUTH);
    return () => {};
  }

  let mounted = true;
  let subscription: { unsubscribe: () => void } | null = null;

  const emit = (user: User | null, session: Session | null, loading: boolean) => {
    if (!mounted) return;
    onChange({
      user,
      session,
      loading,
      isAuthed: !!user,
      signOut,
    });
  };

  const signOut = async () => {
    useAppStore.getState().clearLocalSession();
    clearCachedShell();
    if (supabase) {
      await supabase.auth.signOut();
    }
    emit(null, null, false);
  };

  emit(null, null, true);
  const settleTimer = window.setTimeout(() => emit(null, null, false), 4_000);

  try {
    const {
      data: { subscription: nextSubscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.clearTimeout(settleTimer);
      emit(nextSession?.user ?? null, nextSession, false);
    });
    subscription = nextSubscription;
  } catch {
    window.clearTimeout(settleTimer);
    emit(null, null, false);
  }

  const onProfileUpdated = () => {
    void supabase.auth
      .refreshSession()
      .then(({ data }) => {
        if (data.session) {
          emit(data.session.user, data.session, false);
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
}
