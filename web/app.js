const SAMPLE = `---
title: 发稿台
theme: tech
---

# 把 Markdown 发到公众号

左边写稿，右边看校样。点印章复制，再到公众号后台粘贴。

## 它会做什么

公众号会丢掉外部样式。这里把颜色和间距写成内联 \`style\`。

> 复制带上的是 HTML，不是纯文本。

也可以换主题，或把链接集中到文末：[Markdown](https://commonmark.org/)。

\`\`\`js
console.log('wx-md');
\`\`\`
`;

const state = {
  themes: {},
  theme: 'tech',
  linksAtEnd: true,
  timer: 0,
};

const $ = (id) => document.getElementById(id);

function parseFrontMatter(raw) {
  if (!raw.startsWith('---')) return { meta: {} };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta: {} };
  const meta = {};
  for (const line of raw.slice(3, end).split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    meta[match[1]] = match[2].replace(/^['"]|['"]$/g, '').trim();
  }
  return { meta };
}

function fillThemes() {
  const select = $('theme');
  select.innerHTML = '';
  for (const [name, pack] of Object.entries(state.themes)) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${pack.meta.title} · ${name}`;
    select.appendChild(option);
  }
  select.value = state.theme;
}

async function render() {
  const raw = $('source').value;
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      markdown: raw,
      theme: state.theme,
      linksAtEnd: state.linksAtEnd,
    }),
  });
  if (!response.ok) {
    $('preview').innerHTML = '<p style="color:#c73e2a">转换失败</p>';
    return;
  }
  const result = await response.json();
  $('preview').innerHTML = result.html;
  $('theme-label').textContent = state.themes[state.theme]?.meta.title || state.theme;
}

function scheduleRender() {
  clearTimeout(state.timer);
  state.timer = setTimeout(() => {
    render().catch(() => {
      $('preview').innerHTML = '<p style="color:#c73e2a">转换失败</p>';
    });
  }, 180);
}

function applyMarkdown(text) {
  $('source').value = text;
  const { meta } = parseFrontMatter(text);
  if (meta.theme && state.themes[meta.theme]) {
    state.theme = meta.theme;
    $('theme').value = meta.theme;
    state.linksAtEnd = state.themes[meta.theme].features.linksAtEnd;
    $('links').checked = state.linksAtEnd;
  }
  scheduleRender();
}

async function copyArticle() {
  const root = document.getElementById('wechat-content');
  if (!root) return;
  const word = $('copy-word');
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([root.outerHTML], { type: 'text/html' }),
          'text/plain': new Blob([root.innerText], { type: 'text/plain' }),
        }),
      ]);
    } else {
      const range = document.createRange();
      range.selectNode(root);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
    }
    word.textContent = '已印';
    setTimeout(() => {
      word.textContent = '复制';
    }, 1800);
  } catch {
    word.textContent = '失败';
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const payload = await fetch('/api/themes').then((res) => res.json());
  state.themes = payload.themes;
  state.theme = 'tech';
  state.linksAtEnd = state.themes.tech.features.linksAtEnd;
  fillThemes();
  $('links').checked = state.linksAtEnd;
  $('source').value = SAMPLE;
  scheduleRender();

  $('source').addEventListener('input', scheduleRender);
  $('theme').addEventListener('change', (event) => {
    state.theme = event.target.value;
    state.linksAtEnd = state.themes[state.theme].features.linksAtEnd;
    $('links').checked = state.linksAtEnd;
    scheduleRender();
  });
  $('links').addEventListener('change', (event) => {
    state.linksAtEnd = event.target.checked;
    scheduleRender();
  });
  $('copy-btn').addEventListener('click', copyArticle);
  $('open-btn').addEventListener('click', () => $('file').click());
  $('file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    applyMarkdown(await file.text());
    event.target.value = '';
  });

  document.body.addEventListener('dragover', (event) => event.preventDefault());
  document.body.addEventListener('drop', async (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    applyMarkdown(await file.text());
  });
});
