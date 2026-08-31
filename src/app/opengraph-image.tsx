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
const PILLARS = ["التحويل", "SEO", "GEO / AI", "الثقة"];
const CTA = "← ابدأ تحليلاً مجانياً";
const KICKER = "AI INTELLIGENCE";

export default async function OgImage() {
  const storeName = sanitizeOgStoreName("ConvAudit");
  const analysisTitle1 = sanitizeOgAnalysisTitle(HEADLINE_1);
  const analysisTitle2 = sanitizeOgAnalysisTitle(HEADLINE_2);
  const subhead = sanitizeOgText(SUBHEAD, { maxLength: OG_SUBHEAD_MAX, fallback: analysisTitle1 });
  const kicker = sanitizeOgText(KICKER, { maxLength: 32, fallback: "AI" });
  const cta = sanitizeOgText(CTA, { maxLength: OG_CTA_MAX, fallback: storeName });
  const pillars = PILLARS.map((pillar) =>
    sanitizeOgText(pillar, { maxLength: OG_PILLAR_MAX, fallback: "" })
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
            padding: "80px",
            position: "relative",
            fontFamily: "Cairo",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "linear-gradient(135deg, #FF6600, #ff983f)",
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
              <div style={{ fontSize: 30, fontWeight: 800, color: "white", lineHeight: 1 }}>
                {storeName}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#FF6600", letterSpacing: 2, marginTop: 4, display: "flex" }}>
                {kicker}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ fontSize: 62, fontWeight: 800, color: "white", lineHeight: 1.3, display: "flex" }}>
              {analysisTitle1}
            </div>
            <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.3, marginTop: 8, display: "flex" }}>
              <span style={{ background: "linear-gradient(120deg, #FF6600, #ff983f)", backgroundClip: "text", color: "transparent", display: "flex" }}>
                {analysisTitle2}
              </span>
            </div>
            <div style={{ fontSize: 24, color: "#929292", marginTop: 24, maxWidth: 900, lineHeight: 1.6, display: "flex" }}>
              {subhead}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 40 }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {pillars.map((pillar, i) => (
                <div key={pillar} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: ["#FF6600", "#ff983f", "#cc5200", "#929292"][i] ?? "#929292",
                      display: "flex",
                    }}
                  />
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#cccccc", display: "flex" }}>{pillar}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 28px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #FF6600, #ff983f)",
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
