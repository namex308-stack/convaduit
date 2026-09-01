/**
 * Official ConvAudit social profiles (footer, contact, JSON-LD sameAs, Twitter card).
 *
 * Only ConvAudit-branded profile URLs belong here. Do not invent handles or
 * company pages. Previous X/LinkedIn values used CONVADUIT / conva-aduit
 * identifiers and are not the official product name.
 */

export type SocialProfileId = "x" | "linkedin" | "tiktok";

export type SocialProfile = {
  id: SocialProfileId;
  url: string;
  /** X/Twitter @handle including the leading @, when id is `x`. */
  handle?: string;
};

export const TIKTOK_PROFILE_URL = "https://www.tiktok.com/@convaduit";

export const SOCIAL_PROFILES: readonly SocialProfile[] = [
  { id: "tiktok", url: TIKTOK_PROFILE_URL },
];

export const ORGANIZATION_SAME_AS: readonly string[] = SOCIAL_PROFILES.map(
  (profile) => profile.url
);

export const SOCIAL_X_HANDLE: string | undefined = SOCIAL_PROFILES.find(
  (profile) => profile.id === "x"
)?.handle;

/** Twitter card `site` / `creator` — omitted when no official X profile exists. */
export function twitterSiteFields():
  | { site: string; creator: string }
  | Record<string, never> {
  if (!SOCIAL_X_HANDLE) return {};
  return { site: SOCIAL_X_HANDLE, creator: SOCIAL_X_HANDLE };
}
