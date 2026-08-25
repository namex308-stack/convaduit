import { describe, expect, it } from "vitest";
import {
  pageStatsFromRows,
  recommendationStatsFromRows,
  topIssuesFromRows,
} from "@/lib/dashboard/recommendation-aggregates";

const rows = [
  { audit_id: "a1", status: "open", severity: "critical", problem: "Missing alt" },
  { audit_id: "a1", status: "done", severity: "warning", problem: "Thin copy" },
  { audit_id: "a2", status: "open", severity: "warning", problem: "Missing alt" },
  { audit_id: "a2", status: "open", severity: "opportunity", problem: "Nice photos" },
];

describe("recommendationStatsFromRows", () => {
  it("counts actionable recs only for the given audit ids", () => {
    expect(recommendationStatsFromRows(rows, new Set(["a1"]))).toEqual({
      total: 2,
      open: 1,
    });
  });
});

describe("topIssuesFromRows", () => {
  it("groups open critical/warning problems", () => {
    const issues = topIssuesFromRows(rows, new Set(["a1", "a2"]));
    expect(issues[0]).toMatchObject({
      problem: "Missing alt",
      count: 2,
      severity: "critical",
    });
    expect(issues).toHaveLength(1);
  });
});

describe("pageStatsFromRows", () => {
  it("counts pages and open issues per audit", () => {
    const stats = pageStatsFromRows(
      [{ audit_id: "a1" }, { audit_id: "a1" }, { audit_id: "a2" }],
      rows,
      new Set(["a1"])
    );
    expect(stats.totalPages).toBe(3);
    expect(stats.pagesThisMonth).toBe(2);
    expect(stats.byAudit).toEqual({ a1: 2, a2: 1 });
    expect(stats.openIssuesByAudit).toEqual({ a1: 1, a2: 1 });
  });
});
