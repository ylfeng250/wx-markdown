function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function shouldCollect(href) {
  if (!href) return false;
  const value = href.trim();
  if (!value) return false;
  if (value.startsWith('#')) return false;
  if (/^(mailto|tel|javascript):/i.test(value)) return false;
  return true;
}

export function moveLinksToEnd(html, { title = '参考链接' } = {}) {
  const links = [];
  const seen = new Map();

  const withMarks = html.replace(/<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi, (full, attrs, inner) => {
    const hrefMatch = attrs.match(/href\s*=\s*(["'])([^"']*)\1/i);
    const href = hrefMatch?.[2]?.trim();
    if (!shouldCollect(href)) {
      return full;
    }

    let index = seen.get(href);
    if (index == null) {
      const text = stripTags(inner) || href;
      links.push({ href, text });
      index = links.length;
      seen.set(href, index);
    }

    const plain = stripTags(inner);
    const label = plain === href || plain === href.replace(/\/$/, '') ? '' : inner;
    return `${label}<sup class="link-ref">[${index}]</sup>`;
  });

  if (!links.length) {
    return html;
  }

  const items = links
    .map((item, i) => {
      const num = `[${i + 1}]`;
      const same = item.text === item.href || item.text === item.href.replace(/\/$/, '');
      const label = same
        ? ''
        : `<span class="link-list-label">${escapeHtml(item.text)}</span> `;
      return `<p class="link-list-item"><span class="link-list-num">${num}</span> ${label}<a class="link-list-url" href="${escapeHtml(item.href)}">${escapeHtml(item.href)}</a></p>`;
    })
    .join('');

  return `${withMarks}<section class="link-list"><h3 class="link-list-title">${escapeHtml(title)}</h3>${items}</section>`;
}
