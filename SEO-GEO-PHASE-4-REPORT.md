# SEO/GEO Phase 4 Report — Metadata, Headings, Language

**Project:** ConvAudit  
**Canonical URL:** https://www.convaudit.com/  
**Official description:** ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.  
**Report date:** 30 August 2026  
**Phase scope:** Public metadata, H1/title alignment, language consistency, and on-page semantic clarity. No visual redesign, backend, database, auth, payment, API, or audit-engine changes.

`SEO-GEO-PHASE-3-REPORT.md` was not present in the repository. This phase follows Phase 1 (brand entity / homepage H1) and Phase 2 (GEO claim honesty).

This report does **not** claim ranking improvement, GEO success, AI citations, or Search Console results.

---

## 1. Language decision

The product is **intentionally Arabic-first**. Evidence:

- `html lang="ar"` and `dir="rtl"` from the only enabled locale (`src/lib/locale/config.ts`).
- English is not a supported UI locale. URLs stay Latin (`/pricing`, `/blog/...`).
- Visible marketing chrome (hero, footer, docs, blog, pricing) is Arabic with Latin product terms (ConvAudit, SEO, GEO).

**Do not create an English page solely for SEO.** That would split the entity and contradict `lang="ar"`.

### Split that this phase applies

| Surface | Language |
| --- | --- |
| Visible UI | Arabic (unchanged) |
| Homepage / root `<title>` and meta description | **Arabic-first**, with Latin **ConvAudit / SEO / GEO** as real product terms |
| Open Graph / Twitter title and image `alt` | Same string as the document title |
| Organization / WebSite JSON-LD `description` | Official **English** entity sentence (`SITE_OFFICIAL_DESCRIPTION`) |
| `/about` first identity paragraph (`dir="ltr"`) | Same official English sentence |
| `/llms.txt` lead quote | Same official English sentence |
| `SITE_KEYWORDS` | Mixed English queries + Arabic product terms (metadata only; not a visible keyword block) |

English search targeting is **not deleted**. It remains on About (capped once-per-phrase body copy), `SITE_KEYWORDS`, docs/blog titles that keep SEO/GEO, and the official schema sentence. The homepage SERP snippet is no longer an English-only title + English official paragraph under an Arabic document language.

---

## 2. Metadata changes

| Surface | Before | After |
| --- | --- | --- |
| Homepage / root `<title>` | `ConvAudit \| Ecommerce SEO Audit & GEO` (37 chars) | `ConvAudit \| تدقيق SEO وGEO للمتاجر` (34 chars, ≤60) |
| Homepage OG / Twitter title | Same English string | Same as the new Arabic-first title |
| Homepage / root meta description | Official English sentence (`SITE_DESCRIPTION` === `SITE_OFFICIAL_DESCRIPTION`) | Arabic: `ConvAudit منصة تدقيق متاجر إلكترونية: نحلّل صفحات المنتجات عبر SEO والتحويل وظهور الذكاء الاصطناعي (GEO) وإشارات الثقة.` (119 chars). Unique vs `/about`. |
| OG / Twitter image `alt` | Hardcoded English title | `SITE_OG_TITLE` (matches document title) |
| `/pricing` title | Already `أسعار تدقيق المتاجر` | Unchanged in layout; locale H1 key now matches |
| `/docs` title | Already `دليل تدقيق المتاجر وGEO` | Unchanged in layout; locale H1 key now matches |
| `/blog` title | Already `مدونة SEO وGEO للمتاجر` | Unchanged in `blog/copy.ts`; locale H1 key now matches |
| Blog post titles / meta descriptions | Already unique Arabic; H1 uses `titleKey` | Unchanged meaning. Metadata still uses `blogPostMetaDescription()`, not a keyword list. |
| Private routes | `noindex,nofollow` + robots disallow | **Unchanged.** Not optimized for search. |

`SITE_OFFICIAL_DESCRIPTION` is unchanged. Organization / WebSite JSON-LD still use that English sentence.

---

## 3. H1 changes

Homepage H1 was already set in Phase 1 and **was not rewritten** here:

`ConvAudit يكشف لماذا متجرك يخسر مبيعات كل يوم — اعرف السبب وأصلحه بالذكاء الاصطناعي.`

That is the value proposition. The title is the category. They share **ConvAudit** and Arabic script. They are **not** forced to be identical.

First-screen visible copy (H1 + `hero.subheadline`) already states: ConvAudit + تدقيق متاجر إلكترونية + SEO + تحويل + GEO / ظهور الذكاء الاصطناعي + إشارات الثقة.

Inner pages where the H1 was a short label disconnected from the document title:

| Path | H1 before | H1 after (matches layout title) |
| --- | --- | --- |
| `/security` | الأمان | أمان المنتج والبيانات |
| `/privacy` | الخصوصية | سياسة الخصوصية |
| `/roadmap` | خارطة الطريق | خارطة طريق المنتج |
| `/docs` | التوثيق | دليل تدقيق المتاجر وGEO |
| `/blog` | المدونة | مدونة SEO وGEO للمتاجر |
| `/pricing` | الأسعار | أسعار تدقيق المتاجر |

`/about` (`من نحن`), `/contact` (`اتصل بنا`), `/terms`, `/refund-policy`, and all six blog posts already used the same string for H1 and metadata title.

Footer nav labels (`التوثيق`, `المدونة`, `الأسعار`) stay short. They are not page H1s.

---

## 4. Keyword placement

No keyword block was added. Phrases appear only where they describe the page.

| Phrase | Where it sits naturally |
| --- | --- |
| تدقيق متاجر إلكترونية / ecommerce audit (Arabic equivalent) | Homepage title, description, hero subheadline, footer |
| SEO | Homepage title/description, hero, footer, docs/blog titles |
| GEO / ظهور الذكاء الاصطناعي | Homepage title/description, hero, docs title |
| تحويل | Homepage description, hero, footer |
| إشارات الثقة / trust signals | Homepage description, hero; English “trust signals” remains on About |
| ecommerce SEO audit, Shopify SEO audit, WooCommerce SEO audit, ecommerce website audit, ecommerce conversion optimization, AI visibility, ecommerce AI, competitor analysis | About body, **once** each (existing cap). **Not** stuffed into the homepage meta description. |
| Shopify / WooCommerce | Docs meta description and About; not repeated on the homepage SERP snippet |

`SITE_DESCRIPTION` contains **zero** occurrences of `ecommerce SEO audit`.

---

## 5. Footer

No layout/redesign. Tagline now matches the official entity in Arabic:

**Before:** منصة تدقيق وظهور للمتاجر الإلكترونية. …  
**After:** منصة تدقيق وظهور للمتاجر الإلكترونية **بالذكاء الاصطناعي**. …

Copyright line: `© {year} ConvAudit — منصة تدقيق وظهور للمتاجر الإلكترونية`.

---

## 6. Blog

Titles, H1s, and `generateMetadata` still share `titleKey`. Article meaning was not rewritten for keyword matching. Each post keeps a dedicated `metaDescription` that reflects the actual article (GEO page-signals, conversion clarity without a sales guarantee, Product Schema, competitor gaps, AI draft copy, trust signals).

---

## 7. Private routes

Left as-is:

- `privatePageMetadata()` → `noindex,nofollow` including `googleBot`
- Empty `keywords`
- Non-marketing title/description
- `robots.txt` Disallow prefixes

Public marketing pages remain `index,follow`.

---

## 8. Files changed

| File | Change |
| --- | --- |
| `src/lib/seo/site-copy.ts` | Arabic-first `SITE_DEFAULT_TITLE` / `SITE_DESCRIPTION`; official English stays on `SITE_OFFICIAL_DESCRIPTION` |
| `src/lib/locale/messages/ar.ts` | Footer tagline/copyright; docs/blog/pricing H1 keys |
| `src/app/security/page.tsx` | H1 aligned with layout title |
| `src/app/privacy/page.tsx` | H1 aligned with layout title |
| `src/app/roadmap/page.tsx` | H1 aligned with layout title |
| `src/app/opengraph-image.tsx` | `alt = SITE_OG_TITLE` |
| `src/app/twitter-image.tsx` | `alt = SITE_OG_TITLE` |
| `src/lib/seo/brand-entity.test.ts` | Official English no longer required as homepage meta; footer includes AI wording |
| `src/lib/seo/page-metadata.test.ts` | Arabic title/description; OG/Twitter `alt` |
| `src/lib/seo/heading-alignment.test.ts` | **New** |
| `src/lib/seo/language-consistency.test.ts` | **New** |
| `SEO-GEO-PHASE-4-REPORT.md` | This report |

---

## 9. Tests

Added/updated without weakening uniqueness, robots, or brand-name contracts:

| Coverage | Where |
| --- | --- |
| Metadata uniqueness | Existing `public-metadata-uniqueness.test.ts` (homepage description now Arabic and still unique vs `/about`) |
| H1/title semantic alignment | `heading-alignment.test.ts` — homepage related, not identical; inner pages match layout titles; blog `titleKey` shared |
| Language consistency | `language-consistency.test.ts` — `htmlLang === "ar"`, Arabic homepage SERP, English official sentence on schema only |
| Official brand naming | Existing `brand-entity.test.ts` |
| No accidental noindex on public pages | Existing `private-page-metadata.test.ts` + language-consistency public robots assertion |
| Private route noindex | Existing private/robots tests + language-consistency private robots assertion |

---

## 10. Build results

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | Pass — 91 files, 527 tests |
| `npm run build` | Pass — compiled, TypeScript, 70 static pages generated, `postbuild` standalone copy succeeded |

Known build notices (pre-existing, not introduced here): custom Cache-Control on `/_next/static/(.*)`; middleware → proxy deprecation; Edge Runtime deprecation on OG/Twitter image routes.

---

## 11. Remaining SEO issues

These are **not** claimed as solved:

- **English exact-match homepage title removed.** Queries such as “ecommerce SEO audit” now depend on `SITE_KEYWORDS`, About copy, and Latin SEO/GEO tokens inside the Arabic title — not an English-only `<title>`.
- **No English locale or `/en` page** (by design).
- Organization `sameAs` is still empty; no verified social profiles.
- JSON-LD was not submitted to Google Rich Results Test or schema.org validator in this phase.
- No live ChatGPT / Gemini / Perplexity / Google AI citation test.
- Blog `publishedOn` dates remain 20 September–15 October 2026; `datePublished` is omitted while those dates are in the future.
- Homepage JSON-LD WebPage `@id` / `url` still omit the trailing slash that HTML canonical uses (`https://www.convaudit.com/` vs `https://www.convaudit.com`).
- Homepage FAQ remains accordion buttons, not `h2`/`h3`.
- Internal `storepulse:` identifiers remain in authenticated app code.
- `SEO-GEO-PHASE-3-REPORT.md` is still missing.
- Rankings, impressions, and GEO citations were not measured.
