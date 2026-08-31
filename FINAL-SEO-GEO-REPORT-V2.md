# FINAL SEO / GEO REPORT V2 — ConvAudit

**Official brand:** ConvAudit  
**Official URL:** https://www.convaudit.com/  
**Official description:** ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.

**Rule used in this document:** when live HTML/HTTP contradicts the local working tree, **production wins**.

`SEO-GEO-PHASE-3-REPORT.md` was **not present** in the repository.

This report does **not** claim ranking improvement, Google indexing, backlinks, schema.org/Google Rich Results validity, or AI-engine citations.

---

# 1. Executive Summary

Live `https://www.convaudit.com/` is **indexable and reachable**: all 17 public HTML URLs returned HTTP 200, `robots.txt` allows marketing paths and disallows private/API prefixes, `sitemap.xml` lists only www public URLs, and **apex `https://convaudit.com/` returns 308 → `https://www.convaudit.com/`**. Private app prefixes send `X-Robots-Tag: noindex, nofollow`.

That is not the same as “SEO/GEO work is live.” **Production HTML is a stale deploy.** Local Phases 1–4 (visible ConvAudit H1, empty `sameAs`, Arabic-first homepage metadata, GEO honesty, blog layout JSON-LD isolation, private marketing-title isolation) are **SOURCE VERIFIED** and **not PRODUCTION VERIFIED**.

Production still:

- Publishes Organization `sameAs` for `x.com/CONVADUIT6k` and `linkedin.com/in/conva-aduit-1044883a8` (**wrong brand identifiers**).
- Uses a homepage H1 with **no “ConvAudit”**.
- Positions the footer as an AI **growth consultant**.
- Serves GEO/conversion blog meta + Article JSON-LD that claim live ChatGPT/Perplexity recommendations and immediate sales lift.
- Emits the **blog-index WebPage** (`url` `/blog`) on every article URL.

**Overall SEO/GEO score: 60 / 100** (production-weighted). The previous V1 score of 72 was source-only and did not crawl production. Completing local tasks does not raise this score until those changes are live.

**Safe source fix in this validation pass:** homepage JSON-LD `WebPage` `@id`/`url` now uses `canonicalPageUrl("/")` (trailing slash) to match HTML canonical. That fix is **SOURCE VERIFIED only**.

---

# 2. Production verification date/time

| Item | Value |
| --- | --- |
| HTTP audit start | **2026-08-30T16:55:36.239Z** |
| HTTP audit end | **2026-08-30T16:55:43.629Z** |
| Homepage re-fetch (H1/footer) | **2026-08-30 ~16:57Z** |
| Local clock (UTC+2) | 30 August 2026, ~18:55–19:04 |
| Method | Sequential `GET`/`HEAD`-equivalent `fetch`, `redirect: manual` for apex and private routes; one follow of apex |
| Load testing | **Not performed** (no k6) |

---

# 3. Methodology

1. Read prior reports (V1 final, Phases 1/2/4, audit/schema/content/internal/metadata, production audit). Phase 3 report missing.
2. Re-checked source contracts: `site-copy.ts`, `page-metadata.ts`, `structured-data.ts`, `robots.ts`, `sitemap.ts`, `private-app-paths.ts`, `www-canonical.ts`, `social.ts`, `blog` layouts, locale `htmlLang`.
3. Fetched production HTML/headers for every public URL in the brief, plus `/robots.txt`, `/sitemap.xml`, `/llms.txt`.
4. Fetched apex **without following redirects**.
5. Fetched private/API URLs unauthenticated (`redirect: manual`).
6. Parsed `<title>`, meta description, canonical, robots, `lang`, H1, and `application/ld+json`.
7. Performance: PageSpeed Insights API returned **429**; local Lighthouse **failed** (Chrome launcher `EPERM`). No CWV numbers invented.
8. No ChatGPT / Gemini / Perplexity / Google AI citation queries.
9. No Search Console or backlink dataset.
10. Classification: **SOURCE VERIFIED** / **PRODUCTION VERIFIED** / **EXTERNALLY VERIFIED** / **NOT VERIFIED**.

---

# 4. Public URL HTTP matrix

All URLs below are `https://www.convaudit.com{path}`. **PRODUCTION VERIFIED.**

| Path | HTTP | `lang` | robots meta | `X-Robots-Tag` | JSON-LD scripts |
| --- | --- | --- | --- | --- | --- |
| `/` | 200 | ar | index, follow | none | 1 |
| `/pricing` | 200 | ar | index, follow | none | 1 |
| `/docs` | 200 | ar | index, follow | none | 1 |
| `/blog` | 200 | ar | index, follow | none | 1 |
| `/about` | 200 | ar | index, follow | none | 1 |
| `/contact` | 200 | ar | index, follow | none | **2** |
| `/security` | 200 | ar | index, follow | none | 1 |
| `/privacy` | 200 | ar | index, follow | none | 1 |
| `/terms` | 200 | ar | index, follow | none | 1 |
| `/refund-policy` | 200 | ar | index, follow | none | 1 |
| `/roadmap` | 200 | ar | index, follow | none | 1 |
| `/blog/geo-ai-visibility-guide` | 200 | ar | index, follow | none | **2** |
| `/blog/conversion-rate-optimization` | 200 | ar | index, follow | none | **2** |
| `/blog/product-schema-markup` | 200 | ar | index, follow | none | **2** |
| `/blog/competitor-analysis-strategy` | 200 | ar | index, follow | none | **2** |
| `/blog/ai-product-descriptions` | 200 | ar | index, follow | none | **2** |
| `/blog/trust-signals-ecommerce` | 200 | ar | index, follow | none | **2** |

`googlebot` meta was **absent** on production HTML (Next condensed `robots` to `index, follow` only). Source currently emits an explicit `googleBot` object including `max-image-preview: large` — **SOURCE VERIFIED**, **not PRODUCTION VERIFIED**.

---

# 5. Canonical matrix

**PRODUCTION VERIFIED** (HTML `<link rel="canonical">` and `og:url`).

| Path | Canonical | Notes |
| --- | --- | --- |
| `/` | `https://www.convaudit.com` (**no trailing slash**) | Matches production sitemap `<loc>`. Source now uses `https://www.convaudit.com/` — **SOURCE ≠ PRODUCTION** |
| `/pricing` … `/roadmap` | `https://www.convaudit.com{path}` | www, HTTPS |
| Six blog posts | `https://www.convaudit.com/blog/{slug}` | www, HTTPS |
| Apex follow | After 308, canonical still www | Apex is not a second indexable document |

No production canonical used `convaudit.com` (apex) or `*.vercel.app`. **PRODUCTION VERIFIED.**

---

# 6. Metadata matrix

**PRODUCTION VERIFIED.** Local Phase 4 Arabic homepage title/description is **not** what production serves.

| Path | Title | Description (summary) |
| --- | --- | --- |
| `/` | ConvAudit — تحليل وتحسين متاجر التجارة الإلكترونية بالذكاء الاصطناعي | Arabic product blurb (not the official English sentence; not the Phase 4 Arabic SERP string) |
| `/pricing` | أسعار الباقات · ConvAudit | خطط تدفع ثمنها من أول تحليل — ابدأ مجاناً |
| `/docs` | التوثيق ودليل البدء · ConvAudit | ما هو ConvAudit، كيف يعمل… |
| `/blog` | مدونة التجارة الإلكترونية وGEO · ConvAudit | رؤى وأدلة لتنمية متجرك الإلكتروني |
| `/about` | من نحن · ConvAudit | Arabic; mentions convaudit.com; **not** the official English entity sentence |
| `/contact` | اتصل بنا · ConvAudit | Official email `alihashem@convaudit.com` |
| `/security` | أمان المنتج والبيانات · ConvAudit | Matches layout title; H1 does not |
| `/privacy` | سياسة الخصوصية · ConvAudit | Matches layout title; H1 does not |
| `/terms` | الشروط والأحكام · ConvAudit | Aligned with H1 |
| `/refund-policy` | سياسة الاسترداد · ConvAudit | Aligned with H1 |
| `/roadmap` | خارطة طريق المنتج · ConvAudit | Matches layout title; H1 does not |
| `/blog/geo-ai-visibility-guide` | الدليل الكامل لتحسين الظهور في محركات الذكاء الاصطناعي | **Overclaim:** ChatGPT وPerplexity وGoogle AI يوصون بمنتجاتك |
| `/blog/conversion-rate-optimization` | 10 إصلاحات سريعة لمعدل التحويل في المتاجر الإلكترونية | **Overclaim:** ترفع المبيعات فوراً |
| `/blog/product-schema-markup` | كيف تضيف Product Schema لصفحاتك وتظهر في Google | Factual JSON-LD how-to excerpt |
| `/blog/competitor-analysis-strategy` | استراتيجية تحليل المنافسين لمتاجر الخليج ومصر | Implies sales growth from competitor gaps |
| `/blog/ai-product-descriptions` | كتابة أوصاف المنتجات بالذكاء الاصطناعي: أفضل الممارسات | “أمثلة حقيقية” — not verified |
| `/blog/trust-signals-ecommerce` | إشارات الثقة التي تساعد متجرك على كسب ثقة المتسوقين | Policies/reviews before checkout |

OG title on `/` was **not** identical to the document title (`ذكاء اصطناعي لتحليل التجارة الإلكترونية` vs the longer document title). **PRODUCTION VERIFIED.**

---

# 7. Heading matrix

**PRODUCTION VERIFIED** (visible `<h1>` text).

| Path | H1 | vs title | Problem |
| --- | --- | --- | --- |
| `/` | متجرك يخسر مبيعات كل يوم — اعرف السبب وأصلحه بالذكاء الاصطناعي. | Different | **No “ConvAudit”** |
| `/pricing` | الأسعار | ≠ أسعار الباقات | Semantic gap |
| `/docs` | التوثيق | ≠ التوثيق ودليل البدء | Semantic gap |
| `/blog` | المدونة | ≠ مدونة التجارة الإلكترونية وGEO | Semantic gap |
| `/about` | من نحن | Match | — |
| `/contact` | اتصل بنا | Match | — |
| `/security` | الأمان | ≠ أمان المنتج والبيانات | Semantic gap |
| `/privacy` | الخصوصية | ≠ سياسة الخصوصية | Semantic gap |
| `/terms` | الشروط والأحكام | Match | — |
| `/refund-policy` | سياسة الاسترداد | Match | — |
| `/roadmap` | خارطة الطريق | ≠ خارطة طريق المنتج | Semantic gap |
| Six blog posts | Post title | Match (absolute titles) | — |

Homepage had **12** `<h2>` elements in the HTML sample. FAQ accordion questions were not counted as headings. **PRODUCTION VERIFIED** for H1/H2 sample; full H3 inventory **NOT VERIFIED** on production (not fully parsed).

Source Phase 1/4 H1 alignments are **SOURCE VERIFIED only**.

---

# 8. Robots / sitemap matrix

**PRODUCTION VERIFIED.**

### `/robots.txt` (200, `text/plain`)

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard /health /audit /history /reports /monitor /geo /settings /checkout /onboarding /auth /alerts /notifications /tasks
Host: https://www.convaudit.com
Sitemap: https://www.convaudit.com/sitemap.xml
```

Public marketing paths are **not** disallowed. **PRODUCTION VERIFIED.**

### `/sitemap.xml` (200, `application/xml`)

17 `<loc>` values, all `https://www.convaudit.com…`. Home loc has **no trailing slash**. No private prefixes, no `/api/`, no `/llms.txt`. **PRODUCTION VERIFIED.**

`/llms.txt` crawlability: `Allow: /` and HTTP 200. Omitted from sitemap **by design in source comments**. **PRODUCTION VERIFIED** (reachable); inclusion in sitemap **not required**.

---

# 9. Private route matrix

Unauthenticated. **PRODUCTION VERIFIED.**

| URL | Status | Location | `X-Robots-Tag` | Meta robots |
| --- | --- | --- | --- | --- |
| `/dashboard` | 307 | `/auth?next=%2Fdashboard` | noindex, nofollow | n/a (redirect HTML) |
| `/geo` | 307 | `/auth?next=%2Fgeo` | noindex, nofollow | n/a |
| `/history` | 307 | `/auth?next=%2Fhistory` | noindex, nofollow | n/a |
| `/reports` | 307 | `/auth?next=%2Freports` | noindex, nofollow | n/a |
| `/settings` | 307 | `/auth?next=%2Fsettings` | noindex, nofollow | n/a |
| `/checkout` | 307 | `/auth?next=%2Fcheckout` | noindex, nofollow | n/a |
| `/audit/new` | 307 | `/auth?next=%2Faudit%2Fnew` | noindex, nofollow | n/a |
| `/auth` | **200** | — | noindex, nofollow | noindex, nofollow |
| `/api/status` | 200 JSON | — | noindex, nofollow | n/a |
| `/api/audit` GET | **200** JSON (endpoint docs) | — | noindex, nofollow | n/a |

`/auth` **title on production** is the **marketing homepage title**, not a private-only label. Source `privatePageMetadata()` uses absolute `ConvAudit` — **SOURCE VERIFIED**, **not PRODUCTION VERIFIED**.

Authenticated dashboards were **not** opened. **NOT VERIFIED** for signed-in HTML.

---

# 10. JSON-LD matrix

**This is PRODUCTION HTML VERIFIED, not Google Rich Results / schema.org validation.**  
Column “External” = **EXTERNAL VALIDATION REQUIRED** for every type.

| Type | Where found (production) | Issues (production) |
| --- | --- | --- |
| Organization | Home graph | `sameAs` CONVADUIT + conva-aduit; `@id` `https://www.convaudit.com#organization` (no `/` before `#`); description is Arabic product copy, **not** the official English sentence |
| WebSite | Home graph | `inLanguage` ar; same Arabic description; `@id` `…com#website` |
| SoftwareApplication + Product | Home graph | Dual type; Arabic description; offers not fully dumped here |
| FAQPage | Home graph | **10** Q/A nodes. Visible accordion text **not** re-extracted this pass |
| WebPage | Inner marketing; **not** home | Home graph **has no WebPage**. Inner pages: WebPage + BreadcrumbList only (no Organization/WebSite on those graphs) |
| BreadcrumbList | Inner pages + articles (via inherited blog layout) | Two crumbs |
| ContactPage | `/contact` script 1 | Coexists with a **second** WebPage script for the same URL |
| Article | Each blog post | `description` = overclaiming excerpt on GEO/CRO/AI-copy/competitor posts. **No `datePublished`**. Publisher logo `/icon.svg`. Nested `mainEntityOfPage` WebPage `@id` = article URL |
| Blog | **Not found** | No `@type: Blog`. Defect is **inherited blog-index WebPage** on article URLs (`@id`/`url` = `https://www.convaudit.com/blog`) |

**Duplicate / wrong URL (CRITICAL on production):** every article HTML includes the **blog index** WebPage JSON-LD plus Article. That tells crawlers the article URL’s extra WebPage entity is the **index**, not the post. Source moved index JSON-LD to `blog/page.tsx` so posts do not inherit it — **SOURCE VERIFIED**, **not PRODUCTION VERIFIED**.

Home WebPage trailing-slash alignment is now in source (`canonicalPageUrl("/")`) — **SOURCE VERIFIED**. Production home has **no WebPage node at all**.

---

# 11. Brand Entity status

| Signal | Production | Source (undeployed) | Classification |
| --- | --- | --- | --- |
| Name “ConvAudit” | Present in titles, org `name` | `SITE_NAME` | PRODUCTION VERIFIED / SOURCE VERIFIED |
| Official English sentence | **Absent** from org/website JSON-LD and homepage meta | Present on schema, About ltr, llms.txt | SOURCE VERIFIED; **not PRODUCTION VERIFIED** |
| Visible H1 | **No ConvAudit** | Starts with ConvAudit | PRODUCTION WINS (gap) |
| Footer | “مستشار نمو بالذكاء الاصطناعي للمتاجر الإلكترونية…” | Audit/visibility platform + AI | PRODUCTION WINS (gap) |
| `sameAs` | CONVADUIT6k + conva-aduit LinkedIn | `[]` / omitted | **PRODUCTION CRITICAL** |
| `/llms.txt` | Older English blurb (not the official sentence) | Official English quote | PRODUCTION WINS |
| Social footer/contact | CONVADUIT strings in JSON-LD HTML | Empty `SOCIAL_PROFILES` | PRODUCTION WINS |

Knowledge Graph / Search appearance: **NOT VERIFIED**.

---

# 12. GEO status

| Claim | Production | Classification |
| --- | --- | --- |
| GEO is a product pillar | Homepage meta, FAQ, features | PRODUCTION VERIFIED (positioning) |
| GEO is live ChatGPT/Perplexity/Google AI recommendation | GEO **article meta + Article JSON-LD** say engines **يوصون بمنتجاتك** | PRODUCTION VERIFIED (overclaim) |
| GEO is page-signal analysis, not live queries | Production `/llms.txt` states ConvAudit does **not** query those engines | PRODUCTION VERIFIED (honest on llms; **contradicted** by blog meta) |
| Source GEO honesty (Phase 2) | Not on production HTML | SOURCE VERIFIED only |

GEO is **not proven**. Citation-readiness copy on production blog is **not** aligned with llms.txt.

---

# 13. AI citation status

**AI citation status: NOT VERIFIED.**

No live query was made to ChatGPT, Gemini, Perplexity, or Google AI Overviews. This report does **not** claim ConvAudit is recommended or cited by those systems.

---

# 14. Internal linking status

| Check | Result | Classification |
| --- | --- | --- |
| Sitemap covers 11 static marketing URLs + 6 posts | Yes | PRODUCTION VERIFIED |
| Footer exists on homepage | Yes; growth-consultant tagline | PRODUCTION VERIFIED |
| Source inventory (no orphans, no `/geo` marketing href) | Vitest `internal-links.test.ts` | SOURCE VERIFIED |
| Every production href HTTP 200 | Not crawled link-by-link | **NOT VERIFIED** |
| Guest CTAs to `/auth` | Present in product UX (source + typical marketing) | SOURCE VERIFIED; production CTA crawl **NOT fully VERIFIED** |

---

# 15. Performance measurements

| Attempt | Result |
| --- | --- |
| PageSpeed Insights API (mobile + desktop) | **HTTP 429** `RESOURCE_EXHAUSTED` / Queries per day quota |
| Local Lighthouse 13.4.1 + Chrome | **Failed**: `EPERM` deleting `lighthouse.*` temp dir; **no JSON report written** |
| k6 / concurrency | **Not run** (out of scope) |
| CrUX / Search Console CWV | **NOT VERIFIED** |
| `FINAL-PRODUCTION-AUDIT.md` (2026-08-25) | Notes JS/GA/Framer risk **without measured LCP/FCP/CLS** — not reused as numbers here |

**LCP, FCP, CLS, TBT, performance score, SEO Lighthouse score: NOT VERIFIED this pass.** No numbers fabricated.

---

# 16. Apex redirect result

| Request | Status | Location |
| --- | --- | --- |
| `GET https://convaudit.com/` (no follow) | **308** | `https://www.convaudit.com/` |
| `GET https://convaudit.com` (no follow) | **308** | `https://www.convaudit.com/` |

**PRODUCTION VERIFIED.** This is **not** a 200 duplicate-host failure. Source `middleware` / `vercel.json` / `next.config` 308 intent **matches live HTTP**.

---

# 17. Test results

Local (working tree, this validation):

| Command | Result |
| --- | --- |
| `npm test` | **Pass** — 91 files, **527** tests |
| Includes | uniqueness, private noindex, robots, sitemap, brand entity, GEO claims, heading alignment, language consistency, structured data (home WebPage slash) |

---

# 18. Build result

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass — compiled, 70 static pages, standalone copy |

Pre-existing notices: Cache-Control on `/_next/static/(.*)`; middleware → proxy deprecation; Edge runtime on OG/Twitter image routes.

---

# 19. Files changed across all phases

Local working tree still contains SEO work **not on production**. High-level groups:

| Phase | Representative files (source) |
| --- | --- |
| Schema / entity | `src/lib/seo/structured-data.ts`, `social.ts`, `llms-txt.ts`, `site-copy.ts` |
| Metadata | `page-metadata.ts`, `private-page-metadata.ts`, `src/app/layout.tsx`, public `layout.tsx` files |
| Content / about | `src/app/about/copy.ts`, `src/app/about/page.tsx` |
| Internal links | `src/lib/seo/internal-links.ts`, `src/app/docs/related-links.ts`, footer |
| Phase 1 | `hero` locale H1, `home-entity.tsx`, footer tagline |
| Phase 2 | `ar.ts` GEO/excerpts, `blog-posts.ts` `metaDescription`, article JSON-LD description |
| Phase 4 | Arabic `SITE_DEFAULT_TITLE` / `SITE_DESCRIPTION`, H1 keys, OG `alt` |
| This validation | `structured-data.ts` home `WebPage` URL → `canonicalPageUrl("/")`; matching tests |
| Reports | `SEO-GEO-*.md`, `CONTENT-SEO-REPORT.md`, `METADATA-SEO-REPORT.md`, `INTERNAL-LINKING-REPORT.md`, `SEO-SCHEMA-REPORT.md`, this V2 |

Unrelated dirty files in the same working tree (load-test, `gemini.ts`, `firecrawl.ts`, `api/audit`, etc.) are **not** claimed as SEO-phase deliverables.

**None of the above is PRODUCTION VERIFIED until a deploy.**

---

# 20. Remaining CRITICAL issues

1. **Production Organization `sameAs` uses CONVADUIT / conva-aduit URLs** while the product brand is ConvAudit. **PRODUCTION VERIFIED.** Source already omits `sameAs`. **Fix: deploy source; do not invent replacement profiles.**
2. **Production GEO article meta + Article JSON-LD claim ChatGPT / Perplexity / Google AI recommend products.** **PRODUCTION VERIFIED.** Contradicts production `/llms.txt`. Source Phase 2 rewrites are undeployed.
3. **Article URLs emit blog-index WebPage JSON-LD** (`url` = `/blog`). **PRODUCTION VERIFIED.** Misleading entity for the article URL.
4. **Production is a stale SEO deploy** relative to Phases 1–4. Most “fixed in source” items are **not live**. Treat as a ship-blocking SEO gap, not a completed program.

Apex 200 duplicate host is **not** open (308 verified).

---

# 21. Remaining HIGH issues

- Homepage H1 omits ConvAudit; footer is “مستشار نمو…”. **PRODUCTION VERIFIED.**
- H1 ≠ title on pricing, docs, blog index, security, privacy, roadmap. **PRODUCTION VERIFIED.**
- Conversion / competitor / AI-copy metas overclaim. **PRODUCTION VERIFIED.**
- Official English entity sentence missing from production org/website/llms lead. **PRODUCTION VERIFIED.**
- `/contact` emits ContactPage **and** WebPage. **PRODUCTION VERIFIED.**
- Homepage JSON-LD missing WebPage. **PRODUCTION VERIFIED.**
- `/auth` 200 uses marketing `<title>`. **PRODUCTION VERIFIED.**
- Home canonical/sitemap without trailing slash vs source slash policy. **PRODUCTION VERIFIED** (internally consistent on prod; diverges from current source).
- Blog `publishedOn` 2026-09-20…2026-10-15; no `datePublished` on production Articles. **SOURCE VERIFIED** dates; production Articles lack the field (**PRODUCTION VERIFIED**).
- Schema **EXTERNAL VALIDATION REQUIRED**.

---

# 22. Remaining MEDIUM issues

- `html lang="ar"` vs mixed English/Arabic SERP strings on production homepage. **PRODUCTION VERIFIED.**
- FAQ not in heading outline (accordion). **SOURCE VERIFIED** pattern; production accordion **NOT fully parsed**.
- `/llms.txt` not in sitemap (by design). **PRODUCTION VERIFIED.**
- `GET /api/audit` 200 JSON (disallowed + `X-Robots-Tag`). **PRODUCTION VERIFIED.** Do not treat as an HTML landing page; still a crawler-visible JSON 200.
- Internal `storepulse:` IDs. **SOURCE VERIFIED** (app, not public schema).
- Search Console ownership/indexing. **NOT VERIFIED.**
- `next/image` `hostname: **`. **SOURCE VERIFIED** (from prior reports; not re-audited here).
- Privacy/terms “temporary overview” copy. **NOT RE-FETCHED** in this pass beyond titles/H1s.

---

# 23. Remaining LOW issues

- Dense homepage H2/H3 outline. **PARTIAL PRODUCTION VERIFIED** (12 H2s sampled).
- Contact email as H2 (source). **SOURCE VERIFIED**; production H2 list **NOT fully parsed**.
- Build deprecation warnings. **SOURCE VERIFIED** (this build).
- `SITE_KEYWORDS` unused by Google. **SOURCE VERIFIED.**
- Lighthouse/PSI measurement failure this pass. **PRODUCTION measurement NOT VERIFIED.**

---

# 24. Final scores

Scores are **production-weighted**. Undeployed source work does **not** add points. Unvalidated schema is not “valid.” GEO is not scored as if AI engines cite the brand. Performance is **not scored numerically** because measurement failed.

| Dimension | Score | Why not higher |
| --- | --- | --- |
| Technical SEO | **70 / 100** | 200s, www canonicals, robots, sitemap, apex 308, private `X-Robots-Tag`. Deduct: stale deploy, missing googleBot meta, home slash policy drift, GET `/api/audit` 200, unvalidated schema. |
| On-page SEO | **58 / 100** | Unique titles exist. Deduct: H1/title gaps, no-brand H1, overclaiming metas, growth-consultant footer, mixed SERP language. |
| Structured Data | **50 / 100** | Types are emitted. Deduct: CONVADUIT `sameAs`, missing home WebPage, inherited `/blog` WebPage on articles, contact duplicate, overclaiming Article descriptions, no RRT. |
| Brand Entity | **45 / 100** | Name present. Deduct: live wrong-brand `sameAs`, H1/footer voice, official English sentence not on production org/llms lead. |
| GEO Readiness | **42 / 100** | llms.txt is cautious; blog meta/JSON-LD is not. No citation test. |
| Internal Linking | **74 / 100** | Sitemap + footer present; source tests pass. Deduct: production href-by-href **NOT VERIFIED**; auth CTAs. |
| Indexability | **78 / 100** | Public index/follow; private noindex + disallow; apex 308. Deduct: no GSC proof; auth marketing title; API JSON 200. |
| Performance | **NOT VERIFIED** | PSI 429; Lighthouse EPERM. Excluded from the mean. |

**Overall SEO/GEO: 60 / 100**  
Mean of the seven numeric dimensions = 59.6, rounded to **60**.

---

# 25. Final recommended actions

Ranked by production evidence, not local task completion:

1. **Deploy the current SEO working tree** to `www.convaudit.com`, then **re-fetch** production. Until then, Phases 1–4 are not live.
2. After deploy, confirm: `sameAs` omitted; H1 contains ConvAudit; GEO/CRO metas honest; article pages do **not** include `/blog` WebPage JSON-LD; `/auth` title is not the marketing headline.
3. **Do not add new `sameAs` URLs** until real ConvAudit-branded profiles exist.
4. Run **Google Rich Results Test** and a schema.org validator on `/` and one article. **EXTERNAL VALIDATION REQUIRED.**
5. Replace or justify **future blog dates**; emit `datePublished` only for real past dates.
6. Measure CWV (CrUX or a successful Lighthouse/PSI run) — then fix what the numbers show.
7. Do **not** claim ChatGPT/Gemini/Perplexity/Google AI citations until those queries are actually run and logged.

---

# 26. Explicit limitations

- Production HTML **wins** over source. This V2 score is **lower** than V1 because V1 did not crawl production.
- No Search Console, backlink, ranking, or CrUX dataset.
- No Google Rich Results / schema.org validator run → schema is **not** marked valid.
- No live AI citation test → **AI citation status: NOT VERIFIED.**
- Lighthouse and PageSpeed Insights **failed**; no LCP/FCP/CLS/TBT/performance/SEO Lighthouse scores.
- Private HTML behind login was not inspected.
- Not every in-body internal link was HTTP-checked on production.
- Phase 3 report does not exist.
- This pass did not redesign UI, touch backend/DB/auth/payments/Gemini/Firecrawl/Supabase/Redis, or run load tests.

**Safe code change in this validation:** homepage JSON-LD `WebPage` URL aligned to the trailing-slash HTML canonical in **source only**. It does not change production until deploy.
