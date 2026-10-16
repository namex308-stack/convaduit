/**
 * Shared utilities for YouTube creator tools.
 *
 * All functions are client-side safe. The YouTube oEmbed endpoint supports
 * CORS, so we can fetch video metadata directly from the browser without an
 * API key. For tag extraction (which oEmbed doesn't provide) we fall back to
 * a public CORS proxy to read the watch page's <meta name="keywords"> tag.
 */

/** Result from the YouTube oEmbed endpoint. */
export type YouTubeOEmbed = {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  provider_name: string;
  provider_url: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  width: number;
  height: number;
  version: string;
};

/** All standard YouTube thumbnail resolutions for a given video ID. */
export type ThumbnailSet = {
  maxres: string; // 1280×720 (may not exist for older videos)
  sd: string; // 640×480
  hq: string; // 480×360
  mq: string; // 320×180
  default: string; // 120×90
};

/**
 * Ordered fallback chain, best → worst. maxres 404s on older/low-res
 * videos, so callers should walk this list instead of assuming
 * maxres exists.
 */
export const THUMBNAIL_FALLBACK_ORDER: (keyof ThumbnailSet)[] = [
  "maxres",
  "sd",
  "hq",
  "mq",
  "default",
];

/**
 * Extract the 11-character video ID from any common YouTube URL format:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://www.youtube.com/shorts/VIDEO_ID
 *  - https://www.youtube.com/live/VIDEO_ID
 * Returns null if no valid ID is found.
 */
export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }

  // Try URL parsing as a last resort
  try {
    const url = new URL(trimmed);
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch {
    // not a URL
  }

  return null;
}

/**
 * Build all standard thumbnail URLs for a video ID.
 * maxresdefault may return a 404 for older videos — callers should handle
 * image load errors and fall back to sd/hq.
 */
export function getThumbnailUrls(videoId: string): ThumbnailSet {
  const base = `https://img.youtube.com/vi/${videoId}`;
  return {
    maxres: `${base}/maxresdefault.jpg`,
    sd: `${base}/sddefault.jpg`,
    hq: `${base}/hqdefault.jpg`,
    mq: `${base}/mqdefault.jpg`,
    default: `${base}/default.jpg`,
  };
}

/**
 * Fetch oEmbed metadata for a YouTube video URL.
 * The oEmbed endpoint supports CORS and requires no API key.
 * Throws on network error or non-OK response.
 */
export async function fetchOEmbed(videoUrl: string): Promise<YouTubeOEmbed> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    videoUrl
  )}&format=json`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? "Video not found. Check the URL and try again."
        : `Failed to fetch video metadata (HTTP ${res.status}).`
    );
  }
  return (await res.json()) as YouTubeOEmbed;
}

/**
 * Extract tags/keywords from a YouTube video page.
 *
 * oEmbed doesn't include tags, so we fetch the watch page through a public
 * CORS proxy and parse the <meta name="keywords"> tag. This is best-effort —
 * if the proxy is down or YouTube changes its markup, we return an empty
 * array.
 */
export async function fetchVideoTags(videoUrl: string): Promise<string[]> {
  // allorigins is a free, reliable CORS proxy that returns the raw page.
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
    videoUrl
  )}`;
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) return [];
    const html = await res.text();

    // Extract <meta name="keywords" content="tag1, tag2, tag3">
    const keywordsMatch = html.match(
      /<meta\s+name="keywords"\s+content="([^"]*)"/i
    );
    if (!keywordsMatch) return [];

    const keywords = keywordsMatch[1];
    return keywords
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && t.length < 100);
  } catch {
    return [];
  }
}

/**
 * Parse a timestamp string ("1:23", "01:23:45", "83") into seconds.
 * Returns -1 for invalid input so callers can distinguish "0:00"
 * (valid) from garbage (invalid). Previously every invalid string
 * returned 0, so "abc" silently generated a link to the start of
 * the video.
 */
export function parseTimestampToSeconds(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return -1;

  // Pure number → seconds
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);

  const parts = trimmed.split(":").map((p) => p.trim());
  if (parts.some((p) => !/^\d+$/.test(p))) return -1;

  if (parts.length === 2) {
    // MM:SS
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  if (parts.length === 3) {
    // HH:MM:SS
    return (
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseInt(parts[2], 10)
    );
  }
  return -1;
}

/**
 * Format seconds as a human-readable timestamp.
 * 83 → "1:23", 3661 → "1:01:01"
 */
export function formatSecondsToTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Build a shareable YouTube timestamp link.
 * https://youtu.be/VIDEO_ID?t=SECONDS
 */
export function buildTimestampLink(videoId: string, seconds: number): string {
  return `https://youtu.be/${videoId}?t=${seconds}`;
}

/**
 * Extract a channel ID (UC...) from a YouTube channel URL.
 * Returns null if the URL doesn't contain a channel ID.
 */
export function extractChannelId(url: string): string | null {
  const match = url.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
  return match ? match[1] : null;
}

/**
 * Estimate YouTube earnings.
 *
 * CPM (cost per mille = per 1000 views) varies dramatically by niche.
 * These ranges are based on publicly reported creator data. RPM (revenue
 * per mille) is typically 50-70% of CPM after YouTube's cut and is what
 * creators actually receive.
 */
export type NicheCPM = {
  niche: string;
  cpmLow: number; // USD per 1000 views
  cpmHigh: number;
  rpmFactor: number; // fraction of CPM the creator receives (~0.55-0.65)
};

export const YOUTUBE_NICHES: NicheCPM[] = [
  { niche: "Finance / Investing", cpmLow: 15, cpmHigh: 35, rpmFactor: 0.6 },
  { niche: "Tech / Software", cpmLow: 8, cpmHigh: 20, rpmFactor: 0.6 },
  { niche: "Business / Marketing", cpmLow: 8, cpmHigh: 18, rpmFactor: 0.6 },
  { niche: "Education / How-to", cpmLow: 6, cpmHigh: 15, rpmFactor: 0.55 },
  { niche: "Gaming", cpmLow: 3, cpmHigh: 8, rpmFactor: 0.55 },
  { niche: "Entertainment", cpmLow: 2, cpmHigh: 6, rpmFactor: 0.5 },
  { niche: "Vlog / Lifestyle", cpmLow: 3, cpmHigh: 8, rpmFactor: 0.55 },
  { niche: "Beauty / Fashion", cpmLow: 4, cpmHigh: 10, rpmFactor: 0.55 },
  { niche: "Food / Cooking", cpmLow: 4, cpmHigh: 9, rpmFactor: 0.55 },
  { niche: "Health / Fitness", cpmLow: 5, cpmHigh: 12, rpmFactor: 0.55 },
  { niche: "Music", cpmLow: 1, cpmHigh: 4, rpmFactor: 0.5 },
  { niche: "Kids / Family", cpmLow: 1, cpmHigh: 3, rpmFactor: 0.5 },
  { niche: "News / Politics", cpmLow: 3, cpmHigh: 10, rpmFactor: 0.55 },
  { niche: "Sports", cpmLow: 3, cpmHigh: 8, rpmFactor: 0.55 },
  { niche: "Auto / Vehicles", cpmLow: 5, cpmHigh: 12, rpmFactor: 0.6 },
  { niche: "Travel", cpmLow: 4, cpmHigh: 10, rpmFactor: 0.55 },
];

/**
 * Calculate estimated earnings for a given number of views and niche.
 * Returns low/high estimates for the creator's actual take-home pay.
 */
export function calculateEarnings(
  views: number,
  niche: NicheCPM
): { low: number; high: number; mid: number } {
  const low = (views / 1000) * niche.cpmLow * niche.rpmFactor;
  const high = (views / 1000) * niche.cpmHigh * niche.rpmFactor;
  return { low, high, mid: (low + high) / 2 };
}

/**
 * Format a USD amount for display.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a large number (e.g. 1.5M views).
 */
export function formatLargeNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
