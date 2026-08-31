import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og-font";
import { fallbackOgImage, safeImageResponse } from "@/lib/og-response";
import { SITE_OG_TITLE } from "@/lib/seo/site-copy";
import {
  OG_CTA_MAX,
  OG_SUBHEAD_MAX,
  ogFontSubsetText,
  sanitizeOgStoreName,
  sanitizeOgText,
} from "@/lib/og-text";

export const runtime = "edge";
export const alt = SITE_OG_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SUBHEAD = "تحليل وتحسين التجارة الإلكترونية بالذكاء الاصطناعي";
const CTA = "ابدأ تحليلاً مجانياً";

export default async function TwitterImage() {
  const storeName = sanitizeOgStoreName("ConvAudit");
  const analysisTitle = sanitizeOgText(SUBHEAD, {
    maxLength: OG_SUBHEAD_MAX,
    fallback: storeName,
  });
  const cta = sanitizeOgText(CTA, { maxLength: OG_CTA_MAX, fallback: storeName });

  return safeImageResponse(async () => {
    const fontText = ogFontSubsetText(storeName, analysisTitle, cta);
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
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1d1f21 0%, #2a2d30 100%)",
            fontFamily: "Cairo",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: "linear-gradient(135deg, #FF6600, #ff983f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
              color: "white",
              marginBottom: 32,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, color: "white", lineHeight: 1.1, display: "flex" }}>
            {storeName}
          </div>
          <div style={{ fontSize: 24, color: "#929292", marginTop: 16, display: "flex" }}>
            {analysisTitle}
          </div>
          <div
            style={{
              marginTop: 40,
              padding: "14px 32px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #FF6600, #ff983f)",
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              display: "flex",
            }}
          >
            {cta}
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
