/**
 * Proxy to the Python FastAPI image service (Pillow).
 *
 * CompressImageTool posts here with ?XTransformPort=3030. The Caddy
 * gateway routes via that query param in production; locally we forward
 * straight to the Python service. Without this route every "Python
 * (fast)" compression 404s.
 */
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const port = searchParams.get("XTransformPort") ?? "3030";
  const target = `http://127.0.0.1:${port}/compress-image`;

  const formData = await req.formData();
  const upstream = await fetch(target, { method: "POST", body: formData });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return new Response(
      `Python image service error (${upstream.status}). ` +
        `Is the backend running on port ${port}? ` +
        `Switch to Browser mode to compress locally. ${text.slice(0, 200)}`,
      { status: 502 },
    );
  }

  const blob = await upstream.blob();
  const headers = new Headers({ "Content-Type": blob.type || "image/jpeg" });
  for (const h of ["X-Original-Size", "X-Compressed-Size"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(blob, { headers });
}
