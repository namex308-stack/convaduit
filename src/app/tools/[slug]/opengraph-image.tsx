import { ImageResponse } from "next/og";
import { TOOLS, getToolBySlug } from "@/lib/tools";

export const runtime = "nodejs";
export const alt = "Convaudit tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic OpenGraph image for each tool page.
 * Route: /tools/{slug}/opengraph-image
 */
export async function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  const name = tool?.name ?? "Convaudit";
  const category = tool?.category ?? "Tools";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          backgroundColor: "#0a0a0a",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "#0a0a0a",
            }}
          >
            C
          </div>
          <div style={{ display: "flex", color: "#fafafa", fontSize: "28px", fontWeight: 600 }}>
            Convaudit
          </div>
        </div>

        {/* Tool name + category */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              padding: "6px 16px",
              borderRadius: "999px",
              backgroundColor: "#1a1a1a",
              border: "1px solid #333333",
              color: "#a3a3a3",
              fontSize: "20px",
              fontWeight: 500,
            }}
          >
            {category} Tool
          </div>
          <div
            style={{
              display: "flex",
              color: "#fafafa",
              fontSize: "68px",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              color: "#a3a3a3",
              fontSize: "26px",
            }}
          >
            Free · Private · Browser-based — no uploads, no sign-up
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#525252",
            fontSize: "20px",
          }}
        >
          <div style={{ display: "flex" }}>convaudit.com/tools/{slug}</div>
          <div style={{ display: "flex" }}>100% client-side</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
