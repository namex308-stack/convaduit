import { ImageResponse } from "next/og";

type OgSize = { width: number; height: number };

const FALLBACK_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=3600",
} as const;

const SUCCESS_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
} as const;

/** ASCII-only fallback — no custom font, so Satori cannot trip on missing glyphs. */
export function fallbackOgImage(size: OgSize): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1d1f21 0%, #2a2d30 100%)",
          fontFamily: "system-ui, sans-serif",
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
            marginBottom: 24,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, color: "white", display: "flex" }}>
          ConvAudit
        </div>
      </div>
    ),
    { ...size }
  );
}

async function responseFromImage(
  image: ImageResponse,
  headers: { "Content-Type": string; "Cache-Control": string }
): Promise<Response> {
  const buffer = await image.arrayBuffer();
  return new Response(buffer, { headers });
}

/**
 * Render an OG/Twitter image. Constructor try/catch is not enough: Satori
 * runs inside the response stream, so we drain the body to surface WASM errors
 * and fall back to a default image instead of failing the request.
 */
export async function safeImageResponse(
  generate: () => Promise<ImageResponse> | ImageResponse,
  size: OgSize
): Promise<Response> {
  try {
    const image = await generate();
    return await responseFromImage(image, SUCCESS_HEADERS);
  } catch (error) {
    console.error("[og] image generation failed", error);
    try {
      return await responseFromImage(fallbackOgImage(size), FALLBACK_HEADERS);
    } catch (fallbackError) {
      console.error("[og] fallback image generation failed", fallbackError);
      return fallbackOgImage(size);
    }
  }
}
