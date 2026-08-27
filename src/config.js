import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const ENV_KEYS = {
  appid: 'WECHAT_APPID',
  secret: 'WECHAT_SECRET',
  author: 'WECHAT_AUTHOR',
};

export function configSearchPaths(cwd = process.cwd(), home = homedir()) {
  return [
    resolve(cwd, 'wx-markdown.json'),
    resolve(home, '.config/wx-markdown/config.json'),
  ];
}

function pick(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}

export function loadConfig({
  cwd = process.cwd(),
  home = homedir(),
  env = process.env,
  overrides = {},
} = {}) {
  let file = {};
  let source = null;

  for (const filePath of configSearchPaths(cwd, home)) {
    if (!existsSync(filePath)) continue;
    try {
      file = JSON.parse(readFileSync(filePath, 'utf8')) || {};
    } catch {
      throw new Error(`配置文件无法解析：${filePath}`);
    }
    source = filePath;
    break;
  }

  const wechatFile = file.wechat && typeof file.wechat === 'object' ? file.wechat : {};
  return {
    source,
    wechat: {
      appid: pick(overrides.appid, env[ENV_KEYS.appid], wechatFile.appid),
      secret: pick(overrides.secret, env[ENV_KEYS.secret], wechatFile.secret),
      author: pick(overrides.author, env[ENV_KEYS.author], wechatFile.author),
    },
  };
}

export function isWechatConfigured(config) {
  return Boolean(config?.wechat?.appid && config?.wechat?.secret);
}

export function missingCredentialHint() {
  return [
    '缺少公众号凭据。',
    '请设置 WECHAT_APPID / WECHAT_SECRET，',
    '或在 wx-markdown.json、~/.config/wx-markdown/config.json 里写 wechat.appid 和 wechat.secret。',
  ].join('');
}
