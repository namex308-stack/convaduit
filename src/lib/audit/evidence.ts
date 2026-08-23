/**
 * Evidence Engine — attach crawl-backed proof to audit findings.
 * Does not invent values; unverifiable crawls yield NOT_VERIFIED.
 */

import type { NormalizedPage } from "@/lib/db/types";
import type {
  EvidenceStatus,
  FindingEvidence,
  GeoFindingStatus,
} from "@/lib/types";

export type { EvidenceStatus, FindingEvidence };

/** True when the crawler returned a usable page we can check against. */
export function isPageVerifiable(page: NormalizedPage | null | undefined): boolean {
  return Boolean(page && page.scrapeStatus === "ok");
}

export function pageEvidenceUrl(page: NormalizedPage | null | undefined): string | null {
  if (!page?.url || typeof page.url !== "string") return null;
  const trimmed = page.url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Map scoring status → evidence verification (warn counts as FAIL — criteria unmet). */
export function evidenceStatusFromFindingStatus(status: GeoFindingStatus): EvidenceStatus {
  switch (status) {
    case "pass":
      return "PASS";
    case "warn":
    case "fail":
      return "FAIL";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/** Evidence payload when the crawl cannot support verification. */
export function notVerifiedEvidence(url: string | null): FindingEvidence {
  return {
    url,
    detectedValue: null,
    detectedState: null,
  };
}

/** Evidence payload grounded in an observed crawl value/state. */
export function verifiedEvidence(input: {
  url: string | null;
  detectedValue?: string | number | boolean | null;
  detectedState?: string | null;
}): FindingEvidence {
  return {
    url: input.url,
    detectedValue: input.detectedValue ?? null,
    detectedState: input.detectedState ?? null,
  };
}

/** Resolve evidence status + payload for a single finding. */
export function resolveFindingEvidence(input: {
  findingStatus: GeoFindingStatus;
  page: NormalizedPage | null | undefined;
  detectedValue?: string | number | boolean | null;
  detectedState?: string | null;
}): { evidenceStatus: EvidenceStatus; evidence: FindingEvidence } {
  const url = pageEvidenceUrl(input.page);

  if (!isPageVerifiable(input.page)) {
    return {
      evidenceStatus: "NOT_VERIFIED",
      evidence: notVerifiedEvidence(url),
    };
  }

  return {
    evidenceStatus: evidenceStatusFromFindingStatus(input.findingStatus),
    evidence: verifiedEvidence({
      url,
      detectedValue: input.detectedValue,
      detectedState: input.detectedState,
    }),
  };
}
