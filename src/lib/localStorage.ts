/**
 * Local storage service for tracking and managing privacy-related preferences.
 *
 * All user data is stored client-side only. Nothing is sent to any server.
 */

const STORAGE_PREFIX = "convaudit_";

export const STORAGE_KEYS = {
  privacyTrackingEnabled: "privacy_tracking_enabled",
  privacyShowStatus: "privacy_show_status",
  homepageCategory: "homepage_category",
  lastToolCategory: "last_tool_category",
  toolLayout: "tool_layout_prefs",
  privacyAcknowledged: "privacy_acknowledged",
  recentTools: "recent_tools",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export type RecentToolsData = {
  tools: string[];
  error: string | null;
};

export function parseRecentTools(raw: string | null): RecentToolsData {
  if (raw === null) return { tools: [], error: null };

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return {
      tools: [],
      error: "Saved recent tools data is invalid and could not be read.",
    };
  }

  if (!Array.isArray(value)) {
    return {
      tools: [],
      error: "Saved recent tools data is invalid; expected a list.",
    };
  }

  const tools = value.filter((entry): entry is string => typeof entry === "string");
  return {
    tools,
    error:
      tools.length === value.length
        ? null
        : "Some saved recent tools were invalid and have been skipped.",
  };
}

const DEFAULT_VALUES: Record<StorageKey, unknown> = {
  [STORAGE_KEYS.privacyTrackingEnabled]: false,
  [STORAGE_KEYS.privacyShowStatus]: true,
  [STORAGE_KEYS.homepageCategory]: "all",
  [STORAGE_KEYS.lastToolCategory]: "all",
  [STORAGE_KEYS.toolLayout]: JSON.stringify({ showAds: true, showFaq: true, showHowTo: true, layoutColumns: 1 }),
  [STORAGE_KEYS.privacyAcknowledged]: false,
  [STORAGE_KEYS.recentTools]: JSON.stringify([]),
};

function getItem<T>(key: StorageKey): T | null {
  if (typeof window === "undefined" || !window.localStorage) return null;

  try {
    const item = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch {
    return window.localStorage.getItem(STORAGE_PREFIX + key) as unknown as T;
  }
}

function setItem(key: StorageKey, value: unknown): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;

  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[localStorage] Failed to set ${key}:`, err);
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      const keysToKeep = new Set<string>(LIST_ALL_KEYS);
      keysToKeep.delete(key);
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const k = window.localStorage.key(i);
        if (k?.startsWith(STORAGE_PREFIX) && !keysToKeep.has(k.replace(STORAGE_PREFIX, ""))) {
          window.localStorage.removeItem(k);
        }
      }
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    }
    return false;
  }
}

export function removeItem(key: StorageKey): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Ignore
  }
}

export function getAllPrefs(): Record<StorageKey, unknown> {
  const result = {} as Record<StorageKey, unknown>;
  for (const key of LIST_ALL_KEYS) {
    const value = getItem(key) ?? DEFAULT_VALUES[key];
    result[key] = value;
  }
  return result;
}

export function setPref<K extends StorageKey>(key: K, value: unknown): boolean {
  const success = setItem(key, value);
  if (success && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("convaudit:pref-change", { detail: { key, value } }));
  }
  return success;
}

export function clearPref(key: StorageKey): void {
  removeItem(key);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("convaudit:pref-change", { detail: { key, value: undefined } }));
  }
}

export function clearAllPrefs(): void {
  for (const key of LIST_ALL_KEYS) {
    removeItem(key);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("convaudit:pref-change", { detail: {} }));
  }
}

export function isStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;

  try {
    const test = "__convaudit_storage_test__";
    window.localStorage.setItem(test, "1");
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getStorageKeys(): string[] {
  if (typeof window === "undefined" || !window.localStorage) return [];

  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key.replace(STORAGE_PREFIX, ""));
    }
  }
  return keys;
}

export function getAllStoredItems(): Array<{ key: string; value: string; readOnly: boolean }> {
  if (typeof window === "undefined" || !window.localStorage) return [];

  const items: Array<{ key: string; value: string; readOnly: boolean }> = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX)) continue;
    const rawKey = key.replace(STORAGE_PREFIX, "");
    try {
      const value = window.localStorage.getItem(key);
      if (rawKey === "__convaudit_storage_test__") continue;
      items.push({ key: rawKey, value: value ?? "", readOnly: true });
    } catch {
      items.push({ key: rawKey, value: "[unreadable]", readOnly: true });
    }
  }
  return items;
}

export function resetAllPrefs(): void {
  for (const key of LIST_ALL_KEYS) {
    setItem(key, DEFAULT_VALUES[key]);
  }
}

export function trackToolVisit(slug: string): void {
  const recent = getCurrentRecentTools();
  const filtered = recent.filter((s) => s !== slug);
  const updated = [slug, ...filtered].slice(0, 10);
  setItem(STORAGE_KEYS.recentTools, updated);
}

export function getCurrentRecentTools(): string[] {
  const recent = getItem<unknown>(STORAGE_KEYS.recentTools);
  if (recent === null) return [];

  const raw = typeof recent === "string" ? recent : JSON.stringify(recent);
  const result = parseRecentTools(raw);
  if (result.error) {
    console.warn(`[localStorage] ${result.error}`);
  }
  return result.tools;
}

const LIST_ALL_KEYS: StorageKey[] = Object.values(STORAGE_KEYS) as StorageKey[];

export const localStorageService = {
  getItem,
  setItem,
  removeItem,
  getAllPrefs,
  setPref,
  clearPref,
  clearAllPrefs,
  isStorageAvailable,
  getStorageKeys,
  getAllStoredItems,
  resetAllPrefs,
  trackToolVisit,
  getCurrentRecentTools,
};
