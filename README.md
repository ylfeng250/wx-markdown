# wx-md

把 Markdown 转成可粘贴到微信公众号的 HTML。提供命令行，以及本地网页发稿台。

公众号会丢掉外部 CSS。转换时把颜色和间距写成内联样式，复制后到公众号后台粘贴即可。

## 安装

```bash
npm i -g @yanglingfeng/wx-markdown
```

装好后命令是 `wx-md` 或 `wx-markdown`。

本地开发：

```bash
npm install
npm link
```

## 网页发稿台

```bash
wx-md serve
```

浏览器打开 `http://127.0.0.1:3210`。左边写 Markdown，右边看校样，点印章复制后去公众号后台粘贴。也可以把 `.md` 拖进页面，或点「打开稿件」。

```bash
wx-md serve --port 4173 --no-open
```

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
---
```

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

本地图片预览能看，粘贴进公众号后不会跟着走。请先改成图床链接，或在编辑器里重新上传。

## 要求

Node.js 18 或更高版本。
