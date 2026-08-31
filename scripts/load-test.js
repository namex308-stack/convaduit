/**
 * Public-page k6 load test (k6.io).
 *
 * Visits ONLY:
 *   GET /          home
 *   GET /pricing
 *   GET /docs
 *
 * Completely excluded (never requested):
 *   /api/audit, /api/generate, and any other /api/* route
 *   (those can call Gemini / Firecrawl and incur real provider cost)
 *
 * Stages (5 minutes each, ramping — not a step jump to 10k):
 *   0 → 100 → 1,000 → 5,000 → 10,000 VUs, then a 5-minute hold at 10k, then ramp down.
 *
 * Do NOT run against production (www.convaudit.com / convaudit.com).
 * Target localhost or a Vercel preview / staging URL.
 *
 * ---------------------------------------------------------------------------
 * How to run
 * ---------------------------------------------------------------------------
 *
 * Install k6: https://k6.io/docs/get-started/installation/
 *   Windows (winget):  winget install k6 --source winget
 *   macOS (brew):      brew install k6
 *
 * 1) Local (smoke — 5 VUs, 30s; next dev cannot absorb 10k VUs):
 *      npm run dev
 *      k6 run -e SMOKE=1 scripts/load-test.js
 *
 * 2) Local full profile (needs a beefy machine; still not production):
 *      npm run build && npm start
 *      k6 run scripts/load-test.js
 *
 * 3) Staging / Vercel preview (preferred for the 10k profile).
 *    There is no dedicated staging hostname in this repo. Use a Preview
 *    deployment URL from the Vercel dashboard (Project → Deployments → Preview),
 *    e.g. https://geo-<hash>-<team>.vercel.app
 *
 *      k6 run -e BASE_URL=https://your-preview.vercel.app scripts/load-test.js
 *
 *    Optional: k6 Cloud if 10k VUs exceed your laptop:
 *      k6 cloud -e BASE_URL=https://your-preview.vercel.app scripts/load-test.js
 *
 * Env:
 *   BASE_URL   default http://localhost:3000
 *   SMOKE=1    tiny profile for a syntax/connectivity check
 */

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const PRODUCTION_HOSTS = ["www.convaudit.com", "convaudit.com"];

/** Allowlist — the only paths this script will ever request. */
const PUBLIC_PAGES = ["/", "/pricing", "/docs"];

const BLOCKED_PATH_PREFIXES = [
  "/api/audit",
  "/api/generate",
  "/api/",
  "/audit",
  "/onboarding",
];

const SMOKE = __ENV.SMOKE === "1" || __ENV.SMOKE === "true";

export const options = SMOKE
  ? {
      stages: [{ duration: "30s", target: 5 }],
      thresholds: {
        http_req_failed: ["rate<0.1"],
        http_req_duration: ["p(95)<5000"],
        checks: ["rate>0.9"],
      },
    }
  : {
      stages: [
        { duration: "5m", target: 100 },
        { duration: "5m", target: 1000 },
        { duration: "5m", target: 5000 },
        { duration: "5m", target: 10000 },
        { duration: "5m", target: 10000 },
        { duration: "2m", target: 0 },
      ],
      thresholds: {
        http_req_failed: ["rate<0.05"],
        http_req_duration: ["p(95)<3000"],
        checks: ["rate>0.95"],
      },
    };

function hostnameOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isBlockedPath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  for (let i = 0; i < BLOCKED_PATH_PREFIXES.length; i += 1) {
    if (normalized === BLOCKED_PATH_PREFIXES[i] || normalized.startsWith(BLOCKED_PATH_PREFIXES[i])) {
      return true;
    }
  }
  return false;
}

function pageUrl(path) {
  if (isBlockedPath(path)) {
    throw new Error(`Refusing to request blocked path: ${path}`);
  }
  if (PUBLIC_PAGES.indexOf(path) === -1) {
    throw new Error(`Path is not on the public-page allowlist: ${path}`);
  }
  return `${BASE_URL}${path}`;
}

export function setup() {
  const host = hostnameOf(BASE_URL);
  if (PRODUCTION_HOSTS.indexOf(host) !== -1) {
    throw new Error(
      `Refusing to load-test production (${host}). Set BASE_URL to http://localhost:3000 or a Vercel preview / staging URL.`
    );
  }

  for (let i = 0; i < PUBLIC_PAGES.length; i += 1) {
    if (isBlockedPath(PUBLIC_PAGES[i])) {
      throw new Error(`Allowlist contains a blocked path: ${PUBLIC_PAGES[i]}`);
    }
  }

  const probe = http.get(pageUrl("/"), { redirects: 5 });
  if (probe.status < 200 || probe.status >= 400) {
    throw new Error(
      `Setup probe GET ${BASE_URL}/ returned HTTP ${probe.status}. Is the target up?`
    );
  }

  return { baseUrl: BASE_URL };
}

export default function () {
  const tags = { test: "public-pages" };

  const home = http.get(pageUrl("/"), { tags: { ...tags, page: "home" } });
  check(home, {
    "GET / is 2xx": (r) => r.status >= 200 && r.status < 400,
  });
  sleep(1);

  const pricing = http.get(pageUrl("/pricing"), { tags: { ...tags, page: "pricing" } });
  check(pricing, {
    "GET /pricing is 2xx": (r) => r.status >= 200 && r.status < 400,
  });
  sleep(1);

  const docs = http.get(pageUrl("/docs"), { tags: { ...tags, page: "docs" } });
  check(docs, {
    "GET /docs is 2xx": (r) => r.status >= 200 && r.status < 400,
  });
  sleep(1);
}
