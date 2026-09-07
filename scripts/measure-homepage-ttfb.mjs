import { get } from "node:http";

const url = process.argv[2] || "http://127.0.0.1:3001/";
const rounds = Number(process.argv[3] || 5);

function once() {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    get(url, (res) => {
      res.resume();
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          ttfbMs: Date.now() - t0,
          cache: res.headers["x-nextjs-cache"] || null,
          prerender: res.headers["x-nextjs-prerender"] || null,
        });
      });
    }).on("error", reject);
  });
}

const samples = [];
for (let i = 0; i < rounds; i += 1) {
  samples.push(await once());
}
const nums = samples.map((s) => s.ttfbMs);
console.log(
  JSON.stringify(
    {
      url,
      samples,
      min: Math.min(...nums),
      max: Math.max(...nums),
      avg: Math.round(nums.reduce((a, b) => a + b, 0) / nums.length),
    },
    null,
    2
  )
);
