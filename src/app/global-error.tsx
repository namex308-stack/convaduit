"use client";

import * as React from "react";
import { getLocaleConfig } from "@/lib/locale/config";

/**
 * Root-layout failure boundary. Must stay self-contained — when this renders,
 * the root layout (providers, fonts, Tailwind) may have already crashed.
 */
const GLOBAL_ERROR_COPY = {
  title: "خطأ في التطبيق",
  desc: "حدث خطأ حرج ويحتاج التطبيق لإعادة التشغيل. بياناتك بأمان — حاول إعادة التحميل.",
  errorId: "رقم الخطأ:",
  reload: "إعادة تحميل التطبيق",
} as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[ConvAudit] Global error:", error);
  }, [error]);

  const { htmlLang, dir } = getLocaleConfig("ar");
  const copy = GLOBAL_ERROR_COPY;

  return (
    <html lang={htmlLang} dir={dir}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </head>
      <body
        style={{
          margin: 0,
          background: "#1d1f21",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ maxWidth: 440, textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: "rgba(244,63,94,0.1)",
                color: "#f43f5e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 28,
                lineHeight: 1,
              }}
              aria-hidden
            >
              !
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>
              {copy.title}
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#929292",
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              {copy.desc}
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(146,146,146,0.7)",
                  marginBottom: 16,
                }}
              >
                {copy.errorId} {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                borderRadius: 999,
                background: "#FF6600",
                color: "white",
                border: "none",
                padding: "10px 24px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {copy.reload}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
