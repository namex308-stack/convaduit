"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Clock, ArrowLeft, Share2, Twitter, Linkedin, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { BlogArticleBlocks } from "@/components/blog/blog-article-blocks";
import { PageShell, PageContent } from "@/components/app/page-shell";
import { POST_BODIES } from "@/app/blog/[slug]/post-bodies";
import { useT } from "@/lib/i18n";
import {
  relatedBlogSlugs,
  getBlogPostMeta,
  visibleBlogDateLabel,
  type BlogPostMeta,
} from "@/lib/blog-posts";
import { absoluteUrl } from "@/lib/site-url";
import { ROUTES } from "@/lib/routes";

function relatedMeta(slug: string): BlogPostMeta[] {
  return relatedBlogSlugs(slug).flatMap((relatedSlug) => {
    const post = getBlogPostMeta(relatedSlug);
    return post ? [post] : [];
  });
}

export default function BlogPostPage() {
  const t = useT();
  const params = useParams();
  const slug = params.slug as string;
  const body = POST_BODIES.find((p) => p.slug === slug);
  const meta = getBlogPostMeta(slug);

  if (!body || !meta) {
    notFound();
  }

  const RELATED = relatedMeta(slug);
  const pageUrl = absoluteUrl(ROUTES.blogPost(meta.slug));
  const title = t(meta.titleKey);
  const visibleDate = visibleBlogDateLabel(meta.publishedOn, t(meta.dateKey), (date) =>
    t("blog.scheduledOn", { date })
  );

  const copyPageUrl = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast.success(t("blog.shareCopied"));
    } catch {
      toast.error(t("report.copyFailed"));
    }
  };

  return (
    <PageShell>
      <PageContent className="max-w-3xl py-10">
        <Link
          href={ROUTES.blog}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t("blog.backToBlog")}
        </Link>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2.5 py-1 text-xs font-bold text-white"
              style={{ background: meta.color }}
            >
              {t(meta.categoryKey)}
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{visibleDate}</span>
              <span>·</span>
              <Clock className="size-3" aria-hidden />
              {t("blog.minRead", { count: meta.readTime })}
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl">
            {t(body.titleKey)}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground text-pretty">{t(meta.excerptKey)}</p>
        </div>

        <div
          className="relative mt-6 aspect-[2/1] overflow-hidden rounded-2xl"
          style={{ background: `${meta.color}14` }}
        >
          <div className="absolute inset-0 bg-dots opacity-25" />
          <div
            className="absolute -end-10 -top-10 size-48 rounded-full opacity-35 blur-3xl"
            style={{ background: meta.color }}
            aria-hidden
          />
          <div className="absolute inset-0 grid place-items-center">
            <span
              className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl"
              style={{ color: meta.color }}
            >
              {meta.coverLabel}
            </span>
          </div>
        </div>

        <article>
          <BlogArticleBlocks content={body.content} />
        </article>

        <div className="mt-8 flex items-center gap-3 border-y border-border/60 py-5">
          <span className="text-sm font-medium text-muted-foreground">{t("blog.share")}</span>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("blog.shareTwitter")}
            className="grid size-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Twitter className="size-4" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("blog.shareLinkedin")}
            className="grid size-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Linkedin className="size-4" />
          </a>
          <button
            type="button"
            onClick={() => void copyPageUrl()}
            aria-label={t("blog.shareCopy")}
            className="grid size-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Share2 className="size-4" />
          </button>
        </div>

        {RELATED.length > 0 ? (
          <div className="mt-10">
            <h2 className="mb-4 font-display text-xl font-bold">{t("blog.relatedPosts")}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {RELATED.map((r) => (
                <Link
                  key={r.slug}
                  href={ROUTES.blogPost(r.slug)}
                  className="group block rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <span
                    className="mb-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: r.color }}
                  >
                    {t(r.categoryKey)}
                  </span>
                  <h3 className="text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                    {t(r.titleKey)}
                  </h3>
                  <ArrowUpRight className="mt-2 size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </PageContent>
    </PageShell>
  );
}
