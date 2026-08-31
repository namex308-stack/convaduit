# Metadata SEO Report — ConvAudit

**Scope:** Technical SEO metadata only (titles, descriptions, canonicals, Open Graph, Twitter, robots meta).  
**Official brand:** ConvAudit  
**Official URL:** https://www.convaudit.com/  
**Date:** 30 August 2026

No UI, layout, backend, database, authentication, payment, audit-engine, or API logic was changed.

---

## Title changes

| Surface | Before | After |
| --- | --- | --- |
| Homepage `<title>` | `ConvAudit \| Ecommerce SEO Audit & GEO` (37 chars, already ≤60) | **Unchanged length.** Same string. |
| Homepage OG / Twitter title | `ConvAudit — Ecommerce SEO Audit & AI Visibility` | **Same as document title:** `ConvAudit \| Ecommerce SEO Audit & GEO` |
| Root `title.default` / root OG / Twitter | Mixed default vs OG strings | One title: `SITE_DEFAULT_TITLE` |
| Private app layouts | Inherited marketing title | Absolute `ConvAudit` (not the homepage SERP headline) |
| Inner public pages | Unique Arabic titles (already) | Unchanged |

Homepage title is **37 characters** (≤60). The `%s · ConvAudit` template is still skipped on `/` so the brand is not repeated.

OG image / Twitter image `alt` now matches that title.

---

## Description changes

| Surface | Before | After |
| --- | --- | --- |
| Homepage / root default | Arabic: منصة لتحليل وتحسين المتاجر الإلكترونية… | Official English: *ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.* Unique vs `/about`. No `%`, no keyword stuffing. |
| `/blog/geo-ai-visibility-guide` meta | Excerpt claiming ChatGPT / Perplexity / Google AI will recommend products | Factual GEO meta (page signals, not live engine queries). Visible excerpt unchanged. |
| `/blog/conversion-rate-optimization` meta | Excerpt claiming immediate sales lift | Factual conversion-page meta (no guaranteed rate). Visible excerpt unchanged. |
| Other public pages | Unique Arabic descriptions | Unchanged |
| Private app layouts | Inherited marketing description | `صفحة حساب ConvAudit — تتطلّب تسجيلاً وليست مخصصة لفهرسة محركات البحث.` |

---

## Canonical changes

`metadataBase` remains `new URL(getSiteUrl())` → production origin `https://www.convaudit.com` (www, HTTPS). Apex `convaudit.com` is still rewritten to www.

| URL | Before | After |
| --- | --- | --- |
| Home HTML canonical + OG `url` | `https://www.convaudit.com` | `https://www.convaudit.com/` |
| Inner public pages | `https://www.convaudit.com{path}` | Unchanged |
| Private pages | No page canonical (root does not set one) | Unchanged |

Helper: `canonicalPageUrl()` in `src/lib/site-url.ts`. Home is the official origin **with** trailing slash; other paths stay slash-normalized.

Sitemap home URL was updated to the same home canonical so sitemap and `<link rel="canonical">` do not disagree. That is the only sitemap edit. **robots.txt was not changed.**

---

## OG changes

- Public pages still emit `openGraph.title`, `description`, `url` (canonical), `siteName: ConvAudit`, `locale: ar_EG`, `type` website/article, image `/opengraph-image` 1200×630.
- Homepage OG title now equals the document title (duplicate OG headline removed).
- Homepage OG `url` is `https://www.convaudit.com/`.
- Private OG title/description no longer copy the marketing homepage.
- Image `alt` aligned with `SITE_DEFAULT_TITLE`.

---

## Twitter changes

- Public pages still emit `summary_large_image`, title, description, `/twitter-image`.
- `site` / `creator` remain omitted (no verified ConvAudit X handle).
- Homepage Twitter title matches the document title.
- Private Twitter title/description use the non-index copy.

---

## Indexability changes

| Surface | Before | After |
| --- | --- | --- |
| Public marketing + blog | `index,follow` | Same, plus `googleBot` `index,follow` and `max-image-preview: large` (child `robots` no longer drops the root googleBot object) |
| Private prefixes | `noindex,nofollow` + robots.txt disallow + `X-Robots-Tag` | Same robots; **unique non-marketing title/description/keywords** so leaked URLs are not duplicate homepage documents |
| 404 | `noindex, follow` | Unchanged |
| `indexable: false` on public layouts | Unused | Still unused |

Public pages are not noindexed. Private pages are not indexed.

---

## Files changed

| File | Change |
| --- | --- |
| `src/lib/seo/site-copy.ts` | One homepage title; `SITE_DESCRIPTION` = official English sentence. |
| `src/lib/site-url.ts` | `canonicalPageUrl()` — home trailing slash. |
| `src/lib/seo/page-metadata.ts` | Canonical helper; `PUBLIC_PAGE_ROBOTS` with googleBot. |
| `src/lib/seo/private-page-metadata.ts` | Private title, description, empty keywords, OG/Twitter overrides. |
| `src/app/layout.tsx` | Root OG/Twitter title = `SITE_DEFAULT_TITLE`. |
| `src/app/page.tsx` | Single title/description; no second OG/Twitter headline. |
| `src/app/sitemap.ts` | Home URL matches canonical (`…com/`). |
| `src/app/blog/[slug]/layout.tsx` | Uses `blogPostMetaDescription()`. |
| `src/lib/blog-posts.ts` | Meta descriptions for GEO and conversion posts. |
| `src/app/opengraph-image.tsx` | `alt` matches homepage title. |
| `src/app/twitter-image.tsx` | Same. |
| Tests | Canonical slash, unified title, official description, private copy, uniqueness of blog meta. |

Not modified: `robots.ts` (no defect). Inner public layout titles/descriptions that were already unique. Visible H1s and blog body excerpts.

---

## Test results

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | **87 files, 506 passed** |

## Build results

`npm run build` succeeded. Public marketing routes remain static; blog slugs remain SSG.

---

## Remaining issues

Out of this metadata pass:

- Visible homepage H1 still omits ConvAudit (UI; not changed).
- Document `lang="ar"` vs English homepage title and description (single-locale site; English SERP targeting without `hreflang`).
- H1 ≠ `<title>` on pricing, docs, blog, privacy, security, roadmap (visible chrome).
- GEO/conversion **on-page excerpts** still overclaim; only **meta** descriptions were corrected.
- Blog `publishedOn` dates remain after 30 August 2026.
- Organization `sameAs` still empty until a verified ConvAudit profile exists.
- JSON-LD WebPage `@id` for home remains origin without trailing slash (`https://www.convaudit.com`); HTML canonical is `https://www.convaudit.com/`. Search uses the HTML canonical.
- `/llms.txt` still omitted from the sitemap (optional).
