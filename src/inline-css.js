function skipSelector(selector) {
  return /:(?:hover|focus|active|visited|before|after|first-line|first-letter|not\(|is\(|where\(|has\()/i.test(
    selector,
  );
}

export function inlineCss(html, css) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const style = doc.createElement('style');
  style.textContent = css;
  doc.head.appendChild(style);

  const sheet = style.sheet;
  if (!sheet) {
    throw new Error('无法解析主题样式');
  }

  for (const rule of sheet.cssRules) {
    if (rule.type !== CSSRule.STYLE_RULE) continue;
    if (skipSelector(rule.selectorText || '')) continue;

    let nodes;
    try {
      nodes = doc.querySelectorAll(rule.selectorText);
    } catch {
      continue;
    }

    for (const el of nodes) {
      for (const prop of rule.style) {
        el.style.setProperty(
          prop,
          rule.style.getPropertyValue(prop),
          rule.style.getPropertyPriority(prop),
        );
      }
    }
  }

  style.remove();
  const root = doc.getElementById('wechat-content');
  return root ? root.outerHTML : doc.body.innerHTML;
}
