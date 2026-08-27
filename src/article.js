export function parseBool(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return undefined;
}

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

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function decorateImages(html) {
  return html.replace(/<img([^>]*?)>/g, (full, attrs) => {
    const altMatch = attrs.match(/alt="([^"]*)"/);
    const alt = altMatch?.[1]?.trim();
    if (!alt || /^image$/i.test(alt)) {
      return full;
    }
    return `${full}<p class="img-caption">${escapeHtml(alt)}</p>`;
  });
}

export function replaceTaskBoxes(html) {
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

export function findLocalImages(html) {
  return [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((src) => !/^https?:\/\//i.test(src) && !src.startsWith('data:'));
}

export function firstHeading(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? '';
}

export function htmlToPlaintext(html) {
  let text = String(html);
  text = text.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export function truncateDigest(text, maxBytes = 120) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  const encoder = new TextEncoder();
  const encoded = encoder.encode(value);
  if (encoded.length <= maxBytes) return value;

  const ellipsis = '...';
  const budget = maxBytes - encoder.encode(ellipsis).length;
  let end = Math.max(0, budget);
  while (end > 0 && (encoded[end] & 0b1100_0000) === 0b1000_0000) {
    end -= 1;
  }
  const truncated = new TextDecoder().decode(encoded.subarray(0, end)).trimEnd();
  return `${truncated}${ellipsis}`;
}

export function generateDigest(html, maxBytes = 120) {
  return truncateDigest(htmlToPlaintext(html), maxBytes);
}

export function stripMatchingH1(html, title) {
  if (!title) return html;
  const expected = String(title).trim();
  return String(html).replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, (match) => {
    const text = match.replace(/<[^>]+>/g, '').trim();
    return text === expected ? '' : match;
  });
}

export function replaceImageSrc(html, from, to) {
  const escaped = String(from).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(html).replace(new RegExp(`(src=["'])${escaped}(["'])`, 'gi'), `$1${to}$2`);
}

export function renderArticle(markdown, {
  parse,
  collectLinks,
  linksTitle,
  moveLinksToEnd,
}) {
  let body = parse(markdown);
  body = replaceTaskBoxes(body);
  body = decorateImages(body);
  if (collectLinks) {
    body = moveLinksToEnd(body, { title: linksTitle });
  }
  return `<section id="wechat-content">${body}</section>`;
}
