import * as http from "node:http";
import { createReadStream, promises as fs } from "node:fs";
import * as path from "node:path";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

// URLs "bonitas" -> arquivo dentro de /public
const ROUTES: Record<string, string> = {
  "/": "index.html",
  "/marcas": "marcas.html",
  "/liberdade": "liberdade.html",
};

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};

function send(res: http.ServerResponse, status: number, body: string, type = "text/plain; charset=utf-8"): void {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff" });
  res.end(body);
}

async function handle(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return send(res, 405, "Método não permitido");
  }

  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    return send(res, 400, "Requisição inválida");
  }

  if (pathname === "/healthz") return send(res, 200, "ok");
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

  const rel = ROUTES[pathname] ?? pathname.slice(1);
  if (rel.split("/").some((part) => part.startsWith("."))) return send(res, 404, "Não encontrado");

  const filePath = path.resolve(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, "Acesso negado");

  let size: number;
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return send(res, 404, "Não encontrado");
    size = stat.size;
  } catch {
    return send(res, 404, "Página não encontrada");
  }

  const ext = path.extname(filePath).toLowerCase();
  const headers: http.OutgoingHttpHeaders = {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
  };

  // Suporte a Range (necessário para o vídeo tocar/avançar no Safari e no celular)
  let start = 0;
  let end = size - 1;
  let status = 200;
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
  if (m && (m[1] !== "" || m[2] !== "")) {
    if (m[1] !== "") {
      start = Number(m[1]);
      if (m[2] !== "") end = Math.min(Number(m[2]), size - 1);
    } else {
      start = Math.max(size - Number(m[2]), 0);
    }
    if (start > end || start >= size) {
      res.writeHead(416, { "Content-Range": `bytes */${size}` });
      return void res.end();
    }
    status = 206;
    headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  }
  headers["Content-Length"] = end - start + 1;

  res.writeHead(status, headers);
  if (req.method === "HEAD") return void res.end();

  const stream = createReadStream(filePath, { start, end });
  stream.on("error", () => res.destroy());
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((err: unknown) => {
    console.error(err);
    if (!res.headersSent) send(res, 500, "Erro interno");
    else res.destroy();
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Bella no ar em http://${HOST}:${PORT}`);
});

function shutdown(): void {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
