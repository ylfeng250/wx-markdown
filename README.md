# 微信发稿台

`wx-markdown` 把 Markdown 收成公众号还能粘贴的 HTML。

公众号会剥掉外部样式。这里按主题排好标题、引用和代码，把颜色和间距写成内联 `style`。命令行一条指令复制到剪贴板；也可以打开网页，左边写稿，右边看校样。

- **命令行**：`wx-md article.md`，本地出 HTML 并复制；配了公众号凭据后可推到草稿箱
- **在线发稿台**：浏览器里预览、换主题、点复制。页面是静态的，可放到 GitHub Pages、Cloudflare Pages、Netlify。本地 `wx-md serve` 也可推草稿箱

## 安装

```bash
npm i -g wx-markdown
```

装好后命令是 `wx-md` 或 `wx-markdown`。

本地开发：

```bash
npm install
npm run build:web
npm link
```

## 在线发稿台

页面不依赖服务器接口，转换在浏览器里完成。本地预览：

```bash
npm run build:web
wx-md serve
```

浏览器打开 `http://127.0.0.1:3210`。左边写 Markdown，右边看校样，点复制后去公众号后台粘贴。也可以把 `.md` 拖进页面，或点「打开稿件」。本机已配置公众号凭据时，工具栏会出现「推草稿箱」。

```bash
wx-md serve --port 4173 --no-open
```

### 部署到静态托管

构建产物在 `docs/`：

```bash
npm run build:web
```

| 平台 | 做法 |
| --- | --- |
| GitHub Pages | 仓库 Settings → Pages → Source 选 **GitHub Actions**。推到 `master` / `main` 后会跑 `.github/workflows/pages.yml`。也可以选 Deploy from a branch，目录填 `/docs` |
| Cloudflare Pages | 构建命令 `npm run build:web`，输出目录 `docs` |
| Netlify | 同上，Publish directory 填 `docs` |

资源路径是相对的，挂在 `https://用户名.github.io/仓库名/` 下也能用。复制功能需要 HTTPS 或 localhost。

在线发稿台只用内置主题。自定义主题请走命令行。

## 命令行

```bash
wx-md article.md
```

默认会：

1. 在同目录生成 `article.html`
2. 把公众号正文复制到剪贴板
3. 不打开浏览器

接着去微信公众号后台粘贴。

```bash
wx-md article.md -t qing         # 青瓷主题
wx-md publish article.md --cover cover.png
wx-md gallery                    # 一次看完全部内置主题
wx-md article.md --open          # 需要时再打开预览页
wx-md article.md --no-copy       # 只出文件，不碰剪贴板
wx-md article.md --stdout        # 把正文打到标准输出
wx-md article.md --links-at-end  # 正文链接改成角标，集中到文末
wx-md themes                     # 列出主题
wx-md init-theme ocean           # 生成一份自定义主题
wx-md -h
```

文首 front matter 可指定标题和主题（命令行 `-t` 优先）：

```md
---
title: 文章标题
theme: ocean
digest: 列表摘要
cover: ./cover.png
author: 名字
---
```

## 推送到草稿箱

只写入公众号后台的草稿，不会群发。封面必填。

```bash
wx-md publish article.md --cover cover.png
wx-md publish article.md -t qing --title "标题" --digest "摘要"
```

凭据按这个顺序找：`--appid` / `--secret` → 环境变量 `WECHAT_APPID` / `WECHAT_SECRET` → 当前目录 `wx-markdown.json` → `~/.config/wx-markdown/config.json`。作者可用 `WECHAT_AUTHOR` 或 `wechat.author`。

```json
{
  "wechat": {
    "appid": "wx...",
    "secret": "...",
    "author": "名字"
  }
}
```

本地 `wx-md serve` 会读同一份配置。发稿台探测到本机接口后才显示「推草稿箱」。GitHub Pages 等静态托管没有接口，只能复制。网页里拖进去的稿件没有磁盘目录，正文里的相对路径图片推不上去；这类图请用命令行，或先换成图床链接。

## 主题

内置：

- `wechat` 青葱：绿条，常见公众号。
- `ink` 墨韵：标题居中，适合随笔。
- `tech` 终端：深色代码，技术文；默认文末链接。
- `qing` 青瓷：冷青居中，像馆藏说明。
- `dusk` 暮色：酒红短下划线，杂志口气。
- `folio` 折页：铜线压栏，编辑部气味。
- `washi` 和纸：靛蓝细线，信笺。
- `cinnabar` 朱砂：左侧宽印，像朱批。
- `lotus` 芙蕖：藕色题条，像花笺。
- `moss` 苔痕：石绿虚线，像山行笔记。
- `tide` 沧浪：双线压题，像潮线。
- `amber` 琥珀：蜜色蜡条，像旧书签。

自定义用 JSON 调色或 CSS 覆盖，文件放在 `themes/`，或把路径传给 `-t`。`extends` 也可以写 `tech`。

```bash
wx-md init-theme ocean
wx-md article.md -t ocean
```

```json
{
  "name": "ocean",
  "extends": "wechat",
  "tokens": {
    "accent": "#0B6E99",
    "heading": "#12303A",
    "text": "#334047"
  }
}
```

`extends` 可以是任一内置主题名，或 `none`。例子见 `examples/themes/`。一次看完全部：

```bash
wx-md gallery
```

把 Markdown 里的链接从正文挪到文末（公众号常见的「[1]」注记）：

```json
{
  "extends": "wechat",
  "linksAtEnd": true,
  "linksTitle": "参考链接"
}
```

CSS 主题在文件头写 `/* @wx-md links-at-end */`，标题用 `/* @wx-md links-title 参考链接 */`。命令行 `--links-at-end` / `--no-links-at-end` 以及文首 `linksAtEnd` 会覆盖主题。相同网址只编一个号。

CSS 主题：

```bash
wx-md init-theme brand --css
```

```css
/* @wx-md extends wechat */

#wechat-content h2 {
  border-left-color: #0B6E99;
}
```

## 图片

本地图片预览能看，粘贴进公众号后不会跟着走。请先改成图床链接，或在编辑器里重新上传。用 `wx-md publish` 时，正文里的本地图会上传到微信并替换地址。

## 要求

Node.js 18 或更高版本。
