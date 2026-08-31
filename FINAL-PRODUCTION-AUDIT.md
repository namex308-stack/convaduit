# FINAL PRODUCTION AUDIT — ConvAudit (StorePulse)

**Date:** 2026-08-25  
**Scope:** Entire repository + live production `https://www.convaudit.com`  
**Mode:** Read-only. No application files were modified to “pass” this audit.  
**Deployed commit (production):** `7e70234e9ceca7d625b2527d096dde048b64c3e6`  
**Local working tree:** same commit plus **uncommitted** deletions of `/affiliate`, `/changelog`, `/status` (not yet on production).

Statuses used below:

| Status | Meaning |
|---|---|
| ✅ VERIFIED REAL | Proven by code path **and** live/runtime evidence |
| ⚠️ PARTIAL | Real plumbing exists, but fallbacks, gaps, or production config break the customer promise |
| ❌ MOCK/FAKE | Presented as live product behavior without a real provider/API/data source |
| ❌ BROKEN | Code or production configuration makes the flow fail for a real customer |
| ❓ NOT VERIFIABLE | Could not be executed end-to-end (usually missing credentials or a production blocker upstream) |

---

## A. Executive Summary

ConvAudit is a real product codebase: Next.js App Router, Supabase Auth + Postgres + RLS, Firecrawl scrape, Gemini analysis, Kashier billing **in source**, and workspace-scoped APIs. Historical database rows prove that **Firecrawl + Gemini have actually run** against real page HTML.

That is not the same as “a real customer can use production today.”

Live `/api/status` on **www.convaudit.com** reports:

- Supabase, Gemini, Firecrawl: configured
- Kashier: **missing `KASHIER_API_KEY` and `KASHIER_SECRET_KEY`**
- Upstash Redis: **missing `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`**
- `fullyConfigured: false`, `demoMode: true`

Because production rate limiting **fails closed** without Redis, `POST /api/audit` and `POST /api/generate` deny with HTTP 429. Because Kashier is not configured, production checkout **cannot take payment** (and will not silently demo-activate — that path is blocked when `NODE_ENV === "production"`).

So the engine is real, but the **production customer journey is blocked**: no new audits, no AI Studio, no paid upgrades.

ChatGPT and Perplexity are **not integrated**. GEO “engine” scores are deterministic heuristics on crawled HTML. Marketing copy that names those products is therefore a visibility **model**, not a live API measurement.

**Launch verdict:** **NOT READY.**

---

## B. Final score /100

**46 / 100**

This is not a test-pass score. Typecheck, lint, build, and most unit/e2e tests succeed. Production still cannot complete the core paid job-to-be-done.

| Area | Score |
|---|---|
| Real vs mock data | 62 |
| Crawl & analyzers | 68 |
| AI providers | 52 |
| Subscriptions / billing | 28 |
| SEO & indexing | 71 |
| Production infrastructure | 32 |
| Security | 64 |
| UI / UX functional | 54 |
| API | 58 |
| Database / RLS | 76 |

---

## C. Launch verdict

**NOT READY**

A real customer on https://www.convaudit.com cannot reliably:

1. Run a new audit (Redis fail-closed → 429).
2. Pay for Pro/Business (Kashier keys missing → checkout 503 after login).
3. Trust ChatGPT/Perplexity scores as live engine results (heuristics only).
4. Cancel, renew, or recover a paid subscription (no cancel API; no paid rows in DB).

Do not ship as a paid SaaS until P0 items in section T are fixed and re-verified on production with a real checkout and a real audit.

---

## D. REAL vs MOCK DATA matrix

| Surface | Status | Data flow | Evidence | Impact | Fix |
|---|---|---|---|---|---|
| Dashboard KPIs / trend / recent audits | ✅ VERIFIED REAL | UI `GET /api/dashboard` → `getDashboardForUser()` → Supabase `audits`, `usage_events`, `plan_catalog`, `workspace_members` | `src/app/dashboard/page.tsx` fetches `/api/dashboard`; `src/app/api/dashboard/route.ts`; `src/lib/db/workspace-stats.ts`. Empty states use `—`, not invented scores. | Honest empty/zero data when no audits. | None for data source. Production cannot add new audits until Redis is set. |
| History | ✅ VERIFIED REAL | `/history?q=` → `/api/audits` → membership-scoped `audits` | Topbar search pushes `/history?q=` (`src/components/app/app-topbar.tsx` `submitSearch`). | Real list/filter. | — |
| Audit report scores | ⚠️ PARTIAL | Crawl → `runAudit()` → persist `audits` / `audit_scores` / `recommendations` / `reports.summary` | DB: 4 completed audits with `crawl_provider=firecrawl`, `model=gemini-2.0-flash`, non-null scores. `audit_pages`: 4 pages, `scrape_status=ok`, markdown length 1 293–13 977 (avg 4 464). | Scores come from real pages **when the pipeline runs**. Gemini failure silently uses heuristics while still storing a Gemini model id. | Persist `analysis_source` (`gemini` vs `rule_engine`); set `demoMode` true on heuristic fallback even if the key exists. |
| GEO ChatGPT / Perplexity / Google AI bars | ❌ MOCK/FAKE (as “engine APIs”) | `analyzeGeo(page)` → `deriveReadability()` tweaks a local score | `src/lib/audit/geo-analyzer.ts` — **no OpenAI/Perplexity HTTP**. UI labels: `report.geoEngineChatgpt` / `Perplexity`. | Customers think ConvAudit queried those products. | Relabel UI to “estimated readability for ChatGPT-style / citation-style / Google-AI-style engines” or integrate real APIs. |
| Store Health | ⚠️ PARTIAL | `GET /api/store-health` → compose from **latest stored audit**, not a fresh site crawl | `src/lib/store-health/compose.ts` explicitly does not re-run analyzers. | Health is derived, not independently measured. Fine if last audit is real; stale if audits are blocked. | Show “based on audit {date}”; do not imply continuous monitoring on Free/Pro. |
| Usage meters | ✅ VERIFIED REAL | `GET /api/usage` → `usage_events` + `plan_catalog` | Live DB: **3** `usage_events`. Quota RPC `try_consume_usage_quota` is service-role only. | Real accounting when events are written. | Local `NODE_ENV!==production` **skips audit quota** (`shouldSkipUsageQuotaCheck`) — never point local dev at prod DB. |
| Billing plan display | ⚠️ PARTIAL | UI prices from `PLAN_PRICES`; entitlements from `plan_catalog` + `subscriptions` | Live `plan_catalog` matches code: Free 0 / Pro 399–3990 / Business 999–9990 EGP; 3/50/200 audits; 0/100/400 AI gens; 1/5/15 stores. **0 subscriptions, 0 billing_events, 2 workspaces all `free`.** | Catalog is real. No customer has ever paid in this database. | Configure Kashier; run a real test charge. |
| AI Studio copy | ⚠️ PARTIAL | `POST /api/generate` → crawl → Gemini; page fallback only if Gemini **unset** | `src/app/api/generate/route.ts` refuses to sell page-scrape as Gemini when the key exists (502 `GEMINI_FAILED`). Production Redis 429 blocks the route. | Correct fail-closed for copy gen; unavailable in prod today. | Set Redis; keep fail-closed. |
| Marketing testimonials / sample scores | ✅ VERIFIED REAL (honest empty) | Copy says no fabricated scores | `hero.preview.sampleNote`, `testimonials.placeholder.*` | Good. | — |
| Affiliate 30% recurring | ❌ MOCK/FAKE | Marketing page only; **no affiliate tables/API** | Production `/affiliate` 200. Source is a static perk list. Local uncommitted change deletes the page. | False commercial promise. | Remove until a real program exists, or noindex + “coming soon” with no commission %. |
| `/status` and `/changelog` | ❌ MOCK/FAKE (thin placeholders) | Static “not enabled yet” | Production 200. Intentionally excluded from sitemap, still linked in footer, still `Allow: /`. | Thin indexable pages. | 404 or noindex until real content (local uncommitted work already 404s them). |
| Checkout demo activation | ⚠️ PARTIAL | `POST /api/checkout` demo **only** when Kashier unset **and** `NODE_ENV !== "production"` | `src/app/api/checkout/route.ts` lines 57–82. Production returns 503, not a fake paid plan. | Production is fail-closed (good). Local + prod Supabase can still activate paid plans without payment. | Never use production service-role from `next dev`. |
| Report `demoMode` flag | ⚠️ PARTIAL | `demoMode = row.model === "demo" \|\| !GEMINI_API_KEY` | `hydrateStoredAudit` in `audit-repository.ts`. Heuristic run with key present is **not** marked demo. | Fake-AI presented as Gemini. | Set `model`/`demoMode` from the **actual** analyzer source. |

---

## E. Crawl & Analyzer reality matrix

**Pipeline (verified in source):**

`POST /api/audit` → `assertSafePublicHttpUrl` (SSRF) → `crawlWithFallback` → save `audit_pages` → `runAudit` (GEO local + Gemini/heuristics for conversion/SEO/trust) → `analyzeGeo` → `persistAuditResults`.

| Step | Status | File / function | Evidence | Notes / fix |
|---|---|---|---|---|
| User URL used as crawl target | ✅ VERIFIED REAL | `src/app/api/audit/route.ts` `runAuditPipeline` | `crawlWithFallback(primaryUrl)` | Single URL scrape, not whole-site crawl. |
| SSRF protection | ✅ VERIFIED REAL | `src/lib/url-safety.ts` | Blocks loopback, RFC1918, link-local, metadata hosts; DNS resolve before fetch. Unit tests 18/18. Authenticated e2e SSRF test **skipped** (no `E2E_USER_*`). | Run e2e with credentials before launch. |
| Firecrawl | ✅ VERIFIED REAL | `src/lib/firecrawl.ts` `crawlWithFallback` | Live `POST https://api.firecrawl.dev/v1/scrape` with markdown+html+screenshot. DB `crawl_provider=firecrawl` on 4/4 completed audits. Production `/api/status` gemini+firecrawl configured. | 45s timeout; credits 402 → HTTP fallback. |
| HTTP fallback | ⚠️ PARTIAL | `fetchPageFallback` | Real HTML fetch with SSRF-safe client; Cloudflare challenge pages discarded. Used when Firecrawl missing/fails. | Fallback HTML can be thinner than Firecrawl; still real content, not a canned store. |
| Site-wide crawl / pagination | ❌ BROKEN (vs marketing “website crawl”) | Firecrawl body `onlyMainContent: true`, **one URL** | No link-following, no sitemap crawl of the merchant site. Store Health is latest audit compose. | Rename “website crawl” to “page scrape”, or add bounded multi-page crawl on Business. |
| Conversion / SEO / Trust | ⚠️ PARTIAL | `runBatchedPillarAnalysis` | Uses crawled markdown/structured data. If Gemini configured: one Gemini call; **on any failure, `heuristicBatchedPillarAnalysis(page)`**. Heuristics still read the page. | Label source. Do not stamp `model=getGeminiModelId()` on heuristic success (`persistAuditResults`). |
| GEO | ✅ VERIFIED REAL (as rules on crawled HTML) | `analyzeGeo` | Uses FAQ/schema/headings/word count from the page. | Not a live ChatGPT query. |
| Empty / blocked URL | ✅ VERIFIED REAL | `runAuditPipeline` | `markAuditFailed` + `releaseUsageQuota` if `product` is null. | Good. |
| Timeouts | ✅ VERIFIED REAL | Firecrawl 45s, fallback 20s, `maxDuration=300` | AbortSignal.timeout | Good. |
| Production **new** crawl | ❌ BROKEN | `checkRateLimit` | Redis unset → production returns `success: false` → **429** before crawl. | Set Upstash env on Vercel **Production**. |
| Proof crawled content is used | ✅ VERIFIED REAL | `audit_pages.normalized_markdown` | Non-trivial lengths; analyzers consume `NormalizedPage.markdown` / `structuredData`. | Historical runs only. |

**Analyzer classification**

| Analyzer | Uses crawled page? | Provider | Status |
|---|---|---|---|
| GEO | Yes | Local rule engine | ✅ VERIFIED REAL (rules) / ❌ MOCK as ChatGPT/Perplexity APIs |
| Conversion | Yes | Gemini **or** heuristics | ⚠️ PARTIAL |
| SEO | Yes | Gemini **or** heuristics | ⚠️ PARTIAL |
| Trust (incl. mada/tabby/tamara/COD regex) | Yes | Gemini + local payment/shipping enrich | ⚠️ PARTIAL |
| Recommendations | Yes | Gemini list + module recs; heuristic fill | ⚠️ PARTIAL |
| Competitor compare | Yes, second URL | Same pipeline; **Pro+ gated** | ⚠️ PARTIAL (gated; Free onboarding competitor URL is dropped) |

---

## F. AI Provider reality matrix

| Provider | Real SDK/API in repo? | Key required? | Actually called? | Input | Crawled evidence sent? | Used in report? | Fake/fallback? | Status |
|---|---|---|---|---|---|---|---|---|
| **Google Gemini** | Yes `@google/generative-ai` | `GEMINI_API_KEY` (`isGeminiConfigured`) | Yes `generateContent` | Batched pillar JSON prompt + sanitized title/url/markdown/structuredData | Yes (truncated markdown) | Yes when call succeeds | On missing key: heuristics, `demoMode`. On **call failure with key present**: heuristics **without** demoMode; `model` still Gemini id | ⚠️ PARTIAL |
| **ChatGPT / OpenAI** | **No** `openai` package, no `api.openai.com` | N/A | **Never** | N/A | N/A | UI bars only | Heuristic readability | ❌ MOCK/FAKE |
| **Perplexity** | **Never called** | N/A | **Never** | N/A | N/A | UI bars only | Heuristic readability | ❌ MOCK/FAKE |
| **Google AI Overviews** | Not a Google Ranking API | N/A | **Never** | N/A | N/A | UI bar | Heuristic | ❌ MOCK/FAKE |
| AI Studio (`/api/generate`) | Gemini | Yes for non-demo | Yes when Redis+auth+Pro allow | Page scrape + copy prompt | Yes | Stored in `ai_generations` | Page source only if Gemini unset; never billed as Gemini | ⚠️ PARTIAL (prod 429) |
| Weekly report summary | Gemini optional | Optional | `src/lib/weekly-report/ai-summary.ts` | Report stats | Indirect | Narrative; deterministic fallback if Gemini down | Fallback is labeled in types | ⚠️ PARTIAL |
| Alert email | Resend optional | `RESEND_*` | Alerts `channels.email: false` hardcoded | — | — | In-app only | “Email reserved — not implemented” | ❌ BROKEN as a promised channel |

**Never label ChatGPT or Perplexity as “integrated.”** They are named in copy, FAQ, JSON-LD `featureList`, and GEO UI. There is no API client.

---

## G. Subscription/Billing verification matrix

**Price/limit comparison (code vs live `plan_catalog`) — MATCHED**

| Plan | Monthly EGP | Yearly EGP | Audits | AI gens | Stores | Features |
|---|---|---|---|---|---|---|
| free | 0 / 0 | 0 / 0 | 3 / 3 | 0 / 0 | 1 / 1 | competitor/AI/monitor/alerts all false |
| pro | 399 / 399 | 3990 / 3990 | 50 / 50 | 100 / 100 | 5 / 5 | competitor+AI true; monitoring/alerts/api false |
| business | 999 / 999 | 9990 / 9990 | 200 / 200 | 400 / 400 | 15 / 15 | all true including `api` |

Sources: `src/lib/billing/plans.ts`, migration `20260820200000_update_plan_catalog_pricing.sql`, live SQL on project `sluvcfoxbyunsveripqc`.

| Flow | Status | Evidence | Gap |
|---|---|---|---|
| Plan definitions | ✅ VERIFIED REAL | Code + DB + pricing UI (browser: 0 / 399 / 999 EGP) | — |
| Kashier checkout | ❌ BROKEN (production) | `/api/status` missing API key + secret. Unauth `POST /api/checkout` → **401**. After login, `isKashierConfigured()` false → **503** (not demo). | Set `KASHIER_API_KEY`, `KASHIER_SECRET_KEY`, explicit `KASHIER_MODE=live` or `test`, webhook URL `{APP}/api/webhook/kashier`. |
| Demo checkout | ⚠️ PARTIAL | Allowed only non-production | Dangerous if local app uses production Supabase. |
| Webhook HMAC | ✅ VERIFIED REAL (code) | `verifyWebhookSignature`; 401 on bad sig; 422 if success without orderId | ❓ NOT VERIFIABLE live — 0 `billing_events`. |
| Amount → plan map | ✅ VERIFIED REAL | `mapAmountToPlan` 399/3990/999/9990 | Prefer amount over orderId on mismatch (good). |
| Entitlements | ✅ VERIFIED REAL (code + tests) | Server 403 codes for competitor, AI, monitoring, alerts, store limit | Production cannot exercise paid gates (everyone Free). |
| Quotas | ✅ VERIFIED REAL (SQL) | Advisory lock + insert in `try_consume_usage_quota`; EXECUTE only `service_role`/`postgres` | Non-prod skips **audit** quota. |
| FREE → PRO | ❌ BROKEN | UI: Pro CTA → `/auth?next=/checkout?plan=pro&period=monthly` **verified in browser**. After auth, Kashier missing. | Configure Kashier; test real payment. |
| PRO → BUSINESS | ❓ NOT VERIFIABLE | Same checkout path | No paid rows. |
| BUSINESS → expired → FREE | ⚠️ PARTIAL | Lazy downgrade in `getPlanForWorkspace` when `current_period_end` passed | No cron expiry; no auto-renew. Period is `now+30/365` days on activate — **one-shot**, not a Kashier recurring subscription object. |
| Failed payment | ⚠️ PARTIAL | `failureUrl=/checkout?...&error=payment_failed` toast | Never observed live. |
| Cancellation | ❌ BROKEN | Pricing copy “إلغاء في أي وقت”. **No cancel API**, no Kashier void, billing UI has no cancel. Expired paid sub marked `canceled` only on lazy expiry. | Implement cancel + webhook; stop advertising cancel-anytime until true. |
| Renewal | ❌ BROKEN | No recurring charge handler beyond “pay again via checkout” | Document one-time periods or implement recurring. |
| Server-side enforcement | ✅ VERIFIED REAL | Feature flags from DB catalog; `workspaces_protect_plan_id` trigger blocks client `plan_id` updates | App uses **service role** for writes (RLS is not the write firewall). |
| UI billing | ⚠️ PARTIAL | `/settings/billing` reads `/api/usage`; “no payment method”; invoices from `billing_events` (empty) | “Renews on” is **usage period end-of-month**, not Kashier renewal. Misleading. |
| Unauthorized Pro features | ✅ VERIFIED REAL (code) | 403 + lock codes | e2e competitor test skipped; also expects wrong code `COMPETITOR_LOCKED` vs API `COMPETITOR_MONITORING_LOCKED` (**TEST BUG**). |

**Live commercial state:** 0 subscriptions, 0 billing events, 2 workspaces on `free`. Nobody has completed a paid conversion in this database.

---

## H. SEO & Indexing score — **71 / 100**

### Live production checks

| Asset | Result | Status |
|---|---|---|
| `https://www.convaudit.com/robots.txt` | 200. `Allow: /`, disallow `/api/` + private prefixes, `Host: https://www.convaudit.com`, sitemap URL | ✅ VERIFIED REAL |
| `https://www.convaudit.com/sitemap.xml` | **200** via curl (2 319 bytes, canonical www URLs including `/affiliate`). One WebFetch attempt returned 500 — treat as **flake / client difference**, not a standing outage | ⚠️ PARTIAL |
| Homepage canonical / OG / Twitter | `canonical` + `og:url` = `https://www.convaudit.com`; `og:locale=ar_EG`; `twitter:card=summary_large_image`; OG image 1200×630 200 | ✅ VERIFIED REAL |
| JSON-LD | `@graph`: Organization, WebSite, SoftwareApplication + Offer (0/399/999 EGP), FAQPage | ✅ VERIFIED REAL |
| Breadcrumb JSON-LD | Not emitted | ⚠️ PARTIAL |
| Product schema | SoftwareApplication + Offer, not `Product` | ⚠️ PARTIAL (acceptable for SaaS) |
| hreflang | Arabic-only site, no hreflang set | ⚠️ PARTIAL (OK if no EN locale; do not imply multilingual) |
| Google verification | `google-site-verification` meta present | ✅ VERIFIED REAL (token exists; Search Console ownership ❓) |
| `llms.txt` | 200; still lists `/affiliate` on production | ⚠️ PARTIAL |
| 404 | `/not-a-real-page-xyz` → 404; unknown blog slug 404 (e2e + live) | ✅ VERIFIED REAL |
| Apex `https://convaudit.com/` | **200 HTML, no 301/308 to www** | ❌ BROKEN (duplicate host) |
| `/dashboard` unauthenticated | 307 → `/auth?next=/dashboard` + `X-Robots-Tag: noindex, nofollow` | ✅ VERIFIED REAL |
| Auth pages | `privatePageMetadata()` noindex; **document title still the marketing homepage title** | ⚠️ PARTIAL |
| Private apps | robots + header noindex + middleware gate | ✅ VERIFIED REAL |
| Thin public pages | `/status`, `/changelog` 200 placeholders; `/affiliate` 200 with commission claims | ❌ BROKEN for quality |
| Internal linking | Footer + pricing + blog; uncommitted local work removes bad footer targets | ⚠️ PARTIAL |
| Crawlability | Public HTML is SSR/static enough for Google; `lang=ar` `dir=rtl` | ✅ VERIFIED REAL |
| Core Web Vitals | Many JS chunks, GA `G-MDR2NP5CJ3`, Framer Motion, client pricing/auth | ⚠️ PARTIAL (risk, not measured with CrUX here) |
| Images | `next/image` avif/webp; remote `hostname: **` | ⚠️ PARTIAL (broad remote pattern) |
| Heading hierarchy | Auth page has **two `h1`s** (marketing + “تسجيل الدخول”) | ⚠️ PARTIAL |
| CSP | Production CSP includes `'unsafe-inline'` scripts (GA) | ⚠️ PARTIAL (SEO-neutral, security-relevant) |

**Can Google crawl and index public pages?** **Yes, with caveats.** robots.txt allows `/`, sitemap lists canonical www URLs, homepage is indexable with solid metadata. Risks: apex duplicate, thin `/status` `/changelog`, affiliate claims, sitemap flake, no BreadcrumbList.

---

## I. Production infrastructure score — **32 / 100**

| Item | Status | Evidence |
|---|---|---|
| Vercel project | ✅ VERIFIED REAL | Project `convaduit` (`prj_yMbHeWxDAAqwqH9mugvPp6wQv9gc`), domains `convaudit.com` + `www.convaudit.com`. Team plan **Hobby**. Production deployment SHA `7e70234`. Latest deployment is a Speed Insights **preview**, not production. |
| `NEXT_PUBLIC_APP_URL` | ✅ VERIFIED REAL | Canonicals/robots/sitemap use www. |
| Supabase | ✅ VERIFIED REAL | Project `convaduit` / `sluvcfoxbyunsveripqc`, `ACTIVE_HEALTHY`, EU. Auth used by middleware. |
| Redis | ❌ BROKEN | Missing on production status; `checkRateLimit` fail-closed. |
| Firecrawl | ✅ VERIFIED REAL (key present) | Status + historical crawls. |
| Gemini | ✅ VERIFIED REAL (key present) | Status + `model=gemini-2.0-flash` on stored audits (env override vs code default `gemini-3.5-flash-lite`). |
| Kashier | ❌ BROKEN | Missing API key + secret on production. |
| `CRON_SECRET` | ❓ NOT VERIFIABLE | Unauthenticated cron → 401 (correct). Does not prove the secret is set. Vercel Hobby allows the 2 crons in `vercel.json`. If secret unset, production cron **always 401** (`authorizeCronRequest`). |
| Webhook URL | ⚠️ PARTIAL | Code uses `/api/webhook/kashier` (+ legacy `/api/webhooks/kashier`). Dashboard config ❓ |
| CORS | ⚠️ PARTIAL | Static assets `Access-Control-Allow-Origin: *`. APIs are same-origin cookie auth. |
| CSP | ⚠️ PARTIAL | See security. |
| Logging | ⚠️ PARTIAL | `console.error` on API failures; no evidence of PII redaction policy in logs. `/api` and `/api/status` **publicly list missing secret names**. |
| Node | ⚠️ PARTIAL | Vercel `nodeVersion: 24.x`; README says 22+. Build succeeded locally on current toolchain. |

---

## J. Security score — **64 / 100**

| Control | Status | Evidence / fix |
|---|---|---|
| Auth on mutating/data APIs | ✅ VERIFIED REAL | `requireApiUser` → 401. Live: dashboard 401, audit POST 401, generate 401, checkout 401. |
| GET `/api/audit` docs | ⚠️ PARTIAL | 200 unauthenticated API map — low risk. |
| GET `/api` + `/api/status` | ❌ BROKEN | Public enumeration of **which secrets are missing**. Attackers learn Kashier/Redis are down. **Fix:** remove missing-var names from public JSON; protect `/api/status` with `CRON_SECRET` or admin. |
| SSRF | ✅ VERIFIED REAL (code) | Strong IP/DNS checks. Live authenticated probe skipped. |
| RLS | ✅ VERIFIED REAL | All 25 public tables `rowsecurity=true`. Client policies are **SELECT** (and profile insert/update, workspace update). Pipeline **writes dropped** for authenticated role. |
| Service role | ⚠️ PARTIAL | All server repos use admin client. Isolation is **application filters** (`getAuditByIdForUser` membership/created_by). A missed `.eq` would be a full-table read. |
| `plan_id` escalation | ✅ VERIFIED REAL | Trigger `workspaces_protect_plan_id` blocks authenticated/anon column change. |
| Quota RPC | ✅ VERIFIED REAL | EXECUTE not granted to `authenticated`/`anon`. |
| SECURITY DEFINER helpers | ⚠️ PARTIAL | Supabase advisor: `is_workspace_member` / `has_workspace_role` executable by `authenticated` (needed for RLS). Intentional. |
| Leaked-password protection | ❌ BROKEN | Advisor: HaveIBeenPwned **disabled**. Enable in Auth settings. |
| Cron | ✅ VERIFIED REAL | 401 without bearer. |
| Headers | ✅ VERIFIED REAL | HSTS, nosniff, frame SAMEORIGIN, COOP, Permissions-Policy. |
| CSP | ⚠️ PARTIAL | `'unsafe-inline'` scripts (GTM). |
| Rate limit | ❌ BROKEN in prod | Intended 10/100/1000 per hour; **all denied** without Redis. |
| IDOR | ✅ VERIFIED REAL (code) | Audit get/delete membership-checked. |
| Onboarding gate | ✅ VERIFIED REAL | Audit POST 403 `ONBOARDING_REQUIRED`. |

---

## K. UI/UX functional score — **54 / 100**

Browser + HTTP (production unless noted):

| Flow | Result | Status |
|---|---|---|
| Homepage | Loads, Arabic RTL, CTAs to audit/auth, no fabricated numeric hero scores | ✅ VERIFIED REAL |
| Pricing | 0 / 399 / 999 EGP; monthly/yearly toggle | ✅ VERIFIED REAL |
| Pro subscribe (logged out) | Disables button during `getUser` (~2.5s), then `/auth?next=/checkout?plan=pro&period=monthly` | ✅ VERIFIED REAL |
| Auth | Google + email/password + signup + forgot-password control present. Duplicate h1. Title = marketing default | ⚠️ PARTIAL |
| Signup / login / onboarding | e2e: auth fields + invalid password rejected. Full signup **not** executed (would create users) | ❓ NOT VERIFIABLE |
| Connect store / audit / report | Code + historical DB real; **new production audit 429** | ❌ BROKEN now / ✅ historical |
| History / AI Studio / usage / settings | Wired to APIs; blocked by auth then Redis/plan | ❓ NOT VERIFIABLE live |
| Upgrade after login | Checkout page exists; Kashier 503 | ❌ BROKEN |
| Logout | `signOut` → `/` in topbar | ⚠️ PARTIAL (not clicked live) |
| Protected routes | Dashboard 307 to auth | ✅ VERIFIED REAL |
| Empty / loading / error | Dashboard skeletons + `ApiLoadError` | ✅ VERIFIED REAL (code) |
| Search | Navigates to history — **not a no-op** | ✅ VERIFIED REAL |
| Dead/misleading | Affiliate commission; cancel-anytime; status/changelog placeholders; “renews on” = calendar month | ❌ MOCK/FAKE / ⚠️ |
| Mobile | Pricing/auth usable in a11y snapshot; no dedicated mobile viewport pass this session | ❓ NOT VERIFIABLE |
| Alerts email | API returns `email: false` | ❌ BROKEN vs Business copy |

---

## L. API score — **58 / 100**

Enumerated routes (`src/app/api/**/route.ts`) and live probes:

| Route | Auth | Plan gate | Live unauth | Notes |
|---|---|---|---|---|
| `GET /api` | No | — | 200 | Leaks missing integration names |
| `GET /api/status` | No | — | 200 `demoMode:true` | **P0 disclosure** |
| `POST /api/audit` | Yes | quota, store, competitor | 401 | Redis 429 if authed on prod |
| `GET /api/audit` | No | — | 200 docs | |
| `GET/DELETE/POST /api/audit/[id]` | Yes | report preview by plan | ❓ | IDOR checks in repo |
| `GET /api/audits` | Yes | — | ❓ | |
| `GET /api/dashboard` | Yes | — | 401 | Real DB |
| `GET /api/usage` | Yes | — | ❓ | |
| `GET /api/shell` | Yes | — | ❓ | |
| `GET /api/store-health` | Yes | — | ❓ | Derived |
| `GET /api/geo-tracking` | Yes | — | ❓ | From `geo_score_history` |
| `POST /api/generate` | Yes | AI feature + quota | 401 | Redis 429 on prod |
| `POST /api/checkout` | Yes | — | 401 | Then 503 Kashier |
| `POST /api/webhook/kashier` | HMAC | — | ❓ | Dual path `/api/webhooks/kashier` |
| `GET/PATCH /api/onboarding` | Yes | — | ❓ | |
| `GET/PATCH /api/profile` | Yes | — | ❓ | |
| `GET /api/oauth/google` | Redirect | — | ❓ | |
| `GET /api/alerts` | Yes | Business `automatedAlerts` | ❓ | |
| `GET /api/weekly-report` | Yes | Business `weeklyMonitoring` | ❓ | |
| `GET /api/competitor-monitor` | Yes | Business `competitorMonitoring` | ❓ | |
| `GET /api/growth-tasks` | Yes | — | ❓ | From stored recs |
| `GET /api/notifications` | Yes | — | ❓ | |
| `GET /api/cron/*` | CRON_SECRET | — | 401 | |
| `GET /api/cron/automation/[jobId]` | Cron + `AUTOMATION_ENABLED` default off | — | ❓ | Keep off |

**Not fully matrix-tested (DB down, third-party timeout, quota exceeded, wrong workspace):** unit tests cover many cases; live production could not reach quota/plan-exceeded because audits cannot start.

Malformed checkout JSON (shell escaping) produced **500** `"فشلت عملية الدفع"` — catch-all, not 400. Minor.

---

## M. Database / RLS score — **76 / 100**

| Check | Status | Evidence |
|---|---|---|
| Migrations | Present (21 files) | Engine, onboarding, quota, plan lock, weekly reports, competitor, growth tasks, notifications, alerts, Arabic locale, write locks |
| FKs / indexes | ⚠️ PARTIAL | Verbose table dump shows PKs/FKs on core entities; not every index reviewed line-by-line |
| RLS enabled | ✅ VERIFIED REAL | All public tables |
| Workspace isolation | ✅ VERIFIED REAL (read path) | `is_workspace_member` in policies; server filters membership |
| User isolation | ✅ VERIFIED REAL | `profiles` own-row; audits via membership or `created_by` |
| Unique / catalog | ✅ VERIFIED REAL | `plan_catalog` ids free/pro/business |
| Usage accounting | ✅ VERIFIED REAL | Atomic RPC + 3 events exist |
| Subscription consistency | ⚠️ PARTIAL | No paid rows to contradict; lazy expiry exists; no unique “one active sub per workspace” verified in this pass |
| Orphans | ❓ NOT VERIFIABLE | Cascades claimed on audit delete |
| Dangerous service-role | ⚠️ PARTIAL | By design; blast radius is app bugs |
| Advisor | ⚠️ PARTIAL | Leaked passwords off; definer EXECUTE on membership helpers |

---

## N. Test results

| Command | Result | Classification |
|---|---|---|
| `npm run typecheck` | **PASS** (exit 0) | — |
| `npm run lint` | **PASS** (exit 0) | — |
| `npm run build` | **PASS** | Next 16.2.10 Turbopack. Warning: middleware → `proxy` deprecation. Local build **omits** `/affiliate` `/changelog` `/status` (uncommitted deletions). Production still has them. |
| `npm test` (Vitest) | **430 passed, 2 failed** (73 files, 1 failed) | See below |
| `npx playwright test --project=ci` | **10 passed, 2 skipped** | Skips need `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` |
| Smoke e2e (`E2E_SMOKE`) | Not run | Needs live merchant credentials |

### Vitest failures

**File:** `src/lib/billing/entitlements.test.ts`

1. `rejects ensureWorkspaceStore for a bypass-inserted store via decideStoreEnsure` — **timeout 5000ms**  
2. `POST /api/audit returns 403 STORE_LIMIT_REACHED` — got **500**, mock error `Unexpected table in integration mock: workspace_members`

**Classification: TEST BUG** (incomplete Supabase mock). `ensurePersonalWorkspace` now reads `workspace_members`; mock only allows `stores`.  
**Not** proof that production store-limit logic is wrong — `decideStoreEnsure` unit tests still pass.

### Playwright skips

- SSRF authenticated audit — **ENVIRONMENT** (no e2e user)
- Competitor monitor 403 — **ENVIRONMENT** + likely **TEST BUG** (`COMPETITOR_LOCKED` vs `COMPETITOR_MONITORING_LOCKED`)

Passing tests **do not** prove production Redis/Kashier.

---

## O. Critical bugs (P0)

1. **Production audits and AI Studio denied (Redis missing)**  
   - **File:** `src/lib/redis.ts` `checkRateLimit`; `src/app/api/audit/route.ts`; `src/app/api/generate/route.ts`  
   - **Evidence:** live `/api/status` missing Upstash vars; production fail-closed returns 429.  
   - **Impact:** Core product unusable on www.  
   - **Fix:** Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` on Vercel Production; confirm with an authenticated `POST /api/audit`.

2. **Production payments impossible (Kashier keys missing)**  
   - **File:** `src/lib/env.ts`, `src/app/api/checkout/route.ts`, `src/lib/kashier.ts`  
   - **Evidence:** status missing `KASHIER_API_KEY`, `KASHIER_SECRET_KEY`; 0 subscriptions.  
   - **Impact:** Cannot leave Free. Marketing prices are a lie in production.  
   - **Fix:** Install live/test Kashier keys, `KASHIER_MODE`, webhook secret, dashboard webhook URL; one real (or sandbox) payment.

3. **Public status API discloses missing secrets**  
   - **File:** `src/app/api/status/route.ts`, `src/app/api/route.ts`  
   - **Evidence:** anonymous GET returns `missing: ["KASHIER_API_KEY", ...]`.  
   - **Impact:** Recon + confirmation the shop cannot charge or rate-limit.  
   - **Fix:** Strip `missing` from public responses; auth-gate status.

4. **Gemini failure labeled as Gemini success**  
   - **File:** `src/lib/gemini.ts` `runBatchedPillarAnalysis` catch → heuristics; `assembleAuditData(..., !isGeminiConfigured())`; `persistAuditResults` `model: getGeminiModelId()` if key exists  
   - **Impact:** Heuristic scores/recommendations shown as AI.  
   - **Fix:** Thread `source: "gemini" | "rule_engine"` through persist + UI `demoMode`.

---

## P. High-priority bugs (P1)

1. ChatGPT / Perplexity / Google AI presented as measured engines (`geo-analyzer.ts` + report UI + FAQ).  
2. No cancellation, no recurring billing, “cancel anytime” on pricing.  
3. Apex `convaudit.com` serves 200 duplicate of www (no redirect).  
4. Affiliate page promises 30% recurring with no backend.  
5. Indexable placeholder `/status` and `/changelog`.  
6. Auth document title is the marketing homepage title; dual `h1`.  
7. Billing “renews on” is month-end usage window, not a subscription anniversary.  
8. Local `NODE_ENV!==production` skips store limits **and** audit quota while using the same Supabase — can pollute prod data (4 Firecrawl audits likely from this path).  
9. HaveIBeenPwned leaked-password protection disabled.  
10. Business alert **email** channel hardcoded false.  
11. Single-page scrape sold as full website crawl.  
12. `CRON_SECRET` presence unknown; Business weekly/competitor jobs may never run.

---

## Q. Medium / low issues

- CSP `'unsafe-inline'` + GA.  
- Next 16 middleware deprecation (`proxy`).  
- Broad `images.remotePatterns` `hostname: **`.  
- GET `/api/audit` unauthenticated docs.  
- Checkout JSON parse errors → 500 not 400.  
- No BreadcrumbList JSON-LD.  
- Hobby Vercel plan (cron/analytics limits).  
- Speed Insights installed on a **preview** branch, not production.  
- Entitlement integration tests timeout / 500 (**TEST BUG**).  
- Playwright competitor test expected lock code mismatch (**TEST BUG**).  
- `NEXT_PUBLIC_DEV_UNLOCK_ALL` in `.env.example` appears **unused** in `src/` (dead config).  
- Uncommitted local 404s for affiliate/changelog/status vs production still 200 — **deploy drift**.

---

## R. Exact root cause for every critical issue

| # | Root cause |
|---|---|
| 1 | `checkRateLimit` returns `{ success: false }` whenever Upstash env is empty **and** `NODE_ENV==="production"`. Vercel Production has those env vars unset (proven by `/api/status`). Audit/generate run this check **before** crawl/AI. |
| 2 | `isKashierConfigured()` requires merchant id **and** `KASHIER_API_KEY`. Status shows API key + secret missing. Production branch of checkout **does not** demo-activate; it 503s. |
| 3 | `getAllServices()` is exposed on unauthenticated GET handlers by design. |
| 4 | Failure path in `runBatchedPillarAnalysis` returns `heuristicBatchedPillarAnalysis` but `runAudit` still passes `demoMode=!isGeminiConfigured()` (false if key exists). Persist writes Gemini model id from env, not from the successful provider. |

---

## S. Exact recommended fix

1. **Vercel Production env:** Upstash URL+token; Kashier merchant, API key, secret, webhook secret, `KASHIER_MODE`; confirm `CRON_SECRET`; never commit values.  
2. **Re-test:** authenticated audit of a public shop; confirm `audit_pages` row + Firecrawl source; confirm Gemini `usageMetadata` stored; checkout sandbox payment → `subscriptions` row + `billing_events`.  
3. **Lock public `/api/status`.** Return `{ ok: true }` only, or require secret.  
4. **Analyzer provenance:** persist `pillar_source` / `demoMode` from the actual branch (Gemini vs heuristic). UI banner when `rule_engine`.  
5. **SEO:** 308 `convaudit.com` → `www.convaudit.com`; noindex or 404 thin pages; remove affiliate commissions until real.  
6. **Billing product:** implement cancel; rename “renews”; stop “cancel anytime” until Kashier supports it.  
7. **Copy:** GEO bars ≠ ChatGPT API.  
8. **Fix tests:** mock `workspace_members`; align e2e lock codes; add e2e user.  
9. **Auth:** enable leaked-password protection.  
10. **Process:** do not run `next dev` against production service role.

---

## T. P0 / P1 / P2 roadmap

### P0 (launch blockers) — days, not weeks

- [ ] Set Redis; prove `POST /api/audit` ≠ 429  
- [ ] Set Kashier; prove checkout URL + webhook activation  
- [ ] Remove secret names from public `/api` `/api/status`  
- [ ] Stop labeling heuristic audits as Gemini  

### P1 — before paid ads / GSC push

- [ ] Relabel GEO engines  
- [ ] Apex → www redirect  
- [ ] Kill or noindex affiliate/status/changelog (or finish real content)  
- [ ] Cancel + honest renewal copy  
- [ ] Enable HIBP passwords  
- [ ] Confirm cron secret + one Business job dry-run  
- [ ] Fix entitlement + e2e tests; add E2E user  

### P2 — quality

- [ ] Multi-page crawl if marketed  
- [ ] Breadcrumb JSON-LD; auth title  
- [ ] CSP nonce vs unsafe-inline  
- [ ] Email alerts or remove from Business card  
- [ ] Middleware `proxy` migration  
- [ ] Promote Speed Insights to production only after review  

---

## Appendix — What this audit did **not** do

- Did not create production users or place a real card charge.  
- Did not dump customer URLs or page HTML from `audit_pages`.  
- Did not print secret values (only **presence** via public `/api/status`).  
- Did not treat uncommitted local 404s as already deployed.  
- Did not run TestSprite codegen (would write files).  
- Authenticated merchant journey (onboarding → audit → report → upgrade) is **incomplete** on production because of P0 Redis/Kashier.

**Bottom line:** The repository contains a serious audit engine and a serious billing design. Production is missing the two services that make “real customer, real crawl, real AI, real money” true **at the same time**. Until those are verified with a live audit and a live payment, ConvAudit is **not production-ready**.
