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
