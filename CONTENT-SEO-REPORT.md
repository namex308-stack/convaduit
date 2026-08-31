# Content SEO Report — ConvAudit

**Scope:** Content SEO and brand-entity copy only.  
**Official brand:** ConvAudit  
**Official URL:** https://www.convaudit.com/  
**Official description:** ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.  
**Date:** 30 August 2026

No UI redesign, layout, database, authentication, payment, API, audit-engine, Gemini, Firecrawl, or Supabase changes.

`/about` already existed (`src/app/about/`). It was optimized in place. No new public route was created.

---

## What ConvAudit is (as stated on `/about`)

ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.

Arabic body: a web platform for ecommerce audits. It reads a public product page and returns ranked scores and recommendations across SEO, conversion, AI visibility, and trust. Official site: https://www.convaudit.com.

## Who it is for

Retailers who run an online store and want a product-page **ecommerce website audit**: Shopify, WooCommerce, Salla, Zid, Magento, and custom stores. The audience is the ecommerce merchant, not an agency claiming unverified metrics.

## Problem it solves

A product page can be weak in search, unclear for purchase, or hard for AI assistants to quote. ConvAudit shows gaps on the submitted page. It does not claim customer counts or sales percentages.

## How it works

Paste a public product URL. The crawler reads visible content (title, description, price, images, FAQ, Schema when present). Conversion, SEO, GEO / AI visibility, and trust scores are then calculated with ranked recommendations. Admin-panel login is not required.

## Pillars (about H2s)

| Topic | About heading | What the copy states |
| --- | --- | --- |
| Ecommerce SEO audit | تدقيق SEO للمتاجر الإلكترونية | On-page product SEO (title, meta, Schema, images). Same public-page audit on Shopify and WooCommerce — not a platform app install. |
| Conversion analysis | تحليل التحويل | Value, price, and CTA clarity in HTML. Page-level ecommerce conversion optimization recommendations, not a conversion-rate guarantee. |
| AI visibility | AI visibility وGEO | Citation-readiness from crawled page signals. |
| GEO | same card | Local generative-engine optimization: Q&A, Schema, quotable facts. ChatGPT / Perplexity / Google AI scores are estimates from those signals, not live queries and not a search-engine integration. |
| Trust signals | إشارات الثقة | Policies, reviews if present, store/warranty clarity on the public page. |
| Competitor analysis | تحليل المنافسين | Optional by plan: compare your product page to public competitor pages you choose. Competitors are not notified; market rankings are not invented. |
| Supported platforms | المنصات المدعومة | Any crawlable public product page: Shopify, WooCommerce, Salla, Zid, Magento, custom. HTML only; no platform app required. |

---

## Content changes

### `/about`

- Replaced the six generic cards (مهمتنا، ماذا نقدّم، المنتج والموقع الرسمي، المنصات والجمهور، حدود التحليل، نهجنا) with eleven topic cards that answer the brand questions above.
- Subtitle no longer calls ConvAudit a “growth consultant.” It names the official product type: AI ecommerce audit platform covering SEO, conversion, AI visibility, and trust.
- First card includes the official English sentence (`dir="ltr"`) plus Arabic identity, official URL, and “ecommerce audit.”
- GEO limits stay explicit (page-signal estimates, not live ChatGPT / Gemini / Perplexity).
- No percentages, testimonials, awards, or invented customer counts.

Chrome is unchanged: `PageShell`, `PageHeader` (H1 `من نحن` + subtitle), `PageContent` (`max-w-3xl space-y-4`), `SurfaceCard` (`p-5`), `h2` + `p` with the same typography classes.

### Homepage entity copy (`sr-only`)

`HomeEntityCopy` remains visually hidden (`className="sr-only"`). The English paragraph now uses `SITE_OFFICIAL_DESCRIPTION` so it cannot drift from Organization JSON-LD / llms.txt. Visible homepage sections were not restyled.

---

## Keyword changes

Phrases appear once in the about body unless noted. They sit in parentheses or as a defined term next to Arabic explanation — not as a stacked list.

| Phrase | Placement |
| --- | --- |
| ecommerce audit | What is ConvAudit |
| ecommerce website audit | Who it is for |
| ecommerce SEO audit | SEO card (once) |
| Shopify SEO audit | SEO card, as a common use case (once) |
| WooCommerce SEO audit | SEO card (once) |
| ecommerce conversion optimization | Conversion card (once) |
| AI visibility | H2 + GEO body |
| ecommerce AI | GEO body (once) |
| GEO | Meta description, how-it-works, GEO card |
| trust signals | Trust card |
| competitor analysis | Competitor card |

Meta description names ConvAudit, SEO, conversion, AI/GEO, trust, Shopify, WooCommerce, Salla, Zid, and the official URL. It does not repeat the English keyword list.

Forbidden stuffing check: Vitest asserts `ecommerce SEO audit`, `Shopify SEO audit`, and `WooCommerce SEO audit` each occur once in about body copy.

---

## Brand entity improvements

| Gap (from SEO-GEO-AUDIT / SEO-SCHEMA-REPORT) | After this change |
| --- | --- |
| Official English description unused on About | First about paragraph is `SITE_OFFICIAL_DESCRIPTION`. |
| About subtitle: “مستشار نمو بالذكاء الاصطناعي” | Subtitle matches the official product type (audit + visibility platform). |
| Trust not in about metadata | Meta description includes إشارات ثقة. |
| About description did not say “audit platform” | Description: منصة تدقيق متاجر إلكترونية بالذكاء الاصطناعي. |
| Homepage entity English could drift | Imports `SITE_OFFICIAL_DESCRIPTION`. |

Organization / WebSite JSON-LD, `sameAs`, and schema graphs were **not** edited in this pass (already aligned in `SEO-SCHEMA-REPORT.md`).

---

## Before / after

### About `<title>` / H1

Unchanged: `من نحن` → document title `من نحن · ConvAudit`. H1 still matches.

### About meta description

**Before**

```
ConvAudit منصة تحليل متاجر إلكترونية: تدقيق صفحات المنتجات، تحليل GEO من إشارات الصفحة، ومولد محتوى. الموقع الرسمي للخدمة هو نطاق convaudit.com.
```

**After**

```
ConvAudit منصة تدقيق متاجر إلكترونية بالذكاء الاصطناعي: SEO، تحويل، ظهور AI (GEO)، وإشارات ثقة. لتجار Shopify وWooCommerce وسلة وزد. https://www.convaudit.com
```

### About subtitle

**Before:** `ConvAudit — مستشار نمو بالذكاء الاصطناعي لمتاجر التجارة الإلكترونية.`  
**After:** `ConvAudit — منصة تدقيق متاجر إلكترونية بالذكاء الاصطناعي لتحليل SEO والتحويل وظهور الذكاء الاصطناعي وإشارات الثقة.`

### About H2s

**Before:** مهمتنا · ماذا نقدّم · المنتج والموقع الرسمي · المنصات والجمهور · حدود التحليل · نهجنا  

**After:** ما هو ConvAudit؟ · لمن؟ · المشكلة التي نحلها · كيف يعمل · تدقيق SEO للمتاجر الإلكترونية · تحليل التحويل · AI visibility وGEO · إشارات الثقة · تحليل المنافسين · المنصات المدعومة · حدود التحليل

---

## Files changed

| File | Change |
| --- | --- |
| `src/app/about/copy.ts` | Shared about title, subtitle, unique meta description, section copy. |
| `src/app/about/page.tsx` | Renders `ABOUT_SECTIONS` with existing card chrome; supports `dir` on paragraphs. |
| `src/app/about/layout.tsx` | Metadata and JSON-LD name/description from `ABOUT_TITLE` / `ABOUT_DESCRIPTION`. |
| `src/app/about/copy.test.ts` | Official sentence, required topics, keyword caps, no StorePulse / fake %. |
| `src/lib/seo/public-metadata-uniqueness.test.ts` | About uniqueness uses shared about constants. |
| `src/components/sections/home-entity.tsx` | Official English sentence via `SITE_OFFICIAL_DESCRIPTION`. |
| `CONTENT-SEO-REPORT.md` | This report. |

Not modified: homepage hero H1, footer tagline, blog excerpts/dates, private-page metadata, `storepulse:` internal IDs, schema/`sameAs`, APIs, audit engine, Gemini, Firecrawl, Supabase.

---

## Tests

| Command | Result |
| --- | --- |
| `npm run typecheck` (`tsc --noEmit`) | Pass |
| `npm run lint` (`eslint .`) | Pass |
| `npm test` (`vitest run`) | **87 files, 495 passed** (includes `src/app/about/copy.test.ts`) |

## Build

| Command | Result |
| --- | --- |
| `npm run build` (`next build` + standalone copy) | Success. `/about` prerendered static. |

Browser check (local standalone `http://127.0.0.1:3001/about`): title `من نحن · ConvAudit`, H1 `من نحن`, all eleven H2s and the official English sentence present. Homepage hero and marketing layout unchanged; entity copy remains in the accessibility tree only (`sr-only`).

---

## Remaining issues

Out of this content-only scope (still true after execution):

- Visible homepage H1 / hero still uses “مستشار نمو…”; it does not name ConvAudit. Entity copy is hidden, so users do not see the official English sentence on `/`.
- Footer still says “مستشار نمو بالذكاء الاصطناعي للمتاجر الإلكترونية.”
- Document `lang="ar"` vs English homepage `<title>` (`ConvAudit | Ecommerce SEO Audit & GEO`).
- H1 ≠ `<title>` on pricing, docs, blog, privacy, security, roadmap, and home (unchanged).
- GEO blog excerpt still overclaims live ChatGPT / Perplexity recommendations (`SEO-GEO-AUDIT.md`).
- Some blog dates are after 30 August 2026.
- Private layouts can still inherit marketing description.
- Organization `sameAs` remains empty until a verified ConvAudit-branded profile exists.
- Organization description is English while `WebSite.inLanguage` is `ar`.
- English keyword phrases appear inside Arabic about paragraphs by design (required terms). That is not stuffing, but the page is mixed-script.

No unsubstantiated metrics or fake testimonials were added.
