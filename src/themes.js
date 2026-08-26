import {
  compileAmberLayout,
  compileCinnabarLayout,
  compileDuskLayout,
  compileFolioLayout,
  compileLotusLayout,
  compileMossLayout,
  compileQingLayout,
  compileTerminalCode,
  compileTideLayout,
  compileWashiLayout,
} from './layouts-editorial.js';

export const defaultTokens = {
  accent: '#07c160',
  heading: '#262626',
  text: '#3f3f3f',
  muted: '#999999',
  link: '#576b95',
  strong: '#262626',
  quoteBg: '#f7f7f7',
  quoteText: '#666666',
  codeBg: '#f6f8fa',
  codeInline: '#c41a3b',
  codeInlineBg: '#f6f6f6',
  codeBlock: '#24292e',
  border: '#eaecef',
  tableBorder: '#e5e5e5',
  tableHead: '#f6f8fa',
  letterSpacing: '0.5px',
  headingLetterSpacing: '1px',
  fontSize: '16px',
  h1Size: '22px',
  h2Size: '18px',
  h3Size: '16px',
};

export const tokenKeys = Object.keys(defaultTokens);

const layouts = [
  'wechat',
  'ink',
  'tech',
  'qing',
  'dusk',
  'folio',
  'washi',
  'cinnabar',
  'lotus',
  'moss',
  'tide',
  'amber',
  'none',
];

export function compileArticleCss(tokens) {
  const t = tokens;
  return `
#wechat-content {
  margin: 0;
  padding: 0;
  font-size: ${t.fontSize};
  color: ${t.text};
  letter-spacing: ${t.letterSpacing};
  line-height: 1.8;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  word-break: break-word;
  text-align: justify;
}

#wechat-content h1,
#wechat-content h2,
#wechat-content h3,
#wechat-content h4 {
  text-align: left;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif;
}

#wechat-content h1 {
  font-size: ${t.h1Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 24px;
  letter-spacing: ${t.headingLetterSpacing};
}

#wechat-content h2 {
  font-size: ${t.h2Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.45;
  margin: 32px 0 16px;
}

#wechat-content h3 {
  font-size: ${t.h3Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.5;
  margin: 28px 0 12px;
}

#wechat-content h4 {
  font-size: ${t.fontSize};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.5;
  margin: 24px 0 12px;
}

#wechat-content p {
  font-size: ${t.fontSize};
  color: ${t.text};
  line-height: 1.8;
  margin: 16px 0;
  letter-spacing: ${t.letterSpacing};
  text-align: justify;
}

#wechat-content a {
  color: ${t.link};
  text-decoration: none;
}

#wechat-content strong {
  color: ${t.strong};
  font-weight: 700;
}

#wechat-content em {
  font-style: italic;
}

#wechat-content del {
  color: ${t.muted};
}

#wechat-content blockquote {
  margin: 16px 0;
  padding: 12px 16px;
  background-color: ${t.quoteBg};
  border-left: 4px solid ${t.border};
}

#wechat-content blockquote p {
  color: ${t.quoteText};
  margin: 0;
}

#wechat-content code {
  font-family: Consolas, "SF Mono", Menlo, Monaco, monospace;
  font-size: 14px;
  color: ${t.codeInline};
  background-color: ${t.codeInlineBg};
  padding: 2px 6px;
  border-radius: 3px;
  letter-spacing: 0;
}

#wechat-content pre {
  background-color: ${t.codeBg};
  padding: 16px;
  border-radius: 6px;
  margin: 16px 0;
  overflow: hidden;
  border: 1px solid ${t.border};
}

#wechat-content pre code {
  color: ${t.codeBlock};
  background-color: transparent;
  padding: 0;
  font-size: 13px;
  line-height: 1.65;
  display: block;
  white-space: pre-wrap;
  word-break: break-all;
  letter-spacing: 0;
}

#wechat-content ul,
#wechat-content ol {
  margin: 16px 0;
  padding-left: 24px;
  color: ${t.text};
}

#wechat-content li {
  margin: 8px 0;
  line-height: 1.8;
  font-size: ${t.fontSize};
  color: ${t.text};
  letter-spacing: ${t.letterSpacing};
}

#wechat-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16px auto;
}

#wechat-content hr {
  border: none;
  border-top: 1px solid ${t.border};
  margin: 32px 0;
  height: 0;
}

#wechat-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 15px;
}

#wechat-content th,
#wechat-content td {
  border: 1px solid ${t.tableBorder};
  padding: 8px 12px;
  text-align: left;
  line-height: 1.6;
}

#wechat-content th {
  background-color: ${t.tableHead};
  font-weight: 700;
  color: ${t.heading};
}

#wechat-content .img-caption {
  text-align: center;
  color: ${t.muted};
  font-size: 13px;
  margin: -8px 0 16px;
  letter-spacing: 0;
}

#wechat-content .task-done {
  color: ${t.accent};
  font-style: normal;
}

#wechat-content .link-ref {
  font-size: 12px;
  color: ${t.link};
  letter-spacing: 0;
  font-style: normal;
  margin-left: 1px;
}

#wechat-content .link-list {
  margin: 32px 0 0;
}

#wechat-content .link-list-title {
  font-size: ${t.h3Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.5;
  margin: 0 0 12px;
  text-align: left;
}

#wechat-content .link-list-item {
  font-size: 14px;
  color: ${t.muted};
  line-height: 1.7;
  margin: 8px 0;
  letter-spacing: 0;
  text-align: left;
  word-break: break-all;
}

#wechat-content .link-list-num {
  color: ${t.heading};
  font-weight: 700;
}

#wechat-content .link-list-label {
  color: ${t.text};
}

#wechat-content .link-list-url {
  color: ${t.link};
  text-decoration: none;
}

#wechat-content .task-todo {
  color: ${t.muted};
  font-style: normal;
}
`;
}

function compileWechatLayout(t) {
  return `
#wechat-content h2 {
  font-size: ${t.h2Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.45;
  margin: 32px 0 16px;
  padding: 0 0 0 12px;
  border-left: 4px solid ${t.accent};
  letter-spacing: ${t.letterSpacing};
}

#wechat-content h3 {
  font-size: ${t.h3Size};
  color: ${t.accent};
  font-weight: 700;
  line-height: 1.5;
  margin: 28px 0 12px;
}

#wechat-content blockquote {
  margin: 16px 0;
  padding: 12px 16px;
  background-color: ${t.quoteBg};
  border-left: 4px solid ${t.accent};
}

#wechat-content blockquote p {
  color: ${t.quoteText};
  margin: 0;
}
`;
}

function compileInkLayout(t) {
  return `
#wechat-content {
  letter-spacing: ${t.letterSpacing};
}

#wechat-content h1 {
  text-align: center;
  letter-spacing: ${t.headingLetterSpacing};
}

#wechat-content h2 {
  font-size: ${t.h2Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.45;
  margin: 36px 0 16px;
  text-align: center;
  letter-spacing: ${t.headingLetterSpacing};
}

#wechat-content h3 {
  font-size: ${t.h3Size};
  color: ${t.accent};
  font-weight: 700;
  line-height: 1.5;
  margin: 28px 0 12px;
}

#wechat-content p {
  letter-spacing: ${t.letterSpacing};
}

#wechat-content blockquote {
  margin: 16px 0;
  padding: 12px 20px;
  background-color: ${t.quoteBg};
  border-left: 3px solid ${t.heading};
}

#wechat-content blockquote p {
  color: ${t.quoteText};
  margin: 0;
}

#wechat-content hr {
  border-top: 1px solid ${t.border};
}

#wechat-content .task-done {
  color: ${t.accent};
}
`;
}

function compileTechLayout(t) {
  return `
#wechat-content {
  letter-spacing: ${t.letterSpacing};
  text-align: left;
}

#wechat-content p,
#wechat-content li {
  text-align: left;
  letter-spacing: ${t.letterSpacing};
}

#wechat-content h1 {
  font-size: ${t.h1Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.35;
  margin: 0 0 20px;
  padding: 0 0 12px;
  border-bottom: 2px solid ${t.heading};
  letter-spacing: 0.4px;
}

#wechat-content h2 {
  font-size: ${t.h2Size};
  color: #f0f3f6;
  background-color: ${t.heading};
  font-weight: 700;
  line-height: 1.4;
  margin: 32px 0 16px;
  padding: 10px 12px;
  border-left: 4px solid ${t.accent};
  letter-spacing: 0.3px;
}

#wechat-content h3 {
  font-size: ${t.h3Size};
  color: ${t.accent};
  font-weight: 700;
  line-height: 1.5;
  margin: 28px 0 12px;
  padding: 0 0 6px;
  border-bottom: 1px dashed ${t.border};
}

#wechat-content blockquote {
  margin: 16px 0;
  padding: 12px 14px;
  background-color: ${t.quoteBg};
  border-left: 4px solid ${t.accent};
}

#wechat-content blockquote p {
  color: ${t.quoteText};
  margin: 0;
  text-align: left;
}

#wechat-content th {
  background-color: ${t.heading};
  color: #f0f3f6;
}

#wechat-content hr {
  border-top: 1px dashed ${t.border};
}

#wechat-content .task-done {
  color: ${t.accent};
}

#wechat-content .link-list-title {
  color: ${t.heading};
  border-bottom: 1px dashed ${t.border};
  padding: 0 0 6px;
}
${compileTerminalCode(t)}`;
}

export const presets = {
  wechat: {
    layout: 'wechat',
    tokens: { ...defaultTokens },
  },
  ink: {
    layout: 'ink',
    tokens: {
      ...defaultTokens,
      accent: '#c73e2a',
      heading: '#1a1a1a',
      quoteBg: '#faf7f2',
      quoteText: '#5c5346',
      border: '#d7d0c4',
      letterSpacing: '1px',
      headingLetterSpacing: '2px',
    },
  },
  tech: {
    layout: 'tech',
    features: {
      linksAtEnd: true,
      linksTitle: '参考链接',
    },
    tokens: {
      ...defaultTokens,
      accent: '#3d8bfd',
      heading: '#1c2128',
      text: '#2f363d',
      muted: '#6e7781',
      link: '#0969da',
      strong: '#1c2128',
      quoteBg: '#eef4fb',
      quoteText: '#4b5d73',
      codeBg: '#1c2128',
      codeInline: '#0550ae',
      codeInlineBg: '#ddf4ff',
      codeBlock: '#e6edf3',
      border: '#d0d7de',
      tableBorder: '#d0d7de',
      tableHead: '#1c2128',
      letterSpacing: '0.15px',
      headingLetterSpacing: '0.4px',
    },
  },
  qing: {
    layout: 'qing',
    features: { linksAtEnd: true, linksTitle: '参考链接' },
    tokens: {
      ...defaultTokens,
      accent: '#5b8a7a',
      heading: '#2c3d38',
      text: '#3e4a46',
      muted: '#8a9691',
      link: '#4d7a6c',
      strong: '#2c3d38',
      quoteBg: 'transparent',
      quoteText: '#5b8a7a',
      codeBg: '#eef3f1',
      codeInline: '#3e4a46',
      codeInlineBg: '#eef3f1',
      border: '#c5d4ce',
      tableBorder: '#c5d4ce',
      tableHead: '#eef3f1',
      letterSpacing: '0.6px',
      headingLetterSpacing: '4px',
    },
  },
  dusk: {
    layout: 'dusk',
    features: { linksAtEnd: true, linksTitle: '参考链接' },
    tokens: {
      ...defaultTokens,
      accent: '#8b3a4a',
      heading: '#2a1f24',
      text: '#3f3538',
      muted: '#9a888c',
      link: '#8b3a4a',
      strong: '#2a1f24',
      quoteBg: '#fbf6f7',
      quoteText: '#6a4e54',
      codeBg: '#f7f1f2',
      codeInline: '#8b3a4a',
      codeInlineBg: '#f7f1f2',
      border: '#e8d4d6',
      tableBorder: '#e8d4d6',
      tableHead: '#f7f1f2',
      letterSpacing: '0.4px',
      headingLetterSpacing: '1px',
      h1Size: '24px',
    },
  },
  folio: {
    layout: 'folio',
    features: { linksAtEnd: true, linksTitle: '参考链接' },
    tokens: {
      ...defaultTokens,
      accent: '#b0894a',
      heading: '#1f1c18',
      text: '#3a342c',
      muted: '#8a8174',
      link: '#8a6a32',
      strong: '#1f1c18',
      quoteBg: '#f3efe6',
      quoteText: '#5c5346',
      codeBg: '#f3efe6',
      codeInline: '#6b5424',
      codeInlineBg: '#f3efe6',
      border: '#ddd4c4',
      tableBorder: '#ddd4c4',
      tableHead: '#1f1c18',
      letterSpacing: '0.35px',
      headingLetterSpacing: '2px',
    },
  },
  washi: {
    layout: 'washi',
    features: { linksAtEnd: true, linksTitle: '参考链接' },
    tokens: {
      ...defaultTokens,
      accent: '#3d5a80',
      heading: '#2a2e35',
      text: '#3a3f47',
      muted: '#8b929c',
      link: '#3d5a80',
      strong: '#2a2e35',
      quoteBg: '#f4f5f7',
      quoteText: '#4a5560',
      codeBg: '#f0f2f5',
      codeInline: '#3d5a80',
      codeInlineBg: '#f0f2f5',
      border: '#c5cdd8',
      tableBorder: '#c5cdd8',
      tableHead: '#f0f2f5',
      letterSpacing: '0.8px',
      headingLetterSpacing: '6px',
    },
  },
  cinnabar: {
    layout: 'cinnabar',
    features: { linksAtEnd: true, linksTitle: '参考链接' },
    tokens: {
      ...defaultTokens,
      accent: '#c23a2b',
      heading: '#1a1a1a',
      text: '#333333',
      muted: '#9a8f8c',
      link: '#c23a2b',
      strong: '#1a1a1a',
      quoteBg: '#fff9f7',
      quoteText: '#6b4540',
      codeBg: '#faf6f5',
      codeInline: '#c23a2b',
      codeInlineBg: '#faf6f5',
      border: '#e8d8d4',
      tableBorder: '#e8d8d4',
      tableHead: '#faf6f5',
      letterSpacing: '0.7px',
      headingLetterSpacing: '3px',
    },
  },
  lotus: {
    layout: 'lotus',
    features: { linksAtEnd: true, linksTitle: '参考链接' },
    tokens: {
      ...defaultTokens,
      accent: '#c47880',
      heading: '#4a3538',
      text: '#534348',
      muted: '#a8989c',
      link: '#a65d66',
      strong: '#4a3538',
      quoteBg: '#faf4f5',
      quoteText: '#7a5c62',
      codeBg: '#1c2128',
      codeInline: '#a65d66',
      codeInlineBg: '#f7f1f2',
      codeBlock: '#e6edf3',
      border: '#ecd8db',
      tableBorder: '#ecd8db',
      tableHead: '#f7f1f2',
      letterSpacing: '0.5px',
      headingLetterSpacing: '3px',
    },
  },
  moss: {
    layout: 'moss',
    features: { linksAtEnd: true, linksTitle: '参考链接' },
    tokens: {
      ...defaultTokens,
      accent: '#6b7f4a',
      heading: '#2c3324',
      text: '#3d4436',
      muted: '#8a9180',
      link: '#5a6b3e',
      strong: '#2c3324',
      quoteBg: '#f4f5ef',
      quoteText: '#5c6650',
      codeBg: '#1c2128',
      codeInline: '#5a6b3e',
      codeInlineBg: '#eef0e8',
      codeBlock: '#e6edf3',
      border: '#d4d8c4',
      tableBorder: '#d4d8c4',
      tableHead: '#eef0e8',
      letterSpacing: '0.4px',
      headingLetterSpacing: '1px',
    },
  },
  tide: {
    layout: 'tide',
    features: { linksAtEnd: true, linksTitle: '参考链接' },
    tokens: {
      ...defaultTokens,
      accent: '#2a6f7f',
      heading: '#1e3338',
      text: '#334448',
      muted: '#7a9094',
      link: '#2a6f7f',
      strong: '#1e3338',
      quoteBg: '#f0f5f6',
      quoteText: '#4a646a',
      codeBg: '#1c2128',
      codeInline: '#2a6f7f',
      codeInlineBg: '#e8f0f2',
      codeBlock: '#e6edf3',
      border: '#c5d6da',
      tableBorder: '#c5d6da',
      tableHead: '#e8f0f2',
      letterSpacing: '0.35px',
      headingLetterSpacing: '2px',
    },
  },
  amber: {
    layout: 'amber',
    features: { linksAtEnd: true, linksTitle: '参考链接' },
    tokens: {
      ...defaultTokens,
      accent: '#c47b2d',
      heading: '#3d2e18',
      text: '#4a3d2a',
      muted: '#9a8b70',
      link: '#9a6120',
      strong: '#3d2e18',
      quoteBg: '#faf6ee',
      quoteText: '#6b5840',
      codeBg: '#1c2128',
      codeInline: '#9a6120',
      codeInlineBg: '#f5efe3',
      codeBlock: '#e6edf3',
      border: '#e8dcc4',
      tableBorder: '#e8dcc4',
      tableHead: '#f5efe3',
      letterSpacing: '0.4px',
      headingLetterSpacing: '2px',
    },
  },
};

export const themeMeta = {
  wechat: { title: '青葱', blurb: '绿条，常见公众号' },
  ink: { title: '墨韵', blurb: '居中，适合随笔' },
  tech: { title: '终端', blurb: '深色代码，技术文' },
  qing: { title: '青瓷', blurb: '冷青，像馆藏说明' },
  dusk: { title: '暮色', blurb: '酒红短线，杂志口气' },
  folio: { title: '折页', blurb: '铜线压栏，编辑部' },
  washi: { title: '和纸', blurb: '靛蓝细线，信笺' },
  cinnabar: { title: '朱砂', blurb: '宽印在侧，朱批' },
  lotus: { title: '芙蕖', blurb: '藕色题条，花笺' },
  moss: { title: '苔痕', blurb: '石绿虚线，笔记' },
  tide: { title: '沧浪', blurb: '双线压题，潮线' },
  amber: { title: '琥珀', blurb: '蜜色蜡条，书签' },
};

export function normalizeLayout(name) {
  if (!name || name === 'base') return 'none';
  if (!layouts.includes(name)) {
    throw new Error(`未知布局「${name}」，可选：${layouts.join(', ')}`);
  }
  return name;
}

const layoutCompilers = {
  wechat: compileWechatLayout,
  ink: compileInkLayout,
  tech: compileTechLayout,
  qing: compileQingLayout,
  dusk: compileDuskLayout,
  folio: compileFolioLayout,
  washi: compileWashiLayout,
  cinnabar: compileCinnabarLayout,
  lotus: compileLotusLayout,
  moss: compileMossLayout,
  tide: compileTideLayout,
  amber: compileAmberLayout,
};

export function compileTheme({ tokens = {}, layout = 'wechat', css = '' } = {}) {
  const resolvedLayout = normalizeLayout(layout);
  const merged = { ...defaultTokens, ...tokens };
  const parts = [highlightCss, compileArticleCss(merged)];
  const compileLayout = layoutCompilers[resolvedLayout];
  if (compileLayout) {
    parts.push(compileLayout(merged));
  }
  if (css) {
    parts.push(css);
  }
  return parts.join('\n');
}

export const highlightCss = `
.hljs { color: #24292e; }
.hljs-keyword,
.hljs-doctag,
.hljs-name,
.hljs-section { color: #d73a49; }
.hljs-string,
.hljs-addition,
.hljs-attribute,
.hljs-meta-string { color: #032f62; }
.hljs-comment,
.hljs-quote,
.hljs-meta { color: #6a737d; }
.hljs-number,
.hljs-literal,
.hljs-variable,
.hljs-template-variable,
.hljs-tag .hljs-attr { color: #005cc5; }
.hljs-title,
.hljs-title.class_,
.hljs-title.function_,
.hljs-selector-id,
.hljs-selector-class { color: #6f42c1; }
.hljs-type,
.hljs-built_in,
.hljs-builtin-name,
.hljs-symbol { color: #e36209; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 700; }
`;

export const themeNames = Object.keys(presets);

export const themes = Object.fromEntries(
  themeNames.map((name) => [name, compileTheme(presets[name])]),
);
