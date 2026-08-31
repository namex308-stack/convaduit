"use client";

import * as React from "react";
import { parseApiErrorResponse } from "@/lib/api/client-error";

export type UseApiQueryOptions<T> = {
  url: string;
  parse: (json: unknown) => T;
  fallbackError: string;
  signInMessage: string;
  notFoundMessage?: string;
  enabled?: boolean;
  deps?: React.DependencyList;
};

export type UseApiQueryResult<T> = {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  error: string | null;
  needsAuth: boolean;
  needsUpgrade: boolean;
  loading: boolean;
  retry: () => void;
};

/** Standard client fetch + entitlement-aware error handling for app pages. */
export function useApiQuery<T>({
  url,
  parse,
  fallbackError,
  signInMessage,
  notFoundMessage,
  enabled = true,
  deps = [],
}: UseApiQueryOptions<T>): UseApiQueryResult<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = React.useState(false);
  const [needsUpgrade, setNeedsUpgrade] = React.useState(false);
  const [loading, setLoading] = React.useState(enabled);
  const [retryKey, setRetryKey] = React.useState(0);

  const retry = React.useCallback(() => setRetryKey((key) => key + 1), []);

  React.useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setNeedsAuth(false);
    setNeedsUpgrade(false);

    async function load() {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 404 && notFoundMessage) {
            if (!cancelled) {
              setData(null);
              setError(notFoundMessage);
              setLoading(false);
            }
            return;
          }

          const parsed = await parseApiErrorResponse(
            res,
            fallbackError,
            signInMessage
          );
          if (!cancelled) {
            setData(null);
            setNeedsAuth(parsed.needsAuth);
            setNeedsUpgrade(parsed.needsUpgrade);
            setError(parsed.message);
            setLoading(false);
          }
          return;
        }

        const json = (await res.json()) as unknown;
        if (!cancelled) {
          setData(parse(json));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setData(null);
          setError(fallbackError);
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [url, fallbackError, signInMessage, notFoundMessage, enabled, retryKey, ...deps]);

  return { data, setData, error, needsAuth, needsUpgrade, loading, retry };
}
