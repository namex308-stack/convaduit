import { type NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, parseEnabledLocale } from "@/lib/locale/cookie";
import { LOCALE_REQUEST_HEADER } from "@/lib/locale/server";
import { rewriteUnknownPublicBlogSlug } from "@/lib/seo/force-public-404";
import { updateSession } from "@/lib/supabase/middleware";
import { redirectApexToWww } from "@/lib/www-canonical";

function applyLocaleHeader(request: NextRequest, response: NextResponse): NextResponse {
  const locale = parseEnabledLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  response.headers.set(LOCALE_REQUEST_HEADER, locale);
  return response;
}

export async function middleware(request: NextRequest) {
  const apexRedirect = redirectApexToWww(request);
  if (apexRedirect) return applyLocaleHeader(request, apexRedirect);

  const blogNotFound = rewriteUnknownPublicBlogSlug(request);
  if (blogNotFound) return applyLocaleHeader(request, blogNotFound);

  const sessionResponse = await updateSession(request);
  return applyLocaleHeader(request, sessionResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
