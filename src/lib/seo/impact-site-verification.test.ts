import { describe, expect, it } from "vitest";
import {
  IMPACT_SITE_VERIFICATION_TOKEN,
  impactSiteVerificationMetadata,
} from "@/lib/seo/impact-site-verification";

describe("impactSiteVerificationMetadata", () => {
  it("emits the Shopify Impact verification meta content", () => {
    expect(impactSiteVerificationMetadata()).toEqual({
      other: {
        "impact-site-verification": IMPACT_SITE_VERIFICATION_TOKEN,
      },
    });
    expect(IMPACT_SITE_VERIFICATION_TOKEN).toBe(
      "2474e71e-e75a-4719-b178-9bdb431a1da2",
    );
  });
});
