import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_SAME_AS,
  SOCIAL_PROFILES,
  SOCIAL_X_HANDLE,
  twitterSiteFields,
} from "@/lib/seo/social";

describe("official social profiles", () => {
  it("does not advertise non-ConvAudit handles as the live identity", () => {
    expect(SOCIAL_PROFILES).toEqual([]);
    expect(ORGANIZATION_SAME_AS).toEqual([]);
    expect(SOCIAL_X_HANDLE).toBeUndefined();
    expect(twitterSiteFields()).toEqual({});
    expect(JSON.stringify({ SOCIAL_PROFILES, ORGANIZATION_SAME_AS })).not.toMatch(
      /CONVADUIT|conva-aduit|StorePulse/i
    );
  });
});
