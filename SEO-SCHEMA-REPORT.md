# SEO Schema Report — ConvAudit

**Scope:** Brand entity and structured data only.  
**Official brand:** ConvAudit  
**Official URL:** https://www.convaudit.com/  
**Official description:** ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.  
**Date:** 30 August 2026

No backend, database, authentication, payment, or audit-engine logic was changed. No reviews, ratings, awards, or invented company facts were added. No new social URLs were created.

---

## Modified files

| File | Change |
| --- | --- |
| `src/lib/seo/site-copy.ts` | Added `SITE_OFFICIAL_DESCRIPTION` (official English brand sentence). Did not rewrite Arabic `SITE_DESCRIPTION`. |
| `src/lib/seo/social.ts` | Removed CONVADUIT / conva-aduit profile URLs. `SOCIAL_PROFILES` / `ORGANIZATION_SAME_AS` are empty until a ConvAudit-branded profile exists. |
| `src/lib/seo/social.test.ts` | Asserts empty sameAs and no CONVADUIT / StorePulse identity. |
| `src/lib/seo/structured-data.ts` | Organization + WebSite descriptions, `@id` form `…/#organization` and `…/#website`, WebSite `publisher` `@id`, homepage WebPage, inner graphs include Organization + WebSite once, ContactPage graph without a second WebPage. Logo remains `/apple-icon`. |
| `src/lib/seo/structured-data.test.ts` | Graph shape, official description, production `@id`s, ContactPage uniqueness. |
| `src/lib/seo/llms-txt.ts` | Opening citation uses the official description. Social section omitted when there are no profiles. |
| `src/lib/seo/llms-txt.test.ts` | Official description present; CONVADUIT / StorePulse absent. |
| `src/lib/seo/page-metadata.ts` | Twitter `site` / `creator` only if an official X handle exists. |
| `src/lib/seo/page-metadata.test.ts` | Expects no Twitter site/creator while sameAs is empty. |
| `src/app/layout.tsx` | Same Twitter site/creator omission. |
| `src/app/contact/layout.tsx` | Single JSON-LD script (`buildContactPageJsonLd` only). |
| `src/app/contact/page.tsx` | Hides “official accounts” when there are no profiles. |
| `src/components/layout/social-links.tsx` | Renders nothing when `SOCIAL_PROFILES` is empty. |

Not modified (intentionally): `src/components/app/audit-report.tsx` and `src/lib/report/quick-wins.ts` (`storepulse:` keys are internal app IDs, not public SEO identity). Homepage Arabic meta `SITE_DESCRIPTION`, H1s, blog dates, and private-route metadata were out of scope.

---

## Before / after schema

Production origin in the snippets below is `https://www.convaudit.com` (from `getSiteUrl()` when `NEXT_PUBLIC_APP_URL` is the official host or apex).

### Organization

**Before**

```json
{
  "@type": "Organization",
  "@id": "https://www.convaudit.com#organization",
  "name": "ConvAudit",
  "url": "https://www.convaudit.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.convaudit.com/apple-icon",
    "width": 180,
    "height": 180
  },
  "description": "ConvAudit منصة ويب لتحليل وتحسين متاجر التجارة الإلكترونية. …",
  "email": "alihashem@convaudit.com",
  "sameAs": [
    "https://x.com/CONVADUIT6k",
    "https://www.linkedin.com/in/conva-aduit-1044883a8"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "alihashem@convaudit.com",
    "contactType": "customer support",
    "url": "https://www.convaudit.com/contact",
    "availableLanguage": ["ar"]
  }
}
```

**After**

```json
{
  "@type": "Organization",
  "@id": "https://www.convaudit.com/#organization",
  "name": "ConvAudit",
  "url": "https://www.convaudit.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.convaudit.com/apple-icon",
    "width": 180,
    "height": 180
  },
  "description": "ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.",
  "email": "alihashem@convaudit.com",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "alihashem@convaudit.com",
    "contactType": "customer support",
    "url": "https://www.convaudit.com/contact",
    "availableLanguage": ["ar"]
  }
}
```

`sameAs` is omitted (not an empty array) because there is no verified ConvAudit-branded profile URL in the repo.

### WebSite

**Before**

```json
{
  "@type": "WebSite",
  "@id": "https://www.convaudit.com#website",
  "name": "ConvAudit",
  "url": "https://www.convaudit.com",
  "inLanguage": "ar",
  "description": "<Arabic SOFTWARE_DESCRIPTION>",
  "publisher": { "@id": "https://www.convaudit.com#organization" },
  "about": { "@id": "https://www.convaudit.com#software" }
}
```

**After**

```json
{
  "@type": "WebSite",
  "@id": "https://www.convaudit.com/#website",
  "name": "ConvAudit",
  "url": "https://www.convaudit.com",
  "inLanguage": "ar",
  "description": "ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.",
  "publisher": { "@id": "https://www.convaudit.com/#organization" },
  "about": { "@id": "https://www.convaudit.com/#software" }
}
```

### Homepage `@graph`

**Before (4 nodes):** Organization, WebSite, SoftwareApplication+Product, FAQPage. No WebPage.

**After (5 nodes):** Organization, WebSite, WebPage, SoftwareApplication+Product, FAQPage.

Homepage WebPage: `@id` / `url` = site origin, `isPartOf` → `#website`, `publisher` → `#organization`, `about` / `mainEntity` → `#software`, official description. One Organization node in the graph.

### Inner marketing pages

**Before:** WebPage + BreadcrumbList only (dangling `@id` refs).

**After:** Organization + WebSite + WebPage + BreadcrumbList. Same `@id`s as the homepage entities (not a second organization).

### Contact

**Before:** two scripts — ContactPage and WebPage for the same URL.

**After:** one `@graph` — Organization, WebSite, ContactPage, BreadcrumbList. No WebPage on `/contact`.

---

## Organization validation

| Check | Result |
| --- | --- |
| `@type` Organization | Pass |
| `@id` `https://www.convaudit.com/#organization` on official origin | Pass (`organizationSchemaId`) |
| `name` ConvAudit | Pass |
| `url` site origin (www in production) | Pass |
| `description` official English sentence | Pass |
| `logo` existing asset `/apple-icon` (180×180 ImageObject) | Pass — `src/app/apple-icon.tsx`, not a new URL |
| `email` `alihashem@convaudit.com` | Pass — already in `src/lib/seo/contact.ts` |
| `contactPoint` customer support + `/contact` | Pass |
| No `aggregateRating` / `review` / awards | Pass |
| One Organization node per graph | Pass (homepage, marketing, contact tests) |
| StorePulse / ConvaDuit not in Organization JSON | Pass |

---

## Website validation

| Check | Result |
| --- | --- |
| `@type` WebSite | Pass |
| `@id` `https://www.convaudit.com/#website` on official origin | Pass |
| `name` ConvAudit | Pass |
| `url` site origin | Pass |
| `publisher` `{ "@id": "https://www.convaudit.com/#organization" }` | Pass |
| `description` official English sentence | Pass |
| `inLanguage` `ar` | Unchanged (site UI is Arabic) |
| Linked from WebPage / ContactPage via `isPartOf` | Pass |

---

## sameAs changes

| Before | After |
| --- | --- |
| `https://x.com/CONVADUIT6k` | Removed |
| `https://www.linkedin.com/in/conva-aduit-1044883a8` | Removed |
| Twitter card `site` / `creator` `@CONVADUIT6k` | Omitted |
| Footer + contact social icons | Hidden until a real ConvAudit profile is listed |

Those handles encoded **CONVADUIT** / **conva-aduit**, not ConvAudit. Live fetches of those URLs did not confirm a ConvAudit-branded profile (X 403, LinkedIn 500). Per “add only real, existing social profiles” and “do not create any URLs”, sameAs is empty rather than inventing `x.com/ConvAudit` or a company LinkedIn page.

To restore sameAs later: add a verified ConvAudit URL to `SOCIAL_PROFILES` in `src/lib/seo/social.ts`. Footer, contact, Twitter cards, Organization `sameAs`, and llms.txt all read from that list.

---

## Brand changes

| Surface | Before | After |
| --- | --- | --- |
| Organization / WebSite `name` | ConvAudit | ConvAudit (unchanged) |
| Official description in schema | Arabic product paragraph | Official English sentence |
| llms.txt lead quote | Different English product blurb | Official English sentence |
| Public social identity | CONVADUIT / conva-aduit | None until a ConvAudit profile exists |
| StorePulse as public SEO name | Not in metadata/schema; tests already forbade it in llms/email | Still absent from schema, llms.txt, and social identity |

Internal `storepulse:` keys in the signed-in report UI were left in place (audit/app logic, not public SEO).

Homepage Arabic `SITE_DESCRIPTION` was not replaced, so SERP meta language is unchanged. The official English sentence is the Organization/WebSite/llms entity definition.

---

## Test results

```
npm run typecheck  →  tsc --noEmit  exit 0
npm run lint       →  eslint .      exit 0
npm test           →  vitest run    86 files, 493 passed
```

Relevant suites: `structured-data.test.ts` (10), `social.test.ts` (1), `llms-txt.test.ts` (2), `page-metadata.test.ts` (8).

---

## Build result

```
npm run build  →  Next.js 16.3.1  compiled successfully
TypeScript in build: passed
Static generation: 70/70
postbuild copy-standalone: Copied .next/static and public
```

First build attempt failed with `EBUSY` on `.next/standalone` because `node .next/standalone/server.js` still had the folder open. That process was stopped; the rebuild completed with exit 0. Dev server on port 3000 was not stopped.

---

## Remaining issues

Out of this task’s scope (still true from `SEO-GEO-AUDIT.md`):

1. Homepage document title / OG title are English while `html lang="ar"` and `SITE_DESCRIPTION` are Arabic.
2. Several public H1s still differ from `<title>` (pricing, docs, blog, privacy, security, roadmap, home).
3. Homepage visible H1 does not contain “ConvAudit”; entity H2 remains `sr-only`.
4. GEO blog excerpt still overclaims ChatGPT / Perplexity recommendations.
5. Blog `publishedOn` / visible dates are after 30 August 2026.
6. Private layouts still inherit marketing description and keywords.
7. `sameAs` is empty until a real ConvAudit-branded social URL is confirmed.
8. Organization/WebSite `description` is English while `WebSite.inLanguage` is `ar`.
9. Internal `storepulse:` string prefixes remain in report/quick-win IDs (not public schema).

No fake reviews, ratings, awards, or invented profile URLs were added to close those gaps.
