import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import juice from 'juice';
import { moveLinksToEnd } from './links.js';
import { parseBool, resolveTheme } from './theme-loader.js';
import { highlightCss, themeNames } from './themes.js';

marked.use(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
);

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function parseFrontMatter(raw) {
  if (!raw.startsWith('---')) {
    return { meta: {}, markdown: raw };
  }

  const end = raw.indexOf('\n---', 3);
  if (end === -1) {
    return { meta: {}, markdown: raw };
  }

  const meta = {};
  for (const line of raw.slice(3, end).split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    meta[match[1]] = match[2].replace(/^['"]|['"]$/g, '').trim();
  }

  return {
    meta,
    markdown: raw.slice(end + 4).replace(/^\s*\n/, ''),
  };
}

function decorateImages(html) {
  return html.replace(/<img([^>]*?)>/g, (full, attrs) => {
    const altMatch = attrs.match(/alt="([^"]*)"/);
    const alt = altMatch?.[1]?.trim();
    if (!alt || /^image$/i.test(alt)) {
      return full;
    }
    return `${full}<p class="img-caption">${escapeHtml(alt)}</p>`;
  });
}

function replaceTaskBoxes(html) {
  return html
    .replace(
      /<input[^>]*type="checkbox"[^>]*checked[^>]*>/gi,
      '<span class="task-done">☑</span> ',
    )
    .replace(
      /<input[^>]*type="checkbox"[^>]*>/gi,
      '<span class="task-todo">☐</span> ',
    );
}

function findLocalImages(html) {
  return [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((src) => !/^https?:\/\//i.test(src) && !src.startsWith('data:'));
}

function firstHeading(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? '';
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function convertMarkdown(raw, {
  theme,
  cwd = process.cwd(),
  markdownDir,
  linksAtEnd,
} = {}) {
  const { meta, markdown } = parseFrontMatter(raw);
  const resolved = resolveTheme(theme ?? meta.theme ?? 'wechat', {
    cwd,
    markdownDir,
  });
  const collectLinks = linksAtEnd
    ?? parseBool(meta.linksAtEnd ?? meta.links_at_end)
    ?? resolved.features.linksAtEnd;
  const linksTitle = meta.linksTitle
    || meta.links_title
    || resolved.features.linksTitle;

  let body = marked.parse(markdown, { async: false });
  body = replaceTaskBoxes(body);
  body = decorateImages(body);
  if (collectLinks) {
    body = moveLinksToEnd(body, { title: linksTitle });
  }

  const wrapped = `<section id="wechat-content">${body}</section>`;
  const html = juice.inlineContent(wrapped, `${resolved.css}\n${highlightCss}`, {
    preserveImportant: true,
    preserveMediaQueries: false,
    preserveFontFaces: false,
    inlinePseudoElements: false,
  });

  return {
    html,
    title: meta.title || firstHeading(markdown),
    localImages: findLocalImages(html),
    theme: resolved.label,
    themeSource: resolved.source,
  };
}

export { themeNames };
