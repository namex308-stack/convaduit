import { NextRequest, NextResponse } from "next/server";
import {
  incomingRequestHostname,
  wwwRedirectLocation,
} from "@/lib/site-url";

/**
 * Permanent host canonicalization: apex `convaudit.com` → `www.convaudit.com`.
 * Preview (`*.vercel.app`) and localhost are not redirected.
 */
export function redirectApexToWww(request: NextRequest): NextResponse | null {
  const location = wwwRedirectLocation(
    incomingRequestHostname(request.headers, request.nextUrl.hostname),
    request.nextUrl.pathname,
    request.nextUrl.search
  );
  if (!location) return null;
  return NextResponse.redirect(location, 308);
}
