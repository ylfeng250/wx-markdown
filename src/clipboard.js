import { execFile } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function copyHtml(html) {
  if (process.platform === 'darwin') {
    await copyDarwin(html);
    return;
  }
  if (process.platform === 'win32') {
    await copyWindows(html);
    return;
  }
  await copyLinux(html);
}

async function copyDarwin(html) {
  const dir = mkdtempSync(join(tmpdir(), 'wx-md-'));
  const file = join(dir, 'clip.html');
  writeFileSync(file, html, 'utf8');

  const script = `
ObjC.import('AppKit');
const path = ${JSON.stringify(file)};
const html = $.NSString.stringWithContentsOfFileEncodingError(path, $.NSUTF8StringEncoding, null);
const data = html.dataUsingEncoding($.NSUTF8StringEncoding);
const pb = $.NSPasteboard.generalPasteboard;
pb.clearContents;
pb.setDataForType(data, $.NSPasteboardTypeHTML);
pb.setStringForType(html, $.NSPasteboardTypeString);
`;

  try {
    await execFileAsync('osascript', ['-l', 'JavaScript', '-e', script]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function copyWindows(html) {
  await execFileAsync(
    'powershell',
    ['-NoProfile', '-Command', 'Set-Clipboard -AsHtml -Value $input'],
    { input: html },
  );
}

async function copyLinux(html) {
  try {
    await execFileAsync('xclip', ['-selection', 'clipboard', '-t', 'text/html'], {
      input: html,
    });
    return;
  } catch {
    // try Wayland next
  }

  await execFileAsync('wl-copy', ['--type', 'text/html'], { input: html });
}
