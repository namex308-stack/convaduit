# SEO / GEO Audit — ConvAudit

**Scope:** Source-code audit only. No files in the product were modified except this report.  
**Audit date:** 30 August 2026  
**Official brand (provided):** ConvAudit  
**Official website (provided):** https://www.convaudit.com/  
**Official description (provided):** “ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.”  
**Method:** Repository evidence only (`src/`, `next.config.ts`, `vercel.json`, tests). No live crawl of production HTML, no Search Console data, no assumption that social profiles exist beyond the URLs in source.

---

## Executive Summary

The marketing SEO architecture is centralized and test-covered. Public pages share `publicPageMetadata()` for title, description, www canonical, Open Graph, Twitter, and `index,follow`. Private app prefixes are disallowed in `robots.ts`, tagged `noindex,nofollow` in segment layouts, and also send `X-Robots-Tag: noindex, nofollow`. The sitemap lists only public URLs on `https://www.convaudit.com`. Apex `convaudit.com` is rewritten to www in `getSiteUrl()`, middleware, `next.config.ts`, and `vercel.json`.

Brand naming on public surfaces is **ConvAudit**, not StorePulse AI. The string `ConvaDuit` does not appear in product copy. The official English description string does **not** appear anywhere in the repository. Homepage metadata is English title + Arabic description; `html lang` is `ar`. Organization `sameAs` points at X and LinkedIn URLs whose handles encode **CONVADUIT** / **conva-aduit**, not ConvAudit.

Homepage JSON-LD emits Organization, WebSite, SoftwareApplication+Product, and FAQPage. It does **not** emit WebPage. Inner marketing pages emit WebPage + BreadcrumbList that reference `#organization` / `#website` / `#software` by `@id` without embedding those nodes. `/contact` emits both ContactPage and WebPage for the same URL.

Visible H1 text on several marketing pages does not match the `<title>` string. Blog posts display calendar dates in September–October 2026 (after this audit date); Article JSON-LD therefore omits `datePublished`. The GEO blog excerpt claims ChatGPT / Perplexity / Google AI will recommend products; FAQ, llms.txt, and schema state those scores are page-signal estimates, not live engine queries.

No broken marketing internal paths were found in source (footer, docs related links, hash targets that exist on the homepage, `/security#infrastructure`, `/docs#2`). This audit did not HTTP-check production.

---

## Current SEO Architecture

| Layer | Implementation | Files |
| --- | --- | --- |
| Canonical origin | `PRODUCTION_CANONICAL_ORIGIN` = `https://www.convaudit.com`; apex always rewritten | `src/lib/site-url.ts` |
| `metadataBase` | `new URL(getSiteUrl())` on root layout | `src/app/layout.tsx` |
| Public metadata | `publicPageMetadata({ title, description, path, type?, indexable? })` | `src/lib/seo/page-metadata.ts` |
| Private metadata | `privatePageMetadata()` → `index: false, follow: false` + `googleBot` | `src/lib/seo/private-page-metadata.ts` |
| `generateMetadata` | Only blog posts (`/blog/[slug]`) | `src/app/blog/[slug]/layout.tsx` |
| Robots | `src/app/robots.ts` → `Allow: /`, disallow `ROBOTS_DISALLOW_PATHS` | `src/lib/seo/private-app-paths.ts` |
| HTTP noindex | `X-Robots-Tag` on `/api/*` and every `PRIVATE_APP_PATHS` prefix | `next.config.ts` |
| Sitemap | `src/app/sitemap.ts` — 11 static routes + 6 blog slugs, no `lastModified` | `src/lib/routes.ts`, `src/lib/blog-posts.ts` |
| JSON-LD | `JsonLd` + builders in `structured-data.ts` | `src/components/seo/json-ld.tsx` |
| GEO / AI crawlers | `/llms.txt` route, not listed in sitemap | `src/app/llms.txt/route.ts`, `src/lib/seo/llms-txt.ts` |
| Host canonical | Middleware 308 + Next redirects + Vercel redirects | `src/middleware.ts`, `src/lib/www-canonical.ts`, `src/lib/apex-www-redirects.ts`, `vercel.json` |
| Locale | Arabic-only UI; `htmlLang: "ar"`, `ogLocale: "ar_EG"`; no `hreflang` | `src/lib/locale/config.ts` |

**Public indexable routes** (also asserted in `src/lib/seo/private-page-metadata.test.ts` and `src/lib/seo/robots-policy.test.ts`):

`/`, `/pricing`, `/docs`, `/blog`, `/blog/{6 slugs}`, `/security`, `/privacy`, `/terms`, `/refund-policy`, `/about`, `/contact`, `/roadmap`, plus `/llms.txt` (crawlable, not in sitemap).

**Private / noindex prefixes** (`PRIVATE_APP_PATHS`):

`/dashboard`, `/health`, `/audit`, `/history`, `/reports`, `/monitor`, `/geo`, `/settings`, `/checkout`, `/onboarding`, `/auth`, `/alerts`, `/notifications`, `/tasks`, plus `/api/`.

**`generateMetadata` vs static `metadata`:** All public marketing layouts except blog posts use `export const metadata`. Only `src/app/blog/[slug]/layout.tsx` uses `generateMetadata`. That is not a defect; it is how App Router is used here.

---

## Metadata Audit

**Root defaults** (`src/app/layout.tsx`):

- `metadataBase`: `new URL(getSiteUrl())`
- `title.default`: `SITE_DEFAULT_TITLE` = `ConvAudit | Ecommerce SEO Audit & GEO` (`src/lib/seo/site-copy.ts`)
- `title.template`: `%s · ConvAudit`
- `description`: `SITE_DESCRIPTION` (Arabic; see Keyword / Brand sections)
- `keywords`: `SITE_KEYWORDS` (English ecommerce/GEO terms + Arabic product terms)
- `authors` / `creator` / `publisher` / `applicationName`: `ConvAudit`
- Root **does not** set `alternates.canonical` or Open Graph `url` (comment: so private routes do not inherit `/`)

**Public helper** (`src/lib/seo/page-metadata.ts`):

- Canonical: `absoluteUrl(path)` (www origin)
- Open Graph: title, description, url = canonical, `siteName: ConvAudit`, `locale` from active locale (`ar_EG`), `type` website or article, image `/opengraph-image` 1200×630
- Twitter: `summary_large_image`, `site`/`creator` = `@CONVADUIT6k`, image `/twitter-image`
- Robots: `{ index: true, follow: true }` when `indexable` is default true
- Title suffix ` · ConvAudit` is dropped when composed length would exceed `SITE_TITLE_MAX` (60)

**Homepage override** (`src/app/page.tsx`):

- Calls `publicPageMetadata` with `title: SITE_OG_TITLE` then replaces document title with `{ absolute: SITE_DEFAULT_TITLE }`
- Document title: `ConvAudit | Ecommerce SEO Audit & GEO`
- OG/Twitter title: `ConvAudit — Ecommerce SEO Audit & AI Visibility`

**Uniqueness:** `src/lib/seo/public-metadata-uniqueness.test.ts` asserts every listed public page (11 static + 6 posts) has a unique title, unique description, unique www canonical, and `index: true, follow: true`. That test is source evidence of intended uniqueness, not a live SERP check.

### Issue: Official English description is absent from metadata

| Field | Value |
| --- | --- |
| **File** | `src/lib/seo/site-copy.ts` (also `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/seo/llms-txt.ts`, `src/lib/seo/structured-data.ts`) |
| **Location** | `SITE_DESCRIPTION`; homepage `metadata.description`; Organization/WebSite `SOFTWARE_DESCRIPTION`; llms.txt opening paragraph |
| **Current State** | Default description is Arabic: “منصة لتحليل وتحسين المتاجر الإلكترونية: تدقيق SEO، تحويل، ظهور AI/GEO، إشارات ثقة، وتحليل منافسين. Shopify وWooCommerce وسلة وزد.” llms.txt English blurb is a different sentence. Schema description is a longer Arabic paragraph. A repo-wide search for the official English sentence returns no matches. |
| **Problem** | The provided official product description is not used on any metadata, schema, or llms.txt surface. |
| **Why it matters** | Search and AI systems that key off the homepage description will not learn the official English entity sentence. |
| **Recommended Fix** | Use the official English description (or a faithful translation that preserves the same claims) on homepage meta description, Organization/WebSite description, About copy, and llms.txt. Keep Arabic UI copy aligned to the same claims. |
| **Priority** | Critical |

### Issue: Homepage document title and OG title differ; both are English while `lang="ar"`

| Field | Value |
| --- | --- |
| **File** | `src/app/page.tsx`, `src/lib/seo/site-copy.ts`, `src/app/layout.tsx`, `src/lib/locale/config.ts` |
| **Location** | `metadata.title` absolute vs `openGraph.title` / `twitter.title`; `<html lang={locale.htmlLang}>` with `htmlLang: "ar"` |
| **Current State** | Title `ConvAudit \| Ecommerce SEO Audit & GEO`. OG/Twitter `ConvAudit — Ecommerce SEO Audit & AI Visibility`. Description Arabic. `html` language Arabic. |
| **Problem** | Title language does not match page language or description language. |
| **Why it matters** | Google uses `html lang` and visible copy; a Latin title on an Arabic document weakens relevance for Arabic queries and can look mismatched in SERPs. |
| **Recommended Fix** | Pick one primary language for title + description + H1 + schema `inLanguage`. If the site is Arabic-first, use an Arabic title that still contains ConvAudit and the core terms (SEO, GEO / AI visibility). Keep an English variant only if you add a real English locale and `hreflang`. |
| **Priority** | High |

### Issue: Visible H1 does not match `<title>` on multiple public pages

| Field | Value |
| --- | --- |
| **File** | Layout `TITLE` constants vs `PageHeader title={...}` / locale keys |
| **Location** | See table below |
| **Current State** | Metadata titles are keyword-shaped; on-page H1s are shorter UI labels. |
| **Problem** | Title/H1 mismatch. |
| **Why it matters** | Crawlers and users compare the SERP title to the first heading. Divergence reduces confidence that the page is about the titled query. |
| **Recommended Fix** | Make H1 and `<title>` the same string (or H1 the full phrase and title a ≤60-character subset). |
| **Priority** | High |

| Route | Metadata title | Visible H1 source |
| --- | --- | --- |
| `/` | `ConvAudit \| Ecommerce SEO Audit & GEO` | `hero.headline1` + `hero.headline3`: “متجرك يخسر مبيعات كل يوم — اعرف السبب وأصلحه بالذكاء الاصطناعي.” (`src/components/sections/hero.tsx`, `src/lib/locale/messages/ar.ts`) — H1 does not contain “ConvAudit” |
| `/pricing` | `أسعار تدقيق المتاجر` | `pricing.title` → “الأسعار” (`src/app/pricing/page.tsx`) |
| `/docs` | `دليل تدقيق المتاجر وGEO` | `docs.title` → “التوثيق” (`src/app/docs/page.tsx`) |
| `/blog` | `مدونة SEO وGEO للمتاجر` (`src/app/blog/copy.ts`) | `blog.title` → “المدونة” (`src/app/blog/blog-index.tsx`) |
| `/privacy` | `سياسة الخصوصية` | H1 “الخصوصية” (`src/app/privacy/page.tsx`) |
| `/security` | `أمان المنتج والبيانات` | H1 “الأمان” (`src/app/security/page.tsx`) |
| `/roadmap` | `خارطة طريق المنتج` | H1 “خارطة الطريق” (`src/app/roadmap/page.tsx`) |
| `/about` | `من نحن` | H1 “من نحن” — match |
| `/contact` | `اتصل بنا` | H1 “اتصل بنا” — match |
| `/terms` | `الشروط والأحكام` | H1 “الشروط والأحكام” — match |
| `/refund-policy` | `سياسة الاسترداد` | H1 “سياسة الاسترداد” — match |

### Issue: Private layouts inherit root marketing description and keywords

| Field | Value |
| --- | --- |
| **File** | `src/lib/seo/private-page-metadata.ts`; e.g. `src/app/auth/layout.tsx`, `src/app/dashboard/layout.tsx` |
| **Location** | `privatePageMetadata()` returns only `robots` unless extras are passed. No private layout passes a title or description. |
| **Current State** | Auth and app surfaces inherit `SITE_DEFAULT_TITLE` / template, `SITE_DESCRIPTION`, `SITE_KEYWORDS`, and root OG/Twitter objects, with robots overridden to noindex. |
| **Problem** | If a private URL is fetched despite robots.txt, the HTML still advertises the public marketing description. |
| **Why it matters** | Defense in depth: noindex should be paired with non-marketing titles so leaked URLs are not treated as duplicate marketing pages. |
| **Recommended Fix** | Pass explicit `title` (e.g. “تسجيل الدخول”) and a short non-index description in `privatePageMetadata()` extras; omit or override `keywords` and OG on private layouts. |
| **Priority** | Medium |

---

## Canonical Audit

**Mechanism:** `absoluteUrl()` + `getSiteUrl()` rewrite apex `convaudit.com` and (on Vercel production / `ENFORCE_PUBLIC_SITE_URL=1`) `*.vercel.app` to `https://www.convaudit.com`. Tests in `src/lib/site-url.test.ts`, `src/lib/seo/page-metadata.test.ts`, `src/lib/seo/sitemap.test.ts`, `src/lib/seo/robots-policy.test.ts`.

**Per-page canonicals:** `alternates.canonical` = `absoluteUrl(path)`. Home is `https://www.convaudit.com` (no trailing slash). Other pages are `https://www.convaudit.com{path}`. OG `url` is set to the same canonical in `publicPageMetadata`.

**Host redirects:**

- `src/middleware.ts` → `redirectApexToWww` → 308
- `APEX_TO_WWW_REDIRECTS` in `src/lib/apex-www-redirects.ts` used by `next.config.ts`
- `vercel.json` permanent redirects apex → www

**Root layout:** no canonical (intentional).

### Issue: No `hreflang` / `alternates.languages`

| Field | Value |
| --- | --- |
| **File** | `src/lib/seo/page-metadata.ts`, `src/lib/locale/config.ts` |
| **Location** | `alternates` only sets `canonical`. `LOCALES["ar-gulf"]` exists but `enabled: false`. Comment: English is not supported. |
| **Current State** | Single locale `ar`. No `alternates.languages`. |
| **Problem** | Not a bug for a single-language site, but English titles/keywords target English queries without an English URL. |
| **Why it matters** | English SERP targeting without an English page or `hreflang` is inconsistent. |
| **Recommended Fix** | Either Arabic-only metadata, or add a real English locale with distinct URLs and `hreflang`. Do not leave English titles on `lang="ar"` as the only English signal. |
| **Priority** | Medium |

Canonicals among public pages are unique in tests. No apex canonicals are emitted when `NEXT_PUBLIC_APP_URL` is apex (rewritten to www). No evidence of self-conflicting canonicals in source.

---

## Robots Audit

**File:** `src/app/robots.ts`

- One rule: `userAgent: "*"`, `allow: "/"`, `disallow: ROBOTS_DISALLOW_PATHS`
- `sitemap`: `absoluteUrl("/sitemap.xml")`
- `host`: `getSiteUrl()` (www)

**Disallow list** (`src/lib/seo/private-app-paths.ts`): `/api/` plus all `PRIVATE_APP_PATHS`.

**Not disallowed (tests):** public marketing paths including `/llms.txt`.

**Complementary noindex:**

- Segment `robots` via `privatePageMetadata` / `not-found.tsx` / error boundaries
- `next.config.ts` `X-Robots-Tag: noindex, nofollow` on `/api/:path*` and each private prefix + `/:path*`
- `src/app/not-found.tsx`: `index: false, follow: true`
- `src/app/global-error.tsx` and `src/components/runtime/route-error.tsx`: HTML `<meta name="robots" content="noindex, nofollow" />`

**`indexable: false` on public pages:** Supported by `publicPageMetadata` but **never used** in app layouts (only in `page-metadata.test.ts`). All public marketing pages are indexable.

No static `public/robots.txt` exists (only `public/logo.svg`). Next Metadata Route is the sole robots document.

There are no per-bot GPTBot / PerplexityBot / Google-Extended rules. Policy is `*` for all crawlers.

No robots.txt defect found for allow/disallow vs public/private split. `/geo` is correctly private so marketing GEO links go to `/#methodology`, not `/geo` (`src/lib/seo/internal-links.test.ts`).

---

## Sitemap Audit

**File:** `src/app/sitemap.ts`

Static entries: `/` (priority 1), `/pricing` (0.9), `/blog` (0.8), `/docs` (0.7), blog posts (0.6), `/security` `/privacy` `/terms` `/refund-policy` `/about` `/contact` (0.5), `/roadmap` (0.4).

Blog slugs from `BLOG_POSTS`:

- `geo-ai-visibility-guide`
- `conversion-rate-optimization`
- `product-schema-markup`
- `competitor-analysis-strategy`
- `ai-product-descriptions`
- `trust-signals-ecommerce`

Deduplication by URL. `lastModified` omitted by design. Tests assert no `/status`, `/changelog`, `/affiliate`, no private prefixes, no `/api/`, www origin only.

**Not in sitemap:** `/llms.txt`, `/auth`, app routes, API.

### Issue: Sitemap has no lastmod and blog `publishedOn` dates are after this audit date

| Field | Value |
| --- | --- |
| **File** | `src/app/sitemap.ts`, `src/lib/blog-posts.ts` |
| **Location** | Sitemap entries omit `lastModified`. `publishedOn` values are `2026-09-20` through `2026-10-15`. Audit date is 2026-08-30. |
| **Current State** | All six posts are in the sitemap with no lastmod. Visible locale dates match those future calendar days (`blog.postN.date` in `ar.ts`). |
| **Problem** | Sitemap cannot signal freshness. Listed articles are dated in the future relative to today. |
| **Why it matters** | Future dates on live indexable URLs look inauthentic. Google may ignore or distrust dated markup. |
| **Recommended Fix** | Set `publishedOn` / visible dates to real publish days on or before today, or do not index posts until that calendar day. Add lastmod only from a real CMS/git timestamp. |
| **Priority** | High |

---

## Structured Data Audit

**Emitter:** `src/components/seo/json-ld.tsx` — `JSON.stringify` into `script type="application/ld+json"`.

| Page | Builder | Types in output |
| --- | --- | --- |
| `/` | `buildHomeJsonLdGraph()` | Organization, WebSite, SoftwareApplication+Product, FAQPage (4 `@graph` nodes). **No WebPage.** |
| `/pricing`, `/docs`, `/about`, `/privacy`, `/security`, `/terms`, `/refund-policy`, `/roadmap`, `/blog` | `buildMarketingPageJsonLd()` | WebPage + BreadcrumbList. References `#website`, `#software`, `#organization` by `@id` only. |
| `/contact` | `buildContactPageJsonLd()` **and** `buildMarketingPageJsonLd()` | ContactPage **plus** WebPage + BreadcrumbList |
| `/blog/[slug]` | `buildBlogArticleJsonLd()` | Article with nested Organization author + publisher; `mainEntityOfPage` WebPage `@id` = article URL |

FAQ JSON-LD is built from the same `HOME_FAQ_KEYS` as the visible FAQ (`src/lib/seo/faq-keys.ts`). Offers on SoftwareApplication map `MARKETING_PLANS` prices in EGP (`src/lib/billing/plans.ts`). Tests forbid live ChatGPT-query claims in schema features.

`buildOrganizationJsonLd` / `buildWebSiteJsonLd` exist for tests/reuse; they are not mounted as extra scripts on inner pages.

---

## Organization Schema Audit

**File:** `src/lib/seo/structured-data.ts` — `organizationNode()`

Emitted on the **homepage graph only** (full node). Fields:

- `@type`: Organization
- `@id`: `{base}#organization`
- `name`: ConvAudit
- `url`: site base (www in production)
- `logo`: ImageObject `absoluteUrl("/apple-icon")` 180×180
- `description`: Arabic `SOFTWARE_DESCRIPTION` (not the official English sentence)
- `email`: `alihashem@convaudit.com` (`src/lib/seo/contact.ts`)
- `sameAs`: see sameAs section
- `contactPoint`: customer support, email, `/contact`, `availableLanguage: ["ar"]`

Blog Article embeds Organization as `author` and `publisher` with the same `@id`, `name`, `url`, and publisher `logo`. That is not a second homepage script; it is nested inside Article.

Inner marketing WebPage sets `publisher: { "@id": organizationSchemaId(base) }` without including the Organization node on that page.

### Issue: Homepage Organization description is not the official English description

Covered under Brand / Metadata. Schema description is Arabic product copy with GEO caveats. Priority: High (entity), grouped with Critical official-description gap.

### Issue: Inner pages do not include an Organization node

| Field | Value |
| --- | --- |
| **File** | `src/lib/seo/structured-data.ts` — `buildMarketingPageJsonLd` |
| **Location** | WebPage `publisher` / `about` / `isPartOf` are `@id` pointers only |
| **Current State** | About, docs, etc. do not serialize Organization, WebSite, or SoftwareApplication. |
| **Problem** | A crawler that fetches `/about` in isolation does not receive a complete Organization entity. |
| **Why it matters** | Knowledge Graph / GEO parsers often consume the page they cite, not only the homepage. |
| **Recommended Fix** | Include the Organization node (and optionally WebSite) in each public page graph, still keyed by the same `@id`, or use a single `@graph` that always contains Organization + WebPage. |
| **Priority** | High |

---

## Website Schema Audit

**File:** `src/lib/seo/structured-data.ts` — `webSiteNode()`

Homepage only:

- `@type`: WebSite
- `@id`: `{base}#website`
- `name`: ConvAudit
- `url`: base
- `inLanguage`: `"ar"`
- `description`: same Arabic `SOFTWARE_DESCRIPTION`
- `publisher`: `{ "@id": #organization }`
- `about`: `{ "@id": #software }`

No `potentialAction` / SearchAction. No WebSite node on inner pages (only `isPartOf` `@id`).

### Issue: Homepage graph has WebSite but no WebPage

| Field | Value |
| --- | --- |
| **File** | `src/lib/seo/structured-data.ts` — `buildHomeJsonLdGraph()`; `src/app/page.tsx` |
| **Location** | `@graph` length 4; types asserted in `structured-data.test.ts`: Organization, WebSite, SoftwareApplication+Product, FAQPage |
| **Current State** | No `@type: WebPage` for `https://www.convaudit.com`. |
| **Problem** | The checklist item WebPage JSON-LD is missing on the primary URL. Inner pages have WebPage; the home URL does not. |
| **Why it matters** | WebPage is the typed document entity (headline, about, isPartOf). Without it, home relies on WebSite + SoftwareApplication only. |
| **Recommended Fix** | Add a WebPage node with `@id` and `url` equal to the home canonical, `isPartOf` WebSite, `about` SoftwareApplication, `publisher` Organization, and `inLanguage: "ar"` (or match chosen language). |
| **Priority** | High |

---

## sameAs Audit

**File:** `src/lib/seo/social.ts`

```
SOCIAL_X_URL = "https://x.com/CONVADUIT6k"
SOCIAL_X_HANDLE = "@CONVADUIT6k"
SOCIAL_LINKEDIN_URL = "https://www.linkedin.com/in/conva-aduit-1044883a8"
ORGANIZATION_SAME_AS = [SOCIAL_X_URL, SOCIAL_LINKEDIN_URL]
```

Used in Organization `sameAs`, footer `SocialLinks`, contact page, Twitter card `site`/`creator`, and llms.txt.

This audit did not verify that those profiles exist or that they display the name ConvAudit.

### Issue: Official social identifiers spell ConvaDuit-style names, not ConvAudit

| Field | Value |
| --- | --- |
| **File** | `src/lib/seo/social.ts` (locked by `src/lib/seo/social.test.ts`) |
| **Location** | Handle `CONVADUIT6k`; LinkedIn slug `conva-aduit` |
| **Current State** | Product name in UI/schema is ConvAudit. sameAs URLs contain CONVADUIT / conva-aduit. |
| **Problem** | Entity linking will attach ConvAudit to handles that look like ConvaDuit / misspelled “audit”. |
| **Why it matters** | sameAs is how Organization is merged with social profiles. Wrong spelling splits or pollutes the entity. |
| **Recommended Fix** | Point sameAs and Twitter `site`/`creator` at profiles whose visible name and handle are ConvAudit. Update tests accordingly. Do not use ConvaDuit-derived handles as official identity. |
| **Priority** | Critical |

---

## Open Graph Audit

Set on root (`src/app/layout.tsx`) and overridden per public page (`publicPageMetadata`).

| Property | Public pages | Root / private inherit |
| --- | --- | --- |
| `og:title` | Page title (home: `SITE_OG_TITLE`) | `SITE_OG_TITLE` |
| `og:description` | Page description | `SITE_DESCRIPTION` (Arabic) |
| `og:url` | Canonical www URL | **not set** |
| `og:site_name` | ConvAudit | ConvAudit |
| `og:type` | `website` or `article` (blog posts) | `website` |
| `og:locale` | `ar_EG` | `ar_EG` |
| `og:image` | `/opengraph-image` 1200×630, alt `SITE_OG_TITLE` | same |

**Image file:** `src/app/opengraph-image.tsx` — Arabic headlines (“حوّل كل صفحة منتج” / “إلى آلة تحويل مبيعات.”), brand word ConvAudit, kicker `AI INTELLIGENCE`. Alt text is English `SITE_OG_TITLE`.

No `og:locale:alternate`. No per-article OG images (all pages share the default generator).

Home OG title ≠ document title (see Metadata). Priority already High.

---

## Twitter Audit

| Property | Value |
| --- | --- |
| `twitter:card` | `summary_large_image` |
| `twitter:site` | `@CONVADUIT6k` |
| `twitter:creator` | `@CONVADUIT6k` |
| `twitter:title` / `description` | Same pattern as OG |
| `twitter:image` | `/twitter-image` (`src/app/twitter-image.tsx`) |

Twitter image copy is a different Arabic subhead (“تحليل وتحسين التجارة الإلكترونية بالذكاء الاصطناعي”) than the OG image. Alt is still English `SITE_OG_TITLE`.

sameAs/handle issue applies here (Critical, see sameAs).

---

## Heading Structure Audit

**Homepage (`src/app/page.tsx`):**

- One H1 in `hero.tsx` (Arabic conversion headline; no “ConvAudit”)
- `HomeEntityCopy` (`src/components/sections/home-entity.tsx`): visually hidden (`sr-only`) **H2** “ConvAudit — منصة تحليل وتحسين المتاجر الإلكترونية”
- Section titles are H2 via `SectionHeader` (`src/components/design-system/section.tsx`)
- Feature pillars, methodology cards, comparison, etc. use H3 under those H2s
- Footer columns are H3 (`src/components/layout/footer.tsx`)
- Duplicate `id="how"` exists in unused `src/components/sections/how-it-works.tsx`; homepage actually mounts `ConceptExplainer` with `id="how"`. `HowItWorks` is never imported — not a live duplicate ID.

**Inner marketing pages:** `PageHeader` renders a single H1; section cards use H2. Contact uses H2 for the email address (`dir="ltr"`).

**Blog index:** H1 “المدونة”; featured post H2; remaining posts H3.

**Blog post:** H1 from post title; body H2/H3 from copy keys; related H2 + H3.

**Docs:** H1 “التوثيق”; numbered sections H2; related H2.

No public page was found with multiple H1s in the marketing shell. Private app pages have their own H1s (out of index).

### Issue: Homepage H1 omits the brand name; brand H2 is `sr-only`

| Field | Value |
| --- | --- |
| **File** | `src/components/sections/hero.tsx`, `src/components/sections/home-entity.tsx` |
| **Location** | Hero H1; entity section `className="sr-only"` |
| **Current State** | Visible H1 is a sales line. ConvAudit appears in a screen-reader-only H2 plus logo wordmark. |
| **Problem** | Primary heading does not name the product. Hidden H2 may be discounted as cloaking-adjacent if overused. |
| **Why it matters** | Brand + query matching is strongest in a visible H1. |
| **Recommended Fix** | Put “ConvAudit” in the visible H1 (or a visible H1/H2 pair), keep entity copy visible, not `sr-only`. |
| **Priority** | High |

### Issue: Footer H3s sit under no page-level outline on inner pages

Informational only. Footer H3s (“المنتج”, etc.) appear after the page H1/H2s. Not broken hierarchy. **Priority:** Low.

---

## Internal Linking Audit

**Footer** (`src/components/layout/footer.tsx`): crawlable `Link` hrefs; tests require every sitemap static path plus all blog slugs. Hash targets: `/#features`, `/#how`, `/#methodology`, `/#platforms`, `/#faq`. Docs AI generator: `/docs#2`.

**Homepage hash IDs that exist in mounted sections:**

- `features` — `src/components/sections/features.tsx`
- `how` — `src/components/sections/concept-explainer.tsx`
- `methodology` — `src/components/sections/methodology.tsx`
- `platforms` — `src/components/sections/logos-strip.tsx`
- `faq` — `src/components/sections/faq.tsx`
- `pricing` — `src/components/sections/pricing.tsx`
- `security` — `src/components/sections/security-band.tsx`
- `why-lose-sales` — `src/components/sections/why-lose-sales.tsx`

**Navbar** (`src/components/layout/navbar.tsx`): `href={`/#${target}`}` for features, how, methodology, security, pricing — those IDs exist on `/`.

**Docs related:** `/#how`, `/#methodology`, `/#platforms`, `/docs#2`, `/pricing` — `#2` is `id={`${i}`}` for the third docs section (AI generator) in `src/app/docs/page.tsx`.

**Trust resources:** `/docs`, `#methodology` (hash-only, valid on homepage where the component is used), `/security`, `/privacy`, `/security#infrastructure` (exists in `src/app/security/page.tsx`), `/roadmap`.

**CTAs:** `CRAWLABLE_START_AUDIT_HREF` = `/auth?mode=signup&next=/onboarding` (`src/lib/marketing-hrefs.ts`). `/auth` is noindex + robots disallow (intentional).

**Entity nav** (`home-entity.tsx`): `/#features`, `/#methodology`, blog posts `trust-signals-ecommerce` and `competitor-analysis-strategy`.

No marketing href in the inventory above points at a missing `ROUTES` path or a missing homepage/docs/security id.

---

## About Page Audit

**Files:** `src/app/about/layout.tsx`, `src/app/about/page.tsx`

- Indexed: `publicPageMetadata` path `/about`, unique Arabic title “من نحن”
- Description names ConvAudit, SEO, GEO, content generator, and `https://www.convaudit.com`
- JSON-LD: WebPage + BreadcrumbList (Home “ConvAudit” → “من نحن”)
- H1 “من نحن”; H2 sections: مهمتنا، ماذا نقدّم، المنتج والموقع الرسمي، المنصات والجمهور، حدود التحليل، نهجنا
- Body states: product is ConvAudit; official site is www.convaudit.com; GEO is page-signal estimates, not live ChatGPT/Perplexity; no admin login required

**Gaps vs official description:** About never uses the English official sentence. Positioning is “مستشار نمو بالذكاء الاصطناعي” (subtitle) rather than “AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals.” Trust is in the mission card, not in the metadata description.

**Priority of alignment:** High (see Brand Entity).

---

## Brand Entity Audit

**ConvAudit (official name) — present** in logo, root metadata, schema `name`, FAQ, about, terms, llms.txt, emails, bot UA `ConvAuditBot`, tests.

**Official website** `https://www.convaudit.com` — encoded as `PRODUCTION_CANONICAL_ORIGIN` (no trailing slash in origin constant; vercel apex redirect uses trailing slash on `/` only). About description includes `https://www.convaudit.com.`. llms.txt says “www.convaudit.com in production”.

**Official English description — not in the repository.** Confirmed by search.

**ConvaDuit:** No product-facing string `ConvaDuit`. Related spellings:

- X handle `CONVADUIT6k` / LinkedIn `conva-aduit` (`src/lib/seo/social.ts`)
- Git/local folder name `convaduit` is outside runtime SEO

**StorePulse AI / StorePulse:**

- Not used as the public product name
- `FINAL-PRODUCTION-AUDIT.md` title: “ConvAudit (StorePulse)”
- Internal keys: `storepulse:growth-roadmap:` in `src/components/app/audit-report.tsx`; `storepulse:quick-wins:` in `src/lib/report/quick-wins.ts`
- Tests explicitly forbid StorePulse in llms.txt and email HTML (`src/lib/seo/llms-txt.test.ts`, `src/lib/email/master-template.test.ts`, `src/lib/weekly-report/email-template.test.ts`)

### Issue: Official description unused (entity)

See Metadata Critical issue.

### Issue: sameAs / Twitter handle ConvaDuit-style

See sameAs Critical issue.

### Issue: StorePulse leftovers in internal IDs and an old audit title

| Field | Value |
| --- | --- |
| **File** | `src/components/app/audit-report.tsx` (~line 725), `src/lib/report/quick-wins.ts` (~line 119), `FINAL-PRODUCTION-AUDIT.md` line 1 |
| **Location** | String prefixes `storepulse:`; markdown title |
| **Current State** | Not shown as the product name in marketing metadata. Keys can appear in DOM/localStorage for signed-in reports. |
| **Problem** | Residual StorePulse identity in app and docs. |
| **Why it matters** | If those strings leak into HTML or shared reports, crawlers or users may treat StorePulse as a product alias. |
| **Recommended Fix** | Rename keys to `convaudit:`. Do not ship StorePulse in public or customer-visible HTML. |
| **Priority** | Medium (IDs) / Low (internal markdown title) |

---

## Keyword Audit

**`SITE_KEYWORDS`** (`src/lib/seo/site-copy.ts`): ecommerce SEO audit, ecommerce SEO audit tool, ecommerce website audit, online store audit, ecommerce conversion audit, Shopify SEO audit, WooCommerce SEO audit, AI visibility audit, ecommerce AI visibility, AI search optimization, GEO audit, ecommerce AI SEO, ecommerce competitor analysis, plus Arabic terms (تحليل متجر إلكتروني, تحسين صفحة المنتج, سلة, زد, …).

These align with the official positioning (SEO, conversion, AI visibility, ecommerce) and with schema `featureList`.

**Where keywords appear in titles:** English home title contains Ecommerce, SEO, GEO. Inner titles are mostly Arabic (أسعار تدقيق المتاجر, دليل تدقيق المتاجر وGEO, مدونة SEO وGEO للمتاجر).

**H1 vs keywords:** Home H1 does not contain SEO / GEO / ConvAudit; it is a conversion headline. Features H3 “كن ظاهراً في بحث الذكاء الاصطناعي” carries GEO. Blog titles carry GEO/SEO/conversion queries.

**Meta keywords tag:** Still emitted from root `keywords`. Search engines largely ignore this tag; it is not harmful by itself.

### Issue: Blog post 2 excerpt over-promises conversion (“فوراً”)

| Field | Value |
| --- | --- |
| **File** | `src/lib/locale/messages/ar.ts` |
| **Location** | `blog.post2.excerpt`: “تغييرات بسيطة على صفحات منتجاتك ترفع المبيعات فوراً.” Also used as meta description via `generateMetadata`. |
| **Current State** | Indexable meta description claims immediate sales lift. |
| **Problem** | Unsupported performance claim in metadata. |
| **Why it matters** | Thin/claimy descriptions hurt trust and can conflict with the site’s own “no invented statistics” rule (`site-copy.ts`, llms.txt). |
| **Recommended Fix** | Describe the article’s topic without guaranteed outcomes. |
| **Priority** | Medium |

---

## GEO / AI Visibility Audit

**Product meaning of GEO (source of truth in-app):** FAQ `faq.a2`, llms.txt, schema featureList, about “حدود التحليل”, `features.geo.desc`, `hero.preview.geoNote`: local page-signal estimates (FAQ, schema, citation-ready facts); **not** live ChatGPT / Gemini / Perplexity / Google AI queries; no integration with those products as search engines.

**GEO surfaces for crawlers:**

- `/llms.txt` — English product facts, public URL list, do-not-crawl private paths, social, contact (`src/lib/seo/llms-txt.ts`)
- Homepage FAQ JSON-LD (10 Q&A pairs including GEO limits)
- Blog `/blog/geo-ai-visibility-guide`
- Footer + entity links to `/#methodology` and the GEO guide
- `html lang="ar"` + Arabic schema `inLanguage`

**llms.txt English intro** (not the official description): “ConvAudit is a web platform for analyzing and optimizing ecommerce stores. Paste a public product URL to run an SEO audit, conversion audit, AI visibility / GEO audit (page-signal estimates, not live ChatGPT / Gemini / Perplexity queries), trust-signal review, and optional competitor analysis.”

### Issue: GEO article excerpt contradicts GEO methodology

| Field | Value |
| --- | --- |
| **File** | `src/lib/locale/messages/ar.ts` |
| **Location** | `blog.post1.excerpt` (also post meta description): “تعلم كيف تجعل ChatGPT وPerplexity وGoogle AI يوصون بمنتجاتك للمتسوقين.” Body `blog.post.geo.p_7` correctly says ConvAudit does not claim live chat-engine tests. |
| **Current State** | Indexable excerpt promises engine recommendations; later body and FAQ walk that back. |
| **Problem** | Conflicting GEO claims between snippet and methodology. |
| **Why it matters** | AI crawlers citing the meta description will repeat an overclaim the rest of the site disclaims. |
| **Recommended Fix** | Align excerpt/metadata with `faq.a2` / llms.txt (page-signal GEO, not live recommendations). |
| **Priority** | High |

### Issue: llms.txt is not in the sitemap

| Field | Value |
| --- | --- |
| **File** | `src/app/sitemap.ts` vs `src/app/llms.txt/route.ts` |
| **Location** | Sitemap static list; robots test still allows `/llms.txt` |
| **Current State** | Conventional `/llms.txt` exists and is crawlable. Not listed in sitemap.xml. |
| **Problem** | Minor discovery gap for agents that only read the sitemap. Most GEO clients request `/llms.txt` directly. |
| **Why it matters** | Low. Optional listing can help unknown crawlers. |
| **Recommended Fix** | Optionally add `https://www.convaudit.com/llms.txt` to the sitemap or mention it only in robots (already linked from llms.txt itself). |
| **Priority** | Low |

### Issue: No dedicated bot rules for AI crawlers

| Field | Value |
| --- | --- |
| **File** | `src/app/robots.ts` |
| **Location** | Single `userAgent: "*"` rule |
| **Current State** | AI crawlers are allowed on public paths and disallowed on private paths the same as Google. |
| **Problem** | None unless the business wants to block training bots. Current policy matches “Allow: /” for marketing. |
| **Why it matters** | Only if product policy later differs for GPTBot vs Googlebot. |
| **Recommended Fix** | Keep `*` unless there is an explicit block/allow policy per bot. |
| **Priority** | Low (no change required unless policy changes) |

---

## Indexability Audit

| Surface | Index | Follow | robots.txt | Sitemap | Notes |
| --- | --- | --- | --- | --- | --- |
| Public marketing + blog | true | true | allowed | yes (except llms.txt) | |
| `/llms.txt` | (no HTML meta; text file) | n/a | allowed | no | |
| Private app + `/auth` + `/checkout` | false | false | disallow | no | + X-Robots-Tag |
| `/api/*` | header noindex | nofollow | disallow `/api/` | no | |
| 404 | false | true | n/a | no | |
| Error boundaries | noindex,nofollow meta | | | | |

`dynamicParams = false` on blog slugs; unknown `/blog/{slug}` rewritten to HTTP 404 (`src/lib/seo/force-public-404.ts`, `src/middleware.ts`).

Google site verification is optional via `GOOGLE_SITE_VERIFICATION` (`src/lib/seo/google-site-verification.ts`); not hard-coded.

---

## Broken Links

**Checked in source:** footer hrefs, navbar hash hrefs, docs related links, trust-resources hrefs, home-entity links, not-found links (`/`, `/pricing`), contact `/#faq` and `/refund-policy`, security `/privacy` and `#infrastructure`.

**Result:** No marketing internal path in that set maps to a missing route or a missing element id on the page where it is used.

**Out of scope:** Live HTTP status of production, external sameAs URLs, mailto, and authenticated app deep links.

**Dead code (not a broken public link):** `HowItWorks` (`id="how"`) is never imported; live `#how` is `ConceptExplainer`.

**Hash-only `href: "#methodology"`** in `trust-resources.tsx` is valid only because that component is rendered on `/`. If reused off-home it would not resolve to the methodology section. Currently homepage-only. **Priority:** Low (fragility).

---

## Duplicate Issues

1. **Contact page dual document types** — ContactPage script and WebPage `@id`/`url` both equal `absoluteUrl("/contact")` (`src/app/contact/layout.tsx`). Duplicate document schema for one URL.
2. **Homepage title vs OG title** — two English titles for one URL (`SITE_DEFAULT_TITLE` vs `SITE_OG_TITLE`).
3. **H1 vs `<title>`** on pricing, docs, blog, privacy, security, roadmap, home (see Metadata).
4. **Article author + publisher Organization** — same `@id` twice inside one Article object (typical, not two scripts).
5. **SoftwareApplication also typed Product** — single node `@type: ["SoftwareApplication", "Product"]` (intentional dual type, not two Product nodes).
6. **Public metadata uniqueness** — tests require unique titles/descriptions/canonicals; no duplicate public canonicals found in source.
7. **No duplicate Organization nodes on the homepage graph** — tests assert a single Organization in `@graph`.

### Issue: ContactPage + WebPage for the same URL

| Field | Value |
| --- | --- |
| **File** | `src/app/contact/layout.tsx` |
| **Location** | Two `<JsonLd>` children |
| **Current State** | `buildContactPageJsonLd()` (`@type: ContactPage`, `url` = contact canonical, `mainEntity` = `#organization`) and `buildMarketingPageJsonLd()` (`@type: WebPage`, `@id`/`url` = same canonical). ContactPage does not embed the Organization node. |
| **Problem** | Two typed documents for one URL. ContactPage already specializes WebPage. |
| **Why it matters** | Rich-result parsers may drop or flag conflicting `@type` on the same URL. |
| **Recommended Fix** | Keep ContactPage and BreadcrumbList; drop the extra WebPage **or** merge ContactPage into the marketing `@graph` as the page type instead of WebPage. Include Organization on the page. |
| **Priority** | High |

---

## Canonical Inconsistencies

| Check | Evidence | Result |
| --- | --- | --- |
| Apex vs www in metadata | `getSiteUrl()` / tests rewrite apex APP_URL | Consistent www |
| Home trailing slash | `absoluteUrl("/")` returns origin without slash | Consistent in metadata/sitemap |
| OG url vs canonical | Both `absoluteUrl(path)` | Consistent on public pages |
| Root canonical | Intentionally unset | Private pages do not inherit `/` |
| Sitemap vs public routes | Tests list the same paths as `ROUTES` + `BLOG_POSTS` | Aligned |
| `/geo` vs GEO content | Private `/geo`; marketing uses `/#methodology` | Aligned |
| Official URL trailing slash | Provided official site is `https://www.convaudit.com/`; emitted canonical origin is `https://www.convaudit.com` | Cosmetic host vs path slash only; both are the www host |

No public page canonical pointing at a different path than its `path` argument was found.

---

## Critical Issues

1. **Official English description is not in the repository** — `src/lib/seo/site-copy.ts`, schema, llms.txt, About. Entity sentence never emitted.
2. **sameAs and Twitter identity use CONVADUIT / conva-aduit** — `src/lib/seo/social.ts`. Official brand is ConvAudit; ConvaDuit-style handles are wired as Organization sameAs.

---

## High Issues

1. **Homepage has no WebPage JSON-LD** — `buildHomeJsonLdGraph()` / `structured-data.test.ts`.
2. **Inner pages omit Organization (and WebSite) nodes** — `@id` references only.
3. **`/contact` emits ContactPage and WebPage for the same URL** — `src/app/contact/layout.tsx`.
4. **English titles + Arabic `lang` + Arabic description** — `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/locale/config.ts`.
5. **H1 / title mismatches** on `/`, `/pricing`, `/docs`, `/blog`, `/privacy`, `/security`, `/roadmap`.
6. **Homepage H1 does not include ConvAudit; brand H2 is `sr-only`**.
7. **GEO blog excerpt overclaims ChatGPT/Perplexity/Google AI recommendations** — `blog.post1.excerpt`.
8. **Blog visible dates / `publishedOn` are after 30 Aug 2026** — `src/lib/blog-posts.ts`, `ar.ts` date strings; JSON-LD omits `datePublished` because of `isCalendarDateOnOrBeforeToday`.

---

## Medium Issues

1. Private layouts inherit marketing description, keywords, and OG.
2. No `hreflang` while English query terms are used in home title and `keywords`.
3. StorePulse string prefixes in report/quick-win IDs.
4. Blog post 2 excerpt “ترفع المبيعات فوراً” in metadata.
5. Shared OG/Twitter image for every URL (including articles).
6. WebSite has no SearchAction (optional).
7. SoftwareApplication offers lack `availability` / `priceValidUntil` (optional for Product).
8. About/schema Arabic descriptions do not paraphrase the official English definition 1:1 (trust + “visibility platform” wording).

---

## Low Issues

1. `HowItWorks` unused duplicate `id="how"`.
2. Trust-resources hash-only `#methodology` is homepage-relative.
3. `/llms.txt` not in sitemap.
4. Meta `keywords` tag (low impact).
5. Footer H3s on every page.
6. `FINAL-PRODUCTION-AUDIT.md` title still says StorePulse.
7. Twitter and OG image body copy differ (both Arabic, both branded ConvAudit).
8. Docs in-page ids are `"0"`…`"4"` rather than semantic slugs (`/docs#2` works but is opaque).

---

## Recommended Fixes

Ordered by priority. This section is advisory only; **this audit did not apply them.**

1. **Entity lock:** Put the official English description (and a matching Arabic translation) in `SITE_DESCRIPTION` or a dedicated `SITE_OFFICIAL_DESCRIPTION`, homepage metadata, Organization/WebSite/SoftwareApplication `description`, About “المنتج والموقع الرسمي”, and llms.txt. Do not leave three different product blurbs.
2. **sameAs lock:** Replace `@CONVADUIT6k` and LinkedIn `conva-aduit` with ConvAudit-branded profile URLs; update Twitter `site`/`creator` and tests.
3. **Add homepage WebPage** to `buildHomeJsonLdGraph()` with the home canonical `@id`.
4. **One document type per URL:** On contact, emit ContactPage + BreadcrumbList + Organization, not a second WebPage.
5. **Embed Organization on every public graph** using the stable `#organization` `@id`.
6. **Language consistency:** Arabic `html lang` → Arabic title/H1/description, still including the brand ConvAudit; or ship a real English locale.
7. **Align H1 with `<title>`** on home, pricing, docs, blog, privacy, security, roadmap. Put ConvAudit in the visible home H1.
8. **Rewrite `blog.post1.excerpt`** (and any metadata that uses it) to page-signal GEO language consistent with `faq.a2`.
9. **Fix blog dates** to on-or-before today (or noindex until publish day).
10. **Private metadata:** Explicit titles/descriptions; do not inherit the homepage sales description.
11. **Rename `storepulse:` keys** to `convaudit:`.
12. **Optional:** sitemap lastmod from real timestamps; unique article OG images; llms.txt sitemap row; semantic docs anchors.

---

## Evidence index (files read)

`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/llms.txt/route.ts`, `src/app/manifest.ts`, `src/app/not-found.tsx`, `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`, `src/app/icon.tsx`, `src/app/about/*`, `src/app/blog/**`, `src/app/contact/layout.tsx`, `src/app/docs/*`, `src/app/pricing/*`, `src/app/privacy/layout.tsx`, `src/app/security/*`, `src/app/terms/layout.tsx`, `src/app/refund-policy/*`, `src/app/roadmap/*`, `src/app/auth/layout.tsx`, private `src/app/*/layout.tsx` using `privatePageMetadata`, `src/lib/seo/*`, `src/lib/site-url.ts`, `src/lib/www-canonical.ts`, `src/lib/apex-www-redirects.ts`, `src/lib/routes.ts`, `src/lib/blog-posts.ts`, `src/lib/marketing-hrefs.ts`, `src/middleware.ts`, `next.config.ts`, `vercel.json`, `src/components/layout/footer.tsx`, `navbar.tsx`, `src/components/sections/hero.tsx`, `home-entity.tsx`, `trust-resources.tsx`, `src/components/app/page-shell.tsx`, `src/lib/locale/config.ts`, `src/lib/locale/messages/ar.ts` (cited keys), `src/lib/seo/*.test.ts`.

---

*End of audit. No product source files were modified to produce this report.*
