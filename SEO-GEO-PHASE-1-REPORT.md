# SEO/GEO Phase 1 Report — Brand Entity + Homepage

**Project:** ConvAudit  
**Canonical URL:** https://www.convaudit.com/  
**Phase scope:** Public brand entity and homepage entity clarity only.  
**Date:** 2026-08-30

This report does **not** claim GEO success, AI citations, ranking improvement, or Google validation.

---

## 1. Executive Summary

Phase 1 established one canonical public entity (ConvAudit at https://www.convaudit.com/ with the official English description) and made that entity **visible on the homepage H1**.

The homepage H1 previously omitted the brand name and relied on a visually hidden (`sr-only`) entity block. That H1 now starts with “ConvAudit” in natural Arabic, keeping the original sales-loss marketing message. The footer (and the matching homepage badge) no longer positions ConvAudit as a generic “AI growth consultant.”

Organization and WebSite JSON-LD already used the official name, URL, and description. They were inspected, left structurally unchanged, and locked in with stricter tests. `sameAs` remains omitted. Internal `storepulse:` identifiers were not renamed.

---

## 2. Files inspected

Public SEO / entity:

- `src/lib/seo/site-copy.ts`
- `src/lib/seo/social.ts`
- `src/lib/seo/structured-data.ts`
- `src/lib/seo/page-metadata.ts`
- `src/lib/seo/llms-txt.ts`
- `src/lib/seo/contact.ts`
- `src/lib/seo/internal-links.ts`
- `src/lib/site-url.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/about/page.tsx`
- `src/app/about/copy.ts`
- `src/app/about/layout.tsx`
- `src/app/apple-icon.tsx`
- `src/app/icon.svg`

Homepage / chrome:

- `src/components/sections/hero.tsx`
- `src/components/sections/home-entity.tsx`
- `src/components/sections/features.tsx`
- `src/components/sections/trust-resources.tsx`
- `src/components/sections/concept-explainer.tsx`
- `src/components/layout/footer.tsx`
- `src/components/layout/social-links.tsx`
- `src/components/brand/logo.tsx`
- `src/lib/locale/messages/ar.ts`
- `src/lib/locale/config.ts`

SEO tests:

- `src/lib/seo/structured-data.test.ts`
- `src/lib/seo/llms-txt.test.ts`
- `src/lib/seo/social.test.ts`
- `src/lib/seo/page-metadata.test.ts`
- `src/lib/seo/public-metadata-uniqueness.test.ts`
- `src/lib/seo/internal-links.test.ts`
- `src/app/about/copy.test.ts`
- other `src/lib/seo/*.test.ts`

Brand-occurrence search also covered `src/components/app/audit-report.tsx`, `src/lib/report/quick-wins.ts`, and existing markdown audit reports.

---

## 3. Files modified

| File | Change |
| --- | --- |
| `src/lib/locale/messages/ar.ts` | Visible H1, hero badge, hero subheadline, footer tagline |
| `src/app/page.tsx` | Stopped rendering the hidden homepage entity block |
| `src/components/sections/home-entity.tsx` | Kept topical link inventory; removed `sr-only` component |
| `src/lib/seo/structured-data.test.ts` | Stronger Organization / WebSite entity assertions |
| `src/lib/seo/brand-entity.test.ts` | **New** Phase 1 entity tests |
| `SEO-GEO-PHASE-1-REPORT.md` | This report |

---

## 4. Exact problems discovered

1. **Visible homepage H1 did not contain “ConvAudit”.**  
   Rendered text was: “متجرك يخسر مبيعات كل يوم — اعرف السبب وأصلحه بالذكاء الاصطناعي.”

2. **Brand entity on the homepage was hidden.**  
   `HomeEntityCopy` used `className="sr-only"` (hidden H2 + keyword/entity copy). Phase 1 forbids using `sr-only` as the only brand signal and forbids hidden keyword text.

3. **Footer positioning was inaccurate.**  
   `footer.tagline` started with “مستشار نمو بالذكاء الاصطناعي للمتاجر الإلكترونية.” ConvAudit is an ecommerce audit / visibility platform, not a growth consultant.

4. **The same consultant phrase appeared on the homepage badge** (`hero.badge`), so the most visible marketing chrome repeated the wrong category.

5. **Hero subheadline did not name the product category.**  
   It listed conversion / SEO / GEO / trust but not “تدقيق متاجر إلكترونية” (ecommerce audit).

6. **Organization / WebSite JSON-LD were already factually aligned** with the official entity (name, URL, description, `@id`, `inLanguage: "ar"`, no `sameAs`). Tests did not yet lock production `url` / `inLanguage` / standalone builders as tightly as this phase requires.

7. **No public StorePulse / ConvaDuit / CONVADUIT product branding** remained in runtime SEO strings. Residuals are internal IDs, comments, or documentation (see §8).

---

## 5. Exact fixes applied

1. Put **ConvAudit** in the visible homepage H1 (`hero.headline1`) while keeping the original sales-loss + AI-fix message (`hero.headline3` unchanged).

2. Updated the hero subheadline so the visible hero states: ecommerce audit platform + conversion + SEO + GEO / AI visibility + trust signals.

3. Replaced the consultant positioning in `footer.tagline` and `hero.badge` with audit/visibility platform wording. Footer layout, classes, and link columns were not changed.

4. Removed the `sr-only` homepage entity section from `src/app/page.tsx`. Official description remains in metadata, Organization/WebSite JSON-LD, About, and `llms.txt`.

5. Left Organization / WebSite schema implementation unchanged (already correct). Strengthened tests instead of rewriting schema.

6. Added `src/lib/seo/brand-entity.test.ts` for visible H1, official description consistency, footer positioning, no invented `sameAs`, and no public StorePulse/ConvaDuit branding.

---

## 6. Before/after description of homepage H1

**Before (visible H1):**  
متجرك يخسر مبيعات كل يوم — اعرف السبب وأصلحه بالذكاء الاصطناعي.

**After (visible H1, level 1, not `sr-only`):**  
ConvAudit يكشف لماذا متجرك يخسر مبيعات كل يوم — اعرف السبب وأصلحه بالذكاء الاصطناعي.

The orange gradient still wraps `hero.headline3` only. No extra heading, no `sr-only` H1/H2.

Verified in production HTML (`http://127.0.0.1:3002/`) and in the browser accessibility tree as `heading` level 1.

---

## 7. Brand consistency findings

Canonical public entity (unchanged source of truth in `src/lib/seo/site-copy.ts`):

- **Brand:** ConvAudit  
- **URL:** https://www.convaudit.com/  
- **Description:** ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.

That exact English sentence is used as:

- `SITE_OFFICIAL_DESCRIPTION` / homepage `SITE_DESCRIPTION`
- Organization JSON-LD `description`
- WebSite JSON-LD `description`
- First About paragraph (`dir="ltr"`)
- `llms.txt` lead quote

Arabic public surfaces use equivalent factual wording (About subtitle/body, homepage H1 + subheadline, footer tagline) without stuffing the English sentence into every Arabic string.

`sameAs` is empty. Twitter `site` / `creator` omitted. Contact email remains the existing project address `alihashem@convaudit.com`.

---

## 8. Public vs internal StorePulse / ConvaDuit findings

| Occurrence | Classification | Action |
| --- | --- | --- |
| Public SEO strings, About, llms.txt, JSON-LD, hero, footer | Would be **#1** if present — **not found** | None |
| `storepulse:growth-roadmap:` in `src/components/app/audit-report.tsx` | **#2 Internal identifier** | Not renamed |
| `storepulse:quick-wins:` in `src/lib/report/quick-wins.ts` | **#2 Internal identifier** | Not renamed |
| Logo SVG gradient ids `sp-grad` / `sp-gold` | **#2 Internal identifier** (not visible brand text) | Not renamed |
| Comments in `src/lib/seo/social.ts` documenting removed CONVADUIT / conva-aduit URLs | **#2 Internal documentation** | Left as warning not to restore them |
| Tests that forbid StorePulse / CONVADUIT | **#3 Test/fixture** | Kept / extended |
| `FINAL-PRODUCTION-AUDIT.md`, `SEO-GEO-AUDIT.md`, other prior reports mentioning StorePulse / CONVADUIT | **#3 Documentation only** | Not edited in this phase |
| Git folder / npm name `convaduit` | **#2 Internal identifier** | Not renamed |
| Decorative chrome `convaudit.com/audit` in `concept-explainer.tsx` | **#4 Unknown / illustrative mock** of a private `/audit/...` path, not the official entity URL | Not changed (see Remaining issues) |

No category **#1** public StorePulse / ConvaDuit / CONVADUIT brand strings were found in runtime product copy. The only public copy fixes were the consultant positioning and the missing visible H1 brand.

---

## 9. Organization schema status

Inspected in `organizationNode()` / `buildOrganizationJsonLd()` / homepage `@graph`.

| Field | Status |
| --- | --- |
| `name` | ConvAudit |
| `url` | Canonical origin from `getSiteUrl()` (production: `https://www.convaudit.com`) |
| `description` | Official English description |
| `@id` | `{origin}/#organization` (production: `https://www.convaudit.com/#organization`) |
| `logo` | `ImageObject` at `{origin}/apple-icon` (existing `src/app/apple-icon.tsx`, 180×180) |
| `email` | Existing project email `alihashem@convaudit.com` |
| `sameAs` | Omitted (`ORGANIZATION_SAME_AS` is empty) |

No invented social URLs. Schema code was not rewritten in this phase.

---

## 10. WebSite schema status

Inspected in `webSiteNode()` / `buildWebSiteJsonLd()` / homepage `@graph`.

| Field | Status |
| --- | --- |
| `name` | ConvAudit |
| `url` | Canonical origin (`https://www.convaudit.com` in production) |
| `publisher` | `{ "@id": "{origin}/#organization" }` |
| `description` | Official English description |
| `inLanguage` | `ar` (matches public `html lang="ar"`) |

Unrelated schema (SoftwareApplication, FAQ, offers, breadcrumbs) was not changed in this phase.

---

## 11. Footer positioning status

**Before:**  
مستشار نمو بالذكاء الاصطناعي للمتاجر الإلكترونية. اكتشف لماذا يغادر العملاء — واحصل على إصلاحات مرتبة عبر التحويل وSEO وGEO والثقة.

**After:**  
منصة تدقيق وظهور للمتاجر الإلكترونية. اكتشف لماذا يغادر العملاء — واحصل على إصلاحات مرتبة عبر التحويل وSEO وGEO والثقة.

Footer markup, columns, spacing, and logo were not redesigned. The homepage badge used the same consultant phrase and was updated to the same platform wording so public chrome stays consistent.

---

## 12. Keyword / co-occurrence changes

Visible homepage now co-occurs, in existing hero + feature surfaces (no new keyword block):

| Concept | Visible location |
| --- | --- |
| ConvAudit | H1 |
| Ecommerce audit | Hero subheadline “منصة تدقيق متاجر إلكترونية”; badge/footer “منصة تدقيق وظهور” |
| SEO | Hero subheadline + `hero.pillar.seo` + features SEO card |
| Conversion | Hero subheadline + `hero.pillar.conversion` + features conversion card |
| AI visibility / GEO | Hero subheadline + `hero.pillar.geo` + features GEO card |
| Trust signals | Hero subheadline “إشارات الثقة” + `hero.pillar.trust` + features trust card |

The hidden `HomeEntityCopy` keyword/entity block was **removed** from the homepage HTML rather than kept as hidden text.

No keyword stuffing. No claim that ConvAudit is recommended by ChatGPT, Gemini, Perplexity, or Google AI.

---

## 13. Tests added/changed

**Added:** `src/lib/seo/brand-entity.test.ts`

- Official description consistency across metadata, About, Organization, WebSite, llms.txt
- Visible H1 contains ConvAudit; hero/home source has no `sr-only` H1 workaround
- Visible homepage copy covers audit + SEO + conversion + GEO + trust
- Footer is audit/visibility positioning, not “مستشار نمو”
- Organization `sameAs` omitted; no invented social hosts
- Public marketing messages do not contain StorePulse / ConvaDuit / CONVADUIT

**Updated:** `src/lib/seo/structured-data.test.ts`

- Organization `url` on the homepage graph
- WebSite `name`, `url`, `inLanguage`
- Production www graph: name, url, description, `sameAs` omitted, publisher `@id`
- New standalone `buildOrganizationJsonLd` / `buildWebSiteJsonLd` entity test

Existing About, llms.txt, social, and metadata uniqueness tests were left in place (not weakened).

---

## 14. typecheck result

**Pass.** `npm run typecheck` (`tsc --noEmit`) exited 0.

---

## 15. lint result

**Pass.** `npm run lint` (`eslint .`) exited 0.

---

## 16. test result

**Pass.** `npm test` (`vitest run`): **88 files, 513 tests passed.**

---

## 17. build result

**Pass.** `npm run build` compiled successfully (Next.js 16.3.1). Homepage `/` is static. `/apple-icon`, `/llms.txt`, `/sitemap.xml` generated. Middleware deprecation warning is pre-existing and out of scope.

---

## 18. Remaining issues

Out of Phase 1 scope; not claimed as fixed:

- Homepage document title / meta description are English; `html lang` is `ar`. That bilingual split remains.
- SoftwareApplication JSON-LD still uses a longer Arabic product description, not the official English sentence (unrelated schema; left unchanged).
- Navbar wordmark still shows the visual tagline “AI Intelligence” under ConvAudit.
- Auth marketing copy still uses generic “ذكاء التجارة الإلكترونية” positioning (public auth surface, not homepage entity).
- Authenticated report copy still contains “مستشار نمو” in `report.priorityListHint` (private UI).
- Weekly-report AI prompt still addresses the model as “مستشار نمو” (`src/lib/weekly-report/ai-summary.ts`) — backend prompt, not public entity.
- Decorative concept-explainer chrome still shows `convaudit.com/audit` (not the www canonical; `/audit/...` is an app route).
- No verified official social profiles; `sameAs` stays empty until a ConvAudit-branded profile exists.
- Internal `storepulse:` keys remain by design.
- Prior markdown audit reports still mention StorePulse / CONVADUIT historically.

---

## 19. Explicit confirmation

- **No backend changes**
- **No database changes**
- **No authentication changes**
- **No payment changes**
- **No audit-engine changes**
- **No visual redesign** (copy only inside existing H1, badge, subheadline, and footer tagline; layout, spacing, colors, typography, and components unchanged)

Phase 1 is Brand Entity + Homepage SEO only. It does not claim GEO success, AI citations, improved rankings, or Google validation.
