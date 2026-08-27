import { convertMarkdown, parseFrontMatter, themeCatalog } from '../src/web-convert.js';

const SAMPLE = `---
title: 微信发稿台
theme: tech
---

# 把 Markdown 发到公众号

左边写稿，右边看校样。点复制，再到公众号后台粘贴。本地用 wx-md serve 时，还可以推到草稿箱。

## 它会做什么

公众号会丢掉外部样式。这里把颜色和间距写成内联 \`style\`。

> 复制带上的是 HTML，不是纯文本。

也可以换主题，或把链接集中到文末：[Markdown](https://commonmark.org/)。

\`\`\`js
console.log('wx-md');
\`\`\`
`;

const FAIL = '<p class="fail">转换失败，请检查稿件后重试。</p>';

const UNCONFIGURED = '先配置 WECHAT_APPID 和 WECHAT_SECRET，再推草稿箱。';

const state = {
  themes: {},
  theme: 'tech',
  linksAtEnd: true,
  timer: 0,
  drag: 0,
  draft: null,
};

const $ = (id) => document.getElementById(id);

function fillThemes() {
  const select = $('theme');
  select.innerHTML = '';
  for (const [name, pack] of Object.entries(state.themes)) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = pack.meta.title;
    select.appendChild(option);
  }
  select.value = state.theme;
}

function render() {
  try {
    const result = convertMarkdown($('source').value, {
      theme: state.theme,
      linksAtEnd: state.linksAtEnd,
    });
    $('preview').innerHTML = result.html;
    $('theme-label').textContent = state.themes[state.theme]?.meta.title || state.theme;
  } catch {
    $('preview').innerHTML = FAIL;
  }
}

function scheduleRender() {
  clearTimeout(state.timer);
  state.timer = setTimeout(render, 180);
}

function applyMarkdown(text, label) {
  $('source').value = text;
  $('file-label').textContent = label || '原稿';
  const { meta } = parseFrontMatter(text);
  if (meta.theme && state.themes[meta.theme]) {
    state.theme = meta.theme;
    $('theme').value = meta.theme;
    state.linksAtEnd = state.themes[meta.theme].features.linksAtEnd;
    $('links').checked = state.linksAtEnd;
  }
  scheduleRender();
}

function setCopyState(label, done) {
  const button = $('copy-btn');
  const word = $('copy-word');
  word.textContent = label;
  button.classList.toggle('is-done', done);
}

async function copyArticle() {
  const root = document.getElementById('wechat-content');
  if (!root) return;
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
    setCopyState('已复制', true);
    setTimeout(() => setCopyState('复制', false), 1600);
  } catch {
    setCopyState('失败', false);
  }
}

function setDragging(on) {
  document.body.classList.toggle('is-dragging', on);
  $('drop').setAttribute('aria-hidden', on ? 'false' : 'true');
}

window.addEventListener('DOMContentLoaded', () => {
  state.themes = themeCatalog();
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
  $('draft-btn').addEventListener('click', openDraft);
  $('draft-cancel').addEventListener('click', closeDraft);
  $('draft-confirm').addEventListener('click', submitDraft);
  $('draft-panel').addEventListener('click', (event) => {
    if (event.target === $('draft-panel')) closeDraft();
  });
  $('open-btn').addEventListener('click', () => $('file').click());
  $('file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    applyMarkdown(await file.text(), file.name);
    event.target.value = '';
  });

  document.addEventListener('dragenter', (event) => {
    event.preventDefault();
    state.drag += 1;
    setDragging(true);
  });
  document.addEventListener('dragover', (event) => event.preventDefault());
  document.addEventListener('dragleave', () => {
    state.drag -= 1;
    if (state.drag <= 0) {
      state.drag = 0;
      setDragging(false);
    }
  });
  document.addEventListener('drop', async (event) => {
    event.preventDefault();
    state.drag = 0;
    setDragging(false);
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    applyMarkdown(await file.text(), file.name);
  });

  probeDraftApi();
});

async function probeDraftApi() {
  try {
    const response = await fetch('/api/status', { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const data = await response.json();
    if (!data?.ok) return;
    state.draft = { configured: Boolean(data.configured) };
    $('draft-btn').hidden = false;
  } catch {
    // 静态托管没有本机接口，保持只复制。
  }
}

function setDraftHint(text, fail = false) {
  const hint = $('draft-hint');
  hint.textContent = text || '';
  hint.classList.toggle('is-fail', fail);
}

function openDraft() {
  if (!state.draft) return;
  if (!state.draft.configured) {
    setDraftHint(UNCONFIGURED, true);
  } else {
    setDraftHint('');
  }

  try {
    const result = convertMarkdown($('source').value, {
      theme: state.theme,
      linksAtEnd: state.linksAtEnd,
    });
    $('draft-title').value = result.title || '';
    $('draft-digest').value = result.digest || '';
  } catch {
    $('draft-title').value = '';
    $('draft-digest').value = '';
  }

  $('draft-cover').value = '';
  $('draft-panel').hidden = false;
  $('draft-panel').classList.add('is-open');
  $('draft-title').focus();
}

function closeDraft() {
  $('draft-panel').classList.remove('is-open');
  $('draft-panel').hidden = true;
}

function fileToCover(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        filename: file.name,
        mime: file.type || 'image/png',
        data: String(reader.result).split(',').pop(),
      });
    };
    reader.onerror = () => reject(new Error('读封面失败'));
    reader.readAsDataURL(file);
  });
}

async function submitDraft() {
  if (!state.draft?.configured) {
    setDraftHint(UNCONFIGURED, true);
    return;
  }

  const file = $('draft-cover').files?.[0];
  if (!file) {
    setDraftHint('请先选封面。', true);
    return;
  }

  const confirm = $('draft-confirm');
  confirm.disabled = true;
  confirm.textContent = '推送中';
  setDraftHint('正在推送…');

  try {
    const cover = await fileToCover(file);
    const response = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        markdown: $('source').value,
        theme: state.theme,
        linksAtEnd: state.linksAtEnd,
        title: $('draft-title').value.trim(),
        digest: $('draft-digest').value.trim(),
        cover,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      throw new Error(data.error || '推送失败');
    }
    const extra = data.missingImages?.length
      ? `，有 ${data.missingImages.length} 张本地图未上传`
      : '';
    setDraftHint(`已推到草稿箱${extra}。`);
    $('draft-btn').textContent = '已推送';
    setTimeout(() => {
      $('draft-btn').textContent = '推草稿箱';
    }, 1600);
  } catch (error) {
    setDraftHint(error.message || '推送失败', true);
  } finally {
    confirm.disabled = false;
    confirm.textContent = '推送';
  }
}
