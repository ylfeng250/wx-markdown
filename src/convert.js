import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import juice from 'juice';
import { moveLinksToEnd } from './links.js';
import {
  findLocalImages,
  firstHeading,
  generateDigest,
  parseBool,
  parseFrontMatter,
  renderArticle,
} from './article.js';
import { resolveTheme } from './theme-loader.js';
import { themeNames } from './themes.js';

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

export { parseFrontMatter };

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

  const wrapped = renderArticle(markdown, {
    parse: (source) => marked.parse(source, { async: false }),
    collectLinks,
    linksTitle,
    moveLinksToEnd,
  });

  const html = juice.inlineContent(wrapped, resolved.css, {
    preserveImportant: true,
    preserveMediaQueries: false,
    preserveFontFaces: false,
    inlinePseudoElements: false,
  });

  return {
    html,
    title: meta.title || firstHeading(markdown),
    digest: meta.digest || generateDigest(html),
    cover: meta.cover || '',
    author: meta.author || '',
    localImages: findLocalImages(html),
    theme: resolved.label,
    themeSource: resolved.source,
  };
}

export { themeNames };
