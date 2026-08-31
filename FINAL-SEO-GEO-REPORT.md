# Final SEO / GEO Report — ConvAudit

**Official brand:** ConvAudit  
**Official URL:** https://www.convaudit.com/  
**Official description:** ConvAudit is an AI-powered ecommerce audit and visibility platform that analyzes SEO, conversion, AI visibility, and trust signals for online stores.  
**Report date:** 30 August 2026  
**Method:** Prior reports (`SEO-GEO-AUDIT.md`, `SEO-SCHEMA-REPORT.md`, `CONTENT-SEO-REPORT.md`, `INTERNAL-LINKING-REPORT.md`, `METADATA-SEO-REPORT.md`) plus a source re-check of `src/` and this session’s TypeScript, ESLint, Vitest, and production build. Performance notes that those five reports do not measure are taken only from `FINAL-PRODUCTION-AUDIT.md` and labeled as such.

**This pass did not:** modify product code; run Google Rich Results Test or schema.org validator; query ChatGPT, Gemini, or Perplexity; crawl production HTML; inspect Search Console; or verify backlinks.

---

# 1. Executive Summary

ConvAudit’s **technical indexability layer is in place in source**: www canonicals, unique public titles and descriptions, `index,follow` on marketing HTML, `noindex,nofollow` plus `robots.txt` Disallow plus `X-Robots-Tag` on private prefixes, and a sitemap of 17 public HTML URLs. Brand identity on Organization / WebSite JSON-LD, `/llms.txt`, and `/about` uses the official English sentence. English keyword phrases required for this program sit once each in about body copy (Vitest-capped for the SEO-audit family).

The site is **not GEO-proven**. There is no test in this program that ConvAudit is cited by ChatGPT, Gemini, or Perplexity. Organization `sameAs` is empty. The visible homepage H1 still does not name ConvAudit. Two blog **excerpts** still overclaim live AI-engine recommendations and immediate sales lift, and Article JSON-LD for those posts still uses the excerpt, not the corrected meta description. Blog `publishedOn` dates are 20 September–15 October 2026 (after this report date), so Article `datePublished` is omitted. Schema is **emitted and Vitest-checked, not third-party validated**.

**Overall SEO/GEO score: 72 / 100.** Completing the five prior workstreams improved architecture and about-page entity copy. Scores are not raised for task completion. Remaining gaps are content honesty, visible brand on `/`, empty social entity, unvalidated schema, mixed `lang="ar"` vs English homepage SERP copy, and no live AI-citation evidence.

---

# 2. Brand Entity

| Field | Evidence |
| --- | --- |
| **Brand name** | `SITE_NAME` = `ConvAudit` (`src/lib/seo/site-copy.ts`). Root metadata `authors` / `creator` / `publisher` / `applicationName` = ConvAudit. Organization / WebSite / SoftwareApplication `name` = ConvAudit. |
| **Official URL** | `PRODUCTION_CANONICAL_ORIGIN` = `https://www.convaudit.com`. HTML home canonical = `https://www.convaudit.com/` via `canonicalPageUrl("/")`. |
| **Official description** | `SITE_OFFICIAL_DESCRIPTION` (exact sentence above). Also `SITE_DESCRIPTION` (homepage / root meta). First `/about` paragraph (`dir="ltr"`). Homepage `HomeEntityCopy` (visually `sr-only`). Organization and WebSite JSON-LD `description`. `/llms.txt` lead quote. |
| **Brand consistency** | **Partial.** Public SEO strings use ConvAudit, not StorePulse / ConvaDuit / CONVADUIT (tests in `social.test.ts`, `llms-txt.test.ts`, `about/copy.test.ts`, `structured-data.test.ts`). **Visible** homepage H1 is still “متجرك يخسر مبيعات كل يوم — اعرف السبب وأصلحه بالذكاء الاصطناعي.” with no “ConvAudit”. Footer tagline is still “مستشار نمو بالذكاء الاصطناعي للمتاجر الإلكترونية.” Internal signed-in IDs `storepulse:growth-roadmap:` and `storepulse:quick-wins:` remain in app code (not public schema). |
| **Social entity signals** | `SOCIAL_PROFILES` = `[]`. Contact “الحسابات الرسمية” block is not rendered. Twitter card `site` / `creator` omitted. Footer `SocialLinks` renders nothing. |
| **sameAs** | `ORGANIZATION_SAME_AS` is empty. Organization JSON-LD **omits** `sameAs` (`structured-data.ts` spreads it only when length > 0; test expects `sameAs` undefined). Previous CONVADUIT / conva-aduit URLs were removed and are not claimed as official. |

No live social profiles or Knowledge Graph presence was verified in this pass.

---

# 3. Structured Data

**Validation status for every row:** emitted in source; shape covered by Vitest (`src/lib/seo/structured-data.test.ts`). **Not** submitted to Google Rich Results Test or schema.org validator in this program. Column “Valid/Invalid” is therefore **Unvalidated**, not Valid.

| Schema | Status | URL | Valid/Invalid | Notes |
| --- | --- | --- | --- | --- |
| Organization | Emitted on home, inner marketing graphs, contact graph | `@id` `https://www.convaudit.com/#organization` | Unvalidated | `name` ConvAudit; `url` origin without trailing slash; official English `description`; logo `/apple-icon` 180×180; email `alihashem@convaudit.com`; **no `sameAs`**. |
| WebSite | Emitted with Organization | `@id` `https://www.convaudit.com/#website` | Unvalidated | `publisher` → Organization `@id`; `inLanguage` `ar`; English `description`; `about` → SoftwareApplication `@id`. |
| WebPage | Home graph + inner marketing pages | Home: `@id` / `url` = origin **without** trailing slash (`https://www.convaudit.com`). Inner: `absoluteUrl(path)` | Unvalidated | Home HTML canonical is `https://www.convaudit.com/` — **mismatch vs JSON-LD `@id`**. Search uses HTML canonical. Contact does **not** emit WebPage (ContactPage only). |
| BreadcrumbList | Inner marketing + contact; **not** homepage | `{pageUrl}#breadcrumb` | Unvalidated | Two crumbs: ConvAudit home + current page name. Home graph has no BreadcrumbList. |
| Product | Home graph only, dual type | `@id` `https://www.convaudit.com/#software` | Unvalidated | `"@type": ["SoftwareApplication", "Product"]` plus `Offer`s from `MARKETING_PLANS` (EGP). Not a retailer Product for a SKU. Feature list states GEO is not a live ChatGPT/Gemini/Perplexity query. |
| FAQPage | Home graph only | Homepage | Unvalidated | 10 Q/A pairs from `HOME_FAQ_KEYS`. On-page FAQ uses accordion buttons, not `h2`/`h3`. |
| ContactPage | `/contact` only | `https://www.convaudit.com/contact` | Unvalidated | Graph: Organization, WebSite, ContactPage, BreadcrumbList. No second WebPage. |
| Article | Each `/blog/[slug]` | Canonical post URL | Unvalidated | `datePublished` omitted when `publishedOn` is after today (all six posts: 2026-09-20 … 2026-10-15). JSON-LD `description` uses **on-page excerpt**, not `metaDescription` (`blog/[slug]/layout.tsx`). |

---

# 4. Metadata

Source: `publicPageMetadata()` + uniqueness test (`src/lib/seo/public-metadata-uniqueness.test.ts`). Document titles: home uses `{ absolute: SITE_DEFAULT_TITLE }`; others use `resolvePublicTitle` (` · ConvAudit` suffix only when composed length ≤ 60). Indexable = `PUBLIC_PAGE_ROBOTS` (`index,follow` + googleBot `max-image-preview: large`).

| URL | Title (document) | Description | Canonical | Indexable |
| --- | --- | --- | --- | --- |
| https://www.convaudit.com/ | ConvAudit \| Ecommerce SEO Audit & GEO (37 chars, absolute) | Official English sentence (`SITE_DESCRIPTION`) | https://www.convaudit.com/ | Yes |
| https://www.convaudit.com/pricing | أسعار تدقيق المتاجر · ConvAudit | باقات ConvAudit لتدقيق المتاجر الإلكترونية: تحويل، SEO، وGEO. ابدأ مجاناً — الأسعار بالجنيه المصري عبر Kashier. | https://www.convaudit.com/pricing | Yes |
| https://www.convaudit.com/docs | دليل تدقيق المتاجر وGEO · ConvAudit | كيف يعمل تدقيق الصفحة في ConvAudit: تحويل، SEO، GEO، حدود التحليل، ومولد المحتوى لمتاجر Shopify وWooCommerce وسلة وزد. | https://www.convaudit.com/docs | Yes |
| https://www.convaudit.com/blog | مدونة SEO وGEO للمتاجر · ConvAudit | أدلة تدقيق SEO وGEO وتحويل المتاجر الإلكترونية، وتحليل المنافسين، وتحسين الظهور في البحث بالذكاء الاصطناعي. | https://www.convaudit.com/blog | Yes |
| https://www.convaudit.com/about | من نحن · ConvAudit | ConvAudit منصة تدقيق متاجر إلكترونية بالذكاء الاصطناعي: SEO، تحويل، ظهور AI (GEO)، وإشارات ثقة. لتجار Shopify وWooCommerce وسلة وزد. https://www.convaudit.com | https://www.convaudit.com/about | Yes |
| https://www.convaudit.com/contact | اتصل بنا · ConvAudit | تواصل مع ConvAudit عبر البريد الرسمي alihashem@convaudit.com للاستفسارات العامة والفوترة وطلبات الاسترداد. | https://www.convaudit.com/contact | Yes |
| https://www.convaudit.com/security | أمان المنتج والبيانات · ConvAudit | نهجنا الحالي في أمان المنتج: تحليل الصفحات العامة فقط، النقل عبر HTTPS، وحدّ أدنى من الصلاحيات — دون الادعاء بشهادات غير موثّقة. | https://www.convaudit.com/security | Yes |
| https://www.convaudit.com/privacy | سياسة الخصوصية · ConvAudit | ما نجمعه لتشغيل الحسابات والتحليلات، لماذا نجمعه، وكيف تطلب حذف البيانات المرتبطة بحسابك. | https://www.convaudit.com/privacy | Yes |
| https://www.convaudit.com/terms | الشروط والأحكام · ConvAudit | شروط استخدام ConvAudit كمنصة برمجيات كخدمة لتحليل صفحات منتجات المتاجر الإلكترونية. | https://www.convaudit.com/terms | Yes |
| https://www.convaudit.com/refund-policy | سياسة الاسترداد · ConvAudit | ضمان استرداد خلال 14 يوماً لاشتراكات ConvAudit المدفوعة — بشروط واضحة على صفحة السياسة. | https://www.convaudit.com/refund-policy | Yes |
| https://www.convaudit.com/roadmap | خارطة طريق المنتج · ConvAudit | أولويات توجيهية معلنة للمنتج — ليست تعهدات تعاقدية ولا مواعيد تسليم ملزمة. | https://www.convaudit.com/roadmap | Yes |
| https://www.convaudit.com/blog/geo-ai-visibility-guide | الدليل الكامل لتحسين الظهور في محركات الذكاء الاصطناعي (absolute; composed 66 > 60) | Meta: دليل GEO لصفحات المنتجات: أسئلة شائعة، Schema، وحقائق قابلة للاقتباس. التقديرات من إشارات الصفحة وليست استعلاماً حياً في ChatGPT أو Perplexity. | https://www.convaudit.com/blog/geo-ai-visibility-guide | Yes |
| https://www.convaudit.com/blog/conversion-rate-optimization | 10 إصلاحات سريعة لمعدل التحويل في المتاجر الإلكترونية (absolute; composed 65 > 60) | Meta: إصلاحات لصفحات منتجات المتاجر: وضوح العرض والسعر ودعوة الإجراء في HTML. توصيات لتحسين التحويل دون ضمان معدل مبيعات. | https://www.convaudit.com/blog/conversion-rate-optimization | Yes |
| https://www.convaudit.com/blog/product-schema-markup | كيف تضيف Product Schema لصفحاتك وتظهر في Google · ConvAudit | Visible excerpt used as meta: دليل عملي خطوة بخطوة لإضافة JSON-LD على Shopify وWooCommerce. | https://www.convaudit.com/blog/product-schema-markup | Yes |
| https://www.convaudit.com/blog/competitor-analysis-strategy | استراتيجية تحليل المنافسين لمتاجر الخليج ومصر · ConvAudit | كيف تكتشف نقاط ضعف منافسيك وتستغلها لتنمية مبيعاتك. | https://www.convaudit.com/blog/competitor-analysis-strategy | Yes |
| https://www.convaudit.com/blog/ai-product-descriptions | كتابة أوصاف المنتجات بالذكاء الاصطناعي: أفضل الممارسات (absolute; composed 66 > 60) | كيف تستخدم Gemini لكتابة أوصاف تبيع — مع أمثلة حقيقية. | https://www.convaudit.com/blog/ai-product-descriptions | Yes |
| https://www.convaudit.com/blog/trust-signals-ecommerce | إشارات الثقة التي تساعد متجرك على كسب ثقة المتسوقين (absolute; composed 63 > 60) | الشارات والسياسات والتقييمات التي تجعل المتسوقين يثقون بك قبل الدفع. | https://www.convaudit.com/blog/trust-signals-ecommerce | Yes |

OG/Twitter: public pages set `openGraph.url` = canonical, `siteName` ConvAudit, `locale` `ar_EG`, images `/opengraph-image` and `/twitter-image` 1200×630. Homepage OG/Twitter title equals the document title.

Private prefixes use `privatePageMetadata()`: title `ConvAudit`, non-marketing description, `noindex,nofollow`. They are not in the table above.

---

# 5. Heading Structure

Counts are from **source components as composed on each route**, including the marketing footer’s four `<h3>` column titles (`FOOTER_LINK_COLS`). FAQ accordion triggers are **not** headings.

| URL | H1 | H2 | H3 structure | Problems |
| --- | --- | --- | --- | --- |
| `/` | 1 (hero; no “ConvAudit”) | 13 (includes `sr-only` entity H2 “ConvAudit — منصة…”; SectionHeaders; comparison; pricing; CTA) | ~37: why-lose 4, concept 1, features 4, decision 3, plans 3, methodology 6, security 6, trust 6, footer 4. FAQ questions are not H3. Methodology AI steps are **H4**. | H1 ≠ `<title>`. Visible H1 omits brand. Entity H2 hidden. FAQ not in outline. Many H3s. |
| `/pricing` | 1 (`الأسعار`) | 1 (`sr-only` pricing heading) | 3 plan names + 4 footer | H1 ≠ title (`أسعار تدقيق المتاجر`). |
| `/docs` | 1 (`التوثيق`) | 7 (5 numbered sections + example + related) | 4 footer only (items are spans) | H1 ≠ title (`دليل تدقيق المتاجر وGEO`). |
| `/blog` | 1 (`المدونة`) | 1 (featured post title) | 5 remaining post titles + 4 footer | H1 ≠ title (`مدونة SEO وGEO للمتاجر`). Featured excerpt still overclaims ChatGPT/Perplexity. |
| `/about` | 1 (`من نحن`) | 11 topic cards | 4 footer | H1 matches title token. Mixed English phrases in Arabic cards (intentional, once each). |
| `/contact` | 1 (`اتصل بنا`) | 1 (email as H2). Social H2 **not rendered** (`SOCIAL_PROFILES` empty) | 3 topics + 1 “أسئلة شائعة” + 4 footer | Email as H2 is unusual but unique. |
| `/security` | 1 (`الأمان`) | 6 (4 practices + البنية التحتية + الامتثال) | 4 footer | H1 ≠ title (`أمان المنتج والبيانات`). |
| `/privacy` | 1 (`الخصوصية`) | 4 cards | 4 footer | H1 ≠ title (`سياسة الخصوصية`). Page still labels itself a temporary overview. |
| `/terms` | 1 (`الشروط والأحكام`) | 6 cards | 4 footer | H1 matches title. Temporary legal overview copy. |
| `/refund-policy` | 1 (`سياسة الاسترداد`) | 6 cards | 4 footer | H1 matches title. |
| `/roadmap` | 1 (`خارطة الطريق`) | 3 items | 4 footer | H1 ≠ title (`خارطة طريق المنتج`). |
| `/blog/geo-ai-visibility-guide` | 1 (post title) | 4 body + 1 related | 5 body + 3 related cards + 4 footer | Visible excerpt overclaims live engine recommendations. Body still frames GEO as appearing in ChatGPT/Perplexity answers. Dates in 2026. |
| `/blog/conversion-rate-optimization` | 1 | 3 body + 1 related | 3 related + 4 footer | Excerpt claims sales lift “فوراً”. |
| `/blog/product-schema-markup` | 1 | 3 body + 1 related | 3 related + 4 footer | No extra heading defect beyond H1/title length policy. |
| `/blog/competitor-analysis-strategy` | 1 | 3 body + 1 related | 3 related + 4 footer | Excerpt implies sales growth from competitor gaps. |
| `/blog/ai-product-descriptions` | 1 | 3 body + 1 related | 3 related + 4 footer | Excerpt claims “أمثلة حقيقية” — not verified here. |
| `/blog/trust-signals-ecommerce` | 1 | 3 body + 1 related | 3 related + 4 footer | — |

---

# 6. Internal Linking

**Inventory (source, not live HTTP):**

| Measure | Count | Evidence |
| --- | --- | --- |
| Footer crawlable `href`s | **22** | `FOOTER_LINK_COLS` (7 + 3 + 8 + 4) |
| About inline topical links | **11** | `collectAboutInternalLinks()` |
| Docs related list | **10** | `DOCS_RELATED_LINKS` |
| Trust-resources cards | **6** | `TRUST_RESOURCE_LINKS` |
| Homepage entity nav (`sr-only`) | **5** | `HOME_ENTITY_LINKS` |
| Blog related posts | **18** (6 × 3) | `BLOG_RELATED_SLUGS` |
| Unique indexable HTML paths | **17** | 11 static sitemap routes + 6 slugs (`PUBLIC_INDEXABLE_PATHS`) |
| **Broken marketing hrefs in inventory** | **0** (source) | `internal-links.test.ts`: every inventory href `isResolvablePublicInternalHref`; no hash-only; no `/geo` |
| **Orphan indexable pages** | **0** | Same test: footer inbound covers every `PUBLIC_INDEXABLE_PATHS` entry |
| Production HTTP of those hrefs | **Not re-checked** this pass | Prior linking report used local browser; this pass is source + Vitest |

Guest navbar/hero CTAs still point at `/auth?mode=…` (noindex). That is intentional conversion, not a new SEO link.

**Important missing (visible) links:**

- Visible homepage does not expose the entity nav (it is `sr-only`).
- No official social URLs to emit.
- `/llms.txt` is crawlable but not in the HTML sitemap (by design in `sitemap.ts`).
- Homepage JSON-LD service URLs use `{origin}/#features` style hashes; those fragments exist on `/`.

---

# 7. Keyword Coverage

Rule: **exact consecutive phrase** in public-facing copy (about body, official description, titles, llms.txt). `SITE_KEYWORDS` meta array is noted separately; Google largely ignores keywords meta. Similar words do not count.

| Phrase | Status | Evidence |
| --- | --- | --- |
| ecommerce SEO audit | **Present** | About SEO card once (Vitest: exactly one). Title uses “Ecommerce SEO Audit” (same words, different casing). `SITE_KEYWORDS` includes the phrase. **Not** in `SITE_OFFICIAL_DESCRIPTION`. |
| ecommerce audit | **Present** | Official description (“ecommerce audit and visibility platform”). About body once. |
| ecommerce website audit | **Weak** | About “who it’s for” once. `SITE_KEYWORDS`. Not in titles/H1s. |
| ecommerce conversion optimization | **Weak** | About conversion card once. **Not** in `SITE_KEYWORDS` (that list has “ecommerce conversion audit”). Not in titles. |
| Shopify SEO audit | **Present** | About SEO card once (Vitest cap). `SITE_KEYWORDS`. |
| WooCommerce SEO audit | **Present** | About SEO card once (Vitest cap). `SITE_KEYWORDS`. |
| AI visibility | **Present** | Official description; about H2 + body; llms.txt; homepage entity copy. |
| ecommerce AI | **Weak** | About GEO body once (“AI visibility وecommerce AI”). Not the official description. `SITE_KEYWORDS` has “ecommerce AI visibility” / “ecommerce AI SEO” — **different phrases**. |
| GEO | **Present** | Homepage title; about H2/body/meta; llms.txt; blog visual/category; keywords “GEO audit”. Product pillar, not a stuffed list. |
| trust signals | **Present** | Official description; about trust card; llms.txt (“trust-signal”). |
| competitor analysis | **Present** | About competitor card; llms.txt. `SITE_KEYWORDS` has “ecommerce competitor analysis” (longer phrase). |

**Overused:** no exact-phrase stuffing found. About tests cap `ecommerce SEO audit` / `Shopify SEO audit` / `WooCommerce SEO audit` at one occurrence each.

---

# 8. GEO / AI Entity Signals

No ChatGPT / Gemini / Perplexity citation test was run. Ratings are source-only.

| Signal | Rating | Evidence |
| --- | --- | --- |
| Entity clarity | **Partial** | Official name + URL + English sentence in schema, llms.txt, about, and `sr-only` home copy. Visible H1/footer still describe a “growth consultant,” not the official product type. |
| Brand consistency | **Partial** | Public SEO forbids StorePulse / CONVADUIT. Visible Arabic marketing voice still diverges. `html lang="ar"` vs English home title/description. |
| Co-occurrence | **Partial** | About co-occurs ConvAudit + ecommerce audit + GEO + Shopify/WooCommerce + trust + competitor analysis. Home visible H1 does not co-occur ConvAudit with those English terms. |
| Structured data | **Partial** | Organization / WebSite / WebPage / SoftwareApplication+Product / FAQ / Article graphs exist. Unvalidated. Empty `sameAs`. Home WebPage `@id` ≠ HTML canonical slash. |
| About page | **Strong** | Eleven topic cards, official English paragraph, GEO limits stated (not live engine queries). |
| Social profiles | **Missing** | Empty `SOCIAL_PROFILES` / `sameAs`. |
| Internal topical relationships | **Strong (source)** | About → docs/blog/#how/#methodology; docs related guides; topical `BLOG_RELATED_SLUGS`; footer covers sitemap. |
| External authority gaps | **Open** | No verified official social URLs. **No backlink audit.** Prior production audit is not a backlink dataset. Do not claim domain authority or citations. |

`/llms.txt` states GEO is local page-signal analysis and that ConvAudit does not query ChatGPT, Perplexity, or Google AI as live search engines. That is a **disclaimer**, not proof of AI-search presence.

---

# 9. Indexability

Verified **in source and Vitest this pass**. Live production HTTP was **not** re-fetched.

| Control | Finding |
| --- | --- |
| `robots.txt` (`src/app/robots.ts`) | `userAgent: *`, `Allow: /`, `Disallow`: `/api/` + `/dashboard` `/health` `/audit` `/history` `/reports` `/monitor` `/geo` `/settings` `/checkout` `/onboarding` `/auth` `/alerts` `/notifications` `/tasks`. `Host` + sitemap rewritten to www even if env is apex (`robots-policy.test.ts`). `/llms.txt` is **not** disallowed. |
| `sitemap.xml` (`src/app/sitemap.ts`) | 11 static marketing URLs + 6 blog slugs; home `https://www.convaudit.com/`; no `lastModified`; no private/API/`/status`/`/changelog`/`/affiliate` (`sitemap.test.ts`). |
| Canonical | `canonicalPageUrl()`; uniqueness test asserts www + trailing slash on home only. |
| noindex | Public: `index,follow`. Private layouts: `privatePageMetadata()` `index: false, follow: false` + googleBot. `next.config.ts` `X-Robots-Tag: noindex, nofollow` on `/api/*` and every `PRIVATE_APP_PATHS` prefix. 404: `noindex, follow`. |
| Private routes | Prefixes above; build still prerenders many of those shells as static HTML, but robots meta + header + middleware gate apply. `/geo` is private, not the marketing GEO URL. |
| Public routes | `/`, `/pricing`, `/docs`, `/blog`, 6 posts, `/security`, `/privacy`, `/terms`, `/refund-policy`, `/about`, `/contact`, `/roadmap`, plus crawlable `/llms.txt` (not in sitemap). Build: those marketing routes `○` static; blog slugs `●` SSG. |
| Apex | Code: `getSiteUrl()` rewrites apex → www; middleware / Next / Vercel redirects exist. **`FINAL-PRODUCTION-AUDIT.md` recorded live `https://convaudit.com/` 200 without 301/308.** This pass did not re-fetch. Status: **open until live re-check**. |
| hreflang | None. Single locale `ar` / `ar_EG`. |
| Google verification | Token only if `GOOGLE_SITE_VERIFICATION` is set. Presence of a live Search Console property was not verified here. |

---

# 10. Performance SEO

**No new Lighthouse, CrUX, or WebPageTest run.** The five SEO reports contain **no** LCP, HTML-byte, request-count, or JS-byte measurements. A prior Lighthouse attempt in this workspace failed with `EPERM` on a temp directory (not a score).

Known items from `FINAL-PRODUCTION-AUDIT.md` (not re-measured):

| Topic | Logged problem | Measured number in that file? |
| --- | --- | --- |
| LCP | Unmeasured CrUX/Lighthouse; flagged as risk from JS/GA/Framer Motion | **No LCP value** |
| Render blocking | GA `G-MDR2NP5CJ3` (deferred component still present in root layout), Framer Motion on marketing sections, many JS chunks | No lab ms |
| Image sizing | `next/image` avif/webp noted; product preview shots declare 1119×653 and `sizes` in source | No CLS/LCP image audit |
| Image aspect ratio | Product screenshots ~1.713 in source comments; blog index uses `aspect-video` decorative GEO text, not photos | No lab finding |
| HTML size | Not recorded in SEO reports | — |
| HTTP requests | Not recorded | — |
| JavaScript size | “Many JS chunks”; client pricing/auth; Speed Insights + Analytics in root layout | No KB total |
| Remote images | `next.config.ts` `remotePatterns: [{ protocol: "https", hostname: "**" }]` | Pattern only |

This report does not treat those as fixed.

---

# 11. Security / Backend Safety

**This report task created only `FINAL-SEO-GEO-REPORT.md`.** It did not change:

| System | This task |
| --- | --- |
| Database | Unchanged |
| Authentication | Unchanged |
| Payments | Unchanged |
| API | Unchanged |
| Audit engine | Unchanged |
| Gemini | Unchanged |
| Firecrawl | Unchanged |
| Supabase | Unchanged |

The working tree already contained dirty files outside SEO stages (`src/lib/gemini.ts`, `src/lib/firecrawl.ts`, `src/app/api/audit/route.ts`, load-test scripts, etc.). Those are **not** edits from this final-report pass. SEO stages also stated they did not change those backends.

---

# 12. Tests

Run on 30 August 2026 in this session (read-only relative to product code):

| Command | Result |
| --- | --- |
| `npm run typecheck` (`tsc --noEmit`) | **Pass**, exit 0 |
| `npm run lint` (`eslint .`) | **Pass**, exit 0 (~122 s) |
| `npm test` (`vitest run` v3.2.7) | **Pass:** 87 files, **506** tests passed, 0 failed. Duration 65.23 s |
| `npm run build` (`next build` + `postbuild` copy-standalone) | **Pass**, exit 0. Next.js **16.3.1** (Turbopack). Compile 18.4 s. TypeScript in build 24.7 s. Static generation **70/70**. Standalone copy succeeded. |

Build warnings (not failures): custom Cache-Control on `/_next/static/(.*)`; middleware file convention deprecated (suggest `proxy`); Edge Runtime deprecated; edge runtime disables static generation for that surface.

SEO-related suites included in the 506: `public-metadata-uniqueness`, `structured-data`, `page-metadata`, `internal-links`, `sitemap`, `private-page-metadata`, `robots-policy`, `about/copy`, `llms-txt`, `social`, `site-url`, `dates`, `contact`, `google-site-verification`.

---

# 13. Files Changed

Union of files named in the five SEO stage reports, plus this report. Paths are relative to the repo root.

### Audit (report only)

- `SEO-GEO-AUDIT.md`

### Brand entity + structured data

- `src/lib/seo/site-copy.ts`
- `src/lib/seo/social.ts`
- `src/lib/seo/social.test.ts`
- `src/lib/seo/structured-data.ts`
- `src/lib/seo/structured-data.test.ts`
- `src/lib/seo/llms-txt.ts`
- `src/lib/seo/llms-txt.test.ts`
- `src/lib/seo/page-metadata.ts`
- `src/lib/seo/page-metadata.test.ts`
- `src/app/layout.tsx`
- `src/app/contact/layout.tsx`
- `src/app/contact/page.tsx`
- `src/components/layout/social-links.tsx`
- `SEO-SCHEMA-REPORT.md`

### Content SEO + about entity

- `src/app/about/copy.ts`
- `src/app/about/copy.test.ts`
- `src/app/about/page.tsx`
- `src/app/about/layout.tsx`
- `src/lib/seo/public-metadata-uniqueness.test.ts`
- `src/components/sections/home-entity.tsx`
- `CONTENT-SEO-REPORT.md`

### Internal linking + indexability helpers

- `src/lib/seo/internal-links.ts`
- `src/lib/seo/internal-links.test.ts`
- `src/app/docs/related-links.ts`
- `src/app/docs/page.tsx`
- `src/lib/locale/messages/ar.ts`
- `src/lib/blog-posts.ts`
- `src/app/blog/[slug]/page.tsx`
- `src/components/sections/trust-resources.tsx`
- `INTERNAL-LINKING-REPORT.md`

### Technical metadata

- `src/lib/site-url.ts`
- `src/lib/seo/private-page-metadata.ts`
- `src/app/page.tsx`
- `src/app/sitemap.ts`
- `src/app/blog/[slug]/layout.tsx`
- `src/app/opengraph-image.tsx`
- `src/app/twitter-image.tsx`
- `src/lib/seo/sitemap.test.ts`
- `src/lib/seo/private-page-metadata.test.ts`
- `src/lib/site-url.test.ts`
- `METADATA-SEO-REPORT.md`

### Also in those stages (shared)

- `src/app/blog/copy.ts`
- `src/app/blog/layout.tsx`
- `src/app/blog/page.tsx`
- `src/app/blog/blog-index.tsx`
- `src/app/docs/layout.tsx`
- `src/app/pricing/layout.tsx`
- `src/components/layout/footer.tsx` (inventory comments / columns; linking report said footer targets were already complete)

### This pass

- `FINAL-SEO-GEO-REPORT.md`

### Working tree but **not** SEO-stage work

Present as dirty/untracked at report time; do not treat as SEO deliverables: `eslint.config.mjs`, `next.config.ts`, `package.json`, `tsconfig.json`, `src/app/api/audit/route.ts`, `src/app/api/audit/route.test.ts`, `src/app/auth/page.tsx`, `src/app/icon.svg`, `src/app/icon.tsx`, `src/components/design-system/section.tsx`, homepage section chrome (`hero`, `features`, `cta`, `comparison-table`, `decision-engine`, `logos-strip`, `methodology`, `product-preview`, `security-band`, `why-lose-sales`), `src/lib/competitor-monitor/job.ts`, `src/lib/firecrawl.ts`, `src/lib/gemini.ts`, `src/lib/gemini-source.test.ts`, `src/lib/og-font.ts`, `src/lib/og-response.tsx`, `src/lib/og-text.ts`, `src/lib/og-text.test.ts`, `src/lib/types.ts`, `src/lib/load-test/*`, `k6/audit.js`, `scripts/load-test.js`, `FINAL-PRODUCTION-AUDIT.md`.

`robots.ts` and `private-app-paths.ts` were **not** changed in the linking/metadata passes (no defect requiring a robots edit).

---

# 14. Remaining Issues

Nothing below is marked resolved without evidence from this re-check.

### CRITICAL

| Issue | Evidence | Status |
| --- | --- | --- |
| Apex host may still serve HTML without redirecting to www | `FINAL-PRODUCTION-AUDIT.md`: live `https://convaudit.com/` **200**, no 301/308. Source still *intends* 308. **Not re-fetched this pass.** | **OPEN** |

### HIGH

| Issue | Evidence |
| --- | --- |
| Visible GEO blog excerpt still claims ChatGPT / Perplexity / Google AI will recommend products | `ar.ts` `blog.post1.excerpt`. Meta was corrected; visible excerpt and Article JSON-LD `description` still use the excerpt (`blog/[slug]/layout.tsx`). |
| GEO article body still frames GEO as appearing in ChatGPT / Perplexity / Google AI Overviews | `blog.post.geo.p_1` |
| Conversion excerpt still claims immediate sales lift | `blog.post2.excerpt` (“فوراً”). Meta corrected; JSON-LD still uses excerpt. |
| Visible homepage H1 does not contain “ConvAudit”; entity copy is `sr-only` | `hero.tsx` + `home-entity.tsx` |
| H1 ≠ `<title>` on pricing, docs, blog index, privacy, security, roadmap, home | Layout titles vs `PageHeader` / hero strings |
| Blog `publishedOn` / displayed dates are after 30 August 2026 | 2026-09-20 … 2026-10-15; Article `datePublished` omitted |
| `html lang="ar"` vs English homepage title and meta description | `locale/config.ts` `htmlLang: "ar"`; `SITE_DEFAULT_TITLE` / `SITE_DESCRIPTION` English |
| Home JSON-LD WebPage `@id` lacks trailing slash vs HTML canonical | `webPageNode` `url: base` vs `canonicalPageUrl("/")` |
| Organization `sameAs` empty | `social.ts`; no official ConvAudit profile URL in source |

### MEDIUM

| Issue | Evidence |
| --- | --- |
| Schema unvalidated by Google / schema.org | No RRT run |
| Footer still “مستشار نمو…” | `footer.tagline` |
| WebSite `inLanguage` `ar` vs English Organization description | `structured-data.ts` |
| Privacy/terms still “temporary overview” legal copy | Page footers on those routes |
| `/llms.txt` not in sitemap | `sitemap.ts` comment |
| No `hreflang` while targeting English SERP strings on an Arabic document | Source |
| Internal `storepulse:` ID prefixes in report UI | `audit-report.tsx`, `quick-wins.ts` |
| Blog competitor / AI-copy excerpts overclaim (“تنمية مبيعاتك”, “أمثلة حقيقية”) | `ar.ts` post4/post5 excerpts |
| FAQ not in heading outline (accordion) | `faq.tsx` |
| Guest CTAs to `/auth` | Navbar/hero; noindex by design |
| Live Search Console ownership / indexing | Not verified this pass |
| `next/image` `hostname: **` | `next.config.ts` |

### LOW

| Issue | Evidence |
| --- | --- |
| Homepage has many H2/H3s | Section composition |
| Contact email rendered as H2 | `contact/page.tsx` |
| Build warnings (middleware → proxy, Edge runtime, Cache-Control) | `next build` output |
| Keywords meta array unused by Google | `SITE_KEYWORDS` |
| `indexable: false` public helper unused | `page-metadata.ts` |

---

# 15. Final Score

Scores are conservative. Completing tasks does not add points. Unvalidated schema is not scored as “valid.” GEO is not scored as if the brand appears in AI answers.

| Dimension | Score | Why not higher |
| --- | --- | --- |
| Technical SEO | **76 / 100** | Canonicals, robots, sitemap, SSG public HTML, X-Robots-Tag. Deduct: EN/AR mismatch, H1/title, JSON-LD slash, unvalidated schema, possible live apex duplicate. |
| On-page SEO | **68 / 100** | About is strong; home H1 off-brand; overclaiming excerpts/body; mixed language; English keywords clustered on `/about`. |
| Structured Data | **71 / 100** | Graphs + Vitest. Deduct: unvalidated, empty sameAs, future dates, Article description = excerpt, no home breadcrumb, Product dual-type only on home. |
| Brand Entity | **73 / 100** | Official sentence on schema/llms/about. Deduct: visible home/footer voice, empty sameAs, sr-only entity. |
| GEO Readiness | **58 / 100** | Honest GEO limits in about/llms/schema; contradictory blog excerpt/body; no live citation test; no sameAs; sr-only home entity. |
| Internal Linking | **80 / 100** | No source orphans/broken inventory hrefs; topical cluster. Deduct: entity nav hidden; no HTTP re-check of production; auth CTAs. |
| Indexability | **84 / 100** | Source robots/sitemap/canonical/noindex stack is coherent. Deduct: un-rechecked apex 200; llms omitted from sitemap; no GSC proof. |

**Overall SEO/GEO: 72 / 100**

Arithmetic mean of the seven dimensions = 72.6, rounded to **72**. GEO and on-page honesty keep the overall score from the mid-70s.

---

# 16. Next Priority Actions

Ranked by impact on rankings, entity, and GEO honesty (not effort):

1. **Re-check live apex** `https://convaudit.com/` → confirm 308/301 to `https://www.convaudit.com/` and fix hosting if the prior 200 still holds.
2. **Rewrite GEO (and conversion) visible excerpts and GEO body** so they match llms.txt / about: page-signal estimates, not live ChatGPT/Perplexity recommendations or guaranteed sales. Point Article JSON-LD `description` at the factual meta string.
3. **Put ConvAudit in the visible homepage H1** (or an immediately visible H1-equivalent), aligned with the official product type — not only `sr-only`.
4. **Align H1 with `<title>`** on pricing, docs, blog, security, privacy, roadmap (and home after H1 change).
5. **Fix or remove future `publishedOn` / display dates**; emit `datePublished` only for real past dates.
6. **Publish official ConvAudit social profiles** (real URLs only), then set `SOCIAL_PROFILES` / Organization `sameAs`.
7. **Validate JSON-LD** with Google Rich Results Test and schema.org; then fix home WebPage `@id` vs trailing-slash canonical if the validator flags it.
8. **Decide language targeting:** Arabic-only document with English SERP title/description needs either `hreflang` + a real EN page, or Arabic metadata consistent with `lang="ar"`.
9. **Replace footer “مستشار نمو”** with the official audit/visibility positioning.
10. **Measure CWV** (CrUX or a successful Lighthouse/field run) for LCP, JS weight, and GA/Framer Motion cost — then fix what the numbers show.

Do not claim AI-engine citations, backlinks, or “schema valid” until those are measured independently of this repository.
