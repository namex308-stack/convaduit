import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  crawlWithFallback,
  FIRECRAWL_CREDITS_MESSAGE,
  FIRECRAWL_NOT_CONFIGURED_MESSAGE,
} from "@/lib/firecrawl";
import { toProductLookupResult } from "@/lib/product-lookup";
import { checkProductLookupRateLimit } from "@/lib/redis";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  url: z.string().url(),
});

const RATE_LIMIT_MESSAGE = "تم تجاوز الحد المسموح. حاول لاحقاً.";
const INVALID_BODY_MESSAGE = "أدخل رابط منتج صالح.";
const FALLBACK_FAILURE_MESSAGE = "تعذّر الوصول إلى الصفحة. تحقق من الرابط.";

function productLookupRateKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  return `product-lookup:${ip}`;
}

function crawlFailureMessage(
  errorCode: "NOT_CONFIGURED" | "CREDITS" | "FAILED" | "BLOCKED_URL" | null,
  errorMessage: string | undefined
): string {
  if (errorMessage?.trim()) return errorMessage;
  switch (errorCode) {
    case "NOT_CONFIGURED":
      return FIRECRAWL_NOT_CONFIGURED_MESSAGE;
    case "CREDITS":
      return FIRECRAWL_CREDITS_MESSAGE;
    case "BLOCKED_URL":
      return "لا يمكن استخراج هذا الرابط.";
    case "FAILED":
      return FALLBACK_FAILURE_MESSAGE;
    case null:
      return FALLBACK_FAILURE_MESSAGE;
    default: {
      const _exhaustive: never = errorCode;
      return _exhaustive;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { success, limit, remaining } = await checkProductLookupRateLimit(
      productLookupRateKey(req)
    );
    if (!success) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
          },
        }
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: INVALID_BODY_MESSAGE }, { status: 400 });
    }

    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: INVALID_BODY_MESSAGE }, { status: 400 });
    }

    const result = await crawlWithFallback(parsed.data.url);
    if (!result.page) {
      const error = crawlFailureMessage(result.errorCode, result.errorMessage);
      const status = result.errorCode === "BLOCKED_URL" ? 400 : 422;
      return NextResponse.json(
        { error, ...(result.errorCode ? { code: result.errorCode } : {}) },
        { status }
      );
    }

    return NextResponse.json(toProductLookupResult(result.page));
  } catch (err) {
    console.error("[api/product-lookup] error:", err);
    return NextResponse.json({ error: "تعذّر قراءة الصفحة. حاول مرة أخرى." }, { status: 500 });
  }
}
