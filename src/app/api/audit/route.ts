import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  crawlWithFallback,
  FIRECRAWL_NOT_CONFIGURED_MESSAGE,
  isFirecrawlConfigured,
} from "@/lib/firecrawl";
import { isGeminiConfigured, runAudit, type AnalyzerName } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/redis";
import { requireApiUser } from "@/lib/auth/require-api-user";
import {
  createAuditRecord,
  ensurePersonalWorkspace,
  ensureWorkspaceStore,
  finishAnalysisRun,
  markAuditFailed,
  persistAuditResults,
  recordUsageEvent,
  releaseUsageQuota,
  saveAuditPage,
  startAnalysisRun,
  tryConsumeUsageQuota,
  updateAuditStatus,
} from "@/lib/db/audit-repository";
import { getCurrentUsagePeriod, getPlanForWorkspace } from "@/lib/db/workspace-stats";
import { auditLimitReachedMessage } from "@/lib/billing/quota";
import {
  competitorLockedMessage,
  ENTITLEMENT_CODES,
  isPlanFeatureEnabled,
  storeLimitReachedBody,
} from "@/lib/billing/entitlements";
import { emitSubscriptionWarningNotification } from "@/lib/notifications/emit";
import type { AnalyzerJsonResult } from "@/lib/db/types";
import type { AuditData } from "@/lib/types";
import { assertSafePublicHttpUrl } from "@/lib/url-safety";
import { analyzeGeo } from "@/lib/audit/geo-analyzer";
import { applyGeoAnalysisToAudit } from "@/lib/audit/scoring";
import { applySiteIntegrationsToAudit, runSiteIntegrations } from "@/lib/integrations";
import {
  AUDIT_ERROR_CODES,
  formatFailedAuditMessage,
  mapUnknownAuditError,
  type AuditStage,
} from "@/lib/audit/pipeline-error";
import { auditRequestHeaders, getAuditRequestId, logAuditStage } from "@/lib/audit/request-id";
import {
  getOnboardingState,
  toAnalyzerOnboarding,
  type OnboardingState,
} from "@/lib/db/onboarding-repository";
import { normalizeAppLocale } from "@/lib/locale";
import type { OnboardingAnswers } from "@/lib/types";
import {
  loadTestSignalFromHeaders,
  resolveLoadTestMode,
} from "@/lib/load-test/mode";
import { buildLoadTestNormalizedPage } from "@/lib/load-test/mock-page";

/** Allow crawl + Gemini + persist to finish inside `after()` on Vercel. */
export const runtime = "nodejs";
export const maxDuration = 300;

const OptionalHttpUrl = z.string().url().optional().or(z.literal(""));

const Body = z
  .object({
    productUrl: OptionalHttpUrl,
    storeUrl: OptionalHttpUrl,
    competitorUrl: OptionalHttpUrl,
    onboarding: z.record(z.string(), z.string()).optional(),
    /** Reserved for future locale variants (e.g. `ar-gulf`); output is always Arabic today. */
    locale: z.enum(["ar"]).optional(),
  })
  .superRefine((data, ctx) => {
    const hasProduct = Boolean(data.productUrl?.trim());
    const hasStore = Boolean(data.storeUrl?.trim());
    if (!hasProduct && !hasStore) {
      ctx.addIssue({
        code: "custom",
        path: ["productUrl"],
        message: "أدخل رابط منتج أو رابط متجر على الأقل.",
      });
    }
  });

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}

function jsonError(
  requestId: string,
  input: {
    error: string;
    code: string;
    stage: AuditStage;
    status: number;
    extra?: Record<string, unknown>;
    headers?: HeadersInit;
  }
): NextResponse {
  console.error("[api/audit] request failed", {
    requestId,
    stage: input.stage,
    code: input.code,
    error: input.error,
  });
  return NextResponse.json(
    {
      error: input.error,
      code: input.code,
      stage: input.stage,
      requestId,
      ...input.extra,
    },
    {
      status: input.status,
      headers: { ...auditRequestHeaders(requestId), ...input.headers },
    }
  );
}

async function validateCrawlUrl(label: string, raw: string): Promise<string | null> {
  const safe = await assertSafePublicHttpUrl(raw);
  if (!safe.ok) return `${label}: ${safe.reason}`;
  return null;
}

async function runAuditPipeline(input: {
  auditId: string;
  workspaceId: string;
  primaryUrl: string;
  resolvedStoreUrl: string | undefined;
  resolvedCompetitorUrl: string | undefined;
  storeId: string | null;
  storesLimit: number | null;
  onboarding: OnboardingAnswers | null;
  onboardingState: OnboardingState;
  usageEventId: string | null;
  useLoadTestMocks: boolean;
  requestId: string;
}): Promise<void> {
  const {
    auditId,
    workspaceId,
    primaryUrl,
    resolvedStoreUrl,
    resolvedCompetitorUrl,
    storeId,
    storesLimit,
    onboarding,
    onboardingState,
    usageEventId,
    useLoadTestMocks,
    requestId,
  } = input;

  let stage: AuditStage = "crawl";

  try {
    logAuditStage(requestId, "crawl", { auditId, urlHost: safeHost(primaryUrl) });
    await updateAuditStatus(auditId, "scraping");

    const emptyCompetitor = {
      page: null,
      errorCode: null,
      source: "none" as const,
    };

    const [productResult, competitorResult] = useLoadTestMocks
      ? [
          {
            page: buildLoadTestNormalizedPage(primaryUrl),
            errorCode: null,
            source: "load_test" as const,
          },
          resolvedCompetitorUrl
            ? {
                page: buildLoadTestNormalizedPage(resolvedCompetitorUrl),
                errorCode: null,
                source: "load_test" as const,
              }
            : emptyCompetitor,
        ]
      : await Promise.all([
          crawlWithFallback(primaryUrl),
          resolvedCompetitorUrl
            ? crawlWithFallback(resolvedCompetitorUrl)
            : Promise.resolve(emptyCompetitor),
        ]);

    const product = productResult.page;
    const competitor = competitorResult.page;

    if (!product) {
      const crawlMessage =
        productResult.errorMessage ||
        (productResult.errorCode === "NOT_CONFIGURED"
          ? FIRECRAWL_NOT_CONFIGURED_MESSAGE
          : productResult.errorCode === "BLOCKED_URL"
            ? "لا يمكن استخراج هذا الرابط."
            : "تعذّر الوصول إلى الصفحة، تحقق من الرابط.");
      const message = formatFailedAuditMessage({
        publicMessage: crawlMessage,
        requestId,
        stage: "crawl",
      });
      console.error("[api/audit] crawl failed", {
        requestId,
        auditId,
        errorCode: productResult.errorCode,
        source: productResult.source,
      });
      await markAuditFailed(auditId, message);
      if (usageEventId) await releaseUsageQuota(usageEventId);
      return;
    }

    logAuditStage(requestId, "crawl.ok", {
      auditId,
      source: productResult.source,
      errorCode: productResult.errorCode,
    });

    await saveAuditPage(auditId, "primary", product);
    if (competitor) await saveAuditPage(auditId, "competitor", competitor);

    stage = "analyze";
    logAuditStage(requestId, "analyze", { auditId });
    await updateAuditStatus(auditId, "analyzing");

    const runIds = new Map<AnalyzerName, string>();
    const outputLocale = normalizeAppLocale("ar");

    const audit = await runAudit(product, competitor, onboarding, {
      outputLocale,
      forceHeuristic: useLoadTestMocks,
      onAnalyzerStart: async (analyzer: AnalyzerName) => {
        const id = await startAnalysisRun(auditId, analyzer);
        if (id) runIds.set(analyzer, id);
      },
      onAnalyzerComplete: async (analyzer: AnalyzerName, result: AnalyzerJsonResult) => {
        const id = runIds.get(analyzer);
        if (id) await finishAnalysisRun(id, result);
      },
    });

    const geoAnalysis = analyzeGeo(product);
    const withGeo = applyGeoAnalysisToAudit(audit, geoAnalysis);
    const usedFallback = productResult.source === "fallback";
    const withMeta: AuditData = {
      ...withGeo,
      storeUrl: resolvedStoreUrl || withGeo.storeUrl,
      competitorUrl: resolvedCompetitorUrl || withGeo.competitorUrl,
      demoMode: useLoadTestMocks || (withGeo.demoMode ?? !isGeminiConfigured()),
      requestId,
      crawlMetadata: {
        source: productResult.source,
        scrapeMs: product.scrapeMs,
        pageType: product.pageType,
        imageCount: product.imageCount,
        contentHash: product.contentHash,
        warning:
          productResult.errorCode === "CREDITS"
            ? productResult.errorMessage
            : usedFallback && !isFirecrawlConfigured()
              ? FIRECRAWL_NOT_CONFIGURED_MESSAGE
              : useLoadTestMocks
                ? "Load-test mock (development/test only)."
                : undefined,
        scrapedAt: new Date().toISOString(),
      },
    };

    let toPersist: AuditData = withMeta;
    if (!useLoadTestMocks) {
      try {
        const siteIntegrations = await runSiteIntegrations(primaryUrl);
        toPersist = applySiteIntegrationsToAudit(withMeta, siteIntegrations);
        logAuditStage(requestId, "integrations", {
          auditId,
          ssl: siteIntegrations.sslTls.status,
          pagespeed: siteIntegrations.pageSpeed.status,
          webrisk: siteIntegrations.webRisk.status,
          ipgeo: siteIntegrations.ipGeo.status,
          whois: siteIntegrations.whois.status,
        });
      } catch (err) {
        console.error("[audit] site integrations failed:", { requestId, auditId, err });
      }
    }

    stage = "persist";
    logAuditStage(requestId, "persist", { auditId });
    await persistAuditResults(auditId, workspaceId, toPersist);
    logAuditStage(requestId, "persist.ok", { auditId });

    if (storeId || resolvedStoreUrl) {
      const sd = product.structuredData as Record<string, unknown>;
      const currency =
        (typeof sd.priceCurrency === "string" && sd.priceCurrency) ||
        (typeof sd.currency === "string" && sd.currency) ||
        null;
      await ensureWorkspaceStore({
        workspaceId,
        storeUrl: resolvedStoreUrl || primaryUrl,
        name: withMeta.storeName || onboardingState.businessName || undefined,
        platform: onboardingState.platform || null,
        country: onboardingState.country || null,
        language: onboardingState.primaryLanguage || null,
        currency,
        detectedTheme: onboardingState.platform || null,
        verifiedAt: onboardingState.storeVerifiedAt,
        markCrawled: true,
        storesLimit,
      });
    }

    if (resolvedCompetitorUrl) {
      await recordUsageEvent(workspaceId, "competitor_compare", { type: "audit", id: auditId });
    }
  } catch (err) {
    const mapped = mapUnknownAuditError(err, stage);
    console.error("[api/audit] pipeline error", {
      requestId,
      auditId,
      stage,
      code: mapped.code,
      err,
    });
    await markAuditFailed(
      auditId,
      formatFailedAuditMessage({
        publicMessage: mapped.publicMessage,
        requestId,
        stage,
      })
    );
    if (usageEventId) await releaseUsageQuota(usageEventId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = getAuditRequestId(req.headers);
  const requestHeaders = auditRequestHeaders(requestId);

  try {
    logAuditStage(requestId, "accepted");
    const loadTestMode = resolveLoadTestMode(
      loadTestSignalFromHeaders(req.headers, req.nextUrl)
    );
    switch (loadTestMode) {
      case "rejected":
        return jsonError(requestId, {
          error: "Load-test mocks are disabled in this environment.",
          code: AUDIT_ERROR_CODES.LOAD_TEST_REJECTED,
          stage: "validate",
          status: 403,
        });
      case "mock":
      case "off":
        break;
      default: {
        const _exhaustive: never = loadTestMode;
        void _exhaustive;
        return jsonError(requestId, {
          error: "Load-test mocks are disabled in this environment.",
          code: AUDIT_ERROR_CODES.LOAD_TEST_REJECTED,
          stage: "validate",
          status: 403,
        });
      }
    }
    const useLoadTestMocks = loadTestMode === "mock";

    const auth = await requireApiUser();
    if (!auth.ok) return auth.response;

    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return jsonError(requestId, {
        error: "طلب غير صالح",
        code: AUDIT_ERROR_CODES.INVALID_BODY,
        stage: "validate",
        status: 400,
        extra: { details: parsed.error.flatten() },
      });
    }
    const productUrlInput = parsed.data.productUrl?.trim() || "";
    const storeUrlInput = parsed.data.storeUrl?.trim() || "";
    const competitorUrlInput = parsed.data.competitorUrl?.trim() || "";

    const onboardingState = await getOnboardingState(auth.user.id);
    if (!onboardingState?.completed) {
      return jsonError(requestId, {
        error: "أكمل التهيئة قبل تشغيل تحليل.",
        code: AUDIT_ERROR_CODES.ONBOARDING_REQUIRED,
        stage: "onboarding",
        status: 403,
        extra: { resumePath: onboardingState?.resumePath ?? "/onboarding" },
      });
    }
    const onboarding = toAnalyzerOnboarding(onboardingState);

    const primaryUrl = productUrlInput || storeUrlInput;
    const resolvedStoreUrl =
      storeUrlInput || onboardingState.storeUrl || undefined;
    const competitorCandidate =
      competitorUrlInput || onboardingState.competitorUrl || undefined;

    const urlError = useLoadTestMocks
      ? null
      : (await validateCrawlUrl(productUrlInput ? "رابط المنتج" : "رابط المتجر", primaryUrl)) ||
        (resolvedStoreUrl && resolvedStoreUrl !== primaryUrl
          ? await validateCrawlUrl("رابط المتجر", resolvedStoreUrl)
          : null) ||
        (competitorCandidate ? await validateCrawlUrl("رابط المنافس", competitorCandidate) : null);
    if (urlError) {
      return jsonError(requestId, {
        error: urlError,
        code: AUDIT_ERROR_CODES.BLOCKED_URL,
        stage: "validate",
        status: 400,
      });
    }

    const workspaceId = await ensurePersonalWorkspace(auth.user.id);
    if (!workspaceId) {
      return jsonError(requestId, {
        error: "تعذّر تجهيز مساحة العمل. حاول مرة أخرى.",
        code: AUDIT_ERROR_CODES.WORKSPACE_UNAVAILABLE,
        stage: "workspace",
        status: 503,
      });
    }

    const plan = await getPlanForWorkspace(workspaceId);

    const rateKey = `user:${auth.user.id}`;
    logAuditStage(requestId, "rate_limit", { plan: plan.planId });
    const { success, remaining, limit } = useLoadTestMocks
      ? { success: true, remaining: Number.POSITIVE_INFINITY, limit: Number.POSITIVE_INFINITY }
      : await checkRateLimit(rateKey, plan.planId);
    if (!success) {
      return jsonError(requestId, {
        error: "تم تجاوز الحد المسموح. حاول لاحقاً أو قم بترقية باقتك.",
        code: AUDIT_ERROR_CODES.RATE_LIMITED,
        stage: "rate_limit",
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
        },
      });
    }

    let resolvedCompetitorUrl = competitorCandidate;
    if (resolvedCompetitorUrl && !isPlanFeatureEnabled(plan, "competitor")) {
      if (competitorUrlInput) {
        return jsonError(requestId, {
          error: competitorLockedMessage(),
          code: ENTITLEMENT_CODES.COMPETITOR_LOCKED,
          stage: "entitlement",
          status: 403,
          extra: { plan: plan.planId },
        });
      }
      resolvedCompetitorUrl = undefined;
    }

    let storeId: string | null = null;
    if (resolvedStoreUrl) {
      const storeResult = await ensureWorkspaceStore({
        workspaceId,
        storeUrl: resolvedStoreUrl,
        name: onboardingState.businessName || onboardingState.homepageTitle || undefined,
        platform: onboardingState.platform || null,
        country: onboardingState.country || null,
        language: onboardingState.primaryLanguage || null,
        verifiedAt: onboardingState.storeVerifiedAt,
        markCrawled: true,
        storesLimit: plan.storesLimit,
      });
      if (!storeResult.ok) {
        if (storeResult.code === "STORE_LIMIT_REACHED") {
          return NextResponse.json(
            { ...storeLimitReachedBody(plan, storeResult.used), requestId, stage: "store" },
            { status: 403, headers: requestHeaders }
          );
        }
        return jsonError(requestId, {
          error: "تعذّر تجهيز المتجر. حاول مرة أخرى.",
          code: AUDIT_ERROR_CODES.STORE_UNAVAILABLE,
          stage: "store",
          status: 503,
        });
      }
      storeId = storeResult.storeId;
    }

    const auditId = await createAuditRecord({
      workspaceId,
      userId: auth.user.id,
      productUrl: primaryUrl,
      storeUrl: resolvedStoreUrl,
      competitorUrl: resolvedCompetitorUrl,
      storeId,
    });

    if (!auditId) {
      return jsonError(requestId, {
        error: "تعذّر إنشاء سجل التحليل. حاول مرة أخرى.",
        code: AUDIT_ERROR_CODES.CREATE_RECORD_FAILED,
        stage: "create_record",
        status: 503,
      });
    }

    const { start: periodStart, end: periodEnd } = getCurrentUsagePeriod();
    const quota = await tryConsumeUsageQuota({
      workspaceId,
      metric: "audit",
      limit: plan.auditsPerMonth,
      periodStart,
      periodEnd,
      ref: { type: "audit", id: auditId },
    });

    if (!quota.allowed) {
      const message =
        plan.auditsPerMonth != null
          ? auditLimitReachedMessage(plan.displayName, quota.used, plan.auditsPerMonth)
          : "تعذّر تأكيد باقتك. حاول مرة أخرى.";
      await markAuditFailed(auditId, message);
      await emitSubscriptionWarningNotification({
        workspaceId,
        kind: "quota_exhausted",
        metricLabel: "تحليلات الشهر",
      });
      return jsonError(requestId, {
        error: message,
        code: AUDIT_ERROR_CODES.AUDIT_LIMIT_REACHED,
        stage: "quota",
        status: 403,
        extra: {
          plan: plan.planId,
          limit: plan.auditsPerMonth,
          used: quota.used,
        },
      });
    }

    const usageEventId = quota.usageEventId;

    after(() =>
      runAuditPipeline({
        auditId,
        workspaceId,
        primaryUrl,
        resolvedStoreUrl,
        resolvedCompetitorUrl,
        storeId,
        storesLimit: plan.storesLimit,
        onboarding,
        onboardingState,
        usageEventId,
        useLoadTestMocks,
        requestId,
      })
    );

    return NextResponse.json(
      {
        audit: {
          id: auditId,
          productUrl: primaryUrl,
          storeUrl: resolvedStoreUrl,
          competitorUrl: resolvedCompetitorUrl,
          status: "queued",
        },
        requestId,
        meta: {
          rateLimit: { remaining, limit },
          auditId,
          workspaceId,
          requestId,
          accepted: true,
          demoMode: {
            firecrawl: useLoadTestMocks || !isFirecrawlConfigured(),
            gemini: useLoadTestMocks || !isGeminiConfigured(),
          },
          loadTest: useLoadTestMocks,
        },
      },
      { headers: requestHeaders }
    );
  } catch (err) {
    const mapped = mapUnknownAuditError(err);
    console.error("[api/audit] error", {
      requestId,
      stage: mapped.stage,
      code: mapped.code,
      err,
    });
    return jsonError(requestId, {
      error: mapped.publicMessage,
      code: mapped.code,
      stage: mapped.stage,
      status: mapped.status,
    });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/audit",
    auth: "Required (Supabase session cookie).",
    body: {
      productUrl: "string (optional — required if storeUrl is empty)",
      storeUrl: "string (optional — required if productUrl is empty)",
      competitorUrl: "string (optional)",
      locale: "ar (optional — reserved for future Arabic dialect variants)",
    },
    notes:
      "Provide at least one of productUrl or storeUrl. Onboarding context is loaded from the user profile (required before audit). Returns auditId immediately; crawl/AI continue in the background — poll GET /api/audit/:id or open /scanning. Development/test only: send header X-Load-Test: true (or ?loadTest=true) to skip Firecrawl and Gemini. Production rejects that signal with 403.",
  });
}
