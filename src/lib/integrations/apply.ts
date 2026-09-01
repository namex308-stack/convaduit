import { dedupeAndSortRecommendations } from "@/lib/ai/recommendations";
import { averagePillarScores, clampScore } from "@/lib/audit/scoring";
import type {
  AuditData,
  Recommendation,
  ScoreBreakdown,
  SiteIntegrations,
} from "@/lib/types";

function bumpPillar(
  breakdown: ScoreBreakdown[],
  pillar: ScoreBreakdown["pillar"],
  delta: number,
  summarySuffix?: string
): ScoreBreakdown[] {
  if (delta === 0) return breakdown;
  return breakdown.map((row) => {
    if (row.pillar !== pillar) return row;
    const score = clampScore(row.score + delta);
    return {
      ...row,
      score,
      summary: summarySuffix ? `${row.summary} · ${summarySuffix}` : row.summary,
    };
  });
}

function rec(partial: Omit<Recommendation, "source" | "fixType"> & Partial<Pick<Recommendation, "source" | "fixType">>): Recommendation {
  return {
    source: "rule_engine",
    fixType: "manual",
    effort: "quick",
    ...partial,
  };
}

function daysUntilIso(iso: string | undefined): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  return Math.floor((ms - Date.now()) / 86_400_000);
}

export function recommendationsFromSiteIntegrations(
  integrations: SiteIntegrations,
  affectedPage: string
): Recommendation[] {
  const recs: Recommendation[] = [];
  const ssl = integrations.sslTls;
  if (ssl.status === "ok" || ssl.status === "error") {
    if (ssl.expired || ssl.grade === "fail" && ssl.expired) {
      recs.push(
        rec({
          id: "site-ssl-expired",
          pillar: "trust",
          severity: "critical",
          impact: "high",
          problem: "شهادة SSL/TLS منتهية أو غير صالحة — المتصفح سيُظهر تحذير أمان للزائر.",
          solution:
            "جدّد شهادة HTTPS فورًا من مزوّد الاستضافة أو Let's Encrypt.\nفعّل التجديد التلقائي وتأكد أن الشهادة تغطي النطاق الأساسي وwww.",
          affectedPage,
          confidence: 95,
        })
      );
    } else if (ssl.status === "ok" && ssl.authorized === false) {
      recs.push(
        rec({
          id: "site-ssl-invalid",
          pillar: "trust",
          severity: "critical",
          impact: "high",
          problem: "شهادة HTTPS غير موثوقة (ذاتية التوقيع أو غير مكتملة السلسلة).",
          solution:
            "ثبّت شهادة من جهة مصدّقة عامة وضمّن سلسلة الشهادات الكاملة (intermediate).\nاختبر الموقع في متصفح خاص بعد التثبيت.",
          affectedPage,
          confidence: 90,
        })
      );
    } else if (ssl.status === "ok" && ssl.hostnameMatches === false) {
      recs.push(
        rec({
          id: "site-ssl-mismatch",
          pillar: "trust",
          severity: "critical",
          impact: "high",
          problem: "اسم النطاق لا يطابق شهادة SSL (خطأ SAN/CN).",
          solution:
            "أعد إصدار الشهادة لتشمل النطاق الذي يفتحه المتسوق (بما في ذلك www إن وُجد).\nفعّل SNI الصحيح على الخادم.",
          affectedPage,
          confidence: 90,
        })
      );
    } else if (
      ssl.status === "ok" &&
      ssl.daysUntilExpiry != null &&
      ssl.daysUntilExpiry >= 0 &&
      ssl.daysUntilExpiry <= 21
    ) {
      recs.push(
        rec({
          id: "site-ssl-expiring",
          pillar: "trust",
          severity: "warning",
          impact: "medium",
          problem: `شهادة SSL تنتهي خلال ${ssl.daysUntilExpiry} يومًا.`,
          solution:
            "جدّد الشهادة قبل انتهائها وفعّل التجديد التلقائي حتى لا يظهر تحذير أمان فجأة.",
          affectedPage,
          confidence: 90,
        })
      );
    } else if (ssl.status === "error" && /timed out|ECONNREFUSED|certificate|TLS/i.test(ssl.error ?? "")) {
      recs.push(
        rec({
          id: "site-ssl-missing",
          pillar: "trust",
          severity: "critical",
          impact: "high",
          problem: "تعذّر إتمام مصافحة TLS — الموقع قد يعمل بدون HTTPS صالح.",
          solution:
            "فعّل HTTPS على المنفذ 443 وثبّت شهادة صالحة.\nحوّل كل زيارات HTTP إلى HTTPS بشكل دائم (301).",
          affectedPage,
          confidence: 80,
        })
      );
    }
  }

  const risk = integrations.webRisk;
  if (risk.status === "ok" && risk.isSafe === false && (risk.threatTypes?.length ?? 0) > 0) {
    recs.push(
      rec({
        id: "site-webrisk-threat",
        pillar: "trust",
        severity: "critical",
        impact: "high",
        problem: `Google Web Risk صنّف الرابط كتهديد: ${risk.threatTypes?.join("، ")}.`,
        solution:
          "افحص الموقع بحثًا عن برمجيات خبيثة أو صفحات تصيّد وأزلها.\nاطلب مراجعة في Google Search Console بعد التنظيف.",
        affectedPage,
        confidence: 92,
      })
    );
  }

  const psi = integrations.pageSpeed;
  if (psi.status === "ok" && psi.performance != null && psi.performance < 50) {
    recs.push(
      rec({
        id: "site-pagespeed-performance",
        pillar: "seo",
        severity: psi.performance < 40 ? "warning" : "opportunity",
        impact: psi.performance < 40 ? "high" : "medium",
        problem: `أداء الصفحة على الجوال منخفض (${psi.performance}/100 حسب PageSpeed Insights).`,
        solution:
          "خفّض حجم الصور (WebP/AVIF) وأزل سكربتات الطرف الثالث غير الضرورية.\nفعّل الضغط والتخزين المؤقت وحسّن أكبر عنصر محتوى (LCP).",
        affectedPage,
        confidence: 88,
      })
    );
  }
  if (psi.status === "ok" && psi.seo != null && psi.seo < 70) {
    recs.push(
      rec({
        id: "site-pagespeed-seo",
        pillar: "seo",
        severity: "warning",
        impact: "medium",
        problem: `درجة SEO التقنية في PageSpeed Insights ${psi.seo}/100.`,
        solution:
          "أصلح العناصر التي يشير إليها التقرير: العنوان، الوصف، قابلية الفهرسة، والروابط.\nتأكد أن الصفحة ليست محجوبة عن الزحف وأن المحتوى يظهر في HTML.",
        affectedPage,
        confidence: 85,
      })
    );
  }

  const whois = integrations.whois;
  const whoisDays = daysUntilIso(whois.expiresAt ?? undefined);
  if (whois.status === "ok" && whoisDays != null && whoisDays >= 0 && whoisDays <= 30) {
    recs.push(
      rec({
        id: "site-whois-expiring",
        pillar: "trust",
        severity: "warning",
        impact: "medium",
        problem: `تسجيل النطاق ينتهي خلال ${whoisDays} يومًا.`,
        solution: "جدّد تسجيل النطاق من المسجّل الحالي وفعّل التجديد التلقائي حتى لا يفقد المتجر اسمه.",
        affectedPage,
        confidence: 90,
      })
    );
  }

  return recs;
}

function scoreDeltas(integrations: SiteIntegrations): { trust: number; seo: number; trustNote?: string; seoNote?: string } {
  let trust = 0;
  let seo = 0;
  let trustNote: string | undefined;
  let seoNote: string | undefined;

  const ssl = integrations.sslTls;
  if (ssl.status === "ok") {
    if (ssl.expired || ssl.authorized === false || ssl.hostnameMatches === false) {
      trust -= 18;
      trustNote = "شهادة HTTPS غير سليمة.";
    } else if (ssl.daysUntilExpiry != null && ssl.daysUntilExpiry <= 21) {
      trust -= 8;
      trustNote = "شهادة HTTPS قاربت على الانتهاء.";
    } else if (ssl.grade === "ok") {
      trust += 4;
    }
  } else if (ssl.status === "error") {
    trust -= 10;
    trustNote = "تعذّر التحقق من HTTPS.";
  }

  const risk = integrations.webRisk;
  if (risk.status === "ok" && risk.isSafe === false) {
    trust -= 25;
    trustNote = "تصنيف مخاطر من Google Web Risk.";
  }

  const psi = integrations.pageSpeed;
  if (psi.status === "ok") {
    if (psi.performance != null && psi.performance < 40) {
      seo -= 8;
      seoNote = "أداء الجوال منخفض حسب PageSpeed.";
    } else if (psi.performance != null && psi.performance < 60) {
      seo -= 4;
      seoNote = "أداء الجوال يحتاج تحسينًا.";
    }
    if (psi.seo != null && psi.seo < 70) {
      seo -= 6;
    }
  }

  const whoisDays = daysUntilIso(integrations.whois.expiresAt ?? undefined);
  if (integrations.whois.status === "ok" && whoisDays != null && whoisDays <= 30) {
    trust -= 6;
  }

  return { trust, seo, trustNote, seoNote };
}

/**
 * Merge live integration results into the existing audit (recommendations + light score nudges).
 * Skipped/error checks never invent findings; they also never fail the caller.
 */
export function applySiteIntegrationsToAudit(
  audit: AuditData,
  integrations: SiteIntegrations
): AuditData {
  const extra = recommendationsFromSiteIntegrations(integrations, audit.productUrl);
  const deltas = scoreDeltas(integrations);
  let breakdown = bumpPillar(audit.breakdown, "trust", deltas.trust, deltas.trustNote);
  breakdown = bumpPillar(breakdown, "seo", deltas.seo, deltas.seoNote);

  return {
    ...audit,
    breakdown,
    overallScore: averagePillarScores(breakdown),
    recommendations: dedupeAndSortRecommendations([...audit.recommendations, ...extra]),
    siteIntegrations: integrations,
  };
}
