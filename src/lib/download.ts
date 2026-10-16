"use client";

import { saveAs } from "file-saver";

/**
 * Trigger a browser download for a single Blob using file-saver.
 */
export function downloadBlob(blob: Blob, filename: string) {
  saveAs(blob, filename);
}

/**
 * Trigger a download for raw bytes by wrapping them in a Blob.
 */
export function downloadBytes(bytes: Uint8Array, filename: string, mime: string) {
  // Copy into a fresh ArrayBuffer so file-saver's typing is happy.
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  downloadBlob(new Blob([ab], { type: mime }), filename);
}

/**
 * Copy text to the clipboard.
 *
 * navigator.clipboard.writeText() only exists in secure contexts
 * (HTTPS or localhost) and can reject when permission is denied.
 * Every copy button in the app called it bare — on plain HTTP
 * (or with clipboard permission blocked) the click handler threw
 * "Cannot read properties of undefined" and the "Copied!" UI
 * showed even though nothing was copied. This helper falls back
 * to the legacy execCommand path and returns success/failure.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Generate a short unique id (good enough for client-side lists).
 */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Format bytes into a human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
