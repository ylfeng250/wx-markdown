import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertMarkdown } from './convert.js';
import { presets, themeMeta, themeNames } from './themes.js';
import { openFile } from './open.js';

const WEB_ROOT = resolve(fileURLToPath(new URL('../web', import.meta.url)));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

function themeCatalog() {
  return Object.fromEntries(
    themeNames.map((name) => [
      name,
      {
        meta: themeMeta[name] ?? { title: name, blurb: '' },
        features: {
          linksAtEnd: Boolean(presets[name].features?.linksAtEnd),
          linksTitle: presets[name].features?.linksTitle || '参考链接',
        },
      },
    ]),
  );
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, headers);
  response.end(body);
}

function sendJson(response, status, data) {
  send(response, status, JSON.stringify(data), {
    'Content-Type': 'application/json; charset=utf-8',
  });
}

function readBody(request) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function serveStatic(urlPath, response) {
  const relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = resolve(WEB_ROOT, relative);
  if (!filePath.startsWith(WEB_ROOT)) {
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
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://${host}:${port}`);

    if (request.method === 'GET' && url.pathname === '/api/themes') {
      sendJson(response, 200, { themes: themeCatalog() });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/convert') {
      try {
        const payload = JSON.parse(await readBody(request));
        const converted = convertMarkdown(String(payload.markdown ?? ''), {
          theme: payload.theme,
          linksAtEnd: payload.linksAtEnd,
        });
        sendJson(response, 200, converted);
      } catch (error) {
        sendJson(response, 400, { error: error.message });
      }
      return;
    }

    if (request.method === 'GET') {
      serveStatic(url.pathname, response);
      return;
    }

    send(response, 405, 'Method not allowed');
  });

  server.listen(port, host, () => {
    const href = `http://${host}:${port}/`;
    process.stdout.write(`发稿台已启动 ${href}\n`);
    if (open) {
      openFile(href);
    }
  });

  return server;
}
