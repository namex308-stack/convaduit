import type { NextConfig } from "next";
import { APEX_TO_WWW_REDIRECTS } from "./src/lib/apex-www-redirects";
import { PRIVATE_APP_PATHS } from "./src/lib/seo/private-app-paths";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-eval' is dev-only: Turbopack's HMR client needs it for module
      // reloading. Production bundles never call eval(), so it's dropped there.
      `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https: wss: ws:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      ...(isProd ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const noindexNofollow = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

/** Exact path + nested children for each private app prefix. */
const privateAppRobotHeaders = PRIVATE_APP_PATHS.flatMap((path) => [
  { source: path, headers: noindexNofollow },
  { source: `${path}/:path*`, headers: noindexNofollow },
]);

const nextConfig: NextConfig = {
  // Next 16.3 + Vercel adapter: standalone skips `.next/next-server.js.nft.json`,
  // then onBuildComplete fails with ENOENT. Keep standalone for local/Docker;
  // Vercel traces the deployment itself.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  // `next dev` binds as localhost. Chromium on http://127.0.0.1:3000 sends
  // Origin: 127.0.0.1 for scripts with crossorigin=""; Next then 403s those
  // chunks unless this host is allowlisted.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    root: process.cwd(),
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Inline CSS in the document so the homepage (and other routes) do not wait
    // on a render-blocking stylesheet round-trip. Requires style-src 'unsafe-inline'
    // which is already in the CSP.
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Site rasters max out at 1200px (product shots 1119, OG 1200). Dropping
    // 1920/2048/3840 keeps srcset and the `src` fallback at viewport size.
    deviceSizes: [640, 750, 828, 1080, 1200],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    minimumCacheTTL: 60 * 60 * 24,
  },
  compress: true,
  async redirects() {
    return [...APEX_TO_WWW_REDIRECTS];
  },
  async headers() {
    const headers = [
      // Keep COOP/CSP/HSTS on documents, not on JS chunks.
      {
        source: "/((?!_next/static).*)",
        headers: securityHeaders,
      },
      // Defense-in-depth: robots.txt already disallows /api/; keep JSON out of indexes.
      {
        source: "/api/:path*",
        headers: noindexNofollow,
      },
      // Pair with segment `privatePageMetadata()` — header survives odd link/crawl cases.
      ...privateAppRobotHeaders,
    ];

    // Immutable static caching is production-only. In `next dev`, Turbopack HMR
    // rewrites chunks frequently; long-lived Cache-Control causes stale lucide
    // (and other) module factories in the browser.
    if (isProd) {
      headers.push({
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      });
    } else {
      headers.push({
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      });
    }

    return headers;
  },
};

export default nextConfig;
