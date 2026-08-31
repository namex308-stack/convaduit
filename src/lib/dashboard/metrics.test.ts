import { describe, expect, it } from "vitest";
import {
  buildMetric,
  defaultTrendRange,
  formatSignedDelta,
  mergePillarSnapshot,
  pickLatestReportByAudit,
  previousMonthPeriod,
  scoresBySlugForAudit,
  sortCompletedByRecency,
  trendSupportsRangeFilter,
} from "@/lib/dashboard/metrics";
import { filterTrendByMonths, type TrendPoint } from "@/lib/dashboard/trend";

describe("buildMetric", () => {
  it("omits direction when there is no previous value", () => {
    expect(buildMetric({ value: 80, previous: null, source: "audits", asOf: "2026-08-01" })).toEqual({
      value: 80,
      previous: null,
      delta: null,
      direction: null,
      source: "audits",
      asOf: "2026-08-01",
    });
  });

  it("computes signed delta from real previous scores", () => {
    const up = buildMetric({ value: 84, previous: 80, source: "reports", asOf: null });
    expect(up.delta).toBe(4);
    expect(up.direction).toBe("up");
    const down = buildMetric({ value: 70, previous: 75, source: "reports", asOf: null });
    expect(down.delta).toBe(-5);
    expect(down.direction).toBe("down");
  });

  it("does not invent a score of zero when data is missing", () => {
    const metric = buildMetric({
      value: null,
      previous: null,
      source: "reports",
      asOf: null,
    });
    expect(metric.value).toBeNull();
    expect(metric.delta).toBeNull();
  });

  it("does not invent a score when current is missing", () => {
    const metric = buildMetric({ value: null, previous: 90, source: "audit_scores", asOf: null });
    expect(metric.value).toBeNull();
    expect(metric.delta).toBeNull();
    expect(metric.direction).toBeNull();
  });
});

describe("mergePillarSnapshot", () => {
  it("prefers report pillars and never fills missing ones", () => {
    const { pillars, sources } = mergePillarSnapshot({
      overallFromAudit: 81,
      geoFromAudit: 60,
      report: {
        audit_id: "a1",
        overall_score: 81,
        seo_score: 74,
        geo_score: 62,
        conversion_score: 70,
        trust_score: null,
      },
      scoresBySlug: { trust: 88 },
    });
    expect(pillars).toEqual({
      overall: 81,
      seo: 74,
      geo: 62,
      conversion: 70,
      trust: 88,
    });
    expect(sources.overall).toBe("audits");
    expect(sources.seo).toBe("reports");
    expect(sources.trust).toBe("audit_scores");
  });

  it("returns null pillars when no real scores exist", () => {
    const { pillars } = mergePillarSnapshot({
      overallFromAudit: null,
      geoFromAudit: null,
      report: null,
      scoresBySlug: {},
    });
    expect(pillars).toEqual({
      overall: null,
      seo: null,
      geo: null,
      conversion: null,
      trust: null,
    });
  });
});

describe("pickLatestReportByAudit", () => {
  it("keeps the highest version per audit", () => {
    const map = pickLatestReportByAudit([
      { audit_id: "a1", version: 1, seo_score: 10 },
      { audit_id: "a1", version: 2, seo_score: 40 },
      { audit_id: "a2", version: 1, seo_score: 55 },
    ]);
    expect(map.get("a1")?.seo_score).toBe(40);
    expect(map.size).toBe(2);
  });
});

describe("scoresBySlugForAudit", () => {
  it("maps self subject scores via category slug", () => {
    const scores = scoresBySlugForAudit(
      "a1",
      [
        { audit_id: "a1", category_id: "c-seo", subject: "self", score: 71.2 },
        { audit_id: "a1", category_id: "c-seo", subject: "competitor", score: 99 },
        { audit_id: "a2", category_id: "c-seo", subject: "self", score: 10 },
      ],
      [{ id: "c-seo", slug: "seo" }]
    );
    expect(scores).toEqual({ seo: 71 });
  });
});

describe("trend windows", () => {
  it("does not pad a short window with older points", () => {
    const now = Date.now();
    const trend: TrendPoint[] = [
      { label: "old", score: 50, date: new Date(now - 200 * 86400000).toISOString() },
      { label: "latest", score: 95, date: new Date(now - 1 * 86400000).toISOString() },
    ];
    expect(filterTrendByMonths(trend, 3).map((p) => p.label)).toEqual(["latest"]);
  });

  it("shows a range filter only when two windows differ and each has enough points", () => {
    const now = Date.now();
    const short: TrendPoint[] = [
      { label: "a", score: 80, date: new Date(now - 10 * 86400000).toISOString() },
      { label: "b", score: 82, date: new Date(now - 2 * 86400000).toISOString() },
    ];
    expect(trendSupportsRangeFilter(short)).toBe(false);

    const spanned: TrendPoint[] = [
      { label: "old", score: 50, date: new Date(now - 200 * 86400000).toISOString() },
      { label: "mid", score: 70, date: new Date(now - 40 * 86400000).toISOString() },
      { label: "new", score: 90, date: new Date(now - 2 * 86400000).toISOString() },
    ];
    expect(trendSupportsRangeFilter(spanned)).toBe(true);
    expect(defaultTrendRange(spanned)).toBe("6");
  });
});

describe("formatSignedDelta", () => {
  it("keeps null when there is no real delta", () => {
    expect(formatSignedDelta(null)).toBeNull();
  });

  it("prefixes positive deltas", () => {
    expect(formatSignedDelta(4)).toBe("+4");
    expect(formatSignedDelta(-3)).toBe("-3");
    expect(formatSignedDelta(0)).toBe("0");
  });
});

describe("previousMonthPeriod", () => {
  it("returns the UTC previous calendar month", () => {
    const period = previousMonthPeriod(new Date("2026-08-30T12:00:00.000Z"));
    expect(period.start).toBe("2026-07-01T00:00:00.000Z");
    expect(period.end).toBe("2026-07-31T23:59:59.000Z");
  });
});

describe("sortCompletedByRecency", () => {
  it("orders by completedAt then createdAt, newest first", () => {
    const sorted = sortCompletedByRecency([
      { completedAt: "2026-08-01T00:00:00.000Z", createdAt: "2026-08-01T00:00:00.000Z" },
      { completedAt: "2026-08-20T00:00:00.000Z", createdAt: "2026-08-02T00:00:00.000Z" },
    ]);
    expect(sorted[0]?.completedAt).toBe("2026-08-20T00:00:00.000Z");
  });
});
