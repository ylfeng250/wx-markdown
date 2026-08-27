import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { copyHtml } from './clipboard.js';
import { convertMarkdown, themeNames } from './convert.js';
import { gallerySource, renderGalleryPage } from './gallery.js';
import { formatThemeList, initTheme } from './theme-loader.js';
import { openFile } from './open.js';
import { renderPreviewPage } from './preview.js';
import { publishArticle } from './publish.js';
import { startServer } from './server.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const HELP = `wx-md ${version} — 微信发稿台。Markdown 转微信公众号 HTML

用法:
  wx-md <markdown文件> [选项]
  wx-md publish <markdown文件> [选项]
  wx-md serve [选项]
  wx-md gallery [markdown文件]
  wx-md themes
  wx-md init-theme <名字> [选项]

转换后会在终端完成：写出 HTML，并把正文复制到剪贴板。
然后打开公众号后台粘贴即可。本地配置了公众号凭据后，也可以推到草稿箱。

选项:
  -o, --out <文件>     输出路径（默认与 md 同名同目录）
  -t, --theme <主题>   ${themeNames.join(' | ')} | 本地主题名 | .json/.css 路径
      --copy           复制正文到剪贴板（默认开启）
      --no-copy        不复制
      --stdout         把公众号正文打到标准输出，方便管道
      --open           用浏览器打开预览页
      --no-open        不打开浏览器（默认）
      --links-at-end   把正文链接收到文末（覆盖主题设置）
      --no-links-at-end  正文里保留原链接
      --cover <文件>   封面图（推草稿箱必填）
      --title <标题>   覆盖文章标题
      --digest <摘要>  覆盖摘要（不超过 120 字节）
      --author <作者>  覆盖作者
      --appid <id>     公众号 AppID
      --secret <密钥>  公众号 AppSecret
      --port <端口>    网页服务端口（默认 3210）
      --host <地址>    网页服务地址（默认 127.0.0.1）
      --list-themes    列出内置和本地主题
  -h, --help           显示帮助
  -v, --version        显示版本

init-theme:
  --from <主题>        以 ${themeNames.join(' | ')} 为底稿（默认 wechat）
  --css                生成 CSS 主题
  --force              覆盖已有文件

示例:
  wx-md article.md
  wx-md serve
  wx-md publish article.md --cover cover.png
  wx-md article.md -t qing
  wx-md gallery
  wx-md gallery article.md
  wx-md article.md --stdout > body.html
  wx-md init-theme ocean
`;

function parseArgs(argv) {
  const args = {
    _: [],
    open: false,
    openSet: false,
    copy: true,
    copySet: false,
    stdout: false,
    theme: null,
    out: null,
    help: false,
    version: false,
    listThemes: false,
    from: 'wechat',
    css: false,
    force: false,
    linksAtEnd: undefined,
    cover: null,
    title: null,
    digest: null,
    author: null,
    appid: null,
    secret: null,
    port: 3210,
    host: '127.0.0.1',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '-o':
      case '--out':
        args.out = argv[i + 1];
        i += 1;
        break;
      case '-t':
      case '--theme':
        args.theme = argv[i + 1];
        i += 1;
        break;
      case '--from':
        args.from = argv[i + 1];
        i += 1;
        break;
      case '--css':
        args.css = true;
        break;
      case '--force':
        args.force = true;
        break;
      case '--copy':
        args.copy = true;
        args.copySet = true;
        break;
      case '--no-copy':
        args.copy = false;
        args.copySet = true;
        break;
      case '--stdout':
        args.stdout = true;
        if (!args.copySet) {
          args.copy = false;
        }
        break;
      case '--open':
        args.open = true;
        args.openSet = true;
        break;
      case '--no-open':
        args.open = false;
        args.openSet = true;
        break;
      case '--links-at-end':
        args.linksAtEnd = true;
        break;
      case '--no-links-at-end':
        args.linksAtEnd = false;
        break;
      case '--cover':
        args.cover = argv[i + 1];
        i += 1;
        break;
      case '--title':
        args.title = argv[i + 1];
        i += 1;
        break;
      case '--digest':
        args.digest = argv[i + 1];
        i += 1;
        break;
      case '--author':
        args.author = argv[i + 1];
        i += 1;
        break;
      case '--appid':
        args.appid = argv[i + 1];
        i += 1;
        break;
      case '--secret':
        args.secret = argv[i + 1];
        i += 1;
        break;
      case '--port':
        args.port = Number(argv[i + 1]);
        i += 1;
        break;
      case '--host':
        args.host = argv[i + 1];
        i += 1;
        break;
      case '--list-themes':
        args.listThemes = true;
        break;
      case '-h':
      case '--help':
        args.help = true;
        break;
      case '-v':
      case '--version':
        args.version = true;
        break;
      default:
        if (token.startsWith('-')) {
          throw new Error(`未知参数：${token}`);
        }
        args._.push(token);
    }
  }

  return args;
}

function defaultOutPath(inputPath) {
  const ext = extname(inputPath);
  const name = basename(inputPath, ext || undefined);
  return resolve(dirname(inputPath), `${name}.html`);
}

function displayPath(filePath, requested) {
  if (isAbsolute(requested || '')) {
    return filePath;
  }
  const cwd = `${process.cwd()}/`;
  return filePath.startsWith(cwd) ? filePath.slice(cwd.length) : filePath;
}

function writeGallery(args) {
  const input = args._[1];
  const inputPath = input ? resolve(input) : null;
  const source = gallerySource(inputPath ? readFileSync(inputPath, 'utf8') : '');
  const outPath = args.out
    ? resolve(args.out)
    : resolve(process.cwd(), 'wx-md-gallery.html');

  writeFileSync(
    outPath,
    renderGalleryPage({
      source,
      cwd: process.cwd(),
      markdownDir: inputPath ? dirname(inputPath) : process.cwd(),
      sourceName: inputPath ? basename(inputPath) : '校样',
    }),
    'utf8',
  );

  process.stdout.write(`已生成 ${displayPath(outPath, args.out)}\n`);
  process.stdout.write(`共 ${themeNames.length} 套主题。\n`);

  if (args.openSet ? args.open : true) {
    openFile(outPath);
    process.stdout.write('已打开裱画页。\n');
  }
}

function requireOptionValue(value, flag) {
  if (value === undefined) {
    throw new Error(`${flag} 缺少参数`);
  }
}

async function cmdPublish(args) {
  const input = args._[1];
  if (!input) {
    throw new Error('用法：wx-md publish <markdown文件> --cover <封面>');
  }

  const inputPath = resolve(input);
  const source = readFileSync(inputPath, 'utf8');
  const result = await publishArticle({
    source,
    inputPath,
    theme: args.theme,
    cwd: process.cwd(),
    markdownDir: dirname(inputPath),
    linksAtEnd: args.linksAtEnd,
    title: args.title,
    digest: args.digest,
    cover: args.cover,
    author: args.author,
    appid: args.appid,
    secret: args.secret,
    onLog: (line) => process.stdout.write(`${line}\n`),
  });

  process.stdout.write(`已推到草稿箱。media_id: ${result.mediaId}\n`);
  if (result.missingImages.length) {
    process.stderr.write(`有 ${result.missingImages.length} 张本地图片未上传，草稿里仍是原路径。\n`);
  }
  return true;
}

async function convertFile(args) {
  if (args.out === undefined) {
    throw new Error('--out 缺少参数');
  }
  if (args.theme === undefined) {
    throw new Error('--theme 缺少参数');
  }

  const input = args._[0];
  if (!input) {
    process.stderr.write(HELP);
    process.exitCode = 1;
    return;
  }

  const inputPath = resolve(input);
  const source = readFileSync(inputPath, 'utf8');
  const converted = convertMarkdown(source, {
    theme: args.theme,
    cwd: process.cwd(),
    markdownDir: dirname(inputPath),
    linksAtEnd: args.linksAtEnd,
  });

  if (args.stdout) {
    process.stdout.write(`${converted.html}\n`);
  }

  const writeFile = !args.stdout || Boolean(args.out);
  let outPath = null;
  if (writeFile) {
    outPath = args.out ? resolve(args.out) : defaultOutPath(inputPath);
    const page = renderPreviewPage({
      articleHtml: converted.html,
      title: converted.title,
      sourceName: basename(inputPath),
      theme: converted.theme,
      localImages: converted.localImages,
    });
    writeFileSync(outPath, page, 'utf8');
    if (!args.stdout) {
      process.stdout.write(`已生成 ${displayPath(outPath, args.out)}\n`);
    }
  }

  if (converted.themeSource !== 'builtin' && !args.stdout) {
    process.stdout.write(`主题 ${converted.theme} ← ${converted.themeSource}\n`);
  }

  if (converted.localImages.length && !args.stdout) {
    process.stdout.write(
      `注意：发现 ${converted.localImages.length} 张本地图片，公众号里需要图床或重新上传。\n`,
    );
  }

  if (args.copy) {
    try {
      await copyHtml(converted.html);
      if (!args.stdout) {
        process.stdout.write('已复制到剪贴板，打开公众号后台粘贴即可。\n');
      }
    } catch (error) {
      if (!args.stdout) {
        process.stderr.write(`复制失败：${error.message}\n`);
        process.stderr.write('可用 --open 打开预览页，再手动复制。\n');
      }
    }
  }

  if (args.open && outPath) {
    openFile(outPath);
    if (!args.stdout) {
      process.stdout.write('已打开预览页。\n');
    }
  }
}

async function runUtility(args) {
  if (args.help) {
    process.stdout.write(HELP);
    return true;
  }

  if (args.version) {
    process.stdout.write(`${version}\n`);
    return true;
  }

  if (args.listThemes || args._[0] === 'themes') {
    process.stdout.write(formatThemeList({ cwd: process.cwd() }));
    return true;
  }

  if (args._[0] === 'init-theme') {
    const name = args._[1];
    if (!name) {
      throw new Error(`用法：wx-md init-theme <名字> [--from ${themeNames.join('|')}] [--css] [--force]`);
    }
    requireOptionValue(args.from, '--from');
    const filePath = initTheme(name, {
      cwd: process.cwd(),
      from: args.from,
      css: args.css,
      force: args.force,
    });
    process.stdout.write(`已创建 ${displayPath(filePath)}\n`);
    process.stdout.write(`改颜色后执行：wx-md 你的文章.md -t ${name}\n`);
    return true;
  }

  if (args._[0] === 'gallery') {
    writeGallery(args);
    return true;
  }

  if (args._[0] === 'publish') {
    return cmdPublish(args);
  }

  if (args._[0] === 'serve') {
    if (!Number.isInteger(args.port) || args.port <= 0) {
      throw new Error('--port 必须是正整数');
    }
    if (args.host === undefined) {
      throw new Error('--host 缺少参数');
    }
    startServer({
      host: args.host,
      port: args.port,
      open: args.openSet ? args.open : true,
    });
    return true;
  }

  return false;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (await runUtility(args)) {
    return;
  }
  await convertFile(args);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
