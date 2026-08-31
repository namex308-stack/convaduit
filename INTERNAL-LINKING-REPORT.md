# Internal Linking Report — ConvAudit

**Scope:** Internal linking and indexability only.  
**Official brand:** ConvAudit  
**Official URL:** https://www.convaudit.com/  
**Date:** 30 August 2026

No UI redesign, layout chrome, backend, database, authentication, payment, API, audit-engine, Gemini, Firecrawl, or Supabase changes. No new pages. No links to dashboard, auth, onboarding, `/geo`, or other noindex routes were added.

---

## Scan of public pages

Indexable HTML routes (sitemap + `publicPageMetadata` `index,follow`):

| Path | In sitemap | robots.txt | Canonical | In-content topical links (after) |
| --- | --- | --- | --- | --- |
| `/` | yes | allow | www | Entity nav (sr-only) + footer |
| `/pricing` | yes | allow | www | Footer (unchanged) |
| `/docs` | yes | allow | www | Related list + new topic guides |
| `/blog` | yes | allow | www | Index cards to all posts |
| `/blog/{6 slugs}` | yes | allow | www | Topical related posts |
| `/about` | yes | allow | www | Inline topic links |
| `/contact` | yes | allow | www | FAQ + refund (unchanged) |
| `/security` | yes | allow | www | Privacy (unchanged) |
| `/privacy` | yes | allow | www | Footer |
| `/terms` | yes | allow | www | Privacy + refund (unchanged) |
| `/refund-policy` | yes | allow | www | Contact (unchanged) |
| `/roadmap` | yes | allow | www | Footer |

`/llms.txt` remains crawlable (`Allow: /`), not in the HTML sitemap (by design). Private prefixes stay `Disallow` + `noindex,nofollow`.

---

## Orphan pages found

**None** among indexable HTML URLs.

The marketing footer already listed every sitemap static path and every blog slug. Home is linked from the logo. After this pass, about and docs also point at the topic cluster, so those URLs are no longer footer-only for topical discovery.

Private `/geo` is not an orphan: it is noindex and robots-disallowed. Marketing GEO links continue to `/#methodology` and `/blog/geo-ai-visibility-guide`, never `/geo`.

---

## Broken links fixed

| Before | After | Why |
| --- | --- | --- |
| Trust-resources `href: "#methodology"` | `/#methodology` | Hash-only only resolves on `/`. Off-home reuse would 404 the fragment. Same card, same visible UI. |

No other marketing hrefs mapped to missing routes or missing fragment ids (`/#features`, `/#how`, `/#methodology`, `/#platforms`, `/#faq`, `/docs#2`, `/security#infrastructure`).

Existing navbar/hero CTAs to `/auth?mode=…` were left in place (conversion CTAs, not new SEO links).

---

## Links added

All destinations are public and indexable. Anchors are descriptive (topic + page type).

### `/about` (inline in existing cards)

| Anchor | Destination |
| --- | --- |
| ecommerce audit | `/docs` |
| ecommerce website audit | `/#how` |
| توصيات مرتبة | `/docs` |
| ecommerce SEO audit | `/blog/product-schema-markup` |
| ecommerce conversion optimization | `/blog/conversion-rate-optimization` |
| AI visibility | `/blog/geo-ai-visibility-guide` |
| GEO (تحسين محركات التوليد) | `/#methodology` |
| trust signals | `/blog/trust-signals-ecommerce` |
| competitor analysis | `/blog/competitor-analysis-strategy` |
| Shopify، WooCommerce، سلة، زد | `/#platforms` |
| مولّد العناوين والأوصاف والأسئلة الشائعة | `/docs#2` |

Same `SurfaceCard` / typography. Links use the existing legal-page style (`text-primary hover:underline`).

### `/docs` related list (existing section)

Added five public guides with descriptive Arabic anchors:

- دليل GEO وظهور الذكاء الاصطناعي → `/blog/geo-ai-visibility-guide`
- دليل تحسين التحويل للمتاجر الإلكترونية → `/blog/conversion-rate-optimization`
- دليل Product Schema وSEO للمتاجر → `/blog/product-schema-markup`
- دليل إشارات الثقة في المتاجر الإلكترونية → `/blog/trust-signals-ecommerce`
- دليل تحليل المنافسين للمتاجر → `/blog/competitor-analysis-strategy`

Prior related items (`/#how`, `/#methodology`, `/#platforms`, `/docs#2`, `/pricing`) were kept.

### Blog related posts

Replaced “next three slugs in array order” with a topical map (3 each, no self-links):

| Post | Related |
| --- | --- |
| geo-ai-visibility-guide | product-schema, ai-product-descriptions, trust-signals |
| conversion-rate-optimization | trust-signals, competitor-analysis, geo-ai-visibility |
| product-schema-markup | geo-ai-visibility, ai-product-descriptions, conversion |
| competitor-analysis-strategy | conversion, trust-signals, geo-ai-visibility |
| ai-product-descriptions | product-schema, geo-ai-visibility, conversion |
| trust-signals-ecommerce | conversion, competitor-analysis, product-schema |

Same three-card related grid.

### Homepage entity nav (`sr-only`)

Conversion dest changed from `/#features` (duplicate of the SEO item) to `/blog/conversion-rate-optimization` (“تدقيق التحويل لصفحات المنتجات”). Visible homepage layout unchanged.

---

## Indexability changes

**None required.** Public pages already use `index,follow`, unique www canonicals, and `X-Robots-Tag` / `privatePageMetadata` on private prefixes.

A source-of-truth list `PUBLIC_INDEXABLE_PATHS` now must match sitemap HTML URLs (test-enforced).

---

## Robots changes

**None.** `Allow: /`, `Disallow` = `/api/` + `PRIVATE_APP_PATHS`, sitemap and host stay `https://www.convaudit.com`. `/llms.txt` stays allowed. No new per-bot rules.

---

## Sitemap changes

**None.** Still 11 static marketing URLs + 6 blog slugs, www origin, no `lastModified`, no private/API/`/status`/`/changelog`/`/affiliate`. `/llms.txt` still omitted (text discovery file, not an HTML document).

---

## Files changed

| File | Change |
| --- | --- |
| `src/lib/seo/internal-links.ts` | Public path list, fragment map, href validators. |
| `src/lib/seo/internal-links.test.ts` | Orphans, broken/private hrefs, topic cluster, sitemap alignment. |
| `src/app/about/copy.ts` | Inline link metadata on existing paragraphs. |
| `src/app/about/page.tsx` | Renders those phrases as `Link` (same paragraph classes). |
| `src/app/about/copy.test.ts` | Phrase/href wrapping. |
| `src/app/docs/related-links.ts` | Shared related-link inventory. |
| `src/app/docs/page.tsx` | Renders that inventory. |
| `src/lib/locale/messages/ar.ts` | Five related-guide labels. |
| `src/lib/blog-posts.ts` | `BLOG_RELATED_SLUGS` / `relatedBlogSlugs()`. |
| `src/app/blog/[slug]/page.tsx` | Uses topical related slugs. |
| `src/components/sections/trust-resources.tsx` | `/#methodology`; export inventory. |
| `src/components/sections/home-entity.tsx` | Conversion → conversion guide. |

Not modified: `robots.ts`, `sitemap.ts`, `page-metadata.ts`, `private-app-paths.ts`, navbar/auth CTAs, footer inventory (already complete).

---

## Tests

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | **87 files, 503 passed** |

Browser check (dev `http://127.0.0.1:3000`): `/about` shows the new in-paragraph links; `/docs` related list includes the five guides; `/blog/product-schema-markup` and `/blog/geo-ai-visibility-guide` load with topical related cards. Layout chrome (PageShell, footer columns, docs related box) is unchanged.

## Build

`npm run build` succeeded. `/about`, `/docs`, `/blog`, and all six posts remain static.

---

## Remaining issues

Out of this linking/indexability pass (still true):

- `/llms.txt` is crawlable but not in sitemap (optional GEO discovery; left as-is).
- Sitemap has no `lastModified`; blog `publishedOn` dates are still after 30 August 2026.
- Visible homepage H1 still omits ConvAudit; entity copy remains `sr-only`.
- H1 ≠ `<title>` on pricing, docs, blog, privacy, security, roadmap, home.
- GEO blog excerpt still overclaims live ChatGPT / Perplexity recommendations.
- Private layouts can still inherit the marketing meta description (they are noindex).
- Organization `sameAs` is empty until a verified ConvAudit profile exists.
- Navbar/hero still link guests to `/auth` (intentional CTAs, not indexable).
- Docs related list is longer (same component, more items) — not a layout redesign.
- Blog article bodies remain unlinked prose; related cards carry the cross-links.
