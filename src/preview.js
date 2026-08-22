function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function renderPreviewPage({
  articleHtml,
  title,
  sourceName,
  theme,
  localImages,
}) {
  const pageTitle = title || sourceName || 'wx-md';
  const warning = localImages.length
    ? `<aside class="notice">正文里有 ${localImages.length} 张本地图片，预览能看，粘贴到公众号后不会显示。请先换成图床链接，或在公众号里重新上传。</aside>`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)} · 发稿台</title>
  <style>
    :root {
      --desk: #2a231d;
      --desk-deep: #1c1713;
      --brass: #d4b483;
      --brass-dim: #a8895c;
      --seal: #c73e2a;
      --seal-ink: #8f2618;
      --paper: #ffffff;
      --caption: #c4b8a8;
      --line: rgba(212, 180, 131, 0.28);
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      min-height: 100%;
    }

    body {
      min-height: 100vh;
      background:
        radial-gradient(1200px 500px at 50% -10%, rgba(212, 180, 131, 0.14), transparent 55%),
        linear-gradient(180deg, var(--desk) 0%, var(--desk-deep) 100%);
      color: var(--caption);
      font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    }

    .desk {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 28px 20px 48px;
    }

    .plate {
      width: min(100%, 420px);
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding-bottom: 14px;
      margin-bottom: 18px;
      border-bottom: 1px solid var(--line);
    }

    .plate-brand {
      font-family: "Songti SC", "STSong", "Noto Serif CJK SC", "SimSun", serif;
      font-size: 22px;
      letter-spacing: 6px;
      color: var(--brass);
      margin: 0;
      font-weight: 600;
    }

    .plate-meta {
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 11px;
      letter-spacing: 0.08em;
      color: var(--brass-dim);
      text-transform: uppercase;
    }

    .slug {
      width: min(100%, 420px);
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 11px;
      letter-spacing: 0.06em;
      color: var(--caption);
      margin-bottom: 18px;
    }

    .notice {
      width: min(100%, 390px);
      margin: 0 0 16px;
      padding: 10px 12px;
      border: 1px solid rgba(199, 62, 42, 0.45);
      color: #f0c2ba;
      font-size: 12px;
      line-height: 1.6;
    }

    .stage {
      position: relative;
      display: flex;
      justify-content: center;
    }

    .phone {
      width: 390px;
      max-width: calc(100vw - 40px);
      height: min(78vh, 760px);
      padding: 11px;
      background: #12100e;
      border-radius: 36px;
      box-shadow:
        0 0 0 1px rgba(212, 180, 131, 0.18),
        0 28px 60px rgba(0, 0, 0, 0.38);
    }

    .phone-screen {
      height: 100%;
      overflow: auto;
      background: var(--paper);
      border-radius: 28px;
      padding: 28px 18px 56px;
    }

    .phone-screen::-webkit-scrollbar { width: 0; }

    .seal {
      position: absolute;
      right: -18px;
      top: 36px;
      width: 84px;
      height: 84px;
      border: 0;
      padding: 0;
      background: transparent;
      color: var(--seal);
      cursor: pointer;
      font-family: "Songti SC", "STSong", "Noto Serif CJK SC", "SimSun", serif;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.28));
    }

    .seal-ring {
      width: 84px;
      height: 84px;
      border: 3px solid currentColor;
      border-radius: 50%;
      box-shadow: inset 0 0 0 2px currentColor;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      transform: rotate(-14deg);
      transition: transform 160ms ease, color 160ms ease;
    }

    .seal:hover .seal-ring { transform: rotate(-8deg) scale(1.04); }
    .seal.is-ok { color: #2f7d4a; }
    .seal.is-ok .seal-ring { transform: rotate(-6deg); }

    .seal-kicker,
    .seal-word {
      margin: 0;
      line-height: 1;
    }

    .seal-kicker {
      font-size: 10px;
      letter-spacing: 0.2em;
    }

    .seal-word {
      font-size: 18px;
      letter-spacing: 0.18em;
      font-weight: 700;
    }

    .hint {
      width: min(100%, 420px);
      margin-top: 22px;
      text-align: center;
      font-size: 12px;
      line-height: 1.7;
      color: var(--caption);
    }

    @media (max-width: 520px) {
      .seal {
        position: static;
        display: block;
        margin: 0 auto 16px;
      }
    }
  </style>
</head>
<body>
  <div class="desk">
    <header class="plate">
      <p class="plate-brand">发稿台</p>
      <span class="plate-meta">${escapeHtml(theme)}</span>
    </header>
    <div class="slug">
      <span>校样 ${formatDate(new Date())}</span>
      <span>${escapeHtml(sourceName)}</span>
    </div>
    ${warning}
    <div class="stage">
      <button class="seal" id="copy-btn" type="button" aria-label="复制到公众号">
        <span class="seal-ring">
          <span class="seal-kicker">公众号</span>
          <span class="seal-word" id="copy-word">复制</span>
        </span>
      </button>
      <div class="phone">
        <div class="phone-screen">
          ${articleHtml}
        </div>
      </div>
    </div>
    <p class="hint">点右侧印章，把正文复制到剪贴板，再到微信公众号后台粘贴。<br>也可直接在白纸上划选，用系统复制。</p>
  </div>
  <script>
    const root = document.getElementById('wechat-content');
    const btn = document.getElementById('copy-btn');
    const word = document.getElementById('copy-word');

    function fallbackCopy() {
      const range = document.createRange();
      range.selectNode(root);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      const ok = document.execCommand('copy');
      selection.removeAllRanges();
      if (!ok) throw new Error('copy failed');
    }

    async function copyArticle() {
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({
              'text/html': new Blob([root.outerHTML], { type: 'text/html' }),
              'text/plain': new Blob([root.innerText], { type: 'text/plain' })
            })
          ]);
        } else {
          fallbackCopy();
        }
        btn.classList.add('is-ok');
        word.textContent = '已印';
        setTimeout(() => {
          btn.classList.remove('is-ok');
          word.textContent = '复制';
        }, 2200);
      } catch (error) {
        fallbackCopy();
        word.textContent = '已印';
      }
    }

    btn.addEventListener('click', copyArticle);
  </script>
</body>
</html>
`;
}
