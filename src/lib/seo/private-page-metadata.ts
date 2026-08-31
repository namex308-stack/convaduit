import type { Metadata } from "next";

/**
 * Canonical robots directive for signed-in / auth application surfaces.
 * Replaces any parent `robots` object entirely (Next resolves per-segment).
 * `googleBot` is set explicitly so a root `googleBot: { index: true }` cannot
 * linger if merge behavior ever changes.
 */
export const PRIVATE_PAGE_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} as const satisfies NonNullable<Metadata["robots"]>;

/** Document title for private surfaces — not the public marketing headline. */
export const PRIVATE_PAGE_TITLE = "ConvAudit";

/**
 * Non-marketing description so a leaked private URL is not a duplicate of `/`.
 */
export const PRIVATE_PAGE_DESCRIPTION =
  "صفحة حساب ConvAudit — تتطلّب تسجيلاً وليست مخصصة لفهرسة محركات البحث.";

/**
 * Shared metadata for private App Router segment layouts.
 * Pair with `PRIVATE_APP_PATHS` / `robots.ts` disallow — meta is what keeps
 * a linked URL out of the index; robots.txt only reduces crawling.
 */
export function privatePageMetadata(
  extras: Omit<Metadata, "robots"> = {}
): Metadata {
  const title = extras.title ?? { absolute: PRIVATE_PAGE_TITLE };
  const description = extras.description ?? PRIVATE_PAGE_DESCRIPTION;
  const socialTitle =
    typeof title === "string" ? title : PRIVATE_PAGE_TITLE;

  return {
    ...extras,
    title,
    description,
    keywords: [],
    robots: PRIVATE_PAGE_ROBOTS,
    openGraph: {
      title: socialTitle,
      description,
      ...extras.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...extras.twitter,
    },
  };
}
