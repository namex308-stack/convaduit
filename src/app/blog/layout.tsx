import type { Metadata } from "next";
import type { ReactNode } from "react";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { ROUTES } from "@/lib/routes";
import { BLOG_INDEX_DESCRIPTION, BLOG_INDEX_TITLE } from "@/app/blog/copy";

export const metadata: Metadata = publicPageMetadata({
  title: BLOG_INDEX_TITLE,
  description: BLOG_INDEX_DESCRIPTION,
  path: ROUTES.blog,
});

/** Shared chrome only — index JSON-LD lives on `page.tsx` so posts do not inherit it. */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
