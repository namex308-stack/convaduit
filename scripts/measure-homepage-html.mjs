import { get } from "node:http";
import { gzipSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const url = process.argv[2] || "http://127.0.0.1:3001/";

function gzipSize(buf) {
  return gzipSync(buf, { level: 9 }).length;
}

get(url, (res) => {
  const chunks = [];
  res.on("data", (c) => chunks.push(c));
  res.on("end", () => {
    const html = Buffer.concat(chunks).toString("utf8");
    const scripts = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map(
      (m) => m[1]
    );
    const preloads = [
      ...html.matchAll(/rel="preload"[^>]+href="(\/_next\/static\/[^"]+)"/g),
    ].map((m) => m[1]);

    let raw = 0;
    let gz = 0;
    const rows = [];
    for (const src of scripts) {
      const abs = join(".next", src.replace("/_next/", ""));
      if (!existsSync(abs)) {
        rows.push({ src, missing: true });
        continue;
      }
      const buf = readFileSync(abs);
      const g = gzipSize(buf);
      raw += buf.length;
      gz += g;
      const text = buf.toString("utf8");
      const tags = [
        "createBrowserClient",
        "supabase",
        "framer",
        "sonner",
        "recharts",
        "@vercel/analytics",
      ].filter((n) => text.includes(n));
      rows.push({ src, raw: buf.length, gzip: g, tags });
    }
    rows.sort((a, b) => (b.gzip || 0) - (a.gzip || 0));
    console.log(
      JSON.stringify(
        {
          status: res.statusCode,
          htmlBytes: html.length,
          initialJsRaw: raw,
          initialJsGzip: gz,
          scriptCount: scripts.length,
          hasH1: html.includes("<h1"),
          hasGtag: /gtag|googletagmanager/.test(html),
          hasSupabase: rows.some((r) => (r.tags || []).includes("createBrowserClient")),
          preloads,
          scripts: rows,
        },
        null,
        2
      )
    );
  });
}).on("error", (err) => {
  console.error(err);
  process.exit(1);
});
