export type AuditStage =
  | "auth"
  | "validate"
  | "onboarding"
  | "workspace"
  | "rate_limit"
  | "entitlement"
  | "store"
  | "create_record"
  | "quota"
  | "crawl"
  | "analyze"
  | "persist"
  | "unknown";

export const AUDIT_ERROR_CODES = {
  LOAD_TEST_REJECTED: "LOAD_TEST_REJECTED",
  INVALID_BODY: "INVALID_BODY",
  ONBOARDING_REQUIRED: "ONBOARDING_REQUIRED",
  BLOCKED_URL: "BLOCKED_URL",
  WORKSPACE_UNAVAILABLE: "WORKSPACE_UNAVAILABLE",
  RATE_LIMITED: "RATE_LIMITED",
  REDIS_UNAVAILABLE: "REDIS_UNAVAILABLE",
  COMPETITOR_LOCKED: "COMPETITOR_LOCKED",
  STORE_LIMIT_REACHED: "STORE_LIMIT_REACHED",
  STORE_UNAVAILABLE: "STORE_UNAVAILABLE",
  CREATE_RECORD_FAILED: "CREATE_RECORD_FAILED",
  AUDIT_LIMIT_REACHED: "AUDIT_LIMIT_REACHED",
  CRAWL_FAILED: "CRAWL_FAILED",
  ANALYZE_FAILED: "ANALYZE_FAILED",
  PERSIST_FAILED: "PERSIST_FAILED",
  AUDIT_FAILED: "AUDIT_FAILED",
} as const;

export type AuditErrorCode = (typeof AUDIT_ERROR_CODES)[keyof typeof AUDIT_ERROR_CODES];

const STAGE_AR: Record<AuditStage, string> = {
  auth: "تسجيل الدخول",
  validate: "التحقق من الطلب",
  onboarding: "التهيئة",
  workspace: "مساحة العمل",
  rate_limit: "حد الاستخدام",
  entitlement: "صلاحية الباقة",
  store: "تجهيز المتجر",
  create_record: "إنشاء سجل التحليل",
  quota: "حصة التحليلات",
  crawl: "جلب الصفحة",
  analyze: "التحليل",
  persist: "حفظ النتائج",
  unknown: "غير محدد",
};

export function redactSecrets(text: string): string {
  return text
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/\bsk-[a-zA-Z0-9_-]+/g, "[redacted]")
    .replace(/\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)?/g, "[redacted]")
    .replace(/["']https?:\/\/[^"']+["']/gi, "[url]")
    .replace(/https?:\/\/[^\s"'<>]+/gi, "[url]");
}

function isSafePublicError(message: string): boolean {
  if (!message.trim()) return false;
  if (/api[_-]?key|token|secret|password|authorization/i.test(message)) return false;
  if (/https?:\/\//i.test(message)) return false;
  return /[\u0600-\u06FF]/.test(message);
}

export function publicAuditErrorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err);
  const redacted = redactSecrets(raw).trim();
  if (isSafePublicError(redacted)) return redacted;
  return fallback;
}

export function formatFailedAuditMessage(input: {
  publicMessage: string;
  requestId: string;
  stage: AuditStage;
}): string {
  const stageLabel = STAGE_AR[input.stage];
  return `${input.publicMessage} (المرحلة: ${stageLabel} · رقم التتبع: ${input.requestId})`;
}

export function mapUnknownAuditError(
  err: unknown,
  stage: AuditStage = "unknown"
): {
  code: AuditErrorCode;
  status: number;
  publicMessage: string;
  stage: AuditStage;
} {
  const raw = err instanceof Error ? err.message : String(err);

  if (/Upstash Redis|invalid URL/i.test(raw)) {
    return {
      code: AUDIT_ERROR_CODES.REDIS_UNAVAILABLE,
      status: 503,
      publicMessage: "تعذّر التحقق من حد الاستخدام مؤقتاً. حاول مرة أخرى.",
      stage: "rate_limit",
    };
  }

  if (/Supabase|PGRST|row-level security|RLS/i.test(raw)) {
    return {
      code: AUDIT_ERROR_CODES.PERSIST_FAILED,
      status: 500,
      publicMessage: "تعذّر حفظ نتائج التحليل. حاول مرة أخرى.",
      stage: stage === "unknown" ? "persist" : stage,
    };
  }

  if (stage === "crawl") {
    return {
      code: AUDIT_ERROR_CODES.CRAWL_FAILED,
      status: 500,
      publicMessage: publicAuditErrorMessage(err, "تعذّر الوصول إلى الصفحة. تحقق من الرابط."),
      stage,
    };
  }

  if (stage === "analyze") {
    return {
      code: AUDIT_ERROR_CODES.ANALYZE_FAILED,
      status: 500,
      publicMessage: publicAuditErrorMessage(err, "تعذّر إكمال التحليل. حاول مرة أخرى."),
      stage,
    };
  }

  if (stage === "persist") {
    return {
      code: AUDIT_ERROR_CODES.PERSIST_FAILED,
      status: 500,
      publicMessage: "تعذّر حفظ نتائج التحليل. حاول مرة أخرى.",
      stage,
    };
  }

  return {
    code: AUDIT_ERROR_CODES.AUDIT_FAILED,
    status: 500,
    publicMessage: publicAuditErrorMessage(err, "فشل التحليل. حاول مرة أخرى."),
    stage,
  };
}
