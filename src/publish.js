import { existsSync } from 'node:fs';
import { basename, extname, isAbsolute, resolve } from 'node:path';
import {
  generateDigest,
  replaceImageSrc,
  stripMatchingH1,
  truncateDigest,
} from './article.js';
import { isWechatConfigured, loadConfig, missingCredentialHint } from './config.js';
import { convertMarkdown } from './convert.js';
import { createDraft } from './publisher.js';
import { getAccessToken, uploadImage, uploadThumb } from './wechat-api.js';

const defaultWechat = {
  getAccessToken,
  uploadImage,
  uploadThumb,
  createDraft,
};

export function resolveImagePath(src, { cwd = process.cwd(), markdownDir } = {}) {
  if (isAbsolute(src)) return src;
  const fromCwd = resolve(cwd, src);
  if (existsSync(fromCwd) || !markdownDir) return fromCwd;
  return resolve(markdownDir, src);
}

export async function publishArticle({
  source,
  inputPath,
  theme,
  cwd = process.cwd(),
  markdownDir,
  linksAtEnd,
  title,
  digest,
  cover,
  author,
  appid,
  secret,
  onLog = () => {},
  wechat = defaultWechat,
} = {}) {
  const config = loadConfig({ cwd, overrides: { appid, secret, author } });
  if (!isWechatConfigured(config)) {
    throw new Error(missingCredentialHint());
  }

  const converted = convertMarkdown(source, {
    theme,
    cwd,
    markdownDir,
    linksAtEnd,
  });

  const fallbackName = inputPath ? basename(inputPath, extname(inputPath)) : '未命名';
  const finalTitle = title || converted.title || fallbackName;
  let html = stripMatchingH1(converted.html, finalTitle);
  const finalDigest = truncateDigest(digest || converted.digest || generateDigest(html));
  const finalAuthor = author || converted.author || config.wechat.author;
  const coverInput = cover || converted.cover;

  if (!coverInput) {
    throw new Error('推送草稿箱需要封面图。请用 --cover 指定，或在文首写 cover: 封面.png');
  }

  const token = await wechat.getAccessToken(config.wechat.appid, config.wechat.secret);
  const uploadedImages = [];
  const missingImages = [];

  for (const src of converted.localImages) {
    const filePath = resolveImagePath(src, { cwd, markdownDir });
    if (!existsSync(filePath)) {
      missingImages.push(src);
      onLog(`警告：找不到图片 ${src}`);
      continue;
    }
    onLog(`上传图片：${src}`);
    const url = await wechat.uploadImage(token, filePath);
    html = replaceImageSrc(html, src, url);
    uploadedImages.push({ src, url });
  }

  let thumbSource = coverInput;
  if (typeof coverInput === 'string') {
    const coverPath = resolveImagePath(coverInput, { cwd, markdownDir });
    if (!existsSync(coverPath)) {
      throw new Error(`找不到封面：${coverInput}`);
    }
    thumbSource = coverPath;
    onLog(`上传封面：${coverInput}`);
  } else {
    onLog('上传封面');
  }

  const thumbMediaId = await wechat.uploadThumb(token, thumbSource);
  const draft = await wechat.createDraft(token, {
    title: finalTitle,
    html,
    digest: finalDigest,
    thumbMediaId,
    author: finalAuthor,
  });

  return {
    mediaId: draft.mediaId,
    title: finalTitle,
    digest: finalDigest,
    author: finalAuthor,
    html,
    uploadedImages,
    missingImages,
    theme: converted.theme,
  };
}
