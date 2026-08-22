import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openFile } from './open.js';

const DOCS_ROOT = resolve(fileURLToPath(new URL('../docs', import.meta.url)));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

function send(response, status, body, headers = {}) {
  response.writeHead(status, headers);
  response.end(body);
}

function serveStatic(urlPath, response) {
  const relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = resolve(DOCS_ROOT, relative);
  if (!filePath.startsWith(DOCS_ROOT)) {
    send(response, 403, 'Forbidden');
    return;
  }
  try {
    if (!statSync(filePath).isFile()) {
      send(response, 404, 'Not found');
      return;
    }
  } catch {
    send(response, 404, 'Not found');
    return;
  }
  const type = MIME[extname(filePath)] || 'application/octet-stream';
  send(response, 200, readFileSync(filePath), { 'Content-Type': type });
}

export function startServer({
  host = '127.0.0.1',
  port = 3210,
  open = true,
} = {}) {
  if (!existsSync(resolve(DOCS_ROOT, 'index.html'))) {
    throw new Error('还没有构建网页。请先执行 npm run build:web');
  }

  const server = createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      send(response, 405, 'Method not allowed');
      return;
    }
    const url = new URL(request.url ?? '/', `http://${host}:${port}`);
    serveStatic(url.pathname, response);
  });

  server.listen(port, host, () => {
    const href = `http://${host}:${port}/`;
    process.stdout.write(`微信发稿台已启动 ${href}\n`);
    if (open) {
      openFile(href);
    }
  });

  return server;
}
