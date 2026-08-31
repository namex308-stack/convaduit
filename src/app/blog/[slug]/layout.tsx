import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { BLOG_SLUGS, blogPostMetaDescription, getBlogPostMeta } from "@/lib/blog-posts";
import { translate } from "@/lib/locale/t";
import { getServerLocaleId } from "@/lib/locale/server";
import { ROUTES } from "@/lib/routes";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import {
  buildBlogArticleJsonLd,
  buildFaqPageJsonLdFromPairs,
} from "@/lib/seo/structured-data";

export function generateStaticParams() {
  return BLOG_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostMeta(slug);
  if (!post) notFound();

  const locale = await getServerLocaleId();
  const title = translate(post.titleKey, undefined, locale);
  const excerpt = translate(post.excerptKey, undefined, locale);
  const description = blogPostMetaDescription(post, excerpt, locale);
  const url = ROUTES.blogPost(slug);

  return publicPageMetadata({
    title,
    description,
    path: url,
    type: "article",
    locale,
  });
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostMeta(slug);
  if (!post) notFound();

  const locale = await getServerLocaleId();
  const title = translate(post.titleKey, undefined, locale);
  const excerpt = translate(post.excerptKey, undefined, locale);
  const description = blogPostMetaDescription(post, excerpt, locale);
  const path = ROUTES.blogPost(slug);

  const faqJsonLd =
    post.faqKeys && post.faqKeys.length > 0
      ? buildFaqPageJsonLdFromPairs(
          post.faqKeys.map(({ qKey, aKey }) => ({
            question: translate(qKey, undefined, locale),
            answer: translate(aKey, undefined, locale),
          })),
          path
        )
      : null;

  return (
    <>
      <JsonLd
        data={buildBlogArticleJsonLd({
          title,
          description,
          path,
          publishedOn: post.publishedOn,
          locale,
        })}
      />
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      {children}
    </>
  );
}
