import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_SAME_AS,
  SOCIAL_LINKEDIN_URL,
  SOCIAL_X_HANDLE,
  SOCIAL_X_URL,
} from "@/lib/seo/social";

describe("official social profiles", () => {
  it("uses https X and LinkedIn URLs", () => {
    expect(SOCIAL_X_URL).toBe("https://x.com/CONVADUIT6k");
    expect(SOCIAL_LINKEDIN_URL).toBe("https://www.linkedin.com/in/conva-aduit-1044883a8");
    expect(SOCIAL_X_HANDLE).toBe("@CONVADUIT6k");
    expect(ORGANIZATION_SAME_AS).toEqual([SOCIAL_X_URL, SOCIAL_LINKEDIN_URL]);
  });
});
