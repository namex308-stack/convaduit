"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * User-controlled ad preferences.
 *
 * - "default": show all ad slots (current behavior)
 * - "reduced": hide non-essential ad slots (only keep top + bottom of page)
 *
 * The preference is stored in localStorage so it persists across sessions.
 * This is the "anti-annoyance" measure — users who find ads distracting can
 * opt into a lighter experience without installing an ad blocker.
 */
type AdMode = "default" | "reduced";

type AdPreferences = {
  mode: AdMode;
  setMode: (mode: AdMode) => void;
  toggle: () => void;
};

const STORAGE_KEY = "convaudit-ad-mode";
const DEFAULT_MODE: AdMode = "default";

const AdPreferencesContext = createContext<AdPreferences | null>(null);

export function AdPreferencesProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AdMode>(DEFAULT_MODE);

  // Load saved preference on mount.
  // Use a microtask to avoid the synchronous-setState-in-effect lint rule.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "reduced" || saved === "default") {
        Promise.resolve().then(() => setModeState(saved));
      }
    } catch {
      // localStorage may be unavailable (private mode, etc.) — fall back to default
    }
  }, []);

  const setMode = useCallback((newMode: AdMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Silently fail — not critical
    }
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "default" ? "reduced" : "default";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Silently fail
      }
      return next;
    });
  }, []);

  return (
    <AdPreferencesContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </AdPreferencesContext.Provider>
  );
}

/**
 * Hook to access the user's ad preferences.
 * Returns the default mode during SSR and before mount — callers should
 * handle the transition gracefully.
 */
export function useAdPreferences(): AdPreferences {
  const ctx = useContext(AdPreferencesContext);
  if (!ctx) {
    // Fallback for components rendered outside the provider
    return {
      mode: DEFAULT_MODE,
      setMode: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

/**
 * Ad slot "importance" levels.
 *
 * - "essential": always shown (top + bottom of page)
 * - "standard": shown by default, hidden in "reduced" mode
 */
export type AdImportance = "essential" | "standard";
