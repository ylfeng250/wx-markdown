export function compileQingLayout(t) {
  return `
#wechat-content {
  text-align: justify;
}

#wechat-content h1 {
  width: 72%;
  margin: 0 auto 28px;
  padding: 0 0 16px;
  text-align: center;
  font-size: ${t.h1Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 4px;
  border-bottom: 1px solid ${t.accent};
}

#wechat-content h2 {
  margin: 40px 32px 16px;
  text-align: center;
  font-size: 17px;
  color: ${t.accent};
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 3px;
}

#wechat-content h3 {
  margin: 28px 0 12px;
  text-align: center;
  font-size: 15px;
  color: ${t.accent};
  font-weight: 700;
  letter-spacing: 2px;
}

#wechat-content blockquote {
  margin: 24px 20px;
  padding: 8px 12px;
  background-color: transparent;
  border-left: none;
}

#wechat-content blockquote p {
  color: ${t.quoteText};
  text-align: center;
  font-style: italic;
  letter-spacing: 1px;
  margin: 0;
}

#wechat-content hr {
  border-top: 1px solid ${t.border};
  margin: 36px 48px;
}

#wechat-content .link-list-title {
  text-align: center;
  color: ${t.accent};
  letter-spacing: 2px;
}
`;
}

export function compileDuskLayout(t) {
  return `
#wechat-content h1 {
  display: inline-block;
  margin: 0 0 24px;
  padding: 0 0 12px;
  font-size: 24px;
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 1px;
  border-bottom: 3px solid ${t.accent};
}

#wechat-content h2 {
  margin: 36px 0 16px;
  padding: 16px 0 0;
  font-size: ${t.h2Size};
  color: ${t.accent};
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 1px;
  border-top: 1px solid ${t.border};
}

#wechat-content h3 {
  margin: 28px 0 12px;
  font-size: ${t.h3Size};
  color: ${t.accent};
  font-weight: 700;
}

#wechat-content blockquote {
  margin: 20px 0;
  padding: 16px 20px;
  background-color: ${t.quoteBg};
  border-left: 2px solid ${t.accent};
}

#wechat-content blockquote p {
  color: ${t.quoteText};
  font-style: italic;
  margin: 0;
}

#wechat-content .link-list-title {
  color: ${t.accent};
  border-top: 1px solid ${t.border};
  padding-top: 16px;
}
`;
}

export function compileFolioLayout(t) {
  return `
#wechat-content h1 {
  margin: 0 0 24px;
  padding: 16px 0 0;
  font-size: ${t.h1Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 2px;
  border-top: 4px solid ${t.heading};
}

#wechat-content h2 {
  margin: 36px 0 16px;
  padding: 14px 0 0;
  font-size: ${t.h2Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 2px;
  border-top: 2px solid ${t.accent};
}

#wechat-content h3 {
  margin: 28px 0 12px;
  font-size: ${t.h3Size};
  color: ${t.accent};
  font-weight: 700;
  letter-spacing: 1px;
}

#wechat-content blockquote {
  margin: 20px 0;
  padding: 14px 18px;
  background-color: ${t.quoteBg};
  border-left: 3px solid ${t.accent};
}

#wechat-content blockquote p {
  color: ${t.quoteText};
  margin: 0;
}

#wechat-content th {
  background-color: ${t.heading};
  color: #f4efe4;
}

#wechat-content .link-list-title {
  letter-spacing: 2px;
  border-top: 2px solid ${t.accent};
  padding-top: 14px;
}
`;
}

export function compileWashiLayout(t) {
  return `
#wechat-content {
  letter-spacing: ${t.letterSpacing};
}

#wechat-content h1 {
  margin: 0 0 28px;
  padding: 0 0 18px;
  text-align: center;
  font-size: ${t.h1Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 6px;
}

#wechat-content h2 {
  margin: 36px 0 16px;
  padding: 0 0 0 12px;
  font-size: 17px;
  color: ${t.accent};
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 2px;
  border-left: 2px solid ${t.accent};
}

#wechat-content h3 {
  margin: 26px 0 12px;
  font-size: 15px;
  color: #5c6b7a;
  font-weight: 700;
  letter-spacing: 1px;
}

#wechat-content blockquote {
  margin: 20px 0;
  padding: 14px 16px;
  background-color: ${t.quoteBg};
  border-left: 2px solid #9aa8b8;
}

#wechat-content blockquote p {
  color: ${t.quoteText};
  margin: 0;
}

#wechat-content hr {
  border-top: 1px solid ${t.border};
  margin: 32px 24px;
}

#wechat-content .link-list-title {
  color: ${t.accent};
  letter-spacing: 2px;
}
`;
}

export function compileCinnabarLayout(t) {
  return `
#wechat-content h1 {
  margin: 0 0 24px;
  font-size: ${t.h1Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 3px;
}

#wechat-content h2 {
  margin: 36px 0 16px;
  padding: 6px 0 6px 14px;
  font-size: ${t.h2Size};
  color: ${t.heading};
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 1px;
  border-left: 10px solid ${t.accent};
}

#wechat-content h3 {
  margin: 28px 0 12px;
  font-size: ${t.h3Size};
  color: ${t.accent};
  font-weight: 700;
}

#wechat-content blockquote {
  margin: 24px 8px;
  padding: 14px 10px;
  background-color: ${t.quoteBg};
  border-top: 1px solid ${t.accent};
  border-bottom: 1px solid ${t.accent};
  border-left: none;
}

#wechat-content blockquote p {
  color: ${t.quoteText};
  text-align: center;
  margin: 0;
}

#wechat-content .task-done {
  color: ${t.accent};
}

#wechat-content .link-list-title {
  color: ${t.accent};
}
`;
}
