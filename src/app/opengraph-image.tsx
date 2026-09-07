import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og-font";
import { fallbackOgImage, safeImageResponse } from "@/lib/og-response";
import { SITE_OG_TITLE } from "@/lib/seo/site-copy";
import {
  OG_CTA_MAX,
  OG_PILLAR_MAX,
  OG_SUBHEAD_MAX,
  ogFontSubsetText,
  sanitizeOgAnalysisTitle,
  sanitizeOgStoreName,
  sanitizeOgText,
} from "@/lib/og-text";

export const runtime = "edge";
export const alt = SITE_OG_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE_1 = "حوّل كل صفحة منتج";
const HEADLINE_2 = "إلى آلة تحويل مبيعات.";
const SUBHEAD =
  "تحليل بالذكاء الاصطناعي للتحويل، SEO، الظهور في GEO والثقة — مع مقارنة بالمنافسين وإصلاحات جاهزة للنشر.";
const PILLARS = ["التحويل", "SEO", "GEO / AI", "الثقة"] as const;
const CTA = "ابدأ تحليلاً مجانياً";
const KICKER = "AI INTELLIGENCE";

export default async function OgImage() {
  const storeName = sanitizeOgStoreName("ConvAudit");
  const analysisTitle1 = sanitizeOgAnalysisTitle(HEADLINE_1);
  const analysisTitle2 = sanitizeOgAnalysisTitle(HEADLINE_2);
  const subhead = sanitizeOgText(SUBHEAD, {
    maxLength: OG_SUBHEAD_MAX,
    fallback: analysisTitle1,
  });
  const kicker = sanitizeOgText(KICKER, { maxLength: 32, fallback: "AI" });
  const cta = sanitizeOgText(CTA, { maxLength: OG_CTA_MAX, fallback: storeName });
  const pillars = PILLARS.map((pillar) =>
    sanitizeOgText(pillar, { maxLength: OG_PILLAR_MAX, fallback: "—" })
  ).filter((pillar) => pillar.length > 0);

  return safeImageResponse(async () => {
    const fontText = ogFontSubsetText(
      storeName,
      analysisTitle1,
      analysisTitle2,
      subhead,
      kicker,
      cta,
      ...pillars
    );
    const cairoFont = await loadGoogleFont("Cairo", fontText, 800).catch(() => null);
    if (!cairoFont) {
      return fallbackOgImage(size);
    }

    // Keep the layout simple: no backgroundClip text, no nested gradient spans.
    // Complex Satori trees + Edge WASM previously threw codePointAt / OOB errors.
    return new ImageResponse(
      (
        <div
          dir="rtl"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #1d1f21 0%, #2a2d30 50%, #1d1f21 100%)",
            padding: "72px 80px",
            fontFamily: "Cairo",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "#FF6600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 800,
                color: "white",
              }}
            >
              C
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: "white", lineHeight: 1.1 }}>
                {storeName}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#FF6600",
                  letterSpacing: 2,
                  marginTop: 6,
                }}
              >
                {kicker}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ fontSize: 58, fontWeight: 800, color: "white", lineHeight: 1.25 }}>
              {analysisTitle1}
            </div>
            <div style={{ fontSize: 58, fontWeight: 800, color: "#FF6600", lineHeight: 1.25, marginTop: 6 }}>
              {analysisTitle2}
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#929292",
                marginTop: 22,
                maxWidth: 920,
                lineHeight: 1.55,
              }}
            >
              {subhead}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 36,
            }}
          >
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              {pillars.map((pillar) => (
                <div key={pillar} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      background: "#FF6600",
                    }}
                  />
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#cccccc" }}>{pillar}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 28px",
                borderRadius: 999,
                background: "#FF6600",
                fontSize: 18,
                fontWeight: 700,
                color: "white",
              }}
            >
              {cta}
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [{ name: "Cairo", data: cairoFont, weight: 800, style: "normal" }],
      }
    );
  }, size);
}
