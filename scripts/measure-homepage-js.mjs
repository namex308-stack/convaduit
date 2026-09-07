import { createGzip } from "node:zlib";
import { promisify } from "node:util";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();
const label = process.argv[2] || "measure";

function walkJs(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkJs(p, acc);
    else if (name.endsWith(".js")) acc.push(p);
  }
  return acc;
}

function gzipSize(buf) {
  return gzipSync(buf, { level: 9 }).length;
}

function collectFromManifest(manifestPath, files) {
  if (!existsSync(manifestPath)) return;
  const text = readFileSync(manifestPath, "utf8");
  for (const match of text.matchAll(/static\/chunks\/[A-Za-z0-9._/-]+\.js/g)) {
    files.add(match[0].replace(/\\/g, "/"));
  }
}

const files = new Set();
collectFromManifest(join(root, ".next/server/app/page_client-reference-manifest.js"), files);
collectFromManifest(join(root, ".next/server/app/page/build-manifest.json"), files);
collectFromManifest(join(root, ".next/build-manifest.json"), files);

const rows = [];
let raw = 0;
let gz = 0;
for (const rel of [...files].sort()) {
  const abs = join(root, ".next", rel);
  if (!existsSync(abs)) continue;
  const buf = readFileSync(abs);
  const g = gzipSize(buf);
  raw += buf.length;
  gz += g;
  rows.push({ file: rel, raw: buf.length, gzip: g });
}
rows.sort((a, b) => b.gzip - a.gzip);

const allChunks = walkJs(join(root, ".next/static/chunks"));
let allRaw = 0;
let allGz = 0;
for (const p of allChunks) {
  const buf = readFileSync(p);
  allRaw += buf.length;
  allGz += gzipSize(buf);
}

const fontDir = join(root, ".next/static/media");
const fonts = existsSync(fontDir)
  ? readdirSync(fontDir)
      .filter((n) => n.endsWith(".woff2") || n.endsWith(".woff"))
      .map((n) => {
        const abs = join(fontDir, n);
        const size = statSync(abs).size;
        return { file: n, raw: size };
      })
  : [];

const report = {
  label,
  at: new Date().toISOString(),
  homepageChunks: {
    count: rows.length,
    rawBytes: raw,
    gzipBytes: gz,
    largest: rows.slice(0, 20),
  },
  allClientChunks: {
    count: allChunks.length,
    rawBytes: allRaw,
    gzipBytes: allGz,
  },
  fonts,
};

const outPath = join(root, `.next-metrics-${label}.json`);
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log(`Wrote ${outPath}`);
