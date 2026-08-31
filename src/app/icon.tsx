import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Raster favicon matching the orange brand mark used by apple-icon. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF6600, #ff983f)",
          fontSize: 20,
          fontWeight: 800,
          color: "white",
          borderRadius: 8,
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}
