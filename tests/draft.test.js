import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  generateDigest,
  replaceImageSrc,
  stripMatchingH1,
  truncateDigest,
} from '../src/article.js';
import { isWechatConfigured, loadConfig } from '../src/config.js';
import { publishArticle, resolveImagePath } from '../src/publish.js';
import { buildDraftBody, encodeDraftBody } from '../src/publisher.js';
import { decodeCover } from '../src/server.js';

test('摘要按 UTF-8 字节截断', () => {
  assert.equal(truncateDigest('你好世界'), '你好世界');

  const digest = truncateDigest('测'.repeat(80), 120);
  assert.ok(Buffer.byteLength(digest, 'utf8') <= 120);
  assert.ok(digest.endsWith('...'));

  const fromHtml = generateDigest(`<p>${'汉'.repeat(80)}</p>`, 120);
  assert.ok(Buffer.byteLength(fromHtml, 'utf8') <= 120);
});

test('草稿 JSON 含封面 id，中文不被转义', () => {
  const body = buildDraftBody({
    title: '你好公众号',
    html: '<p>正文</p>',
    digest: '摘要',
    thumbMediaId: 'thumb-1',
    author: '发稿台',
  });
  assert.equal(body.articles[0].thumb_media_id, 'thumb-1');
  const json = encodeDraftBody(body);
  assert.ok(json.includes('你好公众号'));
  assert.ok(!json.includes('\\u4f60'));
  assert.throws(() => buildDraftBody({ title: '无封面', html: '<p>x</p>' }));
});

test('配置优先级：覆盖项和环境变量压过文件', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'wx-md-cwd-'));
  const home = mkdtempSync(join(tmpdir(), 'wx-md-home-'));
  writeFileSync(join(cwd, 'wx-markdown.json'), JSON.stringify({
    wechat: { appid: 'file-app', secret: 'file-secret', author: '文件作者' },
  }));

  const fromFile = loadConfig({ cwd, home, env: {} });
  assert.equal(fromFile.wechat.appid, 'file-app');
  assert.equal(fromFile.wechat.author, '文件作者');
  assert.equal(isWechatConfigured(fromFile), true);

  const fromEnv = loadConfig({
    cwd,
    home,
    env: { WECHAT_APPID: 'env-app', WECHAT_SECRET: 'env-secret' },
  });
  assert.equal(fromEnv.wechat.appid, 'env-app');
  assert.equal(fromEnv.wechat.secret, 'env-secret');
  assert.equal(fromEnv.wechat.author, '文件作者');

  const fromCli = loadConfig({
    cwd,
    home,
    env: { WECHAT_APPID: 'env-app', WECHAT_SECRET: 'env-secret' },
    overrides: { appid: 'cli-app', secret: 'cli-secret', author: '命令行' },
  });
  assert.equal(fromCli.wechat.appid, 'cli-app');
  assert.equal(fromCli.wechat.author, '命令行');
});

test('家目录配置在当前目录没有文件时生效', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'wx-md-empty-'));
  const home = mkdtempSync(join(tmpdir(), 'wx-md-cfg-'));
  const configDir = join(home, '.config', 'wx-markdown');
  mkdirSync(configDir, { recursive: true });
  writeFileSync(join(configDir, 'config.json'), JSON.stringify({
    wechat: { appid: 'home-app', secret: 'home-secret' },
  }));

  const config = loadConfig({ cwd, home, env: {} });
  assert.equal(config.wechat.appid, 'home-app');
});

test('本机 HTML 的图片 src 会换成 CDN', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'wx-md-img-'));
  writeFileSync(join(cwd, 'pic.png'), 'fake-png');
  writeFileSync(join(cwd, 'cover.png'), 'fake-cover');

  const wechat = {
    async getAccessToken() { return 'token'; },
    async uploadImage() { return 'https://mmbiz.qlogo.cn/pic.png'; },
    async uploadThumb() { return 'thumb-media'; },
    async createDraft(_token, article) {
      assert.match(article.html, /src="https:\/\/mmbiz.qlogo.cn\/pic.png"/);
      assert.ok(!article.html.includes('src="./pic.png"'));
      return { mediaId: 'draft-1' };
    },
  };

  const result = await publishArticle({
    source: '# 标题\n\n![](./pic.png)\n',
    inputPath: join(cwd, 'note.md'),
    cwd,
    markdownDir: cwd,
    cover: join(cwd, 'cover.png'),
    appid: 'wx',
    secret: 'secret',
    wechat,
  });

  assert.equal(result.mediaId, 'draft-1');
  assert.equal(result.uploadedImages.length, 1);
  assert.equal(result.missingImages.length, 0);
});

test('去掉与标题重复的首个 h1，替换图片地址', () => {
  const html = '<section><h1>标题</h1><p>正文</p><img src="./a.png"></section>';
  assert.equal(
    stripMatchingH1(html, '标题'),
    '<section><p>正文</p><img src="./a.png"></section>',
  );
  assert.equal(
    replaceImageSrc(html, './a.png', 'https://cdn.example/a.png'),
    '<section><h1>标题</h1><p>正文</p><img src="https://cdn.example/a.png"></section>',
  );
});

test('图片路径先看 cwd，再看稿件目录', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'wx-md-path-'));
  const markdownDir = mkdtempSync(join(tmpdir(), 'wx-md-md-'));
  writeFileSync(join(markdownDir, 'only-md.png'), 'x');
  assert.equal(
    resolveImagePath('only-md.png', { cwd, markdownDir }),
    join(markdownDir, 'only-md.png'),
  );
});

test('封面 base64 解码', () => {
  const cover = decodeCover({
    filename: 'cover.jpg',
    mime: 'image/jpeg',
    data: Buffer.from('hello').toString('base64'),
  });
  assert.equal(cover.filename, 'cover.jpg');
  assert.equal(cover.contentType, 'image/jpeg');
  assert.equal(Buffer.from(cover.bytes).toString(), 'hello');
});
