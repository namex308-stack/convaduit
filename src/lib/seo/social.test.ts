import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_SAME_AS,
  SOCIAL_PROFILES,
  SOCIAL_X_HANDLE,
  TIKTOK_PROFILE_URL,
  twitterSiteFields,
} from "@/lib/seo/social";

describe("official social profiles", () => {
  it("lists only confirmed ConvAudit-branded profiles", () => {
    expect(SOCIAL_PROFILES).toEqual([{ id: "tiktok", url: TIKTOK_PROFILE_URL }]);
    expect(ORGANIZATION_SAME_AS).toEqual([TIKTOK_PROFILE_URL]);
    expect(TIKTOK_PROFILE_URL).toBe("https://www.tiktok.com/@convaduit");
    expect(SOCIAL_X_HANDLE).toBeUndefined();
    expect(twitterSiteFields()).toEqual({});
    expect(JSON.stringify({ SOCIAL_PROFILES, ORGANIZATION_SAME_AS })).not.toMatch(
      /conva-aduit|StorePulse/i
    );
    expect(JSON.stringify({ SOCIAL_PROFILES, ORGANIZATION_SAME_AS })).not.toMatch(
      /x\.com|linkedin\.com|facebook\.com|instagram\.com/i
    );
  });
});
