export type TrendPoint = {
  label: string;
  score: number;
  date: string;
};

export type TrendSource = {
  overallScore: number | null;
  completedAt: string | null;
  createdAt: string;
};

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatLabel(date: Date, locale: string, withTime: boolean): string {
  if (withTime) {
    return date.toLocaleString(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}

/** Assign unique axis labels in the viewer's locale/timezone. */
export function labelTrendPoints(
  points: Array<{ score: number; date: string }>,
  locale = "ar"
): TrendPoint[] {
  const withTs = points
    .map((p) => ({ ...p, ts: new Date(p.date).getTime() }))
    .filter((p) => Number.isFinite(p.ts))
    .sort((a, b) => a.ts - b.ts);

  const dayCounts = new Map<string, number>();
  for (const p of withTs) {
    const key = dayKey(p.ts);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }

  const usedLabels = new Map<string, number>();
  return withTs.map((p) => {
    const d = new Date(p.ts);
    const needsTime = (dayCounts.get(dayKey(p.ts)) ?? 0) > 1;
    let label = formatLabel(d, locale, needsTime);
    const seen = (usedLabels.get(label) ?? 0) + 1;
    usedLabels.set(label, seen);
    if (seen > 1) {
      label = `${label} · ${seen}`;
    }
    return { label, score: p.score, date: p.date };
  });
}

/** Build oldest→newest score trend points (labels filled client-side). */
export function buildScoreTrend(
  completed: TrendSource[],
  options?: { locale?: string; limit?: number }
): TrendPoint[] {
  const locale = options?.locale ?? "ar";
  const limit = options?.limit ?? 24;

  const points = completed
    .filter((a) => a.overallScore != null && Number.isFinite(Number(a.overallScore)))
    .map((a) => {
      const date = a.completedAt || a.createdAt;
      return {
        score: Math.round(Number(a.overallScore)),
        date,
      };
    })
    .filter((p) => Number.isFinite(new Date(p.date).getTime()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-limit);

  return labelTrendPoints(points, locale);
}

export const PILLAR_COMPARE_KEYS = ["conversion", "seo", "geo", "trust"] as const;

export type PillarCompareKey = (typeof PILLAR_COMPARE_KEYS)[number];

export type PillarDelta = {
  pillar: PillarCompareKey;
  previous: number | null;
  current: number | null;
  delta: number | null;
};

/** Host + path (+ query) so www/apex and trailing slashes still match a re-scan. */
export function canonicalizeAuditUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    return `${host}${path}${parsed.search}`.toLowerCase();
  } catch {
    return trimmed.replace(/\/+$/, "").replace(/^www\./i, "").toLowerCase();
  }
}

/** Newest-first completed list: previous completed audit of the same URL, if any. */
export function findPreviousSameUrlAudit<T extends { id: string; productUrl: string }>(
  latest: T,
  completedNewestFirst: readonly T[]
): T | null {
  const key = canonicalizeAuditUrl(latest.productUrl);
  if (!key) return null;
  return (
    completedNewestFirst.find(
      (row) => row.id !== latest.id && canonicalizeAuditUrl(row.productUrl) === key
    ) ?? null
  );
}

/** Per-pillar old vs new. Missing scores stay null — never invent 0. */
export function buildPillarDeltas(
  current: Record<PillarCompareKey, number | null>,
  previous: Record<PillarCompareKey, number | null> | null
): PillarDelta[] {
  return PILLAR_COMPARE_KEYS.map((pillar) => {
    const curr = current[pillar];
    const prev = previous?.[pillar] ?? null;
    const hasBoth =
      curr != null && Number.isFinite(curr) && prev != null && Number.isFinite(prev);
    return {
      pillar,
      previous: prev,
      current: curr,
      delta: hasBoth ? curr - prev : null,
    };
  });
}

/** Filter trend points to the last N calendar months. */
export function filterTrendByMonths(
  trend: readonly TrendPoint[],
  months: 3 | 6 | 12
): TrendPoint[] {
  if (!trend.length) return [];
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffTs = cutoff.getTime();
  return trend.filter((p) => {
    const ts = new Date(p.date).getTime();
    return Number.isFinite(ts) && ts >= cutoffTs;
  });
}
