"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Newspaper, ArrowUpRight, Clock, Sparkles } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { useT, type TranslationKey } from "@/lib/i18n";
import {
  type BlogPostMeta,
  blogCategoryKeys,
  getFeaturedBlogPost,
  sortedBlogPosts,
  visibleBlogDateLabel,
} from "@/lib/blog-posts";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | TranslationKey;

function PostDateLabel({ post }: { post: BlogPostMeta }) {
  const t = useT();
  return (
    <>
      {visibleBlogDateLabel(post.publishedOn, t(post.dateKey), (date) =>
        t("blog.scheduledOn", { date })
      )}
    </>
  );
}

function CoverMark({
  label,
  color,
  size = "md",
}: {
  label: string;
  color: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        size === "lg" ? "aspect-[16/10] lg:aspect-auto lg:min-h-[320px]" : "aspect-[16/10]"
      )}
      style={{ background: `${color}14` }}
    >
      <div className="absolute inset-0 bg-dots opacity-25" />
      <div
        className="absolute -end-8 -top-8 size-40 rounded-full blur-3xl opacity-40"
        style={{ background: color }}
        aria-hidden
      />
      <div
        className="absolute -start-6 -bottom-10 size-32 rounded-full blur-3xl opacity-30"
        style={{ background: color }}
        aria-hidden
      />
      <div className="absolute inset-0 grid place-items-center">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight",
            size === "lg" ? "text-5xl sm:text-6xl" : "text-3xl"
          )}
          style={{ color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function FeaturedPost({ post }: { post: BlogPostMeta }) {
  const t = useT();

  return (
    <Link
      href={ROUTES.blogPost(post.slug)}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="grid lg:grid-cols-2">
        <CoverMark label={post.coverLabel} color={post.color} size="lg" />
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {t("blog.featured")}
            </span>
            <span
              className="rounded-md px-2.5 py-1 text-xs font-bold text-white"
              style={{ background: post.color }}
            >
              {t(post.categoryKey)}
            </span>
            <span className="text-xs text-muted-foreground">
              <PostDateLabel post={post} /> · {t("blog.minRead", { count: post.readTime })}
            </span>
          </div>
          <h2 className="font-display text-xl font-bold leading-snug tracking-tight text-balance transition-colors group-hover:text-primary sm:text-2xl lg:text-[1.75rem]">
            {t(post.titleKey)}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty sm:text-[0.95rem]">
            {t(post.excerptKey)}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            {t("blog.readMore")}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post, index }: { post: BlogPostMeta; index: number }) {
  const t = useT();
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.35 }}
    >
      <Link
        href={ROUTES.blogPost(post.slug)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <CoverMark label={post.coverLabel} color={post.color} />
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: post.color }}
            >
              {t(post.categoryKey)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" aria-hidden />
              {t("blog.minRead", { count: post.readTime })}
            </span>
          </div>
          <h3 className="font-display text-sm font-semibold leading-snug transition-colors group-hover:text-primary sm:text-[0.95rem]">
            {t(post.titleKey)}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
            {t(post.excerptKey)}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
            <span className="text-[11px] text-muted-foreground">
              <PostDateLabel post={post} />
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:opacity-100">
              {t("blog.readMore")}
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function BlogIndex() {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = React.useState<CategoryFilter>("all");

  const categories = React.useMemo(() => blogCategoryKeys(), []);
  const allSorted = React.useMemo(() => sortedBlogPosts(), []);

  const filtered = React.useMemo(() => {
    if (category === "all") return allSorted;
    return allSorted.filter((p) => p.categoryKey === category);
  }, [allSorted, category]);

  const featured =
    category === "all" ? getFeaturedBlogPost(filtered) : undefined;
  const gridPosts = featured
    ? filtered.filter((p) => p.slug !== featured.slug)
    : filtered;

  return (
    <PageShell>
      <div className="relative overflow-hidden border-b border-border/50 bg-card/40">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 end-1/4 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <PageHeader title={t("blog.title")} subtitle={t("blog.subtitle")} icon={Newspaper} />
      </div>

      <PageContent className="space-y-10 sm:space-y-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("blog.articleCount", { count: filtered.length })}
          </p>
          <div
            role="tablist"
            aria-label={t("blog.filterLabel")}
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={category === "all"}
              onClick={() => setCategory("all")}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors motion-reduce:transition-none",
                category === "all"
                  ? "border-primary/40 bg-primary text-primary-foreground"
                  : "border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {t("blog.filterAll")}
            </button>
            {categories.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={category === key}
                onClick={() => setCategory(key)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors motion-reduce:transition-none",
                  category === key
                    ? "border-primary/40 bg-primary text-primary-foreground"
                    : "border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {t(key)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold">{t("blog.emptyTitle")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("blog.emptyBody")}</p>
            <button
              type="button"
              onClick={() => setCategory("all")}
              className="mt-5 text-sm font-semibold text-primary hover:underline"
            >
              {t("blog.filterAll")}
            </button>
          </div>
        ) : (
          <>
            {featured ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <FeaturedPost post={featured} />
              </motion.div>
            ) : null}

            {gridPosts.length > 0 ? (
              <div>
                {featured ? (
                  <h2 className="mb-5 font-display text-lg font-bold tracking-tight sm:text-xl">
                    {t("blog.moreArticles")}
                  </h2>
                ) : null}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {gridPosts.map((post, index) => (
                    <PostCard key={post.slug} post={post} index={index} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}

        <aside className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-brand/[0.08] p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-20" aria-hidden />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/10">
                <Sparkles className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg font-bold tracking-tight">{t("blog.ctaTitle")}</p>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground leading-relaxed">
                  {t("blog.ctaBody")}
                </p>
              </div>
            </div>
            <Link
              href={ROUTES.auditNew}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
            >
              {t("blog.ctaButton")}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </aside>

        <aside className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
          <div>
            <p className="font-display text-base font-bold tracking-tight">{t("blog.shopifyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-xl">
              {t("blog.shopifyBody")}
            </p>
          </div>
          <Link
            href={ROUTES.shopify}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors"
          >
            {t("blog.shopifyButton")}
            <ArrowUpRight className="size-4" />
          </Link>
        </aside>
      </PageContent>
    </PageShell>
  );
}
