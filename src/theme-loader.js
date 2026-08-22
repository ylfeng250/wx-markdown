import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import {
  compileTheme,
  defaultTokens,
  presets,
  themeMeta,
  themeNames,
  tokenKeys,
} from './themes.js';

const THEME_EXTS = ['.json', '.css'];

export const defaultFeatures = {
  linksAtEnd: false,
  linksTitle: '参考链接',
};

function normalizeFeatures(partial = {}, fallback = defaultFeatures) {
  const title = typeof partial.linksTitle === 'string' ? partial.linksTitle.trim() : '';
  return {
    linksAtEnd: partial.linksAtEnd ?? fallback.linksAtEnd ?? false,
    linksTitle: title || fallback.linksTitle || defaultFeatures.linksTitle,
  };
}

function parseBool(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return undefined;
}

function featuresFromJson(data) {
  return {
    linksAtEnd: parseBool(data.linksAtEnd ?? data.links_at_end ?? data.endnotes),
    linksTitle: data.linksTitle ?? data.links_title,
  };
}

function featuresFromCss(css) {
  const titleMatch = css.match(/@wx-md\s+links-title\s+([^\n*]+)/);
  return {
    linksAtEnd: /@wx-md\s+links-at-end\b/.test(css) ? true : undefined,
    linksTitle: titleMatch?.[1]?.trim(),
  };
}

export { parseBool };

function isPathSpec(spec) {
  return (
    spec.includes('/') ||
    spec.includes('\\') ||
    THEME_EXTS.includes(extname(spec).toLowerCase())
  );
}

function themeSearchDirs(cwd, markdownDir) {
  const dirs = [resolve(cwd, 'themes')];
  if (markdownDir) {
    const next = resolve(markdownDir, 'themes');
    if (next !== dirs[0]) {
      dirs.push(next);
    }
  }
  return dirs;
}

function findNamedTheme(name, dirs) {
  for (const dir of dirs) {
    for (const ext of THEME_EXTS) {
      const file = join(dir, `${name}${ext}`);
      if (existsSync(file)) {
        return file;
      }
    }
  }
  return null;
}

function parseExtendsDirective(css) {
  const match = css.match(/@wx-md\s+extends\s+([A-Za-z0-9_-]+)/);
  return match?.[1] ?? 'wechat';
}

function loadJsonTheme(filePath) {
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`主题文件无法解析：${filePath}\n${error.message}`);
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`主题文件必须是对象：${filePath}`);
  }

  const layout = data.extends ?? data.layout ?? 'wechat';
  const nested = data.tokens && typeof data.tokens === 'object' ? data.tokens : {};
  const flat = Object.fromEntries(
    tokenKeys.filter((key) => key in data).map((key) => [key, data[key]]),
  );
  const tokens = { ...flat, ...nested };
  const unknown = Object.keys(nested).filter((key) => !tokenKeys.includes(key));
  if (unknown.length) {
    throw new Error(`主题里有未知 token：${unknown.join(', ')}。可选：${tokenKeys.join(', ')}`);
  }

  const extraCss = typeof data.css === 'string' ? data.css : '';
  const userFeatures = featuresFromJson(data);
  if (layout === 'none') {
    return {
      css: compileTheme({ tokens, layout: 'none', css: extraCss }),
      features: normalizeFeatures(userFeatures),
    };
  }

  const preset = presets[layout];
  if (!preset) {
    throw new Error(`主题 extends 只能是 ${[...themeNames, 'none'].join(', ')}，收到「${layout}」`);
  }

  return {
    css: compileTheme({
      tokens: { ...preset.tokens, ...tokens },
      layout: preset.layout,
      css: extraCss,
    }),
    features: normalizeFeatures(userFeatures, preset.features),
  };
}

function loadCssTheme(filePath) {
  const css = readFileSync(filePath, 'utf8');
  if (!css.trim()) {
    throw new Error(`主题 CSS 是空的：${filePath}`);
  }

  const layout = parseExtendsDirective(css);
  const userFeatures = featuresFromCss(css);
  if (layout === 'none') {
    return { css, features: normalizeFeatures(userFeatures) };
  }

  const preset = presets[layout];
  if (!preset) {
    throw new Error(`CSS 里 @wx-md extends 只能是 ${[...themeNames, 'none'].join(', ')}，收到「${layout}」`);
  }

  return {
    css: `${compileTheme(preset)}\n${css}`,
    features: normalizeFeatures(userFeatures, preset.features),
  };
}

function loadThemeFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === '.json') {
    return loadJsonTheme(filePath);
  }
  if (ext === '.css') {
    return loadCssTheme(filePath);
  }
  throw new Error(`主题文件只支持 .json / .css：${filePath}`);
}

function formatAvailable(cwd, markdownDir) {
  const local = listLocalThemes(cwd, markdownDir)
    .map((item) => item.name)
    .join(', ');
  const extras = local ? `；本地：${local}` : '';
  return `内置：${themeNames.join(', ')}${extras}`;
}

export function resolveTheme(spec, { cwd = process.cwd(), markdownDir } = {}) {
  if (!spec) {
    return {
      css: compileTheme(presets.wechat),
      label: 'wechat',
      source: 'builtin',
      features: normalizeFeatures(),
    };
  }

  const dirs = themeSearchDirs(cwd, markdownDir);

  if (isPathSpec(spec)) {
    const filePath = resolve(cwd, spec);
    if (!existsSync(filePath)) {
      const fromMd = markdownDir ? resolve(markdownDir, spec) : null;
      if (fromMd && existsSync(fromMd)) {
        const loaded = loadThemeFile(fromMd);
        return {
          css: loaded.css,
          label: basename(fromMd, extname(fromMd)),
          source: fromMd,
          features: loaded.features,
        };
      }
      throw new Error(`找不到主题文件：${spec}`);
    }
    const loaded = loadThemeFile(filePath);
    return {
      css: loaded.css,
      label: basename(filePath, extname(filePath)),
      source: filePath,
      features: loaded.features,
    };
  }

  const namedFile = findNamedTheme(spec, dirs);
  if (namedFile) {
    const loaded = loadThemeFile(namedFile);
    return {
      css: loaded.css,
      label: spec,
      source: namedFile,
      features: loaded.features,
    };
  }

  if (presets[spec]) {
    return {
      css: compileTheme(presets[spec]),
      label: spec,
      source: 'builtin',
      features: normalizeFeatures(presets[spec].features),
    };
  }

  throw new Error(`未知主题「${spec}」。${formatAvailable(cwd, markdownDir)}`);
}

export function listLocalThemes(cwd, markdownDir) {
  const seen = new Set();
  const items = [];

  for (const dir of themeSearchDirs(cwd, markdownDir)) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      const ext = extname(file).toLowerCase();
      if (!THEME_EXTS.includes(ext)) continue;
      const name = basename(file, ext);
      const key = `${name}${ext}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        name,
        file: join(dir, file),
      });
    }
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export function formatThemeList({ cwd = process.cwd(), markdownDir } = {}) {
  const lines = [
    '内置主题',
    ...themeNames.map((name) => {
      const meta = themeMeta[name];
      const pad = name.padEnd(10, ' ');
      return meta ? `  ${pad}${meta.title}  ${meta.blurb}` : `  ${name}`;
    }),
  ];
  const local = listLocalThemes(cwd, markdownDir);
  if (local.length) {
    lines.push('本地主题');
    for (const item of local) {
      lines.push(`  ${item.name}  (${item.file})`);
    }
  } else {
    lines.push('本地主题');
    lines.push('  （还没有。可用 wx-md init-theme <名字> 生成）');
  }
  return `${lines.join('\n')}\n`;
}

export function initTheme(name, {
  cwd = process.cwd(),
  from = 'wechat',
  css = false,
  force = false,
} = {}) {
  if (!/^[A-Za-z0-9_-]+$/.test(name)) {
    throw new Error('主题名只能包含字母、数字、连字符和下划线');
  }

  if (themeNames.includes(name)) {
    throw new Error(`「${name}」是内置主题名，换一个名字，避免混淆`);
  }

  const preset = presets[from];
  if (!preset) {
    throw new Error(`--from 只能是 ${themeNames.join(', ')}，收到「${from}」`);
  }

  const dir = resolve(cwd, 'themes');
  mkdirSync(dir, { recursive: true });

  const filePath = join(dir, `${name}${css ? '.css' : '.json'}`);
  if (existsSync(filePath) && !force) {
    throw new Error(`已存在 ${filePath}，加上 --force 可覆盖`);
  }

  if (css) {
    writeFileSync(filePath, cssTemplate(name, from, preset.tokens), 'utf8');
  } else {
    writeFileSync(filePath, `${JSON.stringify(jsonTemplate(name, from, preset.tokens), null, 2)}\n`, 'utf8');
  }

  return filePath;
}

function jsonTemplate(name, from, tokens) {
  return {
    name,
    extends: from,
    linksAtEnd: false,
    linksTitle: '参考链接',
    tokens: { ...defaultTokens, ...tokens },
  };
}

function cssTemplate(name, from, tokens) {
  return `/* @wx-md extends ${from} */
/* 主题：${name}。只写要覆盖的规则，选择器放在 #wechat-content 下。 */

#wechat-content h2 {
  border-left-color: ${tokens.accent};
}

#wechat-content h3 {
  color: ${tokens.accent};
}

#wechat-content blockquote {
  border-left-color: ${tokens.accent};
}
`;
}
