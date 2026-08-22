import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const web = resolve(root, 'web');
const docs = resolve(root, 'docs');

mkdirSync(docs, { recursive: true });

await esbuild.build({
  absWorkingDir: root,
  entryPoints: [resolve(web, 'main.js')],
  outfile: resolve(docs, 'app.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  legalComments: 'none',
  logLevel: 'info',
});

cpSync(resolve(web, 'index.html'), resolve(docs, 'index.html'));
cpSync(resolve(web, 'app.css'), resolve(docs, 'app.css'));
cpSync(resolve(web, 'favicon.svg'), resolve(docs, 'favicon.svg'));
writeFileSync(resolve(docs, '.nojekyll'), '');
