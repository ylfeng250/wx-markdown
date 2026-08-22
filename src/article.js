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
