import { spawn } from 'node:child_process';

export function openFile(filePath) {
  const platform = process.platform;
  const command =
    platform === 'darwin'
      ? ['open', [filePath]]
      : platform === 'win32'
        ? ['cmd', ['/c', 'start', '', filePath]]
        : ['xdg-open', [filePath]];

  const child = spawn(command[0], command[1], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}
