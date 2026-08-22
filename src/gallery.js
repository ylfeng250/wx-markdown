import { convertMarkdown } from './convert.js';
import { themeMeta, themeNames } from './themes.js';

const SAMPLE = `---
title: 主题校样
---

# 把字排好再发

技术文章也值得被好好读完。字距、标题和引用，会决定人要不要往下看。

## 先把结构说清楚

段落里可以有 **加粗**、\`行内代码\`，以及一篇该去文末的[说明文档](https://commonmark.org/)。

> 引用应当像旁白，而不是又一个灰盒子。

### 代码只是证据

\`\`\`js
const theme = 'qing';
console.log(theme);
\`\`\`

| 元素 | 作用 |
| --- | --- |
| 标题 | 分出层次 |
| 引用 | 换一口气 |
`;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderGalleryPage({ source, cwd, markdownDir, sourceName }) {
  const cards = themeNames.map((name) => {
    const converted = convertMarkdown(source, {
      theme: name,
      cwd,
      markdownDir,
    });
    const meta = themeMeta[name] ?? { title: name, blurb: '' };
    return `
      <article class="card">
        <header class="card-head">
          <p class="card-title">${escapeHtml(meta.title)}</p>
          <p class="card-key">${escapeHtml(name)}</p>
          <p class="card-blurb">${escapeHtml(meta.blurb)}</p>
        </header>
        <div class="sheet">
          ${converted.html.replace('id="wechat-content"', `id="wechat-content-${name}"`)}
        </div>
      </article>`;
  });

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>主题裱画 · wx-md</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; }
    body {
      min-height: 100vh;
      background: #d8d2c8;
      color: #3c3834;
      font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    }
    .hall {
      max-width: 920px;
      margin: 0 auto;
      padding: 36px 20px 72px;
    }
    .mast {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-bottom: 16px;
      margin-bottom: 28px;
      border-bottom: 1px solid #b7b0a6;
    }
    .mast h1 {
      margin: 0;
      font-family: "Songti SC", "STSong", "Noto Serif CJK SC", serif;
      font-size: 26px;
      letter-spacing: 8px;
      font-weight: 600;
    }
    .mast span {
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-size: 11px;
      letter-spacing: 0.08em;
      color: #6f6a63;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 28px;
    }
    .card-head {
      margin-bottom: 12px;
    }
    .card-title {
      margin: 0;
      font-family: "Songti SC", "STSong", serif;
      font-size: 22px;
      letter-spacing: 6px;
    }
    .card-key {
      margin: 4px 0 0;
      font-family: ui-monospace, Menlo, monospace;
      font-size: 11px;
      color: #6f6a63;
    }
    .card-blurb {
      margin: 4px 0 0;
      font-size: 13px;
      color: #5c574f;
    }
    .sheet {
      background: #fff;
      padding: 22px 18px 32px;
      box-shadow: 0 18px 40px rgba(40, 34, 28, 0.12);
    }
  </style>
</head>
<body>
  <div class="hall">
    <header class="mast">
      <h1>裱画</h1>
      <span>${escapeHtml(sourceName)}</span>
    </header>
    <div class="grid">
      ${cards.join('\n')}
    </div>
  </div>
</body>
</html>
`;
}

export function gallerySource(fileText) {
  return fileText && fileText.trim() ? fileText : SAMPLE;
}
