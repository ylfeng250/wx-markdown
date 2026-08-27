import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

const API_TIMEOUT = 30_000;
const tokenCache = new Map();

const IMAGE_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
};

export function guessContentType(filePath) {
  return IMAGE_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream';
}

export function clearTokenCache() {
  tokenCache.clear();
}

async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`微信接口返回无法解析：${text.slice(0, 200)}`);
  }
}

function wechatError(action, data) {
  const errcode = data?.errcode ?? 'unknown';
  const errmsg = data?.errmsg ?? 'unknown error';
  return new Error(`微信${action}失败：errcode=${errcode}, errmsg=${errmsg}`);
}

async function toMediaPart(image) {
  if (typeof image === 'string') {
    return {
      bytes: await readFile(image),
      filename: basename(image),
      contentType: guessContentType(image),
    };
  }
  if (!image?.bytes) {
    throw new Error('缺少要上传的图片');
  }
  return {
    bytes: image.bytes,
    filename: image.filename || 'image.png',
    contentType: image.contentType || 'application/octet-stream',
  };
}

function mediaForm(part) {
  const form = new FormData();
  form.append('media', new Blob([part.bytes], { type: part.contentType }), part.filename);
  return form;
}

export async function getAccessToken(appid, secret, {
  fetchImpl = fetch,
  now = Date.now,
  forceRefresh = false,
} = {}) {
  if (!appid || !secret) {
    throw new Error('缺少公众号 appid 或 secret');
  }

  const cached = tokenCache.get(appid);
  if (!forceRefresh && cached && now() < cached.expiresAt) {
    return cached.accessToken;
  }

  const url = new URL('https://api.weixin.qq.com/cgi-bin/token');
  url.searchParams.set('grant_type', 'client_credential');
  url.searchParams.set('appid', appid);
  url.searchParams.set('secret', secret);

  const response = await fetchImpl(url, { signal: AbortSignal.timeout(API_TIMEOUT) });
  const data = await readJson(response);
  if (!data.access_token) {
    throw wechatError('获取 access_token', data);
  }

  tokenCache.set(appid, {
    accessToken: data.access_token,
    expiresAt: now() + ((data.expires_in ?? 7200) - 300) * 1000,
  });
  return data.access_token;
}

export async function uploadImage(accessToken, image, { fetchImpl = fetch } = {}) {
  const url = new URL('https://api.weixin.qq.com/cgi-bin/media/uploadimg');
  url.searchParams.set('access_token', accessToken);
  const response = await fetchImpl(url, {
    method: 'POST',
    body: mediaForm(await toMediaPart(image)),
    signal: AbortSignal.timeout(API_TIMEOUT),
  });
  const data = await readJson(response);
  if (!data.url) {
    throw wechatError('上传正文图', data);
  }
  return data.url;
}

export async function uploadThumb(accessToken, image, { fetchImpl = fetch } = {}) {
  const url = new URL('https://api.weixin.qq.com/cgi-bin/material/add_material');
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('type', 'image');
  const response = await fetchImpl(url, {
    method: 'POST',
    body: mediaForm(await toMediaPart(image)),
    signal: AbortSignal.timeout(API_TIMEOUT),
  });
  const data = await readJson(response);
  if (!data.media_id) {
    throw wechatError('上传封面', data);
  }
  return data.media_id;
}
