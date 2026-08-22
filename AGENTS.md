# AGENTS.md

给后续改这个仓库的人（和代理）用。用户文档在 `README.md`，这里只写开发约定。

## 产品

**微信发稿台**（npm：`wx-markdown`，命令：`wx-md` / `wx-markdown`）。

把 Markdown 收成公众号能粘贴的 HTML。公众号会剥掉外部 CSS，所以正文必须是内联 `style`。两条入口，不要合成一个：

| 入口 | 谁用 | 转换实现 | 主题 |
| --- | --- | --- | --- |
| CLI | `wx-md article.md` | `src/convert.js` + juice | 内置 + 本地 `themes/` + 文件路径 |
| 网页 | 静态站 / `wx-md serve` | `src/web-convert.js` + 浏览器 CSSOM | 仅内置 |

网页是产品面，要能部署到 GitHub Pages / Cloudflare Pages / Netlify。不要再给网页加 Node 接口。

## 目录

```
bin/wx-md.js              入口，只转调 src/cli.js
src/cli.js                参数、帮助、子命令
src/article.js            共用：front matter、图片题注、任务框、包一层 #wechat-content
src/links.js              文末链接
src/themes.js             内置主题 token / 布局编译 / highlight 样式
src/layouts-editorial.js  青瓷、暮色、折页、和纸、朱砂的版式
src/theme-loader.js       CLI 读本地 JSON/CSS 主题（Node fs）
src/convert.js            CLI 转换（juice 内联）
src/web-convert.js        浏览器转换（不可 import node: / juice / theme-loader）
src/inline-css.js         网页用：把主题 CSS 写进 style
src/server.js             只托管 docs/，无 API
src/preview.js            CLI --open 的预览页（不是发稿台）
src/gallery.js            wx-md gallery
src/clipboard.js          系统剪贴板
web/                      发稿台源码（index.html、app.css、main.js）
scripts/build-web.js      esbuild 打到 docs/
docs/                     静态产物，serve 和 Pages 都读这里
.github/workflows/pages.yml
articles/                 介绍文章，不是库代码
examples/                 示例稿和自定义主题样例
```

`package.json` 的 `files` 只发布 `bin`、`src`、`docs`。改网页后必须更新 `docs/`。

## 改哪里

- **解析 / 题注 / 文末链接**：先改 `src/article.js` 或 `src/links.js`，再确认 CLI 和网页两边都还通。
- **内置主题颜色或版式**：`src/themes.js`、`src/layouts-editorial.js`。token 名以 `tokenKeys` 为准，不要偷偷加新 key 却不更新 `theme-loader`。
- **CLI 行为、自定义主题、剪贴板、gallery**：`src/convert.js` 和 Node 侧文件。本地主题继续走 `theme-loader.js`。
- **发稿台 UI**：只改 `web/`，然后 `npm run build:web`。不要手改 `docs/app.js`。
- **网页转换**：`src/web-convert.js`、`src/inline-css.js`。这里必须能被 esbuild 打进浏览器。

## 命令

```bash
npm install
npm run build:web                          # 更新 docs/
node bin/wx-md.js examples/demo.md --no-copy --no-open
node bin/wx-md.js serve --port 4173 --no-open
node bin/wx-md.js examples/demo.md -t qing --no-copy --no-open
node bin/wx-md.js themes
```

Node 18+。ESM only（`"type": "module"`）。

改完转换逻辑，至少跑一遍 demo，并看生成的 HTML 里 `#wechat-content` 的标签带不带 `style=`。改完网页，构建后再打开 `wx-md serve` 看，不要只开 `web/index.html`（源码里的 `app.js` 是构建产物名，源入口是 `web/main.js`）。

## 必须守住

1. **输出是内联样式的 `#wechat-content`**。预览可以看，复制出去才是产品。
2. **两条转换链并存**。不要为了共用把 juice 打进网页，也不要把 `fs` / `process.cwd()` 引进 `web-convert.js`。
3. **网页保持静态**。`src/server.js` 只 serve `docs/`。GitHub Pages 没有 Node。
4. **复制用 `text/html` + `text/plain`**。只写纯文本，公众号会丢颜色。
5. **文末链接**：主题可默认开启（如 `tech`），front matter / `--links-at-end` / 页面开关能覆盖。同一 URL 只编一个号。
6. **本地图片**：预览可以，粘贴进公众号不会跟着走。不要假装做了图床。
7. **`.gitignore` 忽略 `*.html`**，例外只有 `web/index.html`、`docs/index.html`。CLI 生成的 `article.html`、`examples/demo.html` 不要提交。本地 `themes/` 也不要提交。

## 文案和 UI

- 产品名：**微信发稿台**。命令仍叫 `wx-md`。
- 界面用中文，句子短，说明做什么，不解释实现。按钮：打开稿件、复制、已复制、失败。栏目标：原稿、校样。
- 发稿台视觉：青瓷纸面、宋体字标、双圈小印。克制，不要再加深色木案或盖住预览的大印章。
- 用户可见字符串改了，同步 `README.md`、`src/cli.js` 的帮助、`web/main.js` 的示例稿。

## 主题

内置：`wechat` 青葱、`ink` 墨韵、`tech` 终端、`qing` 青瓷、`dusk` 暮色、`folio` 折页、`washi` 和纸、`cinnabar` 朱砂。

选择器写在 `#wechat-content` 下。`extends` 只能是上述名字或 `none`。CSS 主题指令：`@wx-md extends`、`@wx-md links-at-end`、`@wx-md links-title`。

网页高亮用 `highlight.js/lib/common`，体积小；CLI 用完整 `highlight.js`。不要为了多一种冷门语言把整包打进 `docs/app.js`。

## 发布

- npm：`npm publish` 会走 `prepublishOnly`（先 `build:web`）。版本在 `package.json`，帮助里的版本从这里读。
- 静态站：推 `master` / `main` 后由 `.github/workflows/pages.yml` 部署 `docs/`。也可把 Pages 指到分支的 `/docs`。
- 资源用相对路径，保证能挂在 `https://用户.github.io/仓库/` 下。复制需要 HTTPS 或 localhost。

## 不要做

- 不要加框架、不要给发稿台接后端、不要在网页里读用户磁盘上的自定义主题。
- 不要把 `docs/app.js` 当源码改。
- 不要为了「好看」改公众号正文的默认字号和行高，那是主题 token 的事。
- 不要提交 `.env`、npm token、本地 `themes/`。
- 除非用户明确要求，否则不要 commit、不要 push、不要改 git config。
