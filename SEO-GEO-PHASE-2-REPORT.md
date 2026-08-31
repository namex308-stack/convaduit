# SEO/GEO Phase 2 Report — GEO Claim Honesty

**Project:** ConvAudit  
**Canonical URL:** https://www.convaudit.com/  
**Official description:** ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.  
**Report date:** 30 August 2026  
**Phase scope:** Public GEO/content honesty, Article JSON-LD descriptions, and future-date display semantics.

**No live ChatGPT, Gemini, Perplexity, Google AI citation test was performed.**

This phase does not claim GEO success, AI citations, ranking improvement, or measured sales/conversion lift.

---

## 1. Executive Summary

Public GEO copy previously implied that ChatGPT, Perplexity, and Google AI **recommend products**, and that page tweaks **raise sales immediately**. Those claims conflicted with About, FAQ, llms.txt, and schema, which already describe GEO as **local page-signal analysis**.

This phase rewrote the GEO article and overclaiming excerpts, pointed Article JSON-LD `description` at the factual meta string, and labeled blog dates that fall after 30 August 2026 as **scheduled** without inventing replacement dates. `datePublished` remains omitted for those future stamps.

---

## 2. GEO claim audit (before edits)

| Location | Current claim | Risk | Correct factual interpretation |
| --- | --- | --- | --- |
| `blog.post1.excerpt` | ChatGPT, Perplexity, and Google AI will recommend your products | **High** — live AI-engine recommendation | GEO in ConvAudit estimates citation-readiness from crawled page signals. It does not query those engines. |
| `blog.post.geo.p_1` | GEO = optimize pages to **appear in answers** of ChatGPT, Perplexity, Google AI Overviews | **High** — guaranteed / implied appearance in named engines | GEO is improving page-level signals so systems **may** understand, retrieve, cite, or represent the page. Appearance is not guaranteed. |
| `blog.post.geo.p_2` | If the product is not readable/recommendable by AI assistants, you lose an important audience | **Medium** — implied recommendation + traffic loss | Unclear structure can make citation harder. That is not evidence of current citations or lost AI traffic. |
| `blog.post.geo.h2_3` | “5 steps to improve product appearance in AI” | **Low–medium** — “appearance in AI” as an outcome | Steps improve **page signals**, not proven live visibility. |
| `blog.post.geo.p_8` | GEO is the future of product search; start today to stay ahead of competitors | **Medium** — unfalsifiable future + competitive guarantee | GEO here is citation-readiness of page signals, not proof that an engine cites the store. |
| `blog.post2.excerpt` | Simple changes **raise sales immediately** (“فوراً”) | **High** — guaranteed immediate sales | Page-clarity recommendations; no measured sales lift. |
| `blog.post2.body.p_1` | Quick fixes **raise conversion rate** | **High** — guaranteed conversion | Same: recommendations, not a measured CRO result. |
| `blog.post4.excerpt` | Exploit competitor weaknesses to **grow your sales** | **Medium** — guaranteed sales from competitor gaps | Public-page gap comparison; no market ranking or sales guarantee. |
| `blog.post5.excerpt` | Use Gemini to write copy that **sells**, with **real examples** | **High** — unverified case studies + sales claim | Generator can draft from product facts when configured; examples are not verified customer results. |
| `blog.post5.body.h2_2` | “How to get results that actually sell” | **Medium** — implied sales | Draft-quality guidance, not proven revenue. |
| `blog.post6.body.p_3` | Stores that show trust signals **usually** see less hesitation and **higher completion** | **Medium** — unverified conversion effect | Trust-signal review of public HTML; completion impact not measured here. |
| `whyLose.card1.desc` (homepage) | ChatGPT or Google AI **may not see you** due to missing signals | **Medium** — named engines currently seeing/not seeing the store | Missing signals may make the page harder to understand or cite. Not a live visibility test. |
| `features.subtitle` (homepage) | ConvAudit **wins you** AI-search visibility | **Medium** — guaranteed GEO outcome | Product **scores citation-readiness**; it does not award AI-search presence. |
| `pain.card1.title` (unused section copy) | “**Studies show** a growing share of shoppers start discovery in AI assistants” | **High** — invented evidence | No study is cited. Copy must not invent research. |
| `pain.card1.desc` | AI engines fail to **read and recommend** product pages | **Medium** — recommendation claim | Readability/citation difficulty, not live recommendation. |
| `scores.geo.title` (locale; unused in components) | “Can AI **recommend** your product?” | **Low–medium** | Better framed as citation-readiness of page signals. |
| `blog.subtitle` | Guides to **grow** your store | **Low** | Editorial guides for page audits, not growth guarantees. |
| `blog/copy.ts` index description | “**improving** visibility in AI search” | **Low** | Guides about **signals** of AI-search visibility, not a measured improvement. |
| `hero.preview.geoNote`, `faq.a2`, `methodology.geo.desc`, About GEO card, `llms.txt`, SoftwareApplication schema | Scores are **estimates from page signals**, not live ChatGPT/Perplexity queries | **None** — already factual | Keep. |
| `report.*` / `compare.gap2Desc` / dashboard GEO labels | Named engines and “recommendation” language | **N/A this phase** | Authenticated app UI. Not modified (no public entity leak of live-test claims into marketing HTML). |

Private/authenticated strings were classified and **left unchanged**.

---

## 3. Before/after wording categories

### GEO article (definition)

**Before:** GEO is optimizing pages to appear in ChatGPT / Perplexity / Google AI Overview **answers**.  
**After:** GEO is improving page signals (FAQ, Schema, clear facts) so search/AI systems **may** understand, retrieve, cite, or represent the page. ConvAudit analyzes those signals locally after crawl. It does **not** mean those engines recommend the product, and it is **not** a live recommendation query.

### GEO article (stakes)

**Before:** If AI assistants cannot read/recommend you, you lose a modern search audience.  
**After:** An unclear page may be harder to understand or cite. Improving signals does **not** guarantee appearance in AI answers or sales.

### GEO article (closing)

**Before:** GEO is the future of product search; start today to stay ahead.  
**After:** GEO here is citation-readiness from page signals, not evidence that an engine cites the store today.

### Excerpts

| Slug | Before | After |
| --- | --- | --- |
| geo-ai-visibility-guide | Make ChatGPT/Perplexity/Google AI recommend products | Improve FAQ/Schema/fact signals for understanding and citation — no live-recommendation claim |
| conversion-rate-optimization | Changes raise sales immediately | Clarity of offer/price/CTA; recommendations **without** a sales-rate guarantee |
| competitor-analysis-strategy | Exploit gaps to grow sales | Compare public competitor pages; **no** sales-growth guarantee |
| ai-product-descriptions | Gemini copy that sells, with real examples | Draft descriptions from product facts, then human review |

### Homepage GEO voice

**Before:** “ChatGPT or Google AI may not see you”; “wins you AI-search visibility.”  
**After:** Missing signals may make the page harder to understand or cite; the product **evaluates readiness**, it does not grant visibility.

---

## 4. Files changed

| File | Change |
| --- | --- |
| `src/lib/locale/messages/ar.ts` | GEO article, excerpts, conversion/trust body, homepage GEO lines, blog subtitle, scheduled-date label |
| `src/lib/blog-posts.ts` | Factual `metaDescription` on all six posts; `isBlogPostDateInTheFuture` / `visibleBlogDateLabel` |
| `src/app/blog/[slug]/layout.tsx` | Article JSON-LD `description` = `blogPostMetaDescription(...)` |
| `src/app/blog/[slug]/page.tsx` | Visible date uses scheduled prefix when `publishedOn` is after today |
| `src/app/blog/blog-index.tsx` | Same date semantics |
| `src/app/blog/copy.ts` | Index meta description: signals, not “improving visibility” as an outcome |
| `src/lib/seo/structured-data.test.ts` | Article tests use canonical meta description |
| `src/lib/seo/dates.test.ts` | Future stamps kept; no invented dates; scheduled label |
| `src/lib/seo/geo-claims.test.ts` | **New** honesty / JSON-LD / GEO wording tests |
| `SEO-GEO-PHASE-2-REPORT.md` | This report |

`src/lib/seo/structured-data.ts` **was not rewritten**. Future `datePublished` omission already existed. This phase changed the **description argument** passed into `buildBlogArticleJsonLd`.

---

## 5. Schema changes

- Article JSON-LD `description` now uses the same factual string as `generateMetadata` (`blogPostMetaDescription`).
- It no longer copies an overclaiming visible excerpt when a meta description exists.
- All six posts now have an explicit `metaDescription`.
- **No** Blog index schema was added to post pages.
- `datePublished` still omitted when `publishedOn` is after today (unchanged builder rule).
- `dateModified` still omitted (no reliable modified timestamp).
- Organization / WebSite / FAQ / SoftwareApplication GEO disclaimers were already factual and were left in place.

---

## 6. Date handling

**Report date:** 30 August 2026.  
**Stored stamps (unchanged, not invented):** 20 September 2026 → 15 October 2026 (`publishedOn` + matching Arabic `blog.postN.date`).

**Intent treated as scheduled editorial dates**, not proven past publication.

| Surface | Behavior |
| --- | --- |
| Internal `publishedOn` | Kept (2026-09-20 … 2026-10-15) |
| Article `datePublished` | Not emitted (already gated by `isCalendarDateOnOrBeforeToday`) |
| Visible UI | Same calendar string, prefixed with `مجدول —` while the stamp is in the future |
| After the stamp | Helper shows the stored date with no scheduled prefix — still no invented date |

Content was not deleted.

---

## 7. GEO honesty consistency

| Surface | Status after this phase |
| --- | --- |
| Homepage hero / FAQ / methodology | Already: page-signal estimates, not live queries. whyLose + features subtitle aligned. |
| About GEO card | Already: estimates, not live ChatGPT/Perplexity/Google AI queries. Unchanged. |
| Blog GEO article + excerpts | Aligned with page-signal positioning. |
| `llms.txt` | Already: local deterministic GEO; does not query ChatGPT/Perplexity/Google AI. Unchanged. |
| JSON-LD SoftwareApplication | Already: GEO is not a live query. Unchanged. |
| Article JSON-LD | Description now matches factual meta. |
| Metadata | GEO/conversion/competitor/AI-copy metas are factual; uniqueness tests still pass. |
| Official English description | Unchanged and still used on About, homepage meta, Organization/WebSite, llms.txt. |

**Consistent concept:** ConvAudit analyzes page-level SEO/GEO/visibility signals. That is **not** evidence that ConvAudit is cited or recommended by external AI engines.

---

## 8. Tests

**Added:** `src/lib/seo/geo-claims.test.ts`

- Forbidden public strings (live recommendations, immediate sales, “real examples”, invented “studies”, “wins you AI visibility”, etc.)
- GEO article states page-signal analysis and no live recommendation query
- Official description still on About + llms.txt
- Article JSON-LD uses `blogPostMetaDescription`; layout source must call it; no Blog type injected; `datePublished` omitted as of 30 August 2026

**Updated:** `structured-data.test.ts` (Article description = canonical meta, still no invented `dateModified`); `dates.test.ts` (scheduled stamps preserved, visible scheduled label, no replacement dates).

Existing About / FAQ / llms / uniqueness tests were **not** weakened.

---

## 9. Validation

| Command | Result |
| --- | --- |
| `npm run typecheck` | **Pass** (exit 0) |
| `npm run lint` | **Pass** (exit 0) |
| `npm test` | **Pass:** 89 files, **519** tests |
| `npm run build` | **Pass** after releasing a leftover `.next/standalone/server.js` lock (EBUSY). Next.js 16.3.1; blog slugs SSG. |

First build attempt failed with `EBUSY` on `.next/standalone` because a leftover `node .next/standalone/server.js` process from Phase 1 verification was still running. That process was stopped; rebuild succeeded. No product-code change was required for the lock.

---

## 10. Unresolved issues

- No live ChatGPT, Gemini, Perplexity, or Google AI citation test was performed.
- Authenticated report UI still uses named engines and “recommendation” wording (`report.geoTitle`, `compare.gap2Desc`, etc.). Out of this public-content phase.
- Blog `publishedOn` values remain in the future; they will start emitting `datePublished` automatically on those calendar days unless editorial dates are later set to real past dates.
- `blog.post3.title` still says “وتظهر في Google” (schema rich-result possibility, not an AI-engine recommendation). Not rewritten in this pass.
- `blog.post6.excerpt` still says trust signals that “make shoppers trust you” — softer than a sales guarantee; not in the required excerpt list.
- GEO article `p_3`/`p_4` still speak in general about how language models use clear Q&A (educational, not a ConvAudit live-test claim).
- Homepage H1/title language split, empty `sameAs`, unvalidated schema, and possible live apex 200 remain from prior reports.
- This phase does not claim improved GEO rankings or AI visibility.

---

## 11. Explicit confirmation

- No backend changes  
- No database changes  
- No authentication changes  
- No payment changes  
- No Gemini / Firecrawl / Supabase / Redis / API / audit-engine changes  
- No visual redesign (copy and date-label prefix only)

**No live ChatGPT, Gemini, Perplexity, Google AI citation test was performed.**
