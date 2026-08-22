import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/common';
import { moveLinksToEnd } from './links.js';
import {
  findLocalImages,
  firstHeading,
  parseBool,
  parseFrontMatter,
  renderArticle,
} from './article.js';
import { inlineCss } from './inline-css.js';
import { compileTheme, highlightCss, presets, themeMeta, themeNames } from './themes.js';

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

export function themeCatalog() {
  return Object.fromEntries(
    themeNames.map((name) => [
      name,
      {
        meta: themeMeta[name] ?? { title: name, blurb: '' },
        features: {
          linksAtEnd: Boolean(presets[name].features?.linksAtEnd),
          linksTitle: presets[name].features?.linksTitle || '参考链接',
        },
      },
    ]),
  );
}

export function convertMarkdown(raw, { theme, linksAtEnd } = {}) {
  const { meta, markdown } = parseFrontMatter(raw);
  const requested = theme ?? meta.theme ?? 'wechat';
  const name = presets[requested] ? requested : 'wechat';
  const preset = presets[name];
  const features = {
    linksAtEnd: Boolean(preset.features?.linksAtEnd),
    linksTitle: preset.features?.linksTitle || '参考链接',
  };
  const collectLinks = linksAtEnd
    ?? parseBool(meta.linksAtEnd ?? meta.links_at_end)
    ?? features.linksAtEnd;
  const linksTitle = meta.linksTitle || meta.links_title || features.linksTitle;

  const wrapped = renderArticle(markdown, {
    parse: (source) => marked.parse(source, { async: false }),
    collectLinks,
    linksTitle,
    moveLinksToEnd,
  });

  return {
    html: inlineCss(wrapped, `${compileTheme(preset)}\n${highlightCss}`),
    title: meta.title || firstHeading(markdown),
    localImages: findLocalImages(wrapped),
    theme: name,
    themeSource: 'builtin',
  };
}

export { parseFrontMatter, themeNames };
