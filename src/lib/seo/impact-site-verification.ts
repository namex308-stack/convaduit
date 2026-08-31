/** Shopify Impact HTML-tag site verification token (ConvAudit). */
export const IMPACT_SITE_VERIFICATION_TOKEN =
  "2474e71e-e75a-4719-b178-9bdb431a1da2";

/**
 * Next.js `metadata.other` fragment for Impact site verification.
 * Emits `<meta name="impact-site-verification" content="…" />`.
 */
export function impactSiteVerificationMetadata(): {
  other: { "impact-site-verification": string };
} {
  return {
    other: {
      "impact-site-verification": IMPACT_SITE_VERIFICATION_TOKEN,
    },
  };
}
