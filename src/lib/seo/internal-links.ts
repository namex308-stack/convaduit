import { BLOG_SLUGS, ROUTES } from "@/lib/routes";
import { PRIVATE_APP_PATHS } from "@/lib/seo/private-app-paths";

/** Indexable HTML marketing paths (sitemap set, excluding `/llms.txt`). */
export const PUBLIC_INDEXABLE_PATHS = [
  ROUTES.home,
  ROUTES.pricing,
  ROUTES.docs,
  ROUTES.blog,
  ...BLOG_SLUGS.map((slug) => ROUTES.blogPost(slug)),
  ROUTES.security,
  ROUTES.privacy,
  ROUTES.terms,
  ROUTES.refundPolicy,
  ROUTES.about,
  ROUTES.contact,
  ROUTES.roadmap,
] as const;

/** Fragment ids that exist on the named public pathname. */
export const PUBLIC_FRAGMENT_IDS: Readonly<Record<string, readonly string[]>> = {
  [ROUTES.home]: [
    "features",
    "how",
    "methodology",
    "platforms",
    "faq",
    "pricing",
    "security",
    "why-lose-sales",
    "resources",
  ],
  [ROUTES.docs]: ["0", "1", "2", "3", "4"],
  [ROUTES.security]: ["infrastructure", "compliance"],
};

export function internalPathname(href: string): string {
  const withoutQuery = href.split("?")[0] ?? href;
  const path = withoutQuery.split("#")[0] ?? withoutQuery;
  if (path === "" || path === "/") return ROUTES.home;
  return path;
}

export function internalHash(href: string): string {
  const hashIndex = href.indexOf("#");
  if (hashIndex < 0) return "";
  return href.slice(hashIndex + 1);
}

export function isPrivateOrNoindexPath(pathname: string): boolean {
  if (pathname === "/api" || pathname.startsWith("/api/")) return true;
  return PRIVATE_APP_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * True when `href` is a public indexable path, optionally with a known fragment.
 * Hash-only values (`#methodology`) are unresolved — callers must use `/#…`.
 */
export function isResolvablePublicInternalHref(href: string): boolean {
  if (!href.startsWith("/")) return false;
  if (isPrivateOrNoindexPath(internalPathname(href))) return false;
  const pathname = internalPathname(href);
  if (!(PUBLIC_INDEXABLE_PATHS as readonly string[]).includes(pathname)) {
    return false;
  }
  const hash = internalHash(href);
  if (!hash) return true;
  const allowed = PUBLIC_FRAGMENT_IDS[pathname];
  return Boolean(allowed?.includes(hash));
}
