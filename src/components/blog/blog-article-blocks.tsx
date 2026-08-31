"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckSquare } from "lucide-react";
import type { BlogContentBlock } from "@/lib/blog-content-blocks";
import { useT } from "@/lib/i18n";

function LinkedParagraph({
  text,
  links,
}: {
  text: string;
  links: readonly { href: string; label: string }[];
}) {
  const nodes: ReactNode[] = [];
  const pattern = /\{\{(\d+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const link = links[Number(match[1])];
    if (link) {
      nodes.push(
        <Link
          key={`l-${key++}`}
          href={link.href}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          {link.label}
        </Link>
      );
    } else {
      nodes.push(match[0]);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <p className="leading-relaxed text-foreground/85">{nodes}</p>;
}

export function BlogArticleBlocks({
  content,
}: {
  content: readonly BlogContentBlock[];
}) {
  const t = useT();

  return (
    <div className="mt-8 space-y-4">
      {content.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="mt-8 font-display text-xl font-bold">
                {t(block.textKey)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-6 font-display text-lg font-semibold">
                {t(block.textKey)}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="leading-relaxed text-foreground/85">
                {t(block.textKey)}
              </p>
            );
          case "pLinks":
            return (
              <LinkedParagraph
                key={i}
                text={t(block.textKey)}
                links={block.links.map((link) => ({
                  href: link.href,
                  label: t(link.labelKey),
                }))}
              />
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-2 ps-5 text-foreground/85">
                {block.itemKeys.map((itemKey) => (
                  <li key={itemKey} className="leading-relaxed">
                    {t(itemKey)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-2 ps-5 text-foreground/85">
                {block.itemKeys.map((itemKey) => (
                  <li key={itemKey} className="leading-relaxed">
                    {t(itemKey)}
                  </li>
                ))}
              </ol>
            );
          case "checklist":
            return (
              <ul key={i} className="space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5">
                {block.itemKeys.map((itemKey) => (
                  <li key={itemKey} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90">
                    <CheckSquare className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>{t(itemKey)}</span>
                  </li>
                ))}
              </ul>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full min-w-[28rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40">
                      {block.headers.map((headerKey) => (
                        <th
                          key={headerKey}
                          className="px-3 py-2.5 text-start font-semibold text-foreground"
                        >
                          {t(headerKey)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border/40 last:border-0">
                        {row.map((cellKey) => (
                          <td key={cellKey} className="px-3 py-2.5 align-top text-foreground/85">
                            {t(cellKey)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "faq":
            return (
              <div key={i} className="space-y-3">
                {block.items.map((item) => (
                  <details
                    key={item.qKey}
                    className="group rounded-xl border border-border/60 bg-card px-4 py-3 open:shadow-sm"
                  >
                    <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-start justify-between gap-3">
                        <span>{t(item.qKey)}</span>
                        <span className="text-muted-foreground transition group-open:rotate-45">+</span>
                      </span>
                    </summary>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {t(item.aKey)}
                    </p>
                  </details>
                ))}
              </div>
            );
          case "cta":
            return (
              <aside
                key={i}
                className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-brand/[0.08] p-5 sm:p-6"
              >
                <p className="font-display text-lg font-bold tracking-tight">{t(block.titleKey)}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(block.bodyKey)}</p>
                <Link
                  href={block.href}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-glow"
                >
                  {t(block.buttonKey)}
                  <ArrowUpRight className="size-4" />
                </Link>
              </aside>
            );
          default: {
            const _exhaustive: never = block;
            return _exhaustive;
          }
        }
      })}
    </div>
  );
}
