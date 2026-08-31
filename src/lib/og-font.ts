/**
 * Loads a Google Font's TTF glyph data for the exact text used in an OG/Twitter
 * image, so `next/og` (Satori) can render Arabic script. Subsetting by `text`
 * keeps the request small and avoids bundling a full font file.
 */

import { ogFontSubsetText } from "@/lib/og-text";

const GOOGLE_FONTS_TTF_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

export async function loadGoogleFont(
  font: string,
  text: string,
  weight = 700
): Promise<ArrayBuffer> {
  const subset = ogFontSubsetText(text);
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@${weight}&text=${encodeURIComponent(subset)}`;
  const css = await (
    await fetch(url, {
      // Without a Safari-era UA, Google returns woff2 which Satori cannot parse.
      headers: { "User-Agent": GOOGLE_FONTS_TTF_UA },
    })
  ).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);

  if (match?.[1]) {
    const res = await fetch(match[1]);
    if (res.status === 200) {
      return await res.arrayBuffer();
    }
  }

  throw new Error(`Failed to load font data for ${font}`);
}
