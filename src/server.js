import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isWechatConfigured, loadConfig } from './config.js';
import { openFile } from './open.js';
import { publishArticle } from './publish.js';

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

function sendJson(response, status, data) {
  send(response, status, JSON.stringify(data), {
    'Content-Type': 'application/json; charset=utf-8',
  });
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

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export function decodeCover(cover) {
  if (!cover) return null;
  const data = typeof cover === 'string' ? cover : cover.data;
  if (!data) return null;
  const base64 = String(data).includes(',') ? String(data).split(',').pop() : String(data);
  return {
    bytes: Buffer.from(base64, 'base64'),
    filename: cover.filename || 'cover.png',
    contentType: cover.mime || cover.contentType || 'image/png',
  };
}

async function handlePublish(request, response, cwd) {
  let body;
  try {
    body = JSON.parse(await readBody(request));
  } catch {
    sendJson(response, 400, { error: '请求不是合法 JSON' });
    return;
  }

  if (!body || typeof body !== 'object') {
    sendJson(response, 400, { error: '缺少稿件' });
    return;
  }

  const markdown = body.markdown;
  if (!markdown || typeof markdown !== 'string') {
    sendJson(response, 400, { error: '缺少稿件' });
    return;
  }

  const cover = decodeCover(body.cover);
  if (!cover) {
    sendJson(response, 400, { error: '推送草稿箱需要封面图' });
    return;
  }

  try {
    const result = await publishArticle({
      source: markdown,
      theme: body.theme,
      cwd,
      markdownDir: cwd,
      linksAtEnd: body.linksAtEnd,
      title: body.title,
      digest: body.digest,
      cover,
      author: body.author,
    });
    sendJson(response, 200, {
      ok: true,
      mediaId: result.mediaId,
      title: result.title,
      missingImages: result.missingImages,
    });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

export function startServer({
  host = '127.0.0.1',
  port = 3210,
  open = true,
  cwd = process.cwd(),
} = {}) {
  if (!existsSync(resolve(DOCS_ROOT, 'index.html'))) {
    throw new Error('还没有构建网页。请先执行 npm run build:web');
  }

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', `http://${host}:${port}`);

    if (url.pathname === '/api/status' && (request.method === 'GET' || request.method === 'HEAD')) {
      sendJson(response, 200, {
        ok: true,
        configured: isWechatConfigured(loadConfig({ cwd })),
      });
      return;
    }

    if (url.pathname === '/api/publish' && request.method === 'POST') {
      handlePublish(request, response, cwd).catch((error) => {
        if (!response.headersSent) {
          sendJson(response, 500, { error: error.message });
        }
      });
      return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      send(response, 405, 'Method not allowed');
      return;
    }
    serveStatic(url.pathname, response);
  });

  server.listen(port, host, () => {
    const href = `http://${host}:${port}/`;
    process.stdout.write(`微信发稿台已启动 ${href}\n`);
    if (isWechatConfigured(loadConfig({ cwd }))) {
      process.stdout.write('已读取公众号凭据，发稿台可推草稿箱。\n');
    }
    if (open) {
      openFile(href);
    }
  });

  return server;
}
