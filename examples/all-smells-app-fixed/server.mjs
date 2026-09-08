// F-04 fix: a plain Node static server with gzip and long cache headers.
// In production the same headers come from a CDN or host config.
// Usage: node server.mjs (serves ./dist)

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { createGzip } from "node:zlib";

const root = normalize(join(process.cwd(), "dist"));
const port = Number(process.env.PORT ?? 8080);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

createServer((req, res) => {
  const path = normalize(join(root, req.url === "/" ? "index.html" : req.url));
  if (!path.startsWith(root) || !existsSync(path)) {
    res.writeHead(404).end("not found");
    return;
  }
  const type = TYPES[extname(path)] ?? "application/octet-stream";
  const gzip = req.headers["accept-encoding"]?.includes("gzip");
  // gzip text, cache hashed assets for a year, HTML short.
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Encoding": gzip ? "gzip" : undefined,
    "Cache-Control": /\.[a-f0-9]{8}\./.test(path)
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  });
  if (gzip) {
    createReadStream(path).pipe(createGzip()).pipe(res);
  } else {
    createReadStream(path).pipe(res);
  }
}).listen(port, () => console.log(`serving ${root} on :${port} (gzip + cache headers)`));
