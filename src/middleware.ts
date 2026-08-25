import { type NextRequest } from "next/server";
import { rewriteUnknownPublicBlogSlug } from "@/lib/seo/force-public-404";
import { updateSession } from "@/lib/supabase/middleware";
import { redirectApexToWww } from "@/lib/www-canonical";

export async function middleware(request: NextRequest) {
  const apexRedirect = redirectApexToWww(request);
  if (apexRedirect) return apexRedirect;

  const blogNotFound = rewriteUnknownPublicBlogSlug(request);
  if (blogNotFound) return blogNotFound;

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
