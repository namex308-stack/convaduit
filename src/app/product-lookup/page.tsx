"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Search, Star } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { SurfaceCard } from "@/components/design-system/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRODUCT_LOOKUP_PAGE_SUBTITLE,
  PRODUCT_LOOKUP_PAGE_TITLE,
} from "@/app/product-lookup/copy";
import { parseApiErrorResponse } from "@/lib/api/client-error";
import { useT } from "@/lib/i18n";
import type { ProductLookupResult } from "@/lib/product-lookup";
import { ROUTES } from "@/lib/routes";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidHttpUrl(raw: string): boolean {
  try {
    const u = new URL(normalizeUrl(raw));
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function ProductLookupPage() {
  const t = useT();
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProductLookupResult | null>(null);
  const [imageBroken, setImageBroken] = React.useState(false);

  const filled = url.trim().length > 0;
  const valid = !filled || isValidHttpUrl(url);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (!isValidHttpUrl(normalized)) {
      setError(t("productLookup.urlError"));
      return;
    }

    setLoading(true);
    setError(null);
    setImageBroken(false);
    setResult(null);

    try {
      const res = await fetch("/api/product-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      if (!res.ok) {
        const parsed = await parseApiErrorResponse(
          res,
          t("productLookup.genericError"),
          t("productLookup.genericError")
        );
        setError(parsed.message);
        return;
      }
      const body = (await res.json()) as ProductLookupResult;
      setResult(body);
    } catch {
      setError(t("productLookup.genericError"));
    } finally {
      setLoading(false);
    }
  }

  const primaryImage = result?.ogImage || result?.images[0] || null;
  const showImage = Boolean(primaryImage) && !imageBroken;

  return (
    <PageShell>
      <PageHeader
        title={PRODUCT_LOOKUP_PAGE_TITLE}
        subtitle={PRODUCT_LOOKUP_PAGE_SUBTITLE}
        icon={Search}
      />
      <PageContent className="max-w-3xl space-y-8">
        <SurfaceCard className="p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-lookup-url">{t("productLookup.urlLabel")}</Label>
              <Input
                id="product-lookup-url"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://shop.example.com/products/serum"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-invalid={filled && !valid}
                disabled={loading}
              />
              {filled && !valid ? (
                <p className="text-sm text-destructive">{t("productLookup.urlError")}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{t("productLookup.urlHint")}</p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="rounded-full font-semibold shadow-glow"
              disabled={loading || !filled || !valid}
            >
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {loading ? t("productLookup.analyzing") : t("productLookup.submit")}
            </Button>
          </form>
          {error ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </SurfaceCard>

        {result ? (
          <SurfaceCard className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {showImage && primaryImage ? (
                <div className="relative size-40 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/40">
                  <Image
                    src={primaryImage}
                    alt={result.title || t("productLookup.imageAlt")}
                    fill
                    className="object-cover"
                    sizes="160px"
                    onError={() => setImageBroken(true)}
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1 space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-pretty">
                  {result.title || t("productLookup.untitled")}
                </h2>
                <p className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
                  {result.price || t("productLookup.priceMissing")}
                </p>
                <p className="text-xs text-muted-foreground break-all" dir="ltr">
                  {result.url}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t("productLookup.brand")} value={result.brand} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t("productLookup.rating")}
                </p>
                <p className="mt-1 text-sm text-foreground inline-flex items-center gap-1.5">
                  {result.rating ? <Star className="size-4 text-amber-500" aria-hidden /> : null}
                  {result.rating || "—"}
                </p>
              </div>
              <Field label={t("productLookup.reviews")} value={result.reviews} />
            </div>

            {result.faq.length > 0 ? (
              <div>
                <h3 className="font-display text-lg font-semibold mb-3">
                  {t("productLookup.faq")}
                </h3>
                <ul className="space-y-3">
                  {result.faq.map((item, index) => (
                    <li key={`${index}-${item.q}`} className="rounded-lg border border-border/50 bg-background/80 p-3">
                      <p className="text-sm font-medium">{item.q}</p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </SurfaceCard>
        ) : null}

        <SurfaceCard className="p-5 sm:p-6 space-y-3">
          <h2 className="font-display text-lg font-semibold">{t("productLookup.ctaTitle")}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t("productLookup.ctaBody")}</p>
          <Button asChild variant="outline" className="rounded-full font-semibold">
            <Link href={ROUTES.auditNew}>{t("productLookup.ctaButton")}</Link>
          </Button>
        </SurfaceCard>
      </PageContent>
    </PageShell>
  );
}
