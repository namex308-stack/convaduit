/**
 * Sanitize strings before they reach `next/og` (Satori / yoga WASM).
 * Passing `undefined` into a text node throws:
 * `TypeError: Cannot read properties of undefined (reading 'codePointAt')`.
 */

export const OG_STORE_NAME_MAX = 48;
export const OG_TITLE_MAX = 72;
export const OG_SUBHEAD_MAX = 160;
export const OG_PILLAR_MAX = 24;
export const OG_CTA_MAX = 40;
export const OG_FONT_SUBSET_MAX = 400;

export const OG_STORE_NAME_FALLBACK = "ConvAudit";
export const OG_TITLE_FALLBACK = "تحليل المتجر";

type SanitizeOgTextOptions = {
  maxLength?: number;
  fallback?: string;
};

function isOgSafeCodePoint(codePoint: number | undefined): boolean {
  if (codePoint == null || !Number.isFinite(codePoint)) return false;
  // C0 / DEL / C1 controls
  if (codePoint < 32 || (codePoint >= 127 && codePoint < 160)) return false;
  // UTF-16 surrogates (should not appear after Array.from, but keep the guard)
  if (codePoint >= 0xd800 && codePoint <= 0xdfff) return false;
  // Zero-width, bidi controls, word joiner
  if (codePoint >= 0x200b && codePoint <= 0x200f) return false;
  if (codePoint >= 0x202a && codePoint <= 0x202e) return false;
  if (codePoint >= 0x2060 && codePoint <= 0x206f) return false;
  // Variation selectors (emoji presentation) — Satori has no emoji font by default
  if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) return false;
  if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) return false;
  if (codePoint === 0xfeff) return false;
  // Specials block
  if (codePoint >= 0xfff0 && codePoint <= 0xffff) return false;
  const ch = String.fromCodePoint(codePoint);
  if (/\p{Extended_Pictographic}/u.test(ch)) return false;
  return true;
}

function cleanOgString(raw: string, maxLength: number): string {
  const glyphs: string[] = [];
  for (const ch of Array.from(raw)) {
    if (!isOgSafeCodePoint(ch.codePointAt(0))) continue;
    glyphs.push(ch);
    if (glyphs.length >= maxLength) break;
  }
  return glyphs.join("").replace(/\s+/g, " ").trim();
}

/**
 * Coerce any value to a Satori-safe string. Never returns undefined or null.
 * Keeps Arabic and Latin; strips controls, emoji, and bidi marks that crash yoga.
 */
export function sanitizeOgText(
  input: unknown,
  options: SanitizeOgTextOptions = {}
): string {
  const maxLength = Math.max(1, options.maxLength ?? OG_TITLE_MAX);
  const fallback = typeof options.fallback === "string" ? options.fallback : "";

  if (typeof input === "string") {
    const cleaned = cleanOgString(input, maxLength);
    if (cleaned) return cleaned;
  }

  return cleanOgString(fallback, maxLength);
}

export function sanitizeOgStoreName(input: unknown): string {
  return sanitizeOgText(input, {
    maxLength: OG_STORE_NAME_MAX,
    fallback: OG_STORE_NAME_FALLBACK,
  });
}

export function sanitizeOgAnalysisTitle(input: unknown): string {
  return sanitizeOgText(input, {
    maxLength: OG_TITLE_MAX,
    fallback: OG_TITLE_FALLBACK,
  });
}

/** Unique code points for Google Fonts `text=` subsetting (keeps the CSS URL small). */
export function ogFontSubsetText(...parts: unknown[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    if (typeof part !== "string") continue;
    for (const ch of Array.from(part)) {
      if (seen.has(ch)) continue;
      if (!isOgSafeCodePoint(ch.codePointAt(0))) continue;
      seen.add(ch);
      out.push(ch);
      if (out.length >= OG_FONT_SUBSET_MAX) {
        return out.join("");
      }
    }
  }
  return out.join("") || OG_STORE_NAME_FALLBACK;
}
