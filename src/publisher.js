const API_TIMEOUT = 30_000;

export function buildDraftBody({
  title,
  html,
  digest,
  thumbMediaId,
  author,
}) {
  if (!thumbMediaId) {
    throw new Error('推送草稿箱需要封面图');
  }

  return {
    articles: [
      {
        title,
        author: author || '',
        digest: digest || '',
        content: html,
        show_cover_pic: 0,
        thumb_media_id: thumbMediaId,
      },
    ],
  };
}

export function encodeDraftBody(body) {
  return JSON.stringify(body);
}

export async function createDraft(accessToken, article, { fetchImpl = fetch } = {}) {
  const body = buildDraftBody(article);
  const url = new URL('https://api.weixin.qq.com/cgi-bin/draft/add');
  url.searchParams.set('access_token', accessToken);

  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: encodeDraftBody(body),
    signal: AbortSignal.timeout(API_TIMEOUT),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`微信创建草稿返回无法解析：${text.slice(0, 200)}`);
  }

  const errcode = data.errcode ?? 0;
  if (errcode !== 0) {
    throw new Error(`微信创建草稿失败：errcode=${errcode}, errmsg=${data.errmsg || 'unknown error'}`);
  }
  if (!data.media_id) {
    throw new Error('微信创建草稿失败：响应里没有 media_id');
  }

  return { mediaId: data.media_id };
}
