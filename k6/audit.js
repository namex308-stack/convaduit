/**
 * K6 load test for POST /api/audit.
 *
 * Sends `X-Load-Test: true` so a local `next dev` / Vitest server uses mock
 * Firecrawl + heuristic Gemini instead of live providers.
 *
 * Production (`NODE_ENV=production`) rejects this header with 403 LOAD_TEST_REJECTED.
 * Do not point this script at www.convaudit.com.
 *
 * Prerequisites:
 *   1. `npm run dev` (NODE_ENV=development)
 *   2. k6 installed: https://k6.io/docs/get-started/installation/
 *   3. A logged-in session cookie from localhost (DevTools → Application → Cookies)
 *
 *   k6 run k6/audit.js
 *   k6 run -e BASE_URL=http://localhost:3000 -e SESSION_COOKIE="sb-xxx-auth-token=..." k6/audit.js
 *
 * Optional env:
 *   BASE_URL          default http://localhost:3000
 *   SESSION_COOKIE    required — full Cookie header value
 *   PRODUCT_URL       default https://load-test.example/product
 *   POLL_STATUS       set 1 to poll GET /api/audit/:id until completed/failed
 */

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const SESSION_COOKIE = __ENV.SESSION_COOKIE || "";
const PRODUCT_URL = __ENV.PRODUCT_URL || "https://load-test.example/product";
const POLL_STATUS = __ENV.POLL_STATUS === "1" || __ENV.POLL_STATUS === "true";

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.1"],
    http_req_duration: ["p(95)<5000"],
    checks: ["rate>0.9"],
  },
};

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Load-Test": "true",
    Cookie: SESSION_COOKIE,
  };
}

export function setup() {
  if (!SESSION_COOKIE) {
    throw new Error(
      "SESSION_COOKIE is required. Copy the localhost Cookie header after logging in, then: k6 run -e SESSION_COOKIE=\"...\" k6/audit.js"
    );
  }
}

export default function () {
  const res = http.post(
    `${BASE_URL}/api/audit?loadTest=true`,
    JSON.stringify({ productUrl: PRODUCT_URL }),
    { headers: authHeaders() }
  );

  const accepted = check(res, {
    "POST /api/audit is 200": (r) => r.status === 200,
    "not rejected as production load-test": (r) => r.status !== 403,
    "returns audit id": (r) => {
      try {
        const body = JSON.parse(r.body);
        return Boolean(body && body.audit && body.audit.id);
      } catch {
        return false;
      }
    },
    "loadTest mock flag": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.meta && body.meta.loadTest === true;
      } catch {
        return false;
      }
    },
  });

  if (!accepted || !POLL_STATUS) {
    sleep(1);
    return;
  }

  let auditId = "";
  try {
    auditId = JSON.parse(res.body).audit.id;
  } catch {
    sleep(1);
    return;
  }

  for (let i = 0; i < 20; i += 1) {
    const statusRes = http.get(`${BASE_URL}/api/audit/${auditId}`, {
      headers: authHeaders(),
    });
    check(statusRes, {
      "GET /api/audit/:id is 200": (r) => r.status === 200,
    });
    try {
      const body = JSON.parse(statusRes.body);
      const status = body && body.audit && body.audit.status;
      if (status === "completed" || status === "failed") {
        check(statusRes, {
          "pipeline finished completed": () => status === "completed",
        });
        break;
      }
    } catch {
      // keep polling
    }
    sleep(0.5);
  }
}
