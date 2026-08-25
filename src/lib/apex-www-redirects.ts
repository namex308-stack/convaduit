import {
  PRODUCTION_APEX_HOST,
  PRODUCTION_CANONICAL_ORIGIN,
} from "./site-url";

/**
 * Host-level permanent redirects so Next (standalone) and the matcher
 * used in next.config stay aligned with Vercel `vercel.json` redirects.
 */
export const APEX_TO_WWW_REDIRECTS = [
  {
    source: "/",
    has: [{ type: "host" as const, value: PRODUCTION_APEX_HOST }],
    destination: `${PRODUCTION_CANONICAL_ORIGIN}/`,
    permanent: true as const,
  },
  {
    source: "/:path*",
    has: [{ type: "host" as const, value: PRODUCTION_APEX_HOST }],
    destination: `${PRODUCTION_CANONICAL_ORIGIN}/:path*`,
    permanent: true as const,
  },
];
